import React, { useState } from 'react';

const SimpleLogin = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('테스트 중...');
    
    try {
      // 환경변수 확인
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://gantt-c1oh.onrender.com';
      setResult(prev => prev + `\n환경변수 API URL: ${apiUrl}`);
      
      // Health check 먼저 시도
      const healthResponse = await fetch(`${apiUrl}/health`, {
        method: 'GET',
      });
      
      setResult(prev => prev + `\nHealth Check Status: ${healthResponse.status}`);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.text();
        setResult(prev => prev + `\nHealth Check Response: ${healthData}`);
      }
      
      // 로그인 시도
      const loginResponse = await fetch(`${apiUrl}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      setResult(prev => prev + `\nLogin Status: ${loginResponse.status}`);
      
      const loginData = await loginResponse.text();
      setResult(prev => prev + `\nLogin Response: ${loginData}`);
      
      if (loginResponse.ok) {
        const parsedData = JSON.parse(loginData);
        setResult(prev => prev + `\n✅ 로그인 성공!`);
        setResult(prev => prev + `\n사용자: ${parsedData.user.username}`);
        setResult(prev => prev + `\n역할: ${parsedData.user.role}`);
      } else {
        setResult(prev => prev + `\n❌ 로그인 실패`);
      }
      
    } catch (error) {
      setResult(prev => prev + `\n🚨 네트워크 오류: ${error.message}`);
      setResult(prev => prev + `\n오류 타입: ${error.name}`);
      setResult(prev => prev + `\n스택: ${error.stack}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🔧 디버그 로그인 테스트</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>사용자명:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>비밀번호:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </div>
        
        <button 
          onClick={testConnection} 
          disabled={loading}
          style={{ 
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '테스트 중...' : '연결 및 로그인 테스트'}
        </button>
      </div>
      
      <div 
        style={{ 
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '5px',
          padding: '15px',
          fontSize: '14px',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          minHeight: '200px'
        }}
      >
        {result || '테스트 버튼을 클릭하여 연결을 확인하세요...'}
      </div>
    </div>
  );
};

export default SimpleLogin;