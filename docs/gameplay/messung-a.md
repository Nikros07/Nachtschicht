# Messung A — Monotonie in Level 1 bis 3

Stand: 2026-10-06 (begonnen 2026-10-05), reiner Analyse-Lauf (keine Spieldatei geändert).
Messskripte liegen in `docs/gameplay/messung/`, Start immer aus der Projektwurzel:

```bash
node docs/gameplay/messung/a-level1.js            # 96 Bot-Läufe Schule, Zusammenfassung
node docs/gameplay/messung/a-level1.js --lauf 0   # ein Lauf mit Ereignisprotokoll (--renner, --werfen, --springen)
node docs/gameplay/messung/a-level2.js            # Bei Moritz, 96 Läufe (--lauf N, --kenner, --klein, --mittel, --warten)
node docs/gameplay/messung/a-level3.js            # Nachtbus, 144 Läufe (--lauf N, --vorsichtig|--redner, --nichtspringen, --kampf|--zahlen)
node docs/gameplay/messung/a-kloppe.js            # Level 3: die Kloppe isoliert, 4 Taktiken x 10
node docs/gameplay/messung/a-raumzeit.js          # Level 1: Anteil der Spielzeit in (gefahrlosen) Räumen
node docs/gameplay/messung/a-druckluecke.js       # alle drei: längste Strecke ohne Gefahr ODER Wahl
node docs/gameplay/messung/a-pruefung.js          # 15 Gegenproben zu Code-Befunden und Bugs (~10 s)
```

`a-helfer.js` lädt die Seite über `tools/nachttest.js`, ersetzt den AudioContext durch eine
Attrappe, die **jeden Ton** mitschreibt (Musik und Effekte getrennt), und zeichnet in jedem Bild
einen Schnappschuss auf. Daraus entstehen Ereignisse mit Zeitstempel: Moduswechsel, Meldungen,
Hinweise, Gesprächsknoten, Plausch, Karten, Treffer, Wackeln, Blitz und levelspezifische Funde.

**Ereignisklassen.** *info* = neue Information (Fund, Hinweis, Gespräch, Plausch, Karte),
*entscheidung* = Gesprächsknoten mit Wahl, *herausforderung* = neue Gefahr (Lehrer bemerkt
dich, Jagd, Treffer, Kontrolleur-Alarm, Angriff), *quittung* = reine Bestätigung ohne Inhalt
(„NICHTS DRIN“, „ETAGE 2“, „VERSTECKT“, „AUA“), *fx* = Wackeln oder Blitz.
**„Längste Leere“** = längste Strecke ohne *info*, *entscheidung* oder *herausforderung*,
gemessen nur in der Spielphase (ohne Titel, Intro und Abspann).

Grenzen der Messung: `setTimeout` ist im Prüfstand stumm. Zeitversetzte Töne (der 2. und 3. Ton
von `SFX.fund`) und zeitversetzte Hinweise (Level 1: „LEISE GEHEN HALBIERT…“ nach 4,2 s) fehlen
im Protokoll. Pixel und Klang selbst misst der Prüfstand nicht. Die Bots sind keine Menschen: Sie
lesen Texte in fester Zeit (0,6 s + 1/16 s je Zeichen), reagieren im Kampf in 0,40–0,80 s und kennen
die Karte. Zeiten sind daher eher untere Grenzen für Erstspieler.

---

## Kurzfassung — warum sich Level 1 bis 3 monoton anfühlen

Acht Befunde gelten levelübergreifend. Jeder ist unten mit Zahl und Zeile belegt.

1. **Die Uhr ist Deko.** Level 1: 165 s Uhr, längster Sieg 129,7 s, 1 von 56 Läufen an der Uhr
   gescheitert. Level 2: 190 s Uhr, längster Sieg 97,4 s, 0 von 96. Level 3: Sprint 34 s Limit,
   gebraucht 14–17,2 s, auch **ohne einen einzigen Sprung**. Trotzdem steht zweimal „GERADE NOCH“
   auf dem Endbild.
2. **Die Welt friert ein, sobald man etwas tut.** Level 1: Im Raum laufen keine Lehrer
   (`update()` Z. 847) — 45–60 % (Median 54 %) der Spielzeit. Level 2: Zeilen-Gespräche halten alles an —
   42,5 % der freien Zeit. Level 3: Jeder Dialog hält den Bus an (Z. 1305). Tätigkeit und Gefahr
   überlappen nie; Spannung entsteht nur auf dem Weg zwischen zwei Tätigkeiten.
3. **Scheitern bestraft mit Vorspann, nicht mit der schweren Stelle.** Level 1: neu ab Titel und
   18-s-Intro. Level 2: K.o. im Kampf → Intro und alle Botengänge noch einmal, rund 50–120 s bis zum nächsten Kampfversuch.
   Level 3: Niederlage im Bus → Intro und der ungefährliche Sprint noch einmal. Die schwerste Stelle
   liegt immer am weitesten vom Neustart entfernt.
4. **Ein Knopf, zwei Verben.** Gemessen dominieren je Level *laufen* und *E*. In Level 2 macht E
   sechs Dinge (reden, suchen, trinken, nehmen, kontern, Tür); 48 % aller wirksamen E-Drücke sind „Text weiter“.
5. **Lange Strecken ohne Forderung.** Längste Strecke ohne Gefahr oder Wahl (`a-druckluecke.js`):
   Level 1 22–122 s, Level 2 36–67 s, Level 3 8–14 s. Level 3 ist dicht, Level 1 und 2 sind es nicht.
6. **Musik: eine 16-Schritt-Schleife je Level** (1,9–3,2 s, 4–5 Tonhöhen, 1–3 Stimmen), je Lauf 14- bis
   48-mal hintereinander. Ausgerechnet in den Höhepunkten (Kampf in Level 2, Sprint in Level 3) wird sie
   **dünner** statt dichter.
7. **Belohnung ist eine Zahl.** Endbilder zeigen Zeit, Bestzeit, Pegel, Crew — kein Rang, keine Liste
   verpasster Geheimnisse, und die Abspänne ignorieren, wie man gespielt hat.
8. **Variation sinkt von Level zu Level.** Level 1: Schlüsselort und zwei Spielarten zufällig.
   Level 2: zwei Fundorte zufällig. Level 3: praktisch deterministisch (Kontrolleure bei jedem
   Startwert an derselben Stelle, Gegenprobe L3c).

Passivzeit (Kapitelkarte + Intro + Abspann): Level 1 66,6 s, Level 2 44,5 s, Level 3 24,9 s.

**Größte Hebel** (wenig Code, viel Wirkung — Details in den Ideen je Level):

1. **Neustart an der schweren Stelle**: Level 1 ohne Intro, Level 2 direkt am Kampf, Level 3 direkt im
   Bus. Je eine Stelle in `druckSprung()`/`druckAktion()`.
2. **Gefahr in die Tätigkeit holen**: Lehrer kommen in Räume (Level 1), Gäste blockieren die Wohnung
   (Level 2), Kontrolleure gewürfelt statt fest (Level 3).
3. **Uhren straffen und mit Ereignissen füllen**: Level 1 ~110 s, Level 2 ~120 s, Sprint ~22 s.
4. **Musik nach Lage schichten** statt ausdünnen (Verdacht, Kampf, Sprint bekommen mehr Stimmen).
5. **Endbild mit Rang und „Geheimnisse x/y“, Abspann nach Verlauf.**
6. **Sofort-Bugs**: falsche Sprungtaste im Sprint-Hinweis (Level 3), überschriebene
   Schlüsselmeldung und weiterlaufende Uhr auf dem Endbild (Level 1).

---

