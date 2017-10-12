import { cwx, _ } from '../../../cwx/cwx.js';

var Business = require('../common/business.js');
var storesRequire = require('../models/stores.js');
var orderDetailStore = storesRequire.OrderDetailStore();
var orderDetailExtendStore = storesRequire.OrderDetailExtendStore();
var Util = require('../common/util.js');
function getData(callback){
		var that = this;
        //验证整体变量定义
        var payData = that.originalOrderDetailData,
            payToken = decodeURIComponent(payData.token || ''),
            payExtend = decodeURIComponent(payData.extend || ''),
            decodePayToken = null,
            order_obj = {},
            extendObj = {},
            dataError = 0,
            ErrorMsg = '系统异常，请重新提交订单(1001)';

        try {
            decodePayToken = cwx.util.base64Decode(payToken);
            //判断BU过来之后是否传token
            if (decodePayToken.length > 0) {
                payToken = JSON.parse(decodePayToken);
            }else{
                return
            }

            if (payToken.oid) {
                payToken.oid += '';
            }

            //代码做兼容处理  如果decodeUrlToken.length == 0 则 token为""，那么下面的代码直接报错了
            for(var key in payToken){
                var value = payToken[key];
                //过滤bu传递参数的头尾空格
                if (value && _.isString(value)) {
                    value = value.replace(/(^\s*)|(\s*$)/g, "");
                }
                order_obj[key] = value;
            }

            //选填字段，设置默认值
            typeof (order_obj.currency) == "undefined" && (order_obj.currency = "CNY");
            typeof (order_obj.displayCurrency) == "undefined" && (order_obj.displayCurrency = "CNY");
            typeof (order_obj.displayAmount) == "undefined" && (order_obj.displayAmount = "");
            typeof (order_obj.recall) == "undefined" && (order_obj.recall = "");
            typeof (order_obj.extno) == "undefined" && (order_obj.extno = "");
            typeof (order_obj.needInvoice) == "undefined" && (order_obj.needInvoice = false);
            typeof (order_obj.invoiceDeliveryFee) == "undefined" && (order_obj.invoiceDeliveryFee = 0);
            typeof (order_obj.includeInTotalPrice) == "undefined" && (order_obj.includeInTotalPrice = false);
            typeof (order_obj.auth) == "undefined" && (order_obj.auth = "");

            //如果BU传过来的币种是rmb，则强行转化成cny  lh_sun
            if (_.isString(order_obj.currency) && order_obj.currency.toLowerCase() === 'rmb') {
                order_obj.currency = 'CNY';
            }

            //如果BU传过来的币种是rmb，则强行转化成cny  lh_sun
            if (_.isString(order_obj.displayCurrency) && order_obj.displayCurrency.toLowerCase() === 'rmb') {
                order_obj.displayCurrency = 'CNY';
            }
            order_obj["totalamount"] = order_obj.amount;
            order_obj["origamount"] = order_obj.amount;
        } catch (e) {
            dataError = 1;
			console.log("DEBUG BU_DATA:"+ JSON.stringify(that.originalOrderDetailData));
        }
        if (dataError) {
            //显示modal提示框信息
            that.modalConfirm(ErrorMsg, function(){
				if(typeof that.settings.fromCallback === 'function'){
					return that.settings.fromCallback.call(that,{msg: ErrorMsg});
				}
			});

            try{
                Business.exceptionInfoCollect({
                    bustype: order_obj.bustype || '',
                    excode: "c_e_c03",
                    extype: 1,
                    exdesc: 'Bu传递url解析异常 BU传过来的参数token:' + payData.token + ';extend:' + payData.extend + ';oid:' + payData.oid                
                });
            }catch(e){}

            return;
        }

        if (!order_obj.oid || !order_obj.bustype || !order_obj.amount || !order_obj.auth) {

            if (!order_obj.amount && order_obj.amount == 0) {
                ErrorMsg = '系统异常，请重新提交订单(1005)';
            }

            if (!order_obj.oid) {
                ErrorMsg = '系统异常，请重新提交订单(1006)';
            }
			
            if (!order_obj.auth || order_obj.auth == 'isnull') {
                ErrorMsg = '系统异常，请重新提交订单(1004)';
            }
            //显示modal提示框信息
			that.modalConfirm(ErrorMsg, function(){
				if(typeof that.settings.fromCallback === 'function'){
					return that.settings.fromCallback.call(that,{msg: ErrorMsg});
				}
			});

            try{
                Business.exceptionInfoCollect({
                    bustype: order_obj.bustype || '',
                    excode: "c_e_c03",
                    extype: 1,
                    exdesc: 'Bu传递url解析异常 BU传过来的参数token:' + payData.token + ';extend:' + payData.extend + ';oid:' + payData.oid                
                });
            }catch(e){};

            return;
        }

        //验证extend参数base64解析是否成功
        try {
            if (payExtend.length > 0) {
                payExtend = JSON.parse(cwx.util.base64Decode(payExtend));
                for( key in payExtend){
                    var value = payExtend[key];
                    if(value == 'null' || value == 'undefined'){
                        value = ''
                    }
                    extendObj[key] = value;
                }
            } else {
                payExtend = {}
            }
        } catch (e) {
            dataError = 1;
            ErrorMsg = '系统异常，请重新提交订单(1002)';
        }

        if (dataError) {
            //显示modal提示框信息
			that.modalConfirm(ErrorMsg, function(){
				if(typeof that.settings.fromCallback === 'function'){
					return that.settings.fromCallback.call(that,{msg: ErrorMsg});
				}
			});
            try{
                Business.exceptionInfoCollect({
                    bustype: order_obj.bustype || '',
                    excode: "c_e_c03",
                    extype: 1,
                    exdesc: 'Bu传递url解析异常 BU传过来的参数token:' + payData.token + ';extend:' + payData.extend + ';oid:' + payData.oid                
                });
            }catch(e){}

            return;
        }

        orderDetailStore.set(order_obj);
        orderDetailExtendStore.set(payExtend);

        that.data.payData = {
			orderDetail: order_obj,
			extParam: payExtend
		};


        return callback();
}
    
module.exports = {
    getData : getData
}