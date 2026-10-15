const adminSessionKey = "canbranAdminPassword";
const state = {
  products: [],
  offers: [],
  knowledge: [],
  productDisplay: { featuredIds: [], managerPicks: [] },
  analytics: null,
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
const passwordInput = document.querySelector("#admin-password-input");
const showPasswordCheckbox = document.querySelector("#show-admin-password");
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
const analyticsElements = {
  refresh: document.querySelector("#analytics-refresh"),
  summary: document.querySelector("#analytics-summary"),
  total: document.querySelector("#metric-total"),
  today: document.querySelector("#metric-today"),
  week: document.querySelector("#metric-week"),
  pageList: document.querySelector("#analytics-page-list"),
  dailyBars: document.querySelector("#analytics-daily-bars"),
};
const featuredElements = {
  form: document.querySelector("#featured-editor"),
  search: document.querySelector("#featured-product-search"),
  catalog: document.querySelector("#featured-product-catalog"),
  catalogSummary: document.querySelector("#featured-catalog-summary"),
  selected: document.querySelector("#featured-selected-products"),
  selectionSummary: document.querySelector("#featured-selection-summary"),
  message: document.querySelector("#featured-save-message"),
};
const managerElements = {
  form: document.querySelector("#manager-editor"),
  settings: document.querySelector("#manager-pick-settings"),
  message: document.querySelector("#manager-save-message"),
};
let productDisplayDraft = null;
let savingDisplaySettings = false;

let activeTab = "products";
let adminPassword = sessionStorage.getItem(adminSessionKey) || "";

if (adminPassword) openWorkspace();

showPasswordCheckbox?.addEventListener("change", () => {
  if (!passwordInput) return;
  passwordInput.type = showPasswordCheckbox.checked ? "text" : "password";
});

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

analyticsElements.refresh?.addEventListener("click", () => loadAnalytics());
featuredElements.search?.addEventListener("input", () => renderFeaturedCatalog());
managerElements.settings?.addEventListener("input", () => {
  productDisplayDraft.managerPicks = readManagerPickSettings();
  managerElements.message.textContent = "有尚未儲存的調整，請按「儲存店長推薦」。";
});
featuredElements.form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  await saveDisplaySettings("featured");
});
managerElements.form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  await saveDisplaySettings("manager");
});

async function saveDisplaySettings(type) {
  const isManager = type === "manager";
  const elements = isManager ? managerElements : featuredElements;
  const label = isManager ? "店長推薦" : "熱門髮品";
  if (savingDisplaySettings) {
    elements.message.textContent = "其他設定正在儲存，請稍後再試。";
    return;
  }
  const key = isManager ? "managerPicks" : "featuredIds";
  const settings = isManager
    ? readManagerPickSettings().filter((pick) => pick.productId)
    : [...productDisplayDraft.featuredIds];
  if (isManager && new Set(settings.map((pick) => pick.productId)).size !== settings.length) {
    elements.message.textContent = "店長推薦請選擇不同商品，避免重複展示。";
    return;
  }

  const submit = elements.form.querySelector('[type="submit"]');
  const previous = state.productDisplay;
  state.productDisplay = { ...state.productDisplay, [key]: settings };
  savingDisplaySettings = true;
  submit.disabled = true;
  elements.message.textContent = `正在儲存${label}...`;
  const saved = await saveAll();
  savingDisplaySettings = false;
  submit.disabled = false;
  if (saved) {
    productDisplayDraft[key] = structuredClone(state.productDisplay[key]);
    if (isManager) renderManagerEditor();
    else renderFeaturedEditor();
    elements.message.textContent = `已儲存，前台${label}將依照這份清單顯示。`;
  } else {
    state.productDisplay = previous;
    elements.message.textContent = "儲存未完成，設定仍保留在此頁，請稍後再試。";
  }
}

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
  state.productDisplay = data.productDisplay || { featuredIds: [], managerPicks: [] };
  productDisplayDraft = structuredClone(state.productDisplay);
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
  if (type === "featured") {
    renderFeaturedEditor();
    return;
  }
  if (type === "manager") {
    renderManagerEditor();
    return;
  }
  if (type === "analytics") {
    renderAnalytics();
    loadAnalytics();
    return;
  }
  renderList(type);
  fillEditor(type);
}

function renderAll() {
  renderList("products");
  renderList("offers");
  renderList("knowledge");
  renderAnalytics();
  if (activeTab === "featured") renderFeaturedEditor();
  else if (activeTab === "manager") renderManagerEditor();
  else fillEditor(activeTab);
}

function readManagerPickSettings() {
  return Array.from({ length: 3 }, (_, index) => ({
    productId: getValue(managerElements.form, `managerProduct${index}`),
    displayName: getValue(managerElements.form, `managerName${index}`),
    badge: getValue(managerElements.form, `managerBadge${index}`),
  }));
}

function markFeaturedChanged() {
  featuredElements.message.textContent = "有尚未儲存的調整，請按「儲存熱門髮品」。";
}

