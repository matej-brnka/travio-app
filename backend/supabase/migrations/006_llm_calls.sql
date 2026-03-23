CREATE TABLE llm_calls (
  id BIGSERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '{}'::jsonb,
  messages JSONB NOT NULL,
  prompt_tokens INT,
  completion_tokens INT,
  total_tokens INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX llm_calls_created_at_idx ON llm_calls (created_at DESC);
