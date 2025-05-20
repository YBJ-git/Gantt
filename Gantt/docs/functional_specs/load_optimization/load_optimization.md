# 부하 최적화 기능 명세서

## 개요
부하 최적화 기능은 리소스의 작업 부하를 시각화하고 분석하여 부하 불균형을 식별하고 최적화하는 기능입니다. 이 기능은 과부하된 리소스의 작업을 적절한 리소스에 재분배하여 전체 팀의 생산성을 향상시키는 것을 목표로 합니다.

### 주요 기능
1. **부하 시각화**: 리소스별 부하 상태를 히트맵, 차트 등으로 시각화
2. **부하 분석**: 리소스 부하 분포 및 추세 분석
3. **부하 최적화**: 작업 재분배를 통한 부하 균형화 알고리즘 적용
4. **최적화 시뮬레이션**: 작업 재분배 시뮬레이션 및 결과 미리보기
5. **최적화 권장사항**: 부하 균형화를 위한 작업 재분배 권장사항 제공

## 사용자 경험 흐름

### 부하 시각화 화면
1. 사용자는 메인 메뉴에서 "부하 최적화" 메뉴를 선택합니다.
2. 시스템은 현재 날짜로부터 30일 동안의 리소스 부하 데이터를 로드하여 히트맵 형태로 표시합니다.
3. 사용자는 날짜 범위를 조정하여 원하는 기간의 부하 데이터를 확인할 수 있습니다.
4. 히트맵에서 색상 강도는 부하 수준을 나타냅니다:
   - 녹색(0-30%): 저부하
   - 노란색(30-70%): 적정부하
   - 주황색(70-90%): 고부하
   - 빨간색(90-100%): 과부하
5. 사용자는 특정 셀에 마우스를 올리면 상세 부하 정보(날짜, 리소스, 부하율, 할당된 작업 등)를 툴팁으로 볼 수 있습니다.
6. 셀을 클릭하면 해당 날짜/리소스에 할당된 작업 목록을 팝업으로 볼 수 있습니다.

### 부하 분석 화면
1. 사용자는 탭 메뉴에서 "분석" 탭을 선택합니다.
2. 시스템은 다양한 부하 분석 차트를 표시합니다:
   - 리소스별 평균 부하 막대 차트
   - 시간에 따른 부하 변화 추세 그래프
   - 부하 분포 히스토그램
3. 사용자는 필터링 및 정렬 옵션을 사용하여 원하는 데이터만 표시할 수 있습니다.
4. 차트에서 특정 데이터 포인트를 선택하면 관련 상세 정보를 볼 수 있습니다.

### 부하 최적화 시뮬레이션
1. 사용자는 "최적화 시뮬레이션" 버튼을 클릭합니다.
2. 시스템은 최적화 설정 화면을 표시합니다:
   - 최적화 목표 선택 (부하 균등화, 최대 부하 최소화, 비용 최소화)
   - 최대 부하 임계값 설정
   - 리소스 역량 고려 여부
   - 현재 할당 유지 여부 (진행 중인 작업은 재할당하지 않음)
   - 가중치 설정 (우선순위, 마감일, 균형 등)
3. 사용자는 설정을 조정한 후 "최적화 계산" 버튼을 클릭합니다.
4. 시스템은 알고리즘을 실행하여 최적의 작업 분배를 계산하고 결과를 표시합니다:
   - 최적화 전후 비교 차트
   - 개선 지표 (부하 균형 개선율, 과부하 리소스 감소 등)
   - 재할당 작업 목록
5. 사용자는 재할당 작업을 선택적으로 적용할 수 있습니다.
6. "적용" 버튼을 클릭하면 선택한 재할당이 실제로 적용됩니다.
7. 시스템은 작업 재할당 결과를 저장하고 관련 담당자에게 알림을 전송합니다.

### 최적화 권장사항
1. 시스템은 주기적으로 부하 상태를 분석하여 부하 불균형이 발견되면 권장사항을 생성합니다.
2. 사용자는 부하 최적화 페이지에서 생성된 권장사항 목록을 볼 수 있습니다.
3. 각 권장사항은 다음 정보를 포함합니다:
   - 권장사항 제목 및 설명
   - 영향 받는 리소스
   - 재할당 작업 목록
   - 예상 개선 효과
4. 사용자는 권장사항을 적용하거나 거부할 수 있습니다.
5. 권장사항을 적용하면 시스템은 제안된 재할당을 실행합니다.

## UI 구성 요소

### 부하 최적화 페이지
#### 레이아웃
```
+--------------------------------------------------------+
| [날짜 범위 선택] [부서 필터] [팀 필터] [최적화 시뮬레이션] |
+--------------------------------------------------------+
| [전체 부하 상태] | [과부하 리소스] | [권장사항]             |
+--------------------------------------------------------+
| [탭 메뉴: 히트맵 | 분석]                                 |
+--------------------------------------------------------+
| [히트맵/분석 컨텐츠 영역]                                |
|                                                        |
|                                                        |
|                                                        |
+--------------------------------------------------------+
| [권장사항 목록]                                         |
+--------------------------------------------------------+
```

#### 상단 컨트롤
- **날짜 범위 선택**: DatePicker 컴포넌트
- **부서 필터**: Select 컴포넌트
- **팀 필터**: Select 컴포넌트
- **최적화 시뮬레이션**: Button 컴포넌트

#### 요약 카드
- **전체 부하 상태**: 게이지 차트로 평균 부하 표시
- **과부하 리소스**: 과부하 상태인 리소스 수 표시
- **권장사항**: 활성 권장사항 수 표시

#### 탭 메뉴
- **히트맵**: 기본 선택 탭
- **분석**: 부하 분석 차트 탭

#### 히트맵 컴포넌트
- 세로축: 리소스 목록
- 가로축: 날짜
- 셀: 색상 코딩된 부하 수준
- 툴팁: 상세 부하 정보
- 클릭 이벤트: 작업 목록 팝업

#### 분석 차트 영역
- 각종 부하 분석 차트와 그래프

#### 권장사항 목록
- 카드 형태의 권장사항 목록
- 각 카드: 권장사항 제목, 설명, 개선 효과, 적용/거부 버튼

### 최적화 시뮬레이션 화면
#### 레이아웃
```
+--------------------------------------------------------+
| [← 돌아가기] 최적화 시뮬레이션                           |
+--------------------------------------------------------+
| [최적화 설정 패널]     | [결과 미리보기 패널]             |
| 최적화 목표: [선택]    | [최적화 전후 비교 차트]          |
| 최대 부하 임계값: [%]  |                                |
| 리소스 역량 고려: [Y/N]| [개선 지표]                     |
| 진행 중 작업 유지: [Y/N]|                               |
| 가중치 설정:          |                                |
| - 우선순위: [1-5]     | [재할당 작업 목록]               |
| - 마감일: [1-5]       |                                |
| - 균형: [1-5]        |                                |
|                      |                                |
| [최적화 계산]         | [전체 적용] [선택 적용] [취소]    |
+--------------------------------------------------------+
```

