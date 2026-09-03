# Pruefungen

**Das Spiel braucht das hier nicht.** `index.html` bleibt ein Doppelklick ohne
Installation, ohne Abhängigkeiten, ohne Bauschritt. Der Ordner hier ist nur für
den, der etwas ändert und wissen will, ob noch alles läuft.

```bash
cd pruefung
npm install            # holt Playwright
npx playwright install chromium
node alle.js           # alle Prüfungen
node alle.js kampf     # nur eine
```

Ist bereits ein Chromium da, sagt `NACHTSCHICHT_CHROME=/pfad/zum/chrome` wo.

---

## Wie es funktioniert

Das Spiel wird in einem echten Browser geöffnet — einmal über einen kleinen
Server (so läuft es auf GitHub Pages) und einmal über `file://` (so läuft es
beim Doppelklick).

Dann wird **die Bildschleife stillgelegt** und `update()` von Hand mit festem
`dt` aufgerufen. Ohne das hängt jede Prüfung an der Wanduhr: ein Kampf, der 30
Sekunden dauert, würde auch 30 Sekunden zum Prüfen brauchen. So dauert er
Millisekunden, und dieselbe Sekunde läuft jedes Mal gleich ab.

Gesteuert wird über die echten Felder des Spiels — `S.gegner.hp` wählt die
Kampfphase, `S.gegner.zug` den Angriff daraus. **Im Spielcode steht keine
einzige Zeile, die nur zum Prüfen da ist.**

## Was geprüft wird

| Datei | Worum es geht |
|:--|:--|
| `spielstand.test.js` | Freischalten, Crew, Bestzeiten, alte Spielstände, Levelleiste, `?alle=1` und `?touch=1` |
| `kampf.test.js` | Der Kracher: jedes Angriffsmuster einzeln, jeder Zeitpunkt im Scheinausholen der Finte, Ausweichen, kein Softlock |
| `atmosphaere.test.js` | Gäste stehen keinem E-Symbol im Weg; die Musik kippt mit dem Pegel |
| `schrift.test.js` | Jedes gezeichnete Zeichen steht auch im Bitmap-Font |

## Warum gerade das

Jede dieser Prüfungen steht für einen Fehler, der schon mal drin war:

- Auf dem Endbildschirm von Level 1 stand **„E WEITER ZU LEVEL 2"**, aber `E`
  hat neu gestartet — die Weiter-Zeile stand hinter der Neustart-Zeile und kam
  nie dran.
- **`%` fehlte im Font.** „+15% TEMPO" stand als „+15? TEMPO" da, jahrelang
  ohne eine einzige Fehlermeldung.
- Die **Finte brach genau dort ab, wo das Konterfenster aufging.** Damit war
  auch das Scheinausholen konterbar und die Finte keine Finte.
  `finteAbbruch < 1 - konterFenster` steht jetzt als Prüfung da.
- Die **Zeitsperre nach einem Patzer ist kürzer als das Ausholen.** Wer
  draufhaute, kam danach noch ins Fenster — das Spammen war also gar nicht
  bestraft.
- **`?touch=1` ging beim Levelwechsel verloren.**

Wer eine Zahl in `TUNE` dreht, sollte danach `node alle.js` laufen lassen. Ein
paar dieser Zahlen hängen voneinander ab, und die Prüfungen sagen es einem.
