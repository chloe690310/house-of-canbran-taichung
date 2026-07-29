const { authorizeRequest, hasBlobToken, sendJson } = require("./_cms-store");

module.exports = async function handler(req, res) {
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

  sendJson(res, 200, {
    ok: true,
    storageConfigured: hasBlobToken(),
  });
};
