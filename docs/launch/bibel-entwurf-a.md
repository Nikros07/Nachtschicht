# NACHTSCHICHT - Story-Bibel, Entwurf A: "Abschied mit leisem Faden"

Stand 3. Oktober 2026. Nur Konzept, am Spielcode ist nichts geaendert. Aufbauend auf `story-ist.md`.

Schreibweise: Spielzeilen stehen in `Backticks`. Ein `|` ist der feste Zeilenumbruch auf der Karte (hoechstens 44 Zeichen je Zeile, zwei Zeilen je Karte, nur Zeichen der Schrift, keine Umlaute). Gespraechszeilen im Spielton (klein, ohne `|`) brechen von selbst um und sind nie laenger als zwei Zeilen. Karten und Chatzeilen im Abspann gross. Aufwand: S unter einer Stunde, M ein Nachmittag, L ein Tag. "Neu" heisst: gibt es im Spiel noch nicht. Alle "Was wird im September"-Zeilen sind Platzhalter und stehen spaeter in EINER Datentabelle (`AUSBLICK`), damit man sie gegen die echten Plaene der echten Freunde tauschen kann.

---

## 1. Leitidee und roter Faden

**Leitidee:** Die ganze Nacht tun alle so, als waere es nur "bis gleich". Nach dieser Nacht ist trotzdem nichts mehr wie vorher.

**Die Frage der Nacht:** Wer sagt als Erster "Tschuess"? Sie wird nie so gestellt. Lea stellt sie in Level 6 als "Warum rennst du die ganze Nacht?" (das ist die Frage, die `traumEinsicht` heute verspricht und nie beantwortet).

**Die Antwort:** Man darf. Es geht davon nichts kaputt. Und wer geht, wird gesehen: Nachts passen mehr Leute auf einen auf, als man denkt.

**Warum das traegt:** Alles, was das Spiel schon ist, wird zur Deutung. Sprint, Wettlauf gegen die Sonne und Max Ferdis Tempo sind Weglaufen vor dem Abschied. Moritz' Vorgluehen ist sein heimlicher Abschiedsabend. Die Sonne ist kein Gegner, sondern der Moment, in dem man aufhoeren darf zu rennen. Der Titel bekommt eine zweite Bedeutung: NACHTSCHICHT sind auch die, die nachts arbeiten und uns die ganze Zeit gesehen haben.

### Der Faden: drei Knoten an einer roten Wolle

Ein Faden heisst: ein Satz am Anfang, ein Echo in der Mitte, eine warme Antwort im Finale. Alle drei laufen in der letzten Szene (Kap. Level 8) zusammen und heissen dort SCHICHTWECHSEL.

| Knoten | Anfang | Echo | Antwort |
|:--|:--|:--|:--|
| 1 Der Schluessel | L1: Hausmeister gibt oder verliert den Zweitschluessel, rote Wolle dran: `Nimm ihn und tu ihn zurueck.` | L2 klimpert er in der Tasche. L6 im Traum: `Hast du meinen Schluessel gesehen.` (jetzt mit Antwort-Wahl) | Epilog: der Schluessel liegt am ersten Schultag im Briefkasten, rote Wolle dran. Man bringt zurueck, was man geliehen hat, und kommt dafuer nochmal vorbei. |
| 2 "Wir sehen euch" | L5: erste SMS von UNBEKANNT. Die Crew kriegt sie auch, Marvin auch. | L6: `Trinkt Wasser.` (Wasser im Spaeti wird zum Lacher mit Folgen). | Finale: Ali vom Doener ist der Absender, mit allen Nachtarbeitern in einer Gruppe. Antwort: `Wir euch auch.` |
| 3 Bis gleich / Tschuess | L1: Max Ferdi springt aus dem Fenster: `BIS GLEICH!` Niemand sagt die ganze Nacht Tschuess. | L5: Kira sagt es als Erste, am Taxi. L8: jeder, der abbiegt. | Finale: Du sagst es, oder nicht. Beides ist ein Ende. |

Dazu zwei Nebenmotive, die nur mitlaufen: **Die Uhr** (im Traum zeigen alle Uhren 17:30, die Zeit, zu der die Schule abschliesst; Antwort ist 05:20, Schichtwechsel) und **die Sonne** (Gegner in L8, am Ende die Antwort).

### Wer ist "wir"? Die Nachtschicht

Jeder dieser Erwachsenen sagt in seinem Level einen Satz ueber das Sehen. Der Abspann stellt sie als Gruppenchat nebeneinander (Kap. 5).

| Figur | Wo | Der Satz |
|:--|:--|:--|
| Hausmeister | L1, L6 | `Ihr seht die Schule am Tag. Ich seh sie, wenn ihr weg seid.` |
| Ali (Doener) | Karte nach L1 | `Name und Nummer? Ich ruf, wenn er fertig ist.` / `Ich merk mir Gesichter.` |
| Die Frau mit Rocky | L3 | `Ich hab es gemerkt. Viel Spass.` |
| Tuersteher | L4 | `Ich steh hier acht Stunden. Ich seh euch alle kommen. Und gehen.` |
| Taxifahrer | L7 | `Dreissig Jahre Nachtschicht. Ich seh alles.` (vorhanden) |
| Herr Oezdemir | L7 | `Alle, die bei mir Wasser gekauft haben.` (vorhanden) |
| Baeckerin (neu) | L8 Finale | `Frueh dran heut. Broetchen sind gleich fertig.` |

