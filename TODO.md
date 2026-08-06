# NACHTSCHICHT — To-do

Stand: v0.8. Das Grundgerüst für das Level-Spiel steht, das erste Level ist
durchspielbar. Alles andere steht hier.

Reihenfolge ist grob nach Priorität sortiert. Abgehakt heißt: gebaut **und**
getestet.

---

## Grundgerüst

- [x] Level als reine Daten, Logik kennt keine konkreten Orte
- [x] Kamera folgt in X und Y, mit Vorlauf in Blickrichtung
- [x] Mehrere Etagen, Treppen dazwischen
- [x] Räume: man sieht nur die Tür, bis man reingeht
- [x] Gegenstände durchsuchen mit Suchbalken
- [x] Zielsystem: Schlüssel finden, Ausgang aufschließen
- [x] Wachen mit Sichtkegel, Patrouille und Verfolgung
- [x] Verstecken in Räumen
- [x] Auflösung wächst mit dem Bildschirm mit, keine Balken im Querformat
- [x] Touch-Steuerung mit Steuerkreuz und runden Knöpfen
- [ ] Level-Übergänge: aus Level 1 direkt in Level 2, mit Zwischenbild
- [ ] Spielstand speichern, damit man nicht jedes Mal von vorn muss
- [ ] Level-Auswahl auf dem Titelbildschirm

## Levels

- [x] **1 Die Schule** — Schlüssel suchen, Lehrern ausweichen
- [ ] **2 Vorglühen** — WG, enge Küche, erste Shots, Pegel wird eingeführt
- [ ] **3 Der Nachtbus** — fahrend, wackelnd, Kontrolleure
- [ ] **4 Die Straße** — Weg zum Club, erste echte Kämpfe
- [ ] **5 Die Schlange** — Türsteher, erster Boss
- [ ] **6 Der Club** — Stroboskop, Meute, Mädels ansprechen
- [ ] **7 Afterhour** — surreal, verzerrt, Schule taucht verdreht wieder auf
- [ ] **8 Der Späti** — Ruhepause, Döner, Story
- [ ] **9 Heimweg** — Sonnenaufgang, letzter Boss

## Schule ausbauen

- [ ] Mehr Horror: Licht geht aus, Schritte ohne Quelle, Türen die zufallen
- [ ] Der Hausmeister als langsamer, unausweichlicher Verfolger
- [ ] Schließfächer öffnen, Zettel mit Hinweisen finden
- [ ] Endgegner Direktor
- [ ] Ist es die echte Schule? Räume und Lehrer nach Vorbild benennen

## Der Club

- [ ] Minispiel: jemanden ansprechen
  - [ ] Erfolg gibt Confidence Boost, kurz unverwundbar
  - [ ] Misserfolg macht langsamer und gedrückt, bis man sich fängt
  - [ ] Mechanik festlegen: Timing, Rhythmus oder Antwort wählen?
- [ ] Stroboskop, das die Sicht wegnimmt
- [ ] Tanzfläche als Hindernis statt als Deko

## Kampf härter machen

Aktuell kommt man durch, indem man dauerhaft die Schlagtaste drückt. Das muss weg.

- [ ] Gegner blocken, sind nicht dauerhaft angreifbar
- [ ] Auf einen Blocker einschlagen prallt ab und betäubt einen selbst
- [ ] Konterfenster nur im letzten Drittel des Ausholens
- [ ] Fehlschlag kostet spürbar Zeit
- [ ] Ausdauer, damit Kämpfe einen Rhythmus haben
- [ ] Mehr Gegnertypen pro Ort statt überall dieselben

## Bosse deutlich schwerer

- [ ] Fernangriffe: Silvesterraketen im Bogen, Flaschen, Wurfgeschosse
- [ ] Unblockbare Angriffe, bei denen Angreifen der falsche Reflex ist
- [ ] Kürzere Vorwarnung und kürzere Konterfenster in späteren Phasen
- [ ] Arena verändert sich zwischen den Phasen
- [ ] Mehr Leben, aber fair telegrafiert

## Die Jungs

Rund sieben Leute, aufgeteilt auf mehrere Freundesgruppen. Die drei Besten
begleiten die ganze Nacht, die anderen tauchen in ihrer jeweiligen Etappe auf.

- [ ] Pro Level einen aus der Crew finden
- [ ] Jeder gibt eine Fähigkeit beim Anschließen
- [ ] Die drei Besten kriegen die stärksten Fähigkeiten
- [ ] Namen, Spitznamen und Eigenheiten festlegen
- [ ] Gesichter als Pixel-Köpfe, austauschbar ohne den Rest anzufassen
- [ ] Übersicht, wen man schon dabei hat

## Story

- [ ] Kurze Einblender zwischen den Leveln statt langer Dialoge
- [ ] Echte Geschichten aus der Crew einbauen
- [ ] Roter Faden: warum ist es diese eine Nacht?
- [ ] Ende mit Pointe

## Grafik

- [x] Gebäude im Schnitt mit Etagen, Boden, Wand, Licht
- [x] Deckenlampen mit Lichtkegel, manche flackern
- [x] Sichtkegel der Wachen sichtbar
- [ ] Fenster mit Außenlicht, Regen dagegen
- [ ] Mehr Einrichtung pro Raumtyp, Räume klarer unterscheidbar
- [ ] Übergangsanimation beim Betreten eines Raums statt hartem Schnitt
- [ ] Spiegelungen auf dem Boden
- [ ] Eigene Farbstimmung pro Level

## Technik

- [x] Bild-Cache für Sprites, Konturen, Schrift und Farbverläufe
- [x] Timing durchgängig in Spielzeit statt Wanduhrzeit
- [ ] Level in eigene Datei auslagern, wenn es mehr als drei werden
- [ ] Automatischer Testlauf, der jedes Level einmal durchspielt
- [ ] Ladezeit prüfen, wenn Grafiken dazukommen

## Erledigt und wieder rausgeflogen

- Endlos-Runner mit nachrückender Sperrstunde. War gut gebaut, passt aber
  nicht zum Story-Spiel. Liegt weiter unter `runner.html` und ist spielbar.
- Challenge-Codes zum Vergleichen mit Freunden. Gestrichen, weil es allein
  gespielt wird.
