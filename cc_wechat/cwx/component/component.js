import { cwx, CPage } from '../cwx.js';

var components = {
    city: '/cwx/component/city/city',
    calendar: '/cwx/component/calendar/calendar',
    imagebrowser: '/cwx/component/imagebrowser/imagebrowser'
};

var component = {};
for( var name in components ) {
    ( function( name ) {
        component[ name ] = function(data, callback) {
            var opts = data;
            if (arguments.length > 1){
                opts = {
                    data: data,
                    callback: callback
                };
            }
            var currentPage = cwx.getCurrentPage();
            opts.url = components[ name ];
            currentPage.navigateTo(opts);
        };
    })( name );
}

module.exports = component;