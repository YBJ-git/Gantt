import React from 'react';
import { Card, Typography, Tag, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const EnvTest = () => {
  const envVars = {
    'REACT_APP_API_URL': process.env.REACT_APP_API_URL,
    'NODE_ENV': process.env.NODE_ENV,
    'PUBLIC_URL': process.env.PUBLIC_URL,
  };

  const checkApiConnection = async () => {
    if (process.env.REACT_APP_API_URL) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/health`);
        return response.ok;
      } catch (error) {
        return false;
      }
    }
    return false;
  };

  const [apiConnected, setApiConnected] = React.useState(null);

  React.useEffect(() => {
    checkApiConnection().then(setApiConnected);
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>환경 변수 테스트</Title>
      <Paragraph>
        이 페이지는 환경 변수가 올바르게 설정되었는지 확인하는 데 도움이 됩니다.
      </Paragraph>

      <Card title="환경 변수" style={{ marginBottom: '24px' }}>
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '16px' }}>
            <Text strong>{key}:</Text>{' '}
            {value ? (
              <>
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  설정됨
                </Tag>
                <Text code>{value}</Text>
              </>
            ) : (
              <Tag color="error" icon={<CloseCircleOutlined />}>
                미설정
              </Tag>
            )}
          </div>
        ))}
      </Card>

      <Card title="API 연결 상태">
        <div>
          <Text strong>백엔드 연결:</Text>{' '}
          {apiConnected === null ? (
            <Tag color="processing">확인 중...</Tag>
          ) : apiConnected ? (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              연결됨
            </Tag>
          ) : (
            <Tag color="error" icon={<CloseCircleOutlined />}>
              연결 실패
            </Tag>
          )}
        </div>
        {process.env.REACT_APP_API_URL && (
          <div style={{ marginTop: '8px' }}>
            <Text type="secondary">
              API URL: {process.env.REACT_APP_API_URL}/health
            </Text>
          </div>
        )}
      </Card>

      <Divider />

      <Card title="문제 해결 가이드" type="inner">
        <Title level={4}>환경 변수가 설정되지 않은 경우:</Title>
        <ol>
          <li>Netlify 대시보드에서 Environment variables 섹션으로 이동</li>
          <li>REACT_APP_API_URL 변수 추가</li>
          <li>값: https://your-backend.onrender.com/api (포트 번호 없이!)</li>
          <li>저장 후 재배포</li>
        </ol>

        <Title level={4}>API 연결이 실패한 경우:</Title>
        <ol>
          <li>백엔드가 정상적으로 실행 중인지 확인</li>
          <li>CORS 설정이 올바른지 확인</li>
          <li>API URL이 올바른지 확인 (끝에 /api 포함)</li>
        </ol>
      </Card>
    </div>
  );
};

export default EnvTest;