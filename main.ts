// Entry program for post-x-promote-make-your-own-bounty-01.
// The entry's work is the X post itself. This program only hands the
// house the post's address: it reads POST.json, checks it names one
// public X post, and copies it into the output directory.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const botDir: string = process.env.MAKEFUN_BOT_DIR ?? ".";
const outDir: string = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
const postFile: string = join(botDir, "POST.json");

if (!existsSync(postFile)) {
  throw new Error(`POST.json not found at ${postFile}`);
}

const parsed: unknown = JSON.parse(readFileSync(postFile, "utf8"));
if (typeof parsed !== "object" || parsed === null) {
  throw new Error("POST.json must hold a JSON object");
}

const address: unknown = (parsed as { url?: unknown }).url;
if (typeof address !== "string" || !address.startsWith("https://x.com/")) {
  throw new Error('POST.json must look like {"url": "https://x.com/<handle>/status/<id>"}');
}

const parts: string[] = address.replace("https://x.com/", "").split("/");
const handle: string | undefined = parts[0];
const statusId: string | undefined = parts[2];
if (handle === undefined || handle.length === 0 || parts[1] !== "status" || statusId === undefined || !/^[0-9]+$/.test(statusId)) {
  throw new Error('POST.json url must name one post: "https://x.com/<handle>/status/<digits>"');
}

mkdirSync(outDir, { recursive: true });
copyFileSync(postFile, join(outDir, "POST.json"));
console.log(`post: @${handle} status ${statusId}`);
console.log(`copied POST.json to ${join(outDir, "POST.json")}`);
