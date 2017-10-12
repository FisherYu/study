import { _ } from '../../../../cwx/cwx.js';
var librarianTarot = require('./librarian.js');
var hashTable;

//修改为单例
var HashTableClass = (function () {
    var uniqueInstance;

    function constructor() {
        var size = 0;

        var entry = {};

        this.add = function (key, value) {
            if (!this.containsKey(key)) {
                size++;
            }
            entry[key] = value;
        };

        this.getValue = function (key) {
            return this.containsKey(key) ? entry[key] : null;
        };

        this.remove = function (key) {
            if (this.containsKey(key) && (delete entry[key])) {
                size--;
            }
        };

        this.containsKey = function (key) {
            return (key in entry);
        };

        this.containsValue = function (value) {
            var values = [];
            values = this.getValues();
            return values.indexOf(value) > -1;
        };

        this.getValues = function () {
            var values = [];
            values = _.map(entry, function (value) {
                return value;
            });
            return values;
        };

        this.getKeys = function () {
            var keys = [];
            keys = _.keys(entry);
            return keys;
        };

        this.getSize = function () {
            return size;
        };

        this.clear = function () {
            size = 0;
            entry = {};
        };
    }

    return {
        getInstance: function () {
            if (!uniqueInstance) {
                uniqueInstance = new constructor();
            }
            return uniqueInstance;
        }
    };
})();

function getInstance (orderEntity) {
    var id = getCardID(orderEntity);
    var constructor = getCardConstructor.call(this, id);// 反射获取卡片构造方法

    if (!constructor) {
        return null;
    } else {
        var card = constructor.getInstance.call(this, orderEntity, id);// 构造卡片实例
        card.init();
        return card;
    }

}

function getRenderData (orderEntity) {
    hashTable = HashTableClass.getInstance();
    var card = getInstance(orderEntity);
    card.initCardData();

    var renderData = card.getRenderData();
    var actionData = card.getActionData();

    hashTable.add(renderData.baseData.orderId, actionData);

    return renderData;
}

function getCardID (orderEntity) {
    var bizType = orderEntity && orderEntity.BizType || '';

    if (!orderEntity || !bizType) {
        return null;
    } else {
        return formatBizType(bizType); // 讲BizType进行转义
    }
}

function getCardConstructor (id) {
    return librarianTarot[id || ''];
}

function formatBizType (bizType) {
    // TODO 后续接入的bu需要转义
    return bizType;
}

function getActionData (oid) {
    var item = null;
    if (hashTable && hashTable.containsKey(oid)) {
        var items = hashTable.getValue(oid);
        item = _.find(items, function (item) {
            return item.ActionCode === 'Detail'
        });
    }
    return item || {};
}

module.exports = {
    getActionData: getActionData,
    getRenderData: getRenderData
};