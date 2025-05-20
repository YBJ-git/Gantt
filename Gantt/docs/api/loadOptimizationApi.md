# 부하 최적화 API 문서

작업 부하체크 간트 차트 시스템의 부하 최적화 API 문서입니다.

## 기본 정보

- 기본 URL: `http://localhost:3000/api`
- 응답 형식: JSON
- 인증: JWT 토큰 기반 (Authorization 헤더)

## 공통 응답 구조

### 성공 응답

```json
{
  "success": true,
  "data": { ... } // 각 API별 응답 데이터
}
```

### 오류 응답

```json
{
  "success": false,
  "message": "오류 메시지",
  "error": { ... } // 상세 오류 정보 (선택적)
}
```

## API 엔드포인트

### 1. 부하 데이터 조회

특정 기간 및 프로젝트의 부하 데이터를 조회합니다.

- **URL**: `/loadOptimization/data`
- **Method**: `GET`
- **인증 필요**: 예

#### 요청 파라미터

| 파라미터  | 타입   | 필수 | 설명                      |
|-----------|--------|------|---------------------------|
| startDate | String | 아니오 | 시작일 (YYYY-MM-DD 형식) |
| endDate   | String | 아니오 | 종료일 (YYYY-MM-DD 형식) |
| projectId | String | 아니오 | 프로젝트 ID              |
| teamId    | String | 아니오 | 팀 ID                    |

#### 응답

```json
{
  "success": true,
  "data": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31",
    "resourceLoads": [
      {
        "resourceId": "resource-1",
        "resourceName": "리소스 1",
        "resourceType": "DEVELOPER",
        "capacity": 8,
        "avgLoad": 75.5,
        "maxLoad": 110,
        "loadByDate": [
          {
            "date": "2025-01-01",
            "tasks": [
              {
                "id": "task-1",
                "name": "작업 1",
                "hours": 6
              }
            ],
            "workHours": 6,
            "capacity": 8,
            "load": 75,
            "status": "NORMAL"
          },
          // ...더 많은 날짜 데이터
        ]
      },
      // ...더 많은 리소스 데이터
    ],
    "systemLoadByDate": [
      {
        "date": "2025-01-01",
        "load": 70.2,
        "status": "NORMAL",
        "resourcesCount": 5,
        "overloadedCount": 0,
        "highLoadCount": 2,
        "normalCount": 3,
        "underutilizedCount": 0
      },
      // ...더 많은 시스템 부하 데이터
    ]
  }
}
```

### 2. 리소스별 부하 분석

특정 리소스들의 부하 데이터를 분석합니다.

- **URL**: `/loadOptimization/resource`
- **Method**: `GET`
- **인증 필요**: 예

#### 요청 파라미터

| 파라미터     | 타입   | 필수 | 설명                                    |
|------------|--------|------|-----------------------------------------|
| resourceIds | String | 아니오 | 리소스 ID 목록 (쉼표로 구분)            |
| startDate   | String | 예   | 시작일 (YYYY-MM-DD 형식)                |
| endDate     | String | 예   | 종료일 (YYYY-MM-DD 형식)                |

#### 응답

```json
{
  "success": true,
  "data": [
    {
      "resourceId": "resource-1",
      "resourceName": "리소스 1",
      "resourceType": "DEVELOPER",
      "capacity": 8,
      "avgLoad": 75.5,
      "maxLoad": 110,
      "loadScore": 85.2,
      "loadByDate": [
        {
          "date": "2025-01-01",
          "tasks": [
            {
              "id": "task-1",
              "name": "작업 1",
              "hours": 6
            }
          ],
          "workHours": 6,
          "capacity": 8,
          "load": 75,
          "status": "NORMAL"
        },
        // ...더 많은 날짜 데이터
      ],
      "summary": {
        "totalDays": 20,
        "overloadedDays": 2,
        "highLoadDays": 5,
        "normalDays": 10,
        "underutilizedDays": 3,
        "overloadedPercent": 10,
        "underutilizedPercent": 15
      }
    },
    // ...더 많은 리소스 데이터
  ]
}
```

