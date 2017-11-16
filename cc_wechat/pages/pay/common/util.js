var ret = {};
ret.transNumToFixedArray = function (num, maxlength, currency) {
    num = num + '';
    if (!num) {
        return '';
    }
    //判断num是否是数字字符串
    var reg = /^\d*\.*\d+$/;
    if (!reg.test(num)) {
        return num;
    }
    maxlength = maxlength || 2;

    var array = num.split('.');
    var hzStr = '';
    var curlength = 0;
    if (array.length > 1) {
        curlength = array[1].length;
        hzStr = array[1];
    }

    for (var i = 0; i < (maxlength - curlength) ; i++) {
        hzStr += '0';
    }
    array[1] = hzStr;
    return array;
};



ret.appendQuery = function (url, query) {
    var urlquery = (url + '&' + query) || '';
    return urlquery.replace(/[&?]{1,2}/, '?');
};

module.exports = ret;