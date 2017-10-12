import { cwx, CPage } from '../../cwx/cwx.js';

CPage({
  pageId: '10320613378',
  data:{
    //公用

    //列表页
    soaurl: "/restapi/soa2/10820/GetCommonPassenger.json",
    totalPages: 0,  //总页数
    totalCount: 0,  //总记录数
    nowPage: 0,     //当前页号
    pageSize: 25,   //分页查询接口时每页数量
    checkfunc: null,  //勾选时校验回调方法
    needselectcnt : 0,  //需要选回去的常旅个数(0时随意)
    selectCntNow :0,     //当前页面选中的常旅个数
    selectedPassengerIds :[],    //前页面传入需选中的常旅passengerid
    selectedOkPassengerIds :[],    //实际自动选中的常旅passengerid
    autoSelectOver:false,           //自动选中完毕
    passengers:[],     //常旅对象列表
    okButtonStatus:0,  //完成按钮状态0:暗，1:亮

    //编辑页
    editPageHidden :true,  //编辑层显示
    editPageTitle :"",  //编辑层标题
    topWarnTipHidden:true,  //顶部多错误提示条
    soaSaveUrl : '/restapi/soa2/10820/SaveCommonPassenger.json',
    oPassenger : {PassengerID : 0},  //当前页面常旅对象
    cardTypeList : [{ 'id': 1, 'name': '身份证' }, { 'id': 2, 'name': '护照' }, { 'id': 8, 'name': '台胞证' }, { 'id': 7, 'name': '回乡证' },
                { 'id': 4, 'name': '军人证' }, { 'id': 10, 'name': '港澳通行证' }, { 'id': 22, 'name': '台湾通行证' }],
    cardTypeSelectorHidden : true,  //证件选择列表显示,
    cardTypeHidden:false,
    cardNoHidden:false,
    cardLimitHidden:false,
    allCountry :[],
    allCountryCode :[],
    allCountryName :[],
    allCountryIndex : 0,
    allCountrySoaUrl : '/restapi/soa2/11376/GetCountryForH5.json',
    guideHidden : true,  //证件选择列表显示
    isEdit : '0',
    //0:中文，1：last，2：first middle，3：证件类型，4：证件号，5：证件有效期，6：国籍，7：性别，8：出生日期，9:成人/儿童
    isWrongList : [],
    wrongMsgList : [],
  },
  onLoad:function(options){
    this.data.checkfunc = options.data.filterFunc;
    this.data.needselectcnt = options.data.maxCount || 0;
    this.data.selectedPassengerIds = options.data.choosedPassengers || [];

  },
  onReady:function(){
    // 页面渲染完成
    this.setData({ nowPage: (this.data.nowPage + 1)});
    this.getDataFromSoa();
  },
  onShow:function(){

  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  //向下滚动加载
  moreDetail:function(){
    if (this.data.nowPage - this.data.totalPages < 0 && this.data.totalPages - 1 > 0) {
      this.setData({ nowPage: (this.data.nowPage + 1)});
      this.getDataFromSoa();
    }else{
      this.showToast("已显示全部。");
    }
  },
  //生成调接口参数
  MakeSoaParam:function(pid,index){
    var Parameters = [];
    var ParameterItem;
    ParameterItem = { "Key": "BizType", "Value": "BASE" };
    Parameters.push(ParameterItem);
    ParameterItem = { "Key": "BookingType", "Value": "N" };
    Parameters.push(ParameterItem);
    ParameterItem = { "Key": "InputType", "Value": "U" };
    Parameters.push(ParameterItem);
    var QueryConditions = [];
    var QueryCondition;
    var pindex = index || this.data.nowPage
    QueryCondition = { "Key": "PageIndex", "Value": pindex };
    QueryConditions.push(QueryCondition)
    QueryCondition = { "Key": "PageSize", "Value": this.data.pageSize };
    QueryConditions.push(QueryCondition)
    QueryCondition = { "Key": "OrderType", "Value": "D" };
    QueryConditions.push(QueryCondition)
    if (!!pid){
      QueryCondition = { "Key": "CommonPassengerID", "Value": pid };
      QueryConditions.push(QueryCondition)
    }
    var paramsoa = {"Parameters" : Parameters, "QueryConditions":QueryConditions};
    return paramsoa;
  },
  //调接口取数
  getDataFromSoa: function(){
    var param = this.MakeSoaParam();
    var that = this;
    //LOADING ON
    that.showLoading();
    cwx.request({
      url: that.data.soaurl,
      data: param,
      success: function(res) {
        var data = res.data;
        if (data.ResponseStatus.Ack == "Success" && data.Result.Result == "0"){
          that.formatViewData(data.CommonPassengers);
          //设定页号
          that.setData({ totalPages: Math.ceil(data.PassengerCount / that.data.pageSize)});
          that.setData({ totalCount: data.PassengerCount});

          //自动找到该记录并打勾
          if (that.data.selectedPassengerIds.length > 0){
            that.data.selectedPassengerIds.forEach(function(item){
              if (that.data.selectedOkPassengerIds.filter(s => s == item).length == 0){
                //不在已完成的
                var p = that.data.passengers.filter(o => o.PassengerID == item);
                if (p.length > 0){
                  var oP = p[0];
                  oP.view.isselected = 1;   //打勾
                  that.setData({ passengers: that.data.passengers});
                  that.data.selectCntNow = that.data.selectCntNow +1;   //打勾总数+1（用于完成按钮显示）
                  that.setData({ selectCntNow: that.data.selectCntNow });
                  that.data.selectedOkPassengerIds.push(item);    //放到已标数组
                  that.setData({ selectedOkPassengerIds: that.data.selectedOkPassengerIds});
                }
              }
            });
          }
          if(!that.data.autoSelectOver && that.data.selectedPassengerIds.length > that.data.selectedOkPassengerIds.length && that.data.totalPages - that.data.nowPage > 0 ){
            that.setData({ nowPage: (that.data.nowPage + 1)});
            that.getDataFromSoa();
          }else{
            that.setData({ autoSelectOver: true});  //查询并自动勾选完成
            that.setFinishButton(); //完成按钮状态
            //LOADING OFF
            that.hideLoading();
          }

        }else{
          //LOADING OFF
          that.hideLoading();
          that.modalRetryShow("查询失败。");
        }
      },
      fail:function(data){
        //LOADING OFF
        that.hideLoading();
        that.modalRetryShow("查询失败。");
      }
    })
  },
  //格式化
  formatViewData: function(passengerlist){
    var that = this;
    var passengerstemp = this.data.passengers;
    if(!!passengerlist){
      passengerlist.forEach(function(item){
        item.UID=null;
        //初始化页面查看用属性(两行证件)
        //isselected：是否选中;cardshow：显示证件;warnmsg: 信息不全提醒;
        var view = { isselected : 0, cardshow:[], mobilephone:"", cantselect:0 };
        var card1 = "";  //身份证
        var card2 = "";  //护照
        var cardOther = [];
        var cardAll = [];
        var cardText = "";
        if (!!item.CommonPassengerCard && item.CommonPassengerCard.length > 0){
          for(var j=0;j<item.CommonPassengerCard.length;j++){
              if (item.CommonPassengerCard[j] && item.CommonPassengerCard[j].CardType=="1"){
                  card1 = "身份证 "+ MaskIDNumber(item.CommonPassengerCard[j].CardNo);
              }else if (item.CommonPassengerCard[j] && item.CommonPassengerCard[j].CardType=="2"){
                  card2 = "护照 "+ MaskIDNumber(item.CommonPassengerCard[j].CardNo);
              }else{
                  switch (+item.CommonPassengerCard[j].CardType) {
                      case 0 : cardText = "未知证件";break;
                      case 1 : cardText = "身份证";break;case 2 : cardText = "护照";break;case 3 : cardText = "学生证";break;case 4 : cardText = "军人证";break;
                      case 6 : cardText = "驾驶证";break;case 7 : cardText = "回乡证";break;case 8 : cardText = "台胞证";break;case 10 : cardText = "港澳通行证";break;
                      case 11 : cardText = "国际海员证";break;case 20 : cardText = "外国人永久居留证";break;case 21 : cardText = "旅行证";break;
                      case 22 : cardText = "台湾通行证";break;case 23 : cardText = "士兵证";break;case 24 : cardText = "临时身份证";break;
                      case 25 : cardText = "户口簿";break;case 26 : cardText = "警官证";break;case 27 : cardText = "出生证明";break;case 99 : cardText = "其他";break;
                      default : break;
                  }
                  cardText = cardText + " " + MaskIDNumber(item.CommonPassengerCard[j].CardNo);
                  cardOther.push(cardText);
              }
          }
          if (card1 != ""){cardAll.push(card1);}
          if (card2 != ""){cardAll.push(card2);}
          for(var k=0;k<cardOther.length;k++){
              if (cardAll.length >=2){
                  break;
              }
              cardAll.push(cardOther[k]);
          }

        }
        view.cardshow = cardAll;
        //手机号码
        if (item.MobilePhone != ""){
          view.mobilephone = MaskMobile(item.MobilePhone);
        }
        item.view = view;

        passengerstemp.push(item);
        that.setData({ passengers: passengerstemp});
      })

    }
  },
  //选择明细
  selectDetail: function(e){
    //var pid = e.currentTarget.dataset.pid;
    //var oPassenger = this.data.passengers.filter( s => s.PassengerID == pid )[0];
    var index = e.currentTarget.dataset.idx;
    var oPassenger = this.data.passengers[index];
    //是否已经回归验证过不能选
    if (oPassenger.view.isselected == 1){
      //取消选择
      oPassenger.view.isselected = 0;
      this.setData({ passengers: this.data.passengers});
      this.data.selectCntNow = this.data.selectCntNow -1;
      this.setData({ selectCntNow: this.data.selectCntNow });
    }else{
      //判断是否可以再选
      if ((this.data.needselectcnt > 0) && (this.data.selectCntNow >= this.data.needselectcnt)){
        this.modalWarnShow("已达到需要选择的旅客数量，不可再选。");
        return;
      }
      if (oPassenger.view.cantselect == 1){
        this.modalWarnShow("此旅客信息不符合订单要求！");
        return;
      }
      //回调校验明细
      if (this.data.checkfunc && this.data.checkfunc(oPassenger) != true){
        this.modalWarnShow("此旅客信息不符合订单要求！");
        oPassenger.view.cantselect = 1;
        this.setData({ passengers: this.data.passengers});
        return;
      }

      oPassenger.view.isselected = 1;
      this.setData({ passengers: this.data.passengers});
      this.data.selectCntNow = this.data.selectCntNow +1;
      this.setData({ selectCntNow: this.data.selectCntNow });
    }
    this.setFinishButton(); //完成按钮状态
    
  },
  //完成按钮状态
  setFinishButton:function(){
    if ( (this.data.needselectcnt > 0 && this.data.needselectcnt >= this.data.selectCntNow && this.data.selectCntNow > 0 )
      || (this.data.needselectcnt == 0 && this.data.selectCntNow > 0) ){
      this.setData({ okButtonStatus: 1 });
    }else{
      this.setData({ okButtonStatus: 0 });
    }
  },
  //完成按钮
  finishClick:function(){
    var that = this;
    var retPassengers = this.data.passengers.filter(o => o.view.isselected == 1);
    this.invokeCallback( retPassengers );
    setTimeout(function(){
      that.navigateBack();
    },100)
  },
  //新建常旅
  addPassenger:function(){
    this.showEditPage();
  },
  //从编辑页完成时回调
  backFromEdit:function(){
    //重置分页参数
    var selPassengers = this.data.passengers.filter(o => o.view.isselected == 1);
    var selPids;
    if (!!selPassengers && selPassengers.length > 0){
      this.setData({ selectCntNow :0 });
      selPids = selPassengers.map(o=>o.PassengerID);
      this.setData({ selectedPassengerIds :selPids });
      this.setData({ selectedOkPassengerIds :[] });
      this.setData({ autoSelectOver :false });
    }
    //重新刷新列表并保持选中
    this.setData({ passengers :[] });
    this.setData({ nowPage: 1 });
    this.getDataFromSoa();

  },
  //修改常旅
  editPassegner:function(e){
    var that = this;
    var param = this.MakeSoaParam(e.currentTarget.dataset.pid,1);
    cwx.request({
      url: that.data.soaurl,
      data: param,
      success: function(res) {
        var datasoa = res.data;
        if (datasoa.Result.Result == "0" && datasoa.ResponseStatus.Ack == "Success" && !!datasoa.CommonPassengers && datasoa.CommonPassengers.length == 1){
          that.setData({ oPassenger: datasoa.CommonPassengers[0] });
          that.showEditPage();
        }else{
          that.modalWarnShow('数据加载失败，请重试!');
        }
      },
      fail:function(res){
        that.modalWarnShow('数据加载失败，请重试!');
      },
    });
  },

  //************************************************************
  //*************************编辑页*****************************
  //************************************************************
  showEditPage:function(e){
    this.resetItemStat(); //重置项目红色状态
    if (!!this.data.oPassenger && !!this.data.oPassenger.PassengerID && this.data.oPassenger.PassengerID != 0){
      //编辑
      //设定证件
      this.data.oPassenger.viewCardType = "1";
      this.data.oPassenger.viewCardTypeCN = "身份证";
      this.data.oPassenger.viewCardNo = "0";
      this.data.oPassenger.viewCardTimelimit = "";
      var c;
      if (!!this.data.oPassenger.CommonPassengerCard && this.data.oPassenger.CommonPassengerCard.length > 0){
        if (this.data.oPassenger.CommonPassengerCard.filter(o => o.CardType == '1').length > 0){
          //有身份证
          c = this.data.oPassenger.CommonPassengerCard.filter(o => o.CardType == '1')[0];
        }else if (this.data.oPassenger.CommonPassengerCard.filter(o => o.CardType == '2').length > 0){
          //有护照
          c = this.data.oPassenger.CommonPassengerCard.filter(o => o.CardType == '2')[0];
        }else {
          c = this.data.oPassenger.CommonPassengerCard[0];
        }
      }else{
        c = { CardNo: "", CardTimelimit: "", CardType: "1"};
        this.data.oPassenger.CommonPassengerCard = [c];
      }
      this.data.oPassenger.viewCardType = c.CardType;
      this.data.oPassenger.viewCardTypeCN = this.GetCardTypeNm(c.CardType);
      this.data.oPassenger.viewCardNo = c.CardNo;
      this.data.oPassenger.viewCardTimelimit = this.FormatDate(c.CardTimelimit);
      this.data.oPassenger.Birthday = this.FormatDate(this.data.oPassenger.Birthday);
      this.data.oPassenger.viewNationality = "";

      this.setData({ oPassenger: this.data.oPassenger});
      this.setData({ editPageTitle:'编辑旅客'});
      this.setData({ isEdit: '1'});
      
    }else{
      //新增
      var op = {
          CNName: "",ENFirstName: "", ENLastName: "", ENMiddleName: "",
          CommonPassengerCard: [{ CardNo: "", CardTimelimit: "", CardType: "1"}],
          CommonPassengerFFP: [],
          Gender: "", Nationality: "CN",Birthday: "",PassengerType: "A",
          PassengerID: 0, viewCardType :"1", viewCardTypeCN :"身份证" ,viewCardNo :"",viewCardTimelimit:"",viewNationality:""
      };
      this.setData({ oPassenger: op});
      this.setData({ editPageTitle:'新增旅客'});
      this.setData({ isEdit: '0'});
    }
    //是否显示证件
    if (this.data.oPassenger.PassengerType == "C"){
      this.isHideCard(true);
    }else{
      this.isHideCard(false);
    }
    //显示编辑层
    this.setData({ editPageHidden: false});
    //取国籍信息
    this.getCountryData();
  },
  closeEditPage:function(e){
    this.setData({ oPassenger: {PassengerID : 0} });
    this.setData({ editPageHidden: true });
  },
//中文名改变
  cnnameChange:function(e){
    this.data.oPassenger.CNName = e.detail.value;
    this.setData({ oPassenger: this.data.oPassenger});
  },
  //英文last改变
  enlastnameChange:function(e){
    this.data.oPassenger.ENLastName = e.detail.value;
    this.setData({ oPassenger: this.data.oPassenger});
  },
  //英文first/middle改变
  enfirstnameChange:function(e){
    var name = e.detail.value;
    if (name.indexOf(' ') >= 0){
      this.data.oPassenger.ENFirstName = name.substr(0,name.indexOf(' '));
      this.data.oPassenger.ENMiddleName = name.substr(name.indexOf(' ')+1);
    }else{
      this.data.oPassenger.ENFirstName = name;
      this.data.oPassenger.ENMiddleName = "";
    }
    this.setData({ oPassenger: this.data.oPassenger});
  },
  //显示证件类型选择列表
  changeCard:function(e){
    this.setData({ cardTypeSelectorHidden: false});
  },
  //点击灰色区域，不切换证件
  notSelectedCard:function(e){
    this.setData({ cardTypeSelectorHidden: true});
  },
  //切换证件类型(显示浮层)
  selectedCard:function(e){
    var selected = this.data.oPassenger.CommonPassengerCard.filter(o => o.CardType == e.currentTarget.dataset.id);
    var selcard;
    if (!!selected && selected.length > 0){
      selcard = selected[0];
    }else{
      selcard = { CardNo: "", CardTimelimit: "", CardType: e.currentTarget.dataset.id };
      this.data.oPassenger.CommonPassengerCard.push(selcard);
    }
    this.data.oPassenger.viewCardType = selcard.CardType;
    this.data.oPassenger.viewCardTypeCN = this.GetCardTypeNm(selcard.CardType);
    this.data.oPassenger.viewCardNo = selcard.CardNo;
    this.data.oPassenger.viewCardTimelimit = this.FormatDate(selcard.CardTimelimit);
    this.setData({ oPassenger: this.data.oPassenger});

    this.setData({ cardTypeSelectorHidden: true});  //隐藏选择列表
  },
  //证件号改变
  changeCardNo:function(e){
    var selected = this.data.oPassenger.CommonPassengerCard.filter(o => o.CardType == e.currentTarget.dataset.cardid);
    var no = e.detail.value;
    if (e.currentTarget.dataset.cardid == 1){
      no = no.toUpperCase();
    }
    selected.CardNo = no;
    this.data.oPassenger.viewCardNo = selected.CardNo;
    this.setData({ oPassenger: this.data.oPassenger});
  },
  //证件有效期改变
  cardTimelimitChange:function(e){
    var selected = this.data.oPassenger.CommonPassengerCard.filter(o => o.CardType == this.data.oPassenger.viewCardType);
    selected.CardTimelimit = this.FormatDate(e.detail.value);
    this.data.oPassenger.viewCardTimelimit = selected.CardTimelimit;
    this.setData({ oPassenger: this.data.oPassenger});
  },
  //国藉改变
  nationChange:function(e){
    if (e.detail.value > -1){
      this.data.oPassenger.Nationality = this.data.allCountryCode[e.detail.value];
      this.data.oPassenger.viewNationality = this.data.allCountryName[e.detail.value];
      this.setData({ oPassenger: this.data.oPassenger});
      this.setData({ allCountryIndex: e.detail.value});
    }
  },
  //设定性别男
  genderMale:function(e){
    this.data.oPassenger.Gender = 'M';
    this.setData({ oPassenger: this.data.oPassenger});
  },
  //设定性别女
  genderFemale:function(e){
    this.data.oPassenger.Gender = 'F';
    this.setData({ oPassenger: this.data.oPassenger});
  },
  //设定成人
  typeAdult:function(e){
    this.data.oPassenger.PassengerType = 'A';
    this.setData({ oPassenger: this.data.oPassenger});
    //显示证件
    this.isHideCard(false);
  },
  //设定儿童
  typeChild:function(e){
    this.data.oPassenger.PassengerType = 'C';
    this.setData({ oPassenger: this.data.oPassenger});
    //隐藏证件
    this.isHideCard(true);
  },
  //隐藏证件
  isHideCard:function(ishide){
    this.setData({ cardTypeHidden: ishide});
    this.setData({ cardNoHidden: ishide});
    this.setData({ cardLimitHidden: ishide});
  },
  //生日改变
  birthdayChange:function(e){
    this.data.oPassenger.Birthday = this.FormatDate(e.detail.value);
    this.setData({ oPassenger: this.data.oPassenger});
  },
  //完成按钮
  finishEdit:function(e){
    //校验逻辑
    if (!this.checkInputData()){
      return;
    }
    //保存SOA
    this.saveAction();
  },
  //校验输入
  checkInputData:function(e){
    var that = this;
    var ret = true;
    //重置所有出错
    for(var i = 0;i < this.data.isWrongList.length;i++){
      this.data.isWrongList[i].iswrong = 0;
      this.data.wrongMsgList[i].msg = '';
    }
    this.setData({ isWrongList: this.data.isWrongList});
    this.setData({ wrongMsgList: this.data.wrongMsgList});

    var rez = /^[\u4e00-\u9fa5]+$/; //纯中文
    var rey = /^[a-zA-Z]+$/;  //纯英文
    var re = /^[\u4e00-\u9fa5a-zA-Z]+$/;  //中英文
    //中文名
    //替换IOS输入法产生的奇怪字符
    this.data.oPassenger.CNName = this.data.oPassenger.CNName.replace(new RegExp(unescape('%u2006'), 'gm'), ''); //替换IOS输入法产生的奇怪字符
    while(true){
      //至少2个字符
      if (this.data.oPassenger.CNName != ""){
        if (this.data.oPassenger.CNName.length <= 1){
          this.data.isWrongList[0].iswrong = 1;
          this.data.wrongMsgList[0].msg = '中文名请与证件姓名一致。';
          break;
        }
        if (this.data.oPassenger.CNName.length > 0){
          //第一个字必为中文
          if (!rez.test(this.data.oPassenger.CNName[0])){
            this.data.isWrongList[0].iswrong = 1;
            this.data.wrongMsgList[0].msg = '请填写正确的中文姓名，第一个汉字不可用拼音代替。';
            break;
          }
          //不能含有特殊字符
          if (!re.test(this.data.oPassenger.CNName)){
            this.data.isWrongList[0].iswrong = 1;
            this.data.wrongMsgList[0].msg = '姓名中的特殊符号无需输入。如：“汉祖然•买买提”填写为：汉祖然买买提';
            break;
          }
          //拼音后不可继续输入汉字
          var firstLetter = -1;
          for(var i = 0; i < this.data.oPassenger.CNName.length; i++){
            if (!rez.test(this.data.oPassenger.CNName[i])){
              firstLetter = i;
              break;
            }
          }
          if (firstLetter >= 0 && rez.test(this.data.oPassenger.CNName.substr(firstLetter))){
            this.data.isWrongList[0].iswrong = 1;
            this.data.wrongMsgList[0].msg = '拼音后不可继续输入汉字，汉字请用拼音代替。';
            break;
          }
        }
      }else if (this.data.oPassenger.ENLastName == "" && this.data.oPassenger.ENFirstName == ""){
        this.data.isWrongList[0].iswrong = 1;
        this.data.isWrongList[1].iswrong = 1;
        this.data.isWrongList[2].iswrong = 1;
        this.data.wrongMsgList[0].msg = '请输入旅客姓名。';
        break;
      }
      
      break;
    }
    //英文last
    //替换IOS输入法产生的奇怪字符
    this.data.oPassenger.ENLastName = this.data.oPassenger.ENLastName.replace(new RegExp(unescape('%u2006'), 'gm'), ''); //替换IOS输入法产生的奇怪字符
    //替换所有空格
    this.data.oPassenger.ENLastName = this.data.oPassenger.ENLastName.replace(/\s/g, '');    // 替换所有空格
    while(true){
      //英文姓名中无特殊符号
      if ((this.data.oPassenger.ENLastName != "" && !rey.test(this.data.oPassenger.ENLastName)) 
        || (this.data.oPassenger.ENLastName == "" && this.data.oPassenger.ENFirstName != "")){
        this.data.isWrongList[1].iswrong = 1;
        this.data.wrongMsgList[1].msg = '英文姓名中无特殊符号，姓中特殊符号不输入，名中用空格代替。';
        break;
      }
      break;
    }

    //英文first/middle
    //替换IOS输入法产生的奇怪字符
    this.data.oPassenger.ENFirstName = this.data.oPassenger.ENFirstName.replace(new RegExp(unescape('%u2006'), 'gm'), ''); //替换IOS输入法产生的奇怪字符
    this.data.oPassenger.ENMiddleName = this.data.oPassenger.ENMiddleName.replace(new RegExp(unescape('%u2006'), 'gm'), ''); //替换IOS输入法产生的奇怪字符
    //连续的空格仅仅保留一个
    this.data.oPassenger.ENFirstName = this.data.oPassenger.ENFirstName.replace(/\s+/g, ' ');
    this.data.oPassenger.ENMiddleName = this.data.oPassenger.ENMiddleName.replace(/\s+/g, ' ');
    while(true){
      if (this.data.oPassenger.ENFirstName != ""){
        //英文姓名中无特殊符号
        if (!rey.test(this.data.oPassenger.ENFirstName + this.data.oPassenger.ENMiddleName)){
          this.data.isWrongList[2].iswrong = 1;
          this.data.wrongMsgList[2].msg = '英文姓名中无特殊符号，姓中特殊符号不输入，名中用空格代替。';
          break;
        }
        //姓和名相加的字符长度不能大于26
        if ((this.data.oPassenger.ENLastName.length + this.data.oPassenger.ENFirstName.length + this.data.oPassenger.ENMiddleName.length) > 26){
          this.data.isWrongList[2].iswrong = 1;
          this.data.wrongMsgList[2].msg = '英文姓和名总长度不能超过26个字符，若过长请使用缩写。姓中特殊符号不输入，名中用空格代替。如 Alejandro Gomez Monteverde缩写为：英文姓: MONTEVERDE 英文名: A G';
          break;
        }
      }else if (this.data.oPassenger.ENLastName != ""){
        this.data.isWrongList[2].iswrong = 1;
        this.data.wrongMsgList[2].msg = '英文姓名中无特殊符号，姓中特殊符号不输入，名中用空格代替。';
        break;
      }
      break;
    }
    //旅客类型
    while(true){
      if (this.data.oPassenger.PassengerType != 'A' && this.data.oPassenger.PassengerType != 'C'){
        this.data.isWrongList[9].iswrong = 1;
        this.data.wrongMsgList[9].msg = '请选择旅客类型';
        break;
      }
      break;
    }

    //证件号
    while(true){
      if (this.data.oPassenger.PassengerType == 'C'){
        break;
      }
      if (this.data.oPassenger.viewCardType == '1' || this.data.oPassenger.viewCardType == '25'){
        if (!IdentityCodeValid(this.data.oPassenger.viewCardNo)){
          this.data.isWrongList[4].iswrong = 1;
          if (this.data.oPassenger.viewCardType == '1'){
            this.data.wrongMsgList[4].msg = '请输入正确的身份证号';
          }else{
            this.data.wrongMsgList[4].msg = '请输入正确的户口薄号';
          }
          break;
        }
      }else{
        if (this.data.oPassenger.viewCardNo == '' || !/^[ a-zA-Z0-9]+$/.test(this.data.oPassenger.viewCardNo)){
          this.data.isWrongList[4].iswrong = 1;
          this.data.wrongMsgList[4].msg = '请输入正确的证件号';
          break;
        }
      }
      break;
    }

    //证件有效期
    while(true){


      break;
    }

    //国籍
    while(true){
      //if(this.data.oPassenger.Nationality == ''){
      //  this.data.isWrongList[6].iswrong = 1;
      //  this.data.wrongMsgList[6].msg = '请选择国籍';
      //  break;
      //}
      break;
    }

    //性别
    while(true){
      //if (this.data.oPassenger.Gender != 'M' && this.data.oPassenger.Gender != 'F'){
      //  this.data.isWrongList[7].iswrong = 1;
      //  this.data.wrongMsgList[7].msg = '请选择性别';
      //  break;
      //}
      break;
    }

    //出生日期
    while(true){
      if (this.data.oPassenger.Birthday.length != 10){
        this.data.isWrongList[8].iswrong = 1;
        this.data.wrongMsgList[8].msg = '请输入正确的出生日期';
        break;
      }
      break;
    }

    //显示出错样式
    var wrongCnt = this.data.wrongMsgList.filter(o=>o.msg != '');
    if (wrongCnt.length > 0){
      ret = false;
      if (wrongCnt.length == 1){
        //只有一种错时弹出确认框
        this.modalWarnShow(wrongCnt[0].msg);
      }else{
        //多于一个错显示上方提示条
        this.setData({ topWarnTipHidden: false});
        setTimeout(function(){
          that.setData({ topWarnTipHidden: true});
        },3000);
      }
    }        
    
    this.setData({ isWrongList: this.data.isWrongList});
    this.setData({ wrongMsgList: this.data.wrongMsgList});
    this.setData({ oPassenger: this.data.oPassenger});

    return ret;
  },
  //重置出错项目样式
  resetItemStat:function(){
    this.data.isWrongList = [{'iswrong': 0},{'iswrong': 0},{'iswrong': 0},{'iswrong': 0},{'iswrong': 0},{'iswrong': 0},{'iswrong': 0},{'iswrong': 0},{'iswrong': 0},{'iswrong': 0}],
    this.data.wrongMsgList = [{'msg': ''},{'msg': ''},{'msg': ''},{'msg': ''},{'msg': ''},{'msg': ''},{'msg': ''},{'msg': ''},{'msg': ''},{'msg': ''}],
    this.setData({ isWrongList: this.data.isWrongList });
    this.setData({ wrongMsgList: this.data.wrongMsgList });
  },
  //保存
  saveAction:function(){
    var that = this;
    var Parameters = [];
    var ParameterItem;
    ParameterItem = { "Key": "BizType", "Value": "BASECWX" };
    Parameters.push(ParameterItem);
    ParameterItem = { "Key": "BookingType", "Value": "N" };
    Parameters.push(ParameterItem);
    ParameterItem = { "Key": "InputType", "Value": "U" };
    Parameters.push(ParameterItem);
    ParameterItem = { "Key": "EditType", "Value": this.data.isEdit };
    Parameters.push(ParameterItem);
    var cardObj = [];
    if (this.data.oPassenger.PassengerType != 'C'){
      cardObj = [{
        CardType: this.data.oPassenger.viewCardType ,CardNo: this.data.oPassenger.viewCardNo, CardTimelimit: this.data.oPassenger.viewCardTimelimit
      }]
    }
    var CommonPassenger = {
      "PassengerID": this.data.oPassenger.PassengerID,
      "PassengerType": this.data.oPassenger.PassengerType,
      "CNName": ((this.data.oPassenger.CNName == "" && this.data.isEdit == "1") ? "Delete_Flag" : this.data.oPassenger.CNName),    // 6.11 修改
      "ENLastName": ((this.data.oPassenger.ENLastName == "" && this.data.isEdit == "1") ? "Delete_Flag" : this.data.oPassenger.ENLastName),
      "ENFirstName": ((this.data.oPassenger.ENFirstName == "" && this.data.isEdit == "1") ? "Delete_Flag" : this.data.oPassenger.ENFirstName),
      "ENMiddleName": ((this.data.oPassenger.ENMiddleName == "" && this.data.isEdit == "1") ? "Delete_Flag" : this.data.oPassenger.ENMiddleName),
      "CommonPassengerCard": cardObj,
      "Birthday": this.data.oPassenger.Birthday,
      "Gender": this.data.oPassenger.Gender,
      "Nationality": this.data.oPassenger.Nationality
    }
    var paramsoa = {"Parameters" : Parameters, "CommonPassenger":CommonPassenger};
    //LOADING ON
    that.showLoading();
    cwx.request({
      url: that.data.soaSaveUrl,
      data: paramsoa,
      success: function(res) {
        //LOADING OFF
        that.hideLoading();
        var data = res.data;
        if (data.ResponseStatus.Ack == "Success" && data.Result.Result == "0"){
          setTimeout(function(){
            that.showToast('保存成功');
            setTimeout(that.toastSuccessChange,1500);
          },500);
        }else{
          that.modalWarnShow('保存失败，请重试。');
        }
      },
      fail:function(data){
        //LOADING OFF
        that.hideLoading();
        that.modalWarnShow('保存失败，请重试。');
      }
    })
  },
  //返回列表
  toastSuccessChange:function(){
    var that = this;
    
    this.setData({ oPassenger: {PassengerID : 0} });
    this.setData({ editPageHidden: true });

    this.backFromEdit();
  },
  //从SOA获取国籍信息
  getCountryData:function(){
    var that = this;
    if (!!that.data.allCountry && that.data.allCountry.length > 0){
      //已有所有国籍数据
      //根据国籍代码取中文
      that.data.oPassenger.viewNationality = that.getCountryNm(that.data.oPassenger.Nationality);
      that.setData({ oPassenger: that.data.oPassenger});
      //为国籍滚筒设定初选项
      that.data.allCountryIndex = that.data.allCountryName.indexOf(that.data.oPassenger.viewNationality);
      if (that.data.allCountryIndex < 0) {that.data.allCountryIndex = 0};
      that.setData({ allCountryIndex: that.data.allCountryIndex});
    }else{
      //从服务调取所有国籍数据
      var soadata = {};
      cwx.request({
        url: that.data.allCountrySoaUrl,
        data: soadata,
        success: function(res) {
          var data = res.data;
          if (data.ResultCode == "Success" && data.ResponseStatus.Ack == "Success"){
            that.data.allCountry = data.CountryInfoListHot;
            that.data.allCountry = that.data.allCountry.concat(data.CountryInfoListByFirstLetter);
            that.setData({ allCountry: that.data.allCountry});
            that.data.allCountryCode = that.data.allCountry.map(o=>o.scode);
            that.setData({ allCountryCode: that.data.allCountryCode});
            that.data.allCountryName = that.data.allCountry.map(o=>o.name);
            that.setData({ allCountryName: that.data.allCountryName});
            //根据国籍代码取中文
            that.data.oPassenger.viewNationality = that.getCountryNm(that.data.oPassenger.Nationality);
            that.setData({ oPassenger: that.data.oPassenger});
            //为国籍滚筒设定初选项
            that.data.allCountryIndex = that.data.allCountryName.indexOf(that.data.oPassenger.viewNationality);
            if (that.data.allCountryIndex < 0) {that.data.allCountryIndex = 0};
            that.setData({ allCountryIndex: that.data.allCountryIndex});
          }
        },
        fail:function(data){
        },
      })
    }
    
  },
  //国籍码转中文
  getCountryNm:function(countryCd){
    var country = this.data.allCountry.filter(o => o.scode == countryCd);
    if (country.length > 0){
      return country[0].name;
    }
    return "";
  },

  //根据证件类型获得证件号
  GetCardTypeNm:function(cardtype){
    var cardText;
    switch (+cardtype) {
        case 0 : cardText = "未知证件";break;
        case 1 : cardText = "身份证";break;case 2 : cardText = "护照";break;case 3 : cardText = "学生证";break;case 4 : cardText = "军人证";break;
        case 6 : cardText = "驾驶证";break;case 7 : cardText = "回乡证";break;case 8 : cardText = "台胞证";break;case 10 : cardText = "港澳通行证";break;
        case 11 : cardText = "国际海员证";break;case 20 : cardText = "外国人永久居留证";break;case 21 : cardText = "旅行证";break;
        case 22 : cardText = "台湾通行证";break;case 23 : cardText = "士兵证";break;case 24 : cardText = "临时身份证";break;
        case 25 : cardText = "户口簿";break;case 26 : cardText = "警官证";break;case 27 : cardText = "出生证明";break;case 99 : cardText = "其他";break;
        default : cardText = "未知证件";break;

    }
    return cardText;
  },
  //时期转换
  FormatDate:function(date){
    var d = "";
    if (date != "") {
        var birthDay = new Date(date.replace(/-/g, "/"));
        var month = birthDay ? birthDay.getMonth() + 1 : undefined,
            date = birthDay ? birthDay.getDate() : undefined;
        month = month < 10 ? "0" + month : month;
        date = date < 10 ? "0" + date : date;
        d = birthDay.getFullYear() + "-" + month + "-" + date;
        if (birthDay == "1-01-01") {
            d = "";
        }
    }
    return d;
  },

  //************************************************************
  //***************************公用*****************************
  //************************************************************
  //显示TOAST
  showToast:function(msg){
    cwx.showToast({
      title: msg,
      icon: 'success'
    })
  },
  showLoading:function(){
    cwx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration : 10000
    })
  },
  hideLoading:function(){
    cwx.hideToast()
  },
  //查询接口失败后弹窗
  modalRetryShow: function(msg) {
    var that =this;
    cwx.showModal({
      title: '提示',
      content: msg,
      confirmText:'重试',
      success: function(res) {
        if (res.confirm == 1) {
          that.getDataFromSoa();
        }
      }
    })
  },
  //错误提示显示
  modalWarnShow:function(msg){
    cwx.showModal({
      title: '提示',
      content: msg,
      showCancel : false,
      success: function(res) {
        if (res.confirm == 1) {

        }
      }
    })
  },
})

