// Vercel serverless function: receives the enquiry form.
// Works with JSON (fetch from the page) and with a plain HTML form post (no JavaScript).
// Delivery: if RESEND_API_KEY is set in the Vercel project, the enquiry is emailed to ENQUIRY_TO
// (default: the address in site.config.mjs) via Resend. Otherwise it is written to the function log.
const TO = process.env.ENQUIRY_TO || 'fivefootway@tourground.com';
const FROM = process.env.ENQUIRY_FROM || 'Five Foot Way <onboarding@resend.dev>';
const FIELDS = ['firstName', 'lastName', 'email', 'country', 'dates', 'length', 'travellers', 'interest', 'message', 'lang'];

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const raw = typeof req.body === 'string' ? req.body : await new Promise((ok) => { let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => ok(d)); });
  const type = req.headers['content-type'] || '';
  if (type.includes('application/json')) { try { return JSON.parse(raw || '{}'); } catch { return {}; } }
  return Object.fromEntries(new URLSearchParams(raw));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false }); }
  const body = await readBody(req);
  const wantsJson = (req.headers.accept || '').includes('application/json');
  const clean = (v, n = 2000) => String(v ?? '').replace(/[\u0000-\u0008\u000B-\u001F]/g, '').trim().slice(0, n);
  const data = Object.fromEntries(FIELDS.map((k) => [k, clean(body[k], k === 'message' ? 5000 : 200)]));
  const redirect = /^\/[a-z0-9\-/]*$/i.test(body.redirect || '') && !String(body.redirect).startsWith('//') ? body.redirect : '/enquire/thank-you';

  // honeypot: pretend success for bots
  if (clean(body.company)) return wantsJson ? res.status(200).json({ ok: true }) : res.redirect(303, redirect);

  const errors = [];
  if (!data.firstName) errors.push('firstName');
  if (!data.lastName) errors.push('lastName');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push('email');
  if (!data.message) errors.push('message');
  if (body.consent !== 'yes' && body.consent !== 'on' && body.consent !== true) errors.push('consent');
  if (errors.length) return wantsJson ? res.status(400).json({ ok: false, errors }) : res.status(400).send('Please go back and complete the required fields: ' + errors.join(', '));

  const text = FIELDS.map((k) => `${k}: ${data[k]}`).join('\n');
  try {
    if (process.env.RESEND_API_KEY) {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to: [TO], reply_to: data.email, subject: `Enquiry: ${data.firstName} ${data.lastName} (${data.lang || 'en'})`, text }),
      });
      if (!r.ok) throw new Error('email provider ' + r.status);
    } else {
      console.log('[enquiry]', JSON.stringify({ ...data, receivedAt: new Date().toISOString() }));
    }
  } catch (e) {
    console.error('[enquiry] delivery failed', e.message);
    return wantsJson ? res.status(502).json({ ok: false }) : res.status(502).send('Sorry, the enquiry could not be sent. Please email ' + TO);
  }
  return wantsJson ? res.status(200).json({ ok: true }) : res.redirect(303, redirect);
}
