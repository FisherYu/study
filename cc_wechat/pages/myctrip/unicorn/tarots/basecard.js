import { _ } from '../../../../cwx/cwx.js';

var scrollLibrarian = require('../scrolls/librarian.js');

/**
 * 卡片基础类
 * @constructor
 */
function Card() {
    this.baseData = {};
    this.itemData = [];
    this.actionData = {};
}

/**
 * 卡片初始化
 */
Card.prototype.init = function () {
    this.setDefaultScroll(); // 加载默认配置库
    this.setPrivateScroll(); // 加载个性化配置库
};

/**
 * @method 设置默认配置 配置公共部分(icon,templateid)
 * @override
 */
Card.prototype.setDefaultScroll = function () {
    this.cardLibrarian = scrollLibrarian.getTargetValue('card', [this.id]);
    this.cardLibrarian = this.cardLibrarian && this.cardLibrarian.length > 0 && (this.cardLibrarian)[0] || null;
};

/**
 * @method 设置个性化配置
 * @abstract
 */
Card.prototype.setPrivateScroll = function () {
};

/**
 * @method 数据处理
 * @override
 */
Card.prototype.initCardData = function () {
    this.heterogeneousData(); // 数据异构
    this.handlerData(); // 业务数据处理
};

/**
 * @method 数据异构 默认通过配置库进行异构，只异构卡片业务数据。特殊BU（飞机票，火车票有改签、空铁等订单，需要重写）
 * @override
 */
Card.prototype.heterogeneousData = function () {
    // 根据Scroll获取卡片业务数据结构统一标准
    this.itemProperty = scrollLibrarian.getTargetValue('iohelper', [this.id], 'buKeys');
    this.itemProperty = this.itemProperty && this.itemProperty.length > 0 && this.itemProperty[0] || null;
};

/**
 * @method 处理业务数据
 * @override
 */
Card.prototype.handlerData = function () {
    this.initBaseData(); // BaseData
    this.initItemsData(); // InfoData
    this.initActionsData(); // ActionData
};

/**
 * @method 处理基础数据
 * @override
 */
Card.prototype.initBaseData = function () {
    this.baseData.bizType = this.setBizType();
    this.baseData.icon = this.setIcon(); // icon
    this.baseData.cancelClass = this.setCancelClass(); // 已取消订单样式
    this.baseData.templateId = this.cardLibrarian && this.cardLibrarian.templateInfo && this.cardLibrarian.templateInfo.tplId || ''; // templateId
    this.baseData.orderStatus = this.setOrderStatus(); // 设置orderStatus
    this.baseData.orderCurrency = this.setOrderCurrency(); // 设置OrderCurrency
    this.baseData.orderTotalPrice = this.setOrderTotalPrice(); // 设置OrderTotalPrice
    this.baseData.orderProductName = this.setProductName(); // 设置OrderProductName
    this.baseData.orderId = this.orderEnity.OrderID; // 设置orderId
    this.setPrivateBaseData();
};

/**
 * 设置bizType，区分埋点
 */
Card.prototype.setBizType = function () {
    return this.bizType || '';
};

/**
 * @method 设置卡片icon
 * @returns {*|string}
 */
Card.prototype.setIcon = function () {
    return this.cardLibrarian && this.cardLibrarian.templateInfo && this.cardLibrarian.templateInfo.iconClassName || '';
};

Card.prototype.setCancelClass = function () {
    var className = '';
    if (this.orderEnity.OrderStatusName === '已取消'
        || this.orderEnity.OrderStatusName === '取消'
        || this.orderEnity.OrderStatusName === '已经取消') {
        className = 'order-cancel'
    }
    return className;
};


/**
 * @method 设置订单状态
 * @returns {Object} 返回状态集合
 * @override
 */
Card.prototype.setOrderStatus = function () {
    return [
        {statusName: this.orderEnity.OrderStatusName}
    ];
};

/**
 * @method 设置默认货币
 * @returns {string}
 * @override
 */
Card.prototype.setOrderCurrency = function () {
    return '¥';
};

/**
 * @method 设置默认订单总价
 * @returns {string|number}
 * @override
 */
Card.prototype.setOrderTotalPrice = function () {
    return this.orderEnity.OrderTotalPrice;
};

/**
 * @method 设置默认订单名称
 * @returns {*|boolean|string}
 */
Card.prototype.setProductName = function () {
    return this.orderEnity && this.orderEnity.OrderName || '';
};

/**
 * @method 设置BU私有基础数据
 */
Card.prototype.setPrivateBaseData = function () {
};

/**
 * @method 处理业务数据，各bu按业务自己处理
 * @override
 */
Card.prototype.initItemsData = function () {
};

Card.prototype.initActionsData = function () {
    var actions = this.orderEnity && this.orderEnity.OrderActions;
    var detailActionCode = ['Detail', 'ReadOrder', 'OrderDetailLink', 'ViewOrderDetail', 'ToDetail', 'OrderDetail', 'ViewOrderInfo', 'ViewDetail'];

    for (var i = 0, len = actions.length; i < len; i++) {
        if (detailActionCode.indexOf(actions[i].ActionCode) > -1) {
            actions[i].ActionCode = 'Detail';
        }
    }
    this.actionData = actions;
};

