# Startmenue (nacht/menue.js)

Stand: gebaut und im Browser gemessen (667x375 quer, 390x844 hoch, Desktop).

## Wann es erscheint
Beim Laden von index.html, wenn die Adresse weder `?neu=1` noch `?lektion` noch `?level` enthaelt.
`?neu=1` und `?level=1` behalten den alten Titelbild-Pfad von Level 1 (Schwierigkeit, START).
Haken: `kern.js bild()` fragt `MENUE.pruefe()` direkt vor `LEHRE.pruefe()`; solange es laeuft, ruht das Level.

## Fortschritt (woher)
- `NACHT.kapitel` (nacht/nacht.js): wird zurueckgesetzt durch NEUE NACHT. `karte.html` setzt beim Laden
  `setzeKapitel(NACH+1)`, Level 3/5/6/7/8 setzen es selbst.
- WEITER nur bei `kapitel >= 2`. Ziel: `karte.html?nach=N-1`, solange der Umweg dort offen ist, sonst `levelN.html`.
- LEVEL WAEHLEN: Level 1 bis max(kapitel, hoechste Bestzeit + 1). Bestzeiten ueberleben eine neue Nacht (Rekorde).

## Eintraege je Zustand
- hinweis (nur solange KOMFORT 'hinweis' nicht bestaetigt): WEITER, FLACKERSCHUTZ AN (entfaellt, wenn schon an)
- haupt: NEUE NACHT, [WEITER: LEVEL n - ORT], [LEVEL WAEHLEN ab Level 2], EINSTELLUNGEN, ENDEN, UEBER
- neuSicher (NEUE NACHT bei Fortschritt): ABBRECHEN (vorgewaehlt), JA, NEUE NACHT
- level: LEVEL 1..erreicht, ZURUECK
- einst: FLACKERSCHUTZ, WACKELN, ROEHREN-LOOK, SCHWIERIGKEIT (Links/Rechts oder Tippen), am Handy Hinweis auf das Handy-Menue, ZURUECK
Tests: test/menue.test.js (Fortschritt, Weiter-Auswahl, Eintraege, Navigation).

## Bedienung
Pfeile/W S + E/Enter/Leertaste, Esc zurueck, G Enden, U Ueber; Maus (Ueberfahren waehlt, Klick), Touch:
Tippen auf einen Eintrag, Wischen scrollt, Hauptknopf (Aufschrift WAEHLEN, im Hinweis WEITER) bestaetigt den markierten.
M, F, Ziffern 1-8 und Browser-Kuerzel gehen durch. Flaechen am Handy mindestens 44 CSS-px (Handy quer: 24 Bildpunkte x 2.0 = 48 px;
hoch: 39 x 1.22 = 47 px). Hochkant sieht man nur 3 Eintraege, der Rest scrollt (Pfeil-Marke rechts der Liste).

## Handy-Restpunkte (Auftrag B), gemessen 667x375
1. Titelbild (?neu=1): UEBER jetzt oben rechts (Flaeche 60x26 Bildpunkte), nicht mehr hinter START.
2. Alte Bildtexte "E  WEITER" / "E" in den Intros von Level 1, 3, 4, 5 (auch 6, 7, 8) am Handy nicht mehr gezeichnet.
3. Gespraechsleiste quer: max-height 45 %; Antworten nebeneinander (bis drei Spalten), Text 12 px.
   Gemessen: 3 lange Antworten 38 % Hoehe, Antworten 67 px; 4 Antworten 45 % (Grenze), Antworten 45 px, Liste scrollt bei mehr.

## Offen
- Echtes Telefon: Daumen-Tippen/Wischen im Menue, Hochkant-Lesbarkeit der Pixelschrift.
- NEUE NACHT startet direkt Level 1 (Intro); die alte Titelbild-Seite (Controls-Liste, Schwierigkeit) gibt es nur ueber ?neu=1.
- WEITER merkt sich nur das naechste Level, nicht die Stelle im Level. karte.html setzt NACHT.kapitel (NACH+1).
- Tiefen-Test: Level 2 und 4 setzen kapitel nicht selbst; es kommt ueber karte.html.
