-- 최소한의 테이블 설정 (오류 없이)

-- 테이블 생성 (이미 있으면 무시)
CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    time TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    barcode TEXT UNIQUE,
    gross_packing_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS routines (
    id BIGSERIAL PRIMARY KEY,
    task TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 간단한 데이터 삽입 (중복 무시)
INSERT INTO inventory (name, quantity, barcode, gross_packing_quantity) 
SELECT 'A상품', 100, '1234567890', 20
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE barcode = '1234567890');

INSERT INTO inventory (name, quantity, barcode, gross_packing_quantity) 
SELECT 'B상품', 50, '0987654321', 10
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE barcode = '0987654321');

INSERT INTO inventory (name, quantity, barcode, gross_packing_quantity) 
SELECT 'C상품', 75, '1122334455', 15
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE barcode = '1122334455');

INSERT INTO routines (task, completed) 
SELECT '작업장 안전 점검', false
WHERE NOT EXISTS (SELECT 1 FROM routines WHERE task = '작업장 안전 점검');

INSERT INTO routines (task, completed) 
SELECT '재고 수량 확인', false
WHERE NOT EXISTS (SELECT 1 FROM routines WHERE task = '재고 수량 확인');

INSERT INTO routines (task, completed) 
SELECT '배송 준비 상품 정리', false
WHERE NOT EXISTS (SELECT 1 FROM routines WHERE task = '배송 준비 상품 정리');

INSERT INTO routines (task, completed) 
SELECT '창고 청소', false
WHERE NOT EXISTS (SELECT 1 FROM routines WHERE task = '창고 청소');