#### 설정 패널
- **최적화 목표**: Select 컴포넌트
- **최대 부하 임계값**: Slider 컴포넌트
- **리소스 역량 고려**: Switch 컴포넌트
- **진행 중 작업 유지**: Switch 컴포넌트
- **가중치 설정**: Slider 컴포넌트들
- **최적화 계산**: Button 컴포넌트

#### 결과 미리보기 패널
- **최적화 전후 비교 차트**: 막대 차트 또는 히트맵
- **개선 지표**: 카드 형태의 주요 지표
- **재할당 작업 목록**: 체크박스가 있는 테이블
- **적용 버튼**: 전체 적용, 선택 적용 버튼

## 데이터 모델

### ResourceLoad (리소스 부하)
```json
{
  "id": "UUID",
  "resourceId": "UUID",
  "date": "YYYY-MM-DD",
  "scheduledLoad": 80, // 백분율 (0-100)
  "capacity": 480, // 분 단위 (8시간 = 480분)
  "allocatedMinutes": 384, // 분 단위
  "createdAt": "ISO 날짜",
  "updatedAt": "ISO 날짜"
}
```

### ResourceCapability (리소스 역량)
```json
{
  "id": "UUID",
  "resourceId": "UUID",
  "skillId": "UUID",
  "proficiencyLevel": 3, // 1-5 등급
  "createdAt": "ISO 날짜",
  "updatedAt": "ISO 날짜"
}
```

### LoadOptimizationRecommendation (부하 최적화 권장사항)
```json
{
  "id": "UUID",
  "title": "과부하 리소스 최적화",
  "description": "현재 과부하 상태인 3명의 리소스에 대한 작업 재분배",
  "timeRange": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "affectedResources": [
    {
      "id": "UUID",
      "name": "홍길동",
      "currentLoad": 95,
      "optimizedLoad": 85
    }
  ],
  "tasksToChange": [
    {
      "taskId": "UUID",
      "taskTitle": "기능 개발",
      "fromResourceId": "UUID",
      "fromResource": "홍길동",
      "toResourceId": "UUID",
      "toResource": "김철수"
    }
  ],
  "impact": {
    "loadBalanceImprovement": 15.5, // 백분율
    "overloadedResourcesReduction": 2 // 개수
  },
  "status": "pending", // pending, applied, rejected
  "priority": 4, // 1-5 등급
  "createdAt": "ISO 날짜",
  "createdBy": "UUID",
  "updatedAt": "ISO 날짜",
  "appliedAt": "ISO 날짜",
  "appliedBy": "UUID"
}
```

### LoadOptimizationSimulation (부하 최적화 시뮬레이션)
```json
{
  "id": "UUID",
  "name": "최적화 시뮬레이션 2024-05-15",
  "description": "부하 균등화 최적화",
  "parameters": {
    "timeRange": {
      "start": "YYYY-MM-DD",
      "end": "YYYY-MM-DD"
    },
    "optimizationGoal": "balance", // balance, minmax, cost
    "maxLoadThreshold": 80, // 백분율
    "respectSkills": true,
    "preserveAssignments": false,
    "priorityWeight": 3,
    "deadlineWeight": 3,
    "balanceWeight": 3,
    "resourceIds": ["UUID", "UUID"]
  },
  "originalState": {
    // 원래 부하 상태
  },
  "optimizedState": {
    // 최적화된 부하 상태
  },
  "improvements": {
    "totalLoadBalanceImprovement": 25.5, // 백분율
    "overloadedResourcesReduction": 2, // 개수
    "loadVarianceReduction": 40 // 백분율
  },
  "reassignments": [
    {
      "taskId": "UUID",
      "taskTitle": "기능 개발",
      "fromResourceId": "UUID",
      "fromResource": "홍길동",
      "toResourceId": "UUID",
      "toResource": "김철수",
      "loadImpact": 30 // 백분율
    }
  ],
  "status": "completed", // pending, completed, applied
  "createdAt": "ISO 날짜",
  "createdBy": "UUID",
  "appliedAt": "ISO 날짜",
  "appliedBy": "UUID"
}
```

## API 명세

### 리소스 부하 조회 API
```
GET /api/loads/resources
```

**설명**: 리소스별 부하 데이터를 조회합니다.

**요청 파라미터**:
- `startDate` (필수): 조회 시작일 (YYYY-MM-DD)
- `endDate` (필수): 조회 종료일 (YYYY-MM-DD)
- `resourceIds`: 쉼표로 구분된 리소스 ID 목록
- `departmentId`: 부서 ID
- `teamId`: 팀 ID
- `timeUnit`: 시간 단위 (day, week, month, 기본값: day)

**응답**:
```json
{
  "success": true,
  "data": {
    "resources": [
      {
        "resourceId": "resource-1",
        "resourceName": "홍길동",
        "dailyLoad": {
          "2024-05-01": {
            "scheduledLoad": 80,
            "capacity": 480,
            "allocatedMinutes": 384,
            "taskAllocations": [
              {
                "taskId": "task-1",
                "minutes": 240,
                "percentage": 50
              },
              {
                "taskId": "task-2",
                "minutes": 144,
                "percentage": 30
              }
            ]
          }
        },
        "averageLoad": 75,
        "peakLoad": 90
      }
    ],
    "resourceList": [
      {
        "id": "resource-1",
        "name": "홍길동",
        "department": "개발팀",
        "role": "개발자"
      }
    ],
    "timeRange": {
      "start": "2024-05-01",
      "end": "2024-05-31"
    },
    "averageLoad": 65,
    "overloadedResourcesCount": 2
  }
}
```

### 부하 최적화 권장사항 조회 API
```
GET /api/optimization/recommendations
```

**설명**: 부하 최적화 권장사항을 조회합니다.

**요청 파라미터**:
- `startDate`: 조회 시작일 (YYYY-MM-DD)
- `endDate`: 조회 종료일 (YYYY-MM-DD)
- `resourceIds`: 쉼표로 구분된 리소스 ID 목록
- `status`: 권장사항 상태 (pending, applied, rejected)
- `minImpact`: 최소 개선 효과 (백분율)

