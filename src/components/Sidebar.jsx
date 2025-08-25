import React, { useState, useEffect } from 'react';
import { Clock, Package, CheckSquare, Settings, Server, Database } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
  const [apiMode, setApiMode] = useState('auto');
  const [showSettings, setShowSettings] = useState(false);
  
  useEffect(() => {
    const forceServerMode = localStorage.getItem('forceServerMode') === 'true';
    setApiMode(forceServerMode ? 'server' : 'auto');
  }, []);
  
  const handleApiModeChange = (mode) => {
    setApiMode(mode);
    if (mode === 'server') {
      localStorage.setItem('forceServerMode', 'true');
    } else {
      localStorage.removeItem('forceServerMode');
    }
    alert(`API 모드가 ${mode === 'server' ? '서버' : '자동'}으로 변경되었습니다. 페이지를 새로고침해주세요.`);
  };
  const menuItems = [
    {
      id: 'attendance',
      label: '출퇴근 관리',
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      id: 'inventory',
      label: '재고 관리',
      icon: Package,
      color: 'text-green-600'
    },
    {
      id: 'routine',
      label: '업무 루틴',
      icon: CheckSquare,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } min-h-screen`}>
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-lg font-bold text-gray-800">물류 시스템</h1>
          )}
          <div className="flex gap-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg hover:bg-gray-100"
              title="설정"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100"
              title="사이드바 접기/펼치기"
            >
              <Package className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* 메뉴 아이템 */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 설정 패널 */}
      {showSettings && !isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">API 설정</h3>
          <div className="space-y-2">
            <button
              onClick={() => handleApiModeChange('auto')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                apiMode === 'auto'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Database className="w-4 h-4" />
              자동 선택 (권장)
            </button>
            <button
              onClick={() => handleApiModeChange('server')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                apiMode === 'server'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Server className="w-4 h-4" />
              서버 모드 (강제)
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            서버 모드: 데이터가 서버에 저장됩니다
          </p>
        </div>
      )}

      {/* 하단 정보 */}
      {!isCollapsed && (
        <div className={`absolute bottom-4 left-4 right-4 ${showSettings ? 'hidden' : ''}`}>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              물류 직원 관리 시스템
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">
              현재: {apiMode === 'server' ? '🔵 서버 모드' : '🟢 자동 모드'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