### Kanonische Zeitleiste (beseitigt die Uhrenwidersprueche)

| L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | Sonne |
|:--|:--|:--|:--|:--|:--|:--|:--|:--|
| 16:40 | 21:10 | 22:00 | 22:40 | 22:50 | 02:00 | 03:15 | 04:10 | 05:20 |

Zu aendern: L4-Intro 23:15 auf 22:40; L5-Intro 22:30 auf 22:50 ("UM EINS GEHT DAS LICHT AN" bleibt); Karte auf dieselben Zeiten (Moritz 21:10, Bus 22:00, Schlange 22:40, Club 22:50); Lea in L6 `GUTEN MORGEN. ES IST HALB DREI.` statt halb vier; Spaeti `03:15` statt "ca. 3 Uhr"; Level-3-Intro "Bahn" auf "Bus"; `mama2` ("Es ist nach Mitternacht") in `HANDY_DREHBUCH` von `ab:5` auf `ab:6`. Aufwand S.

**Welt-Annahme:** Zeugnistag der 10. Klasse vor den Sommerferien. Nach dem Sommer verteilt sich die Klasse. Der Direktor-Satz `direktorMontag` ("MONTAG ERSTE STUNDE") wird zu "IM SEPTEMBER. ERSTE STUNDE." Das Flag bleibt.

---

## 2. Figurenboegen

Jede Figur traegt etwas Unausgesprochenes. Es ist immer klein und glaubwuerdig (Umzug, Angst vergessen zu werden, nie gefragt worden sein), nie schwer (keine Krankheiten, kein Familiendrama, keine Sucht). Jeder Witz auf Kosten einer Figur bekommt einen Rueckschlag oder eine Wuerde-Zeile.

**MORITZ.** Moment: L2 (zwei unbeschriftete Kartons in seinem Zimmer), L6 (Traumfrage), L8 (letzter, der abbiegt). Laufendes Gag-Muster: er setzt viermal an (`Du, ich muss dir was...`) und wird jedes Mal unterbrochen (Bus-Kontrolle, Tuersteher, Marvin, zuletzt von sich selbst). Stimme: Saetze, die abbrechen. `Ich wollte nur... ach. Ist ja nur Zeug.` Unausgesprochen: Er zieht im September in die andere Stadt und hat die ganze Nacht geplant, damit keiner davon reden muss. Am Ende: Er sagt es selbst. Wer die Kartons gesehen hat (`moritzKartonGesehen`) und im Traum "Ich hab die Kartons gesehen" gewaehlt hat (`moritzGeheimnis`), muss nichts mehr erklaeren: `Du wusstest es? | Seit den Kartons.`

**JONAS.** Moment: L3 (Sitzszene nach der Notbremse), L7 (Bank-Runde: der Erste, der es ausspricht). Stimme: ehrlich bis zum Satzende. `Ich hab Angst. Aber ich bin da. Zaehlt das?` Unausgesprochen: Er fuerchtet, dass nach dem Sommer keiner mehr schreibt. Er ist der Mutige der Gruppe, weil er es als Einziger sagt. Am Ende: `JONAS HAT ES ALS ERSTER AUSGESPROCHEN. | ES HAT GEHOLFEN.`

**DENNIS.** Moment: L4 (nach dem Tuersteher), L8 (geht dazwischen, aber mit Worten). Stimme: ein bis drei Woerter. `Passt.` Unausgesprochen: Er boxt, damit er nie muss. Er hat im Herbst einen Kampf und zwei Karten, hat aber keinen gefragt. Am Ende: `DENNIS HAT ZWEI KARTEN FUER SEINEN KAMPF. | EINE IST FUER DICH.`

**SEMIH.** Moment: L5 (Tuer, ab hier mit Stimme), L7 (Bank). Stimme: ein Namen-Reigen. `Kenn ich. Den auch. Den nicht, aber seinen Bruder.` Unausgesprochen: Alle fragen ihn nur, wenn sie wo rein wollen. Er wuerde gern einmal einfach so gefragt werden. `Heut hat mich keiner gefragt, wen ich kenne. War gut.` Am Ende: `SEMIH KENNT JEDEN. | DICH HAT ER ZUERST ANGERUFEN.`

