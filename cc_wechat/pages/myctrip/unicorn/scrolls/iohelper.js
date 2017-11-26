var necessaryParamIDArray = [1, 2, 3, 4, 5, 6];

var ioHelperScroll = [
    {
        scrollId: '606-01-004-0001-2', scrollType: 'baseConfig', bizType: 'baseConfig',
        buKeys: [
            // 序号1-6 必填
            {paramId: 1, paramValue: {BizType: 'BizType'}},
            {paramId: 2, paramValue: {OrderID: 'OrderID'}},
            {paramId: 3, paramValue: {OrderName: 'OrderName'}},
            {paramId: 4, paramValue: {BookingDate: 'BookingDate'}},
            {paramId: 5, paramValue: {Currency: 'Currency'}},
            {paramId: 6, paramValue: {OrderTotalPrice: 'OrderTotalPrice'}},

            {paramId: 16, paramValue: {startTime: ''}},
            {paramId: 12, paramValue: {endTime: ''}},

            // 酒店
            {paramId: 7, paramValue: {orderItem: 'HotelOrderItems'}},
            {paramId: 8, paramValue: {startTime: 'CheckInDate'}},
            {paramId: 9, paramValue: {endTime: 'CheckOutDate'}},

            // 门票
            {paramId: 10, paramValue: {orderItem: 'PiaoOrderItems'}},
            {paramId: 11, paramValue: {startTime: 'DepartureDate'}},

            // QiChe
            {paramId: 29, paramValue: {orderItem: 'QicheOrderItems'}}

        ]
    },
    {
        scrollId: '606-01-004-0003-6',
        scrollType: 'HotelDomestic',
        bizType: 'HotelDomestic',
        requireScrollId: '606-01-004-0001-2',
        buKeys: necessaryParamIDArray.concat([7, 8, 9])
    },
    {
        scrollId: '606-01-004-0004-3',
        scrollType: 'HotelMask',
        bizType: 'HotelMask',
        requireScrollId: '606-01-004-0001-2',
        buKeys: necessaryParamIDArray.concat([7, 8, 9])
    },
    {
        scrollId: '606-01-004-0005-0',
        scrollType: 'HotelInternational',
        bizType: 'HotelInternational',
        requireScrollId: '606-01-004-0001-2',
        buKeys: necessaryParamIDArray.concat([7, 8, 9])
    },
    {
        scrollId: '606-01-004-0006-7',
        scrollType: 'Piao',
        bizType: 'Piao',
        requireScrollId: '606-01-004-0001-2',
        buKeys: necessaryParamIDArray.concat([10, 11, 12])
    },
    {
        scrollId: '606-01-004-0017-3',
        scrollType: 'QiChe',
        bizType: 'QiChe',
        requireScrollId: '606-01-004-0001-2',
        buKeys: necessaryParamIDArray.concat([29])
    }
];

module.exports = {
    iohelperScroll: ioHelperScroll
};