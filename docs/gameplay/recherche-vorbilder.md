# Recherche: Wie vergleichbare Spiele nicht monoton sind

Stand: 2026-10-05, fertig. Rein analysierend, keine Spieldatei geändert. Umfang etwa 3400 Wörter ohne Quellen.
Messskript: `docs/gameplay/messung/vorbilder-inventur.js` (Start aus der Projektwurzel mit `node`).
Quellen: WebSearch/WebFetch (Liste am Ende). Was mit **(eW)** markiert ist, stammt aus eigenem
Wissen über die Spiele und ist nicht durch eine der unten genannten Quellen belegt.

## Inhalt

1. Ausgangslage NACHTSCHICHT (gemessen)
2. Was die Vorbilder machen
3. 32 übertragbare Muster (Ziel-Level, Umsetzung, Priorität, Aufwand)
4. Reihenfolge und Abhängigkeiten
5. Quellen

---

## 1. Ausgangslage (gemessen)

`node docs/gameplay/messung/vorbilder-inventur.js` liest `LEKTIONEN` aus der geladenen Seite
(über `tools/nachttest.js`) und den Rest statisch aus dem Quelltext:

| Level | Verben laut Lektion (Pflicht / optional) | Musik | Bestzeit | Rang |
|:--|:--|:--|:--|:--|
| 1 Schule | LAUFEN, SCHLEICHEN, TÜR / TREPPE, SPRINGEN, LAMPE, WERFEN | BASS + BASS_JAGD, je 16 Schritte, 74/126 bpm | ja | nein |
| 2 Moritz | LAUFEN, REDEN | BASS 16, 128 bpm | ja | nein |
| 3 Nachtbus | LAUFEN, SPRINGEN, REDEN, BLOCKEN | BASS 16, 100 bpm | ja | nein |
| 4 Schlange | LAUFEN, KONTERN, BLOCKEN, ROLLEN / AUSWEICHEN | BASS 16, 118 bpm, +5 % je Treffer | ja | nein |
| 5 Club | LAUFEN, REDEN | BASS 16, 136 bpm, lauter mit Pegel | ja | nein |
| 6 Afterhour | LAUFEN, REDEN | DROHN 16, 70 bpm | ja | nein |
| 7 Späti | LAUFEN, REDEN | PAD 16, 70 bpm | ja | nein |
| 8 Heimweg | LAUFEN, SPRINGEN, ROLLEN / BLOCKEN | BASS 16, 112 bis 152 bpm mit dem Licht | ja | nein |

Was daraus folgt:

- **Die Verben sind vorn geballt.** Level 1 lehrt sieben, danach kommen nur noch Kampfverben dazu.
  Vier von acht Leveln (2, 5, 6, 7) spielen sich laut Lektion mit „Laufen + E". Celeste macht das
  Gegenteil: jedes Kapitel bringt eigene Elemente. Das ist die wahrscheinlichste Ursache für
  „monoton": nicht zu wenig Inhalt, sondern zu wenig *neue Handlungen*.
- **Musik:** jedes Level eine einzige 16-Schritt-Reihe, keine Melodie, keine Akkorde, keine
  Abschnitte. Drei Level passen sie schon an (Jagd-Variante in Level 1, Tempo in 4 und 8, Lautstärke
  in 5) – das Prinzip „Musik folgt dem Spiel" ist also angelegt, es fehlt nur das Material.
- **Wertung:** Bestzeit überall, aber kein Rang, keine Combo, keine Herausforderung. Am Levelende
  sieht man eine Zeit – keinen Grund, es nochmal zu versuchen.
- **Neustart:** `NOCHMAL` ruft `neuesSpiel()` und setzt `S.modus='titel'`. Level 3 beginnt damit wieder
  beim Sprint, auch wenn man im Bus gescheitert ist; Level 1 verliert bis zu 165 s
  (`TUNE.levelSekunden`). Hotline Miami und Katana Zero setzen nach einer Sekunde am Raum wieder ein.
- **Spielgefühl:** Korrektur zur ersten Annahme des Orchestrators – ein Hitstop **existiert**:
  `KAMPF.hitStop: 0.07` in `nacht/kampf.js`, genutzt über `kampfZeitFaktor()` in Level 3, 4, 5 und 8.
  Er fehlt im Kracher-Kampf von Level 2 (eigene Kampflogik ohne `kampf.js`) und außerhalb von Kämpfen.
  Partikel gibt es nur in Level 1 (`STAUB` beim Springen, Landen, Werfen), kein gemeinsames System.
- **Längen:** Level 5 hat `levelSekunden: 600` Laufzeit plus Gespräche, länger als eine typische
  Handy-Sitzung (Median laut Udonis 3,1 bis 3,5 min, siehe Quellen).
- **Club-Ereignisse** (`TUNE.CLUB_EREIGNISSE`, `ambientTakt`) sind reiner Text über `meldung()` –
  „LICHT GEHT KURZ AUS" passiert nicht wirklich.

