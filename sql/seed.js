require('dotenv').config();
const path = require('path');
const fs = require('fs');
const pgLazy = require('pg-lazy');
const config = require('../config');
const { pool } = pgLazy(require('pg'), { connectionString: config.DATABASE_URL }, { singleton: true });
// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
function slurpSql(filePath) {
  const relativePath = `../sql/${filePath}`;
  const fullPath = path.join(__dirname, relativePath);
  return new Promise((resolve, reject) => {
    fs.readFile(fullPath, 'utf8', (err, text) => {
      if (err) return reject(err);
      resolve(text);
    });
  });
}
async function seed() {
  console.log('Resetting the database...');
  await (async () => {
    const schema = await slurpSql('schema.sql');
    console.log('-- Executing schema.sql...');
    await pool._query(schema);
  })();
}
seed().then(() => {
  console.log('Finished resetting db');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err, err.stack);
  process.exit(1);
});