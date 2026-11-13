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
  qcTab: "open", qcPlatform: "Swiggy", qcPicked: {}, qcOwn: true,
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
  $("#view").innerHTML = VIEWS[S.route]();
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
    f.push({ date: r.date, ch: "gt", dist: canonDist(r.dist), sap: r.sap, product: r.product, crates: r.crates || 0, value: r.value || 0, tod: 0, cost: uc != null ? ea * uc : 0, ref: r.inv, kind: r.type === "Credit Note" ? "return" : "vyapar" });
  });
  D.orders.forEach((o) => {
    if (o.status !== "Dispatched" || !o.dispatched) return;
    const dt = o.dispatched.slice(0, 10);
    (linesByOrder[o.id] || []).forEach((l) => { const uc = unitCost(l.sap); f.push({ date: dt, ch: "gt", dist: o.dist, sap: l.sap, product: l.product, crates: l.crates || 0, value: l.value || 0, tod: l.tod || 0, cost: uc != null ? (l.ea || 0) * uc : 0, ref: o.id, kind: "order" }); });
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
  const F = factsIn(facts, from, to), s = { facts: F, net: 0, gt: 0, swiggy: 0, zepto: 0, crates: 0, gtCrates: 0, toolCrates: 0, qcCrates: 0, gpGT: 0, gpQC: 0, tod: 0, returns: 0, orders: new Set(), dists: new Set(), missed: 0, qcOrdered: 0, qcAccepted: 0, o2d: [], qcDeliveries: new Set() };
  if (!from) return s;
  F.forEach((f) => {
    s.net += f.value; s[f.ch] += f.value; s.crates += f.crates;
    if (f.ch === "gt") { s.gtCrates += f.crates; if (f.kind === "order") s.toolCrates += f.crates; s.gpGT += f.value + f.tod - f.cost; s.tod += f.tod; if (f.kind === "note" || f.kind === "return") s.returns += -f.value; else { s.orders.add(f.ref); if (f.value > 0) s.dists.add(f.dist); } }
    else { s.qcCrates += f.crates; s.gpQC += f.value * QC_GP_RATE; s.qcDeliveries.add(f.ref); }
  });
  const ch = S.dash.ch, dsel = S.dash.district;
  if (ch === "all" || ch === "gt") D.oos.forEach((o) => { const ord = D.orders.find((x) => x.id === o.id), d = ord && ord.status === "Dispatched" && ord.dispatched ? ord.dispatched.slice(0, 10) : null; if (typeof o.missed === "number" && d && d >= from && d <= to && (dsel === "all" || districtOf(o.dist) === dsel)) s.missed += o.missed; });
  if (dsel === "all" && ch !== "gt") D.qcPOs.forEach((p) => { const d = (p.deliveredOn || (p.status === "Lapsed" ? p.expiry : "") || "").slice(0, 10); if (!d || d < from || d > to) return; if ((ch === "swiggy" || ch === "zepto") && p.platform.toLowerCase() !== ch) return; s.qcOrdered += p.pcs || 0; s.qcAccepted += p.pcsAccepted || 0; });
  D.orders.forEach((o) => { if (o.status === "Dispatched" && o.dispatched && o.dispatched.slice(0, 10) >= from && o.dispatched.slice(0, 10) <= to && (ch === "all" || ch === "gt") && (dsel === "all" || districtOf(o.dist) === dsel)) s.o2d.push((toDate(o.dispatched) - toDate(o.time)) / 864e5); });
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

/* ===== charts (inline SVG, one y-axis each, hover layer, table twin) ===== */
const cssVar = (n) => `var(${n})`;
const isNarrow = () => window.innerWidth < 720;
function niceScale(v) { for (let k = -2; k < 9; k++) for (const s of [1, 2, 5]) { const step = s * Math.pow(10, k), n = Math.ceil(v / step - 1e-9); if (n <= 5) return { step, n, max: n * step }; } return { step: v, n: 1, max: v }; }
function chartCard(id, title, sub, legend, chartHtml, tableHtml) {
  const mode = S.chartMode[id] || "chart";
  return `<div class="card"><div class="card-head"><div><div class="card-title">${title}</div><div class="card-sub">${sub}</div></div>
    <div class="seg"><button data-act="chartMode" data-id="${id}" data-mode="chart" aria-pressed="${mode === "chart"}">Chart</button><button data-act="chartMode" data-id="${id}" data-mode="table" aria-pressed="${mode === "table"}">Table</button></div></div>
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
function lowStockRows() { return D.repl.rows.filter((r) => { const st = stockBySap[r.sap]; if (!st || !st.upc || !["Hero", "Core"].includes(r.cls)) return false; return st.ea / st.upc < (r.rop || 0); }); }
function quietDistributors(facts) {
  const today = ymd(NOW()), last = {};
  facts.forEach((f) => { if (f.ch === "gt" && f.kind !== "note" && f.value > 0 && (!last[f.dist] || f.date > last[f.dist])) last[f.dist] = f.date; });
  return Object.keys(last).filter((n) => { const d = daysBetween(last[n], today); return d > 14 && d <= 60; }).map((n) => ({ name: n, last: last[n], days: daysBetween(last[n], today) })).sort((a, b) => a.days - b.days);
}
function attention(facts) {
  const out = [];
  const R = D.repl, cls = R.decision.includes("NOW") ? "bad" : R.decision.includes("SOON") ? "warn" : "tint";
  out.push({ ic: "cycle", cls, title: `Hangyo truck: ${R.decision.toLowerCase().replace(/^./, (c) => c.toUpperCase())}`, sub: `${R.belowRop} Hero/Core SKUs below reorder point · plan is ${R.total} of ${R.truck} crates`, go: "replenish" });
  const pend = pendingOrders();
  if (pend.length) out.push({ ic: "truck", cls: "tint", title: `${pend.length} order${pend.length > 1 ? "s" : ""} waiting to dispatch`, sub: `${nf(pend.reduce((a, o) => a + o.crates, 0), 2)} crates · ${rs(pend.reduce((a, o) => a + o.value, 0))}`, go: "dispatch" });
  const open = openQC(), soon = open.filter((p) => daysLeft(p) <= 3 && daysLeft(p) >= 0), exp = open.filter((p) => daysLeft(p) < 0);
  const byP = ["Swiggy", "Zepto"].map((p) => [p, open.filter((x) => x.platform === p).length]).filter((x) => x[1]);
  if (open.length) out.push({ ic: "bolt", cls: soon.length || exp.length ? "warn" : "info", title: `${byP.map(([p, n]) => n + " " + p).join(" and ")} PO${open.length > 1 ? "s" : ""} open`, sub: `${soon.length} expire within 3 days${exp.length ? ` · ${exp.length} past expiry` : ""}`, go: "quick" });
  const low = lowStockRows();
  if (low.length) out.push({ ic: "box", cls: "bad", title: `${low.length} product${low.length > 1 ? "s" : ""} below reorder point`, sub: low.slice(0, 2).map((r) => shortName(r.name).split("(")[0].trim()).join(", ") + (low.length > 2 ? " and more" : ""), go: "replenish" });
  const quiet = quietDistributors(facts);
  if (quiet.length) out.push({ ic: "people", cls: "warn", title: `${quiet.length} distributor${quiet.length > 1 ? "s" : ""} gone quiet`, sub: quiet.slice(0, 2).map((q) => shortOf(q.name)).join(", ") + (quiet.length > 2 ? " and more" : "") + ` · nothing dispatched for ${quiet[0].days}+ days`, go: "setup" });
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
  if (showGT) tiles.push(tile("o2d", "Order to dispatch", cur.o2dAvg != null ? nf(cur.o2dAvg, 1) : "–", cur.o2dAvg != null ? "days" : "", `${cur.o2d.length} order${cur.o2d.length === 1 ? "" : "s"} dispatched`, ""));
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
    <div><div class="group-label"><span>Needs attention today</span></div><div class="attn">${attention(facts).map((a) => `<button class="attn-card" data-act="nav" data-to="${a.go}"><span class="attn-ic ${a.cls}">${ic(a.ic)}</span><span class="grow"><div class="attn-title">${esc(a.title)}</div><div class="attn-sub">${esc(a.sub)}</div></span>${ic("chevR", "sm dim")}</button>`).join("")}</div></div>
    <div class="sec-head"><div><div class="section-title">Sales</div><div class="section-sub">Excluding GST · distributors when dispatched, Swiggy and Zepto when delivered</div></div></div>
    ${filterBar(R)}
    <div class="card hero"><div class="hero-left"><div class="tile-label">Net sales · ${esc(R.label)}${filterNote ? " · " + esc(filterNote) : ""}</div><div class="hero-figure">₹${lakh(cur.net)}<small>lakh</small></div>${deltaChip(chgTxt(cur.net, prev.net, cmp))}<div class="tile-sub" style="margin-top:6px">${R.pFrom ? `${esc(cmp.replace(/^the /, "The "))}: ₹${lakh(prev.net)} L` : `Since ${fmtDate(R.from)} ${R.from.slice(0, 4)}`}${pace}</div></div>
      <div class="hero-right">${n > 1 ? `<div class="legend" style="margin:4px 0 6px 34px"><span><i class="kl" style="background:var(--s-gt)"></i>${esc(R.label)}</span>${R.pFrom ? `<span><i class="kl" style="background:var(--s-prev)"></i>${esc(cmp.replace(/^the /, ""))}</span>` : ""}<span class="dim">Cumulative ₹ lakh</span></div>${S.chartMode.line === "table" ? `<div style="overflow:auto;max-height:240px">${lineTable}</div>` : lineChart(lineData)}` : `<div class="legend" style="margin:8px 0 10px">Today so far, by channel</div>${bars(barRows)}`}</div></div>
    <div class="tiles tiles-4">${tiles.join("")}</div>
    <div class="grid-2">
      ${chartCard("months", "Sales by month and channel", "₹ lakh · *this month so far" + (filterNote ? " · " + esc(filterNote) : ""), legendSeries, monthChart(months), monthTable)}
      <div class="card"><div class="card-head"><div><div class="card-title">${F.ch === "all" ? "Districts and quick commerce" : showGT ? "By district" : "By platform"}</div><div class="card-sub">${esc(R.label)}${cmp ? " against " + esc(cmp) : ""}</div></div><div class="legend"><span><i style="background:var(--s-gt)"></i>Now</span>${cmp ? `<span><i style="background:var(--s-prev)"></i>Before</span>` : ""}</div></div><div class="card-pad" style="padding-top:10px">${barRows.length ? bars(barRows) : `<div class="empty" style="padding:24px">No sales in this period.</div>`}</div></div>
    </div>
    <div class="grid-2">
      ${showGT ? `<div><div class="group-label"><span>Top distributors · ${esc(R.label)}</span><button class="btn-plain" style="height:auto;font-size:13px;font-weight:600" data-act="drill" data-k="gt">See all</button></div><div class="group">${topD.length ? topD.map((x, i) => { const pv = dPrev[x.key] ? dPrev[x.key].value : 0; return `<button class="row" data-act="distSheet" data-name="${esc(x.key)}"><span class="avatar soft">${i + 1}</span><span class="grow"><div class="row-title clip">${esc(x.key)}</div><div class="bar-cell" style="margin-top:5px"><div class="meter"><i style="width:${(x.value / maxD) * 100}%"></i></div><span class="row-sub nowrap">${esc(districtOf(x.key))} · ${x.refs.size} order${x.refs.size === 1 ? "" : "s"}</span></div></span><span class="row-end"><span><div class="row-value">₹${lakh(x.value)} L</div><div>${pv > 0 ? growthChip(x.value / pv - 1) : cmp ? growthChip("New") : ""}</div></span></span></button>`; }).join("") : `<div class="empty" style="padding:24px">No distributor sales in this period.</div>`}</div></div>` : ""}
      <div><div class="group-label"><span>Top products · ${esc(R.label)}</span><button class="btn-plain" style="height:auto;font-size:13px;font-weight:600" data-act="drill" data-k="products">See all</button></div><div class="group">${topP.length ? topP.map((x, i) => { const dl = daysLeftOf(x.key, x.crates); return `<div class="row"><span class="avatar soft">${i + 1}</span><span class="grow"><div class="row-title clip">${esc(shortName(pName(x.key)))}</div><div class="bar-cell" style="margin-top:5px"><div class="meter"><i style="width:${(x.value / maxP) * 100}%"></i></div><span class="row-sub nowrap">${nf(x.crates, 0)} crates${dl != null ? " · " + nf(dl, 0) + " days of stock" : ""}</span></div></span><span class="row-end"><span><div class="row-value">₹${lakh(x.value)} L</div><div>${classPill((replBySap[x.key] || {}).cls)}</div></span></span></div>`; }).join("") : `<div class="empty" style="padding:24px">No product sales in this period.</div>`}</div></div>
    </div>
    ${momCard(facts)}
  </div>`;
};
function momCard(facts) {
  const months = monthsSeries(facts).map((m) => { const from = m.k + "-01", t = toDate(from), to = ymd(new Date(t.getFullYear(), t.getMonth() + 1, 0)); const s = periodStats(facts, from, to < ymd(NOW()) ? to : ymd(NOW())); s.pur = purchasesIn(from, to).total; return { m, s }; });
  const rows = [
    ["Net sales", (s) => rs(s.net)], ["Distributor sales (GT)", (s) => rs(s.gt)], ["Swiggy", (s) => rs(s.swiggy)], ["Zepto", (s) => rs(s.zepto)],
    ["GT orders dispatched", (s) => nf(s.orders.size)], ["Average GT order", (s) => rs(s.avgOrder)], ["Active distributors", (s) => nf(s.dists.size)],
    ["Crates moved", (s) => nf(s.crates, 0)], ["Gross profit", (s) => rs(s.gp)], ["Gross margin", (s) => (s.margin != null ? pct(s.margin, 1) : "–")],
    ["Fill rate, distributors", (s) => (s.fillGT != null ? pct(s.fillGT, 1) : "–")], ["Fill rate, quick commerce", (s) => (s.fillQC != null ? pct(s.fillQC, 1) : "–")],
    ["Missed sales (crates)", (s) => nf(s.missed, 1)], ["Returns and credit notes", (s) => rs(s.returns)], ["TOD earned", (s) => rs(s.tod)], ["Purchases from Hangyo", (s) => rs(s.pur)],
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
    const g = {}; cur.facts.forEach((f) => { const k2 = f.ch === "gt" ? f.dist : CH_LABEL[f.ch], x = (g[k2] = g[k2] || { k: k2, v: 0, gp: 0, tod: 0 }); x.v += f.value; x.tod += f.tod; x.gp += f.ch === "gt" ? f.value + f.tod - f.cost : f.value * QC_GP_RATE; });
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

/* ===== ORDERS: list, detail, sales order, new / edit order ===== */
const UNIT_LABEL = { Crate: "Crates", "EA (Box)": "Boxes", Pieces: "Pieces" };
const vehicleFor = (c) => (c <= 0 ? null : c <= 62 ? "Bada Dost (up to 62 crates)" : c <= 80 ? "10 ft truck (up to 80 crates)" : c <= 162 ? "Mahindra Furio 12 ft (up to 162 crates)" : c <= 189 ? "Bharat Benz 14 ft (up to 189 crates)" : c <= 270 ? "Bharat Benz 1217 16 ft (up to 270 crates)" : "Over 270 crates: split into more than one trip");
const orderById = (id) => D.orders.find((o) => o.id === id);

function ordersList() {
  const q = key(S.ordersQ), tab = S.ordersTab;
  const list = D.orders.filter((o) => (tab === "All" || o.status === tab) && (!q || key(o.dist).includes(q) || key(o.id).includes(q))).slice().sort((a, b) => (a.time < b.time ? 1 : -1));
  if (!list.length) return `<div class="group"><div class="empty"><div class="big">${tab === "Pending" ? "Nothing waiting" : "No orders found"}</div>${tab === "Pending" ? "Every order has been dispatched. New orders show up here until the truck leaves." : "Try another name or order number."}</div></div>`;
  const groups = []; let cur = null;
  list.forEach((o) => { const k = dayKey(toDate(o.time)); if (!cur || cur.k !== k) { cur = { k, label: dayLabel(o.time), items: [] }; groups.push(cur); } cur.items.push(o); });
  return groups.map((g) => `<div><div class="group-label"><span>${esc(g.label)}</span><span class="num">${g.items.length} order${g.items.length > 1 ? "s" : ""} · ${rs(g.items.reduce((a, o) => a + (o.status === "Cancelled" ? 0 : o.value), 0))}</span></div><div class="group">${g.items.map((o) => `<button class="row" data-act="orderSheet" data-id="${o.id}"><span class="avatar soft">${esc(initials(o.dist))}</span><span class="grow"><div class="row-title clip">${esc(o.dist)}</div><div class="row-sub clip">${fmtTime(o.time)} · ${o.lines} line${o.lines === 1 ? "" : "s"} · ${nf(o.crates)} crates${o.timesEdited ? " · edited" : ""}</div></span><span class="row-end"><span class="c-hide">${statusPill(o.status)}</span><span class="row-value">${rs(o.value)}</span>${ic("chevR", "sm chev")}</span></button>`).join("")}</div></div>`).join("");
}
VIEWS.orders = () => {
  const count = (s) => D.orders.filter((o) => o.status === s).length;
  return `<div class="page narrow">
    <div class="page-head"><div><h1 class="title">Orders</h1><div class="subtitle">Every distributor order, newest first. Pending orders can still be edited or cancelled.</div></div><div class="head-actions"><button class="btn btn-primary" data-act="newOrder">${ic("plus", "sm")} New order</button></div></div>
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
    <div class="card card-pad"><div class="hstack gap-12" style="align-items:flex-start"><span class="avatar lg soft">${esc(initials(o.dist))}</span><div class="grow"><div class="section-title" style="font-size:19px">${esc(o.dist)}</div><div class="row-sub">${esc(d.district || "")}${d.pay ? " · " + esc(d.pay) : ""}${d.credit != null ? " · " + d.credit + " days credit" : ""}</div><div style="margin-top:8px" class="hstack gap-8 wrap">${statusPill(o.status)}<span class="mono dim">${esc(o.id)}</span></div></div></div>
      <div class="divider" style="margin:16px 0"></div>
      <div class="kv"><div><div class="k">Crates</div><div class="v num">${nf(o.crates)}</div></div><div><div class="k">Value excl. GST</div><div class="v num">${rs2(o.value)}</div></div><div><div class="k">GST 5%</div><div class="v num">${rs2(o.value * 0.05)}</div></div><div><div class="k">Total incl. GST</div><div class="v num">${rs2(o.value * 1.05)}</div></div>${o.tod ? `<div><div class="k">TOD to claim</div><div class="v num">${rs2(o.tod)}</div></div>` : ""}</div></div>
    ${confirmCancel ? `<div class="confirm"><span><b>Cancel this order?</b> ${nf(o.crates)} crates go back into stock. This cannot be undone.</span><span class="hstack gap-8"><button class="btn btn-sm btn-secondary" data-act="orderSheet" data-id="${id}">Keep order</button><button class="btn btn-sm btn-danger" data-act="cancelOrderYes" data-id="${id}">Cancel order</button></span></div>` : ""}
    ${o.notes ? `<div class="banner info">${ic("info", "sm")}<span>${esc(o.notes)}</span></div>` : ""}
    <div><div class="group-label"><span>Timeline</span></div><div class="card card-pad"><div class="timeline">${tl.join("")}</div></div></div>
    ${lines.length ? `<div><div class="group-label"><span>${lines.length} line${lines.length > 1 ? "s" : ""}</span><span>${nf(lines.reduce((a, l) => a + (l.crates || 0), 0))} crates</span></div><div class="group">${lines.map((l) => `<div class="row"><span class="grow"><div class="row-title clip">${esc(shortName(l.product))}</div><div class="row-sub">${nf(l.crates, 2)} crate${l.crates === 1 ? "" : "s"} · ${nf(l.ea)} boxes × ${rs2(l.billed)}${l.tod ? ` · TOD ${rs2(l.tod)}` : ""}</div></span><span class="row-end"><span class="row-value">${rs2(l.value)}</span></span></div>`).join("")}</div></div>` : ""}
    ${missed.length ? `<div><div class="group-label"><span>Not supplied in full</span></div><div class="group">${missed.map((m) => `<div class="row"><span class="attn-ic warn" style="width:28px;height:28px">${ic("alert", "sm")}</span><span class="grow"><div class="row-title clip">${esc(shortName(m.product))}</div><div class="row-sub">${esc(m.reason)}</div></span>${typeof m.missed === "number" ? `<span class="row-end"><span class="pill warn plain">${m.missed} missed</span></span>` : ""}</div>`).join("")}</div></div>` : ""}`;
  const foot = `<button class="btn btn-secondary" data-act="soPreview" data-id="${id}">${ic("doc", "sm")} Sales order</button>${o.status === "Pending" ? `<button class="btn btn-danger" data-act="cancelOrderAsk" data-id="${id}">Cancel order</button><button class="btn btn-primary" data-act="editOrder" data-id="${id}">${ic("pencil", "sm")} Edit order</button>` : ""}`;
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
      <div style="text-align:right"><h2>SALES ORDER</h2><div class="mono">${esc(o.id.replace("ORD", "SO"))}</div><div>${fmtDate(o.time)} ${toDate(o.time).getFullYear()}</div></div></div>
    <div style="display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:18px;margin-top:22px"><div><div class="lab">Bill to</div><b>${esc(o.dist)}</b><br>${esc(d.district || "")}, Kerala${d.phone ? "<br>Phone " + esc(d.phone) : ""}</div><div><div class="lab">Payment</div>${esc(d.pay || "–")}<br>${d.credit != null ? d.credit + " days credit" : ""}${due ? "<br>Due " + fmtDate(due) : ""}</div><div><div class="lab">Dispatch from</div>Tropicana Logistics cold store<br>${nf(o.crates)} crates · ${esc((vehicleFor(o.crates) || "").split(" (")[0])}</div></div>
    <table><thead><tr><th>#</th><th>Product</th><th>HSN</th><th class="r">Crates</th><th class="r">Boxes</th><th class="r">Rate / box</th><th class="r">Amount</th></tr></thead><tbody>${lines.map((l, i) => `<tr><td>${i + 1}</td><td>${esc(l.product)}</td><td>${esc((stockBySap[l.sap] || {}).hsn || "21050000")}</td><td class="r">${nf(l.crates, 2)}</td><td class="r">${nf(l.ea)}</td><td class="r">${inr2.format(l.billed || 0)}</td><td class="r">${inr2.format(l.value || 0)}</td></tr>`).join("")}</tbody></table>
    <div class="tot"><div><span>Value excl. GST</span><span class="r">${inr2.format(o.value)}</span></div><div><span>GST @ 5%</span><span class="r">${inr2.format(o.value * 0.05)}</span></div><div class="g"><span>Total (₹)</span><span class="r">${inr2.format(o.value * 1.05)}</span></div></div>
    <div style="margin-top:26px;color:#6e6e73;font-size:11px">This is a sales order, not a tax invoice. Prices are the South Kerala distributor rate, excluding GST.</div></div></div>`;
  openSheet("Sales order", `<div class="banner tint">${ic("info", "sm")}<span><b>Draft layout.</b> In the real build every saved order produces this as a PDF you can download or share. I will match it to your own sales order format once you send it.</span></div>${paper}`, `<button class="btn btn-secondary" data-act="orderSheet" data-id="${o.id}">${ic("chevL", "sm")} Back to order</button>`, true);
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
  return `<div class="results">${list.map((x) => `<button class="res" data-act="addLine" data-sap="${x.c.sap}"><span class="stock-badge ${x.crates == null ? "none" : x.crates <= 0 ? "zero" : ""}">${x.crates == null ? "–" : nf(Math.floor(x.crates))}</span><span class="grow"><div class="row-title clip">${esc(x.c.name)}</div><div class="row-sub">${esc(x.c.cat || "")} · ${x.crates == null ? "not stocked, logged as demand" : x.crates <= 0 ? "out of stock" : "crates in stock"}${price(x.c.sap) != null ? " · " + rs2(price(x.c.sap)) + " / box" : " · no list price"}</div></span>${ic("plus", "sm dim")}</button>`).join("")}</div>`;
}
function lineCalcHtml(r, i) {
  let msg = "";
  if (r.status === "notstocked") msg = `<div class="line-msg warn">${ic("info", "sm")} Not in your range. It will be logged as demand, nothing is supplied.</div>`;
  else if (r.status === "out") msg = `<div class="line-msg bad">${ic("alert", "sm")} Out of stock. The ${r.req} crate${r.req > 1 ? "s" : ""} will be logged as a missed sale.</div>`;
  else if (r.status === "short") msg = `<div class="line-msg warn">${ic("alert", "sm")} Only ${nf(r.avail, 2)} crate${r.avail === 1 ? "" : "s"} in stock. ${nf(r.req - r.avail, 2)} will be logged as missed.</div>`;
  if (r.needPrice) msg += `<div class="line-msg bad">${ic("tag", "sm")} No price in the South Kerala list. Price per box: <input class="input sm num-in" style="width:110px" id="mp-${i}" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00" value="${r.ln.manual || ""}" data-in="manualPrice" data-i="${i}"></div>`;
  return `<div class="line-val"><div class="row-value">${r.value != null && r.qty && r.supply > 0 ? rs2(r.value) : "–"}</div><div class="row-sub">${r.stocked && r.qty ? `${nf(r.supply, 2)} crate${r.supply === 1 ? "" : "s"} · ${nf(r.ea)} boxes` : ""}</div></div>${msg}`;
}
function linesHtml(C) {
  if (!C.rows.length) return `<div class="empty"><div class="big">No products yet</div>Search above to add the first one. Products in stock come first.</div>`;
  return C.rows.map((r, i) => `<div class="line"><div class="grow" style="min-width:0"><div class="row-title clip">${esc(r.c.name || r.ln.name)}</div><div class="row-sub">${r.stocked ? `${r.upc} boxes per crate · ${nf(Math.floor(r.avail + (0)), 0)} crates available` : "Not stocked"}${r.special != null ? ` · <span style="text-decoration:line-through">${rs2(r.normal)}</span> ${rs2(r.special)} / box` : r.billed != null ? ` · ${rs2(r.billed)} / box` : ""}</div></div>
    <div class="line-qty"><div class="stepper"><button data-act="step" data-i="${i}" data-d="-1" aria-label="Less">${ic("minus", "sm")}</button><input id="qty-${i}" type="number" inputmode="numeric" min="0" value="${r.ln.qty}" data-in="qty" data-i="${i}" aria-label="Quantity"><button data-act="step" data-i="${i}" data-d="1" aria-label="More">${ic("plus", "sm")}</button></div>
      <select class="select sm" style="width:104px" id="unit-${i}" data-in="unit" data-i="${i}" aria-label="Unit">${Object.keys(UNIT_LABEL).map((u) => `<option value="${u}" ${u === r.ln.unit ? "selected" : ""}>${UNIT_LABEL[u]}</option>`).join("")}</select>
      <button class="icon-btn" data-act="rmLine" data-i="${i}" aria-label="Remove line">${ic("trash", "sm")}</button></div>
    <div id="calc-${i}" style="display:contents">${lineCalcHtml(r, i)}</div></div>`).join("");
}
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
    <div class="split">
      <div class="stack gap-20">
        <div><div class="group-label"><span>1 · Who is it for</span></div>
          ${d ? `<div class="card card-pad">${distCard(d)}</div>` : `<div class="stack gap-10"><div class="search">${ic("search", "sm")}<input class="input" id="dist-q" type="search" placeholder="Search distributors" value="${esc(dr.dq)}" data-in="distQ" autocomplete="off"></div><div id="dist-results">${distResults()}</div></div>`}</div>
        ${d ? `<div><div class="group-label"><span>2 · What are they ordering</span>${last && !dr.lines.length ? `<button class="btn-plain" style="height:auto;font-size:13px;font-weight:600" data-act="repeatLast" data-id="${last.id}">${ic("repeat", "sm")} Repeat order of ${fmtDate(last.time)}</button>` : ""}</div>
          <div class="stack gap-10"><div class="search">${ic("search", "sm")}<input class="input" id="prod-q" type="search" placeholder="Add a product. Try mango, or van cone" value="${esc(dr.q)}" data-in="prodQ" autocomplete="off"></div><div id="prod-results">${productResults()}</div>
          <div class="group" id="order-lines">${linesHtml(C)}</div></div></div>` : ""}
      </div>
      <div class="sticky"><div class="card card-pad" id="order-summary">${summaryHtml(C)}</div></div>
    </div></div>`;
};
function refreshOrderCalc() { const C = calcDraft(); C.rows.forEach((r, i) => part("calc-" + i, lineCalcHtml(r, i))); part("order-summary", summaryHtml(C)); }
function refreshOrderLines() { const C = calcDraft(); part("order-lines", linesHtml(C)); part("order-summary", summaryHtml(C)); }
IN.distQ = (el) => { S.draft.dq = el.value; part("dist-results", distResults()); };
IN.prodQ = (el) => { S.draft.q = el.value; part("prod-results", productResults()); };
IN.qty = (el) => { S.draft.lines[+el.dataset.i].qty = el.value === "" ? "" : Math.max(0, +el.value); refreshOrderCalc(); };
IN.unit = (el) => { S.draft.lines[+el.dataset.i].unit = el.value; refreshOrderLines(); };
IN.manualPrice = (el) => { S.draft.lines[+el.dataset.i].manual = +el.value || 0; const C = calcDraft(); part("order-summary", summaryHtml(C)); const r = C.rows[+el.dataset.i], cell = $("#calc-" + el.dataset.i + " .line-val .row-value"); if (cell) cell.textContent = r.value != null ? rs2(r.value) : "–"; };
ACT.pickDist = (el) => { S.draft.dist = el.dataset.name; const d = distByKey[key(el.dataset.name)]; S.draft.lines.forEach((l) => { l.unit = l.unit || d.uom || "Crate"; }); render(); const p = $("#prod-q"); if (p && window.matchMedia("(min-width: 961px)").matches) p.focus(); };
ACT.clearDist = () => { S.draft.dist = null; S.draft.dq = ""; render(); };
ACT.addLine = (el) => {
  const sap = el.dataset.sap, c = catBySap[sap], d = distByKey[key(S.draft.dist)] || {};
  const ex = S.draft.lines.find((l) => l.sap === sap);
  if (ex) ex.qty = (+ex.qty || 0) + 1; else S.draft.lines.push({ sap, name: c.name, qty: 1, unit: d.uom || "Crate", manual: 0 });
  S.draft.q = ""; const inp = $("#prod-q"); if (inp) inp.value = ""; part("prod-results", ""); refreshOrderLines();
  const i = ex ? S.draft.lines.indexOf(ex) : S.draft.lines.length - 1, q = $("#qty-" + i); if (q && window.matchMedia("(min-width: 961px)").matches) { q.focus(); q.select(); }
};
ACT.step = (el) => { const l = S.draft.lines[+el.dataset.i]; l.qty = Math.max(0, (+l.qty || 0) + +el.dataset.d); const q = $("#qty-" + el.dataset.i); if (q) q.value = l.qty; refreshOrderCalc(); };
ACT.rmLine = (el) => { S.draft.lines.splice(+el.dataset.i, 1); refreshOrderLines(); };
ACT.clearDraft = () => { const was = S.draft.editId; S.draft = newDraft(); if (was) go("orders"); else render(); };
ACT.repeatLast = (el) => { const d = distByKey[key(S.draft.dist)] || {}; S.draft.lines = (linesByOrder[el.dataset.id] || []).map((l) => ({ sap: l.sap, name: l.product, qty: l.qty, unit: l.unit || d.uom || "Crate", manual: 0 })); refreshOrderLines(); toast("Last order copied in. Change anything you like"); };
ACT.editOrder = (el) => {
  const o = orderById(el.dataset.id), lines = linesByOrder[o.id] || [];
  S.draft = { dist: o.dist, editId: o.id, orig: lines.map((l) => ({ ...l })), q: "", dq: "", lines: lines.map((l) => ({ sap: l.sap, name: l.product, qty: l.qty, unit: l.unit || "Crate", manual: /manual/i.test(l.src || "") ? l.billed : 0 })) };
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
    if (r.status !== "ok") D.oos.push({ time: iso(now), id: o.id, dist: C.d.name, product: r.c.name, sap: r.ln.sap, req: r.req == null ? "N/A" : r.req, avail: r.stocked ? r.avail : "N/A", missed: r.stocked ? r.req - r.supply : "N/A", value: r.stocked && r.billed != null ? (r.req - r.supply) * r.upc * r.billed : "N/A", reason: r.status === "notstocked" ? `Not in current range - requested ${r.qty} ${r.ln.unit}` : r.status === "out" ? "Fully out of stock" : `Partial - ${nf(r.req - r.supply, 2)} of ${r.req} crates short` });
  });
  linesByOrder[o.id] = lines;
  Object.assign(o, { lines: lines.length, crates: C.crates, value: C.net, valueGst: C.net + C.gst, tod: C.tod });
  logActivity(dr.editId ? "Order edited" : "Order saved", o.id, `${C.d.name}: ${lines.length} lines, ${nf(C.crates, 2)} crates, ${rs(C.net)}`);
  const wasEdit = !!dr.editId; S.draft = newDraft(); S.ordersTab = "Pending"; S.picked[o.id] = true;
  go("orders");
  openSheet(wasEdit ? "Order updated" : "Order saved", `<div class="success"><div class="tick">${ic("check")}</div><div class="section-title">${wasEdit ? "Order updated" : "Order saved"}</div><div class="muted">${esc(o.dist)} · ${nf(o.crates, 2)} crates · ${rs2(o.valueGst)} incl. GST</div><div class="mono dim">${esc(o.id)}</div>${C.short ? `<div class="banner warn" style="margin-top:10px;text-align:left">${ic("alert", "sm")}<span>${C.short} line${C.short > 1 ? "s were" : " was"} short or not stocked. Logged under missed sales.</span></div>` : ""}</div>
    <div class="group"><button class="row" data-act="soPreview" data-id="${o.id}"><span class="attn-ic tint">${ic("doc")}</span><span class="grow"><div class="row-title">View the sales order</div><div class="row-sub">With your logo and company details</div></span>${ic("chevR", "sm chev")}</button><button class="row" data-act="nav2" data-to="dispatch"><span class="attn-ic info">${ic("truck")}</span><span class="grow"><div class="row-title">Go to dispatch</div><div class="row-sub">Add it to the next pick list</div></span>${ic("chevR", "sm chev")}</button><button class="row" data-act="newOrder"><span class="attn-ic tint">${ic("plus")}</span><span class="grow"><div class="row-title">Take another order</div></span>${ic("chevR", "sm chev")}</button></div>`);
};
ACT.nav2 = (el) => { closeSheet(); go(el.dataset.to); };

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
        <div class="group">${pend.map((o) => `<div class="row tap" role="checkbox" tabindex="0" aria-checked="${!!S.picked[o.id]}" data-act="togglePick" data-id="${o.id}" style="cursor:pointer"><span class="check" aria-checked="${!!S.picked[o.id]}">${ic("check")}</span><span class="grow"><div class="row-title clip">${esc(o.dist)}</div><div class="row-sub">${dayLabel(o.time)}, ${fmtTime(o.time)} · ${o.lines} lines${o.timesEdited ? " · edited" : ""}</div></span><span class="row-end"><span><div class="row-value">${nf(o.crates, 2)} crates</div><div class="row-sub num">${rs(o.value)}</div></span><button class="icon-btn" data-act="orderSheet" data-id="${o.id}" aria-label="Open order">${ic("chevR", "sm")}</button></span></div>`).join("")}</div></div>
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
    : `<button class="btn btn-secondary" data-act="pickEdit">${ic("pencil", "sm")} Edit</button><button class="btn btn-secondary" data-act="pickExcel">${ic("doc", "sm")} Excel</button><button class="btn btn-secondary" data-act="copyPick">${ic("copy", "sm")} WhatsApp</button><button class="btn btn-primary" data-act="dispatchNow">${ic("truck", "sm")} Mark dispatched</button>`;
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
ACT.pickExcel = async (el) => {
  const P = S.pickList; if (!P) return;
  el.disabled = true;
  try { await loadScriptOnce(XLSX_SRC, () => !!window.XLSX); }
  catch (e) { el.disabled = false; toast("Could not prepare the Excel file. Check your internet and try again.", "alert"); return; }
  const X = window.XLSX, made = P.made || NOW(), stampTxt = `${pad2(made.getDate())}-${pad2(made.getMonth() + 1)}-${made.getFullYear()} ${pad2(made.getHours())}:${pad2(made.getMinutes())}`;
  const names = P.orders.map((o) => shortOf(o.dist));
  const aoa = [
    ["PICK LIST FOR TROPICANA LOGISTICS, WILLINGDON ISLAND  (SahiReach LLP)"],
    ["Orders in this pick list", `${P.orders.length} order(s): ${P.orders.map((o) => o.id).join(", ")}   |   generated ${stampTxt}`],
    [],
    ["Tropicana Code", "SKU"].concat(names, ["TOTAL CRATES"]),
    ["", "Order date/time"].concat(P.orders.map((o) => { const d = toDate(o.time); return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }), [""]),
  ];
  P.rows.forEach((r) => aoa.push([tropCode(r.sap), r.name].concat(P.orders.map((o, ci) => (r.cells[ci] ? +r.cells[ci].toFixed(2) : null)), [+r.total.toFixed(2)])));
  aoa.push(["", "TOTAL CRATES"].concat(P.orders.map((o) => +o.crates.toFixed(2)), [+P.total.toFixed(2)]));
  aoa.push([]); aoa.push(["Vehicle", (vehicleFor(P.total) || "").replace(/\s*\(.*\)/, "")]);
  const ws = X.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 14 }, { wch: 46 }].concat(names.map((n) => ({ wch: Math.max(9, Math.min(22, n.length + 2)) })), [{ wch: 14 }]);
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: Math.min(names.length + 3, 8) } }];
  ws["!freeze"] = { xSplit: 2, ySplit: 5 };
  const wb = X.utils.book_new(); X.utils.book_append_sheet(wb, ws, "Pick List");
  X.writeFile(wb, `SahiReach pick list ${stampTxt.replace(":", "")}.xlsx`, { compression: true });
  el.disabled = false; logActivity("Pick list downloaded", `${P.orders.length} order(s)`, "Excel"); toast("Excel pick list downloaded", "doc");
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
    const full = Math.floor(a.pcs / ppc), qcCr = Math.floor(qc.crates || 0), fromQC = Math.min(full, qcCr);
    const ownCr = own.upc ? Math.floor(own.ea / own.upc) : 0, fromOwn = S.qcOwn ? Math.min(full - fromQC, ownCr) : 0, send = fromQC + fromOwn;
    return { ...a, ppc, full, qcCr, ownCr, fromQC, fromOwn, send, sendPcs: send * ppc, notSent: a.pcs - send * ppc, sendValue: (a.value / a.pcs) * send * ppc };
  }).sort((a, b) => a.name.localeCompare(b.name));
  return { pos, rows, crates: rows.reduce((a, r) => a + r.send, 0), value: rows.reduce((a, r) => a + r.sendValue, 0), min: S.qcPlatform === "Swiggy" ? D.qcPick.minSwiggy : D.qcPick.minZepto };
}
function qcOpenHtml() {
  const list = openQC().filter((p) => p.platform === S.qcPlatform).sort((a, b) => (a.expiry > b.expiry ? 1 : -1)), Dl = qcDelivery();
  const ok = Dl.value >= Dl.min, prog = Dl.min ? Math.min(100, (Dl.value / Dl.min) * 100) : 100;
  if (!list.length) return `<div class="group"><div class="empty"><div class="big">No open ${esc(S.qcPlatform)} POs</div>Add a PO when it arrives and it will show here until it is delivered or lapses.</div></div>`;
  return `<div class="split s320">
    <div class="stack gap-20"><div><div class="group-label"><span>Open POs, soonest expiry first</span></div><div class="group">${list.map((p) => { const exp = daysLeft(p) < 0; return `<div class="row tap" ${exp ? "" : `role="checkbox" tabindex="0" aria-checked="${!!S.qcPicked[p.po]}" data-act="toggleQC" data-po="${p.po}" style="cursor:pointer"`}><span class="check" aria-checked="${!exp && !!S.qcPicked[p.po]}" ${exp ? 'style="opacity:.3"' : ""}>${ic("check")}</span><span class="grow"><div class="row-title mono" style="font-size:14.5px">${esc(p.po)}</div><div class="row-sub">${p.lines} lines · ${nf(p.pcs)} pieces · PO of ${fmtDate(p.date)}</div></span><span class="row-end"><span style="text-align:right"><div class="row-value">${rs(p.value)}</div><div style="margin-top:3px">${expiryPill(p)}</div></span><button class="icon-btn" data-act="qcPOSheet" data-po="${p.po}" aria-label="Open PO">${ic("chevR", "sm")}</button></span></div>`; }).join("")}</div></div>
      ${Dl.rows.length ? `<div><div class="group-label"><span>What goes on this delivery</span><span>whole crates only</span></div><div class="dg" style="--cols:minmax(0,1.6fr) 80px 80px 90px 90px 90px;--cols-sm:minmax(0,1fr) auto"><div class="dg-row dg-head"><span>Product</span><span class="r c-hide">Pieces on POs</span><span class="r c-hide">Per crate</span><span class="r c-hide">From QC stock</span><span class="r c-hide">From own stock</span><span class="r">Crates to send</span></div>${Dl.rows.map((r) => `<div class="dg-row"><span><div class="strong clip">${esc(shortName(r.name))}</div>${r.notSent > 0 ? `<div class="row-sub" style="color:var(--warn)">${nf(r.notSent)} pieces not sent${r.send < r.full ? " · stock short" : " · under a full crate"}</div>` : `<div class="row-sub">Sent in full</div>`}</span><span class="r c-hide">${nf(r.pcs)}</span><span class="r c-hide">${r.ppc}</span><span class="r c-hide">${r.fromQC}<span class="dim"> of ${r.qcCr}</span></span><span class="r c-hide">${r.fromOwn || `<span class="dim">–</span>`}</span><span class="r strong">${r.send}</span></div>`).join("")}</div></div>` : ""}</div>
    <div class="sticky"><div class="card card-pad"><div class="card-title">This delivery</div><div class="row-sub">${esc(S.qcPlatform === "Swiggy" ? D.qcPick.swiggyTo : D.qcPick.zeptoTo)}</div>
      <div class="tile-value" style="margin-top:10px">${nf(Dl.crates)}<small>crates</small></div><div class="row-sub">${Dl.pos.length} PO${Dl.pos.length === 1 ? "" : "s"} ticked · ${rs(Dl.value)} excl. GST</div>
      ${Dl.min ? `<div style="margin-top:14px"><div class="hstack between" style="font-size:13px"><span class="muted">Minimum per delivery ${rs(Dl.min)}</span>${ok ? `<span class="pill good">OK</span>` : `<span class="pill warn">${rs(Dl.min - Dl.value)} short</span>`}</div><div class="meter ${ok ? "" : "warn"}" style="margin-top:7px;height:8px"><i style="width:${prog}%"></i></div></div>` : ""}
      <div class="hstack between" style="margin-top:16px"><span style="font-size:14px">Use own stock when QC stock is short</span><button class="toggle" role="switch" aria-checked="${S.qcOwn}" data-act="toggleOwn" aria-label="Use own stock"></button></div>
      <div class="stack gap-8" style="margin-top:16px"><button class="btn btn-primary btn-lg btn-block" data-act="qcDeliver" ${Dl.crates ? "" : "disabled"}>${ic("truck", "sm")} Mark delivered</button><button class="btn btn-secondary btn-block" data-act="qcLapse">Lapse expired POs</button></div>
      <div class="row-sub" style="margin-top:10px">Marking delivered takes the crates off stock, shares the pieces to the POs that expire first, and lapses what was not sent.</div></div></div></div>`;
}
function qcHistoryHtml() {
  const list = D.qcPOs.filter((p) => p.status !== "Open").sort((a, b) => ((a.deliveredOn || a.expiry) < (b.deliveredOn || b.expiry) ? 1 : -1));
  return `<div class="dg" style="--cols:minmax(0,1.3fr) 110px 100px 100px 110px minmax(90px,140px);--cols-sm:minmax(0,1fr) auto"><div class="dg-row dg-head"><span>PO</span><span class="c-hide">Status</span><span class="r c-hide">Ordered</span><span class="r c-hide">Accepted</span><span class="r">Value accepted</span><span class="c-hide">Fill rate</span></div>${list.map((p) => `<button class="dg-row" data-act="qcPOSheet" data-po="${p.po}"><span><div class="strong mono">${platDot(p.platform)}${esc(p.po)}</div><div class="row-sub">${esc(p.platform)} · ${p.deliveredOn ? "delivered " + fmtDate(p.deliveredOn) : "expired " + fmtDate(p.expiry)}</div></span><span class="c-hide">${statusPill(p.status)}</span><span class="r c-hide">${nf(p.pcs)}</span><span class="r c-hide">${nf(p.pcsAccepted)}</span><span class="r strong">${rs(p.valueAccepted)}</span><span class="bar-cell c-hide"><div class="meter ${p.fill < 0.6 ? "bad" : p.fill < 0.85 ? "warn" : ""}"><i style="width:${(p.fill || 0) * 100}%"></i></div><span class="num" style="font-size:13px;min-width:34px;text-align:right">${pct(p.fill || 0, 0)}</span></span></button>`).join("")}</div>`;
}
function qcNewHtml() {
  const n = S.qcNew || (S.qcNew = { platform: "Swiggy", po: "", lines: [] });
  const items = D.qcStock.filter((q) => (n.platform === "Swiggy" ? q.swPrice || q.swiggy : q.zpPrice || q.zepto));
  const total = n.lines.reduce((a, l) => a + l.pcs * l.price, 0);
  return `<div class="split"><div class="stack gap-20"><div class="card card-pad"><div class="form-grid"><div class="field"><label class="label" for="qn-platform">Platform</label><select class="select" id="qn-platform" data-in="qnField" data-f="platform"><option ${n.platform === "Swiggy" ? "selected" : ""}>Swiggy</option><option ${n.platform === "Zepto" ? "selected" : ""}>Zepto</option></select></div><div class="field"><label class="label" for="qn-po">PO number</label><input class="input" id="qn-po" placeholder="KCOPO10712" value="${esc(n.po)}" data-in="qnField" data-f="po"></div><div class="field"><label class="label" for="qn-date">PO date</label><input class="input" id="qn-date" type="date" value="${iso(NOW()).slice(0, 10)}"></div><div class="field"><label class="label" for="qn-exp">Expiry date</label><input class="input" id="qn-exp" type="date" value="${iso(new Date(Date.now() + 10 * 864e5)).slice(0, 10)}"></div></div></div>
    <div><div class="group-label"><span>Lines, exactly as on the PO</span><span>pieces · price per piece excl. GST</span></div><div class="group">${items.map((q) => { const l = n.lines.find((x) => x.sap === q.sap), pr = n.platform === "Swiggy" ? q.swPrice : q.zpPrice; return `<div class="row"><span class="grow"><div class="row-title clip">${esc(shortName(q.name))}</div><div class="row-sub">${q.ppc} pieces per crate · last price ${pr ? rs2(pr) : "–"} · ${nf(q.crates)} crates in QC stock</div></span><span class="row-end"><input class="input sm num-in" style="width:96px" type="number" inputmode="numeric" min="0" placeholder="0" value="${l ? l.pcs : ""}" id="qn-${q.sap}" data-in="qnPcs" data-sap="${q.sap}" aria-label="Pieces"></span></div>`; }).join("")}</div></div></div>
    <div class="sticky"><div class="card card-pad" id="qn-sum">${qcNewSum()}</div></div></div>`;
}
function qcNewSum() { const n = S.qcNew, pcs = n.lines.reduce((a, l) => a + l.pcs, 0), val = n.lines.reduce((a, l) => a + l.pcs * l.price, 0); return `<div class="card-title">PO summary</div><div style="margin-top:10px"><div class="sum-row"><span class="muted">Lines</span><span class="num">${n.lines.length}</span></div><div class="sum-row"><span class="muted">Pieces</span><span class="num">${nf(pcs)}</span></div><div class="sum-row"><span class="muted">Value excl. GST</span><span class="num">${rs2(val)}</span></div><div class="sum-row total"><span>Incl. GST 5%</span><span class="num">${rs2(val * 1.05)}</span></div></div><button class="btn btn-primary btn-lg btn-block" style="margin-top:16px" data-act="qcSavePO" ${n.lines.length && n.po.trim() ? "" : "disabled"}>Save PO</button><div class="row-sub" style="margin-top:10px;text-align:center">Stock does not move until the delivery is marked.</div>`; }
IN.qnField = (el) => { S.qcNew[el.dataset.f] = el.value; if (el.dataset.f === "platform") { S.qcNew.lines = []; render(); } else part("qn-sum", qcNewSum()); };
IN.qnPcs = (el) => { const n = S.qcNew, q = qcBySap[el.dataset.sap], v = Math.max(0, +el.value || 0); n.lines = n.lines.filter((l) => l.sap !== q.sap); if (v) n.lines.push({ sap: q.sap, product: q.name, pcs: v, price: (n.platform === "Swiggy" ? q.swPrice : q.zpPrice) || 0, ppc: q.ppc }); part("qn-sum", qcNewSum()); };
ACT.qcSavePO = () => {
  const n = S.qcNew, exp = $("#qn-exp").value, dt = $("#qn-date").value, val = n.lines.reduce((a, l) => a + l.pcs * l.price, 0);
  const p = { po: n.po.trim(), platform: n.platform, date: dt + "T00:00", expiry: exp + "T00:00", daysLeft: 10, to: n.platform === "Swiggy" ? D.qcPick.swiggyTo : D.qcPick.zeptoTo, lines: n.lines.length, pcs: n.lines.reduce((a, l) => a + l.pcs, 0), crates: n.lines.reduce((a, l) => a + l.pcs / l.ppc, 0), value: val, status: "Open" };
  D.qcPOs.push(p); qcLinesByPO[p.po] = n.lines.map((l) => ({ po: p.po, product: l.product, sap: l.sap, pcs: l.pcs, price: l.price, value: l.pcs * l.price, ppc: l.ppc, status: "Open" }));
  S.qcPicked[p.po] = true; S.qcPlatform = n.platform; S.qcNew = null; S.qcTab = "open";
  logActivity("QC PO saved", p.po, `${p.platform}, ${p.lines} line(s), ${nf(p.pcs)} pieces`); render(); toast("PO saved as open");
};
function qcGrnHtml() {
  const list = D.qcPOs.filter((p) => p.status === "Delivered").sort((a, b) => (a.deliveredOn < b.deliveredOn ? 1 : -1)).slice(0, 8);
  return `<div class="banner info">${ic("info", "sm")}<span>After a delivery, record what the platform accepted at GRN. Good pieces that came back go into QC stock; damaged pieces are written off.</span></div><div><div class="group-label"><span>Latest deliveries</span></div><div class="group">${list.map((p) => `<button class="row" data-act="grnSheet" data-po="${p.po}"><span class="grow"><div class="row-title mono" style="font-size:14.5px">${platDot(p.platform)}${esc(p.po)}</div><div class="row-sub">Delivered ${fmtDate(p.deliveredOn)} · ${nf(p.pcsDelivered)} pieces sent · ${nf(p.pcsAccepted)} accepted</div></span><span class="row-end">${p.pcsAccepted < p.pcsDelivered ? `<span class="pill warn">${nf(p.pcsDelivered - p.pcsAccepted)} short</span>` : `<span class="pill good">In full</span>`}${ic("chevR", "sm chev")}</span></button>`).join("")}</div></div>`;
}
VIEWS.quick = () => {
  const open = openQC(), tabs = { open: qcOpenHtml, add: qcNewHtml, grn: qcGrnHtml, history: qcHistoryHtml };
  return `<div class="page">
    <div class="page-head"><div><h1 class="title">Quick commerce</h1><div class="subtitle">Swiggy and Zepto purchase orders, from the day they arrive to the GRN.</div></div><div class="head-actions">${S.qcTab === "open" ? seg("qcPlatform", S.qcPlatform, [["Swiggy", "Swiggy", open.filter((p) => p.platform === "Swiggy").length], ["Zepto", "Zepto", open.filter((p) => p.platform === "Zepto").length]]) : ""}</div></div>
    ${seg("qcTab", S.qcTab, [["open", "Open POs"], ["add", "New PO"], ["grn", "GRN"], ["history", "History"]])}
    ${tabs[S.qcTab]()}</div>`;
};
ACT.toggleQC = (el, e) => { if (e.target.closest('[data-act="qcPOSheet"]')) return; S.qcPicked[el.dataset.po] = !S.qcPicked[el.dataset.po]; render(); };
ACT.toggleOwn = () => { S.qcOwn = !S.qcOwn; render(); };
ACT.qcPOSheet = (el) => {
  const p = D.qcPOs.find((x) => x.po === el.dataset.po), lines = qcLinesByPO[p.po] || [];
  openSheet(esc(p.po), `<div class="card card-pad"><div class="hstack gap-8 wrap">${statusPill(p.status)}<span class="pill plain">${platDot(p.platform)}${esc(p.platform)}</span>${p.status === "Open" ? expiryPill(p) : ""}</div><div class="kv" style="margin-top:14px"><div><div class="k">PO date</div><div class="v">${fmtDate(p.date)}</div></div><div><div class="k">Expiry</div><div class="v">${fmtDate(p.expiry)}</div></div><div><div class="k">Pieces ordered</div><div class="v num">${nf(p.pcs)}</div></div><div><div class="k">Value ordered</div><div class="v num">${rs(p.value)}</div></div>${p.status !== "Open" ? `<div><div class="k">Accepted</div><div class="v num">${nf(p.pcsAccepted)} pcs</div></div><div><div class="k">Fill rate</div><div class="v num">${pct(p.fill || 0, 0)}</div></div>` : ""}</div><div class="row-sub" style="margin-top:12px">${esc(p.to || "")}</div></div>
    <div><div class="group-label"><span>${lines.length} lines</span></div><div class="group">${lines.map((l) => `<div class="row"><span class="grow"><div class="row-title clip">${esc(shortName(l.product))}</div><div class="row-sub">${nf(l.pcs)} pieces × ${rs2(l.price)}${l.code ? " · item " + esc(l.code) : ""}${l.status !== "Open" && l.accepted != null ? ` · ${nf(l.accepted)} accepted${l.lapsed ? ", " + nf(l.lapsed) + " not sent" : ""}` : ""}</div></span><span class="row-end"><span class="row-value">${rs(l.value)}</span></span></div>`).join("")}</div></div>`);
};
ACT.qcDeliver = () => {
  const Dl = qcDelivery(), now = iso(NOW()); if (!Dl.crates) return;
  Dl.rows.forEach((r) => { const qc = qcBySap[r.sap], own = stockBySap[r.sap]; if (qc) { qc.crates -= r.fromQC; qc.ea = qc.crates * (qc.upc || 1); } if (own && r.fromOwn) { own.ea -= r.fromOwn * own.upc; own.crates = own.ea / own.upc; } });
  Dl.pos.forEach((p) => { const sent = (qcLinesByPO[p.po] || []).reduce((a, l) => { const r = Dl.rows.find((x) => x.sap === l.sap), share = r && r.pcs ? Math.min(l.pcs, Math.round((l.pcs / r.pcs) * r.sendPcs)) : 0; l.status = "Delivered"; l.delivered = share; l.accepted = share; l.short = 0; l.lapsed = l.pcs - share; l.valueAccepted = Math.round(share * l.price * 100) / 100; return a + share; }, 0); Object.assign(p, { status: "Delivered", deliveredOn: now, pcsDelivered: sent, pcsAccepted: sent, valueAccepted: (qcLinesByPO[p.po] || []).reduce((a, l) => a + (l.valueAccepted || 0), 0), fill: sent / p.pcs }); delete S.qcPicked[p.po]; });
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
    : tab === "purchases" ? purchasesHtml() : missedHtml();
  return `<div class="page">
    <div class="page-head"><div><h1 class="title">Stock</h1><div class="subtitle">What is in Tropicana right now, what came in, and what you ran out of.</div></div><div class="head-actions"><button class="btn btn-primary" data-act="receiveSheet">${ic("plus", "sm")} Receive stock</button></div></div>
    <div class="tiles"><div class="tile"><div class="tile-label">Own stock</div><div class="tile-value">${nf(crates, 0)}<small>crates</small></div><div class="tile-sub">${inStock} of ${own.length} products in stock</div></div><div class="tile"><div class="tile-label">Own stock at cost</div><div class="tile-value">₹${lakh(cost)}<small>L</small></div><div class="tile-sub">At the super stockist rate</div></div><div class="tile"><div class="tile-label">Quick commerce stock</div><div class="tile-value">${nf(qcCr, 0)}<small>crates</small></div><div class="tile-sub">Shared by Swiggy and Zepto</div></div><button class="tile" data-act="stockLow"><div class="tile-label"><span>Below reorder point</span>${ic("chevR", "sm dim")}</div><div class="tile-value" style="color:var(--bad)">${low}</div><div class="tile-sub">Hero and Core products to reorder</div></button></div>
    ${seg("stockTab", tab, [["own", "Own stock"], ["qc", "Quick commerce"], ["damaged", "Damaged"], ["purchases", "Purchases"], ["missed", "Missed sales"]])}
    ${body}</div>`;
};
IN.stockQ = (el) => { S.stockQ = el.value; part("stock-grid", ownStockGrid()); };
ACT.stockCat = (el) => { S.stockCat = el.dataset.cat; render(); };
ACT.stockLow = () => { S.stockTab = "own"; S.stockCat = "Below reorder"; render(); };
ACT.productSheet = (el) => {
  const sap = el.dataset.sap, s = stockBySap[sap], c = catBySap[sap] || {}, r = replBySap[sap] || {}, name = (s && s.name) || c.name || sap;
  if (!s) { openSheet(esc(shortName(name)), `<div class="card card-pad"><div class="section-title" style="font-size:19px">${esc(name)}</div><div class="row-sub">${esc(c.cat || "")} · SAP ${esc(sap)}</div><div class="banner warn" style="margin-top:14px">${ic("info", "sm")}<span>You do not stock this product. Requests for it are logged as demand.</span></div></div>`); return; }
  const cr = cratesOf(s), recent = D.orderLines.filter((l) => l.sap === sap).slice(-6).reverse();
  openSheet(esc(shortName(name)), `<div class="card card-pad"><div class="section-title" style="font-size:19px">${esc(s.name)}</div><div class="row-sub">${esc(s.cat || "")}</div><div class="hstack gap-8 wrap" style="margin-top:10px">${classPill(r.cls)}${s.tier ? `<span class="pill plain">${esc(s.tier)}</span>` : ""}<span class="pill plain mono">SAP ${esc(s.sap)}</span>${s.trop ? `<span class="pill plain mono">${esc(s.trop)}</span>` : ""}</div>
      <div class="divider" style="margin:16px 0"></div><div class="kv"><div><div class="k">In stock</div><div class="v num" ${cr <= 0 ? 'style="color:var(--bad)"' : ""}>${nf(cr, 2)} crates</div></div><div><div class="k">Boxes</div><div class="v num">${nf(s.ea)}</div></div><div><div class="k">Pieces</div><div class="v num">${nf(s.ea * (s.ppe || 1))}</div></div><div><div class="k">Pack</div><div class="v">${s.upc} boxes / crate · ${s.ppe} pcs / box</div></div></div></div>
    <div><div class="group-label"><span>Price per box</span></div><div class="card card-pad"><div class="kv"><div><div class="k">MRP</div><div class="v num">${rs2(s.mrp)}</div></div><div><div class="k">Your cost (SS rate)</div><div class="v num">${rs2(s.cost)}</div></div><div><div class="k">Selling price</div><div class="v num">${rs2(s.price)}</div></div><div><div class="k">Margin</div><div class="v num">${rs2(s.margin)}${s.price ? ` <span class="muted" style="font-weight:500">(${pct(s.margin / s.price, 1)})</span>` : ""}</div></div></div></div></div>
    ${r.sap ? `<div><div class="group-label"><span>Replenishment</span></div><div class="card card-pad"><div class="kv"><div><div class="k">Sells per day</div><div class="v num">${nf(r.perDay, 2)} crates</div></div><div><div class="k">Days of stock</div><div class="v num">${r.perDay > 0 ? (cr / r.perDay).toFixed(1) : "–"}</div></div><div><div class="k">Reorder point</div><div class="v num">${nf(r.rop, 1)} crates</div></div><div><div class="k">Target stock</div><div class="v num">${nf(r.target, 1)} crates</div></div><div><div class="k">On order</div><div class="v num">${nf(r.onOrder, 1)} crates</div></div><div><div class="k">Missed, 28 days</div><div class="v num">${nf(r.missed, 1)} crates</div></div></div></div></div>` : ""}
    ${s.move ? `<div class="banner info">${ic("clock", "sm")}<span><b>Last movement.</b> ${esc(s.move)}</span></div>` : ""}
    ${recent.length ? `<div><div class="group-label"><span>Latest orders with it</span></div><div class="group">${recent.map((l) => { const o = orderById(l.id) || {}; return `<div class="row"><span class="grow"><div class="row-title clip">${esc(o.dist || "")}</div><div class="row-sub">${fmtDate(o.time)}</div></span><span class="row-end"><span class="row-value">${nf(l.crates, 2)} crates</span></span></div>`; }).join("")}</div></div>` : ""}`);
};
ACT.purchaseSheet = (el) => {
  const lines = D.purchases.filter((p) => p.id === el.dataset.id), g = lines[0];
  openSheet(g.inv ? "Invoice " + esc(g.inv) : esc(g.supplier), `<div class="card card-pad"><div class="kv"><div><div class="k">Supplier</div><div class="v">${esc(g.supplier)}</div></div><div><div class="k">Invoice date</div><div class="v">${fmtDate(g.invDate)}</div></div><div><div class="k">Added to</div><div class="v">${esc(g.pool)}</div></div><div><div class="k">Value excl. GST</div><div class="v num">${rs2(lines.reduce((a, l) => a + (l.value || 0), 0))}</div></div></div><div class="row-sub mono" style="margin-top:12px">${esc(g.id)} · saved ${fmtDT(g.time)}</div></div>
    <div><div class="group-label"><span>${lines.length} lines</span><span>${nf(lines.reduce((a, l) => a + (l.crates || 0), 0), 1)} crates</span></div><div class="group">${lines.map((l) => `<div class="row"><span class="grow"><div class="row-title clip">${esc(shortName(l.product))}</div><div class="row-sub">${nf(l.crates, 2)} crates · ${nf(l.ea)} boxes × ${rs2(l.rate)}${l.batch ? " · batch " + esc(l.batch) : ""}${l.isNew === "Yes" ? " · new SKU" : ""}</div></span><span class="row-end"><span class="row-value">${rs(l.value)}</span></span></div>`).join("")}</div></div>`);
};
function receiveBody() {
  const R = S.recv, res = R.q && R.q.length > 1 ? searchProducts(R.q, 8).filter((x) => x.st) : [];
  return `<div class="card card-pad"><div class="form-grid"><div class="field"><label class="label" for="rc-inv">Hangyo invoice number</label><input class="input" id="rc-inv" placeholder="SI0018712" value="${esc(R.inv)}" data-in="recvField" data-f="inv"></div><div class="field"><label class="label" for="rc-date">Invoice date</label><input class="input" id="rc-date" type="date" value="${iso(NOW()).slice(0, 10)}"></div><div class="field full"><label class="label">Add stock to</label>${`<div class="seg"><button data-act="recvPool" data-v="Own Stock" aria-pressed="${R.pool === "Own Stock"}">Own stock</button><button data-act="recvPool" data-v="QC Stock" aria-pressed="${R.pool === "QC Stock"}">Quick commerce stock</button></div>`}</div></div></div>
    <div class="stack gap-10"><div class="search">${ic("search", "sm")}<input class="input" id="rc-q" type="search" placeholder="Add a product from the invoice" value="${esc(R.q)}" data-in="recvQ" autocomplete="off"></div><div id="rc-results">${res.length ? `<div class="results">${res.map((x) => `<button class="res" data-act="recvAdd" data-sap="${x.c.sap}"><span class="grow"><div class="row-title clip">${esc(x.c.name)}</div><div class="row-sub">${nf(x.crates, 1)} crates in stock now</div></span>${ic("plus", "sm dim")}</button>`).join("")}</div>` : ""}</div>
    <div class="group">${R.lines.length ? R.lines.map((l, i) => `<div class="row"><span class="grow"><div class="row-title clip">${esc(shortName(l.name))}</div><div class="row-sub">${l.upc} boxes per crate · ${rs2(ssRate(l.sap) || (stockBySap[l.sap] || {}).cost)} per box</div></span><span class="row-end"><input class="input sm num-in" style="width:80px" type="number" min="0" value="${l.crates}" id="rc-c-${i}" data-in="recvCrates" data-i="${i}" aria-label="Crates"><span class="muted" style="font-size:13px">crates</span><button class="icon-btn" data-act="recvRm" data-i="${i}" aria-label="Remove">${ic("trash", "sm")}</button></span></div>`).join("") : `<div class="empty">Add the products on the invoice. Stock goes up when you save.</div>`}</div></div>`;
}
ACT.receiveSheet = () => { S.recv = { inv: "", pool: "Own Stock", q: "", lines: [] }; openSheet("Receive stock", receiveBody(), `<button class="btn btn-primary" data-act="recvSave">Save purchase</button>`); };
IN.recvField = (el) => { S.recv[el.dataset.f] = el.value; };
IN.recvQ = (el) => { S.recv.q = el.value; const res = el.value.length > 1 ? searchProducts(el.value, 8).filter((x) => x.st) : []; part("rc-results", res.length ? `<div class="results">${res.map((x) => `<button class="res" data-act="recvAdd" data-sap="${x.c.sap}"><span class="grow"><div class="row-title clip">${esc(x.c.name)}</div><div class="row-sub">${nf(x.crates, 1)} crates in stock now</div></span>${ic("plus", "sm dim")}</button>`).join("")}</div>` : ""); };
IN.recvCrates = (el) => { S.recv.lines[+el.dataset.i].crates = Math.max(0, +el.value || 0); };
ACT.recvPool = (el) => { S.recv.pool = el.dataset.v; part("sheet-body", receiveBody()); };
ACT.recvAdd = (el) => { const s = stockBySap[el.dataset.sap]; if (!S.recv.lines.find((l) => l.sap === s.sap)) S.recv.lines.push({ sap: s.sap, name: s.name, upc: s.upc, crates: 1 }); S.recv.q = ""; part("sheet-body", receiveBody()); };
ACT.recvRm = (el) => { S.recv.lines.splice(+el.dataset.i, 1); part("sheet-body", receiveBody()); };
ACT.recvSave = () => {
  const R = S.recv, lines = R.lines.filter((l) => l.crates > 0); if (!lines.length) { toast("Add at least one product", "info"); return; }
  const now = NOW(), id = "PUR-" + stamp(now);
  lines.forEach((l) => { const s = stockBySap[l.sap], rate = ssRate(l.sap) || s.cost || 0, ea = l.crates * l.upc; if (R.pool === "Own Stock") { s.ea += ea; s.crates = s.ea / s.upc; s.move = `${id}: +${nf(ea)} boxes`; } else if (qcBySap[l.sap]) { qcBySap[l.sap].crates += l.crates; } D.purchases.push({ time: iso(now), id, inv: R.inv, invDate: iso(now), supplier: "Hangyo", pool: R.pool, product: l.name, sap: l.sap, unit: "Crate", qty: l.crates, ea, crates: l.crates, batch: "", rate, value: ea * rate, isNew: "No" }); });
  logActivity("Purchase saved", id, `${lines.length} lines into ${R.pool}`); closeSheet(); S.stockTab = "purchases"; render(); toast("Stock received and added");
};

/* ===== REPLENISHMENT ===== */
function replTotals() { const own = D.repl.rows.reduce((a, r) => a + (r.final || 0), 0); return { own, qc: D.repl.qcCrates || 0, total: own + (D.repl.qcCrates || 0), value: D.repl.rows.reduce((a, r) => a + (r.final || 0) * (r.upc || 0) * (ssRate(r.sap) || 0), 0) }; }
function truckHtml() {
  const R = D.repl, T = replTotals(), free = R.truck - T.total;
  return `<div class="hstack between wrap gap-12"><div><div class="card-title">This truck</div><div class="row-sub">Hangyo sends a truck from ${R.truck} crates, own stock and quick commerce together</div></div><div class="tile-value">${nf(T.total)}<small>of ${R.truck} crates</small></div></div>
    <div class="truck-bar" style="margin-top:14px"><i class="own" style="width:${(T.own / R.truck) * 100}%"></i><i class="qc" style="width:${(T.qc / R.truck) * 100}%"></i></div>
    <div class="hstack between wrap gap-12" style="margin-top:10px"><div class="legend"><span><i style="background:var(--s-gt)"></i>Own stock ${nf(T.own)}</span><span><i style="background:var(--s-zepto)"></i>Quick commerce ${nf(T.qc)}</span><span>${free >= 0 ? nf(free) + " crates free" : nf(-free) + " over the truck"}</span></div><div class="row-sub num">${rs(T.value)} at the SS rate</div></div>`;
}
function replRows() {
  const f = S.replFilter;
  return D.repl.rows.filter((r) => f === "All" || (f === "On this truck" ? r.final > 0 : f === "Below reorder" ? r.belowRop : r.cls === f)).sort((a, b) => (b.final || 0) - (a.final || 0) || (b.perDay || 0) - (a.perDay || 0));
}
function replGrid() {
  const rows = replRows();
  if (!rows.length) return `<div class="group"><div class="empty">No products in this group.</div></div>`;
  return `<div class="dg" style="--cols:minmax(0,2fr) 84px 76px 70px minmax(100px,130px) 80px 96px 70px;--cols-sm:minmax(0,1fr) 84px"><div class="dg-row dg-head"><span>Product</span><span class="c-hide">Class</span><span class="r c-hide">Sells / day</span><span class="r c-hide">Stock</span><span class="c-hide">Days of stock</span><span class="r c-hide">Suggested</span><span class="r">Your crates</span><span class="r c-hide">Final</span></div>
  ${rows.map((r) => { const open = S.replOpen === r.sap, low = r.belowRop; return `<div class="dg-row" style="cursor:pointer" data-act="replToggle" data-sap="${r.sap}"><span><div class="strong clip">${esc(shortName(r.name))}</div><div class="row-sub clip">${low ? `<span style="color:var(--bad);font-weight:600">Below reorder point</span>${r.note && !/^below reorder/i.test(r.note) ? " · " + esc(r.note) : ""}` : r.note ? esc(r.note) : esc(r.cat || "")}</div></span><span class="c-hide">${classPill(r.cls)}</span><span class="r c-hide">${nf(r.perDay, 2)}</span><span class="r c-hide">${nf(r.stock, 1)}</span><span class="bar-cell c-hide">${r.days != null ? `<div class="meter ${low ? "bad" : r.days < 8 ? "warn" : ""}"><i style="width:${Math.min(100, (r.days / 30) * 100)}%"></i></div><span class="num" style="font-size:13px;min-width:30px;text-align:right">${nf(r.days, 0)}d</span>` : `<span class="dim">–</span>`}</span><span class="r c-hide">${nf(r.suggested)}</span><span class="r"><input class="input sm num-in" style="width:76px" type="number" min="0" placeholder="${nf(r.suggested)}" value="${r.yours != null ? r.yours : ""}" id="rp-${r.sap}" data-in="replYours" data-sap="${r.sap}" aria-label="Your crates"></span><span class="r strong c-hide" id="rf-${r.sap}">${nf(r.final)}</span></div>
    ${open ? `<div class="dg-row" style="--cols:1fr;background:var(--surface-2);display:block"><div class="kv"><div><div class="k">Sold, last 14 days</div><div class="v num">${nf(r.s14, 1)} crates</div></div><div><div class="k">Days 15 to 28</div><div class="v num">${nf(r.s28, 1)}</div></div><div><div class="k">Days 29 to 56</div><div class="v num">${nf(r.s56, 1)}</div></div><div><div class="k">Missed, 28 days</div><div class="v num">${nf(r.missed, 1)}</div></div><div><div class="k">Reorder point</div><div class="v num">${nf(r.rop, 1)}</div></div><div><div class="k">Target stock</div><div class="v num">${nf(r.target, 1)}</div></div><div><div class="k">On order</div><div class="v num">${nf(r.onOrder, 1)}</div></div><div><div class="k">After this truck</div><div class="v num">${r.daysAfter != null ? nf(r.daysAfter, 0) + " days" : "–"}</div></div></div>
      <div class="form-grid" style="margin-top:14px;grid-template-columns:repeat(4,minmax(0,1fr))"><div class="field"><label class="label" for="rr-${r.sap}">Order rule</label><select class="select sm" id="rr-${r.sap}" data-in="replRule" data-sap="${r.sap}">${["Auto", "Hero", "Core", "Tail", "Push", "Don't order"].map((x) => `<option ${(r.rule || "Auto") === x ? "selected" : ""}>${x}</option>`).join("")}</select></div><div class="field"><label class="label">Min crates</label><input class="input sm num-in" type="number" value="${r.min != null ? r.min : ""}" placeholder="–"></div><div class="field"><label class="label">Max crates</label><input class="input sm num-in" type="number" value="${r.max != null ? r.max : ""}" placeholder="–"></div><div class="field"><label class="label">Adjust + / −</label><input class="input sm num-in" type="number" value="${r.adj != null ? r.adj : ""}" placeholder="0"></div></div>${r.reason ? `<div class="row-sub" style="margin-top:10px">Note: ${esc(r.reason)}</div>` : ""}</div>` : ""}`; }).join("")}</div>`;
}
function poLogHtml() {
  const byPO = {}; D.hpoLog.forEach((l) => { const g = (byPO[l.po] = byPO[l.po] || { po: l.po, placed: l.placed, pool: l.pool, lines: [], crates: 0, value: 0, toCome: 0 }); g.lines.push(l); g.crates += l.crates || 0; g.value += l.value || 0; g.toCome += l.toCome || 0; });
  return `<div class="group">${Object.values(byPO).sort((a, b) => (a.placed < b.placed ? 1 : -1)).map((g) => { const cnt = (s) => g.lines.filter((l) => l.status === s).length, open = g.toCome > 0 || cnt("Open") > 0; return `<button class="row" data-act="poSheet" data-po="${g.po}"><span class="attn-ic ${open ? "info" : "tint"}">${ic(open ? "truck" : "check")}</span><span class="grow"><div class="row-title mono" style="font-size:14.5px">${esc(g.po)}</div><div class="row-sub clip">Placed ${fmtDT(g.placed)} · ${esc(g.pool)} · ${g.lines.length} lines · ${cnt("Received")} received${cnt("Part received") ? ", " + cnt("Part received") + " part" : ""}${cnt("Closed short") ? ", " + cnt("Closed short") + " closed short" : ""}${cnt("Open") ? ", " + cnt("Open") + " still to come" : ""}</div></span><span class="row-end"><span style="text-align:right"><div class="row-value">${nf(g.crates)} crates</div><div class="row-sub num">${rs(g.value)}</div></span>${ic("chevR", "sm chev")}</span></button>`; }).join("")}</div>`;
}
function rulesHtml() {
  return `<div class="banner info">${ic("info", "sm")}<span>These are the rules the truck plan follows. Change a value and plan the truck again.</span></div><div class="group">${D.repl.settings.map((s, i) => { const isP = typeof s.value === "number" && s.value > 0 && s.value <= 1 && /Weight|Hero:|Core:|Service/.test(s.name); const val = typeof s.value === "string" && /^\d{4}-/.test(s.value) ? fmtDate(s.value) + " " + s.value.slice(0, 4) : isP ? Math.round(s.value * 100) + "%" : s.value; return `<div class="row" style="align-items:flex-start"><span class="grow"><div class="row-title">${esc(s.name.replace(/\.\.\./g, "…"))}</div><div class="row-sub" style="max-width:62ch">${esc(s.help)}</div></span><span class="row-end"><input class="input sm num-in" style="width:104px" id="rs-${i}" value="${esc(val)}" aria-label="${esc(s.name)}"></span></div>`; }).join("")}</div>`;
}
VIEWS.replenish = () => {
  const R = D.repl, dec = R.decision, cls = dec.includes("NOW") ? "bad" : dec.includes("SOON") ? "warn" : "good", word = dec.includes("NOW") ? "Order now" : dec.includes("SOON") ? "Order soon" : "Hold";
  const count = (f) => D.repl.rows.filter((r) => (f === "On this truck" ? r.final > 0 : f === "Below reorder" ? r.belowRop : r.cls === f)).length;
  const plan = `<div class="grid-2"><div class="decision ${cls}"><div class="tile-label" style="color:inherit;opacity:.75">The engine says</div><div class="decision-word">${word}</div><div style="font-size:14.5px;max-width:60ch">${esc(R.why)}</div><div class="kv" style="margin-top:10px"><div><div class="k">Order by</div><div class="v">${fmtDate(R.orderBy)}</div></div><div><div class="k">Below reorder point</div><div class="v">${R.belowRop} Hero / Core</div></div><div><div class="k">Own sales</div><div class="v num">${nf(R.perDay, 1)} crates / day</div></div><div><div class="k">One truck lasts</div><div class="v num">${R.truckDays} days</div></div></div></div>
      <div class="card card-pad"><div id="truck">${truckHtml()}</div><div class="divider" style="margin:16px 0"></div><div class="hstack between gap-12"><div><div class="row-title">Quick commerce crates on this truck</div><div class="row-sub">Hangyo decides this. The QC plan suggests ${R.qcPlan}.</div></div><input class="input num-in" style="width:96px" type="number" min="0" id="rp-qc" value="${R.qcCrates}" data-in="replQC" aria-label="QC crates"></div><div class="row-sub" style="margin-top:12px">Last planned ${fmtDT(R.planned)}</div></div></div>
    <div class="sec-head"><div><div class="section-title">What goes on the truck</div><div class="section-sub">Type your own crates to override a suggestion. Tap a row to see why and set rules.</div></div></div>
    <div class="chips">${["All", "On this truck", "Below reorder", "Hero", "Core", "Tail", "Push", "Don't order"].map((f) => `<button class="chip" data-act="replFilter" data-f="${esc(f)}" aria-pressed="${S.replFilter === f}">${esc(f)}${f !== "All" ? ` <span style="opacity:.6">${count(f)}</span>` : ""}</button>`).join("")}</div>
    <div id="repl-grid">${replGrid()}</div>`;
  return `<div class="page">
    <div class="page-head"><div><h1 class="title">Replenishment</h1><div class="subtitle">What to order from Hangyo and when, worked out from your sales, missed sales and stock.</div></div><div class="head-actions"><button class="btn btn-secondary" data-act="planTruck">${ic("cycle", "sm")} Plan the truck</button><button class="btn btn-primary" data-act="makePO">${ic("doc", "sm")} Make Hangyo PO</button></div></div>
    ${seg("replTab", S.replTab, [["plan", "Truck plan"], ["orders", "Hangyo POs"], ["rules", "Rules"]])}
    ${S.replTab === "plan" ? plan : S.replTab === "orders" ? poLogHtml() : rulesHtml()}</div>`;
};
ACT.replFilter = (el) => { S.replFilter = el.dataset.f; part("repl-grid", replGrid()); $$('[data-act="replFilter"]').forEach((b) => b.setAttribute("aria-pressed", b.dataset.f === S.replFilter)); };
ACT.replToggle = (el, e) => { if (e.target.closest("input,select,label")) return; S.replOpen = S.replOpen === el.dataset.sap ? null : el.dataset.sap; part("repl-grid", replGrid()); };
IN.replYours = (el) => { const r = replBySap[el.dataset.sap]; r.yours = el.value === "" ? null : Math.max(0, +el.value); r.final = r.yours != null ? r.yours : r.suggested; r.boxes = r.final * (r.upc || 0); const f = $("#rf-" + r.sap); if (f) f.textContent = nf(r.final); part("truck", truckHtml()); };
IN.replQC = (el) => { D.repl.qcCrates = Math.max(0, +el.value || 0); part("truck", truckHtml()); };
IN.replRule = (el) => { const r = replBySap[el.dataset.sap]; r.rule = el.value === "Auto" ? "" : el.value; if (el.value !== "Auto") r.cls = el.value; toast(`Rule set to ${el.value}`); };
ACT.planTruck = () => { D.repl.planned = iso(NOW()); render(); toast("Truck planned from the latest orders and stock", "cycle"); };
ACT.makePO = () => {
  const lines = D.repl.rows.filter((r) => r.final > 0).sort((a, b) => a.name.localeCompare(b.name)), T = replTotals();
  openSheet("Hangyo purchase order", `<div class="card card-pad"><div class="kv"><div><div class="k">Stock pool</div><div class="v">Own stock</div></div><div><div class="k">Lines</div><div class="v">${lines.length}</div></div><div><div class="k">Crates</div><div class="v num">${nf(T.own)}</div></div><div><div class="k">Boxes for the portal</div><div class="v num">${nf(lines.reduce((a, r) => a + r.final * (r.upc || 0), 0))}</div></div><div><div class="k">Value at SS rate</div><div class="v num">${rs(T.value)}</div></div></div></div>
    <div class="table-wrap"><table class="t"><thead><tr><th>Product</th><th>Type</th><th class="r">Per crate</th><th class="r">Crates</th><th class="r">Boxes</th></tr></thead><tbody>${lines.map((r) => `<tr><td>${esc(shortName(r.name))}<div class="row-sub mono">${esc(r.sap)}</div></td><td>${esc(r.cat || "")}</td><td class="r">${r.upc}</td><td class="r"><b>${nf(r.final)}</b></td><td class="r">${nf(r.final * (r.upc || 0))}</td></tr>`).join("")}</tbody></table></div><div class="row-sub">The Hangyo portal takes boxes. Place the order there, then mark it as placed so the next plan does not order it twice.</div>`,
    `<button class="btn btn-secondary" data-act="copyPO">${ic("copy", "sm")} Copy lines</button><button class="btn btn-primary" data-act="placePO">Mark PO as placed</button>`, true);
};
ACT.copyPO = () => copyText(D.repl.rows.filter((r) => r.final > 0).map((r) => `${r.name}\t${r.final} crates\t${r.final * (r.upc || 0)} boxes`).join("\n"), "PO lines copied");
ACT.placePO = () => {
  const now = NOW(), po = "HPO-" + stamp(now);
  D.repl.rows.filter((r) => r.final > 0).forEach((r) => { D.hpoLog.push({ placed: iso(now), po, pool: "Own stock", product: r.name, sap: r.sap, upc: r.upc, crates: r.final, boxes: r.final * (r.upc || 0), status: "Open", value: r.final * (r.upc || 0) * (ssRate(r.sap) || 0), received: 0, toCome: r.final }); r.onOrder = (r.onOrder || 0) + r.final; });
  logActivity("Hangyo PO placed", po, `${nf(replTotals().own)} crates`); closeSheet(); S.replTab = "orders"; render(); toast("PO marked as placed");
};
ACT.poSheet = (el) => {
  const lines = D.hpoLog.filter((l) => l.po === el.dataset.po), g = lines[0];
  openSheet(esc(g.po), `<div class="card card-pad"><div class="kv"><div><div class="k">Placed</div><div class="v">${fmtDT(g.placed)}</div></div><div><div class="k">Stock pool</div><div class="v">${esc(g.pool)}</div></div><div><div class="k">Crates</div><div class="v num">${nf(lines.reduce((a, l) => a + (l.crates || 0), 0))}</div></div><div><div class="k">Value at SS rate</div><div class="v num">${rs(lines.reduce((a, l) => a + (l.value || 0), 0))}</div></div></div></div>
    <div class="group">${lines.map((l) => `<div class="row"><span class="grow"><div class="row-title clip">${esc(shortName(l.product))}</div><div class="row-sub">${nf(l.crates)} crates · ${nf(l.boxes)} boxes${l.received ? " · " + nf(l.received) + " boxes received" : ""}${l.notes ? " · " + esc(l.notes) : ""}</div></span><span class="row-end">${statusPill(l.status)}</span></div>`).join("")}</div>`);
};

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
    <div class="page-head"><div><h1 class="title">Setup</h1><div class="subtitle">Distributors, products and prices, and a record of everything that was changed.</div></div></div>
    <div class="hstack gap-12 wrap">${seg("setupTab", tab, [["distributors", "Distributors", D.distributors.length], ["products", "Products & prices"], ["special", "Special prices"], ["activity", "Activity"]])}${searchable ? `<div class="search">${ic("search", "sm")}<input class="input" id="setup-q" type="search" placeholder="${tab === "distributors" ? "Search distributors" : "Search products, codes or categories"}" value="${esc(S.setupQ)}" data-in="setupQ" autocomplete="off"></div>` : ""}</div>
    <div id="setup-body">${tab === "distributors" ? distGrid() : tab === "products" ? catalogGrid() : tab === "special" ? specialHtml() : activityHtml()}</div></div>`;
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
      <div class="divider" style="margin:16px 0"></div><div class="kv"><div><div class="k">Orders in</div><div class="v">${esc(UNIT_LABEL[d.uom] || "Not set")}</div></div><div><div class="k">Payment</div><div class="v">${esc(d.pay || "Not set")}</div></div><div><div class="k">Credit</div><div class="v">${d.credit != null ? d.credit + " days" : "Not set"}</div></div><div><div class="k">Security deposit</div><div class="v num">${d.deposit ? rs(d.deposit) : "–"}</div></div><div><div class="k">Freezer</div><div class="v">${esc(d.freezer || "Not set")}</div></div><div><div class="k">Pick list name</div><div class="v">${esc(d.short || "–")}</div></div></div></div>
    ${perf ? `<div class="tiles" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div class="tile"><div class="tile-label">${esc(R.label)}</div><div class="tile-value">${rs(perf.now)}</div><div>${perf.prev > 0 ? growthChip(perf.now / perf.prev - 1) : ""}</div><div class="tile-sub">${perf.orders} order${perf.orders === 1 ? "" : "s"} · ${nf(perf.crates, 0)} crates</div></div><div class="tile"><div class="tile-label">Last dispatch</div><div class="tile-value">${fmtDate(perf.last)}</div><div class="tile-sub">${perf.days} day${perf.days === 1 ? "" : "s"} ago</div></div></div>` : ""}
    ${buy ? `<div class="banner tint">${ic("info", "sm")}<span><b>Buys ${buy.skus} products.</b> Most of all ${esc(shortName(buy.top))} (${pct(buy.topShare, 0)} of sales). Premium share ${pct(buy.premium, 0)}, entry level ${pct(buy.entry, 0)}.</span></div>` : ""}
    ${orders.length ? `<div><div class="group-label"><span>Orders</span><span>${orders.length}</span></div><div class="group">${orders.slice(0, 8).map((o) => `<button class="row" data-act="orderSheet" data-id="${o.id}"><span class="grow"><div class="row-title">${fmtDate(o.time)} · ${nf(o.crates)} crates</div><div class="row-sub">${o.lines} lines</div></span><span class="row-end">${statusPill(o.status)}<span class="row-value">${rs(o.value)}</span>${ic("chevR", "sm chev")}</span></button>`).join("")}</div></div>` : ""}`,
    `<button class="btn btn-primary" data-act="orderFor" data-name="${esc(d.name)}">${ic("plus", "sm")} New order for ${esc(d.short || d.name)}</button>`);
};
ACT.orderFor = (el) => { S.draft = newDraft(); S.draft.dist = el.dataset.name; closeSheet(); closeCmd(); go("new-order"); };

/* ===== MORE (phone) ===== */
VIEWS.more = () => `<div class="page narrow"><div class="page-head"><h1 class="title">More</h1></div>
  <div class="group">${[["quick", "Quick commerce", "Swiggy and Zepto POs, deliveries and GRN", "bolt", openQC().length], ["replenish", "Replenishment", "Plan the Hangyo truck", "cycle"], ["tod", "TOD & notes", "TOD due, credit and debit notes", "rupee"], ["setup", "Setup", "Distributors, products, prices, activity", "gear"]].map(([r, t, s, i, n]) => `<button class="row" data-act="nav" data-to="${r}"><span class="attn-ic tint">${ic(i)}</span><span class="grow"><div class="row-title">${t}</div><div class="row-sub">${s}</div></span><span class="row-end">${n ? `<span class="pill plain info">${n}</span>` : ""}${ic("chevR", "sm chev")}</span></button>`).join("")}</div>
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
  const screens = [["new-order", "New order", "plus"], ["home", "Home", "home"], ["orders", "Orders", "orders"], ["dispatch", "Dispatch", "truck"], ["quick", "Quick commerce", "bolt"], ["stock", "Stock", "box"], ["replenish", "Replenishment", "cycle"], ["tod", "TOD & notes", "rupee"], ["setup", "Setup", "gear"]];
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

/* ===== shell markup (sidebar + phone tab bar), then first render ===== */
(function buildShell() {
  const item = (r, extra = "") => `<button class="nav-item" data-act="nav" data-to="${r}" data-nav="${r}">${ic(ROUTES[r].icon)}<span>${ROUTES[r].label}</span>${extra}</button>`;
  $("#sidebar").innerHTML = `<div class="brand"><img src="${LOGO}" alt=""><div><div class="brand-name">Sahi<span>Reach</span></div><div class="brand-sub">Order Tool</div></div></div>
    ${item("home")}
    <div class="nav-label">Sell</div>${item("orders")}${item("dispatch", `<span class="nav-badge hot" id="badge-dispatch" hidden></span>`)}${item("quick", `<span class="nav-badge" id="badge-quick" hidden></span>`)}
    <div class="nav-label">Stock</div>${item("stock")}${item("replenish")}
    <div class="nav-label">Money</div>${item("tod")}
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
  return JSON.stringify(out);
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
