# 작업 등록/관리 기능 - 보안/권한/알림/운영

## 보안 전략

### 데이터 보안
- **저장 데이터 보안**:
  - 민감한 정보(첨부 파일 등)는 암호화하여 저장
  - 데이터베이스 백업 자동화 및 암호화
  - 불필요한 데이터는 정기적으로 삭제/보관

- **전송 데이터 보안**:
  - HTTPS를 통한 모든 API 통신 암호화
  - API 요청/응답에서 민감한 정보 필터링
  - Content Security Policy(CSP) 헤더 구현

- **파일 업로드 보안**:
  - 파일 유형 및 크기 제한
  - 악성 코드 검사
  - 안전한 파일 이름 생성(난수화)
  - 업로드된 파일과 애플리케이션 코드 분리 저장

### 권한 관리
#### 역할 기반 접근 제어(RBAC)
- **관리자(Admin)**:
  - 모든 작업 조회/생성/수정/삭제 권한
  - 모든 사용자 작업 관리 권한
  - 시스템 설정 및 마스터 데이터 관리 권한

- **프로젝트 관리자(Project Manager)**:
  - 프로젝트 내 모든 작업 조회/생성/수정/삭제 권한
  - 프로젝트 멤버 작업 할당 권한
  - 프로젝트 보고서 생성 권한

- **팀 리더(Team Leader)**:
  - 팀 작업 조회/생성/수정 권한
  - 팀원 작업 할당 권한
  - 팀 보고서 조회 권한

- **팀원(Team Member)**:
  - 자신에게 할당된 작업 조회/수정 권한
  - 작업 진행 상황 업데이트 권한
  - 댓글 작성 권한

#### 작업 수준 권한
- **작업 생성자**: 작업을 생성한 사용자는 해당 작업에 대한 모든 권한 보유
- **작업 담당자**: 작업이 할당된 사용자는 작업 상태 및 진행률 업데이트 권한 보유
- **관련자**: 작업에 관련자로 지정된 사용자는 작업 조회 및 댓글 작성 권한 보유

#### 권한 검사 구현
```javascript
// 권한 검사 미들웨어 예시
const checkTaskPermission = (action) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;
      
      // 관리자는 모든 권한 보유
      if (user.role === 'admin') {
        return next();
      }
      
      const task = await Task.findById(id);
      
      if (!task) {
        return res.status(404).json({
          success: false,
          message: '작업을 찾을 수 없습니다.'
        });
      }
      
      // 작업 조회 권한 검사
      if (action === 'view') {
        // 작업 생성자, 담당자, 관련자, 프로젝트 매니저, 팀 리더는 조회 가능
        if (
          task.createdBy === user.id ||
          task.assigneeId === user.id ||
          task.relatedUsers.includes(user.id) ||
          (user.role === 'project_manager' && task.projectId === user.projectId) ||
          (user.role === 'team_leader' && task.teamId === user.teamId)
        ) {
          return next();
        }
      }
      
      // 작업 수정 권한 검사
      if (action === 'update') {
        // 작업 생성자, 담당자, 프로젝트 매니저, 팀 리더는 수정 가능
        if (
          task.createdBy === user.id ||
          task.assigneeId === user.id ||
          (user.role === 'project_manager' && task.projectId === user.projectId) ||
          (user.role === 'team_leader' && task.teamId === user.teamId)
        ) {
          return next();
        }
      }
      
      // 작업 삭제 권한 검사
      if (action === 'delete') {
        // 작업 생성자, 프로젝트 매니저만 삭제 가능
        if (
          task.createdBy === user.id ||
          (user.role === 'project_manager' && task.projectId === user.projectId)
        ) {
          return next();
        }
      }
      
      // 권한이 없는 경우
      return res.status(403).json({
        success: false,
        message: '작업에 대한 권한이 없습니다.'
      });
      
    } catch (error) {
      next(error);
    }
  };
};
```

### 인증 전략
- **JWT 기반 인증**:
  - 로그인 시 Access Token + Refresh Token 발급
  - Access Token은 짧은 만료 시간(15분~1시간)
  - Refresh Token은 긴 만료 시간(7일~30일) 및 안전한 저장
  - Token Blacklisting으로 로그아웃 처리

- **세션 관리**:
  - 동시 로그인 제한 옵션
  - 비활성 세션 자동 종료
  - 세션 활동 로깅

- **Multi-factor Authentication(선택 사항)**:
  - 중요 작업(일괄 삭제 등)에 대한 이중 인증
  - 관리자 계정에 대한 2FA 강제 적용

## 알림 시스템

### 알림 유형
- **작업 할당 알림**: 작업이 새로 할당되었을 때
- **작업 마감일 알림**: 마감일이 임박한 작업(1일/3일/1주일 전)
- **작업 상태 변경 알림**: 작업 상태가 변경되었을 때
- **댓글 알림**: 작업에 새 댓글이 작성되었을 때
- **멘션 알림**: 댓글에서 사용자가 멘션되었을 때
- **작업 일정 변경 알림**: 작업 일정이 변경되었을 때

### 알림 채널
- **인앱 알림**: 애플리케이션 내 알림 센터
- **이메일 알림**: 주요 알림에 대한 이메일 발송
- **푸시 알림**: 모바일 디바이스 푸시 알림(선택 사항)
- **슬랙 등 통합**: 외부 채널 연동 알림(선택 사항)

