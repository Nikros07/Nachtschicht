# Tutorial und Entschärfung – Plan

Stand: 28.10.2026, Branch `claude/gameplay`. Umsetzung in 14 Aufgaben: `docs/gameplay/tutorial-aufgaben.json`.

## Ziel

Die Besitzerin hat das Spiel gespielt. Ihr Urteil: Teile sind **zu schwer**, und oft ist **unklar, was man tun soll**. Der Plan ändert deshalb drei Dinge:

1. **Erklären, wenn es so weit ist.** Jede Mechanik bekommt einen kurzen Hinweis in dem Moment, in dem sie zum ersten Mal wirkt.
2. **Messbar entschärfen.** Zeitfenster, Fristen und Gegner werden nach den Messwerten angepasst. LOCKER soll in allen Leveln wirklich etwas ändern.
3. **Sackgassen und falsche Anleitungen beheben.** Am Handy dürfen keine Tastennamen mehr stehen.

## Befund in Zahlen (headless gemessen, `tools/nachttest.js`)

| Level | Was am meisten schadet | Zahl |
|:--|:--|:--|
| L1 Schule | Der Direktor startet neben dem Ausgang auf der Startetage | 28 von 48 Fängen gehen auf ihn; Geradeausläufer auf LOCKER werden in 30 von 40 Läufen erwischt |
| L1 | Zeit vom ersten Verdacht bis zur Jagd | NORMAL 526 ms, HART 405 ms |
| L1 | Schlüssel oder Zettel sind nie zu finden (Handy-Möbel, Sicherung) | 1,9 % bzw. 11,1 % der Runden |
| L2 Bei Moritz | Wer früh reagiert, verliert den Türkampf | Neuling, der 0,2–0,5 s nach dem Ausholen drückt: 1 % Siege |
| L2 | LOCKER wirkt nicht | `schwer()` wird im Level nicht aufgerufen |
| L2 | Fünfmal PERFEKT einschenken, und David lehnt trotzdem ab | Pegel bei David 34,9 statt der nötigen 35 |
| L3 Nachtbus | Verstecken und Kegel werden nie erklärt | Durchlaufen endet auf NORMAL tödlich; mit der richtigen Taktik gibt es 0 Kontrollen auf allen Stufen |
| L3 | Der Sprint-Hinweis nennt die falsche Taste | „E SPRINGT“, gesprungen wird aber mit Leertaste |
| L4 Schlange | Jab-Fenster | 350/280/243 ms. Bot mit 300 ms Reaktion: NORMAL 8/20, HART 0/20 |
| L4 | Hämmern ist so stark wie Kontern; die Ramme trifft nie | Masher NORMAL 6/10 |
| L5 Club | Marvin nimmt Leute weg, und die Regel wird nicht erklärt | MIA ist nach 48,7 s weg, auf allen Stufen gleich |
| L5 | Nach einem Blackout führt jeder Neustart wieder in den Blackout | Pegel 100 wird gespeichert |
| L6 Afterhour | Die Tür RAUS lügt; Aufwachen am Start | E-Spam schafft das Level in 5 min nie; bis zu 1420 px zurück |
| L7 Späti | Pfandwurf-Fenster | 47 ms je Durchgang |
| L8 Heimweg | Kampf | Neulinge gewinnen 0–2 von 8 Läufen, auch auf LOCKER. Gold-Reaktion mit 150–200 ms: 0/8 |
| L8 | Sonne nach Umwegen und verlorenem Kampf | ab 4 Umwegen unschaffbar, und NOCHMAL ist eine Endlosschleife |
| übergreifend | Die Schwierigkeit sieht ein Neuling nie | NEUE NACHT startet sofort, die Auswahl steht nur unter EINSTELLUNGEN |
| übergreifend | Die Lektionspuppe wird nicht gezeichnet | Zufallsdrücker schafft den Konter-Schritt in 1,2 s |
| übergreifend | Konterfenster auf LOCKER nur 25 % länger | Flitzer 145 ms (NORMAL 116 ms) |

## Urteil über die zwei Konzepte

Die Festlegung aus dem abgebrochenen Lauf wurde gegengeprüft und **bleibt bestehen**: **Konzept A (Lernen durch Tun) als Grundlage, ergänzt um Teile aus B.**

