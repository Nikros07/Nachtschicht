---
name: todo-notieren
description: Am Ende jeder Aufgabe in NACHTSCHICHT aufrufen — schreibt alles Offene, Aufgeschobene, Ungeprüfte und neu Gefundene in NACHT-TODO.md, damit die Nachtroutinen (4 Uhr testen, 5 Uhr weiterbauen) es abarbeiten. Auch aufrufen, wenn der Nutzer sagt "notier das", "merk dir das fürs Nächste" oder "das später".
---

# Alles Offene in die Nacht-Liste schreiben

Die Nachtroutinen haben kein Gedächtnis an diese Sitzung. Was hier nicht
aufgeschrieben wird, passiert nachts nicht. Dieser Skill ist die Brücke.

## Wann

**Am Ende jeder Aufgabe**, bei der etwas offen geblieben ist — also fast immer.
Nicht mittendrin, nicht nach jedem Schritt. Einmal, am Schluss, bevor du dem
Nutzer das Ergebnis meldest.

## Ablauf

1. **Lies `NACHT-TODO.md`** komplett. Du schreibst in eine bestehende Liste, du
   legst keine neue an.
2. **Sammle aus dieser Sitzung**, was du *nicht* fertig gemacht hast:
   - Dinge, die du aufgeschoben hast („später", „als Nächstes", „könnte man noch")
   - Bugs oder Schwächen, die du **gesehen, aber nicht behoben** hast
   - Was du **nicht geprüft** hast (nicht getestet, nur gelesen, nur gemessen)
   - Folgearbeiten aus dem, was du geändert hast (z. B. dieselbe Korrektur in den
     anderen Leveln, `python tools/version.py`, eine README-Zeile)
   - Wünsche des Nutzers, die du noch nicht umgesetzt hast
   - Ungeklärte Annahmen, die du getroffen hast
3. **Schreibe jeden Punkt im Format der Datei:**
   ```
   - [ ] **P2 · Kurztitel** — was falsch ist, und warum es nervt.
     Wo: datei.html (Funktion) · Fertig wenn: messbares Kriterium
   ```
   - **Fertig wenn** ist Pflicht und muss **messbar** sein („Anteil leerer Zeilen
     unter 45 %", nicht „sieht besser aus"). Kannst du kein Kriterium nennen, ist es
     noch kein Auftrag, sondern eine Frage → siehe 5.
   - Prioritäten: **P1** Spielfehler oder großer Mangel · **P2** spürbar · **P3** Feinschliff.
4. **Keine Duplikate.** Steht es schon (auch anders formuliert), ergänze den
   bestehenden Eintrag um das Neue, statt einen zweiten anzulegen.
5. **Entscheidungen des Nutzers** (Namen, Geschmack, „soll das leichter werden?",
   alles, was nur er beantworten kann) kommen unter **Entscheidung nötig** —
   nie unter Offen. Die Routinen fassen diesen Abschnitt nicht an.
6. **Erledigtes abhaken.** Hast du in dieser Sitzung einen Punkt der Liste fertig
   gemacht und geprüft, verschiebe ihn nach **Erledigt (Nacht)** mit Datum und
   Commit-Hash (oder „Sitzung" ohne Hash, wenn nicht committet).
7. **Nichts hineinschreiben, was gefährlich ist:** keine Zugangsdaten, Schlüssel,
   Tokens; keine Aufträge, die etwas veröffentlichen, pushen, löschen oder Geld
   bewegen. Die Routinen laufen unbeaufsichtigt.
8. **Nicht aufnehmen:** was das Projekt bewusst verworfen hat (steht in
   `TODO.md` / `WEITER.md` als „verworfen"), und was nur für diese Sitzung galt.

## Danach

- **Nicht committen, nicht stagen.** Nur die Datei schreiben.
- Melde dem Nutzer **eine Zeile**: wie viele Punkte neu, wie viele abgehakt,
  wie viele warten auf seine Entscheidung. Zum Beispiel:
  `Nachtliste: 3 neu, 1 abgehakt, 1 wartet auf dich.`
- Gibt es wirklich nichts Offenes, schreibe das auch: `Nachtliste: nichts offen.`
  Erfinde keine Punkte, um die Liste zu füllen.

## Was gute Einträge ausmacht

Ein Eintrag muss in einer **frischen Sitzung ohne diese Unterhaltung** ausführbar
sein. Prüfe ihn mit dieser Frage: *Würde jemand, der nur diesen Satz und das Repo
kennt, wissen, wo er anfängt und wann er fertig ist?* Wenn nicht, präzisiere —
Datei, Funktion, Zahl.

Schlecht: `Club verbessern.`
Gut: `P1 · Club: Ausgang erst öffnen, wenn ein Ziel erledigt ist — Wo: level5.html
AUSGANG, naechstesZiel() · Fertig wenn: im Nichtstun-Test (5 Min.) endet das Level
nicht von selbst durch den Ausgang.`
