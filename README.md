# Wisdom Delight Barbing Shop

An online booking app for a barbing shop in Warri, Nigeria. Customers pick a service and a barber, choose a free time slot, and book in under a minute. The owner gets one reliable record of every appointment.

## The problem it solves

Bookings over WhatsApp and phone calls get lost, double-booked, or forgotten. This app replaces that with a database that **refuses to double-book a barber** and remembers returning customers by phone number.

**Who benefits:** customers (fast booking, no calls) and the shop (fewer no-shows and clashes, one source of truth).

## Features

- Services and barbers loaded live from the database
- Time slots that grey out when a barber is already booked
- Returning customers recognised by phone number
- "My bookings" lookup by phone number
- Double-booking blocked at the database level (`UNIQUE (barber_id, appointment_time)`)

## Tech stack

HTML, CSS, vanilla JavaScript · Netlify Functions (Node.js) · Neon PostgreSQL · GitHub · Netlify

## Project structure

```
public/                 front end (index.html, css, js, images)
netlify/functions/      serverless API: services, slots, bookings
netlify/lib/db.js       shared Neon connection
db/schema.sql           tables + starter data
netlify.toml            Netlify build settings
INSTRUCTIONS.md         full setup and deploy guide
```

## Database design

```
customers            services             barbers          appointments
customer_id (PK)     service_id (PK)      barber_id (PK)   appointment_id (PK)
phone (UNIQUE)       name, description    name             customer_id (FK)
name                 price, image                          service_id  (FK)
                                                           barber_id   (FK)
                                                           appointment_time
                                                           UNIQUE(barber_id, appointment_time)
```

## Run locally

See `INSTRUCTIONS.md`. Short version: `npm install`, add `DATABASE_URL` to `.env`, run `npx netlify dev`.

## How I would measure success

- Bookings per week vs the WhatsApp/phone baseline
- Share of returning customers
- Double bookings (should be zero)
- No-show rate (a good next feature: SMS or WhatsApp reminders)

## Next steps

- Cancel and reschedule
- Admin page for the shop owner
- WhatsApp or SMS reminders
- Per-service duration instead of fixed one-hour slots
