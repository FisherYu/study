
Page({
  request: function() {
    wx.request({
      url: 'https://gateway.m.fws.qa.nt.ctripcorp.com/restapi/soa2/12782/isCardHolder.json',
      data: {},
      method: 'POST',
      success: function(data, statusCode) {
        console.log(data);
      },
      fail: function() {
        console.log(arguments)
      },
      complete: function() {
        console.log(arguments)
      }
    })
  },
  makePhoneCall: function() {
    wx.showShareMenu({
      withShareTicket: true,
      success: function(){}
    });
    return;

    wx.openSetting();
    return;

    wx.showNavigationBarLoading();
    return;
    wx.setNavigationBarTitle({
      title: '当前页面'
    })
    return;
    wx.showActionSheet({
      itemList: ['A', 'B', 'C'],
      success: function (res) {
        console.log(res.tapIndex)
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
    return;
    wx.showLoading();
    return;
    wx.showToast({
      title: '成功',
      icon: 'success',
      duration: 2000,
      mask: true
    })
    return;
    wx.makePhoneCall({
      phoneNumber: '13621715758',
    })
  },
})