# Messung B: Monotonie in Level 4, 5 und 6

Stand: 2026-10-06 - fertig. Rein analysierend, keine Spieldatei geaendert.
Messskripte: `docs/gameplay/messung/b-*.js` (aus der Projektwurzel mit `node` starten).

- `b-werkzeug.js` - Messkoffer: laedt eine Seite ueber `tools/nachttest.js`, drueckt Tasten ueber die
  echten Handler, nimmt jedes Bild (1/60 s) einen Schnappschuss und leitet Ereignisse mit Zeitstempel ab
  (Moduswechsel, Meldungen, Hinweise, Gespraechsknoten, Plausch, Kapitel-/Polaroidkarten, Szenen).
- `b-level4.js`, `b-level5.js`, `b-level6.js` - Bots je Level, mehrere Spielstile und Seeds.
- `b-level5-zusatz.js` - Club-Uhr, Marvin, Ambiente, Stroboskop; Schlaegerei mit fuenf Bots; Auf-Ex bis zum
  Blackout; Tanz-Minispiel je Treffgenauigkeit.
- `b-level6-zusatz.js` - Kondition je Pegel und Schwierigkeit, Schleife bei unaufmerksamen Spielern,
  luegende Tuer, Springen.
- `b-musik.js` - liest die Musik-Schleifen aller drei Level aus dem Code aus.

## Wie gemessen wurde

**Ereignis-Typen** (fuer die Leere-Messung):

| Typ | Bedeutung | Beispiele |
|:--|:--|:--|
| H | neue Herausforderung | Angriff beginnt, Minispiel startet, Marvin stellt dich, Phase wechselt |
| E | Entscheidung | Gespraechsknoten mit mindestens zwei Antworten |
| I | neue Information | Meldung, Hinweis, Textknoten, Szene einer Cutscene, Kapitelkarte, Polaroid |
| P | Plausch | Untertitelzeile beim Gehen (reine Stimmung) |

- **Leere (H/E)** = laengste Strecke ohne neue Herausforderung *und* ohne Entscheidung. Das ist die Zahl,
  die "langweilig" am besten beschreibt: der Spieler darf nichts entscheiden und muss nichts koennen.
- **Zuschau-Anteil** = Anteil der Levelzeit (ohne Titel/Ende), in der Eingaben nichts veraendern ausser
  "weiter": Kapitelkarte, Intro, Cutscene, Warten, Text ohne Wahl, Schwarzbild.
- **Erstspieler** liest alles: Gespraeche mit Lesezeit 0,9 s + 45 ms je Zeichen, Intros und Cutscenes
  laufen aus. **Wiederholer** haelt E und ueberspringt, was geht.
- Zufall (`Math.random`) wird je Lauf neu gesaet; jede Variante laeuft mit 8 bis 20 Seeds.

---

## Level 4 - Die Schlange (Tuersteher)

### Messwerte

`node docs/gameplay/messung/b-level4.js` (Zahlen: Mittel ueber die Seeds)

| Bot | Laeufe | Siege | Kampf | Angriffe | Abstand der Angriffe | Herzen weg | Level gesamt | Zuschau-Anteil |
|:--|--:|--:|--:|--:|--:|--:|--:|--:|
| profi (Fenster +50 ms, rollt vor Ramme, setzt nach) | 8 | 6 | 12,1 s | 5,4 | 2,25 s (CV 0,16) | 1,25 | 69,8 s | 81 % |
| profi, dreht sich auch bei < 2 px um | 8 | 7 | 11,4 s | 5,0 | 2,26 s | 1,0 | 73,1 s | 84 % |
| mittel (Fenster +80 ms, sigma 110 ms) | 20 | 13 | 14,5 s | 6,4 | 2,28 s (CV 0,16) | 1,75 | 68,6 s | 77 % |
| anfaenger (drueckt beim "!" nach ~300 ms) | 10 | 0 | 10,2 s | 4,2 | 2,45 s | 3,0 | 43,0 s | 77 % |
| mittel mit Pegel 60 | 20 | 13 | 14,4 s | 6,3 | 2,32 s | 1,75 | 68,5 s | 77 % |
| mittel mit `gruppeGross` (6 Treffer) | 20 | 10 | 17,1 s | 7,4 | 2,34 s | 2,3 | 66,0 s | - |

Zeitachse eines Erstspieler-Laufs (mittel, Seed 2, gekuerzt):

```
  0.0s  Kapitelkarte (3,5 s)        15.4s  intro > schlange (keine Eingabe moeglich)
  5.7s  Intro-Szene 1 ... 4         18.4s  PLAUSCH MIA: IHR SEID DIE BUS-TYPEN.
 26.6s  WAHL Dennis (2 Antworten)   22.8s  PLAUSCH ROCKY: WUFF.
 32.8s  schlange > kampf            34.5s  ANGRIFF SCHWUNG ... 53.5s  kampf > ende
```

- **Spielzeit:** ~70 s beim Sieg (Erstspieler), davon **12 bis 15 s Kampf**. Der Rest: Kapitelkarte 3,5 s,
  Intro 11,9 s, Schlange 16,2 s, Cutscene 31,8 s.
- **Zuschau-Anteil 77 bis 84 %.** Vier Fuenftel des Levels schaut man zu.
- **Laengste Leere (H/E):** 26,6 s am Anfang (Karte, Intro, Schlange bis zur Dennis-Wahl) und 32,5 s am Ende
  (Cutscene bis Ende-Bildschirm). Im Kampf selbst kommt alle 2,25 s ein Angriff - dort gibt es keine Leere,
  sondern das Gegenteil: ein Metronom.
- **Rhythmus:** Abstand der Angriffe 2,25 s bei einer Streuung von nur 0,36 s (Variationskoeffizient 0,16).
  Der Tuersteher ist zu 29 % der Kampfzeit "frei" (geht auf dich zu, Pause), zu 29 % im Ausholen.

### Verben

Was eine Eingabe bewirken kann (Code: `keydown` Zeile 316-326, `kampf()` Zeile 480-579):

| Verb | Taste | Wirkung | Haeufigkeit im Kampf (mittel) |
|:--|:--|:--|:--|
| Kontern | E im Fenster | 1 Treffer, Betaeubung 0,9 s | 2-3 je Kampf |
| Nachsetzen | E, waehrend er betaeubt/in Erholung ist | 1 Treffer | 0-3 |
| Rollen | Leertaste | Tiefe wechseln, 0,22 s unverwundbar, einziges Mittel gegen RAMME | 1-3 |
| Blocken | Shift halten | 35 % Schaden kommen durch, kostet Ausdauer - lohnt praktisch nie | 0 |
| Laufen / Tiefe | A D / W S | rangehen; der Boss kommt ohnehin selbst | wenige |
| Antwort | links/rechts + E | einmal Dennis vor dem Kampf (wirkungslos fuer den Kampf) | 1 |

- **E-Druecke je Kampfsekunde: 0,4 bis 0,6.** Ein Druck alle zwei Sekunden - die Kernhandlung ist
  "warten, bis der Balken golden wird, E".
- Effektiv **ein** Verb (E im Fenster) plus eine Ausnahme (Rolle bei RAMME). Blocken ist ein totes Verb:
  `KAMPF.blockSchadenAnteil 0.35` + `ausdauerBlockKosten 22` machen es schlechter als einfach zu kontern.
- Alle drei Angriffe haben **dasselbe Fenster-Prinzip** (letztes Drittel des Balkens, `fensterAnteil 0.34`).
  JAB und RAMME haben wegen `fensterMinSek 0.28` sogar exakt dieselbe Fensterlaenge (0,280 s).

### Scheitern

