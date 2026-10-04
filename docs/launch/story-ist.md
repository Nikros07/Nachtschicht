# NACHTSCHICHT - Erzaehl-Ist-Aufnahme (Stand 3. Oktober 2026)

Quellen: index.html, level2-8.html, karte.html, nacht/handy.js, README.md, PLAYTEST.md,
`node tools/flagcheck.js` (61 Flags, 50 wirksam, 7 verloren). Nichts am Spielcode geaendert.
Zitate stehen so, wie sie im Spiel stehen (Gespraeche klein, Cutscenes gross, ohne Umlaute).

Kurzbefund: Anfang (Schule, Max Ferdi), Mittelstueck (Club-Frauen, Marvin, Traum) und Finale
(Abspann liest viele Entscheidungen) tragen. Schwach sind die Zeitleiste (Uhren widersprechen sich),
die Crew (ausser Moritz keine eigene Stimme) und die Faeden Handy/UNBEKANNT/Pegel, die nebenher laufen.

---

## 1. Die Nacht als Zeitleiste

Karte-Uhrzeiten (karte.html STATIONEN): Schule 17:30, Moritz 21:40, Nachtbus 22:15, Schlange 22:25,
Club 22:30, Afterhour 02:00, Spaeti 03:30, Heimweg 04:10. Zwischen den Leveln gibt es je einen
Umweg (Kap. Karte unten).

### Level 1 - Die Schule (index.html) - 16:40, Schleichen
- Ort: Schule, 3 Etagen, 11 Raeume. Uhr 165 s bis 17:30 (Warnung 17:15). Zwei Spielarten pro Runde: Zweitschluessel versteckt, oder Hausmeister traegt ihn am Guertel.
- Beats: 1 Intro, 7 Zeilen. 2 "FIND DEN SCHLUESSEL", erste SMS von MAX FERDI. 3 Raeume durchsuchen (Zettel verraten Etage, dann Raum; Akku, Energydrink, Notizen). 4 Optional: das eingezogene Handy im Lehrerzimmer finden. 5 Optional: Ferdis Spind, drei Ziffern, Raten macht Laerm. 6 Lehrer und Direktor patrouillieren, Erwischtwerden kostet Herz und 14 s. 7 Hausmeister ansprechen oder abzocken. 8 Ausgang im Erdgeschoss. 9 Wer erwischt wurde, wird vom Direktor an der Tuer gestellt. 10 Cutscene: Direktor am Kragen gepackt, draussen springt Max Ferdi dazu.
- Figuren: DIREKTOR, HAUSMEISTER, Lehrer (namenlos), MAX FERDI, DIE JUNGS (nur SMS).
- Zeilen: "FREITAG. LETZTER SCHULTAG." / "HEUTE ABEND GEHT WAS. DA WILLST DU HIN." / Hausmeister: "Eingepennt. Beim nachsitzen. Das muss man erstmal schaffen." / "DU: GUTE NACHT, HERR DIREKTOR" / "MAX FERDI: FENSTER. ERDGESCHOSS. ZWEI SEKUNDEN."
- Flags/Werte: setzt `handyZurueck`, `hausmeisterHilft`, `ferdiSpindOffen`, `direktorVersehen`, `direktorMontag`, `direktorGeflohen`; mag HAUSMEISTER (+10/-5/-12), ruf, mut, geld. Crew MAX FERDI (+15 % Tempo). `starte()` setzt den ganzen Speicherstand zurueck.
- Ende/Sog: Gewonnen = "LEVEL 1 GESCHAFFT"; verloren = "DER HAUSMEISTER HAT ABGESCHLOSSEN". Sog: die SMS "ohne euch faengt nix an", "gleich schliesst der laden".

### Karte nach 1: DOENERLADEN (ALI). "Grundlage. Deine Mutter waere stolz." Setzt `umweg_1`, +Wachheit.

