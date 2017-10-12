import { CPage } from '../ext/global.js';

var config = {
    init: function(){
        CPage.use('Navigator');
        CPage.use('UBT');
    },
	ubtDebug: false
};

module.exports = config;
