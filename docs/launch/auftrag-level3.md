# auftrag-level3.md - Level 3, Nachtbus (`level3.html`)

Aufwand M, zusaetzlich 2:00 Erzaehlzeit (Pflicht 1:00). Voraussetzung: `auftrag-engine.md` gebaut. Datei: **nur `level3.html`**. Namen aus `flags-vertrag.md`, Texte aus `STORY-BIBEL.md`.

## Ziel in der Geschichte

22:00, der letzte Bus. Kein Ticket, ein Hund, ein Kontrolleur. Hier werden die Runninggags gesetzt (Kappe: erste Begegnung, das `Du schon wieder.` kommt erst in L4; Rocky, Moritz' zweiter Anlauf, Max' `Reden wir nie wieder drueber.`) und Jonas bekommt seinen Moment: er hat Angst und sagt es, und der Spieler darf antworten. Die Frau mit dem Hund ist die erste Erwachsene, die sieht: `Ich hab es gemerkt. Viel Spass.`

## PFLICHT

1. **Haken einbauen** (`auftrag-engine.md` Kap. 6). `kapitelZeigen(3)` in `neuesSpiel()`. Karte: `22:00` / `DER LETZTE BUS` / `KEIN TICKET. EIN HUND.` `PLAUSCH.lade(PLAUSCH_ZEILEN)`; `PLAUSCH.takt(dt, S.modus!=='sprint')`: im Sprint keine Untertitel.
2. **Zeit-Reparatur:** im Intro `Bahn` durch `Bus` ersetzen (Grep `Bahn`/`BAHN`); Uhr im Intro auf `22:00`.
3. **Frau mit Rocky** (Gespraech `DIE FRAU`, per Grep `Rocky`): Satz erweitern zu `Der heisst Rocky. Er faehrt auch schwarz. Und er mag keine Kappen.` Danach ein neuer Knoten: `Ich komm von der Schicht. Ich seh euch oefter. Immer um die Zeit.` Beim Gespraechsbeginn `PLAUSCH.ausloeser('rocky')`.
4. **Kappe, Ausweg-Ende:** jeder der vier Ausgaenge der Waggon-Tuer (Crew, anblaffen, zahlen, kaempfen) endet mit der Zeile `DER MIT DER KAPPE: Den Namen merk ich mir nicht. Das Gesicht schon.` (als Gespraechsknoten oder Meldung, 2,4 s).
5. **Jonas-Sitzszene** (nur wenn `ladeCrew().includes('JONAS')`, einmal, beim ersten Betreten des hinteren Waggons, 15 s Zeitdruck):
   ```js
   const JONAS_SITZ={
     start:{ wer:'JONAS', text:'Gleich der Club. Ich hab Angst.',
       wahl:[ { txt:'Ich auch.',        tu:{flag:'jonasAngstTeilen', mag:['JONAS',10]}, geh:'auch' },
              { txt:'Wird schon.',      tu:{mag:['JONAS',3]},  geh:'wird' },
              { txt:'Dann bleib hier.', tu:{mag:['JONAS',3]},  geh:'bleib' } ], zeit:9, standard:1 },
     auch:{ wer:'JONAS', text:'Echt? Du siehst so ruhig aus.', geh:'auch2' },
     auch2:{ wer:'DU', text:'Ich bin nur schneller im Verstecken.', geh:'auch3' },
     auch3:{ wer:'JONAS', text:'Das ist auch Angst.', geh:'@ende' },
     wird:{ wer:'JONAS', text:'Ja. Klar. Wird schon. ...Hast du das Ticket?', geh:'@ende' },
     bleib:{ wer:'JONAS', text:'Hier? Im Bus? Okay. Bis zur Haltestelle.', geh:'@ende' },
   };
   ```
   (`wer:'DU'` ist gewollt; falls der Rahmen es nicht mag, `wer:'ICH'`. Der Onkel-Witz steht schon in der SMS `jonas1` (L4); hier nicht wiederholen.)
6. **Anlauf 2:** wenn der erste Kontrolleur den Gang betritt: `PLAUSCH.ausloeser('kontrolle')`. Daten: `MORITZ: DU, ICH MUSS DIR WAS...` und 2 s spaeter `KONTROLLEUR: FAHRSCHEINE, BITTE.`
7. **Cutscene-Ende** (`SZENEN`/Ausstiegs-Karten, per Grep `GESCHAFFT. NIEMAND`): hinter `DU: GESCHAFFT. NIEMAND HATS GEMERKT.` die Karte `FRAU: ICH HAB ES GEMERKT. VIEL SPASS.`
8. **Polaroid `moment3`** am Fenstersitz (Seitenreihe, ueber einem Sitz, der kein Versteck ist): `MOMENT.zeichneFund(x,y,3)`, Aktion `MOMENT.fund(3)`. Text in `texte.js`: `EURE SPIEGELBILDER IM BUSFENSTER.|NIEMAND SCHAUT IN DIE KAMERA.`

