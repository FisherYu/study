import { cwx, CPage } from '../../cwx.js';

var LANG = {
	"TITLE": "选择日期",
	"YEAR_POSTFIX": "年",
	"MONTH_NAMES": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
	"YEAR_MONTH_SEPERATOR": "",
	"DAY_NAMES": ["日", "一", "二", "三", "四", "五", "六"],

};

var HOLIDAYS = [
	['2017-1-1', '元旦'],
	['2017-1-27', '除夕'],
	['2017-1-28', '春节'],
	['2017-2-11', '元宵'],
	['2017-4-4', '清明'],
	['2017-5-1', '劳动节'],
	['2017-5-30', '端午'],
	['2017-10-1', '国庆'],
	['2017-10-4', '中秋'],
	['2017-10-28', '重阳'],
	['2017-12-25', '圣诞']

];

var EXTRA_RESTDAYS = [
	'2017-1-2',
	'2017-1-29',
	'2017-1-30',
	'2017-1-31',
	'2017-2-1',
	'2017-2-2',
	'2017-4-3',
	'2017-5-28',
	'2017-5-29',
	'2017-10-2',
	'2017-10-3',
	'2017-10-5',
	'2017-10-6',
	'2017-10-7',
	'2017-10-8',


];

var EXTRA_WORKDAYS = [
	'2017-1-22',
	'2017-2-4',
	'2017-4-1',
	'2017-5-27',
	'2017-9-30',

];


function _stringToDate(str) {
	if (!str) return null;
	return new Date(str.replace(/-/g, "/"));
}


function _getDateValue(year, month, date) {
	return [year, month + 1, date].join('-');
}

//tczhu 新增一个选中日期判断
function _getMonthDates(year, month, choosenDate, beginDate, endDate, opt) {
	var someday = new Date(year, month, 1);
	var pushDate = function (d) {
		var outOfRange = false, dateValue = _getDateValue(year, month, d);

		/*
			处理不在范围内的日期
		*/
		if (_since) {
			if (year < _since.year) outOfRange = true;
			if (year == _since.year && month < _since.month) outOfRange = true;
			if (year == _since.year && month == _since.month && d < _since.date) outOfRange = true;
		}

		if (beginDate) {
			var dateSplits = beginDate.split("-");
			var beginYear = parseInt(dateSplits[0]);
			var beginMonth = parseInt(dateSplits[1]) - 1; //月份是从0开始的
			var beginDay = parseInt(dateSplits[2]);
			if (year < beginYear) outOfRange = true;
			if (year == beginYear && month < beginMonth) outOfRange = true;
			if (year == beginYear && month == beginMonth && d < beginDay) outOfRange = true;
		}
		if (endDate) {
			var dateSplits = endDate.split("-");
			var endYear = parseInt(dateSplits[0]);
			var endMonth = parseInt(dateSplits[1]) - 1;
			var endDay = parseInt(dateSplits[2]);
			if (year > endYear) outOfRange = true;
			if (year == endYear && month > endMonth) outOfRange = true;
			if (year == endYear && month == endMonth && d > endDay) outOfRange = true;
		}

		var holiday = false;
		HOLIDAYS.forEach(function (item) {
			if (item[0] == dateValue) holiday = item[1];
		});

		var info = outOfRange || !opt || !opt[dateValue] ? false : opt[dateValue];

		dates.push({
			choose: (dateValue == choosenDate),
			value: dateValue,
			date: d,
			outOfRange: outOfRange,
			today: (dateValue == _todayValue),
			holiday: holiday,
			workday: (EXTRA_WORKDAYS.indexOf(dateValue) >= 0),
			restday: (EXTRA_RESTDAYS.indexOf(dateValue) >= 0),
			info: info //获取额外的信息
		})
	};

	var dates = [];
	var day = someday.getDay();
	for (var i = 0; i < day; i++) {
		dates.push({
			date: null
		});
	}

	var d = 1;
	for (; d < 28; d++) {
		pushDate(d);
	}

	while (someday.getMonth() == month) {
		pushDate(d);
		someday.setDate(++d);
	}
	return dates;
}

var _today = new Date();
var _year = 1900 + _today.getYear();
var _month = _today.getMonth();
var _date = _today.getDate();
var _todayValue = _getDateValue(_year, _month, _date);


