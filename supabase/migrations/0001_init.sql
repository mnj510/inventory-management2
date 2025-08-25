-- Idempotent schema + publication + RLS + seed (safe to re-run)

-- 1) Tables
CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE IF NOT EXISTS public.products (
  id           BIGSERIAL PRIMARY KEY,
  barcode      TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  stock        INTEGER NOT NULL DEFAULT 0,
  min_stock    INTEGER NOT NULL DEFAULT 5,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id            BIGSERIAL PRIMARY KEY,
  product_id    BIGINT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name  TEXT,
  type          TEXT NOT NULL CHECK (type IN ('IN','OUT')),
  quantity      INTEGER NOT NULL,
  date          DATE NOT NULL,
  time          TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_outbound (
  id            BIGSERIAL PRIMARY KEY,
  product_id    BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
  product_name  TEXT,
  barcode       TEXT,
  stock         INTEGER,
  min_stock     INTEGER,
  quantity      INTEGER NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.packaging_records (
  id            BIGSERIAL PRIMARY KEY,
  product_id    BIGINT REFERENCES public.products(id) ON DELETE SET NULL,
  quantity      INTEGER NOT NULL DEFAULT 1,
  memo          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products (barcode);
CREATE INDEX IF NOT EXISTS idx_tx_product_id ON public.transactions (product_id);
CREATE INDEX IF NOT EXISTS idx_outbound_product_id ON public.daily_outbound (product_id);

-- 2) Realtime publication (exists-only + duplicate safe)
ALTER TABLE public.products           REPLICA IDENTITY FULL;
ALTER TABLE public.transactions       REPLICA IDENTITY FULL;
ALTER TABLE public.daily_outbound     REPLICA IDENTITY FULL;
ALTER TABLE public.packaging_records  REPLICA IDENTITY FULL;

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
    SELECT 'products' AS t UNION ALL
    SELECT 'transactions' UNION ALL
    SELECT 'daily_outbound' UNION ALL
    SELECT 'packaging_records'
  LOOP
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = rec.t
      ) THEN
        EXECUTE format('ALTER PUBLICATION %I ADD TABLE %I.%I', tgt_pub, 'public', rec.t);
      END IF;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END LOOP;
END
$$ LANGUAGE plpgsql;

-- 3) RLS open policies for prototype (adjust in production)
ALTER TABLE public.products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_outbound    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packaging_records ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['products','transactions','daily_outbound','packaging_records'] LOOP
    BEGIN EXECUTE format('CREATE POLICY %I_all_select ON public.%I FOR SELECT USING (true);', t, t); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN EXECUTE format('CREATE POLICY %I_all_insert ON public.%I FOR INSERT WITH CHECK (true);', t, t); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN EXECUTE format('CREATE POLICY %I_all_update ON public.%I FOR UPDATE USING (true) WITH CHECK (true);', t, t); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN EXECUTE format('CREATE POLICY %I_all_delete ON public.%I FOR DELETE USING (true);', t, t); EXCEPTION WHEN duplicate_object THEN NULL; END;
  END LOOP;
END $$ LANGUAGE plpgsql;

-- 4) Seed data (no duplicates)
INSERT INTO public.products (barcode, name, stock, min_stock)
VALUES
  ('880000000001','포그니 뒤꿈치 패드',10,3),
  ('880000000002','쿠팡 슬리퍼',5,2)
ON CONFLICT (barcode) DO NOTHING;