## Level 1 — Die Schule (`index.html`)

### Messaufbau

Ein Bot spielt mit dem Wissen eines Spielers: Raum für Raum, alle Möbel durchsuchen,
Zettel-Hinweise nutzen (Stufe 1 → Etage, Stufe 2 → Raum), Treppe nehmen, zum Ausgang.
Profil **vorsichtig** schleicht, wenn ein Lehrer in Blickrichtung näher als ~110 px ist, und flieht in
den nächsten Spind. Profil **renner** ignoriert die Lehrer. In der Hausmeister-Spielart (50 % der
Runden) gibt es drei Unterprofile: *reden* (ansprechen, Standardwahl ablaufen lassen),
*werfen* (R hinter ihn, dann klauen), *springen* (neben ihm springen, dann E). 16 Startwerte je
Kombination, 56 ausgewertete Läufe.

### Ergebnisse

| Gruppe | Läufe | gewonnen | Spielzeit min / Median / max | Gesamt inkl. Intro + Abspann (Median) |
|:--|--:|--:|:--|--:|
| vorsichtig, Raum-Spielart | 10 | 9 | 37,9 / 53,1 / 129,7 s | 119,8 s |
| renner, Raum-Spielart | 10 | 8 | 24,3 / 42,9 / 98 s | 106,5 s |
| vorsichtig, Hausmeister reden | 6 | 4 | 16,1 / 24,6 / 42,4 s | 123,2 s |
| vorsichtig, Hausmeister werfen | 6 | 3 | 30,0 / 31,2 / 32,5 s | 91,2 s |
| renner, Hausmeister werfen | 6 | 6 | **5,7** / 19,0 / 19,0 s | 82,7 s |
| Hausmeister springen (beide) | 12 | 4 | 12,3 / 19–27 / 45,6 s | 83–93 s |

- **Spielzeit** (Uhr `S.zeit`, nur Siege): Median **19–53 s**. Der längste Sieg dauerte 129,7 s – die
  Uhr steht auf **165 s** (`TUNE.levelSekunden`). Die Uhr war in **keinem** der 35 Siege knapp;
  nur ein einziger Lauf (von 56) endete an „DER HAUSMEISTER HAT ABGESCHLOSSEN“.
- **Zuschauen > Spielen:** Kapitelkarte 3,5 s + Intro **18,0 s** (7 Tafeln, `INTRO`) + Abspann
  **45,1 s** (22 Tafeln, `SZENEN`) = **66,6 s Passivzeit**. In der Hausmeister-Spielart stehen
  dem 19–31 s Spiel gegenüber: **rund 70 % der Levelzeit ist Lesen/Zuschauen**.
- **Durchsuchen ist meistens leer:** je Lauf (Raum-Spielart) 14,3 Durchsuchungen, davon
  **9,4 „NICHTS DRIN“ = 66 %**. Jede Leer-Suche hat dieselbe Rückmeldung (`SFX.nichts` 220 Hz,
  Text „NICHTS DRIN“, 0,75 s Warten), kein Unterschied zwischen Möbeln.
- **Längste Leere:** Median je Lauf 9–11 s, Maximum **25,0 s** (Erdgeschoss, drei Räume
  durchsucht ohne Fund: „AKKU +40“ → … → „SEKRETARIAT“). Mit Quittungen gezählt (jede Meldung
  zählt) höchstens 8–9 s – es *passiert* also etwas, aber es ist nichts Neues.
- **Ereignisse je Lauf (Mittel):** 15,8 Info, 9,0 Quittung, 6,8 Gefahr, **0,9 Entscheidung**, 7,9 Effekte.

### Verben (Eingaben mit Wirkung, Summe über 56 Läufe)

| Verb | Drücke | je Lauf |
|:--|--:|--:|
| durchsuchen (E im Raum) | 293 | 5,2 |
| Tür rein / Raum verlassen | 100 / 98 | 1,8 / 1,8 |
| Gespräch weiter / wählen | 90 / 6 | 1,6 / 0,1 |
| weiter nach Fang | 71 | 1,3 |
| Treppe (W/S) | 52 | 0,9 |
| Spind rein / raus | 30 / 30 | 0,5 / 0,5 |
| klauen / ansprechen (Hausmeister) | 25 / 15 | 0,4 / 0,3 |
| Code-Ziffer / Code probieren | 15 / 2 | 0,3 / 0,04 |
| werfen (R) / springen | 12 / 16 | 0,2 / 0,3 |
| laufen / schleichen (gehalten) | 910 s / 198 s | — |

Theoretisch 11 Verben (laufen, schleichen, springen, Treppe, Tür, durchsuchen, Spind, werfen,
Lampe, Code, reden). **Gemessen dominieren zwei: laufen und E-durchsuchen.** Lampe (Q) braucht
der Bot nie: Die dunkle Etage (`dunkleEtage`) wirkt nur auf die Sicht des Spielers, nicht auf
die Lösung. Werfen ist nur in der Hausmeister-Spielart nützlich.

### Scheitern

- 3 Herzen. Erwischt = −1 Herz, **+14 s** Uhr (`TUNE.zeitstrafe`), Teleport an die nächste Treppe
  (`weiterNachFang`, Zeile 1444–1449).
- **Ein Fang ist fast kostenlos:** Die Uhr wird nie knapp (s. o.), und der Teleport setzt im
  Erdgeschoss rechts auf x = 686 – **38 px neben den Ausgang** (x = 648). Wer mit Schlüssel
  erwischt wird, steht danach näher am Ziel als vorher (Lauf `--lauf 1 --renner --springen`:
  gefangen bei 26,5 s, Ausgang bei 28,1 s).
- Endgültig scheitern: 0 Herzen oder 17:30. Gemessen: 21 von 56 Läufen verloren, davon
  **9 × „DER HAUSMEISTER HAT DICH“** – wer ihn frontal anspricht, wird vorher gesehen
  (Verdacht 1,9/s, Annäherung 130 px/s → Alarm nach 0,53 s, Kontakt nach 0,63 s).
- Nach dem Scheitern: Titelbild → Leertaste → **18 s Intro erneut** (`starte()` Zeile 622).
  Ein E-Tipp springt eine Tafel weiter (Gegenprobe L1f), erst E halten (0,5 s) überspringt alles.
  Beim fünften Versuch sind das sieben Tipps oder ein Halten — vor jedem einzelnen Versuch.

### Wo die Spannung fehlt: Raumzeit und Druck

- **Räume sind gefahrlos.** `update()` Z. 847 kehrt im Modus `raum` zurück, bevor `lehrerLogik()`
  läuft. Gegenprobe L1b: Alle vier Lehrer stehen nach 6 s im Raum auf demselben Pixel, die Uhr läuft
  6 s weiter. `a-raumzeit.js`: In der Raum-Spielart verbringt der Bot **45 / 54 / 60 %** (min/Median/max,
  10 Läufe) der Spielphase in Räumen. Die Hälfte des Levels hat also null Gefahr; Suchen und Schleichen
  finden nie gleichzeitig statt.
- **Die erste Forderung kommt spät.** Längste Strecke ohne Gefahr oder Wahl (`a-druckluecke.js`):
  vorsichtig 26,5 / 61,1 / 121,9 s (drei Läufe), renner 21,7 s — jeweils **ab Spielbeginn** bis zum
  ersten „Lehrer bemerkt dich“. Entscheidungen gibt es im Mittel 0,9 je Lauf, fast nur das
  Direktor- oder Hausmeister-Gespräch.

### Musik, Rückmeldung, Belohnung