---

## 2. Was die Vorbilder machen

**Night in the Woods.** Der Kern ist Gehen und Reden, aber fast jeder Tag hat eine *andere* kleine
Spielform: Bass-Rhythmusspiel bei der Bandprobe, Messerkampf im Wald, Ladendiebstahl, ein ganzer
Dungeon-Crawler auf dem Laptop (Demontower), Traum-Plattformer mit Dreifachsprung. Laut Hardcore Gamer
sieht man beim ersten Durchgang weniger als die Hälfte dieser Einlagen – Variation ist auch Grund
zum Wiederspielen. Die Bandprobe ist absichtlich schwer, weil Mae aus der Übung ist: Die Schwierigkeit
erzählt mit.

**Oxenfree.** „Walk and talk": Sprechblasen erscheinen beim Gehen, man bleibt beweglich. Antworten kann
man jederzeit geben, auch dazwischenreden oder schweigen; die Figuren reden weiter und greifen
Unterbrechungen auf („Also, wie ich sagte …"). Gespräche sind dadurch nie Pause, sondern Spiel.

**Katana Zero.** Ein Treffer tötet, der Raum wird sofort neu gestartet, und nach jedem gelungenen
Abschnitt läuft eine Wiederholung des eigenen Laufs (VHS-Rahmen: Zurückspulen beim Tod). Im Dialog kann
man unterbrechen, bevor die Antworten erscheinen – das hat Folgen. Der Entwickler wollte ausdrücklich
ein Story-Spiel, das „nicht warten lässt".

**Hotline Miami.** Sofortneustart nach dem Tod, Musik als Motor, und am Ende eine **Wertung in
Kategorien** (Killings, Boldness, Combos, Time Bonus, Flexibility, Mobility) mit Buchstabennote. Ab C-
schaltet das Level eine Maske frei, die beim nächsten Mal das Spiel verändert.

**Scott Pilgrim vs. the World: The Game.** Beat-'em-up mit Combos, Bossen mit bildschirmfüllenden
Angriffen. Für NACHTSCHICHT am wichtigsten ist die Musik: das erste Stück „Another Winter" **baut sich
im Level auf** und fügt bis zur Mitte Spuren hinzu, und der Club-Song wird **dumpf, wenn man nach draußen
geht**. Kritik: Level 4 ist zu lang, manche Gefahren nerven – Gimmicks brauchen Dosierung.

**WarioWare.** Mikrospiele von wenigen Sekunden mit einem Wort Anweisung **(eW)**, zufällig verkettet, das
Tempo steigt in Stufen (Smooth Moves: ein Halbton bei Nr. 5, zwei weitere bei Nr. 9), und am Ende steht
ein **Boss-Mikrospiel ohne Zeitlimit, bei dem das Tempo wieder zurückfällt**. Spannung, Steigerung,
Entladung.

**Untitled Goose Game.** Kleine Räume, eine **To-do-Liste** mit Zielen vom kleinen Ärgernis bis zum
mehrstufigen Streich. Komik entsteht aus übertriebenen Reaktionen der Menschen; die Liste stupst an,
lässt aber freies Herumprobieren zu. Die Entwickler schrieben die Ziele nach Dingen, die im Spiel schon
gingen, und füllten Stellen auf, an denen etwas „funktionieren sollte".

**Pizza Tower.** Combo-Leiste von 6,7 s, die jeder Gegner und jedes Sammelding auffüllt und ein Treffer um
2,5 s kürzt. Ränge D bis S plus P-Rang (Combo hält das ganze Level, alle Geheimnisse, Runde 2). Am Ende
jedes Levels **Pizza Time**: Countdown, neue Musik, der Weg zurück zum Anfang, oft mit geänderten Wegen.
Wer will, nimmt eine zweite Runde mit nochmal anderer Musik.

**Celeste.** Bildschirmgroße Räume, Neustart am Raum. Jedes Kapitel bringt eigene Elemente (Kapitel 2
Traumblöcke, 4 Wind, 6 Federn), Kapitel 7 setzt sie zusammen. Erdbeeren sind optional und schwer; die
goldene Erdbeere verlangt das Kapitel ohne einen Tod. B-Seiten (über Kassetten) fordern die Meisterung
des Kapitel-Gimmicks. Dazu ein **Hilfsmodus** (Tempo, Unverwundbarkeit, Überspringen).

**Undertale.** Jede Begegnung hat ihr eigenes Ausweichmuster, dessen Form die Figur erzählt (die Tränen
des Geists, die Muskeln des Pferds), und eigene ACT-Optionen, mit denen man ohne Gewalt gewinnen kann.

**Rhythm Heaven.** Vier bis sechs Spiele je Satz, danach ein **Remix**, der alle zusammen zu einem neuen
Lied mischt. Ränge „Try Again / OK / Superb"; Superb bringt Medaillen für Extras. Der Rhythmus wird vor
allem **über Töne** angekündigt, Bilder täuschen manchmal absichtlich.

**Overcooked.** Jede Küche hat ein Gimmick, das Rollen durcheinanderbringt (kippendes Schiff, fahrende
Lastwagen, Inseln auf Lava). Ende: 1 bis 3 Sterne; Sterne öffnen neue Level. Kritik: zu hohe
Schwellen wirken wie Streckung.

**Stardew Valley.** Ein einziges Angel-Minispiel, aber fünf Fischverhalten (gleichmäßig, sanft,
sinkend, steigend, sprunghaft) machen jeden Fang anders. Der grüne Balken wächst mit der Fertigkeit.

**Paper Mario.** Action Commands: Timing-, Halte- und Hämmer-Eingaben während eigener und fremder
Angriffe – ein Grund, auch in belanglosen Momenten aufzupassen.

**Florence.** Jedes Kapitel ein Behälter für mehrere einfache Touch-Mechaniken („zwischen WarioWare
und interaktivem Comic", Ken Wong). Gespräche sind Puzzles aus Sprechblasen-Teilen, die mit der
Beziehung **weniger und leichter** werden, bis zwei Hälften fast von selbst zusammenfinden. Die Mechanik
trägt das Gefühl.

**Spielgefühl allgemein.** „Juice it or lose it" (Jonasson/Purho, 2012) und „The Art of Screenshake"
(Nijman, Vlambeer): Hitstop von 40 bis 80 ms, kurzes Wackeln, Squash & Stretch, Funken und Aufblitzen
beim Treffer. **Schwierigkeit:** Resident Evil 4 passt Gegner unsichtbar über eine interne Note von
1 bis 10 an; versteckt, damit sich Erfolg verdient anfühlt.

---

## 3. Die Muster

Format je Muster: **Vorbild** – Kern. *Ziel-Level*. Umsetzung. [Priorität, Aufwand S/M/L]
Alle Umsetzungen halten die Projektregeln ein: Stellschrauben im `TUNE`-Block, Blitze und Wackeln über
`FX`, Texte ohne Umlaute auf dem Canvas, neue Texte in `nacht/texte.js`, neue Engine-Dateien über
`tools/engine_einbinden.py`.

### A. Tempo und Fluss

**M1 Sofortneustart am Abschnitt** – Hotline Miami, Katana Zero, Celeste: Scheitern kostet eine
Sekunde, nicht drei Minuten. *Level 3, 1, 8, 4.* `neuesSpiel(abschnitt)` bekommt einen optionalen
Abschnitt; Level 3 merkt `S.letzteSzene` (gibt es schon) und startet nach einem Rauswurf im Bus direkt
im Bus mit dem Pegel vom Einstieg. Level 1: Abschnitt je Etage oder nach dem Schlüssel. Ende-Bildschirm:
Hauptknopf `NOCHMAL AB HIER`, zweiter Knopf `GANZ VON VORN` (über `mobilKontext().zwei`). Ohne Titel
und Intro dazwischen. [muss, M]

**M2 Musik in Schichten** – Scott Pilgrim (Spuren kommen im Level dazu), vertikale Schichtung. *Alle
Level.* Neue Engine-Datei `nacht/musik.js` nach `ton.js`: `MUSIK.spuren={bass,schlag,akkord,melodie}`,
jede mit Notenreihe (16 oder 32 Schritte) und Ziel-Lautstärke; ein Planer wie das bestehende `musik()`
mit `MUS.next`. Das Level setzt nur `MUSIK.stufe(0..3)` je Fortschritt (Level 2: je erledigter Aufgabe
eine Spur mehr, Level 6: je Erinnerung). Lautstärke über `GainNode`-Rampen, nie Neustart der Spur. [muss, L]

**M3 Takt-genaue Wechsel und Raumklang** – horizontale Umordnung, Scott Pilgrim (Club dumpf von
draußen). *Level 1, 5.* Wechsel nur auf der nächsten Taktgrenze (`MUS.step%16===0`). Level 5: auf dem
Klo ein `BiquadFilterNode` (Tiefpass 400 Hz) vor dem Ausgang, an der Tanzfläche offen. Level 1: Übergang
zu `BASS_JAGD` mit einem Fill-Takt statt hartem Schnitt. [soll, S]

**M4 Fluchtsequenz nach dem Ziel** – Pizza Tower „Pizza Time". *Level 1 (Hauptkandidat), Level 5.*
Level 1: Schlüssel gefunden → Durchsage `HAUSMEISTER SCHLIESST AB`, Countdown `TUNE.fluchtSek` (etwa 30),
Musik auf Jagd, Lehrer `tempo*1.3`, eine schon bekannte Tür ist zu, ein Fenster offen. Level 5: nach der
Marvin-Schlägerei räumt die Security, 20 s zum Afterhour-Ausgang. Das Level kippt so im letzten Fünftel
von Suchen zu Rennen – genau dort, wo die Spannung fehlt. [muss, M]

**M5 Spannungskurve je Level** – WarioWare (Tempostufen, Boss setzt zurück). *Level 2, 7.* Jedes Level
braucht einen hörbaren Schlussanstieg. Level 2: ab 30 s vor dem Bus `BUS IN 0:30` groß, Tempo der Musik
wie in Level 8 (`60/(128+drang*24)/4`), Crew ruft. Level 7 bewusst umgekehrt: Tempo sinkt, wenn alle
auf der Bank sitzen. [soll, S]

**M6 Jede Schleife ändert eine Regel** – Celeste (ein Element je Raum), WarioWare (Überraschung).
*Level 6.* Der Flur wiederholt sich ohnehin; `TUNE.schleifenRegeln=['rueckwaerts','dunkel','stumm',
'spiegel']`: Schleife 1 Lehrer gehen rückwärts, Schleife 2 Licht nur beim Gehen, Schleife 3 Ton weg und
nur Untertitel, Schleife 4 Bild gespiegelt (Steuerung bleibt). Eine Regel pro Durchgang, angekündigt mit
einer Zeile. Macht aus Wiederholung Absicht. [soll, M]

### B. Verben und Elemente

**M7 Ein neues Verb pro Level** – Celeste, Night in the Woods. *Level 2, 5, 6, 7.* Gemessen: dort nur
Laufen + E. Vorschläge: Level 2 **TRAGEN** (Kasten, Musikbox, Schlafenden Finn schleppen – langsamer,
kein Sprung, absetzen mit E), Level 5 **TANZEN** (M14), Level 6 **SCHWEBEN** (M15), Level 7 **WERFEN**
(Pfandflaschen in den Automaten, Bogenwurf, Wiederverwendung von Level 1 `R`). Jedes Verb bekommt
einen Schritt in `LEKTIONEN` (`nacht/lehre.js`) und einen Knopf in `mobilKontext()`. [muss, M je Level]

**M8 Remix-Finale** – Rhythm Heaven (Remix), Celeste Kapitel 7. *Level 8.* Der Heimweg in vier
Abschnitte von je 15 bis 25 s, jeder holt ein altes Verb zurück: Schleichen an einer Streife vorbei
(Sichtkegel aus `welt.js`), Hindernis-Sprint (Level 3), ein Konter im goldenen Fenster wie beim Türsteher
(Level 4), zum Schluss im Takt gehen (Level 5). Sonne bleibt die Uhr. Die Musik zitiert in jedem Abschnitt die Bassline des
Herkunftslevels. [soll, L]

**M9 Raum-Gimmick** – Overcooked (kippendes Schiff), Scott Pilgrim. *Level 3.* Der Bus fährt Kurven
und hält: `TUNE.kurveAlle:11`, bei `KURVE!` rutschen alle 20 px, wer nicht `SHIFT` (festhalten) drückt,
stolpert in den Gang; Kontrolleure stolpern auch (Fenster zum Vorbeischlüpfen). An Haltestellen steigen
Leute ein – neue Verstecke, die wieder aussteigen. Wackeln über `FX.wackel`. [soll, M]

### C. Mikrospiele und Timing

**M10 Mikrospiel-Kette** – WarioWare, Florence. *Level 2.* Vorglühen als Kette aus 4-s-Spielen mit einem
Wort: `AUF!` (Kronkorken: E im Takt), `FANG!` (Chips mit Stick), `SCHENK!` (E halten bis zur Linie),
`PROST!` (E, wenn die Gläser sich treffen), `PSST!` (still halten, Nachbar klopft). Tabelle
`MIKRO=[{wort,dauer,start,takt,zeichne}]` im Level, zufällige Reihenfolge, nach vier Spielen Tempo
×1,15, drei Fehler erlaubt. „Boss" ist der Kracher-Kampf. Ergebnis wirkt auf Pegel und Stimmung.
Eingebettet als Station (die Küche), nicht als Ersatz für das Level. [soll, M]

**M11 Action Commands in Alltagsaktionen** – Paper Mario. *Level 2, 7.* Suchen (`suchDauer:0.6`)
und Bezahlen bekommen ein optionales Timing: E genau beim Aufleuchten → `SAUBER!` und Bonus
(Fund doppelt, Rabatt an der Kasse). Wer nicht trifft, verliert nichts. Gleiche Zeichnung wie die
Konter-Leiste aus `kampf.js`, damit nichts Neues gelernt werden muss. [kann, S]

**M12 Gleiche Leiste, anderes Verhalten** – Stardew Valley (fünf Fischarten). *Level 5.* Das
Ansprech-Minispiel nutzt für alle dieselbe Markerbewegung (`ansprechTempo:170`). Je Person ein Muster:
`ansprechMuster:{mia:'gleich',kira:'sprung',sophie:'zoegern'}` – gleichmäßig, mit zufälligen
Richtungswechseln, mit kurzen Stopps. Das Fenster wächst mit `mag` (wie Stardews Fertigkeit). Kostet
wenige Zeilen in der Marker-Bewegung. [soll, S]

**M13 Die Mechanik trägt das Gefühl** – Florence. *Level 6, 7.* Bei Lea (Level 6) wird das
Gesprächsfenster mit jeder gefundenen Erinnerung größer und langsamer, bis es zuletzt nicht mehr zu
verfehlen ist. Level 7: Crew-Mitglieder auf die Bank „rücken" (Stick nach links ziehen, sie rutschen
nach). Keine Herausforderung, sondern Ausdruck. [kann, S]

**M14 Tanzen im Takt** – Rhythm Heaven, Night in the Woods (Bandprobe). *Level 5.* Neues Verb: auf der
Tanzfläche E auf den Schlag (136 bpm). Bewertet über den Abstand von `AC.currentTime` zum nächsten
`MUS.next`-Schritt; `TUNE.tanzFenster:0.09` s. Acht Treffer in Folge laden Confidence (gibt es schon:
`confidenceDauer`). Ankündigung über einen Ton vor dem Bild (Rhythm Heaven), damit es auch mit
Flackerschutz und im Stroboskop spielbar ist. [soll, M]

**M15 Traum-Plattformer** – Night in the Woods (Träume). *Level 6.* Nur hier: hoher, langsamer
Schwebesprung (`TUNE.traumGravitation` ein Drittel von sonst), Erinnerungen hängen auch oben. Gibt
dem Afterhour ein eigenes Körpergefühl statt nur verzerrter Optik. [soll, M]

### D. Begegnungen und Bosse

**M16 Jede Begegnung ein eigenes Muster** – Undertale. *Level 3, 5, 8.* `gegner(art,…)` in
`kampf.js` kennt Arten; jede Figur bekommt ein Signaturmuster, das ihren Charakter zeigt: der
Kontrolleur „stempelt" (drei kurze Stöße im Takt), Marvin „posiert" (lange Pause, dann Doppelschlag),
der Finalgegner wechselt die Tiefe. Dazu je eine Nicht-Gewalt-Option wie ACT (Marvin: `ANSTOSSEN`
wird wählbar, wenn er zweimal gekontert wurde). Flags nach `docs/launch/flags-vertrag.md`. [soll, M]

**M17 Sichtbare Phasenwechsel** – Scott Pilgrim, Undertale. *Level 4, 8.* Level 4 hat schon drei
Phasen (`phase2Ab`, `phase3Ab`, Rammstoß ab Phase 2), aber der Wechsel ist stumm. Je Wechsel 1 s
Stillstand: Spruch des Türstehers, die Schlange johlt, eine Musikschicht kommt dazu (M2), Kamera
zoomt einen Pixel. Gleiches Schema für den Finalkampf in Level 8. [soll, S]

**M18 Gimmick-Ereignisse statt Text** – WarioWare (Zufall), Overcooked. *Level 5.* Die
`CLUB_EREIGNISSE` werden spielwirksam: `LICHT GEHT AUS` = 4 s Dunkelphase (Anrempeln wie im
Stroboskop), `NEBELMASCHINE` = halbe Sichtweite, `DJ WECHSELT DEN TRACK` = neue Bassline und neuer
Tanztakt (M14), `JEMAND RUFT NACH EINEM SHOT` = Theke 10 s gratis. Tabelle aus `{text, dauer, wirkung}`
statt Zeichenketten; `ambientTakt` ruft die Wirkung. [soll, S]

### E. Wertung, Belohnung, Wiederspielreiz

**M19 Rang am Levelende** – Pizza Tower, Hotline Miami, Overcooked, Rhythm Heaven. *Alle Level.* Neue
Engine-Datei `nacht/wertung.js`: `WERTUNG.rang(n, werte)` mit Grenzen aus dem Level-TUNE
(`rangGrenzen:{S:..., A:..., B:...}`), Ergebnis S/A/B/C, gespeichert als Bestwert
`nachtschicht.rangN` (überlebt NEUE NACHT wie die Bestzeit). Der Ende-Bildschirm zeigt den Rang
mit Tusch und Aufziehen; Karte und LEVEL WAEHLEN zeigen den besten Rang. Kein „Durchgefallen" –
C ist immer erreichbar (Overcooked-Kritik). [muss, M]

**M20 Wertung in Kategorien mit Titel** – Hotline Miami (Boldness, Flexibility, „Feigling"). *Alle
Level.* Drei Zeilen je Level, z. B. Level 1 `UNGESEHEN / SCHNELL / ALLES GEFUNDEN`, Level 4 `KEIN
TREFFER / SERIE / ZEIT`. Dazu ein Spieltitel aus dem Stil: `LEISETRETER`, `PARTYTIER`, `DIPLOMAT`,
`STREITHAMMEL`. Titel als Daten in `nacht/texte.js`. Das ist der deutsche Partyspiel-Humor, den die
Story schon hat, als Belohnung. [soll, S]

**M21 Combo-Leiste** – Pizza Tower (6,7 s, Auffüllen, Strafe bei Treffer). *Level 3, 5, 2.* Level 3
Sprint: jedes übersprungene Hindernis füllt `TUNE.comboSek:3`, ab 5 in Folge +10 % Tempo, Stolpern
leert. Level 5: Ansprech-Treffer, Tanz-Takte und Theke füllen eine gemeinsame Leiste. Der Ton steigt
je Glied um einen Halbton (`piep(f*Math.pow(2,n/12))`). Combo fließt in den Rang (M19). [soll, M]

**M22 Herausforderung je Level** – Celeste (goldene Erdbeere), Pizza Tower (P-Rang). *Alle Level.* Eine
optionale Aufgabe, sichtbar auf der Kapitelkarte und im Ende-Bildschirm: Level 1 `NIE GESEHEN`,
Level 3 `NIE GESTOLPERT`, Level 4 `OHNE TREFFER`, Level 5 `MARVIN NIEMANDEN LASSEN`, Level 8
`JEDEM TSCHUESS` (passt zu den Knoten). Gespeichert wie `knotenBest` in `nacht/nacht.js`. [soll, S]

**M23 Sammeldinge mit Zweck** – Hotline Miami (Masken), Celeste (Kassetten öffnen B-Seiten). *Alle
Level, Menü.* Die acht Polaroids haben bisher nur Erinnerungswert. Jedes öffnet einen
**Modifikator** für spätere Durchgänge: `PARTYHUT` (Lehrer hören schlechter), `KOPFHOERER`
(Remix-Musik), `SONNENBRILLE` (Sonne in Level 8 langsamer), `KONFETTI` (Konfetti bei jedem Konter).
Auswahl im Startmenü (`menue.js`), Wirkung als Faktor wie `SCHWIERIGKEITEN`. [soll, M]

**M24 To-do-Liste mit Durchstreichen** – Untitled Goose Game. *Level 2, 7.* `AUFGABEN` in Level 2 ist
schon eine Liste; sie wird zum Spielobjekt: Handy-Notiz, Haken mit Durchstreich-Animation und Ton,
plus zwei verdeckte Einträge `???`, die sich zeigen, wenn man sie zufällig erledigt (z. B. `DIE
MUSIK LAUTER DREHEN`, `MORITZ MUTTER GRUESSEN`). Level 7 bekommt die gleiche Liste (Wasser, Snacks,
Pfand, jeder ein Satz). [muss, S]

**M25 Kleine Streiche, große Reaktionen** – Untitled Goose Game. *Level 2, 7.* Je Level zwei bis drei
optionale Unfug-Aktionen mit übertriebener Reaktion: Kühlschrank offen lassen → Moritz rennt; Klingel am
Späti dreimal → Verkäufer sagt jedes Mal etwas Gereizteres. Füllen die verdeckten Einträge aus M24.
[kann, M]

**M26 Wiederholung des eigenen Laufs** – Katana Zero. *Level 1, 3, 8.* Position und Bild alle 0,1 s in
einen Ringpuffer (`S.spur`, 600 Einträge = 60 s). Nach dem Sieg 4 s Zeitraffer als Polaroid-Rahmen
`SO WARS`; überspringbar. Optional: Bestzeit-Geist im nächsten Versuch. Speicherlos, nur während der
Sitzung. [kann, M]

### F. Spielgefühl

**M27 Saft außerhalb der Kämpfe** – „Juice it or lose it", „Art of Screenshake". *Level 1, 2, 3, 5.*
Der 70-ms-Hitstop aus `kampf.js` auch dort, wo er fehlt: Kracher-Kampf in Level 2, Erwischtwerden in
Level 1 und 3, Ansprech-Treffer in Level 5 (kürzer, 40 ms). Gemeinsames Partikelsystem
`nacht/funken.js` (Pool von 64 Pixeln, `FUNKEN.spritz(x,y,n,farbe)`), das `STAUB` aus Level 1
ablöst. Squash & Stretch beim Landen in Level 3 und 8 über eine Höhenskala in `sprite()`. Wackeln
weiter nur über `FX.wackel`. [muss, M]

**M28 Hörbare Bestätigung** – Rhythm Heaven, Pizza Tower. *Alle Level.* Jeder Erfolg bekommt einen
eigenen, kurzen Klang in der Tonart der Levelmusik (Bestätigung auf Grundton, Erfolg mit Quinte,
Rang S mit Akkord). Gemeinsame Tonart je Level in `TUNE.tonart`. [soll, S]

### G. Schwierigkeit und Sitzungen

**M29 Unsichtbare Anpassung** – Resident Evil 4. *Level 3, 4, 8.* Nach zwei Niederlagen am selben
Abschnitt wird das Konterfenster um 10 % breiter, `verdachtProSek` um 10 % langsamer (bis −30 %);
nach einem fehlerfreien Abschnitt wieder zurück. Als Faktor `HILFE.faktor()` in `nacht/stand.js`
neben `schwer()`, nur für die Sitzung. Nicht angezeigt. [soll, M]

**M30 Hilfsmodus ohne Scham** – Celeste. *Einstellungen, alle Level.* `KOMFORT.spieltempo`
(100/80/60 %, wirkt auf `dt`), `KOMFORT.unverwundbar`, und nach drei Niederlagen in einem Kampf das
Angebot `UEBERSPRINGEN?` – zählt für Enden als verlorener Kampf, damit `ENDEN_ALLE` stimmig bleibt.
Für den App Store auch ein Barrierefreiheitspunkt. [soll, M]

**M31 Sitzungen in Häppchen** – Handy-Studien (Median 3 bis 5 min), Celeste (Räume). *Level 5, 1.*
Level 5 (600 s) in drei Akte mit eigenen Zwischentiteln (`ANKOMMEN`, `DIE FLAECHE`, `MARVIN`) und
Speicherpunkt je Akt in `localStorage`; `WEITER` im Startmenü setzt mitten im Level ein. Level 1 mit
Speicherpunkt nach dem Schlüssel. Zusammen mit M1. [muss, M]

**M32 Reden im Gehen, Unterbrechen erlaubt** – Oxenfree, Katana Zero. *Level 5, 7, 8.* In
`dialog.js` ein Knotenfeld `unterbrechen:{txt,geh}`: in den ersten 1,5 s einer Rede erscheint eine
rote Antwort; wer sie nimmt, schneidet ab (Flag, Beziehungswirkung). Für Plauder-Gespräche ohne
Entscheidung: Uhr und Bewegung laufen weiter (`PLAUSCH` statt Gespräch). [soll, M]

---

## 4. Reihenfolge und Abhängigkeiten

1. **Erst das Fundament, das alle Level hebt:** M1 + M31 (Neustart, Speicherpunkte), M19 (Rang),
   M27 (Saft), M2 (Musikschichten). Diese fünf ändern das Gefühl jedes Levels, ohne Story anzufassen.
2. **Dann je Level ein neues Verb (M7)**, in dieser Reihenfolge nach gemessener Monotonie:
   Level 5 (M14 Tanzen + M18 Ereignisse + M12), Level 2 (M24 Liste + M10 Küche), Level 6
   (M15 + M6), Level 7 (Werfen + M24).
3. **Höhepunkte:** M4 (Flucht in Level 1), M17 (Phasen), M8 (Remix-Finale) – M8 baut auf den Verben
   aus Schritt 2 auf.
4. **Wiederspielreiz:** M20, M21, M22, M23, M26 – brauchen M19.
5. **Feinschliff:** M3, M5, M9, M11, M13, M16, M25, M28, M29, M30, M32.

Abhängigkeiten: M21 braucht M19, M14 und M18 profitieren von M2 (Takt aus dem gemeinsamen Planer),
M8 braucht M7, M23 braucht `menue.js`. Neue Engine-Dateien (`musik.js`, `wertung.js`, `funken.js`)
jeweils mit `python tools/engine_einbinden.py`, danach `python tools/version.py` und die Prüfliste.
Neue Flags vorher in `docs/launch/flags-vertrag.md` eintragen; `tools/flagcheck.js` meldet sonst.

Messbar ohne Browser über `tools/nachttest.js`: M1 (Zeit bis Wiedereinstieg), M19 (Rangverteilung
bei Testläufen), M21 (Combo-Längen), M29 (Fensterbreiten nach Niederlagen). Klang und Saft (M2, M3,
M27, M28) nur im Browser prüfbar.

---

## 5. Quellen

- Pizza Tower: [Wikipedia](https://en.wikipedia.org/wiki/Pizza_Tower), [Combo – Pizza Tower Wiki](https://pizzatower.wiki/Combo), [Ranks – Pizza Tower Wiki](https://pizzatower.wiki/Ranks), [Pizza Time – Pizza Tower Wiki](https://pizzatower.wiki/Pizza_Time), [Pizza Time! (Fandom)](https://pizzatower.fandom.com/wiki/Pizza_Time!)
- WarioWare: [Wikipedia](https://en.wikipedia.org/wiki/WarioWare), [Mega Microgame$! (Super Mario Wiki)](https://www.mariowiki.com/WarioWare,_Inc.:_Mega_Microgame$!), [Smooth Moves (TCRF)](https://tcrf.net/WarioWare:_Smooth_Moves)
- Celeste: [Wikipedia](https://en.wikipedia.org/wiki/Celeste_(video_game)), [Gameplay (Fandom)](https://celestegame.fandom.com/wiki/Celeste), [Golden Ridge](https://celestegame.fandom.com/wiki/Chapter_4:_Golden_Ridge), [Old Site](https://celeste.ink/wiki/Old_Site), [The Summit](https://celeste.ink/wiki/The_Summit)
- Hotline Miami: [Wikipedia](https://en.wikipedia.org/wiki/Hotline_Miami), [Steam-Diskussion Wertung](https://steamcommunity.com/app/219150/discussions/0/846961716267860830/), [A+-Leitfaden](https://steamcommunity.com/sharedfiles/filedetails/?id=491579931)
- Katana Zero: [Wikipedia](https://en.wikipedia.org/wiki/Katana_Zero), [Gaming Nexus](https://www.gamingnexus.com/Article/5928/Katana-Zero/), [Destructoid](https://www.destructoid.com/reviews/review-katana-zero/)
- Night in the Woods: [Wikipedia](https://en.wikipedia.org/wiki/Night_in_the_Woods), [Hardcore Gamer](https://hardcoregamer.com/reviews/review-night-in-the-woods-switch/288728/), [Jay is Games](https://jayisgames.com/review/night-in-the-woods.php)
- Oxenfree: [Wikipedia](https://en.wikipedia.org/wiki/Oxenfree), [MCV/Develop – Sean Krankel](https://mcvuk.com/business-news/i-thought-we-were-going-to-go-out-of-business-sean-krankel-on-the-development-of-oxenfree/)
- Scott Pilgrim: [Wikipedia](https://en.wikipedia.org/wiki/Scott_Pilgrim_vs._the_World:_The_Game), [Hardcore Gaming 101](https://www.hardcoregaming101.net/scott-pilgrim-vs-the-world-the-game/), [Gaming Trend](https://gamingtrend.com/reviews/scott-pilgrims-precious-little-game-scott-pilgrim-vs-the-world-the-game-review/)
- Untitled Goose Game: [Game Developer – Behind the HONK](https://www.gamedeveloper.com/design/behind-the-honk-an-i-untitled-goose-game-i-q-a), [Wikipedia](https://en.wikipedia.org/wiki/Untitled_Goose_Game), [Shacknews-Interview](https://www.shacknews.com/article/107642/untitled-goose-game-interview-house-house-dev-nico-disseldorp-talks-being-a-jerk)
- Undertale: [Wikipedia](https://en.wikipedia.org/wiki/Undertale), [Encounter – Undertale Wiki](https://undertale.wiki/w/Encounter), [Parry Everything](https://parryeverything.com/2021/09/24/undertale-combat-where-nobody-has-to-die/)
- Rhythm Heaven: [Wikipedia (Serie)](https://en.wikipedia.org/wiki/Rhythm_Heaven_(series)), [Rank (Fandom)](https://rhythmheaven.fandom.com/wiki/Rank)
- Overcooked: [Game Developer – Deep Dive](https://www.gamedeveloper.com/design/game-design-deep-dive-building-truly-cooperative-play-in-i-overcooked-i-), [Nintendo Life](https://www.nintendolife.com/reviews/nintendo-switch/overcooked_all_you_can_eat), [Gideon's Gaming](https://gideonsgaming.com/overcooked-2-review-chaos-incarnate/)
- Stardew Valley: [Fishing – Stardew Valley Wiki](https://stardewvalleywiki.com/Fishing), [Game Dev's Guide to Fishing Minigames](https://gamedevsjourney.substack.com/p/the-game-devs-guide-to-fishing-minigames)
- Paper Mario: [Super Mario Wiki](https://www.mariowiki.com/Paper_Mario), [Dampfkraft – Combat Systems](https://www.dampfkraft.com/games/paper-mario-combat.html)
- Florence: [Game Developer – Simple mechanics and vignettes](https://www.gamedeveloper.com/design/how-simple-mechanics-and-vignettes-inspired-i-florence-i-), [TouchArcade](https://toucharcade.com/2018/02/13/florence-review/), [Wikipedia](https://en.wikipedia.org/wiki/Florence_(video_game))
- Spielgefühl: [Game feel on the web](https://valdemird.com/blog/game-feel-on-the-web/), [Game Developer – Squeezing more juice](https://www.gamedeveloper.com/design/squeezing-more-juice-out-of-your-game-design-)
- Adaptive Musik: [Adaptive music (Wikipedia)](https://en.wikipedia.org/wiki/Adaptive_music), [Game Developer – Guy Jones](https://www.gamedeveloper.com/audio/composer-guy-jones-talks-adaptive-music-for-games)
- Schwierigkeit: [Game Developer – Secrets of DDA](https://www.gamedeveloper.com/design/more-than-meets-the-eye-the-secrets-of-dynamic-difficulty-adjustment), [TheGamer – Adaptive Difficulty](https://www.thegamer.com/best-games-adaptive-difficulty/)
- Handy-Sitzungen: [Udonis – Session Length](https://www.blog.udonis.co/mobile-marketing/mobile-games/session-length)