### 3. 부하 최적화 추천 사항

부하를 최적화하기 위한 추천 사항을 조회합니다.

- **URL**: `/loadOptimization/recommendations`
- **Method**: `GET`
- **인증 필요**: 예

#### 요청 파라미터

| 파라미터    | 타입   | 필수 | 설명                       |
|------------|--------|------|----------------------------|
| projectId  | String | 예   | 프로젝트 ID                |
| teamId     | String | 아니오 | 팀 ID                     |
| startDate  | String | 예   | 시작일 (YYYY-MM-DD 형식)   |
| endDate    | String | 예   | 종료일 (YYYY-MM-DD 형식)   |
| threshold  | Number | 아니오 | 부하 임계값 (기본값: 80)   |

#### 응답

```json
{
  "success": true,
  "data": {
    "optimizationId": "opt-1",
    "overloadedResources": [
      {
        "resourceId": "resource-1",
        "resourceName": "리소스 1",
        "resourceType": "DEVELOPER",
        "avgLoad": 95.5,
        "maxLoad": 120,
        "loadByDate": [
          // ...부하 데이터
        ]
      }
    ],
    "underutilizedResources": [
      {
        "resourceId": "resource-2",
        "resourceName": "리소스 2",
        "resourceType": "DEVELOPER",
        "avgLoad": 35.2,
        "maxLoad": 65,
        "loadByDate": [
          // ...부하 데이터
        ]
      }
    ],
    "recommendations": [
      {
        "taskId": "task-1",
        "taskName": "작업 1",
        "currentResourceId": "resource-1",
        "currentResourceName": "리소스 1",
        "suggestedResourceId": "resource-2",
        "suggestedResourceName": "리소스 2",
        "overloadDate": "2025-01-15",
        "expectedLoadReduction": 25.5,
        "reason": "리소스 1의 과부하(2025-01-15) 해소를 위한 작업 재분배"
      },
      // ...더 많은 추천 사항
    ]
  }
}
```

### 4. 작업 자동 재분배

작업을 리소스에 최적으로 자동 재분배합니다.

- **URL**: `/loadOptimization/autoDistribute`
- **Method**: `POST`
- **인증 필요**: 예

#### 요청 본문

```json
{
  "projectId": "project-1",
  "tasks": [
    {
      "id": "task-1",
      "name": "작업 1",
      "priority": "HIGH",
      "effort": 20,
      "resourceType": "DEVELOPER",
      "requiredSkills": ["skill-1", "skill-2"]
    },
    // ...더 많은 작업
  ],
  "resources": [
    {
      "id": "resource-1",
      "name": "리소스 1",
      "type": "DEVELOPER",
      "capacity": 8,
      "skills": ["skill-1", "skill-2", "skill-3"]
    },
    // ...더 많은 리소스
  ],
  "constraints": {
    "fixedAssignments": [
      {
        "taskId": "task-1",
        "resourceId": "resource-1"
      }
    ]
  }
}
```

#### 응답

```json
{
  "success": true,
  "data": {
    "redistributionId": "redistribution-1",
    "plan": [
      {
        "taskId": "task-1",
        "taskName": "작업 1",
        "resourceId": "resource-1",
        "resourceName": "리소스 1",
        "isFixed": true
      },
      {
        "taskId": "task-2",
        "taskName": "작업 2",
        "resourceId": "resource-2",
        "resourceName": "리소스 2",
        "isFixed": false
      },
      // ...더 많은 재분배 계획
    ],
    "analysis": {
      "totalTasks": 10,
      "resourceStats": [
        {
          "resourceId": "resource-1",
          "resourceName": "리소스 1",
          "taskCount": 3,
          "taskCountChange": -1,
          "isBalanced": true
        },
        // ...더 많은 리소스 통계
      ],
      "balanceScore": 85.5,
      "fixedAssignments": 1
    }
  }
}
```

### 5. 부하 최적화 적용

추천된 부하 최적화 계획을 적용합니다.

