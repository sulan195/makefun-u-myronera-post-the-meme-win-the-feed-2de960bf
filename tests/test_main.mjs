// Tests for main.ts (Node 22+, standard library only).
// Run: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { isPostUrl, readPostUrl } from '../main.ts';

const VALID = 'https://x.com/Wilnyce/status/2123839792785822015';

function tmpBot(postJson) {
  const dir = mkdtempSync(join(tmpdir(), 'meme-bot-'));
  if (postJson !== undefined) writeFileSync(join(dir, 'POST.json'), postJson);
  return dir;
}

test('isPostUrl accepts the canonical x.com form', () => {
  assert.equal(isPostUrl(VALID), true);
});

test('isPostUrl accepts twitter.com and www/mobile variants', () => {
  assert.equal(isPostUrl('https://twitter.com/Wilnyce/status/123'), true);
  assert.equal(isPostUrl('https://www.x.com/Wilnyce/status/123'), true);
  assert.equal(isPostUrl('https://mobile.twitter.com/Wilnyce/status/123'), true);
  assert.equal(isPostUrl('https://x.com/i/web/status/123'), true);
});

test('isPostUrl reads past a query or fragment after the id', () => {
  assert.equal(isPostUrl(`${VALID}?s=20`), true);
  assert.equal(isPostUrl(`${VALID}#fragment`), true);
});

test('isPostUrl rejects malformed addresses', () => {
  assert.equal(isPostUrl('https://x.com/<handle>/status/<id>'), false);
  assert.equal(isPostUrl('https://x.com/Wilnyce/status/abc'), false);
  assert.equal(isPostUrl('https://x.com/Wilnyce/2123839792785822015'), false);
  assert.equal(isPostUrl('https://x.com/Wilnyce/status/'), false);
  assert.equal(isPostUrl('http://x.com/Wilnyce/status/123'), false);
  assert.equal(isPostUrl('https://example.com/Wilnyce/status/123'), false);
  assert.equal(isPostUrl(''), false);
  assert.equal(isPostUrl(undefined), false);
  assert.equal(isPostUrl(123), false);
});

test('readPostUrl returns the url from a valid POST.json', () => {
  const dir = tmpBot(JSON.stringify({ url: VALID }));
  assert.equal(readPostUrl(dir), VALID);
});

test('readPostUrl ignores extra fields', () => {
  const dir = tmpBot(JSON.stringify({ url: VALID, note: 'extra' }));
  assert.equal(readPostUrl(dir), VALID);
});

test('readPostUrl throws when POST.json is missing', () => {
  const dir = tmpBot(undefined);
  assert.throws(() => readPostUrl(dir), /could not be read/);
});

test('readPostUrl throws on malformed JSON', () => {
  const dir = tmpBot('{not json');
  assert.throws(() => readPostUrl(dir), /could not be read/);
});

test('readPostUrl throws when url is missing or the wrong shape', () => {
  assert.throws(() => readPostUrl(tmpBot(JSON.stringify({}))), /"url" must be/);
  assert.throws(() => readPostUrl(tmpBot(JSON.stringify({ url: 42 }))), /"url" must be/);
  assert.throws(
    () => readPostUrl(tmpBot(JSON.stringify({ url: 'https://x.com/a/status/x' }))),
    /"url" must be/,
  );
});

test('main() copies POST.json byte-identically to the output dir', () => {
  const bot = tmpBot(JSON.stringify({ url: VALID }));
  const out = mkdtempSync(join(tmpdir(), 'meme-out-'));
  const run = spawnSync(process.execPath, ['main.ts'], {
    cwd: new URL('..', import.meta.url).pathname,
    env: { ...process.env, MAKEFUN_BOT_DIR: bot, MAKEFUN_OUTPUT_DIR: out },
    encoding: 'utf8',
  });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(readFileSync(join(out, 'POST.json'), 'utf8'), JSON.stringify({ url: VALID }));
});

test('main() creates a missing output dir and stays deterministic', () => {
  const bot = tmpBot(JSON.stringify({ url: VALID }));
  const base = mkdtempSync(join(tmpdir(), 'meme-out2-'));
  const out = join(base, 'deep', 'nested', 'out');
  const env = { ...process.env, MAKEFUN_BOT_DIR: bot, MAKEFUN_OUTPUT_DIR: out };
  const cwd = new URL('..', import.meta.url).pathname;
  const first = spawnSync(process.execPath, ['main.ts'], { cwd, env, encoding: 'utf8' });
  const second = spawnSync(process.execPath, ['main.ts'], { cwd, env, encoding: 'utf8' });
  assert.equal(first.status, 0, first.stderr);
  assert.equal(second.status, 0, second.stderr);
  assert.equal(readFileSync(join(out, 'POST.json'), 'utf8'), JSON.stringify({ url: VALID }));
});

test('main() copies POST.json byte-identically, whitespace included', () => {
  // Pretty-printed source (whitespace + trailing newline) must survive the
  // copy byte for byte: comparing JSON.stringify output to itself would not
  // prove that. (Panel finding, Fase 5 — verified, fixed here.)
  const source = JSON.stringify({ url: VALID }, null, 2) + '\n';
  const bot = tmpBot(source);
  const out = mkdtempSync(join(tmpdir(), 'meme-out4-'));
  const run = spawnSync(process.execPath, ['main.ts'], {
    cwd: new URL('..', import.meta.url).pathname,
    env: { ...process.env, MAKEFUN_BOT_DIR: bot, MAKEFUN_OUTPUT_DIR: out },
    encoding: 'utf8',
  });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(readFileSync(join(out, 'POST.json'), 'utf8'), source);
});

test('main() exits 1 on a placeholder POST.json', () => {
  const bot = tmpBot(JSON.stringify({ url: 'https://x.com/<handle>/status/<id>' }));
  const out = mkdtempSync(join(tmpdir(), 'meme-out3-'));
  const run = spawnSync(process.execPath, ['main.ts'], {
    cwd: new URL('..', import.meta.url).pathname,
    env: { ...process.env, MAKEFUN_BOT_DIR: bot, MAKEFUN_OUTPUT_DIR: out },
    encoding: 'utf8',
  });
  assert.notEqual(run.status, 0);
  assert.match(run.stderr + run.stdout, /"url" must be/);
});
