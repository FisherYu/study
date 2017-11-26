import { _ } from '../../../../cwx/cwx.js';

var Card = require('basecard.js');
var extend = require('../skyrim/extend.js');

var TrainCard = function (orderEntity, id) {
    this.bizType = orderEntity.BizType;
    this.orderEnity = orderEntity;
    this.id = id;
};

var getInstance = function (orderEntity, id) {
    var instance = new TrainCard(orderEntity, id);
    Card.call(instance);
    return instance;
};

extend(TrainCard, Card);

/**
 * 处理火车票订单状态
 */
TrainCard.prototype.setOrderStatus = function () {

    // 暂存数组
    var arr = [];

    // 实体
    var entity = this.orderEnity || {};

    // 订单基本状态
    var baseStatus = entity.OrderStatusName || '';

    arr.push({statusName: baseStatus});

    // 处理改签状态
    if (_sortChangeStatusName(entity)) {
        arr.unshift({statusName: _sortChangeStatusName(entity)});
    }

    return arr;

};

TrainCard.prototype.initItemsData = function () {

    var trainInfo = this.orderEnity && this.orderEnity.TrainInfo || {},
        passengers = this.orderEnity && this.orderEnity.Passagers || [];

    // check
    if (!trainInfo || _.isEmpty(trainInfo)) {
        this.itemData = {};
        return;
    }

    // 是否是历史订单
    trainInfo.isHistory = false;//this.deviceStatus.isHistory;

    // 更新改签数据
    this.sortOrderChange(trainInfo.Items, trainInfo.ChangedItems, passengers, {
        judgeStatement: '40',
        newKey: 'WayType',
        exceptKey: 'SegmentNo',
        callback: function (item, changedItem) {
            // 更新原机票订单项数据
            for (var para in changedItem) {
                if (changedItem.hasOwnProperty(para)) {
                    if (para !== 'SegmentNo') {
                        item[para] = changedItem[para];
                    }
                }
            }
        }
    });

    // 按车次分组
    _sortGroupByOrder(trainInfo);

    // 处理标志位
    _sortInfoFlags(trainInfo);

    // 处理最终展示数据
    _sortDisplayItems.call(this, trainInfo);

    // 塞入数据
    var self = this;

    this.itemData = {
        orderItems: []
    };

    if (trainInfo.isConnecting) {
        _.each(trainInfo.connectItems, function (orderName) {
            self.itemData.orderItems.push({
                title: orderName[0].title,
                isTypeReturn: false,
                forwardItems: orderName
            });
        });

    } else {
        var lastItems = _.extend(trainInfo.forwardItems, trainInfo.backwardItems);

        _.each(lastItems, function (item) {

            var isForward = parseInt(item[0].wayType, 10) === 1;

            var obj = {
                title: item[0].title,
                forwardItems: isForward ? item : [],
                backwardItems: isForward ? [] : item,
                isTypeReturn: trainInfo.isTypeReturn
            };

            self.itemData.orderItems.push(obj);
        });
    }

    // 仅取第一条
    this.itemsData = this.itemData;
};

var _sortChangeStatusName = function (entity) {
    var info = entity.TrainInfo || {};

    return (info && info.OrderChangeStatusName) || '';
};

/**
 * 分组
 * @param {Object} info TrainInfo数据
 * @param {Array} info.Items 原数据
 * @private
 */
