const adminSessionKey = "canbranAdminPassword";
const state = {
  products: [],
  offers: [],
  knowledge: [],
  storageConfigured: false,
  source: "seed",
};
const selected = {
  products: null,
  offers: null,
  knowledge: null,
};

const loginPanel = document.querySelector("#login-panel");
const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");
const workspace = document.querySelector("#admin-workspace");
const logoutButton = document.querySelector("#admin-logout");
const statusBar = document.querySelector("#status-bar");
const tabButtons = Array.from(document.querySelectorAll("[data-admin-tab]"));
const panels = Array.from(document.querySelectorAll("[data-admin-panel]"));

const lists = {
  products: document.querySelector("#product-list"),
  offers: document.querySelector("#offer-list"),
  knowledge: document.querySelector("#knowledge-list"),
};
const searches = {
  products: document.querySelector("#product-search"),
  offers: document.querySelector("#offer-search"),
  knowledge: document.querySelector("#knowledge-search"),
};
const forms = {
  products: document.querySelector("#product-editor"),
  offers: document.querySelector("#offer-editor"),
  knowledge: document.querySelector("#knowledge-editor"),
};
const previews = {
  products: document.querySelector("#product-image-preview"),
  offers: document.querySelector("#offer-image-preview"),
  knowledge: document.querySelector("#knowledge-image-preview"),
};

let activeTab = "products";
let adminPassword = sessionStorage.getItem(adminSessionKey) || "";

if (adminPassword) openWorkspace();

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  adminPassword = String(new FormData(loginForm).get("password") || "").trim();
  if (!adminPassword) return;
  sessionStorage.setItem(adminSessionKey, adminPassword);
  await openWorkspace();
});

logoutButton?.addEventListener("click", () => {
  sessionStorage.removeItem(adminSessionKey);
  adminPassword = "";
  workspace.hidden = true;
  logoutButton.hidden = true;
  loginPanel.hidden = false;
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveTab(button.dataset.adminTab));
});

Object.entries(searches).forEach(([type, input]) => {
  input?.addEventListener("input", () => renderList(type));
});

document.querySelectorAll("[data-create-item]").forEach((button) => {
  button.addEventListener("click", () => createItem(button.dataset.createItem));
});

Object.entries(forms).forEach(([type, form]) => {
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveEditor(type);
  });

  form?.querySelector('[name="imageUpload"]')?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadImageForForm(type, file);
    event.target.value = "";
  });
});

document.querySelectorAll("[data-delete-current]").forEach((button) => {
  button.addEventListener("click", async () => deleteCurrent(button.dataset.deleteCurrent));
});

async function openWorkspace() {
  loginMessage.textContent = "";
  loginPanel.hidden = true;
  workspace.hidden = false;
  logoutButton.hidden = false;
  setStatus("正在驗證管理密碼...");

  try {
    await verifyAdminPassword();
    setStatus("正在載入後台資料...");
    await loadData();
    setActiveTab(activeTab);
  } catch (error) {
    sessionStorage.removeItem(adminSessionKey);
    loginPanel.hidden = false;
    workspace.hidden = true;
    logoutButton.hidden = true;
    loginMessage.textContent = error.message || "後台資料載入失敗。";
  }
}