**응답**:
```json
{
  "success": true,
  "data": [
    {
      "id": "rec-123",
      "title": "과부하 리소스 최적화",
      "description": "현재 과부하 상태인 3명의 리소스에 대한 작업 재분배",
      "timeRange": {
        "start": "2024-05-15",
        "end": "2024-06-15"
      },
      "affectedResources": [
        {
          "id": "resource-1",
          "name": "홍길동",
          "currentLoad": 95,
          "optimizedLoad": 85
        }
      ],
      "tasksToChange": [
        {
          "taskId": "task-1",
          "taskTitle": "기능 개발",
          "fromResourceId": "resource-1",
          "fromResource": "홍길동",
          "toResourceId": "resource-2",
          "toResource": "김철수"
        }
      ],
      "impact": {
        "loadBalanceImprovement": 15.5,
        "overloadedResourcesReduction": 2
      },
      "status": "pending",
      "priority": 4,
      "createdAt": "2024-05-15T10:30:45.123Z"
    }
  ]
}
```

### 부하 최적화 시뮬레이션 API
```
POST /api/optimization/simulate
```

**설명**: 부하 최적화 시뮬레이션을 실행합니다.

**요청 바디**:
```json
{
  "timeRange": {
    "start": "2024-05-15",
    "end": "2024-06-15"
  },
  "optimizationGoal": "balance",
  "maxLoadThreshold": 80,
  "respectSkills": true,
  "preserveAssignments": false,
  "priorityWeight": 3,
  "deadlineWeight": 3,
  "balanceWeight": 3,
  "resourceIds": ["resource-1", "resource-2"]
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "id": "sim-123",
    "name": "최적화 시뮬레이션 2024-05-15T10:30:45.123Z",
    "description": "부하 균등화 최적화",
    "parameters": {
      // 요청 파라미터와 동일
    },
    "originalState": {
      // 원래 부하 상태
    },
    "optimizedState": {
      // 최적화된 부하 상태
    },
    "improvements": {
      "totalLoadBalanceImprovement": 25.5,
      "overloadedResourcesReduction": 2,
      "loadVarianceReduction": 40,
      "taskReassignmentCount": 5
    },
    "reassignments": [
      {
        "taskId": "task-1",
        "taskTitle": "기능 개발",
        "fromResourceId": "resource-1",
        "fromResource": "홍길동",
        "toResourceId": "resource-2",
        "toResource": "김철수",
        "loadImpact": 30
      }
    ],
    "createdAt": "2024-05-15T10:30:45.123Z",
    "createdBy": "user-1",
    "status": "completed"
  }
}
```

### 시뮬레이션 결과 적용 API
```
POST /api/optimization/simulations/:id/apply
```

**설명**: 시뮬레이션 결과를 적용합니다.

**URL 파라미터**:
- `id` (필수): 시뮬레이션 ID

**요청 바디**:
```json
{
  "taskIds": ["task-1", "task-2"]
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "reassignedTasks": 2,
    "simulationId": "sim-123",
    "appliedAt": "2024-05-15T11:15:30.456Z"
  }
}
```

### 권장사항 적용 API
```
POST /api/optimization/recommendations/:id/apply
```

**설명**: 권장사항을 적용합니다.

**URL 파라미터**:
- `id` (필수): 권장사항 ID

**요청 바디**:
```json
{
  "taskIds": ["task-1", "task-2"]
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "recommendationId": "rec-123",
    "reassignedTasks": 2,
    "appliedAt": "2024-05-15T11:15:30.456Z"
  }
}
```

### 권장사항 거부 API
```
POST /api/optimization/recommendations/:id/reject
```

**설명**: 권장사항을 거부합니다.

**URL 파라미터**:
- `id` (필수): 권장사항 ID

**요청 바디**:
```json
{
  "reason": "담당자 변경으로 인한 거부"
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "recommendationId": "rec-123",
    "status": "rejected",
    "rejectedAt": "2024-05-15T11:15:30.456Z"
  }
}
```

## 최적화 알고리즘

### 부하 균등화 알고리즘
1. **목표**: 모든 리소스의 부하를 가능한 한 균등하게 분배
2. **접근 방식**:
   - 과부하 리소스(최대 부하 임계값 초과)에서 저부하 리소스로 작업 이동
   - 부하 분산(표준 편차)을 최소화하는 방향으로 최적화
3. **제약 조건**:
   - 리소스 역량 매칭 (작업에 필요한 스킬과 리소스 역량 일치)
   - 진행 중인 작업 재할당 여부 (옵션)
4. **가중치 요소**:
   - 작업 우선순위
   - 작업 마감일
   - 리소스 부하 균형

### 최대 부하 최소화 알고리즘
1. **목표**: 최대 부하가 가장 높은 리소스의 부하를 최소화
2. **접근 방식**:
   - 가장 높은 부하를 가진 리소스의 작업부터 재분배
   - 최대 부하를 최소화하는 방향으로 최적화
3. **제약 조건**: 부하 균등화와 동일
4. **가중치 요소**: 부하 균등화와 동일

### 비용 최소화 알고리즘
1. **목표**: 작업 비용을 최소화하는 방향으로 최적화
2. **접근 방식**:
   - 리소스별 비용률 고려
   - 작업 비용을 최소화하는 방향으로 최적화
3. **제약 조건**: 부하 균등화와 동일
4. **추가 요소**:
   - 리소스별 비용률
   - 작업별 비용 중요도

## 알림 체계

### 과부하 알림
- **트리거**: 리소스 부하가 임계값(90%)을 초과할 때
- **대상**: 해당 리소스, 팀 리더, 프로젝트 관리자
- **내용**: 리소스 정보, 과부하 기간, 최대 부하율

### 부하 변화 알림
- **트리거**: 리소스 부하가 급격히 변화(±30%)할 때
- **대상**: 해당 리소스, 팀 리더
- **내용**: 리소스 정보, 변화 전후 부하율, 변화율

### 권장사항 알림
- **트리거**: 새로운 부하 최적화 권장사항 생성 시
- **대상**: 팀 리더, 프로젝트 관리자
- **내용**: 권장사항 제목, 영향 받는 리소스 수, 예상 개선 효과

### 최적화 적용 알림
- **트리거**: 최적화 결과 적용 시
- **대상**: 영향 받는 리소스(작업 이동 당사자), 팀 리더
- **내용**: 적용 정보, 변경된 작업 수, 담당자 변경 정보

## 프로젝트 구조

