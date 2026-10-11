# Recherche: Spielgefühl (Juice) und Audio

*Stand 2026-10-05, Analyse-Lauf ohne Änderungen am Spiel. Messskripte liegen in
`docs/gameplay/messung/audio-musik.js` und `audio-stumm.js` (aus der Projektwurzel mit `node` starten).*

## 0. Kurzfassung

NACHTSCHICHT hat die **Steuerungs-Grundlagen** schon (Coyote Time 95 ms, Sprungpuffer 130 ms,
variable Sprunghöhe, Kamera mit Lookahead, Hitstop 70 ms im Kampf, Vibration bei Treffern).
Was fehlt, ist die **Antwort der Welt**: keine Partikel, kein Squash & Stretch, ein Wackeln aus
weißem Rauschen statt glattem Trauma-Shake, Meldungen ohne Bewegung, Blitze ohne Farbe. Und vor allem
die **Musik**: je Level eine 16-Schritt-Bassline, die sich alle **1,8 bis 3,4 Sekunden** wiederholt –
in einer 40-Minuten-Nacht also rund tausendmal. Dazu kommt ein echter Fehler im Musik-Takt
(„Notenstau“, siehe 1.3). Die Empfehlung: zwei neue Engine-Dateien, `nacht/saft.js` (Spielgefühl)
und `nacht/musik.js` (Sequencer mit Songs als Daten), beide hinter `FX` bzw. einem Mischpult.

## 1. Ist-Zustand im Code (gelesen und gemessen)

### 1.1 Engine

- `nacht/ton.js` (39 Zeilen): `AC`, `muted`, `ton()`, `piep()`, `glissando()`, `rauschen()`,
  `MUS={step,next}`. **Jeder Ton geht direkt an `AC.destination`** – kein Master-Bus, kein
  Kompressor, keine getrennten Lautstärken für Musik und Effekte, kein Ducking.
- `rauschen()` baut bei **jedem Aufruf** einen neuen Rauschpuffer (Math.random über alle Samples) –
  bei 9 Hi-Hats pro Sekunde (Level 5) unnötige Arbeit im Hauptthread.
- SFX-Arpeggios (`fund`, `sieg`, `erledigt`) laufen über `setTimeout` statt über die Audio-Uhr –
  genau das, was „A Tale of Two Clocks“ als ungenau beschreibt (Verzug durch Layout/GC).
- `nacht/komfort.js`: `FX.blitz/wackel/hz/ruhig`. Gut gebaut; jede neue Wirkung muss hier durch.
- `nacht/kern.js`: `bild()` begrenzt `dt` auf 50 ms; Reihenfolge MENUE → LEHRE → update → draw.
  Steht das Handy offen, läuft `update()` nicht – und damit auch `musik()` nicht (siehe 1.3).
- `nacht/kampf.js`: **Hitstop gibt es schon** (`KAMPF.hitStop=0.07`, Konter ×1,6, Block ×0,6),
  genutzt in Level 3, 4, 5, 8 über `kampfZeitFaktor()`. Level 2 (Türkampf) hat eigenen Code ohne Hitstop.
- `mobilVibriere()` (mobil.js) ist da und wird von `kampf.js` (Treffer 18 ms, eingesteckt [0,55],
  Gardebruch [30,40,70]), vom Handy und vom Knopfdruck (8 ms) genutzt.

### 1.2 Spielgefühl in den Leveln

| Baustein | Stand |
|:--|:--|
| Coyote Time / Sprungpuffer / kurzer Sprung | vorhanden (`coyoteMs:95`, `puffermMs:130`, `kurzsprung`) |
| Kamera | Lerp mit `kameraTraegheit`, Lookahead `blickVoraus` – gut |
| Wackeln | `S.ruettel` fällt **linear** um 16 px/s; Versatz jedes Bild neu `Math.random()` → zitterndes Rauschen, kein Nachschwingen |
| Blitz | `S.blitz` linear −2,2/s, immer **weiß**, volle Fläche |
| Meldungen | `meldung(t)` blendet nur aus; kein Einfliegen, kein Skalieren, keine Zahl am Ort des Geschehens |
| Partikel | **keine** in den acht Leveln (nur `runner.html` hat `puff/shards/say`) |
| Squash & Stretch | **keiner** (Sprung, Landung, Treffer) |
| Übergänge | Kapitelkarte, sonst harte Schnitte |

### 1.3 Musik – Messung mit falschem AudioContext (30 s „nach rechts laufen“)

