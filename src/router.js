const Router = require('koa-router');
const config = require('./config');
const router = new Router();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
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
  return uri;
}
async function req(url, data) {
  const opts = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'cache-control': 'no-cache'
    }
  };
  try {
    const resp = await fetch(url, opts);
    return await resp.json();
  } catch (e) {
    return false;
  }
}
router.get('/ip', async (ctx) => {
  return ctx.body = ctx.real_ip;
});
router.get('/shorten', async (ctx) => {
  ctx.validateQuery('url').required().toString().trim();
  let s;
  try {
    const btsurl = validateUrl(ctx.vals.url);
    let rid = '';
    if (btsurl) {
      if (btsurl.searchParams.has('rid')) {
        rid = btsurl.search;
        btsurl.search = '';
      }
      s = await db.getShortUrl(btsurl.toString());
      if (!s) {
        s = await db.insertUrl(btsurl.toString());
      }
      const newshorturl = `${config.SITE_URL}/${s.short_url}` + rid;
      ctx.type = 'json';
      ctx.body = { success: true, url: newshorturl };
      return true;
    } else {
      ctx.jsonErr(404, 'Sorry, This service is only used for Bitsler.com and forum.Bitsler.com');
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
router.get('/.well-known/acme-challenge/:acme', async (ctx) => {
  ctx.validateParam('acme').required().toString().trim();
  const acmeFile = path.resolve(__dirname, `../.well-known/acme-challenge/${ctx.vals.acme}`);
  if (!fs.existsSync(acmeFile)) {
    ctx.redirect('/');
  } else {
    return ctx.body = fs.readFileSync(acmeFile, 'utf8');
  }
});
router.get('/status', async (ctx) => {
  const payload = {};
  for (const s of config.SERVICES) {
    const data = {
      api_key: process.env[s] || '',
      format: 'json',
      custom_uptime_ratios: '1-7-30',
      response_times_average: 30,
      response_times: 1
    };
    let d = await req(config.STATURL, data);
    d = d.monitors[0];
    payload[s] = {
      name: d.friendly_name,
      url: d.url,
      status: d.status === 2 ? 'Operational' : (d.status === 8 ? 'Degraded' : 'Outage'),
      sincetime: d.create_datetime,
      uptime: d.custom_uptime_ratio.split('-'),
      response_history: d.response_times,
      response_avg: d.average_response_time
    };
  }
  return ctx.body = payload;
});
router.get('/:sid', async (ctx) => {
  ctx.validateParam('sid').required().toString().trim();
  try {
    if (rand.isValid(ctx.vals.sid)) {
      let url = await db.getRealUrl(ctx.vals.sid, ctx.headers['cf-connecting-ip'], ctx.headers['user-agent'], ctx.headers['cf-ipcountry']);
      if (!url) {
        return ctx.jsonErr(404, 'URL Not Found [Code] 1');
      }
      url += !ctx.querystring ? '' : `?${ctx.querystring}`;
      return ctx.redirect(url);
    } else {
      return ctx.jsonErr(404, 'URL Not Found [Code] 2');
    }
  } catch (err) {
    return ctx.jsonErr(404, 'URL Not Found [Code] 3');
  }
});
module.exports = router;