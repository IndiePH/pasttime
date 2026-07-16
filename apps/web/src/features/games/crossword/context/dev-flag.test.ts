import { describe, expect, it } from "vitest"

import { IS_CROSSWORD_DEV } from "./dev-flag"

describe("IS_CROSSWORD_DEV", () => {
  it("is true in test environment (NODE_ENV !== 'production')", () => {
    expect(IS_CROSSWORD_DEV).toBe(true)
  })
})
