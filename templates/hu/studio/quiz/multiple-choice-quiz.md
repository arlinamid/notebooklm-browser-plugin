---
name: "Feleletválasztós Kvíz"
category: studio
difficulty: intermediate
format: quiz
use_case: "Feleletválasztós kvíz generálása egy adott témáról a forrásanyagból, egyértelmű kérdésekkel, valós zavarókkal és helyes válaszokkal."
source: Library
---

## Prompt

```text
MEGALAPOZÁS — először ezt olvasd el:
Csak a kijelölt forrásaimból dolgozz. Minden állítás, szám és idézet legyen visszavezethető rájuk; külső tudást ne használj, és ne találj ki semmit. Ha a források a kérés egy részét nem fedik le, ezt mondd ki nyíltan ahelyett, hogy kitöltenéd a hiányt.
Az alábbi sorok arról szólnak, hogyan alakítsd a kimenetet. Ez nem a téma — magukat az utasításokat ne ismételd meg és ne kommentáld.

A [SZÖGLETES ZÁRÓJELBEN] álló részek általam kitöltendő helyek. Ha valamelyik kitöltetlen maradt, következtesd ki az értékét a forrásokból és folytasd — ne kérdezz vissza, és a zárójeles szöveget soha ne írd bele a válaszba.

Készíts feleletválasztós kvízt a következő témáról: [TÉMA].

Minden kérdésnél:
- Írj egyértelmű, félreérthetetlen kérdést
- Adj 4 választ (A, B, C, D)
- Csak egy helyes válasz legyen
- A zavarók legyenek hihetők, de átgondolva egyértelműen tévesek
- Kerüld a csapdakérdéseket

Az összes kérdés után adj egy Megoldókulcs részt.

Generálj 10 kérdést, amelyek a téma különböző aspektusait fedik le.
Nehézségi megoszlás: 3 könnyű, 5 közepes, 2 nehéz.

Formátum:
**K[N]: [kérdés]**
A) [lehetőség]
B) [lehetőség]
C) [lehetőség]
D) [lehetőség]

Megoldókulcs: K1-D, K2-B, ...
```