**LEA.** Moment: L1 (Zettel "Abschlusszeitung"), L2 (SMS), L6 (die Traumfuehrerin, jetzt vorbereitet). Stimme: sie fragt. `Und du? Nicht die anderen. Du.` Unausgesprochen: Sie fotografiert die ganze Nacht heimlich fuer die Abschlusszeitung und sieht allen zu. Gefragt hat sie nie jemand, was sie im September macht. Sie ist auch die Fotografin der Polaroids (Kap. 3). Am Ende: `LEA SCHICKT DIR DIE ZEITUNG. | SEITE 9 HEISST: LETZTE NACHT.` Umbenennung: LENA (Mias Freundin) heisst im Text kuenftig JULE, das Flag `lenaVersorgt` bleibt.

**MAX FERDI.** Moment: L1 (Fenster), L3 (Cutscene, vorhanden), L7 (`Muss kurz. Bis gleich.` und weg), L8 (setzt sich als Erster). Stimme: Kleinschreibung, keine Satzzeichen. `alter wo bleibst du` Unausgesprochen: Er haut als Erster ab, bevor jemand Tschuess sagen kann. Er ist der Spiegel des Spielers. Am Ende: `MAX FERDI SETZT SICH ALS ERSTER. | DAS IST NEU.`

**TOBI.** Moment: L7 (Spaeti), L8 (er weiss, wo die Bruecke ist). Stimme: Fakten. `Sonnenaufgang 05:19. Von der Bruecke aus 05:17.` Unausgesprochen: Er kennt alle Orte, die keiner beachtet, und wird nie nach ihnen gefragt. Er ist hier der Kenner, nicht der Aussenseiter. Am Ende: `TOBI SCHICKT EIN FOTO. ERSTES LICHT. 05:17.`

**MIA.** Moment: L5, L6 (`Schreibst du mir morgen? Oder war das nur heute Nacht?`), Abspann-SMS. Stimme: Ironie als Schutz. `Ernsthaft? Das ist dein erster Satz?` Unausgesprochen: Sie feiert fuer Jule und wollte eigentlich einmal nur zugehoert bekommen.

**SOPHIE.** Moment: L5 (Bar). Stimme: abgeklaert. `Du stehst zwischen mir und der Bar. Das kostet dich einen Shot.` Neu im Baum: `Schule aus? Hab ich letztes Jahr gehabt.` dann `Man vermisst nicht die Schule. | Man vermisst, dass alle im selben Raum sind.` Unausgesprochen: Sie ist schon eine Runde weiter und weiss, wie das ausgeht. `Es wird nicht weniger. Es wird anders.` Sie ist die Zukunft, ohne zu predigen.

**KIRA.** Moment: L5 (Raucherecke, dann Taxi). Stimme: kurz, ohne Schnoerkel. `Ich zieh naechsten Monat weg. Keiner weiss es.` Sie ist die Einzige im Spiel, die vor dem Finale Tschuess sagt: `KIRA: TSCHUESS.` `DU: BIS GLEICH.` `KIRA: NEE. TSCHUESS.` Am Ende: `KIRA SCHICKT EIN FOTO VOM ERSTEN MORGEN | IN DER NEUEN STADT.`

**MARVIN.** Moment: Karte (Kette), L5, L6 (Angst), L8. Stimme: ruhig wie ein Ritual. `Kein Stress. Genau. Lauf.` Unausgesprochen: Auch seine Leute ziehen weg. Er bleibt zurueck und hat keinen, mit dem er Mist baut. In L5 loest er den Unbekannten aus L2 auf: `Mein Cousin sagt, du hast ihn heute an einer Tuer umgehauen. Falsche Klingel.` Im Finale kriegt er dieselbe Nachricht wie du, `Hast du die auch gekriegt?`, und der Frieden bekommt einen Grund. Am Ende: `MARVIN SITZT AUF DER MAUER. ALLEIN. | DU WINKST. ER NICKT.`

**MAMA.** Nie im Bild. Stimme: SMS ohne Punkt. `ich kann nicht schlafen` Neu `mama4` (ab L7): `egal wie spaet. ich bin wach.` Unausgesprochen: Sie hat dieselbe Angst vor September. Letzte Abspannzeile, noch eine dazu: `SIE SAGT NICHT, WORAUF.`

---

## 3. Level fuer Level

Regeln fuer alles Neue: eine **Kapitelkarte** zu Beginn (Uhrzeit, Ort, eine Zeile, 3 Sekunden, Tippen ueberspringt). Je Level **ein Polaroid** (MOMENTE): ein Foto von etwas, das in diesem Level passiert ist, zwei Zeilen auf dem weissen Rand, optionaler Fund abseits des Weges. Wer drei sammelt, erfaehrt in L6, wer fotografiert hat (Lea). Keine Pflichtszene dauert ohne Eingabe laenger als 20 Sekunden, alles Neue ist ueberspringbar. Zeitangabe = zusaetzliche Spielzeit bei vollem Mitnehmen.

