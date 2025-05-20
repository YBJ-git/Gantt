# 작업 등록/관리 기능 - 문서화/가이드

## 사용자 가이드

### 작업 목록 화면
#### 개요
작업 목록 화면은 모든 작업을 한눈에 볼 수 있는 메인 화면입니다. 여러 보기 모드(카드, 리스트, 간트 차트, 캘린더)를 제공하여 다양한 관점에서 작업을 조회할 수 있습니다.

#### 주요 기능
1. **보기 모드 전환**
   - 화면 상단의 탭을 클릭하여 카드 뷰, 리스트 뷰, 간트 차트, 캘린더 뷰 간 전환
   - 단축키: `1`(카드), `2`(리스트), `3`(간트), `4`(캘린더)

2. **필터링 및 검색**
   - 상태, 우선순위, 담당자, 기간 등으로 작업 필터링
   - 키워드로 작업 검색
   - 필터 저장 기능으로 자주 사용하는 필터 조합 저장

3. **정렬**
   - 시작일, 종료일, 우선순위, 상태 등으로 작업 정렬
   - 정렬 방향(오름차순/내림차순) 전환

4. **작업 추가**
   - 우측 상단의 '작업 추가' 버튼 클릭
   - 단축키: `N`

5. **일괄 작업**
   - 여러 작업 선택 후 일괄 상태 변경, 담당자 변경 등
   - 체크박스로 작업 선택 또는 `Shift` 키를 누른 채 여러 작업 선택

#### 사용 팁
- 드래그 앤 드롭으로 간트 차트에서 작업 일정 조정
- 카드 뷰에서 상태별로 그룹화된 작업을 다른 상태 컬럼으로 드래그하여 상태 변경
- 마우스 우클릭으로 작업에 대한 컨텍스트 메뉴 접근
- 필터와 보기 모드 설정은 자동 저장되어 다음 접속 시에도 유지

### 작업 상세 화면
#### 개요
작업 상세 화면은 선택한 작업에 대한 모든 정보를 조회하고 편집할 수 있는 화면입니다. 기본 정보, 일정, 담당자, 상태, 댓글 등을 관리할 수 있습니다.

#### 주요 기능
1. **기본 정보 조회/편집**
   - 제목, 설명, 상태, 우선순위 등
   - '편집' 버튼 클릭 시 인라인 편집 모드 전환
   - 단축키: `E`(편집 모드)

2. **일정 관리**
   - 시작일, 종료일, 예상 작업 시간 조회/편집
   - 일정 변경 시 자동으로 종속 작업 영향 계산

3. **진행 상황 추적**
   - 진행률 표시 및 업데이트
   - 상태 변경 히스토리 조회

4. **첨부 파일 관리**
   - 파일 첨부, 다운로드, 삭제
   - 미리보기 지원(이미지, PDF 등)

5. **댓글 및 협업**
   - 댓글 작성, 수정, 삭제
   - @멘션으로 팀원 태그
   - 코드 블록, 링크, 이미지 등 마크다운 형식 지원

6. **관련 작업**
   - 선행/후행 작업 목록 조회
   - 종속성 추가/제거
   - 관련 작업으로 빠른 이동

#### 사용 팁
- 댓글에 `#작업ID`를 입력하여 다른 작업 참조
- 진행률 바를 직접 클릭하여 빠르게 진행률 업데이트
- 설명이나 댓글에 체크리스트(`- [ ]` 형식)를 추가하여 하위 작업 관리
- 단축키 `Esc`로 편집 모드 취소

### 작업 생성/편집 화면
#### 개요
작업 생성/편집 화면에서는 새 작업을 등록하거나 기존 작업을 수정할 수 있습니다. 모든 작업 속성을 설정하고 저장할 수 있습니다.

#### 주요 기능
1. **기본 정보 입력**
   - 제목, 설명, 상태, 우선순위 설정
   - 필수 필드(*)는 반드시 입력 필요

2. **일정 설정**
   - 시작일, 종료일 선택
   - 예상 작업 시간 입력
   - 반복 작업 설정(선택 사항)

3. **담당자 할당**
   - 담당자 검색 및 선택
   - 다중 담당자 설정(선택 사항)

4. **종속성 설정**
   - 선행 작업 검색 및 선택
   - 종속성 유형 선택(완료-시작, 시작-시작 등)

