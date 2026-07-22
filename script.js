const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const pagePanels = Array.from(document.querySelectorAll("[data-page]"));
const pageLinks = Array.from(document.querySelectorAll("[data-page-link]"));
const heroActionLinks = Array.from(document.querySelectorAll(".hero-actions [data-page-link]"));
const advisorLineLink = document.querySelector("#advisor-line-link");
const lineOfficialId = "@vox3002e";

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const pageAliases = {
  top: "home",
  line: "stores",
};

function getPageName(value) {
  const normalized = String(value || "home").replace(/^#/, "");
  return pageAliases[normalized] || normalized || "home";
}

function getPageFromLocation() {
  return getPageName(decodeURIComponent(window.location.hash || "#home"));
}

function closeMobileNav() {
  if (!siteNav || !navToggle) return;
  siteNav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
}

function showPage(pageName, options = {}) {
  if (!pagePanels.length) return;

  const requestedPage = getPageName(pageName);
  const activePage = pagePanels.some((panel) => panel.dataset.page === requestedPage) ? requestedPage : "home";
  const isCompactViewport = window.matchMedia("(max-width: 640px)").matches;

  pagePanels.forEach((panel) => {
    panel.hidden = panel.dataset.page !== activePage;
  });

  document.body.dataset.activePage = activePage;

  pageLinks.forEach((link) => {
    const isActive = getPageName(link.dataset.pageLink) === activePage;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  updateHeroActionState(activePage);

  if (options.updateUrl) {
    try {
      if (window.location.hash !== `#${activePage}`) {
        history.pushState({ page: activePage }, "", `#${activePage}`);
      }
    } catch {
      window.location.hash = activePage;
    }
  }

  if (options.scrollToTop) {
    scrollToPageStart(activePage, isCompactViewport);
  }
}

function scrollToPageStart(activePage, isCompactViewport) {
  const firstPanel = pagePanels.find((panel) => panel.dataset.page === activePage && !panel.hidden);
  const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
  const behavior = isCompactViewport ? "auto" : "smooth";

  window.requestAnimationFrame(() => {
    if (!firstPanel || activePage === "home") {
      window.scrollTo({ top: 0, behavior });
      return;
    }

    const targetTop = Math.max(0, window.scrollY + firstPanel.getBoundingClientRect().top - headerHeight - 4);
    window.scrollTo({ top: targetTop, behavior });
  });
}

pageLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const isHeroAction = Boolean(link.closest(".hero-actions"));

    if (isHeroAction) {
      updateHeroActionState(link.dataset.pageLink);
      link.classList.add("is-pressed");
      window.setTimeout(() => {
        showPage(link.dataset.pageLink, { updateUrl: true, scrollToTop: true });
        link.classList.remove("is-pressed");
        closeMobileNav();
      }, 120);
      return;
    }

    showPage(link.dataset.pageLink, { updateUrl: true, scrollToTop: true });
    closeMobileNav();
  });
});

function updateHeroActionState(pageName) {
  if (!heroActionLinks.length) return;

  const activePage = getPageName(pageName);
  const hasHeroSelection = heroActionLinks.some((link) => getPageName(link.dataset.pageLink) === activePage);

  heroActionLinks.forEach((link) => {
    const isSelected = getPageName(link.dataset.pageLink) === activePage;
    link.classList.toggle("is-selected", isSelected);
    link.closest(".hero-actions")?.classList.toggle("has-selection", hasHeroSelection);
  });
}

window.addEventListener("popstate", () => {
  showPage(getPageFromLocation(), { scrollToTop: true });
});

window.addEventListener("hashchange", () => {
  showPage(getPageFromLocation(), { scrollToTop: true });
});

showPage(getPageFromLocation());

const advisorState = {
  scalp: "normal",
  chemical: "none",
  damage: "medium",
  goal: "repair",
  hair: "dry",
  wash: "daily",
  routine: "simple",
  preference: "quick",
};