| Kriterium | A Lernen durch Tun | B Geführter Einstieg | Entscheidung |
|:--|:--|:--|:--|
| Wirkung für Neulinge | Erklärt im Moment der ersten Begegnung; sichere erste Begegnung | Erklär-Karten erklären mehr, halten aber das Spiel an | A. Die Befunde zeigen Timing-Probleme („wer früh drückt, verliert“). Die erste echte Begegnung muss gelingen, Lesen reicht dafür nicht. |
| Fairness | Checkpoints, LOCKER-Angebot nach Niederlagen | LOCKER vorgewählt beim ersten Start | Beides: Checkpoints aus A, Erstwahl aus B |
| Aufwand | Eine Datei `hilfe.js` mit wenigen Haken | 9 Karten, Randpfeil, Zielanzeiger mit Kamera-Haken | A. Karten und Pfeil kosten am meisten und lassen sich ohne Browser am wenigsten prüfen. |
| Risiko für Tests | Stumm bei `?lektion=0`, deshalb bleibt der nachttest gleich | Karten pausieren das Level und verändern Abläufe in den Tests | A |
| Handy | Platzhalter und Knopfnamen | Knopf „?“ und Tafel | Beides: `tasteText()`/`aktionsMarke()` und WAS JETZT? im Handy-Menü |

**Aus B übernommen:**

- Die Übungspuppe hat eine eigene Uhr. Sie funktioniert damit auch in Leveln ohne `kampf.js`, gibt GENAU!/ZU FRUEH zurück und verlangt drei Konter in Folge, auf LOCKER zwei.
- Die erste NEUE NACHT fragt nach der Schwierigkeit, LOCKER ist vorgewählt.
- WAS JETZT? ist über Tab, das Pausemenü und das Handy-Menü erreichbar. Die Karte zeigt das Ziel, die letzten Tipps und die Steuerung und kann die Lektion neu öffnen.
- Unblockbare Angriffe bekommen einen roten statt goldenen Balken. Das Gold ist deckender.

**Bewusst nicht übernommen:**

- Neun anhaltende Erklär-Karten
- Randpfeil
- Dauerhafte Zielzeile auf dem Canvas. Grund: Sie kollidiert mit den HUD-Ecken (L2-Liste, L7-Liste), und das lässt sich ohne Browser nicht prüfen. Das Ziel steht stattdessen in WAS JETZT? und auf der Handy-Tafel.

**Eigene Festlegungen:**

- Tipps nutzen den vorhandenen Hinweisplatz `S.hinweis`/`S.hinweisT`, mit Warteschlange. Es gibt keine neue Zeichenebene, damit bleibt das Layout gleich.
- Die Tipps sind still bei `?lektion=0` (nachttest und Messungen). `?hilfe=1` schaltet sie trotzdem ein.
- In den Leveln heißt der Aufruf `hilfeTipp(id, pc, handy)`, immer mit String-Literalen in einer Zeile. `test/hilfe.test.js` liest alle Seiten und prüft:
  - höchstens 44 Zeichen
  - nur Zeichen der Schrift (kein `=`)
  - keine Tastennamen in der Handy-Fassung
  - gleiche id bedeutet gleicher Text
- `dialog.js`: Die Standardantwort zählt in der **vollen** Antwortliste und ist vorgewählt. Das behebt den falschen Kampf-Standard in L3 und die Falle beim Hausmeister in L1.
- LOCKER-Angebot: `HILFE` erkennt eine Niederlage am Wechsel auf `S.modus==='ende'` ohne `S.gewonnen`. Nach 2 Niederlagen kommt das Angebot einmal je Level und Gerät.

## Konzept im Überblick

1. **Erst-Tipps:** ein Satz mit höchstens 44 Zeichen. Er kommt, wenn die Mechanik zum ersten Mal wirkt, und wird je Gerät über alle Level gemerkt: „Warte auf Gold“ lernt man in L2 und sieht den Satz in L4 und L8 nicht noch einmal. Die Anzeigedauer richtet sich nach der Länge, etwa 12 Zeichen pro Sekunde. Es gibt eine Warteschlange und höchstens 10 Tipps je Level.
2. **Sichere erste Begegnung:**
   - L1: Zeitlupe beim ersten Verdacht.
   - L2: das erste Ausholen läuft mit dem Faktor 1,5 langsamer.
   - L4: die ersten zwei Angriffe sind immer SCHWUNG, solange man noch nie gekontert hat.
   - Am Ausholbalken steht JETZT!, bis man dreimal gekontert hat; auf LOCKER immer.
3. **Checkpoints:**
   - L1: nach Game Over direkt ins Level, ohne Titel und Intro.
   - L2: NOCHMAL AN DER TÜR.
   - L4: direkt in den Kampf; das Dennis-Gespräch addiert sich nicht mehr.
   - L8 hat schon einen Checkpoint.
4. **Hilfe statt Strafe:**
   - Nach 2 Niederlagen im selben Level wird einmal LOCKER angeboten (E: ja, Leertaste: nein; am Handy LOCKER/NEIN).
   - Die Schwierigkeit ist in Pause und Handy-Menü umstellbar.
   - Tipps lassen sich an- und abschalten und neu zeigen.