### Level 1 - Die Schule (S, +1:30)
- **Karte:** `FREITAG. 16:40. | LETZTER SCHULTAG.`
- **Neue Zettel (Notizen als Funde):** `ZETTEL: SPIND LEEREN BIS 17:00. DANN IST ZU.` und `ZETTEL: ABSCHLUSSZEITUNG. | SEITEN BIS FREITAG. LEA` (pflanzt Lea).
- **Szene Hausmeister** (vorhanden), drei neue Zeilen: `Ich schliess jeden Abend ab. Ihr seht die Schule am Tag.` dann `Ich seh sie, wenn ihr weg seid.` Dann `Rote Wolle dran. Damit ich ihn finde. Tu ihn zurueck.` Wer ihn stiehlt, bekommt dieselbe Wolle ohne Rede. In allen Varianten verlaesst der Schluessel mit dem Spieler das Haus (`hat:'schluessel'`).
- **Figurenmoment:** Max Ferdi im Fenster, die Cutscene endet mit `MAX FERDI: BIS GLEICH!`
- **Fund:** Ferdis Spind (nach dem Code): `POLAROID: DER FLUR, ALLE SPINDE OFFEN. | JEMAND HAT ES FESTGEHALTEN.`
- **Hook:** `MORITZ: 21 UHR BEI MIR. | ICH HAB EINE UEBERRASCHUNG.` Karte Doener: Ali schreibt Name und Nummer auf die Tuete, `Ich ruf, wenn er fertig ist.`

### Level 2 - Bei Moritz (M, +2:00)
- **Karte:** `FREITAG. 21:10. | MORITZ HAT AUFGERAEUMT.` Dann trocken: `DAS HAT ER NOCH NIE.`
- **Szene 1, Mitnehmen-Wahl** (vorhanden) mit Echo: Wer "nur wir zwei" waehlt, hoert `Nur wir zwei? ...Okay. Ich muss dir eh was sagen.` Erster Anlauf, dann klingelt es.
- **Szene 2, Moritz' Zimmer:** `ZWEI KARTONS. NICHT BESCHRIFTET.` Wahl `Was ist da drin?` (setzt `moritzKartonGesehen`) gegen weitergehen. Antwort: `Zeug. Muss mal aussortiert werden.` Der Trikot-Witz wird beidseitig: `DU: DAS TRAEGST DU SEIT DREI TAGEN` / `MORITZ: UND DU HAST KREIDE AM RUECKEN.`
- **Hinweiszeile im Flur:** `DER SCHULSCHLUESSEL KLIMPERT IN DER TASCHE.`
- **Figurenmoment:** Moritz (Kartons, erster Anlauf). Der Unbekannte an der Tuer bleibt Kampf und Cutscene und wird in L5 aufgeloest.
- **Fund:** Pinnwand: `POLAROID: MORITZ UND DU, SIEBTE KLASSE. | BEIDE MIT FURCHTBARER FRISUR.`
- **Hook:** Handy, neuer `HANDY_DREHBUCH`-Eintrag `lea1` (`ab:2`): `LEA: BIN SPAETER DA. MUSS NOCH FOTOS MACHEN.`

### Level 3 - Der Nachtbus (M, +2:00)
- **Karte:** `FREITAG. 22:00. | DER LETZTE BUS.`
- **Szene 1, Die Frau mit Rocky:** neue Zeile `Ich komm von der Schicht. Ich seh euch oefter. Immer um die Zeit.`
- **Szene 2, Sitzszene mit Jonas** (15 Sekunden, nach der Notbremse): `JONAS: Der Tuersteher sieht aus wie mein Onkel. Ich hab Angst.` Wahl `Ich auch.` (setzt `jonasAngstTeilen`, Beziehung +10) / `Wird schon.` / `Dann bleib hier.` Nach `Ich auch.`: `Echt? Du siehst so ruhig aus.` - `Ich bin nur schneller im Verstecken.` - `Das ist auch Angst.`
- **Szene 3, Moritz' zweiter Anlauf:** `Du, ich muss dir was...` / `KONTROLLE! FAHRSCHEINE!`
- **Figurenmoment:** Jonas.
- **Fund:** Fenstersitz: `POLAROID: EURE SPIEGELBILDER IM BUSFENSTER. | NIEMAND SCHAUT IN DIE KAMERA.`
- **Hook:** Nach `DU: GESCHAFFT. NIEMAND HATS GEMERKT.` kommt `FRAU: Ich hab es gemerkt. Viel Spass.`

### Level 4 - Die Schlange (S, +1:30)
- **Karte:** `FREITAG. 22:40. | ZWEIHUNDERT MENSCHEN VOR EUCH.`
- **Szene 1, Dennis in der Schlange** (10 Sekunden, vor dem Boss): `Eine Stunde. Der kommt nicht rein, wer so aussieht.` / `Passt.`
- **Szene 2, nach dem Boss:** Der Tuersteher: `Ich steh hier acht Stunden. Ich seh euch alle kommen. Und gehen.`
- **Figurenmoment:** Dennis: `Nicht beeindruckt sein. Ich boxe, damit ich nicht muss.`
- **Fund:** Gitter: `POLAROID: DIE SCHLANGE VON OBEN. | WER STAND DA OBEN?`
- **Hook:** Karte Marvin (vorhanden, `marvinKennt`).

