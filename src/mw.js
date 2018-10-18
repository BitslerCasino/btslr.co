const bouncer = require('koa-bouncer');
const methodOverride = require('./modules/methodOverride');
const jsonBody = require('./modules/jsonBody');
const config = require('./config');
const handleBouncerValidationError = () => async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof bouncer.ValidationError) {
      ctx.jsonErr(400, { error: err.message, field: err.name });
    } else if (typeof err === 'string') {
      ctx.jsonErr(403, { error: err });
    } else if (err && err.status) {
      const body = err.body || err.message || 'Unspecified error';
      ctx.jsonErr(err.status, { error: body });
    } else {
      if (config.PRODUCTION === true) {
        ctx.jsonErr(500, { error: 'INTERNAL_ERROR' });
      } else {
        ctx.jsonErr(500, { error: err.stack || err.message });
      }
    }
    return err;
  }
};

function loadMiddlewares(app) {
  app.use(methodOverride());
  app.use(jsonBody());
  app.use(bouncer.middleware());
  app.use(handleBouncerValidationError());
}
module.exports = loadMiddlewares;