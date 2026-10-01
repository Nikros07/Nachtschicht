# NACHT-TODO — die Liste für die Nachtroutinen

Diese Datei ist die **Warteschlange**. Alles, was beim Arbeiten offen bleibt,
steht hier — und die Routinen holen es nachts ab:

Eine Routine, nachts, **in der Cloud** (claude.ai → Routinen). Sie testet zuerst alles,
schreibt `NACHT-BERICHT.md`, trägt Funde hier ein und arbeitet danach diese Liste von oben
ab — jeden Punkt gemessen, getestet, einzeln committet. Der Ablauf steht in
`routinen/nacht.md`. Sie arbeitet auf dem Branch **`claude/nacht`**; nach `main` pusht sie
nie — die Live-Seite bleibt, wie sie ist.

Morgens: `NACHT-LOG.md` lesen (was passiert ist), den Branch ansehen
(`git log main..origin/claude/nacht`) und, wenn es passt, nach `main` mergen.

## Wie ein Eintrag aussieht

```
- [ ] **P1 · Kurztitel** — was falsch ist oder fehlt, und warum es nervt.
  Wo: level5.html (Funktion/Zeile) · Fertig wenn: woran man es messen kann
```

- **P1** = Spielfehler oder großer Mangel · **P2** = spürbar · **P3** = Feinschliff
- „Fertig wenn" ist Pflicht: ohne messbares Ende wird nichts abgehakt.
- Eine Entscheidung, die nur der Spieler-/Auftraggeber treffen kann, kommt
  unter **Entscheidung nötig**, nicht unter Offen. Die Routinen fassen die nicht an.

---

## Offen

### P1

- [ ] **P1 · Nachttest: Software-Canvas für Pixelmessung** — `tools/nachttest.js` läuft
  ohne Browser mit Attrappen und kann deshalb keine Pixel messen. Mehrere Punkte hier
  verlangen genau das (leere Bildzeilen, „Obere Bildhälfte füllen"). Ein kleiner
  Software-Canvas (Pixelpuffer; `fillRect`, `drawImage` von Sprite-Canvases mit
  `translate`/`scale(-1,1)`/`globalAlpha`; Farben als `#rgb`/`#rrggbb`/`#rrggbbaa`/`rgba()`)
  würde das ermöglichen — und ein PNG je Level zum Ansehen.
  Wo: tools/nachttest.js (`leinwand()`) · Fertig wenn: `node tools/nachttest.js` meldet
  je Level „leere Bildzeilen: NN %" und liegt in der Nähe der Browser-Referenz (Wohnung
  66, Club 73, Afterhour 72, Späti 77, Heimweg 77 — Abweichung höchstens 8 Punkte).
  *Solange das fehlt: Punkte, deren „Fertig wenn" eine Pixelmessung verlangt,
  überspringen und als „braucht Software-Canvas" vermerken.*

- [ ] **P1 · Bus: Die Ablenkung zieht alle fünf Kontrolleure auf den Spieler zu** —
  die Szene des Betrunkenen blendet nicht, sie ruft. Das Werkzeug tut das Gegenteil
  von dem, wofür es da ist.
  Wo: level3.html (Ablenkung / `laerm`-artige Szene, Notbremse) · Fertig wenn: nach
  der Ablenkung laufen die Kontrolleure vom Spieler weg, gemessen im Lauf.
- [ ] **P1 · Club zum Ort machen: vier von sechs Bereichen sind leer** — Eingang,
  Raucherecke, Klos, Hinterausgang enthalten nichts. Nichtstun-Test: nach 107 s ist
  der Inhalt aufgebraucht, die Uhr läuft 600 s. Der Ausgang ist ab Sekunde 0 offen.
  Wo: level5.html (`ORTE`, `AUSGANG`, `marvinTakt`) · Fertig wenn: jeder Bereich hat
  etwas zu tun oder zu sehen; der Ausgang öffnet erst mit einem Grund; im
  Nichtstun-Test passiert über 5 Minuten mehr als viermal etwas.
