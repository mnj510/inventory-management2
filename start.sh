#!/bin/bash

echo "🚀 물류 관리 시스템 시작 중..."

# 백엔드 서버 시작
echo "📡 백엔드 서버 시작..."
cd server
npm start &
BACKEND_PID=$!
cd ..

# 3초 대기
sleep 3

# 프론트엔드 시작
echo "🌐 프론트엔드 시작..."
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ 시스템이 시작되었습니다!"
echo ""
echo "📱 접속 정보:"
echo "   로컬: http://localhost:3000"
echo "   네트워크: http://192.168.219.43:3000"
echo ""
echo "🔧 백엔드 API:"
echo "   로컬: http://localhost:5000"
echo "   네트워크: http://192.168.219.43:5000"
echo ""
echo "💡 다른 기기에서 접속하려면:"
echo "   브라우저에서 http://192.168.219.43:3000 으로 접속하세요"
echo ""
echo "🛑 종료하려면 Ctrl+C를 누르세요"

# 프로세스 종료 대기
wait $BACKEND_PID $FRONTEND_PID
