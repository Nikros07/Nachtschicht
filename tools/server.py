# -*- coding: utf-8 -*-
"""Kleiner Testserver fuer NACHTSCHICHT - ohne Cache, optional im WLAN.

  python tools/server.py            nur dieser Rechner, http://127.0.0.1:5173
  python tools/server.py --lan      auch Handy im selben WLAN (Adresse wird angezeigt)
  python tools/server.py 5180       anderer Port

Warum nicht `python -m http.server`: der schickt Dateien ohne Cache-Verbot, und
Browser halten dann alte Engine-Dateien fest. Beim Testen am Handy ist das
tueckisch - man sieht die alte Steuerung und haelt sie fuer die neue.
Hier steht an jeder Antwort `Cache-Control: no-store`.

Am Handy: Handy und Rechner im selben WLAN, die angezeigte Adresse im Browser
oeffnen. Windows fragt beim ersten Start nach der Firewall - "Privat" erlauben.
"""
import http.server, os, socket, sys

args = [a for a in sys.argv[1:] if not a.startswith('--')]
LAN = '--lan' in sys.argv
PORT = int(args[0]) if args else 5173
WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class OhneCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()

    def log_message(self, fmt, *a):
        if '--leise' not in sys.argv:
            super().log_message(fmt, *a)


def lan_adresse():
    """Die Adresse, unter der der Rechner im WLAN erreichbar ist."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))   # es wird nichts gesendet
        return s.getsockname()[0]
    except OSError:
        return None
    finally:
        s.close()


if __name__ == '__main__':
    os.chdir(WURZEL)
    host = '0.0.0.0' if LAN else '127.0.0.1'
    server = http.server.ThreadingHTTPServer((host, PORT), OhneCache)
    print('NACHTSCHICHT-Testserver (ohne Cache)')
    print('  Rechner:  http://127.0.0.1:%d/' % PORT)
    if LAN:
        ip = lan_adresse()
        if ip:
            print('  Handy:    http://%s:%d/   (selbes WLAN)' % (ip, PORT))
            print('  Handy mit Touch-Test am Rechner: http://127.0.0.1:%d/?touch=1' % PORT)
        else:
            print('  Keine WLAN-Adresse gefunden.')
    print('Beenden mit Strg+C')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nBeendet.')