5. **첨부 파일 업로드**
   - 파일 드래그 앤 드롭 또는 파일 선택기로 업로드
   - 지원 파일 형식 및 크기 제한 확인

#### 사용 팁
- 템플릿에서 시작하여 유사한 작업 빠르게 생성
- 탭을 사용하여 필드 간 빠르게 이동
- 작업 설명에 상세 정보를 포함하여 팀원의 이해 돕기
- 우선순위와 상태를 적절히 설정하여 작업의 중요도와 진행 상황 표시

### 일괄 작업 등록
#### 개요
일괄 작업 등록 기능을 사용하면 여러 작업을 한 번에 등록할 수 있습니다. 템플릿을 다운로드하여 작성한 후 업로드하거나, 직접 시스템에서 여러 작업을 추가할 수 있습니다.

#### 주요 기능
1. **템플릿 다운로드**
   - Excel 또는 CSV 형식의 템플릿 다운로드
   - 필수 필드 및 선택 필드 안내

2. **파일 업로드**
   - 작성된 템플릿 파일 업로드
   - 파일 형식 및 데이터 유효성 자동 검사

3. **데이터 미리보기**
   - 업로드된 데이터 확인
   - 오류 및 경고 표시
   - 데이터 직접 수정 가능

4. **일괄 등록**
   - 유효성 검사 통과 후 일괄 등록
   - 등록 결과 및 오류 리포트 제공

#### 사용 팁
- 템플릿 예시를 참고하여 올바른 형식으로 데이터 작성
- 대량 작업 등록 시 시스템 부하를 고려하여 적절한 분량으로 나누어 등록
- 날짜 형식(YYYY-MM-DD)을 준수하여 오류 방지
- 담당자 지정 시 정확한 사용자 ID 또는 이메일 사용

## 관리자 가이드

### 작업 유형 관리
#### 개요
작업 유형은 작업의 성격이나 카테고리를 분류하는 데 사용됩니다. 관리자는 조직에 맞는 작업 유형을 생성하고 관리할 수 있습니다.

#### 주요 기능
1. **작업 유형 목록**
   - 모든 작업 유형 조회
   - 이름, 설명, 색상, 아이콘 등 표시

2. **작업 유형 생성**
   - 이름, 설명 입력
   - 색상 및 아이콘 선택
   - 기본 필드 설정

3. **작업 유형 편집**
   - 기존 작업 유형 속성 수정
   - 사용/사용 중지 설정

4. **작업 유형 삭제**
   - 사용되지 않는 작업 유형 삭제
   - 삭제 전 확인 및 영향 분석

#### 관리 지침
- 조직의 프로젝트 특성에 맞게 작업 유형 정의
- 작업 유형별로 구분하기 쉬운 색상과 아이콘 선택
- 작업 유형 이름은 간결하고 명확하게 작성
- 자주 사용되는 유형의 경우 기본값으로 설정 고려

### 상태 및 워크플로우 관리
#### 개요
작업 상태와 워크플로우는 작업의 라이프사이클을 정의합니다. 관리자는 조직의 프로세스에 맞게 상태와 상태 전이 규칙을 설정할 수 있습니다.

#### 주요 기능
1. **상태 목록**
   - 모든 작업 상태 조회
   - 이름, 설명, 색상, 카테고리(대기/진행 중/완료 등) 표시

2. **상태 생성**
   - 이름, 설명 입력
   - 색상 선택
   - 카테고리 지정

3. **워크플로우 설정**
   - 상태 간 전이 규칙 설정
   - 각 전이에 필요한 권한 설정
   - 자동화 규칙 설정(예: 완료 시 진행률 100%로 설정)

4. **상태 사용/사용 중지**
   - 필요에 따라 상태 활성화/비활성화
   - 비활성화 시 영향 분석

#### 관리 지침
- 프로세스를 정확히 반영하는 상태 흐름 설계
- 너무 많은 상태는 복잡성을 증가시키므로 필요한 만큼만 생성
- 각 상태에 대한 명확한 설명과 진입/종료 조건 문서화
- 상태 변경 시 필요한 알림 및 자동화 설정

### 권한 관리
#### 개요
권한 관리를 통해 사용자 역할별로 작업 관리 기능에 대한 접근을 제어할 수 있습니다. 관리자는 역할을 정의하고 권한을 할당할 수 있습니다.

