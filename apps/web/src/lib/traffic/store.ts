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
  visitors: number
}

export type TrafficSummary = {
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
  visitor: boolean
}): Promise<boolean> {
  const db = await trafficDb()
  if (!db) return false

  await db
    .prepare(
      `INSERT INTO site_traffic_daily (day, country, path, views, visitors)
       VALUES (?, ?, ?, 1, ?)
       ON CONFLICT(day, country, path) DO UPDATE SET
         views = views + 1,
         visitors = visitors + excluded.visitors`,
    )
    .bind(input.day, input.country, input.path, input.visitor ? 1 : 0)
    .run()

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
      `SELECT country, SUM(views) AS views, SUM(visitors) AS visitors
       FROM site_traffic_daily
       WHERE day >= ? AND day <= ?
       GROUP BY country
       ORDER BY views DESC
       LIMIT 50`,
    )
    .bind(sinceDay, throughDay)
    .all<CountRow & { country: string }>()

  const days = await db
    .prepare(
      `SELECT day, SUM(views) AS views, SUM(visitors) AS visitors
       FROM site_traffic_daily
       WHERE day >= ? AND day <= ?
       GROUP BY day
       ORDER BY day DESC`,
    )
    .bind(sinceDay, throughDay)
    .all<CountRow & { day: string }>()

  const paths = await db
    .prepare(
      `SELECT path, SUM(views) AS views, SUM(visitors) AS visitors
       FROM site_traffic_daily
       WHERE day >= ? AND day <= ?
       GROUP BY path
       ORDER BY views DESC
       LIMIT 15`,
    )
    .bind(sinceDay, throughDay)
    .all<CountRow & { path: string }>()

  return {
    countries: (countries.results ?? []).map((row) => ({
      country: row.country,
      views: asCount(row.views),
      visitors: asCount(row.visitors),
    })),
    days: (days.results ?? []).map((row) => ({
      day: row.day,
      views: asCount(row.views),
      visitors: asCount(row.visitors),
    })),
    paths: (paths.results ?? []).map((row) => ({
      path: row.path,
      views: asCount(row.views),
      visitors: asCount(row.visitors),
    })),
  }
}
