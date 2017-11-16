define('one',[],function(){
	return {
		name: 'one'
	}
});
define('two',[],function(){
	return {
		name: 'two'
	}
});
define('three',[],function(){
	return {
		name: 'three'
	}
});
require.config({
	baseUrl: 'scripts',
})

require(["one", "two", "three"], function (one, two, three) {
	console.log(one);
	console.log(two);
	console.log(three);
});
define("main", function(){});

