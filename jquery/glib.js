;(function() {
	var glib = function() {
		console.log('I am from glib js');
	};

	window.$ = window.glib = glib;
})()