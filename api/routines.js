const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// SQLite 데이터베이스 파일 경로
const dbPath = path.join(process.cwd(), 'logistics.db');

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath);

// 테이블 생성
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS routines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  )`);

  // 초기 데이터 삽입
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
      // 모든 업무 루틴 조회
      db.all('SELECT * FROM routines ORDER BY id', (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(rows);
      });
      break;

    case 'POST':
      // 새 업무 루틴 추가
      const { task } = req.body;
      db.run('INSERT INTO routines (task, completed) VALUES (?, 0)', 
        [task], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ id: this.lastID, task, completed: 0 });
      });
      break;

    case 'PUT':
      // 업무 루틴 수정
      const { id } = req.query;
      const updateData = req.body;
      db.run('UPDATE routines SET task = ?, completed = ? WHERE id = ?', 
        [updateData.task, updateData.completed ? 1 : 0, id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ id, task: updateData.task, completed: updateData.completed });
      });
      break;

    case 'DELETE':
      // 업무 루틴 삭제
      const deleteId = req.query.id;
      db.run('DELETE FROM routines WHERE id = ?', [deleteId], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: '업무 루틴이 삭제되었습니다.' });
      });
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
