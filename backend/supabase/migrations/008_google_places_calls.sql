CREATE TABLE google_places_calls (
  id          BIGSERIAL PRIMARY KEY,
  api         TEXT NOT NULL,          -- 'places' | 'maps'
  api_type    TEXT NOT NULL,          -- 'text_search' | 'place_details' | 'place_photo'
  query       TEXT,                   -- vyhledávací dotaz (text_search)
  place_id    TEXT,                   -- Google Place ID (place_details, place_photo)
  result_count INT,                   -- počet vrácených výsledků (text_search)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX google_places_calls_created_at_idx ON google_places_calls (created_at DESC);
