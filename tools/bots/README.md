# Gewinn-Bots (tools/bots/)

Ein Bot je Level, der das Level **gewinnt** (Endzustand `S.modus==='ende'` und `S.gewonnen`), nur
ueber Tasten (`L.taste`). Zustand wird gelesen (Positionen, Ziele, Konstanten), gesetzt wird
nichts am Spielstand. Zufallstasten gewinnen Level 1, 2, 3 und 6 nie - diese Bots schon. Damit
sind Balance-Aenderungen messbar und "Level ist noch gewinnbar" ist ein Regressionstest.

```bash
node tools/nachttest.js --bots            # alle 8, parallel, ca. 1 s: je Level eine Zeile
node tools/nachttest.js --bots level3     # nur ein Level (Filter: Dateiname oder Seite)
BOT_STACK=1 node tools/nachttest.js --bots level3   # bei Ausnahme den Stack zeigen
```

Eine Zeile: `Seite  gewonnen ja/NEIN  Spielzeit S.zeit  Punkte  Rang  (Echtzeit)`. Exit 1, wenn ein
Bot nicht gewinnt oder eine Ausnahme wirft. `--bots` ist **nicht** Teil von `pruefliste.js`.
Seed und Zufall sind fest (nachttest: `Math.random` ist ein Seed-Generator), jeder Lauf ist gleich.

## Eine TUNE-Aenderung messen

1. Vorher: `node tools/nachttest.js --bots level4` - Zeit, Punkte, Rang notieren.
2. `TUNE`-Wert im Level aendern (nie in der Logik).
3. Nachher: derselbe Aufruf. Gewinnt der Bot nicht mehr, ist das Level zu hart fuer den
   perfekten Spieler (oder der Bot muss neu zu der Mechanik passen - dann im Bot nachziehen).
   Aendert sich der Rang, zeigt die Zeile, wie die Wertung reagiert.
4. Der Bot ist ein **perfekter, ehrlicher Weg**, kein Durchschnittsspieler: er misst die Obergrenze
   (Gewinn moeglich?) und Rang-Grenzen, nicht die Schwierigkeit. Fuer Zufalls-/Anfaengerlaeufe
   bleiben `docs/gameplay/messung/b-*.js` und `n3-*-rang.js`.
5. Wertung aus dem Bot lesen: `k.rang()` liefert `{args:[levelNr,punkte,zeilen],ergebnis:{rang,...}}`
   des letzten `WERTUNG.abschluss`; `k.E('...')` wertet im Spiel aus.

## Aufbau

- `_kern.js`: `start(seite)` laedt die Seite (`tools/messhilfe.js`), `spiele(bot)` fuehrt einen Bot
  aus und liefert das Ergebnisobjekt fuer die Zeile. Bausteine: `k.takt(n)` (n mal `update(1/60)`),
  `k.halte(codes)` (genau diese Tasten halten), `k.tipp(code)`, `k.einBild(code)` (nur ein Bild halten,
  fuer Tasten, die erst im `update` gelesen werden, z.B. die Treppe in Level 1), `k.titel(modi)`
  (Titel/Kapitelkarte/Intro mit Leertaste), `k.gespraech(politik)` (Standardantwort, oder
  `politik(texte)->Index`), `k.gehe(x)`, `k.gehe2(x,tiefe)`, `kloppeSchritt` (Konter in `nacht/kampf.js`-Kloppen).
- `level1.js` ... `level8.js`: `module.exports={ seite, laufe(k){...} }`. Ein Bot ist eine Schleife
  "Zustand lesen, Tasten setzen, `k.takt(1)`", mit Hoechstzeit, damit nie etwas haengt.

## Was jeder Bot tut

| Bot | Weg |
|---|---|
| level1 (index.html) | Schluesselraum/-moebel aus dem Zustand lesen, hingehen, durchsuchen, Treppen, zum Ausgang, Szene mit E halten. Variante "Hausmeister": ihn ansprechen (Standardantworten). |
| level2 | Jacke und Ausweis dort suchen, wo der Zustand sie versteckt; Dose fuer Finn; Ausweis zu Moritz; Tuer links: Konter im goldenen Fenster. |
| level3 | Sprint: vor jedem Hindernis springen; Bus: in der Sitzreihe (Tiefe) an den Kontrolleuren vorbei; Standardantwort an der Tuer. |
| level4 | Tuersteher wie der "profi" aus `b-level4.js`: im Fenster kontern, vor der Ramme rollen, nachsetzen. |
| level5 | Kuerzester Weg: Bar (AUF EX im Minispiel), dann Ausgang; Kloppe notfalls ausspielen. |
| level6 | Spind, Labortisch, Buecher, LEA; Sofa, wenn die Kondition sinkt. |
| level7 | Wasser und Snack mit dem Startgeld kaufen, Ecke ganz rechts, Standardantwort (Heim). |
| level8 | Standardantwort "Dann los.", Endkampf mit der Taktik "konter" (c-level8.js), Wettlauf mit Springen und Tschuess, Finale per E ueberspringen. |

## Grenzen

Kein Pixel, kein Ton (siehe `nachttest.js`). Aendert ein Level seine Mechanik (neue Taste, andere
Reihenfolge der Ziele), muss der passende Bot mit - er schlaegt dann als "gewonnen NEIN" an, das ist gewollt.
