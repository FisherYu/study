// define(['./b'], function(b) {
// 	console.log('circular a.js');
// 	console.log(b)
// 	return {
// 		name: 'a'
// 	}
// })

define(function(require, exports, module) {
	var b = require('./b'); // 模块b页必须使用exports导出方式
	console.log(b);// 
	exports.foo = function() {
		return b;
	}
})