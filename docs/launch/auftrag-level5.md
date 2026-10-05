# auftrag-level5.md - Level 5, Club (`level5.html`)

Aufwand M, zusaetzlich 2:30 Erzaehlzeit (Pflicht 1:15). Voraussetzung: `auftrag-engine.md` gebaut. Datei: **nur `level5.html`**. Namen aus `flags-vertrag.md`, Texte aus `STORY-BIBEL.md`.

## Ziel in der Geschichte

22:50, der Club, um eins geht das Licht an. Hoehepunkt der Komoedie, und hier sitzt der Kern: Kira sagt als Erste Tschuess, und Marvin sieht Moritz im alten Trikot und geht. Moritz erklaert leise, warum (`Es hat sich verlaufen. Keiner hat Tschuess gesagt.`). Zum ersten Mal kommt `UNBEKANNT: Wir sehen euch.` aufs Handy.

## PFLICHT

1. **Haken einbauen** (`auftrag-engine.md` Kap. 6). `kapitelZeigen(5)` in `neuesSpiel()`. Karte: `22:50` / `DER CLUB` / `UM EINS GEHT DAS LICHT AN.` `PLAUSCH.lade(PLAUSCH_ZEILEN)`; `PLAUSCH.takt(dt, !gespraechAktiv() && S.modus!=='kloppe')`.
2. **Zeit-Reparatur:** Intro-Uhr `22:30` (Grep) auf `22:50`. **Lena wird Jule:** Grep `LENA`/`Lena` in der ganzen Datei (Mia-Baum, `MIA_BAUM`, Ambient, Garderobe) durch `JULE`/`Jule` ersetzen; Flag `lenaVersorgt` bleibt. `Einer von meinen Jungs tanzt mit dir.` wird `Einer von uns tanzt mit dir.`
3. **Kira und das erste Tschuess** (nach dem Kira-Gespraech, am Taxi; nur bei positivem Ausgang `clubJa_kira` oder `schreibt_kira`, per Grep `Taxi`), Gespraechsbaum 8 s:
   ```js
   const KIRA_TSCHUESS={
     start:{ wer:'KIRA', text:'Tschuess.',
       wahl:[ { txt:'Tschuess.',   tu:{flag:'kiraTschuess', mag:['KIRA',8]}, geh:'danke' },
              { txt:'Bis gleich.', geh:'nee' } ], zeit:8, standard:1 },
     danke:{ wer:'KIRA', text:'Danke fuers Zuhoeren.', geh:'@ende' },
     nee:{ wer:'KIRA', text:'Nee. Tschuess.', geh:'@ende' },
   };
   ```
4. **Sophie, neuer Knoten** im bestehenden Sophie-Baum (nach dem Shot-Satz, wenn das Gespraech positiv weitergeht):
   `Schule aus? Hab ich letztes Jahr gehabt.` dann in zwei Knoten `Man vermisst nicht die Schule.` / `Man vermisst, dass alle im selben Raum sind.` Wahl `Und danach?` -> `Es wird nicht weniger. Es wird anders.` Keine Flags, keine Beziehung (nur Erzaehlung), 12 s.
5. **Trikot-Szene** (Pflicht; ersetzt nichts, kommt kurz vor dem Marvin-Auftritt am Anfang des Marvin-Plots; immer, ob `marvinKennt` oder nicht; setzt dort `marvinKennt`, falls noch nicht gesetzt):
   ```js
   const TRIKOT={
     start:{ wer:'MARVIN', text:'Das Trikot. Ihr habt es noch.', geh:'moritz', tu:{flag:'marvinKennt'} },
     moritz:{ wer:'MORITZ', text:'Marvin...?', geh:'leise0' },
     leise0:{ wer:'MORITZ', text:'Er war bis zur sechsten in der Mannschaft.', geh:'leise' },
     leise:{ wer:'MORITZ', text:'Dann hat sich alles verlaufen. Keiner hat Tschuess gesagt.',
       wahl:[ { txt:'Marvin!',   tu:{flag:'marvinNachgerufen', mag:['MARVIN',6]}, geh:'ruf' },
              { txt:'Lass ihn.', tu:{mag:['MARVIN',-2]}, geh:'@ende' } ], zeit:8, standard:1 },
     ruf:{ wer:'MARVIN', text:'...Kein Stress.', geh:'@ende' },
   };
   ```
6. **Marvin stellt dich** (bestehender Kampfauftakt): vor dem Kampf zwei Karten: `MORITZ: DU, ICH MUSS DIR WAS...` (Anlauf 3) und `MARVIN: JETZT.` Der Cousin-Satz im Marvin-Gespraech: `Mein Cousin sagt, du hast ihn heute umgehauen. Falsche Klingel.` (loest den Unbekannten aus Level 2).
7. **Semih am Ausgang** (wo Semih in die Crew kommt, per Grep `SEMIH`), Baum 8 s, nur wenn er mitkommt:
   `SEMIH: Heut hat mich keiner gefragt, wen ich kenne. War gut.` Wahl `Dann frag ich nicht.` (`mag:['SEMIH',6]`) / `Wen kennst du denn?` (`mag:['SEMIH',2]`) -> `SEMIH: ALLE. ABER DICH JETZT RICHTIG.`