| Seite | Töne/s | Tonhöhen | Wellenformen | Schleife | Wdh. in 30 s |
|:--|--:|--:|:--|--:|--:|
| index (Schule) | 7,0 | 11 | square+triangle | 3,2 s (Jagd 1,9 s) | ~9 |
| level2 (Moritz) | 8,0 | 6 | square+sine | 1,88 s | 16 |
| level3 (Bus) | 4,4 | 9 | square+sine | 2,40 s | 13 |
| level4 (Schlange) | 6,4 | 6 | square+sine | 2,03 s | 15 |
| level5 (Club) | 12,6 | 6 | square+sine | 1,76 s | 17 |
| level6 (Traum) | 2,3 | 8 | sine+triangle | 3,43 s | 9 |
| level7 (Späti) | 0,6 | 4 | sine | 6,86 s | 4 |
| level8 (Heimweg) | 5,5 | 4 | square+sine | 2,1→1,6 s | ~16 |

Eine einzige Bassline, vier bis elf Tonhöhen, keine Melodie, keine Akkorde, keine Abschnitte.
Das ist der hörbare Kern von „monoton“.

**Notenstau (Fehler):** `musik()` wird aus `update()` gerufen und bricht bei `muted`, `pause` und
`titel` früh ab, **ohne `MUS.next` nachzuziehen**. Läuft `update()` gar nicht (Handy offen) oder
endet früh (Kapitelkarte, Polaroid-Karte: `erzaehlTakt()` gibt `true`), bleibt `MUS.next` in der
Vergangenheit. Im ersten Bild danach holt die `while`-Schleife jeden verpassten Schritt nach:

- nach 5 s Stillstand: 12 (Level 6) bis **71 Knoten in einem Bild** (Level 5), davon 22 Rauschimpulse,
  die **ohne Hüllkurve** gleichzeitig starten (Level 2: 11) → hörbares Zischen/Knacken nach jeder
  Kapitelkarte, Pause und jedem Handy-Blick. Die Oszillatoren selbst bleiben meist stumm, weil ihre
  Hüllkurve schon abgelaufen ist – kosten aber trotzdem.
- nach **120 s Ton aus (M)** und wieder an: **609 bis 1700 Knoten in einem Bild** (Level 8 / Level 5)
  → Ruckler genau in dem Moment, in dem der Spieler den Ton zurückholt.

Abhilfe (Muster A1): vor der Schleife `if(MUS.next<AC.currentTime) MUS.next=AC.currentTime+0.05`
– bzw. im neuen Sequencer: ein Takt, der nie nachholt, sondern im nächsten Raster neu einsetzt.

### 1.4 Weitere Audio-Lücken

- **Ton aus wird nicht gemerkt.** `muted` ist ein nacktes `let` in `ton.js`; jede Seite (Level, Karte)
  startet mit Ton. Wer im Bus M drückt, hat im Club wieder Musik. `KOMFORT` hat keinen Ton-Schlüssel.
- **Keine Lautstärke-Regler** für Musik und Effekte getrennt – Standard in jedem Store-Spiel.
- **Startmenü und Karte haben keine Musik**, nur Menü-Piepser. Die ersten Sekunden des Spiels sind still.
- **Keine Variation:** `schritt` und `reden` haben Zufall in der Tonhöhe, alles andere klingt jedes Mal
  gleich (`klatsch`, `aua`, `fund`). `sieg` ist in fünf Leveln dieselbe Tonfolge 660-880-1100-1320.

## 2. Was die Vorbilder machen (Quellen)

**Steve Swink, „Game Feel“ (2009).** Spielgefühl = Echtzeit-Steuerung (Reaktion unter ~100 ms),
simulierter Raum (Gewicht, Schwerkraft, Kollision) und **Polish**: Effekte, die die Simulation nicht
ändern, aber verkaufen. NACHTSCHICHT hat die ersten beiden ordentlich; es fehlt Schicht drei.

**Jan Willem Nijman (Vlambeer), „The Art of Screenshake“ (2013).** Ein langweiliger Shooter wird in
rund 30 kleinen Schritten saftig: Animation, größere/schnellere Geschosse, Mündungsblitz,
Treffer-Reaktion, Rückstoß bei Gegner **und** Spieler, **Sleep** (ein bis zwei Bilder Stillstand bei
Treffern, Toden, Explosionen), **Permanenz** (Hülsen und Leichen bleiben liegen), Kamera-Lerp,
Kamera-Vorlauf in Blickrichtung, Wackeln. Kernaussage: Viele kleine Rückmeldungen auf **jede**
Aktion, und bei 320×180 reicht „ein Pixel oder zwei“.

**Martin Jonasson & Petri Purho, „Juice it or lose it“ (GDC Europe 2012).** Ein Breakout-Klon wird
live aufgedreht: Tweens mit Easing statt linearer Bewegung, Skalieren und Quetschen beim Aufprall,
Partikel, Wackeln, Farbe, Ton auf jeder Kollision. Spätere Gegenrede („resist the urge to juice it“):
Saft darf die Lesbarkeit nicht zudecken – er gehört an die wichtigen Momente.

