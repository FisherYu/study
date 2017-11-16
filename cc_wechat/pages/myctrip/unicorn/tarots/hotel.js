import { _ } from '../../../../cwx/cwx.js';

var Card = require('basecard.js');
var extend = require('../skyrim/extend.js');

function HotelCard(orderEntity, id) {
    this.bizType = orderEntity.BizType;
    this.orderEnity = orderEntity;
    this.id = id;
}

function getInstance(orderEntity, id) {
    var instance = new HotelCard(orderEntity, id);
    Card.call(instance);
    return instance;
}

extend(HotelCard, Card);

// 酒店业务数据处理
HotelCard.prototype.initItemsData = function () {
    if (this.itemProperty && this.itemProperty.orderItem) {
        var info = {},
            orderItems = this.orderEnity[this.itemProperty.orderItem];

        for (var i = 0, len = orderItems.length; i < len; i++) {
            var orderItem = orderItems[i],
                address = orderItem.HotelAddress || '',
                startTime = orderItem[this.itemProperty.startTime].toDate(8).fnGetDateFormat('yyyy-MM-dd') || '',
                endTime = orderItem[this.itemProperty.endTime].toDate(8).fnGetDateFormat('yyyy-MM-dd') || '',
                nightAmount = orderItem.NightAmount,
                roomAmount = orderItem.RoomAmount,
                todayYear = new Date().getFullYear().toString(); // 当前年份

            var startYear = startTime.split('-')[0],
                endYear = endTime.split('-')[0],
                isCrossYear = startYear === endYear ? 0 : 1;

            if (!isCrossYear && todayYear === startYear && todayYear === endYear) { // 显示月-日
                startTime = startTime.substring(5);
                endTime = endTime.substring(5);
            }

            // 含年的 需要折行显示
            var isBreakLine = !!isCrossYear || todayYear !== startYear && todayYear !== endYear;
            var middleWord = isBreakLine ? ' 至\n' : ' 至 ';
            var checkInfo = startTime + middleWord + endTime + '  ' + nightAmount + '晚/' + roomAmount + '间';

            info = {
                content: address,   // 酒店地址
                subContent: checkInfo // 格式：6-12至6-14 3晚/1间
            };

            this.itemData.push(info);
        }
    }
    // 仅取第一条
    this.itemsData = this.itemData[0] || {};
};

HotelCard.prototype.setProductName = function () {
    return this.orderEnity[this.itemProperty.orderItem]
        && this.orderEnity[this.itemProperty.orderItem].length > 0
        && this.orderEnity.OrderName || this.orderEnity[this.itemProperty.orderItem][0].ProductName;
};

// 处理价格前的符号
HotelCard.prototype.setOrderCurrency = function () {
    if (this.itemProperty && this.itemProperty.Currency) {
        var currency = this.orderEnity[this.itemProperty.Currency];

        if (currency && currency === 'RMB' || currency === 'CNY') {
            return '¥';
        } else {
            return currency;
        }
    }
};

module.exports = {
    getInstance: getInstance
};