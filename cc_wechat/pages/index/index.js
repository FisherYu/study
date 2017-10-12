
//index.js
//获取应用实例
const models = require('../../common/model/cc.model.js');
import { cwx, CPage } from '../../cwx/cwx.js'
cwx.config.init();

CPage({
  data: {
  },
  //事件处理函数
  applyCardHandle: function() {
    this.navigateTo({
      data: {
        orderId: 12,
      },
      url: '../baseinfo/baseinfo', 
      callback: function() {
        console.log('callback')
        console.log(arguments)
      },
      immediateCallback: function() {
        console.log('immediateCallback')
        console.log(arguments)
      }
    });
    return;
    if (!cwx.user.isLogin()) {
      cwx.user.login({
        callback: function() {
          console.log('login back')
        }
      });
      return;
    }
    models.isCardHolder(function(){
      console.log('success');
    }, function(){
      console.log('fail');
    },function(){
      console.log('complete');
    })
  },
  onLoad: function () {
  },
  onShow: function() {
  }
})