**Maddy Thorson, Celeste (Thread 2020, Quelltext Player.cs).** Zehn Tricks, die alle das Zeitfenster
zugunsten des Spielers weiten: Coyote Time (`JumpGraceTime=0.1`), Sprungpuffer, halbe Schwerkraft am
Scheitelpunkt bei gehaltener Taste, Kantenkorrektur. Squash & Stretch im Quelltext: beim Absprung
`Scale=(0.6,1.4)`, bei der Landung je nach Fallgeschwindigkeit bis `(1.6,0.4)`, Rückkehr zu 1 mit
`Approach(…,1,1.75*dt)`. Auflösung ebenfalls 320×180 – die Zahlen passen direkt.

**Masahiro Sakurai (Smash Bros.) zu Hitstop.** Beide Kämpfer frieren kurz ein; je mehr Schaden, desto
länger (Ultimate: etwa `0,65×Schaden+6` Bilder, Obergrenze 30). Während des Stillstands **zittern**
die Getroffenen (am Boden waagerecht, in der Luft senkrecht), abklingend. Stillstand ohne Zittern
wirkt wie ein Ruckler.

**Squirrel Eiserloh, „Juicing Your Cameras With Math“ (GDC 2016).** Wackeln über **Trauma** ∈ [0,1]:
Treffer addieren Trauma, es klingt linear ab, die Auslenkung ist `Trauma²` (oder ³) mal einem
**glatten Rauschen** (Perlin) statt `Math.random()` – das wirkt wie eine Erschütterung, nicht wie ein
Bildfehler. Dazu Kamera-Glättung (asymptotisch), Fenster und Vorlauf.

**Chris Wilson, „A Tale of Two Clocks“ (web.dev).** `setTimeout` schwankt um zehn und mehr
Millisekunden; deshalb plant man Töne mit der Audio-Uhr voraus: Zeitgeber alle **25 ms**, Vorlauf
**100 ms**, `while(next < currentTime + vorlauf)`. NACHTSCHICHT macht das schon halb (Vorlauf 120 ms,
aber getaktet von `update()` statt von einem eigenen Zeitgeber – deshalb der Notenstau).

**Adaptive Spielmusik.** Zwei Techniken: **vertikale Ebenen** (Stimmen kommen dazu oder gehen, je nach
Spannung) und **horizontales Umschalten** (Abschnitte wechseln je nach Lage). Wechsel immer **auf
der nächsten Taktgrenze**, wichtige Einzelereignisse als **Stinger** (kurzes Motiv über der Musik).
Chiptune-Handwerk: Pulswellen mit 12,5/25/50 % Tastgrad (`createPeriodicWave`), Arpeggien statt
Akkorden, Schlagzeug aus Rauschen.

**Mischung.** Eine feste Rangfolge (Treffer und Warnungen vor Musik), Luft nach oben (Limiter am Ende),
Wiederholungsmüdigkeit vermeiden durch zufällige Tonhöhe und Lautstärke (±5–8 %) und mehrere
Varianten je Klang.

**Haptik am Handy.** `navigator.vibrate` gibt es in Chrome/Android, **nicht in Safari auf iOS**.
Der Umweg über einen versteckten `<input switch>` (ab iOS 17.4) braucht einen echten Tipp auf das
Element und ist laut einer Quelle ab iOS 26.5 wieder gesperrt – **nicht darauf bauen**. Webaudio
läuft auf iOS standardmäßig in der Sitzung „ambient“: Der Stummschalter am iPhone schaltet das Spiel
stumm (mit Kopfhörer nicht). `navigator.audioSession.type='playback'` umgeht das, stoppt aber dafür
die Musik anderer Apps.

## 3. Muster (35), nach Bereichen

Prio: **muss** = vor einem Store-Start, **soll** = macht den Unterschied, **kann** = Kür.
Aufwand: S = unter 1 h, M = halber Tag, L = mehr.

### A. Audio-Grundlagen und Fehler

**A1 Notenstau beheben** (muss, S). Kein Nachholen verpasster Schritte. In jedem `musik()` vor der
Schleife: `if(MUS.next<AC.currentTime) MUS.next=AC.currentTime+.05;`. Im neuen `musik.js` regelt das
der Planer selbst. Abnahme: `audio-musik.js` meldet ≤ 2 Knoten mit Startzeit in der Vergangenheit.

**A2 Eigener Planer-Takt** (muss, S). Musik nicht aus `update()` takten, sondern aus
`setInterval(MUSIK.takt,25)` plus einem Aufruf in `bild()`; Vorlauf 100 ms. Dann läuft die Musik
unter Kapitelkarte, Handy und Hitstop sauber weiter. Für `nachttest.js` (dort ist `setInterval` eine
Attrappe) ist `MUSIK.takt()` von Hand aufrufbar.

