-- 기본 데이터 및 더미 데이터 삽입
-- PostgreSQL 버전

-- 역할 데이터
INSERT INTO roles (name, display_name, description, permissions) VALUES
('admin', '관리자', '시스템 전체 관리 권한', '["read", "write", "delete", "admin"]'),
('manager', '매니저', '프로젝트 관리 권한', '["read", "write", "manage"]'),
('user', '사용자', '기본 사용자 권한', '["read", "write"]'),
('worker', '작업자', '작업 수행 권한', '["read"]');

-- 사용자 데이터 (비밀번호는 해시되어야 하지만 여기서는 간단히)
INSERT INTO users (username, email, password_hash, first_name, last_name, department, position, status) VALUES
('admin', 'admin@example.com', 'admin123', '관리자', '계정', 'IT', '시스템 관리자', 'active'),
('tester', 'tester@example.com', 'Test123', '테스터', '계정', 'QA', 'QA 엔지니어', 'active'),
('manager', 'manager@example.com', 'Manager123', '매니저', '계정', '개발', '프로젝트 매니저', 'active'),
('worker', 'worker@example.com', 'Worker123', '작업자', '계정', '개발', '개발자', 'active'),
('kim_chulsu', 'kim@example.com', 'Kim123', '김철수', '', '개발팀', '시니어 개발자', 'active'),
('lee_younghee', 'lee@example.com', 'Lee123', '이영희', '', '디자인팀', 'UI/UX 디자이너', 'active'),
('park_jimin', 'park@example.com', 'Park123', '박지민', '', '개발팀', '풀스택 개발자', 'active'),
('choi_minsu', 'choi@example.com', 'Choi123', '최민수', '', '마케팅팀', '마케팅 담당자', 'active'),
('jung_hyerin', 'jung@example.com', 'Jung123', '정혜린', '', 'QA팀', 'QA 엔지니어', 'active'),
('han_dongseok', 'han@example.com', 'Han123', '한동석', '', '개발팀', '주니어 개발자', 'active');

-- 사용자-역할 매핑
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- admin -> admin role
(2, 3), -- tester -> user role  
(3, 2), -- manager -> manager role
(4, 4), -- worker -> worker role
(5, 4), -- kim_chulsu -> worker role
(6, 4), -- lee_younghee -> worker role
(7, 4), -- park_jimin -> worker role
(8, 4), -- choi_minsu -> worker role
(9, 4), -- jung_hyerin -> worker role
(10, 4); -- han_dongseok -> worker role

-- 리소스 데이터
INSERT INTO resources (user_id, name, email, department, role, capacity_hours, hourly_rate, skills, status) VALUES
(5, '김철수', 'kim@example.com', '개발팀', '시니어 개발자', 40, 50000, '["React", "Node.js", "Python"]', 'active'),
(6, '이영희', 'lee@example.com', '디자인팀', 'UI/UX 디자이너', 40, 45000, '["Figma", "Adobe XD", "Photoshop"]', 'active'),
(7, '박지민', 'park@example.com', '개발팀', '풀스택 개발자', 40, 48000, '["Vue.js", "Spring Boot", "MySQL"]', 'active'),
(8, '최민수', 'choi@example.com', '마케팅팀', '마케팅 담당자', 40, 35000, '["Marketing", "Analytics", "Content"]', 'active'),
(9, '정혜린', 'jung@example.com', 'QA팀', 'QA 엔지니어', 40, 42000, '["Testing", "Automation", "Selenium"]', 'active'),
(10, '한동석', 'han@example.com', '개발팀', '주니어 개발자', 40, 38000, '["JavaScript", "HTML", "CSS"]', 'active');

-- 프로젝트 데이터
INSERT INTO projects (name, description, status, priority, start_date, end_date, budget, progress, manager_id, created_by) VALUES
('웹 애플리케이션 개발', '새로운 웹 기반 프로젝트 관리 시스템 개발', 'in_progress', 'high', '2025-05-01', '2025-08-31', 500000000, 65, 3, 1),
('모바일 앱 리뉴얼', '기존 모바일 앱의 UI/UX 개선 및 기능 추가', 'in_progress', 'medium', '2025-04-15', '2025-07-15', 300000000, 40, 3, 1),
('마케팅 캠페인', '신제품 출시를 위한 통합 마케팅 캠페인', 'planning', 'medium', '2025-06-01', '2025-09-30', 150000000, 10, 3, 1),
('시스템 보안 강화', '전사 보안 시스템 업그레이드 및 취약점 개선', 'in_progress', 'high', '2025-03-01', '2025-06-30', 200000000, 75, 1, 1);

