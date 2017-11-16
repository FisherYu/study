// pages/baseinfo/baseinfo.js
import { CPage } from '../../cwx/cwx.js'

CPage({
  onLoad: function(param) {
    console.log(param)
  },
  onShow: function() {
  },
  backHandle: function() {
    this.navigateBack();
  },
  invokeCallbackHandle: function() {
    this.invokeCallback({name: 'john'})
  }
})