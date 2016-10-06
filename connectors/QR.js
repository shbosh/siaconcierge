'use strict'

const fetch = require('node-fetch');

// SETUP A REQUEST TO DASHBOARD
var decode = function(url) {

  return fetch("http://api.qrserver.com/v1/read-qr-code/?fileurl="+ encodeURIComponent(url))
  .then(rsp => rsp.json())
  .then(msg => {
    console.log(msg)
    console.log('decoded qrcode: ', msg[0].symbol[0]);
  })

}

module.exports = {
	decode
}