### Level 5 - Club (M, +2:30)
- **Karte:** `FREITAG. 22:50. | DER CLUB. UM EINS GEHT DAS LICHT AN.`
- **Szene 1, Kira und das erste Tschuess** (nach ihrem Gespraech, Taxi): `KIRA: TSCHUESS.` / `DU: BIS GLEICH.` / `KIRA: NEE. TSCHUESS.` Wahl `Tschuess.` (setzt `kiraTschuess`, Knoten 3) oder `Bis gleich.`
- **Szene 2, Sophie** (neuer Baumknoten): `Man vermisst nicht die Schule. | Man vermisst, dass alle im selben Raum sind.`
- **Szene 3, Semih am Ausgang** (heute stumm), SEMIH: `Heut hat mich keiner gefragt, wen ich kenne. War gut.`
- **Szene 4, Marvin und die SMS:** Die Cousin-Zeile (Kap. 2). Dann `UNBEKANNT: Wir sehen euch.` Ohne Handy liest Moritz sie vor: `Alter, ich hab ne komische SMS. 'Wir sehen euch.'` Antwort `Wir euch auch.` setzt `wirEuchAuch` (+4 Mut wie heute).
- **Figurenmoment:** Kira am Taxi, dazu Semih.
- **Fund:** Garderobe: `POLAROID: DEIN GESICHT BEIM ERSTEN BASS. | NIEMAND HAT DAS GESEHEN. AUSSER DER KAMERA.`
- **Hook:** Moritz' dritter Anlauf `Du, ich muss dir was...`, `MARVIN: JETZT.`

### Level 6 - Afterhour, der Traum (M, +3:00)
- **Karte:** `FREITAG. 02:00. | AFTERHOUR.` Im Traum zeigen alle Uhren 17:30, `ALLE UHREN ZEIGEN 17:30.`
- **Szene 1, Hausmeister:** `HAST DU MEINEN SCHLUESSEL GESEHEN.` Wahl `Hier. Ich bring ihn zurueck.` (setzt `schluesselVersprochen`, Wachheit +, Knoten 1) / `Welchen?` / `Nein.` Antwort: `Gut. Dann fehlt nichts.`
- **Szene 2, Moritz-Echo:** dritte Option bei `Hast du mich heute gefragt, ob ich mitwill?`: `Ich hab die Kartons gesehen.` (nur mit `moritzKartonGesehen`, setzt `moritzGeheimnis`). `Dann weisst du's. Sag's den anderen nicht. Noch nicht.`
- **Szene 3, Lea mit Kamera:** `Ich hab euch den ganzen Abend hinterherfotografiert. Seite 9 der Zeitung.` Ab drei Polaroids gibt sie dir die Seite. Dann die Frage `Warum rennst du die ganze Nacht?` Wahl `Weil danach alles anders ist.` (setzt `traumEinsicht`, die Zeile `DU WEISST JETZT, WARUM` wird endlich wahr) / `Ich renn nicht.` (`Okay. Dann sitzt du ganz ruhig da.`) / `Keine Ahnung.` Lea: `Wenn du stehenbleibst, ist es vorbei. Stimmt nicht. Aber ich versteh's.` Zur Uhr: `Die Schule hat jeden Abend um halb sechs zu. Auch heute. Das ist nicht schlimm.`
- **Figurenmoment:** Lea, dazu Moritz.
- **Fund:** `POLAROID: DIE WANDUHR. SIE STEHT. | SEIT HEUTE NACHMITTAG.`
- **Hook:** `LEA: GUTEN MORGEN. ES IST HALB DREI.` Handy: `UNBEKANNT: Trinkt Wasser.`

### Level 7 - Spaeti (M, +3:00)
- **Karte:** `FREITAG. 03:15. | DER SPAETI. FUENF MINUTEN RUHE.`
- **Szene 1, Bank-Runde** (optional, 40 Sekunden, jede Zeile einzeln antippbar): `WAS MACHST DU IM SEPTEMBER?` Antworten sind Daten (`AUSBLICK`). Wer Beziehung <= -5 hat, zuckt nur mit den Schultern.
  - `JONAS: ICH HAB ANGST, DASS | KEINER MEHR SCHREIBT.`
  - `DENNIS: TRAINING. DREIMAL DIE WOCHE. PASST.`
  - `SEMIH: ICH KENN DA WEN. | ABER NICHT FUER MICH.`
  - `LEA: ICH FOTOGRAFIER WEITER. FRAGT MICH MAL.`
  - `MAX FERDI: MUSS KURZ. BIS GLEICH.` (weg)
  - `MORITZ: ...SPAETER. | AUF DEM HEIMWEG. VERSPROCHEN.` (vierter Anlauf, von ihm selbst vertagt)
  - Mit `busDurchDieCrew` (heute nie gelesen): `MAX FERDI: IM BUS HAST DU UNS DURCHGEBRACHT.`