async function verifyAdminPassword() {
  const response = await fetch("/api/auth", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminPassword}`,
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || "管理密碼驗證失敗。");
  return result;
}

async function loadData() {
  const response = await fetch("/api/cms", { cache: "no-store" });
  if (!response.ok) throw new Error("無法讀取後台資料。");
  const data = await response.json();

  state.products = Array.isArray(data.products) ? data.products : [];
  state.offers = Array.isArray(data.offers) ? data.offers : [];
  state.knowledge = Array.isArray(data.knowledge) ? data.knowledge : [];
  state.storageConfigured = Boolean(data.storageConfigured);
  state.source = data.source || "seed";

  selected.products = state.products[0]?.id || null;
  selected.offers = state.offers[0]?.id || null;
  selected.knowledge = state.knowledge[0]?.id || null;

  renderAll();
  setStatus(
    state.storageConfigured
      ? `後台資料已載入。資料來源：${state.source === "blob" ? "已儲存資料" : "初始資料"}。`
      : "目前尚未設定 Vercel Blob，後台可預覽資料，但儲存與圖片上傳需完成 Vercel 環境變數設定。",
    state.storageConfigured ? "success" : "warning",
  );
}

function setActiveTab(type) {
  activeTab = type;
  tabButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.adminTab === type));
  panels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.adminPanel === type));
  renderList(type);
  fillEditor(type);
}

function renderAll() {
  renderList("products");
  renderList("offers");
  renderList("knowledge");
  fillEditor(activeTab);
}

function renderList(type) {
  const list = lists[type];
  if (!list) return;

  const keyword = searches[type]?.value.trim().toLowerCase() || "";
  const items = state[type].filter((item) => getItemTitle(type, item).toLowerCase().includes(keyword));

  list.innerHTML = "";
  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "item-button";
    button.classList.toggle("is-active", selected[type] === item.id);
    button.innerHTML = `
      <strong>${escapeHtml(getItemTitle(type, item))}</strong>
      <small>${escapeHtml(getItemMeta(type, item))}</small>
    `;
    button.addEventListener("click", () => {
      selected[type] = item.id;
      renderList(type);
      fillEditor(type);
    });
    list.appendChild(button);
  });
}

function getItemTitle(type, item) {
  if (type === "products") return item.name || "未命名商品";
  return item.title || "未命名內容";
}

function getItemMeta(type, item) {
  if (type === "products") return [item.brand, item.category, item.status].filter(Boolean).join(" / ");
  if (type === "offers") return [item.series, item.price, item.status].filter(Boolean).join(" / ");
  return [item.type, item.status].filter(Boolean).join(" / ");
}

function fillEditor(type) {
  const form = forms[type];
  if (!form) return;

  const item = state[type].find((entry) => entry.id === selected[type]) || state[type][0] || createDefaultItem(type);
  selected[type] = item.id;

  if (type === "products") fillProductForm(form, item);
  if (type === "offers") fillOfferForm(form, item);
  if (type === "knowledge") fillKnowledgeForm(form, item);
  updatePreview(type, item.image);
}

function fillProductForm(form, item) {
  setValue(form, "id", item.id);
  setValue(form, "name", item.name);
  setValue(form, "brand", item.brand);
  setValue(form, "category", item.category || joinTags(item.categories));
  setValue(form, "status", normalizeStatus(item.status));
  setValue(form, "priority", item.priority || "中");
  setValue(form, "image", item.image);
  setValue(form, "scalp", joinTags(item.scalp));
  setValue(form, "hair", joinTags(item.hair));
  setValue(form, "needs", joinTags(item.needs));
  setValue(form, "variants", formatVariants(item.variants));
  setValue(form, "effect", item.effect);
  setValue(form, "usage", item.usage);
  setValue(form, "caution", item.caution);
  setValue(form, "pitch", item.pitch);
}

function fillOfferForm(form, item) {
  ["id", "series", "title", "priceLabel", "price", "original", "tag", "status", "image", "description"].forEach((name) =>
    setValue(form, name, name === "status" ? normalizeStatus(item[name]) : item[name]),
  );
  setValue(form, "points", joinTags(item.points));
}

function fillKnowledgeForm(form, item) {
  ["id", "type", "title", "status", "image", "linkLabel", "linkUrl", "description"].forEach((name) =>
    setValue(form, name, name === "status" ? normalizeStatus(item[name]) : item[name]),
  );
}

async function saveEditor(type) {
  const form = forms[type];
  const payload = type === "products" ? readProductForm(form) : type === "offers" ? readOfferForm(form) : readKnowledgeForm(form);
  const index = state[type].findIndex((item) => item.id === payload.id);

  if (index >= 0) {
    state[type][index] = payload;
  } else {
    state[type].unshift(payload);
    selected[type] = payload.id;
  }

  renderList(type);
  fillEditor(type);
  await saveAll();
}

function readProductForm(form) {
  const id = getValue(form, "id") || newId("product");
  const category = getValue(form, "category");
  return {
    id,
    row: Number(state.products.find((item) => item.id === id)?.row || state.products.length + 3),
    name: getValue(form, "name"),
    brand: getValue(form, "brand"),
    image: getValue(form, "image"),
    imageFile: state.products.find((item) => item.id === id)?.imageFile || "",
    categories: splitTags(category),
    category,
    scalp: splitTags(getValue(form, "scalp")),
    hair: splitTags(getValue(form, "hair")),
    effect: getValue(form, "effect"),
    usage: getValue(form, "usage"),
    variants: parseVariants(getValue(form, "variants")),
    status: getValue(form, "status"),
    priority: getValue(form, "priority"),
    needs: splitTags(getValue(form, "needs")),
    caution: getValue(form, "caution"),
    pitch: getValue(form, "pitch"),
  };
}

function readOfferForm(form) {
  return {
    id: getValue(form, "id") || newId("offer"),
    series: getValue(form, "series"),
    title: getValue(form, "title"),
    priceLabel: getValue(form, "priceLabel"),
    price: getValue(form, "price"),
    original: getValue(form, "original"),
    tag: getValue(form, "tag"),
    status: getValue(form, "status"),
    image: getValue(form, "image"),
    imageAlt: getValue(form, "title"),
    description: getValue(form, "description"),
    points: splitTags(getValue(form, "points")),
  };
}

function readKnowledgeForm(form) {
  return {
    id: getValue(form, "id") || newId("knowledge"),
    type: getValue(form, "type"),
    title: getValue(form, "title"),
    status: getValue(form, "status"),
    image: getValue(form, "image"),
    imageAlt: getValue(form, "title"),
    description: getValue(form, "description"),
    linkLabel: getValue(form, "linkLabel"),
    linkUrl: getValue(form, "linkUrl"),
  };
}

function createItem(type) {
  const item = createDefaultItem(type);
  state[type].unshift(item);
  selected[type] = item.id;
  renderList(type);
  fillEditor(type);
}

function createDefaultItem(type) {
  if (type === "products") {
    return {
      id: newId("product"),
      name: "",
      brand: "",
      image: "",
      category: "洗髮精",
      categories: ["洗髮精"],
      scalp: [],
      hair: [],
      effect: "",
      usage: "",
      variants: [],
      status: "上架",
      priority: "中",
      needs: [],
      caution: "",
      pitch: "",
    };
  }

  if (type === "offers") {
    return {
      id: newId("offer"),
      status: "上架",
      series: "",
      title: "",
      priceLabel: "優惠價",
      price: "",
      original: "",
      tag: "本月優惠",
      image: "",
      description: "",
      points: [],
    };
  }

  return {
    id: newId("knowledge"),
    status: "上架",
    type: "美髮知識",
    title: "",
    image: "",
    description: "",
    linkLabel: "",
    linkUrl: "",
  };
}

async function deleteCurrent(type) {
  const id = selected[type];
  if (!id || !confirm("確定要刪除這筆資料嗎？")) return;
  state[type] = state[type].filter((item) => item.id !== id);
  selected[type] = state[type][0]?.id || null;
  renderList(type);
  fillEditor(type);
  await saveAll();
}

async function saveAll() {
  setStatus("正在儲存...");
  const response = await fetch("/api/cms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminPassword}`,
    },
    body: JSON.stringify({
      products: state.products,
      offers: state.offers,
      knowledge: state.knowledge,
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    setStatus(result.message || "儲存失敗。", "warning");
    return;
  }

  state.products = result.products || state.products;
  state.offers = result.offers || state.offers;
  state.knowledge = result.knowledge || state.knowledge;
  setStatus("已儲存，公開網站會讀取最新後台資料。", "success");
}

