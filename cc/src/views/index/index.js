define(['text!indexViewTpl', 
	'model', 
	'text!views/index/unapply.html', 
	'text!views/index/applied.html', 
	'text!views/index/actived.html', 
	'Deferred', 
	'underscore', 'Zepto', 'CardUtil'], 
	function(indexViewTpl, 
		getModel, 
		unapplyTpl, 
		appliedTpl, 
		activedTpl, 
		Deferred,
		_, $, CardUtil) {

		var floorMoreComponent = {
			template: ['<div class="homepage-benefit js_jump" :data-target="floor.showMoreUrl">',
	                    	'<span>{{floor.textMore|| "更多权益"}}<i class="icon-arrow"></i></span>',
	                    '</div>'].join(''),
			props: ['floor']
		}
		var templates = {
			// 纯文字
			0: ['<div><dl class="hp-equity">',
                    '<dt>',
                    	'<span></span>',
                    	'<span>{{floor.floorName}}</span>',
                    	'<span></span>',
                    '</dt>',
                    '<dd v-for="item in floor.horizonBlocks">{{item.textDescribe}}</dd>',
                    '<floor-more v-if="floor.isShowMore" :floor="floor"></floor-more>',
                '</dl></div>'].join(''),
	        // 纯图片 class js_jump用于绑定事件，data-target用于记录目标url            
	        1: ['<div><dl class="homepage-ad-dl">',
                    '<dd v-for="item in floor.horizonBlocks"><img class="js_jump" :data-target="item.jumpUrl" :src="item.imageUrl"/></dd>',
                    '<floor-more v-if="floor.isShowMore" :floor="floor"></floor-more>',
                '</dl></div>'].join(''),
	        // 奇偶混合 class js_jump用于绑定事件，data-target用于记录目标url	
	        3: ['<div>',
                    '<div class="hp-enjoy-ad">',
                    	'<img v-for="item in floor.verticalBlocks" class="js_jump" :data-target="item.jumpUrl" :src="item.imageUrl"/>',
                    '</div>',
                    '<ul v-if="floor.horizonBlocks && floor.horizonBlocks.length" class="hp-three-equity">',
                    	'<li v-for="item in floor.horizonBlocks"><img class="js_jump" :data-target="item.jumpUrl" :src="item.imageUrl"/></li>',
                    '</ul>',
                    '<floor-more v-if="floor.isShowMore" :floor="floor"></floor-more>',
                '</div>'].join(''),
		}

		var pageViewComponent = {
			props: ['floors'],
			render: function(createElement) {
				var children = [];
				_.each(this.floors, function(floor) {
					if(templates[floor.floorStyle]) {
						var floorComponent = {
							template: templates[floor.floorStyle],
					        components: {
					        	'floor-more': floorMoreComponent
					        },
					        props: ['floor']
						}
						children.push(createElement(floorComponent, { 
							props: {
								floor: floor
							}
						}));
					}
				});
				return createElement('div', children)
			}
		}
		// 获取首页配置数据
        var getHomePageConfig = (function(){
            // 调用接口获取首页配置
            function getHomePageConfigRemote(type) {
                var deferred = Deferred();
                getModel('getHomePageConfig').setParam({
                    homeConfigState: type
                });
                getModel('getHomePageConfig').execute(onAlways, onAlways);
                return deferred.promise();

                function onAlways(data) {
                    switch (data && data.result && data.result.resultCode) {
                        case 'CMN000000':
                            deferred.resolve(data.floors);
                            break;
                        default :
                            deferred.reject();
                    }
                }
            }
            function parseHomePageFloorDetail(floorDetails) {
                var verticalBlocks = [], // 垂直布局
                    horizonBlocks = []; // 水平布局
                _.each(floorDetails || [], function(floorDetail) {
                    floorDetail.isVertical
                        ? verticalBlocks.push(floorDetail)
                        : horizonBlocks.push(floorDetail);
                });
                return verticalBlocks.length ||horizonBlocks.length ? {
                    verticalBlocks: verticalBlocks,
                    horizonBlocks: horizonBlocks
                } : null;
            }
            function parseHomePageConfig(floors) {
                var parsedFloors = [];
                _.each(floors || [], function(item){
                    var parsedItem = parseHomePageFloorDetail(item.floorDetails);
                    if(parsedItem) {
                        item.floorDetails = void 0;
                        parsedFloors.push(_.extend(item, parsedItem));
                    }
                });
                return parsedFloors.length ? parsedFloors : null;
            }
            // 保底配置
            var defaultConfig = {"1": [], "2": []};
            try {
                // 已激活
                defaultConfig["1"] = JSON.parse(_qConfig.homePageConfig_actived);
                // 未申卡
                defaultConfig["2"] = JSON.parse(_qConfig.homePageConfig_unapply);
            } catch(e) {}

            return function(type) {
                var deferred = Deferred(),
                    homeConfigStore, storedData;
                // 判断是否使用offline首页配置
                if(!/true/i.test(_qConfig.hasHomePageConfig)) {
                    deferred.resolve(defaultConfig[type]);
                } else {
                	homeConfigStore = CardStore.HomeConfig.getInstance();
                	storedData = homeConfigStore.get();
                	if(storedData && storedData[type]) {
                		deferred.resolve(storedData[type]); // 先从缓存里取
                	} else {
                		// 缓存里没有则调用接口获取
	                    getHomePageConfigRemote(type).then(function(floors){
	                        var parsed = parseHomePageConfig(floors);
	                        if(parsed) {
	                            homeConfigStore.setAttr(type + ''/*必须是字符串*/, parsed);
	                            deferred.resolve(parsed);
	                        } else {
	                            deferred.reject();
	                        }
	                    }, deferred.reject);
                	}                    
                }
                return deferred.promise();
            }
        })();

        function getBCP() {
            var bcp = {
                bid: CardUtil.getUrlParam('bid'),
                cid: CardUtil.getUrlParam('cid'),
                pid: CardUtil.getUrlParam('pid')
            };
            return bcp.bid || bcp.cid || bcp.pid ? bcp : null;
        }

		var homePageConfigState = {
            actived: 1, // 已激活
            notApply: 2 // 未申卡
        };
		var view = {
			template: indexViewTpl,
			data: function() {
				return {
					viewType: 0,
					floors: []
				}
			},
			components: {
				'unapply-content': { template: unapplyTpl},
				'applied-content': { template: appliedTpl },
				'actived-content': { template: activedTpl},
				'page-content': pageViewComponent
			},
			created: function() {
				this.renderView();
			},
			mounted: function() {
				this.initAdSlider();
				this.bindDOMEvent();
			},
			methods: {
				initAdSlider: function () {
					//var self = this;
				},
				getHomePageConfig: function(type) {
					var self = this;
					getHomePageConfig(type).then(function(floors){
						self.floors = floors;
					});
					
				},
				renderView: function() {
					var self = this;
					getModel('isCardHolder').execute(onAlways, onAlways);
					function onAlways(data) {
						self.orderId = data && data.orderId; // 保存orderId
	                    self.orderType = data && data.orderType; // 保存orderType
	                    self.status = data && data.status;
	                    switch (self.status) {
	                        case 'USER000001': // 未申卡
	                        case 'USER000002': // 申卡中，未提交
	                        	self.viewType = 1;
	                        	self.getHomePageConfig(homePageConfigState.notApply);
	                            // 记录百度统计-未申卡
	                            //self._sendBaiduUbt('unapply');
	                            //deferred.resolve(holderStatusMap.unlogin);
	                            break;
	                        case 'USER000003': // 审核中
	                        case 'USER000004': // 申卡通过
	                        case 'USER000005': // 审核未通过
	                        case 'USER000007': // 已取消，但未超X天
	                        case 'USER000009': // 已三亲
	                        case 'USER000010': // 三亲预约成功
	                        	self.viewType = 2;
	                            // 记录百度统计-已申卡
	                            //self._sendBaiduUbt('applied');
	                            //deferred.resolve(holderStatusMap.applied);
	                            break;
	                        case 'USER000006': // 已激活
	                        	self.viewType = 3;
	                        	self.getHomePageConfig(homePageConfigState.actived);
	                            // 记录百度统计-已激活
	                            //self._sendBaiduUbt('actived');
	                            //deferred.resolve(holderStatusMap.actived);
	                            break;
	                        default :
	                            //deferred.reject();
	                            //self.showWarning404();
	                            return;
	                    }
					}
				},
				bindDOMEvent: function() {
					$('#app').on('click', '.js_jump', function(e) {
						var url = $(e.currentTarget).data('target');
	                    if(!url) return;
	                    //
	                    //CardUtil.sendBaiduTrackEvent(this.getBaiduSiteId(), 'ad_' + this.viewName, 'click', targetUrl);
	                    // 如果参数里没有bcp参数，添加当前页面的bcp
	                    var param = /((bid)|(cid)|(pid)=)/i.test(url) ? null : getBCP();
	                    //this.jump(targetUrl, param);
	                    var isSameBiz = /\/webapp\/cc/i.test(url);
	                    if(!param) {
	                        param = {};
	                    }
	                    if(!param.from && !isSameBiz) {
	                        param.from = window.location.href;
	                    }
	                    url = [url, url.indexOf('?') === -1 ? '?': '&', CardUtil.toQueryString(param)].join('');
	                    window.location.href = url
	                    // 同频道使用goTo，否则app中路由有问题
	                    //isSameBiz ? Lizard.goTo(url) : Lizard.jump(url, { targetModel : 2 });
					});
				}
			}
		}

		return view;
})