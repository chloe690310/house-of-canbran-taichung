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

showPage(getPageFromLocation(), { scrollToTop: true });

window.addEventListener("load", () => {
  showPage(getPageFromLocation(), { scrollToTop: true });
});

const advisorState = {
  intent: "shampoo",
  scalp: "normal",
  chemical: "none",
  damage: "healthy",
  goal: "scalpCare",
  hair: "normal",
  styleEffect: "clean",
  toolPurpose: "detangle",
  wash: "daily",
  routine: "simple",
  preference: "quick",
};

let productCatalog = Array.isArray(window.CANBRAN_PRODUCTS)
  ? window.CANBRAN_PRODUCTS.filter((product) => product.status === "上架")
  : [];

const supplementalKnowledgeArticles = [
  {
    id: "knowledge-scalp-care",
    status: "上架",
    type: "頭皮養護",
    title: "頭皮保養從清潔、舒緩與適度保濕開始",
    image: "assets/knowledge-scalp-care-card.jpg",
    imageAlt: "清新檯面上的頭皮按摩刷、毛巾與保養用品",
    description:
      "頭皮和臉部肌膚一樣會受出油、汗水、造型品殘留與乾燥影響。日常可依頭皮狀況選擇清潔頻率，洗髮時以指腹輕柔按摩，避免過度抓搔；若持續紅癢、刺痛或大量脫屑，建議先詢問專業人員。",
    linkLabel: "參考 AAD 頭皮洗護建議",
    linkUrl: "https://www.aad.org/public/everyday-care/hair-scalp-care/hair/healthy-hair-tips",
  },
  {
    id: "knowledge-growth-cycle",
    status: "上架",
    type: "頭髮週期",
    title: "頭髮會經歷生長、轉換、休止與自然掉落",
    image: "assets/knowledge-growth-cycle-card.jpg",
    imageAlt: "髮絲與植物以柔和圓形構圖呈現頭髮生長週期",
    description:
      "頭髮不是每一根都同時生長，而是各自進入生長期、轉換期、休止期與掉落階段。每天少量掉髮多半屬於自然代謝；若突然大量掉髮、局部稀疏或伴隨頭皮不適，建議記錄近期作息、壓力與身體變化後再諮詢專業人員。",
    linkLabel: "參考 Cleveland Clinic 生長週期",
    linkUrl: "https://my.clevelandclinic.org/health/diseases/24486-telogen-effluvium",
  },
];

const priorityScore = {
  高: 7,
  中: 4,
  低: 1,
};

const advisorIntentDefaults = {
  shampoo: {
    scalp: "normal",
    hair: "normal",
    chemical: "none",
    damage: "healthy",
    goal: "scalpCare",
    styleEffect: "clean",
    toolPurpose: "detangle",
    wash: "daily",
    routine: "simple",
    preference: "quick",
  },
  conditioner: {
    scalp: "normal",
    hair: "normal",
    chemical: "none",
    damage: "low",
    goal: "smooth",
    styleEffect: "clean",
    toolPurpose: "detangle",
    wash: "twoDays",
    routine: "simple",
    preference: "balanced",
  },
  leaveIn: {
    scalp: "normal",
    hair: "normal",
    chemical: "none",
    damage: "low",
    goal: "smooth",
    styleEffect: "clean",
    toolPurpose: "detangle",
    wash: "twoDays",
    routine: "heat",
    preference: "quick",
  },
  treatment: {
    scalp: "normal",
    hair: "normal",
    chemical: "none",
    damage: "medium",
    goal: "repair",
    styleEffect: "clean",
    toolPurpose: "detangle",
    wash: "twoDays",
    routine: "care",
    preference: "intensive",
  },
  tool: {
    scalp: "normal",
    hair: "normal",
    chemical: "none",
    damage: "healthy",
    goal: "smooth",
    styleEffect: "clean",
    toolPurpose: "detangle",
    wash: "twoDays",
    routine: "styling",
    preference: "quick",
  },
  curlStyling: {
    scalp: "normal",
    hair: "frizzy",
    chemical: "none",
    damage: "low",
    goal: "smooth",
    styleEffect: "naturalCurl",
    toolPurpose: "detangle",
    wash: "twoDays",
    routine: "styling",
    preference: "quick",
  },
  styling: {
    scalp: "normal",
    hair: "normal",
    chemical: "none",
    damage: "healthy",
    goal: "smooth",
    styleEffect: "natural",
    toolPurpose: "detangle",
    wash: "twoDays",
    routine: "styling",
    preference: "quick",
  },
  holdStyling: {
    scalp: "normal",
    hair: "normal",
    chemical: "none",
    damage: "healthy",
    goal: "volume",
    styleEffect: "strongHold",
    toolPurpose: "detangle",
    wash: "twoDays",
    routine: "styling",
    preference: "quick",
  },
  menStyling: {
    scalp: "normal",
    hair: "normal",
    chemical: "none",
    damage: "healthy",
    goal: "volume",
    styleEffect: "clean",
    toolPurpose: "detangle",
    wash: "twoDays",
    routine: "styling",
    preference: "quick",
  },
  scalpCare: {
    scalp: "oily",
    hair: "normal",
    chemical: "none",
    damage: "healthy",
    goal: "scalpCare",
    styleEffect: "clean",
    toolPurpose: "detangle",
    wash: "daily",
    routine: "simple",
    preference: "lightweight",
  },
};

const productTypeConfigs = {
  shampoo: {
    label: "洗髮精",
    recommendation: "scalpCare",
    categories: ["洗髮精"],
  },
  conditioner: {
    label: "潤髮乳",
    recommendation: "smooth",
    categories: ["潤絲"],
  },
  leaveIn: {
    label: "免沖洗保養",
    recommendation: "leaveIn",
    categories: ["免沖洗", "免沖洗補水"],
  },
  treatment: {
    label: "護髮產品",
    recommendation: "repair",
    categories: ["護髮膜"],
  },
  tool: {
    label: "整髮工具",
    recommendation: "styling",
    categories: ["造型工具"],
  },
  curlStyling: {
    label: "捲髮造型品",
    recommendation: "styling",
    categories: ["捲髮造型"],
  },
  styling: {
    label: "整髮造型品",
    recommendation: "styling",
    categories: ["造型", "整髮造型", "打亮造型", "髮根蓬鬆造型", "髮跟蓬鬆造型", "鮑伯髮型"],
  },
  holdStyling: {
    label: "定型產品",
    recommendation: "styling",
    categories: ["定型"],
  },
  menStyling: {
    label: "男士造型品",
    recommendation: "styling",
    categories: ["男士造型"],
  },
  scalpCare: {
    label: "頭皮保養",
    recommendation: "scalpCare",
    categories: ["頭皮保養", "頭皮護理"],
  },
};

const hairCompatibilityRules = {
  fine: {
    tags: ["細軟", "髮質缺乏彈性", "髮量感不足"],
    conflicts: ["粗硬", "自然捲", "髮質亂翹"],
  },
  coarse: {
    tags: ["粗硬"],
    conflicts: ["細軟", "髮質缺乏彈性", "髮量感不足"],
  },
  frizzy: {
    tags: ["自然捲", "髮質亂翹"],
    conflicts: ["細軟", "髮質缺乏彈性", "髮量感不足"],
  },
  normal: {
    tags: ["一般", "中等", "中性", "都適用"],
    conflicts: [],
  },
};

