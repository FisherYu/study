function stringExpansion() {
    if (!String.prototype.toDate) {
        /**
         * string 类型转日期对象
         * @param z {Number} 时区
         * @returns {*}
         */
        String.prototype.toDate = function (z) {
            var localOffset = new Date().getTimezoneOffset() * 60000 + (z ? z : 0) * 60 * 60000;
            var d = this.replace(/\D/igm, "").substring(0, 13);
            return new Date(parseInt(d) + localOffset);
        };
    }

    if (!String.prototype.formatDate) {
        /**
         * formatDate 时间处理函数
         * @param  {string} fmt 格式化字符形式
         * @return {string}
         */
        String.prototype.formatDate = function (fmt) {
            var pattern = /^(\d{1,4})\-(\d{1,2})\-(\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})$/;

            var dateArr = this.match(pattern);

            if (dateArr) {
                var o = {
                    'y+': +dateArr[1],
                    'M+': +dateArr[2],
                    'd+': +dateArr[3],
                    'h+': +dateArr[4],
                    'm+': +dateArr[5],
                    's+': +dateArr[6]
                };

                if (/(y+)/.test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (o['y+'] + '').substr(4 - RegExp.$1.length));
                }

                for (var k in o) {
                    if (o.hasOwnProperty(k)) {
                        if (new RegExp('(' + k + ')').test(fmt)) {
                            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ?
                                (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
                        }
                    }
                }

                return fmt;

            } else {
                return '';
            }
        };
    }
}

function dateExpansion() {
    if (!Date.prototype.fnGetDateFormat) {
        /**
         * 获取格式化后的当前时间
         * @param fmt {string} 格式化字符形式
         * @example fnGetDateFormat('yyyy-MM-dd hh:mm:ss')
         *          fnGetDateFormat('yyyy/MM/dd hh:mm:ss')
         * @returns {*}
         */
        Date.prototype.fnGetDateFormat = function (fmt) {
            var self = this;
            var o = {
                'M+': self.getMonth() + 1, //月份
                'd+': self.getDate(), //日
                'h+': self.getHours(), //小时
                'm+': self.getMinutes(), //分
                's+': self.getSeconds(), //秒
                'q+': Math.floor((self.getMonth() + 3) / 3), //季度
                'S': self.getMilliseconds() //毫秒
            };

            if (/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (self.getFullYear() + '').substr(4 - RegExp.$1.length));
            }

            for (var k in o) {
                if (o.hasOwnProperty(k)) {
                    if (new RegExp('(' + k + ')').test(fmt)) {
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ?
                            (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
                    }
                }
            }

            return fmt;
        };
    }
}

function arrayExpansion() {
    if (!Array.prototype.unique) {
        /**
         * 数组去重
         * @returns {*}
         */
        Array.prototype.unique = function () {
            if (this instanceof Array) {
                var u = {}, a = [];
                for (var i = 0, len = this.length; i < len; i++) {
                    if (u.hasOwnProperty(this[i])) {
                        continue;
                    }
                    a.push(this[i]);
                    u[this[i]] = 1;
                }
                return a;
            } else {
                return [];
            }
        };
    }

    if (!Array.prototype.without) {
        /**
         * 数组出去指定内容
         * @returns {*}
         */
        Array.prototype.without = function () {
            if (this instanceof Array) {
                var args = arguments;
                if (args.length) {
                    var t = [];
                    for (var j = 0, len = args.length; j < len; j++) {
                        t.push(args[j]);
                    }

                    var r = [];


                    for (var i = 0, len2= this.length; i < len2; i++) {
                        if (t.indexOf(this[i]) === -1) {
                            r.push(this[i]);
                        }
                    }

                    return r;
                } else {
                    return this;
                }
            } else {
                return [];
            }
        };
    }
}

function init() {
    stringExpansion();
    dateExpansion();
    arrayExpansion();
}

module.exports = {
    init: init
};