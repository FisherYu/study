class CPage_Module_Base {
    constructor(options) {
        var _this = this;
        var c = 0;
        for (var key in options){
            if (options.hasOwnProperty(key)){
                switch (key){
                    case 'onLoad':
                    case 'onReady':
                    case 'onShow':
                    case 'onHide':
                    case 'onUnload':
                        this['__' + key] = options[key];
                        break;
                    default:
                        this[key] = options[key];
                        break;
                }
            }
        }

        var CPage = require('../ext/global.js').CPage;
		this.__isComponent = !!CPage.__isComponent;

        wrapLifeCycle(this, 'onLoad', true);
        wrapLifeCycle(this, 'onReady', false);
        wrapLifeCycle(this, 'onShow', false);
        wrapLifeCycle(this, 'onHide', false);
        wrapLifeCycle(this, 'onUnload', true);
    };
};

function wrapLifeCycle(cpage, type, isOnce){
    var __type = '__' + type;
    var fn = cpage[type];
    var invoked = false;
    cpage[type] = function(){
        var args = Array.prototype.slice.call(arguments, 0);
        if (!isOnce || isOnce && !invoked){
            invoked = true;
            if (type == 'onLoad'){
                cpage.__page = this;
                this.__cpage = cpage;
            }
            fn && fn.apply(cpage, args);
        }
        cpage[__type] && cpage[__type].apply(this, args); 
    };
}

module.exports = CPage_Module_Base;