const menStyleEffectConfigs = {
  clean: {
    label: "乾淨俐落",
    keywords: ["乾淨", "俐落", "專業", "紮實", "清爽", "容易沖洗", "水溶性"],
    reason: "適合乾淨俐落的日常造型",
  },
  slick: {
    label: "油頭光澤",
    keywords: ["油頭", "光澤", "削光", "妝感", "完整的妝感", "油分"],
    reason: "適合油頭或帶光澤的俐落造型",
  },
  strongHold: {
    label: "固定力強",
    keywords: ["強膠", "支撐", "固定", "定型", "持續", "強烈", "控制", "塑型力"],
    reason: "加強固定力與長時間支撐",
  },
  matteTexture: {
    label: "霧面線條",
    keywords: ["霧面", "低光", "線條", "質地", "粗糙", "黏土", "髮蠟"],
    reason: "適合霧面線條與自然束感",
  },
  volume: {
    label: "蓬鬆量感",
    keywords: ["量感", "豐厚", "髮量", "蓬鬆", "3D", "立體", "纖維"],
    reason: "協助增加蓬鬆量感與立體輪廓",
  },
  natural: {
    label: "自然好整理",
    keywords: ["自然", "無重力", "彈性", "重覆塑型", "輕鬆", "不扁塌"],
    reason: "適合自然好整理、可重複塑型的髮感",
  },
  naturalCurl: {
    label: "自然捲度",
    keywords: ["自然", "捲度", "彎度", "均衡", "隨心所願", "光滑捲度"],
    reason: "適合自然、不僵硬的捲度表現",
  },
  elasticCurl: {
    label: "彈力捲度",
    keywords: ["彈性", "彈力", "立體", "明顯", "泡沫雕", "Q彈"],
    reason: "協助捲度更立體有彈性",
  },
  looseCurl: {
    label: "鬆柔空氣感",
    keywords: ["柔軟", "鬆散", "輕柔", "空氣感", "不需噴濕", "粉體"],
    reason: "適合鬆柔、有空氣感的捲髮整理",
  },
  curlHold: {
    label: "捲度持久",
    keywords: ["持久", "記憶", "捲度", "固定", "長時間", "上捲"],
    reason: "加強捲度維持與造型持久度",
  },
  volumeCurl: {
    label: "蓬鬆線條",
    keywords: ["蓬鬆", "線條", "豐盈", "髮量", "髮幹", "鮑伯"],
    reason: "協助捲髮線條更蓬鬆立體",
  },
  frizzControl: {
    label: "修飾毛躁",
    keywords: ["毛躁", "撫平", "滋潤", "柔順", "水分", "飛翹"],
    reason: "協助修飾毛躁與飛翹",
  },
  smoothLine: {
    label: "柔順線條",
    keywords: ["柔順", "滑順", "髮尾", "線條", "自然的髮流", "整齊"],
    reason: "適合柔順線條與乾淨髮流",
  },
  shine: {
    label: "亮澤光感",
    keywords: ["光澤", "亮澤", "打亮", "緞面", "透亮", "閃亮"],
    reason: "提升造型後的亮澤光感",
  },
  softHold: {
    label: "自然定型",
    keywords: ["自然", "柔軟", "輕盈", "不會太硬", "好整理", "溫和"],
    reason: "適合自然、不生硬的定型效果",
  },
  antiHumidity: {
    label: "抗潮持久",
    keywords: ["抗潮", "持久", "長效", "長時間", "不易扁塌", "快乾"],
    reason: "加強抗潮與長時間持久度",
  },
  rootHold: {
    label: "髮根支撐",
    keywords: ["髮根", "豎立", "支撐", "髮量感", "蓬鬆", "長時間"],
    reason: "協助髮根支撐與蓬鬆維持",
  },
};

const toolPurposeConfigs = {
  detangle: {
    label: "梳順打結",
    keywords: ["順通", "梳通", "糾結", "去除", "乾髮", "濕髮"],
    reason: "適合梳順打結與日常整理",
  },
  blowdry: {
    label: "吹整造型",
    keywords: ["吹風", "吹整", "蓄熱", "控制力", "鈦金屬", "造型梳"],
    reason: "適合吹整造型與縮短吹整時間",
  },
  rootVolume: {
    label: "蓬鬆髮根",
    keywords: ["蓬鬆", "髮根", "圓梳", "吹風", "控制力"],
    reason: "協助吹整髮根蓬鬆感",
  },
  curlFinish: {
    label: "整理捲度",
    keywords: ["捲髮", "圓梳", "層次", "線條", "造型"],
    reason: "適合整理捲度、層次與線條",
  },
  scalpMassage: {
    label: "頭皮按摩",
    keywords: ["按摩", "頭皮", "血液循環", "顆粒", "健康"],
    reason: "適合梳理同時做頭皮按摩",
  },
  daily: {
    label: "日常萬用",
    keywords: ["何種髮型", "髮長", "一次滿足", "乾髮", "濕髮", "萬用"],
    reason: "適合日常萬用與多種髮長",
  },
};

const recommendations = {
  sensitive: {
    intent: "sensitive",
    title: "頭皮舒緩觀察 + 輕量髮尾修護",
    copy: "你的回答偏向頭皮需要溫和照護。建議先以頭皮舒適為優先，避免過度清潔或太刺激的清涼感，髮尾乾燥再另外補充少量修護。",
    products: ["主方向：溫和清潔、降低頭皮負擔", "搭配建議：髮尾可少量使用超柔細順髮凝露或 ICS 修護油", "提醒：若有持續紅癢、刺痛或明顯脫屑，建議先詢問專業人員"],
  },
  dandruff: {
    intent: "dandruff",
    title: "頭皮屑狀況確認 + 清潔方式調整",
    copy: "你的回答提到頭皮屑困擾。頭皮屑可能和乾燥、出油悶熱、清潔殘留或頭皮敏感有關，建議先確認出現時機與頭皮感受，再選擇清潔強度。",
    products: ["主方向：先分辨乾燥型或出油悶熱型頭皮屑", "搭配建議：護髮產品避開頭皮，只放髮中至髮尾", "提醒：若有紅腫、刺痛、結痂或大量脫屑，請先透過 LINE 讓專人協助確認"],
  },
  scalpCare: {
    intent: "scalpCare",
    title: "清爽頭皮 + 輕盈髮尾護理",
    copy: "你的回答偏向頭皮出油、悶熱或殘留感。建議先把頭皮清潔做好，護髮則集中在髮中至髮尾，避免讓髮根更容易扁塌。",
    products: ["主推薦：茶樹洗髮精或 IAU 茄紅素洗護組", "搭配建議：髮尾乾燥時少量使用超柔細順髮凝露", "使用順序：頭皮清潔 -> 髮尾輕量護理 -> 吹乾髮根"],
  },
  colorCare: {
    intent: "colorCare",
    title: "染後護色 + 修護補水",
    copy: "你的回答偏向染後或補色需求。建議以護色清潔搭配髮尾修護，降低褪色感，同時補足染後容易出現的乾燥與光澤不足。",
    products: ["主推薦：EDOL 煥然補色洗髮精，依髮色選粉紅、銀色或紫色系", "搭配建議：米胚芽修護霜加強染後乾燥髮尾", "注意事項：水溫不要過高，減少高溫吹整與日曬造成的褪色"],
  },
  repair: {
    intent: "repair",
    title: "修護柔順型洗護建議",
    copy: "你的回答偏向乾燥、染燙後或髮尾粗糙。建議先建立基礎修護，再用免沖洗護理加強髮中至髮尾，讓髮絲比較好梳理、有光澤。",
    products: ["主推薦：米胚芽修護霜", "搭配建議：ICS 修護油加強髮尾光澤與柔順", "使用順序：洗髮 -> 修護霜停留沖淨 -> 吹乾前後少量護理髮尾"],
  },
  smooth: {
    intent: "smooth",
    title: "柔順抗毛躁 + 髮尾滑順整理",
    copy: "你的回答偏向毛躁、打結或自然捲整理需求。建議把保濕修護放在髮中至髮尾，吹整前後搭配柔順型產品，降低蓬亂與摩擦感。",
    products: ["主推薦：超柔細順髮凝露", "搭配建議：米胚芽修護霜作為洗後修護基底", "使用順序：護髮後吹至半乾 -> 少量凝露整理髮尾與毛躁處"],
  },
  volume: {
    intent: "volume",
    title: "蓬鬆清爽 + 輕量保養",
    copy: "你的回答偏向細軟、扁塌或容易出油。建議洗髮以頭皮清爽為主，護髮和免沖洗產品都少量放在髮尾，保留髮根的空氣感。",
    products: ["主推薦：茶樹洗髮精", "搭配建議：超柔細順髮凝露只用少量在髮尾", "使用重點：吹乾時先吹髮根，避免厚重護理品靠近頭皮"],
  },
  shine: {
    intent: "shine",
    title: "亮澤保濕 + 日常光感維持",
    copy: "你的回答偏向想提升柔順與光澤。建議選擇保濕修護搭配少量光澤型免沖洗產品，讓髮絲看起來更乾淨、有質感。",
    products: ["主推薦：米胚芽修護霜", "搭配建議：ICS 修護油少量加在髮尾提升光澤", "使用重點：少量多次，避免一次用太多造成厚重感"],
  },
  leaveIn: {
    intent: "leaveIn",
    title: "免沖洗護理 + 髮尾質感整理",
    copy: "你的回答偏向想找洗後或造型前後可使用的免沖洗產品。建議以髮中至髮尾為主，依髮質選擇輕盈、柔順或光澤型產品，避免靠近頭皮造成厚重。",
    products: ["主方向：免沖洗精華、凝露或修護油", "搭配建議：乾燥毛躁先補柔順，細軟髮選輕盈質地", "使用重點：少量多次，先從髮尾開始"],
  },
  styling: {
    intent: "styling",
    title: "日常造型整理 + 定型支撐",
    copy: "你的回答偏向想找造型整理產品。建議先確認想要蓬鬆、線條、捲度或定型，再選擇對應質地，避免造型品殘留影響頭皮與髮根蓬鬆。",
    products: ["主方向：依造型需求選擇凝膠、髮蠟、泡沫或定型噴霧", "搭配建議：常用造型品時要留意清潔與殘留", "使用重點：少量堆疊，比一次大量使用更自然"],
  },
};

