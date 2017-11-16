import { _ } from '../../../../cwx/cwx.js';

var Card = require('basecard.js');
var extend = require('../skyrim/extend.js');

var FlightCard = function (orderEntity, id) {
    this.bizType = orderEntity.BizType;
    this.orderEnity = orderEntity;
    this.id = id;
};

var getInstance = function (orderEntity, id) {
    var instance = new FlightCard(orderEntity, id);
    Card.call(instance);
    return instance;
};

extend(FlightCard, Card);

/**
 * 处理机票订单状态
 */
FlightCard.prototype.setOrderStatus = function () {

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

    // 处理航变状态
    if (_sortAirChange(entity)) {
        arr.unshift({statusName: _sortAirChange(entity)});
    }

    return arr;

};

FlightCard.prototype.initItemsData = function () {
    var flightInfo = this.orderEnity && this.orderEnity.FlightInfo || {},
        passengers = this.orderEnity && this.orderEnity.Passagers || [];

    var trainItems = flightInfo.TrainItems || [];

    // 判断是否是国内机票，需要梳理改签信息
    var isDomestic = this.orderEnity && this.orderEnity.BizType === 'FlightDomestic';

    // 判断是否是空铁
    var isFlightAndTrain = !!(trainItems && trainItems.length);

    // 置入空铁标志
    flightInfo.isFlightAndTrain = !!(trainItems && trainItems.length);

    // 是否是历史订单
    flightInfo.isHistory = false;//this.deviceStatus.isHistory;

    // 处理航变
    this.sortOrderChange(flightInfo.Items, flightInfo.AirChangedItems, passengers, {
        newKey: 'SegmentNo',
        callback: function (item, changedItem) {
            updateChangedItems(item, changedItem);
        }
    });

    // 国内机票，且不是空铁组合，需要梳理改签信息
    if (isDomestic && !isFlightAndTrain) {
        // 根据原items和改签后的changeItems以及最外层的passengers处理并更新items数据
        this.sortOrderChange(flightInfo.Items, flightInfo.ChangedItems, passengers, {
            judgeStatement: 'S',
            newKey: 'SegmentNo',
            callback: function (item, changedItem) {
                updateChangedItems(item, changedItem);
            }
        });
    }

    // 根据乘客信息分组排序
    _sortGroupByOrder(flightInfo, passengers);

    // 处理标志位
    _sortInfoFlags(flightInfo);

    // 处理最终展示数据
    _sortDisplayItems.call(this, flightInfo);

    // 塞入数据
    if (flightInfo.isConnecting) {
        var self = this;

        this.itemData = {
            orderItems: []
        };

        _.each(flightInfo.connectItems, function (segement) {
            self.itemData.orderItems.push({
                title: segement && segement.length && segement[0].title || '',
                isTypeReturn: false,
                forwardItems: segement
            });
        });

    } else {
        this.itemData = {
            orderItems: [
                {
                    title: flightInfo && flightInfo.forwardItems && flightInfo.forwardItems.length && flightInfo.forwardItems[0].title || '',
                    forwardItems: flightInfo.forwardItems,
                    backwardItems: (flightInfo.isTypeReturn ? flightInfo.backwardItems : []),
                    isTypeReturn: flightInfo.isTypeReturn
                }
            ]
        };
    }

    this.itemsData = this.itemData;

};

/**
 * 更新机票信息
 * @param item
 * @param changedItem
 */
function updateChangedItems (item, changedItem) {
    item['FlightNo'] = changedItem['FlightNo'];
    item['Passagers'] = changedItem['Passagers'];
    item['DepartureDateTime'] = changedItem['DepartureDateTime'];
    item['DepartureCity'] = changedItem['DepartureCity'];
    item['ArrivalDateTime'] = changedItem['ArrivalDateTime'];
    item['ArrivalCity'] = changedItem['ArrivalCity'];
    item['DepTerminal'] = changedItem['DepTerminal']; // 机票航站楼
}

var _sortAirChange = function (entity) {
    var FlightInfo = entity && entity.FlightInfo || {};

    var AirChangedItems = FlightInfo.AirChangedItems;

    if (AirChangedItems && AirChangedItems instanceof Array && AirChangedItems.length) {
        return '航变';
    } else {
        return '';
    }
};