### 프론트엔드 구조
```
frontend/
├── src/
│   ├── components/
│   │   ├── feature/
│   │   │   ├── LoadOptimization/
│   │   │   │   ├── LoadHeatmap.jsx
│   │   │   │   ├── LoadGauge.jsx
│   │   │   │   ├── LoadAnalysisCharts.jsx
│   │   │   │   ├── LoadOptimizationRecommendations.jsx
│   │   │   │   ├── AutoTaskDistribution.jsx
│   │   │   │   └── index.js
│   ├── pages/
│   │   ├── LoadOptimizationPage.jsx
│   │   └── ...
│   ├── store/
│   │   ├── actions/
│   │   │   ├── loadOptimizationActions.js
│   │   │   └── ...
│   │   ├── reducers/
│   │   │   ├── loadOptimizationReducer.js
│   │   │   └── ...
│   │   ├── selectors/
│   │   │   ├── loadOptimizationSelectors.js
│   │   │   └── ...
│   │   └── index.js
│   ├── constants/
│   │   ├── actionTypes.js
│   │   ├── loadConstants.js
│   │   └── ...
│   ├── styles/
│   │   ├── components/
│   │   │   ├── LoadHeatmap.scss
│   │   │   └── ...
│   │   └── pages/
│   │       ├── LoadOptimizationPage.scss
│   │       └── ...
│   ├── App.jsx
│   ├── index.js
│   └── routes.js
├── tests/
│   ├── unit/
│   │   ├── components/
│   │   │   ├── LoadHeatmap.test.js
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── loadUtils.test.js
│   │   │   └── ...
│   │   └── store/
│   │       ├── loadOptimizationReducer.test.js
│   │       └── ...
│   └── e2e/
│       ├── loadOptimization.spec.js
│       └── ...
└── package.json
```

### 백엔드 구조
```
backend/
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── optimization/
│   │   │   │   ├── loadController.js
│   │   │   │   ├── optimizationController.js
│   │   │   │   └── stored_procedures.sql
│   │   │   └── ...
│   │   ├── routes/
│   │   │   ├── loadRoutes.js
│   │   │   ├── optimizationRoutes.js
│   │   │   └── ...
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js
│   │   │   ├── validationMiddleware.js
│   │   │   └── ...
│   │   └── validations/
│   │       ├── loadValidation.js
│   │       ├── optimizationValidation.js
│   │       └── ...
│   ├── models/
│   │   ├── ResourceLoad.js
│   │   ├── ResourceCapability.js
│   │   ├── LoadOptimizationRecommendation.js
│   │   ├── LoadOptimizationSimulation.js
│   │   └── ...
│   ├── services/
│   │   ├── loadService.js
│   │   ├── optimizationService.js
│   │   └── ...
│   ├── utils/
│   │   ├── logger.js
│   │   ├── database.js
│   │   ├── optimizationAlgorithms.js
│   │   └── ...
│   ├── config/
│   │   ├── database.js
│   │   ├── logger.js
│   │   └── ...
│   ├── scripts/
│   │   ├── migrations/
│   │   │   ├── 01_create_resource_loads_table.js
│   │   │   ├── 02_create_optimization_tables.js
│   │   │   └── ...
│   │   ├── seeds/
│   │   │   ├── seedResourceCapabilities.js
│   │   │   └── ...
│   │   └── ...
│   └── index.js
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   │   ├── optimizationService.test.js
│   │   │   └── ...
│   │   ├── controllers/
│   │   │   ├── optimizationController.test.js
│   │   │   └── ...
│   │   └── utils/
│   │       ├── optimizationAlgorithms.test.js
│   │       └── ...
│   ├── integration/
│   │   ├── api/
│   │   │   ├── loadApi.test.js
│   │   │   ├── optimizationApi.test.js
│   │   │   └── ...
│   │   └── ...
│   └── fixtures/
│       ├── resourceData.js
│       ├── taskData.js
│       └── ...
└── package.json
```