const titleEl = document.querySelector("#recommend-title");
const copyEl = document.querySelector("#recommend-copy");
const featuredProductGrid = document.querySelector("#featured-product-grid");
const homeProductSearchForm = document.querySelector("#home-product-search");
const homeProductSearchInput = document.querySelector("#home-product-search-input");
const productSearchInput = document.querySelector("#product-search-input");
const productSearchClear = document.querySelector("#product-search-clear");
const productSearchStatus = document.querySelector("#product-search-status");
const promoGrid = document.querySelector("#promo-grid");
const knowledgeGrid = document.querySelector("#knowledge-grid");
const advisorQuestionGroups = Array.from(document.querySelectorAll(".advisor-panel .question-group"));

document.querySelectorAll(".choice-row").forEach((row) => {
  row.addEventListener("click", (event) => {
    const button = event.target.closest(".choice");
    if (!button) return;

    const question = row.dataset.question;
    const value = button.dataset.value;

    if (question === "intent") {
      advisorState.intent = value;
      Object.assign(advisorState, advisorIntentDefaults[value] || advisorIntentDefaults.shampoo);
    } else {
      advisorState[question] = value;
    }

    syncAdvisorChoices();
    updateVisibleAdvisorQuestions();
    updateRecommendation();
  });
});

function syncAdvisorChoices() {
  document.querySelectorAll(".choice-row").forEach((row) => {
    const question = row.dataset.question;
    row.querySelectorAll(".choice").forEach((choice) => {
      choice.classList.toggle("is-active", choice.dataset.value === advisorState[question]);
    });
  });
}

function updateVisibleAdvisorQuestions() {
  advisorQuestionGroups.forEach((group) => {
    const showFor = group.dataset.showFor;
    if (!showFor) {
      group.hidden = false;
      return;
    }

    group.hidden = !showFor.split(/\s+/).includes(advisorState.intent);
  });
}

function updateRecommendation() {
  const base = getBaseRecommendation();
  const modifiers = getRecommendationModifiers().slice(0, 5);
  const selectedProducts = getProductRecommendations(base);
  const resultCopy = [base.copy, ...modifiers].join(" ");

  if (titleEl) titleEl.textContent = base.title;
  if (copyEl) copyEl.textContent = resultCopy;
  renderProducts(selectedProducts, base.products);
  updateAdvisorLineLink(base, modifiers, selectedProducts);
}

function getBaseRecommendation() {
  const productType = getProductTypeConfig();
  const scores = {
    sensitive: 0,
    dandruff: 0,
    scalpCare: 0,
    colorCare: 0,
    repair: 1,
    smooth: 0,
    volume: 0,
    shine: 0,
    leaveIn: 0,
    styling: 0,
  };

  scores[productType.recommendation] += 14;

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

  if (!isStylingConsultIntent()) {
    if (advisorState.goal === "scalpCare") scores.scalpCare += 10;
    if (advisorState.goal === "sensitive") scores.sensitive += 10;
    if (advisorState.goal === "dandruff") scores.dandruff += 10;
    if (advisorState.goal === "buildup") scores.scalpCare += 10;
    if (advisorState.goal === "colorCare") scores.colorCare += 10;
    if (advisorState.goal === "repair") scores.repair += 10;
    if (advisorState.goal === "smooth") scores.smooth += 10;
    if (advisorState.goal === "volume") scores.volume += 10;
    if (advisorState.goal === "shine") scores.shine += 10;
  }

  if (advisorState.wash === "sweat") scores.scalpCare += 2;
  if (advisorState.wash === "dryLess") scores.sensitive += 2;

  if (advisorState.intent === "scalpCare") {
    if (advisorState.wash === "daily" || advisorState.wash === "sweat") scores.scalpCare += 3;
    if (advisorState.routine === "styling") scores.scalpCare += 4;
    if (advisorState.routine === "outdoor") scores.scalpCare += 3;
    if (advisorState.routine === "care") scores.sensitive += 2;
    if (advisorState.preference === "quick" || advisorState.preference === "lightweight") scores.scalpCare += 2;
    if (advisorState.preference === "balanced") scores.scalpCare += 3;
    if (advisorState.preference === "intensive") {
      scores.scalpCare += 2;
      scores.sensitive += 2;
    }
  } else if (!isStylingConsultIntent()) {
    if (advisorState.routine === "heat") scores.repair += 2;
    if (advisorState.routine === "styling") scores.styling += 5;
    if (advisorState.routine === "outdoor") scores.colorCare += 1;
    if (advisorState.preference === "lightweight") scores.volume += 2;
    if (advisorState.preference === "intensive") scores.repair += 2;
    if (advisorState.preference === "quick" && advisorState.intent === "leaveIn") scores.leaveIn += 3;
  }

  let bestKey = productType.recommendation;
  Object.entries(scores).forEach(([key, score]) => {
    if (score > scores[bestKey]) bestKey = key;
  });

  const base = recommendations[bestKey];
  return {
    ...base,
    title: `${productType.label}｜${base.title}`,
    copy: getAdvisorBaseCopy(base.copy),
    productType: advisorState.intent,
    productTypeLabel: productType.label,
    recommendationIntent: bestKey,
  };
}

function getAdvisorBaseCopy(defaultCopy) {
  if (advisorState.intent === "tool") {
    return "你的回答偏向整髮工具。建議先以髮質和工具用途挑選，確認需要梳順打結、吹整造型、蓬鬆髮根、整理捲度或頭皮按摩，再選對應梳具。";
  }
  if (advisorState.intent === "curlStyling") {
    return "你的回答偏向捲髮造型品。建議先確認想要自然捲度、彈力捲度、鬆柔空氣感、捲度持久或修飾毛躁，再選對應質地。";
  }
  if (advisorState.intent === "styling") {
    return "你的回答偏向整髮造型品。建議先以髮質和想塑造的效果挑選，確認需要自然好整理、柔順線條、蓬鬆量感、髮根支撐、亮澤光感或霧面質感，再選對應質地。";
  }
  if (advisorState.intent === "holdStyling") {
    return "你的回答偏向定型產品。建議先確認需要固定力強、自然定型、抗潮持久、髮根支撐或捲度維持，再選擇適合的噴霧或定型液。";
  }
  if (advisorState.intent === "menStyling") {
    return "你的回答偏向男士造型品。建議先以髮質和想塑造的效果挑選，確認需要的是乾淨俐落、油頭光澤、固定力強、霧面線條或蓬鬆量感，再選對應質地。";
  }
  if (advisorState.intent === "scalpCare") {
    return "你的回答偏向頭皮保養。建議先確認出油、乾燥、敏感、頭皮屑或殘留負擔，再依日常情境選擇清潔、調理或加強養護產品。";
  }
  return defaultCopy;
}

