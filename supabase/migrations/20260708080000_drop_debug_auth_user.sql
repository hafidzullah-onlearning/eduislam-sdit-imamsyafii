-- Migration: Drop debug_auth_user table to resolve Supabase security alert
-- Date: 2026-07-08

DROP TABLE IF EXISTS public.debug_auth_user;
