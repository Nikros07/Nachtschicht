# Die Nachtroutinen in der Cloud

`nacht-4-testen.md` und `nacht-5-weiterbauen.md` sind die **Prompts** der beiden
Routinen — Wort für Wort das, was die Cloud-Sitzung bekommt. Wer eine Routine
ändern will, ändert die Datei hier und trägt den Text neu ein; so bleibt die
Fassung versioniert und nicht nur in einer Oberfläche versteckt.

## Einrichtung

| | 4-Uhr-Routine | 5-Uhr-Routine |
|:--|:--|:--|
| Name | Nacht 4 Uhr — NACHTSCHICHT testen | Nacht 5 Uhr — NACHTSCHICHT weiterbauen |
| Prompt | `nacht-4-testen.md` | `nacht-5-weiterbauen.md` |
| Repository | `Nikros07/Nachtschicht` | `Nikros07/Nachtschicht` |
| Zeitplan (UTC!) | `0 2 * * *` | `0 3 * * *` |
| Ortszeit bis 25.10.2026 | 4:00 (Sommerzeit) | 5:00 |
| Ortszeit ab 25.10.2026 | 3:00 (Winterzeit) | 4:00 |

**Zeiten sind UTC** und kennen keine Sommerzeit. Wer es dauerhaft bei 4 und 5 Uhr
haben will, stellt am 25. Oktober auf `0 3` und `0 4` um.

## Sicherheit — nicht abschwächen

- **Eine Freigabe für „Pushen auf alle Branches" gehört NICHT eingeschaltet.** Nach
  meinem Kenntnisstand dürfen Cloud-Routinen in der Voreinstellung nur auf Branches mit
  dem Präfix `claude/` pushen — **bitte beim Einrichten kontrollieren**, ich konnte es
  von hier aus nicht nachsehen. Genau diese Beschränkung ist gewollt: Die Routinen arbeiten auf `claude/nacht`, und `main` — damit auch die
  Live-Seite auf GitHub Pages — bleibt unberührt, bis du selbst mergst.
- Die Prompts verbieten `main`, `--force` und Löschen zusätzlich. Das ist die
  zweite Sicherung, nicht die einzige.
- Ein GitHub-**Konnektor** ist für das Pushen nicht nötig. Er würde nur erlauben,
  dass die Routine morgens selbst einen Pull Request öffnet. Ohne ihn öffnest du
  den Vergleich per Link: `https://github.com/Nikros07/Nachtschicht/compare/main...claude/nacht`

## Morgens

1. `NACHT-LOG.md` auf dem Branch lesen — was ist passiert.
2. Ansehen: `git log main..origin/claude/nacht --oneline`
3. Passt es: `claude/nacht` nach `main` mergen. Passt es nicht: den Branch
   verwerfen, oder einzelne Commits mit `git revert` zurücknehmen.

## Was die Cloud nicht kann

Keinen Browser. Deshalb läuft alles über `tools/nachttest.js`, das Engine und Level
ohne Browser zusammensetzt. **Pixel, Layout und Ton kann es nicht messen** — der
Punkt „Software-Canvas" in `NACHT-TODO.md` soll das ändern, und bis dahin
überspringen die Routinen Punkte, die eine Pixelmessung verlangen.