function getRecommendationModifiers() {
  const modifiers = [];

  const productType = getProductTypeConfig();
  if (advisorState.intent === "tool") {
    modifiers.push(`這次會先鎖定「${productType.label}」類商品，再依你的髮質與工具用途排序推薦。`);
  } else if (isStylingConsultIntent()) {
    modifiers.push(`這次會先鎖定「${productType.label}」類商品，再依你的髮質與想塑造的效果排序推薦。`);
  } else if (advisorState.intent === "scalpCare") {
    modifiers.push(`這次會先鎖定「${productType.label}」類商品，再依你的頭皮狀況、日常情境與保養方式排序推薦。`);
  } else {
    modifiers.push(`這次會先鎖定「${productType.label}」類商品，再依你的頭皮、髮質與髮況排序推薦。`);
  }
  if (advisorState.intent === "shampoo") modifiers.push("洗髮精會優先看頭皮狀態，再搭配髮質與染燙需求調整清潔力。");
  if (advisorState.intent === "conditioner") modifiers.push("潤髮乳建議以髮中至髮尾為主，依髮質選擇輕盈或滋潤感。");
  if (advisorState.intent === "leaveIn") modifiers.push("免沖洗保養適合洗後吹整前後或日常整理髮尾時使用，請避開頭皮。");
  if (advisorState.intent === "treatment") modifiers.push("護髮產品會優先依受損程度與染燙漂狀態挑選修護強度。");
  if (advisorState.intent === "tool") modifiers.push("整髮工具會依髮質與造型習慣推薦，重點是梳理效率與髮絲拉扯感。");
  if (advisorState.intent === "curlStyling") modifiers.push("捲髮造型品會優先看捲度、毛躁與定型需求，讓線條自然不僵硬。");
  if (advisorState.intent === "styling") modifiers.push("整髮造型品會依蓬鬆、線條、光澤或定型需求挑選質地。");
  if (advisorState.intent === "holdStyling") modifiers.push("定型產品會依固定力、持久度、抗潮與髮根支撐需求挑選。");
  if (advisorState.intent === "menStyling") modifiers.push("男士造型品會優先看髮量、支撐度與清爽感，避免厚重塌黏。");
  if (["curlStyling", "styling", "holdStyling", "menStyling"].includes(advisorState.intent)) {
    const styleEffect = getMenStyleEffectConfig();
    modifiers.push(`想呈現「${styleEffect.label}」時，會優先挑選質地、固定力與光澤感更接近的產品。`);
  }
  if (advisorState.intent === "tool") {
    const toolPurpose = getToolPurposeConfig();
    modifiers.push(`想用工具處理「${toolPurpose.label}」時，會優先挑選用途更接近的梳具。`);
  }
  if (advisorState.intent === "scalpCare") modifiers.push("頭皮保養會優先看出油、乾燥、敏感或殘留感，再選擇對應調理品。");
  if (advisorState.intent === "scalpCare" && advisorState.goal === "buildup") modifiers.push("有殘留或悶熱感時，會優先考慮清潔、淨化或去角質方向。");
  if (advisorState.intent === "scalpCare" && advisorState.goal === "volume") modifiers.push("髮根容易扁塌時，頭皮保養會以清爽、蓬鬆與不厚重為主。");
  if (advisorState.intent === "scalpCare" && advisorState.routine === "styling") modifiers.push("常用造型品時，建議定期確認頭皮與髮根是否有殘留感。");
  if (advisorState.intent === "scalpCare" && advisorState.routine === "care") modifiers.push("想加強頭皮調理時，可以選擇精華液或頭皮養護品，先從低頻率觀察。");
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
  if (advisorState.intent === "scalpCare" && advisorState.wash === "daily") {
    modifiers.push("每天洗仍容易出油時，建議留意清潔力、髮根吹乾與是否有造型品殘留。");
  } else if (advisorState.wash === "daily") {
    modifiers.push("每天洗髮時，護髮產品更要避開頭皮，避免累積厚重感。");
  }
  if (advisorState.wash === "sweat") modifiers.push("常流汗或悶熱時，頭皮清潔與確實吹乾髮根會比厚重護理更重要。");
  if (!isStylingConsultIntent() && advisorState.intent !== "scalpCare" && advisorState.routine === "styling") modifiers.push("常用造型品時，建議定期確認清潔是否足夠，避免殘留影響蓬鬆。");
  if (!isStylingConsultIntent() && advisorState.routine === "heat") modifiers.push("常吹整或使用電棒時，吹整前後的髮尾防護會是保養重點。");
  if (!isStylingConsultIntent() && advisorState.intent !== "scalpCare" && advisorState.routine === "outdoor") modifiers.push("常日曬或戶外活動時，染後髮更要留意護色與乾燥問題。");
  if (advisorState.intent === "scalpCare" && advisorState.preference === "quick") {
    modifiers.push("若想簡單維持，可先固定一款適合頭皮狀態的頭皮保養品，再觀察一到兩週。");
  } else if (!isStylingConsultIntent() && advisorState.preference === "quick" && advisorState.intent === "shampoo") {
    modifiers.push("若想簡單保養，可先固定一款適合頭皮與髮質的洗髮精，再觀察清爽度與髮尾乾燥感。");
  } else if (!isStylingConsultIntent() && advisorState.preference === "quick") {
    modifiers.push("若想簡單保養，可先固定一款主力產品，再依髮尾乾燥或造型需求少量搭配。");
  }
  if (advisorState.intent === "scalpCare" && advisorState.preference === "intensive") {
    modifiers.push("願意加強護理時，可把重點放在頭皮精華、調理或週期性淨化，避免同時疊太多刺激性產品。");
  } else if (!isStylingConsultIntent() && advisorState.preference === "intensive") {
    modifiers.push("若願意完整護理，可以用洗髮、沖洗式護理、免沖洗修護三步驟建立穩定髮況。");
  }
  if (advisorState.intent === "scalpCare" && advisorState.preference === "lightweight") {
    modifiers.push("想要清爽不黏膩時，會優先選擇質地輕、頭皮負擔低的調理品。");
  } else if (!isStylingConsultIntent() && advisorState.preference === "lightweight") {
    modifiers.push("喜歡輕盈感時，所有護理產品都建議少量多次，先從髮尾開始。");
  }

  return modifiers;
}

function getProductRecommendations(base) {
  if (!productCatalog.length) return [];

  const scoredProducts = productCatalog
    .map((product, catalogIndex) => {
      const score = scoreProduct(product, base);
      return {
        ...product,
        catalogIndex,
        score,
        reason: buildProductReason(product, base),
      };
    })
    .filter((product) => product.score > 0)
    .sort((a, b) => b.score - a.score || a.catalogIndex - b.catalogIndex);
  const matchedProducts = scoredProducts.filter((product) => productMatchesType(product, base.productType));
  const candidateProducts = matchedProducts.length ? matchedProducts : scoredProducts;
  const hairCompatibleProducts = candidateProducts.filter((product) => isProductHairCompatible(product));
  const filteredProducts =
    advisorState.hair !== "normal" && hairCompatibleProducts.length ? hairCompatibleProducts : candidateProducts;
  const purposeMatchedProducts = filterProductsByToolPurpose(filteredProducts, base);

  return diversifyProducts(purposeMatchedProducts, base).slice(0, 3);
}

function scoreProduct(product, base) {
  const text = getProductSearchText(product);
  let score = priorityScore[product.priority] || 0;

  score += scoreProductType(product, base.productType);
  score += scoreIntent(product, text, base.intent);
  score += scoreAdvisorState(product, text);
  score += scoreHairCompatibility(product);

  if (hasCategory(product, ["造型工具"]) && advisorState.intent !== "tool") score -= 6;
  if (hasCategory(product, ["男士造型"]) && advisorState.intent !== "menStyling" && advisorState.routine !== "styling") score -= 2;

  return score;
}

function getProductTypeConfig(intent = advisorState.intent) {
  return productTypeConfigs[intent] || productTypeConfigs.shampoo;
}

function getMenStyleEffectConfig(value = advisorState.styleEffect) {
  return menStyleEffectConfigs[value] || menStyleEffectConfigs.clean;
}

function getToolPurposeConfig(value = advisorState.toolPurpose) {
  return toolPurposeConfigs[value] || toolPurposeConfigs.detangle;
}

function isStylingConsultIntent(intent = advisorState.intent) {
  return ["tool", "curlStyling", "styling", "holdStyling", "menStyling"].includes(intent);
}

function productMatchesType(product, intent = advisorState.intent) {
  return getProductTypeConfig(intent).categories.some((category) => (product.categories || []).includes(category));
}

function filterProductsByToolPurpose(products, base) {
  if (base.productType !== "tool") return products;

  const matchedProducts = products.filter((product) => productMatchesToolPurpose(product));
  return matchedProducts.length ? matchedProducts : products;
}

function productMatchesToolPurpose(product, purposeValue = advisorState.toolPurpose) {
  const purpose = getToolPurposeConfig(purposeValue);
  const needs = product.needs || [];

  return needs.some((need) => need === purpose.label || purpose.keywords.some((keyword) => need.includes(keyword)));
}

function scoreProductType(product, intent = advisorState.intent) {
  return productMatchesType(product, intent) ? 30 : -30;
}