var _sortChangeStatusName = function (entity) {

    var info = entity.FlightInfo || {};

    return (info && info.OrderChangeStatusName) || '';
};

/**
 * 根据乘客信息分组
 * @param {Object} info FlightInfo数据
 * @param {Array} info.Items 原数据
 * @param {Array} passengers 最外层总乘客数据
 * @private
 */
var _sortGroupByOrder = function (info, passengers) {

    var obj = {};

    var items = info.Items;

    for (var i = 0, len = items.length; i < len; i++) {

        if (!obj[items[i]['SegmentNo']]) {
            // 按SegmentNo分组
            obj[items[i]['SegmentNo']] = {};
        }

        // 遍历所有乘客
        for (var j = 0; j < passengers.length; j++) {

            // 按乘客分组
            if (!obj[items[i]['SegmentNo']][passengers[j]]) {
                obj[items[i]['SegmentNo']][passengers[j]] = [];
            }

            // 如果乘客为空，表示该航程未改签，乘客为所有乘客
            if (!items[i]['Passagers'] || items[i]['Passagers'].length === 0) {
                items[i]['Passagers'] = passengers;
            }

            // 将该乘客所乘坐的航班添加到改乘客的分组中
            if (items[i]['Passagers'].indexOf(passengers[j]) > -1) { //_.contains(items[i]['Passagers'], passengers[j])
                obj[items[i]['SegmentNo']][passengers[j]].push(items[i]);
            }
        }
    }

    // 去除重复乘客航程，并按照Sequence排序
    // 遍历航段 SegmentNo
    for (var objPara in obj) {
        if (obj.hasOwnProperty(objPara)) {// SegmentNo分组
            // 去除相同的乘客分组
            for (var passagerPara in obj[objPara]) {
                if (obj[objPara].hasOwnProperty(passagerPara)) {
                    for (var para in obj[objPara]) {
                        if (obj[objPara].hasOwnProperty(para)) {
                            // 人不同，数据相同，剔除数据，之后可能需要加上乘客
                            if (passagerPara != para && _.isEqual(obj[objPara][passagerPara], obj[objPara][para])) {
                                obj[objPara][passagerPara] = null;
                                delete obj[objPara][passagerPara];
                                break;
                            }
                        }
                    }
                    if (obj[objPara][passagerPara]) {
                        //每个乘客分组按Sequence排序
                        obj[objPara][passagerPara].sort(function (a, b) {
                            return parseInt(a.Sequence, 10) - parseInt(b.Sequence, 10);
                        });
                    }
                }
            }
        }
    }

    info['SegmentNos'] = obj;
};

/**
 * 处理信息标志位
 * @param {Object} info FlightInfo数据
 * @param {String} info.TripType 航班类型
 * @param {String} info.IsHX 是否是惠选
 * @param {Boolean} info.isSingleTrip 是否是单程机票
 * @param {Boolean} info.isConnecting 是否是联程机票
 * @param {Boolean} info.isTypeReturn 是否是往返机票
 * @param {Boolean} info.isHXOrder 是否是惠选订单
 * @private
 */
var _sortInfoFlags = function (info) {
    // 是否是单程机票
    info.isSingleTrip = info.TripType === '单程';

    // 是否是联程机票
    info.isConnecting = info.TripType === '联程';

    // 是否是往返机票
    info.isTypeReturn = info.TripType === '往返';

    // 是否是惠选订单
    info.isHXOrder = info.IsHX === 'T';
};

/**
 * 处理最终需要展示的数据
 * @param {Object} info 数据
 * @param {Object} info.SegmentNos 按航段分类的数据
 * @param {Array} info.forwardItems 去程数据
 * @param {Array} info.backwardItems 返程数据
 * @param {Object} info.connectItems 联程数据
 * @param {Boolean} info.isHistory 是否是历史订单
 * @param {Boolean} info.isHXOrder 是否是惠选订单
 * @param {Boolean} info.isFlightAndTrain 是否是空铁
 * @param {Boolean} info.isConnecting 是否是联程
 * @param {Array} info.TrainItems 火车票数据
 * @private
 */