**Musik** (`musik()` Z. 300, `BASS` Z. 297): 16 Schritte bei 74 BPM = **3,24 s Schleife**, vier
Tonhöhen (98/87/73/82 Hz), eine Rechteckstimme, Lautstärke 0,018. Kein Schlagzeug, keine Melodie,
keine Abschnitte. Bei 53 s Spielzeit läuft sie 16-mal. Nur während einer Jagd wechselt sie auf
`BASS_JAGD` (Z. 298, 126 BPM, 1,9 s) mit Dreieck-Akzent auf jedem Viertel. Im Raum klingt alles wie
im Flur.

**Rückmeldung je Aktion** (aus dem Code, Ton aus der Ton-Attrappe):

| Aktion | Ton | Bild | Text |
|:--|:--|:--|:--|
| Laufen | Dreieck 90–110 Hz jeden 2. Schritt | Laufanimation | – |
| Springen / Landen | 430 Hz / 160 Hz | Staub 5 / 7 Partikel | – (Landen macht Lärm) |
| Tür | Glissando 300→140 Hz + Rauschen | Blende | Raumname |
| Durchsuchen | Rauschen 0,14 s | Balken 0,75 s | – |
| Fund | 880 Hz (+ zwei Töne per `setTimeout`) | Blitz 0,35–1,0 | Fundtext |
| Leer | 220 Hz Sinus | – | NICHTS DRIN |
| Lehrer bemerkt dich | 2 × 1200 Hz | Verdachtsanzeige | – |
| Jagd beginnt | Glissando 200→900 Hz | Wackeln 4 (Direktor 6) | – , Jagdmusik |
| Gefangen | Glissando + Rauschen | Wackeln 6, Fangbild | EIN LEHRER HAT DICH |
| Werfen | 300 Hz | Flugbahn, Staub 6 beim Aufprall | GEWORFEN |
| Spind | Tür-Klang | Figur verschwindet | VERSTECKT |
| Code falsch / richtig | 220 Hz / Fund | Wackeln 3 / Blitz 0,6 | Text |
| Sieg | Vier-Ton-Arpeggio | – | Endbild |

Partikel gibt es nur als Staub (Sprung, Landen, Wurf). Hitstop gibt es nicht (kein Kampf im Level).
Gemessen 93 Effekttöne je Minute (Median) — vor allem Schritte und Rauschen.

**Belohnung am Ende** (Z. 2228–2247): „LEVEL 1 GESCHAFFT“, Zeit, Bestzeit, „RAEUME DURCHSUCHT“ (zählt
Möbel, siehe Bugs), Crew. Kein Rang, keine Liste dessen, was man verpasst hat (Handy, Code-Spind mit
12 €, Polaroid 1, fünf Kleinfunde, Sicherung).

**Wiederspielreiz:** gut angelegt (Schlüsselort, Zettel und Funde zufällig, zwei Spielarten zu je
50 %, Bestzeit), aber unsichtbar: Das Endbild sagt nicht, dass es mehr zu finden gab.

### Monotonie-Gründe (belegt)

1. **Der Kern ist „E drücken und warten“.** Raum-Spielart: 14,3 Durchsuchungen je Lauf, **66 % „NICHTS
   DRIN“** (9,4). `imRaum()` Z. 1037–1105: 0,75 s Balken (`TUNE.suchDauer`), dann `SFX.nichts` und
   derselbe Text (Z. 1091). 33 Möbel in 11 Räumen (`RAEUME` Z. 347–359), Inhalt nur in 10 davon.
   Spind, Pflanze und Tafel antworten identisch; keines ist riskant, keines gibt einen Fingerzeig.
2. **Räume frieren die Welt ein** (Z. 847, Gegenprobe L1b): 54 % der Spielzeit ohne jede Gefahr.
3. **Lange Strecken ohne Forderung**: bis zu 122 s ohne Gefahr oder Wahl, längste Leere selbst mit
   Infos gezählt 25,0 s (Erdgeschoss, drei leere Räume).
4. **Die Uhr hat keine Zähne** (`TUNE.levelSekunden` 165, Z. 133): Siege nach 19–53 s (Median),
   höchstens 129,7 s. Ein Fang kostet 14 s und teleportiert unter Umständen Richtung Ausgang (L1d).
5. **Zuschauen > Spielen**: 66,6 s Passivzeit gegen 19–53 s Spiel.
6. **Die Hausmeister-Spielart ist in zwei Tasten gelöst**: R werfen, dann E — Schlüssel nach 2,8 s
   (Median, renner), schnellster Sieg 5,7 s. Der Hausmeister hat kein Gegenspiel.
7. **Werkzeuge ohne Auftrag**: Die Lampe (Q) braucht kein Lauf — die dunkle Etage
   (`TUNE.dunkleEtage`, wirkt nur beim Zeichnen, Z. 1923) ändert die Lösung nicht. Schleichen: 198 s
   von 1108 s Bewegung. Werfen lohnt nur in der Hausmeister-Spielart.
8. **Musik**: 3,24-s-Schleife mit vier Tönen, 16-mal pro Lauf; keine Steigerung, wenn ein Lehrer
   näher kommt (erst bei voller Jagd).
9. **Kein Plausch**: `PLAUSCH.lade([])` Z. 428. Level 1 ist das einzige der drei ohne
   Untertitelzeilen (Level 2 und 3: je 8). Die Handy-Nachrichten (`NACHRICHTEN`) hängen an
   Ereignissen — in den leeren Strecken kommt keine.
10. **Belohnung nur als Zahl** (s. o.): kein Grund, das Level gründlicher zu wiederholen.

### Stärken

- Zwei Spielarten (Raum / Hausmeister) und zufälliger Schlüsselort — Runden unterscheiden sich wirklich.
- Hinweiskette Zettel → Etage → Raum ist echte Deduktion (Reihenfolge des Findens zählt, Kommentar
  in `neuesSpiel()`).
- Optionale Nebenziele mit Folgen für die Nacht: Handy (`handyZurueck` schaltet die Nachrichten der
  restlichen Nacht frei), Code-Spind (12 € für Club und Späti), Polaroid 1.
- Konsequenz am Ausgang: Wer erwischt wurde, trifft den Direktor (`DIREKTOR_AUSGANG`).
- Systemische Ideen sind da: Landen macht Lärm, Werfen lenkt ab, Sicherung macht den Flur dunkel,
  Lehrer-Routinen (Kaffee, Kopierer, Klo) sind lesbare Fenster. Elf Räume mit eigenem Stil.

### Ideen (alle in `index.html` machbar)

1. **Lehrer kommen in Räume.** `lehrerLogik(dt)` auch im Modus `raum` laufen lassen (Z. 847); steht
   ein Lehrer derselben Etage vor der Tür (`|L.x - RAEUME[S.raum].x| < 12`), folgt 1,2 s Vorwarnung
   (Schritte, Lichtspalt unter der Tür), dann öffnet er. Wer nicht hinter einem Möbel kauert (E am
   Möbel), wird erwischt. Damit wird die Hälfte der Spielzeit spannend.
2. **Suchen mit Risiko statt Warten.** E halten statt tippen; Spind und Regal klappern (`laerm()` mit
   kleiner Weite), Pflanze und Tisch sind leise. Loslassen bricht ab — ständige Wahl „weiter oder raus?“.
3. **Leere Möbel füllen.** Kleinkram (Kreide, Münze, Radiergummi) als **Wurfmunition** für R
   (Wurf nur mit Munition) und 1 € je Münze. Jede Suche bringt etwas, Werfen wird zur Ressource.
4. **Warm/kalt übers Handy.** Mit geholtem Handy vibriert es nahe dem Schlüsselraum — aber Vibration
   macht Lärm (`TUNE.vibrationVerdacht` gibt es schon). Information gegen Risiko.
