'use strict'

var Config = require('./config')
var FB = require('./connectors/facebook')
var wit = require('./services/wit').getWit()

// LETS SAVE USER SESSIONS
var sessions = {}

var findOrCreateSession = function (fbid, passengerData) {
  var sessionId
  // console.log('sessions: ', sessions)
  // DOES USER SESSION ALREADY EXIST?
  Object.keys(sessions).forEach(k => {
    if (sessions[k].fbid === fbid) {
      // YUP
      sessionId = k
      console.log('user exists:', fbid)
    }
  })

  // No session so we will create one, or submit a new qrcode
  if (!sessionId || passengerData) {
    sessionId = new Date().toISOString()
    sessions[sessionId] = {
      fbid: fbid,
      flightId: (passengerData.flightNum + passengerData.flightDate),
      context: {
        _fbid_: fbid,
        passengerData
      }
    }
    console.log('user does not exists, created session for ', fbid)
  }

  return sessionId
}

var read = function (sender, message, passengerData, announceMsg) {

  if(sender === Config.FB_PAGE_ID)
    return

  if(announceMsg) {
    // Send message to all users with same flight id
    Object.keys(sessions).forEach(k => {
      const sessionObj = sessions[k];
      if (sessionObj.flightId === announceMsg.flightId) {
        FB.newMessage(sessionObj.fbid, announceMsg.msg)
      }
    })

  } else if (message === 'hello') {

    const reply = 'Hello yourself! I am a chat bot. You can say "show me pics of corgis"'
    FB.newMessage(sender, reply)
    .then(() => null).catch(err => console.error( 'Error messaging', sender, ':', err.stack || err ))

  } else {

  	// Let's find or create a session for the user
    var sessionId = findOrCreateSession(sender, passengerData)

  		// Wit.ai bot engine reads - then runs all actions incl send (as in wit.ai story) until no more
      // See ./services/wit.js, params in runActions below are available in methods

  		wit.runActions(
  			sessionId,                   // :sessionId:, the user's current session by id
  			message,                     // :text:, the user's message
  			sessions[sessionId].context  // :context:, the user's session state
  		)
      // End story for now - don't update context with callbacks
      // .then(context => {
  				// Wit.ai ran all the actions in cycle, now it needs more messages
  				// console.log('Waiting for further messages')

  				// Based on the session state, you might want to reset the session
    				// Example:
    				// if (context['done']) {
    				// 	delete sessions[sessionId]
    				// }

  				// Updating the user's current session state
  				// sessions[sessionId].context = context

      // }).catch((err) => {
      //   console.error('Oops! Got an error from Wit: ', err.stack || err);
      // })
  }
}



module.exports = {
	findOrCreateSession: findOrCreateSession,
	read: read,
}
