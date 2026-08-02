// ===== Prompt Architect — user prompt storage =====
//
// chrome.storage.sync caps a single key at 8 KB. The whole prompt list used to
// live under one key, so with realistic 1.8 KB prompts the FIFTH saved prompt
// threw kQuotaBytesPerItem and was silently dropped — the popup still showed it
// because the in-memory array had been updated, but it never persisted.
//
// The list is now split across several sync keys, each kept under the per-item
// cap, which raises the ceiling from ~4 prompts to the 100 KB sync total. Every
// write also lands in chrome.storage.local (10 MB, no per-item cap) so nothing
// is ever lost, even when sync is full — and when sync does fill up the caller
// gets told, instead of the failure being swallowed.

const PA_SHARD_PREFIX = 'paPrompts_';
const PA_SHARD_INDEX = 'paPromptsShards';
const PA_LEGACY_KEY = 'userPrompts';        // pre-1.4 single-key storage
const PA_LOCAL_KEY = 'userPrompts';         // local mirror / overflow store

// Leave headroom under the 8192-byte per-item limit for the key name and JSON
// framing. A single prompt larger than this cannot be sharded any further and
// lives in the local mirror only.
const PA_SHARD_BYTES = 7000;

// Set when the list was read from a pre-1.4 layout, so the caller knows to
// write it back in the sharded form. Without this, an existing user whose
// migrationDone flag is already true would keep the old single key — and with
// it the four-prompt ceiling — until they happened to save something.
let paNeedsUpgrade = false;
function paUpgradePending() { return paNeedsUpgrade; }

function paByteLength(value) {
    return new TextEncoder().encode(JSON.stringify(value)).length;
}

/** Splits the list into groups that each serialise under the per-item cap. */
function paShard(prompts) {
    const shards = [];
    let current = [];
    for (const prompt of prompts) {
        const candidate = [...current, prompt];
        if (current.length && paByteLength(candidate) > PA_SHARD_BYTES) {
            shards.push(current);
            current = [prompt];
        } else {
            current = candidate;
        }
    }
    if (current.length) shards.push(current);
    return shards;
}

/**
 * Reads the prompt list.
 * Order: sharded sync → legacy single sync key → local mirror.
 */
async function paLoadPrompts() {
    try {
        const index = await chrome.storage.sync.get(PA_SHARD_INDEX);
        const count = index[PA_SHARD_INDEX];

        if (typeof count === 'number' && count > 0) {
            const keys = Array.from({ length: count }, (_, i) => PA_SHARD_PREFIX + i);
            const stored = await chrome.storage.sync.get(keys);
            const prompts = keys.flatMap(k => stored[k] || []);
            // The local mirror is authoritative when sync could not take
            // everything — it never rejects a write.
            const local = await chrome.storage.local.get(PA_LOCAL_KEY);
            const mirrored = local[PA_LOCAL_KEY];
            if (Array.isArray(mirrored) && mirrored.length > prompts.length) return mirrored;
            return prompts;
        }

        const legacy = await chrome.storage.sync.get(PA_LEGACY_KEY);
        if (Array.isArray(legacy[PA_LEGACY_KEY])) {
            paNeedsUpgrade = true;
            return legacy[PA_LEGACY_KEY];
        }

        const local = await chrome.storage.local.get(PA_LOCAL_KEY);
        if (Array.isArray(local[PA_LOCAL_KEY])) {
            paNeedsUpgrade = true;
            return local[PA_LOCAL_KEY];
        }
        return [];
    } catch (e) {
        console.warn('[PA] prompt load failed', e);
        return [];
    }
}

/**
 * Writes the prompt list.
 * Local first so the data is safe, then sync so it travels between devices.
 *
 * @returns {Promise<{ok: boolean, synced: boolean, error?: string}>}
 *          ok=false means even the local write failed — the only true data loss.
 *          synced=false means it is saved on this device but did not reach sync.
 */
async function paSavePrompts(prompts) {
    try {
        await chrome.storage.local.set({ [PA_LOCAL_KEY]: prompts });
    } catch (e) {
        return { ok: false, synced: false, error: e.message };
    }

    try {
        const shards = paShard(prompts);
        const payload = { [PA_SHARD_INDEX]: shards.length };
        shards.forEach((shard, i) => { payload[PA_SHARD_PREFIX + i] = shard; });

        // Drop shards left over from a previously longer list
        const existing = await chrome.storage.sync.get(PA_SHARD_INDEX);
        const previous = existing[PA_SHARD_INDEX] || 0;
        const stale = [];
        for (let i = shards.length; i < previous; i++) stale.push(PA_SHARD_PREFIX + i);

        await chrome.storage.sync.set(payload);
        paNeedsUpgrade = false;
        if (stale.length) await chrome.storage.sync.remove(stale);
        // The pre-1.4 key is redundant once shards exist
        await chrome.storage.sync.remove(PA_LEGACY_KEY).catch(() => {});

        return { ok: true, synced: true };
    } catch (e) {
        // Saved locally, just not synced — worth telling the user, not worth losing work over
        return { ok: true, synced: false, error: e.message };
    }
}

// Content scripts and the popup both load this file as a plain script.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { paLoadPrompts, paSavePrompts, paShard, paByteLength, paUpgradePending };
}