**A3 Mischpult** (muss, M). `AC → master(Gain) → DynamicsCompressor (threshold −14 dB, ratio 6,
attack 3 ms, release 150 ms; als Begrenzer) → destination`; davor `bus.musik` und `bus.sfx`. `ton()`,
`glissando()`, `rauschen()` bekommen einen optionalen Ziel-Bus (Standard: sfx). Ohne das gibt es
weder Regler noch Ducking, und sechs gleichzeitige Rechteckwellen übersteuern.

**A4 Ton-Einstellungen merken** (muss, S). In `KOMFORT_STANDARD` drei Schlüssel: `ton:true`,
`musik:0.7`, `effekte:0.9`. Taste M und der Handy-Knopf gehen über `KOMFORT.setze('ton',…)`;
`muted` wird beim Laden daraus gesetzt. Regler im Einstellungsmenü (`menue.js`, `mobil.js`).

**A5 Ein Rauschpuffer für alles** (soll, S). Einmal 1 s weißes Rauschen erzeugen, jedes Mal mit
zufälligem Versatz `start(wann, versatz, dauer)` abspielen. Spart pro Hi-Hat einen Puffer-Neubau.

**A6 Jingles auf der Audio-Uhr** (soll, S). `fund`, `sieg`, `erledigt` mit
`ton(f, AC.currentTime+i*0.11, …)` statt `setTimeout` – gleichmäßig, und es läuft auch, wenn der
Hauptthread kurz hängt.

**A7 Pause und Handy dämpfen statt stoppen** (soll, S). Pause: Musik über einen Tiefpass
(`BiquadFilter` 600 Hz, 150 ms Übergang) auf 40 %. Handy offen: Tiefpass wie „Musik durch die
Jackentasche“ – das passt zur Geschichte und hält die Stimmung.

### B. Musik

**B1 Sequencer mit Songs als Daten** (muss, L). Ein Song hat Tempo, Stimmen und benannte Muster
(A, B, C …) zu je 1–4 Takten in Tracker-Schreibweise und eine Folge (`A A B A C`). Ziel: Schleife
**≥ 30 s** statt 1,8 s. Vier Stimmen reichen: Bass (Puls 25 %), Lead (Puls 12,5 %), Arpeggio (Puls
50 %, schnell wechselnde Akkordtöne), Schlagzeug (Rauschen + Sinus-Kick). Skizze in Abschnitt 5.

**B2 Intensitäts-Ebenen** (muss, M). Jeder Song hat 3–4 Ebenen; das Level meldet nur
`MUSIK.spannung(0..1)`. Ebene 0 = Bass + leiser Takt, 1 = + Schlagzeug, 2 = + Arpeggio, 3 = + Lead.
Ein- und Ausblenden der Ebenen-Gains an der **nächsten Taktgrenze** (Rampe über einen Schlag).
Belegung: Level 1 Verdacht der Lehrer, Level 2 Pegel, Level 3 Verdacht, Level 4 Boss-Treffer,
Level 5 Pegel/Kampf, Level 6 Pegel (dazu Verstimmung), Level 8 Licht.

**B3 Abschnittswechsel im Takt** (soll, M). `MUSIK.abschnitt('C')` wartet auf die Taktgrenze und
spielt vorher einen eintaktigen **Fill** (Snare-Wirbel). Beispiele: Jagd in der Schule (heute ein
harter Tempowechsel), Kampfbeginn in Level 2/3/5/8, Boss-Phase in Level 4, der letzte Sprint gegen
die Sonne in Level 8.

**B4 Stinger** (soll, M). Kurze Motive in der Tonart des laufenden Songs, gerastert auf die nächste
Achtel, Musik dabei kurz geduckt: `fund` (Polaroid), `entdeckt` (Lehrer sieht dich – das „!“),
`geschafft`, `erwischt`, `kapitel` (zwei Takte Leitmotiv unter der Kapitelkarte).

**B5 Leitmotiv** (soll, M). Ein viertaktiges „Nachtschicht-Thema“, das überall wiederkehrt: voll im
Startmenü, als Spieluhr auf der Karte, langsam in Dreiecksklang im Späti, verstimmt im Traum, und im
Finale von Level 8 mit allen Stimmen; beim Sonnenaufgang einen Ganzton höher (Rückung). Das bindet
acht verschiedene Level zu einer Nacht.

**B6 Menü- und Kartenmusik** (muss, S – sobald B1 steht). Stille im Startmenü wirkt unfertig.

