// Baut aus src/ eine eigenständige HTML-Datei mit allen Sprachen und Sprachumschalter: docs/index.html (von GitHub Pages direkt auslieferbar)
//   node build.js              alle Sprachen einbauen
//   node build.js de en        nur die genannten Sprachen einbauen
//   node build.js --check      nur prüfen, nichts schreiben
// Vor dem Bauen werden Daten und Übersetzungen geprüft; bei Fehlern wird nichts geschrieben.
const fs = require("fs");
const path = require("path");

const root = __dirname;
const src = p => path.join(root, "src", p);
const read = p => fs.readFileSync(src(p), "utf8");

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const only = args.filter(a => !a.startsWith("--"));

// ---------- Daten laden ----------
const dataFiles = ["data/elements.js", "data/recipes.js", "data/links.js", "data/categories.js"];
const dataCode = dataFiles.map(read).join("\n");
const {EMOJI, RECIPES, BASE, GOAL, LINKS, CATEGORIES} =
  new Function(dataCode + ";return {EMOJI,RECIPES,BASE,GOAL,LINKS,CATEGORIES}")();

const errors = [], warnings = [];
const ids = Object.keys(EMOJI);

// ---------- Daten prüfen ----------
const seen = new Set();
for (const [a, b, c, keep] of RECIPES) {
  for (const x of [a, b, c, ...(keep || [])]) if (!EMOJI[x]) errors.push(`Rezept ${a}+${b}=${c}: unbekanntes Element "${x}"`);
  const k = [a, b].sort().join("|") + ">" + c;
  if (seen.has(k)) errors.push(`Rezept doppelt: ${a}+${b}=${c}`);
  seen.add(k);
}
BASE.forEach(x => { if (!EMOJI[x]) errors.push(`Grundelement "${x}" fehlt in elements.js`); });
if (!EMOJI[GOAL]) errors.push(`Ziel "${GOAL}" fehlt in elements.js`);

const reach = new Set(BASE);
for (let changed = true; changed;) {
  changed = false;
  for (const [a, b, c] of RECIPES) if (reach.has(a) && reach.has(b) && !reach.has(c)) { reach.add(c); changed = true; }
}
ids.filter(x => !reach.has(x)).forEach(x => errors.push(`Element "${x}" ist nicht erreichbar`));
ids.filter(x => !LINKS[x]).forEach(x => errors.push(`links.js: Eintrag für "${x}" fehlt`));
Object.keys(LINKS).filter(x => !EMOJI[x]).forEach(x => errors.push(`links.js: unbekanntes Element "${x}"`));

// Ordner: jedes Element in genau einem Ordner
const folderOf = {};
const folderIds = CATEGORIES.map(c => c[0]);
folderIds.filter((f, i) => folderIds.indexOf(f) !== i).forEach(f => errors.push(`categories.js: Ordner "${f}" doppelt`));
for (const [f, els] of CATEGORIES) {
  if (!els.length) errors.push(`categories.js: Ordner "${f}" ist leer`);
  for (const x of els) {
    if (!EMOJI[x]) errors.push(`categories.js: unbekanntes Element "${x}" in Ordner "${f}"`);
    else if (folderOf[x]) errors.push(`categories.js: "${x}" steht in "${folderOf[x]}" und "${f}"`);
    else folderOf[x] = f;
  }
}
ids.filter(x => !folderOf[x]).forEach(x => errors.push(`categories.js: Element "${x}" gehört in keinen Ordner`));

// Finale Elemente: kommen in keinem Rezept als Zutat vor (im Spiel mit rotem Punkt markiert)
const usedAsIngredient = new Set(RECIPES.flatMap(r => [r[0], r[1]]));
const finals = new Set(ids.filter(x => !usedAsIngredient.has(x)));

// ---------- Sprachen laden ----------
const langDir = src("i18n");
const langs = fs.readdirSync(langDir).filter(f => f.endsWith(".js")).map(f => f.slice(0, -3));
if (!langs.includes("de")) errors.push("src/i18n/de.js fehlt (Ausgangssprache)");
const de = langs.includes("de") ? require(path.join(langDir, "de.js")) : null;

if (de) {
  ids.filter(x => !de.elements[x]).forEach(x => errors.push(`de.js: Text für "${x}" fehlt`));
  Object.keys(de.elements).filter(x => !EMOJI[x]).forEach(x => errors.push(`de.js: unbekanntes Element "${x}"`));
  folderIds.filter(f => !(de.folders || {})[f]).forEach(f => errors.push(`de.js: Ordnername für "${f}" fehlt (folders)`));
}

const todo = only.length ? only : langs;
todo.filter(l => !langs.includes(l)).forEach(l => errors.push(`Unbekannte Sprache "${l}" (vorhanden: ${langs.join(", ")})`));