function renderFeaturedEditor() {
  if (!featuredElements.form) return;
  productDisplayDraft ??= structuredClone(state.productDisplay);
  renderFeaturedCatalog();
  renderFeaturedSelection();
}

function renderManagerEditor() {
  if (!managerElements.form) return;
  productDisplayDraft ??= structuredClone(state.productDisplay);
  const liveProducts = state.products.filter((item) => normalizeStatus(item.status) === "上架");
  managerElements.settings.innerHTML = "";
  for (let index = 0; index < 3; index += 1) {
    const pick = productDisplayDraft.managerPicks[index] || {};
    const fieldset = document.createElement("fieldset");
    fieldset.className = "manager-setting";
    const unavailable = pick.productId && !liveProducts.some((product) => product.id === pick.productId)
      ? `<option value="${escapeHtml(pick.productId)}">${escapeHtml(state.products.find((product) => product.id === pick.productId)?.name || "已移除的商品")}（未上架）</option>`
      : "";
    fieldset.innerHTML = `
      <legend>第 ${index + 1} 席</legend>
      <label>推薦商品<select name="managerProduct${index}" aria-label="第 ${index + 1} 席推薦商品">
        <option value="">不顯示</option>
        ${unavailable}
        ${liveProducts.map((product) => `<option value="${escapeHtml(product.id)}">${escapeHtml(product.name)}</option>`).join("")}
      </select></label>
      <label>顯示名稱（選填）<input name="managerName${index}" aria-label="第 ${index + 1} 席顯示名稱" placeholder="留空則使用商品名稱" /></label>
      <label>推薦標籤（選填）<input name="managerBadge${index}" aria-label="第 ${index + 1} 席推薦標籤" placeholder="例如：免沖洗保濕" /></label>
    `;
    managerElements.settings.appendChild(fieldset);
    setValue(managerElements.form, `managerProduct${index}`, pick.productId);
    setValue(managerElements.form, `managerName${index}`, pick.displayName);
    setValue(managerElements.form, `managerBadge${index}`, pick.badge);
  }
}

function renderFeaturedCatalog() {
  if (!featuredElements.catalog || !productDisplayDraft) return;
  const keyword = featuredElements.search.value.trim().toLocaleLowerCase("zh-TW");
  const matches = state.products.filter((product) =>
    normalizeStatus(product.status) === "上架" &&
    [product.name, product.brand, product.category].join(" ").toLocaleLowerCase("zh-TW").includes(keyword),
  );
  featuredElements.catalogSummary.textContent = matches.length > 8
    ? `找到 ${matches.length} 筆上架商品，目前顯示前 8 筆，可輸入關鍵字縮小範圍。`
    : `找到 ${matches.length} 筆上架商品。`;
  featuredElements.catalog.innerHTML = "";
  if (!matches.length) {
    featuredElements.catalog.innerHTML = '<p class="empty-state">沒有符合的上架商品，請換個關鍵字。</p>';
  }
  matches.slice(0, 8).forEach((product) => {
    const row = createFeaturedProductRow(product);
    const button = document.createElement("button");
    button.type = "button";
    button.disabled = productDisplayDraft.featuredIds.includes(product.id);
    button.textContent = button.disabled ? "已加入" : "加入";
    button.setAttribute("aria-label", `加入${product.name}到熱門髮品`);
    button.addEventListener("click", () => {
      if (!productDisplayDraft.featuredIds.includes(product.id)) productDisplayDraft.featuredIds.push(product.id);
      renderFeaturedCatalog();
      renderFeaturedSelection();
      markFeaturedChanged();
    });
    row.appendChild(button);
    featuredElements.catalog.appendChild(row);
  });
}

function createFeaturedProductRow(product, tagName = "div", index) {
  const row = document.createElement(tagName);
  row.className = "featured-product-row";
  row.innerHTML = `
    ${product.image ? `<img src="${escapeHtml(product.image)}" alt="" loading="lazy" />` : ""}
    <div class="featured-product-info">
      <strong>${index === undefined ? "" : `${index + 1}. `}${escapeHtml(product.name || "已移除的商品")}</strong>
      <small>${escapeHtml([product.brand, product.category, product.status === "下架" ? "已下架，前台不顯示" : ""].filter(Boolean).join(" / "))}</small>
    </div>
  `;
  return row;
}

