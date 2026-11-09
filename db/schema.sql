-- Run this once in the Neon SQL Editor.
CREATE TABLE IF NOT EXISTS barbers (
  barber_id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS services (
  service_id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  price INT NOT NULL,            -- in Naira
  image VARCHAR(100)
);
CREATE TABLE IF NOT EXISTS customers (
  customer_id SERIAL PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL
);
CREATE TABLE IF NOT EXISTS appointments (
  appointment_id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(customer_id),
  service_id INT NOT NULL REFERENCES services(service_id),
  barber_id INT NOT NULL REFERENCES barbers(barber_id),
  appointment_time TIMESTAMP NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (barber_id, appointment_time)   -- a barber can never be double-booked
);

INSERT INTO barbers (name) VALUES ('Favour'), ('Wisdom') ON CONFLICT DO NOTHING;
-- Prices are placeholders: edit them to your real prices.
INSERT INTO services (name, description, price, image) VALUES
 ('Cut',   'Clean fade or classic cut', 3000,  'service-fade.jpg'),
 ('Trim',  'Beard trim and hot-towel shave', 2000, 'service-beard.jpg'),
 ('Style', 'Styling and finishing', 5000, 'service-style.jpg'),
 ('Color', 'Hair colouring', 8000, 'service-style.jpg'),
 ('Perm',  'Curl and perm treatment', 10000, 'service-style.jpg')
ON CONFLICT DO NOTHING;