5. **LOCKER wirkt überall:** zwei neue Faktoren in `SCHWIERIGKEITEN`:
   - `frist` für Uhren und Fristen in L1, L5, L7 und L8
   - `fensterMin`, die Mindestlänge des Konterfensters in echten Sekunden. Sie sitzt zentral in `kampf.js` und gilt für Anzeige und Logik gleich.
6. **Handy:**
   - `tasteText(pc, handy)` und `aktionsMarke()` (E bzw. !) ersetzen alle Tastennamen auf dem Bild.
   - Die Lektion hat ein eigenes Feld `textTouch` und zeigt Knopfnamen statt „KNOPF“.
   - Schleichen in L1 geht mit dem Stick.

## Engine-API

### Neu: `nacht/hilfe.js`

Wird nach `erzaehl` geladen und als `var HILFE` deklariert, damit `typeof` beim Laden in `nachttest` nicht wirft.

```js
const HILFE_TUNE={ zeichenProSek:12, minDauer:2.5, maxDauer:6, luecke:0.4, schlangeMax:3,
  proSeiteMax:10, angebotNach:2, jetztAnzahl:3, verlaufMax:3, sperre:0.5 };
// Speicher: nachtschicht.hilfe = {gesehen, zaehler, niederlagen, angebot, aus} – überlebt NEUE NACHT

hilfeTipp(id, pc, handy, dauer?) -> bool  // einmal je Gerät; wartet, bis S.hinweisT<=0
hilfeSag(pc, handy, dauer?)      -> bool  // sofort, ohne Merker (Rückmeldungen)
HILFE.lernt(id, n=1) / HILFE.zaehle(id)   // sichere erste Begegnung
HILFE.jetztMarke()                        // LOCKER oder die ersten 3 Konter
HILFE.ziel(text) / HILFE.zielText()       // für WAS JETZT? und die Handy-Tafel
HILFE.takt(dt) / HILFE.zeichne()          // kern.js
HILFE.wasJetzt() / laeuft() / schliessen() / lektionNochmal()
HILFE.kontext()                           // mobil.js: {aktion:'LOCKER',zwei:'NEIN'} bzw. {aktion:'WEITER',zwei:'UEBEN'}
HILFE.niederlage() / angebotAktiv() / angebotAntwort(ja)
HILFE.an() / eingeschaltet() / setze(b) / vergiss() / stumm() / text(pc,handy)
```

### Änderungen an vorhandenen Dateien

| Datei | Änderung |
|:--|:--|
| `stand.js` | LOCKER `gegner` 0,80 → 0,70, `muede` 0,70 → 0,50. Neu `frist` 1,3 / 1 / 0,85 und `fensterMin` 0,25 / 0,18 / 0 s. `ladePegel`/`ladeBestN` in try/catch (sonst stürzt die Karte bei gesperrtem Speicher ab). |
| `kampf.js` | `konterAnteilFuer(g, anteil)` gilt nur für echte Kämpfer, nicht für Spieler, Puppe oder Level-eigene Gegner. `imKonterfenster` nutzt die Funktion, und ein gelungener Konter zählt `konter`/`konter-jetzt` hoch. |
| `dialog.js` | Standardantwort: Index in der vollen Liste, vorgewählt, bei Zeitablauf genommen. |
| `hud.js` | `tasteText`, `aktionsMarke`. Der Ausholbalken nutzt `konterAnteilFuer`, das Gold wird deckender (`#ffd447aa`), unblockbare Angriffe rot, dazu die JETZT!-Marke. |
| `kern.js` | Die WAS-JETZT-Karte hält die Welt an. `HILFE.takt` läuft nach `update`, `HILFE.zeichne` am Ende. |
| `mobil.js` | `HILFE.kontext()`. Die Tafel zeigt das Ziel und das Geld mit Cent. Im Menü kommen WAS JETZT?, SCHWIERIGKEIT, TIPPS und TIPPS NEU ZEIGEN dazu. |
| `eingabe.js` | Tab öffnet WAS JETZT?. |
| `lehre.js` | Puppe mit eigener Uhr, gezeichnet mit Balken und Rückmeldung; Konter dreimal in Folge (LOCKER zweimal). `textTouch`, Knopfnamen am Handy, `stick:true` (Schleichen per Stick), `LEHRE.zeige()`. Neue Schritte: L2 Konter, L6 Schweben, L7 Halten. |
| `pause.js` | WAS JETZT? als zweiter Eintrag. Einstellungen bekommen SCHWIERIGKEIT, TIPPS und TIPPS NEU ZEIGEN. |
| `menue.js` | Erste NEUE NACHT ohne gespeicherte Schwierigkeit: Modus `schwerWahl` („WIE SOLL DIE NACHT WERDEN?“, LOCKER vorgewählt). Dazu TIPPS-Schalter. |

## Je Level