var _sortDisplayItems = function (info) {
    var self = this;
    // 最终经过改签筛选处理过的数据，按航段号和乘客分组
    var data = info.SegmentNos;

    // number 2 chinese
    var connectMaps = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

    info.forwardItems = [];
    info.backwardItems = [];
    info.connectItems = {};

    // 只做一次空铁处理
    var flag = false;

    // 对segmentNo做遍历
    _.each(data, function (segment) {

        // 对passenger做遍历
        _.each(segment, function (passenger) {

            // 改乘客供有多少条信息
            var arrLength = passenger.length;

            var tempObj = {
                // 出发和达到的信息
                depCityName: passenger[0] && passenger[0].DepartureCity || '',
                depTime: passenger[0] && passenger[0].DepartureDateTime,
                arrCityName: passenger[(arrLength - 1)] && passenger[(arrLength - 1)].ArrivalCity || '',
                arrTime: passenger[(arrLength - 1)] && passenger[(arrLength - 1)].ArrivalDateTime,

                // 航班号处理
                flightNos: _sortFlightNo(passenger)
            };

            // 单程又是空铁又是第一条的时候才整理空铁
            if (info.isFlightAndTrain && !info.isConnecting && !flag) {
                var _SegmentNo = passenger[0] && passenger[0].SegmentNo || '';
                tempObj = _sortFlightAndTrain(_SegmentNo, tempObj, info.TrainItems);

                // 是否已经处理过空铁，有方法判断并返回
                flag = tempObj.flag;
            }

            // 出发和到达时间的信息
            var displayTime = (function () {
                var options;
                if (info.isHistory) {
                    options = {
                        fmt: 'yyyy-MM-dd',
                        word: ' 出发 ',
                        hasNum: true
                    };
                }

                return self.sortDisplay(tempObj.depTime, tempObj.arrTime, tempObj.flightNos, info.isHXOrder, options);
            })();

            // 最终数据
            var obj = {
                title: {
                    depCity: tempObj.depCityName,
                    arrCity: tempObj.arrCityName + (info.isTypeReturn ? '（往返）' : '')
                },
                content: displayTime,
                subContent: info.isHistory ? '' : tempObj.flightNos,

                // ios下时间格式问题，用于按出发时间排序
                departureDateTime: tempObj.depTime ? tempObj.depTime.replace(/-/g, '/') : ''
            };

            // 将数据塞入对应的地方
            // 联程处理，二维数组
            var i = passenger[0] && passenger[0].SegmentNo || 0;

            if (info.isConnecting) {
                // 最多显示10程
                if (parseInt(i, 10) < 11) {
                    obj.title.arrCity += '（第' + connectMaps[i - 1] + '程）';

                    if (!info.connectItems[i]) {
                        info.connectItems[i] = [];
                    }

                    info.connectItems[i].push(obj);
                }
            } else {
                // 单程 and 往返
                if (parseInt(i, 10) === 1) {
                    // 用于往返展示start这个class
                    obj.isTypeReturn = info.isTypeReturn;

                    info.forwardItems.push(obj);
                }

                if (parseInt(i, 10) === 2) {
                    // 用于往返展示start这个class
                    obj.isTypeReturn = info.isTypeReturn;

                    info.backwardItems.push(obj);
                }
            }

        });

    });

    // 将各数据按出发时间排序
    _sortReOrderByTime(info);

};

/**
 * 处理一个乘客的航班号，包括航班号处理
 * @param {Array} passenger 一个乘客的航班数据
 * @returns {string}
 * @private
 */
var _sortFlightNo = function (passenger) {
    var arr = [];
    var result = '';

    for (var i = 0, len = passenger.length; i < len; i++) {
        if (passenger[i].FlightNo) {
            var depTerminal = passenger[i].DepTerminal ? '（' + passenger[i].DepTerminal + ' 出发）' : '';

            arr.push(passenger[i].FlightNo + depTerminal);
        }
    }

    // 当有一个或一个以上航班有航站楼信息时，就需要折行
    var isNeedBreakLine = !!(arr[0] && arr[0].indexOf('出发') > 0 || arr[1] && arr[1].indexOf('出发') > 0);

    if (arr.length >= 2) {
        // 航班号大于两个时显示"等"
        result = arr[0] + (isNeedBreakLine ? '\n' : '，') + arr[1] + (arr.length > 2 ? '等' : '');
    } else {
        result = arr[0];
    }

    return result;
};

