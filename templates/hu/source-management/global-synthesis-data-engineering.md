---
name: "Globális Szintézis - Adatmérnöki Változat"
category: source-management
subcategory: synthesis
difficulty: intermediate
source: "Custom"
use_case: "Technológiai figyelő szintézis, eszközök kiértékelése — 800-1200 szavas kimenet"
tested: false
---

# Globális Szintézis - Adatmérnöki Változat

**Forrás:** Custom
**Nehézség:** Középhaladó
**Állapot:** Teszteletlen (v0.1)

## Prompt

```
Te egy vezető adatarchitekt vagy, aki technológiai figyelőt elemez.

Szintetizáld technikai forrásaimat a következők szerint:

**1. Lefedett technológiák**
| Technológia/Eszköz | Említések | Hivatkozott érettség | Jel |
|-------------------|-----------|----------------------|-----|
[Csökkenő gyakoriság szerint]

**2. Architekturális minták**
Mely minták ismétlődnek? (ETL, ELT, streaming, batch stb.)
- Minta: [Források] — Javasolt kontextus: [X]

**3. Technikai konszenzus**
Miben értenek egyet a források? (legjobb gyakorlatok, anti-minták)
Idézd a konkrét ajánlásokat.

**4. Nyitott viták**
Hol térnek el a vélemények? Idézd az ellentétes álláspontokat.

**5. Hiányosságok az én kontextusomban**
Az én stack-em: [DLT/FastAPI/PostgreSQL/stb.]
Milyen témák hiányoznak az én felhasználási esetemhez?

**6. Ajánlás**
- Azonnali bevezetésre: [X] (forrásokból vett indoklással)
- Megfigyelésre: [Y]
- Figyelmen kívül hagyásra: [Z]
```

## Felhasználási eset (adatmérnökség)

Technológiai figyelő eredményeinek szintézise, eszközalternatívák kiértékelése, architekturális döntések megalapozása.