#### 주요 기능
1. **역할 관리**
   - 역할 생성, 편집, 삭제
   - 역할별 설명 및 범위 설정

2. **권한 설정**
   - 기능별 권한 설정(조회/생성/수정/삭제)
   - 데이터 범위 설정(자신의 작업만/팀 작업/모든 작업)
   - 특수 권한 설정(보고서 생성, 일괄 작업 등)

3. **사용자-역할 할당**
   - 사용자에게 역할 할당
   - 다중 역할 지원
   - 임시 권한 부여

4. **권한 감사**
   - 권한 변경 이력 조회
   - 권한 사용 로그 분석
   - 권한 설정 검증

#### 관리 지침
- 최소 권한의 원칙 적용: 필요한 최소한의 권한만 부여
- 역할 기반 접근 제어를 통해 관리 용이성 확보
- 정기적인 권한 검토 및 불필요한 권한 제거
- 중요 권한 변경 시 감사 추적 유지

### 성능 최적화
#### 개요
대량의 작업을 효율적으로 관리하기 위해 성능 최적화가 필요합니다. 관리자는 시스템 설정을 조정하여 성능을 향상시킬 수 있습니다.

#### 주요 기능
1. **페이지네이션 설정**
   - 페이지당 표시할 항목 수 조정
   - 무한 스크롤 또는 페이지 번호 방식 선택

2. **캐싱 설정**
   - 캐시 사용 여부 및 범위 설정
   - 캐시 갱신 주기 설정

3. **인덱스 관리**
   - 데이터베이스 인덱스 생성 및 관리
   - 쿼리 성능 모니터링

4. **대량 작업 설정**
   - 일괄 처리 작업 수 제한
   - 비동기 처리 설정

#### 관리 지침
- 사용 패턴에 따라 자주 사용되는 쿼리에 대한 인덱스 최적화
- 대시보드 및 보고서와 같은 무거운 페이지의 캐싱 전략 수립
- 대량 데이터 처리 시 비동기 방식 고려
- 주기적인 성능 모니터링 및 최적화

## 개발자 가이드

### API 문서
#### 작업 API
| 엔드포인트 | 메소드 | 설명 | 요청 형식 | 응답 형식 |
|------------|--------|------|-----------|-----------|
| `/api/tasks` | GET | 작업 목록 조회 | `status`, `priority`, `assignee`, `startDate`, `endDate`, `keyword`, `page`, `pageSize` | 작업 배열 및 페이지네이션 정보 |
| `/api/tasks/:id` | GET | 작업 상세 조회 | - | 작업 객체 |
| `/api/tasks` | POST | 작업 생성 | 작업 정보 | 생성된 작업 객체 |
| `/api/tasks/:id` | PUT | 작업 수정 | 수정할 작업 정보 | 수정된 작업 객체 |
| `/api/tasks/:id` | DELETE | 작업 삭제 | - | 삭제 성공 확인 |
| `/api/tasks/batch` | POST | 일괄 작업 생성 | 작업 배열 | 생성된 작업 배열 |
| `/api/tasks/:id/status` | PATCH | 작업 상태 변경 | `{ status: string }` | 수정된 작업 객체 |
| `/api/tasks/:id/progress` | PATCH | 작업 진행률 변경 | `{ progress: number }` | 수정된 작업 객체 |

#### 첨부 파일 API
| 엔드포인트 | 메소드 | 설명 | 요청 형식 | 응답 형식 |
|------------|--------|------|-----------|-----------|
| `/api/tasks/:id/attachments` | POST | 첨부 파일 업로드 | 멀티파트 폼 데이터 | 업로드된 첨부 파일 객체 |
| `/api/tasks/:id/attachments/:attachmentId` | DELETE | 첨부 파일 삭제 | - | 삭제 성공 확인 |

#### 댓글 API
| 엔드포인트 | 메소드 | 설명 | 요청 형식 | 응답 형식 |
|------------|--------|------|-----------|-----------|
| `/api/tasks/:id/comments` | GET | 작업 댓글 조회 | - | 댓글 배열 |
| `/api/tasks/:id/comments` | POST | 댓글 작성 | `{ content: string }` | 생성된 댓글 객체 |
| `/api/tasks/:id/comments/:commentId` | PUT | 댓글 수정 | `{ content: string }` | 수정된 댓글 객체 |
| `/api/tasks/:id/comments/:commentId` | DELETE | 댓글 삭제 | - | 삭제 성공 확인 |

