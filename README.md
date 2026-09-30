# Fabric Alchemie

**Jetzt spielen: https://huhar.github.io/FabricAlchemy/** (Englisch direkt: https://huhar.github.io/FabricAlchemy/?lang=en)

Ein God-Game (Little-Alchemy-Prinzip) rund um Microsoft Fabric und Datenthemen.
Aus den vier Grundelementen Daten, Rechenleistung, Speicher und Netzwerk entstehen per Drag & Drop neue Elemente.

## Ablage

```
build.js                  baut docs/index.html aus src/ und prüft vorher alle Daten
src/
  template.html           HTML-Gerüst, ohne feste Texte
  style.css               Aussehen
  game.js                 Spiel-Logik, sprachneutral
  data/                   sprachneutral
    elements.js           alle Element-IDs mit Symbol
    recipes.js            Rezepte, Grundelemente, Ziel
    links.js              Learn-Pfade (ohne Sprachkürzel) und optionale Video-Links
  i18n/                   eine Datei pro Sprache
    de.js                 Oberflächentexte + Name/Beschreibung jedes Elements
    en.js                 englische Version (vollständig)
docs/                     fertige, eigenständige HTML-Datei (erzeugt, nicht von Hand ändern)
  index.html              enthält alle Sprachen und einen Sprachumschalter
```

Die Datei `docs/index.html` enthält alles (Stil, Daten, alle Sprachen, Logik) und läuft per Doppelklick im Browser.

## Sprachumschalter

Oben rechts wählt man die Sprache. Das Spiel wechselt sofort, ohne Spielstand oder Arbeitsfläche zu verlieren.
Beim Start gilt: `?lang=en` in der Adresse, sonst die zuletzt gewählte Sprache (im Browser gespeichert, Schlüssel `fabric-alchemie-lang`), sonst die Browsersprache, sonst Deutsch.
Jede Datei in `src/i18n/` erscheint automatisch im Umschalter, angezeigt wird ihr Feld `name`.

## Bauen

```bash
node build.js            # alle Sprachen einbauen
node build.js de         # nur die genannten Sprachen einbauen
node build.js --check    # nur prüfen, nichts schreiben
```

`build.js` bricht mit einer Fehlermeldung ab, wenn ein Rezept ein unbekanntes Element nennt, ein Rezept doppelt vorkommt, ein Element nicht erreichbar ist oder für ein Element Link oder deutscher Text fehlt.
Fehlen Texte in einer anderen Sprache, wird der deutsche Text als Ersatz genommen und der Build meldet, wie viele Elemente noch offen sind.

## Neues Element anlegen

1. `src/data/elements.js`: ID und Symbol eintragen
2. `src/i18n/de.js` (und wenn vorhanden `en.js`): `id: ["Name", "Beschreibung"]`
3. `src/data/links.js`: `id: ["/learn-pfad", null]` (`null` = kein Link)
4. `src/data/recipes.js`: mindestens ein Rezept, das das Element erzeugt
5. `node build.js`

## Rezepte

Format: `["zutatA", "zutatB", "ergebnis"]`, optional als 4. Feld die Zutaten, die erhalten bleiben: `["datensatz","copyact","kopie",["copyact"]]`.
Ein Ergebnis darf mehrere Rezepte haben, und ein Zutatenpaar darf mehrere Ergebnisse liefern (jeweils ein Eintrag pro Ergebnis).

## Neue Sprache

1. `src/i18n/en.js` als Vorlage kopieren, z. B. nach `fr.js`
2. `lang`, `name` (Anzeige im Umschalter), `learn` (Learn-Adresse mit Sprachkürzel, z. B. `https://learn.microsoft.com/fr-fr`), `ui` und nach und nach `elements` übersetzen
3. `node build.js` – die neue Sprache erscheint im Umschalter

Die Learn-Pfade in `links.js` sind in allen Sprachen gleich. Sie wurden für `de-de` und `en-us` geprüft, für andere Sprachen nicht.

## Spielstand

Der Spielstand liegt im Browser (`localStorage`, Schlüssel `fabric-alchemie-v2`) und enthält nur Element-IDs. Er funktioniert deshalb in jeder Sprache gleich.

## Veröffentlichen mit GitHub Pages

`docs/index.html` wird von GitHub Pages direkt ausgeliefert.

1. Repo auf GitHub anlegen (für kostenlose Pages öffentlich) und den Ordner hochladen: `git init -b main`, `git add .`, `git commit`, `git remote add origin …`, `git push -u origin main`
2. Auf GitHub: **Settings → Pages → Build and deployment → Source: „Deploy from a branch“**, Branch `main`, Ordner `/docs`, speichern
3. Nach ein bis zwei Minuten läuft das Spiel unter https://huhar.github.io/FabricAlchemy/

Nach jeder Änderung: `node build.js`, dann `git add`, `git commit` und `git push`.
