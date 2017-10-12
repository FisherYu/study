(function($) {
    var e = "countdown"
      , i = e + "Opt"
      , n = e + "Instance"
      , CountDown = function(t, e) {
        this.element = t,
        this._init(e)
    };
    CountDown.prototype = {
        version: "1.0.0",
        playID: -1,
        node: "",
        dayPer: 864e5,
        hourPer: 36e5,
        minutePer: 6e4,
        _init: function(e) {
            var i = 0
              , n = this;
            this.requestAnimationFrame = function(t, e) {
                var now = (new Date).getTime()
                  , a = Math.max(0, 16.7 - (now - i));
                console.log('a: ' + a)
                var r = window.setTimeout(function() {
                    t(now + a)
                }, 1e3);
                i = now + a; 
                return r;
            }

            this.cancelAnimationFrame = function(t) {
                clearTimeout(t)
            }

            var a = this.element
              , r = this._getSettings(a)
              , o = r ? r : $.fn.countdown.defaults;
            r = $.extend({}, o, e),
            n._setSettings(a, r),
            n._startHandler()
        },
        _startHandler: function() {
            function t() {
                var a = (new Date).getTime();
                if (e.timeSec - a <= 0)
                    e._stopHandler(),
                    n.endCallback && n.endCallback();
                else {
                    var r = e._getTimeStr(a, n);
                    n.newFormat && (r = e._newTimeFormat(r)),
                    i.text(r),
                    n.handleData && n.handleData()
                }
                e.playID = e.requestAnimationFrame(t)
            }
            var e = this
              , e = this
              , i = this.element
              , n = e._getSettings(i)
              , a = n.type
              , remain = 0;
            if ("timeRemain" == a)
                remain = n.timeRemain;
            else if ("normal" == a) {
                var o = new Date(n.startTime).getTime()
                  , s = new Date(n.endTime).getTime();
                remain = parseInt(s - o)
            }
            var l = (new Date).getTime();
            e.timeSec = 1 * remain + l;
            var d = e._getTimeStr(e.timeSec, n);
            n.newFormat && (d = e._newTimeFormat(d)),
            i.text(d),
            t()
        },
        _getTimeStr: function(t, e) {
            var i = this
              , n = i.timeSec - t
              , a = parseInt(n / 1e3)
              , r = a % 60;
            a = parseInt(a / 60);
            var o = a % 60;
            a = parseInt(a / 60);
            var s = a % 24;
            a = parseInt(a / 24);
            var l, d = a, c = i._getNumFormat(s), u = i._getNumFormat(o), p = i._getNumFormat(r), f = i._getNumFormat(d);
            return l = e.hasDateInfo ? f + ":" + c + ":" + u + ":" + p : c + ":" + u + ":" + p
        },
        _newTimeFormat: function(t) {
            var e = t.split(":");
            return e instanceof Array && e.length && (t = e[0] > 0 ? e[0] + "天" + e[1] + "时" + e[2] + "分" : e[1] + "时" + e[2] + "分" + e[3] + "秒"),
            t
        },
        _getNumFormat: function(t) {
            var e = t < 10 ? "0" + t : t;
            return e
        },
        _getSettings: function(t) {
            return t.data(i)
        },
        _setSettings: function(t, e) {
            t.data(i, e)
        },
        _stopHandler: function() {
            var t = this;
            this.cancelAnimationFrame(t.playID),
            t.playID = -1
        },
        start: function(t) {
            var e = this;
            e.destroy(),
            e._startHandler()
        },
        newCountdown: function(t) {
            var e = this;
            e.destroy(),
            e.playID = -1,
            e._init(t)
        },
        stop: function() {
            var t = this;
            t._stopHandler()
        },
        destroy: function(e) {
            var i = this
              , n = this.element
              , a = i._getSettings(n);
            e && (a = t.extend({}, a, e)),
            i._stopHandler(),
            i.playID = -1,
            a.type = "",
            a.startTime = "",
            a.endTime = "",
            a.timeRemain = "",
            a.handleData = null,
            a.endCallback = null
        }
    };
    var countDownManagement = {
        init: function(e) {
            this.each(function() {
                var i = $(this);
                i.data(n) || i.data(n, new CountDown(i,e))
            })
        },
        instance: function() {
            var e = [];
            return this.each(function() {
                e.push(t(this).data(n))
            }),
            e
        },
        newCountdown: function(e) {
            var i = t(this)
              , a = i.data(n);
            a && a.newCountdown(e)
        },
        start: function() {
            var e = t(this)
              , i = e.data(n);
            i && i.start()
        },
        stop: function() {
            var e = t(this)
              , i = e.data(n);
            i && i.stop()
        },
        destroy: function(e) {
            var i = t(this)
              , a = i.data(n);
            a && a.destroy(e)
        }
    };
    $.fn.countdown = function() {
        var t = arguments[0];
        if (countDownManagement[t]) {
            if (!this.data(n))
                return void console.error("please init countdown first");
            t = r[t],
            arguments = Array.prototype.slice.call(arguments, 1)
        } else {
            if ("object" != typeof t && t)
                return console.error("Method " + t + " does not exist on zepto.tab"),
                this;
            t = countDownManagement.init
        }
        return t.apply(this, arguments)
    };
    $.fn.countdown.defaults = {
        type: "timeRemain",
        startTime: "",
        endTime: "",
        timeRemain: "",
        newFormat: !1,
        hasDateInfo: !0,
        handleData: null,
        endCallback: null
    };

    return CountDown
})($)
