# flags-vertrag.md - VERBINDLICH

Stand 3. Oktober 2026. Alle neuen Flags, Inventar, Beziehungen und Handy-Ids der Story-Bibel. **Namen duerfen von den Level-Autoren nicht geaendert werden.** Wer einen Namen braucht, der hier fehlt: nicht erfinden, in `NACHT-TODO.md` unter "Entscheidung noetig" melden.

Regeln:
- Alles camelCase, ASCII. Flags sind `false`, bis sie gesetzt werden (Standard `false`, ausser anders vermerkt).
- Gesetzt wird mit `wirke({flag:'name'})` oder `setzeFlag('name')`; gelesen mit `flag('name')`, `wenn:{flag:'name'}` oder `nichtFlag`. **Literale Namen verwenden**, damit `node tools/flagcheck.js` den Leser findet. Ausnahme (dynamisch gelesen): Praefix `moment` (8 Stueck) und `tschuess_` (5 Stueck); der Engine-Auftrag traegt beide Praefixe in `tools/flagcheck.js` als Allowlist ein.
- Entscheidungsflags eines Levels werden beim Levelstart (`neuesSpiel()` des Levels) auf `false` gesetzt, damit ein Wiederholungsversuch nicht nachwirkt: L5 `kiraTschuess`, `marvinNachgerufen`; L6 `schluesselVersprochen`, `moritzGeheimnis`; L7 `marvinWasser`, `tobiBruecke`; L8 `marvinMitkommen`, `tschuessGesagt`, `bisGleichAmEnde`, alle `tschuess_*`; L2 `moritzKartonGesehen`; L3 `jonasAngstTeilen`. `moment1..8` werden nur in `index.html` (Neuanfang der Nacht) geloescht, nicht bei Wiederholung.
- `aliNummer` wird auf der Karte gesetzt (kein Levelstart-Reset noetig; Nachtneustart loescht alles).

## 1. NEUE Flags

| Name | Bedeutung | gesetzt in | gelesen in |
|:--|:--|:--|:--|
| `schluesselVersprochen` | Im Traum dem Hausmeister den Schluessel zurueckversprochen (Knoten 1) | L6 Hausmeister-Wahl `Hier. Ich bring ihn zurueck.` (nur mit `hat:'SCHLUESSEL'`) | `epilog.js` (Wolle, Gruppenchat, Karte `DER SCHLUESSEL LIEGT IM BRIEFKASTEN.`); L8 Finale (Zwei-Schluessel-Karte) |
| `moritzKartonGesehen` | In Moritz' Zimmer nach den Kartons gefragt | L2 Zimmer-Wahl `Was ist da drin?` | L6 Moritz-Echo (dritte Option); L7 Bank (Plausch-Variante) |
| `moritzGeheimnis` | Im Traum `Ich hab die Kartons gesehen.` gewaehlt | L6 Moritz-Echo | L8 Finale (`DU: ICH WEISS.` statt `DU: WAS?`); `epilog.js` (Moritz-Folie) |
| `jonasAngstTeilen` | Jonas gesagt `Ich auch.` | L3 Jonas-Sitzszene | L7 Bank-Runde; `epilog.js` (Jonas-Folie) |
| `kiraTschuess` | Kira am Taxi `Tschuess.` statt `Bis gleich.` gesagt | L5 Kira-Taxi-Szene | L8 Abbiegefenster (3,0 s statt 2,0 s); `epilog.js` (Kira-Folie) |
| `marvinNachgerufen` | Marvin im Club nachgerufen | L5 Trikot-Szene `Marvin!` / Nachrufen | L6 Traum-Marvin (`Du hast gerufen.`); L8 Vorgespraech (Eroeffnung); L8 Frieden-Regel |
| `marvinWasser` | Marvin im Spaeti Wasser gegeben | L7 Marvin-Szene (nur mit `spaetiWasser`) | L8 Vorgespraech (`Danke fuer das Wasser.`); L8 Frieden-Regel |
| `marvinMitkommen` | Im Finale zu Marvin `Kommst du mit?` gesagt | L8 Finale (nur mit `marvinKennt`) | `epilog.js` (Marvin-Folie) |
| `wirEuchAuch` | Auf `Wir sehen euch.` mit `Wir euch auch.` geantwortet (Knoten 2) | `handy.js` (Antworten von `unbekannt1`, `unbekannt2`); L8 Finale Wahl | `epilog.js` (Wolle, Gruppenchat) |
| `aliNummer` | Bei Ali (Karte 1) etwas gekauft, Name und Nummer auf der Tuete | `karte.html` Umweg 1, bei `Einmal alles` und `Nur ne Cola` | L8 Finale (Alis Aufloesung: Variante mit/ohne Tuete) |
| `tobiBruecke` | Tobis Tipp zur Bruecke gehoert (auch wenn Tobi nicht mitkommt) | L7 Tobi-Szene | L8 Finale (Sonne-Ende auf Tobis Bruecke); `epilog.js` |
| `tschuessGesagt` | Zu Moritz `Tschuess.` gesagt (Knoten 3) | L8 Finale Moritz-Wahl | `epilog.js` (Wolle) |
| `bisGleichAmEnde` | Zu Moritz `Bis gleich.` gesagt | L8 Finale Moritz-Wahl | `epilog.js` (Zeile `ALLE HABEN BIS GLEICH GESAGT`) |
| `tschuess_jonas` | Beim Abbiegen von Jonas `Tschuess` gerufen | L8 Abbiegung (nur wenn Jonas in der Crew) | `epilog.js` (Jonas-Folie) |
| `tschuess_dennis` | dto., Dennis | L8 Abbiegung | `epilog.js` (Dennis-Folie: warme Zeile bei Beziehung >= 8 **oder** diesem Flag) |
| `tschuess_semih` | dto., Semih | L8 Abbiegung | `epilog.js` (Semih-Folie: warme Zeile bei Beziehung >= 8 **oder** diesem Flag) |
| `tschuess_lea` | dto., Lea | L8 Abbiegung | `epilog.js` (Lea-Folie: Zeitungszeile bei Momenten >= 5 **oder** diesem Flag) |
| `tschuess_tobi` | dto., Tobi | L8 Abbiegung | `epilog.js` (Tobi-Folie: Fotozeile bei `tobiBruecke` **oder** diesem Flag) |
| `moment1` | Polaroid L1 gefunden (Ferdis Spind) | L1 | `MOMENTE` (Album, Menue, Lea-Seite 9) |
| `moment2` | Polaroid L2 gefunden (Pinnwand) | L2 | dto. |
| `moment3` | Polaroid L3 gefunden (Fenstersitz) | L3 | dto. |
| `moment4` | Polaroid L4 gefunden (Gitter) | L4 | dto. |
| `moment5` | Polaroid L5 gefunden (Garderobe) | L5 | dto. |
| `moment6` | Polaroid L6 gefunden (Wanduhr) | L6 | dto. |
| `moment7` | Polaroid L7 gefunden (Bank) | L7 | dto. |
| `moment8` | Polaroid L8 (Geschenk am Finale) | L8 Finale (automatisch) | dto. |

