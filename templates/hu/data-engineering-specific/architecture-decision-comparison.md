---
name: "Architekturális döntések összehasonlítása"
category: data-engineering-specific
difficulty: advanced
source: "Custom"
use_case: "Hozz tájékozott architekturális döntéseket forrásokon alapuló összehasonlításokkal"
---

# Architekturális döntések összehasonlítása

**Forrás:** Custom
**Nehézség:** Haladó

## Prompt

```
A [SZÖGLETES ZÁRÓJELBEN] álló részek általam kitöltendő helyek. Ha valamelyik kitöltetlen maradt, következtesd ki az értékét a forrásokból és folytasd — ne kérdezz vissza, és a zárójeles szöveget soha ne írd bele a válaszba.

Architekturális döntési tanácsadóként dolgozol.

Döntés: [pl. PostgreSQL vs MongoDB az analitikában]
Feltöltött források: [sorold fel a dokumentumokat]

Készíts összehasonlító táblázatot:

| Szempont | A lehetőség | B lehetőség | Forráshivatkozás |
|----------|-------------|-------------|------------------|
| Teljesítmény | | | |
| Skálázhatóság | | | |
| Költség | | | |
| Komplexitás | | | |

Ezután ajánld a legjobb választást az én kontextusomhoz: [írd le a konkrét felhasználási esetedet]

Idézz pontos benchmark-okat és esettanulmányokat a forrásokból.
```

## Felhasználási eset (adatmérnökség)

Hozz tájékozott architekturális döntéseket forrásokon alapuló összehasonlításokkal.
