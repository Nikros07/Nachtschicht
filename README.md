# NACHTSCHICHT

*Party Game drunk.*

Ein Pixel-Art-Spiel im Browser über eine Nacht, die aus dem Ruder läuft. Jedes
Level ist eine Stufe des Abends. Kein Download, keine Installation, kein Konto.

**Jetzt spielen: [nikros07.github.io/Nachtschicht](https://nikros07.github.io/Nachtschicht/)**

> Was noch fehlt, steht in [TODO.md](TODO.md).

---

## Level 1 — Die Schule

Es ist nach Schulschluss und Du kommst nicht raus. Irgendwo im Gebäude liegt ein
Schlüssel. Die Lehrer sind noch da.

**Das Ziel:** Schlüssel finden, Ausgang im Erdgeschoss aufschließen, raus.

**Der Haken:** Drei Etagen, zehn Räume, und auf jeder Etage patrouilliert jemand.

### Wie es sich spielt

Du siehst das Gebäude von der Seite — Korridore, Türen, Treppen. Was hinter einer
Tür ist, siehst Du erst, wenn Du reingehst. Türen, in denen Du noch nie warst,
zeigen nur `? ? ?`.

In den Räumen durchsuchst Du Schränke, Tische und Regale. Die meisten sind leer.
Einer hat den Schlüssel.

**Räume sind sicher.** Solange Du drin bist, kann Dich niemand sehen oder
schnappen. Das ist Dein Versteck, wenn ein Lehrer den Korridor entlangkommt.

### Die Lehrer

Jeder Lehrer hat einen Sichtkegel in Laufrichtung. Kommst Du hinein, füllt sich
über seinem Kopf ein Balken — das ist Deine Reaktionszeit. Ist er voll, wird
gejagt.

Du bist schneller als sie. Weglaufen funktioniert, in einen Raum abbiegen auch.
Wirst Du erwischt, kostet das ein Herz und Du landest wieder an der Treppe.
Drei Herzen, dann ist die Nacht vorbei, bevor sie angefangen hat.

Zum Verhältnis: die Türen sind zwischen **81 und 97 Prozent der Zeit** sicher
erreichbar. Es gibt immer ein Fenster, man muss es nur abwarten.

### Und am Ende

Am Ausgang steht jemand, der Dich nicht rauslassen will. Das klärt sich.

---

## Steuerung

| Taste | Aktion |
|:--|:--|
| `A` `D` oder `←` `→` | Laufen |
| `Leertaste` | Springen |
| `W` oder `↑` | Treppe hoch |
| `S` oder `↓` | Treppe runter |
| **`E`** | Tür öffnen, durchsuchen, reden |
| `F` | Vollbild |
| `P` | Pause |
| `M` | Ton aus |

**Am Handy** im Querformat: Steuerkreuz links, Aktionstasten rechts. Die erste
Berührung schaltet ins Vollbild. Im Hochformat kommt ein Hinweis zum Drehen.

---

## Der alte Modus

Vor den Levels war das hier ein Endlos-Brawler mit Kampfsystem, Kontern, fünf
Gegnertypen und vier Bossen. Der liegt unverändert in **[runner.html](runner.html)**
und ist weiter spielbar:
[nikros07.github.io/Nachtschicht/runner.html](https://nikros07.github.io/Nachtschicht/runner.html)

Das Kampfsystem daraus wandert nach und nach in die Level.

---

## Selbst dran drehen

Ganz oben in `index.html` steht ein Block namens `TUNE`. Dort liegt das komplette
Spielgefühl in benannten Werten. Die Spiellogik enthält keine festen Zahlen, sie
fragt nur diesen Block ab.

| Regler | Bewirkt |
|:--|:--|
| `gehTempo` | Wie schnell Du läufst |
| `beschleunigung` / `bremsung` | Wie träge sich die Bewegung anfühlt |
| `sichtWeite` | Wie weit die Lehrer sehen |
| `verdachtProSek` | Wie schnell sie Dich bemerken |
| `jagdTempo` | Wie schnell sie hinter Dir her sind |
| `leben` | Wie viele Fehler Du machen darfst |
| `suchDauer` | Wie lange eine Durchsuchung dauert |

Das Level selbst steht direkt darunter als Daten: `RAEUME`, `LEHRER_START`,
`BODEN`, `AUSGANG`. Räume dazuschreiben geht ohne eine Zeile Logik.

---

## Lokal starten

Doppelklick auf `index.html` reicht. Wer lieber einen Server will:

```bash
python -m http.server 5173
```

Mit `?touch=1` an der Adresse lässt sich die Handy-Steuerung am Rechner testen.

---

## Technisch

- 320 × 180 interne Auflösung, Breite wächst auf breiten Schirmen mit, damit
  keine schwarzen Balken bleiben
- Eigener 3×5-Bitmap-Font statt Browser-Schrift
- Sprites, Konturen, Schrift und Farbverläufe werden einmal gebacken und danach
  nur kopiert — Zeichenzeit 1,2 statt 4,8 ms pro Bild
- Bewegung mit Beschleunigung, Coyote-Zeit und Sprungpuffer
- Timing läuft in Spielzeit statt Wanduhrzeit, damit Pause nichts zerlegt

---

## Woran es sich orientiert

- **Night in the Woods** — Seitenansicht, Räume, in die man erst hineingehen
  muss, um zu sehen was drin ist. Das ist die Vorlage für das Schul-Level
- **Oxenfree** — Jugendliche, eine einzige Nacht, es kippt ins Unheimliche
- **HerrAnwalt: Lawyers Legacy** — Pixel-Art, Schule, Springen und Schlagen

---

## Stand

Level 1 ist spielbar und durchspielbar. Die Story, die anderen sieben Level und
das Freischalten der Crew stehen in [TODO.md](TODO.md).
