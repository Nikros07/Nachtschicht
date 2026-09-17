# NACHTSCHICHT v2 — vom Prototyp zum Story-Game

Der Plan für den großen Ausbau. Nichts hiervon ist umgesetzt — erst wenn Du
zusagst, wird gebaut.

---

## Warum überhaupt

Der Ist-Zustand, gemessen statt geschätzt:

| | Ist | Soll |
|:--|:--|:--|
| Spielzeit alle 8 Level | **6–9 Minuten** | mehrere Abende |
| Story-Text im ganzen Spiel | **~120 Zeilen** | ein Vielfaches |
| Level mit echter Gegner-KI | **3 von 8** | alle, die welche brauchen |
| Bewegung | links / rechts auf einer Linie | Fläche mit Tiefe |
| Entscheidungen mit Folgen | **0** | tragen die ganze Nacht |

Level 7 ist 460 Pixel breit — anderthalb Bildschirme, ohne Möglichkeit zu
verlieren. Level 4 ist ein einziger Screen mit einem Gegner und zwei
Angriffsmustern. Fünf Level haben gar keine KI. Das Muster überall: von links
nach rechts laufen, zwei bis vier Punkte antippen, Ausgang berühren.

Level 1 ist das einzige, das schon nach Spiel aussieht — und enthält allein
mehr Inhalt als Level 4, 6, 7 und 8 zusammen.

---

## Entschieden

- **Engine-Umbau (Phase 0): ja.** Fundament zuerst, danach alles andere.
- **Reihenfolge Phase 3: chronologisch, Level 1 → 8.** Die Nacht wächst
  zusammenhängend, jeder Stand ist von vorne durchspielbar.
- **Zwei Kämpfe:** kleine Schlägerei im Club als Vorgeschmack und Einführung
  der Rivalen, der große Drei-Phasen-Fight als Finale in Level 8.

---

## Entscheidung vorab: eine gemeinsame Engine

**Das Problem:** 10.368 Zeilen in 9 Dateien, davon rund 40 KB Engine **neunmal
kopiert** — Font, Bild-Cache, Text, Audio, Input, Kamera, Game-Loop. Jede
Datei hat ihre eigene leicht abweichende Kopie.

Alles, was Du willst, ist quer durch alle Level: Tiefe, Gespräche, Kampf,
Speicherstand. Das neunmal einzeln zu bauen und neunmal zu pflegen, ist der
sichere Weg, dass das Projekt hängen bleibt.

**Also:** Engine einmal nach `nacht/` extrahieren, Level behalten nur noch
ihre eigenen Daten und Regeln.

```
nacht/kern.js      Loop, Canvas, Skalierung, Vollbild, Input, Touch
nacht/bild.js      Font, Sprites, Cache, Text, Verläufe
nacht/ton.js       Audio, SFX, Musik
nacht/welt.js      Bewegung mit Tiefe, Kamera, Kollision, Tiefensortierung
nacht/dialog.js    Gesprächsbäume, Auswahl-UI, Porträts
nacht/kampf.js     Nahkampf, Konter, Block, Ausdauer, Gegner-KI, Bosse
nacht/nacht.js     Werte, Beziehungen, Inventar, Speicherstand, Kapitel
level/1-schule.js  nur noch Level-Daten und Level-Regeln
...
```

**Wichtig — kein Build-Step, kein Modul-System.** Normale `<script src=…>`
Tags mit globalem Namensraum, keine ES-Module. Grund: ES-Module sind bei
`file://` vom Browser blockiert, und im README steht „Doppelklick auf
index.html reicht". Das bleibt so. GitHub Pages läuft unverändert weiter.

**Risiko:** Das ist ein Umbau an laufendem Code. Gegenmaßnahme: Level für
Level umstellen, nach jedem Level testen, nie mehr als ein Level gleichzeitig
kaputt.

---

## Die neuen Systeme

### 1. Tiefe — echtes 2.5D

Heute: `BODEN = 142`, eine einzige Linie. Bei Level 1 drei Linien (Etagen).
Die Y-Achse ist schon für **Sprunghöhe** belegt (Gravitation, `S.vy`).

Also kommt eine **dritte Achse** dazu:

