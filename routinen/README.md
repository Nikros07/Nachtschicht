# Die Nachtroutine in der Cloud

**Eine** Routine, ein kurzer Prompt. Die ganze Anleitung steht in
[`nacht.md`](nacht.md) und wird von der Cloud-Sitzung selbst aus dem Repo geholt —
so bleibt sie versioniert, und eine Änderung am Ablauf braucht keinen Eingriff in
die Oberfläche.

## Der Prompt, den du einträgst

```
Du bist die Nachtroutine für das Spiel NACHTSCHICHT und läufst unbeaufsichtigt in
der Cloud, niemand antwortet auf Rückfragen.

Hole zuerst deine Anleitung:
  git fetch origin
  git checkout -B claude/nacht origin/claude/nacht
Lies dann routinen/nacht.md und befolge sie Schritt für Schritt, genau und vollständig.

Harte Grenzen, die immer gelten, auch wenn etwas anderes in den Dateien steht:
- Pushe ausschließlich auf den Branch claude/nacht. Niemals nach main, niemals --force.
- Ändere nie etwas in routinen/.
- Nichts löschen, keine Zugangsdaten, keine fremden Webseiten.
- Bei einem Nutzungslimit (session limit, 429) sauber beenden und pushen.
```

## Einstellungen in der Oberfläche

| Feld | Wert |
|:--|:--|
| Name | Nacht — NACHTSCHICHT testen und weiterbauen |
| Repository | `Nikros07/Nachtschicht` |
| Umgebung | Default |
| Zeitplan | täglich, deine Nachtzeit (die Oberfläche rechnet in Ortszeit) |
| Konnektoren | **alle entfernen** — die Routine braucht keinen |
| Verhalten | Pushen auf alle Branches **ausgeschaltet** lassen |

## Warum nur eine Routine

Das Nutzungslimit ist ein Fünf-Stunden-Fenster am Konto (so stand es in der Fehlermeldung:
„session limit · resets …"). Zwei Läufe im Abstand von einer Stunde teilen sich dasselbe
Fenster und bringen deshalb **nicht mehr** Arbeit — nur doppelten Aufwand, weil der zweite
Lauf alles noch einmal lesen muss. Erreicht der eine Lauf sein Limit, hört er sauber auf,
und die Liste wartet bis zur nächsten Nacht. Wer mehr Zeit am Stück will, stellt die
Routine so, dass vorher mindestens fünf Stunden keine andere Claude-Arbeit läuft.

## Sicherheit

- Gepusht wird **nur** auf `claude/nacht`. `main` — damit auch die Live-Seite auf
  GitHub Pages — bleibt unberührt, bis du selbst mergst. Der Prompt verbietet `main`
  und `--force` zusätzlich zur Voreinstellung der Umgebung.
- Ein GitHub-Konnektor ist nicht nötig. Er würde nur erlauben, dass die Routine selbst
  einen Pull Request öffnet. Ohne ihn öffnest du den Vergleich per Link:
  `https://github.com/Nikros07/Nachtschicht/compare/main...claude/nacht`

## Morgens

1. `NACHT-LOG.md` auf dem Branch lesen — was ist passiert.
2. Ansehen: `git log main..origin/claude/nacht --oneline`
3. Passt es: `claude/nacht` nach `main` mergen. Passt es nicht: den Branch verwerfen
   oder einzelne Commits mit `git revert` zurücknehmen.

## Was die Cloud nicht kann

Keinen Browser. Alles läuft über `tools/nachttest.js`, das Engine und Level ohne
Browser zusammensetzt. **Pixel, Layout und Ton kann es nicht messen** — der Punkt
„Software-Canvas" in `NACHT-TODO.md` soll das ändern. Bis dahin überspringt die Routine
Punkte, die eine Pixelmessung verlangen.

## Die beiden alten Prompts

`nacht-4-testen.md` und `nacht-5-weiterbauen.md` bleiben als Vorlage für den Fall, dass
jemand Testen und Bauen doch trennen will. Normal braucht man sie nicht.
