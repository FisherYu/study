import { cwx, _ } from '../../../cwx/cwx.js';

var config = require('../config/config.js');
var orderDetailStore = require('../models/stores.js').OrderDetailStore();
var Util = require('../common/util.js');

var getRequestHeader = function(){
    var requestHeader = {
        "cid": "",
        "ctok": "",
        "cver": "1.0",
        "lang": "01",
        "sid": "8888",
        "syscode": "09",
        "auth": ""    
    };

    requestHeader.auth = orderDetailStore.getAttr('auth');
    requestHeader.cid = cwx.clientID;
    return requestHeader;
}



function BaseModel( settings ){
    this.settings = _.extend({
        url : "",
        method : "POST",
        data : {

        },
        success : function(){},
        fail : function(){}
    }, settings || {});
}

_.extend(BaseModel.prototype, {
    constructor : BaseModel,
    buildUrl : function(){
		var envJson = config.DOMAINARR[config.ENV] || config.DOMAINARR['pro'];
		this.settings.url = 'https://' + envJson.domain + '/' + envJson.path + '/' + this.settings.url + envJson.hz_param;
        return Util.appendQuery(this.settings.url, '_fxpcqlniredt=' + (cwx && cwx.clientID || '') + '&paytimestamp=' + (+new Date()));
    },
    excute : function(){
        var self = this;
        var _data = this.getData();

                //console.log('================================================================支付请求响应request开始============================================================================================');
                //console.log(_data);
                //console.log('================================================================支付请求响应request结束============================================================================================');


        cwx.request({
            url: self.buildUrl(),
            data : _data,
            method : "POST",
            header: {
                'Content-Type': 'application/json'
            },
            success: function(json) {

                //console.log('================================================================支付请求响应开始============================================================================================');
                //console.log(json);
                //console.log('================================================================支付请求响应结束============================================================================================');

                var result = null;
                //
                //处理wx.request层面错误
                if(json && json.statusCode && json.statusCode == 200 && json.data && json.data.ResponseStatus && json.data.ResponseStatus.Ack && json.data.ResponseStatus.Ack === 'Success'){
                    result = json.data || {};
                    result.ResponseStatus = result.ResponseStatus || {};
                    result.retCode = 0;
                    result.retMsg = "SOA2执行成功";
                    self.settings.success(result);
                }else{
                    self.settings.fail({
                        retCode : 1,
                        retMsg : "SOA2执行失败"
                    });                     
                }

            },
            fail : function(){
                self.settings.fail({
                    retCode : 1,
                    retMsg : "SOA2执行失败"
                }); 
            }
        });        
    },
    getData : function(){
        this.settings.data = this.settings.data || {};
        var retObj = _.extend({
            "head" : getRequestHeader(),
            "plat" : 5,
            "ver" : config.APP_VER,
            "contentType": "json"
        }, this.settings.data);
        var getRheader = getRequestHeader();
        if(this.settings.data.head){
            getRheader = _.extend(getRheader, this.settings.data.head);
            retObj.head = getRheader;
        }


        return retObj;
    }
});


module.exports = {
    BaseModel : BaseModel
}