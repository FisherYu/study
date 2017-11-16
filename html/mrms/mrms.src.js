var RMS = RMS ? RMS : function () {

    var hurl = location.protocol + "//cdid.c-ctrip.com/model-poc2/h", //servlet提交的url
        wurl = location.protocol.replace("http", "ws") + "//cdid.c-ctrip.com/model-poc2/w", //websocket的url
        submiting=false; //当用iframe提交的时候用到的变量
    var serverName = location.protocol+"//"+location.host;

    function int2iP(num){
        var str;
        var tt = new Array();
        tt[0] = (num >>> 24) >>> 0;
        tt[1] = ((num << 8) >>> 24) >>> 0;
        tt[2] = (num << 16) >>> 24;
        tt[3] = (num << 24) >>> 24;
        str = String(tt[0]) + "." + String(tt[1]) + "." + String(tt[2]) + "." + String(tt[3]);
        return str;
    }

    var log = function(s) {
        // console.log(s);
    }

    var randomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    'use strict';
    var cors = (function() {
        var win = window,
            CORSxhr = (function () {
                var xhr;
                if (win.XMLHttpRequest && ('withCredentials' in new win.XMLHttpRequest())) {
                    xhr = win.XMLHttpRequest;
                } else if (win.XDomainRequest) {
                    xhr = win.XDomainRequest;
                }
                return xhr;
            }()), methods = ['head', 'get', 'post', 'put', 'delete'], cors = {};

        function Request(options) {
            this.init(options);
        }

        Request.prototype.init = function (options) {
            var that = this;
            that.xhr = new CORSxhr();
            that.method = options.method;
            that.url = options.url;
            that.success = options.success;
            that.error = options.error;
            try { //IE某些版本下有问题
                that.xhr.timeout = 2000; // 毫秒数
                that.xhr.ontimeout = function (e) {};
                if (options.credentials === true) {
                    that.xhr.withCredentials = true;
                }
            }catch(e){}
            var sendData = (options.params)?options.params:options.data;
            that.headers = options.headers;
            that.send(sendData);
            return that;
        };

        Request.prototype.send = function (data) {
            var that = this;
            if (that.success !== undefined) {
                that.xhr.onload = function () {
                    that.success.call(this, this.responseText);
                };
            }
            if (that.error !== undefined) {
                that.xhr.error = function () {
                    that.error.call(this, this.responseText);
                };
            }
            that.xhr.open(that.method, that.url, true);
            if (that.headers !== undefined) {
                that.setHeaders();
            }
            if(data)
                that.xhr.send(data);
            else
                that.xhr.send();
            return that;
        };

        Request.prototype.setHeaders = function () {
            var that = this,
                headers = that.headers,
                key;
            try {
                for (key in headers) {
                    if (headers.hasOwnProperty(key)) {
                        that.xhr.setRequestHeader(key, headers[key]);
                    }
                }
            }catch(e){}
            return that;
        };

        for (var i=0; i < methods.length; i++) {
            (function () {
                var method = methods[i];
                cors[method] = function (url, success) {
                    var options = {};
                    if (url === undefined) {
                        throw new Error('CORS: url must be defined');
                    }
                    if (typeof url === 'object') {
                        options = url;
                    } else {
                        if (typeof success === 'function') {
                            options.success = success;
                        }
                        options.url = url;
                    }
                    options.method = method.toUpperCase();
                    return new Request(options).xhr;
                };
            }());
        }
        return cors;
    })();

    var isUseIframe = function(){
        var isIe = /*@cc_on!@*/false || !!document.documentMode;
        return isIe && document.documentMode && document.documentMode<10;
    }

    var submit_ = function (url, key, value) {
        if(submiting) { //IE8下不起作用，先注释掉
            return setTimeout(function(){
                submit_(url, key, value);
            }, 30);
        }
        submiting = true;
        if(!isUseIframe()){
            var params = key+"="+value + "&serverName="+serverName;
            cors.post({
                'url':  url,
                'credentials': true,
                'params': params,
                'method': 'post',
                "headers": {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                'success': function (data) {
                    submiting = false;
                    if(data) {
                        log(data);
                    }
                },
                'error': function () {
                    log("cors error");
                    submiting = false;
                }
            });
        }
    }

    var init = false;

    return {
        init: function (options) {
            if(init){
                return;
            }
            init = true;
            options = options?options:{};
            var initTime = new Date();
            var _this = this;

            window.__bfi = window.__bfi || [];

            window.__bfi.push(['_getFP', function (value) {
                _this.fp = value;
            }, false]);

            window.__bfi.push(['_getStatus', function(data){
                _this.vid = data.vid;
            },false]);

            window.__bfi.push(['_getPageid', function (err, pageId) {
                if (!err && pageId) {
                    //调试的时候可以直接传pageId
                    if(!options.pageId){
                        //pageId返回是number改成string，不然无法匹配
                        options.pageId = pageId+"";
                    }
                }
                _this.pageId = pageId;
            }]);

            var domainRegexp = /^https?:\/\/((global\.secure\.ctrip\.com)|(secure\.ctrip\.com\.hk)|(m\.ctrip\.com)|(secure\.ctrip\.com)|(secure\.ctrip\.sg)|(secure\.ctrip\.my)|(secure\.ctrip\.co.kr))/;
            if(window && window.location){
                var matchDomain = domainRegexp.exec(window.location);
                if (matchDomain && matchDomain.length > 1) {
                    //load device info
                    (function () {
                        var url = '//webresource.c-ctrip.com/resaresonline/risk/ubtrms/md.min.469c22f3.js', timeout = 10;
                        setTimeout(function () {
                            var f = document.createElement('script')
                            f.type = 'text/javascript';
                            f.id = 'rmsd__script';
                            f.async = true;
                            f.src = ('https:' == document.location.protocol ? 'https:' : 'http:') + url;
                            var s = document.getElementsByTagName('script')[0];
                            s.parentNode.insertBefore(f, s);
                        }, timeout);
                        window.rmsd__startScriptLoad = 1 * new Date();
                    })();
                }
            }

            var initRmsbfi = function () {
                var rmsbfi = window['__rmsbfi'] || [];
                var _push = rmsbfi.push = function () {
                    var args = arguments, err = 0, len = args.length;
                    for (var i = 0; i < len; i++) {
                        try {
                            if (typeof args[i] === "function") {
                                args[i]();
                            } else if (Object.prototype.toString.call(args[i]) === '[object Array]') {
                                if (args[i].length != 2) {
                                    continue;
                                }
                                var func = args[i][0];
                                var callback = args[i][1];
                                if (typeof func === "string" && func === "_getRmsToken" && typeof callback === "function") {
                                    callback(RMS.getRmsToken());
                                }
                            }
                        }
                        catch (e) {
                            err++;
                        }
                    }
                    return err;
                }
                window['__rmsbfi'] = rmsbfi;
                while (rmsbfi.length > 0) {
                    _push(rmsbfi.shift());
                }
            };
            initRmsbfi();
        },
        getRmsToken: function () {
            var result = "fp=" + (this.fp ? this.fp : '');
            result += "&vid=" + (this.vid ? this.vid : '');
            result += "&pageId=" + (this.pageId ? this.pageId : '');
            var rguidMatch = /\_RGUID=([a-z0-9\-]+)(;|$)/.exec(document.cookie);
            var guidMatch = /guid\_\_=([a-z0-9\-]+)(;|$)/.exec(document.cookie);
            if (rguidMatch && rguidMatch.length > 1) {
                var r= rguidMatch[1].replace(/\-/g,"");
                result += "&r=" + r;
            } else if(guidMatch && guidMatch.length > 1){
                var r= guidMatch[1].replace(/\-/g,"");
                result += "&r=" + r;
            } else{
                result += "&r=" + window.CHLOROFP_STATUS;
            }

            var ip = window.CHLOROFP_IP;
            if(!ip){
                var ipMatch = /\_RF1=([0-9\.]+)(;|$)/.exec(document.cookie);
                if (ipMatch && ipMatch.length > 1) {
                    ip = ipMatch[1];
                }
            }
            if(!isNaN(Number(ip))){
                ip = int2iP(Number(ip));
            }
            if(ip){
                ip = ip.replace(/^\s+|\s+$/g,'');
            }
            result += "&ip=" + ip;
            result += "&screen=" + screen.width + "x" + screen.height;
            var t = new Date().getTimezoneOffset() / 60;
            result += "&tz=" + (t < 0 ? '+' : '-') + Math.abs(t);
            result += "&blang=" + navigator.language || navigator.userLanguage;
            result += "&oslang=" + navigator.language || navigator.systemLanguage;
            result += "&ua=" + encodeURIComponent(navigator.userAgent);
            result += "&v=m14";
            return result;
        },

        ping: function(r) {
            if(window && window.location && 'WebSocket' in window){
                var doPing = true;
                // var domainRegexp = /^https?:\/\/((global\.secure\.ctrip\.com)|(secure\.ctrip\.com\.hk)|(m\.ctrip\.com)|(secure\.ctrip\.com)|(secure\.ctrip\.sg)|(secure\.ctrip\.my)|(secure\.ctrip\.co.kr))/;
                var domainRegexp = /^https?:\/\/(m\.ctrip\.com\/webapp\/lipin\/)|(m\.ctrip\.com\/webapp\/hotel\/)|(m\.ctrip\.com\/html5\/flight\/)/;
                var matchDomain = domainRegexp.exec(window.location);
                doPing = matchDomain;

                if(doPing){
                    if (!r) {
                        var rguidMatch = /\_RGUID=([a-z0-9\-]+)(;|$)/.exec(document.cookie);
                        var guidMatch = /guid\_\_=([a-z0-9\-]+)(;|$)/.exec(document.cookie);
                        if (rguidMatch && rguidMatch.length > 1) {
                            r = rguidMatch[1].replace(/\-/g, "");
                        } else if (guidMatch && guidMatch.length > 1) {
                            r = guidMatch[1].replace(/\-/g, "");
                        }
                    }
                    if (r) {
                        r = r + "_" + randomInt(1, 100);
                        log(r);
                        // test by websocket
                        var socket = new WebSocket(wurl);
                        socket.addEventListener('open', function (event) {
                            socket.send(r);
                        });
                        socket.addEventListener('message', function (event) {
                            var s = event.data;
                            log('websocket: ', s);
                            if (s === 'OK') {
                                socket.close();
                            } else {
                                socket.send(s + ":" + r);
                            }
                        });
                        // test by http post
                        submit_(hurl, "requestId", r);
                    }
                }
            }
        }
    }
}();
RMS.init();
RMS.ping();