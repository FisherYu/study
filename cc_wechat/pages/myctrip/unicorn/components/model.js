import { cwx } from '../../../../cwx/cwx.js';

var common = require('common.js');

function Model (options) {
    options = typeof options === 'undefined' ? {} : options;
    var callbacks = options.callbacks || {};

    this.url = options.url || '';
    this.params = this.buildParam(options.params);
    this.onSuccess = typeof callbacks.onSuccess === 'function' ? callbacks.onSuccess : null;
    this.onError = typeof callbacks.onError === 'function' ? callbacks.onError : null;
    this.onComplete = typeof callbacks.onComplete === 'function' ? callbacks.onComplete : null;
}

Model.prototype.execute = function () {
    if (!this.url) {
        return;
    }

    var self = this;

    cwx.request({
        url: self.url,
        data: self.params,
        success: function (data) {
            if (data && data.statusCode == 200) { // 某些安卓机下发的是"200" 坑
                if (data.data && data.data.ResponseStatus && data.data.ResponseStatus.Ack === 'Success') {
                    self.onSuccess && self.onSuccess(data.data);
                    return; // 单条退出
                }
            }

            self.onError && self.onError(data);
        },
        fail: function (data) {
            self.onError && self.onError(data);
        },
        complete: function (data) {
            self.onComplete && self.onComplete(data);
        }
    });
};

Model.prototype.buildParam = function (params) {
    var data = {
        "ClientVersion": common.device.getClientVersion(),
        "Channel": common.device.getChannel(),
        "contentType": "json"
    };

    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            data[ key ] = params[ key ];
        }
    }
    return data;
};

module.exports = Model;

