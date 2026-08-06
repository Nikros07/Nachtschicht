# NACHTSCHICHT

*Party Game drunk.*

Ein Arcade-Brawler im Pixel-Art-Look. Du gehst durch eine Nacht, sammelst Shots,
schlägst Leute um und musst an vier Bossen vorbei. Je mehr Du trinkst, desto mehr
Punkte gibt es — und desto weniger kannst Du steuern.

**Nichts bewegt sich von allein.** Kein Auto-Lauf: Du gehst selbst, in Deinem
Tempo. Dafür kriecht von hinten die Sperrstunde heran, eine schwarze Wand, die
alles verschluckt. Wie der Adler bei Crossy Road — sie zwingt Dich, weiterzugehen,
und macht jede Entscheidung zwischen Kämpfen und Weiterziehen zu einer echten.

Läuft im Browser. Eine Datei, keine Installation, kein Konto.

## Steuerung

| Taste | Aktion |
|---|---|
| `A` / `D` bzw. `←` / `→` | Laufen |
| `Leertaste` / `W` / `↑` | Springen (kurz antippen = kleiner Hüpfer) |
| `S` / `↓` | Ducken |
| **`E`** (auch `X`, `J`, `Shift`) | Schlagen |
| `F` | Vollbild |
| `P` | Pause |
| `M` | Ton aus |

Du kannst vorpreschen, um jemanden früher zu erwischen, oder zurückweichen, um
einem Brocken auszuweichen. Über Gegner kann man auch **springen** — wenn die
Sperrstunde im Nacken sitzt, ist das oft klüger als jeden Kampf anzunehmen.

**Am Handy:** links unten die beiden Pfeile zum Laufen, rechts unten Schlag und
Sprung, darüber Ducken. Das Spiel läuft im **Querformat** — im Hochformat kommt
ein Hinweis zum Drehen. Die erste Berührung schaltet automatisch auf Vollbild
und versucht, die Ausrichtung zu sperren.

## Die Mechanik

**Die Sperrstunde** ist der Taktgeber. Eine schwarze Wand mit leuchtender Kante
und greifenden Händen, die von links nachrückt. Berührt sie Dich, ist sofort
Schluss — Herzen helfen da nicht. Sie wird schneller, wenn Du stehen bleibst,
und mit jedem zurückgelegten Kilometer:

| Strecke | Wie lange Du stehen bleiben darfst |
|---|---|
| Start | ~13 Sekunden |
| 1000 m | ~9 Sekunden |
| 3000 m | ~6 Sekunden |
| 5000 m | ~4,5 Sekunden |

Am Anfang reicht das locker, um eine Dreiergruppe zu verprügeln. Später musst Du
auswählen, welche Kämpfe Du annimmst. Im Bosskampf steht sie still — der Kampf
soll fair sein.

**Der Pegel** ist der zweite Kern. Jeder Shot bringt Punkte und treibt den Pegel hoch.
Ein hoher Pegel heißt: mehr Tempo, bis zu dreifache Punkte — aber das Bild wackelt,
die Steuerung wird träge, der Blick verengt sich. Bei 100 % ist Blackout.
Nüchtern wirst Du praktisch nur durch Wasser; von allein passiert fast nichts.

**Die Gegner** sind die Hauptsache, nicht die Hindernisse. Und sie laufen nicht
nur in Dich rein — sie **holen aus und schlagen zu**. Kurz bevor es passiert,
blinken sie weiß und ein Ausrufezeichen erscheint über dem Kopf. Die Farbe sagt
Dir, was zu tun ist:

| Zeichen | Angriff | Antwort |
|---|---|---|
| Blau | Schlag auf Kopfhöhe | Ducken |
| Gelb | Fegen am Boden | Springen |
| Rot | Trifft alles | Zurückweichen |

**Kontern** ist der Kern. Triffst Du einen Gegner, *während* er ausholt, geht er
sofort um — egal wie viel Leben er hat — und es gibt 120 Extrapunkte. Das ist der
Unterschied zwischen Draufhauen und gut Spielen. Nur Brocken sind gepanzert und
lassen sich nicht unterbrechen, denen musst Du wirklich ausweichen.

Die Typen:

- **Gegner** — Standard, ein Schlag, holt auf Kopfhöhe aus
- **Brocken** — zwei Schläge, gepanzert, roter Balken über dem Kopf, trifft alles
- **Flitzer** — schnell, fegt am Boden, muss übersprungen werden
- **Werfer** — bleibt auf Distanz und wirft Flaschen, muss gestellt werden
- **Taube** — fliegt auf Kopfhöhe durch

Sie kommen oft in Gruppen zu zweit oder dritt. Wer einen umhaut, reißt den
nächsten dahinter gleich mit um. Jeder KO in Folge treibt die Combo hoch.

**Du hast drei Herzen.** Ein Treffer kostet eines und macht Dich kurz
unverwundbar. Bei null ist Schluss — genauso wie beim Blackout, der zählt sofort.
Wer es brutal will, stellt `leben` im TUNE-Block auf 1.

**Die Bosse** kämpfen nach festen Mustern und kündigen jeden Angriff an:

- **Sturmangriff** → wegducken, danach steht er offen. Das ist Dein Konterfenster.
- **Flaschen** → drüberspringen.
- **Handlanger** → hoch und tief gleichzeitig, umhauen oder ausweichen.

Ab zwei Dritteln Restleben wechselt der Boss in Phase 2, ab einem Drittel in Phase 3.
Jede Phase ist schneller und mischt die Muster anders.

## Etappen

Vorglühen → Türsteher → Club → Afterhour → Heimweg. Jede Etappe hat eigene Farben,
eigenen Boss und teilweise Regen. Danach geht es endlos weiter, und die
Sperrstunde wird immer schneller.

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

Prototyp v0.6. Was noch fehlt: Plattformen zum Draufspringen, die echten
Gesichter der Crew, Charakterwahl mit unterschiedlichen Fähigkeiten,
ein richtiges Ende.