var _since = {
	year: _year,
	month: _month,
	date: _date
};

/*
	choosenDate:选中的日期,格式为2016-10-15
	beginDate:开始日期
	endDate:结束日期
	info:{
		"2016-10-15":{
			title:"第一级标题", //显示价格等
			subTitle:"第二级标题"//显示自定义文案
		}
	}
*/
/*
	默认日历控件显示24个月，
	如果只传递了开始时间，就是开始时间-24
	如果只传递了结束时间，就是今天-结束时间
	如果都传递：开始时间-结束时间
*/

CPage({
	pageId: "10320654340",
	data: {
		DAY_NAMES: LANG.DAY_NAMES,
		monthDates: [],
		year_month_seperator: LANG.YEAR_MONTH_SEPERATOR,
		HOLIDAYS: HOLIDAYS,
		choosenDate: null,
		scrollToID: null,
		tips: null,
	},
	onLoad: function (options) {
		this.options = options;
		cwx.showToast({
			title: '加载中..',
			icon: 'loading',
			duration: 10000,
			complete: function () {

			}
		});
	},
	onReady: function () {
		console.log("on ready call");
		var options = this.options;
		this.updateMonthDates(options.data);
		this.title = options.data.title || '日历';
		cwx.setNavigationBarTitle({
			title: this.title,
		})
		cwx.hideToast();
	},
	onDateTap: function (e) {
		var data = e.currentTarget.dataset;
		var monthes = this.updateChooseDate(data.date)
		this.setData({
			choosenDate: data.date,
			monthDates: monthes,
		});
		//控制权交给BU
		this.invokeCallback(data.date);
		this.navigateBack();
	},

	onHolidayTap: function (e) {
		this.setData({
			choosenDate: 'date-' + e.currentTarget.dataset.date
		});
	},
	updateChooseDate: function (date) {
		var monthes = this.data.monthDates;
		monthes.forEach(function (month) {
			if (month.dates && month.dates instanceof Array) {
				month.dates.forEach(function (ob) {
					if (ob) {
						ob.choose = false;
						if (ob.value === date) {
							// console.log("update choose date ",date);
							ob.choose = true;
						}
					}
				})
			}
		})
		return monthes
	},
	updateToday: function () {
		var date = new Date()
		//设置当前时间
		_year = 1900 + date.getYear();
		_month = date.getMonth();
		_date = date.getDate();
		_todayValue = _getDateValue(_year, _month, _date)
	},
	/*
		组合显示的元素
	*/
	updateMonthDates: function (data) {
		// console.log( "calendar data = ", data )
		var choosenDate = data.choosenDate;
		var beginDate = data.beginDate;
		var endDate = data.endDate;
		var info = data.info;

		this.updateToday();

		_today = _stringToDate(beginDate) || new Date()
		//设置当前时间
		_year = 1900 + _today.getYear();
		_month = _today.getMonth();
		_date = _today.getDate();
		_since = {
			year: _year,
			month: _month,
			date: _date
		}

		var _endDate = _stringToDate(endDate) || new Date(_year + 2, _month, _date)
		var _endYear = _endDate.getFullYear();//获取到结束日期
		var _endMonth = _endDate.getMonth();//

		//显示到一年后
		var _monthDates = [];
		var n = (_endYear - _year) * 12 + (_endMonth - _month) + 1;
		while (n--) {
			_monthDates.push({
				monthID: "mid" + _year + "-" + (_month + 1), //id不能数字大头
				monthName: _year + LANG.YEAR_POSTFIX + LANG.YEAR_MONTH_SEPERATOR + LANG.MONTH_NAMES[_month],
				dates: _getMonthDates(_year, _month, choosenDate, beginDate, endDate, info)
			});
			if (_month == 11) {
				_year++;
				_month = 0;
			}
			else {
				_month++
			}
		}

		//滚动到制定位置
		var scrollToID = null;
		if (choosenDate) {
			var split = choosenDate.split("-")
			scrollToID = "mid" + split[0] + "-" + split[1] //
		}
		/*
			添加酒店特殊悬浮标题
		*/
		var tips = data.tips;
		this.setData({
			tips: tips,
			monthDates: _monthDates,
		})
		this.setData({
			scrollToID: scrollToID,
		})
	}

})
