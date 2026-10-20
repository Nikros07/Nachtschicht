# Gameplay-Plan: weniger monoton, store-reif

Grundlage: `recherche-vorbilder.md`, `recherche-spielgefuehl.md`, `recherche-store.md`,
`messung-a/b/c.md`. Kurz gemessen: vier von acht Leveln spielen sich mit „Laufen + E“, die Musik
ist je Level **eine** 16-Schritt-Bassline (wiederholt sich alle 2–3 s, ~1000-mal pro Nacht), es gibt
keinen Rang und keinen Grund zum Wiederholen, und außerhalb der Kämpfe antwortet die Welt kaum.

**Leitidee:** Jede Sekunde soll antworten (Saft), jede Minute soll sich anders anhören (Musik), jedes
Level soll ein eigenes Ding haben (ein neues Element) und jedes Ende eine Note (Rang).

Umsetzung in drei Stufen. Stufe 1 (Engine) muss stehen, bevor Stufe 2 (Level) beginnt.

---

## Stufe 1 — Engine (vier neue Dateien, unabhängig voneinander)

Alle: klassische Scripts, keine Module; fehlertolerant (fehlt `AC`, `document`, ein Level-Haken:
nichts passiert, keine Ausnahme); laufen unter `tools/nachttest.js` (dort ist `AudioContext`
undefined); öffentliche API als Kommentar im Dateikopf; Stellschrauben in einem `*_TUNE`-Block oben;
eigener Test `test/<name>.test.js` ohne Browser (mit kleinen Attrappen). Blitze/Wackeln nur über `FX`
(`nacht/komfort.js`). Canvas-Text nur Großbuchstaben ohne Umlaute.

Einbindung und Haken in `nacht/kern.js` macht die Integration (nicht die Bauer):
```js
// in bild(): vor update
if(window.SAFT) dt=SAFT.takt(dt);          // Hitstop/Zeitlupe
if(window.MUSIK) MUSIK.takt();             // Planer (zusätzlich setInterval 25 ms in musik.js)
// draw mit Wackeln:
const v=window.SAFT?SAFT.versatz():{x:0,y:0}; ctx.save(); ctx.translate(v.x,v.y); draw(dt); ctx.restore();
if(window.SAFT) SAFT.zeichne();            // Teilchen, Popups, Blitz, Rand (Bildschirmkoordinaten)
if(window.WERTUNG) WERTUNG.zeichne();      // Rang-Tafel
```
Ladereihenfolge: `musik` und `saft` nach `komfort`, `songs` nach `musik`, `wertung` nach `epilog`.

### E1 `nacht/musik.js` — Sequencer (nur Engine, keine Songs)

```
MUSIK.spiele(id)        // Song aus SONGS[id]; gleicher Song wie jetzt: nichts tun (idempotent,
                        // wird jedes Bild gerufen). Anderer Song: Wechsel an der nächsten Taktgrenze.
MUSIK.stop()
MUSIK.spannung(w)       // 0..1 -> Ebene = min(n-1, floor(w*n)), n = song.ebenen.length; Wechsel an Taktgrenze
MUSIK.abschnitt(name)   // an der nächsten Taktgrenze in Abschnitt `name`; von dort läuft song.folge weiter
                        // (steht `name` nicht in der Folge: dieser Abschnitt in Schleife, bis abschnitt(null))
MUSIK.tempo(bpm)        // ab nächster Taktgrenze; MUSIK.tempo(null) = Song-Tempo
MUSIK.stinger(name)     // 'fund','sieg','fail','rang','alarm','combo': 3-6 Töne auf die nächste Achtel,
                        // Musik währenddessen auf 40 % geduckt
MUSIK.daempfen(an)      // Tiefpass 900 Hz + leiser (Pause, Handy, Kapitelkarte)
MUSIK.takt()            // Planer: plant alles bis currentTime+0.12. NIE nachholen: liegt `naechster`
                        // in der Vergangenheit, auf currentTime+0.05 setzen (Notenstau-Fix).
MUSIK.schlag()          // {bpm, schritt 0..15, takt, bisSchlag: Sekunden bis zum nächsten Viertel,
                        //  seitSchlag: Sekunden seit dem letzten Viertel} - für Tanzen im Takt
MUSIK.aktuell()         // {song, abschnitt, ebene}
```
- Läuft nur, wenn `AC` (aus `ton.js`) existiert und `!muted`. Bei `muted` rückt die Zeit weiter,
  ohne zu spielen. Eigener `GainNode` `musikBus` (Lautstärke `MUSIK_TUNE.laut=0.5`) -> `AC.destination`.
