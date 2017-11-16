require.config({
 baseUrl: 'js',
 paths: {
 	'cross': 'https://ctrip.com',
 	'a': 'scripts/a',
 	'a/b': 'scripts/ab',
 	'a/b/c': 'scripts/abc',
 	'index': 'index',
 	'index2': 'index'
 }
})

require(['index', 'index2'])
//console.log(require.toUrl('cross/b/c'))
//console.log(require.toUrl('a/b/c'))
//console.log(require.toUrl('index'))
