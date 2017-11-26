import { cwx, CPage } from '../../cwx.js';

//citylist.js
var originInlandCities = null;
var originInterCities = null;
var selectedCities = null;
var currentCityLength = 0;

CPage({
    pageId: "10320654345",
    data: {
        title: '请选择城市',
        isShowCurrentPosition: true,
        isFoldShow: false,
        currentTab: 0,
        currentCity: {
            cityName: '定位中...'
        },
        toView: 'positon',
        searchValue: "",
        isSearchView: false,
        inputKeyword: "",
        loadDataFinish: false,
        currentTag: '',
        currentAppend: '',
        showInter: false,
        cityTags: [],//默认的索引
    },

    onReady: function () {
        cwx.setNavigationBarTitle({
            title: this.title
        });
        this._showLoading();
        this.loadData(this._onDataLoaded.bind(this));
    },
    onLoad: function (options) {
        this.title = options.data.title || this.data.title;
        var isFoldShow = this.data.isFoldShow;
        if (typeof options.data.isShowCurrentPosition !== 'undefined') {
            isFoldShow = options.data.isFoldShow
        }
        var isShowCurrentPosition = this.data.isShowCurrentPosition;
        if (typeof options.data.isShowCurrentPosition !== 'undefined') {
            isShowCurrentPosition = options.data.isShowCurrentPosition;
        }
        this.setData({
            isFoldShow: isFoldShow,
            isShowCurrentPosition: isShowCurrentPosition,
            loadDataFinish: false,
            currentCity: { cityName: '定位中...' },
        })
        this.loadData = options.data.loadData || function () { };
        this.data.handleSearch = options.data.handleSearch;
        this.data.handleCurrentPosition = options.data.handleCurrentPosition;
        this.beginLocate();
    },

    beginLocate: function () {
        var cache = cwx.locate.getCachedGeoPoint();
        var success = function (resp) {
            if (typeof this.data.handleCurrentPosition === 'function') {
                this.data.handleCurrentPosition(resp, this._onHandleCurrentPosition);
            }
        }.bind(this);
        if (cache) {
            success(cache)
            return;
        }
        cwx.locate.startGetGeoPoint({
            success: success,
            fail: function (e) {
                this.data.currentCity = { cityName: '定位失败' };
                this.setData({
                    currentCity: this.data.currentCity
                })
                console.log("cwx.locate.startGetGeoPoint error ", e);
            }.bind(this)
        });
    },

    cityTap: function (e) {
        //   console.log(JSON.stringify(e));
        var cityName = e.currentTarget.dataset.cityname;
        if (cityName === '定位中...') {
            return;
        }
        if (cityName === '定位失败') {
            this.beginLocate();
            return;
        }
        if (this.data.currentCity.cityName === cityName) {
            this.invokeCallback(this.data.currentCity);
            this.navigateBack();
            return;
        }
        var section = e.currentTarget.dataset.section;
        var row = e.currentTarget.dataset.row;
        var selectCity;
        if (section == "historyCities") {
            selectCity = this.data.currentTabCities.historyCities[row]
        }
        else if (section == "hotCities") {
            selectCity = this.data.currentTabCities.hotCities[row]
        }
        else if (section == "search") {
            selectCity = this.data.searchResult[row]
        }
        else {
            selectCity = this.data.currentTabCities.cityMainList[section][row]
        }
        //   console.log('+++'+JSON.stringify(selectCity));
        this.invokeCallback(selectCity);
        this.navigateBack();

    },
    inlandTabClick: function () {
        selectedCities = originInlandCities;
        currentCityLength = 0;

        this.data.currentTab = 0;
        this.data.currentAppend = originInlandCities.cityTags[0];
        this.data.currentTabCities = null;
        var currentTabCities = null;
        do {
            currentTabCities = this._appendNextSection(this.data.currentAppend);
        } while (currentCityLength < 30)

        if (currentTabCities) {
            this.setData({
                currentAppend: this.data.currentAppend,
                currentTab: 0,
                currentTabCities: currentTabCities,
                cityTags: selectedCities.cityTags,
            })
            this.setData({
                toView: this.data.currentAppend,
            })
        }
    },
    interTabClick: function () {
        selectedCities = originInterCities;
        currentCityLength = 0;


        this.data.currentAppend = originInterCities.cityTags[0];
        this.data.currentTab = 1;
        this.data.currentTabCities = null;
        var currentTabCities = null;

        do {
            currentTabCities = this._appendNextSection(this.data.currentAppend);
        } while (currentCityLength < 30)

        if (currentTabCities) {
            this.setData({
                currentAppend: this.data.currentAppend,
                currentTab: 1,
                currentTabCities: currentTabCities,
                cityTags: selectedCities.cityTags,
            })
            this.setData({
                toView: this.data.currentAppend,
            })
        }
    },

    searchInput: function (e) {
        var value = e.detail.value;
        this.setData({
            inputKeyword: value
        })
        if (this.data.notHandle) {
            return;
        }
        this.data.notHandle = true;
        setTimeout(function () {
            this.data.notHandle = false;
            this.data.handleSearch(this.data.inputKeyword, this.data.currentTab, this._onHandleSearchResult);
        }.bind(this), 400)

    },
    gotoSearch: function (e) {
        if (this.data.isSearchView) {
            return;
        }
        this.setData({
            isSearchView: true,
        })
    },
    searchClear: function (e) {
        this.setData({
            inputKeyword: ""
        })
        this._onHandleSearchResult([]);
    },
    searchCancel: function (e) {
        this.setData({
            isSearchView: false,
            inputKeyword: ""
        })
        this._onHandleSearchResult([]);
        wx.hideKeyboard()
    },

    tagTap: function (e) {
        var citytag = e.currentTarget.dataset.citytag;
        if (this.data.isFoldShow) {
            this.setData({
                currentTag: citytag
            })
        }
        this.data.currentAppend = citytag;
        var currentTabCities = this._appendNextSection(this.data.currentAppend);
        if (currentTabCities) {
            this.setData({
                currentAppend: this.data.currentAppend,
                currentTabCities: currentTabCities,
            })
        }
        this.setData({
            toView: citytag,
        })

    },
    _trimeData: function (data) {
        originInlandCities = data.inlandCities;
        originInterCities = data.interCities;
        //保护
        originInlandCities.historyCities = originInlandCities.historyCities || [];
        originInterCities.historyCities = originInterCities.historyCities || [];


        var inlandCityTags = [];
        for (var key in originInlandCities.cityMainList) {
            var citys = originInlandCities.cityMainList[key];
            if (citys.length > 0) {
                inlandCityTags.push(key);
            } else {
                delete originInlandCities.cityMainList[key];
            }
        }
        originInlandCities.cityTags = inlandCityTags;

        var interCityTags = [];
        for (var key in originInterCities.cityMainList) {
            var citys = originInterCities.cityMainList[key];
            if (citys.length > 0) {
                interCityTags.push(key);
            } else {
                delete originInterCities.cityMainList[key];
            }
        }

        originInterCities.cityTags = interCityTags;
        selectedCities = originInlandCities;
        this.data.currentAppend = inlandCityTags[0];//追加默认第一组
    },
    _appendNextSection: function (currentAppend) {
        // console.log("append....... ", currentAppend);
        var currentTabCities = this.data.currentTabCities;
        if (!currentTabCities) {
            currentTabCities = cwx.util.copy(selectedCities);
            currentTabCities.cityMainList = {};
            currentTabCities.cityTags = [];
        }
        var index = selectedCities.cityTags.indexOf(currentAppend);
        if (index == -1 || currentTabCities.cityMainList[currentAppend] || currentTabCities.cityTags.indexOf(currentAppend) != -1) {
            // console.log("_appendNextSection error：未找到正确的索引");
            return null;
        }
        //追加要显示的city section
        var cities = selectedCities.cityTags;
        for (var i = 0; i < cities.length; i++) {
            if (i <= index) {
                var append = cities[i];
                if (!currentTabCities.cityMainList[append] && currentTabCities.cityTags.indexOf(append) == -1) {
                    var tmpCity = selectedCities.cityMainList[append]
                    currentCityLength += tmpCity.length; //追加长度
                    currentTabCities.cityMainList[append] = tmpCity;
                    currentTabCities.cityTags.push(append);
                }
            }
        }
        if (index < selectedCities.cityTags.length - 1) {
            this.data.currentAppend = selectedCities.cityTags[index + 1];
        }

        return currentTabCities;
    },
    _onDataLoaded: function (data) {
        currentCityLength = 0;
        //过滤掉空的数据
        this._trimeData(data);
        var currentTabCities = null;
        do {
            currentTabCities = this._appendNextSection(this.data.currentAppend);
        } while (currentCityLength < 30)

        this.data.loadDataFinish = true;
        if (currentTabCities) {
            this.setData({
                currentAppend: this.data.currentAppend,
                loadDataFinish: this.data.loadDataFinish,
                currentTabCities: currentTabCities,
                showInter: (originInterCities.cityTags.length != 0),
                cityTags: selectedCities.cityTags,
            })
        }
        wx.hideToast()
    },
    handlerScrollLower: function (e) {
        var currentTabCities = this._appendNextSection(this.data.currentAppend);
        if (currentTabCities) {
            this.setData({
                currentTabCities: currentTabCities
            });
        }
    },
    _onHandleSearchResult: function (data) {
        this.setData({
            searchResult: data,
        })
    },
    _onHandleCurrentPosition: function (data) {
        if (data === null) {
            this.data.currentCity = { cityName: '定位失败' };
            this.setData({
                currentCity: this.data.currentCity
            })
            return;
        }
        this.setData({
            currentCity: data
        })
    },
    _showLoading: function () {
        if (this.data.loadDataFinish) return;
        var that = this;
        cwx.showToast({
            title: '加载中..',
            icon: 'loading',
            duration: 10000,
            complete: function () {
                that._showLoading();
            }
        });
    }


})