**B7 Lebendige Wiederholung** (kann, S). Am Ende jedes vierten Takts ein Zufalls-Fill, Hi-Hat-Velocity
leicht schwanken lassen, Swing 10–15 % in Level 2 und 7, Echo (`DelayNode`, 3/16, Rückkopplung 0,3)
für Lead in Level 6 und 7.

**B8 Stille als Werkzeug** (kann, S). Vor dem Türsteher-Kampf und vor dem Finale einen Takt
Musik weg, dann einsetzen. Kontrast wirkt stärker als Lautstärke.

**B9 Takt-Sync fürs Bild** (soll, S). `MUSIK.schlag()` liefert `{schlag, takt, phase}`. Club-Lichter,
Moritz' Boxen, nickende Gäste und Busleuchten pulsen auf den Schlag. Das Stroboskop in Level 5 auf
die Kick legen: 126 BPM sind 2,1 Hz – unter der Grenze `FX.hz(3)`.

**B10 Timing auf den Takt** (kann, M). Das Flirt-Timing in Level 5 und die Konterfenster des
Türstehers so legen, dass das Fenster auf einem Schlag liegt. Dann hilft die Musik beim Spielen.

### C. Effekte-Klang und Mischung

**C1 Variation** (soll, S). Jedes `SFX`-Rezept bekommt ±6 % Tonhöhe und ±15 % Lautstärke; Schritte
abwechselnd links/rechts (zwei Tonhöhen); `klatsch` in drei Varianten.

**C2 Schichten** (soll, S). Ein Treffer = Rausch-Transient (10 ms, hell) + Körper (Rechteck-Glissando)
+ Sub-Plopp (Sinus 80→40 Hz). Je schwerer, desto mehr Sub. Ein Konter klingt anders als ein Treffer
(heller Ping obendrauf).

**C3 Tonleiter für Serien** (soll, S). Aufeinanderfolgende Erfolge steigen um einen Halbton:
Konter-Serie, Aufgaben in Level 2, Erinnerungen in Level 6. Nach zwei Sekunden Pause wieder unten.

**C4 Ducking** (soll, S). Bei schweren Treffern, Stingern und gesprochenem Text (Plausch, Gespräch)
den Musik-Bus auf 50–60 % (`setTargetAtTime`, 20 ms runter, 250 ms zurück). Im Club zusätzlich das
typische „Pumpen“: jede Kick duckt die übrigen Musikstimmen kurz.

**C5 Stimmenbegrenzung** (soll, S). Höchstens 24 gleichzeitige Knoten; darüber fällt der älteste
leise Ton weg. Gleiche SFX innerhalb von 40 ms nur einmal.

### D. Spielgefühl (`nacht/saft.js`)

**D1 Trauma-Wackeln** (muss, M). Ersetzt `S.ruettel` + `Math.random()`. `SAFT.trauma(0.3)`,
Abbau 1,1/s, Auslenkung `maxPx·T²·rauschen(t·18 Hz)`, `maxPx` durch `FX.wackel(4)`. Ganzzahlig
runden. Dazu ein **Richtungsstoß**: 2–3 px in Schlagrichtung, federnd zurück.

**D2 Hitstop mit Leben** (muss, S). `kampfStop` bleibt, wird aber zentral (`SAFT.stop`) und für
alle Treffer genutzt (auch Level 2, Fund, Erwischtwerden). Während des Stopps: Getroffener zittert
±1 px waagerecht, abklingend; ein Bild lang **weiße Silhouette** (`sprite(rows,x,y,sc,'#ffffff')` –
der Tint-Parameter existiert schon). Dauer nach Wucht: 50 / 70 / 110 ms, Obergrenze 150 ms.

**D3 Partikel** (muss, M). Ein Pool mit 240 Einzelpixel-Teilchen, Arten als Daten:
`staub` (Landung, Rennen), `funken` (Treffer, gelb-weiß), `scherben` (Flasche), `konfetti` (Fund,
Sieg), `tropfen` (Getränk, Schweiß), `rauch` (Bus, Späti-Atem in der Kälte). Schwerkraft, Reibung,
Lebensdauer; `runner.html` hat den Kern schon (`puff`, `shards`).

**D4 Permanenz** (soll, S). Ein Teil der Teilchen bleibt am Boden liegen (Scherben, Konfetti,
Pfützen; höchstens 150 je Level). Die Welt erinnert sich an das, was passiert ist – passt zu „die
Nacht merkt sich alles“.

**D5 Squash & Stretch** (soll, M). Celeste-Werte, für Pixel gerundet: Absprung (0,8; 1,2), Landung
je nach Fallgeschwindigkeit bis (1,3; 0,7), Treffer am Gegner (1,2; 0,85), Rückkehr mit 4–6/s.
Gezeichnet mit `drawImage(c, x, y, w·sx, h·sy)`, verankert an den Füßen, Breite auf ganze Pixel.