var _sortGroupByOrder = function (info) {

    var groupObj = {};

    var trainNumbers = [];

    // 记录所有车次
    for (var i = 0, len = info['Items'].length; i < len; i++) {
        if ( !(trainNumbers.indexOf(info['Items'][i]['TrainNumber']) > -1) ) { //_.contains(trainNumbers, info['Items'][i]['TrainNumber'])
            trainNumbers.push(info['Items'][i]['TrainNumber']);
        }
    }

    // 分组
    for (var i = 0, len = info['Items'].length; i < len; i++) {

        if (!groupObj[info['Items'][i]['WayType']])// 按SegmentNo分组
            groupObj[info['Items'][i]['WayType']] = {};

        // 遍历所有车次
        for (var j = 0; j < trainNumbers.length; j++) {

            // 按车次分组
            if (!groupObj[info['Items'][i]['WayType']][trainNumbers[j]]) {
                groupObj[info['Items'][i]['WayType']][trainNumbers[j]] = [];
            }

            // 将该乘客所乘坐的航班添加到改乘客的分组中
            if (info['Items'][i]['TrainNumber'] === trainNumbers[j]) {
                groupObj[info['Items'][i]['WayType']][trainNumbers[j]].push(info['Items'][i]);
            }
        }
    }

    // 对每个SegmentNo中的车次进行排序
    for (var objPara in groupObj) {
        if (groupObj.hasOwnProperty(objPara)) {// SegmentNo分组

            for (var passengerPara in groupObj[objPara]) {
                if (groupObj[objPara].hasOwnProperty(passengerPara)) {

                    // 去除车次内容为空的数据
                    if (groupObj[objPara][passengerPara].length === 0) {
                        groupObj[objPara][passengerPara] = null;
                        delete groupObj[objPara][passengerPara];
                    } else {
                        // 去除重复数据
                        var arr = [];
                        for (i = 0; i < groupObj[objPara][passengerPara].length; i++) {
                            for (var j = i + 1; j < groupObj[objPara][passengerPara].length; j++) {
                                var flag = true;
                                for (var p in groupObj[objPara][passengerPara][i]) {
                                    if (groupObj[objPara][passengerPara][i].hasOwnProperty(p)
                                        && groupObj[objPara][passengerPara][j].hasOwnProperty(p)
                                        && p != 'Passagers' && p != 'CarriageNo' && p != 'SeatNo' && p != 'Sequence' && p != 'TicketWindow') {
                                        if (groupObj[objPara][passengerPara][i][p] != groupObj[objPara][passengerPara][j][p]) {
                                            flag = false;
                                            break;
                                        }
                                    }
                                }
                                if (flag) {
                                    groupObj[objPara][passengerPara][i]['Passagers'].push(groupObj[objPara][passengerPara][j]['Passagers'][0]);// 更新乘客列表
                                    groupObj[objPara][passengerPara][i]['CarriageNo'] += ',' + groupObj[objPara][passengerPara][j]['CarriageNo'];
                                    groupObj[objPara][passengerPara][i]['SeatNo'] += ',' + groupObj[objPara][passengerPara][j]['SeatNo'];
                                    arr.push(groupObj[objPara][passengerPara][j]);
                                }
                            }
                        }
                        for (i = 0; i < arr.length; i++) {
                            groupObj[objPara][passengerPara] = groupObj[objPara][passengerPara].without(arr[i]);
                        }
                        // 排序
                        groupObj[objPara][passengerPara].sort(function (a, b) {
                            return Number(a.Sequence) - Number(b.Sequence);
                        });
                    }
                }
            }
        }
    }

    info['SegmentNos'] = groupObj;
};

/**
 * 处理信息标志位
 * @param {Object} info TrainInfo数据
 * @param {Object} info/SegmentNos 排序后的数据
 * @param {Boolean} info.isSingleTrip 是否是单程
 * @param {Boolean} info.isConnecting 是否是联程
 * @param {Boolean} info.isTypeReturn 是否是往返
 * @private
 */
var _sortInfoFlags = function (info) {
    var keys = _.keys(info.SegmentNos).sort();

    info.isSingleTrip = false;      // 是否是单程
    info.isTypeReturn = false;       // 是否是往返
    info.isConnecting = false;      // 是否是联程

    if (!keys.length) {
        return;
    }

    // FIXME OI还没有支持联程和往返的区分，v6.16将往返和联程一同视为往返（wayType最大为2），并移除"去""返"标志
    if (keys.indexOf('3') > -1) {
        info.isConnecting = true;
    } else if (keys.indexOf('2') > -1) {
        info.isTypeReturn = true;
    } else {
        info.isSingleTrip = true;
    }
};

/**
 * 处理最终需要展示的数据
 * @param {Object} info 数据
 * @private
 */