- `setInterval(MUSIK.takt,25)` beim Laden (nur wenn `typeof setInterval==='function'`).
- Klänge: Oszillator mit Hüllkurve (Attack 5 ms, Release nach Notendauer); Pulswellen 12,5/25/50 %
  über `createPeriodicWave`, einmal gebaut, Namen `'puls12'`, `'puls25'`, `'puls50'`, dazu `'square'`,
  `'triangle'`, `'sine'`, `'sawtooth'`. Schlagzeug: **ein** Rauschpuffer (1 s), einmal gebaut;
  Kick = Sinus 150→45 Hz in 90 ms; Snare = Rauschen Bandpass 1800 Hz 120 ms + Dreieck 180 Hz;
  Hi-Hat = Rauschen Hochpass 7000 Hz 30 ms (offen `'O'`: 120 ms). Höchstens 32 gleichzeitige Knoten.
- **Song-Format** (Daten stehen in `nacht/songs.js`, E2):
```js
SONGS.club={ bpm:126, schritte:16, swing:0,          // swing 0..0.3: jede zweite Sechzehntel später
  abschnitte:{
    A:{ akkorde:['Am','F','C','G'],                   // je Takt ein Akkord (Grundton A-G, #/b, m=Moll, 7)
        bass:'puls', drums:'club', arp:'auf',          // Stil-Namen aus den Tabellen unten
        lead:null },                                   // oder ein String je Takt (s. u.)
    B:{ akkorde:['F','G','Am','Am'], bass:'achtel', drums:'club', arp:'auf',
        lead:['E5 - - . D5 - C5 - . . A4 - C5 - D5 -', '...', '...', '...'] },
  },
  folge:['A','A','B','B'],
  ebenen:[['bass'],['bass','drums'],['bass','drums','arp'],['bass','drums','arp','lead']],
  klang:{ bass:'puls25', arp:'puls12', lead:'puls50' }, // optional
  laut:{ bass:.20, arp:.06, lead:.10, drums:1 } };     // optional
```
  Lead-String: 16 Zellen je Takt, getrennt durch Leerzeichen: Note (`A4`, `C#5`, `Bb3`), `.` Pause,
  `-` Halten. Notenfrequenz `440*2^((midi-69)/12)`.
- **Stil-Tabellen in musik.js** (je 16 Zeichen, `x` Schlag, `o` leise, `.` nichts):
  - `bass`: `halbe` (Grundton auf 1 und 9), `puls` (Achtel Grundton), `achtel` (Achtel Grundton/Oktave
    im Wechsel), `galopp` (`x.xx` je Viertel), `walk` (Grundton, Terz, Quinte, Sexte je Viertel),
    `drohn` (ganzer Takt gehalten), `schleich` (Grundton auf 1, Quinte auf 7, Grundton auf 11).
  - `drums`: `club` (Kick 4/4, Snare 2+4, offene Hat auf den Off-Beats), `rock` (Kick 1+3, Snare 2+4,
    Achtel-Hat), `schleich` (nur leise Hat Achtel, Kick auf 1), `sprint` (Kick Achtel, Snare 2+4,
    Sechzehntel-Hat), `swing` (Ride-artige Hat, Kick 1+3), `traum` (Kick 1, Hat auf 7 und 15),
    `aus` (nichts).
  - `arp`: `auf` (Akkordtöne aufwärts, Sechzehntel), `ab`, `wechsel` (Grundton/Quinte), `akkord`
    (alle drei Töne als kurzer Akkord auf 1 und 9), `aus`.

### E2 `nacht/songs.js` — die Songs (nur Daten)

`const SONGS={...}` im Format oben, für diese IDs. Mindestens zwei Abschnitte je Song, Folge mit
mindestens 8 Takten Länge (Schleife ≥ 15 s), mindestens drei Ebenen, Lead in mindestens einem
Abschnitt. Eigene, einprägsame Melodien (keine bekannten Lieder nachspielen).

