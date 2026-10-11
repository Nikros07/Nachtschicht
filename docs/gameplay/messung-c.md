# Monotonie-Messung C: Level 7, Level 8, Karte, Runner

Stand: 2026-10-06 (begonnen 2026-10-05). Rein analysierend - keine Spieldatei wurde geaendert.
Messskripte: `docs/gameplay/messung/c-*.js` (aus der Projektwurzel starten: `node docs/gameplay/messung/c-level7.js`).

> Vollstaendig: Level 7, Level 8, Karte, Runner und ein Querschnitt am Ende.

## Vorgehen

1. Code lesen: TUNE, update(), Eingabe (keydown), Musik, Rueckmeldung je Aktion, Ende.
2. Bot spielt das Level mit sinnvollen Eingaben ueber `tools/nachttest.js` (Modul), zeichnet
   Zeitstempel auf: Moduswechsel, Meldungen, Gespraeche, Treffer, Funde.
3. Auswertung: Spielzeit, laengste Leere, Verben mit Haeufigkeit, Scheitern.

**Messkoffer** (`docs/gameplay/messung/`):

| Datei | Was |
|:--|:--|
| `c-hilfe.js` | Rekorder: taktet `update(1/60)`, liest jedes Bild den Zustand, schreibt Ereignisse mit Zeitstempel. Lesezeit-Modell, Leere-Auswertung. |
| `c-level7.js` | 5 Szenarien plus Softlock-Sweep (Startgeld x Troedelzeit). `--log` druckt alle Ereignisse. |
| `c-level8.js` | Bot-Spieler fuer Konfrontation, Endkampf (4 Taktiken), Wettlauf, Finale, Abspann; Neustart nach der Sonne. `--log` druckt alle Ereignisse. |
| `c-level8-kampf.js` | Endkampf ueber 30 Zufallsstaende je Taktik: Siege, Dauer, Angriffsarten. |
| `c-level8-ursachen.js` | Woran der Konter-Bot verliert (Schadensquellen), Angriffe je Phase, mit/ohne Crew, 4 Leben. |
| `c-level8-sprung.js` | Sprungfenster je Hindernis in px und ms (mit/ohne MAX FERDI). |
| `c-level8-sonne.js` | Sweep Umwege x Kampfausgang x Treffer -> Licht an der Haustuer; Sonnenaufgangs-Weg; Neustart-Kette; Hindernis-Takt. |
| `c-musik.js` | Falscher AudioContext: Toene, Stimmen, Tonhoehen je Modus; Notenstau nach Pause/Karte. |
| `c-karte.js` | Karte nach jedem Level, mit und ohne Umweg; Doppeltipp; Umweg ablehnen. |
| `c-runner.js` | Bonus-Runner mit einem Bot nach dem Vorbild von `demoBrain()` (4 Varianten). |

**Lesezeit-Modell:** Ein Bot drueckt sonst in 0 s durch jeden Dialog. Der Bot wartet wie ein
Mensch: 0,6 s Reaktion + 14 Zeichen/s, bei einer Auswahl zusaetzlich 0,8 s + 0,35 s je Antwort.
Die Spielzeiten sind deshalb Schaetzungen fuer einen Erstspieler, der liest.

**Impulse** (fuer die "laengste Leere"): *Entscheidung* = Gespraechsknoten mit Auswahl;
*Herausforderung* = etwas, das man verfehlen kann (Hindernis naht, Angriff holt aus, Abschiedsfenster);
*Information* = neuer Gespraechstext, Meldung, Hinweis, Plausch, Karte, Polaroid, neues E-Ziel in
Reichweite. Gemessen werden zwei Werte: die laengste Strecke ohne **irgendeinen** Impuls und die
laengste Strecke ohne **Entscheidung oder Herausforderung** (nur Text zaehlt dort nicht).

## Level 7 - Spaeti

### Messwerte (`node docs/gameplay/messung/c-level7.js`)

| Szenario | Spielzeit (ab Steuerung) | davon Dialog | laengste Leere (alles) | laengste Strecke ohne Entscheidung/Herausforderung | Ende? |
|:--|--:|--:|--:|--:|:--|
| A Vollspieler (15 EUR, redet mit allen, liest) | **178 s** (+14 s Intro/Kapitel) | **142 s (80 %)** | 9,6 s | 21,7 s (Abschluss-Cutscene) | ja |
| B Schnelllaeufer (Kasse, Ecke) | **30 s** | 15 s | 4,5 s | 12,9 s | ja |
| C Pleite (0 EUR), sammelt sofort Pfand | 39 s | 19 s | 4,5 s | 12,5 s | ja |
| D Pleite, redet erst mit Taxi/Nele (Erstspieler) | 76 s, **dann Sackgasse** | 48 s | 9,6 s | 17,2 s | **nein - Softlock** |
| E Nichtstun 90 s | - | 0 | 38,8 s | 90 s | nein |

Herausforderungen im ganzen Level: **0** (Szenario A, B). Die einzige "Gefahr" ist Heinz, der
Pfandflaschen wegsammelt - und die betrifft nur, wer pleite ankommt.

**Verben (Szenario A, mit Wirkung):** laufen 10, Tiefe (W/S) 8, reden (E) 7, antworten 21,
weiterlesen 14, Antwort waehlen 4, ansehen 1, Foto 1, Ecke 1. Im Kern **drei** Verben: gehen,
E an einem Ziel, im Dialog waehlen. Pleite kommt "aufheben" dazu (C: 10x). Springen (Leertaste)
funktioniert, hat aber in diesem Level **nichts**, ueber das man springen muesste.

**Scheitern:** keine Niederlage (der "MOMENT MAL"-Zweig im Endbildschirm ist laut Kommentar
nie erreichbar). Die einzige Art zu scheitern ist ein **unsichtbarer Softlock** (siehe Bugs).

### Softlock-Sweep: Startgeld x Troedelzeit

Heinz laeuft mit 20 px/s immer zur naechsten Flasche. Gemessen beim Nichtstun: die 7 Flaschen
links sind nach **18 s** weg, alle 14 nach **52 s** (Zeitstempel 5,3 / 7,7 / 10,2 / ... / 55,9 s).
Wasser + Snack kosten 5 EUR, eine Flasche bringt 0,50 EUR, es gibt keine andere Geldquelle.
Ergebnis "reicht das Geld?", wenn man erst N Sekunden redet/schaut und dann flink sammelt:

