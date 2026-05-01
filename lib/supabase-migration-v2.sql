-- AUS Connect Migration v2
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/opmykhrqtbhzyblpttcg/sql
-- Adds date_of_birth and season_stats (JSONB) to player_profiles

ALTER TABLE public.player_profiles
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS season_stats jsonb DEFAULT '[]'::jsonb;
