const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// SQLite 데이터베이스 파일 경로
const dbPath = path.join(process.cwd(), 'logistics.db');

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath);

// 테이블 생성
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    barcode TEXT,
    gross_packing_quantity INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS inout_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    barcode TEXT,
    type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS packing_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    packing_product TEXT NOT NULL,
    packing_quantity INTEGER NOT NULL,
    date TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS outgoing_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    barcode TEXT,
    outgoing_quantity INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 초기 데이터 삽입
  db.get("SELECT COUNT(*) as count FROM inventory", (err, row) => {
    if (err) {
      console.error('재고 데이터 확인 오류:', err);
      return;
    }
    
    if (row.count === 0) {
      const initialInventory = [
        ['A상품', 100, '1234567890', 20],
        ['B상품', 50, '0987654321', 10],
        ['C상품', 75, '1122334455', 15]
      ];
      
      const stmt = db.prepare('INSERT INTO inventory (name, quantity, barcode, gross_packing_quantity) VALUES (?, ?, ?, ?)');
      initialInventory.forEach(item => stmt.run(item));
      stmt.finalize();
      console.log('초기 재고 데이터가 삽입되었습니다.');
    }
  });
});

module.exports = function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method } = req;

  switch (method) {
    case 'GET':
      // 모든 재고 조회
      db.all('SELECT * FROM inventory ORDER BY id', (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(rows);
      });
      break;

    case 'POST':
      // 새 재고 추가
      const { name, quantity, barcode, grossPackingQuantity } = req.body;
      db.run('INSERT INTO inventory (name, quantity, barcode, gross_packing_quantity) VALUES (?, ?, ?, ?)', 
        [name, quantity, barcode, grossPackingQuantity], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ id: this.lastID, name, quantity, barcode, grossPackingQuantity });
      });
      break;

    case 'PUT':
      // 재고 수정
      const { id } = req.query;
      const updateData = req.body;
      db.run('UPDATE inventory SET name = ?, quantity = ?, barcode = ?, gross_packing_quantity = ? WHERE id = ?', 
        [updateData.name, updateData.quantity, updateData.barcode, updateData.grossPackingQuantity, id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ id, ...updateData });
      });
      break;

    case 'DELETE':
      // 재고 삭제
      const deleteId = req.query.id;
      db.run('DELETE FROM inventory WHERE id = ?', [deleteId], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: '재고가 삭제되었습니다.' });
      });
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
