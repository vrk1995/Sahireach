/* ===== data, helpers, state ===== */
const HOST = window.SR || null; /* set by the staff-login page after sign-in; absent in the standalone preview */
const D = HOST && HOST.data ? HOST.data : JSON.parse(document.getElementById("seed").textContent);
const LOGO = HOST && HOST.logo ? HOST.logo : document.getElementById("logo-data").textContent.trim();
const ME = (HOST && HOST.me) || { name: "Vishnu", role: "owner" };
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
  setup: { label: "Setup", icon: "gear" },
  more: { label: "More", icon: "grid" },
};
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
    const on = el.dataset.nav === cur || (el.dataset.nav === "more" && ["quick", "replenish", "tod", "setup", "more"].includes(cur) && el.classList.contains("tab"));
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
  requestAnimationFrame(() => { $("#scrim").classList.add("on"); sh.classList.add("on"); });
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
function logActivity(action, ref, detail) { D.activity.unshift({ time: iso(NOW()), action, ref, detail, by: HOST ? ME.name : undefined }); }

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
    const sap = n.sap || (catByName[key(n.product)] || {}).sap || null, back = /return/i.test(n.type || "") && sap && n.ea, uc = back ? unitCost(sap) : null;
    f.push({ date: (n.date || "").slice(0, 10), ch: "gt", dist: canonDist(n.party), sap, product: n.product, crates: -(n.crates || 0), value: n.sales, tod: 0, cost: uc != null ? -n.ea * uc : 0, ref: n.no, kind: "note" });
  });
  D.qcPOs.forEach((p) => {
    if (!p.deliveredOn || !(p.valueAccepted > 0)) return;
    const dt = p.deliveredOn.slice(0, 10), ch = p.platform.toLowerCase(), ls = (qcLinesByPO[p.po] || []).filter((l) => (l.accepted || 0) > 0);
    if (ls.length) ls.forEach((l) => { const v = l.valueAccepted != null ? l.valueAccepted : l.accepted * l.price; f.push({ date: dt, ch, dist: p.platform, sap: l.sap, product: l.product, crates: l.ppc ? l.accepted / l.ppc : 0, value: v, tod: 0, cost: v * (1 - QC_GP_RATE), ref: p.po, kind: "qc" }); });
    else f.push({ date: dt, ch, dist: p.platform, sap: null, product: null, crates: p.pcs ? (p.crates * (p.pcsAccepted || 0)) / p.pcs : 0, value: p.valueAccepted, tod: 0, cost: p.valueAccepted * (1 - QC_GP_RATE), ref: p.po, kind: "qc" });
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
  F.forEach((f) => {
    s.net += f.value; s[f.ch] += f.value; s.crates += f.crates;
    if (f.ch === "gt") { s.gtCrates += f.crates; if (f.kind === "order") s.toolCrates += f.crates; if (f.noCost && f.value > 0) { s.noCost += f.value; s.noCostP[f.product || f.sap] = (s.noCostP[f.product || f.sap] || 0) + f.value; } else s.gpGT += f.value + f.tod - f.cost; s.tod += f.tod; if (f.kind === "note" || f.kind === "return") s.returns += -f.value; else { s.orders.add(f.ref); if (f.value > 0) s.dists.add(f.dist); } }
    else { s.qcCrates += f.crates; s.gpQC += f.value * QC_GP_RATE; s.qcDeliveries.add(f.ref); }
  });
  const ch = S.dash.ch, dsel = S.dash.district;
  if (ch === "all" || ch === "gt") D.oos.forEach((o) => { const ord = D.orders.find((x) => x.id === o.id), d = ord && ord.status === "Dispatched" && ord.dispatched ? ord.dispatched.slice(0, 10) : null; if (typeof o.missed === "number" && d && d >= from && d <= to && (dsel === "all" || districtOf(o.dist) === dsel)) s.missed += o.missed; });
  if (dsel === "all" && ch !== "gt") D.qcPOs.forEach((p) => { const d = (p.deliveredOn || (p.status === "Lapsed" ? p.expiry : "") || "").slice(0, 10); if (!d || d < from || d > to) return; if ((ch === "swiggy" || ch === "zepto") && p.platform.toLowerCase() !== ch) return; s.qcOrdered += p.pcs || 0; s.qcAccepted += p.pcsAccepted || 0; });
  D.orders.forEach((o) => { if (o.status === "Dispatched" && o.dispatched && o.dispatched.slice(0, 10) >= from && o.dispatched.slice(0, 10) <= to && (ch === "all" || ch === "gt") && (dsel === "all" || districtOf(o.dist) === dsel)) s.o2d.push((toDate(o.dispatched) - toDate(o.time)) / 864e5); });
  /* sales of products with no cost price would count as pure profit: estimate their profit at the margin of the rest */
  if (s.noCost) { const base = s.gt - s.noCost + s.tod; s.gpEst = base > 0 ? s.noCost * (s.gpGT / base) : 0; s.gpGT += s.gpEst; }
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
function purchasesIn(from, to) { let own = 0, qc = 0; D.purchases.forEach((p) => { const d = (p.time || "").slice(0, 10); if (p.supplier !== "Hangyo" || d < from || d > to) return; if (/QC/i.test(p.pool || "")) qc += p.value || 0; else own += p.value || 0; }); return { own, qc, total: own + qc }; }
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
  qcRows.forEach((q) => {
    const pcsPerCrate = (q.upc || 0) * (q.ppe || 0) || q.ppc || 0;
    let open = 0; D.qcPOs.forEach((p) => { if (p.status !== "Open" || p.expiry.slice(0, 10) < today) return; (qcLinesByPO[p.po] || []).forEach((l) => { if (l.sap === q.sap && l.status === "Open") open += l.pcs; }); });
    q.openPcs = open; q.openCrates = pcsPerCrate ? xr(open / pcsPerCrate, 2) : 0;
    q.onOrder = D.hpoLog.filter((l) => l.sap === q.sap && /QC/i.test(l.pool) && (l.status === "Open" || l.status === "Part received")).reduce((a, l) => a + Math.max(0, (l.crates || 0) - (l.upc ? (l.received || 0) / l.upc : 0)), 0);
    q.target = xr(q.perDay * (C.lead + cycle + C.qcSafety) + q.openCrates, 2);
    q.suggested = qcSug(q, q.crates || 0);
    q.final = q.yours != null && q.yours !== "" ? +q.yours : q.suggested; qcPlan += q.final;
    q.daysAfter = q.perDay > 0 ? xr(((q.crates || 0) + q.onOrder - q.openCrates) / q.perDay, 1) : null;
  });
  /* classes, stock, targets */
  rows.forEach((r) => {
    r.share = G10 > 0 ? r.perDay / G10 : 0;
    r._al = G10 > 0 ? rows.reduce((a, x) => a + (x.perDay > r.perDay ? x.perDay : 0), 0) / G10 : 0;
    r.clsData = r._to ? "Same SKU" : r.perDay <= 0 ? "No sales" : r._al < C.heroShare && r.orders >= C.heroMinOrders * orders28 ? "Hero" : r._al < C.coreShare ? "Core" : "Tail";
    r.cls = r._to ? "Same SKU" : r.rule && r.rule !== "Auto" ? r.rule : r.clsData;
    const ownEA = (s) => { const st = stockBySap[s.sap]; return st ? st.ea || 0 : 0; }, ordEA = (s) => D.hpoLog.filter((l) => l.sap === s.sap && /own/i.test(l.pool) && (l.status === "Open" || l.status === "Part received")).reduce((a, l) => a + Math.max(0, (l.boxes || (l.crates || 0) * (l.upc || 0)) - (l.received || 0)), 0);
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
    const qcK = qcTyped ? +D.repl.qcCrates : qcRows.reduce((a, q) => a + (q.yours != null && q.yours !== "" ? +q.yours : qcSug(q, Math.max(0, (q.crates || 0) - q.perDay * k))), 0);
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
  return ME.role === "owner"
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
  if (slow.n) out.push({ ic: "box", cls: "warn", act: "slowList", title: `${slow.n} slow-moving product${slow.n > 1 ? "s" : ""} to push`, sub: `${nf(slow.crates, 0)} crates above normal sales · ₹${lakh(slow.value)} L tied up` });
  const bis = typeof backInStock === "function" ? backInStock() : [];
  if (bis.length) out.push({ ic: "box", cls: "good", act: "backInStock", title: `${bis.length} distributor${bis.length > 1 ? "s" : ""} waiting for stock that is back`, sub: [...new Set(bis.flatMap((g) => g.items.map((i) => shortName(i.name).split("(")[0].trim())))].slice(0, 2).join(", ") + " · tap to let them know" });
  { const pb = pendingBack(); if (pb.length) out.push({ ic: "box", cls: "good", act: "pendingBackSheet", title: `${pb.length} pending order${pb.length > 1 ? "s" : ""} can get products that were out of stock`, sub: pb.slice(0, 2).map((g) => shortOf(g.o.dist)).join(", ") + " · tap to refresh the order" }); }
  const runs = typeof unloggedRuns === "function" ? unloggedRuns() : [];
  if (runs.length) out.push({ ic: "truck", cls: "warn", go: "logistics", title: `${runs.length} dispatch${runs.length > 1 ? "es" : ""} without a trip logged`, sub: runs.slice(0, 2).map((r) => fmtDate(r.date) + ": " + runLabel(r)).join(" · ") + " · add km and cost" });
  const todDue = D.tod.lines.filter((l) => l.status !== "Received").reduce((a, l) => a + (l.amount || 0), 0) || D.tod.total;
  out.push({ ic: "rupee", cls: "info", title: `${rs(todDue)} TOD due from Hangyo`, sub: "Not yet received, all months", go: "tod" });
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
  tiles.push(tile("gp", "Gross profit", lakhS(cur.gp), "L", `${cur.margin != null ? "Margin " + pct(cur.margin, 1) : ""}${showGT && showQC ? ` · GT ₹${lakh(cur.gpGT)} L · QC ₹${lakh(cur.gpQC)} L` : ""}`, chgTxt(cur.gp, prev.gp, cmp)));
  if (showGT) tiles.push(tile("fill", "Fill rate, distributors", cur.fillGT != null ? pct(cur.fillGT, 1) : "–", "", `${cur.fillGT == null ? "Tracked from 8 Oct, when the tool started" : nf(cur.missed, 1) + " crates missed"}${showQC && cur.fillQC != null ? " · QC fill " + pct(cur.fillQC, 1) : ""}`, ""));
  else tiles.push(tile("fill", "Fill rate, quick commerce", cur.fillQC != null ? pct(cur.fillQC, 1) : "–", "", "Pieces accepted of pieces ordered", ""));
  if (showGT) tiles.push(tile("active", "Active distributors", nf(cur.dists.size), "", `${prev.dists.size ? prev.dists.size + " in " + cmp : "With a dispatched order"}`, prev.dists.size || !cmp ? (cur.dists.size >= prev.dists.size ? "▲ " : "▼ ") + Math.abs(cur.dists.size - prev.dists.size) + " vs " + cmp : ""));
  if (showGT && !showQC) tiles.push(tile("o2d", "Order to dispatch", cur.o2dAvg != null ? nf(cur.o2dAvg, 1) : "–", cur.o2dAvg != null ? "days" : "", `${cur.o2d.length} order${cur.o2d.length === 1 ? "" : "s"} dispatched`, ""));
  { const lg = logiForDash(R.from, R.to, F.ch), lp = R.pFrom ? logiForDash(R.pFrom, R.pTo, F.ch) : null; tiles.push(`<button class="tile" data-act="nav" data-to="logistics"><div class="tile-label"><span>Logistics cost</span>${ic("chevR", "sm dim")}</div><div class="tile-value">${lg.pct != null ? pct(lg.pct, 2) : "–"}<small>of sales</small></div>${lp && lp.pct != null && lg.pct != null ? `<span class="delta ${lg.pct > lp.pct ? "down" : "up"}">${lg.pct > lp.pct ? "↑" : "↓"} ${Math.abs((lg.pct - lp.pct) * 100).toFixed(1)} pts vs ${esc(cmp)}</span>` : ""}<div class="tile-sub">${rs(lg.cost)} on ${lg.n} trip${lg.n === 1 ? "" : "s"}${lg.perCrate != null ? " · " + rs2(lg.perCrate) + " per crate" : ""}</div></button>`); }
  tiles.push(tile("stock", "Stock on hand, at cost", lakhS(sv.total), "L", `Own ₹${lakh(sv.own)} L · QC ₹${lakh(sv.qc)} L · today`, ""));
  if (tiles.length < 8) tiles.push(tile("purchases", "Purchases from Hangyo", lakhS(pur.total), "L", `Own ₹${lakh(pur.own)} L · QC ₹${lakh(pur.qc)} L`, ""));
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
      <div class="head-actions"><button class="btn btn-secondary desk-only" data-act="cmd">${ic("search", "sm")} Search <span class="dim" style="font-weight:500">⌘K</span></button><button class="btn btn-primary" data-act="newOrder">${ic("plus", "sm")} New order</button></div></div>
    ${dataUpdateBanner()}
    ${priceNudgeHome()}
    <div><div class="group-label"><span>Needs attention today</span></div><div class="attn">${attention(facts).map((a) => `<button class="attn-card" data-act="${a.act || "nav"}" data-to="${a.go || ""}"><span class="attn-ic ${a.cls}">${ic(a.ic)}</span><span class="grow"><div class="attn-title">${esc(a.title)}</div><div class="attn-sub">${esc(a.sub)}</div></span>${ic("chevR", "sm dim")}</button>`).join("")}</div></div>
    <div class="sec-head"><div><div class="section-title">Sales</div><div class="section-sub">Excluding GST · distributor orders count on their dispatch date (orders not yet dispatched are left out), Swiggy and Zepto on their delivery date</div></div></div>
    ${filterBar(R)}
    <div class="card hero"><div class="hero-left"><div class="tile-label">Net sales · ${esc(R.label)}${filterNote ? " · " + esc(filterNote) : ""}</div><div class="hero-figure">₹${lakh(cur.net)}<small>lakh</small></div>${deltaChip(chgTxt(cur.net, prev.net, cmp))}<div class="tile-sub" style="margin-top:6px">${R.pFrom ? `${esc(cmp.replace(/^the /, "The "))}: ₹${lakh(prev.net)} L` : `Since ${fmtDate(R.from)} ${R.from.slice(0, 4)}`}${pace}</div></div>
      <div class="hero-right">${n > 1 ? `<div class="legend" style="margin:4px 0 6px 34px"><span><i class="kl" style="background:var(--s-gt)"></i>${esc(R.label)}</span>${R.pFrom ? `<span><i class="kl" style="background:var(--s-prev)"></i>${esc(cmp.replace(/^the /, ""))}</span>` : ""}<span class="dim">Cumulative ₹ lakh</span></div>${S.chartMode.line === "table" ? `<div style="overflow:auto;max-height:240px">${lineTable}</div>` : lineChart(lineData)}` : `<div class="legend" style="margin:8px 0 10px">Today so far, by channel</div>${bars(barRows)}`}</div></div>
    <div class="tiles tiles-4">${tiles.join("")}</div>
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
  const months = monthsSeries(facts).map((m) => { const from = m.k + "-01", t = toDate(from), to = ymd(new Date(t.getFullYear(), t.getMonth() + 1, 0)); const s = periodStats(facts, from, to < ymd(NOW()) ? to : ymd(NOW())); s.pur = purchasesIn(from, to).total; s.logi = logiForDash(from, to, S.dash.ch); return { m, s }; });
  const rows = [
    ["Net sales", (s) => rs(s.net)], ["Distributor sales (GT)", (s) => rs(s.gt)], ["Swiggy", (s) => rs(s.swiggy)], ["Zepto", (s) => rs(s.zepto)],
    ["GT orders dispatched", (s) => nf(s.orders.size)], ["Average GT order", (s) => rs(s.avgOrder)], ["Active distributors", (s) => nf(s.dists.size)],
    ["Crates moved", (s) => nf(s.crates, 0)], ["Gross profit", (s) => rs(s.gp)], ["Gross margin", (s) => (s.margin != null ? pct(s.margin, 1) : "–")],
    ["Fill rate, distributors", (s) => (s.fillGT != null ? pct(s.fillGT, 1) : "–")], ["Fill rate, quick commerce", (s) => (s.fillQC != null ? pct(s.fillQC, 1) : "–")],
    ["Logistics cost", (s) => rs(s.logi.cost)], ["Logistics, % of sales carried", (s) => (s.logi.pct != null ? pct(s.logi.pct, 2) : "–")], ["Missed sales (crates)", (s) => nf(s.missed, 1)], ["Returns and credit notes", (s) => rs(s.returns)], ["TOD earned", (s) => rs(s.tod)], ["Purchases from Hangyo", (s) => rs(s.pur)],
  ];
  const table = `<table class="t"><thead><tr><th class="sticky-col">Measure</th>${months.map(({ m }) => `<th class="r">${esc(m.label)}</th>`).join("")}</tr></thead><tbody>${rows.map(([l, f]) => `<tr><td class="sticky-col">${esc(l)}</td>${months.map(({ s }) => `<td class="r">${f(s)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  return `<div class="card"><div class="card-head"><div><div class="card-title">All the numbers, month on month</div><div class="card-sub">${S.dash.ch !== "all" || S.dash.district !== "all" ? "Filtered: " + esc([S.dash.ch !== "all" ? DASH_CHANNELS.find((c) => c[0] === S.dash.ch)[1] : "", S.dash.district !== "all" ? S.dash.district : ""].filter(Boolean).join(" · ")) + " · " : ""}*this month so far</div></div></div><div class="card-pad" style="padding-top:8px"><div style="overflow-x:auto;margin:0 -8px">${table}</div></div></div>`;
}
ACT.nav = (el) => go(el.dataset.to);
ACT.drill = (el) => {
  const k = el.dataset.k, { R, cur, prev } = homeData(), cmp = R.pFrom ? R.cmpLabel : "";
  const tbl = (head, rows) => rows.length ? `<div class="table-wrap"><table class="t"><thead><tr>${head.map((h, i) => `<th class="${i ? "r" : ""}">${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td class="${i ? "r" : ""}">${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : `<div class="group"><div class="empty">Nothing in this period.</div></div>`;
  const gt = cur.facts.filter((f) => f.ch === "gt"), dPrev = groupBy(prev.facts.filter((f) => f.ch === "gt"), (f) => f.dist);
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
    const p = purchasesIn(R.from, R.to); title = "Purchases from Hangyo"; big = `₹${lakh(p.total)}<small>lakh</small>`; sub = `Own ₹${lakh(p.own)} L · QC ₹${lakh(p.qc)} L`;
    const g = {}; D.purchases.forEach((x) => { const d = (x.time || "").slice(0, 10); if (x.supplier !== "Hangyo" || d < R.from || d > R.to) return; const r = (g[x.sap || x.product] = g[x.sap || x.product] || { n: x.product, v: 0, c: 0 }); r.v += x.value || 0; r.c += x.crates || 0; });
    body = tbl(["Product", "Crates", "Value"], Object.values(g).sort((a, b) => b.v - a.v).map((r) => [esc(shortName(r.n)), nf(r.c, 1), rs(r.v)]));
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
  return Object.values(g).filter((x) => Math.abs(x.v) > 0.5).map((x) => ({ ...x, name: nameFn(x.k), m: x.v + x.tod > 0 ? x.gp / (x.v + x.tod) : null, prevGP: gp[x.k] != null ? gp[x.k] : null })).sort((a, b) => b.gp - a.gp);
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
function whyTable(head, rows, foot) {
  return `<div class="table-wrap"><table class="t"><thead><tr>${head.map((h, i) => `<th class="${i ? "r" : ""}">${h}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody>${foot ? `<tfoot><tr>${foot.map((c, i) => `<td class="${i ? "r" : ""}"><b>${c}</b></td>`).join("")}</tr></tfoot>` : ""}</table></div>`;
}
const refLabel = (f) => (f.kind === "order" ? "Order" : f.kind === "vyapar" ? "Invoice" : f.kind === "qc" ? "PO" : f.kind === "return" ? "Return" : "Note");
function whyBack() { return S.seeKind ? `<button class="btn btn-secondary" data-act="seeAll" data-kind="${S.seeKind}">${ic("chevL", "sm")} Back to the list</button>` : ""; }
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
  openSheet(esc(k), `<div class="tiles" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div class="tile"><div class="tile-label">Sales · ${esc(R.label)}</div><div class="tile-value">${rs(sales)}</div><div>${pSales > 0 ? growthChip(sales / pSales - 1) : ""}</div><div class="tile-sub">${R.pFrom ? `${esc(R.cmpLabel)}: ${rs(pSales)}` : ""}</div></div><div class="tile"><div class="tile-label">Gross profit</div><div class="tile-value">${rs(gp)}</div><div class="tile-sub">Margin ${m != null ? pct(m, 1) : "–"}${tod ? ` · TOD ${rs(tod)}` : ""}${isQC ? ` · at ${pct(QC_GP_RATE, 0)}` : ""}</div></div><div class="tile"><div class="tile-label">Crates</div><div class="tile-value">${nf(sum(F, (f) => f.crates), 1)}</div><div class="tile-sub">${refs.length} ${isQC ? "PO" : "order"}${refs.length === 1 ? "" : "s"} or invoices</div></div></div>
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
    <div class="tiles" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div class="tile"><div class="tile-label">Sales · ${esc(R.label)}</div><div class="tile-value">${rs(sales)}</div><div>${pSales > 0 ? growthChip(sales / pSales - 1) : ""}</div><div class="tile-sub">${R.pFrom ? `${esc(R.cmpLabel)}: ${rs(pSales)}` : ""}</div></div><div class="tile"><div class="tile-label">Gross profit</div><div class="tile-value">${rs(gp)}</div><div class="tile-sub">Margin ${m != null ? pct(m, 1) : "–"}${tod ? ` · TOD ${rs(tod)}` : ""}</div></div><div class="tile"><div class="tile-label">Crates sold</div><div class="tile-value">${nf(crates, 1)}</div><div class="tile-sub">${st && st.upc ? `${nf(st.ea / st.upc, 1)} in stock${dl != null ? " · " + nf(dl, 0) + " days" : ""}` : "Not stocked"}</div></div></div>
    <div><div class="group-label"><span>Who bought it</span><span>tap a distributor</span></div>${whyTable(["Distributor", "Crates", "Sales", "Gross profit", "Margin"], ds.map(dRow), ["Total", nf(crates, 1), rs(sales), rs(gp), m != null ? pct(m, 1) : "–"])}</div>
    <div><div class="group-label"><span>Every sale</span><span>${lines.length}</span></div>${whyTable(["Date · who · reference", "Crates", "Sales", "Gross profit"], lines.map(lRow))}</div>`,
    `${whyBack()}${stockBySap[k] || catBySap[k] ? `<button class="btn btn-secondary" data-act="productSheet" data-sap="${esc(k)}">Product details</button>` : ""}<button class="btn btn-primary" data-act="closeSheet">Done</button>`, true);
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
  return groups.map((g) => `<div><div class="group-label"><span>${esc(g.label)}</span><span class="num">${g.items.length} order${g.items.length > 1 ? "s" : ""} · ${rs(g.items.reduce((a, o) => a + (o.status === "Cancelled" ? 0 : o.value), 0))}</span></div><div class="group">${g.items.map((o) => `<button class="row" data-act="orderSheet" data-id="${o.id}"><span class="avatar soft">${esc(initials(o.dist))}</span><span class="grow"><div class="row-title clip">${esc(o.dist)}</div><div class="row-sub clip">${backPill(o) ? backPill(o) + " " : ""}${byDisp ? "Ordered " + fmtDT(o.time) : fmtTime(o.time)}${!byDisp && o.status === "Dispatched" && o.dispatched ? " · dispatched " + fmtDT(o.dispatched) : ""} · ${o.lines} line${o.lines === 1 ? "" : "s"} · ${nf(o.crates)} crates${o.timesEdited ? " · edited" : ""}</div></span><span class="row-end"><span class="c-hide">${statusPill(o.status)}</span><span class="row-value">${rs(o.value)}</span>${ic("chevR", "sm chev")}</span></button>`).join("")}</div></div>`).join("");
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
function showOrder(id, confirmCancel) {
  const o = orderById(id); if (!o) return;
  const lines = linesByOrder[id] || [], missed = D.oos.filter((x) => x.id === id), d = distByKey[key(o.dist)] || {};
  const tl = [`<div class="tl"><span class="tl-dot tint"></span><div><b>Order saved</b><div class="row-sub">${fmtDT(o.time)}</div></div></div>`];
  if (o.edited) tl.push(`<div class="tl"><span class="tl-dot warn"></span><div><b>Edited${o.timesEdited > 1 ? " " + o.timesEdited + " times" : ""}</b><div class="row-sub">Last change ${fmtDT(o.edited)}</div></div></div>`);
  if (o.status === "Dispatched") tl.push(`<div class="tl"><span class="tl-dot good"></span><div><b>Dispatched</b><div class="row-sub">${fmtDT(o.dispatched)}</div></div></div>`);
  if (o.status === "Cancelled") tl.push(`<div class="tl"><span class="tl-dot bad"></span><div><b>Cancelled</b><div class="row-sub">Stock went back on the shelf</div></div></div>`);
  if (o.status === "Pending") tl.push(`<div class="tl"><span class="tl-dot"></span><div class="muted">Waiting for dispatch</div></div>`);
  const body = `
    ${backBanner(o)}
    <div class="card card-pad"><div class="hstack gap-12" style="align-items:flex-start"><span class="avatar lg soft">${esc(initials(o.dist))}</span><div class="grow"><div class="section-title" style="font-size:19px">${esc(o.dist)}</div><div class="row-sub">${esc(d.district || "")}${d.pay ? " · " + esc(d.pay) : ""}${d.credit != null ? " · " + d.credit + " days credit" : ""}</div><div style="margin-top:8px" class="hstack gap-8 wrap">${statusPill(o.status)}<span class="mono dim">${esc(o.id)}</span></div></div></div>
      <div class="divider" style="margin:16px 0"></div>
      <div class="kv"><div><div class="k">Ordered</div><div class="v">${fmtDT(o.time)}</div></div><div><div class="k">Dispatched</div><div class="v">${o.status === "Dispatched" && o.dispatched ? fmtDT(o.dispatched) : o.status === "Cancelled" ? "Cancelled" : "Not yet"}</div></div><div><div class="k">Crates</div><div class="v num">${nf(o.crates)}</div></div><div><div class="k">Value excl. GST</div><div class="v num">${rs2(o.value)}</div></div><div><div class="k">GST 5%</div><div class="v num">${rs2(o.value * 0.05)}</div></div><div><div class="k">Total incl. GST</div><div class="v num">${rs2(o.value * 1.05)}</div></div>${o.tod ? `<div><div class="k">TOD to claim</div><div class="v num">${rs2(o.tod)}</div></div>` : ""}</div></div>
    ${confirmCancel ? `<div class="confirm"><span><b>Cancel this order?</b> ${nf(o.crates)} crates go back into stock. This cannot be undone.</span><span class="hstack gap-8"><button class="btn btn-sm btn-secondary" data-act="orderSheet" data-id="${id}">Keep order</button><button class="btn btn-sm btn-danger" data-act="cancelOrderYes" data-id="${id}">Cancel order</button></span></div>` : ""}
    ${o.notes ? `<div class="banner info">${ic("info", "sm")}<span>${esc(o.notes)}</span></div>` : ""}
    <div><div class="group-label"><span>Timeline</span></div><div class="card card-pad"><div class="timeline">${tl.join("")}</div></div></div>
    ${lines.length ? `<div><div class="group-label"><span>${lines.length} line${lines.length > 1 ? "s" : ""}</span><span>${nf(lines.reduce((a, l) => a + (l.crates || 0), 0))} crates</span></div><div class="group">${lines.map((l) => `<div class="row"><span class="grow"><div class="row-title clip">${esc(shortName(l.product))}</div><div class="row-sub">${nf(l.crates, 2)} crate${l.crates === 1 ? "" : "s"} · ${nf(l.ea)} boxes × ${rs2(l.billed)}${l.tod ? ` · TOD ${rs2(l.tod)}` : ""}</div></span><span class="row-end"><span class="row-value">${rs2(l.value)}</span></span></div>`).join("")}</div></div>` : ""}
    ${missed.length ? `<div><div class="group-label"><span>Not supplied in full</span></div><div class="group">${missed.map((m) => `<div class="row"><span class="attn-ic warn" style="width:28px;height:28px">${ic("alert", "sm")}</span><span class="grow"><div class="row-title clip">${esc(shortName(m.product))}</div><div class="row-sub">${esc(m.reason)}</div></span>${typeof m.missed === "number" ? `<span class="row-end"><span class="pill warn plain">${m.missed} missed</span></span>` : ""}</div>`).join("")}</div></div>` : ""}`;
  const foot = `<button class="btn btn-secondary" data-act="soPreview" data-id="${id}">${ic("doc", "sm")} Sales order</button>${o.status !== "Cancelled" && lines.length ? `<button class="btn btn-secondary" data-act="${o.status === "Dispatched" ? "emailDispatch" : "emailSO"}" data-id="${id}">${ic("arrowR", "sm")} ${o.status === "Dispatched" ? "Email: on its way" : "Email sales order"}</button>` : ""}${o.status === "Pending" ? `<button class="btn btn-danger" data-act="cancelOrderAsk" data-id="${id}">Cancel order</button><button class="btn btn-primary" data-act="editOrder" data-id="${id}">${ic("pencil", "sm")} Edit order</button>` : ""}`;
  openSheet("Order", body, lines.length || o.status === "Pending" ? foot : "");
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

/* ---- sales order preview ---- */
function fitPaper() { const sc = $("#sheet .paper-scroll"), p = sc && $(".paper", sc); if (!p) return; p.style.zoom = ""; const w = sc.clientWidth; if (w && w < 620) p.style.zoom = (w / 620).toFixed(3); }
ACT.soPreview = (el) => {
  const o = orderById(el.dataset.id), lines = linesByOrder[o.id] || [], d = distByKey[key(o.dist)] || {};
  const due = d.credit != null ? new Date(toDate(o.time).getTime() + d.credit * 864e5) : null;
  const paper = `<div class="paper-scroll"><div class="paper paper-min">
    <div style="display:flex;justify-content:space-between;gap:20px;align-items:flex-start"><div style="display:flex;gap:12px;align-items:center"><img src="${LOGO}" alt="SahiReach logo" style="width:54px;height:54px;object-fit:contain"><div><div style="font-size:19px;font-weight:700;letter-spacing:-0.02em">${esc(CO.name)}</div><div style="color:#6e6e73">${esc(CO.address)}<br>GSTIN ${esc(CO.gstin)} · FSSAI ${esc(CO.fssai)}</div></div></div>
      <div style="text-align:right"><h2>SALES ORDER</h2><div class="mono">${esc(o.id.replace("ORD", "SO"))}</div><div>Order date ${fmtDate(o.time)} ${toDate(o.time).getFullYear()}</div>${o.status === "Dispatched" && o.dispatched ? `<div>Dispatched ${fmtDate(o.dispatched)} ${toDate(o.dispatched).getFullYear()}</div>` : ""}</div></div>
    <div style="display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:18px;margin-top:22px"><div><div class="lab">Bill to</div><b>${esc(o.dist)}</b><br>${esc(d.district || "")}, Kerala${d.phone ? "<br>Phone " + esc(d.phone) : ""}</div><div><div class="lab">Payment</div>${esc(d.pay || "–")}<br>${d.credit != null ? d.credit + " days credit" : ""}${due ? "<br>Due " + fmtDate(due) : ""}</div><div><div class="lab">Dispatch from</div>Tropicana Logistics cold store<br>${nf(o.crates)} crates · ${esc((vehicleFor(o.crates) || "").split(" (")[0])}</div></div>
    <table><thead><tr><th>#</th><th>Product</th><th>HSN</th><th class="r">Crates</th><th class="r">Boxes</th><th class="r">Rate / box</th><th class="r">Amount</th></tr></thead><tbody>${lines.map((l, i) => `<tr><td>${i + 1}</td><td>${esc(l.product)}</td><td>${esc((stockBySap[l.sap] || {}).hsn || "21050000")}</td><td class="r">${nf(l.crates, 2)}</td><td class="r">${nf(l.ea)}</td><td class="r">${inr2.format(l.billed || 0)}</td><td class="r">${inr2.format(l.value || 0)}</td></tr>`).join("")}</tbody></table>
    <div class="tot"><div><span>Value excl. GST</span><span class="r">${inr2.format(o.value)}</span></div><div><span>GST @ 5%</span><span class="r">${inr2.format(o.value * 0.05)}</span></div><div class="g"><span>Total (₹)</span><span class="r">${inr2.format(o.value * 1.05)}</span></div></div>
    <div style="margin-top:26px;color:#6e6e73;font-size:11px">This is a sales order, not a tax invoice. Prices are the South Kerala distributor rate, excluding GST.</div></div></div>`;
  openSheet("Sales order", `${backBanner(o)}<div class="banner tint">${ic("info", "sm")}<span><b>Draft layout.</b> In the real build every saved order produces this as a PDF you can download or share. I will match it to your own sales order format once you send it.</span></div>${paper}`, `<button class="btn btn-secondary" data-act="orderSheet" data-id="${o.id}">${ic("chevL", "sm")} Back to order</button>`, true);
  fitPaper();
};

/* ---- new / edit order ---- */
ACT.newOrder = () => { if (S.draft.editId) S.draft = newDraft(); closeSheet(); go("new-order"); };
function searchProducts(q, limit = 30) {
  const words = key(q).split(" ").filter(Boolean);
  const list = D.catalog.filter((c) => c.sap && words.every((w) => key(c.name).includes(w))).map((c) => { const st = stockBySap[c.sap]; return { c, st, crates: st && st.upc ? st.ea / st.upc : null }; });
  list.sort((a, b) => (b.crates > 0) - (a.crates > 0) || (b.crates != null) - (a.crates != null) || (b.crates || 0) - (a.crates || 0) || a.c.name.localeCompare(b.c.name));
  return list.slice(0, limit);
}
function calcDraft() {
  const dr = S.draft, d = dr.dist ? distByKey[key(dr.dist)] : null, used = {}, oldEA = {};
  if (dr.editId) (dr.orig || []).forEach((l) => { oldEA[l.sap] = (oldEA[l.sap] || 0) + (l.ea || 0); });
  const rows = dr.lines.map((ln) => {
    const st = stockBySap[ln.sap], c = catBySap[ln.sap] || {}, upc = st ? st.upc : null, ppe = (st && st.ppe) || c.ppe || 1, stocked = !!(st && upc > 0), qty = +ln.qty || 0;
    const exact = !stocked ? null : ln.unit === "Crate" ? qty : ln.unit === "EA (Box)" ? qty / upc : qty / (upc * ppe);
    const req = stocked ? Math.ceil(Math.round(exact * 1e6) / 1e6) : null;
    const avail = stocked ? Math.max(0, (st.ea + (oldEA[ln.sap] || 0)) / upc - (used[ln.sap] || 0)) : 0;
    const supply = stocked ? Math.max(0, Math.min(req, avail)) : 0;
    if (stocked) used[ln.sap] = (used[ln.sap] || 0) + supply;
    const ea = supply * (upc || 0), normal = price(ln.sap), base = normal != null ? normal : ln.manual > 0 ? +ln.manual : null;
    const special = d && d.special && D.special.prices[ln.sap] != null ? D.special.prices[ln.sap] : null;
    const billed = special != null ? special : base, value = billed != null ? Math.round(ea * billed * 100) / 100 : null;
    const todEA = special != null && base != null ? Math.max(0, Math.round((base - special) * 100) / 100) : 0;
    const status = !qty ? "empty" : !stocked ? "notstocked" : avail <= 0 ? "out" : avail < req ? "short" : "ok";
    return { ln, st, c, upc, ppe, stocked, qty, req, avail, supply, ea, pcs: ea * ppe, normal, special, billed, value, todEA, tod: Math.round(ea * todEA * 100) / 100, status, needPrice: billed == null && qty > 0 && stocked && avail > 0 };
  });
  const sum = (f) => rows.reduce((a, r) => a + (f(r) || 0), 0);
  const net = Math.round(sum((r) => r.value) * 100) / 100;
  return { rows, d, crates: sum((r) => r.supply), req: sum((r) => r.req), net, gst: Math.round(net * 5) / 100, tod: sum((r) => r.tod), ea: sum((r) => r.ea), needPrice: rows.filter((r) => r.needPrice).length, short: rows.filter((r) => ["short", "out", "notstocked"].includes(r.status)).length };
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
  return `<div class="results" role="listbox">${list.map((x, i) => `<button class="res" role="option" aria-selected="${i === S.draft.sel}" data-act="addLine" data-sap="${x.c.sap}"><span class="stock-badge ${x.crates == null ? "none" : x.crates <= 0 ? "zero" : ""}">${x.crates == null ? "–" : nf(Math.floor(x.crates))}</span><span class="grow"><div class="row-title">${esc(x.c.name)}</div><div class="row-sub">${esc(x.c.cat || "")} · ${x.crates == null ? "not stocked, logged as demand" : x.crates <= 0 ? "out of stock" : "crates in stock"}${price(x.c.sap) != null ? " · " + rs2(price(x.c.sap)) + " / box" : " · no list price"}</div></span>${ic("plus", "sm dim")}</button>`).join("")}</div><div class="row-sub" style="padding:6px 4px 0">↑ ↓ to choose · Enter to add · the cursor stays here for the next product</div>`;
}
function lineCalcHtml(r, i) {
  let msg = "";
  if (r.status === "notstocked") msg = `<div class="line-msg warn">${ic("info", "sm")} Not in your range: logged as demand, nothing supplied.</div>`;
  else if (r.status === "out") msg = `<div class="line-msg bad">${ic("alert", "sm")} Out of stock: ${r.req} crate${r.req > 1 ? "s" : ""} logged as missed.</div>`;
  else if (r.status === "short") msg = `<div class="line-msg warn">${ic("alert", "sm")} Only ${nf(r.avail, 2)} crate${r.avail === 1 ? "" : "s"} in stock: ${nf(r.req - r.avail, 2)} logged as missed.</div>`;
  if (r.needPrice) msg += `<div class="line-msg bad">${ic("tag", "sm")} No price in the South Kerala list. Price per box: <input class="input sm num-in" style="width:110px" id="mp-${i}" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00" value="${r.ln.manual || ""}" data-in="manualPrice" data-i="${i}"></div>`;
  return `<div class="line-val"><div class="row-value">${r.value != null && r.qty && r.supply > 0 ? rs2(r.value) : "–"}</div><div class="row-sub nowrap">${r.stocked && r.qty ? `${nf(r.supply, 2)} cr · ${nf(r.ea)} bx` : ""}</div></div>${msg}`;
}
function linesHtml(C) {
  if (!C.rows.length) return `<div class="empty"><div class="big">No products yet</div>Search above to add the first one. Products in stock come first.</div>`;
  return C.rows.map((r, i) => `<div class="line ${S.draft.flash === i ? "flash" : ""}" id="line-${i}"><span class="line-no">${i + 1}</span>
    <div class="line-name"><span class="line-title">${esc(r.c.name || r.ln.name)}</span>${r.special != null ? ` <span class="pill plain tint" style="height:20px;font-size:11.5px">special</span>` : ""}</div>
    <button class="info-btn" data-act="lineInfo" data-i="${i}" data-info="${i}" aria-label="Stock and price details for ${esc(r.c.name || r.ln.name)}">i</button>
    <div class="line-qty"><div class="stepper sm"><button data-act="step" data-i="${i}" data-d="-1" aria-label="Less">${ic("minus", "sm")}</button><input id="qty-${i}" type="number" inputmode="numeric" min="0" value="${r.ln.qty}" data-in="qty" data-i="${i}" aria-label="Quantity"><button data-act="step" data-i="${i}" data-d="1" aria-label="More">${ic("plus", "sm")}</button></div>
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
    ${ssRate(r.ln.sap) != null && r.billed != null && CAN_PRICE ? row("Margin", `${rs2(r.billed - ssRate(r.ln.sap))} / box`) : ""}
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
        ${d ? `<div><div class="group-label"><span>2 · What are they ordering</span>${last && !dr.lines.length ? `<button class="btn-plain" style="height:auto;font-size:13px;font-weight:600" data-act="repeatLast" data-id="${last.id}">${ic("repeat", "sm")} Repeat order of ${fmtDate(last.time)}</button>` : ""}</div>
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
  (linesByOrder[o.id] || []).forEach((l) => { out.push({ sap: l.sap, name: l.product, qty: l.qty, unit: l.unit || d.uom || "Crate", manual: /manual/i.test(l.src || "") ? l.billed : 0 }); seen.add(l.sap); });
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
      lines.push({ id: o.id, product: r.c.name, sap: r.ln.sap, unit: r.ln.unit, qty: r.qty, crates: r.supply, ea: r.ea, pcs: r.pcs, src: r.special != null ? "Special price" : r.normal != null ? "SK Master" : "Manual", normal: r.normal, billed: r.billed, value: r.value, tod: r.tod });
      r.st.ea -= r.ea; r.st.crates = r.st.ea / r.upc; r.st.pcs = r.st.ea * r.ppe; r.st.move = `${o.id} (${C.d.name}): -${nf(r.supply, 2)} crates`;
      if (r.tod > 0) D.tod.lines.push({ time: iso(now), id: o.id, month: "", dist: C.d.name, product: r.c.name, sap: r.ln.sap, crates: r.supply, ea: r.ea, normal: r.normal, special: r.special, perEA: r.todEA, amount: r.tod, status: "Expected", received: null });
    }
    if (r.status !== "ok") D.oos.push({ time: iso(now), id: o.id, dist: C.d.name, product: r.c.name, sap: r.ln.sap, askQty: r.qty, askUnit: r.ln.unit, req: r.req == null ? "N/A" : r.req, avail: r.stocked ? r.avail : "N/A", missed: r.stocked ? r.req - r.supply : "N/A", value: r.stocked && r.billed != null ? (r.req - r.supply) * r.upc * r.billed : "N/A", reason: r.status === "notstocked" ? `Not in current range - requested ${r.qty} ${r.ln.unit}` : r.status === "out" ? "Fully out of stock" : `Partial - ${nf(r.req - r.supply, 2)} of ${r.req} crates short` });
  });
  linesByOrder[o.id] = lines;
  Object.assign(o, { lines: lines.length, crates: C.crates, value: C.net, valueGst: C.net + C.gst, tod: C.tod });
  logActivity(dr.editId ? "Order edited" : "Order saved", o.id, `${C.d.name}: ${lines.length} lines, ${nf(C.crates, 2)} crates, ${rs(C.net)}`);
  const wasEdit = !!dr.editId; S.draft = newDraft(); S.ordersTab = "Pending"; S.picked[o.id] = true;
  go("orders");
  openSheet(wasEdit ? "Order updated" : "Order saved", `<div class="success"><div class="tick">${ic("check")}</div><div class="section-title">${wasEdit ? "Order updated" : "Order saved"}</div><div class="muted">${esc(o.dist)} · ${nf(o.crates, 2)} crates · ${rs2(o.valueGst)} incl. GST</div><div class="mono dim">${esc(o.id)}</div>${C.short ? `<div class="banner warn" style="margin-top:10px;text-align:left">${ic("alert", "sm")}<span>${C.short} line${C.short > 1 ? "s were" : " was"} short or not stocked. Logged under missed sales.</span></div>` : ""}</div>
    <div class="group"><button class="row" data-act="emailSO" data-id="${o.id}"><span class="attn-ic tint">${ic("arrowR")}</span><span class="grow"><div class="row-title">Email the sales order</div><div class="row-sub">${(distByKey[key(o.dist)] || {}).email ? "To " + esc((distByKey[key(o.dist)] || {}).email) : "No email saved for this distributor yet"}</div></span>${ic("chevR", "sm chev")}</button><button class="row" data-act="soPreview" data-id="${o.id}"><span class="attn-ic tint">${ic("doc")}</span><span class="grow"><div class="row-title">View the sales order</div><div class="row-sub">With your logo and company details</div></span>${ic("chevR", "sm chev")}</button><button class="row" data-act="nav2" data-to="dispatch"><span class="attn-ic info">${ic("truck")}</span><span class="grow"><div class="row-title">Go to dispatch</div><div class="row-sub">Add it to the next pick list</div></span>${ic("chevR", "sm chev")}</button><button class="row" data-act="newOrder"><span class="attn-ic tint">${ic("plus")}</span><span class="grow"><div class="row-title">Take another order</div></span>${ic("chevR", "sm chev")}</button></div>`);
};
ACT.nav2 = (el) => { closeSheet(); go(el.dataset.to); };

/* ===== READ AN ORDER FROM A MESSAGE, AN EXCEL FILE OR A PHOTO =====
   1. Read: the matcher on this device (smart reading with Claude is built but switched off: IMP_SMART).
   2. Check (first confirmation): what was understood, what was not, stock, and in-stock alternatives.
   3. The lines go into the normal New order screen, where Save order is the second confirmation.
   Corrections are remembered, so the same wording matches straight away next time. */

/* ---------- words ---------- */
const IMP_SIZES = new Set([20, 30, 35, 40, 50, 55, 60, 65, 70, 80, 100, 110, 125, 170, 500, 700, 1000, 1500, 2000, 4000]);
const IMP_FIX = { vanila: "vanilla", vannila: "vanilla", vanill: "vanilla", venilla: "vanilla", choclate: "chocolate", chocklate: "chocolate", chocolat: "chocolate", chocolates: "chocolate", choc: "chocolate", strawbery: "strawberry", srawberry: "strawberry", straw: "strawberry", stawberry: "strawberry", creame: "cream", creem: "cream", cones: "cone", cups: "cup", bars: "bar", candies: "candy", kulfis: "kulfi", koolfi: "kulfi", kulfee: "kulfi", sticks: "stick", tubs: "tub", balls: "ball", sandwiches: "sandwich", sundae: "sundae", pista: "pista", pistachio: "pista", alphonsa: "alphonso", alphanso: "alphonso", almd: "almond", tofee: "toffee", toffe: "toffee", current: "currant", blackcurrent: "blackcurrant", bscotch: "butterscotch", btrscotch: "butterscotch", ripple: "ripple", fills: "fills", fill: "fills", googli: "googly", gugly: "googly", rasmalai: "rasmalai", dryfruit: "dryfruits", dryfruits: "dryfruits", fruits: "fruit", ltr: "l", ltrs: "l", litre: "l", litres: "l", liter: "l", liters: "l", lit: "l", lt: "l" };
const IMP_JOIN = [[/\bbutter\s+scotch\b/g, "butterscotch"], [/\bsip\s*-?\s*up\b/g, "sipup"], [/\bchoco\s*-?\s*bar\b/g, "chocobar"], [/\bblack\s+curr[ae]nt\b/g, "blackcurrant"], [/\bdry\s+fruits?\b/g, "dryfruits"], [/\bras\s+malai\b/g, "rasmalai"], [/\bpop\s*-?\s*up\b/g, "popup"], [/\bgud\s*-?\s*bud\b/g, "gudbud"], [/\bfun\s+bites?\b/g, "funbites"], [/\bice\s*cream\b/g, " "]];
const IMP_STOP = new Set(["x", "ml", "the", "and", "of", "with", "new", "mrp", "np", "fd", "pre", "nos", "no", "pcs", "pc", "order", "primary", "flavour", "flavor", "pack", "packs", "box", "boxes", "crate", "crates", "crt", "ctn", "qty", "piece", "pieces", "ea", "oval", "ovel", "p", "sm", "lit", "a", "in"]);
const IMP_GENERIC = new Set(["cone", "cup", "bar", "stick", "mini", "big", "small", "tub", "candy", "kulfi", "judwa", "bulk", "parlour", "premium", "gourmet", "slice", "ball", "dolly", "sipup", "sandwich", "catering", "paper"]);
const IMP_CAT = { "Sticks": ["bar", "stick"], "Big Cups": ["cup"], "Small Cups": ["cup", "small"], "Big Cones": ["cone", "big"], "Mini Cones": ["cone", "mini"], "Kulfis": ["kulfi"], "Candies": ["candy"], "Judwa": ["judwa"], "Tubs 100 ml": ["cup"], "Tubs 125 ml": ["tub", "cup"], "Tubs 500 ml": ["tub"], "Tubs 1000 ml": ["tub"], "Tubs 1500 ml": ["tub"], "Paper Packs 1000 ml": ["brick"], "Paper Packs 2000 ml": ["brick"], "Bulk Packs 4000 ml": ["bulk"], "Parlour Paper Packs 4000 ml": ["parlour", "bulk"], "Parlour Tubs 4000 ml": ["parlour", "tub"], "Sip Up": ["sipup"], "Dolly": ["dolly", "bar"], "Ball": ["ball"], "Sandwich": ["sandwich"], "Cassatta": ["cassata", "slice"], "Premium Product (Tourist Spot)": ["premium"], "Gourmet Series": ["gourmet"] };
const IMP_CAT_GROUP = (cat) => { const c = String(cat || ""); return /cone/i.test(c) ? "cone" : /cup|tubs 1(00|25) ml/i.test(c) ? "cup" : /tubs|paper packs (1000|2000)/i.test(c) ? "tub" : /4000/.test(c) ? "bulk" : /sticks|dolly|candies|sip up/i.test(c) ? "stick" : c.toLowerCase(); };
function impNorm(s) {
  let t = " " + String(s || "").toLowerCase().replace(/&/g, " and ").replace(/f\.\s*d\.?/g, " fd ").replace(/\bpre\.\s*/g, " premium ").replace(/\bnew\s*mrp\b|\bnp\b\s*-?/g, " ") + " ";
  t = t.replace(/(\d)\s*[x×*]\s*(\d)/g, "$1 x $2").replace(/(\d+)\s*x\s*(?=\d+(?:\.\d+)?\s*(?:ml|l|ltrs?|litres?|liters?|lit)\b)/g, (m, n) => (+n > 1 ? ` c${+n} ` : " "));
  t = t.replace(/(\d+(?:\.\d+)?)\s*(ml|ltrs?|litres?|liters?|lit\.?|lt|l)\b/g, (m, n, u) => ` s${Math.round(+n * (u[0] === "m" ? 1 : 1000))} `);
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
  if (/^[sc]\d/.test(r) || /^[sc]\d/.test(p)) return 0;
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
    return { sap: c.sap, c, name, cat, all: [...all], sizes: name.filter((t) => /^s\d/.test(t)), counts: name.filter((t) => /^c\d/.test(t)), stocked: !!st, crates: st && st.upc ? st.ea / st.upc : null, hasPrice: price(c.sap) != null, premium: /premium/i.test(c.name) || /premium/i.test(c.cat || ""), fd: /f\.?\s*d\b|catering/i.test(c.name), same: same[c.sap] || null };
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
  const rSizes = R.filter((t) => /^s\d/.test(t)), wantPrem = R.includes("premium"), wantFd = R.includes("fd") || R.includes("catering");
  const w = (t) => (/^[sc]\d/.test(t) ? 0.4 : IMP_GENERIC.has(t) ? 0.6 : 1), W = R.reduce((a, t) => a + w(t), 0);
  const res = impIndex().map((P) => {
    let cov = 0, missing = 0; const used = new Set();
    R.forEach((r) => {
      let best = 0, hit = null;
      if (/^s\d/.test(r)) { if (P.sizes.includes(r)) { best = 1; hit = r; } }
      else if (/^c\d/.test(r)) { if (P.counts.includes(r)) { best = 1; hit = r; } }
      else P.all.forEach((p) => { const s = impSim(r, p) * (P.cat.includes(p) && !P.name.includes(p) ? 0.9 : 1); if (s > best) { best = s; hit = p; } });
      if (hit) used.add(hit); cov += w(r) * best;
      if (!/^[sc]\d/.test(r) && !IMP_GENERIC.has(r) && best < 0.7) missing++;
    });
    let s = cov / W - 0.25 * missing;
    const extra = P.name.filter((t) => !/^[sc]\d/.test(t) && !IMP_GENERIC.has(t) && !used.has(t) && ![...used].some((u) => u.includes(t))).length;
    s -= 0.05 * Math.min(extra, 4);
    if (rSizes.length && P.sizes.length && !rSizes.some((z) => P.sizes.includes(z))) s -= 0.1;
    if (P.premium && !wantPrem) s -= 0.25;
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
  if (m && !(IMP_SIZES.has(+m[1]) && +m[1] > 60 && !m[2])) return { name: m[3].trim(), qty: +m[1], unit: IMP_UNIT(m[2]) };
  return { name: s, qty: null, unit: null };
}
function impFromText(text) {
  const lines = String(text || "").replace(/\r/g, "").split("\n").map((l) => l.replace(/^[\s•*\-–—>]+|^\d+[.)]\s+/g, "").replace(/\s+$/, "")), out = [];
  let head = null;
  lines.forEach((l, i) => {
    if (!l.trim()) { head = null; return; }
    const q = impQty(l);
    if (q.qty == null) {
      /* a line without a number is a heading (e.g. "Sipup" before its flavours) when the next line has a number */
      const nx = lines.slice(i + 1).find((x) => x.trim()); head = nx && impQty(nx).qty != null ? q.name : null;
      out.push({ raw: l.trim(), name: q.name, qty: null, unit: null, head: true }); return;
    }
    out.push({ raw: l.trim(), name: q.name, qty: q.qty, unit: q.unit, ctx: head });
  });
  return out;
}
function impFromRows(rows) {
  rows = rows.map((r) => (r || []).map((v) => (v == null ? "" : String(v).trim())));
  let hr = -1, nameCol = -1;
  for (let i = 0; i < Math.min(rows.length, 20) && hr < 0; i++) rows[i].forEach((v, j) => { if (hr < 0 && /^(product( name)?|products|items?( name)?|item description|particulars|description|sku( name)?|product description|flavou?rs?|name of (the )?(item|product))$/i.test(v.replace(/\s+/g, " ").trim())) { hr = i; nameCol = j; } });
  if (hr < 0) return { lines: impFromText(rows.map((r) => r.filter(Boolean).join(" ")).join("\n")), header: false };
  const H = rows[hr].map((h) => h.replace(/\s+/g, " ").trim()), cand = [];
  H.forEach((h, j) => {
    if (j === nameCol || !h || /units?\s*\/\s*crates?|per crate|\bupc\b|\bmrp\b|\brate\b|\bprice\b|\bamount\b|\bvalue\b|\btotal\b|\btype\b|categ|^sl\b|^s\.? ?no\b|\bcode\b|\bhsn\b|\bgst\b|\bstock\b/i.test(h)) return;
    const p = /order crate|crate number|crates? ordered/i.test(h) ? 5 : /^(crt|crts|crates?|ctns?|cases?)$/i.test(h) ? 4 : /qty|quantity|order/i.test(h) ? 3 : /box|pcs|pieces|nos|units?$/i.test(h) ? 2 : 0;
    if (p) cand.push({ j, p, unit: /crt|crate|ctn|case/i.test(h) ? "Crate" : /box/i.test(h) ? "EA (Box)" : /pcs|piece|nos|units?$/i.test(h) ? "Pieces" : null });
  });
  cand.sort((a, b) => b.p - a.p);
  const out = []; let skipped = 0;
  rows.slice(hr + 1).forEach((r) => {
    const nm = r[nameCol] || ""; if (!nm || /^total\b/i.test(nm)) return;
    let got = null;
    for (const c of cand) { const v = r[c.j]; if (v === "" || v == null) continue; const m = String(v).match(new RegExp(`^(\\d+(?:\\.\\d+)?)\\s*(${IMP_UNIT_RE})?\\.?$`, "i")); if (m && +m[1] > 0) { got = { qty: +m[1], unit: IMP_UNIT(m[2]) || c.unit }; break; } }
    if (!got) { skipped++; return; }
    out.push({ raw: `${nm} — ${got.qty}${got.unit ? " " + UNIT_LABEL[got.unit].toLowerCase() : ""}`, name: nm, qty: got.qty, unit: got.unit });
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
    const sc = hit(toks) ? toks.length + 1 : hit(sh) ? sh.length : toks.length >= 2 && toks.filter((w) => T.has(w)).length >= 2 ? 1 : 0;
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
function impAvail(sap) { const st = stockBySap[sap]; return st && st.upc ? Math.max(0, st.ea / st.upc) : null; }
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
      let c = impMatch(x.name, ctx);
      if (x.ctx) { const c2 = impMatch(x.ctx + " " + x.name, ctx); if (c2.length && (!c.length || (c2[0].score >= 0.75 && c2[0].score >= c[0].score - 0.12))) c = c2; }
      const conf = impConf(c);
      lines.push({ raw: x.raw, sap: conf === "none" ? null : c[0].sap, cands: c.slice(0, 6).map((m) => m.sap), qty: x.qty, unit: x.unit || defUnit, conf, note: "", leave: false });
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
      <div class="hstack gap-12 wrap" style="margin-top:14px;align-items:center"><span class="row-sub">or</span><label class="btn btn-secondary" for="imp-file" style="cursor:pointer">${ic("doc", "sm")} Choose a file</label><input id="imp-file" type="file" accept=".xlsx,.xls,.csv,.txt${smartOn ? ",image/*" : ""}" hidden data-in="impFile"><span class="row-sub" id="imp-fname">${S.impIn.file ? esc(S.impIn.file.name) : smartOn ? "Excel, CSV, text or a photo of the order" : "Excel, CSV or text"}</span></div>
      <div class="row-sub" style="margin-top:12px">${smartOn ? `${ic("bolt", "sm")} Claude reads the order and finds the closest products. You check everything before anything is saved.` : `The tool finds the closest products from the names, sizes and what each distributor bought before. You check everything before anything is saved.`}</div></div>
      <div id="imp-wait"></div>`,
    `<button class="btn btn-secondary" data-act="closeSheet">Cancel</button><button class="btn btn-primary" data-act="impRead">Read order</button>`);
  setTimeout(() => { const t = $("#imp-text"); if (t && !S.impIn.text) t.focus(); }, 60);
};
IN.impFile = (el) => { const f = el.files && el.files[0]; S.impIn.file = f || null; const n = $("#imp-fname"); if (n) n.textContent = f ? f.name : ""; };
async function impFileInput(f) {
  const name = f.name || "";
  if (/^image\//.test(f.type)) {
    const img = await new Promise((ok, bad) => { const u = URL.createObjectURL(f), i = new Image(); i.onload = () => { URL.revokeObjectURL(u); ok(i); }; i.onerror = () => bad(new Error("That photo could not be opened.")); i.src = u; });
    const k = Math.min(1, 1800 / Math.max(img.width, img.height)), cv = document.createElement("canvas"); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
    cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
    return { image: { media_type: "image/jpeg", data: cv.toDataURL("image/jpeg", 0.85).split(",")[1] }, filename: name };
  }
  if (/\.(xlsx|xls|csv)$/i.test(name)) {
    await loadScriptOnce(XLSX_SRC, () => !!window.XLSX);
    const wb = window.XLSX.read(await f.arrayBuffer(), { type: "array" }), rows = [];
    wb.SheetNames.slice(0, 3).forEach((sn) => { window.XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, raw: false, blankrows: false }).forEach((r) => rows.push(r)); });
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
    if (f && text.trim()) input.text = text + "\n" + (input.text || "");
    const parsed = input.rows ? impFromRows(input.rows) : input.text ? { lines: impFromText(input.text) } : { lines: [] };
    const hintSrc = [input.filename || "", (input.text || "").split("\n").slice(0, 3).join(" "), input.rows ? input.rows.slice(0, 6).map((r) => r.join(" ")).join(" ") : ""].join(" ");
    let dist = S.draft.dist && !S.draft.editId ? S.draft.dist : impFindDist(hintSrc), smart = null, why = "";
    try { smart = await impSmart(input, dist); } catch (e) { if (e && e.code === "not_configured") S.smartMissing = true; else why = e && e.message ? e.message : "error"; }
    if (input.image && !smart) throw new Error(why || "Photos need smart reading with Claude. Paste the text or upload the Excel instead.");
    if (smart && smart.distributor && !dist) { const m = D.distributors.find((d) => key(d.name) === key(smart.distributor)); if (m) dist = m.name; }
    S.imp = impBuild(parsed, dist, smart); S.imp.src = input.image ? "photo" : input.rows ? "excel" : "message"; S.imp.file = input.filename || "";
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
    <div class="row-sub" style="margin-top:10px">${I.smart ? `${ic("bolt", "sm")} Read by Claude` : "Read"} from ${I.src === "excel" ? "the Excel file" : I.src === "photo" ? "the photo" : "the message"}${I.file ? ` (${esc(I.file)})` : ""}. ${I.skipped ? `${I.skipped} rows with no quantity were skipped. ` : ""}Nothing is saved until you press Save order on the next screen.</div></div>
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
IN.impQ = (el) => { const q = el.value; part("imp-res", q.length < 2 ? "" : `<div class="results" style="position:static;margin-top:6px">${searchProducts(q, 8).map((x) => `<button class="res" data-act="impSet" data-i="${el.dataset.i}" data-sap="${x.c.sap}"><span class="stock-badge ${x.crates == null ? "none" : x.crates <= 0 ? "zero" : ""}">${x.crates == null ? "–" : nf(Math.floor(x.crates))}</span><span class="grow"><div class="row-title">${esc(x.c.name)}</div><div class="row-sub">${esc(x.c.cat || "")}</div></span></button>`).join("") || `<div class="empty" style="padding:16px">Nothing matches.</div>`}</div>`); };
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
  I.lines.forEach((l) => { if (l.sap && !l.leave && (l.picked || l.conf !== "sure" || I.smart)) { const k = impAliasKey(l.raw.replace(/\s—\s[\d.]+.*$/, "")); if (k) D.orderAliases[k] = l.swappedFrom || l.sap; } });
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
  return `<div class="banner info" style="align-items:flex-start">${ic("doc", "sm")}<span class="grow"><b>Read from ${n.src === "excel" ? "an Excel file" : n.src === "photo" ? "a photo" : "a message"}${n.smart ? " by Claude" : ""}: ${n.n} product${n.n > 1 ? "s" : ""}.</b>${n.swapped.length ? ` Swapped: ${esc(n.swapped.join(", "))}.` : ""}${n.left.length ? ` <b>Left out (${n.left.length}):</b> ${esc(n.left.join(", "))}.` : ""} Check the lines and press <b>Save order</b>.</span><button class="icon-btn" data-act="impNoteClose" aria-label="Hide">${ic("x", "sm")}</button></div>`;
}
ACT.importOrderGo = () => { if (S.draft.editId) S.draft = newDraft(); go("new-order"); ACT.importOrder(); };
ACT.impNoteClose = () => { S.draft.importNote = null; render(); };

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
        <div class="group">${pend.map((o) => `<div class="row tap" role="checkbox" tabindex="0" aria-checked="${!!S.picked[o.id]}" data-act="togglePick" data-id="${o.id}" style="cursor:pointer"><span class="check" aria-checked="${!!S.picked[o.id]}">${ic("check")}</span><span class="grow"><div class="row-title clip">${esc(o.dist)}</div><div class="row-sub">${backPill(o) ? backPill(o) + " " : ""}${dayLabel(o.time)}, ${fmtTime(o.time)} · ${o.lines} lines${o.timesEdited ? " · edited" : ""}</div></span><span class="row-end"><span><div class="row-value">${nf(o.crates, 2)} crates</div><div class="row-sub num">${rs(o.value)}</div></span><button class="icon-btn" data-act="orderSheet" data-id="${o.id}" aria-label="Open order">${ic("chevR", "sm")}</button></span></div>`).join("")}</div></div>
      <div class="sticky"><div class="card card-pad"><div class="card-title">This truck</div>
        <div class="tile-value" style="margin-top:8px">${nf(crates, 2)}<small>crates</small></div><div class="row-sub">${sel.length} of ${pend.length} orders · ${rs(sel.reduce((a, o) => a + o.value, 0))}</div>
        ${veh ? `<div class="vehicle">${ic("truck")}<span><b>${esc(veh.split(" (")[0])}</b><div class="row-sub">${veh.includes("(") ? esc(veh.split("(")[1].replace(")", "")) : "Suggested vehicle"}</div></span></div>` : ""}
        <div class="stack gap-8" style="margin-top:16px"><button class="btn btn-primary btn-lg btn-block" data-act="makePick" ${sel.length ? "" : "disabled"}>${ic("doc", "sm")} Create pick list</button><button class="btn btn-secondary btn-block" data-act="dispatchAsk" ${sel.length ? "" : "disabled"}>${ic("truck", "sm")} Mark dispatched</button></div>
        <div id="dispatch-confirm"></div></div></div></div>`
      : `<div class="group"><div class="empty"><div class="big">All clear</div>Nothing is waiting to go out. Saved orders appear here straight away.<div style="margin-top:14px"><button class="btn btn-primary" data-act="newOrder">${ic("plus", "sm")} New order</button></div></div></div>`}
    <div><div class="group-label"><span>Recently dispatched</span></div><div class="group">${recent.map((o) => `<button class="row" data-act="orderSheet" data-id="${o.id}"><span class="attn-ic tint" style="width:30px;height:30px">${ic("check", "sm")}</span><span class="grow"><div class="row-title clip">${esc(o.dist)}</div><div class="row-sub">Left ${fmtDT(o.dispatched)}</div></span><span class="row-end"><span class="row-value">${nf(o.crates)} crates</span>${ic("chevR", "sm chev")}</span></button>`).join("")}</div></div></div>`;
};
ACT.togglePick = (el, e) => { if (e.target.closest('[data-act="orderSheet"]')) return; S.picked[el.dataset.id] = !S.picked[el.dataset.id]; render(); };
ACT.pickAll = () => { const pend = pendingOrders(), all = pickedOrders().length === pend.length; pend.forEach((o) => { S.picked[o.id] = !all; }); render(); };
function buildPick() {
  const orders = pickedOrders().sort((a, b) => (a.time > b.time ? 1 : -1)), prod = {};
  orders.forEach((o, ci) => (linesByOrder[o.id] || []).forEach((l) => { if (!(l.crates > 0)) return; const p = (prod[l.sap] = prod[l.sap] || { name: l.product, sap: l.sap, cells: {}, total: 0 }); p.cells[ci] = (p.cells[ci] || 0) + l.crates; p.total += l.crates; }));
  const rows = Object.values(prod).sort((a, b) => a.name.localeCompare(b.name));
  return { orders, rows, total: rows.reduce((a, r) => a + r.total, 0), made: NOW() };
}
const tropCode = (sap) => (stockBySap[sap] || {}).trop || "";
function pickTable(P, editing) {
  return `<div class="table-wrap"><table class="t matrix"><thead><tr><th class="sticky-col">Product</th>${P.orders.map((o) => `<th class="vert">${esc(shortOf(o.dist))}<span class="dim" style="font-weight:500"> · ${fmtDate(o.time)}</span></th>`).join("")}<th class="r">Total</th></tr></thead><tbody>
    ${P.rows.map((r) => `<tr><td class="sticky-col"><div class="clip" style="max-width:240px">${esc(shortName(r.name))}</div><div class="row-sub">${esc(tropCode(r.sap))}</div></td>${P.orders.map((o, ci) => editing && r.cells[ci] ? `<td class="r edit-cell"><input class="pick-in" type="number" inputmode="decimal" min="0" step="1" value="${+r.cells[ci].toFixed(2)}" data-in="pickCell" data-sap="${esc(r.sap)}" data-ci="${ci}" data-was="${r.cells[ci]}" aria-label="${esc(shortName(r.name))}, ${esc(shortOf(o.dist))}"></td>` : `<td class="r">${r.cells[ci] ? nf(r.cells[ci], 2) : `<span class="dim">·</span>`}</td>`).join("")}<td class="r"><b>${nf(r.total, 2)}</b></td></tr>`).join("")}
    <tr class="total"><td class="sticky-col">Total crates</td>${P.orders.map((o) => `<td class="r">${nf(o.crates, 2)}</td>`).join("")}<td class="r">${nf(P.total, 2)}</td></tr></tbody></table></div>`;
}
function showPick(editing) {
  const P = S.pickList; if (!P) return;
  S.pickEdit = !!editing;
  const head = `<div class="card card-pad"><div class="kv"><div><div class="k">Orders</div><div class="v">${P.orders.length}</div></div><div><div class="k">Products</div><div class="v">${P.rows.length}</div></div><div><div class="k">Crates</div><div class="v num">${nf(P.total, 2)}</div></div><div><div class="k">Vehicle</div><div class="v">${esc((vehicleFor(P.total) || "–").split(" (")[0])}</div></div></div></div>`;
  const note = editing ? `<div class="banner warn">${ic("pencil", "sm")}<span><b>Change the crates Tropicana should pick.</b> Saving updates those orders, their values and stock. Set a cell to 0 to take that product off the order. To add a new product, edit the order itself.</span></div>` : `<div class="row-sub">Products down the side, distributors across, the way Tropicana picks today.</div>`;
  const foot = editing
    ? `<button class="btn btn-secondary" data-act="pickEditCancel">Cancel</button><button class="btn btn-primary" data-act="pickEditSave">${ic("check", "sm")} Save changes</button>`
    : `<button class="btn btn-secondary" data-act="pickEdit">${ic("pencil", "sm")} Edit</button><button class="btn btn-secondary" data-act="pickExcel">${ic("doc", "sm")} Excel</button><button class="btn btn-secondary" data-act="emailPick">${ic("arrowR", "sm")} Email</button><button class="btn btn-secondary" data-act="copyPick">${ic("copy", "sm")} WhatsApp</button><button class="btn btn-primary" data-act="dispatchNow">${ic("truck", "sm")} Mark dispatched</button>`;
  openSheet(editing ? "Edit pick list" : "Pick list for Tropicana", head + (editing ? note : "") + pickTable(P, editing) + (editing ? "" : note), foot, true);
}
ACT.makePick = () => {
  const P = buildPick(); if (!P.orders.length) return;
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
function downloadXlsx(el, aoa, cols, file, sheet, merges) { return downloadBook(el, [{ name: sheet, aoa, cols, merges }], file); }
/* several sheets in one workbook; the first sheet opens first */
async function downloadBook(el, sheets, file) {
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
  const stampTxt = stampOf(P.made || NOW()), names = P.orders.map((o) => shortOf(o.dist));
  const aoa = [
    ["PICK LIST FOR TROPICANA LOGISTICS, WILLINGDON ISLAND  (SahiReach LLP)"],
    ["Orders in this pick list", `${P.orders.length} order(s): ${P.orders.map((o) => o.id).join(", ")}   |   generated ${stampTxt}`],
    ["Dispatch date", `${pad2((P.made || NOW()).getDate())}-${pad2((P.made || NOW()).getMonth() + 1)}-${(P.made || NOW()).getFullYear()}`],
    [],
    ["Tropicana Code", "SKU"].concat(names, ["TOTAL CRATES"]),
    ["", "Order date/time"].concat(P.orders.map((o) => { const d = toDate(o.time); return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }), [""]),
  ];
  P.rows.forEach((r) => aoa.push([tropCode(r.sap), r.name].concat(P.orders.map((o, ci) => (r.cells[ci] ? +r.cells[ci].toFixed(2) : null)), [+r.total.toFixed(2)])));
  aoa.push(["", "TOTAL CRATES"].concat(P.orders.map((o) => +o.crates.toFixed(2)), [+P.total.toFixed(2)]));
  if (!(opt && opt.noVehicle)) { aoa.push([]); aoa.push(["Vehicle", (vehicleFor(P.total) || "").replace(/\s*\(.*\)/, "")]); }
  return { rows: aoa, cols: [14, 46].concat(names.map((n) => Math.max(9, Math.min(22, n.length + 2))), [14]), stampTxt, names };
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
  const txt = `SahiReach pick list (${fmtDT(NOW())})\n${P.orders.length} orders, ${nf(P.total, 2)} crates\n\n` + P.orders.map((o, ci) => `*${shortOf(o.dist)}* (${nf(o.crates, 2)} crates)\n` + P.rows.filter((r) => r.cells[ci]).map((r) => `  ${nf(r.cells[ci], 2)} x ${shortName(r.name)}`).join("\n")).join("\n\n");
  copyText(txt, "Pick list copied. Paste it into WhatsApp");
};
ACT.dispatchAsk = () => { const sel = pickedOrders(); part("dispatch-confirm", `<div class="confirm" style="margin-top:12px;background:var(--tint-soft);color:var(--tint)"><span><b>Has the truck left?</b> ${sel.length} order${sel.length > 1 ? "s" : ""} will be locked.</span><span class="hstack gap-8"><button class="btn btn-sm btn-secondary" data-act="dispatchNo">Not yet</button><button class="btn btn-sm btn-primary" data-act="dispatchNow">Yes, dispatched</button></span></div>`); };
ACT.dispatchNo = () => part("dispatch-confirm", "");
ACT.dispatchNow = () => {
  const sel = pickedOrders(), now = iso(NOW()); if (!sel.length) return;
  sel.forEach((o) => { o.status = "Dispatched"; o.dispatched = now; delete S.picked[o.id]; });
  logActivity("Orders dispatched", `${sel.length} order(s)`, sel.map((o) => shortOf(o.dist)).join(", "));
  closeSheet(); render(); toast(`${sel.length} order${sel.length > 1 ? "s" : ""} marked dispatched`, "truck");
  setTimeout(() => openSheet("Let them know?", `<div class="success"><div class="tick">${ic("truck")}</div><div class="section-title">${sel.length} order${sel.length > 1 ? "s" : ""} on the way</div><div class="muted">Send each distributor a short “your order is on its way” email with the crates and the payment due date.</div></div><div class="group">${sel.map((o) => { const d = distByKey[key(o.dist)] || {}; return `<div class="row"><span class="grow"><div class="row-title">${esc(o.dist)}</div><div class="row-sub">${d.email ? esc(d.email) : `<span style="color:var(--warn)">No email saved</span>`}</div></span><span class="row-end">${nf(o.crates, 2)} crates</span></div>`; }).join("")}</div>`, `<button class="btn btn-secondary" data-act="closeSheet">Not now</button><button class="btn btn-secondary" data-act="tripForm" data-orders="${sel.map((o) => o.id).join(",")}">${ic("truck", "sm")} Log the trip</button><button class="btn btn-primary" data-act="emailDispatch" data-ids="${sel.map((o) => o.id).join(",")}">${ic("arrowR", "sm")} Preview and send</button>`), 450);
};

/* ===== QUICK COMMERCE ===== */
const PLAT_COLOR = { Swiggy: "--s-swiggy", Zepto: "--s-zepto" };
const platDot = (p) => `<i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(${PLAT_COLOR[p] || "--ink-3"});margin-right:6px"></i>`;
function daysLeft(p) { const e = toDate(p.expiry), n = NOW(); return Math.round((new Date(e.getFullYear(), e.getMonth(), e.getDate()) - new Date(n.getFullYear(), n.getMonth(), n.getDate())) / 864e5); }
function expiryPill(p) { const d = daysLeft(p); return d < 0 ? `<span class="pill bad">Expired ${fmtDate(p.expiry)}</span>` : d === 0 ? `<span class="pill bad">Expires today</span>` : d <= 3 ? `<span class="pill warn">${d} day${d > 1 ? "s" : ""} left</span>` : `<span class="pill plain">${d} days left</span>`; }
function qcDelivery() {
  const pos = openQC().filter((p) => p.platform === S.qcPlatform && S.qcPicked[p.po] && daysLeft(p) >= 0), agg = {};
  pos.forEach((p) => (qcLinesByPO[p.po] || []).forEach((l) => { const k = l.sap || l.product, a = (agg[k] = agg[k] || { sap: l.sap, name: l.product, pcs: 0, value: 0, ppc: l.ppc }); a.pcs += l.pcs; a.value += l.value; }));
  const rows = Object.values(agg).map((a) => {
    const qc = qcBySap[a.sap] || {}, own = stockBySap[a.sap] || {}, ppc = a.ppc || qc.ppc || 1;
    const full = Math.floor(a.pcs / ppc), qcCr = Math.max(0, Math.floor(qc.crates || 0)), ownCr = own.upc ? Math.max(0, Math.floor(own.ea / own.upc)) : 0;
    let fromQC = Math.min(full, qcCr), fromOwn = S.qcOwn ? Math.min(full - fromQC, ownCr) : 0;
    const ov = (S.qcOverride[S.qcPlatform] || {})[a.sap], edited = !!ov;
    if (ov) { fromQC = Math.max(0, Math.min(ov.q, qcCr)); fromOwn = Math.max(0, Math.min(ov.o, ownCr)); }
    const send = fromQC + fromOwn, sendPcs = Math.min(a.pcs, send * ppc);
    return { ...a, ppc, full, qcCr, ownCr, fromQC, fromOwn, send, edited, sendPcs, notSent: a.pcs - sendPcs, extra: Math.max(0, send * ppc - a.pcs), sendValue: a.pcs ? (a.value / a.pcs) * sendPcs : 0 };
  }).sort((a, b) => a.name.localeCompare(b.name));
  return { pos, rows, crates: rows.reduce((a, r) => a + r.send, 0), value: rows.reduce((a, r) => a + r.sendValue, 0), min: S.qcPlatform === "Swiggy" ? D.qcPick.minSwiggy : D.qcPick.minZepto };
}
function qcOpenHtml() {
  const list = openQC().filter((p) => p.platform === S.qcPlatform).sort((a, b) => (a.expiry > b.expiry ? 1 : -1)), Dl = qcDelivery();
  const ok = Dl.value >= Dl.min, prog = Dl.min ? Math.min(100, (Dl.value / Dl.min) * 100) : 100;
  if (!list.length) return `<div class="group"><div class="empty"><div class="big">No open ${esc(S.qcPlatform)} POs</div>Add a PO when it arrives and it will show here until it is delivered or lapses.</div></div>`;
  return `<div class="split s320">
    <div class="stack gap-20"><div><div class="group-label"><span>Open POs, soonest expiry first</span></div><div class="group">${list.map((p) => { const exp = daysLeft(p) < 0; return `<div class="row tap" ${exp ? "" : `role="checkbox" tabindex="0" aria-checked="${!!S.qcPicked[p.po]}" data-act="toggleQC" data-po="${p.po}" style="cursor:pointer"`}><span class="check" aria-checked="${!exp && !!S.qcPicked[p.po]}" ${exp ? 'style="opacity:.3"' : ""}>${ic("check")}</span><span class="grow"><div class="row-title mono" style="font-size:14.5px">${esc(p.po)}</div><div class="row-sub">${p.lines} lines · ${nf(p.pcs)} pieces · PO of ${fmtDate(p.date)}${p.edited ? " · edited" : ""}</div></span><span class="row-end"><span style="text-align:right"><div class="row-value">${rs(p.value)}</div><div style="margin-top:3px">${expiryPill(p)}</div></span><button class="icon-btn" data-act="qcPOSheet" data-po="${p.po}" aria-label="Open PO">${ic("chevR", "sm")}</button></span></div>`; }).join("")}</div></div>
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
  return `<div class="dg" style="--cols:minmax(0,1.3fr) 110px 100px 100px 110px minmax(90px,140px);--cols-sm:minmax(0,1fr) auto"><div class="dg-row dg-head"><span>PO</span><span class="c-hide">Status</span><span class="r c-hide">Ordered</span><span class="r c-hide">Accepted</span><span class="r">Value accepted</span><span class="c-hide">Fill rate</span></div>${list.map((p) => `<button class="dg-row" data-act="qcPOSheet" data-po="${p.po}"><span><div class="strong mono">${platDot(p.platform)}${esc(p.po)}</div><div class="row-sub">${esc(p.platform)} · ${p.deliveredOn ? "delivered " + fmtDate(p.deliveredOn) : p.status === "Cancelled" ? "cancelled " + fmtDate(p.cancelledOn || p.expiry) : "expired " + fmtDate(p.expiry)}</div></span><span class="c-hide">${statusPill(p.status)}</span><span class="r c-hide">${nf(p.pcs)}</span><span class="r c-hide">${nf(p.pcsAccepted)}</span><span class="r strong">${rs(p.valueAccepted)}</span><span class="bar-cell c-hide"><div class="meter ${p.fill < 0.6 ? "bad" : p.fill < 0.85 ? "warn" : ""}"><i style="width:${(p.fill || 0) * 100}%"></i></div><span class="num" style="font-size:13px;min-width:34px;text-align:right">${pct(p.fill || 0, 0)}</span></span></button>`).join("")}</div>`;
}
function qcGrnHtml() {
  const list = D.qcPOs.filter((p) => p.status === "Delivered").sort((a, b) => (a.deliveredOn < b.deliveredOn ? 1 : -1)).slice(0, 8);
  return `<div class="banner info">${ic("info", "sm")}<span>After a delivery, record what the platform accepted at GRN. Good pieces that came back go into QC stock; damaged pieces are written off.</span></div><div><div class="group-label"><span>Latest deliveries</span></div><div class="group">${list.map((p) => `<button class="row" data-act="grnSheet" data-po="${p.po}"><span class="grow"><div class="row-title mono" style="font-size:14.5px">${platDot(p.platform)}${esc(p.po)}</div><div class="row-sub">Delivered ${fmtDate(p.deliveredOn)} · ${nf(p.pcsDelivered)} pieces sent · ${nf(p.pcsAccepted)} accepted</div></span><span class="row-end">${p.pcsAccepted < p.pcsDelivered ? `<span class="pill warn">${nf(p.pcsDelivered - p.pcsAccepted)} short</span>` : `<span class="pill good">In full</span>`}${ic("chevR", "sm chev")}</span></button>`).join("")}</div></div>`;
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
      ${editing ? `<td class="r edit-cell"><input class="pick-in" type="number" inputmode="numeric" min="0" max="${r.qcCr}" step="1" value="${r.fromQC}" data-sap="${esc(r.sap)}" data-k="q" data-in="pickCell" data-was="${r.fromQC}" aria-label="${esc(shortName(r.name))} from QC stock"><div class="row-sub">of ${r.qcCr}</div></td><td class="r edit-cell"><input class="pick-in" type="number" inputmode="numeric" min="0" max="${r.ownCr}" step="1" value="${r.fromOwn}" data-sap="${esc(r.sap)}" data-k="o" data-in="pickCell" data-was="${r.fromOwn}" aria-label="${esc(shortName(r.name))} from own stock"><div class="row-sub">of ${r.ownCr}</div></td>`
        : `<td class="r">${r.fromQC || `<span class="dim">–</span>`}</td><td class="r">${r.fromOwn || `<span class="dim">–</span>`}</td>`}
      <td class="r"><b>${r.send}</b></td></tr>`).join("")}
    <tr class="total"><td class="sticky-col">Total</td><td class="r">${nf(Dl.rows.reduce((a, r) => a + r.pcs, 0))}</td><td></td><td class="r">${Dl.rows.reduce((a, r) => a + r.fromQC, 0)}</td><td class="r">${Dl.rows.reduce((a, r) => a + r.fromOwn, 0)}</td><td class="r">${Dl.crates}</td></tr></tbody></table></div>`;
}
function showQCPick(editing) {
  const Dl = qcDelivery(); if (!Dl.rows.length) { toast("Tick at least one open PO first", "info"); return; }
  const to = S.qcPlatform === "Swiggy" ? D.qcPick.swiggyTo : D.qcPick.zeptoTo, ok = !Dl.min || Dl.value >= Dl.min;
  const head = `<div class="card card-pad"><div class="kv"><div><div class="k">Platform</div><div class="v">${platDot(S.qcPlatform)}${esc(S.qcPlatform)}</div></div><div><div class="k">POs</div><div class="v">${Dl.pos.length}</div></div><div><div class="k">Crates</div><div class="v num">${nf(Dl.crates)}</div></div><div><div class="k">Value excl. GST</div><div class="v num">${rs(Dl.value)}</div></div></div><div class="row-sub" style="margin-top:12px">Deliver to ${esc(to)} · POs ${Dl.pos.map((p) => esc(p.po)).join(", ")}</div>${Dl.min && !ok ? `<div class="banner warn" style="margin-top:12px">${ic("alert", "sm")}<span>Below the ${rs(Dl.min)} minimum for one delivery by ${rs(Dl.min - Dl.value)}.</span></div>` : ""}</div>`;
  const note = editing ? `<div class="banner warn">${ic("pencil", "sm")}<span><b>Change the crates to send from each stock.</b> You cannot send more than is in stock. Pieces beyond the PO are not billed.</span></div>` : "";
  const foot = editing
    ? `<button class="btn btn-secondary" data-act="qcPickReset">Use the suggested crates</button><button class="btn btn-secondary" data-act="qcPick">Cancel</button><button class="btn btn-primary" data-act="qcPickSave">${ic("check", "sm")} Save changes</button>`
    : `<button class="btn btn-secondary" data-act="qcPickEdit">${ic("pencil", "sm")} Edit</button><button class="btn btn-secondary" data-act="qcPickExcel">${ic("doc", "sm")} Excel</button><button class="btn btn-secondary" data-act="emailQCPick">${ic("arrowR", "sm")} Email</button><button class="btn btn-secondary" data-act="qcPickCopy">${ic("copy", "sm")} WhatsApp</button><button class="btn btn-primary" data-act="qcDeliver" ${Dl.crates ? "" : "disabled"}>${ic("truck", "sm")} Mark delivered</button>`;
  openSheet(editing ? `Edit ${esc(S.qcPlatform)} pick list` : `${esc(S.qcPlatform)} pick list for Tropicana`, head + note + qcPickTable(Dl, editing), foot, true);
}
ACT.qcPick = () => { showQCPick(false); };
ACT.qcPickEdit = () => showQCPick(true);
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
    ["Dispatch date", stampTxt.slice(0, 10)],
    ["Generated", stampTxt],
    [],
    ["Tropicana Code", "Product", "SAP Code", "Pieces Ordered", "Pieces per Crate", "From QC Stock (crates)", "From SahiReach Stock (crates)", "Crates to Send", "Pieces to Send", "Not Sent (pieces)", "Value to Send excl. GST (Rs)"],
  ];
  Dl.rows.forEach((r) => aoa.push([tropCode(r.sap) || (qcBySap[r.sap] || {}).trop || "", r.name, r.sap, r.pcs, r.ppc, r.fromQC, r.fromOwn, r.send, r.sendPcs, r.notSent, Math.round(r.sendValue * 100) / 100]));
  aoa.push(["", "TOTAL", "", Dl.rows.reduce((a, r) => a + r.pcs, 0), "", Dl.rows.reduce((a, r) => a + r.fromQC, 0), Dl.rows.reduce((a, r) => a + r.fromOwn, 0), Dl.crates, Dl.rows.reduce((a, r) => a + r.sendPcs, 0), Dl.rows.reduce((a, r) => a + r.notSent, 0), Math.round(Dl.value * 100) / 100]);
  return { rows: aoa, cols: [16, 44, 11, 10, 10, 14, 16, 10, 10, 10, 16], stampTxt };
}
ACT.qcPickExcel = async (el) => {
  const Dl = qcDelivery(), A = qcPickAoa(Dl);
  if (await downloadXlsx(el, A.rows, A.cols, `SahiReach ${S.qcPlatform} pick list ${A.stampTxt.replace(":", "")}.xlsx`, "QC Pick List", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }])) {
    logActivity("QC pick list downloaded", S.qcPlatform, `${Dl.pos.length} PO(s), ${Dl.crates} crates`); toast("Excel pick list downloaded", "doc");
  }
};
ACT.qcPickCopy = () => {
  const Dl = qcDelivery(), to = S.qcPlatform === "Swiggy" ? D.qcPick.swiggyTo : D.qcPick.zeptoTo;
  const txt = `SahiReach ${S.qcPlatform} pick list (${fmtDT(NOW())})\nDeliver to: ${to}\nPOs: ${Dl.pos.map((p) => p.po).join(", ")}\n${Dl.crates} crates\n\n` + Dl.rows.filter((r) => r.send).map((r) => `  ${r.send} x ${shortName(r.name)}${tropCode(r.sap) ? " (" + tropCode(r.sap) + ")" : ""}${r.fromOwn ? `  [${r.fromOwn} from own stock]` : ""}`).join("\n");
  copyText(txt, "Pick list copied. Paste it into WhatsApp");
};
ACT.qcDeliverAsk = () => { const Dl = qcDelivery(); part("qc-confirm", `<div class="confirm" style="margin-top:12px;background:var(--tint-soft);color:var(--tint)"><span><b>Delivered to ${esc(S.qcPlatform)}?</b> ${nf(Dl.crates)} crates come off stock and ${rs(Dl.value)} counts as sales today.</span><span class="hstack gap-8"><button class="btn btn-sm btn-secondary" data-act="qcDeliverNo">Not yet</button><button class="btn btn-sm btn-primary" data-act="qcDeliver">Yes, delivered</button></span></div>`); };
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
    <div class="row-sub">Anything not accepted and not back in good condition is counted as damaged.</div>`, `<button class="btn btn-primary" data-act="grnSave" data-po="${p.po}">Save GRN</button>`);
};
ACT.grnSave = (el) => {
  const p = D.qcPOs.find((x) => x.po === el.dataset.po), lines = (qcLinesByPO[p.po] || []).filter((l) => (l.delivered || 0) > 0); let acc = 0, back = 0;
  lines.forEach((l, i) => { const a = Math.min(l.delivered, Math.max(0, +$("#grn-a-" + i).value || 0)), b = Math.min(l.delivered - a, Math.max(0, +$("#grn-b-" + i).value || 0)); l.accepted = a; l.short = l.delivered - a; l.valueAccepted = Math.round(a * l.price * 100) / 100; acc += a; back += b; const qc = qcBySap[l.sap]; if (qc && b) { qc.crates += b / (l.ppc || 1); } });
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
  return `<div class="results" role="listbox">${list.map((x, i) => { const pr = qcPlatPrice(x, n.platform), on = n.lines.find((l) => l.sap === x.sap); return `<button class="res" role="option" aria-selected="${i === n.sel}" data-act="qnAdd" data-sap="${x.sap}"><span class="stock-badge ${!(x.crates > 0) ? "zero" : ""}">${nf(Math.floor(x.crates || 0))}</span><span class="grow"><div class="row-title">${esc(x.name)}</div><div class="row-sub">${x.ppc || "–"} pieces / crate · ${pr ? rs2(pr) + " / piece last time" : `no ${esc(n.platform)} price yet`}${qcPlatCode(x, n.platform) ? " · item " + esc(qcPlatCode(x, n.platform)) : ""}${on ? ` · <b>already on this PO</b>` : ""}</div></span>${ic("plus", "sm dim")}</button>`; }).join("")}</div><div class="row-sub" style="padding:6px 4px 0">↑ ↓ to choose · Enter to add · then type the pieces and press Enter for the next product</div>`;
}
const qnVal = (l) => (+l.pcs || 0) * (+l.price || 0);
function qcLinesHtml() {
  const n = qcDraft();
  if (!n.lines.length) return `<div class="empty"><div class="big">No lines yet</div>Search above and add each product on the ${esc(n.platform)} PO.</div>`;
  return n.lines.map((l, i) => { const q = qcBySap[l.sap] || {}, ppc = l.ppc || q.ppc || 0, cr = ppc ? (+l.pcs || 0) / ppc : 0, last = qcPlatPrice(q, n.platform); return `<div class="qline ${n.flash === i ? "flash" : ""}" id="qnl-${i}"><span class="line-no">${i + 1}</span>
    <div class="line-name"><span class="line-title">${esc(l.product)}</span><div class="row-sub" id="qnc-${i}">${ppc ? `${nf(cr, 2)} crate${cr === 1 ? "" : "s"} · ${ppc} pcs / crate` : "pieces per crate not set"} · ${nf(q.crates || 0)} crates in QC stock</div></div>
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

/* ===== STOCK ===== */
const cratesOf = (s) => (s.upc ? s.ea / s.upc : s.crates || 0);
function stockRows() {
  const q = key(S.stockQ), cat = S.stockCat;
  return D.stock.filter((s) => (cat === "All" || (cat === "In stock" ? cratesOf(s) > 0 : cat === "Out of stock" ? cratesOf(s) <= 0 : cat === "Below reorder" ? (replBySap[s.sap] || {}).belowRop : s.cat === cat)) && (!q || q.split(" ").every((w) => key(s.name + " " + s.trop + " " + s.sap).includes(w))));
}
function ownStockGrid() {
  const rows = stockRows().sort((a, b) => cratesOf(b) - cratesOf(a) || a.name.localeCompare(b.name));
  if (!rows.length) return `<div class="group"><div class="empty"><div class="big">Nothing matches</div>Try another name, code or filter.</div></div>`;
  return `<div class="dg" style="--cols:minmax(0,2fr) 90px 80px 80px minmax(110px,150px) 100px;--cols-sm:minmax(0,1fr) auto"><div class="dg-row dg-head"><span>Product</span><span class="c-hide">Class</span><span class="r">Crates</span><span class="r c-hide">Boxes</span><span class="c-hide">Days of stock</span><span class="r c-hide">Price / box</span></div>
  ${rows.map((s) => { const r = replBySap[s.sap] || {}, c = cratesOf(s), days = r.perDay > 0 ? c / r.perDay : null, low = r.belowRop || (days != null && days < 4); return `<button class="dg-row" data-act="productSheet" data-sap="${s.sap}"><span><div class="strong clip">${esc(shortName(s.name))}</div><div class="row-sub clip">${esc(s.trop || "No Tropicana code")} · ${esc(s.cat || "")}</div></span><span class="c-hide">${classPill(r.cls)}</span><span class="r strong" ${c <= 0 ? 'style="color:var(--bad)"' : ""}>${nf(c, 1)}</span><span class="r c-hide">${nf(s.ea)}</span><span class="bar-cell c-hide">${days != null ? `<div class="meter ${low ? "bad" : days < 8 ? "warn" : ""}"><i style="width:${Math.min(100, (days / 30) * 100)}%"></i></div><span class="num" style="font-size:13px;min-width:30px;text-align:right">${days.toFixed(0)}d</span>` : `<span class="dim" style="font-size:13px">no recent sales</span>`}</span><span class="r c-hide">${s.price != null ? rs2(s.price) : "–"}</span></button>`; }).join("")}</div>`;
}
function qcStockGrid() {
  const rows = D.qcStock.slice().sort((a, b) => (b.crates || 0) - (a.crates || 0));
  return `<div class="dg" style="--cols:minmax(0,2fr) 80px 100px 100px 110px 110px;--cols-sm:minmax(0,1fr) auto"><div class="dg-row dg-head"><span>Product</span><span class="r">Crates</span><span class="r c-hide">On open POs</span><span class="r c-hide">Free after POs</span><span class="r c-hide">Swiggy / piece</span><span class="r c-hide">Zepto / piece</span></div>
  ${rows.map((s) => `<div class="dg-row"><span><div class="strong clip">${esc(shortName(s.name))}</div><div class="row-sub clip">${esc(s.trop || "Not on the Tropicana ledger")} · ${s.ppc || "–"} pieces per crate</div></span><span class="r strong" ${!(s.crates > 0) ? 'style="color:var(--bad)"' : ""}>${nf(s.crates, 1)}</span><span class="r c-hide">${s.openCrates ? nf(s.openCrates, 1) : `<span class="dim">–</span>`}</span><span class="r c-hide" ${s.free < 0 ? 'style="color:var(--bad);font-weight:600"' : ""}>${s.free != null ? nf(s.free, 1) : "–"}</span><span class="r c-hide">${s.swPrice ? rs2(s.swPrice) : `<span class="dim">–</span>`}</span><span class="r c-hide">${s.zpPrice ? rs2(s.zpPrice) : `<span class="dim">–</span>`}</span></div>`).join("")}</div>`;
}
function purchasesHtml() {
  const byId = {}; D.purchases.forEach((p) => { const g = (byId[p.id] = byId[p.id] || { id: p.id, inv: p.inv, time: p.time, invDate: p.invDate, supplier: p.supplier, pool: p.pool, lines: [], crates: 0, value: 0 }); g.lines.push(p); g.crates += p.crates || 0; g.value += p.value || 0; });
  const list = Object.values(byId).sort((a, b) => (a.time < b.time ? 1 : -1));
  return `<div class="group">${list.map((g) => `<button class="row" data-act="purchaseSheet" data-id="${g.id}"><span class="attn-ic tint">${ic("box")}</span><span class="grow"><div class="row-title clip">${g.inv ? "Invoice " + esc(g.inv) : esc(g.supplier)}</div><div class="row-sub clip">${fmtDT(g.time)} · ${esc(g.supplier)} · into ${esc(String(g.pool).toLowerCase())} · ${g.lines.length} lines</div></span><span class="row-end"><span style="text-align:right"><div class="row-value">${rs(g.value)}</div><div class="row-sub num">${nf(g.crates, 1)} crates</div></span>${ic("chevR", "sm chev")}</span></button>`).join("")}</div>`;
}
function missedHtml() {
  const real = D.oos.filter((o) => typeof o.missed === "number" && o.missed > 0), agg = {};
  real.forEach((o) => { const a = (agg[o.sap] = agg[o.sap] || { name: o.product, sap: o.sap, crates: 0, value: 0, times: 0 }); a.crates += o.missed; a.value += typeof o.value === "number" ? o.value : 0; a.times++; });
  const top = Object.values(agg).sort((a, b) => b.crates - a.crates).slice(0, 12), max = top.length ? top[0].crates : 1;
  return `<div class="tiles"><div class="tile"><div class="tile-label">Missed crates, since 8 Oct</div><div class="tile-value">${nf(real.reduce((a, o) => a + o.missed, 0), 1)}</div><div class="tile-sub">${real.length} lines could not be filled</div></div><div class="tile"><div class="tile-label">Missed value</div><div class="tile-value">${rs(real.reduce((a, o) => a + (typeof o.value === "number" ? o.value : 0), 0))}</div><div class="tile-sub">At the distributor rate, excl. GST</div></div><div class="tile"><div class="tile-label">Asked for, not in your range</div><div class="tile-value">${D.oos.filter((o) => typeof o.missed !== "number").length}</div><div class="tile-sub">Requests logged as demand only</div></div></div>
  <div class="grid-2"><div><div class="group-label"><span>Ran out most often</span></div><div class="group">${top.map((a) => `<button class="row" data-act="productSheet" data-sap="${a.sap}"><span class="grow"><div class="row-title clip">${esc(shortName(a.name))}</div><div class="bar-cell" style="margin-top:5px"><div class="meter warn"><i style="width:${(a.crates / max) * 100}%"></i></div><span class="row-sub nowrap">${a.times} time${a.times > 1 ? "s" : ""}${a.value ? " · " + rs(a.value) : ""}</span></div></span><span class="row-end"><span class="row-value">${nf(a.crates, 1)} crates</span></span></button>`).join("")}</div></div>
  <div><div class="group-label"><span>Most requested, not stocked</span></div><div class="group">${D.demandTop.map((d) => `<div class="row"><span class="avatar soft">${d.rank}</span><span class="grow"><div class="row-title clip">${esc(shortName(d.product))}</div><div class="row-sub">Worth reviewing with Hangyo</div></span><span class="row-end"><span class="pill plain info">${d.times} request${d.times > 1 ? "s" : ""}</span></span></div>`).join("")}</div></div></div>`;
}
VIEWS.stock = () => {
  const own = D.stock, crates = own.reduce((a, s) => a + cratesOf(s), 0), cost = own.reduce((a, s) => a + (s.ea || 0) * (s.cost || 0), 0), inStock = own.filter((s) => cratesOf(s) > 0).length, low = D.repl.rows.filter((r) => r.belowRop).length;
  const qcCr = D.qcStock.reduce((a, s) => a + (s.crates || 0), 0);
  const cats = ["All", "In stock", "Below reorder", "Out of stock", ...Array.from(new Set(own.map((s) => s.cat).filter(Boolean))).sort()];
  const tab = S.stockTab;
  const body = tab === "own" ? `<div class="hstack gap-12 wrap"><div class="search">${ic("search", "sm")}<input class="input" id="stock-q" type="search" placeholder="Search by name, SAP or Tropicana code" value="${esc(S.stockQ)}" data-in="stockQ" autocomplete="off"></div></div><div class="chips">${cats.map((c) => `<button class="chip" data-act="stockCat" data-cat="${esc(c)}" aria-pressed="${S.stockCat === c}">${esc(c)}</button>`).join("")}</div><div id="stock-grid">${ownStockGrid()}</div>`
    : tab === "qc" ? `<div class="banner info">${ic("info", "sm")}<span>One stock shared by Swiggy and Zepto, in crates. Deliveries take it down, QC purchases add to it.</span></div>${qcStockGrid()}`
    : tab === "damaged" ? `<div class="group"><div class="empty"><div class="big">No damaged stock</div>Returns marked Damaged wait here until you send them back to Hangyo or claim them.</div></div>`
    : tab === "slow" ? slowHtml()
    : tab === "purchases" ? purchasesHtml() : missedHtml();
  return `<div class="page">
    <div class="page-head"><div><h1 class="title">Stock</h1><div class="subtitle">What is in Tropicana right now, what came in, and what you ran out of.</div></div><div class="head-actions"><button class="btn btn-primary" data-act="receiveSheet">${ic("plus", "sm")} Receive stock</button></div></div>
    <div class="tiles"><div class="tile"><div class="tile-label">Own stock</div><div class="tile-value">${nf(crates, 0)}<small>crates</small></div><div class="tile-sub">${inStock} of ${own.length} products in stock</div></div><div class="tile"><div class="tile-label">Own stock at cost</div><div class="tile-value">₹${lakh(cost)}<small>L</small></div><div class="tile-sub">At the super stockist rate</div></div><div class="tile"><div class="tile-label">Quick commerce stock</div><div class="tile-value">${nf(qcCr, 0)}<small>crates</small></div><div class="tile-sub">Shared by Swiggy and Zepto</div></div><button class="tile" data-act="stockLow"><div class="tile-label"><span>Below reorder point</span>${ic("chevR", "sm dim")}</div><div class="tile-value" style="color:var(--bad)">${low}</div><div class="tile-sub">Hero and Core products to reorder</div></button>${(() => { const T = slowSum(slowRows()); return `<button class="tile tile-wide-sm" data-act="slowList"><div class="tile-label"><span>Slow moving</span>${ic("chevR", "sm dim")}</div><div class="tile-value" style="color:var(--warn)">${T.n}</div><div class="tile-sub">₹${lakh(T.value)} L tied up · ${nf(T.crates, 0)} crates to push</div></button>`; })()}</div>
    ${seg("stockTab", tab, [["own", "Own stock"], ["slow", "Slow moving"], ["qc", "Quick commerce"], ["damaged", "Damaged"], ["purchases", "Purchases"], ["missed", "Missed sales"]])}
    ${body}</div>`;
};
IN.stockQ = (el) => { S.stockQ = el.value; part("stock-grid", ownStockGrid()); };
ACT.stockCat = (el) => { S.stockCat = el.dataset.cat; render(); };
ACT.stockLow = () => { S.stockTab = "own"; S.stockCat = "Below reorder"; render(); };
ACT.productSheet = (el) => {
  const sap = el.dataset.sap, s = stockBySap[sap], c = catBySap[sap] || {}, r = replBySap[sap] || {}, name = (s && s.name) || c.name || sap;
  if (!s) { openSheet(esc(shortName(name)), `<div class="card card-pad"><div class="section-title" style="font-size:19px">${esc(name)}</div><div class="row-sub">${esc(c.cat || "")} · SAP ${esc(sap)}</div><div class="banner warn" style="margin-top:14px">${ic("info", "sm")}<span>You do not stock this product. Requests for it are logged as demand.</span></div></div>${price(sap) != null ? `<div class="card card-pad"><div class="kv"><div><div class="k">Distributor rate</div><div class="v num">${rs2(price(sap))}</div></div><div><div class="k">SS rate</div><div class="v num">${rs2(ssRate(sap))}</div></div><div><div class="k">Pack</div><div class="v">${c.upc || "–"} boxes / crate</div></div></div></div>` : ""}`, `<button class="btn btn-secondary" data-act="productEdit" data-sap="${esc(sap)}">${ic("pencil", "sm")} Edit product</button>`); return; }
  const cr = cratesOf(s), recent = D.orders.filter((o) => o.status !== "Cancelled").sort((a, b) => (a.time < b.time ? 1 : -1)).flatMap((o) => (linesByOrder[o.id] || []).filter((l) => l.sap === sap)).slice(0, 6);
  openSheet(esc(shortName(name)), `<div class="card card-pad"><div class="section-title" style="font-size:19px">${esc(s.name)}</div><div class="row-sub">${esc(s.cat || "")}</div><div class="hstack gap-8 wrap" style="margin-top:10px">${classPill(r.cls)}${s.tier ? `<span class="pill plain">${esc(s.tier)}</span>` : ""}<span class="pill plain mono">SAP ${esc(s.sap)}</span>${s.trop ? `<span class="pill plain mono">${esc(s.trop)}</span>` : ""}</div>
      <div class="divider" style="margin:16px 0"></div><div class="kv"><div><div class="k">In stock</div><div class="v num" ${cr <= 0 ? 'style="color:var(--bad)"' : ""}>${nf(cr, 2)} crates</div></div><div><div class="k">Boxes</div><div class="v num">${nf(s.ea)}</div></div><div><div class="k">Pieces</div><div class="v num">${nf(s.ea * (s.ppe || 1))}</div></div><div><div class="k">Pack</div><div class="v">${s.upc} boxes / crate · ${s.ppe} pcs / box</div></div></div></div>
    <div><div class="group-label"><span>Price per box</span></div><div class="card card-pad"><div class="kv"><div><div class="k">MRP</div><div class="v num">${rs2(s.mrp)}</div></div><div><div class="k">Your cost (SS rate)</div><div class="v num">${rs2(s.cost)}</div></div><div><div class="k">Selling price</div><div class="v num">${rs2(s.price)}</div></div><div><div class="k">Margin</div><div class="v num">${rs2(s.margin)}${s.price ? ` <span class="muted" style="font-weight:500">(${pct(s.margin / s.price, 1)})</span>` : ""}</div></div></div></div></div>
    ${r.sap ? `<div><div class="group-label"><span>Replenishment</span></div><div class="card card-pad"><div class="kv"><div><div class="k">Sells per day</div><div class="v num">${nf(r.perDay, 2)} crates</div></div><div><div class="k">Days of stock</div><div class="v num">${r.perDay > 0 ? (cr / r.perDay).toFixed(1) : "–"}</div></div><div><div class="k">Reorder point</div><div class="v num">${nf(r.rop, 1)} crates</div></div><div><div class="k">Target stock</div><div class="v num">${nf(r.target, 1)} crates</div></div><div><div class="k">On order</div><div class="v num">${nf(r.onOrder, 1)} crates</div></div><div><div class="k">Missed, 28 days</div><div class="v num">${nf(r.missed, 1)} crates</div></div></div></div></div>` : ""}
    ${(() => { const w = slowRows().find((x) => x.sap === sap); return w ? `<button class="banner warn" style="text-align:left;width:100%" data-act="slowSheet" data-sap="${esc(sap)}">${ic("info", "sm")}<span><b>Slow moving.</b> ${w.still ? "No sales in the last 4 weeks." : "Stock lasts " + coverTxt(w) + " at the current pace."} Push about ${nf(w.push, 1)} crates. Tap to see who bought it before.</span></button>` : ""; })()}
    ${s.move ? `<div class="banner info">${ic("clock", "sm")}<span><b>Last movement.</b> ${esc(s.move)}</span></div>` : ""}
    ${recent.length ? `<div><div class="group-label"><span>Latest orders with it</span></div><div class="group">${recent.map((l) => { const o = orderById(l.id) || {}; return `<div class="row"><span class="grow"><div class="row-title clip">${esc(o.dist || "")}</div><div class="row-sub">${fmtDate(o.time)}</div></span><span class="row-end"><span class="row-value">${nf(l.crates, 2)} crates</span></span></div>`; }).join("")}</div></div>` : ""}`, `<button class="btn btn-secondary" data-act="productEdit" data-sap="${esc(sap)}">${ic("pencil", "sm")} Edit product and prices</button>`);
};
ACT.purchaseSheet = (el) => {
  const lines = D.purchases.filter((p) => p.id === el.dataset.id), g = lines[0];
  openSheet(g.inv ? "Invoice " + esc(g.inv) : esc(g.supplier), `<div class="card card-pad"><div class="kv"><div><div class="k">Supplier</div><div class="v">${esc(g.supplier)}</div></div><div><div class="k">Invoice date</div><div class="v">${fmtDate(g.invDate)}</div></div><div><div class="k">Added to</div><div class="v">${esc(g.pool)}</div></div><div><div class="k">Value excl. GST</div><div class="v num">${rs2(lines.reduce((a, l) => a + (l.value || 0), 0))}</div></div></div><div class="row-sub mono" style="margin-top:12px">${esc(g.id)} · saved ${fmtDT(g.time)}</div></div>
    <div><div class="group-label"><span>${lines.length} lines</span><span>${nf(lines.reduce((a, l) => a + (l.crates || 0), 0), 1)} crates</span></div><div class="group">${lines.map((l) => `<div class="row"><span class="grow"><div class="row-title clip">${esc(shortName(l.product))}</div><div class="row-sub">${nf(l.crates, 2)} crates · ${nf(l.ea)} boxes × ${rs2(l.rate)}${l.batch ? " · batch " + esc(l.batch) : ""}${l.isNew === "Yes" ? " · new SKU" : ""}</div></span><span class="row-end"><span class="row-value">${rs(l.value)}</span></span></div>`).join("")}</div></div>`);
};
function receiveBody() {
  const R = S.recv, res = R.q && R.q.length > 1 ? searchProducts(R.q, 8).filter((x) => x.st) : [];
  return `<div class="card card-pad"><div class="form-grid"><div class="field"><label class="label" for="rc-inv">Hangyo invoice number</label><input class="input" id="rc-inv" placeholder="SI0018712" value="${esc(R.inv)}" data-in="recvField" data-f="inv"></div><div class="field"><label class="label" for="rc-date">Invoice date</label><input class="input" id="rc-date" type="date" value="${esc(R.date || iso(NOW()).slice(0, 10))}" data-in="recvField" data-f="date"></div><div class="field full"><label class="label">Add stock to</label>${`<div class="seg"><button data-act="recvPool" data-v="Own Stock" aria-pressed="${R.pool === "Own Stock"}">Own stock</button><button data-act="recvPool" data-v="QC Stock" aria-pressed="${R.pool === "QC Stock"}">Quick commerce stock</button></div>`}</div></div></div>
    <div class="recv-up"><span class="attn-ic tint">${ic("doc")}</span><span class="grow"><div class="row-title">Have the invoice as Excel?</div><div class="row-sub">Upload it and every line is added for you to check. Products are matched by SAP code first, then by name.</div></span><label class="btn btn-secondary" for="rc-file" style="cursor:pointer">${ic("doc", "sm")} Upload Excel</label><input id="rc-file" type="file" accept=".xlsx,.xls,.csv" hidden data-in="recvFile"></div>
    <div id="rc-up-msg">${recvUpMsg()}</div>
    <div class="stack gap-10"><div class="search">${ic("search", "sm")}<input class="input" id="rc-q" type="search" placeholder="Add a product from the invoice" value="${esc(R.q)}" data-in="recvQ" autocomplete="off"></div><div id="rc-results">${res.length ? `<div class="results">${res.map((x) => `<button class="res" data-act="recvAdd" data-sap="${x.c.sap}"><span class="grow"><div class="row-title clip">${esc(x.c.name)}</div><div class="row-sub">${nf(x.crates, 1)} crates in stock now</div></span>${ic("plus", "sm dim")}</button>`).join("")}</div>` : ""}</div>
    <div class="group">${R.lines.length ? R.lines.map((l, i) => `<div class="row"><span class="grow"><div class="row-title clip">${esc(shortName(l.name))}</div><div class="row-sub">${l.raw ? `<span class="${l.conf === "check" ? "pill warn" : "dim"}" style="${l.conf === "check" ? "height:20px;font-size:11.5px" : ""}">${l.conf === "check" ? "Check: " : "From the file: "}${esc(l.raw)}</span> · ` : ""}${l.upc} boxes per crate · ${rs2(ssRate(l.sap) || (stockBySap[l.sap] || {}).cost)} per box${l.boxes != null ? ` · ${nf(l.boxes)} boxes` : ""}</div></span><span class="row-end"><input class="input sm num-in" style="width:80px" type="number" min="0" step="any" value="${l.crates}" id="rc-c-${i}" data-in="recvCrates" data-i="${i}" aria-label="Crates"><span class="muted" style="font-size:13px">crates</span><button class="icon-btn" data-act="recvRm" data-i="${i}" aria-label="Remove">${ic("trash", "sm")}</button></span></div>`).join("") : `<div class="empty">Add the products on the invoice. Stock goes up when you save.</div>`}</div></div>`;
}
ACT.receiveSheet = () => { S.recv = { inv: "", pool: "Own Stock", q: "", lines: [], unmatched: [], file: null }; openSheet("Receive stock", receiveBody(), `<button class="btn btn-primary" data-act="recvSave">Save purchase</button>`); };
IN.recvField = (el) => { S.recv[el.dataset.f] = el.value; };
IN.recvQ = (el) => { S.recv.q = el.value; const res = el.value.length > 1 ? searchProducts(el.value, 8).filter((x) => x.st) : []; part("rc-results", res.length ? `<div class="results">${res.map((x) => `<button class="res" data-act="recvAdd" data-sap="${x.c.sap}"><span class="grow"><div class="row-title clip">${esc(x.c.name)}</div><div class="row-sub">${nf(x.crates, 1)} crates in stock now</div></span>${ic("plus", "sm dim")}</button>`).join("")}</div>` : ""); };
IN.recvCrates = (el) => { const l = S.recv.lines[+el.dataset.i]; l.crates = Math.max(0, +el.value || 0); l.boxes = null; };
ACT.recvPool = (el) => { S.recv.pool = el.dataset.v; part("sheet-body", receiveBody()); };
ACT.recvAdd = (el) => { const s = stockBySap[el.dataset.sap]; if (!S.recv.lines.find((l) => l.sap === s.sap)) S.recv.lines.push({ sap: s.sap, name: s.name, upc: s.upc, crates: 1 }); S.recv.q = ""; part("sheet-body", receiveBody()); };
ACT.recvRm = (el) => { S.recv.lines.splice(+el.dataset.i, 1); part("sheet-body", receiveBody()); };
ACT.recvSave = () => {
  const R = S.recv, lines = R.lines.filter((l) => l.crates > 0); if (!lines.length) { toast("Add at least one product", "info"); return; }
  const now = NOW(), id = "PUR-" + stamp(now), invDate = R.date ? R.date + "T00:00" : iso(now);
  lines.forEach((l) => { const s = stockBySap[l.sap], rate = ssRate(l.sap) || s.cost || 0, ea = l.boxes != null ? l.boxes : Math.round(l.crates * l.upc * 100) / 100; if (R.pool === "Own Stock") { s.ea += ea; s.crates = s.ea / s.upc; s.move = `${id}: +${nf(ea)} boxes`; } else if (qcBySap[l.sap]) { qcBySap[l.sap].crates += l.crates; } D.purchases.push({ time: iso(now), id, inv: R.inv, invDate, supplier: "Hangyo", pool: R.pool, product: l.name, sap: l.sap, unit: l.boxes != null ? "EA (Box)" : "Crate", qty: l.boxes != null ? l.boxes : l.crates, ea, crates: l.crates, batch: l.batch || "", rate, value: ea * rate, isNew: "No" }); });
  lines.forEach((l) => { let left = l.crates * l.upc; D.hpoLog.filter((h) => h.sap === l.sap && (R.pool === "Own Stock" ? /own/i.test(h.pool) : /QC/i.test(h.pool)) && (h.status === "Open" || h.status === "Part received")).sort((a, b) => (a.placed > b.placed ? 1 : -1)).forEach((h) => { if (left <= 0) return; const want = Math.max(0, (h.boxes || h.crates * h.upc) - (h.received || 0)), take = Math.min(want, left); h.received = (h.received || 0) + take; left -= take; h.toCome = Math.max(0, h.crates - h.received / (h.upc || 1)); h.status = h.toCome > 1e-9 ? "Part received" : "Received"; h.changed = iso(now); h.receivedOn = iso(now); h.purchases = ((h.purchases ? h.purchases + ", " : "") + id); }); });
  logActivity("Purchase saved", id, `${lines.length} lines into ${R.pool}`); closeSheet(); S.stockTab = "purchases"; render(); toast("Stock received and added"); setTimeout(() => { if (pendingBack().length) ACT.pendingBackSheet({ dataset: { next: 1 } }); else if (backInStock().length) ACT.backInStock(); }, 450);
};

/* ===== REPLENISHMENT ===== */
function replTotals() { const own = D.repl.rows.reduce((a, r) => a + (r.final || 0), 0), qc = D.repl.qcOnTruck || 0; return { own, qc, total: own + qc, value: D.repl.rows.reduce((a, r) => a + (r.final || 0) * (r.upc || 0) * (ssRate(r.sap) || 0), 0) }; }
function truckHtml() {
  const R = D.repl, T = replTotals(), free = R.truck - T.total;
  return `<div class="hstack between wrap gap-12"><div><div class="card-title">This truck</div><div class="row-sub">Hangyo sends a truck from ${R.truck} crates, own stock and quick commerce together</div></div><div class="tile-value">${nf(T.total)}<small>of ${R.truck} crates</small></div></div>
    <div class="truck-bar" style="margin-top:14px"><i class="own" style="width:${(T.own / R.truck) * 100}%"></i><i class="qc" style="width:${(T.qc / R.truck) * 100}%"></i></div>
    <div class="hstack between wrap gap-12" style="margin-top:10px"><div class="legend"><span><i style="background:var(--s-gt)"></i>Own stock ${nf(T.own)}</span><span><i style="background:var(--s-zepto)"></i>Quick commerce ${nf(T.qc)}</span><span>${free >= 0 ? nf(free) + " crates free" : nf(-free) + " over the truck"}</span></div><div class="row-sub num">${rs(T.value)} at the SS rate</div></div>`;
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
  return `<div class="dg" style="--cols:minmax(0,2fr) 84px 76px 70px minmax(100px,130px) 80px 96px 120px;--cols-sm:minmax(0,1fr) 84px"><div class="dg-row dg-head"><span>Product</span><span class="c-hide">Class</span><span class="r c-hide">Sells / day</span><span class="r c-hide">Stock</span><span class="c-hide">Days of stock</span><span class="r c-hide">Suggested</span><span class="r">Your crates</span><span class="r c-hide">Final</span></div>
  ${rows.map((r) => { const open = S.replOpen === r.sap, low = r.belowRop; return `<div class="dg-row" style="cursor:pointer" data-act="replToggle" data-sap="${r.sap}"><span><div class="strong clip">${esc(shortName(r.name))}</div><div class="row-sub clip">${r.runsOut ? `<span style="color:var(--bad);font-weight:600">Runs out ${r.runsOut <= ymd(NOW()) ? "now" : "~" + fmtDate(r.runsOut)}</span>${low ? " · below reorder point" : ""} · ` : ""}${low && !r.runsOut ? `<span style="color:var(--bad);font-weight:600">Below reorder point</span>${r.note && !/^below reorder/i.test(r.note) ? " · " + esc(r.note) : ""}` : r.note ? esc(r.note) : esc(r.cat || "")}</div></span><span class="c-hide">${classPill(r.cls)}</span><span class="r c-hide">${nf(r.perDay, 2)}</span><span class="r c-hide">${nf(r.stock, 1)}</span><span class="bar-cell c-hide">${r.days != null ? `<div class="meter ${low ? "bad" : r.days < 8 ? "warn" : ""}"><i style="width:${Math.min(100, (r.days / 30) * 100)}%"></i></div><span class="num" style="font-size:13px;min-width:30px;text-align:right">${nf(r.days, 0)}d</span>` : `<span class="dim">–</span>`}</span><span class="r c-hide">${nf(r.suggested)}</span><span class="r">${r.same && replBySap[r.same] ? `<span class="pill plain info" title="Counts as ${esc(replBySap[r.same].name)}">Linked</span>` : `<input class="input sm num-in" style="width:76px" type="number" min="0" placeholder="${nf(r.suggested)}" value="${r.yours != null ? r.yours : ""}" id="rp-${r.sap}" data-in="replYours" data-sap="${r.sap}" aria-label="Your crates">`}</span><span class="r strong c-hide" id="rf-${r.sap}">${nf(r.final)}${deltaTag(r)}</span></div>
    ${open ? `<div class="dg-row" style="--cols:1fr;background:var(--surface-2);display:block"><div class="kv"><div><div class="k">Sold, last 14 days</div><div class="v num">${nf(r.s14, 1)} crates</div></div><div><div class="k">Days 15 to 28</div><div class="v num">${nf(r.s28, 1)}</div></div><div><div class="k">Days 29 to 56</div><div class="v num">${nf(r.s56, 1)}</div></div><div><div class="k">Missed, 28 days</div><div class="v num">${nf(r.missed, 1)}</div></div><div><div class="k">Reorder point</div><div class="v num">${nf(r.rop, 1)}</div></div><div><div class="k">Target stock</div><div class="v num">${nf(r.target, 1)}</div></div><div><div class="k">On order</div><div class="v num">${nf(r.onOrder, 1)}</div></div><div><div class="k">After this truck</div><div class="v num">${r.daysAfter != null ? nf(r.daysAfter, 0) + " days" : "–"}</div></div></div>
      <div class="form-grid" style="margin-top:14px;grid-template-columns:repeat(4,minmax(0,1fr))"><div class="field"><label class="label" for="rr-${r.sap}">Order rule</label><select class="select sm" id="rr-${r.sap}" data-in="replRule" data-sap="${r.sap}">${["Auto", "Hero", "Core", "Tail", "Push", "Don't order"].map((x) => `<option ${(r.rule || "Auto") === x ? "selected" : ""}>${x}</option>`).join("")}</select></div><div class="field"><label class="label">Min crates</label><input class="input sm num-in" type="number" min="0" value="${r.min != null ? r.min : ""}" placeholder="–" data-in="replNum" data-repl="1" data-f="min" data-sap="${r.sap}"></div><div class="field"><label class="label">Max crates</label><input class="input sm num-in" type="number" min="0" value="${r.max != null ? r.max : ""}" placeholder="–" data-in="replNum" data-repl="1" data-f="max" data-sap="${r.sap}"></div><div class="field"><label class="label">Adjust + / −</label><input class="input sm num-in" type="number" value="${r.adj != null ? r.adj : ""}" placeholder="0" data-in="replNum" data-repl="1" data-f="adj" data-sap="${r.sap}"></div></div><div class="field" style="margin-top:12px"><label class="label" for="rn-${r.sap}">Reason / note</label><input class="input sm" id="rn-${r.sap}" value="${esc(r.reason || "")}" placeholder="Why this rule (optional)" data-in="replNote" data-sap="${r.sap}"></div>${sameField(r)}${r.note ? `<div class="row-sub" style="margin-top:10px">${esc(r.note)}</div>` : ""}</div>` : ""}`; }).join("")}</div>`;
}
function poLogHtml() {
  const byPO = {}; D.hpoLog.forEach((l) => { const g = (byPO[l.po] = byPO[l.po] || { po: l.po, placed: l.placed, pool: l.pool, lines: [], crates: 0, value: 0, toCome: 0 }); g.lines.push(l); g.crates += l.crates || 0; g.value += l.value || 0; g.toCome += l.toCome || 0; });
  return `<div class="group">${Object.values(byPO).sort((a, b) => (a.placed < b.placed ? 1 : -1)).map((g) => { const cnt = (s) => g.lines.filter((l) => l.status === s).length, open = g.toCome > 0 || cnt("Open") > 0; return `<button class="row" data-act="poSheet" data-po="${g.po}"><span class="attn-ic ${open ? "info" : "tint"}">${ic(open ? "truck" : "check")}</span><span class="grow"><div class="row-title mono" style="font-size:14.5px">${esc(g.po)}</div><div class="row-sub clip">Placed ${fmtDT(g.placed)} · ${esc(g.pool)} · ${g.lines.length} lines · ${cnt("Received")} received${cnt("Part received") ? ", " + cnt("Part received") + " part" : ""}${cnt("Closed short") ? ", " + cnt("Closed short") + " closed short" : ""}${cnt("Open") ? ", " + cnt("Open") + " still to come" : ""}</div></span><span class="row-end"><span style="text-align:right"><div class="row-value">${nf(g.crates)} crates</div><div class="row-sub num">${rs(g.value)}</div></span>${ic("chevR", "sm chev")}</span></button>`; }).join("")}</div>`;
}
/* ===== linked products (old pack / old code counted as the one you order) and adding products to the plan ===== */
function sameTargets(r) { return D.repl.rows.filter((x) => x !== r && !x.same && x.sap !== r.sap).sort((a, b) => a.name.localeCompare(b.name)); }
function sameField(r) {
  const fed = D.repl.rows.filter((x) => x.same === r.sap);
  if (fed.length) return `<div class="banner info" style="margin-top:12px">${ic("repeat", "sm")}<span>Also counts ${fed.map((x) => `<b>${esc(shortName(x.name))}</b>`).join(", ")} (same product). To change that, open ${fed.length > 1 ? "those products" : "that product"}.</span></div>`;
  return `<div class="field" style="margin-top:12px"><label class="label" for="rsame-${r.sap}">Same product as (old pack or old code → the one you order now)</label><select class="select sm" id="rsame-${r.sap}" data-in="replSame" data-sap="${r.sap}"><option value="">Not linked: ordered on its own</option>${sameTargets(r).map((x) => `<option value="${esc(x.sap)}" ${r.same === x.sap ? "selected" : ""}>${esc(x.name)} · ${esc(x.sap)}</option>`).join("")}</select><div class="row-sub" style="margin-top:5px">When linked, its sales, missed sales, stock and stock on order count in the chosen product (converted by crate size), and it is not ordered itself.</div></div>`;
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
  return `<div class="group">${list.map((c) => { const on = !!replBySap[c.sap]; return `<button class="row" ${on ? "disabled style=\"opacity:.55\"" : `data-act="replAddDo" data-sap="${esc(c.sap)}"`}><span class="grow"><div class="row-title">${esc(c.name)}</div><div class="row-sub">${esc(c.cat || "")} · SAP ${esc(c.sap)} · ${c.upc ? c.upc + " boxes / crate" : "not stocked yet"}${price(c.sap) != null ? " · " + rs2(ssRate(c.sap) || 0) + " SS rate" : ""}</div></span><span class="row-end">${on ? `<span class="pill plain">On the plan</span>` : ic("plus", "sm dim")}</span></button>`; }).join("")}</div>`;
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
  openSheet("Hangyo purchase order", `<div class="card card-pad"><div class="kv"><div><div class="k">Own stock</div><div class="v num">${nf(T.own)} crates</div></div><div><div class="k">Quick commerce</div><div class="v num">${nf(qcCr)} crates</div></div><div><div class="k">Total</div><div class="v num">${nf(T.own + qcCr)} of ${nf(D.repl.truck)}</div></div><div><div class="k">Value at SS rate</div><div class="v num">${rs(T.value + qcVal)}</div></div></div></div>
    <div class="group-label" style="padding-bottom:0"><span>Own stock · ${lines.length} lines</span></div>${lines.length ? tbl(lines, (r) => r.final) : `<div class="group"><div class="empty">Nothing for own stock.</div></div>`}
    <div class="group-label" style="padding-bottom:0"><span>Quick commerce stock · ${qls.length} lines</span></div>${typedNote}${qls.length ? tbl(qls, (q) => q.final) : `<div class="group"><div class="empty">Nothing for Swiggy / Zepto.</div></div>`}
    <div class="row-sub">The Hangyo portal takes boxes. Place the order there, then mark it as placed so the next plan does not order it twice.</div>`,
    `<button class="btn btn-secondary" data-act="replExcel">${ic("doc", "sm")} Excel</button><button class="btn btn-secondary" data-act="copyPO">${ic("copy", "sm")} Copy lines</button><button class="btn btn-primary" data-act="placePO">Mark PO as placed</button>`, true);
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
  closeSheet(); S.replTab = "orders"; render(); toast("PO marked as placed");
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
  openSheet(esc(g.po), `<div class="card card-pad"><div class="kv"><div><div class="k">Placed</div><div class="v">${fmtDT(g.placed)}</div></div><div><div class="k">Stock pool</div><div class="v">${esc(g.pool)}</div></div><div><div class="k">Crates</div><div class="v num">${nf(lines.reduce((a, l) => a + (l.crates || 0), 0))}</div></div><div><div class="k">Value at SS rate</div><div class="v num">${rs(lines.reduce((a, l) => a + (l.value || 0), 0))}</div></div></div></div>
    <div class="group">${lines.map((l) => `<div class="row"><span class="grow"><div class="row-title clip">${esc(shortName(l.product))}</div><div class="row-sub">${nf(l.crates)} crates · ${nf(l.boxes)} boxes${l.received ? " · " + nf(l.received) + " boxes received" : ""}${l.notes ? " · " + esc(l.notes) : ""}</div></span><span class="row-end">${statusPill(l.status)}</span></div>`).join("")}</div>`);
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
  const tiles = `<div class="tiles"><div class="tile"><div class="tile-label">Slow-moving products</div><div class="tile-value">${T.n}</div><div class="tile-sub">${T.still} with no sales in 4 weeks</div></div><div class="tile"><div class="tile-label">Crates to push</div><div class="tile-value">${nf(T.crates, 0)}<small>crates</small></div><div class="tile-sub">Above ${days} days of sales</div></div><div class="tile"><div class="tile-label">Money tied up</div><div class="tile-value">₹${lakh(T.value)}<small>L</small></div><div class="tile-sub">All their stock, at the SS rate</div></div><div class="tile"><div class="tile-label">Of which to push</div><div class="tile-value">₹${lakh(T.pushValue)}<small>L</small></div><div class="tile-sub">The extra stock, at the SS rate</div></div></div>`;
  const grid = `<div class="dg" style="--cols:minmax(0,2fr) 80px 90px 100px 110px 90px 110px;--cols-sm:minmax(0,1fr) auto"><div class="dg-row dg-head"><span>Product</span><span class="r">In stock</span><span class="r c-hide">Sold, 4 wks</span><span class="r c-hide">Lasts</span><span class="c-hide">Last sold</span><span class="r">To push</span><span class="r c-hide">Tied up</span></div>
  ${rows.map((r) => `<button class="dg-row" data-act="slowSheet" data-sap="${r.sap}"><span><div class="strong clip">${esc(shortName(r.name))}</div><div class="row-sub clip">${r.buyers.length ? "Bought by " + esc(r.buyers.slice(0, 2).map((b) => shortOf(b.name)).join(", ")) + (r.buyers.length > 2 ? ` +${r.buyers.length - 2}` : "") : "No one has bought it in 90 days"}${r.onTruck > 0 ? ` · <span style="color:var(--warn);font-weight:600">${nf(r.onTruck)} more on the next truck</span>` : ""}</div></span><span class="r num">${nf(r.crates, 1)}</span><span class="r c-hide num">${r.s28 ? nf(r.s28, 1) : `<span class="dim">0</span>`}</span><span class="r c-hide">${r.still ? `<span class="pill bad">No sales</span>` : `<span class="num" style="color:${r.cover > days * 2 ? "var(--bad)" : "var(--warn)"};font-weight:600">${coverTxt(r)}</span>`}</span><span class="c-hide row-sub">${lastTxt(r)}</span><span class="r strong num">${nf(r.push, 1)}</span><span class="r c-hide num">${rs(r.value)}</span></button>`).join("")}</div>`;
  return head + tiles + grid;
}
ACT.slowDays = (el) => { slowCfg().days = +el.dataset.d; render(); };
ACT.slowList = () => { S.stockTab = "slow"; go("stock"); };
ACT.slowSheet = (el) => {
  const r = slowRows().find((x) => x.sap === el.dataset.sap); if (!r) return ACT.productSheet(el);
  const days = +slowCfg().days || 45;
  openSheet(esc(shortName(r.name)), `<div class="card card-pad"><div class="section-title" style="font-size:19px">${esc(r.name)}</div><div class="row-sub">${esc(r.cat || "")} · ${esc(r.trop || "No Tropicana code")}</div>
      <div class="divider" style="margin:16px 0"></div><div class="kv"><div><div class="k">In stock</div><div class="v num">${nf(r.crates, 1)} crates · ${nf(r.ea)} boxes</div></div><div><div class="k">Sold, last 4 weeks</div><div class="v num">${nf(r.s28, 1)} crates</div></div><div><div class="k">Stock lasts</div><div class="v">${coverTxt(r)}</div></div><div><div class="k">Last sold</div><div class="v">${r.last ? fmtDate(r.last) + " · " + lastTxt(r) : "Not since 1 Sep"}</div></div><div><div class="k">Last received</div><div class="v">${r.recv ? fmtDate(r.recv) : "–"}</div></div><div><div class="k">Tied up (SS rate)</div><div class="v num">${rs(r.value)}</div></div></div></div>
    <div class="banner warn">${ic("info", "sm")}<span><b>Push about ${nf(r.push, 1)} crates</b> (${rs(r.pushValue)}). ${r.still ? "Nothing has sold in 4 weeks, so all of it is extra." : `That is the stock above ${days} days of sales at the current pace.`}${r.onTruck > 0 ? ` The truck plan still has ${nf(r.onTruck)} more crates of it. Set its order rule to "Don't order" in Replenishment if you want to stop.` : ""}</span></div>
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
  return `<div class="offer"><span class="offer-k">${ic("bolt", "sm")} ${theirs.length ? "Offer them, they bought it before:" : "Slow stock to offer:"}</span>${list.map((r) => `<button class="chip" data-act="addLine" data-sap="${r.sap}" title="${esc(r.name)} · ${nf(r.crates, 1)} crates in stock, lasts ${coverTxt(r)}">${esc(shortName(r.name).split("(")[0].trim())} <span style="opacity:.6">${nf(r.crates, 0)}</span></button>`).join("")}</div>`;
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
    ["SAP code", "Tropicana code", "Product", "Category", "Class", "Order rule", "Sold, last 14 days", "Sold, days 15–28", "Sold, days 29–56", "Missed, 28 days", "Sells / day", "Stock (crates)", "On order", "Days of stock", "Safety stock", "Reorder point", "Target stock", "Below reorder point", "Suggested", "Your crates", "Final crates", "Boxes", "Change vs plan", "Value at SS rate", "Days of stock after truck", "Note"]];
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
  return `<div class="banner ${un.length ? "warn" : "good"}" style="align-items:flex-start">${ic(un.length ? "alert" : "check", "sm")}<span class="grow"><b>${esc(R.file.name)}:</b> ${R.file.added} line${R.file.added === 1 ? "" : "s"} added${R.file.check ? `, ${R.file.check} to check (marked below)` : ""}${R.file.unitGuess ? ". The file did not say crates or boxes, so quantities were read as <b>crates</b>. Change them if they were boxes" : ""}.${un.length ? ` <b>${un.length} could not be matched</b>, choose the product for each:` : " Check the crates, then save."}</span></div>
    ${un.length ? `<div class="group">${un.map((u, i) => `<div class="row" style="flex-wrap:wrap;gap:8px"><span class="grow" style="min-width:180px"><div class="row-title clip">${esc(u.name || u.code)}</div><div class="row-sub">${u.code ? "Code " + esc(u.code) + " · " : ""}${nf(u.qty)} ${u.unit === "EA (Box)" ? "boxes" : "crates"}${u.why ? " · " + esc(u.why) : ""}</div></span><select class="select sm" style="width:auto;max-width:100%" data-in="recvPick" data-i="${i}"><option value="">Choose the product…</option>${(u.cands || []).filter((s) => stockBySap[s]).map((s) => `<option value="${esc(s)}">${esc(stockBySap[s].name)}</option>`).join("")}${D.stock.filter((s) => !(u.cands || []).includes(s.sap)).sort((a, b) => a.name.localeCompare(b.name)).map((s) => `<option value="${esc(s.sap)}">${esc(s.name)}</option>`).join("")}</select><button class="icon-btn" data-act="recvSkip" data-i="${i}" aria-label="Skip this line">${ic("trash", "sm")}</button></div>`).join("")}</div>` : ""}`;
}
function recvPush(sap, x, conf) {
  const st = stockBySap[sap], boxes = x.unit === "EA (Box)" ? x.qty : null, crates = boxes != null ? Math.round((boxes / st.upc) * 100) / 100 : x.qty;
  const ex = S.recv.lines.find((l) => l.sap === sap && (l.batch || "") === (x.batch || ""));
  if (ex) { if (ex.boxes != null || boxes != null) ex.boxes = (ex.boxes != null ? ex.boxes : ex.crates * st.upc) + (boxes != null ? boxes : x.qty * st.upc); ex.crates = Math.round(((ex.boxes != null ? ex.boxes / st.upc : ex.crates + crates)) * 100) / 100; return; }
  S.recv.lines.push({ sap, name: st.name, upc: st.upc, crates, boxes, batch: x.batch || "", raw: `${x.code ? x.code + " " : ""}${x.name}`.trim(), conf });
}
IN.recvFile = async (el) => {
  const f = el.files && el.files[0]; if (!f) return; const R = S.recv, sig = [f.name, f.size, f.lastModified].join("|");
  if (R.fileSig === sig) return; /* the same file can fire both input and change */
  R.fileSig = sig; R.lines = R.lines.filter((l) => !l.raw); /* a new file replaces lines read from an earlier one */
  try {
    await loadScriptOnce(XLSX_SRC, () => !!window.XLSX);
    const wb = window.XLSX.read(await f.arrayBuffer(), { type: "array" }), rows = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false, blankrows: false });
    const P = recvFromRows(rows);
    if (P.error || !P.lines.length) { R.file = null; part("rc-up-msg", `<div class="banner bad">${ic("alert", "sm")}<span>${esc(P.error || "No lines with a quantity were found in that file.")}</span></div>`); return; }
    if (P.inv && !R.inv) R.inv = P.inv; if (P.date) R.date = P.date;
    let added = 0, check = 0; R.unmatched = [];
    P.lines.forEach((x) => {
      if (!x.unit) x.unit = "Crate";
      const m = recvMatch(x);
      if (!m.sap) { R.unmatched.push({ ...x, cands: m.cands || [] }); return; }
      if (!stockBySap[m.sap]) { R.unmatched.push({ ...x, cands: m.cands || [], why: "not set up as a stocked product: add it in Setup, or choose" }); return; }
      recvPush(m.sap, x, m.conf); added++; if (m.conf !== "sure") check++;
    });
    R.file = { name: f.name, added, check, unitGuess: !P.unitKnown };
    logActivity("Invoice read", f.name, `${added} lines matched${R.unmatched.length ? ", " + R.unmatched.length + " to choose" : ""}`);
    part("sheet-body", receiveBody());
  } catch (e) { part("rc-up-msg", `<div class="banner bad">${ic("alert", "sm")}<span>That file could not be read. Save it as .xlsx and try again.</span></div>`); }
};
IN.recvPick = (el) => { const R = S.recv, u = R.unmatched[+el.dataset.i]; if (!el.value || !u) return; recvPush(el.value, u, "sure"); R.unmatched.splice(+el.dataset.i, 1); R.file.added++; D.orderAliases = D.orderAliases || {}; if (u.name) D.orderAliases[impAliasKey(u.name)] = el.value; part("sheet-body", receiveBody()); };
ACT.recvSkip = (el) => { S.recv.unmatched.splice(+el.dataset.i, 1); part("sheet-body", receiveBody()); };

/* ===== TOD & NOTES ===== */
function todState() {
  const by = {}; let total = 0;
  D.tod.lines.forEach((l) => { const o = orderById(l.id); if (o && o.status !== "Dispatched") return; const due = Math.max(0, (l.amount || 0) - (l.received || 0)); if (!by[l.dist]) by[l.dist] = { name: l.dist, due: 0, earned: 0, lines: 0 }; by[l.dist].due += due; by[l.dist].earned += l.amount || 0; by[l.dist].lines++; total += due; });
  return { by: Object.values(by).sort((a, b) => b.due - a.due), total };
}
function todHtml() {
  const T = todState(), max = T.by.length ? T.by[0].earned : 1, byOrder = {};
  D.tod.lines.forEach((l) => { const g = (byOrder[l.id] = byOrder[l.id] || { id: l.id, dist: l.dist, time: l.time, amount: 0, received: 0, n: 0 }); g.amount += l.amount || 0; g.received += l.received || 0; g.n++; });
  const orders = Object.values(byOrder).sort((a, b) => (a.time < b.time ? 1 : -1));
  return `<div class="grid-2"><div class="card card-pad"><div class="tile-label">Due from Hangyo, all months</div><div class="hero-figure" style="font-size:44px">${rs(T.total)}</div><div class="tile-sub">Special price below the normal rate on dispatched orders. Hangyo pays it the month after.</div><div style="margin-top:16px"><button class="btn btn-primary" data-act="todRecvSheet">${ic("plus", "sm")} Record TOD received</button></div></div>
    <div><div class="group-label"><span>By distributor</span></div><div class="group">${T.by.map((d) => `<div class="row"><span class="avatar soft">${esc(initials(d.name))}</span><span class="grow"><div class="row-title clip">${esc(d.name)}</div><div class="bar-cell" style="margin-top:5px"><div class="meter"><i style="width:${(d.earned / max) * 100}%"></i></div><span class="row-sub nowrap">${d.lines} lines · earned ${rs(d.earned)}</span></div></span><span class="row-end"><span style="text-align:right"><div class="row-value">${rs2(d.due)}</div><div class="row-sub">still due</div></span></span></div>`).join("")}</div></div></div>
    ${D.tod.receipts && D.tod.receipts.length ? `<div><div class="group-label"><span>Received from Hangyo</span></div><div class="group">${D.tod.receipts.map((r) => `<div class="row"><span class="attn-ic tint">${ic("check")}</span><span class="grow"><div class="row-title">${rs2(r.amount)}</div><div class="row-sub">${fmtDate(r.date)}${r.ref ? " · " + esc(r.ref) : ""} · set off oldest first</div></span></div>`).join("")}</div></div>` : ""}
    <div><div class="group-label"><span>TOD by order</span><span>oldest lines are paid first</span></div><div class="group">${orders.map((g) => { const st = g.received >= g.amount - 0.005 ? "Received" : g.received > 0 ? "Part received" : "Expected"; return `<button class="row" data-act="orderSheet" data-id="${g.id}"><span class="grow"><div class="row-title clip">${esc(g.dist)}</div><div class="row-sub">${fmtDate(g.time)} · ${g.n} lines</div></span><span class="row-end">${statusPill(st)}<span class="row-value">${rs2(g.amount)}</span>${ic("chevR", "sm chev")}</span></button>`; }).join("")}</div></div>`;
}
function notesHtml() {
  const shortType = (t) => String(t).split(" - ")[0];
  return `<div class="hstack between wrap gap-12"><div class="row-sub" style="max-width:60ch">Returns and credit notes come off sales on the dashboard. Raise the GST note in Vyapar as usual.</div><button class="btn btn-primary" data-act="noteSheet">${ic("plus", "sm")} New note</button></div>
    <div class="group">${D.notes.slice().reverse().map((n) => `<div class="row"><span class="attn-ic ${/return/i.test(n.type) ? "warn" : "info"}">${ic(/return/i.test(n.type) ? "undo" : "rupee")}</span><span class="grow"><div class="row-title clip">${esc(n.party || "Hangyo")}</div><div class="row-sub clip">${esc(shortType(n.type))} · ${fmtDate(n.date)}${n.no ? " · " + esc(n.no) : ""}${n.product ? " · " + esc(shortName(n.product)) : ""}</div></span><span class="row-end">${statusPill(n.status || "Active")}<span class="row-value">${rs2(n.amount)}</span></span></div>`).join("")}</div>`;
}
VIEWS.tod = () => `<div class="page narrow">
  <div class="page-head"><div><h1 class="title">TOD & notes</h1><div class="subtitle">What Hangyo owes you for special-price distributors, and every credit or debit note.</div></div></div>
  ${seg("moneyTab", S.moneyTab, [["tod", "TOD"], ["notes", "Credit & debit notes", D.notes.length]])}
  ${S.moneyTab === "tod" ? todHtml() : notesHtml()}</div>`;
ACT.todRecvSheet = () => openSheet("Record TOD received", `<div class="card card-pad"><div class="form-grid"><div class="field"><label class="label" for="tr-amt">Amount received (₹)</label><input class="input num-in" id="tr-amt" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00"></div><div class="field"><label class="label" for="tr-date">Date received</label><input class="input" id="tr-date" type="date" value="${iso(NOW()).slice(0, 10)}"></div><div class="field full"><label class="label" for="tr-ref">Hangyo reference (credit note number)</label><input class="input" id="tr-ref" placeholder="Optional"></div></div></div><div class="banner info">${ic("info", "sm")}<span>The amount is set off against the oldest TOD lines first. Anything left over waits for the next lines.</span></div>`, `<button class="btn btn-primary" data-act="todRecvSave">Save receipt</button>`);
ACT.todRecvSave = () => {
  let amt = +$("#tr-amt").value || 0; if (amt <= 0) { toast("Type the amount Hangyo paid", "info"); return; }
  const orig = amt; D.tod.receipts = D.tod.receipts || []; D.tod.receipts.unshift({ amount: orig, date: $("#tr-date").value, ref: $("#tr-ref").value });
  D.tod.lines.slice().sort((a, b) => (a.time > b.time ? 1 : -1)).forEach((l) => { if (amt <= 0) return; const o = orderById(l.id); if (o && o.status !== "Dispatched") return; const due = (l.amount || 0) - (l.received || 0); if (due <= 0) return; const pay = Math.min(due, amt); l.received = (l.received || 0) + pay; l.status = l.received >= l.amount - 0.005 ? "Received" : "Part received"; amt -= pay; });
  logActivity("TOD received", $("#tr-ref").value || "Hangyo", rs2(orig)); closeSheet(); render(); toast(`${rs(orig)} set off against the oldest TOD lines`);
};
const NOTE_TYPES = ["Sales return - credit note to distributor", "Purchase return - debit note to Hangyo", "Hangyo credit note (value only)", "Rate difference - credit note to distributor", "Rate difference - debit note to distributor"];
ACT.noteSheet = () => openSheet("New credit or debit note", `<div class="card card-pad"><div class="form-grid"><div class="field full"><label class="label" for="nt-type">Note type</label><select class="select" id="nt-type">${NOTE_TYPES.map((t) => `<option>${esc(t)}</option>`).join("")}</select></div><div class="field"><label class="label" for="nt-party">Distributor</label><select class="select" id="nt-party">${D.distributors.map((d) => `<option>${esc(d.name)}</option>`).join("")}</select></div><div class="field"><label class="label" for="nt-date">Note date</label><input class="input" id="nt-date" type="date" value="${iso(NOW()).slice(0, 10)}"></div><div class="field"><label class="label" for="nt-no">Note number (Vyapar or Hangyo)</label><input class="input" id="nt-no" placeholder="SR/CN26-27/12"></div><div class="field"><label class="label" for="nt-reason">Reason</label><select class="select" id="nt-reason">${["Damaged", "Expired / near expiry", "Melted / cold chain issue", "Wrong or excess supply", "Quality complaint", "Rate difference", "TOD / special price", "Scheme", "Other"].map((t) => `<option>${t}</option>`).join("")}</select></div><div class="field full"><label class="label" for="nt-amt">Amount excl. GST (₹)</label><input class="input num-in" id="nt-amt" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00"></div></div></div><div class="banner info">${ic("info", "sm")}<span>For returns, the real build lets you add each product as Good (back into stock) or Damaged (into damaged stock).</span></div>`, `<button class="btn btn-primary" data-act="noteSave">Save note</button>`);
ACT.noteSave = () => { const amt = +$("#nt-amt").value || 0; if (amt <= 0) { toast("Type the note amount", "info"); return; } D.notes.push({ id: "CN-" + stamp(NOW()), type: $("#nt-type").value, no: $("#nt-no").value, date: $("#nt-date").value, party: $("#nt-party").value, reason: $("#nt-reason").value, amount: amt, gst: amt * 0.05, total: amt * 1.05, status: "Active" }); S.moneyTab = "notes"; closeSheet(); render(); toast("Note saved"); };

/* ===== SETUP ===== */
function distGrid() {
  const q = key(S.setupQ), list = D.distributors.filter((d) => !q || key(d.name + " " + d.district + " " + d.short).includes(q));
  return `<div class="dg" style="--cols:minmax(0,2fr) 110px 130px 90px 110px 120px;--cols-sm:minmax(0,1fr) auto"><div class="dg-row dg-head"><span>Distributor</span><span class="c-hide">District</span><span class="c-hide">Payment</span><span class="r c-hide">Credit</span><span class="r c-hide">Deposit</span><span>Pricing</span></div>${list.map((d) => `<button class="dg-row" data-act="distSheet" data-name="${esc(d.name)}"><span class="hstack gap-10"><span class="avatar soft">${esc(initials(d.name))}</span><span style="min-width:0"><div class="strong clip">${esc(d.name)}</div><div class="row-sub clip">${esc(d.short || "")}${d.phone ? " · " + esc(d.phone) : ""}</div></span></span><span class="c-hide">${esc(d.district || "–")}</span><span class="c-hide">${esc(d.pay || "Not set")}</span><span class="r c-hide">${d.credit != null ? d.credit + " days" : "–"}</span><span class="r c-hide">${d.deposit ? rs(d.deposit) : "–"}</span><span>${d.special ? `<span class="pill plain tint">Special</span>` : `<span class="pill plain">Normal</span>`}</span></button>`).join("")}</div>`;
}
function catalogGrid() {
  const q = key(S.setupQ), all = D.catalog.filter((c) => !q || q.split(" ").every((w) => key(c.name + " " + c.sap + " " + c.cat).includes(w))), list = all.slice(0, 80);
  return `<div class="row-sub" style="margin-bottom:8px">Showing ${list.length} of ${all.length} products from the Hangyo South Kerala list${all.length > list.length ? ". Search to narrow it down." : "."}</div><div class="dg" style="--cols:minmax(0,2.2fr) 90px 90px 100px 90px 96px;--cols-sm:minmax(0,1fr) auto"><div class="dg-row dg-head"><span>Product</span><span class="r c-hide">MRP / box</span><span class="r c-hide">SS rate</span><span class="r">Distributor rate</span><span class="r c-hide">Dealer</span><span class="c-hide">Range</span></div>${list.map((c) => { const p = D.prices[c.sap] || []; return `<button class="dg-row" data-act="productSheet" data-sap="${c.sap}"><span><div class="strong clip">${esc(c.name)}</div><div class="row-sub clip">${esc(c.cat || "")} · SAP ${esc(c.sap || "–")}</div></span><span class="r c-hide">${c.mrp != null ? rs(c.mrp) : "–"}</span><span class="r c-hide">${p[0] != null ? rs2(p[0]) : "–"}</span><span class="r strong">${p[1] != null ? rs2(p[1]) : "–"}</span><span class="r c-hide">${p[2] != null ? rs2(p[2]) : "–"}</span><span class="c-hide">${c.stocked ? `<span class="pill plain good">Stocked</span>` : `<span class="pill plain">Not stocked</span>`}</span></button>`; }).join("")}</div>`;
}
function specialHtml() {
  const sp = D.distributors.filter((d) => d.special), n = Object.keys(D.special.prices).length;
  return `<div class="card card-pad"><div class="card-title">Special prices and TOD</div><div class="row-sub" style="max-width:66ch;margin-top:4px">These distributors buy at ${Math.round(D.special.pct * 100)}% below the normal South Kerala rate on ${n} products. The difference on every dispatched order is tracked as TOD and claimed from Hangyo the next month.</div></div>
    <div class="group">${D.distributors.map((d) => `<div class="row"><span class="avatar soft">${esc(initials(d.name))}</span><span class="grow"><div class="row-title clip">${esc(d.name)}</div><div class="row-sub">${esc(d.district || "")}${d.freezer ? " · " + esc(d.freezer) : ""}</div></span><span class="row-end">${d.special ? `<span class="pill plain tint">${Math.round(D.special.pct * 100)}% off</span>` : ""}<button class="toggle" role="switch" aria-checked="${!!d.special}" data-act="toggleSpecial" data-name="${esc(d.name)}" aria-label="Special prices for ${esc(d.name)}"></button></span></div>`).join("")}</div>`;
}
function activityHtml() {
  const list = D.activity.slice(0, 70), tone = (a) => (/cancel/i.test(a) ? "bad" : /dispatch|delivered|received/i.test(a) ? "good" : /edited|hand/i.test(a) ? "warn" : "tint");
  return `<div class="card card-pad"><div class="timeline">${list.map((a) => `<div class="tl"><span class="tl-dot ${tone(a.action)}"></span><div><div><b>${esc(a.action)}</b>${a.ref ? ` <span class="mono dim">${esc(a.ref)}</span>` : ""}</div><div class="row-sub">${esc(a.detail || "")}</div><div class="row-sub dim">${fmtDT(a.time)}${a.by ? " · " + esc(a.by) : ""}</div></div></div>`).join("")}</div></div>`;
}
VIEWS.setup = () => {
  const tab = S.setupTab, searchable = tab === "distributors" || tab === "products";
  return `<div class="page">
    <div class="page-head"><div><h1 class="title">Setup</h1><div class="subtitle">Distributors, products and prices, company details, and a record of everything that was changed.</div></div>${tab === "distributors" ? `<div class="head-actions"><button class="btn btn-primary" data-act="distEdit">${ic("plus", "sm")} Add distributor</button></div>` : tab === "products" ? `<div class="head-actions"><button class="btn btn-primary" data-act="productEdit">${ic("plus", "sm")} Add product</button></div>` : ""}</div>
    <div class="hstack gap-12 wrap">${seg("setupTab", tab, [["distributors", "Distributors", D.distributors.length], ["products", "Products & prices"], ["special", "Special prices"], ["settings", "Company & QC"], ["activity", "Activity"]])}${searchable ? `<div class="search">${ic("search", "sm")}<input class="input" id="setup-q" type="search" placeholder="${tab === "distributors" ? "Search distributors" : "Search products, codes or categories"}" value="${esc(S.setupQ)}" data-in="setupQ" autocomplete="off"></div>` : ""}</div>
    <div id="setup-body">${tab === "distributors" ? distGrid() : tab === "products" ? catalogGrid() : tab === "special" ? specialHtml() : tab === "settings" ? settingsHtml() : activityHtml()}</div></div>`;
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
    ${orders.length ? `<div><div class="group-label"><span>Orders</span><span>${orders.length}</span></div><div class="group">${orders.slice(0, 8).map((o) => `<button class="row" data-act="orderSheet" data-id="${o.id}"><span class="grow"><div class="row-title">${fmtDate(o.time)} · ${nf(o.crates)} crates</div><div class="row-sub">${o.lines} lines</div></span><span class="row-end">${statusPill(o.status)}<span class="row-value">${rs(o.value)}</span>${ic("chevR", "sm chev")}</span></button>`).join("")}</div></div>` : ""}`,
    `<button class="btn btn-secondary" data-act="distEdit" data-name="${esc(d.name)}">${ic("pencil", "sm")} Edit details</button><button class="btn btn-primary" data-act="orderFor" data-name="${esc(d.name)}">${ic("plus", "sm")} New order for ${esc(d.short || d.name)}</button>`);
};
ACT.orderFor = (el) => { S.draft = newDraft(); S.draft.dist = el.dataset.name; closeSheet(); closeCmd(); go("new-order"); };

/* ===== MORE (phone) ===== */
VIEWS.more = () => `<div class="page narrow"><div class="page-head"><h1 class="title">More</h1></div>
  <div class="group">${[["quick", "Quick commerce", "Swiggy and Zepto POs, deliveries and GRN", "bolt", openQC().length], ["replenish", "Replenishment", "Plan the Hangyo truck", "cycle"], ["tod", "TOD & notes", "TOD due, credit and debit notes", "rupee"], ["logistics", "Logistics", "Trips, transport cost and its share of sales", "truck", unloggedRuns().length], ["setup", "Setup", "Distributors, products, prices, activity", "gear"]].map(([r, t, s, i, n]) => `<button class="row" data-act="nav" data-to="${r}"><span class="attn-ic tint">${ic(i)}</span><span class="grow"><div class="row-title">${t}</div><div class="row-sub">${s}</div></span><span class="row-end">${n ? `<span class="pill plain info">${n}</span>` : ""}${ic("chevR", "sm chev")}</span></button>`).join("")}</div>
  <div class="group"><button class="row" data-act="cmd"><span class="attn-ic info">${ic("search")}</span><span class="grow"><div class="row-title">Search everything</div><div class="row-sub">Distributors, products, orders</div></span>${ic("chevR", "sm chev")}</button>${HOST ? `<button class="row" data-act="account"><span class="avatar">${esc(initials(ME.name).slice(0, 1) || "S")}</span><span class="grow"><div class="row-title">${esc(ME.name)}</div><div class="row-sub">Account, team and sign out</div></span>${ic("chevR", "sm chev")}</button>` : ""}</div></div>`;

/* ===== ACCOUNT (only on the staff-login page) ===== */
ACT.account = () => {
  if (!HOST) return;
  const owner = ME.role === "owner";
  openSheet("Account", `<div class="card card-pad"><div class="hstack gap-12"><span class="avatar lg soft">${esc(initials(ME.name))}</span><div class="grow"><div class="section-title" style="font-size:19px">${esc(ME.name)}</div><div class="row-sub">${owner ? "Owner" : "Staff"} · SahiReach LLP</div></div></div></div>
    <div style="margin-top:22px"><div class="group-label"><span>Team</span></div><div class="group" id="team-list"><div class="row"><span class="row-sub">Loading…</span></div></div></div>
    ${owner ? `<div id="invite-box" style="margin-top:18px"><button class="btn btn-secondary" data-act="inviteStaff">${ic("plus", "sm")} Invite a teammate</button><div class="row-sub" style="margin-top:8px">Creates a one-time setup code. Your teammate opens sahireach.com/staff-login, chooses “Set up your account” and enters it.</div></div>` : ""}`,
    `<button class="btn btn-secondary" data-act="signOut">${ic("logout", "sm")} Sign out</button>`);
  HOST.team().then((rows) => part("team-list", rows.map((r) => `<div class="row"><span class="avatar soft">${esc(initials(r.name).slice(0, 1) || "S")}</span><span class="grow"><div class="row-title">${esc(r.name)}</div></span><span class="row-sub">${r.role === "owner" ? "Owner" : "Staff"}</span></div>`).join("") || `<div class="row"><span class="row-sub">Just you so far.</span></div>`))
    .catch(() => part("team-list", `<div class="row"><span class="row-sub">Could not load the team. Check your connection.</span></div>`));
};
ACT.inviteStaff = (el) => {
  el.disabled = true;
  HOST.invite().then((code) => part("invite-box", `<div class="card card-pad"><div class="row-sub">Setup code · works once · expires in 7 days</div><div class="mono" id="invite-code" style="font-size:21px;font-weight:650;letter-spacing:0.04em;margin:6px 0 12px;color:var(--ink)">${esc(code)}</div><button class="btn btn-primary btn-sm" data-act="copyInvite" data-code="${esc(code)}">${ic("copy", "sm")} Copy invite message</button></div>`))
    .catch((e) => { el.disabled = false; toast((e && e.message) || "Could not create a code", "alert"); });
};
ACT.copyInvite = (el) => copyText(`Set up your SahiReach staff login:\n1. Open https://sahireach.com/staff-login\n2. Choose "Set up your account"\n3. Enter this setup code: ${el.dataset.code}\nThe code works once and expires in 7 days.`, "Invite copied");
ACT.signOut = () => { if (HOST) HOST.signOut(); };

/* ===== COMMAND PALETTE ===== */
let cmdItems = [], cmdSel = 0;
function cmdResults(q) {
  const k = key(q), out = [];
  const screens = [["new-order", "New order", "plus"], ["home", "Home", "home"], ["orders", "Orders", "orders"], ["dispatch", "Dispatch", "truck"], ["quick", "Quick commerce", "bolt"], ["stock", "Stock", "box"], ["replenish", "Replenishment", "cycle"], ["tod", "TOD & notes", "rupee"], ["logistics", "Logistics", "truck"], ["setup", "Setup", "gear"]];
  screens.filter((s) => !k || key(s[1]).includes(k)).forEach((s) => out.push({ sec: "Go to", icon: s[2], label: s[1], run: () => { if (s[0] === "new-order") ACT.newOrder(); else go(s[0]); } }));
  if (k) {
    D.distributors.filter((d) => key(d.name + " " + d.short).includes(k)).slice(0, 5).forEach((d) => out.push({ sec: "Distributors", icon: "people", label: "New order for " + d.name, hint: d.district, run: () => ACT.orderFor({ dataset: { name: d.name } }) }));
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
document.addEventListener("click", (e) => { const el = e.target.closest("[data-act]"); if (!el) return; const fn = ACT[el.dataset.act]; if (fn) fn(el, e); });
document.addEventListener("input", (e) => { const el = e.target.closest("[data-in]"); if (!el) return; const fn = IN[el.dataset.in]; if (fn) fn(el, e); });
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
const CAN_PRICE = !HOST || ME.role === "owner";
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
      ${fld("df-name", "Name, as on invoices", x.name, { full: true, required: true, ph: "e.g. Supreme Traders Kerala LLP" })}
      ${fld("df-short", "Short name for pick lists", x.short, { ph: "e.g. Supreme" })}
      ${fld("df-phone", "Phone", x.phone, { type: "tel", ph: "10-digit mobile" })}
      ${fld("df-contact", "Contact person (for emails)", x.contact, { ph: "e.g. Rajesh" })}
      ${fld("df-email", "Email", x.email, { type: "email", ph: "orders@theirfirm.com" })}
      ${fld("df-cc", "Also copy (optional)", x.cc, { ph: "Other emails, separated by commas", full: true })}
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
  const credit = numOrNull(val("df-credit")), deposit = numOrNull(val("df-deposit"));
  const email = val("df-email"), ccRaw = val("df-cc");
  if (email && !emails(email).length) return formErr("The email address does not look right.");
  if (ccRaw && emails(ccRaw).length !== ccRaw.split(/[,;\s]+/).filter(Boolean).length) return formErr("One of the copy emails does not look right.");
  const d = old || { updated: null };
  const before = old ? JSON.stringify(old) : "";
  if (old && old.name !== name) renameDistributor(old.name, name);
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
      ${fld("pf-ss", "Your cost, SS rate (₹)", r4(p[0] != null ? p[0] : st && st.cost), { type: "number", disabled: lock })}
      ${fld("pf-dealer", "Dealer price (₹)", r4(p[2]), { type: "number", disabled: lock })}
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
      ${fld("cf-phone", "Phone", C.phone)}${fld("cf-email", "Email", C.email)}
    </div><button class="btn btn-primary" style="margin-top:16px" data-act="companySave" ${CAN_PRICE ? "" : "disabled"}>${ic("check", "sm")} Save company details</button></div>
    <div class="card card-pad"><div class="card-title">Tropicana, Swiggy and Zepto</div><div class="row-sub" style="margin:4px 0 14px">Where pick lists and deliveries go, and the smallest delivery worth sending.</div><div class="form-grid">
      ${fld("qf-swto", "Swiggy delivery point", Q.swiggyTo, { full: true })}${fld("qf-swmin", "Swiggy minimum per delivery (₹)", Q.minSwiggy, { type: "number", step: "1" })}
      ${fld("qf-trop", "Tropicana Logistics email(s) for pick lists", Q.tropEmail, { full: true, ph: "Separate several with commas" })}
      ${fld("qf-copy", "Send me a copy of every email", Q.copyTo, { full: true, ph: "Your email (optional)" })}
      ${fld("qf-zpto", "Zepto delivery point", Q.zeptoTo, { full: true })}${fld("qf-zpmin", "Zepto minimum per delivery (₹)", Q.minZepto, { type: "number", step: "1" })}
      ${fld("qf-pct", "Special price discount (%)", Math.round(D.special.pct * 1000) / 10, { type: "number", hint: "Used to suggest special prices for new products.", disabled: !CAN_PRICE })}
    </div><button class="btn btn-primary" style="margin-top:16px" data-act="qcSettingsSave">${ic("check", "sm")} Save</button></div></div>`;
}
ACT.companySave = () => {
  if (!CAN_PRICE) return;
  const C = D.company || (D.company = {});
  Object.assign(C, { name: val("cf-name") || "SahiReach LLP", address: val("cf-address"), gstin: val("cf-gstin").toUpperCase(), fssai: val("cf-fssai"), phone: val("cf-phone"), email: val("cf-email") });
  Object.assign(CO, C); logActivity("Company details edited", "", C.name); toast("Company details saved");
};
ACT.qcSettingsSave = () => {
  const Q = D.qcPick;
  Q.swiggyTo = val("qf-swto") || Q.swiggyTo; Q.zeptoTo = val("qf-zpto") || Q.zeptoTo;
  const te = val("qf-trop"), cp = val("qf-copy");
  if (te && !emails(te).length) { toast("The Tropicana email does not look right", "alert"); return; }
  if (cp && !emails(cp).length) { toast("The copy email does not look right", "alert"); return; }
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
const pickHash = (P) => JSON.stringify(P.rows.map((r) => [r.sap, Object.values(r.cells).map((c) => +c.toFixed(2))]));
function pickEmail(P, xlsxB64) {
  D.pickSent = D.pickSent || {};
  const prev = D.pickSent[pickKey(P)], revised = !!prev && prev.hash !== pickHash(P), made = P.made || NOW();
  const html = emailShell({
    preheader: `${P.orders.length} orders · ${nf(P.total, 2)} crates`,
    heading: revised ? "Revised pick list" : "Pick list for dispatch",
    paras: ["Hi Tropicana team,", revised ? `<b>This replaces the pick list we sent on ${fmtDT(prev.at)}.</b> Please pick from this one.` : `Please pick the following for dispatch. The Excel sheet is attached.`],
    blocks: [factsE([["Dispatch date", escE(dateLong(made))], ["Orders", nf(P.orders.length)], ["Crates", nf(P.total, 2)]]),
      ...P.orders.map((o, ci) => `<div style="margin:0 0 6px;font:700 14px/1.4 -apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${EM.ink}">${escE(shortOf(o.dist))} <span style="font-weight:400;color:${EM.ink3}">· ${nf(o.crates, 2)} crates</span></div>` + tableE(["Product", "Code", "Crates"], P.rows.filter((r) => r.cells[ci]).map((r) => [escE(shortName(r.name)), escE(tropCode(r.sap) || "–"), `<b>${nf(r.cells[ci], 2)}</b>`])))],
    signoff: "Thank you,",
  });
  return { kind: "pick_list", ref: pickKey(P).slice(0, 120), to: emails(D.qcPick.tropEmail), cc: [], subject: `${revised ? "REVISED · " : ""}SahiReach pick list ${pad2(made.getDate())}-${pad2(made.getMonth() + 1)} · ${P.orders.length} orders · ${nf(P.total, 2)} crates`, html, text: textOf(["Hi Tropicana team,", "", revised ? "REVISED pick list, replaces the earlier one." : "Pick list for dispatch (Excel attached):", "", ...P.orders.map((o, ci) => `${shortOf(o.dist)} (${nf(o.crates, 2)} crates)\n` + P.rows.filter((r) => r.cells[ci]).map((r) => `  ${nf(r.cells[ci], 2)} x ${shortName(r.name)} ${tropCode(r.sap) ? "(" + tropCode(r.sap) + ")" : ""}`).join("\n")), "", "Team SahiReach"]), attachments: xlsxB64 ? [{ filename: `SahiReach pick list ${stampOf(made).replace(":", "")}.xlsx`, content: xlsxB64 }] : [], revised, onSent: () => { D.pickSent[pickKey(P)] = { at: iso(NOW()), hash: pickHash(P) }; } };
}
function qcPickEmail(Dl, xlsxB64) {
  const to = S.qcPlatform === "Swiggy" ? D.qcPick.swiggyTo : D.qcPick.zeptoTo, now = NOW();
  const html = emailShell({
    preheader: `${S.qcPlatform} delivery · ${nf(Dl.crates)} crates`,
    heading: `${S.qcPlatform} delivery pick list`,
    paras: ["Hi Tropicana team,", `Please pick the following for the ${escE(S.qcPlatform)} delivery to <b>${escE(to)}</b>. The Excel sheet is attached.`],
    blocks: [factsE([["Dispatch date", escE(dateLong(now))], ["POs", escE(Dl.pos.map((p) => p.po).join(", "))], ["Crates", nf(Dl.crates)]]), tableE(["Product", "Code", "From QC stock", "From own stock", "Crates"], Dl.rows.filter((r) => r.send).map((r) => [escE(shortName(r.name)), escE(tropCode(r.sap) || (qcBySap[r.sap] || {}).trop || "–"), nf(r.fromQC), nf(r.fromOwn), `<b>${nf(r.send)}</b>`]), ["Total", "", nf(Dl.rows.reduce((a, r) => a + r.fromQC, 0)), nf(Dl.rows.reduce((a, r) => a + r.fromOwn, 0)), nf(Dl.crates)])],
    signoff: "Thank you,",
  });
  return { kind: "qc_pick_list", ref: S.qcPlatform + " " + Dl.pos.map((p) => p.po).join(","), to: emails(D.qcPick.tropEmail), cc: [], subject: `SahiReach ${S.qcPlatform} pick list ${pad2(now.getDate())}-${pad2(now.getMonth() + 1)} · ${nf(Dl.crates)} crates`, html, text: textOf(["Hi Tropicana team,", "", `${S.qcPlatform} delivery to ${to}. POs ${Dl.pos.map((p) => p.po).join(", ")}.`, "", ...Dl.rows.filter((r) => r.send).map((r) => `  ${r.send} x ${shortName(r.name)}`), "", "Team SahiReach"]), attachments: xlsxB64 ? [{ filename: `SahiReach ${S.qcPlatform} pick list ${stampOf(now).replace(":", "")}.xlsx`, content: xlsxB64 }] : [] };
}

/* ---------- preview and send ---------- */
function emails(v) { return String(v || "").split(/[,;\s]+/).map((x) => x.trim()).filter((x) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x)); }
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
  const aoa = qcPickAoa(Dl), b64 = await xlsxBase64(aoa.rows, aoa.cols, "QC Pick List");
  mailSheet([qcPickEmail(Dl, b64)], `Email ${S.qcPlatform} pick list to Tropicana`);
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
function unloggedRuns() {
  const L = logi(), onTrip = new Set(), qcOn = new Set();
  L.trips.forEach((t) => { (t.orders || []).forEach((id) => onTrip.add(id)); (t.qc || []).forEach((po) => qcOn.add(po)); });
  const runs = {};
  D.orders.forEach((o) => { if (o.status !== "Dispatched" || !o.dispatched || o.dispatched.slice(0, 10) < L.since || onTrip.has(o.id)) return; const d = o.dispatched.slice(0, 10), r = (runs[d] = runs[d] || { date: d, orders: [], qc: [] }); r.orders.push(o.id); });
  D.qcPOs.forEach((p) => { if (!p.deliveredOn || p.deliveredOn.slice(0, 10) < L.since || qcOn.has(p.po) || !(p.valueAccepted > 0 || p.pcsDelivered > 0)) return; const d = p.deliveredOn.slice(0, 10), r = (runs[d] = runs[d] || { date: d, orders: [], qc: [] }); r.qc.push(p.po); });
  return Object.values(runs).sort((a, b) => (a.date < b.date ? 1 : -1));
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
    ${runs.length ? `<div class="banner warn" style="align-items:flex-start">${ic("truck", "sm")}<span class="grow"><b>${runs.length} dispatch${runs.length > 1 ? "es have" : " has"} no trip logged yet.</b> ${runs.slice(0, 3).map((r) => `${fmtDate(r.date)}: ${esc(runLabel(r))}`).join(" · ")}${runs.length > 3 ? " and more" : ""}</span><button class="btn btn-sm btn-primary" data-act="tripForm" data-run="${runs[0].date}">Log ${fmtDate(runs[0].date)}</button></div>` : ""}
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
      ${trips.map((t) => `<button class="dg-row" data-act="tripForm" data-id="${esc(t.id)}"><span class="c-hide num">${fmtDate(t.date)}</span><span><div class="strong clip">${esc(t.sellers || "–")}</div><div class="row-sub clip"><span class="mob-only">${fmtDate(t.date)} · </span>${esc(t.type)}${t.route && t.type !== "QC" ? " · " + esc(t.route) : ""}${t.halting ? ` · ${nf(t.halting, 1)} h halting` : ""}${t.note ? " · " + esc(t.note) : ""}${(t.orders || []).length + (t.qc || []).length ? ` · ${(t.orders || []).length + (t.qc || []).length} linked` : ""}</div></span><span class="r c-hide">${t.crates != null ? nf(t.crates) : "–"}</span><span class="r c-hide">${t.km != null ? nf(t.km) : "–"}</span><span class="r c-hide">${t.revenue != null ? rs(t.revenue) : "–"}</span><span class="r strong">${t.cost != null ? rs(t.cost) : `<span class="pill warn">Add cost</span>`}<div class="row-sub mob-only">${tripPct(t) != null ? pct(tripPct(t), 1) : ""}</div></span><span class="r c-hide">${pctCell(tripPct(t))}</span><span class="c-hide clip">${esc(t.transporter || "–")}</span></button>`).join("")}</div>` : `<div class="group"><div class="empty"><div class="big">No trips here</div>Change the filters, or log a trip.</div></div>`}</div>
  </div>`;
};
ACT.logiF = (el) => { S.logi[el.dataset.f] = el.dataset.v; render(); };
IN.logiTr = (el) => { S.logi.tr = el.value; render(); };
/* ---------- the trip form ---------- */
function tripCands(T) {
  /* what can go on this trip: its own links, plus dispatches in the 3 weeks before its date not on any other trip */
  const L = logi(), other = new Set(), otherQ = new Set();
  L.trips.forEach((t) => { if (t.id === T.id) return; (t.orders || []).forEach((i) => other.add(i)); (t.qc || []).forEach((p) => otherQ.add(p)); });
  const lo = addDays(T.date || ymd(NOW()), -21), hi = addDays(T.date || ymd(NOW()), 2);
  const os = D.orders.filter((o) => o.status === "Dispatched" && o.dispatched && (T.orders.includes(o.id) || (!other.has(o.id) && o.dispatched.slice(0, 10) >= Math.max(lo, L.since) && o.dispatched.slice(0, 10) <= hi))).sort((a, b) => (a.dispatched < b.dispatched ? 1 : -1));
  const qs = D.qcPOs.filter((p) => p.deliveredOn && (T.qc.includes(p.po) || (!otherQ.has(p.po) && p.deliveredOn.slice(0, 10) >= Math.max(lo, L.since) && p.deliveredOn.slice(0, 10) <= hi))).sort((a, b) => (a.deliveredOn < b.deliveredOn ? 1 : -1));
  return { os, qs };
}
function tripAuto(T) {
  const os = T.orders.map(orderById).filter(Boolean), qs = T.qc.map((po) => D.qcPOs.find((p) => p.po === po)).filter(Boolean);
  if (!os.length && !qs.length) return null;
  const sellers = [...new Set(os.map((o) => shortOf(o.dist)).concat(qs.map((p) => p.platform)))].join(", ");
  const crates = Math.round((os.reduce((a, o) => a + (o.crates || 0), 0) + qs.reduce((a, p) => a + (p.pcs ? (p.crates * (p.pcsDelivered || 0)) / p.pcs : 0), 0)) * 10) / 10;
  const revenue = Math.round((os.reduce((a, o) => a + (o.value || 0), 0) + qs.reduce((a, p) => a + (p.valueAccepted || 0), 0)) * 100) / 100;
  return { sellers, crates, revenue, type: os.length ? "GT" : "QC" };
}
function tripCalc(T) {
  const tr = transporterOf(T.transporter), A = tripAuto(T);
  if (A) { if (!T.own.sellers) T.sellers = A.sellers; if (!T.own.crates) T.crates = A.crates; if (!T.own.revenue) T.revenue = A.revenue; if (!T.own.type) T.type = A.type; }
  if (T.odoStart != null && T.odoEnd != null && T.odoEnd >= T.odoStart && !T.own.km) T.km = T.odoEnd - T.odoStart;
  if (tr && tr.mode === "km" && !T.own.cost) T.cost = T.km != null ? Math.round(T.km * (tr.rate || 0)) : null;
  if (!T.own.route) T.route = T.type === "QC" ? null : T.km != null ? (T.km >= 260 ? "Long" : "Short") : T.route || null;
  return { tr, A };
}
function lastOdo(name) { const t = logi().trips.filter((x) => key(x.transporter) === key(name) && x.odoEnd != null).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (b.odoEnd || 0) - (a.odoEnd || 0)))[0]; return t ? t.odoEnd : null; }
ACT.tripForm = (el) => {
  const L = logi(), id = el && el.dataset && el.dataset.id, run = el && el.dataset && el.dataset.run, ids = el && el.dataset && el.dataset.orders;
  let T;
  if (id) { const t = L.trips.find((x) => x.id === id); if (!t) return; T = JSON.parse(JSON.stringify(t)); T.orders = T.orders || []; T.qc = T.qc || []; T.own = { sellers: true, crates: true, revenue: true, type: true, km: t.odoStart == null, cost: true, route: true }; T.isNew = false; }
  else {
    const lastGT = L.trips.filter((t) => t.type === "GT" && t.transporter).sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    T = { id: null, date: ymd(NOW()), sellers: "", type: "GT", crates: null, km: null, odoStart: null, odoEnd: null, revenue: null, cost: null, transporter: lastGT ? lastGT.transporter : (L.transporters[0] || {}).name || "", halting: null, route: null, orders: [], qc: [], note: "", own: {}, isNew: true };
    if (run) { const r = unloggedRuns().find((x) => x.date === run); if (r) { T.date = r.date; T.orders = r.orders.slice(); T.qc = r.qc.slice(); } }
    if (ids) { T.orders = ids.split(",").filter(Boolean); const o = orderById(T.orders[0]); if (o && o.dispatched) T.date = o.dispatched.slice(0, 10); }
    if (T.orders.length === 0 && T.qc.length) T.type = "QC";
    const tr = transporterOf(T.transporter); if (tr && tr.mode === "km") T.odoStart = lastOdo(tr.name);
  }
  S.trip = T; tripCalc(T);
  openSheet(T.isNew ? "Log a trip" : "Trip of " + fmtDate(T.date), `<div id="trip-body" class="stack gap-16">${tripBody()}</div>`,
    `${T.isNew ? "" : `<button class="btn btn-danger" data-act="tripDelAsk">Delete</button>`}<button class="btn btn-secondary" data-act="closeSheet">Cancel</button><button class="btn btn-primary" data-act="tripSave">Save trip</button>`, true);
};
function tripBody() {
  const T = S.trip, { tr, A } = tripCalc(T), C = tripCands(T), L = logi(), p = T.revenue > 0 && T.cost != null ? T.cost / T.revenue : null;
  const num = (f, v, ph, extra = "") => `<input class="input num-in" type="number" step="any" min="0" value="${v != null ? v : ""}" placeholder="${ph || ""}" data-in="tripF" data-f="${f}" ${extra}>`;
  const auto = (f) => (A && !T.own[f] ? `<span class="pill plain" style="height:20px;font-size:11px">from the orders</span>` : "");
  const pick = C.os.length || C.qs.length ? `<div class="group" style="max-height:260px;overflow:auto">${C.os.map((o) => `<label class="row" style="cursor:pointer"><input type="checkbox" data-in="tripLink" data-k="o" data-v="${esc(o.id)}" ${T.orders.includes(o.id) ? "checked" : ""}><span class="grow"><div class="row-title clip">${esc(o.dist)}</div><div class="row-sub">Dispatched ${fmtDate(o.dispatched)} · ${nf(o.crates, 1)} crates · ${rs(o.value)}</div></span></label>`).join("")}${C.qs.map((q) => `<label class="row" style="cursor:pointer"><input type="checkbox" data-in="tripLink" data-k="q" data-v="${esc(q.po)}" ${T.qc.includes(q.po) ? "checked" : ""}><span class="grow"><div class="row-title clip">${platDot(q.platform)}${esc(q.platform)} <span class="mono">${esc(q.po)}</span></div><div class="row-sub">Delivered ${fmtDate(q.deliveredOn)} · ${rs(q.valueAccepted || 0)}</div></span></label>`).join("")}</div>` : `<div class="row-sub">No dispatched orders or deliveries around this date that are not already on a trip. Fill in the details below.</div>`;
  return `<div><div class="group-label"><span>1 · What went on this trip</span><span>${T.orders.length + T.qc.length} ticked</span></div>${pick}</div>
    <div><div class="group-label"><span>2 · The trip</span></div><div class="card card-pad"><div class="form-grid">
      <div class="field"><label class="label">Date</label><input class="input" type="date" value="${esc(T.date)}" data-in="tripF" data-f="date"></div>
      <div class="field"><label class="label">Transporter</label><select class="select" data-in="tripF" data-f="transporter">${L.transporters.map((t) => `<option ${key(t.name) === key(T.transporter) ? "selected" : ""}>${esc(t.name)}</option>`).join("")}${T.transporter && !transporterOf(T.transporter) ? `<option selected>${esc(T.transporter)}</option>` : ""}</select></div>
      <div class="field full"><label class="label">Sellers ${auto("sellers")}</label><input class="input" value="${esc(T.sellers || "")}" placeholder="Who the goods went to" data-in="tripF" data-f="sellers"></div>
      <div class="field"><label class="label">Type</label><select class="select" data-in="tripF" data-f="type">${["GT", "QC"].map((x) => `<option ${T.type === x ? "selected" : ""}>${x}</option>`).join("")}</select></div>
      <div class="field"><label class="label">Route</label><select class="select" data-in="tripF" data-f="route"><option value="">${T.type === "QC" ? "Not needed" : "Not set"}</option>${["Short", "Long"].map((x) => `<option ${T.route === x ? "selected" : ""}>${x}</option>`).join("")}</select></div>
      <div class="field"><label class="label">Crates ${auto("crates")}</label>${num("crates", T.crates, "0")}</div>
      <div class="field"><label class="label">Invoiced revenue, excl. GST ${auto("revenue")}</label>${num("revenue", T.revenue, "0.00")}</div>
    </div></div></div>
    <div><div class="group-label"><span>3 · Kilometres and cost</span><span>${tr && tr.mode === "km" ? `${esc(tr.name)}: ₹${tr.rate} per km` : "Amount paid for this trip"}</span></div><div class="card card-pad"><div class="form-grid">
      <div class="field"><label class="label">Odometer at start</label>${num("odoStart", T.odoStart, "Reading at the start")}</div>
      <div class="field"><label class="label">Odometer at end</label>${num("odoEnd", T.odoEnd, "Reading at the end")}</div>
      <div class="field"><label class="label">Km, both ways</label>${num("km", T.km, "0")}</div>
      <div class="field"><label class="label">Logistics cost (₹)${tr && tr.mode === "km" && !T.own.cost ? ` <span class="pill plain" style="height:20px;font-size:11px">km × ₹${tr.rate}</span>` : ""}</label>${num("cost", T.cost, tr && tr.mode === "km" ? "Fills in from the km" : "What you paid")}</div>
      <div class="field"><label class="label">Halting time, hours after the first free hour</label>${num("halting", T.halting, "0")}</div>
      <div class="field"><label class="label">Note</label><input class="input" value="${esc(T.note || "")}" data-in="tripF" data-f="note" placeholder="Optional"></div>
    </div>
    <div class="hstack gap-12 wrap" style="margin-top:14px" id="trip-sum">${tripSum(T)}</div></div></div>`;
}
const tripSum = (T) => { const p = T.revenue > 0 && T.cost != null ? T.cost / T.revenue : null; return `<span class="pill ${p == null ? "plain" : p > 0.06 ? "bad" : p > 0.045 ? "warn" : "good"}">${p != null ? pct(p, 2) + " of revenue" : "Add revenue and cost to see the %"}</span>${T.crates > 0 && T.cost != null ? `<span class="pill plain">${rs2(T.cost / T.crates)} per crate</span>` : ""}${T.km > 0 && T.cost != null ? `<span class="pill plain">${rs2(T.cost / T.km)} per km</span>` : ""}`; };
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
  const rec = { id: nid, date: T.date, sellers: T.sellers || (tripAuto(T) || {}).sellers || "", type: T.type || "GT", crates: T.crates, km: T.km, odoStart: T.odoStart, odoEnd: T.odoEnd, revenue: T.revenue, cost: T.cost, rate: (transporterOf(T.transporter) || {}).mode === "km" ? transporterOf(T.transporter).rate : null, transporter: T.transporter || "", halting: T.halting, route: T.type === "QC" ? T.route || null : T.route || null, orders: T.orders.slice(), qc: T.qc.slice(), source: T.isNew ? "app" : T.source || "app", note: T.note || "" };
  const i = L.trips.findIndex((x) => x.id === rec.id); if (i >= 0) { rec.source = L.trips[i].source || rec.source; L.trips[i] = rec; } else L.trips.push(rec);
  logActivity(i >= 0 ? "Trip updated" : "Trip logged", fmtDate(rec.date), `${rec.sellers} · ${rec.cost != null ? rs(rec.cost) : "cost not added"}${tripPct(rec) != null ? " · " + pct(tripPct(rec), 1) : ""}`);
  S.trip = null; closeSheet(); if (S.route === "logistics") render(); else render();
  toast(rec.cost != null ? `Trip saved · ${tripPct(rec) != null ? pct(tripPct(rec), 1) + " of revenue" : rs(rec.cost)}` : "Trip saved. Add the cost when you have it", "truck");
};
ACT.tripDelAsk = () => { part("trip-sum", `<div class="confirm" style="width:100%"><span><b>Delete this trip?</b> Its orders go back to "no trip logged".</span><span class="hstack gap-8"><button class="btn btn-sm btn-secondary" data-act="tripDelNo">Keep it</button><button class="btn btn-sm btn-danger" data-act="tripDel">Delete</button></span></div>`); };
ACT.tripDelNo = () => part("trip-sum", tripSum(S.trip));
ACT.tripDel = () => { const L = logi(), T = S.trip; L.trips = L.trips.filter((x) => x.id !== T.id); logActivity("Trip deleted", fmtDate(T.date), T.sellers || ""); S.trip = null; closeSheet(); render(); toast("Trip deleted"); };
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
  if (S.route === "home") return "";
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

/* ===== shell markup (sidebar + phone tab bar), then first render ===== */
(function buildShell() {
  const item = (r, extra = "") => `<button class="nav-item" data-act="nav" data-to="${r}" data-nav="${r}">${ic(ROUTES[r].icon)}<span>${ROUTES[r].label}</span>${extra}</button>`;
  $("#sidebar").innerHTML = `<div class="brand"><img src="${LOGO}" alt=""><div><div class="brand-name">Sahi<span>Reach</span></div><div class="brand-sub">Order Tool</div></div></div>
    ${item("home")}
    <div class="nav-label">Sell</div>${item("orders")}${item("dispatch", `<span class="nav-badge hot" id="badge-dispatch" hidden></span>`)}${item("quick", `<span class="nav-badge" id="badge-quick" hidden></span>`)}
    <div class="nav-label">Stock</div>${item("stock")}${item("replenish")}
    <div class="nav-label">Money</div>${item("tod")}${item("logistics")}
    <div class="nav-label">Manage</div>${item("setup")}
    <div class="side-foot"><button class="nav-item" data-act="cmd">${ic("search")}<span>Search</span><span class="nav-badge">⌘K</span></button><${HOST ? 'button class="me me-btn" data-act="account" aria-label="Account"' : 'div class="me"'}><span class="avatar">${esc(initials(ME.name).slice(0, 1) || "S")}</span><span class="grow" style="text-align:left;min-width:0"><span class="clip" style="display:block;font-weight:600;font-size:14px">${esc(ME.name)}</span><span class="brand-sub" style="display:block">SahiReach LLP</span></span>${HOST ? ic("chevR", "sm chev") : ""}</${HOST ? "button" : "div"}></div>`;
  const tab = (r, label) => `<button class="tab" data-act="nav" data-to="${r}" data-nav="${r}">${ic(ROUTES[r].icon)}<span>${label}</span></button>`;
  $("#tabbar").innerHTML = tab("home", "Home") + tab("orders", "Orders") + tab("dispatch", "Dispatch") + tab("stock", "Stock") + tab("more", "More");
})();
go(ROUTES[location.hash.slice(1)] ? location.hash.slice(1) : "home");

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
const SAVE = { on: false, why: "", version: null, last: null, busy: false, again: false, timer: 0, state: "", conflict: false };
(function initSave() {
  if (!HOST) return;
  if (!HOST.save || HOST.version == null) { SAVE.why = "setup"; return; }
  if (DATA_OLD) { SAVE.why = "old"; return; }
  SAVE.on = true; SAVE.version = HOST.version; SAVE.last = snapshot();
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
  const s = snapshot(); if (s === SAVE.last) return;
  SAVE.busy = true; setSaveState("saving");
  try {
    const r = await HOST.save(s, SAVE.version);
    SAVE.version = r && typeof r.version === "number" ? r.version : SAVE.version + 1; SAVE.last = s; setSaveState("saved");
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

if (HOST && !SAVE.on) setSaveState("off", SAVE.why === "setup" ? "Saving is off · database step needed" : "Load the new data file to start saving");
