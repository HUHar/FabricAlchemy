// Spiel-Logik. Sprachneutral: alle Texte kommen aus I18N (src/i18n/<sprache>.js),
// alle Elemente aus EMOJI (src/data/elements.js), Rezepte aus RECIPES, Links aus LINKS.
(function(){
  const KEY = "fabric-alchemie-v2";
  const $ = s => document.querySelector(s);
  const ws = $("#ws"), list = $("#list"), side = $("#side");

  // --- Sprache ---
  // I18N_ALL enthält alle Sprachen (vom Build erzeugt). Gewählt wird: ?lang=… in der Adresse,
  // sonst die zuletzt gewählte Sprache, sonst die Browsersprache, sonst Deutsch.
  const LANG_KEY = "fabric-alchemie-lang";
  const langCodes = Object.keys(I18N_ALL);
  const langSel = $("#langSel");
  let I18N, ELEMENTS = {};   // aktuelle Sprache; ELEMENTS: ID → [Name, Symbol, Beschreibung]

  const T = (key, vars) => (I18N.ui[key] ?? key).replace(/\{(\w+)\}/g, (m, k) => vars && k in vars ? vars[k] : m);

  function pickLang(){
    let c = null;
    try{ c = new URLSearchParams(location.search).get("lang"); }catch(e){}
    if(!langCodes.includes(c)){ try{ c = localStorage.getItem(LANG_KEY); }catch(e){} }
    if(!langCodes.includes(c)) c = (navigator.language || "").slice(0, 2).toLowerCase();
    return langCodes.includes(c) ? c : (langCodes.includes("de") ? "de" : langCodes[0]);
  }

  function setLang(code, persist){
    I18N = I18N_ALL[code];
    ELEMENTS = {};
    Object.keys(EMOJI).forEach(id => { const [name, desc] = I18N.elements[id]; ELEMENTS[id] = [name, EMOJI[id], desc]; });
    document.documentElement.lang = I18N.lang;
    document.title = I18N.ui.title;
    document.querySelectorAll("[data-i18n]").forEach(n => n.textContent = T(n.dataset.i18n));
    document.querySelectorAll("[data-i18n-html]").forEach(n => n.innerHTML = T(n.dataset.i18nHtml));
    document.querySelectorAll("[data-i18n-title]").forEach(n => n.title = T(n.dataset.i18nTitle));
    document.querySelectorAll("[data-i18n-placeholder]").forEach(n => n.placeholder = T(n.dataset.i18nPlaceholder));
    langSel.value = code;
    if(persist){ try{ localStorage.setItem(LANG_KEY, code); }catch(e){} }
  }

  langCodes.forEach(c => { const o = document.createElement("option"); o.value = c; o.textContent = I18N_ALL[c].name || c; langSel.appendChild(o); });
  langSel.addEventListener("change", () => {
    setLang(langSel.value, true);
    hideTip(); $("#toast").classList.remove("show");
    renderList();
    ws.querySelectorAll(".item").forEach(n => { n.innerHTML = chipHTML(n.dataset.id); });
  });

  // Ein Zutatenpaar kann mehrere Ergebnisse haben; ein optionales 4. Feld nennt Zutaten, die erhalten bleiben.
  const recipeMap = new Map();
  RECIPES.forEach(([a,b,c,keep]) => {
    const k = [a,b].sort().join("|");
    const r = recipeMap.get(k) || {res:[], keep:new Set()};
    if(!r.res.includes(c)) r.res.push(c);
    (keep || []).forEach(x => r.keep.add(x));
    recipeMap.set(k, r);
  });
  const total = Object.keys(EMOJI).length;

  let found = [...BASE];
  let fresh = new Set();
  let won = false;

  function load(){
    try{
      const s = JSON.parse(localStorage.getItem(KEY));
      if(s && Array.isArray(s.found)){
        found = [...new Set([...BASE, ...s.found.filter(id => ELEMENTS[id])])];
        won = !!s.won;
      }
    }catch(e){}
  }
  function save(){
    try{ localStorage.setItem(KEY, JSON.stringify({found, won})); }catch(e){}
  }

  /* ---------- Sidebar ---------- */
  function chipHTML(id){ const [n,e] = ELEMENTS[id]; return `<span class="e">${e}</span><span>${n}</span>`; }

  function renderList(){
    const q = $("#search").value.trim().toLowerCase();
    list.innerHTML = "";
    found.forEach(id => {
      const name = ELEMENTS[id][0];
      if(q && !name.toLowerCase().includes(q)) return;
      const c = document.createElement("div");
      c.className = "chip" + (BASE.includes(id) ? " base" : "") + (fresh.has(id) ? " fresh" : "");
      c.dataset.id = id; c.innerHTML = chipHTML(id);
      c.addEventListener("pointerdown", ev => startDrag(ev, id, null));
      list.appendChild(c);
    });
    $("#bar").style.width = (found.length/total*100) + "%";
    $("#count").textContent = T("count", {n: found.length, total});
  }

  /* ---------- Arbeitsfläche ---------- */
  function updateEmpty(){ $("#empty").style.display = ws.querySelectorAll(".item").length ? "none" : "flex"; }

  function makeItem(id, x, y){
    const it = document.createElement("div");
    it.className = "item" + (BASE.includes(id) ? " base" : "");
    it.dataset.id = id; it.innerHTML = chipHTML(id); attachTip(it, id);
    it.style.left = x + "px"; it.style.top = y + "px";
    it.addEventListener("pointerdown", ev => startDrag(ev, id, it));
    it.addEventListener("dblclick", () => {
      const r = it.getBoundingClientRect(), w = ws.getBoundingClientRect();
      makeItem(id, r.left - w.left + r.width/2 + 24, r.top - w.top + r.height/2 + 24);
    });
    ws.appendChild(it);
    updateEmpty();
    return it;
  }

  /* ---------- Drag & Drop ---------- */
  let drag = null;

  function startDrag(ev, id, existing){
    if(ev.button !== undefined && ev.button !== 0) return;
    ev.preventDefault();
    const w = ws.getBoundingClientRect();
    let el = existing;
    if(!el) el = makeItem(id, ev.clientX - w.left, ev.clientY - w.top);
    el.classList.add("drag");
    el.style.zIndex = 50;
    const r = el.getBoundingClientRect();
    hideTip();
    drag = {
      id, el, target: null, sx: ev.clientX, sy: ev.clientY, moved: false, touch: ev.pointerType !== "mouse",
      dx: existing ? (r.left + r.width/2) - ev.clientX : 0,
      dy: existing ? (r.top + r.height/2) - ev.clientY : 0
    };
    moveDrag(ev);
  }

  function centerOf(el){ const r = el.getBoundingClientRect(); return {x:r.left+r.width/2, y:r.top+r.height/2, r}; }

  function findTarget(el){
    const a = centerOf(el);
    let best = null, bd = 1e9;
    ws.querySelectorAll(".item").forEach(o => {
      if(o === el) return;
      const b = centerOf(o);
      const overlap = a.r.left < b.r.right && a.r.right > b.r.left && a.r.top < b.r.bottom && a.r.bottom > b.r.top;
      const d = Math.hypot(a.x-b.x, a.y-b.y);
      if(overlap && d < bd){ bd = d; best = o; }
    });
    return best;
  }

  function overSide(ev){
    const r = side.getBoundingClientRect();
    return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
  }

  function moveDrag(ev){
    if(!drag) return;
    if(Math.hypot(ev.clientX - drag.sx, ev.clientY - drag.sy) > 6) drag.moved = true;
    const w = ws.getBoundingClientRect();
    drag.el.style.left = (ev.clientX + drag.dx - w.left) + "px";
    drag.el.style.top  = (ev.clientY + drag.dy - w.top) + "px";
    const t = findTarget(drag.el);
    if(t !== drag.target){
      if(drag.target) drag.target.classList.remove("target");
      if(t) t.classList.add("target");
      drag.target = t;
    }
    side.classList.toggle("trash", overSide(ev));
  }

  function endDrag(ev){
    if(!drag) return;
    const {el, target, id, moved, touch} = drag;
    drag = null;
    side.classList.remove("trash");
    el.classList.remove("drag"); el.style.zIndex = "";
    if(target) target.classList.remove("target");

    if(overSide(ev)){ el.remove(); updateEmpty(); return; }
    if(touch && !moved && !target) setTimeout(() => { if(el.isConnected) showTip(el, id); }, 0);

    // in die Fläche zurückholen
    const w = ws.getBoundingClientRect();
    let x = parseFloat(el.style.left), y = parseFloat(el.style.top);
    x = Math.max(40, Math.min(w.width-40, x));
    y = Math.max(24, Math.min(w.height-24, y));
    el.style.left = x + "px"; el.style.top = y + "px";

    if(target){
      const rec = recipeMap.get([id, target.dataset.id].sort().join("|"));
      if(rec){
        const a = centerOf(el), b = centerOf(target), ww = ws.getBoundingClientRect();
        const mx = (a.x+b.x)/2 - ww.left, my = (a.y+b.y)/2 - ww.top;
        // Zutaten entfernen – außer denen, die erhalten bleiben (dann zur Seite rücken)
        [[el, id, a.x - b.x], [target, target.dataset.id, b.x - a.x]].forEach(([node, nid, dx]) => {
          if(rec.keep.has(nid)){ node.style.left = (parseFloat(node.style.left) + (dx >= 0 ? 1 : -1) * 120) + "px"; }
          else node.remove();
        });
        const n = rec.res.length, nodes = [];
        rec.res.forEach((rid, i) => nodes.push(makeItem(rid, mx + (i - (n-1)/2) * 120, my + (rec.keep.size ? 60 : 0))));
        discoverAll(rec.res, nodes);
      } else {
        // keine Reaktion: leicht auseinanderschieben
        [el, target].forEach(n => { n.classList.remove("shake"); void n.offsetWidth; n.classList.add("shake"); });
        const dx = parseFloat(el.style.left) - parseFloat(target.style.left) || 1;
        el.style.left = (parseFloat(el.style.left) + Math.sign(dx)*70) + "px";
        toast("info", T("noReaction", {a: ELEMENTS[id][0], b: ELEMENTS[target.dataset.id][0]}));
      }
    }
  }

  document.addEventListener("pointermove", moveDrag);
  document.addEventListener("pointerup", endDrag);
  document.addEventListener("pointercancel", endDrag);

  /* ---------- Entdeckungen ---------- */
  function discoverAll(ids, nodes){
    const fresh_ = [];
    ids.forEach((id, i) => {
      if(nodes[i]) nodes[i].classList.add("glow");
      if(!found.includes(id)){ found.push(id); fresh.add(id); fresh_.push(id); }
    });
    if(!fresh_.length) return;
    save(); renderList();
    toast("", fresh_.map(id => { const [name, emoji, desc] = ELEMENTS[id]; return T("newFound", {emoji, name, desc}); }).join("<br><br>"));
    const chip = list.querySelector(`.chip[data-id="${fresh_[0]}"]`);
    if(chip) chip.scrollIntoView({block:"nearest"});
    if(fresh_.includes(GOAL) && !won){
      won = true; save();
      $("#winText").textContent = T("winText", {n: found.length, total}) + (found.length < total ? T("winMissing") : "");
      $("#win").classList.add("show");
    }
  }

  let toastTimer;
  function toast(cls, html){
    const t = $("#toast");
    t.className = cls || "";
    t.innerHTML = html;
    void t.offsetWidth;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
  }

  // "neu"-Markierung entfernen, sobald das Element benutzt wird
  list.addEventListener("pointerdown", ev => {
    const c = ev.target.closest(".chip");
    if(c && fresh.delete(c.dataset.id)) c.classList.remove("fresh");
  });

  /* ---------- Info-Karte mit Links ---------- */
  const tip = $("#tip"); let tipTimer;
  const esc = s => s.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

  function tipHTML(id){
    const [name, emoji, desc] = ELEMENTS[id];
    const [path, video] = LINKS[id] || [null, null];
    let s = `<div class="h">${emoji} ${esc(name)}</div><div class="d">${esc(desc)}</div>`;
    if(path) s += `<a href="${I18N.learn}${path}" target="_blank" rel="noopener">${T("learnLink")}</a>`;
    if(video) s += `<a href="${video}" target="_blank" rel="noopener">${T("videoLink")}</a>`;
    return s;
  }
  function showTip(el, id){
    clearTimeout(tipTimer);
    tip.innerHTML = tipHTML(id);
    tip.style.display = "block";
    const r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
    let x = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width/2 - w/2));
    let y = r.top - h - 6; if(y < 8) y = r.bottom + 6;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function hideTip(){ clearTimeout(tipTimer); tip.style.display = "none"; }
  function hideTipSoon(){ clearTimeout(tipTimer); tipTimer = setTimeout(hideTip, 250); }
  function attachTip(el, id){
    el.addEventListener("pointerenter", e => { if(e.pointerType === "mouse" && !drag) showTip(el, id); });
    el.addEventListener("pointerleave", e => { if(e.pointerType === "mouse") hideTipSoon(); });
  }
  tip.addEventListener("pointerenter", () => clearTimeout(tipTimer));
  tip.addEventListener("pointerleave", hideTipSoon);
  document.addEventListener("pointerdown", e => { if(!tip.contains(e.target)) hideTip(); }, true);

  /* ---------- Buttons ---------- */
  $("#search").addEventListener("input", renderList);
  $("#clearBtn").addEventListener("click", () => { ws.querySelectorAll(".item").forEach(n => n.remove()); updateEmpty(); });
  $("#resetBtn").addEventListener("click", () => {
    if(!confirm(T("resetConfirm"))) return;
    found = [...BASE]; fresh.clear(); won = false; save();
    ws.querySelectorAll(".item").forEach(n => n.remove()); updateEmpty(); renderList();
  });
  $("#winClose").addEventListener("click", () => $("#win").classList.remove("show"));
  $("#hintBtn").addEventListener("click", () => {
    const open = RECIPES.filter(([a,b,c]) => found.includes(a) && found.includes(b) && !found.includes(c));
    if(!open.length){
      toast("info", found.length >= total ? T("allFound") : T("noHint"));
      return;
    }
    const [a,b] = open[Math.floor(Math.random()*open.length)];
    toast("info", T("hintMsg", {a: ELEMENTS[a][0], b: ELEMENTS[b][0]}));
    [a,b].forEach(id => {
      const c = list.querySelector(`.chip[data-id="${id}"]`);
      if(c){ c.classList.add("hint"); setTimeout(() => c.classList.remove("hint"), 3000); }
    });
  });

  setLang(pickLang(), false);
  load(); renderList(); updateEmpty();
})();
