/**
 * Created by q_yao on 2017/2/7.
 */
define([//'cGeoService',
        //'cMarketStore',
        'Deferred',
        //'cHybridShell',
        //'cHeadStore', 'IScroll'
        ],
    function(//GeoService,
             //cMarketStore,
             Deferred//,
             //cHybridShell,
             //cHeadStore,  IScroll
             ) {
        var util = {};

        /**
         * 显示维护中页面
         */
        util.showMaintaining = (function() {
            var tmpl = _.template(['<div class="system-wrap">',
                            '<div class="loadFailed-box">',
                                '<div class="loadFailed-animate">',
                                    '<div class="bubble"></div>',
                                    '<div class="eyebrow"></div>',
                                    '<div class="tail"></div>',
                                    '<div class="tear"></div>',
                                    '<div class="l-hand"></div>',
                                    '<div class="r-hand" style="z-index: 0;"></div>',
                                    '<div class="text"></div>',
                                '</div>',
                            '</div>',
                            '<div class="copy"><%-tip%></div>',
                        '</div>'].join(''));
            var defaultTip = '系统正在升级中，请稍后再试';
            /**
             * param {
             * title: 头部
             *  tip: 显示文案
             *  returnHandler: 返回回调 required
             * }
             */
            return function(param, pageConfig) {
                if(!param) {
                    param = {};
                }
                if(!param.tip) {
                    param.tip = defaultTip
                }
                Lizard.showHisCtnrView(
                /*onShow*/function() {
                        this.$el.html(tmpl({tip: param.tip}));
                        this.headerview.set({
                                view: this,
                                title: param.title || '东亚携程联名信用卡',
                                back: true,
                                events: {
                                    returnHandler: function() {
                                        if(param.returnHandler) {
                                            param.returnHandler();
                                        }
                                    }
                                }
                        });
                        this.headerview.show();
                }, /*onHide*/function(){},
                    { triggerHide: false, addToHistory: false, viewName: 'ccMaintaining', pageConfig: pageConfig})
            }
        })();

        /**
         * 加载图片
         * @param src
         * @returns {*}
         */
        util.loadImg = function (src) {
            var deferred = Deferred();
            var img = new Image();
            img.src = src;
            img.onload = resolve;
            img.onerror = resolve;
            img.onabort = resolve;
            console.log(src);
            function resolve() {
                deferred.resolve()
            };
            return deferred.promise();
        }

        /**
         * 图片加载完后在初始化IScroll
         * @param view
         * @param wrap
         * @returns {*}
         */
        // util.lazyInitIScroll = function(view, wrap) {
        //     var self = this,
        //         $scrollWrap = _.isString(wrap) ? view.$(wrap): wrap,
        //         imgs = $scrollWrap.find('img'),
        //         lazyImgs = _.map(imgs, function(img){
        //             return self.loadImg(img.src);
        //         });

        //     if(lazyImgs.length === 0) {
        //         lazyImgs.push(function() {
        //             var deferred = Deferred();
        //             deferred.resolve();
        //             return deferred.promise();
        //         })
        //     }
        //     return $.when.apply(null, lazyImgs).then(function(){
        //         var deferred = Deferred();
        //         var isScroll = new IScroll($scrollWrap[0], {
        //             probeType: 3,
        //             bounceTime: 600,
        //             bounceEasing: "quadratic"
        //         });
        //         deferred.resolve(isScroll);
        //         return deferred.promise();
        //     });
        // };

        /**
         * 是否为合法身份证有效证
         * 源于 Lizard Util.cUtilValidate.isIdCard
         * 线上加载该组件时间长，故copy下来
         */
        util.isIdCard = function (idCard) {
            var num = idCard.toLowerCase().match(/\w/g);
            if (idCard.match(/^\d{17}[\dx]$/i)) {
                var sum = 0, times = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
                for (var i = 0; i < 17; i++){
                    sum += parseInt(num[i], 10) * times[i];
                }
                if ("10x98765432".charAt(sum % 11) != num[17]) {
                    return false;
                }
                return !!idCard.replace(/^\d{6}(\d{4})(\d{2})(\d{2}).+$/, "$1-$2-$3");
            }
            if (idCard.match(/^\d{15}$/)) {
                return !!idCard.replace(/^\d{6}(\d{2})(\d{2})(\d{2}).+$/, "19$1-$2-$3");
            }
            return false;
        }

        /**
         * 解析18位身份证号
         * @param idCard
         * @param isAgeForward 年龄计算是否向前计算还是向后计算
         * 如：今天是20170705， 生日是：20160704
         * isAgeForward：true则是2岁，为false则是1岁
         * @return
         * {
     *   birthDay String 出生日期
     *   age Number 年龄(计算方式精确到天),
     *   sex Number 性别 1:男性，0：女性
     * }
         */
        util.parseIdCard = function(idCard, isAgeForward) {
            if(this.isIdCard(idCard) && idCard.length === 18) {
                var year = +idCard.substr(6, 4),
                    month = +idCard.substr(10, 2),
                    day = +idCard.substr(12, 2),
                    sex = +idCard.substr(14, 1);
                var birthDay = [year, month, day].join('-');
                var currDate = new Date();
                var age = currDate.getFullYear() - year;
                if(!!isAgeForward) {
                    if(currDate.getMonth() + 1 > month
                        || (currDate.getMonth() + 1 === month && currDate.getDate() > day)) {
                        age++;
                    }
                } else {
                    if(currDate.getMonth() + 1 < month
                        || (currDate.getMonth() + 1 === month && currDate.getDate() < day)) {
                        age--;
                    }
                }

                return {
                    birthDay: birthDay,
                    age: age,
                    sex: sex % 2
                }
            }
            return null;
        }

        /**
         * 把对象转成QueryString
         * @param param
         * @returns {string}
         */
        util.toQueryString = function(param) {
            var pairs = [];
            _.each(param || {}, function(value, key){
                if(!_.isUndefined(value) && !_.isNull(value)){
                    pairs.push(key + '=' + encodeURIComponent(value));
                }
            });
            return pairs.join('&');
        }

    //     /**
    //      * 定位
    //      * @param success_function 成功回调
    //      * @param fail_function 失败回调
    //      * @return
    //      * {
    //  *   country String 国家
    //  *   province String 省
    //  *   city String 市
    //  *   district String 区
    //  * }
    //      */
    //     util.positioning = function(success_function,fail_function) {
    //         var geoLocation = GeoService.GeoLocation;
    //         var deferred = Deferred();
    //         var deferred2 = Deferred();
    //         $.when(deferred.promise(), deferred2.promise()).then(function(data1,data2){
    //         var data = {
    //                 country: data1.CountryName,
    //                 province:data1.ProvinceName,
    //                 city:data1.CityEntities[0].CityName,
    //                 district:data2.district
    //             }
    //             success_function && success_function(data);
    //     },function(err){
    //         fail_function && fail_function(err);
    //     });
    //     geoLocation.Subscribe('cityLocationRequest',{
    //         onCityComplete:function(data){
    //             deferred.resolve(data);
    //         },
    //         onComplete:function(data){
    //             deferred2.resolve(data);
    //         },
    //         onPosError: function(err){
    //             deferred.reject(err);
    //         },
    //         onCityError: function(err){
    //             deferred.reject(err);
    //         },
    //         onError:function(err){
    //             deferred.reject(err);
    //         }
    //     }, null, false);
    // }

        /**
         * 校验是否缩写拼音
         * 拼音姓名去除空格后长度[18， 24]直接拼音名缩写
         * @param lastName
         * @param firstName
         * @return 如果缩写，则返回缩写结果，否则返回void 0;
         */
        util.shouldAbridgePinyin = function(lastName, firstName) {
            if(lastName === void 0 || firstName === void 0) {
                return;
            }
            var lastNameWithoutSpace = (lastName || '').replace(/ /g, '');
            var firstNameWithoutSpace = (firstName || '').replace(/ /g, '');
            var len = lastNameWithoutSpace.length + firstNameWithoutSpace.length;
            if(len > 17 && len < 25) {
                return this.getFirstLetters(firstName).join('').toUpperCase();
            }
        }

        /**
         * 格式化英文姓名，主要用于删除多余的空格
         * @param name
         * @returns {*}
         */
        util.formatEnName = function(name) {
            return name ? name.replace(/(\s+)/g, ' ').trim() : name;
        }

        /**
         * 校验是否缩写外籍员工英文姓名
         * @param enName
         * @param maxLength
         * @separater 长度计算分隔符
         * @returns {string}
         */
        util.shouldAbridgeEnName = function(enName, maxLength, separater){
            if(!enName) return;
            var parts = this.formatEnName(enName).split(' ');
            if(parts.length === 1) return; // 如果只有姓，则直接返回
            var lastName = parts.pop();
            maxLength = maxLength || 30;
            if(separater === void 0) {
                separater = ' ';
            }
            var separaterLen = separater.length;
            var remainLength = maxLength - separaterLen - lastName.length;
            // 如果姓过长，或者姓名长度没达到缩写上限，则返回
            if(remainLength < 1 || parts.join(separater).length <= remainLength) return;
            var abridgeParts = [];
            do{
                var part = parts.pop();
                abridgeParts.push(part[0]);
                if(abridgeParts.join(separater).length + parts.join(separater).length + separaterLen <= remainLength){
                    break;
                }
            }while(parts.length);
            if(abridgeParts.length) {
                var r = [parts.join(' '),
                    abridgeParts.reverse().join(' '),
                    lastName].join(' ').trim().toUpperCase();
                console.log(r); // TODO
                return r;
            }
        }

        /**
         * 是否缩写英文名
         * @param enFirstName
         * @param enLastName
         * @returns {string}
         */
        util.shouldAbridgeEnFirstName = function(enFirstName, enLastName) {
            var lastAndFirstNameAb = this.shouldAbridgeEnName([enFirstName, enLastName].join(' '), 17, '');
            if(!lastAndFirstNameAb) return;
            var firstNameParts = lastAndFirstNameAb.split(' ');
            firstNameParts.pop();
            return firstNameParts.join(' ');
        }

        /**
         * 获取单词首字母，多个单词默认空格隔开
         * @param str
         * @param separator 单词分隔符，默认空格
         * @return []
         */
        util.getFirstLetters = function(str, separator) {
            if(separator === void 0) {
                separator = ' ';
            }
            var letters = [];
            _.each(str.trim().split(separator), function(item){
                item !== '' && letters.push(item.substring(0, 1));
            });
            return letters;
        }

        /**
         * 判断也是是否是编辑模式
         * @returns {boolean}
         */
        util.isEditMode = function() {
            return this.getUrlParam('type') === 'edit';
        }

        /**
         * 获取bcpDTO
         * @returns {bcpDTO}
         */
        // util.getBcpDTO = function() {
        //     var info = cMarketStore.UnionStore.getInstance().get() || {};

        //     /*
        //      Hybrid不能从ls中获取aid, sid 所以尝试从url中获取 急需框架给出方案
        //      咨询营销团队的吴好好: Hybrid环境中营销团队不负责埋入aid,sid,由框架埋入
        //      咨询框架的卞奕龙: 框架不处理url中aid,sid, 他们只获取native埋入的aid,sid
        //      结论：我们尝试自己去从url中获取
        //      * */
        //     var bcpDTO = {
        //         bussinessId: this.getUrlParam('bid') || '',
        //         channelId: this.getUrlParam('cid') || '',
        //         page: this.getUrlParam('pid') || '',
        //         aid:info.AllianceID || this.getUrlParam('Allianceid') || '',
        //         sid:info.SID || this.getUrlParam('sid') || '',
        //         ouid: info.OUID || this.getUrlParam('ouid') || '',
        //         sourceId:info.SourceID || this.getUrlParam('sourceid') || ''
        //     };
        //     return bcpDTO;
        // }

        /**
         * 获取设备信息multiFreqSubRiskDto
         * @returns {multiFreqSubRiskDto}
         */
        // util.getMultiFreqSubRiskDto = function(success) {
        //     if(Lizard.app.vendor.is("CTRIP")){
        //         cHybridShell.Fn('get_device_info', function(jsonData){
        //             var multiFreqSubRiskDto = {
        //                 clientId:jsonData.clientID,
        //                 imei:jsonData.IMEI || '',
        //                 wifiMac:jsonData.wifiMac,
        //                 ip:jsonData.IP
        //             };
        //             success && success(multiFreqSubRiskDto);
        //         }).run();
        //     }else{
        //         var headStore =  cHeadStore.getInstance().get();
        //         var multiFreqSubRiskDto = {
        //             clientId: headStore ? headStore.cid: '',
        //             imei:'',
        //             wifiMac:'',
        //             ip:''
        //         };
        //         success && success(multiFreqSubRiskDto);
        //     }
        // }

        /**
         * 获取设备信息multiFreqSubRiskDto
         * http://crn.site.ctripcorp.com/hapi/classes/CtripBusiness.html#method_app_get_device_info
         * @returns {multiFreqSubRiskDto}
         */
        // util.getDeviceInfo = function(success) {
        //     if(Lizard.app.vendor.is("CTRIP")){
        //         var deferred_device_info = Deferred();
        //         var deferred_network_status = Deferred();
        //         var deferred_screen_brightness = Deferred();
        //         $.when(deferred_device_info.promise(),
        //             deferred_network_status.promise(),
        //             deferred_screen_brightness.promise())
        //             .then(function(device_info,network_status,screen_brightness){
        //                 var multiFreqSubRiskDto = {};
        //                 // Device info
        //                 device_info.clientID && (multiFreqSubRiskDto.clientId = device_info.clientID);
        //                 device_info.IMEI && (multiFreqSubRiskDto.imei = device_info.IMEI);
        //                 device_info.wifiMac && (multiFreqSubRiskDto.wifiMac = device_info.wifiMac);
        //                 device_info.IP && (multiFreqSubRiskDto.ip = device_info.IP);
        //                 device_info.OS && (multiFreqSubRiskDto.os = device_info.OS);
        //                 device_info.areaCode && (multiFreqSubRiskDto.areaCode = device_info.areaCode);
        //                 device_info.baseStation && (multiFreqSubRiskDto.baseStation = device_info.baseStation);
        //                 device_info.port && (multiFreqSubRiskDto.port = device_info.port);
        //                 device_info.latitude && (multiFreqSubRiskDto.latitude = +device_info.latitude);
        //                 device_info.longitude && (multiFreqSubRiskDto.longitude = +device_info.longitude);
        //                 device_info.mac && (multiFreqSubRiskDto.mac = device_info.mac);
        //                 // network type
        //                 network_status.networkType && (multiFreqSubRiskDto.networkType = network_status.networkType);
        //                 // brightness
        //                 screen_brightness.screen_brightness && (multiFreqSubRiskDto.screenBrightness = screen_brightness.screen_brightness + '');
        //             success && success(multiFreqSubRiskDto);
        //         });
        //         cHybridShell.Fn('get_device_info', function(jsonData){
        //             deferred_device_info.resolve(jsonData || {});
        //         }).run();
        //         cHybridShell.Fn('check_network_status', function(jsonData){
        //             deferred_network_status.resolve(jsonData || {});
        //         }).run();
        //         cHybridShell.Fn('get_screen_brightness', function(jsonData){
        //             deferred_screen_brightness.resolve(jsonData || {});
        //         }).run();
        //     }else{
        //         var headStore =  cHeadStore.getInstance().get();
        //         var multiFreqSubRiskDto = {}
        //         headStore && (multiFreqSubRiskDto.clientId = headStore.cid);
        //         success && success(multiFreqSubRiskDto);
        //     }
        // }

        /**
         * 强发送UBT数据
         */
        util.forceSendUbt = function(data) {
            if (!window.__bfi) {
                window.__bfi = [];
            }

            window.__bfi.push(['_asynRefresh', {
                page_id: data.pageId,
                orderid: data.orderId,
                url: data.url || '',
                refer: data.refererView || document.referrer
            }]);
        }

        /**
         * 格式化把座机电话
         * @param zip 区号
         * @param phoneNum 号码
         * @param ext 分机
         * @param separator 分隔符，默认'-'
         */
        util.formatPhone = function(zip, phoneNum, ext, separator) {
            var phoneParts = [];
            if(zip) phoneParts.push(zip);
            if(phoneNum) phoneParts.push(phoneNum);
            if(ext) phoneParts.push(ext);
            return phoneParts.join(separator || '-')
        }

        /**
         * 获取字节长度
         * @param str
         */
        util.getBytes = function(str){
            var b = 0, l = str.length;
            if( l ){
                for( var i = 0; i < l; i ++ ){
                    if(str.charCodeAt( i ) > 255 ){
                        b += 2;
                    }else{
                        b ++ ;
                    }
                }
                return b;
            }else{
                return 0;
            }
        }
        /**
         * 按字节截取字符串
         * @param str
         * @param len
         */
        util.cutByte = function (str,len) {
            if(!str) return "";
            if(len<= 0) return "";
            var templen=0;
            for(var i=0;i<str.length;i++){
                if(str.charCodeAt(i)>255){
                    templen+=2;
                }else{
                    templen++
                }
                if(templen == len){
                    return str.substring(0,i+1);
                }else if(templen >len){
                    return str.substring(0,i);
                }
            }
            return str;
        }

        /**
         * 获取省市区页面标题
         * @returns {boolean}
         */
        util.getSelectCityPageTitle = function() {
            var center_title = '';
            var deliverAdd = this.getUrlParam('deliverAdd');
            var type = this.getUrlParam('type');
            if(type == 'baseinfo'){
                center_title = '选择签发城市';
            }else if(type == 'address'){
                if(deliverAdd == 1){
                    center_title = '选择居住地址';
                }else if(deliverAdd == 2){
                    center_title = '选择单位地址';
                }
            }else if(type == 'subscribe'){
                center_title = '选择所在城市';
            }
            return center_title;
        }

        /**
         * 邮箱校验规则
         * @param str
         * @returns {boolean}
         */
        util.isEmail = function(str) {
            return /^([a-zA-Z0-9]+([\._\-]+[a-zA-Z0-9]+)*)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.])|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/.test(str);
        }

        /**
         * 判断字符是否属于unicode BMP 编码区
         * 用于地址，单位名称文本校验
         * 跳过：代理对高位字，私用去，代理对地位字
         * @param str
         * @returns {boolean}
         */
        util.isBMP = function(str) {
            return /^[\u0000-\ud7ff\uf900-\uffef]+$/.test(str);
        }


        /**
         * 格式化金额xxx,xxx.00
         * @param val
         * @param precision 小数位，默认保留原数据的小数位，
         */
        util.formatDecimal = function(val, precision){
            var num = +val;
            if(!_.isNumber(num) || _.isNaN(num)) {
                return val;
            }
            val = val + '';
            var isNegative = num < 0;
            if(isNegative) { // 剔除负号
                val = val.substr(1);
            }
            var numParts = val.split('.');
            // int part
            numParts[0] = reverse(reverse(numParts[0]).replace(/(\d{3})/g, '$1,')).replace(/^,/, '');
            if(precision >= 0) {
                var preStr = (numParts[1] || '') + (new Array(precision + 1)).join('0');
                numParts[1] = preStr.substr(0, precision);
            }
            if(numParts[1] === '') {
                numParts.length = 1;
            }
            return (isNegative ? '-' : '' ) + numParts.join('.');
            function reverse(num) {
                return num.split('').reverse().join('');
            }
        }

        /**
         * 解析url的QS参数
         * cUtilCore.getUrlParams方法有问题
         * @param url
         * @returns {{}}
         */
        util.getUrlParams = function(url) {
            var searchReg = /([^&=?]+)=([^&]+)/g;
            var urlParams = {};
            var match, value, name;

            while (match = searchReg.exec(url)) {
                name = match[1].toLowerCase();
                value = match[2];
                urlParams[name] = decodeURIComponent(value);
            }

            return urlParams;
        }

        /*
        * 百度统计单页面应用解决方案
         */
        util.sendBaiduUbt = function(siteId, url) {
            if(!window._hmt) return;
            if(!url) {
                // 当前路径转成以'/'开头的相对地址
                url = window.location.href.replace(new RegExp('^' + window.location.protocol + '//' + window.location.host), '');
            }
            if(siteId) {
                // http://tongji.baidu.com/open/api/more?p=ref_setAccount
                window._hmt.push(['_setAccount', siteId]);
            }
            window._hmt.push(['_trackPageview', url]);
        }

        /**
         * 百度统计 事件追踪
         * http://tongji.baidu.com/open/api/more?p=ref_trackEvent
         */
        util.sendBaiduTrackEvent = function(siteId, category, action, opt_label, opt_value) {
            if(!window._hmt) return;
            if(siteId) {
                // http://tongji.baidu.com/open/api/more?p=ref_setAccount
                window._hmt.push(['_setAccount', siteId]);
            }
            window._hmt.push(['_trackEvent', category, action, opt_label, opt_value]);
        }

        /**
         * http://crn.site.ctripcorp.com/hapi/classes/CtripUtil.html#method_appSetWebviewBounce
         * 设置是否需要webview的弹性效果，wkwebview在没有弹性时有些页面会部分按钮不能点击，可将Bounce设置为true处理，只对iOS有效
         * @param isNeedBounce
         */
        // util.setWebviewBounce = function(isNeedBounce) {
        //     cHybridShell.Fn('appSetWebviewBounce').run(isNeedBounce);
        // }

        /**
         * 开启IOS web view bounce
         */
        util.enableIOSWebviewBounce = function() {
            $.os && $.os.ios && this.setWebviewBounce(true);
        }

        /**
         * 获取url参数
         */
        util.getUrlParam = function (name) {
            //在app中from参数会decode,所以采用框架方法
            if(name.toLowerCase() === 'from'){
                return Lizard.P(name);
            }
            var re = new RegExp("(\\?|&)" + name + "=([^&]+)(&|$)", "i"), m = location.search.match(re);
            return m ? decodeURIComponent(m[2]) : "";
        }

        return util;
    })