- **Szene 2, Tobi:** `Ich weiss, wo man die Sonne zuerst sieht. Wenn ihr wollt.` (setzt `tobiBruecke`, auch ohne dass er mitkommt).
- **Szene 3, Oezdemir:** `Alle, die bei mir Wasser gekauft haben. Ich schreib die auf.` (Wasser: 2 Euro, senkt den Pegel, hat einen Lacher, mehr nicht.)
- **Figurenmoment:** Jonas spricht es aus, Max Ferdi haut ab.
- **Fund:** `POLAROID: ALLE AUF DER BANK. | JEMAND LACHT NOCH IM FOTO.`
- **Hook:** `MAMA: egal wie spaet. ich bin wach.` Dann die Ecke mit den drei Wegen (Kap. 5).

### Level 8 - Heimweg (L, +3:00)
- **Karte:** `FREITAG, 04:10. | DEIN HEIMWEG.` Intro-Zeile statt "DEINE LEUTE SIND SCHON ALLE WEG": `DIE ANDEREN BIEGEN NACH UND NACH AB.`
- **Szene 1, Marvin:** `Hast du die auch gekriegt? 'Wir sehen euch.'` Gleiche Nummer. `Ich schreib so was nicht. Ich komm vorbei.` Im Frieden-Pfad: `Alle gehen. Ich bleib. Ich hab keinen mehr, mit dem ich Mist bau.`
- **Szene 2, Kampf** (vorhanden): Mit Dennis (Beziehung >= 10) wird das Dazwischengehen ein Wort: `NICHT SCHLAGEN. REDEN. ICH KANN AUCH REDEN.`
- **Szene 3, Die Abbiegungen (neu, im Wettlauf):** Entlang der Zonen biegt je ein Crew-Mitglied ab. Untertitel ohne Blockade: `JONAS: HIER LANG. BIS GLEICH.` In einem Zweisekundenfenster kann man stehenbleiben und `Tschuess` antworten. Das kostet 1,5 Sekunden Sonne (`TUNE`: `ABBIEGUNG_ZEIT`) und ist die einzige Mechanik-Folge: Stehenbleiben kostet etwas, und das ist die Frage der Nacht.
- **Szene 4, Finale SCHICHTWECHSEL (75 Sekunden, antippbar):**
  1. `DEINE STRASSE. 05:20.` Der letzte Begleiter bleibt stehen (hoechste Beziehung, im Sonne-Ende Moritz auf der Bruecke). `MORITZ: ...Ich zieh im September weg.` / `DU: Ich weiss.` (nur mit `moritzGeheimnis`, sonst `DU: Was?`).
  2. Die Baeckerin macht Licht: `Frueh dran heut. Broetchen sind gleich fertig.` Ein Taxi hupt einmal, der Spaeti-Neon blinkt zweimal, irgendwo ein Akkord.
  3. `UNBEKANNT: Wir sehen euch.` Wahl `Wir euch auch.` (setzt `wirEuchAuch`, Knoten 2) / `Wer bist du?` Dann: `Ali. Doener. Ich hab alle Nummern. Mein Viertel passt auf sich auf.`
  4. `MORITZ: TSCHUESS.` Antwort `Bis gleich.` (setzt `bisGleichAmEnde`) / `Tschuess.` (setzt `tschuessGesagt`, Knoten 3) / `Bis September.`
  5. Zwei Schluessel in der Hand: `EINER ZUM RAUSKOMMEN. EINER ZUM HEIMKOMMEN.` Dann der Abspann.
- **Figurenmoment:** Moritz sagt es. Max Ferdi biegt nicht ab und setzt sich als Erster hin.
- **Fund (nur Sonne-Ende):** `POLAROID: ERSTES LICHT. | ALLE DREHEN SICH WEG. NUR EINER NICHT.`

---

## 4. Entscheidungen mit sichtbarem Echo

Neue Flags sind **fett**. Jedes hat mindestens einen Leser (sonst meldet `flagcheck` sie als verloren).

| Entscheidung | Flag | Echo |
|:--|:--|:--|
| Schluessel ehrlich vom Hausmeister / im Traum zurueckversprochen | `hausmeisterHilft`, **`schluesselVersprochen`** | Knoten 1; Hausmeister im Chat; Epilog Briefkasten |
| Nur wir zwei mitnehmen | `gruppeKlein` | Moritz' erster Anlauf; kleinere Bank-Runde, dafuer mehr Zeilen je Figur |
| Moritz nach den Kartons fragen | **`moritzKartonGesehen`**, **`moritzGeheimnis`** | L6-Option; L8 `DU: Ich weiss.` |
| Jonas: `Ich auch.` | **`jonasAngstTeilen`** | Bank-Runde: Jonas sagt es dir persoenlich; Epilog-Ton warm |
| Kira: Tschuess | **`kiraTschuess`** | Knoten 3 sofort; L8-Abbiegefenster 3 statt 2 Sekunden |
| Handy aus dem Lehrerzimmer geholt | `handyZurueck` | SMS auf dem eigenen Handy statt per Crew; Chat-Antwort im Abspann |
| `Wir euch auch.` gesendet | **`wirEuchAuch`** (ersetzt die nie gelesenen `geantwortet_*`) | Knoten 2 |
| Lea: `Weil danach alles anders ist.` | `traumEinsicht` | Marvin und Lea bekommen im Finale eine Zeile mehr |
| Wasser im Spaeti | `spaetiWasser` | Oezdemir im Gruppenchat |
| Tobis Tipp | **`tobiBruecke`** | Das Sonne-Ende spielt auf Tobis Bruecke, mit Tobis Foto im Abspann |
| Heim / Weiterziehen / Sonne | `endeHeim`, `endeWeiter`, `endeSonne` | Szene 4 spielt an der Haustuer, in der Baeckerei oder auf der Bruecke |
| Marvin kennen, Frieden, Angst zugeben | `marvinKennt`, `fightFrieden`, `angstZugegeben`, `friedlich` (heute nie gelesen) | Frieden bekommt einen Grund; Marvins Epilog |
| Abbiegung: stehenbleiben und Tschuess | **`tschuess_<name>`** (je Figur), **`tschuessGesagt`**, **`bisGleichAmEnde`** | Epilog-Folie je Figur; Knoten 3 |

