# -*- coding: utf-8 -*-
"""Erzeugt die App-Symbole von NACHTSCHICHT aus einem 32x32-Pixelbild.

  python tools/icons.py

Schreibt nach icons/: icon.svg, icon-192.png, icon-512.png, icon-maskable-512.png,
apple-touch-icon.png (180), favicon-32.png, favicon.ico und og.png (1200x630,
das Vorschaubild, das Messenger und soziale Netze zu einem Link zeigen).
Ausserdem setzt es den Mond in 404.html neu ein (data-URI), damit die Fehlerseite
nie ein altes Symbol zeigt.

Das Bild: Nachthimmel mit Mond, Sternen und einer Haeuserreihe mit pinken und
goldenen Fenstern - die Farben des Spiels (Rosa #ff3d8b, Gold #ffd447).
Alles wird aus einer Pixeltabelle gezeichnet, also bleibt es kantenscharf und
laesst sich hier an einer Stelle aendern. Braucht Pillow (pip install pillow).
"""
import base64
import io
import math
import os
import random
import re
from PIL import Image

N = 32
HIMMEL = ['#0b0818', '#120c26', '#1b1038', '#2a1450', '#42175e', '#661a66']   # oben -> Horizont
STERN = '#f2f0ff'
GOLD = '#ffd447'
PINK = '#ff3d8b'
HAUS = '#07050f'

# (x, Breite, Hoehe) der Haeuser, von unten gemessen
HAEUSER = [(0, 4, 8), (4, 3, 5), (7, 5, 11), (12, 4, 7), (16, 3, 9), (19, 5, 6), (24, 4, 10), (28, 4, 7)]
STERNE = [(3, 3), (9, 6), (14, 2), (27, 4), (30, 9), (6, 11), (12, 9), (29, 14)]


