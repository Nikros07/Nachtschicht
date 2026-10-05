# NACHT-TODO — die Liste für die Nachtroutinen

Diese Datei ist die **Warteschlange**. Alles, was beim Arbeiten offen bleibt,
steht hier — und die Routinen holen es nachts ab:

Eine Routine, nachts, **in der Cloud** (claude.ai → Routinen). Sie testet zuerst alles,
schreibt `NACHT-BERICHT.md`, trägt Funde hier ein und arbeitet danach diese Liste von oben
ab — jeden Punkt gemessen, getestet, einzeln committet. Der Ablauf steht in
`routinen/nacht.md`. Sie arbeitet auf dem Branch **`claude/nacht`**; nach `main` pusht sie
nie — die Live-Seite bleibt, wie sie ist.

Morgens: `NACHT-LOG.md` lesen (was passiert ist), den Branch ansehen
(`git log main..origin/claude/nacht`) und, wenn es passt, nach `main` mergen.

## Wie ein Eintrag aussieht

```
- [ ] **P1 · Kurztitel** — was falsch ist oder fehlt, und warum es nervt.
  Wo: level5.html (Funktion/Zeile) · Fertig wenn: woran man es messen kann
```

- **P1** = Spielfehler oder großer Mangel · **P2** = spürbar · **P3** = Feinschliff
- „Fertig wenn" ist Pflicht: ohne messbares Ende wird nichts abgehakt.
- Eine Entscheidung, die nur der Spieler-/Auftraggeber treffen kann, kommt
  unter **Entscheidung nötig**, nicht unter Offen. Die Routinen fassen die nicht an.

---

## Offen

### P1

*Regel für alles Folgende: ein Punkt = höchstens ~15 Minuten, ein Bereich, eine Messzahl. Ist er größer, vorher teilen.*

### P2

- [ ] **P2 · Analyse nachholen: Level 1, 6, 7, 8, Karte, Runner, Engine, Dramaturgie** —
  neun Prüfer sind am Nutzungslimit gescheitert, siehe PLAYTEST.md ganz unten.
  Fertig wenn: je Bereich Bugs, Schwachstellen und Ideen in PLAYTEST.md ergänzt.

### P3

- [ ] **P3 · Lektion wiederholen können** — wer sie übersprungen hat, bekommt sie nie wieder. Eine Taste
  oder ein Menüpunkt (nur Adresse `?lektion=1` geht heute). Wo: nacht/lehre.js, nacht/eingabe.js ·
  Fertig wenn: auf dem Titelbild lässt sich die Lektion des Levels erneut öffnen.

- [ ] **P3 · `tools/level5_baeume.js` löschen** — wortgleiche Zweitkopie der Bäume, wird nur
  von einem alten Umbau-Skript gelesen. Wo: tools/ · Fertig wenn: Datei weg, `pruefe.js` grün.
- [ ] **P3 · Bahn oder Bus?** — Intro sagt Bahn, das Schild sagt BUS. Wo: level3.html ·
  Fertig wenn: ein Wort überall.
- [x] ~~**P3 · README: Handy-Steuerung beschreibt den alten Stand**~~ (erledigt mit der neuen Handy-Fassung) — „Steuerkreuz links,
  Aktionstasten rechts" gibt es nicht mehr. Wo: README.md · Fertig wenn: beschreibt
  Stick, Info-Tafel und MENÜ-Knopf.