Gesamt 26 neue Flags. Jedes hat mindestens einen Leser.

## 2. VORHANDENE Flags, die wiederverwendet oder jetzt erst gelesen werden

(`node tools/flagcheck.js` vor dem Bauen laufen lassen; Stand: 61 Flags, 7 verloren.)

| Name | Wiederverwendung |
|:--|:--|
| `handyZurueck` | unveraendert; ohne ihn liest Moritz Nachrichten per Plausch vor |
| `hausmeisterHilft` | L6 Hausmeister-Ton; Gruppenchat; Wahl im Traum zeigt `Hier. Ich bring ihn zurueck.` auch ohne ihn |
| `ferdiSpindOffen` | Polaroid `moment1` liegt hinter dem Spind (nur bei offenem Spind erreichbar); optionale Zeile |
| `direktorMontag`, `direktorVersehen`, `direktorGeflohen` | unveraendert (Nachhall); Text `direktorMontag` geaendert (siehe Bibel) |
| `gruppeGross`, `gruppeKlein` | L2 Anlauf 1; L7 Bank (Cameo Finn/David nur `gruppeGross`) |
| `jonasDabei`, `tobiDabei` | unveraendert; Jonas-Sitzszene (L3) und Bank (L7) nur mit Crew |
| `klassenfahrtGeld`, `mitgesungen`, `mamaBescheid`, `mamaAngelogen` | unveraendert |
| `marvinKennt`, `marvinGereizt` | Marvin-Folie nur mit `marvinKennt`; L5 Trikot-Szene nur mit `marvinKennt` |
| `tuersteherBesiegt` | unveraendert |
| `busGezahlt`, `busKloppeGewonnen`, `busAngeblafft` | Kappe-Verhalten L4, L5, L8 (Plausch) |
| `busDurchDieCrew` | **bisher nie gelesen, jetzt:** L7 Bank, Max: `IM BUS HAST DU UNS DURCHGEBRACHT.` |
| `notbremse` | Nie-Wieder-Liste (`DIE NOTBREMSE`) |
| `spaetDran` | unveraendert (Nachhall) |
| `schreibt_mia/sophie/kira`, `versprochen_mia/sophie/kira` | unveraendert (Abspann) |
| `geantwortet_mia/sophie/kira` | **bisher nie gelesen, jetzt:** Epilog (`DU HAST SOFORT ZURUECKGESCHRIEBEN.`). `handy.js` setzt sie weiter. |
| `lenaVersorgt` | unveraendert; im Text heisst Lena kuenftig JULE |
| `traumMoritz`, `traumEinsicht`, `angstZugegeben` | unveraendert; `traumEinsicht` erhaelt L6-Frage, L8 Zusatzzeile |
| `spaetiWasser`, `spaetiSnack`, `oezdemirGeschichte`, `taxiTipp`, `neleGeholfen`, `heinzGeholfen` | unveraendert; `spaetiWasser` Voraussetzung fuer `marvinWasser`; `taxiTipp` Gruppenchat |
| `endeHeim`, `endeWeiter`, `endeSonne` | `endeHeim` **bisher nie gelesen, jetzt:** L8 Finale-Ort und Ende-ID; alle drei bestimmen Finale-Ort und `endeWeg()` |
| `fightGewonnen`, `fightVerloren`, `fightFrieden`, `friedlich` | `fightVerloren` und `friedlich` **bisher nie gelesen, jetzt:** Epilog Marvin-Folie |
| `mutigerKopf` | unveraendert (+1 Leben) |
| `umweg_1` ... `umweg_7` | unveraendert |