def zeichne():
    px = [[None] * N for _ in range(N)]
    # Himmel in sechs Baendern
    for y in range(N):
        px[y] = [HIMMEL[min(len(HIMMEL) - 1, y * len(HIMMEL) // 24)]] * N
    for (x, y) in STERNE:
        px[y][x] = STERN
    # Mondsichel: grosser Kreis minus versetzter Kreis
    cx, cy, r = 21, 11, 6.2
    for y in range(N):
        for x in range(N):
            if (x - cx) ** 2 + (y - cy) ** 2 <= r * r and (x - (cx + 3)) ** 2 + (y - (cy - 2)) ** 2 > 5.4 ** 2:
                px[y][x] = GOLD
    # Haeuser mit Fenstern
    for (hx, b, h) in HAEUSER:
        for y in range(N - h, N):
            for x in range(hx, hx + b):
                px[y][x] = HAUS
        for fy in range(N - h + 1, N - 1, 2):
            for fx in range(hx + 1, hx + b - 1, 2):
                if (fx * 7 + fy * 3) % 5 in (0, 1, 3):
                    px[fy][fx] = PINK if (fx + fy) % 3 else GOLD
    return px


def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def bild(px, groesse):
    img = Image.new('RGB', (N, N))
    img.putdata([hexrgb(c) for zeile in px for c in zeile])
    return img.resize((groesse, groesse), Image.NEAREST)


def svg(px):
    teile = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" shape-rendering="crispEdges">' % (N, N)]
    for y, zeile in enumerate(px):
        x = 0
        while x < N:   # gleiche Farben in einer Zeile zu einem Rechteck verbinden
            e = x
            while e + 1 < N and zeile[e + 1] == zeile[x]:
                e += 1
            teile.append('<rect x="%d" y="%d" width="%d" height="1" fill="%s"/>' % (x, y, e - x + 1, zeile[x]))
            x = e + 1
    teile.append('</svg>')
    return '\n'.join(teile)


def maskierbar(px, groesse):
    """Maskierbares Symbol: die Szene auf 80 % verkleinert, ringsum Himmelsfarbe,
    damit runde und abgerundete Masken von Android nichts Wichtiges abschneiden."""
    innen = int(groesse * 0.8)
    rand = (groesse - innen) // 2
    flaeche = Image.new('RGB', (groesse, groesse), hexrgb(HIMMEL[0]))
    # Hintergrundverlauf ueber die ganze Flaeche, Szene darauf
    for y in range(groesse):
        c = hexrgb(HIMMEL[min(len(HIMMEL) - 1, int(y / groesse * 0.75 * len(HIMMEL)))])
        for x in range(groesse):
            flaeche.putpixel((x, y), c)
    flaeche.paste(bild(px, innen), (rand, rand))
    return flaeche


def svg_kompakt(px):
    """Dieselbe Szene mit einem <path> je Farbe: rund 3 KB statt 8 KB. Fuer das
    Einbetten als data-URI in 404.html, wo jede Datei allein stehen muss."""
    pfade = {}
    for y, zeile in enumerate(px):
        x = 0
        while x < N:
            e = x
            while e + 1 < N and zeile[e + 1] == zeile[x]:
                e += 1
            pfade.setdefault(zeile[x], []).append('M%d %dh%dv1h-%dz' % (x, y, e - x + 1, e - x + 1))
            x = e + 1
    teile = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" shape-rendering="crispEdges">' % (N, N)]
    for farbe, d in pfade.items():
        teile.append('<path fill="%s" d="%s"/>' % (farbe, ''.join(d)))
    teile.append('</svg>')
    return ''.join(teile)


def aktualisiere_404(wurzel, px):
    """Setzt den Pixelmond in 404.html neu ein. Die Fehlerseite wird unter beliebigen
    Pfaden ausgeliefert, deshalb darf sie keine Bilddatei relativ verlinken - der Mond
    steckt als data-URI im <img id="mond">. Gibt es die Seite nicht, passiert nichts."""
    pfad = os.path.join(wurzel, '404.html')
    if not os.path.exists(pfad):
        return False
    uri = 'data:image/svg+xml;base64,' + base64.b64encode(svg_kompakt(px).encode('utf-8')).decode('ascii')
    alt = io.open(pfad, encoding='utf-8', newline='').read()
    neu, n = re.subn(r'(<img id="mond" src=")[^"]*(")', lambda m: m.group(1) + uri + m.group(2), alt)
    if n and neu != alt:
        io.open(pfad, 'w', encoding='utf-8', newline='').write(neu)
    return n > 0


# ---------------------------------------------------------------------------
# Vorschaubild og.png (1200 x 630)
#
# Gezeichnet wird auf einem groben Raster von 200 x 105 Punkten, jeder Punkt wird
# am Ende 6 x 6 Pixel gross - so bleibt alles kantenscharf wie im Spiel. Der Text
# kommt aus der 3x5-Schrift des Spiels (nacht/bild.js), nur als Daten gelesen.
# ---------------------------------------------------------------------------
OG_B, OG_H, OG_PX = 200, 105, 6
OG_HORIZONT = 80                       # ab hier ist der Himmel am hellsten
OG_NEBEL = '#8a2370'                   # warmes Leuchten direkt ueber den Daechern
DUNKEL = '#07050f'                     # Haeuser und Textkontur
FERN = '#26104a'                       # die zweite, entfernte Haeuserreihe
ROSA_ZEILEN = ['#ff8dba', '#ff5ea1', '#ff3d8b', '#ff3d8b', '#dd2a77']   # oben heller, unten dunkler
GOLD_ZEILEN = ['#ffe987', '#ffd447', '#ffd447', '#f2bd35', '#dba52a']
HELL = '#d4cdf0'
BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]


def lade_schrift(wurzel):
    """Liest die Glyphentabelle `const F = {...}` aus nacht/bild.js als TEXT - nichts wird
    ausgefuehrt. So gibt es genau eine Schrift im Projekt; aendert sie sich, aendert sich
    auch das Vorschaubild beim naechsten Lauf."""
    quelle = io.open(os.path.join(wurzel, 'nacht', 'bild.js'), encoding='utf-8').read()
    start = quelle.index('const F = {')
    block = quelle[start:quelle.index('\n};', start)]
    muster = re.compile(r"""(?:'(\\?.)'|"(\\?.)"|(\w))\s*:\s*'([01]{3}(?:,[01]{3}){4})'""")
    schrift = {}
    for m in muster.finditer(block):
        zeichen = (m.group(1) or m.group(2) or m.group(3)).lstrip('\\')
        schrift[zeichen] = m.group(4).split(',')
    if len(schrift) < 36:
        raise SystemExit('Glyphentabelle in nacht/bild.js nicht lesbar (%d Zeichen gefunden)' % len(schrift))
    return schrift


def schrift_punkte(schrift, text, k):
    """Gesetzte Rasterpunkte eines Textes als {(x, y): Glyphzeile}, Ursprung links oben.
    Jedes Schriftpixel ist k x k Rasterpunkte gross; die Glyphzeile (0-4) waehlt die Farbstufe."""
    punkte = {}
    for i, z in enumerate(text.upper()):
        gl = schrift.get(z)
        if gl is None:
            raise SystemExit('Zeichen %r fehlt in der Schrift' % z)
        for r in range(5):
            for c in range(3):
                if gl[r][c] == '1':
                    for dy in range(k):
                        for dx in range(k):
                            punkte[((i * 4 + c) * k + dx, r * k + dy)] = r
    return punkte


def schrift_breite(text, k):
    return (len(text) * 4 - 1) * k


def mische(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def og_himmel(g):
    """Himmelsverlauf in den Spielfarben; die Uebergaenge sind mit einer Bayer-Matrix
    gerastert (wie auf alten Bildschirmen) statt weich verwaschen."""
    farben = [hexrgb(c) for c in HIMMEL] + [hexrgb(OG_NEBEL)]
    for y in range(OG_H):
        pos = min(y, OG_HORIZONT) / OG_HORIZONT * (len(farben) - 1)
        i = min(int(pos), len(farben) - 2)
        t = pos - i
        for x in range(OG_B):
            schwelle = (BAYER[y % 4][x % 4] + 0.5) / 16
            g[y][x] = farben[i + 1] if t > schwelle else farben[i]


def og_sterne(g, frei):
    """Sterne an festen Zufallsorten (Seed), nicht hinter dem Text und nicht auf dem Mond."""
    zufall = random.Random(20261003)
    farben = [hexrgb(STERN)] * 5 + [hexrgb('#8d86a8')] * 3 + [hexrgb(GOLD)]
    gesetzt = 0
    versuche = 0
    while gesetzt < 46 and versuche < 2000:
        versuche += 1
        x, y = zufall.randrange(2, OG_B - 2), zufall.randrange(2, 66)
        if any(x0 - 3 <= x <= x1 + 3 and y0 - 3 <= y <= y1 + 3 for (x0, y0, x1, y1) in frei):
            continue
        g[y][x] = zufall.choice(farben)
        if gesetzt % 9 == 4:     # ein paar funkelnde Kreuze
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                g[y + dy][x + dx] = mische(g[y + dy][x + dx], hexrgb(STERN), .55)
            g[y][x] = hexrgb('#ffffff')
        gesetzt += 1


def og_mond(g, cx, cy, r):
    """Mondsichel wie im Symbol (grosser Kreis minus versetzter Kreis). Der Hof folgt der
    Sichel selbst (Abstand zu ihren Punkten), nicht dem ganzen Kreis - sonst saehe der Mond
    wie eine Scheibe mit Ring aus."""
    gold = hexrgb(GOLD)
    sichel = []
    for y in range(cy - r - 1, cy + r + 2):
        for x in range(cx - r - 1, cx + r + 2):
            if math.hypot(x - cx, y - cy) <= r:
                innen = math.hypot(x - (cx + 5), y - (cy - 3))
                if innen > r * 0.86:
                    # eine hellere Kante direkt an der Innenseite der Sichel
                    sichel.append((x, y, hexrgb('#ffe987') if innen < r * 0.86 + 1.6 else gold))
    R = 7
    feld = {}
    for (x, y, _) in sichel:
        for dy in range(-R, R + 1):
            for dx in range(-R, R + 1):
                d = math.hypot(dx, dy)
                if d <= R:
                    w = (1 - d / R) ** 1.6
                    if w > feld.get((x + dx, y + dy), 0):
                        feld[(x + dx, y + dy)] = w
    for (x, y), w in feld.items():
        stufe = round(w * 4) / 4
        if stufe > 0 and 0 <= x < OG_B and 0 <= y < OG_H:
            g[y][x] = mische(g[y][x], gold, stufe * .22)
    for (x, y, farbe) in sichel:
        g[y][x] = farbe


def og_haeuser(g):
    """Zwei Haeuserreihen: hinten flache, fensterlose Umrisse, davor die dunklen Haeuser mit
    rosa und goldenen Fenstern. Feste Zufallsfolge, damit das Bild bei jedem Lauf gleich ist."""
    zufall = random.Random(77)
    boden = OG_H

    def block(x0, breite, hoehe, farbe):
        for y in range(boden - hoehe, boden):
            for x in range(max(0, x0), min(OG_B, x0 + breite)):
                g[y][x] = hexrgb(farbe)

    x = -4
    while x < OG_B:                      # hinten
        b, h = zufall.randrange(12, 22), zufall.randrange(24, 34)
        block(x, b, h, FERN)
        x += b - zufall.randrange(0, 3)

    x = -2
    while x < OG_B:                      # vorn
        b, h = zufall.randrange(11, 19), zufall.randrange(13, 25)
        block(x, b, h, DUNKEL)
        if zufall.random() < .45:        # kleiner Dachaufbau oder Schornstein
            block(x + zufall.randrange(1, max(2, b - 4)), 3, h + 3, DUNKEL)
        for fy in range(boden - h + 3, boden - 3, 6):
            for fx in range(x + 2, x + b - 3, 5):
                if 0 <= fx < OG_B - 2 and zufall.random() < .46:
                    farbe = hexrgb(GOLD if zufall.random() < .3 else PINK)
                    for dy in range(3):
                        for dx in range(2):
                            g[fy + dy][fx + dx] = farbe
        x += b + zufall.randrange(0, 2)


def og_text(g, schrift, text, x0, y0, k, stufen, glanz, glanz_staerke):
    """Text mit Leuchten, dunkler Kontur samt Schlagschatten und einer Farbstufe je
    Glyphzeile (oben heller, unten dunkler - wie die Schrift im Spiel, nur mit mehr
    Koerper). Alles auf dem Raster, also pixelig."""
    punkte = {(x + x0, y + y0): r for (x, y), r in schrift_punkte(schrift, text, k).items()}
    # Leuchten: Abstand zur Schrift, nach aussen schwaecher, in vier Stufen gerastert
    R = 8 if k >= 3 else 5
    feld = {}
    for (x, y) in punkte:
        for dy in range(-R, R + 1):
            for dx in range(-R, R + 1):
                d = math.hypot(dx, dy)
                if d <= R:
                    w = (1 - d / R) ** 1.6
                    if w > feld.get((x + dx, y + dy), 0):
                        feld[(x + dx, y + dy)] = w
    glanz_rgb = hexrgb(glanz)
    for (x, y), w in feld.items():
        stufe = round(w * 4) / 4
        if stufe > 0 and 0 <= x < OG_B and 0 <= y < OG_H:
            g[y][x] = mische(g[y][x], glanz_rgb, stufe * glanz_staerke)
    # Kontur ringsum plus ein um (sx, sy) versetzter Schatten, beides in Haeuserfarbe
    rand = 1
    sx = sy = 2 if k >= 3 else 1
    umriss = set()
    for (x, y) in punkte:
        for dy in range(-rand, rand + 1):
            for dx in range(-rand, rand + 1):
                umriss.add((x + dx, y + dy))
                umriss.add((x + dx + sx, y + dy + sy))
    dunkel = hexrgb(DUNKEL)
    for (x, y) in umriss:
        if 0 <= x < OG_B and 0 <= y < OG_H:
            g[y][x] = dunkel
    for (x, y), r in punkte.items():
        if 0 <= x < OG_B and 0 <= y < OG_H:
            g[y][x] = hexrgb(stufen[r])


def og_bild(wurzel):
    schrift = lade_schrift(wurzel)
    g = [[(0, 0, 0)] * OG_B for _ in range(OG_H)]
    og_himmel(g)

    titel, zeile2, zeile3 = 'NACHTSCHICHT', 'PARTY GAME DRUNK', 'IM BROWSER - KEIN DOWNLOAD'
    k1, k2, k3 = 3, 2, 1
    x0 = 12
    y1, y2, y3 = 17, 41, 58
    frei = [(x0, y1, x0 + schrift_breite(titel, k1), y1 + 5 * k1),
            (x0, y2, x0 + schrift_breite(zeile2, k2), y2 + 5 * k2),
            (x0, y3, x0 + schrift_breite(zeile3, k3), y3 + 5 * k3)]
    mond = (175, 24, 13)
    frei.append((mond[0] - mond[2] - 12, mond[1] - mond[2] - 12, mond[0] + mond[2] + 12, mond[1] + mond[2] + 12))

    og_sterne(g, frei)
    og_mond(g, *mond)
    og_haeuser(g)
    og_text(g, schrift, titel, x0, y1, k1, ROSA_ZEILEN, PINK, .55)
    og_text(g, schrift, zeile2, x0, y2, k2, GOLD_ZEILEN, GOLD, .32)
    og_text(g, schrift, zeile3, x0, y3, k3, [HELL] * 5, '#a79bd6', .25)

    img = Image.new('RGB', (OG_B, OG_H))
    img.putdata([c for zeile in g for c in zeile])
    return img.resize((OG_B * OG_PX, OG_H * OG_PX), Image.NEAREST)


if __name__ == '__main__':
    wurzel = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ziel = os.path.join(wurzel, 'icons')
    os.makedirs(ziel, exist_ok=True)
    px = zeichne()
    with open(os.path.join(ziel, 'icon.svg'), 'w', encoding='utf-8') as f:
        f.write(svg(px))
    bild(px, 192).save(os.path.join(ziel, 'icon-192.png'))
    bild(px, 512).save(os.path.join(ziel, 'icon-512.png'))
    maskierbar(px, 512).save(os.path.join(ziel, 'icon-maskable-512.png'))
    bild(px, 180).save(os.path.join(ziel, 'apple-touch-icon.png'))
    bild(px, 32).save(os.path.join(ziel, 'favicon-32.png'))
    bild(px, 48).save(os.path.join(ziel, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
    og_bild(wurzel).save(os.path.join(ziel, 'og.png'), optimize=True)
    if aktualisiere_404(wurzel, px):
        print('Mond in 404.html aktualisiert')
    print('Symbole geschrieben nach', ziel)
