const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "../..");
const plain = (value) => JSON.parse(JSON.stringify(value));

// Exercise the real CMS handlers with an isolated in-memory Blob store.
// This helper never uses production credentials or writes to external services.
function createCmsStore(initialData = null) {
  let stored = initialData ? plain(initialData) : null;
  let writes = 0;
  let failWrites = false;
  const blob = {
    list: async () => ({ blobs: stored ? [{ pathname: "canbran-cms/content.json", url: "https://cms-test.invalid/content.json" }] : [] }),
    put: async (_pathname, body) => {
      if (failWrites) throw new Error("Test storage unavailable");
      stored = JSON.parse(body);
      writes += 1;
      return { url: "https://cms-test.invalid/content.json" };
    },
  };
  const module = { exports: {} };
  const source = fs.readFileSync(path.join(root, "api/_cms-store.js"), "utf8")
    .replaceAll('import("@vercel/blob")', "mockBlobImport()");
  vm.runInNewContext(source, {
    require, module, Buffer,
    process: { cwd: () => root, env: { CANBRAN_ADMIN_PASSWORD: "local-preview-only", BLOB_READ_WRITE_TOKEN: "in-memory-test-only" } },
    mockBlobImport: async () => blob,
    fetch: async () => ({ ok: true, json: async () => plain(stored) }),
  });
  const api = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, "api/cms.js"), "utf8"), {
    module: api, require: () => module.exports,
  });
  const auth = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, "api/auth.js"), "utf8"), {
    module: auth, require: () => module.exports,
  });
  return {
    store: module.exports,
    handler: api.exports,
    authHandler: auth.exports,
    writes: () => writes,
    stored: () => plain(stored),
    failWrites: (value) => { failWrites = value; },
  };
}

module.exports = { createCmsStore, plain };
