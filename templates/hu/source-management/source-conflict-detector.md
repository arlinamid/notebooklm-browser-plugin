---
name: "Forráskonfliktus-érzékelő"
category: source-management
subcategory: source-evaluation
difficulty: intermediate
source: "Custom"
use_case: "Forrásgyűjtemény rendszerezése mélyreható elemzés előtt"
---

# Forráskonfliktus-érzékelő

**Forrás:** Custom
**Nehézség:** Középhaladó

## Prompt

```
A [SZÖGLETES ZÁRÓJELBEN] álló részek általam kitöltendő helyek. Ha valamelyik kitöltetlen maradt, következtesd ki az értékét a forrásokból és folytasd — ne kérdezz vissza, és a zárójeles szöveget soha ne írd bele a válaszba.

A feltöltött forrásaim alapján azonosítsd:
1. Mely források tartalmaznak ellentmondó információkat? (konkrét konfliktusok idézésével)
2. Mely források elavultak ([DÁTUM] előttiek)?
3. Mely források fednek le azonos területet? (javasolj, melyeket érdemes megtartani)
4. Milyen hiányosságok vannak az összes forrásban? (milyen témák NEM szerepelnek)

Az eredményt megvalósítható ellenőrzőlista formájában add meg.
```

## Felhasználási eset (adatmérnökség)

Forrásgyűjtemény rendszerezése mélyreható elemzés előtt.
