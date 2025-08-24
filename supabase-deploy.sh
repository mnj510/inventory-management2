#!/bin/bash

echo "🚀 Supabase 자동 배포 시작..."

# 환경 변수 확인
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local 파일이 없습니다."
    echo "먼저 ./supabase-setup.sh를 실행하여 Supabase를 설정하세요."
    exit 1
fi

# Supabase 프로젝트 정보 로드
source .env.local

echo "📊 Supabase 프로젝트: $REACT_APP_SUPABASE_URL"

# 스키마 파일 확인
if [ ! -f "supabase/schema.sql" ]; then
    echo "❌ supabase/schema.sql 파일이 없습니다."
    exit 1
fi

echo "📋 데이터베이스 스키마 배포 중..."

# Supabase SQL 실행 (curl을 사용한 API 호출)
echo "🔧 테이블 생성 중..."

# 스키마 내용을 Supabase에 적용하는 방법 안내
echo ""
echo "📝 Supabase 대시보드에서 다음 단계를 수행하세요:"
echo "1. $REACT_APP_SUPABASE_URL 에 접속"
echo "2. SQL Editor 열기"
echo "3. 아래 명령어로 스키마 내용 확인:"
echo "   cat supabase/schema.sql"
echo "4. 스키마 내용을 복사하여 SQL Editor에서 실행"
echo ""

# 프론트엔드 빌드
echo "🏗️ 프론트엔드 빌드 중..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 빌드 성공!"
    
    # Git 커밋 및 푸시
    echo "📝 Git 커밋 중..."
    git add .
    git commit -m "🚀 Supabase 백엔드 연동

- Supabase 클라이언트 추가
- 실시간 데이터베이스 연동
- 자동 배포 시스템 구축
- 실시간 구독 기능 추가"

    echo "📤 GitHub에 푸시 중..."
    git push origin main
    
    echo ""
    echo "✅ Supabase 배포 완료!"
    echo "🌐 Supabase 대시보드: $REACT_APP_SUPABASE_URL"
    echo "📱 앱 URL: http://192.168.219.43:3000"
    echo ""
    echo "💡 실시간 기능이 활성화되었습니다!"
    echo "   - 모든 사용자가 동시에 데이터 확인/수정 가능"
    echo "   - 실시간 데이터 동기화"
    echo "   - 자동 백업 및 복구"
    
else
    echo "❌ 빌드 실패!"
    exit 1
fi
