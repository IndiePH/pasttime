import type { ComparativeRanking } from "@pasttime/domain/engagement"

interface ComparativeRankingsListProps {
  rankings: ComparativeRanking[]
  title?: string
}

export function ComparativeRankingsList({
  rankings,
  title = "How you compare",
}: ComparativeRankingsListProps) {
  if (rankings.length === 0) return null

  return (
    <div className="space-y-2">
      {title ? <p className="text-sm font-medium">{title}</p> : null}
      <ul className="space-y-1.5">
        {rankings.map((item) => (
          <li key={item.metric} className="text-sm text-muted-foreground">
            {item.label}{" "}
            <span className="font-semibold text-foreground">
              {item.percentile}%
            </span>{" "}
            of players
          </li>
        ))}
      </ul>
    </div>
  )
}
