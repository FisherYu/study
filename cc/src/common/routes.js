define(['indexView'], function(indexView) {
	var routes = [
		{
			path: '/',
			component: indexView
		}, 
		{
			path: '*',
			component: {
				template: '<p>Not Found 404</p>'
			}
		}
	];

	return routes;
})