import React from 'react';
import './App.css';
import LogisticsSystem from './LogisticsSystem';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React 오류:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1 style={{ color: '#dc3545', marginBottom: '1rem' }}>🚨 오류가 발생했습니다</h1>
          <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
            애플리케이션을 로드하는 중 문제가 발생했습니다.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            페이지 새로고침
          </button>
          <details style={{ marginTop: '1rem', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', color: '#6c757d' }}>오류 상세 정보</summary>
            <pre style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {this.state.error && this.state.error.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <LogisticsSystem />
    </ErrorBoundary>
  );
}

export default App;