**Legende:** T = Erst-Tipp (Text in der Aufgabe festgelegt), Z = Ziel für WAS JETZT?, (M) = gemessen, (N) = nach dem Einbau nachmessen.

### L1 Schule (`index.html`, T06)

**Hilfen:**

- **T** beim Start: Frist „UM 17:30 …“.
- **T** beim ersten Verdacht, dazu Zeitlupe 0,5 für 0,8 s.
- **T** bei der ersten Jagd: „LAUF – ODER E AM SPIND“.
- **T** im Spind: „IM SPIND BIST DU SICHER“.
- **T** zum Direktor, zum Schleichen (über `S.zeit` statt `setTimeout`) und zur Vibration (mit H).
- **T** beim ersten Zettel und als Leerlauf-Tipp nach 40 s ohne Zettel.
- **T** zur Lampe und zum Hausmeister (werfen, dann klauen).
- Über dem Hausmeister steht „E REDEN“.
- Das Startbild nennt die Spielart.
- Die Uhr ist ab 17:00 golden.
- Das Erwischt-Bild zeigt „UHR –10 SEK“.
- Nach dem Schlüssel steht an der Treppe „S AUSGANG“ bzw. „AUSGANG >>>“, Ziel „RAUS: ERDGESCHOSS GANZ RECHTS“.

**TUNE:**

| Wert | alt → neu | Grund |
|:--|:--|:--|
| `chefStartEtage`/`chefStartX` (neu) | fest 0 / 640 → 2 / 600 | (M) Such-Bot NORMAL 4/40 → 24/40, LOCKER 9 → 34/40 |
| `chefSicht` | 116 → 90 | (M) Geradeausläufer LOCKER 30/40 → 0/40 erwischt |
| `chefJagdDauer` | 6,5 → 4 | wie oben |
| `verdachtProSek` | 1,9 → 1,5 | (M) NORMAL 526 → 667 ms; zusammen mit der Etage 33/40 geschafft, HART 19/40 |
| `levelSekunden`, `fluchtSek` | × `schwer().frist` | Bisher wirkte LOCKER nur auf den Verdacht |
| Herzen | `TUNE.leben + schwer().leben` | wie oben |
| `zeitstrafe` | 14 → 10 | drei Fänge kosteten 42 s |

**Fehler:**

- Sonder-Möbel (Handy-Möbel, Sicherung) bekommen keinen Schlüssel, Zettel oder Fund mehr.
- Die Schlüssel-Meldung wird nicht mehr überschrieben.
- Code-Zettel: „ETAGE 3“, und der Code steht in der Eingabe.
- Endbild: NOCHMAL nur bei Niederlage, nach einem Sieg WEITER.
- Checkpoint ohne Intro.
- Alle Handy-Tastennamen ersetzt.

### L2 Bei Moritz (`level2.html`, T07)

**Hilfen:**

- **T** Aufgabenliste.
- **T** „FINN BRAUCHT WAS AUS DEM KUEHLSCHRANK“.
- **T** bei Davids Ablehnung „ERST MUT ANTRINKEN …“.
- **T** zum Einschenken schon an den GETRAENKEN, nicht erst beim Drücken.
- **T** bei Pegel über 70.
- **T** zum Fehlgriff.
- **T** `konter-gold` beim Kampfstart und **T** `konter-frueh`.
- Das Wort MUT steht an der grünen Marke.
- **Z** je Phase.

**TUNE:**

| Wert | alt → neu | Grund |
|:--|:--|:--|
| `konterFenster` | 0,34 → 0,45 | (M) Neuling 1 % Siege; 338 ms statt 255 ms (N) |
| `lernWindupFaktor` (neu) | 1,5 | nur das erste Ausholen, solange `HILFE.lernt('konter')` |
| Ausholen | `gegnerWindup / schwer().gegner` | LOCKER wirkte nicht |
| Leben | `TUNE.leben + schwer().leben` | wie oben |
| Zu früh auf LOCKER | Nachdrücken erlaubt | „NOCH WARTEN – BIS GOLD“ |
| `davidMut` (neu) | 9; Bedingung Pegel **oder** Mut | (M) 5× PERFEKT brachte 34,9 < 35 |
| `pegelAbbau` | 0,6 → 0,4 | wie oben |
| `schenkZone` | [0,72; 0,86] → [0,68; 0,88] | (M) 187 → 267 ms |
| MITNEHMEN `standard` | 0 → 2 („mittel“) | Wer nichts wählte, bekam die schwerste Fassung |

**Checkpoint:** NOCHMAL AN DER TÜR. E führt zurück an die Tür, die Leertaste startet ganz von vorn. Bisher kostete eine Niederlage 70–128 s.

**Fehler:**

- Der Kühlschrank blinkt nach Gebrauch nicht mehr.
- Spiegel und David haben dieselbe Schwelle.
- Das Endbild zeigt nicht mehr WEITER und NEUSTART zugleich.