**D6 Zahlen- und Wort-Popups am Ort** (muss, S). `SAFT.popup('+3 MUT', x, y)`: springt mit
Overshoot hoch (Skala 2 → 1 in 80 ms), steigt 12 px, blendet aus. Für Mut/Ruf/Geld-Änderungen,
Treffer (`KONTER`, `BAM`), Funde. Heute steht `meldung()` nur in der Bildmitte und blendet aus.

**D7 Blitz in Farbe über FX** (soll, S). `SAFT.blitz(farbe, alpha, dauer)` – weiß für Treffer, gold
für Fund, rot (Rand-Vignette statt Vollfläche) für Schaden. Alpha immer durch `FX.blitz()`, ein
Blitz höchstens alle 333 ms (`FX.hz(3)`).

**D8 Tweens und Easing** (soll, M). `SAFT.tween(obj,{y:40},0.3,'rausZurueck')` mit den
Penner-Kurven (`rausQuad`, `rausZurueck`, `rausElastisch`, `reinRausSinus`). Für Menüeinträge,
Meldungen, Handy-Einblendung, HUD-Herzen (Herz platzt beim Verlust auf und fällt).

**D9 Nachlauf-Balken** (soll, S). Lebens- und Ausdauerbalken zeigen den Verlust erst als weißes
Stück, das nach 300 ms schrumpft (Street-Fighter-Stil). Man sieht, **wie viel** ein Treffer kostete.

**D10 Zeitlupe und Kinobalken beim K.O.** (soll, S). Letzter Treffer gegen Türsteher, Marvin und
im Finale: 0,6 s mit Faktor 0,3, schwarze Balken oben/unten (je 12 px) gleiten herein, Musik duckt,
danach Stinger. Kein unganzzahliges Zoomen (Pixel würden ungleich breit).

**D11 Übergänge zwischen Seiten** (soll, M). Level-Ende: Kreisblende schließt sich auf den Spieler
(oder Pixel-Raster-Auflösung), Ton blendet aus; die nächste Seite öffnet die Blende wieder (Merker in
`sessionStorage`). Heute sind Seitenwechsel harte Schnitte mit weißem Neuladen.

**D12 Gefahr spürbar machen** (soll, S). Bei einem Herz: Herzschlag im Bass (Sinus 55 Hz, Doppelschlag,
1 Hz), roter Rand mit Alpha ≤ 0,2 im selben Takt (`FX.hz(1)`), am Handy Herzschlag-Vibration.

### E. Haptik

**E1 Vibrationstabelle** (soll, S). Ein Ort für alle Muster in `saft.js`, nur über `mobilVibriere`:
`tipp:8`, `treffer:18`, `konter:[0,25,30,25]`, `eingesteckt:[0,55]`, `gardebruch:[30,40,70]`,
`ko:[80,60,140]`, `fund:[0,15,40,15]`, `herz:[30,90,30]` (höchstens 1/s). Die Vibration startet mit
dem Hitstop, nicht danach. iOS: keine Haptik, keine Tricks; Ton und Bild tragen die Information
allein – so ist es heute schon gedacht („nur Zugabe, nie Info“).

## 4. Flackerschutz und Komfort für alles Neue

- Jede Vollflächen-Aufhellung, auch farbige, geht durch `FX.blitz()`; jede periodische Aufhellung
  durch `FX.hz()`. Rote Vollflächenblitze vermeiden (WCAG 2.3.1 zählt gesättigtes Rot extra) – Rot nur
  als Rand.
- Wackeln und Richtungsstoß gehen durch `FX.wackel()`; ist `wackeln` aus, ist auch der Hitstop-Zitter
  aus (der Stillstand selbst bleibt – er ist Information, kein Effekt).
- Partikel, Popups, Squash und Zeitlupe sind kein Flackern, brauchen keinen Schutz; bei
  `FX.ruhig()` die Teilchenzahl halbieren, damit das Bild ruhiger wird.
- Takt-Sync-Lichter (B9) nur als sanfte Helligkeitswelle (Alpha ≤ 0,15) oder über `FX.hz`.

## 5. API-Skizze `nacht/saft.js`

Laden **nach `komfort.js`** (braucht `FX`, `text`, `holeSprite`); Einbau mit
`python tools/engine_einbinden.py saft --nach komfort`. Keine DOM-Abhängigkeit, damit `nachttest.js`
es mitnimmt. Vibration zur Laufzeit über `typeof mobilVibriere==='function'`.