const builds = [];
if (!errors.length) {
  for (const l of todo) {
    const t = require(path.join(langDir, l + ".js"));
    Object.keys(t.elements).filter(x => !EMOJI[x]).forEach(x => errors.push(`${l}.js: unbekanntes Element "${x}"`));
    const missingEl = ids.filter(x => !t.elements[x]);
    const missingUi = Object.keys(de.ui).filter(k => !(k in t.ui));
    if (l !== "de") {
      if (missingEl.length) warnings.push(`${l}: ${missingEl.length} von ${ids.length} Elementen noch nicht übersetzt (deutscher Text wird verwendet)`);
      if (missingUi.length) warnings.push(`${l}: Oberflächentexte fehlen: ${missingUi.join(", ")} (deutscher Text wird verwendet)`);
    }
    const missingFolders = folderIds.filter(f => !(t.folders || {})[f]);
    if (l !== "de" && missingFolders.length) warnings.push(`${l}: Ordnernamen fehlen: ${missingFolders.join(", ")} (deutscher Text wird verwendet)`);
    builds.push({
      lang: l,
      i18n: {lang: t.lang || l, name: t.name || l, learn: t.learn, ui: {...de.ui, ...t.ui},
             folders: {...de.folders, ...t.folders}, elements: {...de.elements, ...t.elements}}
    });
  }
}

// ---------- Ausgabe ----------
warnings.forEach(w => console.log("Hinweis:", w));
if (errors.length) {
  errors.forEach(e => console.error("FEHLER:", e));
  process.exit(1);
}
console.log(`Daten ok: ${ids.length} Elemente in ${CATEGORIES.length} Ordnern (${finals.size} final), ${RECIPES.length} Rezepte, Sprachen: ${langs.join(", ")}`);
if (checkOnly) process.exit(0);

const template = read("template.html");
const style = read("style.css");
const engine = read("game.js");
const safe = s => s.replace(/<\/(script)/gi, "<\\/$1");
fs.mkdirSync(path.join(root, "docs"), {recursive: true});


const all = {};
builds.forEach(b => { all[b.lang] = b.i18n; });
const first = builds.find(b => b.lang === "de") || builds[0];
const scripts = [`const I18N_ALL = ${safe(JSON.stringify(all))};`, dataCode, engine].join("\n");
const html = template
  .replace("{{LANG}}", first.i18n.lang)
  .replace("{{TITLE}}", () => first.i18n.ui.title)
  .replace("{{STYLE}}", () => style)
  .replace("{{SCRIPTS}}", () => scripts);
const out = path.join("docs", "index.html");
fs.writeFileSync(path.join(root, out), html);
console.log("geschrieben:", out, `(${Math.round(html.length / 1024)} KB, Sprachen: ${builds.map(b => b.lang).join(", ")})`);

// ---------- Kombinationen als CSV ----------
// Eine Zeile pro Rezept (Zutatenpaar → ein Ergebnis); ein Paar mit mehreren Ergebnissen hat mehrere Zeilen.
// Trennzeichen ";" und UTF-8 mit BOM, damit Excel mit deutschen Einstellungen Spalten und Umlaute richtig liest.
const nameOf = (b, id) => b.i18n.elements[id][0];
const csvCell = v => /[;"\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
const ref = builds.find(b => b.lang === "de") || builds[0];
const rows = RECIPES.map(([a, b, c, keep]) => {
  const [x, y] = [a, b].sort((p, q) => nameOf(ref, p).localeCompare(nameOf(ref, q), ref.lang));
  return {x, y, c, keep: keep || []};
}).sort((r, s) =>
  nameOf(ref, r.c).localeCompare(nameOf(ref, s.c), ref.lang) ||
  nameOf(ref, r.x).localeCompare(nameOf(ref, s.x), ref.lang) ||
  nameOf(ref, r.y).localeCompare(nameOf(ref, s.y), ref.lang));
const header = [
  ...builds.flatMap(b => [`Zutat A (${b.lang})`, `Zutat B (${b.lang})`, `Ergebnis (${b.lang})`, `Bleibt erhalten (${b.lang})`]),
  ...builds.map(b => `Ordner Ergebnis (${b.lang})`),
  "Ergebnis ist final",
  "ID Zutat A", "ID Zutat B", "ID Ergebnis"
];
const lines = [header, ...rows.map(r => [
  ...builds.flatMap(b => [nameOf(b, r.x), nameOf(b, r.y), nameOf(b, r.c), r.keep.map(k => nameOf(b, k)).join(" + ")]),
  ...builds.map(b => b.i18n.folders[folderOf[r.c]]),
  finals.has(r.c) ? "ja" : "nein",
  r.x, r.y, r.c
])].map(cols => cols.map(csvCell).join(";"));
fs.writeFileSync(path.join(root, "kombinationen.csv"), "﻿" + lines.join("\r\n") + "\r\n");
console.log("geschrieben: kombinationen.csv", `(${rows.length} Zeilen)`);
