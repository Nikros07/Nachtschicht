# Playtest — NACHTSCHICHT

Stand 1. Oktober 2026. Alles hier ist **gemessen**, nicht geschätzt: im
Browser mit angehaltener Spielschleife (`update(1/60)` in einer Schleife),
mit Pixelproben auf dem Canvas (`getImageData`) und mit vollständiger
Pfadaufzählung durch die Gesprächsbäume.

Was bereits behoben ist, steht ~~durchgestrichen~~.

---

## Die drei großen Befunde

### 1. Zwei Drittel jedes Bildes sind leer

Gemessen als harte Kanten pro Bildzeile — ein Farbverlauf ist kein Inhalt:

| Level | Bildzeilen ohne Inhalt |
|:--|--:|
| Level 2 — Wohnung | 66 % |
| Level 6 — Afterhour | 72 % |
| Level 5 — Club | 73 % |
| Level 7 — Späti | 77 % |
| Level 8 — Heimweg | 77 % |

Im Club tragen die Zeilen 31 bis 119 — die halbe Bildhöhe — **fünf
senkrechte Striche und sonst nichts**. Das Spielgeschehen lebt in einem
Band von rund 25 Pixeln Höhe bei y≈120–145.

Das ist der Hauptgrund, warum das Spiel nach „Default Web Game" aussieht.
Oben fehlen Decke, Licht, Lautsprecher, Galerie, Himmel — alles, was einen
Raum zu einem Ort macht.

**Schweregrad: hoch.** Betrifft jeden Bildschirm des Spiels.

Teilweise behoben (1.–4.10., per `node tools/nachttest.js`, Software-Canvas-Näherung,
nicht die obige Browser-Messung): Club 73 % → 46 % (Discokugeln, Lautsprecher,
Garderobe, Raucherecke, Hinterausgang, Banner über Bar/Raucherecke an der Rückwand -
Klos/Hinterausgang oben bleiben offen, siehe NACHT-TODO), Wohnung 66 % → 49 % (Bilderrahmen, Regal, Wandverkleidung),
Afterhour 72 % → 58 % (Wanddeko, Plakate/Spinde), Späti 77 % → 59 % (Regal,
Leuchtreklame), Heimweg 77 % → 64 % (Sterne, Mond, durchgehende Häuserreihe).

### 2. Der Club ist ein Flur mit sechs Knöpfen

Messung „Spieler tut nichts, fünf Minuten lang":

```
 25 s  MARVIN IST DA
 49 s  MIA IST JETZT MIT MARVIN UNTERWEGS
 81 s  SOPHIE IST JETZT MIT MARVIN UNTERWEGS
107 s  KIRA IST JETZT MIT MARVIN UNTERWEGS
~~       — danach passiert 193 Sekunden lang nichts mehr —~~
```

~~Die Leveluhr läuft **600 Sekunden**. Der Inhalt ist nach 107 Sekunden
aufgebraucht.~~ Behoben (2.10.): TUNE.CLUB_EREIGNISSE liefert ab Sekunde 20
alle ~25 s eine Durchsage/einen DJ-Satz, gemessen 16 Ereignisse, letztes bei
295 s. ~~Der Ausgang ist ab Sekunde 0 offen und ohne Bedingung: man
kann den Club mit **null Interaktionen** verlassen, und das Level gilt als
geschafft.~~ Behoben (1.10., Commit `297f845`): der Ausgang öffnet erst nach
einer Interaktion.

~~Dazu: von sechs benannten Bereichen — Eingang, Tanzfläche, Bar,
Raucherecke, Klos, Hinterausgang — enthalten **vier gar nichts**. Man läuft
durch beschriftete Orte, in denen nichts steht.~~ Behoben (2.10.): Garderobe
am Eingang, zwei Raucher in der Raucherecke, Kisten und ein Lieferant am
Hinterausgang; Klos hatte mit WASCHBECKEN schon eine Interaktion (Befund
war veraltet). Alle sechs Bereiche haben jetzt etwas.

**Schweregrad: hoch.** Das ist das erklärte Herzstück des Spiels.

### 3. Die Hälfte aller Entscheidungen verpufft

