// Service Worker for PWA functionality
const CACHE_NAME = 'workload-management-v1';
const API_CACHE_NAME = 'api-cache-v1';

// 캐시할 정적 리소스
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// 캐시할 API 엔드포인트 패턴
const API_PATTERNS = [
  /\/api\/auth\/verify/,
  /\/api\/users\/profile/,
  /\/api\/tasks\?/,
  /\/api\/notifications\?/
];

// 오프라인 페이지
const OFFLINE_PAGE = '/offline.html';

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // 즉시 활성화
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 오래된 캐시 삭제
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // 모든 클라이언트 제어
        return self.clients.claim();
      })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청 처리
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // 정적 리소스 처리
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
});

// API 요청 처리 (Network First 전략)
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // 네트워크에서 먼저 시도
    const networkResponse = await fetch(request);
    
    // 성공한 GET 요청은 캐시에 저장
    if (request.method === 'GET' && networkResponse.ok) {
      const shouldCache = API_PATTERNS.some(pattern => pattern.test(url.pathname));
      
      if (shouldCache) {
        const cache = await caches.open(API_CACHE_NAME);
        cache.put(request, networkResponse.clone());
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache for:', url.pathname);
    
    // 네트워크 실패 시 캐시에서 조회
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 캐시도 없으면 오프라인 응답
    return new Response(
      JSON.stringify({
        error: 'Network unavailable',
        message: '네트워크에 연결할 수 없습니다. 나중에 다시 시도해 주세요.',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// 정적 리소스 처리 (Cache First 전략)
async function handleStaticRequest(request) {
  try {
    // 캐시에서 먼저 조회
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 캐시에 없으면 네트워크에서 가져와서 캐시에 저장
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Failed to fetch:', request.url);
    
    // 메인 페이지 요청이 실패하면 오프라인 페이지 반환
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match(OFFLINE_PAGE);
      if (offlineResponse) {
        return offlineResponse;
      }
      
      // 오프라인 페이지도 없으면 기본 HTML 반환
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>오프라인</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 50px;
                background: #f5f5f5;
              }
              .container {
                max-width: 400px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              h1 { color: #333; margin-bottom: 20px; }
              p { color: #666; line-height: 1.5; }
              button {
                background: #007bff;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 20px;
              }
              button:hover { background: #0056b3; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>📱 오프라인 모드</h1>
              <p>인터넷 연결을 확인하고 다시 시도해 주세요.</p>
              <p>일부 기능은 오프라인에서도 사용할 수 있습니다.</p>
              <button onclick="window.location.reload()">다시 시도</button>
            </div>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    throw error;
  }
}

// 푸시 알림 처리
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      data = { title: '새 알림', body: event.data.text() };
    }
  }
  
  const options = {
    title: data.title || '작업 관리 시스템',
    body: data.body || '새로운 알림이 있습니다.',
    icon: '/logo192.png',
    badge: '/badge-72x72.png',
    image: data.image,
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: '보기',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: '닫기',
        icon: '/icons/close.png'
      }
    ],
    tag: data.tag || 'default',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    vibrate: [200, 100, 200]
  };
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  if (action === 'dismiss') {
    return;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // 이미 열린 창이 있으면 포커스
        for (let client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // 새 창 열기
        const urlToOpen = data?.url || '/';
        return clients.openWindow(urlToOpen);
      })
  );
});

// 백그라운드 동기화 (미래 구현용)
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // 오프라인 상태에서 저장된 데이터를 서버로 동기화
  console.log('Performing background sync...');
  
  try {
    // 로컬 스토리지에서 동기화할 데이터 조회
    const pendingData = await getLocalPendingData();
    
    if (pendingData.length > 0) {
      for (const item of pendingData) {
        await syncDataToServer(item);
      }
      
      await clearLocalPendingData();
      console.log('Background sync completed');
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// 유틸리티 함수들
async function getLocalPendingData() {
  // IndexedDB나 localStorage에서 동기화 대기 중인 데이터 조회
  return [];
}

async function syncDataToServer(data) {
  // 서버로 데이터 전송
  return fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

async function clearLocalPendingData() {
  // 동기화 완료된 데이터 로컬에서 삭제
  return Promise.resolve();
}

// 메시지 처리 (클라이언트와의 통신)
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}
