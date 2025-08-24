import React, { useState, useEffect } from 'react';
import { Clock, Plus, Calendar, BarChart3 } from 'lucide-react';
import { attendanceAPI } from '../services/api';

const AttendanceTab = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedType, setSelectedType] = useState('출근');
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({ totalDays: 0, totalHours: 0, totalMinutes: 0 });

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

  // 년도와 월 옵션 생성
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 월별 기록 필터링 및 통계 계산
  useEffect(() => {
    if (attendanceRecords.length > 0) {
      const filtered = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        const recordYear = recordDate.getFullYear();
        const recordMonth = recordDate.getMonth() + 1;
        
        return recordYear === selectedYear && recordMonth === selectedMonth;
      });
      
      setFilteredRecords(filtered);
      
      // 월별 통계 계산
      const dailyRecords = {};
      filtered.forEach(record => {
        const date = record.date;
        if (!dailyRecords[date]) {
          dailyRecords[date] = { 출근: null, 퇴근: null };
        }
        dailyRecords[date][record.type] = record.time;
      });
      
      let totalDays = 0;
      let totalMinutes = 0;
      
      Object.values(dailyRecords).forEach(day => {
        if (day.출근 && day.퇴근) {
          totalDays++;
          
          // 출근 시간과 퇴근 시간 계산
          const [startHour, startMin] = day.출근.split(':').map(Number);
          const [endHour, endMin] = day.퇴근.split(':').map(Number);
          
          let startMinutes = startHour * 60 + startMin;
          let endMinutes = endHour * 60 + endMin;
          
          // 자정을 넘어가는 경우 처리
          if (endMinutes < startMinutes) {
            endMinutes += 24 * 60;
          }
          
          totalMinutes += endMinutes - startMinutes;
        }
      });
      
      const totalHours = Math.floor(totalMinutes / 60);
      const remainingMinutes = totalMinutes % 60;
      
      setMonthlyStats({
        totalDays,
        totalHours,
        totalMinutes: remainingMinutes
      });
    }
  }, [attendanceRecords, selectedYear, selectedMonth]);

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

      {/* 월별 필터 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          월별 출퇴근 기록
        </h3>
        <div className="flex gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">년도</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="p-2 border border-gray-300 rounded-lg"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">월</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="p-2 border border-gray-300 rounded-lg"
            >
              {months.map(month => (
                <option key={month} value={month}>{month}월</option>
              ))}
            </select>
          </div>
        </div>

        {/* 월별 통계 */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {selectedYear}년 {selectedMonth}월 통계
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">출근 일수</p>
              <p className="text-xl font-bold text-blue-600">{monthlyStats.totalDays}일</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">총 근무 시간</p>
              <p className="text-xl font-bold text-green-600">
                {monthlyStats.totalHours}시간 {monthlyStats.totalMinutes}분
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">일평균 근무</p>
              <p className="text-xl font-bold text-purple-600">
                {monthlyStats.totalDays > 0 
                  ? `${Math.floor((monthlyStats.totalHours * 60 + monthlyStats.totalMinutes) / monthlyStats.totalDays / 60)}시간 ${Math.floor(((monthlyStats.totalHours * 60 + monthlyStats.totalMinutes) / monthlyStats.totalDays) % 60)}분`
                  : '0시간 0분'
                }
              </p>
            </div>
          </div>
        </div>

        {/* 출퇴근 기록 목록 */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {filteredRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-4">선택한 기간에 기록이 없습니다.</p>
          ) : (
            filteredRecords.map(record => (
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