| ID | Charakter | bpm | Abschnitte |
|:--|:--|--:|:--|
| `menue` | Leitmotiv der Nacht, wehmütig-cool | 100 | A, B |
| `karte` | Spieluhr, leise, Dur | 90 | A, B |
| `schule` | Schleichen, a-Moll, Staccato | 84 | A, B, **`jagd`** (126 bpm-Gefühl über `drums:'sprint'`, `bass:'achtel'`) |
| `moritz` | Wohnungsparty, Swing, gute Laune | 118 | A, B, **`kampf`** |
| `sprint` | Hetze zum Bus | 150 | A, B |
| `bus` | angespannt, tickend | 96 | A, B, **`alarm`** |
| `tuer` | Boss, treibend | 120 | A, **`phase2`**, **`phase3`** |
| `club` | Pumpen, Party | 126 | A, B, **`drop`**, **`dj`** (anderer Groove) |
| `traum` | verstimmt, langsam, Echo-Gefühl | 70 | A, B |
| `spaeti` | Ruhe, Swing, Dreieck | 76 | A, B |
| `heimweg` | Aufbruch, Dur-Wendung | 112 | A, B, **`finale`** |

### E3 `nacht/saft.js` — Spielgefühl (Bildschirmkoordinaten)

```
SAFT.takt(dt) -> dt'    // 0 während Stopp, dt*faktor in Zeitlupe; Effekte selbst laufen in echter Zeit
SAFT.stop(sek)          // Hitstop, höchstens SAFT_TUNE.stopMax=0.15
SAFT.zeitlupe(faktor,sek)
SAFT.trauma(m)          // 0..1 addieren (max 1); Wackeln = trauma^2 * wackelPx(5), glatt (Sinus-Rauschen
                        // statt Zufall je Bild), Abbau 1.2/s; Ergebnis durch FX.wackel()
SAFT.versatz()          // {x,y} ganzzahlig; {0,0} bei KOMFORT wackeln:false
SAFT.teilchen(art,x,y,n,richtung)  // art: 'staub','funken','konfetti','schweiss','glas','herz','stern','rauch'
                        // feste Pools (keine Allokation je Bild), höchstens 240 Teilchen
SAFT.popup(txt,x,y,farbe)          // steigt 14 px auf, 0.9 s, mit dunkler Kontur (text()/outline aus bild.js)
SAFT.blitz(farbe,alpha,dauer)      // Alpha durch FX.blitz()
SAFT.rand(farbe,alpha)              // Vignette am Rand (Schaden), klingt in 0.4 s ab
SAFT.zeichne()          // von kern.js nach draw(): Teilchen, Popups, Blitz, Rand
SAFT.leeren()
// Rezepte - das, was Level aufrufen:
SAFT.treffer(x,y,richtung,wucht)   // stop(0.04+0.06*wucht), trauma(0.25+0.35*wucht), funken, vibrieren
SAFT.landung(x,y,wucht)            // staub
SAFT.fund(x,y,txt)                 // konfetti/sterne, goldener Blitz (schwach), popup(txt), MUSIK.stinger('fund')
SAFT.schaden(wucht)                // roter Rand, trauma, vibrieren
SAFT.erfolg(x,y,txt)               // kleiner: sterne + popup, ohne Blitz
```
Vibrieren nur über `typeof mobilVibriere==='function'`. `MUSIK.stinger` nur über `typeof MUSIK`.
Flackerschutz: mit `KOMFORT flackerschutz:true` nie Alpha > 0.12 und höchstens 3 Blitze pro Sekunde.

### E4 `nacht/wertung.js` — Rang am Levelende

```
WERTUNG.abschluss(level, punkte, zeilen)  // level 1..8, punkte 0..100 (das Level rechnet),
                        // zeilen: bis zu 4 {name:'ZEIT', wert:'1:42', pkt:30}
                        // -> {rang:'S'|'A'|'B'|'C', neuerBest:bool}; Grenzen S>=90, A>=75, B>=55, sonst C
                        // speichert Bestrang 'nachtschicht.rang'+level (bleibt bei NEUE NACHT erhalten)
WERTUNG.best(level)     // 'S'|'A'|'B'|'C'|null
WERTUNG.zeichne()       // von kern.js: nur wenn aktiv UND typeof S!=='undefined' && S.modus==='ende'
                        // 0-2.2 s: dunkle Tafel mittig, Zeilen erscheinen nacheinander (Punkte zählen hoch),
                        // dann großer Rang-Buchstabe (Schriftgröße 5) mit MUSIK.stinger('rang') und
                        // SAFT.teilchen('konfetti') bei S/A; danach schrumpft die Tafel zu einem
                        // Abzeichen oben rechts "RANG A" (+ "NEU!" bei neuerBest)
WERTUNG.reset()         // aktiv=false (Level ruft es in neuesSpiel)
WERTUNG.alle()          // {1:'A',2:null,...}
```
Kein Rang ist „durchgefallen“. Außerdem: in `nacht/menue.js` zeigt LEVEL WAEHLEN hinter jedem
Level den Bestrang (`WERTUNG.best(n)`), wenn vorhanden — nur diese eine Stelle anfassen.

