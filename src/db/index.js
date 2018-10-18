const pgLazy = require('pg-lazy');
const config = require('../config');
const { pool, sql } = pgLazy(require('pg'), { connectionString: config.DATABASE_URL }, { singleton: true });
const assert = require('assert');
const rand = require('../modules/random');
exports.getRealUrl = async (shorturl, ip, ua, country) => {
  assert(typeof shorturl === 'string');
  const res = await pool.one(sql `
    UPDATE links
    SET visits = visits + 1, last_visit = NOW()
    WHERE short_url = ${shorturl}
    RETURNING real_url
  `);
  if (!res) return false;
  await updStats(ip, ua, country);
  return res.real_url;
};
exports.getShortUrl = async url => {
  assert(typeof url === 'string');
  return pool.one(sql `
    SELECT short_url
    FROM links
    WHERE lower(real_url) = lower(${url})
  `);
};
async function generateuniq() {
  const short_url = rand.generate();
  const id = await pool.one(sql `
    SELECT id FROM links WHERE
    short_url = ${short_url}
    `);
  if (!id) {
    return short_url;
  } else {
    return await generateuniq();
  }
}
exports.insertUrl = async real_url => {
  assert(typeof real_url === 'string');
  const short_url = await generateuniq();
  return pool.one(sql `
    INSERT INTO links (real_url, short_url)
    VALUES (${real_url}, ${short_url})
    RETURNING short_url
  `);
};
exports.getStatLinks = async () => {
  return pool.many(sql `
    SELECT *
    FROM links
    ORDER BY visits DESC
  `);
};
exports.getStatUsers = async () => {
  return pool.many(sql `
    SELECT *
    FROM stats
    ORDER BY id DESC
  `);
};
const updStats = async (ip, ua, country) => {
  assert(typeof ip === 'string');
  assert(typeof ua === 'string');
  const res = await pool.one(sql `
    UPDATE stats
    SET visits = visits + 1, last_visit = NOW()
    WHERE ip = ${ip} AND ua = ${ua}
    RETURNING * 
    `);
  if (!res) {
    return pool.one(sql `
    INSERT INTO stats (ip, ua, country,visits)
    VALUES (${ip}, ${ua}, ${country}, 1)
    RETURNING *
  `);
  } else {
    return res;
  }
};