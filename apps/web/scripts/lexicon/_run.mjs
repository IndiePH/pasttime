import { spawnSync } from "node:child_process"

/**
 * Run a command; exit the process on non-zero status unless allowFailure is true.
 */
export function run(command, args, { cwd, allowFailure = false, label } = {}) {
  const title = label ?? [command, ...args].join(" ")
  console.log(`\n▶ ${title}`)

  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  })

  if (result.error) {
    console.error(`\n✗ ${title}`)
    console.error(result.error.message)
    process.exit(1)
  }

  if (result.status !== 0 && !allowFailure) {
    console.error(`\n✗ ${title} (exit ${result.status ?? "unknown"})`)
    process.exit(result.status ?? 1)
  }

  return result.status ?? 0
}

export function runCapture(command, args, { cwd } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    shell: process.platform === "win32",
  })

  if (result.error) {
    console.error(result.error.message)
    process.exit(1)
  }

  if (result.status !== 0) {
    console.error(result.stderr || result.stdout)
    process.exit(result.status ?? 1)
  }

  return result.stdout
}
