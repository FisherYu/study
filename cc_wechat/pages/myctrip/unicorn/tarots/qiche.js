import { _ } from '../../../../cwx/cwx.js';

var Card = require('basecard.js');
var extend = require('../skyrim/extend.js');

var QiCheCard = function (orderEntity, id) {
    this.bizType = orderEntity.BizType;
    this.orderEnity = orderEntity;
    this.id = id;
};

var getInstance = function (orderEntity, id) {
    var instance = new QiCheCard(orderEntity, id);
    Card.call(instance);
    return instance;
};

extend(QiCheCard, Card);

QiCheCard.prototype.initItemsData = function () {

    if (!this.itemProperty || !this.itemProperty.orderItem) {
        return;
    }

    var orderItems = this.orderEnity[this.itemProperty.orderItem];  // Array

    var self = this;

    _.each(
        orderItems,
        /**
         * 遍历
         * @param {Object} item 单条数据
         * @param {String} item.FetcherCode 取票号
         * @param {String} item.FetcherPassword 取票密码
         * @param {String} item.FetcherOrderID 取票订单号
         */
        function (item) {
            var info = {
                title: _sortDisplayName(item) || {},
                content: _sortArrivalTime(item) || ''
            };

            // 取票号
            if (item.FetcherCode && !self.isHistory) {
                info.subContent1 = '取票号: ' + item.FetcherCode;
            }

            // 取票密码
            if (item.FetcherPassword && !self.isHistory) {
                info.subContent2 = '取票密码: ' + item.FetcherPassword;
            }

            // 取票订单号
            if (item.FetcherOrderID && !self.isHistory) {
                info.subContent3 = '取票订单号: ' + item.FetcherOrderID;
            }

            self.itemData.push(info);
        }
    );

    // 仅取第一条
    this.itemsData = this.itemData[0] || {};
};

/**
 * 处理出发到达名称展示问题
 * @param {Object} item 单条数据
 * @param {String} item.DepartureCityName 出发城市名称
 * @param {String} item.DepartureStationName 出发车站名称
 * @param {String} item.ArrivalCityName 到达城市名称
 * @param {String} item.ArrivalStationName 到达车站名称
 * @returns {{depDisplay: *, arrDisplay: *}}
 * @private
 */
var _sortSingleName = function (item) {
    var depCityName = item.DepartureCityName || '',
        depStationName = item.DepartureStationName || '',
        arrCityName = item.ArrivalCityName || '',
        arrStationName = item.ArrivalStationName || '';

    var depDisplay = depStationName && depStationName.indexOf(depCityName) === 0 ? depStationName || '' : (depCityName + depStationName) || '',
        arrDisplay = arrStationName && arrStationName.indexOf(arrCityName) === 0 ? arrStationName || '' : (arrCityName + arrStationName) || '';

    return {
        depDisplay: depDisplay,
        arrDisplay: arrDisplay
    };
};

/**
 * 处理出发到达名称展示问题，车站名称可能包含城市名称，直接相加会特别长，此处特殊处理
 * @return {Object}
 * @private
 */
var _sortDisplayName = function (item) {

    var obj = _sortSingleName(item);

    return {
        depCity: obj.depDisplay || '',
        arrCity: obj.arrDisplay || ''
    };

};

/**
 * 处理时间展示
 * @param {Object} item 单条数据
 * @param {String} item.DepartureDateStr 出发时间字符串
 * @returns {String}
 * @private
 */
var _sortArrivalTime = function (item) {
    return (item.DepartureDateStr + ' 出发') || '';
};

module.exports = {
    getInstance: getInstance
};