import { cwx } from '../../../cwx/cwx.js';
var config = {
        APP_VER : 701,
        ENV: "pro",
		DOMAINARR: {
			"fat": { "domain": "gateway.secure.fws.qa.nt.ctripcorp.com", "path": "restful/soa2/10289", "hz_param": "?subEnv=fat1"}, //hz_param fat18添加
            "fat103": { "domain": "gateway.secure.fws.qa.nt.ctripcorp.com", "path": "restful/soa2/10289", "hz_param": "?subEnv=fat2"}, //hz_param fat103添加
            "fat45": { "domain": "gateway.secure.fws.qa.nt.ctripcorp.com", "path": "restful/soa2/10289", "hz_param": "?subEnv=fat3"}, //hz_param fat45添加
            "fws": { "domain": "gateway.secure.fws.qa.nt.ctripcorp.com", "path": "restful/soa2/10289", "hz_param": ""},
            "uat": { "domain": "gateway.secure.uat.qa.nt.ctripcorp.com", "path": "restful/soa2/10289", "hz_param": ""},
            "baolei": { "domain": "mm.ctrip.com", "path": "restful/soa2/10289", "hz_param": "?isBastionRequest=true"},
            "pro": { "domain": "mm.ctrip.com", "path": "restful/soa2/10289", "hz_param": ""}
        },
		getDefaultSettings: function(){
			return {
				"data":{
			
				},
				"sbackCallback" : function(){},
				"fromCallback" : function(){},
				"ebackCallback" : function(){},
				//"rbackCallback" : function(){},
				"env" : "pro"		
			}
		}
};

module.exports = config;