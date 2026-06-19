# Brain Schema
VERSION: 1.0.0

A persistent wiki maintained by Claude, inspired by Karpathy's LLM-wiki approach.
The wiki compounds knowledge over time. Claude reads, updates, and cross-links pages.
Raw sources are immutable. Wiki pages are Claude-maintained. This schema is the contract.

---

## Structure

```
brain/
  schema.md          ← this file: operations, page format, lint rules
  wiki/
    index.md         ← master page list with one-line summaries
    *.md             ← individual wiki pages
  sources/
    .gitkeep         ← raw reference docs, PDFs, links (immutable — never edited by Claude)
```

---

## Page Format

Every wiki page uses this header:

```markdown
# {Title}
updated: {YYYY-MM-DD}
tags: [{tag1}, {tag2}]
related: [{page-name}, {page-name}]

{content}
```

- `tags`: category labels (architecture, decision, pattern, api, devops, etc.)
- `related`: names of pages this one links to (no `.md` suffix)
- Keep each page focused on one concept. If a page grows past ~400 lines, split it.

---

## Operations

### Ingest
Trigger: user provides a new source (doc, link, paste, conversation insight).

1. Read the source.
2. Identify key concepts, decisions, patterns, or facts worth preserving.
3. For each concept: find the most relevant existing page in `wiki/index.md`.
   - If page exists: update it — integrate the new information, update `updated:` date, add cross-links.
   - If no page fits: create a new page. Add it to `wiki/index.md`.
4. Update `related:` fields on pages that now link to each other.
5. Never delete information from wiki pages — deprecate with a note instead.

### Query
Trigger: user asks a question about project knowledge.

1. Read `wiki/index.md` to identify 2–4 relevant pages.
2. Read those pages.
3. Synthesize an answer from wiki content.
4. If the answer is new or refines existing knowledge → offer to file it back as a wiki update (Ingest).

### Lint
Trigger: user asks to "lint the brain", "check the wiki", or "health check".

Check for:
- Orphaned pages: pages not referenced in `wiki/index.md`
- Stale pages: `updated:` date older than 90 days with no recent activity
- Missing cross-links: pages that mention a concept without a `related:` entry
- Contradictions: two pages stating opposing facts about the same thing
- Oversized pages: > 400 lines (recommend split)

Output:
```
orphaned: {list}
stale: {list}
missing-links: {page} mentions {concept} but no related: entry
contradictions: {page-a} says X, {page-b} says Y
oversized: {list}
```

---

## Claude's Role

- **Never edit sources/** — those files are read-only reference material.
- **Always update index.md** when creating a new wiki page.
- **Prefer updating existing pages** over creating new ones. One concept = one page.
- **Cross-link liberally** — the `related:` field is cheap and makes the wiki navigable.
- **Date every update** — `updated:` keeps stale content visible.
- When asked to "remember X", treat it as an Ingest operation.
- When in doubt about where knowledge belongs, put it in the most specific page, then link up.

---

## Philosophical Note

The tedious part of a knowledge base is not the reading or thinking — it's the bookkeeping.
Claude does the bookkeeping. You do the curation and direction.

Inspired by Vannevar Bush's Memex (1945) and Karpathy's LLM-wiki concept (2025).
