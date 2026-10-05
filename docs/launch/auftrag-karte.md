# auftrag-karte.md - Karte, Handy, Texte, Menue (`karte.html`, `nacht/handy.js`, `nacht/texte.js`)

Aufwand M (drei Dateien: baue **zuerst `texte.js`, dann `karte.html` + `handy.js` in einem zweiten Durchgang**), zusaetzlich 1:00 Erzaehlzeit (alles auf der Karte ist ueberspringbar). Voraussetzung: die leere Huelle `nacht/texte.js` aus `auftrag-engine.md`. Dateien: **`nacht/texte.js`** (alle Daten), **`karte.html`**, **`nacht/handy.js`** (nur Drehbuch). Namen aus `flags-vertrag.md`, Texte aus `STORY-BIBEL.md`.

## Ziel in der Geschichte

Zwischen den Leveln faehrt die Nacht weiter: Die Uhrzeiten stimmen endlich ueberein, Ali vom Doener schreibt Name und Nummer auf die Tuete (die spaetere Aufloesung von `Wir sehen euch.`), und das Handy bringt UNBEKANNT, Lea und Mama in der richtigen Reihenfolge. `texte.js` ist die einzige Stelle fuer Kapitelkarten, Rueckblick-Zeilen, Polaroid-Texte und Menue-Texte.

## PFLICHT

1. **`nacht/texte.js` fuellen** (reine Daten, vier Konstanten, jede Zeile <= 44 Zeichen, Format aus `auftrag-engine.md`):
   ```js
   const TEXTE_KAPITEL={
     1:{zeit:'16:40',ort:'DIE SCHULE',       zeile:'DIE TUER IST ABGESCHLOSSEN.'},
     2:{zeit:'21:10',ort:'BEI MORITZ',       zeile:'MORITZ HAT AUFGERAEUMT. DAS HAT ER NOCH NIE.'},
     3:{zeit:'22:00',ort:'DER LETZTE BUS',   zeile:'KEIN TICKET. EIN HUND.'},
     4:{zeit:'22:40',ort:'VOR DEM CLUB',     zeile:'ZWEIHUNDERT MENSCHEN VOR EUCH.'},
     5:{zeit:'22:50',ort:'DER CLUB',         zeile:'UM EINS GEHT DAS LICHT AN.'},
     6:{zeit:'02:00',ort:'AFTERHOUR',        zeile:'ALLE UHREN ZEIGEN 17:30.'},
     7:{zeit:'03:15',ort:'DER SPAETI',       zeile:'FUENF MINUTEN RUHE. ZUM ERSTEN MAL.'},
     8:{zeit:'04:10',ort:'DEIN HEIMWEG',     zeile:'DIE SONNE KOMMT UM 05:20.'} };
   ```
   `TEXTE_BISHER` (`{ab,g,wenn,txt}`, zwei Zeilen werden gewaehlt, Level 1 hat keine; jedes `txt` hoechstens 36 Zeichen wegen des Praefixes `BISHER: `):
   ```js
   {ab:2,g:9,wenn:{flag:'hausmeisterHilft'},      txt:'DER HAUSMEISTER LIESS DICH LAUFEN.'},
   {ab:2,g:5,wenn:{hat:'SCHLUESSEL'},             txt:'DER SCHLUESSEL MIT DER ROTEN WOLLE.'},
   {ab:3,g:8,wenn:{flag:'gruppeKlein'},           txt:'NUR IHR ZWEI. MORITZ WOLLTE REDEN.'},
   {ab:3,g:8,wenn:{flag:'gruppeGross'},           txt:'DIE GANZE MANNSCHAFT IST DABEI.'},
   {ab:3,g:6,wenn:{flag:'moritzKartonGesehen'},   txt:"ZWEI KARTONS IN MORITZ' ZIMMER."},
   {ab:4,g:7,wenn:{flag:'notbremse'},             txt:'DIE NOTBREMSE. NIE WIEDER DRUEBER.'},
   {ab:4,g:6,wenn:{flag:'jonasAngstTeilen'},      txt:'JONAS HAT ES AUSGESPROCHEN. DU AUCH.'},
   {ab:5,g:5,wenn:{flag:'mitgesungen'},           txt:'WONDERWALL GESUNGEN. FALSCH.'},
   {ab:6,g:9,wenn:{flag:'marvinNachgerufen'},     txt:'DU HAST MARVIN NACHGERUFEN.'},
   {ab:6,g:8,wenn:{flag:'kiraTschuess'},          txt:'KIRA HAT TSCHUESS GESAGT. DU AUCH.'},
   {ab:6,g:3,wenn:{flag:'marvinKennt'},           txt:'MARVIN SPIELTE MAL MIT MORITZ.'},
   {ab:7,g:8,wenn:{flag:'schluesselVersprochen'}, txt:'DEM HAUSMEISTER ETWAS VERSPROCHEN.'},
   {ab:7,g:7,wenn:{flag:'moritzGeheimnis'},       txt:'DU WEISST, WAS IN DEN KARTONS IST.'},
   {ab:8,g:9,wenn:{flag:'marvinWasser'},          txt:'MARVIN HAT DEIN WASSER GEKRIEGT.'},
   {ab:8,g:6,wenn:{flag:'tobiBruecke'},           txt:'TOBI WEISS, WO MAN DIE SONNE SIEHT.'},
   {ab:8,g:5,wenn:{flag:'wirEuchAuch'},           txt:'DU HAST "WIR EUCH AUCH" GESCHRIEBEN.'},
   ```
   `TEXTE_MOMENTE` (`{titel,l1,l2}`):
   ```
   1 DER FLUR       | DER FLUR, ALLE SPINDE OFFEN.      | JEMAND HAT ES FESTGEHALTEN.
   2 DIE PINNWAND   | MORITZ UND DU, SIEBTE KLASSE.     | BEIDE MIT FURCHTBARER FRISUR.
   3 DAS BUSFENSTER | EURE SPIEGELBILDER IM BUSFENSTER. | NIEMAND SCHAUT IN DIE KAMERA.
   4 DAS GITTER     | DIE SCHLANGE VON OBEN.            | WER STAND DA OBEN?
   5 DIE GARDEROBE  | DEIN GESICHT BEIM ERSTEN BASS.    | NIEMAND HAT ES GESEHEN. AUSSER LEA.
   6 DIE WANDUHR    | DIE WANDUHR. SIE STEHT.           | 17:30. SEIT HEUTE NACHMITTAG.
   7 DIE BANK       | ALLE AUF DER BANK.                | JEMAND LACHT NOCH IM FOTO.
   8 ERSTES LICHT   | ERSTES LICHT.                     | ALLE DREHEN SICH WEG. NUR EINER NICHT.
   ```
   `TEXTE_MENUE` (HTML-Menue, Umlaute erlaubt): `{untertitel:'Party Game drunk', enden:'ENDEN', momente:'MOMENTE', unbekannt:'???', knoten:'n VON 3 KNOTEN', zurueck:'ZURUECK', galerieHinweis:'G: ENDEN', album:'ALBUM', leer:'NOCH NICHTS GEFUNDEN.'}` (`knoten` mit `n` als Platzhalter), dazu die Hangover-Karten `{blackout:'DU WACHST AUF. DU HAELST EIN SCHILD.|KEINE FRAGEN.', erwischt:'DER HAUSMEISTER HAT ABGESCHLOSSEN.|ES IST NOCH FREITAG.'}`.
