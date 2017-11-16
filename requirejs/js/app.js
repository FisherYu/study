require.config({
	//baseUrl: 'lib',
	paths: {
		'custom': 'lib/custom',
		'utils': 'common/utils',
		validate: 'common/utils/validate', //'utils/validate', // path映射不会叠加
		//'validate/a': 'common/utils/validate/validate',
		//'validate/a/b': 'common/utils/validate/validate',
		parse: 'util/parse', 
		compute: 'lib/compute/main',
		//compute: 'lib/compute',
		///'foo1.0': 'map/foo1.0'
		'map2': 'map/map2'
	},
	// bundles: {
	// 	'bundle/primary': ['text', 'main']
	// },
	// shim:  {
	// 	'custom/gPersion': {
	// 		exports: 'gPersion'
	// 	},
	// 	'custom/ga': {
	// 		deps: ['custom/gPersion'],
	// 		exports: 'GA'
	// 	}
	// },
	// map: {
	// 	'*': {
	// 		// key是大小敏感的，只是用作引用的,不会进行to-path操作。只有模块ID是“map/foo”的才会映射到'map/foo1.0'
	// 		// vlue也是个moduleID，会进行to-path操作,可以是shim配置的module ID
	// 		'foo': 'map/foo' //custom/ga
	// 	},
	// 	'map/map': {
	// 		'foo': 'map/foo1.0'
	// 	},
	// 	// key 是moduleId,表示模块map2中引用的模块foo对应模块map/foo2.0。
	// 	'map2': {
	// 		'foo': 'map/foo2.0'
	// 	}
	// }
})

// map
// require(['map2', 'map/map', 'foo'], function(map2, map2, map, foo){
// 	console.log(foo)
// })

// Shim
// require(['custom/ga'], function(ga) {
// })

// require(['module.object', 'module.func', 'module.require'], function(mObj, mFunc, mRequire){
// 	//mObj.say();
// 	//console.log(mObj.name)
// })

// require(['compute'], function() {

// })

// require(['circular/a'], function(a) {})

// Path
define('validate', function() {
	return 'hello'
})

//console.log(require('validate'))

require(['./validate/validate'], function(a) {
	console.log(require.toUrl('templates/index')) // 为啥没有加后缀？If require.toUrl() is used, it will add the appropriate extension, if it is for something like a text template.
})

// Bundles
// require(['text', 'main'], function(util, main) {

// })