## PLAUSCH_ZEILEN

```js
{id:'l3a', wer:'MORITZ',    text:'DER BUS RIECHT NACH DOENER.', nach:6, wenn:{flag:'umweg_1'}},
{id:'l3b', wer:'MAX FERDI', text:'DAS IST DER DOENER.', nach:12, wenn:{flag:'umweg_1'}},
{id:'l3c', wer:'ROCKY',     text:'WUFF.', ausloeser:'rocky'},
{id:'l3d', wer:'JONAS',     text:'ICH SITZ NICHT GERN AM GANG.', nach:30, wenn:{crew:'JONAS'}},
{id:'l3e', wer:'MORITZ',    text:'DU, ICH MUSS DIR WAS...', ausloeser:'kontrolle'},
{id:'l3f', wer:'KONTROLLEUR', text:'FAHRSCHEINE, BITTE.', ausloeser:'kontrolle', nach:2},
```
(`l3e` und `l3f` kommen nacheinander; die Engine spielt in Listenreihenfolge.)

## OPTIONAL (Prioritaet)

1. `MAX FERDI` nach der Notbremse: `REDEN WIR NIE WIEDER DRUEBER.` (ist im Bestand als Cutscene-Karte; zusaetzlich als Plauschzeile, falls die Cutscene nicht gespielt wird).
2. `KAPPE` im Bus-Plausch nach `busGezahlt`: `DER MIT DER KAPPE: BRAVER JUNGE.`
3. Ein zweiter Rocky-Plausch beim Aussteigen: `ROCKY: WUFF.` (Setup fuer L4 bis L8).

## Flags und Werte

- **Setzt:** `jonasAngstTeilen`, `moment3`; Beziehung `JONAS` +10 (nur `Ich auch.`), +3 sonst. Bestehend unveraendert (`busSzene`, `busTipp`, `busTicket`, `automatKaputt`, `notbremse`, `spaetDran`, `jonasDabei`, `busDurchDieCrew`, `busAngeblafft`, `busGezahlt`, `busKloppe`, `busKloppeGewonnen`, `busKloppeVerloren`).
- **Liest:** Crew `JONAS`; bestehende Bus-Flags fuer die Kappe-Verhaeltnisse (in L4/L5/L8 gelesen, nicht hier).
- **Reset beim Levelstart:** `jonasAngstTeilen` auf `false`.

## Textbudget

Neu: Jonas-Baum 7 Zeilen, 6 Plauschzeilen, 3 Frau-/Kappe-Zeilen, 1 Cutscene-Karte, 1 Polaroid, Kapitelkarte. Zusammen ca. 800 Zeichen. Pflicht 1:00 (Karte 3,5 s, Jonas 15 s, Frau 15 s, Kappe-Zeile, Cutscene), Rest Plausch und Fund.

## Handy-Hinweis

- Tastennamen nur in Hinweisen; Polaroid-Naehe: `mobilKontext()` `{aktion:'FOTO'}`, sonst bestehende Aktionen unveraendert.
- Zeilen <= 44 Zeichen, Gespraeche brechen selbst um (hoechstens zwei Zeilen).
- Blitze: der Level hat Notbremse und Wackeln; alle Staerken ueber `FX.wackel(px)` und `FX.blitz(a)`; nichts neues hinzufuegen.
- Der `nachttest`-Lauf darf den Sprint ohne Plauschausnahme durchlaufen (`PLAUSCH.takt` ist fehlertolerant).

## Fertig-wenn

1. `node tools/pruefe.js`, `node test/kampf.test.js`, `node tools/nachttest.js`, `node tools/flagcheck.js` gruen; `busDurchDieCrew` bleibt gesetzt (Leser kommt in L7).
2. Browser: Kapitelkarte, im Sprint keine Untertitel, Rocky-Plausch beim Gespraech mit der Frau, Jonas-Szene nur mit Jonas in der Crew und nur einmal, Kappe-Abschlusszeile in allen vier Ausgaengen, Frau-Karte am Ende, nirgends `BAHN`.
