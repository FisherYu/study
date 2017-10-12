import { cwx } from '../../../cwx/cwx.js';

var WeAPP_models = require('../models/models.js');
var WeAPP_paymentWayModel = WeAPP_models.PaymentWayModel;
var WeAPP_Business = require('../common/business.js');
var WeAPP_paymentStore = require('../models/stores.js');
var WeAPP_orderDetailStore = WeAPP_paymentStore.OrderDetailStore();
var WeAPP_payResultOStore = WeAPP_paymentStore.PayResultOrderStore();
var WeAPP_GD = require('../components/getdata.js');

module.exports.CPayPopbox = {
    init: function(settings){
        var self = this;
		wx.showToast({
			title: '支付连接中..',
			icon: 'loading',
			mask: true,
			duration: 10000
		});
        //存储支付原始信息
        self.originalOrderDetailData = settings.data || {};
        self.settings = settings;
		self.isDebug = true; //开启调试日志
         //验证SBU传递过来的参数是否正确
        WeAPP_GD.getData.call(self, function(){
            //验证成功后，发送102服务
			self.getPayway(function(){
				wx.showToast({
					title: '支付提交中..',
					icon: 'loading',
					mask: true,
					duration: 10000
				});
				self.weicatPaysubmit();
			});
        });  
    },
    data: {
        weicat: {}, //微信支付102服务下发信息
        payData: {}   //保存SBU传递过来的参数
    },
    //错误提示框，点击按钮事件处理
    modalConfirm: function(str, callback){
        var that = this;
		wx.hideToast();
        wx.showModal({
            title: '提示',
            content: str || '',
            success: function(res) {
                if (res.confirm) {
                    if(callback){
                        return callback.call(that)
                    }
                }
            }
        })
    },
    //Toast 错误提示
    showToast: function(str, icon, duration, callback){
        var that = this;
        var icon = icon || 'success',
            str  = str || '网络不给力，请稍候重试',
            duration = duration || 2000;
        wx.showToast({
            title: str,
            icon: icon,
            duration: duration,
			mask: true,
			complete: function(){
				if(callback){
					return callback()
				}
			}
        })
    },
    //获取返回BU需要传递的参数
    getBackParams: function(rc, status){
        var orderinfo = WeAPP_orderDetailStore.get() || {};
        var payresultInfo = WeAPP_payResultOStore.get() || {};
        var param = {
            orderID: orderinfo.oid || '',
            externalNo: orderinfo.extno || '',
            billNo: orderinfo.bilno || '',
            payType: payresultInfo.realpaytype || '',
            busType: orderinfo.bustype || '',
            price: orderinfo.totalamount || ''
        };

        if(typeof status !== 'undefined'){
            param.Status = status
        }

        if (payresultInfo.realoid) {
            param.orderID = payresultInfo.realoid;
        }

        if (rc == 2) {
            delete param.payType;
            param.ErrorCode = 888;
            param.ErrorMessage = '';
        } else if(rc == 4) {
            delete param.payType;
            param.ErrorCode = orderinfo.ErrorCode;
            param.ErrorMessage = orderinfo.ErrorMessage;
        } else if (rc == 3) {
            delete param.payType;
        }
        return param
    },
    //获取公共完成Request参数
    getParames: function(parames){
        var that = this;
        var payData = that.originalOrderDetailData;
        var thatData = that.data.payData;
        var extParam = thatData.extParam;
        //解析封装白名单 变量定义
        var payrestrict = {},
            tempArray = [],
            tempList = [],
            i = 0,
            len = 0;

        var publicParames = {
            "clienttoken": payData.token,
            "clientextend": payData.extend,
            "clientsign": payData.sign,
            "subpay": 0
        };
        //解析封装白名单 向服务端传递
        if (extParam.payTypeList) {
            payrestrict.paytypelist = extParam.payTypeList;
        }
        if (extParam.subPayTypeList) {
            payrestrict.subpaytypelist = extParam.subPayTypeList;
        }
        //支付白名单
        if (extParam.payWayWhiteList) {
            tempList = extParam.payWayWhiteList.split(',');
            len = tempList.length;
            for (; i < len; i++) {
                tempArray.push({"whiteid": tempList[i]});
            }
            payrestrict.whitelist = tempArray;
        }
        //支付黑名单
        if (extParam.PayWayBlackList) {
            tempArray = [];
            tempList = extParam.PayWayBlackList.split(',');
            i = 0;
            len = tempList.length;
            for (; i < len; i++) {
                tempArray.push({"blackid": tempList[i]});
            }
            payrestrict.blacklist = tempArray;
        }

        publicParames.payrestrict = payrestrict;
        //解析封装白名单 End

        for(var attr in parames){
            publicParames[attr]=parames[attr];
        }
        return publicParames;
    },
    //发起102服务请求
    getPayway: function(callback){
        var that = this;
        var thatData = that.data.payData;
        var orderdetail = thatData.orderDetail,
            extParam = thatData.extParam;

        var params = {
            "reqpayInfo": {
                "requestid": orderdetail.requestid,
                "paytype": 1,//默认支付
                "payee": 1,//默认到携程 支付类型
                "paybitmap": 0
            },
            "oinfo": {
                "bustype": orderdetail.bustype,
                "oid": orderdetail.oid,
                "odesc": orderdetail.title,
                "currency": orderdetail.currency,
                "oamount": orderdetail.amount
            },
            "extendinfo": {
                "extendbitmap": 64
            }
        };

        //是否担保
        if (extParam.useEType == 2) {
            params.reqpayInfo.paytype = 2;
        }

        //是否预授权
        if (extParam.IsNeedPreAuth) {
            params.reqpayInfo.paytype = 1 * params.reqpayInfo.paytype + 4;
        }

        //区分先付 后付  Native传了  H5没传 先按照先付流程
        params.reqpayInfo.paytype = 1 * params.reqpayInfo.paytype + 8;

        //支付类型
        if (extParam.subPayType == 1) {
            params.reqpayInfo.payee = 2;
        }else if(extParam.subPayType == 2){
            params.reqpayInfo.payee = 3;
        }
        //是否实时支付
        if (extParam.isRealTimePay == 1) {
            params.reqpayInfo.paybitmap = 1;
        }
        //酒店付款过期限制时间
        if(extParam.paydeadline){
            params.extendinfo.lmexpire = extParam.paydeadline;
        }
		
		//微信小程序BU APPID
		if(cwx.appId){
			params.extend = cwx.appId;
		}

        WeAPP_paymentWayModel({
            data: that.getParames(params),
            success: function(res){
				if (res.rc == 1) {//errno:1:服务端错误即原errorInformation， res; 2:解析错误
					return that.failFn();
				}
				res = res.resinfo101;
				var thirdpays = res.thirdpartylist || [];
				if(thirdpays.length > 0){
					thirdpays.map(function(item, key){
						var thStat = item.thirdstatus & 4;
						if((item.paymentwayid == "WechatScanCode" || item.paymentwayid == "OGP_WechatScanCode") && !thStat){
							//更新数据
							that.data.weicat = item
						}
					})
				}
				
				//服务没有下发第三方微信支付显示提示信息内容
				if(!that.data.weicat.paymentwayid){
					that.showToast("无法支付，请至网页版或携程APP支付");
					return
				}else{
					return callback()
				}
			},
            fail: that.failFn.bind(that)
        }).excute();
    },
    //网络请求失败提示信息
    failFn: function(res){
		//wx.hideToast();
        this.showToast("系统异常，请稍后再试 -505");
        WeAPP_Business.clearStore(); //清除缓存
    },
    //微信支付调起
    weicatPay: function(param){
        var that = this;
        var sign = param.thirdpartyinfo && param.thirdpartyinfo.sig || '{}';
        param = JSON.parse(sign);
        wx.requestPayment({
            'timeStamp': param.timeStamp,
            'nonceStr': param.nonceStr,
            'package': param.package,
            'signType': param.signType,
            'paySign': param.paySign,
            'success':function(res){
                var resultBackInfo = that.getBackParams();
                WeAPP_payResultOStore.setAttr('requestid', WeAPP_orderDetailStore.getAttr("requestid"));
                WeAPP_Business.clearStore(); //清除缓存
				
				if(that.isDebug){
					console.log('++++++++++++++++++++++++++++++sbackcomplete start++++++++++++++++++++++++++++++++++++++++');
					console.log("BU 传入的sbackCallback:" + that.settings.sbackCallback);
					console.log("微信返回res: " + JSON.stringify(res));
					console.log('++++++++++++++++++++++++++++++sbackcomplete end++++++++++++++++++++++++++++++++++++++++');					
				}
				
				if(typeof that.settings.sbackCallback === 'function'){
					return that.settings.sbackCallback.call(that,resultBackInfo) 
				}
				
            },
            'fail':function(res){
                //cwx.payment.trigger('eback', resultBackInfo);
				if(res && res.errMsg){
					if(res.errMsg == 'requestPayment:fail cancel'){
						var resultBackInfo = that.getBackParams(3);
						if(typeof that.settings.rbackCallback === 'function'){
							setTimeout(function(){
								return that.settings.rbackCallback.call(that,resultBackInfo);
							}, 1000)
						}
						
						/***
						that.showToast('用户中途取消',null, 2000, function(){
							if(typeof that.settings.rbackCallback === 'function'){
								setTimeout(function(){
									return that.settings.rbackCallback.call(that,resultBackInfo);
								}, 2000)
							}
						});	**/
					}   
					
					if(res.errMsg == 'requestPayment:fail'){
						var resultBackInfo = that.getBackParams(2);
						if(that.isDebug){
							console.log('++++++++++++++++++++++++++++++ebackcomplete start++++++++++++++++++++++++++++++++++++++++');
							console.log("BU 传入的ebackCallback:" + that.settings.ebackCallback);
							console.log("微信返回res: " + JSON.stringify(res));
							console.log('++++++++++++++++++++++++++++++ebackcomplete end++++++++++++++++++++++++++++++++++++++++');
						}
						
						if(typeof that.settings.ebackCallback === 'function'){
							return that.settings.ebackCallback.call(that,resultBackInfo) 
						}
						try{
							var payData = that.originalOrderDetailData;
							Business.exceptionInfoCollect({
								bustype: 4,
								excode: "c_e_c03",
								extype: 1,
								exdesc: '微信支付SIGN:' + sign + '; BU传递的的Token:' + payData.token + ';extend:' + payData.extend + ';oid:' + payData.oid
							});
						}catch(e){}
					}
                }
				WeAPP_Business.clearStore(); //清除缓存
            }
        })
    },
    //支付提交返回
    paySubmitBack: function(item){
        var that = this;
        
        if (item.rc == 1) {//errno:1:服务端错误即原errorInformation， res; 2:解析错误
            that.showToast(item.rmsg || "系统异常，请稍后再试 -505");
			var resultBackInfo = that.getBackParams(4);
			if(that.isDebug){
				console.log('++++++++++++++++++++++++++++++303/301 ebackcomplete start++++++++++++++++++++++++++++++++++++++++');
				console.log("BU 传入的ebackCallback:" + that.settings.ebackCallback);
				console.log("303/301服务返回: " + JSON.stringify(item));
				console.log('++++++++++++++++++++++++++++++303/301  ebackcomplete end++++++++++++++++++++++++++++++++++++++++');
			}
			
			if(typeof that.settings.ebackCallback === 'function'){
				setTimeout(function(){
					return that.settings.ebackCallback.call(that,resultBackInfo)
				}, 2000)
			}
            return;
        }

        //设置单号
        //billl
        WeAPP_Business.setTempOid(item);
        //保存bilno唯一订单号
        if (item.bilno) {
            WeAPP_orderDetailStore.setAttr("bilno", item.bilno);
        }
        //如果有errormsg或者errorcode则保存
        if (item.rc) {
            WeAPP_orderDetailStore.setAttr("ErrorCode", item.rc);
        }
        if (item.rmsg) {
            WeAPP_orderDetailStore.setAttr("ErrorMessage", item.rmsg);
        }

        if(item.rc == 0){
			wx.hideToast();
            return that.weicatPay(item);
        }else if (item.rc < 100) {

            if (item.rc == 4) {
                //重复提交订单处理逻辑
                return that.showToast(item.rmsg || "订单已提交支付，请勿重复提交支付！");
            } else if (item.rc == 6) {
                //常用卡连续多次支付失败
            } else if (item.rc == 8) {
                //实时支付已成功，重复提交
                return that.showToast(item.rmsg || "订单支付，请勿重复提交支付！");
            } else if (item.rc == 9) {
                //指纹支付验证失败
            }  else if (item.rc == 12) {//实时支付扣款成功 Add by sqsun 20150205
                var resultBackInfo = that.getBackParams(0, 2); //通知BU扣款成功
				wx.hideToast();
                //cwx.payment.trigger('sback', resultBackInfo);
				if(typeof that.settings.sbackCallback === 'function'){
					return that.settings.sbackCallback.call(that,resultBackInfo) 
				}
            } else if (item.rc == 13) {
                //银行和卡号不一致 v6.4 Add by jgd 20150310
            } else if (item.rc == 14) {
                //V6.13支付提交失败时 1.清空对应短信验证码 2.提示文案修改为“请重新获取验证码” 3.六十秒倒计时没有走完 继续走
            } else if (item.rc == 16 || item.rc == 17) {
                //1.处理风控返回 2.用户修改了手机号或者新卡输入了手机号 需传到风控页
            } else {
                //支付错误跳转页面
                return that.showToast(item.rmsg);
            }

        } else {
            var resultBackInfo = that.getBackParams(4);
			wx.hideToast();
            //cwx.payment.trigger('eback', resultBackInfo);
			if(typeof that.settings.ebackCallback === 'function'){
				return that.settings.ebackCallback.call(that,resultBackInfo) 
			}
        }
    },
    //发送支付提交
    requestSubmit: function(code){
        var that = this;

        var payData = that.data.payData; //SBU传入的数据
        var orderDetail = payData.orderDetail;
        var extParam = payData.extParam;
        var weicatPayData = that.data.weicat; //102服务下发的微信第三方支付数据
        var paywayid = extParam.useEType == 2 ? "OGP_WechatScanCode" : "WechatScanCode"; //6.11 担保支付传入paymentwayid值需要修改
        var lastpaytime = extParam.paydeadline; //BU传入的最晚收款时间
        var usetype = extParam.useEType || 1; //useEType默认为支付 1
        var isPreAuth = extParam.IsNeedPreAuth; //是否支持预授权
        var subusetype = isPreAuth ? 1 : 0;
        var subpay = extParam.subPayType || 0; //默认支付到携程 0
        var isAutoApplyBill = extParam.isAutoApplyBill ? true : false;
        var dataParam = {
            "opttype": 1,
            "paytype": 4,
            "requestid": orderDetail.requestid,
            "thirdpartyinfo": {
                "paymentwayid": paywayid, //微信
                "typeid": 0,
                "subtypeid": 4, //微信小应用
                "typecode": "",
                "amount": orderDetail.amount,
                "brandid": paywayid,
                "brandtype": weicatPayData.brandtype,
                "channelid": weicatPayData.channelid,
                "thirdfee": 0
            },
            "bustype": orderDetail.bustype,
            "usetype": usetype,
            "subusetype": subusetype,
            "subpay": subpay,
            "forcardfee": 0,
            "forcardcharg": 0,
            "stype": 0,
            "oinfo": {
                "bustype": orderDetail.bustype,
                "oid": orderDetail.oid,
                "odesc": orderDetail.title,
                "currency": orderDetail.currency,
                "oamount": orderDetail.amount,
                "oidex": orderDetail.oid,
                "displayCurrency": orderDetail.displayCurrency,
                "displayAmount": orderDetail.displayAmount,
                "extno": orderDetail.extno,
                "notify": orderDetail.paymentnotifyurl, //支付通知接口
                "autoalybil": isAutoApplyBill,
                "recall": orderDetail.recall
            }
        };

        //保存本次支付type类型
        WeAPP_payResultOStore.setAttr('realpaytype', dataParam.paytype)

        if (lastpaytime) {
            dataParam.lastpaytm = lastpaytime;//BU传入的最晚收款时间
        }

        //微信支付code传递
        if(code){
            dataParam.thirdpartyinfo.code = code;
        }
		
		//微信小程序BU APPID
		if(cwx.appId){
			dataParam.extend = cwx.appId;
		}

        dataParam = that.getParames(dataParam); //获取整体Request参数

        var onFail = function(){
            that.showToast("系统异常，请稍后再试 -505");
        };

        if(extParam.isRealTimePay == 1){ //时实支付303服务
            WeAPP_models.PayMentV3Model({
                data: that.getParames(dataParam),
                success: that.paySubmitBack.bind(that),
                fail: onFail.bind(that)
            }).excute();
        }else{ //301服务
            WeAPP_models.PayMentModel({
                data: that.getParames(dataParam),
                success: that.paySubmitBack.bind(that),
                fail: onFail.bind(that)
            }).excute();
        }
    },
    //微信支付，获取用户code
    getWecatCode: function(callback){
        var that = this;
        cwx.login({
            success: function(res) {
                if (res.code) {
                    //return callback('001tjhEB1Ea6Uh0wQ0HB12NcEB1tjhEz');
                    return callback(res.code);
                } else {
                    //console.log('获取用户登录态失败！' + res.errMsg);
                    that.showToast('系统异常，请稍后再试 -505');
                }
            }
        });
    },
    //提示微信支付
    weicatPaysubmit: function(){
        var that = this;
        that.getWecatCode(function(code){ //获取用户CODE后发送303服务
			return that.requestSubmit(code)
		})
    }
};
