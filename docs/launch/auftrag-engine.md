# auftrag-engine.md - Neue Engine-Bausteine

Stand 3. Oktober 2026. Dieser Auftrag ist zu gross fuer einen Durchgang und wird in **zwei Teilen nacheinander** gebaut, beide vor allen Level-Auftraegen (zusammen Aufwand L): **Teil A** = `texte.js`-Huelle, `erzaehl.js` (Kap. 1 bis 6), `dialog.js`, `lehre.js`, `handy.js`-Feld, Tags in den neun Seiten, `nacht.js`-Aenderungen (`nichtHat`, `momenteBest`); **Teil B** = `epilog.js`, `menue.js`/`mobil.js` (Kap. 7 bis 8). Die Tool-Aenderungen (Ladeliste, Pruefungen, Allowlist) macht jeder Teil fuer seine Scripts. Danach koennen die Level-Auftraege parallel laufen. Verbindlich daneben: `STORY-BIBEL.md` (Texte), `flags-vertrag.md` (Namen). Fertig-wenn am Ende dieser Datei.

Grundsaetze: alles klassische Scripts ohne Module, keine neuen Abhaengigkeiten, jede Stellschraube in einem `ERZAEHL`-Konstantenblock oben (wie `TUNE`). Texte nur Grossbuchstaben ohne Umlaute, Zeilen hoechstens 44 Zeichen. **Alle Blitze/Flackern ueber `FX`** (`nacht/komfort.js`): hier blinkt nur der Polaroid-Fund (1 Hz, `FX.hz(1)`), sonst nichts. Alle Funktionen fehlertolerant: fehlt `texte.js` oder ein Eintrag, passiert nichts (keine Ausnahme). Nach jeder Aenderung in `nacht/`: `python tools/version.py`.

## Dateien und Ladereihenfolge

Neue Scripts, in allen Seiten `index.html` und `level2.html` bis `level8.html` direkt nach `nacht/handy.js` und vor `nacht/menue.js` einzutragen (je ein Tag):

1. `nacht/texte.js` - **reine Daten**, geschrieben vom Auftrag `auftrag-karte.md`. Der Engine-Agent legt nur eine **leere Huelle** mit den vier Konstanten an (`TEXTE_KAPITEL={}`, `TEXTE_BISHER=[]`, `TEXTE_MOMENTE={}`, `TEXTE_MENUE={}`), damit er testen kann; der Karte-Agent fuellt sie.
2. `nacht/erzaehl.js` - STIMMEN, KARTE, KAPITELKARTE, PLAUSCH, MOMENTE und die drei Haken (`erzaehlTakt`, `erzaehlZeichne`, `erzaehlTaste`).
3. `nacht/epilog.js` - EPILOG, GRUPPENCHAT, NIEWIEDER, KATER, WOLLE, ENDEN-Verwaltung.

Weitere kleine Aenderungen: `nacht/nacht.js` (`bedingungErfuellt` bekommt `nichtHat:'NAME'`, true wenn das Ding **nicht** im Inventar ist, gebraucht in L6; `STAND_VORLAGE` bekommt `knotenBest:{}` und `momenteBest:[]`, `nachtZuruecksetzen` bewahrt beides wie `gesehen`), `nacht/dialog.js`, `nacht/handy.js`, `nacht/lehre.js`, `nacht/menue.js`, `nacht/mobil.js` (ein Menueknopf), `tools/nachttest.js`, `tools/pruefe.js`, `tools/flagcheck.js`.

---

## 1. STIMMEN (`erzaehl.js`)

Farbe und Piepton je Sprecher; macht die Crew unterscheidbar.

- `STIMMEN` - Objekt `{ 'MORITZ':{farbe:'#ffb34d',ton:262}, ... }` fuer: `MORITZ #ffb34d 262`, `JONAS #9be37a 330`, `DENNIS #4da6ff 196`, `SEMIH #c58bff 294`, `LEA #ff9ecb 392`, `MAX FERDI #42d9ff 349`, `TOBI #7fe0d0 311`, `MIA #ffd447 440`, `SOPHIE #ff8a3d 415`, `KIRA #b0b8ff 370`, `MARVIN #ff5a5a 175`, `MAMA #f2f0ff 330`. Alle anderen: Standardfarbe `#42d9ff`, Ton 247.
- `stimmeFarbe(wer)` -> Hexfarbe. `stimmePiep(wer)` -> kurzer Ton `piep(ton,.04,'square',.015)` (still, wenn `muted`). Beides trimmt `wer` und vergleicht grossgeschrieben (Gespraeche schreiben `'MAX FERDI'`, Karten `MAX FERDI:`).
- **Einbau:** in `nacht/dialog.js` (`zeichneGespraech`) die Namensfarbe `D_FARBE.name` durch `stimmeFarbe(k.wer)` ersetzen (mit `typeof`-Schutz). In `betrete()` beim Betreten eines Knotens einmal `stimmePiep(k.wer)`.