### 주요 컴포넌트 코드
#### LoadOptimizationPage.jsx
```jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, Button, Tabs, DatePicker, Space, Alert } from 'antd';
import { AreaChartOutlined, BarChartOutlined, FireOutlined } from '@ant-design/icons';
import { format, addDays } from 'date-fns';
import { LoadHeatmap, LoadGauge, LoadOptimizationRecommendations } from '../../components/feature/LoadOptimization';
import { AutoTaskDistribution } from '../../components/feature/LoadOptimization';
import { fetchResourceLoads, fetchOptimizationRecommendations } from '../../store/actions/loadOptimizationActions';
import { selectResourceLoads, selectOverloadedResources, selectRecommendations } from '../../store/selectors/loadOptimizationSelectors';
import { logService } from '../../services/utils/logService';
import './LoadOptimizationPage.scss';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const LoadOptimizationPage = () => {
  const dispatch = useDispatch();
  
  // 상태 관리
  const [activeTab, setActiveTab] = useState('heatmap');
  const [timeRange, setTimeRange] = useState({
    start: new Date(),
    end: addDays(new Date(), 30) // 기본 30일
  });
  const [showSimulation, setShowSimulation] = useState(false);
  
  // 리덕스 스토어에서 데이터 가져오기
  const resourceLoads = useSelector(selectResourceLoads);
  const overloadedResources = useSelector(selectOverloadedResources);
  const recommendations = useSelector(selectRecommendations);
  const loading = useSelector(state => state.loadOptimization.loading);
  const error = useSelector(state => state.loadOptimization.error);
  
  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchResourceLoads(timeRange));
        await dispatch(fetchOptimizationRecommendations(timeRange));
        
        logService.logLoadOptimization('page_loaded', { 
          timeRange,
          overloadedCount: overloadedResources.length
        });
      } catch (error) {
        logService.logOptimizationError('load_data_failed', error, { timeRange });
      }
    };
    
    fetchData();
  }, [dispatch, timeRange]);
  
  // 날짜 범위 변경 핸들러
  const handleTimeRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      const newRange = {
        start: dates[0].toDate(),
        end: dates[1].toDate()
      };
      
      setTimeRange(newRange);
      
      logService.logLoadOptimization('time_range_changed', { 
        previousRange: timeRange,
        newRange
      });
    }
  };
  
  // 탭 변경 핸들러
  const handleTabChange = (key) => {
    setActiveTab(key);
    
    logService.logLoadOptimization('tab_changed', { 
      previousTab: activeTab,
      newTab: key
    });
  };
  
  // 시뮬레이션 시작 핸들러
  const handleStartSimulation = () => {
    setShowSimulation(true);
    
    logService.logLoadOptimization('simulation_started', { 
      timeRange,
      overloadedCount: overloadedResources.length
    });
  };
  
  // 시뮬레이션 취소 핸들러
  const handleCancelSimulation = () => {
    setShowSimulation(false);
    
    logService.logLoadOptimization('simulation_cancelled');
  };
  
  // 권장사항 적용 핸들러
  const handleApplyRecommendation = (recommendationId) => {
    // 권장사항 적용 로직
    // ...
    
    logService.logLoadOptimization('recommendation_applied', { 
      recommendationId
    });
  };
  
  // 권장사항 거부 핸들러
  const handleRejectRecommendation = (recommendationId) => {
    // 권장사항 거부 로직
    // ...
    
    logService.logLoadOptimization('recommendation_rejected', { 
      recommendationId
    });
  };
  
  // 오류 표시
  if (error) {
    return (
      <div className="load-optimization-page">
        <Alert
          type="error"
          message="부하 데이터 로드 오류"
          description={error}
          showIcon
        />
      </div>
    );
  }
  
  // 시뮬레이션 화면
  if (showSimulation) {
    return (
      <div className="load-optimization-page">
        <AutoTaskDistribution
          timeRange={timeRange}
          onCancel={handleCancelSimulation}
        />
      </div>
    );
  }
  
  return (
    <div className="load-optimization-page">
      <div className="page-header">
        <div className="page-title">
          <h1>부하 최적화</h1>
        </div>
        
        <div className="page-controls">
          <Space size="large">
            <RangePicker
              value={[timeRange.start, timeRange.end].map(date => moment(date))}
              onChange={handleTimeRangeChange}
              format="YYYY-MM-DD"
              allowClear={false}
              data-cy="heatmap-time-range-picker"
            />
            
            <Button
              type="primary"
              icon={<FireOutlined />}
              onClick={handleStartSimulation}
              data-cy="start-optimization-button"
            >
              최적화 시뮬레이션
            </Button>
          </Space>
        </div>
      </div>
      
      <Row gutter={[16, 16]} className="load-summary-section">
        <Col span={8}>
          <Card title="전체 부하 상태">
            <LoadGauge
              load={resourceLoads.averageLoad || 0}
              capacity={100}
              size="large"
              showDetail
              showThresholds
            />
          </Card>
        </Col>
        
        <Col span={8}>
          <Card 
            title="과부하 리소스" 
            className={overloadedResources.length > 0 ? 'overloaded-card' : ''}
          >
            <div className="stat-card">
              <div className="stat-value" data-cy="overloaded-resources-count">
                {overloadedResources.length}
              </div>
              <div className="stat-label">
                {overloadedResources.length === 1 ? '리소스' : '리소스들'}
              </div>
            </div>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card title="권장사항">
            <div className="stat-card">
              <div className="stat-value">
                {recommendations.length}
              </div>
              <div className="stat-label">
                {recommendations.length === 1 ? '권장사항' : '권장사항들'}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      
      <div className="load-main-content">
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane
            tab={
              <span>
                <AreaChartOutlined />
                히트맵
              </span>
            }
            key="heatmap"
          >
            <LoadHeatmap
              data={resourceLoads.resources || []}
              resources={resourceLoads.resourceList || []}
              timeRange={timeRange}
              loading={loading}
              data-cy="load-heatmap"
            />
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <BarChartOutlined />
                분석
              </span>
            }
            key="analysis"
          >
            {/* 부하 분석 컴포넌트들 */}
          </TabPane>
        </Tabs>
      </div>
      
      <div className="load-recommendations-section">
        <LoadOptimizationRecommendations
          recommendations={recommendations}
          onApply={handleApplyRecommendation}
          onReject={handleRejectRecommendation}
          onViewDetails={(id) => console.log('View details', id)}
          loading={loading}
          data-cy="optimization-recommendations"
        />
      </div>
    </div>
  );
};

export default LoadOptimizationPage;
```

#### optimizationController.js
```javascript
const optimizationService = require('../../../services/optimizationService');
const { validationResult } = require('express-validator');
const logger = require('../../../utils/logger');

// 리소스 부하 조회
exports.getResourceLoads = async (req, res, next) => {
  try {
    // 쿼리 파라미터 추출
    const { 
      startDate, 
      endDate, 
      resourceIds, 
      departmentId, 
      teamId, 
      timeUnit = 'day' 
    } = req.query;
    
    // 필수 파라미터 검증
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: '시작일과 종료일은 필수 매개변수입니다.'
      });
    }
    
    // 날짜 형식 검증
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: '유효한 날짜 형식이 아닙니다.'
      });
    }
    
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: '시작일이 종료일보다 늦을 수 없습니다.'
      });
    }
    
    // 로깅
    logger.info('Resource loads request', {
      userId: req.user.id,
      startDate,
      endDate,
      resourceIds,
      departmentId,
      teamId,
      timeUnit
    });
    
    // 부하 데이터 조회
    const result = await optimizationService.getResourceLoads({
      startDate: start,
      endDate: end,
      resourceIds: resourceIds ? resourceIds.split(',') : null,
      departmentId,
      teamId,
      timeUnit
    });
    
    // 응답
    res.status(200).json({
      success: true,
      data: result
    });
    
  } catch (error) {
    logger.error('Error fetching resource loads', {
      userId: req.user?.id,
      params: req.query,
      error: error.message,
      stack: error.stack
    });
    
    next(error);
  }
};

// 부하 최적화 권장사항 조회
exports.getOptimizationRecommendations = async (req, res, next) => {
  try {
    // 쿼리 파라미터 추출
    const { 
      startDate, 
      endDate, 
      resourceIds, 
      minImpact = 0 
    } = req.query;
    
    // 필수 파라미터 검증
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: '시작일과 종료일은 필수 매개변수입니다.'
      });
    }
    
    // 날짜 형식 검증
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: '유효한 날짜 형식이 아닙니다.'
      });
    }
    
    // 로깅
    logger.info('Optimization recommendations request', {
      userId: req.user.id,
      startDate,
      endDate,
      resourceIds,
      minImpact
    });
    
    // 권장사항 조회
    const recommendations = await optimizationService.getOptimizationRecommendations({
      timeRange: {
        start,
        end
      },
      resourceIds: resourceIds ? resourceIds.split(',') : null,
      minImpact: parseFloat(minImpact)
    });
    
    // 응답
    res.status(200).json({
      success: true,
      data: recommendations
    });
    
  } catch (error) {
    logger.error('Error fetching optimization recommendations', {
      userId: req.user?.id,
      params: req.query,
      error: error.message,
      stack: error.stack
    });
    
    next(error);
  }
};

// 최적화 시뮬레이션 실행
exports.runOptimizationSimulation = async (req, res, next) => {
  try {
    // 요청 바디 검증
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '유효성 검사 오류',
        errors: errors.array()
      });
    }
    
    const { 
      timeRange, 
      optimizationGoal, 
      maxLoadThreshold, 
      respectSkills, 
      preserveAssignments,
      resourceIds
    } = req.body;
    
    // 필수 매개변수 확인
    if (!timeRange || !timeRange.start || !timeRange.end) {
      return res.status(400).json({
        success: false,
        message: '유효한 시간 범위가 필요합니다.'
      });
    }
    
    // 날짜 형식 검증
    const startDate = new Date(timeRange.start);
    const endDate = new Date(timeRange.end);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: '시작일 또는 종료일이 유효한 날짜 형식이 아닙니다.'
      });
    }
    
    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: '시작일이 종료일보다 늦을 수 없습니다.'
      });
    }
    
    // 로깅
    logger.info('Optimization simulation request', {
      userId: req.user.id,
      timeRange,
      optimizationGoal,
      maxLoadThreshold,
      respectSkills,
      preserveAssignments,
      resourceIds
    });
    
    // 시뮬레이션 실행
    const simulation = await optimizationService.runOptimizationSimulation({
      ...req.body,
      userId: req.user.id
    });
    
    // 로깅
    logger.info('Optimization simulation completed', {
      userId: req.user.id,
      simulationId: simulation.id,
      reassignmentsCount: simulation.reassignments.length,
      improvements: simulation.improvements
    });
    
    // 응답
    res.status(200).json({
      success: true,
      data: simulation
    });
    
  } catch (error) {
    logger.error('Error running optimization simulation', {
      userId: req.user?.id,
      params: req.body,
      error: error.message,
      stack: error.stack
    });
    
    // 특정 오류 유형에 따른 응답
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: error.errors
      });
    }
    
    if (error.name === 'ResourceNotFoundError') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    next(error);
  }
};

// 시뮬레이션 결과 적용
exports.applySimulation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { taskIds } = req.body;
    
    // 매개변수 검증
    if (!id) {
      return res.status(400).json({
        success: false,
        message: '시뮬레이션 ID가 필요합니다.'
      });
    }
    
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '적용할 작업 ID 목록이 필요합니다.'
      });
    }
    
    // 로깅
    logger.info('Apply simulation request', {
      userId: req.user.id,
      simulationId: id,
      taskCount: taskIds.length
    });
    
    // 시뮬레이션 적용
    const result = await optimizationService.applySimulation(id, taskIds, req.user.id);
    
    // 로깅
    logger.info('Simulation applied', {
      userId: req.user.id,
      simulationId: id,
      reassignedTasks: result.reassignedTasks
    });
    
    // 응답
    res.status(200).json({
      success: true,
      data: result
    });
    
  } catch (error) {
    logger.error('Error applying simulation', {
      userId: req.user?.id,
      simulationId: req.params.id,
      taskIds: req.body?.taskIds,
      error: error.message,
      stack: error.stack
    });
    
    // 특정 오류 유형에 따른 응답
    if (error.name === 'NotFoundError') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    next(error);
  }
};
```

