'use strict'

var request = require('request')
var Config = require('../config')
const fetch = require('node-fetch');

// SETUP A REQUEST TO DASHBOARD
var newMessage = function(recipientId, message, sentiment) {

  const body = JSON.stringify({
    recipientId,
    message, // es6 syntax, same as - message: message,
    sentiment,
  });

  const qs = 'access_token=' + encodeURIComponent(Config.FB_PAGE_TOKEN);
  return fetch('https://sia-dash.herokuapp.com/api/flights/' + qs, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body,
  })
  .then(rsp => rsp.json())
  .then(json => {
    if (json.error && json.error.message) {
      throw new Error(json.error.message);
    }
    return json;
  });
}

module.exports = {
	newMessage: newMessage,
}
