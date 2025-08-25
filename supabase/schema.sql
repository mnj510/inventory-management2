-- LogisticsSystem을 위한 Supabase 테이블 스키마

-- 출퇴근 기록 테이블
CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(10) NOT NULL CHECK (type IN ('출근', '퇴근')),
    time VARCHAR(10) NOT NULL,
    date VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 재고 관리 테이블
CREATE TABLE IF NOT EXISTS inventory (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 0,
    barcode VARCHAR(255) UNIQUE NOT NULL,
    gross_packing_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 업무 루틴 테이블
CREATE TABLE IF NOT EXISTS routines (
    id BIGSERIAL PRIMARY KEY,
    task TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 입출고 기록 테이블
CREATE TABLE IF NOT EXISTS inout_records (
    id BIGSERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    barcode VARCHAR(255),
    type VARCHAR(10) NOT NULL CHECK (type IN ('입고', '출고')),
    quantity INTEGER NOT NULL,
    date VARCHAR(20) NOT NULL,
    time VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 포장 기록 테이블
CREATE TABLE IF NOT EXISTS packing_records (
    id BIGSERIAL PRIMARY KEY,
    packing_product VARCHAR(255) NOT NULL,
    packing_quantity INTEGER NOT NULL,
    date VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 출고 기록 테이블
CREATE TABLE IF NOT EXISTS outgoing_records (
    id BIGSERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    barcode VARCHAR(255),
    outgoing_quantity INTEGER NOT NULL,
    date VARCHAR(20) NOT NULL,
    time VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 초기 데이터 삽입
INSERT INTO inventory (name, quantity, barcode, gross_packing_quantity) VALUES
('A상품', 100, '1234567890', 20),
('B상품', 50, '0987654321', 10),
('C상품', 75, '1122334455', 15)
ON CONFLICT (barcode) DO NOTHING;

INSERT INTO routines (task, completed) VALUES
('작업장 안전 점검', false),
('재고 수량 확인', false),
('배송 준비 상품 정리', false),
('창고 청소', false)
ON CONFLICT DO NOTHING;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_inventory_barcode ON inventory(barcode);
CREATE INDEX IF NOT EXISTS idx_inout_records_date ON inout_records(date);
CREATE INDEX IF NOT EXISTS idx_packing_records_date ON packing_records(date);
CREATE INDEX IF NOT EXISTS idx_outgoing_records_date ON outgoing_records(date);

-- Row Level Security (RLS) 활성화
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE inout_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE outgoing_records ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 모든 테이블에 접근 가능하도록 정책 설정
CREATE POLICY "Enable all operations for all users" ON attendance_records FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON inventory FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON routines FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON inout_records FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON packing_records FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON outgoing_records FOR ALL USING (true);

-- 트리거 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_routines_updated_at BEFORE UPDATE ON routines FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
