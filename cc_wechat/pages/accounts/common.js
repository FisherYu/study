var __global = require('../../cwx/ext/global.js');
var LoginCommon = {

    getRequestObject: function (urlName, dataobj, successback, failback) {
        var param = {};
        param.url = '/restapi/soa2/' + urlName;//"https://gateway.m.fws.qa.nt.ctripcorp.com/restapi/soa2/" 
        param.data = dataobj;
        param.success = successback;
        param.fail = failback;
        console.log(param);
        return param;
    },

    getGatewayRequestObj: function (urlName, dataobj, successback, failback) {
        var param = {};
        var host = this.getGatewayRequestHost();
        console.log("host:"+host);
        param.url = host + '/gateway/api/' + urlName;
        param.data = dataobj;
        param.success = successback;
        param.fail = failback;
        console.log(param);
        return param;

    },

    getGatewayRequestHost: function () {
        var env = __global.env;
        var host = "";
        if (env.toLowerCase() === 'fat') {
            host = "https://accounts.fat466.qa.nt.ctripcorp.com"
        } else if (env.toLowerCase() === 'uat') {
            host = "https://accounts.uat.qa.nt.ctripcorp.com"
        }
        
        return host;
    }

};

module.exports = LoginCommon;