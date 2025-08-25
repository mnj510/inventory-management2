-- 기존 테이블 정리 및 새로운 설정

-- 기존 테이블들을 realtime에서 제거 (오류 방지)
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS attendance_records;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS inventory;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS routines;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS packaging_records;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS packing_records;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS inout_records;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS outgoing_records;

-- 기존 테이블 삭제 (있다면)
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS routines CASCADE;
DROP TABLE IF EXISTS packaging_records CASCADE;
DROP TABLE IF EXISTS packing_records CASCADE;
DROP TABLE IF EXISTS inout_records CASCADE;
DROP TABLE IF EXISTS outgoing_records CASCADE;

-- 새로운 테이블 생성
CREATE TABLE attendance_records (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    time TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE inventory (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    barcode TEXT UNIQUE NOT NULL,
    gross_packing_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE routines (
    id BIGSERIAL PRIMARY KEY,
    task TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 설정 (모든 사용자 접근 허용)
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

-- 모든 작업 허용 정책
CREATE POLICY "모든 사용자 접근 허용" ON attendance_records FOR ALL USING (true);
CREATE POLICY "모든 사용자 접근 허용" ON inventory FOR ALL USING (true);
CREATE POLICY "모든 사용자 접근 허용" ON routines FOR ALL USING (true);

-- 초기 데이터 삽입
INSERT INTO inventory (name, quantity, barcode, gross_packing_quantity) VALUES
('A상품', 100, '1234567890', 20),
('B상품', 50, '0987654321', 10),
('C상품', 75, '1122334455', 15);

INSERT INTO routines (task, completed) VALUES
('작업장 안전 점검', false),
('재고 수량 확인', false),
('배송 준비 상품 정리', false),
('창고 청소', false);

-- realtime 구독 추가 (선택사항)
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_records;
ALTER PUBLICATION supabase_realtime ADD TABLE inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE routines;