5. **Uhr mit Ereignissen statt flacher Zeit.** `levelSekunden` 165 → ~110 und Fixpunkte: 16:55
   Putzkolonne im Erdgeschoss, 17:05 Direktor-Runde über alle Etagen, 17:15 Hausmeister schließt
   Etage 3. Jede Minute bekommt eine eigene Lage.
6. **Rang und Geheimnisse auf dem Endbild.** S/A/B/C aus Zeit, Fängen und Funden; Zeile
   „GEHEIMNISSE 2/5“ (Handy, Code-Spind, Polaroid, Sicherung, Notizen) — macht Wiederholen lohnend.
7. **Neustart ohne Intro.** Nach dem Scheitern direkt `starteLevel()`; das Intro auf drei Tafeln
   kürzen (Tafel 1–4 sind eine Aussage).
8. **Musik in Schichten.** Melodie-Stimme über `BASS` (zwei 8-Takt-Teile A/B), Hi-Hat sobald ein
   Lehrer Verdacht > 0,25 hat, im Raum gedämpft, 0,5 s Stille vor dem Fang.
9. **Plausch füllen.** 6–8 `PLAUSCH`-Zeilen (Selbstgespräche, Ferdi per Handy, Kommentare zu Räumen)
   mit Auslösern bei Etage und Fund — füllt die 25-s-Leere ohne Zwang.
10. **Hausmeister-Klau als Timing.** Statt „R, dann E“ ein Fenster, in dem er sich kurz wegdreht
    (wie ein Konter: E im Fenster, sonst Gespräch oder Fang). Übt das Timing, das Level 2 verlangt.

### Bugs

| # | Wo | Befund | Beleg |
|:--|:--|:--|:--|
| 1 | Z. 1068 und 1006 | „SCHLUESSEL GEFUNDEN“ / „SCHLUESSEL VOM GUERTEL GEZOGEN“ wird im selben Bild von „ROTE WOLLE AM SCHLUESSEL.“ überschrieben — die Erfolgsmeldung ist nie zu sehen. | L1a |
| 2 | Z. 841 | `S.zeit` läuft auf dem Endbild weiter: Die angezeigte ZEIT zählt hoch, während „NEUE BESTZEIT“ dasteht (Bestzeit selbst wird vorher korrekt gespeichert). | L1c: 50 → 60 s in 10 s |
| 3 | Z. 2239 | „RAEUME DURCHSUCHT“ zeigt `S.durchsucht.size` = Zahl der **Möbel**. | L1e |
| 4 | Z. 1444–1449 | Fang-Teleport an die nächste Treppe setzt im Erdgeschoss rechts auf x = 686, **38 px neben den Ausgang** — ein Fang mit Schlüssel ist eine Abkürzung. | L1d |
| 5 | Z. 995 + `SZENEN` Z. 1471 ff. | Wer erwischt wurde, trifft den Direktor zweimal: erst das Gespräch am Ausgang (Wahl „Sie haben mich eingeschlossen“ → „Geh.“), danach die Cutscene „DIREKTOR: WO WILLST DU HIN … *DU PACKST IHN AM KRAGEN*“. Inhaltlicher Widerspruch. | Code, Lauf `--renner --werfen` |
| 6 | Z. 1008 | Zweig „ER SCHAUT DIREKT HIN“ ist unerreichbar (die beiden Bedingungen davor decken alle Fälle ab). | Code |
| 7 | Z. 2242 / 2247 | Siegbild zeigt „E WEITER ZU LEVEL 2“ und „LEERTASTE FUER NEUSTART“ zugleich; Leertaste wirft aufs Titelbild. Am Handy steht „E“ (keine E-Taste), und `mobilKontext()` beschriftet den Knopf auf dem Siegbild mit „NOCHMAL“, obwohl er zur Karte führt (Z. 570). | Code |

## Level 2 — Bei Moritz (`level2.html`)

### Messaufbau

Zwei Profile: **erstspieler** läuft einmal von links nach rechts und fasst alles an (Leute, Möbel,
Kühlschrank, Getränke, Spiegel, Kartons, Pinnwand), dann erledigt er den Rest; **kenner** nimmt den
kürzesten Weg. Wahl am Anfang (MITNEHMEN): *alle*, *klein*, *mittel* oder *warten* (der 10-s-Timer
wählt). Kampf: Reaktion 0,40–0,80 s nach Ausholbeginn, ein Versuch je Ausholen (wie ein Mensch, der
auf den Balken schaut). 12 Startwerte je Kombination, **96 Läufe**.

### Ergebnisse

| Gruppe | Läufe | gewonnen | Spielzeit min / Median / max | bis Kampf (Median) | Kampf (Median) | Gesamt inkl. Karte, Intro, Abspann |
|:--|--:|--:|:--|--:|--:|--:|
| erstspieler / alle | 12 | 10 | 85,0 / 90,2 / 97,4 s | 94,7 s | 10,2 s | 149,5 s |
| erstspieler / klein | 12 | 9 | 52,6 / 57,0 / 60,4 s | 65,9 s | 9,2 s | 119,6 s |
| erstspieler / mittel | 12 | 11 | 64,0 / 66,1 / 73,9 s | 73,9 s | 9,3 s | 125,6 s |
| erstspieler / warten | 12 | 10 | 85,0 / 90,2 / 97,4 s | 101,7 s | 10,2 s | 156,5 s |
| kenner / alle | 12 | 9 | 55,0 / 58,6 / 72,1 s | 57,5 s | 9,2 s | 109,6 s |
| kenner / klein | 12 | 10 | 28,9 / 32,6 / 37,9 s | 37,0 s | 8,2 s | 87,0 s |
| kenner / mittel | 12 | 9 | 40,1 / 44,0 / 48,3 s | 45,0 s | 8,3 s | 95,3 s |
| kenner / warten | 12 | 9 | 55,0 / 58,6 / 72,1 s | 64,5 s | 9,2 s | 116,6 s |

- **Spielzeit** (Uhr `S.zeit`): 29–97 s. Die Uhr steht auf **190 s** (`TUNE.levelSekunden`, Z. 95) —
  kein Lauf kam über 97 s. Enden: **77 gewonnen, 19 „ER HAT DICH RAUSGEWORFEN“** (20 %, alle im Kampf),
  0 Blackout, 0 „DER BUS IST WEG“.
- **Zeitanteile der freien Phase** (alle Läufe): **Reden 42,5 %**, Laufen 38,8 %, an der Tür warten
  11,6 %, Suchen 6,0 %, Stehen 1,1 %.
- **Tür-Warten:** Wer mit allen Aufgaben an der Tür E drückt, wartet **7,3 s** (Median, max 7,4 s),
  bis die Plauschzeilen „DU, ICH MUSS DIR WAS…“ und „*ES KLINGELT*“ durch sind — ohne Rückmeldung
  auf den Tastendruck (`S.kampfWartet`, Z. 600).
- **Längste Leere** (mit Infos gezählt): Median 4,6–10 s, Maximum **10,0 s** (der MITNEHMEN-Timer bei
  *warten*). Level 2 ist an Information dicht.
- **Längste Strecke ohne Gefahr oder Wahl** (`a-druckluecke.js`): **66,5 s** (erstspieler/alle, von
  den Kartons bis zum Kampf), 37,7 s (erstspieler/mittel), 36,3 s (kenner/klein, von der Wahl bis zum
  Kampf). Vor dem Kampf gibt es **keine einzige Herausforderung** — alle 5,2 Gefahren-Ereignisse je
  Lauf sind „Gegner holt aus“.
