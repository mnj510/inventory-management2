const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// SQLite 데이터베이스 파일 경로
const dbPath = path.join(process.cwd(), 'logistics.db');

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath);

// 테이블 생성
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS attendance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    time TEXT NOT NULL,
    date TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
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
      // 모든 출퇴근 기록 조회
      db.all('SELECT * FROM attendance_records ORDER BY timestamp DESC', (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(rows);
      });
      break;

    case 'POST':
      // 새 출퇴근 기록 추가
      const { type, time, date } = req.body;
      db.run('INSERT INTO attendance_records (type, time, date) VALUES (?, ?, ?)', 
        [type, time, date], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ id: this.lastID, type, time, date });
      });
      break;

    case 'PUT':
      // 출퇴근 기록 수정
      const { id } = req.query;
      const updateData = req.body;
      db.run('UPDATE attendance_records SET type = ?, time = ?, date = ? WHERE id = ?', 
        [updateData.type, updateData.time, updateData.date, id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ id, ...updateData });
      });
      break;

    case 'DELETE':
      // 출퇴근 기록 삭제
      const deleteId = req.query.id;
      db.run('DELETE FROM attendance_records WHERE id = ?', [deleteId], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: '기록이 삭제되었습니다.' });
      });
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
