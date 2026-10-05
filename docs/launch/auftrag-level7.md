# auftrag-level7.md - Level 7, Spaeti (`level7.html`)

Aufwand M, zusaetzlich 2:30 Erzaehlzeit (Pflicht 0:30, Rest optional). Voraussetzung: `auftrag-engine.md` gebaut. Datei: **nur `level7.html`**. Namen aus `flags-vertrag.md`, Texte aus `STORY-BIBEL.md`.

## Ziel in der Geschichte

03:15, fuenf Minuten Ruhe, zum ersten Mal. Der Spaeti ist die Atempause: Wer will, setzt sich auf die Bank und jede Figur sagt, was sie im September macht. Tobi verraet, wo man die Sonne zuerst sieht (Tipp fuer Level 8). Moritz setzt zum vierten Mal an und vertagt sich selbst. Das Wasser aus Level 6 (`Trinkt Wasser.`) wird hier ein Lacher mit Folgen: Herr Oezdemir schreibt jeden auf, der welches kauft.

## PFLICHT

1. **Haken** (`auftrag-engine.md` Kap. 6). `neuesSpiel()`: `PLAUSCH.lade(PLAUSCH_ZEILEN)`, `kapitelZeigen(7)`, Flags `marvinWasser` und `tobiBruecke` auf `false`. Karte: `03:15` / `DER SPAETI` / `FUENF MINUTEN RUHE. ZUM ERSTEN MAL.` `INTRO[0]` wird `03:15. IRGENDWO AN DER ECKE.`
2. **Tobi-Tipp** (`TOBI_BAUM`): jeder Weg (auch `Pech.`) laeuft vorher durch den neuen Knoten, `tobiBruecke` wird auch gesetzt, wenn er nicht mitkommt:
   ```js
   tipp:{ wer:'TOBI', text:'Ich weiss, wo man die Sonne zuerst sieht. Wenn ihr wollt.',
     tu:{flag:'tobiBruecke', mag:['TOBI',6]},
     wahl:[ {txt:'Wo?', geh:'wo'}, {txt:'Spaeter.', geh:'start'} ], zeit:0 },
   wo:{ wer:'TOBI', text:'Bruecke am Kanal. Sonnenaufgang 05:19. Von dort 05:17.', geh:'start' },
   ```
   Der Einstieg `Die sind ohne mich weiter. Einfach so.` bleibt der Anfang, `tipp` ist die erste Wahl `Und sonst?` (immer sichtbar).
3. **Moritz, vierter Anlauf:** beim `ENDE_BAUM` (`Und jetzt?`), vor der Wahl, einmal je Level eine Karte (`zeichneKarte`, je 2,4 s): `MORITZ: DU, ICH MUSS DIR WAS...` / `MORITZ: ...SPAETER. AUF DEM HEIMWEG.|VERSPROCHEN.`
4. **Zeilen-Reparatur:** `X IST NICHT MEHR DABEI.` (Cutscene) wird `X MUSSTE HEIM.`; `S.crewWeg`-Meldung im Level `IST SCHON HEIM` bleibt. **`baueCrew()`** (Zeile ~278): `MAX FERDI` und `MORITZ` gehen nie heim, auch bei Beziehung <= -5 (`alle.filter` nur auf die anderen anwenden); das Finale, Anlauf 4 und der Abspann brauchen beide. Taxi-Tipp: `An der Kreuzung steht eine Truppe.` wird `Heut Nacht laeuft eine Truppe rum. Einer mit Kette.` Heinz: `da an der Kreuzung` wird `da draussen`.
5. **`busDurchDieCrew` lesen:** in der Bank-Runde (unten) und, falls diese uebersprungen wird, als Plausch `MAX FERDI: IM BUS HAST DU UNS DURCHGEBRACHT.` (`wenn:{flag:'busDurchDieCrew'}`, `nach:25`).
6. **Polaroid `moment7`** auf der Bank (hinter den Sitzenden, `x` nahe `560`): `MOMENT.zeichneFund(x,y,7)`, `MOMENT.fund(7)`. Text steht in `texte.js`.

## OPTIONAL (Prioritaet)

1. **Bank-Runde** (`BANK_BAUM`, 40 s, jede Zeile einzeln): Einstieg `WAS MACHST DU IM SEPTEMBER?`; die Wahl zeigt nur Crew-Figuren (`wenn:{crew:'NAME'}`, ausser Tobi), zuletzt `Genug gefragt.` Beziehung `<= -5` zuckt nur mit den Schultern (`wenn` ueber eine Baumfunktion `bankWahl()`, nicht ueber Flags); das trifft nur Moritz und Max, alle anderen mit <= -5 sind schon heim. Antworten:
   - `JONAS: Ich hab Angst, dass keiner mehr schreibt.` Bei `jonasAngstTeilen`: `JONAS: Du hast Ich auch gesagt. Das hat geholfen.`
   - `DENNIS: Training. Dreimal die Woche. Passt.`
   - `SEMIH: Ich kenn in jeder Stadt wen. Gefragt hat keiner.` Wahl `Ich frag dich.` (`mag:['SEMIH',4]`).
   - `LEA: Ich fotografier weiter. Fragt mich mal.` (`mag:['LEA',2]` bei `Was fotografierst du?`.)
   - `MAX FERDI: Muss kurz. Bis gleich.` (steht auf, setzt sich wieder: `Reden wir nie wieder drueber.`)
   - `MORITZ`: nur bei `moritzKartonGesehen` `MORITZ: Du hast ja eh alles gesehen.`, sonst `MORITZ: Frag mich morgen.` (der Anlauf selbst steht schon als Karte in Pflicht 3, nicht doppeln).
   - Bei `gruppeGross`: kleiner Cameo `FINN: ZZZZZ... Ich hab alles gehoert.` / `DAVID telefoniert noch.` (reine Meldung).
