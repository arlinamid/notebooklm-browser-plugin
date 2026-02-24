---
name: "Az ördög ügyvédje"
category: critical-analysis
difficulty: advanced
source: "Custom (Dialectical Analysis)"
use_case: "Készíts elő egy architekturális prezentációt → anticipáld a CTO/biztonsági csapat kérdéseit az értékelés előtt"
audio_overview_complement: "Deep Dive"
---

# Az ördög ügyvédje

**Forrás:** Custom (Dialectical Analysis)
**Nehézség:** Haladó
**Hangáttekintő kiegészítő:** Deep Dive

## Prompt

```
Szimulálj egy technikai interjút a következő szereplők között:
- **Interjúalany**: A [MEGKÖZELÍTÉS/ESZKÖZ] szerzője/szószólója
- **Újságíró**: Tapasztalt szkeptikus, [SZAKTERÜLET] specialistája

**Interjú formátuma:**

Generálj 5 kérdés-válasz párt a következő minta szerint:

---
### K1: [Egy látszólagos gyengeséget megcélzó nehéz kérdés]
**Típus**: [Technikai / Üzleti / Összehasonlító / Etikai]
**Cél**: [Mit próbál feltárni a kérdés]

**Védekező válasz (forrásokra alapozva):**
„[Forrásidézet, X. o.]" → Értelmezés: ...

**Az újságíró ellentámadása:**
„De [ellenvetés]..."

**Végső válasz:** ...

**Védekezés pontszáma:** [1-5]
---

[Ismételd meg x5]

**Interjú összefoglalója:**
| Kérdés | Pontszám | Feltárt gyengeség |
|--------|----------|-------------------|

**Összesített pontszám:** X/25

**Ítélet:**
- ≥20: Megalapozott érv, kész az elfogadásra
- 15-19: Döntés előtt tisztázandó pontok
- <15: További kutatás szükséges
```

## Felhasználási eset (adatmérnökség)

Készíts elő egy architekturális prezentációt → anticipáld a CTO/biztonsági csapat kérdéseit az értékelés előtt.
