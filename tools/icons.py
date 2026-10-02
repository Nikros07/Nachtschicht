# -*- coding: utf-8 -*-
"""Erzeugt die App-Symbole von NACHTSCHICHT aus einem 32x32-Pixelbild.

  python tools/icons.py

Schreibt nach icons/: icon.svg, icon-192.png, icon-512.png, icon-maskable-512.png,
apple-touch-icon.png (180), favicon-32.png, favicon.ico.

Das Bild: Nachthimmel mit Mond, Sternen und einer Haeuserreihe mit pinken und
goldenen Fenstern - die Farben des Spiels (Rosa #ff3d8b, Gold #ffd447).
Alles wird aus einer Pixeltabelle gezeichnet, also bleibt es kantenscharf und
laesst sich hier an einer Stelle aendern. Braucht Pillow (pip install pillow).
"""
import os
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
    print('Symbole geschrieben nach', ziel)