- **Moeglichkeiten:** drei Herzen (`TUNE.leben 3`, +1 auf LOCKER). Schaden durch: zu frueh druecken
  (`fehlschlag()`: 0,6 s Sperre, danach trifft der Schlag), zu spaet druecken, RAMME nicht ausweichen.
- **Wie hart:** Profi-Bot gewinnt 6 von 8, mittel 13 von 20, Anfaenger 0 von 10. Der Anfaenger drueckt
  beim Erscheinen des "!" - beim SCHWUNG (Fenster beginnt erst bei 0,83 s) ist das immer `DANEBEN`.
- **Kosten eines Fehlschlags:** nach "VERPASST" geht es ueber den **Titel** zurueck: E, E, Intro, Schlange,
  **Dennis-Gespraech noch einmal**, dann erst Kampf. Gemessen: **30,8 s** bis zum naechsten Kampf
  (Erstspieler-Tempo), **19,4 s** auch wenn man E haelt - die Schlange (`schlange()` Zeile 358-368,
  `WARTE_MIN 9`/`WARTE_MAX 16`) laesst sich nicht ueberspringen (`druckAktion`: `if(S.modus==='schlange') return;`).
  Bei 12 bis 15 s Kampf heisst das: **pro Versuch mehr Warten als Kaempfen.**
- Der Pegel aus Level 2/3 soll das Kontern erschweren (`pegelFensterStrafeMax 0.4`). Gemessen: das Fenster
  von SCHWUNG schrumpft bei Pegel 60 von 0,425 auf 0,323 s, JAB und RAMME bleiben wegen der Untergrenze bei
  0,280 s. Bot-Ergebnis mit Pegel 60: **identisch** (13 von 20). Die Entscheidung "wie viel trinke ich vorher"
  hat hier praktisch keine Folge.

### Rueckmeldung je Aktion (Code)

| Aktion | Ton | Blitz | Wackeln | Hitstop | Partikel | Text |
|:--|:--|:--|:--|:--|:--|:--|
| Konter | `SFX.klatsch` | 0,5 | 5 | 0,11 s (`kampfStop`) | keine | zufaellig SITZT / KONTER / GEHT AUFS AUGE |
| Nachsetzen | `klatsch` | - | 3 | 0,07 s | keine | NACHGESETZT |
| getroffen | `SFX.aua` | 0,5 | 6 | 0,07 s | keine | VOLL ERWISCHT / AUTSCH / UMGERANNT |
| daneben | `SFX.fehl` (leise) | - | 2 | - | keine | DANEBEN + "DANEBEN - WARTEN" |
| Rolle | **kein Ton** | - | - | - | keine | - |
| Angriff beginnt | `SFX.warn` (immer derselbe Piep 880 Hz) | - | - | - | - | blinkendes "!" |

Hitstop gibt es also (`nacht/kampf.js` `KAMPF.hitStop 0.07`) - aber keine Partikel, keine Trefferzahl,
keine Kombo, kein Sound-Unterschied zwischen den drei Angriffen (alle `SFX.warn`).

**Musik:** 16 Schritte, 118 BPM in Sechzehnteln = **Schleife von 2,03 s**, zwei Stimmen (Rechteck-Bass mit
5 Toenen, Sinus-Kick auf jedem Viertel), wird je Treffer um 5 % schneller. In 70 s Level laeuft dieselbe
2-Sekunden-Figur rund 35-mal. Keine Melodie, keine Akkorde, kein Wechsel zwischen Warten und Kampf.

**Belohnung am Ende:** Text "LEVEL 4 GESCHAFFT", Zeit, Bestzeit, Pegel, Crew. Keine Wertung, kein Rang.
Polaroid 4 nur, wenn kein Herz verloren ging (`starteCutscene` Zeile 607) - das ist der einzige Anreiz,
besser zu spielen, und er wird nirgends angekuendigt.

**Wiederspielreiz:** gering. Die Bestzeit misst nicht den Kampf: `S.zeit` laeuft in Intro, Schlange und
Cutscene mit (`update()` Zeile 638: `if(S.modus!=='titel') S.zeit+=dt`). Beim Profi-Lauf sind 12 von 70 s
Kampf - die Bestzeit belohnt vor allem das Wegdruecken der Cutscene.

### Monotonie-Gruende (belegt)

1. **Vier Fuenftel Zuschauen** (77 bis 84 %). Der eigentliche Boss-Kampf dauert 12-15 s.
2. **Ein Verb, ein Takt:** E im goldenen Drittel, alle 2,25 s (CV 0,16). Drei Angriffsnamen, aber ein
   Fenster-Prinzip (`fensterAnteil 0.34` fuer alle), JAB und RAMME gleich lang (`fensterMinSek 0.28`).
3. **Die Schlange ist unbedienbar** (16 s, `schlange()`): weder laufen noch reden noch ueberspringen -
   und sie kommt bei jedem neuen Versuch wieder, samt Dennis-Gespraech.
4. **Phasen wirken kaum:** Phase 2/3 verkuerzen Ausholen um 12 %/Phase und Pause um 0,22 s - der Abstand
   der Angriffe bleibt bei 2,2-2,3 s. Neu ist nur die RAMME ab Phase 2.
5. **Die Musik ist eine 2-Sekunden-Schleife** ohne Abschnitte.
6. **Keine Belohnung fuers Gut-Spielen** ausser einem unangekuendigten Polaroid.

### Staerken

- Der Ausholbalken (`zeichneAusholbalken`, `nacht/hud.js`) ist klar lesbar: jeder sieht, wann.
- Unterschiedliche Silhouetten fuer SCHWUNG und JAB (`SPR.bossWind` / `bossWindJab`).
- Hitstop, Wackeln, Blitz und Vibration sind da und laufen sauber ueber `FX`.
- Die Ramme zwingt einmal pro Kampf zu einer anderen Antwort (Rolle).
- Die Kappe-Karte und der Onkel-Satz greifen Entscheidungen aus Level 2/3 auf.

### Ideen (je eine Datei: `level4.html`, ausser anders genannt)

