require.config({
	baseUrl: 'scripts',
	 paths: {
        'jquery': 'lib/jquery'
    }
})

// with jquery
require(['jquery'], function($) {
	
})

// Demo build
// require(["one", "two", "three", 'jquery'], function (one, two, three) {
// 	console.log(one);
// 	console.log(two);
// 	console.log(three);
// });