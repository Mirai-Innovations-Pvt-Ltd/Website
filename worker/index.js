// The site's only server code. Cloudflare serves site/ as static assets and runs this for /api/* alone.
// POST /api/contact takes the pilot sheet and hands it to the Google Apps Script web app in FORM_HOOK (a secret set
// in the Cloudflare dashboard, never in this public repo), which adds a row to the enquiries sheet and mails hello@.
// The script's source is worker/enquiries.gs.

const FIELDS = { role: 20, name: 80, company: 80, city: 80, phone: 20, email: 120, when: 200, message: 1500 };

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers } });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/contact') return env.ASSETS.fetch(request);
    if (request.method !== 'POST') return json({ ok: false }, 405, { Allow: 'POST' });
    const origin = request.headers.get('Origin');
    if (origin && origin !== url.origin) return json({ ok: false }, 403);            // only the site's own page
    let form;
    try { form = await request.formData(); } catch { return json({ ok: false }, 400); }
    if (form.get('bot-field')) return json({ ok: true });                         // the hidden field: a bot, drop it
    const e = {};
    for (const [k, max] of Object.entries(FIELDS)) e[k] = String(form.get(k) ?? '').trim().slice(0, max);
    if (!e.name || !(e.phone || e.email)) return json({ ok: false }, 422);
    if (!env.FORM_HOOK) return json({ ok: false }, 503);                          // the page then offers WhatsApp or mail
    try {
      const res = await fetch(env.FORM_HOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...e, site: url.host, country: request.cf?.country || '' }),
      });
      const out = await res.json();
      return json({ ok: !!out.ok }, out.ok ? 200 : 502);
    } catch {
      return json({ ok: false }, 502);
    }
  },
};
