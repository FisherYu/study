var __global = require('../ext/global.js');
var cwx = __global.cwx;
var CPage = __global.CPage;

var ubt_cwx = require('./ubt_wx.js');

class CPage_Module_UBT extends CPage.baseClass {
    constructor (options){
        var newOptions = {};
        var _this;


        for (var key in options){
            if (options.hasOwnProperty(key)){
                switch (key){
                    case 'ubtTrack':
                    case 'ubtMetric':
                    case 'ubtTrace':
                        break;
	                case 'onLoad':
                    case 'onReady':
                    case 'onShow':
                    case 'onHide':
                    case 'onUnload':
                        newOptions[key] = eventWrapper(key, options[key], false);
                        break;
                    default:
                        if (!CPage.__isComponent && cwx.util.type(options[key]) == 'function'){
                            newOptions[key] = eventWrapper(key, options[key], true);
                        }else{
                            newOptions[key] = options[key];
                        }
                        break;
                }
            }
        }

        newOptions.ubtTrack = eventWrapper('ubtTrack', null, true);

        super(newOptions);
        _this = this;
        
        //= 创建PV
        this.__ubt_instance = ubt_cwx.createPV();

        this.__ubt_events = {};

        function eventWrapper(name, fn, isLogEvent){
            return function(evt){
                if (isLogEvent && _this.__ubt_isEvent(arguments)){
                    _this.__ubt_logTap(evt,name);
                }
                var args = Array.prototype.slice.call(arguments, 0);
                var ret;
                if (fn){
                    try{
                        ret = fn.apply(_this.__page, args);
                    }catch(e){
                        // 错误数据收集
                        try{
                            if(typeof e == 'string'){
                                e = new Error(e);
                            }

                            var obj = {
                                message:  e && e.message,
                                file: 0,
                                category: 'inner-error',
                                framework: 'normal',
                                time: 0,
                                line: 0,
                                column: 0,
                                stack: e && e.stack && e.stack.split('\n'),
                                repeat: 1
                            }

                            _this.__ubt_instance.send('error', obj);
                        }
                        catch(e){};

                        if(cwx.util.isDevice()) {
                            setTimeout(function(){
                                throw e;
                            }, 0);
                        }else{
                            throw e;
                        }
                    }
                }
                return ret;
            };
        }
    };

    onLoad (options){
        super.onLoad && super.onLoad(options);

		// active
        this.__ubt_totalActiveTime = 0;

        // loadTime
        this.__ubt_onLoadTime = +new Date();
        this.__ubt_isBack = false;
        this.__ubt_isBackFlag = false;
    };

    onReady (){
        super.onReady && super.onReady();

		// active
        if (!this.__ubt_isBack){
            this.__ubt_onActiveTime = +new Date();
        }

        // log ps
        var ubtPs = this.__ubt_getPageInfo();

        ubtPs.readyTime = +new Date() - this.__ubt_onLoadTime;
		if (!this.__isComponent){
			if (cwx.config.ubtDebug){
				console.log('UBT Page Performance', ubtPs);
			}
            this.__ubt_instance.send('metric', {
                name: 100359,       //perf.weixin.ready
                value: ubtPs.readyTime
            });
		}
    };

    onShow (){
		super.onShow && super.onShow();

        // back
        if (this.hasOwnProperty('__ubt_isBackFlag')){
            delete this.__ubt_isBackFlag;
        }else{
            this.__ubt_isBack = true;
        }

        // active
        if (this.__ubt_isBack){
            this.__ubt_onActiveTime = +new Date();
        }

        // log pv
        var ubtPv = this.__ubt_getPageInfo();
        ubtPv.isBack = this.__ubt_isBack;
        ubtPv.url = ''+ this.__page.__route__;

		if (!this.__isComponent){
			if (cwx.config.ubtDebug){
				console.log('UBT Pageview', ubtPv);
			}
			
            //=发送PV数据，包含是否需要生成新PV的逻辑
            this.__ubt_instance = this.__ubt_instance.send('pv', ubtPv);  
		}
    };

