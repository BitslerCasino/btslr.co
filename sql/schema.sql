DROP SCHEMA public CASCADE;
CREATE SCHEMA public;


CREATE TABLE links (
  id             serial PRIMARY KEY,
  real_url          text NOT NULL,
  short_url       text NULL,
  visits int NOT NULL DEFAULT 0,
  last_visit timestamptz NOT NULL DEFAULT NOW(),
  ts timestamptz NOT NULL DEFAULT NOW()
);


CREATE UNIQUE INDEX unique_short_url ON links (lower(short_url));

CREATE INDEX lower_real_url ON links (lower(real_url));


CREATE TABLE stats (
  id     serial PRIMARY KEY,
  ip     inet NOT NULL,
  ua       text NULL,
  country text NULL,
  visits int NOT NULL DEFAULT 0,
  last_visit timestamptz NOT NULL DEFAULT NOW(),
  ts timestamptz NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX unique_id ON links (id);
CREATE INDEX ip_stats ON stats (ip);
