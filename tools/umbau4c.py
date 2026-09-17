# -*- coding: utf-8 -*-
"""Level 4, Teil 3: die alte Kampfschleife entfernen."""
import io
p='level4.html'
s=io.open(p,encoding='utf-8').read()

def fn_ende(src,i):
    d=0; st=False
    for j in range(i,len(src)):
        c=src[j]
        if c=='{': d+=1; st=True
        elif c=='}':
            d-=1
            if st and d==0: return j+1
    raise SystemExit('Klammer nicht gefunden')

# Es gibt jetzt zwei kampf(dt) - die NEUE steht frueher, die ALTE spaeter.
# Die spaetere gewinnt beim Hochziehen, also muss sie weg.
erste=s.index('function kampf(dt){')
zweite=s.index('function kampf(dt){', fn_ende(s,erste))
ende=fn_ende(s,zweite)
entfernt=s[zweite:ende].count('\n')+1
s=s[:zweite]+s[ende:]
s=s.replace('\n\n\n\n','\n\n\n')
io.open(p,'w',encoding='utf-8').write(s)
print('alte Kampfschleife entfernt: '+str(entfernt)+' Zeilen')