### L3 Nachtbus (`level3.html`, T08)

**Hilfen:**

- Sprint: „RENN NACH RECHTS – LEER SPRINGT“ bzw. „SPRUNG-KNOPF SPRINGT“. Bisher stand dort die falsche Taste E.
- **T** Ziel „ZUM AUSSTIEG GANZ RECHTS“.
- **T** zum roten Kegel, sobald ein Kontrolleur näher als 120 px ist.
- **T** am ersten Versteck.
- **T** „BLEIB DRIN, BIS ER VORBEI IST“.
- **T** beim ersten Alarm.
- **T** zu den Fahrgästen.
- **T** `kampf-tasten` mit Gold-Konter.

**TUNE:**

| Wert | alt → neu | Grund |
|:--|:--|:--|
| `jagdVerdachtNah` | 72 → 50 | (M) Geradeausläufer NORMAL: 2 Kontrollen, überlebt; HART bleibt tödlich |
| `vorsichtAb` (neu) | fest 70 → 40 | (M) Nach der Warnung blieben 283–733 ms |
| Leben | `+ schwer().leben` | |

Bewusst nicht getunt: Sprint und Kloppe (M: kein Problem).

**Fehler:**

- Ticket, Notbremse und Szene lassen sich nicht mehr gratis wiederholen. Der Vergleich vorher/nachher läuft über Geld bzw. Flag.
- Fahrschein-Text: „RETTET DICH EINMAL“.
- Der Tipp der Frau und die Notbremse nennen 5 Kontrolleure.
- DIE_DREI wählt bei Zeitablauf „ich warte“ (über `dialog.js`).
- Handy-Texte ersetzt.

### L4 Die Schlange (`level4.html`, T09)

**Hilfen:**

- **T** `konter-gold` beim ersten Angriff, nicht 3,5 s vorher.
- **T** `konter-frueh`.
- **T** „NOCHMAL E – ER WACKELT!“ nach dem ersten Konter.
- **T** `ramme` in Phase 2.
- **T** `puste`.
- **T** zum Pegel.
- Das Wort PUSTE am Ausdauerbalken.
- In der Schlange: „IHR WARTET IN DER SCHLANGE …“; der Handy-Knopf zeigt nichts statt WEITER.
- Automatisches Drehen zum Boss.

**TUNE:**

| Wert | alt → neu | Grund |
|:--|:--|:--|
| `jabWindup` | 0,55 → 0,70 | (M) Bot 300 ms: NORMAL 8 → 18/20, HART 0 → 14/20 |
| `fensterMinSek` | 0,28 → 0,36, **nach** dem Schwierigkeitsfaktor | (M) HART lag sonst bei 243 ms |
| `fehlschlagErholung` | 0,6 → 0,35 | (M) NORMAL 12 → 14/20 |
| `phasePauseKuerzer` | 0,22 → 0,15 | Pause in Phase 3 auf NORMAL 460 → 600 ms |
| `phaseWindupKuerzer` | 0,12 → 0,08 | wie oben |
| `pegelFensterStrafeMax` | 0,4 → 0,25 | Pegel 60 verengte das Fenster auf 280 ms |
| `lernAngriffe` (neu) | 2 | erste Angriffe SCHWUNG |
| `autoDrehen` (neu) | true | 0,2–0,9 Angriffe je Kampf kamen von hinten |

**Fehler:** Diese beiden gehören zwingend mit dem TUNE zusammen, sonst wird L4 schwerer.

- Ein normaler Schlag bricht das Ausholen nicht mehr ab. Das war der Masher-Vorteil.
- Die Ramme trifft jetzt: der Blick wird beim Rammen festgehalten, und der Boss läuft nicht mehr über den Spieler hinweg.

Außerdem:

- Checkpoint direkt in den Kampf.
- Anzeige x/maxHp statt immer x/5.
- „EINE ARENA“.
- Handy-Knopf heißt KONTER.
- Am Handy steht im Intro TIPPEN WEITER.

### L5 Club (`level5.html`, T10)

**Hilfen:**

- **Z** „SPRICH MIA, SOPHIE ODER KIRA AN“, danach „HINTEN RECHTS RAUS ZUR AFTERHOUR“.
- Intro: „DREI LEUTE KANNST DU ANSPRECHEN.“
- Tür ohne vorheriges Erlebnis: „ERST NOCH WAS ERLEBEN“.
- **T** Tanzen über die Warteschlange; der Start-Hinweis bleibt stehen.
- **T** zur Leiste. Sie ist jetzt sichtbar, auch im Modus `mini`.
- **T** zu Marvin, zum Rempeln, zur Bar, bei Pegel ≥ 50, bei Ruf < 40 und bei CONFIDENCE.
- **T** `kampf-tasten`.

