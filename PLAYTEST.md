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

## Level 1 — Die Schule

Analyse vom 5.10. (siehe NACHT-TODO.md, erster von acht nachgeholten Teilen).
index.html vollständig gelesen, dazu die elf geladenen Engine-Dateien;
`node tools/pruefe.js`/`nachttest.js index`/`flagcheck.js` zur Gegenprüfung.

| Problem | Warum es nervt | Grad | Lösung |
|:--|:--|:--|:--|
| Die Tiefe ist für Level 1 abgeschaltet (`TIEFE_PRO_SEITE['index.html']=false`, nacht/welt.js:54), aber index.html rechnet trotzdem mit ihr (S.tiefe, Sichtkegel-Trapez Zeile 1744-1751, die Meldung „ZU WEIT VORNE" Zeile 964/968, TUNE.tiefeWelt/tiefeTempo/kegelOeffnung/tuerTiefe) | Toter Code, der echte Werte vorgaukelt - TUNE.tiefeTempo etc. lassen sich drehen, ohne dass sich im Spiel irgendetwas ändert | hoch | Tiefe bewusst aktivieren oder die toten Zeilen/TUNE-Werte entfernen |
| Die Zuneigung zu HAUSMEISTER (`mag:['HAUSMEISTER',10/-5/-12]`, index.html:1278/1281/1284) wird nirgends gelesen (`node tools/flagcheck.js` bestätigt: nie gelesen) | Die drei Antworten beim Hausmeister (mitleidig/genervt/frech) wirken wie eine Entscheidung, bleiben folgenlos - dasselbe Muster wie die bekannte MORITZ-Lücke oben | hoch | Später abfragen, wie `direktorMontag` u.ä. in level8.html |
| TUNE.sichtHoehe (:122) und TUNE.vibrationVerdacht (:92) werden projektweit nirgends gelesen - `laerm()` (:725) addiert stattdessen hartcodiert `+.15` | Verstößt gegen „jede Stellschraube steht im TUNE-Block" - zwei Regler ohne Wirkung | mittel | Werte entfernen oder tatsächlich verwenden |
| Sprung (LEER) hat in Level 1 keine Spielwirkung mehr (Höhenprüfung der Sicht laut Kommentar :1230-1233 bewusst entfernt, keine Hindernisse im Korridor), wird aber als eigener, optionaler Schritt in der Lektion gelehrt (nacht/lehre.js) | Bringt nur den Nachteil des lauten Landens, keinen Vorteil | mittel | Echten Nutzen ergänzen oder Lektionsschritt streichen |
| `wirf()` (index.html:736-739) rechnet mit eigenen Werten (T=0,6, Höhe=10, g=760) statt mit TUNE; g=760 weicht ohne Begründung von TUNE.gravitation=920 des Spielers ab | Wurfweite lässt sich nicht im TUNE-Block ändern; zwei Schwerkraftwerte im selben Level wirken wie ein Versehen | niedrig | Werte in TUNE ziehen, g an TUNE.gravitation koppeln |
| In der Spielart `S.variante==='hausmeister'` bleibt der zuvor gewürfelte Raum `r` weiter von Zettel/Fund-Platzierung ausgeschlossen (:440), obwohl er in dieser Variante gar nicht der Schlüsselraum ist | Wirkungsloser Code-Pfad in der Hälfte aller Runden, kein sichtbarer Schaden | niedrig | Ausschluss nur im `raum`-Zweig anwenden |

## Level 6 — Afterhour

Analyse vom 5.10. (siehe NACHT-TODO.md, zweiter von acht nachgeholten Teilen).
level6.html vollständig gelesen; `node tools/pruefe.js`/`nachttest.js level6`/
`flagcheck.js` zur Gegenprüfung, dazu eigene `update(1/60)`-Läufe für Pegel/Tiefe.

| Problem | Warum es nervt | Grad | Lösung |
|:--|:--|:--|:--|
| Die Tiefe ist für Level 6 abgeschaltet (`TIEFE_PRO_SEITE['level6.html']=false`, nacht/welt.js:59), aber level6.html rechnet trotzdem mit ihr: TUNE.tiefeHinten/tiefeVorne/tiefeWelt/tiefeTempo (:110-113) und TUNE.redeTiefe (:107, in allen sechs `tiefeNah()`-Aufrufen in `naechstesZiel()`) sind tot - genau das Muster aus der Level-1-Analyse. Gemessen: 2 s HOCH halten ändert `S.tiefe` nicht (bleibt exakt 0,26) | Fünf Regler, die wie Stellschrauben aussehen, aber nichts tun; jedes `.t`-Feld in DINGE/SOFAS/TUEREN/ECHOS/NACHTECHOS/LEA (:242-291) ist nur noch Zeichenreihenfolge, keine echte Position | hoch | Tiefe bewusst aktivieren (passt zum „wabernden Flur") oder die toten TUNE-Werte/`tiefeNah`-Aufrufe/`.t`-Felder entfernen |
| TUNE.pegelAbbauProSek=1,3 (:89, genutzt :543) senkt den Pegel gemessen unabhängig vom Spielerverhalten in 77 s von 100 auf 0 - schneller, als TUNE's eigener Kommentar für eine Hin-Strecke plus Schleife ansetzt (~18 s mehrfach, :116-119) | Das als „Kern des Levels" beschriebene Wabern verblasst meist durch reines Abwarten, nicht durch das eigentliche Ziel (Erinnerungen finden, proKlarheit=14/Fund) | mittel | pegelAbbauProSek senken oder an die Levellänge koppeln, proKlarheit stärker gewichten |
| `mobilKontext()` liefert in praktisch jedem Spielzustand `zwei:'SPRUNG'` (:693), obwohl Level 6 keine Hindernisse, keine Lücken und (siehe oben) keine Tiefe hat; die Lektion des Levels (nacht/lehre.js) lehrt Sprung gar nicht erst | Mobile Spieler sehen die ganze Spielzeit einen zweiten Aktionsknopf für eine Aktion ohne jede Spielwirkung | mittel | `zwei:null` für Level 6, oder Sprung eine echte Funktion geben |
| `aufwachen()` (:678) zieht den Pegel um den hartcodierten Wert `10` ab, direkt neben `TUNE.aufwachenMit`, das für dieselbe Funktion schon im TUNE-Block steht | Verstößt gegen „jede Stellschraube steht im TUNE-Block" - derselbe Fehlertyp wie `wirf()` in Level 1 | niedrig | `10` als eigenen TUNE-Wert in den Block ziehen |
| Derselbe Hinweistext „DIESEN RAUM GAB ES SCHON EINMAL" wird von zwei unabhängigen Triggern ausgelöst: beim Betreten des wiederholten Raums (:560) und beim Anstoßen an die Schleifenwand ein paar Schritte weiter (:588) | Wirkt wie zwei Entwürfe derselben Idee statt zwei unterschiedlichen Meldungen, können kurz nacheinander überlappend auf dem Schirm stehen | niedrig | Einen der beiden Texte ändern (z.B. :560 auf einen reinen Ortshinweis) |
| `NACHTECHOS[].name` (:287-289, z.B. `name:'MORITZ'`) wird nirgends gelesen - die Anzeige nutzt ausschließlich die hartcodierte Fallunterscheidung in `echoName()` (:668), die `.name` dupliziert | Totes Datenfeld, das bei einer Änderung fälschlich mitgepflegt wird, ohne etwas zu bewirken | niedrig | Feld entfernen oder `echoName()` `e.name` lesen lassen |

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
| Die Komfort-Schalter FLACKERSCHUTZ/WACKELN wirken nirgends - `S.blitz`/`S.ruettel` werden roh gezeichnet (z.B. index.html:1556/1569) statt durch `FX.blitz()`/`FX.wackel()` aus nacht/komfort.js geschickt; projektweiter Grep über alle 8 Level: null Treffer für `FX.blitz`/`FX.wackel` außerhalb von komfort.js selbst (gefunden bei der Level-1-Analyse, betrifft aber jedes Level) | Wer wegen Fotosensibilität Flackerschutz aktiviert, bekommt bei jedem Fund/Alarm trotzdem den vollen weißen Blitz und das volle Bildschirmwackeln - die Einstellung tut im ganzen Spiel nichts | hoch | `S.blitz`/`S.ruettel` beim Zeichnen durch `FX.blitz()`/`FX.wackel()` schicken, projektweit |

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
  Zwei Spielarten (Schlüssel im Raum oder am Gürtel des Hausmeisters) und
  ein Hinweissystem, das sich an die Fundreihenfolge statt an eine feste
  Stufe hängt, machen Durchläufe wirklich verschieden. Mit 56 % leeren
  Bildzeilen (Software-Canvas-Näherung) schon deutlich dichter als die
  66-77 % der anderen Level.
- **Level 6 hat eine Uhr, die drückt.** Im Nichtstun-Test knickt man nach
  100, 147 und 194 Sekunden weg. So soll das. Die drei NACHTECHOS
  (MORITZ/SIE/MARVIN) sind zudem die einzige Stelle im Spiel, an der
  Entscheidungen aus Level 2-5 sichtbar in einen eigenen Dialog
  zurückkommen (echte Flags wie `clubJa_mia`, `marvinKennt`, `beziehung()`)
  - ein Nachklapp-Mechanismus, den es sonst nirgends gibt. Die
  Overlay-Reihenfolge haelt ihr Versprechen: HUD und E-Prompt werden
  nachweislich nach der Bildverzerrung gezeichnet und bleiben scharf,
  egal wie stark Warp/Trail/Farbwasch ziehen.
- **Die Engine trägt.** Ein `TUNE`-Block je Level, vier zentrale Tabellen,
  kein Build, keine Abhängigkeiten.

---

## Was noch nicht geprüft ist

Die Analyse lief mit vierzehn parallelen Prüfern. **Neun sind am
Nutzungslimit des Kontos gescheitert** (HTTP 429, Fünf-Stunden-Limit).
Fertig geworden sind Level 2, Level 3, Level 4 und zweimal Level 5.
Level 1 und Level 6 kamen am 5.10. als Nachtroutine-Analysen dazu (siehe oben).

Noch ohne vollständige Prüfung: Level 7, Level 8,
`karte.html`, `runner.html`, die Engine-Dateien und die Dramaturgie über
die ganze Nacht.

Was zu diesen Teilen in diesem Bericht steht, stammt aus eigenen Messungen
im Browser. Es ist belastbar, aber nicht erschöpfend.
