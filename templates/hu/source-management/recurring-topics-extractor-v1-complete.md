---
name: "Visszatérő Témák Kinyerő v1 - Teljes"
category: source-management
subcategory: recurring-topics-extractor
difficulty: intermediate
source: "Custom (Improved from Academic Research)"
use_case: "10+ cikk feltöltése után egy mintáról (pl. eseményvezérelt architektúra), konszenzus és viták kinyerése"
---

# Visszatérő Témák Kinyerő v1 - Teljes

**Forrás:** Custom (Improved from Academic Research)
**Nehézség:** Középhaladó

## Prompt

```
Te egy tartalomelemző vagy, aki több forrás tematikus kinyerésére specializálódott.

A [TOPIC] témában megadott forrásokból végezz szisztematikus visszatérő témakinyerést.

**1. fázis: Azonosítás**
Azonosítsd a témákat megjelenési gyakoriságuk alapján:
- **Főtémák** (a források ≥50%-ában): 3-5 téma
- **Másodlagos témák** (a források 25-49%-ában): 3-5 téma
- **Feltörekvő témák** (<25%, de jelentős): 1-3 téma

**2. fázis: Elemzés témák szerint**
Minden azonosított témához:

| Téma | Definíció (saját szavakkal) | Források [hivatkozások] | Kezelés | Fontosság |
|------|---------------------------|------------------------|---------|-----------|
| [Név] | [1-2 mondat] | A forrás X. old., B forrás Y. old. | [KONSZENZUS/VITATOTT/FELTÉTELEZETT/TESZTELT/EMLÍTETT] | [Fő/Másodlagos/Feltörekvő] |

**Kezelési jelmagyarázat:**
- KONSZENZUS: Minden forrás egyetért
- VITATOTT: Ellentétes álláspontok azonosíthatók
- FELTÉTELEZETT: Nyilvánvalóként kezelve, nem megkérdőjelezve
- TESZTELT: Empirikusan validálva a forrásokban
- EMLÍTETT: Idézve, de kifejtés nélkül

**3. fázis: Kapcsolatfeltérképezés**
Mely témák függnek össze?
```
[A téma] ↔ [B téma]: [kapcsolat jellege]
[C téma] → [D téma]: [függőség]
```

**4. fázis: Azonosított hiányosságok**
Mely fontos témák hiányoznak vagy alulreprezentáltak ezekben a forrásokban a [TOPIC] szempontjából?
- 1. hiányosság: [hiányzó téma] - Hatás: [miért problematikus]
- 2. hiányosság: ...

**Végső kimenet:**
## Prioritásos ajánlások
1. Elmélyítendő: [vitatott témák, amelyek tisztázást igényelnek]
2. Validálandó: [feltételezett témák, amelyeket ellenőrizni kell]
3. Kiegészítendő: [hiányosságok, amelyeket új forrásokkal kell pótolni]
```

## Felhasználási eset (adatmérnökség)

10+ cikk feltöltése után egy mintáról (pl. eseményvezérelt architektúra), konszenzus és viták kinyerése.
