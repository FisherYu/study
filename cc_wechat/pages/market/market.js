import { cwx, _ } from '../../cwx/cwx.js';

var unionConfig = require('./unionConfig.js');

var __unionCfg = unionConfig[cwx.appId] || unionConfig['wx0e6ed4f51db9d078'];
var __storageKey = "mkt_union";

var Market = {};

/**
* 数据写入localstorage
* 业绩参数优先级：传入业绩参数 -> 原locastorage中存储的业绩参数 -> 初始化空值
* @param {obejct} pOptions 业绩参数，包括allianceid,sid,ouid,sourceid,openid,fromopenid,unionid
* @param {string} pReferralCode 推荐码
* @param {boolean} isResetAidSid 是否重置aid sid
* @param {boolean} isResetSourceid 是否重置sourceid
* @param {boolean} isResetReferralCode 是否重置推荐码
*/
var _setLocalstorage = function(pOptions, pReferralCode, isResetAidSid, isResetSourceid, isResetFromUnion, isResetReferralCode) {
    var storedData = wx.getStorageSync(__storageKey),
        aidSidExpires = new Date().getTime() + 7 * 24 * 3600 * 1000,
        sourceidExpires = new Date().getTime() + 7 * 24 * 3600 * 1000,
        fromUnionExpires = new Date().getTime() + 7 * 24 * 3600 * 1000,
        referralCodeExpires = new Date().getTime() + 2 * 3600 * 1000,
        parsedData = null,
        parsedExmktid = null,
        mktshareObj = null,
        lwOptions = {},
        allianceid = 0,
        sid = 0,
        ouid = "",
        sourceid = 0,
        referralCode = "",
        openid = "",
        unionid = "",
        fromopenid = "",
        fromallianceid = 0,
        fromsid = 0,
        fromouid = "",
        fromsourceid = 0,
        updateSourceid = false,
        updateAidSid = false,
        updateFromUnion = false,
        updateReferralCode = false;

    //获取localstorage中存储的数据
    if (storedData) {
        parsedData = JSON.parse(storedData);
    }

    if (parsedData && parsedData.exmktid) {
        parsedExmktid = JSON.parse(parsedData.exmktid);
    }

    //统一key为小写，避免url参数大小写不一致，无法取出业绩参数的情况
    if (pOptions && Object.prototype.toString.call(pOptions) == "[object Object]") {
        _.each(pOptions, function (value, key) {
            lwOptions[key.toLowerCase()] = value;
        });
    }

    //获取分享的加密串
    if (lwOptions && lwOptions.mktshare) {
        try {
            mktshareObj = JSON.parse(cwx.util.mktBase64Decode(lwOptions.mktshare.replace(/\(\)/g, "=")));
        } catch (e) {
            console.log('【Market】Paser mktshare error ==> ', e);
        }
    }

    //aid sid未过期
    if (!isResetAidSid) {
        //allianceid、sid、ouid成对出现，前两者都不为空，才可写入
        if (lwOptions && parseInt(lwOptions.allianceid) && parseInt(lwOptions.sid)) {
            allianceid = parseInt(lwOptions.allianceid);
            sid = parseInt(lwOptions.sid);
            ouid = lwOptions.ouid || ouid;
            updateAidSid = true;
        } else if (mktshareObj && parseInt(mktshareObj.allianceid) && parseInt(mktshareObj.sid)) {
            allianceid = parseInt(mktshareObj.allianceid);
            sid = parseInt(mktshareObj.sid);
            ouid = mktshareObj.ouid || ouid;
            updateAidSid = true;
        } else if (parsedData && parseInt(parsedData.allianceid) && parseInt(parsedData.sid)) {
            allianceid = parseInt(parsedData.allianceid);
            sid = parseInt(parsedData.sid);
            ouid = parsedData.ouid || ouid;
        }
    }

    //sourceid未过期
    if (!isResetSourceid) {
        //sourceid可以单独写入
        if (lwOptions && parseInt(lwOptions.sourceid)) {
            sourceid = parseInt(lwOptions.sourceid);
            updateSourceid = true;
        } else if (mktshareObj && parseInt(mktshareObj.sourceid)) {
            sourceid = parseInt(mktshareObj.sourceid);
            updateSourceid = true;
        } else if (parsedData && parseInt(parsedData.sourceid)) {
            sourceid = parseInt(parsedData.sourceid);
        }
    }

    //源头分享者业绩参数未过期
    if (!isResetFromUnion) {
        //获取分享mktshare传入的fromopenid
        if (mktshareObj && mktshareObj.fromopenid) {
            fromopenid = mktshareObj.fromopenid;
            updateFromUnion = true;
        } else if (parsedExmktid && parsedExmktid.fromopenid) {
            fromopenid = parsedExmktid.fromopenid;
        }

        //获取url或分享mktshare传入的fromallianceid、fromsid、fromouid、fromsourceid
        //allianceid、sid、ouid成对出现，前两者都不为空，才可写入
        if (lwOptions && parseInt(lwOptions.fromallianceid) && parseInt(lwOptions.fromsid)) {
            fromallianceid = parseInt(lwOptions.fromallianceid);
            fromsid = parseInt(lwOptions.fromsid);
            fromouid = lwOptions.fromouid || fromouid;
            updateFromUnion = true;
        } else if (mktshareObj && parseInt(mktshareObj.fromallianceid) && parseInt(mktshareObj.fromsid)) {
            fromallianceid = parseInt(mktshareObj.fromallianceid);
            fromsid = parseInt(mktshareObj.fromsid);
            fromouid = mktshareObj.fromouid || fromouid;
            updateFromUnion = true;
        } else if (parsedExmktid && parseInt(parsedExmktid.fromallianceid) && parseInt(parsedExmktid.fromsid)) {
            fromallianceid = parseInt(parsedExmktid.fromallianceid);
            fromsid = parseInt(parsedExmktid.fromsid);
            fromouid = parsedExmktid.fromouid || fromouid;
        }

        //sourceid可以单独写入
        if (lwOptions && parseInt(lwOptions.fromsourceid)) {
            fromsourceid = parseInt(lwOptions.fromsourceid);
            updateFromUnion = true;
        } else if (mktshareObj && parseInt(mktshareObj.fromsourceid)) {
            fromsourceid = parseInt(mktshareObj.fromsourceid);
            updateFromUnion = true;
        } else if (parsedExmktid && parseInt(parsedExmktid.fromsourceid)) {
            fromsourceid = parseInt(parsedExmktid.fromsourceid);
        }
    }

    //推荐码未过期
    if (!isResetReferralCode) {
        if (pReferralCode) {
            referralCode = pReferralCode;
            updateReferralCode = true;
        } else if (parsedExmktid && parsedExmktid.ReferralCode) {
            referralCode = parsedExmktid.ReferralCode;
        }
    }

    //获取基础传入的openid、unionid
    if (lwOptions && lwOptions.openid) {
        openid = lwOptions.openid;
    } else if (parsedExmktid && parsedExmktid.openid) {
        openid = parsedExmktid.openid;
    }
    if (lwOptions && lwOptions.unionid) {
        unionid = lwOptions.unionid;
    } else if (parsedExmktid && parsedExmktid.unionid) {
        unionid = parsedExmktid.unionid;
    }

    //设置过期时间
    if (!updateAidSid && parsedExmktid && parsedExmktid.aidSidExpires) {
        aidSidExpires = parsedExmktid.aidSidExpires;
    }
    if (!updateSourceid && parsedExmktid && parsedExmktid.sourceidExpires) {
        sourceidExpires = parsedExmktid.sourceidExpires;
    }
    if (!updateFromUnion && parsedExmktid && parsedExmktid.fromUnionExpires) {
        fromUnionExpires = parsedExmktid.fromUnionExpires;
    }
    if (!updateReferralCode && parsedExmktid && parsedExmktid.referralCodeExpires) {
        referralCodeExpires = parsedExmktid.referralCodeExpires;
    }

    //写入localstorage，并更新过期时间
    try {
        wx.setStorageSync(__storageKey, JSON.stringify({
            "allianceid": allianceid,
            "sid": sid,
            "ouid": ouid,
            "sourceid": sourceid,
            "exmktid": JSON.stringify({
                "ReferralCode": referralCode,
                "openid": openid,
                "fromopenid": fromopenid,
                "unionid": unionid,
                "fromallianceid": fromallianceid,
                "fromsid": fromsid,
                "fromouid": fromouid,
                "fromsourceid": fromsourceid,
                "aidSidExpires": aidSidExpires,
                "sourceidExpires": sourceidExpires,
                "fromUnionExpires": fromUnionExpires,
                "referralCodeExpires": referralCodeExpires
            })
        }));
    } catch(e) {
        console.log('【Market】Store market union error ==> ', e);
    }
};

