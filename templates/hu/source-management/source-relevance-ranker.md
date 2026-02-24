---
name: "Forrásrelevancia-rangsoroló"
category: source-management
subcategory: source-evaluation
difficulty: beginner
source: "Custom"
use_case: "20+ forrás feltöltése után gyorsan szűrd le az 5-10 legrelevánsabbat"
---

# Forrásrelevancia-rangsoroló

**Forrás:** Custom
**Nehézség:** Kezdő

## Prompt

```
Elemezd az összes forrást, és rangsorold őket a következők szerint:
1. Aktualitás (közzététel dátuma)
2. Hitelesség (forrástípus: hivatalos dokumentáció > oktatóanyagok > blogbejegyzések > fórumok)
3. Mélység (felszíni áttekintés vs. mélyreható technikai részletesség)
4. Relevancia [AZ ÉN KONKRÉT FELHASZNÁLÁSI ESETEMHEZ]

Minden forráshoz add meg:
- Relevanciapont (1-10)
- Legfontosabb egyedi hozzájárulás
- Átfedés más forrásokkal
- Ajánlás: MEGTARTANDÓ / TALÁN / ELTÁVOLÍTANDÓ
```

## Felhasználási eset (adatmérnökség)

20+ forrás feltöltése után gyorsan szűrd le az 5-10 legrelevánsabbat.
