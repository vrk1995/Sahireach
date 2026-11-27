/* ===== data, helpers, state ===== */
const HOST = window.SR || null; /* set by the staff-login page after sign-in; absent in the standalone preview */
const D = HOST && HOST.data ? HOST.data : JSON.parse(document.getElementById("seed").textContent);
const LOGO = HOST && HOST.logo ? HOST.logo : document.getElementById("logo-data").textContent.trim();
const ME = (HOST && HOST.me) || { name: "Vishnu", role: "owner" };
/* roles: owner = everything; staff = day-to-day work, no costs or profit; viewer = sees everything, changes nothing;
   accountant = sees everything and keeps the books (Accounts, invoice numbers), but cannot change orders, stock or setup.
   The database enforces the same rules: staff are sent no cost data or books, a viewer's changes are refused, and an
   accountant's save only changes the books and invoice numbers. */
const ROLE = (() => { if (HOST) return ["owner", "staff", "viewer", "accountant"].includes(ME.role) ? ME.role : "staff"; let r = ""; try { r = new URLSearchParams(location.search).get("as") || ""; } catch (e) {} return ["staff", "viewer", "accountant"].includes(r) ? r : "owner"; })();
const CAN_EDIT = ROLE === "owner" || ROLE === "staff", SEE_MONEY = ROLE !== "staff";
/* the system admin (an owner) can undo anything in the activity log; in the preview the owner is the admin */
const ADMIN = ROLE === "owner" && (HOST ? !!ME.admin : true);
const ROLE_LABEL = { owner: "Owner", staff: "Staff", viewer: "Viewer", accountant: "Accountant" };
const FIRST = String(ME.name || "").trim().split(/\s+/)[0] || "there";
const CO = D.company || { name: "SahiReach LLP", address: "", gstin: "", fssai: "" };
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const key = (s) => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
const inr0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const rs = (n) => (n == null || isNaN(n) ? "–" : "₹" + inr0.format(Math.round(n)));
const rs2 = (n) => (n == null || isNaN(n) ? "–" : "₹" + inr2.format(n));
const lakh = (n) => (n == null || isNaN(n) ? "–" : (n / 100000).toFixed(2));
const nf = (n, d = 0) => (n == null || isNaN(n) ? "–" : new Intl.NumberFormat("en-IN", { maximumFractionDigits: d }).format(n));
const pct = (n, d = 0) => (n == null || isNaN(n) ? "–" : (n * 100).toFixed(d) + "%");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const toDate = (s) => (s instanceof Date ? s : s ? new Date(s.length <= 10 ? s + "T00:00" : s) : null);
const dayKey = (d) => d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
const fmtDate = (s) => { const d = toDate(s); return d ? d.getDate() + " " + MONTHS[d.getMonth()] : "–"; };
const fmtTime = (s) => { const d = toDate(s); if (!d) return ""; let h = d.getHours(); const m = String(d.getMinutes()).padStart(2, "0"); const ap = h >= 12 ? "pm" : "am"; h = h % 12 || 12; return h + ":" + m + " " + ap; };
const fmtDT = (s) => (s ? fmtDate(s) + ", " + fmtTime(s) : "–");
const NOW = () => new Date();
const dayLabel = (s) => {
  const d = toDate(s), n = NOW(), y = new Date(n); y.setDate(n.getDate() - 1);
  if (dayKey(d) === dayKey(n)) return "Today";
  if (dayKey(d) === dayKey(y)) return "Yesterday";
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()] + ", " + fmtDate(d);
};
const pad2 = (n) => String(n).padStart(2, "0");
const stamp = (d) => d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + "-" + pad2(d.getHours()) + pad2(d.getMinutes()) + pad2(d.getSeconds());
const iso = (d) => d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) + "T" + pad2(d.getHours()) + ":" + pad2(d.getMinutes());
const initials = (n) => String(n || "?").replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
const shortName = (name) => String(name || "").replace(/^(New MRP ?- ?|NP ?- ?|New )/i, "");

const ICONS = {
  logout: '<path d="M10 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H10"/><path d="m14.5 8 4 4-4 4"/><path d="M18.5 12h-9"/>',
  home: '<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9.5h12V10"/>',
  orders: '<rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M9 8.5h6M9 12h6M9 15.5h3.5"/>',
  truck: '<path d="M2.5 6.5h11v10h-11z"/><path d="M13.5 10h4l3 3v3.5h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  bolt: '<path d="M13 3 5.5 13.5H11l-1 7.5 7.5-10.5H12z"/>',
  box: '<path d="M4 8 12 4l8 4v8l-8 4-8-4z"/><path d="m4 8 8 4 8-4M12 12v8"/>',
  cycle: '<path d="M4.5 11a7.5 7.5 0 0 1 13.2-4.2L19.5 9"/><path d="M19.5 4.5V9H15"/><path d="M19.5 13a7.5 7.5 0 0 1-13.2 4.2L4.5 15"/><path d="M4.5 19.5V15H9"/>',
  rupee: '<path d="M7 5h10M7 9.5h10M7 5h3a4.5 4.5 0 0 1 0 9H7l7.5 6.5"/>',
  people: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8"/><circle cx="17" cy="9.5" r="2.3"/><path d="M16.5 14.4c2.2.2 3.6 1.7 4 4.1"/>',
  tag: '<path d="M3.5 12.2V4.5h7.7l9.3 9.3-7.7 7.7z"/><circle cx="8" cy="9" r="1.3"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  chevR: '<path d="m9 5 7 7-7 7"/>',
  chevL: '<path d="m15 5-7 7 7 7"/>',
  chevD: '<path d="m5 9 7 7 7-7"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  alert: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.3"/>',
  doc: '<path d="M7 3.5h7l4 4v13H7z"/><path d="M14 3.5v4h4M9.5 12h5M9.5 15.5h5"/>',
  pencil: '<path d="m4 20 1-4.5L16.5 4 20 7.5 8.5 19z"/><path d="m14.5 6 3.5 3.5"/>',
  trash: '<path d="M5 7h14M9.5 7V4.5h5V7M7 7l1 13h8l1-13"/>',
  phone: '<path d="M6 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5.5a2 2 0 0 1 2-2z"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M5.5 15.5V6A1.5 1.5 0 0 1 7 4.5h8.5"/>',
  cal: '<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 7.8v.3"/>',
  arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  undo: '<path d="M8 5 3.5 9.5 8 14"/><path d="M3.5 9.5H14a6 6 0 0 1 0 12h-3"/>',
  repeat: '<path d="M4 9.5V8a2.5 2.5 0 0 1 2.5-2.5H19"/><path d="m16 2.5 3 3-3 3"/><path d="M20 14.5V16a2.5 2.5 0 0 1-2.5 2.5H5"/><path d="m8 21.5-3-3 3-3"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18"/>',
};
const ic = (n, cls = "") => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ""}</svg>`;

/* ---- normalise seed data into working state ---- */
const distByKey = {};
D.distributors.forEach((d) => { d.special = false; distByKey[key(d.name)] = d; });
const SPECIAL = {};
D.special.distributors.forEach((n) => { const d = distByKey[key(n)]; if (d) { d.special = true; SPECIAL[d.name] = true; } });
const canonDist = (n) => (distByKey[key(n)] ? distByKey[key(n)].name : n);
const stockBySap = {};
D.stock.forEach((s) => { if (s.sap) stockBySap[s.sap] = s; });
const qcBySap = {};
D.qcStock.forEach((s) => { if (s.sap) qcBySap[s.sap] = s; });
const catBySap = {}, catByName = {};
D.catalog.forEach((c) => { if (c.sap) catBySap[c.sap] = c; catByName[key(c.name)] = c; });
const replBySap = {};
D.repl.rows.forEach((r) => { replBySap[r.sap] = r; });
const price = (sap) => (D.prices[sap] ? D.prices[sap][1] : null);
const ssRate = (sap) => (D.prices[sap] ? D.prices[sap][0] : null);

const linesByOrder = {};
D.orderLines.forEach((l) => { (linesByOrder[l.id] = linesByOrder[l.id] || []).push(l); });
D.orders.forEach((o) => { o.dist = canonDist(o.dist); });
D.oos.forEach((o) => { o.dist = canonDist(o.dist); });
D.tod.lines.forEach((o) => { o.dist = canonDist(o.dist); });
D.tod.byDist.forEach((o) => { o.name = canonDist(o.name); });
const qcLinesByPO = {};
D.qcLines.forEach((l) => { (qcLinesByPO[l.po] = qcLinesByPO[l.po] || []).push(l); });

const S = {
  route: "home",
  ordersTab: "Pending", ordersQ: "",
  draft: null,
  picked: {}, pickList: null,
  qcTab: "open", qcPlatform: "Swiggy", qcPicked: {}, qcOwn: true, qcOverride: {},
  stockTab: "own", stockQ: "", stockCat: "All",
  replTab: "plan", replFilter: "All", replOpen: null,
  moneyTab: "tod",
  setupTab: "distributors", setupQ: "",
  dash: { preset: "month", ch: "all", district: "all", from: "", to: "" },
  chartMode: {},
};
const newDraft = () => ({ dist: null, lines: [], editId: null, q: "", dq: "", notes: "" });
S.draft = newDraft();
D.qcPOs.forEach((p) => { if (p.status === "Open" && p.daysLeft >= 0) S.qcPicked[p.po] = true; });

/* ===== shell: router, sheet, modal, toast ===== */
const ROUTES = {
  home: { label: "Home", icon: "home" },
  orders: { label: "Orders", icon: "orders" },
  "new-order": { label: "New order", icon: "plus", parent: "orders" },
  dispatch: { label: "Dispatch", icon: "truck" },
  quick: { label: "Quick commerce", icon: "bolt" },
  stock: { label: "Stock", icon: "box" },
  replenish: { label: "Replenishment", icon: "cycle" },
  tod: { label: "TOD & notes", icon: "rupee" },
  logistics: { label: "Logistics", icon: "truck" },
  accounts: { label: "Accounts", icon: "book" },
  setup: { label: "Setup", icon: "gear" },
  activity: { label: "Activity log", icon: "clock" },
  more: { label: "More", icon: "grid" },
};
if (!SEE_MONEY) { delete ROUTES.tod; delete ROUTES.logistics; delete ROUTES.accounts; }
if (!CAN_EDIT) delete ROUTES["new-order"];
let sheetOpen = false;
const VIEWS = {};
const ACT = {};
const IN = {};
function go(route, opts) {
  if (!ROUTES[route]) route = "home";
  if (sheetOpen && !(opts && opts.keepSheet)) closeSheet();
  S.route = route;
  if (location.hash.slice(1) !== route) { try { history.replaceState(null, "", "#" + route); } catch (e) { location.hash = route; } }
  render();
  if (!(opts && opts.keepScroll)) { const m = $("#main"); if (m) m.scrollTop = 0; }
}
function pendingOrders() { return D.orders.filter((o) => o.status === "Pending"); }
function openQC() { return D.qcPOs.filter((p) => p.status === "Open"); }
function render() {
  const cur = ROUTES[S.route].parent || S.route;
  $$("[data-nav]").forEach((el) => {
    const on = el.dataset.nav === cur || (el.dataset.nav === "more" && ["quick", "replenish", "tod", "accounts", "setup", "activity", "backups", "more"].includes(cur) && el.classList.contains("tab"));
    if (on) el.setAttribute("aria-current", "page"); else el.removeAttribute("aria-current");
  });
  const pb = $("#badge-dispatch"); if (pb) { const n = pendingOrders().length; pb.textContent = n; pb.hidden = !n; }
  const qb = $("#badge-quick"); if (qb) { const n = openQC().length; qb.textContent = n; qb.hidden = !n; }
  const strip = typeof priceStrip === "function" ? priceStrip() : "", html = VIEWS[S.route]();
  $("#view").innerHTML = strip ? html.replace(/<div class="page[^"]*">/, (m) => m + strip) : html;
  if (typeof afterRender === "function") afterRender();
}
function part(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; }

function openSheet(title, body, foot, wide) {
  const sh = $("#sheet");
  sh.className = "sheet" + (wide ? " wide" : "");
  sh.innerHTML = `<div class="sheet-head"><div class="sheet-title grow clip">${title}</div><button class="icon-btn" data-act="closeSheet" aria-label="Close">${ic("x")}</button></div><div class="sheet-body" id="sheet-body">${body}</div>${foot ? `<div class="sheet-foot" id="sheet-foot">${foot}</div>` : ""}`;
  $("#scrim").hidden = false; sh.hidden = false; sheetOpen = true;
  requestAnimationFrame(() => { if (!sheetOpen) return; /* closed again before it appeared */ $("#scrim").classList.add("on"); sh.classList.add("on"); });
}
function closeSheet() {
  if (!sheetOpen) return;
  sheetOpen = false;
  $("#scrim").classList.remove("on"); $("#sheet").classList.remove("on");
  setTimeout(() => { if (!sheetOpen) { $("#scrim").hidden = true; $("#sheet").hidden = true; } }, 300);
}
ACT.closeSheet = closeSheet;
function toast(msg, icon = "check") {
  const t = document.createElement("div");
  t.className = "toast"; t.innerHTML = ic(icon, "sm") + `<span>${esc(msg)}</span>`;
  $("#toasts").appendChild(t);
  setTimeout(() => { t.style.transition = "opacity .3s"; t.style.opacity = "0"; setTimeout(() => t.remove(), 320); }, 2600);
}
function copyText(text, okMsg) {
  const done = () => toast(okMsg || "Copied");
  const fallback = () => { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (e) { toast("Select and copy the text", "info"); } ta.remove(); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(fallback); else fallback();
}
let ACT_N = 0;
function logActivity(action, ref, detail) { D.activity.unshift({ id: "A" + Date.now().toString(36) + (ACT_N++).toString(36) + Math.random().toString(36).slice(2, 5), time: iso(NOW()), action, ref, detail, by: HOST ? ME.name : undefined }); }

/* ---- small shared builders ---- */
const statusPill = (s) => {
  const m = { Pending: "warn", Dispatched: "good", Cancelled: "bad", Open: "info", Delivered: "good", Lapsed: "bad", Received: "good", "Part received": "warn", "Closed short": "bad", Expected: "warn", Claimed: "info", Active: "good" };
  return `<span class="pill ${m[s] || ""}">${esc(s)}</span>`;
};
const classPill = (c) => {
  const m = { Hero: "tint", Core: "info", Tail: "", Push: "warn", "Don't order": "bad" };
  return c ? `<span class="pill plain ${m[c] || ""}">${esc(c)}</span>` : "";
};
const seg = (name, value, opts) => `<div class="seg" role="group">${opts.map((o) => { const v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o, c = Array.isArray(o) ? o[2] : null; return `<button data-act="seg" data-name="${name}" data-value="${esc(v)}" aria-pressed="${String(value) === String(v)}">${esc(l)}${c != null ? `<span class="count">${c}</span>` : ""}</button>`; }).join("")}</div>`;
ACT.seg = (el) => { S[el.dataset.name] = el.dataset.value; render(); };
const deltaChip = (txt) => {
  if (!txt) return "";
  const t = String(txt), up = t.includes("▲"), dn = t.includes("▼");
  return `<span class="delta ${up ? "up" : dn ? "down" : "flat"}">${esc(t.replace("▲", "↑").replace("▼", "↓").replace(/-/g, "–"))}</span>`;
};
const growthChip = (g) => {
  if (g === "New") return `<span class="pill plain info">New</span>`;
  if (g == null || isNaN(g)) return "";
  const cls = g > 0.05 ? "up" : g < -0.05 ? "down" : "flat";
  return `<span class="delta ${cls}">${g > 0 ? "↑" : g < 0 ? "↓" : ""} ${Math.abs(g * 100).toFixed(0)}%</span>`;
};

/* ===== live sales engine: every dashboard number is worked out from the records, so it moves the moment
   an order is dispatched, a Swiggy / Zepto delivery is marked, a GRN is saved or a note is added.
   Same rules as the Excel dashboard: GT counts on the dispatch date, QC on the delivery date at the value
   accepted, Vyapar sales before the tool on the invoice date, credit notes on their date.
   GT gross profit = sales + TOD due from Hangyo - cost at the SS rate; QC gross profit = 6% of QC sales. ===== */
const QC_GP_RATE = 0.06;
const ymd = (d) => d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
const addDays = (s, n) => { const d = toDate(s); d.setDate(d.getDate() + n); return ymd(d); };
const daysBetween = (a, b) => Math.round((toDate(b) - toDate(a)) / 864e5);
const CH_LABEL = { gt: "Distributors", swiggy: "Swiggy", zepto: "Zepto" };

/* cost of one box at the SS rate, else the average Hangyo purchase rate, else the stock sheet cost */
const avgBuy = {};
(function () { const t = {}; D.purchases.forEach((p) => { if (p.supplier !== "Hangyo" || !p.sap || !(p.ea > 0) || !(p.rate > 0)) return; const a = (t[p.sap] = t[p.sap] || [0, 0]); a[0] += p.rate * p.ea; a[1] += p.ea; }); Object.keys(t).forEach((k) => { avgBuy[k] = t[k][0] / t[k][1]; }); })();
function unitCost(sap) { const p = D.prices[sap]; if (p && p[0] != null) return p[0]; if (avgBuy[sap] != null) return avgBuy[sap]; const s = stockBySap[sap]; return s && s.cost != null ? s.cost : null; }
const districtOf = (n) => (distByKey[key(n)] || {}).district || "Other";

const TODX_DIST = "TOD received for sales not in the tool";
function salesFacts() {
  const f = [];
  (D.salesBefore || []).forEach((r) => {
    const uc = unitCost(r.sap), ea = r.ea || 0;
    f.push({ date: r.date, ch: "gt", dist: canonDist(r.dist), sap: r.sap, product: r.product, crates: r.crates || 0, value: r.value || 0, tod: 0, cost: uc != null ? ea * uc : 0, noCost: uc == null, ref: r.inv, kind: r.type === "Credit Note" ? "return" : "vyapar" });
  });
  D.orders.forEach((o) => {
    if (o.status !== "Dispatched" || !o.dispatched) return;
    const dt = o.dispatched.slice(0, 10);
    (linesByOrder[o.id] || []).forEach((l) => { const uc = unitCost(l.sap); f.push({ date: dt, ch: "gt", dist: o.dist, sap: l.sap, product: l.product, crates: l.crates || 0, value: l.value || 0, tod: l.tod || 0, cost: uc != null ? (l.ea || 0) * uc : 0, noCost: uc == null, ref: o.id, kind: "order" }); });
  });
  D.notes.forEach((n) => {
    if (n.status !== "Active" || !n.sales) return;
    /* a note with product lines: one entry per product. A return put back into stock gives its cost back; a damaged one is a loss */
    if (Array.isArray(n.lines) && n.lines.length) {
      const sg = n.sales < 0 ? -1 : 1;
      n.lines.forEach((l) => { const uc = l.back && l.sap ? unitCost(l.sap) : null; f.push({ date: (n.date || "").slice(0, 10), ch: "gt", dist: canonDist(n.party), sap: l.sap || null, product: l.product, crates: sg * (l.crates || 0), value: sg * (l.value || 0), tod: 0, cost: uc != null ? sg * (l.ea || 0) * uc : 0, ref: n.no || n.id, kind: "note" }); });
      return;
    }
    const sap = n.sap || (catByName[key(n.product)] || {}).sap || null, back = /return/i.test(n.type || "") && sap && n.ea, uc = back ? unitCost(sap) : null;
    f.push({ date: (n.date || "").slice(0, 10), ch: "gt", dist: canonDist(n.party), sap, product: n.product, crates: -(n.crates || 0), value: n.sales, tod: 0, cost: uc != null ? -n.ea * uc : 0, ref: n.no, kind: "note" });
  });
  D.qcPOs.forEach((p) => {
    if (!p.deliveredOn || !(p.valueAccepted > 0)) return;
    const dt = p.deliveredOn.slice(0, 10), ch = p.platform.toLowerCase(), ls = (qcLinesByPO[p.po] || []).filter((l) => (l.accepted || 0) > 0);
    if (ls.length) ls.forEach((l) => { const v = l.valueAccepted != null ? l.valueAccepted : l.accepted * l.price; f.push({ date: dt, ch, dist: p.platform, sap: l.sap, product: l.product, crates: l.ppc ? l.accepted / l.ppc : 0, value: v, tod: 0, cost: v * (1 - QC_GP_RATE), ref: p.po, kind: "qc" }); });
    else f.push({ date: dt, ch, dist: p.platform, sap: null, product: null, crates: p.pcs ? (p.crates * (p.pcsAccepted || 0)) / p.pcs : 0, value: p.valueAccepted, tod: 0, cost: p.valueAccepted * (1 - QC_GP_RATE), ref: p.po, kind: "qc" });
  });
  /* TOD Hangyo paid for a month beyond what the tool has for it (sales from before the tool, or not entered):
     counted as TOD earned in that month, so the month's TOD and profit match what was actually received */
  ((D.tod && D.tod.receipts) || []).forEach((r) => {
    if (!r.month || !(r.excess > 0.005)) return;
    const end = ymd(new Date(+r.month.slice(0, 4), +r.month.slice(5, 7), 0)), today = ymd(NOW());
    f.push({ date: end < today ? end : today, ch: "gt", dist: TODX_DIST, sap: null, product: null, crates: 0, value: 0, tod: r.excess, cost: 0, ref: r.ref || "TOD " + r.month, kind: "todx" });
  });
  return f;
}

/* ---- filters: period + channel + district ---- */
const DASH_PRESETS = [["today", "Today"], ["7d", "Last 7 days"], ["month", "This month"], ["lastMonth", "Last month"], ["3m", "Last 3 months"], ["all", "All time"], ["custom", "Custom dates"]];
const DASH_CHANNELS = [["all", "All channels"], ["gt", "Distributors (GT)"], ["qc", "Quick commerce (QC)"], ["swiggy", "Swiggy"], ["zepto", "Zepto"]];
const MONTH_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function firstSaleDate() { let m = "9999"; (D.salesBefore || []).forEach((r) => { if (r.date < m) m = r.date; }); D.qcPOs.forEach((p) => { if (p.deliveredOn && p.deliveredOn.slice(0, 10) < m) m = p.deliveredOn.slice(0, 10); }); return m; }
function dashRange() {
  const F = S.dash, today = ymd(NOW()), t = toDate(today);
  const monthStart = (y, m) => ymd(new Date(y, m, 1)), monthEnd = (y, m) => ymd(new Date(y, m + 1, 0));
  let from, to, pFrom, pTo, label, cmpLabel;
  if (F.preset === "today") { from = to = today; pFrom = pTo = addDays(today, -1); label = "Today"; cmpLabel = "yesterday"; }
  else if (F.preset === "7d") { from = addDays(today, -6); to = today; pFrom = addDays(from, -7); pTo = addDays(to, -7); label = "Last 7 days"; cmpLabel = "the 7 days before"; }
  else if (F.preset === "lastMonth") { const y = t.getFullYear(), m = t.getMonth() - 1; from = monthStart(y, m); to = monthEnd(y, m); pFrom = monthStart(y, m - 1); pTo = monthEnd(y, m - 1); label = MONTH_LONG[(m + 12) % 12]; cmpLabel = MONTH_LONG[(m + 11) % 12]; }
  else if (F.preset === "3m") { const y = t.getFullYear(), m = t.getMonth(); from = monthStart(y, m - 2); to = today; pFrom = monthStart(y, m - 5); pTo = addDays(from, -1); label = "Last 3 months"; cmpLabel = "the 3 months before"; }
  else if (F.preset === "all") { from = firstSaleDate(); to = today; pFrom = pTo = null; label = "All time"; cmpLabel = ""; }
  else if (F.preset === "custom") { from = F.from || today; to = F.to || today; if (to < from) { const x = from; from = to; to = x; } const n = daysBetween(from, to) + 1; pTo = addDays(from, -1); pFrom = addDays(pTo, -(n - 1)); label = fmtDate(from) + " – " + fmtDate(to); cmpLabel = "the " + n + " days before"; }
  else { const y = t.getFullYear(), m = t.getMonth(), day = t.getDate(); from = monthStart(y, m); to = today; pFrom = monthStart(y, m - 1); pTo = ymd(new Date(y, m - 1, Math.min(day, new Date(y, m, 0).getDate()))); label = MONTH_LONG[m] + " so far"; cmpLabel = "1–" + day + " " + MONTH_LONG[(m + 11) % 12].slice(0, 3); }
  return { from, to, pFrom, pTo, label, cmpLabel, days: daysBetween(from, to) + 1, isMonthToDate: F.preset === "month" };
}
function chMatch(f, ch, district) {
  if (ch === "gt" && f.ch !== "gt") return false;
  if (ch === "qc" && f.ch === "gt") return false;
  if ((ch === "swiggy" || ch === "zepto") && f.ch !== ch) return false;
  if (district !== "all" && (f.ch !== "gt" || districtOf(f.dist) !== district)) return false;
  return true;
}
function factsIn(facts, from, to) { return from ? facts.filter((f) => f.date >= from && f.date <= to && chMatch(f, S.dash.ch, S.dash.district)) : []; }

/* ---- the numbers for one period ---- */
function periodStats(facts, from, to) {
  const F = factsIn(facts, from, to), s = { facts: F, net: 0, gt: 0, swiggy: 0, zepto: 0, crates: 0, gtCrates: 0, toolCrates: 0, qcCrates: 0, gpGT: 0, gpQC: 0, tod: 0, returns: 0, noCost: 0, noCostP: {}, orders: new Set(), dists: new Set(), missed: 0, qcOrdered: 0, qcAccepted: 0, o2d: [], qcDeliveries: new Set() };
  if (!from) return s;
  s.todx = 0;
  F.forEach((f) => {
    if (f.kind === "todx") { s.tod += f.tod; s.todx += f.tod; return; } /* extra TOD received: added to profit as it is, below */
    s.net += f.value; s[f.ch] += f.value; s.crates += f.crates;
    if (f.ch === "gt") { s.gtCrates += f.crates; if (f.kind === "order") s.toolCrates += f.crates; if (f.noCost && f.value > 0) { s.noCost += f.value; s.noCostP[f.product || f.sap] = (s.noCostP[f.product || f.sap] || 0) + f.value; } else s.gpGT += f.value + f.tod - f.cost; s.tod += f.tod; if (f.kind === "note" || f.kind === "return") s.returns += -f.value; else if (f.kind !== "todx") { s.orders.add(f.ref); if (f.value > 0) s.dists.add(f.dist); } }
    else { s.qcCrates += f.crates; s.gpQC += f.value * QC_GP_RATE; s.qcDeliveries.add(f.ref); }
  });
  const ch = S.dash.ch, dsel = S.dash.district;
  if (ch === "all" || ch === "gt") D.oos.forEach((o) => { const ord = D.orders.find((x) => x.id === o.id), d = ord && ord.status === "Dispatched" && ord.dispatched ? ord.dispatched.slice(0, 10) : null; if (typeof o.missed === "number" && d && d >= from && d <= to && (dsel === "all" || districtOf(o.dist) === dsel)) s.missed += o.missed; });
  if (dsel === "all" && ch !== "gt") D.qcPOs.forEach((p) => { const d = (p.deliveredOn || (p.status === "Lapsed" ? p.expiry : "") || "").slice(0, 10); if (!d || d < from || d > to) return; if ((ch === "swiggy" || ch === "zepto") && p.platform.toLowerCase() !== ch) return; s.qcOrdered += p.pcs || 0; s.qcAccepted += p.pcsAccepted || 0; });
  D.orders.forEach((o) => { if (o.status === "Dispatched" && o.dispatched && o.dispatched.slice(0, 10) >= from && o.dispatched.slice(0, 10) <= to && (ch === "all" || ch === "gt") && (dsel === "all" || districtOf(o.dist) === dsel)) s.o2d.push((toDate(o.dispatched) - toDate(o.time)) / 864e5); });
  /* sales of products with no cost price would count as pure profit: estimate their profit at the margin of the rest */
  if (s.noCost) { const base = s.gt - s.noCost + s.tod - s.todx; s.gpEst = base > 0 ? s.noCost * (s.gpGT / base) : 0; s.gpGT += s.gpEst; }
  s.gpGT += s.todx;
  s.qc = s.swiggy + s.zepto; s.gp = s.gpGT + s.gpQC;
  s.margin = s.net + s.tod ? s.gp / (s.net + s.tod) : null;
  s.fillGT = s.toolCrates + s.missed > 0 ? s.toolCrates / (s.toolCrates + s.missed) : null;
  s.fillQC = s.qcOrdered ? s.qcAccepted / s.qcOrdered : null;
  s.avgOrder = s.orders.size ? s.gt / s.orders.size : null;
  s.o2dAvg = s.o2d.length ? s.o2d.reduce((a, b) => a + b, 0) / s.o2d.length : null;
  return s;
}
function groupBy(F, keyFn) {
  const m = {};
  F.forEach((f) => { const k = keyFn(f); if (k == null) return; const g = (m[k] = m[k] || { key: k, value: 0, crates: 0, refs: new Set(), last: null }); g.value += f.value; g.crates += f.crates; if (f.kind !== "note") g.refs.add(f.ref); if (!g.last || f.date > g.last) g.last = f.date; });
  return m;
}
function monthsSeries(facts) {
  const m = {}, first = firstSaleDate(), now = NOW();
  for (let d = new Date(+first.slice(0, 4), +first.slice(5, 7) - 1, 1); d <= now; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) m[ymd(d).slice(0, 7)] = { k: ymd(d).slice(0, 7), gt: 0, swiggy: 0, zepto: 0 };
  facts.forEach((f) => { const k = f.date.slice(0, 7); if (m[k] && chMatch(f, S.dash.ch, S.dash.district)) m[k][f.ch] += f.value; });
  return Object.values(m).map((x) => ({ ...x, net: x.gt + x.swiggy + x.zepto, label: MONTH_LONG[+x.k.slice(5) - 1].slice(0, 3) + (x.k === ymd(now).slice(0, 7) ? "*" : "") }));
}
function purchasesIn(from, to) { let own = 0, qc = 0; D.purchases.forEach((p) => { const d = String(p.invDate || p.time || "").slice(0, 10); /* by invoice date */ if (p.supplier !== "Hangyo" || d < from || d > to) return; if (/QC/i.test(p.pool || "")) qc += p.value || 0; else own += p.value || 0; }); return { own, qc, total: own + qc }; }
function stockValue() {
  let own = 0, qc = 0; const cats = {};
  D.stock.forEach((s) => { const uc = unitCost(s.sap), v = (s.ea || 0) * (uc || 0); own += v; if (v) cats[s.cat || "Other"] = (cats[s.cat || "Other"] || 0) + v; });
  D.qcStock.forEach((q) => { const uc = unitCost(q.sap), v = (q.crates || 0) * (q.upc || 0) * (uc || 0); qc += v; if (v) cats["Quick commerce stock"] = (cats["Quick commerce stock"] || 0) + v; });
  return { own, qc, total: own + qc, cats };
}

/* ===== live truck plan: the Excel "Plan the Truck" engine, worked out again every time it is looked at,
   from today's date, the orders, missed sales, Vyapar sales before the tool, stock and open Hangyo POs.
   Your rules per product (order rule, min, max, adjust, your crates) and the Rules page are kept as inputs. ===== */
function normInv(p) { // Acklam's inverse normal, accurate to about 1e-9
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239], b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572], c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783], d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const pl = 0.02425; let q, r;
  if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > 1 - pl) { q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  q = p - 0.5; r = q * q; return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}
const xr = (v, n = 0) => { const f = Math.pow(10, n); return Math.sign(v) * Math.round(Math.abs(v) * f + 1e-9) / f; }; // Excel ROUND
const roundUp = (v) => (v > 0 ? Math.ceil(v - 1e-12) : Math.floor(v + 1e-12));
const roundDown = (v) => (v > 0 ? Math.floor(v + 1e-12) : Math.ceil(v - 1e-12));
function replSetting(re, dflt) { const s = (D.repl.settings || []).find((x) => re.test(x.name)); return s && s.value !== "" && s.value != null ? s.value : dflt; }
function replCfg() {
  const num = (re, d) => { const v = replSetting(re, d); return typeof v === "number" ? v : isNaN(+v) ? d : +v; }, yes = (re, d) => String(replSetting(re, d)).trim().toUpperCase() === "YES";
  const dateOf = (re, d) => { const v = replSetting(re, d); return v ? String(v).slice(0, 10) : d; };
  const svc = (v) => normInv(Math.min(0.999, Math.max(0.5, v)));
  return {
    truck: num(/^Truck size/, 630), lead: num(/^Lead time/, 2), season: num(/^Season factor/, 1),
    w14: num(/last 14 days/, 0.5), w28: num(/days 15 to 28/, 0.3), w56: num(/days 29 to 56/, 0.2),
    heroShare: num(/^Hero: SKUs making/, 0.6), coreShare: num(/^Core: SKUs up to/, 0.9), heroMinOrders: num(/^Hero: in at least/, 0.2),
    zHero: svc(num(/Service level: Hero/, 0.95)), zCore: svc(num(/Service level: Core/, 0.9)), zTail: svc(num(/Service level: Tail/, 0.7)),
    ssMax: num(/^Most safety stock/, 7), heroExtra: num(/Hero can be topped/, 10), coreExtra: num(/Core SKU can be topped/, 5),
    pushDays: num(/keep about/, 7), pushTrigger: num(/reorder only below/, 3), qcSafety: num(/^QC: extra days/, 3),
    countMissed: yes(/Count missed sales/, "Yes"), toolFrom: dateOf(/Order tool sales counted from/, "2026-10-08"), seedTo: dateOf(/counted up to/, "2026-10-09"), scale: yes(/^Scale sales/, "Yes"),
  };
}
/* one-time tidy-up: "Your crates" and the typed QC crates belonged to the plan the last Hangyo PO was placed from */
(function clearPlacedPlan() {
  const lastPO = D.hpoLog.reduce((m, l) => (l.placed > m ? l.placed : m), "");
  if (D.repl.planned && lastPO && lastPO >= D.repl.planned) { D.repl.rows.forEach((r) => { r.yours = null; }); D.repl.qcCrates = null; D.repl.planned = null; }
})();
/* products counted as another one (an old pack and its new code): sales, missed sales, stock and on-order go to
   the one you order, and they are not ordered themselves. Set on the Excel Replenishment sheet, column AN. */
(function sameSkuDefaults() {
  if (D.repl.sameSet) return;
  const dflt = { "5300012": "9000001", "5300014": "9000004", "5300187": "9000003" };
  D.repl.rows.forEach((r) => { if (r.same === undefined) r.same = dflt[r.sap] || null; });
  D.repl.sameSet = true;
})();
function syncReplRows() {
  D.stock.forEach((s) => { if (!replBySap[s.sap]) { const r = { sap: s.sap, name: s.name, cat: s.cat, upc: s.upc, rule: "", reason: "", min: null, max: null, adj: null, yours: null }; D.repl.rows.push(r); replBySap[s.sap] = r; } });
}
let REPL_AT = null;
function recomputeRepl() {
  syncReplRows();
  const C = replCfg(), today = ymd(NOW()), rows = D.repl.rows, idx = {};
  rows.forEach((r) => { idx[r.sap] = r; Object.assign(r, { _d14: 0, _d28: 0, _d56: 0, _miss: 0, _ord: 0, _wk: [0, 0, 0, 0, 0, 0, 0, 0], _to: null, _f: 1, _main: false }); const st = stockBySap[r.sap]; if (st) { r.name = st.name; r.upc = st.upc; r.cat = st.cat; } });
  rows.forEach((r) => { const t = r.same && idx[r.same]; if (t && t !== r && !t.same) { r._to = t; t._main = true; r._f = r.upc > 0 && t.upc > 0 ? r.upc / t.upc : 1; } });
  const nowIso = iso(NOW()), seenMain = new Set();
  const ids = new Set();
  const add = (sap, date, q, ordKey) => {
    const age = daysBetween(date, today); if (age < 0 || age > 55) return;
    if (ordKey && age <= 27) ids.add(ordKey);
    let r = idx[sap]; if (!r) return;
    if (r._to) { q *= r._f; r = r._to; }
    if (age <= 13) r._d14 += q; else if (age <= 27) r._d28 += q; else r._d56 += q;
    r._wk[Math.floor(age / 7)] += q;
    return { r, age };
  };
  D.orders.forEach((o) => {
    if (o.status === "Cancelled") return; const d = o.time.slice(0, 10); if (d < C.toolFrom) return;
    if (o.time > nowIso) return;
    (linesByOrder[o.id] || []).forEach((l) => { const x = add(l.sap, d, l.crates || 0, "T:" + o.id); if (x && x.age <= 27) { const k = "T:" + o.id + "|" + x.r.sap; if (!x.r._main) x.r._ord++; else if (!seenMain.has(k)) { seenMain.add(k); x.r._ord++; } } });
  });
  if (C.countMissed) D.oos.forEach((m) => { if (typeof m.missed !== "number" || !(m.missed > 0)) return; const d = (m.time || "").slice(0, 10); if (d < C.toolFrom) return; if ((m.time || "") > nowIso) return; const x = add(m.sap, d, m.missed); if (x && x.age <= 27) x.r._miss += m.missed * (idx[m.sap] && idx[m.sap]._to ? idx[m.sap]._f : 1); });
  (D.salesBefore || []).forEach((s) => { if (s.date > C.seedTo) return; const q = s.crates || 0; const x = add(s.sap, s.date, q, q > 0 ? "S:" + s.inv : null); if (x && x.age <= 27 && q > 0) { const k = "S:" + s.inv + "|" + x.r.sap; if (!x.r._main) x.r._ord++; else if (!seenMain.has(k)) { seenMain.add(k); x.r._ord++; } } });
  const orders28 = ids.size, wsum = C.w14 + C.w28 + C.w56 || 1;
  let sumJ = 0, sumAM = 0;
  rows.forEach((r) => {
    const m = r._wk.reduce((a, b) => a + b, 0) / 8; r.swing = xr(Math.sqrt(r._wk.reduce((a, b) => a + (b - m) * (b - m), 0) / 8), 2);
    r.s14 = xr(r._d14, 2); r.s28 = xr(r._d28, 2); r.s56 = xr(r._d56, 2); r.missed = xr(r._miss, 2); r.orders = r._ord;
    r._am = xr((C.w14 * r.s14 / 14 + C.w28 * r.s28 / 14 + C.w56 * r.s56 / 28) / wsum, 6); sumJ += r.s14; sumAM += r._am;
  });
  const level = C.scale && sumAM > 0 ? xr(sumJ / 14 / sumAM, 6) : 1;
  let G10 = 0; rows.forEach((r) => { r.perDay = xr(r._am * level * C.season, 3); G10 += r.perDay; });
  /* quick commerce side (QC Stock sheet) */
  let qcPerDay = 0; const qcRows = D.qcStock.map((q) => {
    let pcs28 = 0; D.qcPOs.forEach((p) => { const age = daysBetween(p.date.slice(0, 10), today); if (age < 0 || age > 27 || p.status === "Cancelled") return; (qcLinesByPO[p.po] || []).forEach((l) => { if (l.sap === q.sap && l.ppc > 0) pcs28 += l.pcs / l.ppc; }); });
    q.ord28 = xr(pcs28, 2); q.perDay = xr((q.ord28 / 28) * C.season, 3); qcPerDay += q.perDay; return q;
  });
  const cycle = xr(Math.min(30, Math.max(5, C.truck / Math.max(0.01, G10 + qcPerDay))), 1);
  let qcPlan = 0;
  const qcSug = (q, crates) => Math.max(0, roundUp(xr(q.target - crates - q.onOrder - 0.1, 4)));
  /* quick commerce stock available for sale: less what distributor orders were promised from it (crates held for sent pick lists are part of the open POs already in the target) */
  const qcAvail = (q) => (q.crates || 0) - (typeof gtFromQC === "function" ? gtFromQC(q.sap) : 0);
  qcRows.forEach((q) => {
    const pcsPerCrate = (q.upc || 0) * (q.ppe || 0) || q.ppc || 0;
    let open = 0; D.qcPOs.forEach((p) => { if (p.status !== "Open" || p.expiry.slice(0, 10) < today) return; (qcLinesByPO[p.po] || []).forEach((l) => { if (l.sap === q.sap && l.status === "Open") open += l.pcs; }); });
    q.openPcs = open; q.openCrates = pcsPerCrate ? xr(open / pcsPerCrate, 2) : 0;
    q.onOrder = D.hpoLog.filter((l) => l.sap === q.sap && /QC/i.test(l.pool) && (l.status === "Open" || l.status === "Part received")).reduce((a, l) => a + Math.max(0, (l.crates || 0) - (l.upc ? (l.received || 0) / l.upc : 0)), 0);
    q.target = xr(q.perDay * (C.lead + cycle + C.qcSafety) + q.openCrates, 2);
    q.suggested = qcSug(q, qcAvail(q));
    q.final = q.yours != null && q.yours !== "" ? +q.yours : q.suggested; qcPlan += q.final;
    q.daysAfter = q.perDay > 0 ? xr((qcAvail(q) + q.onOrder - q.openCrates) / q.perDay, 1) : null;
  });
  /* classes, stock, targets */
  const PEND = pendingEA();
  rows.forEach((r) => {
    r.share = G10 > 0 ? r.perDay / G10 : 0;
    r._al = G10 > 0 ? rows.reduce((a, x) => a + (x.perDay > r.perDay ? x.perDay : 0), 0) / G10 : 0;
    r.clsData = r._to ? "Same SKU" : r.perDay <= 0 ? "No sales" : r._al < C.heroShare && r.orders >= C.heroMinOrders * orders28 ? "Hero" : r._al < C.coreShare ? "Core" : "Tail";
    r.cls = r._to ? "Same SKU" : r.rule && r.rule !== "Auto" ? r.rule : r.clsData;
    /* stock available for sale: at Tropicana, less what is reserved for orders not yet dispatched and Swiggy / Zepto pick lists */
    const ownEA = (s) => { const st = stockBySap[s.sap]; return st ? stockSplit(st, PEND).avail : 0; }, ordEA = (s) => D.hpoLog.filter((l) => l.sap === s.sap && /own/i.test(l.pool) && (l.status === "Open" || l.status === "Part received")).reduce((a, l) => a + Math.max(0, (l.boxes || (l.crates || 0) * (l.upc || 0)) - (l.received || 0)), 0);
    const linked = rows.filter((x) => x._to === r), upc = r.upc || (stockBySap[r.sap] || {}).upc || 0;
    r.stock = upc ? (ownEA(r) + linked.reduce((a, x) => a + ownEA(x), 0)) / upc : 0;
    r.onOrder = upc ? (ordEA(r) + linked.reduce((a, x) => a + ordEA(x), 0)) / upc : 0;
    const have = r.stock + r.onOrder, P = r.perDay, S2 = r.cls, noSS = S2 === "Push" || S2 === "Don't order" || S2 === "Same SKU" || P <= 0;
    const z = S2 === "Hero" ? C.zHero : S2 === "Core" ? C.zCore : S2 === "Tail" || S2 === "No sales" ? C.zTail : 0;
    r.days = P > 0 ? xr(have / P, 1) : null;
    r.safety = noSS ? 0 : xr(Math.min(z * r.swing * Math.sqrt((C.lead + cycle) / 7), P * C.ssMax), 2);
    r.rop = xr(P * C.lead + (noSS ? 0 : Math.min(z * r.swing * Math.sqrt(C.lead / 7), P * C.ssMax)), 2);
    const base = S2 === "Push" ? P * C.pushDays : P * (C.lead + cycle) + r.safety, mn = +r.min || 0, mx = r.max != null && r.max !== "" ? +r.max : null;
    r.target = S2 === "Don't order" || S2 === "Same SKU" ? 0 : xr(Math.max(mn, mx != null ? Math.min(mx, base) : base), 2);
    r._nr = (h) => {
      let need = 0;
      if (S2 !== "Don't order" && S2 !== "Same SKU") {
        need = S2 === "Push" ? (h < Math.max(P * C.pushTrigger, mn) ? xr(r.target - h, 0) : 0) : S2 === "Hero" || S2 === "Core" ? roundUp(xr(Math.max(0, r.target - h) - 0.1, 4)) : xr(Math.max(0, r.target - h), 0);
        need = Math.max(0, Math.max(0, need) + (+r.adj || 0));
      }
      const lim = r.target + P * (S2 === "Hero" ? C.heroExtra : C.coreExtra);
      return { need, room: S2 !== "Hero" && S2 !== "Core" ? 0 : Math.max(0, roundDown(xr((mx != null ? Math.min(mx, lim) : lim) - h - need, 4))) };
    };
    const nr = r._nr(have); r.need = nr.need; r.room = nr.room;
    r.belowRop = (S2 === "Hero" || S2 === "Core") && P > 0 && have < r.rop ? 1 : 0;
    r._untilRop = (S2 === "Hero" || S2 === "Core") && P > 0 ? Math.max(0, xr((have - r.rop) / P, 1)) : null;
    r._fixed = r.yours != null && r.yours !== "";
  });
  /* fill the truck to its size, or trim it */
  const qcOnTruck = D.repl.qcCrates != null && D.repl.qcCrates !== "" ? +D.repl.qcCrates : qcPlan;
  const cap = D.repl.ownOverride > 0 ? +D.repl.ownOverride : Math.max(0, C.truck - qcOnTruck);
  /* one fill-or-trim pass; T is the field it writes ("top" for the real plan, "_atop" for the plan without your crates) */
  const fill = (capX, useFixed, T) => {
    const fx = (r) => useFixed && r._fixed;
    rows.forEach((r) => { r[T] = 0; });
    let gap = capX - rows.reduce((a, r) => a + (fx(r) ? +r.yours : r.need), 0), topup = 0, trimmed = 0, shortC = 0, overC = 0;
    const cov = (r) => (r.stock + r.onOrder + r.need + r[T]) / r.perDay;
    if (gap > 0) {
      for (const cls of ["Hero", "Core"]) {
        while (gap > 0) {
          let best = null;
          rows.forEach((r) => { if (fx(r) || r.cls !== cls || !(r.perDay > 0) || r[T] >= r.room) return; if (!best || cov(r) < cov(best) || (cov(r) === cov(best) && r.perDay > best.perDay)) best = r; });
          if (!best) break; best[T]++; gap--; topup++;
        }
      }
      shortC = gap;
    } else if (gap < 0) {
      let excess = -gap;
      for (const cls of ["Push", "Tail", "No sales", "Core", "Hero"]) {
        while (excess > 0) {
          let best = null;
          rows.forEach((r) => { if (fx(r) || r.cls !== cls || !(r.need + r[T] > 0)) return; const c = r.perDay > 0 ? cov(r) : 1e18; const bc = best ? (best.perDay > 0 ? cov(best) : 1e18) : -1; if (!best || c > bc || (c === bc && r.perDay < best.perDay)) best = r; });
          if (!best) break; best[T]--; excess--; trimmed++;
        }
      }
      overC = excess;
    }
    return { topup, trimmed, shortC, overC };
  };
  /* the plan's own numbers, without anything you typed (own crates, QC crates, QC total) */
  const capAuto = D.repl.ownOverride > 0 ? +D.repl.ownOverride : Math.max(0, C.truck - qcRows.reduce((a, q) => a + q.suggested, 0));
  fill(capAuto, false, "_atop");
  const F = fill(cap, true, "top"), topup = F.topup, trimmed = F.trimmed, shortC = F.shortC, overC = F.overC;
  let G8 = 0, L8 = 0, G7 = 0, ownFinal = 0, minUntil = null;
  rows.forEach((r) => {
    r.suggested = Math.max(0, r.need + r.top); r.final = r._fixed ? +r.yours : r.suggested; r.boxes = r.final * (r.upc || 0);
    r.autoFinal = Math.max(0, r.need + r._atop); r.delta = r.final - r.autoFinal;
    r.daysAfter = r.perDay > 0 ? xr((r.stock + r.onOrder + r.final) / r.perDay, 1) : null; r.value = r.boxes * (ssRate(r.sap) || 0);
    const notes = [];
    if (r._to) notes.push(`Counted in ${shortName(r._to.name)} (same product), not ordered itself.`);
    if (r._main) notes.push(`Also counts ${rows.filter((x) => x._to === r).map((x) => shortName(x.name)).join(", ")} (same product).`);
    if (r.cls === "Don't order") notes.push("Not ordered" + (r.reason ? ": " + r.reason : "") + ".");
    if (r.missed > 0 && r.cls !== "Don't order") notes.push(`Missed ${nf(r.missed, 1)} crate(s) in the last 28 days.`);
    if (r.perDay <= 0 && r.stock > 0) notes.push(`No sales in 8 weeks, ${nf(r.stock, 1)} crate(s) in stock.`);
    if (r.perDay > 0 && r.days > C.lead + cycle + C.heroExtra) notes.push(`Overstocked: ${nf(r.days, 1)} days of stock.`);
    r.note = notes.join(" ");
    G8 += r.need; L8 += r.room; G7 += r.belowRop; ownFinal += r.final; if (r._untilRop != null && (minUntil == null || r._untilRop < minUntil)) minUntil = r._untilRop;
  });
  /* when can a full truck go? Walk forward day by day, stock falling at each product's sales rate */
  const qcTyped = D.repl.qcCrates != null && D.repl.qcCrates !== "";
  const fillsOn = (k) => {
    const qcK = qcTyped ? +D.repl.qcCrates : qcRows.reduce((a, q) => a + (q.yours != null && q.yours !== "" ? +q.yours : qcSug(q, Math.max(0, (q.crates || 0) - (typeof gtFromQC === "function" ? gtFromQC(q.sap) : 0) - q.perDay * k))), 0);
    const capK = D.repl.ownOverride > 0 ? +D.repl.ownOverride : Math.max(0, C.truck - qcK);
    let s = 0; rows.forEach((r) => { if (r._fixed) { s += +r.yours; return; } const x = r._nr(Math.max(0, r.stock + r.onOrder - r.perDay * k)); s += x.need + x.room; });
    return s >= capK;
  };
  let fullIn = null; for (let k = 0; k <= 60; k++) if (fillsOn(k)) { fullIn = k; break; }
  const decision = fullIn === 0 ? "ORDER NOW" : fullIn != null && fullIn <= 7 ? "ORDER SOON" : "HOLD";
  const orderBy = fullIn != null ? addDays(today, fullIn) : null;
  /* Hero/Core products that will run out before a truck ordered on that date arrives */
  const arriveIn = (fullIn != null ? fullIn : 60) + C.lead;
  const runOut = rows.filter((r) => (r.cls === "Hero" || r.cls === "Core") && r.perDay > 0 && (r.stock + r.onOrder) / r.perDay < arriveIn).sort((a, b) => (a.stock + a.onOrder) / a.perDay - (b.stock + b.onOrder) / b.perDay);
  rows.forEach((r) => { r.runsOut = runOut.includes(r) ? addDays(today, Math.floor((r.stock + r.onOrder) / r.perDay)) : null; });
  const dayTxt = (d) => (d === today ? "today" : d === addDays(today, 1) ? "tomorrow" : fmtDate(d));
  const names = (list) => list.slice(0, 3).map((r) => shortName(r.name).split("(")[0].trim()).join(", ") + (list.length > 3 ? ` and ${list.length - 3} more` : "");
  const warn = runOut.length ? ` ${runOut.length} Hero/Core product${runOut.length > 1 ? "s" : ""} will run out before ${decision === "ORDER NOW" ? "the truck arrives" : "that truck arrives"}: ${names(runOut)}.` : "";
  let why;
  if (decision === "ORDER NOW") why = `A full truck of ${nf(C.truck)} crates can go today: ${nf(ownFinal)} own stock and ${nf(qcOnTruck)} quick commerce.${G7 ? ` ${G7} Hero/Core product${G7 > 1 ? "s are" : " is"} below the reorder point.` : ""}${warn}`;
  else if (decision === "ORDER SOON") why = `A full ${nf(C.truck)}-crate truck is needed ${dayTxt(orderBy)}. Ordered today the plan would only reach ${nf(ownFinal + qcOnTruck)} crates.${warn}${runOut.length ? ` To order earlier, type extra crates under "Your crates" to make up ${nf(C.truck)}.` : ""}`;
  else why = orderBy ? `No truck needed yet. The next full truck is due around ${fmtDate(orderBy)}.${warn}` : `No truck needed in the next 60 days at today's sales.${warn}`;
  /* what you changed, and what the plan moved to keep the truck at its size */
  const youSet = rows.filter((r) => r._fixed && r.delta !== 0), moved = rows.filter((r) => !r._fixed && r.delta !== 0);
  qcRows.forEach((q) => { q.autoFinal = q.suggested; q.delta = q.final - q.suggested; });
  const qcYou = qcRows.filter((q) => q.delta !== 0);
  D.repl.changes = { youSet: youSet.map((r) => r.sap), moved: moved.map((r) => r.sap), qcYou: qcYou.map((q) => q.sap), qcTotal: qcTyped ? +D.repl.qcCrates - qcRows.reduce((a, q) => a + q.final, 0) : 0, capAuto, capNow: cap };
  Object.assign(D.repl, { truck: C.truck, qcPlan, qcOnTruck, cap, ownPlan: cap, ownFinal, total: ownFinal + qcOnTruck, decision, why, fullIn, runOut: runOut.length, belowRop: G7, baseNeed: G8, topUp: L8, orderBy, perDay: xr(G10, 2), qcPerDay: xr(qcPerDay, 2), truckDays: cycle, short: shortC, over: overC, toppedUp: topup, trimmed });
  REPL_AT = NOW();
  return D.repl;
}

/* ===== ADD A FILE: choose it, drag it in, or paste it =====
   One drop zone used wherever a file comes in (distributor orders, Swiggy / Zepto POs, Hangyo invoices,
   Tropicana's statement). Click it to choose a file; drag a file onto it (or anywhere on the open sheet or page);
   or paste a copied file with ⌘V / Ctrl+V. The file is handed to the zone's own <input type="file">, so the screen
   behind it reads it exactly as if it had been chosen. */
ICONS.upload = '<path d="M12 15.5V4.5"/><path d="m7.5 9 4.5-4.5L16.5 9"/><path d="M4.5 14.5v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"/>';
const DROP_TOUCH = typeof matchMedia === "function" && matchMedia("(hover: none)").matches;
const DROP_KEY = /Mac|iPhone|iPad/i.test((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent) ? "⌘V" : "Ctrl+V";
const dropSize = (n) => (n >= 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB");
/* o: { input, dataIn, accept, title, sub, file, compact } */
function dropZone(o) {
  const name = o.file ? `<span class="drop-file">${ic("doc", "sm")}${esc(o.file.name || o.file)}</span>` : "";
  return `<div class="drop${o.compact ? " compact" : ""}${o.file ? " has" : ""}" data-drop="${esc(o.input)}" data-act="dropPick" data-for="${esc(o.input)}" role="button" tabindex="0" aria-label="${esc(o.title)}. Choose a file, drop one here, or paste it.">
    <input id="${esc(o.input)}" type="file" accept="${esc(o.accept)}" hidden data-in="${esc(o.dataIn)}">
    <span class="drop-ic">${ic("upload")}</span>
    <span class="drop-text"><span class="drop-title">${esc(o.title)}</span><span class="drop-sub" id="${esc(o.input)}-name">${name || esc(o.sub || "")}</span></span>
    <span class="drop-end">${DROP_TOUCH ? `<span class="drop-btns"><span class="btn btn-secondary btn-sm drop-btn">Choose file</span><button type="button" class="btn btn-secondary btn-sm drop-btn" data-act="dropPaste" data-for="${esc(o.input)}">${ic("copy", "sm")} Paste</button></span>` : `<span class="btn btn-secondary btn-sm drop-btn">Choose file</span><span class="drop-or">or drop · <kbd>${DROP_KEY}</kbd></span>`}</span>
    <span class="drop-paste" id="${esc(o.input)}-paste" hidden></span>
  </div>`;
}
ACT.dropPick = (el, e) => { const inp = $("#" + el.dataset.for); if (!inp || (e && e.target && e.target.tagName === "INPUT")) return; inp.value = ""; inp.click(); };
document.addEventListener("keydown", (e) => { const z = e.target && e.target.closest && e.target.closest("[data-drop]"); if (z && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); ACT.dropPick(z); } });
/* show the chosen file's name in its zone, whichever way it came in */
document.addEventListener("change", (e) => { const z = e.target.closest && e.target.closest("[data-drop]"); if (z) dropShow(z, e.target.files && e.target.files[0]); }, true);
function dropShow(z, f) {
  const n = $("#" + z.dataset.drop + "-name"); if (!n || !f) return;
  n.innerHTML = `<span class="drop-file">${ic("doc", "sm")}${esc(f.name)} <span class="dim">· ${dropSize(f.size || 0)}</span></span>`; z.classList.add("has");
}
/* which zone a file goes to: the one under the pointer, else the only one in the open sheet, else the only one on the page */
function dropTarget(el) {
  const near = el && el.closest && el.closest("[data-drop]"); if (near) return near;
  const sheet = $("#sheet"); if (sheet && !sheet.hidden && sheetOpen) { const Z = sheet.querySelectorAll("[data-drop]"); return Z.length ? Z[0] : null; }
  const Z = document.querySelectorAll("#main [data-drop]"); return Z.length ? Z[0] : null;
}
function dropAccepts(inp, f) {
  const acc = String(inp.accept || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean); if (!acc.length) return true;
  const nm = String(f.name || "").toLowerCase(), ty = String(f.type || "").toLowerCase();
  return acc.some((a) => (a[0] === "." ? nm.endsWith(a) : a.endsWith("/*") ? ty.startsWith(a.slice(0, -1)) : ty === a));
}
const dropKinds = (inp) => { const a = String(inp.accept || "").toLowerCase(), k = []; if (/pdf/.test(a)) k.push("PDF"); if (/xls/.test(a)) k.push("Excel"); if (/csv/.test(a)) k.push("CSV"); if (/\.txt/.test(a)) k.push("text"); if (/image/.test(a)) k.push("a photo"); return k.length > 1 ? k.slice(0, -1).join(", ") + " or " + k[k.length - 1] : k[0] || "a file"; };
function dropDeliver(z, f, how) {
  const inp = z && $("#" + z.dataset.drop); if (!inp || !f) return false;
  if (!dropAccepts(inp, f)) {
    z.classList.remove("bad"); void z.offsetWidth; z.classList.add("bad");
    toast(how === "paste" && /^image\//.test(f.type) && !/image/.test(inp.accept) ? "That pasted a picture, not the file. Drag the file in, or choose it." : `This needs ${dropKinds(inp)}. “${f.name || "That file"}” is not one.`, "alert");
    return false;
  }
  try { const dt = new DataTransfer(); dt.items.add(f); inp.files = dt.files; }
  catch (e) { toast("This browser cannot take a dropped file here. Choose it instead.", "alert"); return false; }
  dropShow(z, f); z.classList.remove("got"); void z.offsetWidth; z.classList.add("got");
  inp.dispatchEvent(new Event("input", { bubbles: true })); inp.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}
/* phones: "Paste" reads the clipboard (the phone asks first); where a phone does not hand files to the web that
   way, a paste field opens so a long press → Paste delivers it, like a chat box */
const DROP_EXT = { "application/pdf": "pdf", "image/png": "png", "image/jpeg": "jpg", "image/heic": "heic", "text/csv": "csv", "application/vnd.ms-excel": "xls", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx", "text/plain": "txt" };
ACT.dropPaste = async (el) => {
  const z = el.closest("[data-drop]"), inp = z && $("#" + z.dataset.drop); if (!inp) return;
  if (navigator.clipboard && navigator.clipboard.read) {
    try {
      const items = await navigator.clipboard.read(); let other = null, textOnly = false;
      for (const it of items) for (const t of it.types) {
        if (/^text\/(plain|html|uri-list)$/.test(t) && !/\.txt/.test(inp.accept)) { textOnly = true; continue; }
        const blob = await it.getType(t), f = new File([blob], "Pasted file." + (DROP_EXT[t] || (t.split("/")[1] || "bin")), { type: t });
        if (dropAccepts(inp, f)) { dropPasteClose(z); dropDeliver(z, f, "paste"); return; }
        other = other || f;
      }
      if (other) { dropDeliver(z, other, "paste"); return; }
      if (textOnly) { dropPasteOpen(z, "The clipboard has text, not a file. Copy the file itself (in Files or WhatsApp: Share → Copy), then tap Paste again, or paste it here."); return; }
    } catch (e) { /* refused, or this phone does not share files this way */ }
  }
  dropPasteOpen(z);
};
function dropPasteOpen(z, msg) {
  const box = $("#" + z.dataset.drop + "-paste"); if (!box) return;
  box.hidden = false; box.innerHTML = `<input class="input drop-paste-in" inputmode="none" autocomplete="off" aria-label="Paste the file here" placeholder="Touch and hold here, then tap Paste"><span class="drop-sub">${esc(msg || "Your phone keeps copied files to itself until you paste them into a box like this one.")}</span>`;
  const f = box.querySelector("input"); setTimeout(() => f && f.focus(), 30);
  f.addEventListener("input", () => { if (f.value) { f.value = ""; toast("That pasted text. Copy the file itself, then paste here.", "info"); } });
}
function dropPasteClose(z) { const box = $("#" + z.dataset.drop + "-paste"); if (box) { box.hidden = true; box.innerHTML = ""; } }

/* drag and drop: the zone (and, softly, every zone) lights up while a file is held over the window */
let DROP_DEPTH = 0;
const dropHasFiles = (e) => e.dataTransfer && [...(e.dataTransfer.types || [])].includes("Files");
const dropClear = () => { DROP_DEPTH = 0; document.body.classList.remove("dragging"); document.querySelectorAll(".drop.over").forEach((x) => x.classList.remove("over")); };
document.addEventListener("dragenter", (e) => { if (!dropHasFiles(e) || !CAN_EDIT) return; DROP_DEPTH++; if (dropTarget(null) || dropTarget(e.target)) document.body.classList.add("dragging"); });
document.addEventListener("dragleave", (e) => { if (!dropHasFiles(e)) return; DROP_DEPTH = Math.max(0, DROP_DEPTH - 1); if (!DROP_DEPTH) dropClear(); });
document.addEventListener("dragover", (e) => {
  if (!dropHasFiles(e) || !CAN_EDIT) return; const z = dropTarget(e.target); if (!z) return;
  e.preventDefault(); e.dataTransfer.dropEffect = "copy";
  document.querySelectorAll(".drop.over").forEach((x) => { if (x !== z) x.classList.remove("over"); }); z.classList.add("over");
});
document.addEventListener("drop", (e) => {
  if (!dropHasFiles(e)) return; const z = CAN_EDIT ? dropTarget(e.target) : null; e.preventDefault(); dropClear();
  if (!z) { toast("Open the screen for that file first (Orders → Paste or upload, Add PO, Receive stock or Check with Tropicana).", "info"); return; }
  const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (e.dataTransfer.files.length > 1) toast("One file at a time: the first one was taken.", "info");
  dropDeliver(z, f, "drop");
});
/* paste: a copied file (or screenshot) goes to the zone; pasted text keeps working as normal */
document.addEventListener("paste", (e) => {
  const cd = e.clipboardData; if (!cd || !CAN_EDIT) return;
  const files = [...(cd.files || [])]; if (!files.length) return;
  const z = dropTarget(document.activeElement); if (!z) return;
  /* a copied file in Finder also puts its name on the clipboard as text: in a text box, the file still wins */
  e.preventDefault(); if (dropDeliver(z, files[0], "paste")) dropPasteClose(z);
});

/* ===== charts (inline SVG, one y-axis each, hover layer, table twin) ===== */
const cssVar = (n) => `var(${n})`;
const isNarrow = () => window.innerWidth < 720;
function niceScale(v) { for (let k = -2; k < 9; k++) for (const s of [1, 2, 5]) { const step = s * Math.pow(10, k), n = Math.ceil(v / step - 1e-9); if (n <= 5) return { step, n, max: n * step }; } return { step: v, n: 1, max: v }; }
function chartCard(id, title, sub, legend, chartHtml, tableHtml, extra) {
  const mode = S.chartMode[id] || "chart";
  return `<div class="card"><div class="card-head"><div><div class="card-title">${title}</div><div class="card-sub">${sub}</div></div>
    <div class="hstack gap-8">${extra || ""}<div class="seg"><button data-act="chartMode" data-id="${id}" data-mode="chart" aria-pressed="${mode === "chart"}">Chart</button><button data-act="chartMode" data-id="${id}" data-mode="table" aria-pressed="${mode === "table"}">Table</button></div></div></div>
    <div class="card-pad" style="padding-top:12px">${mode === "chart" ? `${legend ? `<div class="legend" style="margin-bottom:8px">${legend}</div>` : ""}${chartHtml}` : `<div style="overflow-x:auto">${tableHtml}</div>`}</div></div>`;
}
ACT.chartMode = (el) => { S.chartMode[el.dataset.id] = el.dataset.mode; render(); };

let CHART = { line: null, months: null };
/* cumulative sales by day: this period against the comparison period */
function lineChart(L) {
  const n = L.cur.length, narrow = isNarrow(), W = narrow ? 350 : 640, H = narrow ? 215 : 250, m = { l: 30, r: narrow ? 54 : 64, t: 16, b: 26 };
  const all = L.cur.concat(L.prev).filter((v) => v != null), sc = niceScale(Math.max(0.01, ...all)), maxV = sc.max;
  const x = (i) => m.l + (n > 1 ? i / (n - 1) : 0.5) * (W - m.l - m.r), y = (v) => H - m.b - (v / maxV) * (H - m.t - m.b);
  const pts = (arr) => arr.map((v, i) => (v == null ? null : [i, v])).filter(Boolean);
  const nowPts = pts(L.cur), prevPts = pts(L.prev);
  const path = (p) => p.map(([i, v], j) => (j ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1)).join(" ");
  let g = "";
  for (let i = 0; i <= sc.n; i++) { const v = sc.step * i; g += `<line class="gridline" x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${m.l - 8}" y="${y(v) + 4}" text-anchor="end">${+v.toFixed(2)}</text>`; }
  const ticks = narrow ? 3 : 6, seen = {};
  for (let k = 0; k <= ticks; k++) { const i = Math.round((k / ticks) * (n - 1)); if (seen[i]) continue; seen[i] = 1; g += `<text x="${x(i)}" y="${H - 6}" text-anchor="${k === 0 ? "start" : k === ticks ? "end" : "middle"}">${esc(L.labels[i])}</text>`; }
  const last = nowPts[nowPts.length - 1], lastP = prevPts[prevPts.length - 1];
  const area = nowPts.length > 1 ? path(nowPts) + ` L${x(last[0]).toFixed(1)} ${y(0)} L${x(nowPts[0][0]).toFixed(1)} ${y(0)} Z` : "";
  CHART.line = { ...L, W, ml: m.l, mr: m.r };
  return `<div class="chart" data-chart="line"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Cumulative net sales by day, this period against the one before">
    ${g}
    ${prevPts.length > 1 ? `<path d="${path(prevPts)}" fill="none" stroke="var(--s-prev)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>` : ""}
    ${area ? `<path d="${area}" fill="var(--s-gt)" opacity="0.1"/>` : ""}
    ${nowPts.length > 1 ? `<path d="${path(nowPts)}" fill="none" stroke="var(--s-gt)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>` : ""}
    ${last ? `<circle cx="${x(last[0])}" cy="${y(last[1])}" r="5" fill="var(--s-gt)" stroke="var(--surface)" stroke-width="2"/><text class="lbl" x="${Math.min(x(last[0]) + 9, W - 60)}" y="${y(last[1]) - 8}">₹${last[1].toFixed(1)} L</text>` : ""}
    ${lastP ? `<text x="${Math.min(x(lastP[0]) + 6, W - 44)}" y="${y(lastP[1]) + 4}">${lastP[1].toFixed(1)} L</text>` : ""}
    <line class="xh" x1="0" x2="0" y1="${m.t}" y2="${H - m.b}" stroke="var(--ink-3)" stroke-width="1" opacity="0"/>
    <rect class="hit" x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${H - m.t - m.b}" fill="transparent"/>
  </svg><div class="tip"></div></div>`;
}
function monthChart(data) {
  const narrow = isNarrow(), W = narrow ? 340 : 520, H = narrow ? 220 : 250, m = { l: 30, r: 10, t: 24, b: 26 };
  const sc = niceScale(Math.max(0.01, ...data.map((d) => d.net / 1e5))), maxV = sc.max;
  const y = (v) => H - m.b - (v / maxV) * (H - m.t - m.b), band = (W - m.l - m.r) / data.length, bw = Math.min(24, band * 0.5);
  let g = "";
  for (let i = 0; i <= sc.n; i++) { const v = sc.step * i; g += `<line class="gridline" x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${m.l - 8}" y="${y(v) + 4}" text-anchor="end">${+v.toFixed(2)}</text>`; }
  data.forEach((d, i) => {
    const cx = m.l + band * i + band / 2, x0 = cx - bw / 2; let base = 0;
    [["gt", "--s-gt"], ["swiggy", "--s-swiggy"], ["zepto", "--s-zepto"]].forEach(([k, c]) => {
      const v = d[k] / 1e5; if (v <= 0) return;
      const y1 = y(base + v), h = y(base) - y1 - (base > 0 ? 2 : 0);
      if (h > 0.5) g += `<rect x="${x0}" y="${y1}" width="${bw}" height="${h}" rx="3" fill="var(${c})"/>`;
      base += v;
    });
    g += `<text class="lbl" x="${cx}" y="${y(Math.max(0, d.net / 1e5)) - 7}" text-anchor="middle">${(d.net / 1e5).toFixed(1)}</text><text x="${cx}" y="${H - 6}" text-anchor="middle">${esc(d.label)}</text>`;
    g += `<rect class="colhit" data-i="${i}" x="${m.l + band * i}" y="${m.t}" width="${band}" height="${H - m.t - m.b}" fill="transparent"/>`;
  });
  CHART.months = data;
  return `<div class="chart" data-chart="months"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Net sales by month, split by distributors, Swiggy and Zepto">${g}</svg><div class="tip"></div></div>`;
}
function bars(rows, colorVar) {
  const max = Math.max(1, ...rows.map((d) => Math.max(d.now || 0, d.prev || 0)));
  return rows.map((d) => `<div class="hbar" title="${esc(d.name)}: ${rs(d.now)} now, ${rs(d.prev)} before">
    <div class="clip">${esc(d.name)}</div>
    <div class="tracks"><div class="trk" style="width:${Math.max(0, (d.now / max) * 100)}%;background:var(${d.color || colorVar || "--s-gt"})"></div><div class="trk prev" style="width:${Math.max(0, ((d.prev || 0) / max) * 100)}%"></div></div>
    <div class="num nowrap" style="min-width:86px;text-align:right"><b>₹${lakh(d.now)} L</b> ${d.prev > 0 ? growthChip(d.now / d.prev - 1) : d.now > 0 && d.hasPrev ? growthChip("New") : ""}</div></div>`).join("");
}
function bindCharts() {
  const lc = $('[data-chart="line"]'), L = CHART.line;
  if (lc && L) {
    const svg = $("svg", lc), tip = $(".tip", lc), xh = $(".xh", lc), n = L.cur.length;
    const move = (e) => {
      const r = svg.getBoundingClientRect(), px = ((e.clientX - r.left) / r.width) * L.W;
      const i = Math.max(0, Math.min(n - 1, Math.round(((px - L.ml) / (L.W - L.ml - L.mr)) * (n - 1))));
      const cx = L.ml + (n > 1 ? i / (n - 1) : 0.5) * (L.W - L.ml - L.mr);
      xh.setAttribute("x1", cx); xh.setAttribute("x2", cx); xh.setAttribute("opacity", "0.5");
      tip.innerHTML = `<div class="t-h">Day ${i + 1}</div><div class="t-r"><span><i class="t-k" style="background:var(--s-gt)"></i>${esc(L.labels[i])}</span><b>${L.cur[i] != null ? "₹" + L.cur[i].toFixed(2) + " L" : "–"}</b></div>${L.prevLabels ? `<div class="t-r"><span><i class="t-k" style="background:var(--s-prev)"></i>${esc(L.prevLabels[i] || "")}</span><b>${L.prev[i] != null ? "₹" + L.prev[i].toFixed(2) + " L" : "–"}</b></div>` : ""}`;
      const left = (cx / L.W) * r.width; tip.style.left = Math.min(r.width - 170, Math.max(0, left + 12)) + "px"; tip.style.top = "8px"; tip.classList.add("on");
    };
    svg.addEventListener("pointermove", move); svg.addEventListener("pointerdown", move);
    svg.addEventListener("pointerleave", () => { tip.classList.remove("on"); xh.setAttribute("opacity", "0"); });
  }
  const mc = $('[data-chart="months"]');
  if (mc && CHART.months) {
    const tip = $(".tip", mc), svg = $("svg", mc);
    $$(".colhit", mc).forEach((el) => {
      const show = () => {
        const d = CHART.months[+el.dataset.i], r = svg.getBoundingClientRect(), b = el.getBoundingClientRect();
        tip.innerHTML = `<div class="t-h">${esc(MONTH_LONG[+d.k.slice(5) - 1])} ${d.k.slice(0, 4)}${d.label.endsWith("*") ? " (so far)" : ""}</div>` + [["Distributors", d.gt, "--s-gt"], ["Swiggy", d.swiggy, "--s-swiggy"], ["Zepto", d.zepto, "--s-zepto"]].map(([l, v, c]) => `<div class="t-r"><span><i class="t-k" style="background:var(${c})"></i>${l}</span><b>₹${(v / 1e5).toFixed(2)} L</b></div>`).join("") + `<div class="t-r" style="margin-top:4px"><span>Net sales</span><b>₹${(d.net / 1e5).toFixed(2)} L</b></div>`;
        tip.style.left = Math.min(r.width - 170, Math.max(0, b.left - r.left + b.width / 2 - 80)) + "px"; tip.style.top = "0px"; tip.classList.add("on");
      };
      el.addEventListener("pointerenter", show); el.addEventListener("pointerdown", show);
      el.addEventListener("pointerleave", () => tip.classList.remove("on"));
    });
  }
}
/* ===== HOME ===== */
const DATA_OLD = !!HOST && (!D.meta || !(D.meta.dataVersion >= 2));
function dataUpdateBanner() {
  if (!DATA_OLD) return "";
  return ROLE === "owner"
    ? `<div class="banner warn">${ic("alert", "sm")}<span class="grow"><b>One-time data update.</b> Load the new workspace file (sahireach-workspace-13-nov.json) so September sales and the new dashboard figures show correctly.</span><button class="btn btn-sm btn-primary" data-act="dataUpload">Choose file</button></div>`
    : `<div class="banner warn">${ic("alert", "sm")}<span>Some figures are incomplete until the owner loads the updated data file.</span></div>`;
}
ACT.dataUpload = () => {
  if (!HOST || !HOST.uploadWorkspace) return;
  const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json,application/json";
  inp.onchange = async () => { const f = inp.files && inp.files[0]; if (!f) return; toast("Loading the data file…", "info"); try { await HOST.uploadWorkspace(f); toast("Data updated. Reopening…"); setTimeout(() => location.reload(), 600); } catch (e) { toast((e && e.message) || "Could not load that file", "alert"); } };
  inp.click();
};
function greeting() { const h = NOW().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; }
function lowStockRows() { return D.repl.rows.filter((r) => r.belowRop); }
function quietDistributors(facts) {
  const today = ymd(NOW()), last = {};
  facts.forEach((f) => { if (f.ch === "gt" && f.kind !== "note" && f.value > 0 && (!last[f.dist] || f.date > last[f.dist])) last[f.dist] = f.date; });
  return Object.keys(last).filter((n) => { const d = daysBetween(last[n], today); return d > 14 && d <= 60; }).map((n) => ({ name: n, last: last[n], days: daysBetween(last[n], today) })).sort((a, b) => a.days - b.days);
}
function attention(facts) {
  const out = [];
  const R = recomputeRepl(), cls = R.decision.includes("NOW") ? "bad" : R.decision.includes("SOON") ? "warn" : "tint", ob = R.orderBy ? (R.orderBy <= ymd(NOW()) ? "order today" : "order by " + fmtDate(R.orderBy)) : "";
  out.push({ ic: "cycle", cls, title: `Hangyo truck: ${R.decision.toLowerCase().replace(/^./, (c) => c.toUpperCase())}${ob && R.decision !== "HOLD" ? " · " + ob : ""}`, sub: `${R.belowRop} Hero/Core product${R.belowRop === 1 ? "" : "s"} below reorder point · plan is ${nf(R.total)} of ${nf(R.truck)} crates`, go: "replenish" });
  const pend = pendingOrders();
  if (pend.length) out.push({ ic: "truck", cls: "tint", title: `${pend.length} order${pend.length > 1 ? "s" : ""} waiting to dispatch`, sub: `${nf(pend.reduce((a, o) => a + o.crates, 0), 2)} crates · ${rs(pend.reduce((a, o) => a + o.value, 0))}`, go: "dispatch" });
  const open = openQC(), soon = open.filter((p) => daysLeft(p) <= 3 && daysLeft(p) >= 0), exp = open.filter((p) => daysLeft(p) < 0);
  const byP = ["Swiggy", "Zepto"].map((p) => [p, open.filter((x) => x.platform === p).length]).filter((x) => x[1]);
  if (open.length) out.push({ ic: "bolt", cls: soon.length || exp.length ? "warn" : "info", title: `${byP.map(([p, n]) => n + " " + p).join(" and ")} PO${open.length > 1 ? "s" : ""} open`, sub: `${soon.length} expire within 3 days${exp.length ? ` · ${exp.length} past expiry` : ""}`, go: "quick" });
  const low = lowStockRows();
  if (low.length) out.push({ ic: "box", cls: "bad", title: `${low.length} product${low.length > 1 ? "s" : ""} below reorder point`, sub: low.slice(0, 2).map((r) => shortName(r.name).split("(")[0].trim()).join(", ") + (low.length > 2 ? " and more" : ""), go: "replenish" });
  const quiet = quietDistributors(facts);
  if (quiet.length) out.push({ ic: "people", cls: "warn", title: `${quiet.length} distributor${quiet.length > 1 ? "s" : ""} gone quiet`, sub: quiet.slice(0, 2).map((q) => shortOf(q.name)).join(", ") + (quiet.length > 2 ? " and more" : "") + ` · nothing dispatched for ${quiet[0].days}+ days`, go: "setup" });
  const slow = slowSum(slowRows());
  if (slow.n) out.push({ ic: "box", cls: "warn", act: "slowList", title: `${slow.n} slow-moving product${slow.n > 1 ? "s" : ""} to push`, sub: `${nf(slow.crates, 0)} crates above normal sales${SEE_MONEY ? ` · ₹${lakh(slow.value)} L tied up` : ""}` });
  const bis = typeof backInStock === "function" ? backInStock() : [];
  if (bis.length) out.push({ ic: "box", cls: "good", act: "backInStock", title: `${bis.length} distributor${bis.length > 1 ? "s" : ""} waiting for stock that is back`, sub: [...new Set(bis.flatMap((g) => g.items.map((i) => shortName(i.name).split("(")[0].trim())))].slice(0, 2).join(", ") + " · tap to let them know" });
  { const pb = pendingBack(); if (pb.length) out.push({ ic: "box", cls: "good", act: "pendingBackSheet", title: `${pb.length} pending order${pb.length > 1 ? "s" : ""} can get products that were out of stock`, sub: pb.slice(0, 2).map((g) => shortOf(g.o.dist)).join(", ") + " · tap to refresh the order" }); }
  if (typeof xferAttention === "function") out.push(...xferAttention());
  if (!SEE_MONEY) return out;
  const runs = typeof unloggedRuns === "function" ? unloggedRuns() : [];
  if (runs.length) out.push({ ic: "truck", cls: "warn", go: "logistics", title: `${runs.length} dispatch${runs.length > 1 ? "es" : ""} without a trip logged`, sub: runs.slice(0, 2).map((r) => fmtDate(r.date) + ": " + runLabel(r)).join(" · ") + " · add km and cost" });
  const todDue = todState().total, lastR = (D.tod.receipts || []).find((r) => r.month);
  out.push({ ic: "rupee", cls: "info", title: `${rs(todDue)} TOD due from Hangyo`, sub: lastR ? `Last received: ${rs(lastR.amount)} for ${monthName(lastR.month)} sales${lastR.excess > 0.005 ? ` (${rs(lastR.excess)} more than in the tool)` : ""}` : "Not yet received, all months", go: "tod" });
  return out;
}
const chgTxt = (a, b, lbl) => (b == null || !lbl ? "" : b <= 0 ? (a > 0 ? "New vs " + lbl : "") : (a >= b ? "▲ " : "▼ ") + Math.abs((a / b - 1) * 100).toFixed(1) + "% vs " + lbl);
const lakhS = (v) => "₹" + lakh(v);
function filterBar(R) {
  const F = S.dash, districts = [...new Set(D.distributors.map((d) => d.district).filter(Boolean))].sort();
  const opt = (list, v) => list.map(([k, l]) => `<option value="${esc(k)}" ${k === v ? "selected" : ""}>${esc(l)}</option>`).join("");
  return `<div class="filters" role="group" aria-label="Dashboard filters">
    <label class="fsel">${ic("cal", "sm")}<select class="select" data-in="dashF" data-f="preset" aria-label="Period">${opt(DASH_PRESETS, F.preset)}</select></label>
    ${F.preset === "custom" ? `<span class="fdates"><input class="input" type="date" value="${esc(F.from || R.from)}" max="${ymd(NOW())}" data-in="dashF" data-f="from" aria-label="From"><span class="dim">to</span><input class="input" type="date" value="${esc(F.to || R.to)}" max="${ymd(NOW())}" data-in="dashF" data-f="to" aria-label="To"></span>` : ""}
    <label class="fsel">${ic("bolt", "sm")}<select class="select" data-in="dashF" data-f="ch" aria-label="Channel">${opt(DASH_CHANNELS, F.ch)}</select></label>
    ${F.ch === "all" || F.ch === "gt" ? `<label class="fsel">${ic("people", "sm")}<select class="select" data-in="dashF" data-f="district" aria-label="District">${opt([["all", "All districts"]].concat(districts.map((d) => [d, d])), F.district)}</select></label>` : ""}
    ${F.preset !== "month" || F.ch !== "all" || F.district !== "all" ? `<button class="btn-plain" style="height:auto;font-size:13px;font-weight:600" data-act="dashReset">Reset</button>` : ""}
  </div>`;
}
IN.dashF = (el) => {
  const F = S.dash, f = el.dataset.f;
  if (f === "preset" && el.value === "custom") { const R = dashRange(); F.from = R.from; F.to = R.to; }
  F[f] = el.value;
  if (f === "ch" && !["all", "gt"].includes(F.ch)) F.district = "all";
  if (f === "district" && F.district !== "all" && F.ch === "all") F.ch = "gt";
  render();
};
ACT.dashReset = () => { S.dash = { preset: "month", ch: "all", district: "all", from: "", to: "" }; render(); };
function cumSeries(facts, from, n) {
  const byDay = {}; facts.forEach((f) => { byDay[f.date] = (byDay[f.date] || 0) + f.value; });
  const today = ymd(NOW()), out = []; let run = 0;
  for (let i = 0; i < n; i++) { const d = addDays(from, i); if (d > today) { out.push(null); continue; } run += byDay[d] || 0; out.push(run / 1e5); }
  return out;
}
function homeData() {
  const facts = salesFacts(), R = dashRange(), cur = periodStats(facts, R.from, R.to), prev = periodStats(facts, R.pFrom, R.pTo);
  return { facts, R, cur, prev };
}
VIEWS.home = () => {
  const H = homeData(), { facts, R, cur, prev } = H, F = S.dash, cmp = R.pFrom ? R.cmpLabel : "";
  const showGT = F.ch === "all" || F.ch === "gt", showQC = F.ch !== "gt" && F.district === "all";
  const tile = (k, label, value, unit, sub, delta) => `<button class="tile" data-act="drill" data-k="${k}"><div class="tile-label"><span>${esc(label)}</span>${ic("chevR", "sm dim")}</div><div class="tile-value">${value}${unit ? `<small>${unit}</small>` : ""}</div>${delta ? deltaChip(delta) : ""}<div class="tile-sub">${esc(sub || "")}</div></button>`;
  const d = NOW(), dateStr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()] + ", " + d.getDate() + " " + MONTH_LONG[d.getMonth()];
  const sv = stockValue(), pur = purchasesIn(R.from, R.to);
  const tiles = [];
  if (showGT) tiles.push(tile("gt", "Distributor sales (GT)", lakhS(cur.gt), "L", `${cur.orders.size} order${cur.orders.size === 1 ? "" : "s"}${cur.avgOrder ? " · avg " + rs(cur.avgOrder) : ""}`, chgTxt(cur.gt, prev.gt, cmp)));
  if (showQC) tiles.push(tile("qc", F.ch === "swiggy" ? "Swiggy" : F.ch === "zepto" ? "Zepto" : "Quick commerce", lakhS(cur.qc), "L", F.ch === "all" || F.ch === "qc" ? `Swiggy ₹${lakh(cur.swiggy)} L · Zepto ₹${lakh(cur.zepto)} L` : `${cur.qcDeliveries.size} PO${cur.qcDeliveries.size === 1 ? "" : "s"} delivered`, chgTxt(cur.qc, prev.qc, cmp)));
  tiles.push(tile("crates", "Crates moved", nf(cur.crates, 0), "", showGT && showQC ? `GT ${nf(cur.gtCrates, 0)} · QC ${nf(cur.qcCrates, 0)}` : showGT ? "To distributors" : "To Swiggy and Zepto", chgTxt(cur.crates, prev.crates, cmp)));
  if (SEE_MONEY) tiles.push(tile("gp", "Gross profit", lakhS(cur.gp), "L", `${cur.margin != null ? "Margin " + pct(cur.margin, 1) : ""}${showGT && showQC ? ` · GT ₹${lakh(cur.gpGT)} L · QC ₹${lakh(cur.gpQC)} L` : ""}`, chgTxt(cur.gp, prev.gp, cmp)));
  if (showGT) tiles.push(tile("fill", "Fill rate, distributors", cur.fillGT != null ? pct(cur.fillGT, 1) : "–", "", `${cur.fillGT == null ? "Tracked from 8 Oct, when the tool started" : nf(cur.missed, 1) + " crates missed"}${showQC && cur.fillQC != null ? " · QC fill " + pct(cur.fillQC, 1) : ""}`, ""));
  else tiles.push(tile("fill", "Fill rate, quick commerce", cur.fillQC != null ? pct(cur.fillQC, 1) : "–", "", "Pieces accepted of pieces ordered", ""));
  if (showGT) tiles.push(tile("active", "Active distributors", nf(cur.dists.size), "", `${prev.dists.size ? prev.dists.size + " in " + cmp : "With a dispatched order"}`, prev.dists.size || !cmp ? (cur.dists.size >= prev.dists.size ? "▲ " : "▼ ") + Math.abs(cur.dists.size - prev.dists.size) + " vs " + cmp : ""));
  if (showGT && (!showQC || !SEE_MONEY)) tiles.push(tile("o2d", "Order to dispatch", cur.o2dAvg != null ? nf(cur.o2dAvg, 1) : "–", cur.o2dAvg != null ? "days" : "", `${cur.o2d.length} order${cur.o2d.length === 1 ? "" : "s"} dispatched`, ""));
  if (SEE_MONEY) { const lg = logiForDash(R.from, R.to, F.ch), lp = R.pFrom ? logiForDash(R.pFrom, R.pTo, F.ch) : null; tiles.push(`<button class="tile" data-act="nav" data-to="logistics"><div class="tile-label"><span>Logistics cost</span>${ic("chevR", "sm dim")}</div><div class="tile-value">${lg.pct != null ? pct(lg.pct, 2) : "–"}<small>of sales</small></div>${lp && lp.pct != null && lg.pct != null ? `<span class="delta ${lg.pct > lp.pct ? "down" : "up"}">${lg.pct > lp.pct ? "↑" : "↓"} ${Math.abs((lg.pct - lp.pct) * 100).toFixed(1)} pts vs ${esc(cmp)}</span>` : ""}<div class="tile-sub">${rs(lg.cost)} on ${lg.n} trip${lg.n === 1 ? "" : "s"}${lg.perCrate != null ? " · " + rs2(lg.perCrate) + " per crate" : ""}</div></button>`); }
  if (SEE_MONEY) tiles.push(tile("stock", "Stock on hand, at cost", lakhS(sv.total), "L", `Own ₹${lakh(sv.own)} L · QC ₹${lakh(sv.qc)} L · today`, ""));
  const pace = R.isMonthToDate ? (() => { const t = NOW(), dim = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate(); return ` · on pace for ₹${lakh((cur.net / t.getDate()) * dim)} L`; })() : "";
  const n = R.days, labels = [], prevLabels = R.pFrom ? [] : null;
  for (let i = 0; i < n; i++) { labels.push(fmtDate(addDays(R.from, i))); if (prevLabels) prevLabels.push(fmtDate(addDays(R.pFrom, i))); }
  const lineData = { cur: cumSeries(cur.facts, R.from, n), prev: R.pFrom ? cumSeries(prev.facts, R.pFrom, Math.min(n, daysBetween(R.pFrom, R.pTo) + 1)) : [], labels, prevLabels };
  /* channel / district bars */
  const prevByD = groupBy(prev.facts, (f) => (f.ch === "gt" ? districtOf(f.dist) : CH_LABEL[f.ch])), curByD = groupBy(cur.facts, (f) => (f.ch === "gt" ? districtOf(f.dist) : CH_LABEL[f.ch]));
  const barRows = [...new Set(Object.keys(curByD).concat(Object.keys(prevByD)))].map((k) => ({ name: k, now: curByD[k] ? curByD[k].value : 0, prev: prevByD[k] ? prevByD[k].value : 0, hasPrev: !!R.pFrom, color: k === "Swiggy" ? "--s-swiggy" : k === "Zepto" ? "--s-zepto" : "--s-gt" })).sort((a, b) => b.now - a.now || b.prev - a.prev);
  /* top distributors and products */
  const gtCur = cur.facts.filter((f) => f.ch === "gt"), gtPrev = prev.facts.filter((f) => f.ch === "gt");
  const dNow = groupBy(gtCur, (f) => f.dist), dPrev = groupBy(gtPrev, (f) => f.dist);
  const topD = Object.values(dNow).filter((x) => x.value > 0).sort((a, b) => b.value - a.value).slice(0, 8), maxD = topD.length ? topD[0].value : 1;
  const pNow = groupBy(cur.facts.filter((f) => f.product && f.kind !== "note"), (f) => f.sap || f.product);
  const topP = Object.values(pNow).sort((a, b) => b.value - a.value).slice(0, 8), maxP = topP.length ? topP[0].value : 1;
  const pName = (k) => (catBySap[k] || stockBySap[k] || qcBySap[k] || { name: k }).name;
  const daysLeftOf = (k, crates) => { const st = stockBySap[k]; if (!st || !st.upc || !crates) return null; return (st.ea / st.upc) / (crates / R.days); };
  const months = monthsSeries(facts);
  const monthTable = `<table class="t"><thead><tr><th>Month</th>${showGT ? `<th class="r">Distributors</th>` : ""}${showQC ? `<th class="r">Swiggy</th><th class="r">Zepto</th>` : ""}<th class="r">Net (₹ L)</th></tr></thead><tbody>${months.map((x) => `<tr><td>${esc(MONTH_LONG[+x.k.slice(5) - 1])}${x.label.endsWith("*") ? " (so far)" : ""}</td>${showGT ? `<td class="r">${(x.gt / 1e5).toFixed(2)}</td>` : ""}${showQC ? `<td class="r">${(x.swiggy / 1e5).toFixed(2)}</td><td class="r">${(x.zepto / 1e5).toFixed(2)}</td>` : ""}<td class="r"><b>${(x.net / 1e5).toFixed(2)}</b></td></tr>`).join("")}</tbody></table>`;
  const lineTable = `<table class="t"><thead><tr><th>Day</th><th class="r">${esc(R.label)} (₹ L)</th>${R.pFrom ? `<th class="r">${esc(cmp)} (₹ L)</th>` : ""}</tr></thead><tbody>${labels.map((l, i) => `<tr><td>${esc(l)}</td><td class="r">${lineData.cur[i] != null ? lineData.cur[i].toFixed(2) : "–"}</td>${R.pFrom ? `<td class="r">${lineData.prev[i] != null ? lineData.prev[i].toFixed(2) : "–"}</td>` : ""}</tr>`).join("")}</tbody></table>`;
  const legendSeries = [showGT ? `<span><i style="background:var(--s-gt)"></i>Distributors</span>` : "", showQC && F.ch !== "zepto" ? `<span><i style="background:var(--s-swiggy)"></i>Swiggy</span>` : "", showQC && F.ch !== "swiggy" ? `<span><i style="background:var(--s-zepto)"></i>Zepto</span>` : ""].join("");
  const filterNote = [F.ch !== "all" ? DASH_CHANNELS.find((c) => c[0] === F.ch)[1] : "", F.district !== "all" ? F.district : ""].filter(Boolean).join(" · ");
  return `<div class="page">
    <div class="topbar mob-only"><div class="brand"><img src="${LOGO}" alt=""><div class="brand-name">Sahi<span>Reach</span></div></div><button class="icon-btn" data-act="cmd" aria-label="Search">${ic("search")}</button></div>
    <div class="page-head"><div><div class="eyebrow">${esc(dateStr)}</div><h1 class="title">${greeting()}, ${esc(FIRST)}</h1></div>
      <div class="head-actions"><button class="btn btn-secondary" data-act="salesShare">${ic("arrowR", "sm")} Share sales</button><button class="btn btn-secondary desk-only" data-act="cmd">${ic("search", "sm")} Search <span class="dim" style="font-weight:500">⌘K</span></button><button class="btn btn-primary" data-act="newOrder">${ic("plus", "sm")} New order</button></div></div>
    ${dataUpdateBanner()}
    ${priceNudgeHome()}
    <div><div class="group-label"><span>Needs attention today</span></div><div class="attn">${attention(facts).map((a) => `<button class="attn-card" data-act="${a.act || "nav"}" data-to="${a.go || ""}"><span class="attn-ic ${a.cls}">${ic(a.ic)}</span><span class="grow"><div class="attn-title">${esc(a.title)}</div><div class="attn-sub">${esc(a.sub)}</div></span>${ic("chevR", "sm dim")}</button>`).join("")}</div></div>
    <div class="sec-head"><div><div class="section-title">Sales</div><div class="section-sub">Excluding GST · distributor orders count on their dispatch date (orders not yet dispatched are left out), Swiggy and Zepto on their delivery date</div></div></div>
    ${filterBar(R)}
    <div class="card hero"><div class="hero-left"><div class="tile-label">Net sales · ${esc(R.label)}${filterNote ? " · " + esc(filterNote) : ""}</div><div class="hero-figure">₹${lakh(cur.net)}<small>lakh</small></div>${deltaChip(chgTxt(cur.net, prev.net, cmp))}<div class="tile-sub" style="margin-top:6px">${R.pFrom ? `${esc(cmp.replace(/^the /, "The "))}: ₹${lakh(prev.net)} L` : `Since ${fmtDate(R.from)} ${R.from.slice(0, 4)}`}${pace}</div></div>
      <div class="hero-right">${n > 1 ? `<div class="legend" style="margin:4px 0 6px 34px"><span><i class="kl" style="background:var(--s-gt)"></i>${esc(R.label)}</span>${R.pFrom ? `<span><i class="kl" style="background:var(--s-prev)"></i>${esc(cmp.replace(/^the /, ""))}</span>` : ""}<span class="dim">Cumulative ₹ lakh</span></div>${S.chartMode.line === "table" ? `<div style="overflow:auto;max-height:240px">${lineTable}</div>` : lineChart(lineData)}` : `<div class="legend" style="margin:8px 0 10px">Today so far, by channel</div>${bars(barRows)}`}</div></div>
    <div class="tiles tiles-4">${tiles.join("")}</div>${purBand(R, cmp)}
    <div class="grid-2">
      ${chartCard("months", "Sales by month and channel", "₹ lakh · *this month so far" + (filterNote ? " · " + esc(filterNote) : ""), legendSeries, monthChart(months), monthTable)}
      <div class="card"><div class="card-head"><div><div class="card-title">${F.ch === "all" ? "Districts and quick commerce" : showGT ? "By district" : "By platform"}</div><div class="card-sub">${esc(R.label)}${cmp ? " against " + esc(cmp) : ""}</div></div><div class="legend"><span><i style="background:var(--s-gt)"></i>Now</span>${cmp ? `<span><i style="background:var(--s-prev)"></i>Before</span>` : ""}</div></div><div class="card-pad" style="padding-top:10px">${barRows.length ? bars(barRows) : `<div class="empty" style="padding:24px">No sales in this period.</div>`}</div></div>
    </div>
    <div class="grid-2">
      ${showGT ? `<div><div class="group-label"><span>Top distributors · ${esc(R.label)}</span><button class="btn-plain" style="height:auto;font-size:13px;font-weight:600" data-act="seeAll" data-kind="dist">See all</button></div><div class="group">${topD.length ? topD.map((x, i) => { const pv = dPrev[x.key] ? dPrev[x.key].value : 0; return `<button class="row" data-act="whyDist" data-from="home" data-k="${esc(x.key)}"><span class="avatar soft">${i + 1}</span><span class="grow"><div class="row-title clip">${esc(x.key)}</div><div class="bar-cell" style="margin-top:5px"><div class="meter"><i style="width:${(x.value / maxD) * 100}%"></i></div><span class="row-sub nowrap">${esc(districtOf(x.key))} · ${x.refs.size} order${x.refs.size === 1 ? "" : "s"}</span></div></span><span class="row-end"><span><div class="row-value">₹${lakh(x.value)} L</div><div>${pv > 0 ? growthChip(x.value / pv - 1) : cmp ? growthChip("New") : ""}</div></span></span></button>`; }).join("") : `<div class="empty" style="padding:24px">No distributor sales in this period.</div>`}</div></div>` : ""}
      <div><div class="group-label"><span>Top products · ${esc(R.label)}</span><button class="btn-plain" style="height:auto;font-size:13px;font-weight:600" data-act="seeAll" data-kind="prod">See all</button></div><div class="group">${topP.length ? topP.map((x, i) => { const dl = daysLeftOf(x.key, x.crates); return `<button class="row" data-act="whyProd" data-from="home" data-k="${esc(x.key)}"><span class="avatar soft">${i + 1}</span><span class="grow"><div class="row-title clip">${esc(shortName(pName(x.key)))}</div><div class="bar-cell" style="margin-top:5px"><div class="meter"><i style="width:${(x.value / maxP) * 100}%"></i></div><span class="row-sub nowrap">${nf(x.crates, 0)} crates${dl != null ? " · " + nf(dl, 0) + " days of stock" : ""}</span></div></span><span class="row-end"><span><div class="row-value">₹${lakh(x.value)} L</div><div>${classPill((replBySap[x.key] || {}).cls)}</div></span></span></button>`; }).join("") : `<div class="empty" style="padding:24px">No product sales in this period.</div>`}</div></div>
    </div>
    ${gpCards(cur, prev, R, filterNote)}
    ${momCard(facts)}
  </div>`;
};
function momCard(facts) {
  const months = monthsSeries(facts).map((m) => { const from = m.k + "-01", t = toDate(from), to = ymd(new Date(t.getFullYear(), t.getMonth() + 1, 0)); const s = periodStats(facts, from, to < ymd(NOW()) ? to : ymd(NOW())); s.pur = purchasesIn(from, to).total; s.todRecv = ((D.tod && D.tod.receipts) || []).filter((r) => r.month === m.k).reduce((a, r) => a + (r.amount || 0), 0); s.logi = logiForDash(from, to, S.dash.ch); return { m, s }; });
  const rows = [
    ["Net sales", (s) => rs(s.net)], ["Distributor sales (GT)", (s) => rs(s.gt)], ["Swiggy", (s) => rs(s.swiggy)], ["Zepto", (s) => rs(s.zepto)],
    ["GT orders dispatched", (s) => nf(s.orders.size)], ["Average GT order", (s) => rs(s.avgOrder)], ["Active distributors", (s) => nf(s.dists.size)],
    ["Crates moved", (s) => nf(s.crates, 0)], ["Gross profit", (s) => rs(s.gp)], ["Gross margin", (s) => (s.margin != null ? pct(s.margin, 1) : "–")],
    ["Fill rate, distributors", (s) => (s.fillGT != null ? pct(s.fillGT, 1) : "–")], ["Fill rate, quick commerce", (s) => (s.fillQC != null ? pct(s.fillQC, 1) : "–")],
    ["Logistics cost", (s) => rs(s.logi.cost)], ["Logistics, % of sales carried", (s) => (s.logi.pct != null ? pct(s.logi.pct, 2) : "–")], ["Missed sales (crates)", (s) => nf(s.missed, 1)], ["Returns and credit notes", (s) => rs(s.returns)], ["TOD earned", (s) => rs(s.tod)], ["TOD received from Hangyo", (s) => (s.todRecv ? rs(s.todRecv) : "–")], ["Purchases from Hangyo", (s) => rs(s.pur)],
  ].filter(([l]) => SEE_MONEY || !/profit|margin|logistics|tod|purchases/i.test(l));
  const table = `<table class="t"><thead><tr><th class="sticky-col">Measure</th>${months.map(({ m }) => `<th class="r">${esc(m.label)}</th>`).join("")}</tr></thead><tbody>${rows.map(([l, f]) => `<tr><td class="sticky-col">${esc(l)}</td>${months.map(({ s }) => `<td class="r">${f(s)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  return `<div class="card"><div class="card-head"><div><div class="card-title">All the numbers, month on month</div><div class="card-sub">${S.dash.ch !== "all" || S.dash.district !== "all" ? "Filtered: " + esc([S.dash.ch !== "all" ? DASH_CHANNELS.find((c) => c[0] === S.dash.ch)[1] : "", S.dash.district !== "all" ? S.dash.district : ""].filter(Boolean).join(" · ")) + " · " : ""}*this month so far</div></div></div><div class="card-pad" style="padding-top:8px"><div style="overflow-x:auto;margin:0 -8px">${table}</div></div></div>`;
}
ACT.nav = (el) => go(el.dataset.to);
ACT.drill = (el) => {
  const k = el.dataset.k, { R, cur, prev } = homeData(), cmp = R.pFrom ? R.cmpLabel : "";
  const tbl = (head, rows) => rows.length ? `<div class="table-wrap"><table class="t"><thead><tr>${head.map((h, i) => `<th class="${i ? "r" : ""}">${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td class="${i ? "r" : ""}">${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : `<div class="group"><div class="empty">Nothing in this period.</div></div>`;
  const gt = cur.facts.filter((f) => f.ch === "gt" && f.kind !== "todx"), dPrev = groupBy(prev.facts.filter((f) => f.ch === "gt"), (f) => f.dist);
  let title = "", big = "", sub = "", body = "";
  const byDist = () => tbl(["Distributor", R.label, cmp || "Before", "Orders", "Crates", "Last sale"], Object.values(groupBy(gt, (f) => f.dist)).sort((a, b) => b.value - a.value).map((x) => [esc(x.key) + `<div class="row-sub">${esc(districtOf(x.key))}</div>`, rs(x.value), dPrev[x.key] ? rs(dPrev[x.key].value) : "–", x.refs.size, nf(x.crates, 1), fmtDate(x.last)]));
  if (k === "gt" || k === "active") { title = k === "gt" ? "Distributor sales (GT)" : "Active distributors"; big = k === "gt" ? `₹${lakh(cur.gt)}<small>lakh</small>` : nf(cur.dists.size); sub = `${cur.orders.size} orders · ${nf(cur.gtCrates, 0)} crates`; body = byDist(); }
  else if (k === "qc") {
    title = "Quick commerce"; big = `₹${lakh(cur.qc)}<small>lakh</small>`; sub = `Swiggy ₹${lakh(cur.swiggy)} L · Zepto ₹${lakh(cur.zepto)} L`;
    const pos = Object.values(groupBy(cur.facts.filter((f) => f.ch !== "gt"), (f) => f.ref)).sort((a, b) => (a.last < b.last ? 1 : -1));
    body = tbl(["PO", "Delivered", "Crates", "Value accepted"], pos.map((x) => { const p = D.qcPOs.find((q) => q.po === x.key) || {}; return [`<span class="mono">${platDot(p.platform)}${esc(x.key)}</span>`, fmtDate(x.last), nf(x.crates, 1), rs(x.value)]; }));
  } else if (k === "crates") {
    title = "Crates moved"; big = nf(cur.crates, 0); sub = `GT ${nf(cur.gtCrates, 0)} · QC ${nf(cur.qcCrates, 0)}`;
    body = tbl(["District / platform", "Crates", "Sales"], Object.values(groupBy(cur.facts, (f) => (f.ch === "gt" ? districtOf(f.dist) : CH_LABEL[f.ch]))).sort((a, b) => b.crates - a.crates).map((x) => [esc(x.key), nf(x.crates, 1), rs(x.value)]));
  } else if (k === "gp") {
    title = "Gross profit"; big = `₹${lakh(cur.gp)}<small>lakh</small>`; sub = `Margin ${cur.margin != null ? pct(cur.margin, 1) : "–"} · GT at the SS rate with TOD counted in · QC at ${pct(QC_GP_RATE, 0)} of sales`;
    const g = {}, est = gpEstRate(cur); cur.facts.forEach((f) => { const k2 = f.ch === "gt" ? f.dist : CH_LABEL[f.ch], x = (g[k2] = g[k2] || { k: k2, v: 0, gp: 0, tod: 0 }); x.v += f.value; x.tod += f.tod; x.gp += factGP(f, est); });
    if (cur.noCost) sub += ` · ${noCostNote(cur)}`;
    body = tbl(["Distributor / platform", "Sales", "TOD", "Gross profit", "Margin"], Object.values(g).sort((a, b) => b.gp - a.gp).map((x) => [esc(x.k), rs(x.v), x.tod ? rs(x.tod) : "–", rs(x.gp), x.v + x.tod ? pct(x.gp / (x.v + x.tod), 1) : "–"]));
  } else if (k === "fill") {
    title = "Fill rate"; big = cur.fillGT != null ? pct(cur.fillGT, 1) : cur.fillQC != null ? pct(cur.fillQC, 1) : "–"; sub = `${nf(cur.missed, 1)} crates missed for distributors${cur.fillQC != null ? " · quick commerce " + pct(cur.fillQC, 1) : ""}`;
    const m = D.oos.filter((o) => { const ord = D.orders.find((x) => x.id === o.id), d = ord && ord.dispatched ? ord.dispatched.slice(0, 10) : ""; return typeof o.missed === "number" && d >= R.from && d <= R.to; }).reverse();
    body = tbl(["Missed product", "Distributor", "Missed crates", "Value"], m.map((o) => [esc(shortName(o.product)) + `<div class="row-sub">${fmtDate(o.time)} · ${esc(o.reason || "")}</div>`, esc(o.dist), nf(o.missed, 1), typeof o.value === "number" ? rs(o.value) : "–"]));
  } else if (k === "o2d") {
    title = "Order to dispatch"; big = cur.o2dAvg != null ? nf(cur.o2dAvg, 1) + "<small>days</small>" : "–"; sub = "From saving the order to the truck leaving";
    const os = D.orders.filter((o) => o.status === "Dispatched" && o.dispatched && o.dispatched.slice(0, 10) >= R.from && o.dispatched.slice(0, 10) <= R.to).sort((a, b) => (a.dispatched < b.dispatched ? 1 : -1));
    body = tbl(["Order", "Saved", "Dispatched", "Days"], os.map((o) => [esc(o.dist) + `<div class="row-sub mono">${esc(o.id)}</div>`, fmtDT(o.time), fmtDT(o.dispatched), nf((toDate(o.dispatched) - toDate(o.time)) / 864e5, 1)]));
  } else if (k === "stock") {
    const sv = stockValue(); title = "Stock on hand, at cost"; big = `₹${lakh(sv.total)}<small>lakh</small>`; sub = `Own ₹${lakh(sv.own)} L · QC ₹${lakh(sv.qc)} L · at the SS rate, today`;
    body = tbl(["Category", "Value at cost"], Object.entries(sv.cats).sort((a, b) => b[1] - a[1]).map(([c, v]) => [esc(c), rs(v)]));
  } else if (k === "purchases") {
    const P = purDrill(R); title = P.title; big = P.big; sub = P.sub; body = P.body;
  } else {
    title = "Products"; big = `₹${lakh(cur.net)}<small>lakh</small>`; sub = "Every product sold in this period";
    const g = Object.values(groupBy(cur.facts.filter((f) => f.product && f.kind !== "note"), (f) => f.sap || f.product)).sort((a, b) => b.value - a.value);
    body = tbl(["Product", "Crates", "Sales", "Stock (crates)"], g.map((x) => { const st = stockBySap[x.key]; return [esc(shortName((catBySap[x.key] || stockBySap[x.key] || qcBySap[x.key] || { name: x.key }).name)), nf(x.crates, 1), rs(x.value), st && st.upc ? nf(st.ea / st.upc, 1) : "–"]; }));
  }
  openSheet(esc(title), `<div class="card card-pad"><div class="tile-label">${esc(R.label)}${S.dash.ch !== "all" ? " · " + esc(DASH_CHANNELS.find((c) => c[0] === S.dash.ch)[1]) : ""}${S.dash.district !== "all" ? " · " + esc(S.dash.district) : ""}</div><div class="hero-figure" style="font-size:40px">${big}</div><div class="tile-sub">${esc(sub)}</div></div><div class="group-label" style="padding-bottom:0"><span>What is behind this number</span></div>${body}`, "", true);
};
/* ---- gross profit per line of sale ---- */
const gpEstRate = (s) => (s && s.noCost ? s.gpEst / s.noCost : 0);
function factGP(f, est) { return f.ch === "gt" ? (f.noCost && f.value > 0 ? f.value * (est || 0) : f.value + f.tod - f.cost) : f.value * QC_GP_RATE; }
function noCostNote(s) { const ps = Object.keys(s.noCostP || {}); return `${rs(s.noCost)} of sales (${ps.map((x) => shortName(x).split("(")[0].trim()).join(", ")}) have no cost price, so their profit is estimated at ${pct(gpEstRate(s), 1)}. Add the SS rate in Setup → Products.`; }
ACT.noCostFix = () => {
  const facts = salesFacts(), s = periodStats(facts, addDays(ymd(NOW()), -89), ymd(NOW())), saps = {}; facts.forEach((f) => { if (f.noCost && f.sap && f.date >= addDays(ymd(NOW()), -89)) saps[f.sap] = f.product; });
  openSheet("Products without a cost price", `<div class="banner warn">${ic("tag", "sm")}<span>Without the SS rate the tool cannot work out the profit on these products. Until you add it, their profit is estimated at the average margin of everything else.</span></div>
    <div class="group">${Object.entries(saps).map(([sap, n]) => `<button class="row" data-act="productEdit" data-sap="${esc(sap)}"><span class="grow"><div class="row-title clip">${esc(n)}</div><div class="row-sub">${rs((s.noCostP || {})[n] || 0)} sold in the last 90 days · SAP ${esc(sap)}</div></span><span class="row-end"><span class="btn btn-sm btn-secondary">Add SS rate</span></span></button>`).join("")}</div>`);
};
/* ---- gross profit by distributor and by product (dashboard) ---- */
function gpRows(cur, prev, keyFn, nameFn) {
  const est = gpEstRate(cur), estP = gpEstRate(prev), g = {}, gp = {};
  cur.facts.forEach((f) => { const k = keyFn(f); if (k == null) return; const x = (g[k] = g[k] || { k, v: 0, tod: 0, gp: 0, est: false }); x.v += f.value; x.tod += f.ch === "gt" ? f.tod : 0; x.gp += factGP(f, est); if (f.ch !== "gt" || (f.noCost && f.value > 0)) x.est = true; });
  (prev.facts || []).forEach((f) => { const k = keyFn(f); if (k == null) return; gp[k] = (gp[k] || 0) + factGP(f, estP); });
  return Object.values(g).filter((x) => Math.abs(x.v) > 0.5 || Math.abs(x.gp) > 0.5).map((x) => ({ ...x, name: nameFn(x.k), m: Math.abs(x.v) > 0.5 && x.v + x.tod > 0 ? x.gp / (x.v + x.tod) : null, prevGP: gp[x.k] != null ? gp[x.k] : null })).sort((a, b) => b.gp - a.gp);
}
function gpBars(rows, avg, act) {
  const top = rows.slice(0, 10), max = Math.max(1, ...top.map((d) => Math.abs(d.gp)));
  if (!top.length) return `<div class="empty">No sales in this period.</div>`;
  return `<div class="gp-bars">` + top.map((d) => gpRowHtml(d, max, avg, act).replace('data-act="' + act + '"', `data-act="${act}" data-from="home"`)).join("") + `</div>`;
}
function gpTable(rows, label) {
  return `<table class="t"><thead><tr><th>${label}</th><th class="r">Sales</th><th class="r">TOD</th><th class="r">Gross profit</th><th class="r">Margin</th><th class="r">Before</th></tr></thead><tbody>${rows.map((d) => `<tr><td>${esc(d.name)}${d.est ? " *" : ""}</td><td class="r">${rs(d.v)}</td><td class="r">${d.tod ? rs(d.tod) : "–"}</td><td class="r"><b>${rs(d.gp)}</b></td><td class="r">${d.m != null ? pct(d.m, 1) : "–"}</td><td class="r">${d.prevGP != null ? rs(d.prevGP) : "–"}</td></tr>`).join("")}</tbody></table>`;
}
function gpCards(cur, prev, R, filterNote) {
  if (!SEE_MONEY) return "";
  const pName = (k) => shortName((catBySap[k] || stockBySap[k] || qcBySap[k] || { name: k }).name);
  const byD = gpRows(cur, prev, (f) => (f.ch === "gt" ? f.dist : CH_LABEL[f.ch]), (k) => k);
  const byP = gpRows(cur, prev, (f) => (f.product && f.kind !== "note" ? f.sap || f.product : null), pName);
  byP.forEach((x) => { x.label = x.name.replace(/\s*\(.*$/, "").trim() || x.name; const sz = (x.name.match(/\(([^)]*)\)/) || [])[1]; if (sz && byP.filter((y) => (y.name.replace(/\s*\(.*$/, "").trim()) === x.label).length > 1) x.label += " · " + sz.replace(/\s+/g, ""); });
  const avg = cur.margin, sub = `${esc(R.label)}${filterNote ? " · " + esc(filterNote) : ""} · margin vs ${avg != null ? pct(avg, 1) : "the"} average`;
  const foot = `<div class="row-sub" style="margin-top:10px">Distributor sales: sales + TOD from Hangyo − cost at the SS rate. Swiggy and Zepto: ${pct(QC_GP_RATE, 0)} of sales.${cur.noCost ? " " + esc(noCostNote(cur)) : ""}</div>`;
  return `<div class="grid-2">
    ${chartCard("gpDist", "Gross profit by distributor", sub, "", gpBars(byD, avg, "whyDist") + foot, gpTable(byD, "Distributor") + `<div class="row-sub" style="margin-top:8px">* includes an estimate (Swiggy/Zepto at ${pct(QC_GP_RATE, 0)}, or products without a cost price)</div>`, `<button class="btn-plain" style="height:auto;font-size:13px;font-weight:600" data-act="seeAll" data-kind="gpDist">See all</button>`)}
    ${chartCard("gpProd", "Gross profit by product", sub, "", gpBars(byP, avg, "whyProd") + foot, gpTable(byP, "Product") + `<div class="row-sub" style="margin-top:8px">* includes an estimate (Swiggy/Zepto at ${pct(QC_GP_RATE, 0)}, or products without a cost price)</div>`, `<button class="btn-plain" style="height:auto;font-size:13px;font-weight:600" data-act="seeAll" data-kind="gpProd">See all</button>`)}
  </div>`;
}

/* ===== "SEE ALL" LISTS AND WHAT IS BEHIND EACH NUMBER =====
   Every See all shows the same rows as its card on Home, for everyone in the period (with the dashboard filters).
   Tapping a row opens the breakdown behind that number: orders/invoices and products (or distributors). */
const prodName = (k) => (catBySap[k] || stockBySap[k] || qcBySap[k] || { name: k }).name;
const prodLabel = (k) => shortName(prodName(k));
function seeAllData(kind) {
  const H = homeData(), { R, cur, prev } = H, cmp = R.pFrom ? R.cmpLabel : "";
  if (kind === "dist") {
    const g = groupBy(cur.facts.filter((f) => f.ch === "gt"), (f) => f.dist), gp = groupBy(prev.facts.filter((f) => f.ch === "gt"), (f) => f.dist);
    return { H, cmp, rows: Object.values(g).filter((x) => x.value > 0).sort((a, b) => b.value - a.value).map((x) => ({ ...x, prev: gp[x.key] ? gp[x.key].value : 0 })) };
  }
  if (kind === "prod") {
    const g = groupBy(cur.facts.filter((f) => f.product && f.kind !== "note"), (f) => f.sap || f.product);
    return { H, cmp, rows: Object.values(g).sort((a, b) => b.value - a.value) };
  }
  if (kind === "gpDist") return { H, cmp, rows: gpRows(cur, prev, (f) => (f.ch === "gt" ? f.dist : CH_LABEL[f.ch]), (k) => k) };
  const rows = gpRows(cur, prev, (f) => (f.product && f.kind !== "note" ? f.sap || f.product : null), prodLabel);
  return { H, cmp, rows };
}
const daysOfStock = (sap, crates, days) => { const st = stockBySap[sap]; if (!st || !st.upc || !crates) return null; return (st.ea / st.upc) / (crates / days); };
/* the row markup: identical to the cards on Home */
function distRowHtml(x, i, max, cmp) {
  return `<button class="row" data-act="whyDist" data-k="${esc(x.key)}"><span class="avatar soft">${i + 1}</span><span class="grow"><div class="row-title clip">${esc(x.key)}</div><div class="bar-cell" style="margin-top:5px"><div class="meter"><i style="width:${(x.value / max) * 100}%"></i></div><span class="row-sub nowrap">${esc(districtOf(x.key))} · ${x.refs.size} order${x.refs.size === 1 ? "" : "s"}</span></div></span><span class="row-end"><span><div class="row-value">₹${lakh(x.value)} L</div><div>${x.prev > 0 ? growthChip(x.value / x.prev - 1) : cmp ? growthChip("New") : ""}</div></span>${ic("chevR", "sm chev")}</span></button>`;
}
function prodRowHtml(x, i, max, days) {
  const dl = daysOfStock(x.key, x.crates, days);
  return `<button class="row" data-act="whyProd" data-k="${esc(x.key)}"><span class="avatar soft">${i + 1}</span><span class="grow"><div class="row-title clip">${esc(prodLabel(x.key))}</div><div class="bar-cell" style="margin-top:5px"><div class="meter"><i style="width:${(x.value / max) * 100}%"></i></div><span class="row-sub nowrap">${nf(x.crates, 0)} crates${dl != null ? " · " + nf(dl, 0) + " days of stock" : ""}</span></div></span><span class="row-end"><span><div class="row-value">₹${lakh(x.value)} L</div><div>${classPill((replBySap[x.key] || {}).cls)}</div></span>${ic("chevR", "sm chev")}</span></button>`;
}
function gpRowHtml(d, max, avg, act) {
  return `<button class="hbar hbar-btn" data-act="${act}" data-k="${esc(d.k)}" title="${esc(d.name)}: profit ${rs(d.gp)} on ${rs(d.v)} sales${d.m != null ? " · margin " + pct(d.m, 1) : ""}">
    <div class="clip">${esc(d.label || d.name)}</div>
    <div class="tracks"><div class="trk" style="width:${Math.max(0, (Math.abs(d.gp) / max) * 100)}%;background:var(${d.gp < 0 ? "--bad" : "--s-gt"})"></div></div>
    <div class="num nowrap" style="min-width:118px;text-align:right"><b>${rs(d.gp)}</b> <span class="delta ${d.m == null ? "flat" : avg != null && d.m < avg - 0.003 ? "down" : avg != null && d.m > avg + 0.003 ? "up" : "flat"}" title="Margin">${d.m != null ? pct(d.m, 1) : "–"}</span></div></button>`;
}
const SEE_TITLES = { dist: "Top distributors", prod: "Top products", gpDist: "Gross profit by distributor", gpProd: "Gross profit by product" };
ACT.seeAll = (el) => {
  const kind = el.dataset.kind, sort = (S.seeSort = el.dataset.sort || (S.seeKind === kind ? S.seeSort : null) || (kind.startsWith("gp") ? "gp" : "sales")); S.seeKind = kind;
  const A = seeAllData(kind), { H, cmp } = A, R = H.R, q = key(S.seeQ || "");
  let rows = A.rows.slice();
  if (kind.startsWith("gp")) {
    rows.sort((a, b) => (sort === "m" ? (b.m == null ? -1 : a.m == null ? 1 : b.m - a.m) : sort === "sales" ? b.v - a.v : b.gp - a.gp));
    if (kind === "gpProd") rows.forEach((x) => { x.label = x.name; });
  }
  const filt = rows.filter((x) => !q || key(kind === "dist" ? x.key : kind === "prod" ? prodName(x.key) : x.name).includes(q));
  const filterNote = [S.dash.ch !== "all" ? DASH_CHANNELS.find((c) => c[0] === S.dash.ch)[1] : "", S.dash.district !== "all" ? S.dash.district : ""].filter(Boolean).join(" · ");
  const total = kind.startsWith("gp") ? `${rs(rows.reduce((a, x) => a + x.gp, 0))} profit on ${rs(rows.reduce((a, x) => a + x.v, 0))} sales` : `${rs(rows.reduce((a, x) => a + x.value, 0))} in sales`;
  let body;
  if (kind === "dist") { const max = rows.length ? rows[0].value : 1; body = `<div class="group">${filt.map((x) => distRowHtml(x, rows.indexOf(x), max, cmp)).join("") || `<div class="empty">Nothing matches.</div>`}</div>`; }
  else if (kind === "prod") { const max = rows.length ? rows[0].value : 1; body = `<div class="group">${filt.map((x) => prodRowHtml(x, rows.indexOf(x), max, R.days)).join("") || `<div class="empty">Nothing matches.</div>`}</div>`; }
  else { const max = Math.max(1, ...rows.map((d) => Math.abs(d.gp))); body = `<div class="card card-pad gp-bars">${filt.map((d) => gpRowHtml(d, max, H.cur.margin, kind === "gpDist" ? "whyDist" : "whyProd")).join("") || `<div class="empty">Nothing matches.</div>`}</div>`; }
  openSheet(SEE_TITLES[kind], `<div class="row-sub">${esc(R.label)}${filterNote ? " · " + esc(filterNote) : ""} · ${rows.length} ${kind.endsWith("rod") || kind === "prod" ? "products" : "distributors"} · ${total}. Tap a row to see what is behind the number.</div>
    <div class="hstack gap-12 wrap"><div class="search" style="flex:1;min-width:200px">${ic("search", "sm")}<input class="input" id="see-q" type="search" placeholder="Search" value="${esc(S.seeQ || "")}" data-in="seeQ" autocomplete="off"></div>${kind.startsWith("gp") ? `<div class="seg">${[["gp", "Profit"], ["m", "Margin"], ["sales", "Sales"]].map(([v, l]) => `<button data-act="seeAll" data-kind="${kind}" data-sort="${v}" aria-pressed="${sort === v}">${l}</button>`).join("")}</div>` : ""}</div>
    <div id="see-list">${body}</div>
    ${kind.startsWith("gp") ? `<div class="row-sub">Distributor sales: sales + TOD from Hangyo − cost at the SS rate. Swiggy and Zepto: ${pct(QC_GP_RATE, 0)} of sales.${H.cur.noCost ? " " + esc(noCostNote(H.cur)) : ""}</div>` : ""}`,
    `<button class="btn btn-secondary" data-act="seeExcel" data-kind="${kind}">${ic("doc", "sm")} Download Excel</button><button class="btn btn-primary" data-act="closeSheet">Done</button>`, true);
};
IN.seeQ = (el) => { S.seeQ = el.value; const at = el.selectionStart; ACT.seeAll({ dataset: { kind: S.seeKind, sort: S.seeSort } }); const i = $("#see-q"); if (i) { i.focus(); try { i.setSelectionRange(at, at); } catch (e) {} } };
ACT.seeExcel = async (el) => {
  const kind = el.dataset.kind, A = seeAllData(kind), R = A.H.R, now = NOW(), st = `${pad2(now.getDate())}-${pad2(now.getMonth() + 1)}-${now.getFullYear()}`;
  let aoa;
  if (kind === "dist") aoa = [["Distributor", "District", "Orders", "Crates", "Sales (excl. GST)", "Before", "Change"]].concat(A.rows.map((x) => [x.key, districtOf(x.key), x.refs.size, +x.crates.toFixed(2), Math.round(x.value), Math.round(x.prev), x.prev > 0 ? +(x.value / x.prev - 1).toFixed(4) : ""]));
  else if (kind === "prod") aoa = [["Product", "SAP code", "Class", "Crates", "Sales (excl. GST)", "Days of stock"]].concat(A.rows.map((x) => { const dl = daysOfStock(x.key, x.crates, R.days); return [prodName(x.key), x.key, (replBySap[x.key] || {}).cls || "", +x.crates.toFixed(2), Math.round(x.value), dl != null ? Math.round(dl) : ""]; }));
  else aoa = [[kind === "gpDist" ? "Distributor" : "Product", "Sales (excl. GST)", "TOD", "Gross profit", "Margin", "Before", "Estimated"]].concat(A.rows.map((x) => [kind === "gpProd" ? prodName(x.k) : x.name, Math.round(x.v), Math.round(x.tod), Math.round(x.gp), x.m != null ? +x.m.toFixed(4) : "", x.prevGP != null ? Math.round(x.prevGP) : "", x.est ? "Yes" : ""]));
  if (await downloadXlsx(el, aoa, kind === "prod" || kind === "gpProd" ? [44, 12, 10, 10, 14, 12, 10] : [32, 14, 10, 12, 14, 12, 10], `SahiReach ${SEE_TITLES[kind].toLowerCase()} ${R.label} ${st}.xlsx`, SEE_TITLES[kind].slice(0, 30))) toast("Downloaded", "doc");
};
/* ---------- behind the number ---------- */
/* staff do not see profit, margin or TOD: those columns are taken out of every breakdown table */
function whyTable(head, rows, foot) {
  if (!SEE_MONEY) {
    const drop = head.map((h, i) => (/profit|margin|tod/i.test(h) ? i : -1)).filter((i) => i >= 0);
    if (drop.length) {
      const cut = (tr) => { const parts = tr.split(/(?=<td)/), lead = parts.shift(); let last = parts[parts.length - 1] || ""; const tail = last.slice(last.lastIndexOf("</td>") + 5); if (parts.length) parts[parts.length - 1] = last.slice(0, last.lastIndexOf("</td>") + 5); return lead + parts.filter((_, i) => !drop.includes(i)).join("") + tail; };
      head = head.filter((_, i) => !drop.includes(i)); rows = rows.map(cut); if (foot) foot = foot.filter((_, i) => !drop.includes(i));
    }
  }
  return `<div class="table-wrap"><table class="t"><thead><tr>${head.map((h, i) => `<th class="${i ? "r" : ""}">${h}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody>${foot ? `<tfoot><tr>${foot.map((c, i) => `<td class="${i ? "r" : ""}"><b>${c}</b></td>`).join("")}</tr></tfoot>` : ""}</table></div>`;
}
const refLabel = (f) => (f.kind === "todx" ? "TOD receipt" : f.kind === "order" ? "Order" : f.kind === "vyapar" ? "Invoice" : f.kind === "qc" ? "PO" : f.kind === "return" ? "Return" : "Note");
function whyBack() { return S.seeKind ? `<button class="btn btn-secondary" data-act="seeAll" data-kind="${esc(S.seeKind)}">${ic("chevL", "sm")} Back to the list</button>` : ""; }
ACT.whyDist = (el) => {
  if (el.dataset.from === "home") S.seeKind = null;
  const k = el.dataset.k, H = homeData(), { R, cur, prev } = H, est = gpEstRate(cur), isQC = k === "Swiggy" || k === "Zepto";
  const F = cur.facts.filter((f) => (isQC ? CH_LABEL[f.ch] === k : f.ch === "gt" && f.dist === k)), P = prev.facts.filter((f) => (isQC ? CH_LABEL[f.ch] === k : f.ch === "gt" && f.dist === k));
  const sum = (A, fn) => A.reduce((a, f) => a + fn(f), 0), sales = sum(F, (f) => f.value), tod = sum(F, (f) => (f.ch === "gt" ? f.tod : 0)), gp = sum(F, (f) => factGP(f, est)), pSales = sum(P, (f) => f.value);
  const byRef = {}; F.forEach((f) => { const x = (byRef[f.ref] = byRef[f.ref] || { ref: f.ref, date: f.date, kind: f.kind, crates: 0, v: 0, tod: 0, gp: 0, n: 0 }); x.crates += f.crates; x.v += f.value; x.tod += f.ch === "gt" ? f.tod : 0; x.gp += factGP(f, est); x.n++; if (f.date > x.date) x.date = f.date; });
  const byP = {}; F.forEach((f) => { const kk = f.sap || f.product || "Other"; const x = (byP[kk] = byP[kk] || { k: kk, crates: 0, v: 0, tod: 0, gp: 0 }); x.crates += f.crates; x.v += f.value; x.tod += f.ch === "gt" ? f.tod : 0; x.gp += factGP(f, est); });
  const refs = Object.values(byRef).sort((a, b) => (a.date < b.date ? 1 : -1)), prods = Object.values(byP).sort((a, b) => b.v - a.v);
  const m = sales + tod > 0 ? gp / (sales + tod) : null;
  const refRow = (x) => { const isOrd = !!orderById(x.ref); return `<tr ${isOrd ? `class="tr-tap" data-act="orderSheet" data-id="${esc(x.ref)}"` : ""}><td>${fmtDate(x.date)} · ${refLabel(x)} <span class="mono" style="font-size:12px">${esc(x.ref || "")}</span>${isOrd ? ` ${ic("chevR", "sm dim")}` : ""}</td><td class="r">${nf(x.crates, 1)}</td><td class="r">${rs(x.v)}</td><td class="r">${x.tod ? rs(x.tod) : "–"}</td><td class="r"><b>${rs(x.gp)}</b></td></tr>`; };
  const pRow = (x) => `<tr class="tr-tap" data-act="whyProd" data-k="${esc(x.k)}"><td>${esc(prodLabel(x.k))} ${ic("chevR", "sm dim")}</td><td class="r">${nf(x.crates, 1)}</td><td class="r">${rs(x.v)}</td><td class="r"><b>${rs(x.gp)}</b></td><td class="r">${x.v + x.tod > 0 ? pct(x.gp / (x.v + x.tod), 1) : "–"}</td></tr>`;
  const d = distByKey[key(k)];
  openSheet(esc(k), `<div class="tiles" style="grid-template-columns:repeat(${SEE_MONEY ? 3 : 2},minmax(0,1fr))"><div class="tile"><div class="tile-label">Sales · ${esc(R.label)}</div><div class="tile-value">${rs(sales)}</div><div>${pSales > 0 ? growthChip(sales / pSales - 1) : ""}</div><div class="tile-sub">${R.pFrom ? `${esc(R.cmpLabel)}: ${rs(pSales)}` : ""}</div></div>${SEE_MONEY ? `<div class="tile"><div class="tile-label">Gross profit</div><div class="tile-value">${rs(gp)}</div><div class="tile-sub">Margin ${m != null ? pct(m, 1) : "–"}${tod ? ` · TOD ${rs(tod)}` : ""}${isQC ? ` · at ${pct(QC_GP_RATE, 0)}` : ""}</div></div>` : ""}<div class="tile"><div class="tile-label">Crates</div><div class="tile-value">${nf(sum(F, (f) => f.crates), 1)}</div><div class="tile-sub">${refs.length} ${isQC ? "PO" : "order"}${refs.length === 1 ? "" : "s"} or invoices</div></div></div>
    <div><div class="group-label"><span>${isQC ? "POs delivered" : "Orders and invoices"}</span><span>tap an order to open it</span></div>${whyTable(["Date · reference", "Crates", "Sales", "TOD", "Gross profit"], refs.map(refRow), ["Total", nf(sum(F, (f) => f.crates), 1), rs(sales), tod ? rs(tod) : "–", rs(gp)])}</div>
    <div><div class="group-label"><span>By product</span><span>tap a product</span></div>${whyTable(["Product", "Crates", "Sales", "Gross profit", "Margin"], prods.map(pRow))}</div>`,
    `${whyBack()}${d ? `<button class="btn btn-secondary" data-act="distSheet" data-name="${esc(d.name)}">Distributor details</button>` : ""}<button class="btn btn-primary" data-act="closeSheet">Done</button>`, true);
};
ACT.whyProd = (el) => {
  if (el.dataset.from === "home") S.seeKind = null;
  const k = el.dataset.k, H = homeData(), { R, cur, prev } = H, est = gpEstRate(cur);
  const F = cur.facts.filter((f) => (f.sap || f.product) === k && f.kind !== "note"), P = prev.facts.filter((f) => (f.sap || f.product) === k && f.kind !== "note");
  const sum = (A, fn) => A.reduce((a, f) => a + fn(f), 0), sales = sum(F, (f) => f.value), tod = sum(F, (f) => (f.ch === "gt" ? f.tod : 0)), gp = sum(F, (f) => factGP(f, est)), pSales = sum(P, (f) => f.value), crates = sum(F, (f) => f.crates);
  const byD = {}; F.forEach((f) => { const kk = f.ch === "gt" ? f.dist : CH_LABEL[f.ch]; const x = (byD[kk] = byD[kk] || { k: kk, crates: 0, v: 0, tod: 0, gp: 0 }); x.crates += f.crates; x.v += f.value; x.tod += f.ch === "gt" ? f.tod : 0; x.gp += factGP(f, est); });
  const ds = Object.values(byD).sort((a, b) => b.v - a.v), lines = F.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  const m = sales + tod > 0 ? gp / (sales + tod) : null, st = stockBySap[k], dl = daysOfStock(k, crates, R.days);
  const dRow = (x) => `<tr class="tr-tap" data-act="whyDist" data-k="${esc(x.k)}"><td>${esc(x.k)} ${ic("chevR", "sm dim")}</td><td class="r">${nf(x.crates, 1)}</td><td class="r">${rs(x.v)}</td><td class="r"><b>${rs(x.gp)}</b></td><td class="r">${x.v + x.tod > 0 ? pct(x.gp / (x.v + x.tod), 1) : "–"}</td></tr>`;
  const lRow = (f) => { const isOrd = !!orderById(f.ref); return `<tr ${isOrd ? `class="tr-tap" data-act="orderSheet" data-id="${esc(f.ref)}"` : ""}><td>${fmtDate(f.date)} · ${esc(f.ch === "gt" ? shortOf(f.dist) : CH_LABEL[f.ch])} <span class="mono" style="font-size:12px">${esc(f.ref || "")}</span>${isOrd ? ` ${ic("chevR", "sm dim")}` : ""}</td><td class="r">${nf(f.crates, 2)}</td><td class="r">${rs(f.value)}</td><td class="r">${rs(factGP(f, est))}</td></tr>`; };
  openSheet(esc(prodLabel(k)), `<div class="row-sub">${esc(prodName(k))}${st && st.trop ? " · " + esc(st.trop) : ""} · SAP ${esc(k)}</div>
    <div class="tiles" style="grid-template-columns:repeat(${SEE_MONEY ? 3 : 2},minmax(0,1fr))"><div class="tile"><div class="tile-label">Sales · ${esc(R.label)}</div><div class="tile-value">${rs(sales)}</div><div>${pSales > 0 ? growthChip(sales / pSales - 1) : ""}</div><div class="tile-sub">${R.pFrom ? `${esc(R.cmpLabel)}: ${rs(pSales)}` : ""}</div></div>${SEE_MONEY ? `<div class="tile"><div class="tile-label">Gross profit</div><div class="tile-value">${rs(gp)}</div><div class="tile-sub">Margin ${m != null ? pct(m, 1) : "–"}${tod ? ` · TOD ${rs(tod)}` : ""}</div></div>` : ""}<div class="tile"><div class="tile-label">Crates sold</div><div class="tile-value">${nf(crates, 1)}</div><div class="tile-sub">${st && st.upc ? `${nf(st.ea / st.upc, 1)} in stock${dl != null ? " · " + nf(dl, 0) + " days" : ""}` : "Not stocked"}</div></div></div>
    <div><div class="group-label"><span>Who bought it</span><span>tap a distributor</span></div>${whyTable(["Distributor", "Crates", "Sales", "Gross profit", "Margin"], ds.map(dRow), ["Total", nf(crates, 1), rs(sales), rs(gp), m != null ? pct(m, 1) : "–"])}</div>
    <div><div class="group-label"><span>Every sale</span><span>${lines.length}</span></div>${whyTable(["Date · who · reference", "Crates", "Sales", "Gross profit"], lines.map(lRow))}</div>`,
    `${whyBack()}${stockBySap[k] || catBySap[k] ? `<button class="btn btn-secondary" data-act="productSheet" data-sap="${esc(k)}">Product details</button>` : ""}<button class="btn btn-primary" data-act="closeSheet">Done</button>`, true);
};

/* ===== SALES UPDATE FOR THE TEAM (WhatsApp) =====
   Two pictures, made in the browser: sales by distributor (grouped by district, with subtotals) and the district
   summary, this month against the month before, plus a short message. One tap shares them to WhatsApp (the
   phone's share sheet), or downloads them where sharing files is not possible. Distributor (GT) sales only,
   excluding GST, by dispatch date, credit notes on their date: the same figures as the dashboard. */
const SS_C = { brand: "#0f8a6b", brandDark: "#0b5e4a", ink: "#1d1d1f", ink2: "#5f6368", line: "#e6e8eb", band: "#f2f7f5", sub: "#e7f2ee", up: "#18794e", upBg: "#e3f5ea", down: "#c62828", downBg: "#fdecea", newBg: "#e0f2ef", flat: "#6e6e73", flatBg: "#f1f2f4", warn: "#a15c00", warnBg: "#fff1db", white: "#ffffff" };
const ssMonths = () => { const out = [], t = NOW(); for (let i = 0; i < 12; i++) { const d = new Date(t.getFullYear(), t.getMonth() - i, 1); out.push(ymd(d).slice(0, 7)); } return out; };
const ssMonthName = (m) => MONTH_LONG[+m.slice(5, 7) - 1];
/* the periods: a whole month against the whole month before; this month so far against the same days last month,
   or against ALL of last month (then each figure shows how much of last month is reached already) */
function ssPeriods(m, cmp) {
  const y = +m.slice(0, 4), mo = +m.slice(5, 7) - 1, today = ymd(NOW()), cur = today.slice(0, 7) === m, full = cur && cmp === "full";
  const last = (yy, mm) => new Date(yy, mm + 1, 0).getDate();
  const day = cur ? +today.slice(8, 10) : last(y, mo), pDay = full ? last(y, mo - 1) : Math.min(day, last(y, mo - 1)), mDays = last(y, mo);
  const from = ymd(new Date(y, mo, 1)), to = ymd(new Date(y, mo, day)), pFrom = ymd(new Date(y, mo - 1, 1)), pTo = ymd(new Date(y, mo - 1, pDay));
  const n = ssMonthName(m), p = ssMonthName(pFrom.slice(0, 7));
  return { m, cur, full, day, mDays, pace: day / mDays, from, to, pFrom, pTo, n, p, short: n.slice(0, 3), pShort: p.slice(0, 3), year: m.slice(0, 4),
    title: cur ? `${n} so far` : `${n} ${y}`,
    vs: full ? `1–${day} ${n.slice(0, 3)} against all of ${p} · ${day} of ${mDays} days gone` : cur ? `1–${day} ${n.slice(0, 3)} vs 1–${pDay} ${p.slice(0, 3)}` : `${n} vs ${p}`,
    prevHead: full ? `All ${p.slice(0, 3)}` : p.slice(0, 3), chgHead: "Change" };
}
function ssData(P) {
  const by = {};
  salesFacts().forEach((f) => {
    if (f.ch !== "gt" || f.kind === "todx" || !f.dist) return;
    const inCur = f.date >= P.from && f.date <= P.to, inPrev = f.date >= P.pFrom && f.date <= P.pTo; if (!inCur && !inPrev) return;
    const r = (by[f.dist] = by[f.dist] || { name: f.dist, short: shortOf(f.dist), district: districtOf(f.dist), cur: 0, prev: 0 });
    if (inCur) r.cur += f.value || 0; if (inPrev) r.prev += f.value || 0;
  });
  const rows = Object.values(by).map((r) => ({ ...r, cur: Math.round(r.cur), prev: Math.round(r.prev) })).filter((r) => r.cur || r.prev);
  const D2 = {}; rows.forEach((r) => { const d = (D2[r.district] = D2[r.district] || { name: r.district, cur: 0, prev: 0, rows: [] }); d.cur += r.cur; d.prev += r.prev; d.rows.push(r); });
  const districts = Object.values(D2).sort((a, b) => b.cur - a.cur); districts.forEach((d) => d.rows.sort((a, b) => b.cur - a.cur));
  return { P, districts, cur: rows.reduce((a, r) => a + r.cur, 0), prev: rows.reduce((a, r) => a + r.prev, 0), rows };
}
/* growth: "New" when there was nothing before; none when there is nothing now either */
/* "new" only when nothing at all was billed before; after a month of only a credit note it is just "up" */
const ssGrowth = (cur, prev) => (prev > 0 ? (Math.abs(cur - prev) < 1 ? 0 : (cur - prev) / prev) : prev < 0 ? (cur > prev ? "upFromNeg" : "downFromNeg") : cur > 0 ? "new" : null);
/* the pill: % increase or decrease (also against all of last month), "New", or nothing */
function ssMark(cur, prev) {
  const g = ssGrowth(cur, prev);
  return { g, txt: ssPct(g), kind: g === "new" ? "new" : g === "upFromNeg" ? "up" : g === "downFromNeg" ? "down" : g == null || g === 0 ? "flat" : g > 0 ? "up" : "down" };
}
const SS_KIND = { new: ["newBg", "brand"], flat: ["flatBg", "flat"], up: ["upBg", "up"], down: ["downBg", "down"], warn: ["warnBg", "warn"] };
const ssRs = (v) => (v < 0 ? "−₹" : "₹") + Math.abs(Math.round(v)).toLocaleString("en-IN");
const ssPct = (g) => (g === "new" ? "New" : g === "upFromNeg" ? "▲" : g === "downFromNeg" ? "▼" : g == null ? "–" : g === 0 ? "0%" : (g > 0 ? "▲ " : "▼ ") + ssPctNum(g) + "%");
/* under 1%: one decimal, so a small drop never reads as "0%" */
const ssPctNum = (g) => (Math.abs(g) < 0.0995 ? (Math.round(Math.abs(g) * 1000) / 10).toFixed(Math.abs(g) < 0.01 ? 1 : 0).replace(/\.0$/, "") : String(Math.abs(Math.round(g * 100))));
/* ---------- drawing ---------- */
const SS_W = 1080, SS_PAD = 44;
function ssFont() { return (getComputedStyle(document.body).fontFamily || "Arial, sans-serif"); }
function ssCanvas(h) { const c = document.createElement("canvas"); c.width = SS_W * 2; c.height = h * 2; const x = c.getContext("2d"); x.scale(2, 2); x.textBaseline = "middle"; return { c, x }; }
function ssRound(x, l, t, w, h, r, fill) { x.beginPath(); x.moveTo(l + r, t); x.arcTo(l + w, t, l + w, t + h, r); x.arcTo(l + w, t + h, l, t + h, r); x.arcTo(l, t + h, l, t, r); x.arcTo(l, t, l + w, t, r); x.closePath(); x.fillStyle = fill; x.fill(); }
function ssText(x, s, l, y, o = {}) {
  x.font = `${o.w || 500} ${o.size || 22}px ${ssFont()}`; x.fillStyle = o.color || SS_C.ink; x.textAlign = o.align || "left";
  let t = String(s); if (o.max) { while (t.length > 1 && x.measureText(t).width > o.max) t = t.slice(0, -1); if (t !== String(s)) t = t.replace(/\s+\S?$/, "") + "…"; }
  x.fillText(t, l, y); return x.measureText(t).width;
}
function ssPill(x, mk, right, y) {
  const s = mk.txt, bg = SS_C[SS_KIND[mk.kind][0]], fg = SS_C[SS_KIND[mk.kind][1]];
  x.font = `700 20px ${ssFont()}`; const w = Math.max(92, x.measureText(s).width + 28);
  ssRound(x, right - w, y - 18, w, 36, 18, bg); ssText(x, s, right - w / 2, y + 1, { w: 700, size: 20, color: fg, align: "center" });
}
function ssHeader(x, title, sub, P) {
  const g = x.createLinearGradient(0, 0, SS_W, 0); g.addColorStop(0, SS_C.brandDark); g.addColorStop(1, SS_C.brand);
  x.fillStyle = g; x.fillRect(0, 0, SS_W, 190);
  ssText(x, "Sahi", SS_PAD, 52, { w: 800, size: 30, color: SS_C.white }); const sw = x.measureText("Sahi").width;
  ssText(x, "Reach", SS_PAD + sw, 52, { w: 800, size: 30, color: "#9fe3cf" });
  ssText(x, "Extending Reach. Creating Growth.", SS_W - SS_PAD, 52, { w: 500, size: 18, color: "rgba(255,255,255,.75)", align: "right" });
  ssText(x, title, SS_PAD, 112, { w: 800, size: 40, color: SS_C.white });
  ssText(x, sub, SS_PAD, 158, { w: 500, size: 21, color: "rgba(255,255,255,.85)" });
}
function ssFooter(x, y, P) { ssText(x, `Distributor sales, excl. GST · as on ${fmtDate(ymd(NOW()))}${P && P.full ? ` · Change: ${P.n} so far against all of ${P.p}` : ""}`, SS_W / 2, y, { w: 500, size: 17, color: SS_C.ink2, align: "center" }); }
const ssCols = { name: SS_PAD + 20, cur: 700, prev: 880, pill: SS_W - SS_PAD - 14 };
function ssColHead(x, y, P) {
  ssText(x, "Distributor", ssCols.name, y, { w: 700, size: 18, color: SS_C.ink2 });
  ssText(x, P.cur ? `${P.short} so far` : P.short, ssCols.cur, y, { w: 700, size: 18, color: SS_C.ink2, align: "right" });
  ssText(x, P.prevHead, ssCols.prev, y, { w: 700, size: 18, color: SS_C.ink2, align: "right" });
  ssText(x, P.chgHead, ssCols.pill - 46, y, { w: 700, size: 18, color: SS_C.ink2, align: "center" });
}
/* picture 1: every distributor, grouped by district */
function ssDrawDistributors(S2) {
  const P = S2.P, rowH = 54, n = S2.rows.length, dN = S2.districts.length;
  const h = 190 + 30 + 44 + dN * (50 + 58 + 14) + n * rowH + 110 + 70;
  const { c, x } = ssCanvas(h);
  x.fillStyle = "#f5f6f7"; x.fillRect(0, 0, SS_W, h);
  ssHeader(x, `Sales by distributor · ${P.title}`, P.full ? P.vs : `${P.vs} · ${S2.rows.filter((r) => r.cur > 0).length} distributors billed`, P);
  let y = 190 + 30;
  ssRound(x, SS_PAD - 14, y - 6, SS_W - 2 * SS_PAD + 28, h - y - 64, 22, SS_C.white);
  y += 22; ssColHead(x, y, P); y += 22;
  S2.districts.forEach((d) => {
    y += 8; ssRound(x, SS_PAD, y, SS_W - 2 * SS_PAD, 42, 10, SS_C.band);
    ssText(x, d.name.toUpperCase(), ssCols.name, y + 21, { w: 800, size: 19, color: SS_C.brandDark });
    ssText(x, `${d.rows.length} distributor${d.rows.length > 1 ? "s" : ""}`, ssCols.pill, y + 21, { w: 600, size: 17, color: SS_C.ink2, align: "right" });
    y += 50;
    d.rows.forEach((r, i) => {
      const cy = y + rowH / 2;
      ssText(x, r.name, ssCols.name, cy, { w: 600, size: 21, max: 440 });
      ssText(x, ssRs(r.cur), ssCols.cur, cy, { w: 700, size: 21, align: "right", color: r.cur < 0 ? SS_C.down : SS_C.ink });
      ssText(x, r.prev ? ssRs(r.prev) : "–", ssCols.prev, cy, { w: 500, size: 21, align: "right", color: SS_C.ink2 });
      ssPill(x, ssMark(r.cur, r.prev, P), ssCols.pill, cy);
      if (i < d.rows.length - 1) { x.fillStyle = SS_C.line; x.fillRect(ssCols.name, y + rowH - 1, SS_W - SS_PAD - ssCols.name, 1); }
      y += rowH;
    });
    ssRound(x, SS_PAD, y + 4, SS_W - 2 * SS_PAD, 50, 10, SS_C.sub);
    const cy = y + 29;
    ssText(x, `${d.name} total`, ssCols.name, cy, { w: 800, size: 21, color: SS_C.brandDark });
    ssText(x, ssRs(d.cur), ssCols.cur, cy, { w: 800, size: 21, align: "right" });
    ssText(x, d.prev ? ssRs(d.prev) : "–", ssCols.prev, cy, { w: 600, size: 21, align: "right", color: SS_C.ink2 });
    ssPill(x, ssMark(d.cur, d.prev, P), ssCols.pill, cy);
    y += 58 + 14;
  });
  ssRound(x, SS_PAD, y + 6, SS_W - 2 * SS_PAD, 66, 14, SS_C.brandDark);
  const gy = y + 39;
  ssText(x, "Grand total", ssCols.name, gy, { w: 800, size: 24, color: SS_C.white });
  ssText(x, ssRs(S2.cur), ssCols.cur, gy, { w: 800, size: 24, align: "right", color: SS_C.white });
  ssText(x, S2.prev ? ssRs(S2.prev) : "–", ssCols.prev, gy, { w: 600, size: 22, align: "right", color: "rgba(255,255,255,.8)" });
  ssPill(x, ssMark(S2.cur, S2.prev, P), ssCols.pill, gy);
  ssFooter(x, h - 36, P);
  return c;
}
/* picture 2: the district summary, with a bar for each district's share */
function ssDrawDistricts(S2) {
  const P = S2.P, rowH = 104, n = S2.districts.length, hd = P.cur ? 186 : 150, h = 190 + 30 + hd + 20 + 44 + n * rowH + 96 + 70;
  const { c, x } = ssCanvas(h);
  x.fillStyle = "#f5f6f7"; x.fillRect(0, 0, SS_W, h);
  ssHeader(x, `Sales by district · ${P.title}`, P.vs, P);
  let y = 190 + 30;
  /* headline */
  ssRound(x, SS_PAD - 14, y, SS_W - 2 * SS_PAD + 28, hd, 22, SS_C.white);
  ssText(x, P.cur ? `${P.n} so far` : `${P.n} sales`, SS_PAD + 20, y + 42, { w: 600, size: 21, color: SS_C.ink2 });
  ssText(x, ssRs(S2.cur), SS_PAD + 20, y + 96, { w: 800, size: 56 });
  const g = ssMark(S2.cur, S2.prev, P);
  if (P.cur) ssText(x, `On pace for ${ssRs((S2.cur / P.day) * P.mDays)} this month`, SS_PAD + 20, y + 152, { w: 600, size: 19, color: SS_C.brand });
  ssText(x, `vs ${ssRs(S2.prev)} in ${P.full ? "all of " + P.p : P.p}${P.cur && !P.full ? " (same days)" : ""}`, SS_W - SS_PAD - 20, y + 42, { w: 500, size: 19, color: SS_C.ink2, align: "right" });
  x.font = `800 30px ${ssFont()}`; ssPillBig(x, g, SS_W - SS_PAD - 20, y + 100);
  y += hd + 20;
  ssRound(x, SS_PAD - 14, y, SS_W - 2 * SS_PAD + 28, h - y - 70, 22, SS_C.white);
  y += 24;
  ssText(x, "District", ssCols.name, y, { w: 700, size: 18, color: SS_C.ink2 });
  ssText(x, P.cur ? `${P.short} so far` : P.short, ssCols.cur, y, { w: 700, size: 18, color: SS_C.ink2, align: "right" });
  ssText(x, P.prevHead, ssCols.prev, y, { w: 700, size: 18, color: SS_C.ink2, align: "right" });
  ssText(x, P.chgHead, ssCols.pill - 46, y, { w: 700, size: 18, color: SS_C.ink2, align: "center" });
  y += 22;
  const max = Math.max(1, ...S2.districts.map((d) => Math.max(d.cur, 0)));
  S2.districts.forEach((d, i) => {
    const cy = y + 34;
    ssText(x, d.name, ssCols.name, cy, { w: 700, size: 24 });
    ssText(x, ssRs(d.cur), ssCols.cur, cy, { w: 800, size: 23, align: "right", color: d.cur < 0 ? SS_C.down : SS_C.ink });
    ssText(x, d.prev ? ssRs(d.prev) : "–", ssCols.prev, cy, { w: 500, size: 22, align: "right", color: SS_C.ink2 });
    ssPill(x, ssMark(d.cur, d.prev, P), ssCols.pill, cy);
    const bw = SS_W - SS_PAD - 14 - ssCols.name, share = S2.cur > 0 ? Math.max(0, d.cur) / S2.cur : 0;
    ssRound(x, ssCols.name, y + 62, bw, 10, 5, SS_C.flatBg);
    if (d.cur > 0) ssRound(x, ssCols.name, y + 62, Math.max(10, bw * (Math.max(d.cur, 0) / max)), 10, 5, SS_C.brand);
    ssText(x, `${Math.round(share * 100)}% of sales · ${d.rows.filter((r) => r.cur > 0).length} distributor${d.rows.filter((r) => r.cur > 0).length === 1 ? "" : "s"}`, SS_W - SS_PAD - 14, y + 88, { w: 500, size: 15, color: SS_C.ink2, align: "right" });
    if (i < n - 1) { x.fillStyle = SS_C.line; x.fillRect(ssCols.name, y + rowH - 1, SS_W - SS_PAD - ssCols.name, 1); }
    y += rowH;
  });
  ssRound(x, SS_PAD, y + 10, SS_W - 2 * SS_PAD, 66, 14, SS_C.brandDark);
  const gy = y + 43;
  ssText(x, "Grand total", ssCols.name, gy, { w: 800, size: 24, color: SS_C.white });
  ssText(x, ssRs(S2.cur), ssCols.cur, gy, { w: 800, size: 24, align: "right", color: SS_C.white });
  ssText(x, S2.prev ? ssRs(S2.prev) : "–", ssCols.prev, gy, { w: 600, size: 22, align: "right", color: "rgba(255,255,255,.8)" });
  ssPill(x, g, ssCols.pill, gy);
  ssFooter(x, h - 36, P);
  return c;
}
function ssPillBig(x, mk, right, y) {
  const s = mk.txt, bg = SS_C[SS_KIND[mk.kind][0]], fg = SS_C[SS_KIND[mk.kind][1]];
  x.font = `800 30px ${ssFont()}`; const w = x.measureText(s).width + 40;
  ssRound(x, right - w, y - 27, w, 54, 27, bg); ssText(x, s, right - w / 2, y + 1, { w: 800, size: 30, color: fg, align: "center" });
}
/* ---------- the message that goes with the pictures ---------- */
function ssCaption(S2) {
  const P = S2.P, g = ssGrowth(S2.cur, S2.prev), lines = [], paceAmt = P.cur ? (S2.cur / P.day) * P.mDays : null;
  lines.push(`*SahiReach · ${P.cur ? P.n + " sales so far" : P.n + " " + P.year + " sales"}* 📊`);
  if (P.full) {
    const tg = ssGrowth(S2.cur, S2.prev);
    lines.push(`Total: *${ssRs(S2.cur)}*${typeof tg === "number" ? ` (${tg === 0 ? "same as" : (tg > 0 ? "▲ " : "▼ ") + ssPctNum(tg) + "% vs"} all of ${P.p}, ${ssRs(S2.prev)})` : ""}, with ${P.mDays - P.day} day${P.mDays - P.day === 1 ? "" : "s"} to go`);
    if (S2.prev > 0) lines.push(`📈 On pace for ${ssRs(paceAmt)} this month (${paceAmt >= S2.prev ? "▲" : "▼"} ${Math.abs(Math.round((paceAmt / S2.prev - 1) * 100))}% vs ${P.p})`);
    const beaten = S2.rows.filter((r) => r.prev > 0 && r.cur >= r.prev);
    if (beaten.length) lines.push(`🏁 Already beaten ${P.p}: ${beaten.map((r) => r.short).join(", ")}`);
    const fresh = S2.rows.filter((r) => r.prev === 0 && r.cur > 0);
    if (fresh.length) lines.push(`🆕 New this month: ${fresh.map((r) => r.short).join(", ")}`);
    const top = S2.rows.slice().sort((a, b) => b.cur - a.cur)[0];
    if (top && top.cur > 0) lines.push(`🏆 Highest sales: ${top.short} (${ssRs(top.cur)})`);
    lines.push(""); lines.push(`*By district* (vs all of ${P.p})`);
    S2.districts.forEach((d) => { const dg = ssGrowth(d.cur, d.prev); lines.push(`• ${d.name}: ${ssRs(d.cur)}${dg === "new" ? " (new)" : typeof dg === "number" && dg !== 0 ? ` (${dg > 0 ? "▲" : "▼"} ${ssPctNum(dg)}%)` : ""}`); });
    lines.push("");
    lines.push(S2.prev > 0 && S2.cur < S2.prev ? `${ssRs(S2.prev - S2.cur)} more to match ${P.p}. Let's get there! 💪` : `${P.p} already beaten. Let's finish strong! 💪`);
    return lines.join("\n");
  }
  lines.push(`Total: *${ssRs(S2.cur)}* ${typeof g === "string" || g == null ? "" : g === 0 ? `(same as ${P.p})` : `(${g > 0 ? "▲" : "▼"} ${ssPctNum(g)}% vs ${P.p}${P.cur ? ", same days" : ""})`}`.trim());
  if (P.cur) lines.push(`📈 On pace for ${ssRs(paceAmt)} this month`);
  const growers = S2.rows.filter((r) => r.prev >= 10000 && r.cur > r.prev).sort((a, b) => (b.cur - b.prev) / b.prev - (a.cur - a.prev) / a.prev).slice(0, 3);
  if (growers.length) lines.push(`🚀 Top growth: ${growers.map((r) => `${r.short} ▲${Math.round(((r.cur - r.prev) / r.prev) * 100)}%`).join(", ")}`);
  const fresh = S2.rows.filter((r) => r.prev === 0 && r.cur > 0);
  if (fresh.length) lines.push(`🆕 New this month: ${fresh.map((r) => r.short).join(", ")}`);
  const top = S2.rows.slice().sort((a, b) => b.cur - a.cur)[0];
  if (top && top.cur > 0) lines.push(`🏆 Highest sales: ${top.short} (${ssRs(top.cur)})`);
  lines.push("");
  lines.push("*By district*");
  S2.districts.forEach((d) => { const dg = ssGrowth(d.cur, d.prev); lines.push(`• ${d.name}: ${ssRs(d.cur)}${dg === "new" ? " (new)" : dg == null || dg === 0 || typeof dg === "string" ? "" : ` (${dg > 0 ? "▲" : "▼"} ${ssPctNum(dg)}%)`}`); });
  lines.push("");
  lines.push(typeof g === "number" && g < 0 ? "Let's push hard and turn these numbers around! 💪" : "Great work, team. Let's keep it going! 💪");
  return lines.join("\n");
}
/* ---------- the sheet ---------- */
function ssBuild() {
  const m = S.ssMonth || ssMonths()[1], P = ssPeriods(m, S.ssCmp), S2 = ssData(P);
  const c1 = ssDrawDistributors(S2), c2 = ssDrawDistricts(S2);
  const tag = `${P.short}-${P.year}${P.full ? "-so-far-vs-all-" + P.pShort : P.cur ? "-so-far" : ""}`;
  S.ss = { P, S2, caption: ssCaption(S2), urls: [c1.toDataURL("image/png"), c2.toDataURL("image/png")], files: null, names: [`SahiReach-sales-${tag}-distributors.png`, `SahiReach-sales-${tag}-districts.png`] };
  Promise.all([c1, c2].map((c) => new Promise((ok) => c.toBlob(ok, "image/png")))).then((bl) => { if (S.ss && S.ss.P.m === P.m) S.ss.files = bl.map((b, i) => new File([b], S.ss.names[i], { type: "image/png" })); });
}
function ssBody() {
  const s = S.ss, P = s.P, months = ssMonths();
  return `<div class="field"><label class="label" for="ss-month">Which month</label><select class="select" id="ss-month" data-in="ssMonth">${months.map((m, i) => `<option value="${m}" ${m === P.m ? "selected" : ""}>${ssMonthName(m)} ${m.slice(0, 4)}${i === 0 ? " (so far)" : " against " + ssMonthName(months[i + 1] || ymd(new Date(+m.slice(0, 4), +m.slice(5, 7) - 2, 1)).slice(0, 7))}</option>`).join("")}</select></div>
    ${P.cur ? `<div class="field"><div class="label">Compare with</div><div class="hstack gap-8 wrap"><button class="chip" data-act="ssCmp" data-v="same" aria-pressed="${!P.full}">Same days of ${esc(P.p)} (1–${P.day})</button><button class="chip" data-act="ssCmp" data-v="full" aria-pressed="${P.full}">All of ${esc(P.p)}</button></div>${P.full ? `<div class="row-sub" style="margin-top:6px">Change is ${esc(P.n)} so far (${P.day} of ${P.mDays} days) against all of ${esc(P.p)}.</div>` : ""}</div>` : ""}
    ${s.S2.rows.length ? `<div class="stack gap-12"><div class="row-sub">These two pictures and the message go to WhatsApp together.</div>
      <img src="${s.urls[0]}" alt="Sales by distributor" style="width:100%;border-radius:14px;border:1px solid var(--line)">
      <img src="${s.urls[1]}" alt="Sales by district" style="width:100%;border-radius:14px;border:1px solid var(--line)">
      <div class="card card-pad"><div class="label" style="margin-bottom:6px">Message</div><div style="white-space:pre-wrap;font-size:14px;line-height:1.5">${esc(s.caption)}</div></div></div>` : `<div class="group"><div class="empty"><div class="big">No distributor sales</div>Nothing was billed in ${esc(P.n)} or ${esc(P.p)}.</div></div>`}`;
}
ACT.salesShare = () => {
  S.ssMonth = S.ssMonth || ssMonths()[1]; ssBuild();
  openSheet("Share sales with the team", `<div id="ss-body" class="stack gap-16">${ssBody()}</div>`,
    `<button class="btn btn-secondary" data-act="ssCopy">${ic("copy", "sm")} Copy message</button><button class="btn btn-secondary" data-act="ssDownload">${ic("down", "sm")} Download pictures</button><button class="btn btn-primary" data-act="ssShare">${ic("arrowR", "sm")} Share on WhatsApp</button>`, true);
};
ACT.ssCmp = (el) => { S.ssCmp = el.dataset.v; ssBuild(); part("ss-body", ssBody()); };
IN.ssMonth = (el) => { S.ssMonth = el.value; ssBuild(); part("ss-body", ssBody()); };
function ssDownloadAll() { S.ss.urls.forEach((u, i) => { const a = document.createElement("a"); a.href = u; a.download = S.ss.names[i]; document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 500); }); }
ACT.ssDownload = () => { if (!S.ss) return; ssDownloadAll(); toast("Both pictures downloaded", "check"); };
ACT.ssCopy = () => { if (!S.ss) return; copyText(S.ss.caption, "Message copied. Paste it in WhatsApp"); };
ACT.ssShare = () => {
  const s = S.ss; if (!s || !s.S2.rows.length) return;
  /* phones (and some computers): the share sheet, with both pictures and the message; pick WhatsApp there */
  if (s.files && navigator.canShare && navigator.canShare({ files: s.files })) {
    navigator.share({ files: s.files, text: s.caption, title: `SahiReach sales · ${s.P.title}` }).catch((e) => { if (e && e.name !== "AbortError") { ssDownloadAll(); window.open("https://wa.me/?text=" + encodeURIComponent(s.caption), "_blank"); } });
    return;
  }
  /* elsewhere: save the pictures, open WhatsApp with the message, attach the pictures there */
  ssDownloadAll(); if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s.caption).catch(() => {});
  window.open("https://wa.me/?text=" + encodeURIComponent(s.caption), "_blank");
  toast("Pictures downloaded and WhatsApp opened with the message: attach the two pictures there", "info");
};

/* ===== ORDERS: list, detail, sales order, new / edit order ===== */
const UNIT_LABEL = { Crate: "Crates", "EA (Box)": "Boxes", Pieces: "Pieces" };
const vehicleFor = (c) => (c <= 0 ? null : c <= 62 ? "Bada Dost (up to 62 crates)" : c <= 80 ? "10 ft truck (up to 80 crates)" : c <= 162 ? "Mahindra Furio 12 ft (up to 162 crates)" : c <= 189 ? "Bharat Benz 14 ft (up to 189 crates)" : c <= 270 ? "Bharat Benz 1217 16 ft (up to 270 crates)" : "Over 270 crates: split into more than one trip");
const orderById = (id) => D.orders.find((o) => o.id === id);

function ordersList() {
  const q = key(S.ordersQ), tab = S.ordersTab;
  const byDisp = tab === "Dispatched", when = (o) => (byDisp && o.dispatched ? o.dispatched : o.time);
  const list = D.orders.filter((o) => (tab === "All" || o.status === tab) && (!q || key(o.dist).includes(q) || key(o.id).includes(q))).slice().sort((a, b) => (when(a) < when(b) ? 1 : -1));
  if (!list.length) return `<div class="group"><div class="empty"><div class="big">${tab === "Pending" ? "Nothing waiting" : "No orders found"}</div>${tab === "Pending" ? "Every order has been dispatched. New orders show up here until the truck leaves." : "Try another name or order number."}</div></div>`;
  const groups = []; let cur = null;
  list.forEach((o) => { const k = dayKey(toDate(when(o))); if (!cur || cur.k !== k) { cur = { k, label: (byDisp ? "Dispatched " : "") + dayLabel(when(o)).replace(/^(Today|Yesterday)$/, (m) => (byDisp ? m.toLowerCase() : m)), items: [] }; groups.push(cur); } cur.items.push(o); });
  return groups.map((g) => `<div><div class="group-label"><span>${esc(g.label)}</span><span class="num">${g.items.length} order${g.items.length > 1 ? "s" : ""} · ${rs(g.items.reduce((a, o) => a + (o.status === "Cancelled" ? 0 : o.value), 0))}</span></div><div class="group">${g.items.map((o) => `<button class="row" data-act="orderSheet" data-id="${esc(o.id)}"><span class="avatar soft">${esc(initials(o.dist))}</span><span class="grow"><div class="row-title clip">${esc(o.dist)}</div><div class="row-sub clip">${backPill(o) ? backPill(o) + " " : ""}${byDisp ? "Ordered " + fmtDT(o.time) : fmtTime(o.time)}${!byDisp && o.status === "Dispatched" && o.dispatched ? " · dispatched " + fmtDT(o.dispatched) : ""} · ${o.lines} line${o.lines === 1 ? "" : "s"} · ${nf(o.crates)} crates${o.timesEdited ? " · edited" : ""}</div></span><span class="row-end"><span class="c-hide">${statusPill(o.status)}</span><span class="row-value">${rs(o.value)}</span>${ic("chevR", "sm chev")}</span></button>`).join("")}</div></div>`).join("");
}
VIEWS.orders = () => {
  const count = (s) => D.orders.filter((o) => o.status === s).length;
  return `<div class="page narrow">
    <div class="page-head"><div><h1 class="title">Orders</h1><div class="subtitle">Every distributor order, newest first. Pending orders can still be edited or cancelled.</div></div><div class="head-actions"><button class="btn btn-secondary" data-act="importOrderGo">${ic("doc", "sm")} Paste or upload order</button><button class="btn btn-primary" data-act="newOrder">${ic("plus", "sm")} New order</button></div></div>
    <div class="hstack gap-12 wrap">${seg("ordersTab", S.ordersTab, [["Pending", "Pending", count("Pending")], ["Dispatched", "Dispatched", count("Dispatched")], ["Cancelled", "Cancelled", count("Cancelled")], ["All", "All"]])}
      <div class="search">${ic("search", "sm")}<input class="input" id="orders-q" type="search" placeholder="Search distributor or order number" value="${esc(S.ordersQ)}" data-in="ordersQ" autocomplete="off"></div></div>
    <div id="orders-list" class="stack gap-20">${ordersList()}</div></div>`;
};
IN.ordersQ = (el) => { S.ordersQ = el.value; part("orders-list", ordersList()); };

ACT.orderSheet = (el) => showOrder(el.dataset.id);
function showOrder(id, confirmCancel, confirmUndo) {
  const o = orderById(id); if (!o) return;
  const lines = linesByOrder[id] || [], missed = D.oos.filter((x) => x.id === id), d = distByKey[key(o.dist)] || {};
  const tl = [`<div class="tl"><span class="tl-dot tint"></span><div><b>Order saved</b><div class="row-sub">${fmtDT(o.time)}</div></div></div>`];
  if (o.edited) tl.push(`<div class="tl"><span class="tl-dot warn"></span><div><b>Edited${o.timesEdited > 1 ? " " + o.timesEdited + " times" : ""}</b><div class="row-sub">Last change ${fmtDT(o.edited)}</div></div></div>`);
  (o.undone || []).forEach((u) => tl.push(`<div class="tl"><span class="tl-dot warn"></span><div><b>Dispatch undone</b><div class="row-sub">${fmtDT(u.at)}${u.by ? " by " + esc(u.by) : ""} · it had been marked dispatched ${fmtDT(u.was)}</div></div></div>`));
  if (o.status === "Dispatched") tl.push(`<div class="tl"><span class="tl-dot good"></span><div><b>Dispatched</b><div class="row-sub">${fmtDT(o.dispatched)}</div></div></div>`);
  if (o.status === "Cancelled") tl.push(`<div class="tl"><span class="tl-dot bad"></span><div><b>Cancelled</b><div class="row-sub">Stock went back on the shelf</div></div></div>`);
  if (o.status === "Pending") tl.push(`<div class="tl"><span class="tl-dot"></span><div class="muted">Waiting for dispatch</div></div>`);
  const body = `
    ${backBanner(o)}
    <div class="card card-pad"><div class="hstack gap-12" style="align-items:flex-start"><span class="avatar lg soft">${esc(initials(o.dist))}</span><div class="grow"><div class="section-title" style="font-size:19px">${esc(o.dist)}</div><div class="row-sub">${esc(d.district || "")}${d.pay ? " · " + esc(d.pay) : ""}${d.credit != null ? " · " + d.credit + " days credit" : ""}</div><div style="margin-top:8px" class="hstack gap-8 wrap">${statusPill(o.status)}<span class="mono dim">${esc(o.id)}</span></div></div></div>
      <div class="divider" style="margin:16px 0"></div>
      <div class="kv"><div><div class="k">Ordered</div><div class="v">${fmtDT(o.time)}</div></div><div><div class="k">Dispatched</div><div class="v">${o.status === "Dispatched" && o.dispatched ? fmtDT(o.dispatched) : o.status === "Cancelled" ? "Cancelled" : "Not yet"}</div></div><div><div class="k">Crates</div><div class="v num">${nf(o.crates)}</div></div><div><div class="k">Value excl. GST</div><div class="v num">${rs2(o.value)}</div></div><div><div class="k">GST 5%</div><div class="v num">${rs2(o.value * 0.05)}</div></div><div><div class="k">Total incl. GST</div><div class="v num">${rs2(o.value * 1.05)}</div></div>${o.tod ? `<div><div class="k">TOD to claim</div><div class="v num">${rs2(o.tod)}</div></div>` : ""}</div></div>
    ${confirmCancel ? `<div class="confirm"><span><b>Cancel this order?</b> ${nf(o.crates)} crates go back into stock. This cannot be undone.</span><span class="hstack gap-8"><button class="btn btn-sm btn-secondary" data-act="orderSheet" data-id="${id}">Keep order</button><button class="btn btn-sm btn-danger" data-act="cancelOrderYes" data-id="${id}">Cancel order</button></span></div>` : ""}
    ${confirmUndo ? undoDispatchHtml(o) : ""}
    ${o.status === "Pending" ? orderQCOfferHtml(o) : ""}
    ${o.notes ? `<div class="banner info">${ic("info", "sm")}<span>${esc(o.notes)}</span></div>` : ""}
    <div><div class="group-label"><span>Timeline</span></div><div class="card card-pad"><div class="timeline">${tl.join("")}</div></div></div>
    ${o.status === "Dispatched" ? `<div><div class="group-label"><span>Vyapar invoice</span></div><div class="group"><button class="row" data-act="aceInvOne" data-t="order" data-id="${id}" data-back="order"><span class="attn-ic ${o.inv ? "tint" : "warn"}">${ic("doc")}</span><span class="grow"><div class="row-title">${o.inv ? esc(o.inv) : "Add the invoice number"}</div><div class="row-sub">${o.ewb ? "E-way bill " + esc(o.ewb) : "E-way bill not recorded"} · as made in Vyapar</div></span>${ic("chevR", "sm chev")}</button></div></div>` : ""}
    ${lines.length ? `<div><div class="group-label"><span>${lines.length} line${lines.length > 1 ? "s" : ""}</span><span>${nf(lines.reduce((a, l) => a + (l.crates || 0), 0))} crates</span></div><div class="group">${lines.map((l) => `<div class="row"><span class="grow"><div class="row-title clip">${esc(shortName(l.product))}</div><div class="row-sub">${nf(l.crates, 2)} crate${l.crates === 1 ? "" : "s"} · ${nf(l.ea)} boxes × ${rs2(l.billed)}${l.tod ? ` · TOD ${rs2(l.tod)}` : ""}${l.qc > 0 ? ` · <span style="color:var(--tint);font-weight:600">${nf(l.qc, 2)} from quick commerce stock</span>` : ""}${l.part || (l.crates % 1 && Math.abs(l.crates % 1) > 1e-6) ? ` · <span style="color:var(--tint);font-weight:600">broken crate</span>` : ""}</div></span><span class="row-end"><span class="row-value">${rs2(l.value)}</span></span></div>`).join("")}</div></div>` : ""}
    ${missed.length ? `<div><div class="group-label"><span>Not supplied in full</span></div><div class="group">${missed.map((m) => `<div class="row"><span class="attn-ic warn" style="width:28px;height:28px">${ic("alert", "sm")}</span><span class="grow"><div class="row-title clip">${esc(shortName(m.product))}</div><div class="row-sub">${esc(m.reason)}</div></span>${typeof m.missed === "number" ? `<span class="row-end"><span class="pill warn plain">${m.missed} missed</span></span>` : ""}</div>`).join("")}</div></div>` : ""}`;
  const foot = `<button class="btn btn-secondary" data-act="soPreview" data-id="${id}">${ic("doc", "sm")} Sales order</button>${o.status !== "Cancelled" && lines.length ? `<button class="btn btn-secondary" data-act="${o.status === "Dispatched" ? "emailDispatch" : "emailSO"}" data-id="${id}">${ic("arrowR", "sm")} ${o.status === "Dispatched" ? "Email: on its way" : "Email sales order"}</button>` : ""}${o.status === "Pending" ? `<button class="btn btn-danger" data-act="cancelOrderAsk" data-id="${id}">Cancel order</button><button class="btn btn-primary" data-act="editOrder" data-id="${id}">${ic("pencil", "sm")} Edit order</button>` : ""}${o.status === "Dispatched" && ROLE === "owner" ? `<button class="btn btn-secondary" data-act="undoDispatchAsk" data-id="${id}">${ic("undo", "sm")} Undo dispatch</button>` : ""}`;
  openSheet("Order", body, lines.length || o.status !== "Cancelled" ? foot : "");
}
ACT.cancelOrderAsk = (el) => showOrder(el.dataset.id, true);
function restoreStock(id) { (linesByOrder[id] || []).forEach((l) => { const st = stockBySap[l.sap]; if (st && st.upc) { st.ea += l.ea || 0; st.crates = st.ea / st.upc; st.pcs = st.ea * (st.ppe || 1); } }); }
function cancelOrder(id) {
  const o = orderById(id); if (!o || o.status !== "Pending") return;
  restoreStock(id);
  o.notes = `Cancelled ${fmtDT(NOW())}: was ${o.lines} lines, ${nf(o.crates)} crates, ${rs(o.value)}.`;
  o.status = "Cancelled"; delete linesByOrder[id];
  D.oos = D.oos.filter((x) => x.id !== id); D.tod.lines = D.tod.lines.filter((x) => x.id !== id);
  delete S.picked[id];
  logActivity("Order cancelled", id, `${o.dist}: stock put back`);
}
ACT.cancelOrderYes = (el) => { cancelOrder(el.dataset.id); closeSheet(); render(); toast("Order cancelled, stock is back"); };

/* ---- new / edit order ---- */
ACT.newOrder = () => { if (S.draft.editId) S.draft = newDraft(); closeSheet(); go("new-order"); };
function searchProducts(q, limit = 30) {
  const words = key(q).split(" ").filter(Boolean);
  const list = D.catalog.filter((c) => c.sap && words.every((w) => key(c.name).includes(w))).map((c) => { const st = stockBySap[c.sap], q = qcBySap[c.sap]; return { c, st, crates: st && st.upc ? st.ea / st.upc : null, qc: q ? Math.max(0, (q.crates || 0) - (typeof qcHeld === "function" ? qcHeld(c.sap).q : 0)) : 0 }; });
  list.sort((a, b) => (b.crates > 0) - (a.crates > 0) || (b.crates != null) - (a.crates != null) || (b.crates || 0) - (a.crates || 0) || a.c.name.localeCompare(b.c.name));
  return list.slice(0, limit);
}
function calcDraft() {
  const dr = S.draft, d = dr.dist ? distByKey[key(dr.dist)] : null, used = {}, usedQ = {}, oldEA = {};
  if (dr.editId) (dr.orig || []).forEach((l) => { oldEA[l.sap] = (oldEA[l.sap] || 0) + (l.ea || 0); });
  const rows = dr.lines.map((ln) => {
    const st = stockBySap[ln.sap] || qcOnlyStock(ln.sap), c = catBySap[ln.sap] || {}, upc = st ? st.upc : null, ppe = (st && st.ppe) || c.ppe || 1, stocked = !!(st && upc > 0), qty = +ln.qty || 0;
    const exact = !stocked ? null : ln.unit === "Crate" ? qty : ln.unit === "EA (Box)" ? qty / upc : qty / (upc * ppe);
    let req = stocked ? Math.ceil(Math.round(exact * 1e6) / 1e6) : null;
    const avail = stocked ? Math.max(0, (st.ea + (oldEA[ln.sap] || 0) - ownHeldEA(ln.sap)) / upc - (used[ln.sap] || 0)) : 0; /* minus crates held for a sent QC pick list */
    /* orders go out in whole crates. Exceptions: a line marked "broken crate" goes exactly (pieces rounded up to whole boxes),
       and boxes ordered from loose boxes in stock (a part crate, e.g. from a return) go exactly too */
    const exactReq = stocked ? (ln.unit === "Pieces" ? Math.ceil(Math.round(exact * upc * 1e6) / 1e6) / upc : Math.round(exact * 1e6) / 1e6) : null;
    const loose = stocked && !ln.part && ln.unit !== "Crate" && avail + 1e-9 >= exact && avail < req - 1e-9;
    if (stocked && (ln.part || loose) && exactReq > 0) req = exactReq;
    const rounded = stocked && !ln.part && !loose && qty > 0 && req > exactReq + 1e-9;
    const own = stocked ? Math.max(0, Math.min(req, avail)) : 0;
    /* short of SahiReach stock: quick commerce stock can fill the rest, if the user says so */
    const qcFree = stocked && req > own + 1e-9 ? Math.max(0, Math.floor(orderQCFree(ln.sap, oldEA[ln.sap] || 0) - (usedQ[ln.sap] || 0) + 1e-9)) : 0;
    const useQC = ln.useQC != null ? ln.useQC : !!(D.qcPick && D.qcPick.autoQC);
    const qcTake = useQC && qcFree > 0 ? Math.min(req - own, qcFree) : 0, supply = own + qcTake;
    if (stocked) { used[ln.sap] = (used[ln.sap] || 0) + own; usedQ[ln.sap] = (usedQ[ln.sap] || 0) + qcTake; }
    const ea = supply * (upc || 0), normal = price(ln.sap), base = normal != null ? normal : ln.manual > 0 ? +ln.manual : null;
    const special = d && d.special && D.special.prices[ln.sap] != null ? D.special.prices[ln.sap] : null;
    const billed = special != null ? special : base, value = billed != null ? Math.round(ea * billed * 100) / 100 : null;
    const todEA = special != null && base != null ? Math.max(0, Math.round((base - special) * 100) / 100) : 0;
    const status = !qty ? "empty" : !stocked ? "notstocked" : supply <= 0 ? "out" : supply < req - 1e-9 ? "short" : "ok";
    return { ln, st, c, upc, ppe, stocked, qty, req, exactReq, rounded, loose, avail, own, qcFree, qcTake, supply, ea, pcs: ea * ppe, normal, special, billed, value, todEA, tod: Math.round(ea * todEA * 100) / 100, status, needPrice: billed == null && qty > 0 && stocked && avail > 0 };
  });
  const sum = (f) => rows.reduce((a, r) => a + (f(r) || 0), 0);
  const net = Math.round(sum((r) => r.value) * 100) / 100;
  return { rows, d, crates: sum((r) => r.supply), req: sum((r) => r.req), net, gst: Math.round(net * 5) / 100, tod: sum((r) => r.tod), ea: sum((r) => r.ea), needPrice: rows.filter((r) => r.needPrice).length, short: rows.filter((r) => ["short", "out", "notstocked"].includes(r.status)).length, qcCan: rows.filter((r) => r.qcFree > 0 && !(r.qcTake > 0) && r.qty > 0), qcTake: sum((r) => r.qcTake) };
}
function distCard(d) {
  const due = d.credit != null ? new Date(Date.now() + d.credit * 864e5) : null;
  const fact = (t, cls = "") => `<span class="pill plain ${cls}">${esc(t)}</span>`;
  return `<div class="dist-card"><div class="hstack gap-12"><span class="avatar lg soft">${esc(initials(d.name))}</span><div class="grow"><div class="section-title clip" style="font-size:19px">${esc(d.name)}</div><div class="row-sub">${esc(d.district || "")}${d.phone ? " · " + esc(d.phone) : ""}</div></div><button class="btn btn-sm btn-secondary" data-act="clearDist">Change</button></div>
    <div class="dist-facts">${d.special ? fact("Special prices · TOD tracked", "tint") : fact("Normal South Kerala rate")}${fact("Orders in " + (UNIT_LABEL[d.uom] || "Crates").toLowerCase())}${d.pay ? fact(d.pay) : ""}${d.credit != null ? fact(d.credit + " days credit · due " + fmtDate(due)) : fact("Credit days not set", "warn")}${d.deposit ? fact("Deposit " + rs(d.deposit)) : ""}${d.freezer ? fact(d.freezer) : ""}</div></div>`;
}
function distResults() {
  const q = key(S.draft.dq);
  const list = D.distributors.filter((d) => !q || key(d.name).includes(q) || key(d.district).includes(q));
  return list.length ? `<div class="group">${list.map((d) => `<button class="row" data-act="pickDist" data-name="${esc(d.name)}"><span class="avatar soft">${esc(initials(d.name))}</span><span class="grow"><div class="row-title clip">${esc(d.name)}</div><div class="row-sub">${esc(d.district || "District not set")}${d.special ? " · special prices" : ""}</div></span>${ic("chevR", "sm chev")}</button>`).join("")}</div>` : `<div class="group"><div class="empty">No distributor matches “${esc(S.draft.dq)}”.</div></div>`;
}
function productResults() {
  const q = S.draft.q; if (!q || q.length < 2) return "";
  const list = searchProducts(q, 12);
  if (!list.length) return `<div class="results"><div class="empty" style="padding:22px">Nothing matches “${esc(q)}”.</div></div>`;
  S.draft.sel = Math.min(S.draft.sel || 0, list.length - 1);
  return `<div class="results" role="listbox">${list.map((x, i) => `<button class="res" role="option" aria-selected="${i === S.draft.sel}" data-act="addLine" data-sap="${esc(x.c.sap)}"><span class="stock-badge ${x.crates == null ? "none" : x.crates <= 0 ? "zero" : ""}">${x.crates == null ? "–" : x.crates > 0 && x.crates < 1 ? nf(x.crates, 1) : nf(Math.floor(x.crates))}</span><span class="grow"><div class="row-title">${esc(x.c.name)}</div><div class="row-sub">${esc(x.c.cat || "")} · ${x.crates == null ? "not in SahiReach stock" : x.crates <= 0 ? "out of stock" : x.crates < 1 ? `${nf(Math.round(x.st.ea))} loose boxes in stock` : "crates in stock"}${x.qc >= 1 && !(x.crates >= 1) ? ` · <span style="color:var(--tint);font-weight:600">quick commerce has ${nf(Math.floor(x.qc))}</span>` : x.crates == null ? ", logged as demand" : ""}${price(x.c.sap) != null ? " · " + rs2(price(x.c.sap)) + " / box" : " · no list price"}</div></span>${ic("plus", "sm dim")}</button>`).join("")}</div><div class="row-sub" style="padding:6px 4px 0">↑ ↓ to choose · Enter to add · the cursor stays here for the next product</div>`;
}
/* full crates, or (once in a while) a broken crate: exactly what was asked for */
const bx = (n) => `${nf(Math.round(n * 100) / 100)} box${Math.abs(n - 1) < 1e-9 ? "" : "es"}`;
function linePartHtml(r, i) {
  if (!r.stocked || !r.qty || r.status === "out") return "";
  const btn = (txt, off) => `<button class="btn-plain" style="height:auto;padding:0;font-size:inherit;font-weight:600;color:var(--tint)" data-act="linePart" data-i="${i}"${off ? ' data-off="1"' : ""}>${txt}</button>`;
  if (r.ln.part) return `<div class="line-msg tint">${ic("box", "sm")} <span><b>Broken crate:</b> exactly ${bx(r.exactReq * r.upc)} (${nf(r.exactReq, 2)} crate). ${btn("Full crates", true)}</span></div>`;
  if (r.loose) return `<div class="line-msg tint">${ic("box", "sm")} <span>From loose boxes in stock: exactly ${bx(r.exactReq * r.upc)}.</span></div>`;
  if (r.rounded) return `<div class="line-msg">${ic("info", "sm")} <span class="muted">Rounded up to ${r.req} full crate${r.req > 1 ? "s" : ""} (${bx(r.req * r.upc)}). ${btn(`Send exactly ${bx(r.exactReq * r.upc)} (broken crate)`)}</span></div>`;
  return "";
}
ACT.linePart = (el) => { const l = S.draft.lines[+el.dataset.i]; if (!l) return; l.part = !el.dataset.off; refreshOrderLines(); };
function lineCalcHtml(r, i) {
  let msg = "";
  if (r.status === "notstocked") msg = `<div class="line-msg warn">${ic("info", "sm")} Not in your range: logged as demand, nothing supplied.</div>`;
  else if (r.status === "out") msg = `<div class="line-msg bad">${ic("alert", "sm")} Out of stock: ${r.req} crate${r.req > 1 ? "s" : ""} logged as missed.</div>`;
  else if (r.status === "short") msg = `<div class="line-msg warn">${ic("alert", "sm")} Only ${nf(r.supply, 2)} crate${r.supply === 1 ? "" : "s"}${r.supply % 1 ? ` (${nf(Math.round(r.supply * r.upc))} boxes)` : ""} available: ${nf(r.req - r.supply, 2)} logged as missed.</div>`;
  msg += lineQCHtml(r, i);
  msg += linePartHtml(r, i);
  if (r.needPrice) msg += `<div class="line-msg bad">${ic("tag", "sm")} No price in the South Kerala list. Price per box: <input class="input sm num-in" style="width:110px" id="mp-${i}" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00" value="${r.ln.manual || ""}" data-in="manualPrice" data-i="${i}"></div>`;
  return `<div class="line-val"><div class="row-value">${r.value != null && r.qty && r.supply > 0 ? rs2(r.value) : "–"}</div><div class="row-sub nowrap">${r.stocked && r.qty ? `${nf(r.supply, 2)} cr · ${nf(r.ea)} bx` : ""}</div></div>${msg}`;
}
function linesHtml(C) {
  if (!C.rows.length) return `<div class="empty"><div class="big">No products yet</div>Search above to add the first one. Products in stock come first.</div>`;
  return C.rows.map((r, i) => `<div class="line ${S.draft.flash === i ? "flash" : ""}" id="line-${i}"><span class="line-no">${i + 1}</span>
    <div class="line-name"><span class="line-title">${esc(r.c.name || r.ln.name)}</span>${r.special != null ? ` <span class="pill plain tint" style="height:20px;font-size:11.5px">special</span>` : ""}</div>
    <button class="info-btn" data-act="lineInfo" data-i="${i}" data-info="${i}" aria-label="Stock and price details for ${esc(r.c.name || r.ln.name)}">i</button>
    <div class="line-qty"><div class="stepper sm"><button data-act="step" data-i="${i}" data-d="-1" aria-label="Less">${ic("minus", "sm")}</button><input id="qty-${i}" type="number" inputmode="decimal" step="any" min="0" value="${r.ln.qty}" data-in="qty" data-i="${i}" aria-label="Quantity"><button data-act="step" data-i="${i}" data-d="1" aria-label="More">${ic("plus", "sm")}</button></div>
      <select class="select sm unit-sel" id="unit-${i}" data-in="unit" data-i="${i}" aria-label="Unit">${Object.keys(UNIT_LABEL).map((u) => `<option value="${u}" ${u === r.ln.unit ? "selected" : ""}>${UNIT_LABEL[u]}</option>`).join("")}</select></div>
    <div id="calc-${i}" style="display:contents">${lineCalcHtml(r, i)}</div>
    <button class="icon-btn line-rm" data-act="rmLine" data-i="${i}" aria-label="Remove line">${ic("trash", "sm")}</button></div>`).join("");
}
/* the i button: stock position, prices and history for one line, on hover (mouse) or tap */
function lineInfoHtml(i) {
  const C = calcDraft(), r = C.rows[i]; if (!r) return "";
  const st = r.st, rp = replBySap[r.ln.sap] || {}, q = qcBySap[r.ln.sap], d = C.d;
  const lastL = d ? D.orders.filter((o) => o.dist === d.name && o.status !== "Cancelled" && o.id !== S.draft.editId).sort((a, b) => (a.time < b.time ? 1 : -1)).map((o) => ({ o, l: (linesByOrder[o.id] || []).find((l) => l.sap === r.ln.sap) })).find((x) => x.l) : null;
  const row = (k, v) => `<div class="pop-row"><span>${k}</span><b>${v}</b></div>`;
  return `<div class="pop-title">${esc(r.c.name || r.ln.name)}</div><div class="row-sub" style="margin-bottom:8px">SAP ${esc(r.ln.sap)}${st && st.trop ? " · " + esc(st.trop) : ""}${r.c.cat ? " · " + esc(r.c.cat) : ""}</div>
    ${st ? row("In stock", `${nf(st.ea / st.upc, 2)} crates · ${nf(st.ea)} boxes`) + row("Available for this order", `${nf(r.avail, 2)} crates`) + row("Pack", `${st.upc} boxes / crate · ${st.ppe || 1} pcs / box`) : row("Stock", "Not stocked")}
    ${rp.perDay ? row("Sells", `${nf(rp.perDay, 2)} crates / day`) + row("Days of stock", rp.days != null ? nf(rp.days, 1) : "–") : ""}
    ${rp.onOrder ? row("On order from Hangyo", `${nf(rp.onOrder, 1)} crates`) : ""}
    ${q ? row("Quick commerce stock", `${nf(q.crates || 0)} crates`) : ""}
    <div class="divider" style="margin:8px 0"></div>
    ${row("Distributor rate", r.normal != null ? rs2(r.normal) + " / box" : "No list price")}
    ${r.special != null ? row("Special price", rs2(r.special) + " / box") + row("TOD per box", rs2(r.todEA)) : ""}
    ${r.c.mrp ? row("MRP", rs2(r.c.mrp) + " / box") : ""}
    ${ssRate(r.ln.sap) != null && r.billed != null && SEE_MONEY ? row("Margin", `${rs2(r.billed - ssRate(r.ln.sap))} / box`) : ""}
    ${lastL ? `<div class="divider" style="margin:8px 0"></div>` + row("Last ordered", `${fmtDate(lastL.o.time)} · ${nf(lastL.l.qty)} ${((UNIT_LABEL[lastL.l.unit] || "Crates").toLowerCase()).replace(/s$/, +lastL.l.qty === 1 ? "" : "s")}`) : ""}
    ${rp.cls ? `<div style="margin-top:8px">${classPill(rp.cls)}</div>` : ""}`;
}
let popFor = null;
function closePop() { const p = $("#pop"); if (p) p.remove(); popFor = null; }
function openPop(btn) {
  const i = +btn.dataset.i; if (popFor === btn) return;
  closePop(); popFor = btn;
  const p = document.createElement("div"); p.id = "pop"; p.className = "pop"; p.setAttribute("role", "dialog"); p.innerHTML = lineInfoHtml(i); document.body.appendChild(p);
  const b = btn.getBoundingClientRect(), w = Math.min(300, window.innerWidth - 24), h = p.offsetHeight;
  p.style.width = w + "px";
  let left = Math.min(window.innerWidth - w - 12, Math.max(12, b.left + b.width / 2 - w / 2)), top = b.bottom + 8;
  if (top + h > window.innerHeight - 12) top = Math.max(12, b.top - h - 8);
  p.style.left = left + "px"; p.style.top = top + "px";
}
ACT.lineInfo = (el, e) => { if (popFor === el) closePop(); else openPop(el); };
document.addEventListener("mouseover", (e) => { if (!window.matchMedia("(hover: hover)").matches) return; const b = e.target.closest && e.target.closest("[data-info]"); if (b) openPop(b); });
document.addEventListener("mouseout", (e) => { if (!window.matchMedia("(hover: hover)").matches || !popFor) return; const to = e.relatedTarget; if (to && (to.closest("[data-info]") === popFor || to.closest("#pop"))) return; if (e.target.closest && (e.target.closest("[data-info]") || e.target.closest("#pop"))) closePop(); });
document.addEventListener("click", (e) => { if (popFor && !e.target.closest("[data-info]") && !e.target.closest("#pop")) closePop(); }, true);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePop(); });
document.addEventListener("scroll", () => closePop(), true);
function summaryHtml(C) {
  const veh = vehicleFor(C.crates);
  return `<div class="card-title">Order summary</div>
    <div style="margin-top:12px"><div class="sum-row"><span class="muted">Crates to supply</span><b class="num">${nf(C.crates, 2)}</b></div>${C.req > C.crates ? `<div class="sum-row"><span class="muted">Crates asked for</span><span class="num">${nf(C.req)}</span></div>` : ""}<div class="sum-row"><span class="muted">Boxes</span><span class="num">${nf(C.ea)}</span></div><div class="sum-row"><span class="muted">Value excl. GST</span><span class="num">${rs2(C.net)}</span></div><div class="sum-row"><span class="muted">GST 5%</span><span class="num">${rs2(C.gst)}</span></div><div class="sum-row total"><span>Total</span><span class="num">${rs2(C.net + C.gst)}</span></div>${C.tod ? `<div class="sum-row" style="margin-top:6px"><span class="muted">TOD to claim from Hangyo</span><span class="num">${rs2(C.tod)}</span></div>` : ""}</div>
    ${veh ? `<div class="vehicle">${ic("truck")}<span><b>${esc(veh.split(" (")[0])}</b><div class="row-sub">Suggested vehicle${veh.includes("(") ? " · " + esc(veh.split("(")[1].replace(")", "")) : ""}</div></span></div>` : ""}
    ${C.needPrice ? `<div class="banner bad" style="margin-top:10px">${ic("tag", "sm")}<span><b>${C.needPrice} line${C.needPrice > 1 ? "s need" : " needs"} a price</b> before you can save.</span></div>` : ""}
    <div class="stack gap-8" style="margin-top:16px"><button class="btn btn-primary btn-lg btn-block" data-act="saveOrder" ${!C.d || !C.rows.some((r) => r.qty > 0) || C.needPrice ? "disabled" : ""}>${S.draft.editId ? "Update order" : "Save order"}</button><button class="btn btn-secondary btn-block" data-act="clearDraft">${S.draft.editId ? "Stop editing" : "Clear"}</button></div>
    <div class="row-sub" style="margin-top:10px;text-align:center">Saving takes the stock, logs anything short and creates the sales order.</div>`;
}
VIEWS["new-order"] = () => {
  const dr = S.draft, C = calcDraft(), d = C.d;
  const last = d ? D.orders.filter((o) => o.dist === d.name && o.status !== "Cancelled" && linesByOrder[o.id]).sort((a, b) => (a.time < b.time ? 1 : -1))[0] : null;
  return `<div class="page">
    <div><button class="back" data-act="nav" data-to="orders">${ic("chevL", "sm")} Orders</button><h1 class="title" style="margin-top:6px">${dr.editId ? "Edit order" : "New order"}</h1></div>
    ${dr.editId ? `<div class="editing-bar">${ic("pencil", "sm")}<span>Editing <span class="mono">${esc(dr.editId)}</span>. Saving replaces the old lines and puts the stock right.</span></div>` : ""}
    ${refreshNoteHtml()}
    ${dr.editId ? "" : importNoteHtml() || `<button class="imp-cta" data-act="importOrder"><span class="attn-ic tint">${ic("doc")}</span><span class="grow"><div class="row-title">Got the order as a message or an Excel file?</div><div class="row-sub">Paste it or upload it. The tool finds the products, you check, then save.</div></span><span class="btn btn-sm btn-secondary">Paste or upload order</span></button>`}
    <div class="split">
      <div class="stack gap-20">
        <div><div class="group-label"><span>1 · Who is it for</span></div>
          ${d ? `<div class="card card-pad">${distCard(d)}</div>` : `<div class="stack gap-10"><div class="search">${ic("search", "sm")}<input class="input" id="dist-q" type="search" placeholder="Search distributors" value="${esc(dr.dq)}" data-in="distQ" autocomplete="off"></div><div id="dist-results">${distResults()}</div></div>`}</div>
        ${d ? `<div><div class="group-label"><span>2 · What are they ordering</span>${last && !dr.lines.length ? `<button class="btn-plain" style="height:auto;font-size:13px;font-weight:600" data-act="repeatLast" data-id="${esc(last.id)}">${ic("repeat", "sm")} Repeat order of ${fmtDate(last.time)}</button>` : ""}</div>
          <div class="stack gap-10"><div class="prod-search"><div class="search">${ic("search", "sm")}<input class="input" id="prod-q" type="search" placeholder="Add a product. Try mango, or van cone" value="${esc(dr.q)}" data-in="prodQ" autocomplete="off" enterkeyhint="done"></div><div id="prod-results" class="prod-results">${productResults()}</div></div>${dr.editId ? "" : slowOffer(d.name)}
          <div class="group" id="order-lines">${linesHtml(C)}</div></div></div>` : ""}
      </div>
      <div class="sticky"><div class="card card-pad" id="order-summary">${summaryHtml(C)}</div></div>
    </div></div>`;
};
function refreshOrderCalc() { const C = calcDraft(); C.rows.forEach((r, i) => part("calc-" + i, lineCalcHtml(r, i))); part("order-summary", summaryHtml(C)); }
function refreshOrderLines() { const C = calcDraft(); part("order-lines", linesHtml(C)); part("order-summary", summaryHtml(C)); }
IN.distQ = (el) => { S.draft.dq = el.value; part("dist-results", distResults()); };
IN.prodQ = (el) => { S.draft.q = el.value; S.draft.sel = 0; part("prod-results", productResults()); };
document.addEventListener("keydown", (e) => {
  if (!e.target || e.target.id !== "prod-q") return;
  const items = $$("#prod-results .res"); if (!items.length) return;
  if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); S.draft.sel = Math.max(0, Math.min(items.length - 1, (S.draft.sel || 0) + (e.key === "ArrowDown" ? 1 : -1))); items.forEach((x, i) => x.setAttribute("aria-selected", i === S.draft.sel)); items[S.draft.sel].scrollIntoView({ block: "nearest" }); }
  else if (e.key === "Enter") { e.preventDefault(); const it = items[S.draft.sel || 0]; if (it) ACT.addLine(it); }
});
IN.qty = (el) => { S.draft.lines[+el.dataset.i].qty = el.value === "" ? "" : Math.max(0, +el.value); refreshOrderCalc(); };
IN.unit = (el) => { S.draft.lines[+el.dataset.i].unit = el.value; refreshOrderLines(); };
IN.manualPrice = (el) => { S.draft.lines[+el.dataset.i].manual = +el.value || 0; const C = calcDraft(); part("order-summary", summaryHtml(C)); const r = C.rows[+el.dataset.i], cell = $("#calc-" + el.dataset.i + " .line-val .row-value"); if (cell) cell.textContent = r.value != null ? rs2(r.value) : "–"; };
ACT.pickDist = (el) => { S.draft.dist = el.dataset.name; const d = distByKey[key(el.dataset.name)]; S.draft.lines.forEach((l) => { l.unit = l.unit || d.uom || "Crate"; }); render(); const p = $("#prod-q"); if (p && window.matchMedia("(min-width: 961px)").matches) p.focus(); };
ACT.clearDist = () => { S.draft.dist = null; S.draft.dq = ""; render(); };
ACT.addLine = (el) => {
  const sap = el.dataset.sap, c = catBySap[sap], d = distByKey[key(S.draft.dist)] || {};
  const ex = S.draft.lines.find((l) => l.sap === sap);
  if (ex) ex.qty = (+ex.qty || 0) + 1; else S.draft.lines.push({ sap, name: c.name, qty: 1, unit: d.uom || "Crate", manual: 0 });
  const i = ex ? S.draft.lines.indexOf(ex) : S.draft.lines.length - 1;
  S.draft.q = ""; S.draft.sel = 0; S.draft.flash = i; const inp = $("#prod-q"); if (inp) inp.value = ""; part("prod-results", ""); refreshOrderLines(); S.draft.flash = null;
  const ln = $("#line-" + i); if (ln) ln.scrollIntoView({ block: "nearest", behavior: "smooth" });
  if (ex) toast(`${shortName(c.name)} was already on the order. Now ${ex.qty} ${(UNIT_LABEL[ex.unit] || "crates").toLowerCase().replace(/s$/, ex.qty === 1 ? "" : "s")}`, "plus");
  if (inp) inp.focus({ preventScroll: true }); /* the cursor stays in the search for the next product */
};
ACT.step = (el) => { const l = S.draft.lines[+el.dataset.i]; l.qty = Math.max(0, (+l.qty || 0) + +el.dataset.d); const q = $("#qty-" + el.dataset.i); if (q) q.value = l.qty; refreshOrderCalc(); };
ACT.rmLine = (el) => { S.draft.lines.splice(+el.dataset.i, 1); refreshOrderLines(); };
ACT.clearDraft = () => { const was = S.draft.editId; S.draft = newDraft(); if (was) go("orders"); else render(); };
/* everything the distributor asked for on an order: the supplied lines plus the products that were out of
   stock or not stocked (those live only in the missed-sales log, so they have to be put back) */
function requestedLines(o) {
  const d = distByKey[key(o.dist)] || {}, out = [], seen = new Set();
  (linesByOrder[o.id] || []).forEach((l) => { out.push({ sap: l.sap, name: l.product, qty: l.qty, unit: l.unit || d.uom || "Crate", manual: /manual/i.test(l.src || "") ? l.billed : 0, useQC: l.qc > 0, ...(l.part ? { part: true } : {}) }); seen.add(l.sap); });
  D.oos.filter((x) => x.id === o.id && x.sap && !seen.has(x.sap)).forEach((x) => {
    const m = /requested\s+([\d.]+)\s+(Crate|EA \(Box\)|Pieces)/i.exec(x.reason || "");
    const qty = x.askQty != null ? x.askQty : m ? +m[1] : typeof x.req === "number" ? x.req : 1, unit = x.askUnit || (m ? m[2] : "Crate");
    out.push({ sap: x.sap, name: x.product, qty, unit, manual: 0 }); seen.add(x.sap);
  });
  return out;
}
ACT.repeatLast = (el) => { const o = orderById(el.dataset.id); S.draft.lines = o ? requestedLines(o) : []; refreshOrderLines(); toast("Last order copied in, including anything that was out of stock. Change anything you like"); };
ACT.editOrder = (el) => {
  const o = orderById(el.dataset.id), lines = linesByOrder[o.id] || [];
  S.draft = { dist: o.dist, editId: o.id, orig: lines.map((l) => ({ ...l })), q: "", dq: "", lines: requestedLines(o) };
  closeSheet(); go("new-order");
};
ACT.saveOrder = () => {
  const dr = S.draft, C = calcDraft(), now = NOW();
  if (!C.d || C.needPrice || !C.rows.some((r) => r.qty > 0)) return;
  let o;
  if (dr.editId) { o = orderById(dr.editId); restoreStock(o.id); D.oos = D.oos.filter((x) => x.id !== o.id); D.tod.lines = D.tod.lines.filter((x) => x.id !== o.id); o.edited = iso(now); o.timesEdited = (o.timesEdited || 0) + 1; }
  else { o = { id: "ORD-" + stamp(now), time: iso(now), dist: C.d.name, status: "Pending", dispatched: null, edited: null, timesEdited: 0, notes: null }; D.orders.push(o); }
  const lines = [];
  C.rows.filter((r) => r.qty > 0).forEach((r) => {
    if (r.supply > 0) {
      if (r.st.virtual) r.st = qcOnlyStockMake(r.ln.sap);
      lines.push({ id: o.id, product: r.c.name, sap: r.ln.sap, unit: r.ln.unit, qty: r.qty, crates: r.supply, ea: r.ea, pcs: r.pcs, src: r.special != null ? "Special price" : r.normal != null ? "SK Master" : "Manual", normal: r.normal, billed: r.billed, value: r.value, tod: r.tod, ...(r.qcTake > 0 ? { qc: r.qcTake } : {}), ...(r.ln.part ? { part: true } : {}) });
      /* crates taken from quick commerce stock leave SahiReach stock below zero until the pick list moves them across at dispatch */
      r.st.ea -= r.ea; r.st.crates = r.st.ea / r.upc; r.st.pcs = r.st.ea * r.ppe; r.st.move = `${o.id} (${C.d.name}): -${nf(r.supply, 2)} crates${r.qcTake > 0 ? ` (${nf(r.qcTake, 2)} from quick commerce stock)` : ""}`;
      if (r.tod > 0) D.tod.lines.push({ time: iso(now), id: o.id, month: "", dist: C.d.name, product: r.c.name, sap: r.ln.sap, crates: r.supply, ea: r.ea, normal: r.normal, special: r.special, perEA: r.todEA, amount: r.tod, status: "Expected", received: null });
    }
    if (r.status !== "ok") D.oos.push({ time: iso(now), id: o.id, dist: C.d.name, product: r.c.name, sap: r.ln.sap, askQty: r.qty, askUnit: r.ln.unit, req: r.req == null ? "N/A" : r.req, avail: r.stocked ? r.avail : "N/A", missed: r.stocked ? r.req - r.supply : "N/A", value: r.stocked && r.billed != null ? (r.req - r.supply) * r.upc * r.billed : "N/A", reason: r.status === "notstocked" ? `Not in current range - requested ${r.qty} ${r.ln.unit}` : r.status === "out" ? "Fully out of stock" : `Partial - ${nf(r.req - r.supply, 2)} of ${r.req} crates short` });
  });
  linesByOrder[o.id] = lines;
  Object.assign(o, { lines: lines.length, crates: C.crates, value: C.net, valueGst: C.net + C.gst, tod: C.tod });
  logActivity(dr.editId ? "Order edited" : "Order saved", o.id, `${C.d.name}: ${lines.length} lines, ${nf(C.crates, 2)} crates, ${rs(C.net)}${C.qcTake > 0 ? ` · ${nf(C.qcTake, 2)} crates from quick commerce stock` : ""}`);
  const wasEdit = !!dr.editId; S.draft = newDraft(); S.ordersTab = "Pending"; S.picked[o.id] = true;
  go("orders");
  openSheet(wasEdit ? "Order updated" : "Order saved", `<div class="success"><div class="tick">${ic("check")}</div><div class="section-title">${wasEdit ? "Order updated" : "Order saved"}</div><div class="muted">${esc(o.dist)} · ${nf(o.crates, 2)} crates · ${rs2(o.valueGst)} incl. GST</div><div class="mono dim">${esc(o.id)}</div>${C.short ? `<div class="banner warn" style="margin-top:10px;text-align:left">${ic("alert", "sm")}<span>${C.short} line${C.short > 1 ? "s were" : " was"} short or not stocked. Logged under missed sales.</span></div>` : ""}</div>
    <div class="group"><button class="row" data-act="emailSO" data-id="${esc(o.id)}"><span class="attn-ic tint">${ic("arrowR")}</span><span class="grow"><div class="row-title">Email the sales order</div><div class="row-sub">${(distByKey[key(o.dist)] || {}).email ? "To " + esc((distByKey[key(o.dist)] || {}).email) : "No email saved for this distributor yet"}</div></span>${ic("chevR", "sm chev")}</button><button class="row" data-act="soPreview" data-id="${esc(o.id)}"><span class="attn-ic tint">${ic("doc")}</span><span class="grow"><div class="row-title">View the sales order</div><div class="row-sub">With your logo and company details</div></span>${ic("chevR", "sm chev")}</button><button class="row" data-act="nav2" data-to="dispatch"><span class="attn-ic info">${ic("truck")}</span><span class="grow"><div class="row-title">Go to dispatch</div><div class="row-sub">Add it to the next pick list</div></span>${ic("chevR", "sm chev")}</button><button class="row" data-act="newOrder"><span class="attn-ic tint">${ic("plus")}</span><span class="grow"><div class="row-title">Take another order</div></span>${ic("chevR", "sm chev")}</button></div>`);
};
ACT.nav2 = (el) => { closeSheet(); go(el.dataset.to); };

/* ===== READ AN ORDER FROM A MESSAGE, AN EXCEL FILE OR A PHOTO =====
   1. Read: the matcher on this device (smart reading with Claude is built but switched off: IMP_SMART).
   2. Check (first confirmation): what was understood, what was not, stock, and in-stock alternatives.
   3. The lines go into the normal New order screen, where Save order is the second confirmation.
   Corrections are remembered, so the same wording matches straight away next time. */

/* ---------- words ---------- */
const IMP_SIZES = new Set([20, 30, 35, 40, 50, 55, 60, 65, 70, 80, 100, 110, 125, 170, 500, 700, 1000, 1500, 2000, 4000]);
const IMP_FIX = { kulfy: "kulfi", tripple: "triple", trippl: "triple", vanila: "vanilla", vannila: "vanilla", vanill: "vanilla", venilla: "vanilla", choclate: "chocolate", chocklate: "chocolate", chocolat: "chocolate", chocolates: "chocolate", choc: "chocolate", strawbery: "strawberry", srawberry: "strawberry", straw: "strawberry", stawberry: "strawberry", strobry: "strawberry", strobery: "strawberry", strowberry: "strawberry", strwberry: "strawberry", stroberry: "strawberry", chocko: "choco", choko: "choco", choclate: "chocolate", butterscoch: "butterscotch", buterscotch: "butterscotch", creame: "cream", creem: "cream", cones: "cone", cups: "cup", bars: "bar", candies: "candy", kulfis: "kulfi", koolfi: "kulfi", kulfee: "kulfi", sticks: "stick", tubs: "tub", balls: "ball", sandwiches: "sandwich", sundae: "sundae", pista: "pista", pistachio: "pista", alphonsa: "alphonso", alphanso: "alphonso", almd: "almond", tofee: "toffee", toffe: "toffee", current: "currant", blackcurrent: "blackcurrant", bscotch: "butterscotch", btrscotch: "butterscotch", ripple: "ripple", fills: "fills", fill: "fills", googli: "googly", gugly: "googly", rasmalai: "rasmalai", dryfruit: "dryfruits", dryfruits: "dryfruits", fruits: "fruit", ltr: "l", ltrs: "l", litre: "l", litres: "l", liter: "l", liters: "l", lit: "l", lt: "l" };
const IMP_JOIN = [[/\bbutter\s+scotch\b/g, "butterscotch"], [/\bsip\s*-?\s*up\b/g, "sipup"], [/\bcho(?:c|ck|k)o\s*-?\s*bar\b/g, "chocobar"], [/\bblack\s+curr[ae]nt\b/g, "blackcurrant"], [/\bdry\s+fruits?\b/g, "dryfruits"], [/\bras\s+malai\b/g, "rasmalai"], [/\bpop\s*-?\s*up\b/g, "popup"], [/\bgud\s*-?\s*bud\b/g, "gudbud"], [/\bfun\s+bites?\b/g, "funbites"], [/\bice\s*cream\b/g, " "]];
const IMP_STOP = new Set(["hangyo", "ho", "x", "ml", "the", "and", "of", "with", "new", "mrp", "np", "fd", "pre", "nos", "no", "pcs", "pc", "order", "primary", "flavour", "flavor", "pack", "packs", "box", "boxes", "crate", "crates", "crt", "ctn", "qty", "piece", "pieces", "ea", "oval", "ovel", "p", "sm", "lit", "a", "in"]);
const IMP_GENERIC = new Set(["cone", "cup", "bar", "stick", "mini", "big", "small", "tub", "candy", "kulfi", "judwa", "bulk", "parlour", "premium", "gourmet", "slice", "ball", "dolly", "sipup", "sandwich", "catering", "paper"]);
const IMP_CAT = { "Sticks": ["bar", "stick"], "Big Cups": ["cup"], "Small Cups": ["cup", "small"], "Big Cones": ["cone", "big"], "Mini Cones": ["cone", "mini"], "Kulfis": ["kulfi"], "Candies": ["candy"], "Judwa": ["judwa"], "Tubs 100 ml": ["cup"], "Tubs 125 ml": ["tub", "cup"], "Tubs 500 ml": ["tub"], "Tubs 1000 ml": ["tub"], "Tubs 1500 ml": ["tub"], "Paper Packs 1000 ml": ["brick"], "Paper Packs 2000 ml": ["brick"], "Bulk Packs 4000 ml": ["bulk"], "Parlour Paper Packs 4000 ml": ["parlour", "bulk"], "Parlour Tubs 4000 ml": ["parlour", "tub"], "Sip Up": ["sipup"], "Dolly": ["dolly", "bar"], "Ball": ["ball"], "Sandwich": ["sandwich"], "Cassatta": ["cassata", "slice"], "Premium Product (Tourist Spot)": ["premium"], "Gourmet Series": ["gourmet"] };
const IMP_CAT_GROUP = (cat) => { const c = String(cat || ""); return /cone/i.test(c) ? "cone" : /cup|tubs 1(00|25) ml/i.test(c) ? "cup" : /tubs|paper packs (1000|2000)/i.test(c) ? "tub" : /4000/.test(c) ? "bulk" : /sticks|dolly|candies|sip up/i.test(c) ? "stick" : c.toLowerCase(); };
function impNorm(s) {
  let t = " " + String(s || "").toLowerCase().replace(/&/g, " and ").replace(/f\.\s*d\.?/g, " fd ").replace(/\bpre\.\s*/g, " premium ").replace(/\bnew\s*mrp\b|\bnp\b\s*-?/g, " ") + " ";
  /* a price: "20 rs", "rs 20", "₹20", "20/-" is the MRP of one piece, never a quantity or a size */
  /* "Chocobar#45" (billing software): #45 is the MRP of one piece */
  t = t.replace(/#\s*(\d{1,3})\b/g, " p$1 ");
  t = t.replace(/(?:\brs\.?|₹|\binr)\s*(\d+)(?:\s*\/-)?/g, " p$1 ").replace(/(\d+)\s*(?:rs\b\.?|rupees?\b|\/-)/g, " p$1 ");
  t = t.replace(/(\d)\s*[x×*]\s*(\d)/g, "$1 x $2").replace(/(\d+)\s*x\s*(?=\d+(?:\.\d+)?\s*(?:ml|l|ltrs?|litres?|liters?|lit)\b)/g, (m, n) => (+n > 1 ? ` c${+n} ` : " "));
  t = t.replace(/\b(\d{1,2})\s*(?:pcs?|pieces|nos)\b/g, (m, n) => (+n > 1 ? ` c${+n} ` : " ")); /* "(16PCS)" = 16 in a box, like "16 x" */
  /* "500 ltr" is a 500 ml tub: a "litre" count of 50 or more is really ml */
  t = t.replace(/(\d+(?:\.\d+)?)\s*(ml|ltrs?|litres?|liters?|lit\.?|lt|l)\b/g, (m, n, u) => ` s${Math.round(+n * (u[0] === "m" || +n >= 50 ? 1 : 1000))} `);
  IMP_JOIN.forEach(([re, v]) => { t = t.replace(re, " " + v + " "); });
  return t.replace(/[^a-z0-9.\s]/g, " ").replace(/\.(?!\d)/g, " ").replace(/\s+/g, " ").trim();
}
function impTokens(s, raw) {
  const out = [];
  impNorm(s).split(" ").forEach((w) => {
    if (!w) return; w = IMP_FIX[w] || w;
    if (/^\d+(\.\d+)?$/.test(w)) { if (raw && IMP_SIZES.has(+w)) out.push("s" + +w); return; }
    if (IMP_STOP.has(w) || w.length < 2 && w !== "l") return;
    if (w === "l") return;
    out.push(w);
  });
  return out;
}
function impLev(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
function impSim(r, p) {
  if (r === p) return 1;
  if (/^[scp]\d/.test(r) || /^[scp]\d/.test(p)) return 0;
  const a = r.length < p.length ? r : p, b = a === r ? p : r;
  if (a.length >= 3 && b.startsWith(a)) return 0.85;
  const L = Math.min(r.length, p.length), d = impLev(r, p);
  if (L >= 4 && d <= 1) return 0.8;
  if (L >= 6 && d <= 2) return 0.7;
  return 0;
}
/* ---------- catalogue index ---------- */
let IMP_IDX = null, IMP_IDX_N = -1;
function impIndex() {
  if (IMP_IDX && IMP_IDX_N === D.catalog.length + D.stock.length) return IMP_IDX;
  const same = {}; (D.repl.rows || []).forEach((r) => { if (r.same) same[r.sap] = r.same; });
  IMP_IDX = D.catalog.filter((c) => c.sap).map((c) => {
    const name = impTokens(c.name, true).filter((t, i, a) => a.indexOf(t) === i), cat = IMP_CAT[c.cat] || [];
    const all = new Set(name.concat(cat)); for (let i = 0; i + 1 < name.length; i++) all.add(name[i] + name[i + 1]);
    const st = stockBySap[c.sap];
    return { sap: c.sap, c, name, cat, all: [...all], sizes: name.filter((t) => /^s\d/.test(t)), counts: name.filter((t) => /^c\d/.test(t)), stocked: !!st, crates: st && st.upc ? st.ea / st.upc : null, hasPrice: price(c.sap) != null, mrpPc: (D.prices[c.sap] || [])[4] != null ? +(D.prices[c.sap] || [])[4] : c.mrp > 0 && c.ppe > 0 ? Math.round((c.mrp / c.ppe) * 100) / 100 : null, premium: /premium/i.test(c.name) || /premium/i.test(c.cat || ""), fd: /f\.?\s*d\b|catering/i.test(c.name), same: same[c.sap] || null };
  });
  IMP_IDX_N = D.catalog.length + D.stock.length; return IMP_IDX;
}
function impBought(dist) {
  const out = {}; if (!dist) return out; const since = ymd(new Date(NOW() - 120 * 864e5));
  D.orders.forEach((o) => { if (o.dist !== dist || o.status === "Cancelled" || o.time.slice(0, 10) < since) return; (linesByOrder[o.id] || []).forEach((l) => { out[l.sap] = (out[l.sap] || 0) + 1; }); });
  return out;
}
const impAliasKey = (s) => impTokens(s, true).join(" ");
/* best products for one line, highest score first */
function impMatch(raw, ctx) {
  const R = impTokens(raw, true); if (!R.length) return [];
  const al = (D.orderAliases || {})[impAliasKey(raw)];
  const rPrices = R.filter((t) => /^p\d/.test(t)).map((t) => +t.slice(1)); R.splice(0, R.length, ...R.filter((t) => !/^p\d/.test(t))); if (!R.length) return [];
  const rSizes = R.filter((t) => /^s\d/.test(t)), wantPrem = R.includes("premium"), wantFd = R.includes("fd") || R.includes("catering");
  /* "max" (Max Cup, Chocobar Max) counts a little when it matches; asked for but missing is not a miss ("Cup max" = the ₹20 cups) */
  const w = (t) => (/^[sc]\d/.test(t) ? 0.4 : t === "max" ? 0.3 : IMP_GENERIC.has(t) ? 0.6 : 1), W = R.reduce((a, t) => a + w(t), 0);
  const res = impIndex().map((P) => {
    let cov = 0, missing = 0; const used = new Set();
    R.forEach((r) => {
      let best = 0, hit = null;
      if (/^s\d/.test(r)) { if (P.sizes.includes(r)) { best = 1; hit = r; } }
      else if (/^c\d/.test(r)) { if (P.counts.includes(r)) { best = 1; hit = r; } }
      else P.all.forEach((p) => { const s = impSim(r, p) * (P.cat.includes(p) && !P.name.includes(p) ? 0.9 : 1); if (s > best) { best = s; hit = p; } });
      if (hit) used.add(hit); cov += w(r) * best;
      if (!/^[sc]\d/.test(r) && !IMP_GENERIC.has(r) && r !== "max" && best < 0.7) missing++;
    });
    let s = cov / W - 0.25 * missing;
    const extra = P.name.filter((t) => !/^[sc]\d/.test(t) && !IMP_GENERIC.has(t) && !used.has(t) && ![...used].some((u) => u.includes(t))).length;
    s -= 0.05 * Math.min(extra, 4);
    if (rSizes.length && P.sizes.length && !rSizes.some((z) => P.sizes.includes(z))) s -= 0.1;
    if (P.premium && !wantPrem) s -= 0.25;
    if (rPrices.length && P.mrpPc != null) s += rPrices.some((x) => Math.abs(x - P.mrpPc) < 0.51) ? 0.2 : -0.15;
    if (!P.stocked && !P.hasPrice) s -= 0.1;
    if (P.fd && !wantFd && /catering/i.test(P.c.name)) s -= 0.08;
    if (P.stocked) s += 0.05; if (P.crates > 0) s += 0.03; if (P.hasPrice) s += 0.02;
    if (ctx && ctx.bought && ctx.bought[P.sap]) s += 0.06 + Math.min(0.04, ctx.bought[P.sap] * 0.01);
    if (al === P.sap) s += 1;
    return { sap: P.sap, score: s, P };
  }).filter((x) => x.score > 0.2).sort((a, b) => b.score - a.score);
  /* an old pack linked to the one ordered now: use the new one */
  const seen = new Set(), out = [];
  res.forEach((x) => { const sap = x.P.same && catBySap[x.P.same] ? x.P.same : x.sap; if (seen.has(sap)) return; seen.add(sap); out.push({ sap, score: x.score, via: sap !== x.sap ? x.sap : null }); });
  return out.slice(0, 8);
}
const impConf = (c) => (!c.length ? "none" : c[0].score >= 1.5 || (c[0].score >= 0.8 && (c.length < 2 || c[0].score - c[1].score >= 0.06)) ? "sure" : c[0].score >= 0.5 ? "check" : "none");
/* ---------- reading lines and quantities ---------- */
const IMP_UNIT = (u) => { u = String(u || "").toLowerCase(); return /^(crates?|crts?|cr|ctns?|cartons?|cases?|cs)$/.test(u) ? "Crate" : /^(box(es)?|bxs?|ea)$/.test(u) ? "EA (Box)" : /^(pcs?|pieces?|nos?|units?)$/.test(u) ? "Pieces" : null; };
const IMP_UNIT_RE = "crates?|crts?|cr|ctns?|cartons?|cases?|cs|box(?:es)?|bxs?|ea|pcs?|pieces?|nos?|units?";
function impQty(s) {
  s = String(s).replace(/\s+/g, " ").trim();
  let m = s.match(new RegExp(`^(.*?)[\\s:=\\-–—@,]*\\(?\\b(\\d+(?:\\.\\d+)?)\\s*(${IMP_UNIT_RE})?\\.?\\)?\\s*$`, "i"));
  if (m && /[a-z]/i.test(m[1]) && !(IMP_SIZES.has(+m[2]) && +m[2] > 60 && !m[3]) && !/(\bx|×|\*)$/i.test(m[1].trim())) return { name: m[1].trim(), qty: +m[2], unit: IMP_UNIT(m[3]) };
  m = s.match(new RegExp(`^(\\d+(?:\\.\\d+)?)\\s*(${IMP_UNIT_RE})?\\s*(?:x|×|\\*|-|of)?\\s+(.*[a-z].*)$`, "i"));
  /* "20 rs cone" (a price) and "1 ltr" (a size) are not quantities */
  if (m && /^(rs\b|rs\.|₹|rupees?\b|\/-)/i.test(m[3].trim()) && !m[2]) return { name: s, qty: null, unit: null };
  if (m && /^(ml|ltrs?|litres?|liters?|lit\.?|lt|l)\b/i.test(m[3].trim()) && !m[2]) return { name: s, qty: null, unit: null };
  if (m && !(IMP_SIZES.has(+m[1]) && +m[1] > 60 && !m[2])) return { name: m[3].trim(), qty: +m[1], unit: IMP_UNIT(m[2]) };
  return { name: s, qty: null, unit: null };
}
/* a message that writes every quantity as "Name : 2" (or "Name - 2"): a line without that is a heading */
/* a heading that describes products (a pack word, a size or a price), unlike a title such as the distributor's name */
const impHeadKind = (h) => !!h && impTokens(h, true).some((t) => IMP_GENERIC.has(t) || t === "max" || /^[scp]\d/.test(t));
const IMP_QTY_END = new RegExp(`[:=\\-–—]\\s*\\(?\\d+(?:\\.\\d+)?\\s*(?:${IMP_UNIT_RE})?\\.?\\)?\\s*$`, "i");
function impFromText(text) {
  const lines = String(text || "").replace(/\r/g, "").split("\n").map((l) => l.replace(/^[\s•*\-–—>]+|^\d+[.)]\s+/g, "").replace(/\s+$/, "")), out = [];
  const numbered = lines.filter((l) => l.trim() && impQty(l).qty != null), marked = numbered.filter((l) => IMP_QTY_END.test(l)).length;
  const markStyle = marked >= 3 && marked >= numbered.length * 0.6;
  const isItem = (l) => (markStyle ? IMP_QTY_END.test(l) : impQty(l).qty != null);
  let head = null, headUsed = false;
  lines.forEach((l, i) => {
    /* a blank line ends a heading only once something has been listed under it ("Big cone", blank, then the flavours) */
    if (!l.trim()) { if (headUsed || !impHeadKind(head)) { head = null; headUsed = false; } return; }
    if (!isItem(l)) {
      /* a heading ("Sipup", "Big cone", "1 ltr", "20 rs cone (mini cone)") applies to the lines under it */
      const nx = lines.slice(i + 1).find((x) => x.trim()); head = nx && isItem(nx) ? l.trim() : null; headUsed = false;
      out.push({ raw: l.trim(), name: impQty(l).qty == null ? impQty(l).name : l.trim(), qty: null, unit: null, head: true }); return;
    }
    const q = impQty(l);
    out.push({ raw: l.trim(), name: q.name, qty: q.qty, unit: q.unit, ctx: head }); if (head) headUsed = true;
  });
  return out;
}
function impFromRows(rows) {
  rows = rows.map((r) => (r || []).map((v) => (v == null ? "" : String(v).trim())));
  let hr = -1, nameCol = -1;
  for (let i = 0; i < Math.min(rows.length, 20) && hr < 0; i++) rows[i].forEach((v, j) => { if (hr < 0 && /^(product( name)?|products|items?( name)?|item description|particulars|description( of goods)?|sku( name)?|product description|flavou?rs?|name of (the )?(item|product))$/i.test(v.replace(/\s+/g, " ").trim())) { hr = i; nameCol = j; } });
  if (hr < 0) return { lines: impFromText(rows.map((r) => r.filter(Boolean).join(" ")).join("\n")), header: false };
  const H = rows[hr].map((h) => h.replace(/\s+/g, " ").trim()), cand = [];
  const unitCol = H.findIndex((h) => /^(unit|units|uom|unit of measure)$/i.test(h)), priceCol = H.findIndex((h) => /price|rate/i.test(h) && !/mrp|amount|value|total|gst/i.test(h));
  H.forEach((h, j) => {
    if (j === nameCol || j === unitCol || !h || /units?\s*\/\s*crates?|per crate|\bupc\b|\bmrp\b|\brate\b|\bprice\b|\bamount\b|\bvalue\b|\btotal\b|\btype\b|categ|^sl\b|^s\.? ?no\b|\bcode\b|\bhsn\b|\bgst\b|\bstock\b/i.test(h)) return;
    const p = /order crate|crate number|crates? ordered/i.test(h) ? 5 : /^(crt|crts|crates?|ctns?|cases?)$/i.test(h) ? 4 : /qty|quantity|order/i.test(h) ? 3 : /box|pcs|pieces|nos|units?$/i.test(h) ? 2 : 0;
    if (p) cand.push({ j, p, unit: /crt|crate|ctn|case/i.test(h) ? "Crate" : /box/i.test(h) ? "EA (Box)" : /pcs|piece|nos|units?$/i.test(h) ? "Pieces" : null });
  });
  cand.sort((a, b) => b.p - a.p);
  const qtyCol = H.findIndex((h) => /^(qty|quantity)\.?$/i.test(h));
  const out = []; let skipped = 0;
  rows.slice(hr + 1).forEach((r) => {
    const nm = r[nameCol] || ""; if (!nm || /^total\b/i.test(nm)) return;
    let got = null;
    for (const c of cand) { const v = r[c.j]; if (v === "" || v == null) continue; const m = String(v).match(new RegExp(`^(\\d+(?:\\.\\d+)?)\\s*(${IMP_UNIT_RE})?\\.?$`, "i")); if (m && +m[1] > 0) { got = { qty: +m[1], unit: IMP_UNIT(m[2]) || c.unit }; break; } }
    /* "12 X 25" (in the quantity or the unit column): 12 boxes of 25 pieces */
    if (!got) { const qx = [qtyCol, unitCol].filter((j) => j >= 0).map((j) => r[j]).join(" ").trim().match(/^(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+)$/i); if (qx && +qx[1] > 0) got = { qty: +qx[1], unit: "EA (Box)", packOf: +qx[2] }; }
    if (!got) { skipped++; return; }
    const ut = got.packOf ? `boxes of ${got.packOf}` : unitCol >= 0 ? r[unitCol] || "" : "", pr = priceCol >= 0 ? +String(r[priceCol] || "").replace(/[^\d.]/g, "") || null : null;
    if (!got.unit && IMP_UNIT(ut)) got.unit = IMP_UNIT(ut);
    out.push({ raw: `${nm} — ${got.qty}${ut ? " " + ut : got.unit ? " " + UNIT_LABEL[got.unit].toLowerCase() : ""}${pr ? " @ ₹" + pr : ""}`, name: nm, qty: got.qty, unit: got.unit, unitText: ut, price: pr });
  });
  return { lines: out, header: true, skipped };
}
/* who sent it: a distributor name in the first lines, the file name or the sheet */
function impFindDist(text) {
  const T = new Set(impTokens(text, false).concat(impNorm(text).split(" ").filter((w) => w.length >= 2)));
  const GEN = /^(agency|agencies|distributors?|distribution|traders?|trading|private|limited|pvt|ltd|llp|foods?|services|enterprises?|general|and|the|kerala|icecubes|co|company)$/;
  let best = null;
  D.distributors.forEach((d) => {
    const toks = impNorm(d.name).split(" ").filter((w) => w.length >= 3 && !GEN.test(w)), sh = impNorm(d.short || "").split(" ").filter((w) => w.length >= 3 && !GEN.test(w));
    const hit = (ws) => ws.length && ws.every((w) => [...T].some((t) => t === w || (w.length >= 5 && impLev(t, w) <= 1)));
    const joined = toks.join(""), flat = impNorm(text).replace(/\s+/g, "");
    const sc = hit(toks) ? toks.length + 1 : joined.length >= 6 && toks.length >= 2 && flat.includes(joined) ? toks.length + 1 : hit(sh) ? sh.length : toks.length >= 2 && toks.filter((w) => T.has(w)).length >= 2 ? 1 : 0;
    if (sc && (!best || sc > best.sc)) best = { d, sc };
  });
  return best ? best.d.name : null;
}
/* ---------- stock and alternatives ---------- */
function impCrates(sap, qty, unit) {
  const st = stockBySap[sap], c = catBySap[sap] || {}, upc = (st && st.upc) || c.upc || 0, ppe = (st && st.ppe) || c.ppe || 1;
  if (!upc || !(qty > 0)) return null;
  return unit === "Crate" ? qty : unit === "EA (Box)" ? qty / upc : qty / (upc * ppe);
}
function impAvail(sap) { const st = stockBySap[sap]; return st && st.upc ? Math.max(0, (st.ea - ownHeldEA(sap)) / st.upc) : null; }
function impAlternatives(sap, need) {
  const c = catBySap[sap] || {}, g = IMP_CAT_GROUP(c.cat), ppe = c.ppe || (stockBySap[sap] || {}).ppe || 1, pp = price(sap) != null ? price(sap) / ppe : null;
  const flav = impTokens(c.name, true).filter((t) => !/^s\d/.test(t) && !IMP_GENERIC.has(t)), sz = impTokens(c.name, true).filter((t) => /^s\d/.test(t));
  return D.stock.filter((s) => s.sap !== sap && s.upc && s.ea / s.upc >= Math.min(1, need || 1) && price(s.sap) != null)
    .map((s) => {
      const sg = IMP_CAT_GROUP(s.cat), sp = price(s.sap) / (s.ppe || 1), ft = impTokens(s.name, true);
      const priceClose = pp ? Math.max(0, 1 - Math.abs(sp - pp) / pp) : 0.3, shared = flav.filter((t) => ft.includes(t)).length, sameSize = sz.some((z) => ft.includes(z));
      const score = (s.cat === c.cat ? 2 : sg === g ? 1.2 : 0) + 1.2 * priceClose + Math.min(1, 0.5 * shared) + (sameSize ? 0.4 : 0) + ((replBySap[s.sap] || {}).perDay > 0 ? 0.2 : 0);
      return { sap: s.sap, score, crates: s.ea / s.upc, pp: sp, sameCat: s.cat === c.cat || sg === g };
    }).filter((x) => x.sameCat && x.score >= 1.6).sort((a, b) => b.score - a.score).slice(0, 3);
}
/* ---------- the reading step ---------- */
function impCatalogText() {
  return D.catalog.filter((c) => c.sap).map((c) => { const st = stockBySap[c.sap], cr = st && st.upc ? Math.floor(st.ea / st.upc) : null, link = (replBySap[c.sap] || {}).same; return `${c.sap} | ${c.name} | ${c.cat || ""} | ${(st && st.upc) || c.upc || "?"} boxes/crate, ${(st && st.ppe) || c.ppe || 1} pcs/box | ${cr == null ? "not stocked" : cr > 0 ? cr + " crates in stock" : "out of stock"}${link ? " | old pack, now ordered as " + link : ""}`; }).join("\n");
}
const IMP_SMART = false; /* Claude reading: switch on later */
async function impSmart(input, distHint) {
  if (!IMP_SMART) return null;
  if (!HOST || !HOST.readOrder || D.company && D.company.smartOff) return null;
  const bought = distHint ? Object.entries(impBought(distHint)).sort((a, b) => b[1] - a[1]).slice(0, 60).map(([s]) => s) : [];
  const aliases = Object.entries(D.orderAliases || {}).slice(-150).map(([k, v]) => `${k} => ${v}`).join("\n");
  const r = await HOST.readOrder({ text: input.text || "", rows: input.rowsText || "", image: input.image || null, filename: input.filename || "", catalog: impCatalogText(), distributors: D.distributors.map((d) => d.name), distributor: distHint || "", bought, aliases });
  return r && Array.isArray(r.lines) ? r : null;
}
function impBuild(parsed, distName, smart) {
  const dist = distName || null, d = dist ? distByKey[key(dist)] || {} : {}, ctx = { bought: impBought(dist) }, lines = [];
  const defUnit = d.uom || "Crate";
  if (smart) {
    smart.lines.forEach((x) => {
      const sap = x.sap && catBySap[x.sap] ? x.sap : null, cands = [sap].concat((x.alternatives || []).filter((s) => catBySap[s])).filter(Boolean);
      const loc = impMatch(x.text, ctx); loc.forEach((m) => { if (!cands.includes(m.sap)) cands.push(m.sap); });
      const al = (D.orderAliases || {})[impAliasKey(x.text)];
      const pick = al && catBySap[al] ? al : sap;
      lines.push({ raw: x.text, sap: pick, cands: [...new Set([pick].concat(cands))].filter(Boolean).slice(0, 6), qty: x.qty > 0 ? x.qty : null, unit: x.unit === "crate" ? "Crate" : x.unit === "box" ? "EA (Box)" : x.unit === "piece" ? "Pieces" : defUnit, conf: !pick ? "none" : al ? "sure" : x.confidence === "high" ? "sure" : x.confidence === "medium" ? "check" : "check", note: x.note || "", leave: false });
    });
  } else {
    parsed.lines.forEach((x) => {
      if (x.head) return;
      let c = impMatch(x.name, ctx), byHead = false;
      /* under a heading ("Big cone", "1 ltr", "20 rs cone"), the heading says which kind of product */
      if (x.ctx) {
        let c2 = impMatch(x.ctx + " " + x.name, ctx);
        /* a heading that names a kind ("Cup max", "Big cone", "Bars") keeps its lines to that kind */
        const hk = impTokens(x.ctx, true), kind = hk.includes("cone") ? "cone" : hk.includes("cup") ? "cup" : hk.includes("bar") || hk.includes("stick") ? "stick" : hk.includes("tub") ? "tub" : null;
        if (kind) { const k2 = c2.filter((m) => IMP_CAT_GROUP((catBySap[m.sap] || {}).cat) === kind); if (k2.length) c2 = k2; }
        if (c2.length && (!c.length || (c2[0].score >= 0.5 && c2[0].score >= c[0].score - 0.3))) { c = c2; byHead = true; }
      }
      const conf = impConf(c);
      let sap = conf === "none" ? null : c[0].sap, cf = conf, note = "";
      /* only a size or a pack word, no flavour ("125 ml"): show the choices instead of guessing */
      if (sap && c.length > 1 && c[1].score >= c[0].score - 0.15 && !impTokens(x.name, true).some((t) => !/^[scp]\d/.test(t) && !IMP_GENERIC.has(t)) && !(x.ctx && impTokens(x.ctx, true).some((t) => !/^[scp]\d/.test(t) && !IMP_GENERIC.has(t)))) { cf = "check"; note = "No flavour given: pick the product"; }
      /* the price on a purchase order confirms the product: pick the close match whose rate fits, flag a big difference */
      if (x.price > 0 && c.length) {
        const fits = (s) => { const r = impRateFor(s, dist), st = stockBySap[s] || catBySap[s] || {}; return r > 0 && (Math.abs(x.price / r - 1) < 0.03 || (st.upc && Math.abs(x.price / (r * st.upc) - 1) < 0.03)); };
        const alt = c.slice(0, 5).find((m) => m.score >= 0.5 && fits(m.sap));
        if (alt && (!sap || !fits(sap))) { sap = alt.sap; cf = "check"; note = `Matched by its price (₹${x.price})`; }
        else if (sap && fits(sap) && cf === "check" && c[0].score >= 0.6) cf = "sure";
        else if (sap && impRateFor(sap, dist) > 0 && !fits(sap)) {
          const r = impRateFor(sap, dist), st = stockBySap[sap] || catBySap[sap] || {}, u = impUnitFromPrice(sap, x.price, dist), per = u === "Crate" && st.upc ? r * st.upc : r, diff = x.price / per - 1;
          if (!u) { cf = "check"; note = `Their price ₹${x.price} vs your rate ${rs2(r)}: check the product`; }
          else note = `Their price ₹${x.price} is ${pct(Math.abs(diff), 0)} ${diff < 0 ? "below" : "above"} your ${d.special && D.special.prices[sap] != null ? "special price" : "rate"} ${rs2(per)}. The order will be billed at your ${d.special && D.special.prices[sap] != null ? "special price" : "rate"}.`;
        }
      }
      const byPrice = sap && x.price ? impUnitFromPrice(sap, x.price, dist) : null;
      let unit = x.unit || defUnit;
      if (byPrice) { if (x.unit && x.unit !== byPrice && x.unitText && !note) note = `Says “${x.unitText}”, but ₹${x.price} is a ${byPrice === "Crate" ? "crate" : "box"} price, so read as ${byPrice === "Crate" ? "crates" : "boxes"}`; unit = byPrice; }
      lines.push({ raw: x.raw, ctx: x.ctx && (byHead || impHeadKind(x.ctx)) ? x.ctx : null, sap, cands: [...new Set([sap].concat(c.slice(0, 6).map((m) => m.sap)))].filter(Boolean), qty: x.qty, unit, conf: cf, note, leave: false, price: x.price || null });
    });
    /* a heading on its own at the end, with nothing under it */
    parsed.lines.forEach((x, i) => { if (x.head && i > 0 && !parsed.lines.slice(i + 1).some((y) => !y.head)) { const c = impMatch(x.name, ctx); if (c.length && c[0].score >= 0.5) lines.push({ raw: x.raw, sap: c[0].sap, cands: c.slice(0, 6).map((m) => m.sap), qty: null, unit: defUnit, conf: "check", note: "No quantity given", leave: false }); } });
  }
  lines.forEach((l) => { if (l.qty == null && l.sap) { l.conf = "check"; l.note = l.note || "No quantity given"; } });
  return { dist, lines, smart: !!smart, skipped: parsed ? parsed.skipped || 0 : 0 };
}
/* ---------- screens ---------- */
ACT.importOrder = () => {
  S.impIn = S.impIn || { text: "", file: null };
  const smartOn = IMP_SMART && !!(HOST && HOST.readOrder) && !S.smartMissing && !(D.company && D.company.smartOff);
  openSheet("Read an order", `<div class="card card-pad"><div class="field"><label class="label" for="imp-text">Paste the message</label><textarea class="input" id="imp-text" rows="10" style="height:auto;min-height:200px;padding:12px;line-height:1.45" placeholder="Aqua blue Exim - Primary order&#10;&#10;Vanilla cup 2&#10;Mini Choco bar 2&#10;Big cone Vanilla 2&#10;Sipup&#10;Vanilla 1">${esc(S.impIn.text)}</textarea></div>
      <div class="drop-divider"><span>or add the order file</span></div>
      ${dropZone({ input: "imp-file", dataIn: "impFile", accept: ".xlsx,.xls,.csv,.txt,.pdf,application/pdf" + (smartOn ? ",image/*" : ""), title: "Purchase order file", sub: smartOn ? "PDF, Excel, CSV, text or a photo of the order" : "PDF purchase order, Excel, CSV or text", file: S.impIn.file, compact: true })}
      <div class="row-sub" style="margin-top:12px">${smartOn ? `${ic("bolt", "sm")} Claude reads the order and finds the closest products. You check everything before anything is saved.` : `The tool finds the closest products from the names, sizes and what each distributor bought before. You check everything before anything is saved.`}</div></div>
      <div id="imp-wait"></div>`,
    `<button class="btn btn-secondary" data-act="closeSheet">Cancel</button><button class="btn btn-primary" data-act="impRead">Read order</button>`);
  setTimeout(() => { const t = $("#imp-text"); if (t && !S.impIn.text) t.focus(); }, 60);
};
IN.impFile = (el) => { const f = el.files && el.files[0]; S.impIn.file = f || null; };
async function impFileInput(f) {
  const name = f.name || "";
  if (/^image\//.test(f.type)) {
    const img = await new Promise((ok, bad) => { const u = URL.createObjectURL(f), i = new Image(); i.onload = () => { URL.revokeObjectURL(u); ok(i); }; i.onerror = () => bad(new Error("That photo could not be opened.")); i.src = u; });
    const k = Math.min(1, 1800 / Math.max(img.width, img.height)), cv = document.createElement("canvas"); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
    cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
    return { image: { media_type: "image/jpeg", data: cv.toDataURL("image/jpeg", 0.85).split(",")[1] }, filename: name };
  }
  if (/\.pdf$/i.test(name) || f.type === "application/pdf") return impPdfInput(f);
  if (/\.(xlsx|xls|csv)$/i.test(name)) {
    await loadScriptOnce(XLSX_SRC, () => !!window.XLSX);
    const rows = [];
    xlsxSheets(await f.arrayBuffer(), 3).forEach((sh) => sh.forEach((r) => rows.push(r)));
    const keep = rows.filter((r) => r.some((v) => v != null && String(v).trim() !== ""));
    return { rows: keep, rowsText: keep.map((r) => r.map((v) => (v == null ? "" : String(v).trim())).join("\t")).join("\n").slice(0, 60000), filename: name };
  }
  return { text: await f.text(), filename: name };
}
ACT.impRead = async (el) => {
  const text = ($("#imp-text") || {}).value || "", f = S.impIn.file; S.impIn.text = text;
  if (!text.trim() && !f) { toast("Paste the order or choose a file first", "info"); return; }
  if (el) el.disabled = true; part("imp-wait", `<div class="banner info" style="margin-top:12px">${ic("cycle", "sm")}<span>Reading the order…</span></div>`);
  try {
    const input = f ? await impFileInput(f) : { text };
    if (input.qcPages) { await qcLoadPdf(input.qcPages, input.filename); toast("That is a quick commerce PO, so it was opened in Quick commerce", "bolt"); return; }
    if (f && text.trim()) input.text = text + "\n" + (input.text || "");
    const parsed = input.rows ? impFromRows(input.rows) : input.text ? { lines: impFromText(input.text) } : { lines: [] };
    const hintSrc = [input.head || "", input.filename || "", (input.text || "").split("\n").slice(0, 3).join(" "), input.rows ? input.rows.slice(0, 6).map((r) => r.join(" ")).join(" ") : ""].join(" ");
    let dist = S.draft.dist && !S.draft.editId ? S.draft.dist : impFindDist(hintSrc), smart = null, why = "";
    try { smart = await impSmart(input, dist); } catch (e) { if (e && e.code === "not_configured") S.smartMissing = true; else why = e && e.message ? e.message : "error"; }
    if (input.image && !smart) throw new Error(why || "Photos need smart reading with Claude. Paste the text or upload the Excel instead.");
    if (smart && smart.distributor && !dist) { const m = D.distributors.find((d) => key(d.name) === key(smart.distributor)); if (m) dist = m.name; }
    S.imp = impBuild(parsed, dist, smart); S.imp.src = input.image ? "photo" : input.pdf ? "pdf" : input.rows ? "excel" : "message"; S.imp.file = input.filename || "";
    if (why) toast("Claude could not read it this time, so it was read on this device", "info");
    if (!S.imp.lines.length) throw new Error("No products with quantities were found. Check the message or file.");
    impReview();
  } catch (e) {
    part("imp-wait", `<div class="banner bad" style="margin-top:12px">${ic("alert", "sm")}<span>${esc(e.message || "The order could not be read.")}</span></div>`);
  } finally { if (el) el.disabled = false; }
};
const impStatus = (l) => {
  if (!l.sap) return { k: "none" };
  const st = stockBySap[l.sap], need = impCrates(l.sap, l.qty, l.unit), av = impAvail(l.sap);
  if (!st) return { k: "notstocked", need };
  if (av <= 0) return { k: "out", need, av: 0 };
  if (need != null && av + 1e-9 < need) return { k: "short", need, av };
  return { k: "ok", need, av };
};
function impLineHtml(l, i) {
  const st = impStatus(l), c = l.sap ? catBySap[l.sap] || {} : null;
  const opts = [...new Set((l.sap ? [l.sap] : []).concat(l.cands))].filter((s) => catBySap[s]).map((s) => { const a = impAvail(s); return `<option value="${esc(s)}" ${s === l.sap ? "selected" : ""}>${esc(catBySap[s].name)}${a == null ? " · not stocked" : a <= 0 ? " · out of stock" : ` · ${nf(Math.floor(a))} cr`}</option>`; }).join("");
  const badge = l.leave ? `<span class="pill plain">Left out</span>` : !l.sap ? `<span class="pill bad">Not understood</span>` : l.conf === "sure" ? `<span class="pill good">Matched</span>` : `<span class="pill warn">Please check</span>`;
  let stock = "";
  if (l.sap && !l.leave) {
    const alts = st.k === "out" || st.k === "notstocked" || st.k === "short" ? impAlternatives(l.sap, st.k === "short" ? st.need - st.av : st.need) : [];
    const altBtn = (a) => `<button class="chip" data-act="impAlt" data-i="${i}" data-sap="${esc(a.sap)}" data-mode="${st.k === "short" ? "add" : "swap"}" title="${esc(catBySap[a.sap].name)}">${st.k === "short" ? "+ " : ""}${esc(shortName(catBySap[a.sap].name))} <span style="opacity:.6">${nf(Math.floor(a.crates))} cr · ${rs2(a.pp)}/pc</span></button>`;
    stock = st.k === "ok" ? `<div class="row-sub">${nf(Math.floor(st.av))} crates in stock${st.need != null ? ` · this line is ${nf(st.need, 2)} crate${st.need === 1 ? "" : "s"}` : ""}</div>`
      : `<div class="line-msg ${st.k === "short" ? "warn" : "bad"}">${ic("alert", "sm")} ${st.k === "notstocked" ? "Not in your range" : st.k === "out" ? "Out of stock" : `Only ${nf(st.av, 1)} of ${nf(st.need, 1)} crates in stock`}${alts.length ? (st.k === "short" ? ". Add for the rest:" : ". Offer instead:") : ". No close product in stock."}</div>${alts.length ? `<div class="chips" style="margin:4px 0 0">${alts.map(altBtn).join("")}</div>` : ""}`;
    if (l.extra) stock += `<div class="row-sub" style="color:var(--good);font-weight:600">+ ${nf(l.extra.qty)} ${UNIT_LABEL[l.unit].toLowerCase()} of ${esc(shortName(catBySap[l.extra.sap].name))} for the rest <button class="btn-plain" style="height:auto;font-size:12.5px" data-act="impAltUndo" data-i="${i}">undo</button></div>`;
    if (l.swappedFrom) stock += `<div class="row-sub" style="color:var(--good);font-weight:600">Instead of ${esc(shortName(catBySap[l.swappedFrom].name))} <button class="btn-plain" style="height:auto;font-size:12.5px" data-act="impAltUndo" data-i="${i}">undo</button></div>`;
  }
  return `<div class="imp-line ${l.leave ? "left" : ""}" id="impl-${i}"><div class="imp-raw"><span class="mono">“${esc(l.raw)}”</span>${badge}${l.note ? `<span class="row-sub">${esc(l.note)}</span>` : ""}</div>
    <div class="imp-main">${l.leave ? `<span class="row-sub grow">Not added to the order</span><button class="btn btn-sm btn-secondary" data-act="impLeave" data-i="${i}">Add back</button>` : `
      <div class="imp-prod"><select class="select sm" data-in="impPick" data-i="${i}" aria-label="Product">${l.sap ? "" : `<option value="">Choose the product…</option>`}${opts}<option value="__search">Search all products…</option></select>${S.impSearch === i ? `<div class="search" style="margin-top:6px">${ic("search", "sm")}<input class="input" id="imp-q" type="search" placeholder="Search products" data-in="impQ" data-i="${i}" autocomplete="off"></div><div id="imp-res"></div>` : ""}${stock}</div>
      <div class="imp-qty"><input class="input sm num-in" type="number" min="0" step="any" value="${l.qty != null ? l.qty : ""}" placeholder="Qty" data-in="impQty" data-i="${i}" aria-label="Quantity"><select class="select sm" data-in="impUnit" data-i="${i}" aria-label="Unit">${Object.keys(UNIT_LABEL).map((u) => `<option value="${u}" ${u === l.unit ? "selected" : ""}>${UNIT_LABEL[u]}</option>`).join("")}</select></div>
      <button class="icon-btn" data-act="impLeave" data-i="${i}" aria-label="Leave out" title="Leave out">${ic("trash", "sm")}</button>`}</div></div>`;
}
function impBody() {
  const I = S.imp, L = I.lines, none = L.filter((l) => !l.sap && !l.leave), check = L.filter((l) => l.sap && !l.leave && (l.conf !== "sure" || l.qty == null)), sure = L.filter((l) => l.sap && !l.leave && l.conf === "sure" && l.qty != null);
  const oos = L.filter((l) => l.sap && !l.leave && ["out", "notstocked", "short"].includes(impStatus(l).k)).length, ready = L.filter((l) => l.sap && !l.leave && l.qty > 0).length;
  const order = L.map((l, i) => i).sort((a, b) => { const r = (l) => (!l.sap && !l.leave ? 0 : l.leave ? 3 : l.conf !== "sure" || l.qty == null ? 1 : 2); return r(L[a]) - r(L[b]) || a - b; });
  return `<div class="card card-pad"><div class="hstack between wrap gap-12"><div class="field" style="min-width:260px;flex:1"><label class="label" for="imp-dist">Distributor</label><select class="select" id="imp-dist" data-in="impDist">${I.dist ? "" : `<option value="">Choose the distributor…</option>`}${D.distributors.map((d) => `<option ${d.name === I.dist ? "selected" : ""}>${esc(d.name)}</option>`).join("")}</select></div>
      <div class="hstack gap-8 wrap">${none.length ? `<span class="pill bad">${none.length} not understood</span>` : ""}${check.length ? `<span class="pill warn">${check.length} to check</span>` : ""}<span class="pill good">${sure.length} matched</span>${oos ? `<span class="pill plain">${oos} short or out of stock</span>` : ""}</div></div>
    <div class="row-sub" style="margin-top:10px">${I.smart ? `${ic("bolt", "sm")} Read by Claude` : "Read"} from ${I.src === "excel" ? "the Excel file" : I.src === "pdf" ? "the PDF" : I.src === "photo" ? "the photo" : "the message"}${I.file ? ` (${esc(I.file)})` : ""}. ${I.skipped ? `${I.skipped} rows with no quantity were skipped. ` : ""}Nothing is saved until you press Save order on the next screen.</div></div>
    ${none.length ? `<div class="banner bad">${ic("alert", "sm")}<span><b>${none.length} line${none.length > 1 ? "s" : ""} could not be understood:</b> ${none.map((l) => "“" + esc(l.raw) + "”").join(", ")}. Choose the product or leave ${none.length > 1 ? "them" : "it"} out.</span></div>` : ""}
    <div class="group imp-list">${order.map((i) => impLineHtml(L[i], i)).join("")}</div>
    <div class="row-sub">Your corrections are remembered, so the same wording is matched straight away next time.</div>
    <div id="imp-foot-msg"></div>
    <span hidden id="imp-ready">${ready}</span>`;
}
function impReview() {
  openSheet("Check the order", `<div id="imp-body" class="stack gap-16">${impBody()}</div>`, `<button class="btn btn-secondary" data-act="importOrder">Back</button><button class="btn btn-primary" data-act="impApply" id="imp-go">Put into the order</button>`, true);
}
const impRedraw = () => { const sc = $("#sheet .sheet-body") || $("#sheet"); const y = sc ? sc.scrollTop : 0; part("imp-body", impBody()); if (sc) sc.scrollTop = y; };
IN.impDist = (el) => { S.imp.dist = el.value || null; const ctx = { bought: impBought(S.imp.dist) }, d = distByKey[key(S.imp.dist)] || {}; S.imp.lines.forEach((l) => { if (!l.touchedUnit && !/pcs|piece|box|crate|crt/i.test(l.raw)) l.unit = d.uom || l.unit; }); impRedraw(); };
IN.impPick = (el) => {
  const l = S.imp.lines[+el.dataset.i];
  if (el.value === "__search") { S.impSearch = +el.dataset.i; impRedraw(); setTimeout(() => { const q = $("#imp-q"); if (q) q.focus(); }, 30); return; }
  l.sap = el.value || null; l.conf = l.sap ? "sure" : "none"; l.picked = true; l.extra = null; l.swappedFrom = null; impRedraw();
};
IN.impQ = (el) => { const q = el.value; part("imp-res", q.length < 2 ? "" : `<div class="results" style="position:static;margin-top:6px">${searchProducts(q, 8).map((x) => `<button class="res" data-act="impSet" data-i="${esc(el.dataset.i)}" data-sap="${esc(x.c.sap)}"><span class="stock-badge ${x.crates == null ? "none" : x.crates <= 0 ? "zero" : ""}">${x.crates == null ? "–" : nf(Math.floor(x.crates))}</span><span class="grow"><div class="row-title">${esc(x.c.name)}</div><div class="row-sub">${esc(x.c.cat || "")}</div></span></button>`).join("") || `<div class="empty" style="padding:16px">Nothing matches.</div>`}</div>`); };
ACT.impSet = (el) => { const l = S.imp.lines[+el.dataset.i]; l.sap = el.dataset.sap; if (!l.cands.includes(l.sap)) l.cands.unshift(l.sap); l.conf = "sure"; l.picked = true; S.impSearch = null; l.extra = null; l.swappedFrom = null; impRedraw(); };
IN.impQty = (el) => { const l = S.imp.lines[+el.dataset.i]; l.qty = el.value === "" ? null : Math.max(0, +el.value); if (l.qty != null && l.note === "No quantity given") l.note = ""; clearTimeout(IN._impT); IN._impT = setTimeout(() => { const a = document.activeElement, id = a && a.dataset && a.dataset.i; impRedraw(); if (id != null) { const b = document.querySelector(`[data-in="impQty"][data-i="${id}"]`); if (b) { b.focus(); const v = b.value; b.value = ""; b.value = v; } } }, 700); };
IN.impUnit = (el) => { const l = S.imp.lines[+el.dataset.i]; l.unit = el.value; l.touchedUnit = true; impRedraw(); };
ACT.impLeave = (el) => { const l = S.imp.lines[+el.dataset.i]; l.leave = !l.leave; impRedraw(); };
ACT.impAlt = (el) => {
  const l = S.imp.lines[+el.dataset.i], sap = el.dataset.sap;
  if (el.dataset.mode === "add") { const st = impStatus(l), c = catBySap[l.sap] || {}, st2 = stockBySap[l.sap] || {}, upc = st2.upc || c.upc || 1, ppe = st2.ppe || c.ppe || 1, rest = Math.max(0, st.need - Math.floor(st.av)), q = l.unit === "Crate" ? Math.ceil(rest) : l.unit === "EA (Box)" ? Math.ceil(rest * upc) : Math.ceil(rest * upc * ppe); l.extra = { sap, qty: q }; l.qtyWas = l.qty; l.qty = l.unit === "Crate" ? Math.floor(st.av) : l.unit === "EA (Box)" ? Math.floor(st.av * upc) : Math.floor(st.av * upc * ppe); }
  else { l.swappedFrom = l.sap; l.sap = sap; if (!l.cands.includes(sap)) l.cands.push(sap); l.conf = "sure"; }
  impRedraw();
};
ACT.impAltUndo = (el) => { const l = S.imp.lines[+el.dataset.i]; if (l.extra) { l.extra = null; if (l.qtyWas != null) l.qty = l.qtyWas; } if (l.swappedFrom) { l.sap = l.swappedFrom; l.swappedFrom = null; } impRedraw(); };
ACT.impApply = () => {
  const I = S.imp, use = I.lines.filter((l) => l.sap && !l.leave && l.qty > 0);
  if (!I.dist) { part("imp-foot-msg", `<div class="banner warn">${ic("alert", "sm")}<span>Choose the distributor at the top first.</span></div>`); const s = $("#imp-dist"); if (s) s.focus(); return; }
  if (!use.length) { part("imp-foot-msg", `<div class="banner warn">${ic("alert", "sm")}<span>No line has both a product and a quantity yet.</span></div>`); return; }
  const unsure = I.lines.filter((l) => !l.leave && !l.sap);
  if (unsure.length && !I.confirmLeave) { I.confirmLeave = true; part("imp-foot-msg", `<div class="banner warn">${ic("alert", "sm")}<span>${unsure.length} line${unsure.length > 1 ? "s are" : " is"} still not understood and will be left out: ${unsure.map((l) => "“" + esc(l.raw) + "”").join(", ")}. Press <b>Put into the order</b> again to go ahead.</span></div>`); return; }
  /* remember the wording the person confirmed or corrected */
  D.orderAliases = D.orderAliases || {};
  /* under a heading, the wording is remembered with its heading ("1 ltr" + "Butterscotch"), so plain "Butterscotch" elsewhere is not changed */
  I.lines.forEach((l) => { if (l.sap && !l.leave && (l.picked || l.conf !== "sure" || I.smart)) { const w = l.raw.replace(/\s—\s[\d.]+.*$/, ""), k = impAliasKey(l.ctx ? l.ctx + " " + impQty(w).name : impQty(w).name || w); if (k) D.orderAliases[k] = l.swappedFrom || l.sap; } });
  const ks = Object.keys(D.orderAliases); if (ks.length > 600) ks.slice(0, ks.length - 600).forEach((k) => delete D.orderAliases[k]);
  const keep = S.draft.dist === I.dist && !S.draft.editId ? S.draft.lines : [];
  if (S.draft.editId || S.draft.dist !== I.dist) S.draft = newDraft();
  S.draft.dist = I.dist; S.draft.lines = keep;
  const add = (sap, qty, unit) => { const ex = S.draft.lines.find((x) => x.sap === sap && x.unit === unit); if (ex) ex.qty = (+ex.qty || 0) + qty; else S.draft.lines.push({ sap, name: catBySap[sap].name, qty, unit, manual: 0 }); };
  use.forEach((l) => { add(l.sap, l.qty, l.unit); if (l.extra && l.extra.qty > 0) add(l.extra.sap, l.extra.qty, l.unit); });
  const left = I.lines.filter((l) => l.leave || !l.sap || !(l.qty > 0));
  S.draft.importNote = { src: I.src, smart: I.smart, n: use.length, left: left.map((l) => l.raw), swapped: I.lines.filter((l) => l.swappedFrom && !l.leave).map((l) => `${shortName(catBySap[l.swappedFrom].name)} → ${shortName(catBySap[l.sap].name)}`) };
  logActivity("Order read", I.dist, `${use.length} lines from ${I.src}${I.smart ? " (Claude)" : ""}${left.length ? `, ${left.length} left out` : ""}`);
  S.imp = null; S.impIn = null; S.impSearch = null; closeSheet(); go("new-order");
  toast(`${use.length} product${use.length > 1 ? "s" : ""} added. Check the order and press Save order`, "check");
};
function importNoteHtml() {
  const n = S.draft.importNote; if (!n) return "";
  return `<div class="banner info" style="align-items:flex-start">${ic("doc", "sm")}<span class="grow"><b>Read from ${n.src === "excel" ? "an Excel file" : n.src === "pdf" ? "a PDF" : n.src === "photo" ? "a photo" : "a message"}${n.smart ? " by Claude" : ""}: ${n.n} product${n.n > 1 ? "s" : ""}.</b>${n.swapped.length ? ` Swapped: ${esc(n.swapped.join(", "))}.` : ""}${n.left.length ? ` <b>Left out (${n.left.length}):</b> ${esc(n.left.join(", "))}.` : ""} Check the lines and press <b>Save order</b>.</span><button class="icon-btn" data-act="impNoteClose" aria-label="Hide">${ic("x", "sm")}</button></div>`;
}
ACT.importOrderGo = () => { if (S.draft.editId) S.draft = newDraft(); go("new-order"); ACT.importOrder(); };
ACT.impNoteClose = () => { S.draft.importNote = null; render(); };

/* ===== SALES ORDER: laid out like the Vyapar sale order, plus crates and pieces; no bank details or QR ===== */
function inWords(n) {
  n = Math.round(n);
  if (!n) return "Zero Rupees only";
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (x) => (x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? " " + a[x % 10] : ""));
  const three = (x) => (x >= 100 ? a[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " + two(x % 100) : "") : two(x));
  const parts = [], cr = Math.floor(n / 1e7), lk = Math.floor((n % 1e7) / 1e5), th = Math.floor((n % 1e5) / 1e3), rest = n % 1e3;
  if (cr) parts.push(three(cr) + " Crore"); if (lk) parts.push(two(lk) + " Lakh"); if (th) parts.push(two(th) + " Thousand"); if (rest) parts.push(three(rest));
  return parts.join(" ") + " Rupees only";
}
const soNo = (o) => o.id.replace("ORD", "SO");
const dmyDash = (s) => { const d = toDate(s); return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`; };
function soData(o) {
  const d = distByKey[key(o.dist)] || {}, C = Object.assign({ state: "32-Kerala" }, D.company || {}, CO.phone ? { phone: CO.phone } : {}, CO.email ? { email: CO.email } : {});
  const myState = String(C.state || "32").slice(0, 2), theirState = String(d.state || C.state || "32").slice(0, 2), igst = theirState !== myState;
  const merged = []; (linesByOrder[o.id] || []).filter((l) => l.ea > 0).forEach((l) => { const m = merged.find((x) => x.sap === l.sap && Math.abs((x.billed || 0) - (l.billed || 0)) < 0.005); if (m) { m.ea += l.ea; m.crates = (m.crates || 0) + (l.crates || 0); m.pcs = (m.pcs || 0) + (l.pcs || 0); m.value = (m.value || 0) + (l.value || 0); } else merged.push(Object.assign({}, l)); });
  const rows = merged.map((l) => {
    const st = stockBySap[l.sap] || {}, c = catBySap[l.sap] || {}, p = D.prices[l.sap] || [], taxable = Math.round((l.value != null ? l.value : l.ea * (l.billed || 0)) * 100) / 100, gst = Math.round(taxable * 5) / 100;
    return { name: l.product, hsn: st.hsn || "21050000", mrp: p[3] != null ? p[3] : st.mrp != null ? st.mrp : c.mrp, crates: l.crates || 0, qty: l.ea, pcs: l.pcs != null ? l.pcs : l.ea * (st.ppe || c.ppe || 1), rate: l.billed || 0, taxable, gst, amount: Math.round((taxable + gst) * 100) / 100 };
  });
  const sum = (f) => rows.reduce((a, r) => a + f(r), 0), sub = Math.round(sum((r) => r.amount) * 100) / 100, total = Math.round(sub), hsn = {};
  rows.forEach((r) => { const h = (hsn[r.hsn] = hsn[r.hsn] || { hsn: r.hsn, taxable: 0, gst: 0 }); h.taxable += r.taxable; h.gst += r.gst; });
  const due = d.credit != null ? addDays(o.time.slice(0, 10), d.credit) : null;
  return { o, d, C, igst, rows, sub, total, round: Math.round((total - sub) * 100) / 100, hsn: Object.values(hsn), crates: sum((r) => r.crates), qty: sum((r) => r.qty), pcs: sum((r) => r.pcs), gst: sum((r) => r.gst), due };
}
function soDocHtml(o) {
  const X = soData(o), { d, C } = X, m = (v) => "₹ " + inr2.format(v || 0).replace(/^₹\s?/, ""), e = esc;
  const addr = (s) => e(s || "").replace(/\n/g, "<br>");
  const blank = Math.max(0, 14 - X.rows.length);
  return `<!doctype html><html><head><meta charset="utf-8"><title>${e(soNo(o))} · ${e(o.dist)}</title><style>
  @page { size: A4; margin: 10mm; }
  * { box-sizing: border-box; } html, body { margin: 0; background: #fff; }
  body { font: 400 10.5px/1.4 -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111; padding: 16px; width: 794px; }
  @media print { body { padding: 0; width: auto; } }
  h1 { text-align: center; font-size: 15px; margin: 0 0 8px; font-weight: 700; }
  table { width: 100%; border-collapse: collapse; } td, th { border: 1px solid #555; padding: 3px 5px; vertical-align: top; }
  .nb td { border: 0; padding: 1px 0; } .r { text-align: right; white-space: nowrap; } .c { text-align: center; } b, .b { font-weight: 700; }
  .lab { color: #333; } .items th { font-weight: 700; text-align: left; } .items td { border-top: 0; border-bottom: 0; } .items tr.tot td { border-top: 1px solid #555; border-bottom: 1px solid #555; font-weight: 700; }
  .items tr.fill td { height: 18px; } .co { font-size: 15px; font-weight: 700; margin-bottom: 2px; }
</style></head><body>
<h1>Sale Order</h1>
<table>
  <tr><td style="width:50%" rowspan="2"><table class="nb"><tr><td style="width:96px;vertical-align:top"><img src="${e(LOGO)}" alt="" style="width:86px;height:auto"></td><td><div class="co">${e(String(C.name || "SahiReach LLP").toUpperCase())}</div>${addr(C.address)}${C.phone ? `<br>Phone no.: ${e(C.phone)}` : ""}${C.email ? `<br>Email: ${e(C.email)}` : ""}${C.gstin ? `<br>GSTIN: ${e(C.gstin)}` : ""}<br>State: ${e(C.state || "32-Kerala")}${C.fssai ? `<br>FSSAI: ${e(C.fssai)}` : ""}</td></tr></table></td>
    <td style="width:25%"><span class="lab">Order No.</span><br><b>${e(soNo(o))}</b></td><td style="width:25%"><span class="lab">Date</span><br><b>${dmyDash(o.time)}</b></td></tr>
  <tr><td><span class="lab">Due Date:</span><br><b>${X.due ? dmyDash(X.due) : "–"}</b></td><td><span class="lab">Place of supply</span><br><b>${e(d.state || C.state || "32-Kerala")}</b></td></tr>
  <tr><td><span class="lab">Order From</span><br><b>${e(o.dist)}</b><br>${d.address ? addr(d.address) + "<br>India" : e((d.district ? d.district + ", " : "") + "Kerala")}${d.phone ? `<br>Contact No. : ${e(d.phone)}` : ""}${d.gstin ? `<br>GSTIN : ${e(d.gstin)}` : ""}<br>State: ${e(d.state || C.state || "32-Kerala")}</td>
    <td colspan="2"><span class="lab">Ship To</span><br>${addr(d.shipTo || d.address || (d.district ? d.district + ", Kerala" : ""))}</td></tr>
</table>
<table class="items" style="border-top:0">
  <tr><th style="width:22px">#</th><th>Item name</th><th>HSN/ SAC</th><th class="r">MRP</th><th class="r">Crates</th><th class="r">Quantity</th><th class="r">Pieces</th><th class="r">Unit</th><th class="r">Price/ Unit</th><th class="r">GST</th><th class="r">Amount</th></tr>
  ${X.rows.map((r, i) => `<tr><td>${i + 1}</td><td class="b">${e(r.name)}</td><td>${e(r.hsn)}</td><td class="r">${r.mrp != null ? m(r.mrp) : ""}</td><td class="r">${nf(r.crates, 2)}</td><td class="r">${nf(r.qty)}</td><td class="r">${nf(r.pcs)}</td><td class="r">EA</td><td class="r">${m(r.rate)}</td><td class="r">${m(r.gst)} (5%)</td><td class="r">${m(r.amount)}</td></tr>`).join("")}
  ${Array.from({ length: blank }, () => `<tr class="fill"><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`).join("")}
  <tr class="tot"><td></td><td>Total</td><td></td><td></td><td class="r">${nf(X.crates, 2)}</td><td class="r">${nf(X.qty)}</td><td class="r">${nf(X.pcs)}</td><td></td><td></td><td class="r">${m(X.gst)}</td><td class="r">${m(X.sub)}</td></tr>
</table>
<table style="border-top:0">
  <tr><td style="width:50%;border-top:0"><span class="lab">Order Amount in Words</span><br><b>${e(inWords(X.total))}</b></td>
    <td style="border-top:0;padding:0"><table class="nb" style="width:100%"><tr><td style="padding:3px 5px" class="b">Amounts</td><td></td></tr>
      <tr><td style="padding:2px 5px">Sub Total</td><td class="r" style="padding:2px 5px">${m(X.sub)}</td></tr>
      <tr><td style="padding:2px 5px">Round off</td><td class="r" style="padding:2px 5px">${X.round < 0 ? "- " : ""}${m(Math.abs(X.round))}</td></tr>
      <tr><td style="padding:2px 5px;border-top:1px solid #555" class="b">Total</td><td class="r b" style="padding:2px 5px;border-top:1px solid #555">${m(X.total)}</td></tr>
      <tr><td style="padding:2px 5px">Advance</td><td class="r" style="padding:2px 5px">${m(0)}</td></tr>
      <tr><td style="padding:2px 5px">Balance</td><td class="r" style="padding:2px 5px">${m(X.total)}</td></tr></table></td></tr>
</table>
<table style="border-top:0">
  ${X.igst ? `<tr><th class="c" style="border-top:0">HSN/ SAC</th><th class="c" style="border-top:0">Taxable amount</th><th class="c" style="border-top:0">IGST rate</th><th class="c" style="border-top:0">IGST amount</th><th class="c" style="border-top:0">Total Tax Amount</th></tr>
  ${X.hsn.map((h) => `<tr><td>${e(h.hsn)}</td><td class="r">${m(h.taxable)}</td><td class="r">5%</td><td class="r">${m(h.gst)}</td><td class="r">${m(h.gst)}</td></tr>`).join("")}
  <tr><td class="r b">Total</td><td class="r b">${m(X.hsn.reduce((a, h) => a + h.taxable, 0))}</td><td></td><td class="r b">${m(X.gst)}</td><td class="r b">${m(X.gst)}</td></tr>`
  : `<tr><th class="c" rowspan="2" style="border-top:0">HSN/ SAC</th><th class="c" rowspan="2" style="border-top:0">Taxable amount</th><th class="c" colspan="2" style="border-top:0">CGST</th><th class="c" colspan="2" style="border-top:0">SGST</th><th class="c" rowspan="2" style="border-top:0">Total Tax Amount</th></tr>
  <tr><th class="c">Rate</th><th class="c">Amount</th><th class="c">Rate</th><th class="c">Amount</th></tr>
  ${X.hsn.map((h) => `<tr><td>${e(h.hsn)}</td><td class="r">${m(h.taxable)}</td><td class="r">2.5%</td><td class="r">${m(h.gst / 2)}</td><td class="r">2.5%</td><td class="r">${m(h.gst / 2)}</td><td class="r">${m(h.gst)}</td></tr>`).join("")}
  <tr><td class="r b">Total</td><td class="r b">${m(X.hsn.reduce((a, h) => a + h.taxable, 0))}</td><td></td><td class="r b">${m(X.gst / 2)}</td><td></td><td class="r b">${m(X.gst / 2)}</td><td class="r b">${m(X.gst)}</td></tr>`}
</table>
<table style="border-top:0"><tr><td style="width:50%;border-top:0;height:70px"></td><td style="border-top:0" class="c">For : ${e(String(C.name || "SahiReach LLP").toUpperCase())}<br><br><br><b>This is a computer generated sale order. No signature needed.</b></td></tr></table>
</body></html>`;
}
function fitSO() {
  const f = $("#so-frame"), w = $("#so-wrap"); if (!f || !w || !f.contentDocument || !f.contentDocument.body) return;
  const h = f.contentDocument.body.scrollHeight + 4, s = Math.min(1, w.clientWidth / 794);
  f.style.height = h + "px"; f.style.transform = `scale(${s})`; w.style.height = Math.ceil(h * s) + "px";
}
ACT.soPreview = (el) => {
  const o = orderById(el.dataset.id); if (!o) return;
  const d = distByKey[key(o.dist)] || {}, missing = [!d.address && "billing address", !d.gstin && "GSTIN"].filter(Boolean);
  openSheet("Sales order", `${backBanner(o)}${missing.length ? `<div class="banner warn">${ic("info", "sm")}<span>${esc(o.dist)} has no ${missing.join(" or ")} saved, so ${missing.length > 1 ? "they are" : "it is"} left off. Add ${missing.length > 1 ? "them" : "it"} with <button class="linkish" data-act="distEdit" data-name="${esc(o.dist)}">Edit distributor</button>.</span></div>` : ""}<div id="so-wrap" style="width:100%;overflow:hidden;border-radius:6px;box-shadow:var(--shadow-2);background:#fff"><iframe id="so-frame" title="Sales order" style="width:794px;border:0;transform-origin:0 0;display:block;background:#fff"></iframe></div>`,
    `<button class="btn btn-secondary" data-act="orderSheet" data-id="${esc(o.id)}">${ic("chevL", "sm")} Back to order</button><button class="btn btn-primary" data-act="soPrint">${ic("doc", "sm")} Print / save as PDF</button>`, true);
  const f = $("#so-frame"); f.onload = fitSO; f.srcdoc = soDocHtml(o); setTimeout(fitSO, 350);
};
ACT.soPrint = () => { const f = $("#so-frame"); if (f && f.contentWindow) { f.contentWindow.focus(); f.contentWindow.print(); } };
window.addEventListener("resize", () => { if ($("#so-frame")) fitSO(); });

/* ===== READ A PURCHASE ORDER PDF (typed PDFs from billing software, e.g. Vyapar / myBillBook) =====
   The words and their positions are taken out of the PDF, the table is rebuilt from the header row
   (Item name, Quantity, Unit, Price…), item names that wrap onto two lines are joined, and it stops at "Total". */
const PDFJS_SRC = (HOST && HOST.pdfSrc) || "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = (HOST && HOST.pdfWorker) || "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const PDF_NAME_H = /^(item\s*name|items?|item\s*desc(ription)?|product(\s*name)?|products|description(\s*of\s*goods)?|particulars|product\s*description|name\s*of\s*(the\s*)?(item|product)|sku(\s*name)?)$/i;
async function pdfPages(buf) {
  await loadScriptOnce(PDFJS_SRC, () => !!window.pdfjsLib);
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  const doc = await window.pdfjsLib.getDocument({ data: buf, isEvalSupported: false }).promise, pages = [];
  for (let n = 1; n <= Math.min(doc.numPages, 6); n++) {
    const tc = await (await doc.getPage(n)).getTextContent();
    pages.push(tc.items.map((i) => ({ s: String(i.str || "").replace(/\s+/g, " ").trim(), x: i.transform[4], y: i.transform[5], w: i.width || 0 })).filter((i) => i.s));
  }
  return pages;
}
/* some PDFs put several header names in one text run (") Quantity Unit"): split it where a new column name starts */
const PDF_COL_START = /^(qty|quantity|unit|units|uom|price|rate|mrp|gst|tax|amount|amt|hsn|batch|disc|discount|value|total|cgst|sgst|igst)\b/i, PDF_NO_SPLIT_AFTER = /(\/|^tax|^unit|^item|^sl\.?|^s\.?|^sr\.?|^per|^net|^total|^taxable|^disc\.?)$/i;
function pdfSplitHead(i) {
  const words = i.s.split(" "); if (words.length < 2 || !(i.w > 0)) return [i];
  const per = i.w / i.s.length, out = []; let off = 0, cur = null;
  words.forEach((wd, k) => {
    if (!cur || (PDF_COL_START.test(wd) && !PDF_NO_SPLIT_AFTER.test(words[k - 1]))) { if (cur) out.push(cur); cur = { s: wd, x: i.x + off * per, y: i.y, w: wd.length * per }; }
    else { cur.s += " " + wd; cur.w = i.x + (off + wd.length) * per - cur.x; }
    off += wd.length + 1;
  });
  out.push(cur); return out;
}
function pdfLines(items) {
  const L = []; items.slice().sort((a, b) => b.y - a.y || a.x - b.x).forEach((i) => { const l = L.find((x) => Math.abs(x.y - i.y) < 3); if (l) l.items.push(i); else L.push({ y: i.y, items: [i] }); });
  return L.map((l) => l.items.sort((a, b) => a.x - b.x).map((i) => i.s).join(" "));
}
function pdfTable(pages) {
  let cols = null; const rows = [], head = [];
  for (const items of pages) {
    const h = items.find((i) => PDF_NAME_H.test(i.s.replace(/[:()₹]/g, "").trim()));
    let body = items;
    if (h) {
      /* the header ends just above the first row number (some tables start right under it) */
      const lx = Math.min(...items.filter((i) => Math.abs(i.y - h.y) <= 14).map((i) => i.x)), first = items.filter((i) => i.y < h.y - 2 && /^\d+$/.test(i.s) && i.x <= lx + 20).sort((a, b) => b.y - a.y)[0];
      const hs = items.filter((i) => Math.abs(i.y - h.y) <= 14 && (!first || i.y > first.y + 4));
      if (!cols) head.push(...pdfLines(items.filter((i) => i.y > h.y + 14)));
      const C = []; hs.flatMap(pdfSplitHead).sort((a, b) => a.x - b.x).forEach((i) => {
        /* a wrapped header ("Price/" over "Unit") overlaps; pieces on one line ("MRP(" "₹" ")") touch */
        const c = C.find((c) => (i.x < c.r - 1 && i.x + i.w > c.l + 1) || c.parts.some((p) => Math.abs(p.y - i.y) < 3 && i.x - (p.x + p.w) <= 3 && i.x - (p.x + p.w) >= -1));
        if (c) { c.l = Math.min(c.l, i.x); c.r = Math.max(c.r, i.x + i.w); c.parts.push(i); } else C.push({ l: i.x, r: i.x + i.w, parts: [i] });
      });
      C.forEach((c) => { c.label = c.parts.sort((a, b) => b.y - a.y || a.x - b.x).map((p) => p.s).join(" ").replace(/\s*\/\s*/g, "/").replace(/\((₹|rs\.?|inr)\)/gi, "").trim(); });
      cols = C; const low = Math.min(...hs.map((i) => i.y)); body = items.filter((i) => i.y < low - 4);
    } else if (!cols) { head.push(...pdfLines(items)); continue; }
    const colOf = (i) => { let best = -1, bo = 0; cols.forEach((c, j) => { const o = Math.min(i.x + i.w, c.r + 6) - Math.max(i.x, c.l - 6); if (o > bo) { bo = o; best = j; } }); if (best >= 0) return best; let d = 1e9; cols.forEach((c, j) => { const dd = Math.abs(i.x + i.w / 2 - (c.l + c.r) / 2); if (dd < d) { d = dd; best = j; } }); return best; };
    const nameIdx = cols.findIndex((c) => PDF_NAME_H.test(c.label.replace(/[:]/g, ""))), noIdx = cols.findIndex((c) => /^(#|sl\.?\s*no\.?|s\.?\s*no\.?|s\.?\s*n\.?|sr\.?(\s*no\.?)?|no\.?)$/i.test(c.label.replace(/\s+/g, ""))), qtyIdx = cols.findIndex((c) => /qty|quantity/i.test(c.label));
    const tagged = body.map((i) => ({ ...i, c: colOf(i) }));
    const tot = tagged.filter((i) => ((i.c === nameIdx || i.c === noIdx || i.c === 0) && /^(grand\s*|sub\s*)?total\b/i.test(i.s)) || /^(grand\s+)?total\s+(taxable|amount|value|qty|quantity)|^amount\s+in\s+words|terms\s*(and|&)\s*conditions/i.test(i.s)).sort((a, b) => b.y - a.y)[0];
    const live = tagged.filter((i) => !tot || i.y > tot.y + 2);
    const aIdx = noIdx >= 0 ? noIdx : qtyIdx; if (aIdx < 0) continue;
    const anchors = live.filter((i) => i.c === aIdx && (aIdx === noIdx ? /^\d+\.?$/ : /^\d+(\.\d+)?$/).test(i.s.replace(/,/g, ""))).sort((a, b) => b.y - a.y); /* row numbers can be "1." */
    if (!anchors.length) continue;
    const gaps = anchors.slice(1).map((a, k) => anchors[k].y - a.y).sort((a, b) => a - b), gap = gaps.length ? gaps[Math.floor(gaps.length / 2)] : 40;
    const R = anchors.map(() => cols.map(() => []));
    live.forEach((i) => {
      let k = -1, d = 1e9; anchors.forEach((a, n) => { const dd = Math.abs(a.y - i.y); if (dd < d) { d = dd; k = n; } });
      /* a section heading ("L22 HANGYO_LOW AND STICKS") sits a whole row above its first item: not part of that item's name */
      if (k >= 0 && i.c === nameIdx && i.y - anchors[k].y > gap * 0.6 && !live.some((j) => j !== i && Math.abs(j.y - i.y) < 3 && j.c !== nameIdx)) return;
      if (k >= 0 && d <= Math.max(18, gap * 0.75)) R[k][i.c].push(i);
    });
    R.forEach((r) => rows.push(r.map((cell) => cell.sort((a, b) => b.y - a.y || a.x - b.x).map((i) => i.s).join(" ").replace(/\s+/g, " ").trim())));
    if (tot) break;
  }
  return cols ? { header: cols.map((c) => c.label), rows, head } : { header: null, rows: [], head };
}
async function impPdfInput(f) {
  const pages = await pdfPages(await f.arrayBuffer());
  if (typeof qcLoadPdf === "function") { const t = pages.map(pdfLines).flat().join("\n"); if (/\bpurchase\s*order\b/i.test(t) && (QC_PDF_SWIGGY.test(t) || QC_PDF_ZEPTO.test(t))) return { qcPages: pages, filename: f.name }; }
  if (!pages.some((p) => p.length)) throw new Error("This PDF is a scan or photo, so there is no text in it to read. Ask for the PDF from their billing software, or type the order in.");
  const T = pdfTable(pages), headText = T.head.join("\n");
  if (T.header && T.rows.length) { const all = [T.header].concat(T.rows); return { rows: all, rowsText: all.map((r) => r.join("\t")).join("\n").slice(0, 60000), head: headText, filename: f.name, pdf: true }; }
  return { text: pages.map(pdfLines).flat().join("\n"), head: headText, filename: f.name, pdf: true };
}
/* what a price per unit says about the unit: a box price means boxes, a crate price means crates */
const impRateFor = (sap, dist) => { const d = dist ? distByKey[key(dist)] : null; return d && d.special && D.special.prices[sap] != null ? D.special.prices[sap] : price(sap); };
function impUnitFromPrice(sap, p, dist) {
  const rate = impRateFor(sap, dist), st = stockBySap[sap] || catBySap[sap] || {};
  if (!(p > 0) || !(rate > 0)) return null;
  if (p / rate > 0.6 && p / rate < 1.6) return "EA (Box)";
  if (st.upc && p / (rate * st.upc) > 0.6 && p / (rate * st.upc) < 1.6) return "Crate";
  return null;
}

/* ===== UNDO A DISPATCH (owner only) =====
   For an order marked dispatched by mistake. It goes back to Pending, exactly as it was: its stock was
   already taken off the shelf when the order was saved, so stock does not change. It comes off any trip it
   was logged on. It cannot be undone once TOD has been received against it. The database also refuses
   this change from anyone who is not an owner. */
function undoDispatchCheck(o) {
  const tr = (D.logistics && D.logistics.trips || []).filter((t) => (t.orders || []).includes(o.id));
  const todGot = D.tod.lines.filter((l) => l.id === o.id).reduce((a, l) => a + (l.received || 0), 0);
  const mailed = D.activity.some((a) => a.action === "Email sent" && a.ref === o.id && /on (its|the) way|dispatch/i.test(a.detail || ""));
  return { tr, todGot, mailed };
}
function undoDispatchHtml(o) {
  const c = undoDispatchCheck(o);
  if (c.todGot > 0.005) return `<div class="banner bad" style="flex-wrap:wrap"><span class="grow">${ic("alert", "sm")} <b>This dispatch can't be undone.</b> ${rs2(c.todGot)} of TOD has already been received against this order. Correct the TOD first.</span><button class="btn btn-sm btn-secondary" data-act="orderSheet" data-id="${esc(o.id)}">OK</button></div>`;
  const notes = [];
  if (c.tr.length) notes.push(`It comes off the trip logged on ${c.tr.map((t) => fmtDate(t.date)).join(", ")}.`);
  if (c.mailed) notes.push(`${esc(shortOf(o.dist))} was already emailed that it is on its way. Let them know.`);
  return `<div class="confirm" style="flex-wrap:wrap"><span class="grow" style="min-width:220px"><b>Undo this dispatch?</b> The order goes back to <b>Pending</b> and can be picked, edited or cancelled again. Stock does not change (it was taken off the shelf when the order was saved).${notes.length ? "<br>" + notes.join(" ") : ""}</span><span class="hstack gap-8"><button class="btn btn-sm btn-secondary" data-act="orderSheet" data-id="${esc(o.id)}">Keep it dispatched</button><button class="btn btn-sm btn-primary" data-act="undoDispatchYes" data-id="${esc(o.id)}">Undo dispatch</button></span></div>`;
}
ACT.undoDispatchAsk = (el) => { if (ROLE !== "owner") { toast("Only the owner can undo a dispatch", "alert"); return; } showOrder(el.dataset.id, false, true); const c = $("#sheet .confirm, #sheet .banner.bad"); if (c) c.scrollIntoView({ block: "nearest" }); };
ACT.undoDispatchYes = (el) => {
  if (ROLE !== "owner") { toast("Only the owner can undo a dispatch", "alert"); return; }
  const o = orderById(el.dataset.id); if (!o || o.status !== "Dispatched") return;
  const c = undoDispatchCheck(o); if (c.todGot > 0.005) { showOrder(o.id, false, true); return; }
  c.tr.forEach((t) => { t.orders = t.orders.filter((x) => x !== o.id); });
  (o.undone = o.undone || []).push({ at: iso(NOW()), by: ME.name, was: o.dispatched });
  o.status = "Pending"; delete o.dispatched;
  logActivity("Dispatch undone", o.id, `${o.dist}: back to Pending${c.tr.length ? " · taken off " + c.tr.length + " trip" + (c.tr.length > 1 ? "s" : "") : ""}`);
  render(); showOrder(o.id); toast("Dispatch undone. The order is Pending again", "undo");
};

/* ===== DISTRIBUTOR ORDERS CAN USE QUICK COMMERCE STOCK =====
   When SahiReach stock is short, the order line offers the crates sitting in quick commerce stock. If taken, the
   order is saved with them (SahiReach stock goes below zero by that much), the pick list fills them in under
   "Take from quick commerce stock", and at dispatch they move across and a purchase invoice is pending. */
/* crates of SahiReach stock already promised to distributor orders out of quick commerce stock */
const gtFromQC = (sap) => { const st = stockBySap[sap]; return st && st.upc && st.ea < -1e-9 ? -st.ea / st.upc : 0; };
/* quick commerce crates free for this order: not held for a sent Swiggy / Zepto pick list, not promised to another order */
/* a product in quick commerce stock but not in the SahiReach stock list: an empty SahiReach record with its pack size,
   so an order can take it from quick commerce stock; made for real when the order is saved */
function qcOnlyStock(sap) {
  const q = qcBySap[sap], c = catBySap[sap] || {}; if (!q || !(q.upc > 0)) return null;
  return { sap, name: c.name || q.name, cat: c.cat || q.cat || "", trop: q.trop || "", ea: 0, crates: 0, pcs: 0, upc: q.upc, ppe: q.ppe || c.ppe || 1, cost: null, margin: null, virtual: true };
}
function qcOnlyStockMake(sap) {
  if (stockBySap[sap]) return stockBySap[sap];
  const v = qcOnlyStock(sap), st = { ...v }; delete st.virtual; st.move = "Added for an order filled from quick commerce stock";
  D.stock.push(st); stockBySap[sap] = st; return st;
}
function orderQCFree(sap, oldEA) {
  const q = qcBySap[sap], st = stockBySap[sap] || qcOnlyStock(sap); if (!q || !st || !st.upc) return 0;
  const promised = Math.max(0, -(st.ea + (oldEA || 0)) / st.upc);
  return Math.max(0, (q.crates || 0) - qcHeld(sap).q - promised);
}
function lineQCHtml(r, i) {
  if (r.qcTake > 0) return `<div class="line-msg tint">${ic("bolt", "sm")} <span><b>${nf(r.qcTake, 2)} crate${r.qcTake === 1 ? "" : "s"} from quick commerce stock.</b> A purchase invoice will be pending once it is dispatched. <button class="btn-plain" style="height:auto;padding:0;font-size:inherit;font-weight:600;color:var(--tint)" data-act="lineQC" data-i="${i}" data-off="1">Don't use</button></span></div>`;
  if (r.qcFree > 0 && r.qty > 0) { const n = Math.min(r.req - r.own, r.qcFree); return `<div class="line-msg tint">${ic("bolt", "sm")} <span>Quick commerce stock has <b>${nf(r.qcFree)} crate${r.qcFree === 1 ? "" : "s"}</b>. <button class="btn btn-sm btn-secondary" style="margin-left:4px" data-act="lineQC" data-i="${i}">Take ${nf(n, 2)} from quick commerce</button></span></div>`; }
  return "";
}
function orderQCAllHtml(C) {
  if (!C.qcCan.length) return "";
  return `<div class="banner info" style="margin-top:10px;flex-wrap:wrap;text-align:left">${ic("bolt", "sm")}<span class="grow" style="min-width:160px"><b>Quick commerce stock can fill ${C.qcCan.length} short line${C.qcCan.length > 1 ? "s" : ""}:</b> ${C.qcCan.map((r) => esc(shortName(r.c.name || r.ln.name))).join(", ")}.</span><button class="btn btn-sm btn-primary" data-act="allQC">Use it</button></div>`;
}
ACT.lineQC = (el) => { const l = S.draft.lines[+el.dataset.i]; if (!l) return; l.useQC = !el.dataset.off; refreshOrderLines(); };
/* the setting: fill short lines from quick commerce stock without asking */
ACT.autoQCToggle = (el) => { D.qcPick.autoQC = !D.qcPick.autoQC; logActivity("Quick commerce settings edited", "", D.qcPick.autoQC ? "Short order lines are filled from quick commerce stock automatically" : "Quick commerce stock is offered on short order lines, not used automatically"); el.setAttribute("aria-checked", String(!!D.qcPick.autoQC)); if (S.route === "new-order") refreshOrderLines(); toast(D.qcPick.autoQC ? "Short lines will use quick commerce stock automatically" : "Quick commerce stock will be offered, not used automatically", "bolt"); };
ACT.allQC = () => { calcDraft().qcCan.forEach((r) => { r.ln.useQC = true; }); refreshOrderLines(); toast("Quick commerce stock added to the short lines", "bolt"); };
{
  const sh = summaryHtml;
  summaryHtml = (C) => sh(C).replace(`<div class="stack gap-8" style="margin-top:16px">`, `${orderQCAllHtml(C)}${C.qcTake > 0 ? `<div class="sum-row" style="margin-top:6px"><span class="muted">From quick commerce stock</span><span class="num">${nf(C.qcTake, 2)} crates</span></div>` : ""}<div class="stack gap-8" style="margin-top:16px">`);
}
/* a saved order with missed lines that quick commerce stock could fill now */
function orderQCOffer(o) {
  if (!o || o.status !== "Pending") return [];
  const seen = new Set();
  /* short lines, and lines logged as "not in range" for a product quick commerce stock now has */
  return D.oos.filter((m) => m.id === o.id && m.sap && ((typeof m.missed === "number" && m.missed > 0) || (m.missed === "N/A" && qcBySap[m.sap]))).filter((m) => !seen.has(m.sap) && seen.add(m.sap)).map((m) => ({ m, free: Math.floor(orderQCFree(m.sap, 0) + 1e-9) })).filter((x) => x.free >= 1);
}
function orderQCOfferHtml(o) {
  const L = orderQCOffer(o); if (!L.length) return "";
  return `<div class="banner info" style="flex-wrap:wrap"><span class="grow" style="min-width:220px">${ic("bolt", "sm")} <b>Quick commerce stock can fill what was missed:</b> ${L.map((x) => `${esc(shortName(x.m.product))} (${typeof x.m.missed === "number" ? nf(x.m.missed, 2) + " missed" : `${nf(x.m.askQty || 1)} ${esc(String(x.m.askUnit || "Crate").replace("EA (Box)", "box").toLowerCase())} asked for`}, quick commerce has ${nf(x.free)})`).join(", ")}.</span>${CAN_EDIT ? `<button class="btn btn-sm btn-primary" data-act="orderAddQC" data-id="${esc(o.id)}">Add from quick commerce</button>` : ""}</div>`;
}
ACT.orderAddQC = (el) => {
  const o = orderById(el.dataset.id); if (!o || o.status !== "Pending") return;
  const saps = new Set(orderQCOffer(o).map((x) => x.m.sap));
  ACT.editOrder({ dataset: { id: o.id } });
  S.draft.lines.forEach((l) => { if (saps.has(l.sap)) l.useQC = true; });
  render(); toast("Quick commerce stock added. Check the order, then tap Update order", "bolt");
};
/* at dispatch without a matching pick list: move what the orders were promised from quick commerce stock */
function orderQCMoves(orders) {
  const need = {};
  orders.forEach((o) => (linesByOrder[o.id] || []).forEach((l) => { if (l.qc > 0) need[l.sap] = (need[l.sap] || 0) + l.qc; }));
  return Object.keys(need).map((sap) => { const q = qcBySap[sap]; const n = Math.min(need[sap], Math.ceil(gtFromQC(sap) - 1e-9), q ? Math.max(0, Math.floor((q.crates || 0) - qcHeld(sap).q + 1e-9)) : 0); return { sap, n, name: (stockBySap[sap] || q || { name: sap }).name, code: (q || {}).trop || "" }; }).filter((x) => x.n > 0);
}

/* ===== DISPATCH ===== */
const shortOf = (name) => (distByKey[key(name)] && distByKey[key(name)].short) || name;
function pickedOrders() { return pendingOrders().filter((o) => S.picked[o.id]); }
VIEWS.dispatch = () => {
  const pend = pendingOrders().sort((a, b) => (a.time > b.time ? 1 : -1)), sel = pickedOrders();
  const crates = sel.reduce((a, o) => a + o.crates, 0), veh = vehicleFor(crates);
  const recent = D.orders.filter((o) => o.status === "Dispatched").sort((a, b) => (a.dispatched < b.dispatched ? 1 : -1)).slice(0, 6);
  return `<div class="page narrow">
    <div class="page-head"><div><h1 class="title">Dispatch</h1><div class="subtitle">Tick the orders going on the next truck, send the pick list to Tropicana, then mark them dispatched once it has left.</div></div></div>
    ${pend.length ? `<div class="split s300">
      <div><div class="group-label"><span>${pend.length} order${pend.length > 1 ? "s" : ""} not dispatched yet</span><button class="btn-plain" style="height:auto;font-size:13px;font-weight:600" data-act="pickAll">${sel.length === pend.length ? "Untick all" : "Tick all"}</button></div>
        <div class="group">${pend.map((o) => `<div class="row tap" role="checkbox" tabindex="0" aria-checked="${!!S.picked[o.id]}" data-act="togglePick" data-id="${esc(o.id)}" style="cursor:pointer"><span class="check" aria-checked="${!!S.picked[o.id]}">${ic("check")}</span><span class="grow"><div class="row-title clip">${esc(o.dist)}</div><div class="row-sub">${backPill(o) ? backPill(o) + " " : ""}${dayLabel(o.time)}, ${fmtTime(o.time)} · ${o.lines} lines${o.timesEdited ? " · edited" : ""}${orderQCOffer(o).length ? ` · <span style="color:var(--tint);font-weight:600">quick commerce stock can fill a missed line</span>` : ""}</div></span><span class="row-end"><span><div class="row-value">${nf(o.crates, 2)} crates</div><div class="row-sub num">${rs(o.value)}</div></span><button class="icon-btn" data-act="orderSheet" data-id="${esc(o.id)}" aria-label="Open order">${ic("chevR", "sm")}</button></span></div>`).join("")}</div></div>
      <div class="sticky"><div class="card card-pad"><div class="card-title">This truck</div>
        <div class="tile-value" style="margin-top:8px">${nf(crates, 2)}<small>crates</small></div><div class="row-sub">${sel.length} of ${pend.length} orders · ${rs(sel.reduce((a, o) => a + o.value, 0))}</div>
        ${veh ? `<div class="vehicle">${ic("truck")}<span><b>${esc(veh.split(" (")[0])}</b><div class="row-sub">${veh.includes("(") ? esc(veh.split("(")[1].replace(")", "")) : "Suggested vehicle"}</div></span></div>` : ""}
        <div class="stack gap-8" style="margin-top:16px"><button class="btn btn-primary btn-lg btn-block" data-act="makePick" ${sel.length ? "" : "disabled"}>${ic("doc", "sm")} Create pick list</button><button class="btn btn-secondary btn-block" data-act="dispatchAsk" ${sel.length ? "" : "disabled"}>${ic("truck", "sm")} Mark dispatched</button></div>
        <div id="dispatch-confirm"></div></div></div></div>`
      : `<div class="group"><div class="empty"><div class="big">All clear</div>Nothing is waiting to go out. Saved orders appear here straight away.<div style="margin-top:14px"><button class="btn btn-primary" data-act="newOrder">${ic("plus", "sm")} New order</button></div></div></div>`}
    <div><div class="group-label"><span>Recently dispatched</span></div><div class="group">${recent.map((o) => `<button class="row" data-act="orderSheet" data-id="${esc(o.id)}"><span class="attn-ic tint" style="width:30px;height:30px">${ic("check", "sm")}</span><span class="grow"><div class="row-title clip">${esc(o.dist)}</div><div class="row-sub">Left ${fmtDT(o.dispatched)}</div></span><span class="row-end"><span class="row-value">${nf(o.crates)} crates</span>${ic("chevR", "sm chev")}</span></button>`).join("")}</div></div></div>`;
};
ACT.togglePick = (el, e) => { if (e.target.closest('[data-act="orderSheet"]')) return; S.picked[el.dataset.id] = !S.picked[el.dataset.id]; render(); };
ACT.pickAll = () => { const pend = pendingOrders(), all = pickedOrders().length === pend.length; pend.forEach((o) => { S.picked[o.id] = !all; }); render(); };
function buildPick() {
  const orders = pickedOrders().sort((a, b) => (a.time > b.time ? 1 : -1)), prod = {};
  orders.forEach((o, ci) => (linesByOrder[o.id] || []).forEach((l) => { if (!(l.crates > 0)) return; const p = (prod[l.sap] = prod[l.sap] || { name: l.product, sap: l.sap, cells: {}, total: 0 }); p.cells[ci] = (p.cells[ci] || 0) + l.crates; p.total += l.crates; }));
  const rows = Object.values(prod).sort((a, b) => a.name.localeCompare(b.name));
  if (!S.pickQC) { S.pickQC = {}; rows.forEach((r) => { const st = stockBySap[r.sap], q = qcBySap[r.sap]; if (st && st.upc && st.ea < -1e-9 && q && q.crates - qcHeld(r.sap).q >= 1) S.pickQC[r.sap] = Math.min(Math.ceil(-st.ea / st.upc - 1e-9), Math.floor(q.crates - qcHeld(r.sap).q + 1e-9), Math.floor(r.total)); }); }
  const qc = {}; rows.forEach((r) => { const q = qcBySap[r.sap], v = Math.min(+(S.pickQC[r.sap] || 0), r.total, q ? Math.max(0, Math.floor((q.crates || 0) - qcHeld(r.sap).q + 1e-9)) : 0); if (v > 0) qc[r.sap] = v; });
  return { orders, rows, total: rows.reduce((a, r) => a + r.total, 0), made: NOW(), dispatchOn: S.pickDate || addDays(ymd(NOW()), 1), qc };
}
/* expected dispatch date: tomorrow unless changed; it goes on the Excel, the email and the WhatsApp text */
const dmyK = (k) => `${k.slice(8, 10)}-${k.slice(5, 7)}-${k.slice(0, 4)}`;
const pickDateField = (id, k, inName) => `<div class="field" style="margin-top:14px;max-width:280px"><label class="label" for="${id}">Expected dispatch date</label><input class="input" type="date" id="${id}" value="${esc(k)}" data-in="${inName}"><div class="row-sub" style="margin-top:4px">${esc(dateLong(k))} · on the Excel and the email</div></div>`;
IN.pickDate = (el) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(el.value)) return; S.pickDate = el.value; if (S.pickList) S.pickList.dispatchOn = el.value; const s = el.parentNode.querySelector(".row-sub"); if (s) s.textContent = dateLong(el.value) + " · on the Excel and the email"; };
const qcDispatchOn = () => { const L = S.qcLockView && typeof qcLocks === "function" ? qcLocks().find((l) => l.id === S.qcLockView) : null; return (L && L.dispatchOn) || S.qcDispatchOn || addDays(ymd(NOW()), 1); };
IN.qcPickDate = (el) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(el.value)) return; S.qcDispatchOn = el.value; const s = el.parentNode.querySelector(".row-sub"); if (s) s.textContent = dateLong(el.value) + " · on the Excel and the email"; };
const tropCode = (sap) => (stockBySap[sap] || {}).trop || "";
function pickTable(P, editing) {
  return `<div class="table-wrap"><table class="t matrix"><thead><tr><th class="sticky-col">Product</th>${P.orders.map((o) => `<th class="vert">${esc(shortOf(o.dist))}<span class="dim" style="font-weight:500"> · ${fmtDate(o.time)}</span></th>`).join("")}<th class="r">Total</th></tr></thead><tbody>
    ${P.rows.map((r) => `<tr><td class="sticky-col"><div class="clip" style="max-width:240px">${esc(shortName(r.name))}</div><div class="row-sub">${esc(tropCode(r.sap))}</div></td>${P.orders.map((o, ci) => editing && r.cells[ci] ? `<td class="r edit-cell"><input class="pick-in" type="number" inputmode="decimal" min="0" step="1" value="${+r.cells[ci].toFixed(2)}" data-in="pickCell" data-sap="${esc(r.sap)}" data-ci="${ci}" data-was="${r.cells[ci]}" aria-label="${esc(shortName(r.name))}, ${esc(shortOf(o.dist))}"></td>` : `<td class="r">${r.cells[ci] ? nf(r.cells[ci], 2) : `<span class="dim">·</span>`}</td>`).join("")}<td class="r"><b>${nf(r.total, 2)}</b>${P.qc && P.qc[r.sap] ? `<div class="pill warn" style="height:20px;font-size:11px;margin-top:3px">${nf(P.qc[r.sap])} from QC stock</div>` : ""}</td></tr>`).join("")}
    <tr class="total"><td class="sticky-col">Total crates</td>${P.orders.map((o) => `<td class="r">${nf(o.crates, 2)}</td>`).join("")}<td class="r">${nf(P.total, 2)}</td></tr></tbody></table></div>`;
}
function showPick(editing) {
  const P = S.pickList; if (!P) return;
  S.pickEdit = !!editing;
  const head = `<div class="card card-pad"><div class="kv"><div><div class="k">Orders</div><div class="v">${P.orders.length}</div></div><div><div class="k">Products</div><div class="v">${P.rows.length}</div></div><div><div class="k">Crates</div><div class="v num">${nf(P.total, 2)}</div></div><div><div class="k">Vehicle</div><div class="v">${esc((vehicleFor(P.total) || "–").split(" (")[0])}</div></div></div>${editing ? "" : pickDateField("pick-date", P.dispatchOn, "pickDate")}</div>`;
  const note = editing ? `<div class="banner warn">${ic("pencil", "sm")}<span><b>Change the crates Tropicana should pick.</b> Saving updates those orders, their values and stock. Set a cell to 0 to take that product off the order. To add a new product, edit the order itself.</span></div>` : `<div class="row-sub">Products down the side, distributors across, the way Tropicana picks today.</div>`;
  const foot = editing
    ? `<button class="btn btn-secondary" data-act="pickEditCancel">Cancel</button><button class="btn btn-primary" data-act="pickEditSave">${ic("check", "sm")} Save changes</button>`
    : `<button class="btn btn-secondary" data-act="pickEdit">${ic("pencil", "sm")} Edit</button><button class="btn btn-secondary" data-act="pickExcel">${ic("doc", "sm")} Excel</button><button class="btn btn-secondary" data-act="emailPick">${ic("arrowR", "sm")} Email</button><button class="btn btn-secondary" data-act="copyPick">${ic("copy", "sm")} WhatsApp</button><button class="btn btn-primary" data-act="dispatchNow">${ic("truck", "sm")} Mark dispatched</button>`;
  openSheet(editing ? "Edit pick list" : "Pick list for Tropicana", `<div id="xfer-confirm"></div>` + head + (editing ? note : "") + pickTable(P, editing) + (editing ? "" : note + pickQCHtml(P)), foot, true);
}
ACT.makePick = () => {
  S.pickDate = null; S.pickQC = null; const P = buildPick(); if (!P.orders.length) return;
  S.pickList = P;
  logActivity("Pick list made", `${P.orders.length} order(s)`, `${P.rows.length} products, ${nf(P.total, 2)} crates`);
  showPick(false);
};
ACT.pickEdit = () => showPick(true);
ACT.pickEditCancel = () => showPick(false);
IN.pickCell = (el) => { const v = +el.value, was = +el.dataset.was; el.classList.toggle("changed", el.value !== "" && Math.abs(v - was) > 1e-9); };
/* change one order line to a new number of crates: value, TOD and stock follow */
function setLineCrates(o, l, crates) {
  const st = stockBySap[l.sap], upc = (st && st.upc) || (l.ea && l.crates ? l.ea / l.crates : 1), ppe = (st && st.ppe) || (l.pcs && l.ea ? l.pcs / l.ea : 1);
  const newEA = Math.max(0, Math.round(crates * upc)), dEA = newEA - (l.ea || 0), todPer = l.ea ? (l.tod || 0) / l.ea : 0;
  if (st && dEA) { st.ea -= dEA; st.crates = st.ea / st.upc; st.pcs = st.ea * (st.ppe || 1); st.move = `${o.id} (${o.dist}): pick list ${dEA > 0 ? "+" : ""}${nf(dEA / upc, 2)} crates`; }
  l.ea = newEA; l.crates = newEA / upc; l.pcs = newEA * ppe; l.value = Math.round(newEA * (l.billed || 0) * 100) / 100; l.tod = Math.round(newEA * todPer * 100) / 100;
  l.qty = l.unit === "Crate" ? l.crates : l.unit === "Pieces" ? l.pcs : newEA;
  const tl = D.tod.lines.find((x) => x.id === o.id && x.sap === l.sap); if (tl) { tl.ea = newEA; tl.crates = l.crates; tl.amount = l.tod; }
}
function refreshOrderTotals(o) {
  const ls = (linesByOrder[o.id] = (linesByOrder[o.id] || []).filter((l) => l.ea > 0));
  D.tod.lines = D.tod.lines.filter((x) => x.id !== o.id || ls.some((l) => l.sap === x.sap));
  const value = Math.round(ls.reduce((a, l) => a + (l.value || 0), 0) * 100) / 100;
  Object.assign(o, { lines: ls.length, crates: ls.reduce((a, l) => a + (l.crates || 0), 0), value, valueGst: Math.round(value * 105) / 100, tod: ls.reduce((a, l) => a + (l.tod || 0), 0), edited: iso(NOW()), timesEdited: (o.timesEdited || 0) + 1 });
}
ACT.pickEditSave = () => {
  const P = S.pickList, changes = [];
  $$("#sheet input.pick-in").forEach((el) => { const v = Math.max(0, +el.value || 0), was = +el.dataset.was; if (Math.abs(v - was) > 1e-9) changes.push({ sap: el.dataset.sap, o: P.orders[+el.dataset.ci], v, was }); });
  if (!changes.length) { showPick(false); return; }
  /* check before changing anything: stock for increases, no order left empty */
  const need = {}; changes.forEach((c) => { need[c.sap] = (need[c.sap] || 0) + (c.v - c.was); });
  for (const sap in need) { const st = stockBySap[sap]; if (need[sap] > 0 && st && st.upc && need[sap] > st.ea / st.upc + 1e-9) { toast(`Only ${nf(st.ea / st.upc, 2)} more crates of ${shortName(st.name)} in stock`, "alert"); return; } }
  const byOrder = {}; changes.forEach((c) => { (byOrder[c.o.id] = byOrder[c.o.id] || []).push(c); });
  for (const id in byOrder) { const o = orderById(id), left = (linesByOrder[id] || []).filter((l) => { const c = byOrder[id].find((x) => x.sap === l.sap); return c ? c.v > 0 : l.crates > 0; }); if (!left.length) { toast(`That would leave ${shortOf(o.dist)}'s order empty. Cancel the order instead.`, "alert"); return; } }
  changes.forEach((c) => {
    const ls = (linesByOrder[c.o.id] || []).filter((l) => l.sap === c.sap), cur = ls.reduce((a, l) => a + l.crates, 0);
    if (!ls.length) return;
    let rest = c.v; ls.forEach((l, i) => { const share = i === ls.length - 1 ? rest : Math.min(rest, (l.crates / (cur || 1)) * c.v); setLineCrates(c.o, l, share); rest -= share; });
  });
  Object.keys(byOrder).forEach((id) => refreshOrderTotals(orderById(id)));
  logActivity("Pick list edited", `${Object.keys(byOrder).length} order(s)`, changes.map((c) => `${shortOf(c.o.dist)}: ${shortName((stockBySap[c.sap] || {}).name || c.sap)} ${nf(c.was, 2)} → ${nf(c.v, 2)}`).join("; "));
  S.pickList = buildPick(); render(); showPick(false); toast(`${changes.length} change${changes.length > 1 ? "s" : ""} saved to ${Object.keys(byOrder).length} order${Object.keys(byOrder).length > 1 ? "s" : ""}`);
};
function loadScriptOnce(src, test) {
  if (test()) return Promise.resolve();
  return new Promise((ok, bad) => { const s = document.createElement("script"); s.src = src; s.onload = () => (test() ? ok() : bad(new Error("not loaded"))); s.onerror = () => bad(new Error("not loaded")); document.head.appendChild(s); });
}
const XLSX_SRC = (HOST && HOST.xlsxSrc) || "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
/* read an Excel file from outside into rows. The Excel library version used here can be tricked by a crafted file into
   adding properties to every object (CVE-2023-30533); anything added while reading is removed straight after. */
function xlsxSheets(buf, nSheets) {
  const P = [Object.prototype, Array.prototype, String.prototype, Number.prototype, Function.prototype], before = P.map((p) => new Set(Object.getOwnPropertyNames(p)));
  try {
    const wb = window.XLSX.read(buf, { type: "array" });
    return wb.SheetNames.slice(0, nSheets || 1).map((sn) => window.XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, raw: false, blankrows: false }));
  } finally { P.forEach((p, i) => Object.getOwnPropertyNames(p).forEach((k) => { if (!before[i].has(k)) { try { delete p[k]; } catch (e) {} } })); }
}
function downloadXlsx(el, aoa, cols, file, sheet, merges) { return downloadBook(el, [{ name: sheet, aoa, cols, merges }], file); }
/* several sheets in one workbook; the first sheet opens first */
/* staff downloads: cost, profit, margin and TOD columns (and summary lines) are left out */
const MONEY_COL = /ss rate|tied up|value to push|gross profit|margin|\btod\b|\bcost\b/i;
function stripMoney(sh) {
  let drop = [], firstDrop = null;
  const isHead = (r) => { const f = r.filter((c) => c !== "" && c != null); return f.length >= 3 && f.every((c) => typeof c === "string"); };
  const aoa = [];
  sh.aoa.forEach((r) => {
    if (!Array.isArray(r)) { aoa.push(r); return; }
    if (r.length === 2 && typeof r[0] === "string" && MONEY_COL.test(r[0])) return;
    if (isHead(r)) { drop = r.map((c, i) => (typeof c === "string" && MONEY_COL.test(c) ? i : -1)).filter((i) => i >= 0); if (firstDrop == null && drop.length) firstDrop = drop; }
    aoa.push(drop.length ? r.filter((_, i) => !drop.includes(i)) : r);
  });
  return { ...sh, aoa, cols: firstDrop ? sh.cols.filter((_, i) => !firstDrop.includes(i)) : sh.cols };
}
async function downloadBook(el, sheets, file) {
  if (!SEE_MONEY) sheets = sheets.map(stripMoney);
  if (el) el.disabled = true;
  try { await loadScriptOnce(XLSX_SRC, () => !!window.XLSX); }
  catch (e) { if (el) el.disabled = false; toast("Could not prepare the Excel file. Check your internet and try again.", "alert"); return false; }
  const X = window.XLSX, wb = X.utils.book_new();
  sheets.forEach((sh) => { const ws = X.utils.aoa_to_sheet(sh.aoa); ws["!cols"] = sh.cols.map((w) => ({ wch: w })); if (sh.merges) ws["!merges"] = sh.merges; if (sh.freeze) ws["!freeze"] = sh.freeze; X.utils.book_append_sheet(wb, ws, sh.name); });
  X.writeFile(wb, file, { compression: true });
  if (el) el.disabled = false; return true;
}
const stampOf = (d) => `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
function pickAoa(P, opt) {
  const stampTxt = stampOf(P.made || NOW()), names = P.orders.map((o) => shortOf(o.dist)), hasQC = P.qc && Object.keys(P.qc).length > 0;
  const aoa = [
    ["PICK LIST FOR TROPICANA LOGISTICS, WILLINGDON ISLAND  (SahiReach LLP)"],
    ["Orders in this pick list", `${P.orders.length} order(s): ${P.orders.map((o) => o.id).join(", ")}   |   generated ${stampTxt}`],
    ["Expected dispatch date", dmyK(P.dispatchOn || addDays(ymd(NOW()), 1))],
    hasQC ? ["NOTE", "Some crates are picked from QUICK COMMERCE STOCK, not SahiReach stock: see the last two columns."] : [],
    ["Tropicana Code", "SKU"].concat(names, ["TOTAL CRATES"], hasQC ? ["OF WHICH FROM QC STOCK", "QC STOCK CODE"] : []),
    ["", "Order date/time"].concat(P.orders.map((o) => { const d = toDate(o.time); return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }), [""]),
  ];
  P.rows.forEach((r) => aoa.push([tropCode(r.sap), r.name].concat(P.orders.map((o, ci) => (r.cells[ci] ? +r.cells[ci].toFixed(2) : null)), [+r.total.toFixed(2)], hasQC ? [P.qc[r.sap] || null, P.qc[r.sap] ? (qcBySap[r.sap] || {}).trop || "" : ""] : [])));
  aoa.push(["", "TOTAL CRATES"].concat(P.orders.map((o) => +o.crates.toFixed(2)), [+P.total.toFixed(2)], hasQC ? [Object.values(P.qc).reduce((a, x) => a + x, 0), ""] : []));
  if (!(opt && opt.noVehicle)) { aoa.push([]); aoa.push(["Vehicle", (vehicleFor(P.total) || "").replace(/\s*\(.*\)/, "")]); }
  return { rows: aoa, cols: [14, 46].concat(names.map((n) => Math.max(9, Math.min(22, n.length + 2))), [14], hasQC ? [16, 18] : []), stampTxt, names };
}
ACT.pickExcel = async (el) => {
  const P = S.pickList; if (!P) return;
  const A = pickAoa(P);
  if (await downloadXlsx(el, A.rows, A.cols, `SahiReach pick list ${A.stampTxt.replace(":", "")}.xlsx`, "Pick List", [{ s: { r: 0, c: 0 }, e: { r: 0, c: Math.min(A.names.length + 3, 8) } }])) {
    logActivity("Pick list downloaded", `${P.orders.length} order(s)`, "Excel"); toast("Excel pick list downloaded", "doc");
  }
};
ACT.copyPick = () => {
  const P = S.pickList; if (!P) return;
  const txt = `SahiReach pick list (${fmtDT(NOW())})\nExpected dispatch: ${dateLong(P.dispatchOn)}\n${P.orders.length} orders, ${nf(P.total, 2)} crates\n\n` + P.orders.map((o, ci) => `*${shortOf(o.dist)}* (${nf(o.crates, 2)} crates)\n` + P.rows.filter((r) => r.cells[ci]).map((r) => `  ${nf(r.cells[ci], 2)} x ${shortName(r.name)}`).join("\n")).join("\n\n") + (P.qc && Object.keys(P.qc).length ? `\n\n*PICK THESE FROM QUICK COMMERCE STOCK* (not SahiReach stock):\n` + Object.keys(P.qc).map((sap) => `  ${nf(P.qc[sap])} x ${shortName((stockBySap[sap] || qcBySap[sap] || { name: sap }).name)}${(qcBySap[sap] || {}).trop ? " (" + qcBySap[sap].trop + ")" : ""}`).join("\n") : "");
  copyText(txt, "Pick list copied. Paste it into WhatsApp");
};
ACT.dispatchAsk = () => { const sel = pickedOrders(); part("dispatch-confirm", `<div class="confirm" style="margin-top:12px;background:var(--tint-soft);color:var(--tint)"><span><b>Has the truck left?</b> ${sel.length} order${sel.length > 1 ? "s" : ""} will be locked.</span><span class="hstack gap-8"><button class="btn btn-sm btn-secondary" data-act="dispatchNo">Not yet</button><button class="btn btn-sm btn-primary" data-act="dispatchNow">Yes, dispatched</button></span></div>`); };
ACT.dispatchNo = () => part("dispatch-confirm", "");
ACT.dispatchNow = () => {
  const sel = pickedOrders(), now = iso(NOW()); if (!sel.length) return;
  S.pickDate = null;
  sel.forEach((o) => { o.status = "Dispatched"; o.dispatched = now; delete S.picked[o.id]; });
  logActivity("Orders dispatched", `${sel.length} order(s)`, sel.map((o) => shortOf(o.dist)).join(", "));
  closeSheet(); render(); toast(`${sel.length} order${sel.length > 1 ? "s" : ""} marked dispatched`, "truck");
  setTimeout(() => openSheet("Let them know?", `<div class="success"><div class="tick">${ic("truck")}</div><div class="section-title">${sel.length} order${sel.length > 1 ? "s" : ""} on the way</div><div class="muted">Send each distributor a short “your order is on its way” email with the crates and the payment due date.</div></div><div class="group">${sel.map((o) => { const d = distByKey[key(o.dist)] || {}; return `<div class="row"><span class="grow"><div class="row-title">${esc(o.dist)}</div><div class="row-sub">${d.email ? esc(d.email) : `<span style="color:var(--warn)">No email saved</span>`}</div></span><span class="row-end">${nf(o.crates, 2)} crates</span></div>`; }).join("")}</div>`, `<button class="btn btn-secondary" data-act="closeSheet">Not now</button><button class="btn btn-secondary" data-act="tripSelf" data-orders="${sel.map((o) => o.id).join(",")}">Self pickup</button>${logi().trips.length ? `<button class="btn btn-secondary" data-act="tripJoin" data-orders="${sel.map((o) => o.id).join(",")}">Same vehicle as a trip</button>` : ""}<button class="btn btn-secondary" data-act="tripForm" data-orders="${sel.map((o) => o.id).join(",")}">${ic("truck", "sm")} Log the trip</button><button class="btn btn-primary" data-act="emailDispatch" data-ids="${sel.map((o) => o.id).join(",")}">${ic("arrowR", "sm")} Preview and send</button>`), 450);
};

/* ===== QUICK COMMERCE ===== */
const PLAT_COLOR = { Swiggy: "--s-swiggy", Zepto: "--s-zepto" };
const platDot = (p) => `<i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(${PLAT_COLOR[p] || "--ink-3"});margin-right:6px"></i>`;
function daysLeft(p) { const e = toDate(p.expiry), n = NOW(); return Math.round((new Date(e.getFullYear(), e.getMonth(), e.getDate()) - new Date(n.getFullYear(), n.getMonth(), n.getDate())) / 864e5); }
function expiryPill(p) { const d = daysLeft(p); return d < 0 ? `<span class="pill bad">Expired ${fmtDate(p.expiry)}</span>` : d === 0 ? `<span class="pill bad">Expires today</span>` : d <= 3 ? `<span class="pill warn">${d} day${d > 1 ? "s" : ""} left</span>` : `<span class="pill plain">${d} days left</span>`; }
/* the delivery being put together from the ticked POs (POs already on a sent pick list are not in it,
   and the crates held for sent pick lists are not offered again) */
function qcDeliveryLive() {
  const pos = openQC().filter((p) => p.platform === S.qcPlatform && S.qcPicked[p.po] && daysLeft(p) >= 0 && !qcLockOf(p.po)), agg = {};
  pos.forEach((p) => (qcLinesByPO[p.po] || []).forEach((l) => { const k = l.sap || l.product, a = (agg[k] = agg[k] || { sap: l.sap, name: l.product, pcs: 0, value: 0, ppc: l.ppc }); a.pcs += l.pcs; a.value += l.value; }));
  const rows = Object.values(agg).map((a) => {
    const qc = qcBySap[a.sap] || {}, own = stockBySap[a.sap] || {}, ppc = a.ppc || qc.ppc || 1;
    const held = qcHeld(a.sap), full = Math.floor(a.pcs / ppc), qcCr = Math.max(0, Math.floor((qc.crates || 0) - held.q - gtFromQC(a.sap) + 1e-9)), ownCr = own.upc ? Math.max(0, Math.floor(own.ea / own.upc - held.o + 1e-9)) : 0;
    let fromQC = Math.min(full, qcCr), fromOwn = S.qcOwn ? Math.min(full - fromQC, ownCr) : 0;
    const ov = (S.qcOverride[S.qcPlatform] || {})[a.sap], edited = !!ov;
    if (ov) { fromQC = Math.max(0, Math.min(ov.q, qcCr)); fromOwn = Math.max(0, Math.min(ov.o, ownCr)); }
    const send = fromQC + fromOwn, sendPcs = Math.min(a.pcs, send * ppc);
    return { ...a, ppc, full, qcCr, ownCr, fromQC, fromOwn, send, edited, sendPcs, notSent: a.pcs - sendPcs, extra: Math.max(0, send * ppc - a.pcs), sendValue: a.pcs ? (a.value / a.pcs) * sendPcs : 0 };
  }).sort((a, b) => a.name.localeCompare(b.name));
  return { pos, rows, crates: rows.reduce((a, r) => a + r.send, 0), value: rows.reduce((a, r) => a + r.sendValue, 0), min: S.qcPlatform === "Swiggy" ? D.qcPick.minSwiggy : D.qcPick.minZepto };
}
function qcOpenHtml() {
  qcLocksClean(); if (!sheetOpen) S.qcLockView = null;
  const list = openQC().filter((p) => p.platform === S.qcPlatform && !qcLockOf(p.po)).sort((a, b) => (a.expiry > b.expiry ? 1 : -1)), Dl = qcDeliveryLive(), locks = qcLocksHtml();
  const ok = Dl.value >= Dl.min, prog = Dl.min ? Math.min(100, (Dl.value / Dl.min) * 100) : 100;
  if (!list.length) return `${locks}<div class="group"><div class="empty"><div class="big">No ${locks ? "other " : ""}open ${esc(S.qcPlatform)} POs</div>Add a PO when it arrives and it will show here until it is delivered or lapses.</div></div>`;
  return `${locks}<div class="split s320">
    <div class="stack gap-20"><div><div class="group-label"><span>Open POs, soonest expiry first</span></div><div class="group">${list.map((p) => { const exp = daysLeft(p) < 0; return `<div class="row tap" ${exp ? "" : `role="checkbox" tabindex="0" aria-checked="${!!S.qcPicked[p.po]}" data-act="toggleQC" data-po="${esc(p.po)}" style="cursor:pointer"`}><span class="check" aria-checked="${!exp && !!S.qcPicked[p.po]}" ${exp ? 'style="opacity:.3"' : ""}>${ic("check")}</span><span class="grow"><div class="row-title mono" style="font-size:14.5px">${esc(p.po)}</div><div class="row-sub">${p.lines} lines · ${nf(p.pcs)} pieces · PO of ${fmtDate(p.date)}${p.edited ? " · edited" : ""}</div></span><span class="row-end"><span style="text-align:right"><div class="row-value">${rs(p.value)}</div><div style="margin-top:3px">${expiryPill(p)}</div></span><button class="icon-btn" data-act="qcPOSheet" data-po="${esc(p.po)}" aria-label="Open PO">${ic("chevR", "sm")}</button></span></div>`; }).join("")}</div></div>
      ${Dl.rows.length ? `<div><div class="group-label"><span>What goes on this delivery</span><button class="btn-plain" style="height:auto;font-size:13px;font-weight:600" data-act="qcPickEdit">${ic("pencil", "sm")} Edit crates</button></div><div class="dg" style="--cols:minmax(0,1.6fr) 80px 80px 90px 90px 90px;--cols-sm:minmax(0,1fr) auto"><div class="dg-row dg-head"><span>Product</span><span class="r c-hide">Pieces on POs</span><span class="r c-hide">Per crate</span><span class="r c-hide">From QC stock</span><span class="r c-hide">From own stock</span><span class="r">Crates to send</span></div>${Dl.rows.map((r) => `<div class="dg-row"><span><div class="strong clip">${esc(shortName(r.name))}</div>${r.notSent > 0 ? `<div class="row-sub" style="color:var(--warn)">${nf(r.notSent)} pieces not sent${r.edited ? " · changed by you" : r.send < r.full ? " · stock short" : " · under a full crate"}</div>` : `<div class="row-sub">${r.extra ? nf(r.extra) + " pieces over the PO" : "Sent in full"}${r.edited ? " · changed by you" : ""}</div>`}</span><span class="r c-hide">${nf(r.pcs)}</span><span class="r c-hide">${r.ppc}</span><span class="r c-hide">${r.fromQC}<span class="dim"> of ${r.qcCr}</span></span><span class="r c-hide">${r.fromOwn || `<span class="dim">–</span>`}</span><span class="r strong">${r.send}</span></div>`).join("")}</div></div>` : ""}</div>
    <div class="sticky"><div class="card card-pad"><div class="card-title">This delivery</div><div class="row-sub">${esc(S.qcPlatform === "Swiggy" ? D.qcPick.swiggyTo : D.qcPick.zeptoTo)}</div>
      <div class="tile-value" style="margin-top:10px">${nf(Dl.crates)}<small>crates</small></div><div class="row-sub">${Dl.pos.length} PO${Dl.pos.length === 1 ? "" : "s"} ticked · ${rs(Dl.value)} excl. GST</div>
      ${Dl.min ? `<div style="margin-top:14px"><div class="hstack between" style="font-size:13px"><span class="muted">Minimum per delivery ${rs(Dl.min)}</span>${ok ? `<span class="pill good">OK</span>` : `<span class="pill warn">${rs(Dl.min - Dl.value)} short</span>`}</div><div class="meter ${ok ? "" : "warn"}" style="margin-top:7px;height:8px"><i style="width:${prog}%"></i></div></div>` : ""}
      <div class="hstack between" style="margin-top:16px"><span style="font-size:14px">Use own stock when QC stock is short</span><button class="toggle" role="switch" aria-checked="${S.qcOwn}" data-act="toggleOwn" aria-label="Use own stock"></button></div>
      <div class="stack gap-8" style="margin-top:16px"><button class="btn btn-primary btn-lg btn-block" data-act="qcPick" ${Dl.rows.length ? "" : "disabled"}>${ic("doc", "sm")} Create pick list</button><button class="btn btn-secondary btn-block" data-act="qcDeliverAsk" ${Dl.crates ? "" : "disabled"}>${ic("truck", "sm")} Mark delivered</button><button class="btn btn-secondary btn-block" data-act="qcLapse">Lapse expired POs</button></div>
      <div id="qc-confirm"></div>
      <div class="row-sub" style="margin-top:10px">Marking delivered takes the crates off stock, shares the pieces to the POs that expire first, and lapses what was not sent.</div></div></div></div>`;
}
function qcHistoryHtml() {
  const list = D.qcPOs.filter((p) => p.status !== "Open").sort((a, b) => ((a.deliveredOn || a.expiry) < (b.deliveredOn || b.expiry) ? 1 : -1));
  return `<div class="dg" style="--cols:minmax(0,1.3fr) 110px 100px 100px 110px minmax(90px,140px);--cols-sm:minmax(0,1fr) auto"><div class="dg-row dg-head"><span>PO</span><span class="c-hide">Status</span><span class="r c-hide">Ordered</span><span class="r c-hide">Accepted</span><span class="r">Value accepted</span><span class="c-hide">Fill rate</span></div>${list.map((p) => `<button class="dg-row" data-act="qcPOSheet" data-po="${esc(p.po)}"><span><div class="strong mono">${platDot(p.platform)}${esc(p.po)}</div><div class="row-sub">${esc(p.platform)} · ${p.deliveredOn ? "delivered " + fmtDate(p.deliveredOn) : p.status === "Cancelled" ? "cancelled " + fmtDate(p.cancelledOn || p.expiry) : "expired " + fmtDate(p.expiry)}</div></span><span class="c-hide">${statusPill(p.status)}</span><span class="r c-hide">${nf(p.pcs)}</span><span class="r c-hide">${nf(p.pcsAccepted)}</span><span class="r strong">${rs(p.valueAccepted)}</span><span class="bar-cell c-hide"><div class="meter ${p.fill < 0.6 ? "bad" : p.fill < 0.85 ? "warn" : ""}"><i style="width:${(p.fill || 0) * 100}%"></i></div><span class="num" style="font-size:13px;min-width:34px;text-align:right">${pct(p.fill || 0, 0)}</span></span></button>`).join("")}</div>`;
}
function qcGrnHtml() {
  const list = D.qcPOs.filter((p) => p.status === "Delivered").sort((a, b) => (a.deliveredOn < b.deliveredOn ? 1 : -1)).slice(0, 8);
  return `<div class="banner info">${ic("info", "sm")}<span>After a delivery, record what the platform accepted at GRN. Good pieces that came back go into QC stock; damaged pieces are written off.</span></div><div><div class="group-label"><span>Latest deliveries</span></div><div class="group">${list.map((p) => `<button class="row" data-act="grnSheet" data-po="${esc(p.po)}"><span class="grow"><div class="row-title mono" style="font-size:14.5px">${platDot(p.platform)}${esc(p.po)}</div><div class="row-sub">Delivered ${fmtDate(p.deliveredOn)} · ${nf(p.pcsDelivered)} pieces sent · ${nf(p.pcsAccepted)} accepted</div></span><span class="row-end">${p.pcsAccepted < p.pcsDelivered ? `<span class="pill warn">${nf(p.pcsDelivered - p.pcsAccepted)} short</span>` : `<span class="pill good">In full</span>`}${ic("chevR", "sm chev")}</span></button>`).join("")}</div></div>`;
}
VIEWS.quick = () => {
  const open = openQC(), tabs = { open: qcOpenHtml, add: qcNewHtml, grn: qcGrnHtml, history: qcHistoryHtml };
  return `<div class="page">
    <div class="page-head"><div><h1 class="title">Quick commerce</h1><div class="subtitle">Swiggy and Zepto purchase orders, from the day they arrive to the GRN.</div></div><div class="head-actions">${S.qcTab === "open" ? seg("qcPlatform", S.qcPlatform, [["Swiggy", "Swiggy", open.filter((p) => p.platform === "Swiggy").length], ["Zepto", "Zepto", open.filter((p) => p.platform === "Zepto").length]]) : ""}</div></div>
    ${seg("qcTab", S.qcTab, [["open", "Open POs"], ["add", S.qcNew && S.qcNew.editPo ? "Edit PO" : "New PO"], ["grn", "GRN"], ["history", "History"]])}
    ${tabs[S.qcTab]()}</div>`;
};
function qcPickTable(Dl, editing) {
  if (isNarrow()) {
    const inp = (r, k, v, max) => `<input class="pick-in" type="number" inputmode="numeric" min="0" max="${max}" step="1" value="${v}" data-sap="${esc(r.sap)}" data-k="${k}" data-in="pickCell" data-was="${v}" aria-label="${esc(shortName(r.name))} from ${k === "q" ? "QC" : "own"} stock">`;
    return `<div class="group">${Dl.rows.map((r) => `<div class="row" style="align-items:flex-start"><span class="grow"><div class="row-title clip">${esc(shortName(r.name))}</div><div class="row-sub">${esc(tropCode(r.sap) || (qcBySap[r.sap] || {}).trop || "")} · ${nf(r.pcs)} pcs · ${r.ppc} per crate${r.notSent > 0 ? ` · <span style="color:var(--warn)">${nf(r.notSent)} not sent</span>` : ""}</div>
      ${editing ? `<div class="qc-ins"><label>QC ${inp(r, "q", r.fromQC, r.qcCr)}<small>of ${r.qcCr}</small></label><label>Own ${inp(r, "o", r.fromOwn, r.ownCr)}<small>of ${r.ownCr}</small></label></div>` : `<div class="row-sub">${r.fromQC} from QC stock${r.fromOwn ? ` · ${r.fromOwn} from own stock` : ""}</div>`}</span>
      <span class="row-end"><span style="text-align:right"><div class="row-value">${r.send}</div><div class="row-sub">crates</div></span></span></div>`).join("")}
      <div class="row"><span class="grow"><b>Total</b></span><span class="row-end"><span class="row-value">${Dl.crates} crates</span></span></div></div>`;
  }
  return `<div class="table-wrap"><table class="t"><thead><tr><th class="sticky-col">Product</th><th class="r">Pieces on POs</th><th class="r">Per crate</th><th class="r">From QC stock</th><th class="r">From own stock</th><th class="r">Crates to send</th></tr></thead><tbody>
    ${Dl.rows.map((r) => `<tr><td class="sticky-col"><div class="clip" style="max-width:240px">${esc(shortName(r.name))}</div><div class="row-sub">${esc(tropCode(r.sap) || (qcBySap[r.sap] || {}).trop || "")}${r.notSent > 0 ? ` · <span style="color:var(--warn)">${nf(r.notSent)} pcs not sent</span>` : ""}</div></td><td class="r">${nf(r.pcs)}</td><td class="r">${r.ppc}</td>
      ${editing ? `<td class="r edit-cell"><input class="pick-in" type="number" inputmode="numeric" min="0" max="${r.qcCr}" step="1" value="${r.fromQC}" data-sap="${esc(r.sap)}" data-k="q" data-in="pickCell" data-was="${esc(r.fromQC)}" aria-label="${esc(shortName(r.name))} from QC stock"><div class="row-sub">of ${r.qcCr}</div></td><td class="r edit-cell"><input class="pick-in" type="number" inputmode="numeric" min="0" max="${r.ownCr}" step="1" value="${r.fromOwn}" data-sap="${esc(r.sap)}" data-k="o" data-in="pickCell" data-was="${esc(r.fromOwn)}" aria-label="${esc(shortName(r.name))} from own stock"><div class="row-sub">of ${r.ownCr}</div></td>`
        : `<td class="r">${r.fromQC || `<span class="dim">–</span>`}</td><td class="r">${r.fromOwn || `<span class="dim">–</span>`}</td>`}
      <td class="r"><b>${r.send}</b></td></tr>`).join("")}
    <tr class="total"><td class="sticky-col">Total</td><td class="r">${nf(Dl.rows.reduce((a, r) => a + r.pcs, 0))}</td><td></td><td class="r">${Dl.rows.reduce((a, r) => a + r.fromQC, 0)}</td><td class="r">${Dl.rows.reduce((a, r) => a + r.fromOwn, 0)}</td><td class="r">${Dl.crates}</td></tr></tbody></table></div>`;
}
function showQCPick(editing) {
  const Dl = qcDelivery(); if (!Dl.rows.length) { toast("Tick at least one open PO first", "info"); return; }
  const to = S.qcPlatform === "Swiggy" ? D.qcPick.swiggyTo : D.qcPick.zeptoTo, ok = !Dl.min || Dl.value >= Dl.min;
  const head = `<div class="card card-pad"><div class="kv"><div><div class="k">Platform</div><div class="v">${platDot(S.qcPlatform)}${esc(S.qcPlatform)}</div></div><div><div class="k">POs</div><div class="v">${Dl.pos.length}</div></div><div><div class="k">Crates</div><div class="v num">${nf(Dl.crates)}</div></div><div><div class="k">Value excl. GST</div><div class="v num">${rs(Dl.value)}</div></div></div><div class="row-sub" style="margin-top:12px">Deliver to ${esc(to)} · POs ${Dl.pos.map((p) => esc(p.po)).join(", ")}</div>${editing ? "" : S.qcLockView && qcLocks().some((l) => l.id === S.qcLockView) ? `<div class="row-sub" style="margin-top:12px">Expected dispatch <b>${esc(dateLong(qcDispatchOn()))}</b>, as sent</div>` : pickDateField("qc-pick-date", qcDispatchOn(), "qcPickDate")}${Dl.min && !ok ? `<div class="banner warn" style="margin-top:12px">${ic("alert", "sm")}<span>Below the ${rs(Dl.min)} minimum for one delivery by ${rs(Dl.min - Dl.value)}.</span></div>` : ""}</div>`;
  const L = Dl.locked;
  if (L && editing) { ACT.qcLockEdit(); return; }
  const lockNote = L ? `<div class="banner tint">${ic("check", "sm")}<span><b>Sent ${esc(fmtDT(L.at))}${L.via === "email" ? " by email" : ""}${L.by ? " · " + esc(L.by) : ""}.</b> These crates are held for this delivery and are not offered on any other pick list or order. To change it, tap Edit: it is unlocked and the stock released until you send it again.</span></div>` : "";
  const note = editing ? `<div class="banner warn">${ic("pencil", "sm")}<span><b>Change the crates to send from each stock.</b> You cannot send more than is in stock. Pieces beyond the PO are not billed.</span></div>` : "";
  const foot = editing
    ? `<button class="btn btn-secondary" data-act="qcPickReset">Use the suggested crates</button><button class="btn btn-secondary" data-act="qcPick">Cancel</button><button class="btn btn-primary" data-act="qcPickSave">${ic("check", "sm")} Save changes</button>`
    : L ? `<button class="btn btn-secondary" data-act="qcLockEdit">${ic("pencil", "sm")} Edit</button><button class="btn btn-secondary" data-act="qcPickExcel">${ic("doc", "sm")} Excel</button><button class="btn btn-secondary" data-act="emailQCPick">${ic("arrowR", "sm")} Email again</button><button class="btn btn-secondary" data-act="qcPickCopy">${ic("copy", "sm")} WhatsApp</button><button class="btn btn-primary" data-act="qcDeliver">${ic("truck", "sm")} Mark delivered</button>`
    : `<button class="btn btn-secondary" data-act="qcPickEdit">${ic("pencil", "sm")} Edit</button><button class="btn btn-secondary" data-act="qcPickExcel">${ic("doc", "sm")} Excel</button><button class="btn btn-secondary" data-act="emailQCPick">${ic("arrowR", "sm")} Email</button><button class="btn btn-secondary" data-act="qcPickCopy">${ic("copy", "sm")} WhatsApp</button><button class="btn btn-secondary" data-act="qcPickSent">${ic("check", "sm")} Mark as sent</button><button class="btn btn-primary" data-act="qcDeliver" ${Dl.crates ? "" : "disabled"}>${ic("truck", "sm")} Mark delivered</button>`;
  openSheet(editing ? `Edit ${esc(S.qcPlatform)} pick list` : `${esc(S.qcPlatform)} pick list for Tropicana${L ? " · sent" : ""}`, `<div id="xfer-confirm"></div>` + lockNote + head + note + qcPickTable(Dl, editing), foot, true);
}
ACT.qcPick = () => { S.qcLockView = null; showQCPick(false); };
ACT.qcPickEdit = () => { if (S.qcLockView && qcLocks().some((l) => l.id === S.qcLockView)) { ACT.qcLockEdit(); return; } S.qcLockView = null; showQCPick(true); };
ACT.qcPickSave = () => {
  const ov = (S.qcOverride[S.qcPlatform] = S.qcOverride[S.qcPlatform] || {}), Dl = qcDelivery(); let n = 0;
  const vals = {}; $$("#sheet input.pick-in").forEach((el) => { (vals[el.dataset.sap] = vals[el.dataset.sap] || {})[el.dataset.k] = Math.max(0, Math.floor(+el.value || 0)); });
  for (const sap in vals) {
    const r = Dl.rows.find((x) => x.sap === sap); if (!r) continue;
    const q = vals[sap].q != null ? vals[sap].q : r.fromQC, o = vals[sap].o != null ? vals[sap].o : r.fromOwn;
    if (q > r.qcCr) { toast(`Only ${r.qcCr} crates of ${shortName(r.name)} in QC stock`, "alert"); return; }
    if (o > r.ownCr) { toast(`Only ${r.ownCr} crates of ${shortName(r.name)} in own stock`, "alert"); return; }
    if (q !== r.fromQC || o !== r.fromOwn) { ov[sap] = { q, o }; n++; }
  }
  render(); showQCPick(false); if (n) toast(`${n} product${n > 1 ? "s" : ""} changed on the pick list`);
};
ACT.qcPickReset = () => { S.qcOverride[S.qcPlatform] = {}; render(); showQCPick(true); };
function qcPickAoa(Dl) {
  const now = NOW(), stampTxt = stampOf(now), to = S.qcPlatform === "Swiggy" ? D.qcPick.swiggyTo : D.qcPick.zeptoTo;
  const aoa = [
    ["PICK LIST FOR TROPICANA LOGISTICS - QC delivery (SahiReach LLP)"],
    ["Platform", S.qcPlatform, "", "Deliver to", to],
    ["POs", Dl.pos.map((p) => p.po).join(", ")],
    ["Expected dispatch date", dmyK(qcDispatchOn())],
    ["Generated", stampTxt],
    [],
    ["Tropicana SKU Code", "Product", "Crates from QC Stock", "Crates from SahiReach Stock", "Total Crates to Pick and Send"],
  ];
  Dl.rows.filter((r) => r.send).forEach((r) => aoa.push([tropCode(r.sap) || (qcBySap[r.sap] || {}).trop || "", r.name, r.fromQC, r.fromOwn, r.send]));
  aoa.push(["", "TOTAL", Dl.rows.reduce((a, r) => a + r.fromQC, 0), Dl.rows.reduce((a, r) => a + r.fromOwn, 0), Dl.crates]);
  return { rows: aoa, cols: [18, 46, 14, 18, 18], stampTxt };
}
ACT.qcPickExcel = async (el) => {
  const Dl = qcDelivery(), A = qcPickAoa(Dl);
  if (await downloadXlsx(el, A.rows, A.cols, `SahiReach ${S.qcPlatform} pick list ${A.stampTxt.replace(":", "")}.xlsx`, "QC Pick List", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }])) {
    logActivity("QC pick list downloaded", S.qcPlatform, `${Dl.pos.length} PO(s), ${Dl.crates} crates`); toast("Excel pick list downloaded", "doc");
  }
};
ACT.qcPickCopy = () => {
  const Dl = qcDelivery(), to = S.qcPlatform === "Swiggy" ? D.qcPick.swiggyTo : D.qcPick.zeptoTo;
  const txt = `SahiReach ${S.qcPlatform} pick list (${fmtDT(NOW())})\nExpected dispatch: ${dateLong(qcDispatchOn())}\nDeliver to: ${to}\nPOs: ${Dl.pos.map((p) => p.po).join(", ")}\n${Dl.crates} crates\n\n` + Dl.rows.filter((r) => r.send).map((r) => `  ${r.send} x ${shortName(r.name)}${tropCode(r.sap) ? " (" + tropCode(r.sap) + ")" : ""}${r.fromOwn ? `  [${r.fromOwn} from own stock]` : ""}`).join("\n");
  copyText(txt, "Pick list copied. Paste it into WhatsApp");
};
ACT.qcDeliverAsk = () => { S.qcLockView = null; const Dl = qcDelivery(); part("qc-confirm", `<div class="confirm" style="margin-top:12px;background:var(--tint-soft);color:var(--tint)"><span><b>Delivered to ${esc(S.qcPlatform)}?</b> ${nf(Dl.crates)} crates come off stock and ${rs(Dl.value)} counts as sales today.</span><span class="hstack gap-8"><button class="btn btn-sm btn-secondary" data-act="qcDeliverNo">Not yet</button><button class="btn btn-sm btn-primary" data-act="qcDeliver">Yes, delivered</button></span></div>`); };
ACT.qcDeliverNo = () => part("qc-confirm", "");
ACT.toggleQC = (el, e) => { if (e.target.closest('[data-act="qcPOSheet"]')) return; S.qcPicked[el.dataset.po] = !S.qcPicked[el.dataset.po]; render(); };
ACT.toggleOwn = () => { S.qcOwn = !S.qcOwn; render(); };
ACT.qcPOSheet = (el) => {
  const p = D.qcPOs.find((x) => x.po === el.dataset.po), lines = qcLinesByPO[p.po] || [];
  openSheet(esc(p.po), `<div class="card card-pad"><div class="hstack gap-8 wrap">${statusPill(p.status)}<span class="pill plain">${platDot(p.platform)}${esc(p.platform)}</span>${p.status === "Open" ? expiryPill(p) : ""}</div><div class="kv" style="margin-top:14px"><div><div class="k">PO date</div><div class="v">${fmtDate(p.date)}</div></div><div><div class="k">Expiry</div><div class="v">${fmtDate(p.expiry)}</div></div><div><div class="k">Pieces ordered</div><div class="v num">${nf(p.pcs)}</div></div><div><div class="k">Value ordered</div><div class="v num">${rs(p.value)}</div></div>${p.status !== "Open" ? `<div><div class="k">Accepted</div><div class="v num">${nf(p.pcsAccepted)} pcs</div></div><div><div class="k">Fill rate</div><div class="v num">${pct(p.fill || 0, 0)}</div></div>` : ""}</div><div class="row-sub" style="margin-top:12px">${esc(p.to || "")}</div></div>
    <div><div class="group-label"><span>${lines.length} lines</span></div><div class="group">${lines.map((l) => `<div class="row"><span class="grow"><div class="row-title clip">${esc(shortName(l.product))}</div><div class="row-sub">${nf(l.pcs)} pieces × ${rs2(l.price)}${l.code ? " · item " + esc(l.code) : ""}${l.status !== "Open" && l.accepted != null ? ` · ${nf(l.accepted)} accepted${l.lapsed ? ", " + nf(l.lapsed) + " not sent" : ""}` : ""}</div></span><span class="row-end"><span class="row-value">${rs(l.value)}</span></span></div>`).join("")}</div></div>
    ${p.edited ? `<div class="row-sub">Edited ${fmtDT(p.edited)}${p.timesEdited > 1 ? ` · ${p.timesEdited} times` : ""}</div>` : ""}
    ${p.status === "Delivered" ? `<div class="banner info">${ic("info", "sm")}<span>Delivered POs keep their lines. To correct what ${esc(p.platform)} accepted, use the GRN tab.</span></div>` : ""}<div id="qcpo-confirm"></div>`,
    p.status === "Open" ? `<button class="btn btn-danger" data-act="qcCancelAsk" data-po="${esc(p.po)}">Cancel PO</button><button class="btn btn-primary" data-act="qcEditPO" data-po="${esc(p.po)}">${ic("pencil", "sm")} Edit PO</button>` : "");
};
ACT.qcDeliver = () => {
  const Dl = qcDelivery(), now = iso(NOW()); if (!Dl.crates) return;
  S.qcDispatchOn = null;
  Dl.rows.forEach((r) => { const qc = qcBySap[r.sap], own = stockBySap[r.sap]; if (qc) { qc.crates -= r.fromQC; qc.ea = qc.crates * (qc.upc || 1); } if (own && r.fromOwn) { own.ea -= r.fromOwn * own.upc; own.crates = own.ea / own.upc; } });
  Dl.pos.forEach((p) => { const sent = (qcLinesByPO[p.po] || []).reduce((a, l) => { const r = Dl.rows.find((x) => x.sap === l.sap), share = r && r.pcs ? Math.min(l.pcs, Math.round((l.pcs / r.pcs) * r.sendPcs)) : 0; l.status = "Delivered"; l.delivered = share; l.accepted = share; l.short = 0; l.lapsed = l.pcs - share; l.valueAccepted = Math.round(share * l.price * 100) / 100; return a + share; }, 0); Object.assign(p, { status: "Delivered", deliveredOn: now, pcsDelivered: sent, pcsAccepted: sent, valueAccepted: (qcLinesByPO[p.po] || []).reduce((a, l) => a + (l.valueAccepted || 0), 0), fill: sent / p.pcs }); delete S.qcPicked[p.po]; });
  S.qcOverride[S.qcPlatform] = {}; closeSheet();
  logActivity("QC delivered", S.qcPlatform, `${Dl.pos.length} PO(s), ${Dl.crates} crates`); render(); toast(`${Dl.crates} crates delivered to ${S.qcPlatform} · ${rs(Dl.pos.reduce((a, p) => a + (p.valueAccepted || 0), 0))} added to sales`, "truck");
};
ACT.qcLapse = () => { const ex = openQC().filter((p) => daysLeft(p) < 0); ex.forEach((p) => { p.status = "Lapsed"; p.pcsDelivered = 0; p.pcsAccepted = 0; p.valueAccepted = 0; p.fill = 0; }); render(); toast(ex.length ? `${ex.length} expired PO${ex.length > 1 ? "s" : ""} lapsed` : "No expired POs to lapse", ex.length ? "check" : "info"); };
ACT.grnSheet = (el) => {
  const p = D.qcPOs.find((x) => x.po === el.dataset.po), lines = (qcLinesByPO[p.po] || []).filter((l) => (l.delivered || 0) > 0);
  openSheet("GRN for " + esc(p.po), `<div class="card card-pad"><div class="kv"><div><div class="k">Delivered</div><div class="v">${fmtDate(p.deliveredOn)}</div></div><div><div class="k">Pieces sent</div><div class="v num">${nf(p.pcsDelivered)}</div></div><div><div class="k">Accepted so far</div><div class="v num">${nf(p.pcsAccepted)}</div></div></div></div>
    <div><div class="group-label"><span>Per product</span><span>accepted · came back good</span></div><div class="group">${lines.map((l, i) => `<div class="row"><span class="grow"><div class="row-title clip">${esc(shortName(l.product))}</div><div class="row-sub">${nf(l.delivered)} pieces delivered</div></span><span class="row-end"><input class="input sm num-in" style="width:76px" type="number" min="0" max="${l.delivered}" value="${l.accepted}" id="grn-a-${i}" aria-label="Accepted"><input class="input sm num-in" style="width:76px" type="number" min="0" value="0" id="grn-b-${i}" aria-label="Came back good"></span></div>`).join("")}</div></div>
    <div class="row-sub">Anything not accepted and not back in good condition is counted as damaged.</div>`, `<button class="btn btn-primary" data-act="grnSave" data-po="${esc(p.po)}">Save GRN</button>`);
};
ACT.grnSave = (el) => {
  const p = D.qcPOs.find((x) => x.po === el.dataset.po), lines = (qcLinesByPO[p.po] || []).filter((l) => (l.delivered || 0) > 0); let acc = 0, back = 0;
  lines.forEach((l, i) => { const a = Math.min(l.delivered, Math.max(0, +$("#grn-a-" + i).value || 0)), b = Math.min(l.delivered - a, Math.max(0, +$("#grn-b-" + i).value || 0)); l.accepted = a; l.short = l.delivered - a; l.valueAccepted = Math.round(a * l.price * 100) / 100; acc += a; back += b; const qc = qcBySap[l.sap]; if (qc && b) { qc.crates += b / (l.ppc || 1); qc.ea = qc.crates * (qc.upc || 1); l.backs = (l.backs || []).concat({ time: iso(NOW()), crates: b / (l.ppc || 1), by: HOST ? ME.name : undefined }); } });
  p.pcsAccepted = acc; p.fill = acc / p.pcs; p.valueAccepted = (qcLinesByPO[p.po] || []).reduce((a, l) => a + (l.valueAccepted || 0), 0);
  logActivity("GRN saved", p.po, `${nf(acc)} accepted, ${nf(back)} back in stock`); closeSheet(); render(); toast("GRN saved");
};

/* ===== SWIGGY / ZEPTO PO ENTRY AND EDITING =====
   Works like a distributor order: search a product, Enter, type the pieces, Enter again and you are back in the
   search for the next line. The same screen edits an open PO. */
const qcPlatPrice = (q, plat) => (q ? (plat === "Swiggy" ? q.swPrice : q.zpPrice) || 0 : 0);
const qcPlatCode = (q, plat) => (q ? (plat === "Swiggy" ? q.swCode : q.zpCode) || "" : "");
function newQCDraft() { const t = NOW(); return { platform: S.qcPlatform || "Swiggy", po: "", date: ymd(t), expiry: ymd(new Date(t.getTime() + 10 * 864e5)), lines: [], q: "", sel: 0, editPo: null }; }
function qcDraft() { return S.qcNew || (S.qcNew = newQCDraft()); }
function qcSearch(q, plat) {
  const words = key(q).split(" ").filter(Boolean); if (!words.length) return [];
  return D.qcStock.filter((x) => words.every((w) => key(x.name + " " + (x.swCode || "") + " " + (x.zpCode || "") + " " + (x.trop || "")).includes(w)))
    .sort((a, b) => (qcPlatPrice(b, plat) > 0) - (qcPlatPrice(a, plat) > 0) || (b.crates || 0) - (a.crates || 0) || a.name.localeCompare(b.name)).slice(0, 12);
}
function qcResults() {
  const n = qcDraft(); if (!n.q) return "";
  const list = qcSearch(n.q, n.platform);
  if (!list.length) return `<div class="results"><div class="empty" style="padding:22px">No quick commerce product matches “${esc(n.q)}”.</div></div>`;
  n.sel = Math.min(n.sel || 0, list.length - 1);
  return `<div class="results" role="listbox">${list.map((x, i) => { const pr = qcPlatPrice(x, n.platform), on = n.lines.find((l) => l.sap === x.sap); return `<button class="res" role="option" aria-selected="${i === n.sel}" data-act="qnAdd" data-sap="${esc(x.sap)}"><span class="stock-badge ${!(x.crates > 0) ? "zero" : ""}">${nf(Math.floor(x.crates || 0))}</span><span class="grow"><div class="row-title">${esc(x.name)}</div><div class="row-sub">${x.ppc || "–"} pieces / crate · ${pr ? rs2(pr) + " / piece last time" : `no ${esc(n.platform)} price yet`}${qcPlatCode(x, n.platform) ? " · item " + esc(qcPlatCode(x, n.platform)) : ""}${on ? ` · <b>already on this PO</b>` : ""}</div></span>${ic("plus", "sm dim")}</button>`; }).join("")}</div><div class="row-sub" style="padding:6px 4px 0">↑ ↓ to choose · Enter to add · then type the pieces and press Enter for the next product</div>`;
}
const qnVal = (l) => (+l.pcs || 0) * (+l.price || 0);
function qcLinesHtml() {
  const n = qcDraft();
  if (!n.lines.length) return `<div class="empty"><div class="big">No lines yet</div>Search above and add each product on the ${esc(n.platform)} PO.</div>`;
  return n.lines.map((l, i) => { const q = qcBySap[l.sap] || {}, ppc = l.ppc || q.ppc || 0, cr = ppc ? (+l.pcs || 0) / ppc : 0, last = qcPlatPrice(q, n.platform); return `<div class="qline ${n.flash === i ? "flash" : ""}" id="qnl-${i}"><span class="line-no">${i + 1}</span>
    <div class="line-name"><span class="line-title">${esc(l.product)}</span>${l.raw ? `<div class="row-sub clip" title="${esc(l.raw)}"><span class="${l.conf === "check" ? "pill warn" : "dim"}" style="${l.conf === "check" ? "height:20px;font-size:11.5px" : ""}">${l.conf === "check" ? "Check: " : "On the PO: "}${esc(l.raw)}</span></div>` : ""}${l.note && l.conf !== "check" ? `<div class="row-sub" style="color:var(--warn)">${esc(l.note)}</div>` : ""}<div class="row-sub" id="qnc-${i}">${ppc ? `${nf(cr, 2)} crate${cr === 1 ? "" : "s"} · ${ppc} pcs / crate` : "pieces per crate not set"} · ${nf(q.crates || 0)} crates in QC stock</div></div>
    <div class="qline-qty"><div class="stepper sm"><button data-act="qnStep" data-i="${i}" data-d="-1" aria-label="Fewer pieces">${ic("minus", "sm")}</button><input id="qnp-${i}" class="qn-pcs" type="number" inputmode="numeric" min="0" value="${l.pcs}" data-in="qnPcs" data-i="${i}" aria-label="Pieces" enterkeyhint="next"><button data-act="qnStep" data-i="${i}" data-d="1" aria-label="More pieces">${ic("plus", "sm")}</button></div><span class="row-sub">pcs</span></div>
    <div class="qline-price"><span class="row-sub">₹</span><input class="input sm num-in qn-price" id="qnr-${i}" type="number" inputmode="decimal" min="0" step="0.01" value="${l.price ? +(+l.price).toFixed(4) : ""}" placeholder="0.00" data-in="qnPrice" data-i="${i}" aria-label="Price per piece excl. GST" title="Price per piece on the PO, excl. GST${last ? ". Last time " + rs2(last) : ""}" enterkeyhint="next"><span class="row-sub">/ pc</span></div>
    <div class="line-val"><div class="row-value" id="qnv-${i}">${rs2(qnVal(l))}</div></div>
    <button class="icon-btn line-rm" data-act="qnRm" data-i="${i}" aria-label="Remove line">${ic("trash", "sm")}</button></div>`; }).join("");
}
function qcNewSum() {
  const n = qcDraft(), pcs = n.lines.reduce((a, l) => a + (+l.pcs || 0), 0), val = n.lines.reduce((a, l) => a + qnVal(l), 0), cr = n.lines.reduce((a, l) => a + (l.ppc ? (+l.pcs || 0) / l.ppc : 0), 0);
  const dup = n.po.trim() && D.qcPOs.some((p) => p.po === n.po.trim() && p.po !== n.editPo), noPrice = n.lines.filter((l) => (+l.pcs || 0) > 0 && !(+l.price > 0)).length, badDate = n.expiry && n.date && n.expiry < n.date;
  const okay = n.lines.some((l) => +l.pcs > 0) && n.po.trim() && !dup && !badDate && n.date && n.expiry;
  return `<div class="card-title">${n.editPo ? "Edited PO" : "PO summary"}</div><div style="margin-top:10px"><div class="sum-row"><span class="muted">Lines</span><span class="num">${n.lines.filter((l) => +l.pcs > 0).length}</span></div><div class="sum-row"><span class="muted">Pieces</span><span class="num">${nf(pcs)}</span></div><div class="sum-row"><span class="muted">About</span><span class="num">${nf(cr, 1)} crates</span></div><div class="sum-row"><span class="muted">Value excl. GST</span><span class="num">${rs2(val)}</span></div><div class="sum-row total"><span>Incl. GST 5%</span><span class="num">${rs2(val * 1.05)}</span></div></div>
    ${dup ? `<div class="line-msg bad" style="margin-top:10px">${ic("alert", "sm")} PO ${esc(n.po.trim())} is already saved.</div>` : ""}${badDate ? `<div class="line-msg bad" style="margin-top:10px">${ic("alert", "sm")} Expiry is before the PO date.</div>` : ""}${noPrice ? `<div class="line-msg warn" style="margin-top:10px">${ic("tag", "sm")} ${noPrice} line${noPrice > 1 ? "s have" : " has"} no price.</div>` : ""}
    <button class="btn btn-primary btn-lg btn-block" style="margin-top:16px" data-act="qcSavePO" ${okay ? "" : "disabled"}>${n.editPo ? "Save changes" : "Save PO"}</button>
    ${n.editPo ? `<button class="btn btn-secondary btn-block" style="margin-top:8px" data-act="qnCancelEdit">Cancel, keep the PO as it was</button>` : n.lines.length ? `<button class="btn btn-secondary btn-block" style="margin-top:8px" data-act="qnClear">Clear</button>` : ""}
    <div class="row-sub" style="margin-top:10px;text-align:center">Stock does not move until the delivery is marked.</div>`;
}
function qcNewHtml() {
  const n = qcDraft();
  return `<div class="split"><div class="stack gap-20">
    ${n.editPo ? `<div class="editing-bar">${ic("pencil", "sm")}<span>Editing <span class="mono">${esc(n.editPo)}</span>. Saving replaces its lines. Pick lists and the truck plan use the new numbers.</span></div>` : ""}
    ${qcReadBanner()}
    ${n.editPo ? "" : dropZone({ input: "qn-pdf", dataIn: "qnPdf", accept: ".pdf,application/pdf", title: "Read the PO from its PDF", sub: "Swiggy or Zepto purchase order: the PO number, dates and every line fill in for you" })}
    <div><div class="group-label"><span>1 · The PO</span></div><div class="card card-pad"><div class="form-grid qn-head">
      <div class="field"><span class="label">Platform</span>${seg("qnPlatform", n.platform, [["Swiggy", "Swiggy"], ["Zepto", "Zepto"]])}</div>
      <div class="field"><label class="label" for="qn-po">PO number</label><input class="input" id="qn-po" placeholder="KCOPO10712" value="${esc(n.po)}" data-in="qnField" data-f="po" autocomplete="off" enterkeyhint="next"></div>
      <div class="field"><label class="label" for="qn-date">PO date</label><input class="input" id="qn-date" type="date" value="${esc(n.date)}" data-in="qnField" data-f="date"></div>
      <div class="field"><label class="label" for="qn-exp">Expiry date</label><input class="input" id="qn-exp" type="date" value="${esc(n.expiry)}" data-in="qnField" data-f="expiry"></div></div></div></div>
    <div><div class="group-label"><span>2 · Lines, exactly as on the PO</span><span>pieces · price per piece excl. GST</span></div>
      <div class="stack gap-10"><div class="prod-search"><div class="search">${ic("search", "sm")}<input class="input" id="qn-q" type="search" placeholder="Add a product. Try berry, or kulfi" value="${esc(n.q)}" data-in="qnQ" autocomplete="off" enterkeyhint="done"></div><div id="qn-results" class="prod-results">${qcResults()}</div></div>
      <div class="group" id="qn-lines">${qcLinesHtml()}</div></div></div>
  </div><div class="sticky"><div class="card card-pad" id="qn-sum">${qcNewSum()}</div></div></div>`;
}
const qnRefreshSum = () => part("qn-sum", qcNewSum());
const qnRefreshLines = () => { part("qn-lines", qcLinesHtml()); qnRefreshSum(); };
IN.qnField = (el) => { qcDraft()[el.dataset.f] = el.value; qnRefreshSum(); };
IN.qnQ = (el) => { const n = qcDraft(); n.q = el.value; n.sel = 0; part("qn-results", qcResults()); };
ACT.qnAdd = (el) => {
  const n = qcDraft(), q = qcBySap[el.dataset.sap]; if (!q) return;
  let i = n.lines.findIndex((l) => l.sap === q.sap);
  if (i < 0) { n.lines.push({ sap: q.sap, product: q.name, pcs: q.ppc || 1, price: qcPlatPrice(q, n.platform), ppc: q.ppc || 0, code: qcPlatCode(q, n.platform), manual: false }); i = n.lines.length - 1; }
  n.q = ""; n.sel = 0; const s = $("#qn-q"); if (s) s.value = ""; part("qn-results", "");
  n.flash = i; qnRefreshLines(); n.flash = null;
  const p = $("#qnp-" + i); if (p) { p.focus(); p.select(); p.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
};
const qnLineUpdate = (i) => {
  const n = qcDraft(), l = n.lines[i]; if (!l) return; const q = qcBySap[l.sap] || {}, cr = l.ppc ? (+l.pcs || 0) / l.ppc : 0;
  const v = $("#qnv-" + i); if (v) v.textContent = rs2(qnVal(l));
  const c = $("#qnc-" + i); if (c) c.textContent = `${l.ppc ? `${nf(cr, 2)} crate${cr === 1 ? "" : "s"} · ${l.ppc} pcs / crate` : "pieces per crate not set"} · ${nf(q.crates || 0)} crates in QC stock`;
  qnRefreshSum();
};
IN.qnPcs = (el) => { const l = qcDraft().lines[+el.dataset.i]; l.pcs = el.value === "" ? "" : Math.max(0, Math.round(+el.value)); qnLineUpdate(+el.dataset.i); };
IN.qnPrice = (el) => { const l = qcDraft().lines[+el.dataset.i]; l.price = el.value === "" ? 0 : Math.max(0, +el.value); l.manual = true; qnLineUpdate(+el.dataset.i); };
ACT.qnStep = (el) => { const i = +el.dataset.i, l = qcDraft().lines[i]; l.pcs = Math.max(0, (+l.pcs || 0) + +el.dataset.d); const p = $("#qnp-" + i); if (p) p.value = l.pcs; qnLineUpdate(i); };
ACT.qnRm = (el) => { qcDraft().lines.splice(+el.dataset.i, 1); qnRefreshLines(); };
ACT.qnClear = () => { S.qcNew = newQCDraft(); render(); };
ACT.qnCancelEdit = () => { S.qcNew = null; S.qcTab = "open"; render(); toast("Edit cancelled, nothing changed", "info"); };
/* platform switch keeps the lines; prices you did not type follow the new platform's last price */
const _seg = ACT.seg;
ACT.seg = (el) => {
  if (el.dataset.name !== "qnPlatform") return _seg(el);
  const n = qcDraft(); n.platform = el.dataset.value;
  n.lines.forEach((l) => { const q = qcBySap[l.sap]; if (!l.manual) l.price = qcPlatPrice(q, n.platform); l.code = qcPlatCode(q, n.platform) || l.code; });
  render();
};
document.addEventListener("keydown", (e) => {
  const t = e.target; if (!t || !t.id) return;
  if (t.id === "qn-q") {
    const items = $$("#qn-results .res"); if (!items.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); const n = qcDraft(); n.sel = Math.max(0, Math.min(items.length - 1, (n.sel || 0) + (e.key === "ArrowDown" ? 1 : -1))); items.forEach((x, i) => x.setAttribute("aria-selected", i === n.sel)); items[n.sel].scrollIntoView({ block: "nearest" }); }
    else if (e.key === "Enter") { e.preventDefault(); const it = items[qcDraft().sel || 0]; if (it) ACT.qnAdd(it); }
  } else if (e.key === "Enter" && (/^qnp-/.test(t.id) || /^qnr-/.test(t.id) || t.id === "qn-po")) { e.preventDefault(); const s = $("#qn-q"); if (s) s.focus(); }
});
ACT.qcSavePO = () => {
  const n = qcDraft(), po = n.po.trim(), lines = n.lines.filter((l) => +l.pcs > 0);
  if (!po || !lines.length) return;
  if (D.qcPOs.some((p) => p.po === po && p.po !== n.editPo)) { toast(`PO ${po} is already saved`, "alert"); return; }
  if (n.expiry < n.date) { toast("Expiry is before the PO date", "alert"); return; }
  const val = lines.reduce((a, l) => a + qnVal(l), 0), now = NOW();
  const head = { po, platform: n.platform, date: n.date + "T00:00", expiry: n.expiry + "T00:00", daysLeft: daysBetween(ymd(now), n.expiry), to: n.platform === "Swiggy" ? D.qcPick.swiggyTo : D.qcPick.zeptoTo, lines: lines.length, pcs: lines.reduce((a, l) => a + +l.pcs, 0), crates: xr(lines.reduce((a, l) => a + (l.ppc ? l.pcs / l.ppc : 0), 0), 2), value: Math.round(val * 100) / 100 };
  const newLines = lines.map((l) => ({ po, product: l.product, sap: l.sap, code: l.code || null, pcs: +l.pcs, price: +l.price || 0, value: Math.round(+l.pcs * (+l.price || 0) * 100) / 100, ppc: l.ppc, status: "Open", delivered: null, accepted: null, short: null, lapsed: null, valueAccepted: 0 }));
  if (n.editPo) {
    const p = D.qcPOs.find((x) => x.po === n.editPo);
    if (!p || p.status !== "Open") { toast("This PO is no longer open, so it cannot be edited", "alert"); S.qcNew = null; S.qcTab = "open"; render(); return; }
    const before = qcLinesByPO[p.po] || [], was = { pcs: p.pcs, value: p.value, lines: p.lines };
    const diff = []; const bS = {}; before.forEach((l) => { bS[l.sap] = (bS[l.sap] || 0) + l.pcs; }); const aS = {}; newLines.forEach((l) => { aS[l.sap] = (aS[l.sap] || 0) + l.pcs; });
    new Set([...Object.keys(bS), ...Object.keys(aS)]).forEach((s) => { if ((bS[s] || 0) !== (aS[s] || 0)) diff.push(`${shortName((qcBySap[s] || {}).name || s).split("(")[0].trim()} ${bS[s] || 0}→${aS[s] || 0}`); });
    if (p.po !== po) { delete qcLinesByPO[p.po]; if (S.qcPicked[p.po]) { delete S.qcPicked[p.po]; S.qcPicked[po] = true; } }
    Object.assign(p, head, { edited: iso(now), timesEdited: (p.timesEdited || 0) + 1 });
    qcLinesByPO[po] = newLines;
    logActivity("QC PO edited", po, `${n.editPo !== po ? "was " + n.editPo + "; " : ""}${diff.length ? diff.slice(0, 6).join(", ") + (diff.length > 6 ? " and more" : "") : "lines unchanged"} · ${nf(was.pcs)}→${nf(head.pcs)} pieces`);
    S.qcPlatform = n.platform; S.qcNew = null; S.qcTab = "open"; render(); toast(`PO ${po} updated`);
    return;
  }
  const p = Object.assign(head, { status: "Open", delivery: null, deliveredOn: null, pcsDelivered: null, pcsAccepted: null, valueAccepted: null, fill: null, back: null, damaged: null });
  D.qcPOs.push(p); qcLinesByPO[po] = newLines;
  S.qcPicked[po] = true; S.qcPlatform = n.platform; S.qcNew = null; S.qcTab = "open";
  logActivity("QC PO saved", po, `${p.platform}, ${p.lines} line(s), ${nf(p.pcs)} pieces`); render(); toast("PO saved as open");
};
ACT.qcEditPO = (el) => {
  const p = D.qcPOs.find((x) => x.po === el.dataset.po); if (!p || p.status !== "Open") return;
  const cur = S.qcNew;
  if (cur && !cur.editPo && cur.lines.length) toast("Your unsaved new PO was put aside to edit this one", "info");
  S.qcNew = { platform: p.platform, po: p.po, date: (p.date || "").slice(0, 10), expiry: (p.expiry || "").slice(0, 10), q: "", sel: 0, editPo: p.po,
    lines: (qcLinesByPO[p.po] || []).map((l) => { const q = qcBySap[l.sap] || {}; return { sap: l.sap, product: l.product, pcs: l.pcs, price: l.price, ppc: l.ppc || q.ppc || 0, code: l.code || "", manual: true }; }) };
  closeSheet(); S.qcTab = "add"; go("quick");
};
ACT.qcCancelAsk = (el) => part("qcpo-confirm", `<div class="confirm" style="margin-top:12px"><span><b>Cancel PO ${esc(el.dataset.po)}?</b> It leaves the open list and is not delivered. You cannot undo this.</span><span class="hstack gap-8"><button class="btn btn-sm btn-secondary" data-act="qcCancelNo">Keep it</button><button class="btn btn-sm btn-danger" data-act="qcCancelPO" data-po="${esc(el.dataset.po)}">Yes, cancel PO</button></span></div>`);
ACT.qcCancelNo = () => part("qcpo-confirm", "");
ACT.qcCancelPO = (el) => {
  const p = D.qcPOs.find((x) => x.po === el.dataset.po); if (!p || p.status !== "Open") return;
  Object.assign(p, { status: "Cancelled", cancelledOn: iso(NOW()), pcsDelivered: 0, pcsAccepted: 0, valueAccepted: 0, fill: 0 });
  (qcLinesByPO[p.po] || []).forEach((l) => { l.status = "Cancelled"; });
  delete S.qcPicked[p.po]; logActivity("QC PO cancelled", p.po, p.platform); closeSheet(); render(); toast(`PO ${p.po} cancelled`);
};

/* ===== READ A SWIGGY (JUPITER KART) OR ZEPTO PO PDF INTO THE PO ENTRY SCREEN =====
   Platform, PO number, PO date and expiry come from the header; each line's pieces and unit base cost from the table.
   Products are found by the platform's item code first (learned from past POs), then the EAN, then the name,
   and the price per piece confirms the match. Nothing is saved until Save PO is pressed. */
const QC_PDF_SWIGGY = /jupiter\s*kart|swiggy|scootsy|instamart/i, QC_PDF_ZEPTO = /zepto|kiranakart/i;
function qcPdfDate(s) {
  if (!s) return "";
  const M = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
  let m = /(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s); if (m) return `${m[1]}-${pad2(+m[2])}-${pad2(+m[3])}`;
  m = /([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/.exec(s); if (m && M[m[1].toLowerCase()]) return `${m[3]}-${pad2(M[m[1].toLowerCase()])}-${pad2(+m[2])}`;
  m = /(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?,?\s+(\d{4})/.exec(s); if (m && M[m[2].toLowerCase()]) return `${m[3]}-${pad2(M[m[2].toLowerCase()])}-${pad2(+m[1])}`;
  m = /(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})/.exec(s); if (m) return `${m[3].length === 2 ? "20" + m[3] : m[3]}-${pad2(+m[2])}-${pad2(+m[1])}`;
  return "";
}
function qcPdfParse(pages) {
  const text = pages.map(pdfLines).flat().join("\n");
  const platform = QC_PDF_ZEPTO.test(text) ? "Zepto" : QC_PDF_SWIGGY.test(text) ? "Swiggy" : null;
  const grab = (re) => { const m = re.exec(text); return m ? m[1].trim() : ""; };
  const DATE = "([A-Za-z]{3}[a-z]*\\.?\\s+\\d{1,2},?\\s+\\d{4}|\\d{4}-\\d{1,2}-\\d{1,2}|\\d{1,2}\\s+[A-Za-z]{3}[a-z]*,?\\s+\\d{4}|\\d{1,2}[-/.]\\d{1,2}[-/.]\\d{2,4})";
  const po = grab(/PO\s*(?:No|Number|#)\.?\s*:?\s*([A-Z0-9][A-Z0-9\/-]{4,})/i);
  const date = qcPdfDate(grab(new RegExp("PO\\s*Date\\s*:?\\s*" + DATE, "i"))), expiry = qcPdfDate(grab(new RegExp("(?:PO\\s*)?Expiry\\s*Date\\s*:?\\s*" + DATE, "i"))), delivery = qcPdfDate(grab(new RegExp("Expected\\s*Delivery\\s*Date\\s*:?\\s*" + DATE, "i")));
  const T = pdfTable(pages), lines = [];
  if (T.header) {
    const H = T.header.map((h) => h.toLowerCase()), col = (re, not) => H.findIndex((h) => re.test(h) && !(not && not.test(h)));
    const iName = H.findIndex((h) => PDF_NAME_H.test(h.replace(/[:]/g, ""))), iCode = col(/item\s*code|material\s*code|article|item\s*id|product\s*code/), iEan = col(/\bean\b|barcode/);
    const iQty = col(/^(qty|quantity|po\s*qty|order\s*qty)/), iPrice = col(/unit\s*base\s*cost|base\s*cost|unit\s*cost|landing\s*(rate|price)|unit\s*price|^rate/, /mrp/), iMrp = col(/mrp/), iTax = col(/taxable/);
    const num = (v) => { const n = +String(v || "").replace(/[^\d.]/g, ""); return isNaN(n) ? null : n; };
    T.rows.forEach((r) => {
      const name = iName >= 0 ? r[iName] : "", qty = iQty >= 0 ? num(r[iQty]) : null; if (!name && !(iCode >= 0 && r[iCode])) return; if (!(qty > 0)) return;
      lines.push({ code: iCode >= 0 ? String(r[iCode] || "").split(" ")[0] : "", ean: iEan >= 0 ? String(r[iEan] || "").replace(/\D/g, "") : "", name: String(name).replace(/\s+/g, " ").trim(), qty: Math.round(qty), price: iPrice >= 0 ? num(r[iPrice]) : null, mrp: iMrp >= 0 ? num(r[iMrp]) : null, taxable: iTax >= 0 ? num(r[iTax]) : null });
    });
  }
  /* prices printed with 2 decimals lose a little: the taxable value ÷ pieces is exact when it agrees */
  lines.forEach((x) => { if (x.taxable > 0 && x.qty > 0) { const p = x.taxable / x.qty; if (!(x.price > 0) || Math.abs(p / x.price - 1) < 0.01) x.price = Math.round(p * 1e6) / 1e6; } });
  return { platform, po, date, expiry, delivery, lines, text };
}
/* the platform's item codes and EANs already known: from the QC products and every PO line saved before */
function qcCodeMaps() {
  const code = { Swiggy: {}, Zepto: {} }, ean = {};
  D.qcStock.forEach((q) => { if (q.swCode) code.Swiggy[String(q.swCode)] = q.sap; if (q.zpCode) code.Zepto[String(q.zpCode)] = q.sap; if (q.ean) ean[String(q.ean)] = q.sap; });
  const plat = {}; D.qcPOs.forEach((p) => { plat[p.po] = p.platform; });
  Object.keys(qcLinesByPO).forEach((po) => (qcLinesByPO[po] || []).forEach((l) => { const pl = plat[po]; if (l.code && pl && code[pl] && !code[pl][String(l.code)] && qcBySap[l.sap]) code[pl][String(l.code)] = l.sap; if (l.ean && !ean[l.ean]) ean[l.ean] = l.sap; }));
  return { code, ean };
}
function qcMatchLine(x, plat, maps) {
  const fits = (sap) => { const q = qcBySap[sap]; return x.price > 0 && [qcPlatPrice(q, plat), qcPlatPrice(q, plat === "Swiggy" ? "Zepto" : "Swiggy")].some((pr) => pr > 0 && Math.abs(x.price / pr - 1) < 0.04); };
  const byCode = x.code && maps.code[plat] && maps.code[plat][x.code]; if (byCode && qcBySap[byCode]) return { sap: byCode, conf: "sure", how: `${plat} code ${x.code}` };
  const byEan = x.ean && maps.ean[x.ean]; if (byEan && qcBySap[byEan]) return { sap: byEan, conf: "sure", how: "EAN" };
  const c = impMatch(x.name, {}).filter((m) => qcBySap[m.sap]), conf = impConf(c);
  if (c.length) {
    const top = c[0], alt = c.slice(0, 5).find((m) => m.score >= 0.45 && fits(m.sap));
    if (alt && alt.sap !== top.sap && !fits(top.sap)) return { sap: alt.sap, conf: "check", how: "name and price", cands: c.slice(0, 6).map((m) => m.sap) };
    if (conf === "sure" || (conf === "check" && fits(top.sap) && top.score >= 0.5)) return { sap: top.sap, conf: fits(top.sap) || !x.price ? "sure" : "check", how: fits(top.sap) ? "name and price" : "name", cands: c.slice(0, 6).map((m) => m.sap) };
    if (conf === "check") return { sap: top.sap, conf: "check", how: "closest name", cands: c.slice(0, 6).map((m) => m.sap) };
  }
  return { sap: null, conf: "none", cands: c.slice(0, 6).map((m) => m.sap) };
}
async function qcLoadPdf(pages, file) {
  const P = qcPdfParse(pages);
  if (!P.platform) throw new Error("This does not look like a Swiggy (Jupiter Kart) or Zepto PO. Distributor orders are read from Orders → Paste or upload order.");
  if (!P.lines.length) throw new Error("No lines with a quantity were found in the PO.");
  const maps = qcCodeMaps(), cur = qcDraft();
  if (cur.editPo) { toast("Finish or cancel the PO you are editing first", "alert"); return; }
  const n = newQCDraft(); Object.assign(n, { platform: P.platform, po: P.po, date: P.date || n.date, expiry: P.expiry || n.expiry, read: { file, delivery: P.delivery, total: P.lines.length, unmatched: [], dup: P.po && D.qcPOs.some((p) => p.po === P.po) } });
  P.lines.forEach((x) => {
    const m = qcMatchLine(x, P.platform, maps), q = m.sap ? qcBySap[m.sap] : null;
    const raw = `${x.code ? x.code + " · " : ""}${x.name} — ${nf(x.qty)} pcs${x.price ? " @ ₹" + x.price : ""}`;
    if (!q) { n.read.unmatched.push({ ...x, raw, cands: m.cands || [] }); return; }
    const last = qcPlatPrice(q, P.platform), note = m.conf === "check" ? `Check: matched by ${m.how}` : x.price && last && Math.abs(x.price / last - 1) > 0.04 ? `Price ₹${x.price} / pc (last time ${rs2(last)})` : "";
    const ex = n.lines.find((l) => l.sap === q.sap); if (ex) { ex.pcs += x.qty; return; }
    n.lines.push({ sap: q.sap, product: q.name, pcs: x.qty, price: x.price != null ? x.price : last, ppc: q.ppc || 0, code: x.code || qcPlatCode(q, P.platform), ean: x.ean || "", manual: true, raw, note, how: m.how, conf: m.conf });
  });
  S.qcNew = n; S.qcPlatform = P.platform; S.qcTab = "add"; closeSheet(); go("quick");
  logActivity("QC PO read from PDF", P.po || file, `${P.platform}: ${n.lines.length} of ${P.lines.length} lines matched`);
}
function qcReadBanner() {
  const n = qcDraft(), R = n.read; if (!R) return "";
  const un = R.unmatched || [], chk = n.lines.filter((l) => l.conf === "check").length;
  return `<div class="banner ${R.dup ? "bad" : un.length || chk ? "warn" : "good"}" style="align-items:flex-start">${ic(R.dup ? "alert" : un.length || chk ? "alert" : "check", "sm")}<span class="grow"><b>Read from ${esc(R.file)}</b> (${esc(n.platform)}): ${n.lines.length} of ${R.total} line${R.total === 1 ? "" : "s"} matched${chk ? `, ${chk} to check (marked below)` : ""}.${R.delivery ? ` Expected delivery ${esc(fmtDate(R.delivery))}.` : ""}
    ${R.dup ? `<br><b>PO ${esc(n.po)} is already in the tool, so it cannot be saved again.</b>` : un.length ? ` <b>${un.length} not matched</b>: choose the product for each, or skip it.` : " Check the pieces and prices, then Save PO."}</span><button class="icon-btn" data-act="qnReadClose" aria-label="Close">${ic("x", "sm")}</button></div>
    ${un.length ? `<div class="group">${un.map((u, i) => `<div class="row" style="flex-wrap:wrap;gap:8px"><span class="grow" style="min-width:200px"><div class="row-title clip">${esc(u.name || u.code)}</div><div class="row-sub">${u.code ? esc(n.platform) + " code " + esc(u.code) + " · " : ""}${nf(u.qty)} pieces${u.price ? " · ₹" + u.price + " / pc" : ""}</div></span><select class="select sm" style="width:auto;max-width:100%" data-in="qnReadPick" data-i="${i}"><option value="">Choose the product…</option>${(u.cands || []).filter((s) => qcBySap[s]).map((s) => `<option value="${esc(s)}">${esc(qcBySap[s].name)}</option>`).join("")}${D.qcStock.filter((q) => !(u.cands || []).includes(q.sap)).sort((a, b) => a.name.localeCompare(b.name)).map((q) => `<option value="${esc(q.sap)}">${esc(q.name)}</option>`).join("")}</select><button class="icon-btn" data-act="qnReadSkip" data-i="${i}" aria-label="Skip this line">${ic("trash", "sm")}</button></div>`).join("")}</div>` : ""}`;
}
IN.qnReadPick = (el) => {
  const n = qcDraft(), u = n.read && n.read.unmatched[+el.dataset.i], q = qcBySap[el.value]; if (!u || !q) return;
  n.lines.push({ sap: q.sap, product: q.name, pcs: u.qty, price: u.price != null ? u.price : qcPlatPrice(q, n.platform), ppc: q.ppc || 0, code: u.code || qcPlatCode(q, n.platform), ean: u.ean || "", manual: true, raw: u.raw, note: "", how: "chosen", conf: "sure" });
  n.read.unmatched.splice(+el.dataset.i, 1); render();
};
ACT.qnReadSkip = (el) => { const n = qcDraft(); n.read.unmatched.splice(+el.dataset.i, 1); render(); };
ACT.qnReadClose = () => { const n = qcDraft(); n.read = null; render(); };
ACT.qcReadPdf = () => { const f = $("#qn-pdf"); if (f) { f.value = ""; f.click(); } };
IN.qnPdf = async (el) => {
  const f = el.files && el.files[0]; if (!f) return;
  const sig = [f.name, f.size, f.lastModified].join("|"); if (S.qnPdfSig === sig && Date.now() - (S.qnPdfAt || 0) < 800) return; S.qnPdfSig = sig; S.qnPdfAt = Date.now();
  toast("Reading the PO…", "doc");
  try { await qcLoadPdf(await pdfPages(await f.arrayBuffer()), f.name); }
  catch (e) { toast((e && e.message) || "That PDF could not be read", "alert"); }
};
/* the item code and EAN of every line saved are remembered, so the next PO from that platform matches by code */
{
  const save = ACT.qcSavePO;
  ACT.qcSavePO = (el, e) => {
    const n = qcDraft(), po = (n.po || "").trim(), plat = n.platform, learn = n.lines.filter((l) => l.sap && (l.code || l.ean)).map((l) => ({ sap: l.sap, code: l.code, ean: l.ean }));
    save(el, e);
    if (!po || !D.qcPOs.some((p) => p.po === po)) return;
    learn.forEach((x) => { const q = qcBySap[x.sap]; if (!q) return; if (x.code && plat === "Swiggy" && !q.swCode) q.swCode = String(x.code); if (x.code && plat === "Zepto" && !q.zpCode) q.zpCode = String(x.code); if (x.ean && !q.ean) q.ean = x.ean; });
    (qcLinesByPO[po] || []).forEach((l) => { const x = learn.find((y) => y.sap === l.sap); if (x && x.ean) l.ean = x.ean; });
  };
}

/* ===== SENT QC PICK LISTS ARE LOCKED AND THEIR STOCK HELD =====
   When a Swiggy / Zepto pick list is emailed or marked as sent, it is frozen exactly as sent. Its POs leave the
   tick list, and the crates it takes (from QC stock and from SahiReach stock) are held: no other pick list, distributor
   order or pick list can use them. Editing the pick list unlocks it and releases the stock; marking it delivered
   moves the stock for real and ends the hold. */
const qcLocks = () => (D.qcPickLocks = D.qcPickLocks || []);
function qcLockOf(po) { return qcLocks().find((l) => l.pos.includes(po)) || null; }
function qcHeld(sap) { let q = 0, o = 0; qcLocks().forEach((l) => l.rows.forEach((r) => { if (r.sap === sap) { q += r.fromQC || 0; o += r.fromOwn || 0; } })); return { q, o }; }
/* crates of SahiReach stock not held for a sent QC pick list (what distributors can still be given) */
const ownHeldEA = (sap) => { const st = stockBySap[sap]; return st && st.upc ? qcHeld(sap).o * st.upc : 0; };
function qcLockDl(L) {
  const pos = L.pos.map((po) => D.qcPOs.find((p) => p.po === po)).filter(Boolean), rows = L.rows.map((r) => ({ ...r }));
  return { pos, rows, crates: rows.reduce((a, r) => a + (r.send || 0), 0), value: rows.reduce((a, r) => a + (r.sendValue || 0), 0), min: L.platform === "Swiggy" ? D.qcPick.minSwiggy : D.qcPick.minZepto, locked: L };
}
function qcDelivery() {
  if (S.qcLockView) { const L = qcLocks().find((x) => x.id === S.qcLockView); if (L) { S.qcPlatform = L.platform; return qcLockDl(L); } S.qcLockView = null; }
  return qcDeliveryLive();
}
function qcLockNow(via, Dl) {
  Dl = Dl || qcDeliveryLive(); if (!Dl.rows.length || !Dl.crates) return null;
  const base = "QCL-" + stamp(NOW()); let id = base, k = 1; while (qcLocks().some((l) => l.id === id)) id = base + "-" + ++k;
  const L = { id, platform: S.qcPlatform, pos: Dl.pos.map((p) => p.po), rows: Dl.rows.map((r) => ({ sap: r.sap, name: r.name, pcs: r.pcs, ppc: r.ppc, full: r.full, qcCr: r.qcCr, ownCr: r.ownCr, fromQC: r.fromQC, fromOwn: r.fromOwn, send: r.send, sendPcs: r.sendPcs, notSent: r.notSent, extra: r.extra, value: r.value, sendValue: r.sendValue, edited: r.edited })), crates: Dl.crates, value: Math.round(Dl.value * 100) / 100, at: iso(NOW()), via, by: ME.name, dispatchOn: typeof qcDispatchOn === "function" ? qcDispatchOn() : null };
  qcLocks().push(L);
  L.pos.forEach((po) => { delete S.qcPicked[po]; }); S.qcOverride[L.platform] = {};
  const hq = L.rows.reduce((a, r) => a + (r.fromQC || 0), 0), ho = L.rows.reduce((a, r) => a + (r.fromOwn || 0), 0);
  logActivity("QC pick list sent", L.pos.join(", "), `${L.platform} · ${nf(L.crates)} crates held (${nf(hq)} QC stock${ho ? ", " + nf(ho) + " SahiReach stock" : ""})${via === "email" ? " · emailed" : " · marked as sent"}`);
  return L;
}
/* a PO on a sent pick list that is no longer open (cancelled, lapsed, delivered elsewhere) releases that pick list */
function qcLocksClean() {
  const L = qcLocks(), keep = L.filter((l) => l.pos.every((po) => { const p = D.qcPOs.find((x) => x.po === po); return p && p.status === "Open"; }));
  if (keep.length !== L.length) { L.filter((l) => !keep.includes(l)).forEach((l) => logActivity("QC pick list released", l.pos.join(", "), "A PO on it is no longer open, so its stock is free again")); D.qcPickLocks = keep; }
}
function qcLocksHtml() {
  const list = qcLocks().filter((l) => l.platform === S.qcPlatform); if (!list.length) return "";
  return `<div><div class="group-label"><span>Pick lists sent · stock held</span><span>${list.length}</span></div><div class="group">${list.map((l) => { const hq = l.rows.reduce((a, r) => a + (r.fromQC || 0), 0), ho = l.rows.reduce((a, r) => a + (r.fromOwn || 0), 0); return `<button class="row" data-act="qcLockOpen" data-id="${esc(l.id)}"><span class="attn-ic tint">${ic("truck")}</span><span class="grow"><div class="row-title mono clip" style="font-size:14.5px">${esc(l.pos.join(", "))}</div><div class="row-sub">Sent ${esc(fmtDT(l.at))}${l.via === "email" ? " by email" : ""} · ${nf(l.crates)} crates held: ${nf(hq)} QC stock${ho ? ` + ${nf(ho)} SahiReach stock` : ""}${l.dispatchOn ? " · dispatch " + esc(fmtDate(l.dispatchOn)) : ""}</div></span><span class="row-end"><span class="pill plain tint">Locked</span>${ic("chevR", "sm chev")}</span></button>`; }).join("")}</div></div>`;
}
ACT.qcLockOpen = (el) => { const L = qcLocks().find((l) => l.id === el.dataset.id); if (!L) return; S.qcLockView = L.id; S.qcPlatform = L.platform; showQCPick(false); };
ACT.qcPickSent = () => {
  const Dl = qcDeliveryLive(); if (!Dl.crates) { toast("Nothing to send on this pick list", "info"); return; }
  const L = qcLockNow("marked", Dl); if (!L) return;
  S.qcLockView = L.id; render(); showQCPick(false); toast(`Pick list locked · ${nf(L.crates)} crates held`, "check");
};
ACT.qcLockEdit = () => {
  const L = qcLocks().find((l) => l.id === S.qcLockView); if (!L) return;
  part("xfer-confirm", `<div class="banner warn" style="flex-wrap:wrap;margin-bottom:12px"><span class="grow" style="min-width:220px">${ic("alert", "sm")} <b>Unlock this pick list to edit it?</b> Its ${nf(L.crates)} held crates are released until you send it again. If Tropicana already has it, send them the new one.</span><span class="hstack gap-8"><button class="btn btn-sm btn-secondary" data-act="xferNo" data-t="xfer-confirm">Keep it locked</button><button class="btn btn-sm btn-primary" data-act="qcLockEditYes">Unlock and edit</button></span></div>`);
  const el = $("#xfer-confirm"); if (el) el.scrollIntoView({ block: "nearest" });
};
ACT.qcLockEditYes = () => {
  const L = qcLocks().find((l) => l.id === S.qcLockView); if (!L) return;
  D.qcPickLocks = qcLocks().filter((l) => l !== L);
  /* back on the tick list exactly as sent: only its POs ticked, its crates as the starting point */
  openQC().filter((p) => p.platform === L.platform).forEach((p) => { delete S.qcPicked[p.po]; }); L.pos.forEach((po) => { S.qcPicked[po] = true; });
  S.qcOverride[L.platform] = {}; L.rows.forEach((r) => { S.qcOverride[L.platform][r.sap] = { q: r.fromQC || 0, o: r.fromOwn || 0 }; });
  S.qcLockView = null; S.qcPlatform = L.platform; S.qcOwn = S.qcOwn || L.rows.some((r) => r.fromOwn > 0);
  logActivity("QC pick list unlocked", L.pos.join(", "), `${L.platform} · ${nf(L.crates)} crates released to edit`);
  render(); showQCPick(true); toast("Unlocked. Its stock is free until you send it again", "info");
};
{
  /* delivering a sent pick list moves exactly what was sent, then the hold ends */
  const deliver = ACT.qcDeliver;
  ACT.qcDeliver = (el, e) => {
    const id = S.qcLockView && qcLocks().some((l) => l.id === S.qcLockView) ? S.qcLockView : null, plat = S.qcPlatform, keep = id ? { ...(S.qcOverride[plat] || {}) } : null;
    deliver(el, e);
    if (id) { D.qcPickLocks = qcLocks().filter((l) => l.id !== id); S.qcOverride[plat] = keep; S.qcLockView = null; render(); }
  };
  /* a PO on a sent pick list cannot be edited or cancelled until that pick list is unlocked */
  ["qcEditPO", "qcCancelAsk"].forEach((a) => { const f = ACT[a]; ACT[a] = (el, e) => { const L = qcLockOf(el && el.dataset && el.dataset.po); if (L) { toast(`PO ${el.dataset.po} is on a pick list that was sent. Open that pick list and tap Edit first.`, "alert"); return; } return f(el, e); }; });
}

/* ===== STOCK ===== */
const cratesOf = (s) => (s.upc ? s.ea / s.upc : s.crates || 0);
function stockRows() {
  const q = key(S.stockQ), cat = S.stockCat, P = pendingEA(), av = (s) => stockSplit(s, P).avail;
  return D.stock.filter((s) => (cat === "All" || (cat === "In stock" ? av(s) > 1e-9 : cat === "Out of stock" ? av(s) <= 1e-9 : cat === "Below reorder" ? (replBySap[s.sap] || {}).belowRop : s.cat === cat)) && (!q || q.split(" ").every((w) => key(s.name + " " + s.trop + " " + s.sap).includes(w))));
}
function ownStockGrid() {
  const P = pendingEA(), X = {}; D.stock.forEach((s) => (X[s.sap] = stockSplit(s, P)));
  const rows = stockRows().sort((a, b) => X[b.sap].cur - X[a.sap].cur || a.name.localeCompare(b.name));
  if (!rows.length) return `<div class="group"><div class="empty"><div class="big">Nothing matches</div>Try another name, code or filter.</div></div>`;
  return `<div class="dg" style="--cols:minmax(0,2fr) 84px 84px 84px 96px minmax(110px,150px) 96px;--cols-sm:minmax(0,1fr) auto"><div class="dg-row dg-head"><span>Product</span><span class="c-hide">Class</span><span class="r c-hide">Current</span><span class="r c-hide">Reserved</span><span class="r">Available</span><span class="c-hide">Days of stock</span><span class="r c-hide">Price / box</span></div>
  ${rows.map((s) => { const r = replBySap[s.sap] || {}, x = X[s.sap], c = x.cr.avail, days = r.perDay > 0 ? Math.max(0, c) / r.perDay : null, low = r.belowRop || (days != null && days < 4); return `<button class="dg-row" data-act="productSheet" data-sap="${esc(s.sap)}"><span><div class="strong clip">${esc(shortName(s.name))}</div><div class="row-sub clip">${s.ea < -1e-9 ? `<span style="color:var(--tint);font-weight:600">${nf(-s.ea / (s.upc || 1), 1)} crates promised from quick commerce stock</span>` : `${esc(s.trop || "No Tropicana code")} · ${esc(s.cat || "")}`}<span class="mob-only"> · at Tropicana ${nf(x.cr.cur, 1)}${x.res > 1e-9 ? ` · <b style="color:var(--warn)">${nf(x.cr.res, 1)} reserved</b>` : ""}</span></div></span><span class="c-hide">${classPill(r.cls)}</span><span class="r c-hide">${nf(x.cr.cur, 1)}</span><span class="r c-hide" ${x.res > 1e-9 ? 'style="color:var(--warn);font-weight:600"' : ""}>${x.res > 1e-9 ? nf(x.cr.res, 1) : `<span class="dim">–</span>`}</span><span class="r strong" ${c <= 1e-9 ? 'style="color:var(--bad)"' : ""}>${nf(Math.max(0, c), 1)}</span><span class="bar-cell c-hide">${days != null ? `<div class="meter ${low ? "bad" : days < 8 ? "warn" : ""}"><i style="width:${Math.min(100, (days / 30) * 100)}%"></i></div><span class="num" style="font-size:13px;min-width:30px;text-align:right">${days.toFixed(0)}d</span>` : `<span class="dim" style="font-size:13px">no recent sales</span>`}</span><span class="r c-hide">${s.price != null ? rs2(s.price) : "–"}</span></button>`; }).join("")}</div>`;
}
function qcStockGrid() {
  const rows = D.qcStock.slice().sort((a, b) => (b.crates || 0) - (a.crates || 0));
  return `<div class="dg" style="--cols:minmax(0,2fr) 76px 80px 84px 96px 100px 100px 100px;--cols-sm:minmax(0,1fr) auto"><div class="dg-row dg-head"><span>Product</span><span class="r c-hide">Current</span><span class="r c-hide">Reserved</span><span class="r">Available</span><span class="r c-hide">On open POs</span><span class="r c-hide">Free after POs</span><span class="r c-hide">Swiggy / piece</span><span class="r c-hide">Zepto / piece</span></div>
  ${rows.map((s) => `<div class="dg-row"><span><div class="strong clip">${esc(shortName(s.name))}</div><div class="row-sub clip">${esc(s.trop || "Not on the Tropicana ledger")} · ${s.ppc || "–"} pieces per crate${(() => { const x = qcSplit(s); return [x.held ? `${nf(x.held)} held for a sent pick list` : "", x.gt > 1e-9 ? `${nf(x.gt, 1)} promised to distributor orders` : ""].filter(Boolean).map((t) => ` · <span style="color:var(--tint);font-weight:600">${t}</span>`).join(""); })()}</div></span>${(() => { const x = qcSplit(s); return `<span class="r c-hide">${nf(x.cur, 1)}</span><span class="r c-hide" ${x.res > 1e-9 ? 'style="color:var(--warn);font-weight:600"' : ""}>${x.res > 1e-9 ? nf(x.res, 1) : `<span class="dim">–</span>`}</span><span class="r strong" ${!(x.avail > 1e-9) ? 'style="color:var(--bad)"' : ""}>${nf(x.avail, 1)}</span>`; })()}<span class="r c-hide">${s.openCrates ? nf(s.openCrates, 1) : `<span class="dim">–</span>`}</span><span class="r c-hide" ${s.free < 0 ? 'style="color:var(--bad);font-weight:600"' : ""}>${s.free != null ? nf(s.free, 1) : "–"}</span><span class="r c-hide">${s.swPrice ? rs2(s.swPrice) : `<span class="dim">–</span>`}</span><span class="r c-hide">${s.zpPrice ? rs2(s.zpPrice) : `<span class="dim">–</span>`}</span></div>`).join("")}</div>`;
}
function missedHtml() {
  const real = D.oos.filter((o) => typeof o.missed === "number" && o.missed > 0), agg = {};
  real.forEach((o) => { const a = (agg[o.sap] = agg[o.sap] || { name: o.product, sap: o.sap, crates: 0, value: 0, times: 0 }); a.crates += o.missed; a.value += typeof o.value === "number" ? o.value : 0; a.times++; });
  const top = Object.values(agg).sort((a, b) => b.crates - a.crates).slice(0, 12), max = top.length ? top[0].crates : 1;
  return `<div class="tiles"><div class="tile"><div class="tile-label">Missed crates, since 8 Oct</div><div class="tile-value">${nf(real.reduce((a, o) => a + o.missed, 0), 1)}</div><div class="tile-sub">${real.length} lines could not be filled</div></div><div class="tile"><div class="tile-label">Missed value</div><div class="tile-value">${rs(real.reduce((a, o) => a + (typeof o.value === "number" ? o.value : 0), 0))}</div><div class="tile-sub">At the distributor rate, excl. GST</div></div><div class="tile"><div class="tile-label">Asked for, not in your range</div><div class="tile-value">${D.oos.filter((o) => typeof o.missed !== "number").length}</div><div class="tile-sub">Requests logged as demand only</div></div></div>
  <div class="grid-2"><div><div class="group-label"><span>Ran out most often</span></div><div class="group">${top.map((a) => `<button class="row" data-act="productSheet" data-sap="${esc(a.sap)}"><span class="grow"><div class="row-title clip">${esc(shortName(a.name))}</div><div class="bar-cell" style="margin-top:5px"><div class="meter warn"><i style="width:${(a.crates / max) * 100}%"></i></div><span class="row-sub nowrap">${a.times} time${a.times > 1 ? "s" : ""}${a.value ? " · " + rs(a.value) : ""}</span></div></span><span class="row-end"><span class="row-value">${nf(a.crates, 1)} crates</span></span></button>`).join("")}</div></div>
  <div><div class="group-label"><span>Most requested, not stocked</span></div><div class="group">${D.demandTop.map((d) => `<div class="row"><span class="avatar soft">${d.rank}</span><span class="grow"><div class="row-title clip">${esc(shortName(d.product))}</div><div class="row-sub">Worth reviewing with Hangyo</div></span><span class="row-end"><span class="pill plain info">${d.times} request${d.times > 1 ? "s" : ""}</span></span></div>`).join("")}</div></div></div>`;
}
VIEWS.stock = () => {
  const own = D.stock, T = stockTotals(own), crates = T.cur, cost = T.vCur, inStock = T.inStock, nPend = pendingOrderCount(), QT = D.qcStock.reduce((a, q) => { const x = qcSplit(q); a.res += x.res; a.avail += x.avail; return a; }, { res: 0, avail: 0 }), low = D.repl.rows.filter((r) => r.belowRop).length;
  const qcCr = D.qcStock.reduce((a, s) => a + (s.crates || 0), 0);
  const cats = ["All", "In stock", "Below reorder", "Out of stock", ...Array.from(new Set(own.map((s) => s.cat).filter(Boolean))).sort()];
  const tab = S.stockTab;
  const body = tab === "own" ? `<div class="hstack gap-12 wrap"><div class="search">${ic("search", "sm")}<input class="input" id="stock-q" type="search" placeholder="Search by name, SAP or Tropicana code" value="${esc(S.stockQ)}" data-in="stockQ" autocomplete="off"></div></div><div class="chips">${cats.map((c) => `<button class="chip" data-act="stockCat" data-cat="${esc(c)}" aria-pressed="${S.stockCat === c}">${esc(c)}</button>`).join("")}</div><div id="stock-grid">${ownStockGrid()}</div>`
    : tab === "qc" ? `<div class="banner info">${ic("info", "sm")}<span>One stock shared by Swiggy and Zepto, in crates. Deliveries take it down, QC purchases add to it.</span></div>${(D.transfers || []).length ? `<button class="row" style="border-radius:var(--r-lg);background:var(--surface)" data-act="xferSheet"><span class="attn-ic ${xferPending().length ? "warn" : "tint"}">${ic("doc")}</span><span class="grow"><div class="row-title">Stock moved between SahiReach and quick commerce</div><div class="row-sub">${xferPending().length ? xferPending().length + " credit note / purchase invoice pending" : "All credit notes and purchase invoices entered"} · ${(D.transfers || []).length} in all</div></span>${ic("chevR", "sm chev")}</button>` : ""}${qcStockGrid()}`
    : tab === "damaged" ? `<div class="group"><div class="empty"><div class="big">No damaged stock</div>Returns marked Damaged wait here until you send them back to Hangyo or claim them.</div></div>`
    : tab === "slow" ? slowHtml()
    : tab === "purchases" ? purchasesHtml() : missedHtml();
  return `<div class="page">
    <div class="page-head"><div><h1 class="title">Stock</h1><div class="subtitle">What is in Tropicana right now, what came in, and what you ran out of.</div></div><div class="head-actions"><button class="btn btn-secondary" data-act="reconSheet">${ic("check", "sm")} Check with Tropicana</button><button class="btn btn-secondary" data-act="stockExcel">${ic("doc", "sm")} Download Excel</button><button class="btn btn-secondary" data-act="stockNewProd">${ic("plus", "sm")} Add product</button><button class="btn btn-primary" data-act="receiveSheet">${ic("plus", "sm")} Receive stock</button></div></div>
    <div class="tiles"><div class="tile"><div class="tile-label">Current stock</div><div class="tile-value">${nf(crates, 0)}<small>crates</small></div><div class="tile-sub">At Tropicana now, SahiReach stock</div></div><div class="tile"><div class="tile-label">Reserved</div><div class="tile-value" ${T.res > 0.05 ? 'style="color:var(--warn)"' : ""}>${nf(T.res, 0)}<small>crates</small></div><div class="tile-sub">${nPend ? `${nPend} order${nPend > 1 ? "s" : ""} not yet dispatched` : "No orders waiting"}${T.held > 0.05 ? ` · ${nf(T.held, 0)} for Swiggy / Zepto` : ""}</div></div><div class="tile"><div class="tile-label">Available for sale</div><div class="tile-value" style="color:var(--good)">${nf(T.avail, 0)}<small>crates</small></div><div class="tile-sub">${inStock} of ${own.length} products can be sold</div></div>${SEE_MONEY ? `<div class="tile"><div class="tile-label">Current stock at cost</div><div class="tile-value">₹${lakh(cost)}<small>L</small></div><div class="tile-sub">₹${lakh(T.vAvail)} L available for sale</div></div>` : ""}<div class="tile"><div class="tile-label">Quick commerce stock</div><div class="tile-value">${nf(qcCr, 0)}<small>crates</small></div><div class="tile-sub">${QT.res > 0.05 ? `${nf(QT.res, 0)} reserved · ${nf(QT.avail, 0)} available` : "Shared by Swiggy and Zepto"}</div></div><button class="tile" data-act="stockLow"><div class="tile-label"><span>Below reorder point</span>${ic("chevR", "sm dim")}</div><div class="tile-value" style="color:var(--bad)">${low}</div><div class="tile-sub">Hero and Core products to reorder</div></button>${(() => { const T = slowSum(slowRows()); return `<button class="tile tile-wide-sm" data-act="slowList"><div class="tile-label"><span>Slow moving</span>${ic("chevR", "sm dim")}</div><div class="tile-value" style="color:var(--warn)">${T.n}</div><div class="tile-sub">${SEE_MONEY ? `₹${lakh(T.value)} L tied up · ` : ""}${nf(T.crates, 0)} crates to push</div></button>`; })()}</div>
    ${(() => { const R = (D.recon || {}).last; if (!R) return ""; const open = R.own.open + R.qcs.open; return `<button class="row" style="border-radius:var(--r-lg);background:var(--surface)" data-act="reconSheet"><span class="attn-ic ${open ? "warn" : "tint"}">${ic(open ? "alert" : "check")}</span><span class="grow"><div class="row-title">Checked with Tropicana's statement for ${esc(fmtDate(R.date || R.asOf))}</div><div class="row-sub">SahiReach ${R.own.match} of ${R.own.n} match · quick commerce ${R.qcs.match} of ${R.qcs.n} match${open ? ` · <b style="color:var(--warn)">${open} to look at</b>` : " · nothing to look at"}${R.ask && R.ask.length ? ` · ${R.ask.length} code${R.ask.length > 1 ? "s" : ""} to link` : ""}</div></span>${ic("chevR", "sm chev")}</button>`; })()}
    ${seg("stockTab", tab, [["own", "Own stock"], ["slow", "Slow moving"], ["qc", "Quick commerce"], ["damaged", "Damaged"], ["purchases", "Purchases"], ["missed", "Missed sales"]])}
    ${body}</div>`;
};
IN.stockQ = (el) => { S.stockQ = el.value; part("stock-grid", ownStockGrid()); };
ACT.stockCat = (el) => { S.stockCat = el.dataset.cat; render(); };
ACT.stockLow = () => { S.stockTab = "own"; S.stockCat = "Below reorder"; render(); };
ACT.productSheet = (el) => {
  const sap = el.dataset.sap, s = stockBySap[sap], c = catBySap[sap] || {}, r = replBySap[sap] || {}, name = (s && s.name) || c.name || sap;
  if (!s) { openSheet(esc(shortName(name)), `<div class="card card-pad"><div class="section-title" style="font-size:19px">${esc(name)}</div><div class="row-sub">${esc(c.cat || "")} · SAP ${esc(sap)}</div><div class="banner warn" style="margin-top:14px">${ic("info", "sm")}<span>You do not stock this product. Requests for it are logged as demand.</span></div></div>${price(sap) != null ? `<div class="card card-pad"><div class="kv"><div><div class="k">Distributor rate</div><div class="v num">${rs2(price(sap))}</div></div>${D.special.prices[sap] != null ? `<div><div class="k">Special price</div><div class="v num">${rs2(D.special.prices[sap])}</div></div>` : ""}${SEE_MONEY ? `<div><div class="k">SS rate</div><div class="v num">${rs2(ssRate(sap))}</div></div>` : ""}<div><div class="k">Pack</div><div class="v">${c.upc || "–"} boxes / crate</div></div></div></div>` : ""}`, `<button class="btn btn-secondary" data-act="productEdit" data-sap="${esc(sap)}">${ic("pencil", "sm")} Edit product</button>`); return; }
  const X = stockSplit(s), cr = X.cr.avail, recent = D.orders.filter((o) => o.status !== "Cancelled").sort((a, b) => (a.time < b.time ? 1 : -1)).flatMap((o) => (linesByOrder[o.id] || []).filter((l) => l.sap === sap)).slice(0, 6);
  openSheet(esc(shortName(name)), `<div class="card card-pad"><div class="section-title" style="font-size:19px">${esc(s.name)}</div><div class="row-sub">${esc(s.cat || "")}</div><div class="hstack gap-8 wrap" style="margin-top:10px">${classPill(r.cls)}${s.tier ? `<span class="pill plain">${esc(s.tier)}</span>` : ""}<span class="pill plain mono">SAP ${esc(s.sap)}</span>${s.trop ? `<span class="pill plain mono">${esc(s.trop)}</span>` : ""}</div>
      <div class="divider" style="margin:16px 0"></div><div class="kv"><div><div class="k">Current stock</div><div class="v num">${nf(X.cr.cur, 2)} crates</div><div class="row-sub">${nf(X.cur)} boxes at Tropicana</div></div><div><div class="k">Reserved</div><div class="v num" ${X.res > 1e-9 ? 'style="color:var(--warn)"' : ""}>${nf(X.cr.res, 2)} crates</div><div class="row-sub">${X.res > 1e-9 ? [X.resOrd > 1e-9 ? `${nf(X.resOrd)} boxes for orders not dispatched` : "", X.held > 1e-9 ? `${nf(X.held)} for a Swiggy / Zepto pick list` : ""].filter(Boolean).join(" · ") : "Nothing blocked"}</div></div><div><div class="k">Available for sale</div><div class="v num" ${cr <= 1e-9 ? 'style="color:var(--bad)"' : 'style="color:var(--good)"'}>${nf(cr, 2)} crates</div><div class="row-sub">${nf(X.avail)} boxes · ${nf(X.avail * (s.ppe || 1))} pieces</div></div><div><div class="k">Pack</div><div class="v">${s.upc} boxes / crate · ${s.ppe} pcs / box</div></div></div></div>
    <div><div class="group-label"><span>Price per box</span></div><div class="card card-pad"><div class="kv"><div><div class="k">MRP</div><div class="v num">${rs2(s.mrp)}</div></div>${SEE_MONEY ? `<div><div class="k">Your cost (SS rate)</div><div class="v num">${rs2(s.cost)}</div></div>` : ""}<div><div class="k">Selling price</div><div class="v num">${rs2(s.price)}</div></div>${D.special.prices[s.sap] != null ? `<div><div class="k">Special price</div><div class="v num" style="color:var(--tint)">${rs2(D.special.prices[s.sap])}</div></div>` : ""}${SEE_MONEY ? `<div><div class="k">Margin</div><div class="v num">${rs2(s.margin)}${s.price ? ` <span class="muted" style="font-weight:500">(${pct(s.margin / s.price, 1)})</span>` : ""}</div></div>` : ""}</div></div></div>
    ${r.sap ? `<div><div class="group-label"><span>Replenishment</span></div><div class="card card-pad"><div class="kv"><div><div class="k">Sells per day</div><div class="v num">${nf(r.perDay, 2)} crates</div></div><div><div class="k">Days of stock</div><div class="v num">${r.perDay > 0 ? (Math.max(0, cr) / r.perDay).toFixed(1) : "–"}</div></div><div><div class="k">Reorder point</div><div class="v num">${nf(r.rop, 1)} crates</div></div><div><div class="k">Target stock</div><div class="v num">${nf(r.target, 1)} crates</div></div><div><div class="k">On order</div><div class="v num">${nf(r.onOrder, 1)} crates</div></div><div><div class="k">Missed, 28 days</div><div class="v num">${nf(r.missed, 1)} crates</div></div></div></div></div>` : ""}
    ${(() => { const w = slowRows().find((x) => x.sap === sap); return w ? `<button class="banner warn" style="text-align:left;width:100%" data-act="slowSheet" data-sap="${esc(sap)}">${ic("info", "sm")}<span><b>Slow moving.</b> ${w.still ? "No sales in the last 4 weeks." : "Stock lasts " + coverTxt(w) + " at the current pace."} Push about ${nf(w.push, 1)} crates. Tap to see who bought it before.</span></button>` : ""; })()}
    ${s.move ? `<div class="banner info">${ic("clock", "sm")}<span><b>Last movement.</b> ${esc(s.move)}</span></div>` : ""}
    ${recent.length ? `<div><div class="group-label"><span>Latest orders with it</span></div><div class="group">${recent.map((l) => { const o = orderById(l.id) || {}; return `<div class="row"><span class="grow"><div class="row-title clip">${esc(o.dist || "")}</div><div class="row-sub">${fmtDate(o.time)}</div></span><span class="row-end"><span class="row-value">${nf(l.crates, 2)} crates</span></span></div>`; }).join("")}</div></div>` : ""}`, `<button class="btn btn-secondary" data-act="itemExcel" data-sap="${esc(sap)}">${ic("doc", "sm")} Item ledger (Excel)</button><button class="btn btn-secondary" data-act="productEdit" data-sap="${esc(sap)}">${ic("pencil", "sm")} Edit product and prices</button>`);
};
ACT.purchaseSheet = (el) => {
  const lines = D.purchases.filter((p) => p.id === el.dataset.id), g = lines[0];
  openSheet(g.inv ? "Invoice " + esc(g.inv) : esc(g.supplier), `<div class="card card-pad"><div class="kv"><div><div class="k">Supplier</div><div class="v">${esc(g.supplier)}</div></div><div><div class="k">Invoice date</div><div class="v">${fmtDate(g.invDate)}</div></div><div><div class="k">Added to</div><div class="v">${esc(g.pool)}</div></div>${SEE_MONEY ? `<div><div class="k">Value excl. GST</div><div class="v num">${rs2(lines.reduce((a, l) => a + (l.value || 0), 0))}</div></div>` : ""}</div><div class="row-sub mono" style="margin-top:12px">${esc(g.id)} · saved ${fmtDT(g.time)}</div></div>
    <div><div class="group-label"><span>${lines.length} lines</span><span>${nf(lines.reduce((a, l) => a + (l.crates || 0), 0), 1)} crates</span></div><div class="group">${lines.map((l) => `<div class="row"><span class="grow"><div class="row-title clip">${esc(shortName(l.product))}</div><div class="row-sub">${nf(l.crates, 2)} crates · ${nf(l.ea)} boxes${SEE_MONEY ? ` × ${rs2(l.rate)}` : ""}${l.batch ? " · batch " + esc(l.batch) : ""}${l.isNew === "Yes" ? " · new SKU" : ""}</div></span>${SEE_MONEY ? `<span class="row-end"><span class="row-value">${rs(l.value)}</span></span>` : ""}</div>`).join("")}</div></div>`);
};
/* the price per box used for a received line: the invoice's own rate when the file had one, else your SS rate */
const recvRate = (l) => (l.fileRate != null ? l.fileRate : ssRate(l.sap) != null ? ssRate(l.sap) : (stockBySap[l.sap] || {}).cost != null ? stockBySap[l.sap].cost : null);
const recvBoxes = (l) => (l.boxes != null ? l.boxes : Math.round(l.crates * (l.upc || 0) * 100) / 100);
function recvTotals() {
  const L = S.recv.lines.filter((l) => l.crates > 0);
  return { n: L.length, crates: L.reduce((a, l) => a + l.crates, 0), boxes: L.reduce((a, l) => a + recvBoxes(l), 0), value: L.reduce((a, l) => a + recvBoxes(l) * (recvRate(l) || 0), 0), noRate: L.filter((l) => recvRate(l) == null).length };
}
function recvSumHtml() {
  const T = recvTotals(), un = (S.recv.unmatched || []).length;
  if (!S.recv.lines.length) return "";
  return `<div class="card card-pad recv-sum"><div class="kv"><div><div class="k">Products</div><div class="v num">${T.n}</div></div><div><div class="k">Total crates</div><div class="v num">${nf(T.crates, 2)}</div></div><div><div class="k">Total boxes</div><div class="v num">${nf(T.boxes)}</div></div>${SEE_MONEY ? `<div><div class="k">Purchase value, excl. GST</div><div class="v num">${rs2(T.value)}</div></div>` : ""}</div>
    ${SEE_MONEY && T.noRate ? `<div class="row-sub" style="margin-top:10px;color:var(--warn)">${T.noRate} product${T.noRate > 1 ? "s have" : " has"} no price yet, so ${T.noRate > 1 ? "they are" : "it is"} not in the value.</div>` : ""}${un ? `<div class="row-sub" style="margin-top:10px;color:var(--warn)">${un} line${un > 1 ? "s" : ""} from the file ${un > 1 ? "are" : "is"} not added yet (see above).</div>` : ""}</div>`;
}
function recvResHtml(q) {
  if (!q || q.length < 2) return "";
  const res = searchProducts(q, 8);
  return `<div class="results">${res.map((x) => x.st ? `<button class="res" data-act="recvAdd" data-sap="${esc(x.c.sap)}"><span class="grow"><div class="row-title clip">${esc(x.c.name)}</div><div class="row-sub">${nf(x.crates, 1)} crates in stock now</div></span>${ic("plus", "sm dim")}</button>` : `<button class="res" data-act="recvNewProd" data-sap="${esc(x.c.sap)}"><span class="grow"><div class="row-title clip">${esc(x.c.name)}</div><div class="row-sub">In the Hangyo list, not one of your products yet · tap to start stocking it</div></span>${ic("plus", "sm dim")}</button>`).join("")}<button class="res" data-act="recvNewProd" data-q="${esc(q)}"><span class="grow"><div class="row-title clip">Add a new product “${esc(q)}”</div><div class="row-sub">Not in the list? Type its details from the invoice</div></span>${ic("plus", "sm dim")}</button></div>`;
}
function recvLineSub(l) {
  const r = recvRate(l), ss = ssRate(l.sap), diff = SEE_MONEY && l.fileRate != null && ss != null && Math.abs(l.fileRate - ss) > Math.max(0.5, ss * 0.01);
  return `${l.upc} boxes per crate · ${nf(recvBoxes(l))} boxes${SEE_MONEY ? ` · ${r != null ? `${rs2(r)} per box${l.fileRate != null ? " (invoice)" : ""} = <b>${rs2(recvBoxes(l) * r)}</b>` : `<span style="color:var(--warn)">no price yet</span>`}${diff ? ` <span class="pill warn" style="height:20px;font-size:11.5px">your SS rate is ${rs2(ss)}</span>` : ""}` : ""}`;
}
function receiveBody() {
  const R = S.recv;
  return `<div class="card card-pad"><div class="form-grid"><div class="field"><label class="label" for="rc-inv">Hangyo invoice number</label><input class="input" id="rc-inv" placeholder="SI0018712" value="${esc(R.inv)}" data-in="recvField" data-f="inv"></div><div class="field"><label class="label" for="rc-date">Invoice date</label><input class="input" id="rc-date" type="date" value="${esc(R.date || iso(NOW()).slice(0, 10))}" data-in="recvField" data-f="date"></div><div class="field full"><label class="label">Add stock to</label>${`<div class="seg"><button data-act="recvPool" data-v="Own Stock" aria-pressed="${R.pool === "Own Stock"}">Own stock</button><button data-act="recvPool" data-v="QC Stock" aria-pressed="${R.pool === "QC Stock"}">Quick commerce stock</button></div>`}</div></div></div>
    ${dropZone({ input: "rc-file", dataIn: "recvFile", accept: ".xlsx,.xls,.csv", title: "Have Hangyo's invoice as Excel?", sub: "Every line is added for you to check. Products are matched by SAP code first, then by name." })}
    <div id="rc-up-msg">${recvUpMsg()}</div>
    <div class="stack gap-10"><div class="search">${ic("search", "sm")}<input class="input" id="rc-q" type="search" placeholder="Add a product from the invoice" value="${esc(R.q)}" data-in="recvQ" autocomplete="off"></div><div id="rc-results">${recvResHtml(R.q)}</div>
    <div class="group">${R.lines.length ? R.lines.map((l, i) => `<div class="row"><span class="grow"><div class="row-title clip">${esc(shortName(l.name))}</div><div class="row-sub">${l.raw ? `<span class="${l.conf === "check" ? "pill warn" : "dim"}" style="${l.conf === "check" ? "height:20px;font-size:11.5px" : ""}">${l.conf === "check" ? "Check: " : "From the file: "}${esc(l.raw)}</span> · ` : ""}<span id="rc-l-${i}">${recvLineSub(l)}</span></div></span><span class="row-end"><input class="input sm num-in" style="width:80px" type="number" min="0" step="any" value="${l.crates}" id="rc-c-${i}" data-in="recvCrates" data-i="${i}" aria-label="Crates"><span class="muted" style="font-size:13px">crates</span><button class="icon-btn" data-act="recvRm" data-i="${i}" aria-label="Remove">${ic("trash", "sm")}</button></span></div>`).join("") : `<div class="empty">Add the products on the invoice. Stock goes up when you save.</div>`}</div><div id="rc-sum">${recvSumHtml()}</div></div>`;
}
const recvFoot = () => `<button class="btn btn-primary" data-act="recvSave">${ic("check", "sm")} Check and save</button>`;
function openRecv() { S.recv.confirm = false; openSheet("Receive stock", receiveBody(), recvFoot()); }
function recvRefresh() { S.recv.confirm = false; part("sheet-body", receiveBody()); part("sheet-foot", recvFoot()); }
ACT.receiveSheet = () => { S.recv = { inv: "", pool: "Own Stock", q: "", lines: [], unmatched: [], file: null }; openRecv(); };
IN.recvField = (el) => { S.recv[el.dataset.f] = el.value; };
IN.recvQ = (el) => { S.recv.q = el.value; part("rc-results", recvResHtml(el.value)); };
IN.recvCrates = (el) => { const i = +el.dataset.i, l = S.recv.lines[i]; l.crates = Math.max(0, +el.value || 0); l.boxes = null; part("rc-l-" + i, recvLineSub(l)); part("rc-sum", recvSumHtml()); if (S.recv.confirm) { S.recv.confirm = false; part("sheet-foot", recvFoot()); } };
ACT.recvPool = (el) => { S.recv.pool = el.dataset.v; recvRefresh(); };
ACT.recvAdd = (el) => { const s = stockBySap[el.dataset.sap]; if (!S.recv.lines.find((l) => l.sap === s.sap)) S.recv.lines.push({ sap: s.sap, name: s.name, upc: s.upc, crates: 1 }); S.recv.q = ""; recvRefresh(); };
ACT.recvRm = (el) => { S.recv.lines.splice(+el.dataset.i, 1); recvRefresh(); };
ACT.recvBack = () => { S.recv.confirm = false; part("sheet-foot", recvFoot()); };
ACT.recvSave = (el) => {
  const R = S.recv, lines = R.lines.filter((l) => l.crates > 0); if (!lines.length) { toast("Add at least one product", "info"); return; }
  if (!(el && el.dataset && el.dataset.sure === "1")) {
    /* show the totals to double-check before anything changes */
    const T = recvTotals(), un = (R.unmatched || []).length; R.confirm = true;
    part("sheet-foot", `<div class="confirm" style="width:100%;flex-wrap:wrap;background:var(--tint-soft);color:var(--tint)"><span class="grow" style="min-width:200px"><b>Add ${nf(T.crates, 2)} crates (${nf(T.boxes)} boxes)${SEE_MONEY ? ` worth ${rs2(T.value)}` : ""} to ${R.pool === "Own Stock" ? "own stock" : "quick commerce stock"}?</b><br><span class="row-sub">${T.n} product${T.n > 1 ? "s" : ""}${R.inv ? " · invoice " + esc(R.inv) : ""}${un ? ` · <span style="color:var(--warn)">${un} line${un > 1 ? "s" : ""} from the file left out</span>` : ""}</span></span><span class="hstack gap-8"><button class="btn btn-sm btn-secondary" data-act="recvBack">Go back</button><button class="btn btn-sm btn-primary" data-act="recvSave" data-sure="1">${ic("check", "sm")} Confirm and save</button></span></div>`);
    return;
  }
  const now = NOW(), id = "PUR-" + stamp(now), invDate = R.date ? R.date + "T00:00" : iso(now);
  lines.forEach((l) => { const s = stockBySap[l.sap], rate = recvRate(l) || 0, ea = recvBoxes(l); if (R.pool === "Own Stock") { s.ea += ea; s.crates = s.ea / s.upc; s.move = `${id}: +${nf(ea)} boxes`; } else if (qcBySap[l.sap]) { qcBySap[l.sap].crates += l.crates; } D.purchases.push({ time: iso(now), id, inv: R.inv, invDate, supplier: "Hangyo", pool: R.pool, product: l.name, sap: l.sap, unit: l.boxes != null ? "EA (Box)" : "Crate", qty: l.boxes != null ? l.boxes : l.crates, ea, crates: l.crates, batch: l.batch || "", rate, value: ea * rate, isNew: "No" }); });
  lines.forEach((l) => { let left = l.crates * l.upc; D.hpoLog.filter((h) => h.sap === l.sap && (R.pool === "Own Stock" ? /own/i.test(h.pool) : /QC/i.test(h.pool)) && (h.status === "Open" || h.status === "Part received")).sort((a, b) => (a.placed > b.placed ? 1 : -1)).forEach((h) => { if (left <= 0) return; const want = Math.max(0, (h.boxes || h.crates * h.upc) - (h.received || 0)), take = Math.min(want, left); h.received = (h.received || 0) + take; left -= take; h.toCome = Math.max(0, h.crates - h.received / (h.upc || 1)); h.status = h.toCome > 1e-9 ? "Part received" : "Received"; h.changed = iso(now); h.receivedOn = iso(now); h.purchases = ((h.purchases ? h.purchases + ", " : "") + id); }); });
  logActivity("Purchase saved", id, `${lines.length} lines into ${R.pool}`); closeSheet(); S.stockTab = "purchases"; render(); toast("Stock received and added"); setTimeout(() => { if (pendingBack().length) ACT.pendingBackSheet({ dataset: { next: 1 } }); else if (backInStock().length) ACT.backInStock(); }, 450);
};

/* ===== REPLENISHMENT ===== */
function replTotals() { const own = D.repl.rows.reduce((a, r) => a + (r.final || 0), 0), qc = D.repl.qcOnTruck || 0; return { own, qc, total: own + qc, value: D.repl.rows.reduce((a, r) => a + (r.final || 0) * (r.upc || 0) * (ssRate(r.sap) || 0), 0) }; }
function truckHtml() {
  const R = D.repl, T = replTotals(), free = R.truck - T.total;
  return `<div class="hstack between wrap gap-12"><div><div class="card-title">This truck</div><div class="row-sub">Hangyo sends a truck from ${R.truck} crates, own stock and quick commerce together</div></div><div class="tile-value">${nf(T.total)}<small>of ${R.truck} crates</small></div></div>
    <div class="truck-bar" style="margin-top:14px"><i class="own" style="width:${(T.own / R.truck) * 100}%"></i><i class="qc" style="width:${(T.qc / R.truck) * 100}%"></i></div>
    <div class="hstack between wrap gap-12" style="margin-top:10px"><div class="legend"><span><i style="background:var(--s-gt)"></i>Own stock ${nf(T.own)}</span><span><i style="background:var(--s-zepto)"></i>Quick commerce ${nf(T.qc)}</span><span>${free >= 0 ? nf(free) + " crates free" : nf(-free) + " over the truck"}</span></div>${SEE_MONEY ? `<div class="row-sub num">${rs(T.value)} at the SS rate</div>` : ""}</div>`;
}
function deltaTag(r) {
  if (!r.delta) return "";
  return r._fixed || (r.yours != null && r.yours !== "")
    ? `<div class="dtag you" title="Plan said ${nf(r.autoFinal)}">you ${r.delta > 0 ? "+" : "−"}${nf(Math.abs(r.delta))}</div>`
    : `<div class="dtag ${r.delta < 0 ? "down" : "up"}" title="Plan said ${nf(r.autoFinal)} before your changes">${r.delta < 0 ? "−" : "+"}${nf(Math.abs(r.delta))} ${r.delta < 0 ? "to make room" : "to fill"}</div>`;
}
function changesHtml() {
  const ch = D.repl.changes; if (!ch) return "";
  const you = ch.youSet.map((s) => replBySap[s]).filter(Boolean), moved = ch.moved.map((s) => replBySap[s]).filter(Boolean).sort((a, b) => a.delta - b.delta);
  const qcYou = ch.qcYou.map((s) => qcBySap[s]).filter(Boolean);
  if (!you.length && !moved.length && !qcYou.length && !ch.qcTotal) return "";
  const item = (name, from, to) => `<li><span class="clip">${esc(shortName(name))}</span><b class="num">${nf(from)} → ${nf(to)}</b><span class="dtag ${to < from ? "down" : "up"}">${to < from ? "−" : "+"}${nf(Math.abs(to - from))}</span></li>`;
  const down = moved.filter((r) => r.delta < 0), up = moved.filter((r) => r.delta > 0), sum = (l) => l.reduce((a, r) => a + r.delta, 0);
  return `<div class="card card-pad changes"><div class="hstack between wrap gap-12"><div><div class="card-title">Your changes and what moved</div><div class="row-sub">Compared with the plan's own numbers before you typed anything. The truck stays at ${nf(D.repl.truck)} crates.</div></div><button class="btn btn-sm btn-secondary" data-act="replFilter" data-f="Changed">Show in the list</button></div>
    <div class="changes-grid">
      ${you.length || qcYou.length || ch.qcTotal ? `<div><div class="k">You set</div><ul>${you.map((r) => item(r.name, r.autoFinal, r.final)).join("")}${qcYou.map((q) => item(q.name + " (Swiggy/Zepto)", q.autoFinal, q.final)).join("")}${ch.qcTotal ? `<li><span>Quick commerce total typed</span><b class="num">${nf(D.repl.qcOnTruck)}</b><span class="dtag ${ch.qcTotal < 0 ? "down" : "up"}">${ch.qcTotal > 0 ? "+" : "−"}${nf(Math.abs(ch.qcTotal))}</span></li>` : ""}</ul></div>` : ""}
      ${down.length ? `<div><div class="k">Reduced to make room · ${nf(-sum(down))} crates</div><ul>${down.map((r) => item(r.name, r.autoFinal, r.final)).join("")}</ul></div>` : ""}
      ${up.length ? `<div><div class="k">Added to fill the truck · ${nf(sum(up))} crates</div><ul>${up.map((r) => item(r.name, r.autoFinal, r.final)).join("")}</ul></div>` : ""}
    </div>${D.repl.over ? `<div class="banner warn" style="margin-top:10px">${ic("alert", "sm")}<span>Your crates are ${nf(D.repl.over)} more than the room on the truck, and nothing else could be reduced.</span></div>` : ""}</div>`;
}
function replRows() {
  const f = S.replFilter;
  return D.repl.rows.filter((r) => f === "All" || (f === "On this truck" ? r.final > 0 : f === "Changed" ? !!r.delta : f === "Below reorder" ? r.belowRop : r.cls === f)).sort((a, b) => (b.final || 0) - (a.final || 0) || (b.perDay || 0) - (a.perDay || 0));
}
function replCount(f) { return D.repl.rows.filter((r) => (f === "On this truck" ? r.final > 0 : f === "Changed" ? !!r.delta : f === "Below reorder" ? r.belowRop : r.cls === f)).length; }
function replGrid() {
  const rows = replRows();
  if (!rows.length) return `<div class="group"><div class="empty">No products in this group.</div></div>`;
  return `<div class="dg" style="--cols:minmax(0,2fr) 84px 76px 70px minmax(100px,130px) 80px 96px 120px;--cols-sm:minmax(0,1fr) 84px"><div class="dg-row dg-head"><span>Product</span><span class="c-hide">Class</span><span class="r c-hide">Sells / day</span><span class="r c-hide" title="Available for sale: current stock less what is reserved">Available</span><span class="c-hide">Days of stock</span><span class="r c-hide">Suggested</span><span class="r">Your crates</span><span class="r c-hide">Final</span></div>
  ${rows.map((r) => { const open = S.replOpen === r.sap, low = r.belowRop; return `<div class="dg-row" style="cursor:pointer" data-act="replToggle" data-sap="${esc(r.sap)}"><span><div class="strong clip">${esc(shortName(r.name))}</div><div class="row-sub clip">${r.runsOut ? `<span style="color:var(--bad);font-weight:600">Runs out ${r.runsOut <= ymd(NOW()) ? "now" : "~" + fmtDate(r.runsOut)}</span>${low ? " · below reorder point" : ""} · ` : ""}${low && !r.runsOut ? `<span style="color:var(--bad);font-weight:600">Below reorder point</span>${r.note && !/^below reorder/i.test(r.note) ? " · " + esc(r.note) : ""}` : r.note ? esc(r.note) : esc(r.cat || "")}</div></span><span class="c-hide">${classPill(r.cls)}</span><span class="r c-hide">${nf(r.perDay, 2)}</span><span class="r c-hide">${nf(r.stock, 1)}</span><span class="bar-cell c-hide">${r.days != null ? `<div class="meter ${low ? "bad" : r.days < 8 ? "warn" : ""}"><i style="width:${Math.min(100, (r.days / 30) * 100)}%"></i></div><span class="num" style="font-size:13px;min-width:30px;text-align:right">${nf(r.days, 0)}d</span>` : `<span class="dim">–</span>`}</span><span class="r c-hide">${nf(r.suggested)}</span><span class="r">${r.same && replBySap[r.same] ? `<span class="pill plain info" title="Counts as ${esc(replBySap[r.same].name)}">Linked</span>` : `<input class="input sm num-in" style="width:76px" type="number" min="0" placeholder="${nf(r.suggested)}" value="${r.yours != null ? r.yours : ""}" id="rp-${esc(r.sap)}" data-in="replYours" data-sap="${esc(r.sap)}" aria-label="Your crates">`}</span><span class="r strong c-hide" id="rf-${esc(r.sap)}">${nf(r.final)}${deltaTag(r)}</span></div>
    ${open ? `<div class="dg-row" style="--cols:1fr;background:var(--surface-2);display:block"><div class="kv"><div><div class="k">Sold, last 14 days</div><div class="v num">${nf(r.s14, 1)} crates</div></div><div><div class="k">Days 15 to 28</div><div class="v num">${nf(r.s28, 1)}</div></div><div><div class="k">Days 29 to 56</div><div class="v num">${nf(r.s56, 1)}</div></div><div><div class="k">Missed, 28 days</div><div class="v num">${nf(r.missed, 1)}</div></div><div><div class="k">Reorder point</div><div class="v num">${nf(r.rop, 1)}</div></div><div><div class="k">Target stock</div><div class="v num">${nf(r.target, 1)}</div></div><div><div class="k">On order</div><div class="v num">${nf(r.onOrder, 1)}</div></div><div><div class="k">After this truck</div><div class="v num">${r.daysAfter != null ? nf(r.daysAfter, 0) + " days" : "–"}</div></div></div>
      <div class="form-grid" style="margin-top:14px;grid-template-columns:repeat(4,minmax(0,1fr))"><div class="field"><label class="label" for="rr-${esc(r.sap)}">Order rule</label><select class="select sm" id="rr-${esc(r.sap)}" data-in="replRule" data-sap="${esc(r.sap)}">${["Auto", "Hero", "Core", "Tail", "Push", "Don't order"].map((x) => `<option ${(r.rule || "Auto") === x ? "selected" : ""}>${x}</option>`).join("")}</select></div><div class="field"><label class="label">Min crates</label><input class="input sm num-in" type="number" min="0" value="${r.min != null ? r.min : ""}" placeholder="–" data-in="replNum" data-repl="1" data-f="min" data-sap="${esc(r.sap)}"></div><div class="field"><label class="label">Max crates</label><input class="input sm num-in" type="number" min="0" value="${r.max != null ? r.max : ""}" placeholder="–" data-in="replNum" data-repl="1" data-f="max" data-sap="${esc(r.sap)}"></div><div class="field"><label class="label">Adjust + / −</label><input class="input sm num-in" type="number" value="${r.adj != null ? r.adj : ""}" placeholder="0" data-in="replNum" data-repl="1" data-f="adj" data-sap="${esc(r.sap)}"></div></div><div class="field" style="margin-top:12px"><label class="label" for="rn-${esc(r.sap)}">Reason / note</label><input class="input sm" id="rn-${esc(r.sap)}" value="${esc(r.reason || "")}" placeholder="Why this rule (optional)" data-in="replNote" data-sap="${esc(r.sap)}"></div>${sameField(r)}${r.note ? `<div class="row-sub" style="margin-top:10px">${esc(r.note)}</div>` : ""}</div>` : ""}`; }).join("")}</div>`;
}
function poLogHtml() {
  const byPO = {}; D.hpoLog.forEach((l) => { const g = (byPO[l.po] = byPO[l.po] || { po: l.po, placed: l.placed, pool: l.pool, lines: [], crates: 0, value: 0, toCome: 0 }); g.lines.push(l); g.crates += l.crates || 0; g.value += l.value || 0; g.toCome += l.toCome || 0; });
  return `<div class="group">${Object.values(byPO).sort((a, b) => (a.placed < b.placed ? 1 : -1)).map((g) => { const cnt = (s) => g.lines.filter((l) => l.status === s).length, open = g.toCome > 0 || cnt("Open") > 0; return `<button class="row" data-act="poSheet" data-po="${esc(g.po)}"><span class="attn-ic ${open ? "info" : "tint"}">${ic(open ? "truck" : "check")}</span><span class="grow"><div class="row-title mono" style="font-size:14.5px">${esc(g.po)}</div><div class="row-sub clip">Placed ${fmtDT(g.placed)} · ${esc(g.pool)} · ${g.lines.length} lines · ${cnt("Received")} received${cnt("Part received") ? ", " + cnt("Part received") + " part" : ""}${cnt("Closed short") ? ", " + cnt("Closed short") + " closed short" : ""}${cnt("Open") ? ", " + cnt("Open") + " still to come" : ""}</div></span><span class="row-end"><span style="text-align:right"><div class="row-value">${nf(g.crates)} crates</div>${SEE_MONEY ? `<div class="row-sub num">${rs(g.value)}</div>` : ""}</span>${ic("chevR", "sm chev")}</span></button>`; }).join("")}</div>`;
}
/* ===== linked products (old pack / old code counted as the one you order) and adding products to the plan ===== */
function sameTargets(r) { return D.repl.rows.filter((x) => x !== r && !x.same && x.sap !== r.sap).sort((a, b) => a.name.localeCompare(b.name)); }
function sameField(r) {
  const fed = D.repl.rows.filter((x) => x.same === r.sap);
  if (fed.length) return `<div class="banner info" style="margin-top:12px">${ic("repeat", "sm")}<span>Also counts ${fed.map((x) => `<b>${esc(shortName(x.name))}</b>`).join(", ")} (same product). To change that, open ${fed.length > 1 ? "those products" : "that product"}.</span></div>`;
  return `<div class="field" style="margin-top:12px"><label class="label" for="rsame-${esc(r.sap)}">Same product as (old pack or old code → the one you order now)</label><select class="select sm" id="rsame-${esc(r.sap)}" data-in="replSame" data-sap="${esc(r.sap)}"><option value="">Not linked: ordered on its own</option>${sameTargets(r).map((x) => `<option value="${esc(x.sap)}" ${r.same === x.sap ? "selected" : ""}>${esc(x.name)} · ${esc(x.sap)}</option>`).join("")}</select><div class="row-sub" style="margin-top:5px">When linked, its sales, missed sales, stock and stock on order count in the chosen product (converted by crate size), and it is not ordered itself.</div></div>`;
}
function setSame(r, target) {
  if (!target) { const was = r.same; r.same = null; if (was) logActivity("Products unlinked", r.sap, shortName(r.name)); return true; }
  const t = replBySap[target];
  if (!t || t === r) { toast("Pick a different product", "alert"); return false; }
  if (t.same) { toast(`${shortName(t.name)} is itself linked to another product. Link to the one you order.`, "alert"); return false; }
  if (D.repl.rows.some((x) => x.same === r.sap)) { toast(`Other products count in ${shortName(r.name)}. Unlink them first.`, "alert"); return false; }
  r.same = target; r.yours = null; logActivity("Products linked", r.sap, `${shortName(r.name)} now counts as ${shortName(t.name)}`); return true;
}
IN.replSame = (el) => { const r = replBySap[el.dataset.sap]; if (setSame(r, el.value)) { render(); toast(el.value ? `Linked: counts as ${shortName(replBySap[el.value].name)}` : "Unlinked, ordered on its own again", "repeat"); } else el.value = r.same || ""; };
function linksHtml() {
  const links = D.repl.rows.filter((r) => r.same && replBySap[r.same]);
  return `<div class="sec-head"><div><div class="section-title">Linked products</div><div class="section-sub">An old pack or old code that is now the same product as another one.</div></div><button class="btn btn-secondary" data-act="linkAsk">${ic("plus", "sm")} Link two products</button></div>
    <div class="group">${links.length ? links.map((r) => { const t = replBySap[r.same], f = r.upc > 0 && t.upc > 0 ? r.upc / t.upc : 1; return `<div class="row"><span class="attn-ic info" style="width:30px;height:30px">${ic("repeat", "sm")}</span><span class="grow"><div class="row-title">${esc(shortName(r.name))} <span class="dim">→</span> ${esc(shortName(t.name))}</div><div class="row-sub">${esc(r.sap)} counts as ${esc(t.sap)}${Math.abs(f - 1) > 1e-6 ? ` · 1 crate = ${nf(f, 2)} of its crates (${r.upc} vs ${t.upc} boxes)` : ""}</div></span><span class="row-end"><button class="btn btn-sm btn-secondary" data-act="unlink" data-sap="${esc(r.sap)}">Unlink</button></span></div>`; }).join("") : `<div class="empty">No products are linked.</div>`}</div>`;
}
ACT.unlink = (el) => { setSame(replBySap[el.dataset.sap], null); render(); toast("Unlinked", "repeat"); };
ACT.linkAsk = () => {
  const opts = (list) => list.map((x) => `<option value="${esc(x.sap)}">${esc(x.name)} · ${esc(x.sap)}</option>`).join("");
  const rows = D.repl.rows.slice().sort((a, b) => a.name.localeCompare(b.name));
  openSheet("Link two products", `<div class="banner info">${ic("info", "sm")}<span>Use this when Hangyo changes a product's pack size or code. The old one's sales and stock then count in the new one, and only the new one is ordered. If the crate size differs, crates are converted.</span></div>
    <div class="card card-pad"><div class="form-grid"><div class="field full"><label class="label" for="lk-old">Old pack or old code</label><select class="select" id="lk-old"><option value="">Choose…</option>${opts(rows.filter((x) => !x.same && !D.repl.rows.some((y) => y.same === x.sap)))}</select></div>
      <div class="field full"><label class="label" for="lk-new">Counts as (the one you order now)</label><select class="select" id="lk-new"><option value="">Choose…</option>${opts(rows.filter((x) => !x.same))}</select></div></div>
      <div class="row-sub" style="margin-top:10px">New product not in the list? Add it first with <b>Add product to plan</b>, or in Setup → Products.</div></div>`,
    `<button class="btn btn-secondary" data-act="closeSheet">Cancel</button><button class="btn btn-primary" data-act="linkDo">${ic("check", "sm")} Link</button>`);
};
ACT.linkDo = () => { const o = $("#lk-old").value, n = $("#lk-new").value; if (!o || !n) { toast("Choose both products", "info"); return; } if (setSame(replBySap[o], n)) { closeSheet(); render(); toast(`Linked: ${shortName(replBySap[o].name)} counts as ${shortName(replBySap[n].name)}`, "repeat"); } };

/* add any product from the price list to the plan (also marks it as stocked, so it can be received) */
ACT.replAdd = () => { S.replAddQ = ""; openSheet("Add product to plan", `<div class="search">${ic("search", "sm")}<input class="input" id="ra-q" type="search" placeholder="Search the Hangyo price list" data-in="replAddQ" autocomplete="off"></div><div id="ra-res" style="margin-top:10px">${replAddRes()}</div><div class="row-sub" style="margin-top:12px">Not in the price list? <button class="btn-plain" style="height:auto;padding:0;font-size:inherit;font-weight:600;color:var(--tint)" data-act="productEdit">Add a new product</button> with its SAP code; once you tick “We stock this product” it appears on the plan.</div>`); setTimeout(() => { const i = $("#ra-q"); if (i) i.focus(); }, 60); };
function replAddRes() {
  const q = key(S.replAddQ || ""); if (q.length < 2) return `<div class="row-sub">Type at least two letters.</div>`;
  const words = q.split(" "), list = D.catalog.filter((c) => c.sap && words.every((w) => key(c.name + " " + c.sap + " " + (c.cat || "")).includes(w))).slice(0, 15);
  if (!list.length) return `<div class="group"><div class="empty">Nothing matches.</div></div>`;
  return `<div class="group">${list.map((c) => { const on = !!replBySap[c.sap]; return `<button class="row" ${on ? "disabled style=\"opacity:.55\"" : `data-act="replAddDo" data-sap="${esc(c.sap)}"`}><span class="grow"><div class="row-title">${esc(c.name)}</div><div class="row-sub">${esc(c.cat || "")} · SAP ${esc(c.sap)} · ${c.upc ? c.upc + " boxes / crate" : "not stocked yet"}${SEE_MONEY && price(c.sap) != null ? " · " + rs2(ssRate(c.sap) || 0) + " SS rate" : ""}</div></span><span class="row-end">${on ? `<span class="pill plain">On the plan</span>` : ic("plus", "sm dim")}</span></button>`; }).join("")}</div>`;
}
IN.replAddQ = (el) => { S.replAddQ = el.value; part("ra-res", replAddRes()); };
ACT.replAddDo = (el) => {
  const sap = el.dataset.sap, c = catBySap[sap]; if (!c) return;
  if (!(c.upc > 0)) {
    const v = $("#ra-upc") ? Math.round(+$("#ra-upc").value) : 0;
    if (!(v > 0)) { openSheet("Boxes per crate", `<div class="card card-pad"><div class="section-title" style="font-size:17px">${esc(c.name)}</div><div class="row-sub" style="margin:4px 0 14px">This product is new to you, so the price list has no crate size for it. How many boxes go in one crate?</div><div class="field"><label class="label" for="ra-upc">Boxes per crate</label><input class="input" id="ra-upc" type="number" inputmode="numeric" min="1" step="1" placeholder="e.g. 6"></div></div>`, `<button class="btn btn-secondary" data-act="replAdd">Back</button><button class="btn btn-primary" data-act="replAddDo" data-sap="${esc(sap)}">${ic("plus", "sm")} Add to plan</button>`); setTimeout(() => { const i = $("#ra-upc"); if (i) i.focus(); }, 60); return; }
    c.upc = v;
  }
  if (!stockBySap[sap]) { const st = { trop: null, name: c.name, sap, cat: c.cat, hsn: null, upc: c.upc, ppe: c.ppe || 1, ea: 0, crates: 0, pcs: 0, mrp: c.mrp, cost: ssRate(sap), price: price(sap), margin: price(sap) != null && ssRate(sap) != null ? Math.round((price(sap) - ssRate(sap)) * 100) / 100 : null, inSK: D.prices[sap] ? "Yes" : "No", updated: iso(NOW()), move: "Added to the replenishment plan", notes: null, tier: null }; D.stock.push(st); stockBySap[sap] = st; c.stocked = 1; }
  syncReplRows(); const r = replBySap[sap]; r.rule = r.rule || "";
  logActivity("Product added to plan", sap, c.name);
  S.replTab = "plan"; S.replFilter = "All"; S.replOpen = sap; closeSheet(); render();
  setTimeout(() => { const inp = $(`#repl-grid input[data-in="replYours"][data-sap="${sap}"]`); if (inp) { inp.scrollIntoView({ block: "center" }); inp.focus(); } }, 350);
  toast("Added. It has no sales yet, so type the crates under “Your crates”", "plus");
};
function rulesHtml() {
  return `${linksHtml()}<div class="sec-head" style="margin-top:8px"><div><div class="section-title">Plan settings</div></div></div><div class="banner info">${ic("info", "sm")}<span>These are the rules the truck plan follows. Change a value and the plan is worked out again straight away.</span></div><div class="group">${D.repl.settings.map((s, i) => { const isP = typeof s.value === "number" && s.value > 0 && s.value <= 1 && /Weight|Hero:|Core:|Service/.test(s.name); const val = typeof s.value === "string" && /^\d{4}-/.test(s.value) ? fmtDate(s.value) + " " + s.value.slice(0, 4) : isP ? Math.round(s.value * 100) + "%" : s.value; return `<div class="row" style="align-items:flex-start"><span class="grow"><div class="row-title">${esc(s.name.replace(/\.\.\./g, "…"))}</div><div class="row-sub" style="max-width:62ch">${esc(s.help)}</div></span><span class="row-end"><input class="input sm num-in" style="width:104px" id="rs-${i}" value="${esc(val)}" aria-label="${esc(s.name)}" data-in="replSetting" data-repl="1" data-i="${i}"></span></div>`; }).join("")}</div>`;
}
VIEWS.replenish = () => {
  recomputeRepl();
  const R = D.repl, dec = R.decision, cls = dec.includes("NOW") ? "bad" : dec.includes("SOON") ? "warn" : "good", word = dec.includes("NOW") ? "Order now" : dec.includes("SOON") ? "Order soon" : "Hold";
  const count = replCount;
  const ovc = overrideCounts(), ovn = ovc.yours + ovc.adj + ovc.qcYours + ovc.qcTotal + ovc.minmax;
  const plan = `${ovn ? `<div class="banner warn" style="align-items:center">${ic("pencil", "sm")}<span class="grow"><b>${ovn} value${ovn > 1 ? "s" : ""} typed over the engine's numbers.</b> ${[ovc.yours ? ovc.yours + " Your crates" : "", ovc.qcYours ? ovc.qcYours + " Swiggy/Zepto crates" : "", ovc.qcTotal ? "QC total" : "", ovc.adj ? ovc.adj + " Adjust" : "", ovc.minmax ? ovc.minmax + " Min/Max" : ""].filter(Boolean).join(" · ")}</span><button class="btn btn-sm btn-secondary" data-act="clearAsk">${ic("undo", "sm")} Clear</button></div>` : ""}<div class="grid-2"><div class="decision ${cls}"><div class="tile-label" style="color:inherit;opacity:.75">The engine says</div><div class="decision-word">${word}</div><div style="font-size:14.5px;max-width:60ch">${esc(R.why)}</div><div class="kv" style="margin-top:10px"><div><div class="k">${dec === "HOLD" ? "Next truck around" : "Order on"}</div><div class="v">${!R.orderBy ? "Not in 60 days" : R.orderBy <= ymd(NOW()) ? "Today" : R.orderBy === addDays(ymd(NOW()), 1) ? "Tomorrow" : fmtDate(R.orderBy)}</div></div><div><div class="k">Run out before the truck</div><div class="v" ${R.runOut ? 'style="color:var(--bad)"' : ""}>${R.runOut} Hero / Core</div></div><div><div class="k">Own sales</div><div class="v num">${nf(R.perDay, 1)} crates / day</div></div><div><div class="k">One truck lasts</div><div class="v num">${R.truckDays} days</div></div></div></div>
      <div class="card card-pad"><div id="truck">${truckHtml()}</div>${dec !== "ORDER NOW" ? `<div class="row-sub" style="margin-top:8px">This is what would go if you ordered today. Hangyo needs ${nf(R.truck)} crates to send a truck.</div>` : ""}<div class="divider" style="margin:16px 0"></div><div class="hstack between gap-12"><div><div class="row-title">Quick commerce crates on this truck</div><div class="row-sub">Hangyo decides this. Leave it empty to use the QC plan of ${nf(R.qcPlan)} crates (<button class="btn-plain" style="height:auto;padding:0;font-size:inherit;font-weight:600;color:var(--tint)" data-act="seg" data-name="replTab" data-value="qc">see Swiggy &amp; Zepto</button>).</div></div><input class="input num-in" style="width:96px" type="number" min="0" id="rp-qc" value="${R.qcCrates != null ? R.qcCrates : ""}" placeholder="${nf(R.qcPlan)}" data-in="replQC" data-repl="1" aria-label="QC crates"></div><div class="row-sub" style="margin-top:12px">Worked out live from today's stock, orders, missed sales and open Hangyo POs · ${fmtTime(REPL_AT)}</div></div></div>
    <div id="repl-changes">${changesHtml()}</div>
    <div class="sec-head"><div><div class="section-title">What goes on the truck</div><div class="section-sub">Type your own crates to override a suggestion. Tap a row to see why and set rules.</div></div></div>
    <div class="chips">${["All", "On this truck", "Changed", "Below reorder", "Hero", "Core", "Tail", "Push", "Don't order"].map((f) => `<button class="chip" data-act="replFilter" data-f="${esc(f)}" aria-pressed="${S.replFilter === f}">${esc(f)}${f !== "All" ? ` <span style="opacity:.6" data-rc="${esc(f)}">${count(f)}</span>` : ""}</button>`).join("")}</div>
    <div id="repl-grid">${replGrid()}</div>`;
  return `<div class="page">
    <div class="page-head"><div><h1 class="title">Replenishment</h1><div class="subtitle">What to order from Hangyo and when, worked out from your sales, missed sales and stock.</div></div><div class="head-actions"><button class="btn btn-secondary" data-act="replAdd">${ic("plus", "sm")} Add product to plan</button><button class="btn btn-secondary" data-act="clearAsk">${ic("undo", "sm")} Clear my changes</button><button class="btn btn-secondary" data-act="planTruck">${ic("cycle", "sm")} Plan the truck</button><button class="btn btn-secondary" data-act="replExcel">${ic("doc", "sm")} Download Excel</button><button class="btn btn-primary" data-act="makePO">${ic("doc", "sm")} Make Hangyo PO</button></div></div>
    ${seg("replTab", S.replTab, [["plan", "Truck plan"], ["qc", "Swiggy & Zepto"], ["orders", "Hangyo POs"], ["rules", "Rules"]])}
    ${S.replTab === "plan" ? plan : S.replTab === "qc" ? qcReplHtml() : S.replTab === "orders" ? poLogHtml() : rulesHtml()}</div>`;
};
ACT.replFilter = (el) => { S.replFilter = el.dataset.f; part("repl-grid", replGrid()); $$('[data-act="replFilter"]').forEach((b) => b.setAttribute("aria-pressed", b.dataset.f === S.replFilter)); };
ACT.replToggle = (el, e) => { if (e.target.closest("input,select,label")) return; S.replOpen = S.replOpen === el.dataset.sap ? null : el.dataset.sap; part("repl-grid", replGrid()); };
/* typing updates the truck at once; the full list is redrawn when you leave the box (so the cursor stays put) */
function replLight() { recomputeRepl(); part("truck", truckHtml()); part("repl-changes", changesHtml()); D.repl.rows.forEach((x) => { const f = $("#rf-" + x.sap); if (f) f.innerHTML = nf(x.final) + deltaTag(x); }); document.querySelectorAll("[data-rc]").forEach((el) => { el.textContent = replCount(el.dataset.rc); }); }
IN.replYours = (el) => { const r = replBySap[el.dataset.sap]; r.yours = el.value === "" ? null : Math.max(0, Math.round(+el.value)); replLight(); };
IN.replQC = (el) => { D.repl.qcCrates = el.value === "" ? null : Math.max(0, Math.round(+el.value || 0)); replLight(); };
IN.replNum = (el) => { const r = replBySap[el.dataset.sap], v = el.value.trim(); r[el.dataset.f] = v === "" ? null : el.dataset.f === "adj" ? Math.round(+v) : Math.max(0, +v); replLight(); };
IN.replNote = (el) => { replBySap[el.dataset.sap].reason = el.value; };
IN.replRule = (el) => { const r = replBySap[el.dataset.sap]; r.rule = el.value === "Auto" ? "" : el.value; logActivity("Order rule changed", r.sap, `${shortName(r.name)}: ${el.value}`); render(); toast(`Rule set to ${el.value}`); };
IN.replSetting = (el) => {
  const s = D.repl.settings[+el.dataset.i], raw = el.value.trim(); if (!s) return;
  if (typeof s.value === "number") { const isP = s.value > 0 && s.value <= 1 && /Weight|Hero:|Core:|Service/.test(s.name); let v = parseFloat(raw.replace("%", "")); if (isNaN(v)) return; if (isP || /%/.test(raw)) v = v / 100; s.value = v; }
  else if (/^\d{4}-/.test(String(s.value))) { const d = toDate(raw.length === 10 ? raw : null); if (d && !isNaN(d)) s.value = ymd(d) + "T00:00"; }
  else s.value = raw;
};
let replRedraw = 0;
document.addEventListener("change", (e) => {
  if (S.route !== "replenish" || !e.target.closest('[data-repl="1"]')) return;
  if (e.target.dataset.in === "replSetting") logActivity("Replenishment rule changed", "", e.target.getAttribute("aria-label") + ": " + e.target.value);
  /* redraw after the click that moved focus has finished, never in the middle of another redraw */
  clearTimeout(replRedraw); replRedraw = setTimeout(() => { if (S.route === "replenish") render(); }, 0);
});
/* what you typed over the engine's own numbers (order rules like Don't order are kept) */
function overrideCounts() {
  const set = (v) => v != null && v !== "";
  return { yours: D.repl.rows.filter((r) => set(r.yours)).length, adj: D.repl.rows.filter((r) => set(r.adj) && +r.adj !== 0).length, qcYours: D.qcStock.filter((q) => set(q.yours)).length, qcTotal: set(D.repl.qcCrates) ? 1 : 0, minmax: D.repl.rows.filter((r) => set(r.min) || set(r.max)).length };
}
function clearOverrides(w) {
  if (w.yours) D.repl.rows.forEach((r) => { r.yours = null; });
  if (w.adj) D.repl.rows.forEach((r) => { r.adj = null; });
  if (w.qcYours) D.qcStock.forEach((q) => { q.yours = null; });
  if (w.qcTotal) D.repl.qcCrates = null;
  if (w.minmax) D.repl.rows.forEach((r) => { r.min = null; r.max = null; });
}
const OV_ITEMS = [["yours", "Your crates", "crates you typed for own stock"], ["qcYours", "Your Swiggy / Zepto crates", "crates you typed on the Swiggy & Zepto tab"], ["qcTotal", "Quick commerce total on the truck", "the total you typed for Hangyo's QC crates"], ["adj", "Adjust + / −", "one-off additions or cuts on a product"], ["minmax", "Min and max crates", "standing limits per product (off unless you tick it)"]];
ACT.clearAsk = () => {
  const c = overrideCounts(), any = OV_ITEMS.some(([k]) => c[k]);
  openSheet("Clear my changes", `<div class="banner info">${ic("info", "sm")}<span>Puts the plan back on the engine's own numbers. Order rules (Hero, Core, Tail, Push, Don't order) and their notes are kept. Placing a Hangyo PO clears the first four by itself.</span></div>
    <div class="group">${OV_ITEMS.map(([k, label, sub]) => `<label class="row" style="cursor:${c[k] ? "pointer" : "default"};opacity:${c[k] ? 1 : 0.5}"><input type="checkbox" id="ov-${k}" ${c[k] && k !== "minmax" ? "checked" : ""} ${c[k] ? "" : "disabled"} style="width:20px;height:20px;accent-color:var(--tint)"><span class="grow"><div class="row-title">${esc(label)}</div><div class="row-sub">${esc(sub)}</div></span><span class="row-end"><span class="pill plain ${c[k] ? "warn" : ""}">${c[k]} set</span></span></label>`).join("")}</div>`,
    `<button class="btn btn-secondary" data-act="closeSheet">Cancel</button><button class="btn btn-primary" data-act="clearDo" ${any ? "" : "disabled"}>${ic("undo", "sm")} Clear selected</button>`);
};
ACT.clearDo = () => {
  const w = {}, c = overrideCounts(); let n = 0; OV_ITEMS.forEach(([k]) => { const el = $("#ov-" + k); if (el && el.checked) { w[k] = true; n += c[k]; } });
  if (!n) { closeSheet(); return; }
  clearOverrides(w); logActivity("Replenishment changes cleared", "", OV_ITEMS.filter(([k]) => w[k]).map(([, l]) => l).join(", "));
  closeSheet(); render(); toast(`${n} change${n > 1 ? "s" : ""} cleared, back on the engine's numbers`, "undo");
};
ACT.planTruck = () => { recomputeRepl(); render(); toast(`Plan worked out again: ${D.repl.decision.toLowerCase()}`, "cycle"); };
const qcPOLines = () => D.qcStock.filter((q) => q.final > 0).sort((a, b) => a.name.localeCompare(b.name));
ACT.makePO = () => {
  recomputeRepl();
  const lines = D.repl.rows.filter((r) => r.final > 0).sort((a, b) => a.name.localeCompare(b.name)), qls = qcPOLines(), T = replTotals();
  const qcCr = qls.reduce((a, q) => a + q.final, 0), qcVal = qls.reduce((a, q) => a + q.final * (q.upc || 0) * (ssRate(q.sap) || 0), 0);
  const tbl = (rows, get) => `<div class="table-wrap"><table class="t"><thead><tr><th>Product</th><th>Type</th><th class="r">Per crate</th><th class="r">Crates</th><th class="r">Boxes</th></tr></thead><tbody>${rows.map((r) => { const c = get(r); return `<tr><td>${esc(shortName(r.name))}<div class="row-sub mono">${esc(r.sap)}</div></td><td>${esc(r.cat || "")}</td><td class="r">${r.upc}</td><td class="r"><b>${nf(c)}</b></td><td class="r">${nf(c * (r.upc || 0))}</td></tr>`; }).join("")}</tbody></table></div>`;
  const typedNote = D.repl.qcCrates != null && D.repl.qcCrates !== "" && +D.repl.qcCrates !== qcCr ? `<div class="banner warn">${ic("alert", "sm")}<span>You typed ${nf(+D.repl.qcCrates)} quick commerce crates for the truck, but the products below add up to ${nf(qcCr)}. Set them per product on the Swiggy &amp; Zepto tab.</span></div>` : "";
  openSheet("Hangyo purchase order", `<div class="card card-pad"><div class="kv"><div><div class="k">Own stock</div><div class="v num">${nf(T.own)} crates</div></div><div><div class="k">Quick commerce</div><div class="v num">${nf(qcCr)} crates</div></div><div><div class="k">Total</div><div class="v num">${nf(T.own + qcCr)} of ${nf(D.repl.truck)}</div></div>${SEE_MONEY ? `<div><div class="k">Value at SS rate</div><div class="v num">${rs(T.value + qcVal)}</div></div>` : ""}</div></div>
    <div class="group-label" style="padding-bottom:0"><span>Own stock · ${lines.length} lines</span></div>${lines.length ? tbl(lines, (r) => r.final) : `<div class="group"><div class="empty">Nothing for own stock.</div></div>`}
    <div class="group-label" style="padding-bottom:0"><span>Quick commerce stock · ${qls.length} lines</span></div>${typedNote}${qls.length ? tbl(qls, (q) => q.final) : `<div class="group"><div class="empty">Nothing for Swiggy / Zepto.</div></div>`}
    <div class="row-sub">The Hangyo portal takes boxes. Place the order there, then mark it as placed so the next plan does not order it twice.</div>`,
    `<button class="btn btn-secondary" data-act="hpoPdf">${ic("doc", "sm")} PDF</button><button class="btn btn-secondary" data-act="replExcel">${ic("doc", "sm")} Excel</button><button class="btn btn-secondary" data-act="copyPO">${ic("copy", "sm")} Copy lines</button><button class="btn btn-primary" data-act="placePO">Mark PO as placed</button>`, true);
};
ACT.copyPO = () => copyText(["OWN STOCK"].concat(D.repl.rows.filter((r) => r.final > 0).map((r) => `${r.name}\t${r.final} crates\t${r.final * (r.upc || 0)} boxes`), ["", "QUICK COMMERCE STOCK"], qcPOLines().map((q) => `${q.name}\t${q.final} crates\t${q.final * (q.upc || 0)} boxes`)).join("\n"), "PO lines copied");
ACT.placePO = () => {
  recomputeRepl();
  const now = NOW(), po = "HPO-" + stamp(now), push = (r, pool) => D.hpoLog.push({ placed: iso(now), po, pool, product: r.name, sap: r.sap, upc: r.upc, crates: r.final, boxes: r.final * (r.upc || 0), status: "Open", value: r.final * (r.upc || 0) * (ssRate(r.sap) || 0), received: 0, toCome: r.final });
  const own = D.repl.rows.filter((r) => r.final > 0), qc = qcPOLines();
  if (!own.length && !qc.length) { toast("Nothing on the plan to order", "info"); return; }
  own.forEach((r) => push(r, "Own stock")); qc.forEach((q) => push(q, "QC stock"));
  logActivity("Hangyo PO placed", po, `Own ${nf(own.reduce((a, r) => a + r.final, 0))} crates, QC ${nf(qc.reduce((a, q) => a + q.final, 0))} crates`);
  clearOverrides({ yours: true, qcYours: true, qcTotal: true, adj: true });
  S.replTab = "orders"; render(); ACT.poSheet({ dataset: { po } }); toast("PO marked as placed. Download its PDF here.");
};
function qcReplHtml() {
  const rows = D.qcStock.slice().sort((a, b) => (b.final || 0) - (a.final || 0) || (b.perDay || 0) - (a.perDay || 0)), tot = rows.reduce((a, q) => a + (q.final || 0), 0);
  const typed = D.repl.qcCrates != null && D.repl.qcCrates !== "";
  const qov = D.qcStock.filter((q) => q.yours != null && q.yours !== "").length + (typed ? 1 : 0);
  return `${qov ? `<div class="banner warn" style="align-items:center">${ic("pencil", "sm")}<span class="grow"><b>${qov} value${qov > 1 ? "s" : ""} typed over the QC plan.</b></span><button class="btn btn-sm btn-secondary" data-act="clearAsk">${ic("undo", "sm")} Clear</button></div>` : ""}<div class="banner info">${ic("info", "sm")}<span><b>Stock for Swiggy and Zepto, kept apart from your own stock.</b> Suggested crates = what Swiggy and Zepto ordered per day over the last 28 days × (${replCfg().lead} days lead time + ${D.repl.truckDays} days one truck lasts + ${replCfg().qcSafety} extra days), plus what open POs still need, minus QC stock and crates already on order. Type your own number to override.</span></div>
    <div class="tiles tiles-4"><div class="tile"><div class="tile-label">On this truck</div><div class="tile-value" id="qc-total">${nf(typed ? +D.repl.qcCrates : tot)}<small>crates</small></div><div class="tile-sub">${typed ? `You typed the total on the Truck plan tab; products add up to ${nf(tot)}` : "Sum of the final crates below"}</div></div>
      <div class="tile"><div class="tile-label">QC sales</div><div class="tile-value">${nf(D.repl.qcPerDay, 1)}<small>crates / day</small></div><div class="tile-sub">From Swiggy and Zepto POs, last 28 days</div></div>
      <div class="tile"><div class="tile-label">QC stock now</div><div class="tile-value">${nf(rows.reduce((a, q) => a + (q.crates || 0), 0))}<small>crates</small></div><div class="tile-sub">${nf(rows.reduce((a, q) => a + (q.openCrates || 0), 0), 1)} crates needed by open POs</div></div>
      <div class="tile"><div class="tile-label">Running short</div><div class="tile-value">${rows.filter((q) => q.perDay > 0 && q.daysAfter != null && q.daysAfter < replCfg().lead + D.repl.truckDays).length}<small>products</small></div><div class="tile-sub">Will not last until the next truck</div></div></div>
    <div class="dg" style="--cols:minmax(0,2fr) 76px 84px 76px 92px 84px 96px 70px;--cols-sm:minmax(0,1fr) 84px"><div class="dg-row dg-head"><span>Product</span><span class="r c-hide">QC stock</span><span class="r c-hide">On open POs</span><span class="r c-hide">Sells / day</span><span class="r c-hide">Days after POs</span><span class="r c-hide">Suggested</span><span class="r">Your crates</span><span class="r c-hide">Final</span></div>
    ${rows.map((q) => { const short = q.perDay > 0 && q.daysAfter != null && q.daysAfter < replCfg().lead + D.repl.truckDays; return `<div class="dg-row"><span><div class="strong clip">${esc(shortName(q.name))}</div><div class="row-sub clip">${short ? `<span style="color:var(--bad);font-weight:600">Short before the next truck</span> · ` : ""}${q.ppc || "–"} pcs / crate${q.onOrder ? ` · ${nf(q.onOrder, 1)} on order` : ""}</div></span><span class="r c-hide">${nf(q.crates || 0, 1)}</span><span class="r c-hide">${q.openCrates ? nf(q.openCrates, 1) : `<span class="dim">–</span>`}</span><span class="r c-hide">${q.perDay ? nf(q.perDay, 2) : `<span class="dim">–</span>`}</span><span class="r c-hide" ${short ? 'style="color:var(--bad);font-weight:600"' : ""}>${q.daysAfter == null ? "–" : q.daysAfter < 0 ? "0" : nf(q.daysAfter, 1)}</span><span class="r c-hide">${nf(q.suggested || 0)}</span><span class="r"><input class="input sm num-in" style="width:72px" type="number" min="0" value="${q.yours != null && q.yours !== "" ? q.yours : ""}" placeholder="${nf(q.suggested || 0)}" data-in="qcYours" data-repl="1" data-sap="${esc(q.sap)}" aria-label="Your QC crates for ${esc(shortName(q.name))}"></span><span class="r strong c-hide" id="qf-${esc(q.sap)}">${nf(q.final || 0)}${q.delta ? `<div class="dtag you">you ${q.delta > 0 ? "+" : "−"}${nf(Math.abs(q.delta))}</div>` : ""}</span></div>`; }).join("")}
    <div class="dg-row" style="font-weight:700"><span>Total</span><span class="r c-hide">${nf(rows.reduce((a, q) => a + (q.crates || 0), 0))}</span><span class="r c-hide">${nf(rows.reduce((a, q) => a + (q.openCrates || 0), 0), 1)}</span><span class="r c-hide">${nf(D.repl.qcPerDay, 2)}</span><span class="c-hide"></span><span class="r c-hide">${nf(rows.reduce((a, q) => a + (q.suggested || 0), 0))}</span><span></span><span class="r c-hide" id="qf-total">${nf(tot)}</span></div></div>`;
}
IN.qcYours = (el) => { const q = qcBySap[el.dataset.sap]; q.yours = el.value === "" ? null : Math.max(0, Math.round(+el.value)); recomputeRepl(); const f = $("#qf-" + q.sap); if (f) f.textContent = nf(q.final); const tt = $("#qf-total"); if (tt) tt.textContent = nf(D.qcStock.reduce((a, x) => a + (x.final || 0), 0)); };
ACT.poSheet = (el) => {
  const lines = D.hpoLog.filter((l) => l.po === el.dataset.po), g = lines[0];
  openSheet(esc(g.po), `<div class="card card-pad"><div class="kv"><div><div class="k">Placed</div><div class="v">${fmtDT(g.placed)}</div></div><div><div class="k">Stock pool</div><div class="v">${esc(g.pool)}</div></div><div><div class="k">Crates</div><div class="v num">${nf(lines.reduce((a, l) => a + (l.crates || 0), 0))}</div></div>${SEE_MONEY ? `<div><div class="k">Value at SS rate</div><div class="v num">${rs(lines.reduce((a, l) => a + (l.value || 0), 0))}</div></div>` : ""}</div></div>
    <div class="group">${lines.map((l) => `<div class="row"><span class="grow"><div class="row-title clip">${esc(shortName(l.product))}</div><div class="row-sub">${nf(l.crates)} crates · ${nf(l.boxes)} boxes${l.received ? " · " + nf(l.received) + " boxes received" : ""}${l.notes ? " · " + esc(l.notes) : ""}</div></span><span class="row-end">${statusPill(l.status)}</span></div>`).join("")}</div>`, `<button class="btn btn-secondary" data-act="closeSheet">Close</button><button class="btn btn-primary" data-act="hpoPdf" data-po="${esc(g.po)}">${ic("doc", "sm")} Download PDF</button>`);
};

/* ===== SLOW-MOVING STOCK (own stock to push) ===== */
const SLOW_STEPS = [30, 45, 60, 90];
const slowCfg = () => (D.slow = D.slow || { days: 45 });
/* Every own-stock product that is sitting: no sales in 4 weeks, or more stock than sells in the chosen number of days. */
function slowRows() {
  const days = +slowCfg().days || 45, today = ymd(NOW()), d28 = ymd(new Date(NOW() - 27 * 864e5)), d90 = ymd(new Date(NOW() - 89 * 864e5));
  const facts = salesFacts().filter((f) => f.ch === "gt" && f.sap && f.crates > 0 && (f.kind === "order" || f.kind === "vyapar") && f.date <= today);
  const by = {};
  facts.forEach((f) => {
    const a = (by[f.sap] = by[f.sap] || { s28: 0, last: "", buyers: {} });
    if (f.date >= d28) a.s28 += f.crates;
    if (f.date > a.last) a.last = f.date;
    if (f.date >= d90 && f.dist) { const b = (a.buyers[f.dist] = a.buyers[f.dist] || { name: f.dist, crates: 0, last: "" }); b.crates += f.crates; if (f.date > b.last) b.last = f.date; }
  });
  const recv = {}; D.purchases.forEach((p) => { if (p.pool === "Own Stock" && p.sap && (p.ea || 0) > 0) { const d = (p.invDate || p.time || "").slice(0, 10); if (d > (recv[p.sap] || "")) recv[p.sap] = d; } });
  const out = [];
  D.stock.forEach((s) => {
    const cr = cratesOf(s); if (!(cr > 0)) return;
    const a = by[s.sap] || { s28: 0, last: "", buyers: {} }, rate = a.s28 / 28, cover = rate > 0 ? cr / rate : null;
    const still = !(a.s28 > 0);
    if (!still && cover <= days) return;
    const keep = rate * days, extra = Math.max(0, cr - keep), ea = s.ea || 0, cost = s.cost || 0;
    out.push({
      sap: s.sap, name: s.name, trop: s.trop, cat: s.cat, upc: s.upc, crates: cr, ea, value: ea * cost, s28: a.s28, rate, cover, still,
      last: a.last || null, since: a.last ? daysBetween(a.last, today) : null, recv: recv[s.sap] || null,
      push: still ? cr : extra, pushValue: (still ? ea : Math.round(extra * (s.upc || 0))) * cost,
      buyers: Object.values(a.buyers).sort((x, y) => y.crates - x.crates),
      cls: (replBySap[s.sap] || {}).cls, onTruck: (replBySap[s.sap] || {}).final || 0,
    });
  });
  return out.sort((x, y) => (y.still - x.still) || y.pushValue - x.pushValue);
}
const slowSum = (rows) => ({ n: rows.length, crates: rows.reduce((a, r) => a + r.push, 0), value: rows.reduce((a, r) => a + r.value, 0), pushValue: rows.reduce((a, r) => a + r.pushValue, 0), still: rows.filter((r) => r.still).length });
const coverTxt = (r) => (r.still ? "No sales" : r.cover >= 365 ? "1 year+" : nf(r.cover, 0) + " days");
const lastTxt = (r) => (r.last ? (r.since === 0 ? "today" : r.since === 1 ? "yesterday" : r.since + " days ago") : "not since 1 Sep");
function slowHtml() {
  const rows = slowRows(), T = slowSum(rows), days = +slowCfg().days || 45;
  const head = `<div class="banner info">${ic("info", "sm")}<span>Own stock that is sitting: products with <b>no sales in the last 4 weeks</b>, or more crates than you sell in <b>${days} days</b> at the last 4 weeks' pace. "To push" is the stock above ${days} days of sales. Tap a product to see who bought it before.</span></div>
  <div class="hstack between wrap gap-12"><div class="hstack gap-8 wrap"><span class="row-sub">Slow means more than</span><div class="chips" style="margin:0">${SLOW_STEPS.map((d) => `<button class="chip" data-act="slowDays" data-d="${d}" aria-pressed="${days === d}">${d} days</button>`).join("")}</div></div>${rows.length ? `<button class="btn btn-sm btn-secondary" data-act="slowExcel">${ic("doc", "sm")} Download Excel</button>` : ""}</div>`;
  if (!rows.length) return head + `<div class="group"><div class="empty"><div class="big">Nothing is sitting</div>Every product in stock sells through within ${days} days.</div></div>`;
  const tiles = `<div class="tiles"><div class="tile"><div class="tile-label">Slow-moving products</div><div class="tile-value">${T.n}</div><div class="tile-sub">${T.still} with no sales in 4 weeks</div></div><div class="tile"><div class="tile-label">Crates to push</div><div class="tile-value">${nf(T.crates, 0)}<small>crates</small></div><div class="tile-sub">Above ${days} days of sales</div></div>${SEE_MONEY ? `<div class="tile"><div class="tile-label">Money tied up</div><div class="tile-value">₹${lakh(T.value)}<small>L</small></div><div class="tile-sub">All their stock, at the SS rate</div></div><div class="tile"><div class="tile-label">Of which to push</div><div class="tile-value">₹${lakh(T.pushValue)}<small>L</small></div><div class="tile-sub">The extra stock, at the SS rate</div></div>` : ""}</div>`;
  const grid = `<div class="dg" style="--cols:minmax(0,2fr) 80px 90px 100px 110px 90px${SEE_MONEY ? " 110px" : ""};--cols-sm:minmax(0,1fr) auto"><div class="dg-row dg-head"><span>Product</span><span class="r">In stock</span><span class="r c-hide">Sold, 4 wks</span><span class="r c-hide">Lasts</span><span class="c-hide">Last sold</span><span class="r">To push</span>${SEE_MONEY ? `<span class="r c-hide">Tied up</span>` : ""}</div>
  ${rows.map((r) => `<button class="dg-row" data-act="slowSheet" data-sap="${esc(r.sap)}"><span><div class="strong clip">${esc(shortName(r.name))}</div><div class="row-sub clip">${r.buyers.length ? "Bought by " + esc(r.buyers.slice(0, 2).map((b) => shortOf(b.name)).join(", ")) + (r.buyers.length > 2 ? ` +${r.buyers.length - 2}` : "") : "No one has bought it in 90 days"}${r.onTruck > 0 ? ` · <span style="color:var(--warn);font-weight:600">${nf(r.onTruck)} more on the next truck</span>` : ""}</div></span><span class="r num">${nf(r.crates, 1)}</span><span class="r c-hide num">${r.s28 ? nf(r.s28, 1) : `<span class="dim">0</span>`}</span><span class="r c-hide">${r.still ? `<span class="pill bad">No sales</span>` : `<span class="num" style="color:${r.cover > days * 2 ? "var(--bad)" : "var(--warn)"};font-weight:600">${coverTxt(r)}</span>`}</span><span class="c-hide row-sub">${lastTxt(r)}</span><span class="r strong num">${nf(r.push, 1)}</span>${SEE_MONEY ? `<span class="r c-hide num">${rs(r.value)}</span>` : ""}</button>`).join("")}</div>`;
  return head + tiles + grid;
}
ACT.slowDays = (el) => { slowCfg().days = +el.dataset.d; render(); };
ACT.slowList = () => { S.stockTab = "slow"; go("stock"); };
ACT.slowSheet = (el) => {
  const r = slowRows().find((x) => x.sap === el.dataset.sap); if (!r) return ACT.productSheet(el);
  const days = +slowCfg().days || 45;
  openSheet(esc(shortName(r.name)), `<div class="card card-pad"><div class="section-title" style="font-size:19px">${esc(r.name)}</div><div class="row-sub">${esc(r.cat || "")} · ${esc(r.trop || "No Tropicana code")}</div>
      <div class="divider" style="margin:16px 0"></div><div class="kv"><div><div class="k">In stock</div><div class="v num">${nf(r.crates, 1)} crates · ${nf(r.ea)} boxes</div></div><div><div class="k">Sold, last 4 weeks</div><div class="v num">${nf(r.s28, 1)} crates</div></div><div><div class="k">Stock lasts</div><div class="v">${coverTxt(r)}</div></div><div><div class="k">Last sold</div><div class="v">${r.last ? fmtDate(r.last) + " · " + lastTxt(r) : "Not since 1 Sep"}</div></div><div><div class="k">Last received</div><div class="v">${r.recv ? fmtDate(r.recv) : "–"}</div></div>${SEE_MONEY ? `<div><div class="k">Tied up (SS rate)</div><div class="v num">${rs(r.value)}</div></div>` : ""}</div></div>
    <div class="banner warn">${ic("info", "sm")}<span><b>Push about ${nf(r.push, 1)} crates</b>${SEE_MONEY ? ` (${rs(r.pushValue)})` : ""}. ${r.still ? "Nothing has sold in 4 weeks, so all of it is extra." : `That is the stock above ${days} days of sales at the current pace.`}${r.onTruck > 0 ? ` The truck plan still has ${nf(r.onTruck)} more crates of it. Set its order rule to "Don't order" in Replenishment if you want to stop.` : ""}</span></div>
    <div><div class="group-label"><span>Who to offer it to</span><span>Last 90 days</span></div><div class="group">${r.buyers.length ? r.buyers.slice(0, 8).map((b) => { const d = distByKey[key(b.name)] || {}; return `<div class="row"><span class="avatar soft">${esc(initials(b.name))}</span><span class="grow"><div class="row-title clip">${esc(b.name)}</div><div class="row-sub">${esc(d.district || "")}${d.phone ? " · " + esc(d.phone) : ""} · last bought ${fmtDate(b.last)}</div></span><span class="row-end"><span class="row-value">${nf(b.crates, 1)} crate${b.crates === 1 ? "" : "s"}</span></span></div>`; }).join("") : `<div class="empty">No distributor bought it in the last 90 days. Try your biggest buyers in the same range.</div>`}</div></div>`,
    `<button class="btn btn-secondary" data-act="productSheet" data-sap="${esc(r.sap)}">${ic("box", "sm")} Product details</button>`);
};
ACT.slowExcel = async (el) => {
  const rows = slowRows(), days = +slowCfg().days || 45, now = NOW(), stamp = `${pad2(now.getDate())}-${pad2(now.getMonth() + 1)}-${now.getFullYear()}`;
  const aoa = [[`SLOW-MOVING STOCK TO PUSH  (SahiReach LLP) · ${stamp}`], [`No sales in the last 4 weeks, or more than ${days} days of stock at the last 4 weeks' pace`], [],
    ["Tropicana Code", "SKU", "Category", "Crates in stock", "Boxes", "Sold last 4 weeks (crates)", "Stock lasts (days)", "Last sold", "Crates to push", "Value tied up (SS rate)", "Value to push (SS rate)", "Bought in last 90 days by"]];
  rows.forEach((r) => aoa.push([r.trop || "", r.name, r.cat || "", +r.crates.toFixed(2), r.ea, +r.s28.toFixed(2), r.still ? "No sales" : Math.round(r.cover), r.last ? fmtDate(r.last) : "Not since 1 Sep", +r.push.toFixed(2), Math.round(r.value), Math.round(r.pushValue), r.buyers.map((b) => `${shortOf(b.name)} (${nf(b.crates, 1)})`).join(", ")]));
  const T = slowSum(rows); aoa.push(["", "TOTAL", "", +rows.reduce((a, r) => a + r.crates, 0).toFixed(2), "", "", "", "", +T.crates.toFixed(2), Math.round(T.value), Math.round(T.pushValue), ""]);
  if (await downloadXlsx(el, aoa, [14, 46, 16, 10, 8, 12, 12, 13, 10, 14, 14, 60], `SahiReach slow-moving stock ${stamp}.xlsx`, "Slow moving", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }])) {
    logActivity("Slow-moving list downloaded", `${rows.length} products`, "Excel"); toast("Slow-moving list downloaded", "doc");
  }
};
/* order entry: slow movers worth offering to this distributor */
function slowOffer(dist) {
  if (!dist) return "";
  const rows = slowRows(), k = key(dist), theirs = rows.filter((r) => r.buyers.some((b) => key(b.name) === k)), list = (theirs.length ? theirs : rows).slice(0, 5);
  if (!list.length) return "";
  return `<div class="offer"><span class="offer-k">${ic("bolt", "sm")} ${theirs.length ? "Offer them, they bought it before:" : "Slow stock to offer:"}</span>${list.map((r) => `<button class="chip" data-act="addLine" data-sap="${esc(r.sap)}" title="${esc(r.name)} · ${nf(r.crates, 1)} crates in stock, lasts ${coverTxt(r)}">${esc(shortName(r.name).split("(")[0].trim())} <span style="opacity:.6">${nf(r.crates, 0)}</span></button>`).join("")}</div>`;
}

/* ===== REPLENISHMENT AS AN EXCEL WORKBOOK =====
   Sheet 1 "Hangyo PO" keeps the layout of the old Excel PO sheet (title, party row, headers on row 3, TOTAL on row 4,
   one product per row from row 5), so it can be used to place the order on the Hangyo portal as before. */
const r2 = (v) => (v == null || v === "" || isNaN(+v) ? null : Math.round(+v * 100) / 100);
function replBookSheets() {
  recomputeRepl();
  const R = D.repl, now = NOW(), T = replTotals(), qls = qcPOLines(), ch = R.changes || { youSet: [], moved: [], qcYou: [] };
  const dateTxt = `${pad2(now.getDate())}-${pad2(now.getMonth() + 1)}-${now.getFullYear()}`, timeTxt = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  const word = R.decision.includes("NOW") ? "Order now" : R.decision.includes("SOON") ? "Order soon" : "Hold";
  const orderOn = !R.orderBy ? "Not in 60 days" : R.orderBy <= ymd(now) ? "Today" : fmtDate(R.orderBy);
  const qcCr = qls.reduce((a, q) => a + q.final, 0), qcVal = qls.reduce((a, q) => a + q.final * (q.upc || 0) * (ssRate(q.sap) || 0), 0);
  /* 1 · Hangyo PO: own + quick commerce together, one line per product */
  const po = {};
  R.rows.filter((r) => r.final > 0).forEach((r) => { po[r.sap] = { name: r.name, cat: r.cat || "", upc: r.upc || 0, own: r.final, qc: 0, sap: r.sap }; });
  qls.forEach((q) => { const x = (po[q.sap] = po[q.sap] || { name: q.name, cat: q.cat || (catBySap[q.sap] || {}).cat || "", upc: q.upc || 0, own: 0, qc: 0, sap: q.sap }); x.qc += q.final; });
  const poRows = Object.values(po).sort((a, b) => a.name.localeCompare(b.name));
  const poCr = poRows.reduce((a, x) => a + x.own + x.qc, 0), poBx = poRows.reduce((a, x) => a + (x.own + x.qc) * x.upc, 0);
  const poAoa = [["HANGYO ICECREAM PURCHASE"], [`SAHIREACH LLP · ${dateTxt} ${timeTxt} · ${word} · own stock ${nf(T.own)} + quick commerce ${nf(qcCr)} = ${nf(T.own + qcCr)} of ${nf(R.truck)} crates`],
    ["PRODUCT NAME", "TYPE", "Units/Crates", "ORDER CRATE NUMBER", "BOXES/UNITS", "Own stock crates", "Quick commerce crates", "SAP code", "Value at SS rate"],
    ["TOTAL", "", "", poCr, poBx, T.own, qcCr, "", Math.round(T.value + qcVal)]];
  poRows.forEach((x) => { const c = x.own + x.qc; poAoa.push([x.name, x.cat, x.upc, c, c * x.upc, x.own || null, x.qc || null, x.sap, Math.round(c * x.upc * (ssRate(x.sap) || 0))]); });
  /* 2 · Truck plan: every own-stock product with the engine's working */
  const rows = R.rows.slice().sort((a, b) => (b.final || 0) - (a.final || 0) || (b.perDay || 0) - (a.perDay || 0) || a.name.localeCompare(b.name));
  const changeTxt = (r) => (!r.delta ? null : ch.youSet.includes(r.sap) || (r.yours != null && r.yours !== "") ? `You set ${r.delta > 0 ? "+" : ""}${r.delta}` : r.delta < 0 ? `${r.delta} to make room` : `+${r.delta} to fill`);
  const plan = [["REPLENISHMENT: TRUCK PLAN  (SahiReach LLP)"], [`Worked out ${dateTxt} ${timeTxt} from stock, orders, missed sales and open Hangyo POs`], [],
    ["The engine says", word], ["Why", R.why || ""], ["Order on", orderOn], ["Truck size (crates)", R.truck], ["Own stock on this truck", T.own], ["Quick commerce on this truck", qcCr], ["Total on this truck", T.own + qcCr],
    ["Value at SS rate", Math.round(T.value + qcVal)], ["Own sales (crates / day)", r2(R.perDay)], ["One truck lasts (days)", R.truckDays], ["Hero / Core below reorder point", R.belowRop], ["Hero / Core that run out before the truck", R.runOut || 0], [],
    ["SAP code", "Tropicana code", "Product", "Category", "Class", "Order rule", "Sold, last 14 days", "Sold, days 15–28", "Sold, days 29–56", "Missed, 28 days", "Sells / day", "Available for sale (crates)", "On order", "Days of stock", "Safety stock", "Reorder point", "Target stock", "Below reorder point", "Suggested", "Your crates", "Final crates", "Boxes", "Change vs plan", "Value at SS rate", "Days of stock after truck", "Note"]];
  const head = plan.length;
  rows.forEach((r) => plan.push([r.sap, tropCode(r.sap) || "", r.name, r.cat || "", r.cls || "", r.rule || "Auto", r2(r.s14), r2(r.s28), r2(r.s56), r2(r.missed), r2(r.perDay), r2(r.stock), r2(r.onOrder), r.perDay > 0 ? r2(r.days) : null, r2(r.safety), r2(r.rop), r2(r.target), r.belowRop ? "Yes" : "", r2(r.suggested), r.yours != null && r.yours !== "" ? +r.yours : null, r.final || 0, (r.final || 0) * (r.upc || 0), changeTxt(r), Math.round(r.value || 0), r.daysAfter != null ? r2(r.daysAfter) : null, r.note || ""]));
  plan.push(["", "", "TOTAL", "", "", "", r2(rows.reduce((a, r) => a + (r.s14 || 0), 0)), r2(rows.reduce((a, r) => a + (r.s28 || 0), 0)), r2(rows.reduce((a, r) => a + (r.s56 || 0), 0)), r2(rows.reduce((a, r) => a + (r.missed || 0), 0)), r2(rows.reduce((a, r) => a + (r.perDay || 0), 0)), r2(rows.reduce((a, r) => a + (r.stock || 0), 0)), r2(rows.reduce((a, r) => a + (r.onOrder || 0), 0)), "", "", "", "", "", rows.reduce((a, r) => a + (r.suggested || 0), 0), "", T.own, rows.reduce((a, r) => a + (r.final || 0) * (r.upc || 0), 0), "", Math.round(T.value), "", ""]);
  /* 3 · Swiggy & Zepto */
  const qrows = D.qcStock.slice().sort((a, b) => (b.final || 0) - (a.final || 0) || (b.perDay || 0) - (a.perDay || 0));
  const typed = R.qcCrates != null && R.qcCrates !== "";
  const qc = [["REPLENISHMENT: SWIGGY & ZEPTO STOCK  (SahiReach LLP)"], [`Worked out ${dateTxt} ${timeTxt} · suggested = Swiggy and Zepto orders per day over 28 days × (${replCfg().lead} days lead time + ${R.truckDays} days one truck lasts + ${replCfg().qcSafety} extra days), less stock after open POs`], typed ? [`You typed ${nf(+R.qcCrates)} quick commerce crates for the truck on the Truck plan tab`] : [], [],
    ["SAP code", "Tropicana code", "Product", "Pieces / crate", "QC stock (crates)", "On open POs (crates)", "On order from Hangyo", "Sells / day (crates)", "Days of stock after POs", "Suggested", "Your crates", "Final crates", "Boxes", "Change vs plan", "Value at SS rate"]];
  qrows.forEach((q) => qc.push([q.sap, q.trop || tropCode(q.sap) || "", q.name, q.ppc || null, r2(q.crates || 0), r2(q.openCrates || 0), r2(q.onOrder || 0), r2(q.perDay), q.daysAfter != null ? r2(q.daysAfter) : null, q.suggested || 0, q.yours != null && q.yours !== "" ? +q.yours : null, q.final || 0, (q.final || 0) * (q.upc || 0), q.delta ? `You set ${q.delta > 0 ? "+" : ""}${q.delta}` : null, Math.round((q.final || 0) * (q.upc || 0) * (ssRate(q.sap) || 0))]));
  qc.push(["", "", "TOTAL", "", r2(qrows.reduce((a, q) => a + (q.crates || 0), 0)), r2(qrows.reduce((a, q) => a + (q.openCrates || 0), 0)), r2(qrows.reduce((a, q) => a + (q.onOrder || 0), 0)), r2(R.qcPerDay), "", qrows.reduce((a, q) => a + (q.suggested || 0), 0), "", qcCr, qls.reduce((a, q) => a + q.final * (q.upc || 0), 0), "", Math.round(qcVal)]);
  return {
    file: `SahiReach replenishment ${dateTxt} ${timeTxt.replace(":", "")}.xlsx`, poLines: poRows.length, head,
    sheets: [
      { name: "Hangyo PO", aoa: poAoa, cols: [46, 16, 12, 20, 13, 15, 20, 11, 15], merges: [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }] },
      { name: "Truck plan", aoa: plan, cols: [10, 13, 44, 16, 10, 12, 10, 10, 10, 10, 9, 10, 9, 9, 9, 9, 9, 10, 10, 10, 10, 8, 18, 13, 12, 40], merges: [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }, { s: { r: 4, c: 1 }, e: { r: 4, c: 12 } }] },
      { name: "Swiggy & Zepto", aoa: qc, cols: [10, 13, 44, 10, 12, 13, 13, 12, 13, 10, 10, 10, 8, 14, 13], merges: [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } }] },
    ],
  };
}
ACT.replExcel = async (el) => {
  const B = replBookSheets();
  if (await downloadBook(el, B.sheets, B.file)) { logActivity("Replenishment downloaded", `${B.poLines} PO lines`, "Excel"); toast("Replenishment downloaded as Excel", "doc"); }
};

/* ===== RECEIVE STOCK FROM AN EXCEL INVOICE =====
   Finds the header row, the product (SAP/material code and/or name), quantity, unit, batch and rate columns,
   matches every line (SAP code first, then the closest name) and puts it on the receive sheet to check. */
const RCV_UNIT = (u) => { u = String(u || "").trim().toLowerCase().replace(/\.$/, ""); return /^(cs|case|cases|crt|crts|crate|crates|ctn|ctns|carton|cartons|cr)$/.test(u) ? "Crate" : /^(ea|each|box|boxes|bx|bxs|nos|no|pc|pcs|piece|pieces|unit|units|pkt|pack)$/.test(u) ? "EA (Box)" : null; };
function recvFromRows(rows) {
  rows = rows.map((r) => Array.from(r || [], (v) => (v == null ? "" : String(v).trim())));
  let hr = -1;
  for (let i = 0; i < Math.min(rows.length, 30) && hr < 0; i++) {
    const cells = rows[i].map((c) => c.toLowerCase());
    const hasName = cells.some((c) => /^(material\s*)?(description|desc)|product|item\s*(name|desc)|particulars|sku|material name/.test(c));
    const hasQty = cells.some((c) => /qty|quantity|cases?|crates?|ctns?|^cs$|^ea$|boxes|billed/.test(c));
    if (hasName && hasQty) hr = i;
  }
  if (hr < 0) return { error: "No header row with a product column and a quantity column was found in the first 30 rows." };
  const H = rows[hr].map((h) => h.replace(/\s+/g, " ").trim().toLowerCase()), find = (re, not) => H.findIndex((h) => re.test(h) && !(not && not.test(h)));
  const nameCol = find(/^(material\s*)?(description|desc)|product|item\s*(name|desc)|particulars|sku|material name/, /code|no\b|number|hsn/);
  const sapCol = find(/sap|material(\s*(code|no|number))?$|item\s*code|product\s*code|^code$|art(icle)?\s*(no|code)/, /description|desc|hsn/);
  const unitCol = find(/^(uom|unit|units|unit of measure|sales unit)$/);
  const batchCol = find(/batch|lot/);
  const rateCol = find(/rate|price/, /mrp|amount|value|total/);
  const qtyCands = H.map((h, j) => ({ h, j })).filter((x) => x.j !== nameCol && x.j !== sapCol && x.j !== unitCol && /qty|quantity|cases?|crates?|ctns?|^cs$|^ea$|boxes|billed/.test(x.h) && !/free|rate|price|amount|value|mrp|per\s*(case|crate)|units?\s*\/|conv/.test(x.h))
    .map((x) => ({ ...x, p: /billed|invoice|inv\b/.test(x.h) ? 3 : /case|crate|ctn|^cs$/.test(x.h) ? 2 : 1, unit: /case|crate|ctn|^cs$/.test(x.h) ? "Crate" : /\bea\b|box|pcs|nos/.test(x.h) ? "EA (Box)" : null }))
    .sort((a, b) => b.p - a.p);
  if (!qtyCands.length) return { error: "No quantity column was found." };
  /* invoice number and date from the rows above the header */
  let inv = "", date = "";
  rows.slice(0, hr + 1).forEach((r) => r.forEach((c, j) => {
    const m = /invoice\s*(no\.?|number|#)?\s*[:\-]?\s*([A-Z0-9][A-Z0-9\/-]{4,})/i.exec(c); if (!inv && m && /\d/.test(m[2])) inv = m[2];
    if (!inv && /^invoice\s*(no\.?|number|#)?\s*:?$/i.test(c) && r[j + 1] && /\d/.test(r[j + 1])) inv = r[j + 1].trim();
    const d = /(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})/.exec(c); if (!date && d && /date/i.test(c + " " + (r[j - 1] || ""))) { const y = d[3].length === 2 ? "20" + d[3] : d[3]; date = `${y}-${pad2(+d[2])}-${pad2(+d[1])}`; }
  }));
  const lines = [], skipped = [];
  rows.slice(hr + 1).forEach((r) => {
    const nm = nameCol >= 0 ? r[nameCol] || "" : "", code = sapCol >= 0 ? (r[sapCol] || "").replace(/\.0+$/, "").replace(/\s/g, "") : "";
    if ((!nm && !code) || /^(sub\s*)?total|grand total|net amount|round/i.test(nm)) return;
    let qty = null, unit = null;
    for (const c of qtyCands) { const v = (r[c.j] || "").replace(/,/g, ""); const m = /^(\d+(?:\.\d+)?)\s*([a-z.]*)$/i.exec(v); if (m && +m[1] > 0) { qty = +m[1]; unit = RCV_UNIT(m[2]) || c.unit; break; } }
    if (qty == null) return;
    if (unitCol >= 0 && RCV_UNIT(r[unitCol])) unit = RCV_UNIT(r[unitCol]);
    const rate = rateCol >= 0 ? +(r[rateCol] || "").replace(/,/g, "") || null : null;
    lines.push({ name: nm, code, qty, unit, batch: batchCol >= 0 ? r[batchCol] || "" : "", rate });
  });
  return { lines, inv, date, unitKnown: lines.some((l) => l.unit) };
}
function recvMatch(x) {
  const bySap = x.code && (stockBySap[x.code] || catBySap[x.code]) ? x.code : null;
  if (bySap) return { sap: bySap, conf: "sure" };
  const c = impMatch(x.name, {}), conf = impConf(c);
  return { sap: conf === "none" ? null : c[0].sap, conf, cands: c.slice(0, 5).map((m) => m.sap) };
}
function recvUpMsg() {
  const R = S.recv; if (!R || !R.file) return "";
  const un = R.unmatched || [];
  return `<div class="banner ${un.length ? "warn" : "good"}" style="align-items:flex-start">${ic(un.length ? "alert" : "check", "sm")}<span class="grow"><b>${esc(R.file.name)}:</b> ${R.file.added} line${R.file.added === 1 ? "" : "s"} added${R.file.check ? `, ${R.file.check} to check (marked below)` : ""}${R.file.unitGuess ? ". The file did not say crates or boxes, so quantities were read as <b>crates</b>. Change them if they were boxes" : ""}.${un.length ? ` <b>${un.length} ${un.length === 1 ? "is" : "are"} not one of your products yet.</b> Add ${un.length === 1 ? "it" : "each"} as a product, or choose the right one:` : " Check the crates, then save."}</span></div>
    ${un.length ? `<div class="group">${un.map((u, i) => `<div class="row" style="flex-wrap:wrap;gap:8px"><span class="grow" style="min-width:180px"><div class="row-title clip">${esc(u.name || u.code)}</div><div class="row-sub">${u.code ? "Code " + esc(u.code) + " · " : ""}${nf(u.qty)} ${u.unit === "EA (Box)" ? "boxes" : "crates"}${u.why ? " · " + esc(u.why) : ""}</div></span><select class="select sm" style="width:auto;max-width:100%" data-in="recvPick" data-i="${i}"><option value="">Choose one of your products…</option>${(u.cands || []).filter((s) => stockBySap[s]).map((s) => `<option value="${esc(s)}">${esc(stockBySap[s].name)}</option>`).join("")}${D.stock.filter((s) => !(u.cands || []).includes(s.sap)).sort((a, b) => a.name.localeCompare(b.name)).map((s) => `<option value="${esc(s.sap)}">${esc(s.name)}</option>`).join("")}</select><button class="btn btn-sm btn-primary" data-act="recvNewProd" data-i="${i}">${ic("plus", "sm")} ${u.catSap && catBySap[u.catSap] ? "Start stocking it" : "Add as new product"}</button><button class="icon-btn" data-act="recvSkip" data-i="${i}" aria-label="Skip this line">${ic("trash", "sm")}</button></div>`).join("")}</div>` : ""}`;
}
function recvPush(sap, x, conf) {
  const st = stockBySap[sap], boxes = x.unit === "EA (Box)" ? x.qty : null, crates = boxes != null ? Math.round((boxes / st.upc) * 100) / 100 : x.qty;
  const ex = S.recv.lines.find((l) => l.sap === sap && (l.batch || "") === (x.batch || ""));
  if (ex) { if (ex.boxes != null || boxes != null) ex.boxes = (ex.boxes != null ? ex.boxes : ex.crates * st.upc) + (boxes != null ? boxes : x.qty * st.upc); ex.crates = Math.round(((ex.boxes != null ? ex.boxes / st.upc : ex.crates + crates)) * 100) / 100; return; }
  const fileRate = x.rate > 0 ? Math.round((x.unit === "EA (Box)" ? x.rate : x.rate / st.upc) * 10000) / 10000 : null;
  S.recv.lines.push({ sap, name: st.name, upc: st.upc, crates, boxes, batch: x.batch || "", raw: `${x.code ? x.code + " " : ""}${x.name}`.trim(), conf, fileRate });
}
IN.recvFile = async (el) => {
  const f = el.files && el.files[0]; if (!f) return; const R = S.recv, sig = [f.name, f.size, f.lastModified].join("|");
  if (R.fileSig === sig) return; /* the same file can fire both input and change */
  R.fileSig = sig; R.lines = R.lines.filter((l) => !l.raw); /* a new file replaces lines read from an earlier one */
  try {
    await loadScriptOnce(XLSX_SRC, () => !!window.XLSX);
    const rows = xlsxSheets(await f.arrayBuffer(), 1)[0] || [];
    const P = recvFromRows(rows);
    if (P.error || !P.lines.length) { R.file = null; part("rc-up-msg", `<div class="banner bad">${ic("alert", "sm")}<span>${esc(P.error || "No lines with a quantity were found in that file.")}</span></div>`); return; }
    if (P.inv && !R.inv) R.inv = P.inv; if (P.date) R.date = P.date;
    let added = 0, check = 0; R.unmatched = [];
    P.lines.forEach((x) => {
      if (!x.unit) x.unit = "Crate";
      const m = recvMatch(x);
      if (!m.sap) { R.unmatched.push({ ...x, cands: m.cands || [] }); return; }
      if (!stockBySap[m.sap]) { R.unmatched.push({ ...x, cands: m.cands || [], catSap: m.conf === "sure" ? m.sap : null, why: m.conf === "sure" ? "in the Hangyo list but not set up as one of your products yet" : "not set up as one of your products yet" }); return; }
      recvPush(m.sap, x, m.conf); added++; if (m.conf !== "sure") check++;
    });
    R.file = { name: f.name, added, check, unitGuess: !P.unitKnown };
    logActivity("Invoice read", f.name, `${added} lines matched${R.unmatched.length ? ", " + R.unmatched.length + " to choose" : ""}`);
    recvRefresh();
  } catch (e) { part("rc-up-msg", `<div class="banner bad">${ic("alert", "sm")}<span>That file could not be read. Save it as .xlsx and try again.</span></div>`); }
};
IN.recvPick = (el) => { const R = S.recv, u = R.unmatched[+el.dataset.i]; if (!el.value || !u) return; recvPush(el.value, u, "sure"); R.unmatched.splice(+el.dataset.i, 1); if (R.file) R.file.added++; D.orderAliases = D.orderAliases || {}; if (u.name) D.orderAliases[impAliasKey(u.name)] = el.value; recvRefresh(); };
ACT.recvSkip = (el) => { S.recv.unmatched.splice(+el.dataset.i, 1); recvRefresh(); };

/* ===== ADD A PRODUCT YOU START STOCKING =====
   Used from Receive stock (a line on the invoice that is not one of your products yet) and from the Stock page.
   If the product is in the Hangyo South Kerala list, its details and prices are filled in to check;
   if not, everything is typed from the invoice. Hangyo's price to you (the SS rate) is required. */
const packFromName = (n) => { const m = /\(\s*(\d+)\s*[x×]\s*\d/i.exec(n || ""); return m ? +m[1] : null; };
function npOpen(o) {
  const c = (o.sap && catBySap[o.sap]) || null, p = (c && D.prices[c.sap]) || [];
  S.np = {
    from: o.from || "stock", i: o.i != null ? o.i : null, raw: o.raw || "", qty: o.qty || null, unit: o.unit || null, inList: !!c,
    name: (c && c.name) || o.name || "", sap: (c && c.sap) || o.sap || "", cat: (c && c.cat) || "", upc: (c && c.upc) || null, ppe: (c && c.ppe) || packFromName(o.name) || null,
    ss: o.rate != null ? o.rate : p[0] != null ? p[0] : null, ssFromFile: o.rate != null, dist: p[1] != null ? p[1] : null, dealer: p[2] != null ? p[2] : null, mrp: p[3] != null ? p[3] : (c && c.mrp) || null,
  };
  openSheet(S.np.inList ? "Start stocking this product" : "Add a new product", npBody(), `<button class="btn btn-secondary" data-act="npBack">${S.np.from === "recv" ? `${ic("chevL", "sm")} Back to the invoice` : "Cancel"}</button><button class="btn btn-primary" data-act="npSave">${ic("check", "sm")} ${S.np.from === "recv" ? "Add product and receive it" : "Add product"}</button>`, true);
}
function npBody() {
  const N = S.np, cats = [...new Set(D.catalog.map((x) => x.cat).filter(Boolean))].sort();
  const fromFile = N.raw ? `<div class="banner info">${ic("doc", "sm")}<span><b>On the invoice:</b> ${esc(N.raw)}${N.qty ? ` · ${nf(N.qty)} ${N.unit === "EA (Box)" ? "boxes" : "crates"}` : ""}${N.ssFromFile && SEE_MONEY ? ` · ${rs2(N.ss)} per box` : ""}</span></div>` : "";
  return `<div id="form-err"></div>${fromFile}
    <div class="banner ${N.inList ? "good" : "warn"}">${ic(N.inList ? "check" : "info", "sm")}<span>${N.inList ? "Found in the Hangyo South Kerala list: the details and prices from it are filled in. Check them." : "Not in the Hangyo South Kerala list. Type the details from the invoice."}</span></div>
    <div class="card card-pad"><div class="card-title" style="margin-bottom:12px">Product</div><div class="form-grid">
      ${fld("np-name", "Name", N.name, { full: true, required: true, ph: "e.g. Rose Kulfi ( 15 x 50 ml )" })}
      ${fld("np-sap", "SAP / material code", N.sap, { required: true, disabled: N.inList, ph: "From the invoice", hint: N.inList ? "" : "The Material column on the Hangyo invoice." })}
      ${fld("np-cat", "Category", N.cat, { list: cats })}
      ${fld("np-upc", "Boxes per crate", N.upc, { type: "number", step: "1", required: true, hint: "Most Hangyo products come 6 or 10 boxes to a crate." })}
      ${fld("np-ppe", "Pieces per box", N.ppe, { type: "number", step: "1", hint: N.ppe && !(catBySap[N.sap] || {}).ppe ? "Read from the name." : "" })}
    </div></div>
    ${CAN_PRICE ? `<div class="card card-pad"><div class="card-title" style="margin-bottom:4px">Prices per box, excl. GST</div><div class="row-sub" style="margin-bottom:12px">Hangyo's price to you is needed to work out stock value and profit. The others can be added later.</div><div class="form-grid">
      ${fld("np-ss", "Hangyo price to you (₹)", r4(N.ss), { type: "number", required: true, hint: N.ssFromFile ? "From the invoice." : N.inList && N.ss != null ? "From the Hangyo list." : "" })}
      ${fld("np-dist", "Distributor price (₹), optional", r4(N.dist), { type: "number", hint: "What distributors are billed." })}
      ${fld("np-dealer", "Retailer price (₹), optional", r4(N.dealer), { type: "number" })}
      ${fld("np-mrp", "MRP per box (₹), optional", N.mrp, { type: "number" })}
    </div></div>` : `<div class="banner info">${ic("info", "sm")}<span>The owner adds the prices. They will be asked to when they next open the tool.</span></div>`}`;
}
ACT.npBack = () => { const N = S.np; S.np = null; if (N && N.from === "recv") openRecv(); else closeSheet(); };
ACT.npSave = () => {
  const N = S.np; if (!N) return;
  const name = val("np-name").replace(/\s+/g, " "), sap = N.inList ? N.sap : val("np-sap").replace(/\s/g, "").replace(/\.0+$/, "");
  const upc = Math.round(+val("np-upc")), ppe = Math.max(1, Math.round(+val("np-ppe") || packFromName(name) || 1));
  if (!name) return formErr("Enter the product name.");
  if (!/^\d{5,10}$/.test(sap)) return formErr("Enter the SAP / material code from the invoice (numbers only).");
  if (!(upc > 0)) return formErr("Enter how many boxes come in one crate.");
  const ss = CAN_PRICE ? numOrNull(val("np-ss")) : null, dist = CAN_PRICE ? numOrNull(val("np-dist")) : null, dealer = CAN_PRICE ? numOrNull(val("np-dealer")) : null, mrp = CAN_PRICE ? numOrNull(val("np-mrp")) : N.mrp;
  if (CAN_PRICE && !(ss > 0)) return formErr("Enter Hangyo's price to you per box. It is needed for stock value and profit.");
  if (CAN_PRICE && dist != null && dist < ss) { if (!N.lowOK) { N.lowOK = true; return formErr("The distributor price is lower than Hangyo's price to you. If that is right, tap Add again."); } }
  let st = stockBySap[sap];
  if (!st) {
    let c = catBySap[sap];
    if (!c) { c = { name, sap, cat: val("np-cat") || null, mrp, ppe, upc, stocked: 1, times: 0, added: "manual" }; D.catalog.push(c); catBySap[sap] = c; }
    else Object.assign(c, { upc: c.upc || upc, ppe: c.ppe || ppe, cat: c.cat || val("np-cat") || null, stocked: 1 });
    catByName[key(c.name)] = c;
    if (CAN_PRICE) {
      const p = (D.prices[sap] = D.prices[sap] || [null, null, null, null, null]);
      p[0] = ss; if (dist != null) p[1] = dist; if (dealer != null) p[2] = dealer; if (mrp != null) { p[3] = mrp; p[4] = Math.round((mrp / ppe) * 100) / 100; }
    }
    const pr = D.prices[sap] || [];
    st = { trop: null, name: c.name || name, sap, cat: c.cat, hsn: "21050000", upc, ppe, ea: 0, crates: 0, pcs: 0, mrp: mrp != null ? mrp : c.mrp, cost: CAN_PRICE ? ss : null, price: pr[1] != null ? pr[1] : null, margin: CAN_PRICE && pr[1] != null ? Math.round((pr[1] - ss) * 100) / 100 : null, inSK: N.inList ? "Yes" : "No", updated: iso(NOW()), move: N.from === "recv" ? "Added while receiving stock" : "Added from the Stock page", notes: null, tier: null };
    D.stock.push(st); stockBySap[sap] = st; if (typeof MP_CACHE !== "undefined") MP_CACHE.t = 0;
    logActivity(N.inList ? "Product now stocked" : "New product added", sap, `${st.name}${N.inList ? "" : " · not in the Hangyo list"}${CAN_PRICE ? "" : " · prices still to add"}`);
  }
  S.np = null;
  if (N.from === "recv") {
    const R = S.recv;
    if (N.i != null && R.unmatched[N.i]) { const u = R.unmatched[N.i]; recvPush(sap, u, "sure"); R.unmatched.splice(N.i, 1); if (R.file) R.file.added++; D.orderAliases = D.orderAliases || {}; if (u.name) D.orderAliases[impAliasKey(u.name)] = sap; }
    else if (!R.lines.find((l) => l.sap === sap)) R.lines.push({ sap, name: st.name, upc: st.upc, crates: 1 });
    R.q = ""; openRecv(); toast(`${shortName(st.name)} added. Check its crates below`, "check");
  } else { render(); ACT.productSheet({ dataset: { sap } }); toast(`${shortName(st.name)} added to your products`); }
};
ACT.recvNewProd = (el) => {
  const R = S.recv, d = el.dataset;
  if (d.i != null && d.i !== "") {
    const u = R.unmatched[+d.i]; if (!u) return;
    const inList = u.catSap && catBySap[u.catSap] ? u.catSap : null, c = inList ? catBySap[inList] : null;
    const upc = c && c.upc, rate = u.rate != null ? (u.unit === "EA (Box)" ? u.rate : upc ? u.rate / upc : null) : null;
    npOpen({ from: "recv", i: +d.i, sap: inList || u.code || "", name: u.name, raw: `${u.code ? u.code + " " : ""}${u.name}`.trim(), qty: u.qty, unit: u.unit, rate });
  } else npOpen({ from: "recv", sap: d.sap || "", name: d.q || "" });
};
ACT.stockNewProd = () => npOpen({ from: "stock" });

/* ===== STOCK REPORT AS EXCEL: own stock, quick commerce stock, purchases and missed sales ===== */
const dmyOf = (s) => { s = String(s || ""); return s.length >= 10 ? `${s.slice(8, 10)}-${s.slice(5, 7)}-${s.slice(0, 4)}` : ""; };
function stockBookSheets() {
  const now = NOW(), asOf = stampOf(now), r2 = (x) => (x == null || isNaN(x) ? null : Math.round(x * 100) / 100);
  /* current stock = at Tropicana; reserved = blocked by orders not yet dispatched (and Swiggy / Zepto pick lists); available for sale = current − reserved */
  const P = pendingEA(), X = {}; D.stock.forEach((s) => (X[s.sap] = stockSplit(s, P)));
  const own = D.stock.slice().sort((a, b) => X[b.sap].cur - X[a.sap].cur || a.name.localeCompare(b.name));
  const ownA = [[`OWN STOCK AT TROPICANA  (SahiReach LLP) · as of ${asOf}`], ["Current stock is what is at Tropicana now. Reserved is blocked by orders not yet dispatched and by sent Swiggy / Zepto pick lists. Available for sale = current − reserved."],
    ["Tropicana Code", "Product", "SAP code", "Category", "Class", "Boxes per crate", "Current stock (crates)", "Reserved (crates)", "Available for sale (crates)", "Current stock (boxes)", "Reserved (boxes)", "Available for sale (boxes)", "Available for sale (pieces)", "Sells / day (crates)", "Days of stock", "Below reorder point", "SS rate / box", "Value at SS rate", "Distributor rate / box", "MRP / box", "Last movement", "Updated"]];
  const sum = { c: 0, r: 0, a: 0, ce: 0, re: 0, ae: 0, ap: 0, v: 0 };
  own.forEach((s) => { const r = replBySap[s.sap] || {}, x = X[s.sap], cost = ssRate(s.sap) != null ? ssRate(s.sap) : s.cost; sum.c += x.cr.cur; sum.r += x.cr.res; sum.a += x.cr.avail; sum.ce += x.cur; sum.re += x.res; sum.ae += x.avail; sum.ap += x.avail * (s.ppe || 1); sum.v += x.cur * (cost || 0);
    ownA.push([s.trop || "", s.name, s.sap, s.cat || "", r.cls || "", s.upc || null, r2(x.cr.cur), r2(x.cr.res), r2(x.cr.avail), r2(x.cur), r2(x.res), r2(x.avail), r2(x.avail * (s.ppe || 1)), r.perDay ? r2(r.perDay) : null, r.perDay > 0 ? Math.round(Math.max(0, x.cr.avail) / r.perDay) : null, r.belowRop ? "Yes" : "", cost != null ? r2(cost) : null, cost != null ? r2(x.cur * cost) : null, price(s.sap) != null ? r2(price(s.sap)) : null, s.mrp != null ? s.mrp : null, s.move || "", dmyOf(s.updated)]); });
  ownA.push(["", "TOTAL", "", "", "", "", r2(sum.c), r2(sum.r), r2(sum.a), r2(sum.ce), r2(sum.re), r2(sum.ae), r2(sum.ap), "", "", "", "", r2(sum.v), "", "", "", ""]);
  const qc = D.qcStock.slice().sort((a, b) => (b.crates || 0) - (a.crates || 0));
  const qcA = [[`QUICK COMMERCE STOCK (Swiggy and Zepto)  · as of ${asOf}`], [],
    ["Tropicana Code", "Product", "SAP code", "Pieces per crate", "Current stock (crates)", "Reserved (crates)", "Available for sale (crates)", "On open POs (crates)", "Free after POs (crates)", "Swiggy price / piece", "Zepto price / piece", "Last movement"]];
  const qs = { c: 0, r: 0, a: 0, o: 0 };
  qc.forEach((s) => { const x = qcSplit(s); qs.c += x.cur; qs.r += x.res; qs.a += x.avail; qs.o += s.openCrates || 0; qcA.push([s.trop || "", s.name, s.sap, s.ppc || null, r2(x.cur), r2(x.res), r2(x.avail), s.openCrates ? r2(s.openCrates) : 0, s.free != null ? r2(s.free) : null, r2(s.swPrice || s.swiggy), r2(s.zpPrice || s.zepto), s.move || ""]); });
  qcA.push(["", "TOTAL", "", "", r2(qs.c), r2(qs.r), r2(qs.a), r2(qs.o), "", "", "", ""]);
  const pur = D.purchases.slice().sort((a, b) => (a.time < b.time ? 1 : -1));
  const purA = [["PURCHASES (stock received)"], [],
    ["Saved on", "Purchase", "Invoice", "Invoice date", "Supplier", "Into", "Product", "SAP code", "Batch", "Crates", "Boxes", "Cost per box", "Value at cost"]];
  pur.forEach((p) => purA.push([dmyOf(p.time), p.id, p.inv || "", dmyOf(p.invDate), p.supplier || "", p.pool || "", p.product, p.sap || "", p.batch || "", r2(p.crates), p.ea != null ? r2(p.ea) : null, p.rate != null ? r2(p.rate) : null, p.value != null ? r2(p.value) : null]));
  const miss = D.oos.slice().sort((a, b) => (a.time < b.time ? 1 : -1));
  const missA = [["MISSED SALES (products asked for but not supplied)"], [],
    ["Date", "Order", "Distributor", "Product", "SAP code", "Requested", "Available", "Missed (crates)", "Value missed", "Reason"]];
  miss.forEach((o) => { const n = (v) => (typeof v === "number" ? r2(v) : v === "N/A" ? "" : v || ""); missA.push([dmyOf(o.time), o.id || "", o.dist || "", o.product || "", o.sap || "", n(o.req), n(o.avail), n(o.missed), n(o.value), o.reason || ""]); });
  return {
    file: `SahiReach stock report ${dmyOf(ymd(now))}.xlsx`,
    sheets: [
      { name: "Own stock", aoa: ownA, cols: [14, 46, 11, 16, 10, 9, 11, 10, 12, 11, 10, 12, 12, 10, 10, 10, 11, 14, 12, 10, 50, 11] },
      { name: "Quick commerce stock", aoa: qcA, cols: [16, 46, 11, 10, 11, 10, 12, 12, 12, 11, 11, 50] },
      { name: "Purchases", aoa: purA, cols: [11, 22, 14, 11, 10, 12, 46, 11, 12, 9, 9, 11, 13] },
      { name: "Missed sales", aoa: missA, cols: [11, 22, 30, 46, 11, 10, 10, 10, 12, 44] },
    ],
  };
}
ACT.stockFull = async (el) => {
  const B = stockBookSheets();
  if (await downloadBook(el, B.sheets, B.file)) { logActivity("Stock report downloaded", "", "Excel"); toast("Stock report downloaded", "doc"); }
};

/* ===== STOCK STATEMENTS: GT (SahiReach) stock and quick commerce stock, as on a date and month by month =====
   Every movement the tool makes is on record with its time: purchases, distributor orders, Swiggy / Zepto deliveries,
   sales returns and purchase returns, and stock moved between SahiReach and quick commerce.
   The stock at the start of each month is recorded the first time the tool is used that month (D.stockOpen).
   Stock on any earlier day is worked out from the nearest recorded point after it (a month opening, or today)
   by taking back the movements in between. Between two recorded points, anything the records do not explain
   (a stock correction in Setup, a stock sheet uploaded, a GRN return) shows as "Stock corrections".
   Statements are of the stock at Tropicana (current stock): an order's boxes leave when it is DISPATCHED. Until then
   they are reserved, and available for sale = current − reserved. */
const STK_NOW = "9999-12-31T23:59";
const stkMS = (m) => m + "-01T00:00";
const stkNext = (m) => { const y = +m.slice(0, 4), mo = +m.slice(5, 7); return mo === 12 ? `${y + 1}-01` : `${y}-${pad2(mo + 1)}`; };
const stkMonthName = (m) => `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][+m.slice(5, 7) - 1]} ${m.slice(0, 4)}`;
const stkUpc = (sap) => ((stockBySap[sap] || qcBySap[sap] || catBySap[sap] || {}).upc || 0);
const stkAt = (at) => String(at || "").replace("~", "");

/* the movements in [from, to): own stock in boxes, quick commerce stock in crates */
function stkMoves(from, to) {
  const own = {}, qc = {}, inR = (t) => !!t && t >= from && t < to;
  const O = (sap) => (own[sap] = own[sap] || { recv: 0, ret: 0, fromQC: 0, sold: 0, toPlat: 0, pret: 0 });
  const Q = (sap) => (qc[sap] = qc[sap] || { recv: 0, back: 0, sw: 0, zp: 0, dist: 0 });
  D.purchases.forEach((p) => { if (!p.sap || !inR(p.time)) return; if (/QC/i.test(p.pool || "")) { if (qcBySap[p.sap]) Q(p.sap).recv += +p.crates || 0; } else if (p.ea) O(p.sap).recv += +p.ea || 0; });
  D.orders.forEach((o) => { if (o.status !== "Dispatched" || !inR(o.dispatched)) return; (linesByOrder[o.id] || []).forEach((l) => { if (l.sap && l.ea) O(l.sap).sold -= l.ea; }); });
  (D.notes || []).forEach((n) => { if (n.status === "Cancelled" || !Array.isArray(n.lines) || !inR(n.time)) return; n.lines.forEach((l) => { if (!l.stocked || !l.sap) return; if (l.stocked > 0) O(l.sap).ret += l.stocked; else O(l.sap).pret += l.stocked; }); });
  (D.transfers || []).forEach((t) => {
    if (!inR(t.time)) return;
    (t.lines || []).forEach((l) => {
      const u = stkUpc(l.sap);
      if (t.kind === "purchase") { O(l.sap).fromQC += l.crates * u; Q(l.sap).dist -= l.crates; }
      else if (t.kind === "credit") { O(l.sap).toPlat -= l.crates * u; Q(l.sap)[/zepto/i.test(t.ref || "") ? "zp" : "sw"] += l.crates; /* sent from SahiReach stock, not from quick commerce stock */ }
    });
  });
  D.qcPOs.forEach((p) => {
    const L = qcLinesByPO[p.po] || [];
    L.forEach((l) => (l.backs || []).forEach((b) => { if (inR(b.time)) Q(l.sap).back += b.crates || 0; }));
    if (p.status !== "Delivered" || !inR(p.deliveredOn)) return;
    const k = /zepto/i.test(p.platform || "") ? "zp" : "sw";
    L.forEach((l) => { if (!(l.delivered > 0) || !l.sap) return; const ppc = l.ppc || (qcBySap[l.sap] || {}).ppc || 0; if (ppc) Q(l.sap)[k] -= l.delivered / ppc; });
  });
  return { own, qc };
}
const stkNet = (m) => (m ? Object.keys(m).reduce((a, k) => a + m[k], 0) : 0);
/* recorded points: each month's opening, and the stock right now */
/* boxes on orders saved before T and not dispatched before T: still at Tropicana at T */
function stkBookedAt(T) {
  const m = {}; D.orders.forEach((o) => { if (o.status === "Cancelled" || !(o.time < T)) return; if (o.status === "Dispatched" && o.dispatched && o.dispatched < T) return; (linesByOrder[o.id] || []).forEach((l) => { if (l.sap && l.ea > 0) m[l.sap] = (m[l.sap] || 0) + l.ea; }); });
  return m;
}
function stkPoints() {
  const own = {}, qc = {}, pend = pendingEA();
  D.stock.forEach((s) => { own[s.sap] = (s.ea || 0) + (pend[s.sap] || 0); }); D.qcStock.forEach((s) => { qc[s.sap] = s.crates || 0; });
  const P = Object.keys(D.stockOpen || {}).map((m) => {
    const p = Object.assign({ m }, D.stockOpen[m]); if (!p.own || p.phys) return p;
    /* recorded before reserved stock was shown: it held the stock left after saved orders; add back what was still at Tropicana */
    const b = stkBookedAt(stkAt(p.at)), o = Object.assign({}, p.own); Object.keys(b).forEach((k) => { o[k] = (o[k] || 0) + b[k]; }); p.own = o; return p;
  }).filter((p) => p.at && p.own && p.qc).sort((a, b) => (a.at < b.at ? -1 : 1));
  P.push({ at: STK_NOW, own, qc, now: true });
  return P;
}
/* the stock at moment T, per product, for one pool ("own" in boxes, "qc" in crates) */
function stkValueAt(T, pool, pts) {
  pts = pts || stkPoints(); const p = pts.find((x) => x.at >= T), out = Object.assign({}, p[pool]);
  const mv = stkMoves(T, p.at)[pool];
  Object.keys(mv).forEach((sap) => { out[sap] = (out[sap] || 0) - stkNet(mv[sap]); });
  return { v: out, from: p };
}
const stkFromTxt = (p) => (p.now ? "today's stock" : `the opening stock recorded for ${stkMonthName(p.m)}`);

/* record the opening stock of this month (from the stock as it stood before this month's first change) */
function stockOpenTake(src, at) {
  const m = ymd(NOW()).slice(0, 7); D.stockOpen = D.stockOpen || {};
  if (D.stockOpen[m] || !src) return false;
  /* current stock (at Tropicana): what is left after saved orders + the orders not yet dispatched */
  const pend = {}; if (src === D || src.stock === D.stock) Object.assign(pend, pendingEA());
  else { const st = {}; (src.orders || []).forEach((o) => { if (o.status === "Pending") st[o.id] = 1; }); (src.orderLines || []).forEach((l) => { if (st[l.id] && l.sap && l.ea > 0) pend[l.sap] = (pend[l.sap] || 0) + l.ea; }); }
  const own = {}, qc = {}; (src.stock || []).forEach((s) => { if (s.sap) own[s.sap] = Math.round(((s.ea || 0) + (pend[s.sap] || 0)) * 1000) / 1000; }); (src.qcStock || []).forEach((s) => { if (s.sap) qc[s.sap] = Math.round((s.crates || 0) * 1000) / 1000; });
  D.stockOpen[m] = { at, by: HOST ? ME.name : undefined, own, qc, phys: true };
  logActivity("Opening stock recorded", stkMonthName(m), "For the monthly stock statement");
  return true;
}
function stockOpenCheck(fromSave) {
  if (typeof D === "undefined" || !CAN_EDIT) return false;
  const m = ymd(NOW()).slice(0, 7), ms = stkMS(m); if ((D.stockOpen || {})[m]) return false;
  /* records made from the "at" minute on count as after the opening (times are kept to the minute) */
  if (fromSave) { if (!SAVE.lastObj) return false; return stockOpenTake(SAVE.lastObj, SAVE.lastAt && SAVE.lastAt >= ms ? SAVE.lastAt : ms); }
  const mv = stkMoves(ms, STK_NOW), moved = Object.keys(mv.own).length + Object.keys(mv.qc).length > 0;
  return stockOpenTake({ stock: D.stock, qcStock: D.qcStock }, moved ? iso(NOW()) : ms);
}

/* ---------- product details shared by the statements ---------- */
const stkInfo = (sap) => { const s = stockBySap[sap] || qcBySap[sap] || catBySap[sap] || {}, c = catBySap[sap] || {}; return { name: s.name || c.name || sap, trop: s.trop || "", cat: s.cat || c.cat || "", upc: s.upc || c.upc || 0, ppe: s.ppe || c.ppe || 1, ppc: (qcBySap[sap] || {}).ppc || (s.upc || 0) * (s.ppe || 1) }; };
const stkR2 = (x) => (x == null || isNaN(x) ? null : Math.round(x * 100) / 100);
const stkSort = (a, b) => (a.i.cat || "").localeCompare(b.i.cat || "") || a.i.name.localeCompare(b.i.name);
const stkSS = (sap) => { const r = ssRate(sap); if (r != null) return r; const s = stockBySap[sap]; return s && s.cost != null ? s.cost : null; };

/* ---------- stock as on a date ---------- */
function stkAsOnSheets(d, pool) {
  const today = ymd(NOW()); if (!d || d > today) d = today;
  const live = d === today, T = live ? STK_NOW : ymd(new Date(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10) + 1)) + "T00:00", pts = stkPoints();
  const when = live ? `as of ${stampOf(NOW())}` : `as on ${dmyOf(d)} (end of the day)`, sheets = [];
  if (pool !== "qc") {
    const A = stkValueAt(T, "own", pts), V = A.v; /* current stock: at Tropicana */
    /* reserved at that moment: orders saved and not yet dispatched (their SahiReach part), and today also Swiggy / Zepto pick lists */
    const booked = live ? pendingEA() : stkBookedAt(T);
    const saps = new Set([...D.stock.map((s) => s.sap), ...Object.keys(V), ...Object.keys(booked)]);
    const rows = [...saps].map((sap) => ({ sap, i: stkInfo(sap), ea: V[sap] || 0, bk: booked[sap] || 0 })).filter((r) => r.i.upc && (stockBySap[r.sap] || Math.abs(r.ea) > 1e-6 || r.bk)).sort(stkSort);
    const head = ["Tropicana Code", "Product", "SAP code", "Category", "Boxes per crate", "Current stock (crates)", "Reserved for orders not dispatched (crates)"].concat(live ? ["Reserved for Swiggy / Zepto pick lists (crates)"] : [], ["Available for sale (crates)", "Current stock (boxes)", "Available for sale (boxes)", "SS rate / box", "Value at SS rate"]);
    const aoa = [[`GT STOCK STATEMENT · SahiReach LLP own stock at Tropicana · ${when}`],
      [(live ? "Current stock is what is at Tropicana now." : `Worked out from ${stkFromTxt(A.from)} by taking back the recorded movements after ${dmyOf(d)}.`) + " Reserved is blocked by orders saved but not yet dispatched" + (live ? " and by sent Swiggy / Zepto pick lists" : "") + ". Available for sale = current − reserved."], head];
    const tot = { cr: 0, ea: 0, ro: 0, h: 0, av: 0, avea: 0, val: 0 };
    rows.forEach((r) => {
      const u = r.i.upc, book = r.ea - r.bk, fromQC = book < 0 ? -book : 0, ro = Math.max(0, r.bk - fromQC), held = live ? ownHeldEA(r.sap) : 0, av = r.ea - ro - held, ss = stkSS(r.sap), val = ss != null ? r.ea * ss : null;
      tot.cr += r.ea / u; tot.ea += r.ea; tot.ro += ro / u; tot.h += held / u; tot.av += av / u; tot.avea += av; tot.val += val || 0;
      aoa.push([r.i.trop, r.i.name, r.sap, r.i.cat, u, stkR2(r.ea / u), stkR2(ro / u)].concat(live ? [stkR2(held / u)] : [], [stkR2(av / u), stkR2(r.ea), stkR2(av), ss != null ? stkR2(ss) : null, stkR2(val)]));
    });
    aoa.push(["", "TOTAL", "", "", "", stkR2(tot.cr), stkR2(tot.ro)].concat(live ? [stkR2(tot.h)] : [], [stkR2(tot.av), stkR2(tot.ea), stkR2(tot.avea), "", stkR2(tot.val)]));
    sheets.push({ name: "GT stock", aoa, cols: [14, 46, 11, 16, 9, 11, 14].concat(live ? [14] : [], [12, 11, 12, 11, 14]) });
  }
  if (pool !== "gt") {
    const A = stkValueAt(T, "qc", pts), V = A.v;
    const saps = new Set([...D.qcStock.map((s) => s.sap), ...Object.keys(V)]);
    const rows = [...saps].map((sap) => ({ sap, i: stkInfo(sap), q: qcBySap[sap] || {}, cr: V[sap] || 0 })).filter((r) => qcBySap[r.sap] || Math.abs(r.cr) > 1e-6).sort(stkSort);
    const head = ["Tropicana Code", "Product", "SAP code", "Category", "Pieces per crate", "Current stock (crates)"].concat(live ? ["Reserved (crates)", "Available for sale (crates)", "On open POs (crates)", "Free after open POs (crates)", "Swiggy price / piece", "Zepto price / piece"] : [], ["SS rate / box", "Value at SS rate"]);
    const aoa = [[`QUICK COMMERCE STOCK STATEMENT · Swiggy and Zepto stock at Tropicana · ${when}`],
      [live ? "One stock shared by Swiggy and Zepto, in crates, at Tropicana until delivered. Reserved = held for sent pick lists + promised to distributor orders. Available for sale = current − reserved." : `Worked out from ${stkFromTxt(A.from)} by taking back the recorded movements after ${dmyOf(d)}.`], head];
    const tot = { cr: 0, res: 0, av: 0, open: 0, val: 0 };
    rows.forEach((r) => {
      const u = r.q.upc || r.i.upc, ss = stkSS(r.sap), val = ss != null && u ? r.cr * u * ss : null, x = live && qcBySap[r.sap] ? qcSplit(r.q) : { res: 0, avail: r.cr };
      tot.cr += r.cr; tot.res += x.res; tot.av += x.avail; tot.open += live ? r.q.openCrates || 0 : 0; tot.val += val || 0;
      aoa.push([r.q.trop || r.i.trop, r.i.name, r.sap, r.q.cat || r.i.cat, r.q.ppc || r.i.ppc || null, stkR2(r.cr)].concat(live ? [stkR2(x.res), stkR2(x.avail), stkR2(r.q.openCrates || 0), r.q.free != null ? stkR2(r.q.free) : null, stkR2(r.q.swPrice || null), stkR2(r.q.zpPrice || null)] : [], [ss != null ? stkR2(ss) : null, stkR2(val)]));
    });
    aoa.push(["", "TOTAL", "", "", "", stkR2(tot.cr)].concat(live ? [stkR2(tot.res), stkR2(tot.av), stkR2(tot.open), "", "", ""] : [], ["", stkR2(tot.val)]));
    sheets.push({ name: "Quick commerce stock", aoa, cols: [16, 46, 11, 16, 9, 11].concat(live ? [10, 12, 12, 12, 11, 11] : [], [11, 14]) });
  }
  const label = pool === "gt" ? "GT stock statement" : pool === "qc" ? "quick commerce stock statement" : "stock statement (GT and quick commerce)";
  return { file: `SahiReach ${label} as on ${dmyOf(d)}.xlsx`, sheets, d };
}

/* ---------- month movement statement: opening + in − out ± corrections = closing ---------- */
function stkMonthData(m) {
  const ms = stkMS(m), me = stkMS(stkNext(m)), cur = me > iso(NOW()), pts = stkPoints(), end = cur ? STK_NOW : me;
  const pO = pts.find((x) => x.at >= ms), pC = cur ? pts[pts.length - 1] : pts.find((x) => x.at >= me);
  const toO = stkMoves(ms, pO.at), toC = stkMoves(end, pC.at), mv = stkMoves(ms, end);
  const exact = !pO.now && pO.m === m, out = {}, bookC = cur ? pendingEA() : stkBookedAt(me);
  ["own", "qc"].forEach((pool) => {
    const saps = new Set([...Object.keys(pO[pool]), ...Object.keys(pC[pool]), ...Object.keys(mv[pool]), ...(pool === "own" ? D.stock : D.qcStock).map((s) => s.sap)]);
    out[pool] = [...saps].map((sap) => {
      const open = (pO[pool][sap] || 0) - stkNet(toO[pool][sap]), close = (pC[pool][sap] || 0) - stkNet(toC[pool][sap]), M = mv[pool][sap] || {}, corr = close - open - stkNet(M);
      const r = { sap, i: stkInfo(sap), open, close, M, corr: Math.abs(corr) < 1e-6 ? 0 : corr };
      /* SahiReach stock at the close: reserved for orders not yet dispatched (and, today, Swiggy / Zepto pick lists) */
      if (pool === "own") { const bk = bookC[sap] || 0, book = close - bk, ro = Math.max(0, bk - (book < 0 ? -book : 0)), held = cur && typeof ownHeldEA === "function" ? ownHeldEA(sap) : 0; r.res = ro + held; r.avail = close - r.res; }
      return r;
    }).filter((r) => Math.abs(r.open) > 1e-6 || Math.abs(r.close) > 1e-6 || r.corr || Object.keys(r.M).some((k) => Math.abs(r.M[k]) > 1e-6)).sort(stkSort);
  });
  return { m, ms, me, cur, exact, pO, pC, own: out.own, qc: out.qc, toTxt: cur ? `${dmyOf(ymd(NOW()))} (today)` : dmyOf(ymd(new Date(+m.slice(0, 4), +m.slice(5, 7), 0))) };
}
function stkMonthSheets(m, pool) {
  const R = stkMonthData(m), name = stkMonthName(m), short = name.slice(0, 3) + " " + m.slice(0, 4), sheets = [];
  const openTxt = R.exact ? `Opening stock: recorded on ${fmtDT(stkAt(R.pO.at))}${R.pO.by ? " (" + R.pO.by + " was the first to use the tool that month)" : ""}.` : `Opening stock: worked out from ${stkFromTxt(R.pO)} by taking back the recorded movements. Stock corrections in that time cannot be separated, so they are inside the opening figure.`;
  const closeTxt = R.cur ? "Closing stock: today's stock." : R.pC.now ? "Closing stock: worked out from today's stock by taking back the recorded movements since." : `Closing stock: the opening stock recorded for ${stkMonthName(R.pC.m)}.`;
  if (pool !== "qc") {
    const head = ["Tropicana Code", "Product", "SAP code", "Category", "Boxes per crate", "Opening (crates)", "Received from Hangyo", "Sales returns (good)", "Taken from quick commerce stock", "Dispatched to distributors", "Sent with Swiggy / Zepto deliveries", "Returned to Hangyo", "Stock corrections", "Closing (crates)", "Closing (boxes)", "Reserved at close (crates)", "Available for sale at close (crates)", "SS rate / box", "Opening value at SS rate", "Closing value at SS rate"];
    const aoa = [[`GT STOCK STATEMENT · SahiReach LLP own stock · ${name}${R.cur ? " so far" : ""} (01-${m.slice(5, 7)}-${m.slice(0, 4)} to ${R.toTxt})`], [openTxt + " " + closeTxt], ["All quantities in crates. Opening + received + returns + from quick commerce − dispatched − sent − returned to Hangyo ± corrections = closing. Stock is at Tropicana until an order is dispatched; until then it is reserved, and available for sale = closing − reserved."], [], head];
    const K = ["recv", "ret", "fromQC", "sold", "toPlat", "pret"], tot = { open: 0, close: 0, corr: 0, ea: 0, res: 0, av: 0, ov: 0, cv: 0 }; K.forEach((k) => (tot[k] = 0));
    R.own.forEach((r) => {
      const u = r.i.upc || 1, ss = stkSS(r.sap), c = (x) => stkR2(x / u);
      tot.open += r.open / u; tot.close += r.close / u; tot.corr += r.corr / u; tot.ea += r.close; tot.res += r.res / u; tot.av += r.avail / u; K.forEach((k) => (tot[k] += (r.M[k] || 0) / u)); if (ss != null) { tot.ov += r.open * ss; tot.cv += r.close * ss; }
      aoa.push([r.i.trop, r.i.name, r.sap, r.i.cat, r.i.upc || null, c(r.open)].concat(K.map((k) => c(r.M[k] || 0)), [c(r.corr), c(r.close), stkR2(r.close), c(r.res), c(r.avail), ss != null ? stkR2(ss) : null, ss != null ? stkR2(r.open * ss) : null, ss != null ? stkR2(r.close * ss) : null]));
    });
    aoa.push(["", "TOTAL", "", "", "", stkR2(tot.open)].concat(K.map((k) => stkR2(tot[k])), [stkR2(tot.corr), stkR2(tot.close), stkR2(tot.ea), stkR2(tot.res), stkR2(tot.av), "", stkR2(tot.ov), stkR2(tot.cv)]));
    sheets.push({ name: "GT movement " + short, aoa, cols: [14, 46, 11, 16, 8, 10, 10, 10, 12, 11, 12, 10, 11, 10, 10, 11, 12, 11, 14, 14] });
  }
  if (pool !== "gt") {
    const head = ["Tropicana Code", "Product", "SAP code", "Category", "Pieces per crate", "Opening (crates)", "Received from Hangyo", "Came back good (GRN)", "Delivered to Swiggy", "Delivered to Zepto", "Used for distributor orders", "Stock corrections", "Closing (crates)", "SS rate / box", "Opening value at SS rate", "Closing value at SS rate"];
    const aoa = [[`QUICK COMMERCE STOCK STATEMENT · Swiggy and Zepto · ${name}${R.cur ? " so far" : ""} (01-${m.slice(5, 7)}-${m.slice(0, 4)} to ${R.toTxt})`], [openTxt + " " + closeTxt], ["All quantities in crates. Opening + received + came back − delivered − used for distributors ± corrections = closing. Deliveries count when they are marked delivered."], [], head];
    const K = ["recv", "back", "sw", "zp", "dist"], tot = { open: 0, close: 0, corr: 0, ov: 0, cv: 0 }; K.forEach((k) => (tot[k] = 0));
    R.qc.forEach((r) => {
      const q = qcBySap[r.sap] || {}, u = q.upc || r.i.upc, ss = stkSS(r.sap);
      tot.open += r.open; tot.close += r.close; tot.corr += r.corr; K.forEach((k) => (tot[k] += r.M[k] || 0)); if (ss != null && u) { tot.ov += r.open * u * ss; tot.cv += r.close * u * ss; }
      aoa.push([q.trop || r.i.trop, r.i.name, r.sap, q.cat || r.i.cat, q.ppc || r.i.ppc || null, stkR2(r.open)].concat(K.map((k) => stkR2(r.M[k] || 0)), [stkR2(r.corr), stkR2(r.close), ss != null ? stkR2(ss) : null, ss != null && u ? stkR2(r.open * u * ss) : null, ss != null && u ? stkR2(r.close * u * ss) : null]));
    });
    aoa.push(["", "TOTAL", "", "", "", stkR2(tot.open)].concat(K.map((k) => stkR2(tot[k])), [stkR2(tot.corr), stkR2(tot.close), "", stkR2(tot.ov), stkR2(tot.cv)]));
    sheets.push({ name: "QC movement " + short, aoa, cols: [16, 46, 11, 16, 8, 10, 10, 10, 10, 10, 12, 11, 10, 11, 14, 14] });
  }
  const label = pool === "gt" ? "GT stock movement" : pool === "qc" ? "quick commerce stock movement" : "stock movement (GT and quick commerce)";
  return { file: `SahiReach ${label} ${name}${R.cur ? " so far" : ""}.xlsx`, sheets, R };
}

/* ---------- the download choice on the Stock page ---------- */
function stkMonths() {
  const now = ymd(NOW()).slice(0, 7); let first = now;
  D.orders.forEach((o) => { const m = (o.time || "").slice(0, 7); if (m && m < first) first = m; });
  Object.keys(D.stockOpen || {}).forEach((m) => { if (m < first) first = m; });
  const out = []; for (let m = now; m >= first && out.length < 24; ) { out.push(m); const y = +m.slice(0, 4), mo = +m.slice(5, 7); m = mo === 1 ? `${y - 1}-12` : `${y}-${pad2(mo - 1)}`; }
  return out;
}
function stkBody() {
  const K = S.stk, today = ymd(NOW()), months = stkMonths();
  const poolBtn = (v, l) => `<button data-act="stkPool" data-v="${v}" aria-pressed="${K.pool === v}">${l}</button>`;
  const rec = D.stockOpen || {}, mo = K.m || months[0];
  return `<div class="field"><div class="label">Which stock</div><div class="seg" role="group">${poolBtn("gt", "GT (SahiReach)")}${poolBtn("qc", "Quick commerce")}${poolBtn("both", "Both")}</div></div>
    <div class="card card-pad"><div class="card-title">Stock statement as on a date</div><div class="row-sub" style="margin-top:4px">Every product with crates, boxes and value.${K.pool !== "qc" ? " Shows current stock at Tropicana, what is reserved for orders not yet dispatched, and what is available for sale." : ""} For today it also shows what is held for sent pick lists and what is free.</div>
      <div class="hstack gap-12 wrap" style="margin-top:12px;align-items:flex-end"><div class="field" style="min-width:170px"><label class="label" for="stk-date">As on</label><input class="input" type="date" id="stk-date" max="${today}" value="${esc(K.d || today)}" data-in="stkDate"></div><button class="btn btn-primary" data-act="stkAsOn">${ic("doc", "sm")} Download</button></div></div>
    <div class="card card-pad"><div class="card-title">Month movement statement</div><div class="row-sub" style="margin-top:4px">For each product: opening stock, what came in, what went out, corrections and closing stock for the month.</div>
      <div class="hstack gap-12 wrap" style="margin-top:12px;align-items:flex-end"><div class="field" style="min-width:200px"><label class="label" for="stk-month">Month</label><select class="select" id="stk-month" data-in="stkMonth">${months.map((m, i) => `<option value="${m}" ${m === mo ? "selected" : ""}>${stkMonthName(m)}${i === 0 ? " (so far)" : ""}</option>`).join("")}</select></div><button class="btn btn-primary" data-act="stkMonthDl">${ic("doc", "sm")} Download</button></div>
      <div class="row-sub" style="margin-top:10px" id="stk-month-note">${stkMonthNote(mo, rec)}</div></div>
    <div class="card card-pad"><div class="hstack between wrap gap-12"><div><div class="card-title">Full stock report</div><div class="row-sub">Own stock, quick commerce stock, purchases and missed sales in one file.</div></div><button class="btn btn-secondary" data-act="stockFull">${ic("doc", "sm")} Download</button></div></div>`;
}
const stkMonthNote = (m, rec) => (rec[m] && stkAt(rec[m].at) === stkMS(m) ? `Opening stock for ${stkMonthName(m)} was recorded on 1 ${stkMonthName(m).split(" ")[0]}.` : rec[m] ? `Opening stock for ${stkMonthName(m)} was recorded on ${fmtDT(stkAt(rec[m].at))}; movements before that are taken back from it.` : `The opening stock for ${stkMonthName(m)} is worked out from later stock by taking back the recorded movements. From now on the tool records each month's opening stock itself, on the first use of the month.`);
ACT.stockExcel = () => {
  S.stk = S.stk || { pool: "both", d: ymd(NOW()), m: null };
  openSheet("Download stock", `<div id="stk-body" class="stack gap-16">${stkBody()}</div>`, `<button class="btn btn-secondary" data-act="closeSheet">Close</button>`);
};
ACT.stkPool = (el) => { S.stk.pool = el.dataset.v; part("stk-body", stkBody()); };
IN.stkDate = (el) => { S.stk.d = el.value; };
IN.stkMonth = (el) => { S.stk.m = el.value; part("stk-month-note", stkMonthNote(el.value, D.stockOpen || {})); };
const stkPoolTxt = (p) => (p === "gt" ? "GT stock" : p === "qc" ? "Quick commerce stock" : "GT and quick commerce stock");
ACT.stkAsOn = async (el) => {
  const d = ($("#stk-date") || {}).value || ymd(NOW()), B = stkAsOnSheets(d, S.stk.pool);
  if (await downloadBook(el, B.sheets, B.file)) { logActivity("Stock statement downloaded", stkPoolTxt(S.stk.pool), "As on " + dmyOf(B.d)); toast(`${stkPoolTxt(S.stk.pool)} as on ${dmyOf(B.d)} downloaded`, "doc"); }
};
ACT.stkMonthDl = async (el) => {
  const m = ($("#stk-month") || {}).value || stkMonths()[0], B = stkMonthSheets(m, S.stk.pool);
  if (await downloadBook(el, B.sheets, B.file)) { logActivity("Stock statement downloaded", stkPoolTxt(S.stk.pool), "Movement for " + stkMonthName(m)); toast(`${stkPoolTxt(S.stk.pool)} movement for ${stkMonthName(m)} downloaded`, "doc"); }
};

/* ===== STOCK: CURRENT, RESERVED AND AVAILABLE FOR SALE =====
   An order's boxes come off the stock figure (st.ea) when the order is saved, so st.ea is what is left to sell.
   Until the order is dispatched those boxes are still at Tropicana, blocked for that order.
     Current stock (at Tropicana) = st.ea + boxes on orders not yet dispatched
     Reserved                     = boxes on orders not yet dispatched that come from SahiReach stock
                                    + SahiReach boxes held for a sent Swiggy / Zepto pick list
     Available for sale           = current − reserved
   A negative st.ea is stock promised from quick commerce stock (it is not SahiReach's, so it is not reserved here). */
function pendingEA() {
  const m = {}; D.orders.forEach((o) => { if (o.status !== "Pending") return; (linesByOrder[o.id] || []).forEach((l) => { if (l.sap && l.ea > 0) m[l.sap] = (m[l.sap] || 0) + l.ea; }); });
  return m;
}
function stockSplit(s, P) {
  P = P || pendingEA();
  const u = s.upc || 1, pend = P[s.sap] || 0, ea = s.ea || 0, fromQC = ea < 0 ? -ea : 0;
  const cur = ea + pend, resOrd = Math.max(0, pend - fromQC), held = typeof ownHeldEA === "function" ? ownHeldEA(s.sap) : 0, res = resOrd + held, avail = cur - res;
  return { cur, resOrd, held, res, avail, u, cr: { cur: cur / u, resOrd: resOrd / u, held: held / u, res: res / u, avail: avail / u } };
}
function stockTotals(list, P) {
  P = P || pendingEA(); const t = { cur: 0, res: 0, avail: 0, resOrd: 0, held: 0, n: 0, inStock: 0, vCur: 0, vAvail: 0 };
  (list || D.stock).forEach((s) => { const x = stockSplit(s, P), uc = s.cost || 0; t.cur += x.cr.cur; t.res += x.cr.res; t.avail += x.cr.avail; t.resOrd += x.cr.resOrd; t.held += x.cr.held; t.n++; if (x.avail > 1e-9) t.inStock++; t.vCur += x.cur * uc; t.vAvail += x.avail * uc; });
  return t;
}
const pendingOrderCount = () => D.orders.filter((o) => o.status === "Pending").length;
/* quick commerce: crates are taken off when delivered, so they are all at Tropicana until then */
function qcSplit(q) {
  const cur = q.crates || 0, held = typeof qcHeld === "function" ? qcHeld(q.sap).q : 0, gt = typeof gtFromQC === "function" ? gtFromQC(q.sap) : 0, res = held + gt;
  return { cur, held, gt, res, avail: cur - res };
}

/* ===== CHECK THE STOCK AGAINST TROPICANA'S LEDGER STATEMENT =====
   Upload Tropicana's daily ledger statement (SAHIREACH_LS_ddmmyy.xls: Code, Description, Base OP / IN / OUT / CL in
   crates). Each line is matched to our products by the Tropicana code (SR / SH xxx); lines with "(Swiggy)" in the
   name, or an SH code, are quick commerce stock. Our CURRENT stock (reserved included: it is still in the store) is
   compared with Tropicana's closing crates. When the statement is for an earlier day, our stock is worked back to the
   end of that day. Codes the tool does not have are matched by name: sure ones are saved, doubtful ones are asked.
   Every difference gets the likely reasons the records show. */
const RC_CODE = /^(S[RH])\s*-?\s*(\d{1,4})\b/i;
const rcCode = (s) => { const m = String(s || "").trim().match(RC_CODE); return m ? `${m[1].toUpperCase()} ${m[2].padStart(3, "0")}` : null; };
const rcCodesOf = (t) => String(t || "").split(/[+,/&]|\band\b/i).map(rcCode).filter(Boolean);
const RC_MON = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const rcR2 = (x) => Math.round(x * 100) / 100;
const rcNear = (a, b) => Math.abs(a - b) < 0.02;
const rcCr = (n) => `${nf(n, 2)} crate${Math.abs(n - 1) < 1e-9 ? "" : "s"}`;

/* ---------- reading the statement ---------- */
function rcParse(rows, filename) {
  rows = rows.map((r) => (r || []).map((v) => (v == null ? "" : String(v).trim())));
  let date = null;
  rows.slice(0, 6).forEach((r) => r.forEach((c) => { const m = c.match(/(\d{1,2})[-\s/]([A-Za-z]{3})[a-z]*[-\s/](\d{4})/); if (m && !date && RC_MON[m[2].toLowerCase()]) date = `${m[3]}-${pad2(RC_MON[m[2].toLowerCase()])}-${pad2(+m[1])}`; }));
  if (!date && filename) { const m = String(filename).match(/(\d{2})(\d{2})(\d{2})(?!\d)/); if (m) date = `20${m[3]}-${m[2]}-${m[1]}`; }
  const hi = rows.findIndex((r) => r.some((c) => /^code$/i.test(c)) && r.some((c) => /\bcl\b|closing/i.test(c)));
  if (hi < 0) return { error: "This does not look like Tropicana's ledger statement: there is no Code / Base CL header." };
  const H = rows[hi], col = (re) => H.findIndex((c) => re.test(c));
  const C = { code: col(/^code$/i), desc: col(/desc/i), op: col(/\bop\b|opening/i), inn: col(/\bin\b/i), out: col(/\bout\b/i), cl: col(/\bcl\b|closing/i), uom: col(/uom|unit/i) };
  const lines = []; let total = null;
  rows.slice(hi + 1).forEach((r) => {
    const code = rcCode(r[C.code]), n = (j) => (j >= 0 ? +String(r[j] || "0").replace(/,/g, "") || 0 : 0);
    if (!code) { if (/^total$/i.test(r[C.desc] || "") && total == null) total = n(C.cl); return; }
    const desc = String(r[C.desc] || "").replace(RC_CODE, "").trim();
    lines.push({ code, desc, qc: /^SH/.test(code) || /\(\s*swiggy\s*\)|\bswiggy\b/i.test(desc), op: n(C.op), inn: n(C.inn), out: n(C.out), cl: n(C.cl), uom: C.uom >= 0 ? r[C.uom] : "crates" });
  });
  if (!lines.length) return { error: "No product lines (SR / SH codes) were found in that file." };
  return { date, lines, total, file: filename || "" };
}

/* ---------- matching lines to products ---------- */
const rcPoolList = (qc) => (qc ? D.qcStock : D.stock);
const rcProd = (qc, sap) => (qc ? qcBySap[sap] : stockBySap[sap]);
function rcSuggest(line, onLS) {
  /* candidates: products on this side, leaving out ones that already carry another code that is on the statement */
  const pool = rcPoolList(line.qc).filter((s) => !rcCodesOf(s.trop).some((c) => c !== line.code && onLS && onLS.has((line.qc ? "Q" : "O") + c))), have = new Set(pool.map((s) => s.sap));
  const raw = line.desc.replace(/\(\s*swiggy\s*\)/gi, " ").replace(/\*/g, " x ");
  const M = impMatch(raw).filter((x) => have.has(x.sap));
  if (!M.length) return { sure: false, opts: [] };
  const top = M[0], second = M[1], p = rcProd(line.qc, top.sap), taken = rcCodesOf(p && p.trop).filter((c) => c !== line.code);
  /* sure: a clear winner that has no other code yet on this side */
  const sure = top.score >= 0.75 && (!second || top.score - second.score >= 0.15) && (line.qc || !taken.length);
  return { sure, sap: top.sap, opts: M.slice(0, 5).map((x) => x.sap) };
}
function rcSetCode(qc, sap, code) {
  const p = rcProd(qc, sap); if (!p) return false;
  const now = rcCodesOf(p.trop);
  if (now.includes(code)) return true;
  if (qc) p.trop = now.length ? `${p.trop} + ${code}` : code;
  else p.trop = code; /* SahiReach stock: one Tropicana code per product */
  if (qc && stockBySap[sap] && !rcCodesOf(stockBySap[sap].trop).length) { /* nothing */ }
  return true;
}

/* ---------- the comparison ---------- */
function rcRun(ls) {
  const today = ymd(NOW()), d = ls.date && ls.date < today ? ls.date : today, T = d < today ? addDays(d, 1) + "T00:00" : STK_NOW;
  const ownAt = stkValueAt(T, "own").v, qcAt = stkValueAt(T, "qc").v;
  const pend = d < today ? stkBookedAt(T) : pendingEA();
  /* sure codes are saved now; doubtful ones are asked */
  const ask = [], added = [];
  const byCode = (qc, code) => rcPoolList(qc).filter((s) => rcCodesOf(s.trop).includes(code)), onLS = new Set(ls.lines.map((l) => (l.qc ? "Q" : "O") + l.code));
  ls.lines.forEach((l) => {
    if (byCode(l.qc, l.code).length) return;
    const g = rcSuggest(l, onLS);
    if (g.sure && CAN_EDIT) { rcSetCode(l.qc, g.sap, l.code); added.push({ code: l.code, desc: l.desc, qc: l.qc, sap: g.sap }); }
    else ask.push({ code: l.code, desc: l.desc, qc: l.qc, cl: l.cl, sap: g.sap || "", opts: g.opts });
  });
  if (added.length) logActivity("Tropicana codes added", `${added.length} product${added.length > 1 ? "s" : ""}`, added.map((a) => `${a.code} → ${shortName((rcProd(a.qc, a.sap) || {}).name || a.sap)}`).join(", "));
  /* groups: Tropicana lines and our products joined through their codes */
  const parent = {}, find = (x) => (parent[x] === undefined ? (parent[x] = x) : parent[x] === x ? x : (parent[x] = find(parent[x]))), uni = (a, b) => { parent[find(a)] = find(b); };
  const lineBy = {}; ls.lines.forEach((l) => { lineBy[l.code] = l; find("L:" + l.code); });
  D.stock.forEach((s) => { const k = "O:" + s.sap; find(k); rcCodesOf(s.trop).forEach((c) => { if (lineBy[c] && !lineBy[c].qc) uni(k, "L:" + c); }); });
  D.qcStock.forEach((q) => { const k = "Q:" + q.sap; find(k); rcCodesOf(q.trop).forEach((c) => { if (lineBy[c] && lineBy[c].qc) uni(k, "L:" + c); }); });
  const G = {}; Object.keys(parent).forEach((k) => { const r = find(k); (G[r] = G[r] || []).push(k); });
  const rows = [];
  Object.values(G).forEach((ks) => {
    const L = ks.filter((k) => k[0] === "L").map((k) => lineBy[k.slice(2)]), O = ks.filter((k) => k[0] === "O").map((k) => k.slice(2)), Q = ks.filter((k) => k[0] === "Q").map((k) => k.slice(2));
    const qc = Q.length > 0 || (L.length > 0 && L.every((l) => l.qc));
    const saps = qc ? Q : O;
    const ours = qc ? Q.reduce((a, s) => a + (qcAt[s] || 0), 0) : O.reduce((a, s) => { const st = stockBySap[s]; return a + (st && st.upc ? (ownAt[s] || 0) / st.upc : 0); }, 0);
    const trop = L.reduce((a, l) => a + l.cl, 0);
    if (!L.length && Math.abs(ours) < 0.005) return; /* nothing at Tropicana, nothing with us */
    if (!saps.length && !L.length) return;
    const diff = rcR2(ours - trop), names = saps.map((s) => (rcProd(qc, s) || {}).name || s);
    const r = { qc, saps, codes: L.length ? L.map((l) => l.code) : [...new Set(saps.flatMap((s) => rcCodesOf((rcProd(qc, s) || {}).trop)))], names: names.length ? names : L.map((l) => l.desc), desc: L.map((l) => l.desc), ours: rcR2(ours), trop, diff, op: L.reduce((a, l) => a + l.op, 0), inn: L.reduce((a, l) => a + l.inn, 0), out: L.reduce((a, l) => a + l.out, 0), status: "match", why: [] };
    if (!saps.length) { r.status = "unmapped"; r.why.push("No product in the tool has this Tropicana code yet. Choose the product above."); rows.push(r); return; }
    if (Math.abs(diff) < 0.01) { rows.push(r); return; }
    rcExplain(r, { d, T, today, pend });
    rows.push(r);
  });
  /* the same product off in opposite directions in the two pools: booked under the wrong one */
  rows.forEach((a) => { if (a.qc || a.status === "match") return; rows.forEach((b) => { if (!b.qc || b.status === "match" || !b.saps.some((s) => a.saps.includes(s))) return; if (rcNear(a.diff + b.diff, 0)) { const t = `SahiReach and quick commerce together match Tropicana: ${rcCr(Math.abs(a.diff))} are under the wrong one. Move them between the two stocks.`; a.why.unshift(t); b.why.unshift(t); a.status = b.status = "explained"; } }); });
  /* two products of the same kind off by the same crates in opposite directions: one was likely picked in place of the other */
  const grp = (r) => { const st = r.saps.length === 1 ? stockBySap[r.saps[0]] || qcBySap[r.saps[0]] || catBySap[r.saps[0]] : null; return st ? IMP_CAT_GROUP(st.cat) : null; };
  rows.forEach((a) => { if (a.status !== "open" && a.status !== "explained") return; rows.forEach((b) => { if (b === a || b.qc !== a.qc || (b.status !== "open" && b.status !== "explained") || Math.abs(a.diff) < 1 || !rcNear(a.diff + b.diff, 0) || !grp(a) || grp(a) !== grp(b)) return; a.why.unshift(`${shortName(b.names[0])} is ${nf(Math.abs(b.diff), 2)} crate${Math.abs(b.diff) === 1 ? "" : "s"} ${b.diff > 0 ? "over" : "short"} by the same amount: one may have been picked or sent in place of the other.`); a.status = "explained"; }); });
  const ord = { unmapped: 0, open: 1, explained: 2, loose: 3, match: 4 };
  rows.sort((a, b) => ord[a.status] - ord[b.status] || Math.abs(b.diff) - Math.abs(a.diff) || String(a.names[0]).localeCompare(String(b.names[0])));
  const sum = (qc) => { const R = rows.filter((r) => r.qc === qc); return { n: R.length, match: R.filter((r) => r.status === "match").length, loose: R.filter((r) => r.status === "loose").length, explained: R.filter((r) => r.status === "explained").length, open: R.filter((r) => r.status === "open" || r.status === "unmapped").length, ours: rcR2(R.reduce((a, r) => a + r.ours, 0)), trop: R.reduce((a, r) => a + r.trop, 0) }; };
  return { at: iso(NOW()), by: HOST ? ME.name : undefined, file: ls.file, date: ls.date, asOf: d, tropTotal: ls.total, lines: ls.lines, rows, ask, added, own: sum(false), qcs: sum(true) };
}
/* what the records say about one difference */
function rcExplain(r, X) {
  const diff = r.diff, abs = Math.abs(diff), why = r.why, units = (sap) => { const st = stockBySap[sap] || qcBySap[sap] || {}; return st.upc || 1; };
  const ours = r.ours, whole = Math.abs(ours - Math.round(ours)) < 0.01;
  if (abs < 1 && !whole) { r.status = "loose"; why.push(`Loose boxes: we have ${rcCr(ours)}, and Tropicana counts whole crates only.`); return; }
  let explained = false;
  const crOf = (o, qc) => (linesByOrder[o.id] || []).filter((l) => r.saps.includes(l.sap)).reduce((a, l) => a + (qc ? l.qc || 0 : (l.ea || 0) / units(l.sap)), 0);
  if (!r.qc) {
    /* orders saved, not yet dispatched in the tool: if Tropicana has sent them, Tropicana is lower by exactly that */
    const P = D.orders.filter((o) => o.status !== "Cancelled" && o.time < X.T && !(o.status === "Dispatched" && o.dispatched && o.dispatched < X.T)).map((o) => ({ o, cr: crOf(o, false) })).filter((x) => x.cr > 0);
    const pendCr = P.reduce((a, x) => a + x.cr, 0);
    if (diff > 0 && P.length) {
      const one = P.find((x) => rcNear(x.cr, diff));
      if (one) { why.push(`Tropicana may already have sent ${one.o.id} (${shortOf(one.o.dist)}, ${rcCr(one.cr)}): it is still not dispatched in the tool. If it has gone, mark it dispatched.`); explained = true; }
      else if (rcNear(pendCr, diff)) { why.push(`Tropicana may already have sent all ${P.length} orders waiting here (${P.map((x) => shortOf(x.o.dist)).join(", ")}, ${rcCr(pendCr)}). Mark them dispatched if they have gone.`); explained = true; }
      else why.push(`${rcCr(pendCr)} are reserved for orders not yet dispatched (${P.map((x) => `${shortOf(x.o.dist)} ${nf(x.cr, 1)}`).join(", ")}). If some of them have left the store, that explains part of it.`);
    }
    /* dispatched in the tool after the statement's day */
    if (diff < 0) {
      const after = D.orders.filter((o) => o.status === "Dispatched" && o.dispatched && o.dispatched.slice(0, 10) >= X.d).map((o) => ({ o, cr: crOf(o, false) })).filter((x) => x.cr > 0);
      const one = after.find((x) => rcNear(x.cr, -diff));
      if (one && X.d === X.today) { why.push(`${one.o.id} (${shortOf(one.o.dist)}, ${rcCr(one.cr)}) was marked dispatched today. Tropicana's statement may have been made before it left.`); explained = true; }
    }
  } else {
    /* quick commerce: deliveries */
    const dl = D.qcPOs.filter((p) => p.status === "Delivered" && p.deliveredOn && p.deliveredOn.slice(0, 10) >= X.d).map((p) => ({ p, cr: (qcLinesByPO[p.po] || []).filter((l) => r.saps.includes(l.sap)).reduce((a, l) => a + (l.delivered || 0) / (l.ppc || (qcBySap[l.sap] || {}).ppc || 1), 0) })).filter((x) => x.cr > 0);
    const one = dl.find((x) => rcNear(x.cr, -diff));
    if (diff < 0 && one) { why.push(`${one.p.platform} PO ${one.p.po} (${rcCr(one.cr)}) was marked delivered on ${fmtDate(one.p.deliveredOn)}. Tropicana's statement may have been made before it left.`); explained = true; }
    if (diff > 0) {
      const locks = (typeof qcLocks === "function" ? qcLocks() : []).map((L) => ({ L, cr: L.rows.filter((x) => r.saps.includes(x.sap)).reduce((a, x) => a + (x.fromQC || 0), 0) })).filter((x) => x.cr > 0);
      const lk = locks.find((x) => rcNear(x.cr, diff));
      if (lk) { why.push(`A ${lk.L.platform || "Swiggy / Zepto"} pick list for ${rcCr(lk.cr)} was sent but not marked delivered. If it has gone, mark it delivered.`); explained = true; }
      const gt = r.saps.reduce((a, s) => a + (typeof gtFromQC === "function" ? gtFromQC(s) : 0), 0);
      if (!explained && gt > 0 && rcNear(gt, diff)) { why.push(`${rcCr(gt)} were promised to distributor orders. If those orders have gone, mark them dispatched.`); explained = true; }
    }
  }
  /* stock that came in */
  const pool = r.qc ? /QC/i : /own/i;
  const pur = D.purchases.filter((p) => r.saps.includes(p.sap) && pool.test(p.pool || "") && p.time && p.time.slice(0, 10) >= addDays(X.d, -3)).reduce((m, p) => { (m[p.id] = m[p.id] || { id: p.id, time: p.time, cr: 0 }).cr += p.crates || (p.ea || 0) / units(p.sap); return m; }, {});
  Object.values(pur).forEach((p) => { if (rcNear(p.cr, Math.abs(diff))) { why.push(diff > 0 ? `${p.id} (${rcCr(p.cr)}) was received in the tool on ${fmtDate(p.time)}. Check that it reached Tropicana and is on their ledger.` : `${p.id} (${rcCr(p.cr)}) was received on ${fmtDate(p.time)}: check it was entered in full.`); explained = true; } });
  if (!r.qc) (D.notes || []).filter((n) => n.status === "Active" && Array.isArray(n.lines) && n.time && n.time.slice(0, 10) >= addDays(X.d, -7)).forEach((n) => { const cr = n.lines.filter((l) => r.saps.includes(l.sap) && l.stocked).reduce((a, l) => a + l.stocked / units(l.sap), 0); if (cr && rcNear(Math.abs(cr), Math.abs(diff))) { why.push(`${n.no || "A note"} (${shortOf(n.party)}) ${cr > 0 ? "put" : "took"} ${rcCr(Math.abs(cr))} ${cr > 0 ? "back into" : "out of"} stock on ${fmtDate(n.time)}. Check ${cr > 0 ? "the goods physically came back to Tropicana" : "they left Tropicana"}.`); explained = true; } });
  if (r.inn || r.out) why.push(`Tropicana's ledger shows ${r.inn ? nf(r.inn) + " in" : ""}${r.inn && r.out ? " and " : ""}${r.out ? nf(r.out) + " out" : ""} on ${fmtDate(X.d)}.`);
  if (ours < -0.005) why.push("Our stock is below zero: an order or delivery took more than we had. A purchase or return may be missing in the tool.");
  if (!explained) {
    why.push(diff > 0 ? `We show ${rcCr(abs)} more than Tropicana. Something went out that the tool has not recorded (a delivery, a return to Hangyo), or stock was entered twice.` : `Tropicana has ${rcCr(abs)} more than we show. Stock came in that the tool has not recorded (a purchase or a return), or an order took too much.`);
    const st = !r.qc && r.saps.length === 1 ? stockBySap[r.saps[0]] : r.qc && r.saps.length === 1 ? qcBySap[r.saps[0]] : null;
    if (st && st.move) why.push(`Last movement in the tool: ${st.move}`);
  }
  r.status = explained ? "explained" : "open";
}

/* ---------- screen ---------- */
const RC_ST = { match: ["good", "Matches"], loose: ["plain", "Loose boxes"], explained: ["warn", "Likely reason found"], open: ["bad", "Check"], unmapped: ["bad", "Code not linked"] };
function rcRowHtml(r) {
  const [cls, lbl] = RC_ST[r.status];
  return `<div class="row" style="align-items:flex-start;flex-wrap:wrap;gap:8px"><span class="grow" style="min-width:220px"><div class="row-title" style="white-space:normal">${esc(r.names.map(shortName).join(" + "))}</div>
    <div class="row-sub">${r.codes.length ? esc(r.codes.join(" + ")) : "No Tropicana code in the tool"} · we ${nf(r.ours, 2)} · Tropicana ${nf(r.trop)}</div>
    ${r.why.length ? `<ul style="margin:6px 0 0 16px;padding:0;color:var(--text-2);font-size:13px;line-height:1.45">${r.why.map((w) => `<li>${esc(w)}</li>`).join("")}</ul>` : ""}</span>
    <span class="row-end" style="flex-direction:column;align-items:flex-end;gap:6px"><span class="pill ${cls}" style="height:22px;font-size:12px">${lbl}</span>${r.status !== "match" ? `<span class="num" style="font-weight:600;color:${r.diff > 0 ? "var(--warn)" : "var(--bad)"}">${r.diff > 0 ? "+" : ""}${nf(r.diff, 2)} cr</span>` : ""}</span></div>`;
}
function rcAskHtml(R) {
  if (!R.ask.length) return "";
  return `<div class="card card-pad"><div class="card-title">Which product is this?</div><div class="row-sub" style="margin-top:4px">These Tropicana lines have no code in the tool and the name match is not certain. Choose the product once; the code is saved on it.</div>
    <div class="group" style="margin-top:12px">${R.ask.map((a, i) => { const pool = rcPoolList(a.qc), opts = a.opts.length ? a.opts : []; return `<div class="row" style="flex-wrap:wrap;gap:10px"><span class="grow" style="min-width:200px"><div class="row-title" style="white-space:normal"><span class="mono">${esc(a.code)}</span> ${esc(a.desc)}</div><div class="row-sub">${a.qc ? "Quick commerce" : "SahiReach stock"} · ${nf(a.cl)} crates at Tropicana</div></span>
      <span class="row-end hstack gap-8" style="flex-wrap:wrap"><select class="select sm" style="max-width:280px" id="rc-ask-${i}" ${CAN_EDIT ? "" : "disabled"}><option value="">Choose the product…</option>${opts.length ? `<optgroup label="Closest names">${opts.map((s) => `<option value="${esc(s)}" ${s === a.sap ? "selected" : ""}>${esc(shortName((rcProd(a.qc, s) || {}).name || s))}</option>`).join("")}</optgroup>` : ""}<optgroup label="All ${a.qc ? "quick commerce" : "SahiReach"} products">${pool.slice().sort((x, y) => x.name.localeCompare(y.name)).map((s) => `<option value="${esc(s.sap)}">${esc(shortName(s.name))}</option>`).join("")}</optgroup></select>${CAN_EDIT ? `<button class="btn btn-sm btn-primary" data-act="rcMapSave" data-i="${i}">Save</button>` : ""}</span></div>`; }).join("")}</div></div>`;
}
function rcBody() {
  const R = (D.recon || {}).last;
  const up = CAN_EDIT ? `<div>${dropZone({ input: "tc-file", dataIn: "rcFile", accept: ".xls,.xlsx,.csv", title: R ? "Check a newer statement" : "Tropicana's ledger statement", sub: "The daily SAHIREACH_LS file. Swiggy lines are checked against quick commerce stock." })}<div id="rc-msg"></div></div>` : "";
  if (!R) return up + `<div class="group"><div class="empty"><div class="big">Not checked yet</div>Upload the statement to compare it with our current stock.</div></div>`;
  const sec = (qc) => {
    const rows = R.rows.filter((r) => r.qc === qc), S2 = qc ? R.qcs : R.own, off = rows.filter((r) => r.status === "open" || r.status === "unmapped" || r.status === "explained"), loose = rows.filter((r) => r.status === "loose"), ok = rows.filter((r) => r.status === "match");
    const show = (S.rcAll || {})[qc ? "q" : "o"];
    return `<div><div class="group-label"><span>${qc ? "Quick commerce (Swiggy lines)" : "SahiReach stock"}</span><span>${S2.match} of ${S2.n} match</span></div>
      <div class="tiles" style="grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:10px"><div class="tile"><div class="tile-label">Tropicana</div><div class="tile-value">${nf(S2.trop)}<small>crates</small></div></div><div class="tile"><div class="tile-label">Our current stock</div><div class="tile-value">${nf(S2.ours, 1)}<small>crates</small></div></div><div class="tile"><div class="tile-label">To look at</div><div class="tile-value" ${S2.open ? 'style="color:var(--bad)"' : 'style="color:var(--good)"'}>${S2.open}</div><div class="tile-sub">${S2.explained} with a likely reason · ${S2.loose} loose boxes</div></div></div>
      ${off.length ? `<div class="group">${off.map(rcRowHtml).join("")}</div>` : `<div class="banner good">${ic("check", "sm")}<span>No differences to look at.</span></div>`}
      ${loose.length || ok.length ? `<button class="btn btn-sm btn-secondary" style="margin-top:10px" data-act="rcShowAll" data-k="${qc ? "q" : "o"}">${show ? "Hide" : "Show"} ${ok.length} matching${loose.length ? ` and ${loose.length} loose-box` : ""} line${ok.length + loose.length > 1 ? "s" : ""}</button>${show ? `<div class="group" style="margin-top:10px">${loose.concat(ok).map(rcRowHtml).join("")}</div>` : ""}` : ""}</div>`;
  };
  const totalOK = R.tropTotal == null || rcNear(R.tropTotal, R.lines.reduce((a, l) => a + l.cl, 0));
  return `${up}<div class="banner info">${ic("info", "sm")}<span><b>Tropicana statement for ${esc(fmtDate(R.date || R.asOf))}</b> (${esc(R.file || "")}), checked ${esc(fmtDT(R.at))}${R.by ? " by " + esc(R.by) : ""}. ${R.asOf < ymd(toDate(R.at)) ? `Our stock was worked back to the end of ${esc(fmtDate(R.asOf))} to compare like with like.` : "Compared with our current stock, reserved included (it is still at Tropicana until dispatched)."}${totalOK ? "" : ` The file's total (${nf(R.tropTotal)}) does not equal its lines; check the file.`}</span></div>
    ${R.added && R.added.length ? `<div class="banner good">${ic("check", "sm")}<span><b>${R.added.length} Tropicana code${R.added.length > 1 ? "s" : ""} added to products:</b> ${R.added.map((a) => `${esc(a.code)} → ${esc(shortName((rcProd(a.qc, a.sap) || {}).name || a.sap))}`).join(" · ")}. Change one in Setup if it is wrong.</span></div>` : ""}
    ${rcAskHtml(R)}${sec(false)}${sec(true)}`;
}
ACT.reconSheet = () => { openSheet("Check with Tropicana", `<div id="rc-body" class="stack gap-16">${rcBody()}</div>`, `${(D.recon || {}).last ? `<button class="btn btn-secondary" data-act="reconExcel">${ic("doc", "sm")} Download Excel</button>` : ""}<button class="btn btn-primary" data-act="closeSheet">Done</button>`, true); };
const rcRedraw = () => { const sc = $("#sheet .sheet-body") || $("#sheet"), y = sc ? sc.scrollTop : 0; part("rc-body", rcBody()); if (sc) sc.scrollTop = y; };
ACT.rcShowAll = (el) => { S.rcAll = S.rcAll || {}; S.rcAll[el.dataset.k] = !S.rcAll[el.dataset.k]; rcRedraw(); };
function rcStore(R) {
  D.recon = D.recon || {}; D.recon.last = R;
  D.recon.history = [{ at: R.at, by: R.by, date: R.date, file: R.file, own: R.own, qc: R.qcs }].concat(D.recon.history || []).slice(0, 24);
}
IN.rcFile = async (el) => {
  const f = el.files && el.files[0]; if (!f || !CAN_EDIT) return;
  const sig = [f.name, f.size, f.lastModified].join("|"); if (S.rcSig === sig) return; S.rcSig = sig;
  part("rc-msg", `<div class="row-sub" style="margin-top:10px">Reading ${esc(f.name)}…</div>`);
  try {
    await loadScriptOnce(XLSX_SRC, () => !!window.XLSX);
    const ls = rcParse(xlsxSheets(await f.arrayBuffer(), 1)[0] || [], f.name);
    if (ls.error) { S.rcSig = null; part("rc-msg", `<div class="banner bad" style="margin-top:10px">${ic("alert", "sm")}<span>${esc(ls.error)}</span></div>`); return; }
    const R = rcRun(ls); rcStore(R);
    logActivity("Checked with Tropicana", fmtDate(R.date || R.asOf), `SahiReach ${R.own.match}/${R.own.n} match, ${R.own.open} to look at · quick commerce ${R.qcs.match}/${R.qcs.n} match, ${R.qcs.open} to look at`);
    S.rcSig = null; ACT.reconSheet(); render();
  } catch (e) { S.rcSig = null; part("rc-msg", `<div class="banner bad" style="margin-top:10px">${ic("alert", "sm")}<span>Could not read that file. ${esc(e.message || "")}</span></div>`); }
};
ACT.rcMapSave = (el) => {
  const R = (D.recon || {}).last, a = R && R.ask[+el.dataset.i], sel = $("#rc-ask-" + el.dataset.i); if (!a || !sel) return;
  if (!sel.value) { toast("Choose the product first", "alert"); return; }
  rcSetCode(a.qc, sel.value, a.code);
  logActivity("Tropicana code added", a.code, `${a.desc} → ${(rcProd(a.qc, sel.value) || {}).name || sel.value}`);
  const prevAdded = R.added || [], N = rcRun({ date: R.date, lines: R.lines, total: R.tropTotal, file: R.file }); N.at = R.at; N.added = prevAdded.concat(N.added || []); rcStore(N); D.recon.history.splice(1, 1);
  rcRedraw(); render(); toast(`${a.code} linked`, "check");
};
ACT.reconExcel = async (el) => {
  const R = (D.recon || {}).last; if (!R) return;
  const head = ["Pool", "Tropicana code", "Tropicana description", "Product in the tool", "SAP code", "Tropicana opening", "Tropicana in", "Tropicana out", "Tropicana closing (crates)", "Our current stock (crates)", "Difference (ours − Tropicana)", "Status", "Likely reason / what to check"];
  const aoa = [[`STOCK CHECK WITH TROPICANA · statement for ${dmyOf(R.date || R.asOf)} (${R.file || ""}) · checked ${stampOf(toDate(R.at))}`], [`SahiReach stock: ${R.own.match} of ${R.own.n} match, ${R.own.open} to look at. Quick commerce: ${R.qcs.match} of ${R.qcs.n} match, ${R.qcs.open} to look at. Our stock is current stock (reserved included).`], [], head];
  R.rows.forEach((r) => aoa.push([r.qc ? "Quick commerce" : "SahiReach", r.codes.join(" + "), r.desc.join(" + "), r.saps.length ? r.names.join(" + ") : "", r.saps.join(" + "), r.op, r.inn, r.out, r.trop, r.ours, r.diff, RC_ST[r.status][1], r.why.join(" ")]));
  aoa.push(["", "", "TOTAL", "", "", "", "", "", rcR2(R.rows.reduce((a, r) => a + r.trop, 0)), rcR2(R.rows.reduce((a, r) => a + r.ours, 0)), rcR2(R.rows.reduce((a, r) => a + r.diff, 0)), "", ""]);
  if (await downloadBook(el, [{ name: "Stock check", aoa, cols: [14, 12, 44, 44, 18, 9, 8, 8, 12, 12, 12, 18, 90] }], `SahiReach stock check with Tropicana ${dmyOf(R.date || R.asOf)}.xlsx`)) toast("Stock check downloaded", "doc");
};

/* ===== ITEM LEDGER: every movement of one product, as a styled Excel =====
   Like Vyapar's item-wise transaction report, but in date order with a running balance, in boxes and crates:
   purchases, distributor orders as they were dispatched, sales returns, returns to Hangyo, stock moved between
   SahiReach and quick commerce, and the orders still waiting (reserved). A second sheet does the same for the
   product's quick commerce stock. Uses the styled build of the Excel library (loaded only for this). */
const XLSXS_SRC = (HOST && HOST.xlsxStyleSrc) || "https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.min.js";
const ilDay = (s) => String(s || "").slice(0, 10);
function itemMoves(sap) {
  const st = stockBySap[sap], u = (st && st.upc) || (catBySap[sap] || {}).upc || 1, own = [], qc = [], pend = [];
  D.purchases.forEach((p) => { if (p.sap !== sap) return; const d = ilDay(p.invDate || p.time); if (/QC/i.test(p.pool || "")) qc.push({ d, type: "Purchase", ref: p.inv || p.id, party: p.supplier || "Hangyo", inn: +p.crates || 0, out: 0, rate: p.rate, note: p.batch ? "Batch " + p.batch : "" }); else own.push({ d, type: "Purchase", ref: p.inv || p.id, party: p.supplier || "Hangyo", inn: +p.ea || 0, out: 0, rate: p.rate, note: p.batch ? "Batch " + p.batch : "" }); });
  D.orders.forEach((o) => {
    if (o.status === "Cancelled") return;
    (linesByOrder[o.id] || []).forEach((l) => {
      if (l.sap !== sap || !(l.ea > 0)) return;
      const x = { d: ilDay(o.status === "Dispatched" ? o.dispatched : o.time), type: o.status === "Dispatched" ? "Sale (dispatched)" : "Order waiting to go", ref: o.id, party: o.dist, inn: 0, out: l.ea, rate: l.billed, note: l.qc ? `${nf(l.qc, 2)} crate${l.qc === 1 ? "" : "s"} from quick commerce stock` : l.part ? "Broken crate" : "" };
      if (o.status === "Dispatched") own.push(x); else pend.push(x);
    });
  });
  (D.notes || []).forEach((n) => { if (n.status !== "Active" || !Array.isArray(n.lines)) return; n.lines.forEach((l) => { if (l.sap !== sap) return; const k = ntKind(n.type), back = l.stocked > 0, outH = l.stocked < 0; own.push({ d: ilDay(n.date || n.time), type: k === "preturn" ? "Return to Hangyo (debit note)" : "Sales return (credit note)", ref: n.no || n.id, party: n.party, inn: back ? l.stocked : 0, out: outH ? -l.stocked : 0, rate: l.rate, note: k === "return" ? `${l.cond || "Good"}${back ? ", back in stock" : ", not back in stock"}` : "" }); }); });
  (D.transfers || []).forEach((t) => (t.lines || []).forEach((l) => {
    if (l.sap !== sap) return; const d = ilDay(t.time);
    if (t.kind === "purchase") { own.push({ d, type: "From quick commerce stock", ref: t.id, party: t.ref || "", inn: l.crates * u, out: 0, note: t.docNo ? "Purchase invoice " + t.docNo : "Purchase invoice pending" }); qc.push({ d, type: "Used for distributor orders", ref: t.id, party: t.ref || "", inn: 0, out: l.crates }); }
    else if (t.kind === "credit") own.push({ d, type: "Sent with Swiggy / Zepto delivery", ref: t.id, party: t.ref || "", inn: 0, out: l.crates * u, note: t.docNo ? "Credit note " + t.docNo : "Credit note pending" });
  }));
  D.qcPOs.forEach((p) => { const L = (qcLinesByPO[p.po] || []).filter((l) => l.sap === sap); L.forEach((l) => (l.backs || []).forEach((b) => qc.push({ d: ilDay(b.time), type: "Came back good (GRN)", ref: p.po, party: p.platform, inn: b.crates || 0, out: 0 }))); if (p.status !== "Delivered") return; const cr = L.reduce((a, l) => a + (l.delivered || 0) / (l.ppc || (qcBySap[sap] || {}).ppc || 1), 0); if (cr > 0) qc.push({ d: ilDay(p.deliveredOn), type: "Delivered", ref: p.po, party: p.platform, inn: 0, out: cr, rate: null, note: "" }); });
  const byDate = (a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : (b.inn > 0) - (a.inn > 0));
  own.sort(byDate); qc.sort(byDate); pend.sort(byDate);
  return { own, qc, pend, u };
}

/* ---------- a small styled-sheet builder ---------- */
const IL = { tint: "0B7A70", tintSoft: "E6F2F1", ink: "1D1D1F", grey: "6E6E73", line: "E5E5EA", zebra: "F7F7F9", good: "1F7A36", bad: "C9001A", warn: "A04A00", warnSoft: "FFF4E5" };
const ilSerial = (d) => { const p = String(d).split("-"); return (Date.UTC(+p[0], +p[1] - 1, +p[2]) - Date.UTC(1899, 11, 30)) / 864e5; };
function ilSheet(X, rows, cols, merges) {
  const ws = {}; let maxC = 0;
  rows.forEach((r, ri) => (r.cells || []).forEach((c, ci) => {
    if (c == null) return; maxC = Math.max(maxC, ci);
    const cell = typeof c === "object" && !(c instanceof Date) ? c : { v: c };
    const o = { v: cell.v == null ? "" : cell.v, t: cell.t || (typeof cell.v === "number" ? "n" : "s"), s: Object.assign({ font: { name: "Calibri", sz: 11, color: { rgb: IL.ink } }, alignment: { vertical: "center" } }, r.s || {}, cell.s || {}) };
    if (cell.z) o.z = cell.z;
    if (cell.v === "" || cell.v == null) { o.t = "s"; o.v = ""; }
    ws[X.utils.encode_cell({ r: ri, c: ci })] = o;
  }));
  ws["!ref"] = X.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length - 1, c: Math.max(maxC, cols.length - 1) } });
  ws["!cols"] = cols.map((w) => ({ wch: w })); ws["!rows"] = rows.map((r) => (r.h ? { hpt: r.h } : null));
  if (merges) ws["!merges"] = merges;
  return ws;
}
function ilLedgerRows(title, sub, summary, head, body, foot, extra) {
  const n = head.length, rows = [], merges = [];
  const B = (rgb) => ({ bottom: { style: "thin", color: { rgb: rgb || IL.line } } });
  rows.push({ h: 30, cells: [{ v: title, s: { font: { name: "Calibri", sz: 18, bold: true, color: { rgb: IL.tint } } } }] }); merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: n - 1 } });
  rows.push({ h: 18, cells: [{ v: sub, s: { font: { name: "Calibri", sz: 10, color: { rgb: IL.grey } } } }] }); merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: n - 1 } });
  rows.push({ h: 8, cells: [] });
  /* summary: label over value, up to 4 per row, each two columns wide */
  for (let i = 0; i < summary.length; i += 4) {
    const L = { h: 16, cells: [] }, V = { h: 24, cells: [] }, r0 = rows.length;
    summary.slice(i, i + 4).forEach(([k, v, z, color], j) => {
      const c = j * Math.max(2, Math.floor(n / 4));
      L.cells[c] = { v: String(k).toUpperCase(), s: { font: { name: "Calibri", sz: 9, bold: true, color: { rgb: IL.grey } }, fill: { fgColor: { rgb: IL.tintSoft } } } };
      V.cells[c] = { v, z, s: { font: { name: "Calibri", sz: 14, bold: true, color: { rgb: color || IL.ink } }, fill: { fgColor: { rgb: IL.tintSoft } }, alignment: { horizontal: "left", vertical: "center" } } };
      const w = Math.max(2, Math.floor(n / 4)); merges.push({ s: { r: r0, c }, e: { r: r0, c: c + w - 1 } }, { s: { r: r0 + 1, c }, e: { r: r0 + 1, c: c + w - 1 } });
      for (let k2 = 1; k2 < w; k2++) { L.cells[c + k2] = { v: "", s: { fill: { fgColor: { rgb: IL.tintSoft } } } }; V.cells[c + k2] = { v: "", s: { fill: { fgColor: { rgb: IL.tintSoft } } } }; }
    });
    rows.push(L, V);
  }
  rows.push({ h: 10, cells: [] });
  const hr = rows.length;
  rows.push({ h: 30, cells: head.map((h) => ({ v: h.t, s: { font: { name: "Calibri", sz: 10, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: IL.tint } }, alignment: { horizontal: h.r ? "right" : "left", vertical: "center", wrapText: true }, border: B(IL.tint) } })) });
  body.forEach((r, i) => rows.push({ h: 20, cells: r.map((c, j) => { const h = head[j], v = c && typeof c === "object" ? c : { v: c }; return Object.assign({}, v, { z: v.z || h.z, s: Object.assign({ font: { name: "Calibri", sz: 11, color: { rgb: (v.color || h.color) || IL.ink }, bold: !!(v.bold || h.bold) }, fill: { fgColor: { rgb: v.fill || (i % 2 ? IL.zebra : "FFFFFF") } }, alignment: { horizontal: h.r ? "right" : "left", vertical: "center" }, border: B() }, v.s || {}) }); }) }));
  if (foot) rows.push({ h: 24, cells: foot.map((c, j) => ({ v: c == null ? "" : c, z: head[j].z, s: { font: { name: "Calibri", sz: 11, bold: true, color: { rgb: IL.ink } }, alignment: { horizontal: head[j].r ? "right" : "left", vertical: "center" }, border: { top: { style: "medium", color: { rgb: IL.ink } } } } })) });
  (extra || []).forEach((e) => { rows.push({ h: 10, cells: [] }); rows.push({ h: 22, cells: [{ v: e.title, s: { font: { name: "Calibri", sz: 12, bold: true, color: { rgb: e.color || IL.warn } } } }] }); const er = rows.length; rows.push({ h: 26, cells: e.head.map((h) => ({ v: h.t, s: { font: { name: "Calibri", sz: 10, bold: true, color: { rgb: IL.ink } }, fill: { fgColor: { rgb: e.fill || IL.warnSoft } }, alignment: { horizontal: h.r ? "right" : "left", vertical: "center", wrapText: true }, border: B() } })) }); e.body.forEach((r) => rows.push({ h: 20, cells: r.map((c, j) => { const v = c && typeof c === "object" ? c : { v: c == null ? "" : c }; return Object.assign({}, v, { z: v.z || e.head[j].z, s: { alignment: { horizontal: e.head[j].r ? "right" : "left" }, border: B() } }); }) })); if (e.note) rows.push({ h: 18, cells: [{ v: e.note, s: { font: { name: "Calibri", sz: 10, italic: true, color: { rgb: IL.grey } } } }] }); void er; });
  return { rows, merges, hr };
}
function itemLedgerBook(X, sap) {
  const st = stockBySap[sap], q = qcBySap[sap], c = catBySap[sap] || {}, name = (st && st.name) || (q && q.name) || c.name || sap, M = itemMoves(sap), u = M.u, money = SEE_MONEY;
  const ss = ssRate(sap), dr = price(sap), mrp = (st && st.mrp) || c.mrp, x = st ? stockSplit(st) : null;
  const NUM = "#,##0", DEC = "#,##0.00", RS = '"₹"#,##0.00', DATE = "dd-mmm-yyyy";
  const sheets = [];
  if (st) {
    const net = M.own.reduce((a, m) => a + m.inn - m.out, 0), open = x.cur - net;
    let bal = open; const body = [];
    body.push([{ v: "" }, { v: "Opening balance", bold: true }, "", "", "", "", { v: open, bold: true }, { v: open / u, bold: true }].concat(money ? ["", ""] : [], ["Worked back from today's stock"]));
    M.own.forEach((m) => { bal += m.inn - m.out; body.push([m.d ? { v: ilSerial(m.d), t: "n", z: DATE } : "", m.type, m.ref, m.party || "", m.inn ? { v: m.inn, color: IL.good } : "", m.out ? { v: m.out, color: IL.bad } : "", { v: bal, bold: true }, { v: bal / u }].concat(money ? [m.rate != null ? m.rate : "", m.rate != null ? { v: (m.inn || m.out) * m.rate } : ""] : [], [m.note || ""])); });
    const head = [{ t: "Date", z: DATE }, { t: "Type" }, { t: "Reference" }, { t: "Party" }, { t: "In (boxes)", r: 1, z: NUM }, { t: "Out (boxes)", r: 1, z: NUM }, { t: "Balance (boxes)", r: 1, z: NUM, bold: 1 }, { t: "Balance (crates)", r: 1, z: DEC }].concat(money ? [{ t: "Rate / box", r: 1, z: RS }, { t: "Value", r: 1, z: RS }] : [], [{ t: "Note" }]);
    const tIn = M.own.reduce((a, m) => a + m.inn, 0), tOut = M.own.reduce((a, m) => a + m.out, 0);
    const foot = ["", "Closing: current stock", "", "", tIn, tOut, bal, bal / u].concat(money ? ["", ""] : [], [""]);
    const summary = [["Current stock (crates)", x.cr.cur, DEC], ["Reserved (crates)", x.cr.res, DEC, x.res > 0 ? IL.warn : null], ["Available for sale (crates)", x.cr.avail, DEC, IL.good], ["Boxes per crate", u, NUM]]
      .concat(money ? [["SS rate / box", ss, RS], ["Distributor rate / box", dr, RS], ["MRP / box", mrp, RS], ["Stock value at SS rate", ss != null ? x.cur * ss : null, RS]] : [["Distributor rate / box", dr, '"₹"#,##0.00'], ["MRP / box", mrp, '"₹"#,##0.00']]);
    const ehead = [{ t: "Saved on", z: DATE }, { t: "Order" }, { t: "Distributor" }, { t: "Boxes", r: 1, z: NUM }, { t: "Crates", r: 1, z: DEC }, { t: "Note" }];
    const extra = M.pend.length ? [{ title: `Reserved: ${M.pend.length} order${M.pend.length > 1 ? "s" : ""} not yet dispatched (still at Tropicana)`, head: ehead, body: M.pend.map((m) => [{ v: ilSerial(m.d), t: "n" }, m.ref, m.party, m.out, m.out / u, m.note || ""]), note: "These boxes are in the current stock above and leave it when the order is dispatched. Available for sale = current − reserved." }] : [];
    const L = ilLedgerRows(`${name}`, `Item ledger · SahiReach stock at Tropicana · SAP ${sap}${st.trop ? " · " + st.trop : ""} · ${c.cat || st.cat || ""} · as of ${stampOf(NOW())}`, summary, head, body, foot, extra);
    const ws = ilSheet(X, L.rows, [12, 30, 22, 30, 11, 11, 13, 12].concat(money ? [12, 14] : [], [38]), L.merges);
    ws["!autofilter"] = { ref: X.utils.encode_range({ s: { r: L.hr, c: 0 }, e: { r: L.hr + body.length, c: head.length - 1 } }) };
    sheets.push({ name: "SahiReach stock", ws });
  }
  if (q) {
    const net = M.qc.reduce((a, m) => a + m.inn - m.out, 0), cur = q.crates || 0, open = cur - net, qx = qcSplit(q);
    let bal = open; const body = [[{ v: "" }, { v: "Opening balance", bold: true }, "", "", "", "", { v: open, bold: true }, "Worked back from today's stock"]];
    M.qc.forEach((m) => { bal += m.inn - m.out; body.push([m.d ? { v: ilSerial(m.d), t: "n" } : "", m.type, m.ref, m.party || "", m.inn ? { v: m.inn, color: IL.good } : "", m.out ? { v: m.out, color: IL.bad } : "", { v: bal, bold: true }, m.note || ""]); });
    const head = [{ t: "Date", z: DATE }, { t: "Type" }, { t: "Reference" }, { t: "Platform / party" }, { t: "In (crates)", r: 1, z: DEC }, { t: "Out (crates)", r: 1, z: DEC }, { t: "Balance (crates)", r: 1, z: DEC, bold: 1 }, { t: "Note" }];
    const summary = [["Current stock (crates)", qx.cur, DEC], ["Reserved (crates)", qx.res, DEC, qx.res > 0 ? IL.warn : null], ["Available for sale (crates)", qx.avail, DEC, IL.good], ["Pieces per crate", q.ppc || null, NUM]];
    const L = ilLedgerRows(`${name}`, `Item ledger · quick commerce stock (Swiggy and Zepto) · SAP ${sap}${q.trop ? " · " + q.trop : ""} · as of ${stampOf(NOW())}`, summary, head, body, ["", "Closing: current stock", "", "", M.qc.reduce((a, m) => a + m.inn, 0), M.qc.reduce((a, m) => a + m.out, 0), bal, ""]);
    sheets.push({ name: "Quick commerce stock", ws: ilSheet(X, L.rows, [12, 28, 22, 26, 12, 12, 14, 36], L.merges) });
  }
  return { sheets, file: `${shortName(name).replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim()} item ledger ${dmyOf(ymd(NOW()))}.xlsx` };
}
ACT.itemExcel = async (el) => {
  const sap = el.dataset.sap; if (el) el.disabled = true;
  try { await loadScriptOnce(XLSXS_SRC, () => !!(window.XLSX && window.XLSX.style_version)); }
  catch (e) { if (el) el.disabled = false; toast("Could not prepare the Excel file. Check your internet and try again.", "alert"); return; }
  const X = window.XLSX, B = itemLedgerBook(X, sap), wb = X.utils.book_new();
  B.sheets.forEach((s) => X.utils.book_append_sheet(wb, s.ws, s.name));
  X.writeFile(wb, B.file, { compression: true, cellStyles: true });
  if (el) el.disabled = false;
  logActivity("Item ledger downloaded", (stockBySap[sap] || qcBySap[sap] || {}).name || sap, "Excel"); toast("Item ledger downloaded", "doc");
};

/* ===== HANGYO PURCHASE ORDER AS A PDF =====
   A clean A4 purchase order for a PO placed with Hangyo (or a draft from today's plan): SahiReach's details and logo,
   Hangyo, where it is delivered (Tropicana Logistics), the lines grouped as SahiReach stock and quick commerce stock,
   with crates, boxes, rate and amount, GST and the total in words. Made in the browser with jsPDF (loaded only for
   this) and downloaded straight away. Staff get the same PO without rates or amounts. */
const JSPDF_SRC = (HOST && HOST.jspdfSrc) || "https://cdn.jsdelivr.net/npm/jspdf@4.2.1/dist/jspdf.umd.min.js";
const JSPDF_AT_SRC = (HOST && HOST.jspdfAtSrc) || "https://cdn.jsdelivr.net/npm/jspdf-autotable@5.0.9/dist/jspdf.plugin.autotable.min.js";
async function loadJsPdf() {
  await loadScriptOnce(JSPDF_SRC, () => !!(window.jspdf && window.jspdf.jsPDF));
  await loadScriptOnce(JSPDF_AT_SRC, () => !!(window.jspdf && window.jspdf.jsPDF && window.jspdf.jsPDF.API && window.jspdf.jsPDF.API.autoTable));
}
/* the lines of a placed PO, or of today's plan (a draft) */
function hpoDoc(po) {
  const cat = (sap) => ((stockBySap[sap] || qcBySap[sap] || catBySap[sap] || {}).cat || "Other");
  const line = (x, pool) => { const boxes = x.boxes != null ? x.boxes : (x.crates || 0) * (x.upc || 0), rate = x.value && boxes ? x.value / boxes : ssRate(x.sap); return { sap: x.sap, name: x.product || x.name, trop: String(((pool === "qc" ? qcBySap[x.sap] : stockBySap[x.sap]) || {}).trop || "").replace(/^TBD$/i, ""), cat: cat(x.sap), upc: x.upc || (stockBySap[x.sap] || catBySap[x.sap] || {}).upc || null, crates: x.crates || 0, boxes, rate: rate != null ? rate : null, amount: rate != null ? boxes * rate : null }; };
  if (po) {
    const L = D.hpoLog.filter((l) => l.po === po); if (!L.length) return null;
    return { po, date: L[0].placed, draft: false, own: L.filter((l) => !/QC/i.test(l.pool)).map((l) => line(l, "own")), qc: L.filter((l) => /QC/i.test(l.pool)).map((l) => line(l, "qc")) };
  }
  recomputeRepl();
  return { po: "Draft", date: iso(NOW()), draft: true, own: D.repl.rows.filter((r) => r.final > 0).map((r) => line({ sap: r.sap, name: r.name, upc: r.upc, crates: r.final }, "own")), qc: qcPOLines().map((q) => line({ sap: q.sap, name: q.name, upc: q.upc, crates: q.final }, "qc")) };
}
const pdfMoney = (n) => (n == null ? "" : Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const pdfNum = (n, d = 0) => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: d });
function hpoPdf(P) {
  const { jsPDF } = window.jspdf, doc = new jsPDF({ unit: "mm", format: "a4", compress: true }), W = 210, M = 16, money = SEE_MONEY;
  const TINT = [11, 122, 112], INK = [29, 29, 31], GREY = [110, 110, 115], LINE = [229, 229, 234], SOFT = [230, 242, 241], ZEBRA = [248, 248, 250];
  const C = Object.assign({}, D.company || {}), when = toDate(P.date), dateTxt = `${pad2(when.getDate())} ${MONTHS[when.getMonth()]} ${when.getFullYear()}`;
  doc.setProperties({ title: `Purchase order ${P.po}`, subject: "Purchase order to Hangyo Ice Creams", author: C.name || "SahiReach LLP", creator: "SahiReach Order Tool" });
  /* header: logo and name on the left, the document title on the right */
  try { if (LOGO && /^data:image\/(png|jpe?g)/.test(LOGO)) doc.addImage(LOGO, LOGO.includes("png") ? "PNG" : "JPEG", M, 14, 13, 13); } catch (e) { /* no logo */ }
  doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(...INK); doc.text(C.name || "SahiReach LLP", M + 17, 19.5);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...GREY); doc.text("Super stockist · Hangyo Ice Creams", M + 17, 24.5);
  doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(...TINT); doc.text(P.draft ? "Purchase order (draft)" : "Purchase order", W - M, 20, { align: "right" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...INK); doc.text(`${P.po}  ·  ${dateTxt}`, W - M, 26, { align: "right" });
  doc.setDrawColor(...LINE); doc.setLineWidth(0.3); doc.line(M, 32, W - M, 32);
  /* three blocks: from, to, deliver to */
  const blocks = [
    ["FROM", [C.name || "SahiReach LLP", C.address || "", C.gstin ? "GSTIN " + C.gstin : "", C.fssai ? "FSSAI " + C.fssai : "", [CO.phone, CO.email].filter(Boolean).join("  ·  ")]],
    ["TO", ["Hangyo Ice Creams Private Limited", (D.company && D.company.supplierAddress) || "", (D.company && D.company.supplierGstin) ? "GSTIN " + D.company.supplierGstin : ""]],
    ["DELIVER TO", ["Tropicana Logistics (cold store)", "Willingdon Island, Kochi, Kerala", `For ${[P.own.length ? "SahiReach stock" : "", P.qc.length ? "quick commerce stock" : ""].filter(Boolean).join(" and ")}`]],
  ];
  const bw = (W - 2 * M - 12) / 3;
  blocks.forEach(([h, rows], i) => {
    const x = M + i * (bw + 6); let y = 39;
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...GREY); doc.text(h, x, y); y += 5;
    rows.filter(Boolean).forEach((r, k) => { doc.setFont("helvetica", k === 0 ? "bold" : "normal"); doc.setFontSize(k === 0 ? 10 : 8.5); doc.setTextColor(...(k === 0 ? INK : GREY)); const parts = doc.splitTextToSize(String(r), bw); doc.text(parts, x, y); y += parts.length * (k === 0 ? 4.6 : 3.9); });
  });
  /* summary strip */
  const all = P.own.concat(P.qc), totCr = all.reduce((a, l) => a + l.crates, 0), totBx = all.reduce((a, l) => a + l.boxes, 0), val = all.reduce((a, l) => a + (l.amount || 0), 0), gst = Math.round(val * 5) / 100, grand = Math.round((val + gst) * 100) / 100;
  const chips = [["PO DATE", dateTxt], ["LINES", pdfNum(all.length)], ["CRATES", pdfNum(totCr)], ["BOXES", pdfNum(totBx)]].concat(money ? [["TOTAL INCL. GST", "Rs " + pdfMoney(grand)]] : []);
  const sy = 66, cw = (W - 2 * M) / chips.length;
  doc.setFillColor(...SOFT); doc.roundedRect(M, sy, W - 2 * M, 15, 3, 3, "F");
  chips.forEach(([k, v], i) => { const x = M + 5 + i * cw; doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...GREY); doc.text(k, x, sy + 5.5); doc.setFontSize(11); doc.setTextColor(...INK); doc.text(String(v), x, sy + 11.5); });
  /* the lines, grouped by stock and then by category */
  const head = [["#", "Product", "Code", "SAP code", "Boxes / crate", "Crates", "Boxes"].concat(money ? ["Rate / box (Rs)", "Amount (Rs)"] : [])];
  const body = []; let n = 0;
  const section = (title, L) => {
    if (!L.length) return;
    body.push([{ content: title, colSpan: head[0].length, styles: { fillColor: TINT, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 } }]);
    const cats = [...new Set(L.map((l) => l.cat))].sort();
    cats.forEach((c) => {
      body.push([{ content: c, colSpan: head[0].length, styles: { fillColor: SOFT, textColor: TINT, fontStyle: "bold", fontSize: 8 } }]);
      L.filter((l) => l.cat === c).sort((a, b) => a.name.localeCompare(b.name)).forEach((l) => { n++; body.push([n, shortName(l.name).replace(/\s+/g, " ").replace(/\(\s+/g, "(").replace(/\s+\)/g, ")").trim(), l.trop || "", l.sap, l.upc || "", pdfNum(l.crates, 2), pdfNum(l.boxes, 2)].concat(money ? [pdfMoney(l.rate), pdfMoney(l.amount)] : [])); });
    });
    const cr = L.reduce((a, l) => a + l.crates, 0), bx = L.reduce((a, l) => a + l.boxes, 0), am = L.reduce((a, l) => a + (l.amount || 0), 0);
    body.push([{ content: `${title} total`, colSpan: 5, styles: { fontStyle: "bold" } }, { content: pdfNum(cr, 2), styles: { fontStyle: "bold", halign: "right" } }, { content: pdfNum(bx, 2), styles: { fontStyle: "bold", halign: "right" } }].concat(money ? [{ content: "" }, { content: pdfMoney(am), styles: { fontStyle: "bold", halign: "right" } }] : []));
  };
  section("SahiReach stock", P.own); section("Quick commerce stock (Swiggy and Zepto)", P.qc);
  const colW = money ? { 0: { cellWidth: 7, textColor: GREY }, 1: { cellWidth: "auto" }, 2: { cellWidth: 14, textColor: GREY }, 3: { cellWidth: 16, textColor: GREY }, 4: { cellWidth: 13, halign: "right" }, 5: { cellWidth: 12, halign: "right" }, 6: { cellWidth: 12, halign: "right" }, 7: { cellWidth: 18, halign: "right" }, 8: { cellWidth: 22, halign: "right" } } : { 0: { cellWidth: 7, textColor: GREY }, 1: { cellWidth: "auto" }, 2: { cellWidth: 16, textColor: GREY }, 3: { cellWidth: 18, textColor: GREY }, 4: { cellWidth: 18, halign: "right" }, 5: { cellWidth: 16, halign: "right" }, 6: { cellWidth: 16, halign: "right" } };
  doc.autoTable({
    startY: sy + 21, head, body, theme: "plain", margin: { left: M, right: M, bottom: 20 },
    styles: { font: "helvetica", fontSize: 8, textColor: INK, cellPadding: { top: 1.5, bottom: 1.5, left: 1.8, right: 1.8 }, lineColor: LINE, lineWidth: { bottom: 0.2 }, valign: "middle" },
    headStyles: { fontStyle: "bold", fontSize: 7.5, textColor: GREY, lineWidth: { bottom: 0.5 }, lineColor: INK },
    columnStyles: colW, alternateRowStyles: { fillColor: ZEBRA },
    didParseCell: (d) => { if (d.section === "head" && d.column.index >= 4) d.cell.styles.halign = "right"; },
  });
  /* totals and words */
  let y = doc.lastAutoTable.finalY + 6;
  if (y > 250) { doc.addPage(); y = 24; }
  if (money) {
    const tx = W - M - 70, row = (k, v, bold) => { doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(bold ? 11 : 9.5); doc.setTextColor(...(bold ? INK : GREY)); doc.text(k, tx, y); doc.setTextColor(...INK); doc.text(v, W - M, y, { align: "right" }); y += bold ? 7 : 5.5; };
    row("Value excl. GST", "Rs " + pdfMoney(val)); row("GST 5%", "Rs " + pdfMoney(gst));
    doc.setDrawColor(...INK); doc.setLineWidth(0.4); doc.line(tx, y - 3.2, W - M, y - 3.2); y += 1.5;
    row("Total incl. GST", "Rs " + pdfMoney(grand), true);
    doc.setFont("helvetica", "italic"); doc.setFontSize(8.5); doc.setTextColor(...GREY); doc.text(doc.splitTextToSize(inWords(grand), W - 2 * M), M, y); y += 8;
  }
  /* notes and signature */
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...GREY);
  const notes = [`Quantities are in crates and boxes; the Hangyo portal takes boxes.`, money ? "Rates are SahiReach's purchase rate (SS rate) per box, excluding GST." : ""].filter(Boolean);
  notes.forEach((t) => { doc.text("•  " + t, M, y); y += 4.5; });
  y += 18; if (y > 272) { doc.addPage(); y = 40; }
  doc.setDrawColor(...LINE); doc.line(W - M - 60, y, W - M, y);
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...INK); doc.text(`For ${C.name || "SahiReach LLP"}`, W - M, y + 5, { align: "right" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...GREY); doc.text("Authorised signatory", W - M, y + 9.5, { align: "right" });
  /* page footer on every page */
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) { doc.setPage(i); doc.setDrawColor(...LINE); doc.setLineWidth(0.3); doc.line(M, 285, W - M, 285); doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...GREY); doc.text(`${C.name || "SahiReach LLP"} · Purchase order ${P.po}`, M, 289.5); doc.text(`Page ${i} of ${pages}`, W - M, 289.5, { align: "right" }); }
  return doc;
}
ACT.hpoPdf = async (el) => {
  const po = el.dataset.po || null, P = hpoDoc(po);
  if (!P || (!P.own.length && !P.qc.length)) { toast("Nothing on this PO yet", "info"); return; }
  if (el) el.disabled = true;
  try { await loadJsPdf(); }
  catch (e) { if (el) el.disabled = false; toast("Could not prepare the PDF. Check your internet and try again.", "alert"); return; }
  const doc = hpoPdf(P); doc.save(`SahiReach purchase order ${P.po} ${dmyOf(ymd(toDate(P.date)))}.pdf`);
  if (el) el.disabled = false;
  logActivity("Hangyo PO downloaded", P.po, "PDF"); toast("Purchase order PDF downloaded", "doc");
};

/* ===== PURCHASES REPORT: what was bought from Hangyo, when, and how it is trending =====
   Every purchase is dated by its invoice date (when it was bought), falling back to when it was entered.
   The Stock → Purchases tab is the full report (period, SahiReach / quick commerce, figures, months, invoices,
   products, ordered vs received, Excel); the dashboard carries a purchases strip for the dashboard's period. */
const purDate = (p) => String(p.invDate || p.time || "").slice(0, 10);
const purIsBuy = (p) => p.supplier === "Hangyo";
const purPoolOK = (p, pool) => pool === "all" || (pool === "qc" ? /QC/i.test(p.pool || "") : !/QC/i.test(p.pool || ""));
function purInvoices(from, to, pool, all) {
  const g = {};
  D.purchases.forEach((p) => {
    const d = purDate(p); if (d < from || d > to || !purPoolOK(p, pool || "all") || (!all && !purIsBuy(p))) return;
    const x = (g[p.id] = g[p.id] || { id: p.id, inv: p.inv || "", date: d, entered: p.time, supplier: p.supplier, pool: /QC/i.test(p.pool || "") ? "qc" : "own", lines: [], crates: 0, boxes: 0, value: 0 });
    x.lines.push(p); x.crates += +p.crates || 0; x.boxes += +p.ea || 0; x.value += +p.value || 0;
  });
  return Object.values(g).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.entered < b.entered ? 1 : -1));
}
function purStats(from, to, pool) {
  const I = purInvoices(from, to, pool), s = { n: I.length, value: 0, crates: 0, boxes: 0, own: 0, qc: 0, lines: 0, last: null };
  I.forEach((x) => { s.value += x.value; s.crates += x.crates; s.boxes += x.boxes; s[x.pool] += x.value; s.lines += x.lines.length; if (!s.last || x.date > s.last) s.last = x.date; });
  s.inv = I; return s;
}
/* when the very last purchase was, whatever the period */
const purLast = () => D.purchases.filter(purIsBuy).reduce((a, p) => (purDate(p) > a ? purDate(p) : a), "");
const purMonths = (n, pool) => { const out = [], t = NOW(); for (let i = n - 1; i >= 0; i--) { const d = new Date(t.getFullYear(), t.getMonth() - i, 1), from = ymd(d), to = ymd(new Date(d.getFullYear(), d.getMonth() + 1, 0)), s = purStats(from, to, pool || "all"); out.push({ k: from.slice(0, 7), label: MONTH_LONG[d.getMonth()].slice(0, 3), from, to, ...s }); } return out; };
/* POs placed with Hangyo in the period: how much of what was ordered has come in */
function purOrdered(from, to, pool) {
  const L = D.hpoLog.filter((l) => { const d = String(l.placed || "").slice(0, 10); return d >= from && d <= to && (pool === "all" || (pool === "qc" ? /QC/i.test(l.pool || "") : !/QC/i.test(l.pool || ""))); });
  const ord = L.reduce((a, l) => a + (l.boxes || (l.crates || 0) * (l.upc || 0)), 0), got = L.reduce((a, l) => a + Math.min(l.received || 0, l.boxes || (l.crates || 0) * (l.upc || 0)), 0);
  return { pos: new Set(L.map((l) => l.po)).size, lines: L.length, ordered: ord, received: got, fill: ord > 0 ? got / ord : null, open: L.filter((l) => l.status === "Open" || l.status === "Part received").length };
}
const daysAgo = (d) => { const n = Math.round((toDate(ymd(NOW())) - toDate(d)) / 864e5); return n <= 0 ? "today" : n === 1 ? "yesterday" : `${n} days ago`; };

/* ---------- small month bars (value for owners, crates for staff) ---------- */
function purBars(months, opt) {
  const money = SEE_MONEY, W = opt && opt.w ? opt.w : 620, H = opt && opt.h ? opt.h : 220, mini = !!(opt && opt.mini), m = mini ? { l: 0, r: 0, t: 6, b: 14 } : { l: 40, r: 10, t: 24, b: 26 };
  const val = (x, part) => (money ? (part ? x[part] : x.value) : part ? x.inv.filter((i) => i.pool === part).reduce((a, i) => a + i.crates, 0) : x.crates);
  const max = Math.max(1, ...months.map((x) => val(x))), sc = mini ? { max, n: 0, step: 0 } : niceScale(money ? max / 100000 : max), top = mini ? max : sc.max * (money ? 100000 : 1);
  const y = (v) => H - m.b - (v / top) * (H - m.t - m.b), band = (W - m.l - m.r) / months.length, bw = Math.min(mini ? 16 : 34, band * 0.56);
  let g = "";
  if (!mini) for (let i = 0; i <= sc.n; i++) { const v = sc.step * i; g += `<line class="gridline" x1="${m.l}" x2="${W - m.r}" y1="${y(v * (money ? 100000 : 1))}" y2="${y(v * (money ? 100000 : 1))}"/><text x="${m.l - 8}" y="${y(v * (money ? 100000 : 1)) + 4}" text-anchor="end">${+v.toFixed(1)}</text>`; }
  months.forEach((x, i) => {
    const cx = m.l + band * i + band / 2, own = val(x, "own"), qc = val(x, "qc"), yo = y(own), yq = y(own + qc);
    if (own > 0) g += `<rect x="${cx - bw / 2}" y="${yo}" width="${bw}" height="${Math.max(0, y(0) - yo)}" rx="${mini ? 2 : 3}" fill="var(--s-gt)"><title>${esc(x.label)}: SahiReach ${money ? rs(own) : nf(own) + " crates"}</title></rect>`;
    if (qc > 0) g += `<rect x="${cx - bw / 2}" y="${yq}" width="${bw}" height="${Math.max(0, yo - yq)}" rx="${mini ? 2 : 3}" fill="var(--s-swiggy)"><title>${esc(x.label)}: quick commerce ${money ? rs(qc) : nf(qc) + " crates"}</title></rect>`;
    if (!own && !qc) g += `<rect x="${cx - bw / 2}" y="${y(0) - 2}" width="${bw}" height="2" rx="1" fill="var(--hairline)"/>`;
    g += `<text x="${cx}" y="${H - (mini ? 2 : 8)}" text-anchor="middle"${mini ? ' style="font-size:10px"' : ""}>${esc(x.label)}</text>`;
    if (!mini && val(x) > 0) g += `<text class="lbl" x="${cx}" y="${yq - 6}" text-anchor="middle">${money ? "₹" + lakh(val(x)) + "L" : nf(val(x))}</text>`;
  });
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Purchases by month${money ? " in rupees lakh" : " in crates"}, SahiReach and quick commerce">${g}</svg></div>`;
}

/* ---------- the report (Stock → Purchases) ---------- */
function purRange(preset) {
  if (preset === "fy") { const t = NOW(), y = t.getMonth() >= 3 ? t.getFullYear() : t.getFullYear() - 1, from = `${y}-04-01`; return { from, to: ymd(t), pFrom: `${y - 1}-04-01`, pTo: ymd(new Date(t.getFullYear() - 1, t.getMonth(), t.getDate())), label: `FY ${y}-${String(y + 1).slice(2)} so far`, cmp: "the same days last year" }; }
  return logiRange(preset);
}
function purchasesHtml() {
  const F = (S.pur = S.pur || { preset: "month", pool: "all" }), R = purRange(F.preset), cur = purStats(R.from, R.to, F.pool), prev = R.pFrom ? purStats(R.pFrom, R.pTo, F.pool) : null, money = SEE_MONEY;
  const last = purLast(), O = purOrdered(R.from, R.to, F.pool), months = purMonths(6, F.pool);
  const chips = (name, list, val) => list.map(([v, l]) => `<button class="chip" data-act="purF" data-f="${name}" data-v="${esc(v)}" aria-pressed="${val === v}">${esc(l)}</button>`).join("");
  const byP = {}; cur.inv.forEach((x) => x.lines.forEach((l) => { const k = l.sap || l.product, r = (byP[k] = byP[k] || { sap: l.sap, name: l.product, n: 0, crates: 0, boxes: 0, value: 0, last: "" }); r.n++; r.crates += +l.crates || 0; r.boxes += +l.ea || 0; r.value += +l.value || 0; if (x.date > r.last) r.last = x.date; }));
  const prods = Object.values(byP).sort((a, b) => (money ? b.value - a.value : b.crates - a.crates));
  const other = purInvoices(R.from, R.to, F.pool, true).filter((x) => x.supplier !== "Hangyo");
  const byMonth = {}; cur.inv.forEach((x) => (byMonth[x.date.slice(0, 7)] = byMonth[x.date.slice(0, 7)] || []).push(x));
  const tile = (label, value, unit, sub, delta, cls) => `<div class="tile"><div class="tile-label">${esc(label)}</div><div class="tile-value"${cls ? ` style="color:var(--${cls})"` : ""}>${value}${unit ? `<small>${unit}</small>` : ""}</div>${delta ? deltaChip(delta) : ""}<div class="tile-sub">${sub}</div></div>`;
  return `<div class="stack gap-16">
    <div class="pur-filters"><div class="pur-chips"><div class="chips" style="margin:0">${chips("preset", [["month", "This month"], ["lastMonth", "Last month"], ["3m", "Last 3 months"], ["fy", "This financial year"], ["all", "All time"]], F.preset)}</div><div class="chips" style="margin:0">${chips("pool", [["all", "All stock"], ["own", "SahiReach"], ["qc", "Quick commerce"]], F.pool)}</div></div><button class="btn btn-secondary btn-sm" data-act="purExcel">${ic("doc", "sm")} Download Excel</button></div>
    <div class="tiles tiles-4">
      ${money ? tile(`Purchases · ${R.label}`, lakhS(cur.value), "L", `Excl. GST${F.pool === "all" ? ` · SahiReach ₹${lakh(cur.own)} L · QC ₹${lakh(cur.qc)} L` : ""}`, prev ? chgTxt(cur.value, prev.value, R.cmp) : "") : ""}
      ${tile("Crates received", nf(cur.crates, 0), "", `${nf(cur.boxes)} boxes · ${cur.lines} invoice lines`, prev ? chgTxt(cur.crates, prev.crates, R.cmp) : "")}
      ${tile("Invoices", nf(cur.n), "", cur.n ? `${money ? "Avg " + rs(cur.value / cur.n) + " · " : ""}${cur.last ? "latest " + fmtDate(cur.last) : ""}` : "None in this period", "")}
      ${tile("Last purchase", last ? fmtDate(last) : "–", "", last ? daysAgo(last) : "No purchases yet", "", last && (toDate(ymd(NOW())) - toDate(last)) / 864e5 > 10 ? "warn" : "")}
      ${!money ? tile("Ordered vs received", O.fill != null ? pct(O.fill, 0) : "–", "", O.pos ? `${O.pos} Hangyo PO${O.pos > 1 ? "s" : ""} placed · ${O.open} line${O.open === 1 ? "" : "s"} still to come` : "No POs placed in this period", "") : ""}
    </div>
    ${money ? `<div class="banner ${O.pos ? "info" : "plain"}" style="${O.pos ? "" : "background:var(--fill-2);color:var(--ink-2)"}">${ic("truck", "sm")}<span>${O.pos ? `<b>Ordered vs received:</b> ${O.pos} Hangyo PO${O.pos > 1 ? "s" : ""} placed in this period, ${pct(O.fill || 0, 0)} of the boxes ordered have come in${O.open ? ` · ${O.open} line${O.open === 1 ? "" : "s"} still to come` : ""}.` : "No Hangyo POs were placed in this period."}</span></div>` : ""}
    <div class="grid-2">
      ${chartCard("purMonths", "Purchases by month", money ? "₹ lakh, excl. GST · last 6 months" : "Crates received · last 6 months", `<span><i style="background:var(--s-gt)"></i>SahiReach</span><span><i style="background:var(--s-swiggy)"></i>Quick commerce</span>`, purBars(months), `<div class="table-wrap"><table class="t"><thead><tr><th>Month</th><th class="r">Invoices</th><th class="r">Crates</th>${money ? `<th class="r">Value</th>` : ""}</tr></thead><tbody>${months.map((x) => `<tr><td>${esc(x.label)} ${x.k.slice(0, 4)}</td><td class="r">${x.n}</td><td class="r">${nf(x.crates)}</td>${money ? `<td class="r">${rs(x.value)}</td>` : ""}</tr>`).join("")}</tbody></table></div>`)}
      <div class="card"><div class="card-head"><div><div class="card-title">What was bought</div><div class="card-sub">${esc(R.label)} · by product</div></div></div><div class="card-pad" style="padding-top:6px">${prods.length ? `<div class="table-wrap" style="max-height:330px;overflow:auto"><table class="t"><thead><tr><th>Product</th><th class="r">Times</th><th class="r">Crates</th>${money ? `<th class="r">Value</th><th class="r">Rate / box</th>` : ""}<th class="r">Last</th></tr></thead><tbody>${prods.map((r) => `<tr><td>${esc(shortName(r.name))}</td><td class="r">${r.n}</td><td class="r">${nf(r.crates, 1)}</td>${money ? `<td class="r">${rs(r.value)}</td><td class="r">${r.boxes ? rs2(r.value / r.boxes) : "–"}</td>` : ""}<td class="r">${fmtDate(r.last)}</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">Nothing bought in this period.</div>`}</div></div>
    </div>
    <div><div class="group-label"><span>Every purchase · ${esc(R.label)}</span><span>${cur.n}</span></div>
      ${cur.n ? Object.keys(byMonth).sort().reverse().map((mk) => { const L = byMonth[mk], mv = L.reduce((a, x) => a + x.value, 0), mc = L.reduce((a, x) => a + x.crates, 0); return `<div class="pur-month"><div class="pur-month-head"><span>${MONTH_LONG[+mk.slice(5) - 1]} ${mk.slice(0, 4)}</span><span>${L.length} invoice${L.length > 1 ? "s" : ""} · ${nf(mc)} crates${money ? " · " + rs(mv) : ""}</span></div><div class="group">${L.map((x) => `<button class="row" data-act="purchaseSheet" data-id="${esc(x.id)}"><span class="pur-date"><b>${toDate(x.date).getDate()}</b><span>${MONTHS[toDate(x.date).getMonth()]}</span></span><span class="grow"><div class="row-title clip">${x.inv ? "Invoice " + esc(x.inv) : "Hangyo purchase"}</div><div class="row-sub clip">${x.pool === "qc" ? `<span class="pill plain" style="height:20px;font-size:11px">Quick commerce</span> ` : ""}${x.lines.length} line${x.lines.length > 1 ? "s" : ""} · ${nf(x.crates, 1)} crates${x.entered && x.entered.slice(0, 10) !== x.date ? ` · entered ${fmtDate(x.entered)}` : ""}</div></span><span class="row-end"><span style="text-align:right">${money ? `<div class="row-value">${rs(x.value)}</div>` : `<div class="row-value">${nf(x.crates, 1)} cr</div>`}</span>${ic("chevR", "sm chev")}</span></button>`).join("")}</div></div>`; }).join("") : `<div class="group"><div class="empty"><div class="big">No purchases in this period</div>Received stock appears here by its invoice date.</div></div>`}</div>
    ${other.length ? `<div><div class="group-label"><span>Other stock received (not a Hangyo purchase)</span><span>${other.length}</span></div><div class="group">${other.map((x) => `<button class="row" data-act="purchaseSheet" data-id="${esc(x.id)}"><span class="grow"><div class="row-title clip">${esc(x.supplier)}${x.inv ? " · " + esc(x.inv) : ""}</div><div class="row-sub">${fmtDate(x.date)} · ${nf(x.crates, 1)} crates</div></span>${ic("chevR", "sm chev")}</button>`).join("")}</div></div>` : ""}
  </div>`;
}
ACT.purF = (el) => { S.pur = S.pur || { preset: "month", pool: "all" }; S.pur[el.dataset.f] = el.dataset.v; render(); };

/* ---------- dashboard: a purchases strip for the dashboard's period ---------- */
function purBand(R, cmp) {
  if (S.dash && S.dash.district !== "all") return "";
  const pool = S.dash && S.dash.ch === "gt" ? "own" : S.dash && ["qc", "swiggy", "zepto"].includes(S.dash.ch) ? "qc" : "all";
  const cur = purStats(R.from, R.to, pool), prev = R.pFrom ? purStats(R.pFrom, R.pTo, pool) : null, last = purLast(), money = SEE_MONEY;
  const d = prev ? (money ? chgTxt(cur.value, prev.value, cmp) : chgTxt(cur.crates, prev.crates, cmp)) : "";
  return `<button class="pur-band" data-act="drill" data-k="purchases">
    <span class="pur-band-main"><span class="tile-label"><span>Purchases from Hangyo${pool !== "all" ? pool === "qc" ? " · quick commerce" : " · SahiReach" : ""}</span>${ic("chevR", "sm dim")}</span><span class="tile-value">${money ? `${lakhS(cur.value)}<small>L</small>` : `${nf(cur.crates)}<small>crates</small>`}</span>${d ? deltaChip(d) : ""}</span>
    <span class="pur-band-stats"><span><b>${nf(cur.n)}</b> invoice${cur.n === 1 ? "" : "s"}</span><span><b>${nf(cur.crates)}</b> crates</span>${money && pool === "all" ? `<span>SahiReach <b>₹${lakh(cur.own)} L</b> · QC <b>₹${lakh(cur.qc)} L</b></span>` : ""}<span>Last purchase <b>${last ? fmtDate(last) : "–"}</b>${last ? " · " + daysAgo(last) : ""}</span></span>
    <span class="pur-band-chart">${purBars(purMonths(6, pool), { mini: true, w: 220, h: 64 })}</span>
  </button>`;
}
function purDrill(R) {
  const pool = S.dash && S.dash.ch === "gt" ? "own" : S.dash && ["qc", "swiggy", "zepto"].includes(S.dash.ch) ? "qc" : "all", cur = purStats(R.from, R.to, pool), money = SEE_MONEY;
  const g = {}; cur.inv.forEach((x) => x.lines.forEach((l) => { const r = (g[l.sap || l.product] = g[l.sap || l.product] || { n: l.product, v: 0, c: 0 }); r.v += +l.value || 0; r.c += +l.crates || 0; }));
  const tbl = (head, rows) => `<div class="table-wrap"><table class="t"><thead><tr>${head.map((h, i) => `<th class="${i ? "r" : ""}">${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td class="${i ? "r" : ""}">${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  return {
    title: "Purchases from Hangyo", big: money ? `₹${lakh(cur.value)}<small>lakh</small>` : `${nf(cur.crates)}<small>crates</small>`,
    sub: `${cur.n} invoice${cur.n === 1 ? "" : "s"} · ${nf(cur.crates)} crates${money ? ` · SahiReach ₹${lakh(cur.own)} L · QC ₹${lakh(cur.qc)} L` : ""} · by invoice date`,
    body: `${tbl(["Invoice", "Date", "Crates"].concat(money ? ["Value"] : []), cur.inv.map((x) => [`${x.inv ? esc(x.inv) : "Hangyo purchase"}${x.pool === "qc" ? `<div class="row-sub">Quick commerce</div>` : ""}`, fmtDate(x.date), nf(x.crates, 1)].concat(money ? [rs(x.value)] : [])))}
      <div class="group-label" style="padding-bottom:0"><span>By product</span></div>${tbl(["Product", "Crates"].concat(money ? ["Value"] : []), Object.values(g).sort((a, b) => (money ? b.v - a.v : b.c - a.c)).map((r) => [esc(shortName(r.n)), nf(r.c, 1)].concat(money ? [rs(r.v)] : [])))}
      <button class="btn btn-secondary" style="margin-top:12px" data-act="purOpen">${ic("box", "sm")} Open the purchases report</button>`,
  };
}
ACT.purOpen = () => { closeSheet(); S.stockTab = "purchases"; go("stock"); };

/* ---------- Excel (styled, like the item ledger) ---------- */
ACT.purExcel = async (el) => {
  if (el) el.disabled = true;
  try { await loadScriptOnce(XLSXS_SRC, () => !!(window.XLSX && window.XLSX.style_version)); }
  catch (e) { if (el) el.disabled = false; toast("Could not prepare the Excel file. Check your internet and try again.", "alert"); return; }
  const X = window.XLSX, F = S.pur || { preset: "month", pool: "all" }, R = purRange(F.preset), cur = purStats(R.from, R.to, F.pool), money = SEE_MONEY;
  const NUM = "#,##0", DEC = "#,##0.00", RS = '"₹"#,##0.00', DATE = "dd-mmm-yyyy", poolTxt = F.pool === "all" ? "SahiReach and quick commerce" : F.pool === "qc" ? "quick commerce" : "SahiReach stock";
  const sum = [["Invoices", cur.n, NUM], ["Crates received", cur.crates, DEC], ["Boxes received", cur.boxes, NUM], ["Last purchase", cur.last ? fmtDate(cur.last) : "–"]].concat(money ? [["Value excl. GST", cur.value, RS], ["SahiReach stock", cur.own, RS], ["Quick commerce", cur.qc, RS], ["Average per invoice", cur.n ? cur.value / cur.n : null, RS]] : []);
  const head1 = [{ t: "Invoice date", z: DATE }, { t: "Invoice" }, { t: "Into" }, { t: "Lines", r: 1, z: NUM }, { t: "Crates", r: 1, z: DEC }, { t: "Boxes", r: 1, z: NUM }].concat(money ? [{ t: "Value excl. GST", r: 1, z: RS }] : [], [{ t: "Entered in the tool", z: DATE }, { t: "Reference" }]);
  const body1 = cur.inv.slice().reverse().map((x) => [{ v: ilSerial(x.date), t: "n" }, x.inv || "", x.pool === "qc" ? "Quick commerce" : "SahiReach stock", x.lines.length, x.crates, x.boxes].concat(money ? [x.value] : [], [x.entered ? { v: ilSerial(x.entered.slice(0, 10)), t: "n" } : "", x.id]));
  const foot1 = ["", "Total", "", cur.lines, cur.crates, cur.boxes].concat(money ? [cur.value] : [], ["", ""]);
  const L1 = ilLedgerRows("Purchases from Hangyo", `${R.label} (${dmyOf(R.from)} to ${dmyOf(R.to)}) · ${poolTxt} · by invoice date · ${CO.name || "SahiReach LLP"}`, sum, head1, body1, foot1);
  const head2 = [{ t: "Invoice date", z: DATE }, { t: "Invoice" }, { t: "Into" }, { t: "Product" }, { t: "SAP code" }, { t: "Batch" }, { t: "Crates", r: 1, z: DEC }, { t: "Boxes", r: 1, z: NUM }].concat(money ? [{ t: "Rate / box", r: 1, z: RS }, { t: "Value", r: 1, z: RS }] : []);
  const body2 = []; cur.inv.slice().reverse().forEach((x) => x.lines.forEach((l) => body2.push([{ v: ilSerial(x.date), t: "n" }, x.inv || "", x.pool === "qc" ? "Quick commerce" : "SahiReach stock", l.product, l.sap || "", l.batch || "", +l.crates || 0, +l.ea || 0].concat(money ? [l.rate != null ? +l.rate : "", +l.value || 0] : []))));
  const L2 = ilLedgerRows("Purchase lines", `${R.label} · ${poolTxt} · every product on every invoice`, [], head2, body2, ["", "Total", "", "", "", "", cur.crates, cur.boxes].concat(money ? ["", cur.value] : []));
  const wb = X.utils.book_new();
  X.utils.book_append_sheet(wb, ilSheet(X, L1.rows, [13, 18, 16, 8, 10, 10].concat(money ? [15] : [], [14, 24]), L1.merges), "Purchases");
  X.utils.book_append_sheet(wb, ilSheet(X, L2.rows, [13, 18, 16, 44, 11, 14, 9, 9].concat(money ? [12, 14] : []), L2.merges), "Lines");
  X.writeFile(wb, `SahiReach purchases ${R.label.replace(/[^\w\s-]/g, "")} ${dmyOf(ymd(NOW()))}.xlsx`, { compression: true, cellStyles: true });
  if (el) el.disabled = false; logActivity("Purchases report downloaded", R.label, "Excel"); toast("Purchases report downloaded", "doc");
};

/* ===== TOD & NOTES ===== */
function todState() {
  const by = {}; let total = 0;
  D.tod.lines.forEach((l) => { const o = orderById(l.id); if (o && o.status !== "Dispatched") return; const due = Math.max(0, (l.amount || 0) - (l.received || 0)); if (!by[l.dist]) by[l.dist] = { name: l.dist, due: 0, earned: 0, lines: 0 }; by[l.dist].due += due; by[l.dist].earned += l.amount || 0; by[l.dist].lines++; total += due; });
  return { by: Object.values(by).sort((a, b) => b.due - a.due), total };
}
/* TOD belongs to the month the sales were dispatched in; Hangyo pays each month's TOD separately */
function todLineMonth(l) { const o = orderById(l.id); return String((o && o.dispatched) || l.time || "").slice(0, 7); }
function todMonths() {
  const by = {};
  const mk = (k) => (by[k] = by[k] || { k, earned: 0, received: 0, due: 0, lines: 0, paid: 0, excess: 0, receipts: 0 });
  D.tod.lines.forEach((l) => { const o = orderById(l.id); if (o && o.status !== "Dispatched") return; const x = mk(todLineMonth(l)); x.earned += l.amount || 0; x.received += l.received || 0; x.due += Math.max(0, (l.amount || 0) - (l.received || 0)); x.lines++; });
  (D.tod.receipts || []).forEach((r) => { if (!r.month) return; const x = mk(r.month); x.paid += r.amount || 0; x.excess += r.excess || 0; x.receipts++; });
  return Object.values(by).filter((x) => x.k).sort((a, b) => (a.k < b.k ? 1 : -1));
}
const monthName = (k) => (k ? MONTH_LONG[+k.slice(5) - 1] + " " + k.slice(0, 4) : "");
function todHtml() {
  const T = todState(), max = T.by.length ? T.by[0].earned : 1, byOrder = {};
  D.tod.lines.forEach((l) => { const g = (byOrder[l.id] = byOrder[l.id] || { id: l.id, dist: l.dist, time: l.time, amount: 0, received: 0, n: 0 }); g.amount += l.amount || 0; g.received += l.received || 0; g.n++; });
  const orders = Object.values(byOrder).sort((a, b) => (a.time < b.time ? 1 : -1));
  return `<div class="grid-2"><div class="card card-pad"><div class="tile-label">Due from Hangyo, all months</div><div class="hero-figure" style="font-size:44px">${rs(T.total)}</div><div class="tile-sub">Special price below the normal rate on dispatched orders. Hangyo pays it the month after.</div><div style="margin-top:16px"><button class="btn btn-primary" data-act="todRecvSheet">${ic("plus", "sm")} Record TOD received</button></div></div>
    <div><div class="group-label"><span>By distributor</span></div><div class="group">${T.by.map((d) => `<div class="row"><span class="avatar soft">${esc(initials(d.name))}</span><span class="grow"><div class="row-title clip">${esc(d.name)}</div><div class="bar-cell" style="margin-top:5px"><div class="meter"><i style="width:${(d.earned / max) * 100}%"></i></div><span class="row-sub nowrap">${d.lines} lines · earned ${rs(d.earned)}</span></div></span><span class="row-end"><span style="text-align:right"><div class="row-value">${rs2(d.due)}</div><div class="row-sub">still due</div></span></span></div>`).join("")}</div></div></div>
    ${(() => { const M = todMonths(); return M.length ? `<div><div class="group-label"><span>By month of sale</span><span>each month's TOD is paid separately</span></div><div class="card"><div class="table-wrap"><table class="t"><thead><tr><th>Sales month</th><th class="r">TOD earned</th><th class="r">Received</th><th class="r">Still due</th><th class="r">Excess received</th></tr></thead><tbody>${M.map((x) => `<tr><td>${esc(monthName(x.k))}</td><td class="r">${x.lines ? rs2(x.earned) : `<span class="dim">not in the tool</span>`}</td><td class="r">${rs2(x.received)}</td><td class="r"><b>${rs2(x.due)}</b></td><td class="r">${x.excess > 0.005 ? `<span style="color:var(--warn);font-weight:600">${rs2(x.excess)}</span>` : "–"}</td></tr>`).join("")}</tbody></table></div></div></div>` : ""; })()}
    ${D.tod.receipts && D.tod.receipts.length ? `<div><div class="group-label"><span>Received from Hangyo</span></div><div class="group">${D.tod.receipts.map((r) => `<div class="row"><span class="attn-ic ${r.excess > 0.005 ? "warn" : "tint"}">${ic(r.excess > 0.005 ? "alert" : "check")}</span><span class="grow"><div class="row-title">${rs2(r.amount)}${r.month ? ` · for ${esc(monthName(r.month))} sales` : ""}</div><div class="row-sub">${fmtDate(r.date)}${r.ref ? " · " + esc(r.ref) : ""}${r.month ? ` · ${rs2(r.applied != null ? r.applied : r.amount - (r.excess || 0))} set against that month${r.excess > 0.005 ? ` · <span style="color:var(--warn);font-weight:600">${rs2(r.excess)} excess</span>` : ""}` : " · set off oldest first"}</div></span></div>`).join("")}</div></div>` : ""}
    <div><div class="group-label"><span>TOD by order</span><span>paid month by month</span></div><div class="group">${orders.map((g) => { const st = g.received >= g.amount - 0.005 ? "Received" : g.received > 0 ? "Part received" : "Expected"; return `<button class="row" data-act="orderSheet" data-id="${esc(g.id)}"><span class="grow"><div class="row-title clip">${esc(g.dist)}</div><div class="row-sub">${fmtDate(g.time)} · ${g.n} lines</div></span><span class="row-end">${statusPill(st)}<span class="row-value">${rs2(g.amount)}</span>${ic("chevR", "sm chev")}</span></button>`; }).join("")}</div></div>`;
}
function notesHtml() {
  const shortType = (t) => String(t).split(" - ")[0];
  return `<div class="hstack between wrap gap-12"><div class="row-sub" style="max-width:60ch">Returns and credit notes come off sales on the dashboard. Raise the GST note in Vyapar as usual.</div><button class="btn btn-primary" data-act="noteSheet">${ic("plus", "sm")} New note</button></div>
    <div class="group">${D.notes.slice().reverse().map((n) => `<div class="row tap" role="button" tabindex="0" data-act="noteOpen" data-id="${esc(n.id)}" style="cursor:pointer"><span class="attn-ic ${/return/i.test(n.type) ? "warn" : "info"}">${ic(/return/i.test(n.type) ? "undo" : "rupee")}</span><span class="grow"><div class="row-title clip">${esc(n.party || "Hangyo")}</div><div class="row-sub clip">${esc(shortType(n.type))} · ${fmtDate(n.date)}${n.no ? " · " + esc(n.no) : ""}${Array.isArray(n.lines) && n.lines.length > 1 ? " · " + n.lines.length + " products" : n.product ? " · " + esc(shortName(n.product)) : ""}</div></span><span class="row-end">${statusPill(n.status || "Active")}<span class="row-value">${rs2(n.amount)}</span>${ic("chevR", "sm chev")}</span></div>`).join("")}</div>`;
}
VIEWS.tod = () => `<div class="page narrow">
  <div class="page-head"><div><h1 class="title">TOD & notes</h1><div class="subtitle">What Hangyo owes you for special-price distributors, and every credit or debit note.</div></div></div>
  ${seg("moneyTab", S.moneyTab, [["tod", "TOD"], ["notes", "Credit & debit notes", D.notes.length]])}
  ${S.moneyTab === "tod" ? todHtml() : notesHtml()}</div>`;
function todMonthChoices() {
  const M = {}; todMonths().forEach((x) => { M[x.k] = x; });
  const now = NOW(), out = [];
  for (let i = 0; i < 12; i++) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1), k = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`; out.push(M[k] || { k, earned: 0, due: 0, lines: 0 }); }
  Object.values(M).forEach((x) => { if (!out.find((y) => y.k === x.k)) out.push(x); });
  return out.sort((a, b) => (a.k < b.k ? 1 : -1));
}
function todDefaultMonth() { const ch = todMonthChoices().filter((x) => x.due > 0.005).sort((a, b) => (a.k > b.k ? 1 : -1)); if (ch.length) return ch[0].k; const d = NOW(); const p = new Date(d.getFullYear(), d.getMonth() - 1, 1); return `${p.getFullYear()}-${pad2(p.getMonth() + 1)}`; }
function todRecvMsg() {
  const k = ($("#tr-month") || {}).value, amt = +(($("#tr-amt") || {}).value) || 0, x = todMonths().find((m) => m.k === k) || { due: 0, lines: 0, earned: 0 };
  const head = x.lines ? `TOD still due for ${monthName(k)} sales: <b>${rs2(x.due)}</b> (earned ${rs2(x.earned)}).` : `No TOD is recorded in the tool for ${monthName(k)} sales.`;
  if (!(amt > 0)) return `<div class="banner info">${ic("info", "sm")}<span>${head} The payment is set against this month only, never another month.</span></div>`;
  if (amt > x.due + 0.005) return `<div class="banner warn">${ic("alert", "sm")}<span>${head} This payment is <b>${rs2(amt - x.due)} more</b>${x.due > 0.005 ? ` than what is due. ${rs2(x.due)} clears ${monthName(k)} and the extra` : ". All of it"} is kept as excess for ${monthName(k)}, probably TOD on orders that are not in the tool. It is not moved to any other month.</span></div>`;
  if (amt < x.due - 0.005) return `<div class="banner info">${ic("info", "sm")}<span>${head} After this, <b>${rs2(x.due - amt)}</b> is still due for ${monthName(k)}.</span></div>`;
  return `<div class="banner good">${ic("check", "sm")}<span>${head} This clears ${monthName(k)} exactly.</span></div>`;
}
IN.todRecv = () => part("tr-msg", todRecvMsg());
ACT.todRecvSheet = () => { openSheet("Record TOD received", `<div class="card card-pad"><div class="form-grid"><div class="field full"><label class="label" for="tr-month">TOD for sales in</label><select class="select" id="tr-month" data-in="todRecv">${todMonthChoices().map((x) => `<option value="${x.k}" ${x.k === todDefaultMonth() ? "selected" : ""}>${esc(monthName(x.k))}${x.lines ? ` · ${x.due > 0.005 ? rs2(x.due) + " due" : "nothing due"}` : " · none in the tool"}</option>`).join("")}</select></div><div class="field"><label class="label" for="tr-amt">Amount received (₹)</label><input class="input num-in" id="tr-amt" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00" data-in="todRecv"></div><div class="field"><label class="label" for="tr-date">Date received</label><input class="input" id="tr-date" type="date" value="${iso(NOW()).slice(0, 10)}"></div><div class="field full"><label class="label" for="tr-ref">Hangyo reference (credit note number)</label><input class="input" id="tr-ref" placeholder="Optional"></div></div></div><div id="tr-msg"></div>`, `<button class="btn btn-primary" data-act="todRecvSave">Save receipt</button>`); part("tr-msg", todRecvMsg()); };
ACT.todRecvSave = () => {
  let amt = +$("#tr-amt").value || 0; if (amt <= 0) { toast("Type the amount Hangyo paid", "info"); return; }
  const month = $("#tr-month").value; if (!month) { toast("Choose the month the TOD is for", "info"); return; }
  const orig = amt;
  /* only this month's lines, oldest first; nothing spills into another month */
  D.tod.lines.filter((l) => todLineMonth(l) === month).sort((a, b) => (a.time > b.time ? 1 : -1)).forEach((l) => { if (amt <= 0.005) return; const o = orderById(l.id); if (o && o.status !== "Dispatched") return; const due = (l.amount || 0) - (l.received || 0); if (due <= 0.005) return; const pay = Math.min(due, amt); l.received = Math.round(((l.received || 0) + pay) * 100) / 100; l.status = l.received >= l.amount - 0.005 ? "Received" : "Part received"; amt -= pay; });
  const excess = amt > 0.005 ? Math.round(amt * 100) / 100 : 0;
  D.tod.receipts = D.tod.receipts || []; D.tod.receipts.unshift({ amount: orig, date: $("#tr-date").value, ref: $("#tr-ref").value, month, applied: Math.round((orig - excess) * 100) / 100, excess });
  logActivity("TOD received", $("#tr-ref").value || "Hangyo", `${rs2(orig)} for ${monthName(month)} sales${excess ? ` · ${rs2(excess)} excess` : ""}`); closeSheet(); render();
  toast(excess ? `${rs2(orig)} for ${monthName(month)}: ${rs2(excess)} more than recorded, kept as excess` : `${rs2(orig)} set against ${monthName(month)} TOD`, excess ? "alert" : "check");
};
/* the note form and its products: 06i-notes.js */

/* ===== SETUP ===== */
function distGrid() {
  const q = key(S.setupQ), list = D.distributors.filter((d) => !q || key(d.name + " " + d.district + " " + d.short).includes(q));
  return `<div class="dg" style="--cols:minmax(0,2fr) 110px 130px 90px 110px 120px;--cols-sm:minmax(0,1fr) auto"><div class="dg-row dg-head"><span>Distributor</span><span class="c-hide">District</span><span class="c-hide">Payment</span><span class="r c-hide">Credit</span><span class="r c-hide">Deposit</span><span>Pricing</span></div>${list.map((d) => `<button class="dg-row" data-act="distSheet" data-name="${esc(d.name)}"><span class="hstack gap-10"><span class="avatar soft">${esc(initials(d.name))}</span><span style="min-width:0"><div class="strong clip">${esc(d.name)}</div><div class="row-sub clip">${esc(d.short || "")}${d.phone ? " · " + esc(d.phone) : ""}</div></span></span><span class="c-hide">${esc(d.district || "–")}</span><span class="c-hide">${esc(d.pay || "Not set")}</span><span class="r c-hide">${d.credit != null ? d.credit + " days" : "–"}</span><span class="r c-hide">${d.deposit ? rs(d.deposit) : "–"}</span><span>${d.special ? `<span class="pill plain tint">Special</span>` : `<span class="pill plain">Normal</span>`}</span></button>`).join("")}</div>`;
}
function catalogGrid() {
  const q = key(S.setupQ), all = D.catalog.filter((c) => !q || q.split(" ").every((w) => key(c.name + " " + c.sap + " " + c.cat).includes(w))), list = all.slice(0, 80);
  return `<div class="row-sub" style="margin-bottom:8px">Showing ${list.length} of ${all.length} products from the Hangyo South Kerala list${all.length > list.length ? ". Search to narrow it down." : "."}</div><div class="dg" style="--cols:minmax(0,2.2fr) 90px${SEE_MONEY ? " 90px" : ""} 100px 90px 90px 96px;--cols-sm:minmax(0,1fr) auto"><div class="dg-row dg-head"><span>Product</span><span class="r c-hide">MRP / box</span>${SEE_MONEY ? `<span class="r c-hide">SS rate</span>` : ""}<span class="r">Distributor rate</span><span class="r c-hide">Special</span><span class="r c-hide">Dealer</span><span class="c-hide">Range</span></div>${list.map((c) => { const p = D.prices[c.sap] || []; return `<button class="dg-row" data-act="productSheet" data-sap="${esc(c.sap)}"><span><div class="strong clip">${esc(c.name)}</div><div class="row-sub clip">${esc(c.cat || "")} · SAP ${esc(c.sap || "–")}</div></span><span class="r c-hide">${c.mrp != null ? rs(c.mrp) : "–"}</span>${SEE_MONEY ? `<span class="r c-hide">${p[0] != null ? rs2(p[0]) : "–"}</span>` : ""}<span class="r strong">${p[1] != null ? rs2(p[1]) : "–"}</span><span class="r c-hide">${D.special.prices[c.sap] != null ? `<span style="color:var(--tint);font-weight:600">${rs2(D.special.prices[c.sap])}</span>` : "–"}</span><span class="r c-hide">${p[2] != null ? rs2(p[2]) : "–"}</span><span class="c-hide">${c.stocked ? `<span class="pill plain good">Stocked</span>` : `<span class="pill plain">Not stocked</span>`}</span></button>`; }).join("")}</div>`;
}
/* every product with a special price: normal rate, special price, the discount; tap to change it */
function specialProductsHtml() {
  const q = key(S.specialQ || ""), rows = Object.keys(D.special.prices).map((sap) => { const c = catBySap[sap] || stockBySap[sap] || { name: sap }, n = price(sap), s = D.special.prices[sap]; return { sap, name: c.name, n, s, off: n > 0 && s != null ? 1 - s / n : null }; })
    .filter((r) => !q || q.split(" ").every((w) => key(r.name + " " + r.sap).includes(w))).sort((a, b) => (a.off != null && a.off < 0.005 ? -1 : 0) - (b.off != null && b.off < 0.005 ? -1 : 0) || a.name.localeCompare(b.name));
  const none = rows.filter((r) => r.off != null && r.off < 0.005).length;
  return `${none ? `<div class="banner warn" style="margin-bottom:10px">${ic("alert", "sm")}<span><b>${none} product${none > 1 ? "s have" : " has"} a special price that is not below the normal rate</b>, so special-price distributors get no discount on ${none > 1 ? "them" : "it"}. They are at the top: tap one to fix the price.</span></div>` : ""}
    <div class="dg" style="--cols:minmax(0,2.2fr) 110px 110px 80px;--cols-sm:minmax(0,1fr) auto"><div class="dg-row dg-head"><span>Product</span><span class="r c-hide">Normal rate</span><span class="r">Special price</span><span class="r c-hide">Off</span></div>
    ${rows.map((r) => `<button class="dg-row" data-act="${CAN_PRICE ? "productEdit" : "productSheet"}" data-sap="${esc(r.sap)}"><span><div class="strong clip">${esc(r.name)}</div><div class="row-sub clip">SAP ${esc(r.sap)}</div></span><span class="r c-hide">${r.n != null ? rs2(r.n) : "–"}</span><span class="r strong" style="color:var(--tint)">${rs2(r.s)}</span><span class="r c-hide">${r.off == null ? "–" : r.off < 0.005 ? `<span class="pill warn">none</span>` : pct(r.off, 1)}</span></button>`).join("") || `<div class="empty">Nothing matches.</div>`}</div>`;
}
IN.specialQ = (el) => { S.specialQ = el.value; part("sp-prods", specialProductsHtml()); };
function specialHtml() {
  const sp = D.distributors.filter((d) => d.special), n = Object.keys(D.special.prices).length;
  const tab = S.spTab || "products";
  return `<div class="card card-pad"><div class="card-title">Special prices and TOD</div><div class="row-sub" style="max-width:66ch;margin-top:4px">These distributors buy at ${Math.round(D.special.pct * 100)}% below the normal South Kerala rate on ${n} products. The difference on every dispatched order is tracked as TOD and claimed from Hangyo the next month.</div></div>
    ${seg("spTab", tab, [["products", "Products", n], ["distributors", "Distributors on special prices", sp.length]])}
    ${tab === "products" ? `<div><div class="group-label"><span>Products with a special price (${n})</span><span>${CAN_PRICE ? "tap one to change it" : ""}</span></div>
      <div class="hstack gap-12 wrap" style="margin-bottom:10px"><div class="search" style="flex:1;min-width:200px">${ic("search", "sm")}<input class="input" id="sp-q" type="search" placeholder="Search products" value="${esc(S.specialQ || "")}" data-in="specialQ" autocomplete="off"></div>${CAN_PRICE ? `<span class="row-sub">To add one: Products &amp; prices → the product → Edit → Special price</span>` : ""}</div>
      <div id="sp-prods">${specialProductsHtml()}</div></div>` : `<div class="group">${D.distributors.map((d) => `<div class="row"><span class="avatar soft">${esc(initials(d.name))}</span><span class="grow"><div class="row-title clip">${esc(d.name)}</div><div class="row-sub">${esc(d.district || "")}${d.freezer ? " · " + esc(d.freezer) : ""}</div></span><span class="row-end">${d.special ? `<span class="pill plain tint">${Math.round(D.special.pct * 100)}% off</span>` : ""}<button class="toggle" role="switch" aria-checked="${!!d.special}" data-act="toggleSpecial" data-name="${esc(d.name)}" aria-label="Special prices for ${esc(d.name)}"></button></span></div>`).join("")}</div>`}`;
}
function activityHtml() {
  const list = D.activity.filter((a) => SEE_MONEY || !/tod|trip|price|cost|ss rate/i.test(a.action)).slice(0, 70), tone = (a) => (/cancel/i.test(a) ? "bad" : /dispatch|delivered|received/i.test(a) ? "good" : /edited|hand/i.test(a) ? "warn" : "tint");
  return `<div class="card card-pad"><div class="timeline">${list.map((a) => `<div class="tl"><span class="tl-dot ${tone(a.action)}"></span><div><div><b>${esc(a.action)}</b>${a.ref ? ` <span class="mono dim">${esc(a.ref)}</span>` : ""}</div><div class="row-sub">${esc(a.detail || "")}</div><div class="row-sub dim">${fmtDT(a.time)}${a.by ? " · " + esc(a.by) : ""}</div></div></div>`).join("")}</div></div>`;
}
VIEWS.setup = () => {
  const tab = S.setupTab, searchable = tab === "distributors" || tab === "products";
  return `<div class="page">
    <div class="page-head"><div><h1 class="title">Setup</h1><div class="subtitle">Distributors, products and prices, company details, and a record of everything that was changed.</div></div>${tab === "distributors" ? `<div class="head-actions"><button class="btn btn-primary" data-act="distEdit">${ic("plus", "sm")} Add distributor</button></div>` : tab === "products" ? `<div class="head-actions"><button class="btn btn-primary" data-act="productEdit">${ic("plus", "sm")} Add product</button></div>` : ""}</div>
    <div class="hstack gap-12 wrap">${seg("setupTab", tab, [["distributors", "Distributors", D.distributors.length], ["products", "Products & prices"], ["special", "Special prices"], ["settings", "Company & QC"], ["activity", "Activity log"]])}${searchable ? `<div class="search">${ic("search", "sm")}<input class="input" id="setup-q" type="search" placeholder="${tab === "distributors" ? "Search distributors" : "Search products, codes or categories"}" value="${esc(S.setupQ)}" data-in="setupQ" autocomplete="off"></div>` : ""}</div>
    <div id="setup-body">${tab === "distributors" ? distGrid() : tab === "products" ? catalogGrid() : tab === "special" ? specialHtml() : tab === "settings" ? settingsHtml() : activityBody()}</div></div>`;
};
IN.setupQ = (el) => { S.setupQ = el.value; part("setup-body", S.setupTab === "distributors" ? distGrid() : catalogGrid()); };
ACT.toggleSpecial = (el) => { const d = distByKey[key(el.dataset.name)]; d.special = !d.special; part("setup-body", specialHtml()); toast(d.special ? `${d.name} now gets special prices` : `${d.name} is back on the normal rate`); };
ACT.distSheet = (el) => {
  const d = distByKey[key(el.dataset.name)]; if (!d) return;
  const H = homeData(), R = H.R, all = H.facts.filter((f) => f.ch === "gt" && f.dist === d.name && f.kind !== "note"), inR = (a, b) => (a ? all.filter((f) => f.date >= a && f.date <= b) : []), sum = (F) => F.reduce((a, f) => a + f.value, 0);
  const nowF = inR(R.from, R.to), last = all.reduce((m, f) => (f.date > m ? f.date : m), ""), perf = all.length ? { now: sum(nowF), prev: sum(inR(R.pFrom, R.pTo)), orders: new Set(nowF.map((f) => f.ref)).size, crates: nowF.reduce((a, f) => a + f.crates, 0), last, days: daysBetween(last, ymd(NOW())) } : null;
  if (perf) perf.status = perf.days > 14 ? "Dormant" : perf.prev ? (perf.now >= perf.prev ? "Growing" : "Declining") : perf.now ? "New" : "";
  const orders = D.orders.filter((o) => o.dist === d.name).sort((a, b) => (a.time < b.time ? 1 : -1)), buy = D.dash.buy.find((x) => key(x.name) === key(d.name));
  openSheet(esc(d.name), `<div class="card card-pad"><div class="hstack gap-12" style="align-items:flex-start"><span class="avatar lg soft">${esc(initials(d.name))}</span><div class="grow"><div class="section-title" style="font-size:19px">${esc(d.name)}</div><div class="row-sub">${esc(d.district || "District not set")}${d.phone ? " · " + esc(d.phone) : ""}</div><div class="hstack gap-8 wrap" style="margin-top:8px">${d.special ? `<span class="pill plain tint">Special prices · TOD tracked</span>` : `<span class="pill plain">Normal rate</span>`}${perf && perf.status ? `<span class="pill plain ${perf.status === "Dormant" ? "bad" : /Growing|New/.test(perf.status) ? "good" : ""}">${esc(perf.status)}</span>` : ""}</div></div></div>
      <div class="divider" style="margin:16px 0"></div><div class="kv"><div><div class="k">Orders in</div><div class="v">${esc(UNIT_LABEL[d.uom] || "Not set")}</div></div><div><div class="k">Payment</div><div class="v">${esc(d.pay || "Not set")}</div></div><div><div class="k">Credit</div><div class="v">${d.credit != null ? d.credit + " days" : "Not set"}</div></div><div><div class="k">Security deposit</div><div class="v num">${d.deposit ? rs(d.deposit) : "–"}</div></div><div><div class="k">Freezer</div><div class="v">${esc(d.freezer || "Not set")}</div></div><div><div class="k">Pick list name</div><div class="v">${esc(d.short || "–")}</div></div><div><div class="k">Email</div><div class="v" style="word-break:break-all">${esc(d.email || "Not set")}</div></div></div></div>
    ${perf ? `<div class="tiles" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div class="tile"><div class="tile-label">${esc(R.label)}</div><div class="tile-value">${rs(perf.now)}</div><div>${perf.prev > 0 ? growthChip(perf.now / perf.prev - 1) : ""}</div><div class="tile-sub">${perf.orders} order${perf.orders === 1 ? "" : "s"} · ${nf(perf.crates, 0)} crates</div></div><div class="tile"><div class="tile-label">Last dispatch</div><div class="tile-value">${fmtDate(perf.last)}</div><div class="tile-sub">${perf.days} day${perf.days === 1 ? "" : "s"} ago</div></div></div>` : ""}
    ${buy ? `<div class="banner tint">${ic("info", "sm")}<span><b>Buys ${buy.skus} products.</b> Most of all ${esc(shortName(buy.top))} (${pct(buy.topShare, 0)} of sales). Premium share ${pct(buy.premium, 0)}, entry level ${pct(buy.entry, 0)}.</span></div>` : ""}
    ${orders.length ? `<div><div class="group-label"><span>Orders</span><span>${orders.length}</span></div><div class="group">${orders.slice(0, 8).map((o) => `<button class="row" data-act="orderSheet" data-id="${esc(o.id)}"><span class="grow"><div class="row-title">${fmtDate(o.time)} · ${nf(o.crates)} crates</div><div class="row-sub">${o.lines} lines</div></span><span class="row-end">${statusPill(o.status)}<span class="row-value">${rs(o.value)}</span>${ic("chevR", "sm chev")}</span></button>`).join("")}</div></div>` : ""}`,
    `<button class="btn btn-secondary" data-act="distEdit" data-name="${esc(d.name)}">${ic("pencil", "sm")} Edit details</button><button class="btn btn-primary" data-act="orderFor" data-name="${esc(d.name)}">${ic("plus", "sm")} New order for ${esc(d.short || d.name)}</button>`);
};
ACT.orderFor = (el) => { S.draft = newDraft(); S.draft.dist = el.dataset.name; closeSheet(); closeCmd(); go("new-order"); };

/* ===== MORE (phone) ===== */
VIEWS.more = () => `<div class="page narrow"><div class="page-head"><h1 class="title">More</h1></div>
  <div class="group">${[["quick", "Quick commerce", "Swiggy and Zepto POs, deliveries and GRN", "bolt", openQC().length], ["activity", "Activity log", ADMIN ? "Who did what and when, with undo" : "Who did what and when", "clock"], ...(ADMIN ? [["backups", "Backups", "Copies of all the data: download as Excel, or restore", "lock"]] : []), ["replenish", "Replenishment", "Plan the Hangyo truck", "cycle"], ["accounts", "Accounts", "Books, ledgers, profit and loss, balance sheet, GST", "book"], ["tod", "TOD & notes", "TOD due, credit and debit notes", "rupee"], ["logistics", "Logistics", "Trips, transport cost and its share of sales", "truck", unloggedRuns().length], ["setup", "Setup", "Distributors, products, prices, activity", "gear"]].filter((x) => ROUTES[x[0]]).map(([r, t, s, i, n]) => `<button class="row" data-act="nav" data-to="${r}"><span class="attn-ic tint">${ic(i)}</span><span class="grow"><div class="row-title">${t}</div><div class="row-sub">${s}</div></span><span class="row-end">${n ? `<span class="pill plain info">${n}</span>` : ""}${ic("chevR", "sm chev")}</span></button>`).join("")}</div>
  <div class="group"><button class="row" data-act="cmd"><span class="attn-ic info">${ic("search")}</span><span class="grow"><div class="row-title">Search everything</div><div class="row-sub">Distributors, products, orders</div></span>${ic("chevR", "sm chev")}</button>${HOST ? `<button class="row" data-act="account"><span class="avatar">${esc(initials(ME.name).slice(0, 1) || "S")}</span><span class="grow"><div class="row-title">${esc(ME.name)}</div><div class="row-sub">Account, team and sign out</div></span>${ic("chevR", "sm chev")}</button>` : ""}</div></div>`;

/* ===== ACCOUNT (only on the staff-login page) ===== */
const ROLE_WHAT = {
  owner: "Everything, including costs and profit. Can invite people and change their access.",
  staff: "Orders, dispatch, pick lists, stock and quick commerce. Costs, profit, TOD and logistics are hidden.",
  viewer: "Can see everything, including costs and profit, but cannot change anything.",
  accountant: "Keeps the books: enters receipts, payments, expenses and journals, invoice numbers and the bank statement. Sees everything else but cannot change orders, stock or setup.",
};
ACT.account = () => {
  if (!HOST) return;
  const owner = ROLE === "owner";
  S.inviteRole = S.inviteRole || "staff";
  openSheet("Account", `<div class="card card-pad"><div class="hstack gap-12"><span class="avatar lg soft">${esc(initials(ME.name))}</span><div class="grow"><div class="section-title" style="font-size:19px">${esc(ME.name)}</div><div class="row-sub">${ROLE_LABEL[ROLE]}${ADMIN ? " · System admin" : ""} · SahiReach LLP</div></div></div><div class="row-sub" style="margin-top:12px">${esc(ROLE_WHAT[ROLE])}${ADMIN ? " As system admin you can also undo anything in the Activity log." : ""}</div><div id="pw-box" style="margin-top:14px">${pwBoxHtml(false)}</div></div>
    <div style="margin-top:22px"><div class="group-label"><span>Team</span>${owner ? `<span>change a role or remove access</span>` : ""}</div><div class="group" id="team-list"><div class="row"><span class="row-sub">Loading…</span></div></div></div>
    ${owner ? `<div style="margin-top:22px"><div class="group-label"><span>Invite a teammate</span></div><div class="card card-pad" id="invite-box">${inviteBoxHtml()}</div></div>` : ""}`,
    `<button class="btn btn-secondary" data-act="signOut">${ic("logout", "sm")} Sign out</button>`);
  loadTeam();
};
/* change your own password while signed in (a forgotten one is reset from the sign-in page) */
function pwBoxHtml(open) {
  if (!HOST || !HOST.changePassword) return "";
  if (!open) return `<button class="btn btn-secondary btn-sm" data-act="pwOpen">${ic("lock", "sm")} Change password</button>`;
  return `<div class="form-grid"><div class="field"><label class="label" for="pw-new">New password</label><input class="input" id="pw-new" type="password" autocomplete="new-password" minlength="8" maxlength="72"><div class="row-sub" style="margin-top:4px">At least 8 characters.</div></div><div class="field"><label class="label" for="pw-new2">Type it again</label><input class="input" id="pw-new2" type="password" autocomplete="new-password" maxlength="72"></div></div>
    <div id="pw-msg"></div><div class="hstack gap-8" style="margin-top:12px"><button class="btn btn-secondary btn-sm" data-act="pwCancel">Cancel</button><button class="btn btn-primary btn-sm" data-act="pwSave">Save new password</button></div>`;
}
ACT.pwOpen = () => { part("pw-box", pwBoxHtml(true)); const i = $("#pw-new"); if (i) i.focus(); };
ACT.pwCancel = () => part("pw-box", pwBoxHtml(false));
ACT.pwSave = (el) => {
  const a = ($("#pw-new") || {}).value || "", b = ($("#pw-new2") || {}).value || "", msg = (t) => part("pw-msg", `<div class="banner bad" style="margin-top:12px">${ic("alert", "sm")}<span>${esc(t)}</span></div>`);
  if (a.length < 8) return msg("Choose a password with at least 8 characters.");
  if (a !== b) return msg("The two passwords are not the same.");
  el.disabled = true;
  HOST.changePassword(a).then(() => { part("pw-box", `<div class="banner good">${ic("check", "sm")}<span>Password changed. Use the new one next time you sign in.</span></div>`); toast("Password changed", "check"); })
    .catch((e) => { el.disabled = false; msg(e && e.code === "same_password" ? "That is your current password. Choose a different one." : e && e.code === "weak_password" ? "That password is too easy to guess. Choose a longer one." : (e && e.message) || "Could not change the password."); });
};
function inviteBoxHtml() {
  const r = S.inviteRole || "staff";
  return `<div class="row-sub" style="margin-bottom:8px">What can they do?</div><div class="chips" style="margin:0 0 6px">${["staff", "viewer", "accountant", "owner"].map((x) => `<button class="chip" data-act="inviteRole" data-r="${x}" aria-pressed="${r === x}">${ROLE_LABEL[x]}</button>`).join("")}</div>
    <div class="row-sub" style="margin-bottom:14px">${esc(ROLE_WHAT[r])}</div>
    <button class="btn btn-primary" data-act="inviteStaff">${ic("plus", "sm")} Create a setup code for ${ROLE_LABEL[r].toLowerCase()}</button>
    <div class="row-sub" style="margin-top:8px">Your teammate opens sahireach.com/staff-login, chooses “Set up your account” and enters the code. You can change their role later.</div>`;
}
ACT.inviteRole = (el) => { S.inviteRole = el.dataset.r; part("invite-box", inviteBoxHtml()); };
function loadTeam() {
  const owner = ROLE === "owner", get = owner && HOST.teamFull ? HOST.teamFull() : HOST.team();
  get.then((rows) => {
    S.team = rows || [];
    part("team-list", S.team.map((r) => owner ? teamRowHtml(r) : `<div class="row"><span class="avatar soft">${esc(initials(r.name).slice(0, 1) || "S")}</span><span class="grow"><div class="row-title">${esc(r.name)}</div></span><span class="row-sub">${ROLE_LABEL[r.role] || "Staff"}</span></div>`).join("") || `<div class="row"><span class="row-sub">Just you so far.</span></div>`);
  }).catch(() => part("team-list", `<div class="row"><span class="row-sub">Could not load the team. Check your connection.</span></div>`));
}
function teamRowHtml(r) {
  const seen = r.last_sign_in ? "last signed in " + fmtDate(String(r.last_sign_in).slice(0, 10)) : "has not signed in yet";
  return `<div class="row" style="flex-wrap:wrap;gap:10px${r.active ? "" : ";opacity:.6"}"><span class="avatar soft">${esc(initials(r.name).slice(0, 1) || "S")}</span><span class="grow" style="min-width:160px"><div class="row-title clip">${esc(r.name)}${r.me ? ` <span class="pill plain" style="height:20px;font-size:11px">You</span>` : ""}</div><div class="row-sub clip">${r.email ? esc(r.email) + " · " : ""}${r.active ? seen : "no access"}</div></span>
    ${r.me ? `<span class="row-sub">${ROLE_LABEL[r.role]}</span>` : r.active ? `<select class="select sm" style="width:auto" data-in="teamRole" data-id="${esc(r.id)}" aria-label="Role for ${esc(r.name)}">${["owner", "staff", "viewer", "accountant"].map((x) => `<option value="${x}" ${r.role === x ? "selected" : ""}>${ROLE_LABEL[x]}</option>`).join("")}</select>${r.email && HOST.sendReset ? `<button class="btn btn-sm btn-secondary" data-act="teamReset" data-email="${esc(r.email)}" title="Email ${esc(r.name)} a link to choose a new password">Send reset link</button>` : ""}<button class="btn btn-sm btn-secondary" data-act="teamAccess" data-id="${esc(r.id)}" data-on="0">Remove access</button>` : `<span class="row-sub">${ROLE_LABEL[r.role]}</span><button class="btn btn-sm btn-secondary" data-act="teamAccess" data-id="${esc(r.id)}" data-on="1">Give access back</button>`}</div>`;
}
const teamName = (id) => ((S.team || []).find((x) => x.id === id) || {}).name || "They";
IN.teamRole = (el) => {
  const id = el.dataset.id, role = el.value; el.disabled = true;
  HOST.setRole(id, role).then(() => { toast(`${teamName(id)} is now ${ROLE_LABEL[role].toLowerCase()}. It applies the next time they open the tool`, "check"); loadTeam(); })
    .catch((e) => { el.disabled = false; toast((e && e.message) || "Could not change the role", "alert"); loadTeam(); });
};
ACT.teamAccess = (el) => {
  const id = el.dataset.id, on = el.dataset.on === "1";
  if (!on && el.dataset.sure !== "1") { el.dataset.sure = "1"; el.textContent = "Tap again to remove"; el.classList.add("btn-danger"); setTimeout(() => { if (el.isConnected && el.dataset.sure === "1") { el.dataset.sure = ""; el.textContent = "Remove access"; el.classList.remove("btn-danger"); } }, 4000); return; }
  el.disabled = true;
  HOST.setActive(id, on).then(() => { toast(on ? `${teamName(id)} has access again` : `${teamName(id)} can no longer sign in`, on ? "check" : "info"); loadTeam(); })
    .catch((e) => { el.disabled = false; toast((e && e.message) || "Could not change access", "alert"); });
};
ACT.teamReset = (el) => {
  el.disabled = true; const was = el.textContent; el.textContent = "Sending…";
  HOST.sendReset(el.dataset.email).then((r) => { el.textContent = "Link sent"; toast((r && r.message) || "Reset link sent", "check"); })
    .catch((e) => { el.disabled = false; el.textContent = was; toast((e && e.message) || "Could not send the link", "alert"); });
};
ACT.inviteStaff = (el) => {
  const role = S.inviteRole || "staff"; el.disabled = true;
  HOST.invite(role).then((code) => part("invite-box", `<div class="row-sub">Setup code for ${ROLE_LABEL[role].toLowerCase()} · works once · expires in 7 days</div><div class="mono" id="invite-code" style="font-size:21px;font-weight:650;letter-spacing:0.04em;margin:6px 0 12px;color:var(--ink)">${esc(code)}</div><div class="hstack gap-8 wrap"><button class="btn btn-primary btn-sm" data-act="copyInvite" data-code="${esc(code)}">${ic("copy", "sm")} Copy invite message</button><button class="btn btn-secondary btn-sm" data-act="inviteRole" data-r="${role}">Make another code</button></div>`))
    .catch((e) => { el.disabled = false; toast((e && e.message) || "Could not create a code", "alert"); });
};
ACT.copyInvite = (el) => copyText(`Set up your SahiReach staff login:\n1. Open https://sahireach.com/staff-login\n2. Choose "Set up your account"\n3. Enter this setup code: ${el.dataset.code}\nThe code works once and expires in 7 days.`, "Invite copied");
ACT.signOut = () => { if (HOST) HOST.signOut(); };

/* ===== COMMAND PALETTE ===== */
let cmdItems = [], cmdSel = 0;
function cmdResults(q) {
  const k = key(q), out = [];
  const screens = [["new-order", "New order", "plus"], ["home", "Home", "home"], ["orders", "Orders", "orders"], ["dispatch", "Dispatch", "truck"], ["quick", "Quick commerce", "bolt"], ["stock", "Stock", "box"], ["replenish", "Replenishment", "cycle"], ["tod", "TOD & notes", "rupee"], ["logistics", "Logistics", "truck"], ["accounts", "Accounts", "book"], ["setup", "Setup", "gear"]].filter((x) => ROUTES[x[0]] && (CAN_EDIT || x[0] !== "new-order"));
  screens.filter((s) => !k || key(s[1]).includes(k)).forEach((s) => out.push({ sec: "Go to", icon: s[2], label: s[1], run: () => { if (s[0] === "new-order") ACT.newOrder(); else go(s[0]); } }));
  if (k) {
    D.distributors.filter((d) => key(d.name + " " + d.short).includes(k)).slice(0, 5).forEach((d) => out.push(!CAN_EDIT ? { sec: "Distributors", icon: "people", label: d.name, hint: d.district, run: () => ACT.distSheet({ dataset: { name: d.name } }) } : { sec: "Distributors", icon: "people", label: "New order for " + d.name, hint: d.district, run: () => ACT.orderFor({ dataset: { name: d.name } }) }));
    searchProducts(q, 5).forEach((x) => out.push({ sec: "Products", icon: "box", label: x.c.name, hint: x.crates == null ? "not stocked" : nf(x.crates, 1) + " crates", run: () => ACT.productSheet({ dataset: { sap: x.c.sap } }) }));
    D.orders.filter((o) => key(o.id + " " + o.dist).includes(k)).slice(-4).reverse().forEach((o) => out.push({ sec: "Orders", icon: "orders", label: o.dist + " · " + fmtDate(o.time), hint: o.status, run: () => showOrder(o.id) }));
  }
  return out;
}
function cmdListHtml() { let sec = ""; return cmdItems.length ? cmdItems.map((it, i) => `${it.sec !== sec ? ((sec = it.sec), `<div class="cmd-sec">${esc(it.sec)}</div>`) : ""}<button class="cmd-item" data-act="cmdRun" data-i="${i}" aria-selected="${i === cmdSel}">${ic(it.icon)}<span class="clip">${esc(it.label)}</span>${it.hint ? `<span class="k">${esc(it.hint)}</span>` : ""}</button>`).join("") : `<div class="empty">Nothing found.</div>`; }
ACT.cmd = () => {
  cmdItems = cmdResults(""); cmdSel = 0;
  $("#modal-root").innerHTML = `<div class="scrim on" style="z-index:50" data-act="cmdClose"></div><div class="modal" id="cmd" role="dialog" aria-label="Search"><div class="cmd-wrap">${ic("search")}<input class="cmd-input" id="cmd-q" placeholder="Search distributors, products, orders or screens" autocomplete="off" data-in="cmdQ"></div><div class="cmd-list" id="cmd-list">${cmdListHtml()}</div></div>`;
  requestAnimationFrame(() => { $("#cmd").classList.add("on"); $("#cmd-q").focus(); });
};
function closeCmd() { $("#modal-root").innerHTML = ""; }
ACT.cmdClose = closeCmd;
IN.cmdQ = (el) => { cmdItems = cmdResults(el.value); cmdSel = 0; part("cmd-list", cmdListHtml()); };
ACT.cmdRun = (el) => { const it = cmdItems[+el.dataset.i]; closeCmd(); if (it) it.run(); };

/* ===== boot ===== */
function afterRender() { bindCharts(); }
/* viewers: looking, searching, filtering and downloading work; anything that would change data is greyed out and refused */
/* an action that finishes later (sending an email, reading a file) saves what it changed when it finishes */
const afterAsync = (r) => { if (r && typeof r.then === "function") r.then(() => setTimeout(() => typeof queueSave === "function" && queueSave(), 0), () => {}); return r; };
const VIEW_ACTS = new Set("purF purExcel purOpen hpoPdf itemExcel reconSheet reconExcel rcShowAll stkPool stkAsOn stkMonthDl stockFull noteOpen ssCmp salesShare ssCopy ssDownload ssShare actWho actMore qcLockOpen soPrint xferSheet stockExcel account pwOpen pwCancel pwSave backInStock bisPreview chartMode closeSheet cmd cmdClose cmdRun copyPO copyPick dashReset distSheet drill lineInfo logiExcel logiF mailPick nav nav2 orderSheet pendingBackSheet pickExcel poSheet priceNudge productSheet purchaseSheet qcPOSheet qcPickCopy qcPickExcel reloadLatest replExcel replFilter replToggle saveRetry seeAll seeExcel seg signOut slowDays slowExcel slowList slowSheet soPreview stockCat stockLow toggleOwn whyDist whyProd".split(" "));
const VIEW_INS = new Set("stkDate stkMonth ssMonth actQ specialQ cmdQ dashF distQ ordersQ seeQ setupQ stockQ logiTr".split(" "));
/* the books: anyone who sees them can look (acv…); owners and the accountant can enter (ace…); staff and owners can also record invoice numbers at dispatch */
const acOK = (n) => /^acv/.test(n || "") || (ROLE === "accountant" && /^ace/.test(n || ""));
const viewOK = (el) => CAN_EDIT || (el.dataset.act ? VIEW_ACTS.has(el.dataset.act) || acOK(el.dataset.act) : VIEW_INS.has(el.dataset.in) || acOK(el.dataset.in));
function viewOnlyMark(root) {
  if (CAN_EDIT || !root || !root.querySelectorAll) return;
  const els = [...root.querySelectorAll("[data-act],[data-in],form input,form select,form textarea")]; if (root.matches && root.matches("[data-act],[data-in]")) els.push(root);
  els.forEach((el) => {
    if (el.dataset.act || el.dataset.in ? viewOK(el) : false) return;
    if (/^(BUTTON|INPUT|SELECT|TEXTAREA)$/.test(el.tagName) && !(el.closest(".search") && el.dataset.in && VIEW_INS.has(el.dataset.in))) { el.disabled = true; el.classList.add("vo-off"); el.title = "View only"; }
  });
}
if (!CAN_EDIT) {
  const st = document.createElement("style"); st.textContent = ".vo-off{opacity:.4!important;cursor:not-allowed!important}"; document.head.appendChild(st);
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1) viewOnlyMark(n); }))).observe(document.body, { childList: true, subtree: true });
}
document.addEventListener("click", (e) => { const el = e.target.closest("[data-act]"); if (!el) return; if (!viewOK(el)) { e.preventDefault(); toast(ROLE === "accountant" ? "The accountant login changes only the books (Accounts)" : "View only: you can look, but not change anything", "info"); return; } const fn = ACT[el.dataset.act]; if (fn) afterAsync(fn(el, e)); });
document.addEventListener("input", (e) => { const el = e.target.closest("[data-in]"); if (!el) return; if (!viewOK(el)) return; const fn = IN[el.dataset.in]; if (fn) afterAsync(fn(el, e)); });
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); if ($("#cmd")) closeCmd(); else ACT.cmd(); return; }
  if ($("#cmd")) {
    if (e.key === "Escape") closeCmd();
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); cmdSel = Math.max(0, Math.min(cmdItems.length - 1, cmdSel + (e.key === "ArrowDown" ? 1 : -1))); part("cmd-list", cmdListHtml()); const s = $('#cmd-list [aria-selected="true"]'); if (s) s.scrollIntoView({ block: "nearest" }); }
    else if (e.key === "Enter") { e.preventDefault(); const it = cmdItems[cmdSel]; closeCmd(); if (it) it.run(); }
    return;
  }
  if (e.key === "Escape") closeSheet();
  if ((e.key === " " || e.key === "Enter") && e.target.matches && e.target.matches('[role="checkbox"][data-act]')) { e.preventDefault(); e.target.click(); }
});
window.addEventListener("hashchange", () => { const r = location.hash.slice(1); if (r && r !== S.route && ROUTES[r]) go(r); });

/* ===== EDITING MASTERS: distributors, products and prices, quick commerce and company details ===== */
const CAN_PRICE = ROLE === "owner";
/* the first piece of a comma/semicolon/new-line separated list that is not an email address, or "" */
const badEmail = (raw) => (String(raw || "").split(/[,;\n]+/).map((t) => t.trim()).filter(Boolean).find((t) => emails(t).length !== 1) || "");
const numOrNull = (v) => (v === "" || v == null || isNaN(+v) ? null : +v);
const r4 = (v) => (v == null ? null : Math.round(v * 10000) / 10000);
function fld(id, label, value, opts = {}) {
  const attrs = `id="${id}" ${opts.disabled ? "disabled" : ""} ${opts.required ? "required" : ""}`;
  let input;
  if (opts.options) input = `<select class="select" ${attrs}>${opts.options.map((o) => { const v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o; return `<option value="${esc(v)}" ${String(v) === String(value == null ? "" : value) ? "selected" : ""}>${esc(l)}</option>`; }).join("")}</select>`;
  else input = `<input class="input" ${attrs} type="${opts.type || "text"}" ${opts.type === "number" ? `inputmode="decimal" step="${opts.step || "any"}" min="0"` : ""} ${opts.list ? `list="${id}-list"` : ""} value="${esc(value == null ? "" : value)}" placeholder="${esc(opts.ph || "")}" autocomplete="off">${opts.list ? `<datalist id="${id}-list">${opts.list.map((o) => `<option value="${esc(o)}">`).join("")}</datalist>` : ""}`;
  return `<div class="field ${opts.full ? "full" : ""}"><label class="label" for="${id}">${esc(label)}</label>${input}${opts.hint ? `<div class="row-sub" style="margin-top:5px">${esc(opts.hint)}</div>` : ""}</div>`;
}
const val = (id) => { const el = $("#" + id); return el ? el.value.trim() : ""; };
const formErr = (msg) => { part("form-err", msg ? `<div class="banner bad">${ic("alert", "sm")}<span>${esc(msg)}</span></div>` : ""); if (msg) { const e = $("#form-err"); if (e) e.scrollIntoView({ block: "nearest" }); } return false; };

/* ---------- distributors ---------- */
function rebuildDistIndex() { Object.keys(distByKey).forEach((k) => delete distByKey[k]); D.distributors.forEach((d) => { distByKey[key(d.name)] = d; }); }
function renameDistributor(oldName, newName) {
  const ren = (x, f) => { if (x && x[f] === oldName) x[f] = newName; };
  D.orders.forEach((o) => ren(o, "dist")); D.oos.forEach((o) => ren(o, "dist")); D.tod.lines.forEach((o) => ren(o, "dist")); D.tod.byDist.forEach((o) => ren(o, "name"));
  (D.salesBefore || []).forEach((r) => ren(r, "dist")); D.notes.forEach((n) => ren(n, "party"));
  if (S.draft && S.draft.dist === oldName) S.draft.dist = newName;
}
ACT.distEdit = (el) => {
  const d = el && el.dataset.name ? distByKey[key(el.dataset.name)] : null, isNew = !d, x = d || {};
  const districts = [...new Set(D.distributors.map((y) => y.district).filter(Boolean))].sort();
  openSheet(isNew ? "Add distributor" : "Edit distributor", `<div id="form-err"></div><div class="card card-pad"><div class="form-grid">
      ${fld("df-name", "Name, as on invoices", x.name, { full: true, required: true, ph: "e.g. ABC Distributors LLP" })}
      ${fld("df-short", "Short name for pick lists", x.short, { ph: "e.g. ABC" })}
      ${fld("df-phone", "Phone", x.phone, { type: "tel", ph: "10-digit mobile" })}
      ${fld("df-contact", "Contact person (for emails)", x.contact, { ph: "e.g. Rajesh" })}
      ${fld("df-email", "Email", x.email, { type: "email", ph: "orders@theirfirm.com" })}
      ${fld("df-cc", "Also copy (optional)", x.cc, { ph: "Other emails, separated by commas", full: true })}
      ${fld("df-gstin", "GSTIN", x.gstin, { ph: "e.g. 32ABCDE1234F1Z5" })}
      ${fld("df-state", "State", x.state || "32-Kerala")}
      ${fld("df-addr", "Billing address (on the sales order)", x.address, { full: true, ph: "Building, street, town, PIN" })}
      ${fld("df-ship", "Ship to (if different)", x.shipTo, { full: true, ph: "Leave empty to ship to the billing address" })}
      ${fld("df-district", "District", x.district, { list: districts, ph: "e.g. Ernakulam" })}
      ${fld("df-uom", "Usually orders in", x.uom || "Crate", { options: [["Crate", "Crates"], ["EA (Box)", "Boxes"], ["Pieces", "Pieces"]] })}
      ${fld("df-pay", "Payment", x.pay || "", { options: [["", "Not set"], "Cheque", "Bank Transfer", "UPI", "Cash"] })}
      ${fld("df-credit", "Credit days", x.credit, { type: "number", step: "1" })}
      ${fld("df-deposit", "Security deposit (₹)", x.deposit, { type: "number", step: "1" })}
      ${fld("df-freezer", "Freezer", x.freezer || "", { options: [["", "Not set"], "Free Freezer", "Paid Freezer", "Own Freezer", "No Freezer"] })}
      ${fld("df-pricing", "Pricing", x.special ? "special" : "normal", { options: [["normal", "Normal South Kerala rate"], ["special", `Special prices (${Math.round(D.special.pct * 100)}% off, TOD tracked)`]], full: true })}
    </div></div>
    ${!isNew && !D.orders.some((o) => o.dist === x.name) && !(D.salesBefore || []).some((r) => r.dist === x.name) ? `<button class="btn-plain" style="color:var(--bad);font-weight:600;height:auto;margin-top:4px" data-act="distDelete" data-name="${esc(x.name)}">${ic("trash", "sm")} Remove this distributor</button>` : ""}`,
    `<button class="btn btn-secondary" data-act="${isNew ? "closeSheet" : "distSheet"}" data-name="${esc(x.name || "")}">Cancel</button><button class="btn btn-primary" data-act="distSave" data-name="${esc(x.name || "")}">${ic("check", "sm")} Save</button>`);
};
ACT.distSave = (el) => {
  const old = el.dataset.name ? distByKey[key(el.dataset.name)] : null, name = val("df-name").replace(/\s+/g, " ");
  if (!name) return formErr("Enter the distributor's name.");
  const clash = distByKey[key(name)]; if (clash && clash !== old) return formErr("A distributor with this name already exists.");
  const phone = val("df-phone").replace(/[^\d+]/g, ""); if (phone && phone.replace(/\D/g, "").length < 10) return formErr("The phone number looks too short.");
  const credit = numOrNull(val("df-credit")), deposit = numOrNull(val("df-deposit")), gstin = val("df-gstin").replace(/\s/g, "").toUpperCase();
  if (gstin && !/^\d{2}[A-Z0-9]{13}$/.test(gstin)) return formErr("The GSTIN should be 15 characters, starting with the 2-digit state code.");
  const email = val("df-email"), ccRaw = val("df-cc");
  if (email && badEmail(email)) return formErr(`“${badEmail(email)}” does not look like an email address.`);
  if (ccRaw && badEmail(ccRaw)) return formErr(`Copy emails: “${badEmail(ccRaw)}” does not look like an email address.`);
  const d = old || { updated: null };
  const before = old ? JSON.stringify(old) : "";
  if (old && old.name !== name) renameDistributor(old.name, name);
  Object.assign(d, { gstin: gstin || null, state: val("df-state") || null, address: val("df-addr") || null, shipTo: val("df-ship") || null });
  Object.assign(d, { name, short: val("df-short") || null, phone: phone || null, district: val("df-district") || null, uom: val("df-uom"), pay: val("df-pay") || null, credit: credit != null ? Math.round(credit) : null, deposit: deposit != null ? Math.round(deposit) : null, freezer: val("df-freezer") || null, special: val("df-pricing") === "special", contact: val("df-contact") || null, email: email ? emails(email)[0] : null, cc: ccRaw ? emails(ccRaw).join(", ") : null, updated: iso(NOW()) });
  d.pricing = d.special ? "Special prices" : "Normal";
  if (!old) D.distributors.push(d);
  rebuildDistIndex();
  if (old && before === JSON.stringify(d)) { ACT.distSheet({ dataset: { name } }); return; }
  logActivity(old ? "Distributor edited" : "Distributor added", name, old ? "Details updated" : `${d.district || "No district"} · ${d.special ? "special prices" : "normal rate"}`);
  render(); ACT.distSheet({ dataset: { name } }); toast(old ? "Distributor updated" : "Distributor added");
};
ACT.distDelete = (el) => {
  const d = distByKey[key(el.dataset.name)]; if (!d) return;
  if (!el.dataset.sure) { el.dataset.sure = "1"; el.innerHTML = `${ic("trash", "sm")} Tap again to remove ${esc(d.name)}`; return; }
  D.distributors.splice(D.distributors.indexOf(d), 1); rebuildDistIndex();
  logActivity("Distributor removed", d.name, "Had no orders"); closeSheet(); render(); toast("Distributor removed");
};

/* ---------- products and prices ---------- */
ACT.productEdit = (el) => {
  const sap = el && el.dataset.sap, isNew = !sap, c = (sap && catBySap[sap]) || {}, st = (sap && stockBySap[sap]) || null, p = (sap && D.prices[sap]) || [], qc = (sap && qcBySap[sap]) || null;
  const cats = [...new Set(D.catalog.map((x) => x.cat).filter(Boolean))].sort(), lock = !CAN_PRICE;
  const sp = sap ? D.special.prices[sap] : null;
  openSheet(isNew ? "Add product" : "Edit product", `<div id="form-err"></div>
    <div class="card card-pad"><div class="card-title" style="margin-bottom:12px">Product</div><div class="form-grid">
      ${fld("pf-name", "Name", c.name || (st && st.name), { full: true, required: true, ph: "e.g. Chocobar Max ( 20 x 50ml )" })}
      ${fld("pf-sap", "SAP code", sap, { disabled: !isNew, required: true, ph: "7 digits", hint: isNew ? "" : "The SAP code links the product to orders and cannot be changed." })}
      ${fld("pf-cat", "Category", c.cat || (st && st.cat), { list: cats })}
      ${fld("pf-upc", "Boxes per crate", c.upc || (st && st.upc), { type: "number", step: "1", required: true })}
      ${fld("pf-ppe", "Pieces per box", c.ppe || (st && st.ppe) || 1, { type: "number", step: "1" })}
      ${fld("pf-trop", "Tropicana code", st && st.trop, { ph: "e.g. SR 005" })}
      ${fld("pf-hsn", "HSN code", (st && st.hsn) || "21050000")}
    </div></div>
    <div class="card card-pad"><div class="card-title" style="margin-bottom:4px">Prices per box, excl. GST</div><div class="row-sub" style="margin-bottom:12px">${lock ? "Only the owner can change prices." : "From the Hangyo South Kerala price list. The distributor rate is what orders are billed at."}</div><div class="form-grid">
      ${fld("pf-dist", "Distributor rate (₹)", r4(p[1] != null ? p[1] : st && st.price), { type: "number", disabled: lock })}
      ${SEE_MONEY ? fld("pf-ss", "Hangyo price to you, SS rate (₹)", r4(p[0] != null ? p[0] : st && st.cost), { type: "number", disabled: lock, required: !lock }) : ""}
      ${fld("pf-dealer", "Retailer / dealer price (₹)", r4(p[2]), { type: "number", disabled: lock })}
      ${fld("pf-mrp", "MRP per box (₹)", p[3] != null ? p[3] : c.mrp, { type: "number", disabled: lock })}
      ${fld("pf-special", `Special price (₹)`, r4(sp), { type: "number", disabled: lock, hint: `For distributors on special prices. Leave empty to bill them the normal rate. ${Math.round(D.special.pct * 100)}% off would be ${p[1] ? rs2(p[1] * (1 - D.special.pct)) : "–"}.`, full: true })}
    </div></div>
    <div class="card card-pad"><div class="hstack between"><span><div class="card-title">We stock this product</div><div class="row-sub">Off means requests for it are logged as demand, not sold.</div></span><button class="toggle" role="switch" id="pf-stocked" aria-checked="${!!st}" data-act="pfToggle" aria-label="We stock this product"></button></div></div>
    <div class="card card-pad"><div class="hstack between"><span><div class="card-title">Sold on Swiggy / Zepto</div><div class="row-sub">Prices per piece, excl. GST, as on their POs.</div></span><button class="toggle" role="switch" id="pf-qc" aria-checked="${!!qc}" data-act="pfToggle" aria-label="Sold on quick commerce"></button></div>
      <div class="form-grid" id="pf-qc-fields" style="margin-top:14px" ${qc ? "" : "hidden"}>
        ${fld("pf-qc-ppc", "Pieces per crate (QC)", qc ? qc.ppc : (c.upc || 0) * (c.ppe || 1) || "", { type: "number", step: "1" })}
        ${fld("pf-qc-sw", "Swiggy price per piece (₹)", r4(qc && (qc.swPrice || qc.swiggy)), { type: "number", disabled: lock })}
        ${fld("pf-qc-zp", "Zepto price per piece (₹)", r4(qc && (qc.zpPrice || qc.zepto)), { type: "number", disabled: lock })}
        ${fld("pf-qc-swcode", "Swiggy item code", qc && qc.swCode)}
      </div></div>`,
    `<button class="btn btn-secondary" data-act="${isNew ? "closeSheet" : "productSheet"}" data-sap="${esc(sap || "")}">Cancel</button><button class="btn btn-primary" data-act="productSave" data-sap="${esc(sap || "")}">${ic("check", "sm")} Save</button>`, true);
};
ACT.pfToggle = (el) => { const on = el.getAttribute("aria-checked") !== "true"; el.setAttribute("aria-checked", on); if (el.id === "pf-qc") $("#pf-qc-fields").hidden = !on; };
ACT.productSave = (el) => {
  const isNew = !el.dataset.sap, sap = isNew ? val("pf-sap").replace(/\s/g, "") : el.dataset.sap, name = val("pf-name").replace(/\s+/g, " ");
  if (!name) return formErr("Enter the product name.");
  if (!/^\d{5,10}$/.test(sap)) return formErr("Enter the SAP code (numbers only).");
  if (isNew && (catBySap[sap] || stockBySap[sap])) return formErr("A product with this SAP code already exists. Search for it instead.");
  const upc = Math.round(+val("pf-upc")), ppe = Math.max(1, Math.round(+val("pf-ppe") || 1));
  if (!(upc > 0)) return formErr("Enter how many boxes go in one crate.");
  const dist = numOrNull(val("pf-dist")), ss = numOrNull(val("pf-ss")), dealer = numOrNull(val("pf-dealer")), mrp = numOrNull(val("pf-mrp")), special = numOrNull(val("pf-special"));
  if (CAN_PRICE && special != null && dist != null && special > dist) return formErr("The special price should not be higher than the distributor rate.");
  const stocked = $("#pf-stocked").getAttribute("aria-checked") === "true", onQC = $("#pf-qc").getAttribute("aria-checked") === "true";
  if (CAN_PRICE && stocked && !(ss > 0) && !stockBySap[sap]) return formErr("Enter Hangyo's price to you (the SS rate). It is needed for stock value and profit.");
  let c = catBySap[sap]; if (!c) { c = { sap, times: 0 }; D.catalog.push(c); catBySap[sap] = c; }
  const oldUpc = c.upc;
  Object.assign(c, { name, cat: val("pf-cat") || null, upc, ppe, mrp, stocked: stocked ? 1 : 0 });
  catByName[key(name)] = c;
  if (CAN_PRICE) {
    const p = (D.prices[sap] = D.prices[sap] || [null, null, null, null, null]);
    p[0] = ss; p[1] = dist; p[2] = dealer; p[3] = mrp; p[4] = mrp != null && ppe ? Math.round((mrp / ppe) * 100) / 100 : p[4];
    if (special != null) D.special.prices[sap] = special; else delete D.special.prices[sap];
  }
  let st = stockBySap[sap];
  if (stocked && !st) { st = { trop: null, name, sap, cat: c.cat, hsn: null, upc, ppe, ea: 0, crates: 0, pcs: 0, mrp, cost: ss, price: dist, margin: null, inSK: D.prices[sap] ? "Yes" : "No", updated: iso(NOW()), move: "Added in Setup", notes: null, tier: null }; D.stock.push(st); stockBySap[sap] = st; }
  if (!stocked && st && st.ea > 0) return formErr(`There are still ${nf(st.ea / st.upc, 2)} crates in stock. Sell or adjust them before switching this off.`);
  if (!stocked && st) { D.stock.splice(D.stock.indexOf(st), 1); delete stockBySap[sap]; st = null; }
  if (st) {
    Object.assign(st, { name, cat: c.cat, upc, ppe, trop: val("pf-trop") || null, hsn: val("pf-hsn") || null, mrp: mrp != null ? mrp : st.mrp });
    if (CAN_PRICE) Object.assign(st, { cost: ss, price: dist, margin: dist != null && ss != null ? Math.round((dist - ss) * 100) / 100 : null });
    st.crates = st.ea / upc; st.pcs = st.ea * ppe;
    if (oldUpc && oldUpc !== upc) st.move = `Boxes per crate changed ${oldUpc} → ${upc} in Setup`;
  }
  const r = replBySap[sap]; if (r) Object.assign(r, { name, upc });
  let q = qcBySap[sap];
  if (onQC) {
    const ppc = Math.round(+val("pf-qc-ppc")); if (!(ppc > 0)) return formErr("Enter how many pieces go in one crate for Swiggy / Zepto.");
    if (!q) { q = { sap, trop: st ? st.trop : null, name, upc, ppe, cat: c.cat, mrp, crates: 0, ea: 0, ppc, updated: iso(NOW()), move: "Added in Setup", notes: null }; D.qcStock.push(q); qcBySap[sap] = q; }
    Object.assign(q, { name, ppc, upc, ppe, swCode: val("pf-qc-swcode") || null });
    if (CAN_PRICE) { q.swPrice = numOrNull(val("pf-qc-sw")); q.zpPrice = numOrNull(val("pf-qc-zp")); q.swiggy = q.swPrice; q.zepto = q.zpPrice; }
  } else if (q && !(q.crates > 0)) { D.qcStock.splice(D.qcStock.indexOf(q), 1); delete qcBySap[sap]; }
  logActivity(isNew ? "Product added" : "Product edited", sap, name + (CAN_PRICE && dist != null ? ` · distributor rate ${rs2(dist)}` : ""));
  render(); ACT.productSheet({ dataset: { sap } }); toast(isNew ? "Product added" : "Product updated");
};

/* ---------- company and quick commerce settings ---------- */
function settingsHtml() {
  const C = D.company || (D.company = {}), Q = D.qcPick;
  return `<div class="grid-2" style="align-items:start"><div class="card card-pad"><div class="card-title">Company details</div><div class="row-sub" style="margin:4px 0 14px">Printed on every sales order.</div><div class="form-grid">
      ${fld("cf-name", "Company name", C.name, { full: true })}${fld("cf-address", "Address", C.address, { full: true })}
      ${fld("cf-gstin", "GSTIN", C.gstin)}${fld("cf-fssai", "FSSAI licence", C.fssai)}
      ${fld("cf-phone", "Phone", C.phone)}${fld("cf-email", "Email", C.email)}${fld("cf-state", "State", C.state || "32-Kerala")}
    </div><button class="btn btn-primary" style="margin-top:16px" data-act="companySave" ${CAN_PRICE ? "" : "disabled"}>${ic("check", "sm")} Save company details</button></div>
    <div class="card card-pad"><div class="card-title">Tropicana, Swiggy and Zepto</div><div class="row-sub" style="margin:4px 0 14px">Where pick lists and deliveries go, and the smallest delivery worth sending.</div><div class="form-grid">
      ${fld("qf-swto", "Swiggy delivery point", Q.swiggyTo, { full: true })}${fld("qf-swmin", "Swiggy minimum per delivery (₹)", Q.minSwiggy, { type: "number", step: "1" })}
      ${fld("qf-trop", "Tropicana Logistics email(s) for pick lists", Q.tropEmail, { full: true, ph: "Separate several with commas" })}
      ${fld("qf-copy", "Send me a copy of every email", Q.copyTo, { full: true, ph: "Your email (optional)" })}
      ${fld("qf-zpto", "Zepto delivery point", Q.zeptoTo, { full: true })}${fld("qf-zpmin", "Zepto minimum per delivery (₹)", Q.minZepto, { type: "number", step: "1" })}
      <div class="field full"><div class="row" style="padding:10px 12px;border-radius:12px;background:var(--fill)"><span class="grow"><div class="row-title">Fill short order lines from quick commerce stock</div><div class="row-sub">When SahiReach stock is short, distributor orders take the rest from Swiggy / Zepto stock without asking. Each line can still say no.</div></span><button class="toggle" role="switch" aria-checked="${!!Q.autoQC}" data-act="autoQCToggle" aria-label="Fill short order lines from quick commerce stock"></button></div></div>
      ${fld("qf-pct", "Special price discount (%)", Math.round(D.special.pct * 1000) / 10, { type: "number", hint: "Used to suggest special prices for new products.", disabled: !CAN_PRICE })}
    </div><button class="btn btn-primary" style="margin-top:16px" data-act="qcSettingsSave">${ic("check", "sm")} Save</button></div></div>`;
}
ACT.companySave = () => {
  if (!CAN_PRICE) return;
  const C = D.company || (D.company = {});
  Object.assign(C, { name: val("cf-name") || "SahiReach LLP", address: val("cf-address"), gstin: val("cf-gstin").toUpperCase(), fssai: val("cf-fssai"), phone: val("cf-phone"), email: val("cf-email"), state: val("cf-state") || "32-Kerala" });
  Object.assign(CO, C); logActivity("Company details edited", "", C.name); toast("Company details saved");
};
ACT.qcSettingsSave = () => {
  const Q = D.qcPick;
  Q.swiggyTo = val("qf-swto") || Q.swiggyTo; Q.zeptoTo = val("qf-zpto") || Q.zeptoTo;
  const te = val("qf-trop"), cp = val("qf-copy");
  if (te && badEmail(te)) { toast(`Tropicana emails: “${badEmail(te)}” does not look like an email address`, "alert"); return; }
  if (cp && badEmail(cp)) { toast(`Copy emails: “${badEmail(cp)}” does not look like an email address`, "alert"); return; }
  Q.tropEmail = te ? emails(te).join(", ") : null; Q.copyTo = cp ? emails(cp).join(", ") : null;
  Q.minSwiggy = Math.max(0, Math.round(+val("qf-swmin") || 0)); Q.minZepto = Math.max(0, Math.round(+val("qf-zpmin") || 0));
  if (CAN_PRICE) { const pc = +val("qf-pct"); if (pc >= 0 && pc < 100) D.special.pct = pc / 100; }
  logActivity("Quick commerce settings edited", "", `Swiggy minimum ${rs(Q.minSwiggy)}, Zepto minimum ${rs(Q.minZepto)}`); toast("Settings saved");
};

/* ===== EMAIL: short, branded emails to distributors and Tropicana, sent only when you press Send =====
   Built here as email-safe HTML (tables, inline styles), sent by the send-email function through Resend. */
const SITE = "https://sahireach.com";
const EM = { teal: "#0b7a70", ink: "#1d2939", ink2: "#475467", ink3: "#98a2b3", line: "#eaecf0", bg: "#f2f4f7", soft: "#eef7f6", warn: "#b54708", warnBg: "#fff6ed" };
const escE = (s) => esc(s);
const moneyE = (n) => "₹" + new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
const dateLong = (s) => { const d = toDate(s); return d.getDate() + " " + MONTH_LONG[d.getMonth()] + " " + d.getFullYear(); };
function greetName(d) { return (d && (d.contact || d.short || d.name)) || "there"; }
function emailShell({ preheader, heading, paras, blocks, signoff }) {
  const C = CO, foot = [C.address, C.gstin ? "GSTIN " + C.gstin : "", C.fssai ? "FSSAI " + C.fssai : ""].filter(Boolean).join(" · ");
  const contact = [C.phone, C.email || "hello@sahireach.com"].filter(Boolean).join(" · ");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escE(heading)}</title></head>
<body style="margin:0;padding:0;background:${EM.bg};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escE(preheader || "")}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${EM.bg}"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${EM.line}">
<tr><td style="background:${EM.soft};padding:22px 32px;border-bottom:1px solid ${EM.line}"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:middle"><img src="${SITE}/logo.png" width="40" height="40" alt="SahiReach" style="display:block;border:0;border-radius:8px"></td><td style="vertical-align:middle;padding-left:12px;font:700 19px/1 -apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${EM.ink};letter-spacing:-0.2px">Sahi<span style="color:${EM.teal}">Reach</span></td></tr></table></td></tr>
<tr><td style="padding:30px 32px 8px;font:400 15px/1.6 -apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${EM.ink2}">
<h1 style="margin:0 0 14px;font:700 22px/1.3 -apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${EM.ink};letter-spacing:-0.3px">${escE(heading)}</h1>
${(paras || []).map((p) => `<p style="margin:0 0 14px">${p}</p>`).join("")}
${(blocks || []).join("")}
<p style="margin:22px 0 4px">${signoff || "Warm regards,"}</p><p style="margin:0 0 24px;font-weight:700;color:${EM.ink}">Team SahiReach</p>
</td></tr>
<tr><td style="padding:18px 32px 24px;border-top:1px solid ${EM.line};font:400 12px/1.6 -apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${EM.ink3}">
<b style="color:${EM.ink2}">${escE(C.name || "SahiReach LLP")}</b> · Super stockist for Hangyo Ice Creams, South Kerala<br>${escE(foot)}<br>${escE(contact)} · <a href="${SITE}" style="color:${EM.teal};text-decoration:none">sahireach.com</a><br>Reply to this email to reach us.</td></tr>
</table></td></tr></table></body></html>`;
}
const factsE = (rows) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 18px;background:${EM.soft};border-radius:12px"><tr>${rows.map(([k, v]) => `<td style="padding:14px 16px;vertical-align:top"><div style="font:600 11px/1.4 -apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${EM.ink3};text-transform:uppercase;letter-spacing:0.6px">${escE(k)}</div><div style="font:700 16px/1.4 -apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${EM.ink};margin-top:2px">${v}</div></td>`).join("")}</tr></table>`;
const tableE = (head, rows, foot) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 16px;border-collapse:collapse;font:400 13.5px/1.45 -apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<tr>${head.map((h, i) => `<th align="${i ? "right" : "left"}" style="padding:8px 6px;border-bottom:2px solid ${EM.ink};font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:${EM.ink3}">${escE(h)}</th>`).join("")}</tr>
${rows.map((r) => `<tr>${r.map((c, i) => `<td align="${i ? "right" : "left"}" style="padding:8px 6px;border-bottom:1px solid ${EM.line};color:${i ? EM.ink : EM.ink};${i ? "white-space:nowrap" : ""}">${c}</td>`).join("")}</tr>`).join("")}
${foot ? `<tr>${foot.map((c, i) => `<td align="${i ? "right" : "left"}" style="padding:10px 6px;font-weight:700;color:${EM.ink}">${c}</td>`).join("")}</tr>` : ""}</table>`;
const noteE = (html, warn) => `<div style="margin:0 0 16px;padding:12px 14px;border-radius:10px;background:${warn ? EM.warnBg : EM.soft};color:${warn ? EM.warn : EM.ink2};font-size:14px;line-height:1.5">${html}</div>`;
const textOf = (lines) => lines.filter((x) => x != null).join("\n");

/* ---------- 1. sales order ---------- */
function soEmail(o) {
  const d = distByKey[key(o.dist)] || {}, lines = linesByOrder[o.id] || [], so = o.id.replace("ORD", "SO"), missed = D.oos.filter((x) => x.id === o.id);
  const disp = o.status === "Dispatched" && o.dispatched ? o.dispatched : null;
  const due = d.credit != null ? addDays((disp || o.time).slice(0, 10), d.credit) : null, gst = Math.round(o.value * 5) / 100, total = o.value + gst, upd = (o.timesEdited || 0) > 0;
  const html = emailShell({
    preheader: `${so} · ${nf(o.crates, 2)} crates · ${moneyE(total)} incl. GST`,
    heading: upd ? "Your sales order has been updated" : "Thank you for your order",
    paras: [`Hi ${escE(greetName(d))},`, upd ? `Here is the updated sales order for your order of ${dateLong(o.time)}.` : `We have your order of ${dateLong(o.time)} and it is being prepared. Here is your sales order.`],
    blocks: [
      factsE([["Sales order", escE(so)], ["Order date", escE(fmtDate(o.time))], disp ? ["Dispatched", escE(fmtDate(disp))] : ["Crates", nf(o.crates, 2)], ["Total incl. GST", moneyE(total)]]),
      tableE(["Product", "Crates", "Boxes", "Rate / box", "Amount"], lines.map((l) => [escE(l.product), nf(l.crates, 2), nf(l.ea), moneyE(l.billed), moneyE(l.value)]), ["Value excl. GST", "", "", "", moneyE(o.value)]),
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:-8px 0 16px;font:400 13.5px/1.6 -apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${EM.ink2}"><tr><td align="right">GST 5%: ${moneyE(gst)}<br><b style="color:${EM.ink};font-size:15px">Total: ${moneyE(total)}</b>${due ? `<br>Payment${d.pay ? " by " + escE(d.pay.toLowerCase()) : ""} due ${dateLong(due)}` : ""}</td></tr></table>`,
      missed.length ? noteE(`<b>Not available this time:</b> ${missed.map((m) => escE(shortName(m.product))).join(", ")}. We will email you as soon as ${missed.length > 1 ? "they are" : "it is"} back in stock.`, true) : "",
      noteE(disp ? `Dispatched from Tropicana Logistics on ${dateLong(disp)}. Anything not right? Just reply to this email.` : "We will let you know when it leaves our warehouse. Anything to change? Just reply to this email."),
    ],
  });
  const text = textOf([`Hi ${greetName(d)},`, "", upd ? `Updated sales order ${so} for your order of ${dateLong(o.time)}.` : `Thank you for your order of ${dateLong(o.time)}. Sales order ${so}:`, "", ...lines.map((l) => `- ${l.product}: ${nf(l.crates, 2)} crates (${nf(l.ea)} boxes) x ${moneyE(l.billed)} = ${moneyE(l.value)}`), "", `Value excl. GST ${moneyE(o.value)} · GST ${moneyE(gst)} · Total ${moneyE(total)}`, due ? `Payment due ${dateLong(due)}` : null, missed.length ? `Not available this time: ${missed.map((m) => shortName(m.product)).join(", ")}. We will email you when back in stock.` : null, "", "Team SahiReach"]);
  return { kind: "sales_order", ref: o.id, to: emails(d.email), cc: emails(d.cc), subject: `${upd ? "Updated sales order" : "Sales order"} ${so} · ${nf(o.crates, 2)} crates · ${moneyE(total)}`, html, text, who: d.name, d };
}
/* ---------- 2. dispatch ---------- */
function dispatchEmail(o) {
  const d = distByKey[key(o.dist)] || {}, lines = linesByOrder[o.id] || [], so = o.id.replace("ORD", "SO"), total = o.value * 1.05, due = d.credit != null ? addDays((o.dispatched || o.time).slice(0, 10), d.credit) : null;
  const html = emailShell({
    preheader: `${nf(o.crates, 2)} crates left our warehouse today`,
    heading: "Your order is on its way",
    paras: [`Hi ${escE(greetName(d))},`, `Your order ${escE(so)} left Tropicana Logistics on ${dateLong(o.dispatched || NOW())}${o.dispatched ? " at " + fmtTime(o.dispatched) : ""}.`],
    blocks: [factsE([["Dispatched", escE(fmtDate(o.dispatched || iso(NOW())))], ["Crates", nf(o.crates, 2)], ["Invoice value", moneyE(total)]]), due ? noteE(`Payment${d.pay ? " by " + escE(d.pay.toLowerCase()) : ""} is due on <b>${dateLong(due)}</b>.`) : "", noteE("Please check the crates when they arrive and reply to this email if anything is short or damaged.")],
  });
  return { kind: "dispatch", ref: o.id, to: emails(d.email), cc: emails(d.cc), subject: `On its way: ${so} · ${nf(o.crates, 2)} crates`, html, text: textOf([`Hi ${greetName(d)},`, "", `Your order ${so} (${nf(o.crates, 2)} crates, ${moneyE(total)}) left Tropicana Logistics on ${dateLong(o.dispatched || NOW())}.`, due ? `Payment due ${dateLong(due)}.` : null, "Reply to this email if anything is short or damaged.", "", "Team SahiReach"]), who: d.name, d };
}
/* ---------- 3. back in stock ---------- */
function backInStock() {
  const since = addDays(ymd(NOW()), -30), out = {};
  D.oos.forEach((o) => {
    if ((o.time || "").slice(0, 10) < since || o.notified) return;
    const ord = orderById(o.id); if (ord && ord.status === "Pending") return; /* still pending: refresh the order instead */
    const st = stockBySap[o.sap]; if (!st || !st.upc || st.ea / st.upc < 1) return;
    const d = distByKey[key(o.dist)]; if (!d) return;
    const reordered = D.orders.some((x) => x.dist === d.name && x.status !== "Cancelled" && x.time > o.time && (linesByOrder[x.id] || []).some((l) => l.sap === o.sap)); if (reordered) return;
    const g = (out[d.name] = out[d.name] || { d, items: {}, oos: [] }); g.oos.push(o);
    g.items[o.sap] = g.items[o.sap] || { sap: o.sap, name: st.name, asked: o.time };
  });
  return Object.values(out).map((g) => ({ ...g, items: Object.values(g.items) })).sort((a, b) => b.items.length - a.items.length);
}
function bisEmail(g) {
  const d = g.d, rate = (sap) => { const sp = d.special && D.special.prices[sap] != null ? D.special.prices[sap] : price(sap); return sp != null ? moneyE(sp) + " / box" : ""; };
  const names = g.items.map((i) => shortName(i.name));
  const html = emailShell({
    preheader: `${names.slice(0, 2).join(", ")}${names.length > 2 ? " and more" : ""} ${names.length > 1 ? "are" : "is"} back in stock`,
    heading: names.length > 1 ? "Good news: they're back in stock" : "Good news: it's back in stock",
    paras: [`Hi ${escE(greetName(d))},`, `You asked for ${names.length > 1 ? "these" : "this"} recently when we were out. ${names.length > 1 ? "They are" : "It is"} back in our warehouse now.`],
    blocks: [tableE(["Product", "Your rate"], g.items.map((i) => [escE(i.name), rate(i.sap)])), noteE("Stock moves fast. Reply to this email or call us and we will add it to your next order.")],
    signoff: "Happy selling,",
  });
  return { kind: "back_in_stock", ref: d.name, to: emails(d.email), cc: emails(d.cc), subject: names.length > 1 ? `Back in stock: ${names[0]} and ${names.length - 1} more` : `Back in stock: ${names[0]}`, html, text: textOf([`Hi ${greetName(d)},`, "", "Back in stock now:", ...g.items.map((i) => `- ${i.name} ${rate(i.sap)}`), "", "Reply or call us to add it to your next order.", "", "Team SahiReach"]), who: d.name, d, g };
}
/* ---------- 4. pick lists to Tropicana ---------- */
const pickKey = (P) => P.orders.map((o) => o.id).sort().join("|");
const pickHash = (P) => JSON.stringify(P.rows.map((r) => [r.sap, Object.values(r.cells).map((c) => +c.toFixed(2))])) + (P.dispatchOn || "") + (P.qc && Object.keys(P.qc).length ? JSON.stringify(P.qc) : "");
const pickQCList = (P) => Object.keys(P.qc || {}).map((sap) => ({ sap, n: P.qc[sap], name: (stockBySap[sap] || qcBySap[sap] || { name: sap }).name, code: (qcBySap[sap] || {}).trop || "" }));
function pickEmail(P, xlsxB64) {
  D.pickSent = D.pickSent || {};
  const prev = D.pickSent[pickKey(P)], revised = !!prev && prev.hash !== pickHash(P), made = P.made || NOW();
  const html = emailShell({
    preheader: `${P.orders.length} orders · ${nf(P.total, 2)} crates`,
    heading: revised ? "Revised pick list" : "Pick list for dispatch",
    paras: ["Hi Tropicana team,", revised ? `<b>This replaces the pick list we sent on ${fmtDT(prev.at)}.</b> Please pick from this one.` : `Please pick the following for dispatch. The Excel sheet is attached.`],
    blocks: [factsE([["Expected dispatch", escE(dateLong(P.dispatchOn || ymd(made)))], ["Orders", nf(P.orders.length)], ["Crates", nf(P.total, 2)]]),
      ...(pickQCList(P).length ? [`<div style="margin:0 0 6px;padding:10px 12px;border-radius:10px;background:#fff4e5;color:#8a4b00;font:600 14px/1.45 -apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">Please pick these from QUICK COMMERCE stock, not SahiReach stock:</div>` + tableE(["Product", "QC stock code", "Crates from QC stock"], pickQCList(P).map((x) => [escE(shortName(x.name)), escE(x.code || "–"), `<b>${nf(x.n)}</b>`]))] : []),
      ...P.orders.map((o, ci) => `<div style="margin:0 0 6px;font:700 14px/1.4 -apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${EM.ink}">${escE(shortOf(o.dist))} <span style="font-weight:400;color:${EM.ink3}">· ${nf(o.crates, 2)} crates</span></div>` + tableE(["Product", "Code", "Crates"], P.rows.filter((r) => r.cells[ci]).map((r) => [escE(shortName(r.name)), escE(tropCode(r.sap) || "–"), `<b>${nf(r.cells[ci], 2)}</b>`])))],
    signoff: "Thank you,",
  });
  return { kind: "pick_list", ref: pickKey(P).slice(0, 120), to: emails(D.qcPick.tropEmail), cc: [], subject: `${revised ? "REVISED · " : ""}SahiReach pick list for dispatch ${dmyK(P.dispatchOn || ymd(made)).slice(0, 5)} · ${P.orders.length} orders · ${nf(P.total, 2)} crates`, html, text: textOf(["Hi Tropicana team,", "", revised ? "REVISED pick list, replaces the earlier one." : "Pick list for dispatch (Excel attached):", `Expected dispatch: ${dateLong(P.dispatchOn || ymd(made))}`, ...(pickQCList(P).length ? ["", "PICK FROM QUICK COMMERCE STOCK (not SahiReach stock):", ...pickQCList(P).map((x) => `  ${nf(x.n)} x ${shortName(x.name)}${x.code ? " (" + x.code + ")" : ""}`)] : []), "", ...P.orders.map((o, ci) => `${shortOf(o.dist)} (${nf(o.crates, 2)} crates)\n` + P.rows.filter((r) => r.cells[ci]).map((r) => `  ${nf(r.cells[ci], 2)} x ${shortName(r.name)} ${tropCode(r.sap) ? "(" + tropCode(r.sap) + ")" : ""}`).join("\n")), "", "Team SahiReach"]), attachments: xlsxB64 ? [{ filename: `SahiReach pick list ${stampOf(made).replace(":", "")}.xlsx`, content: xlsxB64 }] : [], revised, onSent: () => { D.pickSent[pickKey(P)] = { at: iso(NOW()), hash: pickHash(P) }; } };
}
function qcPickEmail(Dl, xlsxB64) {
  const to = S.qcPlatform === "Swiggy" ? D.qcPick.swiggyTo : D.qcPick.zeptoTo, now = NOW();
  const html = emailShell({
    preheader: `${S.qcPlatform} delivery · ${nf(Dl.crates)} crates`,
    heading: `${S.qcPlatform} delivery pick list`,
    paras: ["Hi Tropicana team,", `Please pick the following for the ${escE(S.qcPlatform)} delivery to <b>${escE(to)}</b>. The Excel sheet is attached.`],
    blocks: [factsE([["Expected dispatch", escE(dateLong(qcDispatchOn()))], ["POs", escE(Dl.pos.map((p) => p.po).join(", "))], ["Crates", nf(Dl.crates)]]), tableE(["Product", "Code", "From QC stock", "From own stock", "Crates"], Dl.rows.filter((r) => r.send).map((r) => [escE(shortName(r.name)), escE(tropCode(r.sap) || (qcBySap[r.sap] || {}).trop || "–"), nf(r.fromQC), nf(r.fromOwn), `<b>${nf(r.send)}</b>`]), ["Total", "", nf(Dl.rows.reduce((a, r) => a + r.fromQC, 0)), nf(Dl.rows.reduce((a, r) => a + r.fromOwn, 0)), nf(Dl.crates)])],
    signoff: "Thank you,",
  });
  return { kind: "qc_pick_list", ref: S.qcPlatform + " " + Dl.pos.map((p) => p.po).join(","), to: emails(D.qcPick.tropEmail), cc: [], subject: `SahiReach ${S.qcPlatform} pick list for dispatch ${dmyK(qcDispatchOn()).slice(0, 5)} · ${nf(Dl.crates)} crates`, html, text: textOf(["Hi Tropicana team,", "", `${S.qcPlatform} delivery to ${to}. POs ${Dl.pos.map((p) => p.po).join(", ")}.`, `Expected dispatch: ${dateLong(qcDispatchOn())}`, "", ...Dl.rows.filter((r) => r.send).map((r) => `  ${r.send} x ${shortName(r.name)}`), "", "Team SahiReach"]), attachments: xlsxB64 ? [{ filename: `SahiReach ${S.qcPlatform} pick list ${stampOf(now).replace(":", "")}.xlsx`, content: xlsxB64 }] : [] };
}

/* ---------- preview and send ---------- */
/* every address in a box: separated by commas, semicolons, spaces or new lines; "Name <a@b.com>" works too; no repeats */
function emails(v) { const seen = {}; return (String(v || "").match(/[^\s<>,;:"'()\[\]]+@[^\s<>,;:"'()\[\]]+\.[^\s<>,;:"'()\[\].]+/g) || []).filter((x) => { const k = x.toLowerCase(); if (seen[k]) return false; seen[k] = 1; return true; }); }
function bccList() { return emails(D.qcPick.copyTo).slice(0, 3); }
let MAIL = [];
function mailSheet(list, title) {
  MAIL = list; S.mailI = 0;
  const m = list[0], many = list.length > 1;
  openSheet(esc(title || "Email preview"), `<div id="mail-form">${mailFormHtml()}</div><div class="mail-frame"><iframe id="mail-iframe" title="Email preview" sandbox="" srcdoc="${esc(m.html)}"></iframe></div>${HOST ? "" : `<div class="row-sub">This preview cannot send emails. Use the staff login on sahireach.com.</div>`}`,
    `<button class="btn btn-secondary" data-act="closeSheet">Cancel</button><button class="btn btn-primary" data-act="mailSend" ${HOST ? "" : "disabled"}>${ic("arrowR", "sm")} ${many ? `Send ${list.length} emails` : "Send email"}</button>`, true);
}
function mailFormHtml() {
  const m = MAIL[S.mailI], many = MAIL.length > 1;
  return `${many ? `<div class="hstack gap-8 wrap" style="margin-bottom:10px">${MAIL.map((x, i) => `<button class="chip" data-act="mailPick" data-i="${i}" aria-pressed="${i === S.mailI}">${esc(shortOf(x.who || "Email " + (i + 1)))}${x.to.length ? "" : " ⚠"}</button>`).join("")}</div>` : ""}
  <div class="card card-pad"><div class="form-grid"><div class="field full"><label class="label" for="mail-to">To</label><input class="input" id="mail-to" value="${esc(m.to.join(", "))}" placeholder="${m.kind.includes("pick") ? "Tropicana email (save it in Setup → Company & QC)" : "Distributor email (save it in their details)"}" data-in="mailTo"></div>
  <div class="field full"><label class="label" for="mail-subj">Subject</label><input class="input" id="mail-subj" value="${esc(m.subject)}" data-in="mailSubj"></div></div>
  <div class="row-sub" style="margin-top:8px">From SahiReach · replies come to hello@sahireach.com${m.cc && m.cc.length ? " · copy to " + esc(m.cc.join(", ")) : ""}${bccList().length ? " · a copy goes to " + esc(bccList().join(", ")) : ""}${m.attachments && m.attachments.length ? " · attached: " + esc(m.attachments.map((a) => a.filename).join(", ")) : ""}</div></div>`;
}
ACT.mailPick = (el) => { S.mailI = +el.dataset.i; part("mail-form", mailFormHtml()); const f = $("#mail-iframe"); if (f) f.srcdoc = MAIL[S.mailI].html; };
IN.mailTo = (el) => { MAIL[S.mailI].to = emails(el.value); MAIL[S.mailI].toTyped = el.value; };
IN.mailSubj = (el) => { MAIL[S.mailI].subject = el.value; };
ACT.mailSend = async (el) => {
  if (!HOST || !HOST.sendEmail) return;
  const todo = MAIL.filter((m) => !m.sent);
  const missing = todo.filter((m) => !m.to.length);
  if (missing.length === todo.length) { toast("Add an email address first", "alert"); return; }
  el.disabled = true; let ok = 0, fail = 0, lastErr = "";
  for (const m of todo) {
    if (!m.to.length) continue;
    try { await HOST.sendEmail({ kind: m.kind, ref: m.ref, to: m.to, cc: m.cc, bcc: bccList(), subject: m.subject, html: m.html, text: m.text, attachments: m.attachments }); m.sent = true; ok++; if (m.onSent) m.onSent(); logActivity("Email sent", m.ref || m.kind, `${m.subject} → ${m.to.join(", ")}`); }
    catch (e) { fail++; lastErr = (e && e.message) || "Could not send"; }
  }
  el.disabled = false;
  if (ok && typeof queueSave === "function") queueSave(); /* save the lock and log right away */
  if (/not switched on/i.test(lastErr)) { toast("Email isn't switched on yet: the Resend key still needs adding", "alert"); return; }
  if (fail) { toast(`${ok} sent, ${fail} not sent: ${lastErr}`, "alert"); part("mail-form", mailFormHtml()); return; }
  closeSheet(); render(); toast(`${ok} email${ok > 1 ? "s" : ""} sent${missing.length ? ` · ${missing.length} skipped (no email address)` : ""}`, "check");
};

/* ---------- entry points ---------- */
ACT.emailSO = (el) => { const o = orderById(el.dataset.id); if (!o) return; const m = soEmail(o); mailSheet([m], "Email sales order"); if (!m.to.length) toast(`No email saved for ${m.who}. Type one, or add it in their details.`, "info"); };
ACT.emailDispatch = (el) => { const ids = (el.dataset.ids || el.dataset.id || "").split(",").filter(Boolean); const list = ids.map((id) => orderById(id)).filter(Boolean).map(dispatchEmail); if (list.length) mailSheet(list, "Tell distributors it's on the way"); };
ACT.backInStock = () => {
  const groups = backInStock();
  if (!groups.length) { toast("Nobody is waiting for a product that is back in stock", "info"); return; }
  openSheet("Back in stock", `<div class="banner info">${ic("info", "sm")}<span>These distributors asked for products in the last 30 days when you were out, and the products are back now. Send them a short note, or mark them as told if you called them.</span></div>
    <div class="group">${groups.map((g, i) => `<label class="row" style="align-items:flex-start;cursor:pointer"><input type="checkbox" class="bis-pick" data-i="${i}" ${g.d.email ? "checked" : ""} style="width:20px;height:20px;margin-top:2px;accent-color:var(--tint)"><span class="grow"><div class="row-title">${esc(g.d.name)}</div><div class="row-sub">${g.items.map((x) => esc(shortName(x.name))).join(", ")}</div>${g.d.email ? `<div class="row-sub">${esc(g.d.email)}</div>` : `<div class="row-sub" style="color:var(--warn)">No email saved · <button class="btn-plain" style="height:auto;padding:0;font-size:inherit;font-weight:600;color:var(--tint)" data-act="distEdit" data-name="${esc(g.d.name)}">add one</button></div>`}</span></label>`).join("")}</div>`,
    `<button class="btn btn-secondary" data-act="bisTold">Mark ticked as told</button><button class="btn btn-primary" data-act="bisPreview">${ic("arrowR", "sm")} Preview and send</button>`, true);
};
const bisPicked = () => { const groups = backInStock(); return $$(".bis-pick").filter((x) => x.checked).map((x) => groups[+x.dataset.i]).filter(Boolean); };
ACT.bisTold = () => { const gs = bisPicked(), now = iso(NOW()); gs.forEach((g) => g.oos.forEach((o) => { o.notified = now; })); logActivity("Back in stock: told", "", gs.map((g) => g.d.name).join(", ")); closeSheet(); render(); toast(`${gs.length} marked as told`); };
ACT.bisPreview = () => { const gs = bisPicked(); if (!gs.length) { toast("Tick at least one distributor", "info"); return; } mailSheet(gs.map((g) => { const m = bisEmail(g); m.onSent = () => { const now = iso(NOW()); g.oos.forEach((o) => { o.notified = now; }); }; return m; }), "Back in stock emails"); };
async function xlsxBase64(aoa, cols, sheet) {
  try { await loadScriptOnce(XLSX_SRC, () => !!window.XLSX); } catch (e) { return null; }
  const X = window.XLSX, ws = X.utils.aoa_to_sheet(aoa); ws["!cols"] = cols.map((w) => ({ wch: w }));
  const wb = X.utils.book_new(); X.utils.book_append_sheet(wb, ws, sheet); return X.write(wb, { type: "base64", bookType: "xlsx", compression: true });
}
ACT.emailPick = async () => {
  const P = S.pickList; if (!P) return;
  const aoa = pickAoa(P, { noVehicle: true }), b64 = await xlsxBase64(aoa.rows, aoa.cols, "Pick List");
  mailSheet([pickEmail(P, b64)], "Email pick list to Tropicana");
};
ACT.emailQCPick = async () => {
  const Dl = qcDelivery(); if (!Dl.rows.length) return;
  const aoa = qcPickAoa(Dl), b64 = await xlsxBase64(aoa.rows, aoa.cols, "QC Pick List"), m = qcPickEmail(Dl, b64), lockId = Dl.locked ? Dl.locked.id : null;
  /* once it is sent, the pick list is locked and its crates held (an already locked one just records the resend) */
  m.onSent = () => { if (lockId) { const L = qcLocks().find((l) => l.id === lockId); if (L) { L.resent = (L.resent || 0) + 1; L.lastSent = iso(NOW()); logActivity("QC pick list emailed again", L.pos.join(", "), S.qcPlatform); } } else qcLockNow("email", Dl); render(); };
  mailSheet([m], `Email ${S.qcPlatform} pick list to Tropicana`);
};

/* ===== LOGISTICS: what each trip cost and what share of sales it takes =====
   A trip carries dispatched distributor orders and/or Swiggy/Zepto deliveries. Sellers, crates and revenue
   come from those orders; a per-km transporter is costed from the odometer (km × its rate), others
   take the amount paid for that trip. Revenue is the invoiced value excluding GST, as in the old sheet. */
/* transporters and their rates live in the workspace data (private), never in this code */
function logi() {
  const L = (D.logistics = D.logistics || {});
  L.trips = L.trips || []; L.transporters = L.transporters || [];
  if (!L.since) L.since = L.trips.length ? addDays(L.trips.reduce((a, t) => (t.date > a ? t.date : a), ""), 1) : ymd(NOW());
  return L;
}
const transporterOf = (name) => logi().transporters.find((t) => key(t.name) === key(name)) || null;
const tripPct = (t) => (t.revenue > 0 && t.cost != null ? t.cost / t.revenue : null);
const tripMissing = (t) => t.cost == null || !(t.revenue > 0);
/* dispatches since the app started tracking trips that are not on any trip yet */
/* the day a Swiggy / Zepto PO went out: its sent pick list's dispatch date, else the day it was delivered */
function qcTripInfo(p) {
  const L = typeof qcLockOf === "function" ? qcLockOf(p.po) : null;
  if (p.deliveredOn && (p.valueAccepted > 0 || p.pcsDelivered > 0)) return { date: p.deliveredOn.slice(0, 10), crates: p.pcs ? (p.crates * (p.pcsDelivered || 0)) / p.pcs : 0, revenue: p.valueAccepted || 0, sent: false };
  if (L && p.status === "Open") {
    /* not delivered yet: its share of what the pick list sent */
    const pos = L.pos.map((po) => D.qcPOs.find((x) => x.po === po)).filter(Boolean), tot = pos.reduce((a, x) => a + (x.value || 0), 0), share = tot > 0 ? (p.value || 0) / tot : 1 / Math.max(1, pos.length);
    return { date: L.dispatchOn || String(L.at || "").slice(0, 10), crates: (L.crates || 0) * share, revenue: (L.value || 0) * share, sent: true };
  }
  return null;
}
function unloggedRuns() {
  const L = logi(), onTrip = new Set(), qcOn = new Set();
  L.trips.forEach((t) => { (t.orders || []).forEach((id) => onTrip.add(id)); (t.qc || []).forEach((po) => qcOn.add(po)); });
  const runs = {}, run = (d, kind) => (runs[d + "|" + kind] = runs[d + "|" + kind] || { key: d + "|" + kind, date: d, kind, orders: [], qc: [] });
  D.orders.forEach((o) => { if (o.status !== "Dispatched" || !o.dispatched || o.dispatched.slice(0, 10) < L.since || onTrip.has(o.id)) return; run(o.dispatched.slice(0, 10), "GT").orders.push(o.id); });
  D.qcPOs.forEach((p) => { if (qcOn.has(p.po)) return; const q = qcTripInfo(p); if (!q || !q.date || q.date < L.since) return; run(q.date, "QC").qc.push(p.po); });
  return Object.values(runs).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.kind < b.kind ? -1 : 1));
}
const runLabel = (r) => [...new Set(r.orders.map((id) => shortOf((orderById(id) || {}).dist || "")).concat(r.qc.map((po) => (D.qcPOs.find((p) => p.po === po) || {}).platform || "QC")))].join(", ");
/* ---------- figures ---------- */
function logiRange(preset) {
  const t = NOW(), y = t.getFullYear(), m = t.getMonth(), today = ymd(t), ms = (yy, mm) => ymd(new Date(yy, mm, 1)), me = (yy, mm) => ymd(new Date(yy, mm + 1, 0));
  if (preset === "month") return { from: ms(y, m), to: today, pFrom: ms(y, m - 1), pTo: ymd(new Date(y, m - 1, Math.min(t.getDate(), new Date(y, m, 0).getDate()))), label: MONTH_LONG[m] + " so far", cmp: "same days last month" };
  if (preset === "lastMonth") return { from: ms(y, m - 1), to: me(y, m - 1), pFrom: ms(y, m - 2), pTo: me(y, m - 2), label: MONTH_LONG[(m + 11) % 12], cmp: MONTH_LONG[(m + 10) % 12] };
  if (preset === "3m") return { from: ms(y, m - 2), to: today, pFrom: ms(y, m - 5), pTo: addDays(ms(y, m - 2), -1), label: "Last 3 months", cmp: "the 3 months before" };
  return { from: "2000-01-01", to: today, pFrom: null, pTo: null, label: "All time", cmp: "" };
}
function logiFilter(trips, F, from, to) {
  return trips.filter((t) => t.date >= from && t.date <= to && (F.type === "all" || t.type === F.type) && (F.tr === "all" || (t.transporter || "") === F.tr));
}
function logiStats(trips) {
  const ok = trips.filter((t) => t.cost != null), withRev = ok.filter((t) => t.revenue > 0);
  const cost = ok.reduce((a, t) => a + t.cost, 0), costR = withRev.reduce((a, t) => a + t.cost, 0), rev = withRev.reduce((a, t) => a + t.revenue, 0);
  const cr = ok.filter((t) => t.crates > 0), crates = cr.reduce((a, t) => a + t.crates, 0), crCost = cr.reduce((a, t) => a + t.cost, 0);
  const km = trips.reduce((a, t) => a + (t.km || 0), 0);
  return { n: trips.length, cost, rev, pct: rev > 0 ? costR / rev : null, crates, perCrate: crates > 0 ? crCost / crates : null, km, missing: trips.filter(tripMissing).length };
}
const monthKey = (d) => d.slice(0, 7), monthLbl = (k) => MONTH_LONG[+k.slice(5) - 1].slice(0, 3) + " " + k.slice(2, 4);
function logiByMonth(trips) {
  const g = {}; trips.forEach((t) => { (g[monthKey(t.date)] = g[monthKey(t.date)] || []).push(t); });
  return Object.keys(g).sort().map((k) => ({ k, label: monthLbl(k), ...logiStats(g[k]), trips: g[k] }));
}
function logiGroup(trips, f) { const g = {}; trips.forEach((t) => { const k = f(t); (g[k] = g[k] || []).push(t); }); return Object.entries(g).map(([k, v]) => ({ k, ...logiStats(v), trips: v })); }
/* the % for the dashboard tile: trips in the period, filtered like the dashboard channel */
function logiForDash(from, to, ch) {
  const L = logi(), q = ch === "swiggy" ? /swiggy/i : ch === "zepto" ? /zepto/i : null;
  const trips = L.trips.filter((t) => t.date >= from && t.date <= to && (ch === "all" || (ch === "gt" ? t.type === "GT" : t.type === "QC" && (!q || q.test(t.sellers)))));
  return logiStats(trips);
}
/* ---------- chart: cost by month with the % on top ---------- */
function logiChart(months) {
  if (!months.length) return `<div class="empty">No trips in this period.</div>`;
  const narrow = isNarrow(), W = narrow ? 340 : 620, H = narrow ? 220 : 250, m = { l: 34, r: 34, t: 26, b: 26 };
  const sc = niceScale(Math.max(1, ...months.map((x) => x.cost / 1000))), maxP = Math.max(0.02, ...months.map((x) => x.pct || 0)) * 1.25;
  const y = (v) => H - m.b - (v / sc.max) * (H - m.t - m.b), yp = (p) => H - m.b - (p / maxP) * (H - m.t - m.b), band = (W - m.l - m.r) / months.length, bw = Math.min(30, band * 0.5);
  let g = "";
  for (let i = 0; i <= sc.n; i++) { const v = sc.step * i; g += `<line class="gridline" x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${m.l - 8}" y="${y(v) + 4}" text-anchor="end">${+v.toFixed(1)}</text>`; }
  const pts = [];
  months.forEach((d, i) => {
    const cx = m.l + band * i + band / 2, v = d.cost / 1000;
    g += `<rect x="${cx - bw / 2}" y="${y(v)}" width="${bw}" height="${Math.max(0, y(0) - y(v))}" rx="3" fill="var(--s-gt)" opacity=".85"><title>${esc(d.label)}: ${rs(d.cost)} · ${d.pct != null ? pct(d.pct, 1) : "–"} of sales</title></rect>`;
    g += `<text x="${cx}" y="${H - 6}" text-anchor="middle">${esc(d.label)}</text>`;
    if (d.pct != null) pts.push([cx, yp(d.pct), d.pct]);
  });
  if (pts.length > 1) g += `<path d="${pts.map((p, j) => (j ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ")}" fill="none" stroke="var(--s-swiggy)" stroke-width="2.5" stroke-linejoin="round"/>`;
  pts.forEach((p) => { g += `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="var(--s-swiggy)" stroke="var(--surface)" stroke-width="2"/><text class="lbl" x="${p[0]}" y="${p[1] - 9}" text-anchor="middle">${pct(p[2], 1)}</text>`; });
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Logistics cost by month in thousand rupees, with the cost as a share of sales">${g}</svg></div>`;
}
/* ---------- page ---------- */
VIEWS.logistics = () => {
  const L = logi(), F = (S.logi = S.logi || { preset: "all", type: "all", tr: "all" }), R = logiRange(F.preset);
  const trips = logiFilter(L.trips, F, R.from, R.to).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? 1 : -1));
  const cur = logiStats(trips), prev = R.pFrom ? logiStats(logiFilter(L.trips, F, R.pFrom, R.pTo)) : null, runs = unloggedRuns();
  const ptsChg = prev && prev.pct != null && cur.pct != null ? `${cur.pct > prev.pct ? "▲" : "▼"} ${Math.abs((cur.pct - prev.pct) * 100).toFixed(1)} pts vs ${R.cmp}` : "";
  const months = logiByMonth(logiFilter(L.trips, F, R.from, R.to));
  const tbl = (head, rows, foot) => `<div class="table-wrap"><table class="t"><thead><tr>${head.map((h, i) => `<th class="${i ? "r" : ""}">${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td class="${i ? "r" : ""}">${c}</td>`).join("")}</tr>`).join("")}</tbody>${foot ? `<tfoot><tr>${foot.map((c, i) => `<td class="${i ? "r" : ""}"><b>${c}</b></td>`).join("")}</tr></tfoot>` : ""}</table></div>`;
  const pctCell = (p) => (p == null ? "–" : `<span style="${p > 0.06 ? "color:var(--bad);font-weight:600" : p > 0.045 ? "color:var(--warn);font-weight:600" : ""}">${pct(p, 1)}</span>`);
  const byTR = logiGroup(trips, (t) => t.type + "|" + (t.type === "QC" ? "–" : t.route || "Not set")).sort((a, b) => (a.k < b.k ? -1 : 1));
  const byTrans = logiGroup(trips, (t) => t.transporter || "Not set").sort((a, b) => b.cost - a.cost);
  const gg = L.transporters.filter((t) => t.mode === "km");
  const kmMonths = gg.map((t) => ({ t, rows: logiByMonth(trips.filter((x) => key(x.transporter) === key(t.name))) })).filter((x) => x.rows.length);
  const monthTable = tbl(["Month", "Trips", "Crates", "Km", "Revenue", "Logistics cost", "% of revenue", "Per crate"], months.map((x) => [esc(x.label), x.n, nf(x.crates), nf(x.km), rs(x.rev), rs(x.cost), pctCell(x.pct), x.perCrate != null ? rs2(x.perCrate) : "–"]));
  const chips = (name, list, val) => list.map(([v, l]) => `<button class="chip" data-act="logiF" data-f="${name}" data-v="${esc(v)}" aria-pressed="${val === v}">${esc(l)}</button>`).join("");
  return `<div class="page">
    <div class="page-head"><div><h1 class="title">Logistics</h1><div class="subtitle">What each trip cost and what share of the invoiced sales it takes.</div></div><div class="head-actions"><button class="btn btn-secondary" data-act="logiExcel">${ic("doc", "sm")} Download Excel</button><button class="btn btn-secondary" data-act="logiTransporters">${ic("truck", "sm")} Transporters</button><button class="btn btn-primary" data-act="tripForm">${ic("plus", "sm")} Log a trip</button></div></div>
    ${runs.length ? `<div><div class="group-label"><span>No trip logged yet</span><span>${runs.length}</span></div><div class="group">${runs.map((r) => `<div class="row" style="flex-wrap:wrap;gap:10px"><span class="attn-ic warn" style="width:30px;height:30px">${ic(r.kind === "QC" ? "bolt" : "truck", "sm")}</span><span class="grow" style="min-width:200px"><div class="row-title clip">${esc(fmtDate(r.date))} · ${esc(runLabel(r))}</div><div class="row-sub">${r.kind === "QC" ? `Quick commerce · ${r.qc.length} PO${r.qc.length > 1 ? "s" : ""}${r.qc.some((po) => { const q = qcTripInfo(D.qcPOs.find((x) => x.po === po) || {}); return q && q.sent; }) ? " · pick list sent, not delivered yet" : ""}` : `Distributors · ${r.orders.length} order${r.orders.length > 1 ? "s" : ""}`}</div></span><span class="row-end hstack gap-8"><button class="btn btn-sm btn-secondary" data-act="tripSelf" data-run="${esc(r.key)}">Self pickup</button>${r.kind === "GT" && L.trips.length ? `<button class="btn btn-sm btn-secondary" data-act="tripJoin" data-run="${esc(r.key)}">${ic("truck", "sm")} Same vehicle as a trip</button>` : ""}<button class="btn btn-sm btn-primary" data-act="tripForm" data-run="${esc(r.key)}">${ic("plus", "sm")} Log trip</button></span></div>`).join("")}</div></div>` : ""}
    <div class="hstack gap-12 wrap"><div class="chips" style="margin:0">${chips("preset", [["month", "This month"], ["lastMonth", "Last month"], ["3m", "Last 3 months"], ["all", "All time"]], F.preset)}</div><div class="chips" style="margin:0">${chips("type", [["all", "GT and QC"], ["GT", "GT"], ["QC", "QC"]], F.type)}</div>
      <select class="select sm" style="width:auto" data-in="logiTr" aria-label="Transporter"><option value="all">All transporters</option>${[...new Set(L.trips.map((t) => t.transporter || "").filter(Boolean))].sort().map((n) => `<option ${F.tr === n ? "selected" : ""}>${esc(n)}</option>`).join("")}</select></div>
    <div class="tiles tiles-4">
      <div class="tile"><div class="tile-label">Logistics cost · ${esc(R.label)}</div><div class="tile-value">${rs(cur.cost)}</div>${prev ? deltaChip(chgTxt(cur.cost, prev.cost, R.cmp)) : ""}<div class="tile-sub">${cur.n} trip${cur.n === 1 ? "" : "s"}${cur.missing ? ` · <span style="color:var(--warn)">${cur.missing} without a cost</span>` : ""}</div></div>
      <div class="tile"><div class="tile-label">Share of invoiced sales</div><div class="tile-value">${cur.pct != null ? pct(cur.pct, 2) : "–"}</div>${ptsChg ? `<span class="delta ${cur.pct > prev.pct ? "down" : "up"}">${esc(ptsChg.replace("▲", "↑").replace("▼", "↓"))}</span>` : ""}<div class="tile-sub">On ${rs(cur.rev)} of sales carried</div></div>
      <div class="tile"><div class="tile-label">Cost per crate</div><div class="tile-value">${cur.perCrate != null ? rs2(cur.perCrate) : "–"}</div><div class="tile-sub">${nf(cur.crates)} crates carried</div></div>
      <div class="tile"><div class="tile-label">Kilometres run</div><div class="tile-value">${nf(cur.km)}<small>km</small></div><div class="tile-sub">${cur.km ? rs2(cur.cost / cur.km) + " per km overall" : "Both ways"}</div></div></div>
    <div class="grid-2">
      ${chartCard("logiMonths", "Cost and share of sales, by month", "Bars: logistics cost in ₹ thousand · line: % of invoiced sales", `<span><i style="background:var(--s-gt)"></i>Cost</span><span><i style="background:var(--s-swiggy)"></i>% of sales</span>`, logiChart(months), monthTable)}
      <div class="card"><div class="card-head"><div><div class="card-title">By type and route</div><div class="card-sub">${esc(R.label)} · like the Overall pivot sheet</div></div></div><div class="card-pad" style="padding-top:6px">${tbl(["Type · route", "Trips", "Revenue", "Cost", "%"], byTR.map((x) => [esc(x.k.replace("|–", "").replace("|", " · ")), x.n, rs(x.rev), rs(x.cost), pctCell(x.pct)]), ["Total", cur.n, rs(cur.rev), rs(cur.cost), cur.pct != null ? pct(cur.pct, 1) : "–"])}</div></div>
    </div>
    <div class="grid-2">
      <div class="card"><div class="card-head"><div><div class="card-title">By transporter</div><div class="card-sub">${esc(R.label)}</div></div></div><div class="card-pad" style="padding-top:6px">${tbl(["Transporter", "Trips", "Km", "Cost", "Per crate", "%"], byTrans.map((x) => [esc(x.k) + (x.km ? `<div class="row-sub">${rs2(x.cost / x.km)} per km</div>` : ""), x.n, nf(x.km), rs(x.cost), x.perCrate != null ? rs2(x.perCrate) : "–", pctCell(x.pct)]))}</div></div>
      <div class="card"><div class="card-head"><div><div class="card-title">${kmMonths.length ? esc(kmMonths.map((x) => x.t.name).join(", ")) + ": km by month" : "Per-km transporters"}</div><div class="card-sub">To check the monthly bill · both ways</div></div></div><div class="card-pad" style="padding-top:6px">${kmMonths.length ? kmMonths.map((x) => tbl(["Month", "Trips", "Km", `Amount at ₹${x.t.rate}/km`], x.rows.map((r) => [esc(r.label), r.n, nf(r.km), rs(r.km * x.t.rate)]), ["Total", x.rows.reduce((a, r) => a + r.n, 0), nf(x.rows.reduce((a, r) => a + r.km, 0)), rs(x.rows.reduce((a, r) => a + r.km, 0) * x.t.rate)])).join("") : `<div class="empty">No per-km trips in this period.</div>`}</div></div>
    </div>
    <div><div class="group-label"><span>Trips · ${esc(R.label)}</span><span>${trips.length}</span></div>
      ${trips.length ? `<div class="dg" style="--cols:84px minmax(0,2fr) 70px 70px 104px 92px 70px minmax(90px,130px);--cols-sm:minmax(0,1fr) auto"><div class="dg-row dg-head"><span class="c-hide">Date</span><span>Sellers</span><span class="r c-hide">Crates</span><span class="r c-hide">Km</span><span class="r c-hide">Revenue</span><span class="r">Cost</span><span class="r c-hide">%</span><span class="c-hide">Transporter</span></div>
      ${trips.map((t) => `<button class="dg-row" data-act="tripForm" data-id="${esc(t.id)}"><span class="c-hide num">${fmtDate(t.date)}</span><span><div class="strong clip">${esc(t.sellers || "–")}</div><div class="row-sub clip"><span class="mob-only">${fmtDate(t.date)} · </span>${esc(t.type)}${t.route && t.type !== "QC" ? " · " + esc(t.route) : ""}${t.halting ? ` · ${nf(t.halting, 1)} h halting` : ""}${t.note ? " · " + esc(t.note) : ""}${(t.orders || []).length + (t.qc || []).length ? ` · ${(t.orders || []).length + (t.qc || []).length} linked` : ""}${typeof tripCredits === "function" && tripCredits(t.id).n ? ` · ${tripCredits(t.id).n} credit note${tripCredits(t.id).n > 1 ? "s" : ""} taken off` : ""}</div></span><span class="r c-hide">${t.crates != null ? nf(t.crates) : "–"}</span><span class="r c-hide">${t.km != null ? nf(t.km) : "–"}</span><span class="r c-hide">${t.revenue != null ? rs(t.revenue) : "–"}</span><span class="r strong">${t.cost != null ? rs(t.cost) : `<span class="pill warn">Add cost</span>`}<div class="row-sub mob-only">${tripPct(t) != null ? pct(tripPct(t), 1) : ""}</div></span><span class="r c-hide">${pctCell(tripPct(t))}</span><span class="c-hide clip">${esc(t.transporter || "–")}</span></button>`).join("")}</div>` : `<div class="group"><div class="empty"><div class="big">No trips here</div>Change the filters, or log a trip.</div></div>`}</div>
  </div>`;
};
ACT.logiF = (el) => { S.logi[el.dataset.f] = el.dataset.v; render(); };
IN.logiTr = (el) => { S.logi.tr = el.value; render(); };
/* ---------- the trip form ---------- */
function tripCands(T) {
  /* what can go on this trip: its own links, plus dispatches in the 3 weeks before its date not on any other trip */
  const L = logi(), other = new Set(), otherQ = new Set();
  L.trips.forEach((t) => { if (t.id === T.id) return; (t.orders || []).forEach((i) => other.add(i)); (t.qc || []).forEach((p) => otherQ.add(p)); });
  const lo = addDays(T.date || ymd(NOW()), -21), hi = addDays(T.date || ymd(NOW()), T.isNew ? 2 : 30); /* a saved trip can take a later dispatch that went on the same vehicle */
  const os = D.orders.filter((o) => o.status === "Dispatched" && o.dispatched && (T.orders.includes(o.id) || (!other.has(o.id) && o.dispatched.slice(0, 10) >= (lo > L.since ? lo : L.since) && o.dispatched.slice(0, 10) <= hi))).sort((a, b) => (a.dispatched < b.dispatched ? 1 : -1));
  const qs = D.qcPOs.map((p) => ({ p, q: qcTripInfo(p) })).filter(({ p, q }) => T.qc.includes(p.po) || (q && !otherQ.has(p.po) && q.date >= (lo > L.since ? lo : L.since) && q.date <= hi)).sort((a, b) => ((a.q || {}).date < (b.q || {}).date ? 1 : -1)).map(({ p }) => p);
  return { os, qs };
}
function tripAuto(T) {
  const os = T.orders.map(orderById).filter(Boolean), qs = T.qc.map((po) => D.qcPOs.find((p) => p.po === po)).filter(Boolean);
  if (!os.length && !qs.length) return null;
  const sellers = [...new Set(os.map((o) => shortOf(o.dist)).concat(qs.map((p) => p.platform)))].join(", ");
  const qv = qs.map((p) => qcTripInfo(p) || { crates: 0, revenue: 0 });
  const crates = Math.round((os.reduce((a, o) => a + (o.crates || 0), 0) + qv.reduce((a, q) => a + (q.crates || 0), 0)) * 10) / 10;
  /* sales return credit notes adjusted against this trip take their value and crates off it */
  const cn = T.id && typeof tripCredits === "function" ? tripCredits(T.id) : { amt: 0, crates: 0 };
  const revenue = Math.round((os.reduce((a, o) => a + (o.value || 0), 0) + qv.reduce((a, q) => a + (q.revenue || 0), 0) - cn.amt) * 100) / 100;
  return { sellers, crates: Math.round((crates - cn.crates) * 10) / 10, revenue, type: os.length ? "GT" : "QC" };
}
/* self pickup: the buyer collected it from the cold store, so there is no transport cost */
const SELF = "Self pickup";
function tripSelfSet(T, on) {
  T.selfPickup = !!on;
  if (on) { if (T.transporter && T.transporter !== SELF) T.lastTransporter = T.transporter; T.transporter = SELF; T.cost = 0; T.km = null; T.odoStart = null; T.odoEnd = null; T.route = null; T.halting = null; T.own.cost = true; T.own.route = true; }
  else { T.transporter = T.lastTransporter || (logi().transporters[0] || {}).name || ""; T.cost = null; T.own.cost = false; T.own.route = false; const tr = transporterOf(T.transporter); if (tr && tr.mode === "km") T.odoStart = lastOdo(tr.name); }
}
function tripCalc(T) {
  if (T.selfPickup) { const A = tripAuto(T); if (A) { if (!T.own.sellers) T.sellers = A.sellers; if (!T.own.crates) T.crates = A.crates; if (!T.own.revenue) T.revenue = A.revenue; if (!T.own.type) T.type = A.type; } T.cost = 0; T.transporter = SELF; return { tr: null, A }; }
  const tr = transporterOf(T.transporter), A = tripAuto(T);
  if (A) { if (!T.own.sellers) T.sellers = A.sellers; if (!T.own.crates) T.crates = A.crates; if (!T.own.revenue) T.revenue = A.revenue; if (!T.own.type) T.type = A.type; }
  if (T.odoStart != null && T.odoEnd != null && T.odoEnd >= T.odoStart && !T.own.km) T.km = T.odoEnd - T.odoStart;
  if (tr && tr.mode === "km" && !T.own.cost) T.cost = T.km != null && tr.rate != null ? Math.round(T.km * tr.rate) : null; /* staff are not sent the rate: the database works the cost out */
  if (!T.own.route) T.route = T.type === "QC" ? null : T.km != null ? (T.km >= 260 ? "Long" : "Short") : T.route || null;
  return { tr, A };
}
function lastOdo(name) { const t = logi().trips.filter((x) => key(x.transporter) === key(name) && x.odoEnd != null).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (b.odoEnd || 0) - (a.odoEnd || 0)))[0]; return t ? t.odoEnd : null; }
ACT.tripForm = (el) => {
  const L = logi(), id = el && el.dataset && el.dataset.id, run = el && el.dataset && el.dataset.run, ids = el && el.dataset && el.dataset.orders;
  let T;
  if (id) { const t = L.trips.find((x) => x.id === id); if (!t) return; T = JSON.parse(JSON.stringify(t)); T.orders = T.orders || []; T.qc = T.qc || []; T.own = { sellers: true, crates: true, revenue: true, type: true, km: t.odoStart == null, cost: true, route: true }; T.isNew = false; T.selfPickup = !!t.selfPickup; }
  else {
    const lastGT = L.trips.filter((t) => t.type === "GT" && t.transporter).sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    T = { id: null, date: ymd(NOW()), sellers: "", type: "GT", crates: null, km: null, odoStart: null, odoEnd: null, revenue: null, cost: null, transporter: lastGT ? lastGT.transporter : (L.transporters[0] || {}).name || "", halting: null, route: null, orders: [], qc: [], note: "", own: {}, isNew: true };
    if (run) { const r = unloggedRuns().find((x) => x.key === run || x.date === run); if (r) { T.date = r.date; T.orders = r.orders.slice(); T.qc = r.qc.slice(); T.type = r.kind || T.type; } }
    if (ids) { T.orders = ids.split(",").filter(Boolean); const o = orderById(T.orders[0]); if (o && o.dispatched) T.date = o.dispatched.slice(0, 10); }
    if (T.orders.length === 0 && T.qc.length) T.type = "QC";
    const tr = transporterOf(T.transporter); if (tr && tr.mode === "km") T.odoStart = lastOdo(tr.name);
    if (el && el.dataset && el.dataset.self) tripSelfSet(T, true);
  }
  S.trip = T; tripCalc(T);
  openSheet(T.isNew ? "Log a trip" : "Trip of " + fmtDate(T.date), `<div id="trip-body" class="stack gap-16">${tripBody()}</div>`,
    `${T.isNew ? "" : `<button class="btn btn-danger" data-act="tripDelAsk">Delete</button>`}<button class="btn btn-secondary" data-act="closeSheet">Cancel</button><button class="btn btn-primary" data-act="tripSave">Save trip</button>`, true);
};
function tripBody() {
  const T = S.trip, { tr, A } = tripCalc(T), C = tripCands(T), L = logi(), p = T.revenue > 0 && T.cost != null ? T.cost / T.revenue : null;
  const num = (f, v, ph, extra = "") => `<input class="input num-in" type="number" step="any" min="0" value="${v != null ? v : ""}" placeholder="${ph || ""}" data-in="tripF" data-f="${f}" ${extra}>`;
  const auto = (f) => (A && !T.own[f] ? `<span class="pill plain" style="height:20px;font-size:11px">from the orders</span>` : "");
  const pick = C.os.length || C.qs.length ? `<div class="group" style="max-height:260px;overflow:auto">${C.os.map((o) => `<label class="row" style="cursor:pointer"><input type="checkbox" data-in="tripLink" data-k="o" data-v="${esc(o.id)}" ${T.orders.includes(o.id) ? "checked" : ""}><span class="grow"><div class="row-title clip">${esc(o.dist)}</div><div class="row-sub">Dispatched ${fmtDate(o.dispatched)} · ${nf(o.crates, 1)} crates · ${rs(o.value)}</div></span></label>`).join("")}${C.qs.map((q) => `<label class="row" style="cursor:pointer"><input type="checkbox" data-in="tripLink" data-k="q" data-v="${esc(q.po)}" ${T.qc.includes(q.po) ? "checked" : ""}><span class="grow"><div class="row-title clip">${platDot(q.platform)}${esc(q.platform)} <span class="mono">${esc(q.po)}</span></div><div class="row-sub">${(() => { const t = qcTripInfo(q); return t && t.sent ? `Pick list sent for ${fmtDate(t.date)} · not delivered yet · ${rs(t.revenue)} as sent` : q.deliveredOn ? `Delivered ${fmtDate(q.deliveredOn)} · ${rs(q.valueAccepted || 0)}` : "Not delivered"; })()}</div></span></label>`).join("")}</div>` : `<div class="row-sub">No dispatched orders or deliveries around this date that are not already on a trip. Fill in the details below.</div>`;
  return `${typeof tripCreditHtml === "function" ? tripCreditHtml(T) : ""}<div><div class="group-label"><span>1 · What went on this trip</span><span>${T.orders.length + T.qc.length} ticked</span></div>${pick}</div>
    <div><div class="group-label"><span>2 · The trip</span></div><div class="card card-pad"><div class="form-grid">
      <div class="field"><label class="label">Date</label><input class="input" type="date" value="${esc(T.date)}" data-in="tripF" data-f="date"></div>
      <div class="field full"><label class="row" style="cursor:pointer;padding:10px 12px;border-radius:12px;background:var(--fill)"><input type="checkbox" data-in="tripSelf" ${T.selfPickup ? "checked" : ""} style="width:20px;height:20px;accent-color:var(--tint)"><span class="grow"><div class="row-title">Self pickup</div><div class="row-sub">The buyer collected it from the cold store: no transporter, no transport cost</div></span></label></div>
      ${T.selfPickup ? "" : `<div class="field"><label class="label">Transporter</label><select class="select" data-in="tripF" data-f="transporter">${L.transporters.map((t) => `<option ${key(t.name) === key(T.transporter) ? "selected" : ""}>${esc(t.name)}</option>`).join("")}${T.transporter && !transporterOf(T.transporter) ? `<option selected>${esc(T.transporter)}</option>` : ""}</select></div>`}
      <div class="field full"><label class="label">Sellers ${auto("sellers")}</label><input class="input" value="${esc(T.sellers || "")}" placeholder="Who the goods went to" data-in="tripF" data-f="sellers"></div>
      <div class="field"><label class="label">Type</label><select class="select" data-in="tripF" data-f="type">${["GT", "QC"].map((x) => `<option ${T.type === x ? "selected" : ""}>${x}</option>`).join("")}</select></div>
      ${T.selfPickup ? "" : `<div class="field"><label class="label">Route</label><select class="select" data-in="tripF" data-f="route"><option value="">${T.type === "QC" ? "Not needed" : "Not set"}</option>${["Short", "Long"].map((x) => `<option ${T.route === x ? "selected" : ""}>${x}</option>`).join("")}</select></div>`}
      <div class="field"><label class="label">Crates ${auto("crates")}</label>${num("crates", T.crates, "0")}</div>
      <div class="field"><label class="label">Invoiced revenue, excl. GST ${auto("revenue")}</label>${num("revenue", T.revenue, "0.00")}</div>
    </div></div></div>
    ${T.selfPickup ? `<div class="banner info">${ic("info", "sm")}<span>Self pickup: saved with no transporter and ₹0 transport cost.</span></div>` : `<div><div class="group-label"><span>3 · Kilometres${SEE_MONEY || !(tr && tr.mode === "km") ? " and cost" : ""}</span><span>${tr && tr.mode === "km" ? (SEE_MONEY ? `${esc(tr.name)}: ₹${tr.rate} per km` : "Cost is worked out from the km") : "Amount paid for this trip"}</span></div><div class="card card-pad"><div class="form-grid">
      <div class="field"><label class="label">Odometer at start</label>${num("odoStart", T.odoStart, "Reading at the start")}</div>
      <div class="field"><label class="label">Odometer at end</label>${num("odoEnd", T.odoEnd, "Reading at the end")}</div>
      <div class="field"><label class="label">Km, both ways</label>${num("km", T.km, "0")}</div>
      ${!SEE_MONEY && tr && tr.mode === "km" ? "" : `<div class="field"><label class="label">Logistics cost (₹)${tr && tr.mode === "km" && !T.own.cost ? ` <span class="pill plain" style="height:20px;font-size:11px">km × ₹${tr.rate}</span>` : ""}</label>${num("cost", T.cost, tr && tr.mode === "km" ? "Fills in from the km" : "What you paid")}</div>`}
      <div class="field"><label class="label">Halting time, hours after the first free hour</label>${num("halting", T.halting, "0")}</div>
      <div class="field"><label class="label">Note</label><input class="input" value="${esc(T.note || "")}" data-in="tripF" data-f="note" placeholder="Optional"></div>
    </div>
    ${SEE_MONEY ? `<div class="hstack gap-12 wrap" style="margin-top:14px" id="trip-sum">${tripSum(T)}</div>` : `<div id="trip-sum"></div>`}</div></div>`}
    ${T.selfPickup ? `<div id="trip-sum"></div>` : ""}`;
}
IN.tripSelf = (el) => { tripSelfSet(S.trip, el.checked); tripRedraw(); };
const tripSum = (T) => { if (!SEE_MONEY) return ""; const p = T.revenue > 0 && T.cost != null ? T.cost / T.revenue : null; return `<span class="pill ${p == null ? "plain" : p > 0.06 ? "bad" : p > 0.045 ? "warn" : "good"}">${p != null ? pct(p, 2) + " of revenue" : "Add revenue and cost to see the %"}</span>${T.crates > 0 && T.cost != null ? `<span class="pill plain">${rs2(T.cost / T.crates)} per crate</span>` : ""}${T.km > 0 && T.cost != null ? `<span class="pill plain">${rs2(T.cost / T.km)} per km</span>` : ""}`; };
const tripRedraw = () => { const sc = $("#sheet .sheet-body") || $("#sheet"), y = sc ? sc.scrollTop : 0; part("trip-body", tripBody()); if (sc) sc.scrollTop = y; };
IN.tripF = (el) => {
  const T = S.trip, f = el.dataset.f, v = el.value;
  if (["crates", "km", "revenue", "cost", "halting", "odoStart", "odoEnd"].includes(f)) { T[f] = v === "" ? null : +v; if (["crates", "revenue", "cost", "km"].includes(f)) T.own[f] = v !== ""; }
  else { T[f] = v; if (["sellers", "type", "route"].includes(f)) T.own[f] = true; }
  if (f === "route") T.route = v || null;
  if (f === "transporter") { const tr = transporterOf(v); T.own.cost = false; if (tr && tr.mode === "km" && T.odoStart == null) T.odoStart = lastOdo(tr.name); if (tr && tr.mode !== "km") T.cost = null; }
  if (f === "odoStart" || f === "odoEnd") T.own.km = false;
  tripCalc(T);
  if (["transporter", "date", "type"].includes(f) || el.tagName === "SELECT") tripRedraw();
  else { part("trip-sum", tripSum(T)); ["km", "cost"].forEach((k) => { if (k === f) return; const i = document.querySelector(`#trip-body [data-in="tripF"][data-f="${k}"]`); if (i && document.activeElement !== i) i.value = T[k] != null ? T[k] : ""; }); const rt = document.querySelector(`#trip-body [data-in="tripF"][data-f="route"]`); if (rt) rt.value = T.route || ""; }
};
IN.tripLink = (el) => {
  const T = S.trip, arr = el.dataset.k === "o" ? T.orders : T.qc, v = el.dataset.v;
  if (el.checked && !arr.includes(v)) arr.push(v); if (!el.checked) arr.splice(arr.indexOf(v), 1);
  T.own.sellers = T.own.crates = T.own.revenue = T.own.type = false; tripRedraw();
};
ACT.tripSave = () => {
  const L = logi(), T = S.trip; tripCalc(T);
  if (!T.date) { toast("Add the date", "alert"); return; }
  if (!T.sellers && !T.orders.length && !T.qc.length) { toast("Tick what went on the trip, or type the sellers", "alert"); return; }
  let nid = T.id; if (!nid) { const base = "TRIP-" + T.date.replace(/-/g, "") + "-" + stamp(NOW()).slice(-6); nid = base; let k = 1; while (L.trips.some((x) => x.id === nid)) nid = base + "-" + ++k; }
  const rec = { id: nid, date: T.date, sellers: T.sellers || (tripAuto(T) || {}).sellers || "", type: T.type || "GT", crates: T.crates, km: T.km, odoStart: T.odoStart, odoEnd: T.odoEnd, revenue: T.revenue, cost: T.cost, rate: (transporterOf(T.transporter) || {}).mode === "km" ? transporterOf(T.transporter).rate : null, transporter: T.transporter || "", halting: T.halting, route: T.type === "QC" ? T.route || null : T.route || null, orders: T.orders.slice(), qc: T.qc.slice(), source: T.isNew ? "app" : T.source || "app", note: T.note || "", ...(T.selfPickup ? { selfPickup: true, transporter: SELF, cost: 0, km: null, odoStart: null, odoEnd: null, rate: null, route: null, halting: null } : {}) };
  const i = L.trips.findIndex((x) => x.id === rec.id); if (i >= 0) { rec.source = L.trips[i].source || rec.source; L.trips[i] = rec; } else L.trips.push(rec);
  logActivity(i >= 0 ? "Trip updated" : "Trip logged", fmtDate(rec.date), `${rec.sellers} · ${rec.cost != null ? rs(rec.cost) : "cost not added"}${tripPct(rec) != null ? " · " + pct(tripPct(rec), 1) : ""}`);
  S.trip = null; closeSheet(); if (S.route === "logistics") render(); else render();
  if (rec.selfPickup) { toast(`Saved as self pickup · ${rec.sellers}`, "truck"); return; }
  toast(!SEE_MONEY ? "Trip saved" : rec.cost != null ? `Trip saved · ${tripPct(rec) != null ? pct(tripPct(rec), 1) + " of revenue" : rs(rec.cost)}` : "Trip saved. Add the cost when you have it", "truck");
};
/* one tap from the list (or after marking dispatched): log it as self pickup */
ACT.tripSelf = (el) => {
  ACT.tripForm({ dataset: { run: el.dataset.run || "", orders: el.dataset.orders || "", self: "1" } });
  if (!S.trip || !S.trip.selfPickup) return;
  ACT.tripSave();
};
ACT.tripDelAsk = () => { part("trip-sum", `<div class="confirm" style="width:100%"><span><b>Delete this trip?</b> Its orders go back to "no trip logged".</span><span class="hstack gap-8"><button class="btn btn-sm btn-secondary" data-act="tripDelNo">Keep it</button><button class="btn btn-sm btn-danger" data-act="tripDel">Delete</button></span></div>`); };
ACT.tripDelNo = () => part("trip-sum", tripSum(S.trip));
ACT.tripDel = () => { const L = logi(), T = S.trip; L.trips = L.trips.filter((x) => x.id !== T.id); if (typeof tripUnlinkNotes === "function") tripUnlinkNotes(T.id); logActivity("Trip deleted", fmtDate(T.date), T.sellers || ""); S.trip = null; closeSheet(); render(); toast("Trip deleted"); };
/* ---------- transporters ---------- */
ACT.logiTransporters = () => {
  const L = logi();
  openSheet("Transporters", `<div class="banner info">${ic("info", "sm")}<span>A per-km transporter is costed automatically: km both ways × the rate. For the others, type what you paid for each trip.</span></div>
    <div class="group">${L.transporters.map((t, i) => `<div class="row" style="flex-wrap:wrap;gap:10px"><span class="grow" style="min-width:160px"><input class="input sm" value="${esc(t.name)}" data-in="trF" data-i="${i}" data-f="name" aria-label="Name"></span><select class="select sm" style="width:auto" data-in="trF" data-i="${i}" data-f="mode"><option value="km" ${t.mode === "km" ? "selected" : ""}>Per km</option><option value="trip" ${t.mode !== "km" ? "selected" : ""}>Per trip (market)</option></select>${t.mode === "km" ? `<span class="hstack gap-8"><span class="row-sub">₹</span><input class="input sm num-in" style="width:80px" type="number" min="0" step="any" value="${t.rate != null ? t.rate : ""}" data-in="trF" data-i="${i}" data-f="rate" aria-label="Rate per km"><span class="row-sub">/ km</span></span>` : ""}</div>`).join("")}</div>
    <button class="btn btn-secondary" data-act="trAdd">${ic("plus", "sm")} Add a transporter</button>`, `<button class="btn btn-primary" data-act="closeSheet">Done</button>`);
};
IN.trF = (el) => { const t = logi().transporters[+el.dataset.i], f = el.dataset.f, was = t.name; if (f === "rate") t.rate = el.value === "" ? null : +el.value; else t[f] = el.value; if (f === "name" && was !== el.value) logi().trips.forEach((x) => { if (x.transporter === was) x.transporter = el.value; }); if (f === "mode") ACT.logiTransporters(); };
ACT.trAdd = () => { logi().transporters.push({ name: "New transporter", mode: "trip" }); ACT.logiTransporters(); };
/* ---------- Excel, laid out like the old workbook ---------- */
ACT.logiExcel = async (el) => {
  const L = logi(), F = S.logi || { preset: "all", type: "all", tr: "all" }, R = logiRange(F.preset), now = NOW(), st = `${pad2(now.getDate())}-${pad2(now.getMonth() + 1)}-${now.getFullYear()}`;
  const trips = logiFilter(L.trips, F, R.from, R.to).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1));
  const xd = (s) => { const d = toDate(s); return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); };
  const data = [["Date", "Sellers", "Type", "Crates", "KM (Both side)", "Invoiced Revenue", "Logistics cost ", "% of Revenue", "Transporter", "Halting time (in Hrs) after 1st free hour", "Route", "Month", "Odometer start", "Odometer end", "Note"]];
  trips.forEach((t) => data.push([xd(t.date), t.sellers, t.type, t.crates, t.km, t.revenue, t.cost, tripPct(t) != null ? +tripPct(t).toFixed(4) : "", t.transporter || "", t.halting, t.route || "", +t.date.slice(5, 7), t.odoStart, t.odoEnd, t.note || ""]));
  const tot = logiStats(trips);
  data.push(["", "TOTAL", "", tot.crates, tot.km, Math.round(tot.rev * 100) / 100, tot.cost, tot.pct != null ? +tot.pct.toFixed(4) : "", "", "", "", "", "", "", ""]);
  const piv = [["Type", "Route", "Sum of Invoiced Revenue", "Sum of logistics cost ", "Logistics Cost %", "Trips"]];
  ["GT", "QC"].forEach((ty) => { const tt = trips.filter((t) => t.type === ty); if (!tt.length) return; logiGroup(tt, (t) => (ty === "QC" ? "(blank)" : t.route || "(blank)")).sort((a, b) => (a.k < b.k ? -1 : 1)).forEach((x, i) => piv.push([i ? "" : ty, x.k, Math.round(x.rev * 100) / 100, x.cost, x.pct != null ? +x.pct.toFixed(4) : "", x.n])); const s = logiStats(tt); piv.push([ty + " Total", "", Math.round(s.rev * 100) / 100, s.cost, s.pct != null ? +s.pct.toFixed(4) : "", s.n]); });
  piv.push(["Grand Total", "", Math.round(tot.rev * 100) / 100, tot.cost, tot.pct != null ? +tot.pct.toFixed(4) : "", tot.n]);
  const mon = [["Month", "Trips", "Crates", "KM (Both side)", "Invoiced Revenue", "Logistics cost", "% of Revenue", "Cost per crate"]].concat(logiByMonth(trips).map((x) => [x.label, x.n, x.crates, x.km, Math.round(x.rev * 100) / 100, x.cost, x.pct != null ? +x.pct.toFixed(4) : "", x.perCrate != null ? +x.perCrate.toFixed(2) : ""]));
  const trs = [["Transporter", "Trips", "KM (Both side)", "Logistics cost", "Per km", "Per crate", "% of Revenue"]].concat(logiGroup(trips, (t) => t.transporter || "Not set").sort((a, b) => b.cost - a.cost).map((x) => [x.k, x.n, x.km, x.cost, x.km ? +(x.cost / x.km).toFixed(2) : "", x.perCrate != null ? +x.perCrate.toFixed(2) : "", x.pct != null ? +x.pct.toFixed(4) : ""]));
  const sheets = [{ name: "Data entry", aoa: data, cols: [12, 44, 6, 8, 10, 14, 12, 10, 18, 14, 8, 7, 11, 11, 24] }, { name: "Overall pivot", aoa: piv, cols: [14, 10, 22, 20, 16, 8] }, { name: "By month", aoa: mon, cols: [10, 7, 8, 12, 16, 14, 12, 12] }, { name: "By transporter", aoa: trs, cols: [20, 7, 12, 14, 9, 10, 12] }];
  L.transporters.filter((t) => t.mode === "km").forEach((t) => { const rows = logiByMonth(trips.filter((x) => key(x.transporter) === key(t.name))); if (rows.length) sheets.push({ name: t.name.slice(0, 28), aoa: [["Transporter", t.name], [], ["Month", "Trips", "Sum of KM (Both side)", `Amount at ₹${t.rate}/km`]].concat(rows.map((r) => [r.label, r.n, r.km, r.km * t.rate]), [["Grand Total", rows.reduce((a, r) => a + r.n, 0), rows.reduce((a, r) => a + r.km, 0), rows.reduce((a, r) => a + r.km, 0) * t.rate]]), cols: [14, 8, 20, 18] }); });
  if (await downloadBook(el, sheets, `SahiReach logistics ${R.label === "All time" ? "" : R.label + " "}${st}.xlsx`)) { logActivity("Logistics downloaded", R.label, `${trips.length} trips`); toast("Logistics downloaded as Excel", "doc"); }
};

/* ===== NUDGES: missing prices, and pending orders that can now get what was out of stock ===== */

/* ---------- 1. products with no SS rate (cost price): profit cannot be worked out ---------- */
let MP_CACHE = { t: 0, v: [] };
function missingPrices(fresh) {
  if (!SEE_MONEY) return []; /* staff are not sent cost prices, so there is nothing for them to fix */
  if (!fresh && Date.now() - MP_CACHE.t < 2500) return MP_CACHE.v;
  const since = addDays(ymd(NOW()), -120), out = {};
  const add = (sap, name, v) => { if (!sap || unitCost(sap) != null) return; const x = (out[sap] = out[sap] || { sap, name: (catBySap[sap] || stockBySap[sap] || {}).name || name || sap, sold: 0, last: null }); x.sold += v || 0; };
  salesFacts().forEach((f) => { if (f.ch === "gt" && f.noCost && f.value > 0 && f.date >= since) add(f.sap, f.product, f.value); });
  D.stock.forEach((s) => { if (s.ea > 0) add(s.sap, s.name, 0); });
  pendingOrders().forEach((o) => (linesByOrder[o.id] || []).forEach((l) => add(l.sap, l.product, 0)));
  Object.values(out).forEach((x) => {
    const ls = D.orders.filter((o) => o.status !== "Cancelled").sort((a, b) => (a.time < b.time ? 1 : -1)).map((o) => (linesByOrder[o.id] || []).find((l) => l.sap === x.sap)).find(Boolean);
    const vb = (D.salesBefore || []).filter((s) => s.sap === x.sap && s.ea > 0 && s.value > 0).slice(-1)[0];
    x.last = price(x.sap) != null ? price(x.sap) : ls && ls.billed ? ls.billed : vb ? Math.round((vb.value / vb.ea) * 100) / 100 : null;
    const st = stockBySap[x.sap]; x.crates = st && st.upc ? st.ea / st.upc : null;
  });
  MP_CACHE = { t: Date.now(), v: Object.values(out).sort((a, b) => b.sold - a.sold || a.name.localeCompare(b.name)) };
  return MP_CACHE.v;
}
function priceRowsHtml(list) {
  return list.map((x) => `<div class="nudge-row"><div class="grow" style="min-width:0"><div class="row-title clip">${esc(x.name)}</div><div class="row-sub">SAP ${esc(x.sap)}${x.sold ? ` · ${rs(x.sold)} sold in the last 4 months` : ""}${x.crates ? ` · ${nf(x.crates, 1)} crates in stock` : ""}</div></div>
    ${CAN_PRICE ? `<label class="nudge-in"><span>SS rate / box</span><input class="input sm num-in" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Required" id="mp-ss-${esc(x.sap)}" aria-label="SS rate per box for ${esc(x.name)}"></label>
    <label class="nudge-in"><span>Distributor rate / box</span><input class="input sm num-in" type="number" min="0" step="0.01" inputmode="decimal" value="${price(x.sap) != null ? price(x.sap) : x.last != null ? x.last : ""}" placeholder="0.00" id="mp-dist-${esc(x.sap)}" aria-label="Distributor rate per box for ${esc(x.name)}"></label>` : ""}</div>`).join("");
}
function priceNudgeHome() {
  const list = missingPrices(); if (!list.length) return "";
  const sold = list.reduce((a, x) => a + x.sold, 0);
  return `<div class="nudge" id="price-nudge"><div class="nudge-head"><span class="attn-ic bad">${ic("alert")}</span><div class="grow"><div class="nudge-title">Add the SS rate for ${list.length} product${list.length > 1 ? "s" : ""}</div><div class="nudge-sub">${sold ? `${rs(sold)} of sales have no cost price, so your gross profit and margin are not right until you do. ` : "These products are in stock or on orders without a cost price. "}${CAN_PRICE ? "Type the rate from the Hangyo price list and save." : "Only the owner can add prices. Please ask them."}</div></div></div>
    <div class="nudge-rows">${priceRowsHtml(list)}</div>
    ${CAN_PRICE ? `<div class="hstack between wrap gap-12" style="margin-top:12px"><span class="row-sub" id="mp-msg">The distributor rate is filled in from the last order where there was one.</span><button class="btn btn-primary" data-act="mpSave">${ic("check", "sm")} Save prices</button></div>` : ""}</div>`;
}
function priceStrip() {
  if (S.route === "home" || !CAN_PRICE) return "";
  const list = missingPrices(); if (!list.length) return "";
  return `<button class="nudge-strip" data-act="priceNudge">${ic("alert", "sm")}<span class="grow"><b>${list.length} product${list.length > 1 ? "s have" : " has"} no SS rate.</b> Profit and margin figures are off until ${list.length > 1 ? "they are" : "it is"} added.</span><span class="nudge-strip-go">Add now ${ic("chevR", "sm")}</span></button>`;
}
ACT.priceNudge = () => {
  const list = missingPrices(true); if (!list.length) { toast("All products have a cost price", "check"); render(); return; }
  openSheet("Add the missing prices", `<div class="banner warn">${ic("alert", "sm")}<span>Without the SS rate the tool cannot work out the profit on these products. Type the rate per box from the Hangyo price list.</span></div><div class="card card-pad nudge-rows">${priceRowsHtml(list)}</div><div id="mp-msg"></div>`,
    CAN_PRICE ? `<button class="btn btn-secondary" data-act="closeSheet">Later</button><button class="btn btn-primary" data-act="mpSave">Save prices</button>` : `<button class="btn btn-primary" data-act="closeSheet">OK</button>`);
};
ACT.noCostFix = ACT.priceNudge;
ACT.mpSave = () => {
  if (!CAN_PRICE) return;
  const list = missingPrices(true), saved = [], bad = [];
  list.forEach((x) => {
    const ssEl = document.getElementById("mp-ss-" + x.sap), dEl = document.getElementById("mp-dist-" + x.sap); if (!ssEl) return;
    const ss = ssEl.value === "" ? null : +ssEl.value, dist = dEl && dEl.value !== "" ? +dEl.value : null;
    if (ss == null) return;
    if (!(ss > 0) || (dist != null && !(dist > 0))) { bad.push(x.name); return; }
    const p = (D.prices[x.sap] = D.prices[x.sap] || [null, null, null, null, null]); p[0] = Math.round(ss * 100) / 100; if (dist != null) p[1] = Math.round(dist * 100) / 100;
    const st = stockBySap[x.sap]; if (st) Object.assign(st, { cost: p[0], price: p[1] != null ? p[1] : st.price, margin: p[1] != null ? Math.round((p[1] - p[0]) * 100) / 100 : st.margin });
    saved.push(shortName(x.name));
  });
  if (bad.length) { part("mp-msg", `<span style="color:var(--bad);font-weight:600">Check the rates for ${esc(bad.join(", "))}.</span>`); return; }
  if (!saved.length) { part("mp-msg", `<span style="color:var(--warn);font-weight:600">Type at least one SS rate first.</span>`); return; }
  logActivity("Prices added", saved.join(", "), "SS rate added from the reminder");
  MP_CACHE.t = 0; if (sheetOpen) closeSheet(); render(); toast(`Saved. Profit is now worked out for ${saved.length} more product${saved.length > 1 ? "s" : ""}`, "check");
};

/* ---------- 2. pending orders that can now get what was out of stock ---------- */
function backOnOrder(o) {
  if (!o || o.status !== "Pending") return [];
  const seen = new Set(), on = new Set((linesByOrder[o.id] || []).map((l) => l.sap));
  return D.oos.filter((x) => x.id === o.id && x.sap).map((x) => {
    if (seen.has(x.sap)) return null; seen.add(x.sap);
    const st = stockBySap[x.sap]; if (!st || !st.upc) return null;
    const av = st.ea / st.upc, want = typeof x.missed === "number" ? x.missed : null;
    if (av < (want != null ? Math.min(1, want) : 1) - 1e-9) return null;
    return { sap: x.sap, name: st.name, av, want, partly: on.has(x.sap) };
  }).filter(Boolean);
}
function pendingBack() { return pendingOrders().map((o) => ({ o, items: backOnOrder(o) })).filter((g) => g.items.length); }
const backPill = (o) => { const n = backOnOrder(o).length; return n ? `<span class="pill good" title="Products this order missed are back in stock">${n} back in stock</span>` : ""; };
function backBanner(o) {
  const items = backOnOrder(o); if (!items.length) return "";
  return `<div class="banner good" style="align-items:center">${ic("box", "sm")}<span class="grow"><b>Back in stock for this order:</b> ${items.map((i) => `${esc(shortName(i.name))} <span class="dim">(${nf(Math.floor(i.av))} cr now${i.want != null ? `, ${nf(i.want, 1)} missed` : ""})</span>`).join(", ")}. Refresh the order to add ${items.length > 1 ? "them" : "it"}, then save.</span><button class="btn btn-sm btn-primary" data-act="refreshOrder" data-id="${esc(o.id)}">${ic("repeat", "sm")} Refresh order</button></div>`;
}
ACT.refreshOrder = (el) => {
  const o = orderById(el.dataset.id); if (!o || o.status !== "Pending") return;
  const items = backOnOrder(o);
  ACT.editOrder({ dataset: { id: o.id } });
  S.draft.refreshNote = items.map((i) => shortName(i.name));
  render(); toast("Back-in-stock products added back. Check the quantities and press Save order", "repeat");
};
function refreshNoteHtml() {
  const n = S.draft.refreshNote; if (!n || !n.length || !S.draft.editId) return "";
  return `<div class="banner good">${ic("repeat", "sm")}<span><b>Refreshing this order.</b> Back in stock and added back: ${esc(n.join(", "))}. Anything still short stays logged as missed. Press <b>Save order</b> to update it.</span></div>`;
}
ACT.pendingBackSheet = (el) => {
  const groups = pendingBack(), next = el && el.dataset && el.dataset.next;
  if (!groups.length) { if (next && backInStock().length) ACT.backInStock(); return; }
  openSheet("Back in stock for pending orders", `<div class="banner good">${ic("box", "sm")}<span>These orders are not dispatched yet and missed products that are back in stock now. Refresh each one to add them before it goes on the truck.</span></div>
    <div class="group">${groups.map((g) => `<div class="row" style="align-items:flex-start"><span class="grow"><div class="row-title clip">${esc(g.o.dist)}</div><div class="row-sub"><span class="mono">${esc(g.o.id)}</span> · saved ${fmtDate(g.o.time)}</div><div class="row-sub" style="margin-top:4px">${g.items.map((i) => esc(shortName(i.name)) + (i.want != null ? ` (${nf(i.want, 1)} cr missed)` : "")).join(", ")}</div></span><span class="row-end"><button class="btn btn-sm btn-primary" data-act="refreshOrder" data-id="${esc(g.o.id)}">Refresh order</button></span></div>`).join("")}</div>`,
    backInStock().length ? `<button class="btn btn-secondary" data-act="closeSheet">Later</button><button class="btn btn-secondary" data-act="backInStock">Next: tell other distributors</button>` : `<button class="btn btn-secondary" data-act="closeSheet">Later</button>`);
};

/* ===== STOCK MOVED BETWEEN SAHIREACH STOCK AND QUICK COMMERCE STOCK =====
   SahiReach stock sent with a Swiggy/Zepto delivery  -> a CREDIT NOTE has to be made.
   Quick commerce stock used for distributor orders    -> a PURCHASE INVOICE is pending.
   Both ask for confirmation before the pick list goes out, and stay on Home until the document is entered. */
const XFER = {
  credit: { doc: "Credit note", what: "SahiReach stock sent with Swiggy / Zepto deliveries", from: "SahiReach stock", to: "quick commerce" },
  purchase: { doc: "Purchase invoice", what: "Quick commerce stock used for distributor orders", from: "quick commerce stock", to: "SahiReach" },
};
const xferPending = (kind) => (D.transfers || []).filter((t) => t.status === "Pending" && (!kind || t.kind === kind));
const xferEst = (t) => t.lines.reduce((a, l) => { const st = stockBySap[l.sap] || qcBySap[l.sap] || {}, r = ssRate(l.sap); return a + (r != null ? l.crates * (st.upc || 0) * r : 0); }, 0);
function xferAdd(kind, ref, lines) {
  D.transfers = D.transfers || [];
  const base = "TRF-" + stamp(NOW()); let id = base, k = 1; while (D.transfers.some((t) => t.id === id)) id = base + "-" + ++k;
  const t = { id, time: iso(NOW()), kind, ref, lines: lines.map((l) => ({ sap: l.sap, name: l.name, crates: l.crates })), crates: lines.reduce((a, l) => a + l.crates, 0), status: "Pending" };
  D.transfers.unshift(t);
  logActivity(kind === "credit" ? "Credit note needed" : "Purchase invoice pending", id, `${nf(t.crates)} crates of ${XFER[kind].from} · ${ref}`);
  return t;
}
function xferAttention() {
  return ["credit", "purchase"].map((kind) => {
    const L = xferPending(kind); if (!L.length) return null;
    const cr = L.reduce((a, t) => a + t.crates, 0);
    return { ic: "doc", cls: "warn", act: "xferSheet", title: kind === "credit" ? `Make the credit note: ${nf(cr)} crate${cr === 1 ? "" : "s"} of SahiReach stock went to Swiggy / Zepto` : `Purchase invoice pending: ${nf(cr)} crate${cr === 1 ? "" : "s"} of quick commerce stock used for distributors`, sub: `${L.length} pending since ${fmtDate(L[L.length - 1].time)} · tap to enter the ${XFER[kind].doc.toLowerCase()}` };
  }).filter(Boolean);
}
function xferCard(t) {
  const est = SEE_MONEY ? xferEst(t) : 0, today = ymd(NOW());
  return `<div class="card card-pad"><div class="hstack between wrap gap-8"><div><div class="card-title">${XFER[t.kind].doc} ${t.status === "Pending" ? `<span class="pill warn" style="height:22px;font-size:12px">Pending</span>` : `<span class="pill good" style="height:22px;font-size:12px">Done</span>`}</div><div class="row-sub">${esc(XFER[t.kind].what)} · ${fmtDT(t.time)} · ${esc(t.ref || "")}</div></div><div class="row-value">${nf(t.crates)} crates</div></div>
    <div class="row-sub" style="margin-top:8px">${t.lines.map((l) => `${nf(l.crates)} × ${esc(shortName(l.name))}`).join(" · ")}${SEE_MONEY && est ? ` · about <b>${rs(est)}</b> at the SS rate` : ""}</div>
    ${t.status === "Pending" ? `<div class="form-grid" style="margin-top:12px"><div class="field"><label class="label" for="xf-no-${esc(t.id)}">${XFER[t.kind].doc} number</label><input class="input" id="xf-no-${esc(t.id)}" placeholder="e.g. ${t.kind === "credit" ? "CN-0012" : "PI-0045"}"></div><div class="field"><label class="label" for="xf-dt-${esc(t.id)}">Date</label><input class="input" type="date" id="xf-dt-${esc(t.id)}" value="${today}"></div>${SEE_MONEY ? `<div class="field"><label class="label" for="xf-amt-${esc(t.id)}">Amount (₹)</label><input class="input num-in" type="number" min="0" step="0.01" inputmode="decimal" id="xf-amt-${esc(t.id)}" placeholder="${est ? Math.round(est * 100) / 100 : "0.00"}"></div>` : ""}</div>
      <div id="xf-err-${esc(t.id)}"></div><div style="margin-top:12px"><button class="btn btn-primary btn-sm" data-act="xferSave" data-id="${esc(t.id)}">${ic("check", "sm")} Save ${XFER[t.kind].doc.toLowerCase()}</button></div>`
    : `<div class="row-sub" style="margin-top:8px">${esc(XFER[t.kind].doc)} <b>${esc(t.docNo || "")}</b> · ${t.docDate ? fmtDate(t.docDate) : ""}${SEE_MONEY && t.amount != null ? " · " + rs2(t.amount) : ""}${t.doneBy ? " · entered by " + esc(t.doneBy) : ""}</div>`}</div>`;
}
ACT.xferSheet = () => {
  const all = D.transfers || [], pend = all.filter((t) => t.status === "Pending"), done = all.filter((t) => t.status !== "Pending").slice(0, 15);
  openSheet("Stock moved between SahiReach and quick commerce", `<div class="banner info">${ic("info", "sm")}<span><b>SahiReach stock → Swiggy / Zepto:</b> make a credit note. <b>Quick commerce stock → distributors:</b> a purchase invoice is pending. Enter each one here and it comes off the Home page.</span></div>
    ${pend.length ? `<div class="stack gap-12">${pend.map(xferCard).join("")}</div>` : `<div class="group"><div class="empty"><div class="big">Nothing pending</div>Every credit note and purchase invoice has been entered.</div></div>`}
    ${done.length ? `<div><div class="group-label"><span>Done</span></div><div class="stack gap-12">${done.map(xferCard).join("")}</div></div>` : ""}`, `<button class="btn btn-primary" data-act="closeSheet">Done</button>`, true);
};
ACT.xferSave = (el) => {
  const t = (D.transfers || []).find((x) => x.id === el.dataset.id); if (!t) return;
  const no = (($("#xf-no-" + t.id) || {}).value || "").trim(), dt = ($("#xf-dt-" + t.id) || {}).value || "", amtEl = $("#xf-amt-" + t.id), amt = amtEl ? numOrNull(amtEl.value) : null;
  const err = (m) => part("xf-err-" + t.id, `<div class="banner bad" style="margin-top:10px">${ic("alert", "sm")}<span>${esc(m)}</span></div>`);
  if (!no) return err(`Enter the ${XFER[t.kind].doc.toLowerCase()} number.`);
  if (!dt) return err("Enter the date.");
  if (amtEl && !(amt > 0)) return err("Enter the amount.");
  Object.assign(t, { status: "Done", docNo: no, docDate: dt, amount: amt, doneAt: iso(NOW()), doneBy: ME.name });
  logActivity(t.kind === "credit" ? "Credit note entered" : "Purchase invoice entered", no, `${nf(t.crates)} crates · ${t.ref || ""}`);
  render(); ACT.xferSheet(); toast(`${XFER[t.kind].doc} ${no} saved`);
};

/* ---------- distributor pick list: take some crates from quick commerce stock ---------- */
function pickQCHtml(P) {
  const rows = P.rows.map((r) => { const st = stockBySap[r.sap], q = qcBySap[r.sap]; return { r, st, q, qcCr: q ? Math.max(0, Math.floor((q.crates || 0) - qcHeld(r.sap).q + 1e-9)) : 0, short: st && st.upc && st.ea < -1e-9 ? -st.ea / st.upc : 0 }; }).filter((x) => x.qcCr >= 1);
  if (!rows.length) return "";
  const shortN = rows.filter((x) => x.short > 0).length, open = S.pickQCAll || shortN || Object.keys(P.qc || {}).length, shown = S.pickQCAll ? rows : rows.filter((x) => x.short > 0 || (P.qc || {})[x.r.sap]);
  return `<div class="card card-pad" style="margin-top:4px"><div class="hstack between wrap gap-8"><div><div class="card-title">Take from quick commerce stock</div><div class="row-sub">Crates taken here come off quick commerce stock and go to these distributors. A purchase invoice to SahiReach is then pending.</div></div>${!S.pickQCAll ? `<button class="btn btn-sm btn-secondary" data-act="pickQCAll">${open ? "Show all" : "Choose products"} (${rows.length})</button>` : ""}</div>
    ${shortN ? `<div class="banner warn" style="margin-top:12px">${ic("alert", "sm")}<span>SahiReach stock is short for ${shortN} product${shortN > 1 ? "s" : ""}. Quick commerce stock is filled in for ${shortN > 1 ? "them" : "it"}; change it if needed.</span></div>` : ""}
    ${shown.length ? `<div class="group" style="margin-top:12px">${shown.map((x) => `<div class="row" style="flex-wrap:wrap;gap:10px"><span class="grow" style="min-width:180px"><div class="row-title clip">${esc(shortName(x.r.name))}</div><div class="row-sub">Needed ${nf(x.r.total, 2)} · quick commerce has ${nf(x.qcCr)}${x.short > 0 ? ` · <span style="color:var(--warn);font-weight:600">SahiReach short by ${nf(x.short, 2)}</span>` : ""}${x.q.trop ? " · " + esc(x.q.trop) : ""}</div></span><span class="row-end"><input class="input sm num-in" style="width:76px" type="number" min="0" max="${Math.min(x.qcCr, Math.floor(x.r.total))}" step="1" value="${(P.qc || {})[x.r.sap] || 0}" data-in="pickQC" data-sap="${esc(x.r.sap)}" aria-label="Crates of ${esc(shortName(x.r.name))} from quick commerce stock"><span class="muted" style="font-size:13px">from QC</span></span></div>`).join("")}</div>` : ""}</div>`;
}
ACT.pickQCAll = () => { S.pickQCAll = true; showPick(false); };
IN.pickQC = (el) => {
  S.pickQC = S.pickQC || {}; const max = +el.max || 0; let v = Math.max(0, Math.floor(+el.value || 0)); if (v > max) { v = max; el.value = max; }
  S.pickQC[el.dataset.sap] = v; const keepDate = S.pickList && S.pickList.dispatchOn; S.pickList = buildPick(); if (keepDate) S.pickList.dispatchOn = keepDate;
  const t = $("#sheet .table-wrap"); if (t) t.outerHTML = pickTable(S.pickList, false);
};

/* ---------- confirm before a pick list goes out when stock crosses over ---------- */
function xferList(kind) {
  if (kind === "gt") { const P = S.pickList; return (P && pickKey(P) === pickedOrders().map((o) => o.id).sort().join("|") ? pickQCList(P) : orderQCMoves(pickedOrders())).map((x) => ({ name: x.name, n: x.n })); }
  return qcDelivery().rows.filter((r) => r.fromOwn > 0).map((r) => ({ name: r.name, n: r.fromOwn }));
}
function xferGuard(kind, next) {
  const list = xferList(kind); if (!list.length) return true;
  const sig = kind + JSON.stringify(list); if (S.xferOK === sig) return true;
  const target = ["xfer-confirm", "qc-confirm", "dispatch-confirm"].find((id) => document.getElementById(id) && (id !== "xfer-confirm" || sheetOpen)); if (!target) return true;
  const n = list.reduce((a, x) => a + x.n, 0);
  part(target, `<div class="banner warn" style="flex-wrap:wrap;margin-bottom:12px"><span class="grow" style="min-width:220px">${ic("alert", "sm")} <b>${kind === "qc" ? `${nf(n)} crate${n === 1 ? "" : "s"} will come from SahiReach stock` : `${nf(n)} crate${n === 1 ? "" : "s"} will come from quick commerce stock`}:</b> ${list.map((x) => `${nf(x.n)} × ${esc(shortName(x.name))}`).join(", ")}. ${kind === "qc" ? "A credit note will have to be made, and Home will remind you until it is entered." : "A purchase invoice will be pending, and Home will remind you until it is entered."}</span><span class="hstack gap-8"><button class="btn btn-sm btn-secondary" data-act="xferNo" data-t="${target}">Go back</button><button class="btn btn-sm btn-primary" data-act="xferOK" data-sig="${esc(sig)}" data-next="${next}" data-t="${target}">Yes, continue</button></span></div>`);
  const el = document.getElementById(target); if (el) el.scrollIntoView({ block: "nearest" });
  return false;
}
ACT.xferNo = (el) => part(el.dataset.t, "");
ACT.xferOK = (el) => { S.xferOK = el.dataset.sig; part(el.dataset.t, ""); const f = ACT[el.dataset.next]; if (f) f({ dataset: {} }); };
/* what happens when the stock actually moves */
{
  const dn = ACT.dispatchNow;
  ACT.dispatchNow = (el, e) => {
    /* what the pick list took from quick commerce stock; with no pick list, what the orders themselves were promised from it */
    const sel = pickedOrders(), P = S.pickList, moves = P && pickKey(P) === sel.map((o) => o.id).sort().join("|") ? pickQCList(P) : orderQCMoves(sel);
    dn(el, e);
    if (!moves.length) return;
    moves.forEach((m) => { const q = qcBySap[m.sap], st = stockBySap[m.sap]; if (q) { q.crates = (q.crates || 0) - m.n; q.ea = q.crates * (q.upc || 1); q.move = `${nf(m.n)} crates used for distributor dispatch`; } if (st && st.upc) { st.ea += m.n * st.upc; st.crates = st.ea / st.upc; st.pcs = st.ea * (st.ppe || 1); st.move = `${nf(m.n)} crates taken from quick commerce stock for dispatch`; } });
    xferAdd("purchase", `Dispatch to ${sel.map((o) => shortOf(o.dist)).join(", ")}`, moves.map((m) => ({ sap: m.sap, name: m.name, crates: m.n })));
    S.pickQC = null; S.xferOK = null; render();
  };
  const qd = ACT.qcDeliver;
  ACT.qcDeliver = (el, e) => {
    const Dl = qcDelivery(), own = Dl.rows.filter((r) => r.fromOwn > 0).map((r) => ({ sap: r.sap, name: r.name, crates: r.fromOwn })), plat = S.qcPlatform, pos = Dl.pos.map((p) => p.po).join(", ");
    qd(el, e);
    if (own.length && Dl.crates) { xferAdd("credit", `${plat} delivery · PO ${pos}`, own); S.xferOK = null; render(); }
  };
  [["emailPick", "gt"], ["copyPick", "gt"], ["dispatchNow", "gt"], ["emailQCPick", "qc"], ["qcPickCopy", "qc"], ["qcPickSent", "qc"], ["qcDeliver", "qc"], ["qcDeliverAsk", "qc"]].forEach(([a, k]) => { const f = ACT[a]; if (!f) return; ACT[a] = (el, e) => { if (!xferGuard(k, a)) return; return f(el, e); }; });
}

/* ===== ACTIVITY LOG WITH UNDO (system admin) =====
   Every save works out exactly what changed (field by field) and stores it, privately, against the activity
   entries made in that save. Changes made without an activity entry get an "Edited" entry of their own.
   Undo puts those fields back as they were, on the latest data; anything changed again since is listed first.
   Undoing is itself an activity, so it can be undone too (redo). Only the system admin can read the changes. */
const DIFF_ID = ["id", "po", "sap", "name", "time", "dist", "product"];
const diffHint = (el) => { if (!el || typeof el !== "object" || Array.isArray(el)) return null; const h = {}; let n = 0; DIFF_ID.forEach((k) => { const v = el[k]; if (v != null && typeof v !== "object") { h[k] = v; n++; } }); return n ? h : null; };
/* an empty list or record the app sets up by itself is not a change anyone made */
const isEmpty = (v) => v == null || (Array.isArray(v) ? !v.length : typeof v === "object" && !Object.keys(v).length);
const dKind = (v) => (Array.isArray(v) ? "arr" : v && typeof v === "object" ? "obj" : "val");
function deepEq(a, b) {
  if (a === b) return true; const ka = dKind(a), kb = dKind(b); if (ka !== kb || ka === "val") return false;
  if (ka === "arr") return a.length === b.length && a.every((x, i) => deepEq(x, b[i]));
  const A = Object.keys(a), B = Object.keys(b); return A.length === B.length && A.every((k) => k in b && deepEq(a[k], b[k]));
}
/* an element recorded by someone who could not see costs has those fields empty: they match anything */
function looks(rec, cur) {
  if (rec === null) return true; const k = dKind(rec); if (k !== dKind(cur)) return false; if (k === "val") return rec === cur;
  if (k === "arr") return rec.length === cur.length && rec.every((x, i) => looks(x, cur[i]));
  return Object.keys(rec).every((x) => looks(rec[x], cur[x]));
}
function wsDiff(a, b) {
  const ops = [];
  const walk = (x, y, p, h) => {
    if (x === y) return;
    const tx = dKind(x), ty = dKind(y);
    if (tx === "obj" && ty === "obj") {
      const keys = new Set(Object.keys(x).concat(Object.keys(y)));
      keys.forEach((k) => { if (!p.length && k === "activity") return; const q = p.concat([k]); if (!(k in y)) ops.push({ p: q, h, f: x[k], ta: 1 }); else if (!(k in x)) { if (!isEmpty(y[k])) ops.push({ p: q, h, fa: 1, t: y[k] }); } else walk(x[k], y[k], q, h); });
      return;
    }
    if (tx === "arr" && ty === "arr") {
      if (x.length === y.length) { for (let i = 0; i < x.length; i++) { if (x[i] === y[i]) continue; const hi = diffHint(y[i]); walk(x[i], y[i], p.concat([i]), hi ? Object.assign({}, h, { [p.length]: hi }) : h); } return; }
      /* items added or removed: keep the whole items */
      const sx = x.map((e) => JSON.stringify(e)), sy = y.map((e) => JSON.stringify(e)), cy = new Map(), cx = new Map(), rm = [], ad = [];
      sy.forEach((k) => cy.set(k, (cy.get(k) || 0) + 1)); sx.forEach((k) => cx.set(k, (cx.get(k) || 0) + 1));
      sx.forEach((k, i) => { const c = cy.get(k); if (c) cy.set(k, c - 1); else rm.push([i, x[i]]); });
      sy.forEach((k, i) => { const c = cx.get(k); if (c) cx.set(k, c - 1); else ad.push([i, y[i]]); });
      if (rm.length || ad.length) ops.push({ p, h, s: 1, rm, ad });
      return;
    }
    if (!deepEq(x, y)) ops.push({ p, h, f: x, t: y });
  };
  walk(a, b, [], {});
  return ops;
}
function dFind(arr, i, hint) {
  if (!hint) return i < arr.length ? i : -1;
  const m = (el) => el && typeof el === "object" && Object.keys(hint).every((k) => el[k] === hint[k]);
  return m(arr[i]) ? i : arr.findIndex(m);
}
/* follow a path in the latest data; an item in a list is found again by its id / name if it has moved */
function dWalk(root, p, h, upto) {
  let cur = root;
  for (let i = 0; i < upto; i++) {
    if (Array.isArray(cur)) { const j = dFind(cur, p[i], h && h[i]); if (j < 0) return undefined; cur = cur[j]; }
    else if (cur && typeof cur === "object") cur = cur[p[i]]; else return undefined;
  }
  return cur;
}
/* put one save's changes back (newest first); returns what had been changed again since */
function undoApply(root, ops) {
  const clash = [];
  for (let n = ops.length - 1; n >= 0; n--) {
    const op = ops[n];
    if (op.s) {
      const arr = dWalk(root, op.p, op.h, op.p.length); if (!Array.isArray(arr)) { clash.push(op); continue; }
      op.ad.slice().reverse().forEach(([i, el]) => { let j = i < arr.length && deepEq(arr[i], el) ? i : arr.findIndex((x) => deepEq(x, el)); if (j < 0) j = arr.findIndex((x) => looks(el, x)); if (j < 0) clash.push(op); else arr.splice(j, 1); });
      op.rm.forEach(([i, el]) => arr.splice(Math.min(i, arr.length), 0, JSON.parse(JSON.stringify(el))));
      continue;
    }
    const parent = dWalk(root, op.p, op.h, op.p.length - 1); if (!parent || typeof parent !== "object") { clash.push(op); continue; }
    let k = op.p[op.p.length - 1];
    if (Array.isArray(parent)) { k = dFind(parent, k, op.h && op.h[op.p.length - 1]); if (k < 0) { clash.push(op); continue; } }
    const has = k in parent, now = parent[k];
    if (op.ta ? has : !has || !deepEq(now, op.t)) clash.push(op);
    if (op.fa) { if (Array.isArray(parent)) parent.splice(k, 1); else delete parent[k]; } else parent[k] = JSON.parse(JSON.stringify(op.f));
  }
  return clash;
}
/* ---------- words for the changes ---------- */
const AREA = { orders: "Orders", orderLines: "Order lines", oos: "Missed sales", tod: "TOD", stock: "Stock", qcStock: "Quick commerce stock", qcPOs: "Quick commerce POs", qcLines: "Quick commerce PO lines", qcPick: "Quick commerce settings", qcPickLocks: "Sent QC pick lists", distributors: "Distributors", catalog: "Products", prices: "Prices", special: "Special prices", company: "Company details", purchases: "Stock received", hpo: "Hangyo orders", hpoLog: "Hangyo orders", repl: "Replenishment plan", logistics: "Logistics", transfers: "Credit notes / purchase invoices", notes: "Notes", pickSent: "Pick lists", slow: "Slow movers", orderAliases: "Order name matches", dash: "Dashboard", meta: "Settings" };
const areaOf = (op) => AREA[op.p[0]] || String(op.p[0] || "Data").replace(/^\w/, (c) => c.toUpperCase());
const opAreas = (ops) => [...new Set(ops.map(areaOf))];
const itemName = (el) => (el && typeof el === "object" ? (el.dist ? el.dist + (el.id ? " " + el.id : "") : el.name || el.product || el.po || el.id || "") : "");
const shortVal = (v) => (v === undefined ? "nothing" : v === null ? "empty" : typeof v === "object" ? "(details)" : typeof v === "number" ? nf(v, 2) : String(v).length > 40 ? String(v).slice(0, 40) + "…" : String(v));
const FIELD = { ea: "boxes", crates: "crates", qty: "quantity", status: "status", dispatched: "dispatched on", value: "value", valueGst: "value incl. GST", received: "received", amount: "amount", email: "email", phone: "phone", special: "special prices", credit: "credit days", price: "price", rate: "rate", cost: "cost", name: "name" };
const FIELD_QUIET = new Set(["pcs", "move", "updated", "timesEdited", "edited", "_", "delta"]);
/* the changes as short lines, one per item: "Stock · Berry & Cream: boxes 54 → 66, crates 9 → 11" */
function opLines(ops, root, back) {
  const g = new Map(), extra = [];
  ops.forEach((op) => {
    if (op.s) { extra.push(opWords(op, root, back)); return; }
    const field = op.p.slice(1).filter((x) => typeof x === "string").pop() || "";
    const w = opWords(op, root, back), i = w.lastIndexOf(": "), head = field ? w.slice(0, w.lastIndexOf(" · " + field)) || w.slice(0, i) : w.slice(0, i);
    if (FIELD_QUIET.has(field) && ops.length > 1) { if (!g.has(head)) g.set(head, []); return; }
    if (!g.has(head)) g.set(head, []); g.get(head).push(`${FIELD[field] || field} ${w.slice(i + 2)}`);
  });
  return [...g.entries()].map(([h, l]) => (l.length ? `${h}: ${l.join(", ")}` : `${h}: updated`)).concat(extra);
}
function opWords(op, root, back) {
  let item = "";
  for (let i = op.p.length - 1; i > 0 && !item; i--) { const el = dWalk(root, op.p, op.h, i); if (el && typeof el === "object" && !Array.isArray(el)) item = itemName(el); }
  if (!item && op.h) { const hs = Object.values(op.h); item = hs.length ? itemName(hs[hs.length - 1]) : ""; }
  const head = areaOf(op) + (item ? " · " + item : "");
  if (op.s) { const a = op.ad.map(([, e]) => itemName(e)).filter(Boolean), r = op.rm.map(([, e]) => itemName(e)).filter(Boolean); return `${head}: ${back ? `removes ${op.ad.length}${a.length ? " (" + a.slice(0, 3).join(", ") + ")" : ""}${op.rm.length ? `, puts back ${op.rm.length}${r.length ? " (" + r.slice(0, 3).join(", ") + ")" : ""}` : ""}` : `${op.ad.length ? "added " + op.ad.length + (a.length ? " (" + a.slice(0, 3).join(", ") + ")" : "") : ""}${op.ad.length && op.rm.length ? ", " : ""}${op.rm.length ? "removed " + op.rm.length + (r.length ? " (" + r.slice(0, 3).join(", ") + ")" : "") : ""}`}`; }
  const field = op.p.slice(1).filter((x) => typeof x === "string").pop() || "";
  return `${head}${field && field !== item ? " · " + field : ""}: ${back ? `${shortVal(op.ta ? undefined : op.t)} → ${shortVal(op.fa ? undefined : op.f)}` : `${shortVal(op.fa ? undefined : op.f)} → ${shortVal(op.ta ? undefined : op.t)}`}`;
}
/* ---------- recording (called from doSave) ---------- */
function undoPrep(s) {
  if (!HOST || !HOST.undoRecord || !SAVE.lastObj) return null;
  const n = JSON.parse(s), ops = wsDiff(SAVE.lastObj, n); if (!ops.length) return null;
  const old = new Set((SAVE.lastObj.activity || []).slice(0, 500).map((a) => a.id).filter(Boolean));
  let acts = (n.activity || []).slice(0, 300).filter((a) => a.id && !old.has(a.id)).map((a) => a.id), relog = false;
  if (!acts.length) {
    const ref = opAreas(ops).join(", "), top = D.activity[0];
    if (top && top.auto && top.id && top.by === ME.name && top.ref === ref && NOW() - toDate(top.time) < 10 * 60e3) acts = [top.id];
    else { const L = opLines(ops, n, false); logActivity("Edited", ref, L.slice(0, 3).join(" · ") + (L.length > 3 ? ` · and ${L.length - 3} more` : "")); D.activity[0].auto = true; acts = [D.activity[0].id]; relog = true; }
  }
  return { acts, ops, relog };
}
function undoSend(rec) {
  const q = SAVE.undoQ.splice(0).concat([rec]);
  q.forEach((r) => Promise.resolve().then(() => HOST.undoRecord(r.acts, r.ops)).catch(() => { if (SAVE.undoQ.length < 50) SAVE.undoQ.push(r); }));
  S.undoActs = null; /* the list of what can be undone is fetched again */
}
/* ---------- the Activity log screen ---------- */
const ACT_DAYS = { today: 0, week: 7, month: 30, all: null };
function actList() {
  const per = S.actPeriod || "week", days = ACT_DAYS[per], q = key(S.actQ || ""), who = S.actWho || "";
  const from = days == null ? "" : addDays(ymd(NOW()), -days);
  return D.activity.filter((a) => (SEE_MONEY || !/tod|trip|price|cost|ss rate/i.test(a.action)) && (!from || String(a.time).slice(0, 10) >= from) && (!who || (a.by || "") === who) && (!q || key([a.action, a.ref, a.detail, a.by].join(" ")).includes(q)));
}
function actRowHtml(a) {
  const undone = a.undone, can = ADMIN && HOST && a.id && S.undoActs && S.undoActs.has(a.id), redo = !!a.undoOf;
  const tone = /undone|undo/i.test(a.action) ? "warn" : /cancel/i.test(a.action) ? "bad" : /dispatch|delivered|received/i.test(a.action) ? "good" : /edited/i.test(a.action) ? "warn" : "tint";
  return `<div class="row" style="align-items:flex-start;${undone ? "opacity:.6" : ""}"><span class="avatar soft" title="${esc(a.by || "")}">${esc(initials(a.by || "–").slice(0, 2))}</span><span class="grow" style="min-width:0"><div class="row-title" style="white-space:normal"><span class="tl-dot ${tone}" style="display:inline-block;position:static;margin-right:6px;vertical-align:middle"></span>${esc(a.action)}${a.ref ? ` <span class="mono dim" style="font-size:12.5px">${esc(a.ref)}</span>` : ""}</div>${a.detail ? `<div class="row-sub" style="white-space:normal">${esc(a.detail)}</div>` : ""}<div class="row-sub dim">${fmtTime(a.time)} · <b>${esc(a.by || "Before sign-in")}</b>${undone ? ` · undone by ${esc(undone.by || "")} ${esc(fmtDT(undone.at))}` : ""}</div></span>
    <span class="row-end">${undone ? `<span class="pill plain warn">Undone</span>` : can ? `<button class="btn btn-sm btn-secondary" data-act="actUndo" data-id="${esc(a.id)}">${ic("undo", "sm")} ${redo ? "Redo" : "Undo"}</button>` : ""}</span></div>`;
}
function activityBody() {
  const all = actList(), shown = all.slice(0, S.actMax || 150), people = [...new Set(D.activity.map((a) => a.by).filter(Boolean))];
  const days = []; shown.forEach((a) => { const d = String(a.time).slice(0, 10); let g = days[days.length - 1]; if (!g || g.d !== d) days.push((g = { d, list: [] })); g.list.push(a); });
  if (ADMIN && HOST && HOST.undoActs && !S.undoActs && !S.undoLoading) { S.undoLoading = true; HOST.undoActs(iso(new Date(Date.now() - 120 * 864e5))).then((r) => { S.undoActs = new Set(Array.isArray(r) ? r : []); }, () => { S.undoActs = new Set(); }).then(() => { S.undoLoading = false; part("act-body", activityBody()); }); }
  return `<div id="act-body" class="stack gap-16">
    <div class="hstack gap-12 wrap">${seg("actPeriod", S.actPeriod || "week", [["today", "Today"], ["week", "7 days"], ["month", "30 days"], ["all", "All"]])}<div class="search" style="flex:1;min-width:200px">${ic("search", "sm")}<input class="input" id="act-q" type="search" placeholder="Search: order, product, distributor…" value="${esc(S.actQ || "")}" data-in="actQ" autocomplete="off"></div></div>
    ${people.length ? `<div class="hstack gap-8 wrap"><button class="chip" data-act="actWho" data-who="" aria-pressed="${!S.actWho}">Everyone</button>${people.map((p) => `<button class="chip" data-act="actWho" data-who="${esc(p)}" aria-pressed="${S.actWho === p}">${esc(p)}</button>`).join("")}</div>` : ""}
    ${ADMIN && HOST ? `<div class="banner info">${ic("undo", "sm")}<span>As system admin you can undo an entry: what it changed goes back to how it was. Entries from before ${esc(fmtDate("2026-11-23T00:00"))} have no undo.</span></div>` : ""}
    ${days.length ? days.map((g) => `<div><div class="group-label"><span>${esc(dayLabel(g.d + "T12:00"))} · ${esc(fmtDate(g.d + "T12:00"))}</span><span>${g.list.length}</span></div><div class="group">${g.list.map(actRowHtml).join("")}</div></div>`).join("") : `<div class="group"><div class="empty"><div class="big">Nothing here</div>Change the period, the person or the search.</div></div>`}
    ${all.length > shown.length ? `<button class="btn btn-secondary" data-act="actMore">Show more (${nf(all.length - shown.length)} older)</button>` : ""}</div>`;
}
VIEWS.activity = () => `<div class="page narrow"><div class="page-head"><div><h1 class="title">Activity log</h1><div class="subtitle">Who did what, and when.${ADMIN ? " You can undo any entry." : ""}</div></div></div>${activityBody()}</div>`;
const actRefresh = () => part("act-body", activityBody());
ACT.actWho = (el) => { S.actWho = el.dataset.who; S.actMax = 150; actRefresh(); };
ACT.actMore = () => { S.actMax = (S.actMax || 150) + 300; actRefresh(); };
IN.actQ = (el) => { S.actQ = el.value; clearTimeout(S.actQT); S.actQT = setTimeout(() => { actRefresh(); const i = $("#act-q"); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 200); };
/* ---------- undo ---------- */
ACT.actUndo = async (el) => {
  if (!ADMIN || !HOST || !HOST.undoGet) { toast("Only the system admin can undo", "alert"); return; }
  const a = D.activity.find((x) => x.id === el.dataset.id); if (!a) return;
  if (SAVE.busy || dirty()) { clearTimeout(SAVE.timer); await doSave(); }
  if (SAVE.conflict || dirty()) { toast("Your last change has not saved yet. Try again in a moment", "alert"); return; }
  let recs; try { recs = await HOST.undoGet(a.id); } catch (e) { toast((e && e.message) || "Could not load what this changed", "alert"); return; }
  if (!Array.isArray(recs) || !recs.length) { toast("There is nothing stored to undo for this entry", "info"); return; }
  const cur = JSON.parse(snapshot()), next = JSON.parse(JSON.stringify(cur)); let clash = [];
  recs.slice().reverse().forEach((r) => { clash = clash.concat(undoApply(next, r.ops || [])); });
  const ops = recs.flatMap((r) => r.ops || []), words = opLines(ops, cur, true);
  S.undoPlan = { id: a.id, next, cur };
  openSheet(a.undoOf ? "Redo this?" : "Undo this?", `<div class="card card-pad"><div class="row-title" style="white-space:normal">${esc(a.action)} ${a.ref ? `<span class="mono dim">${esc(a.ref)}</span>` : ""}</div>${a.detail ? `<div class="row-sub" style="white-space:normal">${esc(a.detail)}</div>` : ""}<div class="row-sub dim" style="margin-top:4px">${esc(fmtDT(a.time))} · ${esc(a.by || "")}</div></div>
    <div><div class="group-label"><span>This puts back</span><span>${nf(words.length)} item${words.length === 1 ? "" : "s"}</span></div><div class="group">${words.slice(0, 12).map((w) => `<div class="row"><span class="row-sub" style="white-space:normal;color:var(--ink)">${esc(w)}</span></div>`).join("")}${words.length > 12 ? `<div class="row"><span class="row-sub">…and ${nf(words.length - 12)} more</span></div>` : ""}</div></div>
    ${clash.length ? `<div class="banner warn">${ic("alert", "sm")}<span><b>${nf(clash.length)} of these ${clash.length === 1 ? "was" : "were"} changed again later</b> (${esc(opAreas(clash).join(", "))}). Undoing puts back the values from before this entry anyway. If a later entry depends on this one, undo that one first.</span></div>` : ""}
    <div class="row-sub">Everyone's screen picks up the change. The undo is logged, and can itself be undone.</div>`,
    `<button class="btn btn-secondary" data-act="closeSheet">Cancel</button><button class="btn btn-primary" data-act="actUndoYes">${ic("undo", "sm")} ${a.undoOf ? "Redo" : "Undo"}</button>`, true);
};
ACT.actUndoYes = async (el) => {
  const P = S.undoPlan; if (!P || !ADMIN) return;
  const a = P.next.activity.find((x) => x.id === P.id); if (!a) return;
  el.disabled = true;
  const at = iso(NOW()), id = "A" + Date.now().toString(36) + "u" + Math.random().toString(36).slice(2, 5);
  a.undone = { at, by: ME.name };
  if (a.undoOf) { const orig = P.next.activity.find((x) => x.id === a.undoOf); if (orig) delete orig.undone; }
  P.next.activity.unshift({ id, time: at, action: a.undoOf ? "Redone: " + a.action.replace(/^Undone: /, "") : "Undone: " + a.action, ref: a.ref, detail: `${a.by || "Someone"}'s entry of ${fmtDT(a.time)} was ${a.undoOf ? "redone" : "undone"}`, by: ME.name, undoOf: a.id });
  const ops = wsDiff(P.cur, P.next), s = JSON.stringify(P.next);
  SAVE.on = false; clearTimeout(SAVE.timer);
  try {
    const r = await HOST.save(s, SAVE.version);
    SAVE.version = r && typeof r.version === "number" ? r.version : SAVE.version + 1; SAVE.last = s;
    try { await HOST.undoRecord([id], ops); } catch (e) {}
    S.undoPlan = null; closeSheet(); toast(a.undoOf ? "Redone · reloading" : "Undone · reloading", "undo");
    setTimeout(() => { if (HOST.reload) HOST.reload(); else location.reload(); }, 700);
  } catch (e) {
    SAVE.on = true; el.disabled = false;
    const m = (e && e.message) || "";
    if (/CONFLICT/.test(m)) { SAVE.conflict = true; setSaveState("conflict"); conflictSheet(m); }
    else toast("Not undone: " + (m || "could not save"), "alert");
  }
};

/* ===== BACKUPS (system admin) =====
   The database keeps copies of all the tool's data: every hour (when something changed, for 3 days), every night
   (for 90 days), the first night of every month (kept), and before any restore or file upload. Every night the
   copy is also emailed to the system admin: an Excel workbook and the backup file that restores the tool.
   Here the admin sees every copy, downloads it as Excel or as a backup file, makes one now, or restores one. */
const BK_KIND = { hourly: "Hourly", daily: "Nightly", monthly: "Monthly", manual: "Made by hand", before_restore: "Before a restore", before_upload: "Before a file upload" };
const BK_SHEETS = [["orders", "Orders"], ["orderLines", "Order lines"], ["oos", "Missed sales"], ["stock", "Stock"], ["purchases", "Stock received"], ["hpoLog", "Hangyo orders"], ["qcStock", "QC stock"], ["qcPOs", "QC POs"], ["qcLines", "QC PO lines"], ["transfers", "Credit notes & PIs"], ["distributors", "Distributors"], ["catalog", "Products"], ["notes", "Credit & debit notes"], ["salesBefore", "Sales before the tool"], ["activity", "Activity log"]];
/* the same workbook as the nightly email: every list, one sheet each */
function backupSheets(data, takenAt, version) {
  const cellOf = (v) => (v == null ? null : typeof v === "object" ? JSON.stringify(v).slice(0, 30000) : typeof v === "string" ? v.slice(0, 30000) : v);
  const table = (list) => { const rows = (Array.isArray(list) ? list : []).filter((x) => x && typeof x === "object" && !Array.isArray(x)), cols = [], seen = new Set(); rows.forEach((r) => Object.keys(r).forEach((k) => { if (k[0] !== "_" && !seen.has(k)) { seen.add(k); cols.push(k); } })); return [cols].concat(rows.map((r) => cols.map((c) => cellOf(r[c])))); };
  const S2 = [];
  BK_SHEETS.forEach(([k, n]) => { if (Array.isArray(data[k]) && data[k].length) S2.push([n, table(data[k])]); });
  if (data.tod && Array.isArray(data.tod.lines)) S2.push(["TOD lines", table(data.tod.lines)]);
  if (data.tod && Array.isArray(data.tod.byDist)) S2.push(["TOD by distributor", table(data.tod.byDist)]);
  if (data.logistics && Array.isArray(data.logistics.trips)) S2.push(["Trips", table(data.logistics.trips)]);
  if (data.logistics && Array.isArray(data.logistics.transporters)) S2.push(["Transporters", table(data.logistics.transporters)]);
  if (data.repl && Array.isArray(data.repl.rows)) S2.push(["Replenishment", table(data.repl.rows)]);
  if (data.prices && typeof data.prices === "object") { const nm = {}; (data.catalog || []).forEach((c) => { if (c && c.sap) nm[c.sap] = c.name; }); S2.push(["Prices", [["SAP", "Product", "SS rate (our cost)", "Distributor rate", "Dealer rate", "MRP per box", "MRP per piece", "Special price"]].concat(Object.keys(data.prices).map((sap) => { const p = Array.isArray(data.prices[sap]) ? data.prices[sap] : []; return [sap, nm[sap] || "", p[0] ?? null, p[1] ?? null, p[2] ?? null, p[3] ?? null, p[4] ?? null, (data.special && data.special.prices && data.special.prices[sap]) ?? null]; }))]); }
  const about = [["SahiReach order tool: backup"], [], ["Taken", fmtDT(takenAt) + " (India time)"], ["Data version", version], [], ["What is in this file", "Every list in the tool, one sheet each. Costs and margins are included: keep this file private."], [], ["Sheet", "Rows"]].concat(S2.map(([n, a]) => [n, Math.max(0, a.length - 1)]));
  return [{ name: "About this backup", aoa: about, cols: [26, 90] }].concat(S2.map(([n, a]) => ({ name: n.slice(0, 31), aoa: a, cols: (a[0] || []).map(() => 16) })));
}
const bkDay = (t) => { const d = new Date(t); return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); };
async function bkLoad() {
  if (!HOST || !HOST.backupList) return;
  try { S.bk = await HOST.backupList(); S.bkErr = null; } catch (e) { S.bkErr = (e && e.message) || "Could not load the backups"; }
  if (S.route === "backups") part("bk-body", backupsBody());
}
function bkRowHtml(b) {
  const sure = S.bkSure === b.id;
  return `<div class="row" style="flex-wrap:wrap;gap:10px"><span class="attn-ic ${b.kind === "monthly" ? "good" : b.kind === "daily" ? "tint" : b.kind === "hourly" ? "info" : "warn"}" style="width:30px;height:30px">${ic(b.kind === "hourly" ? "clock" : b.kind === "daily" || b.kind === "monthly" ? "cal" : "lock", "sm")}</span>
    <span class="grow" style="min-width:180px"><div class="row-title">${esc(fmtDT(b.taken_at))}</div><div class="row-sub">${esc(BK_KIND[b.kind] || b.kind)} · ${nf(b.orders)} orders · version ${esc(b.version)}${b.by ? " · by " + esc(b.by) : ""}${b.note ? " · " + esc(b.note) : ""}</div></span>
    <span class="row-end hstack gap-8 wrap"><button class="btn btn-sm btn-secondary" data-act="bkExcel" data-id="${esc(b.id)}">${ic("doc", "sm")} Excel</button><button class="btn btn-sm btn-secondary" data-act="bkFile" data-id="${esc(b.id)}">Backup file</button><button class="btn btn-sm btn-secondary" data-act="bkRestoreAsk" data-id="${esc(b.id)}">${ic("undo", "sm")} Restore</button></span>
    ${sure ? `<div class="banner warn" style="flex-basis:100%;flex-wrap:wrap"><span class="grow" style="min-width:220px">${ic("alert", "sm")} <b>Put the whole tool back to ${esc(fmtDT(b.taken_at))}?</b> Everything done after that is undone for everyone. How it is right now is kept as a backup first, so you can come back.</span><span class="hstack gap-8"><button class="btn btn-sm btn-secondary" data-act="bkRestoreNo">Cancel</button><button class="btn btn-sm btn-primary" data-act="bkRestoreYes" data-id="${esc(b.id)}">Restore this copy</button></span></div>` : ""}</div>`;
}
function backupsBody() {
  if (!HOST) return `<div class="group"><div class="empty"><div class="big">Backups live in the database</div>Sign in at sahireach.com/staff-login to see them.</div></div>`;
  if (S.bkErr) return `<div class="banner bad">${ic("alert", "sm")}<span>${esc(S.bkErr)}</span></div>`;
  if (!S.bk) return `<div class="group"><div class="row"><span class="row-sub">Loading the backups…</span></div></div>`;
  const L = S.bk.backups || [], E = S.bk.emails || [], last = L[0], mail = E[0], n = (k) => L.filter((b) => b.kind === k).length;
  const groups = [["Made by hand and before restores", L.filter((b) => ["manual", "before_restore", "before_upload"].includes(b.kind))], ["Hourly · last 3 days, when something changed", L.filter((b) => b.kind === "hourly")], ["Nightly · last 90 days", L.filter((b) => b.kind === "daily")], ["Monthly · kept", L.filter((b) => b.kind === "monthly")]].filter((g) => g[1].length);
  return `<div class="card card-pad"><div class="hstack gap-12" style="align-items:flex-start"><span class="attn-ic good">${ic("lock")}</span><div class="grow">
      <div class="card-title">Your data is copied automatically</div>
      <div class="row-sub" style="margin-top:4px">Every hour when something changed · every night at 11:55 pm (emailed to you as Excel and a backup file) · the first night of every month, kept.</div>
      <div class="kv" style="margin-top:14px"><div><div class="k">Last copy</div><div class="v">${last ? esc(fmtDT(last.taken_at)) : "None yet"}</div></div><div><div class="k">Last backup email</div><div class="v">${mail ? `${esc(fmtDT(mail.at))} · ${mail.status === "sent" ? "sent" : `<span style="color:var(--bad)">not sent</span>`}` : "Tonight"}</div></div><div><div class="k">Copies kept</div><div class="v num">${nf(L.length)}</div></div><div><div class="k">Nightly · monthly</div><div class="v num">${nf(n("daily"))} · ${nf(n("monthly"))}</div></div></div>
      ${mail && mail.status !== "sent" ? `<div class="banner bad" style="margin-top:12px">${ic("alert", "sm")}<span>The last backup email was not sent: ${esc(mail.error || "unknown reason")}</span></div>` : ""}
    </div></div>
    <div class="hstack gap-8 wrap" style="margin-top:16px"><button class="btn btn-primary" data-act="bkNow">${ic("plus", "sm")} Make a copy now</button><button class="btn btn-secondary" data-act="bkFromFile">${ic("doc", "sm")} Restore from a file</button></div></div>
    ${groups.map(([t, list]) => `<div><div class="group-label"><span>${esc(t)}</span><span>${list.length}</span></div><div class="group">${list.slice(0, t.startsWith("Hourly") && !S.bkAllHourly ? 8 : 200).map(bkRowHtml).join("")}${t.startsWith("Hourly") && list.length > 8 && !S.bkAllHourly ? `<button class="row" data-act="bkAllHourly"><span class="row-sub">Show all ${list.length} hourly copies</span></button>` : ""}</div></div>`).join("")}`;
}
if (ADMIN) {
  ROUTES.backups = { label: "Backups", icon: "lock" };
  VIEWS.backups = () => { if (!S.bk && !S.bkErr && !S.bkLoading) { S.bkLoading = true; bkLoad().then(() => { S.bkLoading = false; }); } return `<div class="page narrow"><div class="page-head"><div><h1 class="title">Backups</h1><div class="subtitle">Copies of all the tool's data. Download any copy as Excel, or put the tool back to it.</div></div></div><div id="bk-body" class="stack gap-16">${backupsBody()}</div></div>`; };
}
ACT.bkAllHourly = () => { S.bkAllHourly = true; part("bk-body", backupsBody()); };
ACT.bkRestoreAsk = (el) => { S.bkSure = +el.dataset.id; part("bk-body", backupsBody()); };
ACT.bkRestoreNo = () => { S.bkSure = null; part("bk-body", backupsBody()); };
async function bkFetch(id) { let b = null; try { b = await HOST.backupGet(+id); } catch (e) { toast((e && e.message) || "Could not load that copy", "alert"); return null; } if (!b || !b.data) { toast("That copy could not be found", "alert"); return null; } return b; }
ACT.bkExcel = async (el) => {
  const b = await bkFetch(el.dataset.id); if (!b || !b.data) return;
  await downloadBook(el, backupSheets(b.data, b.taken_at, b.version), `SahiReach backup ${bkDay(b.taken_at)} ${pad2(new Date(b.taken_at).getHours())}${pad2(new Date(b.taken_at).getMinutes())}.xlsx`);
};
ACT.bkFile = async (el) => {
  const b = await bkFetch(el.dataset.id); if (!b || !b.data) return;
  const blob = new Blob([JSON.stringify({ kind: "sahireach-order-tool", js: typeof b.js === "string" ? b.js : "", data: b.data, as_of: b.taken_at, backup: { id: b.id, taken_at: b.taken_at, version: b.version } })], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `SahiReach-backup-${bkDay(b.taken_at)}.json`; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  toast("Backup file downloaded. Keep it private: it has costs and margins", "check");
};
ACT.bkNow = async (el) => {
  if (SAVE.busy || dirty()) { clearTimeout(SAVE.timer); await doSave(); }
  el.disabled = true;
  try { await HOST.backupNow("Made from the Backups screen"); toast("Copy made", "check"); S.bk = null; await bkLoad(); } catch (e) { toast((e && e.message) || "Could not make a copy", "alert"); }
  el.disabled = false;
};
async function bkGoBack(run, msg) {
  SAVE.on = false; clearTimeout(SAVE.timer);
  try { await run(); toast(msg, "undo"); setTimeout(() => { if (HOST.reload) HOST.reload(); else location.reload(); }, 800); }
  catch (e) { SAVE.on = true; toast((e && e.message) || "Could not restore", "alert"); }
}
ACT.bkRestoreYes = async (el) => {
  if (!ADMIN) return;
  if (SAVE.busy || dirty()) { clearTimeout(SAVE.timer); await doSave(); }
  if (SAVE.conflict) { toast("Someone else saved just now. Reload first, then restore", "alert"); return; }
  el.disabled = true; await bkGoBack(() => HOST.backupRestore(+el.dataset.id), "Restored · reopening");
};
ACT.bkFromFile = () => {
  if (!ADMIN || !HOST || !HOST.uploadWorkspace) return;
  const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json,application/json";
  inp.onchange = async () => {
    const f = inp.files && inp.files[0]; if (!f) return;
    let o; try { o = JSON.parse(await f.text()); } catch (e) { toast("That file could not be read. Choose a SahiReach backup file (.json)", "alert"); return; }
    if (!o || o.kind !== "sahireach-order-tool" || !o.data || !Array.isArray(o.data.orders)) { toast("That is not a SahiReach backup file", "alert"); return; }
    S.bkFile = f;
    openSheet("Restore from a file?", `<div class="banner warn">${ic("alert", "sm")}<span><b>Put the whole tool back to this file?</b> Everything done after it was made is undone for everyone. How the tool is right now is kept as a backup first.</span></div>
      <div class="card card-pad"><div class="kv"><div><div class="k">File</div><div class="v">${esc(f.name)}</div></div><div><div class="k">Data as of</div><div class="v">${o.as_of ? esc(fmtDT(o.as_of)) : "Not stated"}</div></div><div><div class="k">Orders in it</div><div class="v num">${nf(o.data.orders.length)}</div></div><div><div class="k">Orders now</div><div class="v num">${nf(D.orders.length)}</div></div></div></div>`,
      `<button class="btn btn-secondary" data-act="closeSheet">Cancel</button><button class="btn btn-primary" data-act="bkFileYes">${ic("undo", "sm")} Restore this file</button>`);
  };
  inp.click();
};
ACT.bkFileYes = async (el) => {
  if (!ADMIN || !S.bkFile) return;
  if (SAVE.busy || dirty()) { clearTimeout(SAVE.timer); await doSave(); }
  el.disabled = true; await bkGoBack(() => HOST.uploadWorkspace(S.bkFile), "Restored from the file · reopening");
};

/* ===== CREDIT AND DEBIT NOTES, WITH PRODUCTS =====
   A sales return lists each product returned: quantity (crates, boxes or pieces), the rate (what that distributor was
   last billed, which can be changed) and whether it came back Good or Damaged. The value of each line and the note's
   total (excl. GST, GST, incl. GST) are worked out as you type. Saved notes count on the dashboard on their date:
   returns and rate-difference credit notes reduce sales, a debit note to a distributor adds to them; Hangyo's notes
   do not touch sales. Good returns can go back into SahiReach stock; a purchase return to Hangyo can come out of it. */
const NOTE_TYPES = ["Sales return - credit note to distributor", "Rate difference - credit note to distributor", "Rate difference - debit note to distributor", "Purchase return - debit note to Hangyo", "Hangyo credit note (value only)"];
const NOTE_REASONS = ["Damaged", "Expired / near expiry", "Melted / cold chain issue", "Wrong or excess supply", "Quality complaint", "Rate difference", "TOD / special price", "Scheme", "Other"];
const ntKind = (t) => (/^sales return/i.test(t) ? "return" : /^purchase return/i.test(t) ? "preturn" : /^rate difference - credit/i.test(t) ? "rcredit" : /^rate difference - debit/i.test(t) ? "rdebit" : "hangyo");
const ntHasLines = (k) => k === "return" || k === "preturn";
const ntToHangyo = (k) => k === "preturn" || k === "hangyo";
/* sales: a credit note to a distributor takes sales off, a debit note adds; notes with Hangyo do not change sales */
const ntSalesSign = (k) => (k === "return" || k === "rcredit" ? -1 : k === "rdebit" ? 1 : 0);
const ntUnitsOf = (sap) => { const st = stockBySap[sap] || {}, c = catBySap[sap] || {}; return { upc: st.upc || c.upc || null, ppe: st.ppe || c.ppe || 1 }; };
/* the rate on the note: what this distributor was last billed for it, else their price list rate (special price if they have one) */
function ntRate(sap, dist, k) {
  if (k === "preturn") return ssRate(sap);
  const last = D.orders.filter((o) => o.dist === dist && o.status !== "Cancelled").sort((a, b) => (a.time < b.time ? 1 : -1)).map((o) => (linesByOrder[o.id] || []).find((l) => l.sap === sap && l.billed > 0)).find(Boolean);
  if (last) return last.billed;
  const r = impRateFor(sap, dist); return r != null ? r : price(sap);
}
function ntCalc(l) {
  const u = ntUnitsOf(l.sap), q = +l.qty || 0;
  const ea = l.unit === "Crate" ? q * (u.upc || 0) : l.unit === "Pieces" ? q / (u.ppe || 1) : q;
  const value = Math.round(ea * (+l.rate || 0) * 100) / 100;
  return { ea: Math.round(ea * 1000) / 1000, crates: u.upc ? Math.round((ea / u.upc) * 1000) / 1000 : null, value };
}
const ntQtyTxt = (c) => `${c.crates != null ? nf(c.crates, 2) + (c.crates === 1 ? " crate · " : " crates · ") : ""}${nf(c.ea, 2)} ${c.ea === 1 ? "box" : "boxes"}`;
function ntTotals() {
  const N = S.nt, k = ntKind(N.type);
  const amt = ntHasLines(k) ? Math.round(N.lines.reduce((a, l) => a + ntCalc(l).value, 0) * 100) / 100 : Math.round((+N.amount || 0) * 100) / 100;
  return { amt, gst: Math.round(amt * 5) / 100, total: Math.round(amt * 105) / 100 };
}
function ntLineHtml(l, i) {
  const k = ntKind(S.nt.type), c = ntCalc(l), cat = catBySap[l.sap] || {};
  return `<div class="row" style="flex-wrap:wrap;gap:10px;align-items:center">
    <span class="grow" style="min-width:200px"><div class="row-title" style="white-space:normal">${esc(cat.name || l.product)}</div><div class="row-sub" id="nt-sub-${i}">${ntQtyTxt(c)}</div></span>
    <input class="input sm num-in" style="width:76px" type="number" min="0" step="any" inputmode="decimal" value="${esc(l.qty)}" data-in="ntLine" data-i="${i}" data-f="qty" aria-label="Quantity">
    <select class="select sm" style="width:auto" data-in="ntLine" data-i="${i}" data-f="unit" aria-label="Unit">${[["Crate", "Crates"], ["EA (Box)", "Boxes"], ["Pieces", "Pieces"]].map(([v, t]) => `<option value="${v}" ${l.unit === v ? "selected" : ""}>${t}</option>`).join("")}</select>
    <span class="hstack gap-8"><span class="row-sub">₹</span><input class="input sm num-in" style="width:96px" type="number" min="0" step="0.01" inputmode="decimal" value="${l.rate != null ? esc(l.rate) : ""}" placeholder="per box" data-in="ntLine" data-i="${i}" data-f="rate" aria-label="Rate per box"><span class="row-sub">/ box</span></span>
    ${k === "return" ? `<select class="select sm" style="width:auto" data-in="ntLine" data-i="${i}" data-f="cond" aria-label="Condition"><option ${l.cond !== "Damaged" ? "selected" : ""}>Good</option><option ${l.cond === "Damaged" ? "selected" : ""}>Damaged</option></select>` : ""}
    <span class="row-value num" style="min-width:96px;text-align:right" id="nt-v-${i}">${rs2(c.value)}</span>
    <button class="icon-btn" data-act="ntRm" data-i="${i}" aria-label="Remove">${ic("trash", "sm")}</button></div>`;
}
function ntTotalHtml() {
  const N = S.nt, k = ntKind(N.type), T = ntTotals(), sg = ntSalesSign(k);
  return `<div class="sum-row"><span class="muted">Value excl. GST</span><b class="num">${rs2(T.amt)}</b></div><div class="sum-row"><span class="muted">GST 5%</span><span class="num">${rs2(T.gst)}</span></div><div class="sum-row total"><span>Total incl. GST</span><span class="num">${rs2(T.total)}</span></div>
    <div class="row-sub" style="margin-top:8px">${sg < 0 ? `Takes ${rs2(T.amt)} off ${esc(shortOf(N.party || ""))}'s sales on ${fmtDate(N.date)}.` : sg > 0 ? `Adds ${rs2(T.amt)} to ${esc(shortOf(N.party || ""))}'s sales on ${fmtDate(N.date)}.` : "A note with Hangyo: sales do not change."}${k === "return" && N.trip ? " " + ntTripTxt(N, T.amt, Math.round(N.lines.reduce((a, l) => a + (ntCalc(l).crates || 0), 0) * 100) / 100) : ""}</div>`;
}
function ntBody() {
  const N = S.nt, k = ntKind(N.type), lines = ntHasLines(k);
  const good = N.lines.filter((l) => l.cond !== "Damaged").length;
  return `<div class="card card-pad"><div class="form-grid">
      <div class="field full"><label class="label" for="nt-type">Note type</label><select class="select" id="nt-type" data-in="ntF" data-f="type">${NOTE_TYPES.map((t) => `<option ${t === N.type ? "selected" : ""}>${esc(t)}</option>`).join("")}</select></div>
      ${ntToHangyo(k) ? `<div class="field"><div class="label">With</div><div class="input" style="display:flex;align-items:center">Hangyo</div></div>` : `<div class="field"><label class="label" for="nt-party">Distributor</label><select class="select" id="nt-party" data-in="ntF" data-f="party">${D.distributors.map((d) => `<option ${d.name === N.party ? "selected" : ""}>${esc(d.name)}</option>`).join("")}</select></div>`}
      <div class="field"><label class="label" for="nt-date">Note date</label><input class="input" id="nt-date" type="date" value="${esc(N.date)}" data-in="ntF" data-f="date"></div>
      <div class="field"><label class="label" for="nt-no">Note number (Vyapar or Hangyo)</label><input class="input" id="nt-no" value="${esc(N.no)}" placeholder="SR/CN26-27/12" data-in="ntF" data-f="no"></div>
      <div class="field"><label class="label" for="nt-reason">Reason</label><select class="select" id="nt-reason" data-in="ntF" data-f="reason">${NOTE_REASONS.map((t) => `<option ${t === N.reason ? "selected" : ""}>${t}</option>`).join("")}</select></div>
      ${k === "return" ? ntTripField(N) : ""}
      ${lines ? "" : `<div class="field full"><label class="label" for="nt-amt">Amount excl. GST (₹)</label><input class="input num-in" id="nt-amt" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00" value="${N.amount != null ? esc(N.amount) : ""}" data-in="ntF" data-f="amount"></div>`}
    </div></div>
    ${lines ? `<div><div class="group-label"><span>Products ${k === "return" ? "returned" : "sent back to Hangyo"}</span><span>${N.lines.length}</span></div>
      <div class="search">${ic("search", "sm")}<input class="input" id="nt-q" type="search" placeholder="Add a product: search by name" value="${esc(N.q || "")}" data-in="ntQ" autocomplete="off"></div>
      <div id="nt-res">${ntResults()}</div>
      <div class="group" id="nt-lines" style="margin-top:10px">${N.lines.length ? N.lines.map(ntLineHtml).join("") : `<div class="empty">No products yet. Search above to add them.</div>`}</div>
      ${k === "return" ? `<label class="row" style="cursor:pointer;margin-top:10px;padding:10px 12px;border-radius:12px;background:var(--fill)"><input type="checkbox" data-in="ntBack" ${N.back ? "checked" : ""} style="width:20px;height:20px;accent-color:var(--tint)"><span class="grow"><div class="row-title">Put the Good products back into SahiReach stock</div><div class="row-sub">${good ? `${good} product${good > 1 ? "s" : ""} marked Good` : "Nothing marked Good"} · Damaged ones are not added to stock and their cost counts as a loss</div></span></label>` : `<label class="row" style="cursor:pointer;margin-top:10px;padding:10px 12px;border-radius:12px;background:var(--fill)"><input type="checkbox" data-in="ntBack" ${N.back ? "checked" : ""} style="width:20px;height:20px;accent-color:var(--tint)"><span class="grow"><div class="row-title">Take these out of SahiReach stock</div><div class="row-sub">Untick if the stock was already adjusted</div></span></label>`}</div>` : ""}
    <div class="card card-pad" id="nt-total">${ntTotalHtml()}</div>
    <div class="row-sub">Raise the GST note in Vyapar as usual; this records it in the tool.</div>
    <div id="nt-err"></div>`;
}
function ntResults() {
  const q = (S.nt.q || "").trim(); if (q.length < 2) return "";
  const list = searchProducts(q, 8);
  if (!list.length) return `<div class="row-sub" style="padding:8px 4px">Nothing matches “${esc(q)}”.</div>`;
  return `<div class="results" style="position:static;margin-top:6px">${list.map((x) => `<button class="res" data-act="ntAdd" data-sap="${esc(x.c.sap)}"><span class="grow"><div class="row-title">${esc(x.c.name)}</div><div class="row-sub">${esc(x.c.cat || "")}</div></span>${ic("plus", "sm dim")}</button>`).join("")}</div>`;
}
const ntRedraw = () => { const sc = $("#sheet .sheet-body") || $("#sheet"), y = sc ? sc.scrollTop : 0; part("nt-body", ntBody()); if (sc) sc.scrollTop = y; };
ACT.noteSheet = () => {
  const d = D.distributors[0] || {};
  S.nt = { type: NOTE_TYPES[0], party: d.name || "", date: ymd(NOW()), no: "", reason: "Damaged", amount: null, lines: [], back: true, q: "", trip: "" };
  S.nt.trip = ntTripDefault(S.nt.party, S.nt.date);
  openSheet("New credit or debit note", `<div id="nt-body" class="stack gap-16">${ntBody()}</div>`, `<button class="btn btn-secondary" data-act="closeSheet">Cancel</button><button class="btn btn-primary" data-act="noteSave">Save note</button>`, true);
};
IN.ntF = (el) => {
  const N = S.nt, f = el.dataset.f, before = ntKind(N.type);
  N[f] = f === "amount" ? (el.value === "" ? null : +el.value) : el.value;
  if (f === "type") { const k = ntKind(N.type); if (k !== before) { N.back = true; if (k === "rcredit" || k === "rdebit") N.reason = "Rate difference"; N.lines.forEach((l) => { l.rate = ntRate(l.sap, N.party, k); }); } ntRedraw(); return; }
  if (f === "trip") { N.tripTyped = true; part("nt-total", ntTotalHtml()); return; }
  if ((f === "party" || f === "date") && !N.tripTyped) N.trip = ntTripDefault(N.party, N.date);
  if (f === "date") { const sel = $("#nt-trip"); if (sel) sel.innerHTML = tripOpts(N.party, N.date, N.trip || ""); part("nt-total", ntTotalHtml()); return; }
  if (f === "party") { N.lines.forEach((l) => { if (!l.rateTyped) l.rate = ntRate(l.sap, N.party, ntKind(N.type)); }); ntRedraw(); return; }
  part("nt-total", ntTotalHtml());
};
IN.ntQ = (el) => { S.nt.q = el.value; part("nt-res", ntResults()); };
IN.ntBack = (el) => { S.nt.back = el.checked; };
ACT.ntAdd = (el) => {
  const N = S.nt, sap = el.dataset.sap, k = ntKind(N.type), ex = N.lines.find((l) => l.sap === sap);
  if (ex) ex.qty = (+ex.qty || 0) + 1;
  else { const r = ntRate(sap, N.party, k); N.lines.push({ sap, product: (catBySap[sap] || {}).name || sap, qty: 1, unit: "EA (Box)", rate: r != null ? Math.round(r * 100) / 100 : null, cond: "Good" }); }
  N.q = ""; ntRedraw();
  const q = $("#nt-q"); if (q) q.focus({ preventScroll: true });
};
ACT.ntRm = (el) => { S.nt.lines.splice(+el.dataset.i, 1); ntRedraw(); };
IN.ntLine = (el) => {
  const N = S.nt, i = +el.dataset.i, l = N.lines[i], f = el.dataset.f; if (!l) return;
  if (f === "qty") l.qty = el.value === "" ? "" : Math.max(0, +el.value);
  else if (f === "rate") { l.rate = el.value === "" ? null : Math.max(0, +el.value); l.rateTyped = true; }
  else l[f] = el.value;
  if (f === "cond") { ntRedraw(); return; }
  const c = ntCalc(l), v = $("#nt-v-" + i), sub = $("#nt-sub-" + i);
  if (v) v.textContent = rs2(c.value); if (sub) sub.textContent = ntQtyTxt(c);
  part("nt-total", ntTotalHtml());
};
/* stock: a Good return goes back on the shelf; a purchase return to Hangyo comes off it */
function ntStock(n, dir) {
  (n.lines || []).forEach((l) => {
    if (!l.stocked) return; const st = stockBySap[l.sap]; if (!st || !st.upc) return;
    const ea = dir * l.stocked; st.ea += ea; st.crates = st.ea / st.upc; st.pcs = st.ea * (st.ppe || 1);
    st.move = `${n.no || n.id} (${n.party}): ${ea >= 0 ? "+" : ""}${nf(ea / st.upc, 2)} crates${dir < 0 ? " (note cancelled)" : ""}`;
  });
}
ACT.noteSave = () => {
  const N = S.nt, k = ntKind(N.type), T = ntTotals(), err = (m) => part("nt-err", `<div class="banner bad">${ic("alert", "sm")}<span>${esc(m)}</span></div>`);
  if (!N.date) return err("Add the note date.");
  if (!ntToHangyo(k) && !N.party) return err("Choose the distributor.");
  if (ntHasLines(k)) {
    const used = N.lines.filter((l) => +l.qty > 0);
    if (!used.length) return err("Add at least one product with a quantity.");
    if (used.some((l) => !(+l.rate > 0))) return err("Every product needs a rate per box.");
  }
  if (!(T.amt > 0)) return err("The note's value is zero. Add the products or the amount.");
  const sg = ntSalesSign(k), base = "CN-" + stamp(NOW()); let id = base, j = 1; while (D.notes.some((x) => x.id === id)) id = base + "-" + ++j;
  const lines = ntHasLines(k) ? N.lines.filter((l) => +l.qty > 0).map((l) => { const c = ntCalc(l), back = k === "return" ? !!N.back && l.cond !== "Damaged" : !!N.back; return { sap: l.sap, product: (catBySap[l.sap] || {}).name || l.product, qty: +l.qty, unit: l.unit, ea: c.ea, crates: c.crates, rate: +l.rate, value: c.value, cond: k === "return" ? l.cond || "Good" : null, back: k === "return" && back, stocked: back && stockBySap[l.sap] && stockBySap[l.sap].upc ? (k === "preturn" ? -c.ea : c.ea) : 0 }; }) : null;
  const n = { id, type: N.type, no: N.no.trim(), date: N.date + "T00:00", party: ntToHangyo(k) ? "Hangyo" : N.party, reason: N.reason, amount: T.amt, gst: T.gst, total: T.total, sales: sg * T.amt, status: "Active", by: ME.name, time: iso(NOW()) };
  if (lines) {
    Object.assign(n, { lines, product: lines.length === 1 ? lines[0].product : `${lines.length} products`, ea: Math.round(lines.reduce((a, l) => a + l.ea, 0) * 1000) / 1000, crates: Math.round(lines.reduce((a, l) => a + (l.crates || 0), 0) * 1000) / 1000 });
    const moved = lines.filter((l) => l.stocked);
    n.stock = moved.length ? `${k === "preturn" ? "Taken out of" : "Put back into"} SahiReach stock: ${moved.map((l) => `${nf(Math.abs(l.stocked) / ((stockBySap[l.sap] || {}).upc || 1), 2)} cr ${shortName(l.product)}`).join(", ")}` : "No stock change";
    ntStock(n, 1);
  } else n.stock = "No stock change";
  if (k === "return" && N.trip && tripById(N.trip)) noteTripSet(n, N.trip);
  D.notes.push(n);
  logActivity("Note saved", n.no || n.id, `${String(n.type).split(" - ")[0]} · ${n.party} · ${rs2(n.amount)}${lines ? ` · ${lines.length} product${lines.length > 1 ? "s" : ""}` : ""}${sg ? ` · sales ${sg < 0 ? "−" : "+"}${rs2(n.amount)}` : ""}`);
  S.nt = null; S.moneyTab = "notes"; closeSheet(); render();
  toast(`Note saved · ${rs2(n.amount)}${sg < 0 ? " taken off sales" : sg > 0 ? " added to sales" : ""}`, "check");
};
/* a saved note: its products, and cancelling it (stock changes reversed, it stops counting in sales) */
ACT.noteOpen = (el, e, confirmCancel) => {
  const n = D.notes.find((x) => x.id === el.dataset.id); if (!n) return;
  const k = ntKind(n.type), L = Array.isArray(n.lines) ? n.lines : null;
  openSheet(esc(String(n.type).split(" - ")[0]) + (n.no ? " · " + esc(n.no) : ""), `<div class="card card-pad"><div class="kv">
      <div><div class="k">${ntToHangyo(k) ? "With" : "Distributor"}</div><div class="v">${esc(n.party || "Hangyo")}</div></div><div><div class="k">Date</div><div class="v">${fmtDate(n.date)}</div></div>
      <div><div class="k">Type</div><div class="v">${esc(n.type)}</div></div><div><div class="k">Reason</div><div class="v">${esc(n.reason || "–")}</div></div>
      <div><div class="k">Value excl. GST</div><div class="v num">${rs2(n.amount)}</div></div><div><div class="k">Total incl. GST</div><div class="v num">${rs2(n.total != null ? n.total : n.amount * 1.05)}</div></div>
      <div><div class="k">Sales</div><div class="v">${n.status !== "Active" ? "Not counted (cancelled)" : n.sales ? (n.sales < 0 ? "−" : "+") + rs2(Math.abs(n.sales)) : "No change"}</div></div><div><div class="k">Stock</div><div class="v" style="font-size:14px">${esc(n.stock || "–")}</div></div></div></div>
    ${L ? `<div><div class="group-label"><span>Products</span><span>${L.length}</span></div><div class="group">${L.map((l) => `<div class="row"><span class="grow"><div class="row-title" style="white-space:normal">${esc(l.product)}</div><div class="row-sub">${nf(l.qty, 2)} ${esc(l.unit === "Crate" ? "crates" : l.unit === "Pieces" ? "pieces" : "boxes")} · ${nf(l.ea, 2)} boxes × ${rs2(l.rate)}${l.cond ? " · " + esc(l.cond) : ""}${l.stocked ? (l.stocked > 0 ? " · back in stock" : " · out of stock") : ""}</div></span><span class="row-end"><span class="row-value">${rs2(l.value)}</span></span></div>`).join("")}</div></div>` : n.product ? `<div class="group"><div class="row"><span class="grow"><div class="row-title">${esc(n.product)}</div>${n.qty ? `<div class="row-sub">${nf(n.qty)} ${esc(n.unit || "")}${n.rate ? " × " + rs2(n.rate) : ""}</div>` : ""}</span></div></div>` : ""}
    ${ntTripView(n)}
    ${confirmCancel ? `<div class="confirm"><span><b>Cancel this note?</b> It stops counting in sales${L && L.some((l) => l.stocked) ? " and its stock change is reversed" : ""}.</span><span class="hstack gap-8"><button class="btn btn-sm btn-secondary" data-act="noteOpen" data-id="${esc(n.id)}">Keep it</button><button class="btn btn-sm btn-danger" data-act="noteCancelYes" data-id="${esc(n.id)}">Cancel note</button></span></div>` : ""}`,
    n.status === "Active" && CAN_EDIT ? `<button class="btn btn-danger" data-act="noteCancelAsk" data-id="${esc(n.id)}">Cancel note</button><button class="btn btn-primary" data-act="closeSheet">Done</button>` : `<button class="btn btn-primary" data-act="closeSheet">Done</button>`, true);
};
ACT.noteCancelAsk = (el) => ACT.noteOpen(el, null, true);
ACT.noteCancelYes = (el) => {
  const n = D.notes.find((x) => x.id === el.dataset.id); if (!n || n.status !== "Active") return;
  if (Array.isArray(n.lines)) ntStock(n, -1);
  if (n.trip && n.tripAdj) tripApply(n, -1); /* the trip gets its revenue and crates back */
  n.status = "Cancelled"; n.cancelled = { at: iso(NOW()), by: ME.name };
  logActivity("Note cancelled", n.no || n.id, `${String(n.type).split(" - ")[0]} · ${n.party} · ${rs2(n.amount)}`);
  closeSheet(); render(); toast("Note cancelled", "undo");
};

/* ===== TRIPS, SALES RETURNS AND RE-BILLED GOODS =====
   Goods that went out on a vehicle and came back on a sales return credit note are taken off that trip: the note
   asks which trip carried them, and its value (excl. GST) and crates come off that trip's revenue and crates.
   When the same goods are billed to someone else, that dispatch did not need a new vehicle: it can be added to
   any earlier trip ("same vehicle"), which adds its value and crates there instead of asking for a new trip. */
const tripById = (id) => (id ? logi().trips.find((t) => t.id === id) || null : null);
const tripLbl = (t) => `${fmtDate(t.date)} · ${t.sellers || "–"}${t.transporter ? " · " + t.transporter : ""}`;
function tripCredits(id) {
  const out = { amt: 0, crates: 0, n: 0, list: [] }; if (!id) return out;
  (D.notes || []).forEach((x) => { if (x.trip === id && x.status === "Active" && x.tripAdj) { out.amt += x.tripAdj.amt || 0; out.crates += x.tripAdj.crates || 0; out.n++; out.list.push(x); } });
  return out;
}
/* take a note off its trip (dir 1) or put it back (dir -1) */
function tripApply(n, dir) {
  const t = tripById(n.trip); if (!t || !n.tripAdj) return;
  if (t.revenue != null) t.revenue = Math.round((t.revenue - dir * (n.tripAdj.amt || 0)) * 100) / 100;
  if (t.crates != null) t.crates = Math.round((t.crates - dir * (n.tripAdj.crates || 0)) * 10) / 10;
}
function noteTripSet(n, id) {
  if (n.trip && n.tripAdj && n.status === "Active") tripApply(n, -1);
  n.trip = id || null; n.tripAdj = id ? { amt: n.amount || 0, crates: Math.round((n.crates || 0) * 1000) / 1000 } : null;
  if (id && n.status === "Active") tripApply(n, 1);
}
function tripUnlinkNotes(id) { (D.notes || []).forEach((n) => { if (n.trip === id) { n.trip = null; n.tripAdj = null; } }); }
/* trips a note could belong to: the ones that carried this distributor first, then others around the note date */
function tripChoices(party, date) {
  const d = String(date || ymd(NOW())).slice(0, 10), lo = addDays(d, -45), hi = addDays(d, 7);
  const carried = (t) => (t.orders || []).some((id) => { const o = orderById(id); return o && o.dist === party; });
  return logi().trips.map((t) => ({ t, mine: !!party && carried(t) })).filter((x) => x.mine || (x.t.date >= lo && x.t.date <= hi))
    .sort((a, b) => b.mine - a.mine || (a.t.date < b.t.date ? 1 : a.t.date > b.t.date ? -1 : 0)).slice(0, 40);
}
function ntTripDefault(party, date) {
  const d = String(date || ymd(NOW())).slice(0, 10), C = tripChoices(party, d).filter((c) => c.mine);
  const x = C.find((c) => c.t.date <= d) || C[0]; return x ? x.t.id : "";
}
function tripOpts(party, date, sel) {
  const C = tripChoices(party, date); if (sel && !C.some((c) => c.t.id === sel)) { const t = tripById(sel); if (t) C.unshift({ t, mine: false }); }
  const o = (c) => `<option value="${esc(c.t.id)}" ${c.t.id === sel ? "selected" : ""}>${esc(tripLbl(c.t))}</option>`, mine = C.filter((c) => c.mine), rest = C.filter((c) => !c.mine);
  return `<option value="" ${!sel ? "selected" : ""}>No trip: do not adjust any vehicle</option>${mine.length ? `<optgroup label="Trips that carried ${esc(shortOf(party || ""))}">${mine.map(o).join("")}</optgroup>` : ""}${rest.length ? `<optgroup label="Other trips around this date">${rest.map(o).join("")}</optgroup>` : ""}`;
}
function ntTripField(N) {
  const none = !logi().trips.length;
  return `<div class="field full"><label class="label" for="nt-trip">Which trip (vehicle) carried these goods?</label><select class="select" id="nt-trip" data-in="ntF" data-f="trip" ${none ? "disabled" : ""}>${tripOpts(N.party, N.date, N.trip || "")}</select><div class="row-sub" style="margin-top:6px">${none ? "No trips logged yet." : "The returned value and crates come off that trip, so its logistics % stays right. If the goods are billed to someone else, add that dispatch to the same trip."}</div></div>`;
}
const ntTripTxt = (N, amt, crates) => { const t = tripById(N.trip); return t ? `Also takes ${rs2(amt)}${crates ? ` and ${nf(crates, 2)} crates` : ""} off the trip of ${esc(tripLbl(t))}.` : ""; };
/* a saved note: see or change its trip */
function ntTripView(n) {
  if (ntKind(n.type) !== "return") return "";
  const t = tripById(n.trip), info = t ? `Takes ${rs2((n.tripAdj || {}).amt || 0)}${(n.tripAdj || {}).crates ? ` and ${nf(n.tripAdj.crates, 2)} crates` : ""} off this trip's revenue and crates.` : "Not adjusted against any trip.";
  if (n.status === "Active" && CAN_EDIT) return `<div class="card card-pad"><div class="field"><label class="label" for="nt-trip-x">Trip (vehicle) this return is adjusted against</label><select class="select" id="nt-trip-x" data-in="noteTrip" data-id="${esc(n.id)}">${tripOpts(n.party, n.date, n.trip || "")}</select><div class="row-sub" style="margin-top:6px">${info}</div></div></div>`;
  return t ? `<div class="row-sub">Adjusted against the trip of ${esc(tripLbl(t))}${n.status !== "Active" ? " (no longer, the note is cancelled)" : ""}.</div>` : "";
}
IN.noteTrip = (el) => {
  const n = D.notes.find((x) => x.id === el.dataset.id); if (!n || n.status !== "Active" || (n.trip || "") === el.value) return;
  noteTripSet(n, el.value);
  logActivity("Credit note adjusted against a trip", n.no || n.id, el.value ? tripLbl(tripById(el.value)) : "No trip");
  ACT.noteOpen({ dataset: { id: n.id } }); render();
  toast(el.value ? "Taken off that trip's revenue" : "No longer adjusted against a trip", "truck");
};
/* the trip form: which credit notes come off it */
function tripCreditHtml(T) {
  const C = tripCredits(T.id); if (!C.n) return "";
  return `<div class="banner info">${ic("info", "sm")}<span><b>${C.n} sales return${C.n > 1 ? "s" : ""} taken off this trip:</b> ${C.list.map((n) => `${esc(n.no || n.id)} (${esc(shortOf(n.party))}${SEE_MONEY ? ", " + rs2(n.tripAdj.amt) : ""})`).join(", ")}. The revenue and crates below are net of ${C.n > 1 ? "them" : "it"}.</span></div>`;
}

/* ---------- a dispatch on the same vehicle as an earlier trip ---------- */
const dDiff = (a, b) => Math.round((toDate(a) - toDate(b)) / 864e5);
ACT.tripJoin = (el) => {
  let orders = [], qc = [], date = ymd(NOW());
  if (el.dataset.run) { const r = unloggedRuns().find((x) => x.key === el.dataset.run); if (!r) return; orders = r.orders.slice(); qc = r.qc.slice(); date = r.date; }
  if (el.dataset.orders) { orders = el.dataset.orders.split(",").filter(Boolean); const o = orderById(orders[0]); if (o && o.dispatched) date = o.dispatched.slice(0, 10); }
  S.join = { orders, qc, date, all: false };
  openSheet("Same vehicle as which trip?", `<div id="join-body" class="stack gap-16">${joinBody()}</div>`, `<button class="btn btn-secondary" data-act="closeSheet">Cancel</button>`, true);
};
function joinBody() {
  const J = S.join, os = J.orders.map(orderById).filter(Boolean), names = [...new Set(os.map((o) => shortOf(o.dist)))].join(", ");
  const cr = os.reduce((a, o) => a + (o.crates || 0), 0), val = os.reduce((a, o) => a + (o.value || 0), 0);
  let list = logi().trips.map((t) => ({ t, cn: tripCredits(t.id), d: Math.abs(dDiff(t.date, J.date)) }));
  const all = list.length; if (!J.all) list = list.filter((x) => x.cn.n || (x.t.date >= addDays(J.date, -30) && x.t.date <= addDays(J.date, 3)));
  list.sort((a, b) => (b.cn.n > 0) - (a.cn.n > 0) || (a.t.date < b.t.date ? 1 : a.t.date > b.t.date ? -1 : 0));
  return `<div class="banner info">${ic("truck", "sm")}<span><b>${esc(names || "This dispatch")}</b> · ${nf(cr, 1)} crates${SEE_MONEY ? " · " + rs(val) : ""}. Choose the trip whose vehicle carried it (for example, goods taken back on a credit note and billed to someone else). It is added to that trip's crates${SEE_MONEY ? " and revenue" : ""}; no new trip is needed.</span></div>
    ${list.length ? `<div class="group">${list.map((x) => `<button class="row" data-act="tripJoinTo" data-id="${esc(x.t.id)}" style="width:100%;text-align:left"><span class="grow"><div class="row-title clip">${esc(tripLbl(x.t))}</div><div class="row-sub">${esc(x.t.type || "GT")} · ${x.t.crates != null ? nf(x.t.crates, 1) + " crates" : "crates not set"}${SEE_MONEY && x.t.revenue != null ? " · " + rs(x.t.revenue) : ""}${x.t.selfPickup ? " · self pickup" : ""}${x.cn.n ? ` · <span style="color:var(--tint);font-weight:600">${x.cn.n} sales return${x.cn.n > 1 ? "s" : ""} taken off (${x.cn.list.map((n) => esc(shortOf(n.party))).join(", ")})</span>` : ""}</div></span>${ic("chevR", "sm chev")}</button>`).join("")}</div>` : `<div class="group"><div class="empty">No trips around ${esc(fmtDate(J.date))}.</div></div>`}
    ${!J.all && all > list.length ? `<button class="btn btn-secondary" data-act="joinAll">Show all ${all} trips</button>` : ""}`;
}
ACT.joinAll = () => { S.join.all = true; part("join-body", joinBody()); };
ACT.tripJoinTo = (el) => {
  const J = S.join, t = tripById(el.dataset.id); if (!J || !t) return;
  const L = logi(), on = new Set(), onQ = new Set(); L.trips.forEach((x) => { (x.orders || []).forEach((i) => on.add(i)); (x.qc || []).forEach((p) => onQ.add(p)); });
  const os = J.orders.filter((id) => !on.has(id)).map(orderById).filter(Boolean), qs = J.qc.filter((po) => !onQ.has(po)).map((po) => D.qcPOs.find((p) => p.po === po)).filter(Boolean);
  if (!os.length && !qs.length) { closeSheet(); toast("Already on a trip", "info"); return; }
  const qv = qs.map((p) => qcTripInfo(p) || { crates: 0, revenue: 0 });
  const addR = os.reduce((a, o) => a + (o.value || 0), 0) + qv.reduce((a, q) => a + (q.revenue || 0), 0), addC = os.reduce((a, o) => a + (o.crates || 0), 0) + qv.reduce((a, q) => a + (q.crates || 0), 0);
  t.orders = (t.orders || []).concat(os.map((o) => o.id)); t.qc = (t.qc || []).concat(qs.map((p) => p.po));
  t.revenue = Math.round(((t.revenue || 0) + addR) * 100) / 100; t.crates = Math.round(((t.crates || 0) + addC) * 10) / 10;
  const names = os.map((o) => shortOf(o.dist)).concat(qs.map((p) => p.platform)), have = String(t.sellers || "").split(/,\s*/).filter(Boolean);
  names.forEach((n) => { if (!have.includes(n)) have.push(n); }); t.sellers = have.join(", ");
  logActivity("Dispatch added to a trip", fmtDate(t.date), `${[...new Set(names)].join(", ")} · same vehicle as the trip of ${fmtDate(t.date)}`);
  S.join = null; closeSheet(); render(); toast(`Added to the trip of ${fmtDate(t.date)} · no new trip needed`, "truck");
};

/* ===== ACCOUNTS: the books, worked out from what the tool already records =====
   Nothing is typed twice. Every dispatched order, Swiggy / Zepto delivery, Hangyo purchase, credit or debit note,
   logistics trip and TOD receipt becomes an accounting entry on its own date. What the tool cannot know (money
   received and paid, expenses, partners' capital, opening balances) is entered as a voucher, or comes from the
   bank statement. Reports (profit and loss, balance sheet, trial balance, ledgers, party statements, GST) are
   worked out from those entries every time they are opened, so they always match the rest of the tool.
   Invoice numbers come from Vyapar for now: the tool records them against each dispatch.
   Quick commerce: Hangyo bills Swiggy and Zepto itself and owns that stock; SahiReach earns a 6% fee on what is
   delivered. So deliveries are not SahiReach's sales: each one gives a fee from Hangyo. Quick commerce stock used for
   distributors is a purchase from Hangyo; SahiReach stock sent with a Swiggy / Zepto delivery is a return to Hangyo.
   Hangyo bills from outside Kerala: its purchases carry IGST.
   Amounts: an entry line is { a: account id, v: amount }, v > 0 is a debit and v < 0 a credit. */
ICONS.book = '<path d="M5 5.5A2 2 0 0 1 7 3.5h11.5v14H7a2 2 0 0 0-2 2z"/><path d="M5 19.5a2 2 0 0 0 2 2h11.5v-4"/><path d="M9 8h6"/>';
ICONS.bank = '<path d="m3.5 9 8.5-5 8.5 5"/><path d="M5 9.5v8M9.5 9.5v8M14.5 9.5v8M19 9.5v8"/><path d="M3.5 20h17"/>';
const AC_STATE = "32"; /* Kerala */
const AC_QC_FEE = typeof QC_GP_RATE === "number" ? QC_GP_RATE : 0.06; /* SahiReach's fee on quick commerce deliveries */
const AC_GST = 0.05;
const AC_BOOKS_FROM = "2026-04-01";
const AC_CAN = ROLE === "owner" || ROLE === "accountant"; /* can enter vouchers and set the books up */
const AC_SEE = SEE_MONEY; /* owners, accountants and viewers see the books */

/* ---------- groups: plain words first, the accounting term under it ---------- */
const AC_GROUPS = [
  ["bank", "Bank accounts", "Bank accounts", "A"], ["cash", "Cash", "Cash-in-hand", "A"], ["debtors", "Money owed to us", "Sundry debtors", "A"],
  ["stock", "Stock", "Stock-in-hand", "A"], ["taxin", "GST paid on purchases", "Input tax credit", "A"], ["advances", "Deposits and advances given", "Loans and advances (asset)", "A"],
  ["fixed", "Fixed assets", "Fixed assets", "A"], ["curasset", "Other assets", "Other current assets", "A"],
  ["capital", "Partners' capital", "Capital account", "L"], ["loans", "Loans taken", "Loans (liability)", "L"], ["creditors", "Money we owe", "Sundry creditors", "L"],
  ["taxout", "GST collected on sales", "Duties and taxes", "L"], ["deposits", "Deposits from distributors", "Security deposits received", "L"], ["curliab", "Other liabilities", "Current liabilities and provisions", "L"],
  ["sales", "Sales", "Sales accounts", "I"], ["income", "Other income", "Indirect incomes", "I"],
  ["purchases", "Purchases", "Purchase accounts", "E"], ["direct", "Direct costs", "Direct expenses", "E"], ["expenses", "Running costs", "Indirect expenses", "E"],
];
const AC_GROUP = {}; AC_GROUPS.forEach(([id, label, formal, side]) => (AC_GROUP[id] = { id, label, formal, side }));
const AC_PL = (g) => ["I", "E"].includes((AC_GROUP[g] || {}).side);
/* accounts the tool posts to itself */
const AC_SYS = [
  ["sales-gt", "Sales to distributors", "sales"], ["sales-ret", "Sales returns and rate differences", "sales"],
  ["purchases", "Purchases from Hangyo", "purchases"], ["pur-ret", "Purchase returns to Hangyo", "purchases"],
  ["out-cgst", "Output CGST", "taxout"], ["out-sgst", "Output SGST", "taxout"], ["out-igst", "Output IGST", "taxout"],
  ["in-cgst", "Input CGST", "taxin"], ["in-sgst", "Input SGST", "taxin"], ["in-igst", "Input IGST", "taxin"],
  ["tod-claim", "TOD to get from Hangyo", "curasset"], ["tod-income", "TOD support from Hangyo", "income"], ["qc-fee", "Quick commerce fee from Hangyo", "income"], ["hangyo-cn", "Other credit notes from Hangyo", "income"],
  ["freight", "Transport (logistics trips)", "expenses"], ["round", "Rounding off", "expenses"],
  ["cash", "Cash in hand", "cash"], ["stock", "Opening stock", "stock"], ["suspense", "Not yet sorted (suspense)", "curliab"],
];
/* everyday ledgers offered from the start; more can be added */
const AC_STARTER = [
  ["x:capital", "Partners' capital", "capital"], ["x:salaries", "Salaries and wages", "expenses"], ["x:rent", "Rent", "expenses"], ["x:storage", "Cold storage charges", "direct"],
  ["x:loading", "Loading and unloading", "direct"], ["x:fuel", "Fuel and vehicle running", "expenses"], ["x:power", "Electricity", "expenses"], ["x:phone", "Phone and internet", "expenses"],
  ["x:bankchg", "Bank charges", "expenses"], ["x:prof", "Professional and accounting fees", "expenses"], ["x:office", "Office and general expenses", "expenses"], ["x:repairs", "Freezer repairs and maintenance", "expenses"],
  ["x:interest", "Interest received", "income"], ["x:freezers", "Freezers", "fixed"], ["x:tds", "TDS receivable", "curasset"], ["x:gstpaid", "GST paid to the government (cash ledger)", "curasset"],
];

/* ---------- the stored part: D.acct ---------- */
function acStore() {
  if (!D.acct || typeof D.acct !== "object") D.acct = {};
  const A = D.acct;
  A.from = A.from || AC_BOOKS_FROM; A.ledgers = A.ledgers || []; A.opening = A.opening || {}; A.vouchers = A.vouchers || []; A.parties = A.parties || {};
  A.stockAt = A.stockAt || {}; A.bank = A.bank || { stmts: [] }; A.bank.stmts = A.bank.stmts || []; A.imports = A.imports || [];
  return A;
}
/* reading must not create the stored part (a viewer, or a page that never touches the books) */
const AC = () => D.acct || { from: AC_BOOKS_FROM, ledgers: [], opening: {}, vouchers: [], parties: {}, stockAt: {}, bank: { stmts: [] }, imports: [] };
let AC_N = 0;
const acId = (p) => p + "-" + Date.now().toString(36) + (AC_N++).toString(36) + Math.random().toString(36).slice(2, 5);
const acR2 = (n) => Math.round((+n || 0) * 100) / 100;
const acFY = (d) => { const y = +d.slice(0, 4), m = +d.slice(5, 7); return m >= 4 ? y : y - 1; };
const acFYLabel = (y) => `${y}-${String(y + 1).slice(2)}`;
const acFYStart = (d) => `${acFY(d)}-04-01`;

/* the day the tool's own sales take over from the Vyapar sales copied in before it */
function acToolFrom() {
  const A = AC(); if (A.toolFrom) return A.toolFrom;
  let m = "9999-12-31"; D.orders.forEach((o) => { if (o.status === "Dispatched" && o.dispatched && o.dispatched.slice(0, 10) < m) m = o.dispatched.slice(0, 10); });
  (D.salesBefore || []).forEach((r) => { if (r.date >= m) m = addDays(r.date, 1); });
  return m;
}

/* ---------- parties ---------- */
const acPartyId = (name) => "p:" + canonDist(name);
function acPartyInfo(name) {
  const n = canonDist(name), P = AC().parties[n] || {}, d = distByKey[key(n)] || {};
  const gstin = String(P.gstin || d.gstin || "").toUpperCase().replace(/\s+/g, "");
  /* Hangyo bills from outside Kerala (IGST) until a Kerala GSTIN says otherwise */
  return { name: n, gstin, state: gstin.slice(0, 2) || P.state || (n === "Hangyo" ? "IGST" : AC_STATE), addr: P.addr || "", dist: !!distByKey[key(n)] };
}
const acGstinOK = (g) => /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(String(g || ""));
/* inter-state when the party's GSTIN is from another state */
const acInter = (name) => { const p = acPartyInfo(name); return !!(p.state && p.state !== AC_STATE); };
const AC_NO_TR = "Transporter not named";
const AC_CREDITOR = (n) => /^hangyo$/i.test(n) || (D.logistics && (D.logistics.transporters || []).some((t) => key(t.name) === key(n)));

/* ---------- the chart of accounts ---------- */
function acAccounts() {
  const A = AC(), out = {};
  const add = (id, name, group, extra) => { if (!out[id]) out[id] = Object.assign({ id, name, group }, extra || {}); return out[id]; };
  AC_SYS.forEach(([id, name, g]) => add(id, name, g, { sys: true }));
  AC_STARTER.forEach(([id, name, g]) => add(id, name, g, { starter: true }));
  A.ledgers.forEach((l) => { if (l.deleted) return; out[l.id] = Object.assign({}, out[l.id] || {}, l); });
  D.distributors.forEach((d) => add(acPartyId(d.name), d.name, "debtors", { party: d.name }));
  add(acPartyId("Hangyo"), "Hangyo Ice Creams", "creditors", { party: "Hangyo" });
  ((D.logistics && D.logistics.transporters) || []).forEach((t) => add(acPartyId(t.name), t.name, "creditors", { party: t.name }));
  /* anyone else the records name: a transporter only on a trip, a party only in the Vyapar sales or a note */
  ((D.logistics && D.logistics.trips) || []).forEach((t) => { const n = t.transporter || AC_NO_TR; add(acPartyId(n), n, "creditors", { party: n }); });
  (D.salesBefore || []).forEach((r) => { const n = canonDist(r.dist); add(acPartyId(n), n, "debtors", { party: n }); });
  (D.notes || []).forEach((r) => { if (!r.party) return; const n = canonDist(r.party); add(acPartyId(n), n, "debtors", { party: n }); });
  return out;
}
const acName = (id, ACC) => ((ACC || acAccounts())[id] || {}).name || (String(id).startsWith("p:") ? String(id).slice(2) : id);

/* ---------- GST split ---------- */
function acTaxLines(taxable, inter, out) {
  const t = acR2(taxable * AC_GST), p = out ? "out-" : "in-";
  if (inter) return [{ a: p + "igst", v: t, tax: "igst" }];
  const c = acR2(t / 2); return [{ a: p + "cgst", v: c, tax: "cgst" }, { a: p + "sgst", v: acR2(t - c), tax: "sgst" }];
}
/* an invoice: party debited with the rounded total, sales and GST credited, the paise to rounding */
function acInvoice(sign, party, salesAcc, taxable, inter, round) {
  const tax = acTaxLines(taxable, inter, true), gross = acR2(taxable + tax.reduce((a, l) => a + l.v, 0)), tot = round ? Math.round(gross) : gross;
  const L = [{ a: acPartyId(party), v: sign * tot }, { a: salesAcc, v: -sign * acR2(taxable) }].concat(tax.map((l) => ({ a: l.a, v: -sign * l.v, tax: l.tax })));
  if (Math.abs(tot - gross) > 0.001) L.push({ a: "round", v: -sign * acR2(tot - gross) });
  return { lines: L, total: tot, taxable: acR2(taxable), tax };
}

/* ---------- every entry, from the records and the vouchers ---------- */
let AC_CACHE = null, AC_CACHE_T = 0;
const acDirty = () => { AC_CACHE = null; };
function acEntries() {
  if (AC_CACHE && Date.now() - AC_CACHE_T < 800) return AC_CACHE;
  const A = AC(), E = [], from = A.from, tf = acToolFrom();
  const push = (e) => { if (!e.date || e.date < from) return; e.lines = e.lines.filter((l) => Math.abs(l.v) > 0.004); if (e.lines.length) E.push(e); };
  /* 1. sales from Vyapar, before the tool took over: one entry per invoice */
  const vy = {}; (D.salesBefore || []).forEach((r) => { if (r.date >= tf) return; const k = r.inv || r.date + "|" + r.dist; const x = (vy[k] = vy[k] || { inv: r.inv, date: r.date, dist: canonDist(r.dist), cn: r.type === "Credit Note", value: 0, n: 0, crates: 0 }); x.value += r.value || 0; x.n++; x.crates += r.crates || 0; });
  Object.values(vy).forEach((x) => {
    const sg = x.cn ? -1 : 1, I = acInvoice(sg, x.dist, x.cn ? "sales-ret" : "sales-gt", Math.abs(x.value), acInter(x.dist), true);
    push({ id: "vy:" + (x.inv || x.date), date: x.date, kind: x.cn ? "cnote" : "sale", no: x.inv || "", party: x.dist, text: `${x.cn ? "Credit note" : "Invoice"} from Vyapar · ${x.n} line${x.n === 1 ? "" : "s"} · ${nf(Math.abs(x.crates), 1)} crates`, lines: I.lines, taxable: sg * I.taxable, tax: I.tax.map((t) => ({ k: t.tax, v: sg * t.v })), total: sg * I.total, src: { t: "vyapar", ref: x.inv } });
  });
  /* 2. distributor orders, on the day they were dispatched */
  D.orders.forEach((o) => {
    if (o.status !== "Dispatched" || !o.dispatched) return; const d = o.dispatched.slice(0, 10); if (d < tf) return;
    const L = linesByOrder[o.id] || [], val = L.length ? L.reduce((a, l) => a + (l.value || 0), 0) : o.value || 0, tod = L.length ? L.reduce((a, l) => a + (l.tod || 0), 0) : o.tod || 0;
    const I = acInvoice(1, o.dist, "sales-gt", val, acInter(o.dist), true);
    push({ id: "ord:" + o.id, date: d, kind: "sale", no: o.inv || "", party: canonDist(o.dist), text: `Invoice for order ${o.id.replace("ORD-", "")} · ${L.length} line${L.length === 1 ? "" : "s"} · ${nf(o.crates || 0, 1)} crates`, lines: I.lines, taxable: I.taxable, tax: I.tax.map((t) => ({ k: t.tax, v: t.v })), total: I.total, src: { t: "order", ref: o.id }, ewb: o.ewb || "" });
    if (tod > 0.004) push({ id: "tod:" + o.id, date: d, kind: "tod", no: "", party: "Hangyo", text: `TOD Hangyo pays for special prices on order ${o.id.replace("ORD-", "")} (${o.dist})`, lines: [{ a: "tod-claim", v: acR2(tod) }, { a: "tod-income", v: -acR2(tod) }], src: { t: "order", ref: o.id } });
  });
  /* 3. Swiggy / Zepto: Hangyo's sale; SahiReach's fee on what was accepted, on the delivery date */
  D.qcPOs.forEach((p) => {
    if (!p.deliveredOn || !(p.valueAccepted > 0)) return; const d = p.deliveredOn.slice(0, 10), plat = /zepto/i.test(p.platform) ? "Zepto" : "Swiggy", fee = acR2(p.valueAccepted * AC_QC_FEE);
    push({ id: "qc:" + p.po, date: d, kind: "qcfee", no: "", party: "Hangyo", text: `${pct(AC_QC_FEE, 0)} fee on ${plat} PO ${p.po} · ${rs(p.valueAccepted)} accepted`, lines: [{ a: acPartyId("Hangyo"), v: fee }, { a: "qc-fee", v: -fee }], src: { t: "qc", ref: p.po } });
  });
  /* stock moved between SahiReach and quick commerce: a purchase from Hangyo, or a return to Hangyo */
  (D.transfers || []).forEach((t) => {
    const val = acR2(t.amount > 0 ? t.amount : xferEst(t)); if (!(val > 0)) return; const d = String(t.docDate || t.time || "").slice(0, 10), buy = t.kind === "purchase";
    const tl = acTaxLines(val, acInter("Hangyo"), false), tax = acR2(tl.reduce((a, l) => a + l.v, 0)), sg = buy ? 1 : -1;
    push({ id: "trf:" + t.id, date: d, kind: buy ? "purchase" : "pret", no: t.docNo || "", party: "Hangyo", text: buy ? `Quick commerce stock used for distributors · ${nf(t.crates || 0, 1)} crates${t.status === "Pending" ? " · purchase invoice pending" : ""}` : `SahiReach stock sent with ${t.ref || "a Swiggy / Zepto delivery"} · ${nf(t.crates || 0, 1)} crates${t.status === "Pending" ? " · credit note pending" : ""}`,
      lines: [{ a: buy ? "purchases" : "pur-ret", v: sg * val }].concat(tl.map((l) => ({ a: l.a, v: sg * l.v, tax: l.tax })), [{ a: acPartyId("Hangyo"), v: -sg * acR2(val + tax) }]), itc: tl.map((l) => ({ k: l.tax, v: sg * l.v })), taxable: sg * val, total: sg * acR2(val + tax), src: { t: "transfer", ref: t.id } });
  });
  /* 4. credit and debit notes */
  (D.notes || []).forEach((n) => {
    if (n.status !== "Active") return; const d = (n.date || n.time || "").slice(0, 10), amt = Math.abs(+n.amount || Math.abs(+n.sales || 0)), k = /debit note to hangyo/i.test(n.type) ? "pret" : /hangyo credit note/i.test(n.type) ? "hcn" : /debit note to distributor/i.test(n.type) ? "dnote" : "cnote";
    if (!(amt > 0)) return;
    if (k === "cnote" || k === "dnote") {
      const sg = k === "cnote" ? -1 : 1, inter = acInter(n.party), tl = acTaxLines(amt, inter, true), t0 = tl.reduce((a, t) => a + t.v, 0), f = n.gst != null && t0 > 0 ? Math.abs(+n.gst) / t0 : 1;
      const tax = tl.map((t) => ({ a: t.a, tax: t.tax, v: acR2(t.v * f) })), tot = acR2(amt + tax.reduce((a, t) => a + t.v, 0));
      const lines = [{ a: acPartyId(n.party), v: sg * tot }, { a: "sales-ret", v: -sg * amt }].concat(tax.map((t) => ({ a: t.a, v: -sg * t.v, tax: t.tax })));
      push({ id: "note:" + n.id, date: d, kind: k, no: n.no || "", party: canonDist(n.party), text: `${k === "cnote" ? "Credit note" : "Debit note"} · ${n.reason || n.type}`, lines, taxable: sg * amt, tax: tax.map((t) => ({ k: t.tax, v: sg * t.v })), total: sg * tot, src: { t: "note", ref: n.id } });
    } else {
      const inter = acInter("Hangyo"), tl = acTaxLines(amt, inter, false), gst = n.gst != null ? Math.abs(+n.gst) : tl.reduce((a, t) => a + t.v, 0), f = gst / Math.max(0.01, tl.reduce((a, t) => a + t.v, 0));
      const lines = [{ a: acPartyId("Hangyo"), v: acR2(amt + gst) }, { a: k === "pret" ? "pur-ret" : "hangyo-cn", v: -amt }].concat(tl.map((t) => ({ a: t.a, v: -acR2(t.v * f), tax: t.tax })));
      push({ id: "note:" + n.id, date: d, kind: k, no: n.no || "", party: "Hangyo", text: k === "pret" ? "Debit note to Hangyo (stock returned)" : "Credit note from Hangyo", lines, itc: tl.map((t) => ({ k: t.tax, v: -acR2(t.v * f) })), taxable: -amt, src: { t: "note", ref: n.id } });
    }
  });
  /* 5. purchases from Hangyo, on the invoice date */
  const pin = {}; D.purchases.forEach((p) => { if (p.supplier !== "Hangyo" || !(p.value > 0) || /QC/i.test(p.pool || "")) return; /* quick commerce stock is Hangyo's */ const x = (pin[p.id] = pin[p.id] || { id: p.id, inv: p.inv, date: String(p.invDate || p.time).slice(0, 10), value: 0, n: 0, crates: 0, qc: /QC/i.test(p.pool || "") }); x.value += +p.value || 0; x.n++; x.crates += +p.crates || 0; });
  Object.values(pin).forEach((x) => {
    const tl = acTaxLines(x.value, acInter("Hangyo"), false), tot = acR2(x.value + tl.reduce((a, l) => a + l.v, 0));
    push({ id: "pur:" + x.id, date: x.date, kind: "purchase", no: x.inv && x.inv !== "Pending" ? x.inv : "", party: "Hangyo", text: `Hangyo invoice · ${x.n} line${x.n === 1 ? "" : "s"} · ${nf(x.crates, 1)} crates`, lines: [{ a: "purchases", v: acR2(x.value) }].concat(tl.map((l) => ({ a: l.a, v: l.v, tax: l.tax })), [{ a: acPartyId("Hangyo"), v: -tot }]), itc: tl.map((l) => ({ k: l.tax, v: l.v })), taxable: acR2(x.value), total: tot, src: { t: "purchase", ref: x.id } });
  });
  /* 6. logistics trips: the transporter's charge */
  ((D.logistics && D.logistics.trips) || []).forEach((t) => {
    if (!(t.cost > 0)) return; const tr = t.transporter || AC_NO_TR;
    push({ id: "trip:" + t.id, date: t.date, kind: "freight", no: "", party: tr, text: `Trip · ${t.sellers || t.type || ""} · ${nf(t.crates || 0)} crates${t.km ? " · " + nf(t.km) + " km" : ""}`, lines: [{ a: "freight", v: acR2(t.cost) }, { a: acPartyId(tr), v: -acR2(t.cost) }], src: { t: "trip", ref: t.id } });
  });
  /* 7. TOD Hangyo has paid (it reduces what we owe Hangyo) */
  ((D.tod && D.tod.receipts) || []).forEach((r, i) => {
    if (!(r.amount > 0)) return; const ap = acR2(r.applied != null ? r.applied : r.amount), ex = acR2(r.amount - ap);
    push({ id: "todr:" + (r.ref || r.date) + ":" + i, date: (r.date || "").slice(0, 10), kind: "todr", no: r.ref || "", party: "Hangyo", text: `TOD from Hangyo${r.month ? " for " + stkMonthName(r.month) : ""}`, lines: [{ a: acPartyId("Hangyo"), v: acR2(r.amount) }, { a: "tod-claim", v: -ap }, { a: "tod-income", v: -ex }], src: { t: "tod", ref: r.ref } });
  });
  /* 8. vouchers entered in Accounts (receipts, payments, expenses, journals, contra, imports) */
  A.vouchers.forEach((v) => { if (v.deleted) return; push({ id: "v:" + v.id, date: v.date, kind: v.type, no: v.no || "", party: v.party || "", text: v.text || "", lines: v.lines.map((l) => ({ a: l.a, v: +l.v || 0, tax: l.tax })), itc: v.itc, taxable: v.taxable, total: v.total, src: { t: "voucher", ref: v.id }, v }); });
  E.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : AC_ORDER[a.kind] - AC_ORDER[b.kind]));
  AC_CACHE = E; AC_CACHE_T = Date.now();
  return E;
}
const AC_ORDER = { qcfee: 4, opening: 0, purchase: 1, sale: 2, cnote: 3, dnote: 3, pret: 3, hcn: 3, tod: 4, todr: 4, freight: 5, expense: 6, journal: 7, receipt: 8, payment: 8, contra: 9 };
const AC_KIND = { sale: "Sale", purchase: "Purchase", cnote: "Credit note", dnote: "Debit note", pret: "Purchase return", hcn: "Hangyo credit note", tod: "TOD due", todr: "TOD received", qcfee: "Quick commerce fee", freight: "Transport", receipt: "Money in", payment: "Money out", expense: "Expense", journal: "Journal", contra: "Bank / cash transfer" };

/* ---------- balances ---------- */
/* each account's opening (start of `from`), debits, credits and closing (end of `to`) */
function acBalances(from, to) {
  const A = AC(), B = {}, b = (id) => (B[id] = B[id] || { open: 0, dr: 0, cr: 0, close: 0 });
  Object.keys(A.opening).forEach((id) => { const v = +A.opening[id] || 0; if (v) b(id).open += v; });
  acEntries().forEach((e) => {
    if (e.date > to) return;
    e.lines.forEach((l) => { const x = b(l.a); if (e.date < from) x.open += l.v; else if (l.v > 0) x.dr += l.v; else x.cr -= l.v; });
  });
  Object.values(B).forEach((x) => { x.open = acR2(x.open); x.dr = acR2(x.dr); x.cr = acR2(x.cr); x.close = acR2(x.open + x.dr - x.cr); });
  return B;
}
/* the opening balances must balance; whatever does not, shows as a difference (like any accounts package) */
const acOpeningDiff = () => acR2(Object.values(AC().opening).reduce((a, v) => a + (+v || 0), 0));

/* ---------- stock value (at cost, excl. GST) at the end of a day ---------- */
function acStockQtyValue(d) {
  /* SahiReach's own stock only: quick commerce stock belongs to Hangyo */
  const pts = stkPoints(), T = d + "T23:59", own = stkValueAt(T, "own", pts).v; let v = 0, miss = 0;
  Object.keys(own).forEach((sap) => { const q = Math.max(0, own[sap] || 0), uc = unitCost(sap); if (q && uc == null) miss++; v += q * (uc || 0); });
  return { v: acR2(v), miss };
}
/* the closing stock: a figure the accountant entered for that day wins; before the tool's stock records began, nothing is worked out */
function acStockAt(d) {
  const A = AC(); if (A.stockAt[d] != null) return { v: +A.stockAt[d], how: "entered" };
  if (d < A.from) return { v: 0, how: "none" };
  if (d === addDays(A.from, -1)) return { v: +A.opening.stock || 0, how: "opening" };
  const first = acStockFirst(); if (first && d < first) return { v: null, how: "before" };
  const x = acStockQtyValue(d); return { v: x.v, how: "tool", miss: x.miss };
}
/* the first day the tool knows the stock: the first Hangyo purchase of SahiReach stock it recorded */
function acStockFirst() { let m = ""; D.purchases.forEach((p) => { const d = String(p.invDate || p.time).slice(0, 10); if (p.supplier === "Hangyo" && !/QC/i.test(p.pool || "") && (!m || d < m)) m = d; }); return m; }

/* sales before the tool's first Hangyo purchase, with no purchases of that time in the books: profit would be overstated */
function acPurGap(from, to) {
  const first = acStockFirst(), A = AC(); if (!first || from >= first || A.vyDone) return null;
  const E = acEntries(), sold = E.some((e) => e.kind === "sale" && e.date >= from && e.date < first && e.date <= to), bought = E.some((e) => e.date < first && e.lines.some((l) => l.a === "purchases" && l.v > 0));
  return sold && !bought ? first : null;
}
/* ---------- profit and loss ---------- */
function acPL(from, to) {
  const A = AC(), B = acBalances(from, to), ACC = acAccounts(), mv = (id) => acR2((B[id] ? B[id].dr - B[id].cr : 0));
  const ofGroup = (g) => Object.keys(B).filter((id) => (ACC[id] || {}).group === g && Math.abs(B[id].dr - B[id].cr) > 0.004).map((id) => ({ id, name: acName(id, ACC), v: mv(id) }));
  const sales = ofGroup("sales"), salesNet = -sales.reduce((a, x) => a + x.v, 0);
  const purch = ofGroup("purchases"), purNet = purch.reduce((a, x) => a + x.v, 0), direct = ofGroup("direct"), directT = direct.reduce((a, x) => a + x.v, 0);
  const os = from <= A.from ? { v: +A.opening.stock || 0, how: "opening" } : acStockAt(addDays(from, -1)), cs = acStockAt(to);
  const cogs = (os.v || 0) + purNet + directT - (cs.v || 0), gp = salesNet - cogs;
  const inc = ofGroup("income"), incT = -inc.reduce((a, x) => a + x.v, 0), exp = ofGroup("expenses"), expT = exp.reduce((a, x) => a + x.v, 0);
  const np = gp + incT - expT;
  return { from, to, purGap: acPurGap(from, to), sales, salesNet: acR2(salesNet), purch, purNet: acR2(purNet), direct, directT: acR2(directT), os, cs, cogs: acR2(cogs), gp: acR2(gp), inc, incT: acR2(incT), exp, expT: acR2(expT), np: acR2(np), stockGap: os.v == null || cs.v == null };
}

/* ---------- balance sheet as on a day ---------- */
function acBS(d) {
  const A = AC(), B = acBalances(A.from, d), ACC = acAccounts(), fy = acFYStart(d) > A.from ? acFYStart(d) : A.from;
  const cur = acPL(fy, d), before = fy > A.from ? acPL(A.from, addDays(fy, -1)) : null;
  const sides = { A: {}, L: {} }; let gstNet = 0;
  Object.keys(B).forEach((id) => {
    const a = ACC[id] || { name: id, group: id.startsWith("p:") ? "debtors" : "curliab" }, g = AC_GROUP[a.group]; if (!g || AC_PL(a.group) || id === "stock") return;
    const bal = B[id].close; if (Math.abs(bal) < 0.005) return;
    if (a.group === "taxin" || a.group === "taxout") { gstNet += bal; return; }
    /* a party who has paid in advance (or whom we have overpaid) sits on the other side */
    const side = (a.group === "debtors" || a.group === "creditors") ? (bal > 0 ? "A" : "L") : g.side, gid = (a.group === "debtors" && bal < 0) ? "advrecv" : (a.group === "creditors" && bal > 0) ? "advpaid" : a.group;
    (sides[side][gid] = sides[side][gid] || []).push({ id, name: a.name, v: side === "A" ? bal : -bal });
  });
  if (Math.abs(gstNet) > 0.004) (gstNet > 0 ? (sides.A.gst = [{ id: "gst", name: "GST credit to carry forward", v: acR2(gstNet) }]) : (sides.L.gst = [{ id: "gst", name: "GST to pay", v: acR2(-gstNet) }]));
  const cs = acStockAt(d); if (cs.v) sides.A.stock = [{ id: "stock", name: "Closing stock", v: cs.v, how: cs.how }];
  const prof = [{ id: "pl-cur", name: `Profit this year (FY ${acFYLabel(acFY(d))} to ${fmtDate(d)})`, v: cur.np }];
  if (before) prof.unshift({ id: "pl-before", name: "Profit of earlier years", v: before.np });
  /* an opening balance put on an income or expense account still counts (as profit brought forward) */
  const opPL = acR2(Object.keys(A.opening).reduce((t, id) => t + (AC_PL((ACC[id] || {}).group) ? +A.opening[id] || 0 : 0), 0)); if (Math.abs(opPL) > 0.004) prof.push({ id: "pl-open", name: "Opening balances of income and cost accounts", v: -opPL });
  sides.L.profit = prof;
  const od = acOpeningDiff(); if (Math.abs(od) > 0.004) sides.L.diff = [{ id: "diff", name: "Difference in opening balances", v: od }];
  const tot = (s) => acR2(Object.values(s).reduce((a, L) => a + L.reduce((b, x) => b + x.v, 0), 0));
  return { d, sides, assets: tot(sides.A), liab: tot(sides.L), pl: cur, stockGap: cs.v == null };
}

/* ---------- a party's account: invoices, notes, money in and out, with what is still open (oldest first) ---------- */
function acLedger(id, from, to) {
  const A = AC(), rows = []; let open = +A.opening[id] || 0;
  acEntries().forEach((e) => {
    if (e.date > to) return; const v = e.lines.filter((l) => l.a === id).reduce((a, l) => a + l.v, 0); if (Math.abs(v) < 0.004) return;
    if (e.date < from) { open += v; return; }
    rows.push({ e, v: acR2(v) });
  });
  let run = acR2(open); rows.forEach((r) => { run = acR2(run + r.v); r.bal = run; });
  return { id, open: acR2(open), rows, close: run, dr: acR2(rows.reduce((a, r) => a + Math.max(0, r.v), 0)), cr: acR2(rows.reduce((a, r) => a + Math.max(0, -r.v), 0)) };
}
/* what a distributor still owes, bill by bill: payments and credit notes clear the oldest bills first */
function acOpenBills(party, to) {
  const id = acPartyId(party), L = acLedger(id, AC().from, to || ymd(NOW())), bills = [], open0 = L.open; let credit = 0;
  if (open0 > 0.004) bills.push({ date: AC().from, no: "Opening balance", amt: open0, left: open0 }); else credit -= open0;
  L.rows.forEach((r) => { if (r.v > 0) bills.push({ date: r.e.date, no: r.e.no || AC_KIND[r.e.kind] || "", amt: r.v, left: r.v, e: r.e }); else credit += -r.v; });
  bills.forEach((b) => { const use = Math.min(b.left, credit); b.left = acR2(b.left - use); credit = acR2(credit - use); });
  return { bills: bills.filter((b) => b.left > 0.004), advance: acR2(credit), bal: L.close };
}
let AC_AGE = null;
function acAgeing(to) {
  const today = to || ymd(NOW()), E = acEntries(); if (AC_AGE && AC_AGE.E === E && AC_AGE.d === today && AC_AGE.op === JSON.stringify(AC().opening)) return AC_AGE.out;
  const out = []; AC_AGE = { E, d: today, op: JSON.stringify(AC().opening), out };
  Object.values(acAccounts()).filter((a) => a.group === "debtors").forEach((a) => {
    const O = acOpenBills(a.party || a.name, today); if (!O.bills.length && Math.abs(O.bal) < 0.5) return;
    const credit = (distByKey[key(a.party || a.name)] || {}).credit || 7, b = { d0: 0, d30: 0, d60: 0, d90: 0, overdue: 0, total: 0 };
    O.bills.forEach((x) => { const age = daysBetween(x.date, today); b.total += x.left; if (age > credit) b.overdue += x.left; if (age <= 30) b.d0 += x.left; else if (age <= 60) b.d30 += x.left; else if (age <= 90) b.d60 += x.left; else b.d90 += x.left; });
    const oldest = O.bills.length ? O.bills[0].date : null;
    out.push(Object.assign({ id: a.id, name: a.name, party: a.party || a.name, credit, bills: O.bills, advance: O.advance, bal: O.bal, oldest }, b));
  });
  return out.sort((a, b) => b.total - a.total);
}

/* ---------- GST for a month (or any range) ---------- */
function acGST(from, to) {
  const out = { b2b: [], b2c: [], cdn: [], tax: { cgst: 0, sgst: 0, igst: 0 }, taxable: 0, itc: { cgst: 0, sgst: 0, igst: 0 }, itcTaxable: 0, purchases: [], missingNo: [], missingGstin: {}, hsn: {} };
  acEntries().forEach((e) => {
    if (e.date < from || e.date > to) return;
    if (["sale", "cnote", "dnote"].includes(e.kind) && e.tax) {
      const p = acPartyInfo(e.party), row = { e, party: e.party, gstin: p.gstin, no: e.no, date: e.date, taxable: e.taxable || 0, total: e.total || 0, cgst: 0, sgst: 0, igst: 0, inter: acInter(e.party) };
      e.tax.forEach((t) => { row[t.k] += t.v; out.tax[t.k] += t.v; }); out.taxable += row.taxable;
      if (!e.no) out.missingNo.push(row);
      if (e.kind !== "sale") out.cdn.push(row); else if (acGstinOK(p.gstin)) out.b2b.push(row); else { out.b2c.push(row); if (!p.gstin) out.missingGstin[e.party] = (out.missingGstin[e.party] || 0) + 1; }
    }
    if (e.itc && e.itc.length) { const row = { e, party: e.party, no: e.no, date: e.date, taxable: e.taxable || 0, cgst: 0, sgst: 0, igst: 0 }; e.itc.forEach((t) => { row[t.k] += t.v; out.itc[t.k] += t.v; }); out.itcTaxable += row.taxable; out.purchases.push(row); }
  });
  /* HSN summary from the product lines behind the sales */
  const add = (sap, name, qty, val) => { const st = stockBySap[sap] || catBySap[sap] || {}, h = String(st.hsn || "21050000"), x = (out.hsn[h] = out.hsn[h] || { hsn: h, desc: "Ice cream and other edible ice", qty: 0, taxable: 0 }); x.qty += qty || 0; x.taxable += val || 0; };
  const tf = acToolFrom();
  (D.salesBefore || []).forEach((r) => { if (r.date < from || r.date > to || r.date >= tf || r.date < AC().from) return; add(r.sap, r.product, r.ea, r.value); });
  D.orders.forEach((o) => { if (o.status !== "Dispatched" || !o.dispatched) return; const d = o.dispatched.slice(0, 10); if (d < from || d > to || d < tf) return; (linesByOrder[o.id] || []).forEach((l) => add(l.sap, l.product, l.ea, l.value)); });
  ["cgst", "sgst", "igst"].forEach((k) => { out.tax[k] = acR2(out.tax[k]); out.itc[k] = acR2(out.itc[k]); });
  out.taxable = acR2(out.taxable); out.itcTaxable = acR2(out.itcTaxable);
  const outT = out.tax.cgst + out.tax.sgst + out.tax.igst, inT = out.itc.cgst + out.itc.sgst + out.itc.igst;
  out.outTax = acR2(outT); out.inTax = acR2(inT); out.net = acR2(outT - inT);
  return out;
}

/* ---------- vouchers ---------- */
const AC_VTYPES = { receipt: ["Money in", "RV"], payment: ["Money out", "PV"], expense: ["Expense", "EV"], journal: ["Journal", "JV"], contra: ["Bank / cash transfer", "CV"] };
function acNextNo(type, date) {
  const p = AC_VTYPES[type] ? AC_VTYPES[type][1] : "V", fy = acFYLabel(acFY(date)), re = new RegExp("^" + p + "/" + fy + "/(\\d+)$"); let n = 0;
  AC().vouchers.forEach((v) => { const m = String(v.no || "").match(re); if (m) n = Math.max(n, +m[1]); });
  return `${p}/${fy}/${n + 1}`;
}
/* money accounts: banks first, then cash */
const acMoneyAccs = () => Object.values(acAccounts()).filter((a) => a.group === "bank" || a.group === "cash").sort((a, b) => (a.group === b.group ? a.name.localeCompare(b.name) : a.group === "bank" ? -1 : 1));
const acHasBank = () => Object.values(acAccounts()).some((a) => a.group === "bank");

/* the next Vyapar invoice number, from the last one recorded */
function acNextInv() {
  let best = null; const re = /^(.*?)(\d+)$/;
  const consider = (s) => { const m = String(s || "").trim().match(re); if (!m || !/FY/i.test(m[1])) return; if (!best || +m[2] > best.n) best = { p: m[1], n: +m[2] }; };
  (D.salesBefore || []).forEach((r) => { if (r.type !== "Credit Note") consider(r.inv); }); D.orders.forEach((o) => consider(o.inv));
  return best ? best.p + (best.n + 1) : "SR/FY26-27/1";
}
/* dispatches (and deliveries) that still need their Vyapar invoice number */
function acToNumber() {
  const tf = acToolFrom(), A = AC(), out = [];
  D.orders.forEach((o) => { if (o.status === "Dispatched" && o.dispatched && o.dispatched.slice(0, 10) >= tf && o.dispatched.slice(0, 10) >= A.from && !o.inv) out.push({ t: "order", id: o.id, date: o.dispatched.slice(0, 10), party: o.dist, value: o.valueGst || (o.value || 0) * 1.05 }); });
  return out.sort((a, b) => (a.date < b.date ? -1 : 1));
}

/* ===== ACCOUNTS: the screens =====
   One place, six views: Overview, Day book, Parties, Reports (profit and loss, balance sheet, trial balance,
   ledgers), GST and Bank. Read-only for viewers; owners and the accountant can enter vouchers. */
const acAmt = (v, d) => (v == null || isNaN(v) ? "–" : (v < -0.004 ? "−" : "") + "₹" + (d === 0 ? inr0.format(Math.round(Math.abs(v))) : inr2.format(Math.abs(v))));
const acDrCr = (v) => (Math.abs(v) < 0.005 ? "₹0.00" : `${acAmt(Math.abs(v))} <span class="ac-dc">${v > 0 ? "Dr" : "Cr"}</span>`);
const acToday = () => ymd(NOW());
/* the period shown: this financial year, a month, a quarter or any dates */
function acRange() {
  const F = (S.acP = S.acP || { preset: "fy" }), t = acToday(), A = AC();
  const clamp = (d) => (d < A.from ? A.from : d);
  if (F.preset === "custom" && F.from && F.to) return { from: clamp(F.from), to: F.to, label: `${fmtDate(F.from)} to ${fmtDate(F.to)}` };
  if (F.preset === "month" || F.preset === "lastMonth") { const n = toDate(t), m = F.preset === "month" ? n.getMonth() : n.getMonth() - 1, d0 = new Date(n.getFullYear(), m, 1), d1 = new Date(n.getFullYear(), m + 1, 0), to = ymd(d1) > t ? t : ymd(d1); return { from: clamp(ymd(d0)), to, label: `${MONTH_LONG[d0.getMonth()]} ${d0.getFullYear()}` }; }
  if (F.preset === "lastFy") { const y = acFY(t) - 1; return { from: clamp(`${y}-04-01`), to: `${y + 1}-03-31`, label: `FY ${acFYLabel(y)}` }; }
  if (F.preset === "quarter") { const n = toDate(t), q = Math.floor(((n.getMonth() + 9) % 12) / 3), y = acFY(t), sm = 3 + q * 3, d0 = new Date(y, sm, 1), d1 = new Date(y, sm + 3, 0); return { from: clamp(ymd(d0)), to: ymd(d1) > t ? t : ymd(d1), label: `Q${q + 1} FY ${acFYLabel(y)}` }; }
  const y = acFY(t); return { from: clamp(`${y}-04-01`), to: t, label: `FY ${acFYLabel(y)} so far` };
}
function acPeriodChips(withAsOn) {
  const F = (S.acP = S.acP || { preset: "fy" }), R = acRange();
  const ch = [["fy", "This year"], ["quarter", "This quarter"], ["month", "This month"], ["lastMonth", "Last month"], ["lastFy", "Last year"], ["custom", "Dates"]];
  return `<div class="ac-period"><div class="chips" style="margin:0">${ch.map(([v, l]) => `<button class="chip" data-act="acvP" data-v="${v}" aria-pressed="${F.preset === v}">${l}</button>`).join("")}</div>
    ${F.preset === "custom" ? `<div class="hstack gap-8 ac-dates"><input class="input sm" type="date" data-in="acvFrom" value="${esc(F.from || R.from)}" aria-label="From"><span class="dim">to</span><input class="input sm" type="date" data-in="acvTo" value="${esc(F.to || R.to)}" aria-label="To"></div>` : `<span class="row-sub">${withAsOn ? "As on " + fmtDate(R.to) + " " + R.to.slice(0, 4) : esc(R.label) + " · " + fmtDate(R.from) + " to " + fmtDate(R.to)}</span>`}</div>`;
}
ACT.acvP = (el) => { S.acP = S.acP || {}; S.acP.preset = el.dataset.v; if (el.dataset.v === "custom" && !S.acP.from) { const R = acRange(); S.acP.from = acFYStart(acToday()); S.acP.to = acToday(); } render(); };
IN.acvFrom = (el) => { if (el.value) { S.acP.from = el.value; render(); } };
IN.acvTo = (el) => { if (el.value) { S.acP.to = el.value; render(); } };

/* ---------- the page ---------- */
VIEWS.accounts = () => {
  const tab = S.acTab || "overview";
  const tabs = [["overview", "Overview"], ["daybook", "Day book"], ["parties", "Parties"], ["reports", "Reports"], ["gst", "GST"], ["bank", "Bank"]];
  const body = { overview: acOverviewHtml, daybook: acDaybookHtml, parties: acPartiesHtml, reports: acReportsHtml, gst: acGstHtml, bank: acBankHtml }[tab] || acOverviewHtml;
  return `<div class="page">
    <div class="page-head"><div><h1 class="title">Accounts</h1><div class="subtitle">Your books, kept from the orders, deliveries, purchases and trips already in the tool. Books from ${fmtDate(AC().from)} ${AC().from.slice(0, 4)}.</div></div>
      <div class="head-actions">${AC_CAN ? `<button class="btn btn-secondary" data-act="aceVyapar">${ic("upload", "sm")} Upload data</button><button class="btn btn-primary" data-act="aceNew">${ic("plus", "sm")} New entry</button>` : ""}<button class="btn btn-secondary" data-act="acvExcel">${ic("doc", "sm")} Download Excel</button></div></div>
    <div class="ac-tabs">${seg("acTab", tab, tabs)}</div>
    ${body()}
  </div>`;
};

/* ---------- Overview ---------- */
function acOverviewHtml() {
  const R = acRange(), P = acPL(R.from, R.to), t = acToday(), B = acBalances(AC().from, t), ACC = acAccounts();
  const money = acMoneyAccs().reduce((a, x) => a + ((B[x.id] || {}).close || 0), 0);
  const age = acAgeing(t), owed = age.reduce((a, x) => a + x.total, 0), overdue = age.reduce((a, x) => a + x.overdue, 0);
  const hang = -((B[acPartyId("Hangyo")] || {}).close || 0), mo = t.slice(0, 7), G = acGST(mo + "-01", t);
  const gm = P.salesNet ? P.gp / P.salesNet : null, nm = P.salesNet ? P.np / P.salesNet : null;
  const tile = (label, value, sub, cls, act) => `<${act ? `button data-act="${act}"` : "div"} class="tile${act ? " tile-btn" : ""}"><div class="tile-label"><span>${esc(label)}</span>${act ? ic("chevR", "sm dim") : ""}</div><div class="tile-value"${cls ? ` style="color:var(--${cls})"` : ""}>${value}</div><div class="tile-sub">${sub}</div></${act ? "button" : "div"}>`;
  const todo = acTodo();
  return `<div class="stack gap-16">
    ${acPeriodChips()}
    ${acSetupCard()}
    <div class="tiles tiles-4">
      ${tile("Sales", lakhS(P.salesNet) + "<small>L</small>", `Excl. GST, after returns · ${esc(R.label)}`, "", "acvGoPL")}
      ${tile("Gross profit", lakhS(P.gp) + "<small>L</small>", P.purGap ? `<span style="color:var(--warn);font-weight:600">Not final:</span> Hangyo purchases before ${fmtDate(P.purGap)} are not in the books yet` : P.stockGap ? "Needs the stock figure · see below" : `${gm != null ? pct(gm, 1) + " of sales" : ""} · after cost of stock sold`, P.gp < 0 ? "bad" : "", "acvGoPL")}
      ${tile("Net profit", lakhS(P.np) + "<small>L</small>", P.purGap ? `<span style="color:var(--warn);font-weight:600">Not final</span> · purchases before ${fmtDate(P.purGap)} missing` : `${nm != null ? pct(nm, 1) + " of sales · " : ""}after ₹${lakh(P.expT)} L running costs`, P.np < 0 ? "bad" : "good", "acvGoPL")}
      ${tile("Cash and bank", rs(money), acHasBank() ? `${acMoneyAccs().length} account${acMoneyAccs().length === 1 ? "" : "s"} · as per the books today` : "Add your bank account to start", "", "acvGoBank")}
      ${tile("Money owed to us", lakhS(owed) + "<small>L</small>", overdue > 0.5 ? `<span style="color:var(--bad);font-weight:600">${rs(overdue)} overdue</span> · ${age.filter((x) => x.overdue > 0.5).length} parties` : "Nothing overdue", "", "acvGoParties")}
      ${tile("Money we owe Hangyo", rs(hang), hang > 0 ? "Purchases less payments, returns and TOD" : "Nothing due", "", "acvGoHangyo")}
      ${tile(`GST for ${MONTH_LONG[+mo.slice(5) - 1]}`, rs(Math.max(0, G.net)), G.net >= 0 ? `To pay so far · output ${rs(G.outTax)} less credit ${rs(G.inTax)}` : `Credit to carry forward: ${rs(-G.net)}`, "", "acvGoGst")}
    </div>
    ${todo.length ? `<div><div class="group-label"><span>To sort out</span><span>${todo.length}</span></div><div class="group">${todo.map((x) => `<button class="row" data-act="${x.act}"${x.data || ""}><span class="attn-ic ${x.cls || "warn"}">${ic(x.icon || "alert")}</span><span class="grow"><div class="row-title">${x.title}</div><div class="row-sub">${x.sub}</div></span>${ic("chevR", "sm chev")}</button>`).join("")}</div></div>` : ""}
    ${acMonthsCard(R)}
  </div>`;
}
/* first steps, until done */
function acSetupCard() {
  const A = AC(), bank = acHasBank(), open = Object.keys(A.opening).length > 0 || A.openingDone, first = acStockFirst();
  if (bank && open && A.setupDone) return "";
  const step = (done, n, t, s, act, btn) => `<div class="ac-step${done ? " done" : ""}"><span class="ac-step-n">${done ? ic("check", "sm") : n}</span><span class="grow"><div class="row-title">${t}</div><div class="row-sub">${s}</div></span>${!done && AC_CAN && act ? `<button class="btn btn-secondary btn-sm" data-act="${act}">${btn}</button>` : ""}</div>`;
  return `<div class="card card-pad ac-setup"><div class="hstack" style="justify-content:space-between;align-items:flex-start;gap:12px"><div><div class="card-title">Set up the books</div><div class="card-sub">Three things the tool cannot know. Everything else is already filled in from your records.</div></div>${AC_CAN && bank && open ? `<button class="btn-plain" data-act="aceSetupDone">Hide</button>` : ""}</div>
    <div class="ac-steps">
      ${step(bank, 1, "Your bank accounts", "So money in and out, and the bank statement, have somewhere to go.", "aceLedgerNew", "Add bank account")}
      ${step(open, 2, `Opening balances on ${fmtDate(addDays(A.from, -1))} ${A.from.slice(0, 4) - 0}`, "Partners' capital, bank, money owed, stock, as they stood when these books start. Leave it empty if the business started after that.", "aceOpening", "Enter balances")}
      ${step(!!A.vyDone, 3, "What happened before the tool", `The tool has your Vyapar sales from ${fmtDate((D.salesBefore || [])[0] ? D.salesBefore[0].date : A.from)}, but Hangyo purchases only from ${first ? fmtDate(first) : "when they were entered"}. Upload Vyapar's All transactions report (purchases, payments, receipts, expenses) so profit and balances are right.`, "aceVyapar", "Upload accounting data")}
    </div></div>`;
}
function acTodo() {
  const out = [], A = AC(), num = acToNumber(), R = acRange();
  if (num.length) out.push({ act: "aceInvSheet", title: `${num.length} sale${num.length === 1 ? "" : "s"} without a Vyapar invoice number`, sub: `Oldest ${fmtDate(num[0].date)} · needed for GSTR-1. Add the number (and e-way bill) from Vyapar.`, icon: "doc" });
  const G = acGST(R.from, R.to), mg = Object.keys(G.missingGstin);
  if (mg.length) out.push({ act: "acvGoParties", title: `${mg.length} part${mg.length === 1 ? "y has" : "ies have"} no GSTIN`, sub: `${esc(mg.slice(0, 3).join(", "))}${mg.length > 3 ? "…" : ""} · their sales show as B2C in GST until it is added`, icon: "info", cls: "info" });
  if (!(acPartyInfo("Hangyo").gstin)) out.push({ act: "aceParty", data: ` data-p="Hangyo"`, title: "Hangyo's GSTIN is not in the books", sub: "It decides whether purchases carry IGST or CGST + SGST. Taken as CGST + SGST until it is added.", icon: "info", cls: "info" });
  const un = acBankUnmatched(); if (un) out.push({ act: "acvGoBank", title: `${un} bank line${un === 1 ? "" : "s"} not in the books yet`, sub: "From the statements you uploaded. Most come with a suggestion.", icon: "bank" });
  const od = acOpeningDiff(); if (Math.abs(od) > 0.5) out.push({ act: "aceOpening", title: `Opening balances are off by ${rs(Math.abs(od))}`, sub: "What we have should equal what we owe plus partners' capital.", icon: "alert", cls: "bad" });
  const P = acPL(R.from, R.to); if (P.stockGap) out.push({ act: "aceStock", data: ` data-d="${P.os.v == null ? addDays(R.from, -1) : R.to}"`, title: "Stock value needed for the profit", sub: `The tool's stock records start ${fmtDate(acStockFirst())}. Enter the stock value on ${fmtDate(P.os.v == null ? addDays(R.from, -1) : R.to)}, or pick a later period.`, icon: "box" });
  return out;
}
ACT.acvGoPL = () => { S.acTab = "reports"; S.acRep = "pl"; render(); };
ACT.acvGoBank = () => { S.acTab = "bank"; render(); };
ACT.acvGoParties = () => { S.acTab = "parties"; S.acParties = "owed"; render(); };
ACT.acvGoGst = () => { S.acTab = "gst"; S.acGstM = acToday().slice(0, 7); render(); };
ACT.acvGoHangyo = () => acStatementSheet(acPartyId("Hangyo"));
ACT.aceSetupDone = () => { acStore().setupDone = true; render(); };
/* month by month for the period */
function acMonthsCard(R) {
  const ms = []; let d = toDate(R.from.slice(0, 7) + "-01");
  while (ymd(d) <= R.to && ms.length < 24) { const f = ymd(d) < R.from ? R.from : ymd(d), e = ymd(new Date(d.getFullYear(), d.getMonth() + 1, 0)), t = e > R.to ? R.to : e; ms.push({ k: ymd(d).slice(0, 7), label: MONTH_LONG[d.getMonth()].slice(0, 3) + " " + String(d.getFullYear()).slice(2), P: acPL(f, t) }); d = new Date(d.getFullYear(), d.getMonth() + 1, 1); }
  if (ms.length < 2) return "";
  const max = Math.max(1, ...ms.map((m) => Math.abs(m.P.salesNet)));
  return `<div class="card"><div class="card-head"><div><div class="card-title">Month by month</div><div class="card-sub">Sales, gross profit and net profit · ${esc(R.label)}</div></div></div>
    <div class="table-wrap"><table class="t ac-months"><thead><tr><th>Month</th><th class="r">Sales</th><th></th><th class="r">Gross profit</th><th class="r">Margin</th><th class="r">Running costs</th><th class="r">Net profit</th></tr></thead><tbody>
    ${ms.map((m) => `<tr><td>${m.label}</td><td class="r">${rs(m.P.salesNet)}</td><td style="width:22%;min-width:90px"><span class="ac-bar"><i style="width:${Math.max(0, (m.P.salesNet / max) * 100).toFixed(1)}%"></i><b style="width:${Math.max(0, (m.P.gp / max) * 100).toFixed(1)}%"></b></span></td><td class="r">${m.P.stockGap ? `<span class="dim" title="Needs the stock value">–</span>` : rs(m.P.gp)}</td><td class="r">${m.P.stockGap || !m.P.salesNet ? "–" : pct(m.P.gp / m.P.salesNet, 1)}</td><td class="r">${rs(m.P.expT)}</td><td class="r" style="font-weight:600;${m.P.np < 0 ? "color:var(--bad)" : ""}">${m.P.stockGap ? "–" : rs(m.P.np)}</td></tr>`).join("")}
    </tbody></table></div></div>`;
}

/* ---------- Day book: every entry, by date ---------- */
const AC_DB_FILTERS = [["all", "All"], ["sale", "Sales and fees"], ["purchase", "Purchases"], ["notes", "Notes"], ["money", "Money in and out"], ["expense", "Expenses"], ["journal", "Journals"], ["freight", "Transport"]];
const acDbMatch = (e, f) => f === "all" || (f === "sale" ? ["sale", "qcfee"].includes(e.kind) : f === "notes" ? ["cnote", "dnote", "pret", "hcn"].includes(e.kind) : f === "money" ? ["receipt", "payment", "contra"].includes(e.kind) : f === "journal" ? ["journal", "tod", "todr"].includes(e.kind) : e.kind === f);
function acEntryAmt(e) { return acR2(e.lines.reduce((a, l) => a + Math.max(0, l.v), 0)); }
const acKindIc = (k) => ({ qcfee: "bolt", sale: "orders", purchase: "box", cnote: "undo", dnote: "doc", pret: "undo", hcn: "doc", tod: "tag", todr: "tag", freight: "truck", receipt: "down", payment: "up", expense: "rupee", journal: "book", contra: "repeat" }[k] || "doc");
function acDaybookHtml() {
  const R = acRange(), f = S.acDb || "all", q = key(S.acDbQ || "");
  const E = acEntries().filter((e) => e.date >= R.from && e.date <= R.to && acDbMatch(e, f) && (!q || key(e.party + " " + e.no + " " + e.text + " " + (AC_KIND[e.kind] || "")).includes(q))).reverse();
  const byD = {}; E.forEach((e) => (byD[e.date] = byD[e.date] || []).push(e));
  const shown = Object.keys(byD).slice(0, S.acDbMore ? 400 : 45);
  return `<div class="stack gap-16">${acPeriodChips()}
    <div class="ac-filters"><div class="chips" style="margin:0">${AC_DB_FILTERS.map(([v, l]) => `<button class="chip" data-act="acvDb" data-v="${v}" aria-pressed="${f === v}">${l}</button>`).join("")}</div><div class="search sm">${ic("search")}<input class="input sm" data-in="acvDbQ" placeholder="Party, number, note" value="${esc(S.acDbQ || "")}" aria-label="Search entries"></div></div>
    ${E.length ? shown.map((d) => `<div><div class="group-label"><span>${dayLabel(d)} ${d.slice(0, 4)}</span><span>${byD[d].length}</span></div><div class="group">${byD[d].map(acEntryRow).join("")}</div></div>`).join("") + (Object.keys(byD).length > shown.length ? `<button class="btn btn-secondary" data-act="acvDbMore">Show all ${Object.keys(byD).length} days</button>` : "") : `<div class="empty">No entries ${f === "all" ? "" : "of this kind "}in this period.</div>`}
  </div>`;
}
function acEntryRow(e) {
  const amt = e.total != null ? e.total : acEntryAmt(e), neg = amt < 0;
  return `<button class="row" data-act="acvEntry" data-id="${esc(e.id)}"><span class="attn-ic tint">${ic(acKindIc(e.kind))}</span><span class="grow" style="min-width:0"><div class="row-title clip">${esc(e.party || AC_KIND[e.kind] || "Entry")}</div><div class="row-sub clip">${esc(AC_KIND[e.kind] || "")}${e.no ? " · " + esc(e.no) : e.kind === "sale" ? ` · <span style="color:var(--warn)">no invoice number</span>` : ""}${e.text ? " · " + esc(e.text) : ""}</div></span><span class="row-end"><span class="num" style="font-weight:600${neg ? ";color:var(--bad)" : ""}">${acAmt(amt)}</span>${ic("chevR", "sm chev")}</span></button>`;
}
ACT.acvDb = (el) => { S.acDb = el.dataset.v; S.acDbMore = false; render(); };
ACT.acvDbMore = () => { S.acDbMore = true; render(); };
IN.acvDbQ = (el) => { S.acDbQ = el.value; const at = el.selectionStart; render(); const i = $('[data-in="acvDbQ"]'); if (i) { i.focus(); try { i.setSelectionRange(at, at); } catch (x) {} } };
/* one entry: its debits and credits, and where it came from */
ACT.acvEntry = (el) => {
  const e = acEntries().find((x) => x.id === el.dataset.id); if (!e) return; const ACC = acAccounts();
  const src = e.src || {}, open = src.t === "order" ? `<button class="btn btn-secondary btn-sm" data-act="orderSheet" data-id="${esc(src.ref)}">${ic("orders", "sm")} Open the order</button>` : src.t === "qc" ? `<button class="btn btn-secondary btn-sm" data-act="qcPOSheet" data-po="${esc(src.ref)}">${ic("bolt", "sm")} Open the PO</button>` : src.t === "purchase" ? `<button class="btn btn-secondary btn-sm" data-act="purchaseSheet" data-id="${esc(src.ref)}">${ic("box", "sm")} Open the purchase</button>` : "";
  const from = { order: "a dispatched distributor order", qc: "a Swiggy / Zepto delivery (Hangyo bills it; this is SahiReach's fee)", transfer: "stock moved between SahiReach and quick commerce (Stock → moved stock)", purchase: "a Hangyo purchase entered in Stock", note: "a credit or debit note (TOD & notes)", trip: "a logistics trip", tod: "TOD received (TOD & notes)", vyapar: "the Vyapar sales copied in before the tool", voucher: e.v && e.v.src === "bank" ? "the bank statement" : e.v && e.v.src === "vyapar" ? "the Vyapar import" : "an entry made in Accounts" }[src.t] || "";
  const canNum = src.t === "order" && (AC_CAN || CAN_EDIT);
  openSheet(`${esc(AC_KIND[e.kind] || "Entry")}${e.no ? " · " + esc(e.no) : ""}`, `<div class="card card-pad"><div class="kv"><div><div class="k">Date</div><div class="v">${fmtDate(e.date)} ${e.date.slice(0, 4)}</div></div><div><div class="k">Party</div><div class="v">${esc(e.party || "–")}</div></div><div><div class="k">Amount</div><div class="v">${acAmt(e.total != null ? e.total : acEntryAmt(e))}</div></div>${e.ewb ? `<div><div class="k">E-way bill</div><div class="v">${esc(e.ewb)}</div></div>` : ""}</div>${e.text ? `<div class="row-sub" style="margin-top:12px">${esc(e.text)}</div>` : ""}${e.v && e.v.note ? `<div class="row-sub" style="margin-top:6px">${esc(e.v.note)}</div>` : ""}</div>
    <div style="margin-top:18px"><div class="group-label"><span>Accounts</span><span>debit · credit</span></div><div class="table-wrap card"><table class="t"><thead><tr><th>Account</th><th class="r">Debit</th><th class="r">Credit</th></tr></thead><tbody>${e.lines.map((l) => `<tr><td><button class="btn-plain" data-act="acvLedger" data-id="${esc(l.a)}">${esc(acName(l.a, ACC))}</button></td><td class="r">${l.v > 0 ? acAmt(l.v) : ""}</td><td class="r">${l.v < 0 ? acAmt(-l.v) : ""}</td></tr>`).join("")}</tbody><tfoot><tr class="total"><td>Total</td><td class="r">${acAmt(e.lines.reduce((a, l) => a + Math.max(0, l.v), 0))}</td><td class="r">${acAmt(e.lines.reduce((a, l) => a + Math.max(0, -l.v), 0))}</td></tr></tfoot></table></div></div>
    ${from ? `<div class="row-sub" style="margin-top:12px">${ic("info", "sm")} Made automatically from ${from}.${src.t !== "voucher" ? " Change it there and the books follow." : ""}</div>` : ""}`,
    `${open}${canNum ? `<button class="btn btn-secondary" data-act="aceInvOne" data-t="${src.t}" data-id="${esc(src.ref)}">${ic("pencil", "sm")} Invoice number</button>` : ""}${e.v && AC_CAN ? `<button class="btn btn-secondary" data-act="aceEdit" data-id="${esc(e.v.id)}">${ic("pencil", "sm")} Edit</button><button class="btn btn-secondary" data-act="aceDel" data-id="${esc(e.v.id)}">${ic("trash", "sm")} Delete</button>` : ""}<button class="btn btn-primary" data-act="closeSheet">Done</button>`);
};

/* ---------- Parties: who owes us, whom we owe ---------- */
function acPartiesHtml() {
  const mode = S.acParties || "owed", t = acToday();
  const tog = seg("acParties", mode, [["owed", "Owed to us"], ["owe", "We owe"]]);
  if (mode === "owe") {
    const B = acBalances(AC().from, t), ACC = acAccounts(), L = Object.values(ACC).filter((a) => a.group === "creditors").map((a) => ({ a, bal: -((B[a.id] || {}).close || 0) })).filter((x) => Math.abs(x.bal) > 0.5 || x.a.party === "Hangyo").sort((a, b) => b.bal - a.bal);
    const tot = L.reduce((s, x) => s + x.bal, 0);
    return `<div class="stack gap-16"><div class="ac-filters">${tog}<span class="row-sub">As on ${fmtDate(t)} · total ${rs(tot)}</span></div>
      <div class="group">${L.map((x) => `<button class="row" data-act="acvStatement" data-id="${esc(x.a.id)}"><span class="avatar soft">${esc(initials(x.a.name).slice(0, 1))}</span><span class="grow"><div class="row-title clip">${esc(x.a.name)}</div><div class="row-sub">${x.a.party === "Hangyo" ? "Purchases, less payments, returns and TOD" : "Transport charges, less payments"}</div></span><span class="row-end"><span class="num" style="font-weight:600">${x.bal < 0 ? "Advance " + rs(-x.bal) : rs(x.bal)}</span>${ic("chevR", "sm chev")}</span></button>`).join("") || `<div class="row"><span class="row-sub">Nothing owed.</span></div>`}</div></div>`;
  }
  const age = acAgeing(t), tot = age.reduce((a, x) => a + x.total, 0), od = age.reduce((a, x) => a + x.overdue, 0);
  const B = (k) => age.reduce((a, x) => a + x[k], 0);
  return `<div class="stack gap-16"><div class="ac-filters">${tog}<span class="row-sub">As on ${fmtDate(t)}</span></div>
    <div class="tiles tiles-4"><div class="tile"><div class="tile-label">Owed to us</div><div class="tile-value">${lakhS(tot)}<small>L</small></div><div class="tile-sub">${age.length} part${age.length === 1 ? "y" : "ies"}</div></div><div class="tile"><div class="tile-label">Overdue</div><div class="tile-value" style="color:var(${od > 0.5 ? "--bad" : "--good"})">${rs(od)}</div><div class="tile-sub">Past each party's credit days</div></div><div class="tile"><div class="tile-label">Up to 30 days</div><div class="tile-value">${rs(B("d0"))}</div><div class="tile-sub">31–60: ${rs(B("d30"))}</div></div><div class="tile"><div class="tile-label">Over 60 days</div><div class="tile-value"${B("d60") + B("d90") > 0.5 ? ' style="color:var(--warn)"' : ""}>${rs(B("d60") + B("d90"))}</div><div class="tile-sub">Over 90: ${rs(B("d90"))}</div></div></div>
    <div class="group">${age.map((x) => { const gst = acPartyInfo(x.party).gstin; return `<button class="row" data-act="acvStatement" data-id="${esc(x.id)}"><span class="avatar soft">${esc(initials(x.name).slice(0, 1))}</span><span class="grow" style="min-width:0"><div class="row-title clip">${esc(x.name)}</div><div class="row-sub clip">${x.bills.length} bill${x.bills.length === 1 ? "" : "s"} open${x.oldest ? " · oldest " + fmtDate(x.oldest) + " (" + daysBetween(x.oldest, t) + " days)" : ""} · ${x.credit} days credit${gst ? "" : ` · <span style="color:var(--warn)">no GSTIN</span>`}</div></span><span class="row-end" style="flex-direction:column;align-items:flex-end;gap:2px"><span class="num" style="font-weight:600">${x.total > 0.5 ? rs(x.total) : x.advance > 0.5 ? "Advance " + rs(x.advance) : "Settled"}</span>${x.overdue > 0.5 ? `<span class="pill bad" style="height:20px;font-size:11px">${rs(x.overdue)} overdue</span>` : ""}</span>${ic("chevR", "sm chev")}</button>`; }).join("") || `<div class="row"><span class="row-sub">Nobody owes anything.</span></div>`}</div>
    ${AC_CAN ? `<div class="row-sub">Payments recorded as Money in (or from the bank statement) clear the oldest bills first.</div>` : ""}</div>`;
}
ACT.acvStatement = (el) => acStatementSheet(el.dataset.id);
ACT.acvLedger = (el) => acStatementSheet(el.dataset.id);
/* a ledger / party statement: opening, every entry with a running balance, closing */
function acStatementSheet(id) {
  const ACC = acAccounts(), a = ACC[id] || { id, name: acName(id, ACC), group: "" }, R = acRange(), L = acLedger(id, R.from, R.to), party = a.party, info = party ? acPartyInfo(party) : null;
  const O = party && a.group === "debtors" ? acOpenBills(party, acToday()) : null, g = AC_GROUP[a.group] || {};
  S.acStmt = id;
  openSheet(esc(a.name), `<div class="card card-pad"><div class="hstack" style="justify-content:space-between;gap:12px;align-items:flex-start"><div><div class="row-sub">${esc(g.label || "")}${g.formal && g.formal !== g.label ? " · " + esc(g.formal) : ""}</div><div class="section-title" style="font-size:24px;margin-top:4px">${acDrCr(L.close)}</div><div class="row-sub">Balance on ${fmtDate(R.to)} ${R.to.slice(0, 4)}${a.group === "debtors" ? (L.close > 0 ? " · they owe us" : L.close < 0 ? " · paid in advance" : "") : a.group === "creditors" ? (L.close < 0 ? " · we owe them" : "") : ""}</div></div>${info ? `<div style="text-align:right"><div class="row-sub">GSTIN</div><div class="mono" style="font-weight:600">${info.gstin ? esc(info.gstin) : '<span style="color:var(--warn)">not added</span>'}</div>${AC_CAN ? `<button class="btn-plain" data-act="aceParty" data-p="${esc(party)}">Edit details</button>` : ""}</div>` : ""}</div>
      <div class="kv" style="margin-top:14px"><div><div class="k">Opening ${fmtDate(R.from)}</div><div class="v">${acDrCr(L.open)}</div></div><div><div class="k">Debits</div><div class="v">${acAmt(L.dr)}</div></div><div><div class="k">Credits</div><div class="v">${acAmt(L.cr)}</div></div><div><div class="k">Entries</div><div class="v">${L.rows.length}</div></div></div></div>
    ${O && O.bills.length ? `<div style="margin-top:18px"><div class="group-label"><span>Bills still open</span><span>${rs(O.bills.reduce((s, b) => s + b.left, 0))}</span></div><div class="group">${O.bills.slice(0, 12).map((b) => { const age = daysBetween(b.date, acToday()), cr = (distByKey[key(party)] || {}).credit || 7; return `<div class="row"><span class="grow"><div class="row-title">${esc(b.no || "Bill")}</div><div class="row-sub">${fmtDate(b.date)} · ${age} days${age > cr ? ` · <span style="color:var(--bad)">overdue</span>` : ""}${b.left < b.amt - 0.5 ? ` · part paid (bill ${rs(b.amt)})` : ""}</div></span><span class="num" style="font-weight:600">${rs2(b.left)}</span></div>`; }).join("")}${O.bills.length > 12 ? `<div class="row"><span class="row-sub">and ${O.bills.length - 12} more</span></div>` : ""}</div></div>` : ""}
    <div style="margin-top:18px"><div class="group-label"><span>Entries · ${esc(R.label)}</span><span>debit · credit · balance</span></div>
      <div class="table-wrap card" style="max-height:420px;overflow:auto"><table class="t"><thead><tr><th>Date</th><th>Particulars</th><th class="r">Debit</th><th class="r">Credit</th><th class="r">Balance</th></tr></thead><tbody>
      <tr><td>${fmtDate(R.from)}</td><td class="dim">Opening balance</td><td></td><td></td><td class="r">${acDrCr(L.open)}</td></tr>
      ${L.rows.map((r) => `<tr><td>${fmtDate(r.e.date)}</td><td><button class="btn-plain" style="text-align:left" data-act="acvEntry" data-id="${esc(r.e.id)}">${esc(AC_KIND[r.e.kind] || "Entry")}${r.e.no ? " " + esc(r.e.no) : ""}</button><div class="row-sub clip" style="max-width:320px">${esc(id.startsWith("p:") ? r.e.text : r.e.party || r.e.text)}</div></td><td class="r">${r.v > 0 ? acAmt(r.v) : ""}</td><td class="r">${r.v < 0 ? acAmt(-r.v) : ""}</td><td class="r">${acDrCr(r.bal)}</td></tr>`).join("")}
      </tbody><tfoot><tr class="total"><td></td><td>Closing balance</td><td class="r">${acAmt(L.dr)}</td><td class="r">${acAmt(L.cr)}</td><td class="r">${acDrCr(L.close)}</td></tr></tfoot></table></div></div>`,
    `${party ? `<button class="btn btn-secondary" data-act="acvStmtPdf" data-id="${esc(id)}">${ic("doc", "sm")} Statement PDF</button>` : ""}<button class="btn btn-secondary" data-act="acvStmtExcel" data-id="${esc(id)}">${ic("doc", "sm")} Excel</button>${AC_CAN && a.group === "debtors" ? `<button class="btn btn-primary" data-act="aceNew" data-t="receipt" data-party="${esc(id)}">${ic("down", "sm")} Money in</button>` : AC_CAN && a.group === "creditors" ? `<button class="btn btn-primary" data-act="aceNew" data-t="payment" data-party="${esc(id)}">${ic("up", "sm")} Pay</button>` : `<button class="btn btn-primary" data-act="closeSheet">Done</button>`}`, true);
}

/* ---------- Reports ---------- */
function acReportsHtml() {
  const r = S.acRep || "pl";
  const ch = [["pl", "Profit and loss"], ["bs", "Balance sheet"], ["tb", "Trial balance"], ["ledgers", "Ledgers"]];
  return `<div class="stack gap-16"><div class="chips" style="margin:0">${ch.map(([v, l]) => `<button class="chip" data-act="acvRep" data-v="${v}" aria-pressed="${r === v}">${l}</button>`).join("")}</div>
    ${acPeriodChips(r === "bs" || r === "tb")}
    ${{ pl: acPLHtml, bs: acBSHtml, tb: acTBHtml, ledgers: acLedgersHtml }[r]()}</div>`;
}
ACT.acvRep = (el) => { S.acRep = el.dataset.v; render(); };
const acLine = (label, v, cls, act) => `<div class="ac-line${cls ? " " + cls : ""}">${act ? `<button class="btn-plain" ${act}>${label}</button>` : `<span>${label}</span>`}<span class="num">${v == null ? "–" : acAmt(v)}</span></div>`;
function acPLHtml() {
  const R = acRange(), P = acPL(R.from, R.to), gm = P.salesNet ? P.gp / P.salesNet : null, nm = P.salesNet ? P.np / P.salesNet : null;
  const led = (x, neg) => acLine(esc(x.name), neg ? -x.v : x.v, "sub", `data-act="acvLedger" data-id="${esc(x.id)}"`);
  const stk = (s, label, d) => `<div class="ac-line sub"><span>${label}${s.how === "tool" ? ` <span class="dim">· from the tool's stock records${s.miss ? `, ${s.miss} product${s.miss > 1 ? "s" : ""} without a cost` : ""}</span>` : s.how === "entered" ? ` <span class="dim">· entered</span>` : s.how === "opening" ? ` <span class="dim">· opening balance</span>` : ""}${AC_CAN && s.how !== "opening" ? ` <button class="btn-plain" data-act="aceStock" data-d="${d}">${s.v == null ? "Enter" : "Change"}</button>` : ""}</span><span class="num">${s.v == null ? `<span style="color:var(--warn)">needed</span>` : acAmt(s.v)}</span></div>`;
  return `${P.purGap ? `<div class="banner warn">${ic("alert", "sm")}<span><b>Profit is not final yet.</b> Sales from ${fmtDate(R.from)} are in the books, but Hangyo purchases only from ${fmtDate(P.purGap)} (when the tool started). ${AC_CAN ? `<button class="btn-plain" data-act="aceVyapar">Upload the earlier purchases from Vyapar</button>, or pick a period from ${fmtDate(P.purGap)}.` : "Earlier purchases are to be brought in from Vyapar."}</span></div>` : ""}${P.stockGap ? `<div class="banner warn">${ic("alert", "sm")}<span><b>The stock value is needed.</b> The tool's stock records start on ${fmtDate(acStockFirst())}, so the stock on ${fmtDate(P.os.v == null ? addDays(R.from, -1) : R.to)} is not known. Enter it (from your Vyapar stock report) to see gross and net profit.</span></div>` : ""}
    <div class="ac-hero card card-pad"><div><div class="row-sub">Net profit · ${esc(R.label)}</div><div class="ac-hero-v"${P.np < 0 ? ' style="color:var(--bad)"' : ""}>${P.stockGap ? "–" : acAmt(P.np, 0)}</div><div class="row-sub">${nm != null && !P.stockGap ? pct(nm, 1) + " of sales" : ""}</div></div>
      <div class="ac-hero-kv"><div><div class="k">Sales</div><div class="v">${acAmt(P.salesNet, 0)}</div></div><div><div class="k">Gross profit</div><div class="v">${P.stockGap ? "–" : acAmt(P.gp, 0)}</div><div class="k">${gm != null && !P.stockGap ? pct(gm, 1) + " margin" : ""}</div></div><div><div class="k">Running costs</div><div class="v">${acAmt(P.expT, 0)}</div></div></div></div>
    <div class="card ac-stmt">
      <div class="ac-sec">Sales</div>${P.sales.map((x) => led(x, true)).join("") || acLine("No sales", 0, "sub")}${acLine("Net sales", P.salesNet, "total")}
      <div class="ac-sec">Cost of the stock sold</div>${stk(P.os, "Opening stock", addDays(R.from, -1))}${P.purch.map((x) => led(x)).join("")}${P.direct.map((x) => led(x)).join("")}${stk(P.cs, "Less closing stock", R.to)}${acLine("Cost of goods sold", P.stockGap ? null : P.cogs, "total")}
      ${acLine("Gross profit", P.stockGap ? null : P.gp, "grand")}
      ${P.inc.length ? `<div class="ac-sec">Other income</div>${P.inc.map((x) => led(x, true)).join("")}${acLine("Total other income", P.incT, "total")}` : ""}
      <div class="ac-sec">Running costs</div>${P.exp.map((x) => led(x)).join("") || acLine("None entered yet", 0, "sub")}${acLine("Total running costs", P.expT, "total")}
      ${acLine("Net profit", P.stockGap ? null : P.np, "grand" + (P.np < 0 ? " neg" : ""))}
    </div>
    <div class="row-sub">All figures exclude GST. Stock is SahiReach's own stock at cost (the SS rate); quick commerce stock is Hangyo's. Quick commerce gives a 6% fee, not sales. TOD support from Hangyo is counted when the order is dispatched.</div>`;
}
function acBSHtml() {
  const R = acRange(), d = R.to, BS = acBS(d), ACC = acAccounts();
  const glabel = { advrecv: "Advances received from parties", advpaid: "Advances paid to parties", gst: "GST", profit: "Profit and loss", diff: "Opening balances", stock: "Stock" };
  const side = (s, order) => order.filter((g) => s[g] && s[g].length).map((g) => { const L = s[g], t = L.reduce((a, x) => a + x.v, 0), lab = (AC_GROUP[g] || {}).label || glabel[g] || g; return `<div class="ac-sec">${esc(lab)}<span class="num">${acAmt(t)}</span></div>${L.sort((a, b) => b.v - a.v).slice(0, 40).map((x) => acLine(esc(x.name), x.v, "sub", ACC[x.id] ? `data-act="acvLedger" data-id="${esc(x.id)}"` : "")).join("")}${L.length > 40 ? acLine(`and ${L.length - 40} more`, L.slice(40).reduce((a, x) => a + x.v, 0), "sub") : ""}`; }).join("");
  const ok = Math.abs(BS.assets - BS.liab) < 1;
  return `${BS.stockGap ? `<div class="banner warn">${ic("alert", "sm")}<span>The stock value on ${fmtDate(d)} is not known (the tool's stock records start ${fmtDate(acStockFirst())}). ${AC_CAN ? `<button class="btn-plain" data-act="aceStock" data-d="${d}">Enter it</button>` : ""}</span></div>` : ""}
    <div class="grid-2">
      <div class="card ac-stmt"><div class="ac-head">What we have <span class="row-sub">Assets</span></div>${side(BS.sides.A, ["fixed", "stock", "debtors", "advpaid", "bank", "cash", "taxin", "gst", "advances", "curasset"])}${acLine("Total", BS.assets, "grand")}</div>
      <div class="card ac-stmt"><div class="ac-head">What we owe, and partners' money <span class="row-sub">Liabilities and capital</span></div>${side(BS.sides.L, ["capital", "profit", "loans", "creditors", "advrecv", "deposits", "taxout", "gst", "curliab", "diff"])}${acLine("Total", BS.liab, "grand")}</div>
    </div>
    <div class="banner ${ok ? "good" : "warn"}">${ic(ok ? "check" : "alert", "sm")}<span>${ok ? `Balanced on ${fmtDate(d)} ${d.slice(0, 4)}: what we have equals what we owe plus partners' money.` : `Off by ${rs(Math.abs(BS.assets - BS.liab))}. Check the opening balances and the stock value.`}</span></div>`;
}
function acTB(d) {
  const B = acBalances(AC().from, d), ACC = acAccounts(), rows = [];
  Object.keys(B).forEach((id) => { const v = B[id].close; if (Math.abs(v) < 0.005) return; const a = ACC[id] || { name: acName(id, ACC), group: id.startsWith("p:") ? "debtors" : "curliab" }; rows.push({ id, name: a.name, group: a.group, v }); });
  const order = AC_GROUPS.map((g) => g[0]); rows.sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group) || a.name.localeCompare(b.name));
  const dr = acR2(rows.reduce((a, r) => a + Math.max(0, r.v), 0)), cr = acR2(rows.reduce((a, r) => a + Math.max(0, -r.v), 0));
  return { rows, dr, cr };
}
function acTBHtml() {
  const R = acRange(), T = acTB(R.to), cs = acStockAt(R.to); let g = "";
  return `<div class="card"><div class="table-wrap"><table class="t"><thead><tr><th>Account</th><th class="r">Debit</th><th class="r">Credit</th></tr></thead><tbody>
    ${T.rows.map((r) => { const head = r.group !== g ? ((g = r.group), `<tr class="ac-grp"><td colspan="3">${esc((AC_GROUP[r.group] || {}).label || r.group)} <span class="dim">· ${esc((AC_GROUP[r.group] || {}).formal || "")}</span></td></tr>`) : ""; return head + `<tr><td><button class="btn-plain" data-act="acvLedger" data-id="${esc(r.id)}">${esc(r.name)}</button></td><td class="r">${r.v > 0 ? acAmt(r.v) : ""}</td><td class="r">${r.v < 0 ? acAmt(-r.v) : ""}</td></tr>`; }).join("")}
    </tbody><tfoot><tr class="total"><td>Total</td><td class="r">${acAmt(T.dr)}</td><td class="r">${acAmt(T.cr)}</td></tr></tfoot></table></div></div>
    <div class="banner ${Math.abs(T.dr - T.cr) < 0.05 ? "good" : "warn"}">${ic(Math.abs(T.dr - T.cr) < 0.05 ? "check" : "alert", "sm")}<span>${Math.abs(T.dr - T.cr) < 0.05 ? "Debits equal credits." : `Debits and credits differ by ${rs2(Math.abs(T.dr - T.cr))}: the opening balances do not balance.`} Closing stock on ${fmtDate(R.to)}: ${cs.v == null ? "not known" : acAmt(cs.v)} (shown in the balance sheet, not in the trial balance).</span></div>`;
}
function acLedgersHtml() {
  const R = acRange(), B = acBalances(R.from, R.to), ACC = acAccounts(), q = key(S.acLedQ || "");
  const all = Object.values(ACC).filter((a) => !q || key(a.name).includes(q));
  return `<div class="ac-filters"><div class="search sm">${ic("search")}<input class="input sm" data-in="acvLedQ" placeholder="Find an account" value="${esc(S.acLedQ || "")}" aria-label="Find an account"></div>${AC_CAN ? `<button class="btn btn-secondary btn-sm" data-act="aceLedgerNew">${ic("plus", "sm")} New account</button>` : ""}</div>
    ${AC_GROUPS.map(([gid, label, formal]) => { const L = all.filter((a) => a.group === gid); if (!L.length) return ""; const used = L.filter((a) => B[a.id] && (Math.abs(B[a.id].close) > 0.004 || B[a.id].dr || B[a.id].cr)); const show = q ? L : used.length ? used.concat(L.filter((a) => !used.includes(a) && !a.starter && !a.sys)) : L.filter((a) => !a.sys || a.group === "cash"); if (!show.length) return ""; return `<div><div class="group-label"><span>${esc(label)} <span class="dim">· ${esc(formal)}</span></span><span>${show.length}</span></div><div class="group">${show.sort((a, b) => a.name.localeCompare(b.name)).map((a) => { const x = B[a.id] || { close: 0 }; return `<button class="row" data-act="acvLedger" data-id="${esc(a.id)}"><span class="grow clip"><div class="row-title clip">${esc(a.name)}</div></span><span class="row-end"><span class="num">${acDrCr(x.close)}</span>${ic("chevR", "sm chev")}</span></button>`; }).join("")}</div></div>`; }).join("")}`;
}
IN.acvLedQ = (el) => { S.acLedQ = el.value; const at = el.selectionStart; render(); const i = $('[data-in="acvLedQ"]'); if (i) { i.focus(); try { i.setSelectionRange(at, at); } catch (x) {} } };

/* ---------- GST ---------- */
function acGstMonths() { const out = [], t = acToday(); let d = toDate(acFYStart(t)); const A = AC(); if (ymd(d) < A.from) d = toDate(A.from.slice(0, 7) + "-01"); while (ymd(d) <= t) { out.push(ymd(d).slice(0, 7)); d = new Date(d.getFullYear(), d.getMonth() + 1, 1); } const p = acFY(t) - 1; if (`${p}-04-01` >= A.from) { /* last year too */ } return out.reverse(); }
function acGstHtml() {
  const ms = acGstMonths(), m = S.acGstM && ms.includes(S.acGstM) ? S.acGstM : ms[0] || acToday().slice(0, 7), from = m + "-01", end = ymd(new Date(+m.slice(0, 4), +m.slice(5, 7), 0)), to = end > acToday() ? acToday() : end, G = acGST(from, to);
  const sum = (L, k) => L.reduce((a, r) => a + (r[k] || 0), 0), mg = Object.keys(G.missingGstin);
  const tbl = (head, rows, foot) => `<div class="table-wrap"><table class="t"><thead><tr>${head.map((h, i) => `<th class="${i > 2 ? "r" : ""}">${h}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody>${foot ? `<tfoot><tr class="total">${foot.map((c, i) => `<td class="${i > 2 ? "r" : ""}">${c}</td>`).join("")}</tr></tfoot>` : ""}</table></div>`;
  const invRow = (r) => `<tr><td>${r.no ? esc(r.no) : `<span style="color:var(--warn)">No number</span>`}</td><td>${fmtDate(r.date)}</td><td class="clip" style="max-width:220px">${esc(r.party)}${r.gstin ? `<div class="row-sub mono">${esc(r.gstin)}</div>` : ""}</td><td class="r">${acAmt(r.taxable)}</td><td class="r">${acAmt(r.cgst + r.sgst)}</td><td class="r">${acAmt(r.igst)}</td><td class="r">${acAmt(r.total)}</td></tr>`;
  const H = ["Invoice", "Date", "Party", "Taxable", "CGST + SGST", "IGST", "Total"];
  const b2cT = sum(G.b2c, "taxable"), hs = Object.values(G.hsn);
  return `<div class="stack gap-16">
    <div class="chips" style="margin:0">${ms.map((k) => `<button class="chip" data-act="acvGstM" data-m="${k}" aria-pressed="${k === m}">${MONTH_LONG[+k.slice(5) - 1].slice(0, 3)} ${k.slice(2, 4)}</button>`).join("")}</div>
    <div class="tiles tiles-4">
      <div class="tile"><div class="tile-label">Sales (taxable)</div><div class="tile-value">${rs(G.taxable)}</div><div class="tile-sub">${G.b2b.length} B2B invoices · ${G.b2c.length} B2C · ${G.cdn.length} notes</div></div>
      <div class="tile"><div class="tile-label">GST on sales</div><div class="tile-value">${rs(G.outTax)}</div><div class="tile-sub">CGST ${rs(G.tax.cgst)} · SGST ${rs(G.tax.sgst)}${G.tax.igst ? " · IGST " + rs(G.tax.igst) : ""}</div></div>
      <div class="tile"><div class="tile-label">GST paid on purchases</div><div class="tile-value">${rs(G.inTax)}</div><div class="tile-sub">Input credit from ${G.purchases.length} bill${G.purchases.length === 1 ? "" : "s"}</div></div>
      <div class="tile"><div class="tile-label">${G.net >= 0 ? "GST to pay" : "Credit to carry forward"}</div><div class="tile-value" style="color:var(--${G.net >= 0 ? "ink" : "good"})">${rs(Math.abs(G.net))}</div><div class="tile-sub">${MONTH_LONG[+m.slice(5) - 1]} ${m.slice(0, 4)}${to < end ? " so far" : ""} · due by 20 ${MONTH_LONG[(+m.slice(5)) % 12]}</div></div>
    </div>
    ${G.missingNo.length ? `<div class="banner warn">${ic("alert", "sm")}<span><b>${G.missingNo.length} sale${G.missingNo.length === 1 ? "" : "s"} without an invoice number.</b> GSTR-1 needs the Vyapar number for each one. ${AC_CAN || CAN_EDIT ? `<button class="btn-plain" data-act="aceInvSheet">Add them</button>` : ""}</span></div>` : ""}
    ${mg.length ? `<div class="banner info">${ic("info", "sm")}<span>${mg.length} part${mg.length === 1 ? "y has" : "ies have"} no GSTIN (${esc(mg.slice(0, 4).join(", "))}${mg.length > 4 ? "…" : ""}), so their sales are counted as B2C. ${AC_CAN ? `<button class="btn-plain" data-act="aceParty" data-p="${esc(mg[0])}">Add GSTIN</button>` : ""}</span></div>` : ""}
    <div class="card"><div class="card-head"><div><div class="card-title">GSTR-3B summary</div><div class="card-sub">What goes in the monthly return</div></div></div><div class="table-wrap"><table class="t"><thead><tr><th>Section</th><th class="r">Taxable</th><th class="r">IGST</th><th class="r">CGST</th><th class="r">SGST</th></tr></thead><tbody>
      <tr><td>3.1 (a) Outward taxable supplies</td><td class="r">${acAmt(G.taxable)}</td><td class="r">${acAmt(G.tax.igst)}</td><td class="r">${acAmt(G.tax.cgst)}</td><td class="r">${acAmt(G.tax.sgst)}</td></tr>
      <tr><td>4 (A)(5) Input tax credit, all other</td><td class="r">${acAmt(G.itcTaxable)}</td><td class="r">${acAmt(G.itc.igst)}</td><td class="r">${acAmt(G.itc.cgst)}</td><td class="r">${acAmt(G.itc.sgst)}</td></tr>
      </tbody><tfoot><tr class="total"><td>Net tax ${G.net >= 0 ? "payable" : "(credit)"}</td><td></td><td class="r">${acAmt(G.tax.igst - G.itc.igst)}</td><td class="r">${acAmt(G.tax.cgst - G.itc.cgst)}</td><td class="r">${acAmt(G.tax.sgst - G.itc.sgst)}</td></tr></tfoot></table></div>
      <div class="card-pad row-sub" style="padding-top:8px">Credit is used IGST first, then CGST and SGST, on the GST portal. Any credit carried in from earlier months is not shown here.</div></div>
    <div class="card"><div class="card-head"><div><div class="card-title">GSTR-1 · B2B invoices</div><div class="card-sub">Parties with a GSTIN · ${G.b2b.length}</div></div></div>${G.b2b.length ? tbl(H, G.b2b.map(invRow), ["", "", "Total", acAmt(sum(G.b2b, "taxable")), acAmt(sum(G.b2b, "cgst") + sum(G.b2b, "sgst")), acAmt(sum(G.b2b, "igst")), acAmt(sum(G.b2b, "total"))]) : `<div class="empty">None this month${G.b2c.length ? " (add the parties' GSTINs)" : ""}.</div>`}</div>
    ${G.b2c.length ? `<div class="card"><div class="card-head"><div><div class="card-title">GSTR-1 · B2C (small)</div><div class="card-sub">No GSTIN on record · reported as one total per state and rate</div></div></div>${tbl(H, G.b2c.map(invRow), ["", "", "Total", acAmt(b2cT), acAmt(sum(G.b2c, "cgst") + sum(G.b2c, "sgst")), acAmt(sum(G.b2c, "igst")), acAmt(sum(G.b2c, "total"))])}</div>` : ""}
    ${G.cdn.length ? `<div class="card"><div class="card-head"><div><div class="card-title">GSTR-1 · Credit and debit notes</div><div class="card-sub">${G.cdn.length}</div></div></div>${tbl(["Note", "Date", "Party", "Taxable", "CGST + SGST", "IGST", "Total"], G.cdn.map(invRow))}</div>` : ""}
    <div class="card"><div class="card-head"><div><div class="card-title">GSTR-1 · HSN summary</div><div class="card-sub">Quantity in boxes</div></div></div>${tbl(["HSN", "Description", "", "Boxes", "Taxable", "Rate"], hs.map((h) => `<tr><td class="mono">${esc(h.hsn)}</td><td>${esc(h.desc)}</td><td></td><td class="r">${nf(h.qty)}</td><td class="r">${acAmt(h.taxable)}</td><td class="r">5%</td></tr>`))}</div>
    <div class="card"><div class="card-head"><div><div class="card-title">Input tax credit · purchase bills</div><div class="card-sub">${G.purchases.length} · check against GSTR-2B before claiming</div></div></div>${G.purchases.length ? tbl(["Bill", "Date", "From", "Taxable", "CGST + SGST", "IGST", ""], G.purchases.map((r) => `<tr><td>${esc(r.no || "–")}</td><td>${fmtDate(r.date)}</td><td>${esc(r.party)}</td><td class="r">${acAmt(r.taxable)}</td><td class="r">${acAmt(r.cgst + r.sgst)}</td><td class="r">${acAmt(r.igst)}</td><td></td></tr>`)) : `<div class="empty">No purchase bills this month.</div>`}</div>
    <div class="hstack gap-8 wrap"><button class="btn btn-secondary" data-act="acvGstExcel" data-m="${m}">${ic("doc", "sm")} GSTR-1 and 3B workings (Excel)</button></div>
    <div class="row-sub">E-way bills stay in Vyapar; their numbers are kept against each dispatch. E-invoicing (IRN) can be switched on here when it becomes compulsory for SahiReach.</div>
  </div>`;
}
ACT.acvGstM = (el) => { S.acGstM = el.dataset.m; render(); };

/* ---------- Bank ---------- */
function acBankHtml() {
  const t = acToday(), B = acBalances(AC().from, t), money = acMoneyAccs(), A = AC();
  return `<div class="stack gap-16">
    <div class="group">${money.map((a) => { const st = A.bank.stmts.filter((s) => s.acc === a.id), last = st.reduce((m, s) => (s.to > (m ? m.to : "") ? s : m), null), un = st.reduce((n, s) => n + s.rows.filter((r) => !r.v && !r.skip).length, 0); return `<button class="row" data-act="acvLedger" data-id="${esc(a.id)}"><span class="attn-ic tint">${ic(a.group === "bank" ? "bank" : "rupee")}</span><span class="grow"><div class="row-title">${esc(a.name)}</div><div class="row-sub">${a.group === "bank" ? (last ? `Statement to ${fmtDate(last.to)}${last.bal != null ? " · bank says " + rs2(last.bal) : ""}${un ? ` · <span style="color:var(--warn)">${un} line${un === 1 ? "" : "s"} to sort</span>` : " · all in the books"}` : "No statement uploaded yet") : "Cash in hand"}</div></span><span class="row-end"><span class="num" style="font-weight:600">${acDrCr((B[a.id] || {}).close || 0)}</span>${ic("chevR", "sm chev")}</span></button>`; }).join("")}</div>
    ${AC_CAN ? `<div class="hstack gap-8 wrap"><button class="btn btn-secondary btn-sm" data-act="aceLedgerNew" data-g="bank">${ic("plus", "sm")} Add bank account</button><button class="btn btn-secondary btn-sm" data-act="aceNew" data-t="contra">${ic("repeat", "sm")} Move money between accounts</button></div>` : ""}
    ${AC_CAN ? (acHasBank() ? `<div class="card card-pad"><div class="card-title" style="margin-bottom:4px">Upload a bank statement</div><div class="card-sub" style="margin-bottom:12px">Excel or CSV from net banking. Each line is matched to a distributor, Hangyo, a transporter or an expense; you check and add them.</div>${money.filter((a) => a.group === "bank").length > 1 ? `<div class="field" style="margin-bottom:10px"><label class="label" for="ac-bank-acc">Statement of</label><select class="select" id="ac-bank-acc">${money.filter((a) => a.group === "bank").map((a) => `<option value="${esc(a.id)}">${esc(a.name)}</option>`).join("")}</select></div>` : ""}${dropZone({ input: "ac-bank-file", dataIn: "aceBankFile", accept: ".xlsx,.xls,.csv", title: "Bank statement", sub: "Excel (.xlsx, .xls) or CSV" })}</div>` : `<div class="banner info">${ic("info", "sm")}<span>Add your bank account first, then upload its statement here.</span></div>`) : ""}
    ${acBankRowsHtml()}
  </div>`;
}
const acBankUnmatched = () => AC().bank.stmts.reduce((n, s) => n + s.rows.filter((r) => !r.v && !r.skip).length, 0);

/* ===== ACCOUNTS: entering things =====
   Money in, money out, expenses, transfers between bank and cash, journals, opening balances, new accounts,
   party GST details, a stock value for a day, the Vyapar invoice numbers of dispatches, and bringing in what
   Vyapar recorded before the tool. Each voucher is kept in D.acct.vouchers and saved like everything else. */
/* an account picker, grouped */
function acSelect(id, val, groups, dataIn, extra) {
  const ACC = acAccounts(), L = Object.values(ACC).filter((a) => !groups || groups.includes(a.group));
  return `<select class="select" id="${id}" data-in="${dataIn}"${extra || ""}><option value="">Choose…</option>${AC_GROUPS.filter(([g]) => L.some((a) => a.group === g)).map(([g, label]) => `<optgroup label="${esc(label)}">${L.filter((a) => a.group === g).sort((a, b) => a.name.localeCompare(b.name)).map((a) => `<option value="${esc(a.id)}"${a.id === val ? " selected" : ""}>${esc(a.name)}</option>`).join("")}</optgroup>`).join("")}</select>`;
}
const AC_MONEY_G = ["bank", "cash"], AC_EXP_G = ["expenses", "direct", "fixed", "purchases", "advances", "curasset"];
const AC_PARTY_IN = ["debtors", "creditors", "capital", "loans", "deposits", "income", "curliab", "advances", "curasset", "taxout", "taxin"];
const AC_PARTY_OUT = ["creditors", "debtors", "expenses", "direct", "fixed", "capital", "loans", "deposits", "taxout", "taxin", "curliab", "advances", "curasset"];

/* ---------- choose what to enter ---------- */
ACT.aceNew = (el) => {
  const t = el && el.dataset && el.dataset.t;
  if (t) return acVoucherSheet({ type: t, party: el.dataset.party || "" });
  const opt = (t, icon, title, sub) => `<button class="row" data-act="aceNew" data-t="${t}"><span class="attn-ic tint">${ic(icon)}</span><span class="grow"><div class="row-title">${title}</div><div class="row-sub">${sub}</div></span>${ic("chevR", "sm chev")}</button>`;
  openSheet("New entry", `<div class="group">
    ${opt("receipt", "down", "Money in", "A distributor paid us, Hangyo paid the quick commerce fee, or partners put money in")}
    ${opt("payment", "up", "Money out", "We paid Hangyo, a transporter, salaries, GST or anything else")}
    ${opt("expense", "rupee", "Expense", "A bill: rent, electricity, cold storage, repairs… paid now or later")}
    ${opt("contra", "repeat", "Move money", "Cash deposited in the bank, cash withdrawn, between bank accounts")}
    ${opt("journal", "book", "Journal", "Anything else: adjustments, depreciation, provisions (debits = credits)")}
  </div>
  <div class="group" style="margin-top:16px">
    <button class="row" data-act="aceOpening"><span class="attn-ic info">${ic("cal")}</span><span class="grow"><div class="row-title">Opening balances</div><div class="row-sub">As the books stood on ${fmtDate(addDays(AC().from, -1))} ${AC().from.slice(0, 4) - 0}</div></span>${ic("chevR", "sm chev")}</button>
    <button class="row" data-act="aceLedgerNew"><span class="attn-ic info">${ic("plus")}</span><span class="grow"><div class="row-title">New account</div><div class="row-sub">A bank account, partner, expense head, loan…</div></span>${ic("chevR", "sm chev")}</button>
    <button class="row" data-act="aceInvSheet"><span class="attn-ic info">${ic("doc")}</span><span class="grow"><div class="row-title">Vyapar invoice numbers</div><div class="row-sub">${acToNumber().length} dispatch${acToNumber().length === 1 ? "" : "es"} still without one</div></span>${ic("chevR", "sm chev")}</button>
    <button class="row" data-act="aceVyapar"><span class="attn-ic info">${ic("repeat")}</span><span class="grow"><div class="row-title">Upload accounting data</div><div class="row-sub">Vyapar reports or the template: payments, receipts, expenses, purchases, notes, opening balances</div></span>${ic("chevR", "sm chev")}</button>
  </div>`);
};

/* ---------- the voucher form ---------- */
function acVoucherSheet(init) {
  const t = init.type, today = acToday(), money = acMoneyAccs();
  S.acV = Object.assign({ type: t, date: today, party: "", money: (money[0] || {}).id || "cash", to: "", amount: "", ref: "", note: "", gst: "0", inter: false, gstin: "", bill: "", paidHow: "money", lines: [{ a: "", dr: "", cr: "" }, { a: "", dr: "", cr: "" }] }, init);
  if (t === "contra" && !S.acV.to) S.acV.to = (money.find((m) => m.id !== S.acV.money) || {}).id || "";
  acVoucherOpen();
}
function acVoucherOpen() {
  const V = S.acV, title = (V.id ? "Edit · " : "") + (AC_VTYPES[V.type] || ["Entry"])[0];
  openSheet(title, `<div id="acv-form">${acVoucherForm()}</div>`, `<button class="btn btn-secondary" data-act="closeSheet">Cancel</button><button class="btn btn-primary" data-act="aceSave">${ic("check", "sm")} ${V.id ? "Save changes" : "Save"}</button>`);
}
function acVoucherForm() {
  const V = S.acV, f = (label, html, full, hint) => `<div class="field${full ? " full" : ""}"><label class="label">${label}</label>${html}${hint ? `<div class="row-sub" style="margin-top:4px">${hint}</div>` : ""}</div>`;
  const inp = (k, type, ph, extra) => `<input class="input${type === "number" ? " num-in" : ""}" type="${type}" data-in="aceV" data-k="${k}" value="${esc(V[k])}" placeholder="${esc(ph || "")}"${type === "number" ? ' inputmode="decimal" step="0.01" min="0"' : ""}${extra || ""}>`;
  const date = f("Date", inp("date", "date")), amt = f("Amount (₹)", inp("amount", "number", "0.00")), ref = f(V.type === "receipt" || V.type === "payment" ? "Reference" : "Bill / reference no.", inp("ref", "text", V.type === "receipt" ? "UTR, cheque no." : "Optional")), note = f("Note", inp("note", "text", "Optional"), true);
  let hint = "";
  if ((V.type === "receipt" || V.type === "payment") && V.party) { const L = acLedger(V.party, AC().from, acToday()); hint = `Balance now: ${acDrCr(L.close)}${V.party.startsWith("p:") && (acAccounts()[V.party] || {}).group === "debtors" ? (() => { const O = acOpenBills((acAccounts()[V.party] || {}).party, acToday()); return O.bills.length ? ` · ${O.bills.length} bill${O.bills.length > 1 ? "s" : ""} open, oldest ${fmtDate(O.bills[0].date)} for ${rs2(O.bills[0].left)}` : ""; })() : ""}`; }
  if (V.type === "receipt") return `<div class="form-grid">${f("Received from", acSelect("acv-party", V.party, AC_PARTY_IN, "aceV", ' data-k="party"'), true, hint)}${f("Into", acSelect("acv-money", V.money, AC_MONEY_G, "aceV", ' data-k="money"'))}${amt}${date}${ref}${note}</div>`;
  if (V.type === "payment") return `<div class="form-grid">${f("Paid to", acSelect("acv-party", V.party, AC_PARTY_OUT, "aceV", ' data-k="party"'), true, hint)}${f("From", acSelect("acv-money", V.money, AC_MONEY_G, "aceV", ' data-k="money"'))}${amt}${date}${ref}${note}</div>`;
  if (V.type === "contra") return `<div class="form-grid">${f("From", acSelect("acv-money", V.money, AC_MONEY_G, "aceV", ' data-k="money"'))}${f("To", acSelect("acv-to", V.to, AC_MONEY_G, "aceV", ' data-k="to"'))}${amt}${date}${note}</div>`;
  if (V.type === "expense") {
    const sp = acExpenseSplit();
    return `<div class="form-grid">${f("What for", acSelect("acv-party", V.party, AC_EXP_G, "aceV", ' data-k="party"'), true)}
      ${f("Amount on the bill (₹)", inp("amount", "number", "0.00"), false, "Including any GST")}
      ${f("GST on the bill", `<select class="select" data-in="aceV" data-k="gst">${["0", "5", "12", "18", "28"].map((r) => `<option value="${r}"${V.gst === r ? " selected" : ""}>${r === "0" ? "No GST / not claiming" : r + "%"}</option>`).join("")}</select>`)}
      ${V.gst !== "0" ? f("Supplier's GSTIN", inp("gstin", "text", "Needed to claim the GST"), false, V.gstin && !acGstinOK(V.gstin.toUpperCase()) ? `<span style="color:var(--warn)">That does not look like a GSTIN</span>` : V.gstin && V.gstin.slice(0, 2) !== AC_STATE ? "Other state: counted as IGST" : "") : ""}
      ${f("Paid", `<select class="select" data-in="aceV" data-k="paidHow"><option value="money"${V.paidHow === "money" ? " selected" : ""}>Paid now</option><option value="later"${V.paidHow === "later" ? " selected" : ""}>To pay later</option></select>`)}
      ${V.paidHow === "later" ? f("Owed to", acSelect("acv-to", V.to, ["creditors", "curliab"], "aceV", ' data-k="to"'), false, `Not in the list? <button class="btn-plain" data-act="aceLedgerNew" data-g="creditors">Add a supplier</button>`) : f("Paid from", acSelect("acv-money", V.money, AC_MONEY_G, "aceV", ' data-k="money"'))}
      ${date}${f("Bill no.", inp("bill", "text", "Optional"))}${note}</div>
      ${sp.gst ? `<div class="row-sub" style="margin-top:10px">Expense ${rs2(sp.net)} + GST ${rs2(sp.gst)}${sp.itc ? " (claimed as input credit)" : ""}</div>` : ""}`;
  }
  /* journal */
  const tdr = V.lines.reduce((a, l) => a + (+l.dr || 0), 0), tcr = V.lines.reduce((a, l) => a + (+l.cr || 0), 0);
  return `<div class="form-grid">${date}${note}</div>
    <div class="ac-jrows">${V.lines.map((l, i) => `<div class="ac-jrow">${acSelect("acv-a" + i, l.a, null, "aceJ", ` data-i="${i}" data-k="a" aria-label="Account ${i + 1}"`)}<input class="input num-in" type="number" inputmode="decimal" step="0.01" min="0" placeholder="Debit" data-in="aceJ" data-i="${i}" data-k="dr" value="${esc(l.dr)}" aria-label="Debit"><input class="input num-in" type="number" inputmode="decimal" step="0.01" min="0" placeholder="Credit" data-in="aceJ" data-i="${i}" data-k="cr" value="${esc(l.cr)}" aria-label="Credit">${V.lines.length > 2 ? `<button class="icon-btn" data-act="aceJDel" data-i="${i}" aria-label="Remove line">${ic("x", "sm")}</button>` : "<span></span>"}</div>`).join("")}</div>
    <div class="hstack gap-8" style="justify-content:space-between;margin-top:10px;flex-wrap:wrap"><button class="btn btn-secondary btn-sm" data-act="aceJAdd">${ic("plus", "sm")} Add a line</button><span class="row-sub" id="acv-jtot">${acJTot(tdr, tcr)}</span></div>`;
}
const acJTot = (dr, cr) => `Debits ${rs2(dr)} · credits ${rs2(cr)}${Math.abs(dr - cr) > 0.004 ? ` · <span style="color:var(--bad);font-weight:600">differ by ${rs2(Math.abs(dr - cr))}</span>` : dr > 0 ? ` · <span style="color:var(--good);font-weight:600">balanced</span>` : ""}`;
function acExpenseSplit() {
  const V = S.acV, tot = +V.amount || 0, r = +V.gst || 0, net = r ? acR2(tot / (1 + r / 100)) : tot, gst = acR2(tot - net);
  return { tot: acR2(tot), net, gst, itc: !!(gst && V.gstin && acGstinOK(String(V.gstin).toUpperCase())) };
}
IN.aceV = (el) => {
  const V = S.acV; if (!V) return; V[el.dataset.k] = el.value;
  if (["party", "gst", "paidHow", "gstin"].includes(el.dataset.k) && el.tagName === "SELECT") { part("acv-form", acVoucherForm()); return; }
  if (el.dataset.k === "gstin" || (V.type === "expense" && el.dataset.k === "amount")) { clearTimeout(IN.aceV._t); IN.aceV._t = setTimeout(() => { const a = document.activeElement, k = a && a.dataset && a.dataset.k, at = a && a.selectionStart; part("acv-form", acVoucherForm()); const n = k && $(`#acv-form [data-k="${k}"]`); if (n) { n.focus(); try { n.setSelectionRange(at, at); } catch (x) {} } }, 500); }
};
IN.aceJ = (el) => { const V = S.acV, l = V.lines[+el.dataset.i]; if (!l) return; l[el.dataset.k] = el.value; if (el.dataset.k === "dr" && +el.value) { l.cr = ""; const c = $(`[data-in="aceJ"][data-i="${el.dataset.i}"][data-k="cr"]`); if (c) c.value = ""; } if (el.dataset.k === "cr" && +el.value) { l.dr = ""; const c = $(`[data-in="aceJ"][data-i="${el.dataset.i}"][data-k="dr"]`); if (c) c.value = ""; } part("acv-jtot", acJTot(V.lines.reduce((a, x) => a + (+x.dr || 0), 0), V.lines.reduce((a, x) => a + (+x.cr || 0), 0))); };
ACT.aceJAdd = () => { S.acV.lines.push({ a: "", dr: "", cr: "" }); part("acv-form", acVoucherForm()); };
ACT.aceJDel = (el) => { S.acV.lines.splice(+el.dataset.i, 1); part("acv-form", acVoucherForm()); };

/* build the entry from the form; returns an error text or the voucher */
function acVoucherBuild() {
  const V = S.acV, ACC = acAccounts(), amt = acR2(V.amount);
  if (!V.date) return "Choose a date.";
  if (V.date < AC().from) return `The books start on ${fmtDate(AC().from)} ${AC().from.slice(0, 4)}. Put anything before that in the opening balances.`;
  const v = { type: V.type, date: V.date, ref: (V.ref || "").trim(), note: (V.note || "").trim(), form: Object.assign({}, V, { lines: undefined }) };
  if (V.type === "receipt" || V.type === "payment") {
    if (!V.party) return V.type === "receipt" ? "Choose who paid." : "Choose who was paid.";
    if (!V.money) return "Choose the bank account or cash."; if (!(amt > 0)) return "Enter the amount.";
    const sg = V.type === "receipt" ? 1 : -1; v.lines = [{ a: V.money, v: sg * amt }, { a: V.party, v: -sg * amt }]; v.party = acName(V.party, ACC); v.text = `${V.type === "receipt" ? "Received" : "Paid"}${V.ref ? " · " + V.ref : ""} · ${acName(V.money, ACC)}`; v.total = amt;
  } else if (V.type === "contra") {
    if (!V.money || !V.to || V.money === V.to) return "Choose two different accounts."; if (!(amt > 0)) return "Enter the amount.";
    v.lines = [{ a: V.to, v: amt }, { a: V.money, v: -amt }]; v.party = ""; v.text = `${acName(V.money, ACC)} → ${acName(V.to, ACC)}`; v.total = amt;
  } else if (V.type === "expense") {
    if (!V.party) return "Choose what the expense was for."; if (!(amt > 0)) return "Enter the amount on the bill.";
    const sp = acExpenseSplit(), other = V.paidHow === "later" ? V.to : V.money; if (!other) return V.paidHow === "later" ? "Choose whom it is owed to." : "Choose how it was paid.";
    const gstin = String(V.gstin || "").toUpperCase(), inter = sp.itc && gstin.slice(0, 2) !== AC_STATE;
    v.lines = [{ a: V.party, v: sp.itc ? sp.net : sp.tot }];
    if (sp.itc) { const tl = inter ? [{ a: "in-igst", v: sp.gst, tax: "igst" }] : [{ a: "in-cgst", v: acR2(sp.gst / 2), tax: "cgst" }, { a: "in-sgst", v: acR2(sp.gst - acR2(sp.gst / 2)), tax: "sgst" }]; tl.forEach((l) => v.lines.push(l)); v.itc = tl.map((l) => ({ k: l.tax, v: l.v })); v.taxable = sp.net; v.gstin = gstin; }
    v.lines.push({ a: other, v: -sp.tot }); v.party = V.paidHow === "later" ? acName(V.to, ACC) : acName(V.party, ACC); v.text = `${acName(V.party, ACC)}${V.bill ? " · bill " + V.bill : ""}${V.paidHow === "later" ? " · to pay" : " · " + acName(V.money, ACC)}`; v.total = sp.tot; v.ref = V.bill || v.ref;
  } else {
    const L = V.lines.filter((l) => l.a && ((+l.dr || 0) > 0 || (+l.cr || 0) > 0)); if (L.length < 2) return "A journal needs at least two accounts.";
    const dr = acR2(L.reduce((a, l) => a + (+l.dr || 0), 0)), cr = acR2(L.reduce((a, l) => a + (+l.cr || 0), 0)); if (Math.abs(dr - cr) > 0.004) return `Debits (${rs2(dr)}) and credits (${rs2(cr)}) must be equal.`;
    v.lines = L.map((l) => ({ a: l.a, v: acR2((+l.dr || 0) - (+l.cr || 0)) })); v.party = ""; v.text = L.map((l) => acName(l.a, ACC)).slice(0, 3).join(", "); v.total = dr; v.form.lines = V.lines;
  }
  if (V.note) v.text += " · " + V.note;
  return v;
}
ACT.aceSave = () => {
  const v = acVoucherBuild(); if (typeof v === "string") { toast(v, "alert"); return; }
  const A = acStore(), V = S.acV;
  if (V.id) { const old = A.vouchers.find((x) => x.id === V.id); if (old) { Object.assign(old, v, { id: old.id, no: old.no, by: old.by, time: old.time, edited: iso(NOW()), editedBy: HOST ? ME.name : undefined, bank: old.bank, src: old.src }); logActivity("Accounts entry changed", old.no, old.text); } }
  else { v.id = acId("V"); v.no = acNextNo(v.type, v.date); v.by = HOST ? ME.name : undefined; v.time = iso(NOW()); if (V.bank) { v.bank = V.bank; v.src = "bank"; } A.vouchers.push(v); logActivity("Accounts entry added", v.no, `${AC_VTYPES[v.type][0]} · ${v.party || v.text} · ${rs2(v.total)}`); if (V.bank) acBankLink(V.bank, v.id); }
  acDirty(); closeSheet(); render(); toast(`${AC_VTYPES[v.type][0]} saved`, "check");
};
ACT.aceEdit = (el) => {
  const v = AC().vouchers.find((x) => x.id === el.dataset.id); if (!v) return;
  if (v.form) { S.acV = Object.assign({}, v.form, { id: v.id, lines: v.form.lines || [{ a: "", dr: "", cr: "" }, { a: "", dr: "", cr: "" }] }); }
  else S.acV = { id: v.id, type: "journal", date: v.date, note: v.note || "", lines: v.lines.map((l) => ({ a: l.a, dr: l.v > 0 ? String(l.v) : "", cr: l.v < 0 ? String(-l.v) : "" })) };
  if (!AC_VTYPES[S.acV.type]) S.acV.type = "journal";
  acVoucherOpen();
};
ACT.aceDel = (el) => {
  if (el.dataset.sure !== "1") { el.dataset.sure = "1"; el.innerHTML = "Tap again to delete"; el.classList.add("btn-danger"); return; }
  const v = AC().vouchers.find((x) => x.id === el.dataset.id); if (!v) return;
  v.deleted = true; v.deletedAt = iso(NOW()); v.deletedBy = HOST ? ME.name : undefined;
  if (v.bank) acBankLink(v.bank, null);
  logActivity("Accounts entry deleted", v.no, v.text); acDirty(); closeSheet(); render(); toast("Entry deleted", "trash");
};

/* ---------- opening balances ---------- */
ACT.aceOpening = () => {
  const A = acStore(), ACC = acAccounts(), d = addDays(A.from, -1);
  const groups = AC_GROUPS.filter(([g, , , s]) => s === "A" || s === "L");
  const row = (a) => { const v = +A.opening[a.id] || 0; return `<div class="ac-orow"><span class="grow clip">${esc(a.name)}</span><input class="input sm num-in" type="number" inputmode="decimal" step="0.01" min="0" data-in="aceOpen" data-id="${esc(a.id)}" value="${v ? Math.abs(v) : ""}" placeholder="0.00" aria-label="${esc(a.name)} amount"><select class="select sm" data-in="aceOpen" data-id="${esc(a.id)}" data-k="side" aria-label="Debit or credit"><option value="dr"${v >= 0 ? " selected" : ""}>Dr</option><option value="cr"${v < 0 ? " selected" : ""}>Cr</option></select></div>`; };
  openSheet(`Opening balances · ${fmtDate(d)} ${d.slice(0, 4)}`, `<div class="row-sub" style="margin-bottom:12px">How things stood the day before the books start. What we have (bank, cash, stock, money owed to us) is a debit; what we owe and partners' capital is a credit. Take them from the closing balance sheet of the year before.</div>
    ${groups.map(([g, label, formal, side]) => { const L = Object.values(ACC).filter((a) => a.group === g && !(a.sys && !["cash", "stock"].includes(a.id) && g !== "taxin" && g !== "taxout")); if (!L.length) return ""; return `<div style="margin-top:14px"><div class="group-label"><span>${esc(label)} <span class="dim">· ${esc(formal)}</span></span><span>${side === "A" ? "usually Dr" : "usually Cr"}</span></div><div class="group ac-ogroup">${L.sort((a, b) => a.name.localeCompare(b.name)).map(row).join("")}</div></div>`; }).join("")}
    <div class="hstack gap-8" style="margin-top:12px"><button class="btn btn-secondary btn-sm" data-act="aceLedgerNew">${ic("plus", "sm")} Add an account</button></div>`,
    `<span class="row-sub grow" id="ac-odiff">${acOpenDiffTxt()}</span><button class="btn btn-primary" data-act="aceOpenDone">Done</button>`, true);
};
const acOpenDiffTxt = () => { const d = acOpeningDiff(); return Math.abs(d) < 0.005 ? `<span style="color:var(--good);font-weight:600">${ic("check", "sm")} Balanced</span>` : `Debits and credits differ by <b>${rs2(Math.abs(d))}</b>`; };
IN.aceOpen = (el) => {
  const A = acStore(), id = el.dataset.id, amt = $(`[data-in="aceOpen"][data-id="${CSS.escape(id)}"]:not([data-k])`), side = $(`[data-in="aceOpen"][data-id="${CSS.escape(id)}"][data-k="side"]`);
  const v = acR2(+(amt && amt.value) || 0) * (side && side.value === "cr" ? -1 : 1);
  if (v) A.opening[id] = v; else delete A.opening[id];
  acDirty(); part("ac-odiff", acOpenDiffTxt());
};
ACT.aceOpenDone = () => { const A = acStore(); A.openingDone = true; logActivity("Opening balances updated", fmtDate(addDays(A.from, -1)), `${Object.keys(A.opening).length} accounts`); closeSheet(); render(); };

/* ---------- accounts (ledgers) ---------- */
ACT.aceLedgerNew = (el) => {
  const g = (el && el.dataset && el.dataset.g) || "bank", back = sheetOpen && S.acV ? S.acV : null;
  S.acL = { name: "", group: g, gstin: "", acno: "", ifsc: "", back };
  openSheet("New account", `<div id="acl-form">${acLedgerForm()}</div>`, `<button class="btn btn-secondary" data-act="aceLedgerCancel">Cancel</button><button class="btn btn-primary" data-act="aceLedgerSave">${ic("check", "sm")} Add account</button>`);
  setTimeout(() => { const i = $('#acl-form [data-k="name"]'); if (i) i.focus(); }, 50);
};
function acLedgerForm() {
  const L = S.acL, inp = (k, ph) => `<input class="input" data-in="aceL" data-k="${k}" value="${esc(L[k])}" placeholder="${esc(ph)}">`;
  return `<div class="form-grid"><div class="field full"><label class="label">Name</label>${inp("name", L.group === "bank" ? "e.g. HDFC Bank current account" : L.group === "capital" ? "e.g. Vishnu – capital" : "Name")}</div>
    <div class="field full"><label class="label">Kind</label><select class="select" data-in="aceL" data-k="group">${AC_GROUPS.map(([g, label, formal]) => `<option value="${g}"${g === L.group ? " selected" : ""}>${esc(label)} (${esc(formal)})</option>`).join("")}</select></div>
    ${L.group === "bank" ? `<div class="field"><label class="label">Account number (last 4)</label>${inp("acno", "Optional")}</div><div class="field"><label class="label">IFSC</label>${inp("ifsc", "Optional")}</div>` : ""}
    ${["debtors", "creditors"].includes(L.group) ? `<div class="field full"><label class="label">GSTIN</label>${inp("gstin", "Optional")}</div>` : ""}</div>`;
}
IN.aceL = (el) => { S.acL[el.dataset.k] = el.value; if (el.dataset.k === "group") part("acl-form", acLedgerForm()); };
ACT.aceLedgerCancel = () => { const b = S.acL && S.acL.back; if (b) { S.acV = b; acVoucherOpen(); } else closeSheet(); };
ACT.aceLedgerSave = () => {
  const L = S.acL, name = String(L.name || "").trim(); if (!name) { toast("Give the account a name.", "alert"); return; }
  const ACC = acAccounts(); if (Object.values(ACC).some((a) => key(a.name) === key(name))) { toast("There is already an account with that name.", "alert"); return; }
  const A = acStore(), id = "l:" + acId("L").slice(2), x = { id, name, group: L.group, by: HOST ? ME.name : undefined, time: iso(NOW()) };
  if (L.group === "bank") { x.acno = String(L.acno || "").trim(); x.ifsc = String(L.ifsc || "").trim().toUpperCase(); }
  if (L.gstin) { x.party = name; A.parties[name] = Object.assign(A.parties[name] || {}, { gstin: String(L.gstin).toUpperCase().trim() }); }
  A.ledgers.push(x); logActivity("Account added", name, (AC_GROUP[L.group] || {}).label); acDirty(); toast(`${name} added`, "check");
  const b = L.back; if (b) { S.acV = b; if (b.type === "expense" && L.group === "creditors") { b.to = id; b.paidHow = "later"; } else if (L.group === "bank" && !b.money) b.money = id; acVoucherOpen(); } else { closeSheet(); render(); }
};

/* ---------- a party's GST details ---------- */
ACT.aceParty = (el) => {
  const p = canonDist(el.dataset.p), info = acPartyInfo(p);
  S.acPty = { p, gstin: info.gstin, addr: info.addr };
  openSheet(`${esc(p)} · GST details`, `<div class="form-grid"><div class="field full"><label class="label" for="acp-g">GSTIN</label><input class="input mono" id="acp-g" data-in="acePty" data-k="gstin" value="${esc(info.gstin)}" placeholder="15 characters, e.g. 32ABCDE1234F1Z5" maxlength="15" autocapitalize="characters"><div class="row-sub" id="acp-msg" style="margin-top:4px">${acGstinMsg(info.gstin)}</div></div><div class="field full"><label class="label" for="acp-a">Billing address</label><input class="input" id="acp-a" data-in="acePty" data-k="addr" value="${esc(info.addr)}" placeholder="Optional"></div></div>
    <div class="row-sub" style="margin-top:12px">With a GSTIN, sales go in GSTR-1 as B2B invoices. A GSTIN from outside Kerala (not starting 32) makes the tax IGST instead of CGST + SGST.</div>`,
    `<button class="btn btn-secondary" data-act="closeSheet">Cancel</button><button class="btn btn-primary" data-act="acePtySave">${ic("check", "sm")} Save</button>`);
};
const acGstinMsg = (g) => { g = String(g || "").toUpperCase(); return !g ? "" : acGstinOK(g) ? `<span style="color:var(--good)">${ic("check", "sm")} ${g.slice(0, 2) === AC_STATE ? "Kerala: CGST + SGST" : "State " + g.slice(0, 2) + ": IGST"}</span>` : `<span style="color:var(--warn)">That does not look like a GSTIN yet</span>`; };
IN.acePty = (el) => { S.acPty[el.dataset.k] = el.value; if (el.dataset.k === "gstin") part("acp-msg", acGstinMsg(el.value)); };
ACT.acePtySave = () => {
  const P = S.acPty, g = String(P.gstin || "").toUpperCase().replace(/\s+/g, ""); if (g && !acGstinOK(g)) { toast("Check the GSTIN: it should be 15 characters, like 32ABCDE1234F1Z5.", "alert"); return; }
  const A = acStore(); A.parties[P.p] = Object.assign(A.parties[P.p] || {}, { gstin: g, addr: String(P.addr || "").trim() });
  logActivity("Party GST details changed", P.p, g || "GSTIN removed"); acDirty(); closeSheet(); render(); toast("Saved", "check");
};

/* ---------- a stock value for a day ---------- */
ACT.aceStock = (el) => {
  const d = el.dataset.d, A = AC(), cur = A.stockAt[d], tool = d >= (acStockFirst() || "9999") ? acStockQtyValue(d).v : null;
  openSheet(`Stock value · ${fmtDate(d)} ${d.slice(0, 4)}`, `<div class="row-sub" style="margin-bottom:12px">The value of all stock (SahiReach and quick commerce) at cost, excluding GST, at the end of the day. ${tool != null ? `The tool works it out as <b>${rs2(tool)}</b>; enter a figure only if your count is different.` : `The tool's stock records start on ${fmtDate(acStockFirst())}, so it cannot work this one out. Take it from Vyapar's stock summary for that day.`}</div>
    <div class="field"><label class="label" for="ac-stk">Stock value (₹)</label><input class="input num-in" id="ac-stk" type="number" inputmode="decimal" step="0.01" min="0" value="${cur != null ? cur : ""}" placeholder="${tool != null ? tool : "0.00"}"></div>`,
    `${cur != null ? `<button class="btn btn-secondary" data-act="aceStockSave" data-d="${d}" data-clear="1">Use the tool's figure</button>` : ""}<button class="btn btn-primary" data-act="aceStockSave" data-d="${d}">${ic("check", "sm")} Save</button>`);
};
ACT.aceStockSave = (el) => {
  const A = acStore(), d = el.dataset.d;
  if (el.dataset.clear) delete A.stockAt[d]; else { const v = $("#ac-stk").value; if (v === "" || isNaN(+v)) { toast("Enter the stock value.", "alert"); return; } A.stockAt[d] = acR2(v); }
  logActivity("Stock value for the books", fmtDate(d), el.dataset.clear ? "Back to the tool's figure" : rs2(A.stockAt[d])); acDirty(); closeSheet(); render();
};

/* ---------- Vyapar invoice and e-way bill numbers ---------- */
ACT.aceInvSheet = () => {
  const L = acToNumber(), next = acNextInv();
  openSheet("Vyapar invoice numbers", `<div class="row-sub" style="margin-bottom:12px">Vyapar makes the invoice (and the e-way bill); the tool keeps its number against the dispatch, for GSTR-1 and the party statements. The next number after the last one recorded is <b class="mono">${esc(next)}</b>.</div>
    ${L.length ? `<div class="group">${L.map((x) => `<div class="row ac-invrow"><span class="grow" style="min-width:0"><div class="row-title clip">${esc(x.party)}</div><div class="row-sub">${fmtDate(x.date)} · ${rs2(x.value)} incl. GST · ${x.t === "qc" ? "PO " + esc(x.id) : esc(x.id.replace("ORD-", "Order "))}</div></span><input class="input sm mono" data-in="aceInvNo" data-t="${x.t}" data-id="${esc(x.id)}" placeholder="${esc(next)}" aria-label="Invoice number for ${esc(x.party)}"><input class="input sm mono" data-in="aceEwb" data-t="${x.t}" data-id="${esc(x.id)}" placeholder="E-way bill (optional)" aria-label="E-way bill number"></div>`).join("")}</div>` : `<div class="empty">Every dispatch has its invoice number.</div>`}`,
    `<button class="btn btn-primary" data-act="aceInvDone">Done</button>`, true);
};
ACT.aceInvDone = () => { closeSheet(); render(); };
const acDoc = (t, id) => (t === "qc" ? D.qcPOs.find((p) => p.po === id) : D.orders.find((o) => o.id === id));
IN.aceInvNo = (el) => { const o = acDoc(el.dataset.t, el.dataset.id); if (!o) return; const v = el.value.trim().toUpperCase(); if (v) { const dup = D.orders.some((x) => x !== o && x.inv === v) || D.qcPOs.some((x) => x !== o && x.inv === v) || (D.salesBefore || []).some((r) => r.inv === v); el.classList.toggle("bad", dup); if (dup) { toast(`${v} is already used`, "alert"); return; } } if (v) o.inv = v; else delete o.inv; acDirty(); clearTimeout(IN.aceInvNo._t); IN.aceInvNo._t = setTimeout(() => logActivity("Invoice number recorded", el.dataset.id, v || "removed"), 1500); };
IN.aceEwb = (el) => { const o = acDoc(el.dataset.t, el.dataset.id); if (!o) return; const v = el.value.trim(); if (v) o.ewb = v; else delete o.ewb; acDirty(); };
ACT.aceInvOne = (el) => {
  const o = acDoc(el.dataset.t, el.dataset.id); if (!o) return; const back = el.dataset.back;
  openSheet(`Invoice number · ${esc(el.dataset.t === "qc" ? o.platform + " PO " + o.po : o.dist)}`, `<div class="form-grid"><div class="field"><label class="label">Vyapar invoice number</label><input class="input mono" data-in="aceInvNo" data-t="${el.dataset.t}" data-id="${esc(el.dataset.id)}" value="${esc(o.inv || "")}" placeholder="${esc(acNextInv())}"></div><div class="field"><label class="label">E-way bill number</label><input class="input mono" data-in="aceEwb" data-t="${el.dataset.t}" data-id="${esc(el.dataset.id)}" value="${esc(o.ewb || "")}" placeholder="Optional"></div></div><div class="row-sub" style="margin-top:10px">As made in Vyapar. Used for GSTR-1 and on party statements.</div>`,
    `<button class="btn btn-primary" data-act="${back === "order" ? "orderSheet" : "closeSheet"}" data-id="${esc(el.dataset.id)}">Done</button>`);
};

/* ---------- bringing in Vyapar's records from before the tool ---------- */
function acVyImportsHtml() {
  const I = AC().imports.filter((x) => !x.removed); if (!I.length) return "";
  return `<div class="group-label"><span>Brought in before</span></div><div class="group">${I.map((x) => `<div class="row"><span class="grow"><div class="row-title">${esc(x.file)}</div><div class="row-sub">${fmtDT(x.at)} · ${x.n} entries${x.by ? " · " + esc(x.by) : ""}</div></span>${AC_CAN ? `<button class="btn btn-secondary btn-sm" data-act="aceVyUndo" data-id="${esc(x.id)}">Take out</button>` : ""}</div>`).join("")}</div>`;
}
async function acReadSheetFile(file) {
  await loadScriptOnce(XLSX_SRC, () => !!window.XLSX);
  /* a CSV is read as text, so 02/11/2026 stays 2 November (Indian banks write day first), not February */
  const csv = /\.(csv|txt)$/i.test(file.name || "") || /csv/.test(file.type || "");
  const wb = csv ? window.XLSX.read(await file.text(), { type: "string", raw: true }) : window.XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true }), out = [];
  wb.SheetNames.forEach((n) => out.push(window.XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, defval: "", raw: true })));
  return out;
}
/* dates as Vyapar and banks write them: 05/10/2026, 05-10-26, 05-Oct-2026, 2026-10-05, Excel dates */
function acParseDate(v) {
  if (v instanceof Date && !isNaN(v)) return ymd(new Date(v.getTime() + 12 * 3600e3));
  if (typeof v === "number" && v > 30000 && v < 80000) { const d = new Date(Date.UTC(1899, 11, 30) + v * 864e5); return d.toISOString().slice(0, 10); }
  const s = String(v || "").trim(); let m;
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return `${m[1]}-${pad2(m[2])}-${pad2(m[3])}`;
  if ((m = s.match(/^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{2,4})/))) { const y = m[3].length === 2 ? "20" + m[3] : m[3]; return `${y}-${pad2(m[2])}-${pad2(m[1])}`; }
  if ((m = s.match(/^(\d{1,2})[\/\-. ]?([A-Za-z]{3})[A-Za-z]*[\/\-. ,]*(\d{2,4})/))) { const mo = MONTHS.findIndex((x) => x.toLowerCase() === m[2].toLowerCase()); if (mo >= 0) { const y = m[3].length === 2 ? "20" + m[3] : m[3]; return `${y}-${pad2(mo + 1)}-${pad2(m[1])}`; } }
  return "";
}
const acNum = (v) => { if (typeof v === "number") return v; const s = String(v || "").replace(/[₹,\s]/g, "").replace(/^\((.*)\)$/, "-$1"); const n = parseFloat(s.replace(/(cr|dr)$/i, "")); return isNaN(n) ? 0 : n; };
/* find the header row and the columns we need */
function acFindCols(rows, want) {
  for (let i = 0; i < Math.min(rows.length, 40); i++) {
    const r = rows[i].map((c) => key(String(c))), col = {};
    Object.keys(want).forEach((k) => { const j = r.findIndex((c, ci) => c && want[k].some((re) => re.test(c)) && !Object.values(col).includes(ci)); if (j >= 0) col[k] = j; });
    if (col.date != null && Object.keys(col).length >= 3) return { at: i, col };
  }
  return null;
}
/* which account a name in Vyapar (or a bank line) belongs to */
function acMatchParty(text) {
  const t = key(text); if (!t) return null; const ACC = acAccounts();
  if (/hangyo/.test(t)) return acPartyId("Hangyo");
  let best = null, score = 0;
  Object.values(ACC).forEach((a) => {
    if (a.sys || a.starter || !["debtors", "creditors", "capital", "loans", "deposits"].includes(a.group)) return; const words = key(a.name).replace(/[^a-z0-9 ]/g, " ").split(" ").filter((w) => w.length >= 4 && !/^(traders|agency|agencies|foods|food|distributors|distribution|enterprises|services|private|limited|kerala|marketing|ice|cream|creams|bank|account|charges|payment|transfer)$/.test(w));
    const d = distByKey[key(a.party || a.name)], sh = d && d.short ? key(d.short) : ""; let s = words.filter((w) => t.includes(w)).length * 2; if (sh && sh.length >= 4 && t.includes(sh)) s += 2; if (key(a.name) && t.includes(key(a.name))) s += 5;
    if (s > score) { score = s; best = a.id; }
  });
  return score >= 2 ? best : null;
}
function acExpenseAcc(t) {
  t = key(t); const m = [[/salar|wage|staff/, "x:salaries"], [/rent/, "x:rent"], [/cold|storage|tropicana/, "x:storage"], [/load|unload|hamali|coolie/, "x:loading"], [/fuel|diesel|petrol|vehicle/, "x:fuel"], [/electric|power|kseb/, "x:power"], [/phone|mobile|internet|broadband|recharge/, "x:phone"], [/bank|charge/, "x:bankchg"], [/audit|account|ca |legal|professional|consult/, "x:prof"], [/repair|maint|freezer|service/, "x:repairs"]];
  const hit = m.find(([re]) => re.test(t)); return hit ? hit[1] : "x:office";
}
ACT.aceVyUndo = (el) => {
  const A = acStore(), imp = A.imports.find((x) => x.id === el.dataset.id); if (!imp) return;
  if (el.dataset.sure !== "1") { el.dataset.sure = "1"; el.textContent = "Tap again"; el.classList.add("btn-danger"); return; }
  let n = 0; A.vouchers.forEach((v) => { if (v.imp === imp.id && !v.deleted) { v.deleted = true; v.deletedAt = iso(NOW()); n++; } }); imp.removed = true;
  logActivity("Vyapar import taken out", imp.file, `${n} entries`); acDirty(); part("ac-vy-out", acVyImportsHtml()); render(); toast(`${n} entries taken out`, "undo");
};

/* ===== ACCOUNTS: the bank statement =====
   Upload the statement (Excel or CSV from net banking). Each line is kept once (a line already uploaded is not
   added again), and given a suggestion: an entry already in the books with the same amount and a date close by,
   or the distributor / Hangyo / transporter named in the narration, or an expense head from words like CHARGES
   or SALARY, or what was chosen last time for a similar narration. Nothing goes into the books until it is added. */
function acBankParse(rows) {
  const want = { date: [/^(txn |transaction |value )?date$/, /date/], desc: [/narration|description|particulars|remarks|details/], ref: [/chq|cheque|ref/], dr: [/withdrawal|debit|^dr$|paid out/], cr: [/deposit|credit|^cr$|paid in/], amt: [/^amount/], dc: [/^(dr|cr|dr ?\/ ?cr|type)$/], bal: [/balance/] };
  const H = acFindCols(rows, want); if (!H || H.col.desc == null || (H.col.dr == null && H.col.amt == null)) return null;
  const out = [];
  rows.slice(H.at + 1).forEach((r) => {
    const g = (k) => (H.col[k] != null ? r[H.col[k]] : ""), date = acParseDate(g("date")); if (!date) return;
    let dr = Math.abs(acNum(g("dr"))), cr = Math.abs(acNum(g("cr")));
    if (H.col.dr == null && H.col.amt != null) { const a = acNum(g("amt")), dc = key(g("dc")); if (/^d|dr|debit/.test(dc) || (!dc && a < 0)) dr = Math.abs(a); else cr = Math.abs(a); }
    if (!(dr > 0) && !(cr > 0)) return;
    const desc = String(g("desc") || "").replace(/\s+/g, " ").trim(), bal = H.col.bal != null && g("bal") !== "" ? acNum(g("bal")) : null;
    out.push({ d: date, desc, ref: String(g("ref") || "").trim(), dr: acR2(dr), cr: acR2(cr), bal: bal != null ? acR2(bal) : null });
  });
  return out;
}
const acBankHash = (r) => [r.d, r.dr, r.cr, key(r.desc).slice(0, 60), r.bal == null ? "" : r.bal].join("|");
IN.aceBankFile = async (el) => {
  const f = el.files && el.files[0]; if (!f) return;
  let sheets; try { sheets = await acReadSheetFile(f); } catch (e) { toast("Could not read that file. Download the statement as Excel or CSV and try again.", "alert"); return; }
  let rows = null; for (const s of sheets) { rows = acBankParse(s); if (rows && rows.length) break; }
  if (!rows || !rows.length) { toast("No transactions found. The statement needs Date, Narration and Withdrawal / Deposit columns.", "alert"); return; }
  const A = acStore(), sel = $("#ac-bank-acc"), acc = (sel && sel.value) || (acMoneyAccs().find((a) => a.group === "bank") || {}).id;
  const seen = new Set(); A.bank.stmts.filter((s) => s.acc === acc).forEach((s) => s.rows.forEach((r) => seen.add(r.h)));
  const fresh = rows.map((r) => Object.assign(r, { h: acBankHash(r) })).filter((r) => !seen.has(r.h));
  const ds = rows.map((r) => r.d).sort(), last = rows.filter((r) => r.bal != null).sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0)).pop();
  if (!fresh.length) { toast("Every line in this statement is already here.", "info"); return; }
  A.bank.stmts.push({ id: acId("B"), acc, file: f.name, at: iso(NOW()), by: HOST ? ME.name : undefined, from: ds[0], to: ds[ds.length - 1], bal: last ? last.bal : null, rows: fresh });
  /* link lines to entries already in the books */
  acBankAutoLink(acc);
  logActivity("Bank statement uploaded", f.name, `${fresh.length} new line${fresh.length === 1 ? "" : "s"} · ${acName(acc)}`); acDirty(); render();
  toast(`${fresh.length} new line${fresh.length === 1 ? "" : "s"}${rows.length > fresh.length ? ` (${rows.length - fresh.length} already here)` : ""}`, "check");
};
/* a voucher already in the books for this money, not yet tied to a line: same account, same amount, within 4 days */
function acBankAutoLink(acc) {
  const A = acStore(), used = new Set(); A.bank.stmts.forEach((s) => s.rows.forEach((r) => r.v && used.add(r.v)));
  A.bank.stmts.filter((s) => s.acc === acc).forEach((s) => s.rows.forEach((r) => {
    if (r.v || r.skip) return; const amt = r.cr > 0 ? r.cr : -r.dr;
    const v = A.vouchers.find((v) => !v.deleted && !used.has(v.id) && v.lines.some((l) => l.a === acc && Math.abs(l.v - amt) < 0.01) && Math.abs(daysBetween(v.date, r.d)) <= 4);
    if (v) { r.v = v.id; r.auto = true; used.add(v.id); v.bank = { s: s.id, h: r.h }; }
  }));
}
function acBankLink(ref, vid) { AC().bank.stmts.forEach((s) => { if (s.id !== ref.s) return; s.rows.forEach((r) => { if (r.h === ref.h) { r.v = vid || null; if (!vid) delete r.auto; } }); }); }
/* what a line probably is */
function acBankGuess(r) {
  const A = AC(), t = key(r.desc + " " + r.ref), rule = (A.bank.rules || []).find((x) => x.w.every((w) => t.includes(w)));
  if (rule) return { a: rule.a, why: "Like last time" };
  if (/cash dep|by cash|cash deposit/.test(t) && r.cr) return { a: "cash", why: "Cash deposited", contra: true };
  if (/atm|cash wdl|cash withdrawal|self/.test(t) && r.dr) return { a: "cash", why: "Cash withdrawn", contra: true };
  const p = acMatchParty(r.desc); if (p) return { a: p, why: "Name in the narration" };
  if (r.dr) {
    if (/gst ?(pmt|payment|challan)|cbic|gstn|cpin/.test(t)) return { a: "x:gstpaid", why: "GST payment" };
    if (/salar|wages/.test(t)) return { a: "x:salaries", why: "Salary" };
    if (/chg|charges|chrg|sms|fee|commission|gst on|amc|min bal/.test(t)) return { a: "x:bankchg", why: "Bank charges" };
    if (/rent/.test(t)) return { a: "x:rent", why: "Rent" };
    if (/kseb|electric/.test(t)) return { a: "x:power", why: "Electricity" };
    if (/fuel|petrol|diesel|hpcl|iocl|bpcl/.test(t)) return { a: "x:fuel", why: "Fuel" };
  } else {
    if (/int\.?pd|interest|int cr|sb int/.test(t)) return { a: "x:interest", why: "Interest" };
    /* the exact amount of one open bill */
    const hit = acAgeing(r.d).find((x) => x.bills.some((b) => Math.abs(b.left - r.cr) < 1)); if (hit) return { a: hit.id, why: "Same amount as an open bill" };
  }
  return { a: "", why: "" };
}
function acBankRowsHtml() {
  const A = AC(), ACC = acAccounts(), S0 = A.bank.stmts; if (!S0.length) return "";
  const show = S.acBankAll ? "all" : "open", L = [];
  S0.forEach((s) => s.rows.forEach((r) => { if (show === "open" && (r.v || r.skip)) return; L.push({ s, r }); }));
  L.sort((a, b) => (a.r.d < b.r.d ? 1 : a.r.d > b.r.d ? -1 : 0));
  const sug = S.acBankSug = S.acBankSug || {};
  const rows = L.slice(0, S.acBankMore ? 600 : 60).map(({ s, r }) => {
    const k = s.id + "|" + r.h, g = sug[k] || (sug[k] = acBankGuess(r)), v = r.v ? A.vouchers.find((x) => x.id === r.v) : null;
    const amt = r.cr > 0 ? `<span class="num" style="color:var(--good);font-weight:600">+${rs2(r.cr)}</span>` : `<span class="num" style="font-weight:600">−${rs2(r.dr)}</span>`;
    const end = v && !v.deleted ? `<span class="pill good" style="height:22px">${r.auto ? "Matched" : "In the books"}</span><button class="btn-plain" data-act="acvEntry" data-id="v:${esc(v.id)}">${esc(v.no || "Open")}</button>` : r.skip ? `<span class="pill plain">Left out</span>${AC_CAN ? `<button class="btn-plain" data-act="aceBankSkip" data-k="${esc(k)}" data-on="0">Undo</button>` : ""}` : AC_CAN ? `<span class="ac-bank-pick">${acSelect("acb-" + s.id + "-" + r.d + "-" + Math.round((r.cr || r.dr) * 100), g.a, null, "aceBankSug", ` data-k="${esc(k)}" aria-label="Account for this line"`)}</span><button class="btn btn-secondary btn-sm" data-act="aceBankAdd" data-k="${esc(k)}">Add</button><button class="icon-btn" data-act="aceBankSkip" data-k="${esc(k)}" data-on="1" title="Leave out (not for the books)" aria-label="Leave out">${ic("x", "sm")}</button>` : "";
    return `<div class="row ac-bankrow"><span class="pur-date"><b>${toDate(r.d).getDate()}</b><span>${MONTHS[toDate(r.d).getMonth()]}</span></span><span class="grow" style="min-width:0"><div class="row-title clip" title="${esc(r.desc)}">${esc(r.desc || "–")}</div><div class="row-sub clip">${esc(acName(s.acc, ACC))}${r.ref ? " · " + esc(r.ref) : ""}${!v && !r.skip && g.why ? ` · <span style="color:var(--tint)">${esc(g.why)}</span>` : ""}</div></span>${amt}<span class="ac-bank-end">${end}</span></div>`;
  });
  const open = S0.reduce((n, s) => n + s.rows.filter((r) => !r.v && !r.skip).length, 0), ready = L.filter(({ s, r }) => !r.v && !r.skip && (sug[s.id + "|" + r.h] || {}).a).length;
  return `<div><div class="group-label"><span>${show === "open" ? "Lines to sort" : "Every line"} · ${open} open</span><span class="hstack gap-8"><button class="btn-plain" data-act="acvBankAll">${show === "open" ? "Show all lines" : "Show only open"}</button>${AC_CAN && ready ? `<button class="btn btn-primary btn-sm" data-act="aceBankAddAll">${ic("check", "sm")} Add ${ready} with a suggestion</button>` : ""}</span></div>
    ${L.length ? `<div class="group">${rows.join("")}</div>${L.length > rows.length ? `<button class="btn btn-secondary" style="margin-top:10px" data-act="acvBankMore">Show all ${L.length}</button>` : ""}` : `<div class="empty">Every line is in the books.</div>`}</div>
    <div><div class="group-label"><span>Statements uploaded</span></div><div class="group">${S0.slice().reverse().map((s) => `<div class="row"><span class="grow"><div class="row-title clip">${esc(s.file)}</div><div class="row-sub">${esc(acName(s.acc, ACC))} · ${fmtDate(s.from)} to ${fmtDate(s.to)} · ${s.rows.length} lines${s.bal != null ? " · closing " + rs2(s.bal) : ""}</div></span><span class="row-sub">${fmtDate(s.at)}</span></div>`).join("")}</div></div>`;
}
ACT.acvBankAll = () => { S.acBankAll = !S.acBankAll; render(); };
ACT.acvBankMore = () => { S.acBankMore = true; render(); };
const acBankFind = (k) => { const [sid, h] = [k.slice(0, k.indexOf("|")), k.slice(k.indexOf("|") + 1)], s = AC().bank.stmts.find((x) => x.id === sid); return s ? { s, r: s.rows.find((r) => r.h === h) } : {}; };
IN.aceBankSug = (el) => { const sug = (S.acBankSug = S.acBankSug || {}); sug[el.dataset.k] = { a: el.value, why: el.value ? "Chosen" : "" }; };
ACT.aceBankSkip = (el) => { const { r } = acBankFind(el.dataset.k); if (!r) return; acStore(); r.skip = el.dataset.on === "1"; acDirty(); render(); };
/* one line into the books: money in from / money out to the chosen account (a move between bank and cash for cash lines) */
function acBankPost(k, a) {
  const { s, r } = acBankFind(k); if (!s || !r || r.v || !a) return null;
  const A = acStore(), ACC = acAccounts(), inn = r.cr > 0, amt = inn ? r.cr : r.dr, money = ACC[a] && ["bank", "cash"].includes(ACC[a].group), type = money ? "contra" : inn ? "receipt" : "payment";
  const v = { id: acId("V"), type, date: r.d, no: "", party: money ? "" : acName(a, ACC), ref: r.ref, note: r.desc, lines: inn ? [{ a: s.acc, v: amt }, { a, v: -amt }] : [{ a, v: amt }, { a: s.acc, v: -amt }], total: amt, text: `${money ? (inn ? acName(a, ACC) + " → " + acName(s.acc, ACC) : acName(s.acc, ACC) + " → " + acName(a, ACC)) : (inn ? "Received" : "Paid") + " · " + acName(s.acc, ACC)} · bank: ${r.desc.slice(0, 60)}`, src: "bank", bank: { s: s.id, h: r.h }, by: HOST ? ME.name : undefined, time: iso(NOW()) };
  v.no = acNextNo(type, r.d); A.vouchers.push(v); r.v = v.id;
  /* remember for next time: the narration's distinctive words */
  const w = key(r.desc).replace(/[^a-z ]/g, " ").split(" ").filter((x) => x.length >= 4 && !/^(neft|imps|rtgs|upi|transfer|from|bank|towards|payment|limited|private|ltd)$/.test(x)).slice(0, 3);
  if (w.length >= 2) { A.bank.rules = (A.bank.rules || []).filter((x) => x.w.join(" ") !== w.join(" ")); A.bank.rules.unshift({ w, a }); A.bank.rules = A.bank.rules.slice(0, 200); }
  return v;
}
ACT.aceBankAdd = (el) => {
  const k = el.dataset.k, sel = el.parentElement && el.parentElement.querySelector("select"), a = (sel && sel.value) || ((S.acBankSug || {})[k] || {}).a;
  if (!a) { toast("Choose an account for this line first.", "alert"); return; }
  const v = acBankPost(k, a); if (!v) return; logActivity("Bank line added to the books", v.no, `${v.party || v.text} · ${rs2(v.total)}`); acDirty(); render(); toast("Added to the books", "check");
};
ACT.aceBankAddAll = () => {
  const sug = S.acBankSug || {}; let n = 0, t = 0;
  AC().bank.stmts.forEach((s) => s.rows.forEach((r) => { if (r.v || r.skip) return; const g = sug[s.id + "|" + r.h]; if (!g || !g.a) return; const v = acBankPost(s.id + "|" + r.h, g.a); if (v) { n++; t += v.total; } }));
  if (n) logActivity("Bank lines added to the books", `${n} lines`, rs2(t)); acDirty(); render(); toast(`${n} line${n === 1 ? "" : "s"} added`, "check");
};

/* ===== ACCOUNTS: downloads =====
   Styled Excel for whatever Accounts is showing (profit and loss, balance sheet, trial balance, day book, ledgers,
   money owed), a ledger or party statement, the GST workings (GSTR-1 tables and 3B), and a party statement as a PDF
   to send to a distributor. */
const AC_X = { NUM: "#,##0", RS: '"₹"#,##0.00;[Red]-"₹"#,##0.00', DATE: "dd-mmm-yyyy" };
async function acXlsx(el) {
  if (el) el.disabled = true;
  try { await loadScriptOnce(XLSXS_SRC, () => !!(window.XLSX && window.XLSX.style_version)); return window.XLSX; }
  catch (e) { toast("Could not prepare the Excel file. Check your internet and try again.", "alert"); return null; }
  finally { if (el) el.disabled = false; }
}
const acCo = () => CO.name || "SahiReach LLP";
const acD = (d) => ({ v: ilSerial(d), t: "n", z: AC_X.DATE });
/* a two-column statement (label, amount) with section rows */
function acStmtSheet(X, title, sub, lines) {
  const head = [{ t: "Particulars" }, { t: "Amount", r: 1, z: AC_X.RS }], body = lines.map((l) => l.sec ? [{ v: l.label, bold: true, color: IL.tint }, l.v != null ? { v: l.v, bold: true } : ""] : [{ v: (l.sub ? "    " : "") + l.label, bold: !!l.bold }, l.v == null ? "" : { v: l.v, bold: !!l.bold }]);
  const L = ilLedgerRows(title, sub, [], head, body, null);
  return ilSheet(X, L.rows, [58, 20], L.merges);
}
function acPLLines(P) {
  const out = [{ sec: 1, label: "Sales" }]; P.sales.forEach((x) => out.push({ sub: 1, label: x.name, v: -x.v })); out.push({ bold: 1, label: "Net sales", v: P.salesNet });
  out.push({ sec: 1, label: "Cost of the stock sold" }, { sub: 1, label: "Opening stock", v: P.os.v }); P.purch.concat(P.direct).forEach((x) => out.push({ sub: 1, label: x.name, v: x.v })); out.push({ sub: 1, label: "Less closing stock", v: P.cs.v == null ? null : -P.cs.v }, { bold: 1, label: "Cost of goods sold", v: P.stockGap ? null : P.cogs });
  out.push({ sec: 1, label: "Gross profit", v: P.stockGap ? null : P.gp });
  if (P.inc.length) { out.push({ sec: 1, label: "Other income" }); P.inc.forEach((x) => out.push({ sub: 1, label: x.name, v: -x.v })); out.push({ bold: 1, label: "Total other income", v: P.incT }); }
  out.push({ sec: 1, label: "Running costs" }); P.exp.forEach((x) => out.push({ sub: 1, label: x.name, v: x.v })); out.push({ bold: 1, label: "Total running costs", v: P.expT });
  out.push({ sec: 1, label: "Net profit", v: P.stockGap ? null : P.np });
  return out;
}
function acBSLines(BS) {
  const lab = (g) => (AC_GROUP[g] || {}).label || { advrecv: "Advances received", advpaid: "Advances paid", gst: "GST", profit: "Profit and loss", diff: "Opening balances", stock: "Stock" }[g] || g, out = [];
  const side = (S0, name, total) => { out.push({ sec: 1, label: name }); Object.keys(S0).forEach((g) => { const L = S0[g]; out.push({ bold: 1, label: lab(g), v: L.reduce((a, x) => a + x.v, 0) }); L.forEach((x) => out.push({ sub: 1, label: x.name, v: x.v })); }); out.push({ sec: 1, label: "Total " + name.toLowerCase(), v: total }); };
  side(BS.sides.A, "What we have (assets)", BS.assets); side(BS.sides.L, "What we owe and partners' money (liabilities and capital)", BS.liab);
  return out;
}
ACT.acvExcel = async (el) => {
  const X = await acXlsx(el); if (!X) return;
  const R = acRange(), tab = S.acTab || "overview", rep = S.acRep || "pl", wb = X.utils.book_new(), co = acCo(), per = `${R.label} (${dmyOf(R.from)} to ${dmyOf(R.to)})`;
  const add = (ws, n) => X.utils.book_append_sheet(wb, ws, n);
  const P = acPL(R.from, R.to); add(acStmtSheet(X, "Profit and loss", `${co} · ${per} · excl. GST`, acPLLines(P)), "Profit and loss");
  const BS = acBS(R.to); add(acStmtSheet(X, "Balance sheet", `${co} · as on ${dmyOf(R.to)}`, acBSLines(BS)), "Balance sheet");
  const T = acTB(R.to); { const L = ilLedgerRows("Trial balance", `${co} · as on ${dmyOf(R.to)}`, [["Total debits", T.dr, AC_X.RS], ["Total credits", T.cr, AC_X.RS]], [{ t: "Account" }, { t: "Group" }, { t: "Debit", r: 1, z: AC_X.RS }, { t: "Credit", r: 1, z: AC_X.RS }], T.rows.map((r) => [r.name, (AC_GROUP[r.group] || {}).formal || r.group, r.v > 0 ? r.v : "", r.v < 0 ? -r.v : ""]), ["Total", "", T.dr, T.cr]); add(ilSheet(X, L.rows, [44, 30, 18, 18], L.merges), "Trial balance"); }
  /* the day book: every entry and its accounts */
  { const ACC = acAccounts(), E = acEntries().filter((e) => e.date >= R.from && e.date <= R.to), body = []; E.forEach((e) => e.lines.forEach((l, i) => body.push([i ? "" : acD(e.date), i ? "" : AC_KIND[e.kind] || "", i ? "" : e.no || "", i ? "" : e.party || "", acName(l.a, ACC), l.v > 0 ? l.v : "", l.v < 0 ? -l.v : "", i ? "" : e.text || ""])));
    const L = ilLedgerRows("Day book", `${co} · ${per} · ${E.length} entries`, [], [{ t: "Date", z: AC_X.DATE }, { t: "Type" }, { t: "Number" }, { t: "Party" }, { t: "Account" }, { t: "Debit", r: 1, z: AC_X.RS }, { t: "Credit", r: 1, z: AC_X.RS }, { t: "Details" }], body, null); add(ilSheet(X, L.rows, [12, 16, 18, 28, 32, 15, 15, 50], L.merges), "Day book"); }
  /* money owed to us */
  { const age = acAgeing(R.to), L = ilLedgerRows("Money owed to us", `${co} · as on ${dmyOf(R.to)} · oldest bills cleared first`, [["Owed to us", age.reduce((a, x) => a + x.total, 0), AC_X.RS], ["Overdue", age.reduce((a, x) => a + x.overdue, 0), AC_X.RS, IL.bad]], [{ t: "Party" }, { t: "Credit days", r: 1, z: AC_X.NUM }, { t: "Up to 30 days", r: 1, z: AC_X.RS }, { t: "31–60", r: 1, z: AC_X.RS }, { t: "61–90", r: 1, z: AC_X.RS }, { t: "Over 90", r: 1, z: AC_X.RS }, { t: "Total", r: 1, z: AC_X.RS }, { t: "Overdue", r: 1, z: AC_X.RS }], age.map((x) => [x.name, x.credit, x.d0, x.d30, x.d60, x.d90, x.total, x.overdue ? { v: x.overdue, color: IL.bad } : 0]), ["Total", "", ...["d0", "d30", "d60", "d90", "total", "overdue"].map((k) => age.reduce((a, x) => a + x[k], 0))]);
    add(ilSheet(X, L.rows, [36, 11, 15, 15, 15, 15, 16, 15], L.merges), "Money owed to us"); }
  X.writeFile(wb, `SahiReach accounts ${R.label.replace(/[^\w\s-]/g, "")} ${dmyOf(acToday())}.xlsx`, { compression: true, cellStyles: true });
  logActivity("Accounts downloaded", R.label, "Excel"); toast("Accounts downloaded", "doc");
};
/* one ledger or party statement */
ACT.acvStmtExcel = async (el) => {
  const X = await acXlsx(el); if (!X) return; const id = el.dataset.id, R = acRange(), L = acLedger(id, R.from, R.to), name = acName(id), info = id.startsWith("p:") ? acPartyInfo(id.slice(2)) : null;
  const body = [["", { v: "Opening balance", bold: true }, "", "", "", { v: L.open, bold: true }, L.open >= 0 ? "Dr" : "Cr"]].concat(L.rows.map((r) => [acD(r.e.date), `${AC_KIND[r.e.kind] || "Entry"}${r.e.no ? " " + r.e.no : ""}`, r.e.text || r.e.party || "", r.v > 0 ? r.v : "", r.v < 0 ? -r.v : "", r.bal, r.bal >= 0 ? "Dr" : "Cr"]));
  const T = ilLedgerRows(`${name}`, `${info ? "Statement of account" : "Ledger"} · ${acCo()} · ${R.label} (${dmyOf(R.from)} to ${dmyOf(R.to)})${info && info.gstin ? " · GSTIN " + info.gstin : ""}`, [["Opening", L.open, AC_X.RS], ["Debits", L.dr, AC_X.RS], ["Credits", L.cr, AC_X.RS], ["Closing", L.close, AC_X.RS, IL.tint]], [{ t: "Date", z: AC_X.DATE }, { t: "Voucher" }, { t: "Particulars" }, { t: "Debit", r: 1, z: AC_X.RS }, { t: "Credit", r: 1, z: AC_X.RS }, { t: "Balance", r: 1, z: AC_X.RS }, { t: "" }], body, ["", "Closing balance", "", L.dr, L.cr, L.close, L.close >= 0 ? "Dr" : "Cr"]);
  const wb = X.utils.book_new(); X.utils.book_append_sheet(wb, ilSheet(X, T.rows, [12, 26, 56, 15, 15, 16, 5], T.merges), "Statement");
  X.writeFile(wb, `${name.replace(/[^\w\s-]/g, "")} statement ${dmyOf(R.to)}.xlsx`, { compression: true, cellStyles: true }); logActivity("Statement downloaded", name, "Excel"); toast("Statement downloaded", "doc");
};
/* GST workings: B2B, B2C, credit / debit notes and HSN in the GSTR-1 layout, the 3B summary, and input credit */
ACT.acvGstExcel = async (el) => {
  const X = await acXlsx(el); if (!X) return; const m = el.dataset.m, from = m + "-01", end = ymd(new Date(+m.slice(0, 4), +m.slice(5, 7), 0)), to = end > acToday() ? acToday() : end, G = acGST(from, to), co = acCo(), mon = `${MONTH_LONG[+m.slice(5) - 1]} ${m.slice(0, 4)}`;
  const wb = X.utils.book_new(), add = (ws, n) => X.utils.book_append_sheet(wb, ws, n), RS = AC_X.RS, pos = (r) => (r.gstin ? r.gstin.slice(0, 2) : AC_STATE) + "-" + (r.gstin && r.gstin.slice(0, 2) !== AC_STATE ? "Other state" : "Kerala");
  const s3 = ilLedgerRows("GSTR-3B summary", `${co} · GSTIN ${CO.gstin || ""} · ${mon}`, [["GST on sales", G.outTax, RS], ["Input credit", G.inTax, RS], [G.net >= 0 ? "To pay" : "Credit", Math.abs(G.net), RS, G.net >= 0 ? IL.bad : IL.good]], [{ t: "Section" }, { t: "Taxable value", r: 1, z: RS }, { t: "IGST", r: 1, z: RS }, { t: "CGST", r: 1, z: RS }, { t: "SGST", r: 1, z: RS }],
    [["3.1 (a) Outward taxable supplies (other than zero rated, nil rated and exempted)", G.taxable, G.tax.igst, G.tax.cgst, G.tax.sgst], ["4 (A)(5) All other ITC", G.itcTaxable, G.itc.igst, G.itc.cgst, G.itc.sgst]], ["Net", "", G.tax.igst - G.itc.igst, G.tax.cgst - G.itc.cgst, G.tax.sgst - G.itc.sgst]);
  add(ilSheet(X, s3.rows, [70, 16, 14, 14, 14], s3.merges), "3B");
  const inv = (L, title, sheet, note) => { const T = ilLedgerRows(title, `${co} · ${mon}${note ? " · " + note : ""}`, [], [{ t: "GSTIN of recipient" }, { t: "Receiver name" }, { t: "Invoice number" }, { t: "Invoice date", z: AC_X.DATE }, { t: "Invoice value", r: 1, z: RS }, { t: "Place of supply" }, { t: "Rate", r: 1 }, { t: "Taxable value", r: 1, z: RS }, { t: "IGST", r: 1, z: RS }, { t: "CGST", r: 1, z: RS }, { t: "SGST", r: 1, z: RS }], L.map((r) => [r.gstin || "", r.party, r.no || { v: "No number", color: IL.bad }, acD(r.date), r.total, pos(r), "5%", r.taxable, r.igst, r.cgst, r.sgst]), ["", "Total", "", "", L.reduce((a, r) => a + r.total, 0), "", "", L.reduce((a, r) => a + r.taxable, 0), L.reduce((a, r) => a + r.igst, 0), L.reduce((a, r) => a + r.cgst, 0), L.reduce((a, r) => a + r.sgst, 0)]); add(ilSheet(X, T.rows, [19, 32, 18, 13, 15, 16, 7, 15, 12, 12, 12], T.merges), sheet); };
  inv(G.b2b, "B2B invoices (4A)", "b2b"); if (G.b2c.length) inv(G.b2c, "B2C small (7)", "b2cs", "parties without a GSTIN, reported as totals"); if (G.cdn.length) inv(G.cdn, "Credit / debit notes (9B)", "cdnr", "negative = credit note");
  const hs = Object.values(G.hsn), H = ilLedgerRows("HSN summary (12)", `${co} · ${mon}`, [], [{ t: "HSN" }, { t: "Description" }, { t: "UQC" }, { t: "Total quantity", r: 1, z: AC_X.NUM }, { t: "Taxable value", r: 1, z: RS }, { t: "Rate", r: 1 }], hs.map((h) => [h.hsn, h.desc, "BOX-BOX", Math.round(h.qty), h.taxable, "5%"]), null);
  add(ilSheet(X, H.rows, [12, 36, 10, 15, 16, 8], H.merges), "hsn");
  const I = ilLedgerRows("Input tax credit (purchase bills)", `${co} · ${mon} · check against GSTR-2B`, [], [{ t: "Supplier" }, { t: "Bill" }, { t: "Date", z: AC_X.DATE }, { t: "Taxable value", r: 1, z: RS }, { t: "IGST", r: 1, z: RS }, { t: "CGST", r: 1, z: RS }, { t: "SGST", r: 1, z: RS }], G.purchases.map((r) => [r.party, r.no || "", acD(r.date), r.taxable, r.igst, r.cgst, r.sgst]), ["Total", "", "", G.itcTaxable, G.itc.igst, G.itc.cgst, G.itc.sgst]);
  add(ilSheet(X, I.rows, [28, 20, 13, 16, 13, 13, 13], I.merges), "ITC");
  X.writeFile(wb, `SahiReach GST ${mon}.xlsx`, { compression: true, cellStyles: true }); logActivity("GST workings downloaded", mon, "Excel"); toast("GST workings downloaded", "doc");
};
/* a party statement as a PDF, to send */
ACT.acvStmtPdf = async (el) => {
  const id = el.dataset.id, R = acRange(), L = acLedger(id, R.from, R.to), name = acName(id), party = id.slice(2), info = acPartyInfo(party), O = (acAccounts()[id] || {}).group === "debtors" ? acOpenBills(party, R.to) : null;
  if (el) el.disabled = true;
  try { await loadJsPdf(); } catch (e) { if (el) el.disabled = false; toast("Could not prepare the PDF. Check your internet and try again.", "alert"); return; }
  if (el) el.disabled = false;
  const { jsPDF } = window.jspdf, doc = new jsPDF({ unit: "mm", format: "a4", compress: true }), W = 210, M = 16, C = Object.assign({}, D.company || {});
  const TINT = [11, 122, 112], INK = [29, 29, 31], GREY = [110, 110, 115], LINE = [229, 229, 234], SOFT = [230, 242, 241], ZEBRA = [248, 248, 250], dd = (d) => { const t = toDate(d); return `${pad2(t.getDate())} ${MONTHS[t.getMonth()]} ${t.getFullYear()}`; };
  const dc = (v) => `${pdfMoney(Math.abs(v))} ${Math.abs(v) < 0.005 ? "" : v > 0 ? "Dr" : "Cr"}`;
  doc.setProperties({ title: `Statement of account · ${name}`, author: C.name || "SahiReach LLP", creator: "SahiReach Order Tool" });
  try { if (LOGO && /^data:image\/(png|jpe?g)/.test(LOGO)) doc.addImage(LOGO, LOGO.includes("png") ? "PNG" : "JPEG", M, 14, 13, 13); } catch (e) {}
  doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(...INK); doc.text(C.name || "SahiReach LLP", M + 17, 19.5);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...GREY); doc.text(doc.splitTextToSize([C.address, C.gstin ? "GSTIN " + C.gstin : ""].filter(Boolean).join("  ·  "), 100), M + 17, 24.5);
  doc.setFont("helvetica", "bold"); doc.setFontSize(19); doc.setTextColor(...TINT); doc.text("Statement of account", W - M, 20, { align: "right" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...INK); doc.text(`${dd(R.from)} to ${dd(R.to)}`, W - M, 26, { align: "right" });
  doc.setDrawColor(...LINE); doc.setLineWidth(0.3); doc.line(M, 33, W - M, 33);
  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...GREY); doc.text("TO", M, 40);
  doc.setFontSize(11); doc.setTextColor(...INK); doc.text(name, M, 45.5); doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...GREY); let y0 = 50; [info.addr, info.gstin ? "GSTIN " + info.gstin : ""].filter(Boolean).forEach((t) => { doc.text(t, M, y0); y0 += 4.2; });
  const sy = Math.max(58, y0 + 3), chips = [["OPENING", dc(L.open)], ["BILLED", pdfMoney(L.dr)], ["PAID / CREDITED", pdfMoney(L.cr)], ["BALANCE " + (L.close > 0 ? "DUE" : ""), dc(L.close)]], cw = (W - 2 * M) / chips.length;
  doc.setFillColor(...SOFT); doc.roundedRect(M, sy, W - 2 * M, 15, 3, 3, "F");
  chips.forEach(([k, v], i) => { const x = M + 5 + i * cw; doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...GREY); doc.text(k, x, sy + 5.5); doc.setFontSize(11); doc.setTextColor(...(i === 3 ? TINT : INK)); doc.text("Rs " + v, x, sy + 11.5); });
  const body = [[dd(R.from), { content: "Opening balance", styles: { fontStyle: "bold" } }, "", "", "", dc(L.open)]].concat(L.rows.map((r) => [dd(r.e.date), `${AC_KIND[r.e.kind] || "Entry"}${r.e.no ? " " + r.e.no : ""}`, (r.e.kind === "sale" ? (r.e.text || "").replace(/^Invoice for order \S+ · /, "") : r.e.v && r.e.v.ref ? "Ref " + r.e.v.ref : "").slice(0, 60), r.v > 0 ? pdfMoney(r.v) : "", r.v < 0 ? pdfMoney(-r.v) : "", dc(r.bal)]));
  body.push([{ content: "Closing balance", colSpan: 3, styles: { fontStyle: "bold" } }, { content: pdfMoney(L.dr), styles: { fontStyle: "bold", halign: "right" } }, { content: pdfMoney(L.cr), styles: { fontStyle: "bold", halign: "right" } }, { content: dc(L.close), styles: { fontStyle: "bold", halign: "right" } }]);
  doc.autoTable({ startY: sy + 21, head: [["Date", "Document", "Details", "Debit (Rs)", "Credit (Rs)", "Balance (Rs)"]], body, theme: "plain", margin: { left: M, right: M, bottom: 20 },
    styles: { font: "helvetica", fontSize: 8, textColor: INK, cellPadding: { top: 1.6, bottom: 1.6, left: 1.8, right: 1.8 }, lineColor: LINE, lineWidth: { bottom: 0.2 }, valign: "middle" },
    headStyles: { fontStyle: "bold", fontSize: 7.5, textColor: GREY, lineWidth: { bottom: 0.5 }, lineColor: INK }, alternateRowStyles: { fillColor: ZEBRA },
    columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 40 }, 2: { cellWidth: "auto", textColor: GREY }, 3: { cellWidth: 22, halign: "right" }, 4: { cellWidth: 22, halign: "right" }, 5: { cellWidth: 26, halign: "right" } },
    didParseCell: (d) => { if (d.section === "head" && d.column.index >= 3) d.cell.styles.halign = "right"; } });
  let y = doc.lastAutoTable.finalY + 8;
  if (O && O.bills.length) {
    if (y > 240) { doc.addPage(); y = 24; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...INK); doc.text("Bills still to be paid", M, y); y += 2;
    doc.autoTable({ startY: y + 2, head: [["Bill", "Date", "Days", "Amount due (Rs)"]], body: O.bills.map((b) => [b.no || "Bill", dd(b.date), String(daysBetween(b.date, R.to)), pdfMoney(b.left)]).concat([[{ content: "Total due", colSpan: 3, styles: { fontStyle: "bold" } }, { content: pdfMoney(O.bills.reduce((a, b) => a + b.left, 0)), styles: { fontStyle: "bold", halign: "right" } }]]), theme: "plain", margin: { left: M, right: M },
      styles: { font: "helvetica", fontSize: 8, textColor: INK, cellPadding: 1.6, lineColor: LINE, lineWidth: { bottom: 0.2 } }, headStyles: { fontStyle: "bold", fontSize: 7.5, textColor: GREY, lineWidth: { bottom: 0.5 }, lineColor: INK }, columnStyles: { 2: { halign: "right" }, 3: { halign: "right" } }, didParseCell: (d) => { if (d.section === "head" && d.column.index >= 2) d.cell.styles.halign = "right"; } });
    y = doc.lastAutoTable.finalY + 8;
  }
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...GREY);
  doc.text(doc.splitTextToSize("Please check this statement and tell us of any difference within 7 days. Payments clear the oldest bills first.", W - 2 * M), M, Math.min(y, 270));
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) { doc.setPage(i); doc.setDrawColor(...LINE); doc.setLineWidth(0.3); doc.line(M, 285, W - M, 285); doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...GREY); doc.text(`${C.name || "SahiReach LLP"} · Statement of account · ${name}`, M, 289.5); doc.text(`Page ${i} of ${pages}`, W - M, 289.5, { align: "right" }); }
  doc.save(`${name.replace(/[^\w\s-]/g, "")} statement ${dmyOf(R.to)}.pdf`);
  logActivity("Statement downloaded", name, "PDF"); toast("Statement PDF downloaded", "doc");
};

/* ===== ACCOUNTS: upload accounting data =====
   One place to bring in everything recorded so far: Vyapar's reports (All transactions / Day book, Payment-In,
   Payment-Out, Expenses, Purchase, Sale, credit and debit notes) and the SahiReach accounts template (for anything
   kept elsewhere: opening balances, journals, payments from a notebook). Several files can go in one after another;
   nothing is added until "Bring in" is tapped, and each upload can be taken out again.
   What the tool already has is left out: sales and notes it already holds, Hangyo purchases it recorded, money
   already in the books (from the bank statement, or an earlier upload). A Vyapar sale that matches a dispatch
   (same distributor, total, within 3 days) gives that dispatch its Vyapar invoice number. */
const AC_UP_WANT = {
  date: [/^date$/, /^(txn |transaction |voucher |invoice |bill )?date/, /date/], type: [/^type$/, /transaction type|txn type|voucher type|^type/],
  party: [/party|^account$|party or account|^name$|customer|supplier/], no: [/^ref|invoice no|bill no|^no\.?$|number|voucher no|receipt no/],
  total: [/^total( amount)?$|^amount|grand total|^total/], paid: [/received|paid amount|^paid$|received\/paid/], how: [/payment type|payment mode|^mode|bank or cash/],
  cat: [/category|expense head/], note: [/description|remarks|^note|narration|details/], dr: [/debit account/], cr: [/credit account/],
};
const acUpType = (t) => {
  t = key(t);
  if (!t || /order|estimate|challan|proforma|quotation/.test(t)) return "";
  if (/^opening/.test(t)) return /cr|credit/.test(t) ? "opencr" : "opendr";
  if (/payment.?in|receipt|money in/.test(t)) return "receipt";
  if (/payment.?out|money out/.test(t)) return "payment";
  if (/credit note|sale return|sales return/.test(t)) return "cnote";
  if (/debit note|purchase return/.test(t)) return "pret";
  if (/expense/.test(t)) return "expense";
  if (/purchase/.test(t)) return "purchase";
  if (/sale|invoice/.test(t)) return "sale";
  if (/income/.test(t)) return "income";
  if (/journal/.test(t)) return "journal";
  return "?" + t;
};
const AC_UP_LABEL = { sale: "Sales", purchase: "Purchases", receipt: "Money in", payment: "Money out", expense: "Expenses", cnote: "Credit notes", pret: "Debit notes to Hangyo", income: "Other income", journal: "Journals", opendr: "Opening balances", opencr: "Opening balances" };

ACT.aceVyapar = () => {
  const A = AC(), first = acStockFirst();
  S.acUp = { files: [], plan: [], inv: [], opening: [], newL: {} };
  openSheet("Upload accounting data", `<div class="row-sub">Bring in everything recorded so far: receipts, payments, expenses, purchases, notes and opening balances. Upload as many files as you like, one after another; you see what comes in before anything is added.</div>
    <div class="group" style="margin-top:14px">
      <div class="row"><span class="attn-ic tint">${ic("doc")}</span><span class="grow"><div class="row-title">From Vyapar</div><div class="row-sub">Reports → <b>All transactions</b> (or Day book), ${fmtDate(A.from)} ${A.from.slice(0, 4)} to today → Excel. Payment-In, Payment-Out, Expense, Purchase and Sale reports work too.</div></span></div>
      <div class="row"><span class="attn-ic tint">${ic("book")}</span><span class="grow"><div class="row-title">Anything else</div><div class="row-sub">Opening balances, journals, money paid or received in cash: fill the SahiReach template and upload it.</div></span><button class="btn btn-secondary btn-sm" data-act="acvTemplate">${ic("doc", "sm")} Template</button></div>
    </div>
    <ul class="ac-list"><li>Sales, credit notes and Hangyo purchases the tool already has are left out${first ? ` (Hangyo purchases are in the tool from ${fmtDate(first)})` : ""}.</li><li>A Vyapar sale that matches a dispatch gives it its invoice number.</li><li>Money already in the books (from the bank statement or an earlier upload) is not added twice.</li><li>Bank statements go in <b>Bank</b>.</li></ul>
    <div style="margin-top:14px">${dropZone({ input: "ac-vy-file", dataIn: "aceVyFile", accept: ".xlsx,.xls,.csv", title: "Accounting file", sub: "Vyapar report or the SahiReach template · Excel or CSV" })}</div>
    <div id="ac-vy-out" style="margin-top:14px">${acVyImportsHtml()}</div>`, `<button class="btn btn-secondary" data-act="closeSheet">Close</button>`, true);
};
/* money account for Vyapar's "payment type": cash, a bank named the same as one in the books, or a new bank account */
function acUpMoney(how) {
  const h = key(how), U = S.acUp, ACC = acAccounts();
  if (/cash/.test(h)) return "cash";
  const banks = Object.values(ACC).filter((a) => a.group === "bank"), words = h.replace(/[^a-z0-9 ]/g, " ").split(" ").filter((w) => w.length >= 3 && !/^(bank|account|current|savings|ltd|the)$/.test(w));
  const hit = banks.find((b) => words.some((w) => key(b.name).includes(w))); if (hit) return hit.id;
  const generic = !h || /^(cheque|check|bank|upi|neft|rtgs|imps|online|card|bank transfer|transfer|other)$/.test(h);
  if (generic && banks.length) return banks[0].id;
  const name = generic ? "Bank account" : String(how).trim(), k = key(name);
  const pend = Object.values(U.newL).find((x) => key(x.name) === k); if (pend) return pend.id;
  const id = "l:" + acId("L").slice(2); U.newL[id] = { id, name, group: "bank" }; return id;
}
/* the account for a name: a party the books know, else a new party */
function acUpParty(name, group) {
  const n = String(name || "").trim(); if (!n) return "suspense";
  const ACC = acAccounts(), exact = Object.values(ACC).find((a) => key(a.name) === key(n) || (a.party && key(a.party) === key(n))); if (exact) return exact.id;
  const m = acMatchParty(n); if (m) return m;
  const U = S.acUp, pend = Object.values(U.newL).find((x) => key(x.name) === key(n)); if (pend) return pend.id;
  const id = "l:" + acId("L").slice(2); U.newL[id] = { id, name: n, group, party: n }; return id;
}
/* any account by name (template journals) */
function acUpAcc(name) {
  const n = key(name); if (!n) return ""; const ACC = acAccounts();
  /* whole words only: "current account" is not "Rent" */
  const wb = (hay, needle) => needle.length >= 3 && new RegExp("(^|[^a-z0-9])" + needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "($|[^a-z0-9])").test(hay);
  const a = Object.values(ACC).find((x) => key(x.name) === n) || Object.values(ACC).find((x) => wb(key(x.name), n) || wb(n, key(x.name)));
  return a ? a.id : acMatchParty(name) || "";
}
IN.aceVyFile = async (el) => {
  const f = el.files && el.files[0]; if (!f) return; const U = S.acUp || (S.acUp = { files: [], plan: [], inv: [], opening: [], newL: {} });
  part("ac-vy-out", `<div class="row-sub">Reading ${esc(f.name)}…</div>`);
  let sheets; try { sheets = await acReadSheetFile(f); } catch (e) { part("ac-vy-out", `<div class="banner bad">${ic("alert", "sm")}<span>Could not read that file. Export it as Excel and try again.</span></div>${acUpPreview()}`); return; }
  const R = { file: f.name, n: 0, skip: {}, unmatched: [], kind: "" };
  let found = false;
  sheets.forEach((rows, si) => {
    const H = acFindCols(rows, AC_UP_WANT); if (!H || H.col.total == null) return;
    const title = key(rows.slice(0, H.at).map((r) => r.join(" ")).join(" ") + " " + f.name), fileType = H.col.type == null ? acUpType(/payment.?in|receipt/.test(title) ? "payment-in" : /payment.?out/.test(title) ? "payment-out" : /expense/.test(title) ? "expense" : /purchase/.test(title) ? "purchase" : /credit note|sale return/.test(title) ? "credit note" : /debit note|purchase return/.test(title) ? "debit note" : /sale/.test(title) ? "sale" : "") : "";
    if (H.col.type == null && !fileType) return;
    found = true; R.kind = H.col.type != null ? (/template|sahireach accounts/.test(title) ? "SahiReach template" : "All transactions") : AC_UP_LABEL[fileType] + " report";
    rows.slice(H.at + 1).forEach((r) => acUpRow(r, H.col, fileType, R));
  });
  if (!found) {
    const bank = sheets.some((s) => { const b = acBankParse(s); return b && b.length; });
    part("ac-vy-out", `<div class="banner ${bank ? "info" : "bad"}">${ic(bank ? "info" : "alert", "sm")}<span>${bank ? `<b>${esc(f.name)}</b> looks like a bank statement. Upload it in Accounts → <button class="btn-plain" data-act="acvGoBankClose">Bank</button>.` : `<b>${esc(f.name)}</b> is not a report this can read. It needs Date, Type (or a report of one kind) and Amount / Total columns.`}</span></div>${acUpPreview()}`);
    return;
  }
  U.files.push(R); part("ac-vy-out", acUpPreview());
};
ACT.acvGoBankClose = () => { closeSheet(); S.acTab = "bank"; go("accounts"); };
function acUpRow(r, C, fileType, R) {
  const U = S.acUp, A = AC(), g = (k) => (C[k] != null ? r[C[k]] : ""), date = acParseDate(g("date"));
  const typ = C.type != null ? acUpType(g("type")) : fileType, party = String(g("party") || "").trim(), no = String(g("no") || "").trim(), raw = acNum(g("total")), tot = acR2(Math.abs(raw)), paid = acR2(Math.abs(acNum(g("paid")))), how = String(g("how") || ""), cat = String(g("cat") || "").trim(), note = String(g("note") || "").trim();
  const sk = (why) => (R.skip[why] = (R.skip[why] || 0) + 1);
  if (!date || !typ || !(tot > 0)) return; if (typ[0] === "?") return sk(`“${typ.slice(1)}” (not a type this reads)`);
  if (date < A.from && !/^open/.test(typ)) return sk("Before the books start");
  const vk = [date, typ, no, key(party), tot].join("|");
  if (A.vouchers.some((v) => !v.deleted && v.vy === vk) || U.plan.some((p) => p.vk === vk)) return sk("Already brought in");
  const add = (p) => { U.plan.push(Object.assign({ vk, date, no, file: R.file }, p)); R.n++; };
  const moneyDupe = (acc, pid, amt, sign) => A.vouchers.some((v) => !v.deleted && v.lines.some((l) => l.a === pid && Math.abs(l.v - sign * amt) < 0.01) && Math.abs(daysBetween(v.date, date)) <= 3) || U.plan.some((p) => p.vk !== vk && p.lines && p.lines.some((l) => l.a === pid && Math.abs(l.v - sign * amt) < 0.01) && Math.abs(daysBetween(p.date, date)) <= 3 && p.file !== R.file);
  const tf = acToolFrom(), first = acStockFirst();
  if (typ === "sale") {
    const inTool = no && ((D.salesBefore || []).some((x) => x.inv === no) || D.orders.some((o) => o.inv === no));
    if (inTool) sk("Sales already in the tool");
    else if (date >= tf) {
      const pid = acUpParty(party, "debtors"), dn = pid.startsWith("p:") ? pid.slice(2) : party;
      const o = D.orders.find((x) => x.status === "Dispatched" && !x.inv && x.dispatched && Math.abs(daysBetween(x.dispatched.slice(0, 10), date)) <= 3 && canonDist(x.dist) === canonDist(dn) && Math.abs(Math.round(x.valueGst || (x.value || 0) * 1.05) - tot) <= 2 && !U.inv.some((i) => i.id === x.id));
      if (o && no) { U.inv.push({ id: o.id, no, file: R.file }); R.inv = (R.inv || 0) + 1; } else { sk("Sales not matched to a dispatch"); R.unmatched.push(`${fmtDate(date)} · ${party} · ${no || "no number"} · ${rs2(tot)}`); }
    } else {
      const pid = acUpParty(party, "debtors"), net = acR2(tot / 1.05), I = acInvoice(1, pid.startsWith("p:") ? pid.slice(2) : party, "sales-gt", net, false, false); I.lines[0].a = pid;
      add({ type: "journal", kind: "sale", party, tot, lines: I.lines, text: "Sale from Vyapar" });
    }
    if (paid > 0) { const m = acUpMoney(how), pid = acUpParty(party, "debtors"); if (!moneyDupe(m, pid, paid, -1)) add({ vk: vk + "|paid", type: "receipt", party, tot: paid, lines: [{ a: m, v: paid }, { a: pid, v: -paid }], text: "Paid at the time of sale" }); }
    return;
  }
  if (typ === "purchase") {
    const hangyo = /hangyo/i.test(party);
    if (hangyo && ((first && date >= first) || (no && D.purchases.some((p) => key(p.inv) === key(no))))) sk("Hangyo purchases already in the tool");
    else {
      const pid = hangyo ? acPartyId("Hangyo") : acUpParty(party, "creditors"), inter = hangyo ? acInter("Hangyo") : false, net = acR2(tot / 1.05), tl = acTaxLines(net, inter, false), gross = acR2(net + tl.reduce((a, l) => a + l.v, 0));
      add({ type: "journal", kind: "purchase", party: hangyo ? "Hangyo" : party, tot, lines: [{ a: "purchases", v: net }].concat(tl.map((l) => ({ a: l.a, v: l.v, tax: l.tax })), [{ a: pid, v: -gross }]).concat(Math.abs(gross - tot) > 0.004 ? [{ a: "round", v: acR2(gross - tot) }, { a: pid, v: acR2(tot - gross) }] : []), itc: tl.map((l) => ({ k: l.tax, v: l.v })), taxable: net, text: "Purchase from Vyapar" });
    }
    if (paid > 0) { const m = acUpMoney(how), pid = hangyo ? acPartyId("Hangyo") : acUpParty(party, "creditors"); if (!moneyDupe(m, pid, paid, 1)) add({ vk: vk + "|paid", type: "payment", party, tot: paid, lines: [{ a: pid, v: paid }, { a: m, v: -paid }], text: "Paid at the time of purchase" }); }
    return;
  }
  if (typ === "receipt" || typ === "payment") {
    const inn = typ === "receipt", pid = acUpParty(party, inn ? "debtors" : "creditors"), m = acUpMoney(how);
    if (moneyDupe(m, pid, tot, inn ? -1 : 1)) return sk("Money already in the books");
    return add({ type: typ, party, tot, lines: inn ? [{ a: m, v: tot }, { a: pid, v: -tot }] : [{ a: pid, v: tot }, { a: m, v: -tot }], unk: pid === "suspense", text: note || (inn ? "Received" : "Paid") });
  }
  if (typ === "expense") {
    const ea = acExpenseAcc(cat + " " + party + " " + note), m = acUpMoney(how);
    if (A.vouchers.some((v) => !v.deleted && v.lines.some((l) => l.a === m && Math.abs(l.v + tot) < 0.01) && v.lines.some((l) => l.a === ea) && Math.abs(daysBetween(v.date, date)) <= 3)) return sk("Money already in the books");
    return add({ type: "expense", party: cat || party || "Expense", tot, lines: [{ a: ea, v: tot }, { a: m, v: -tot }], text: [cat, party, note].filter(Boolean).join(" · ") });
  }
  if (typ === "income") { const m = acUpMoney(how); return add({ type: "receipt", party: party || cat || "Other income", tot, lines: [{ a: m, v: tot }, { a: "x:interest", v: -tot }], text: note || cat || "Other income" }); }
  if (typ === "cnote") {
    if (no && ((D.notes || []).some((n) => key(n.no) === key(no)) || (D.salesBefore || []).some((x) => x.inv === no))) return sk("Notes already in the tool");
    const pid = acUpParty(party, "debtors"), net = acR2(tot / 1.05), I = acInvoice(-1, pid.startsWith("p:") ? pid.slice(2) : party, "sales-ret", net, false, false); I.lines[0].a = pid;
    return add({ type: "journal", kind: "cnote", party, tot, lines: I.lines, text: "Credit note from Vyapar" });
  }
  if (typ === "pret") {
    if (no && (D.notes || []).some((n) => key(n.no) === key(no))) return sk("Notes already in the tool");
    const hangyo = /hangyo/i.test(party) || !party, pid = hangyo ? acPartyId("Hangyo") : acUpParty(party, "creditors"), net = acR2(tot / 1.05), tl = acTaxLines(net, hangyo ? acInter("Hangyo") : false, false), gross = acR2(net + tl.reduce((a, l) => a + l.v, 0));
    return add({ type: "journal", kind: "pret", party: hangyo ? "Hangyo" : party, tot, lines: [{ a: pid, v: gross }, { a: "pur-ret", v: -net }].concat(tl.map((l) => ({ a: l.a, v: -l.v, tax: l.tax }))), itc: tl.map((l) => ({ k: l.tax, v: -l.v })), taxable: -net, text: "Debit note from Vyapar (stock returned)" });
  }
  if (typ === "opendr" || typ === "opencr") {
    const k = key(party), U2 = S.acUp, grp = /cash/.test(k) ? "cash" : /bank|a\/c|current|savings/.test(k) ? "bank" : /capital|partner/.test(k) ? "capital" : /loan/.test(k) ? "loans" : /deposit/.test(k) ? (typ === "opendr" ? "advances" : "deposits") : /stock/.test(k) ? "stock" : /freezer|vehicle|furniture|computer|equipment/.test(k) ? "fixed" : typ === "opendr" ? "debtors" : "creditors";
    let id = grp === "cash" ? "cash" : grp === "stock" ? "stock" : acUpAcc(party); if (id && AC_PL((acAccounts()[id] || {}).group)) id = ""; /* opening balances are never on income or expense accounts */
    if (!id) { const pend = Object.values(U2.newL).find((x) => key(x.name) === k); if (pend) id = pend.id; else { id = "l:" + acId("L").slice(2); U2.newL[id] = Object.assign({ id, name: party, group: grp }, ["debtors", "creditors"].includes(grp) ? { party } : {}); } }
    U.opening.push({ id, name: party, v: typ === "opendr" ? tot : -tot, file: R.file }); R.n++; return;
  }
  if (typ === "journal") {
    const da = acUpAcc(g("dr")), ca = acUpAcc(g("cr"));
    if (!da || !ca) return sk("Journals whose accounts are not in the books");
    return add({ type: "journal", party: "", tot, lines: [{ a: da, v: tot }, { a: ca, v: -tot }], text: note || "Journal" });
  }
}
function acUpPreview() {
  const U = S.acUp; if (!U || !U.files.length) return acVyImportsHtml();
  const ACC = acAccounts(), by = {}; U.plan.forEach((p) => { const k = AC_UP_LABEL[p.kind || p.type] || "Other"; const x = (by[k] = by[k] || { n: 0, v: 0 }); x.n++; x.v += p.tot; });
  if (U.opening.length) by["Opening balances"] = { n: U.opening.length, v: U.opening.reduce((a, o) => a + Math.abs(o.v), 0) };
  const newL = Object.values(U.newL), unk = U.plan.filter((p) => p.unk).length, total = U.plan.length + U.opening.length + U.inv.length;
  return `<div class="stack gap-12">${U.files.map((R) => `<div class="card card-pad"><div class="hstack" style="justify-content:space-between;gap:10px"><div><div class="card-title" style="font-size:15px">${esc(R.file)}</div><div class="card-sub">${esc(R.kind)} · ${R.n} to bring in${R.inv ? ` · ${R.inv} invoice number${R.inv === 1 ? "" : "s"} for dispatches` : ""}</div></div>${ic("check", "sm")}</div>
      ${Object.keys(R.skip).length ? `<div class="row-sub" style="margin-top:8px">Left out: ${Object.keys(R.skip).map((k) => `${esc(k)} (${R.skip[k]})`).join(" · ")}</div>` : ""}
      ${R.unmatched.length ? `<details style="margin-top:8px"><summary class="row-sub" style="cursor:pointer">${R.unmatched.length} Vyapar sale${R.unmatched.length === 1 ? "" : "s"} not matched to a dispatch (not added, so nothing is counted twice)</summary><div class="row-sub" style="margin-top:6px">${R.unmatched.slice(0, 30).map(esc).join("<br>")}${R.unmatched.length > 30 ? "<br>…" : ""}</div></details>` : ""}</div>`).join("")}
    <div class="card card-pad"><div class="card-title">What will come in</div>
      <div class="group" style="margin-top:10px">${Object.keys(by).map((k) => `<div class="row"><span class="grow">${esc(k)}</span><span class="row-sub">${by[k].n}</span><span class="num" style="font-weight:600;min-width:120px;text-align:right">${rs2(by[k].v)}</span></div>`).join("")}${U.inv.length ? `<div class="row"><span class="grow">Vyapar invoice numbers for dispatches</span><span class="row-sub">${U.inv.length}</span><span style="min-width:120px"></span></div>` : ""}${!total ? `<div class="row"><span class="row-sub">Nothing new to bring in.</span></div>` : ""}</div>
      ${newL.length ? `<div class="row-sub" style="margin-top:10px">New accounts: ${newL.map((l) => `${esc(l.name)} <span class="dim">(${esc((AC_GROUP[l.group] || {}).label || l.group)})</span>`).join(", ")}</div>` : ""}
      ${unk ? `<div class="banner warn" style="margin-top:10px">${ic("alert", "sm")}<span>${unk} entr${unk === 1 ? "y has" : "ies have"} no party name; they go to “Not yet sorted” and can be changed in the Day book.</span></div>` : ""}
      ${total && AC_CAN ? `<button class="btn btn-primary" style="margin-top:12px" data-act="aceVyGo">${ic("check", "sm")} Bring in ${total} item${total === 1 ? "" : "s"}</button>` : ""}</div>
    ${acVyImportsHtml()}</div>`;
}
ACT.aceVyGo = () => {
  const U = S.acUp; if (!U) return; const A = acStore(), imp = { id: acId("I"), file: U.files.map((f) => f.file).join(", "), at: iso(NOW()), n: 0, by: HOST ? ME.name : undefined, inv: [], opening: {}, ledgers: [] };
  Object.values(U.newL).forEach((l) => { if (!A.ledgers.some((x) => x.id === l.id)) { A.ledgers.push(Object.assign({}, l, { by: imp.by, time: imp.at, imp: imp.id })); imp.ledgers.push(l.id); } });
  U.plan.forEach((p) => { const v = { id: acId("V"), type: p.type, no: acNextNo(AC_VTYPES[p.type] ? p.type : "journal", p.date), date: p.date, party: p.party, text: `From Vyapar${p.no ? " · " + p.no : ""} · ${p.text || ""}`.replace(/ · $/, ""), ref: p.no, note: p.text, lines: p.lines.map((l) => Object.assign({}, l)), total: p.tot, src: "vyapar", vy: p.vk, imp: imp.id, by: imp.by, time: imp.at }; if (p.itc) { v.itc = p.itc; v.taxable = p.taxable; } if (/template/i.test(p.file || "") || /SahiReach template/.test((U.files.find((f) => f.file === p.file) || {}).kind || "")) v.text = v.text.replace("From Vyapar", "Uploaded"); A.vouchers.push(v); imp.n++; });
  U.inv.forEach((x) => { const o = D.orders.find((y) => y.id === x.id); if (o && !o.inv) { o.inv = x.no; imp.inv.push(x.id); imp.n++; } });
  U.opening.forEach((o) => { if (!(o.id in imp.opening)) imp.opening[o.id] = A.opening[o.id] == null ? null : A.opening[o.id]; A.opening[o.id] = acR2((+A.opening[o.id] || 0) + o.v); imp.n++; });
  if (U.opening.length) A.openingDone = true;
  A.imports.push(imp); A.vyDone = true; logActivity("Accounting data uploaded", imp.file, `${imp.n} items`); acDirty();
  const n = imp.n; S.acUp = { files: [], plan: [], inv: [], opening: [], newL: {} };
  part("ac-vy-out", `<div class="banner good">${ic("check", "sm")}<span>${n} item${n === 1 ? "" : "s"} brought in. Entries are in the Day book, marked “From Vyapar”. Upload another file, or close.</span></div>${acVyImportsHtml()}`); render(); toast("Accounting data brought in", "check");
};
/* take an upload out again: its entries, the invoice numbers it filled, the opening balances it set, the accounts it made (if unused) */
ACT.aceVyUndo = (el) => {
  const A = acStore(), imp = A.imports.find((x) => x.id === el.dataset.id); if (!imp) return;
  if (el.dataset.sure !== "1") { el.dataset.sure = "1"; el.textContent = "Tap again"; el.classList.add("btn-danger"); return; }
  let n = 0; A.vouchers.forEach((v) => { if (v.imp === imp.id && !v.deleted) { v.deleted = true; v.deletedAt = iso(NOW()); n++; } });
  (imp.inv || []).forEach((id) => { const o = D.orders.find((y) => y.id === id); if (o) delete o.inv; });
  Object.keys(imp.opening || {}).forEach((id) => { const was = imp.opening[id]; if (was == null) delete A.opening[id]; else A.opening[id] = was; });
  acDirty(); const used = new Set(); acEntries().forEach((e) => e.lines.forEach((l) => used.add(l.a)));
  (imp.ledgers || []).forEach((id) => { const l = A.ledgers.find((x) => x.id === id); if (l && !used.has(id) && !(id in A.opening)) l.deleted = true; });
  imp.removed = true; logActivity("Upload taken out", imp.file, `${n} entries`); acDirty(); part("ac-vy-out", acVyImportsHtml()); render(); toast(`${n} entries taken out`, "undo");
};
/* the template, for anything not in Vyapar */
ACT.acvTemplate = async (el) => {
  const X = await acXlsx(el); if (!X) return; const t = acToday(), fy = acFYStart(t);
  const head = [{ t: "Date", z: AC_X.DATE }, { t: "Type" }, { t: "Party or account" }, { t: "Amount", r: 1, z: AC_X.RS }, { t: "Bank or cash" }, { t: "Reference" }, { t: "Note" }, { t: "Debit account" }, { t: "Credit account" }];
  const ex = [[acD(addDays(fy, -1)), "Opening Dr", "HDFC current account", 250000, "", "", "Bank balance on 31 March", "", ""], [acD(addDays(fy, -1)), "Opening Cr", "Partners' capital", 250000, "", "", "", "", ""], [acD(fy), "Money in", "Supreme Traders Kerala LLP", 50000, "HDFC", "UTR123", "", "", ""], [acD(fy), "Money out", "Hangyo", 100000, "HDFC", "", "", "", ""], [acD(fy), "Expense", "Rent", 15000, "Cash", "", "Office rent", "", ""], [acD(fy), "Journal", "", 5000, "", "", "Depreciation on freezers", "Office and general expenses", "Freezers"]];
  const L = ilLedgerRows("SahiReach accounts template", "One line per entry. Delete the example lines, fill yours, save, and upload in Accounts → Upload accounting data.", [], head, ex, null);
  const help = [["Type", "What it is", "Fill in"], ["Money in", "Money received", "Party, amount, bank or cash"], ["Money out", "Money paid", "Party (or what it was for), amount, bank or cash"], ["Expense", "A cost paid", "What it was for (rent, salary, fuel…), amount, bank or cash"], ["Purchase", "A purchase bill (amount incl. 5% GST)", "Supplier, amount, reference"], ["Sale", "A sale invoice (amount incl. 5% GST)", "Distributor, amount, invoice number"], ["Credit note", "Sales return / rate difference to a distributor", "Party, amount incl. GST, note number"], ["Debit note", "Stock returned to Hangyo", "Amount incl. GST, note number"], ["Opening Dr", "Opening balance: what we have or are owed", "Account, amount (date: the day before the books start)"], ["Opening Cr", "Opening balance: what we owe, partners' capital", "Account, amount"], ["Journal", "Anything else", "Amount, Debit account, Credit account (names as in Accounts)"]];
  const wb = X.utils.book_new(); X.utils.book_append_sheet(wb, ilSheet(X, L.rows, [13, 13, 32, 15, 18, 14, 30, 28, 28], L.merges), "Entries");
  const H = ilLedgerRows("How to fill it", "Dates as dd-mm-yyyy. Amounts in rupees. Names as they are in the tool (distributors, Hangyo, transporters, accounts).", [], [{ t: "Type" }, { t: "What it is" }, { t: "Fill in" }], help.slice(1), null);
  X.utils.book_append_sheet(wb, ilSheet(X, H.rows, [14, 46, 60], H.merges), "How to fill it");
  X.writeFile(wb, "SahiReach accounts template.xlsx", { compression: true, cellStyles: true }); toast("Template downloaded", "doc");
};

/* ===== shell markup (sidebar + phone tab bar), then first render ===== */
(function buildShell() {
  const item = (r, extra = "") => `<button class="nav-item" data-act="nav" data-to="${r}" data-nav="${r}">${ic(ROUTES[r].icon)}<span>${ROUTES[r].label}</span>${extra}</button>`;
  $("#sidebar").innerHTML = `<div class="brand"><img src="${LOGO}" alt=""><div><div class="brand-name">Sahi<span>Reach</span></div><div class="brand-sub">Order Tool</div></div></div>
    ${item("home")}
    <div class="nav-label">Sell</div>${item("orders")}${item("dispatch", `<span class="nav-badge hot" id="badge-dispatch" hidden></span>`)}${item("quick", `<span class="nav-badge" id="badge-quick" hidden></span>`)}
    <div class="nav-label">Stock</div>${item("stock")}${item("replenish")}
    ${SEE_MONEY ? `<div class="nav-label">Money</div>${item("accounts")}${item("tod")}${item("logistics")}` : ""}
    <div class="nav-label">Manage</div>${item("setup")}${item("activity")}${ROUTES.backups ? item("backups") : ""}
    <div class="side-foot"><button class="nav-item" data-act="cmd">${ic("search")}<span>Search</span><span class="nav-badge">⌘K</span></button><${HOST ? 'button class="me me-btn" data-act="account" aria-label="Account"' : 'div class="me"'}><span class="avatar">${esc(initials(ME.name).slice(0, 1) || "S")}</span><span class="grow" style="text-align:left;min-width:0"><span class="clip" style="display:block;font-weight:600;font-size:14px">${esc(ME.name)}</span><span class="brand-sub" style="display:block">${ROLE === "owner" ? "SahiReach LLP" : ROLE_LABEL[ROLE] + (CAN_EDIT || ROLE === "accountant" ? "" : " · view only")}</span></span>${HOST ? ic("chevR", "sm chev") : ""}</${HOST ? "button" : "div"}></div>`;
  const tab = (r, label) => `<button class="tab" data-act="nav" data-to="${r}" data-nav="${r}">${ic(ROUTES[r].icon)}<span>${label}</span></button>`;
  $("#tabbar").innerHTML = tab("home", "Home") + tab("orders", "Orders") + tab("dispatch", "Dispatch") + tab("stock", "Stock") + tab("more", "More");
})();
go(ROUTES[location.hash.slice(1)] ? location.hash.slice(1) : ROLE === "accountant" ? "accounts" : "home");

let wasNarrow = isNarrow(), rzT = 0;
window.addEventListener("resize", () => { clearTimeout(rzT); rzT = setTimeout(() => { if (isNarrow() !== wasNarrow) { wasNarrow = isNarrow(); if (S.route === "home") render(); } }, 150); });

/* ===== saving: every change is written to the database a moment after it is made ===== */
function snapshot() {
  const flat = (m) => Object.keys(m).reduce((a, k) => a.concat(m[k] || []), []);
  const out = Object.assign({}, D, {
    orderLines: flat(linesByOrder),
    qcLines: flat(qcLinesByPO),
    special: Object.assign({}, D.special, { distributors: D.distributors.filter((d) => d.special).map((d) => d.name) }),
  });
  return JSON.stringify(out, (k, v) => (k.charCodeAt(0) === 95 ? undefined : v)); /* working fields starting with "_" are not saved */
}
const SAVE = { on: false, why: "", version: null, last: null, lastObj: null, undoQ: [], busy: false, again: false, timer: 0, state: "", conflict: false };
(function initSave() {
  if (!HOST) return;
  if (!CAN_EDIT && ROLE !== "accountant") { SAVE.why = "view"; return; }
  if (!HOST.save || HOST.version == null) { SAVE.why = "setup"; return; }
  if (DATA_OLD) { SAVE.why = "old"; return; }
  SAVE.on = true; SAVE.version = HOST.version; SAVE.last = snapshot(); try { SAVE.lastObj = JSON.parse(SAVE.last); } catch (e) {}
  SAVE.lastAt = iso(NOW()); try { stockOpenCheck(false); } catch (e) {} /* the month's opening stock, for the stock statement; saved by the safety net below */
})();
function saveBadge() {
  let el = $("#save-state");
  if (!el) { el = document.createElement("button"); el.id = "save-state"; el.className = "save-state"; el.setAttribute("data-act", "saveRetry"); el.setAttribute("aria-live", "polite"); document.body.appendChild(el); }
  return el;
}
function setSaveState(st, msg) {
  SAVE.state = st; const el = saveBadge();
  const txt = { saving: "Saving…", saved: "Saved", error: msg || "Not saved · tap to retry", conflict: "Changed by someone else · tap to reload", off: msg || "Saving is off" }[st] || "";
  el.innerHTML = (st === "saved" ? ic("check", "sm") : st === "saving" ? `<span class="save-spin"></span>` : ic("alert", "sm")) + `<span>${esc(txt)}</span>`;
  el.className = "save-state " + st + " on";
  clearTimeout(el._t); if (st === "saved") el._t = setTimeout(() => el.classList.remove("on"), 1800);
}
function dirty() { return SAVE.on && snapshot() !== SAVE.last; }
function queueSave() { if (!SAVE.on || SAVE.conflict) return; clearTimeout(SAVE.timer); SAVE.timer = setTimeout(doSave, 400); }
async function doSave() {
  if (!SAVE.on || SAVE.conflict) return;
  if (SAVE.busy) { SAVE.again = true; return; }
  try { stockOpenCheck(true); } catch (e) {} /* first change of a new month in a tab left open: record the opening stock first */
  let s = snapshot(); if (s === SAVE.last) return;
  /* what this save changes, kept so the system admin can undo it from the Activity log */
  let rec = null; try { rec = undoPrep(s); if (rec && rec.relog) s = snapshot(); } catch (e) { rec = null; }
  SAVE.busy = true; setSaveState("saving");
  try {
    const r = await HOST.save(s, SAVE.version);
    SAVE.version = r && typeof r.version === "number" ? r.version : SAVE.version + 1; SAVE.last = s; SAVE.lastAt = iso(NOW()); setSaveState("saved");
    try { SAVE.lastObj = JSON.parse(s); } catch (e) {}
    if (rec) undoSend(rec);
  } catch (e) {
    const m = (e && e.message) || "";
    if (/CONFLICT/.test(m)) { SAVE.conflict = true; setSaveState("conflict"); conflictSheet(m); }
    else setSaveState("error", e && e.network ? "Offline · not saved yet · tap to retry" : "Not saved · tap to retry");
  }
  SAVE.busy = false;
  if (SAVE.again) { SAVE.again = false; doSave(); }
}
function conflictSheet(m) {
  const who = (m.split("CONFLICT:")[1] || "").trim();
  openSheet("Someone else saved first", `<div class="banner warn">${ic("alert", "sm")}<span><b>${esc(who || "Another team member")} saved changes while you were working.</b> Your last change was not saved, so that nobody's work is overwritten. Reload to get the latest, then do your last step again.</span></div>`, `<button class="btn btn-primary" data-act="reloadLatest">${ic("undo", "sm")} Reload the latest</button>`);
}
ACT.reloadLatest = () => location.reload();
ACT.saveRetry = () => { if (SAVE.state === "conflict") location.reload(); else if (SAVE.state === "error") doSave(); };
/* save after anything the user does; IN handlers fire per keystroke, so the debounce matters */
["click", "change", "keydown"].forEach((t) => document.addEventListener(t, () => setTimeout(queueSave, 0)));
document.addEventListener("input", () => queueSave());
/* safety net: anything changed without a tap (after an email is sent, a file is read…) is saved within a few seconds */
setInterval(() => { if (SAVE.on && !SAVE.busy && !SAVE.conflict && dirty()) queueSave(); }, 4000);
window.addEventListener("beforeunload", (e) => { if (SAVE.on && !SAVE.conflict && (SAVE.busy || dirty())) { e.preventDefault(); e.returnValue = ""; } });
window.addEventListener("online", () => { if (SAVE.state === "error") doSave(); });

/* pick up what others saved: when the tab comes back, and every minute */
async function checkLatest() {
  if (!SAVE.on || SAVE.busy || SAVE.conflict || !HOST.latest) return;
  let r; try { r = await HOST.latest(); } catch (e) { return; }
  if (!r || typeof r.version !== "number" || r.version <= SAVE.version) return;
  const busyHere = sheetOpen || (S.draft && S.draft.lines.length) || dirty();
  if (!busyHere) { toast(`Updated by ${r.saved_by || "a team member"} · refreshing`, "undo"); setTimeout(() => location.reload(), 700); }
  else setSaveState("conflict");
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") checkLatest(); });
setInterval(checkLatest, 60000);

if (HOST && !SAVE.on) setSaveState("off", SAVE.why === "view" ? "View only" : SAVE.why === "setup" ? "Saving is off · database step needed" : "Load the new data file to start saving");
