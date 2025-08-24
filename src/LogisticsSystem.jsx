import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import AttendanceTab from './components/AttendanceTab';
import InventoryTab from './components/InventoryTab';
import RoutineTab from './components/RoutineTab';

const LogisticsSystem = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'attendance':
        return <AttendanceTab />;
      case 'inventory':
        return <InventoryTab />;
      case 'routine':
        return <RoutineTab />;
      default:
        return <AttendanceTab />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      {/* 메인 콘텐츠 */}
      <div className={`flex-1 transition-all duration-300 ${
        isCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <div className="p-6">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default LogisticsSystem;