- [ ] **P3 · `TODO.md` ist veraltet** (Stand 17.9., „Level 3–8 Grundversionen") —
  Wo: TODO.md · Fertig wenn: stimmt mit dem Stand überein oder verweist hierher.

---

## Entscheidung nötig (die Routinen lassen das liegen)

- [ ] **Handy-Steuerung am echten Gerät beurteilen** — Größen, Bogen und Menü sind nur in der
  Emulation geprüft (375x812 und 812x375). Daumenreichweite, Knopfgrößen und ob die rechte
  Hälfte als Hauptknopf zu empfindlich ist, kann nur Nick am Telefon sagen. Die Werte stehen
  in `platziere()` in `nacht/mobil.js` (k, Bogenwinkel 8/62/30/78, Abstände).
- [ ] **Sprungknopf an die Hauptposition, wenn kein Hauptknopf da ist?** — in Level 1 und 8 steht
  der Hauptknopf leer, während SPRUNG im Bogen sitzt. Rechts tippen löst dann den Sprung aus;
  ob der Knopf trotzdem in die Ecke rücken soll, ist Geschmack.

- [ ] **Echte Namen und Gesichter der Freunde** — Platzhalter sind Jonas, Dennis, Semih,
  Lea, Max Ferdi, Moritz, Tobi. Braucht Eingabe von Nick.
- [ ] **Finale in Level 8 entschärfen?** — gemessen sehr knapp; ein reiner Counter-Bot
  bringt den Anführer auf 1 HP, bevor er fällt. Soll es leichter werden?
- [ ] **`runner.html` irgendwo verlinken?** — ist von nirgends erreichbar.

---

## Erledigt (Nacht)

*(Die 5-Uhr-Routine trägt hier ein: Datum · Titel · Commit-Hash)*

- [x] 2026-10-05 · P2 · Level 4: Jab und Schwung im Ausholen unterscheidbar · `926e612` ·
  Beide Angriffsarten nutzten dieselbe Windup-Sprite (SPR.bossWind). Neue
  SPR.bossWindJab: enger an den Schultern, mit sichtbarer roter Faust statt blossem
  Torso. Zeichenfunktion waehlt jetzt per `b.art==='jab'` zwischen beiden. Gemessen
  (Software-Canvas, Zeichenketten verglichen): 6 von 72 Zeichen zwischen bossWind und
  bossWindJab unterschiedlich (vorher 0, identisch). Alle vier Pruefungen gruen.

- [x] 2026-10-05 · P2 · Lektionen: Uebungspuppe fuer Rolle in Level 8 · `d62c683` ·
  Dritter und letzter Teil (Konter Level 4 `2e60b48`, Block Level 3 `59d5066`). Neuer
  Schritt in LEKTIONEN['level8.html'] mit `puppe:'rolle'`, gleiche Taste wie der
  bestehende SPRUNG-Schritt (Space - ausserhalb des Kampfes Sprung, im Kampf Rolle,
  siehe `rolleGedrueckt` in level8.html). `PUPPE_ARTEN.rolle` stand schon seit dem
  Block-Punkt, keine weitere Logikaenderung noetig. Gemessen per Simulation
  (node tools/nachttest.js level8): Lektion jetzt mit 4 statt 3 Schritten, LEER
  erledigt den neuen Schritt nur waehrend die Puppe ausholt/schlaegt. Alle vier
  Pruefungen gruen.

- [x] 2026-10-05 · P2 · Lektionen: Uebungspuppe fuer Block in Level 3 · `59d5066` ·
  Zweiter Teil (erster: Konter Level 4, siehe unten), vorher in zwei Punkte geteilt, weil
  beides zusammen ueber ~15 Minuten ging. `puppe`-Schritt-Typ in nacht/lehre.js verall-
  gemeinert: `PUPPE_ARTEN` haelt je Art (konter/block/rolle) Taste und Zeitfenster.
  Level 3s SHIFT-Schritt war bisher optional und zaehlte bei jedem Druck - jetzt
  `puppe:'block'`, nicht mehr optional, erledigt erst waehrend die Puppe ausholt/schlaegt.
  tools/nachttest.js generalisiert: prueft fuer 'block' (anders als 'konter') folgerichtig
  keinen Fruehdruck-Fehlschlag, weil deren Fenster von Anfang an offen ist. Gemessen per
  Simulation (node tools/nachttest.js level3): Lektion ok, SHIFT erledigt den Schritt nur
  waehrend ausholen/schlag. Alle vier Pruefungen gruen.

- [x] 2026-10-05 · P2 · Lektionen: Uebungspuppe fuer Level 4, nur Konter · `2e60b48` ·
  Neuer Schritt-Typ `puppe` in nacht/lehre.js, wie am 4.10. geplant: eine stillstehende
  `kaempfer()`-Instanz (ausholenDauer 1,2s) holt in `Z.takt()` endlos aus, `Z.taste()`
  zaehlt ein E nur, wenn `imKonterfenster(s._puppe,KAMPF.konterAnteil)` wahr ist - alles
  hinter `typeof kaempfer`/`typeof kaempferTakt`-Wachen, da fuenf von acht Leveln
  kampf.js nicht laden. Level 4s eigene Boss-Phasenlogik (`starteAngriff`/`bossPhase`)
  blieb unberuehrt. Die generische Lektionspruefung in tools/nachttest.js druckte bisher
  jede Taste sofort - ergaenzt um einen Fruehdruck-Check (darf den Puppe-Schritt nicht
  erledigen) und ein Takten bis ins Fenster (muss ihn erledigen). Gemessen per Simulation:
  Druck vor dem Fenster laesst `LEHRE.erledigt[i]` false, Druck ab zT>=0,792s (Fenster-
  anfang bei ausholenDauer*(1-konterAnteil)) setzt es true - beides jetzt automatisch in
  nachttest.js geprueft. Alle vier Pruefungen gruen (auch die fuenf Seiten ohne kampf.js).

- [x] 2026-10-05 · P1 · Club-Decke, vierter Schritt: Banner jetzt auch ueber Klos und
  Hinterausgang · `2981c28` · Die Rueckwand-Banner-Schleife (Bar/Raucherecke, `3243c27`)
  lief bisher nur bis x=1065 - kleinster Eingriff: dieselbe Schleife bis x=1400 verlaengert,
  keine neue Zeichenroutine. Der urspruengliche Messweg (56,7 %/59,4 % bei Kamera auf
  x=1150/x=1300) war nicht mehr rekonstruierbar (Vergleichslaeufe mit S.x-Settle und
  direktem S.kamX ergaben andere Werte als die alte Notiz) - eigene, dokumentierte Methode
  verwendet: S.kamX direkt gesetzt (1150 bzw. 1300), Spieler per S.x=-500 ausserhalb des
  Bildes (sonst verzerrt der Spieler-Umriss die Zeilenstatistik), modus:'spiel', ein
  draw()-Aufruf. Gemessen damit: leere Bildzeilen 70,0 % -> 27,2 % (kamX=1150) bzw.
  86,7 % -> 32,2 % (kamX=1300) - beide jetzt unter 50 %. Alle vier Pruefungen gruen,
  flagcheck.js unveraendert bei 7 verloren.

- [x] 2026-10-04 · P2 · Level 1: H-Meldung heisst nicht mehr HANDY · `6ce23e2` ·
  H (index.html, S.stumm) und das Engine-Handy (T, nacht/handy.js) sind zwei echte,
  unterschiedliche Mechaniken, keine tote Dopplung - H macht das eigene Handy beim
  Nachrichtenempfang unhoerbar/ohne Laerm (echte Schleich-Konsequenz ueber laerm() in
  nachricht()), T oeffnet das Engine-Handy mit den HANDY_DREHBUCH-Nachrichten der Nacht.
  Index.html laedt beide Module gleichzeitig - die Verwechslung war echt. Eine
  Zusammenlegung haette die Laerm-Konsequenz in die gemeinsame, levelneutrale
  nacht/handy.js tragen muessen - zu gross fuer einen Punkt. Kleinster sicherer Schritt:
  nur die Meldung bei H heisst jetzt TON AUS/TON AN statt HANDY STUMM/HANDY LAUT;
  S.stumm/nachricht()/laerm() unveraendert. Alle vier Pruefungen gruen.

- [x] 2026-10-04 · P2 · Level 1: Titelbild zeigt nur noch vier Grundtasten · `08af616` ·
  Sieben Tastenzeilen waren eine Bedienungsanleitung zum Lesen. Gemessen (Software-Canvas,
  Zeilen 95-160): die Ueberlappung aus der Beschreibung gab es nicht mehr (sieben sauber
  getrennte Zeilen y 100-152) - nur die Zeilenzahl verfehlte das Ziel. Lampe (Q) und Wurf
  (R) kommen schon als eigene Schritte in der Lektion (nacht/lehre.js, opt:true), H ist
  nur Audio. Jetzt nur noch A D/SHIFT/W S/E (vier Zeilen, deckungsgleich mit der
  Touch-Fassung). Gemessen: y 100-128, vier getrennte Zeilen. Alle vier Pruefungen gruen.

- [x] 2026-10-04 · P2 · Club: Sophie reagiert auf Pegel, Lena ist ansprechbar · `b6a6d00` ·
  Sophie hatte als einzige der drei keine Pegel-Bedingung (Mia/Kira schon) - neue Wahl ab
  pegel:55, gleiche Schwelle wie Mia, fuehrt zu einer eigenen Abfuhr. Lena stand seit der
  ersten Fassung neben der Tanzflaeche, aber naechstesZiel() kannte sie nicht - neuer
  LENA_BAUM (zwei kurze Zweige, keine Werte-Aenderung), als 'lena' verdrahtet. Ein erster
  Versuch mit tu:{mag:['LENA',6]} haette eine neue, nie gelesene Beziehung angelegt
  (flagcheck.js 9->10) - wieder entfernt. Gemessen per Headless-Lauf: Sophie bei Pegel 60
  zeigt die neue Wahl; naechstesZiel() bei Lena liefert {art:'lena'}. Alle vier Pruefungen
  gruen, flagcheck.js unveraendert bei 7 verloren/9 Beziehungen.

- [x] 2026-10-04 · P2 · Club: eine Abfuhr spricht sich jetzt im Gespraech herum · `0e73e3a` ·
  Der Ruf-Abschlag wirkte schon, aber keine andere Figur erwaehnte eine Abfuhr. Neuer
  Knoten startAbfuhr in allen drei Baeumen (MIA/SOPHIE/KIRA_BAUM), eine Zeile dann normal
  weiter zu start; redeMit() waehlt ihn, sobald eine ANDERE der drei schon einen Korb
  gegeben hat, nur einmal pro Figur. tools/nachttest.js: startAbfuhr zur Liste der von
  aussen betretenen Knoten ergaenzt (wie tanzGut/tanzSchlecht). Gemessen per Headless-
  Baumdurchlauf: Mia abblitzen lassen, danach startet das Gespraech mit Sophie bei
  startAbfuhr statt bei start. Alle vier Pruefungen gruen, flagcheck.js unveraendert
  bei 7 verloren.

- [x] 2026-10-04 · P2 · Level 2: Titelbild bringt keine wirkungslose Taste mehr bei · `c04f355` ·
  SPRUNG/LEER stand als Steuerung auf dem Titelbild, aber Level 2 ist flach (keine Tiefe,
  keine Hindernisse) - Springen hatte nie eine Spielwirkung. "WASD" als Sammelbegriff hatte
  dasselbe Problem: nur A/D bewegen, W/S (Tiefe) tun hier nichts. Die Lektion
  (nacht/lehre.js) lehrte beides schon vorher nicht. Titelbild zeigt jetzt nur noch A D
  (LAUFEN) und E (REDEN, SUCHEN, TRINKEN); der Sprung selbst bleibt im Code, wird nur nicht
  mehr beworben. Alle vier Pruefungen gruen.

- [x] 2026-10-04 · P2 · Level 2: mobilKontext() - Knopf zeigt an, was E tut · `794c62b` ·
  Ohne eigenes mobilKontext() griff der ALLGEMEIN-Fallback aus nacht/mobil.js - der Knopf
  hiess immer AKTION. Jetzt dieselbe Vorrangregel wie die echte Aktionsaufloesung in
  update() (Personen vor Moebeln, das Naehere gewinnt), plus Titel/Intro/Cutscene/Ende/
  Pause/Kampf/Gespraech. Gemessen per Headless-Lauf: REDEN bei Max Ferdi, NEHMEN am
  Kuehlschrank, TRINKEN an den Getraenken, SPIEGEL am Spiegel, SUCHEN/LEER am Tisch je
  nach S.durchsucht, WEITER waehrend des Mitnehmen-Gespraechs, KONTER im Kampf - vorher
  ueberall AKTION. Alle vier Pruefungen gruen.

- [x] 2026-10-04 · P1 · Club-Decke: Banner an der Rueckwand ueber Bar und Raucherecke · `3243c27` ·
  Dritter Schritt gegen die leere obere Bildhaelfte im Club, nach Lautsprecherreihe und
  Discokugeln. War zweimal blockiert (siehe „Blockiert"), weil der Zufallslauf diesen
  Teil des Levels nie erreichte - seit `66ecc5f` (Tastenmix-Punkt oben) geht das. Erster
  Versuch nur ein halb so hoher Rahmen (y 38-105) - kam auf 48,4 % statt der
  geforderten hoechstens 48, weil die Wand darueber und darunter leer blieb. Banner
  jetzt ueber die volle Wandhoehe (y 20 bis TIEFE.hinten). Gemessen (node
  tools/nachttest.js level5): leere Bildzeilen 46,5 % (gefordert hoechstens 48 %).
  Alle vier Pruefungen gruen, flagcheck.js unveraendert bei 7 verloren.

- [x] 2026-10-04 · P2 · nachttest.js: Zufallslauf in Level 5 kommt jetzt durch den ganzen Level · `66ecc5f` ·
  Tastenmix fuer den 60-s-Spiellauf war fast ausgeglichen (2x KeyD gegen 1x KeyA, dazu
  sieben Tasten ohne Seitwaertswirkung) - im Schnitt nur 10% der Hoechstgeschwindigkeit
  nach rechts. Erster Versuch (`c1e717e`, KeyD 5x) war in einem Wegwerf-Skript ohne
  draw()-Aufrufe gemessen und daher falsch: draw() zieht selbst aus Math.random()
  (Bildzittern), das im Nachttest an denselben Seed gekoppelt ist wie die
  Tastenauswahl - ohne draw() lief die Zufallsfolge anders als im echten
  `node tools/nachttest.js`. Mit dem echten Skript blieb derselbe Tastenmix bei
  x=639,8 nach 59 s haengen. KeyD jetzt 9x statt 2x (17 statt 10 Eintraege), KeyA
  weiterhin 1x, mit dem echten `node tools/nachttest.js level5` gemessen: x
  ueberschreitet 900 bei 41,4 s, Lauf endet bei x=1354 (Modi jetzt sogar
  spiel/mini/cutscene/ende - der Lauf kommt bis zum Ausgang). Macht den
  Club-Decke-Punkt (siehe „Blockiert" unten) wieder pruefbar. Alle vier Pruefungen
  weiterhin gruen, „verloren" bei flagcheck.js unveraendert bei 7.

- [x] 2026-10-03 · P2 · Bus: Fahrschein rettet nur noch eine Kontrolle, nicht die Fahrt · `a13acb2` ·
  Zwei zusammenhängende Fehler zugleich erledigt: (1) S.ticket machte für den Rest der
  Fahrt komplett unverwundbar (Sichtkegel aus, Verdacht eingefroren) statt nur die eine
  Kontrolle zu retten - jetzt steigt der Verdacht normal, bei 100 rettet das Ticket
  einmal (kein Leben weg, verbraucht) und die nächste Kontrolle trifft normal.
  (2) `ticket:flag('busTicket')` beim Levelstart ließ einen einmal gekauften Fahrschein
  jeden Neustart überleben - ticket startet jetzt immer `false`. Gemessen per
  Headless-Lauf: 1. erzwungene Kontrolle mit Ticket hp 3→3 (Ticket verbraucht),
  2. Kontrolle hp 3→2 (normal getroffen); nach neuesSpiel() mit weiterhin gesetztem
  flag('busTicket') ist S.ticket jetzt false statt true. Alle vier Prüfungen grün.

- [x] 2026-10-03 · P2 · Phase-3-Jab-Reaktionszeit: Konterfenster hat jetzt eine Mindestbreite · `add3dd5` ·
  Bei Pegel 100 und in Phase 3 schrumpfte das Fenster auf 0,085 s (unter jeder
  menschlichen Reaktionszeit). Neue TUNE.fensterMinSek (0,28s) hebt fensterAnteil
  so weit an, dass ausholenDauer*fensterAnteil nie darunter fällt. Betrifft nur
  schwung/jab, ramme bleibt unblockbar ohne Fenster. Gemessen: kleinste Fensterbreite
  über alle Phasen/Angriffe bei Pegel 100 vorher 0,085s, nachher exakt 0,280s
  (gefordert ≥0,28s). Alle vier Prüfungen grün.

- [x] 2026-10-03 · P2 · Pegel verengt das Konterfenster unsichtbar: Befund war veraltet ·
  nicht gebaut, kein Code geändert außer dem Fix oben. zeichneAusholbalken() in
  nacht/hud.js liest b.fensterAnteil direkt - dieselbe Quelle wie konterVersuch() in
  nacht/kampf.js. Balken und echtes Fenster stimmen schon überein, vermutlich seit der
  Kampfsprache-Vereinheitlichung (Commit `781b327`). Gemessen (Pegel 80, Jab): Balken-
  Fensterstart 0,420s vs. echter Fensterstart 0,423s - Differenz nur Pixel-Rundung.

- [x] 2026-10-03 · P2 · Level 4: Leertaste startet jetzt wirklich · `044eef1` ·
  Space war nur an die Ausweichrolle gebunden, nie an druckAktion() - das Titelbild
  versprach „E ODER LEERTASTE", aber nur E/Enter starteten. Jetzt wie in level3.html
  (druckSprung): Space löst außerhalb des Kampfes druckAktion() aus. Nebenbefund: der
  Nachttest drückt am Anfang Leertaste zum Starten - das lief bisher ins Leere, der
  „Nichtstun"-Lauf von Level 4 blieb auf dem Titelbild stehen (daher die bisherigen
  „0 Ereignisse"). Löst nebenbei den P3-Punkt „Wer nichts tut, wird nie getroffen" auf
  (siehe unten). Gemessen: nachttest.js level4 Nichtstun 300s vorher 0 Ereignisse (auf
  dem Titelbild), nachher 3 Ereignisse, letztes bei 9s (echter Kampf). Alle vier
  Prüfungen grün.

- [x] 2026-10-03 · P3 · Level 4: untätiger Spieler verliert in 9 s · (im selben Fund wie `044eef1`) ·
  Frage war nicht beantwortbar, weil der Nichtstun-Lauf bisher auf dem Titelbild
  steckte (siehe Fund oben). Nach der Space-Korrektur gemessen: S.hp 3 → 0 nach dem
  Intro-Skip bis Sekunde 9, S.modus wird 'ende', S.gewonnen=false. Ein untätiger
  Spieler verliert also zuverlässig - kein Softlock, kein zeitloser Kampf.

- [x] 2026-10-03 · P1 · Obere Bildhälfte Level 8 (Heimweg): Sterne, Mond, durchgehende Häuserreihe · `82c14c9` ·
  320 statt 30 Sterne (dichter verteilt, sonst reisst keine Zeile die Kanten-Schwelle),
  ein Mond gegenüber der Sonne, beide bis t=0,7 statt 0,6 sichtbar, und eine lückenlose
  Häuserreihe mit Fenstern statt einzelner Häuser mit 50-px-Lücken. Die lückenlose Reihe
  hätte die Sonne verdeckt, solange sie tief steht - zeichneSonne() läuft deshalb jetzt
  nach der Häuserreihe, nicht davor. Pixelprobe: Sonnenfarbe bei licht=0/30/60/75/100
  trifft exakt die erwarteten Werte (z. B. #fff4c2 bei licht=0), nicht mehr verschluckt.
  Gemessen (nachttest.js, 60 s Zufallslauf): leere Bildzeilen 76 % → 64 % (gefordert
  höchstens 66 %). Alle vier Prüfungen grün.

- [x] 2026-10-03 · P1 · Obere Bildhälfte Level 7 (Späti): Regal und Leuchtreklame · `a03bfed` ·
  Zwei Regalreihen mit Waren und eine leuchtende OFFEN-Reklame im Schaufenster, in der
  Ladenwand (x 300-520). Wie bei Level 6 liegt die Deko in der Bildmitte (y 70-108),
  nicht am oberen Rand, wegen der permanenten Vignette (mindestens 50 % Deckkraft).
  Gemessen (nachttest.js, 60 s Zufallslauf): leere Bildzeilen 73 % → 59 % (gefordert
  höchstens 63 %). Alle vier Prüfungen grün.

- [x] 2026-10-03 · P1 · Obere Bildhälfte Level 6 (Afterhour): Wanddeko (Plakate/Spinde) · `56f7b97` ·
  Deckenleuchten (y 23-29) blieben wirkungslos: die Vignette in zeichneFlur liegt mit
  mindestens 50 % Deckkraft permanent über dem Bild und schluckt dort fast jeden
  Kontrast (gemessen 68,685 % vor wie nach dem ersten Versuch, identisch bis auf drei
  Nachkommastellen). Näher an der Bildmitte (y 70-92, eine Sorte, wiederholt über die
  Flurbreite) bleibt genug Kontrast übrig. Gemessen (nachttest.js, 60 s Zufallslauf,
  Nachkommastellen temporär ausgegeben): 68,685 % → 58,494 % (gefordert höchstens
  59 %). Alle vier Prüfungen grün. Hinweis für Level 7/8: vor Deckenlicht-artigen
  Elementen prüfen, ob die jeweilige Zeichenfunktion eine ähnliche Vignette/Abdunklung
  am oberen Bildrand hat.

- [x] 2026-10-03 · P1 · Obere Bildhälfte Level 2 (Wohnung): Bilderrahmen, Regal, Wandverkleidung · `bcad605` ·
  Drei wiederholte Muster über die Breite (x 14-890) in zeichneWohnung(). Gemessen
  (nachttest.js, 60 s Zufallslauf): leere Bildzeilen 71 % → 49 % (gefordert höchstens
  55 %; die alte Referenz 65 % war vor dem Umbau der Mitnehmen-Wahl gemessen). Alle
  vier Prüfungen grün.

- [x] 2026-10-02 · P1 · Club-Decke: Discokugel und Lichtsäulen über der Tanzfläche · `c91cee8` ·
  Vier Discokugeln (Schachbrettmuster) mit gestreiften Lichtsäulen darunter, nur
  über x 170-620. Gemessen (nachttest.js, 60 s Zufallslauf): leere Bildzeilen
  65 % → 53 % (gefordert höchstens 58 %). Alle vier Prüfungen grün.

- [x] 2026-10-02 · P1 · Club-Decke: Lautsprecherreihe über die ganze Breite · `13ef962` ·
  Lautsprecher-Saeule mit Gitterstreifen, alle 50 px wiederholt ueber 1400 px
  Levelbreite in zeichneClub(). Gemessen (nachttest.js, 60 s Zufallslauf): leere
  Bildzeilen 77-78 % → 65 % (gefordert höchstens 68 %). Alle vier Prüfungen grün.

- [x] 2026-10-02 · P1 · Club, Klos: Befund war veraltet, Punkt gestrichen ·
  nicht gebaut, kein Spielcode geändert. WASCHBECKEN (x=1120) existiert seit der
  ersten Fassung von Level 5 (Commit `0a47a28`), lange vor dem Fund „vier von
  sechs Bereichen leer". Gemessen per Headless-Lauf: naechstesZiel() bei x=1120
  liefert {art:'wasser'}, E senkt den Pegel messbar (50,0 → 31,95) und zeigt
  „KALTES WASSER INS GESICHT". Klos hat also schon eine echte, wirksame
  Interaktion - der Befund war veraltet.

- [x] 2026-10-02 · P1 · Club, Hinterausgang: Kisten und ein Lieferant · `ad78867` ·
  Fuenf vier-hoch gestapelte Kisten (reichen in die leere Wand hinein) plus
  LIEFERANT (x=1250, Handlanger-Umriss) mit einem erklaerenden Satz. Gemessen mit
  Wegwerf-Software-Canvas auf den Hinterausgang-Ausschnitt: leere Bildzeilen 77.2 %
  auf 69.4 % (Differenz 7.8 Punkte, gefordert mindestens 5). nachttest.js grün.

- [x] 2026-10-02 · P1 · Club, Raucherecke: zwei Stehende mit je einem Satz · `39e80cb` ·
  RAUCHER1 (x=900) und RAUCHER2 (x=1010), vorhandener Tanzer-Umriss eingefaerbt, je
  ein Satz per E, kein Baum. Gemessen per Headless-Lauf: naechstesZiel() liefert an
  beiden Stellen das jeweils eigene Ziel mit dem richtigen Satz; nachttest.js grün.

- [x] 2026-10-02 · P1 · Club, Eingang: Garderobe zum Ansprechen · `0c6e875` ·
  GARDEROBE (x=70, SPR.theke), GARDEROBE_BAUM mit zwei Sätzen, ruf+1, einmal nutzbar.
  Gemessen per Headless-Lauf: naechstesZiel() am Eingang vorher {art:'garderobe'},
  ruf 50→51 · danach naechstesZiel() dort null, ruf bleibt 51. nachttest.js grün
  (5 Bäume/51 Knoten, vorher 4/48).

- [x] 2026-10-02 · P1 · Club-Uhr: Ambient-Ereignisse gegen die 193-s-Stille · `afea7a1` ·
  TUNE.CLUB_EREIGNISSE (8 Sätze), Zufallsbeutel ohne direkte Wiederholung, ab Sekunde 20
  alle ~25 s über ambientTakt(dt). Gemessen (Nichtstun 300 s): vorher 4 Ereignisse,
  letztes bei 107 s · nachher 16 Ereignisse, letztes bei 295 s (gefordert: mindestens 12,
  letztes nach 270 s).

- [x] 2026-10-01 · P1 · Nachttest: Software-Canvas für Pixelmessung · `307b659` ·
  leere Bildzeilen (60-s-Zufallslauf, Mittelwert): Wohnung 65 % (Referenz 66, Diff 1) ·
  Club 78 % (73, Diff 5) · Afterhour 69 % (72, Diff 3) · Späti 73 % (77, Diff 4) ·
  Heimweg 76 % (77, Diff 1) — alle innerhalb der geforderten 8 Punkte. Keine echte
  Browser-Messung, sondern ein eigener Software-Rasterizer (fillRect/drawImage/Pfade/
  Verläufe), gegen die Browser-Referenz aus PLAYTEST.md kalibriert.

- [x] 2026-10-01 · P1 · Bus: Ablenkung zieht Kontrolleure auf den Spieler zu ·
  `5dbf1c1` · Gemessen (Spieler reglos bei x=325, 8 s Ablenkung ab Trigger):
  Abstand des naechsten Kontrolleurs vorher 85 px, sank auf 0 und loeste Alarm
  (erwischt) aus · nachher (mit Fix) 289/317/322/338/668 px, kein Alarm in 8 s.

- [x] 2026-10-01 · P1 · Club: Ausgang öffnet erst mit einem Grund · `297f845` ·
  abgespalten von „Club zum Ort machen" (siehe Blockiert). Gemessen per Headless-Lauf:
  frischer Levelstart, direkt zum Ausgang, E gedrückt -> Modus blieb vorher 'cutscene'
  (sofort offen), jetzt bleibt er 'spiel'. Nach einer Interaktion (Wasser am
  Waschbecken) -> E am Ausgang wechselt zu 'cutscene'.

- [x] 2026-10-01 · P1 · Level 2: Mitnehmen-Wahl kommt nach dem Kampf · `b524a82` ·
  Wahl steht jetzt am Levelanfang, `aktiveAufgaben()` filtert danach. Gemessen per
  Headless-Lauf: bei „klein" sind nur jacke+ausweis aktiv, Kampf/Cutscene lösen schon
  danach aus, Crew danach [MORITZ, MAX FERDI]; bei „alle" bleibt alleFertig() mit nur
  jacke+ausweis false, nach allen vieren true, Crew danach [MORITZ, MAX FERDI, FINN,
  DAVID]. DER SCHLÄFER/DER TELEFONIERER heißen jetzt FINN/DAVID, mit je drei Sätzen
  nach dem Aufwecken/Holen.

- [x] 2026-10-01 · P2 · Bus: blinkendes E über den Verstecken erscheint nie · `ba1890b`
  · Zeichenroutine nutzte eine eigene hartkodierte Tiefenprüfung (<=0.3) statt
  tiefeNah() wie naheVersteck(). Da S.tiefe im Bus (Tiefe aus) bei gangTiefe (0.72)
  steht und alle Verstecke t 0.10-0.20 haben, war die Prüfung nie erfüllt. Gemessen:
  Bedingung für das E an Versteck v1 war false, ist jetzt true - naheVersteck() fand
  den Spot beide Male.

## Blockiert

*(Was die Routine zweimal versucht hat und zurückgerollt hat — mit Grund.)*

- **2026-10-05 · P2 · Level 4: jede Phase soll die vorige Antwort entwerten** — nicht
  gebaut, kein Code geaendert. Grund: Zweifel am Spielgefuehl (siehe „Zweifelst du..." in
  routinen/nacht.md), kein gescheiterter Bauversuch. Phase 2 entwertet die Phase-1-Antwort
  bereits echt: `naechsteArt()` schaltet den Rammstoss dazu, und `konterVersuch()` lehnt
  `opt.unblockbar` explizit ab (kampf.js Zeile 267) - Rammen MUSS man ausweichen, Kontern
  geht nicht mehr. Phase 3 aendert laut `naechsteArt()`/`starteAngriff()` nur noch Zahlen
  (kuerzere Fenster/Pausen ueber `TUNE.phaseWindupKuerzer`/`phasePauseKuerzer`) - keine neue
  Antwort. Eine echte vierte Antwort fuer Phase 3 braucht einen neuen Angriff, der Kontern
  UND Ausweichen beide entwertet (vermutlich: nur per Block zu entschaerfen) - das heisst
  `unblockbarJetzt` in eine fuer Konter und fuer Block getrennte Fahne aufzuspalten
  (aktuell eine gemeinsame, siehe level4.html Zeile 364 und kampf.js `opt.unblockbar` in
  `loeseTreffer`/`konterVersuch`), eine neue Windup-Pose UND eine Balance-Entscheidung
  (wie stark, wie oft) - das ist Gestaltung, kein kleinster Eingriff, und schlecht
  geraten haette den ohnehin knappen Kampf (siehe „Finale in Level 8 entschaerfen?" unter
  Entscheidung noetig) eher kaputt gemacht als verbessert.
  Fertig wenn weiterhin: Phase 2 und 3 verlangen je eine andere Antwort als Phase 1 -
  Phase 2 erfuellt das schon (Ramme), Phase 3 noch nicht.

- **2026-10-02 · P1 · Club-Decke: Banner oder Galerie an der Rückwand** — zweimal
  gebaut (zuerst bei y 24, dann tiefer bei y 56, beides x 630-1060 ueber Bar und
  Raucherecke), beide Male per `git restore level5.html` zurueckgerollt, weil die
  vorgeschriebene Messung (`node tools/nachttest.js`) den Bereich nie erreicht:
  der 60-s-Zufallslauf bewegt sich in Level 5 mit diesem Seed nur von x=40 bis
  x≈371 (Eingang und ein Stueck Tanzflaeche, siehe neuer Punkt unten), bevor ein
  Minispiel die restliche Zeit fuellt. Direkt mit der Kamera auf x=800 gestellt
  (wie beim Hinterausgang) sinkt die Zeile dort tatsaechlich von 65 % auf 40,6 %
  - der Baustein wirkt also, aber `node tools/nachttest.js` meldet trotzdem
  unveraendert 52,83 % (gerundet 53 %), weil dort nie hingeschaut wird. Fertig
  wenn in NACHT-TODO.md verlangt „leere Bildzeilen im Club" aus genau diesem
  Lauf - mit dem jetzigen Zufallslauf ist das Ziel so nicht pruefbar. Bleibt
  offen, bis der neue Punkt „Nichtstun-Zufallslauf Level 5 kommt nie ueber
  x=400 hinaus" entschieden ist.
  **Erledigt am 4.10.** (siehe „Erledigt (Nacht)"): der Zufallslauf erreicht den
  Bereich seit `66ecc5f`, das Banner steht seit `3243c27`.

- **2026-10-01 · P1 · Obere Bildhälfte füllen** — nicht gebaut, kein Code geändert.
  Grund: das Ziel (Club unter 45 % leere Zeilen, gemessen gerade bei ~78 %) verlangt
  eine Senkung um über 30 Punkte - das braucht durchgehende neue Deko (Decke, Lichter,
  Lautsprecher) über weite Teile der 1400 px Levelbreite, nicht ein paar Lampen an
  einer Stelle. Das ist ein echtes Kunst-/Gestaltungsprojekt, kein kleinster Eingriff,
  und unter Zeitdruck zusammengeschustert haette es eher ungleichmaessig/unruhig
  gewirkt als geholfen (siehe „Zweifelst du..." in `routinen/nacht.md`). Aufgeteilt am 1.10. in die Punkte Club-Decke und Obere Bildhälfte Level 2/6/7/8 (P1).
  Bleibt offen, jetzt mit echter Messzahl (vorher geschaetzt, jetzt durch den Software-Canvas von
  heute Nacht gemessen: 78 % statt der frueheren Browser-Schaetzung 73 %, Naeherung).

- **2026-10-01 · P1 · Club zum Ort machen: vier von sechs Bereichen sind leer** — nicht
  gebaut, kein Code geändert. Grund: der Punkt ist drei verschiedene Dinge in einem
  (Ausgang-Bedingung, vier Bereiche mit echtem Inhalt, mehr Nichtstun-Ereignisse) und
  der Inhaltsteil braucht neue Sprites/Deko und geschriebene Szenen - kein kleinster
  Eingriff, und unter Zeitdruck zusammengeschustert hätte es dem Club eher geschadet
  als genützt (siehe „Zweifelst du..." in `routinen/nacht.md`). Aufgeteilt in zwei
  neue, kleinere Punkte unter „Offen": die Ausgang-Bedingung (klein, sicher) und der
  Inhalt der vier Bereiche (bleibt groß, aber jetzt ohne die Ausgang-Frage vermischt).
