# NACHTSCHICHT

*Party Game drunk.*

Ein Pixel-Art-Spiel im Browser über eine Nacht, die aus dem Ruder läuft. Acht
Stationen, jede eine Stufe des Abends. Kein Download, keine Installation,
kein Konto.

**▶ [Jetzt spielen](https://nikros07.github.io/Nachtschicht/)**

> Was noch fehlt, steht in [TODO.md](TODO.md).

---

# Spielanleitung

## Die Karte

Nach dem Titelbild kommst Du auf **die Karte** — die Nacht als Kette von acht
Stationen. Mit `A` `D` wählst Du, mit `E` gehst Du los. Offene Stationen
leuchten, geschaffte sind golden, der Rest ist noch zu. Jede Station zeigt
Dir ihre Bestzeit und ihre Steuerung.

Zur Zeit ist **Station 1 gebaut**. Die anderen sieben stehen als Konzept auf
der Karte — anschauen ja, starten noch nicht. Was fehlt, steht in
[TODO.md](TODO.md).

---

## Station 1 — Die Schule

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

Danach läufst Du weiter — der Übergang zeigt Dir, wo es hingeht, und setzt
Dich auf der Karte an der nächsten Station ab.

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
| `zeitstrafe` · `leben` | Wie teuer ein Fehler ist |

## Ein Level dazubauen

Ein Level ist **reine Daten**. Die Spiellogik kennt keinen einzigen Wert aus der
Schule mehr — sie liest alles aus dem Level, das gerade geladen ist. Alle acht
Stationen der Nacht stehen in `LEVELS`, Level 1 als Objekt `SCHULE` darüber.

Ein weiteres Level der Bauart `schule` entsteht dadurch ohne eine Zeile Logik:
Objekt in `LEVELS` eintragen, `typ:'schule'` und `fertig:true` setzen, fertig.

| Feld | Was drinsteht |
|:--|:--|
| `typ` | Welche Spielart. Bisher gibt es nur `'schule'` |
| `fertig` | Ob es spielbar ist. Was fehlt, steht auf der Karte, startet aber nicht |
| `boden` · `breite` · `treppeL/R` | Der Bau: Etagenhöhen, Korridorlänge, Treppen |
| `start` · `ausgang` | Wo Du anfängst und wo Du rauskommst |
| `raeume` · `spinde` | Türen und Verstecke, je mit Etage und X |
| `aufsicht` | Wer patrouilliert. `chef`, `hausmeister`, `nurVariante` |
| `varianten` | Welche Spielarten ausgewürfelt werden |
| `uhr` | `start`, `ende`, `sekunden` — der Zeitdruck dieses Abschnitts |
| `intro` · `szenen` | Anfang und Abspann, `txt:null` holt Text aus `introVariante` |
| `nachrichten` · `notizen` | Was die Jungs schreiben, was rumliegt |
| `freischaltung` | Wer am Ende dazustößt (Eintrag aus `CREW`) |
| `gegner` | Wer sich prügelt. Ohne dieses Feld gibt es keinen Kampf |
| `steuerung` · `kurz` · `untertitel` | Was die Karte über die Station anzeigt |

Die Raumstile (`STIL`) sind levelunabhängig — jedes Gebäude darf sie benutzen.

## Der Kampf

Regler stehen in `KAMPF`, Gegnerarten in `GEGNER_ART`. Ein Level schaltet den
Kampf ein, indem es eine `gegner`-Liste mitbringt — Level 1 hat keine, dort
läuft nichts davon.

Jeder Gegner läuft immer denselben Kreis:

```
lauf → aus (holt aus) → schlag (gefährlich) → offen (angreifbar)
  ↑                                              │
  └────────────── block (undurchdringlich) ←──────┘
```

Vier Regeln machen den Unterschied zum alten Brawler:

- **Blocken.** Wer blockt, nimmt keinen Schaden — kann dafür aber auch nicht
  schlagen. Deckung kostet ihn Tempo.
- **Fehlschläge kosten.** Nach dem Schlag gibt Dir ein Treffer die Kontrolle
  nach 0,26 s zurück, ein Schlag ins Leere erst nach 0,62 s, einer in einen
  Block nach 0,80 s. Draufhauen ohne hinzuschauen ist teurer, als es bringt.
- **Kontern ist Timing.** Nur im **letzten Drittel** des Ausholens, kurz
  bevor sein Schlag kommt. Der Balken über seinem Kopf leuchtet auf, wenn das
  Fenster offen ist. Gepanzerte (`brocken`) lassen sich gar nicht kontern.
- **Ausdauer.** Vier Schläge, dann bist Du außer Atem. Sie erholt sich erst,
  wenn Du kurz die Finger stillhältst.

`E` ist die Kampftaste. Steht jemand vor Dir, schlägt `E` zu — sonst öffnet es
wie gewohnt Türen und durchsucht Möbel.

## Spielstand

Alles, was eine Runde überdauert, liegt in einem Eintrag unter
`nachtschicht.spielstand`: welche Station offen ist (`frei`), wer dabei ist
(`crew`), welche Bestzeiten stehen (`zeiten`). Ältere Stände aus der Zeit vor
der Levelauswahl werden beim ersten Start übernommen.

Die Jungs stehen in `CREW` — Name, Gabe, Wirkung. Ein neuer Junge ist ein
Eintrag dort plus ein `freischaltung` beim Level.

## Lokal starten

Doppelklick auf `index.html` reicht. Wer lieber einen Server will:

```bash
python -m http.server 5173
```

Mit `?touch=1` an der Adresse lässt sich die Handy-Steuerung am Rechner testen.

## Testen

```bash
npm install && npx playwright install chromium
npm test
```

Der Rauchtest startet `index.html` in einem echten Browser, spielt einen
Durchlauf und prüft die Regeln, die man beim Draufschauen nicht sieht: welche
Aufsicht in welcher Spielart im Haus steht, wann ein Konter zählt, was ein
Fehlschlag kostet, ob ein alter Spielstand übernommen wird. Jeder
Konsolenfehler lässt ihn scheitern. Er läuft auch in der CI bei jedem Push.

Steckt schon ein Chromium auf der Platte, geht es ohne Download:

```bash
CHROME_PATH=/pfad/zu/chrome npm test
```

## Technisch

- 320 × 180 interne Auflösung, Breite wächst auf breiten Schirmen mit
- Eigener 3×5-Bitmap-Font statt Browser-Schrift
- Sprites, Konturen, Schrift und Farbverläufe werden einmal gebacken und danach
  nur kopiert — Zeichenzeit 1,2 statt 4,8 ms pro Bild
- Bewegung mit Beschleunigung, Coyote-Zeit und Sprungpuffer
- Timing läuft in Spielzeit statt Wanduhrzeit
- Sieben Raumstile mit eigenen Farben, Fenstern und Einrichtung

## Woran es sich orientiert

- **Night in the Woods** — Seitenansicht, Räume die man erst betreten muss
- **Oxenfree** — Jugendliche, eine einzige Nacht, es kippt ins Unheimliche
- **HerrAnwalt: Lawyers Legacy** — Pixel-Art, Schule, Springen und Schlagen

## Stand

Level 1 ist fertig und durchspielbar. Das Gerüst für die Nacht steht: Level
sind Daten, der Spielstand hält Fortschritt und Crew, die Karte verbindet die
Stationen. Level 2 bis 8 brauchen jetzt vor allem Inhalt — und Level 2 zuerst
das Kampfsystem aus `runner.html`. Alles Offene steht in [TODO.md](TODO.md).
