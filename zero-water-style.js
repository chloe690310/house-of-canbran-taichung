"use strict";

if (window.lucide) window.lucide.createIcons();

const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.getElementById("site-nav");

function setMenuOpen(open) {
  header.classList.toggle("menu-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "關閉導覽選單" : "開啟導覽選單");
}

menuToggle.addEventListener("click", () => setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true"));
siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenuOpen(false);
});
document.addEventListener("click", (event) => {
  if (!header.contains(event.target)) setMenuOpen(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuToggle.focus();
  }
});
window.matchMedia("(max-width: 600px)").addEventListener("change", () => setMenuOpen(false));

const routines = {
  shampoo: {
    zone: "髮根・頭皮",
    location: "分區提起髮絲，噴在出油處。",
    distance: "分區",
    steps: [
      ["充分搖勻", "使用前搖勻，讓瓶內粉體充分混合。"],
      ["分區噴灑", "提起髮絲，與頭皮保持適當距離，分區噴在髮根出油處。"],
      ["指腹按摩", "用指腹輕輕按摩頭皮與髮根，幫助粉體均勻分散。"],
      ["梳理散開", "將髮絲梳開，減少白粉感，整理出自然蓬鬆度。"],
    ],
    note: "髮根清爽後，髮尾若乾澀，可再搭配乾式潤絲噴霧。",
  },
  conditioner: {
    zone: "髮中・髮尾",
    location: "避開髮根，噴在乾澀毛躁的髮段。",
    distance: "15 cm",
    steps: [
      ["充分搖勻", "使用前充分搖勻，準備整理乾澀的髮段。"],
      ["距離 15 公分", "距離頭髮約 15 公分，均勻噴在髮中至髮尾。"],
      ["輕撥髮絲", "用手指輕撥髮中與髮尾，讓柔順噴霧均勻分布。"],
      ["梳順髮尾", "輕輕梳理髮段，整理毛躁與靜電，帶出柔順光澤。"],
    ],
    note: "建議在乾洗髮後使用，也可作為熱造型前的抗熱噴霧。",
  },
};

const tabs = [...document.querySelectorAll("[data-routine]")];
const routinePanel = document.getElementById("routine-panel");

function selectRoutine(tab) {
  const mode = tab.dataset.routine;
  const routine = routines[mode];
  tabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  routinePanel.classList.toggle("is-conditioner", mode === "conditioner");
  routinePanel.setAttribute("aria-labelledby", tab.id);
  document.querySelector(".hair-zone svg").setAttribute("aria-label", routine.zone + "的使用位置示意");
  document.getElementById("routine-zone-title").textContent = routine.zone;
  document.getElementById("routine-zone-description").textContent = routine.location;
  document.getElementById("spray-distance").textContent = routine.distance;
  routine.steps.forEach(([title, copy], index) => {
    document.getElementById("step-" + (index + 1) + "-title").textContent = title;
    document.getElementById("step-" + (index + 1) + "-copy").textContent = copy;
  });
  document.querySelector("#routine-note span").textContent = routine.note;
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectRoutine(tab));
  tab.addEventListener("keydown", (event) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    tabs[next].focus();
    selectRoutine(tabs[next]);
  });
});

document.querySelectorAll("[data-routine-link]").forEach((link) => {
  link.addEventListener("click", () => {
    const tab = tabs.find((item) => item.dataset.routine === link.dataset.routineLink);
    if (tab) selectRoutine(tab);
  });
});
