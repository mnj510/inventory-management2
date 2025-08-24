import React, { useState, useEffect } from 'react';
import { Clock, Plus } from 'lucide-react';
import { attendanceAPI } from '../services/api';

const AttendanceTab = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedType, setSelectedType] = useState('출근');
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');

  // 데이터 로드
  useEffect(() => {
    const loadAttendanceRecords = async () => {
      try {
        const records = await attendanceAPI.getAll();
        setAttendanceRecords(records);
      } catch (error) {
        console.error('출퇴근 기록 로드 오류:', error);
      }
    };
    loadAttendanceRecords();
  }, []);

  // 시간 옵션 생성 (10분 단위)
  const generateTimeOptions = () => {
    const hours = [];
    const minutes = [];
    
    for (let h = 0; h < 24; h++) {
      hours.push(h.toString().padStart(2, '0'));
    }
    
    for (let m = 0; m < 60; m += 10) {
      minutes.push(m.toString().padStart(2, '0'));
    }
    
    return { hours, minutes };
  };
  
  const { hours, minutes } = generateTimeOptions();

  // 출퇴근 기록 추가
  const addAttendanceRecord = async () => {
    try {
      const now = new Date();
      const recordData = {
        type: selectedType,
        time: `${selectedHour}:${selectedMinute}`,
        date: now.toLocaleDateString('ko-KR')
      };
      
      const newRecord = await attendanceAPI.create(recordData);
      setAttendanceRecords([newRecord, ...attendanceRecords]);
      alert(`${selectedType} 시간이 기록되었습니다: ${recordData.time}`);
    } catch (error) {
      console.error('출퇴근 기록 추가 오류:', error);
      alert('기록 추가 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" />
          출퇴근 시간 체크
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">구분</label>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="출근">출근</option>
              <option value="퇴근">퇴근</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">시간</label>
            <select 
              value={selectedHour}
              onChange={(e) => setSelectedHour(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              {hours.map(hour => (
                <option key={hour} value={hour}>{hour}시</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">분</label>
            <select 
              value={selectedMinute}
              onChange={(e) => setSelectedMinute(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              {minutes.map(minute => (
                <option key={minute} value={minute}>{minute}분</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={addAttendanceRecord}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              기록하기
            </button>
          </div>
        </div>
      </div>

      {/* 출퇴근 기록 목록 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">출퇴근 기록</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {attendanceRecords.length === 0 ? (
            <p className="text-gray-500">아직 기록이 없습니다.</p>
          ) : (
            attendanceRecords.map(record => (
              <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className={`font-medium px-2 py-1 rounded text-sm ${
                  record.type === '출근' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {record.type}
                </span>
                <span className="text-gray-600">{record.date} {record.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceTab;
