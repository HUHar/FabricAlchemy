// Baut aus src/ eine eigenständige HTML-Datei mit allen Sprachen und Sprachumschalter: dist/fabric-alchemie.html
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
const dataFiles = ["data/elements.js", "data/recipes.js", "data/links.js"];
const dataCode = dataFiles.map(read).join("\n");
const {EMOJI, RECIPES, BASE, GOAL, LINKS} =
  new Function(dataCode + ";return {EMOJI,RECIPES,BASE,GOAL,LINKS}")();

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

// ---------- Sprachen laden ----------
const langDir = src("i18n");
const langs = fs.readdirSync(langDir).filter(f => f.endsWith(".js")).map(f => f.slice(0, -3));
if (!langs.includes("de")) errors.push("src/i18n/de.js fehlt (Ausgangssprache)");
const de = langs.includes("de") ? require(path.join(langDir, "de.js")) : null;

if (de) {
  ids.filter(x => !de.elements[x]).forEach(x => errors.push(`de.js: Text für "${x}" fehlt`));
  Object.keys(de.elements).filter(x => !EMOJI[x]).forEach(x => errors.push(`de.js: unbekanntes Element "${x}"`));
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
    builds.push({
      lang: l,
      i18n: {lang: t.lang || l, name: t.name || l, learn: t.learn, ui: {...de.ui, ...t.ui}, elements: {...de.elements, ...t.elements}}
    });
  }
}

// ---------- Ausgabe ----------
warnings.forEach(w => console.log("Hinweis:", w));
if (errors.length) {
  errors.forEach(e => console.error("FEHLER:", e));
  process.exit(1);
}
console.log(`Daten ok: ${ids.length} Elemente, ${RECIPES.length} Rezepte, Sprachen: ${langs.join(", ")}`);
if (checkOnly) process.exit(0);

const template = read("template.html");
const style = read("style.css");
const engine = read("game.js");
const safe = s => s.replace(/<\/(script)/gi, "<\\/$1");
fs.mkdirSync(path.join(root, "dist"), {recursive: true});

// Alte Einzelsprach-Dateien aus früheren Builds entfernen
fs.readdirSync(path.join(root, "dist")).filter(f => /^fabric-alchemie\.[a-z-]+\.html$/i.test(f))
  .forEach(f => fs.unlinkSync(path.join(root, "dist", f)));

const all = {};
builds.forEach(b => { all[b.lang] = b.i18n; });
const first = builds.find(b => b.lang === "de") || builds[0];
const scripts = [`const I18N_ALL = ${safe(JSON.stringify(all))};`, dataCode, engine].join("\n");
const html = template
  .replace("{{LANG}}", first.i18n.lang)
  .replace("{{TITLE}}", () => first.i18n.ui.title)
  .replace("{{STYLE}}", () => style)
  .replace("{{SCRIPTS}}", () => scripts);
const out = path.join("dist", "fabric-alchemie.html");
fs.writeFileSync(path.join(root, out), html);
console.log("geschrieben:", out, `(${Math.round(html.length / 1024)} KB, Sprachen: ${builds.map(b => b.lang).join(", ")})`);