const recommendations = {
  sensitive: {
    title: "頭皮舒緩觀察 + 輕量髮尾修護",
    copy: "你的回答偏向頭皮需要溫和照護。建議先以頭皮舒適為優先，避免過度清潔或太刺激的清涼感，髮尾乾燥再另外補充少量修護。",
    products: ["主方向：溫和清潔、降低頭皮負擔", "搭配建議：髮尾可少量使用超柔細順髮凝露或 ICS 修護油", "提醒：若有持續紅癢、刺痛或明顯脫屑，建議先詢問專業人員"],
  },
  dandruff: {
    title: "頭皮屑狀況確認 + 清潔方式調整",
    copy: "你的回答提到頭皮屑困擾。頭皮屑可能和乾燥、出油悶熱、清潔殘留或頭皮敏感有關，建議先確認出現時機與頭皮感受，再選擇清潔強度。",
    products: ["主方向：先分辨乾燥型或出油悶熱型頭皮屑", "搭配建議：護髮產品避開頭皮，只放髮中至髮尾", "提醒：若有紅腫、刺痛、結痂或大量脫屑，請先透過 LINE 讓專人協助確認"],
  },
  scalpCare: {
    title: "清爽頭皮 + 輕盈髮尾護理",
    copy: "你的回答偏向頭皮出油、悶熱或殘留感。建議先把頭皮清潔做好，護髮則集中在髮中至髮尾，避免讓髮根更容易扁塌。",
    products: ["主推薦：茶樹洗髮精或 IAU 茄紅素洗護組", "搭配建議：髮尾乾燥時少量使用超柔細順髮凝露", "使用順序：頭皮清潔 -> 髮尾輕量護理 -> 吹乾髮根"],
  },
  colorCare: {
    title: "染後護色 + 修護補水",
    copy: "你的回答偏向染後或補色需求。建議以護色清潔搭配髮尾修護，降低褪色感，同時補足染後容易出現的乾燥與光澤不足。",
    products: ["主推薦：EDOL 煥然補色洗髮精，依髮色選粉紅、銀色或紫色系", "搭配建議：米胚芽修護霜加強染後乾燥髮尾", "注意事項：水溫不要過高，減少高溫吹整與日曬造成的褪色"],
  },
  repair: {
    title: "修護柔順型洗護建議",
    copy: "你的回答偏向乾燥、染燙後或髮尾粗糙。建議先建立基礎修護，再用免沖洗護理加強髮中至髮尾，讓髮絲比較好梳理、有光澤。",
    products: ["主推薦：米胚芽修護霜", "搭配建議：ICS 修護油加強髮尾光澤與柔順", "使用順序：洗髮 -> 修護霜停留沖淨 -> 吹乾前後少量護理髮尾"],
  },
  smooth: {
    title: "柔順抗毛躁 + 髮尾滑順整理",
    copy: "你的回答偏向毛躁、打結或自然捲整理需求。建議把保濕修護放在髮中至髮尾，吹整前後搭配柔順型產品，降低蓬亂與摩擦感。",
    products: ["主推薦：超柔細順髮凝露", "搭配建議：米胚芽修護霜作為洗後修護基底", "使用順序：護髮後吹至半乾 -> 少量凝露整理髮尾與毛躁處"],
  },
  volume: {
    title: "蓬鬆清爽 + 輕量保養",
    copy: "你的回答偏向細軟、扁塌或容易出油。建議洗髮以頭皮清爽為主，護髮和免沖洗產品都少量放在髮尾，保留髮根的空氣感。",
    products: ["主推薦：茶樹洗髮精", "搭配建議：超柔細順髮凝露只用少量在髮尾", "使用重點：吹乾時先吹髮根，避免厚重護理品靠近頭皮"],
  },
  shine: {
    title: "亮澤保濕 + 日常光感維持",
    copy: "你的回答偏向想提升柔順與光澤。建議選擇保濕修護搭配少量光澤型免沖洗產品，讓髮絲看起來更乾淨、有質感。",
    products: ["主推薦：米胚芽修護霜", "搭配建議：ICS 修護油少量加在髮尾提升光澤", "使用重點：少量多次，避免一次用太多造成厚重感"],
  },
};

const titleEl = document.querySelector("#recommend-title");
const copyEl = document.querySelector("#recommend-copy");

document.querySelectorAll(".choice-row").forEach((row) => {
  row.addEventListener("click", (event) => {
    const button = event.target.closest(".choice");
    if (!button) return;

    row.querySelectorAll(".choice").forEach((choice) => choice.classList.remove("is-active"));
    button.classList.add("is-active");
    advisorState[row.dataset.question] = button.dataset.value;
    updateRecommendation();
  });
});