**TUNE:**

| Wert | alt → neu | Grund |
|:--|:--|:--|
| `marvinKommtNach` | 25 → 45, × `frist` | (M) MIA weg nach 48,7 s, auf allen Stufen gleich |
| `marvinNimmt` | 9 → 15, × `frist` | wie oben |
| `marvinTempo` | 21 → 16 | wie oben |
| `ansprechFenster` | 22 → 30 | (M) 129 ms, Zufallsdrücker 11,8 % (N) |
| `ansprechTempo` | 170 → 140 | wie oben |
| `ansprechFehlerMax` | 2 → 3 | wie oben |
| `strobeGefahrAb` | 0,45 → 0,65 | (M) 12 Rempler in 60 s |
| `stolpernDauer` | 1,0 → 0,5 | wie oben |
| `rempelRadius` (neu) | 8 → 5 | wie oben |
| `kloppeLeben` | 5 → 7 | (M) 0/30 Siege außer beim Profi-Bot |
| `marvinHp` | 5 → 4 | wie oben |
| `flitzerVerzug` (neu) | 2 s | wie oben |
| `neustartPegelMax` (neu) | 60 | Blackout-Schleife |
| `startMinute` | 22:30 → 22:50 | wie Kapitelkarte und Intro |
| Standardantworten | MIA start/spruch 1 → 0, SOPHIE start 2 → 1, langweilig 1 → 0 | (M) Nichtstun führte zur Abfuhr |

### L6 Afterhour (`level6.html`, T11)

**Hilfen:**

- **Z** „ERINNERUNGEN: RAUM 101, CHEMIE, BIBLIOTHEK“, danach „GANZ NACH RECHTS ZU LEA“. Bisher stand dort irreführend „ZURUECK“.
- **T** bei Wachheit unter 50 und **T** zum Aufstehen.
- **T** am Licht in 60 px Nähe, nicht erst nach dem ersten Sprung.
- **T** „REDEN KANN WACH MACHEN“.
- Bei der ersten Schleife: „ERST DIE ERINNERUNG IM CHEMIERAUM“.
- Die Tür heißt „RAUS?“.
- Raumnamen deutlicher: `#ffffff18` → `#ffffff60`.

**TUNE:**

| Wert | alt → neu | Grund |
|:--|:--|:--|
| `tuerLuegtZiel` (neu) | fest 100 → 900 | (M) E-Spam nie fertig, rund 10 s je Benutzung |
| Aufwachpunkt | zuletzt benutztes Sofa → nächstes Sofa links | (M) bis zu 1420 px zurück |
| `konditionPegel` | 1,4 → 0,9 | Erschöpfung zu schnell bei Restpegel (N) |
| `schwereAb` | 30 → 20 | wie oben |
| LOCKER `muede` | 0,70 → 0,50 (`stand.js`) | wie oben |
| `reichweite` | 15 → 20 | (M) im Lauf 0,31-s-Fenster |
| Abbau beim Durchsuchen | aus | |

**Fehler:**

- Der Knopf AUFSTEHEN wirkt jetzt.
- Endbild: WEITER und NEUSTART nicht mehr gleichzeitig.
- Leertaste nach einem Sieg führt zur Karte.
- Handy-Texte ersetzt.

### L7 Späti (`level7.html`, T12)

**Hilfen:**

- **Z** Einkauf, danach Ecke.
- Bei weniger als 5 €: **T** zu Pfand und Wurf und **T** zu Heinz.
- **T** „PFAND AN DER KASSE ABGEBEN“; der Listenpunkt heißt „PFAND ABGEBEN“.
- **T** zum Wurf, sobald man am Stand in Reichweite ist.
- „HALTEN, NICHT TIPPEN“ statt eines verschenkten Wurfs.
- Nach der Kasse: „WASSER 2, SNACK 3 EURO – ZU WENIG GELD“.
- Titel „A D“ statt „WASD“.

**TUNE:**

| Wert | alt → neu | Grund |
|:--|:--|:--|
| `wurfPendel` | 1,4 → 1,0 | (M) 47 ms je Durchgang → etwa 120 ms |
| `wurfZone` | [0,5; 0,7] → [0,42; 0,78], Breite × `frist` | wie oben |
| `wurfMinHalt` (neu) | 0,15 s | Ein Tipp verbrauchte den ersten Wurf |
| `wurfGeld` | 0,25 → 0,5 | Pleite-Fall: 0,50 € pro Minute beim Herumprobieren |
| `rang.wurf.gut` | 0,8 → 0,6 | |
| `heinzTempo` | 20 → 12, ÷ `frist` | (M) bei 0 € und 10 s Zögern kein Puffer |
| `heinzStartVerzug` (neu) | 12 s | wie oben |

**Fehler:**

