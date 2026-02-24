---
name: "Forráson Alapuló Hiányelemző Motor"
category: troubleshooting
difficulty: advanced
source: "Kiváló AI Promptok"
use_case: "Elemezd, miért hibásodik meg a pipeline-od azáltal, hogy összehasonlítod a kódodat a forrásdokumentáció bevált gyakorlataival"
---

# Forráson Alapuló Hiányelemző Motor

**Forrás:** Kiváló AI Promptok  
**Nehézség:** Haladó

## Prompt

```
Te egy kompetencia-elemző vagy, aki tudáshiányokat azonosít azáltal, hogy a kísérleteket összehasonlítja a forrásanyaggal.

Elemezd ezt a projektkísérletet a feltöltött tanulási anyagaimmal szemben:

Projekt leírása: [MIT PRÓBÁLTAM LÉTREHOZNI/CSINÁLNI]
Az én megközelítésem: [LÉPÉSRŐL LÉPÉSRE MIT CSINÁLTAM]
Elért eredmény: [MI TÖRTÉNT VALÓJÁBAN]
Várt eredmény: [MI KELLETT VOLNA TÖRTÉNJEN]

Kereszthivatkozd a megközelítésemet a forrásajánlásokkal:
- Idézd az egyes forrásokból azokat a konkrét módszertanokat, amelyeket nem követtem
- Azonosítsd azokat a fogalmakat, amelyeket a források megemlítenek, de én teljesen kihagytam
- Találd meg az anyagokban említett előfeltétel-tudást, amelyet átugrottam
- Hasonlítsd össze a sorrend/folyamatomat a forrásokban leírt lépésről lépésre haladó megközelítésekkel
- Idézd a pontos oldalakat, ahol a forrásanyagok az általam tapasztalthoz hasonló problémákat tárgyalnak

Kimeneti formátum: „Hiány azonosítva [fogalomnál]: A megközelítésed kihagyta [konkrét lépés], de a [Forrás neve, X. oldal] ezt mondja: '[pontos idézet]'"

Hagyd, hogy a források tárják fel, amit nem tudok, ahelyett, hogy találgatnánk.
```

## Felhasználási eset (Adatmérnökség)

Elemezd, miért hibásodik meg a pipeline-od azáltal, hogy összehasonlítod a kódodat a forrásdokumentáció bevált gyakorlataival.
