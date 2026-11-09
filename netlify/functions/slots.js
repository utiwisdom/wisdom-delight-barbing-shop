// GET /.netlify/functions/slots?barber=1&date=2026-11-20 -> ["09:00","10:00"] (already taken)
const { sql, json } = require('../lib/db');
exports.handler = async (event) => {
  const { barber, date } = event.queryStringParameters || {};
  if (!/^\d+$/.test(barber || '') || !/^\d{4}-\d{2}-\d{2}$/.test(date || ''))
    return json(400, { error: 'barber and date are required.' });
  try {
    const rows = await sql`
      SELECT to_char(appointment_time, 'HH24:MI') AS t FROM appointments
      WHERE barber_id = ${Number(barber)} AND appointment_time::date = ${date}::date`;
    return json(200, rows.map((r) => r.t));
  } catch (e) {
    console.error(e);
    return json(500, { error: 'Could not load time slots.' });
  }
};
