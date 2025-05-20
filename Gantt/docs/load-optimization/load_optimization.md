# 부하 최적화 기능 명세서

## 1. 개요
부하 최적화 기능은 프로젝트 내 리소스의 작업 부하를 시각화하고 분석하여 부하가 균등하게 분배되도록 최적화하는 기능을 제공합니다. 이 기능을 통해 특정 리소스에 작업이 과도하게 집중되는 것을 방지하고, 프로젝트 전체의 효율성을 향상시킬 수 있습니다.

## 2. 주요 기능

### 2.1 부하 히트맵 (Load Heatmap)
- 리소스별, 기간별 작업 부하를 히트맵으로 시각화
- 부하 수준에 따른 색상 코드 표시 (정상, 경고, 심각)
- 기간 필터링 및 부서별 필터링 기능
- 특정 기간 또는 리소스에 대한 상세 정보 확인

### 2.2 부하 게이지 (Load Gauge)
- 리소스별 현재 부하 수준을 게이지로 표시
- 부하 상태에 따른 색상 표시 (정상, 경고, 심각)
- 리소스의 최대 가용 용량 대비 현재 할당된 작업량 표시
- 상세 정보 툴팁 제공

### 2.3 부하 최적화 추천 (Load Optimization Recommendations)
- 현재 부하 상태를 분석하여 최적화 추천사항 제공
- 추천 유형: 일정 변경, 담당자 변경, 작업 분배 등
- 각 추천에 대한 효과(부하 감소율) 표시
- 추천 적용, 무시, 상세 정보 확인 기능

### 2.4 작업 자동 분배 (Auto Task Distribution)
- 설정한 전략에 따라 작업을 자동으로 재분배
- 분배 전략: 균형 분배, 우선순위 기반, 스킬 기반
- 단계별 설정 마법사 제공 (범위 지정, 전략 설정, 고급 설정, 실행)
- 분배 결과 미리보기 및 적용 여부 선택

## 3. UI 컴포넌트

### 3.1 LoadHeatmap.jsx
- 리소스와 기간에 대한 부하 히트맵 표시
- 필터링 및 정렬 기능 제공
- 셀 클릭 시 상세 정보 표시

### 3.2 LoadGauge.jsx
- 리소스별 부하 수준을 게이지로 표시
- 부하 상태에 따른 색상 변화
- 툴팁으로 상세 정보 제공

### 3.3 LoadOptimizationRecommendations.jsx
- 최적화 추천 목록 표시
- 각 추천에 대한 상세 정보 및 액션 버튼 제공
- 추천 없는 경우 추천 생성 버튼 표시

### 3.4 AutoTaskDistribution.jsx
- 작업 자동 분배를 위한 단계별 마법사
- 범위 지정, 전략 설정, 고급 설정, 실행 단계로 구성
- 분배 결과 표시 및 적용 기능

## 4. 백엔드 API

### 4.1 리소스 부하 데이터 조회
- **GET /api/load-optimization/resource-load**
- 리소스별 부하 데이터를 조회
- 쿼리 파라미터: 시작일, 종료일, 부서ID, 리소스ID

### 4.2 부하 최적화 추천 조회
- **GET /api/load-optimization/recommendations**
- 현재 부하 상태에 대한 최적화 추천 목록 조회
- 쿼리 파라미터: 시작일, 종료일, 부서ID, 리소스ID

### 4.3 부하 최적화 추천 적용
- **POST /api/load-optimization/apply-recommendation**
- 선택한 최적화 추천을 적용
- 요청 바디: recommendationId

### 4.4 작업 자동 분배 실행
- **POST /api/load-optimization/distribute-tasks**
- 설정한 전략에 따라 작업을 자동으로 재분배
- 요청 바디: 분배 설정 정보 (기간, 리소스, 전략 등)

## 5. 알고리즘

### 5.1 부하 계산 알고리즘
- 각 리소스의 작업량을 기간별로 집계
- 작업 복잡도, 우선순위, 기간을 고려한 부하 점수 산정
- 리소스의 최대 가용 용량 대비 할당된 작업 부하 비율 계산

### 5.2 최적화 추천 알고리즘
- 과부하 리소스 식별 (부하율 80% 이상)
- 리소스 간 부하 균형 평가 (표준편차 계산)
- 작업 이동 가능성 분석 (의존성, 스킬 매칭 고려)
- 최적의 작업 이동/재할당 조합 도출

### 5.3 작업 자동 분배 알고리즘
- 분배 범위 내 작업과 리소스 식별
- 선택한 전략에 따른 작업 분배 우선순위 결정
- 리소스 간 부하 균형 최적화 (반복 계산)
- 작업 의존성 및 제약사항 준수 확인

## 6. 데이터 구조

### 6.1 리소스 부하 데이터
```json
{
  "resourceLoad": [
    {
      "resourceId": "string",
      "resourceName": "string",
      "load": "number",
      "capacity": "number",
      "status": "string" // normal, warning, critical
    }
  ],
  "timelineLoad": [
    {
      "date": "string",
      "resources": [
        {
          "resourceId": "string",
          "load": "number"
        }
      ]
    }
  ]
}
```

### 6.2 최적화 추천 데이터
```json
[
  {
    "id": "string",
    "type": "string", // RESCHEDULE, REASSIGN, BALANCE
    "description": "string",
    "impact": "number", // 부하 감소 효과 (%)
    "tasks": [
      {
        "id": "string",
        "name": "string"
      }
    ],
    "resourcesAffected": [
      {
        "id": "string",
        "name": "string",
        "before": "number", // 변경 전 부하율 (%)
        "after": "number" // 변경 후 부하율 (%)
      }
    ]
  }
]
```

### 6.3 작업 분배 결과 데이터
```json
{
  "successRate": "number", // 성공률 (%)
  "message": "string",
  "loadBalanceImprovement": "number", // 부하 균형 개선율 (%)
  "tasksProcessed": "number",
  "totalTasks": "number",
  "resourcesAffected": "number",
  "details": {
    "reassignedTasks": [
      {
        "taskId": "string",
        "taskName": "string",
        "fromResource": "string",
        "toResource": "string"
      }
    ],
    "rescheduledTasks": [
      {
        "taskId": "string",
        "taskName": "string",
        "fromDate": "string",
        "toDate": "string"
      }
    ]
  }
}
```

## 7. 구현 일정
- 1주차: UI 컴포넌트 구현 (LoadHeatmap, LoadGauge, LoadOptimizationRecommendations, AutoTaskDistribution)
- 2주차: 백엔드 API 및 서비스 구현 (부하 계산 알고리즘, 최적화 알고리즘)
- 3주차: 테스트 및 버그 수정, 성능 최적화