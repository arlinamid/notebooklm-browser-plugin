---
name: "Vizsgafelkészítő Tanulókártyák"
category: studio
difficulty: intermediate
format: flashcards
use_case: "Vizsgafókuszú tanulókártyák generálása, amelyek kiemelik a vizsgán legvalószínűbben szereplő kulcstényeket, képleteket, dátumokat és fogalmakat."
source: Library
---

## Prompt

```text
MEGALAPOZÁS — először ezt olvasd el:
Csak a kijelölt forrásaimból dolgozz. Minden állítás, szám és idézet legyen visszavezethető rájuk; külső tudást ne használj, és ne találj ki semmit. Ha a források a kérés egy részét nem fedik le, ezt mondd ki nyíltan ahelyett, hogy kitöltenéd a hiányt.
Az alábbi sorok arról szólnak, hogyan alakítsd a kimenetet. Ez nem a téma — magukat az utasításokat ne ismételd meg és ne kommentáld.

A [SZÖGLETES ZÁRÓJELBEN] álló részek általam kitöltendő helyek. Ha valamelyik kitöltetlen maradt, következtesd ki az értékét a forrásokból és folytasd — ne kérdezz vissza, és a zárójeles szöveget soha ne írd bele a válaszba.

Készíts vizsgafelkészítő tanulókártyákat a következő témáról: [TÉMA].

Prioritások:
1. Leggyakrabban előforduló vizsgaanyag és tesztelhető tények
2. Kulcsdefiníciók és szakszókincs
3. Fontos dátumok, nevek, képletek vagy statisztikák
4. Kerülendő tévhitek
5. Összehasonlító párok

Kártya formátum:
K: [egyértelmű, vizsga-stílusú kérdés]
V: [pontos válasz kulcsinformációval]

Generálj 20 kártyát fontossági sorrendben. A 4 legkritikusabbat jelöld ⭐-gal.
```