### Level 2 - Bei Moritz (level2.html) - 21:10, Suchen/Reden + erster Kampf
- Ort: Wohnung (Flur, Wohnzimmer, Kueche, Moritz' Zimmer, Bad, Balkon). Bahn faehrt 22:00.
- Beats: 1 Intro, 5 Zeilen. 2 Wahl MITNEHMEN (Max: alle / nur wir zwei / Moritz und Finn). 3 Jacke suchen (jede Runde woanders). 4 Moritz' Ausweis suchen. 5 FINN (Schlaefer) mit Energydrink wecken. 6 DAVID am Balkon-Telefon holen (braucht Mut, also Pegel). 7 Kueche: trinken, Pegel steigt, Bild schwankt, 100 = Blackout. 8 Wohnungstuer: es klingelt, ein Unbekannter, erster Kampf (Konter). 9 Cutscene.
- Figuren: MAX FERDI, MORITZ, FINN, DAVID, der Unbekannte an der Tuer.
- Zeilen: "ALSO MACHST DU ES." / Max: "Vier mann. Der tuersteher wird uns lieben." / David: "JA GUT. AUFGELEGT." / "MORITZ: WER WAR DAS UEBERHAUPT" - "DU: KEINE AHNUNG" / "MORITZ: EBEN. DAS BRINGT GLUECK."
- Flags/Werte: setzt `gruppeGross`/`gruppeKlein` (zu Levelbeginn geloescht), Crew MORITZ immer, FINN/DAVID je nach Wahl; mag MORITZ +6/-4/+3. Pegel startet hier und wird weitergereicht.
- Ende/Sog: "MIT IHM LAEUFT ES BESSER MIT DEN CHAYAS" (wirkt nur als groesseres Ansprechfenster in Level 5). Sog: die Bahn um zehn.

### Karte nach 2: GELDAUTOMAT. "Deine Karte. Das Konto fuer die Klassenfahrt." 20 Euro abheben setzt `klassenfahrtGeld`.

### Level 3 - Der Nachtbus (level3.html) - 22:00, Sprint + Schleichen im Gang
- Ort: Strasse zur Haltestelle, dann Bus mit Kontrolleuren, Sitze/Gepaeck als Verstecke. Intro sagt "Bahn", Schild sagt BUS.
- Beats: 1 Intro, 4 Zeilen. 2 Sprint ueber Hindernisse. 3 Einstieg, "KEIN TICKET. NICHT AUFFALLEN." 4 Automat (kaufen/draufhauen). 5 DER LAUTE (aufstacheln = Ablenkung, kostet Ruf). 6 DIE FRAU mit Hund Rocky (Tipp, wo die Kontrolleure stehen). 7 JONAS (kommt mit, wenn Mut >= 35). 8 Notbremse. 9 Waggon-Tuer: DER MIT DER KAPPE und zwei Kumpel, vier Auswege (Crew, anblaffen, zahlen, kaempfen). 10 Aussteigen.
- Figuren: DER LAUTE, DIE FRAU, JONAS, DER MIT DER KAPPE, Kontrolleure, AUTOMAT. Max und Moritz sind nur "dabei".
- Zeilen: Laute: "Ich war auch mal wie du. Nur schneller." / Frau: "Der heisst Rocky. Und ja, er faehrt auch schwarz." / Jonas: "Na endlich. Ich hab seit drei wochen nichts gemacht." / Kappe: "Braver junge. Zehn euro und du darfst durch." / "MAX FERDI: REDEN WIR NIE WIEDER DRUEBER."
- Flags: `busSzene`, `busTipp`, `busTicket`, `automatKaputt`, `notbremse` (+`spaetDran`), `jonasDabei`, `busDurchDieCrew` (nie gelesen), `busAngeblafft`, `busGezahlt`, `busKloppe`, `busKloppeGewonnen`, `busKloppeVerloren`; mag DER LAUTE, DIE FRAU, JONAS (alle nie gelesen).
- Ende/Sog: "DU: GESCHAFFT. NIEMAND HATS GEMERKT." Sog: der Club. Folgen des Levels: Jonas in der Crew, Ruf/Mut und einige Zeilen im Abspann; der Bus ist sonst fast abgeschlossen.

### Karte nach 3: STRASSENMUSIKER. Wonderwall. Mitsingen setzt `mitgesungen`.

### Level 4 - Die Schlange (level4.html) - 23:15 laut Intro, Boss-Kampf
- Ort: vor dem Club. Nur Konter, kein Laufen. Trefferziel +1 bei `gruppeGross`, -1 bei `gruppeKlein`.
- Beats: 1 Intro (5 Zeilen, erklaert Kontern). 2 Tuersteher kommt, "NA WARTE". 3 Phasen mit zwei Schlagmustern. 4 Er geht zu Boden. 5 Cutscene: Tuersteher tritt zur Seite, DENNIS aus der Schlange kommt mit.
- Zeilen: "VORNE STEHT EINER, DER EUCH NICHT REINLAESST." / "TUERSTEHER: ...OKAY. OKAY." / "DU: DARF ICH JETZT" / "DENNIS: RESPEKT. ICH KOMM MIT REIN."
- Flags: setzt `tuersteherBesiegt`; Crew DENNIS bedingungslos. `spaetDran` wird hier NICHT gelesen, obwohl der Code in Level 3 das behauptet.
- Ende/Sog: "ER BOXT UND HAT EUREN RUECKEN IM CLUB."

### Karte nach 4: DER TYP MIT DER KETTE. "Hast du Feuer?" - "Marvin. Merk dir das. Wir sehen uns drinnen." setzt `marvinKennt`; frech antworten setzt `marvinGereizt` (Marvin kommt frueher).

### Level 5 - Club (level5.html) - 22:30 laut Intro (Uhr laeuft rueckwaerts!), Reden/Minigames
- Ort: Eingang, Tanzflaeche (Stroboskop), Bar, Raucherecke, Klos, Hinterausgang. 600 s, "UM EINS GEHT DAS LICHT AN".
- Beats: 1 Intro, 5 Zeilen. 2 Garderobe. 3 Drei Zielpersonen: MIA (feiert mit LENA deren Geburtstag), SOPHIE (Bar), KIRA (Raucherecke, wartet aufs Taxi). Ansprechen per Timing-Zeiger; Ausgang je Gespraech: Ecke, Nummer, nett, Abfuhr, Tanz-Minispiel. 4 "Die Ecke" wird erzaehlt (6 Zeilen je Frau). 5 MARVIN taucht auf, nimmt Frauen weg ("X IST JETZT MIT MARVIN UNTERWEGS"), stellt dich zum Kampf. 6 Ambient-Ereignisse alle ~25 s. 7 Ausgang: Rausschmiss, Licht an oder Hinterausgang. 8 SEMIH an der Tuer, wenn der Abend etwas hergab.
- Zeilen: Mia: "Ernsthaft? Das ist dein erster Satz?" / Sophie: "Du stehst zwischen mir und der Bar. Das kostet dich einen Shot." / Kira: "Ich zieh naechsten Monat weg. Andere Stadt. Keiner weiss es." / Marvin: "Kein Stress. Genau. Lauf." / "ALLE SEHEN PLOETZLICH SO AUS, WIE SIE SIND."
- Flags: `clubJa_*`, `schreibt_*` (je mia/sophie/kira), `lenaVersorgt`, `marvinKennt`, `marvinRueckzug`, `clubGekniffen`, `clubKloppeGewonnen`/`clubKloppeVerloren`; mag MIA/SOPHIE/KIRA; liest `gruppeGross`, `tuersteherBesiegt`, `marvinGereizt`. Crew SEMIH bei Erfolg, Kampfsieg oder Ruf >= 60.
- Ende/Sog: "SEMIH KENNT JEDEN. AUCH DIE AFTERHOUR." oder "KEINER WARTET AUF DICH. ALSO WEITER."

### Karte nach 5: PIZZA UM EINS. Essen senkt Pegel; "eine ganze fuer alle" gibt der Crew +5 Zuneigung.

### Level 6 - Afterhour (level6.html) - "tief in der Nacht", 02:00 laut Karte, Traum
- Ort: die Schule aus Level 1, verzerrt (Flur, Raum 101 doppelt, Chemie, Turnhalle, Bibliothek, Keller, "EINE KUECHE"). Navigieren, keine Gegner, Wachheit sinkt, Sofas helfen, bei 0 Wegknicken.
- Beats: 1 Intro, 6 Zeilen. 2 Drei Erinnerungen finden (Spind, Labortisch, Buecher). 3 Echos aus Level 1: HAUSMEISTER ("HAST DU MEINEN SCHLUESSEL GESEHEN."), LEHRER ("SETZEN."), DIREKTOR ("ICH KOMME GLEICH VORBEI."). 4 Nachtechos: MORITZ, "SIE" (die Frau aus dem Club), MARVIN oder ein Schatten. 5 Raumschleife in Raum 101, bis man die Chemie-Erinnerung hat. 6 Luegende Tuer "RAUS". 7 LEA wartet am Ende. 8 Aufwachen.
- Zeilen: Moritz: "Hast du mich heute eigentlich gefragt, ob ich mitwill? Oder einfach entschieden?" / Sie: "Schreibst du mir morgen? Oder war das nur heute Nacht?" / Marvin: "Du hast Angst vor mir. Ich seh das." / Lea: "Das hier ist nicht echt. Aber du bist es." / Erinnerung: "DER FEUERALARM. DU WARST DAS."
- Flags: `traumMoritz`, `traumEinsicht`, `versprochen_*`, `angstZugegeben`; mag Moritz +6/+2/-6. Gute Antworten geben Wachheit (+30). Crew LEA.
- Ende: "LEA: GUTEN MORGEN. ES IST HALB VIER." - "DIE ANDEREN SIND SCHON UNTEN. SPAETI."

### Karte nach 6: BRUNNEN. "Das war kalt. Das war richtig." (Pegel -15).

### Level 7 - Spaeti (level7.html) - "CA. 3 UHR", Ruhe
- Ort: Strasse, Spaeti, Bank, Ecke. Keine Gefahr, kein Kampf; Wasser (2 Euro), Snack (3 Euro), Pfand sammeln.
- Beats: 1 Intro, 4 Zeilen ("FUENF MINUTEN RUHE."). 2 Crew sitzt auf der Bank; wer mit schlechter Beziehung (<= -5) fehlt: "X IST SCHON HEIM". 3 HERR OEZDEMIR an der Kasse. 4 TAXIFAHRER (Tipp fuer Level 8). 5 NELE (Freundinnen weg, Handy tot). 6 TOBI (kommt mit, wenn Mut >= 30). 7 HEINZ kaempft um Pfandflaschen. 8 Ecke: "Und jetzt?" - Heim / Weiterziehen / Sonnenaufgang. 9 Bilanz-Cutscene mit Zeilen zu allen, denen man geholfen hat.
- Zeilen: Oezdemir: "Alle, die bei mir Wasser gekauft haben." / Taxi: "Dreissig Jahre Nachtschicht. Ich seh alles." / Nele: "Meine Freundinnen sind weg. Und mein Handy ist tot." / Heinz: "Anstaendig. Gibt nicht mehr viele." / Crew: "DAS WAR EINE NACHT."
- Flags: `spaetiWasser`, `spaetiSnack`, `oezdemirGeschichte`, `taxiTipp`, `neleGeholfen`, `heinzGeholfen`, `tobiDabei`, `endeHeim`/`endeWeiter`/`endeSonne`. Liest `handyZurueck`, `kondition >= 50` (Weiterziehen), Beziehungen.
- Ende/Sog: "DRAUSSEN WIRD ES SCHON WIEDER HELLER." plus eine Zeile je Hilfe.

### Karte nach 7: MAMA ANRUFEN. "Endlich. Weisst du, wie spaet es ist?" setzt `mamaBescheid`.

### Level 8 - Heimweg (level8.html) - ca. 04:10, Reden, Kampf, Wettlauf
- Ort: Strecke in 6 Zonen (Hauptstrasse bis "DEINE STRASSE"), Schattenfelder, 11 Hindernisse; Kampfarenen Strasse, Hinterhof, Baustelle.
- Beats: 1 Intro, 6 Zeilen ("NUR DU BIST NOCH UNTERWEGS."). 2 Vorgespraech mit MARVIN (oder "DER ANFUEHRER"), Auftakt haengt vom Club ab. 3 Frieden (selten) oder grosser Kampf, 3 Phasen, Handlanger, Flaschen, Crew geht dazwischen. 4 Wettlauf gegen die Sonne (Umwege machen sie frueher). 5 Ziel. 6 Abspann-Cutscene aus Bausteinen. 7 "DURCHGESPIELT".
- Zeilen: "Wir haben noch was offen, du und ich." / "Heute nicht. Geh nach Hause, Marvin." / "...Weisst du was. Du hast recht. Ich bin auch muede." / "WENN DEINE ELTERN DICH SO SEHEN - AUS."
- Flags: setzt `fightGewonnen`/`fightVerloren`/`fightFrieden`/`friedlich`/`mutigerKopf`; liest fast alles (Kap. 4).
- Ende: Sonne holt dich ein = "ERWISCHT" (Wiederholung); im Sonnenaufgang-Ende verliert man nicht.

---

## 2. Figuren

| Figur | Funktion / wo | Stimme | Potenzial / Schicksal |
|:--|:--|:--|:--|
| MAX FERDI | Erster Freund, +15 % Tempo; L1, L2, L3 (Cutscene), SMS | "ALTER ENDLICH" / "ANGEBER" von dir | Nach L3 stumm, nur Tempo. Kein Abschied, keine Beziehung. |
| MORITZ | Bester Freund, Ziel von L2; L5 (Fenster), L6, L7, L8 | "Hast du mich heute eigentlich gefragt..." | Staerkster Faden, aber L3-L5 stumm. |
| FINN, DAVID | Schlaefer/Telefonierer, nur L2 | "WAS" / "WAR SOWIESO LANGWEILIG." | Danach nur Namen in der Crewliste. |
| JONAS | L3, SMS "Ich hab Angst" | "Ich hab seit drei wochen nichts gemacht." | Nach L3 kein Auftritt. |
| DENNIS | L4 Boxer | "RESPEKT. ICH KOMM MIT REIN." | Sonst nur Zahl (+1 Herz). |
| SEMIH | L5-Ende, "kennt jeden" | keine Zeile | Nie wieder gesprochen. |
| LEA | L6-Ende, holt dich raus | "Das hier ist nicht echt. Aber du bist es." | Taucht ohne Vorlauf auf; Name nahe an LENA. |
| TOBI | L7 | "Die sind ohne mich weiter. Einfach so." | Gute Mini-Figur, nur eine Abspannzeile. |
| MARVIN | Rivale: Karte, L5, L6, L8 | "Kein Stress. Genau. Lauf." | Bester Faden; nie Hintergrund. |
| MIA, SOPHIE, KIRA, LENA | L5, SMS, L6 "sie", Abspann | eigene Stimmen | Gut gebaut; Lena nur Nebenfigur. |
| MAMA | nur Handy und Karte | "Ich kann nicht schlafen." | Nie im Bild, aber der klarste Faden. |
| HAUSMEISTER, DIREKTOR | L1, Echo L6 | Hausmeister menschlich | Direktor hat nach L1 nur Echo und Abspannzeile. |
| OEZDEMIR, TAXI, NELE, HEINZ | L7 | trocken, warm | Je eine Szene, sauber eingeloest. |
| DER LAUTE, DIE FRAU, KAPPE | L3 | knapp | Beziehungen werden nie gelesen. |

Verschwinden ohne Abschied: Max Ferdi (nach L3), Finn und David, Jonas, Dennis, Semih, der Unbekannte an Moritz' Tuer (nie erklaert), der Hausmeister (nur Echo), Kontrolleure. In Level 7 sagen alle Crew-Mitglieder dieselben zwei Saetze. Kira geht mit dem Taxi und "hebt die Hand am Fenster": der einzige echte Abschied.

---

## 3. Motive und rote Faeden

- **Schule**: L1 Ort und Direktor, L6 Traum (Echos, Feueralarm-Erinnerung), L8 "MONTAG ERSTE STUNDE" nur bei `direktorMontag`. Gut geschlossen, aber nur ueber Abspannzeilen.
- **Handy**: In L1 eingezogen; ohne `handyZurueck` bleibt alles stumm, am Ende "DEIN HANDY LIEGT NOCH IM LEHRERZIMMER. n NACHRICHTEN." Drehbuch: moritz1, mama1, jonas1, mama2, mia1, sophie1, kira1, moritz2, mama3, marvin1. Teilweise eingeloest: Mama, Mia/Sophie/Kira (Abspann). Antworten `geantwortet_*` werden nie gelesen.
- **Mama**: bester Faden. mama1 "Wann bist du zuhause?" - "Um zwoelf. Versprochen." (`mamaAngelogen`) / "Wird spaet. Schlaf ruhig." (`mamaBescheid`); Karte-Umweg; L8-Abspann hat drei Varianten, letzte Zeile "MAMA HAT GESCHLAFEN" / "UM ZWOELF, HAST DU GESAGT." / "MAMA HAT GEWARTET."
- **Uhr**: L1 17:30, danach nur Karte und TUNE; als Mechanik nur L2/L3 (Bahn 22:00), L5 (Licht um eins) und L8 (Sonne). Widersprueche: L4 Intro 23:15 vs Karte 22:25 vs L5 Intro 22:30; L2 21:10 vs Karte 21:40; Bus 22:00 vs Karte 22:15; "mama2: Es ist nach Mitternacht" kommt ab L5, also bei 22:30; L6 "HALB VIER" vs L7 "CA. 3 UHR".
- **Sonne**: L5 "Licht geht an", L7 Bruecke, L8 Endgegner. Kommt erst in L8 als Ziel ins Spiel, L7 bereitet es vor; passt.
- **Pegel**: Mechanik in L2, L3, L5, L6, L7, L8 (langsamer), Pizza/Brunnen. Kein Abspann liest ihn; keine Figur kommentiert ihn ausser Mia ("riechst nach Wodka").
- **Mama + Heimweg + Sonne** tragen das Finale; "Warum rennst du die ganze Nacht" bleibt offen: `traumEinsicht` verspricht "DU WEISST JETZT, WARUM", gezeigt wird es nie (Antwort steckt in "Du hast dich nicht getraut. Und dann zu sehr.", L6).
- **UNBEKANNT "Wir sehen euch"**: handy.js, ab Level 8, nur wenn `marvinKennt`; Antwort "Wir euch auch." gibt Mut +4 und setzt nichts. Der Fight kommt gleich am Levelanfang und ist ein Gespraech ("Ihr lauft seit dem Club durch unsere Strasse."), nicht "an der Kreuzung", wo Taxifahrer und Heinz ihn ansiedeln. Nummer-Herkunft und Absender unerklaert. Beantwortet wird er nur indirekt: Marvin steht im Vorgespraech da, mehr nicht.
- **Marvin/Angst**: L5 Begegnung -> L6 Angst zugeben (`angstZugegeben`) -> L8 "Ich hab Angst. Aber ich geh nicht weg." (`mutigerKopf`, +1 Leben). Vorbildlich geschlossen.
- **Klassenfahrt**: L1 Notiz "KLASSENFAHRT ABGESAGT. SCHON WIEDER." -> Karte-Geldautomat -> Abspann "DIE ZWANZIG AUS DER KLASSENKASSE FEHLEN AM MONTAG. NICHT DIR." Kleiner schoener Faden, Besitzer des Geldes unklar.

---

## 4. Das Ende

- **9 Enden** = 3 Wege (L7: `endeHeim`/`endeWeiter`/`endeSonne`) x 3 Kampfausgaenge (`fightGewonnen`/`fightVerloren`/`fightFrieden`): "HEIM - OHNE EINEN SCHLAG" usw. Frieden nur mit Mut >= 60, Ruf >= 65 und `marvinKennt`. "Weiterziehen" braucht Wachheit >= 50. Niederlage beendet nichts, kostet 22 Licht und -8 Ruf.
- **Abspann (baueEnde)**, in dieser Reihenfolge: Wegzeile ("*DU SCHLIESST LEISE DIE HAUSTUER*" / "OBEN AUF DER BRUECKE SETZT IHR EUCH HIN."); Kampfzeile ("DEIN AUGE WIRD MORGEN BLAU SEIN."); je Mia/Sophie/Kira ("DEIN HANDY VIBRIERT. MIA: BIST DU GUT HEIMGEKOMMEN?" bei `versprochen_*`, sonst "DU LIEST SIE ERST MITTAGS" bei `schreibt_*`); Handy im Lehrerzimmer; Mama (3 Varianten); NELE, TOBI; die 4 gewichtigsten Nachhallzeilen aus 17 (Gewicht g 9 bis 1: `klassenfahrtGeld`, `direktorMontag`, Moritz >= 18 oder <= -10, `traumEinsicht`, `traumMoritz`, `direktorGeflohen`, `busKloppeVerloren`, `lenaVersorgt`, `clubKloppeVerloren` ...); "MIT DABEI: ..." oder "GANZ ALLEIN DURCH DIE NACHT."; "ENDE: <Titel>".
- Danach "DURCHGESPIELT", "ENDEN GESEHEN: n VON 9", Zeit, Crew; E startet alles neu.
- Nicht gelesen vom Ende: Pegel, Handy-Antworten, `busDurchDieCrew`, `friedlich`, Beziehungen zu JONAS/TOBI/LAUTE/FRAU/HAUSMEISTER, Crew-Groesse ausser in der Liste. Der Abspann ist eine Zeilenliste ohne Schlussbild; die letzte emotionale Zeile ist Mama, danach kommt der Titel.
- Widersprueche: L8-Intro "DEINE LEUTE SIND SCHON ALLE WEG." gegen "IHR LAUFT AN DEINEM HAUS VORBEI." und gegen die Crew, die im Kampf "GEHT DAZWISCHEN".

---

## 5. Staerken und Luecken

**Bleiben muss:**
- Level 1 als Mass (Schleichen mit Charakter); der Hausmeister, der Ehrlichkeit belohnt.
- Marvin-Faden (Karte, Club, Traum, Finale) und `mutigerKopf`.
- Die drei Frauen mit eigener Stimme; Kiras Taxi; die Ecke als erzaehlte Szene.
- Der Traum als verzerrte Schule mit den Echos (die Schleife, der Feueralarm).
- Der Spaeti: warm, kleine Szenen, die in der Bilanz zurueckkommen ("HERR OEZDEMIR WINKT DURCH DIE SCHEIBE.").
- Mama als unsichtbare Figur. Der Nachhall-Mechanismus (4 von 17, gewichtet).
- Kartenumwege als Mikro-Geschichten; der kurze, trockene Ton in 44 Zeichen.

**Luecken:**
1. Zeitleiste widerspricht sich (siehe Kap. 3); die Uhr als roter Faden fehlt zwischen L1 und L8.
2. Crew ohne Stimmen nach L2: Max, Finn, David, Jonas, Dennis, Semih, Lea tragen nur einen Zahlenwert; L7-Crew sagt identische Saetze; keine Abschiede.
3. Der Unbekannte an Moritz' Tuer (L2) ist nie aufgeloest, obwohl "WER WAR DAS UEBERHAUPT" ein Marvin-Vorgriff sein koennte.
4. UNBEKANNT hat keinen eindeutigen Absender, die Antwort wirkt nicht; die "Kreuzung" aus dem Taxi-Tipp ist leer, der Fight ist am Levelanfang.
5. Handy ist von einem optionalen Fund abhaengig und nicht von der Handlung; Nachrichten kommen im 25-Sekunden-Takt, egal was passiert.
6. Das Warum der Nacht bleibt ungesagt; Level 3 und L4 haben kaum Folgen; L7-Wahl (Heim/Weiter/Sonne) aendert fast nur Zeilen.
7. Pegel ohne Erzaehl-Folge; Lena/Lea-Namensnaehe; die Notbremsen-Zeile "FUENFZIG EURO" hat in Level 3 keine Entsprechung.

---

## 6. PERSONEN-HINWEIS (Crew-Figuren als Platzhalter echter Freunde)

Heikelste Stellen zuerst; "?" = Name oder Rolle kann Platzhalter sein, unklar.
1. **Moritz, Fussballtrikot** (level2.html SZENEN, README): "DU: DAS TRAEGST DU SEIT DREI TAGEN" - Hygiene-Witz; plus "ICH FIND MEINEN AUSWEIS NICHT - OHNE KOMM ICH DA NIE REIN" (hilflos).
2. **Moritz, Abspann** (level8.html NACHHALL): "VON MORITZ KOMMT NICHTS. DAS IST NEU." - der Freund wird als Kontakt-Abbruch gezeigt; ebenso level7.html "X IST NICHT MEHR DABEI" bei Beziehung <= -5 und level6.html "Alles klar." (Moritz kalt).
3. **Finn und David** (level2.html, "?"): Finn als Schlaefer ("ZZZZZ", mit Dose geweckt), David wird das Handy "einfach abgenommen"; MITNEHMEN: "Der rest ist zu drauf." / "David bleibt am Telefon".
4. **Tobi** (level7.html, "?"): "Die sind ohne mich weiter. Einfach so." und Abspann "TOBI HAT JETZT EINE NEUE CREW." / "ER REDET ZUM ERSTEN MAL." - Aussenseiter-Figur.
5. **Jonas** (level3.html, handy.js): "Der Tuersteher sieht aus wie mein Onkel. Ich hab Angst." und "Ich hab seit drei wochen nichts gemacht"; sein Sprite heisst "schmal".
6. **Einer von meinen Jungs tanzt mit dir.** (level5.html MIA_BAUM): ein ungenannter Freund wird fuer Lena eingeteilt.
7. **Alle Crew** (level7.html): "ICH BIN SO DURCH. HAST DU WAS ZU TRINKEN?" - jeder Freund als betrunken/durstig; level8.html "KEINER GEHT DAZWISCHEN" bei schlechter Beziehung.
8. **Max Ferdi** (level1.html, level3.html): "DU: ANGEBER", "REDEN WIR NIE WIEDER DRUEBER", Spindzettel "DU SCHULDEST MIR NIX MEHR" - freundschaftliche Frotzelei.
9. **Dennis, Semih, Lea**: ohne Spott (Boxer "RESPEKT", "KENNT JEDEN", rettet dich aus dem Traum).

Der Rest (Direktor, Marvin, Kappe, Frauen) ist Fiktion; Mia/Sophie/Kira und Lena stehen nicht in der Crew.
