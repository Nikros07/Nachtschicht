/* Die elf Songs der Nacht - nur Daten, kein Code (Abschnitt E2 aus docs/gameplay/PLAN.md).
   MUSIK.spiele(id) liest SONGS[id] (nacht/musik.js). Format und Stil-Namen stehen in E1.
   Warum mehrere Abschnitte je Song: die Folge ist die Grundschleife, die Zusatzabschnitte
   (jagd, kampf, alarm, phase2, phase3, drop, dj, finale) spielt das Spiel gezielt per
   MUSIK.abschnitt() - so wechselt der Klang bei Ereignissen, nicht nur beim Tempo.
   Warum lange Folgen: die Schleife soll mindestens 15 s dauern, sonst fällt sie auf.
   Lead: je Takt ein String aus 16 Zellen (Note, . Pause, - halten), Tonumfang A3 bis E6.
   Warum Ruf und Antwort: der B-Teil antwortet auf den A-Teil, damit die Melodie wiedererkennbar bleibt. */
const SONGS={
  // Leitmotiv der Nacht: Moll, halbe Noten im Bass, Lead als Ruf und Antwort (B hoeher).
  menue:{ bpm:100, schritte:16, swing:0.1,
    abschnitte:{
      A:{ akkorde:['Am','F','C','G'], bass:'halbe', drums:'traum', arp:'wechsel',
        lead:['E5 - - . C5 - A4 - . E5 - D5 - C5 - .',
              'F4 - C5 - F5 - E5 - D5 - C5 - A4 - . .',
              'G4 - C5 - E5 - G5 - E5 - C5 - D5 - . .',
              'D5 - B4 - G4 - A4 - B4 - - - . . . .'] },
      B:{ akkorde:['F','G','Em','Am'], bass:'walk', drums:'swing', arp:'auf',
        lead:['A5 - G5 - F5 - E5 - F5 - . . C5 - - .',
              'D5 - G5 - B5 - - - G5 - E5 - D5 - . .',
              'E5 - - . G5 - - - F#5 - E5 - D5 - B4 -',
              'A4 - C5 - E5 - A5 - - - G5 - E5 - C5 .'] } },
    folge:['A','A','B','B','A','A','B','B'],
    ebenen:[['bass'],['bass','drums'],['bass','drums','arp'],['bass','drums','arp','lead']],
    klang:{bass:'triangle', arp:'puls12', lead:'puls50'}, laut:{bass:.22, arp:.05, lead:.11} },

  // Spieluhr: Dur, leise, hohe Einzeltoene wie ein Stiftchen auf dem Metall. Viele Pausen = Luft.
  karte:{ bpm:90, schritte:16, swing:0,
    abschnitte:{
      A:{ akkorde:['C','G','Am','F'], bass:'halbe', drums:'aus', arp:'auf',
        lead:['E5 . G5 . C6 . G5 . E5 . C5 . . . . .',
              'D5 . B4 . G5 . D5 . B4 - G4 - . . . .',
              'A4 . C5 . E5 . A5 . E5 . C5 . A4 . . .',
              'F4 . A4 . C5 . F5 . A5 . F5 . C5 . . .'] },
      B:{ akkorde:['F','Dm','G','C'], bass:'puls', drums:'traum', arp:'wechsel',
        lead:['A4 . C5 . F5 . A5 . G5 . F5 . E5 . . .',
              'D5 . F5 . A5 . F5 . D5 . C5 . A4 . . .',
              'B4 . D5 . G5 . B5 . A5 . G5 . F#5 . . .',
              'G4 . C5 . E5 . G5 . C6 . G5 . E5 . C5 .'] } },
    folge:['A','B','A','B','A','B','A','B'],
    ebenen:[['bass'],['bass','drums'],['bass','drums','arp'],['bass','drums','arp','lead']],
    klang:{bass:'sine', arp:'triangle', lead:'sine'}, laut:{bass:.18, arp:.07, lead:.12} },

  // Schleichen in a-Moll, kurze Staccato-Toene mit Pausen. jagd: Hetze in 126-Gefuehl (Sprint-Schlagzeug).
  schule:{ bpm:84, schritte:16, swing:0,
    abschnitte:{
      A:{ akkorde:['Am','Dm','Am','E7'], bass:'schleich', drums:'schleich', arp:'aus',
        lead:['A4 . C5 . E5 . C5 . A4 . . . . . . .',
              'D5 . F5 . A4 . D5 . C5 . A4 . . . . .',
              'E5 . E5 . C5 . A4 . D5 . C5 . A4 . . .',
              'B4 . E5 . G#5 . E5 . D5 . B4 . . . . .'] },
      B:{ akkorde:['F','G','Am','E7'], bass:'walk', drums:'schleich', arp:'wechsel',
        lead:['C5 . F5 . A5 . G5 . F5 . E5 . . . . .',
              'G4 . D5 . B5 . A5 . G5 . F#5 . E5 . . .',
              'A5 . E5 . C5 . E5 . A4 . C5 . A4 . . .',
              'B4 . D5 . E5 . G#5 . B5 . E5 . D5 . . .'] },
      jagd:{ akkorde:['Am','F','G','Am'], bass:'achtel', drums:'sprint', arp:'auf', lead:null } },
    folge:['A','B','A','B','A','B','A','B'],
    ebenen:[['bass'],['bass','drums'],['bass','drums','arp'],['bass','drums','arp','lead']],
    klang:{bass:'triangle', arp:'puls12', lead:'puls25'}, laut:{bass:.18, arp:.05, lead:.10, drums:.7} },

  // Wohnungsparty: Swing, Gegenrhythmus, Ruf und Antwort. kampf: Tuer-Streit, staerkerer Bass.
  moritz:{ bpm:118, schritte:16, swing:0.2,
    abschnitte:{
      A:{ akkorde:['C','G','Am','F'], bass:'walk', drums:'swing', arp:'auf',
        lead:['G4 . C5 . E5 G5 . E5 C5 . . . D5 . E5 .',
              'D5 . B4 . D5 G5 . B5 A5 . G5 . F#5 . D5 .',
              'A4 . C5 . E5 . A5 . G5 . E5 . C5 . A4 .',
              'F4 . A4 . C5 F5 . A5 G5 . F5 . E5 . C5 .'] },
      B:{ akkorde:['F','C','Dm','G'], bass:'galopp', drums:'swing', arp:'wechsel',
        lead:['A5 . F5 . G5 . A5 . C6 . A5 . G5 . F5 .',
              'E5 . G5 . E5 . D5 . C5 . E5 . G4 . C5 .',
              'D5 . F5 . A5 . G5 . F5 . D5 . A4 . . .',
              'B4 . D5 . G5 . B5 . A5 . G5 . D5 . . .'] },
      kampf:{ akkorde:['Am','G','F','E7'], bass:'galopp', drums:'rock', arp:'ab', lead:null } },
    folge:['A','A','B','B','A','A','B','B'],
    ebenen:[['bass'],['bass','drums'],['bass','drums','arp'],['bass','drums','arp','lead']],
    klang:{bass:'puls25', arp:'puls12', lead:'puls50'}, laut:{bass:.2, arp:.06, lead:.10} },

  // Hetze zum Bus: schnelle Sechzehntel-Laeufe, 150 bpm. B steigt in die hohe Lage.
  sprint:{ bpm:150, schritte:16, swing:0,
    abschnitte:{
      A:{ akkorde:['Em','C','G','D'], bass:'achtel', drums:'sprint', arp:'auf',
        lead:['E5 G5 B5 G5 E5 G5 B5 G5 E5 . B4 . E5 . . .',
              'C5 E5 G5 E5 C5 E5 G5 E5 C5 . G4 . C5 . . .',
              'G4 B4 D5 B4 G4 B4 D5 B4 G4 . D5 . B4 . . .',
              'D5 F#5 A5 F#5 D5 F#5 A5 F#5 D5 . A4 . F#5 . . .'] },
      B:{ akkorde:['C','G','Am','F'], bass:'achtel', drums:'sprint', arp:'ab',
        lead:['C5 E5 G5 C6 G5 E5 C5 G4 E5 . C5 . G4 . . .',
              'G5 B5 D6 B5 G5 D5 B4 G4 D5 . B4 . G4 . . .',
              'A5 C6 E6 C6 A5 E5 C5 A4 E5 . C5 . A4 . . .',
              'F5 A5 C6 A5 F5 C5 A4 F4 A4 . C5 . F4 . . .'] } },
    folge:['A','A','B','A','A','B','A','B','A','B'],
    ebenen:[['bass'],['bass','drums'],['bass','drums','arp'],['bass','drums','arp','lead']],
    klang:{bass:'puls25', arp:'puls12', lead:'puls50'}, laut:{bass:.2, arp:.06, lead:.10} },

  // Angespannt, tickend: der Lead tickt auf einer Tonhoehe wie eine Uhr. alarm: Verdacht, Galopp und Akkordschlag.
  bus:{ bpm:96, schritte:16, swing:0,
    abschnitte:{
      A:{ akkorde:['Am','Am','Dm','E7'], bass:'puls', drums:'schleich', arp:'wechsel',
        lead:['A4 . A4 . A4 . A4 . A4 . A4 . A4 . A4 .',
              'A4 . C5 . A4 . C5 . E5 . . . D5 . C5 .',
              'D5 . D5 . F5 . F5 . D5 . C5 . G4 . . .',
              'E5 . E5 . G#5 . B4 . E5 . D5 . B4 . . .'] },
      B:{ akkorde:['Dm','Am','F','E7'], bass:'schleich', drums:'rock', arp:'ab',
        lead:['F5 . F5 . A5 . G5 . F5 . D5 . E5 . . .',
              'E5 . E5 . C5 . C5 . A4 . E5 . C5 . . .',
              'F4 . A4 . C5 . F5 . A5 . G5 . F5 . . .',
              'E5 . G#5 . B5 . G#5 . E5 . D5 . B4 . . .'] },
      alarm:{ akkorde:['Am','F','Am','E7'], bass:'galopp', drums:'rock', arp:'akkord', lead:null } },
    folge:['A','B','A','B','A','A','B','B'],
    ebenen:[['bass'],['bass','drums'],['bass','drums','arp'],['bass','drums','arp','lead']],
    klang:{bass:'triangle', arp:'puls12', lead:'puls25'} },

  // Boss, treibend: Oktav-Spruenge im Lead. phase2 treibt schneller, phase3 ist der Endspurt mit Akkordschlag.
  tuer:{ bpm:120, schritte:16, swing:0,
    abschnitte:{
      A:{ akkorde:['Em','C','D','Em'], bass:'puls', drums:'rock', arp:'ab',
        lead:['E5 - G5 - B5 - E6 - D6 - B5 - G5 - E5 .',
              'C5 - E5 - G5 - F5 - E5 - C5 - G4 - C5 .',
              'D5 - F#5 - A5 - G5 - F#5 - D5 - A4 - . .',
              'E5 - G5 - B5 - D6 - E6 - B5 - G5 - E5 .'] },
      phase2:{ akkorde:['Am','F','G','E7'], bass:'achtel', drums:'sprint', arp:'auf', lead:null },
      phase3:{ akkorde:['Em','C','D','B7'], bass:'galopp', drums:'sprint', arp:'akkord',
        lead:['E5 G5 B5 E6 D6 B5 G5 E5 B4 . E5 . G5 - - .',
              'C5 E5 G5 C6 B5 G5 E5 C5 G4 . C5 . E5 - - .',
              'D5 F#5 A5 D6 C6 A5 F#5 D5 A4 . D5 . F#5 - - .',
              'B4 D#5 F#5 B5 A5 F#5 D#5 B4 F#4 . B4 . D#5 - - .'] } },
    folge:['A','A','A','A','A','A','A','A'],
    ebenen:[['bass'],['bass','drums'],['bass','drums','arp'],['bass','drums','arp','lead']],
    klang:{bass:'sawtooth', arp:'puls25', lead:'square'}, laut:{bass:.16, arp:.05, lead:.09} },

  // Pumpen und Party: Viertel im Bass, Stabs im Arpeggio. drop: alles an, Akkordschlag. dj: anderer Groove, Swing.
  club:{ bpm:126, schritte:16, swing:0.15,
    abschnitte:{
      A:{ akkorde:['Am','F','G','Am'], bass:'puls', drums:'club', arp:'auf',
        lead:['A4 . A4 . C5 . E5 . A5 . E5 . C5 . . .',
              'F4 . F4 . A4 . C5 . F5 . C5 . A4 . . .',
              'G4 . G4 . B4 . D5 . G5 . D5 . B4 . . .',
              'E5 . A4 . C5 . E5 . A5 . E5 . C5 . . .'] },
      B:{ akkorde:['Dm','Bb','C','G'], bass:'achtel', drums:'club', arp:'auf',
        lead:['D5 . F5 . A5 . G5 . F5 . D5 . A4 . . .',
              'Bb4 . D5 . F5 . D5 . Bb4 . F4 . D5 . . .',
              'C5 . E5 . G5 . E5 . C6 . G5 . E5 . . .',
              'G4 . B4 . D5 . G5 . B5 . A5 . G5 . . .'] },
      drop:{ akkorde:['Am','F','C','G'], bass:'achtel', drums:'club', arp:'akkord', lead:null },
      dj:{ akkorde:['Em','C','G','D'], bass:'walk', drums:'swing', arp:'wechsel', lead:null } },
    folge:['A','A','B','B','A','A','B','B'],
    ebenen:[['bass'],['bass','drums'],['bass','drums','arp'],['bass','drums','arp','lead']],
    klang:{bass:'sawtooth', arp:'puls12', lead:'puls50'}, laut:{bass:.2, arp:.06, lead:.10} },

  // Verstimmt, langsam: jeder Ton klingt nach und haengt in der Luft (lange Haltezeichen, Echo-Gefuehl).
  traum:{ bpm:70, schritte:16, swing:0,
    abschnitte:{
      A:{ akkorde:['Am7','Dm7','Em7','Am7'], bass:'drohn', drums:'traum', arp:'wechsel',
        lead:['E5 - - . C5 - - . A4 - - . E5 - - -',
              'D5 - - . F5 - - . A4 - - . D5 - - -',
              'G5 - - . E5 - - . B4 - - . E5 - - -',
              'A4 - - . C5 - - . E5 - - . A5 - - -'] },
      B:{ akkorde:['Dm7','Bb','Gm','Am7'], bass:'halbe', drums:'traum', arp:'auf',
        lead:['A4 - F4 . D5 - - . F5 - - - E5 - D5 .',
              'Bb4 - - . D5 - - . Eb5 - - . D5 - - -',
              'G4 - - . Bb4 - - . D5 - - . G5 - - -',
              'E5 - - . C5 - - . A4 - C5 . E5 - - -'] } },
    folge:['A','B','A','B','A','B','A','B'],
    ebenen:[['bass'],['bass','drums'],['bass','drums','arp'],['bass','drums','arp','lead']],
    klang:{bass:'sine', arp:'triangle', lead:'sine'}, laut:{bass:.2, arp:.05, lead:.12} },

  // Ruhe und Swing auf dem Dreieck: der Lead spricht leise mit, Pausen gehoeren dazu.
  spaeti:{ bpm:76, schritte:16, swing:0.2,
    abschnitte:{
      A:{ akkorde:['Am','Dm','G','C'], bass:'walk', drums:'swing', arp:'wechsel',
        lead:['A4 . C5 . E5 - D5 . C5 . A4 . . . . .',
              'D5 . F5 . A4 - - . G4 . A4 . F4 - - -',
              'G4 . B4 . D5 - B4 . G4 . D5 . B4 - - -',
              'C5 . E5 . G4 - C5 . E4 . G4 . C5 - - -'] },
      B:{ akkorde:['F','Em','Am','G'], bass:'halbe', drums:'swing', arp:'auf',
        lead:['C5 . F5 . A5 - G5 . F5 . E5 . D5 - - -',
              'E5 . G5 . B5 - A5 . G5 . E5 . B4 - - -',
              'A4 . C5 . E5 - C5 . A5 . G5 . E5 - - -',
              'G4 . B4 . D5 - G5 . B5 . A5 . G5 - - -'] } },
    folge:['A','A','B','B','A','A','B','B'],
    ebenen:[['bass'],['bass','drums'],['bass','drums','arp'],['bass','drums','arp','lead']],
    klang:{bass:'triangle', arp:'sine', lead:'triangle'}, laut:{bass:.2, arp:.05, lead:.12} },

  // Aufbruch: Moll-Anfang, dann Dur-Wendung im B-Teil (heller, hoeher). finale: Schluss-Akkorde mit Akkordschlag.
  heimweg:{ bpm:112, schritte:16, swing:0,
    abschnitte:{
      A:{ akkorde:['Em','C','G','D'], bass:'achtel', drums:'rock', arp:'wechsel',
        lead:['E5 . G5 . B5 . A5 . G5 . E5 . B4 - - .',
              'C5 . E5 . G5 . C6 . B5 . G5 . E5 - - .',
              'D5 . G5 . B5 . A5 . G5 . D5 . B4 - - -',
              'D5 . F#5 . A5 . F#5 . D5 . A4 . F#4 - - -'] },
      B:{ akkorde:['C','G','D','A'], bass:'galopp', drums:'rock', arp:'auf',
        lead:['G4 . C5 . E5 . G5 . C6 . B5 . G5 - E5 .',
              'B4 . D5 . G5 . B5 . D6 . B5 . G5 - - .',
              'A4 . D5 . F#5 . A5 . D6 . A5 . F#5 - - -',
              'E5 . A4 . C#5 . E5 . A5 . E6 . C#5 - - -'] },
      finale:{ akkorde:['C','Am','F','G'], bass:'walk', drums:'rock', arp:'akkord', lead:null } },
    folge:['A','B','A','B','A','B','A','B'],
    ebenen:[['bass'],['bass','drums'],['bass','drums','arp'],['bass','drums','arp','lead']],
    klang:{bass:'puls25', arp:'puls12', lead:'puls50'} }
};