function getProductHairCompatibility(product, hair = advisorState.hair) {
  const tags = product.hair || [];
  const rule = hairCompatibilityRules[hair];
  if (!rule || !tags.length) return "neutral";
  if (hasProductTag(tags, rule.tags)) return "match";
  if (hasProductTag(tags, rule.conflicts)) return "conflict";
  return "neutral";
}

function isProductHairCompatible(product, hair = advisorState.hair) {
  return getProductHairCompatibility(product, hair) !== "conflict";
}

function scoreHairCompatibility(product, hair = advisorState.hair) {
  const compatibility = getProductHairCompatibility(product, hair);
  if (compatibility === "match") return 18;
  if (compatibility === "conflict") return -60;
  return 0;
}

function scoreIntent(product, text, intent) {
  const categoryScore = {
    sensitive: [["洗髮精", "頭皮護理", "頭皮保養"], 4],
    dandruff: [["洗髮精", "頭皮護理", "頭皮保養"], 5],
    scalpCare: [["洗髮精", "頭皮護理", "頭皮保養"], 5],
    colorCare: [["補色", "洗髮精", "護髮膜", "潤絲"], 4],
    repair: [["護髮膜", "潤絲", "免沖洗"], 5],
    smooth: [["免沖洗", "潤絲", "護髮膜"], 5],
    volume: [["洗髮精", "頭皮護理", "造型", "定型"], 4],
    shine: [["免沖洗", "潤絲", "護髮膜"], 4],
    leaveIn: [["免沖洗", "免沖洗補水"], 8],
    styling: [["造型", "整髮造型", "定型", "男士造型", "捲髮造型", "打亮造型", "髮根蓬鬆造型", "髮跟蓬鬆造型"], 8],
  };
  const keywords = {
    sensitive: ["敏感", "乾癢", "舒緩", "溫和", "保濕", "頭皮"],
    dandruff: ["頭皮屑", "乾燥", "舒緩", "頭皮", "清潔"],
    scalpCare: ["油性", "出油", "清爽", "淨化", "頭皮", "蓬鬆", "控油", "冰涼", "茶樹"],
    colorCare: ["染後", "護色", "補色", "漂髮後", "褪色", "髮色", "紫色", "粉紅", "銀色", "EDOL"],
    repair: ["受損", "修護", "護髮", "乾燥", "毛躁", "燙後", "染後", "漂髮後", "保濕", "柔順"],
    smooth: ["柔順", "滑順", "毛躁", "打結", "自然捲", "粗硬", "糾結", "順髮"],
    volume: ["細軟", "蓬鬆", "豐盈", "輕盈", "髮根", "清爽", "造型"],
    shine: ["光澤", "亮澤", "柔順", "保濕", "精華油", "亮麗", "光感"],
    leaveIn: ["免沖洗", "精華油", "凝露", "髮油", "修護油", "柔順", "毛躁", "順髮", "保濕"],
    styling: ["造型", "定型", "髮蠟", "凝膠", "泡沫", "噴霧", "捲髮", "髮根", "蓬鬆"],
  };
  const [categories, points] = categoryScore[intent] || [[], 0];
  let score = hasCategory(product, categories) ? points : 0;
  score += countKeywordHits(text, keywords[intent] || []) * 2;
  return score;
}

function scoreAdvisorState(product, text) {
  let score = 0;
  const scalpKeywords = {
    oily: ["油性", "出油", "清爽", "淨化", "控油", "悶熱", "茶樹"],
    dry: ["乾性", "乾燥", "保濕", "舒緩"],
    sensitive: ["敏感", "乾癢", "舒緩", "溫和"],
    buildup: ["淨化", "清潔", "殘留", "頭皮護理", "頭皮保養"],
    dandruff: ["頭皮屑", "乾燥", "舒緩", "頭皮"],
  };
  const hairKeywords = {
    dry: ["乾燥", "毛躁", "受損", "保濕", "修護"],
    fine: ["細軟", "蓬鬆", "輕盈", "髮根"],
    coarse: ["粗硬", "柔順", "保濕", "毛躁"],
    frizzy: ["自然捲", "毛躁", "柔順", "滑順"],
    tangle: ["打結", "糾結", "柔順", "滑順", "順髮"],
    normal: ["都適用", "一般", "中性"],
  };
  const chemicalKeywords = {
    colored: ["染後", "護色", "髮色", "褪色"],
    bleached: ["漂髮後", "受損", "補色", "修護"],
    permed: ["燙後", "受損", "修護", "彈性"],
    straightened: ["離子燙", "直順", "柔順", "光澤"],
    tone: ["補色", "紫色", "粉紅", "銀色", "護色"],
  };

  score += countKeywordHits(text, scalpKeywords[advisorState.scalp] || []) * 2;
  score += countKeywordHits(text, hairKeywords[advisorState.hair] || []) * 2;
  score += countKeywordHits(text, chemicalKeywords[advisorState.chemical] || []) * 2;

  if (advisorState.intent === "shampoo") {
    if (hasCategory(product, ["洗髮精"])) score += 14;
    if (hasCategory(product, ["補色"]) && ["colored", "bleached", "tone"].includes(advisorState.chemical)) score += 8;
    if (hasCategory(product, ["頭皮護理", "頭皮保養", "免沖洗", "造型", "定型", "造型工具"])) score -= 10;
  }

  if (advisorState.intent === "conditioner") {
    if (hasCategory(product, ["潤絲"])) score += 14;
    if (countKeywordHits(text, ["柔順", "滑順", "保濕", "毛躁", "染後", "修護"])) score += 4;
    if (hasCategory(product, ["洗髮精", "頭皮護理", "頭皮保養", "造型", "定型", "造型工具"])) score -= 8;
  }

  if (advisorState.intent === "leaveIn") {
    if (hasCategory(product, ["免沖洗", "免沖洗補水"])) score += 14;
    if (hasCategory(product, ["洗髮精", "頭皮護理", "頭皮保養", "造型工具"])) score -= 8;
    if (countKeywordHits(text, ["精華油", "凝露", "修護油", "髮尾", "柔順"])) score += 4;
  }

  if (advisorState.intent === "treatment") {
    if (hasCategory(product, ["護髮膜"])) score += 18;
    if (hasCategory(product, ["潤絲"])) score -= 12;
    if (hasCategory(product, ["洗髮精", "頭皮護理", "頭皮保養", "造型", "定型", "造型工具"])) score -= 8;
  }

  if (advisorState.intent === "tool") {
    if (hasCategory(product, ["造型工具"])) score += 18;
    if (countKeywordHits(text, ["梳", "刷", "工具", "整理"])) score += 5;
    const toolPurpose = getToolPurposeConfig();
    score += countKeywordHits(text, toolPurpose.keywords) * 5;
  }

  if (advisorState.intent === "curlStyling") {
    if (hasCategory(product, ["捲髮造型"])) score += 18;
    if (countKeywordHits(text, ["捲髮", "彈力", "泡沫", "線條"])) score += 5;
    const styleEffect = getMenStyleEffectConfig();
    score += countKeywordHits(text, styleEffect.keywords) * 4;
    if (hasCategory(product, ["洗髮精", "潤絲", "護髮膜", "頭皮護理"])) score -= 8;
  }

  if (advisorState.intent === "styling") {
    if (hasCategory(product, ["造型", "整髮造型", "打亮造型", "髮根蓬鬆造型", "髮跟蓬鬆造型", "鮑伯髮型"])) score += 14;
    const styleEffect = getMenStyleEffectConfig();
    score += countKeywordHits(text, styleEffect.keywords) * 4;
    if (hasCategory(product, ["洗髮精", "潤絲", "護髮膜", "頭皮護理"])) score -= 6;
    if (hasCategory(product, ["造型工具"])) score += 3;
  }

  if (advisorState.intent === "holdStyling") {
    if (hasCategory(product, ["定型"])) score += 18;
    const styleEffect = getMenStyleEffectConfig();
    score += countKeywordHits(text, styleEffect.keywords) * 4;
    if (hasCategory(product, ["洗髮精", "潤絲", "護髮膜", "頭皮護理", "造型工具"])) score -= 8;
  }

  if (advisorState.intent === "menStyling") {
    const styleEffect = getMenStyleEffectConfig();
    if (hasCategory(product, ["男士造型"])) score += 18;
    if (countKeywordHits(text, ["男士", "支撐", "霧面", "髮蠟", "定型", "清爽"])) score += 5;
    score += countKeywordHits(text, styleEffect.keywords) * 4;
    if (hasCategory(product, ["洗髮精", "潤絲", "護髮膜", "頭皮護理"])) score -= 8;
  }

  if (advisorState.intent === "scalpCare") {
    if (hasCategory(product, ["頭皮護理", "頭皮保養"])) score += 18;
    if (countKeywordHits(text, ["頭皮", "油性", "乾性", "敏感", "精華液", "去角質", "調理"])) score += 5;
    if (advisorState.goal === "sensitive") {
      if (hasProductTag(product.scalp, ["敏感", "乾性"])) score += 6;
      score += countKeywordHits(text, ["敏感", "乾癢", "舒緩", "溫和", "保濕"]) * 3;
    }
    if (advisorState.goal === "dandruff") {
      if (hasProductTag(product.scalp, ["乾性", "敏感"])) score += 4;
      score += countKeywordHits(text, ["頭皮屑", "乾燥", "舒緩", "清潔"]) * 3;
    }
    if (advisorState.goal === "buildup") {
      if (hasProductTag(product.scalp, ["油性"])) score += 4;
      score += countKeywordHits(text, ["殘留", "淨化", "清潔", "去角質", "堵塞", "堆積"]) * 3;
    }
    if (advisorState.goal === "volume") {
      score += countKeywordHits(text, ["髮根", "蓬鬆", "輕盈", "清爽"]) * 3;
    }
    if (advisorState.routine === "styling") score += countKeywordHits(text, ["殘留", "淨化", "清潔", "去角質"]) * 2;
    if (advisorState.routine === "outdoor") score += countKeywordHits(text, ["清爽", "控油", "保護", "汙染", "污染"]) * 2;
    if (advisorState.routine === "care") score += countKeywordHits(text, ["精華液", "調理", "養護", "保護", "保濕"]) * 2;
    if (advisorState.preference === "lightweight") score += countKeywordHits(text, ["清爽", "不黏膩", "輕盈", "控油"]) * 2;
    if (advisorState.preference === "intensive") score += countKeywordHits(text, ["精華液", "調理", "養護", "保護", "保濕"]) * 2;
    if (hasCategory(product, ["洗髮精", "潤絲", "護髮膜", "免沖洗", "造型", "定型", "造型工具"])) score -= 8;
  }

  if (advisorState.scalp === "oily") {
    if (hasProductTag(product.scalp, ["油性"])) score += 10;
    if (hasProductTag(product.scalp, ["乾性", "敏感"])) score -= 8;
    if (hasCategory(product, ["頭皮護理", "頭皮保養"]) && countKeywordHits(text, ["保濕修護霜", "乾燥", "受損"])) score -= 5;
    if (countKeywordHits(text, ["茶樹", "冷橘", "茄紅素", "淨化", "去脂"])) score += 4;
  }

  if (advisorState.scalp === "dry") {
    if (hasProductTag(product.scalp, ["乾性"])) score += 8;
    if (hasProductTag(product.scalp, ["油性"])) score -= 4;
  }

  if (advisorState.scalp === "sensitive") {
    if (hasProductTag(product.scalp, ["敏感"])) score += 8;
    if (hasProductTag(product.scalp, ["油性"])) score -= 3;
  }

  if (advisorState.damage === "high" || advisorState.damage === "split") score += countKeywordHits(text, ["受損", "修護", "護髮膜", "重度受損"]) * 2;
  if (advisorState.intent !== "menStyling") {
    if (advisorState.goal === "scalpCare") score += hasCategory(product, ["洗髮精", "頭皮護理", "頭皮保養"]) ? 4 : 0;
    if (advisorState.goal === "colorCare") score += countKeywordHits(text, ["補色", "染後", "護色", "漂髮後"]) * 3;
    if (advisorState.goal === "repair") score += hasCategory(product, ["護髮膜", "潤絲", "免沖洗"]) ? 4 : 0;
    if (advisorState.goal === "smooth") score += countKeywordHits(text, ["柔順", "毛躁", "滑順", "順髮"]) * 3;
    if (advisorState.goal === "volume") score += countKeywordHits(text, ["蓬鬆", "細軟", "髮根", "輕盈"]) * 3;
    if (advisorState.goal === "shine") score += countKeywordHits(text, ["光澤", "亮澤", "精華油", "光感"]) * 3;
    if (advisorState.routine === "styling") score += hasCategory(product, ["造型", "整髮造型", "定型", "男士造型", "捲髮造型"]) ? 5 : 0;
    if (advisorState.routine === "heat") score += countKeywordHits(text, ["修護", "免沖洗", "精華油", "熱", "吹整"]) * 2;
    if (advisorState.preference === "lightweight") score += countKeywordHits(text, ["輕盈", "蓬鬆", "清爽", "不厚重"]) * 2;
    if (advisorState.preference === "intensive") score += hasCategory(product, ["護髮膜", "潤絲", "免沖洗"]) ? 3 : 0;
  }

  return score;
}

