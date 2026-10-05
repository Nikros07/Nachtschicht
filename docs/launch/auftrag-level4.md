# auftrag-level4.md - Level 4, Die Schlange (`level4.html`)

Aufwand S, zusaetzlich 1:30 Erzaehlzeit (Pflicht 0:40). Voraussetzung: `auftrag-engine.md` gebaut. Datei: **nur `level4.html`**. Namen aus `flags-vertrag.md`, Texte aus `STORY-BIBEL.md`.

## Ziel in der Geschichte

22:40, vor dem Club, zweihundert Menschen vor euch. Der Tuersteher ist der Boss, aber das Level ist vor allem die Schlange: hier steht alles, was die Nacht bis jetzt gemacht hat, noch einmal in einer Reihe (Kappe, Rocky, Mia). Dennis kommt aus der Schlange mit und bekommt seine eine Zeile Haltung: Er boxt, damit er nie muss. Der Tuersteher ist der dritte Erwachsene, der sieht.

Wichtig: dieses Level hat **kein Laufen**, nur Konter. Alle Zusaetze sind Karten, Gespraeche und Untertitel, keine neuen Objekte.

## PFLICHT

1. **Haken einbauen** (`auftrag-engine.md` Kap. 6). `kapitelZeigen(4)` in `neuesSpiel()`. Karte: `22:40` / `VOR DEM CLUB` / `ZWEIHUNDERT MENSCHEN VOR EUCH.` `PLAUSCH.lade(PLAUSCH_ZEILEN)`; `PLAUSCH.takt(dt, S.modus==='intro'||S.modus==='warten')` (je nach Modus-Namen im Level; im Kampf schweigt der Plausch).
2. **Zeit-Reparatur:** Intro-Uhr `23:15` (Grep) auf `22:40`.
3. **Kappe-Karte** direkt nach dem Intro, 2,2 s, je nach Bus-Ausgang (erste zutreffende):
   - `busKloppeGewonnen`: `DER MIT DER KAPPE HAT EIN BLAUES AUGE.|ER STEHT HINTER DIR.`
   - `busGezahlt`: `DER MIT DER KAPPE NICKT DIR ZU.|ER STEHT HINTER DIR.`
   - `busAngeblafft`: `DER MIT DER KAPPE WEICHT DIR AUS.|ER STEHT HINTER DIR.`
   - sonst: `KAPPE: DU SCHON WIEDER.`
   Karten mit `|` ueber `zeichneKarte` (siehe `auftrag-index.md` Schritt 6).
4. **Dennis in der Schlange** (Gespraech, 10 s Zeitdruck, vor `NA WARTE`; Dennis ist noch nicht in der Crew):
   ```js
   const DENNIS_SCHLANGE={
     start:{ wer:'DENNIS', text:'Eine Stunde. Der kommt nicht rein, wer so aussieht.',
       wahl:[ { txt:'Wir kommen rein.',        tu:{mut:3, mag:['DENNIS',4]}, geh:'passt' },
              { txt:'Und wenn du recht hast?', tu:{mag:['DENNIS',4]},        geh:'passt' } ], zeit:10, standard:0 },
     passt:{ wer:'DENNIS', text:'Passt.', geh:'@ende' },
   };
   ```
5. **Nach dem Boss, vor der Cutscene** (`SZENEN`, per Grep `RESPEKT`): einfuegen
   - `TUERSTEHER: ICH STEH HIER ACHT STUNDEN.|ICH SEH EUCH ALLE KOMMEN. UND GEHEN.`
   und nach `DENNIS: RESPEKT. ICH KOMM MIT REIN.` die Karte
   - `DENNIS: NICHT BEEINDRUCKT SEIN.|ICH BOXE, DAMIT ICH NICHT MUSS.`
6. **Polaroid `moment4` als Belohnung statt Fund** (kein Laufen im Level): wird vergeben, wenn der Boss **ohne Herzverlust** faellt (der Level zaehlt Treffer, Grep `leben`/`treffer`; falls es keinen Zaehler gibt, einen anlegen). Aufruf `MOMENT.fund(4)` direkt vor der Cutscene; die Momentkarte kommt vor dem ersten Cutscene-Text. Text in `texte.js`: `DIE SCHLANGE VON OBEN.|WER STAND DA OBEN?`

