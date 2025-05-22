import React from 'react';
import { Result, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // 오류가 발생하면 state를 업데이트하여 fallback UI를 렌더링
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 오류 정보를 state에 저장
    this.setState({
      error,
      errorInfo
    });

    // 오류를 로깅 서비스에 보고
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // 실제 환경에서는 Sentry, LogRocket 등의 서비스 사용
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    
    // 개발 환경에서만 상세 정보 출력
    if (process.env.NODE_ENV === 'development') {
      console.group('Error Boundary Details');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // 프로덕션 환경에서는 외부 로깅 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      // 예: Sentry.captureException(error, { extra: errorInfo });
      
      // 간단한 API 호출 예시
      fetch('/api/log-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(err => {
        console.error('Failed to log error:', err);
      });
    }
  };

  handleRetry = () => {
    // 컴포넌트 상태를 초기화하여 다시 렌더링 시도
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleReload = () => {
    // 페이지 새로고침
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 에러 UI 표시
      return (
        <div className="error-boundary">
          <Result
            status="error"
            icon={<ExclamationCircleOutlined />}
            title="죄송합니다. 오류가 발생했습니다."
            subTitle="예기치 않은 오류가 발생했습니다. 다시 시도해 주세요."
            extra={[
              <Button type="primary" key="retry" onClick={this.handleRetry}>
                다시 시도
              </Button>,
              <Button key="reload" onClick={this.handleReload}>
                페이지 새로고침
              </Button>,
              <Button key="home" href="/">
                홈으로 이동
              </Button>
            ]}
          />
          
          {/* 개발 환경에서만 상세 오류 정보 표시 */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="error-details">
              <summary>개발자 정보 (개발 환경에서만 표시)</summary>
              <div className="error-content">
                <h3>오류 메시지:</h3>
                <pre>{this.state.error.message}</pre>
                
                <h3>오류 스택:</h3>
                <pre>{this.state.error.stack}</pre>
                
                {this.state.errorInfo && (
                  <>
                    <h3>컴포넌트 스택:</h3>
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  </>
                )}
              </div>
            </details>
          )}
        </div>
      );
    }

    // 오류가 없으면 children을 정상적으로 렌더링
    return this.props.children;
  }
}

export default ErrorBoundary;
