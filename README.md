# NACHTSCHICHT

*Party Game drunk.*

Ein Pixel-Art-Story-Spiel im Browser. Eine Nacht, in Levels erzählt — von der
Schule über Vorglühen, Straße und Club bis zum Heimweg im Morgengrauen. Eine
einzige HTML-Datei, kein Download, kein Konto.

**Spielen: https://nikros07.github.io/Nachtschicht/**

> **Stand: v0.8 — Grundgerüst.** Level 1, die Schule, ist komplett durchspielbar.
> Die übrigen acht Level, das Kampfsystem und die Story sind in Arbeit.
> Was noch kommt, steht in [TODO.md](TODO.md).

---

## Level 1 — Die Schule

Du bist nachts allein in der Schule und kommst nicht raus. Der Ausgang ist
abgeschlossen, der Schlüssel liegt irgendwo in einem der zehn Räume, und über
drei Etagen patrouillieren Lehrer.

**Wie es sich spielt:** Du läufst durch die Flure und siehst nur die Türen — was
in einem Raum ist, erfährst Du erst, wenn Du reingehst. Drinnen durchsuchst Du
Pulte, Schränke und Regale. Meistens findest Du Staub. Irgendwo den Schlüssel.

Die Lehrer haben einen sichtbaren Sichtkegel. Sie sehen nur nach vorn, nur auf
ihrer eigenen Etage, und nicht in Räume hinein. **Ein Raum ist immer sicher** —
reingehen und warten, bis er vorbeigelaufen ist, ist eine echte Strategie.

Werden sie auf Dich aufmerksam, jagen sie Dich viereinhalb Sekunden lang und
sind dabei doppelt so schnell wie Du. Erwischen sie Dich, kostet es ein Herz und
Du landest an der nächsten Treppe. Drei Herzen, dann ist Schluss.

---

## Steuerung

| Taste | Aktion |
|:--|:--|
| `A` `D` oder `←` `→` | Laufen |
| `W` `S` oder `↑` `↓` | Treppe hoch und runter |
| `Leertaste` | Springen |
| **`E`** | Tür öffnen, durchsuchen, Ausgang aufschließen |
| `F` | Vollbild |
| `P` | Pause |
| `M` | Ton aus |

**Am Handy** im Querformat: links Steuerkreuz, rechts Sprung und `E`. Die erste
Berührung schaltet ins Vollbild. Im Hochformat kommt ein Hinweis zum Drehen.

Das Bild passt sich der Bildschirmform an — auf einem langen Handy wird die
Auflösung breiter statt schwarze Balken zu zeigen. Du siehst dort also **mehr**
vom Level, nicht weniger.

---

## Der Plan

Neun Level, jedes eine Stufe des Abends, jedes mit eigener Mechanik:

| # | Level | Was es besonders macht |
|:--|:--|:--|
| 1 | **Die Schule** | Stealth, Suchen, Horror-Anleihen |
| 2 | Vorglühen | Enge Küche, erste Shots |
| 3 | Der Nachtbus | Fahrend, wackelnd, Kontrolleure |
| 4 | Die Straße | Erste echte Kämpfe |
| 5 | Die Schlange | Türsteher, erster Boss |
| 6 | Der Club | Stroboskop, jemanden ansprechen |
| 7 | Afterhour | Surreal, die Schule kommt verzerrt zurück |
| 8 | Der Späti | Ruhepause, Story |
| 9 | Heimweg | Sonnenaufgang, letzter Boss |

**Die Jungs** sind der Kern: In jedem Level findest Du einen aus der Crew. Er
schließt sich an und gibt Dir eine Fähigkeit — Doppelsprung, mehr Ausdauer,
härterer Konter. Deine Freunde sind damit kein Deko-Element, sondern der
Spielfortschritt.

---

## Selbst dran drehen

Ganz oben in `index.html` steht `TUNE`: Lauftempo, Sprungkraft, Sichtweite der
Lehrer, wie lange sie Dich jagen, wie viele Herzen Du hast. Die Logik enthält
keine festen Zahlen, sie liest nur diesen Block.

Darunter steht `LEVELS`. Ein Level ist reine Beschreibung — Etagen, Türen,
Treppen, Wachen, Farben. Die Spiellogik weiß nichts von einer Schule, sie liest
nur diese Daten. Deshalb kommen Club, Straße und City später dazu, ohne dass an
der Logik etwas geändert werden muss.

```js
{
  id:'schule', name:'DIE SCHULE', breite:720,
  etagen:[246,184,122],
  treppen:[ {x:36,von:0,bis:2}, {x:664,von:0,bis:2} ],
  tueren:[ {x:150,etage:1,name:'RAUM 101',typ:'klasse'}, ... ],
  wachen:[ {x:400,etage:1,von:120,bis:640}, ... ],
}
```

---

## Lokal starten

Doppelklick auf `index.html` reicht. Oder:

```bash
python -m http.server 5173
```

Mit `?touch=1` an der Adresse lässt sich die Handy-Steuerung am Rechner testen.

---

## Technisch

- 180 Pixel hohe interne Auflösung, Breite wächst mit dem Bildschirm mit
- Eigener 3×5-Bitmap-Font statt Browser-Schrift
- Sprites, Konturen, Schrift und Farbverläufe werden einmal auf eigene
  Leinwände gebacken und danach nur noch kopiert
- Chiptune-Puls, der schneller wird, je näher ein Lehrer ist
- Sämtliches Timing in Spielzeit statt Wanduhrzeit
- CRT-Overlay mit Scanlines und Vignette

---

## Der alte Endlos-Modus

Vor dem Umbau war das hier ein Endlos-Runner mit einer nachrückenden Wand, dem
Pegel-System und vier Bossen. Der ist fertig und spielbar und liegt unter
[`runner.html`](runner.html). Er passt nur nicht mehr zur Richtung — deshalb
liegt er daneben statt im Weg.

---

## Fotos

Der Ordner `fotos/` ist absichtlich aus der Versionsverwaltung ausgeschlossen.
Dieses Repo ist öffentlich, damit GitHub Pages funktioniert — Bilder von echten
Personen haben darin nichts verloren. Aus den Fotos entstehen später
Pixel-Sprites, und nur die landen im Code.

---

## Woran es sich orientiert

- **Night in the Woods** — dass man nur den Eingang sieht, bis man reingeht.
  Genau dieser Effekt trägt das Schul-Level.
- **Oxenfree** — der Ton. Junge Leute, eine einzige Nacht, es kippt ins
  Unheimliche. Den Ton, nicht den Umfang.
- **HerrAnwalt: Lawyers Legacy** — Pixel-Art-Platformer, bei dem man springt
  *und* schlägt.
