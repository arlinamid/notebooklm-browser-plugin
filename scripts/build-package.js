#!/usr/bin/env node
/**
 * Builds the Chrome Web Store upload ZIP.
 *
 *   node scripts/build-package.js
 *
 * Ships only what the extension loads at runtime — the template sources in
 * templates/, the build scripts and the docs stay out of the package.
 *
 * The archive is written through .NET's ZipArchive with entry names spelled
 * explicitly, because PowerShell's Compress-Archive records Windows path
 * separators and the Web Store rejects the resulting entries.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
const version = manifest.version;
const outName = `prompt-architect-v${version}.zip`;
const outPath = path.join(ROOT, outName);

// Everything the manifest can reach, plus the licence Google asks to bundle.
const FILES = [
    'manifest.json',
    'LICENSE',
    'content/content.css',
    'content/content.js',
    'popup/popup.html',
    'popup/popup.css',
    'popup/popup.js',
    'data/i18n.js',
    'data/storage.js',
    'data/templates.json',
    'icons/icon16.png',
    'icons/icon48.png',
    'icons/icon128.png',
    ...fs.readdirSync(path.join(ROOT, 'data', 'locales'))
        .filter(f => f.endsWith('.json'))
        .sort()
        .map(f => `data/locales/${f}`)
];

const missing = FILES.filter(f => !fs.existsSync(path.join(ROOT, f)));
if (missing.length) {
    console.error('Missing files:\n  ' + missing.join('\n  '));
    process.exit(1);
}

// Guard against shipping a stale build: templates.json must not be older than
// the sources it is generated from.
const built = fs.statSync(path.join(ROOT, 'data', 'templates.json')).mtimeMs;
const newestSource = (function walk(dir) {
    return fs.readdirSync(dir).reduce((newest, name) => {
        const full = path.join(dir, name);
        const st = fs.statSync(full);
        return Math.max(newest, st.isDirectory() ? walk(full) : st.mtimeMs);
    }, 0);
})(path.join(ROOT, 'templates'));
if (newestSource > built) {
    console.error('data/templates.json is older than templates/ — run node scripts/build-templates.js first.');
    process.exit(1);
}

if (fs.existsSync(outPath)) fs.unlinkSync(outPath);

const ps = `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$root = ${JSON.stringify(ROOT)}
$out  = ${JSON.stringify(outPath)}
$files = @(${FILES.map(f => `'${f}'`).join(',')})
$zip = [System.IO.Compression.ZipFile]::Open($out, 'Create')
try {
  foreach ($f in $files) {
    $src = Join-Path $root $f
    # $f already uses forward slashes, so the entry name is correct by construction
    $entry = $zip.CreateEntry($f, [System.IO.Compression.CompressionLevel]::Optimal)
    $in = [System.IO.File]::OpenRead($src)
    try { $os = $entry.Open(); try { $in.CopyTo($os) } finally { $os.Dispose() } }
    finally { $in.Dispose() }
  }
} finally { $zip.Dispose() }
`;

const res = spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', ps],
    { encoding: 'utf8' });
if (res.status !== 0) {
    console.error(res.stderr || res.stdout);
    process.exit(1);
}

// Read the archive back and prove the entries are what we intended
const verify = spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [System.IO.Compression.ZipFile]::OpenRead(${JSON.stringify(outPath)})
$bad = @($z.Entries | Where-Object { $_.FullName -like '*\\*' }).Count
Write-Output ("count=" + $z.Entries.Count)
Write-Output ("backslashes=" + $bad)
$z.Dispose()
`], { encoding: 'utf8' });

const stats = fs.statSync(outPath);
console.log(`${outName}  ${(stats.size / 1024).toFixed(0)} KB`);
console.log(verify.stdout.trim().split(/\r?\n/).map(l => '  ' + l).join('\n'));
console.log(`  expected=${FILES.length}`);
