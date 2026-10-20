# Entwurf B: Mechanik-Vielfalt und Tempo

Stand: 2026-10-11, in Arbeit (zweiter Anlauf; der erste brach nach dem Geruest ab). Rein
analysierender Lauf: keine Spieldatei geaendert, nur dieser Bericht und Messskripte unter
`docs/gameplay/messung/eb-*.js` (Start aus der Projektwurzel mit `node`).

Leitfrage: **Was TUT man in jedem Level, und wie oft wechselt das Tempo?**

Grundlage: `recherche-vorbilder.md` (Muster M1 bis M32), `recherche-spielgefuehl.md` (Saft, Musik),
`recherche-store.md` (Store-Pflichten), `messung-a.md` (L1 bis L3), `messung-b.md` (L4 bis L6),
`messung-c.md` (L7, L8, Karte, Runner), `docs/launch/STORY-BIBEL.md` (verbindlich, wird nicht
umgeschrieben). Wo dieser Entwurf eine Zahl nennt, steht dabei, ob sie aus einem der Berichte
stammt (Quelle in Klammern) oder in diesem Lauf gemessen wurde (Skript in Klammern).

## Inhalt

1. Leitidee in fuenf Saetzen
2. Ausgangslage: was man heute tut (verdichtet aus den Messungen)
3. Eigene Messungen dieses Laufs
4. Die Regeln des Entwurfs (gelten fuer jedes Level)
5. Die Engine-Pakete (vor den Leveln)
6. Die Level-Pakete (je eine Datei, je ein Agent)
7. Karte und Partymodus
8. Pruefstand: wie alles headless gemessen wird
9. Reihenfolge, Abhaengigkeiten, Risiken

---

## 1. Leitidee

(folgt, wird am Ende geschrieben)

---

## 2. Ausgangslage: was man heute tut

Verdichtet aus `messung-a.md`, `messung-b.md`, `messung-c.md` (dort mit Skript und Zeile belegt).
"Wirksame Verben" = Eingaben, die gemessen etwas veraendern; "Zuschauen" = Karte, Intro, Text ohne
Wahl, Cutscene, Abspann; "Leere" = laengste Strecke ohne Herausforderung und ohne Entscheidung.

| Level | Spielzeit Erstspieler | Zuschauen | wirksame Verben (gemessen) | tote Verben | laengste Leere | harter Fehlschlag | Neustart kostet |
|:--|--:|--:|:--|:--|--:|:--|--:|
| 1 Schule | 19-53 s Spiel + 67 s passiv | ~70 % (Hausmeister-Art) | laufen, E-durchsuchen (66 % leer) | Lampe, Werfen (meist) | 22-122 s ab Start | 3 Herzen, Uhr (1/56) | Titel + 18 s Intro |
| 2 Moritz | 29-97 s + 45 s passiv | 42 % Reden der freien Zeit | laufen, E (48 % "Text weiter") | Springen, Tiefe | 36-67 s | nur Tuerkampf (20 % K.o.) | 50-120 s bis zum Kampf |
| 3 Bus | 70-150 s | ~25 s passiv | springen, verstecken, Text | E im Sprint (falscher Hinweis) | 8-14 s | Bus (3 Kontrollen) | Intro + Sprint erneut |
| 4 Schlange | ~70 s, davon 12-15 s Kampf | 77-84 % | E im Fenster, Rolle | Blocken | 26-33 s | 3 Herzen | 19-31 s Schlange + Dennis |
| 5 Club | ~180 s, davon 12 s Laufen | 54 % | laufen, waehlen | W/S, Tanz = 1 s | 24,6 s; 159 s ohne Herausforderung | Blackout ohne Warnung | Titel, alles neu |
| 6 Afterhour | 73 s, davon 18 s Laufen | 69 % | laufen, E | Springen, W/S | 40 s; ganzes Level ohne Herausforderung | keiner | - |
| 7 Spaeti | 30-178 s | 80 % Text | laufen, E, waehlen | Springen | 21,7 s | Softlock (pleite) | Seite neu laden |
| 8 Heimweg | ~225 s, davon 55 s Haende | 68 % | D halten + 11x Sprung, E im Kampf | Wurf nie, Blocken | 93 s (Finale+Abspann) | Sonne | 15 s + Kampf neu gewuerfelt |

**Kernbefund fuer diesen Entwurf:** NACHTSCHICHT hat genug Inhalt, aber zu wenig *Tun*. Ueber die
ganze Nacht tragen **zwei Handlungen** fast alles: "laufen" und "E an einem Ziel". Level 1 lehrt
sieben Verben, danach kommen nur Kampfverben dazu (`recherche-vorbilder.md` Abschnitt 1). Vier
Level (2, 5, 6, 7) spielen sich laut Lektion mit "Laufen + E". Gebaute Druckmittel greifen nicht
(Uhr L1/L2/L5, Marvin 0 von 24 Laeufen, Erschoepfung L6 nie unter 57, Pegel L4 ohne Folge), und
Tempo-Wechsel gibt es praktisch nur in Level 3 (Sprint -> Schleichen -> Kloppe) und Level 8
(Kampf -> Wettlauf). Ein Celeste-artiges "jedes Kapitel ein eigenes Element" fehlt ab Level 2.

