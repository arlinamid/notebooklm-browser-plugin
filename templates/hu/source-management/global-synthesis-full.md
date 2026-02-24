---
name: "Globális Szintézis - Teljes Verzió"
category: source-management
subcategory: synthesis
difficulty: intermediate
source: "Custom"
use_case: "Átfogó elemzés nagyobb döntés előtt — 1500-2500 szavas kimenet"
tested: false
---

# Globális Szintézis - Teljes Verzió

**Forrás:** Custom
**Nehézség:** Középhaladó
**Állapot:** Teszteletlen (v0.1)

## Prompt

```
Te egy tartalomelemző szakértő vagy, aki több forrás szintézisére specializálódott.

AZ ÖSSZES feltöltött forrásból készíts strukturált globális szintézist.

**1. fázis: Áttekintés**
Foglald össze az összes forrást 3-5 mondatban. Mi a központi téma? Milyen domináns megközelítés rajzolódik ki?

**2. fázis: Visszatérő témák**
Azonosítsd az 5-10 legfontosabb témát megjelenési gyakoriságuk alapján.

Minden témához:
| Téma | Definíció (saját szavakkal) | Források [hivatkozások] | Kezelés |
|------|---------------------------|------------------------|---------|
| [Név] | [1-2 mondat] | A forrás X. old., B forrás Y. old. | [KONSZENZUS/VITATOTT/FELTÉTELEZETT] |

**Kezelési jelmagyarázat:**
- KONSZENZUS: Minden forrás egyetért
- VITATOTT: Ellentétes álláspontok azonosíthatók
- FELTÉTELEZETT: Nyilvánvalóként kezelve, nem megkérdőjelezve

**3. fázis: Konszenzus és eltérések**
- **Konszenzuspontok**: Miben ért egyet AZ ÖSSZES forrás? (idézve)
- **Azonosított eltérések**: Hol mondanak ellent egymásnak a források?
  Formátum: „[A forrás] azt állítja: '[idézet]', míg [B forrás] azt állítja: '[idézet]'"
- **Valószínű ok**: Miért áll fenn ez az eltérés? (módszer, kontextus, dátum)

**4. fázis: Azonosított hiányosságok**
Milyen [USER CONTEXT] szempontjából fontos témák:
- Hiányoznak a forrásokból?
- Szerepelnek, de kidolgozatlanok?
- Felszínesen vannak kezelve?

**5. fázis: Megvalósítható szintézis**
A visszatérő témák és konszenzuspontok alapján milyen átfogó következtetést támasztanak alá közösen a források? Idézd a legerősebb alátámasztó bizonyítékokat.

Melyik felismerés jelenik meg a leggyakrabban és legkövetkezetesebben? Idézd a kulcsfontosságú szövegrészeket.

**Prioritásos ajánlások:**
1. Elmélyítendő: [vitatott témák, amelyek tisztázást igényelnek]
2. Validálandó: [feltételezett elemek, amelyeket ellenőrizni kell]
3. Kiegészítendő: [hiányosságok, amelyeket új forrásokkal kell pótolni]

---

**Felhasználói kontextus:**
- Célom: [mit szeretnék elérni]
- Szintem: [beginner/intermediate/advanced]
- Tervezett felhasználás: [tanulás / döntéshozatal / dokumentáció / egyéb]
```

## Felhasználási eset (adatmérnökség)

Átfogó elemzés nagyobb architekturális döntés, eszközadoption vagy stratégiadefiníció előtt.