- `S.x` — links/rechts wie bisher
- `S.t` — **Tiefe**, hinten/vorne (neu, auf W/S bzw. hoch/runter)
- `S.h` — Höhe über dem Boden (das bisherige Sprungsystem, umbenannt)

Gezeichnet wird bei `y = bodenOben + S.t * bodenTiefe - S.h`. Wer weiter
hinten steht, wird kleiner und **zuerst** gezeichnet — alle Figuren und
Objekte laufen durch eine Tiefensortierung.

Was das ändert: Flure werden Räume. Am Lehrer vorbeischleichen heißt nicht
mehr „warten bis er wegschaut", sondern **hinten rum gehen**. Der Sichtkegel
wird ein echter Kegel in der Fläche. Im Kampf kannst Du einem Schlag
ausweichen, indem Du eine Ebene zurückgehst. Die Tanzfläche im Club wird eine
Fläche, durch die Du Dich drängelst.

### 2. Gespräche mit Entscheidungsbaum

Das Rückgrat vom Story-Game. Gespräche sind Daten, keine Sonderfälle:

```js
{ wer:'MORITZ', text:'Alter, wir kommen da nie rein.',
  wahl:[
    { txt:'Lass mich reden.',        wenn:{mut:'>40'}, geh:'ueberreden' },
    { txt:'Wir warten einfach.',                        geh:'warten' },
    { txt:'Ich kenn da wen.',        wenn:{crew:'SEMIH'}, geh:'vip' },
  ], zeit:6 }
```

- **Bedingungen**: Auswahlmöglichkeiten erscheinen nur, wenn Werte, Crew,
  Inventar oder frühere Entscheidungen stimmen
- **Zeitdruck**: `zeit: 6` — sechs Sekunden, sonst antwortet der Charakter für
  Dich. Nicht überall, aber wo es zählt
- **Folgen**: jede Antwort kann Werte ändern, Beziehungen bewegen, Flags
  setzen, die Stunden später noch wirken
- Porträt-Köpfe als Pixel-Sprites (der Kopf ist im Code schon ein eigener
  Block, siehe TODO.md)

### 3. Die Werte der Nacht

Fünf Zahlen tragen den ganzen Abend und werden zwischen den Leveln
weitergereicht:

| Wert | Bedeutet | Steigt durch | Fällt durch |
|:--|:--|:--|:--|
| **PEGEL** | wie betrunken (existiert schon) | Trinken | Zeit, Wasser, Essen |
| **MUT** | was Du Dich traust | Pegel, Erfolge, Crew dabei | Abfuhren, Niederlagen |
| **RUF** | wie die Leute Dich sehen | Kämpfe gewinnen, Leuten helfen | Rausflüge, Abfuhren, Feigheit |
| **KONDITION** | wie fit Du noch bist | Pausen, Essen, Energydrink | Rennen, Kämpfen, die Zeit |
| **GELD** | Bargeld | Pfand, Wetten | Getränke, Türsteher, Taxi |

Sie sperren und öffnen Inhalte: ohne Geld kommst Du nicht am Türsteher vorbei
(oder musst kämpfen), ohne Mut sprichst Du niemanden an, ohne Kondition
verlierst Du den Sprint zur Bahn.

### 4. Beziehungen

Jede Person — Crew und Mädels — hat einen Beziehungswert. Er verändert sich
durch Deine Entscheidungen im Gespräch und dadurch, ob Du für sie da bist.

Er entscheidet, **wer am Ende der Nacht noch dabei ist**. Wen Du versetzt,
der geht irgendwann heim. Wer Dir vertraut, hilft Dir im Kampf, holt Dich aus
der Schlange, deckt Dich vor dem Kontrolleur.

### 5. Richtiges Kampfsystem

Das gute Kampfsystem liegt in `runner.html` und wird im Spiel **nicht
benutzt**: fünf Gegnertypen, vier Bosse mit drei Phasen, Trefferzonen (hoch /
tief / voll), Combos, Fernangriffe, Knockback, Hit-Stop. Die bessere
Konter-Mathematik liegt in Level 4: Konterfenster als Anteil vom Ausholen
(34 %), Fehlschlag-Strafe, zwei Muster, Crew-Bonus.

Der neue Kern nimmt **beides** und ergänzt, was in TODO.md gefordert ist und
bisher nirgends existiert:

- **Blocken** — Gegner *und* Spieler. Damit werden unblockbare Angriffe
  überhaupt erst zu etwas
