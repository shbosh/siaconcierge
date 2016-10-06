'use strict'

var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')


var Config = require('./config')
var FB = require('./connectors/facebook')
var QR = require('./connectors/QR')
var Bot = require('./bot')

// LETS MAKE A SERVER!
var app = express()
app.set('port', (process.env.PORT) || 5000)
// SPIN UP SERVER
app.listen(app.get('port'), function () {
  console.log('Running on port', app.get('port'))
})
// PARSE THE BODY
app.use(bodyParser.json())


// index page
app.get('/', function (req, res) {
  res.send('hello world i am a chat bot')
})

// for facebook to verify
app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === Config.FB_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})

// to send messages to facebook
app.post('/webhook', function (req, res) {

  var entry = FB.getMessageEntry(req.body)
  // IS THE ENTRY A VALID MESSAGE?
  if (entry && entry.message) {
    if (entry.message.attachments) {
      // NOT SMART ENOUGH FOR ATTACHMENTS YET
      const imageUrl = entry.message.attachments[0].payload.url;

      QR.decode(imageUrl).then(psgr => {
        Bot.read(entry.sender.id, entry.message.text, psgr)

        const reply = `Hello ${psgr.fullName}, are you taking ${psgr.airline} (${psgr.airlineCode + ' ' + psgr.flightNum}, Booking Ref: ${psgr.bookingRef}) from ${psgr.from} to ${psgr.to}? `
        FB.newMessage(entry.sender.id, reply)
      })

    } else {
      // SEND TO BOT FOR PROCESSING, WIT.AI SENDS POST REQ, NOT SERVER
      // see ./bot.js
      Bot.read(entry.sender.id, entry.message.text)
    }
  }

  res.sendStatus(200)
})
app.use(bodyParser.urlencoded({extended : false}));
app.post('/api/announce', (req, res) => {
  console.log('announceMsg', req.body);
  // eg {flightId: 1, msg: 'Boarding now'}
  Bot.read(null, null, null, req.body);
  response.set('Content-Type', 'text/plain');
  response.send("Message received.");
  response.end();
})

var https = require("https");
setInterval(function() {
    https.get("https://afternoon-everglades-21984.herokuapp.com");
}, 1800000); // every 5 minutes (300000)