---

## Stufe 2 — je Level (ein Agent je Datei)

Für **jedes** Level gilt:
1. **Musik:** den Inhalt von `function musik()` ersetzen durch `MUSIK.spiele('<id>')` plus
   Spannung/Abschnitt nach Spielzustand (siehe Tabelle). Die alten `BASS`-Reihen löschen.
   Bei Pause/Handy/Kapitelkarte: `MUSIK.daempfen(true)`, sonst `false`.
2. **Saft:** an mindestens 6 Stellen: Treffer, Schaden, Funde/Erfolge, Landung nach Sprung,
   Erwischtwerden, Levelziel. Koordinaten in Bildschirm (`x - S.kamX`). Altes eigenes Zufalls-
   Wackeln im Level durch `SAFT.trauma()` ersetzen (Level 4 hat kein `S.kamX`).
3. **Rang:** in `levelGeschafft()` `WERTUNG.abschluss(n, punkte, zeilen)` mit den Kriterien unten
   (S nur bei wirklich gutem Spiel erreichbar, C immer); in `neuesSpiel()` `WERTUNG.reset()`.
4. **Ein neues Element** (Tabelle). TUNE-Werte im TUNE-Block. Am Handy bedienbar
   (`mobilKontext()` liefert die Aufschrift), ein Schritt in `LEKTIONEN` (nacht/lehre.js) **nicht**
   nötig - stattdessen ein `zeigeHinweis()` beim ersten Mal.
5. Story, Kapitelkarte, Plausch, Polaroids, Flags bleiben. Kampftest und Konter-Test bleiben grün.

| Level | Song, Spannung/Abschnitt | Neues Element | Rang-Kriterien (Summe 100) |
|:--|:--|:--|:--|
| 1 Schule `index.html` | `schule`; Spannung = Nähe des nächsten Lehrers; `jagd` bei Verfolgung | **Flucht nach dem Schlüssel** (Pizza Tower): sobald der Schlüssel da ist, Durchsage `HAUSMEISTER SCHLIESST AB!`, Countdown `TUNE.fluchtSek=35` groß im HUD, Musik `jagd`, Lehrer ×1.25 schneller; Ablauf = Scheitern wie bei der Uhr | Zeit 40, nie Alarm 30, Herzen 15, Funde 15 |
| 2 Moritz `level2.html` | `moritz`; Spannung steigt mit erledigten Aufgaben; `kampf` an der Tür | **Aufgabenliste mit Durchstreichen** (Untitled Goose Game): HUD-Liste, Haken mit Durchstreich-Animation + `SAFT.erfolg`, zwei versteckte Einträge `???` (`MUSIK LAUTER` = Musikbox anfassen, `FINN ZUDECKEN` = beim Schläfer E nach dem Wecken), plus **Einschenk-Mikrospiel** an den Getränken: E halten füllt das Glas, loslassen in der grünen Zone = PERFEKT (weniger Pegel, +Mut), drüber = verschüttet | Zeit 30, Aufgaben 30, versteckte 15, Treffer im Kampf 25 |
| 3 Bus `level3.html` | `sprint` beim Sprint, `bus` im Bus, `alarm` bei Verdacht > 70 % | **Sofortneustart** (Hotline Miami): scheitert man im Bus, startet NOCHMAL direkt im Bus (Pegel vom Einstieg, kein Titel, kein Sprint); Ende-Bildschirm: Hauptknopf `NOCHMAL AB BUS`, `zwei`: `GANZ VON VORN`. Dazu **Kurven** (Overcooked): alle `TUNE.kurveAlle=10` s `KURVE!` mit 1 s Vorwarnung, dann 0.8 s Schub `TUNE.kurveSchub=70` px/s; im Versteck kein Schub | Zeit 30, Verdacht max niedrig 30, nie erwischt 25, Funde 15 |
| 4 Schlange `level4.html` | `tuer`; `phase2`/`phase3` bei Bossphase; Tempo +4 bpm je Treffer des Spielers | **Combo + Phasen-Ansage** (Scott Pilgrim): Konter in Folge ohne Treffer = Combo, Popup `X2`, `X3`…, Stinger `combo` ab 3; Konter im letzten Drittel des Fensters = `PERFEKT!` mit stärkerem Saft; Phasenwechsel: 1 s Zeitlupe, große Ansage `PHASE 2` + Satz des Türstehers | Konterquote 35, Treffer kassiert 30, beste Combo 20, Zeit 15 |
| 5 Club `level5.html` | `club`; Spannung = Pegel; `drop` auf der Tanzfläche; `dj` beim DJ-Ereignis | **Tanzen im Takt** (Rhythm Heaven): auf der Tanzfläche E bzw. Hauptknopf `TANZEN` auf den Schlag (`MUSIK.schlag()`, Fenster `TUNE.tanzFenster=0.10` s), Treffer = Tanzpose + Popup, 8 in Folge = Ruf +3 und Confidence; daneben = Combo weg. Ohne Musik (stumm): sichtbarer Taktpunkt. Dazu **Ereignisse wirken** (WarioWare): die Club-Ereignisse bekommen Wirkung (Licht aus 4 s dunkel, Nebel = halbe Sicht 6 s, DJ = Abschnitt `dj` 16 s, Shot gratis 10 s) | Flirt-Ergebnis 35, beste Tanz-Combo 25, Ruf 20, Zeit 20 |
| 6 Traum `level6.html` | `traum`; Spannung = Müdigkeit | **Schwebesprung** (Night in the Woods): Sprung mit `TUNE.traumGrav` = ein Drittel, Halten = langsames Sinken; drei schwebende Erinnerungs-Lichter hoch oben (optional, je +Wachheit, Popup) | Erinnerungen 40, Lichter 25, Wachheit am Ende 20, Zeit 15 |
| 7 Späti `level7.html` | `spaeti`; Spannung niedrig | **Pfandwurf** (Kirmes): an der Pfandkiste E halten = pendelnde Kraftanzeige, loslassen = Flasche fliegt im Bogen in den Container; Treffer +0,25 € und Combo, 5 Flaschen je Runde. Dazu **Einkaufsliste** wie Level 2 (Wasser, Snack, Pfand, Bank-Runde) | Liste 40, Wurf-Treffer 30, Gespräche 15, Zeit 15 |
| 8 Heimweg `level8.html` | `heimweg`; Tempo 112→152 mit dem Licht (`MUSIK.tempo`); `finale` im Finale | **Neustart am Abschnitt**: Scheitern im Kampf oder Wettlauf startet direkt dort neu (kein Intro, keine Konfrontation erneut); **Finale-Phasen-Ansage** wie Level 4 | Licht bei Ankunft 40, Kampf 30, Tschüss gesagt 15, Zeit 15 |
| Karte `karte.html` | `karte` | Bestrang je Station anzeigen (`WERTUNG.best(n)`) | – |
| Menü (`menue.js`) | `menue` im Startmenü | – (macht die Integration) | – |

