-- App tables for src/services/api.js (attendance_records, inventory, routines)
-- Idempotent and safe to run multiple times

-- 1) Tables
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id          BIGSERIAL PRIMARY KEY,
  user_id     TEXT,
  status      TEXT,
  memo        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory (
  id                     BIGSERIAL PRIMARY KEY,
  name                   TEXT NOT NULL,
  quantity               INTEGER NOT NULL DEFAULT 0,
  barcode                TEXT,
  grossPackingQuantity   INTEGER,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.routines (
  id          BIGSERIAL PRIMARY KEY,
  task        TEXT NOT NULL,
  completed   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Indexes
CREATE INDEX IF NOT EXISTS idx_inv_name ON public.inventory (name);
CREATE INDEX IF NOT EXISTS idx_att_created ON public.attendance_records (created_at);
CREATE INDEX IF NOT EXISTS idx_routines_created ON public.routines (created_at);

-- 3) Realtime
ALTER TABLE public.attendance_records REPLICA IDENTITY FULL;
ALTER TABLE public.inventory           REPLICA IDENTITY FULL;
ALTER TABLE public.routines            REPLICA IDENTITY FULL;

DO $$
DECLARE
  tgt_pub text := 'supabase_realtime';
  rec record;
BEGIN
  PERFORM 1 FROM pg_publication WHERE pubname = tgt_pub;
  IF NOT FOUND THEN
    EXECUTE format('CREATE PUBLICATION %I', tgt_pub);
  END IF;

  FOR rec IN
    SELECT 'attendance_records' AS t UNION ALL
    SELECT 'inventory' UNION ALL
    SELECT 'routines'
  LOOP
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = rec.t
      ) THEN
        EXECUTE format('ALTER PUBLICATION %I ADD TABLE %I.%I', tgt_pub, 'public', rec.t);
      END IF;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END LOOP;
END $$ LANGUAGE plpgsql;

-- 4) RLS
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines            ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['attendance_records','inventory','routines'] LOOP
    BEGIN EXECUTE format('CREATE POLICY %I_all_select ON public.%I FOR SELECT USING (true);', t, t); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN EXECUTE format('CREATE POLICY %I_all_insert ON public.%I FOR INSERT WITH CHECK (true);', t, t); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN EXECUTE format('CREATE POLICY %I_all_update ON public.%I FOR UPDATE USING (true) WITH CHECK (true);', t, t); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN EXECUTE format('CREATE POLICY %I_all_delete ON public.%I FOR DELETE USING (true);', t, t); EXCEPTION WHEN duplicate_object THEN NULL; END;
  END LOOP;
END $$ LANGUAGE plpgsql;


