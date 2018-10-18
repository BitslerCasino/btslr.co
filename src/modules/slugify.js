const decamelize = str => str
  .replace(/([a-z\d])([A-Z])/g, '$1 $2')
  .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1 $2');
const removeExtraSeparators = (string, separator) => {
  return string
    .replace(new RegExp(`${separator}{2,}`, 'g'), separator)
    .replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');
};
module.exports = str => {
  str = decamelize(str).toLowerCase();
  str = str.replace(/[^a-z\d]+/g, '-').replace(/\\/g, '');
  return removeExtraSeparators(str, '-');
};