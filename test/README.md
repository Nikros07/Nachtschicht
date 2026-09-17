# Tests

Kein Framework, kein Build - einfach ausfuehren:

```bash
node test/kampf.test.js
```

Die Kampflogik ist reine Zustandsmathematik und laesst sich deshalb ohne
Browser durchrechnen. Das ist gruendlicher als Klicken und faengt
Regressionen beim weiteren Ausbau.

Was im Browser geprueft werden muss (Rendern, Eingabe, Touch), steht nicht
hier - dafuer die Level einzeln aufmachen und die Konsole im Auge behalten.