`geantwortet_*` und `marvin1` (Handy-Id): siehe Abschnitt 5.

## 3. Inventar

| Name | Bedeutung | gesetzt | gelesen |
|:--|:--|:--|:--|
| `SCHLUESSEL` | Der Zweitschluessel des Hausmeisters mit roter Wolle. Menge 1. Wird nie abgegeben. | L1: sobald Schluessel gefunden **oder** vom Hausmeister bekommen **oder** gestohlen (`nimm:'SCHLUESSEL'`) | L2 Hinweiszeile (`hat:'SCHLUESSEL'`); L6 Wahl `Hier. Ich bring ihn zurueck.` (`wenn:{hat:'SCHLUESSEL'}`); sonst Option `Ich hab ihn nicht mehr.` |

Standard: nicht im Inventar. Wird bei Wiederholung von L1 wieder eingesammelt.

## 4. Beziehungen (nur die neu gelesenen oder veraenderten)

Alle laufen von 0 (Standard). Schwellen im Epilog: ab +10 warm, 0 bis 9 neutral, unter 0 mit Ausweg. Die Spalte "aendert" nennt die **neuen** Aenderungen; bestehende (Moritz +6/-4/+3 in L2 usw.) bleiben.

| Figur | aendert (neu) | gelesen |
|:--|:--|:--|
| `MORITZ` | L2 `Was ist da drin?`: +4 | `epilog.js` (>= 15, 0 bis 14, < 0). Moritz und MAX FERDI gehen in L7 nie heim (Auftrag L7), egal wie die Zahl steht |
| `JONAS` | L3 `Ich auch.`: +10; L8 Abbiegung `Tschuess`: +4 | L7 Bank (<= -5: `JONAS MUSSTE HEIM`); `epilog.js` |
| `DENNIS` | L4 Wahl in der Schlange: +4; L8 Abbiegung `Tschuess`: +4 | `epilog.js` (>= 8) |
| `SEMIH` | L5 Ausgang-Szene `Heut fragt dich keiner.`: +6; L7 Bank: +4; L8 Abbiegung: +4 | `epilog.js` (>= 8) |
| `LEA` | L6 Frage-Antwort: +8; `lea1` Antwort: +4; L8 Abbiegung: +4 | L7 Bank (<= -5 nur theoretisch); `epilog.js` (nutzt `MOMENTE`, nicht die Zahl) |
| `TOBI` | L7 Tobi-Szene: +6 | L7 Bank (<= -5) |
| `MARVIN` | L5 `Marvin!`: +6 / `Lass ihn.`: -2; L7 Wasser: +8 | L8 Vorgespraech (Zeile); Frieden-Regel nutzt Flags, nicht die Zahl |
| `HAUSMEISTER`, `DER LAUTE`, `DIE FRAU` | `HAUSMEISTER` L6: +6 | **bleiben alle drei ungelesen** (der Ton im L6-Echo kommt aus dem Flag `hausmeisterHilft`, nicht aus der Zahl); sie werden **nicht** weiter gepflegt (Streichung in `flagcheck` ist kein Fehler) |

