import { cwx } from '../../../../cwx/cwx.js';

var common = {

    device: {
        getClientVersion: function () {
            return '6.20';
        },
        getChannel: function () {
            return 'WX';
        }
    },

    user: {
        checkLogin: function (callback) {
            if (callback && typeof callback === 'function') {
                cwx.user.checkLoginStatusFromServer(callback); // 异步判断，从服务端判断
            } else {
                return cwx.user.isLogin(); // 同步判读，读取本地auth值，不确定auth是否还有效
            }
        },
        login: function (data) {
            if (!data) {
                data = {};
            }
            if (!data.param || typeof data.param !== 'object') {
                data.param = {};
            }
            if (!data.callback || typeof data.callback !== 'function') {
                data.callback = function () {};
            }

            cwx.user.login(data);
        },
        logout: function (callback) {
            if (typeof callback !== 'function') {
                callback = function () {};
            }
            cwx.user.logout(callback);
        }
    }

};

module.exports = common;