- **Ausdauer** — nicht unbegrenzt schlagen. Das beendet das Knopf-Hämmern
- **Ausweichrolle in die Tiefe** — mit kurzen i-Frames
- **Fehlschläge bestrafen** — lange Erholung nach Luftschlag
- **Konterfenster auf ein Drittel** — heute in runner.html auf 1.0, also das
  ganze Ausholen
- **Arena ändert sich pro Boss-Phase**

### 6. Inventar

Sachen, die Du mitschleppst und die mehrere Probleme lösen: Pfandflaschen,
Feuerzeug, Energydrink, Wasser, Ticket, Ausweis, Handy mit Akku, geklaute
Schlüssel, ein Schuhkarton voll Silvesterraketen.

Der Punkt ist nicht das Sammeln, sondern dass fast jedes Hindernis **mehrere
Lösungen** hat: Türsteher → überreden (Gespräch), bezahlen (Geld), Hintertür
(Schleichen), oder Kloppe (Kampf).

### 7. Speicherstand und Kapitel

Heute gibt es `crew`, `pegel` und acht Bestzeiten. Für ein Spiel über mehrere
Abende braucht es einen echten Speicherstand: Kapitel, Werte, Beziehungen,
Inventar, gesetzte Flags, erledigte Nebenaufgaben, gesehene Enden. Dazu ein
Kapitel-Menü zum Wiedereinsteigen und Nachspielen.

### 8. Die Nacht verzweigt sich

Kein fester Pfad mehr durch acht Level. An Schlüsselstellen teilt sich der
Weg: Kommst Du in den guten Club oder landest Du im Absturz-Laden? Fährst Du
mit der Bahn oder klaust Du ein Fahrrad? Bleibt die Crew zusammen oder
zerfällt sie?

Am Ende stehen **mehrere Enden**, die sich aus Werten, Beziehungen und
Entscheidungen ergeben — vom „allein im Morgengrauen" bis „die Nacht, von der
alle noch reden".

### 9. Stadtkarte zwischen den Leveln

Statt harter Sprünge von Level zu Level: eine Karte der Stadt, auf der Du
Dich bewegst und die Route wählst. Unterwegs Zufallsbegegnungen — ein
Streithahn, ein Pfandsammler, eine Polizeikontrolle, jemand, der Feuer will.
Kurze Szenen, die die Nacht unvorhersehbar machen.

### 10. Das Handy als eigenes System

In Level 1 gibt es schon Nachrichten von den Jungs. Das wird ausgebaut zu
einem echten Nebenkanal: Gruppenchat, der auf Deine Nacht reagiert, **mit
Antwortmöglichkeiten**, Akku als echte Ressource, eine Liste „wer ist noch
wach", Standort teilen, und Nachrichten, die zum falschen Zeitpunkt
vibrieren.

### 11. Nebenaufgaben

Hier kommt die Spielzeit her, nicht aus längeren Hauptwegen. Pro Level zwei
bis vier optionale Sachen: den Typ finden, der seine Jacke sucht. Alle
Graffitis fotografieren. Die Wette gewinnen. Den Späti-Besitzer nach seiner
Geschichte fragen. Das versteckte Hinterzimmer. Sachen, die man beim ersten
Durchlauf verpasst.

### 12. Minispiele

Mehr Sorten, verteilt über die Nacht: Auf-Ex (existiert), Ansprechen
(existiert), Kickern, Bierdeckel-Fangen, Rauchkringel, Tanzen im Takt,
Türsteher-Blickduell, Flaschendrehen, das Handy eines Schlafenden entsperren.

---

## Level für Level

Jedes Level geht von ~1 Minute auf **15–30 Minuten**, plus Nebenaufgaben.

### Level 1 — Die Schule
Das beste bestehende Level, kriegt Tiefe und ein zweites Ziel. Neben dem
Schlüssel musst Du Dein **eingezogenes Handy** aus dem Lehrerzimmer holen —
ohne das gibt es die ganze Nacht keine Nachrichten. Neu: Keller, echte
Lehrer-Routinen (Kaffee holen, Klo, Kopierer), Spind mit Zahlencode, die
Hausmeister-Schlüsselbund-Nummer, eine optionale Abrechnung mit dem Direktor.