## 2. KARTE: Zwei-Zeilen-Text (`erzaehl.js`)

- `zeichneKarte(txt,y,col,s=1)` - zeichnet `txt` zentriert; `|` ist fester Zeilenumbruch, lange Zeilen ohne `|` brechen mit `umbrich(txt,W-24,s)`. Rueckgabe: Hoehe in Pixel. Zeilenabstand `6*s+2`.
- Level 8 und jede Cutscene, die `|` benutzt, rufen sie statt `textC` auf. (Der bestehende Cutscene-Zeichner in `level8.html` wird im Auftrag `auftrag-level8.md` umgestellt.)

## 3. KAPITELKARTE (`erzaehl.js`)

Zu Beginn jedes Levels: Uhrzeit, Ort, eine Zeile, darunter hoechstens zwei BISHER-Zeilen. 3,5 Sekunden; E/Tippen beendet nach 0,6 s.

- Daten (aus `texte.js`): `TEXTE_KAPITEL[n]={zeit:'22:00', ort:'DER NACHTBUS', zeile:'KEIN TICKET. EIN HUND.'}` und `TEXTE_BISHER=[{ab:3, g:9, wenn:{flag:'x'}, txt:'EIN UNBEKANNTER IM FLUR.'}, ...]` (jedes `txt` hoechstens **36** Zeichen, denn die erste Zeile bekommt das Praefix `BISHER: `; `nachttest` prueft das) (`wenn` ist eine Bedingung wie im Gespraechsbaum, `bedingungErfuellt`; `ab` = erste Levelnummer, in der die Zeile gelten darf; `g` = Gewicht).
- `kapitelZeigen(n)` - zeigt die Karte fuer Level n. Merkt sich in einer Modulvariable, dass sie in diesem Seitenaufruf schon lief; ein zweiter Aufruf (Wiederholungsversuch ohne Neuladen) tut nichts.
- BISHER-Auswahl: alle Eintraege mit `ab<=n`, `bedingungErfuellt(wenn)`, nach `g` absteigend, die ersten zwei. Praefix `BISHER: ` nur vor der ersten Zeile; Level 1 hat keine.
- Darstellung: schwarzer Grund `#08060f` mit Alpha .94 ueber dem Bild; Uhrzeit Schriftgroesse 3, mittig bei y=48, Farbe Gold `#ffd447`; Ort Groesse 2, y=76, weiss; Zeile Groesse 1, y=100, `#8d86a8`; BISHER-Zeilen Groesse 1, y=128 und y=138, `#4a4363`; unten klein `E / TIPPEN` bzw. am Handy `TIPPEN`. Einblenden und Ausblenden je 0,25 s (Alpha, kein Blitz).
- `kapitelAktiv()` -> bool.
- Handy: `mobilKontext` liefert `{aktion:'WEITER',zwei:null,block:false,extras:null}` (siehe Haken).

## 4. PLAUSCH (`erzaehl.js`)

Begleiter reden beim Gehen in einer Untertitelleiste. Pflichtinformation gehoert nie hierher (sie ist nicht garantiert).

- `wer:''` (leer) zeigt nur den Text ohne `WER: ` (fuer `*ES KLINGELT*`). Plausch laeuft auf dem Canvas: Text immer Grossbuchstaben ohne Umlaute, auch bei Figuren, die am Handy klein schreiben.
- Datenformat im Level: `const PLAUSCH_ZEILEN=[{ id:'l3a', wer:'MORITZ', text:'DER BUS RIECHT NACH DOENER.', nach:20, wenn:{crew:'MORITZ'}, ausloeser:null, prio:1 }, ...]`
  - `id` eindeutig im Level; `text` ohne Umlaute; `wer`+`: `+`text` insgesamt hoechstens 44 Zeichen (der Test prueft das).
  - `nach` Sekunden seit Levelstart (Standard 0); `wenn` Bedingung wie im Gespraechsbaum (Standard immer); `ausloeser` ein String, wenn die Zeile nur auf `PLAUSCH.ausloeser(id)` kommt; `prio` hoehere zuerst (Standard 0); jede Zeile spielt hoechstens einmal je Levelstart.
