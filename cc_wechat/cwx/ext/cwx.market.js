var cwx = require('./global.js').cwx;

//用来获取openid unionid
var DEFAULT_OPENID = '';
var DEFAULT_UNIONID = '';
var DEFAULT_FROMOPENID = '';
var DEFAULT_FROMUNIONID = '';
var _code = '';
var _encryptedData = '';
var _iv = '';
var _appId = cwx.appId;
var _userNotAllow = false;

var cwx_market = {
    openid: DEFAULT_OPENID,
    unionid: DEFAULT_UNIONID,
    fromopenid: DEFAULT_FROMOPENID,
    fromunionid: DEFAULT_FROMUNIONID,
    getMarket: function () {
        return _getMarket();
    },
    getMarketService: function (callback) {
        _getMarketService(callback);
    },
    clear: function () {
        _clear();
    }
};

var _getMarket = function () {
    var data = wx.getStorageSync('cwx_market')
    if (data && data.openid !== '' && data.unionid !== '') {
        cwx_market.openid = data.openid;
        cwx_market.unionid = data.unionid;
    }
    return data;
}
/**
 * 用来获取服务用户的服务
 */
var _getMarketService = function (callback) {
    var data = _getMarket();
    if (data) {
        console.log('get cache openid ', data);
        if (callback) {
            callback(data)
        }
        return;
    }
    if (_userNotAllow) {
        //TODO::
        console.log('用户拒绝获取昵称');
        if (callback) {
            callback({ errMsg: '用户拒绝获取昵称' })
        }
        return;
    }
    var sessionCallBack = function (res) {
        _getSession(callback)
    }

    var success = function (res) {
        _code = res.code;
        _getUserInfo(sessionCallBack)
    }
    wx.login({
        success: success
    })
}
/**
 * 获取到session 
 * */
var _getSession = function (callback) {
    var fail = function (res) {
            if (callback) {
                callback({ errMsg: '请求错误' })
            }
        }
        //TODO：用户拒绝直接返回
    if(_userNotAllow){
        fail();
        return ;
    }
    var success = function (res) {
        //TODO:获取session
        if (res && res.data){
            var data = res.data.weiXinData;
            if (data) {
                data = JSON.parse(data)
            }
            if (data && data.openId && data.unionId) {
                var openid = _encode(data.openId);
                var unionid = _encode(data.unionId)
                var storeData = {
                    openid: openid,
                    unionid: unionid
                }
                cwx_market.openid = openid
                cwx_market.unionid = unionid
                _store(storeData);
            }
        }
        if (callback) {
            callback()
        }
    }
    cwx.request({
        url: '/restapi/soa2/12378/json/getWeiXinData',
        data: {
            jsCode: _code,
            iv: _iv,
            encryptedData: _encryptedData,
            appID: _appId
        },
        success: success,
        fail: fail
    })
}

/**
 * 获取userInfo
 */
var _getUserInfo = function (callback) {
    var success = function (res) {
        _encryptedData = res.encryptedData
        _iv = res.iv
        if (callback) {
            callback()
        }
    }
    wx.getUserInfo({
        success: success,
        fail: function (res) {
            console.log('getUserInfo res = ', res);
            if (res.errMsg === "getUserInfo:cancel") {
                _userNotAllow = true;
            }
            if (callback) {
                callback(res)
            }
        }
    })
}

var _store = function (data) {
    if (data) {
        wx.setStorage({
            key: 'cwx_market',
            data: data,
        })
    }
}
var _clear = function () {
    wx.removeStorage({
        key: 'cwx_market',
        success: function (res) {
            // success
        }
    })
}

var _encode = function (str) {
    return cwx.util.mktBase64Encode(str)
}

var _decode = function (str) {
    return cwx.util.mktBase64Decode(str)
}



module.exports = cwx_market;