-- 작업 데이터
INSERT INTO tasks (project_id, name, description, status, priority, start_date, end_date, estimated_hours, actual_hours, progress, assigned_to, created_by) VALUES
-- 웹 애플리케이션 개발 프로젝트 작업들
(1, 'UI 디자인 완료', '메인 페이지 UI 디자인 작업', 'in_progress', 'high', '2025-05-20', '2025-06-01', 40, 30, 75, 2, 3),
(1, '백엔드 API 개발', '사용자 관리 API 개발', 'in_progress', 'medium', '2025-05-22', '2025-06-03', 60, 35, 60, 1, 3),
(1, '테스트 자동화', '단위 테스트 및 통합 테스트 작성', 'pending', 'high', '2025-05-28', '2025-06-05', 32, 0, 0, 5, 3),
(1, '데이터베이스 설계', 'PostgreSQL 스키마 설계 및 구현', 'completed', 'high', '2025-05-01', '2025-05-15', 24, 26, 100, 3, 3),
(1, '프론트엔드 개발', 'React 기반 사용자 인터페이스 개발', 'in_progress', 'high', '2025-05-15', '2025-06-15', 80, 45, 55, 1, 3),

-- 모바일 앱 리뉴얼 프로젝트 작업들
(2, '사용자 리서치', '기존 앱 사용성 분석 및 개선점 도출', 'completed', 'medium', '2025-04-15', '2025-04-30', 20, 22, 100, 2, 3),
(2, '와이어프레임 제작', '새로운 앱 구조 및 화면 설계', 'completed', 'medium', '2025-05-01', '2025-05-10', 16, 18, 100, 2, 3),
(2, '네이티브 개발', 'iOS/Android 앱 개발', 'in_progress', 'high', '2025-05-11', '2025-06-20', 120, 48, 40, 3, 3),
(2, '성능 최적화', '앱 로딩 속도 및 반응성 개선', 'pending', 'medium', '2025-06-21', '2025-07-05', 24, 0, 0, 1, 3),

-- 마케팅 캠페인 프로젝트 작업들
(3, '마케팅 전략 수립', '타겟 고객 분석 및 마케팅 전략 기획', 'pending', 'high', '2025-06-01', '2025-06-15', 30, 0, 0, 4, 3),
(3, '콘텐츠 제작', '광고 및 마케팅 콘텐츠 제작', 'pending', 'medium', '2025-06-16', '2025-07-31', 60, 0, 0, 4, 3),
(3, '디지털 광고 집행', '온라인 플랫폼 광고 캠페인 실행', 'pending', 'medium', '2025-08-01', '2025-09-15', 40, 0, 0, 4, 3),

-- 시스템 보안 강화 프로젝트 작업들
(4, '보안 취약점 분석', '현재 시스템의 보안 취약점 점검', 'completed', 'high', '2025-03-01', '2025-03-15', 32, 35, 100, 1, 1),
(4, '방화벽 설정', '새로운 방화벽 규칙 설정 및 적용', 'completed', 'high', '2025-03-16', '2025-04-05', 28, 30, 100, 1, 1),
(4, '사용자 인증 강화', '2FA 및 SSO 시스템 구축', 'in_progress', 'high', '2025-04-06', '2025-05-31', 45, 38, 85, 1, 1),
(4, '보안 교육', '전 직원 대상 보안 교육 프로그램 실시', 'in_progress', 'medium', '2025-05-01', '2025-06-30', 20, 12, 60, 1, 1);

-- 리소스 할당 데이터
INSERT INTO resource_assignments (task_id, resource_id, allocated_hours, start_date, end_date, utilization_percentage) VALUES
(1, 2, 40, '2025-05-20', '2025-06-01', 100), -- UI 디자인 -> 이영희
(2, 1, 60, '2025-05-22', '2025-06-03', 100), -- 백엔드 API -> 김철수  
(3, 5, 32, '2025-05-28', '2025-06-05', 80),  -- 테스트 자동화 -> 정혜린
(4, 3, 24, '2025-05-01', '2025-05-15', 75),  -- 데이터베이스 설계 -> 박지민
(5, 1, 80, '2025-05-15', '2025-06-15', 100), -- 프론트엔드 개발 -> 김철수
(6, 2, 20, '2025-04-15', '2025-04-30', 50),  -- 사용자 리서치 -> 이영희
(7, 2, 16, '2025-05-01', '2025-05-10', 50),  -- 와이어프레임 -> 이영희
(8, 3, 120, '2025-05-11', '2025-06-20', 100), -- 네이티브 개발 -> 박지민
(9, 1, 24, '2025-06-21', '2025-07-05', 75),  -- 성능 최적화 -> 김철수
(10, 4, 30, '2025-06-01', '2025-06-15', 75), -- 마케팅 전략 -> 최민수
(11, 4, 60, '2025-06-16', '2025-07-31', 75), -- 콘텐츠 제작 -> 최민수
(12, 4, 40, '2025-08-01', '2025-09-15', 100), -- 디지털 광고 -> 최민수
(13, 1, 32, '2025-03-01', '2025-03-15', 100), -- 보안 취약점 분석 -> 김철수
(14, 1, 28, '2025-03-16', '2025-04-05', 100), -- 방화벽 설정 -> 김철수
(15, 1, 45, '2025-04-06', '2025-05-31', 85),  -- 사용자 인증 강화 -> 김철수
(16, 1, 20, '2025-05-01', '2025-06-30', 25);  -- 보안 교육 -> 김철수

