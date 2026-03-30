CREATE TABLE frontend_events (
  id         BIGSERIAL PRIMARY KEY,
  event      TEXT NOT NULL,    -- 'map_load'
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX frontend_events_created_at_idx ON frontend_events (created_at DESC);
CREATE INDEX frontend_events_event_idx      ON frontend_events (event);
