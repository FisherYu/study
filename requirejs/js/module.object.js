/*
* 该模块只返回一个对象,
* 
*/
define({
	name: 'john',
	age: 12,
	say: function() {
		console.log('name: ' + this.name)
	}
})
// 还可以是这些值

// define(1) // Number
// define('helo') // String
// define(void 0) // undefind
//define(true) // boolean

//define([]) // Array 作为依赖解析
//define(function(){}) // Function 作为没有依赖的, 模块定义函数，且调用该函数，把函数的返回值作为模块输出

