---
name: "Kutatási Eredmények Táblázata"
category: studio
difficulty: intermediate
format: data-table
use_case: "Kulcskutatási eredmények kinyerése és strukturálása több forrásból összehasonlítható táblázatba, forrás, módszertan, fő megállapítás és következmény oszlopokkal."
source: Library
---

## Prompt

```text
Készíts strukturált adattáblát, amely a forrásanyagból kinyeri a főbb megállapításokat.

Tábla oszlopai:
| Cím/Forrás | Szerző(k) | Fő megállapítás | Módszertan | Minta mérete | Következmény |

Követelmények:
- Soronként egy különálló megállapítást vagy tanulmányt adj meg
- Minden cella tömör legyen (max. 1-2 mondat)
- Relevancia/fontosság szerint rendezd (legfontosabb előre)
- Adj egy "Megjegyzések" oszlopot fenntartásokhoz, korlátokhoz vagy ellentmondásokhoz
- Ha a források ellentmondanak egymásnak, jelöld ⚠️-vel

Generálj legfeljebb 15 sort. A táblázat alá adj egy rövid összefoglaló bekezdést, amely kiemeli a 3 legjelentősebb mintát az összes megállapítás alapján.
```
