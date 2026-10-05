# Endabnahme im Browser

Stand: laufend. Testserver 127.0.0.1:5180, eingebetteter Browser (Pane versteckt, rAF ruht:
Spiel per `bild(fakeZeit)` getaktet; `letzte=0` setzen, sonst giert ein echtes rAF-Bild
negative dt und Blitz/Ruettel werden riesig - das ist ein Messartefakt, kein Spielfehler).
Einmal kam dabei eine Fehlerseite ("Invalid value used as weak map key", bild.js) - ebenfalls
nur durch diese negative Zeit, nicht reproduzierbar mit sauberer Zeit.

## Bestanden (Desktop 1280x720)
- (1) Neuer Besucher: Inhaltshinweis (WEITER / FLACKERSCHUTZ AN), Startmenue (NEUE NACHT, EINSTELLUNGEN,
  ENDEN, UEBER), NEUE NACHT -> Kapitelkarte 16:40 -> Lektion -> Intro -> Level 1 spielbar (laufen, gefangen werden,
  weiter). Keine Konsolenfehler. Alle Seiten, Skripte, manifest, sw.js, icons (192/512/maskable/svg/favicon/apple),
  404.html, robots.txt liefern 200 mit passendem Typ.
- (2) Level 2 bis 8: Seite laedt, Kapitelkarte erscheint (Zeit/Ort/Zeile, Level 8 mit BISHER-Zeilen) und endet,
  Plausch-Leiste zeigt eine Zeile (Level 3 und 8 nur ueber Ausloeser/ohne Sperre, Gespraeche sperren sie wie gewollt),
  Polaroid MOMENT.fund(n) zeigt weisse Karte und endet. Galerie (MENUE.galerie()) zeigt Enden (1 VON 10, ???-Platzhalter)
  und Momente, ZURUECK schliesst.
- (3) Level 8 Abspann: starteCutscene() -> endeRegistrieren (NACHT.gesehen = ['HEIM - MIT BLAUEM AUGE']),
  30 Karten, abspannMitte (Marvin/Epilog/Gruppenchat/Album), abspannSchluss, zeichneWolle (3 offene Knoten,
  "BIS GLEICH"), Endkarten "ENDE: ...", "ENDEN GESEHEN: 1 VON 10", Endbildschirm DURCHGESPIELT. Startmenue danach:
  NEUE NACHT, WEITER: LEVEL 8 - DEIN HEIMWEG, LEVEL WAEHLEN, EINSTELLUNGEN, ENDEN, UEBER.
- (4) Flackerschutz an, Level 5 Tanzflaeche, 5 s gemessen: Stroboskop-Dip 1x pro 5 s, groesster Helligkeitssprung
  zwischen zwei Bildern 3 %, Richtungswechsel 4 in 5 s (<= 3 pro Sekunde, deutlich darunter).
- (5) ?fehlertest=9: Fehlerseite ETWAS IST SCHIEFGELAUFEN mit NEU LADEN / ZUM MENUE / SPIELSTAND LOESCHEN / MELDEN.

## Gefunden und behoben
- Level 8 Endbildschirm (Sieg): unten blinkte zusaetzlich LEERTASTE FUER NEUSTART, obwohl oben schon
  E (ganz neu) und LEERTASTE (nur dieses Level) erklaert sind - widerspruechliche dritte Aufforderung. Jetzt nur noch
  bei ERWISCHT. (level8.html, danach tools/version.py)

## Nicht pruefbar im Emulator
- Service Worker: im eingebetteten Browser scheitert sw.register mit "unknown error when fetching the script",
  obwohl sw.js per fetch 200 liefert (auch mit Service-Worker-Header per curl). Der Emulator erlaubt offenbar keine
  Worker. Abgedeckt nur durch test/sw.test.js. Offline-Lauf, Installation, "NEUE VERSION"-Hinweis: echtes Geraet.
- Taste SHIFT per Browser-Werkzeug kommt nicht im Spiel an (Lektion Schleichen); per Ereignis ShiftLeft geht es.

## Handy
- Quer 667x375 mit ?touch=1: Inhaltshinweis, Startmenue, NEUE NACHT, Kapitelkarte, Lektion (Stick per Zeigerereignis,
  AKTION und BLOCK per Klick), Level 1 mit Stick, SPRUNG, LAMPE, WERFEN bedienbar. Einziger Mangel: im allerersten Bild
  vor dem ersten Takt blitzen LEICHTER/SCHWERER ueber dem Hinweistext (danach ausgeblendet) - unkritisch.
- Hochkant 390x844: Spielbild oben, Hinweis QUER SPIELEN IST BESSER, Menue (scrollt, Pfeil), Lektion, Knoepfe unten.

## Pruefsuite nach den Aenderungen
version.py (BUILD 202610051654), pruefe.js, nachttest.js --kurz, kampf (22), sw (50), geraet (111), erzaehl (52),
epilog (60), menue (30), launchcheck (BEREIT, 0 harte Fehler) - alles gruen.

## Nur ein echtes Telefon klaert
Service Worker und Offline/Installieren, Ton (iOS-Unterbrechung), echtes Multitouch (Stick plus Knoepfe gleichzeitig),
Vollbild/Orientierungswechsel, Wachhalten des Bildschirms, Haptik, echte Flimmerwahrnehmung des Stroboskops.