/**
* 获取localstorage数据
*/
var _getLocalstorage = function () {
    var lsData = null,
        rData = null,
        rAllianceid = 0,
        rSid = 0,
        rOuid = "",
        rSourceid = 0,
        rExmktidStr = "",
        rExmktidObj = {};

    //如果localstorage为空，则初始化
    !wx.getStorageSync(__storageKey) && _setLocalstorage();

    //获取并解析localstorage数据
    lsData = JSON.parse(wx.getStorageSync(__storageKey));

    //获取并解析exmktid扩展字段
    if (lsData) {
        rExmktidStr = lsData.exmktid;
    }
    if (rExmktidStr) {
        rExmktidObj = JSON.parse(lsData.exmktid);
    }

    //检查数据有效期，若过期则置空
    if (new Date().getTime() >= rExmktidObj.aidSidExpires) {
        //设置aid sid为初始值
        _setLocalstorage(null, null, true);
        //重新获取并解析localstorage数据
        lsData = JSON.parse(wx.getStorageSync(__storageKey));
    }
    if (new Date().getTime() >= rExmktidObj.sourceidExpires) {
        //设置sourceid为初始值
        _setLocalstorage(null, null, false, true);
        //重新获取并解析localstorage数据
        lsData = JSON.parse(wx.getStorageSync(__storageKey));
    }
    if (new Date().getTime() >= rExmktidObj.fromUnionExpires) {
        //设置源头分享者业绩参数为初始值
        _setLocalstorage(null, null, false, false, true);
        //重新获取并解析localstorage数据
        lsData = JSON.parse(wx.getStorageSync(__storageKey));
    }
    if (new Date().getTime() >= rExmktidObj.referralCodeExpires) {
        //设置推荐码为为初始值
        _setLocalstorage(null, null, false, false, false, true);
        //重新获取并解析localstorage数据
        lsData = JSON.parse(wx.getStorageSync(__storageKey));
    }

    //检查数据有效性，为空则返回默认值
    if (parseInt(lsData.allianceid) && parseInt(lsData.sid)) {
        rAllianceid = parseInt(lsData.allianceid);
        rSid = parseInt(lsData.sid);
        rOuid = lsData.ouid;
    } else {
        rAllianceid = __unionCfg.aid;
        rSid = __unionCfg.sid;
        rOuid = __unionCfg.ouid;
    }

    if (parseInt(lsData.sourceid)) {
        rSourceid = parseInt(lsData.sourceid);
    } else {
        rSourceid = __unionCfg.sourceid;
    }

    //生成返回值
    rData = {
        "allianceid": rAllianceid,
        "sid": rSid,
        "ouid": rOuid,
        "sourceid": rSourceid,
        "exmktid": rExmktidStr
    }

    return rData;
};

