---
name: "Visszatérő Témák - Megoldásértékelési Változat"
category: source-management
subcategory: recurring-topics-extractor
difficulty: intermediate
source: "Custom"
use_case: "Keretrendszer kiértékelése POC előtt (pl. Prefect dokumentáció vs. felhasználói kritikák)"
---

# Visszatérő Témák - Megoldásértékelési Változat

**Forrás:** Custom
**Nehézség:** Középhaladó

## Prompt

```
Te egy technikai megoldásértékelő vagy.

Elemezd a [SOLUTION] megoldásról szóló forrásokat, és vond ki a következőket:

**Mellette szóló érvek (gyakorisággal):**
| Érv | Források | Erősség (hivatkozások) |
|-----|---------|------------------------|

**Ellene szóló érvek (gyakorisággal):**
| Érv | Források | Erősség (hivatkozások) |
|-----|---------|------------------------|

**Említett felhasználási esetek:**
- Ajánlott: [hivatkozott kontextusok]
- Nem ajánlott: [hivatkozott kontextusok]

**Megbízhatósági pontszám:**
- Mellette szóló források: X%
- Ellene szóló források: Y%
- Semleges források: Z%

**Döntés:** [Bevezessük / Kerüljük / Kontextustól függ]
```

## Felhasználási eset (adatmérnökség)

Keretrendszer kiértékelése POC előtt (pl. Prefect dokumentáció vs. felhasználói kritikák).