### 컴포넌트 라이브러리
작업 관리 기능에서 사용되는 주요 컴포넌트들을 재사용할 수 있도록 문서화한 가이드입니다.

#### TaskCard
작업을 카드 형태로 표시하는 컴포넌트

```jsx
import { TaskCard } from 'components/feature/TaskManagement';

// 사용 예시
<TaskCard 
  task={taskObject}
  onClick={handleTaskClick}
  onStatusChange={handleStatusChange}
  showAssignee={true}
  showProgress={true}
/>
```

**Props**
- `task` (object, required): 작업 객체
- `onClick` (function): 카드 클릭 핸들러
- `onStatusChange` (function): 상태 변경 핸들러
- `showAssignee` (boolean): 담당자 표시 여부
- `showProgress` (boolean): 진행률 표시 여부

#### TaskList
작업을 테이블 형태로 표시하는 컴포넌트

```jsx
import { TaskList } from 'components/feature/TaskManagement';

// 사용 예시
<TaskList 
  tasks={tasksArray}
  onView={handleViewTask}
  onEdit={handleEditTask}
  onDelete={handleDeleteTask}
  columns={['title', 'status', 'assignee', 'dates', 'progress']}
  sortable={true}
  selectable={true}
/>
```

**Props**
- `tasks` (array, required): 작업 배열
- `onView` (function): 작업 조회 핸들러
- `onEdit` (function): 작업 편집 핸들러
- `onDelete` (function): 작업 삭제 핸들러
- `columns` (array): 표시할 컬럼 배열
- `sortable` (boolean): 정렬 가능 여부
- `selectable` (boolean): 선택 가능 여부

#### GanttChart
작업을 간트 차트 형태로 표시하는 컴포넌트

```jsx
import { GanttChart } from 'components/feature/TaskManagement';

// 사용 예시
<GanttChart 
  tasks={tasksArray}
  startDate={new Date('2025-01-01')}
  endDate={new Date('2025-12-31')}
  onTaskClick={handleTaskClick}
  onTaskUpdate={handleTaskUpdate}
  showDependencies={true}
  showResources={true}
/>
```

**Props**
- `tasks` (array, required): 작업 배열
- `startDate` (Date): 차트 시작 날짜
- `endDate` (Date): 차트 종료 날짜
- `onTaskClick` (function): 작업 클릭 핸들러
- `onTaskUpdate` (function): 작업 업데이트 핸들러
- `showDependencies` (boolean): 작업 간 종속성 표시 여부
- `showResources` (boolean): 리소스 정보 표시 여부

#### TaskForm
작업 생성/편집을 위한 폼 컴포넌트

```jsx
import { TaskForm } from 'components/feature/TaskManagement';

// 사용 예시
<TaskForm 
  task={taskObject} // 편집 시에만 제공
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  users={usersArray}
  statuses={statusesArray}
  priorities={prioritiesArray}
/>
```

**Props**
- `task` (object): 편집할 작업 객체 (생성 시 생략)
- `onSubmit` (function, required): 폼 제출 핸들러
- `onCancel` (function): 취소 핸들러
- `users` (array): 사용자 목록
- `statuses` (array): 상태 목록
- `priorities` (array): 우선순위 목록

### 확장 가이드
작업 관리 기능을 확장하거나 커스터마이징하기 위한 가이드입니다.

#### 커스텀 필드 추가
작업에 커스텀 필드를 추가하는 방법

1. **데이터베이스 스키마 확장**
```sql
-- 커스텀 필드 테이블 생성
CREATE TABLE TaskCustomFields (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    TaskId UNIQUEIDENTIFIER NOT NULL,
    FieldName NVARCHAR(100) NOT NULL,
    FieldType NVARCHAR(50) NOT NULL,
    FieldValue NVARCHAR(MAX),
    
    CONSTRAINT FK_TaskCustomFields_Tasks FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_TaskCustomFields_TaskId_FieldName UNIQUE (TaskId, FieldName)
);
```

