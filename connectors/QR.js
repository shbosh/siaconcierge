'use strict'

const fetch = require('node-fetch');
const airports = require('airport-codes');
const airlines = require('./airlines.json');

// SETUP A REQUEST TO DASHBOARD
var decode = function(url) {

  return fetch("http://api.qrserver.com/v1/read-qr-code/?fileurl="+ encodeURIComponent(url))
  .then(rsp => rsp.json())
  .then(msg => {
    const qrcodeData = ((msg[0].symbol[0].data).match(/\S+/g) || []).slice(0,4);
    if(qrcodeData.length > 0){
      const name = qrcodeData[0].split('/');
      const fullName = name[1] + ' ' + name[0];
      const bookingRef = qrcodeData[1].substring(1);
      const from = airports.findWhere({iata: qrcodeData[2].substring(0,3)}).get('city');
      const to = airports.findWhere({iata: qrcodeData[2].substring(3,6)}).get('city');
      const airlineCode = qrcodeData[2].substring(6);
      const airline = airlines.find(airline=>airline.iata === airlineCode).name;
      const flightNum = qrcodeData[3];
      return {fullName, bookingRef, from, to, airline, airlineCode, flightNum};
    }

  })

}

module.exports = {
	decode
}
