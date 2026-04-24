-- ============================================================
-- Migration 003: Exclude from Daily Limit Column
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS exclude_from_daily_limit BOOLEAN DEFAULT false;
