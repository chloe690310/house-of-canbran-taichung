const { authorizeRequest, hasBlobToken, readJsonBody, sendJson } = require("./_cms-store");

function parseDataUrl(dataUrl) {
  const match = String(dataUrl || "").match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return {
    contentType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

function safeFileName(fileName) {
  const value = String(fileName || "image").trim();
  const extension = value.includes(".") ? value.split(".").pop() : "jpg";
  const stem = value
    .replace(/\.[^.]+$/, "")
    .replace(/[^\p{L}\p{N}-]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${stem || "image"}.${extension.toLowerCase()}`;
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      sendJson(res, 405, { ok: false, message: "Method not allowed" });
      return;
    }

    const authorization = authorizeRequest(req);
    if (!authorization.ok) {
      sendJson(res, authorization.status, { ok: false, message: authorization.message });
      return;
    }

    if (!hasBlobToken()) {
      sendJson(res, 503, { ok: false, message: "尚未設定 Vercel Blob，無法上傳圖片。" });
      return;
    }

    const body = await readJsonBody(req);
    const parsed = parseDataUrl(body.dataUrl);
    if (!parsed) {
      sendJson(res, 400, { ok: false, message: "圖片格式不正確。" });
      return;
    }

    if (parsed.buffer.length > 5 * 1024 * 1024) {
      sendJson(res, 413, { ok: false, message: "圖片檔案請先壓到 5MB 以下。" });
      return;
    }

    const { put } = await import("@vercel/blob");
    const blob = await put(`canbran-cms/images/${Date.now()}-${safeFileName(body.fileName)}`, parsed.buffer, {
      access: "public",
      contentType: parsed.contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    sendJson(res, 200, { ok: true, url: blob.url, pathname: blob.pathname });
  } catch (error) {
    sendJson(res, error.status || 500, {
      ok: false,
      message: error.message || "圖片上傳失敗。",
    });
  }
};
