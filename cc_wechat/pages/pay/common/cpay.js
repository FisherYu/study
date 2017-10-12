import { _ } from '../../../cwx/cwx.js';
var Config = require('../config/config.js');
var Cwecahtpay = require('../controllers/index.js');
var Business = require('../common/business.js');
// var store = {};
var Pay = {};

var pay = function(settings){
	//console.log('================================================================BU传过来的参数为开始============================================================================================');
	//console.log(settings);
	//console.log('================================================================BU传过来的参数为结束============================================================================================');
	clearInterval();
	clearTimeout();
	Business.clearStore(); //清除所有支付缓存
	settings = _.extend(Config.getDefaultSettings(), settings || {});
	Config.ENV = settings.env;
	Cwecahtpay.CPayPopbox.init(settings);
};

Pay.callPay = pay;
Pay.version  = '1.0.0';

module.exports = Pay;