var __global = require('./global.js');
var lz77 = require('./lz77.js');

if (typeof Object.assign != 'function') {
    Object.assign = function (target) {
        'use strict';
        if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        target = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source != null) {
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    };
}

var util = {};

util.entryPath = __wxConfig.pages[0];
util.cwxPath = util.entryPath.replace(/\/entry\/entry$/, '');

util.getRootPathPrefix = function (_require) {
    var c1 = require('./config.js');
    var ret = '';
    while (1) {
        try {
            var c2 = _require(ret + util.cwxPath + '/config.js');
            if (c1 === c2) {
                break;
            }
        } catch (e) {
            ret += '../';
        }
    }
    return ret;
};

util.type = function (obj) {
    var ret = '';
    if (obj === null) {
        ret = 'null';
    } else if (obj === undefined) {
        ret = 'undefined';
    } else {
        var t = Object.prototype.toString.call(obj);
        var arr = t.match(/^\[object (\w+?)\]$/);
        if (arr) {
            ret = arr[1].toLowerCase();
        } else {
            ret = t;
        }
    }
    return ret;
};

util.compare = function (obj1, obj2) {
    return JSON.stringify(obj1) == JSON.stringify(obj2);
};

util.runCode = function (code, args) {
    __global.__runCodeResult = void (0);
    var fnArgs = [];
    var fnVals = [];
    switch (util.type(args)) {
        case 'array':
            fnVals = args;
            break;
        case 'object':
            for (var key in args) {
                if (args.hasOwnProperty(key)) {
                    fnArgs.push(key);
                    fnVals.push(args[key]);
                }
            }
            break;
    }
    fnArgs.push(code);
    var fn = __Func.apply(null, fnArgs);
    return fn.apply(this, fnVals);
};

util.runExpr = function (code, args) {
    return util.runCode.call(this, 'return (' + code + ')', args);
};

util.requireRemote = function (url, fn) {
    var key = '__remote__/' + url.replace(/:\/\//, '/');

    try {
        var bakDomain = __wxConfig.projectConfig.Network.RequestDomain;
        __wxConfig.projectConfig.Network.RequestDomain = (url.match(/^\w+:\/\/[^\/]*\//) || [''])[0];
    } catch (e) { };

    wx.request({
        url: url,
        success: function (res) {
            util.runCode('define("' + key + '", function(require, module){' + res.data + '})');
            var mod = require(util.getRootPathPrefix(require) + key);
            fn && fn(mod);
        },
        fail: function () {
            console.log('Error //todo');
        }
    });

    try {
        __wxConfig.projectConfig.Network.RequestDomain = bakDomain;
    } catch (e) { };
};

util.copy = function (obj) {
    var ret;
    switch (util.type(obj)) {
        case 'array':
            ret = obj.map(util.copy);
            break;
        case 'object':
            ret = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    ret[key] = util.copy(obj[key]);
                }
            }
            break;
        case 'date':
            ret = new Date(+obj);
            break;
        default:
            ret = obj;
            break;
    }
    return ret;
};

util.isDevice = function () {
    return !__global.navigator;
    // return /MicroMessager/.test(__global.navigator.userAgent);
};

util.cc2str = function (input) {
    var output = '';
    for (var i = 0; i < input.length; i++) {
        output += String.fromCharCode(input[i]);
    }
    return output;
};

util.base64 = {
    key: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
    btoa: function (input, opts) {
        opts = opts || {};
        var key = opts.key || util.base64.key;
        var output = "";
        var i = 0;
        var fn = opts.charCodeArray ? function (i) {
            return input[i];
        } : function (i) {
            return input.charCodeAt(i);
        };
        while (i < input.length) {
            var chr1 = fn(i++);
            var chr2 = fn(i++);
            var chr3 = fn(i++);
            output += key[chr1 >> 2]
                + key[((chr1 & 3) << 4) | (chr2 >> 4)]
                + key[isNaN(chr2) ? 64 : ((chr2 & 15) << 2) | (chr3 >> 6)]
                + key[isNaN(chr3) ? 64 : chr3 & 63];
        }
        return output;
    },
    atob: function (input, opts) {
        opts = opts || {};
        var key = opts.key || util.base64.key;
        var h = {};
        for (var i = 0; i < key.length; i++) {
            h[key[i]] = i;
        }
        var arr = [];
        var i = 0;
        while (i < input.length) {
            var enc1 = h[input[i++]];
            var enc2 = h[input[i++]];
            var enc3 = h[input[i++]];
            var enc4 = h[input[i++]];
            arr.push((enc1 << 2) | (enc2 >> 4));
            enc3 != 64 && arr.push(((enc2 & 15) << 4) | (enc3 >> 2));
            enc4 != 64 && arr.push(((enc3 & 3) << 6) | enc4);
        }
        var output = opts.charCodeArray ? arr : util.cc2str(arr);
        return output;
    },
    encode: function (str) {
        return util.base64.btoa(unescape(encodeURIComponent(str)));
    },
    decode: function (str) {
        return decodeURIComponent(escape(util.base64.atob(str)));
    }
};

/*
    @brief base64编码
    @str 原始字符串
    return 加密后的字符串
*/
util.base64Encode = function (str) {
    return util.base64.encode(str)
};
/*
    @brief base64解码
    @base64str 经过base64编码的字符串
    return 解码后的字符串
*/
util.base64Decode = function (base64str) {
    return util.base64.decode(base64str)
};

//加密openid用
util.mktBase64Encode = function (str) {
    var baseStr = util.base64Encode(str)
    var chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    var length = Math.min(baseStr.length, chars.length);
    var begin = 0;
    var end = 0;
    do {
        begin = Math.floor(Math.random() * length)
        end = Math.floor(Math.random() * (length - begin)) + begin
    } while (!((begin > 0) && (end < length - 1) && (end > begin + 1)))
    var trim = baseStr.substr(begin, end - begin);
    var trans = trim.split("").reverse().join("")
    var result = baseStr.substr(0, begin) + trans + baseStr.substr(end, baseStr.length - end) + chars[begin] + chars[end]
    return result;
}
//解密openid
util.mktBase64Decode = function (str) {
    var chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    var length = str.length;
    var base = str.substr(0, str.length - 2);
    var begin = chars.indexOf(str.substr(length - 2, 1));
    var end = chars.indexOf(str.substr(length - 1, 1));
    var sub = base.substr(begin, end - begin);
    var trans = sub.split("").reverse().join("")
    var baseStr = base.substr(0, begin) + trans + base.substr(end, base.length - end)
    var result = util.base64Decode(baseStr)
    return result;
}


util.lz77 = {
    key: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_~',
    encode: function (str) {
        return lz77.encode(str);
    },
    decode: function (str) {
        return lz77.decode(str);
    },
    encodeURIComponent: function (str) {
        return util.base64.btoa(lz77.encode(unescape(encodeURIComponent(str)), {
            charCodeArray: true
        }), {
                key: util.lz77.key,
                charCodeArray: true
            });
    },
    decodeURIComponent: function (str) {
        return decodeURIComponent(escape(lz77.decode(util.base64.atob(str, {
            key: util.lz77.key,
            charCodeArray: true
        }), {
                charCodeArray: true
            })));
    }
};

/*
    获取到设备信息
*/
wx.getSystemInfo({
    success: function (res) {
        util.systemInfo = res
    }
});

module.exports = util;
