# NACHTSCHICHT

*Party Game drunk.*

Ein Pixel-Art-Spiel im Browser über eine Nacht, die aus dem Ruder läuft. Jedes
Level ist eine Stufe des Abends. Kein Download, keine Installation, kein Konto.

**▶ [Jetzt spielen](https://nikros07.github.io/Nachtschicht/)**

> Was noch fehlt, steht in [TODO.md](TODO.md).

---

## Wie es weitergeht

Die Nacht läuft der Reihe nach. Am Anfang ist nur **Level 1** offen; wer es
schafft, macht das nächste auf. Unter dem Bild liegt eine Leiste mit allen
Leveln — anklickbar, was offen ist, gestrichelt, was noch zu ist oder noch gar
nicht existiert. Am Rechner geht auch die Zahlentaste.

Gespeichert wird im Browser: welches Level offen ist, wer aus der Crew dabei
ist, welche Bestzeiten stehen. Wer vorher schon gespielt hat, verliert nichts —
der alte Stand wird beim ersten Start übernommen.

Zum Ausprobieren: `?alle=1` an die Adresse hängen, dann sind alle gebauten Level
offen, ohne dass der Spielstand angefasst wird.

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

**Jeder Raum sieht anders aus.** Neun Raumstile mit eigenen Wandfarben, Fenstern
und Wanddeko, dazu zwanzig Möbelarten, die zum Raum passen: Leiter und Werkbank
beim Hausmeister, Bank und Matte in der Turnhalle, Waschbecken in der Chemie,
Kaffeemaschine im Lehrerzimmer, Bücherstapel in der Bibliothek. Auch die vier
Klassenzimmer sind nicht dasselbe Zimmer — anderer Wandton, andere Fensterzahl,
andere Einrichtung. Die Zahl der Suchplätze ist überall gleich geblieben: **30**.

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

Auf dem Siegbild führt `E` direkt weiter ins nächste Level, `Leertaste` startet
dieses hier nochmal.

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

### Die anderen im Raum

Die vier Jungs sind nicht die einzigen da. Über die Wohnung verteilt stehen
noch acht Leute rum, die überhaupt nichts von Dir wollen: eine tanzt seit einer
Stunde, zwei streiten sich im Wohnzimmer, einer kocht um halb zehn noch Nudeln,
einer sitzt auf dem Küchenboden, einer zockt in Moritz' Zimmer noch eine Runde,
und jemand wartet seit zehn Minuten aufs Bad.

Immer nur einer redet auf einmal, und je höher Dein Pegel, desto kürzer werden
die Pausen dazwischen — und desto weniger Inhalt haben die Sätze. Ansprechen
kannst Du sie mit `E`, aber sie sagen genau einen Satz. Sie stehen bewusst
nirgends im Weg: an einem Möbel gewinnt immer das Möbel.

### Der Pegel

Neu in diesem Level — und er begleitet Dich durch die restliche Nacht.

An den Getränken in der Küche trinkst Du mit `E`. Jeder Schluck bringt Dich
weiter. Ab einem gewissen Punkt traust Du Dich Sachen, die Du nüchtern nicht
machen würdest — zum Beispiel jemandem einfach das Handy abnehmen.

Aber: ab der Hälfte fängt das Bild an zu schwanken, ab 70 wirst Du spürbar
langsamer, und bei 100 ist **Blackout** auf Moritz' Sofa. Die grüne Markierung
auf dem Pegelbalken zeigt Dir, ab wo Du Mut hast.

**Du hörst es auch.** Die Musik läuft über einen eigenen Weg, an dem der Pegel
zieht: sie wird lauter, der Bass verstimmt sich, der Takt schleppt und eiert,
und im oberen Drittel kommt Übersteuerung dazu, während ein Tiefpass alles
zumacht. Bei Pegel 90 klingt das Vorglühen wie durch eine Wand. Geräusche —
Schritte, Treffer, Warnungen — bleiben absichtlich klar.

### Und dann klingelt es

Wenn alle bereit sind und Du zur Wohnungstür gehst, steht da jemand, den keiner
eingeladen hat. Das ist der **erste Kampf** im Spiel.

Du hast genau zwei Antworten — `E` und **springen** — und er sagt vorher an,
welche er sehen will. Der Balken über seinem Kopf ist die ganze Ansage:

| Was er macht | Wie es aussieht | Was Du tust |
|:--|:--|:--|
| **Schwinger** | roter Balken mit goldenem Endstück | `E`, aber erst wenn der Balken im Gold ist |
| **Tiefer Tritt** | blauer Balken, `SPRING` darüber | springen — `E` hilft hier nicht |
| **Finte** | roter Balken, der zurückschnellt | nicht draufgehen. Danach kommt der echte Schlag, schnell |
| **Flasche** | blauer Balken, erst in Phase 2 | springen, wenn sie ankommt |

**Zu früh gedrückt ist ein Fehlschlag.** Dann hängt der Arm draußen, ein Konter
geht eine halbe Sekunde lang nicht mehr — und der angesagte Schlag sitzt. Wer
blind hämmert, verliert.

Nach zwei Kontern kippt er in **Phase 2**: alles läuft schneller, und er fängt
an, Flaschen zu werfen. Dafür geht er auf Abstand — aus Armlänge wäre eine
Flasche nicht zu sehen. Viermal kontern, dann liegt er.

### Moritz

Danach schließt sich Moritz an: dunkle Haare, etwas größer als Du, weiß-blaues
Fußballtrikot, das er seit drei Tagen trägt. **Mit ihm läuft es besser mit den
Chayas** — das wird im Club-Level wichtig.

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

`level2.html` hat einen eigenen `TUNE`-Block nach demselben Muster:

| Regler | Bewirkt |
|:--|:--|
| `proSchluck` · `pegelAbbau` | Wie schnell der Pegel steigt und fällt |
| `mutAb` · `wackelnAb` · `langsamAb` · `blackoutBei` | Ab wann der Pegel was tut |
| `windupSchwinger` · `windupTief` · `windupWurf` | Vorwarnzeit pro Angriffsmuster |
| `windupFinte` · `finteStopp` · `windupFinte2` | Wie deutlich die Finte zu sehen ist |
| `konterFenster` | Wie groß das goldene Stück am Balken ist |
| `whiffDauer` | Wie teuer ein zu früher Druck ist |
| `phase2Tempo` | Wie viel schneller die zweite Hälfte läuft |

Die Wohnung liegt als Daten daneben: `ORTE`, `DINGE`, `LEUTE`, `AUFGABEN` und
`STATISTEN`. Ein Statist ist eine Zeile — Platz, Sprite, Name, Sprüche.

## Ein Level dazubauen

`spielstand.js` ist die einzige Stelle, die alle Level kennt. Ganz oben steht
die Liste:

```js
const LEVELS = [
  { nr:1, datei:'index.html',  name:'DIE SCHULE',   uhr:'16:40', bringt:'MAX FERDI' },
  { nr:2, datei:'level2.html', name:'BEI MORITZ',   uhr:'21:10', bringt:'MORITZ' },
  { nr:3, datei:null,          name:'DER NACHTBUS', uhr:'22:00' },
  …
];
```

`datei: null` heißt „gibt es noch nicht" — das Level taucht dann als
gestrichelter Eintrag auf, statt als toter Knopf. `bringt` ist der aus der Crew,
den das Level freischaltet.

Ein neues Level braucht drei Dinge:

1. Die `datei` in `LEVELS` eintragen.
2. `<script src="spielstand.js"></script>` vor das eigene Skript, darin
   `const DIESES_LEVEL = <nr>;` und `baueLevelleiste(DIESES_LEVEL);`.
3. Am Ende `Spielstand.geschafft(DIESES_LEVEL, S.zeit)` aufrufen — das schaltet
   das nächste frei und gibt zurück, ob es eine neue Bestzeit war.

Alles andere — Levelleiste, Levelwahl auf dem Titelbild, Zahlentasten,
Weiter-Knopf auf dem Siegbild — richtet sich danach von selbst.

Der Spielstand liegt unter einem einzigen Schlüssel (`nachtschicht.stand`) als
`{ frei, crew, zeiten }`. Kaputte oder fremde Daten werden beim Laden geprüft
und im Zweifel verworfen, statt das Spiel mitzunehmen.

## Lokal starten

Doppelklick auf `index.html` reicht — `spielstand.js` liegt bewusst als
klassisches Skript daneben und nicht als ES-Modul, weil der Browser Module
unter `file://` blockieren würde. Wer lieber einen Server will:

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
- Neun Raumstile mit eigenen Farben, Fenstern und Einrichtung, zwanzig Möbelarten

## Woran es sich orientiert

- **Night in the Woods** — Seitenansicht, Räume die man erst betreten muss
- **Oxenfree** — Jugendliche, eine einzige Nacht, es kippt ins Unheimliche
- **HerrAnwalt: Lawyers Legacy** — Pixel-Art, Schule, Springen und Schlagen

## Stand

Level 1 ist fertig und durchspielbar. Level 2 bis 8 sowie das Freischalten der
restlichen Crew stehen in [TODO.md](TODO.md).
