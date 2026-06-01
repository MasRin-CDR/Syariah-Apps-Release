const { insertEvent, json } = require('./_supabase');

const ALLOWED_EVENTS = new Set(['visit', 'download']);

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 16 * 1024) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return json(res, 200, { ok: true });
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    const raw = await readBody(req);
    const payload = raw ? JSON.parse(raw) : {};
    const eventType = ALLOWED_EVENTS.has(payload.event) ? payload.event : null;
    if (!eventType) return json(res, 400, { ok: false, error: 'Invalid event' });

    const meta = payload.meta && typeof payload.meta === 'object' ? payload.meta : {};
    const path = typeof payload.path === 'string' ? payload.path.slice(0, 240) : '/';
    const country = req.headers['x-vercel-ip-country'] || req.headers['x-country-code'] || null;

    const result = await insertEvent({
      event_type: eventType,
      path,
      platform: typeof meta.platform === 'string' ? meta.platform.slice(0, 40) : null,
      version: typeof meta.version === 'string' ? meta.version.slice(0, 40) : null,
      country: typeof country === 'string' ? country.slice(0, 2).toUpperCase() : null,
    });

    return json(res, 200, { ok: true, stored: result.ok, configured: result.configured });
  } catch (error) {
    return json(res, 500, { ok: false, error: 'Track failed' });
  }
};