| Startgeld | 0 s | 10 s | 20 s | 30 s | 45 s |
|:--|:--:|:--:|:--:|:--:|:--:|
| 0 EUR | ja | **nein** (4,50) | **nein** (3,50) | **nein** (2,00) | **nein** (0) |
| 1 EUR | ja | ja | **nein** (4,50) | **nein** (3,00) | **nein** |
| 2 EUR | ja | ja | ja | **nein** (4,00) | **nein** |
| 3 EUR | ja | ja | ja | ja | **nein** |
| 4 EUR | ja | ja | ja | ja | **nein** |

Der `TUNE`-Kommentar (Zeile 111-113) sagt selbst: wer im Bus bezahlt und im Club Runden
geschmissen hat, kommt mit **0 bis 4 EUR** an. Ein Erstspieler, der zuerst mit Taxi und Nele
redet (Szenario D, 41 s bis zur Kasse), endet mit 8 eigenen Flaschen, 6 bei Heinz, 4 EUR:
Wasser gekauft, Snack nicht bezahlbar, die Ecke sagt fuer immer "ERST WASSER UND WAS ZU ESSEN".
Kein Neustart im Spiel, kein Hinweis, kein Ausweg ausser Seite neu laden.

### Code-Befunde (Monotonie-Gruende)

1. **Kein Spiel, nur Menues.** 80 % der Spielzeit (Szenario A) sind Textkaesten. Die Bank-Runde
   (`baueBank()`, Z. 421) ist eine Liste "Wer?" -> eine Zeile -> "Noch jemand?" -> sechsmal
   dasselbe Muster (Ereignisse 85,8 s bis 134,0 s: 48 s Fragebogen).
2. **Keine Herausforderung ohne Pleite.** Mit 15 EUR (Startwert `STAND_VORLAGE.geld`) ist Pfand
   bedeutungslos; Heinz (`heinzTakt`, Z. 770) laeuft trotzdem und nimmt Flaschen, ohne dass es
   jemanden kuemmert. Mit 0-2 EUR wird es dagegen sofort ein harter, unsichtbarer Fehlschlag.
3. **Fake-Entscheidungen.** 21 Auswahlen, aber nur 6 wirken ueber das Level hinaus (`taxiTipp`,
   `neleGeholfen`, `tobiDabei`/`tobiBruecke`, `marvinWasser`, `heinzGeholfen`, Ende-Weg). Die
   Bank-Antworten aendern nur Beziehungswerte um 2-4 (`mag`), ohne Rueckmeldung.
4. **Keine Rueckmeldung ausser Text.** `S.ruettel` und `S.blitz` werden in Level 7 nie gesetzt
   (nur in `neuesSpiel` auf 0 und in `update` heruntergezaehlt, Z. 595-596) - toter Effektcode.
   Kaufen (Wasser) hat keinen eigenen Ton (nur der Sprecher-Piep), keine Partikel, nichts fliegt.
5. **Musik:** `PAD` (Z. 212) = 16 Schritte, davon 4 Toene (C3 E3 G3 D3, Sinus, Lautstaerke 0,02),
   ein Schritt 0,43 s -> **Schleife 6,9 s**, eine Stimme. Bei 3 Minuten Spielzeit ~26
   Wiederholungen ohne jede Aenderung (keine Abschnitte, keine Reaktion auf Kauf/Ende).
6. **Springen ohne Zweck.** `druckSprung` -> Sprungphysik (Z. 635-644) ist voll da, aber es gibt
   kein Hindernis, keine Plattform, keinen Gegenstand oben.
7. **Belohnung am Ende:** "LEVEL 7 GESCHAFFT" steht zweimal hintereinander (letzte Cutscene-Karte
   Z. 824 und Endbildschirm Z. 1072), dazu Zeit, Bestzeit, Pegel. Keine Wertung, kein Rang;
   die Bilanz-Cutscene (Z. 813-826) ist dagegen gut (sie zeigt, wem man geholfen hat).
8. **Ruhepause ohne Kontrast.** Das Level soll "fuenf Minuten Ruhe" sein (Intro Z. 569), aber
   die Ruhe ist Leerlauf statt Belohnung: es gibt nichts zu geniessen (kein Minispiel an der
   Bank, kein Snack-Effekt ausser `kondition+15`, der nur eine Antwort in `ENDE_BAUM` freischaltet).

### Staerken

