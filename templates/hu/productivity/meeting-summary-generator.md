---
name: "Értekezlet-összefoglaló Generátor"
category: productivity
difficulty: beginner
source: "AI Fire"
use_case: "Töltsd fel a napi standup hangfelvételét → strukturált összefoglaló minden fejlesztőhöz rendelt teendőkkel"
---

# Értekezlet-összefoglaló Generátor

**Forrás:** AI Fire
**Nehézség:** Kezdő

## Prompt

```
MEGALAPOZÁS — először ezt olvasd el:
Csak a kijelölt forrásaimból dolgozz. Minden állítás, szám és idézet legyen visszavezethető rájuk; külső tudást ne használj, és ne találj ki semmit. Ha a források a kérés egy részét nem fedik le, ezt mondd ki nyíltan ahelyett, hogy kitöltenéd a hiányt.
Az alábbi sorok arról szólnak, hogyan alakítsd a kimenetet. Ez nem a téma — magukat az utasításokat ne ismételd meg és ne kommentáld.

Járj el professzionális értekezleti titkárként. A megadott hangfelvétel alapján készíts értekezlet-összefoglalót Markdown formátumban az alábbi szakaszokkal:

**1. Az értekezlet célja:**
- Egy mondatban: mi volt az értekezlet fő célja?

**2. Résztvevők:**
- Sorolj fel minden résztvevőt névvel és szerepkörrel

**3. A megbeszélés főbb pontjai:**
- Foglald össze a megbeszélt főbb témákat (3-5 felsoroláspontban)

**4. Meghozott döntések:**
- Sorolj fel minden döntést kontextussal (ki döntött, mit és miért)

**5. Teendők:**
| Feladat | Felelős | Határidő | Prioritás |
|---------|---------|----------|-----------|
|         |         |          |           |

**6. Nyitott kérdések:**
- Sorolj fel megoldatlan kérdéseket vagy akadályokat

**7. Következő lépések:**
- Mi történik ezután, és mikor lesz az utánkövetés?
```

## Felhasználási eset (adatmérnökség)

Töltsd fel a napi standup hangfelvételét → strukturált összefoglaló minden fejlesztőhöz rendelt teendőkkel.
