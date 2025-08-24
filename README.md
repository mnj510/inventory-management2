# 물류 직원 관리 시스템

여러 사용자가 동일한 데이터를 공유하고 수정할 수 있는 물류 관리 웹사이트입니다.

## 주요 기능

### 📊 출퇴근 관리
- 출근/퇴근 시간 기록
- 10분 단위 시간 선택
- 실시간 기록 목록 표시

### 📦 재고 관리
- **재고 리스트**: 상품 추가/수정/삭제, 검색 기능
- **입출고**: 바코드 스캔, 제품 선택, 수량 조정, 입출고 처리
- **그로스 포장**: 포장 기록, 출고 관리

### ✅ 업무 루틴
- 체크리스트 형태의 업무 관리
- 관리자 모드 (비밀번호: admin123)
- 업무 추가/수정/삭제 기능

### 🎨 사용자 인터페이스
- 접을 수 있는 사이드바 네비게이션
- 반응형 디자인
- 직관적인 UI/UX

## 기술 스택

### Frontend
- React 18.2.0
- Tailwind CSS
- Lucide React (아이콘)
- Fetch API

### Backend
- Node.js
- Express.js
- SQLite3
- CORS

## 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd fogni-dashboard
```

### 2. 백엔드 서버 설치 및 실행
```bash
cd server
npm install
npm start
```

백엔드 서버는 `http://localhost:5000`에서 실행됩니다.

### 3. 프론트엔드 설치 및 실행
```bash
# 루트 디렉토리로 이동
cd ..
npm install
npm start
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

## 데이터베이스

SQLite 데이터베이스가 자동으로 생성되며, 다음 테이블들이 포함됩니다:

- `attendance_records`: 출퇴근 기록
- `inventory`: 재고 정보
- `inout_records`: 입출고 기록
- `packing_records`: 포장 기록
- `outgoing_records`: 출고 기록
- `routines`: 업무 루틴

초기 데이터가 자동으로 삽입됩니다.

## API 엔드포인트

### 출퇴근 기록
- `GET /api/attendance`: 모든 출퇴근 기록 조회
- `POST /api/attendance`: 새로운 출퇴근 기록 생성

### 재고 관리
- `GET /api/inventory`: 모든 재고 조회
- `POST /api/inventory`: 새로운 재고 추가
- `PUT /api/inventory/:id`: 재고 수정
- `DELETE /api/inventory/:id`: 재고 삭제

### 입출고 기록
- `GET /api/inout-records`: 모든 입출고 기록 조회
- `POST /api/inout-records`: 새로운 입출고 기록 생성

### 포장 기록
- `GET /api/packing-records`: 모든 포장 기록 조회
- `POST /api/packing-records`: 새로운 포장 기록 생성

### 출고 기록
- `GET /api/outgoing-records`: 모든 출고 기록 조회
- `POST /api/outgoing-records`: 새로운 출고 기록 생성

### 업무 루틴
- `GET /api/routines`: 모든 업무 루틴 조회
- `POST /api/routines`: 새로운 업무 추가
- `PUT /api/routines/:id`: 업무 수정
- `DELETE /api/routines/:id`: 업무 삭제

## 배포

### 로컬 배포
1. 백엔드와 프론트엔드를 모두 실행
2. 브라우저에서 `http://localhost:3000` 접속

### 네트워크 배포 (다른 기기에서 접속 가능)
1. 배포 스크립트 실행: `./start.sh`
2. 다른 기기에서 `http://192.168.219.43:3000` 접속
3. 모든 기기에서 동일한 데이터 공유

### 프로덕션 배포
1. 프론트엔드 빌드: `npm run build`
2. 백엔드 서버를 프로덕션 환경에 배포
3. 환경 변수 설정 (필요시)

## 관리자 모드

업무 루틴 탭에서 관리자 모드에 접근할 수 있습니다:
- 비밀번호: `admin123`
- 관리자 모드에서 업무 추가/수정/삭제 가능

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
