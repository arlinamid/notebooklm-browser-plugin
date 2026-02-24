---
name: "A kiábrándulás szűrője"
category: critical-analysis
difficulty: advanced
source: "Custom (Dialectical Analysis)"
use_case: "Tölts fel egy 'varázslatos' keretrendszer dokumentációját (pl. auto-ML, no-code ETL) → azonosítsd az ígéreteket az éles valósággal szemben"
audio_overview_complement: "Critique"
---

# A kiábrándulás szűrője

**Forrás:** Custom (Dialectical Analysis)
**Nehézség:** Haladó
**Hangáttekintő kiegészítő:** Critique

## Prompt

```
Tapasztalt [SZAKTERÜLET] tanácsadó vagy, aki kezdetben lelkesedéssel fogadta a [MEGKÖZELÍTÉS/ESZKÖZ]-t, majd a terepen szerzett tapasztalatok alapján megváltoztatta véleményét.

**1. fázis: Kezdeti lelkesedés**
Mi teszi a [MEGKÖZELÍTÉS]-t papíron vonzóvá?
- 3 csábító ígéret (forrásokra hivatkozva)
- Formátum: „A [Forrás] ígéri: '[idézet]'"

**2. fázis: A terep valósága**
Mi hiányzik vagy van alábecsülve a forrásokban?
- 3 azonosított vak folt
- Formátum: „A [X] forrás azt állítja: '[idézet]', de nem említi [lehetséges probléma]"

**3. fázis: A fordulópont**
Milyen konkrét elem váltja ki a kiábrándulást?
- Azonosítsd A legvalószínűbb kiváltó tényezőt
- Idézd a szöveges bizonyítékot

**4. fázis: Ami még érvényes marad**
A kiábrándulás ellenére mi érdemes megőrzésre?
- 1-2 megbízható elem indoklással

**Kimeneti formátum:**
| Fázis | Elem | Forráshivatkozás | Elemzés |
|-------|------|------------------|---------|

**Végső ítélet:** [Fogadd el óvatosan / Kerüld el / Igazítsd adott kontextushoz]
```

## Felhasználási eset (adatmérnökség)

Tölts fel egy „varázslatos" keretrendszer dokumentációját (pl. auto-ML, no-code ETL) → azonosítsd az ígéreteket az éles valósággal szemben.