2. **Zeiten auf der Karte** (`STATIONEN`, Zeile 77 bis 84): `zeit` auf `16:40`, `21:10`, `22:00`, `22:40`, `22:50`, `02:00`, `03:15`, `04:10`. Grep `Uhr`, `:`, `halb` in `karte.html` und alle Anzeigen mit Uhrzeit angleichen.
3. **Ali, Umweg 1:** beim Kauf (`Einmal alles.` und `Nur ne Cola.`) `flag:'aliNummer'` ins `tu`; Antworten werden `satt:` `Grundlage. Deine Mutter waere stolz.` mit Folgeknoten `tuete:` `Name und Nummer? Ich ruf, wenn er fertig ist.` (`geh:'@ende'`) und `cola:` `Cola. Wie ein Kind. Na gut.` plus derselbe `tuete`. Bei `Nee, danke.` kein Flag.
4. **Handy-Drehbuch** (`handy.js`, `HANDY_DREHBUCH` laut `flags-vertrag.md` Kap. 5; HTML-Fenster, Umlaute erlaubt, Mama klein und ohne Punkt):
   - `mama1` `wann bist du zuhause` (Antworten bleiben), `mama2` `es ist nach mitternacht` (`ab:6`), `mama3` `ich kann nicht schlafen` (`ab:7`, vorher 8, damit sie vor `mama4` kommt). Alle anderen Bestandseintraege (`moritz1`, `jonas1`, `sophie1`, `kira1`, `moritz2`) bleiben unveraendert.
   - `lea1` (`ab:2`, von LEA) `Bin spaeter da. Muss noch Fotos machen.`; Antworten `Mach ein gutes Foto.` (`mag:['LEA',4]`) / `Wo bist du?` (`mag:['LEA',2]`).
   - `unbekannt1` (`ab:5`, von UNBEKANNT) `Wir sehen euch.`; Antworten `Wir euch auch.` (`flag:'wirEuchAuch', mut:4`) / `Wer bist du?`. `vorlesen:{wer:'MORITZ', text:'KOMISCHE SMS: "WIR SEHEN EUCH."'}`.
   - `unbekannt2` (`ab:6`) `Trinkt Wasser.`; Antworten `Wir euch auch.` (`flag:'wirEuchAuch'`) / `Ja, Mama.` (`mut:1`).
   - `mama4` (`ab:7`) `egal wie spaet. ich bin wach.`; Antwort `Bin bald da.` (`flag:'mamaBescheid'`).
   - `mia1` Text `Jule will wissen, ob du noch lebst. Ich auch.`; `marvin1` entfernen. Zu `mama2` `vorlesen:{wer:'MAX FERDI', text:'DEINE MAMA FRAGT, WO DU BLEIBST.'}` (Plausch ist Canvas: Grossbuchstaben, `WER: TEXT` hoechstens 44 Zeichen).
   Das Feld `vorlesen` benutzt `PLAUSCH.sag` aus dem Engine-Auftrag; hier nur die Daten.