2. **백엔드 모델 확장**
```javascript
// Task 모델 확장
class Task {
  // 기존 메소드들...
  
  // 커스텀 필드 조회
  static async getCustomFields(taskId) {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('taskId', sql.UniqueIdentifier, taskId)
        .query(`
          SELECT FieldName, FieldType, FieldValue
          FROM TaskCustomFields
          WHERE TaskId = @taskId
        `);
      
      return result.recordset;
    } catch (error) {
      logger.error('Error getting custom fields', { taskId, error });
      throw error;
    }
  }
  
  // 커스텀 필드 저장
  static async saveCustomField(taskId, fieldName, fieldType, fieldValue) {
    try {
      const pool = await sql.connect(dbConfig);
      await pool.request()
        .input('taskId', sql.UniqueIdentifier, taskId)
        .input('fieldName', sql.NVarChar(100), fieldName)
        .input('fieldType', sql.NVarChar(50), fieldType)
        .input('fieldValue', sql.NVarChar(sql.MAX), fieldValue)
        .query(`
          MERGE TaskCustomFields AS target
          USING (SELECT @taskId, @fieldName) AS source(TaskId, FieldName)
          ON target.TaskId = source.TaskId AND target.FieldName = source.FieldName
          WHEN MATCHED THEN
              UPDATE SET FieldType = @fieldType, FieldValue = @fieldValue
          WHEN NOT MATCHED THEN
              INSERT (TaskId, FieldName, FieldType, FieldValue)
              VALUES (@taskId, @fieldName, @fieldType, @fieldValue);
        `);
      
      return { taskId, fieldName, fieldType, fieldValue };
    } catch (error) {
      logger.error('Error saving custom field', { taskId, fieldName, error });
      throw error;
    }
  }
}
```

3. **API 엔드포인트 추가**
```javascript
// 커스텀 필드 API
router.get('/tasks/:id/custom-fields', authMiddleware, taskController.getTaskCustomFields);
router.post('/tasks/:id/custom-fields', authMiddleware, taskController.saveTaskCustomField);
router.delete('/tasks/:id/custom-fields/:fieldName', authMiddleware, taskController.deleteTaskCustomField);
```

4. **프론트엔드 컴포넌트 확장**
```jsx
// 커스텀 필드 컴포넌트
const CustomFieldsSection = ({ taskId, customFields, onFieldChange }) => {
  return (
    <div className="custom-fields-section">
      <h3>커스텀 필드</h3>
      {customFields.map(field => (
        <div key={field.fieldName} className="custom-field">
          <label>{field.fieldName}</label>
          {renderFieldInput(field, value => onFieldChange(field.fieldName, value))}
        </div>
      ))}
    </div>
  );
};

// TaskDetail 컴포넌트에 통합
const TaskDetail = ({ task }) => {
  const [customFields, setCustomFields] = useState([]);
  
  useEffect(() => {
    const fetchCustomFields = async () => {
      const fields = await CustomFieldAPI.getCustomFields(task.id);
      setCustomFields(fields);
    };
    
    fetchCustomFields();
  }, [task.id]);
  
  const handleCustomFieldChange = async (fieldName, value) => {
    const updatedField = await CustomFieldAPI.saveCustomField(task.id, fieldName, getFieldType(value), value);
    setCustomFields(customFields.map(field => 
      field.fieldName === fieldName ? updatedField : field
    ));
  };
  
  return (
    <div className="task-detail">
      {/* 기존 내용 */}
      <CustomFieldsSection 
        taskId={task.id}
        customFields={customFields}
        onFieldChange={handleCustomFieldChange}
      />
    </div>
  );
};
```

#### 작업 템플릿 구현
자주 사용되는 작업 유형에 대한 템플릿 기능 구현 방법