Kreuzprüfung über alle Dateien: **59 Flags, davon 29 wirksam.** 17 werden
gesetzt und von keiner Zeile im Spiel je gelesen — darunter geschlossen
alles, was man im Bus tut (7 Flags), wie Level 1 ausgegangen ist (3) und
was man im Traum begreift (2).

Die Zuneigung zu **MORITZ** — dem besten Freund, dessen Wohnung Level 2
ist — wird in Level 2 und 6 verändert und **nirgends abgefragt**.

~~Behoben: das Ende liest jetzt 17 Entscheidungen mehr. Weil alle
gleichzeitig eine halbe Minute Abspann wären, liegt ein Vorrat mit Gewicht
bereit, aus dem die vier stärksten genommen werden — jeder Durchlauf liest
sich anders, ohne länger zu werden.~~

---

## Kampf

| Problem | Warum es nervt | Grad | Lösung |
|:--|:--|:--|:--|
| ~~Den Ausholbalken gab es nur in Level 4~~ | Bus, Club und Heimweg verlangen dasselbe Timing — Konterfenster 116–265 ms — und zeigten nur ein blinkendes `!`. Das Finale war die schwerste Stelle des Spiels mit der schlechtesten Information. | hoch | ~~`nacht/hud.js`, jetzt in allen vier Kämpfen~~ |
| Level 2 hat eine **zweite, eigene** Kampflogik | Dort kontert jeder Tastendruck zu jedem Zeitpunkt. Gemessen: „E im richtigen Moment" und „E dauernd drücken" liefern dasselbe Ergebnis — 3:0 ohne einen Treffer. Der erste Kampf des Spiels bringt das Gegenteil von dem bei, was Level 4 prüft. | hoch | `aktionPuffer` auch im Zustand `komm` leeren |
| Level 4 ist fünfmal dieselbe Entscheidung | Nach dem zweiten Konter ist alles gesehen. Die Phasen ändern nur Zahlen, keine Antworten. | hoch | Jede Phase soll die vorige Antwort entwerten |
| ~~Der Pegel verengt das Konterfenster um bis zu 40 % — unsichtbar~~ | Der Spieler erlebt eine Runde, in der „das Timing nicht geht", ohne je zu erfahren warum. Das ist die unfaire Variante von schwer. | hoch | ~~Befund war veraltet: der Balken liest fensterAnteil schon direkt, stimmt schon mit dem echten Fenster überein (3.10.)~~ |
| ~~Phase-3-Jab auf HART mit Pegel ist nicht mehr reagierbar~~ | Liegt unter menschlicher Reaktionszeit. | hoch | ~~Untergrenze TUNE.fensterMinSek=0,28s eingezogen (3.10.)~~ |
| Jab und Schwung sehen identisch aus | Zwei Muster tragen nur, wenn man sie unterscheiden kann. | mittel | Eigene Haltung je Angriff |

## Club — die Zahlen unter den Texten

Vollständige Pfadaufzählung: MIA 169 Wege, KIRA 117, SOPHIE 81.

