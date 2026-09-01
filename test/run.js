/* Alle Testdateien nacheinander. `node test/run.js` - mehr braucht es nicht. */
const { execFileSync }=require('child_process');
const fs=require('fs'), path=require('path');

const dateien=fs.readdirSync(__dirname).filter(f=>f.endsWith('.test.js')).sort();
let kaputt=0;
for(const f of dateien){
  console.log('\n=== '+f+' '+'='.repeat(Math.max(0,60-f.length)));
  try{ execFileSync(process.execPath,[path.join(__dirname,f)],{stdio:'inherit'}); }
  catch(e){ kaputt++; }
}
console.log('\n'+(kaputt?kaputt+' von '+dateien.length+' Testdateien rot'
                        :'alle '+dateien.length+' Testdateien gruen'));
process.exit(kaputt?1:0);