- API: `PLAUSCH.lade(zeilen)` (im `neuesSpiel()` aufrufen, setzt alles zurueck), `PLAUSCH.takt(dt,laeuft)` (`laeuft=false` heisst: nicht reden, z. B. im Kampf), `PLAUSCH.ausloeser(id)` (spielt passende Zeilen sofort, hoechstens zwei in der Warteschlange), `PLAUSCH.sag(wer,text)` (sofort, ohne Datenzeile), `PLAUSCH.zeichne()`.
- Takt: eine Ambient-Zeile (ohne `ausloeser`) alle `ERZAEHL.PLAUSCH_ABSTAND=14` s, nie waehrend Gespraech (`gespraechAktiv()`), Handy (`HANDY.offen`), Kapitelkarte oder Momentkarte. Die Uhr laeuft nur, wenn `laeuft` wahr ist.
- Darstellung: ein Balken, volle Breite, Hoehe 11 px, `#000000` mit Alpha .55; Text Groesse 1; `WER:` in `stimmeFarbe(wer)`, Rest `#f2f0ff`; zentriert. Position `PLAUSCH.y`, Standard unten `H-18`, am Handy (`IS_TOUCH`) oben `22` (Stick und Knopf liegen unten); jedes Level darf `PLAUSCH.y` setzen. Dauer `2.4 + 0.07*Laenge` s, Ein- und Ausblenden je 0,2 s. Beim Erscheinen `stimmePiep(wer)`.
- Handy-Fallback fuer verpasste SMS: `handy.js` bekommt im Drehbuch das Feld `vorlesen:{wer,text}`; ist `handyDa()` falsch, ruft `handyZustellen()` beim Einreihen `PLAUSCH.sag(vorlesen.wer,vorlesen.text)` auf (nur wenn `typeof PLAUSCH`). Eintraege: siehe `flags-vertrag.md` Abschnitt 5 und `auftrag-karte.md`.
- Fallgruben: nicht in `S.t` rechnen (eigene Uhr); `PLAUSCH.lade` beim Wiederholen neu aufrufen; mit `S.modus==='pause'` nicht ticken.

## 5. MOMENTE / POLAROIDS (`erzaehl.js`)

- Daten (aus `texte.js`): `TEXTE_MOMENTE[n]={titel:'DER FLUR', l1:'DER FLUR, ALLE SPINDE OFFEN.', l2:'JEMAND HAT ES FESTGEHALTEN.'}`, n = 1 bis 8.
- API: `MOMENT.fund(n)` -> true, wenn neu (setzt Flag `moment`+n und traegt n in `NACHT.momenteBest` ein, zeigt Karte, zwei Toene `piep(880,.06,'sine',.04)` und `piep(1175,.08,'sine',.04)`); `MOMENT.hat(n)`; `MOMENT.anzahl()`; `MOMENT.zeichneFund(x,y,n)` (zeichnet den Fund, nichts wenn schon gefunden; Groesse 9x8, weisser Rahmen, dunkle Mitte, eine Ecke blinkt mit 1 Hz ueber `FX.hz(1)`).
- Karte: Polaroid-Optik, 132x74 px, zentriert; oben `MOMENT n VON 8` (klein, Gold), Bildflaeche 112x38 (`#1d1830` mit Verlauf), darunter `l1` und `l2` Groesse 1, `#08060f` auf `#f2f0ff`. 3,0 s, Tippen/E ab 0,8 s beendet. Blockiert das Spiel (siehe Haken).
- Das Level legt die Stelle und die Naehe-Pruefung selbst an (Fund = hinlaufen und E/Aktion, wie die Zettel in Level 1) und ruft im Aktionshandler `MOMENT.fund(n)`.
- `flagcheck`: Praefix `moment` ist Allowlist.

## 6. Die drei Haken (jedes Level ruft sie)

