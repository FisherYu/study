import { cwx, CPage } from '../../cwx/cwx.js';
var loginCommon = require("common.js");

var sendMessageurl = "10261/SendMessageByPhone.json";
var loginValidate = "10209/LoginValidate.json";
var thirdPartLogin = "10209/ThirdPartLogin.json";
var thirdPartBindAndLogin = "10209/ThirdPartBindAndLogin.json";
var thirdpartbind = "10209/ThirdPartBind.json";
var thirdpartauthenticate = "10209/ThirdPartAuthenticate.json";
var openid = "";//BCF0A623F24C3990CC4E99083901576C95007BA303B860C2441BF3F9968292B6
var t;
CPage({
    pageId: '10320613196',
    data: {
        errorMsg: "错误提示",
        errorMsgShow: 'none',
        loginTabShow: 'display:none',
        dynamicLoginShow: 'none',
        normalLoginShow: 'none',
        rediectLoginShow: 'block',
        currentTab_dynamic: ' tab-item_current',
        currentTab_normal: '',
        getdynamictitle: '获取动态码',
        getdynamicabled: true,
        invitecodeShow: 'display:none',
        addInviteCodeShow: 'display:block',
        invitecode1Show: 'display:none',
        addInviteCode1Show: 'display:block',
        mobilephonewarn: '', //'  color-warn'
        dyncpwdwarn: '',
        imgcodewarn: '',
        loginnamewarn: '',
        pwdwarn: '',
        avatarUrl: '',//头像
        avatarShow: 'display:none',//控制头像是否显示
        rediectLoginBtnShow: 'display:none',
        nickname: '携程会员',//昵称
        nicknameShow: 'display:none',
        showname: '',//手机/邮箱/用户名
        shownameShow: 'display:none',
        imgCodeShow: 'display:none',
        imgCodeUrl: '',
        captchaID: '',
        signature: ""
    },
    inputContent: {},
    onLoad: function () {

    },
    onUnload: function () {
        if (!(cwx.user.isLogin())) {
            this.invokeCallback({ "ReturnCode": "-1", "Message": "返回操作" })
        }
    },
    onShow: function () {
        //this.getWechatCode();
    },
    onReady: function () {
        var self = this;
        if (cwx.user.logintype == "noauthenticate") {
            self.changeOtherLogin();
        } else {
            self.getWechatCode();
        }
        //self.testgetWechatCode(); //测试授权，上线删除
        // cwx.user.checkLoginStatusFromServer(function (res) {
        //     console.log("登录态："+res);
        //     if (res) {
        //         console.log(res);
        //         // console.log( "登录态有效" );
        //         //todo:上线后，需要放开
        //         // self.navigateBack( { "ReturnCode": "-1", "Message": "登录态有效回调" });
        //         // self.callback( { "ReturnCode": "0", "Message": "登录态有效" });
        //         self.callback({ "ReturnCode": "0", "Message": "登录态有效" });
        //     }else{
        //         self.getWechatCode();
        //     }
        // });


    },
    callback: function (data) {
        //在跳转之前，倒计时关闭
        if (t) {
            clearTimeout(t);
        }
        this.navigateBack(data);
    },
    dynamicLoginClick: function () {
        var self = this;
        var errormsgtotal = "";
        var errorElement = {};
        if (this.inputContent["mobilephone"] == undefined || this.inputContent["mobilephone"].trim().length == 0) {
            //隐藏提示框
            errormsgtotal = '请输入手机号';
            errorElement["mobilewarn"] = '1';
        }
        if (this.inputContent["dyncpwd"] == undefined || this.inputContent["dyncpwd"].trim().length == 0) {
            if (errormsgtotal.length > 0) {
                errormsgtotal = errormsgtotal + "和动态码";
                errorElement["mobilewarn"] = '3'; //手机号和动态密码都有问题
            } else {
                errormsgtotal = "请输入动态码";
                errorElement["mobilewarn"] = '2';  //只是动态密码有问题
            }
        }
        if (errormsgtotal && errormsgtotal != "") {
            this.errorMsgShow(errormsgtotal, 1, errorElement);
            return false;
        }
        var _success = function (data) {
            console.log(data);
            console.log(data.ReturnCode);
            if (data && data.ReturnCode == 0) {
                console.log(data);
                cwx.user.auth = data.Ticket;
                cwx.user.duid = data.Uid;
                //wechatbind 
                if (openid != "") {
                    self.thirdpartbind();
                }
                //记录市场业绩统计
                self.setMarketReferralCode(self.inputContent["invitecode"], false);
                self.callback({ "ReturnCode": "0", "Message": "手机登录成功" });
            } else if (data && data.ReturnCode == 202) {
                errormsgtotal = "动态码不正确" + (data ? data.ReturnCode : '900')
                errorElement["mobilewarn"] = '2';
            }
            else {
                errormsgtotal = "动态码登录失败" + (data ? data.ReturnCode : '900')
            }

            if (errormsgtotal && errormsgtotal != "") {
                self.errorMsgShow(errormsgtotal, 1, errorElement);
                return false;
            }

        };
        this.mobileLogin(_success);
    },
    redirectLoginClick: function () {
        var self = this;
        var _success = function (res) {
            if (res && res.data && res.data.ReturnCode == 0) {
                cwx.user.auth = res.data.Ticket;
                cwx.user.duid = res.data.UID;

                self.callback({ "ReturnCode": "0", "Message": "直接登录成功" });
            } else {
                self.errorMsgShow(res.data.Message + '(' + res.data.ReturnCode + ')', 3);
            }
        };
        var _fail = function (res) {
            self.errorMsgShow("登录失败，请返回重试" + '(900)', 3);
        };
        var data = {
            RequestToken: openid,
            ThirdType: 'WeChatApp',
            IsMobile: true,
            LoginType: 'ThirdPart',
            LoginEntrance: 'Other',
            LoginWay: 'App',
            AutoLogin: false,
            AutoRegister: false,
            Context: [{ Key: "clientID", Value: cwx.clientID }, { Key: "Version", Value: '1.0' }, { Key: "Url", Value: 'accounts/login.wxml' }, { Key: "Platform", Value: 'WechatApp' }, { Key: "page_id", Value: self.pageId }]
            // Context: { clientID: cwx.clientID, Version: '1.0', Url: 'accounts/login.wxml', Platform: 'WechatApp', page_id: self.pageId }
        };
        cwx.request(loginCommon.getRequestObject(thirdPartLogin, data, _success, _fail));
    },
    changeOtherLogin: function () {
        this.setData({
            rediectLoginShow: 'none',
            loginTabShow: 'block',
            dynamicLoginShow: 'block',
            normalLoginShow: 'none'
        });
    },
    changedynamicLogin: function () {
        this.changeLoginType('block', ' tab-item_current', 'none', '', this);
    },
    changenormalLogin: function () {
        this.changeLoginType('none', '', 'block', ' tab-item_current', this);
    },

    changeLoginType: function (_dynamicLoginShow, _dynamicTabStyle, _normalLoginShow, _normalTabStyle, self) {
        self.setData(
            {
                dynamicLoginShow: _dynamicLoginShow,
                currentTab_dynamic: _dynamicTabStyle,
                normalLoginShow: _normalLoginShow,
                currentTab_normal: _normalTabStyle
            }
        );
    },
    //登录事件
    normalLoginClick: function (e) {
        var self = this;
        var errormsgtotal = "";
        var errorElement = {};
        if (self.inputContent["loginname"] == undefined || self.inputContent["loginname"].trim().length == 0) {
            errormsgtotal = "请输入用户名";
            errorElement["loginwarn"] = '1';
        }
        if (self.inputContent["pwd"] == undefined || self.inputContent["pwd"].trim().length == 0) {
            if (errormsgtotal != "") {
                errormsgtotal = errormsgtotal + "和密码";
                errorElement["loginwarn"] = '3';
            } else {
                errormsgtotal = "请输入密码";
                errorElement["loginwarn"] = '2';
            }
        }
        if (errormsgtotal && errormsgtotal != "") {
            this.errorMsgShow(errormsgtotal, 2, errorElement);
            return false;
        }
        var _success = function (res) {
            if (res && res.data && res.data.Ticket && res.data.Ticket != "") {
                cwx.user.auth = res.data.Ticket;
                cwx.user.duid = res.data.UID;
                //记录市场业绩统计
                self.setMarketReferralCode(self.inputContent["invitecode1"], false);

                self.callback({ "ReturnCode": "0", "Message": "普通登录成功" });
            } else if (res && res.data && res.data.ReturnCode == '201') {
                errormsgtotal = '身份认证失败（' + res.data.ReturnCode + ')';
            } else {
                errormsgtotal = '登录失败，请重试（' + res.data.ReturnCode + ')';
            }
            if (errormsgtotal && errormsgtotal != "") {
                self.errorMsgShow(errormsgtotal, 2, errorElement);
                return false;
            }
        };
        var _fail = function (res) {
            errormsgtotal = '登录失败，请重试(900)';
            self.errorMsgShow(errormsgtotal, 2, errorElement);
            return false;

        };
        var data = {
            LoginName: self.inputContent["loginname"].trim(),
            Password: self.inputContent["pwd"].trim(),
            IsMobile: true,
            LoginType: 'MemberLogin',
            LoginEntrance: 'Other',
            LoginWay: 'App',
            AutoLogin: false,
            TokenType: 'OpenId',
            RequestToken: openid,
            ThirdType: 'WeChatApp',
            Context: { clientID: cwx.clientID, Version: '1.0', Url: 'accounts/login.wxml', Platform: 'WechatApp', page_id: self.pageId }
        };
        //发送服务
        cwx.request(loginCommon.getRequestObject(thirdPartBindAndLogin, data, _success, _fail));
    },
    addInviteCodeClick: function () {
        this.setData(
            {
                invitecodeShow: 'display:block',
                addInviteCodeShow: 'display:none'
            }
        );
    },
    addInviteCode1Click: function () {
        this.setData(
            {
                invitecode1Show: 'display:block',
                addInviteCode1Show: 'display:none'
            }
        );
    },
    //文本框改变
    textChange: function (e) {
        this.inputContent[e.currentTarget.id] = e.detail.value;
    },
    errorMsgShow: function (msg, logintype, errorElement) {
        console.log("errormsg 出现,当前登录类型：");
        var self = this;
        if (logintype == '1') {
            //当前登录是手机登录
            if (errorElement["mobilewarn"] == '1') {
                //mobile error
                this.setData({
                    errorMsg: msg,
                    errorMsgShow: 'block',
                    mobilephonewarn: ' color-warn'
                });
            } else if (errorElement["mobilewarn"] == '2') {
                //dynamicpwd error
                this.setData({
                    errorMsg: msg,
                    errorMsgShow: 'block',
                    dyncpwdwarn: ' color-warn'
                });
            } else if (errorElement["mobilewarn"] == '3') {
                //手机号,动态密码有错出错
                this.setData({
                    errorMsg: msg,
                    errorMsgShow: 'block',
                    mobilephonewarn: ' color-warn',
                    dyncpwdwarn: ' color-warn'
                });
            } else if (errorElement["imgcodewarn"] == '1') {
                this.setData({
                    errorMsg: msg,
                    errorMsgShow: 'block',
                    imgcodewarn: ' color-warn'
                });

            } else {
                //服务端返回登录错误
                this.setData({
                    errorMsg: msg,
                    errorMsgShow: 'block'
                    //mobilephonewarn: ' color-warn',
                    //dyncpwdwarn: ' color-warn'
                });
            }
        } else if (logintype == '2') {
            //普通登录
            if (errorElement["loginwarn"] == '1') {
                this.setData({
                    errorMsg: msg,
                    errorMsgShow: 'block',
                    loginnamewarn: ' color-warn'
                });
            } else if (errorElement["loginwarn"] == '2') {
                this.setData({
                    errorMsg: msg,
                    errorMsgShow: 'block',
                    pwdwarn: ' color-warn'
                });
            } else if (errorElement["loginwarn"] == '3') {
                this.setData({
                    errorMsg: msg,
                    errorMsgShow: 'block',
                    loginnamewarn: ' color-warn',
                    pwdwarn: ' color-warn'

                });
            } else {
                this.setData({
                    errorMsg: msg,
                    errorMsgShow: 'block',
                    // loginnamewarn: ' color-warn',
                    // pwdwarn: ' color-warn'
                });
            }
        } else {
            this.setData({
                errorMsg: msg,
                errorMsgShow: 'block'
            });
        }

        setTimeout(function () {
            self.setData({
                errorMsg: "",
                errorMsgShow: 'none'
            });
        }, 3000);

    },

    mobileLogin: function (callback) {
        var self = this;
        var _success = function (res) {
            callback(res.data);
        };
        var _fail = function (res) {
            callback({ ReturnCode: '900', Message: '登录失败，请重试' });
        };
        var data = {
            LoginName: self.inputContent["mobilephone"],
            AuthenticateCode: self.inputContent["dyncpwd"].trim(),
            LoginType: 'MobileQuickLogin',
            LoginEntrance: 'Other',
            LoginWay: 'App',
            AutoLogin: false,
            Context: [{ Key: "clientID", Value: cwx.clientID }, { Key: "Version", Value: '1.0' }, { Key: "Url", Value: 'accounts/login.wxml' }, { Key: "Platform", Value: 'WechatApp' }, { Key: "SourceID", Value: '55552689' }, { Key: "page_id", Value: self.pageId }]
        };
        //发送服务
        cwx.request(loginCommon.getRequestObject(loginValidate, data, _success, _fail));
    },
    thirdpartbind: function () {
        var self = this;
        var data = {
            ThirdType: 'WeChatApp',
            RequestToken: openid,
            AccountAuthType: 'Auth',
            TokenType: 'OpenId',
            IsMobile: true,
            Context: [{ Key: "clientID", Value: cwx.clientID }, { Key: "Version", Value: '1.0' }, { Key: "Url", Value: 'accounts/login.wxml' }, { Key: "Platform", Value: 'WechatApp' }, { Key: "SourceID", Value: '55552689' }, { Key: "page_id", Value: self.pageId }]
            // Context: { clientID: cwx.clientID, Version: '1.0', Url: 'accounts/login.wxml', Platform: 'WechatApp', page_id: self.pageId }
        };
        var _success = function (res) {

        };
        var _fail = function (res) { };
        cwx.request(loginCommon.getRequestObject(thirdpartbind, data, _success, _fail));
    },
    //倒计时功能
    timeCountDown: function () {
        var self = this;
        var countdown = 60;
        var settime = function () {
            if (countdown == 0) {
                self.setData({
                    getdynamictitle: "获取动态码",
                    getdynamicabled: true
                });
                countdown = -1;
            }
            else {
                self.setData({
                    getdynamictitle: countdown + "s后重新发送",
                    getdynamicabled: false

                });
                countdown--;
            }
            if (countdown >= 0) {
                t = setTimeout(settime, 1000);
            } else {
                if (t) {
                    clearTimeout(t);
                }
            }
        };
        settime();
    },
    //获取绑定信息
    getWechatCode: function () {
        var self = this;
        wx.login({
            success: function (res1) {
                if (res1.code && res1.code != 'the code is a mock one') {
                    console.log("code:" + res1.code);
                    wx.getUserInfo({
                        success: function (res2) {
                            var encryptData = res2.encryptedData;
                            // console.log(encryptData);
                            console.log("iv:" + res2.iv);
                            //发起网络请求
                            var data = {
                                RequestToken: res1.code,
                                TokenType: "AuthCode",
                                ThirdType: 'WeChatApp',
                                Context: [{ Key: "encryptData", Value: res2.encryptedData }, { Key: "iv", Value: res2.iv }, { Key: "clientID", Value: cwx.clientID }]
                            };

                            var _success = function (res3) {
                                // console.log("请求授权结果：");
                                //console.log(res3);
                                var retcode = (res3 && res3.data) ? res3.data.ReturnCode : '904';
                                if (retcode == 0) {
                                    openid = res3.data.OpenID;
                                    if (res3.data && res3.data.UID && res3.data.UID != "") {
                                        self.renderUI(res3.data);
                                    } else {
                                        self.changeOtherLogin();
                                    }
                                } else {
                                    //授权失败
                                    self.setData({
                                        rediectLoginBtnShow: 'display:none'
                                    });
                                    self.errorMsgShow("请求微信登录授权失败，请稍候再试(" + retcode + ")", 3);
                                }
                            };
                            var _fail = function (res3) {
                                self.errorMsgShow("请求微信登录授权失败，请稍候再试(900)", 3);
                            };

                            //发送服务
                              cwx.request(loginCommon.getRequestObject(thirdpartauthenticate, data, _success, _fail));
                        },
                        fail: function (res5) {
                            self.errorMsgShow("请求微信授权失败，请稍候重试(901)", 3);
                        }
                    });

                } else {
                    self.errorMsgShow("请求微信登录授权失败，请稍候再试(902)", 3);
                }
            },
            fail: function (res4) {
                //console.log("获取code失败");
                // console.log(res4);
                self.errorMsgShow("请求微信登录授权失败，请稍候再试(903)", 3);
            }
        });

    },
    renderUI: function (data) {
        var self = this;
        var _nickname = "携程会员";
        var _photourl = "";
        if (data && data.Extension) {
            var arrays = data.Extension;
            if (arrays.length > 0) {
                for (var i = 0; i < arrays.length; i++) {
                    if (arrays[i].Key == 'NickName') {
                        if (arrays[i].Value != 'null' && arrays[i].Value != '') {
                            _nickname = arrays[i].Value;
                        }
                    } else if (arrays[i].Key = 'PhotoImageUrl') {
                        _photourl = arrays[i].Value;
                    }
                }
            }
        }
        // console.log("昵称：");
        //  console.log(_nickname);
        //增加昵称
        if (_nickname != '') {
            self.setData({
                nickname: _nickname,
                nicknameShow: 'display:block'
            });
        }
        // console.log('头像：');
        // console.log(_photourl);
        //增加头像
        if (_photourl != '') {
            self.setData({
                avatarUrl: _photourl,
                avatarShow: 'display:block'
            });
        }

        if (data.BindedMobilePhone && data.BindedMobilePhone != "") {
            self.setData({
                showname: data.BindedMobilePhone,
                rediectLoginBtnShow: 'display:block',
                shownameShow: 'display:block'
            });
        } else if (data.BindedEmail && data.BindedEmail != "") {
            self.setData({
                showname: data.BindedEmail,
                rediectLoginBtnShow: 'display:block',
                shownameShow: 'display:block'
            });
        } else if (data.UID && data.UID != "") {
            self.setData({
                showname: self.maskoffcode(data.UID),
                rediectLoginBtnShow: 'display:block',
                shownameShow: 'display:block'
            });
        }

    },
    maskoffcode: function (source) {
        //前4位后3位
        if (!source) {
            return "";
        }
        source = source.trim();
        var result = source;

        if (source && source.length > 7) {
            var firststr = source.substr(0, 4);
            var laststr = source.substr(-3, 3);
            result = firststr + "*****" + laststr;
        } else if (source && source.length > 3) {
            var firststr = source.substr(0, 2);
            var laststr = source.substr(-1, 1);
            result = firststr + "*****" + laststr;
        } else {
            result = source;
        }
        return result;

    },
    setMarketReferralCode: function (referralCode, isregister) {
        //市场营销，需要推送推荐码
        if (referralCode != undefined && referralCode.trim().length > 0) {
            //console.log( "referralCode:" + referralCode );
            var params = {
                "DUID": cwx.user.duid,
                "referralCode": referralCode,
                "isRegister": isregister
            };
            cwx.mkt.setReferralCode(this, params);
        }
    },

    getImageCode: function () {
        //仅输入正确的手机号判断是否出风控
        var self = this;
        var mobilephone = self.inputContent["mobilephone"];
        if (mobilephone == undefined || mobilephone.trim().length == 0) {
            return false;
        }
        var reg = /^1(3|4|5|7|8)\d{9}$/;
        if (!reg.test(mobilephone.trim())) {
            return false;
        }

        var data = {
            "AccountHead": {},
            "Data": {
                "CountryCode": "86", "MobilePhone": mobilephone.trim(),
                "sendScene": "RegistCode", "CheckMobilePhoneNumber": "NoCheck",
                "Context": [{ "Key": "clientID", "Value": cwx.clientID }, { "Key": "Version", Value: '1.0' }, { "Key": "Url", "Value": 'accounts/login.wxml' }, { "Key": "Platform", "Value": 'WechatApp' }, { "Key": "page_id", "Value": self.pageId }]
            }
        };

        var _success = function (res) {
            if (res && res.data) {
                var data = res.data;
                if (data.ReturnCode == 0) {
                    console.log("risk result:" + data.Result);
                    var result = JSON.parse(data.Result);

                    if (result && result.ReturnCode == 1001) {
                        //需要风控验证码
                        var imgUrl = "data:image/gif;base64," + result.ImgCode;
                        self.setData({
                            imgCodeShow: 'display:block',
                            imgCodeUrl: imgUrl,
                            captchaID: result.CaptchaID,
                            signature: result.Signature
                        });
                        return;
                    }
                }
            }

            self.setData({
                imgCodeShow: 'display:none'
            });
        };
        var _fail = function (res) {
            self.setData({
                imgCodeShow: 'display:none'
            });

        }

        cwx.request(loginCommon.getGatewayRequestObj('risk/10261/SendMessageByPhone.json', data, _success, _fail))

    },

    sendVerifyCodeWithRiskControl: function () {
        var self = this;
        var errormsgtotal = "";
        var errorElement = {};
        console.log("发送动态密码");
        var mobilephone = self.inputContent["mobilephone"];
        if (mobilephone == undefined || mobilephone.trim().length == 0) {
            //隐藏提示框
            errormsgtotal = "请输入手机号";
            errorElement['mobilewarn'] = '1';
            self.errorMsgShow(errormsgtotal, 1, errorElement);
            return false;
        }
        var reg = /^1(3|4|5|7|8)\d{9}$/;
        if (!reg.test(mobilephone.trim())) {
            //隐藏提示框
            errormsgtotal = "手机号格式不正确";
            errorElement['mobilewarn'] = '1';
            self.errorMsgShow(errormsgtotal, 1, errorElement);
            return false;
        }

        var imgCode = self.inputContent["img_code_box"];

        if (self.data.imgCodeShow == 'display:block') {
            if (imgCode == undefined || imgCode.length == 0) {
                errormsgtotal = "请输入图片验证码";
                errorElement['imgcodewarn'] = '1';
                self.errorMsgShow(errormsgtotal, 1, errorElement);//todo
                return false;
            }
        }

        //send vcode
        var _success = function (res) {

            if (res && res.data && res.data.ReturnCode == 0) {
                var result = JSON.parse(res.data.Result);
                console.log("result:" + res.data.Result);

                if (result && result.ReturnCode == 0) {
                    self.timeCountDown();
					     return;
                }
                else if (result && result.ReturnCode == 201) {
                    errormsgtotal = "手机号格式不正确";
                    errorElement['mobilewarn'] = '1';
                }
                else if (result && result.ReturnCode == 301) {
                    errormsgtotal = "该手机号码发送超过次数限制";
                    errorElement['mobilewarn'] = '1';
                }
                else if (result && result.ReturnCode == 303) {
                    errormsgtotal = "60秒内不能重发";
                    errorElement['mobilewarn'] = '1';
                }
                else if (result && (result.ReturnCode == 1004 || result.ReturnCode == 1005)) {
                    errormsgtotal = "请输入正确的图片验证码";
                    errorElement['imgcodewarn'] = '1';
                } else if (result && result.ReturnCode == 1002) {
                    //长锁
                    errormsgtotal = "您的帐号已锁定,如有疑问请拨打客服电话！";

                } else if (result && result.ReturnCode == 1003) {
                    //短锁
                    errormsgtotal = "您的帐号已锁定,请30分钟后再试！";
                }
                else {
                    errormsgtotal = "发送失败";
                    errorElement['mobilewarn'] = '1';
                }
            }
            else {
                errormsgtotal = "发送失败";
            }

            if (errormsgtotal && errormsgtotal != "") {
                self.errorMsgShow(errormsgtotal, 1, errorElement);
            }
            self.getImageCode();

        };
        var _fail = function (res) {
            console.log("发送失败");
            console.log(res);
            errormsgtotal = "发送失败";
            self.errorMsgShow(errormsgtotal, 1, errorElement);
            return false;
        };
        var data = {
            "AccountHead": {
                "Signature": self.data.signature,
                "ImgCode": imgCode,
                "CaptchaID": self.data.captchaID
            },
            "Data": {
                "CountryCode": "86", "MobilePhone": mobilephone.trim(),
                "sendScene": "RegistCode", "CheckMobilePhoneNumber": "NoCheck",
                "Context": [{ "Key": "clientID", "Value": cwx.clientID }, { "Key": "Version", Value: '1.0' }, { "Key": "Url", "Value": 'accounts/login.wxml' }, { "Key": "Platform", "Value": 'WechatApp' }, { "Key": "page_id", "Value": self.pageId }]
            }
        };

        cwx.request(loginCommon.getGatewayRequestObj('soa2/10261/SendMessageByPhone.json', data, _success, _fail))


    }


});