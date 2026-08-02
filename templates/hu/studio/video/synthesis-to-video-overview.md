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
MEGALAPOZÁS — először ezt olvasd el:
A tartalom kizárólag a kijelölt forrásaimból származhat. Minden állítás, szám, név és példa a forrásokból jöjjön; külső tudást ne használj, és ne találj ki semmit. Ha az elrendezés olyan elemet kérne, amit a források nem fednek le, inkább hagyd ki, mint hogy kitalált tartalommal töltsd ki.
Az alábbi sorok KIZÁRÓLAG a kimenet vizuális stílusát és szerkezetét írják le. Ez nem a téma — magát a stílusleírást soha ne mutasd be, ne magyarázd és ne hivatkozz rá.

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