```js
// neuesSpiel():       PLAUSCH.lade(PLAUSCH_ZEILEN); kapitelZeigen(N);
// update(dt), erste Zeile:   if(erzaehlTakt(dt)) return;
// draw(), letzte Zeile:      erzaehlZeichne();
// Aktionstaste/Tippen, erste Zeile: if(erzaehlTaste()) return;
// mobilKontext():   const k=erzaehlKontext(); if(k) return k;
```
- `erzaehlTakt(dt)` - zaehlt Kapitelkarte und Momentkarte, ruft `PLAUSCH.takt`; liefert **true**, solange eine Karte aktiv ist (Level soll dann nichts rechnen).
- `erzaehlZeichne()` - zeichnet Kapitelkarte, Momentkarte, PLAUSCH, in dieser Reihenfolge ganz oben ueber das Bild (vor `#crt`).
- `erzaehlTaste()` - true, wenn eine Karte die Taste verbraucht hat.
- `erzaehlKontext()` - `{aktion:'WEITER',zwei:null,block:false,extras:null}` oder `null`.
- Fallgrube Lehre: `lehre.js` startet Lektionen am Anfang des Intros. In `lehre.js` den Start um `if(typeof kapitelAktiv==='function'&&kapitelAktiv()) return;` verzoegern, sonst erscheinen Karte und Lektion uebereinander.
- Fallgrube Zeit: `erzaehlTakt` benutzt die Echtzeit-`dt`, aber das Level darf auf `S.t` nichts schreiben.

## 7. EPILOG, GRUPPENCHAT, NIEWIEDER, KATER, WOLLE (`epilog.js`)

Alle Funktionen kennen das Level nicht; `level8.html` uebergibt `p={weg:'heim|weiter|sonne', kampf:'gewonnen|verloren|frieden', anfuehrer:'MARVIN'|'DER ANFUEHRER'}`.

Datenformat: `EPILOG={ 'MORITZ':{crew:false, zeilen:[{wenn:()=>flag('moritzGeheimnis'),txt:'...|...'}, ...]}, ... }` - **die erste zutreffende Zeile gilt**, `crew:true` heisst "nur wenn in `ladeCrew()`". Die Texte stehen **vollstaendig** in `STORY-BIBEL.md` Kapitel 7 "Epilog-Texte" und "Gruppenchat-Texte" und werden dort abgeschrieben. Diese Tabelle ist der Austausch-Ort fuer die echten Plaene der echten Freunde.

- `epilogFolien()` -> Array `{d:2.6, txt:'ZEILE1|ZEILE2'}` fuer die Crew in der Reihenfolge `MORITZ, JONAS, DENNIS, SEMIH, LEA, MAX FERDI, TOBI` (nur Crew-Figuren, ausser Moritz immer), maximal 7 Karten.
- `abspannMitte(p)` -> Karten: Marvin-Folie (wenn `marvinKennt`), `epilogFolien()`, Gruppenchat (Kopf `GRUPPE: NACHTSCHICHT (n)` als eine Karte, dann bis zu sechs Zeilen je Karte zu zweit), Album `ALBUM: n VON 8` (+ `SEITE 9 ...`-Zeile ab fuenf Momenten, nur wenn Lea in der Crew), bei `schluesselVersprochen` zuletzt die Karte `DER SCHLUESSEL LIEGT IM BRIEFKASTEN.|ROTE WOLLE DRAN.`
- `abspannSchluss(p)` -> Karten: `WAS WIR NIE WIEDER ERWAEHNEN:` mit bis zu vier Punkten (`NIEWIEDER`-Tabelle, Bibel Kap. 7 Abspann Punkt 7), Kater (`katerStufe()`), Wolle als Karte `{d:4.0, txt:'', art:'wolle', knoten:n, stempel:'ROTER FADEN 2 VON 3'}`. Die Karten nach der Wolle (`ENDE: ...`, `ENDEN GESEHEN`) schreibt weiterhin `level8.html`.
- `knoten()` -> 0 bis 3 (siehe `flags-vertrag.md` Abschnitt 7). `stempel(n)` -> `BIS GLEICH`, `ROTER FADEN 1 VON 3`, `ROTER FADEN 2 VON 3`, `SCHICHTWECHSEL`. Bei 0 zusaetzlich die Karte `ALLE HABEN BIS GLEICH GESAGT.|KEINER TSCHUESS.` (nur wenn `bisGleichAmEnde`).
- `katerStufe()` aus `wert('pegel')`: `< 25` LEICHT, `< 60` MITTEL, sonst ARCHE NOAH; Text `DEIN KATER AM SAMSTAG: <STUFE>.`
- `zeichneWolle(knoten,y,t)` - eine rote Linie (`#ff3d3d`, 2 px) quer ueber die Breite bei y, drei Knoten bei 25 %, 50 %, 75 % der Breite: gefuellt (`#ff3d3d`, 6 px) oder leer (Umriss). Kein Blinken; bei `knoten==3` leuchtet ein ruhiger Goldrand (`FX.blitz` nicht noetig, keine Bewegung). `level8.html` ruft sie auf, wenn `z.art==='wolle'`.
- **Enden-Verwaltung:** `ENDEN_ALLE=[{id,titel}]` (zehn Eintraege, Tabelle in `STORY-BIBEL.md` Kap. 7); `endeRegistrieren(titel)` setzt `NACHT.gesehen.push(titel)` (wenn neu), bei `knoten()==3` zusaetzlich `'SCHICHTWECHSEL'`, und merkt in `NACHT.knotenBest[titel]` das Maximum der Knoten. `STAND_VORLAGE` in `nacht.js` bekommt `knotenBest:{}` und `momenteBest:[]` (und `ladeStand` fuellt auf), `nachtZuruecksetzen` bewahrt beides wie `gesehen`. `level8.html` ruft statt des direkten `push` (Zeile ~515) `endeRegistrieren` auf.

