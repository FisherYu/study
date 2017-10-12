define(function() {
	var baseUrl = 'https://sec-m.ctrip.com/restapi';
	var subEnvMap = {
        '12782': {
            fat: 'fat611',
            fws: 'fws'
        },
        '13405': {
            fat: 'fat670',
            fws: 'fws'
        }
    }

	var apiOptions = {
		'isCardHolder': {
			url: 'soa2/12782/isCardHolder.json'
		}
	}
	var modelsCache = {};
	var models = function(api, options) {
		if(!modelsCache[api]) {
			modelsCache[api] = LizardLite.Model(LizardLite.Utils.extend({
				buildurl: function() {
					// url中添加_timestamp的原因：Fix bug FS21CARD-402,
	                // 定位原因：CORS的OPTIONS请求失败，如果下次成功，则发送上次OPTION的data(url发送变化就不会）
	                var url = [baseUrl, '/', this.url, '?_timestamp=', Date.now()].join('');
	                // 传递subEnv主要是解决测试环境多子环境接口调用问题
	                var serviceCode = this.url.match(/soa2\/(\d+)\//)[1];
	                if(subEnvMap[serviceCode] && subEnvMap[serviceCode][_qConfig.envType]) {
	                    url += (url.indexOf('?') === -1 ? '?' : '&') + 'subEnv=' + subEnvMap[serviceCode][Lizard.envType];
	                }
	                return url
				}
			}, apiOptions[api], options));
		}
		return modelsCache[api];
	}

	return models;
})