2. **Marvin gegenueber** (nur `marvinKennt`): neuer `NACHTMENSCHEN`-Eintrag am Rand der Ecke (`x:860`, `spr:'steh'`, `tint` rot). Mit `hat:'WASSER'` Wahl `Wasser rueberwerfen.` (`tu:{gib:'WASSER', flag:'marvinWasser', mag:['MARVIN',8]}`; `spaetiWasser` bleibt gesetzt) -> `MARVIN: ...Kein Stress. Danke.` Das einzige Wasser gehoert Nele **oder** Marvin: Absicht, Entweder-oder. Ohne Wasser: `Hast du Feuer?`-Echo `MARVIN: Heut nicht.`, keine Wirkung.
3. **Kappe kauft Wasser** (Plausch, `nach:45`): `KAPPE: EIN WASSER. MEIN MANTEL SCHWITZT.`
4. **Radio** bei `mitgesungen` (Plausch, `nach:60`): `RADIO: WONDERWALL.` / `DER MUSIKER VON VORHIN SUMMT.`
5. **Ecke mit Preiskarten** (Ende-Entscheidung gleich, drei Texte): `HEIM. WASSER AUS DEM HAHN.` / `WEITER. DIE NACHT HAT NOCH LICHT.` / `BRUECKE. TOBI HAT EINEN PLAN.`

## PLAUSCH_ZEILEN (hoechstens fuenf)

```js
{id:'l7a', wer:'OEZDEMIR', text:'ICH SCHREIB DIE ALLE AUF.', nach:12, wenn:{flag:'spaetiWasser'}},
{id:'l7b', wer:'MAX FERDI', text:'IM BUS HAST DU UNS DURCHGEBRACHT.', nach:25, wenn:{flag:'busDurchDieCrew'}},
{id:'l7c', wer:'ROCKY', text:'WUFF. (UNTER DER BANK)', nach:40},
{id:'l7d', wer:'KAPPE', text:'EIN WASSER. MEIN MANTEL SCHWITZT.', nach:45},
{id:'l7e', wer:'TOBI', text:'05:17. VON DER BRUECKE.', nach:70, wenn:{flag:'tobiDabei'}},
```
Alle `wer: text` zusammen hoechstens 44 Zeichen (der Test prueft das; `l7b` liegt genau auf 44).

## Flags und Werte

- **Setzt:** `moment7`, `tobiBruecke`, `marvinWasser`; Beziehungen `TOBI` +6, `SEMIH` +4, `MARVIN` +8, `LEA` +2. Bestehend: `spaetiWasser`, `spaetiSnack`, `oezdemirGeschichte`, `taxiTipp`, `neleGeholfen`, `heinzGeholfen`, `tobiDabei`, `endeHeim|endeWeiter|endeSonne`.
- **Liest:** `jonasAngstTeilen`, `moritzKartonGesehen`, `gruppeGross`, `busDurchDieCrew`, `marvinKennt`, `mitgesungen`, Beziehung `<= -5` (nur Nebenfiguren fehlen, Max und Moritz bleiben).
- **Reset beim Levelstart:** `marvinWasser`, `tobiBruecke`.

## Textbudget

Neu: Tobi 3 Zeilen, Moritz 2 Karten, Bank-Runde 8 bis 12 Zeilen, Marvin 3, Plausch 5, Polaroid, Kapitelkarte. Zusammen ca. 1100 Zeichen. Pflicht 0:30 (Karte, Tobi, Anlauf, Polaroid), alles andere ueberspringbar; Gespraeche lassen sich mit der Aktionstaste weiterklicken.

## Handy-Hinweis

- Alle Wahlen ueber die vorhandenen Gespraechsflaechen; Polaroid `{aktion:'FOTO'}` ueber `mobilKontext`. `E: FOTO` nur im Hinweis.
- Gespraechsknoten hoechstens zwei Zeilen (etwa 70 Zeichen); der Tobi-Knoten `wo` ist die Obergrenze, im Zweifel zwei Knoten.
- Keine Blitze in diesem Level (Ruhepause). Neon-Flackern am Spaeti, falls schon vorhanden, nur ueber `FX.hz`/`FX.ruhig`.

## Fertig-wenn

1. `node tools/pruefe.js`, `node tools/nachttest.js`, `node tools/flagcheck.js` gruen: `busDurchDieCrew`, `jonasAngstTeilen`, `moritzKartonGesehen`, `tobiBruecke`, `marvinWasser` haben Leser/Setzer.
2. Browser: Karte einmal, E ueberspringt; Tobi-Tipp setzt `tobiBruecke` auch bei `Pech.`; das einzige Wasser geht nur an Nele **oder** Marvin; Cutscene sagt `MUSSTE HEIM`; Zeilen brechen auch bei 375 px nicht ueber den Rand.
