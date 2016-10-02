'use strict';

const WIT_TOKEN = process.env.WIT_TOKEN
if (!WIT_TOKEN) {
  throw new Error('Missing WIT_TOKEN. Go to https://wit.ai/docs/quickstart to get one.')
}


var FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN || 'EAAId9aYT1GMBADZCREaOUvTIcvLt83c9rlbk4yzYBgHZA4yjtMpZAR1Cp6G0MoCM1rZA8Yo9Fl9jZCpmaoRwvHpjjRSDYhy9ZCj4wNwQ86cBAZC0EfDZC3LZAMFKqGCZAsKCrDF5l9VavPmtbFtVhULIkSSwUtcFMv6wnjF4RlhUjRcwZDZD';
if (!FB_PAGE_TOKEN) {
	throw new Error('Missing FB_PAGE_TOKEN. Go to https://developers.facebook.com/docs/pages/access-tokens to get one.')
}

var FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || 'my_voice_is_my_password_verify_me'

module.exports = {
  WIT_TOKEN: WIT_TOKEN,
  FB_PAGE_TOKEN: FB_PAGE_TOKEN,
  FB_VERIFY_TOKEN: FB_VERIFY_TOKEN,
}