var _sortDisplayItems = function (info) {
    var self = this;
    // 最终经过改签筛选处理过的数据，按航段号和乘客分组
    var data = info.SegmentNos;

    // 根据出发地和目的地再做一次分组
    var cityObj = {};

    // 遍历去程or返程or联程
    _.each(data, function (wayType) {

        // 遍历车次
        _.each(wayType, function (TrainNumber) {

            // 遍历该车次下的信息
            _.each(TrainNumber, function (item) {

                var depTime = item.DepartureDateStr || '',
                    arrTime = item.ArrivalDateStr || '',
                    depStation = item.DepartureStation || '',
                    arrStation = item.ArrivalStation || '',
                    trainNumber = item.TrainNumber || '';

                // 处理展示时间
                var displayTime = (function () {
                    var options;

                    // 火车票到达时间非法
                    var isFault = new Date(depTime.replace(/-/g, '/')) > new Date(arrTime.replace(/-/g, '/'));
                    if (isFault) {
                        options = {
                            fmt: 'MM-dd hh:mm',
                            word: ' 出发',
                            hasNum: false
                        };
                    } else if (info.isHistory) {
                        options = {
                            fmt: 'yyyy-MM-dd',
                            word: ' 出发 ',
                            hasNum: true
                        };
                    }
                    return self.sortDisplay(depTime, arrTime, trainNumber, false, options);
                })();

                // 处理车厢号座位号
                var carriageSeat = _sortCarriageSeat(item);

                var obj = {
                    title: {
                        depCity: depStation,
                        arrCity: arrStation
                    },
                    content: displayTime,
                    subContent: info.isHistory ? '' : (carriageSeat.length ? (trainNumber + ' ' + carriageSeat) : trainNumber),

                    // 分组用
                    wayType: item.WayType,

                    // ios下时间格式问题，用于按出发时间排序
                    depTimeStr: depTime ? depTime.replace(/-/g, '/') : ''
                };

                // 更新完整的车次信息，根据这个来分组
                var orderName = depStation + '-' + arrStation;

                // 按车程分组
                var i = item.WayType;

                if (typeof cityObj[i] === 'undefined') {
                    cityObj[i] = {};
                }

                if (typeof cityObj[i][orderName] === 'undefined') {
                    // 其次按出发地-目的地分组
                    cityObj[i][orderName] = [];
                }

                cityObj[i][orderName].push(obj);
            });

        });
    });

    _sortReOrderByTime(info, cityObj);
};

/**
 * 获取并合并车厢号和座位号
 * @param {Object} info 数据源
 * @returns {string}
 * @private
 */
var _sortCarriageSeat = function (info) {
    var carriage = info.CarriageNo,
        seat = info.SeatNo,
        arr = [],
        flag = false;   // 标志是否超过2个座位号

    if (typeof carriage === 'undefined' && typeof seat === 'undefined') {
        return '';
    }

    // 转换成数组
    carriage = carriage ? carriage.split(',') : '';
    seat = seat ? seat.split(',') : '';

    if (carriage.length && seat.length && carriage.length === seat.length) {
        for (var i = 0, len = carriage.length; i < len; i++) {

            var c = '', s = '', result = '';

            c = (carriage[i] && carriage[i] !== 'undefined') ? carriage[i] + '车' : '';

            s = (seat[i] && seat[i] !== 'undefined') ? seat[i] : '';

            result = c + s;

            if (result) {
                // 座位号大于1个时，显示等
                if (i > 0) {
                    flag = true;
                    break
                }
                arr.push(result);
            }
        }
    }

    if (arr.length) {
        return arr.toString() + (flag ? '等' : '');
    } else {
        return '';
    }
};

/**
 * 数据按出发时间排序
 * @param {Object} info 处理过后的数据
 * @param {Object} obj 处理过后的数据
 * @private
 */
var _sortReOrderByTime = function (info, obj) {

    // 联程直接将obj赋值给connectItems
    if (info.isConnecting) {
        info.connectItems = obj;

        // 联程对每一程都排序
        if (!_.isEmpty(info.connectItems)) {
            for (var c in info.connectItems) {
                if (info.connectItems.hasOwnProperty(c)) {
                    // 以上是程次

                    // 这里对每一个出发地和目的地遍历
                    for (var i in info.connectItems[c]) {
                        if (info.connectItems[c].hasOwnProperty(i)) {
                            if (info.connectItems[c][i] && info.connectItems[c][i].length > 1) {
                                info.connectItems[c][i].sort(function (a, b) {
                                    return (new Date(a.depTimeStr)) - (new Date(b.depTimeStr));
                                });
                            }
                        }
                    }
                }
            }
        }
    } else {
        // 非联程，根据是否是往返分别赋予不同的items
        info.forwardItems = obj['1'];

        // 按出发时间先后排序
        for (var i in info.forwardItems) {
            if (info.forwardItems.hasOwnProperty(i)) {
                if (info.forwardItems[i] && info.forwardItems[i].length > 1) {
                    info.forwardItems[i].sort(function (a, b) {
                        return (new Date(a.depTimeStr)) - (new Date(b.depTimeStr));
                    });
                }
            }
        }

        if (info.isTypeReturn) {
            info.backwardItems = obj['2'];

            // 按出发时间先后排序
            for (var i in info.backwardItems) {
                if (info.backwardItems.hasOwnProperty(i)) {
                    if (info.backwardItems[i] && info.backwardItems[i].length > 1) {
                        info.backwardItems[i].sort(function (a, b) {
                            return (new Date(a.depTimeStr)) - (new Date(b.depTimeStr));
                        });
                    }
                }
            }
        }
    }
};

module.exports = {
    getInstance: getInstance
};