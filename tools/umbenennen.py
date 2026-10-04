# -*- coding: utf-8 -*-
"""Tauscht die Platzhalter-Namen der Crew gegen andere aus - ohne zehn Dateien von Hand anzufassen.

  python tools/umbenennen.py JONAS=BEN "MAX FERDI"=MAX          nur VORSCHAU, nichts wird geaendert
  python tools/umbenennen.py JONAS=BEN "MAX FERDI"=MAX --ja     wirklich ersetzen
  python tools/umbenennen.py --zurueck                          die letzte Aenderung rueckgaengig machen
  python tools/umbenennen.py --sicherung-loeschen               die Sicherung wegwerfen (Aenderung bleibt)

Weitere Schalter:
  --nur-gross        nur die GROSSgeschriebenen Namen ersetzen (so stehen sie auf dem Bild),
                     nicht Name/name - falls ein alter Name zugleich ein ganz normales Wort ist
  --ohne-pruefung    die Probe mit tools/pruefe.js ueberspringen (nur wenn Node.js fehlt)
  --erzwingen        mit --zurueck: auch Dateien zuruecksetzen, die seitdem noch einmal geaendert wurden

Was ersetzt wird: jeder Name als GANZES Wort, in drei Schreibweisen - JONAS, Jonas, jonas -
und mit angehaengtem Genitiv-s (FERDIS, Finns). Das steht in den Seiten (index.html, level*.html,
karte.html, runner.html, ueber.html ...) und in nacht/*.js (z. B. nacht/handy.js). Es ersetzt
NICHT innerhalb zusammengesetzter Namen: moritzDabei, jonasDabei, traumMoritz, JONAS_X bleiben
(Flag- und Variablennamen duerfen nie wandern, sonst reisst eine Entscheidung ab). Es ersetzt
auch nicht in Kommentaren, Adressen, Dateinamen und langen Daten-Zeichenketten. Nie angefasst:
docs/, tools/, test/, routinen/, alle *.md.

Warum alle Fundstellen mit: Schluessel wie  crew:'JONAS'  und  mag:['JONAS',3]  sind Zeichenketten
und wandern deshalb mit - und zwar ueberall gleich, auch  SPR.moritz  gegen  id==='moritz'. Wo ein
Name als Bezeichner im Code steht, muss der Ersatz ein gueltiger Bezeichner sein (nur A-Z, 0-9, _);
sonst bricht das Werkzeug ab und sagt die Stelle.

Namen mit Leerzeichen gehen: "MAX FERDI"=MAX. Wer eine Figur auch kurz anspricht (FERDIS SPIND),
gibt das als eigenes Paar an: FERDI=MAX. Die Vorschau weist auf solche Kurzformen hin.

Umlaute und Sonderzeichen im neuen Namen (z. B. JOERG oder JÖRG): die Schrift auf dem Bild
kann nur A-Z 0-9 . : - ! ? / + , < > * % ( ) ' " - darum wird in Skripten AE/OE/UE/SS (ae/oe/ue/ss)
geschrieben. Im HTML-Text bleiben die Umlaute stehen.

Sicherheit: vor dem Schreiben wird eine Kopie des Projekts mit den neuen Texten angelegt und dort
`node tools/pruefe.js` ausgefuehrt; ist die rot, wird nichts geschrieben. Die Originale landen in
.umbenennen-sicherung.json (steht in .gitignore); --zurueck holt sie wieder. Mehrere Umbenennungen
nacheinander gehen: --zurueck springt dann auf den Stand VOR der ersten. Nach dem Schreiben laeuft
tools/version.py (neuer Offline-Stempel, sonst sehen Spieler, die schon einmal da waren, die neuen Namen nie).

Gespeicherte Spielstaende: eine Nacht, die unter dem alten Namen begonnen wurde, kennt den Namen
noch (Crew-Liste im Browserspeicher). Nach dem Umbenennen eine neue Nacht beginnen.
"""
import glob
import hashlib
import io
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import unicodedata

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(errors='replace')     # Umlaute in einer alten Konsole duerfen nie abstuerzen lassen

WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SICHERUNG = os.path.join(WURZEL, '.umbenennen-sicherung.json')
CANVAS_ZEICHEN = set("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .:-!?/+,<>*%()'\"")   # nacht/bild.js
URL_ATTRIBUTE = {'src', 'href', 'srcset', 'action', 'poster', 'data', 'manifest', 'formaction', 'cite',
                 'longdesc', 'background', 'icon', 'xmlns'}
KENNUNG_ATTRIBUTE = {'id', 'class', 'for', 'name', 'aria-labelledby', 'aria-controls', 'aria-describedby', 'list', 'headers'}
REGEX_VORHER = {'return', 'typeof', 'case', 'in', 'of', 'delete', 'void', 'throw', 'new', 'else', 'do',
                'instanceof', 'yield', 'await'}
