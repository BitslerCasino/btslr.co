module.exports = {
  'PRODUCTION': process.env.NODE_ENV === 'production',
  'HTTPS': process.env.HTTPS,
  'TRUST_PROXY': process.env.TRUST_PROXY,
  'DATABASE_URL': process.env.DATABASE_URL,
  'SITE_URL': process.env.SITE_URL,
  'PORT': process.env.PORT,
  'ALLOWED': process.env.ALLOWED.split(','),
  'ID_LENGTH': process.env.ID_LENGTH
};