- **Ereignisse je Lauf (Mittel):** 43,5 Info, 6,0 Quittung, 5,2 Gefahr, **1,5 Entscheidung**, 10,7 Effekte.
- **Passivzeit:** Kapitelkarte 3,5 s + Intro 12,6 s (5 Tafeln) + Abspann 28,4 s (13 Tafeln) = **44,5 s**.

### Verben

Das Lehrbild (`nacht/lehre.js`) nennt zwei Tasten: **A/D und E** („REDEN, SUCHEN, TRINKEN, KONTERN“).
Springen geht, bewirkt nichts; Tiefe ist aus (`TIEFE_PRO_SEITE['level2.html']=false`).

| Verb (alles E außer Laufen) | Drücke gesamt | je Lauf |
|:--|--:|--:|
| Zeile weiter (Leute) | 1404 | **14,6** |
| durchsuchen | 508 | 5,3 |
| ansprechen | 380 | 4,0 |
| kontern | 315 | 3,3 |
| trinken | 210 | 2,2 |
| Gespräch weiter / wählen / Auswahl wechseln | 168 / 120 / 72 | 1,8 / 1,3 / 0,8 |
| Kühlschrank nehmen | 84 | 0,9 |
| Kartons / Spiegel / Pinnwand | je 48 | je 0,5 |
| laufen (gehalten) | 1989 s | 20,7 s |

**48 % aller wirksamen E-Drücke sind „Text weiter“** (1404 + 168 von 3285, ohne Start und Tür); mit den Gesprächswahlen 52 %.
(Messartefakte: „E an der Tür“ 1704 Drücke, davon 122 wirksam — der Bot drückt während der 7,3 s
Wartezeit weiter; „Pinnwand“ zählt 0 wirksam, weil die Polaroid-Karte nicht im Fingerabdruck steht.)

### Scheitern

- **Kampf** (`kampf()` Z. 761–804): 3 Herzen; der Gegner braucht 3 Konter. Ausholen 0,75 s, Fenster
  die letzten 34 % = **255 ms** (0,495–0,75 s), **ein Versuch je Ausholen** (zu früh = verpasst, dann
  trifft er). Menschlich getimter Bot: **20 % K.o.**, Kampfdauer 8–12,5 s.
- **Bus weg** (190 s): nie erreicht. **Blackout** (Pegel 100): 7 Schlucke à 16 bei 0,6/s Abbau — nur
  absichtlich. Die freie Phase (29–97 s) hat damit **keine einzige Fehlschlag-Möglichkeit**.
- **Strafe nach K.o.:** Endbild → Leertaste → Titelbild (Gegenprobe L2b: Aufgaben gelöscht) → Intro
  → Kapitelkarte → Wahl → alle Botengänge erneut → 7,3 s Tür → erst dann der nächste Kampfversuch.
  Das sind rund 50–120 s Wiederholung (Intro 12,6 s + Karte 3,5 s + 37–102 s bis zum Kampf) für 8–12 s Kampf.

### Musik, Rückmeldung, Belohnung

**Musik** (`musik()` Z. 223, `BASS` Z. 221): 128 BPM, 16 Schritte = **1,875 s Schleife**, fünf
Tonhöhen. Im Modus `spiel` drei Stimmen: Rechteck-Bass, Sinus-Kick (55 Hz) auf jedem Viertel, kurzes
Rauschen auf den Offbeats; die Lautstärke steigt mit dem Pegel. Bei 90 s Spielzeit läuft die Schleife
**rund 48-mal**. **Im Kampf** fallen Kick und Rauschen weg und die Lautstärke sinkt auf 0,014
(Z. 228–233) — Gegenprobe L2a: je 5 s **23 statt 36 Noten, 0 statt 11 Rauschen, Lautstärke 0,014
statt 0,033**. Der einzige Höhepunkt des Levels klingt leerer als das Herumlaufen.

**Rückmeldung je Aktion:**

| Aktion | Ton | Bild | Text |
|:--|:--|:--|:--|
| Ansprechen / Zeile weiter | ein Piep 520–700 Hz | Textkasten | Zeile |
| Durchsuchen | Rauschen | Pause 0,6 s | – |
| Fund | Arpeggio | Blitz 0,4–0,6 | DEINE JACKE / MORITZ AUSWEIS |
| Leer | 220 Hz | – | NICHTS / NUR KRAM / LEER |
| Trinken | Glissando + Rauschen | Pegelbalken, ab 55 schwankt das Bild | AUF EX / RUNTER DAMIT / NOCH EINEN |
| Aufgabe erledigt | Zwei-Ton | Haken in der Liste | – |
| Konter | Klatsch | Wackeln 5, Blitz 0,5 | SITZT / KONTER / GENAU DA |
| Getroffen | Aua-Glissando | Wackeln 6, Blitz 0,5 | AUTSCH |
| Ausholen | 880 Hz | Ausholbalken (`hud.js`) mit Fenster | ER HOLT AUS / ZU FRUEH |

Keine Partikel, kein Hitstop (eigene `kampf()`, nicht `nacht/kampf.js` mit `KAMPF.hitStop`).

**Belohnung am Ende** (Z. 1220–1236): Zeit, Bestzeit, Pegel, Crew, Text „IHR SEID DRAUSSEN. GERADE
NOCH.“ — auch bei 100 s Restzeit. Kein Rang, keine Konter-Bilanz, Kartons und Polaroid unerwähnt.

**Wiederspielreiz:** Jacke und Ausweis liegen zufällig unter 6 Möbeln; die MITNEHMEN-Wahl ändert
Aufgaben (2–4) und die Crew der ganzen Nacht; Bestzeit. Die Wohnung selbst ist bei jedem Versuch gleich.

### Monotonie-Gründe (belegt)

1. **Ein-Knopf-Botengänge.** Alle Aufgaben (`AUFGABEN` Z. 328) sind „hingehen, E“. Zwischen Spieler
   und Ziel steht nichts — keine Person, kein Zeitdruck, kein Risiko. 0 Herausforderungen vor dem Kampf.
2. **Lesen statt Spielen.** 42,5 % der freien Zeit in Zeilen-Gesprächen (`rede()` Z. 714), 14,6
   Weiter-Drücke je Lauf. Füllzeilen ohne Inhalt: Finn `'...','ZZZZZ','...'` (Z. 294), David `'...'`
   (Z. 298); Max Ferdi hat drei Zeilen und keine Aufgabe (Z. 287). Während der Zeilen steht die Welt.
3. **Keine Gefahr in der freien Phase**: Uhr 190 s gegen Siege ≤ 97 s; Blackout nur absichtlich;
   36–67 s ohne Gefahr oder Wahl.
