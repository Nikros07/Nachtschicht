/* ==========================================================================
   LEVEL 1 - DIE SCHULE

   Level 1 gilt als fertig. Was hier steht, ist deshalb kein Durchspielen,
   sondern ein Sicherheitsnetz: jeder Zustand wird einmal angefahren und
   eine Weile gerechnet UND gezeichnet. Wenn beim Zusammenlegen der beiden
   Level (siehe TODO, "Technik") etwas an der gemeinsamen Grundlage bricht,
   faellt es hier auf, bevor es jemand im Browser merkt.
   ========================================================================== */
const { lade }=require('./harness.js');
const { gruppe, pruefe, bilanz }=require('./pruefen.js');

const NAMEN=['TUNE','update','draw','neuesSpiel','starte','starteLevel',
             'RAEUME','SPINDE','AUSGANG','BODEN'];
const neu=()=>lade('index.html',NAMEN);

gruppe('Level 1 - Grundlagen');
{
  const g=neu();
  pruefe('Spiel laedt und steht auf dem Titelbild', g.S().modus==='titel');
  pruefe('Alle Regler liegen in TUNE', Object.keys(g.TUNE).length>30,
    Object.keys(g.TUNE).length+' Regler');
  pruefe('Das Level steht als Daten da', g.RAEUME.length>0&&g.SPINDE.length>0,
    g.RAEUME.length+' Raeume, '+g.SPINDE.length+' Spinde');
  g.takt(60);
  pruefe('Titelbild zeichnet eine Sekunde lang', g.S().modus==='titel');
}

gruppe('Level 1 - jeder Zustand rechnet und zeichnet');
{
  const g=neu();
  g.starte();
  pruefe('Intro startet', g.S().modus==='intro');
  g.sekunden(30);
  pruefe('Intro laeuft von selbst ins Spiel', g.S().modus==='spiel',
    'modus='+g.S().modus);

  const S=g.S();
  /* Herumlaufen, springen, schleichen - je eine Sekunde */
  g.rechts(true); g.sekunden(1); g.rechts(false);
  pruefe('Laufen bewegt die Figur', S.x!==undefined&&isFinite(S.x), 'x='+S.x.toFixed(1));
  g.sprung(); g.sprungAn(true); g.sekunden(1); g.sprungAn(false);
  pruefe('Springen laesst die Figur wieder landen', S.amBoden);
  g.links(true); g.sekunden(1); g.links(false);
  g.sekunden(2);
  pruefe('Nach dem Herumlaufen laeuft das Spiel noch', S.modus==='spiel'||S.modus==='raum',
    'modus='+S.modus);
}
{
  /* Die Uhr laeuft ab */
  const g=neu(); g.starte(); g.sekunden(30);
  g.S().zeit=g.TUNE.levelSekunden+1;
  g.sekunden(0.5);
  pruefe('Abgelaufene Uhr beendet das Level',
    g.S().modus==='ende'&&g.S().gewonnen===false, g.S().faenger);
  g.sekunden(2);
  pruefe('Das Endbild zeichnet', g.S().modus==='ende');
}
{
  /* Cutscene und Freischaltung */
  const g=neu(); g.starte(); g.sekunden(30);
  g.S().modus='cutscene'; g.S().szene=0; g.S().szeneT=0;
  g.sekunden(90);
  pruefe('Die Cutscene laeuft bis zum Ende durch', g.S().modus==='ende',
    'modus='+g.S().modus);
  pruefe('Max Ferdi landet in der Crew',
    (JSON.parse(g.speicher['nachtschicht.crew']||'[]')).includes('MAX FERDI'),
    g.speicher['nachtschicht.crew']||'nichts gespeichert');
}
{
  /* Pause darf nichts weiterlaufen lassen */
  const g=neu(); g.starte(); g.sekunden(30);
  const S=g.S(); const zeit=S.zeit;
  S.modus='pause'; g.sekunden(2);
  pruefe('Pause haelt die Uhr an', g.S().zeit===zeit, 'zeit='+g.S().zeit.toFixed(2));
}

process.exit(bilanz()?1:0);