```js
const SAFT_TUNE={ traumaAbbau:1.1, wackelPx:4, wackelHz:18, stopMax:0.15,
  teilchenMax:240, liegenMax:150, popupDauer:0.9, quetschZurueck:5 };

const SAFT={
  /* Zeit – erste Zeile in update(): dt=SAFT.takt(dt) liefert Spielzeit
     (0 im Hitstop, 0.3*dt in Zeitlupe); Effekte selbst laufen in Echtzeit. */
  takt(dt){}, stop(sek){}, zeitlupe(faktor,sek){}, imStopp(){},
  /* Kamera */
  trauma(menge){}, stoss(richtungX,px){}, versatz(){ /* {x,y} ganzzahlig, durch FX.wackel */ },
  /* Teilchen und Spuren */
  teilchen(art,x,y,n,richtung){}, zeichneTeilchen(kamX,kamY){},
  /* Körper: obj bekommt _sx/_sy */
  quetsch(obj,sx,sy){}, spriteQ(rows,x,y,sc,obj,flip,tint){},
  /* Text */
  popup(txt,x,y,farbe,opt){}, zeichnePopups(kamX,kamY){},
  /* Bild */
  blitz(farbe,alpha,dauer){}, rand(farbe,alpha){}, balken(an){}, zeichneUeber(){},
  /* Tweens */
  tween(obj,ziel,dauer,kurve,fertig){}, KURVEN:{ rausQuad, rausZurueck, rausElastisch, reinRausSinus },
  /* Haptik */
  summ(name){},
  /* Rezepte – das, was Level wirklich aufrufen */
  treffer(x,y,richtung,wucht){ /* stop, trauma, stoss, funken, summ, evtl. popup */ },
  landung(obj,fallTempo){ /* quetsch, staub */ },
  fund(x,y){ /* konfetti, goldener Blitz, popup, summ */ },
  schaden(wucht){ /* roter Rand, trauma, summ */ },
};
```

Einbau je Level (vier Zeilen): `dt=SAFT.takt(dt)` in `update`; in `draw` statt des Zufalls-Wackelns
`const v=SAFT.versatz(); ctx.translate(v.x,v.y)`; nach der Welt `SAFT.zeichneTeilchen(kamX)` und
`SAFT.zeichnePopups(kamX)`; ganz zuletzt `SAFT.zeichneUeber()` (Blitz, Rand, Balken). `kampfStop`
in `kampf.js` ruft künftig `SAFT.stop()`, damit es nur **eine** Zeitsteuerung gibt.

## 6. API-Skizze `nacht/musik.js`

Laden **nach `komfort.js`** (braucht `ton.js` und `KOMFORT` für die Lautstärken):
`python tools/engine_einbinden.py musik --nach komfort`. `ton.js` bleibt für Einzeltöne; `musik.js`
baut das Mischpult und hängt `ton()` an `bus.sfx`.

```js
const MUSIK={
  mischpult(){},                 // lazy beim ersten ensureAudio(): master, Kompressor, bus.musik, bus.sfx
  spiele(song,opt){},            // opt: {abschnitt:'A', spannung:0, einblenden:0.5}
  stop(ausblenden){},
  spannung(w){},                 // 0..1 -> Ebenen, Wechsel an der Taktgrenze
  abschnitt(name){},             // horizontal, mit Fill an der Taktgrenze
  tempo(bpm){},                  // an der Taktgrenze
  stinger(name){},               // auf die naechste Achtel, mit Ducking
  duck(tiefe,sek){}, daempfen(an){},   // Ducking; Tiefpass fuer Pause/Handy
  takt(){},                      // Planer: setInterval 25 ms + Aufruf aus bild(); nie nachholen
  schlag(){},                    // {schlag,takt,phase} fuer Bild-Sync
  WELLEN:{},                     // Pulswellen 12.5/25/50 % per createPeriodicWave, einmal gebaut
};
```

**Songs als Daten** (Beispiel Club, gekürzt). Pro Zelle ein Ton (`A1`), Pause (`.`) oder Halten (`-`);
Schlagzeug `x` = Schlag, `o` = leise:

```js
const SONGS={
  club:{ bpm:126, schritte:16,
    stimmen:{ bass:{welle:'puls25',laut:.45}, lead:{welle:'puls12',laut:.25,echo:.25},
      arp:{welle:'puls50',laut:.15,arpHz:30}, kick:{art:'kick'}, snare:{art:'snare'}, hat:{art:'hat'} },
    muster:{
      A:{ bass:'A1 . A2 . A1 . A2 . F1 . F2 . G1 . G2 .',
          kick:'x . . . x . . . x . . . x . . .', hat:'. . x . . . x . . . x . . . x o',
          arp: 'Am - - - - - - - F - - - G - - -' },
      B:{ /* wie A, dazu */ lead:'E4 - D4 C4 - A3 - - C4 - D4 - E4 - G4 -' },
      C:{ /* Drop: Bass Achtel, Snare auf 2 und 4 */ },
    },
    folge:['A','A','B','B','A','C','C','B'],
    ebenen:[['bass','kick'],['bass','kick','hat'],['bass','kick','hat','arp'],
            ['bass','kick','hat','arp','lead','snare']],
  },
};
```

