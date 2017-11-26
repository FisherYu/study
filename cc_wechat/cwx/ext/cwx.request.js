var __global = require('./global.js'); 
var cwx = __global.cwx;

var requestd = {};
var _requestID = 1;
var __kMaxRequestCount = 4;
var _requestQueue = [];//等待的queue
var _runQueue = [];//正在请求的request

function _generateRequestID() {
    return _requestID++;
}

function _formatRequestURL( url ) {
    if( url.indexOf( "/" ) != 0 || url.indexOf( "http" ) == 0 ) { //联调完去掉这个判断
        console.log( "警告：请使用相对路径 ", url );
        return url;
    }
    var host = __global.host
    if(__global.env.toLowerCase() === 'uat'){
        host = __global.uat;
    } else if (__global.env.toLowerCase() === 'fat'){
        host = __global.fat
    }
    return "https://" + host + url;
}

function __createHeader( header ) {
    var _header = header || {};
    try {
        var _mktCookie = cwx.mkt.getUnionForCookie();
        if( _mktCookie ) {
            _header.Cookie = _mktCookie + ";" + ( _header.Cookie || "" );
        }
    } catch( e ) {
        // console.log( "__createHeader error = ", e );
    }
    return _header;

}

//取消队列中的请求
//2016.10.24 只能移除等待队列中的请求
function cancel( requestID ) {
    if( requestID > 0 ) {
        //等待中移除
        for( var i = 0;i < _requestQueue.length;i++ ) {
            var obj = _requestQueue[ i ];
            if( obj.requestID == requestID ) {
                _requestQueue.splice( i, 1 );
                return 1;
            }
        }
    }

    return 0;
}

//发送网络请求, 异步返回结果，函数返回值为本次请求生成的requestID， 该requestID在cancel时候可以使用
function request( object ) {
    var header = __createHeader( object.header );
    object.header = header;
    // console.log( "request header = ", object.header );
    if( !object.data ) {
        object.data = {};
    }
    var data = object.data;

    var auth = ""
    if( cwx.user && cwx.user.auth ) {
        auth = cwx.user.auth
    }
    object.url = _formatRequestURL( object.url );
    // console.log( "cwx.request.url==" + object.url );
    object.method = object.method || 'POST';
    object.requestID = _generateRequestID();


    var oComplete = object.complete || function() { };
    var nComplete = function( res ) {
        //移除请求
        for( var i = 0;i < _runQueue.length;i++ ) {
            var obj = _runQueue[ i ];
            if( obj.requestID == nComplete.requestID ) {
                _runQueue.splice( i, 1 );
                break;
            }
        }

        var page = cwx.getCurrentPage();

        if( page && page.ubtMetric ) {
            var ubt_metric = {
                name: 100371,
                value: +new Date() - nComplete.startTime
            };
            if( res && res.statusCode && res.statusCode * 1 < 400 ) {
                ubt_metric.tag = {
                    status: 'success',
                    url: object.url,
                    statusCode: '' + ( res && res.statusCode || 'na' )
                }
            } else {
                ubt_metric.tag = {
                    status: 'fail',
                    url: object.url,
                    statusCode: '' + ( res && res.statusCode || 'na' )
                }
            }
            page.ubtMetric( ubt_metric );
        }


        if( oComplete ) {
            oComplete( res );
        }
        setTimeout( function() {
            //等待队列吐出请求
            // console.log( "before ", _runQueue.length, " wait = ", _requestQueue.length );
            if( _requestQueue.length > 0 ) {
                var nextRequestObject = _requestQueue.splice( 0, 1 )[ 0 ];
                _runQueue.push( nextRequestObject );
                wx.request( nextRequestObject );
            }
            // console.log( "after ", _runQueue.length, " wait = ", _requestQueue.length );
        }, 0 );

    }

    nComplete.startTime = +new Date();
    nComplete.requestID = object.requestID;
    object.complete = nComplete;
    //默认的head
    var _head = {
        cid: cwx.clientID,
        ctok: '',
        cver: '',
        lang: '01',
        sid: '',
        syscode: ( cwx.systemCode || "" ).toString(),
        auth: auth,
        sauth: '',
    };
    if( data && data.head ) {
        Object.keys( data.head ).forEach( function( pro ) {
            _head[ pro ] = data.head[ pro ];
        })
    }
    data.head = _head;

    //tczhu 添加一个正在请求的队列
    if( _runQueue.length >= __kMaxRequestCount ) {
        // console.log("加入等待队列 ",object);
        _requestQueue.push( object );
    } else {
        _runQueue.push( object );
        wx.request( object );
    }

    return object.requestID;
}


requestd.request = request;
requestd.cancel = cancel;

module.exports = requestd;