Card.prototype.getActionData = function () {
    return this.actionData;
};

Card.prototype.getRenderData = function () {
    return {
        baseData: this.baseData,
        itemDate: this.itemsData
    }
};

/**
 *
 * @param items
 * @param changedItems
 * @param passengers
 * @param {object}  [changeOptions]   自定义参数
 * @param {string}  [changeOptions.judgeStatement]    判断依据
 * @param {string|array} [changeOptions.newKey]   自主更新所需的字段，可以是一个，也可以是多个（数组）
 * @param {function} [changeOptions.callback]   更新方法
 */
Card.prototype.sortOrderChange = function (items, changedItems, passengers, changeOptions) {
    if (!items || !changedItems) {
        return;
    }
    if (!changeOptions) {
        changeOptions = {};
    }

    for (var i = 0; i < items.length; i ++) {
        // 判断如果是新增的item则不循环
        if (items[i].flag) {
            items[i].flag = null;
            delete items[i].flag;
            continue;
        }

        for (var j = 0; j < changedItems.length; j++) {
            if (changeOptions.judgeStatement && changedItems[j]['OrderChangeStatus'] !== changeOptions.judgeStatement) {
                continue;
            }
            // 航程为单程的情况
            // 更新原航班的航班信息
            if (!items[i]['Sequence'] || items[i]['Sequence'] == changedItems[j]['Sequence']) {
                changedItems[j]['Passagers'] = changedItems[j]['Passagers'].unique();

                if (!_.isEqual(changedItems[j]['Passagers'].sort(), passengers.sort())) {

                    // 机票和火车票这里需要更新不同的字段
                    if (changeOptions.newKey) {
                        if (typeof changeOptions.newKey === 'string') {
                            changedItems[j][changeOptions.newKey] = items[i][changeOptions.newKey];
                        } else if (changeOptions.newKey instanceof Array) {
                            for (var zz = 0, lenZz = changeOptions.newKey.length; zz < lenZz; zz++) {
                                changedItems[j][changeOptions.newKey[zz]] = items[i][changeOptions.newKey[zz]];
                            }
                        }
                    }

                    // 置个标志位，下次遍历items时不遍历新增的item
                    changedItems[j].flag = true;

                    // 新增
                    items.splice(i + 1, 0, changedItems[j]);

                    // 原航段中更新乘客信息
                    if (items[i]['Passagers'].length === 0) {
                        for (var k = 0; k < passengers.length; k++) {
                            items[i]['Passagers'].push(passengers[k]);
                        }
                    }
                    for (var k = 0; k < changedItems[j]['Passagers'].length; k++) {
                        items[i]['Passagers'] = items[i]['Passagers'].without(changedItems[j]['Passagers'][k]);

                        // 如果乘客分发完了，初始信息中的乘客为空时，表明所有乘客均已改签完成，初始信息就是冗余的，需要剔除
                        if (items[i]['Passagers'].length === 0) {
                            items.splice(i, 1);
                        }
                    }
                } else {
                    if (changeOptions.callback && typeof changeOptions.callback === 'function') {
                        changeOptions.callback(items[i], changedItems[i]);
                    } else {
                        for (var para in changedItems[j]) {
                            items[i][para] = changedItems[j][para];
                        }
                    }
                }
            }
        }
    }
};

Card.prototype.sortDisplay = function (depTime, arrTime, num, isNoHM, options) {
    if (!depTime || !arrTime) {
        return '';
    }

    if (options && !_.isEmpty(options)) {
        return depTime.formatDate(options.fmt || 'yyyy-MM-dd') +
            (options.word || ' 出发 ') +
            (options.hasNum ? num : '');
    }

    var depTimeYear = depTime.formatDate('yyyy'),
        depTimeMD = depTime.formatDate('MM-dd'),
        arrTimeYear = arrTime.formatDate('yyyy'),
        arrTimeMD = arrTime.formatDate('MM-dd');

    // 判断是否跨年，同一日
    var isCrossYear = (depTimeYear !== arrTimeYear) && ((+arrTimeYear) - (+depTimeYear) > 0),
        isSameDay = !isCrossYear && (depTimeMD === arrTimeMD);

    var isNotThisYear = !isCrossYear && depTimeYear != (new Date().getFullYear());

    // 跨年订单需要显示 年-月-日 时:分
    if (isCrossYear || isNotThisYear) {
        // 惠选订单不显示 时:分
        var fmt = isNoHM ? 'yyyy-MM-dd' : 'yyyy-MM-dd hh:mm';

        return depTime.formatDate(fmt) + ' 至\n' + arrTime.formatDate(fmt);
    } else {
        // 同年月日时，到达时间只需要显示时:分
        var fmt2 = isSameDay ? ['MM-dd hh:mm', 'hh:mm'] : ['MM-dd hh:mm', 'MM-dd hh:mm'];

        return depTime.formatDate(fmt2[0]) + ' 至 ' + arrTime.formatDate(fmt2[1]);
    }
};

module.exports = Card;