8. **Polaroid `moment5`** an der Garderobe: `MOMENT.zeichneFund(x,y,5)`, `MOMENT.fund(5)`. Text in `texte.js`: `DEIN GESICHT BEIM ERSTEN BASS.|NIEMAND HAT ES GESEHEN. AUSSER LEA.`

## PLAUSCH_ZEILEN

```js
{id:'l5a', wer:'MAX FERDI', text:'ICH BEWACHE DIE JACKEN. JOB.', nach:4},
{id:'l5b', wer:'KAPPE',     text:'MEIN MANTEL.', nach:9},
{id:'l5c', wer:'DJ',        text:'WONDERWALL. WER WILL?', nach:50, wenn:{flag:'mitgesungen'}},
{id:'l5d', wer:'MORITZ',    text:'DAS WARST DU. AN DER STRASSE.', nach:56, wenn:{flag:'mitgesungen'}},
{id:'l5e', wer:'DENNIS',    text:'TANZEN IST ANDERS. FUEHLEN.', nach:70},
{id:'l5f', wer:'ROCKY',     text:'WUFF. (HINTERAUSGANG)', nach:100},
```
`wenn` nutzt Bedingungen wie im Gespraechsbaum. Im Verlauf des Levels meldet `handy.js` (`unbekannt1`, `ab:5`, Zeitpunkt nicht an die Szene gebunden) die SMS; ohne Handy liest Moritz sie per Plausch vor (Engine).

## OPTIONAL (Prioritaet)

1. Mia benotet die Saetze: im Mia-Baum bei jeder Antwort ein Zusatzsatz `Drei von zehn. Mit Anlauf vier.` (Text, ohne Wirkung).
2. Semih-Satz im Ambient: `SEMIH: KENN ICH. DEN AUCH. SEINEN BRUDER.`
3. Bei `marvinNachgerufen` ein kurzer Blick von Marvin im Ausgangsraum: Plausch `MARVIN: ...` (leerer Text nicht erlaubt; stattdessen Meldung `MARVIN HAT SICH UMGEDREHT.`).

## Flags und Werte

- **Setzt:** `kiraTschuess`, `marvinNachgerufen`, `marvinKennt` (in der Trikot-Szene, falls noch nicht), `moment5`; Beziehung `KIRA` +8, `MARVIN` +6/-2, `SEMIH` +6/+2. Bestehend unveraendert (`clubJa_*`, `schreibt_*`, `lenaVersorgt`, `marvinRueckzug`, `clubKloppe*`).
- **Liest:** `clubJa_kira`/`schreibt_kira`, `mitgesungen`, `marvinKennt`, `marvinGereizt`, `gruppeGross`, `tuersteherBesiegt` (bestehend).
- **Reset beim Levelstart:** `kiraTschuess`, `marvinNachgerufen` auf `false`.

## Textbudget

Neu: Kira 4, Sophie 4, Trikot 6, Semih 4 Gespraechszeilen; 2 Marvin-Karten, 6 Plauschzeilen, 1 Polaroid, Kapitelkarte. Zusammen ca. 1100 Zeichen. Pflicht 1:15 (Karte, Trikot 25 s, Kira 10 s, Marvin-Auftakt, Semih), Rest Plausch, Sophie-Knoten, Polaroid.

## Handy-Hinweis

- Aktion Polaroid am Garderobenobjekt: `{aktion:'FOTO'}`, Gespraeche wie bisher mit den Gespraechsflaechen. Tastennamen nur als Hinweis (`E: FOTO`).
- Zeilen <= 44 Zeichen, Gespraeche hoechstens zwei Zeilen je Knoten.
- **Stroboskop/Blitze:** nur ueber `FX.blitz`, `FX.hz` (<= 3 Hz), `FX.wackel`, bei Flackerschutz ueber `FX.ruhig()` ruhig. Keine neue Blitzquelle durch die Trikot-Szene: ohne Stroboskop abspielen (beim Eintritt in die Szene Stroboskop auf Dauerlicht).

## Fertig-wenn

1. `node tools/pruefe.js`, `node test/kampf.test.js`, `node tools/nachttest.js`, `node tools/flagcheck.js` gruen (`marvinNachgerufen`/`kiraTschuess` duerfen bis L6/L8 als ungelesen gemeldet werden).
2. Browser: Intro 22:50, kein `LENA` mehr, Trikot-Szene setzt die beiden Flags je nach Wahl, Kira-Tschuess nur bei positivem Ausgang, Semih-Szene nur bei Mitkommen, Marvin-Cousin-Satz im Auftakt, Zeilen am 375-px-Format ohne Umbruchfehler.
