---
name: "Kódellenőrzés bevált gyakorlatokkal"
category: data-engineering-specific
difficulty: intermediate
source: "Custom"
use_case: "Szisztematikus kódellenőrzés a feltöltött bevált gyakorlatok dokumentációja alapján"
---

# Kódellenőrzés bevált gyakorlatokkal

**Forrás:** Custom
**Nehézség:** Középhaladó

## Prompt

```
Kódminőségi szakértőként dolgozol, aki [Python/SQL/stb.] területére specializálódott.

Ellenőrizd ezt a kódot a feltöltött forrásokban szereplő bevált gyakorlatok alapján:

```[language]
[paste your code]
```

Hasonlítsd össze a források ajánlásaival:
1. Stílusbeli megsértések (idézd a stílusútmutató vonatkozó részeit)
2. Teljesítményproblémák (hivatkozz az optimalizálási dokumentációra)
3. Biztonsági aggályok (idézd a biztonsági irányelveket)
4. Hiányzó minták (mit ajánlanak a források, ami a kódból hiányzik)
5. Refaktorálási javaslatok (előtte/utána példákkal)

Minden problémánál: „A [Forrás, X. fejezet] azt ajánlja: '[idézet]' → A te kódodban: [probléma] → Megoldás: [javítás]"
```

## Felhasználási eset (adatmérnökség)

Szisztematikus kódellenőrzés a feltöltött bevált gyakorlatok dokumentációja alapján.
