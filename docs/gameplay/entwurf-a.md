# Entwurf A: Spielgefuehl, Rhythmus, Wertung

Stand: 2026-10-06, in Arbeit (wird fortlaufend ergaenzt).

Rein analysierender Lauf: keine Spieldatei geaendert. Eigene Messskripte unter
`docs/gameplay/messung/ea-*.js` (aus der Projektwurzel mit `node` starten).

## 0 Quellen und Vorgehen

Gelesen: `CLAUDE.md`, `ARCHITEKTUR.md`, `README.md`, `docs/gameplay/recherche-spielgefuehl.md`
(Muster A1-E1, API-Skizzen saft/musik), `recherche-vorbilder.md` (M1-M32), `recherche-store.md`
(Abschnitte 6-8), `messung-a.md` (L1-3), `messung-b.md` (L4-6), `messung-c.md` (L7, L8, Karte, Runner).

Uebernommene Kernbefunde (dort belegt, hier nur zitiert):

- Musik je Level = eine 16-Schritt-Schleife von 1,8-6,9 s, 3-11 Tonhoehen, keine Melodie/Akkorde/Abschnitte;
  in Hoehepunkten (Kampf L2, Sprint L3) sogar duenner. Notenstau-Fehler nach Pause/Karte/Handy.
- Hitstop existiert nur in `nacht/kampf.js` (`KAMPF.hitStop 0.07`, L3/4/5/8); keine Partikel ausser
  Staub in L1; Wackeln ist weisses Rauschen; Blitz immer weiss; Meldungen ohne Bewegung.
- Wertung: ueberall nur Bestzeit aus `S.zeit`, die je Level etwas anderes misst (Wartezeit in L4,
  reine Laufzeit in L5/L6, nur Wettlauf in L8). Kein Rang, keine Combo, keine Herausforderung.
- Tote/falsche Endbild-Texte in fast allen Leveln ("GERADE NOCH" immer, "LEERTASTE FUER NEUSTART"
  ausserhalb des else, Neustart vom Titel statt an der schweren Stelle).

Die Muster-Nummern der Recherchen (A1..E1, M1..M32) werden hier weiterverwendet.
