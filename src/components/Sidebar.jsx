import React from 'react';
import { Clock, Package, CheckSquare, Settings } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
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
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
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

      {/* 하단 정보 */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              물류 직원 관리 시스템
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