async function uploadImageForForm(type, file) {
  setStatus("正在上傳圖片...");
  const dataUrl = await fileToDataUrl(file);
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminPassword}`,
    },
    body: JSON.stringify({
      fileName: file.name,
      dataUrl,
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    setStatus(result.message || "圖片上傳失敗。", "warning");
    return;
  }

  setValue(forms[type], "image", result.url);
  updatePreview(type, result.url);
  setStatus("圖片已上傳，記得儲存內容。", "success");
}

function setStatus(message, type = "") {
  if (!statusBar) return;
  statusBar.textContent = message;
  statusBar.className = `status-bar${type ? ` is-${type}` : ""}`;
}

function setValue(form, name, value) {
  const input = form?.elements?.[name];
  if (input) input.value = value || "";
}

function getValue(form, name) {
  return String(form?.elements?.[name]?.value || "").trim();
}

function updatePreview(type, image) {
  const preview = previews[type];
  if (!preview) return;
  if (image) {
    preview.src = image;
  } else {
    preview.removeAttribute("src");
  }
}

function splitTags(value) {
  return String(value || "")
    .split(/[、／/,，;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinTags(value) {
  return Array.isArray(value) ? value.join("／") : value || "";
}

function parseVariants(value) {
  return String(value || "")
    .split(/[;\n]/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [spec, price] = line.split("|").map((part) => part.trim());
      const numericPrice = Number(String(price || "").replace(/[,$]/g, ""));
      return {
        spec: spec || "",
        price: Number.isFinite(numericPrice) && price ? numericPrice : price || "",
      };
    });
}

function formatVariants(variants = []) {
  return variants.map((variant) => `${variant.spec || ""}${variant.price ? ` | ${variant.price}` : ""}`).join("; ");
}

function normalizeStatus(value) {
  return String(value || "上架").includes("下架") ? "下架" : "上架";
}

function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