## 보안/권한/알림/운영

### 보안 전략
#### 데이터 보안
- **접근 제어**:
  - 리소스 부하 데이터는 해당 리소스 담당자, 팀 리더, 프로젝트 관리자만 조회 가능
  - 부하 최적화 시뮬레이션은 팀 리더 이상만 수행 가능
  - 시뮬레이션 결과 적용은 프로젝트 관리자 이상만 가능

```javascript
// 권한 검사 미들웨어
const checkOptimizationPermission = (action) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      // 관리자는 모든 권한 보유
      if (user.role === 'admin') {
        return next();
      }
      
      switch (action) {
        case 'view_loads':
          // 부하 조회 권한 검사
          // 팀 멤버는 자신의 부하만 조회 가능
          if (user.role === 'team_member') {
            const resourceIds = req.query.resourceIds;
            
            // 리소스 ID가 지정되지 않았거나 자신의 ID가 아닌 경우
            if (!resourceIds || !resourceIds.includes(user.resourceId)) {
              return res.status(403).json({
                success: false,
                message: '자신의 부하 데이터만 조회할 수 있습니다.'
              });
            }
          }
          // 팀 리더는 자신의 팀 부하만 조회 가능
          else if (user.role === 'team_leader') {
            const teamId = req.query.teamId;
            
            // 팀 ID가 지정되지 않았거나 자신의 팀이 아닌 경우
            if (!teamId || teamId !== user.teamId) {
              return res.status(403).json({
                success: false,
                message: '자신의 팀 부하 데이터만 조회할 수 있습니다.'
              });
            }
          }
          break;
          
        case 'run_simulation':
          // 시뮬레이션 실행 권한 검사
          if (user.role === 'team_member') {
            return res.status(403).json({
              success: false,
              message: '팀 리더 이상만 시뮬레이션을 실행할 수 있습니다.'
            });
          }
          break;
          
        case 'apply_simulation':
          // 시뮬레이션 적용 권한 검사
          if (user.role !== 'project_manager' && user.role !== 'admin') {
            return res.status(403).json({
              success: false,
              message: '프로젝트 관리자 이상만 시뮬레이션 결과를 적용할 수 있습니다.'
            });
          }
          break;
          
        default:
          return res.status(403).json({
            success: false,
            message: '권한이 없습니다.'
          });
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};
```

- **데이터 암호화**:
  - 민감한 리소스 데이터 전송 시 HTTPS 사용
  - 데이터베이스에 저장되는 민감 정보 암호화

```javascript
// 데이터 암호화 유틸리티
const crypto = require('crypto');
const config = require('../config');

const encryptionUtils = {
  // 데이터 암호화
  encrypt: (text) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(config.encryption.key, 'hex'),
      iv
    );
    
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  },
  
  // 데이터 복호화
  decrypt: (text) => {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(config.encryption.key, 'hex'),
      iv
    );
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  }
};
```

### 알림 시스템
#### 알림 유형
- **과부하 알림**: 리소스 부하가 임계값(90%)을 초과할 경우
- **부하 변화 알림**: 리소스 부하가 급격히 변화(±30%)할 경우
- **최적화 권장사항 알림**: 새로운 부하 최적화 권장사항이 생성될 경우
- **최적화 적용 알림**: 최적화 결과가 적용되어 작업이 재할당된 경우

