'use strict'

var Config = require('../config')
var FB = require('../connectors/facebook')
var Dashboard = require('../connectors/dashboard')
var request = require('request')
const {Wit, log} = require('node-wit') // Es6, 'const' is a var that cannot be reassigned, 'let' can be.

var firstEntityValue = function (entities, entity) {
	var val = entities && entities[entity] &&
		Array.isArray(entities[entity]) &&
		entities[entity].length > 0 &&
		entities[entity][0].value

	if (!val) {
		return null
	}
	return typeof val === 'object' ? val.value : val
}

var errorHandler = err => console.error( 'Error messaging', recipientId, ':', err.stack || err );
var actions = {

  // Compulsory method - https://github.com/wit-ai/node-wit#wit-class
  // :param request: contains sessionId, context, text, entities properties
  // :param response: contains text, quickreplies properties
	send ({sessionId, context, text}, {text: resText}) { // Destructure sessionId from request object, ie var sessionId = request.sessionId;
    console.log('WIT WANTS TO TALK TO:', context._fbid_)
    console.log('WIT HAS SOMETHING TO SAY:', resText)
    console.log('WIT HAS A CONTEXT:', context)

    // Our bot has a reply! Let's retrieve the Facebook user whose session belongs to
    const recipientId = context._fbid_;

    if (recipientId) {
      // We return a js promise to let our bot know when we're done sending

      if (checkURL(resText)) {  // check if resText contains image url

        return FB.newMessage(recipientId, resText, true)
        .then(() => null).catch(errorHandler)

      } else {
        const sentiment = Math.floor(Math.random()) == 1 ? 'positive' : 'negative';
        Dashboard.newMessage(recipientId, resText, sentiment);

        return FB.newMessage(recipientId, resText)
        .then(() => null).catch(errorHandler)
      }

    } else {
      console.error('Oops! Couldn\'t find user for session:', sessionId);
      // Giving the wheel back to our bot
      return Promise.resolve()
    }
  },

  // Merge action as found on wit.ai story, returns a js promise with new context
	merge({sessionId, context, message, entities}) {
    console.log(`Session ${sessionId} received`);
    console.log(`The current context is ${JSON.stringify(context)}`);
    console.log(`Wit extracted ${JSON.stringify(entities)}`);

		// Reset the weather story
		delete context.forecast

		// Retrive the location entity and store it in the context field
		var loc = firstEntityValue(entities, 'location')
		if (loc) {
			context.loc = loc
		}

		// Reset the cutepics story
		delete context.pics

		// Retrieve the category
		var category = firstEntityValue(entities, 'category')
		if (category) {
			context.cat = category
		}

		// Retrieve the sentiment
		var sentiment = firstEntityValue(entities, 'sentiment')
		if (sentiment) {
			context.ack = sentiment === 'positive' ? 'Glad your liked it!' : 'Aww, that sucks.'
		} else {
			delete context.ack
		}

    return Promise.resolve(context);
	},

	error({sessionId, context, error}) {
		console.log(error.message)
	},

	// list of functions Wit.ai can execute
	['fetch-weather']({sessionId, context}) {
		// Here we can place an API call to a weather service
    console.log('context ', context);
		if (context.loc) {
      return new Promise((resolve, reject) => {
  			getWeather(context.loc) // loc is the property given in the wit.ai story
        .then(function (forecast) {
          context.forecast = forecast || 'I\'m unsure of the weather'
          console.log('forecast ', forecast)
          resolve(context);
        })
        .catch(function (err) {
         // console.log(err)
         reject(err)
        })
      })
		}

	},

	['fetch-pics']({sessionId, context}) {
		var wantedPics = allPics[context.cat || 'default']
		context.pics = wantedPics[Math.floor(Math.random() * wantedPics.length)]
    return Promise.resolve(context);

	},
}

// SETUP THE WIT.AI SERVICE
var getWit = function () {
	console.log('GRABBING WIT')
	return new Wit({
		accessToken: Config.WIT_TOKEN,
		actions,
		logger: new log.Logger(log.DEBUG)
	})
}

module.exports = {
	getWit: getWit,
}

// BOT TESTING MODE
if (require.main === module) {
	console.log('Bot testing mode!')
	var client = getWit()
	client.interactive()
}

// GET WEATHER FROM API
var getWeather = function (location) {
	return new Promise(function (resolve, reject) {
		var url = 'http://api.openweathermap.org/data/2.5/weather?q=' + location + '&appid=' + Config.OPEN_WEATHER_API_KEY + '&units=metric'
		request(url, function (error, response, body) {
		    if (!error && response.statusCode == 200) {
		    	var jsonData = JSON.parse(body)
		    	var forecast = jsonData.weather ? (jsonData.weather[0].description + ', ' +jsonData.main.temp)  : null;
		      resolve(forecast);
		    }
			})
	})
}

// CHECK IF URL IS AN IMAGE FILE
var checkURL = function (url) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

// LIST OF ALL PICS
var allPics = {
  corgis: [
    'http://i.imgur.com/uYyICl0.jpeg',
    'http://i.imgur.com/useIJl6.jpeg',
    'http://i.imgur.com/LD242xr.jpeg',
    'http://i.imgur.com/Q7vn2vS.jpeg',
    'http://i.imgur.com/ZTmF9jm.jpeg',
    'http://i.imgur.com/jJlWH6x.jpeg',
		'http://i.imgur.com/ZYUakqg.jpeg',
		'http://i.imgur.com/RxoU9o9.jpeg',
  ],
  racoons: [
    'http://i.imgur.com/zCC3npm.jpeg',
    'http://i.imgur.com/OvxavBY.jpeg',
    'http://i.imgur.com/Z6oAGRu.jpeg',
		'http://i.imgur.com/uAlg8Hl.jpeg',
		'http://i.imgur.com/q0O0xYm.jpeg',
		'http://i.imgur.com/BrhxR5a.jpeg',
		'http://i.imgur.com/05hlAWU.jpeg',
		'http://i.imgur.com/HAeMnSq.jpeg',
  ],
  default: [
    'http://blog.uprinting.com/wp-content/uploads/2011/09/Cute-Baby-Pictures-29.jpg',
  ],
};