### 알림 설정
- **알림 구독**: 사용자별 알림 유형 및 채널 설정
- **알림 빈도**: 즉시/요약(일간/주간) 설정
- **방해 금지 시간**: 알림을 받지 않을 시간대 설정

### 알림 구현
```javascript
// 알림 생성 서비스 예시
const notificationService = {
  // 알림 생성
  createNotification: async (type, data, recipients) => {
    try {
      // 알림 데이터 생성
      const notifications = recipients.map(recipientId => ({
        type,
        data,
        recipientId,
        isRead: false,
        createdAt: new Date()
      }));
      
      // 알림 저장
      const savedNotifications = await Notification.createBatch(notifications);
      
      // 실시간 알림 전송
      notificationService.sendRealTimeNotifications(savedNotifications);
      
      // 이메일 알림 전송 (필요 시)
      if (['task_assignment', 'deadline_approaching', 'mention'].includes(type)) {
        await notificationService.sendEmailNotifications(savedNotifications);
      }
      
      return savedNotifications;
    } catch (error) {
      logger.error('Error creating notifications', { error });
      throw error;
    }
  },
  
  // 실시간 알림 전송
  sendRealTimeNotifications: (notifications) => {
    notifications.forEach(notification => {
      const socketId = socketConnections[notification.recipientId];
      if (socketId) {
        io.to(socketId).emit('notification', notification);
      }
    });
  },
  
  // 이메일 알림 전송
  sendEmailNotifications: async (notifications) => {
    try {
      // 알림별 이메일 데이터 생성
      const emailPromises = notifications.map(async notification => {
        const recipient = await User.findById(notification.recipientId);
        
        // 사용자의 이메일 알림 설정 확인
        const emailSettings = await UserSettings.getEmailSettings(notification.recipientId);
        if (!emailSettings[notification.type]) {
          return null;
        }
        
        const emailTemplate = notificationService.getEmailTemplate(notification.type, notification.data);
        
        return {
          to: recipient.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html
        };
      });
      
      // 이메일 데이터 필터링 및 전송
      const emailData = (await Promise.all(emailPromises)).filter(email => email !== null);
      
      if (emailData.length > 0) {
        await emailService.sendBulk(emailData);
      }
    } catch (error) {
      logger.error('Error sending email notifications', { error });
    }
  },
  
  // 이메일 템플릿 가져오기
  getEmailTemplate: (type, data) => {
    switch (type) {
      case 'task_assignment':
        return {
          subject: `[작업 할당] ${data.taskTitle}`,
          html: `
            <h2>새로운 작업이 할당되었습니다.</h2>
            <p><strong>작업명:</strong> ${data.taskTitle}</p>
            <p><strong>시작일:</strong> ${formatDate(data.startDate)}</p>
            <p><strong>종료일:</strong> ${formatDate(data.endDate)}</p>
            <p><strong>할당자:</strong> ${data.assignerName}</p>
            <p><a href="${data.taskUrl}">작업 보기</a></p>
          `
        };
      
      case 'deadline_approaching':
        return {
          subject: `[마감 임박] ${data.taskTitle}`,
          html: `
            <h2>작업 마감일이 임박했습니다.</h2>
            <p><strong>작업명:</strong> ${data.taskTitle}</p>
            <p><strong>마감일:</strong> ${formatDate(data.endDate)}</p>
            <p><strong>남은 일수:</strong> ${data.daysRemaining}일</p>
            <p><a href="${data.taskUrl}">작업 보기</a></p>
          `
        };
      
      // 기타 알림 유형에 대한 템플릿
      
      default:
        return {
          subject: '작업 관리 시스템 알림',
          html: `<p>새로운 알림이 있습니다. <a href="${data.url}">자세히 보기</a></p>`
        };
    }
  }
};
```

## 운영 전략

### 모니터링
- **성능 모니터링**:
  - API 응답 시간 모니터링
  - 데이터베이스 쿼리 성능 모니터링
  - 클라이언트 렌더링 성능 모니터링
  - 리소스 사용량(CPU, 메모리, 디스크) 모니터링

- **오류 모니터링**:
  - API 오류율 모니터링
  - 클라이언트 오류 모니터링
  - 로그 기반 오류 감지
  - 알림 설정(임계값 초과 시)

- **사용자 활동 모니터링**:
  - 페이지 방문 및 기능 사용 분석
  - 사용자 행동 패턴 분석
  - 성능 병목 지점 식별

### 백업 및 복구
- **데이터 백업**:
  - 일일 전체 백업
  - 실시간 트랜잭션 로그 백업
  - 백업 데이터 암호화 및 안전한 저장

- **복구 계획**:
  - RTO(Recovery Time Objective) 및 RPO(Recovery Point Objective) 정의
  - 복구 절차 문서화
  - 정기적인 복구 테스트

### 유지보수
- **정기 유지보수**:
  - 데이터베이스 인덱스 최적화
  - 임시 파일 및 로그 정리
  - 보안 업데이트 적용

- **릴리스 관리**:
  - 변경 사항에 대한 영향 분석
  - 릴리스 일정 및 계획 수립
  - 롤백 계획 수립

### 확장성 관리
- **수평적 확장**:
  - 부하 분산을 위한 다중 서버 구성
  - 세션 공유 및 상태 관리 전략
  - 캐시 전략(Redis 등)

- **수직적 확장**:
  - 리소스 모니터링 기반 서버 스펙 조정
  - 데이터베이스 파티셔닝 전략
  - 쿼리 최적화 및 인덱싱 전략
