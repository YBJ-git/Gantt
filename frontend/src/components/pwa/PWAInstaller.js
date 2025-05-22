import React, { useState, useEffect } from 'react';
import { Button, Modal, Card, Space, Typography, Divider, Alert } from 'antd';
import { 
  DownloadOutlined, 
  MobileOutlined, 
  DesktopOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import './PWAInstaller.css';

const { Title, Paragraph, Text } = Typography;

const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);
  const [installationSupported, setInstallationSupported] = useState(false);

  useEffect(() => {
    // PWA 설치 프롬프트 이벤트 리스너
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallationSupported(true);
    };

    // 앱 설치 완료 이벤트
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('PWA가 성공적으로 설치되었습니다.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 이미 설치되어 있는지 확인
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // 서비스 워커 업데이트 확인
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          setSwUpdateAvailable(true);
        }
      });

      // 서비스 워커 등록 및 업데이트 확인
      registerServiceWorker();
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // 업데이트 확인
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setSwUpdateAvailable(true);
          }
        });
      });

      console.log('Service Worker 등록 성공:', registration);
    } catch (error) {
      console.error('Service Worker 등록 실패:', error);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('사용자가 PWA 설치를 승인했습니다.');
      } else {
        console.log('사용자가 PWA 설치를 거부했습니다.');
      }
      
      setDeferredPrompt(null);
      setShowInstallModal(false);
    } catch (error) {
      console.error('PWA 설치 중 오류 발생:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleUpdateApp = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.update();
        });
      });
      
      // 페이지 새로고침으로 새 버전 적용
      window.location.reload();
    }
  };

  const openInstallModal = () => {
    setShowInstallModal(true);
  };

  const closeInstallModal = () => {
    setShowInstallModal(false);
  };

  // 브라우저별 설치 안내
  const getBrowserInstallInstructions = () => {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) {
      return {
        browser: 'Chrome',
        icon: <DesktopOutlined />,
        instructions: [
          '주소창 오른쪽의 "설치" 버튼을 클릭하세요.',
          '또는 메뉴(⋮) > "앱 설치..."를 선택하세요.',
          '설치 확인 대화상자에서 "설치"를 클릭하세요.'
        ]
      };
    } else if (userAgent.includes('Safari')) {
      return {
        browser: 'Safari',
        icon: <MobileOutlined />,
        instructions: [
          '화면 하단의 공유 버튼(📤)을 터치하세요.',
          '"홈 화면에 추가"를 선택하세요.',
          '앱 이름을 확인하고 "추가"를 터치하세요.'
        ]
      };
    } else if (userAgent.includes('Firefox')) {
      return {
        browser: 'Firefox',
        icon: <DesktopOutlined />,
        instructions: [
          '주소창의 "설치" 아이콘을 클릭하세요.',
          '또는 메뉴(☰) > "이 사이트를 앱으로 설치"를 선택하세요.',
          '설치 확인 대화상자에서 "설치"를 클릭하세요.'
        ]
      };
    } else {
      return {
        browser: '브라우저',
        icon: <DesktopOutlined />,
        instructions: [
          '브라우저 메뉴에서 "앱 설치" 또는 "홈 화면에 추가" 옵션을 찾아보세요.',
          '일부 브라우저에서는 주소창에 설치 아이콘이 표시됩니다.',
          '설치 후 홈 화면이나 앱 목록에서 앱을 찾을 수 있습니다.'
        ]
      };
    }
  };

  const browserInfo = getBrowserInstallInstructions();

  if (isInstalled) {
    return (
      <div className="pwa-status-installed">
        {swUpdateAvailable && (
          <Alert
            type="info"
            message="새 버전이 사용 가능합니다"
            description="앱을 업데이트하여 최신 기능을 사용하세요."
            action={
              <Button size="small" onClick={handleUpdateApp} icon={<ReloadOutlined />}>
                업데이트
              </Button>
            }
            showIcon
            closable
          />
        )}
      </div>
    );
  }

  return (
    <div className="pwa-installer">
      {installationSupported && deferredPrompt && (
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={openInstallModal}
          className="install-button"
        >
          앱 설치
        </Button>
      )}

      {swUpdateAvailable && (
        <Alert
          type="warning"
          message="앱 업데이트가 필요합니다"
          description="새로운 기능과 버그 수정이 포함된 업데이트가 있습니다."
          action={
            <Button size="small" onClick={handleUpdateApp}>
              지금 업데이트
            </Button>
          }
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <Modal
        title={
          <Space>
            <MobileOutlined />
            <span>앱 설치</span>
          </Space>
        }
        open={showInstallModal}
        onCancel={closeInstallModal}
        footer={[
          <Button key="cancel" onClick={closeInstallModal}>
            취소
          </Button>,
          deferredPrompt && (
            <Button
              key="install"
              type="primary"
              icon={<DownloadOutlined />}
              loading={isInstalling}
              onClick={handleInstallClick}
            >
              설치
            </Button>
          )
        ]}
        width={600}
        className="pwa-install-modal"
      >
        <div className="install-content">
          <Card className="benefits-card">
            <Title level={4}>📱 앱 설치의 장점</Title>
            <ul className="benefits-list">
              <li>
                <CheckCircleOutlined className="benefit-icon" />
                더 빠른 로딩 속도와 오프라인 접근
              </li>
              <li>
                <CheckCircleOutlined className="benefit-icon" />
                푸시 알림으로 실시간 업데이트 수신
              </li>
              <li>
                <CheckCircleOutlined className="benefit-icon" />
                홈 화면에서 바로 앱 실행
              </li>
              <li>
                <CheckCircleOutlined className="benefit-icon" />
                네이티브 앱과 같은 사용자 경험
              </li>
              <li>
                <CheckCircleOutlined className="benefit-icon" />
                자동 업데이트로 최신 기능 이용
              </li>
            </ul>
          </Card>

          <Divider />

          <Card className="instructions-card">
            <Title level={4}>
              {browserInfo.icon}
              {browserInfo.browser}에서 설치하기
            </Title>
            <div className="install-instructions">
              {browserInfo.instructions.map((instruction, index) => (
                <div key={index} className="instruction-step">
                  <span className="step-number">{index + 1}</span>
                  <span className="step-text">{instruction}</span>
                </div>
              ))}
            </div>
          </Card>

          {!deferredPrompt && (
            <Alert
              type="info"
              message="수동 설치 안내"
              description="자동 설치 버튼이 표시되지 않는 경우 위의 설명을 따라 수동으로 설치할 수 있습니다."
              showIcon
              icon={<InfoCircleOutlined />}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PWAInstaller;