function updateRecommendation() {
  const base = getBaseRecommendation();
  const modifiers = getRecommendationModifiers().slice(0, 5);
  const resultCopy = [base.copy, ...modifiers].join(" ");

  if (titleEl) titleEl.textContent = base.title;
  if (copyEl) copyEl.textContent = resultCopy;
  renderProducts(base.products);
  updateAdvisorLineLink(base, modifiers);
}

function getBaseRecommendation() {
  const scores = {
    sensitive: 0,
    dandruff: 0,
    scalpCare: 0,
    colorCare: 0,
    repair: 1,
    smooth: 0,
    volume: 0,
    shine: 0,
  };

  if (advisorState.scalp === "sensitive" || advisorState.scalp === "dry") scores.sensitive += 5;
  if (advisorState.scalp === "dandruff") scores.dandruff += 6;
  if (advisorState.scalp === "oily" || advisorState.scalp === "buildup") scores.scalpCare += 5;

  if (advisorState.hair === "fine") scores.volume += 4;
  if (advisorState.hair === "dry") {
    scores.repair += 3;
    scores.shine += 2;
  }
  if (advisorState.hair === "coarse" || advisorState.hair === "frizzy" || advisorState.hair === "tangle") {
    scores.smooth += 4;
    scores.repair += 2;
  }

  if (advisorState.chemical === "colored" || advisorState.chemical === "tone") scores.colorCare += 5;
  if (advisorState.chemical === "bleached") {
    scores.colorCare += 2;
    scores.repair += 5;
  }
  if (advisorState.chemical === "permed" || advisorState.chemical === "straightened") scores.repair += 4;

  if (advisorState.damage === "high" || advisorState.damage === "split") scores.repair += 5;
  if (advisorState.damage === "medium") scores.repair += 2;
  if (advisorState.damage === "healthy") scores.shine += 2;

  if (advisorState.goal === "scalpCare") scores.scalpCare += 6;
  if (advisorState.goal === "colorCare") scores.colorCare += 6;
  if (advisorState.goal === "repair") scores.repair += 6;
  if (advisorState.goal === "smooth") scores.smooth += 6;
  if (advisorState.goal === "volume") scores.volume += 6;
  if (advisorState.goal === "shine") scores.shine += 6;

  if (advisorState.wash === "sweat") scores.scalpCare += 2;
  if (advisorState.wash === "dryLess") scores.sensitive += 2;
  if (advisorState.routine === "heat") scores.repair += 2;
  if (advisorState.routine === "outdoor") scores.colorCare += 1;
  if (advisorState.preference === "lightweight") scores.volume += 2;
  if (advisorState.preference === "intensive") scores.repair += 2;

  let bestKey = "repair";
  Object.entries(scores).forEach(([key, score]) => {
    if (score > scores[bestKey]) bestKey = key;
  });

  return recommendations[bestKey];
}

