import { _ } from '../../../../cwx/cwx.js';

var Card = require('basecard.js');
var extend = require('../skyrim/extend.js');

var PiaoCard = function (orderEntity, id) {
    this.bizType = orderEntity.BizType;
    this.orderEnity = orderEntity;
    this.id = id;
};

var getInstance = function (orderEntity, id) {
    var instance = new PiaoCard(orderEntity, id);
    Card.call(instance);
    return instance;
};

extend(PiaoCard, Card);

// content格式： 06-18 使用  1张
PiaoCard.prototype.initItemsData = function () {
    if (this.itemProperty && this.itemProperty.orderItem) {
        var info = null,
            orderItems = this.orderEnity[this.itemProperty.orderItem];

        for (var i = 0, len = orderItems.length; i < len; i++) {
            var orderItem = orderItems[i],
                startTime = orderItem[this.itemProperty.startTime].toDate(8).fnGetDateFormat('MM-dd'), // 出发时间
                quantity = orderItem.Quantity;

            info = {
                content: startTime + ' 使用  ' + quantity + '张' // 设置文案内容
            };

            this.itemData.push(info);
        }
    }
    // 仅取第一条
    this.itemsData = this.itemData[0] || {};
};

// 使用orderName
PiaoCard.prototype.setProductName = function () {
    var orderName;
    if (this.itemProperty && this.itemProperty.OrderName) {
        orderName = this.orderEnity[this.itemProperty.OrderName];
    } else if (this.orderEnity[this.itemProperty.orderItem] && this.orderEnity[this.itemProperty.orderItem].length > 0) {
        orderName = this.orderEnity[this.itemProperty.orderItem][0].ProductName;
    }
    return orderName || '';
};

module.exports = {
    getInstance: getInstance
};