#!/usr/bin/env node
/**
 * One-shot lexicon infra + publish + web deploy.
 *
 * Usage (from repo root):
 *   npm run lexicon:ship -w @pasttime/web
 *
 * Options:
 *   --skip-setup   Skip R2/D1 create (repeat publish+deploy after first run)
 *   --no-deploy    Run setup + migrate + publish only (no OpenNext deploy)
 *   --no-migrate   Skip D1 migrations (lexicon content-only refresh)
 *   --allow-existing-setup  Bypass first-run safety check for setup mode
 *
 * Exits immediately on the first failing step.
 */
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { run, runCapture } from "./_run.mjs"

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = join(SCRIPT_DIR, "..", "..")
const WRANGLER_CONFIG = join(WEB_ROOT, "wrangler.jsonc")

const BUCKET = process.env.LEXICON_R2_BUCKET ?? "pasttime-content"
const D1_NAME = process.env.LEXICON_D1_NAME ?? "pasttime-lexicon"

const args = new Set(process.argv.slice(2))
const skipSetup = args.has("--skip-setup")
const noDeploy = args.has("--no-deploy")
const noMigrate = args.has("--no-migrate")
const allowExistingSetup = args.has("--allow-existing-setup")

function ensureWranglerAuth() {
  run("npx", ["wrangler", "whoami"], { cwd: WEB_ROOT, label: "wrangler whoami" })
}

function bucketExists(name) {
  const output = runCapture("npx", ["wrangler", "r2", "bucket", "list"], { cwd: WEB_ROOT })
  return output.split(/\r?\n/).some((line) => line.includes(name))
}

function getExistingD1() {
  const listed = runCapture("npx", ["wrangler", "d1", "list"], { cwd: WEB_ROOT })
  return parseD1List(listed)[0] ?? null
}

function assertFirstRunSetup() {
  const hasBucket = bucketExists(BUCKET)
  const existingDb = getExistingD1()

  if (!hasBucket && !existingDb) {
    console.log("\n✓ First-run setup check passed (R2 bucket and D1 database not found).")
    return
  }

  if (allowExistingSetup) {
    console.log(
      "\n! Existing setup detected, but continuing due to --allow-existing-setup.",
    )
    return
  }

  console.error("\n✗ First-run safety check failed.")
  if (hasBucket) {
    console.error(`  - R2 bucket already exists: ${BUCKET}`)
  }
  if (existingDb) {
    console.error(`  - D1 database already exists: ${D1_NAME} (${existingDb.id})`)
  }
  console.error("\nUse one of these commands:")
  console.error("  - npm run lexicon:ship:content")
  console.error("  - npm run lexicon:ship -w @pasttime/web -- --allow-existing-setup")
  process.exit(1)
}

function ensureR2Bucket() {
  if (bucketExists(BUCKET)) {
    console.log(`\n✓ R2 bucket already exists: ${BUCKET}`)
    return
  }

  console.log(`\n… creating R2 bucket: ${BUCKET}`)
  run("npx", ["wrangler", "r2", "bucket", "create", BUCKET], { cwd: WEB_ROOT })
  console.log(`✓ R2 bucket ready: ${BUCKET}`)
}

function parseD1List(output) {
  const databases = []
  for (const line of output.split(/\r?\n/)) {
    const match = line.match(
      /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
    )
    if (match && line.toLowerCase().includes(D1_NAME.toLowerCase())) {
      databases.push({ name: D1_NAME, id: match[1] })
    }
  }
  return databases
}

function readWranglerDatabaseId() {
  const raw = readFileSync(WRANGLER_CONFIG, "utf8")
  const match = raw.match(/"database_name"\s*:\s*"pasttime-lexicon"[\s\S]*?"database_id"\s*:\s*"([^"]+)"/)
  return match?.[1] ?? null
}

function writeWranglerDatabaseId(databaseId) {
  const raw = readFileSync(WRANGLER_CONFIG, "utf8")
  if (raw.includes('"database_id"')) {
    return
  }

  const updated = raw.replace(
    /("database_name"\s*:\s*"pasttime-lexicon",\s*\r?\n\s*"migrations_dir")/,
    `"database_name": "pasttime-lexicon",\n\t\t\t"database_id": "${databaseId}",\n\t\t\t"migrations_dir"`,
  )

  if (updated === raw) {
    console.error(
      "\n✗ Could not patch database_id into wrangler.jsonc — add it manually.",
    )
    process.exit(1)
  }

  writeFileSync(WRANGLER_CONFIG, updated)
  console.log(`✓ Added database_id to wrangler.jsonc`)
  run("npm", ["run", "cf-typegen"], { cwd: WEB_ROOT, label: "cf-typegen" })
}

function ensureD1Database() {
  const existing = getExistingD1()

  if (existing) {
    console.log(`\n✓ D1 database already exists: ${D1_NAME} (${existing.id})`)
    if (!readWranglerDatabaseId()) {
      writeWranglerDatabaseId(existing.id)
    }
    return
  }

  console.log(`\n… creating D1 database: ${D1_NAME}`)
  const created = runCapture("npx", ["wrangler", "d1", "create", D1_NAME], {
    cwd: WEB_ROOT,
  })

  const idMatch = created.match(
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
  )
  if (!idMatch) {
    console.error("\n✗ Could not parse database_id from wrangler d1 create output.")
    console.error(created)
    process.exit(1)
  }

  writeWranglerDatabaseId(idMatch[1])
  console.log(`✓ D1 database ready: ${D1_NAME}`)
}

function applyMigrations() {
  run("npx", ["wrangler", "d1", "migrations", "apply", D1_NAME, "--remote"], {
    cwd: WEB_ROOT,
    label: "d1 migrations apply",
  })
}

function publishLexicon() {
  run("node", ["scripts/lexicon/publish-lexicon.mjs"], {
    cwd: WEB_ROOT,
    label: "lexicon publish",
  })
}

function deployWeb() {
  run("npm", ["run", "deploy"], { cwd: WEB_ROOT, label: "opennext deploy" })
}

console.log("Pastime lexicon ship")
console.log(
  `  setup=${skipSetup ? "skip" : "run"} migrate=${noMigrate ? "skip" : "run"} deploy=${noDeploy ? "skip" : "run"}`,
)

ensureWranglerAuth()

if (!skipSetup) {
  assertFirstRunSetup()
  ensureR2Bucket()
  ensureD1Database()
}

if (!noMigrate) {
  applyMigrations()
}

publishLexicon()

if (!noDeploy) {
  deployWeb()
}

console.log("\n✓ Lexicon ship complete.")