## OPTIONAL (Prioritaet)

1. Karten-Hook je Station (eine Zeile im Fahrbild, 2 s): nach 1 `MORITZ: 21 UHR BEI MIR.`, nach 2 `LEA: BIN SPAETER DA.`, nach 5 `SEMIH: AFTERHOUR. ICH KENN JEDEN.`, nach 6 `LEA: ES IST HALB DREI. SPAETI.`, nach 7 `MAMA: EGAL WIE SPAET. ICH BIN WACH.`
2. Pizza-Umweg (5): bei `@teilen` Meldung `DIE JUNGS FEIERN DICH` statt der Standardzeile bleibt; Zusatz `NIEMAND REDET. ALLE KAUEN.`
3. Umweg 6 Brunnen: Erzaehlzeile `ERSTES MAL KALT. ZWEITES MAL WACH.` (kein Flag).
4. Umweg 3 Musiker bei `mitgesungen`: `ER SPIELT ES NOCH EINMAL. FUER DICH.`

## Flags und Werte

- **Setzt:** `aliNummer` (Umweg 1), `wirEuchAuch` (Handy), Beziehung `LEA` +4/+2. Bestehend: `umweg_1..7`, `klassenfahrtGeld`, `mitgesungen`, `marvinKennt`, `marvinGereizt`, `mamaBescheid`, `mamaAngelogen`.
- **Liest:** `handyZurueck`, `schreibt_*`, `gruppeKlein`, `nichtFlag:'mamaBescheid'`.
- `aliNummer` braucht keinen Levelstart-Reset; `nachtZuruecksetzen()` loescht es.

## Textbudget

`TEXTE_KAPITEL` 8, `TEXTE_BISHER` 15, `TEXTE_MOMENTE` 8 (je 3 Teile), `TEXTE_MENUE` 14, Handy 7 neue oder geaenderte Nachrichten, Ali 3 Zeilen. Zusammen ca. 2200 Zeichen. Alles ueberspringbar; nichts davon ist Pflicht zum Weiterspielen.

## Handy-Hinweis

- Kein Tastenname in den Datenzeilen. Die Kapitelkarte zeigt `E / TIPPEN` oder am Handy nur `TIPPEN` (Engine).
- Alle Zeilen in `texte.js` <= 44 Zeichen und nur Zeichen der Schrift (`nachttest` prueft). Handy-Texte im HTML-Fenster haben keine Zeichengrenze, bleiben aber unter 60.
- Keine Blitze; die Karte bringt keine Effekte.

## Fertig-wenn

1. `node tools/pruefe.js`, `node tools/nachttest.js`, `node tools/flagcheck.js` gruen: `aliNummer` und `wirEuchAuch` haben Leser (Level 8), `geantwortet_*` weiterhin gesetzt.
2. Browser: Karte zeigt `22:00`, `22:40`, `22:50` an den Stationen; Ali-Umweg setzt `aliNummer` (Konsole `flag('aliNummer')`); Handy zeigt `lea1` ab Level 2, `unbekannt1` ab Level 5; ohne `handyZurueck` liest Max/Moritz die Nachricht per Plausch.
