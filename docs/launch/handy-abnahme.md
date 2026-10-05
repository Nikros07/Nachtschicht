# Handy-Abnahme (Emulation im Browser, ?touch=1)

Gemessen = per getBoundingClientRect / PointerEvents. Vermutet = Einschaetzung, nur ein echtes Telefon klaert es.
Hinweis zur Messumgebung: das Browser-Panel ist versteckt, requestAnimationFrame laeuft dort nicht; fuer die Messung wurde rAF durch setTimeout ersetzt.

## 667x375 (iPhone SE quer)

Gemessen:
| Was | Wert |
|:--|:--|
| Bild | 640x360 CSS-px (Faktor 2.0), W=320 |
| Pixelschrift Groesse 1 | 3x5 Bildpunkte = 6x10 CSS-px je Zeichen |
| Hauptknopf | 101 px |
| Bogenknoepfe | 66 px |
| Menue-Knopf | 62x30 sichtbar (mit ::after 78x46 Trefferflaeche) |
| Stick | 116 px |

Befunde (Titel, Lektion, Level 1):
1. Titel: Knoepfe LEICHTER/SCHWERER schweben als lose Kreise mitten im Text, LEICHTER deckt "DIE LEHRER SIND NOCH DA". 
2. Titel: ruhender Stick liegt ueber dem Bedienungstext (STICK/SANFT/...).
3. Titel: "UEBER" unten rechts liegt hinter dem START-Knopf, nicht erreichbar.
4. Alle Seiten: ein Streifen des unsichtbaren Toasts (#htoast) lugt als rosa Bogen am oberen Rand heraus.
5. Lektion: HALTEN: UEBERSPRINGEN geht am Handy quer nicht (braucht Enter, es gibt nur E); Knoepfe WERFEN/LAMPE und MENUE ueberdecken Erklaertext und Zeile "TREPPE HOCH, RUNTER (OPTIONAL)".
6. Intro: Rechts unten steht "E WEITER" als Bildtext unter dem WEITER-Knopf.
7. Menue-Knopf sichtbar nur 30 px hoch.

Weitere Messungen 667x375 (Level 2, Gespraech, Plausch, Galerie):
- Gespraech: Leiste belegt unten 211 von 375 px (56 %), das Bild bleibt oben 164 px sichtbar. Antwortflaechen waren 40 px hoch (unter 44).
- Plausch: Zeilen bis ~90 Zeichen (360 Bildpunkte) passen nicht in 320 Bildpunkte Breite; lief ueber den Rand und unter den Menue-Knopf (Menue lag 6 px vom rechten Rand, Hoehe 24 %).
- Kapitelkarte: lesbar (Zeit 3x, Ort 2x, Zeile 1x), Tippen ueberspringt ab 0.6 s. Mit dem Stick darunter leichtes Geisterbild.
- Galerie: Box 380x345, Zurueck-Knopf 348x56, Liste 261 px sichtbar von 694 px Inhalt (overflow:auto), schliesst per Zeigerdruck. Beim Aufruf aus dem Menue lief das Spiel dahinter weiter.
- Abstand Hauptknopf zum Rand 20 px, Menue-Knopf 6 px (zu knapp).

Behoben bisher:
- #htoast: opacity/visibility ohne .an (stil.css).
- Titel: LEICHTER/SCHWERER als zwei flache 84x44-Knoepfe links/rechts der Schwierigkeitszeile (mobil.js wahlSetze); ruhender Stick auf Titel und Zwischentext ausgeblendet.
- Lektion: Halten des Hauptknopfs ueberspringt am Handy (halbe Geschwindigkeit gegenueber Enter); Text quer auf 176 Bildpunkte begrenzt; "(OPTIONAL)" quer weggelassen (Spalte kollidierte mit LAMPE).
- Menue-Knopf: 44 px hoch, 20 px Randabstand (plus Safe-Area), auf 40 % Hoehe.
- Plausch bricht um (erzaehl.js), Balken waechst mit.
- Gespraech: Antwortflaechen mindestens 44 px; ENDEN-Galerie haelt das Spiel an.
- Nachrichtenfenster am Handy: Knoepfe 44 px; Galerie touch-action:pan-y.

## Weitere Geraete (gemessen, ?touch=1, alle fuenf Knoepfe gleichzeitig eingeblendet)
| Geraet | Bild (CSS-px) | Ueberlappungen Knoepfe/Stick/Menue | Hauptknopf-Randabstand | kleinster Knopf |
|:--|:--|:--|:--|:--|
| 667x375 SE quer | 640x360 | keine | 20 px | 66 px, Menue 46x44 |
| 750x340 iPhone 14 quer | 697x315 | keine (vorher Menue x WERFEN/BLOCK) | 18 px | 66 px |
| 915x360 Android quer | 864x360 | keine | 19 px | 70 px |
| 640x360 klein quer | 640x360 | keine | 19 px | 70 px |
| 1024x768 iPad quer | 960x540 (Balken oben/unten) | keine | 35 px | gross |
| 390x844 hochkant | 390x219 | vorher Stick x LAMPE (Lektion), jetzt keine | 23 px | 76 px |
| 360x640 hochkant | 360x203 | keine | 22 px | 70 px |
Alle Treffer-Knoepfe >= 44 px (Menue-Knopf 46x44, Antwortflaechen, Menue-Zeilen, Galerie Zurueck 56 px). Randabstand 20 px nur beim Hauptknopf; Menue-Knopf bewusst 8 px (+ Safe-Area), sonst beruehrt er den Bogen.
Pixelschrift: Faktor 2.0 bei 640x360 und 667x375 (Zeichen 6x10 CSS-px), 1.75 bei 750x340, 2.0 bei 915x360; hochkant 1.0-1.2 (Zeichen 3.6-4x6 px, klein).

## Eingabe-Robustheit (echte PointerEvents, pointerType touch, 667x375, Level 2)
Alles bestanden, Tastenzustand per Capture-Listener gelesen:
- pointercancel mitten im Halten (Stick, Hauptknopf): Tasten sofort los.
- blur mit gehaltenem Stick + Sprung: beide los; Finger noch unten, naechste Bewegung setzt neu.
- visibilitychange (hidden): los.
- Zweitfinger auf der Stick-Haelfte: ignoriert (stickId), Loslassen des zweiten aendert nichts.
- Menue per Zweitfinger waehrend der Stick gehalten wird: Spiel pausiert; vorher blieb die Pfeiltaste gedrueckt (jetzt allesLos beim Oeffnen).
- Orientierungswechsel quer->hoch mit gehaltenem Finger: Layout neu, Tasten nach pointerup los.
- Finger rutscht vom Stick: Zeiger ist auf die Haelfte gefangen (setPointerCapture), kein Uebergang in Knoepfe (nur per Code geprueft, nicht mit echtem Daumen).

## Fertig behoben (zusaetzlich zur Liste oben)
- Polaroid: Karte waechst mit dem laengsten Satz (bis 38 Zeichen = 152 Bildpunkte, vorher 132 -> Schrift am Rand); Foto-Flaeche folgt.
- Kapitelkarte: BISHER-Zeilen und Tippen-Hinweis heller (#4a4363 war kaum lesbar).
- Menue quer: zwei Spalten, passt in 375 px ohne Scrollen (vorher 408 px, scrollen). touch-action pan-y auf Menue/Antwortliste.
- Menue-Knopf: 46x44 statt 62x30, rechts 8 px + Safe-Area, auf 40 % Hoehe; Ueberlappung mit BLOCK/WERFEN bei 750x340 behoben.
- Hochkant: LAMPE-Knopf steiler (45 Grad), beruehrt den Stick nicht mehr.
- Lektion: Haken quer nicht mehr unter dem Menue; der Tipp, der das Intro ueberspringt, hakt KNOPF nicht mehr ab.
- Vibration: kein Konsolenfehler vor der ersten echten Beruehrung (navigator.userActivation).
- iPhone-Safari: Menuepunkt VOLLBILD? erklaert "Teilen, zum Home-Bildschirm" wenn es keine Vollbild-API gibt; als App gestartet entfaellt der Punkt. Safe-Area: kern.js zieht Aussparungen von der Bildbreite ab, #screen quer mit Safe-Area-Padding, Menue-Knopf rechts mit Safe-Area. (Emulator hat keine Aussparung: vermutet, nicht gemessen.)

## Offene Befunde
- Titelbild: "UEBER" unten rechts liegt hinter dem START-Knopf, am Handy nicht erreichbar (Level-Datei index.html/Titelzeichnung, nicht angefasst).
- Alte Intro-Hinweise "E  WEITER" unten rechts (index, level3/4/5) stehen am Handy hinter dem WEITER-Knopf; harmlos, Level-Dateien nicht angefasst.
- Gespraechsleiste quer belegt bis 56 % der Hoehe (3 Antworten): Szene oben nur 164 px. Vorschlag: bei Bedarf zweispaltige Antworten.
- Hochkant ist die Pixelschrift klein (Zeichen ca. 4x6 CSS-px); quer spielen ist der Hinweis.
- Das Lesen der Plausch-Zeilen im Spielfluss (Dauer 2.4 s + 0.07 s je Zeichen) auf einem Telefon ungeprueft.
- iPad: Bild 960x540 mit Balken, Knoepfe liegen teils auf den Balken - Geschmackssache.

## Nur ein echtes Telefon klaert
- Echtes Multitouch (Daumen-Rutschen vom Stick in den Knopf), Daumenreichweite und Gefuehl der 66-px-Knoepfe.
- Safe-Area/Notch, Adressleisten-Hoehe (dvh), Home-Bildschirm-Start, Wake-Lock, Vibration, Ton nach Unterbrechung.
- Lesbarkeit der Pixelschrift bei 6x10 CSS-px in der Hand, Kontrast bei Sonnenlicht.
- Orientierungswechsel mit pointercancel durch das Betriebssystem.
- Die Messung lief im versteckten Panel: requestAnimationFrame wurde durch setTimeout ersetzt, Zeiten ungefaehr; navigator.vibrate nicht pruefbar.
