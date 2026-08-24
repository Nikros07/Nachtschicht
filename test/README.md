# Pruefen, ob noch alles laeuft

Das Spiel hat keinen Bauschritt und braucht keinen. Diese Pruefungen sind
trotzdem da, weil ab drei Leveln niemand mehr nach jeder Aenderung von Hand
durch alle Seiten klickt.

Sie starten einen kleinen Server auf dem Repo-Ordner, laden jede Seite in
einem echten Browser und schauen zu.

## Einmalig einrichten

```bash
npm i playwright
```

Mehr nicht — es gibt keine `package.json` und keine weiteren Pakete. Der
Ordner `node_modules/` steht in `.gitignore`.

Bringt die Umgebung schon einen Chromium mit, kann man ihn nehmen:

```bash
export CHROMIUM_PFAD=/pfad/zu/chrome
```

## Starten

```bash
node test/rauch.test.js          # jede Seite laden, alle Tasten druecken
node test/spielstand.test.js     # Freischaltung, Bestzeiten, alte Staende
```

Beide geben `0` zurueck, wenn alles gruen ist.

Bilder zum Anschauen gibt es mit:

```bash
node test/rauch.test.js --bilder /tmp/bilder
```

## Was sie finden — und was nicht

**Finden sie:** Tippfehler, Funktionen, die es nach einer Verschiebung nicht
mehr gibt, Dateien, die nicht geladen werden, Tasten, die eine Seite
wegnavigieren, obwohl gerade gespielt wird — und beim Spielstand jede
Regel einzeln, inklusive der Uebernahme alter Spielstaende.

**Finden sie nicht:** ob ein Level Spass macht, ob die Zahlen in `TUNE`
stimmen, ob ein Raum haesslich ist. Dafuer gibt es kein Skript.
