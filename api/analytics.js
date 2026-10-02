const {
  authorizeRequest,
  hasBlobToken,
  readJsonBody,
  sendJson,
} = require("./_cms-store");

const analyticsBlobPath = "canbran-cms/analytics.json";

const pageLabels = {
  home: "首頁",
  brand: "品牌故事",
  services: "肯邦服務",
  advisor: "AI 髮品顧問",
  products: "熱門髮品",
  offers: "最新優惠",
  knowledge: "美髮知識",
  stores: "門市資訊",
};

function normalizePage(value) {
  const page = String(value || "home").replace(/^#/, "");
  return Object.prototype.hasOwnProperty.call(pageLabels, page) ? page : "home";
}

function getTaipeiDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function getDateRange(days) {
  const range = [];
  const now = new Date();
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(now);
    date.setDate(date.getDate() - index);
    range.push(getTaipeiDateKey(date));
  }
  return range;
}

function normalizeAnalyticsData(data = {}) {
  const pages = {};
  Object.keys(pageLabels).forEach((page) => {
    const source = data.pages?.[page] || {};
    pages[page] = {
      label: pageLabels[page],
      total: Number(source.total || 0),
      days: source.days && typeof source.days === "object" ? source.days : {},
    };
  });

  return {
    totalViews: Number(data.totalViews || 0),
    days: data.days && typeof data.days === "object" ? data.days : {},
    pages,
    updatedAt: data.updatedAt || null,
  };
}

async function readAnalyticsData() {
  if (!hasBlobToken()) return normalizeAnalyticsData();

  const { list } = await import("@vercel/blob");
  const result = await list({
    prefix: analyticsBlobPath,
    limit: 5,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  const blob = result.blobs.find((item) => item.pathname === analyticsBlobPath) || result.blobs[0];
  if (!blob?.url) return normalizeAnalyticsData();

  const response = await fetch(`${blob.url}?v=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) return normalizeAnalyticsData();
  return normalizeAnalyticsData(await response.json());
}

async function writeAnalyticsData(data) {
  if (!hasBlobToken()) return data;

  const { put } = await import("@vercel/blob");
  await put(analyticsBlobPath, JSON.stringify(data, null, 2), {
    access: "public",
    contentType: "application/json; charset=utf-8",
    allowOverwrite: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return data;
}

function summarizeAnalytics(data) {
  const todayKey = getTaipeiDateKey();
  const last7Keys = getDateRange(7);
  const daily = last7Keys.map((date) => ({
    date,
    views: Number(data.days[date] || 0),
  }));
  const last7Views = daily.reduce((sum, day) => sum + day.views, 0);

  const pages = Object.entries(data.pages)
    .map(([key, page]) => {
      const pageDaily = last7Keys.map((date) => Number(page.days[date] || 0));
      return {
        key,
        label: page.label || pageLabels[key] || key,
        total: Number(page.total || 0),
        today: Number(page.days[todayKey] || 0),
        last7: pageDaily.reduce((sum, views) => sum + views, 0),
      };
    })
    .sort((left, right) => right.total - left.total);

  return {
    storageConfigured: hasBlobToken(),
    totalViews: data.totalViews,
    todayViews: Number(data.days[todayKey] || 0),
    last7Views,
    daily,
    pages,
    updatedAt: data.updatedAt,
  };
}

async function recordPageView(body) {
  const page = normalizePage(body.page);
  const dateKey = getTaipeiDateKey();
  const data = await readAnalyticsData();

  data.totalViews += 1;
  data.days[dateKey] = Number(data.days[dateKey] || 0) + 1;
  data.pages[page].total += 1;
  data.pages[page].days[dateKey] = Number(data.pages[page].days[dateKey] || 0) + 1;
  data.updatedAt = new Date().toISOString();

  await writeAnalyticsData(data);
  return summarizeAnalytics(data);
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "POST") {
      if (!hasBlobToken()) {
        sendJson(res, 200, { ok: false, storageConfigured: false });
        return;
      }

      const body = await readJsonBody(req);
      const analytics = await recordPageView(body);
      sendJson(res, 200, { ok: true, analytics });
      return;
    }

    if (req.method === "GET") {
      const authorization = authorizeRequest(req);
      if (!authorization.ok) {
        sendJson(res, authorization.status, { ok: false, message: authorization.message });
        return;
      }

      const analytics = summarizeAnalytics(await readAnalyticsData());
      sendJson(res, 200, { ok: true, analytics });
      return;
    }

    res.setHeader("Allow", "GET, POST");
    sendJson(res, 405, { ok: false, message: "Method not allowed" });
  } catch (error) {
    sendJson(res, error.status || 500, {
      ok: false,
      message: error.message || "數據分析處理失敗。",
    });
  }
};
