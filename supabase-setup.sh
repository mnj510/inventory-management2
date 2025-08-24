#!/bin/bash

echo "🚀 Supabase 설정 시작..."

# Supabase 프로젝트 정보
echo "📋 Supabase 프로젝트 설정"
echo "1. https://supabase.com 에서 새 프로젝트 생성"
echo "2. 프로젝트 URL과 API 키를 복사"
echo "3. 아래 정보를 입력하세요:"

read -p "Supabase 프로젝트 URL: " SUPABASE_URL
read -p "Supabase API 키 (anon): " SUPABASE_ANON_KEY

# 환경 변수 파일 생성
echo "🔧 환경 변수 설정..."
cat > .env.local << EOF
REACT_APP_SUPABASE_URL=$SUPABASE_URL
REACT_APP_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF

echo "✅ 환경 변수 파일이 생성되었습니다: .env.local"

# Supabase 스키마 적용 안내
echo ""
echo "📊 데이터베이스 스키마 설정:"
echo "1. Supabase 대시보드에서 SQL Editor 열기"
echo "2. supabase/schema.sql 파일의 내용을 복사하여 실행"
echo "3. 또는 아래 명령어로 스키마 확인:"
echo "   cat supabase/schema.sql"

echo ""
echo "🔗 Supabase 대시보드: $SUPABASE_URL"
echo "📱 앱 재시작 후 Supabase 연결 확인"

echo ""
echo "✅ Supabase 설정 완료!"