Dazu: `mamaBescheid`/`mamaAngelogen`, `klassenfahrtGeld`, `direktorMontag`, `mitgesungen` bleiben wie sie sind und kommen im Chat beziehungsweise in den Epilogen vor. `busDurchDieCrew` wird in L7 gelesen.

---

## 5. Die Enden

**Rahmen bleibt:** 9 Enden (3 Wege aus L7 mal 3 Kampfausgaenge: gewonnen, verloren, Frieden), Titel wie heute, "ENDEN GESEHEN: n VON 9". Alles gebaut und getestet, kein neuer Pfad.

**Neue zweite Achse: die rote Wolle.** Drei Knoten (Kap. 1), jeder ist fuer sich erreichbar und keiner ist Pflicht: Knoten 1 = `hausmeisterHilft` oder `schluesselVersprochen`, Knoten 2 = `wirEuchAuch`, Knoten 3 = `tschuessGesagt` oder `kiraTschuess`. Der Abspann zeigt die Wolle quer ueber das Bild, Knoten gefuellt oder leer, dazu den Stempel:
- 0 Knoten: `BIS GLEICH` (die melancholische Fassung, kein Verlust: `ALLE HABEN BIS GLEICH GESAGT. | KEINER TSCHUESS.`)
- 1 oder 2: `ROTER FADEN 1 VON 3`, `2 VON 3`
- 3: `SCHICHTWECHSEL`

Die Enden-Galerie im Menue zeigt die 9 Titel und darunter die beste Knotenzahl je Titel. Wer alle drei in einem Durchgang schafft, hat die Antwort gesehen.

**Wie man sie erkennt:** Nur im Abspann und in der Galerie. Waehrend des Spiels gibt es keinen Punktestand, nur den Moment (die Wahl im Tschuess-Fenster).

**Abspannreihenfolge** (alles ueberspringbar, 60 bis 90 Sekunden, jede Karte antippbar):
1. Wegzeile und Kampfzeile (vorhanden).
2. **Epilog-Folien**, je Crew-Figur zwei Zeilen, Ton aus der Beziehung. Beispiel Moritz: ab +15 `MORITZ: SEPTEMBER, ANDERE STADT. | ER SCHREIBT ZUERST.` Von 0 bis 14 `MORITZ ZIEHT UM. | DU WEISST NOCH NICHT, WOHIN.` Unter 0 `NOCH KEIN WORT VON MORITZ. ER MELDET SICH.` Nie spoettisch.
3. **Gruppenchat** `GRUPPE: NACHTSCHICHT (7)`, Zeilen nach Flags: `ALI: SIE SIND GUT RAUS.` / `TAXI: ICH HAB ALLES GESEHEN. WIE IMMER.` / `OEZDEMIR: DER MIT DEM WASSER. GUTER MANN.` (sonst `DER OHNE WASSER. NAJA. ER LEBT.`) / `HAUSMEISTER: SCHLUESSEL WIEDER DA. GUT.` (sonst `SCHLUESSEL WEG. EGAL.`) / `MUSIKER: DER HAT MITGESUNGEN. FALSCH.` / `BAECKERIN: BROETCHEN LIEGEN BEREIT.` Wer `Wir euch auch.` noch nicht gesendet hat, kann es hier tun.
4. **Album:** `ALBUM: n VON 8` mit den letzten drei Unterschriften. Ab fuenf schickt Lea die Zeitungsseite (`SEITE 9: LETZTE NACHT`).
5. Mamas Zeile (vorhanden, jetzt `SIE SAGT NICHT, WORAUF.`).
6. Wolle mit Knoten, Titel `ENDE: <Titel>`, Untertitel `Party Game drunk`.

---

## 6. Engine-Wuensche (alle aus dem Baukasten)

