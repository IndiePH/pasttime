-- One anonymous browser per UTC day. visitor_hash is a one-way hash of a
-- first-party cookie. No IP address, raw identifier, or page history is stored.
-- Days recorded before this table existed cannot be rebuilt as unique browsers.
CREATE TABLE IF NOT EXISTS site_traffic_visitor_days (
  visitor_hash TEXT NOT NULL,
  day TEXT NOT NULL,
  country TEXT NOT NULL,
  PRIMARY KEY (visitor_hash, day)
);

CREATE INDEX IF NOT EXISTS site_traffic_visitor_days_day
  ON site_traffic_visitor_days (day, country, visitor_hash);
