const {
  authorizeRequest,
  readCmsData,
  readJsonBody,
  sendJson,
  writeCmsData,
} = require("./_cms-store");

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const data = await readCmsData();
      sendJson(res, 200, data);
      return;
    }

    if (req.method === "POST") {
      const authorization = authorizeRequest(req);
      if (!authorization.ok) {
        sendJson(res, authorization.status, { ok: false, message: authorization.message });
        return;
      }

      const body = await readJsonBody(req);
      const data = await writeCmsData(body);
      sendJson(res, 200, { ok: true, ...data });
      return;
    }

    res.setHeader("Allow", "GET, POST");
    sendJson(res, 405, { ok: false, message: "Method not allowed" });
  } catch (error) {
    sendJson(res, error.status || 500, {
      ok: false,
      message: error.message || "後台資料處理失敗。",
    });
  }
};
