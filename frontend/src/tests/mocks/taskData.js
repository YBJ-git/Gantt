// 작업 관리용 목 데이터
export const mockTasks = [
  {
    id: 1,
    name: '웹사이트 리디자인',
    description: '회사 웹사이트 메인 페이지 디자인 개선',
    startDate: '2025-05-10',
    endDate: '2025-05-20',
    status: '진행중',
    priority: '높음',
    assignedTo: 1,
    completed: 30,
    dependencies: []
  },
  {
    id: 2,
    name: '데이터베이스 최적화',
    description: '쿼리 성능 개선 및 인덱스 추가',
    startDate: '2025-05-15',
    endDate: '2025-05-25',
    status: '대기중',
    priority: '중간',
    assignedTo: 2,
    completed: 0,
    dependencies: []
  },
  {
    id: 3,
    name: '모바일 앱 업데이트',
    description: '새로운 기능 추가 및 버그 수정',
    startDate: '2025-05-18',
    endDate: '2025-06-01',
    status: '대기중',
    priority: '높음',
    assignedTo: 3,
    completed: 0,
    dependencies: [1]
  }
];

// 리소스 관리용 목 데이터
export const mockResources = [
  {
    id: 1,
    name: '개발팀',
    capacity: 100,
    assignedTasks: [1]
  },
  {
    id: 2,
    name: 'DBA팀',
    capacity: 80,
    assignedTasks: [2]
  },
  {
    id: 3,
    name: '디자인팀',
    capacity: 90,
    assignedTasks: [3]
  }
];