function diversifyProducts(products, baseOrIntent) {
  const intent = typeof baseOrIntent === "string" ? baseOrIntent : baseOrIntent?.intent;
  const productType = typeof baseOrIntent === "string" ? advisorState.intent : baseOrIntent?.productType;
  if (productTypeConfigs[productType]) return products;

  const orderByIntent = {
    sensitive: ["cleanser", "scalp", "treatment", "leaveIn"],
    dandruff: ["cleanser", "scalp", "treatment", "leaveIn"],
    scalpCare: ["cleanser", "scalp", "treatment", "leaveIn"],
    colorCare: ["color", "treatment", "leaveIn", "cleanser"],
    repair: ["treatment", "leaveIn", "cleanser", "color"],
    smooth: ["leaveIn", "treatment", "cleanser", "tool"],
    volume: ["cleanser", "styling", "scalp", "leaveIn"],
    shine: ["leaveIn", "treatment", "cleanser", "color"],
    leaveIn: ["leaveIn", "treatment", "cleanser"],
    styling: ["styling", "tool", "cleanser"],
  };
  const focusedIntents = {
    leaveIn: {
      primary: ["leaveIn"],
      secondary: ["treatment"],
    },
    styling: {
      primary: ["styling"],
      secondary: ["tool"],
    },
  };
  const selected = [];
  const groups = orderByIntent[intent] || ["cleanser", "treatment", "leaveIn"];
  const addFromGroup = (group) => {
    products.forEach((product) => {
      if (selected.length >= 3) return;
      if (!selected.includes(product) && getProductGroup(product) === group) selected.push(product);
    });
  };

  if (focusedIntents[intent]) {
    focusedIntents[intent].primary.forEach(addFromGroup);
    focusedIntents[intent].secondary.forEach(addFromGroup);

    products.forEach((product) => {
      if (selected.length >= 3) return;
      if (!selected.includes(product)) selected.push(product);
    });

    return selected;
  }

  groups.forEach((group) => {
    const nextProduct = products.find((product) => !selected.includes(product) && getProductGroup(product) === group);
    if (nextProduct) selected.push(nextProduct);
  });

  products.forEach((product) => {
    if (selected.length >= 3) return;
    if (!selected.includes(product)) selected.push(product);
  });

  return selected;
}

function getProductGroup(product) {
  if (hasCategory(product, ["補色"])) return "color";
  if (hasCategory(product, ["洗髮精"])) return "cleanser";
  if (hasCategory(product, ["頭皮護理", "頭皮保養"])) return "scalp";
  if (hasCategory(product, ["護髮膜", "潤絲"])) return "treatment";
  if (hasCategory(product, ["免沖洗", "免沖洗補水"])) return "leaveIn";
  if (hasCategory(product, ["造型", "整髮造型", "定型", "男士造型", "捲髮造型", "打亮造型", "髮根蓬鬆造型", "髮跟蓬鬆造型"])) return "styling";
  if (hasCategory(product, ["造型工具"])) return "tool";
  return "other";
}

function getProductSearchText(product) {
  return [
    product.name,
    product.brand,
    product.category,
    ...(product.categories || []),
    ...(product.scalp || []),
    ...(product.hair || []),
    ...(product.needs || []),
    product.effect,
    product.usage,
    product.pitch,
    product.caution,
  ]
    .filter(Boolean)
    .join(" ");
}

function hasCategory(product, categories) {
  return categories.some((category) => (product.categories || []).some((item) => item.includes(category)));
}

function hasProductTag(tags = [], values = []) {
  return values.some((value) => tags.some((tag) => tag.includes(value)));
}

function countKeywordHits(text, keywords) {
  return keywords.reduce((total, keyword) => (text.includes(keyword) ? total + 1 : total), 0);
}