## PLAUSCH_ZEILEN (nur in der Wartephase, Ausloeser, 2 Zeilen)

```js
{id:'l4a', wer:'MIA',    text:'IHR SEID DIE BUS-TYPEN.', ausloeser:'warten', nach:3},
{id:'l4b', wer:'ROCKY',  text:'WUFF.', ausloeser:'warten', nach:6},
```
`PLAUSCH.ausloeser('warten')` beim Eintritt in die Wartephase (nach der Kappe-Karte). Moritz sagt in L4 **keinen** Anlauf: es gibt genau vier (L2, L3, L5, L7), sonst stimmt das `VIER ANLAEUFE` im Finale nicht.

## OPTIONAL (Prioritaet)

1. Wenn `jonasDabei`: im Kampf ruft Jonas kurz `ONKEL?!` (Setup: die SMS `jonas1`, ab 4, `Der Tuersteher sieht aus wie mein Onkel.`) (Untertitel `JONAS: ONKEL?!` bei halber Boss-Gesundheit, einmal) und der Tuersteher kontert in der Cutscene `TUERSTEHER: ...JONAS? DU BIST IM KINO.` (nur Text, keine Wirkung, kein neues Flag).
2. Ein Rocky-Satz am Ende der Cutscene: `ROCKY BELLT EINMAL. MEHR NICHT.`
3. `jonasAngstTeilen` aus L3 gelesen: bei gesetztem Flag sagt Jonas in der Schlange zusaetzlich `JONAS: ICH BLEIB NEBEN DIR.` (Plausch, ausloeser `warten`).

## Flags und Werte

- **Setzt:** `moment4` (nur bei fehlerfreiem Sieg); Beziehung `DENNIS` +4. Bestehend: `tuersteherBesiegt`, Crew `DENNIS`.
- **Liest:** `busKloppeGewonnen`, `busGezahlt`, `busAngeblafft` (Kappe-Karte), optional `jonasDabei`, `jonasAngstTeilen`. Bestehend: `gruppeGross`/`gruppeKlein` (Trefferziel).
- **Reset beim Levelstart:** keiner noetig.
- Hinweis: `spaetDran` wird hier weiterhin nicht gelesen; Auftrag ist nicht, das zu reparieren.

## Textbudget

Neu: Kappe-Karte (4 Varianten, eine pro Lauf), Dennis-Baum (3 Zeilen), 2 Cutscene-Karten, 2 Plauschzeilen, 1 Polaroid, Kapitelkarte. Zusammen unter 600 Zeichen. Pflicht 0:40 (Karte 3,5 s, Kappe-Karte 2,2 s, Dennis 10 s, Tuersteher-Satz), Rest Plausch und Polaroid.

## Handy-Hinweis

- Es gibt keine neue Aktionstaste; `mobilKontext()` bleibt bis auf `erzaehlKontext()` unveraendert. Im Text keine Tastennamen noetig.
- Zeilen <= 44 Zeichen, zwei Zeilen je Karte.
- Kampfblitze und Wackeln bleiben, laufen aber **nur** ueber `FX.blitz`/`FX.wackel`/`FX.hz`; neue Effekte gibt es nicht.

## Fertig-wenn

1. `node tools/pruefe.js`, `node test/kampf.test.js`, `node tools/nachttest.js`, `node tools/flagcheck.js` gruen.
2. Browser: Intro zeigt 22:40, Kapitelkarte, Kappe-Karte passt zum Bus-Ausgang (alle vier Faelle mit gesetzten Flags im Konsolentest), Dennis-Gespraech laeuft vor dem Boss, Polaroid nur nach fehlerfreiem Sieg, Cutscene-Karten brechen am Handy-Format nicht ueber den Rand.

## Spaeter

- Moritz-Plauschzeile in der Schlange (`DU, ICH MUSS DIR WAS... ERST DER TUERSTEHER.`): gestrichen, weil sie ein fuenfter Anlauf waere. Nur aufnehmen, wenn das Finale `VIER ANLAEUFE` auf fuenf aendert.
