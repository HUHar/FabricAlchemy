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
    links.js              Learn-Pfade (ohne Sprachkürzel), eigene Web-Adressen und optionale Video-Links
    categories.js         Ordner der Elementliste: welches Element in welchen Ordner gehört
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
2. `src/i18n/de.js` und `en.js`: `id: ["Name", "Beschreibung"]`
3. `src/data/links.js`: `id: ["/learn-pfad", null]` (`null` = kein Link)
4. `src/data/categories.js`: das Element in genau einen Ordner eintragen
5. `src/data/recipes.js`: mindestens ein Rezept, das das Element erzeugt
6. `node build.js` – baut das Spiel und aktualisiert `kombinationen.csv`

## Rezepte

Format: `["zutatA", "zutatB", "ergebnis"]`, optional als 4. Feld die Zutaten, die erhalten bleiben: `["datensatz","copyact","kopie",["copyact"]]`.
Ein Ergebnis darf mehrere Rezepte haben, und ein Zutatenpaar darf mehrere Ergebnisse liefern (jeweils ein Eintrag pro Ergebnis).

## Neue Sprache

1. `src/i18n/en.js` als Vorlage kopieren, z. B. nach `fr.js`
2. `lang`, `name` (Anzeige im Umschalter), `learn` (Learn-Adresse mit Sprachkürzel, z. B. `https://learn.microsoft.com/fr-fr`), `ui` und nach und nach `elements` übersetzen
3. `node build.js` – die neue Sprache erscheint im Umschalter

Die Learn-Pfade in `links.js` sind in allen Sprachen gleich. Sie wurden für `de-de` und `en-us` geprüft, für andere Sprachen nicht.

## Ordner und finale Elemente

Die Elementliste ist in Ordner einsortiert (Grundlagen, Dateien, Datenbanken, Fabric-Plattform, Datenintegration, Echtzeit, Data Engineering, Power BI, KI, Governance, Kapazität, Cloud, DevOps, Rollen, Spaß). Ordner lassen sich ein- und ausklappen; der Zustand wird im Browser gemerkt. Ein Ordner mit neuen Elementen klappt von selbst auf.
Die Ordner stehen in `src/data/categories.js`, ihre Namen je Sprache unter `folders` in `src/i18n/*.js`. `build.js` prüft, dass jedes Element in genau einem Ordner liegt.

Ein **roter Punkt** kennzeichnet finale Elemente. Das sind Elemente, die in keinem Rezept als Zutat vorkommen, sich also nicht weiter kombinieren lassen. Die Markierung wird beim Start aus den Rezepten berechnet und passt sich automatisch an, wenn ein Element später als Zutat verwendet wird. Ein **oranger Punkt** zeigt neu entdeckte Elemente.

## Spielstand

Der Spielstand liegt im Browser (`localStorage`, Schlüssel `fabric-alchemie-v2`) und enthält nur Element-IDs. Er funktioniert deshalb in jeder Sprache gleich. Eingeklappte Ordner und die Sprache werden getrennt davon gespeichert.