| Wunsch | Zweck | Aufwand |
|:--|:--|:--|
| KAPITELKARTE | Tabelle `KAPITEL` (Uhrzeit, Ort, Zeile) fuer alle 8 Level | S |
| PLAUSCH | Untertitelleiste; traegt Abbiegungen (L8), Bank-Runde (L7), Handy-Fallback (Crew liest vor) | M |
| MOMENTE/POLAROIDS | Fundobjekt `moment:` je Level, Sammlung im Menue, Album im Abspann | M |
| EPILOG-FOLIEN | Tabelle `EPILOG` aus Beziehungen, dazu `AUSBLICK` fuer die Platzhalter | M |
| ENDEN-GALERIE | 9 Titel mal 3 Knoten, Stempel | S |
| Stimmenfarben | Farbe und Piepton je `wer` (12 Eintraege), macht die Crew unterscheidbar | S |
| Schluessel-Symbol im HUD aller Level | Inventar-Anzeige, ein Pixelbild | S |
| Gruppenchat-Folie | Handy-Optik, nur Text | S |
| L8-Abbiegungen | kleine Interaktion im Wettlauf, `TUNE` + `nachttest` | M |

---

## 7. Schnitt (was ich bewusst nicht mache)

- Keine neuen Level, Kaempfe oder Minispiele, keine Sprachausgabe, keine zweite Sprache.
- Kein Hintergrunddrama fuer Freunde: keine Krankheit, keine Trennung der Eltern, keine Sucht. Das Unausgesprochene ist Umzug, Angst vor dem Vergessen und nie gefragt worden zu sein.
- Keine Mystik fuer UNBEKANNT (kein Zeitreise-Ich, kein Geist). Die Aufloesung ist ein Imbiss.
- Mama bleibt Handy und Epilog, kein Sprite.
- Finn und David bleiben Randfiguren, nur der Witz bekommt eine Wuerde-Zeile (`FINN: ZZZZZ... ICH HAB ALLES GEHOERT.`).
- Karte-Umwege bleiben, bis auf Alis Nummer.
- Der Pegel bekommt keine eigene Erzaehlung ausser `Trinkt Wasser.` Alkohol hat einen Preis (Bild schwankt, Blackout) und einen Lacher, nie ein Vorbild.
- Kein grosses Marvin-Pathos: sein Finale ist ein Nicken.
- Der Abbiegefenster-Mechanismus bleibt ein einziger Knopf, kein neues Menue.

---

## 8. Risiken

1. **Kitsch.** Abschied kippt schnell. Gegenmittel: jede melancholische Zeile bekommt innerhalb von zwei Zeilen einen trockenen Konter (`Das ist auch Angst.`, `Ein Taxi hupt einmal.`), und die schwersten Saetze stehen in tippbaren Karten, nicht im Gespraech.
2. **Platzhalter-Freunde.** Das Unausgesprochene sind erfundene Kleinigkeiten ueber Menschen, die es wirklich gibt. Alles steht in `AUSBLICK` und laesst sich gegen die echten Plaene tauschen, und jede Figur bekommt eine Zeile Haltung. Kritische Stellen aus `story-ist.md` Kap. 6, die hier umgeschrieben werden: Trikot-Witz (beidseitig), `VON MORITZ KOMMT NICHTS. DAS IST NEU.` (ersetzen durch `NOCH KEIN WORT VON MORITZ. ER MELDET SICH.`), `X IST NICHT MEHR DABEI` (zu `X MUSSTE HEIM`), Tobi `NEUE CREW` (zum Kenner), `ICH BIN SO DURCH. HAST DU WAS ZU TRINKEN?` (je Figur eigene Zeile).
3. **Wettlauf-Balance.** Abbiegungen kosten Sonnenzeit. Mit `nachttest` und 22 Kampfpruefungen absichern, sonst wird ERWISCHT zur Strafe fuers Verabschieden.
4. **Gesamtmenge.** Neues je Level 1:30 bis 3:00 (zusammen etwa 18 Minuten). Das ist die Obergrenze, nicht das Ziel. Zuerst bauen: L1, L5, L6, L8 (tragen den Faden), dann L7 und der Rest.
5. **Handy-Abhaengigkeit.** Wer das Handy nie holt, verpasst UNBEKANNT. Fallback ueber PLAUSCH (Moritz liest vor); das Finale funktioniert auch ohne.
6. **Lesbarkeit am Handy.** Zeilen und Zeichen gepruefte Schrift. Einmal alle neuen Texte durch `tools/nachttest.js` (Zeichen ausserhalb der Schrift).
7. **Flag-Hygiene.** Neue Flags brauchen Leser (Kap. 4); `node tools/flagcheck.js` nach jedem Level.
8. **UNBEKANNT bleibt gruselig.** Wenn der Ali-Reveal zu leise ist, bleibt "Wir sehen euch" eine Drohung. Darum drei Anlaeufe (`Wir sehen euch.`, `Trinkt Wasser.`, die Schicht) und Marvins gleiche Nachricht als Gegenprobe.
9. **Name Lea/Lena.** Lena wird im Text zu Jule, das Flag bleibt.
