# Änderungen

Was sich an NACHTSCHICHT geändert hat, so geschrieben, dass man es als Spieler versteht.
Die Versionsnummer steht im Spiel selbst (`nacht/geraet.js`, `GERAET.version`) und muss
mit der obersten Überschrift hier übereinstimmen — `node tools/launchcheck.js` prüft das.

## 1.0.0 - 2026-10-03

Die erste vollständige Fassung: eine ganze Nacht, von der Schule bis zum Heimweg, im Browser
und am Handy, ohne Download und ohne Konto.

### Neu am Handy

- **Neue Steuerung.** Links ein Stick, der dort erscheint, wo du den Daumen aufsetzt: sanft
  gezogen schleichst du, voll gezogen gehst du. Rechts ein großer Hauptknopf, die übrigen
  Knöpfe liegen im Bogen darum. Ein Tippen irgendwo auf der rechten Hälfte zählt als
  Hauptknopf.
- **Gespräche mit großen Antwortflächen** zum Antippen.
- **Menü** mit Weiter, Vollbild, Handy, Level wechseln und Einstellungen. Einstellbar sind:
  Hand (links/rechts), Größe der Knöpfe, Stick frei oder fest, Tippen rechts als Aktion,
  Vibration. Die Einstellungen bleiben auf dem Gerät.

### Neu im Spiel

- **Eine Lektion vor jedem Level.** Statt einer Tastenliste leuchtet jede Taste (am Handy:
  jeder Knopf) auf, sobald du sie ausprobierst — du merkst, dass sie geht, bevor es ernst
  wird. Sie erscheint nur beim ersten Mal je Level; ENTER gedrückt halten überspringt sie.
- **Eine Kampfsprache für alle Kämpfe:** Konter im goldenen Bereich, Blocken kostet Kraft,
  Rolle zum Ausweichen, Ausdauer.

### Neu für unterwegs

- **Offline spielbar.** Nach dem ersten Laden läuft die ganze Nacht auch ohne Netz.
- **Installierbar** als App mit eigenem Symbol: Vollbild, Querformat, Symbole für Android
  und iPhone.
- **Neue Version, ohne dass sie dich mitten in der Nacht stört:** das Spiel meldet
  „NEUE VERSION - TIPPEN ZUM LADEN" und wechselt erst, wenn du zustimmst.
- **Fehlerseite statt weißer Fläche:** geht etwas schief, zeigt das Spiel eine Seite mit
  NEU LADEN (der Fortschritt bleibt), ZUM MENÜ, SPIELSTAND LÖSCHEN und MELDEN. MELDEN öffnet eine
  vorbereitete Meldung auf GitHub; automatisch wird nichts gesendet. Der Ton hält an, wenn du den
  Tab verlässt. Wenn gar nichts mehr hilft: `?reset=1` an die Adresse hängen löscht den
  Spielstand und den Offline-Speicher dieses Spiels, `?reset=cache` nur den Offline-Speicher.
- **Link-Vorschau:** in Chats erscheint beim Teilen ein Bild mit Titel.

### Neue Seiten

- **Über NACHTSCHICHT** (`ueber.html`): Steuerung, Hinweise (Alkohol, Blitze und Flackern),
  Datenschutz, Impressum und Credits.
- **Diese Tür ist zu** (`404.html`): die Seite für Adressen, die es nicht gibt.

### Das Spiel selbst

Das alles steckt in der Nacht, die hier zum ersten Mal vollständig ist:

- **Acht Level:** Die Schule, Bei Moritz, Der Nachtbus, Die Schlange, Club, Afterhour,
  Späti, Heimweg — dazu ein **Bonus-Level** (Runner) außerhalb der Nacht.
- **Die Stadtkarte** zwischen den Leveln, mit Umwegen als Nebenaufgaben.
- **Gespräche mit Folgen.** Mut, Ruf, Geld, Beziehungen, wer dabei ist und was in der Tasche
  liegt: die Nacht merkt sich deine Entscheidungen, und das Finale liest viele davon.
  **Neun Enden.**
- **Schleichen, Reden, Suchen, Prügeln:** jedes Level spielt sich anders — Lehrer ausweichen,
  im Club Leute ansprechen, im Bus ohne Ticket durchkommen, in der Afterhour Erinnerungen
  suchen.
- **Dein Handy im Spiel:** Nachrichten und Antworten, die sich durch die Nacht ziehen.
- **Drei Schwierigkeitsgrade** (LOCKER, NORMAL, HART), auf dem Titelbild mit links/rechts
  zu wechseln.
- **Tiefe** in den Räumen, wo sie etwas bringt: man läuft auch nach hinten und vorne.
- **Der Ton entsteht im Browser** (keine Audiodateien), die Schrift ist eine eigene
  3×5-Pixelschrift.
- **Kein Konto, kein Tracking, keine fremden Server.** Gespeichert wird nur im Browser auf
  deinem Gerät.

### Für Entwickler

- `node tools/launchcheck.js` — statische Startprüfung (Kopfzeilen, Symbole, Manifest, Offline-
  Liste, Versionen, fremde Adressen, Reste). Exit 1 bei harten Fehlern.
- `python tools/paket.py` — baut `dist/nachtschicht-<version>.zip` für itch.io.
- `python tools/umbenennen.py` — tauscht die Namen der Crew aus, mit Vorschau und `--zurueck`.
- `python tools/version.py` — stempelt Seiten, Engine und Offline-Liste; `--pruefen` meldet,
  ob noch etwas ungestempelt ist.
- `python tools/server.py --lan` — Testserver ohne Cache, auch fürs Handy im WLAN.
- `tools/icons.py`, `tools/engine_einbinden.py` — Symbole erzeugen, neue Engine-Datei einhängen.
- `node test/launch.test.js` — Tests für die Startwerkzeuge.

## Davor

Der Weg bis hierher, grob nach der Git-Historie:

- **2026-08-05, v0.3 bis v0.4** — der erste Wurf: ein Arcade-Runner mit Nahkampf und
  Bosskämpfen, Vollbild, Querformat am Handy, freie Bewegung.
- **2026-08-06, v0.5 bis v0.8** — Kampftiefe (Gegner schlagen zurück, Kontern belohnt
  Timing), kein Endlos-Runner mehr, Umbau zum Level-Spiel, erstes Level fertig;
  Veröffentlichung über GitHub Pages.
- **2026-08-07 bis 2026-08-12** — Level 1 (Schule) mit Schleichen, Direktor, Hausmeister,
  Spind, Handy; Level 2 (Bei Moritz) mit Pegel und erstem Kampf; Levelauswahl.
- **2026-09-16 bis 2026-09-19** — Level 3 bis 8, eigene Handy-Fassung, Schwierigkeitsgrade,
  Stadtkarte; gemeinsame Engine statt neunfacher Kopie, Kampfsystem, Gespräche und
  Beziehungen.
- **2026-09-28 bis 2026-10-02** — Aufräumen und Ausbau: ein Gehäuse für alle Seiten, Tiefe
  nur wo sie etwas bringt, Lektionen, neue Handy-Steuerung, Ambiente im Club.
