import { _ } from '../../../../cwx/cwx.js';
var Depot = require('./depot.js');
var scrollIohelper = require('./iohelper.js');
var scrollCard = require('./card.js');

var libs = {
    'cardScroll': scrollCard,
    'iohelperScroll': scrollIohelper
};

/**
 * @method _deepClone
 * 深拷贝
 * @param {object} obj  需要深拷贝的对象
 * @returns {object}
 * @private
 */
var _deepClone = function (obj) {
    if (obj && obj instanceof Array) {
        var newArr = [];

        for (var i = 0; i < obj.length; i++) {
            newArr[i] = _deepClone(obj[i]);
        }

        return newArr;
    } else if (obj && obj instanceof Object) {
        var newObj = {};

        for (var attr in obj) {
            newObj[attr] = _deepClone(obj[attr]);
        }

        return newObj;
    } else {
        return obj;
    }
};

/**
 * @method _getFilesConfigs
 * @param {string} fileName 卷轴的文件名
 * @returns {object} 对应卷轴的当期配置
 * 获取对应文件的卷轴当期配置信息信息
 */
var _getFilesConfigs = function (fileName) {
    var deportConfig = Depot.depotConfig;

    var files = deportConfig.files; // 库配置 array

    if (typeof fileName === 'undefined') {
        return;
    }

    return _.find(files, function (obj) {
        return obj.fileName === fileName;
    });
};

/**
 * @method _getScrollName
 * 获取卷轴名字
 * @param   {string} fileName   卷轴的文件名
 * @returns {string}            卷轴名字
 */
var _getScrollName = function (fileName) {
    var targetFileConfigs = _getFilesConfigs(fileName);

    return _.result(targetFileConfigs, 'scrollName');
};

/**
 * @method _getRequireKey
 * @param   {string} fileName   卷轴的文件名
 * @returns {string}            引用的配置表的key
 * @private
 */
var _getRequireKey = function (fileName) {
    var targetFileConfigs = _getFilesConfigs(fileName);

    return _.result(targetFileConfigs, 'requireKey');
};

/**
 * @method _hasRequireKey
 * 是否有requireKey这个key
 * @param {string} fileName   卷轴的文件名
 * @private
 */
var _hasRequireKey = function (fileName) {
    var targetFileConfigs = _getFilesConfigs(fileName);

    return _.has(targetFileConfigs, 'requireKey');
};

/**
 * @method _getRequireParams
 * 通过requireScrollId获取相应的参数
 * @param {string} fileName         卷轴的文件名
 * @param {Array} targetObj         卷轴的文件名
 * @param {Array} lib               卷轴的文件名
 * @private
 */
var _getRequireParams = function (fileName, targetObj, lib) {
    var paramValueObj = {};
    if (_.has(targetObj, 'requireScrollId')) {
        var requireKey = _getRequireKey(fileName);

        var baseConfig = _.find(lib, function (o) {
            return o.scrollId === targetObj.requireScrollId;
        });

        _.each(targetObj[requireKey], function (item) {
            var baseConfigParamObj = _.find(baseConfig[requireKey], function (i) { // baseConfigParamObj -> {paramId: 1, paramValue: {'OrderId': ''}}
                return item === i.paramId;
            });

            _.extend(paramValueObj, _.result(baseConfigParamObj, 'paramValue'));
        });

        targetObj[requireKey].length = '';

        targetObj[requireKey] = paramValueObj;
    }

    return targetObj;
};

/**
 * @method getScrollId
 * 获取某条配置的scrollId
 * @param {string} fileName     卷轴的文件名
 * @param {Array} scrollType    可选，配置的类型，有可能传进来一系列当期需要的所有配置类型 e.g. ['008-1', '008-2', '008-3']...
 * @returns {Array}             卷轴id
 */
var getScrollId = function (fileName, scrollType) {
    var targetFileConfigs = _getFilesConfigs(fileName),
        scrollInfo = targetFileConfigs.scrollInfo;

    // 若未提供scrollType，则返回选中scroll当期用到的所有id
    if (typeof scrollType === 'undefined') {
        var scrollAllIdArr = [];

        _.each(scrollInfo, function (obj) {
            scrollAllIdArr.push(obj.scrollId);
        });

        return scrollAllIdArr;
    } else {
        var targetIdArr = [];

        _.each(scrollType, function (item) {
            var findOneObj = _.find(scrollInfo, function (obj) {
                return obj.scrollType === item;
            });

            if (typeof findOneObj !== 'undefined') {
                var tempId = _.result(findOneObj, 'scrollId');
                targetIdArr.push(tempId);
            } else {
                //...
            }
        });

        return targetIdArr;
    }

};

/**
 * @method getTargetValue
 * 从scroll中获取目标值
 * @param {string} fileName         卷轴的文件名
 * @param {Array} scrollType        配置的类型，有可能传进来一系列当期需要的所有配置类型，e.g. address.js
 * @param {string} [targetKey]        目标值的key
 * @returns {string|object|null}    目标值|目标配置|null
 * @example getTargetValue('portal', ['reloadHTTP']) -> 返回 [{scrollId: '605-01-006-0001-7', scrollType: '006-1', portalModel: 'reloadHTTP', targetModel: 0}]
 *          getTargetValue('portal', ['reloadHTTP'], 'targetModel') -> 返回 [0]
 */
var getTargetValue = function (fileName, scrollType, targetKey) {

    if (arguments.length === 2 && typeof scrollType === 'string') {
        targetKey = scrollType;
        scrollType = undefined;
    }

    // 获取匹配到的scrollId
    var scrollIdArr = getScrollId(fileName, scrollType);

    // 获取卷轴名字
    var scrollName = _getScrollName(fileName);

    // 获取对应scrollId的整条配置
    if (scrollIdArr && scrollIdArr instanceof Array) {
        var targetObjArr = [];

        _.each(scrollIdArr, function (item) {
            var lib = libs[scrollName][scrollName],
                tempLib = _deepClone(lib);

            var tempTargetObj = _.filter(tempLib, function (obj) {
                return obj.scrollId === item;
            });

            tempTargetObj = tempTargetObj[0];

            // 若有'requireScrollId'，要出相关配置项中找到需要的参数，
            // 这才是最终的targetObjArr
            if (_hasRequireKey(fileName)) {
                tempTargetObj = _getRequireParams(fileName, tempTargetObj, tempLib);
            }

            targetObjArr.push(tempTargetObj);
        });
    } else {
        return null;
    }

    if (typeof targetKey !== 'undefined' || arguments.length === 2 && typeof scrollType === 'string') { // 返回目标值
        var targetValueArr = [];

        _.each(targetObjArr, function (obj) {
            var tempTargetValue = _.pick(obj, targetKey)[targetKey];
            targetValueArr.push(tempTargetValue);
        });

        return targetValueArr;
    } else { // 返回整条配置
        return targetObjArr;
    }
};

module.exports = {
    getTargetValue: getTargetValue
};