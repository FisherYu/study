var BaseModel = require('basemodel.js').BaseModel;

var PaymentWayModel = function(settings){
    
    settings = settings || {};
    settings.url = 'paymentlist/queryv2';

    return new BaseModel(settings);
};

var PayMentV3Model = function(settings){
    
    settings = settings || {};
    settings.url = 'paymentinfo/submitv3';

    return new BaseModel(settings);
};


var PayMentModel = function(settings){
    
    settings = settings || {};
    settings.url = 'paymentinfo/submit';

    return new BaseModel(settings);
};


var ExceptionInfoCollectModel = function(settings){
    
    settings = settings || {};
    settings.url = 'exceptioninfo/update';

    return new BaseModel(settings);
};



module.exports = {
    PaymentWayModel : PaymentWayModel,
    PayMentV3Model : PayMentV3Model,
    PayMentModel : PayMentModel,
    ExceptionInfoCollectModel : ExceptionInfoCollectModel
};