function buildProductReason(product, base) {
  const reasons = [];
  const text = getProductSearchText(product);
  const productType = getProductTypeConfig(base.productType);

  if (productMatchesType(product, base.productType)) reasons.push(`符合${productType.label}需求`);
  if (advisorState.intent === "tool" && productMatchesType(product, base.productType)) {
    reasons.push(getToolPurposeConfig().reason);
  }
  if (["curlStyling", "styling", "holdStyling", "menStyling"].includes(advisorState.intent) && productMatchesType(product, base.productType)) {
    reasons.push(getMenStyleEffectConfig().reason);
  }
  if (advisorState.scalp === "oily" && countKeywordHits(text, ["油性", "出油", "清爽", "淨化"])) reasons.push("符合頭皮清爽需求");
  if (advisorState.scalp === "sensitive" && countKeywordHits(text, ["敏感", "乾癢", "舒緩", "溫和"])) reasons.push("適合先降低頭皮負擔");
  if (advisorState.hair === "fine" && countKeywordHits(text, ["細軟", "蓬鬆", "輕盈"])) reasons.push("保留細軟髮的輕盈感");
  if (advisorState.hair === "coarse" && countKeywordHits(text, ["粗硬", "柔順", "保濕", "毛躁"])) reasons.push("協助粗硬髮更服貼好整理");
  if (advisorState.hair === "frizzy" && countKeywordHits(text, ["自然捲", "毛躁", "柔順", "滑順", "捲髮"])) reasons.push("適合自然捲或毛躁整理");
  if (advisorState.chemical === "colored" && countKeywordHits(text, ["染後", "護色", "髮色"])) reasons.push("協助染後髮色與質感維持");
  if (advisorState.chemical === "bleached" && countKeywordHits(text, ["漂髮後", "受損", "補色", "修護"])) reasons.push("適合漂後髮的修護或色調維持");
  if (advisorState.damage === "high" || advisorState.damage === "split") {
    if (countKeywordHits(text, ["受損", "修護", "護髮", "保濕"])) reasons.push("對應高受損髮況的修護需求");
  }
  if (advisorState.intent !== "menStyling" && advisorState.goal === "smooth" && countKeywordHits(text, ["柔順", "滑順", "毛躁", "順髮"])) reasons.push("提升髮尾柔順與好整理度");
  if (advisorState.intent !== "menStyling" && advisorState.goal === "shine" && countKeywordHits(text, ["光澤", "亮澤", "精華油"])) reasons.push("補足髮絲光澤與質感");
  if (advisorState.intent !== "menStyling" && advisorState.goal === "volume" && countKeywordHits(text, ["蓬鬆", "髮根", "輕盈", "支撐"])) reasons.push("協助維持蓬鬆與支撐度");
  if (!isStylingConsultIntent() && advisorState.routine === "styling" && hasCategory(product, ["造型", "整髮造型", "定型", "男士造型", "捲髮造型"])) reasons.push("適合日常造型需求");

  if (!reasons.length && product.pitch) reasons.push(summarizeText(product.pitch, 42));
  if (!reasons.length && product.effect) reasons.push(summarizeText(product.effect, 42));
  if (!reasons.length) reasons.push(base.title);

  return reasons.slice(0, 2).join("，");
}

function formatProductVariants(product) {
  if (!product.variants?.length) return "";
  return product.variants
    .slice(0, 2)
    .map((variant) => `${variant.spec} / $${variant.price}`)
    .join("、");
}

function summarizeText(text, maxLength = 54) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
}

function getProductCardDescription(product) {
  return summarizeText(product.effect || product.reason || product.pitch, 72);
}

function renderProducts(products, fallbackProducts = []) {
  const productList = document.querySelector("#recommend-products");
  if (!productList) return;
  productList.innerHTML = "";

  if (!products.length) {
    fallbackProducts.forEach((product) => {
      const item = document.createElement("li");
      item.textContent = product;
      productList.appendChild(item);
    });
    return;
  }

  products.forEach((product) => {
    const item = document.createElement("li");
    item.className = "recommend-product-card";
    item.innerHTML = `
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" />
      <span>
        <em>${escapeHtml([product.brand, product.category].filter(Boolean).join(" / "))}</em>
        <strong>${escapeHtml(product.name)}</strong>
        <p>${escapeHtml(getProductCardDescription(product))}</p>
        <small>${escapeHtml(formatProductVariants(product))}</small>
      </span>
    `;
    productList.appendChild(item);
  });
}

function getFeaturedProducts() {
  const featuredNames = ["茶樹洗髮精", "米胚芽護髮霜", "順髮凝露"];
  return featuredNames
    .map((name) => productCatalog.find((product) => product.name === name))
    .filter(Boolean);
}

function normalizeQuickSearchText(value) {
  return String(value || "")
    .toLocaleLowerCase("zh-TW")
    .replace(/\s+/g, "");
}

function collectProductSearchValues(value) {
  if (Array.isArray(value)) return value.map(collectProductSearchValues).join(" ");
  if (value && typeof value === "object") return Object.values(value).map(collectProductSearchValues).join(" ");
  return String(value || "");
}

function getProductQuickSearchQuery() {
  return productSearchInput?.value.trim() || "";
}

function productMatchesQuickSearch(product, query) {
  const tokens = query.split(/\s+/).map(normalizeQuickSearchText).filter(Boolean);
  if (!tokens.length) return true;

  const searchText = normalizeQuickSearchText([
    getProductSearchText(product),
    collectProductSearchValues(product),
  ].join(" "));

  return tokens.every((token) => searchText.includes(token));
}

function updateProductQuickSearchStatus(resultCount, query) {
  if (!productSearchStatus) return;

  if (!query) {
    productSearchStatus.textContent = "可搜尋商品名稱、品牌、主要功效、髮質、頭皮屬性與造型需求。";
    return;
  }

  if (!resultCount) {
    productSearchStatus.textContent = "目前沒有找到完全符合的商品，請換個關鍵字或直接 LINE 詢問專人。";
    return;
  }

  productSearchStatus.textContent =
    resultCount > 24
      ? `找到 ${resultCount} 個相關商品，目前先顯示前 24 個，可再輸入更精準的關鍵字。`
      : `找到 ${resultCount} 個相關商品，可透過 LINE 諮詢確認庫存與用法。`;
}