- Tobi-Schleife: „Spaeter.“ beendet das Gespräch.
- BANK-RUNDE ist ohne Crew automatisch erledigt.
- Handy-Texte ersetzt.

### L8 Heimweg (`level8.html`, T13)

**Hilfen:**

- **T** `konter-gold` und **T** `kampf-tasten` beim Kampfstart.
- **T** `ramme` und **T** zum Flaschenwurf.
- **T** zur Sonne nach dem Kampf.
- **T** „LEER HALTEN: HOEHER SPRINGEN“ vor dem ersten Hindernis.
- **T** zum Tschüss-Fenster.
- Nach einer Niederlage: „SONNE +10“.
- Endbild bei mindestens 3 Treffern: „TIPP: SPRUNG LAENGER HALTEN“.
- Titel: „IM SCHATTEN STEIGT DIE SONNE LANGSAMER“. Bisher stand dort falsch „MEIDE SCHATTEN“.
- Handlanger zeigen ihren Balken.
- Der Wurf hat einen roten Balken ohne Goldfenster.

**TUNE:**

| Wert | alt → neu | Grund |
|:--|:--|:--|
| `anfuehrerHp` | 9 → 7 | (M) Neulinge 0–2/8, auch auf LOCKER (N) |
| `jabWindup` | 0,48 → 0,62 | wie oben |
| `pause` | 0,80 → 1,0 | wie oben |
| `windupKuerzerProPhase` | 0,10 → 0,05 | wie oben |
| `hilfeIntervall` | 5,5 → 4,0 | wie oben |
| `konterAnteil8` (neu) | 0,45, an `konterVersuch` übergeben | (M) Gold-Reaktion 150–200 ms: 0/8 |
| `lichtStrafeBeiNiederlage` | 22 → 10 | Sackgasse |
| `hindernisStrafe` | 9 → 5 | (M) Geradeausläufer scheitert bei 61 % des Wegs |
| `lichtDauerBasis` | 55 → 65, × `frist` | wie oben |
| `hindernisHoehe` | 13 → 9 | (M) 50-ms-Tipp: Gipfel 15,8 px, Laster/Jogger nie |
| `warnAbstand` (neu) | fest 40 → 90 | Das „!“ kam nur 80–240 ms vor dem Absprung |
| `langsamAb` | 70 → 85 | Pegel 90 kostete sonst zwei Treffer |
| Start-Sonne | `sonneDeckeln()`: sauberer Lauf kommt mit 2 Treffern Puffer an | Sackgasse ab 4 Umwegen |

**Fehler:**

- Pause am Handy hält jetzt auch Kampf, Gespräch und Finale an. (M) Bisher fiel die HP hinter dem Menü von 3 auf 0.
- Balken und Konter-Logik nutzen dasselbe Fenster.
- Handy-Texte ersetzt.

## Fehler, die mitbehoben werden

**Sackgassen und Spielbrecher**

| Fehler | Wo behoben |
|:--|:--|
| L1 Schlüssel/Zettel im Sonder-Möbel | T06 |
| L5 Blackout-Endlosschleife | T10 |
| L8 Sonnen-Sackgasse | T13 |
| L8 Handy-Pause | T13 |
| L4 Masher und Ramme | T09 |
| L7 Tobi-Schleife und Bank ohne Crew | T12 |
| L6 AUFSTEHEN | T11 |
| L3 Kampf bei Zeitablauf | T02, `dialog.js` |

**Falsche Anleitung**

| Fehler | Wo behoben |
|:--|:--|
| L3 „E SPRINGT“ | T08 |
| L1-Lektion Schleichen am Handy | T04 |
| Unsichtbare Puppe | T04 |
| L5 Leisten-Hinweis unsichtbar | T10 |
| L1 Schlüssel-Meldung | T06 |
| L1 „2. STOCK“ | T06 |
| L8 „MEIDE SCHATTEN“ | T13 |
| WEITER und NEUSTART zugleich in L2, L4, L5, L6 | T07, T09, T10, T11 |
| L1 NOCHMAL führt zu Level 2 | T06 |
| L2 PERFEKT-Falle | T07 |
| L3 Gratis-Wiederholungen | T08 |

**Klein**

| Fehler | Wo behoben |
|:--|:--|
| Tastennamen am Handy in allen Leveln | T06–T13, mit `hud.js` aus T03 |
| `ladePegel`/`ladeBestN` ohne try/catch | T02 |
| L4 x/5 und „EIN ARENA“ | T09 |
| L5 Uhr und Blackout-Ort | T10 |
| L7 Geld gerundet | T03 |
| L7 WASD | T12 |
| L2 Kühlschrank | T07 |
| L8 Warnabstand nicht im TUNE | T13 |

**Nicht in diesem Durchgang:**

