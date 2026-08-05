# NACHTSCHICHT

Ein Arcade-Runner im Pixel-Art-Look. Du rennst durch eine Nacht, sammelst Shots,
schlägst Leute um und musst an vier Bossen vorbei. Je mehr Du trinkst, desto mehr
Punkte gibt es — und desto weniger kannst Du steuern.

Läuft im Browser. Eine Datei, keine Installation, kein Konto.

## Steuerung

| Taste | Aktion |
|---|---|
| `Leertaste` / `W` / `↑` | Springen (kurz antippen = kleiner Hüpfer) |
| `↓` / `S` | Ducken |
| `X` / `J` / `Shift` | Schlagen |
| `P` | Pause |
| `M` | Ton aus |

Am Handy: drei Flächen unten — links springen, mitte ducken, rechts schlagen.

## Die Mechanik

**Der Pegel** ist der Kern. Jeder Shot bringt Punkte und treibt den Pegel hoch.
Ein hoher Pegel heißt: mehr Tempo, bis zu dreifache Punkte — aber das Bild wackelt,
die Steuerung wird träge, der Blick verengt sich. Bei 100 % ist Blackout.
Nüchtern wirst Du praktisch nur durch Wasser; von allein passiert fast nichts.

**Die Bosse** kämpfen nach festen Mustern und kündigen jeden Angriff an:

- **Sturmangriff** → wegducken, danach steht er offen. Das ist Dein Konterfenster.
- **Flaschen** → drüberspringen.
- **Handlanger** → hoch und tief gleichzeitig, umhauen oder ausweichen.

Ab zwei Dritteln Restleben wechselt der Boss in Phase 2, ab einem Drittel in Phase 3.
Jede Phase ist schneller und mischt die Muster anders.

## Etappen

Vorglühen → Türsteher → Club → Afterhour → Heimweg. Jede Etappe hat eigene Farben,
eigenen Boss und teilweise Regen. Danach läuft es endlos weiter und wird schneller.

## Selbst dran drehen

Ganz oben in `index.html` steht ein Block namens `TUNE`. Da liegt das komplette
Spielgefühl in benannten Werten — Tempo, Sprunghöhe, wie hart der Pegel bestraft,
wie oft was kommt, wie viel Leben der Boss hat. Die Spiellogik selbst kennt keine
festen Zahlen, sie fragt nur diesen Block ab. Ein anderer Wert dort verändert das
ganze Spiel, ohne dass eine Zeile Logik angefasst werden muss.

Die Sprüche stehen darunter in `SAY`. Einfach Zeilen dazuschreiben, sie werden
zufällig gezogen.

## Lokal starten

Doppelklick auf `index.html` reicht. Wer lieber einen Server will:

```bash
python -m http.server 5173
```

Dann `http://localhost:5173` aufrufen.

## Fotos

Der Ordner `fotos/` ist absichtlich aus der Versionsverwaltung ausgeschlossen.
Dieses Repo ist öffentlich, damit GitHub Pages funktioniert — Bilder von echten
Personen haben darin nichts verloren. Aus den Fotos entstehen später
Pixel-Sprites, und nur die landen im Code.

## Woran es sich orientiert

- **HerrAnwalt: Lawyers Legacy** (YGameStudios) — Pixel-Art-Action-Platformer mit
  Story- und Endlosmodus, Springen und Schlagen, freischaltbaren Skins.
- Bosskampf-Regeln nach gängiger Praxis: erkennbare Angriffsmuster, jeder Angriff
  wird telegrafiert, mehrere Phasen, klare Silhouette gegen den Hintergrund,
  markierte Schwachstelle.
- Endlos-Runner-Praxis: simple Steuerung, Abwechslung bei den Hindernissen,
  Schwierigkeit steigt mit der Distanz, Highscore als Motivation.

## Stand

Prototyp v0.3. Was noch fehlt: die echten Gesichter, Charakterwahl mit
unterschiedlichen Fähigkeiten, ein richtiges Ende.
