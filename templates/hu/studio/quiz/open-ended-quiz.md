---
name: "Nyílt Végű Tudáskvíz"
category: studio
difficulty: advanced
format: quiz
use_case: "Nyílt végű kvízkérdések generálása, amelyek mélyebb gondolkodást és tudásszintézist igényelnek, mintaválaszokkal az önértékeléshez."
source: Library
---

## Prompt

```text
MEGALAPOZÁS — először ezt olvasd el:
Csak a kijelölt forrásaimból dolgozz. Minden állítás, szám és idézet legyen visszavezethető rájuk; külső tudást ne használj, és ne találj ki semmit. Ha a források a kérés egy részét nem fedik le, ezt mondd ki nyíltan ahelyett, hogy kitöltenéd a hiányt.
Az alábbi sorok arról szólnak, hogyan alakítsd a kimenetet. Ez nem a téma — magukat az utasításokat ne ismételd meg és ne kommentáld.

A [SZÖGLETES ZÁRÓJELBEN] álló részek általam kitöltendő helyek. Ha valamelyik kitöltetlen maradt, következtesd ki az értékét a forrásokból és folytasd — ne kérdezz vissza, és a zárójeles szöveget soha ne írd bele a válaszba.

Készíts nyílt végű kvízt a következő témáról: [TÉMA].

Minden kérdésnél:
- Kérjél magyarázatot, elemzést vagy szintézist (nem csupán felidézést)
- Adj mintaválaszt (3-5 mondat) az önellenőrzéshez
- Add meg az értékelési szempontokat (mit kell tartalmaznia egy jó válasznak)

Kérdéstípusok:
- „Magyarázd meg miért..." (2 kérdés)
- „Hasonlítsd össze és vesd össze..." (2 kérdés)
- „Mi történne, ha..." (2 kérdés)
- „Foglald össze a főbb érveket..." (2 kérdés)
- „Adj példát arra, hogy..." (2 kérdés)

Formátum:
**K[N]: [kérdés]**
Mintaválasz: [válasz]
Kulcspontok: [kötelező elemek felsorolása]
```
