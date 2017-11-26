Page({
  openSetting: function() {
    wx.openSetting({
      
    })
  },
  // 主动发起授权请求
  authorize: function() {
    // 三个回调函数但参数都一样但类型，短时间内已经授权或拒绝都不会弹框，直接触发对应的回调函数
    wx.authorize({
      scope: 'scope.userLocation',
      success: function(e) {
        console.log('success')
        console.log(e)
      },
      complete: function(e) {
        console.log('complete')
        console.log(e)
      },
      fail: function(e) {
        console.log('fail')
        console.log(e)
      }
    })
  }
})