| Problem | Warum es nervt | Grad | Lösung |
|:--|:--|:--|:--|
| ~~KIRAs **mutige** Eröffnung konnte das beste Ende rechnerisch nie erreichen~~ | Sie gab +3 Zuneigung, die sanften +8; danach höchstens 31 gegen eine Schwelle von 32. Mut ist der Wert, den das Spiel über vier Level aufbaut — und er war hier die falsche Wahl. | hoch | ~~+8; alle drei nüchternen Eröffnungen kommen auf 36~~ |
| ~~MIAs Schwelle war exakt das Maximum des Baums~~ | Null Spielraum: ein schwacher Satz irgendwo, und das beste Ende ist weg, ohne dass man erfährt warum. Drei von 169 Pfaden. | hoch | ~~Schwelle 20 statt 24~~ |
| ~~Ab Pegel 55 bei Kira: nur zwei Antworten, beide die Abfuhr~~ | Sackgasse ohne Ausweg. | hoch | ~~Rückzieher ergänzt — Waschbecken, nüchtern werden, wiederkommen~~ |
| ~~Der Ruf wurde angezeigt, gesenkt und bekommentiert — und von keiner Bedingung gelesen~~ | Eine Zahl im HUD, die nichts tut. | hoch | ~~Die drei besten Enden verlangen ihn~~ |
| ~~Marvins Kampf war per Knopfdruck abschaltbar und gab dafür +6 Ruf~~ | Hing an `crew:'DENNIS'` — und Dennis kommt in Level 4 bedingungslos dazu. | hoch | ~~Hängt jetzt an der Entscheidung aus Level 2~~ |
| ~~Zwei wortgleiche Antworten untereinander im Lena-Knoten~~ | — | hoch | ~~Eine entfernt~~ |
| ~~Die drei Frauen wissen nichts voneinander~~ | Der Kommentar im Code verspricht das Gegenteil. Eine Abfuhr soll sich herumsprechen — aber niemand merkt es. | hoch | ~~Neuer Knoten startAbfuhr in allen drei Bäumen, ausgelöst sobald eine andere schon einen Korb gegeben hat (4.10.)~~ |
| ~~Sophie ist die Trinkerin und hat keine einzige Pegel-Bedingung~~ | — | mittel | ~~Neue Wahl ab pegel:55, gleiche Schwelle wie Mia (4.10.)~~ |
| `tools/level5_baeume.js` ist eine wortgleiche Zweitkopie der Bäume | Zwei Wahrheiten, von denen nur eine im Spiel landet. | niedrig | Löschen |

## Bus

| Problem | Warum es nervt | Grad | Lösung |
|:--|:--|:--|:--|
| ~~Die Ablenkung zieht alle fünf Kontrolleure auf den Spieler zu~~ | Das Werkzeug tat das Gegenteil von dem, wofür es da ist. | kritisch | ~~Ziel weicht jetzt vom Spieler weg aus~~ |
| ~~Der Bus zerfällt in „gratis sicher" oder „sicher verloren"~~ | Ein Schleichlevel lebt vom Abwägen; hier ist die richtige Antwort immer dieselbe. | hoch | ~~Fahrschein rettet nur noch eine Kontrolle (3.10.)~~ |
| Der Sprint ist „D halten, sechzehnmal im Takt springen" | Kein Grund, aufmerksam zu sein. | hoch | Eine zweite Entscheidung: Bürgersteig oder Straße |
| ~~Das blinkende E über den Verstecken erscheint nie~~ | Man fand das Hauptwerkzeug des Levels nur zufällig. | hoch | ~~Dieselbe Tiefenprüfung wie naheVersteck()~~ |
| ~~Ein einmal gekaufter Fahrschein schaltet den Bus für **alle** späteren Durchläufe ab~~ | — | hoch | ~~ticket startet jetzt immer false (3.10.)~~ |
| Bahn oder Bus? Das Intro sagt Bahn, das Schild sagt BUS | Erster und letzter Eindruck des Levels. | niedrig | Entscheiden |

## Level 2 — die Entscheidung der Nacht

| Problem | Warum es nervt | Grad | Lösung |
|:--|:--|:--|:--|
| ~~Die Wahl „wen nimmst du mit" kommt nach dem Kampf~~ | Sie kostete nichts und ersparte nichts. | hoch | ~~An den Anfang gezogen, Aufgabenliste hängt dran~~ |
| Die Wahl hat in Level 2 selbst keine sichtbare Folge | Dieselbe Cutscene, dasselbe Ende, als einziges Feedback eine Zeile „DABEI:". | hoch | Wer dableibt, verabschiedet sich sichtbar |
| ~~„DER SCHLÄFER" und „DER TELEFONIERER" sind keine Personen~~ | Beide kamen in keiner anderen Datei namentlich vor. | hoch | ~~Heißen jetzt FINN und DAVID, je drei Sätze~~ |
| ~~`gruppeGross`/`gruppeKlein` wurden nie zurückgesetzt~~ | Die Wahl des letzten Durchlaufs fälscht vier spätere Stellen. | hoch | ~~Behoben~~ |
| ~~Springen, Hoch und Runter werden beigebracht und tun nichts~~ | Drei von sechs Eingaben ohne Zweck. | mittel | ~~Titelbild nennt Sprung nicht mehr als Steuerung, Sprung selbst bleibt im Code (4.10.)~~ |

## Durchs ganze Spiel

