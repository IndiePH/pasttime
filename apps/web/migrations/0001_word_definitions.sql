CREATE TABLE IF NOT EXISTS word_definitions (
  word TEXT PRIMARY KEY,
  definition TEXT NOT NULL,
  synonyms TEXT,
  antonyms TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_word_definitions_word ON word_definitions(word);
