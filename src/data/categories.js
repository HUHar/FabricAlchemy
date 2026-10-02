// Sprachneutral: Ordner der Elementliste. Reihenfolge = Reihenfolge im Spiel.
// [Ordner-ID, [Element-IDs …]] – jedes Element gehört in genau einen Ordner (build.js prüft das).
// Die Ordnernamen stehen in src/i18n/<sprache>.js unter "folders".
const CATEGORIES = [
  ["grundlagen", ["daten","rechen","speicher","netz","datensatz","datensaetze","server","cache","skript","uhr","sekunde","bewegung","analyse"]],
  ["dateien", ["datei","kopie","csv","excel","parquet","delta","timetravel","vorder"]],
  ["datenbanken", ["tabelle","datenbank","clouddb","sqlserver","sql","abfrage","suche","index","partition","view","matview","temp"]],
  ["fabric", ["fabric","onelake","arbeitsbereich","lakehouse","warehouse","verknuepfung","abkuerzung","spiegelung","sqlendpunkt"]],
  ["integration", ["factory","pipeline","copyact","copyjob","dataflow","dataflowgen1","m","lowcode","etl","mdetl","transformation","quelle","ziel","batch","orchestrierung","trigger","manual","adf","onpremgw","cloudverb"]],
  ["echtzeit", ["ereignis","aktion","sensor","iot","datenstrom","eventstream","eventhouse","kql","echtzeit","aktivator","alert"]],
  ["engineering", ["notebook","sprachen","python","pyspark","scala","r","sparksql","spark","sparkpool","cluster","dataeng","bronze","silber","gold","medallion"]],
  ["powerbi", ["powerbi","bericht","dashboard","visual","kennzahl","dax","button","refresh","export","exportexcel","exportcsv","semmodell","directlake","reframing","datamodelling","sternschema","beziehung","rel11","reln","relnm","composite","composite2","composite3"]],
  ["ki", ["ki","ml","mlmodell","experiment","datascience","copilot","copilotfab","agent","semlink","ontology","fabriciq","workiq","microsoftiq"]],
  ["governance", ["berechtigung","sicherheit","onelakesec","rls","katalog","metadata","governance","purview","herkunft","dqchecks","mandant","domaene","datamesh"]],
  ["kapazitaet", ["kapazitaet","fabcap","sku","skalierung","optimierung","reservierung","fuam","smallbudget","f2","f4","f8","f16","f32","f64","bigbucks","nomoney"]],
  ["cloud", ["cloud","azure","adls","synapse","azdatabricks","databricks","s3","snowflake","sap","cosmos","azuresql"]],
  ["devops", ["gitgen","github","ghactions","azdevops","gitint","entwicklung","test","produktion","bereitstellung","deploy","rest","api","restapi","cli","fabcli","terraform","monitoring","monhub","admin","adminportal","logfiles"]],
  ["rollen", ["ingenieur","analyst","datascientist","datawg","team"]],
  ["community", ["community","fabriccommunity","usergroup","meetup","fabcon","giac","daxstudio","tabulareditor","mvp","toolbox","pbig","datamonsters"]],
  ["spass", ["tod","one","zero","io"]]
];
