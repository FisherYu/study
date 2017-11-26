var BaseStore = require('basestore.js').BaseStore;

var OrderDetailStore = function(settings){
    
    settings = settings || {};
    settings.key = 'PAYMENT_ORDER_DETAIL_STORE';

    return new BaseStore(settings);
};

var OrderDetailExtendStore = function(settings){
    
    settings = settings || {};
    settings.key = 'PAYMENT_ORDER_DETAIL_EXTEND_STORE';

    return new BaseStore(settings);
};


var PayResultOrderStore = function(settings){
    
    settings = settings || {};
    settings.key = 'PAYMENT_RESULT_ORDER_STORE';

    return new BaseStore(settings);
};

var PayParamsStore = function(settings){
    
    settings = settings || {};
    settings.key = 'PAYMENT_PARAMS_STORE';

    return new BaseStore(settings);
};


module.exports = {
    OrderDetailStore : OrderDetailStore,
    OrderDetailExtendStore : OrderDetailExtendStore,
    PayResultOrderStore : PayResultOrderStore,
    PayParamsStore : PayParamsStore
};
