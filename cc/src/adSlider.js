define("AdSlider", ["cStore", "cModel", "cCoreInherit", "UIImageSlider", "cLocalStorage", "cCommonStore", "cUtilCommon", "cGeoService", "cUtilHybrid"], function (cStore, cModel, cCoreInherit, UIImageSlider, cLocalStorage, cCommonStore, cUtilCommon, cGeoService, cUtilHybrid) {
    var localProtocol = window.location.protocol,
        localIsHybrid = !/^(http:|https:)/ig.test(localProtocol),
        defaultSOAProtocol = "https:",        
        soaProtocol = localIsHybrid ? defaultSOAProtocol : localProtocol,
        defaultImgProtocol = "https:";

    //var inherit = _.wrap(_.inherit, function (func) {
    //    var args = Array.prototype.slice.call(arguments, 1);
    //    var rs = func.apply(this, args);
    //    rs.prototype['superclass'] = rs;
    //    return rs;
    //});

    var adSliderControl = _.inherit(UIImageSlider, {
        propertys: function ($super) {
            //测试函数相等
            //var fneq = UIImageSlider == this.constructor.superclass;
            //this.constructor.superclass.prototype.propertys.call(this);
            $super();

            this.UtilCommon = cUtilCommon;
            this.GeoService = cGeoService;
            this.LocalStorage = cLocalStorage.getInstance();
            this.HeadStore = cCommonStore.HeadStore.getInstance();
            this.UserStore = cCommonStore.UserStore.getInstance();
            this.BizType = 0; //业务类型
            this.PageCode = 0; //页面加载类型
            this.TagId = ""; //HTML标签ID
            this.BackupImageUrl = ""; //保底图片URL
            this.IsNav = true; //是否显示导航点
            this.IsNoAdHide = false; //未加载到广告是否隐藏tag标签
            this.ExpandSetTrackLog = function (type, item) { }; //扩展设置TrackLog，type：类型，2：有效展现，3：点击，item：广告数据对象
            this.AdLoadComplete = function (slider, status) { }; //广告加载完成回调函数,0:成功，1：错误
            this.Height = 0; //高度
            this.IsLoadComplete = false; //是否加载完成
            this.IsBackupLoadComplete = false;//保底图片是否加载成功
            this.hpageid = ""; //hybrid pageid
            this.pageid = ""; //H5 pageid
            this.Theme = "";
            this.PageId = "";
			this.dotheight = 0;//控件滑动原点距离底部的间距
            this.SiteID = ""; //新系统站点ID
            this.AllianceID = "";   //分销定向参数
            this.SID = "";          //分销定向参数
            this.OUID = "";         //分销定向参数
            this.DataList = [];
            this.FullDataList = []; //完整的数据
            this.SiteType = "";
            this.TemplateVal = "";   //模板编号
            this.TemplateType = "";  //广告模板类型
        },
		_setTrackLog: function (type, item) {
			if (this.wrapper.css("display") == "none" || $("#" + item.Id).length == 0) {
				this.stop();
				return;
			}
			this._setUBTTrackLog.call(this, type, item);
			this.ExpandSetTrackLog(type, item);
			if (type == 3) {
				//解决华为手机滑动过快导致停止轮播问题
				var $this = this;
				window.setTimeout(function () {
					$this.play();
					Common.JumpUrl(item.LinkUrl);
				}, 200);
			}
		},
		_setUBTTrackLog: function (type, item) {
			//H5取VID,APP取ClientID
			var head = this.HeadStore.get();
			var userId = (Lizard.isHybrid || Lizard.isInCtripApp) ? head.cid : Common.GetVId();

			//PageId
			if (Common.StringIsNullOrEmpty(this.PageId)) {
				return;
			}

			//UBT TrackLog Key Value
			var value = "UserId=" + userId + "&PageId=" + this.PageId;

			//有效曝光与点击
			if (type == 1) {
				value += "&PositionIdVSAdId=" + item.AdvertisementPosition;
				if (item.IsDy) {
					value += ":" + item.AID;
				}
			} else if(type == 4) {
				value += "&SvrLoadTime=" + (this.V4EndT - this.V4StartT) + "&FirstImgShowTime=" + (this.FirstImgShowT - this.V4EndT) + "&FirstImgShowTimeTotal=" + (this.FirstImgShowT - this.StartTime);
			} else if(type == 5) {
				value += "&DySvrLoadTime=" + (this.DyEndT - this.DyStartT) + "&DyImgLoadTime=" + (this.DyImgLoadT - this.DyEndT) + "&DyImgLoadTimeTotal=" + (this.DyImgLoadT - this.StartTime);
			} else {
				value += "&PositionId=" + item.AdvertisementPosition + "&AdId=" + item.AID + "&src=" + item.SrcUrl;
			}

			//客户端版本
			if (Lizard.isHybrid || Lizard.isInCtripApp) {
				value += "&cver=" + head.cver;
			}

			//增加站点信息
			var siteID = Common.GetStorage("SiteID" + this.CacheKey) || "";
			var siteType = Common.GetStorage("SiteType" + this.CacheKey) || "";
			value += "&SiteType=" + siteType + "&SiteID=" + siteID;

			//动态广告增加埋点属性
			if (item.IsDy) {
				var uid = Common.StringIsNullOrEmpty(item.MKTID) ? "" : item.MKTID;
				value += "&uid=" + uid;
				value += "&vid=" + userId;

				if (!Common.StringIsNullOrEmpty(item.BITraceLog)) {
					value += "&" + item.BITraceLog;
				}
			}

			Common.SetUBTTrackLog(type, value);
		},
        _firstImgShow: function (item) {
			item && this._setTrackLog.call(this, 4, item);
		},
		_dyAdImgLoad: function (item) {
			item && this._setTrackLog.call(this, 5, item);
		},
		//动态广告曝光
		_dySumAdpv: function (item) {
			if (item.length > 0) {
				var placeIds = [];
				$.each(item, function (i, t) {
					if (!t.IsDy && t.AdvertisementPosition && t.AID) {
						placeIds.push(t.AdvertisementPosition + ":" + t.AID);
					}
				});
				if (placeIds.length > 0) {
					this._setUBTTrackLog.call(this, 1, { AdvertisementPosition: placeIds.join("-") });
				}
			} else {
				this._setUBTTrackLog.call(this, 1, item);
			}
		},
        //设置加载时间
        SetLoadTiming: function () {
            if (this.IsLoadAdComplate && this.IsLoadDyAdComplate) {
                var SvrLoadTime = this.V4EndT - this.V4StartT;
                var DySvrLoadTime = this.DyEndT - this.DyStartT;
                var AdList = [];
                var isReuqestAll = true;
                $.each(this.DataList, function (i, item) {
                    isReuqestAll = isReuqestAll && item.IsRequest;
                    if (!item.IsRequest) {
                        return;
                    }
                    var obj = {
                        "PlaceID": item.PlaceID,
                        "AdID": item.ADID,
                        "AdType": item.Adtype,
                        "ImgLoadTime": item.LoadImgEndT - item.LoadImgStartT
                    };
                    AdList.push(obj);
                });
                if (isReuqestAll) {
                    this.IsLoadAdComplate = false;
                    this.IsLoadDyAdComplate = false;
                    var ADPositions = [];
                    var ADPosition = {
                        AdList: AdList,
                        SvrLoadTime: SvrLoadTime,
                        DySvrLoadTime: DySvrLoadTime
                    };
                    ADPositions.push(ADPosition);
                    //发送加载监控
                    this.AdBusiness.GetMonitoring(ADPositions, function () {
                        var message = "发送监控数据请求完成!";
                    });
                }
            }
        },
        //广告加载
        Load: function (options) {
            try {
                if (!$.isEmptyObject(options)) {
                    if (options.length >= 3) {
                        this.BizType = options[0];
                        this.PageCode = options[1];
                        this.TagId = options[2];
                        if (options.length == 4) {
                            this.BackupImageId = options[3];
                        }
                    }
                    else {
                        for (var key in options) {
                            this[key] = options[key];
                        }
                    }
                }
                if (Common.StringIsNullOrEmpty(this.TagId)) {
                    return;
                }
                if (Common.StringIsNullOrEmpty(this.PageId)) {
                    this.PageId = Lizard.isHybrid ? this.hpageid : this.pageid;
                }

                this.CacheKey = this.BizType + "_" + this.PageCode + "_" + this.SiteID;
                //获取分销参数
                var distribution = Common.JsonToObject(Common.GetStorage('UNION'));
				if(this.AllianceID == "" && this.SID == "" && this.OUID == "") {
                    if (!Common.IsEmptyObject(distribution)) {
                        var s = Common.Clone(distribution);
                        this.AllianceID = s.data.AllianceID ? s.data.AllianceID : "";
                        this.SID = s.data.SID ? s.data.SID : "";
                        this.OUID = s.data.OUID ? s.data.OUID : "";
                    }
                }

                //版本
                var head = this.HeadStore.get();
                this.cver = head.cver;
                this.StartTime = new Date().getTime();

                //初始化设置
                InitSet.call(this);
                //业务类方法
                this.AdBusiness = new AdBusiness(this);
                this.AdBusiness.Init();

                //初始化设置
                function InitSet() {
                    this.datamodel.itemFn = function (item) {
                        return GetItemHtml(item);
                    };
                    this.displayNum = 1;
                    this.autoPlay = false;
                    this.delaySec = 3000;
                    this.wrapper = $("#" + this.TagId);
                    this.wrapper.addClass("mkt-ad-ccc");
                    this.wrapper.html("");
                    var url = "//webresource.c-ctrip.com/ResMarketOnline/R2/css/aFrame/abase.css";
                    if (Lizard.isHybrid && JudgeIsLocalLink(this.cver)) {
                        url = "../advertisement/css/abase.css";
                    }
                    else if (!Lizard.isHybrid) {
                        url = Common.ReplaceHttp(url);
                    }

                    Common.LoadLink(url);

                    //加载主题Css
                    LoadThemeCss.call(this);
                    this._initialize();
                }

                function LoadThemeCss() {
                    if (!Common.StringIsNullOrEmpty(this.Theme)) {
                        var url = "";
                        //酒店倒影效果
                        if (this.Theme.toLowerCase() == "hotel") {
                            this.wrapper.addClass("hotel");
                            url = "//webresource.c-ctrip.com/ResMarketOnline/R2/css/aFrame/hotel-theme.css";
                            if (Lizard.isHybrid && JudgeIsLocalLink(this.cver)) {
                                url = "../advertisement/css/hotel-theme.css";
                            }
                            else if (!Lizard.isHybrid) {
                                url = Common.ReplaceHttp(url);
                            }
                            Common.LoadLink(url);
                        }
                    }
                }

                //获取广告帧HTML
                function GetItemHtml(item) {
                    if (item.IsDy && !Common.StringIsNullOrEmpty(item.Style)) {
                        document.getElementById("dyadStyle") == null && Common.LoadCss("dyadStyle", item.Style);
                    }

                    var html = [];
                    html.push(Common.StringFormat("<img src=\"{0}\" id=\"{1}\"/>", [item.SrcUrl, item.Id]));
                    //动态广告内容
                    if (item.IsDy && !Common.StringIsNullOrEmpty(item.Content)) {
                        html.push(item.Content);
                    }
                    return html.join("");
                }

                //判断是否读本地Css
                function JudgeIsLocalLink(appVer) {
                    var vs = appVer.split('.');
                    if (vs.length >= 2) {
                        var v1 = parseInt(vs[0]), v2 = parseInt(vs[1]);
                        //6.9版本及以上
                        if (v1 > 6 || (v1 == 6 && v2 >= 9)) {
                            return true;
                        }
                    }
                    return false;
                }

            }
            catch (ex) {
            }

            return this;
        },
        //重写destory
        destroy: function ($super) {
            this.stop();
            this.wrapper.html("");
            $super();
        },
        //初始化注册事件
        _initialize:function () {
            var me = this;
            //点击
            this.itemClick = function (item) {
                if (item != undefined) {
                    me._setTrackLog.call(me, 3, item);
                }
            };

            //改变显示，有效展现
            this.changed = function (item) {
                //有效一次
                if (item != undefined && !item.IsVisible) {
                    item.IsVisible = true;
                    me.datamodel.currentADID = item.ADID;
                    me._setTrackLog.call(me, 2, item);
                }

                //解决华为手机滑动过快导致停止轮播问题
                var $this = me;
                window.setTimeout(function () {
                    $this.play();
                }, 200);
            };

            //动态广告曝光
            this.DySumAdpv = function (item) {
                me._dySumAdpv(item);
            };


        },
        _SetResize:function (items) {
            if(items && items.length > 0) {
                var $this = this;
                var width, height;
                for (var i = 0; i < items.length; i++) {
                    if (items[i].Width && items[i].Width > 0) {
                        width = items[i].Width;
                        height = items[i].Height;
                        break;
                    }
                }
                //设置高度
                SetHeight.call(this, width, height);
                //改变页面尺寸大小
                $(window).off("resize.slider" + this.TagId);
                $(window).on("resize.slider" + this.TagId, function () {
                    SetHeight.call($this, width, height, true);
                });
            }
               //设置高度
            function SetHeight(width, height, blRe) {
                var $this = this;

                if (width > 0 && height > 0) {
                    if ($("#" + this.TagId).width() > 0) {
                        this.Height = parseInt(height * $("#" + this.TagId).width() / width);
                    } else {
                        this.Height = parseInt(height * $(document).width() / width);
                    }

                    if (!Common.StringIsNullOrEmpty(this.Theme)) {
                        //酒店倒影效果
                        if (this.Theme.toLowerCase() == "hotel") {
                            this.Height = this.Height * 2;
                        }
                    }

                    this.wrapper.height(this.Height);

                    if (blRe) {
                        this.wrapper.find("li").each(function () {
                            $(this).css("font-size", $this.Height + "px");
                        });

                        this.wrapper.find("div.cm-slide").each(function () {
                            $(this).height($this.Height);
                        });
                    }
                }
            }
        },
        //数据加载绑定
        BandData: function (dataList,fullDataList) {
            //初始化
            function Init() {
                if (dataList.length > 0) {
                    var $this = this;
                    this.DataList = dataList;
                    this.FullDataList =fullDataList;
                    this._SetResize(dataList);
                    LoadImageList(dataList, this);
                }
                else {
                    !this.IsBackupLoadComplete && this.AdLoadComplete(this, 1);
                }
				// if(items && items.length > 0) {
                 //    this._SetResize(items);
				// }
            }

            //加载图片列表
            function LoadImageList(adContentList, slider) {
                //广告曝光
                SetSumAdpv(adContentList, slider);

                //第三方曝光
                SetThridAdPv(dataList);

                slider.AdCount = adContentList.length;
                slider.AdLoadErrorCount = 0;
                $.each(adContentList, function (index, item) {
                    if (item.IsDy) {
                        slider._dySumAdpv(item);
                    }
                    LoadImage(item, slider);
                });
            };

            //加载图片
            function LoadImage(item, slider) {
                item.IsRequest = false;
                item.IsLoad = false;
                if (!Common.StringIsNullOrEmpty(item.SrcUrl)) {
                    var img = new Image();
                    img.src = item.SrcUrl;
                    item.LoadImgStartT = new Date().getTime();
                    img.onload = function () {
                        item.LoadImgEndT = new Date().getTime();
                        item.IsRequest = true;
                        item.IsLoad = true;
                        SetLoad(slider, item);
                        slider.SetLoadTiming();
                    };
                    img.onerror = function () {
                        item.LoadImgEndT = new Date().getTime();
                        item.IsRequest = true;
                        SetLoad(slider, item);
                        slider.SetLoadTiming();
                        ErrorLoadComplete(slider);
                    };
                }
                else {
                    item.IsRequest = true;
                    SetLoad(slider, item);
                    slider.SetLoadTiming();
                    ErrorLoadComplete(slider);
                }

                function SetLoad(t, d) {
                    if (t.GetDataList(d)) {
                        t.SliderReLoad(d);
                    }
                }
            }

            function ErrorLoadComplete(slider) {
                slider.AdLoadErrorCount += 1;
                if (slider.AdCount == slider.AdLoadErrorCount) {
                    !slider.IsBackupLoadComplete && slider.AdLoadComplete(slider, 1);
                }
            }

            //设置日志
            function SetTrackLog(type, item) {
                this._setTrackLog(type, item);
            }

            //UBT 有效展现与点击 TrackLog
            function SetUBTTrackLog(type, item) {
				this._setUBTTrackLog(type, item);
            }

            //广告曝光
            function SetSumAdpv(adList, slider) {
                var placeIds = [];
                var competitiveIds = [];
                $.each(adList, function (i, t) {
                    if (!t.IsDy && t.AdvertisementPosition && t.AID) {
                        if (t.Adtype < 100) {
                            placeIds.push(t.AdvertisementPosition + ":" + t.AID);
                        } else {
                            competitiveIds.push(t.AdvertisementPosition + ":" + t.AID);
                        }
                    }
                });
                if (placeIds.length > 0) {
                    SetUBTTrackLog.call(slider, 1, { AdvertisementPosition: placeIds.join("-") });
                }
                if (competitiveIds.length > 0) {
                    SetUBTTrackLog.call(slider, 1, { AdvertisementPosition: competitiveIds.join("-") });
                }
            }

            function SetThridAdPv(adList) {
                $.each(adList, function (i, t) {
                    if (!Common.StringIsNullOrEmpty(t.ThirdLoadTrackUrl)) {
                        var img = new Image();
                        img.src = Common.AddUrlRandom(t.ThirdLoadTrackUrl);
                    }
                });
            }

            //初始化
            Init.call(this);
        },
        //动态广告加载
        DyAdBandData: function (data) {
            var $this = this;

            var firstAID = 0;
            var firstADIndex = 0;
            var tempBidAdCount = Common.GetStorage("BidAdCount" + $this.CacheKey);
            var tempDyAdIndex = Common.GetStorage("DyAdIndex" + $this.CacheKey);

            var firstData = this.AddDyAdData(this.DataList, data,this.FullDataList);
            //tempDyAdIndex > 0 &&去除
            if (firstData &&  data && data.AID > 0) {
                data.IsRequest = false;
                data.IsLoad = false;
                data.IsSync = true;
                firstAID = data.AID;
                firstADIndex = data.Index;
                //广告曝光
                this._dySumAdpv(data);
                var imgdy = new Image();
                imgdy.src = data.SrcUrl;
                data.LoadImgStartT = new Date().getTime();
                imgdy.onload = function () {
                    data.IsRequest = true;
                    data.LoadImgEndT = new Date().getTime();
                    if (firstData == data) {
                        firstData.IsLoad = true;
                        SetLoad($this, firstData);
                    }
                    $this.SetLoadTiming();
                };
                imgdy.onerror = function () {
                    data.IsRequest = true;
                    data.LoadImgEndT = new Date().getTime();
                    if (firstData == data) {
                        firstData.IsLoad = true;
                        SetLoad($this, firstData);
                    }
                    $this.SetLoadTiming();
                };
            }

            if ($this.sumAdPvData && $this.sumAdPvData.length > 0) {
                this._dySumAdpv($this.sumAdPvData);
            }

            if (firstData && firstData.SrcUrl) {
                if (!Common.StringIsNullOrEmpty(firstData.SrcUrl)) {
                    $.each($this.sumAdPvData, function (index, item) {
                        var img = new Image();
                        img.src = item.SrcUrl;
                        item.LoadImgStartT = new Date().getTime();
                        img.onload = function () {
                            item.IsRequest = true;
                            item.LoadImgEndT = new Date().getTime();
                            if (firstData == item) {
                                firstData.IsLoad = true;
                                SetLoad($this, firstData);
                            }
                            $this.SetLoadTiming();
                        };
                        img.onerror = function () {
                            item.IsRequest = true;
                            item.LoadImgEndT = new Date().getTime();
                            if (firstData == item) {
                                SetLoad($this, firstData);
                            }
                            $this.SetLoadTiming();
                        };
                    });
                }
                else {
                    firstData.IsRequest = true;
                    SetLoad($this, firstData);
                    $this.SetLoadTiming();
                }
            } else {
                $this.SetLoadTiming();
            }


            function SetLoad(t, d) {
                if (t.GetDataList(d)) {

                }
                t.SliderReLoad(d);
            }
        },
        GetDataList: function (data) {
            var blShow = this.DataList.length > 0;
            var $this = this;
            var dataList = [];
            $.each(this.DataList, function (index, item) {
                if (!item.IsRequest && item.Index <= data.Index) {
                    blShow = false;
                    return false;
                }
            });

            if (blShow) {
                GetLoadData(this.DataList, 0);
                this.datamodel.data = dataList;
            }
            if (data.IsSync) {
                this.datamodel.data = this.DataList;
            }

            function GetLoadData(list, index) {
                if (index >= list.length) {
                    return;
                }
                var item = list[index];
                if (item.IsRequest) {
                    if (item.IsLoad) {
                        dataList.push(item);
                    }
                    GetLoadData(list, index + 1);
                }
            }

            return blShow;
        },
        //添加动态广告数据
        AddDyAdData: function (dataList, dyData,fullDataList) {
            //判断广告中是否有动态或者竞价广告 有则不添加动态或者竞价广告
            if (dataList && dataList.length > 0) {
                for (var i = 0; i < dataList.length; i++) {
                    if (dataList[i].Adtype >= 100 || dataList[i].IsDy) {
                        return;
                    }
                }
            }

            var i = 0;
            var firstData = null;
            var tempDyAdIndex = Common.GetStorage("DyAdIndex" + this.CacheKey);
            var tempBidAdCount = Common.GetStorage("BidAdCount" + this.CacheKey);
            var dyAdIndex = tempDyAdIndex;

            var hasDyAd = dyData && dyData.AID > 0;
            if (hasDyAd && (dyAdIndex > 0 || dataList.length == 0)) {
                firstData = dyData;
            }

            var bidAdCount = tempBidAdCount - (dyAdIndex <= 0 || (dyData == null || !(dyData.AID > 0)) ? 0 : 1) - dataList.length;
            var hasDyAd = dyData && dyData.AID > 0;
            //添加动态广告
            if(hasDyAd){
                var isPush = false;
                if (bidAdCount >= 0 && dyAdIndex > 0 ) {
                    for (var i = 0; i < dataList.length; i++) {
                        var dataListItem =dataList[i];
                        if (dyAdIndex <= dataListItem.Index) {
                           // dyData.AdvertisementPosition = dataListItem.AdvertisementPosition;
                            dataList.splice(i, 0, dyData);
                            isPush = true;
                            break;
                        }
                    }
                }
                if (!isPush) {
                    dataList.push(dyData);
                }

                if(fullDataList && fullDataList.length){
                    for(var i=0;i<fullDataList.length;i++){
                        if(fullDataList[i].Index == dyData.Index){
                            dyData.AdvertisementPosition = fullDataList[i].AdvertisementPosition;
                            break;
                        }
                    }
                }
            }

            this.sumAdPvData = [];
            //处理剩余广告位
            if (bidAdCount > 0 && this.AdDataList && this.AdDataList.length > 0) {
                for (var nextIndex = 0; nextIndex < bidAdCount && nextIndex < this.AdDataList.length; nextIndex++) {
                    for (var k = 0; k < tempBidAdCount; k++) {
                        if (!firstData || firstData.Index > this.AdDataList[nextIndex].Index) {
                            firstData = this.AdDataList[nextIndex];
                        }
                        if (!dataList[k]) {
                            this.AdDataList[nextIndex].IsSync = true;
                            dataList.push(this.AdDataList[nextIndex]);
                            this.sumAdPvData.push(this.AdDataList[nextIndex]);
                            break
                        }
                        else if (dataList[k].Index > k + 1) {
                            this.AdDataList[nextIndex].IsSync = true;
                            dataList.splice(k, 0, this.AdDataList[nextIndex]);
                            this.sumAdPvData.push(this.AdDataList[nextIndex]);
                            break;
                        }
                    }
                }
            }

            return firstData;
        },
        //Slider重新加载
        SliderReLoad: function (item) {
            //动态广告加载CSS
            if (item.IsDy && !Common.StringIsNullOrEmpty(item.Style)) {
                document.getElementById("dyadStyle") == null && Common.LoadCss("dyadStyle", item.Style);
            } else {
                this.datamodel.data = this.datamodel.data.sort(function (a, b) {
                    return a.Index > b.Index ? 1 : -1;
                });
            }
            if(this.datamodel.data && this.datamodel.data.length){
                this._SetResize(this.datamodel.data);
            }

            this.autoPlay = this.datamodel.data.length > 1;
            this.needLoop = this.datamodel.data.length > 1;
            if (!this.IsLoadComplete) {
                this.wrapper.html("");
                this.wrapper.show();
                this.IsLoadComplete = true;
                this.show();
                !this.IsBackupLoadComplete && this.AdLoadComplete(this, 0);
                if (!Common.StringIsNullOrEmpty(this.BackupImageId)) {
                    $("#" + this.BackupImageId).remove();
                }
            }
            this.stop();
            this.reload();
			if(!this.FirstImgShowT && item.Index == 1){
				this.FirstImgShowT = new Date().getTime();
				this._firstImgShow(item);					
			}
			if(!this.DyImgLoadT && item.IsDy){
				this.DyImgLoadT = new Date().getTime();
				this._dyAdImgLoad(item);					
			}
            if (item.IsSync) {
                if(this.datamodel.data.length>1){
                    for (var j = 0; j < this.datamodel.data.length; j++) {
                        if (this.datamodel.data[j].ADID == this.datamodel.currentADID) {
                            break;
                        }
                    }
                    SetIndex.call(this, j);
                }else if(this.datamodel.data.length == 1) {
                    SetIndex.call(this, 0);
                }

            }
            if (this.datamodel.data.length > 1) {
                this.play();
            }
            else if (this.datamodel.data.length == 1 && this.scroll != null) {
                this.scroll.destroy();
                this.scroll = null;
            }
            ExpandSliderInit.call(this);
            this.changed(this.datamodel.data[0]);

            //扩展Slider初始化设置
            function ExpandSliderInit() {
                var $this = this;

                if (this.datamodel.data.length == 1 || !this.IsNav) {
                    this.sliderNav.hide();
                }
                else {
					//默认设置6px
					var bottom = 6;
					if ($this.dotheight && $this.dotheight != 0) {
						bottom = $this.dotheight;
					}
					this.sliderNav.css({'bottom':bottom + 'px'});
                    this.sliderNav.show();
					
                    this.sliderNav.find("span").off("click");
                    this.sliderNav.find("span").on("click", function () {
                        var index = parseInt($(this).attr("data-index"));
                        if (index >= 0) {
                            SetIndex.call($this, index);
                            if (index < $this.datamodel.data.length) {
                                $this.changed($this.datamodel.data[index]);
                            }
                        }
                    });
                }

                this.wrapper.find("li").each(function () {
                    $(this).css("font-size", $this.Height + "px");
                });

                this.wrapper.find("div.cm-slide").each(function () {
                    $(this).height($this.Height);
                });
            }

            //设置索引
            function SetIndex(index) {
                this.datamodel.index = index;
                this.setIndex(index, null, null, this.playTime);
                this._setNavIndex(index);
            }
        },
        //获取请求Head
        GetHead: function () {
            var auth = this.UserStore.getAuth();
            if (!auth || auth == "") {
                auth = Common.GetCookie("cticket");
            }
            if (!auth || auth == "") {
                auth = null;
            }
            this.HeadStore.setAuth(auth);
            return this.HeadStore.get();
        }
    });

    //基模型类
    var BaseModel = new cCoreInherit.Class(cModel, {
        __propertys__: function () {
            this.method = "POST";
            this.param = {};
        },
        buildurl: function () {
            var domain = "";
            //app环境
            //if (Lizard.isHybrid) {
            //    domain = "m.ctrip.com"
            //    var isPreProduction = Common.GetStorage("isPreProduction");
            //    if (isPreProduction == "0") {
            //        domain = 'gateway.m.fws.qa.nt.ctripcorp.com';
            //    }
            //    else if (isPreProduction == "2") {
            //        domain = 'gateway.m.uat.qa.nt.ctripcorp.com';
            //    }
            //    domain = "http://" + domain;
            //}
            //else {
            //    var host = window.location.host;
            //    if (host.match(/localhost|fws|fat/i)) {
            //        domain = "gateway.m.fws.qa.nt.ctripcorp.com";
            //    }
            //    else if (host.match(/uat/i)) {
            //        domain = "gateway.m.uat.qa.nt.ctripcorp.com";
            //    }
            //    if (window.location.href.toLowerCase().indexOf("https") == 0) {
            //        domain = "https://" + (domain == "" ? "sec-m.ctrip.com" : domain);
            //    }
            //    else {
            //        domain = "http://" + (domain == "" ? "m.ctrip.com" : domain);
            //    }
            //}
            var newUrl = OutInterface.GetRootUrl() + this.url;
            Common.Env = OutInterface.Env;
            //Common.Env = domain.match(/fws/) ? "fat" : domain.match(/uat/) ? "uat" : "prd";
            return newUrl;
        }
    });

    //广告数据模型对象
    var AdDataModel = {};

    //发送广告数据监控请求
    AdDataModel.GetMonitoringModel = new cCoreInherit.Class(BaseModel, {
        __propertys__: function () {
            this.url = "GetMonitoring";
        }
    });

    //获取广告数据列表
    AdDataModel.GetGlobalADListV4Model = new cCoreInherit.Class(BaseModel, {
        __propertys__: function () {
            this.url = "GetGlobalADListV4";
        }
    });

    //获取动态广告数据
    AdDataModel.GetDyAdDataModel = new cCoreInherit.Class(BaseModel, {
        __propertys__: function () {
            this.url = "GetDynamicAd";
        }
    });


    


    //通用方法类
    function Common() { }

    //是否数组
    Common.IsArray = function (obj) {
        if (obj == null || obj == undefined) {
            return false;
        }
        return typeof (obj) == "object" && obj.length >= 0;
    };

    //是否空对象
    Common.IsEmptyObject = function (obj) {
        if (obj === null || obj === undefined) {
            return true;
        }
        if (typeof (obj) == "object" && obj.length > 0) {
            return false;
        }
        if (typeof (obj) == "object") {
            var blExists = false;
            for (var key in obj) {
                blExists = true;
                break;
            }
            return !blExists;
        }
        return false;
    };

    //JSON字符串转化成对象
    Common.JsonToObject = function (jsonString) {
        if (Common.StringIsNullOrEmpty(jsonString) || typeof (jsonString) != "string") {
            return null;
        }
        jsonString = Common.StringTrim(jsonString);
        try {
            return eval("(" + jsonString + ")");
        }
        catch (ex) {
        }
        return null;
    };

    //是否函数
    Common.IsFunction = function (fn) {
        return typeof (fn) == "function";
    };

    //字符串去掉空格
    Common.StringTrim = function (str) {
        return (str === undefined || str === null) ? "" : str.replace(/(^\s*)|(\s*$)/g, "").replace(/(^　*)|(　*$)/g, "");
    };

    Common.GetCookie = function (name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = Common.StringTrim(cookies[i]);
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };

    //字符串格式化
    Common.StringFormat = function (str, array) {
        if (Common.StringIsNullOrEmpty(str)) {
            return "";
        }
        if ($.isArray(array)) {
            for (var i = 0; i < array.length; i++) {
                array[i] = Common.StringIsNullOrEmpty(array[i]) ? "" : array[i].toString();
                str = str.replace(new RegExp("\\{" + i.toString() + "\\}", "g"), array[i]);
            }
        }
        return str;
    };

    //字符串是否为空
    Common.StringIsNullOrEmpty = function (value) {
        return (value === null || value === undefined) || Common.StringTrim(value.toString()) == "";
    };

    //加载CSS
    Common.LoadCss = function (id, content) {
        var newStyle = document.createElement("style");
        newStyle.type = "text/css";
        newStyle.id = id;
        if (typeof newStyle.styleSheet != "undefined") {
            newStyle.styleSheet.cssText = content;
        }
        else {
            newStyle.innerHTML = content;
        }
        document.getElementsByTagName("head")[0].appendChild(newStyle);
    };

    //加载CSS引用
    Common.LoadLink = function (url) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    };

    //加载JS
    Common.LoadJS = function (url, callback, errcallback) {
        var documentHeader = document.head || document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.charset = 'utf-8';
        script.async = true;
        script.onload = function () {
            callback && callback();
        }
        script.onerror = function () {
            errcallback && errcallback();
            documentHeader.removeChild(script);
        }
        script.src = url;
        documentHeader.appendChild(script);
    }

    //页图跳转
    Common.JumpUrl = function (url) {
        Lizard.jump(url, { targetModel: (Lizard.isHybrid || Lizard.isInCtripApp) ? 2 : 0 });
    };

    //获取Cookie
    Common.GetCookie = function (name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = Common.StringTrim(cookies[i]);
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };

    //数组遍历
    Common.ArrayForeach = function (list, fn) {
        for (var i = 0; i < list.length; i++) {
            if (fn(list[i], i) === false) {
                break;
            }
        }
    };

    //设置本地缓存
    Common.SetStorage = function (key, value) {
        try {
            localStorage.setItem(key, value);
        }
        catch (ex) {
        }
    };

    //获取本地缓存
    Common.GetStorage = function (key) {
        var value = "";
        try {
            value = localStorage.getItem(key);
        }
        catch (ex) {
        }
        return Common.StringIsNullOrEmpty(value) ? "" : value;
    };

    //是否是Object对象
    Common.IsObject = function (obj) {
        if (obj == null || obj == undefined) {
            return false;
        }
        return typeof (obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
    };

    //克隆对象
    Common.Clone = function (obj) {
        if ($.isEmptyObject(obj)) {
            return obj;
        }
        if ($.isArray(obj)) {
            var list = [];
            for (var i = 0; i < obj.length; i++) {
                list.push(Common.Clone(obj[i]));
            }
            return list;
        }
        else if (Common.IsObject(obj)) {
            var cloneObj = {};
            for (var key in obj) {
                if ($.isArray(obj[key]) || Common.IsObject(obj[key])) {
                    cloneObj[key] = Common.Clone(obj[key]);
                }
                else {
                    cloneObj[key] = obj[key];
                }
            }
            return cloneObj;
        }
        return obj;
    };

    //设置_trackLog
    Common.SetUBTTrackLog = function (type, value) {
        window.__bfi = window.__bfi || [];
        var key = type == 2 ? "AdPV" : type == 3 ? "AdClick" : type == 1 ? "sumadpv" : type == 4 ? "100323" : type == 5 ? "100323" : "";
        key != "" && window.__bfi.push(["_tracklog", key, value]);
    };

    //_trackMetric接口，tag最大限制8个，tag的值长度为200以内，支持抽样配置
    Common.TrackMetric = function (startTime, pageId, type, status, siteID, siteType) {
        var ms = new Date().getTime() - startTime;
        if (Common.StringIsNullOrEmpty(pageId)) {
            return;
        }
        siteID = siteID || "";
        siteType = siteType || "";
        var trackMetric = {
            name: "adsdkelapsedtime",
            value: ms,
            sample: 10,
            tag: {
                PageId: pageId,
                InterfaceType: type,//1:总耗时,2:静态广告，3：动态广告，4：获取城市
                Status: status, //0:成功，1：错误
                SiteType: siteType,
                SiteID: siteID
            }
        };
        window.__bfi = window.__bfi || [];
        window.__bfi.push(["_trackMetric", trackMetric]);
    };

    //获取_bfa Cookie值，取其第二、三项值作为VId值
    Common.GetVId = function () {
        var _bfa = Common.GetCookie("_bfa");
        if (_bfa != null) {
            var _bfa_Values = _bfa.toString().split('.');
            if (_bfa_Values.length > 2) {
                return _bfa_Values[1] + "." + _bfa_Values[2];
            }
        }
        return "";
    };

    Common.CreateGuid = function () {
        function S1() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(4);
        }
        function newGuid() {
            var guid = "";
            for (var i = 1; i <= 20; i++) {
                guid += S1();
                if (i === 8 || i === 12 || i === 16 || i === 20) {
                    guid += "-";
                }
            }
            var num = parseInt(8 * Math.random());
            var date = new Date().getTime() + '';
            guid += date.slice(0, num);
            for (var j = 0; j < 4; j++) {
                guid += S1();
            }
            guid += date.slice(num + 5, 13);
            return guid;
        }
        return newGuid();
    };

    //替换Http/Https
    Common.ReplaceHttp = function (url) {
       if (Common.StringIsNullOrEmpty(url)) {
            return url;
        }
        var newUrl = Common.StringTrim(url);
        if (localIsHybrid){
            if (/^[\/]{2}/.test(newUrl)) {
                newUrl = defaultImgProtocol + newUrl;
            }            
        } else {
            newUrl =newUrl.replace(/^(http:|https:)/ig, '');
        }
        return newUrl;
    };

    Common.AddUrlRandom = function (url) {
        if (Common.StringIsNullOrEmpty(url)) {
            return;
        }
        url += url.indexOf("?") > 0 ? "&" : "?";
        url += Common.StringFormat("_r{0}={1}", [Common.GetRandomChars(), Math.random()]);
        return url;
    };

    Common.GetRandomChars = function (len) {
        len = len || 10;
        var chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz";
        var str = [];
        for (var i = 0; i < len; i++) {
            str.push(chars.charAt(Math.floor(Math.random() * chars.length)));
        }
        return str.join("");
    };

    //将对象转换成JSON字符串
    Common.JsonToString = function (obj) {
        if (obj === null || obj === undefined || Common.IsFunction(obj)) {
            return "";
        }
        return ValueToString("", obj);

        function ValueToString(key, value) {
            var vs = "";
            if (value == null) {
                vs = "null";
            }
            else if (typeof (value) == "number") {
                vs = value.toString();
            }
            else if (typeof (value) == "boolean") {
                vs = value.toString().toLowerCase();
            }
            else if (Common.IsArray(value)) {
                var jsons = [];
                for (var i = 0; i < value.length; i++) {
                    jsons.push(ValueToString("", value[i]));
                }
                vs = "[" + jsons.join(",") + "]";
            }
            else if (Common.IsObject(value)) {
                var jsons = [];
                for (var k in value) {
                    if (!Common.IsFunction(value[k])) {
                        jsons.push(ValueToString(k, value[k]));
                    }
                }
                vs = "{" + jsons.join(",") + "}";
            }
            else {
                vs = "\"" + value.toString().replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + "\"";
            }
            return Common.StringIsNullOrEmpty(key) ? vs : Common.StringFormat("\"{0}\":{1}", [key, vs]);
        }
    };

    //外部接口类
    function OutInterface() { }

    //获取环境
    OutInterface.GetEnvName = function () {
        if(Lizard.isHybrid){
            var env = cUtilHybrid.isPreProduction();
            switch(env){
                case "1":
                    return "fat";
                case "2":
                    return "uat";
                default:
                    return "prd";
            }
        }else{
            var host = window.location.host;
            if (host.match(/localhost|fws|fat/i)) {
                return "fat";
            }else if (host.match(/uat/i)) {
                return "uat";
            }
            return "prd";
        }
    };

    

    //获取Gateway服务地址
    OutInterface.GetRootUrl = function () {
       var domain = "",
            url ,
            envName = OutInterface.GetEnvName(),
            protocol = soaProtocol,
            isHttp = protocol ==="http:"
            ;

        if (envName =="fat") {
            domain = "gateway.m.fws.qa.nt.ctripcorp.com";
            protocol = "http:";
        }
        else if (envName == "uat") {
            domain = "gateway.m.uat.qa.nt.ctripcorp.com";
        }else {
            if(isHttp){
                domain = "m.ctrip.com";
            }else{
                domain= "sec-m.ctrip.com";
            }
        }
      
        url=[protocol,"//",domain,"/restapi/soa2/10245/json/"].join("");
        OutInterface.Env = envName;
        return url;
    };

    //数据请求类
    function DataAccess() { }

    //数据请求
    DataAccess.Request = function (request) {
        if (Common.IsEmptyObject(request)) {
            return;
        }

        //初始化请求属性
        request.Method = request.Method == undefined ? "GET" : request.Method;
        if (Common.StringIsNullOrEmpty(request.Url)) {
            return;
        }
        //默认异步请求
        request.Async = request.Async == undefined ? true : request.Async;
        request.Headers = request.Headers == undefined ? {} : request.Headers;
        request.DataType = request.DataType == undefined ? "json" : request.DataType;
        request.ContentType = request.ContentType == undefined ? "application/x-www-form-urlencoded" : request.ContentType;
        request.Data = request.Data == undefined ? "" : request.Data;

        var xmlHttp = null;

        //创建请求
        xmlHttp = CreateRequest();
        if (xmlHttp == null) {
            return;
        }

        //打开请求
        xmlHttp.open(request.Method, GetUrl(request.Url), request.Async, request.User, request.Password);
        //设置请求头信息
        xmlHttp.setRequestHeader("Accept", request.DataType);
        xmlHttp.setRequestHeader("Content-Type", request.ContentType);
        for (var key in request.Headers) {
            xmlHttp.setRequestHeader(key, request.Headers[key]);
        }

        //处理请求响应返回
        xmlHttp.onreadystatechange = function () {
            //readyState属性用来表示请求的状态，有5个可取值，分别是：
            //“0”：表示未初始化，即对象已经建立，但是尚未初始化(尚未调用open()方法)；
            //“1”：表示正在加载，此时对象已建立，尚未调用send()方法；
            //“2”：表示请求已发送，即send()方法已调用；
            //“3”：表示请求处理中；
            //“4”：表示请求已完成，即数据接收完毕。
            if (xmlHttp.readyState == 4) {
                if (xmlHttp.status == 200) {
                    if (request.SuccessCallback != undefined && typeof (request.SuccessCallback) == "function") {
                        var data;
                        if (request.DataType == "json") {
                            data = Common.JsonToObject(xmlHttp.responseText);
                        }
                        else if (request.DataType == "xml") {
                            data = xmlHttp.responseXML;
                        }
                        else {
                            data = xmlHttp.responseText;
                        }
                        request.SuccessCallback(data, xmlHttp);
                    }
                }
                else {
                    if (request.ErrorCallback != undefined && typeof (request.ErrorCallback) == "function") {
                        request.ErrorCallback(xmlHttp);
                    }
                    else {
                        if (Common.StringIsNullOrEmpty(xmlHttp.responseText)) {
                            alert(xmlHttp.status + ":" + xmlHttp.statusText);
                        }
                        else {
                            alert(xmlHttp.responseText);
                        }
                    }
                }
            }
        };

        //发送请求
        xmlHttp.send(request.Data);

        //创建请求对象
        function CreateRequest() {
            try {
                if (window.XMLHttpRequest) {
                    return new XMLHttpRequest();
                }
                else if (window.ActiveXObject) {
                    return new ActiveXObject("Microsoft.XMLHTTP");
                }
            }
            catch (e) {
            }
            return null;
        };

        function GetUrl(url) {
            if (url.indexOf("?") > 0) {
                url += "&_rm=" + Math.random();
            }
            else {
                url += "?_rm=" + Math.random();
            }
            return encodeURI(url);
        }

        return xmlHttp;
    };

    //POST数据请求
    DataAccess.PostRequest = function (url, data, successCallback, errorCallback, async) {
        var request = {};
        request.Url = url;
        request.Method = "POST";
        request.Async = async;
        request.ContentType = "application/json; charset=utf-8";
        request.Data = Common.JsonToString(data);
        request.SuccessCallback = function (a, b) {
            request.IsCallback = true;
            successCallback && successCallback(a, b);
        };
        request.ErrorCallback = function (a) {
            request.IsCallback = true;
            errorCallback && errorCallback(a);
        };
        var xmlHttp = DataAccess.Request(request);
        window.setTimeout(function () {
            if (!request.IsCallback) {
                request.IsCallback = false;
                xmlHttp.abort();
                xmlHttp.XmlHttp2 = DataAccess.Request(request);
            }
        }, 3000);
        return xmlHttp;
    };

    //数据访问类
    function AdDataAccess(slider) {
        this.Slider = slider; //AdSliderControl

        //发送广告数据监控请求
        this.GetMonitoring = function ($this, ADPositions, callback) {
            var t = this;
            if (!ADPositions || ADPositions.length <= 0) {
                return;
            }
            var head = this.Slider.GetHead();

            var data = {};
            data.ADPositions = ADPositions;
            data.PageID = $this.PageId;

            var url = OutInterface.GetRootUrl() + "GetMonitoring";
            DataAccess.PostRequest(url, data, function (d) {
                _Callback();
            },
            function () {
                _Callback();
            });

            function _Callback() {
                callback.call($this);
            }
        };

        //获取广告数据列表
        this.GetAdDataList = function ($this, callback) {
            var t = this;
            var head = this.Slider.GetHead();

            var data = {};
            data.DeviceInfo = GetDeviceInfo.call(this);
            data.SystemCode = parseFloat(head.syscode);
            data.head = head;
            data.ChannelID = head.sid;
            data.SiteID = this.Slider.SiteID;
            data.SiteType = this.Slider.SiteType;
            data.GlobalBusinessInfoList = [GetGlobalBusinessInfo.call(this)];
            //分销定向参数
            data.Extension = [];
            data.Extension.push(GetDistributionInfo.call(this, 'AllianceID', this.Slider.AllianceID));
            data.Extension.push(GetDistributionInfo.call(this, 'SID', this.Slider.SID));
            data.Extension.push(GetDistributionInfo.call(this, 'OUID', this.Slider.OUID));
            data.AdLocation={};
            //获取城市
            var cityId = Common.GetStorage("SelectCityId");
            var adLonAndLat = Common.GetStorage("MKT_Ad_CityLonAndLat");
            if (parseFloat(cityId) > 0) {
                data.AdLocation.CityID=cityId;
            }
            if (adLonAndLat) {
                try {
                    data.AdLocation.Longitude =JSON.parse(adLonAndLat).Lon;
                    data.AdLocation.Latitude =JSON.parse(adLonAndLat).Lat;
                }
                catch(err){
                    //console.log
                }
               
            }

            //判断SystemCode如果为空，则不请求
            if (Common.StringIsNullOrEmpty(data.SystemCode)) {
                return;
            }

            var startTime = new Date().getTime();
            this.AdEndTime = 0;

            var url = OutInterface.GetRootUrl() + "GetGlobalADListV4";
            DataAccess.PostRequest(url, data, function (d) {
                _Callback(d, 0, t.Slider.CacheKey);
            },
            function () {
                _Callback(null, 0, t.Slider.CacheKey);
            });

            function _Callback(d, status, cacheKey) {
                //清空站点类型 站点ID
                Common.SetStorage("SiteType" + cacheKey, "");
                Common.SetStorage("SiteID" + cacheKey, "");
                Common.SetStorage("BidAdCount" + cacheKey, 0);
                Common.SetStorage("DyAdIndex" + cacheKey, 0);
                //查询接口回调方法  获取返回的广告列表中的站点ID跟站点类型
                if (d && d.Extensions && d.Extensions.length > 0) {
                    for (var i = 0; i < d.Extensions.length; i++) {
                        var extension = d.Extensions[i];
                        if (extension.Name === "AdSite") {
                            Common.SetStorage("SiteType" + cacheKey, extension.Key);
                            Common.SetStorage("SiteID" + cacheKey, extension.Value);
                        } else if (extension.Name === "BidAdCount") {
                            Common.SetStorage("BidAdCount" + cacheKey, extension.Value);
                        } else if (extension.Name === "DyAdIndex") {
                            Common.SetStorage("DyAdIndex" + cacheKey, extension.Value);
                        }
                    }
                }
                var siteID = Common.GetStorage("SiteID" + t.Slider.CacheKey);
                var siteType = Common.GetStorage("SiteType" + t.Slider.CacheKey);
                Common.TrackMetric(startTime, t.Slider.PageId, 2, status, siteID, siteType);
                if (d != null && d.Ads != undefined && d.Ads.length > 0) {
                    callback.call($this, d.Ads);
                }
                else {
                    !t.Slider.IsBackupLoadComplete && t.Slider.AdLoadComplete(t.Slider, 1);
                }
                t.AdEndTime = new Date().getTime();
                AdLoadTotalElapsed.call(t);           
            }
        };

        //获取动态广告
        this.GetDyAdData = function ($this, cityId, callback) {
            var t = this;
            var head = this.Slider.GetHead();

            var deviceInfo = GetDeviceInfo.call(this);



            var data = {};
            data.LocationType = { CityID: cityId };
            data.ScreenWidth = deviceInfo.ScreenWidth;
            data.ScreenHeight = deviceInfo.ScreenHeight;
            data.head = head;
            data.BusinessInfo = { BusinessType: this.Slider.BizType, PageCode: this.Slider.PageCode };
            data.VID = Lizard.isHybrid ? head.cid : Common.GetVId();


            //判断syscode如果为空，则不请求
            if (Common.StringIsNullOrEmpty(head.syscode)) {
                return;
            }

            var startTime = new Date().getTime();
            this.DyAdEndTime = 0;

            var url = OutInterface.GetRootUrl() + "GetDynamicAd";
            DataAccess.PostRequest(url, data, function (d) {
                _Callback(d, 0);
            },
            function () {
                _Callback(null, 0);
            });

            function _Callback(d, status) {
                var siteID = Common.GetStorage("SiteID" + t.Slider.CacheKey);
                var siteType = Common.GetStorage("SiteType" + t.Slider.CacheKey);
                Common.TrackMetric(startTime, t.Slider.PageId, 3, status, siteID, siteType);
                callback.call($this, d);
                t.DyAdEndTime = new Date().getTime();
                AdLoadTotalElapsed.call(t);
            }
        };

        //广告加总耗时
        function AdLoadTotalElapsed() {
            if (this.AdEndTime > 0 && this.DyAdEndTime > 0) {
                var siteID = Common.GetStorage("SiteID" + this.Slider.CacheKey);
                var siteType = Common.GetStorage("SiteType" + this.Slider.CacheKey);
                Common.TrackMetric(this.Slider.StartTime, this.Slider.PageId, 1, 0, siteID, siteType);
            }
        }

        //获取设备信息
        function GetDeviceInfo() {
            var deviceInfo = {};
            var cinfo = this.Slider.LocalStorage.oldGet("CINFO");
            var tagid = this.Slider.TagId;




            if (!$.isEmptyObject(cinfo)) {
                deviceInfo.ScreenWidth = cinfo.screenWidth;
                deviceInfo.ScreenHeight = cinfo.screenHeight;
                deviceInfo.ScreenPxDensity = cinfo.screenPxDensity;
                deviceInfo.DeviceOSVersion = cinfo.serverVersion;
            }
            else {
                deviceInfo.ScreenWidth = window.innerWidth * (window.devicePixelRatio || 1);
                deviceInfo.ScreenHeight = window.innerHeight * (window.devicePixelRatio || 1);
            }
            deviceInfo.ScreenWidth = Common.StringIsNullOrEmpty(this.Slider.ScreenWidth) ? deviceInfo.ScreenWidth : this.Slider.ScreenWidth;
            deviceInfo.ScreenHeight = Common.StringIsNullOrEmpty(this.Slider.ScreenHeight) ? deviceInfo.ScreenHeight : this.Slider.ScreenHeight;

            //如果广告位指定了宽度，取广告位上的
            if ($("#" + tagid).width() > 0) {
                deviceInfo.ScreenWidth = ($("#" + tagid).width() * (window.devicePixelRatio || 1));
            }
            if ($("#" + tagid).height() > 0) {
                deviceInfo.ScreenHeight = ($("#" + tagid).height() * (window.devicePixelRatio || 1));
            }
            
            
            return deviceInfo;
        }

        //获取业务信息
        function GetGlobalBusinessInfo() {
            var globalBusinessInfo = {};
            globalBusinessInfo.BizType = this.Slider.BizType;
            globalBusinessInfo.PageCode = this.Slider.PageCode;
            return globalBusinessInfo;
        }

        //获取分销信息
        function GetDistributionInfo(name, value) {
            var distributionInfo = {};
            distributionInfo.Name = name;
            distributionInfo.Value = value;
            return distributionInfo;
        }
    }

    //业务类     
    function AdBusiness(slider) {
        this.Slider = slider; //AdSliderControl
        this.DataAccess = null; //数据访问类
        this.TagObject = null; //HTML标签对象
        this.AdDataList = []; //广告数据列表
        this.DyAdData = null; //动态广告数据对象
        this.AdContentList = [];//广告内容数据列表
        var tagid = this.Slider.TagId;
       

        //初始化设置
        this.Init = function () {
            //设置初始化起始时间
            this.InitStartT = new Date().getTime();

            //实例化数据访问类
            this.DataAccess = new AdDataAccess(this.Slider);
            this.TagObject = $("#" + this.Slider.TagId);

            //获取对象缓存数据
            GetCacheAdData.call(this);

            //设置保底图片
            SetBackupImage.call(this);

            //获取城市，加载动态广告
            if (this.DyAdData == null) {
                GetCity.call(this);
            }

            //V4接口请求时间
            this.Slider.V4StartT = new Date().getTime();
            //获取广告数据
            if (this.AdDataList.length == 0) {
                this.DataAccess.GetAdDataList(this, function (dataList) {
                    //V4接口返回时间
                    this.Slider.V4EndT = new Date().getTime();
                    this.AdDataList = dataList;
                    SetCacheAdData.call(this, false);
                    LoadAdHtml.call(this);
                   
                });

                //获取城市
                GetCity.call(this, true);
            }
            else {
                //V4接口返回时间
                this.Slider.V4EndT = this.Slider.V4StartT;
                LoadAdHtml.call(this);
            }
        };

        //获取对象缓存数据
        function GetCacheAdData() {
            var key = "AdDataList_" + this.Slider.CacheKey;
            if (!$.isEmptyObject(AdDataModel.GetGlobalADListV4Model[key])) {
                this.AdDataList = Common.Clone(AdDataModel.GetGlobalADListV4Model[key]);
            }
        }

        //设置对象缓存数据
        function SetCacheAdData(blDy) {
            var key = "";
            if (blDy) {
            }
            else {
                key = "AdDataList_" + this.Slider.CacheKey;
                AdDataModel.GetGlobalADListV4Model[key] = this.AdDataList;
            }
        }

        //获取城市
        function GetCity(blAd) {
            if (blAd) {
                GeoGetCity.call(this);
                return;
            }

            var startTime = new Date().getTime();
            if (AdBusiness.SelectCityId != undefined) {
                GetDyAdData.call(this, AdBusiness.SelectCityId, startTime, -1, true);
                return;
            }

            AdBusiness.SelectCityId = Common.GetStorage("SelectCityId");
            if (!AdBusiness.SelectCityId) {
                AdBusiness.SelectCityId = 2;
            }

            if (!Common.StringIsNullOrEmpty(AdBusiness.SelectCityId)) {
                GetDyAdData.call(this, AdBusiness.SelectCityId, startTime, -1, true);
                GeoGetCity.call(this);
                return;
            }

            GeoGetCity.call(this, true);

            function GeoGetCity(blCall) {
                this.Slider.GeoService.GeoLocation.Subscribe("AdGetCity", {
                    onPosComplete: function (long,lat) {
                        if (long && lat) {
                            lonAndLat = JSON.stringify({ "Lat": lat, "Lon": long });
                            Common.SetStorage("MKT_Ad_CityLonAndLat", lonAndLat);
                        }
                       
                    },
                    onCityComplete: function (cityInfo) {
                        var cityId = 0;
                        var lonAndLat = "";
                        if (cityInfo != undefined && cityInfo.CityEntities.length > 0) {
                            cityId = cityInfo.CityEntities[0].CityID;
                        }
                        //定位成功设置城市ID
                        Common.SetStorage("SelectCityId", cityId);
                      
                        //GetDyAdData.call(this, cityId, startTime, 0, blCall);
                    },
                    onPosError: function (data) {
                        //GetDyAdData.call(this, 0, startTime, 1, blCall);
                    },
                    onCityError: function (data) {
                        //GetDyAdData.call(this, 0, startTime, 1, blCall);
                    }
                }, this, false,20000,true,true);
            }
        }

        this.GetMonitoring = function (ADPositions, callback) {
            this.DataAccess.GetMonitoring(this.Slider, ADPositions, callback);
        }

        //获取动态广告数据
        function GetDyAdData(cityId, startTime, status, blCall) {
            //如果是插屏广告，就不要调接口了，插屏广告只使用V4接口数据
            if (this.Slider.TemplateVal && this.Slider.TemplateType == "Interstitial") {
                return;
            }

            AdBusiness.SelectCityId = cityId;
            Common.SetStorage("SelectCityId", cityId);
            if (blCall) {
                if (status != -1) {
                    //获取城市TrackMetric
                    Common.TrackMetric(startTime, this.Slider.PageId, 4, status);
                }
                //动态接口返回时间
                this.Slider.DyStartT = new Date().getTime();
                this.DataAccess.GetDyAdData(this, cityId, function (data) {
                    //动态接口返回时间
                    this.Slider.DyEndT = new Date().getTime();
                    if (!data || data.AID <= 0) {
                        data = true;
                    }
                      LoadDyAdHtml.call(this, data);
                });
            }
        }

        //加载广告HTML
        function LoadAdHtml() {
            var $this = this;
            $this.Slider.IsLoadAdComplate = true;
            var dataList = [];
            $this.Slider.AdDataList = [];
            //var templateData = this.AdDataList;

            if (this.AdDataList.length > 0) {
                dataList = this.AdDataList[0].ADContentList;
                dataList = dataList.sort(function (a, b) {
                    return a.Index > b.Index ? 1 : -1;
                });
            }

            this.AdContentList = [];
            var placeIds = [];
            var competitiveIds = [];
            $.each(dataList, function (index, item) {
                item.Id = Common.CreateGuid();
                item.AdvertisementPosition = item.PlaceID;
                item.AID = item.ADID;
                item.IsVisible = false;
                if (!Lizard.isHybrid) {
                    item.SrcUrl = Common.ReplaceHttp(item.SrcUrl);
                }
                if (item.Adtype < 100) {
                    $this.AdContentList.push(item);
                    placeIds.push(item.AdvertisementPosition + ":" + item.AID);
                } else {
                    $this.Slider.AdDataList.push(item);
                    competitiveIds.push(item.AdvertisementPosition + ":" + item.AID);
                }
            });

            //动态广告
            if (this.DyAdData != null) {
                this.DyAdData.IsVisible = false;
                this.Slider.AddDyAdData(this.AdContentList, this.DyAdData,dataList);
            }

            //如果是插屏广告，加载模板文件
            if (this.Slider.TemplateVal && this.Slider.TemplateType == "Interstitial") {
                //插屏广告只在app中才起作用
                if (Lizard.app && Lizard.app.vendor && Lizard.app.vendor.is('CTRIP')) {
                    Common.LoadJS("https://webresource.c-ctrip.com/ResMarketOnline/R2/js/Template/template" + this.Slider.TemplateVal + ".js", function () {
                        window.__MKT_Ad_Template && window.__MKT_Ad_Template({
                            tagid: tagid,
                            pageid:$this.Slider.PageId,
                            data: $this.AdDataList[0] || []
                        });
                    });

                    //发送总曝光数据
                    if (placeIds.length > 0) {
                        $this.Slider._setUBTTrackLog(1, { AdvertisementPosition: placeIds.join("-") });
                    }
                    if (competitiveIds.length > 0) {
                        $this.Slider._setUBTTrackLog(1, { AdvertisementPosition: competitiveIds.join("-") });
                    }

                    //发送有效曝光数据
                    if (!!dataList[0]) {
                        $this.Slider._setUBTTrackLog(2, dataList[0]);
                    }
                    
                }
             
            } else {
                //正常加载轮播广告
                this.Slider.BandData(this.AdContentList, dataList);
            }
        }

        //加载动态广告
        function LoadDyAdHtml(data) {
            this.Slider.IsLoadDyAdComplate = true;
            if (!data) {
                this.Slider.DyAdBandData(null);
                return;
            }
            var adData = {};
            adData.Id = Common.CreateGuid();
            adData.Style = data.Style;
            //动态广告
            adData.IsDy = true;
            adData.IsVisible = false;

            adData.PlaceID = data.PlaceID > 0 ? (data.PlaceID - 0) : 0;
            //广告内容
            adData.Content = data.Content;
            //广告ID
            adData.AID = data.AID;
            adData.ADID = data.AID > 0 ? (data.AID - 0) : 0;
            adData.Adtype = 0;
            //图片地址
            adData.SrcUrl = data.Src;
            //跳转链接
            adData.LinkUrl = data.Link;
            adData.Width = data.Width;
            adData.Height = data.Height;
            adData.TagId = data.TagId;
			//动态广告参加竞价，修改index赋值逻辑
            var tempDyAdIndex = Common.GetStorage("DyAdIndex" + this.Slider.CacheKey);
			if(tempDyAdIndex > 0){
				adData.Index = tempDyAdIndex;				
			}else{
				adData.Index = data.Index;					
			}

            if (!Lizard.isHybrid) {
                adData.SrcUrl = Common.ReplaceHttp(adData.SrcUrl);
            }

            if (data.Extension && data.Extension.length > 0) {
                $.each(data.Extension, function (index, item) {
                    adData[item.Name] = item.Value;
                });
            }
            //广告位ID 修改动态广告使用普通广告的PlaceID、AdvertisementPosition
            adData.AdvertisementPosition = data.PlaceID;

            this.DyAdData = adData;
            SetCacheAdData.call(this, true);

            //将动态广告对象作为第一帧插入的广告对象数组中
            //if (this.AdContentList.length > 0) {
                this.Slider.DyAdBandData(this.DyAdData);
            //}
        };

        //设置保底图片
        function SetBackupImage() {
            var $this = this;
            this.TagObject.html("");
            this.Slider.IsNoAdHide && this.TagObject.hide();
            if (!Common.StringIsNullOrEmpty(this.Slider.BackupImageUrl) && !this.Slider.IsLoadComplete) {
                this.Slider.BackupImageId = Common.CreateGuid();
                if (!Lizard.isHybrid) {
                    this.Slider.BackupImageUrl = Common.ReplaceHttp(this.Slider.BackupImageUrl);
                }
                var img = new Image();
                img.src = this.Slider.BackupImageUrl;
                img.onload = function () {
                    if (!$this.Slider.IsLoadComplete) {
                        var html = Common.StringFormat("<img src=\"{0}\" id=\"{1}\" style=\"width:100%;\"/>", [$this.Slider.BackupImageUrl, $this.Slider.BackupImageId]);
                        $this.TagObject.html(html);
                        $this.TagObject.show();
                        $this.Slider.IsBackupLoadComplete = true;
                        $this.Slider.AdLoadComplete($this.Slider, 0);
                    }
                };
            }
        }

        //获取晶赞广告ID
        function GetZamAdId(url) {
            var aid = "";
            if (!Common.StringIsNullOrEmpty(url)) {
                var index = url.indexOf("?");
                if (index > 0) {
                    url = url.substring(index + 1);
                    var strs = url.split("&");
                    for (var i = 0; i < strs.length; i++) {
                        if (strs[i].indexOf("a=") == 0) {
                            aid = strs[i].substring(2);
                            break;
                        }
                    }
                }
            }
            return aid;
        }
    }

    return adSliderControl;
});