Crew-Anzeige in Szenen: `ladeCrew().includes('NAME')`. Namen der Crew exakt: `MAX FERDI`, `MORITZ`, `FINN`, `DAVID`, `JONAS`, `DENNIS`, `SEMIH`, `LEA`, `TOBI`.

## 5. Handy-Ids in `HANDY_DREHBUCH` (`nacht/handy.js`)

| Id | `ab` | von | wenn | Antworten (Wirkung) |
|:--|:--|:--|:--|:--|
| `lea1` (**neu**) | 2 | LEA | `crew` egal, `nichtFlag` keine | `Mach ein gutes Foto.` (+4 LEA) / `Wo bist du?` (+2 LEA) |
| `mama2` (**geaendert**) | 6 (vorher 5) | MAMA | wie bisher `nichtFlag:'mamaBescheid'` | wie bisher |
| `unbekannt1` (**neu, ersetzt `marvin1`**) | 5 | UNBEKANNT `Wir sehen euch.` | keine | `Wir euch auch.` (`flag:'wirEuchAuch'`, `mut:4`) / `Wer bist du?` (keine Wirkung) |
| `unbekannt2` (**neu**) | 6 | UNBEKANNT `Trinkt Wasser.` | keine | `Wir euch auch.` (`flag:'wirEuchAuch'`) / `Ja, Mama.` (`mut:1`) |
| `mama3` (**geaendert**) | 7 (vorher 8) | MAMA `ich kann nicht schlafen` | wie bisher; steht damit vor `mama4` |
| `mama4` (**neu**, nach `mama3`) | 7 | MAMA `egal wie spaet. ich bin wach.` | keine | `Bin bald da.` (`flag:'mamaBescheid'`) |
| `mia1` (**Text**) | 6 | MIA | `Jule will wissen...` statt `Lena will wissen...` | wie bisher |
| `marvin1` (**entfernt**) | - | - | - | - |

Unveraendert bleiben `moritz1` (ab 2), `jonas1` (ab 4, `Der Tuersteher sieht aus wie mein Onkel. Ich hab Angst.` - das ist der Onkel-Witz; L3 und L4 wiederholen ihn nicht, L4 darf `ONKEL?!` darauf aufbauen), `mama1` (ab 3), `mia1`/`sophie1`/`kira1` (ab 6), `moritz2` (ab 7). Reihenfolge der Mama-Zeilen: `mama1` (3), `mama2` (6), `mama3` (7), `mama4` (7).

Fallback ohne Handy (`handyZurueck` false): fuer `unbekannt1` und `mama2` meldet sich ein Plausch (Plausch laeuft auf dem Canvas, also Grossbuchstaben, hoechstens 44 Zeichen mit Namen: Moritz `MORITZ: KOMISCHE SMS: "WIR SEHEN EUCH."`; Max bei `mama2` `MAX FERDI: DEINE MAMA FRAGT, WO DU BLEIBST.`). Der Engine-Auftrag baut dafuer das Feld `vorlesen:{wer,text}` im Drehbuch.

## 6. Werte

Keine neuen Werte (`mut`, `ruf`, `kondition`, `geld`, `pegel` genuegen). Gelesen neu: `pegel` am Ende fuer die Kater-Stufe (`< 25` LEICHT, `< 60` MITTEL, sonst ARCHE NOAH).

## 7. Berechnet, nicht gespeichert (kein Flag)

- `knoten()` in `epilog.js`: Knoten 1 = `flag('schluesselVersprochen')`, Knoten 2 = `flag('wirEuchAuch')`, Knoten 3 = `flag('tschuessGesagt')`. Zaehlt 0 bis 3.
- `momente()` in `erzaehl.js`: Anzahl gesetzter `moment1..8`.
- Ende-ID: `endeWeg()` + `endeKampf()` aus `level8.html` (`heim|weiter|sonne` x `gewonnen|verloren|frieden`), Titel wie heute in `NACHT.gesehen`; zusaetzlich der String `SCHICHTWECHSEL` bei `knoten()==3`.
- `momenteBest` (Liste in `NACHT`, wie `gesehen` ueber den Neuanfang hinweg gespeichert): `MOMENT.fund(n)` traegt n dort ein; nur die Galerie liest sie. Das Album im Abspann zaehlt weiter die Flags `moment1..8` der laufenden Nacht.
- Sonderfall `wirEuchAuch`: wird nicht beim Levelstart zurueckgesetzt (kommt aus dem Handy); ein L8-Wiederholungsversuch behaelt ihn bewusst.
