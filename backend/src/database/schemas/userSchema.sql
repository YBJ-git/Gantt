-- 사용자 관리 관련 테이블 구조

-- 역할 타입 생성
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'worker', 'user');

-- 상태 타입 생성
CREATE TYPE user_status AS ENUM ('active', 'inactive');

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  role user_role NOT NULL DEFAULT 'user',
  status user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- updated_at 자동 업데이트를 위한 트리거
CREATE OR REPLACE FUNCTION update_user_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER users_update_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_user_timestamp();

-- 관리자 계정 생성 (비밀번호: admin123)
INSERT INTO users (username, email, password, first_name, last_name, role, status)
VALUES (
  'admin',
  'admin@example.com',
  '$2b$10$oEJ6Cwpro6.6ij465/3RIultToY5AVuLCKlolbjrcgLCQZ78f2qNy',
  '관리자',
  '계정',
  'admin',
  'active'
);

-- 테스터 계정 생성 (비밀번호: Test123)
INSERT INTO users (username, email, password, first_name, last_name, role, status)
VALUES (
  'tester',
  'tester@example.com',
  '$2b$10$n7CzYtGgXFttL5CvTgJ0h.ZZ1x78HvzBB2hgz/XBGZv.z8MnIpyJO',
  '테스터',
  '계정',
  'user',
  'active'
);

-- 매니저 계정 생성 (비밀번호: Manager123)
INSERT INTO users (username, email, password, first_name, last_name, role, status)
VALUES (
  'manager',
  'manager@example.com',
  '$2b$10$K4HH21iW/FIcWJcLGt2wkuULmhgU2yhJAhXZPXun1F.W6jrMn6DQe',
  '매니저',
  '계정',
  'manager',
  'active'
);

-- 작업자 계정 생성 (비밀번호: Worker123)
INSERT INTO users (username, email, password, first_name, last_name, role, status)
VALUES (
  'worker',
  'worker@example.com',
  '$2b$10$RXQJw97tKh2KQTlvGS11pOWxIcJ3LttLq3XlZDv17JZhmOTGZMmbi',
  '작업자',
  '계정',
  'worker',
  'active'
);
