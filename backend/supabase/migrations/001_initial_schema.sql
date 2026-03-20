-- Trips
CREATE TABLE trips (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  emoji       TEXT NOT NULL DEFAULT '✈️',
  date_from   DATE NOT NULL,
  date_to     DATE NOT NULL,
  interests   TEXT[],
  share_token TEXT UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Days
CREATE TABLE days (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id    UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  position   INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Places
CREATE TABLE places (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id         UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_id          UUID REFERENCES days(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  emoji           TEXT,
  address         TEXT,
  website         TEXT,
  lat             FLOAT,
  lng             FLOAT,
  opening_hours   TEXT[],
  ticket          TEXT CHECK (ticket IN ('none','need','have')),
  visited         BOOLEAN NOT NULL DEFAULT false,
  note            TEXT,
  priority        TEXT CHECK (priority IN ('must-see','chci-videt','mozna')),
  time_from       TEXT,
  time_to         TEXT,
  position        INT NOT NULL DEFAULT 0,
  google_place_id TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE days ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;

-- Uživatel vidí jen své cesty
CREATE POLICY "trips_owner" ON trips
  USING (user_id = auth.uid());

-- Dny patří k cestě uživatele
CREATE POLICY "days_owner" ON days
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

-- Místa patří k cestě uživatele
CREATE POLICY "places_owner" ON places
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

-- Veřejné sdílení – read-only přes share_token
CREATE POLICY "trips_shared_read" ON trips FOR SELECT
  USING (share_token IS NOT NULL);
CREATE POLICY "days_shared_read" ON days FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE share_token IS NOT NULL));
CREATE POLICY "places_shared_read" ON places FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE share_token IS NOT NULL));
