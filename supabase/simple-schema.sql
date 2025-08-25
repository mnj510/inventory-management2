-- 간단한 Supabase 테이블 스키마 (LogisticsSystem용)

-- 출퇴근 기록 테이블
CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    time TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 재고 관리 테이블
CREATE TABLE IF NOT EXISTS inventory (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    barcode TEXT UNIQUE NOT NULL,
    gross_packing_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 업무 루틴 테이블
CREATE TABLE IF NOT EXISTS routines (
    id BIGSERIAL PRIMARY KEY,
    task TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 비활성화 (간단한 테스트용)
ALTER TABLE attendance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE routines DISABLE ROW LEVEL SECURITY;

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
('창고 청소', false);