```javascript
// 알림 생성 서비스
const NotificationType = {
  OVERLOAD: 'overload',
  LOAD_CHANGE: 'load_change',
  OPTIMIZATION_RECOMMENDATION: 'optimization_recommendation',
  OPTIMIZATION_APPLIED: 'optimization_applied'
};

const notificationService = {
  // 과부하 알림 생성
  createOverloadNotification: async (resource, loadData) => {
    const maxLoad = Math.max(...Object.values(loadData));
    const overloadDates = Object.entries(loadData)
      .filter(([_, load]) => load >= 90)
      .map(([date, _]) => date);
    
    if (overloadDates.length === 0) return;
    
    const notification = {
      type: NotificationType.OVERLOAD,
      recipients: [
        resource.userId,                // 리소스 본인
        ...await getResourceManagers(resource.id) // 관리자들
      ],
      title: `${resource.name} 리소스 과부하 알림`,
      content: `${resource.name} 리소스의 부하가 ${maxLoad.toFixed(0)}%에 달합니다. 
                ${overloadDates.length}일 동안 과부하 상태입니다.`,
      data: {
        resourceId: resource.id,
        resourceName: resource.name,
        maxLoad,
        overloadDates
      },
      priority: 'high',
      actionUrl: `/optimization?resourceId=${resource.id}`
    };
    
    return await createNotification(notification);
  },
  
  // 부하 변화 알림 생성
  createLoadChangeNotification: async (resource, previousLoad, currentLoad) => {
    const loadChange = currentLoad - previousLoad;
    const changePercent = (loadChange / previousLoad) * 100;
    
    // 30% 이상 변화된 경우만 알림
    if (Math.abs(changePercent) < 30) return;
    
    const notification = {
      type: NotificationType.LOAD_CHANGE,
      recipients: [
        resource.userId,
        ...await getResourceManagers(resource.id)
      ],
      title: `${resource.name} 리소스 부하 변화 알림`,
      content: `${resource.name} 리소스의 부하가 ${changePercent > 0 ? '증가' : '감소'}했습니다. 
                (${previousLoad.toFixed(0)}% → ${currentLoad.toFixed(0)}%, ${Math.abs(changePercent).toFixed(0)}% ${changePercent > 0 ? '증가' : '감소'})`,
      data: {
        resourceId: resource.id,
        resourceName: resource.name,
        previousLoad,
        currentLoad,
        changePercent
      },
      priority: changePercent > 50 ? 'high' : 'medium',
      actionUrl: `/optimization?resourceId=${resource.id}`
    };
    
    return await createNotification(notification);
  },
  
  // 최적화 권장사항 알림 생성
  createOptimizationRecommendationNotification: async (recommendation) => {
    // 영향받는 리소스 관리자들
    const managers = await getResourcesManagers(
      recommendation.affectedResources.map(r => r.id)
    );
    
    const notification = {
      type: NotificationType.OPTIMIZATION_RECOMMENDATION,
      recipients: managers,
      title: '부하 최적화 권장사항 알림',
      content: `새로운 부하 최적화 권장사항이 생성되었습니다: ${recommendation.title}`,
      data: {
        recommendationId: recommendation.id,
        title: recommendation.title,
        impact: recommendation.impact,
        affectedResourcesCount: recommendation.affectedResources.length,
        tasksToChangeCount: recommendation.tasksToChange.length
      },
      priority: recommendation.priority >= 4 ? 'high' : 'medium',
      actionUrl: `/optimization?recommendationId=${recommendation.id}`
    };
    
    return await createNotification(notification);
  },
  
  // 최적화 적용 알림 생성
  createOptimizationAppliedNotification: async (simulation, appliedTaskIds, appliedBy) => {
    // 영향받는 리소스들 조회
    const affectedResourceIds = new Set();
    
    // 적용된 작업들 필터링
    const appliedReassignments = simulation.reassignments.filter(
      r => appliedTaskIds.includes(r.taskId)
    );
    
    appliedReassignments.forEach(r => {
      affectedResourceIds.add(r.fromResourceId);
      affectedResourceIds.add(r.toResourceId);
    });
    
    // 영향받는 리소스들과 그 관리자들
    const affectedUsers = await getResourcesAndManagers(Array.from(affectedResourceIds));
    
    const notification = {
      type: NotificationType.OPTIMIZATION_APPLIED,
      recipients: affectedUsers,
      title: '부하 최적화 적용 알림',
      content: `부하 최적화 결과가 적용되어 ${appliedReassignments.length}개 작업이 재할당되었습니다.`,
      data: {
        simulationId: simulation.id,
        appliedTasksCount: appliedReassignments.length,
        appliedBy,
        affectedResourcesCount: affectedResourceIds.size
      },
      priority: 'medium',
      actionUrl: `/optimization?simulationId=${simulation.id}`
    };
    
    return await createNotification(notification);
  }
};
```

### 운영 전략
#### 부하 계산 스케줄링
- **일일 부하 계산**: 매일 자정에 전체 리소스 부하 계산
- **실시간 부하 업데이트**: 작업 변경 시 관련 리소스 부하 실시간 업데이트
- **권장사항 생성**: 주기적으로 부하 상태 분석 및 권장사항 생성

```javascript
// 부하 계산 및 권장사항 생성 스케줄러
const cron = require('node-cron');
const loadService = require('../services/loadService');
const optimizationService = require('../services/optimizationService');
const logger = require('../utils/logger');

// 일일 부하 계산 (매일 자정에 실행)
cron.schedule('0 0 * * *', async () => {
  try {
    logger.info('Daily load calculation started');
    
    // 전체 리소스 조회
    const resources = await resourceService.getAllActiveResources();
    
    // 각 리소스의 부하 계산
    for (const resource of resources) {
      try {
        // 30일 기간의 부하 계산
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        
        await loadService.calculateAndStoreResourceLoad(
          resource.id,
          startDate,
          endDate
        );
        
        logger.info('Resource load calculated', { resourceId: resource.id });
      } catch (error) {
        logger.error('Failed to calculate resource load', {
          resourceId: resource.id,
          error: error.message,
          stack: error.stack
        });
      }
    }
    
    logger.info('Daily load calculation completed');
  } catch (error) {
    logger.error('Daily load calculation failed', {
      error: error.message,
      stack: error.stack
    });
  }
});

// 권장사항 생성 (매주 월요일 오전 1시에 실행)
cron.schedule('0 1 * * 1', async () => {
  try {
    logger.info('Weekly optimization recommendations generation started');
    
    // 최적화 권장사항 생성
    const timeRange = {
      start: new Date(),
      end: new Date()
    };
    timeRange.end.setDate(timeRange.end.getDate() + 60); // 향후 60일
    
    const recommendations = await optimizationService.generateOptimizationRecommendations(timeRange);
    
    logger.info('Weekly optimization recommendations generation completed', {
      recommendationsCount: recommendations.length
    });
    
    // 새 권장사항에 대한 알림 생성
    for (const recommendation of recommendations) {
      await notificationService.createOptimizationRecommendationNotification(recommendation);
    }
  } catch (error) {
    logger.error('Weekly optimization recommendations generation failed', {
      error: error.message,
      stack: error.stack
    });
  }
});
```

#### 성능 모니터링
- **API 응답 시간 모니터링**: 부하 조회 및 최적화 API 성능 추적
- **최적화 알고리즘 성능 모니터링**: 최적화 알고리즘 수행 시간 및 리소스 사용량 추적
- **부하 임계치 초과 알림**: 부하가 임계치를 초과하는 리소스에 대한 알림

