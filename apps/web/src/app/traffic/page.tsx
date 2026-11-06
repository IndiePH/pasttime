import Link from "next/link"
import { cookies } from "next/headers"

import { Button } from "@/components/ui/button"
import { SiteShell } from "@/components/shared/site-shell"
import { loadTrafficSummary, type TrafficSummary } from "@/lib/traffic/store"
import {
  countryFlag,
  countryLabel,
  digestKey,
  hexTokensMatch,
  parseTrafficRange,
  TRAFFIC_AUTH_COOKIE,
  TRAFFIC_RANGES,
  trafficSinceDay,
  utcDay,
  viewKey,
  type TrafficRange,
} from "@/lib/traffic/traffic"
import { pageMetadata } from "@/lib/seo"
import { unlockTraffic, lockTraffic } from "./actions"

export const dynamic = "force-dynamic"

export const metadata = pageMetadata({
  title: "Traffic",
  description: "Private summary of Pasttime page views and unique browsers by country.",
  path: "/traffic",
  noIndex: true,
})

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const COUNT = new Intl.NumberFormat("en-US")

function formatCount(value: number): string {
  return COUNT.format(value)
}

function countLabel(count: number, singular: string): string {
  return `${formatCount(count)} ${count === 1 ? singular : `${singular}s`}`
}

export default async function TrafficPage({ searchParams }: PageProps) {
  const params = await searchParams
  const key = viewKey()
  const authed = key ? await hasTrafficSession(key) : false
  const status = typeof params.status === "string" ? params.status : ""

  return (
    <SiteShell>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
        {authed && key ? (
          <TrafficReport range={parseTrafficRange(params.days)} />
        ) : (
          <TrafficLock
            configured={Boolean(key)}
            denied={status === "denied"}
            unconfigured={status === "unconfigured" || !key}
          />
        )}
      </div>
    </SiteShell>
  )
}

async function hasTrafficSession(key: string): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(TRAFFIC_AUTH_COOKIE)?.value
  if (!token) return false
  return hexTokensMatch(token, await digestKey(key))
}

function TrafficLock({
  configured,
  denied,
  unconfigured,
}: {
  configured: boolean
  denied: boolean
  unconfigured: boolean
}) {
  return (
    <section className="mx-auto w-full max-w-sm rounded-xl bg-card px-6 py-6 shadow-xs ring-1 ring-foreground/10">
      <h1 className="font-heading text-xl font-medium">Traffic</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Country totals for this site. The view key stays on the server.
      </p>
      {unconfigured ? (
        <p className="mt-4 text-sm">
          Set <code className="text-xs">TRAFFIC_VIEW_KEY</code> in the web
          environment, then reload this page.
        </p>
      ) : null}
      {configured ? (
        <form action={unlockTraffic} className="mt-4 space-y-3">
          <label className="block text-sm" htmlFor="traffic-key">
            View key
          </label>
          <input
            id="traffic-key"
            name="key"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          />
          {denied ? (
            <p className="text-sm text-destructive">That key does not match.</p>
          ) : null}
          <Button type="submit" className="w-full">
            Open traffic
          </Button>
        </form>
      ) : null}
    </section>
  )
}

