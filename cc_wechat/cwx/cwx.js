var __global = require('./ext/global.js');
var _ = __global._ = require('../3rd/lodash.core.min.js');

var cwx = __global.cwx = (function () {
  var globalData = {
    bus: {},
    pay: {},
    train: {},
    flight: {},
    home: {},
    hotel: {},
    ticket: {},
  }
  var cwx = Object.create(wx, {
    config: {
      get: function(){
        return require('./cpage/config.js');
      },
      enumerable: true
    },
    util: {
      value: require('./ext/util.js'),
      enumerable: true
    },
    request: {
      get: function(){
        return require("./ext/cwx.request.js").request;
      },
      enumerable: true
    },
    cancel: {
      get: function(){
        return require("./ext/cwx.request.js").cancel;
      },
      enumerable: true
    },
    locate: {
      get: function(){
        return require("./ext/cwx.locate.js");
      },
      enumerable: true
    },
    payment: {
      get: function(){
        return require("../pages/pay/common/cpay.js");
      },
      enumerable: true
    },
    component: {
      get: function(){
        return require("./component/component.js");
      },
      enumerable: true
    },
    user: {
      get: function(){
        return require('../pages/accounts/user.js');
      },
      enumerable: true
    },
    passenger: {
      get: function(){
        return require('../pages/passenger/passenger.js');
      },
      enumerable: true
    },
    mkt: {//市场业绩
      get: function(){
        return require('../pages/market/market.js');
      },
      enumerable: true
    },
    appId:{
      enumerable:true,
      value:__global.appId
    },
    cwx_mkt: {//市场需要的id
      get: function () {
        return require('./ext/cwx.market.js');
      },
      enumerable: true
    }

  });
  cwx.getCurrentPage = function () {
    var pages, page;
    try {
      pages = getCurrentPages();
      page = pages && pages.length ? pages[pages.length - 1] : null;
    } catch (e) {
      page = getApp().getCurrentPage();
    }
    return page;
  };

  Object.keys(globalData).forEach(function (key) {
    cwx[key] = globalData[key]
  })
  //获取ClientID
  var clientID = wx.getStorageSync("clientID")
  if (!clientID) {
    wx.request({
      url: "https://" + __global.host + "/restapi/soa2/10290/createclientid",
      method: "POST",
      success: function (res) {
        if (res.statusCode == 200) {
          // console.log( "Get ClientID = ", res.data.ClientID )
          cwx.clientID = res.data.ClientID
          wx.setStorage({
            key: "clientID",
            data: res.data.ClientID
          });
        }
      },
      fail: function (res) {
        // console.log( "获取CID失败 ", res )
      },
    })
  } else {
    cwx.clientID = clientID
  }
  cwx.systemCode = '30';
  return cwx;
})()
var CPage = __global.CPage = require('./cpage/cpage.js');

export default cwx;
export { __global };
export { cwx };
export { _ };
export { CPage };
