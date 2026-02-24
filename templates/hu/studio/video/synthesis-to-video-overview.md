---
name: "Szintézisből videóáttekintés"
category: studio
subcategory: video
difficulty: beginner
source: "Custom (extracted from workflow-synthesis-notebooklm.md)"
use_case: "Videóáttekintés generálása egy elmentett szintézis-jegyzetből"
tested: false
---

# Szintézisből videóáttekintés

**Forrás:** Custom
**Nehézségi szint:** Kezdő
**Állapot:** Teszteletlen (v0.1)

## Kontextus

Ezt a promptot a **Custom Instructions** mezőben kell használni, amikor Videóáttekintést generálsz. Feltételezi, hogy:
1. Lefuttattál egy `Global Synthesis` promptot a forrásaidon
2. A kimenetet Jegyzetként mentettél el a NotebookLM-ben
3. CSAK azt a jegyzetet választottad ki forrásként a videóhoz

## Prompt (Custom Instructions)

```
Készíts videóáttekintést ez alapján a szintézisdokumentum alapján.

Struktúra:
- Nyiss a globális összefoglalóval
- Mutasd be a főbb témákat prioritás szerint
- Emeld ki a kulcsos konszenzuspontokat
- Röviden foglalkozz a főbb eltérésekkel
- Zárd az ajánlott intézkedésekkel

Célközönség: [pontosítsd: pl. adatmérnökök, tech leadsek, kezdők]
Kihagyandó: [kizárandó elemek: pl. részletes hivatkozások, hiányelemzés]
```

## Felhasználási eset (adatmérnökség)

Többforrásos szintézis átalakítása megosztható videóösszefoglalóvá csapatszintű tudásmegosztáshoz vagy stakeholder-tájékoztatáshoz.

## Kapcsolódó promptok

- `global-synthesis-full.md` — A forrásként használandó szintézis generálása
- `global-synthesis-compact.md` — Rövidebb alternatíva
- `global-synthesis-data-engineering.md` — Technikai fókuszú változat