/**
 * 数据按出发时间排序
 * @param {Object} info 处理过后的数据
 * @private
 */
var _sortReOrderByTime = function (info) {

    // 去程，按出发时间先后排序
    if (info.forwardItems && info.forwardItems.length > 1) {
        info.forwardItems.sort(function (a, b) {
            return (new Date(a.departureDateTime)) - (new Date(b.departureDateTime));
        });
    }

    // 返程，按出发时间先后排序
    if (info.backwardItems && info.backwardItems.length > 1) {
        info.backwardItems.sort(function (a, b) {
            return (new Date(a.departureDateTime)) - (new Date(b.departureDateTime));
        });
    }

    // 联程对每一程都排序
    if (info.connectItems && !_.isEmpty(info.connectItems)) {
        for (var c in info.connectItems) {
            if (info.connectItems.hasOwnProperty(c)) {
                if (info.connectItems[c] && info.connectItems[c].length > 1) {
                    info.connectItems[c].sort(function (a, b) {
                        return (new Date(a.departureDateTime)) - (new Date(b.departureDateTime));
                    });
                }
            }
        }
    }
};

/**
 * 处理空铁组合
 * @param {String} segment 航段号
 * @param {Object} obj 数据
 * @param {String} obj.depCityName 出发城市名
 * @param {String} obj.depTime 出发时间
 * @param {String} obj.arrCityName 到达城市
 * @param {String} obj.arrTime 到达时间
 * @param {String} obj.flightNos 航班号
 * @param {Array} trainItems 火车票数据
 * @private
 */
var _sortFlightAndTrain = function (segment, obj, trainItems) {

    var len = trainItems.length;

    for (var i = 0; i < len; i++) {
        var validity = parseInt(trainItems[i].Validity, 10),
            wayType = trainItems[i].WayType,
            depTime = trainItems[i].DepartureDateStr,
            arrTime = trainItems[i].ArrivalDateStr;

        // 判断当前航段的机票信息是否和空铁能连接得上
        if (parseInt(segment, 10) !== validity) {
            obj.flag = false;
            return obj;
        }
        /**
         * validity 1: 去    2: 返
         * wayType  T: 起飞前  F: 起飞后
         */
        if (wayType === 'F') {
            obj.arrCityName = trainItems[i].ArrivalStation;
            obj.arrTime = arrTime;
        } else if (wayType === 'T') {
            obj.depCityName = trainItems[i].DepartureStation;
            obj.depTime = depTime;
        }

        if (trainItems[i].TrainNumber) {
            var hasBreakLine = obj.flightNos.indexOf('\n') > 0; // 是否有折行符
            var tempArr = obj.flightNos.split(hasBreakLine ? '\n' : '，');

            if (tempArr.length < 2) {
                if (wayType === 'F') {
                    obj.flightNos += '，' + trainItems[i].TrainNumber;
                } else {
                    obj.flightNos = trainItems[i].TrainNumber + '，' + obj.flightNos;
                }
            }
            if (tempArr.length === 2) {
                obj.flightNos = (function () {
                    var flightNos = obj.flightNos,
                        isOverflow = flightNos.indexOf('等') > -1;   // 判断原有机票航班号是否已经超过2个，已经有等

                    // 起飞后，需要将火车票车次号添加在尾部，起飞前需要将车次号添加在头部
                    if (wayType === 'F' && !isOverflow) {
                        // 起飞后，若原本机票只有2张，没有'等'字，需要补上'等'字
                        flightNos += '等';
                    } else {
                        if (hasBreakLine) { // 有折行符时，一行是可以继续显示的，就只需将火车票信息添加到头部就行
                            flightNos = trainItems[i].TrainNumber + '，' + flightNos;
                        } else {
                            // 删除数组最后一个元素，将火车票添加到头部，并添加等
                            tempArr.unshift(trainItems[i].TrainNumber);
                            tempArr.pop();

                            flightNos = tempArr.join('，') + '等';
                        }
                    }

                    return flightNos;
                })();
            }
        }
    }

    obj.flag = true;

    return obj;
};

module.exports = {
    getInstance: getInstance
};