1. **템플릿 데이터 모델**
```javascript
// 템플릿 모델
class TaskTemplate {
  static async getAll() {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .query(`
          SELECT Id, Name, Description, DefaultStatus, DefaultPriority, 
                 EstimatedHours, Template
          FROM TaskTemplates
          WHERE IsActive = 1
          ORDER BY Name
        `);
      
      return result.recordset;
    } catch (error) {
      logger.error('Error getting task templates', { error });
      throw error;
    }
  }
  
  static async getById(id) {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('id', sql.UniqueIdentifier, id)
        .query(`
          SELECT Id, Name, Description, DefaultStatus, DefaultPriority, 
                 EstimatedHours, Template
          FROM TaskTemplates
          WHERE Id = @id
        `);
      
      if (result.recordset.length === 0) {
        return null;
      }
      
      return result.recordset[0];
    } catch (error) {
      logger.error('Error getting task template', { id, error });
      throw error;
    }
  }
  
  static async create(templateData) {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('name', sql.NVarChar(255), templateData.name)
        .input('description', sql.NVarChar(sql.MAX), templateData.description)
        .input('defaultStatus', sql.NVarChar(50), templateData.defaultStatus)
        .input('defaultPriority', sql.NVarChar(50), templateData.defaultPriority)
        .input('estimatedHours', sql.Decimal(10, 2), templateData.estimatedHours)
        .input('template', sql.NVarChar(sql.MAX), JSON.stringify(templateData.template))
        .query(`
          INSERT INTO TaskTemplates (
            Name, Description, DefaultStatus, DefaultPriority, 
            EstimatedHours, Template, IsActive
          )
          VALUES (
            @name, @description, @defaultStatus, @defaultPriority, 
            @estimatedHours, @template, 1
          );
          
          SELECT SCOPE_IDENTITY() AS Id;
        `);
      
      const id = result.recordset[0].Id;
      return { id, ...templateData };
    } catch (error) {
      logger.error('Error creating task template', { error });
      throw error;
    }
  }
}
```

2. **템플릿 기반 작업 생성 API**
```javascript
// 템플릿 컨트롤러
exports.createTaskFromTemplate = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const { startDate, endDate, assigneeId, title, ...customData } = req.body;
    
    // 템플릿 조회
    const template = await TaskTemplate.getById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '템플릿을 찾을 수 없습니다.'
      });
    }
    
    // 템플릿 데이터 적용
    const templateObj = JSON.parse(template.Template);
    const taskData = {
      title: title || templateObj.title,
      description: templateObj.description,
      status: template.DefaultStatus,
      priority: template.DefaultPriority,
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + 86400000 * 7), // 기본 1주일
      estimatedHours: template.EstimatedHours,
      assigneeId: assigneeId,
      createdBy: req.user.id,
      ...customData
    };
    
    // 작업 생성
    const task = await Task.create(taskData);
    
    // 템플릿에 커스텀 필드가 있으면 추가
    if (templateObj.customFields) {
      for (const field of templateObj.customFields) {
        await Task.saveCustomField(task.id, field.name, field.type, field.defaultValue);
      }
    }
    
    // 응답
    res.status(201).json({
      success: true,
      data: task
    });
    
  } catch (error) {
    logger.error('Error creating task from template', { error });
    next(error);
  }
};
```

3. **템플릿 선택 UI**
```jsx
// 템플릿 선택 컴포넌트
const TemplateSelector = ({ onSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await TemplateAPI.getAll();
        setTemplates(data);
      } catch (error) {
        console.error('템플릿 목록을 불러오는 중 오류가 발생했습니다.', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);
  
  if (loading) {
    return <Spinner />;
  }
  
  return (
    <div className="template-selector">
      <h3>템플릿 선택</h3>
      <div className="template-grid">
        {templates.map(template => (
          <Card 
            key={template.id}
            title={template.name}
            description={template.description}
            onClick={() => onSelect(template)}
          />
        ))}
        <Card 
          title="빈 템플릿"
          description="기본 템플릿 없이 시작"
          onClick={() => onSelect(null)}
        />
      </div>
    </div>
  );
};

// 작업 생성 화면에 통합
const TaskCreate = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(true);
  
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
  };
  
  return (
    <div className="task-create">
      <h2>새 작업 생성</h2>
      {showTemplateSelector ? (
        <TemplateSelector onSelect={handleTemplateSelect} />
      ) : (
        <TaskForm 
          templateId={selectedTemplate?.id}
          initialValues={selectedTemplate ? {
            title: '',
            description: selectedTemplate.template.description,
            status: selectedTemplate.defaultStatus,
            priority: selectedTemplate.defaultPriority,
            estimatedHours: selectedTemplate.estimatedHours
          } : {}}
          onBack={() => setShowTemplateSelector(true)}
        />
      )}
    </div>
  );
};
```
