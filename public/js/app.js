const $ = (s) => document.querySelector(s);
const HOURS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];
const naira = (n) => '₦' + Number(n).toLocaleString();

async function api(path, opts) {
  const res = await fetch('/.netlify/functions/' + path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}
function say(el, text, ok) { el.textContent = text; el.className = 'msg ' + (ok ? 'ok' : 'err'); }
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function init() {
  $('#yr').textContent = new Date().getFullYear();
  const today = new Date().toISOString().slice(0, 10);
  $('#date').min = today;
  try {
    const { services, barbers } = await api('services');
    $('#serviceGrid').innerHTML = services.map((s) => `
      <article class="svc"><img src="images/${esc(s.image)}" alt="${esc(s.name)}" loading="lazy">
        <div><h3>${esc(s.name)}</h3><span class="muted">${esc(s.description || '')}</span>
        <span class="price">${naira(s.price)}</span>
        <a class="btn" href="#book" data-id="${s.service_id}">Book this</a></div></article>`).join('');
    $('#service').innerHTML = services.map((s) => `<option value="${s.service_id}">${esc(s.name)} - ${naira(s.price)}</option>`).join('');
    $('#barber').innerHTML = barbers.map((b) => `<option value="${b.barber_id}">${esc(b.name)}</option>`).join('');
    $('#serviceGrid').addEventListener('click', (e) => {
      const id = e.target.dataset && e.target.dataset.id;
      if (id) $('#service').value = id;
    });
    loadSlots();
  } catch (e) {
    $('#serviceGrid').innerHTML = `<p class="msg err">${esc(e.message)}</p>`;
  }
}

async function loadSlots() {
  const barber = $('#barber').value, date = $('#date').value;
  if (!barber || !date) return;
  try {
    const taken = await api(`slots?barber=${barber}&date=${date}`);
    const now = new Date();
    $('#time').innerHTML = '<option value="">Pick a time</option>' + HOURS.map((h) => {
      const past = new Date(`${date}T${h}:00`) < now;
      const off = past || taken.includes(h);
      return `<option value="${h}" ${off ? 'disabled' : ''}>${h}${off ? ' (unavailable)' : ''}</option>`;
    }).join('');
  } catch (e) { say($('#msg'), e.message, false); }
}
$('#barber').addEventListener('change', loadSlots);
$('#date').addEventListener('change', loadSlots);

$('#bookForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = $('#msg');
  try {
    const out = await api('bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: $('#name').value, phone: $('#phone').value,
        serviceId: Number($('#service').value), barberId: Number($('#barber').value),
        date: $('#date').value, time: $('#time').value,
      }),
    });
    say(msg, `You’re booked, ${out.name}. See you soon!`, true);
    loadSlots();
  } catch (err) { say(msg, err.message, false); loadSlots(); }
});

$('#lookupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const list = $('#myList');
  try {
    const rows = await api('bookings?phone=' + encodeURIComponent($('#lookupPhone').value));
    list.innerHTML = rows.length
      ? rows.map((r) => `<li><strong>${esc(r.service)}</strong> with ${esc(r.barber)}<br><span class="muted">${esc(r.when)}</span></li>`).join('')
      : '<li class="muted">No upcoming bookings for that number.</li>';
  } catch (err) { list.innerHTML = `<li class="msg err">${esc(err.message)}</li>`; }
});

init();
