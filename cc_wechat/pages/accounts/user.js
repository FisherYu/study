import { cwx } from '../../cwx/cwx.js';
var loginCommon = require( "common.js" );

var User = {
	auth: "", //登陆后得到的Ticket
	//uid: '', //当前登陆的用户ID, 未登陆状态下是空
	//ubt 数据
	duid: "",
	logintype:"noauthenticate", //
	//判断是否登录-local
	isLogin: function() {
		//同步判断
		if( this.auth == "" ) {
			return false;
		}
		else {
			return true;
		}
	},
	//判断是否登录-service
	checkLoginStatusFromServer: function( callback, param ) {
		var checkloginurl = "10209/CheckLoginStatusByTicket.json";
		if( this.auth == "" ) {
			callback( false );
		} else {
			var data = {
				Ticket: cwx.user.auth,
				IsMobile: true
			};
			var _success = function( res ) {
				if( res.data && res.data.ReturnCode == 0 ) {
					callback( true );
				} else {
					_fail();
				}
			};
			var _fail = function( res ) {
				cwx.user.auth = "";
				cwx.user.duid = "";
				callback( false );
			};

			try {
				cwx.request( loginCommon.getRequestObject( checkloginurl, data, _success, _fail ) );
			} catch( e ) {
				_fail();
			}
		}
	},
	checkAuth: function() {
		this.checkLoginStatusFromServer( function() { console.log( "checkAuth:true" ); });
	},

	//跳转登录页面
	login: function( data ) {
		var currentPage = cwx.getCurrentPage();

		currentPage.navigateTo( {
			url: '/pages/accounts/login',
			data: data.param,
			callback: data.callback.bind( currentPage )
		});

	},
	//退出
	logout: function( callback ) {
		var checkloginurl = "10209/LogoutByTicket.json";
		var data = {
			Ticket: cwx.user.auth,
			IsMobile: true
		};
		var _success = function( res ) {
			cwx.user.auth = "";
			cwx.user.duid = "";
			callback( true );
		};
		var _fail = function( res ) {
			cwx.user.auth = "";
			cwx.user.duid = "";
			callback( true );
		};

		try {
			cwx.request( loginCommon.getRequestObject( checkloginurl, data, _success, _fail ) );
		} catch( e ) {
			cwx.user.auth = "";
			cwx.user.duid = "";
			callback( true );
		}
	},
	//清除本地地auth
	clearAuth: function() {
		cwx.user.auth = "";
		cwx.user.duid = "";
	}

};

Object.defineProperty( User, "auth", {
	get: function() {
		return wx.getStorageSync( 'auth' );
	},
	set: function( val ) {
		try {
			wx.setStorageSync( 'auth', val )
		} catch( e ) {
			console.log( e );
		}
	}
});
Object.defineProperty( User, "duid", {
	get: function() {
		return wx.getStorageSync( 'duid' );
	},
	set: function( val ) {
		try {
			wx.setStorageSync( 'duid', val )
		} catch( e ) {
			console.log( e );
		}
	}
});

module.exports = User;