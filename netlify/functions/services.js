// GET /.netlify/functions/services -> { services, barbers }
const { sql, json } = require('../lib/db');
exports.handler = async () => {
  try {
    const services = await sql`SELECT service_id, name, description, price, image FROM services ORDER BY service_id`;
    const barbers = await sql`SELECT barber_id, name FROM barbers ORDER BY barber_id`;
    return json(200, { services, barbers });
  } catch (e) {
    console.error(e);
    return json(500, { error: 'Could not load services.' });
  }
};
