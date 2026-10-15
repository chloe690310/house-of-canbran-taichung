const assert = require("node:assert/strict");
const test = require("node:test");
const { createCmsStore, plain } = require("./helpers/cms-store.cjs");

const custom = {
  featuredIds: ["p110", "p009"],
  managerPicks: [{ productId: "p035", displayName: "保濕修護首選", badge: "店長推薦", image: "" }],
};

async function request(cms, method, body, authorized = true, handler = cms.handler) {
  let responseBody;
  const res = { statusCode: 200, setHeader() {}, end(value) { responseBody = JSON.parse(value); } };
  await handler({ method, body, headers: authorized ? { authorization: "Bearer local-preview-only" } : {} }, res);
  return { status: res.statusCode, body: responseBody };
}

test("existing Blob content gets the original showcase without writing or replacing products", async () => {
  const original = { products: [{ id: "custom", name: "門市自訂商品" }], offers: [], knowledge: [] };
  const cms = createCmsStore(original);
  const { body } = await request(cms, "GET");
  assert.deepEqual(body.productDisplay.featuredIds, ["p138", "p035", "p110"]);
  assert.deepEqual(body.productDisplay.managerPicks.map((pick) => pick.productId), ["p009", "p152", "p053"]);
  assert.equal(body.products[0].name, "門市自訂商品");
  assert.equal(cms.writes(), 0);
  assert.deepEqual(cms.stored(), original);
});

test("saving and reloading keeps order and recommendation labels without changing other content", async () => {
  const cms = createCmsStore();
  const before = (await request(cms, "GET")).body;
  const saved = await request(cms, "POST", { ...before, productDisplay: custom });
  assert.equal(saved.status, 200);
  assert.equal(cms.writes(), 1);
  const after = (await request(cms, "GET")).body;
  assert.deepEqual(after.productDisplay, custom);
  for (const key of ["products", "offers", "knowledge"]) assert.deepEqual(after[key], before[key]);
});

test("explicitly clearing both lists remains empty after save and reload", async () => {
  const cms = createCmsStore();
  const before = (await request(cms, "GET")).body;
  const empty = { featuredIds: [], managerPicks: [] };
  await request(cms, "POST", { ...before, productDisplay: empty });
  assert.deepEqual((await request(cms, "GET")).body.productDisplay, empty);
});

test("an older admin page saving other content preserves saved display settings", async () => {
  const cms = createCmsStore();
  const before = (await request(cms, "GET")).body;
  await request(cms, "POST", { ...before, productDisplay: custom });
  const legacyPayload = { ...before };
  delete legacyPayload.productDisplay;
  await request(cms, "POST", legacyPayload);
  assert.deepEqual((await request(cms, "GET")).body.productDisplay, custom);
});

test("empty and duplicate selections are removed and manager picks are limited to three", () => {
  const cms = createCmsStore();
  const normalized = plain(cms.store.normalizeCmsData({ productDisplay: {
    featuredIds: ["p035", "", "p035", " p009 "],
    managerPicks: [null, { productId: "" }, ...["p009", "p009", "p035", "p110", "p138"].map((productId) => ({ productId }))],
  } }));
  assert.deepEqual(normalized.productDisplay.featuredIds, ["p035", "p009"]);
  assert.deepEqual(normalized.productDisplay.managerPicks.map((pick) => pick.productId), ["p009", "p035", "p110"]);
});

test("unauthenticated changes are rejected before touching storage", async () => {
  const cms = createCmsStore();
  assert.equal((await request(cms, "POST", { productDisplay: custom }, false)).status, 401);
  assert.equal(cms.writes(), 0);
});

test("storage failure returns an error and retains the prior saved configuration", async () => {
  const cms = createCmsStore();
  const before = (await request(cms, "GET")).body;
  await request(cms, "POST", { ...before, productDisplay: custom });
  cms.failWrites(true);
  assert.equal((await request(cms, "POST", { ...before, productDisplay: { featuredIds: [], managerPicks: [] } })).status, 500);
  assert.deepEqual((await request(cms, "GET")).body.productDisplay, custom);
});

test("a manager image override survives save/reload and can be cleared without changing the product image", async () => {
  const cms = createCmsStore();
  const before = (await request(cms, "GET")).body;
  const display = structuredClone(custom);
  display.managerPicks[0].image = "  https://example.com/manager-image.jpg  ";
  await request(cms, "POST", { ...before, productDisplay: display });
  const after = (await request(cms, "GET")).body;
  assert.equal(after.productDisplay.managerPicks[0].image, "https://example.com/manager-image.jpg");
  assert.deepEqual(after.products, before.products);
  after.productDisplay.managerPicks[0].image = "";
  await request(cms, "POST", after);
  assert.equal((await request(cms, "GET")).body.productDisplay.managerPicks[0].image, "");
  assert.deepEqual((await request(cms, "GET")).body.products, before.products);
});

test("legacy recommendations without custom images remain available", () => {
  const cms = createCmsStore();
  const normalized = plain(cms.store.normalizeCmsData({ productDisplay: {
    featuredIds: [], managerPicks: [{ productId: "p009", displayName: "保濕", badge: "推薦" }],
  } }));
  assert.deepEqual(normalized.productDisplay.managerPicks, [{ productId: "p009", displayName: "保濕", badge: "推薦", image: "" }]);
});

test("image uploads require admin authentication and return an image URL that can be saved in manager picks", async () => {
  const cms = createCmsStore();
  const bytes = Buffer.from("isolated-image-test");
  const payload = { fileName: "推薦圖片.png", dataUrl: `data:image/png;base64,${bytes.toString("base64")}` };
  assert.equal((await request(cms, "POST", payload, false, cms.uploadHandler)).status, 401);
  assert.equal(cms.uploadCount(), 0);
  const uploaded = await request(cms, "POST", payload, true, cms.uploadHandler);
  assert.equal(uploaded.status, 200);
  assert.deepEqual(cms.uploadedImage(uploaded.body.url).buffer, bytes);
  assert.equal(cms.uploadedImage(uploaded.body.url).contentType, "image/png");
  assert.equal(cms.writes(), 0, "uploading alone must not change published content");
  const before = (await request(cms, "GET")).body;
  const display = structuredClone(custom);
  display.managerPicks[0].image = uploaded.body.url;
  await request(cms, "POST", { ...before, productDisplay: display });
  assert.equal((await request(cms, "GET")).body.productDisplay.managerPicks[0].image, uploaded.body.url);
});

test("invalid and oversized uploads leave existing content intact", async () => {
  const cms = createCmsStore();
  assert.equal((await request(cms, "POST", { dataUrl: "invalid" }, true, cms.uploadHandler)).status, 400);
  const oversized = { dataUrl: `data:image/png;base64,${Buffer.alloc(5 * 1024 * 1024 + 1).toString("base64")}` };
  assert.equal((await request(cms, "POST", oversized, true, cms.uploadHandler)).status, 413);
  assert.equal(cms.uploadCount(), 0);
  assert.equal(cms.writes(), 0);
});
