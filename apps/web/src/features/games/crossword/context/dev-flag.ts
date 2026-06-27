/**
 * Build-time constant: true in dev and test, false in production builds.
 *
 * Next.js inlines `process.env.NODE_ENV` at build time so the
 * `!== "production"` branch becomes dead code in production and is
 * tree-shaken.  This gates the show-errors / auto-check debug affordances
 * so they never ship to end users (D-17).
 */
export const IS_CROSSWORD_DEV = process.env.NODE_ENV !== "production"
