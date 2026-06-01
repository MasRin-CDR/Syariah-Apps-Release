const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function isConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function supabaseHeaders(extra = {}) {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function todayStart() {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now;
}

function daysAgo(days) {
  const date = todayStart();
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

async function insertEvent(event) {
  if (!isConfigured()) return { ok: false, configured: false };

  const response = await fetch(`${SUPABASE_URL}/rest/v1/analytics_events`, {
    method: 'POST',
    headers: supabaseHeaders({ Prefer: 'return=minimal' }),
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase insert failed: ${response.status} ${message}`);
  }

  return { ok: true, configured: true };
}

async function countEvents(eventType, since) {
  if (!isConfigured()) return 0;

  const params = new URLSearchParams({
    select: 'id',
    event_type: `eq.${eventType}`,
  });
  if (since) params.set('created_at', `gte.${since.toISOString()}`);

  const response = await fetch(`${SUPABASE_URL}/rest/v1/analytics_events?${params}`, {
    method: 'HEAD',
    headers: supabaseHeaders({ Prefer: 'count=exact' }),
  });

  if (!response.ok) return 0;
  const contentRange = response.headers.get('content-range') || '';
  const count = Number(contentRange.split('/').pop());
  return Number.isFinite(count) ? count : 0;
}

async function recentEvents(days = 30) {
  if (!isConfigured()) return [];

  const params = new URLSearchParams({
    select: 'event_type,version,created_at',
    created_at: `gte.${daysAgo(days).toISOString()}`,
    order: 'created_at.asc',
    limit: '5000',
  });

  const response = await fetch(`${SUPABASE_URL}/rest/v1/analytics_events?${params}`, {
    headers: supabaseHeaders(),
  });

  if (!response.ok) return [];
  return response.json();
}

module.exports = {
  countEvents,
  daysAgo,
  insertEvent,
  isConfigured,
  json,
  recentEvents,
  todayStart,
};
