const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
const json = (code, body) => ({
  statusCode: code,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
module.exports = { sql, json };
