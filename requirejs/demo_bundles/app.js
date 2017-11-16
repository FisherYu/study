require.config({
	baseUrl: 'js',
	paths: {
		primary: 'primary/jspath',
		//main: 'main'
	},
	bundles: {
		'./primary': ['main', 'util']
	}
})

require(['main'])
console.log(require.toUrl('main'))