- [ ] **P1 · Obere Bildhälfte füllen** — 66–77 % der Bildzeilen sind in Level 2, 5, 6,
  7, 8 ohne Inhalt (gemessen als harte Kanten pro Zeile). Decke, Licht, Lautsprecher,
  Galerie, Himmel fehlen. Erst im Club als Vorlage, dann übertragen.
  Wo: `zeichneClub()` und die Zeichenfunktionen der anderen Level · Fertig wenn:
  Anteil leerer Zeilen im Club unter 45 %, ohne dass es unruhig wirkt.
- [ ] **P1 · Level 2: Die Wahl „wen nimmst du mit" kommt nach dem Kampf** — sie kostet
  nichts und erspart nichts. Dazu: DER SCHLÄFER und DER TELEFONIERER sind keine Personen.
  Wo: level2.html (`MITNEHMEN`, `fuehreCrewZusammen`) · Fertig wenn: die Wahl liegt am
  Anfang, die Aufgabenliste hängt davon ab, beide haben Namen und je drei Sätze.

### P2

- [ ] **P2 · Level 4: jede Phase soll die vorige Antwort entwerten** — bisher ändern
  die Phasen nur Zahlen; nach dem zweiten Konter ist alles gesehen.
  Wo: level4.html (`bossPhase`, `naechsteArt`) · Fertig wenn: Phase 2 und 3 verlangen
  je eine andere Antwort als Phase 1.
- [ ] **P2 · Level 4: Jab und Schwung unterscheidbar machen** — eigene Haltung je Angriff.
  Wo: level4.html (`SPR`, Zeichnen des Bosses) · Fertig wenn: beide Muster sehen im
  Ausholen verschieden aus.
- [ ] **P2 · Pegel verengt das Konterfenster unsichtbar (bis −40 %)** — der Balken zeigt
  das Fenster in voller Breite, das echte ist kleiner. Das ist die unfaire Art von schwer.
  Wo: level4.html (`fensterAnteil`, `pegelFaktor`), `nacht/hud.js` · Fertig wenn: der
  goldene Streifen im Balken ist so breit wie das echte Fenster.
- [ ] **P2 · Phase-3-Jab auf HART mit Pegel liegt unter der Reaktionszeit** —
  Wo: level4.html / `KAMPF`-Werte · Fertig wenn: kleinste Vorwarnzeit ≥ 0,28 s auf
  jeder Schwierigkeit, gemessen.
- [ ] **P2 · Bus: blinkendes E über den Verstecken erscheint nie** — das Hauptwerkzeug
  des Levels findet man nur zufällig. Wo: level3.html (`naheVersteck`, Zeichnen) ·
  Fertig wenn: das E erscheint in Reichweite eines Verstecks.
- [ ] **P2 · Bus: Ein gekaufter Fahrschein schaltet den Bus für alle späteren Durchläufe ab** —
  Wo: level3.html (`starteBus`, Flag-Reset, `S.ticket`) · Fertig wenn: nach Neustart
  des Levels gilt kein alter Fahrschein mehr.
- [ ] **P2 · Bus: Fahrschein rettet eine Kontrolle statt das ganze Level** — sonst ist
  der Bus „gratis sicher oder sicher verloren". Wo: level3.html · Fertig wenn: mit
  Fahrschein kostet die erste Kontrolle kein Leben, die zweite schon.
- [ ] **P2 · Club: Die drei Frauen kennen sich** — Der Kommentar im Code verspricht,
  dass sich eine Abfuhr herumspricht. `S.abfuhren` gibt es schon.
  Wo: level5.html (`gespraechEnde`, die drei Bäume) · Fertig wenn: nach einer Abfuhr
  erwähnt mindestens eine andere Figur sie, gemessen per Baum-Durchlauf.
- [ ] **P2 · Club: Sophie hat keine Pegel-Bedingung, Lena ist nicht ansprechbar** —
  Wo: level5.html (`SOPHIE_BAUM`, `LENA`) · Fertig wenn: Sophie reagiert auf Pegel,
  Lena hat ein kurzes Gespräch.
