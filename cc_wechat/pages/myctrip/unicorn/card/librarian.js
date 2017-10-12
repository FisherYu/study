
var flightCard = require('../tarots/flight.js');
var hotelCard = require('../tarots/hotel.js');
var trainCard = require('../tarots/train.js');
var qicheCard = require('../tarots/qiche.js');
var piaoCard = require('../tarots/piao.js');

module.exports = {
    Flight: flightCard,
    FlightInternational: flightCard,
    FlightDomestic: flightCard,
    Hotel: hotelCard,
    HotelDomestic: hotelCard,
    HotelMask: hotelCard,
    HotelInternational: hotelCard,
    Train: trainCard,
    QiChe: qicheCard,
    Piao: piaoCard
};