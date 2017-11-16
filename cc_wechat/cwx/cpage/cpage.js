var cwx = require('../ext/global.js').cwx;

var instanceId = 0;

var CPage = function (options) {
    if (CPage.__isComponent) {
        var copyOptions = cwx.util.copy(options);
        CPage.createInstance(copyOptions);
    } else {
        var pageData = {
            onLoad: function () {
                var _this = this;
                var args = Array.prototype.slice.call(arguments, 0);

                var copyOptions = cwx.util.copy(options);
                var ins = CPage.createInstance(copyOptions);

                for (var k in ins) {
                    if (ins.hasOwnProperty(k)) {
                        if (k == 'data') {
                            this.data = ins[k];
                            this.setData(ins[k]);
                        } else if (
                            k == '__cpage' ||
                            k.indexOf('__') != 0 ||
                            copyOptions.hasOwnProperty(k)) {

                            _this[k] = ins[k];
                        }
                    }
                }

                var t = ins.__proto__;

                while (t && t != Object.prototype) {
                    Object.getOwnPropertyNames(t).forEach(function (k) {
                        if (k != 'constructor' && k != '__proto__') {
                            if (k.indexOf('__') != 0) {
                                if (cwx.util.type(t[k]) == 'function') {
                                    if (ins[k] === t[k]) {
                                        _this[k] = t[k].bind(ins);
                                    }
                                } else {
                                    _this[k] = t[k];
                                }
                            }
                        }
                    });

                    t = t.__proto__;
                }

                this.onLoad.apply(this, args);
            }
        }

        if (options.data) {
            pageData.data = cwx.util.copy(options.data);
            delete options.data;
        }
        //wrap onShareAppMessage
        if (options.onShareAppMessage) {
            try {
                var onShareAppMessage = options.onShareAppMessage;
                var wrapOnShareAppMessage = function () {
                    var shareData = onShareAppMessage.call(this);
                    //添加埋点
                    if (this.ubtTrace) {
                        var ubtData = cwx.util.copy(shareData);
                        this.ubtTrace('wxshare', ubtData)
                    }
                    var mkt = cwx.mkt.getShareUnion();
                    var path = shareData.path;
                    mkt = (path.indexOf('?') != -1 ? "&" : "?") + mkt;
                    shareData.path += mkt;
                    return shareData;
                }
                pageData.onShareAppMessage = wrapOnShareAppMessage;
                delete options.onShareAppMessage
            } catch (e) {
                console.log('wrapOnShareAppMessage error');
            }
        }
        Page(pageData);
    }



    // Page(pageOptions);
    // __global.__Page(pageOptions);
};

CPage.__isComponent = 0;
CPage.__cache = [];

CPage.createInstance = function (options) {
    var a = CPage.__isComponent;
    var ins = new CPage.baseClass(options);
    ins.__instanceId = instanceId++;

    var b = CPage.__isComponent;

    if (CPage.__isComponent) {
        CPage.__cache[CPage.__isComponent] = {
            id: ins.__instanceId,
            options: options,
            instance: ins
        };
    }

    return ins;
};


CPage.baseClass = require('./base.js');

CPage.modules = {
    'UBT': function () {
        return require('./ubt.js');
    },
    'Navigator': function () {
        return require('./navigator.js');
    }
};

CPage.use = function (subClass) {
    if (cwx.util.type(subClass) == 'string') {
        var fn = CPage.modules[subClass];
        if (cwx.util.type(fn) == 'function') {
            subClass = fn();
        } else {
            throw 'Unknow CPage module ' + subClass;
        }
    }
    if (cwx.util.type(subClass) == 'function') {
        CPage.baseClass = subClass;
        //        console.log('Load CPage module: ' + (subClass.name || 'Unknown'));
    } else {
        throw 'CPage module only support class';
    }
};

// __global.__Page = __global.Page; 
// __global.Page = CPage;

// __global.CPage = CPage;

module.exports = CPage;