function renderFeaturedProducts() {
  if (!featuredProductGrid || !productCatalog.length) return;

  const query = getProductQuickSearchQuery();
  const searchMatches = query
    ? productCatalog.filter((product) => productMatchesQuickSearch(product, query))
    : getFeaturedProducts();
  const featuredProducts = query ? searchMatches.slice(0, 24) : searchMatches;

  updateProductQuickSearchStatus(searchMatches.length, query);

  featuredProductGrid.innerHTML = "";

  if (!featuredProducts.length) {
    featuredProductGrid.innerHTML = `
      <p class="product-empty">沒有找到符合「${escapeHtml(query)}」的商品，建議換成品牌、功效、髮質或頭皮狀況再試一次。</p>
    `;
    return;
  }

  featuredProducts.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" />
      <div>
        <p class="product-kicker">${escapeHtml([product.brand, product.category].filter(Boolean).join(" / "))}</p>
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(summarizeText(product.effect, 72))}</p>
        <p class="product-spec">${escapeHtml(formatProductVariants(product))}</p>
      </div>
    `;
    featuredProductGrid.appendChild(card);
  });
}

if (productSearchInput) {
  productSearchInput.addEventListener("input", () => {
    if (productSearchClear) productSearchClear.hidden = !getProductQuickSearchQuery();
    renderFeaturedProducts();
  });
}

if (productSearchClear) {
  productSearchClear.addEventListener("click", () => {
    if (productSearchInput) productSearchInput.value = "";
    productSearchClear.hidden = true;
    renderFeaturedProducts();
    productSearchInput?.focus();
  });
}

if (homeProductSearchForm) {
  homeProductSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = homeProductSearchInput?.value.trim() || "";

    if (productSearchInput) productSearchInput.value = query;
    if (productSearchClear) productSearchClear.hidden = !query;

    renderFeaturedProducts();
    showPage("products", { updateUrl: true, scrollToTop: true });

    window.requestAnimationFrame(() => {
      productSearchInput?.focus({ preventScroll: true });
    });
  });
}

async function loadCmsContent() {
  try {
    const response = await fetch("/api/cms", { cache: "no-store" });
    if (!response.ok) return;
    applyCmsContent(await response.json());
  } catch {
    // Static file previews do not have the CMS API; keep the built-in content.
  }
}

function applyCmsContent(cms) {
  if (Array.isArray(cms.products) && cms.products.length) {
    productCatalog = cms.products.filter((product) => product.status === "上架");
    renderFeaturedProducts();
    updateRecommendation();
  }

  if (Array.isArray(cms.offers) && cms.offers.length) renderOfferCards(cms.offers);

  const mergedKnowledge = mergeKnowledgeArticles(
    Array.isArray(cms.knowledge) ? cms.knowledge : [],
    supplementalKnowledgeArticles,
  );
  if (mergedKnowledge.length) renderKnowledgeCards(mergedKnowledge);
}

function isLiveContent(item) {
  return ["上架", "上架中", "live", "published"].includes(String(item.status || "上架"));
}

function renderOfferCards(offers) {
  if (!promoGrid) return;

  const liveOffers = offers.filter(isLiveContent);
  if (!liveOffers.length) return;

  promoGrid.innerHTML = "";
  liveOffers.forEach((offer) => {
    const points = Array.isArray(offer.points) ? offer.points : [];
    const card = document.createElement("article");
    card.className = "promo-card promo-card-dynamic";
    card.innerHTML = `
      <div class="promo-card-head">
        <div class="promo-price" aria-label="${escapeHtml(`${offer.title || "優惠"}價格`)}">
          <small>${escapeHtml(offer.priceLabel || "優惠價")}</small>
          <strong>${escapeHtml(offer.price || "")}</strong>
          <em>${escapeHtml(offer.original || "")}</em>
        </div>
        <span class="promo-tag">${escapeHtml(offer.tag || "本月優惠")}</span>
      </div>
      <figure class="promo-media">
        <img src="${escapeHtml(offer.image || "assets/offer-ics-clean.png")}" alt="${escapeHtml(offer.imageAlt || offer.title || "優惠圖片")}" loading="lazy" />
      </figure>
      <div class="promo-content">
        <p class="promo-series">${escapeHtml(offer.series || "Canbran")}</p>
        <h3>${escapeHtml(offer.title || "優惠商品")}</h3>
        <p>${escapeHtml(offer.description || "")}</p>
        <ul class="promo-points" aria-label="${escapeHtml(`${offer.title || "優惠"}適合需求`)}">
          ${points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
      </div>
    `;
    promoGrid.appendChild(card);
  });
}

function mergeKnowledgeArticles(primaryArticles, fallbackArticles) {
  const mergedArticles = [];
  const seenKeys = new Set();

  [...primaryArticles, ...fallbackArticles].forEach((article) => {
    const keys = [article.id, article.title].map((value) => String(value || "").trim()).filter(Boolean);
    if (!keys.length || keys.some((key) => seenKeys.has(key))) return;
    keys.forEach((key) => seenKeys.add(key));
    mergedArticles.push(article);
  });

  return mergedArticles;
}

function renderKnowledgeCards(articles) {
  if (!knowledgeGrid) return;

  const liveArticles = articles.filter(isLiveContent);
  if (!liveArticles.length) return;

  knowledgeGrid.innerHTML = "";
  liveArticles.forEach((article) => {
    const card = document.createElement("article");
    card.className = "article-card";
    const links = renderKnowledgeLanguageLinks(article);
    card.innerHTML = `
      <figure class="article-media">
        <img src="${escapeHtml(article.image || "assets/knowledge-shampoo-card.jpg")}" alt="${escapeHtml(article.imageAlt || article.title || "美髮知識圖片")}" loading="lazy" />
      </figure>
      <div class="article-content">
        <p class="article-type">${escapeHtml(article.type || "美髮知識")}</p>
        <h3>${escapeHtml(article.title || "")}</h3>
        <p>${escapeHtml(article.description || "")}</p>
        ${links}
      </div>
    `;
    knowledgeGrid.appendChild(card);
  });
}

function renderKnowledgeLanguageLinks(article) {
  const sourceUrl = String(article.linkUrl || "").trim();
  if (!sourceUrl) return "";

  const translatedUrl = createTranslatedUrl(sourceUrl);
  const translatedLink = translatedUrl
    ? `<a class="article-language-link is-primary" href="${escapeHtml(translatedUrl)}" target="_blank" rel="noopener">中文翻譯</a>`
    : "";
  const sourceLabel = article.linkLabel || "外部原文";

  return `
    <div class="article-language" aria-label="${escapeHtml(`${article.title || "美髮知識"}語言選擇`)}">
      <span>語言選擇</span>
      <div class="article-language-links">
        ${translatedLink}
        <a class="article-language-link" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener" aria-label="${escapeHtml(`開啟${sourceLabel}`)}">英文原文</a>
      </div>
    </div>
  `;
}

function createTranslatedUrl(sourceUrl) {
  try {
    const url = new URL(sourceUrl, window.location.href);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return `https://translate.google.com/translate?sl=auto&tl=zh-TW&u=${encodeURIComponent(url.href)}`;
  } catch {
    return "";
  }
}

function updateAdvisorLineLink(base, modifiers, selectedProducts = []) {
  if (!advisorLineLink || !base) return;

  const selectedAnswers = getAdvisorAnswerSummary();
  const selectedLines = selectedAnswers.map(({ label, value }) => `${label}：${value}`);
  const analysisLines = [base.copy, ...modifiers.slice(0, 2)].filter(Boolean);
  const productLines = selectedProducts.length
    ? selectedProducts.map((product) => {
        const variant = formatProductVariants(product);
        const reason = product.reason || summarizeText(product.effect, 36);
        return `・${product.name}${variant ? `（${variant}）` : ""}：${reason}`;
      })
    : base.products.map((product) => `・${product}`);
  const message = [
    "您好，我已完成肯邦屋 AI 髮品診斷，想請專人協助確認。",
    "",
    "我的選擇：",
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
  return Array.from(document.querySelectorAll(".choice-row"))
    .map((row) => {
      const group = row.closest(".question-group");
      if (group?.hidden) return null;

      const label = group?.querySelector(".question-label")?.textContent?.trim() || "選項";
      const activeChoice = row.querySelector(".choice.is-active");
      const value = activeChoice?.textContent?.trim() || "";
      return { label, value };
    })
    .filter(Boolean);
}

if (advisorLineLink) {
  advisorLineLink.addEventListener("click", () => {
    const message = advisorLineLink.dataset.advisorMessage;
    if (!message || !navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(message).catch(() => {});
  });
}

syncAdvisorChoices();
updateVisibleAdvisorQuestions();
updateRecommendation();
renderFeaturedProducts();
loadCmsContent();

const advisorPresets = {
  dry: {
    intent: "leaveIn",
    hair: "frizzy",
    damage: "medium",
    goal: "smooth",
    preference: "balanced",
  },
  damage: {
    intent: "treatment",
    chemical: "permed",
    damage: "high",
    goal: "repair",
    preference: "intensive",
  },
  oily: {
    intent: "shampoo",
    scalp: "oily",
    goal: "scalpCare",
    wash: "daily",
    preference: "lightweight",
  },
  fine: {
    intent: "shampoo",
    hair: "fine",
    goal: "volume",
    scalp: "oily",
    preference: "lightweight",
  },
  shine: {
    intent: "leaveIn",
    hair: "normal",
    damage: "healthy",
    goal: "shine",
    preference: "balanced",
  },
  tangle: {
    intent: "conditioner",
    hair: "frizzy",
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

  Object.assign(advisorState, advisorIntentDefaults[preset.intent] || advisorIntentDefaults.shampoo, preset);
  syncAdvisorChoices();
  updateVisibleAdvisorQuestions();
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
    id: "paul-mitchell-volume-set",
    name: "Paul Mitchell 夏日蓬鬆定型組",
    category: "造型定型",
    status: "上架中",
    description: "適合髮根支撐、抗潮抗濕與全天候造型維持。",
  },
  {
    id: "tea-tree-hemp-two",
    name: "茶樹漢麻髮浴潤澤乳兩入組",
    category: "旅行便攜",
    status: "上架中",
    description: "便攜小瓶裝，適合旅行、健身或初次體驗。",
  },
  {
    id: "tea-tree-hemp-three",
    name: "茶樹漢麻髮浴三入組",
    category: "補貨組合",
    status: "上架中",
    description: "清爽洗感搭配漢麻系列舒適潤澤，適合日常補貨。",
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
