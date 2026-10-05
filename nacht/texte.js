/* ============================================================================
   NACHTSCHICHT - TEXTE
   Reine Daten: Kapitelkarten, Rueckblick-Zeilen, Polaroid-Texte, Menue.
   Alles Grossbuchstaben ohne Umlaute (Canvas), Zeilen hoechstens 44 Zeichen,
   TEXTE_BISHER-txt hoechstens 36 (Praefix 'BISHER: '). Menue ist HTML.
   ========================================================================== */

const TEXTE_KAPITEL={
  1:{zeit:'16:40',ort:'DIE SCHULE',     zeile:'DIE TUER IST ABGESCHLOSSEN.'},
  2:{zeit:'21:10',ort:'BEI MORITZ',     zeile:'MORITZ HAT AUFGERAEUMT. DAS HAT ER NOCH NIE.'},
  3:{zeit:'22:00',ort:'DER LETZTE BUS', zeile:'KEIN TICKET. EIN HUND.'},
  4:{zeit:'22:40',ort:'VOR DEM CLUB',   zeile:'ZWEIHUNDERT MENSCHEN VOR EUCH.'},
  5:{zeit:'22:50',ort:'DER CLUB',       zeile:'UM EINS GEHT DAS LICHT AN.'},
  6:{zeit:'02:00',ort:'AFTERHOUR',      zeile:'ALLE UHREN ZEIGEN 17:30.'},
  7:{zeit:'03:15',ort:'DER SPAETI',     zeile:'FUENF MINUTEN RUHE. ZUM ERSTEN MAL.'},
  8:{zeit:'04:10',ort:'DEIN HEIMWEG',   zeile:'DIE SONNE KOMMT UM 05:20.'}
};

const TEXTE_BISHER=[
  {ab:2,g:9,wenn:{flag:'hausmeisterHilft'},      txt:'DER HAUSMEISTER LIESS DICH LAUFEN.'},
  {ab:2,g:5,wenn:{hat:'SCHLUESSEL'},             txt:'DER SCHLUESSEL MIT DER ROTEN WOLLE.'},
  {ab:3,g:8,wenn:{flag:'gruppeKlein'},           txt:'NUR IHR ZWEI. MORITZ WOLLTE REDEN.'},
  {ab:3,g:8,wenn:{flag:'gruppeGross'},           txt:'DIE GANZE MANNSCHAFT IST DABEI.'},
  {ab:3,g:6,wenn:{flag:'moritzKartonGesehen'},   txt:"ZWEI KARTONS IN MORITZ' ZIMMER."},
  {ab:4,g:7,wenn:{flag:'notbremse'},             txt:'DIE NOTBREMSE. NIE WIEDER DRUEBER.'},
  {ab:4,g:6,wenn:{flag:'jonasAngstTeilen'},      txt:'JONAS HAT ES AUSGESPROCHEN. DU AUCH.'},
  {ab:5,g:5,wenn:{flag:'mitgesungen'},           txt:'WONDERWALL GESUNGEN. FALSCH.'},
  {ab:6,g:9,wenn:{flag:'marvinNachgerufen'},     txt:'DU HAST MARVIN NACHGERUFEN.'},
  {ab:6,g:8,wenn:{flag:'kiraTschuess'},          txt:'KIRA HAT TSCHUESS GESAGT. DU AUCH.'},
  {ab:6,g:3,wenn:{flag:'marvinKennt'},           txt:'MARVIN SPIELTE MAL MIT MORITZ.'},
  {ab:7,g:8,wenn:{flag:'schluesselVersprochen'}, txt:'DEM HAUSMEISTER ETWAS VERSPROCHEN.'},
  {ab:7,g:7,wenn:{flag:'moritzGeheimnis'},       txt:'DU WEISST, WAS IN DEN KARTONS IST.'},
  {ab:8,g:9,wenn:{flag:'marvinWasser'},          txt:'MARVIN HAT DEIN WASSER GEKRIEGT.'},
  {ab:8,g:6,wenn:{flag:'tobiBruecke'},           txt:'TOBI WEISS, WO MAN DIE SONNE SIEHT.'},
  {ab:8,g:5,wenn:{flag:'wirEuchAuch'},           txt:'DU HAST "WIR EUCH AUCH" GESCHRIEBEN.'}
];

const TEXTE_MOMENTE={
  1:{titel:'DER FLUR',       l1:'DER FLUR, ALLE SPINDE OFFEN.',      l2:'JEMAND HAT ES FESTGEHALTEN.'},
  2:{titel:'DIE PINNWAND',   l1:'MORITZ UND DU, SIEBTE KLASSE.',     l2:'BEIDE MIT FURCHTBARER FRISUR.'},
  3:{titel:'DAS BUSFENSTER', l1:'EURE SPIEGELBILDER IM BUSFENSTER.', l2:'NIEMAND SCHAUT IN DIE KAMERA.'},
  4:{titel:'DAS GITTER',     l1:'DIE SCHLANGE VON OBEN.',            l2:'WER STAND DA OBEN?'},
  5:{titel:'DIE GARDEROBE',  l1:'DEIN GESICHT BEIM ERSTEN BASS.',    l2:'NIEMAND HAT ES GESEHEN. AUSSER LEA.'},
  6:{titel:'DIE WANDUHR',    l1:'DIE WANDUHR. SIE STEHT.',           l2:'17:30. SEIT HEUTE NACHMITTAG.'},
  7:{titel:'DIE BANK',       l1:'ALLE AUF DER BANK.',                l2:'JEMAND LACHT NOCH IM FOTO.'},
  8:{titel:'ERSTES LICHT',   l1:'ERSTES LICHT.',                     l2:'ALLE DREHEN SICH WEG. NUR EINER NICHT.'}
};

/* knoten: n ist Platzhalter. Hangover-Karten: zwei Zeilen mit | getrennt. */
const TEXTE_MENUE={
  untertitel:'Party Game drunk', enden:'ENDEN', momente:'MOMENTE', unbekannt:'???',
  knoten:'n VON 3 KNOTEN', zurueck:'ZURUECK', galerieHinweis:'G: ENDEN', album:'ALBUM',
  leer:'NOCH NICHTS GEFUNDEN.',
  blackout:'DU WACHST AUF. DU HAELST EIN SCHILD.|KEINE FRAGEN.',
  erwischt:'DER HAUSMEISTER HAT ABGESCHLOSSEN.|ES IST NOCH FREITAG.'
};
