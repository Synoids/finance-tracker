-- ============================================================
-- Migration 005: Financial Events Lifecycle
-- ============================================================

CREATE TABLE IF NOT EXISTS public.financial_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type           TEXT NOT NULL, -- e.g., 'spending_spike', 'budget_limit', 'low_runway'
  status         TEXT NOT NULL DEFAULT 'detected' CHECK (status IN ('detected', 'active', 'acknowledged', 'resolved', 'expired')),
  priority       NUMERIC(3, 2) DEFAULT 0.5, -- 0.0 to 1.0
  confidence     NUMERIC(3, 2) DEFAULT 0.5, -- 0.0 to 1.0
  data           JSONB NOT NULL DEFAULT '{}'::jsonb, -- Event details (amount, category, etc.)
  last_surfaced_at TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.financial_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own financial events"
  ON public.financial_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial events"
  ON public.financial_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial events"
  ON public.financial_events FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial events"
  ON public.financial_events FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS financial_events_user_id_idx ON public.financial_events(user_id);
CREATE INDEX IF NOT EXISTS financial_events_status_idx ON public.financial_events(status);
CREATE INDEX IF NOT EXISTS financial_events_priority_idx ON public.financial_events(priority DESC);