- [ ] **P2 · Level 2: kein `mobilKontext()`** — am Handy heißt jeder Knopf „AKTION".
  Wo: level2.html, Muster aus index.html · Fertig wenn: Knopfaufschriften je Modus.
- [ ] **P2 · Level 2: Springen/Hoch/Runter werden beigebracht und tun nichts** —
  Wo: level2.html (Titelbild, Eingaben) · Fertig wenn: nur noch Eingaben, die etwas tun.
- [ ] **P2 · Analyse nachholen: Level 1, 6, 7, 8, Karte, Runner, Engine, Dramaturgie** —
  neun Prüfer sind am Nutzungslimit gescheitert, siehe PLAYTEST.md ganz unten.
  Fertig wenn: je Bereich Bugs, Schwachstellen und Ideen in PLAYTEST.md ergänzt.
- [ ] **P2 · Level 1: Titelbild ist eine Bedienungsanleitung** — sieben Tastenzeilen,
  zwei davon laufen ineinander. Wo: index.html `titelbild()` · Fertig wenn: höchstens
  vier Zeilen, nichts überlappt.
- [ ] **P2 · Zwei Handys auf zwei Tasten** — `H` stumm (Level 1), `T` Engine-Handy.
  Wo: index.html, nacht/handy.js · Fertig wenn: eine Taste, ein Handy.

### P3

- [ ] **P3 · Level 4: Wer nichts tut, wird in 300 s nie getroffen — zu prüfen** —
  `nachttest.js` meldet im Nichtstun-Lauf von Level 4 null Ereignisse. Möglich, dass der
  Boss einen untätigen Spieler nie trifft (Kampf ohne Zeitdruck), möglich auch, dass er es
  tut und nur nichts gemeldet wird. Erst messen: `S.hp` vor und nach 300 s Nichtstun.
  Wo: level4.html (`bossTakt`, `kampf`) · Fertig wenn: der Befund steht hier, und ein
  untätiger Spieler verliert entweder, oder es ist als gewollt vermerkt.
- [ ] **P3 · `tools/level5_baeume.js` löschen** — wortgleiche Zweitkopie der Bäume, wird nur
  von einem alten Umbau-Skript gelesen. Wo: tools/ · Fertig wenn: Datei weg, `pruefe.js` grün.
- [ ] **P3 · Bahn oder Bus?** — Intro sagt Bahn, das Schild sagt BUS. Wo: level3.html ·
  Fertig wenn: ein Wort überall.
- [ ] **P3 · README: Handy-Steuerung beschreibt den alten Stand** — „Steuerkreuz links,
  Aktionstasten rechts" gibt es nicht mehr. Wo: README.md · Fertig wenn: beschreibt
  Stick, Info-Tafel und MENÜ-Knopf.
- [ ] **P3 · `TODO.md` ist veraltet** (Stand 17.9., „Level 3–8 Grundversionen") —
  Wo: TODO.md · Fertig wenn: stimmt mit dem Stand überein oder verweist hierher.

---

## Entscheidung nötig (die Routinen lassen das liegen)

- [ ] **Echte Namen und Gesichter der Freunde** — Platzhalter sind Jonas, Dennis, Semih,
  Lea, Max Ferdi, Moritz, Tobi. Braucht Eingabe von Nick.
- [ ] **Finale in Level 8 entschärfen?** — gemessen sehr knapp; ein reiner Counter-Bot
  bringt den Anführer auf 1 HP, bevor er fällt. Soll es leichter werden?
- [ ] **`runner.html` irgendwo verlinken?** — ist von nirgends erreichbar.

---

## Erledigt (Nacht)

*(Die 5-Uhr-Routine trägt hier ein: Datum · Titel · Commit-Hash)*

## Blockiert

*(Was die Routine zweimal versucht hat und zurückgerollt hat — mit Grund.)*
