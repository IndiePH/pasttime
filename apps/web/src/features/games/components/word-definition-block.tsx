interface WordDefinitionBlockProps {
  word: string
  definition: string | null
  loading?: boolean
}

export function WordDefinitionBlock({
  word,
  definition,
  loading = false,
}: WordDefinitionBlockProps) {
  return (
    <div className="space-y-1 text-center">
      <p className="text-lg font-semibold tracking-wide uppercase">{word}</p>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading definition…</p>
      ) : definition ? (
        <p className="text-sm text-muted-foreground">{definition}</p>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          No dictionary entry for this word yet.
        </p>
      )}
    </div>
  )
}