function getRecommendationModifiers() {
  const modifiers = [];

  if (advisorState.scalp === "dry") modifiers.push("頭皮偏乾時，洗髮水溫不要太高，清潔力也不宜過強。");
  if (advisorState.scalp === "sensitive") modifiers.push("敏感頭皮建議先降低產品更換頻率，避免同時嘗試太多新產品。");
  if (advisorState.scalp === "dandruff") modifiers.push("頭皮屑若伴隨紅癢或刺痛，建議先暫停刺激性產品並尋求專業確認。");
  if (advisorState.hair === "fine") modifiers.push("細軟髮要避開厚重護理，護髮和精華都以髮尾少量為主。");
  if (advisorState.hair === "coarse") modifiers.push("粗硬髮可加強髮中至髮尾的保濕，提升服貼與滑順感。");
  if (advisorState.hair === "frizzy") modifiers.push("自然捲或毛躁髮建議用保濕加柔順整理，減少吹整後的蓬亂。");
  if (advisorState.hair === "tangle") modifiers.push("髮尾容易打結時，先補足潤澤度，再用免沖洗產品降低摩擦。");
  if (advisorState.chemical === "colored") modifiers.push("染後髮建議搭配護色清潔，並減少高溫吹整造成的褪色。");
  if (advisorState.chemical === "bleached") modifiers.push("漂後髮質通常更需要修護與保濕，梳理時要避免拉扯。");
  if (advisorState.chemical === "permed") modifiers.push("燙後髮可把護理重點放在彈性、光澤與髮尾柔順。");
  if (advisorState.chemical === "straightened") modifiers.push("離子燙後可加強光澤與髮尾保濕，維持直順感。");
  if (advisorState.damage === "high" || advisorState.damage === "split") modifiers.push("明顯受損或分岔時，建議每週加入一次加強護理，日常也要減少熱工具傷害。");
  if (advisorState.wash === "daily") modifiers.push("每天洗髮時，護髮產品更要避開頭皮，避免累積厚重感。");
  if (advisorState.wash === "sweat") modifiers.push("常流汗或悶熱時，頭皮清潔與確實吹乾髮根會比厚重護理更重要。");
  if (advisorState.routine === "styling") modifiers.push("常用造型品時，建議定期確認清潔是否足夠，避免殘留影響蓬鬆。");
  if (advisorState.routine === "heat") modifiers.push("常吹整或使用電棒時，吹整前後的髮尾防護會是保養重點。");
  if (advisorState.routine === "outdoor") modifiers.push("常日曬或戶外活動時，染後髮更要留意護色與乾燥問題。");
  if (advisorState.preference === "quick") modifiers.push("若想簡單保養，可先固定一款適合洗髮精，再搭配一款髮尾護理。");
  if (advisorState.preference === "intensive") modifiers.push("若願意完整護理，可以用洗髮、沖洗式護理、免沖洗修護三步驟建立穩定髮況。");
  if (advisorState.preference === "lightweight") modifiers.push("喜歡輕盈感時，所有護理產品都建議少量多次，先從髮尾開始。");

  return modifiers;
}

function renderProducts(products) {
  const productList = document.querySelector("#recommend-products");
  if (!productList) return;
  productList.innerHTML = "";
  products.forEach((product) => {
    const item = document.createElement("li");
    item.textContent = product;
    productList.appendChild(item);
  });
}

function updateAdvisorLineLink(base, modifiers) {
  if (!advisorLineLink || !base) return;

  const selectedAnswers = getAdvisorAnswerSummary();
  const selectedLines = selectedAnswers.map(({ label, value }) => `${label}：${value}`);
  const analysisLines = [base.copy, ...modifiers.slice(0, 2)].filter(Boolean);
  const productLines = base.products.map((product) => `・${product}`);
  const message = [
    "您好，我已完成肯邦屋 AI 髮品診斷，想請專人協助確認。",
    "",
    "我的髮況：",
    ...selectedLines.map((line) => `・${line}`),
    "",
    `推薦方向：${base.title}`,
    "",
    "結果分析：",
    ...analysisLines,
    "",
    "建議商品與使用方式：",
    ...productLines,
    "",
    "想請協助確認是否適合我，謝謝。",
  ].join("\n");

  advisorLineLink.href = `https://line.me/R/oaMessage/${encodeURIComponent(lineOfficialId)}/?${encodeURIComponent(message)}`;
  advisorLineLink.dataset.advisorMessage = message;
}

function getAdvisorAnswerSummary() {
  return Array.from(document.querySelectorAll(".choice-row")).map((row) => {
    const label = row.closest(".question-group")?.querySelector(".question-label")?.textContent?.trim() || "選項";
    const activeChoice = row.querySelector(".choice.is-active");
    const value = activeChoice?.textContent?.trim() || "";
    return { label, value };
  });
}