Rang-Rechnung je Kriterium linear zwischen „schlecht“ und „sehr gut“ (Werte im TUNE als
`rang:{...}`), Summe gerundet.

---

## Stufe 3 — Store (nach Stufe 2)

- `package.json`, `capacitor.config.json` (appId `de.nachtschicht.spiel` als Platzhalter,
  webDir `www`, Querformat, kein Splash-Spinner), `tools/www.py` (kopiert genau die Laufzeitdateien
  wie `tools/paket.py` nach `www/`), `www/` in `.gitignore`, `docs/store/ANLEITUNG.md`
  (Android Studio installieren, `npx cap add android`, Signieren, Play-Testpflicht 12 Tester/14 Tage;
  iOS nur mit Mac/Cloud-Mac), `docs/store/texte.md` (Kurz-/Langbeschreibung, Schlagworte,
  Altersfreigabe-Antworten als Entscheidung), Datenschutz-Seite verlinken.
- **Pausemenü auch am Rechner** (Esc): WEITER, NEU STARTEN, EINSTELLUNGEN, ZUM MENÜ.

---

## Abnahme (ohne Browser messbar)

- `node tools/nachttest.js` grün, alle `test/*.test.js` grün, `node tools/launchcheck.js` BEREIT.
- Musik-Test: Notenstau ≤ 2 Knoten nach 5 s Stillstand; je Song Schleife ≥ 15 s, ≥ 3 Ebenen,
  ≥ 12 Tonhöhen; ≤ 32 Knoten gleichzeitig.
- Saft-Test: mit Flackerschutz Alpha ≤ 0.12; mit `wackeln:false` immer `{0,0}`.
- Je Level: Bot-Lauf bis zum Ende ruft `WERTUNG.abschluss` genau einmal, Rang in S/A/B/C.
- Im Browser (danach, durch den Orchestrator): Hören, Fühlen, Handy.