- Figuren mit Haltung (Oezdemir, Nele, Heinz, Tobi), Zeilen mit Gewicht ("Alle, die bei mir
  Wasser gekauft haben."). Die Bilanz-Cutscene spiegelt Taten zurueck - das ist das Beste am Level.
- Entscheidungen tragen ins Finale: Taxi-Tipp verlaengert das Ausholen in Level 8 um 15 %
  (`starteAngriff8`), Marvins Wasser oeffnet den Frieden, Tobi geht mit.
- Pegel baut sichtbar ab (1/s) - erzaehlerisch passend.
- Die Idee "Heinz sammelt dieselben Flaschen" ist eine echte Mechanik mit Moral (ihm die
  Flaschen lassen) - sie ist nur falsch eingestellt.

### Ideen (je in `level7.html` machbar)

1. **Softlock beheben und Heinz zur Wahl machen:** Heinz startet erst, wenn man pleite ist und
   zum ersten Mal eine Flasche aufhebt (oder `heinzTempo` auf 12, Start bei x=-60); wer ihm die
   Flaschen laesst (`@heinz`), bekommt von Oezdemir anschreiben ("ICH SCHREIB DIE ALLE AUF" -
   die Plauschzeile l7a gibt es schon): Wasser auf Pump, Flag `oezdemirPump`.
2. **Pfand als kurzes Sammel-Minispiel mit Zeitdruck:** 20 s Countdown sichtbar, Flaschen
   glitzern, jede Flasche +Ton steigend (wie Muenzen bei Mario), Kombo bei schnellem Sammeln,
   Heinz als sichtbarer Rivale mit eigenem Zaehler oben rechts.
3. **Kasse als Timing-Spiel:** Kleingeld abzaehlen (Leiste mit 0,50/1/2-Muenzen, E zum Ablegen,
   genau 2,00 treffen) - 10 s, scheitern kostet nur einen Satz von Oezdemir.
4. **Bank-Runde als Szene statt Liste:** jede Figur sitzt auf der Bank; man setzt sich neben
   jemanden (E), die Kamera zoomt per `ctx.scale`, ein Satz, ein Seufzer-Ton. Wen man **nicht**
   fragt, sagt beim Weggehen "...mich hat keiner gefragt" (Semih-Zeile existiert schon als Thema).
5. **Snack teilen als Entscheidung mit Mechanik:** Snack in 4 Stuecke (E je Stueck an eine
   Crew-Figur), jedes Stueck +4 `mag` - sichtbar mit Herzchen-Partikel ueber dem Kopf.
6. **Sprung nutzen:** Kippe die Pfandkiste hinter dem Laden auf (Sprung auf den Container,
   3 Flaschen oben) - gibt dem Springen einen Zweck und dem Pleite-Spieler einen Ausweg.
7. **Musik mit Abschnitten:** `PAD` um eine zweite Stimme (Melodie 32 Schritte, Dreiklang-Arpeggio)
   ergaenzen; drinnen im Laden leiser + Radio-Rauschen (`rauschen()`), an der Bank Gitarren-
   Zupfen (Wonderwall-Anklang, wenn `mitgesungen`).
8. **Rueckmeldung beim Kaufen:** Kassen-"Ping" (zwei Sinus-Toene), die Ware fliegt als Sprite
   in die HUD-Liste, Haken springt mit 1-px-Huepfer - `S.blitz` einmal kurz (0,15) ueber `FX`.
9. **Endbildschirm als Bilanz-Wertung:** statt Zeit "GEHOLFEN: 3 VON 5" (Nele, Heinz, Tobi,
   Marvin, Oezdemir zugehoert) mit Sternen - macht das Wiederspielen zielgerichtet.

### Bugs

- **Softlock (hart):** pleite + mehr als ~10-30 s Herumschauen -> Level nicht beendbar (Sweep oben).
  Kein Hinweis, kein Neustart. Betrifft laut TUNE-Kommentar genau die Spieler, die im Bus bezahlt
  und im Club Runden geschmissen haben.
- **E-Ziel-Konkurrenz:** Heinz hat Reichweite 15 (`TUNE.reichweite`), Flaschen 11 (`naechstesZiel`,
  Z. 698). Steht Heinz neben der Flasche, startet E das Heinz-Gespraech statt aufzuheben
  (im Bot gemessen: ohne Ausweichlogik blieb er an 4 Flaschen haengen). An der Ecke (x=850)
  konkurriert die Flasche bei x=836 und Marvin bei x=860 - E hebt dann eine Flasche auf statt
  "Und jetzt?".
- **Doppelte Siegmeldung:** "LEVEL 7 GESCHAFFT" als letzte Cutscene-Karte und im Endbildschirm.
- **Toter Effektcode:** `S.ruettel`, `S.blitz` nie gesetzt.

## Level 8 - Heimweg

Ablauf: Titel -> Intro (Kapitelkarte + 6 Karten) -> Konfrontation mit Marvin (9 s Bedenkzeit)
-> Endkampf in 3 Arenen **oder** Frieden -> Wettlauf gegen die Sonne (5160 px, 11 Hindernisse,
bis zu 5 Abbiegungen) -> Finale (12 Karten, 3 Wahlen, 1 Polaroid) -> Abspann (26 Karten in K1) -> Endbildschirm.

### Messwerte (`node docs/gameplay/messung/c-level8.js`, Konter-Bot, liest alles)

| Abschnitt | K1 Konter | K2 nur Blocken | K4 nichts tun | W1 Frieden + Tschuess | W2 ohne Springen |
|:--|--:|--:|--:|--:|--:|
| Intro bis Steuerung | 18,4 s | 18,4 s | 18,4 s | 18,4 s | 18,4 s |
| Konfrontation (Gespraech) | 5,2 s | 5,2 s | 5,2 s | 9,9 s | 9,9 s |
| Endkampf | **10,1 s** gewonnen | 25,5 s verloren | 9,7 s verloren | - | - |
| Wettlauf | 44,6 s, Licht 0 -> 57 | 44,6 s, 22 -> 79 | 44,6 s, 22 -> 79 | 50,9 s, 0 -> 75 | **28,9 s ERWISCHT** |
| Finale | 77,5 s | 76,6 s | 76,6 s | 77,9 s | - |
| Abspann | 68,8 s | 68,8 s | 68,8 s | 68,8 s | - |
| **Gesamt** | **225 s** | 239 s | 223 s | 226 s | 57 s |
| davon passiv (Karten, Intro, Abspann) | 154 s (**68 %**) | 154 s | 154 s | 154 s | 18 s |

**Spielzeit:** rund **3:45 min** fuer einen Erstspieler, der liest; davon sind nur **55 s**
(Kampf + Wettlauf, 24 %) Spiel mit Haenden. Wer Finale und Abspann per E-Halten ueberspringt,
ist nach ~85 s durch.

**Zeitleiste K1 (Auszug aus `--log`):** Kampf 23,6 s -> 33,8 s. Arena 1 (Strasse) dauert
**2,6 s**, Arena 2 (Hinterhof) 3,7 s, Arena 3 (Baustelle) 3,9 s - die drei Schauplaetze rauschen
in je einer Schlagfolge vorbei. Wettlauf 33,8 s -> 78,3 s: Hindernis bei 37,9 / 41,8 / 45,3 /
48,8 / 53,1 / 57,0 / 60,5 / 64,4 / 68,3 / 72,3 / 75,7 s, dazwischen die vier Abbiegefenster
(40,2 / 47,0 / 53,7 / 60,4 s). Finale 78,3 s -> 155,8 s, Abspann -> 224,7 s.

**Laengste Leere:**
- Im Wettlauf ohne jeden Impuls: **4,35 s** (zwischen zwei Hindernissen) - dicht, aber gleichfoermig.
- Ohne Entscheidung oder Herausforderung: **93 s** am Stueck (letzte Finale-Wahl "TSCHUESS" bei
  131,7 s bis Endbildschirm 224,7 s). Das ist die laengste Strecke im ganzen gemessenen Bereich C.

**Verben (K1, mit Wirkung):** laufen 4 Druecke (im Wettlauf **eine** Haltetaste fuer 44 s),
springen 11, E im Kampf 6 (3 davon Konter), antworten 4, waehlen 2. Mit Tschuess (W1): +4x E.
Blocken, Rolle, Tiefe (W/S) gibt es im Kampf, der Konter-Bot braucht sie kaum: in 30 Kaempfen
wurde **kein einziger Wurf** ausgeloest (siehe unten), also auch nie eine Rolle noetig.

**Hindernis-Takt (`c-level8-sonne.js`, Teil 4):** 11 statische Hindernisse
(`HINDERNISSE`, Z. 278), Reihenfolge Tonne-Jogger-Tonne-Jogger-...; Abstand bei Tempo 115
**3,48 / 3,91 / 4,35 s** - drei Werte, sonst nichts. Sprungfenster (`c-level8-sprung.js`):
Tonne 170 ms, Jogger 160 ms, Laster 130 ms bei Tempo 100 (200/190/148 ms mit MAX FERDI).
Jeder Sprung ist derselbe Sprung.

### Endkampf - 30 Zufallsstaende je Taktik (`c-level8-kampf.js`, `c-level8-ursachen.js`)

| Taktik | Siege | Dauer Mittel (min-max) | Phase 3 Mittel |
|:--|--:|--:|--:|
| Konter, Reaktion 0,05 s | **11/30** | 13,4 s (8,8-22,9) | 5,0 s |
| Konter, Reaktion 0,15 s | 4/30 | 12,4 s | 4,5 s |
| nur Blocken | 0/30 | 15,6 s | 0 |
| E haemmern | 1/30 | 13,5 s | 0,7 s |
| nichts tun | 0/30 | 8,8 s | 0 |
| Konter mit `mutigerKopf` (4 Leben) | 12/30 | 14,7 s | - |
| Konter ohne Crew (keiner geht dazwischen) | **3/30** | 13,6 s | - |

- **Schadensquellen beim Konter-Bot** (30 Kaempfe, 56 Treffer): "VON HINTEN" (Handlanger)
  **35 = 63 %**, "VOLL DRAUF" 15, "UMGERANNT" (Ramme, unblockbar) 6, "FLASCHE" **0**.
- **Angriffe des Anfuehrers je Phase:** Phase 1 = **genau 1** pro Kampf (30 in 30), Phase 2 ~2, Phase 3 ~2.
  Ein Konter (2 Schaden) plus ein Nachschlag beenden Phase 1 sofort.
- **Der Wurf kommt nie:** `anfuehrerTakt` (Z. 1603) wirft nur bei Abstand > `wurfAb` 58 px.
  Wer nah dran bleibt, sieht die im Kommentar versprochenen "Wuerfe in Phase 3" nie.
- **Crew-Hilfe** ("X GEHT DAZWISCHEN") alle 5,5 s automatisch: 41 Einmischungen in 30 Kaempfen,
  Siegquote faellt ohne Crew von 11/30 auf 3/30. Der Spieler tut dafuer nichts.

### Scheitern - wie oft, wie hart (`c-level8-sonne.js`)

1. **Kampf verlieren:** kein Spielende, nur `lichtStrafeBeiNiederlage` +22 Licht (Z. 1733).
   Der Endbildschirm sagt trotzdem "DURCHGESPIELT ... MIT BLAUEM AUGE".
2. **Hindernis treffen:** +9 Licht, Wackeln, "AUA/MIST/VORSICHT". Ohne Springen: 7 Treffer,
   nach 28,9 s erwischt (W2).
3. **Sonne erwischt:** Neustart des ganzen Levels. Gemessene Kette: Leertaste -> Titel ->
   Intro (E halten) -> Konfrontation -> **Kampf noch einmal** -> nach **15,3 s** laeuft man wieder.
   Der Kampfausgang wird neu ausgewuerfelt (`starteKonfrontation` setzt die Flags zurueck).

**Sweep: Licht an der Haustuer bei perfektem Lauf** (X = erwischt, Treffer = absichtlich mitgenommene Hindernisse):

| Kampf | Treffer | 0 Umwege | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|:--|:--:|--:|--:|--:|--:|--:|--:|--:|--:|
| mit MAX FERDI: gewonnen | 0 | 57 | 61 | 65 | 69 | 73 | 77 | 81 | 85 |
| | 1 | 66 | 70 | 74 | 78 | 82 | 86 | 90 | 94 |
| verloren | 0 | 79 | 83 | 87 | 91 | 95 | 99 | **X** | **X** |
| | 1 | 88 | 92 | 96 | **X** | X | X | X | X |
| ohne MAX FERDI: gewonnen | 0 | 66 | 70 | 74 | 78 | 82 | 86 | 90 | 94 |
| | 1 | 75 | 79 | 83 | 87 | 91 | 95 | 99 | **X** |
| verloren | 0 | 88 | 92 | 96 | 100 | **X** | X | X | X |
| | 1 | 97 | **X** | X | X | X | X | X | X |

Lesart: Wer den Kampf gewinnt, hat **43 Punkte Puffer** (ohne MAX FERDI 34) - der Wettlauf ist
dann ohne Druck. Wer ohne MAX FERDI verliert, einen Umweg genommen hat und **ein einziges**
Hindernis trifft, ist erwischt; ab 4 Umwegen ist der Lauf **auch fehlerfrei nicht mehr zu
schaffen** (mit MAX FERDI ab 6). Das Ergebnis des
Wettlaufs steht also meist **vor** dem Start fest: entweder geschenkt oder unmoeglich. Ein
Spielraum, in dem Koennen den Ausschlag gibt, existiert nur in einem schmalen Band.

**Weg "Sonnenaufgang"** (Flag `endeSonne` aus Level 7): Bot steht 55 s still, null Eingaben ->
Finale. `pruefeSonne` (Z. 476) macht aus der Niederlage ein Ende. Der Sonnenbalken, das rote
"DIE SONNE GEHT AUF" und die Hindernisse sind auf diesem Weg ohne Gefahr (ein Treffer bringt
das Finale nur frueher).

### Rueckmeldung je Aktion (Code)

| Aktion | Ton | Blitz/Wackeln | Hitstop | Partikel | Text |
|:--|:--|:--|:--|:--|:--|
| Sprung / Landung | 430 Hz / 160 Hz Piep | - | - | - | - |
| Hindernis sauber ueberwunden | **nichts** | - | - | - | - |
| Hindernis getroffen | `SFX.aua` | Wackeln 5 | - | - | AUA/MIST/VORSICHT |
| Gegner holt aus | **`SFX.aua`** (Z. 1574) | Blinken | - | - | - |
| Konter | `SFX.warn` (880 Hz) | Wackeln 5 | ja (1,6x 70 ms, `nacht/kampf.js`) | - | SITZT/KONTER/BAM |
| normaler Treffer am Gegner | `SFX.warn` (gleich wie Konter) | Wackeln 3 | ja | - | - |
| eigener Treffer | `SFX.aua` | Wackeln 4-6 | ja | - | VOLL DRAUF/VON HINTEN |
| Arena-Wechsel | `SFX.aua` | - | 1,6 s Standbild | - | Arena-Name |
| Tschuess rufen | 392 Hz Piep | - | - | - | Plauschzeile |

Ausholen, eigener Treffer, Hindernis und Arenawechsel klingen **gleich** (`SFX.aua`); Konter und
normaler Schlag klingen gleich (`SFX.warn`). Das Ohr kann Warnung, Erfolg und Strafe nicht trennen.

### Musik (Code + `c-musik.js`)

`BASS` (Z. 221) = 16 Schritte, **3 Tonhoehen** (110 / 98 / 87 Hz, Rechteck) plus Kick 55 Hz alle
4 Schritte im Wettlauf. Tempo 112 -> 152 BPM mit dem Licht: Schleife **2,1 s -> 1,6 s**, also
~25 Wiederholungen im Wettlauf. Gemessen laeuft **dieselbe** Basslinie in Intro, Kampf, Wettlauf,
**Finale und Abspann** (dort 87/98/110 Hz Rechteck, 4,5 Toene/s). Die emotionale Aufloesung der
ganzen Nacht hat kein eigenes Stueck, keine Melodie, keinen Akkord.

### Monotonie-Gruende (belegt)

1. **Ein Verb im Metronom.** Wettlauf = D halten + 11x Leertaste im Abstand 3,5-4,4 s, dieselbe
   Fensterbreite (160-200 ms) fuer Tonne, Jogger, Laster. Kein Ducken, kein Ausweichen in die
   Tiefe, keine Doppel-Hindernisse, keine Abkuerzung (`HINDERNISSE`, Z. 278-290).
2. **Schatten ist keine Entscheidung.** `lichtFaktorBei` (Z. 270) verlangsamt nur die Sonne
   (0,35 / 0,12), umkehren kann man sie nirgends. Stehenbleiben ist also nie richtig, man rennt
   immer durch - die schoenste Idee des Levels (Schatten-Hopping) bleibt Kulisse.
3. **Ausgang vorher entschieden** (Sweep oben): 43 Punkte Puffer oder unschaffbar.
4. **Endkampf zu kurz und zu duenn:** Mittel 13 s, Phase 1 = ein Angriff, Wurf nie, Crew haut
   automatisch dazwischen. Bei Niederlage geht es einfach weiter (+22 Licht).
5. **Finale + Abspann = 146 s Text.** 12 Finale-Karten (bis 8,1 s je Karte, `finDauer` Z. 645)
   plus 26 Abspannkarten a 2,2-3,4 s (K1); 93 s ohne jede Entscheidung.
6. **Rueckmeldung ohne Unterschied:** Erfolg im Wettlauf ist stumm; Ausholen = Treffer = Aua.
7. **Musik ohne Abschnitte:** eine 3-Ton-Bassschleife fuer alle fuenf Phasen des Levels.
8. **Belohnung nur Text:** "DURCHGESPIELT", Endentitel, "ENDEN GESEHEN x VON 10", Zeit (nur
   Wettlauf-Sekunden, `S.zeit` Z. 560). Kein Rang, keine Wertung des Sonnen-Rests, keine Sterne.

### Staerken

- **Die Sonne als Gegner** ist eine starke, sofort lesbare Idee: Himmel, Balken, Mond und Sterne
  verblassen mit dem Licht (`himmelFarbe`, Sterne Z. 852) - die Uhr ist die Welt.
- **Abbiegungen als Abschied** (Z. 497-542): "Tschuess" kostet Sonne, ist freiwillig und wird
  nur angeboten, wenn er leistbar ist (`abschiedLeistbar`). Mechanik = Thema der Nacht.
- **Konsequenzen aus der ganzen Nacht** tragen: Taxi-Tipp verlaengert das Ausholen, Marvins
  Wasser oeffnet Frieden, Max Ferdi gibt +15 % Tempo, die Crew geht dazwischen.
- **Abspann mit Nachhall** (`NACHHALL`, Z. 1334): die drei staerksten Folgen dieses Durchlaufs.
- Kampf-Engine mit echtem Hitstop und Konterfenster (`nacht/kampf.js`) - die Bausteine sind da.

### Ideen (je in `level8.html` machbar)

1. **Hindernisse als Muster statt Einzelstuecke:** Doppeltonne (2 Spruenge kurz hintereinander),
   Laster zum **Drunterducken** (S halten = rutschen, `hindernisHoehe` umgekehrt pruefen),
   entgegenkommender Jogger (vx -40), Taubenschwarm, der bei Naehe auffliegt und kurz die Sicht
   nimmt. Abstaende aus einer Liste mit 2,0 / 3,0 / 5,0 s statt 3,5-4,4 s.
2. **Schatten-Hopping echt machen:** im Schatten **stillstehen** senkt das Licht leicht
   (`faktor=-0.15` wenn `S.vx===0`), in der Unterfuehrung staerker. Dann gibt es eine Wahl:
   verschnaufen und Zeit verlieren oder durchrennen.
3. **Gummiband statt Vorentscheidung:** `S.licht` beim Start deckeln, sodass ein perfekter Lauf
   immer ~15 Punkte Reserve hat (`Math.min(S.licht, 100 - 15 - bedarf)`), und umgekehrt bei
   grossem Vorsprung die Sonne schneller laufen lassen. Spannung entsteht im Band 80-99.
4. **Wertung am Ziel:** "SONNE 57 %" -> Rang S/A/B/C, "SAUBER 11/11", "TSCHUESS 4/4",
   "BESTZEIT" - einblenden mit Hochzaehl-Ton. Gibt dem Wiederspielen ein Ziel.
5. **Kampf: Phasen nach Treffern statt HP und echte Phase 3:** Anfuehrer-HP 12, jede Phase
   mindestens 3 Angriffe; ab Phase 3 springt er zurueck und **wirft auch aus der Naehe**
   (Abstand-Bedingung weg, dafuer Ausholen 0,85 s lesbar). Handlanger kuendigen sich mit "!"
   ueber dem Kopf und eigenem Ton an (63 % des Schadens kommen heute unangekuendigt "von hinten").
6. **Eigene Klaenge:** Ausholen = steigender Zweiton, Konter = tiefer Bums + 2 Frames laenger
   Hitstop + 8 Gold-Partikel (Partikel-Code liegt fertig in `runner.html`: `puff`/`shards`),
   eigener Treffer = `SFX.aua`. Sauberer Sprung ueber ein Hindernis: leiser Aufwaerts-Piep.
7. **Musik in drei Teilen:** Wettlauf je `ZONEN`-Abschnitt eine Stimme mehr (Bass, + Arpeggio,
   + Melodie ab Licht 50); Kampf eigene Basslinie (wie `BASS_BOSS` im Runner); Finale ohne
   Bass, nur Sinus-Pad in Dur; Abspann ein 32-Schritt-Thema (Wonderwall-Anklang, wenn `mitgesungen`).
8. **Tschuess als Timing:** E genau, wenn die Figur auf Hoehe ist (Abklatschen) = kostet 0,6 s
   statt 1,5 s, zu frueh/spaet = normale Kosten. Macht aus dem Haken eine Faehigkeit.
9. **Finale begehbar machen:** die letzten 300 px selbst laufen; Marvin, Baeckerin, Ali, Moritz
   stehen am Weg, E bei jeder Figur startet ihre Karte. Abspann als Polaroid-Diashow
   (`MOMENT`-Bilder) mit Musik statt 26 Textkarten - oder Abspannkarten nur 1,6 s.
10. **Checkpoint nach dem Kampf:** nach "ERWISCHT" startet Leertaste direkt den Wettlauf mit
    dem Licht nach dem Kampf; der Kampf wird nicht neu ausgewuerfelt.

### Bugs

- **Falsche Fail-Karte:** nach "ERWISCHT" (Sonne) steht die Karte aus Level 1:
  "DER HAUSMEISTER HAT ABGESCHLOSSEN. ES IST NOCH FREITAG." (Z. 1234) - um 5 Uhr frueh auf dem
  Heimweg. `nacht/texte.js` Z. 55 haelt denselben Text als `erwischt`.
- **Unschaffbar ohne Hinweis:** ohne MAX FERDI + Kampf verloren + 1 Umweg (und 1 Treffer) bzw.
  4 Umwege (ohne Treffer) -> perfekter Lauf erwischt. Die Karte nennt die Sonne nie (siehe Karte).
- **Neustart wuerfelt den Kampf neu:** ein vorher gewonnener Kampf kann beim Neustart verloren
  werden und macht den Lauf dann unschaffbar; jeder Versuch kostet ~15 s Vorlauf.
- **Wurf-Angriff toter Inhalt** fuer Nahkaempfer (0 Wuerfe in 150 Kaempfen), obwohl Phase 3
  ihn ankuendigt.
- **Gleicher Ton fuer Warnung und Strafe:** `starteAngriff8` spielt `SFX.aua` beim Ausholen.
- **Doppelte Zeile:** "MAX FERDI SETZT SICH ALS ERSTER. DAS IST NEU." als Finale-Karte (Z. 697)
  und 47 s spaeter noch einmal im Abspann (`nacht/epilog.js` Z. 67, `wenn:()=>true`).
- **Notenstau nach Pause:** beim Fortsetzen plant `musik()` alle versaeumten Schritte in einem
  Bild nach (gemessen 31 Toene in einem Bild, alle in der Vergangenheit; nach Kapitelkarte bzw.
  Polaroid 14). `MUS.next` wird nicht auf `AC.currentTime` nachgezogen. Hoerbar hoechstens als
  Klick, aber der Takt springt; Ursache betrifft alle Level mit diesem Muster.
- **Zeit im Endbildschirm** ist nur die Wettlauf-Zeit (`S.zeit` zaehlt nur Modus `spiel`) - unter
  "DURCHGESPIELT" liest man sie als Spielzeit der Nacht.
- **Weg Sonnenaufgang** zeigt Gefahr (roter Balken, Blinktext), die es nicht gibt (Absicht laut
  Kommentar, wirkt aber wie ein Fehler).

## Karte (Zwischenbilder)

`karte.html?nach=N` kommt nach jedem der Level 1-7. Ablauf: Fahrt (2,6 s, automatisch) ->
Auswahl "WEITER: <naechstes Level>" oder "UMWEG: <Ort>" -> beim Umweg ein kurzes Gespraech ->
"ZEIT VERGEHT" -> zurueck zur Auswahl (Umweg ist dann weg) -> WEITER.

### Messwerte (`node docs/gameplay/messung/c-karte.js`)

| nach Level | Umweg | direkt | mit Umweg | Entscheidungen mit Umweg | Folge, die spaeter gelesen wird |
|:--:|:--|--:|--:|:--:|:--|
| 1 | Doenerladen (Ali) | 7,4 s | 19,5 s | 3 | `aliNummer` -> Finale L8 |
| 2 | Geldautomat | 7,2 s | 15,7 s | 3 | `klassenfahrtGeld` -> Nachhall L8 (Gewicht 9) |
| 3 | Strassenmusiker | 7,8 s | 18,4 s | 3 | `mitgesungen` -> Radio L7, Abspann L8 |
| 4 | Typ mit Kette | 7,7 s | 16,6 s | 3 | `marvinKennt`/`marvinGereizt` -> L5, L8 |
| 5 | Pizza um eins | 7,5 s | 13,3 s | 3 | Geld, Pegel, Beziehung |
| 6 | Brunnen | 7,1 s | 17,0 s | 3 | Pegel, Kondition |
| 7 | Mama anrufen | 7,2 s | 20,7 s | 4 | `mamaBescheid` -> Abspann L8 |
| **Summe** | | **52 s** | **121 s** | | |

**Spielzeit:** 7 Karten = knapp 1 min (direkt) bis 2 min (alle Umwege) ueber das ganze Spiel.

**Verben:** waehlen (W/S oder A/D), E/Leertaste/Enter. Im Umweg zusaetzlich antworten/weiterlesen.
Die Fahrt (2,6 s) ist die einzige Strecke ohne Eingabe; laengste Leere je Karte = **2,6 s**.
Die Monotonie der Karte liegt nicht in der Laenge, sondern darin, dass sie **siebenmal dasselbe
Menue** ist.

**Scheitern:** keins auf der Karte. Aber jeder Umweg hat eine **versteckte Strafe**: +4 Licht in
Level 8 (`TUNE.lichtProUmweg`), und zusammen mit einem verlorenen Kampf reichen dort 1-4 Umwege
fuer einen unschaffbaren Wettlauf (Sweep in Level 8).

### Code-Befunde (Monotonie-Gruende)

1. **Kosten unsichtbar:** `karte.html` enthaelt das Wort "SONNE" nirgends ausserhalb von
   Kommentaren (statisch geprueft). Die einzige Rueckmeldung ist "ZEIT VERGEHT" (Z. 196). Die
   Uhrzeiten der Stationen sind fest (`STATIONEN`, Z. 81) - die Zeit vergeht also nicht einmal
   sichtbar. Eine Entscheidung, deren Preis man nicht kennt, ist keine Abwaegung.
2. **Immer dasselbe Bild:** die Stadt-Bloecke werden aus `i*47 % W` usw. gezeichnet (Z. 248) -
   jede Karte sieht gleich aus, nur ein Wegstueck und der Blinkpunkt aendern sich.
3. **Stille:** kein `musik()`/`ton()`-Aufruf in `karte.html` (statisch geprueft), nur zwei Pieps.
   Zwischen zwei Leveln faellt die Musik jedes Mal auf null.
4. **Werte aendern sich stumm:** die Zeile "MUT RUF GELD WACH PEGEL" (Z. 290) zeigt nur den
   neuen Stand, kein "-4", keine Farbe, kein Ton.
5. **Nur ein Umweg je Abschnitt:** die Wahl ist immer "Umweg ja/nein", nie "dieser oder jener".
6. **Geld-Kopplung ohne Hinweis:** Doener (4), Musiker (2), Pizza (3/9) leeren den Geldbeutel vor
   dem Spaeti - und in Level 7 ist wenig Geld genau der Softlock-Ausloeser (Sweep in Level 7).

### Staerken

- Die Umwege sind **kleine, gut geschriebene Szenen mit Fernwirkung** (Tabelle oben): Marvin
  kennenlernen oeffnet in Level 8 den Frieden, die Klassenkasse kommt im Abspann mit dem
  hoechsten Gewicht zurueck, Mama anrufen aendert die Kuechen-Szene.
- Die Karte zeigt Fortschritt (Stationen mit Uhrzeit, gegangener Weg in Pink) und den Stand der
  Werte - ein guter Ort, um Atem zu holen.
- Kurz: 7 s ohne Umweg, nichts haelt auf.

### Ideen (je in `karte.html` machbar)

1. **Preis anschreiben:** "UMWEG: DOENERLADEN  +20 MIN" und oben rechts eine kleine
   Sonnen-/Himmelleiste, die mit jedem Umweg sichtbar steigt (Farben wie `SONNENFARBEN` in L8).
   Beim Bestaetigen steigt sie animiert, dazu ein tiefer Ton.
2. **Uhr laufen lassen:** angezeigte Uhrzeit = `STATIONEN[n].zeit` + 20 min je genommenem
   Umweg; "ZEIT VERGEHT" zeigt die neue Uhrzeit.
3. **Ablehnen ist gratis:** `setzeFlag('umweg_'+NACH)` nur, wenn eine Antwort mit Folge gewaehlt
   wurde (nicht bei "Nee, danke." / "Weitergehen." / "Lieber nicht."); oder die Kosten vorher nennen.
4. **Zwei Umwege zur Wahl:** je Abschnitt zwei Orte (einer kostet Geld, einer Mut), nur einer
   moeglich - aus "ja/nein" wird "was fuer ein Abend".
5. **Fahrt beleben:** waehrend der 2,6 s laeuft eine kleine Figur den Weg, und eine Zeile aus
   einem Pool erscheint (Taxi hupt, Handy vibriert, jemand ruft) - eine Information statt Leere.
6. **Werte-Aenderung zeigen:** "-4 GELD" rot, "+3 MUT" gruen steigen aus der Werte-Zeile auf
   (wie `FLOAT`/`say()` im Runner), mit kurzem Auf-/Ab-Piep.
7. **Karten-Musik:** leises Pad mit 4 Akkorden ueber `ton()`, Tonart nach Uhrzeit (abends Dur,
   ab 02:00 Moll) - die Nacht hoert sich an, als ginge sie weiter.
8. **Stationen als Erinnerung:** an jeder erledigten Station ein 3x3-Symbol fuer das, was dort
   passiert ist (Faust = Kampf gewonnen, Herz = jemandem geholfen, Kamera = Polaroid).
9. **Doppeltipp-Sperre:** Auswahl erst 0,4 s nach Ankunft annehmen (wie `finaleFrei` in L8).

### Bugs

- **Ablehnen kostet trotzdem Sonne:** `machUmweg` setzt `umweg_N` im Rueckruf fuer jedes Ende
  (Z. 190). Gemessen fuer N = 1, 3, 5, 7: "Nee, danke." / "Weitergehen." / "Lieber nicht." ->
  `umweg_N` gesetzt, Meldung "ZEIT VERGEHT".
- **Doppeltipp ueberspringt die Karte:** zwei E-Druecke in 0,1 s -> Seitenwechsel nach 0,15 s; die
  Auswahl stand 1 Bild lang da (`druckAktion` Z. 205: erster Druck beendet die Fahrt, zweiter
  waehlt WEITER). Wer vom Endbildschirm schnell durchdrueckt, sieht keinen Umweg.
- **"DIE JUNGS FEIERN DICH"** (Z. 195) auch, wenn man allein unterwegs ist (Crew leer - die Pizza
  "fuer alle" ist nur an Geld gebunden) und auch, wenn Lea dabei ist. Dieser Zweig zeigt zudem
  kein "ZEIT VERGEHT", obwohl er genauso Sonne kostet.

## Runner (Bonus, kurz)

`runner.html` ist der alte Arcade-Modus ("V0.3 PROTOTYP"): Endlos-Lauf mit Sperrstunden-Wand im
Ruecken, Gegnern mit drei Trefferzonen, 5 Etappen mit Bossen (Tuersteher 250 m, Meute 600 m,
Muedigkeit 1000 m, Sonne 1500 m), Punkten, Combos und Highscore mit Initialen.

### Messwerte (`node docs/gameplay/messung/c-runner.js`, je 6 Laeufe)

| Bot | Dauer | Meter | Punkte | KOs | Bosse | Hitstops | Partikel | laengste Leere | Ende |
|:--|--:|--:|--:|--:|--:|--:|--:|--:|:--|
| `demoBrain()` (Vorfuehrung) | 55 s | 317 | 1654 | 9,3 | 0,8 | 16 | 412 | **5,0 s** | 4x Leben, 2x Sperrstunde |
| `demoBrain()` 0,25 s traege | 72 s | 390 | 2480 | 10,5 | 0,8 | 18 | 549 | 4,8 s | 5x Leben, 1x Sperrstunde |
| ohne Schlag | 10,7 s | 70 | 69 | 0 | 0 | 3 | 92 | 3,4 s | Leben |
| nur rechts halten | 10,2 s | 70 | 70 | 0 | 0 | 3 | 78 | 3,4 s | Leben |

(Laengste Leere = Zeit ohne neues Ding im Bild bzw. ohne telegrafierten Boss-Angriff.)

**Verben:** laufen (vor/zurueck), springen, ducken, schlagen - vier Verben mit Wirkung, und jedes
ist noetig: ohne Schlag ist der Lauf nach 10 s vorbei. Gegner verlangen je nach Trefferzone
Ducken (hoch), Springen (tief) oder Zurueckweichen (voll); Konter im Ausholen = sofort KO.

**Scheitern:** drei Arten (Leben weg, Sperrstunde holt dich ein, Blackout bei Pegel 100), hart
(ein Lauf = ein Versuch), aber schnell wiederholt - Neustart mit einer Taste.

### Befunde

- **Hier steckt das Spielgefuehl, das den Story-Leveln fehlt** (gemessen pro 55 s): 16 Hitstops
  (`hitStopMs` 70, Konter x1,6), 412 Partikel (`puff`, `shards`), schwebende Sprueche (`say`),
  Combo-Zaehler, Bildschirmblitz in Farbe je Ereignis, Boss mit Vorwarnung (`bossTelegraphMs` 420)
  und Phasen, eigene Klaenge fuer Schlag, Klatsch, KO, Shot (steigt mit der Combo!), Wasser,
  Etappe, Boss. Laengste Leere 5 s.
- **Musik:** `BASS` 16 Schritte mit 5 Tonhoehen + Hi-Hat-Rauschen + Kick, eigene `BASS_BOSS`-Linie,
  ab Pegel 55 eine dritte Stimme, Tempo steigt je Etappe (+5 %) und im Boss (x1,18). Schleife
  1,8 s - kurz, aber mit Abschnitten (Boss/normal/Rausch) deutlich abwechslungsreicher als L7/L8.
- **Monotonie hier:** der Demo-Bot kommt im Mittel nur 317 m weit - also sieht ein typischer Lauf
  Etappe 1-2 und einen Boss. Die Spawn-Liste ist ab Meter 0 vollstaendig (4 Hindernisse, 5
  Gegnerarten); es wird nur dichter (`gapShrinkPer1000m`), nicht anders. Nach 1500 m (Sonne)
  gibt es keine neue Etappe und kein Ende.
- **Wiederspielreiz:** Highscore-Liste mit Initialen - das einzige Wertungssystem im ganzen Spiel.

### Ideen (je in `runner.html` machbar)

1. Etappen dichter legen (0 / 150 / 350 / 600 / 900 m), damit ein normaler Lauf drei Bosse sieht.
2. Je Etappe **ein neues** Element freischalten (Werfer erst ab Club, Brocken erst ab Afterhour,
   Regen macht den Sprung rutschig) statt alles ab Meter 0.
3. Nach der Sonne ein echtes Ende ("ZU HAUSE - 1500 M") mit Rang und Bonus, danach "NOCHMAL
   SCHNELLER" mit Tempo x1,2.
4. Tageslauf: `Math.random` mit Datum als Startwert -> alle spielen denselben Lauf, eigene Bestenliste.
5. Drei Lauf-Auftraege je Start ("3 KONTER", "KEIN SHOT", "500 M") mit Haken im Endbildschirm.
6. Titelbild entzerren (siehe Bug) und den Modus nach dem ersten Durchspielen im Startmenue als
   "BONUS: NACHTLAUF" anbieten (das waere `nacht/menue.js`, also eine zweite Datei).

### Bugs

- **Titelbild ueberlappt:** "DRUECK LEERTASTE" (Groesse 2, y=146, x=97-223 bei W=320) blinkt ueber
  der Legende "GELB SPRINGEN" (x=170, y=143) und "ROT  WEG DA" (y=152) (`drawScreens`, Z. 1318-1320,
  aus Koordinaten berechnet, nicht im Browser gesehen).
- **Nicht erreichbar:** kein Link aus Startmenue, Karte oder Leveln; nur ein Kommentar in
  `index.html` Z. 85 und der Eintrag im Service Worker. Wer die Adresse nicht kennt, findet ihn nie.
- **Kein Ende nach 1500 m** (ETAPPEN endet mit der Sonne, danach laeuft dieselbe Mischung weiter).

## Querschnitt: Was Level 7, Level 8, Karte und Runner gemeinsam haben

| | Level 7 | Level 8 | Karte | Runner |
|:--|--:|--:|--:|--:|
| Spielzeit (Erstspieler, liest) | 3:12 | 3:45 | 0:07-0:21 je Karte | ~1 min je Lauf |
| Anteil Text/Karten | 80 % | 68 % | Menue + Gespraech, kein Spiel | ~0 % |
| Verben mit Wirkung | 3 (+aufheben) | 3 im Wettlauf, 4-5 im Kampf | 2 | 4 |
| laengste Strecke ohne Entscheidung/Herausforderung | 21,7 s | **93 s** | 2,6 s | 5 s |
| Scheitern | nur Softlock | Sonne (Neustart 15 s) | keins | 3 Arten |
| Musik | 4 Toene Sinus, 6,9 s Schleife | 3 Toene Rechteck, 1,6-2,1 s, ueberall gleich | **keine** | 5 Toene + Boss-Linie + Rauschen |
| Hitstop / Partikel | nein / nein | Kampf ja / nein | nein / nein | ja / ja (412 je Lauf) |
| Wertung am Ende | Zeit | Zeit + Endentitel | - | Punkte + Highscore |

**Die drei groessten Hebel (belegt):**

1. **Rueckmeldung uebertragen:** Der Runner hat alles, was die Story-Level "lebendig" machen
   wuerde (Partikel, schwebende Texte, Combo-Toene, eigene Klaenge je Ereignis). Level 7 setzt
   nicht einmal `S.ruettel`/`S.blitz`, Level 8 belohnt einen sauberen Sprung mit Stille.
2. **Ergebnisse in Spannung verwandeln statt vorher festlegen:** Level 7 (Geld) und Level 8
   (Sonne) entscheiden ueber Werte aus frueheren Leveln, ob es "geschenkt" oder "unmoeglich" wird.
   Gummiband + sichtbare Kosten (Karte!) machen daraus eine faire, lesbare Herausforderung.
3. **Text in Handlung uebersetzen:** 80 % (L7) und 68 % (L8) der Spielzeit sind Karten. Die
   Inhalte sind stark - sie brauchen Orte zum Hingehen, kurze Mini-Aufgaben und Musik, die die
   Szene wechselt, statt einer Bassschleife unter allem.