Vorschlag Songs: `menue` (Leitmotiv, 100 BPM), `karte` (Spieluhr), `schule` (84 BPM, a-Moll,
Staccato-Bass; Abschnitt `jagd` 126 BPM), `moritz` (118 BPM, Swing), `sprint` (150) und `bus`
(96, tickende Hi-Hat), `tuer` (120, schneller je Treffer, Boss-Abschnitte), `club` (126, Pumpen),
`traum` (70, verstimmt, Echo), `spaeti` (76, Dreieck-Akkorde, Swing), `heimweg` (112→152 nach
Licht, Finale-Abschnitt, Rückung bei Sonnenaufgang). Schlagzeug-Rezepte: Kick = Sinus 150→45 Hz in
90 ms; Snare = Rauschen (Bandpass 1,8 kHz, 120 ms) + Dreieck 180 Hz; Hi-Hat = Rauschen (Hochpass
7 kHz, 30 ms).

## 7. Reihenfolge für die Umsetzung

1. A1 (Notenstau), A4 (Ton merken) – klein, sofort spürbar.
2. A2 + A3 + A5 – Planer und Mischpult; Grundlage für alles Weitere.
3. `saft.js` mit D1, D2, D3, D6 und Einbau in Level 4 (Kampf, kurz, gut messbar), dann in alle.
4. `musik.js` mit B1 + B2, erst ein Song (Club), dann die übrigen; dann B4/B5/B6.
5. Rest nach Prio.

**Abnahme ohne Browser** (über `nachttest.js`, Skripte in `docs/gameplay/messung/`): Notenstau
≤ 2 Knoten; Schleifenlänge je Level ≥ 30 s; mindestens 3 Stimmen und 15 Tonhöhen in Aktionsleveln;
höchstens 32 Knoten gleichzeitig; `KOMFORT.hole('ton')` übersteht einen Seitenwechsel; mit
Flackerschutz liefert `SAFT.blitz` Alpha ≤ 0,12 und mit `wackeln:false` ist `SAFT.versatz()` immer
{0,0}. Hören und Fühlen bleibt dem Browser und dem Handy.

## 8. Quellen

- Steve Swink, *Game Feel* (2009), Kapitel 1: http://mycours.es/gamedesign2014/files/2014/10/Game-Feel-Steve-Swink-chapter-1.pdf
- Jan Willem Nijman, „The Art of Screenshake“ (2013), Zusammenfassungen: http://notebook.maryrosecook.com/Theartofscreenshake,JanWillemNijman.html ,
  https://www.bluetengu.com/2014/12/12/art-of-screenshake-experiments/
- Jonasson & Purho, „Juice it or lose it“ (2012): https://www.gdcvault.com/play/1016487/juice-it-or-lose ,
  https://roblog.co.uk/2024/03/juicy-games/
- Maddy Thorson, Celeste-Thread: https://threadreaderapp.com/thread/1238338574220546049.html ;
  Quelltext: https://github.com/NoelFB/Celeste (Source/Player/Player.cs)
- Sakurai zu Hitstop: https://sourcegaming.info/2015/11/11/thoughts-on-hitstop-sakurais-famitsu-column-vol-490-1/ ;
  Formeln: https://www.ssbwiki.com/Hitlag
- Squirrel Eiserloh, GDC 2016: https://gdcvault.com/play/1023146/Math-for-Game-Programmers-Juicing
  (PDF nicht abrufbar; Inhalt aus Zusammenfassungen und eigenem Wissen)
- Chris Wilson, „A Tale of Two Clocks“: https://web.dev/articles/audio-scheduling
- Adaptive Musik: https://www.thegameaudioco.com/making-your-game-s-music-more-dynamic-vertical-layering-vs-horizontal-resequencing ,
  https://en.wikipedia.org/wiki/Adaptive_music
- Pulswellen: https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createPeriodicWave
- Ducking/Kompressor: https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createDynamicsCompressor
- Wiederholungsmüdigkeit: https://www.asoundeffect.com/game-audio-immersion/
- iOS-Haptik und Audio-Sitzung: https://github.com/jacullmann/schul-dashboard/pull/84 ,
  https://bugs.webkit.org/show_bug.cgi?id=237322
- Eigenes Wissen (nicht einzeln belegt): Schlagzeug-Rezepte aus Rauschen, Penner-Easing,
  Kompressor-Werte, Nachlauf-Balken aus Kampfspielen.