---

## 3. Eigene Messungen dieses Laufs

### 3.1 Andockstellen und Platzbudget (`node docs/gameplay/messung/eb-andock.js`)

Was ein Level-Agent wissen muss, bevor er in EINER Datei ein neues Kernelement einbaut:

| Seite | Zeilen gesamt / Level-Skript | TUNE-Schluessel | Spielmodi heute | Haken vorhanden | Welt (px) / Durchqueren | kampf.js |
|:--|:--|--:|:--|:--|:--|:--|
| index.html (L1) | 2260 / 2177 | 63 | spiel, raum, gefangen | alle | 760 je Etage / 7,3 s | nein |
| level2.html | 1249 / 1189 | 33 | spiel, kampf | alle | 980 / 9,4 s | nein |
| level3.html | 1654 / 1593 | 68 | sprint, spiel, kloppe | alle | Sprint + Bus | ja |
| level4.html | 937 / 876 | 29 | schlange, kampf | ohne druckSprung | Arena | ja |
| level5.html | 1878 / 1817 | 61 | spiel, mini, ecke, kloppe | ohne druckSprung | 1400 / 14 s | ja |
| level6.html | 1093 / 1033 | 35 | spiel | alle | 1600 / 16,7 s | nein |
| level7.html | 1100 / 1040 | 30 | spiel | alle | 900 / 10 s | nein |
| level8.html | 1858 / 1797 | 41 | spiel, finale, reden, kampf | alle | 5200 / 52 s | ja |
| karte.html | 316 / 258 | 0 | umweg, wahl | nur Aktion, mobilKontext | - | nein |

Folgerungen:

- **Jedes Level hat `erzaehlTakt(dt)` als erste Zeile in `update()`** (Level 6 und 8 nach einer
  PLAUSCH-Zeile). Direkt danach dockt ein Engine-Takt an (`if(MIKRO.takt(dt)) return;`), genau wie
  die Kapitelkarte das Level anhaelt. Das ist der Grund, warum Mikrospiele als Engine-Paket und nicht
  je Level gebaut werden.
- **Platz:** Level 4 (937 Zeilen) und Level 6/7 (~1100) haben Luft fuer 400-600 neue Zeilen; Level 1
  (2260) und Level 5/8 (~1860) sind an der Grenze dessen, was ein Agent in einem Durchgang sicher
  ueberblickt. Fuer diese drei gilt: **erst streichen, dann bauen** (je Level-Paket unten steht, was
  raus kann).
- **Neue Engine-Dateien muessen kleingeschrieben heissen** (`mikro.js`, `hatz.js`), sonst laedt
  `tools/nachttest.js` sie nicht (Regex `nacht/([a-z]+).js`).
- **Handy-Knoepfe:** nur Level 1 belegt `extras` (Pfeile, Q, R). Alle anderen Level haben die
  Bogenknoepfe frei - Platz fuer je ein bis zwei neue Verben.

### 3.2 Leere Strecken im Raum (`node docs/gameplay/messung/eb-leere-strecken.js`)

Groesster Abstand zwischen zwei "Punkten" (Stelle mit E-Ziel, Gefahr oder Hindernis) bei Gehtempo.
Faustregel dieses Entwurfs: hoechstens **4 s Gehen ohne Punkt** auf dem Pflichtweg.

| Bereich | groesste Luecke | Sekunden | Anteil > 4 s |
|:--|:--|--:|--:|
| L1 Etagen 0-2 | 90-100 px | ~1 s | 0 % |
| L2 Wohnung | 150 px (Tuer bis erstes Ding) | 1,4 s | 0 % |
| L3 Bus / Sprint | 150 / 140 px (Sprint gleichmaessig) | 1,4 / 1,2 s | 0 % |
| L5 Club ohne Tanzende | 344 px (Tanzflaeche) | 3,4 s | 0 % |
| **L6 nur Pflichtpunkte** | **530 px (430-960)** | **5,5 s** | **62 %** |
| L7 ohne Pfand | 210 px | 2,3 s | 0 % |
| **L8 nur Hindernisse** | **550 px (Start)** | **4,8 s** | **20 %** |

**Befund:** Leere ist in NACHTSCHICHT selten ein *Raum*-Problem (nur L6 und der Start von L8),
sondern ein *Zeit*-Problem: die Welt ist dicht mit Dingen, aber die Dinge verlangen nichts
(E druecken, lesen, weiter). Folge fuer den Entwurf: **nicht mehr Dinge hinlegen, sondern die
vorhandenen Dinge zu Handlungen machen** (Mikrospiel statt Balken, Gefahr statt Kulisse).
