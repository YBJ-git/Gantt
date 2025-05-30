# v0 배포 체크리스트

## 배포 전 확인사항

- [ ] 모든 테스트가 성공적으로 통과했는지 확인
- [ ] 프론트엔드와 백엔드의 환경 변수가 올바르게 설정되었는지 확인
- [ ] 백엔드와 프론트엔드 간의 API 엔드포인트 URL이 맞는지 확인
- [ ] 필요한 모든 의존성이 package.json에 포함되어 있는지 확인

## v0 계정 및 설정

- [ ] v0 계정 생성 및 로그인
- [ ] 프로젝트 이름: workload-optimization-system
- [ ] 리전 선택: us-east-1 (또는 가장 가까운 리전)
- [ ] v0.json 파일의 각 환경 변수 값이 올바르게 설정되었는지 확인

## 데이터베이스 설정

- [ ] v0 데이터베이스 인스턴스 생성 (또는 외부 DB 사용 시 연결 정보 준비)
- [ ] 데이터베이스 스키마 및 초기 데이터 마이그레이션 준비
- [ ] DB 접근을 위한 보안 설정 및
```
USE [WorkloadOptimization]
GO

-- 기본 테이블 생성
-- ... (이하 스키마 생성 스크립트)
```

## 배포 실행

- [ ] deploy-to-v0.bat (Windows) 또는 deploy-to-v0.sh (Linux/Mac) 실행
- [ ] 로그를 모니터링하며 오류 발생 여부 확인
- [ ] 배포 완료 후 제공되는 URL 확인

## 배포 후 검증

- [ ] 웹사이트 접속 및 기본 기능 테스트
- [ ] 로그인 및 사용자 인증 테스트
- [ ] 작업 부하 계산 및 최적화 기능 테스트
- [ ] 각종 간트 차트 시각화 확인
- [ ] 성능 및 응답 시간 확인

## 문제 해결

- [ ] v0 대시보드에서 로그 확인 방법: `v0 logs --service [frontend/backend]`
- [ ] 일반적인 오류 해결 방법:
  - 빌드 오류 → package.json 및 의존성 확인
  - 환경 변수 오류 → v0.json 및 .env 파일 확인
  - 연결 오류 → CORS 설정 및 네트워크 설정 확인

## 유지보수

- [ ] 정기적인 백업 설정: `v0 backup create`
- [ ] 모니터링 알림 설정
- [ ] 주기적인 업데이트 배포 계획
