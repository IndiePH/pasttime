import { getCloudflareContext } from "@opennextjs/cloudflare"

export type CountryTotal = {
  country: string
  views: number
  visitors: number
}

export type DayTotal = {
  day: string
  views: number
  visitors: number
}

export type PathTotal = {
  path: string
  views: number
}

export type TrafficSummary = {
  visitors: number
  countries: CountryTotal[]
  days: DayTotal[]
  paths: PathTotal[]
}

type CountRow = {
  views: number | string | null
  visitors: number | string | null
}

function asCount(value: number | string | null | undefined): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

async function trafficDb() {
  try {
    const { env } = await getCloudflareContext({ async: true })
    return env.LEXICON_DB ?? null
  } catch {
    return null
  }
}

export async function recordTrafficHit(input: {
  day: string
  country: string
  path: string
  visitorHash: string
}): Promise<boolean> {
  const db = await trafficDb()
  if (!db) return false

  await db.batch([
    db
      .prepare(
        `INSERT INTO site_traffic_daily (day, country, path, views, visitors)
         VALUES (?, ?, ?, 1, 0)
         ON CONFLICT(day, country, path) DO UPDATE SET
           views = views + 1`,
      )
      .bind(input.day, input.country, input.path),
    db
      .prepare(
        `INSERT OR IGNORE INTO site_traffic_visitor_days (visitor_hash, day, country)
         VALUES (?, ?, ?)`,
      )
      .bind(input.visitorHash, input.day, input.country),
  ])

  return true
}

export async function loadTrafficSummary(
  sinceDay: string,
  throughDay: string,
): Promise<TrafficSummary | null> {
  const db = await trafficDb()
  if (!db) return null

  const countries = await db
    .prepare(
      `SELECT country, SUM(views) AS views
       FROM site_traffic_daily
       WHERE day >= ? AND day <= ?
       GROUP BY country`,
    )
    .bind(sinceDay, throughDay)
    .all<CountRow & { country: string }>()

  const countryVisitors = await db
    .prepare(
      `SELECT country, COUNT(DISTINCT visitor_hash) AS visitors
       FROM site_traffic_visitor_days
       WHERE day >= ? AND day <= ?
       GROUP BY country`,
    )
    .bind(sinceDay, throughDay)
    .all<CountRow & { country: string }>()

  const unique = await db
    .prepare(
      `SELECT COUNT(DISTINCT visitor_hash) AS visitors
       FROM site_traffic_visitor_days
       WHERE day >= ? AND day <= ?`,
    )
    .bind(sinceDay, throughDay)
    .first<{ visitors: number | string | null }>()

  const days = await db
    .prepare(
      `SELECT day, SUM(views) AS views
       FROM site_traffic_daily
       WHERE day >= ? AND day <= ?
       GROUP BY day`,
    )
    .bind(sinceDay, throughDay)
    .all<CountRow & { day: string }>()

  const dayVisitors = await db
    .prepare(
      `SELECT day, COUNT(DISTINCT visitor_hash) AS visitors
       FROM site_traffic_visitor_days
       WHERE day >= ? AND day <= ?
       GROUP BY day`,
    )
    .bind(sinceDay, throughDay)
    .all<CountRow & { day: string }>()

  const paths = await db
    .prepare(
      `SELECT path, SUM(views) AS views
       FROM site_traffic_daily
       WHERE day >= ? AND day <= ?
       GROUP BY path
       ORDER BY views DESC
       LIMIT 15`,
    )
    .bind(sinceDay, throughDay)
    .all<CountRow & { path: string }>()

  const countryCounts = mergeCounts(
    (countries.results ?? []).map((row) => ({
      key: row.country,
      views: asCount(row.views),
    })),
    (countryVisitors.results ?? []).map((row) => ({
      key: row.country,
      visitors: asCount(row.visitors),
    })),
  )
  const dayCounts = mergeCounts(
    (days.results ?? []).map((row) => ({
      key: row.day,
      views: asCount(row.views),
    })),
    (dayVisitors.results ?? []).map((row) => ({
      key: row.day,
      visitors: asCount(row.visitors),
    })),
  )

  return {
    visitors: asCount(unique?.visitors),
    countries: [...countryCounts.entries()]
      .map(([country, counts]) => ({ country, ...counts }))
      .sort(
        (a, b) =>
          b.views - a.views || b.visitors - a.visitors || a.country.localeCompare(b.country),
      )
      .slice(0, 50),
    days: [...dayCounts.entries()]
      .map(([day, counts]) => ({ day, ...counts }))
      .sort((a, b) => b.day.localeCompare(a.day)),
    paths: (paths.results ?? []).map((row) => ({
      path: row.path,
      views: asCount(row.views),
    })),
  }
}

function mergeCounts(
  viewRows: { key: string; views: number }[],
  visitorRows: { key: string; visitors: number }[],
): Map<string, { views: number; visitors: number }> {
  const merged = new Map<string, { views: number; visitors: number }>()
  for (const row of viewRows) {
    merged.set(row.key, { views: row.views, visitors: 0 })
  }
  for (const row of visitorRows) {
    const current = merged.get(row.key) ?? { views: 0, visitors: 0 }
    current.visitors = row.visitors
    merged.set(row.key, current)
  }
  return merged
}

/** All-time views for game paths. Null when the traffic table is unavailable. */
export async function loadGamePathViews(): Promise<
  { path: string; views: number }[] | null
> {
  const db = await trafficDb()
  if (!db) return null

  try {
    const paths = await db
      .prepare(
        `SELECT path, SUM(views) AS views
         FROM site_traffic_daily
         WHERE path LIKE '/games/%'
         GROUP BY path`,
      )
      .all<{ path: string; views: number | string | null }>()

    return (paths.results ?? []).map((row) => ({
      path: row.path,
      views: asCount(row.views),
    }))
  } catch {
    return null
  }
}
