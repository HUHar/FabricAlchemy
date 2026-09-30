// Sprachneutral: Rezepte, Grundelemente und Ziel.
// Element-IDs werden in elements.js definiert, ihre Namen stehen in src/i18n/<sprache>.js.
// [Zutat A, Zutat B, Ergebnis, (optional) Zutaten, die erhalten bleiben]
// Ein Ergebnis darf mehrere Rezepte haben, und ein Zutatenpaar darf mehrere Ergebnisse liefern.
const RECIPES = [
  // --- Grundlagen ---
  ["daten","daten","datensatz"],["rechen","netz","server"],["speicher","rechen","cache"],
  ["daten","rechen","skript"],["daten","speicher","datei"],["daten","netz","fabric"],
  ["rechen","rechen","uhr"],["netz","netz","bewegung"],["speicher","netz","cloud"],
  ["tabelle","speicher","datenbank"],["daten","server","sqlserver"],
  ["fabric","skript","notebook"],
  ["uhr","uhr","sekunde"],["skript","datensatz","transformation"],["datensatz","uhr","ereignis"],
  ["skript","netz","aktion"],["datei","datei","kopie"],["cache","netz","abkuerzung"],
  ["datensatz","rechen","sensor"],["sensor","netz","iot"],["uhr","datei","batch"],["skript","uhr","orchestrierung"],
  ["datenbank","netz","quelle"],["datenbank","speicher","ziel"],["transformation","bewegung","etl"],
  ["visual","skript","lowcode"],["tabelle","rechen","analyse"],["datenbank","rechen","abfrage"],
  ["abfrage","datei","suche"],["ml","rechen","ki"],["cloud","rechen","kapazitaet"],["cloud","server","azure"],

  // --- Fabric-Kern ---
  ["fabric","speicher","onelake"],["datei","cloud","onelake"],
  ["fabric","kapazitaet","fabcap"],["fabric","rechen","fabcap"],["fabric","server","arbeitsbereich"],
  ["onelake","tabelle","lakehouse"],["daten","spark","lakehouse"],["spark","delta","lakehouse"],
  ["delta","onelake","lakehouse"],["medallion","fabric","lakehouse"],
  ["fabric","datenbank","warehouse"],["daten","sql","warehouse"],["sql","onelake","warehouse"],
  ["datensatz","netz","datenstrom"],

  // --- Echtzeit ---
  ["fabric","datenstrom","eventstream"],["daten","ereignis","eventstream"],["ereignis","datenstrom","eventstream"],
  ["datenstrom","onelake","eventstream"],["datenstrom","transformation","eventstream"],["ereignis","sensor","eventstream"],
  ["eventstream","datenbank","eventhouse"],["ereignis","analyse","eventhouse"],["daten","kql","eventhouse"],["datenstrom","kql","eventhouse"],
  ["eventstream","skript","kql"],
  ["eventhouse","fabric","echtzeit"],["daten","uhr","echtzeit"],["iot","fabric","echtzeit"],
  ["sensor","sekunde","echtzeit"],["datenstrom","uhr","echtzeit"],
  ["tabelle","skript","kennzahl"],["eventstream","kennzahl","aktivator"],["ereignis","aktion","aktivator"],
  ["aktivator","kennzahl","alert"],

  // --- Power BI ---
  ["kennzahl","skript","dax"],["dataflow","skript","m"],["tabelle","tabelle","beziehung"],
  ["beziehung","kennzahl","semmodell"],["lakehouse","powerbi","semmodell"],["warehouse","powerbi","semmodell"],["daten","dax","semmodell"],
  ["kennzahl","datensatz","visual"],["visual","visual","bericht"],
  ["fabric","bericht","powerbi"],["semmodell","bericht","powerbi"],["daten","visual","powerbi"],
  ["semmodell","lakehouse","directlake"],["onelake","powerbi","directlake"],["semmodell","onelake","directlake"],
  ["bericht","bericht","dashboard"],

  // --- Data Factory ---
  ["fabric","dataflow","factory"],["daten","bewegung","factory"],["daten","pipeline","factory"],["etl","orchestrierung","factory"],
  ["daten","transformation","dataflow"],["daten","m","dataflow"],["etl","lowcode","dataflow"],["transformation","lowcode","dataflow"],
  ["batch","orchestrierung","pipeline"],["quelle","ziel","copyact"],["pipeline","datei","copyjob"],

  // --- Verknüpfung & Spiegelung ---
  ["onelake","datei","verknuepfung"],["daten","abkuerzung","verknuepfung"],["adls","onelake","verknuepfung"],
  ["s3","onelake","verknuepfung"],["databricks","onelake","verknuepfung"],["snowflake","onelake","verknuepfung"],
  ["sqlserver","onelake","spiegelung"],["sap","lakehouse","spiegelung"],["sqlserver","fabric","spiegelung"],
  ["azuresql","fabric","spiegelung"],["cosmos","fabric","spiegelung"],["snowflake","fabric","spiegelung"],
  ["datenbank","kopie","spiegelung"],
  ["sqlserver","skript","sql"],["sql","lakehouse","sqlendpunkt"],

  // --- Notebook & Spark ---
  ["notebook","skript","sprachen"],["daten","python","notebook"],["daten","pyspark","notebook"],
  ["notebook","server","spark"],["python","spark","pyspark"],["sprachen","datei","python"],["sprachen","server","scala"],
  ["sprachen","kennzahl","r"],["spark","sql","sparksql"],["server","server","cluster"],["spark","cluster","sparkpool"],
  ["datei","tabelle","parquet"],["parquet","lakehouse","delta"],["parquet","cache","vorder"],

  // --- Medallion ---
  ["lakehouse","datei","bronze"],["bronze","dataflow","silber"],["silber","notebook","gold"],["silber","dataflow","gold"],
  ["bronze","gold","medallion"],["bronze","silber","medallion"],["silber","gold","medallion"],
  ["spark","lakehouse","dataeng"],

  // --- KI & Data Science ---
  ["notebook","kennzahl","ml"],["ml","datensatz","mlmodell"],["ml","notebook","experiment"],
  ["experiment","mlmodell","datascience"],["daten","notebook","datascience"],["daten","ki","datascience"],["ki","notebook","datascience"],
  ["ki","skript","copilot"],["fabric","copilot","copilotfab"],["ki","fabric","copilotfab"],
  ["copilotfab","semmodell","agent"],["notebook","semmodell","semlink"],

  // --- Sicherheit & Governance ---
  ["arbeitsbereich","datensatz","berechtigung"],["berechtigung","netz","sicherheit"],
  ["berechtigung","datensatz","onelakesec"],["daten","sicherheit","onelakesec"],["berechtigung","onelake","onelakesec"],
  ["onelake","datenbank","katalog"],["daten","governance","katalog"],["daten","suche","katalog"],
  ["domaene","daten","katalog"],["suche","onelake","katalog"],["domaene","governance","katalog"],
  ["sicherheit","katalog","governance"],["governance","fabric","purview"],["katalog","datenstrom","herkunft"],
  ["fabric","sicherheit","mandant"],["mandant","arbeitsbereich","domaene"],["domaene","netz","datamesh"],

  // --- Kapazität & Optimierung ---
  ["cluster","rechen","skalierung"],["skalierung","kapazitaet","sku"],["skalierung","kennzahl","optimierung"],
  ["delta","server","partition"],["tabelle","cache","index"],
  ["azure","sqlserver","synapse"],["azure","datei","adls"],["speicher","cloud","s3"],["spark","cloud","databricks"],
  ["datenbank","cloud","cosmos"],["azure","datenbank","azuresql"],["warehouse","cloud","snowflake"],["server","datenbank","sap"],

  // --- Git, Deployment, Betrieb ---
  ["skript","speicher","gitgen"],["gitgen","netz","github"],["azure","gitgen","azdevops"],
  ["arbeitsbereich","skript","gitint"],["daten","gitgen","gitint"],["fabric","azdevops","gitint"],["fabric","github","gitint"],
  ["skript","server","entwicklung"],["entwicklung","datensatz","test"],["test","cloud","produktion"],["skript","cloud","bereitstellung"],
  ["gitint","pipeline","deploy"],["entwicklung","bereitstellung","deploy"],["entwicklung","test","deploy"],
  ["test","produktion","deploy"],["entwicklung","produktion","deploy"],
  ["kennzahl","uhr","monitoring"],["fabric","monitoring","monhub"],
  ["berechtigung","server","admin"],["fabric","admin","adminportal"],
  ["abfrage","netz","rest"],["fabric","rest","restapi"],["skript","azure","terraform"],["fabric","terraform","restapi"],
  ["skript","datei","cli"],["fabric","cli","fabcli"],

  // --- Weitere Wege ---
  ["fabric","orchestrierung","pipeline"],["uhr","transformation","pipeline"],["uhr","notebook","pipeline"],["uhr","semmodell","pipeline"],
  ["skript","datenbank","sql"],["rechen","datei","skript"],["datensatz","speicher","datei"],["netz","datei","bewegung"],
  ["cloud","daten","fabric"],["datensatz","datei","tabelle"],["sql","server","sqlserver"],
  ["server","speicher","cache"],["sensor","uhr","ereignis"],["skript","ereignis","aktion"],["datei","bewegung","kopie"],
  ["sensor","cloud","iot"],["uhr","tabelle","batch"],["aktion","uhr","orchestrierung"],["datei","speicher","ziel"],
  ["quelle","transformation","etl"],["dataflow","visual","lowcode"],["daten","kennzahl","analyse"],["mlmodell","rechen","ki"],
  ["cluster","cloud","kapazitaet"],["tabelle","transformation","dataflow"],["fabric","transformation","dataflow"],["m","datensatz","transformation"],
  ["dataflow","tabelle","transformation"],["dataflow","sprachen","m"],["fabric","berechtigung","arbeitsbereich"],["tabelle","sql","warehouse"],
  ["fabric","sprachen","notebook"],["python","fabric","notebook"],["ereignis","ereignis","datenstrom"],["iot","datenstrom","eventstream"],
  ["kql","datenbank","eventhouse"],["datenstrom","datenbank","eventhouse"],["abfrage","ereignis","kql"],["abfrage","datenstrom","kql"],
  ["eventhouse","skript","kql"],["eventstream","analyse","echtzeit"],["ereignis","sekunde","echtzeit"],["eventstream","aktion","aktivator"],
  ["datenstrom","aktion","aktivator"],["fabric","aktion","aktivator"],["kennzahl","aktion","alert"],["kennzahl","ereignis","alert"],
  ["analyse","datensatz","kennzahl"],["dax","tabelle","kennzahl"],["semmodell","skript","dax"],["semmodell","tabelle","beziehung"],
  ["dax","beziehung","semmodell"],["powerbi","tabelle","semmodell"],["analyse","kennzahl","visual"],["visual","semmodell","bericht"],
  ["visual","kennzahl","bericht"],["fabric","visual","powerbi"],["semmodell","delta","directlake"],["powerbi","delta","directlake"],
  ["bericht","powerbi","dashboard"],["visual","bericht","dashboard"],["fabric","pipeline","factory"],["pipeline","dataflow","factory"],
  ["fabric","etl","factory"],["daten","orchestrierung","pipeline"],["orchestrierung","bewegung","pipeline"],["copyact","orchestrierung","pipeline"],
  ["quelle","kopie","copyact"],["kopie","ziel","copyact"],["daten","kopie","copyact"],["pipeline","kopie","copyact"],
  ["kopie","fabric","copyjob"],["copyact","fabric","copyjob"],["abkuerzung","onelake","verknuepfung"],["datei","abkuerzung","verknuepfung"],
  ["kopie","sqlserver","spiegelung"],["kopie","onelake","spiegelung"],["sqlserver","sprachen","sql"],["abfrage","skript","sql"],
  ["warehouse","skript","sql"],["sprachen","datenbank","sql"],["lakehouse","abfrage","sqlendpunkt"],["sql","delta","sqlendpunkt"],
  ["spark","skript","sprachen"],["cluster","notebook","spark"],["skript","cluster","spark"],["python","sparkpool","pyspark"],
  ["sprachen","analyse","python"],["spark","sprachen","scala"],["analyse","skript","r"],["sql","notebook","sparksql"],
  ["sql","cluster","sparksql"],["server","netz","cluster"],["spark","kapazitaet","sparkpool"],["cluster","pyspark","sparkpool"],
  ["datei","analyse","parquet"],["parquet","tabelle","delta"],["parquet","onelake","delta"],["parquet","optimierung","vorder"],
  ["delta","optimierung","vorder"],["delta","cache","vorder"],["lakehouse","daten","bronze"],["lakehouse","kopie","bronze"],
  ["bronze","transformation","silber"],["bronze","notebook","silber"],["bronze","skript","silber"],["bronze","spark","silber"],
  ["silber","transformation","gold"],["silber","spark","gold"],["silber","analyse","gold"],["silber","skript","gold"],
  ["gold","lakehouse","medallion"],["notebook","lakehouse","dataeng"],["pipeline","lakehouse","dataeng"],["spark","fabric","dataeng"],
  ["analyse","notebook","ml"],["python","analyse","ml"],["experiment","datensatz","mlmodell"],["ml","tabelle","mlmodell"],
  ["ki","datensatz","mlmodell"],["ml","daten","mlmodell"],["mlmodell","notebook","experiment"],["ml","skript","experiment"],
  ["mlmodell","daten","datascience"],["ml","fabric","datascience"],["experiment","fabric","datascience"],["ki","sprachen","copilot"],
  ["copilot","powerbi","copilotfab"],["copilot","arbeitsbereich","copilotfab"],["copilot","semmodell","agent"],["ki","semmodell","agent"],
  ["ki","lakehouse","agent"],["copilotfab","lakehouse","agent"],["python","semmodell","semlink"],["sprachen","semmodell","semlink"],
  ["notebook","powerbi","semlink"],["arbeitsbereich","sicherheit","berechtigung"],["berechtigung","daten","sicherheit"],["admin","netz","sicherheit"],
  ["sicherheit","onelake","onelakesec"],["sicherheit","lakehouse","onelakesec"],["suche","fabric","katalog"],["governance","onelake","katalog"],
  ["sicherheit","herkunft","governance"],["katalog","admin","governance"],["domaene","sicherheit","governance"],["governance","katalog","purview"],
  ["governance","herkunft","purview"],["katalog","herkunft","purview"],["katalog","pipeline","herkunft"],["katalog","daten","herkunft"],
  ["admin","cloud","mandant"],["azure","sicherheit","mandant"],["arbeitsbereich","governance","domaene"],
  ["arbeitsbereich","arbeitsbereich","domaene"],["domaene","domaene","datamesh"],["cluster","server","skalierung"],["kapazitaet","cluster","skalierung"],
  ["skalierung","fabcap","sku"],["index","abfrage","optimierung"],["analyse","cache","optimierung"],
  ["tabelle","cluster","partition"],["tabelle","suche","index"],["tabelle","abfrage","index"],["azure","warehouse","synapse"],
  ["azure","analyse","synapse"],["azure","speicher","adls"],["azure","spark","databricks"],["notebook","cloud","databricks"],
  ["azure","sql","azuresql"],["cloud","sqlserver","azuresql"],["skript","kopie","gitgen"],["gitgen","cloud","github"],
  ["gitgen","pipeline","azdevops"],["gitgen","deploy","azdevops"],["arbeitsbereich","gitgen","gitint"],["arbeitsbereich","github","gitint"],
  ["arbeitsbereich","azdevops","gitint"],["fabric","gitgen","gitint"],["notebook","arbeitsbereich","entwicklung"],["gitgen","skript","entwicklung"],
  ["entwicklung","tabelle","test"],["entwicklung","kennzahl","test"],["test","server","produktion"],["test","arbeitsbereich","produktion"],
  ["entwicklung","cloud","bereitstellung"],["kopie","cloud","bereitstellung"],["bereitstellung","pipeline","deploy"],["bereitstellung","arbeitsbereich","deploy"],
  ["pipeline","test","deploy"],["bereitstellung","fabric","deploy"],["dashboard","uhr","monitoring"],["analyse","uhr","monitoring"],
  ["dashboard","kennzahl","monitoring"],["monitoring","arbeitsbereich","monhub"],["monitoring","pipeline","monhub"],["mandant","berechtigung","admin"],
  ["mandant","sicherheit","admin"],["admin","mandant","adminportal"],["admin","fabcap","adminportal"],["abfrage","server","rest"],
  ["abfrage","cloud","rest"],["rest","arbeitsbereich","restapi"],["terraform","arbeitsbereich","restapi"],["aktion","server","cli"],
  ["cli","arbeitsbereich","fabcli"],["cli","onelake","fabcli"],["cli","restapi","fabcli"],["bereitstellung","azure","terraform"],
  ["cli","azure","terraform"],["dataeng","fabric","ingenieur"],["dataeng","pipeline","ingenieur"],["spark","pipeline","ingenieur"],
  ["pipeline","sprachen","ingenieur"],["powerbi","kennzahl","analyst"],["bericht","analyse","analyst"],["powerbi","analyse","analyst"],
  ["ingenieur","datascience","team"],["analyst","datascience","team"],

  // --- Datensätze & Beziehungstypen ---
  ["datensatz","datensatz","datensaetze"],["datensatz","datensatz","rel11"],
  ["datensatz","datensaetze","reln"],["datensaetze","datensaetze","relnm"],["datensaetze","datensaetze","tabelle"],["datensaetze","daten","tabelle"],
  ["datensaetze","datei","tabelle"],
  ["rel11","reln","beziehung"],["reln","relnm","beziehung"],["rel11","relnm","beziehung"],
  ["reln","kennzahl","semmodell"],

  // --- Weitere Kombinationen ---
  ["ziel","test","entwicklung"],["ziel","entwicklung","produktion"],["ziel","daten","fabric"],
  ["server","tabelle","datenbank"],["cloud","tabelle","clouddb"],["datenbank","cloud","clouddb"],
  ["clouddb","sqlserver","azuresql"],["clouddb","azure","azuresql"],
  ["bereitstellung","quelle","api"],["api","netz","rest"],["api","abfrage","rest"],["fabric","api","restapi"],
  ["datensatz","copyact","datensatz",["copyact"]],["datensatz","copyact","kopie",["copyact"]],
  ["datenbank","datei","lakehouse"],["s3","quelle","spiegelung"],["quelle","fabric","spiegelung"],["quelle","onelake","verknuepfung"],
  ["azure","transformation","adf"],["adf","fabric","factory"],["adf","pipeline","factory"],
  ["fabric","datei","onelake"],["adls","fabric","verknuepfung"],

  // --- Kombinationen mit mehreren Ergebnissen ---
  ["datei","netz","quelle"],["cloud","cluster","azure"],["tabelle","dax","semmodell"],["daten","kennzahl","visual"],
  ["parquet","onelake","lakehouse"],["ki","daten","ml"],["dashboard","kennzahl","analyst"],

  // --- Weitere Kombinationen (Runde 3) ---
  ["delta","uhr","timetravel"],["notebook","datensaetze","etl"],["notebook","datensaetze","dqchecks"],
  ["fabcap","uhr","reservierung"],["pipeline","datensaetze","etl"],["server","fabric","onpremgw"],["cloud","fabric","cloudverb"],
  ["analyse","skript","python"],["fabcap","analyse","fuam"],["warehouse","datei","parquet"],["sap","onelake","spiegelung"],
  ["deploy","entwicklung","test"],["datensaetze","cache","dataflowgen1"],["dataflowgen1","fabric","dataflow"],
  ["dataeng","tabelle","datamodelling"],["analyse","datenbank","logfiles"],["sicherheit","powerbi","rls"],
  ["abfrage","datei","excel"],["abfrage","datei","csv"],["excel","powerbi","export"],["csv","powerbi","export"],
  ["csv","fabric","onelake"],["excel","fabric","onelake"],

  // --- Team ---
  ["notebook","pipeline","ingenieur"],["bericht","kennzahl","analyst"],["ingenieur","analyst","team"]
];
const BASE = ["daten","rechen","speicher","netz"];
const GOAL = "team";
