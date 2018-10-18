const objConstructor = {}.constructor.name;
const isJson = (jsonObj) => {
  if (!jsonObj) return false;
  if (jsonObj.constructor && jsonObj.constructor.name === objConstructor) {
    const jsonString = JSON.stringify(jsonObj);
    try {
      JSON.parse(jsonString);
      return true;
    } catch (err) {
      return false;
    }
  }
  return false;
};
module.exports = () => async (ctx, next) => {
  await next();
  const body = ctx.body;
  if (isJson(body)) {
    ctx.response.type = 'json';
    ctx.body = JSON.stringify(body, null, 2);
    return true;
  }
};