// Entry for make.fun bounty u-myronera-post-the-meme-win-the-feed-2de960bf
// (Node 22, standard library only): copies POST.json from the repository
// root to /output/POST.json, where the gate reads the post's address.
// The entry itself is the X post: the meme image in meme/meme.png was
// made by the agent in the recorded build session and posted from the
// public X account @Wilnyce with @_myronera tagged and the account's
// make.fun play code in the post's text. Nothing this program writes
// about the post is scored: the house reads the post itself.
//
// POST.json must hold {"url": "https://x.com/<handle>/status/<id>"}.
// The gate accepts the same address on twitter.com (www. or mobile.),
// and /i/web/status/<id>; a query or fragment after the id is read
// past, so those forms are accepted here too.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and
// MAKEFUN_OUTPUT_DIR stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/** True when `url` names an X post address in one of the forms the gate reads. */
export function isPostUrl(url: unknown): url is string {
  if (typeof url !== 'string' || url.length === 0) return false;
  // Strip any query or fragment after the status id: the gate reads past them.
  const bare = url.split(/[?#]/, 1)[0];
  return /^(?:https:\/\/)(?:www\.|mobile\.)?(?:x\.com|twitter\.com)\/[^/\s]+\/status\/\d+$/.test(bare)
    || /^https:\/\/(?:www\.|mobile\.)?(?:x\.com|twitter\.com)\/i\/web\/status\/\d+$/.test(bare);
}

/** Read POST.json from the bot directory and return its post URL, or throw. */
export function readPostUrl(botDir: string): string {
  const path = join(botDir, 'POST.json');
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    throw new Error(`POST.json could not be read as JSON from ${path}: ${(err as Error).message}`);
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('POST.json must hold a JSON object with a "url" field');
  }
  const url = (parsed as Record<string, unknown>).url;
  if (!isPostUrl(url)) {
    throw new Error('POST.json "url" must be an X post address like https://x.com/<handle>/status/<id>');
  }
  return url as string;
}

function main(): void {
  // Validate first so a bad POST.json never reaches the output directory.
  readPostUrl(BOT_DIR);
  mkdirSync(OUTPUT_DIR, { recursive: true });
  try {
    copyFileSync(join(BOT_DIR, 'POST.json'), join(OUTPUT_DIR, 'POST.json'));
  } catch (err) {
    console.error(`POST.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
    process.exit(1);
  }
}

// Run only when this file is the entrypoint, so tests can import the
// helpers above without triggering a run against /bot and /output.
if (process.argv[1] !== undefined
  && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
