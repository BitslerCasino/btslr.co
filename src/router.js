const Router = require('koa-router');
const config = require('./config');
const router = new Router();
const { URL } = require('url');
const rand = require('./modules/random');
const db = require('./db');
const querystring = require('querystring');
const slugify = require('./modules/slugify');

function validateUrl(uri) {
  uri = new URL(uri);
  // only for single .tld domains
  let btsurl = uri.hostname.split('.').reverse();
  btsurl = btsurl.slice(0, 2).reverse().join('.');
  if (!config.ALLOWED.includes(btsurl)) {
    return false;
  }
  uri.pathname = querystring.unescape(uri.pathname).split('/').map(s => slugify(s)).join('/');
  return uri.toString();
}
router.get('/shorten', async (ctx) => {
  ctx.validateQuery('url').required().toString().trim();
  let s;
  try {
    const btsurl = validateUrl(ctx.vals.url);
    if (btsurl) {
      s = await db.getShortUrl(btsurl);
      if (!s) {
        s = await db.insertUrl(btsurl);
      }
      const newshorturl = new URL(`/${s.short_url}`, `https://${config.SITE_URL}/`);
      ctx.type = 'json';
      ctx.body = { success: true, url: newshorturl };
      return true;
    } else {
      ctx.jsonErr(404, 'Sorry, This service is only used for Bitsler.com domains');
    }
  } catch (err) {
    ctx.jsonErr(400, `Error: ${err.message}`);
  }
});
router.get('/stats', async (ctx) => {
  ctx.validateQuery('label').required('URL NOT FOUND').toString().trim();
  const label = ctx.vals.label;
  let stats;
  if (!['links', 'users'].includes(label)) {
    return ctx.jsonErr(400, 'URL NOT FOUND');
  }
  if (label == 'links') {
    stats = await db.getStatLinks();
    return ctx.body = { success: true, label, stats };
  } else if (label == 'users') {
    stats = await db.getStatUsers();
    return ctx.body = { success: true, label, stats };
  }
});
router.get('/:sid', async (ctx) => {
  ctx.validateParam('sid').required().toString().trim();
  try {
    if (rand.isValid(ctx.vals.sid)) {
      let url = await db.getRealUrl(ctx.vals.sid, ctx.headers['cf-connecting-ip'], ctx.headers['user-agent'], ctx.headers['cf-ipcountry']);
      if (!url) {
        return ctx.jsonErr(404, 'URL Not Found [Code] 1');
      }
      return ctx.redirect(url);
    } else {
      return ctx.jsonErr(404, 'URL Not Found [Code] 2');
    }
  } catch (err) {
    return ctx.jsonErr(404, `URL Not Found [Code] 3 ${err.stack}`);
  }
});
module.exports = router;