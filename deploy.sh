#!/bin/bash

echo "🚀 GitHub 자동 배포 시작..."

# 현재 시간
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# Git 상태 확인
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ 변경사항이 없습니다."
    exit 0
fi

# 변경사항 추가
echo "📝 변경사항 추가 중..."
git add .

# 커밋 메시지 생성
COMMIT_MSG="🔄 자동 업데이트 - $TIMESTAMP

- 출퇴근 기록 업데이트
- 재고 관리 데이터 동기화
- 업무 루틴 상태 변경
- 시스템 성능 개선"

# 커밋 생성
echo "💾 커밋 생성 중..."
git commit -m "$COMMIT_MSG"

# GitHub에 푸시
echo "📤 GitHub에 푸시 중..."
git push origin main

echo "✅ 배포 완료!"
echo "🌐 GitHub 저장소: https://github.com/mnj510/inventory-management2"
echo "📱 접속 URL: http://192.168.219.43:3000"
