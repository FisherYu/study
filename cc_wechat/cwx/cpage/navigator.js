var __global = require('../ext/global.js');
var cwx = __global.cwx;
var CPage = __global.CPage;

var navigatorUid = 0;
var navigatorOpts = {};

function getNavigatorUid() {
    return ++navigatorUid;
}

var pageStack = [];
var tabs = (function () {
    var ret = [];
    if (__wxConfig.tabBar && __wxConfig.tabBar.list) {
        ret = __wxConfig.tabBar.list.map(function (item) {
            return item.pagePath;
        });
    } else {
        ret = __global.tabbar;//安卓检测不到tabbar
    }
    return ret;
})();

function __getIndex(tabs, route) {
    var index = -1;
    for (var i = 0; i < tabs.length; i++) {
        var r = tabs[i];
        if (r.indexOf(route) != -1) {
            index = i;
            break;
        }
    }
    return index;
}

class CPage_Module_Navigator extends CPage.baseClass {
    constructor(options) {
        super(options);
    };
    onLoad(options) {
        try {
            //追加openid unionid
            options.openid = cwx.cwx_mkt.openid;
            options.unionid = cwx.cwx_mkt.unionid;
            cwx.mkt.setUnion(options);
        } catch (e) {
            console.log("CPage cwx.mkt.setUnion error = ", e);
        }
        if (pageStack.length == 1 && __getIndex(tabs, this.__page.__route__) != -1) {
            pageStack = [this.__page.__route__];
        } else {
            pageStack.push(this.__page.__route__);
        }

        var uid = null;
        delete this.__navigator_fromUid;
        if (options && options.hasOwnProperty('__navigator')) {
            uid = options.__navigator;
            delete options.__navigator;
            var opts = navigatorOpts[uid];
            if (opts) {
                // console.log( '__navigator_fromUid', uid );
                this.__navigator_fromUid = uid;
                options.data = opts.data;
            }
        }

        super.onLoad && super.onLoad(options);
        this.__navigator_isBack = false;
        this.__navigator_isBackFlag = false;
    };
    onShow() {
        super.onShow && super.onShow();

        if (this.hasOwnProperty('__navigator_isBackFlag')) {
            delete this.__navigator_isBackFlag;
        } else {
            this.__navigator_isBack = true;
        }

        if (this.__navigator_isBack) {
            if (pageStack.length == 1 && tabs.indexOf(this.__page.__route__) != -1) {
                pageStack = [this.__page.__route__];
            }
            var uid = this.__navigator_toUid;
            if (uid && navigatorOpts[uid]) {
                if (navigatorOpts[uid].callback) {
                    navigatorOpts[uid].backDatas.forEach((function (data) {
                        navigatorOpts[uid].callback.call(this.__page, data);
                    }).bind(this));
                }
                if (navigatorOpts[uid].navComplete) {
                    navigatorOpts[uid].navComplete.call(this.__page);
                }
                delete this.__navigator_toUid;
            }
        }
    };
    onUnload() {
        if (pageStack[pageStack.length - 1] == this.__page.__route__) {
            pageStack.pop();
        }
        // console.log('######################## onUnload pageStack:', cwx.util.copy(pageStack));
    };
    navigateTo(opts) {
        var uid = getNavigatorUid();
        var url = opts.url;

        var navOpts = {
            url: url + (/\?/.test(url) ? '&' : '?') + '__navigator=' + encodeURIComponent(uid),
            success: opts.success ? opts.success.bind(this.__page) : null,
            fail: opts.fail ? opts.fail.bind(this.__page) : null,
            complete: opts.complete ? opts.complete.bind(this.__page) : null
        };

        if (this.getPageLevel() >= 5) {
            var err = {
                error: '页面层级超过5层',
                errorCode: '500'
            };
            console.log("CPage.navigateTo :", err, url);
            // console.log( "CPage.stack :", this.getPageStack() );

            navOpts.fail && navOpts.fail(err);
            navOpts.complete && navOpts.complete(err);
            return;
        }

        navigatorOpts[uid] = {
            data: opts.data,
            immediateCallback: opts.immediateCallback ? opts.immediateCallback.bind(this.__page) : null,
            callback: opts.callback ? opts.callback.bind(this.__page) : null,
            navComplete: opts.navComplete ? opts.navComplete.bind(this.__page) : null,
            backDatas: []
        };

        this.__navigator_toUid = uid;
        cwx.navigateTo(navOpts);
    };
    navigateBack(data) {
        var uid = this.__navigator_fromUid;
        if (uid && navigatorOpts[uid] && arguments.length > 0) {
            navigatorOpts[uid].backDatas.push(data);
            navigatorOpts[uid].immediateCallback && navigatorOpts[uid].immediateCallback(data);
        }
        cwx.navigateBack();
    };
    invokeCallback(data) {
        var uid = this.__navigator_fromUid;
        if (uid && navigatorOpts[uid]) {
            navigatorOpts[uid].backDatas.push(data);
            navigatorOpts[uid].immediateCallback && navigatorOpts[uid].immediateCallback(data);
        }
    };
    getPageStack() {
        return cwx.util.copy(pageStack);
    };
    getPageLevel() {
        return this.getPageStack().length;
    }
};

module.exports = CPage_Module_Navigator;
