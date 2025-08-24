-- 출퇴근 기록 테이블
CREATE TABLE IF NOT EXISTS attendance_records (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  time TEXT NOT NULL,
  date TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 재고 테이블
CREATE TABLE IF NOT EXISTS inventory (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  barcode TEXT UNIQUE,
  gross_packing_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 입출고 기록 테이블
CREATE TABLE IF NOT EXISTS inout_records (
  id BIGSERIAL PRIMARY KEY,
  product_name TEXT NOT NULL,
  barcode TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 포장 기록 테이블
CREATE TABLE IF NOT EXISTS packing_records (
  id BIGSERIAL PRIMARY KEY,
  packing_product TEXT NOT NULL,
  packing_quantity INTEGER NOT NULL,
  date TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 출고 기록 테이블
CREATE TABLE IF NOT EXISTS outgoing_records (
  id BIGSERIAL PRIMARY KEY,
  product_name TEXT NOT NULL,
  barcode TEXT NOT NULL,
  outgoing_quantity INTEGER NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 업무 루틴 테이블
CREATE TABLE IF NOT EXISTS routines (
  id BIGSERIAL PRIMARY KEY,
  task TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 초기 데이터 삽입
INSERT INTO inventory (name, quantity, barcode, gross_packing_quantity) VALUES
  ('A상품', 100, '1234567890', 20),
  ('B상품', 50, '0987654321', 10),
  ('C상품', 75, '1122334455', 15)
ON CONFLICT (barcode) DO NOTHING;

INSERT INTO routines (task, completed) VALUES
  ('작업장 안전 점검', FALSE),
  ('재고 수량 확인', FALSE),
  ('배송 준비 상품 정리', FALSE),
  ('창고 청소', FALSE)
ON CONFLICT DO NOTHING;

-- 실시간 구독을 위한 RLS (Row Level Security) 설정
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inout_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE outgoing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능하도록 정책 설정
CREATE POLICY "Allow all operations on attendance_records" ON attendance_records FOR ALL USING (true);
CREATE POLICY "Allow all operations on inventory" ON inventory FOR ALL USING (true);
CREATE POLICY "Allow all operations on inout_records" ON inout_records FOR ALL USING (true);
CREATE POLICY "Allow all operations on packing_records" ON packing_records FOR ALL USING (true);
CREATE POLICY "Allow all operations on outgoing_records" ON outgoing_records FOR ALL USING (true);
CREATE POLICY "Allow all operations on routines" ON routines FOR ALL USING (true);

-- updated_at 자동 업데이트를 위한 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 설정
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routines_updated_at BEFORE UPDATE ON routines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
