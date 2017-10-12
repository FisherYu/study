//app.js
import { __global, cwx } from './cwx/cwx.js'
App({
  onLaunch: function () {
    if (__global.getIDsWhenLaunch) {
      try {
        cwx.cwx_mkt.getMarketService(function () {
          console.log('cwx.cwx_mkt.openid = ', cwx.cwx_mkt);
        })
      } catch (e) {
        console.log('获取openid error e = ', e)
      }
    }
  },
  globalData:{
    env: 'fat' // fat,uat, prd
  }
})