-- 작업 부하 히스토리 데이터 (최근 30일)
INSERT INTO workload_history (resource_id, date, allocated_hours, actual_hours, utilization_percentage, task_count) VALUES
-- 김철수 (resource_id: 1) - 높은 부하
(1, '2025-05-20', 8, 9, 112.5, 3),
(1, '2025-05-21', 8, 8, 100.0, 3),
(1, '2025-05-22', 8, 7, 87.5, 3),
(1, '2025-05-23', 8, 8, 100.0, 3),
(1, '2025-05-24', 8, 9, 112.5, 3),
(1, '2025-05-25', 0, 0, 0.0, 0), -- 주말
(1, '2025-05-26', 8, 8, 100.0, 3),

-- 이영희 (resource_id: 2) - 중간 부하
(2, '2025-05-20', 6, 7, 87.5, 2),
(2, '2025-05-21', 6, 6, 75.0, 2),
(2, '2025-05-22', 6, 5, 62.5, 2),
(2, '2025-05-23', 6, 6, 75.0, 2),
(2, '2025-05-24', 6, 7, 87.5, 2),
(2, '2025-05-25', 0, 0, 0.0, 0), -- 주말
(2, '2025-05-26', 6, 6, 75.0, 2),

-- 박지민 (resource_id: 3) - 중간 부하
(3, '2025-05-20', 7, 6, 75.0, 2),
(3, '2025-05-21', 7, 7, 87.5, 2),
(3, '2025-05-22', 7, 8, 100.0, 2),
(3, '2025-05-23', 7, 7, 87.5, 2),
(3, '2025-05-24', 7, 6, 75.0, 2),
(3, '2025-05-25', 0, 0, 0.0, 0), -- 주말
(3, '2025-05-26', 7, 7, 87.5, 2),

-- 최민수 (resource_id: 4) - 낮은 부하
(4, '2025-05-20', 4, 3, 37.5, 1),
(4, '2025-05-21', 4, 4, 50.0, 1),
(4, '2025-05-22', 4, 3, 37.5, 1),
(4, '2025-05-23', 4, 4, 50.0, 1),
(4, '2025-05-24', 4, 5, 62.5, 1),
(4, '2025-05-25', 0, 0, 0.0, 0), -- 주말
(4, '2025-05-26', 4, 4, 50.0, 1),

-- 정혜린 (resource_id: 5) - 중간 부하
(5, '2025-05-20', 5, 6, 75.0, 1),
(5, '2025-05-21', 5, 5, 62.5, 1),
(5, '2025-05-22', 5, 4, 50.0, 1),
(5, '2025-05-23', 5, 6, 75.0, 1),
(5, '2025-05-24', 5, 5, 62.5, 1),
(5, '2025-05-25', 0, 0, 0.0, 0), -- 주말
(5, '2025-05-26', 5, 5, 62.5, 1),

-- 한동석 (resource_id: 6) - 낮은 부하
(6, '2025-05-20', 3, 4, 50.0, 1),
(6, '2025-05-21', 3, 3, 37.5, 1),
(6, '2025-05-22', 3, 2, 25.0, 1),
(6, '2025-05-23', 3, 4, 50.0, 1),
(6, '2025-05-24', 3, 3, 37.5, 1),
(6, '2025-05-25', 0, 0, 0.0, 0), -- 주말
(6, '2025-05-26', 3, 3, 37.5, 1);

-- 알림 데이터
INSERT INTO notifications (user_id, type, title, message, is_read, related_entity_type, related_entity_id, priority) VALUES
(5, 'deadline', '마감일 임박', 'UI 디자인 완료 작업이 내일 마감입니다.', false, 'task', 1, 'high'),
(1, 'overload', '리소스 과부하 경고', '김철수님의 작업 부하가 110%에 도달했습니다.', false, 'resource', 1, 'high'),
(3, 'optimization', '최적화 완료', '프로젝트 A 일정이 성공적으로 최적화되었습니다.', true, 'project', 1, 'normal'),
(1, 'system', '시스템 업데이트', '새로운 기능이 추가되었습니다.', true, null, null, 'low'),
(2, 'task_assigned', '새 작업 할당', '테스트 자동화 작업이 할당되었습니다.', false, 'task', 3, 'normal'),
(4, 'project_update', '프로젝트 상태 변경', '마케팅 캠페인 프로젝트가 기획 단계로 변경되었습니다.', false, 'project', 3, 'normal');

-- 알림 설정 데이터
INSERT INTO notification_settings (user_id, email_notifications, push_notifications, sms_notifications, notification_types, timezone) VALUES
(1, true, true, false, '{"deadlines": true, "overload": true, "optimization": true, "system": false}', 'Asia/Seoul'),
(2, true, true, false, '{"deadlines": true, "overload": false, "optimization": true, "system": true}', 'Asia/Seoul'),
(3, true, false, false, '{"deadlines": true, "overload": true, "optimization": true, "system": false}', 'Asia/Seoul'),
(4, false, true, false, '{"deadlines": false, "overload": false, "optimization": false, "system": true}', 'Asia/Seoul'),
(5, true, true, true, '{"deadlines": true, "overload": true, "optimization": true, "system": true}', 'Asia/Seoul');

COMMIT;
