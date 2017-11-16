var __global = {
    version:'1.0.1',//sdk版本
    appId: 'wx0e6ed4f51db9d078',//独立小程序的APPID (必须修改)
    tabbar: ["pages/home/homepage", "pages/myctrip/list/list"], //每一个Tab的首页，用来判断页面层级，(按需修改)
    getIDsWhenLaunch: true, //启动的时候获取openid 和 unionid,为true时，启动会请求获取用户昵称授权，如果授权失败，则opened = '' union ='' (按需修改)
    env:'fat',//prd uat fat 网络环境 ， 发布前一定要设置为prd
    host: 'mm.ctrip.com', //默认都是用这个域名，建议不要修改 (禁止修改)
    uat:'gateway.m.uat.qa.nt.ctripcorp.com',//uat域名
    fat:'gateway.m.fws.qa.nt.ctripcorp.com',
};
module.exports = __global;