4. **Der Pegel ist ein Schalter, kein System.** Einziger Nutzen: ≥ 35 für David (`mutAb`, Z. 87) —
   und David gibt es nur bei *alle*. Darüber nur Nachteile (schwanken ab 55, langsam ab 70). Bei
   *klein*/*mittel* ist Trinken bedeutungslos; der Spiegel kommentiert nur.
5. **Durchsuchen ist meist leer**: 6 Verstecke, 2 Funde → 4 gleiche Leer-Antworten.
6. **Der Kampf ist dreimal dieselbe Aufgabe**: ein Gegner, feste Zeiten (Ausholen 0,75 s, Pause 1,1 s,
   Gegenprobe L2c), kein Muster, keine Finte.
7. **Musik**: 1,875-s-Schleife ~48-mal; im Kampf dünner statt dichter (L2a).
8. **Tote Wartezeit an der Tür**: E wird angenommen, aber 7,3 s passiert sichtbar nichts (Z. 600).
9. **Teure Wiederholung nach K.o.** (L2b): Die schwerste Stelle liegt hinter 50–120 s Wiederholung.
10. **Das Endbild behauptet Knappheit** („GERADE NOCH“, Z. 1224), die es nie gab.

### Stärken

- Die MITNEHMEN-Wahl steht gleich am Anfang, ändert die Aufgabenliste und setzt die Crew der Nacht
  (`gruppeGross`/`gruppeKlein` liest Level 4 und 8) — eine Entscheidung mit Gewicht.
- Pegel als nachtübergreifende Ressource mit sichtbarer Mut-Marke im HUD.
- Fundorte zufällig, Aufgabenliste mit Haken klar lesbar, kurze Wege (980 px, sechs farbige Zonen).
- Erster Kampf lehrt den Konter mit Ausholbalken und **demselben Fenster** wie spätere Level
  (`konterFenster` = `KAMPF.konterAnteil`).
- Dichte Information (längste Leere ≤ 10 s); Plausch mit Pointen (Kartons, „ICH HAB ALLES GEHOERT“,
  das Klingeln an der Tür).

### Ideen (alle in `level2.html` machbar)

1. **Die Party lebt.** Zwei, drei Gäste (Mitbewohner, Tanzende) wandern durch die Wohnung und
   blockieren Flur und Küche; vorbei nur in einer Lücke (Timing) oder über den Balkon. Bringt
   Hindernisse in die Botengänge.
2. **Jede Aufgabe ein eigenes Mini-Verb.** Finn wecken = Dose schütteln (E schnell 5-mal in 2 s);
   David unterbrechen = E in seiner Atempause (Fenster wie ein Konter — **übt den Kampf vorher**);
   Ausweis = Moritz ruft „warm/kalt“, je nach Abstand.
3. **Pegel als Wette.** Trinkspiel am Tisch (Bierpong: E im Fenster; Treffer = Mut, Fehlwurf =
   Schluck); ein **Sweet Spot 35–55** gibt Bonus (freche Antworten, Rang), über 70 wird die Steuerung
   träge.
4. **Druck durch Ereignisse.** Uhr 190 → ~120 s; 21:30 klopft der Nachbar (Musik aus, alle still —
   ein Schleich-Moment), 21:45 kommt die Pizza (Ablenkung), Handy „BUS IN 5 MIN“.
5. **Gespräche straffen.** Füllzeilen streichen; Leute ohne Aufgabe (Max Ferdi) reden im Plausch statt
   im Textkasten; höchstens zwei Zeilen je Ansprache.
6. **Kampf mit Variation.** Ausholzeit aus einem Bereich (0,6–0,9 s); der dritte Schlag als Finte
   (kurzes Zögern); Hitstop 0,07 s wie `KAMPF.hitStop`, Staub beim Konter, Zeitlupe beim letzten Treffer.
7. **Neustart am Kampf.** Nach K.o. startet „NOCHMAL“ `starteKampf()` mit vollen Herzen statt
   `neuesSpiel()` (Z. 420).
8. **Musik nach Raum und Lage.** Lautstärke nach Abstand zur Box (`DINGE` 'box', x = 180), Bad
   gedämpft; im Kampf **voller** statt dünner (Z. 228: Kick bleibt, Hi-Hat verdoppelt).
9. **Tür-Moment statt Warten.** E an der Tür startet sofort die Klingel-Szene (Tür wackelt über `FX`).
10. **Endwertung.** Rang aus Zeit, Pegel im Sweet Spot, Konter ohne Treffer, Kartons und Polaroid;
    „GERADE NOCH“ nur bei weniger als 20 s Rest.

### Bugs

| # | Wo | Befund | Beleg |
|:--|:--|:--|:--|
| 1 | Z. 228–233 | Musik im Kampf leiser und ohne Schlagzeug — vermutlich unbeabsichtigt (Kommentar: „wird lauter je hoeher der Pegel“). | L2a |
| 2 | Z. 600 | E an der Tür bei fertigen Aufgaben: 7,3 s keine Rückmeldung. | Messung, 96 Läufe |
| 3 | Z. 1224 | „GERADE NOCH“ unabhängig von der Restzeit. | Code |
| 4 | Z. 1231 / 1236 | Am Handy stehen auf dem Siegbild „TIPPEN WEITER ZU LEVEL 3“ und „TIPPEN FUER NEUSTART“ zugleich; Tippen führt zur Karte. | Code |
| 5 | Z. 98–101, `LEUTE.t` | TUNE (4b) TIEFE und die Tiefe der Leute sind tote Werte (`TIEFE_PRO_SEITE`=false). Pflege, kein Spielfehler. | Code |

Keine Ausnahme, kein NaN in 96 Läufen.

## Level 3 — Der Nachtbus (`level3.html`)

### Messaufbau

Drei Teile, je ein Bot-Profil: **Sprint** *springer* (Leertaste kurz vor jedem Hindernis) oder
*nichtspringen* (nur rechts halten). **Bus** *nurrechts* (nie verstecken, nie reden), *vorsichtig*
(versteckt sich, wenn ein Kontrolleur nah ist und herschaut) oder *redner* (redet mit jedem: Ticket
kaufen, den Lauten aufstacheln, ehrlich zur Frau, Jonas einladen). **Tür** (DIE DREI) *warten*,
*kampf* oder *zahlen*. Kloppe: Konter-Bot (kontert im Fenster, blockt davor, schlägt sonst).
8 Startwerte je Kombination, **144 Läufe**. Dazu `a-kloppe.js`: die Kloppe isoliert, vier Taktiken × 10.

### Ergebnisse

| Gruppe | gewonnen | Sprint | Bus | Kloppe | Kontrollen | Gesamt (Median) |
|:--|--:|--:|--:|--:|--:|--:|
| springer / nurrechts / (alle drei) | **0 / 24** | 14,0 s | 10,6 s | – | 3 | – |
| springer / vorsichtig / warten | 8 / 8 | 14,0 s | 39,1 s | 1,9 s | 2 | 78,2 s |
| springer / vorsichtig / kampf | 8 / 8 | 14,0 s | 33,6 s | 1,9 s | 2 | 72,7 s |
| springer / vorsichtig / zahlen | 8 / 8 | 14,0 s | 34,3 s | – (bezahlt) | 2 | 73,4 s |
| springer / redner / warten | 8 / 8 | 14,0 s | 110,4 s | 2,8 s | 2 | 149,5 s |
| springer / redner / kampf | 8 / 8 | 14,0 s | 104,9 s | 2,8 s | 2 | 144,0 s |
| springer / redner / zahlen | 8 / 8 | 14,0 s | 110,9 s | 2,8 s | 2 | 150,0 s |
| nichtspringen / … | wie oben | **17,1 s** | wie oben | wie oben | wie oben | +3,1 s |

- **Alle acht Startwerte liefern dasselbe Ergebnis.** Gegenprobe L3c: Die fünf Kontrolleure stehen
  nach 12 s bei Startwert 0 und 5 auf denselben Pixeln. Zufall gibt es nur im Ruckel-Abstand
  (4,5–9 s) und in der Optik der Hindernisse.
- **Sprint:** gebraucht 14,0–17,2 s von **34 s** (`TUNE.sprintSekunden`, Z. 87). Ohne einen einzigen
  Sprung (16-mal gestolpert) nur 3,1 s langsamer. Scheitern erst nach **34 s Stillstand** (Gegenprobe L3b).
- **Bus:** Wer einfach durchläuft, scheitert **immer** (48 / 48, drei Kontrollen in 10,6 s) — die
  einzige echte Hürde des Levels. Der vorsichtige Bot braucht 34–39 s; der Redner 104–111 s, davon
  der größte Teil Dialog. (Der Redner kann an der Tür nicht zahlen: 15 € − 9 € Ticket = 6 € < 10 € —
  so gewollt, Kommentar `ticketPreis`.)
- **Kloppe:** 1,9–2,8 s. `a-kloppe.js`: Konter-Bot 2,0 s, menschlich getimt 3,1 s, **E alle 0,3 s
  hämmern gewinnt in 4,3 s**, **nichts tun verliert in 3,7 s — und man geht trotzdem durch die Tür**
  (Modus danach `spiel`, nur −6 € und Ruf −6).
- **Längste Leere** (mit Infos): Bus Median 3,2–8 s, Maximum **8,0 s** (Bedenkzeit an der Tür);
  Sprint 1,9 s. **Ohne Gefahr oder Wahl** (`a-druckluecke.js`): 8,0 / 12,0 / 13,6 s. Level 3 ist dicht.
- **Ereignisse je Lauf (Mittel):** 25,6 Info, 23,0 Quittung, **28,9 Gefahr**, 5,6 Entscheidung,
  15,8 Effekte; **215 Effekttöne je Minute** (Median, höchster Wert der drei Level).
- **Passivzeit:** Kapitelkarte 3,5 s + Intro 9,0 s (4 Tafeln) + Abspann 12,4 s (6 Tafeln) = **24,9 s**.

### Verben

| Verb | Drücke gesamt | je Lauf | Taste |
|:--|--:|--:|:--|
| springen (Sprint) | 1152 | 8,0 (16 bei *springer*) | Leertaste |
| verstecken | 1011 (612 wirksam) | 7,0 | E |
| Gespräch weiter / wählen / Auswahl | 768 / 752 / 80 | 5,3 / 5,2 / 0,6 | E, A/D |
| kontern (Kloppe) | 240 | 1,7 | E |
| auftauchen | 150 | 1,0 | E oder laufen |
| ansprechen / Ticket | 144 / 48 | 1,0 / 0,3 | E |
| schlagen (Kloppe) | 55 | 0,4 | E |
| laufen / blocken (gehalten) | 4599 s / 76 s | 32 s / 0,5 s | A/D, Umschalt |

Theoretisch elf Verben (laufen, springen, verstecken, auftauchen, reden, wählen, Ticket, Notbremse,
Foto, und in der Kloppe Schlag/Konter, Block, Ausweichen mit Tiefe). Gemessen tragen **laufen,
verstecken und Text weiter** das Level; Block und Ausweichen kommen in 2–4 s Kloppe kaum vor.
(„Verstecken“ unwirksam = der Bot drückte, während „HIER NICHT“ noch stand — Messartefakt.)

### Scheitern

- **Sprint:** praktisch unmöglich (s. o.). Stolpern kostet 0,4 s bei 55 % Tempo (Z. 93–94).
- **Bus:** drei Kontrollen → „KEIN TICKET. RAUSGESCHMISSEN.“ Verdacht füllt im Kegel mit 42/s,
  Warnung ab 70, danach 1,6 s Schonzeit und 46 px Rückstoß. Das Ticket (9 €) fängt eine Kontrolle ab.
  Fair und lesbar — und der einzige Ort im Level, an dem man verlieren kann.
- **Kloppe:** Niederlage ist folgenlos für den Fortschritt (`kloppeVorbei()` Z. 633–647).
- **Strafe nach Bus-Niederlage:** Endbild → Leertaste → Titelbild → Leertaste → **Intro (9 s) und
  Sprint (14–17 s) erneut** (Gegenprobe L3d). Der ungefährliche Teil muss vor jedem Versuch wiederholt
  werden; der Bus ist dann exakt derselbe.

### Musik, Rückmeldung, Belohnung

**Musik** (`musik()` Z. 295, `BASS` Z. 293): 100 BPM, 16 Schritte = **2,4 s Schleife**, fünf
Tonhöhen; im Bus zusätzlich eine Sinus-Unteroktave auf jedem Viertel, Lautstärke steigt mit dem
Verdacht (0,022 → 0,044). **Im Sprint**, dem Action-Teil, spielt nur der Bass mit 0,016 (Z. 300) —
die leiseste Phase des Levels. Die Kloppe hat keine eigene Musik. Bei 34 s Bus ~14 Wiederholungen,
beim Redner ~45.

**Rückmeldung je Aktion:**

| Aktion | Ton | Bild | Text |
|:--|:--|:--|:--|
| Sprung / Landen | 430 Hz / 160 Hz | – | – |
| sauberer Sprung über ein Hindernis | **nichts** | – | – |
| Stolpern | Rauschen + Säge | Wackeln 6, Tempo weg | AUA |
| Verstecken / Auftauchen | 220 Hz / 340 Hz | Figur im Sitz | VERSTECKT |
| Verdacht ≥ 70 | 880 Hz | Verdachtsbalken | VORSICHT - ER SIEHT DICH |
| Kontrolle | Rauschen + Glissando | Wackeln 8, Blitz 0,5 | AUSWEIS BITTE / KONTROLLE / SIE DA |
| Ruckeln (alle 4,5–9 s) | Rauschen + 70 Hz | Bild schwankt | – |
| Kloppe: Treffer | Stolper-Ton | Hitstop 0,07 s (`KAMPF.hitStop`), Wackeln 7, Blitz 0,4 | – |

Keine Partikel. Der Sprint belohnt Können mit nichts — nur Fehler machen Geräusche.

**Belohnung am Ende** (Z. 1625–1641): Zeit, Bestzeit, Pegel, Crew, „DER LETZTE BUS. GERADE NOCH.“
immer. Der Abspann (`SZENEN` Z. 1255–1262) ist für alle gleich: „DU: GESCHAFFT. NIEMAND HATS
GEMERKT.“ auch nach zwei Kontrollen, „FRAU: ICH HAB ES GEMERKT.“ auch ohne Begegnung mit ihr.

**Wiederspielreiz:** stark in den Entscheidungen (Ticket, Szene, Tipp, Notbremse, Jonas, vier Wege an
der Tür, Folgen bis Level 4: `spaetDran`), schwach im Spiel: Sprint und Bus sind bei jedem Versuch gleich.

### Monotonie-Gründe (belegt)

1. **Der Sprint hat keinen Einsatz.** 34 s Limit gegen 14–17 s; Springen spart 3 s; Scheitern nur
   durch Stillstand (L3b). Was nichts kostet, fordert nicht.
2. **Der Sprint hat keine Variation.** 16 Hindernisse in exakt 140 px Abstand (`erzeugeHindernisse`
   Z. 320–326), drei Arten nur als Bild, gleiche Trefferbreite. Einzige Steigerung ist die Tempo-Rampe
   (Abstand 1,2 s → 0,6 s). Nach dem dritten Sprung ist der Rhythmus gelernt.
3. **Der Hinweis lehrt die falsche Taste** (Z. 908: „E SPRINGT UEBER HINDERNISSE“) — E tut im Sprint
   nichts (Z. 999, Gegenprobe L3a). Wer folgt, stolpert sechzehnmal und merkt es wegen Punkt 1 kaum.
4. **Der Bus ist deterministisch** (`erzeugeKontrolleure` Z. 333–345, L3c). Jeder Versuch spielt sich
   gleich; Lernen heißt Auswendiglernen.
5. **Verstecken ist ein Zwei-Takt-Rhythmus**: warten, bis er wegschaut — E — E. 7 Verstecke je Lauf;
   ein Versteck kostet nichts und baut Verdacht mit 70/s ab (Z. 1203).
6. **Gespräche sind sichere Pausen** (Z. 1305 hält den Bus an): Der Redner verbringt 104–111 s im Bus,
   der größte Teil davon ohne Risiko.
7. **Die Kloppe hat kein Gewicht**: 2–4 s, Ausgang egal für den Weg; drei neue Tasten im Hinweis
   (Z. 629, 4 s sichtbar) für einen Kampf, der nach 2 s vorbei ist. Hämmern gewinnt.
8. **Musik**: 2,4-s-Schleife; im Sprint am dünnsten (Z. 300).
9. **Der Abspann ignoriert den Verlauf** (Z. 1258–1260); „REDEN WIR NIE WIEDER DRUEBER“ ist Ferdis Satz
   aus Level 1 und aus der Notbremse (Z. 607) — dreimal derselbe Witz.
10. **Endbild ohne Wertung**, „GERADE NOCH“ immer (Z. 1629).

### Stärken

- Drei Phasen mit eigenem Verb (rennen, schleichen, entscheiden/kämpfen) — das abwechslungsreichste
  der drei Level.
- Der Bus ist dicht: höchstens 8 s ohne Neues, 28,9 Gefahren je Lauf; Durchrennen scheitert immer —
  Schleichen ist hier wirklich nötig.
- Gespräche sind echte Werkzeuge mit Preis: Ticket 9 € (rettet eine Kontrolle, fehlt an der Tür), der
  Laute (8 s Ablenkung, Ruf −6), die Frau (Tipp), Notbremse (14 s Ablenkung, Ruf −14, Folgen in Level 4).
- DIE DREI: vier Lösungen mit Bedingungen aus der bisherigen Nacht (Crew Jonas, Mut 50, Geld 10).
- Faire Warnung (Verdacht 70 + Ton), Schonzeit nach Kontrolle, Jagd bricht im Versteck ab; Ruckeln
  als Zufallsereignis, das den Verdacht senkt.
- Die Kloppe nutzt `nacht/kampf.js` mit Hitstop.

### Ideen (alle in `level3.html` machbar)

1. **Sprint mit Einsatz.** `sprintSekunden` 34 → ~22 (dann kosten etwa fünf Stolperer den Bus);
   der Bus fährt sichtbar vorn mit Abstandsbalken; Stolpern 0,4 → 0,8 s.
2. **Hindernis-Muster.** Abstände aus Mustern (kurz-kurz-lang, Doppel), Arten mit eigener Antwort:
   Poller = springen, Mülltonne = hoher Sprung (Taste halten, `kurzsprung` gibt es schon), Pfütze =
   nicht springen, sondern drüber (springen landet drin), Fußgänger mit Hund = wechselnde Position.
3. **Können hörbar machen.** „SAUBER x3 / x5 / x10“ mit steigender Tonleiter, bei 10 ohne Fehler ein
   Tempo-Schub; Staub beim Landen (wie Level 1).
4. **Hinweis korrigieren** (Z. 908) und E im Sprint zusätzlich als Sprung annehmen (Z. 999).
5. **Kontrolleure streuen.** Startposition, Blickrichtung und Pausen aus Bereichen würfeln
   (`erzeugeKontrolleure`); einer dreht unvermittelt um (Finte); Haltestelle als Ereignis (Türen auf,
   einer steigt zu oder aus).
6. **Bus-Ereignisse über die Fahrt.** Kurve (alle rutschen, wie `ruckeln()`), Tunnel (3 s dunkel, Sicht
   halbiert), Durchsage „FAHRSCHEINKONTROLLE“ (alle drehen sich gleichzeitig um).
7. **Checkpoint nach dem Sprint.** Nach einer Bus-Niederlage „NOCHMAL“ → `starteBus()` statt
   `neuesSpiel()` (Z. 850 / 861), ohne Intro.
8. **Kloppe mit Folgen und Länge.** Verlieren = Rückstoß an den Anfang von Waggon 3 und eine zweite
   Runde gegen den Anführer; Anführer 3 → 5 Treffer; Hinweis in zwei Schritten bei angehaltenem Kampf
   (erst Block, dann Ausweichen).
9. **Musik mit Tempo.** Sprint mit Kick/Hi-Hat, BPM an die Tempo-Rampe gekoppelt; im Bus eine zweite
   Stimme ab Verdacht 40; eigener Takt in der Kloppe.
10. **Abspann und Endbild nach Verlauf.** Zeile 2/3 je nach `S.hp`, Notbremse, Ticket, Frau getroffen;
    Wertung „KONTROLLEN 0/3 — GEIST“, Ticket ja/nein, Ablenkung genutzt; Rang.

### Bugs

| # | Wo | Befund | Beleg |
|:--|:--|:--|:--|
| 1 | Z. 908 / 999 | Hinweis „E SPRINGT UEBER HINDERNISSE“ — E springt nicht (nur Leertaste; das Lehrbild in `nacht/lehre.js` sagt richtig LEER). | L3a: vy nach E = 0, nach Leertaste −161 |
| 2 | Z. 1258–1260 | Abspann widerspricht dem Verlauf (Kontrollen, Frau nie getroffen). | L3e, Code |
| 3 | Z. 1636 / 1641 | Am Handy „TIPPEN WEITER ZU LEVEL 4“ und „TIPPEN FUER NEUSTART“ zugleich. | Code |
| 4 | Z. 1629 | „GERADE NOCH“ unabhängig vom Verlauf. | Code |
| 5 | Z. 182, Z. 332 | Kommentare veraltet: „Der erste Kampf der Nacht“ (der erste ist in Level 2), „Drei Kontrolleure“ (es sind fünf). `sitzbloecke` (Z. 140 ff.) greifen nur bei `tiefeAn()` (Z. 1083) — im flachen Bus toter Ballast. Pflege, kein Spielfehler. | Code |

Keine Ausnahme, kein NaN in 144 Läufen.

---

## Anhang: Gegenproben (`a-pruefung.js`)

15 von 15 Befunden bestätigt (Lauf vom 2026-10-06):

| Probe | Befund | Gemessen |
|:--|:--|:--|
| L1a | Erfolgsmeldung beim Schlüsselfund überschrieben | Meldung direkt danach: „ROTE WOLLE AM SCHLUESSEL.“ |
| L1b | Lehrer frieren im Raum ein, Uhr läuft | x vorher = nachher `[405,205,475,636]`, Uhr +6,0 s |
| L1c | Uhr läuft auf dem Endbild | 50 → 60 s in 10 s |
| L1d | Fang-Teleport neben den Ausgang | x = 686, 38 px vom Ausgang |
| L1e | „RAEUME DURCHSUCHT“ zählt Möbel | 5 Möbel in 2 Räumen → 5 |
| L1f | E-Tipp im Intro = eine Tafel | Modus intro, Tafel 1 |
| L2a | Musik im Kampf dünner | frei 36 Noten / 11 Rauschen / 0,033 — Kampf 23 / 0 / 0,014 (je 5 s) |
| L2b | K.o. → Titelbild, Aufgaben weg | ende → titel, erledigt `[]` |
| L2c | Kampf-Timing fest | Ausholen 0,75 s, Fenster 0,34, Pause 1,1 s, 3 Treffer |
| L2d | „GERADE NOCH“ trotz Restzeit | typischer Sieg nach 90 s → 100 s Rest von 190 s |
| L3a | E springt im Sprint nicht | vy nach E 0, nach Leertaste −161,2 |
| L3b | Sprint scheitert erst nach Stillstand | 34,0 s bis „DER BUS IST WEG“ |
| L3c | Bus deterministisch | Kontrolleur-x nach 12 s bei Startwert 0 und 5 identisch |
| L3d | Bus-Niederlage → Intro + Sprint erneut | ende → intro |
| L3e | Abspann fest | „DU: GESCHAFFT. NIEMAND HATS GEMERKT.“ |
