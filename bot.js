'use strict'

var Config = require('./config')
var wit = require('./services/wit').getWit()

// LETS SAVE USER SESSIONS
var sessions = {}

var findOrCreateSession = function (fbid) {
  var sessionId
  console.log('sessions: ', sessions)
  // DOES USER SESSION ALREADY EXIST?
  Object.keys(sessions).forEach(k => {
    if (sessions[k].fbid === fbid) {
      // YUP
      sessionId = k
      console.log('user exists:', fbid)
    }
  })

  // No session so we will create one
  if (!sessionId) {
    sessionId = new Date().toISOString()
    sessions[sessionId] = {
      fbid: fbid,
      context: {
        _fbid_: fbid
      }
    }
    console.log('user does not exists, created session for ', fbid)
  }

  return sessionId
}

var read = function (sender, message) {

  if(sender === Config.FB_PAGE_ID)
    return

	// Let's find or create a session for the user
  var sessionId = findOrCreateSession(sender)

		// Wit.ai bot engine reads - then runs all actions incl send (as in wit.ai story) until no more
    // See ./services/wit.js, params in runActions below are available in methods

		wit.runActions(
			sessionId,                   // :sessionId:, the user's current session by id
			message,                     // :text:, the user's message
			sessions[sessionId].context  // :context:, the user's session state
		).then(context => {
				// Wit.ai ran all the actions in cycle, now it needs more messages
				console.log('Waiting for further messages')

				// Based on the session state, you might want to reset the session
  				// Example:
  				// if (context['done']) {
  				// 	delete sessions[sessionId]
  				// }

				// Updating the user's current session state
				sessions[sessionId].context = context

		}).catch((err) => {
      console.error('Oops! Got an error from Wit: ', err.stack || err);
    })

}



module.exports = {
	findOrCreateSession: findOrCreateSession,
	read: read,
}