    onHide (){
        super.onHide && super.onHide();

        // active
        this.__ubt_totalActiveTime += +new Date() - this.__ubt_onActiveTime;
    };

    onUnload (){
        super.onUnload && super.onUnload();

        // log active
        this.__ubt_totalActiveTime += +new Date() - this.__ubt_onActiveTime;

		if (!this.__isComponent){
			// this.ubtTrace('ActiveTime', this.__ubt_totalActiveTime);
            this.__ubt_instance.send('metric', {
                name: 100370,   //perf.weixin.ActiveTime
                value: this.__ubt_totalActiveTime
            })
		}
    };

    __ubt_isEvent (args){
        var evt = args[0];
        var ret = args.length == 1
            // && !args.callee.caller
            && evt
            && evt.timeStamp
            && (evt.type == 'tap' || evt.type == 'longtap')
            && !this.__ubt_events.hasOwnProperty(evt.type + '_' + evt.timeStamp)
            && evt.touches
            && evt.touches[0]
            && evt.target
            && evt.currentTarget;
        return !!ret;
    };

    __ubt_getPageInfo (){
        var ret = {};
		if (this.__isComponent){
			var ins = this.__page;
			while (!ins.__isComponent){
				ins = ins.__page;
			}
			ret.pageId = '' + (ins.pageId || ins.pageid || '0');
		}else{
			ret.pageId = '' + (this.pageId || this.pageid || '0');
		}
        return ret;
    };

    __ubt_logTap (evt, fn){
        var _this = this;
        var key = evt.type + '_' + evt.timeStamp;
        this.__ubt_events[key] = true;
        setTimeout(function(){
            delete _this.__ubt_events[key];
        }, 1000);
        var ubtEvt = this.__ubt_getPageInfo();
        ubtEvt.type = evt.type;
        ubtEvt.xpath = '//Page';
        // currentTarget
        if (!cwx.util.compare(evt.currentTarget, evt.target)){
            ubtEvt.xpath += '/CurrentTarget';
            var currentTargetId = evt.currentTarget.id;
            if (currentTargetId){
                ubtEvt.xpath += '[@id=' + currentTargetId + ']';
            }
            var currentTargetCid = evt.currentTarget.dataset['ubtKey'];
            if (currentTargetCid){
                ubtEvt.xpath += '[@cid=' + currentTargetCid + ']';
            }
        }
        // target
        ubtEvt.xpath += '/Target';
        var targetId = evt.target.id;
        if(typeof fn === 'string'){
            ubtEvt.xpath += '[@fn=' + fn + ']';
        };
        if (targetId){
            ubtEvt.xpath += '[@id=' + targetId + ']';
        }
        var targetCid = evt.target.dataset['ubtKey'];
        if (targetCid){
            ubtEvt.xpath += '[@cid=' + targetCid + ']';
        }
        ubtEvt.xpath += '[@x=' + evt.touches[0].pageX + ']';
        ubtEvt.xpath += '[@y=' + evt.touches[0].pageY + ']';

		if (cwx.config.ubtDebug){
			console.log('UBT Page Event', ubtEvt);
		}

        this.__ubt_instance.send('useraction', {
			action: 'click',
			ts: +new Date(),
			xpath: ubtEvt.xpath
		});
    };


    ubtTrace (name, value){
		var valueStr = '';
		switch (cwx.util.type(value)){
			case 'string':
			case 'number':
				valueStr = value;
				break;
			default:
				valueStr = JSON.stringify(value);
				break;
		}
		if (cwx.config.ubtDebug){
			var ubtTrace = this.__ubt_getPageInfo();
			ubtTrace.traceName = name;
			ubtTrace.traceValue = valueStr;
			console.log('UBT Page Trace', ubtTrace);
		}
        this.__ubt_instance.send('tracelog', {
			name: name,
			value: valueStr
		});
        
    };

    ubtMetric(option){
        this.__ubt_instance.send('metric', option || {});
    }
};

var UBT = {};

__global.UBT = UBT;

module.exports = CPage_Module_UBT;