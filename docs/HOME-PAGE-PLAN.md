# Feature Plan — what to build that NotebookLM cannot

**Status:** proposal, nothing built yet
**Date:** 2026-08-02
**Scope note:** this started as a home-page categorization plan. Research killed that idea (native
Collections already ships it) and the batch-prompt idea was rejected as unsound. The current direction is
below; the research that got us here is kept at the end so the reasoning stays auditable.

---

## The decision so far

| Idea | Verdict | Why |
|---|---|---|
| Custom notebook categories | ❌ dropped | Google shipped **Collections** on 2026-07-20 — custom names, multi-membership, `Add to collection` in every card menu. [NotebookLM Tools](https://www.nlmtools.com/features) also ships tags. Third system would be the weakest of three. |
| One template across many notebooks | ❌ dropped | Notebooks differ in content; the same prompt across them produces noise, not insight. |
| **Saved source selections → Recipes** | ✅ **proposed** | Measured native gap, directly tied to answer quality, nobody else does it. |

---

## The gap, measured

NotebookLM's answers are determined by **prompt × selected sources**. It gives you full control over the
second half — and then throws it away.

Measured on the live site, 2026-08-02:

```
initial:            14 / 14 sources selected
after unchecking 3: 11 / 14
after page reload:  14 / 14   →  selection RESET
```

The selection is **not persisted**. Community reports add that uploading a new source also re-selects
everything, wiping any manual selection.

For a 14-source notebook that is an annoyance. For the 50–300-source notebooks this extension's users
actually keep, it means **the careful selection is redone by hand every single session**, or — far more
likely — never made at all, and every question silently runs against every source.

There is no native concept of a named, reusable selection. The source panel offers exactly two controls:
a checkbox per source, and *Select all*.

---

## Proposal: Source Sets, then Recipes

### Phase 1 — Source Sets

Name a source selection and restore it in one click.

- In the source panel: **Save current selection as…** → give it a name (*"2024 papers"*, *"legal docs
  only"*, *"chapter 3–5"*).
- A compact set switcher at the top of the panel; picking one applies the checkboxes.
- Sets are per-notebook, stored by source UUID, and survive reloads — which the native selection does not.
- Sources added since a set was saved are reported rather than silently included: *"2 new sources are not
  in this set."*

**Why it is uniquely ours:** the native UI has no way to express it, and the competition is focused on
organizing *notebooks*, not on what happens *inside* one.

### Phase 2 — Recipes

A Recipe is the natural product of Phase 1 and the 229-template library this extension already owns:

> **Recipe = prompt template + source set + output format**

One click on a notebook: select these sources, open the Audio Overview dialog, fill in this prompt. A
reproducible research setup, saved and re-runnable.

This is the only feature in this document that *requires* a prompt library to make sense — which is exactly
what makes it defensible.

### Phase 3 — candidates, pick later

Two further "NotebookLM structurally cannot" ideas, both real but less certain than the above:

- **Answer journal.** Capture prompt + answer + notebook, searchable across *all* notebooks. Google's own
  documentation is explicit that a notebook cannot see across notebooks and a Collection groups *for your
  eye, not for the model*. We cannot make the model read across notebooks — but we can make everything it
  has already told you searchable in one place.
- **Prompt A/B compare.** Run variant A, capture the answer; run variant B on the same sources; show them
  side by side. NotebookLM has no notion of comparing two prompts. Squarely on-brand for a tool called
  *Prompt Architect*.

---

## Feasibility — checked, not assumed

| Requirement | Status |
|---|---|
| Stable source identity | ✅ `id="source-item-more-button-<uuid>"` on each source row |
| Read current selection | ✅ `.single-source-container input[type=checkbox]` → `.checked` |
| Apply a selection programmatically | ✅ verified — clicking the row's `<label>` toggles reliably; a 14-source selection was cleared and fully restored in the probe |
| Master toggle | ✅ `Select all` checkbox in `.source-picker` header |
| Studio dialogs honour the selection | ✅ each dialog shows a `Sources (N)` control reflecting the panel |
| Stable notebook identity | ✅ `#project-<uuid>-title`, and the `/notebook/<uuid>` URL |

### Constraints to respect

- **Storage.** A set is a list of 36-char UUIDs — a 200-source set is ~7 KB, against `chrome.storage.sync`'s
  8 KB per-item cap. Rather than sharding around that limit, move the working store to
  `chrome.storage.local` and handle portability separately — see
  [Storage & sync](#storage--sync--getting-off-chromestoragesync).
- **Do not key on source titles.** Titles are editable and duplicated (this account has the same source
  listed twice in one notebook).
- **The DOM changed twice in three weeks.** Every selector needs the same discipline the content script
  now has: stable anchors, graceful degradation, loud logging instead of throwing.
- **Applying a set means simulated clicks.** That is inherently more brittle than reading. It should be
  visible, cancellable, and verified afterwards (re-read the checkboxes and report any mismatch) rather
  than assumed to have worked.

---

---

## Storage & sync — getting off `chrome.storage.sync`

`chrome.storage.sync` fails us twice: **8 KB per item** (a 200-source set is already ~7 KB), and it only
ever syncs *within one browser vendor's own sync*. Chrome → Firefox has never been possible and never will be.

### Two hard requirements

Set by the project owner, and they decide the answer:

1. **It must not be a hassle for the user.** A manual export/import on every transfer therefore cannot be
   the primary mechanism — at most an escape hatch.
2. **The developer must not be able to access any user data.** This rules out any developer-operated
   backend, encrypted or not.

Only one option satisfies both: **Google Drive `appDataFolder`**. One-time "Connect", then automatic; and
the data sits in the *user's own* Drive, with no server anywhere for the developer to query.

`chrome.storage.sync` fails requirement 1 in a different way — it silently *cannot* carry data to another
browser at all.

### Recommended: local store + a portable sync transport

Split the two jobs that `storage.sync` currently conflates:

- **Working store → `chrome.storage.local`.** 10 MB, no per-item cap. Every quota problem in this document
  disappears here. This is where prompts, source sets and recipes actually live.
- **Portability → an explicit transport**, in two tiers:

#### Primary — Google Drive `appDataFolder`

The user is, by definition, a Google account holder — NotebookLM requires one. So we can sync through
**their own Drive** without asking them to create an account anywhere or standing up a server.

Verified for this plan:

| Question | Answer |
|---|---|
| Does it work outside Chrome? | ✅ `identity.launchWebAuthFlow` is supported in Firefox as well as Chrome/Edge — [MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/identity). (`chrome.identity.getAuthToken` is Chrome-only — must not be used.) |
| How painful is the OAuth review? | ✅ **`drive.appdata` is classified non-sensitive** — basic OAuth verification only, no Google-empanelled security assessment. [Drive API auth guide](https://developers.google.com/drive/api/guides/api-specific-auth) |
| Does it clutter the user's Drive? | ✅ No — `appDataFolder` is hidden from the Drive UI; it is the folder designed for exactly this. |
| Quota | Effectively unbounded for our payload, vs 100 KB total on `storage.sync`. |
| Where does the data sit? | In the user's own Drive. **We still run no server**, so `docs/PRIVACY.md` stays substantially true. |

Sync must be **per-record with an `updatedAt` timestamp and a merge**, not whole-blob last-write-wins —
otherwise editing a prompt on a laptop silently destroys one saved on a desktop. That is the same class of
bug as the migration defect fixed in v1.3.0.

#### Measured — a working prototype, 2026-08-02

Built as a throwaway MV3 extension and run against a real Google account with a real OAuth client
(`drive.appdata` only). Every number below is measured, not estimated.

| # | Check | Result |
|---|---|---|
| 1 | Token via `launchWebAuthFlow` | ✅ no server, no client secret |
| 2 | Create file in `appDataFolder` | ✅ 1589 ms |
| 3 | Read back | ✅ 1255 ms, byte-identical |
| 4 | Update in place | ✅ **file id unchanged** — no duplicate files accumulate |
| 5 | List the hidden folder | ✅ exactly one file; nothing appears in normal Drive |
| 6 | **Silent refresh, no UI** | ✅ **341 ms** — but only with `login_hint` (see below) |
| 7 | **Size test** — 300 notebooks × 2 sets × 200 sources | ✅ **4.49 MB**, upload 3316 ms, download 2023 ms, 300/300 intact — **46× more than `chrome.storage.sync` can hold at all** |
| 8 | Delete | ✅ folder empties; the user can wipe it |

**Silent refresh needs `login_hint` — and we can get it for free.** Three variants, tried in order:

| Variant | Result |
|---|---|
| `interactive:false`, no prompt param | ❌ `User interaction required` |
| `interactive:false` + `prompt=none` | ❌ `interaction_required` |
| `interactive:false` + `prompt=none` + **`login_hint`** | ✅ **341 ms** |

Without the account's email Google wants to show an account chooser, and the silent path dies. Asking the
user to type their address would breach requirement 1 — so the question was whether obtaining it costs an
extra scope. It does not:

| # | Check | Result |
|---|---|---|
| 9 | `drive.about.get?fields=user(emailAddress)` using only the `drive.appdata` token | ✅ **returns the address** — no `openid email` scope needed, consent screen stays single-line |
| 10 | Silent refresh using that auto-discovered address | ✅ **341 ms, nothing typed by the user** |

**Resulting production auth design:**

```
first run   →  interactive consent (once)
            →  drive.about.get → cache the email in chrome.storage.local
thereafter  →  launchWebAuthFlow({interactive:false}) + prompt=none + login_hint   (~341 ms, invisible)
fallback    →  if silent fails (user signed out of Google, or revoked access) → one interactive prompt
```

*Note on the prototype logs:* a test run showed two sign-in prompts. That was the harness deliberately
discarding the token to exercise the silent variants, then forcing a re-auth so the later steps could run —
not a property of the design. The run where the email was supplied got the silent path on the first try.

#### Can it be done entirely from the extension? — Yes.

**Runtime: 100% client-side, no server, no client secret.**

1. `identity.launchWebAuthFlow({ url, interactive: true })` opens Google's consent screen.
2. Implicit flow (`response_type=token`) returns the access token in the redirect fragment — **no token
   exchange, therefore no client secret**, therefore nothing that needs a backend.
3. Call the Drive REST API directly with `Authorization: Bearer …` and `spaces=appDataFolder`.
4. Token lives ~1 h; refresh silently with `launchWebAuthFlow({ interactive: false })` while the user's
   Google session is alive. Sync is on-demand anyway, so an occasional consent click is tolerable.

*Trade-off:* implicit flow yields no refresh token, and Google has been steering people away from it
generally. The alternative — authorization-code + PKCE — needs a token-endpoint call that Google's web
client type still expects a `client_secret` for; shipping that in an extension is common but ugly. Implicit
is the cleaner fit here, with the caveat that it may need revisiting if Google tightens it.

**The OAuth review is far lighter than feared.** Confirmed from Google's own docs:

> If an app requests **only non-sensitive scopes, verification is not required**, and users do **not** see
> the "unverified app" warning screen. The warning and the 100-user cap are triggered *only* by sensitive
> or restricted scopes.
> — [Unverified apps](https://support.google.com/cloud/answer/7454865)

Since `drive.appdata` is non-sensitive, publishing the consent screen to **Production** gives unlimited
users, no warning interstitial, and no verification process. The 100-user cap people warn about applies to
apps left in **Testing** status — which also expires consent after 7 days. So: publish, don't stay in testing.

**What cannot be done from code — one-time owner setup:**

| Step | Where | Notes |
|---|---|---|
| Create a Google Cloud project | console.cloud.google.com | free |
| Configure OAuth consent screen, **publish to Production** | same | needs app name, support email, privacy policy URL |
| Create OAuth client IDs + register redirect URIs | same | **one per browser** — Chrome uses `https://<extension-id>.chromiumapp.org/`, Firefox derives its own from the add-on ID via `identity.getRedirectURL()` |
| Add `identity` permission + `https://www.googleapis.com/*` host permission | `manifest.json` | triggers a **Chrome Web Store re-review** of an already-published extension, with a written permission justification |
| Pin the extension ID for local development | `manifest.json` `key` field | otherwise the unpacked build's ID — and thus its redirect URI — changes between machines |
| Update `docs/PRIVACY.md` + the CWS data-disclosure | repo + CWS listing | we still run no server, but data now leaves the browser for the user's own Drive; that must be stated |

#### Does it really keep the developer away from user data?

Requirement 2 deserves a precise answer rather than a reassuring one.

**What the architecture guarantees:**

- **There is no server.** No backend, no analytics, no telemetry, no error reporting endpoint. There exists
  no place the developer could query, subpoena-proof by construction rather than by policy.
- **The file lives in the user's own Drive**, in the hidden `appDataFolder` of *their* account.
- **Reading it requires an OAuth access token issued to that specific user**, obtained through their own
  consent screen, held only in their own browser. Owning the OAuth *client* does not grant the developer
  any ability to read any user's files — the client ID identifies the app, it is not a key to the data.
- **The user can revoke and wipe at any time**, without the developer's involvement: Google Account →
  third-party access → remove; and Drive → Settings → Manage apps → delete hidden app data.

**What it does not guarantee — stated plainly:**

- The Google Cloud console shows the developer **aggregate API metrics** (request counts, error rates,
  roughly how many accounts authorised). That is metadata about usage, never file contents.
- **Google can read the file**, as with anything in Drive. This is not a new trust boundary: the user is
  already entrusting Google with every source and every answer in NotebookLM itself. Adding a small config
  file to the same account widens nothing.
- **A future malicious or compromised extension update could exfiltrate anything**, because extension code
  runs with the user's token. This is inherent to *every* browser extension regardless of storage backend —
  it is not introduced by choosing Drive. It is mitigated here by the code being MIT-licensed and public,
  and by Chrome Web Store review.

Client-side encryption was considered and rejected: the key would have to come from a user passphrase,
which reintroduces exactly the hassle requirement 1 forbids, and it would protect only against Google —
who already holds the user's entire notebook corpus anyway.

#### Secondary — Export / Import JSON *(escape hatch, not the sync mechanism)*

Manual per-transfer export fails requirement 1, so it cannot be the answer to sync. It should still exist,
for three reasons that have nothing to do with convenience:

- **Backup**, independent of Google.
- **Migration path** off `chrome.storage.sync` for existing users.
- **Data portability** — users should be able to get their data out, including into a browser where Drive
  sync is unavailable (e.g. Safari). Shipping a sync feature with no exit is a bad look for a tool that
  advertises privacy.

Cheap to build (~half a day) and independent of the Drive work.

**Effort:**

| | Drive `appDataFolder` | Export / Import |
|---|---|---|
| Owner setup outside the repo | Cloud project + consent screen + 2 OAuth clients | none |
| Code | ~1–2 days (auth, token cache, Drive REST, merge, UI, error states) | ~half a day |
| Store review | re-review for new permissions, with justification | none |
| User effort | one-time connect, then automatic | manual, per transfer |
| Meets requirement 1 | ✅ | ❌ (escape hatch only) |
| Meets requirement 2 | ✅ | ✅ |

**Verdict:** build Drive `appDataFolder` as the sync mechanism, and Export/Import alongside it as backup and
exit. The two are independent, so Export/Import can land first while the Cloud project is being set up.

#### Known caveats before shipping

- **The "unverified app" warning is a Testing-status artifact.** The prototype ran with the consent screen
  in *Testing*, which shows it. Publishing to *Production* removes it — non-sensitive scopes need no
  verification. Worth confirming on the real listing before release rather than trusting the docs alone.
- **Implicit flow has no refresh token.** It works today and silent renewal is ~341 ms, but Google has been
  steering developers away from the implicit grant generally. If it is ever restricted, the fallback is
  authorization-code + PKCE, which likely means switching the client to the *Desktop app* type. Not a dead
  end, but worth a note in the code so the reason is not lost.
- **The cached email is personal data.** It stays in `chrome.storage.local`, is never transmitted anywhere
  except back to Google as `login_hint`, and must be cleared on disconnect. `docs/PRIVACY.md` needs to say so.
- **`docs/PRIVACY.md` currently contradicts this feature** — it states all data stays in
  `chrome.storage.local` and nothing is transmitted. It must be updated before any release that syncs.
- **Extension ID pinning.** Unpacked builds derive their ID from the load path, so the dev build's redirect
  URI differs from the Store build's. Pin a `key` in `manifest.json` so both share the published ID, or keep
  registering both URIs.

### Considered and rejected

| Option | Why not |
|---|---|
| Own backend (Supabase / Firebase / custom) | **Fails requirement 2 outright** — the developer would hold the data. Also: privacy policy rewrite, GDPR duties, hosting cost, account management, breach surface. |
| End-to-end encrypted own backend | Still developer-held storage, and the key must come from somewhere: a passphrase is hassle (fails requirement 1), a derived key is theatre. More work than Drive for a weaker guarantee. |
| File System Access API into a Dropbox/OneDrive folder | Chromium-only — fails the one requirement that started this discussion. |
| WebDAV / bring-your-own endpoint | Fine as a power-user extra later; far too niche to be the primary answer. |
| Storing data in a bookmark | Still vendor-scoped sync, i.e. the exact limitation we are trying to escape. |

### Prerequisite refactor

`chrome.storage.sync` is currently called directly from several places in `content.js` and `popup.js`.
Before any of this, those calls should go behind a thin storage module so the backend is swappable and the
local→sync→Drive migration happens in exactly one place.

---

## Open questions

1. Phase 1 alone, or straight through to Recipes?
2. Should a set be **per notebook** (simple, matches how sources work) or should there be shareable/global
   set *rules* (e.g. "everything added in 2026")? Rules are more powerful and much more work.
3. When sources are added after a set was saved — report only, or offer "add to set"?
4. Drive sync is settled by the two hard requirements — remaining question is only *when*: before or after
   the Source Sets work it exists to carry?

---

## Appendix — research trail

### Timeline

| Date | Event |
|---|---|
| 2026-04-03 | XDA: *"no tags, no folders, no batch select, no global search"* — the state most online complaints still describe |
| **2026-07-16** | NotebookLM rebranded to **Gemini Notebook**; domain moved to `notebook.google.com` (this is what broke the extension) |
| **2026-07-20** | **Collections** announced |

Most "NotebookLM has no folders" complaints predate 2026-07-20 and are now stale.

### Native capabilities today (measured)

| Capability | Status | Evidence |
|---|---|---|
| Custom-named categories | ✅ Collections | create dialog placeholder: `e.g., Work, Research, Personal` |
| One notebook in many categories | ✅ | Collections behave as playlists, not folders |
| Add to category from a card | ✅ | card ⋮: `Add to collection` |
| Favourites | ✅ | card ⋮: `Pin to top` |
| Search inside notebook content | ❌ **title-only** | `szemei`/`Elárulják` (in title) → 1 hit; `retina`/`fundus` (throughout that notebook's 14 sources) → **0 hits** |
| Bulk / multi-select of notebooks | ❌ none | 0 checkboxes on cards, no select-all in the grid |
| **Persisted source selection** | ❌ none | resets to all-selected on reload (measured above) |
| Sharing a Collection | ❌ | personal only |
| Query across notebooks | ❌ | each notebook is an island |
| Export to file | ❌ | only `Copy notebook` / `Copy summary` / `Copy model response` |

Structural note: the notebook grid is **not virtualised** — 72 cards were in the DOM at load and still 72
after scrolling to the bottom. Client-side filtering over the whole library is therefore cheap, should we
ever want it.

### Competitive landscape

[NotebookLM Tools](https://www.nlmtools.com/) — free, Chrome + Firefox, 35+ features: tags rendered into the
dashboard, batch rename, batch select/delete, cross-notebook search over notebooks *and* sources, bulk
import from tabs and YouTube playlists. Also in the space: *NotebookLM Organizer*, *ExtendLM*.

Generic notebook organization is crowded and solved. Nothing found in that landscape touches **source
selection inside a notebook**.

### Sources

- [XDA — I stopped manually organizing 90+ NotebookLM notebooks](https://www.xda-developers.com/stopped-manually-organizing-notebooklm-notebooks-found-these-underrated-tools/) (2026-04-03)
- [XDA — NotebookLM Tools tags workflow](https://www.xda-developers.com/notebooklm-tools-tags-workflow/)
- [NotebookLM Tools — feature list](https://www.nlmtools.com/features)
- [Android Authority — Collections in Gemini Notebook](https://www.androidauthority.com/gemini-notebook-collections-feature-3689444/)
- [Digital Trends — Collections arrive](https://www.digitaltrends.com/computing/gemini-notebooks-new-collections-arrive-just-as-google-turns-it-into-a-bigger-workspace/)
- [Medium — Gemini Notebook Collections: the one thing they can't do](https://medium.com/@kombib/gemini-notebook-collections-the-one-thing-they-cant-do-70989ffab0c1)
- [Atlas — NotebookLM limitations and pitfalls (2026)](https://www.atlasworkspace.ai/blog/notebooklm-limitations)
- [MDN — WebExtensions `identity` API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/identity) (cross-browser `launchWebAuthFlow`)
- [Google — Drive API scopes and sensitivity](https://developers.google.com/drive/api/guides/api-specific-auth) (`drive.appdata` is non-sensitive)
- [Google — Unverified apps](https://support.google.com/cloud/answer/7454865) (non-sensitive scopes need no verification and show no warning)
- [Google — Manage app audience: Testing vs Production](https://support.google.com/cloud/answer/15549945) (100-user cap and 7-day consent expiry apply to Testing status)
- Live DOM and behaviour measurements, 2026-08-02, this repository's Playwright probes
