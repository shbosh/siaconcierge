'use strict'

var Config = require('../config')
var FB = require('../connectors/facebook')
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


var actions = {

  // Compulsory method - https://github.com/wit-ai/node-wit#wit-class
  // :param request: contains sessionId, context, message, entities properties
  // :param response: contains text, quickreplies properties
	send ({sessionId, context}, {text}) { // Destructure sessionId from request object, ie var sessionId = request.sessionId;

    // Our bot has a reply! Let's retrieve the Facebook user whose session belongs to
    const recipientId = context._fbid_;
    if (recipientId) {

      // We return a js promise to let our bot know when we're done sending

      if (checkURL(text)) {  // check if text contains image url

        return FB.newMessage(context._fbid_, text, true)
        .then(() => null)
        .catch(err => console.error( 'Error messaging', recipientId, ':', err.stack || err ));
      } else {
        return FB.newMessage(context._fbid_, text)
        .then(() => null)
        .catch(err => console.error( 'Error messaging', recipientId, ':', err.stack || err ));
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
		if (context.loc) {
			getWeather(context.loc)
				.then(function (forecast) {
					context.forecast = forecast || 'Maybe Sunny?'
				})
				.catch(function (err) {
					console.log(err)
				})
		}

		// context.forecast = 'Sunny'
    return Promise.resolve(context);

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
		var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22'+ location +'%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys'
		request(url, function (error, response, body) {
		    if (!error && response.statusCode == 200) {
		    	var jsonData = JSON.parse(body)
		    	var forecast = jsonData.query.results ? jsonData.query.results.channel.item.forecast[0].text : null;
		      console.log('WEATHER API SAYS....', forecast)
		      return forecast
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
