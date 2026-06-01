const {
  countEvents,
  daysAgo,
  isConfigured,
  json,
  recentEvents,
  todayStart,
} = require('./_supabase');

function emptyTrend(days) {
  const start = daysAgo(days - 1);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return {
      date: date.toISOString().slice(0, 10),
      visitors: 0,
      downloads: 0,
    };
  });
}

function buildTrend(events, days) {
  const trend = emptyTrend(days);
  const byDate = new Map(trend.map(item => [item.date, item]));

  for (const event of events) {
    const date = String(event.created_at || '').slice(0, 10);
    const bucket = byDate.get(date);
    if (!bucket) continue;
    if (event.event_type === 'visit') bucket.visitors += 1;
    if (event.event_type === 'download') bucket.downloads += 1;
  }

  return trend;
}

function buildDownloadsByVersion(events) {
  const counts = new Map();
  for (const event of events) {
    if (event.event_type !== 'download') continue;
    const version = event.version || 'unknown';
    counts.set(version, (counts.get(version) || 0) + 1);
  }
  return Array.from(counts, ([version, total]) => ({ version, total }))
    .sort((a, b) => b.total - a.total);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    const [visitsTotal, visitsToday, visitsWeek, visitsMonth, downloadsTotal, downloadsToday, downloadsWeek, downloadsMonth, events] = await Promise.all([
      countEvents('visit'),
      countEvents('visit', todayStart()),
      countEvents('visit', daysAgo(6)),
      countEvents('visit', daysAgo(29)),
      countEvents('download'),
      countEvents('download', todayStart()),
      countEvents('download', daysAgo(6)),
      countEvents('download', daysAgo(29)),
      recentEvents(30),
    ]);

    const stats = {
      configured: isConfigured(),
      visits: visitsTotal,
      downloads: downloadsTotal,
      visitors: {
        total: visitsTotal,
        today: visitsToday,
        week: visitsWeek,
        month: visitsMonth,
      },
      downloadStats: {
        total: downloadsTotal,
        today: downloadsToday,
        week: downloadsWeek,
        month: downloadsMonth,
        byVersion: buildDownloadsByVersion(events),
      },
      trend: buildTrend(events, 30),
      generatedAt: new Date().toISOString(),
    };

    return json(res, 200, { ok: true, stats });
  } catch (error) {
    return json(res, 500, { ok: false, error: 'Stats failed' });
  }
};