## 8. ENDEN-GALERIE und Momente-Sammlung (`menue.js`, bisher leere Huelle)

- `MENUE.galerie()` oeffnet ein HTML-Overlay (Umlaute erlaubt; Stil wie `#hfenster` in `handy.js`, Schliessen mit Esc oder ZURUECK-Knopf). Inhalt: Ueberschrift `ENDEN`, zehn Zeilen aus `ENDEN_ALLE` (gesehen: Titel und `n VON 3 KNOTEN`; nicht gesehen: `???`), darunter `MOMENTE: n VON 8` mit den acht Polaroid-Zeilen (nur gefundene, sonst `???`). Quellen: `NACHT.gesehen`, `NACHT.knotenBest`, `NACHT.momenteBest` (nicht die Flags: die werden beim Neuanfang der Nacht geloescht), `TEXTE_MOMENTE`.
- Aufruf: im Handy-Menue (`mobil.js` `zeigeBlatt('menue')`) ein Knopf `ENDEN`; auf dem Titelbild (`index.html`) die Taste `G` (Hinweis im Auftrag `auftrag-index.md`). Der Abspann ist nicht wiederholbar; nach ihm bleibt der bestehende Endbildschirm von `level8.html` (E = ganzes Spiel neu, Leertaste = nur Level 8).

## 9. Kleine Aenderungen im Bestand

- `handy.js`: Drehbuch laut `flags-vertrag.md` Abschnitt 5 (`marvin1` raus, `unbekannt1/2`, `lea1`, `mama4` rein, `mama2 ab:6`, `mia1` Text). **Der Karte-Agent schreibt den Text, der Engine-Agent nur das Feld `vorlesen` und den Aufruf.**
- `tools/pruefe.js` und `tools/nachttest.js`: die drei neuen Scripts in die Ladeliste (nach `handy.js`). `nachttest` bekommt zwei Pruefungen: (a) jede Zeile in `PLAUSCH_ZEILEN` des Levels hat `wer: text` <= 44 Zeichen und nur Zeichen der Schrift; (b) `TEXTE_KAPITEL`, `TEXTE_MOMENTE`, `EPILOG`-Texte: jede durch `|` getrennte Zeile <= 44 Zeichen.
- `tools/flagcheck.js`: Allowlist fuer die dynamischen Praefixe `moment` und `tschuess_`.
- `tools/version.py` laufen lassen.

## Fertig-wenn

1. `node tools/pruefe.js`, `node test/kampf.test.js`, `node tools/nachttest.js`, `node tools/flagcheck.js` sind gruen (die sieben "verloren" aus dem Ist-Stand duerfen bleiben, bis die Level-Auftraege sie lesen).
2. Ein Testlevel (z. B. `level7.html`, Haken testweise eingebaut) zeigt Kapitelkarte, eine Plauschzeile und ein Polaroid; im Browser geprueft: Handy-Breite (375 px), Karte lesbar, Tippen ueberspringt.
3. `baueEnde`-Stubs: `abspannMitte`/`abspannSchluss` liefern bei leerem Speicherstand ohne Ausnahme Karten zurueck (Test in `nachttest`).
4. Keine Seite ausser den neun genannten ist veraendert; keine Spieldatei ausser den Tag-Zeilen.
