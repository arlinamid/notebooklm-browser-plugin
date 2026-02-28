---
name: "Szemináriumi használat (Minimális szöveg)"
category: professional
difficulty: intermediate
format: slide-deck
source: "Kawai"
use_case: "Nagy érzékenységű dizájn szemináriumokhoz"
---

# Szemináriumi használat (Minimális szöveg)

**Forrás:** Kawai
**Formátum:** Slide Deck
**Nehézség:** Intermediate

## Prompt

```
# presentation_design_spec_seminar_minimal.yaml
# Style: Seminar Minimal Text
# Concept: "One Idea, Total Presence"

Global Design Settings:
  Tone: "Nagy érzékenységű, kifinomult, elegáns, előadó-fókuszú, minimalista szerkesztői"

  Color Palette:
    Base: "#FFFFFF (tiszta fehér — elsődleges vászon)"
    Text: "#111111 (közel-fekete — precíz, éles)"
    Accent:
      - "#D32F2F (jelzőpiros — egyetlen fókusz-kiemeléshez)"
    Secondary:
      - "#F5F5F5 (világosszürke — finom szekció-háttér)"
      - "#BDBDBD (közepes szürke — másodlagos szöveg, elválasztók)"
    Rule: "A piros legfeljebb egy elemen jelenik meg diánként — soha nem dekoratív, mindig célzott."

  Typography:
    Headings: "Letisztult félkövér sans serif bőséges betűközzel. Nagy méret — a diamagasság 40–60%-át foglalja el."
    Body: "Vékony súlyú sans serif. Nagyon kis méret. Nagy kontraszt a fehér háttérrel szemben."
    Accent: "A piros egyetlen szón, számon vagy rövid kifejezésen — diánként nem több egynél."
    Language: "A szöveg nyelve legyen az, amit a felhasználó megadott a promptban."

  Common Layout Rules:
    TextDensity: "Diánként maximum 15 szó. A diák vizuális horgonyok az előadó számára, nem önálló dokumentumok."
    Photography: "Egyetlen, szerkesztői minőségű fotó diánként, ahol használva. Soha nem stock fotó érzés — divat-portré vagy csendélet minőség."
    Alignment: "Aszimmetrikus — a főcímek bal oldalt igazítva vagy rácshoz horgonyozva, soha nem középre, kivéve szándékos drámai hatáshoz."
    WhiteSpace: "Minden dia legalább 40%-a üres fehér tér legyen."

Layout Variations:
  - Type: "Nyitó Kijelentés"
    Design: "Teljesen fehér dia. Egyetlen rövid, erőteljes mondat (4–7 szó) hatalmas félkövér betűkkel, bal alul horgonyozva. Piros aláhúzás egy kulcsszó alatt. Semmi más."

  - Type: "Fotó + Főcím"
    Design: "50:50 felosztás. Bal: egyetlen szerkesztői minőségű portréfotó (telítettségcsökkentett vagy hűvös tónusú). Jobb: egy félkövér főcím nagy betűmérettel, opcionális egysoros szövegtörzzsel alatta. Piros kiemelés egy szón."

  - Type: "Nagy Szám"
    Design: "Fehér vászon. Egyetlen hatalmas statisztika közel-teljes magasságban, közel-feketében. Egység vagy rövid felirat kis szövegtörzsben jobbra. Egy piros elem a kiemeléshez. Maximum 8 szó összesen."

  - Type: "Minimális Lista"
    Design: "3–5 egyetlen szóból vagy két szóból álló elem függőlegesen elrendezve. Minden elem saját sorában. Nagy, félkövér, bőséges sortávolság. Egy elem kiemelt pirossal. Sem felsorolásjelek, sem ikonok."

  - Type: "Teljes Fotó"
    Design: "Teli vérzésű szerkesztői fotó. Egy 2–4 szavas főcím fehérrel vagy feketével lefedve, bal alul elhelyezve. Vékony piros vízszintes vonal a szöveg felett. Nulla más elem."

  - Type: "Definíció Dia"
    Design: "Fehér háttér. Egy fogalom hatalmas félkövér betűkkel (bal igazítás, felső harmad). Alatta: egyetlen letisztult, tömör definíciós mondat kis szövegtörzsben. Piros kettőspont vagy gondolatjel elválasztóként."

  - Type: "Záró Horgony"
    Design: "Fehér dia. Egyetlen záró kijelentés vagy felhívás nagyon nagy félkövér betűkkel. Piros pont vagy írásjel egyetlen kiemelőként. Sem logó, sem dekorációs elem — tiszta kijelentés."

Design Rules:
  - "Szó-gazdaságosság: Minden képernyőn lévő szónak helyet kell kiérdemelnie. Töröld, amit az előadó szóban is el tud mondani."
  - "Piros-mértékletesség: Diánként maximum egy piros elem. Ez egyetlen, legfontosabb dolgot emel ki."
  - "Fotóminőség: Csak olyan fényképezést használj, amely rendezettnek hat — természetes fény, szerkesztői kompozíció, soha nem clipart."
  - "Nem felsorolásjelek: Az információ kijelentésként jelenik meg, nem listaként (kivéve a Minimális Lista elrendezést)."
  - "Nem dekoratív elemek: Nem ikon, nem infografikai alakzat, nem díszítőelem — kivéve ha MAGUK a tartalom."
  - "Generálás: Olyan diákat készíts, amelyek előadói támogatásként funkcionálnak, nem önálló dokumentumokként. Minden dia egyetlen ötletet közöl maximális vizuális gazdaságossággal."
```
