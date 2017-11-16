var require = require.config({
	baseUrl: 'js',
	paths: {
		//'foo': 'lib/foo.1.0',
		'g': 'lib/g',
	},
	map: {
		'*': {
			'foo': 'lib/foo.1.0'
		},
		'card': {
			'foo': 'lib/foo.2.0'
		},
		'g': {
			'foo': 'lib/foo.2.0'
		}
	},
	shim: {
		'g': {
			deps: ['foo'],
			exports: 'myG',
			init: function(foo) {
				console.log('in init:')
				console.log(foo.version);
			}
		}
	}
})

require(['g','foo'], function(g, foo) {
	console.log('in')
	console.log(foo.version);
})