function renderFeaturedSelection() {
  if (!featuredElements.selected || !productDisplayDraft) return;
  const ids = productDisplayDraft.featuredIds;
  featuredElements.selectionSummary.textContent = ids.length
    ? `已選 ${ids.length} 項，前台將依下方順序顯示；已下架或移除的商品會自動略過。`
    : "尚未選擇展示商品，儲存後前台將僅提供商品快搜。";
  featuredElements.selected.innerHTML = "";
  ids.forEach((id, index) => {
    const product = state.products.find((item) => item.id === id) || { id, status: "下架" };
    const row = createFeaturedProductRow(product, "li", index);
    const actions = document.createElement("div");
    actions.className = "featured-row-actions";
    for (const [label, offset] of [["上移", -1], ["下移", 1], ["移除", 0]]) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = offset ? "ghost-button" : "danger-button";
      button.textContent = label;
      button.setAttribute("aria-label", `${label}${product.name || "已移除的商品"}`);
      button.disabled = (offset < 0 && index === 0) || (offset > 0 && index === ids.length - 1);
      button.addEventListener("click", () => {
        if (offset) [ids[index], ids[index + offset]] = [ids[index + offset], ids[index]];
        else ids.splice(index, 1);
        renderFeaturedCatalog();
        renderFeaturedSelection();
        markFeaturedChanged();
      });
      actions.appendChild(button);
    }
    if (product.name) {
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "ghost-button";
      edit.textContent = "編輯商品";
      edit.setAttribute("aria-label", `編輯${product.name}`);
      edit.addEventListener("click", () => {
        selected.products = id;
        setActiveTab("products");
      });
      actions.appendChild(edit);
    }
    row.appendChild(actions);
    featuredElements.selected.appendChild(row);
  });
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
  try {
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
        productDisplay: state.productDisplay,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus(result.message || "儲存失敗。", "warning");
      return false;
    }

    state.products = result.products || state.products;
    state.offers = result.offers || state.offers;
    state.knowledge = result.knowledge || state.knowledge;
    state.productDisplay = result.productDisplay || state.productDisplay;
    setStatus("已儲存，公開網站會讀取最新後台資料。", "success");
    return true;
  } catch {
    setStatus("連線失敗，資料尚未儲存，請稍後再試。", "warning");
    return false;
  }
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

async function loadAnalytics() {
  if (!adminPassword) return;
  if (analyticsElements.summary) analyticsElements.summary.textContent = "正在載入瀏覽數據...";

  try {
    const response = await fetch("/api/analytics", {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${adminPassword}`,
      },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "無法讀取數據分析。");
    state.analytics = result.analytics || null;
    renderAnalytics();
  } catch (error) {
    if (analyticsElements.summary) analyticsElements.summary.textContent = error.message || "數據分析載入失敗。";
  }
}

function renderAnalytics() {
  const analytics = state.analytics;
  if (!analytics) {
    setMetricValue("total", 0);
    setMetricValue("today", 0);
    setMetricValue("week", 0);
    if (analyticsElements.summary) analyticsElements.summary.textContent = "切換到此分頁後會載入最新瀏覽數據。";
    if (analyticsElements.pageList) analyticsElements.pageList.innerHTML = "";
    if (analyticsElements.dailyBars) analyticsElements.dailyBars.innerHTML = "";
    return;
  }

  setMetricValue("total", analytics.totalViews);
  setMetricValue("today", analytics.todayViews);
  setMetricValue("week", analytics.last7Views);

  if (analyticsElements.summary) {
    analyticsElements.summary.textContent = analytics.storageConfigured
      ? `資料更新時間：${formatDateTime(analytics.updatedAt)}`
      : "尚未設定 Vercel Blob，無法累計正式瀏覽數據。";
  }

  renderAnalyticsPages(analytics.pages || []);
  renderAnalyticsDailyBars(analytics.daily || []);
}

function renderAnalyticsPages(pages) {
  if (!analyticsElements.pageList) return;
  analyticsElements.pageList.innerHTML = "";
  const visiblePages = pages.filter((page) => Number(page.total || 0) > 0);

  if (!visiblePages.length) {
    analyticsElements.pageList.innerHTML = '<p class="empty-state">目前尚未累計分頁瀏覽。</p>';
    return;
  }

  visiblePages.forEach((page) => {
    const row = document.createElement("div");
    row.className = "analytics-row";
    row.innerHTML = `
      <span>
        <strong>${escapeHtml(page.label)}</strong>
        <small>今日 ${formatNumber(page.today)}／近 7 天 ${formatNumber(page.last7)}</small>
      </span>
      <b>${formatNumber(page.total)}</b>
    `;
    analyticsElements.pageList.appendChild(row);
  });
}

function renderAnalyticsDailyBars(days) {
  if (!analyticsElements.dailyBars) return;
  analyticsElements.dailyBars.innerHTML = "";
  const maxViews = Math.max(...days.map((day) => Number(day.views || 0)), 1);

  days.forEach((day) => {
    const views = Number(day.views || 0);
    const row = document.createElement("div");
    row.className = "analytics-bar-row";
    row.innerHTML = `
      <span>${escapeHtml(formatDateLabel(day.date))}</span>
      <div class="analytics-bar-track"><i style="width: ${Math.max(5, (views / maxViews) * 100)}%"></i></div>
      <b>${formatNumber(views)}</b>
    `;
    analyticsElements.dailyBars.appendChild(row);
  });
}

function setMetricValue(key, value) {
  const element = analyticsElements[key];
  if (element) element.textContent = formatNumber(value);
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("zh-TW");
}

function formatDateTime(value) {
  if (!value) return "尚未更新";
  try {
    return new Intl.DateTimeFormat("zh-TW", {
      timeZone: "Asia/Taipei",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatDateLabel(value) {
  if (!value) return "";
  const [, month, day] = String(value).split("-");
  return `${month}/${day}`;
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
