---
name: "Teljes Tanulmányi Útmutató Generátor"
category: productivity
difficulty: intermediate
source: "AI Fire"
use_case: "Töltsd fel az AWS Lambda + API Gateway + DynamoDB dokumentációkat → teljes tanulmányi útmutató kvízekkel"
---

# Teljes Tanulmányi Útmutató Generátor

**Forrás:** AI Fire
**Nehézség:** Középhaladó

## Prompt

```
MEGALAPOZÁS — először ezt olvasd el:
Csak a kijelölt forrásaimból dolgozz. Minden állítás, szám és idézet legyen visszavezethető rájuk; külső tudást ne használj, és ne találj ki semmit. Ha a források a kérés egy részét nem fedik le, ezt mondd ki nyíltan ahelyett, hogy kitöltenéd a hiányt.
Az alábbi sorok arról szólnak, hogyan alakítsd a kimenetet. Ez nem a téma — magukat az utasításokat ne ismételd meg és ne kommentáld.

A [SZÖGLETES ZÁRÓJELBEN] álló részek általam kitöltendő helyek. Ha valamelyik kitöltetlen maradt, következtesd ki az értékét a forrásokból és folytasd — ne kérdezz vissza, és a zárójeles szöveget soha ne írd bele a válaszba.

Járj el elkötelezett tutorként. A [TOPIC] témában biztosított összes tanulmányi anyag alapján készíts egy „Teljes Tanulmányi Útmutató Csomagot", amely tartalmazza:

**1. Az alapfogalmak összefoglalása:**
- Magyarázd el a témakör 3-5 legfontosabb gondolatát
- Minden gondolathoz adj egy egyszerű magyarázatot és egy konkrét példát az anyagokból

**2. Szakkifejezés-kártyák:**
- Készíts listát 10 fontos szakkifejezésről és rövid definíciójukról
- „Szakkifejezés: Definíció" formátumban jelenítsd meg őket

**3. Gyakorlófeladatok:**
- Írj 5 hosszabb kifejtős esszékérdést, amelyek vizsgán is szerepelhetnének, és a téma különböző részeit fedik le
- Írj egy 10 kérdéses feleletválasztós kvízt (4 opcióval: A, B, C, D) a tudás gyors tesztelésére

**4. Megoldókulcs:**
- A legvégén add meg a 10 feleletválasztós kérdés helyes válaszait

**5. Tanulási tippek:**
- A témakör összetettségére alapozva javasolj hatékony tanulási módszert
- Becsüld meg, hány óra szükséges a téma elsajátításához
```

## Felhasználási eset (adatmérnökség)

Töltsd fel az AWS Lambda + API Gateway + DynamoDB dokumentációkat → teljes tanulmányi útmutató kvízekkel.
