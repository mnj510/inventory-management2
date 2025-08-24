#!/bin/bash

echo "💾 데이터베이스 백업 시작..."

# 백업 디렉토리 생성
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# 현재 시간으로 백업 파일명 생성
TIMESTAMP=$(date "+%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/logistics_backup_$TIMESTAMP.sql"

# SQLite 데이터베이스 백업
if [ -f "server/logistics.db" ]; then
    echo "📊 데이터베이스 백업 중..."
    sqlite3 server/logistics.db ".dump" > $BACKUP_FILE
    
    # 백업 파일 압축
    gzip $BACKUP_FILE
    
    echo "✅ 백업 완료: $BACKUP_FILE.gz"
    
    # 오래된 백업 파일 삭제 (7일 이상)
    find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
    
    # Git에 백업 추가
    git add $BACKUP_FILE.gz
    git commit -m "💾 자동 백업 - $TIMESTAMP" --no-verify
    
    echo "📤 GitHub에 백업 업로드 중..."
    git push origin main
    
else
    echo "⚠️ 데이터베이스 파일을 찾을 수 없습니다."
fi

echo "✅ 백업 프로세스 완료!"
