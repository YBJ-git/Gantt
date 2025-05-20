# 백업 및 복구 전략

## 개요
이 문서는 작업 부하체크 간트 차트 시스템의 데이터 백업 및 복구 전략을 정의합니다. 서비스 중단, 데이터 손실, 재해 상황에 대비하기 위한 절차와 방법을 설명합니다.

## 백업 정책

### 데이터베이스 백업
| 백업 유형 | 주기 | 보관 기간 | 대상 |
|---------|------|---------|------|
| 전체 백업 | 매일 (오전 2시) | 30일 | 모든 데이터베이스 |
| 차등 백업 | 4시간마다 | 7일 | 변경된 데이터 |
| 트랜잭션 로그 백업 | 1시간마다 | 3일 | 트랜잭션 로그 |

### 파일 백업
| 백업 유형 | 주기 | 보관 기간 | 대상 |
|---------|------|---------|------|
| 설정 파일 백업 | 매일 (오전 3시) | 30일 | 모든 설정 파일 |
| 로그 파일 백업 | 매일 (오전 4시) | 14일 | 애플리케이션 로그 |
| 사용자 업로드 파일 백업 | 매일 (오전 3시) | 30일 | 업로드된 파일 |

### 백업 저장소
- **주 저장소**: 내부 백업 서버 (/var/backups)
- **보조 저장소**: AWS S3 버킷 (s3://workload-optimization-backups)
- **재해 복구 저장소**: 별도 리전의 AWS S3 버킷 (s3://dr-workload-optimization-backups)

## 백업 스크립트

### 데이터베이스 백업 스크립트
```bash
#!/bin/bash
# /usr/local/bin/db-backup.sh

# 환경 변수 설정
source /etc/workload-optimization/backup.conf

# 백업 디렉토리 생성
BACKUP_DIR="/var/backups/database/$(date +%Y-%m-%d)"
mkdir -p $BACKUP_DIR

# 전체 백업 수행
/usr/bin/sqlcmd -S $DB_SERVER -U $DB_USER -P $DB_PASSWORD -Q "BACKUP DATABASE $DB_NAME TO DISK='$BACKUP_DIR/full-backup.bak' WITH INIT"

# 백업 파일 압축
/usr/bin/gzip $BACKUP_DIR/full-backup.bak

# AWS S3로 백업 파일 전송
/usr/bin/aws s3 cp $BACKUP_DIR/full-backup.bak.gz s3://workload-optimization-backups/database/$(date +%Y-%m-%d)/

# 30일 이상 지난 백업 삭제
find /var/backups/database -type d -mtime +30 -exec rm -rf {} \;

# 백업 결과 로깅
echo "Database backup completed at $(date)" >> /var/log/workload-optimization/backup.log
```

### 설정 파일 백업 스크립트
```bash
#!/bin/bash
# /usr/local/bin/config-backup.sh

# 환경 변수 설정
source /etc/workload-optimization/backup.conf

# 백업 디렉토리 생성
BACKUP_DIR="/var/backups/config/$(date +%Y-%m-%d)"
mkdir -p $BACKUP_DIR

# 설정 파일 백업
tar -czf $BACKUP_DIR/config-files.tar.gz /var/www/gantt-workload-api/config /var/www/gantt-workload-api/.env*

# AWS S3로 백업 파일 전송
/usr/bin/aws s3 cp $BACKUP_DIR/config-files.tar.gz s3://workload-optimization-backups/config/$(date +%Y-%m-%d)/

# 30일 이상 지난 백업 삭제
find /var/backups/config -type d -mtime +30 -exec rm -rf {} \;

# 백업 결과 로깅
echo "Configuration backup completed at $(date)" >> /var/log/workload-optimization/backup.log
```

## 복구 절차

### 데이터베이스 복구 절차

1. **복구 목표 결정**
   - 시점 복구 (특정 시간으로 복구)
   - 최신 상태로 복구

2. **백업 파일 확인 및 선택**
   ```bash
   # 백업 목록 확인
   ls -la /var/backups/database/
   # 또는
   aws s3 ls s3://workload-optimization-backups/database/
   ```

3. **필요한 백업 파일 다운로드 (S3 저장소에서 복구 시)**
   ```bash
   # 필요한 백업 파일 다운로드
   aws s3 cp s3://workload-optimization-backups/database/2025-05-15/full-backup.bak.gz /tmp/
   gunzip /tmp/full-backup.bak.gz
   ```

4. **데이터베이스 복구 실행**
   ```bash
   # 복구 쿼리 실행
   sqlcmd -S $DB_SERVER -U $DB_USER -P $DB_PASSWORD -Q "RESTORE DATABASE $DB_NAME FROM DISK='/tmp/full-backup.bak' WITH REPLACE"
   ```

5. **복구 후 무결성 검사**
   ```bash
   # 데이터베이스 무결성 검사
   sqlcmd -S $DB_SERVER -U $DB_USER -P $DB_PASSWORD -Q "DBCC CHECKDB($DB_NAME) WITH NO_INFOMSGS"
   ```

6. **애플리케이션 재시작**
   ```bash
   # PM2를 통한 애플리케이션 재시작
   cd /var/www/gantt-workload-api
   pm2 reload ecosystem.config.js --env production
   ```

### 설정 파일 복구 절차

1. **백업 파일 확인 및 선택**
   ```bash
   # 백업 목록 확인
   ls -la /var/backups/config/
   # 또는
   aws s3 ls s3://workload-optimization-backups/config/
   ```

2. **백업 파일 다운로드 및 압축 해제**
   ```bash
   # 필요한 백업 파일 다운로드
   aws s3 cp s3://workload-optimization-backups/config/2025-05-15/config-files.tar.gz /tmp/
   
   # 백업 파일 압축 해제
   mkdir -p /tmp/config-restore
   tar -xzf /tmp/config-files.tar.gz -C /tmp/config-restore
   ```

3. **설정 파일 복원**
   ```bash
   # 설정 파일 복원
   cp -R /tmp/config-restore/var/www/gantt-workload-api/config/* /var/www/gantt-workload-api/config/
   cp /tmp/config-restore/var/www/gantt-workload-api/.env* /var/www/gantt-workload-api/
   ```

4. **애플리케이션 재시작**
   ```bash
   # PM2를 통한 애플리케이션 재시작
   cd /var/www/gantt-workload-api
   pm2 reload ecosystem.config.js --env production
   ```

## 재해 복구 계획

### 재해 복구 시나리오

1. **주 서버 장애**
   - 두 번째 리전의 대기 서버로 전환
   - DNS 변경을 통한 트래픽 리디렉션

2. **데이터 센터 장애**
   - 재해 복구 리전으로 전체 시스템 복원
   - 백업 데이터를 사용하여 시스템 복구

### 재해 복구 테스트

- 분기별로 재해 복구 훈련 실시
- 복구 시간 목표 (RTO): 4시간 이내
- 복구 지점 목표 (RPO): 1시간 이내

## 책임자 지정

| 역할 | 담당자 | 연락처 |
|------|-------|-------|
| 백업 관리자 | 홍길동 | admin@example.com, 010-1234-5678 |
| 복구 담당자 | 김철수 | recovery@example.com, 010-9876-5432 |
| 재해 복구 책임자 | 이영희 | dr-manager@example.com, 010-4567-8901 |

## 검토 일정

- 분기별 백업 로그 및 프로세스 검토
- 반기별 복구 테스트 실행
- 연간 전체 전략 검토 및 업데이트
