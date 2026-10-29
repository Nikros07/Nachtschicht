# Nachmessung Tutorial und Entschaerfung

Datum: 2026-10-29
Skript: `docs/gameplay/messung/t14-nachmessung.js` (Lauf: `node docs/gameplay/messung/t14-nachmessung.js`, Exit 0)

| Messung | Wert | Ziel | Status |
| --- | --- | --- | --- |
| 1 Konterfenster Engine locker | 250 ms (Flitzer 250, Schlaeger 253) | >= 249 ms | OK |
| 1 Konterfenster Engine normal | 180 ms (Flitzer 180, Schlaeger 180) | >= 179 ms | OK |
| 1 Konterfenster Engine hart | 101 ms (Flitzer 101, Schlaeger 154) | - | INFO |
| 2 Level 2 Tuerkampf locker | 482 ms | - | INFO |
| 2 Level 2 Tuerkampf normal | 338 ms | >= 330 ms | OK |
| 2 Level 2 Tuerkampf hart | 293 ms | - | INFO |
| 3 Level 4 Jab-Fenster locker | 360 ms | >= 359 ms | OK |
| 3 Level 4 Jab-Fenster normal | 360 ms | >= 359 ms | OK |
| 3 Level 4 Jab-Fenster hart | 360 ms | >= 359 ms | OK |
| 4 Level 7 Pfandwurf normal | 121 ms (Zone 0,420 bis 0,780) | >= 100 ms | OK |
| 5 Level 1 Sonder-Moebel | 0 von 1000 Runden (0,0 %) | 0 Runden | OK |
| 6 Level 1 Direktor Startetage | Etage 2 (Soll 2) | = TUNE.chefStartEtage (2) | OK |
| 7 Level 5 Blackout Pegel | Pegel 60 | <= 60 | OK |
| 8 Level 6 Aufwachen | x 1348 | x >= 1000 | OK |
| 9 Level 8 Sprung Gipfel | 20 px (Hoehe 9) | > TUNE.hindernisHoehe | OK |
| 10 Level 8 Sonne Ankunft | 90 % (Grenze 90) | <= 100-2*hindernisStrafe | OK |
| 11 Dialog Standardantwort | "Alles gut, ich warte." | beginnt mit "Alles gut" | OK |
| 12 Hilfe stumm bei ?lektion=0 | false | false | OK |
| 12b Hilfe an mit ?hilfe=1 | true | true | OK |

## Vorher und nachher

Jede Zeile: der Befund vor der Entschaerfung, dann die heutige Messung.

- Konterfenster Flitzer LOCKER: vorher 145 ms, jetzt 250 ms (Ziel 249 ms).
- Konterfenster Flitzer NORMAL: vorher 116 ms, jetzt 180 ms (Ziel 179 ms).
- Level 2 Tuerkampf: vorher 255 ms auf allen Stufen, jetzt 338 ms auf NORMAL (Ziel 330 ms). LOCKER und HART sind nur Information.
- Level 4 Jab: vorher 350/280/243 ms (LOCKER/NORMAL/HART), jetzt 360 ms auf allen Stufen (Ziel 359 ms).
- Pfandwurf: vorher 47 ms, jetzt 121 ms auf NORMAL (Ziel 100 ms).
- Sonder-Moebel: vorher 1,9 % (Schluessel) und 11,1 % (Zettel) der Runden, jetzt 0 von 1000 Runden.
- Direktor: vorher Etage 0 neben dem Ausgang, jetzt Etage 2.
- Blackout: vorher Pegel 100 (Endlosschleife), jetzt Pegel 60.
- Aufwachen: vorher x 78, jetzt x 1348 (naechstes Sofa links).
- Sprung: vorher 15,8 px bei Hoehe 13 (50-ms-Tipp), jetzt 20 px bei Hoehe 9.
- Sonne: vorher ab 4 Umwegen unschaffbar, jetzt Ankunft bei 90 % Licht (Grenze 90 %).
- DIE_DREI: vorher Kampf bei Zeitablauf, jetzt wird die vorgewaehlte Antwort "Alles gut, ich warte." genommen.

## Nicht ohne Browser pruefbar

- Ueberdeckung Tipp-Zeile und HUD bei Breite 320 und 432.
- Lesbarkeit von JETZT! und des roten Balkens bei unblockbaren Angriffen.
- Touch-Verzoegerung beim Tanzen (Level 5) und beim Gold-Konter.
- Handy-Menue WAS JETZT? und SCHWIERIGKEIT.

## Hinweise zur Messung

- Messung 5 ueberspringt Schluessel und Funde mit Raum -1 (kein Platz auf der Karte). Ohne diese Pruefung brach das Skript ab, weil `sonderMoebel` fuer Raum -1 nicht existiert.
- Messung 12 (Hilfe) braucht `hilfeTipp` aus `nacht/hilfe.js`. Der Lauf zeigt, dass die Funktion geladen ist.