- Reihenfolge Lektion/Kapitelkarte in L2/L5
- Stadtkarte: „STICK: WAEHLEN“ und „KOSTET ZEIT“
- L1 toter Zweig :1067
- L5 Rempeln trotz fehlender Tiefe (bleibt flach, entschärft über `rempelRadius`)

Diese Punkte kommen nach dem Durchgang in `NACHT-TODO.md`.

## Aufgabenschnitt

| Welle | Aufgaben | Dateien |
|:--|:--|:--|
| 1 Engine | T01 `hilfe.js` + Test | T02 `stand`/`kampf`/`dialog` + Tests |
|  | T03 `hud`/`kern`/`mobil`/`eingabe` | T04 `lehre` + `nachttest` |
|  | T05 `pause`/`menue` + Tests | |
| Orchestrator | `python tools/engine_einbinden.py hilfe --nach erzaehl`, `python tools/version.py`, `ARCHITEKTUR.md`/`CLAUDE.md` ergänzen | |
| 2 Level | T06 L1 · T07 L2 · T08 L3 · T09 L4 · T10 L5 · T11 L6 · T12 L7 · T13 L8 | je eine Seite |
| 3 Nacharbeit | T14 Nachmessung (`docs/gameplay/messung/t14-nachmessung.js`, `messung-tutorial.md`) | |

Innerhalb einer Welle teilt keine Aufgabe eine Datei mit einer anderen. Welle 2 setzt voraus, dass `hilfe.js` eingebunden ist.

## Abnahme

1. **Jede Aufgabe** führt ihre Abnahme-Befehle aus der JSON-Datei aus:
   - `node tools/pruefe.js`, `node tools/nachttest.js <seite>`, `node test/hilfe.test.js`
   - einen Rauchtest mit `?lektion=0&hilfe=1`, der 60 s mit Tipps ohne Ausnahme laufen muss
   - eine Zahl je Level (Fenster, Pegel, Aufwachpunkt, Sprunggipfel)
2. **Nach Welle 2:**
   - die komplette Prüfliste aus `CLAUDE.md`, dazu `node test/hilfe.test.js` und `node test/dialog.test.js`
   - `launchcheck` muss BEREIT sagen
   - `flagcheck` muss ohne neue Funde laufen
3. **T14 belegt die Zielwerte:**

   | Messung | Ziel |
   |:--|:--|
   | Konterfenster Flitzer/Schläger | LOCKER ≥ 250 ms, NORMAL ≥ 180 ms |
   | L2 Tür | NORMAL ≥ 330 ms |
   | L4 Jab | alle Stufen ≥ 360 ms |
   | Pfandwurf | ≥ 100 ms je Durchgang |
   | Sonder-Möbel | 0 von 1000 Runden |
   | Direktor | startet auf Etage 3 |
   | Blackout-Neustart | Pegel ≤ 60 |
   | Aufwachen | ab x 1500 bei x ≥ 1000 |
   | 50-ms-Sprung | Gipfel > Hindernishöhe |
   | Sonnendeckel | wirkt |
   | DIE_DREI | wählt „ich warte“ |
   | Hilfe | still bei `?lektion=0` |

4. **Offen, nur im Browser prüfbar** (kommt in `NACHT-TODO.md`):
   - Überdeckung von Tipp-Zeile und HUD bei 320 und 432 px Breite
   - Lesbarkeit von JETZT! und dem roten Balken
   - Handy-Menü: WAS JETZT?, SCHWIERIGKEIT und TIPPS
   - L8-Pausebild im Kampf
   - Touch-Timing bei Tanzen und Gold-Konter
   - Mensch-Bot-Messung L4/L8 mit 200–250 ms Reaktion. Ziel: LOCKER ≥ 90 %, NORMAL ≥ 70 %, HART ≤ 50 % Siege.

## Risiken

- **Die Standardantwort ist jetzt vorgewählt**, und das gilt in allen Gesprächen. Wer E hämmert, nimmt künftig `standard` statt der ersten Antwort. Die L5-Bäume werden deshalb auf neutrale Antworten gestellt. Die übrigen Bäume prüft der Orchestrator mit `flags-vertrag.md` und `flagcheck`.
- **HART wird leichter**, zum Beispiel L4 Jab HART 0/20 → 14/20. Das ist gewollt, die Besitzerin soll es aber bestätigen.
- **LOCKER `gegner` 0,70** verändert alle Kämpfe für Spieler, die schon LOCKER gewählt haben.
- **Tipp-Merker gelten je Gerät.** Ein zweiter Spieler am selben Gerät sieht keine Tipps mehr. Abhilfe: TIPPS NEU ZEIGEN in den Einstellungen.
- **Die Werte mit (N)** sind Schätzungen aus den Befunden. Sie werden erst nach T14 bzw. nach einer Mensch-Bot-Messung festgeschrieben.
