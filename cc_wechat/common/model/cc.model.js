import { __global, _, cwx} from '../../cwx/cwx.js'

const app = getApp(),
  defaultChannel = 12782,
  apis = {
    isCardHolder: {
      path: 'isCardHolder'
    }
  };

function createModel(path, channel) {
  var url = ['/restapi/soa2', channel || defaultChannel, 'json', path].join('/');
  return function (data, success, fail, complete) {
    if(_.isFunction(data)) {
      complete = fail;
      fail = success;
      success = data;
      data = void 0;
    }
    cwx.request({
      url: url,
      data: data,
      success: success,
      fail: fail,
      complete: complete
    })
  };
}

var models = {};
for (var name in apis) {
  models[name] = createModel(apis[name].path, apis[name].channel);
};

module.exports = models;
