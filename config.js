'use strict';

const WIT_TOKEN       = process.env.WIT_TOKEN
if (!WIT_TOKEN) {
  throw new Error('Missing WIT_TOKEN. Go to https://wit.ai/docs/quickstart to get one.')
}


const FB_PAGE_TOKEN   = process.env.FB_PAGE_TOKEN;
if (!FB_PAGE_TOKEN) {
	throw new Error('Missing FB_PAGE_TOKEN. Go to https://developers.facebook.com/docs/pages/access-tokens to get one.')
}

const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
const FB_PAGE_ID      = process.env.FB_PAGE_ID || '313103322397034';

module.exports = {
  WIT_TOKEN,
  FB_PAGE_ID,
  FB_PAGE_TOKEN,
  FB_VERIFY_TOKEN,
}
