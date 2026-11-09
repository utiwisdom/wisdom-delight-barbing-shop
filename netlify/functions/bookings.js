// POST /.netlify/functions/bookings            -> create a booking
// GET  /.netlify/functions/bookings?phone=...  -> upcoming bookings for a phone number
const { sql, json } = require('../lib/db');
const PHONE = /^[0-9+\-\s]{7,20}$/;
const HOURS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const phone = (event.queryStringParameters || {}).phone || '';
      if (!PHONE.test(phone)) return json(400, { error: 'Enter a valid phone number.' });
      const rows = await sql`
        SELECT a.appointment_id, s.name AS service, b.name AS barber,
               to_char(a.appointment_time, 'Dy DD Mon YYYY, HH24:MI') AS "when"
        FROM appointments a
        JOIN customers c USING (customer_id)
        JOIN services s USING (service_id)
        JOIN barbers b USING (barber_id)
        WHERE c.phone = ${phone.trim()} AND a.appointment_time >= now()
        ORDER BY a.appointment_time`;
      return json(200, rows);
    }

    if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });
    const { name, phone, serviceId, barberId, date, time } = JSON.parse(event.body || '{}');
    const cleanName = String(name || '').trim().slice(0, 80);
    if (!cleanName) return json(400, { error: 'Please enter your name.' });
    if (!PHONE.test(phone || '')) return json(400, { error: 'Enter a valid phone number.' });
    if (!Number.isInteger(serviceId) || !Number.isInteger(barberId)) return json(400, { error: 'Pick a service and a barber.' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !HOURS.includes(time)) return json(400, { error: 'Pick a valid date and time.' });
    if (new Date(`${date}T${time}:00`) < new Date()) return json(400, { error: 'That time has already passed.' });

    const [cust] = await sql`
      INSERT INTO customers (phone, name) VALUES (${phone.trim()}, ${cleanName})
      ON CONFLICT (phone) DO UPDATE SET name = customers.name
      RETURNING customer_id, name`;
    const made = await sql`
      INSERT INTO appointments (customer_id, service_id, barber_id, appointment_time)
      VALUES (${cust.customer_id}, ${serviceId}, ${barberId}, ${date + ' ' + time}::timestamp)
      ON CONFLICT (barber_id, appointment_time) DO NOTHING
      RETURNING appointment_id`;
    if (!made.length) return json(409, { error: 'Sorry, that slot was just taken. Please pick another time.' });
    return json(201, { ok: true, name: cust.name });
  } catch (e) {
    console.error(e);
    return json(500, { error: 'Something went wrong. Please try again.' });
  }
};