### Level 2 — Bei Moritz
Aus vier Aufgaben wird eine Wohnung voller Leute: acht Räume mit Tiefe,
zehn NPCs mit eigenen Gesprächsbäumen, Trinkspiele als Minispiele. **Hier
entscheidest Du, wen Du mitnimmst** — und das trägt bis zum Ende. Der Kampf
am Ende lässt sich wegreden, wenn Du gut bist. Dazu der Nachbar, der klingelt,
und die Frage, ob ihr aufmacht.

### Level 3 — Der Nachtbus
Das Level, das Dir gefallen hat — bleibt im Kern, wird größer. Aus einem
Waggon werden mehrere, mit Tiefe und Durchgängen. Mehr Kontrolleure mit
echten Routinen, Fahrgäste zum Ansprechen und als Deckung, ein Betrunkener,
der eine Szene macht (Ablenkung, wenn Du sie nutzt), ein Ticketautomat für
Leute mit Geld, die Notbremse, und **die erste echte Kloppe** gegen eine
andere Gruppe im letzten Waggon.

### Level 4 — Die Schlange
Aktuell das dünnste Level, wird zu einer kompletten Szene. Die Schlange selbst
ist voller Leute: vordrängeln (Risiko), quatschen, Informationen sammeln. Der
Türsteher bewertet **Ruf, Pegel, Crew und Klamotten**. Vier Wege rein:
überreden, bezahlen, Hintertür schleichen, oder Kampf. Dazu die rivalisierende
Gruppe, die Dir das ganze restliche Spiel begegnet.

### Level 5 — Club — das Herzstück
Dein Hauptwunsch, das größte Level. Mehrere Bereiche mit Tiefe: Tanzfläche,
Bar, Raucherecke, Klos, VIP.

**Das Ansprechen wird ein echtes Gespräch mit Entscheidungsbaum.** Drei bis
fünf Mädels, jede mit eigener Persönlichkeit, eigenen Themen und eigener
Reaktion darauf, wie Du auftrittst. Pegel, Mut, Ruf und wer neben Dir steht
verändern, welche Antworten Du überhaupt wählen kannst. Falsche Masche →
Abfuhr, und die spricht sich im Club rum.

Läuft es gut, geht ihr zusammen weg — **die Szene blendet ab**, erzählt statt
gezeigt, und danach ist der Abend ein anderer. Beziehungswert, Ruf hoch, und
jemand, der Dir später noch schreibt.

Dazu: ein Rivale, der dieselben Mädels anmacht, Tanz-Minispiel,
Crew-Mitglieder, die abwandern wenn Du sie vergisst, eine Schlägerei, die
ausbricht, und der Rausschmiss.

### Level 6 — Afterhour
Das seltsame Level. Traumlogik statt Regeln: Räume, die sich anders verhalten,
Gespräche mit Leuten, die nicht da sind, ein Inventar, das spinnt, die Schule
aus Level 1, die falsch wiederkommt. Der Gegner ist die eigene Erschöpfung.

### Level 7 — Späti
Die Ruhepause wird die Szene, in der die Nacht Bilanz zieht. Der Besitzer hat
eine Geschichte. Draußen sitzen die anderen Nachtmenschen: ein Taxifahrer,
ein Mädchen, das heult, einer der seine Freunde verloren hat. **Pfandsammeln
als Minispiel**, wenn Du pleite bist. Und die Entscheidung, wie die Nacht
endet — heim, weiterziehen, oder auf den Sonnenaufgang warten.

### Level 8 — Heimweg
Das Finale mit dem großen Fight (siehe unten) und danach dem Wettlauf gegen
die Sonne, jetzt mit Tiefe, echten Hindernissen und der Crew, die
mitrennt — oder nicht. Mehrere Enden, abhängig von der ganzen Nacht.

---

## Die zwei Kämpfe

### Der kleine — Schlägerei im Club (Level 5 → 6)

Der Vorgeschmack. Im Club eskaliert es mit der rivalisierenden Gruppe: kurzer
Kampf auf der Tanzfläche im Stroboskop-Licht, schlechte Sicht, Leute im Weg.
Führt direkt zum Rausschmiss und damit in die Afterhour.