1. **Schlange spielbar machen statt warten:** 15 s "Schlange vorruecken" mit 2-3 kleinen Ereignissen
   (Vordraengler anpampen oder durchlassen, Dennis' Frage, ein Flyer aufheben). Oder mindestens: E
   ueberspringt die Wartezeit, und bei Wiederholung startet `starte()` direkt mit `starteKampf()`.
2. **Neustart direkt in den Kampf:** `druckAktion` im Ende-Zweig ruft `starteKampf()` statt `neuesSpiel()`
   (Herzen und Boss neu, kein Titel, kein Intro, kein Dennis). Spart 19-31 s je Versuch.
3. **Finten und verzoegerte Schlaege:** ein vierter Angriff "FINTE" (Ausholen bricht bei 70 % ab, wer drueckt,
   kassiert DANEBEN) und ein "verzoegerter Haken" (Balken stockt kurz). Nur neue Eintraege in `naechsteArt`
   und `starteAngriff`; bricht den Metronom-Takt.
4. **Kombo-Ketten in Phase 3:** zwei bis drei Angriffe direkt hintereinander (JAB-JAB-SCHWUNG) mit je eigenem
   Fenster - Rhythmus statt Einzelschlag. `bossTakt`: Warteschlange `b.kette`.
5. **Perfekt-Konter:** die ersten 80 ms des Fensters zaehlen als PERFEKT (2 Schaden, eigener Ton, laengerer
   Hitstop, Text gross). Gibt dem Timing eine zweite Stufe und dem Profi etwas zu jagen.
6. **Wertung am Ende:** Rang aus Herzen, Perfekt-Kontern und **reiner Kampfzeit** (statt `S.zeit`), z. B.
   S/A/B/C. Polaroid 4 vorher ankuendigen ("OHNE KRATZER: FOTO").
7. **Crew greift ein:** Jonas (Flag `jonasDabei`) ruft beim zweiten Treffer "LINKS!" und markiert einmal das
   Fenster; Moritz lenkt den Tuersteher ab (eine Pause +1 s). Macht Level-2-Entscheidungen spuerbar.
8. **Musik mit Phasen:** in `musik()` je Phase eine zweite Stimme dazu (Phase 2 Gegenmelodie, Phase 3 Hi-Hat,
   doppeltes Tempo), Stille im Moment des Konters.
9. **Partikel beim Treffer:** Schweisstropfen/Sterne als einfache Pixel-Liste in `S.funken` (8-12 Pixel,
   0,4 s Lebensdauer, Schwerkraft) - an Konter, Nachsetzen, Treffer und Rolle (Staub).
10. **Ramme-Ueberlappung beheben** (siehe Bugs) - sonst lernt der Spieler "nach der Ramme verliere ich immer".

### Bugs (Level 4)

1. **Nach dem Rammstoss steht der Tuersteher im Spieler, der naechste Konter scheitert.** Gemessen ueber 30
   Seeds: in **60 von 60** Faellen beginnt der Angriff direkt nach einer RAMME bei |dx| < 3 px, und die
   Blickrichtung des Spielers zeigt vom Boss weg. `konterVersuch` -> `trifftRaeumlich` verlangt
   `vor = (z.x-a.x)*a.blick >= 0` (`nacht/kampf.js` Zeile 200-205), der Boss trifft aber trotzdem, weil er
   seine Blickrichtung jedes Bild neu setzt (`bossTakt` Zeile 439). Umdrehen hilft kaum: ein Schritt sind
   1,2 px, man springt ueber ihn hinweg (der Bot "dreht" dabei 160-mal). Folge: der Profi-Bot verliert
   1,25 Herzen je Kampf fast nur an dieser Stelle. Abhilfe: Boss nach der Ramme 20 px zuruecksetzen lassen
   oder in `trifftRaeumlich` `vor >= -4` erlauben.
2. **Mut- und Zuneigungs-Farming:** das Dennis-Gespraech laeuft bei jedem Versuch neu und wirkt jedes Mal.
   Gemessen: Mut 30 -> 33 -> 36 -> 39, DENNIS 0 -> 4 -> 8 -> 12 nach drei Versuchen
   (`DENNIS_SCHLANGE.start.wahl[0].tu`).
3. **Sieg-Bildschirm zeigt "E FUER NEUSTART"** unter "E WEITER ZU LEVEL 5" (`bildschirme()` Zeile 924 steht
   ausserhalb des `else`); E fuehrt aber zur Karte.
4. **Verloren-Bildschirm rechnet mit dem falschen Ziel:** `'TREFFER GESCHAFFT: '+S.treffer+'/'+TUNE.bossTreffer`
   (Zeile 922) - mit `gruppeGross` braucht man 6, mit `gruppeKlein` 4 (`trefferZiel()`). Ausserdem zaehlt
   `S.treffer` Konter und Nachsetzen, aber nicht den tatsaechlichen Schaden.
5. **Bestzeit misst Wartezeit** (`S.zeit` laeuft in Intro, Schlange und Cutscene), siehe oben.
6. Die Rolle hat **keinen Ton** und kein eigenes Bild ausser der Graufaerbung - die wichtigste Ausweichaktion
   fuehlt sich nach nichts an.

---

## Level 5 - Der Club

### Messwerte

`node docs/gameplay/messung/b-level5.js` (Spielstile, 6 Seeds je Stil, Erstspieler liest alles) und
`node docs/gameplay/messung/b-level5-zusatz.js` (Uhr, Marvin, Ambiente, Schlaegerei, Auf-Ex, Tanz).

| Stil | Level gesamt | davon freies Laufen (Club-Uhr) | Entscheidungen | Textknoten | Zuschau-Anteil | Leere H/E | ohne Herausforderung | Erfolge |
|:--|--:|--:|--:|--:|--:|--:|--:|--:|
| zielstrebig (Mia, Sophie, Kira, raus) | 178 s | 12,0 s | 15 | 13 | 54 % | 24,6 s | 159 s | 3 |
| erkunder (alles anfassen) | 186 s | 12,8 s | 15 | 15 | 55 % | 26,7 s | 114 s | 3 |
| tanz (waehlt immer Tanzen) | 197 s | 14,9 s | 16 | 13 | 53 % | 23,6 s | 95 s | 2,8 |
| zufall (zufaellige Antworten) | 130 s | 15,7 s | 13 | 7 | 39 % | 26,6 s | 72 s | 0,5 |
| minimal (ein Auf-Ex, dann raus) | 41 s | 14,5 s | 0 | 0 | 65 % | 18,8 s | 19 s | 0 |
| troedler (30 s am Eingang) | 218 s | 40,2 s | 16 | 17 | 47 % | 22,6 s | 129 s | 3 |
| nichtstun | 642 s | 600 s | 1 | 4 | 6 % | 594 s | 600 s | 0 |

Zeitachse zielstrebig (Seed 1, gekuerzt):

```
  0.0s  Intro (12,9 s)                  62.4s  "DER ABEND IST EIN ANDERER"
 12.9s  Kapitelkarte (3,5 s)            65.3s  WAHL Sophie ... 8 Knoten, davon 4 nur Text
 18.8s  ANGERANNT (einzige Herausforderung im ganzen Lauf)
 20.4s  WAHL Mia (2) ... 4 Wahlen       105.9s WAHL Kira ... 6 Wahlen
 49.1s  ECKE Mia: 6 Zeilen Text, 13,3 s 137.4s ECKE Kira: 6 Zeilen Text, 13,3 s
157.8s  Ausgang > Cutscene + Semih     178.0s  Ende
```

- **Spielzeit:** rund 3 Minuten (178-197 s) fuer jeden, der redet; 41 s fuer den, der nur trinkt und geht.
- **Der Club ist ein Dialogspiel mit 12 Sekunden Laufen.** Von 178 s sind 12 s freies Spiel (7 %), der Rest
  Gespraeche, Ecke, Intro, Karte, Cutscene. Zuschau-Anteil 54 % (Text ohne Wahl 34 s, Ecke 27 s, Cutscene 18 s,
  Intro 13 s, Kapitelkarte 3,5 s).
- **Entscheidungen gibt es reichlich:** 15 Wahlen in 178 s, im Schnitt eine alle 12 s, viele mit Bedenkzeit
  (`zeit:7` bis `zeit:9`). Das ist die Staerke des Levels - und gleichzeitig das Einzige, was passiert.
- **Herausforderungen fast null:** nach dem einen Anrempeln (bei 18,8 s) kommt **159 s lang keine einzige
  Herausforderung** mehr - kein Marvin, kein Minispiel, kein Kampf (zielstrebig, alle 6 Seeds).
- **Leere H/E:** 24,6 s - Mias letzte Wahl, dann 13,3 s Ecke-Text, dann Laufen zu Sophie.

### Die drei Systeme, die den Club spannend machen sollten, greifen nicht

Gemessen mit `b-level5-zusatz.js` (Teil A, 6 Seeds je Stil):

| Stil | Club-Uhr am Ende | Anteil der 600 s | Uhrzeit am Ende | Marvin gesehen | Ambiente-Meldungen | Anrempeln |
|:--|--:|--:|--:|--:|--:|--:|
| zielstrebig | 12,0 s | 2,0 % | 22:33 | 0 von 6 | 0 | 1 |
| erkunder | 12,8 s | 2,1 % | 22:33 | 0 von 6 | 0 | 1 |
| tanz | 14,9 s | 2,5 % | 22:33 | 0 von 6 | 0 | 1,2 |
| zufall | 15,7 s | 2,6 % | 22:33 | 0 von 6 | 0 | 1,7 |
| troedler | 40,2 s | 6,7 % | 22:40 | 6 von 6 | 1 | 1 |

1. **Die Uhr ("UM EINS GEHT DAS LICHT AN") ist Kulisse.** Sie laeuft nur im freien Spiel
   (`update()`: `S.zeit+=dt` steht hinter den `return` fuer Gespraech, Ecke und Cutscene) und braucht 600 s reines
   Laufen (`TUNE.levelSekunden 600`). Gebraucht werden 12-16 s. Die Uhr zeigt am Ende **22:33** - der Druck, den
   das Intro verspricht, existiert nicht.
2. **Rivale Marvin taucht fuer zielstrebige Spieler nie auf.** `marvinTakt()` wartet auf `S.zeit >= 25`
   (`TUNE.marvinKommtNach`), also 25 s reines Laufen - mehr, als ein ganzer Clubbesuch braucht.
   **0 von 24 Laeufen** in den vier normalen Stilen sehen ihn. Nur wer 30 s am Eingang hin- und herlaeuft (troedler)
   oder ihn auf der Karte gereizt hat (`marvinGereizt`, Faktor 0,4 = 10 s), trifft ihn. Selbst dann nimmt er
   niemandem eine Frau weg (`marvinNimmt 9 s` ungestoert - auch diese Uhr steht in Gespraechen).
   Folgen ueber das Level hinaus: siehe Bugs (Flag `marvinKennt`).
3. **Das Club-Ambiente schweigt.** `ambientTakt()` haengt am selben freien Spiel (`ambientAb 20`): **0 Meldungen**
   fuer alle normalen Stile. Der Kommentar in TUNE (16) - "unabhaengig davon, was der Spieler tut" - stimmt nicht.
4. **Das Stroboskop ist ein Zufallsschubser, keine Aufgabe.** Die Tanzflaeche ist 450 px breit, Durchqueren
   dauert 4,5 s, der sichere Teil eines Stroboskop-Zyklus 4,3 s (`strobeZyklus 5`, Gefahr ab `dunkel 0,45`
   = 0,68 s je Zyklus). Wer durchgeht, rempelt also fast sicher einmal an (1 bis 1,7 mal je Lauf, in jedem Lauf).
   Tiefe hilft nicht, obwohl der Kommentar "man kann auch hinter der Menge vorbei" sagt: der Club ist flach
   (`TIEFE_PRO_SEITE['level5.html']='kampf'`, `tiefeNah()` ist dann immer wahr). Die einzige Gegenwehr -
   in einer Luecke stehen bleiben, wenn es dunkel wird - erklaert das Spiel nirgends.

### Verben

Code: `keydown` Zeile 812-822, `druckAktion()` Zeile 796, `update()` Zeile 1355-1378, `kloppe()` Zeile 1207.

| Verb | Taste | Wirkung | Haeufigkeit (zielstrebig, Seed 1) |
|:--|:--|:--|:--|
| Laufen | A / D | einzige Bewegung, 12 s je Lauf | 4 Strecken |
| Tiefe | W / S | **im Club ohne jede Wirkung** (Tiefe aus, `bodenY` flach) - nur in der Schlaegerei | 0 |
| Ansprechen / Benutzen | E am Ziel | Gespraech, Auf-Ex, Wasser, Garderobe, Foto, Raucher-Satz, Ausgang | 4 |
| Antwort waehlen | W/S + E | das Herz des Levels, mit Bedenkzeit | 16 |
| Weiter | E | Textknoten ohne Wahl | 12 |
| Ecke weiter | E | 6 Zeilen Erzaehltext je Ecke | 12 |
| Minispiel treffen | E im Fenster | Auf-Ex (1 Treffer), Tanzen (3 Treffer) | 0 (nur erkunder/tanz) |
| Schlagen/Kontern, Blocken, Rollen | E / Shift / Leertaste | nur in der Schlaegerei | 0 (nur stellen) |

- **E-Druecke gesamt 44, davon 24 reines "weiter"** (55 %). Im freien Spiel 0,4 bis 1,3 wirksame Eingaben je
  Sekunde - aber das freie Spiel dauert eben nur 12 s.
- Drei Minispiele, alle dasselbe Prinzip "Marker im Fenster" (`markerPos()`, `pruefeMinigame()`):
  Auf-Ex 0,2 s, Tanzen im Mittel **0,8 bis 1,3 s** fuer drei Treffer (Teil D: Tempo 170 px/s auf 90 px Leiste,
  der Marker erreicht die Mitte nach 0,1-0,5 s). Der Hinweis sagt **"IM TAKT"** (Zeile 914), der Marker hat aber
  nichts mit dem Beat zu tun (Periode 1,06 s gegen 0,44 s je Schlag bei 136 BPM).
  Erfolgsquote Tanzen: profi 20/20, Streuung 70 ms 16/20, 120 ms 6/20, 180 ms 6/20.

### Scheitern

| Fehlschlag | Moeglich? | Folge | Messung |
|:--|:--|:--|:--|
| Blackout (Pegel 100) | ja | **VERPASST**, zurueck auf den Titel, alles weg | ab Pegel 0: 5 Auf-Ex in 1,5 s; ab Pegel 60: **2 Auf-Ex** |
| Abfuhr (`@nein`) | ja | Ruf -6, 7 s GEKNICKT, die Person ist weg, die naechste hat "davon gehoert" | zufall-Bot: 0,5 Erfolge statt 3 |
| Marvin nimmt eine Frau | praktisch nein | Person weg | 0 Faelle ausser nichtstun |
| Schlaegerei verloren | ja, folgenlos | Rausschmiss-Cutscene, Flag `clubKloppeVerloren` | siehe unten |
| Licht geht an (01:00) | nein | Cutscene, kein Verlieren | erst nach 600 s Laufen |

- **Der einzige harte Fehlschlag kommt ohne Vorwarnung.** Beim Auf-Ex gibt es ausser "AUF EX" keine Meldung
  (Teil C: einzige gesehene Meldung "AUF EX"), dann schwarz, VERPASST. Wer mit Pegel 60 aus Level 4 kommt,
  ist nach zwei Shots raus und muss das ganze Level samt Intro und allen Gespraechen neu spielen.
- **Die kleine Schlaegerei** (Teil B, 20 Seeds je Bot, direkt gestartet):

| Bot | Siege | Dauer | Herzen weg (von 5) | Gegner-Angriffe |
|:--|--:|--:|--:|--:|
| profi | 20/20 | 4,4 s | 0,8 | 3,8 |
| mittel (Streuung 80 ms) | 19/20 | 4,8 s | 1,6 | 4,9 |
| anfaenger (drueckt ~0,3 s nach dem Ausholen) | 19/20 | 5,7 s | 2,3 | 5,8 |
| **haemmern (E alle 0,15 s)** | **18/20** | 4,1 s | 1,6 | 4,7 |
| nichtstun | 0/20 | 5,6 s | alle 5 | 8,2 |

  Der Kampf dauert **4-6 Sekunden**, und Knopf-Haemmern gewinnt 18 von 20 Mal. Grund: ein Konter macht 3 Schaden
  (`KAMPF.konterSchaden`), Marvin hat 5 (`TUNE.marvinHp`), der Flitzer 1 - drei Konter beenden alles.
  Wer gar nichts tut, ist nach 5,6 s raus - auch das Verlieren geht schnell.

### Rueckmeldung je Aktion (Code)

| Aktion | Ton | Blitz | Wackeln | Hitstop | Partikel | Text |
|:--|:--|:--|:--|:--|:--|:--|
| Ansprechen | Gespraechston (dialog.js) | - | - | - | - | Gespraech |
| Nummer bekommen | `SFX.erledigt` | - | - | - | keine | NUMMER VON ... + CONFIDENCE 9 s |
| Ecke vorbei | `SFX.sieg` | - | - | - | keine | DER ABEND IST EIN ANDERER |
| Abfuhr | `SFX.aua` | - | - | - | keine | AUA. ABFUHR + GEKNICKT 7 s |
| Minispiel-Treffer | `SFX.hit` | 0,2 | - | - | keine | GUT / WEITER SO / PASST |
| Minispiel daneben | `SFX.miss` | - | - | - | keine | DANEBEN / NOCHMAL |
| Auf-Ex | `SFX.schluck` | - | Bildwackeln ab Pegel 55 | - | keine | AUF EX |
| Anrempeln | `SFX.stolper` | - | 4 | - | keine | ANGERANNT, Spieler rot |
| Konter (Kampf) | `SFX.hit` | - | - | 0,11 s | keine | - |
| getroffen (Kampf) | `SFX.aua` | 0,3 | 7 | 0,07 s | keine | - |

**Musik** (`musik()` Zeile 273, `BASS` Zeile 271): 16 Schritte bei 136 BPM in Sechzehnteln = **Schleife von 1,76 s**,
drei Stimmen (Rechteck-Bass mit 5 Toenen, Sinus-Kick auf jedem Viertel, Rauschen auf den ungeraden Sechzehnteln),
lauter mit dem Pegel. In 178 s laeuft dieselbe Figur rund 100-mal - durch Gespraeche, Ecke, Minispiel und Kampf
unveraendert. Die Ambiente-Zeile "DER DJ WECHSELT DEN TRACK" (wenn sie ueberhaupt kommt) aendert nichts an der Musik.

**Belohnung am Ende:** "LEVEL 5 GESCHAFFT", Zeit, Bestzeit, Erfolge, Ruf, Pegel, Crew. Kein Rang. Die **Bestzeit
misst nur die Laufzeit** (`S.zeit`, 12-15 s) - Reden kostet nichts, Bestzeit heisst "1300 px schnell gehen".
Semih kommt nur mit, wenn etwas geklappt hat (`semihKommt()`), das ist eine echte, aber leise Belohnung.

**Wiederspielreiz:** inhaltlich hoch - drei Personen mit eigenen Baeumen, Pegel- und Mut-Bedingungen, Ecke,
Nummer, Abfuhr, Folgen in Level 6 bis Epilog. Spielerisch gering: die zweite Runde ist dieselbe Textstrecke.

### Monotonie-Gruende (belegt)

1. **Laufen, lesen, waehlen - sonst nichts.** 7 % freies Spiel, 54 % Zuschauen, 159 s am Stueck ohne Herausforderung.
2. **Alle Druckmittel haengen an einer Uhr, die nicht laeuft** (`S.zeit`, nur im freien Spiel): Uhr 2 % verbraucht,
   Marvin 0 von 24, Ambiente 0. Der Club wirkt leer und statisch, obwohl die Systeme gebaut sind.
3. **Die Ecke ist ein Textbildschirm** (`zeichneEcke()`): 6 Zeilen, je bis zu 3,4 s, schwarz, keine Wahl -
   13-20 s pro Erfolg, also genau im Moment der Belohnung Stillstand.
4. **Minispiele sind eine Sekunde lang** und alle gleich (Marker im Fenster) - Auf-Ex 0,2 s, Tanzen ~1 s.
5. **Der Kampf ist in 4-6 s vorbei und haemmerbar** (18/20 Siege).
6. **Eine 1,8-Sekunden-Musikschleife** fuer drei Minuten Club.
7. **W/S tun im Club nichts**, obwohl TUNE (11) Bar an der Rueckwand und `redeTiefe` beschreibt.

### Staerken

- Die Gespraeche: drei klar verschiedene Figuren, Bedenkzeit, Bedingungen nach Pegel/Mut/Geld/Crew, Abfuhr mit
  Ruf-Folge ("hat schon davon gehoert") - der zufall-Bot schafft 0,5 statt 3 Erfolge, Antworten zaehlen also.
- Pegel als Zwickmuehle: Mut-Bonus ab 35 und Sophie-Shots gegen Kira (nur bis Pegel 54) und Blackout; Wasser als
  Gegenmittel.
- Konsequenzen ueber das Level hinaus (Sie-Echo in Level 6, Semih in der Crew, Epilog).
- Stroboskop ist sauber flackerarm umgesetzt (lange Verdunklung statt Blitzen, alles ueber `FX`).

### Ideen (je eine Datei: `level5.html`)

1. **Club-Uhr an die echte Zeit haengen:** `S.zeit` auch in Gespraechen laufen lassen (z. B. halbes Tempo) und
   `levelSekunden` auf 240 setzen. Dann ist 01:00 erreichbar, die Uhr wird Druck, Marvin und Ambiente kommen bei
   jedem. Mindestens: `marvinKommtNach` an `S.t` statt `S.zeit` koppeln oder Marvin nach dem ersten Gespraech schicken.
2. **Marvin als sichtbarer Wettlauf:** nach jedem Gespraech geht Marvin auf die naechste offene Person zu
   (Pfeil am Rand, Balken "MARVIN BEI SOPHIE 6/9"). Wer zuerst da ist, redet. Gewinnt er, muss man sie loseisen
   (kurzes Rede-Duell). Macht aus "durch den Club gehen" eine Route-Entscheidung.
3. **Tanzen als echtes Rhythmus-Minispiel:** Marker an `MUS.step` koppeln (136 BPM), 8 Schlaege
   Ruf-und-Antwort-Muster (die Person tanzt vor, du drueckst nach), PERFEKT/GUT/DANEBEN mit eigenen Toenen. Das
   "IM TAKT" stimmt dann, und Tanzen wird der Kern statt einer Sekunde.
4. **Stroboskop als Rotlicht-Gruenlicht lesbar machen:** ein Takt Ankuendigung (Bass faellt weg, Lichtkegel
   zieht zu), Luecken zwischen Tanzenden kurz markieren, "STEHEN = SICHER". Dazu Tanzende, die sich langsam
   bewegen - dann ist das Durchqueren eine kleine Aufgabe statt Zufall.
5. **Warnung vor dem Blackout und kein Neustart vom Titel:** ab Pegel 70 eine Zeile ("NOCH EINER UND DU KIPPST"),
   Blackout als Filmriss: Aufwachen an den Klos, eine offene Person ist weg, Ruf -10 - weiter im Level.
6. **Ecke mit einer Wahl** (z. B. Zeile 3: kuessen / reden / Handy zeigen) und auf 3-4 Zeilen kuerzen; jede Ecke
   setzt ein Flag, das spaeter zitiert wird.
7. **Schlaegerei haerter und eigen:** Marvin mit 9 HP und einer Finte (Ausholen bricht ab), Flitzer erst nach
   Marvins erstem Treffer; Konter im Club nur 2 Schaden. Ziel: 15-20 s Kampf, Haemmern verliert.
8. **Musik mit Abschnitten:** zweite und dritte Bassfolge (Strophe, Drop), Wechsel bei "DER DJ WECHSELT DEN TRACK",
   gedaempfte Version (nur Kick) in Gespraechen, Drop beim Stroboskop.
9. **Nacht-Wertung statt Laufzeit-Bestzeit:** Rang aus Erfolgen, Abfuhren, Ruf, Pegel-Kurve, Marvin-Ausgang
   ("CLUB-LEGENDE", "WANDBLUME" ...), dazu "beste Nacht" statt Bestzeit speichern.
10. **Barkeeper-Auftrag als Nebenziel:** Semih/Barkeeper will drei Dinge (Garderobenmarke, Feuerzeug von den
    Rauchern, Nummer vom DJ) - fuellt die 12 s Laufen mit einer kleinen Sammelroute und nutzt Orte, die heute nur
    einen Satz haben (Raucher, Lieferant, Garderobe).

### Bugs (Level 5)

1. **Marvin und damit sein ganzer Handlungsstrang fehlt fuer zielstrebige Spieler** (0 von 24 Laeufen,
   `marvinTakt()` Zeile 1099 an `S.zeit`). Das Flag `marvinKennt` wird dann nur ueber den Karten-Umweg gesetzt
   (`karte.html` Zeile 133). Folgen gelesen: Level 6 zeigt statt Marvin "EIN SCHATTEN" ohne Wahl
   (`marvinEcho()`), Level 7 laesst ihn weg (`nachtmenschDa`), Level 8 heisst er "DER ANFUEHRER", die Epilog-Folie
   fehlt. Die Level-6-Wahl "Ja. Und?" (`angstZugegeben`, im Finale `level8.html` Zeile 1274 abgefragt) ist so
   unerreichbar. Ausserdem: wer auf der Karte "Wer bist du?" waehlt, hoert "Wir sehen uns drinnen" - und sieht
   ihn drinnen nicht.
2. **Ambiente gegen die eigene Absicht stumm** (`ambientTakt()` haengt am freien Spiel, TUNE-Kommentar Zeile 171).
3. **Sieg-Bildschirm zeigt "LEERTASTE FUER NEUSTART"** (Zeile 1865 steht ausserhalb des `else`), die Leertaste
   ist in diesem Level aber E und fuehrt zur Karte.
4. **Blackout-Text immer "AUF DER TANZFLAECHE"** (Zeile 873), auch wenn man an der Bar umkippt.
5. **Tiefe-Stellschrauben ohne Wirkung:** `barTiefe`, `redeTiefe`, `tiefeHinten/Vorne` (TUNE 11) und W/S im freien
   Spiel - der Club ist flach (`TIEFE_PRO_SEITE`). Der Anrempel-Kommentar ("hinter der Menge vorbei") ist falsch.
6. **Schlaegerei haemmerbar** (18/20 Siege mit E alle 0,15 s) entgegen dem Ausdauer-Kommentar in `nacht/kampf.js`.
7. Toter Code in `beendeMinigame()`: Zeile 953 nach `return;`.
8. Bestzeit misst Laufzeit (`levelGeschafft()`), nicht Spiel.

---

## Level 6 - Afterhour (Traum-Schule)

### Messwerte

`node docs/gameplay/messung/b-level6.js` (Spielstile) und `node docs/gameplay/messung/b-level6-zusatz.js`
(Kondition je Pegel und Schwierigkeit, Schleife, luegende Tuer, Springen).

| Stil | Laeufe | Level gesamt | davon Laufen (Spieluhr) | Entscheidungen | Textknoten | Zuschau-Anteil | Leere H/E | ohne Herausforderung |
|:--|--:|--:|--:|--:|--:|--:|--:|--:|
| direkt (Spind, Labortisch, Buecher, Lea) | 4 | 73,3 s | 17,9 s | 1 | 6 | 69 % | 40,1 s | **73,3 s (alles)** |
| gruendlich (jedes Echo, Polaroid, Sofa, beide Tueren) | 4 | 134,5 s | 39,9 s | 4 | 16 | 54 % | 33,1 s | 69 s |
| verpeilt (laesst den Labortisch aus) | 4 | 79,1 s | 23,7 s | 1 | 6 | 64 % | 33,1 s | 51 s |
| springer (springt dauernd) | 3 | 73,2 s | 17,8 s | 1 | 6 | 69 % | 40,1 s | 73,2 s |
| direkt, Kondition 35 + Pegel 80 | 4 | 91,4 s | 33,8 s | 1 | 6 | 58 % | 37,0 s | 52 s |
| nichtstun | 1 | endlos | - | 0 | 0 | - | 119 s | - |

Zeitachse direkt (Seed 1):

```
  0.0s  Kapitelkarte, Intro 6 Szenen (19 s ohne Steuerung)
 19.0s  Steuerung. 20.8s E Spind -> Erinnerung 1
 23.8s  E Labortisch -> Erinnerung 2          30.0s  E Buecher -> Erinnerung 3
 36.9s  Lea: 1 Textknoten, WAHL (3) bei 40.1s, danach 5 Textknoten (18 s)
 58.2s  Cutscene 6 Szenen (15 s)              73.3s  Ende
```

- **Spielzeit:** 73 s auf dem direkten Weg, 135 s, wenn man alles anfasst.
- **Gespielt werden 18 Sekunden.** 19 s Karte und Intro vorweg, 18 s Laufen mit drei E-Druecken, dann 16 s Lea-Text
  und 15 s Cutscene. Zuschau-Anteil 69 %.
- **Keine einzige Herausforderung auf dem direkten Weg** - die Leere "ohne Herausforderung" ist das ganze Level.
  Die erste Entscheidung kommt nach 40,1 s (Lea), es ist auch die einzige.
- **Nichtstun endet nie:** man knickt alle ~47 s weg, wacht am Sofa auf, das Level wartet.

### Was das Level verspricht und was gemessen wurde

1. **"Erschoepfung - der eigentliche Gegner"** (TUNE 7, Zeile 118; HUD Zeile 988). Der Kommentar rechnet:
   "eine volle Kondition reicht knapp fuer eine Strecke". Gemessen (`b-level6-zusatz.js` Teil A, direkter Weg):

   | Schwierigkeit | Pegel 0 | Pegel 40 | Pegel 80 | Pegel 100 |
   |:--|--:|--:|--:|--:|
   | LOCKER, Kondition 100 | min 82 | 80 | 74 | 70 |
   | NORMAL, Kondition 100 | min 74 | 72 | 63 | 57 |
   | HART, Kondition 100 | min 66 | 63 | 52 | 44 |
   | NORMAL, Kondition 60 | min 34 | 32 | 23 | 16 |
   | HART, Kondition 60 | min 26 | 23 | 10 | 0 (1x weggeknickt) |

   Kein Level vor Level 6 senkt `kondition` (Startwert 100 aus `nacht/nacht.js`, nur die Karte - Pizza - hebt sie).
   Wer normal ankommt, faellt auf dem direkten Weg **nie unter 57** - die Schwelle `schwereAb 30`, ab der man
   langsamer wird, erreicht er nicht, das Wegknicken schon gar nicht. Die Sofas (`SOFAS`) und die
   "+30 Kraft" aus den Echo-Gespraechen (`traumEnde()`) loesen ein Problem, das der Spieler nicht hat.
2. **"Traumlogik, eine Regel, die man lernen kann"** - die Schleife in Raum 101 (`SCHLEIFE` Zeile 268). Sie
   schnappt nur zu, wenn der Labortisch noch fehlt. Der Labortisch liegt aber auf dem Hinweg (x 430, Schleife bei
   698). Teil B, 20 Seeds: wer jedes "E" auf dem Weg drueckt, sieht die Schleife **in 0 von 20 Laeufen**; wer
   jedes Ding mit 80 % Wahrscheinlichkeit mitnimmt, in 4 von 20; mit 50 % in 12 von 20. Das einzige Raetsel
   des Levels trifft also nur den, der etwas uebersieht.
3. **Die luegende Tuer** (`TUEREN`, "RAUS" bei x 1056) versetzt an x 100 und kostet **10 s Rueckweg** - eine
   Strafe ohne Hinweis vorher, keine Entscheidung (beide Tueren sehen gleich aus, nur eine fuehrt weiter, und die
   richtige liegt ohnehin auf dem Weg).
4. **Springen** (Leertaste, `druckSprung()`): **keine Wirkung** - `S.y` wird nur gegen `BODEN` geprueft und
   gezeichnet, es gibt nichts zu erreichen oder zu ueberwinden (Teil C). Der springer-Bot sprang 34-mal, das
   Ergebnis ist identisch mit dem direkten Weg. In der Luft sinkt nur die Steuerbarkeit (`luftKontrolle 0.55`).
5. **Tiefe** (W/S, TUNE 6): ohne Wirkung, die Seite ist flach (`TIEFE_PRO_SEITE['level6.html']=false`).

### Verben

Code: `keydown` Zeile 533-541, `druckAktion()` Zeile 518, `update()` Zeile 586-693.

| Verb | Taste | Wirkung | Haeufigkeit (direkt / gruendlich) |
|:--|:--|:--|:--|
| Laufen | A / D | einzige Bewegung | 18 s / 40 s |
| Durchsuchen | E an Spind, Labortisch, Regal | 0,6 s Suchen, Erinnerung | 3 / 3 |
| Reden | E an Echo, Nacht-Echo, Lea | Text, manchmal Wahl, manchmal +20/+30 Kondition | 1 / 7 |
| Antwort waehlen | W/S + E | Lea; Hausmeister, Moritz, Sie, Marvin | 1 / 4 |
| Weiter | E | Textknoten | 6 / 16 |
| Ausruhen | E am Sofa | Kondition +24/s - unnoetig, siehe oben | 0 / 2 |
| Tuer | E an der Tuer | Versetzen (eine luegt) | 0 / 3 |
| Polaroid | E an der Uhr | Moment 6 | 0 / 1 |
| Springen | Leertaste | **nichts** | 0 / 0 (springer: 34) |
| Tiefe | W / S | **nichts** | 0 |

- Wirksame Verben: **Laufen und E**. Das ist ein Laufband mit drei Haltestellen.
- Zwei der alten Echos sagen nur denselben Satz mehrmals - drei E-Druecke fuer "SETZEN." (Lehrer), zwei fuer
  "ICH KOMME GLEICH VORBEI." (Direktor) (`ECHOS` Zeile 281).

### Scheitern

- **Kein Verlieren** - so gewollt, der Code sagt es selbst (`bildschirme()` Zeile 1074: "Kein Verlieren
  vorgesehen ... aktuell unerreichbar").
- Zeitverluste statt Fehlschlaegen: Wegknicken (2,2 s Schwarzbild, zurueck zum letzten Sofa), Schleife (158 px
  zurueck, 1,6 s), luegende Tuer (10 s), Lea zu frueh ("Hol dir erst deine Erinnerungen", Rueckweg bis 14 s).
- Gemessen: auf NORMAL mit voller Kondition **0 Wegknicken in allen Pegel-Stufen**. Selbst HART, Pegel 80
  bleibt bei 52.

### Rueckmeldung je Aktion (Code)

| Aktion | Ton | Blitz | Wackeln | Partikel | Text |
|:--|:--|:--|:--|:--|:--|
| Erinnerung gefunden | `SFX.fund` (3 Toene) + `SFX.erledigt` gleichzeitig | 0,5 | 4 | keine | Erinnerungssatz + "NOCH 2 ERINNERUNGEN" |
| Nichts gefunden | `SFX.nichts` | - | - | - | NICHTS / NUR STAUB / LEER / KALT |
| Schleife | `SFX.nichts` | 0,4 | - | - | DIESEN RAUM GAB ES SCHON EINMAL |
| Tuer | `SFX.nichts` | 0,6 | - | - | DAS WAR NICHT RAUS / DURCH DIE TUER |
| Echo mit Kraft | `SFX.erledigt` | - | - | - | DU FUEHLST DICH WACHER |
| Wegknicken | `SFX.nichts` | Schwarzblende | - | - | DU BIST WEGGEKNICKT |
| Springen / Landen | `SFX.sprung` / `landen` | - | - | - | - |

Die Verzerrung (Welle, Farbwaesche, Nachbild je Pegel, `draw()` Zeile 845-848) ist die eigentliche Rueckmeldung -
sie wird mit jeder Erinnerung klarer (`proKlarheit 14`). Das ist die schoenste Idee des Levels, aber sie haengt am
Pegel, nicht am Spielfortschritt: bei Pegel 0 sieht man fast nichts davon.

**Musik** (`musik()` Zeile 202, `DROHN` Zeile 200): 16 Schritte bei 70 BPM in Sechzehnteln = **Schleife von 3,43 s**,
4 Toene (73/87/65/98 Hz) als Sinus plus eine Oktave Dreieck, leicht verstimmt mit dem Pegel. In 73 s rund 21-mal
dieselbe Figur. Keine Aenderung bei Erinnerung, Schleife, Lea oder Wegknicken.

**Belohnung am Ende:** "LEVEL 6 GESCHAFFT", "DU BIST WACH. FUER JETZT.", Zeit (= Laufzeit, `S.zeit`), Bestzeit,
Pegel, Crew. Kein Rang. Lea kommt in die Crew - immer, egal wie man gespielt hat. Wer drei Polaroids hat, hoert
einen anderen ersten Satz von Lea (`LEA_FRAGE_SEITE`).

**Wiederspielreiz:** gering. Feste Plaetze ("ein surreales Level, das zusaetzlich random ist, waere nicht mehr
lesbar", Zeile 242 f.), eine Wahl auf dem Hauptweg. Die Nacht-Echos (Moritz, Sie, Marvin) spiegeln
Entscheidungen aus Level 2-5 - das ist der Grund, es nochmal zu spielen, aber sie liegen abseits und wirken nur ueber
Kondition, die man nicht braucht.

### Monotonie-Gruende (belegt)

1. **Ein Laufband mit drei Haltestellen:** 18 s Laufen, 3x E, 0 Herausforderungen, 1 Wahl (direkt).
2. **Zuschau-Anteil 69 %:** 19 s vor der ersten Bewegung, 31 s Lea-Monolog und Cutscene am Ende - das Ende ist
   laenger als das Spiel.
3. **Der angekuendigte Gegner (Erschoepfung) ist keiner:** Minimum 57-74 bei voller Kondition auf NORMAL.
4. **Das Raetsel loest sich von selbst** (Schleife 0/20, wenn man einfach alles mitnimmt).
5. **Zwei tote Verben** (Springen, Tiefe) - der Spieler probiert sie aus und lernt "hier passiert nichts".
6. **Echos wiederholen sich wortwoertlich** ("SETZEN." x3) - als Stimmung gemeint, als Spiel leer.
7. **3,4-Sekunden-Drone** ohne Entwicklung, obwohl das Level vom "Klarer-Werden" handelt.

### Staerken

- Die Idee: die Schule als Traum, Echos aus Level 1, Raum 101 doppelt, Glitch-Raumnamen, Uhren auf 17:30.
- Die Verzerrung (Welle, Nachbild, Farbwaesche) haengt sichtbar am Pegel und wird mit jeder Erinnerung klarer.
- Die Nacht-Echos greifen Entscheidungen aus Level 2-5 auf (Moritz-Kartons, die Frau aus dem Club, Marvin) und
  setzen Flags fuer das Finale (`angstZugegeben`, `traumEinsicht`).
- Kurze Wege, klare Aufgabenliste im HUD, keine Sackgasse.

### Ideen (je eine Datei: `level6.html`)

1. **Erschoepfung echt machen:** Kondition beim Levelstart aus dem Pegel ableiten (`kondition = 100 - pegel*0.5`,
   min 35) und `konditionAbbau` auf ~2,5/s. Dann muss man die Sofas und Echo-Kraft einplanen - eine Routenfrage
   (Sofa bei 790 vor oder nach der Bibliothek?).
2. **Der Direktor jagt dich:** das Echo "ICH KOMME GLEICH VORBEI" wird ab der zweiten Erinnerung wahr - eine
   langsame Gestalt folgt dir, Kontakt = Wegknicken. Verstecken in Spinden (Callback auf das Schleichen aus
   Level 1). Gibt dem Laufband eine Bedrohung.
3. **Die Schleife unvermeidlich machen:** der Labortisch erscheint erst, nachdem man einmal in der Schleife war
   ("WAS IST IM CHEMIERAUM PASSIERT?"), oder die Erinnerungen muessen in der Reihenfolge der Nacht gefunden werden.
   So erlebt jeder die eine Traumregel.
4. **Springen benutzen oder weglassen:** im Keller fehlen Bodenplatten (Luecken ueber Schwaerze, Fallen = zurueck
   zum Sofa), in der Turnhalle schwebende Kaesten zum Polaroid. Sonst die Leertaste in diesem Level stumm schalten.
5. **Jede Erinnerung als 10-s-Nachspielszene:** Spind = Moritz' Klopfzeichen nachklopfen (Simon-sagt mit E),
   Feueralarm = im richtigen Moment den Melder druecken, waehrend der Lehrer wegsieht, Bibliothek = Augen offen
   halten (Rhythmus gegen das Einnicken). Drei verschiedene Mini-Verben statt dreimal "E, 0,6 s warten".
6. **Luegende Tuer als Raetsel:** die Echos geben Hinweise ("DIE TUER MIT DEM SCHLUESSELLOCH LUEGT"), die Tueren
   sehen verschieden aus. Dann ist der 10-s-Rueckweg die Folge einer Entscheidung.
7. **Musik als Fortschritt:** pro Erinnerung eine Stimme mehr (Drone -> Drone + Melodie -> + Rhythmus), bei Lea
   loest sie in einen Akkord auf. Das "Klarer-Werden" wird hoerbar.
8. **Ende kuerzen und belohnen:** Lea-Monolog auf 3 Knoten, Cutscene auf 3 Szenen; Endbildschirm mit
   "KLARHEIT"-Wertung (Erinnerungen, Echos, Polaroid, nie weggeknickt) statt Laufzeit-Bestzeit.
9. **Echos mit Abweichung:** beim dritten Ansprechen sagt der Lehrer etwas Neues ("...DU WARST GAR NICHT SO
   SCHLECHT."), und das gibt Kraft - Belohnung fuer Neugier statt dreimal derselben Zeile.

### Bugs (Level 6)

1. **Der Marvin-Strang aus Level 5 fehlt** (siehe Level 5, Bug 1): ohne `marvinKennt` ist das Nacht-Echo "EIN
   SCHATTEN" mit einem Satz und **ohne Wahl** (`marvinEcho()` Zeile 391) - die Wahl "Ja. Und?"
   (`angstZugegeben`) ist fuer zielstrebige Spieler unerreichbar.
2. **Leertaste auf dem Sieg-Bildschirm startet das Level neu** (`druckSprung()` Zeile 513: `neuesSpiel()` ohne
   Pruefung auf `S.gewonnen`), angezeigt als "LEERTASTE FUER NEUSTART" (Zeile 1080). Wer die Sprungtaste aus
   Gewohnheit drueckt, landet wieder im Titel. In Level 5 fuehrt dieselbe Taste zur Karte - uneinheitlich.
3. **TUNE-Kommentar (7) falsch:** "eine volle Kondition reicht knapp fuer eine Strecke" - gemessen bleiben 57-74.
4. **Springen und Tiefe ohne Wirkung** (Teil C), `redeTiefe` und `tiefeTempo` sind tote Stellschrauben.
5. **Bestzeit misst Laufzeit** (`S.zeit`), nicht das Level; Lesen und Cutscene zaehlen nicht, Umwege schon.

---

## Gesamtbild Level 4 bis 6

| | Level 4 Tuersteher | Level 5 Club | Level 6 Afterhour |
|:--|:--|:--|:--|
| Spielzeit (Erstspieler) | ~70 s | ~180 s | ~73 s (gruendlich 135 s) |
| davon mit wirksamer Steuerung | 12-15 s Kampf | 12 s Laufen + 15 Wahlen | 18 s Laufen |
| Zuschau-Anteil | 77-84 % | 54 % | 69 % |
| Laengste Leere H/E | 32,5 s | 24,6 s | 40,1 s |
| Laengste Strecke ohne Herausforderung | 32,5 s (Cutscene) | 159 s | 73 s (ganzes Level) |
| Wirksame Verben | E im Fenster, Rolle | Laufen, E, Antwort | Laufen, E |
| Tote Verben | Blocken (lohnt nie) | W/S im Club | Springen, W/S |
| Harter Fehlschlag | 3 Herzen; Neustart kostet 19-31 s | Blackout ohne Warnung, Neustart vom Titel | keiner |
| Gebautes Druckmittel, das nicht wirkt | Pegel (13/20 Siege mit und ohne) | Uhr 2 %, Marvin 0/24, Ambiente 0 | Erschoepfung (Minimum 57-74) |
| Musikschleife | 2,03 s, 2 Stimmen | 1,76 s, 3 Stimmen | 3,43 s, 2 Stimmen |
| Belohnung | Text + Laufzeit-Bestzeit | Text + Laufzeit-Bestzeit | Text + Laufzeit-Bestzeit |
| Partikel | keine | keine | keine |

**Gemeinsame Ursachen (belegt):**

1. **Mehr Zuschauen als Spielen** in allen drei Leveln (54 bis 84 %). Intro, Kapitelkarte, Text ohne Wahl und
   Cutscene sind zusammen laenger als der spielbare Teil.
2. **Eine Kernhandlung je Level, ohne Steigerung im Level:** L4 E im Fenster alle 2,25 s; L5 ansprechen und
   waehlen; L6 hinlaufen und E. Keine zweite Phase, kein Twist, kein Bosswechsel.
3. **Gebaute Druckmittel, die nicht ankommen:** Pegel in L4, Uhr/Marvin/Ambiente in L5, Erschoepfung in L6 -
   jeweils im Code vorhanden, kommentiert, aber gemessen wirkungslos. Das ist der billigste Hebel: Zahlen und eine
   Kopplung aendern, nicht neu bauen.
4. **Musik ist je Level eine 2-3-Sekunden-Schleife** ohne Abschnitte und ohne Reaktion auf das Geschehen.
5. **Belohnung misst nicht das Spiel:** alle drei speichern eine Bestzeit aus `S.zeit`, die Wartezeit (L4) oder
   reine Laufzeit (L5, L6) zaehlt. Kein Rang, keine Wertung, die gutes Spielen sichtbar macht.
6. **Keine Partikel, wenig Trefferwucht ausserhalb von L4** - Erfolge sind ein Ton und eine Textzeile.

**Groesste Hebel in Reihenfolge (Wirkung je Aufwand):**

1. L5: `S.zeit`-Kopplung von Marvin/Ambiente/Uhr loesen (Bug 1) - repariert nebenbei den Marvin-Strang in L6-L8.
2. L4: Neustart direkt in den Kampf (spart 19-31 s je Versuch), Ramme-Ueberlappung beheben.
3. L6: Kondition aus dem Pegel ableiten und Abbau erhoehen - dann gibt es den angekuendigten Gegner.
4. Alle drei: Endbildschirm mit Wertung (Rang) statt Laufzeit-Bestzeit.
5. Alle drei: Musik in Abschnitten (zweite Bassfolge, Phasen-/Fortschritts-Stimmen).
