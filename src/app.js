require('dotenv').config();
const Koa = require('koa');
const serve = require('koa-static');
const cors = require('@koa/cors');
const config = require('./config');
const loadMiddlewares = require('./mw');
const app = new Koa();
app.env = config.NODE_ENV;
app.poweredBy = false;
app.proxy = config.TRUST_PROXY === 'true';
// //////////////////////////////////////////////////////////
// Middleware
// //////////////////////////////////////////////////////////
app.use(cors({
  allowMethods: [
    'GET', 'POST', 'HEAD', 'OPTIONS'
  ],
  origin: '*',
  maxAge: 24 * 60 * 60 // 24 hours
}));
app.use(require('koa-helmet')());
app.use(require('koa-logger')());
app.use(require('koa-bodyparser')({
  extendTypes: { json: ['text/plain'] },
  enableTypes: ['json'],
  onerror(err, ctx) {
    ctx.jsonErr(422, { error: 'Error parsing request' });
  }
}));
loadMiddlewares(app);
app.use(serve(require('path').resolve(__dirname, '../public')));
app.use(async (ctx, next) => {
  ctx.jsonErr = (status, msg) => {
    ctx.type = 'json';
    ctx.status = status || 400;
    ctx.body = msg;
  };
  return next();
});
// //////////////////////////////////////////////////////////
// Routes
// //////////////////////////////////////////////////////////
app.use(require('./router').routes());
app.start = (port = config.PORT) => {
  app.listen(port, () => {
    console.log('Listening on port', port);
  });
};
module.exports = app;