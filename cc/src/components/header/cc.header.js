/**
 * Created by q_yao on 2017/4/19.
 */
define(['text!components/header/cc.header.html'], function(tpl){
    var defaultFromRgba = {r : 0, g : 0, b : 0, a : 0},
        defaultToRgba = {r : 9, g : 159, b : 222, a : 1},
        defaultStep = 100;

    function toRgbStr(rgba){
        return ['rgba(', [rgba.r, rgba.g, rgba.b, rgba.a].join(','), ')'].join('');
    }

    function toGradientRgbStr(rgbaList) {
        var rgbStrList = _.map(rgbaList||[], function(rgba){
            return toRgbStr(rgba);
        });
        return ['-webkit-linear-gradient(top,', rgbStrList.join(','), ')'].join('');
    }

    return {
        template: tpl,
        data: function() {
            return {
                style: {
                    background: ''
                }
            }
        },
        mounted: function() {
            this.init();
        },
        methods: {
            resetPropery: function() {
                this.template = tpl;
                this.datamodel = {
                    title: '', // 标题
                    initialRgbaStr: '',
                    rights: [], // 右侧按钮
                };
                this.onBack = function(){};
                this.autoScroll = true; //是否需要渐变,自行监听scroll
                this.fromRgba = null;
                this.toRgba = null;
                this.view = null;
                this.step = defaultStep;// 渐变步长
                this.relayoutTopHeaderInIos = function(){};//默认不调整topheader在ios中的位置(包括top header是一张背景图片时)
               
                var eventNs = '.header';
                var eventNameScroll = 'scroll' + eventNs;
                var eventNameTouchmove = 'touchmove' + eventNs;

                if(!this.fromRgba) {
                    this.fromRgba = [$.extend({}, defaultFromRgba), $.extend({}, defaultFromRgba)];
                }
                if(!this.toRgba) {
                    this.toRgba = [$.extend({}, defaultToRgba), $.extend({}, defaultToRgba)];
                }
                this.datamodel.initialRgbaStr = toGradientRgbStr(this.fromRgba);
                var toRgba = this.toRgba;
                this.rgbaDelta = _.map(this.fromRgba, function(fromRgba, index){
                    return {
                        r: toRgba[index].r - fromRgba.r,
                        g: toRgba[index].g - fromRgba.g,
                        b: toRgba[index].b - fromRgba.b,
                        a: toRgba[index].a - fromRgba.a
                    }
                });
            },
            init: function() {
                var self = this;
                // Fix Issues: IOS & Hybrid中隐藏头部会同时顶到手机最顶层
                if(Lizard.app.vendor.is('CTRIP') && $.os.ios) {
                    this.headerWrap.css('padding-top', '20px');
                    if($.isFunction(this.relayoutTopHeaderInIos)) {
                        this.relayoutTopHeaderInIos(this.view);
                    } else {
                        this.relayoutTopHeaderInIos.css('padding-top', '20px');
                    }
                }
                if(this.autoScroll){
                    var callback = _.throttle(function(){
                        self.updateHeader(window.scrollY);
                    }, 50);
                    this.view.$el.off(eventNs).on(eventNameTouchmove, callback);
                    $(document).off(eventNs).on(eventNameScroll, callback);
                }
            },
            updateHeader: function(walked) {
                var per = Math.min(walked / this.step, 1);
                var rgbaDelta = this.rgbaDelta;
                var newRgba = _.map(this.fromRgba, function(fromRgba, index){
                    return {
                        r: parseInt(rgbaDelta[index].r * per + fromRgba.r),
                        g: parseInt(rgbaDelta[index].g * per +  fromRgba.g),
                        b: parseInt(rgbaDelta[index].b * per +  fromRgba.b),
                        a: rgbaDelta[index].a * per +  fromRgba.a
                    }
                })
                this.headerWrap.css('background', toGradientRgbStr(newRgba));
            }
        }
    };
})