```javascript
// API 응답 시간 모니터링 미들웨어
const responseTimeMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // 응답 완료 시 로깅
  res.on('finish', () => {
    const duration = Date.now() - start;
    const path = req.originalUrl;
    const method = req.method;
    const status = res.statusCode;
    
    // 로그 기록
    logger.info('API response time', {
      path,
      method,
      status,
      duration,
      userId: req.user?.id
    });
    
    // 임계치 초과 시 경고 로그
    if (duration > 1000) { // 1초 초과
      logger.warn('Slow API response', {
        path,
        method,
        status,
        duration,
        userId: req.user?.id
      });
      
      // 성능 모니터링 서비스에 알림
      performanceMonitor.reportSlowResponse({
        path,
        method,
        duration,
        timestamp: new Date()
      });
    }
  });
  
  next();
};
```

## 문서화/가이드

### 사용자 가이드
#### 부하 히트맵 사용 가이드
히트맵을 통해 리소스 부하 상태를 직관적으로 확인하고 분석하는 방법을 안내합니다.

##### 기본 사용법
1. **히트맵 화면 접근**: 메인 메뉴에서 "부하 최적화" 선택
2. **날짜 범위 선택**: 상단의 날짜 선택기를 통해 조회할 기간 설정
3. **히트맵 탐색**: 
   - 세로축: 리소스 목록
   - 가로축: 날짜
   - 셀 색상: 부하 수준 (녹색: 저부하, 노란색: 적정부하, 빨간색: 과부하)
4. **세부 정보 확인**: 셀에 마우스 오버하면 해당 날짜/리소스의 상세 부하 정보 표시
5. **작업 세부 정보**: 셀 클릭 시 해당 날짜/리소스에 할당된 작업 목록 표시

##### 부하 분석
1. **과부하 리소스 식별**: 빨간색(90% 이상)으로 표시된 셀은 과부하 상태
2. **부하 패턴 분석**: 특정 날짜나 리소스에 집중된 부하 패턴 분석
3. **부하 비교**: 리소스 간 부하 분포 비교
4. **추세 확인**: 시간에 따른 부하 변화 추세 확인

##### 필터링 및 그룹화
1. **부서/팀별 필터링**: 특정 부서나 팀만 선택하여 표시
2. **리소스 검색**: 이름, 역할 등으로 리소스 검색
3. **부하 수준별 필터링**: 특정 부하 범위에 해당하는 셀만 강조 표시
4. **정렬 옵션**: 평균 부하, 최대 부하 등으로 리소스 정렬

#### 부하 최적화 시뮬레이션 가이드
부하 최적화 시뮬레이션을 실행하고 결과를 적용하는 방법을 안내합니다.

##### 시뮬레이션 실행
1. **시뮬레이션 시작**: 부하 최적화 페이지에서 "최적화 시뮬레이션" 버튼 클릭
2. **최적화 설정**:
   - 최적화 목표 선택: 부하 균등화, 최대 부하 최소화, 비용 최소화
   - 최대 부하 임계값 설정: 허용 가능한 최대 부하 수준 (기본값: 90%)
   - 리소스 역량 고려 옵션: 작업에 필요한 스킬과 리소스 역량 매칭 여부
   - 현재 할당 유지 옵션: 이미 진행 중인 작업의 할당 유지 여부
   - 가중치 설정: 우선순위, 마감일, 균형 가중치 설정
3. **최적화 계산**: "최적화 계산" 버튼을 클릭하여 시뮬레이션 실행
4. **결과 검토**:
   - 개선 지표: 부하 균형 개선율, 과부하 리소스 감소, 부하 분산 감소 등
   - 현재 vs 최적화 후 비교: 부하 분포 차트 비교
   - 재할당 작업 목록: 재할당이 권장되는 작업 목록

##### 결과 적용
1. **작업 선택**: 적용할 재할당 작업 선택 (전체 또는 일부)
2. **선택적 적용**: "선택한 변경사항 적용" 버튼 클릭
3. **적용 확인**: 적용 완료 메시지 확인
4. **결과 확인**: 히트맵에서 부하 변화 확인

##### 유의사항
- 시뮬레이션은 현재 작업 상태 및 리소스 가용성을 기준으로 계산됩니다.
- 프로젝트 관리자만 결과를 실제로 적용할 수 있습니다.
- 결과 적용 시 관련 리소스 및 담당자에게 알림이 전송됩니다.
- 적용 후 변경사항은 즉시 반영되며, 관련 작업 담당자가 변경됩니다.

### 관리자 가이드
#### 부하 최적화 설정 가이드
시스템 관리자가 부하 최적화 기능 및 알고리즘을 설정하는 방법을 안내합니다.

##### 부하 계산 설정
1. **작업일 설정**: 작업이 수행되는 요일 설정 (기본: 월-금)
2. **일일 작업 시간**: 리소스별 일일 기본 작업 시간 설정 (기본: 8시간)
3. **휴일 설정**: 공휴일 등 작업이 없는 날짜 설정
4. **부하 임계값 설정**:
   - 저부하: 0-30% (기본)
   - 적정부하: 30-70% (기본)
   - 고부하: 70-90% (기본)
   - 과부하: 90-100% (기본)

##### 최적화 알고리즘 설정
1. **알고리즘 선택**:
   - 부하 균등화: 모든 리소스의 부하를 균등하게 분배
   - 최대 부하 최소화: 최대 부하가 가장 높은 리소스의 부하를 줄이는 데 중점
   - 비용 최소화: 작업 비용을 최소화하는 방향으로 최적화
2. **가중치 기본값 설정**:
   - 우선순위 가중치: 작업 우선순위에 대한 중요도 (기본: 3)
   - 마감일 가중치: 작업 마감일에 대한 중요도 (기본: 3)
   - 균형 가중치: 리소스 간 부하 균형에 대한 중요도 (기본: 3)
3. **제약조건 설정**:
   - 리소스 역량 매칭 필수 여부
   - 진행 중 작업 재할당 허용 여부
   - 최대 재할당 작업 수 제한

##### 알림 설정
1. **알림 임계값 설정**:
   - 과부하 알림 임계값: 90% (기본)
   - 부하 변화 알림 임계값: 30% (기본)
2. **알림 수신자 설정**:
   - 리소스 본인 알림 여부
   - 팀 리더 알림 여부
   - 프로젝트 관리자 알림 여부
3. **알림 채널 설정**:
   - 인앱 알림 사용 여부
   - 이메일 알림 사용 여부
   - 슬랙 알림 사용 여부