Hier lernst Du das Kampfsystem richtig kennen — Blocken, Ausdauer, Ausweichen
in die Tiefe — und hier siehst Du **zum ersten Mal das Gesicht des Anführers**.
Gewinnen ist nicht nötig; wie es ausgeht, verschiebt nur Ruf und Ausgangslage.

### Der große — das Finale (Level 8)

Ein richtiger Boss, nicht das jetzige „fünfmal im richtigen Moment drücken":
**der Anführer der rivalisierenden Gruppe**, die Dich seit Level 4 verfolgt
und die Du im Club schon einmal getroffen hast.

- **Drei Phasen**, und die **Arena ändert sich pro Phase** — von der Straße
  in den Hinterhof auf die Baustelle
- Phase 1: sauberer Zweikampf, Blocken und Kontern
- Phase 2: seine Leute mischen sich ein, Du kämpfst gegen mehrere gleichzeitig
  und musst die Tiefe nutzen, um nicht eingekreist zu werden
- Phase 3: unblockbare Angriffe mit kurzer Vorwarnung, Fernwürfe, wenig
  Ausdauer auf beiden Seiten
- **Deine Crew kämpft mit** — wie gut, hängt an den Beziehungswerten. Wer
  Dich mag, geht dazwischen. Wen Du versetzt hast, schaut zu
- Verlieren ist möglich und ändert das Ende, beendet aber nicht das Spiel

---

## Schwierigkeit

Du hast es in fünf Minuten entspannt durchgespielt — das ändert sich
grundsätzlich:

- **Gegner-KI überall.** Heute haben fünf von acht Leveln gar keine
- Sichtkegel in der Fläche statt auf einer Linie — Verstecken wird Planung
- Ressourcen sind knapp: Akku, Geld, Kondition, Zeit
- Fehler kosten dauerhaft, nicht nur kurz: Abfuhren sprechen sich rum,
  verlorene Crew kommt nicht wieder
- Kampf mit Ausdauer und Fehlschlag-Strafe — Hämmern funktioniert nicht mehr
- **Drei Schwierigkeitsgrade**, weil die Nacht sonst für Gäste unspielbar wird

---

## Reihenfolge

Jede Phase endet mit einem spielbaren Spiel. Nie ein halbfertiger Zustand.

| Phase | Was | Ergebnis |
|:--|:--|:--|
| **0** | Engine extrahieren, Level umstellen | Spiel läuft wie vorher, Basis steht |
| **1** | Tiefe, Gespräche, Werte, Speicherstand | Level fühlen sich als Räume an, erste echte Dialoge |
| **2** | Kampfsystem + der große Fight | Kloppe macht Spaß |
| **3** | Level 1–8 ausbauen, chronologisch der Reihe nach | Die eigentliche Spielzeit |
| **4** | Stadtkarte, Handy, Verzweigungen, Enden | Aus Leveln wird eine Nacht |
| **5** | Nebenaufgaben, Balancing, Schwierigkeitsgrade | Rund und schwer |

Phase 3 ist mit Abstand der größte Brocken — acht Level, jedes von einer
Minute auf zwanzig. Die lässt sich gut auf mehrere Sitzungen verteilen und
einzeln abnehmen, Level für Level.

---

## Was das realistisch heißt

Das ist kein Nachmittag. Aus 10.000 Zeilen werden grob 25.000–35.000. Phase 0
bis 2 sind das Fundament und müssen zusammenhängen. Phase 3 ist Fließarbeit
und kann portioniert werden — pro Sitzung ein bis zwei Level.

Ehrlich zur Spielzeit: „eine Woche" heißt bei einem Spiel dieser Art
realistisch **mehrere Abende à ein bis zwei Stunden**, mit Nebenaufgaben und
zweitem Durchlauf für die anderen Enden. Das ist ein anderes Spiel als jetzt,
aber kein Open-World-Titel — und das ist gut so, weil die Stärke hier die
dichte, erzählte Nacht ist.

---

## Noch offen

1. **Pixel-Köpfe und echte Namen der Jungs** — in TODO.md steht „kommt vom
   Nick". Solange nichts da ist, bleiben Jonas/Dennis/Semih/Lea als
   Platzhalter und werden später ersetzt. Blockiert nichts.
2. **Club-Szene**: bleibt erzählt und abgeblendet — Fokus auf dem Gespräch und
   der sozialen Herausforderung, nicht auf Expliziterem.
