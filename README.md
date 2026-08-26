# NACHTSCHICHT

*Party Game drunk.*

Ein Pixel-Art-Spiel im Browser über eine Nacht, die aus dem Ruder läuft. Jedes
Level ist eine Stufe des Abends. Kein Download, keine Installation, kein Konto.

**▶ [Jetzt spielen](https://nikros07.github.io/Nachtschicht/)**

> Was noch fehlt, steht in [TODO.md](TODO.md).

---

# Spielanleitung

## Level 1 — Die Schule

Freitag, letzter Schultag, 16:40. Du hast das Nachsitzen verpennt, alle sind weg,
die Türen sind zu. Heute Abend geht was, und da willst Du hin.

**Dein Ziel:** Schlüssel finden, Ausgang im Erdgeschoss aufschließen, raus.

**Deine Gegner:** Drei Etagen, zehn Räume, Lehrer auf jeder Etage, ein Direktor
der durchs ganze Gebäude wandert — und eine Uhr, die um **17:30** abläuft.

---

## Steuerung

| Taste | Aktion |
|:--|:--|
| `A` `D` oder `←` `→` | Laufen |
| `Leertaste` | Springen |
| `W` oder `↑` | Treppe hoch |
| `S` oder `↓` | Treppe runter |
| **`E`** | Tür öffnen · Möbel durchsuchen · in den Spind · Schlüssel klauen |
| **`Shift`** | Schleichen |
| **`R`** | Etwas werfen |
| **`Q`** | Taschenlampe an/aus |
| **`H`** | Handy stumm schalten |
| `F` Vollbild · `P` Pause · `M` Ton aus | |

**Am Handy** im Querformat: Steuerkreuz links, Aktionstasten rechts. Die erste
Berührung schaltet ins Vollbild.

---

## Zwei Spielarten

Beim Start sagt Dir das Intro, welche gerade läuft — sie wechselt jede Runde:

**Der Zweitschlüssel liegt irgendwo.** Durchsuch die Räume. Zettel helfen Dir.

**Der Hausmeister trägt ihn am Gürtel.** Du musst ihn ablenken. Dafür ist `R` da.

---

## Die Räume

Im Korridor siehst Du nur Türen. Was dahinter liegt, siehst Du erst, wenn Du
reingehst — unbetretene Türen zeigen `? ? ?`.

**Jeder Raum ist anders eingerichtet.** In der Turnhalle liegen Matte und Bock,
im Hausmeisterraum stehen Werkbank und Leiter, in der Bibliothek Bücherstapel
und Karteikasten, in der Chemie Abzug und Waschbecken, im Lehrerzimmer Sofa und
Kaffeemaschine. Auch die drei Klassenzimmer unterscheiden sich — Pult, Tafel,
Garderobe, Projektor in wechselnder Zusammenstellung. Du siehst an der
Einrichtung, wo Du bist.

Drinnen durchsuchst Du Möbel mit `E`. Die meisten sind leer, aber nicht alle:

| Fund | Wirkung |
|:--|:--|
| **Schlüssel** | Dein Ziel |
| **Zettel** | Erster Fund verrät die Etage, zweiter den Raum |
| **Akku** | +40 % Handy-Akku |
| **Energydrink** | 8 Sekunden lang 35 % schneller |
| **Notiz** | Erzählt Dir was über die Schule |

**Räume sind sicher.** Solange Du drin bist, kann Dich niemand sehen oder
schnappen.

---

## Wie Du nicht erwischt wirst

Jede Aufsicht hat einen **Sichtkegel** in Laufrichtung. Kommst Du hinein, füllt
sich ein Balken über ihrem Kopf — das ist Deine Reaktionszeit, kein Sofort-Alarm.
Ist er voll, wird gejagt. Du bist schneller als sie und kannst weglaufen.

Vier Möglichkeiten, gar nicht erst gesehen zu werden:

**Schleichen** (`Shift`) halbiert ihre Sichtweite und macht keine Schritte.
Kostet Tempo — Du läufst nur noch mit 42 %.

**Spinde** (`E` davor) verstecken Dich komplett. Von innen siehst Du durch den
Sehschlitz zu, wie sie vorbeigehen. Danach **10 Sekunden Abklingzeit**.

**Werfen** (`R`) wirft etwas 96 Pixel weit in Deine Blickrichtung. Wer es hört,
geht dem Geräusch nach und schaut sich dort um. Ein Wurf kann sogar eine
**laufende Verfolgung abbrechen** — aber nur, wenn er weit genug von Dir landet.

**Nicht springen.** Landen ist laut und weiter zu hören als ihre Sichtweite.
Wer schleicht, landet leise.

---

## Dein Handy

Dein wichtigstes Werkzeug — und Dein größtes Risiko.

**`Q` schaltet die Taschenlampe an.** Im zweiten Stock sind die Röhren kaputt,
ohne Licht siehst Du dort fast nichts. Aber das Leuchten macht Dich für die
Aufsicht **aus 1,7-facher Entfernung** sichtbar, und der Akku reicht nur für
rund 29 Sekunden.

**Deine Jungs schreiben Dir die ganze Zeit.** Die Nachrichten kommen, wenn was
passiert — beim ersten Raum, beim ersten Zettel, beim Etagenwechsel.

**Und jede Nachricht lässt das Handy vibrieren.** Das hört man. Steht gerade
jemand in der Nähe, hast Du ein Problem. Mit `H` schaltest Du stumm — dann
verpasst Du aber, was die Jungs schreiben.

---

## Die Aufsicht

| Wer | Verhalten |
|:--|:--|
| **Lehrer** | Patrouillieren eine Etage, machen Pausen und schauen sich um |
| **Der Direktor** | Wandert über alle Etagen, sieht deutlich weiter, gibt länger nicht auf — und folgt Dir die Treppe hoch |
| **Der Hausmeister** | Nur in seiner Spielart. Trägt den Schlüssel sichtbar am Gürtel |

Beim Hausmeister: wirf etwas, warte bis er hingeht, und greif zu solange über
ihm **JETZT** blinkt. Gehst Du hin während er hinschaut, passiert nichts außer
einer Abfuhr.

---

## Die Uhr

Du hast **165 Sekunden**, dann macht der Hausmeister seine letzte Runde und
schließt endgültig ab. Jedes Erwischtwerden kostet Dich zusätzlich **14 Sekunden**
— und ein Herz. Drei Herzen hast Du.

---

## Und am Ende

Am Ausgang steht jemand, der Dich nicht rauslassen will. Das klärt sich.
Danach triffst Du draußen **Max Ferdi** — der ist auch gerade abgehauen, durchs
Fenster, und ist Sportler. Ab dann läufst Du in jeder Runde **15 % schneller**.

Die Cutscene lässt sich mit gedrücktem `E` überspringen. Freischaltung und
Bestzeit zählen trotzdem.

---

## Ein paar Tipps

- **Zettel zuerst.** Zwei Funde grenzen die Suche von zehn Räumen auf einen ein.
- **Nicht jeden Meter rennen.** Schleichen kostet Zeit, aber Erwischtwerden
  kostet 14 Sekunden — das ist teurer.
- **Die Lampe nur wenn nötig.** Sie verdoppelt fast Deine Sichtbarkeit.
- **Der Spind ist kein Dauerversteck.** Nach 10 Sekunden Abklingzeit brauchst Du
  einen Plan B.
- **Der Direktor hat keine sichere Etage.** Wenn Du ihn hörst, ist er schon da.

---

---

## Level 2 — Bei Moritz

21:10. Vorglühen bei Moritz. Die Bahn fährt um **22:00**, vier Leute sitzen seit
zwei Stunden rum und keiner macht Anstalten loszugehen. Also machst Du es.

**Kein zweites Schleich-Level.** In Level 1 geht es darum, nicht gesehen zu
werden. Hier geht es darum, eine Meute in Bewegung zu kriegen.

### Vier Aufgaben

| Aufgabe | Wie |
|:--|:--|
| **Deine Jacke finden** | Möbel durchsuchen — sie liegt jede Runde woanders |
| **Moritz' Ausweis finden** | Auch versteckt. Ohne kommt er nirgends rein |
| **Den Schläfer wecken** | Er braucht einen Energydrink aus dem Kühlschrank |
| **Den Telefonierer holen** | Er hängt am Balkon am Telefon. Dafür brauchst Du **Mut** |

### Die anderen in der Wohnung

Außer den vier Jungs steht noch Volk rum, das nichts mit Dir zu tun hat: einer
im Wohnzimmer, der nicht mehr weiß woher er Dich kennt, die Nachbarin, der Typ
dem die Box gehört, ein Philosoph in der Küche und jemand, der seit zwanzig
Minuten vor dem Bad wartet. Sie nicken zum Bass und halten Dich nicht auf.

Ansprechen kannst Du sie trotzdem mit `E` — und **ab dem Mut-Pegel reden sie
anders mit Dir**. Nüchtern kriegst Du eine Abfuhr, betrunken einen Vortrag.

### Der Pegel

Neu in diesem Level — und er begleitet Dich durch die restliche Nacht.

An den Getränken in der Küche trinkst Du mit `E`. Jeder Schluck bringt Dich
weiter. Ab einem gewissen Punkt traust Du Dich Sachen, die Du nüchtern nicht
machen würdest — zum Beispiel jemandem einfach das Handy abnehmen.

Aber: ab der Hälfte fängt das Bild an zu schwanken, ab 70 wirst Du spürbar
langsamer, und bei 100 ist **Blackout** auf Moritz' Sofa. Die grüne Markierung
auf dem Pegelbalken zeigt Dir, ab wo Du Mut hast.

**Und Du hörst es.** Je höher der Pegel, desto lauter steht die Anlage, desto
mehr zerrt sie, desto mehr eiert das Tempo und desto weiter geht die zweite
Bassstimme gegen die erste. Bei 100 klingt das Vorglühen wie es sich anfühlt.

### Und dann klingelt es

Wenn alle bereit sind und Du zur Wohnungstür gehst, steht da jemand, den keiner
eingeladen hat. Das ist der **erste Kampf** im Spiel — und der bringt Dir in
vier Runden drei Sachen bei. Gekämpft wird im Flur; laufen und springen geht,
weglaufen nicht.

| Was er macht | Woran Du es siehst | Was Du machst |
|:--|:--|:--|
| **Schwinger** | roter Balken, `!` | `E` im Konterfenster — der helle Teil des Balkens |
| **Finte** | goldener Balken, `?` | **nichts.** Sie läuft ins Leere |
| **Ansturm** | blauer Balken, `>>` | **springen.** Kontern geht nicht |

**Runde 1** ist nur der Schwinger. **Ab Runde 2** kommt die Finte dazu, **ab
Runde 3** der Ansturm. Gleichzeitig wird seine Vorwarnzeit kürzer und das
Konterfenster enger — in der letzten Runde zählt nur noch die zweite Hälfte
des Ausholens.

**Danebenhauen kostet.** Wer auf Verdacht `E` drückt, vertritt sich und kann
kurz nicht kontern — ein grauer Balken zeigt, wie lange. Genau darauf ist die
Finte aus: Sie täuscht an, Du schlägst zu, und der Nachschlag kommt sofort und
ist nicht mehr zu kontern. Draufhauen ist in diesem Kampf schlechter als
nichts tun.

**Der Ansturm** ist die andere Hälfte: Er geht sichtbar zurück, nimmt Anlauf
und rennt los. Springst Du drüber, knallt er in die Wand und steht ein paar
Sekunden offen da — dann kostet ihn ein `E` einen Treffer, ohne Kontern.
Bleibst Du stehen, rennt er Dich um.

Viermal treffen, dann liegt er.

### Moritz

Danach schließt sich Moritz an: dunkle Haare, etwas größer als Du, weiß-blaues
Fußballtrikot, das er seit drei Tagen trägt. **Mit ihm läuft es besser mit den
Chayas** — das wird im Club-Level wichtig.

---

---

## Level 3 — Der Nachtbus

22:04. Ihr habt den Bus gerade noch gekriegt. Sechs Haltestellen bis zum Club.
Moritz hat ein Ticket, Max Ferdi hat ein Ticket. Du hast Dein Geld bei Moritz
gelassen.

**Kein Schleichen, kein Überreden.** Hier ist der Boden selbst das Problem.

### Der fahrende Untergrund

Der Bus schwankt, rumpelt, bremst und fährt an. Wer nicht festhält, fliegt hin —
und das ist laut.

| Taste | Aktion |
|:--|:--|
| `A` `D` | Laufen |
| **`Shift`** | **Festhalten** — an einer Stange, auf einem Sitz, an der Rückbank |
| **`E`** | Reden · unter dem Sitz suchen · Fahrschein ziehen · Tür |

Der Balken oben links ist Dein **Stand**. Er schlägt nach der Seite aus, in die
es Dich zieht. Schlägt er ganz aus, liegst Du.

- **Die Rückbank** ganz hinten hält von allein — da sitzt Du. Sicherer Ort.
- **Im Gelenk** in der Mitte schwankt alles doppelt so stark, und es gibt nur
  eine Stange. Dafür steht dort jemand, an dem man sich festhalten kann.
- **Schlaglöcher** kündigen sich an: es rumpelt eine halbe Sekunde vorher.
  Nüchtern fängst Du den Stoß im Stehen ab. Betrunken nicht mehr.
- **Beim Bremsen und beim Anfahren** hilft nur Festhalten. Beides wird
  angesagt.

### Der Pegel kommt mit

Was Du bei Moritz getrunken hast, stehst Du hier noch. Er baut langsam ab, aber
solange er hoch ist, schwankst Du stärker **und hältst weniger aus**. Bei 100
schläfst Du im Bus ein — das war's dann.

### Der Fahrschein

Unter den Sitzen liegt Kleingeld. **Drei Münzen**, dann kannst Du am Automaten
ganz vorne einen Fahrschein ziehen. Beim Suchen kannst Du Dich nicht festhalten.

### Die Kontrolleure

| Haltestelle | Was passiert |
|:--|:--|
| **RATHAUS** | Einer steigt vorne ein und arbeitet sich nach hinten durch |
| **SÜDPARK** | **Zwei** steigen ein, von beiden Türen |

Im Fahrplan oben sind beide von Anfang an **rot markiert**. Du weißt also, wann
es soweit ist.

Ein Kontrolleur läuft **in eine Richtung** durch den Bus und bleibt am Ende
stehen. Alles **vor seiner Tür** sieht er nie. Am Rathaus reicht es also, hinter
ihn zu kommen — an der Haltestelle raus, außen vorbei, hinter ihm wieder rein.
Dafür gehen die Türen an jeder Haltestelle ein paar Sekunden auf, und ein
Balken zeigt Dir, wie lange noch. **Wer draußen steht, wenn sie zugehen, fährt
nicht mit.**

Am Südpark hilft das nicht mehr: von beiden Seiten bleibt nichts übrig. Bis
dahin muss der Fahrschein stehen.

Und: **hinfallen macht Lärm.** Wer in Hörweite ist, dreht um und kommt zurück —
auch wenn er seine Runde schon durch hatte. Hinter ihm zu stehen hilft nur,
solange Du leise bist.

Jedes Erwischtwerden kostet ein Herz. Drei hast Du.

### Am Ende

An der Haltestelle **CLUB** gehst Du raus (`E` an einer Tür). Fährst Du dran
vorbei, war's das. Draußen schließt sich **der Lange** an — der stand die ganze
Fahrt im Gelenk, weil er das lustig findet, und er kennt den Türsteher.

---

## Der alte Modus

Vor den Levels war das hier ein Endlos-Brawler mit Kampfsystem, Kontern, fünf
Gegnertypen und vier Bossen. Der liegt unverändert in **[runner.html](runner.html)**:
[nikros07.github.io/Nachtschicht/runner.html](https://nikros07.github.io/Nachtschicht/runner.html)

---

# Für Entwickler

## Selbst dran drehen

Ganz oben in `index.html` steht ein Block namens `TUNE`. Dort liegt das komplette
Spielgefühl in benannten Werten. Die Spiellogik enthält keine festen Zahlen.

| Regler | Bewirkt |
|:--|:--|
| `gehTempo` · `beschleunigung` · `bremsung` | Wie sich Laufen anfühlt |
| `schleichTempo` · `schleichSicht` | Wie stark Schleichen wirkt |
| `sichtWeite` · `verdachtProSek` · `jagdTempo` | Wie gefährlich die Lehrer sind |
| `chefSicht` · `chefEtagenWechsel` | Wie präsent der Direktor ist |
| `wurfWeite` · `laermWeite` | Reichweite von Wurf und Geräusch |
| `akkuProSek` · `lampeSichtBonus` | Der Handel mit der Taschenlampe |
| `levelSekunden` · `zeitstrafe` | Wie hart die Uhr drückt |
| `leben` | Wie viele Fehler Du machen darfst |

Das Level selbst steht direkt darunter als Daten: `RAEUME`, `SPINDE`,
`LEHRER_START`, `BODEN`, `AUSGANG`, `STIL`. Räume dazuschreiben geht ohne eine
Zeile Logik. Die Sprüche und Nachrichten liegen in `NACHRICHTEN` und `NOTIZEN`.

`level2.html` ist genauso aufgebaut. Dort interessant:

| Regler | Bewirkt |
|:--|:--|
| `proSchluck` · `mutAb` · `wackelnAb` · `langsamAb` | Wie schnell der Pegel steigt und was er anrichtet |
| `verzerrungAb` · `verzerrungMax` · `lautBonus` · `schwankMax` | Wie hart der Pegel auf den Ton durchschlägt |
| `gegnerTreffer` | Wie viele Runden der Kampf dauert — **das ist auch die Zahl der Phasen** |
| `gegnerWindup` → `gegnerWindupMin` | Vorwarnzeit, erste bis letzte Phase |
| `konterFenster` → `konterFensterMin` | Anteil des Ausholens, in dem `E` zählt |
| `finteDauer` · `finteStrafe` | Wie lange die Finte läuft und wie kurz der Nachschlag ist |
| `anlaufDauer` · `sturmTempo` · `sturmSprung` · `benommenDauer` | Der Ansturm |
| `vertretenLang` · `vertretenKurz` | Was Danebenhauen kostet |
| `arenaVon` · `arenaBis` | Wie groß der Flur im Kampf ist |

Welches Muster in welcher Phase vorkommt, steht als Liste in `MUSTER`, die
Hinweise dazu in `PHASENHINWEIS`. Ein viertes Muster braucht einen Eintrag in
`MUSTER`, einen Zustand in `kampf()` und einen Eintrag in `KAMPF_TELL` für
Farbe und Zeichen — sonst nichts.

`level3.html` genauso. Dort interessant:

| Regler | Bewirkt |
|:--|:--|
| `schwanken` · `schwankTakt` · `reibung` | Wie der Bus im Normalbetrieb pendelt |
| `standFestigkeit` · `pegelStand` | Was Du aushältst, nüchtern und betrunken |
| `schlaglochStoss` · `schlaglochWarnung` · `schlaglochAb`/`Bis` | Die Schlaglöcher |
| `bremsKraft` · `anfahrKraft` · `gelenkFaktor` | Die harten Momente |
| `griffweite` · `griffAbbau` · `umfallDauer` | Festhalten und Hinfallen |
| `fahrtZeit` · `bremsZeit` · `anfahrZeit` · `tuerZeit` | Der Fahrplan |
| `kontrolleurTempo` · `pruefweite` · `hoerweite` | Die Kontrolleure |
| `preis` · `suchDauer` | Der Fahrschein |

Der Bus steht als Daten da: `ABSCHNITTE`, `SITZE`, `STANGEN`, `TUEREN`,
`AUTOMAT`, `LEUTE`, `MITFAHRER` — und `HALTESTELLEN`, wo auch drinsteht, an
welcher Haltestelle wie viele Kontrolleure zusteigen:

```js
{ name:'SUEDPARK', kontrolle:['vorne','hinten'] }
```

Eine Haltestelle mehr ist eine Zeile mehr. `SICHER_BIS` sagt, bis wohin die
Rückbank reicht — dort fällt niemand um.

Die Wohnung selbst steht in `ORTE`, `DINGE`, `LEUTE` und `STATISTEN`. Statisten
sind reine Daten: Position, Hemdfarbe, Haarfarbe, drei Zeilen nüchtern und zwei
ab dem Mut-Pegel. Sie dürfen nur nicht direkt vor einem Möbel stehen — bei
gleichem Abstand gewinnt die Person, und das Möbel wäre nicht mehr erreichbar.

## Fortschritt

Alles, was über ein einzelnes Level hinausgeht, steht in **`fortschritt.js`** —
welche Level es gibt, wer schon dabei ist, was freigeschaltet ist und welche
Bestzeiten stehen. Jede Level-Datei bindet sie als normales `<script src>` ein.

```js
const LEVEL = [
  { nr:1, datei:'index.html',  name:'DIE SCHULE',   gibt:'MAX FERDI' },
  { nr:2, datei:'level2.html', name:'BEI MORITZ',   gibt:'MORITZ'    },
  { nr:3, datei:null,          name:'DER NACHTBUS', gibt:null        },
  …
];
```

`datei: null` heißt: geplant, aber noch nicht gebaut. Solche Level stehen in der
Auswahl als `BALD`, gesperrte als `ZU`. Ein neues Level braucht **eine Zeile
hier** — die Leiste unter dem Bild, die Levelauswahl auf dem Titelbild und das
„weiter zu Level N" am Ende bauen sich daraus.

**Freigeschaltet** wird der Reihe nach: Level 1 ist immer offen, jedes weitere
braucht das davor. Wer einen alten Spielstand hat, verliert nichts — steht der
Junge eines Levels in der Crew, gilt das Level als geschafft.

| Aufruf | Macht |
|:--|:--|
| `Fortschritt.crew()` · `.hat(name)` · `.nimmAuf(name)` | Wer dabei ist |
| `Fortschritt.geschafft(nr)` · `.istGeschafft(nr)` | Level abhaken |
| `Fortschritt.frei(nr)` · `.spielbar(nr)` | Freigeschaltet / auch gebaut |
| `Fortschritt.bestzeit(nr)` · `.setzeBestzeit(nr,s)` | Bestzeiten, gibt `true` bei Rekord |
| `Fortschritt.naechstes(nr)` | Das nächste gebaute Level oder `null` |
| `Fortschritt.leiste(nr)` · `.auswahl(nr)` | Die Levelauswahl |
| `Fortschritt.zuruecksetzen()` | Alles löschen |

Gespeichert wird im `localStorage` unter `nachtschicht.crew`,
`nachtschicht.geschafft` und `nachtschicht.bestzeitN`.

## Lokal starten

Doppelklick auf `index.html` reicht — `fortschritt.js` liegt daneben und wird
als klassisches Script geladen, das geht auch über `file://`. Wer lieber einen
Server will:

```bash
python -m http.server 5173
```

Mit `?touch=1` an der Adresse lässt sich die Handy-Steuerung am Rechner testen.

## Technisch

- 320 × 180 interne Auflösung, Breite wächst auf breiten Schirmen mit
- Eigener 3×5-Bitmap-Font statt Browser-Schrift
- Sprites, Konturen, Schrift und Farbverläufe werden einmal gebacken und danach
  nur kopiert — Zeichenzeit 1,2 statt 4,8 ms pro Bild
- Bewegung mit Beschleunigung, Coyote-Zeit und Sprungpuffer
- Timing läuft in Spielzeit statt Wanduhrzeit
- Sieben Raumstile mit eigenen Farben, Fenstern und Einrichtung — 21 Möbelarten,
  jede einem Stil zugeordnet

## Woran es sich orientiert

- **Night in the Woods** — Seitenansicht, Räume die man erst betreten muss
- **Oxenfree** — Jugendliche, eine einzige Nacht, es kippt ins Unheimliche
- **HerrAnwalt: Lawyers Legacy** — Pixel-Art, Schule, Springen und Schlagen

## Stand

Level 1, 2 und 3 sind fertig und durchspielbar, und sie hängen über
`fortschritt.js` zusammen: Level schalten sich der Reihe nach frei, die Crew
wächst mit, und der Pegel aus Level 2 fährt im Bus mit.

Level 4 bis 8 stehen in [TODO.md](TODO.md).

> **Offen:** Der Junge aus Level 3 heißt aktuell **DER LANGE** — ein
> Platzhalter. Name und Eigenheiten stehen in `level3.html` in genau einem
> Eintrag in `LEUTE` und einmal in `fortschritt.js` (`gibt:`).