| Problem | Warum es nervt | Grad | Lösung |
|:--|:--|:--|:--|
| ~~Intros ließen sich nur Szene für Szene überspringen~~ | Level 1 hat sieben Szenen — beim zweiten Durchlauf siebenmal tippen, bevor das Spiel anfängt. Zusammen 104 Sekunden Intro. | hoch | ~~Halten überspringt alles, wie bei den Cutscenes~~ |
| ~~Die Schrift kannte keine Klammern~~ | `(weitergehen)` stand als `?WEITERGEHEN?` auf dem Bild. | mittel | ~~`( ) ' "` ergänzt~~ |
| ~~`tempo2D` rechnete mit der Tiefe, auch wenn sie aus ist~~ | In flachen Leveln liefen Gehanimation und Schrittgeräusch, während sich nichts bewegte. | mittel | ~~Behoben~~ |
| ~~`tools/pruefe.js` hatte die Engine-Liste fest eingetippt~~ | Eine neu eingehängte Datei wurde stillschweigend nie geprüft. | mittel | ~~Liest jetzt die Script-Tags~~ |
| ~~Das Titelbild von Level 1 ist eine Bedienungsanleitung~~ | Sieben Tastenzeilen, dazu zwei Zeilen mit einem Pixel Abstand, die ineinanderlaufen. | mittel | ~~Nur noch vier Grundtasten, Überlappung gab es laut Messung keine mehr (4.10.)~~ |
| ~~Zwei Handys mit zwei Tasten~~ | `H` schaltet das eingezogene Handy aus Level 1 stumm, `T` öffnet das Handy der Engine. | mittel | ~~Zwei echte, unterschiedliche Mechaniken - nur die Meldung bei H heißt nicht mehr HANDY (4.10.)~~ |
| ~~Level 2 hat kein `mobilKontext()`~~ | Am Handy heißt jeder Knopf überall „AKTION". | mittel | ~~Nach dem Muster aus `index.html` (4.10.)~~ |
| Die README beschreibt die alte Handy-Steuerung | „Steuerkreuz links, Aktionstasten rechts" gibt es seit dem Umbau nicht mehr. | niedrig | — |

---

## Was gut ist und bleiben soll

Damit das nicht untergeht:

- **Die Gesprächsbäume sind handwerklich sauber.** Kein einziger
  `geh:`-Verweis zeigt ins Leere, kein Knoten ist eine Sackgasse, keine
  Umlaute auf dem Canvas. Geprüft über alle Bäume des Spiels.
- **Die drei Frauen im Club haben wirklich eigene Stimmen.** Mia testet,
  Sophie provoziert, Kira schweigt — und die Texte klingen auch so.
  48 Knoten, 74 Wahlmöglichkeiten, 30 davon bedingt.
- **Marvin ist die beste Idee des Spiels**: ein Rivale, der dieselben
  Leute angeht, zögert, solange man danebensteht, und sauer wird, wenn man
  ihm jemanden wegnimmt. Er wird nur zu selten sichtbar.
- **Level 1 ist dicht.** Korridor 6,5 s, schleichend 15,5 s, Uhr 165 s —
  jeder Weg ist eine Entscheidung. Das ist das Maß für die anderen Level.
- **Level 6 hat eine Uhr, die drückt.** Im Nichtstun-Test knickt man nach
  100, 147 und 194 Sekunden weg. So soll das.
- **Die Engine trägt.** Ein `TUNE`-Block je Level, vier zentrale Tabellen,
  kein Build, keine Abhängigkeiten.

---

## Was noch nicht geprüft ist

Die Analyse lief mit vierzehn parallelen Prüfern. **Neun sind am
Nutzungslimit des Kontos gescheitert** (HTTP 429, Fünf-Stunden-Limit).
Fertig geworden sind Level 2, Level 3, Level 4 und zweimal Level 5.

Noch ohne vollständige Prüfung: Level 1, Level 6, Level 7, Level 8,
`karte.html`, `runner.html`, die Engine-Dateien und die Dramaturgie über
die ganze Nacht.

Was zu diesen Teilen in diesem Bericht steht, stammt aus eigenen Messungen
im Browser. Es ist belastbar, aber nicht erschöpfend.