if (advisorLineLink) {
  advisorLineLink.addEventListener("click", () => {
    const message = advisorLineLink.dataset.advisorMessage;
    if (!message || !navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(message).catch(() => {});
  });
}

updateRecommendation();

const advisorPresets = {
  dry: {
    hair: "dry",
    damage: "medium",
    goal: "repair",
    preference: "balanced",
  },
  damage: {
    chemical: "permed",
    damage: "high",
    goal: "repair",
    preference: "intensive",
  },
  oily: {
    scalp: "oily",
    goal: "scalpCare",
    wash: "daily",
    preference: "lightweight",
  },
  fine: {
    hair: "fine",
    goal: "volume",
    scalp: "oily",
    preference: "lightweight",
  },
  shine: {
    hair: "normal",
    damage: "healthy",
    goal: "shine",
    preference: "balanced",
  },
  tangle: {
    hair: "tangle",
    damage: "medium",
    goal: "smooth",
    preference: "balanced",
  },
};

document.querySelectorAll("[data-advisor-preset]").forEach((button) => {
  button.addEventListener("click", () => {
    applyAdvisorPreset(button.dataset.advisorPreset);
    showPage("advisor", { updateUrl: true, scrollToTop: true });
  });
});

function applyAdvisorPreset(presetName) {
  const preset = advisorPresets[presetName];
  if (!preset) return;

  Object.entries(preset).forEach(([question, value]) => {
    advisorState[question] = value;
    const row = document.querySelector(`.choice-row[data-question="${question}"]`);
    if (!row) return;

    row.querySelectorAll(".choice").forEach((choice) => {
      const isActive = choice.dataset.value === value;
      choice.classList.toggle("is-active", isActive);
    });
  });

  updateRecommendation();
}

const adminStorageKey = "canbranAdminProducts";
const productForm = document.querySelector("#product-form");
const productAdminList = document.querySelector("#product-admin-list");

const defaultAdminProducts = [
  {
    id: "ics-oil",
    name: "LebeL ICS 修護油",
    category: "修護護理",
    status: "上架中",
    description: "適合燙後、毛躁與髮尾乾燥。",
  },
  {
    id: "iau-lycomint",
    name: "IAU 茄紅素洗護組",
    category: "頭皮管理",
    status: "上架中",
    description: "適合頭皮出油、悶熱與髮根扁塌。",
  },
  {
    id: "edol-color",
    name: "EDOL 煥然補色洗髮精",
    category: "染後護色",
    status: "上架中",
    description: "適合染後補色與維持透明感。",
  },
];

let adminProducts = loadAdminProducts();

if (productForm && productAdminList) {
  renderAdminProducts();

  productForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(productForm);
    const name = String(formData.get("name") || "").trim();
    if (!name) return;

    adminProducts.unshift({
      id: `product-${Date.now()}`,
      name,
      category: String(formData.get("category") || "修護護理"),
      status: String(formData.get("status") || "上架中"),
      description: String(formData.get("description") || "").trim(),
    });

    saveAdminProducts();
    renderAdminProducts();
    productForm.reset();
  });

  productAdminList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-admin-action]");
    if (!button) return;

    const id = button.dataset.productId;
    if (button.dataset.adminAction === "toggle") {
      adminProducts = adminProducts.map((product) =>
        product.id === id
          ? { ...product, status: product.status === "上架中" ? "下架" : "上架中" }
          : product,
      );
    }

    if (button.dataset.adminAction === "delete") {
      adminProducts = adminProducts.filter((product) => product.id !== id);
    }

    saveAdminProducts();
    renderAdminProducts();
  });
}

function loadAdminProducts() {
  try {
    const saved = localStorage.getItem(adminStorageKey);
    return saved ? JSON.parse(saved) : defaultAdminProducts;
  } catch {
    return defaultAdminProducts;
  }
}

function saveAdminProducts() {
  try {
    localStorage.setItem(adminStorageKey, JSON.stringify(adminProducts));
  } catch {
    // Local storage may be unavailable in private or restricted browser modes.
  }
}

function renderAdminProducts() {
  productAdminList.innerHTML = "";

  adminProducts.forEach((product) => {
    const row = document.createElement("div");
    row.className = "admin-row";
    row.innerHTML = `
      <span class="admin-product-name">
        <strong>${escapeHtml(product.name)}</strong>
        <small>${escapeHtml(product.description || "尚未填寫商品說明")}</small>
      </span>
      <span>${escapeHtml(product.category)}</span>
      <span class="pill ${product.status === "上架中" ? "live" : "draft"}">${escapeHtml(product.status)}</span>
      <span class="admin-actions">
        <button class="admin-action" type="button" data-admin-action="toggle" data-product-id="${product.id}">
          ${product.status === "上架中" ? "下架" : "上架"}
        </button>
        <button class="admin-action danger" type="button" data-admin-action="delete" data-product-id="${product.id}">
          刪除
        </button>
      </span>
    `;
    productAdminList.appendChild(row);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