/**
* 将业绩参数写入localstorage
* @param {object} options 业绩参数，包括allianceid,sid,ouid,sourceid
*/
Market.setUnion = function(options) {
    _setLocalstorage(options);
};

/**
* 获取业绩参数和推荐码,e.g. {"allianceid": "262684", "sid": "711465", "ouid": "', "sourceid": "55552689", "exmktid":"{\"... ...\"}"}
* @param {function} callback 回调方法
*/
Market.getUnion = function(callback) {
    var lsData = null,
        unionData = null;

    //获取localstorage数据
    lsData = _getLocalstorage();

    //生成推荐码和业绩参数
    unionData = {
        "allianceid": lsData.allianceid,
        "sid": lsData.sid,
        "ouid": lsData.ouid,
        "sourceid": lsData.sourceid,
        "exmktid": lsData.exmktid
    }

    //执行回调方法，传入推荐码和业绩参数
    _.isFunction(callback) && callback(unionData);
};

/**
* 获取完整的cookie字符串,e.g. Union=OUID=v1c0a5s6_BTEAZAM2UWNQZlZmVTtdZVdiAW4DcQ==&AllianceID=108336&SID=552138&SourceID=2189
*/
Market.getUnionForCookie = function () {
    var lsData = null,
        unionCookie = null;

    //获取localstorage数据
    lsData = _getLocalstorage();

    //生成cookie字符串
    unionCookie = "Union=OUID=" + lsData.ouid + "&AllianceID=" + lsData.allianceid + "&SID=" + lsData.sid + "&SourceID=" + lsData.sourceid;

    //返回推荐码和业绩参数
    return unionCookie;
};

