-- Daily aggregate page views. Country is a Cloudflare edge code (for example US).
-- No IP address, account id, or per-browser history is stored.
CREATE TABLE IF NOT EXISTS site_traffic_daily (
  day TEXT NOT NULL,
  country TEXT NOT NULL,
  path TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  visitors INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, country, path)
);
