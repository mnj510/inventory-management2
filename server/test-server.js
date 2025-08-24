const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 테스트 API
app.get('/api/test', (req, res) => {
  res.json({ message: '서버가 정상적으로 실행 중입니다!' });
});

app.get('/api/inventory', (req, res) => {
  res.json([
    { id: 1, name: 'A상품', quantity: 100, barcode: '1234567890', grossPackingQuantity: 20 },
    { id: 2, name: 'B상품', quantity: 50, barcode: '0987654321', grossPackingQuantity: 10 },
    { id: 3, name: 'C상품', quantity: 75, barcode: '1122334455', grossPackingQuantity: 15 }
  ]);
});

app.post('/api/inventory', (req, res) => {
  const { name, quantity, barcode, grossPackingQuantity } = req.body;
  const newItem = {
    id: Date.now(),
    name,
    quantity: parseInt(quantity) || 0,
    barcode,
    grossPackingQuantity: parseInt(grossPackingQuantity) || 0
  };
  res.json(newItem);
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
  console.log(`테스트 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`네트워크 접속: http://192.168.219.43:${PORT}`);
  console.log(`로컬 접속: http://localhost:${PORT}`);
});
