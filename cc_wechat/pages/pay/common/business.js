var models = require('../models/models.js');
var paymentStore = require('../models/stores.js');
var exceptionInfoCollectModel = models.ExceptionInfoCollectModel;
var orderDetailStore = paymentStore.OrderDetailStore();
var extStore = paymentStore.OrderDetailExtendStore();
var payResultOBStore = paymentStore.PayResultOrderStore();
var ret = {};
ret.exceptionInfoCollect = function(settings){

    exceptionInfoCollectModel({
        data : settings
    }).excute();
},
/**
* 设置oid
* @function
* @name setTempOid
* @description 设置oid
* @author lh_sun@ctrip.com
* @memberof common/business
* @inner
*/
ret.setTempOid = function (data) {
    //门票刚进支付的时候，传的是临时单号，301返回的是正式单号
    if (data && data["oidex"] && data["oidex"] != 0) {
        payResultOBStore.setAttr('realoid', data["oidex"]);
    }

};

/**
* 设置清除相应的缓存数据
* @function
* @name setTempOid
* @description 设置oid
* @author lh_sun@ctrip.com
* @memberof common/business
* @inner
*/
ret.clearStore = function(){
    orderDetailStore.remove();
    extStore.remove();
	payResultOBStore.remove();
}


module.exports = ret;