DATEI_ENDUNG = re.compile(r'^[\w\-./?=&#:%~+]*\.(html|png|jpe?g|gif|svg|webp|ico|mp3|ogg|wav|m4a|json|webmanifest|css|js|woff2?|ttf)(\?.*)?$', re.I)
UMLAUT_GROSS = {'Ä': 'AE', 'Ö': 'OE', 'Ü': 'UE', 'ẞ': 'SS', 'ß': 'SS'}
UMLAUT_KLEIN = {'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue', 'ẞ': 'Ss', 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss'}


def sag(text=''):
    print(text)


def abbruch(text, code=1):
    print('FEHLER: ' + text)
    sys.exit(code)


def lies(pfad):
    with io.open(pfad, encoding='utf-8', newline='') as f:     # newline='': CRLF/LF bleiben, wie sie sind
        return f.read()


def schreibe(pfad, text):
    with io.open(pfad, 'w', encoding='utf-8', newline='') as f:
        f.write(text)


def rel(pfad):
    return os.path.relpath(pfad, WURZEL).replace(os.sep, '/')


def stempelfrei(text):
    """Fuer den Vergleich nach version.py: die Stempel (?v=..., GERAET.build) zaehlen nicht."""
    text = re.sub(r'\?v=\d+', '?v=0', text)
    return re.sub(r'(GERAET\.build=")[^"]*(")', r'\1\2', text)


def pruefsumme(text):
    return hashlib.sha256(stempelfrei(text).encode('utf-8')).hexdigest()


# ---------------------------------------------------------------------------
# Zerlegen: JavaScript (Code / Zeichenkette / Kommentar), HTML (Text / Tag / Skript / Stil)
# ---------------------------------------------------------------------------

def zerlege_js(q):
    """[(art, text, quote, offset)] mit art 'code', 'text' oder 'komm'; zusammengesetzt ergibt es wieder q.
    Regex-Literale erkennt es an dem, was davor steht (Name oder ")" davor = Division)."""
    n = len(q)
    out = []
    i = 0
    code_von = 0

    def gib(art, von, bis, quote=None):
        bis = min(bis, n)
        if bis > von:
            out.append((art, q[von:bis], quote, von))

    def ueberspringe_text(start, quote):
        j = start
        while j < n:
            c = q[j]
            if c == '\\':
                j += 2
                continue
            if c == quote:
                return j + 1
            if quote != '`' and c == '\n':
                return j
            if quote == '`' and c == '$' and q[j + 1:j + 2] == '{':
                j = ueberspringe_ausdruck(j + 2)
                continue
            j += 1
        return n

    def ueberspringe_ausdruck(start):
        tiefe = 1
        j = start
        while j < n and tiefe > 0:
            c = q[j]
            if c == '{':
                tiefe += 1
            elif c == '}':
                tiefe -= 1
            elif c in '\'"`':
                j = ueberspringe_text(j + 1, c)
                continue
            j += 1
        return j

    while i < n:
        c = q[i]
        d = q[i + 1] if i + 1 < n else ''
        if c == '/' and d == '/':
            gib('code', code_von, i)
            j = q.find('\n', i)
            j = n if j < 0 else j
            gib('komm', i, j)
            i = code_von = j
            continue
        if c == '/' and d == '*':
            gib('code', code_von, i)
            j = q.find('*/', i + 2)
            j = n if j < 0 else j + 2
            gib('komm', i, j)
            i = code_von = j
            continue
        if c in '\'"`':
            gib('code', code_von, i)
            j = ueberspringe_text(i + 1, c)
            gib('text', i, j, c)
            i = code_von = j
            continue
        if c == '/':
            k = i - 1
            while k >= 0 and q[k].isspace():
                k -= 1
            vz = q[k] if k >= 0 else ''
            wort = ''
            if vz and (vz.isalpha() or vz in '_$'):
                s = k
                while s > 0 and (q[s - 1].isalnum() or q[s - 1] in '_$'):
                    s -= 1
                wort = q[s:k + 1]
            division = bool(vz) and (vz.isalnum() or vz in '_$)]') and wort not in REGEX_VORHER
            if not division:
                j = i + 1
                klasse = False
                while j < n and q[j] != '\n':
                    e = q[j]
                    if e == '\\':
                        j += 2
                        continue
                    if e == '[':
                        klasse = True
                    elif e == ']':
                        klasse = False
                    elif e == '/' and not klasse:
                        break
                    j += 1
                if j < n and q[j] == '/':
                    j += 1
                    while j < n and q[j].isalpha():
                        j += 1
                    i = j
                    continue
        i += 1
    gib('code', code_von, n)
    return out


def daten_artig(s):
    """Zeichenketten, die keine Spieltexte sind: Adressen, Dateinamen, base64-/Daten-Blobs."""
    inhalt = s[1:-1] if len(s) > 1 else s
    if len(inhalt) >= 64 and not re.search(r'\s', inhalt):
        return True
    if inhalt.startswith(('data:', 'http:', 'https:', '//')):
        return True
    return bool(DATEI_ENDUNG.match(inhalt))


HTML_TEIL = re.compile(r'<!--.*?-->|<script\b[^>]*>.*?</script\s*>|<style\b[^>]*>.*?</style\s*>|<[^>]*>', re.S | re.I)
ATTR = re.compile(r'(\s)([^\s"\'<>/=]+)(\s*=\s*)("([^"]*)"|\'([^\']*)\')')


# ---------------------------------------------------------------------------
# Ein Namenspaar: Formen in jedem Zusammenhang
# ---------------------------------------------------------------------------

def umlaute_weg(text, gross):
    """Ae/Oe/Ue/ss statt Umlaut; andere Akzente fallen weg (e statt e mit Akzent)."""
    tabelle = UMLAUT_GROSS if gross else UMLAUT_KLEIN
    text = ''.join(tabelle.get(ch, ch) for ch in text)
    zerlegt = unicodedata.normalize('NFKD', text)
    return ''.join(ch for ch in zerlegt if not unicodedata.combining(ch))


def titelschreibung(wort):
    return ' '.join(w[:1].upper() + w[1:].lower() for w in wort.split(' '))


class Paar:
    def __init__(self, nr, alt, neu):
        self.nr = nr
        self.alt = alt.strip()
        self.neu = neu.strip()
        self.formen = {}          # (art, klasse) -> Text; art: 'html' | 'js' | 'code'
        self.problem = []
        roh = self.neu
        # Wie der Name getippt wurde, ist ein Wunsch ("Jörn"), aber auf dem Bild steht er immer in Grossbuchstaben.
        gemischt = roh != roh.upper() and roh != roh.lower()
        html = {'gross': roh.upper(), 'titel': roh if gemischt else titelschreibung(roh), 'klein': roh.lower()}
        js = {'gross': umlaute_weg(html['gross'], True), 'titel': umlaute_weg(html['titel'], False),
              'klein': umlaute_weg(html['klein'], False)}
        for k in html:
            self.formen[('html', k)] = html[k]
            self.formen[('js', k)] = js[k]
            self.formen[('code', k)] = js[k]
        # Prueft: nur Zeichen, die ein Name haben darf und die die Schrift des Spiels kann
        if not self.neu:
            self.problem.append('der neue Name ist leer')
        for ch in self.neu:
            if not (ch.isalnum() or ch in " .'-"):
                self.problem.append('Zeichen "%s" ist in einem Namen nicht erlaubt (nur Buchstaben, Ziffern, Leerzeichen, . \' -)' % ch)
                break
        if '  ' in self.neu or self.neu != self.neu.strip():
            self.problem.append('doppelte oder ueberzaehlige Leerzeichen im neuen Namen')
        fremd = sorted({ch for ch in js['gross'] if ch not in CANVAS_ZEICHEN})
        if fremd:
            self.problem.append('die Schrift auf dem Bild kann %s nicht' % ' '.join('"%s"' % c for c in fremd))
        self.umlaut_hinweis = [ch for ch in self.neu if ch in 'ÄÖÜäöüßẞ' or unicodedata.normalize('NFKD', ch) != ch]

    def muster(self):
        woerter = [re.escape(w) for w in self.alt.split(' ') if w]
        return r'(?:[ \u00a0]|&nbsp;)'.join(woerter)


def klasse_von(text):
    if text == text.lower():
        return 'klein'
    if text == text.upper():
        return 'gross'
    return 'titel'


# ---------------------------------------------------------------------------
# Der Durchlauf
# ---------------------------------------------------------------------------

class Lauf:
    """modus: 'ersetzen' (neue Texte), 'maskieren' (Treffer durch Leerzeichen ersetzen, fuer die Kurzform-Suche)."""

    def __init__(self, paare, nur_gross=False, modus='ersetzen'):
        self.paare = sorted(paare, key=lambda p: -len(p.alt))      # lange Namen zuerst: "MAX FERDI" vor "MAX"
        self.nur_gross = nur_gross
        self.modus = modus
        teile = ['(?P<p%d>%s)' % (p.nr, p.muster()) for p in self.paare]
        # Wort-Anfang: kein Buchstabe davor - ausser nach einem Escape wie \n (in 'DU:\nMORITZ' steht "n" davor)
        anfang = r'(?:(?<!\w)|(?<=\\n)|(?<=\\t)|(?<=\\r))'
        koerper = '(?:' + '|'.join(teile) + ')'
        self.mit_gen = re.compile(anfang + koerper + r'(?P<gen>[sS])?(?!\w)', re.I)
        self.ohne_gen = re.compile(anfang + koerper + r'(?!\w)', re.I)
        self.nach_nr = {p.nr: p for p in paare}
        self.treffer = []                 # dicts: rel, offset, paar, gefunden, ersatz, art
        self.komm = {p.nr: 0 for p in paare}
        self.fehler = []
        self.texte = {}
        self.aktuell = ''

    def _ersatz(self, m, art, quote):
        nr = next(p.nr for p in self.paare if m.group('p%d' % p.nr) is not None)
        paar = self.nach_nr[nr]
        gefunden = m.group('p%d' % nr)
        klasse = klasse_von(gefunden)
        if self.nur_gross and klasse != 'gross':
            return None, paar
        neu = paar.formen[(art, klasse)]
        if art == 'code' and not re.fullmatch(r'[A-Za-z_$][\w$]*', neu):
            return ('FEHLER', paar), paar
        gen = m.groupdict().get('gen')
        if gen:
            # Genitiv: Max' / Moritz' (nach s, x, z) sonst Ben+s; die Gross-/Kleinschreibung des s folgt dem Namen
            if neu[-1].lower() in 'sxzß':
                neu += "'"
            else:
                neu += 'S' if klasse == 'gross' else 's'
        if art == 'js' and quote == "'":
            neu = neu.replace("'", "\\'")
        if art == 'html' and quote == "'":
            neu = neu.replace("'", '&#39;')
        return neu, paar

    def ersetze(self, text, art, basis, quote=None):
        """Ersetzt in einem Stueck Text. art: 'html' (Text, Umlaute ok), 'js' (Zeichenkette), 'code' (Bezeichner)."""
        regex = self.ohne_gen if art == 'code' else self.mit_gen
        rel_ = self.aktuell
        out = []
        pos = 0
        for m in regex.finditer(text):
            erg, paar = self._ersatz(m, art, quote)
            gefunden = m.group(0)
            if erg is None:
                continue
            if isinstance(erg, tuple):
                self.fehler.append('%s:%d: "%s" steht hier als Bezeichner im Code, der Ersatz "%s" ist keiner (nur A-Z, 0-9, _)'
                                   % (rel_, self._zeile(basis + m.start()), gefunden, paar.neu))
                continue
            if self.modus == 'maskieren':
                erg = ' ' * len(gefunden)
            else:
                self.treffer.append({'rel': rel_, 'offset': basis + m.start(), 'paar': paar.nr, 'gefunden': gefunden,
                                     'ersatz': erg, 'art': art, 'laenge': len(gefunden)})
            out.append(text[pos:m.start()])
            out.append(erg)
            pos = m.end()
        out.append(text[pos:])
        return ''.join(out)

    def _zeile(self, offset):
        return self.texte.get(self.aktuell, '')[:offset].count('\n') + 1

    def komm_stueck(self, text):
        """Kommentare bleiben unveraendert, ihre Treffer werden nur gezaehlt. Beim Maskieren werden sie
        trotzdem ausgeblendet, damit "Max" in einem Kommentar nicht als vorhandener Name gilt."""
        for m in self.ohne_gen.finditer(text):
            nr = next(p.nr for p in self.paare if m.group('p%d' % p.nr) is not None)
            self.komm[nr] += 1
        if self.modus == 'maskieren':
            return self.ohne_gen.sub(lambda m: ' ' * len(m.group(0)), text)
        return text

    # --- JavaScript
    def js(self, text, basis=0):
        teile = []
        for art, s, quote, off in zerlege_js(text):
            if art == 'komm':
                teile.append(self.komm_stueck(s))
            elif art == 'text':
                teile.append(s if daten_artig(s) else self.ersetze(s, 'js', basis + off, quote))
            else:
                teile.append(self.ersetze(s, 'code', basis + off))
        return ''.join(teile)

    # --- Stil: Kommentare und Zeichenketten getrennt, der Rest sind Bezeichner
    def css(self, text, basis=0):
        teile = []
        pos = 0
        for m in re.finditer(r'/\*.*?\*/|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'', text, re.S):
            if m.start() > pos:
                teile.append(self.ersetze(text[pos:m.start()], 'code', basis + pos))
            t = m.group(0)
            if t.startswith('/*'):
                teile.append(self.komm_stueck(t))
            else:
                teile.append(t if daten_artig(t) else self.ersetze(t, 'js', basis + m.start(), t[0]))
            pos = m.end()
        teile.append(self.ersetze(text[pos:], 'code', basis + pos))
        return ''.join(teile)

    # --- Tag: nur Werte von Attributen, und nur die, die Text oder Kennungen sind
    def tag(self, t, basis):
        def f(m):
            name = m.group(2).lower()
            wert = m.group(5) if m.group(5) is not None else m.group(6)
            quote = '"' if m.group(5) is not None else "'"
            start = basis + m.start(4) + 1
            if name == 'href' and '#' in wert:
                # Dateiname bleibt, aber der Anker (#jonas) wandert mit - er zeigt auf eine id, die mitwandert
                vorn, _, anker = wert.partition('#')
                neu = vorn + '#' + self.ersetze(anker, 'code', start + len(vorn) + 1)
            elif name in URL_ATTRIBUTE:
                neu = wert
            elif name.startswith('on'):
                neu = self.js(wert, start)                    # Ereignis-Attribut = JavaScript
            elif name in KENNUNG_ATTRIBUTE or name.startswith('data-') or name == 'href':
                neu = self.ersetze(wert, 'code', start)
            else:
                neu = self.ersetze(wert, 'html', start, quote)
            return m.group(1) + m.group(2) + m.group(3) + quote + neu + quote
        return ATTR.sub(f, t)

    # --- HTML-Datei
    def html(self, text):
        teile = []
        pos = 0
        for m in HTML_TEIL.finditer(text):
            if m.start() > pos:
                teile.append(self.ersetze(text[pos:m.start()], 'html', pos))
            t = m.group(0)
            low = t[:8].lower()
            if t.startswith('<!--'):
                teile.append(self.komm_stueck(t))
            elif low.startswith('<script'):
                offen = re.match(r'<script\b[^>]*>', t, re.I).group(0)
                ende = t.lower().rfind('</script')
                teile.append(self.tag(offen, m.start()))
                teile.append(self.js(t[len(offen):ende], m.start() + len(offen)))
                teile.append(t[ende:])
            elif low.startswith('<style'):
                offen = re.match(r'<style\b[^>]*>', t, re.I).group(0)
                ende = t.lower().rfind('</style')
                teile.append(self.tag(offen, m.start()))
                teile.append(self.css(t[len(offen):ende], m.start() + len(offen)))
                teile.append(t[ende:])
            else:
                teile.append(self.tag(t, m.start()))
            pos = m.end()
        if pos < len(text):
            teile.append(self.ersetze(text[pos:], 'html', pos))
        return ''.join(teile)

    def datei(self, rel_, text):
        self.aktuell = rel_
        self.texte[rel_] = text
        return self.html(text) if rel_.endswith('.html') else self.js(text)


# ---------------------------------------------------------------------------
# Ablauf
# ---------------------------------------------------------------------------

def projektdateien():
    """Genau diese Dateien duerfen sich aendern: Seiten im Wurzelordner und nacht/*.js."""
    dateien = sorted(glob.glob(os.path.join(WURZEL, '*.html'))) + sorted(glob.glob(os.path.join(WURZEL, 'nacht', '*.js')))
    return [rel(p) for p in dateien]


def parse_paare(args):
    paare = []
    gesehen = set()
    for a in args:
        if '=' not in a:
            abbruch('"%s" ist kein Paar. Form: ALT=NEU, bei Leerzeichen in Anfuehrungszeichen: "MAX FERDI"=MAX' % a)
        alt, neu = a.split('=', 1)
        alt, neu = alt.strip(), neu.strip()
        if not alt:
            abbruch('"%s": der alte Name fehlt.' % a)
        if alt.upper() in gesehen:
            abbruch('"%s" steht zweimal als alter Name.' % alt)
        gesehen.add(alt.upper())
        if alt.upper() == neu.upper() and alt != neu:
            sag('Hinweis: %s=%s aendert nur die Schreibweise - Name/name werden angepasst, GROSS bleibt gleich.' % (alt, neu))
        paare.append(Paar(len(paare), alt, neu))
    return paare


def snippet(text, offset, laenge, gefunden, ersatz):
    vor = text[max(0, offset - 28):offset]
    nach = text[offset + laenge:offset + laenge + 28]
    s = '%s<<%s => %s>>%s' % (vor, gefunden, ersatz, nach)
    return re.sub(r'\s+', ' ', s).strip()


def zeige_vorschau(paare, lauf, kurzformen, andere):
    sag('Vorschau' + (' (es wird noch nichts geaendert)' if '--ja' not in sys.argv else ''))
    gesamt = len(lauf.treffer)
    dateien = sorted({t['rel'] for t in lauf.treffer})
    for p in paare:
        eig = [t for t in lauf.treffer if t['paar'] == p.nr]
        sag('')
        sag('%s -> %s' % (p.alt, p.neu))
        if '--nur-gross' in sys.argv:
            sag('  Schreibweise: %s -> %s   (nur GROSS, wie auf dem Bild; in Skripten: %s)' % (
                p.alt.upper(), p.formen[('html', 'gross')], p.formen[('js', 'gross')]))
        else:
            sag('  Schreibweisen: %s -> %s, %s -> %s, %s -> %s   (in Skripten: %s)' % (
                p.alt.upper(), p.formen[('html', 'gross')], titelschreibung(p.alt), p.formen[('html', 'titel')],
                p.alt.lower(), p.formen[('html', 'klein')], p.formen[('js', 'gross')]))
        code = [t for t in eig if t['art'] == 'code']
        sag('  Treffer:  %d in %d Dateien (davon %d als Bezeichner im Code); %d in Kommentaren bleiben unveraendert'
            % (len(eig), len({t['rel'] for t in eig}), len(code), lauf.komm[p.nr]))
        je_datei = {}
        for t in eig:
            je_datei[t['rel']] = je_datei.get(t['rel'], 0) + 1
        for d in sorted(je_datei):
            sag('    %-20s %d' % (d, je_datei[d]))
        if len(p.alt) < 3:
            sag('  ACHTUNG: ein sehr kurzer Name - Zufallstreffer in normalen Woertern sind moeglich, Beispiele genau ansehen.')
        proben = eig[:2]
        rest = [t for t in eig[2:] if t['art'] == 'code']
        proben += rest[:1] if rest else eig[2:3]
        if proben:
            sag('  Beispiele:')
            for t in proben:
                text = lauf.texte[t['rel']]
                zeile = text[:t['offset']].count('\n') + 1
                sag('    %s:%d  %s' % (t['rel'], zeile, snippet(text, t['offset'], t['laenge'], t['gefunden'], t['ersatz'])))
        else:
            sag('  Keine Treffer.')
        for h in p.umlaut_hinweis[:1]:
            sag('  Hinweis: Umlaut/Sonderzeichen im Namen - auf dem Bild (in Skripten) wird daraus %s / %s / %s, im HTML-Text bleibt "%s".'
                % (p.formen[('js', 'gross')], p.formen[('js', 'titel')], p.formen[('js', 'klein')], p.neu))
        if p.alt.lower()[-1:] in 'sxz' and p.neu.lower()[-1:] not in 'sxz' and p.neu:
            sag('  Hinweis: Genitiv: Wo der alte Name auf s/x/z endete, steht im Text ein Apostroph (%s\'); beim neuen Namen gehoert dort ein s hin - nachlesen.' % p.alt)
        if p.alt.lower()[-1:] not in 'sxz' and p.neu.lower()[-1:] in 'sxz':
            sag('  Hinweis: Genitiv: aus "%ss" wird "%s\'" - so schreibt man es nach s/x/z.' % (p.alt, p.neu))
    if kurzformen:
        sag('')
        sag('Kurzformen, die NICHT mit ersetzt werden (nicht im Paar genannt):')
        for wort, anzahl, bsp in kurzformen:
            sag('  %s: %d Treffer, z. B. %s' % (wort, anzahl, bsp))
        sag('  -> falls auch diese Namen wandern sollen, als eigenes Paar angeben, z. B. FERDI=NEU.')
    if andere:
        sag('')
        sag('Nicht angefasst (docs/, tools/, test/, *.md), steht dort aber noch:')
        for datei, n in andere[:8]:
            sag('  %-28s %d' % (datei, n))
        if len(andere) > 8:
            sag('  ... und %d weitere Dateien' % (len(andere) - 8))
    sag('')
    sag('Gesamt: %d Ersetzungen in %d Dateien.' % (gesamt, len(dateien)))


def maskierte_texte(paare, alt_texte, nur_gross):
    """Die Texte, in denen alle Treffer der Paare durch Leerzeichen ersetzt sind (Kommentare bleiben stehen).
    Damit lassen sich Dinge suchen, die NEBEN den gemeinten Namen stehen."""
    maske = Lauf(paare, nur_gross, 'maskieren')
    return {r: maske.datei(r, t) for r, t in alt_texte.items()}


def kurzformen_suchen(paare, maskiert):
    """Einzelwoerter mehrteiliger Namen ("FERDI" aus "MAX FERDI"), die ohne den ganzen Namen vorkommen."""
    mehrteilig = [p for p in paare if ' ' in p.alt]
    if not mehrteilig:
        return []
    ergebnis = []
    woerter = []
    for p in mehrteilig:
        for w in p.alt.split(' '):
            if len(w) >= 3 and w.upper() not in {x.alt.upper() for x in paare} and w.upper() not in woerter:
                woerter.append(w.upper())
    if not woerter:
        return []
    for w in woerter:
        probe = Lauf([Paar(0, w, w)], False, 'ersetzen')
        for r, t in maskiert.items():
            probe.datei(r, t)
        probe.treffer = [t for t in probe.treffer if t['gefunden'] != t['gefunden'].lower()]   # "max(" in CSS ist kein Name
        if probe.treffer:
            t0 = probe.treffer[0]
            ergebnis.append((w, len(probe.treffer), snippet(probe.texte[t0['rel']], t0['offset'], t0['laenge'], t0['gefunden'], t0['gefunden']) + '  [' + t0['rel'] + ']'))
    return ergebnis


def andere_dateien(paare):
    """Alte Namen in Dateien, die dieses Werkzeug nicht anfasst (nur zum Hinweisen)."""
    muster = re.compile(r'(?<!\w)(?:' + '|'.join(p.muster() for p in paare) + r')(?!\w)', re.I)
    kandidaten = glob.glob(os.path.join(WURZEL, '*.md')) + glob.glob(os.path.join(WURZEL, 'docs', '**', '*.md'), recursive=True)
    kandidaten += glob.glob(os.path.join(WURZEL, 'tools', '*.js')) + glob.glob(os.path.join(WURZEL, 'tools', '*.py'))
    kandidaten += glob.glob(os.path.join(WURZEL, 'test', '*.js')) + glob.glob(os.path.join(WURZEL, 'nacht', '*.css'))
    ergebnis = []
    for p in kandidaten:
        if os.path.basename(p) == os.path.basename(__file__):
            continue
        try:
            n = len(muster.findall(lies(p)))
        except (OSError, UnicodeDecodeError):
            continue
        if n:
            ergebnis.append((rel(p), n))
    ergebnis.sort(key=lambda x: -x[1])
    return ergebnis


def node_da():
    try:
        subprocess.run(['node', '--version'], capture_output=True, check=True)
        return True
    except (OSError, subprocess.CalledProcessError):
        return False


def probe_in_kopie(neue_texte):
    """Legt eine Kopie des Projekts mit den neuen Texten an und laesst dort tools/pruefe.js laufen.
    So bleibt das echte Projekt unberuehrt, falls etwas nicht mehr zusammenpasst."""
    tmp = tempfile.mkdtemp(prefix='umbenennen-')
    ziel = os.path.join(tmp, 'p')
    try:
        shutil.copytree(WURZEL, ziel, ignore=shutil.ignore_patterns(
            '.git', 'dist', 'node_modules', 'fotos', 'docs', 'routinen', '.claude', '__pycache__', '.umbenennen-sicherung.json'))
        for r, t in neue_texte.items():
            schreibe(os.path.join(ziel, r), t)
        r = subprocess.run(['node', 'tools/pruefe.js'], cwd=ziel, capture_output=True, text=True,
                           encoding='utf-8', errors='replace')
        return r.returncode, (r.stdout + r.stderr)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def version_stempeln():
    skript = os.path.join(WURZEL, 'tools', 'version.py')
    if not os.path.isfile(skript):
        sag('Hinweis: tools/version.py fehlt - bitte die Engine-Version von Hand neu stempeln.')
        return
    r = subprocess.run([sys.executable, skript], cwd=WURZEL, capture_output=True, text=True, encoding='utf-8', errors='replace')
    sag('tools/version.py: ' + (r.stdout.strip().splitlines() or ['(keine Ausgabe)'])[-1])
    if r.returncode != 0:
        sag('WARNUNG: tools/version.py meldet einen Fehler: ' + (r.stderr.strip() or r.stdout.strip())[:300])


def sicherung_laden():
    if not os.path.isfile(SICHERUNG):
        return None
    with io.open(SICHERUNG, encoding='utf-8') as f:
        return json.load(f)


def sicherung_schreiben(daten):
    with io.open(SICHERUNG, 'w', encoding='utf-8') as f:
        json.dump(daten, f, ensure_ascii=False)


def zurueck():
    s = sicherung_laden()
    if not s:
        abbruch('Es gibt keine Sicherung (.umbenennen-sicherung.json) - nichts rueckgaengig zu machen.')
    erzwingen = '--erzwingen' in sys.argv
    zurueckgesetzt, uebersprungen = [], []
    for r, eintrag in sorted(s['dateien'].items()):
        pfad = os.path.join(WURZEL, r)
        aktuell = lies(pfad) if os.path.isfile(pfad) else None
        if aktuell is not None and pruefsumme(aktuell) != eintrag['nachher'] and not erzwingen:
            uebersprungen.append(r)
            continue
        schreibe(pfad, eintrag['vorher'])
        zurueckgesetzt.append(r)
    for r in zurueckgesetzt:
        sag('zurueck: ' + r)
    if uebersprungen:
        sag('')
        sag('NICHT zurueckgesetzt (seit dem Umbenennen noch einmal geaendert - sonst ginge diese Arbeit verloren):')
        for r in uebersprungen:
            sag('  ' + r)
        sag('Mit --erzwingen werden sie trotzdem auf den alten Stand gesetzt.')
        for r in zurueckgesetzt:
            del s['dateien'][r]
        sicherung_schreiben(s)
    else:
        os.remove(SICHERUNG)
    if zurueckgesetzt:
        version_stempeln()
        sag('')
        sag('Fertig: %d Dateien zurueckgesetzt.' % len(zurueckgesetzt))
    return 1 if uebersprungen else 0


def main():
    args = sys.argv[1:]
    if not args or '--hilfe' in args or '-h' in args:
        print(__doc__)
        return 0
    if '--sicherung-loeschen' in args:
        if os.path.isfile(SICHERUNG):
            os.remove(SICHERUNG)
            sag('Sicherung geloescht - die Umbenennung ist jetzt endgueltig (nur noch ueber git zurueckzunehmen).')
        else:
            sag('Es gab keine Sicherung.')
        return 0
    if '--zurueck' in args:
        return zurueck()
    nur_gross = '--nur-gross' in args
    ja = '--ja' in args
    paare = parse_paare([a for a in args if not a.startswith('--')])
    if not paare:
        abbruch('Kein Namenspaar angegeben. Beispiel: python tools/umbenennen.py JONAS=BEN "MAX FERDI"=MAX')
    probleme = [(p, m) for p in paare for m in p.problem]
    if probleme:
        for p, m in probleme:
            sag('FEHLER bei %s=%s: %s' % (p.alt, p.neu, m))
        return 1
    # Zwei Paare mit demselben neuen Namen sind richtig, wenn es Lang- und Kurzform EINER Figur ist
    # ("MAX FERDI" und FERDI), und falsch, wenn zwei Figuren so verschmelzen. Das Werkzeug kann es nicht
    # unterscheiden - es sagt es nur.
    neu_namen = {}
    for p in paare:
        neu_namen.setdefault(p.neu.upper(), []).append(p.alt)
    for n, alte in neu_namen.items():
        if len(alte) > 1:
            sag('Hinweis: %s sollen alle %s heissen. Richtig bei Lang- und Kurzform EINER Figur, sonst verschmelzen zwei Figuren.' % (' und '.join(alte), n))

    alt_texte = {r: lies(os.path.join(WURZEL, r)) for r in projektdateien()}
    lauf = Lauf(paare, nur_gross)
    neue = {}
    for r, t in alt_texte.items():
        n = lauf.datei(r, t)
        if n != t:
            neue[r] = n
    if lauf.fehler:
        sag('Abbruch - es wird nichts geaendert:')
        for f in lauf.fehler[:12]:
            sag('  ' + f)
        if len(lauf.fehler) > 12:
            sag('  ... und %d weitere' % (len(lauf.fehler) - 12))
        sag('Loesung: einen Ersatz waehlen, der als Bezeichner geht (ohne Leerzeichen/Bindestrich), oder die Stelle von Hand aendern.')
        return 1

    # Warnung: der neue Name steht schon im Spiel (nur Gross- und Titelschreibung, kleine Woerter waeren zu laut).
    # Gesucht wird in den maskierten Texten: das "MAX" aus "MAX FERDI" zaehlt nicht, es wird ja ersetzt.
    maskiert = maskierte_texte(paare, alt_texte, nur_gross)
    schon_gemeldet = set()
    for p in paare:
        if p.neu.upper() in {q.alt.upper() for q in paare} or p.neu.upper() in schon_gemeldet:
            continue
        schon_gemeldet.add(p.neu.upper())
        schon = re.compile(r'(?<!\w)(?:%s|%s)(?!\w)' % (re.escape(p.formen[('html', 'gross')]), re.escape(p.formen[('html', 'titel')])))
        funde = [(r, m) for r, t in maskiert.items() for m in schon.finditer(t)]
        if funde:
            r0, m0 = funde[0]
            t0 = maskiert[r0]
            sag('WARNUNG: "%s" steht schon %d-mal im Spiel, z. B. %s:%d  %s' % (
                p.neu, len(funde), r0, t0[:m0.start()].count(chr(10)) + 1,
                re.sub(r'\s+', ' ', t0[max(0, m0.start() - 25):m0.end() + 25]).strip()))
            sag('         Heisst dort eine andere Figur so, verschmelzen die beiden. Ist es ein gewoehnliches Wort (MAX 3 TREFFER), ist es harmlos.')

    kurz = kurzformen_suchen(paare, maskiert)
    zeige_vorschau(paare, lauf, kurz, andere_dateien(paare))
    if not lauf.treffer:
        sag('Nichts zu tun: keiner der alten Namen kommt vor.')
        return 0
    if not ja:
        sag('')
        sag('Das war nur die Vorschau. Zum Ersetzen denselben Befehl mit --ja wiederholen.')
        return 0

    # --- wirklich schreiben
    if '--ohne-pruefung' not in args:
        if not node_da():
            abbruch('Node.js nicht gefunden - ohne die Probe (tools/pruefe.js) wird nichts geschrieben. '
                    'Mit --ohne-pruefung auf eigene Gefahr.')
        sag('')
        sag('Probe in einer Kopie: node tools/pruefe.js ...')
        code, ausgabe = probe_in_kopie(neue)
        if code != 0:
            sag(ausgabe.strip())
            abbruch('tools/pruefe.js ist danach nicht gruen - es wurde NICHTS geschrieben.')
        sag('  gruen')
    sicherung = sicherung_laden() or {'version': 1, 'schritte': [], 'dateien': {}}
    sicherung['schritte'].append({'zeit': time.strftime('%Y-%m-%d %H:%M'), 'paare': ['%s=%s' % (p.alt, p.neu) for p in paare]})
    for r, text in neue.items():
        if r not in sicherung['dateien']:
            sicherung['dateien'][r] = {'vorher': alt_texte[r]}      # der Stand VOR der ersten Umbenennung bleibt erhalten
        sicherung['dateien'][r]['nachher'] = pruefsumme(text)
    sicherung_schreiben(sicherung)
    for r, text in neue.items():
        schreibe(os.path.join(WURZEL, r), text)
    sag('')
    sag('Geschrieben: %d Dateien, %d Ersetzungen.' % (len(neue), len(lauf.treffer)))
    version_stempeln()
    sag('')
    sag('Sicherung: .umbenennen-sicherung.json   (rueckgaengig: python tools/umbenennen.py --zurueck)')
    sag('Jetzt pruefen: node tools/nachttest.js && node test/kampf.test.js && node tools/flagcheck.js')
    sag('Zum Schluss im Browser ansehen: ?lektion=0 spart die Lernschritte. Neue Nacht beginnen, alte Spielstaende kennen den alten Namen.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