- **URL**: `/loadOptimization/apply`
- **Method**: `POST`
- **인증 필요**: 예

#### 요청 본문

```json
{
  "optimizationId": "opt-1",
  "modifications": [
    {
      "taskId": "task-1",
      "newResourceId": "resource-2"
    },
    // ...더 많은 변경 사항
  ]
}
```

#### 응답

```json
{
  "success": true,
  "data": {
    "appliedOptimizationId": "applied-opt-1",
    "modifications": [
      {
        "taskId": "task-1",
        "newResourceId": "resource-2"
      },
      // ...더 많은 적용된 변경 사항
    ],
    "postOptimizationLoad": {
      // 최적화 후 부하 데이터
      "resourceLoads": [
        // ...리소스별 부하 데이터
      ],
      "systemLoadByDate": [
        // ...시스템 부하 데이터
      ]
    }
  }
}
```

### 6. 부하 예측 분석

새로운 작업 추가 시 예상되는 부하를 예측합니다.

- **URL**: `/loadOptimization/predict`
- **Method**: `POST`
- **인증 필요**: 예

#### 요청 본문

```json
{
  "projectId": "project-1",
  "teamId": "team-1",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "newTasks": [
    {
      "id": "new-task-1",
      "name": "새 작업 1",
      "startDate": "2025-01-15",
      "endDate": "2025-01-20",
      "effort": 30,
      "resourceId": "resource-1"
    },
    // ...더 많은 새 작업
  ]
}
```

#### 응답

```json
{
  "success": true,
  "data": {
    "predictionId": "prediction-1",
    "currentLoad": {
      // 현재 부하 데이터
    },
    "predictedLoad": {
      // 예측 부하 데이터
    },
    "difference": {
      "resourceLoadDiffs": [
        {
          "resourceId": "resource-1",
          "resourceName": "리소스 1",
          "avgLoadDiff": 15.5,
          "maxLoadDiff": 25.0,
          "overloadedDaysBefore": 0,
          "overloadedDaysAfter": 2
        },
        // ...더 많은 리소스 부하 차이
      ],
      "systemAvgLoadBefore": 65.2,
      "systemAvgLoadAfter": 75.5,
      "systemLoadDiff": 10.3
    }
  }
}
```

## 오류 코드

| 코드 | 설명                          |
|------|-------------------------------|
| 400  | 잘못된 요청                   |
| 401  | 인증 오류                     |
| 403  | 권한 부족                     |
| 404  | 리소스를 찾을 수 없음         |
| 500  | 서버 내부 오류                |

## 데이터 모델

### 리소스 (Resource)

```json
{
  "id": "resource-1",
  "name": "리소스 1",
  "type": "DEVELOPER",
  "capacity": 8,
  "dailyCapacity": 8,
  "weekendCapacity": 0,
  "skills": ["skill-1", "skill-2", "skill-3"]
}
```

### 작업 (Task)

```json
{
  "id": "task-1",
  "name": "작업 1",
  "startDate": "2025-01-05",
  "endDate": "2025-01-10",
  "effort": 40,
  "priority": "HIGH",
  "resourceId": "resource-1",
  "resourceType": "DEVELOPER",
  "requiredSkills": ["skill-1", "skill-2"],
  "isFixed": false,
  "workOnWeekend": false
}
```

### 부하 데이터 (Load Data)

```json
{
  "date": "2025-01-05",
  "tasks": [
    {
      "id": "task-1",
      "name": "작업 1",
      "hours": 8
    }
  ],
  "workHours": 8,
  "capacity": 8,
  "load": 100,
  "status": "HIGH"
}
```

## 부하 상태 코드

| 코드          | 설명                        | 부하율 (%)   |
|---------------|----------------------------|--------------|
| OVERLOAD      | 과부하                      | > 100%       |
| HIGH          | 고부하                      | 80% ~ 100%   |
| NORMAL        | 정상 부하                   | 30% ~ 80%    |
| UNDERUTILIZED | 저부하                      | < 30%        |
