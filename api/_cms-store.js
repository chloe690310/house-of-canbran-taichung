const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const cmsBlobPath = "canbran-cms/content.json";
const localProductsPath = path.join(process.cwd(), "products-data.js");
const seedPath = path.join(process.cwd(), "cms-seed.json");

function getAdminPassword() {
  return process.env.CANBRAN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "";
}

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function timingSafeTextEqual(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function authorizeRequest(req) {
  const expectedPassword = getAdminPassword();
  if (!expectedPassword) {
    return {
      ok: false,
      status: 503,
      message: "尚未設定後台管理密碼，請先在 Vercel 環境變數設定 CANBRAN_ADMIN_PASSWORD。",
    };
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : req.headers["x-admin-password"];

  if (!timingSafeTextEqual(token, expectedPassword)) {
    return { ok: false, status: 401, message: "管理密碼不正確。" };
  }

  return { ok: true };
}

function readSeedProducts() {
  const source = fs.readFileSync(localProductsPath, "utf8");
  const match = source.match(/window\.CANBRAN_PRODUCTS\s*=\s*(\[.*\]);\s*$/s);
  if (!match) return [];
  return JSON.parse(match[1]);
}

function readSeedData() {
  const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
  return normalizeCmsData({
    products: readSeedProducts(),
    offers: seed.offers || [],
    knowledge: seed.knowledge || [],
    updatedAt: null,
  });
}

function normalizeStatus(value, fallback = "上架") {
  const status = String(value || fallback).trim();
  if (["上架", "上架中", "live", "published", "true"].includes(status)) return "上架";
  if (["下架", "draft", "hidden", "false"].includes(status)) return "下架";
  return status || fallback;
}

function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value)
    .split(/[、／/,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeProduct(product, index) {
  return {
    id: product.id || `p${String(index + 1).padStart(3, "0")}`,
    row: product.row || index + 3,
    name: String(product.name || "").trim(),
    brand: String(product.brand || "").trim(),
    image: String(product.image || "").trim(),
    imageFile: String(product.imageFile || "").trim(),
    categories: ensureArray(product.categories?.length ? product.categories : product.category),
    category: String(product.category || ensureArray(product.categories)[0] || "").trim(),
    scalp: ensureArray(product.scalp),
    hair: ensureArray(product.hair),
    effect: String(product.effect || "").trim(),
    usage: String(product.usage || "").trim(),
    variants: Array.isArray(product.variants) ? product.variants : [],
    status: normalizeStatus(product.status),
    priority: String(product.priority || "中").trim(),
    needs: ensureArray(product.needs),
    caution: String(product.caution || "").trim(),
    pitch: String(product.pitch || "").trim(),
  };
}

function normalizeOffer(offer, index) {
  return {
    id: offer.id || `offer-${Date.now()}-${index}`,
    status: normalizeStatus(offer.status),
    series: String(offer.series || "").trim(),
    title: String(offer.title || "").trim(),
    priceLabel: String(offer.priceLabel || "").trim(),
    price: String(offer.price || "").trim(),
    original: String(offer.original || "").trim(),
    tag: String(offer.tag || "").trim(),
    image: String(offer.image || "").trim(),
    imageAlt: String(offer.imageAlt || offer.title || "").trim(),
    description: String(offer.description || "").trim(),
    points: ensureArray(offer.points),
  };
}

function normalizeKnowledge(article, index) {
  return {
    id: article.id || `knowledge-${Date.now()}-${index}`,
    status: normalizeStatus(article.status),
    type: String(article.type || "").trim(),
    title: String(article.title || "").trim(),
    image: String(article.image || "").trim(),
    imageAlt: String(article.imageAlt || article.title || "").trim(),
    description: String(article.description || "").trim(),
    linkLabel: String(article.linkLabel || "").trim(),
    linkUrl: String(article.linkUrl || "").trim(),
  };
}

function normalizeCmsData(data = {}) {
  return {
    products: Array.isArray(data.products) ? data.products.map(normalizeProduct).filter((item) => item.name) : [],
    offers: Array.isArray(data.offers) ? data.offers.map(normalizeOffer).filter((item) => item.title) : [],
    knowledge: Array.isArray(data.knowledge) ? data.knowledge.map(normalizeKnowledge).filter((item) => item.title) : [],
    updatedAt: data.updatedAt || null,
  };
}

async function readBlobData() {
  if (!hasBlobToken()) return null;

  const { list } = await import("@vercel/blob");
  const result = await list({
    prefix: cmsBlobPath,
    limit: 10,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  const blob = result.blobs.find((item) => item.pathname === cmsBlobPath) || result.blobs[0];
  if (!blob?.url) return null;

  const response = await fetch(`${blob.url}?v=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) return null;

  return normalizeCmsData(await response.json());
}

async function readCmsData() {
  const seed = readSeedData();
  const blobData = await readBlobData();

  return {
    ...seed,
    ...blobData,
    products: blobData?.products?.length ? blobData.products : seed.products,
    offers: blobData?.offers?.length ? blobData.offers : seed.offers,
    knowledge: blobData?.knowledge?.length ? blobData.knowledge : seed.knowledge,
    storageConfigured: hasBlobToken(),
    source: blobData ? "blob" : "seed",
  };
}

async function writeCmsData(data) {
  if (!hasBlobToken()) {
    const error = new Error("尚未設定 Vercel Blob，無法儲存後台資料。");
    error.status = 503;
    throw error;
  }

  const normalized = normalizeCmsData({
    ...data,
    updatedAt: new Date().toISOString(),
  });
  const { put } = await import("@vercel/blob");
  await put(cmsBlobPath, JSON.stringify(normalized, null, 2), {
    access: "public",
    contentType: "application/json; charset=utf-8",
    allowOverwrite: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return normalized;
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.trim()) return JSON.parse(req.body);

  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

module.exports = {
  authorizeRequest,
  hasBlobToken,
  normalizeCmsData,
  readCmsData,
  readJsonBody,
  sendJson,
  writeCmsData,
};
