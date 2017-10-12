require.config({
	baseUrl: '/src',
	paths: {
		//lib
		'text': 'lib/text',
		'Vue': 'lib/vue@2.2.4',
		'VueRouter': 'lib/vue-router@2.7.0',
		'Zepto': 'lib/zepto',
		'Deferred': 'lib/deferred',
		'underscore': 'lib/underscore',
		// Common
		'routes': 'common/routes',
		'CardUtil': 'common/cc.util',
		'AdSlider': '//webresource.c-ctrip.com/ResMarketOnline/R2/js/aFrame/aSlider.min',
		// Model
		'model': 'data/model/cc.model',
		// Views
		'indexView': 'views/index/index',
		// Templates
		'indexViewTpl': 'views/index/index.html'
	},
	shim: {
		'LizardLite': {
			exports: 'LizardLite'
		},
		'$': {
			exports: 'Zepto'
		},
		'Deferred': {
			deps: ['Zepto'],
			exports: 'Deferred'
		}
	}
});

require(['Vue', 'VueRouter', 'routes'], function(Vue, VueRouter, routes) {
	Vue.use(VueRouter);

	var router = new VueRouter({
		routes: routes
	});

	new Vue({
		el: '#app',
		router: router
	})
})