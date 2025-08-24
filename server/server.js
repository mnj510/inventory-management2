const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5001;

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());

// SQLite 데이터베이스 연결
const db = new sqlite3.Database('./logistics.db', (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err.message);
  } else {
    console.log('SQLite 데이터베이스에 연결되었습니다.');
    initializeDatabase();
  }
});

// 데이터베이스 초기화
function initializeDatabase() {
  // 출퇴근 기록 테이블
  db.run(`CREATE TABLE IF NOT EXISTS attendance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    time TEXT NOT NULL,
    date TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 재고 테이블
  db.run(`CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    barcode TEXT UNIQUE,
    gross_packing_quantity INTEGER DEFAULT 0
  )`);

  // 입출고 기록 테이블
  db.run(`CREATE TABLE IF NOT EXISTS inout_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    barcode TEXT NOT NULL,
    type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 포장 기록 테이블
  db.run(`CREATE TABLE IF NOT EXISTS packing_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    packing_product TEXT NOT NULL,
    packing_quantity INTEGER NOT NULL,
    date TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 출고 기록 테이블
  db.run(`CREATE TABLE IF NOT EXISTS outgoing_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    barcode TEXT NOT NULL,
    outgoing_quantity INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 업무 루틴 테이블
  db.run(`CREATE TABLE IF NOT EXISTS routines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0
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

  db.get("SELECT COUNT(*) as count FROM routines", (err, row) => {
    if (err) {
      console.error('업무 루틴 데이터 확인 오류:', err);
      return;
    }
    
    if (row.count === 0) {
      const initialRoutines = [
        ['작업장 안전 점검', 0],
        ['재고 수량 확인', 0],
        ['배송 준비 상품 정리', 0],
        ['창고 청소', 0]
      ];
      
      const stmt = db.prepare('INSERT INTO routines (task, completed) VALUES (?, ?)');
      initialRoutines.forEach(item => stmt.run(item));
      stmt.finalize();
      console.log('초기 업무 루틴 데이터가 삽입되었습니다.');
    }
  });
}

// 출퇴근 기록 API
app.get('/api/attendance', (req, res) => {
  db.all('SELECT * FROM attendance_records ORDER BY timestamp DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/attendance', (req, res) => {
  const { type, time, date } = req.body;
  db.run('INSERT INTO attendance_records (type, time, date) VALUES (?, ?, ?)', 
    [type, time, date], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, type, time, date });
  });
});

app.put('/api/attendance/:id', (req, res) => {
  const { type, time, date } = req.body;
  const { id } = req.params;
  db.run('UPDATE attendance_records SET type = ?, time = ?, date = ? WHERE id = ?', 
    [type, time, date, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, type, time, date });
  });
});

app.delete('/api/attendance/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM attendance_records WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '기록이 삭제되었습니다.' });
  });
});

// 재고 API
app.get('/api/inventory', (req, res) => {
  db.all('SELECT * FROM inventory ORDER BY id', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/inventory', (req, res) => {
  const { name, quantity, barcode, grossPackingQuantity } = req.body;
  db.run('INSERT INTO inventory (name, quantity, barcode, gross_packing_quantity) VALUES (?, ?, ?, ?)', 
    [name, quantity, barcode, grossPackingQuantity], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, quantity, barcode, grossPackingQuantity });
  });
});

app.put('/api/inventory/:id', (req, res) => {
  const { name, quantity, barcode, grossPackingQuantity } = req.body;
  const { id } = req.params;
  db.run('UPDATE inventory SET name = ?, quantity = ?, barcode = ?, gross_packing_quantity = ? WHERE id = ?', 
    [name, quantity, barcode, grossPackingQuantity, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, name, quantity, barcode, grossPackingQuantity });
  });
});

app.delete('/api/inventory/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM inventory WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '삭제되었습니다.' });
  });
});

// 입출고 기록 API
app.get('/api/inout-records', (req, res) => {
  db.all('SELECT * FROM inout_records ORDER BY timestamp DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/inout-records', (req, res) => {
  const { productName, barcode, type, quantity, date, time } = req.body;
  db.run('INSERT INTO inout_records (product_name, barcode, type, quantity, date, time) VALUES (?, ?, ?, ?, ?, ?)', 
    [productName, barcode, type, quantity, date, time], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, productName, barcode, type, quantity, date, time });
  });
});

// 포장 기록 API
app.get('/api/packing-records', (req, res) => {
  db.all('SELECT * FROM packing_records ORDER BY timestamp DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/packing-records', (req, res) => {
  const { packingProduct, packingQuantity, date } = req.body;
  db.run('INSERT INTO packing_records (packing_product, packing_quantity, date) VALUES (?, ?, ?)', 
    [packingProduct, packingQuantity, date], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, packingProduct, packingQuantity, date });
  });
});

// 출고 기록 API
app.get('/api/outgoing-records', (req, res) => {
  db.all('SELECT * FROM outgoing_records ORDER BY timestamp DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/outgoing-records', (req, res) => {
  const { productName, barcode, outgoingQuantity, date, time } = req.body;
  db.run('INSERT INTO outgoing_records (product_name, barcode, outgoing_quantity, date, time) VALUES (?, ?, ?, ?, ?)', 
    [productName, barcode, outgoingQuantity, date, time], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, productName, barcode, outgoingQuantity, date, time });
  });
});

// 업무 루틴 API
app.get('/api/routines', (req, res) => {
  db.all('SELECT * FROM routines ORDER BY id', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/routines', (req, res) => {
  const { task } = req.body;
  db.run('INSERT INTO routines (task, completed) VALUES (?, 0)', [task], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, task, completed: false });
  });
});

app.put('/api/routines/:id', (req, res) => {
  const { task, completed } = req.body;
  const { id } = req.params;
  db.run('UPDATE routines SET task = ?, completed = ? WHERE id = ?', 
    [task, completed ? 1 : 0, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, task, completed });
  });
});

app.delete('/api/routines/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM routines WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '삭제되었습니다.' });
  });
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`네트워크 접속: http://192.168.219.43:${PORT}`);
  console.log(`로컬 접속: http://localhost:${PORT}`);
});