async function TrafficReport({ range }: { range: TrafficRange }) {
  const now = new Date()
  const today = utcDay(now)
  const since = trafficSinceDay(range, now)
  let summary: TrafficSummary | null = null
  let storageError = ""

  try {
    summary = await loadTrafficSummary(since, today)
    if (!summary) storageError = "unavailable"
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    storageError = /no such table/i.test(message) ? "missing-table" : "failed"
    console.warn("traffic: summary failed", error)
  }

  const views = summary?.countries.reduce((total, row) => total + row.views, 0) ?? 0
  const visitors = summary?.visitors ?? 0
  const maxViews = summary?.countries[0]?.views ?? 0

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-medium">Traffic</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Page views and unique browsers by country, {since} through {today} UTC.
          </p>
        </div>
        <form action={lockTraffic}>
          <Button type="submit" variant="outline" size="sm">
            Lock
          </Button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        {TRAFFIC_RANGES.map((item) => (
          <Button
            key={item}
            asChild
            size="sm"
            variant={item === range ? "default" : "outline"}
          >
            <Link href={item === 30 ? "/traffic" : `/traffic?days=${item}`}>
              {item} days
            </Link>
          </Button>
        ))}
      </div>

      {storageError === "unavailable" ? (
        <p className="text-sm text-muted-foreground">
          Counts are stored in Cloudflare D1 and show up after the site is
          deployed. Local development does not write them.
        </p>
      ) : null}
      {storageError === "missing-table" ? (
        <p className="text-sm text-muted-foreground">
          The traffic table is not in this database yet. From{" "}
          <code>apps/web</code>, run <code>npm run lexicon:migrate</code> for
          production, or <code>npm run lexicon:migrate:local</code> on this
          machine.
        </p>
      ) : null}
      {storageError === "failed" ? (
        <p className="text-sm text-muted-foreground">
          The summary could not be loaded. Try again in a moment.
        </p>
      ) : null}

      {summary ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Page views" value={formatCount(views)} />
            <Metric label="Unique browsers" value={formatCount(visitors)} />
            <Metric label="Countries" value={formatCount(summary.countries.length)} />
          </div>

          <section className="space-y-3">
            <h2 className="font-heading text-base font-medium">Countries</h2>
            {summary.countries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No visits in this range yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">Views and unique browsers by country</caption>
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-3 font-medium">Country</th>
                      <th className="px-3 py-2 font-medium">Views</th>
                      <th className="py-2 pl-3 font-medium">Browsers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.countries.map((row) => {
                      const width = maxViews > 0 ? Math.max(4, (row.views / maxViews) * 100) : 0
                      const flag = countryFlag(row.country)
                      return (
                        <tr key={row.country} className="border-t border-border/70">
                          <td className="py-2 pr-3">
                            <div className="flex items-center gap-2">
                              <span className="w-6 text-center" aria-hidden="true">
                                {flag}
                              </span>
                              <span>{countryLabel(row.country)}</span>
                              <span className="text-xs text-muted-foreground">
                                {row.country}
                              </span>
                            </div>
                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-foreground/70"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2 tabular-nums">{formatCount(row.views)}</td>
                          <td className="py-2 pl-3 tabular-nums">
                            {formatCount(row.visitors)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="grid gap-6 sm:grid-cols-2">
            <CountList
              title="Days"
              rows={summary.days.map((row) => ({
                key: row.day,
                label: row.day,
                views: row.views,
                visitors: row.visitors,
              }))}
            />
            <CountList
              title="Pages"
              rows={summary.paths.map((row) => ({
                key: row.path,
                label: row.path,
                views: row.views,
              }))}
            />
          </section>

          <p className="text-xs text-muted-foreground">
            A unique browser is one browser across this date range. Clearing
            cookies, or using another browser, starts a new count. Daily and
            country counts can add up to more than the total when the same
            browser returns on another day or is seen from another country.
            Country is the Cloudflare edge code on the first counted page that
            UTC day. IP addresses are not stored. Days before this count was
            deployed still show page views, with no browser total.
          </p>
        </>
      ) : null}
    </>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card px-4 py-4 shadow-xs ring-1 ring-foreground/10">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-heading text-2xl tabular-nums">{value}</div>
    </div>
  )
}

function CountList({
  title,
  rows,
}: {
  title: string
  rows: { key: string; label: string; views: number; visitors?: number }[]
}) {
  return (
    <section className="space-y-2">
      <h2 className="font-heading text-base font-medium">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing in this range.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {rows.map((row) => (
            <li key={row.key} className="flex items-baseline justify-between gap-3">
              <span className="truncate">{row.label}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {countLabel(row.views, "view")}
                {row.visitors === undefined
                  ? ""
                  : ` · ${countLabel(row.visitors, "browser")}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