//证件打码
function MaskIDNumber(value){
    if (value.length > 3)
        return DoMask(value, parseInt(value.length / 3), value.length - parseInt(value.length / 3) - 2);
    else
        return MaskRange(value, 0, value.length);
}
function MaskRange(value,rangeStart,rangeLength){
    if (value.length < 3 || rangeLength < 3)
        return value;

    var maskStart = rangeStart + parseInt(rangeLength / 3);
    var maskLength = parseInt(rangeLength / 3) + 1;
    return DoMask(value, maskStart, maskLength);
}
function DoMask(value, maskStart, maskLength){
    var result = '';
    var maskEnd = maskStart + maskLength - 1;
    for (var i = 0;i< value.length;i++){
        if (i>=maskStart && i<=maskEnd){
            result += '*';
        }else{
            result += value[i];
        }
    }
    return result;
}
//手机打码
function MaskMobile(value){
    if (value.length > 11)
        return MaskRange(value, value.length - 11, 11);
    else
        return MaskRange(value, 0, value.length);
}
//验证身份证
function IdentityCodeValid(code) { 
  var city={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江 ",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北 ",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏 ",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外 "};
  var pass= true;
  
  if(!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)){
      pass = false;
  }
  
  else if(!city[code.substr(0,2)]){
      pass = false;
  }
  else{
      //18位身份证需要验证最后一位校验位
      if(code.length == 18){
          code = code.split('');
          //∑(ai×Wi)(mod 11)
          //加权因子
          var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
          //校验位
          var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
          var sum = 0;
          var ai = 0;
          var wi = 0;
          for (var i = 0; i < 17; i++)
          {
              ai = code[i];
              wi = factor[i];
              sum += ai * wi;
          }
          var last = parity[sum % 11];
          if(parity[sum % 11] != code[17]){
              pass =false;
          }
      }
  }
  return pass;
}