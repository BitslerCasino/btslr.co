const crypto = require('crypto');
const config = require('../config');
const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const randomize = (seed, len, splice = false) => {
  const sourceArray = seed.split('');
  let baselen = typeof len === 'undefined' ? sourceArray.length : Number.parseInt(len);
  const rnd = crypto.randomBytes(baselen);
  const result = [];
  let counter = 0,
    characterIndex, r;
  while (baselen > 0) {
    r = rnd[counter];
    characterIndex = r % sourceArray.length;
    if (splice == true) {
      result.push(sourceArray.splice(characterIndex, 1)[0]);
    } else {
      result.push(sourceArray[characterIndex]);
    }
    baselen--;
    counter++;
  }
  return result.join('');
};
const isAlphaNumeric = str => !/[^0-9a-z\xDF-\xFF]/g.test(str);
exports.generate = () => {
  const alphaseed = randomize(alphanumeric);
  return randomize(alphaseed, config.ID_LENGTH, false);
};
exports.isValid = str => str.length === Number.parseInt(config.ID_LENGTH) && isAlphaNumeric(str);