/**
* 将推荐码写入localstorage；推送UBT，包括推荐码、DUID、注册or登录
* @param {object} context 上下文
* @param {object} params，包括：referralCode-地推码，isRegister-注册或登录
*/
Market.setReferralCode = function(context, params) {
    var ubtTraceData = "";

    if (!context || !context.ubtTrace || !_.isFunction(context.ubtTrace)) {
        console.log('【Market】Call cwx.mkt.setReferralCode() method ==> Cannot send ubt');
        return;
    }
    if (!params) {
        console.log('【Market】Call cwx.mkt.setReferralCode() method ==> Parameters null');
        return;
    }

    //写入localstorage
    _setLocalstorage(null, params.referralCode);

    //生成UBT trace推送数据
    ubtTraceData = JSON.stringify({
        "DUID": cwx.user.duid || "",
        "referralCode": params.referralCode || "",
        "isRegister": params.isRegister || false
    });

    //写入UBT
    context.ubtTrace(__unionCfg.rcKey, ubtTraceData);
};

/**
* 推送UBT，包括订单号、业绩参数、推荐码
* @param {object} context 上下文
* @param {string} orderID 订单号
*/
Market.sendUnionTrace = function(context, orderID) {
    var lsData = null,
        ubtTraceData = "";

    if (!context || !context.ubtTrace || !_.isFunction(context.ubtTrace)) {
        console.log('【Market】Call cwx.mkt.sendUnionTrace() method ==> Cannot send ubt');
        return;
    }
    if (!orderID) {
        console.log('【Market】Call cwx.mkt.sendUnionTrace() method ==> OrderID null');
        return;
    }

    //获取localstorage数据
    lsData = _getLocalstorage();

    //生成UBT trace推送数据，e.g.{"orderid":"1782435628","allianceid": "262684", "sid": "711465", "ouid": "", "sourceid": "55552689", "exmktid":"{\"... ...\"}"}
    ubtTraceData = JSON.stringify({
        "appid": cwx.appId,
        "orderid": orderID.toString(),
        "allianceid": lsData.allianceid,
        "sid": lsData.sid,
        "ouid": lsData.ouid,
        "sourceid": lsData.sourceid,
        "exmktid": lsData.exmktid
    });

    //写入UBT
    context.ubtTrace(__unionCfg.ouKey, ubtTraceData);
};

/**
* 获取需要分享出去的参数，并加密返回
*/
Market.getShareUnion = function() {
    var lsData = null,
        parsedExmktid = null,
        shareObj = {},
        shareStr = "";

    //获取localstorage数据
    lsData = _getLocalstorage();

    //生成推荐码和业绩参数
    if (lsData) {
        shareObj = {
            "allianceid": lsData.allianceid,
            "sid": lsData.sid,
            "ouid": lsData.ouid,
            "sourceid": lsData.sourceid,
        };

        if (lsData.exmktid) {
            parsedExmktid = JSON.parse(lsData.exmktid);
        }
    }

    if (parsedExmktid) {
        shareObj = _.extend(shareObj, {
            "fromallianceid": parsedExmktid.fromallianceid,
            "fromsid": parsedExmktid.fromsid,
            "fromouid": parsedExmktid.fromouid,
            "fromsourceid": parsedExmktid.fromsourceid,
            "fromopenid": parsedExmktid.openid,
        });
    }

    //加密分享数据
    shareStr = "mktshare=" + cwx.util.mktBase64Encode(JSON.stringify(shareObj)).replace(/=/g,'()');

    //返回分享数据
    return shareStr;
};

module.exports = Market;