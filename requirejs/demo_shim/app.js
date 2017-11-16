require.config({
	baseUrl: 'js',
	paths: {
		'lib': 'lib'
	},
	shim: {
		'lib/g': {
			exports: 'myG'
		}
	}
})

require(['lib/g'], function(g) {
	console.log(g.name)
})