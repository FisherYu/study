// define(['require', './a'], function(require,a) {
// 	console.log('circular b.js');
// 	console.log(a)
// 	require(['./a'], function(a) {
// 		console.log('Fetch module a by require:');
// 		console.log(a)
// 	})
// 	return {
// 		name: 'b'
// 	}
// })

define(function(require, exports, module) {
	var a = require('./a'); // 模块a页必须使用exports导出方式，否者必须使用数组依赖的方式 require(['./a'], function(){})
	console.log(a);// 
	exports.foo = function() {
		//var a = require('./a');
		return a;
	}
})