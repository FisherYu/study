// pages/api/api.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pages: [
      {
        name: '登录',
        page: 'login'
      },
      {
        name: '授权',
        page: 'authorize'
      }
    ]
  },
  goTo: function(e) {
    var page = e.currentTarget.dataset.page;
    wx.navigateTo({
      url: [ page, page].join('/')
    })
  }
})