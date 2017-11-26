import { cwx, CPage } from '../../../cwx/cwx.js';

var Card = require('../unicorn/card/factory.js');
var expansion = require('../unicorn/skyrim/expansion.js');
var Model = require('../unicorn/components/model.js');
var common = require('../unicorn/components/common.js');

var isReady = false; // 第一次判断登录态在ready中执行

CPage({
    data: {
        userInfo: {
            userName: '尊敬的会员',
            hasBg: true
        },
        orderItems: [],
        isFailed: false, // 数据加载失败
        isLoading: false, // 是否在加载中
        isNoneOrder: false, // 是否暂无订单
        isNoMoreOrder: false, // 是否没有更多订单了

        isNoNeedLogin: false // 是否需要登录
        // isPullDownRefresh: false // 是否在下拉刷新中
    },
    // 订单列表页属性
    params: {
        pageNum: 1,
        totalPage: 0,
        modelParam: {
            "PageSize": 15,
            "BizTypes": "Flight,Hotel,Train,QiChe",//,Piao",
            "OrderStatusClassify": "All",
            "PageIndex": 1
        }
    },
    pageId: 10320613208, // pageId埋点
    onLoad: function () {
        expansion.init();

        // var self = this;
        // cwx.getSystemInfo({
        //     success: function (data) {
        //         if (data && data.windowHeight) {
        //             self.setData({
        //                 // 设备高度
        //                 windowH: data.windowHeight + 'px'
        //             });
        //         }
        //     }
        // });
    },
    loadListInfo: function () {
        // 先走callback，若不需要判断登录态，即回到首页时，阻止后续
        if (this.data.isNoNeedLogin) {
            this.data.isNoNeedLogin = false;
            return;
        }

        var self = this;

        common.user.checkLogin(function (isLogin) {
            if (isLogin) {
                self.setData({
                    'isNeedLoadingMask': false // 是否需要蒙层loading
                });
                // get order
                self.params.pageNum = 1;
                self.data.orderItems = [];
                self.getOrderData();

                // get user's info
                self.getUserInfo();
            }
            // 20161111 未登录情况下不直接跳转登录页面，在当前页面让用户自己选择跳登录页
            else {
                // self.login();
                self.setData({
                    'userInfo.isUnLogin': true,
                    'isNeedLoadingMask': false
                });
            }
        });
    },
    onShow: function () {
        // 第一次执行在onReady中执行，微信渲染问题
        if (isReady) {
            this.loadListInfo();
        }
    },
    onReady: function () {
        isReady = true;
        this.loadListInfo();
    },
    onHide: function () {
    },
    onUnload: function () {
    },
    onTopPull: function () {
        if (this.data.isLoading) {
            return;
        }
        // this.data.isPullDownRefresh = true;
        this.params.pageNum = 1; // 重设页码
        this.data.orderItems = [];
        this.setData({
            isLoading: true,
            isNoneOrder: false,
            isNoMoreOrder: false
        });
        this.getOrderData();
    },
    onBottomPull: function () {
        if (this.data.isLoading || this.data.isNoMoreOrder) {
            return;
        }
        this.getOrderData();
    },
    login: function () {
        // var self = this;
        // common.user.login({
        //     callback: function (data) {
        //         if (data && data.ReturnCode == -1) {
        //             self.data.isNoNeedLogin = true;
        //             //cwx.util.goHome();
        //             cwx.redirectTo({
        //                 url: '/pages/home/homepage'
        //             });
        //         }
        //     }
        // });
        
        common.user.login();
    },
    getOrderData: function () {
        var self = this;

        this.params.modelParam.PageIndex = this.params.pageNum; // 重设页码

        //if (!this.data.isPullDownRefresh) {
        //    this.data.isLoading = true;
        //    this.showLoading();
        //}

        this.data.isLoading = true;

        // 20161116 使用loading蒙层
        // this.showLoading();

        var orderModel = new Model({
            url: '/restapi/soa2/10098/GetOrdersSearch.json',
            params: self.params.modelParam,
            callbacks: {
                onSuccess: function (data) {
                    self.data.isFailed = false;
                    self.filterOrderData(data);
                },
                onError: function (err) {
                    self.data.isFailed = true;
                    self.showError(err);
                },
                onComplete: function (data) {
                    self.complete(data);
                }
            }
        });

        orderModel.execute();
    },
    filterOrderData: function (data) {
        if (data && data.Result && data.Result.ResultCode === 0) {
            this.sortPageNum(data);
            this.renderList(data);
        } else if (data && data.Result && (data.Result.ResultCode === -1 || data.Result.ResultCode === -4)) {
            this.sortAuthInvalid();
        } else {
            this.showError();
        }
    },
    showError: function (err) {
    },
    sortAuthInvalid: function () {
        // 没登录态，去登录
        this.login();
    },
    sortPageNum: function (data) {
        if (this.params.pageNum === 1) {
            this.params.totalPage = Math.ceil(data.TotalCount / this.params.modelParam.PageSize); // 计算总页数
        }

        this.data.isNoneOrder = this.params.pageNum === 1 && this.params.totalPage <= 0;
        this.data.isNoMoreOrder = this.params.pageNum >= this.params.totalPage;
    },
    renderList: function (data) {
        var items = data && data.OrderEnities || [];

        if (items.length) {
            var temp = [];
            for (var i = 0, len = items.length; i < len; i++) {
                temp.push(Card.getRenderData(items[i]));
            }

            this.setData({
                orderItems: this.data.orderItems.concat(temp)
            });

            this.params.pageNum++;
        }
    },
    complete: function () {
        // this.data.isLoading = false;

        // 20161116 使用loadingloading蒙层
        // this.hideLoading();

        // complete统一设置
        this.setData({
            isLoading: false,
            isFailed: this.data.isFailed,
            isNoneOrder: this.data.isNoneOrder,
            isNoMoreOrder: this.data.isNoMoreOrder,
            'userInfo.hasBg': !this.data.isNoneOrder
        });
        // cwx.stopPullDownRefresh();
        // this.data.isPullDownRefresh = false;
    },
    getUserInfo: function () {
        var self = this;
        var userInfoModel = new Model({
            url: '/restapi/soa2/10098/GetMemberSummaryInfo.json',
            callbacks: {
                onSuccess: function (data) {
                    var userName = data && data.UserName || '尊敬的会员';

                    self.setData({
                        'userInfo.userName': userName,
                        'userInfo.isUnLogin': false
                    });
                    //cwx.setNavigationBarTitle({
                    //    title: userName
                    //});
                },
                onError: function (err) {
                    // ...
                }
            }
        });

        userInfoModel.execute();
    },
    showLoading: function () {
        cwx.showToast({
            title: '加载中...',
            icon: 'loading',
            duration: 10000
        });
    },
    hideLoading: function () {
        cwx.hideToast();
    },
    /******************* clicks *******************/
    cardClick: function (e) {
        var oid = e.currentTarget.dataset.oid || '';
        var url = Card.getActionData(oid).ActionURLH5 || '';

        if (url.length && url.indexOf('pages') === 0) {
            url = '/' + url; // 兼容下发链接为 page/ 的链接，修改成 /pages
        }

        if (url) {
            this.navigateTo({
                url: url
            });
        }
    },
    retry: function () {
        this.params.pageNum = 1; // 重设页码
        this.data.orderItems = [];
        this.getOrderData();
    },
    logout: function () {
        var self = this;
        
        common.user.logout(function () {
            self.setData({
                'isNeedLoadingMask': true
            });
            //cwx.util.goHome();
            cwx.switchTab({
                url: '/pages/home/homepage'
            });
        });
    },
    goToLogin: function () {
        var self = this;

        // 去登录页面时加上loading蒙层
        self.setData({
            'isNeedLoadingMask': true
        });

        self.login();
    },
    makeCall: function () {
        cwx.makePhoneCall({
            phoneNumber: '4006125929'
        });
    }
});