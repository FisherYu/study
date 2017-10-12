var RMS = function () {


    var kpdata = [[0, 0, 0]];
    var kpdata2 = [[0, 0, 0],[0,0,0]];
    var hurl = location.protocol + "//cdid.c-ctrip.com/model-poc2/h", //servlet提交的url
        wurl = location.protocol.replace("http", "ws") + "//cdid.c-ctrip.com/model-poc2/w", //websocket的url
        form1, dataInput, submiting=false; //当用iframe提交的时候用到的变量
    var serverName = location.protocol+"//"+location.host;

    function kpDataString(kp){
        var temp = [];
        for(var i = 0 ; i < kp.length ; i++){
            temp.push(kp[i].join("_"));
        }
        return temp.join("-");
    }


    function getIndexOf(arr, item){
        if(arr && item){
            for(var i= 0, j=arr.length; i<j; i++){
                if(arr[i]==item)
                    return i;
            }
        }
        return -1;
    }

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

    var kbS = function (data, err) {
        if(err || !data) {
            return;
        }
        try {
            var str = data.split("|"), ks = [];
            for (var i = 1, j = str.length; i < j; i++) {
                if (str[i].indexOf("__kc__") > 0) {
                    var sa = str[i].split(",");
                    var k = sa[1].substr(8);
                    if (getIndexOf(ks, k) < 0)
                        ks.push(k);
                    if (sa.length >= 3) {
                        kpdata.push([sa[0], sa[1].substr(6, 1) + getIndexOf(ks, k), sa[2]]);
                        //只保留20个长度
                        if(kpdata.length > 20){
                            kpdata.splice(1,1);
                        }
                    }
                }
            }
        } catch (e) {
        }

    };
    var kbE = function (e) {
        try {
            if (e.ctrlKey && e.keyCode == 67)
                kpdata[0][0] = 1;
            if (e.ctrlKey && e.keyCode == 86)
                kpdata[0][1] = 1;
            if (e.ctrlKey && e.keyCode == 88)
                kpdata[0][2] = 1;
            var sk = parseInt((e.altKey ? "1" : "0") + (e.shiftKey ? "1" : "0") + (e.ctrlKey ? "1" : "0") + (e.keyCode == 8 ? "1" : "0"), 2).toString(16);
            return '__kc__' + sk + "_" + (e.keyCode);
        } catch (e) {
            return "error!";
        }
    };
    var kbE2 = function (e) {
        try {
            if (e.ctrlKey && e.keyCode == 67)
                kpdata2[0][0] = 1;
            if (e.ctrlKey && e.keyCode == 86)
                kpdata2[0][1] = 1;
            if (e.ctrlKey && e.keyCode == 88)
                kpdata2[0][2] = 1;
            var sk = parseInt((e.altKey ? "1" : "0") + (e.shiftKey ? "1" : "0") + (e.ctrlKey ? "1" : "0") + (e.keyCode == 8 ? "1" : "0"), 2).toString(16);
            return '__kc2__' + sk + "_" + (e.keyCode);
        } catch (e) {
            return "error!";
        }
    };
    var kbE3 = function (e) {
        try {
            if (e.ctrlKey && e.keyCode == 67)
                kpdata2[1][0] = 1;
            if (e.ctrlKey && e.keyCode == 86)
                kpdata2[1][1] = 1;
            if (e.ctrlKey && e.keyCode == 88)
                kpdata2[1][2] = 1;
            var sk = parseInt((e.altKey ? "1" : "0") + (e.shiftKey ? "1" : "0") + (e.ctrlKey ? "1" : "0") + (e.keyCode == 8 ? "1" : "0"), 2).toString(16);
            return '__kc3__' + sk + "_" + (e.keyCode);
        } catch (e) {
            return "error!";
        }
    };

    var log = function(s) {
        // console.log(s);
    }

    var randomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

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
            try { //not compatible with IE lower version.
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
        return !('XMLHttpRequest' in window && 'withCredentials' in new XMLHttpRequest());
    }

    //如果是ie8以下则用form提交 if the browser under IE8, submit by form-submit.
    var initForm = function(){
        form1 = document.createElement("form");
        form1.id = "tgForm";
        form1.name = "tgForm";
        document.body.appendChild(form1);
        form1.target="tgIframe_t_";
        form1.action="url";
        form1.method="post";
        form1.setAttribute("style", "display:none");
        dataInput = createField(form1, "key", "value");
        createField(form1, "iframe", "true");
        createField(form1, "serverName", serverName);
    }

    var createField = function(form, key, value){
        var field = document.createElement("input");
        field.type = "hidden";
        field.name = key;
        field.value = value;
        field.id = key+"_d__";
        form.appendChild(field);
        return field;
    }

    var submit_ = function (url, key, value) {
        if(submiting) { //no effact for browser under IE8
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
        } else {
            createIframe();
            form1.action = url;
            dataInput.name = key;
            dataInput.value = value;
            if(guid){
                var gn = document.getElementById("guid_d__");
                if(gn){
                    gn.value = guid;
                } else {
                    createField(form1, "guid", guid);
                }
            }
            form1.submit();
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

            window.__bfi.push(['_trackKeyboard', 'txtContactMobilePhone', kbS, kbE]);
            window.__bfi.push(['_trackKeyboard', 'J_mobile', kbS, kbE]);
            window.__bfi.push(['_trackKeyboard', 'J_resident_1',function(){},kbE2]);
            window.__bfi.push(['_trackKeyboard', 'J_resident_2',function(){},kbE3]);

            if(window && window.location){
                var loadD = true;
                var domainRegexp = /^https?:\/\/((ct\.ctrip\.com)|([0-9a-zA-Z\.]*ctripcorp\.))/;
                var matchDomain = domainRegexp.exec(window.location);
                loadD = !matchDomain;

                if(!loadD){
                    //测试环境加载
                    domainRegexp = /^https?:\/\/(([0-9a-zA-Z\.]*qa\.nt\.ctripcorp\.))/;
                    matchDomain = domainRegexp.exec(window.location);
                    loadD = matchDomain;
                }

                if (loadD) {
                    (function () {

                        
                        var url = '//webresource.fws.qa.nt.ctripcorp.com/resaresonline/risk/ubtrms/d.min.a85ad591.js', timeout = 10;
                        

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
                        } catch (e) {
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
            result += "&kpData=" + kpDataString(kpdata);
            result += "&kpControl=" + kpDataString(kpdata2);
            result += "&screen=" + screen.width + "x" + screen.height;
            var t = new Date().getTimezoneOffset() / 60;
            result += "&tz=" + (t < 0 ? '+' : '-') + Math.abs(t);
            result += "&blang=" + navigator.language || navigator.userLanguage;
            result += "&oslang=" + navigator.language || navigator.systemLanguage;
            result += "&ua=" + encodeURIComponent(navigator.userAgent);
            var domainRegexp = /^https?:\/\/([a-zA-Z0-9.\-_]+)\/?/;
            var domainMatch = domainRegexp.exec(window.location);
            if (domainMatch && domainMatch.length > 1) {
                var d= domainMatch[1];
                result += "&d=" + encodeURIComponent(d);
            }
            result += "&v=22";
            if(this.uuid){
                result += "&rmsId=" + this.uuid;
            }
            return result;
        },

        ping: function(r) {
            if(window && window.location && 'WebSocket' in window){
                var doPing = true;
                var domainRegexp = /^https?:\/\/((ct\.ctrip\.com)|([0-9a-zA-Z\.]*ctripcorp\.))/;
                var matchDomain = domainRegexp.exec(window.location);
                doPing = !matchDomain;

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