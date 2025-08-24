import React, { useState, useEffect } from 'react';
import { Clock, Plus, Calendar, BarChart3, X } from 'lucide-react';
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

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

  // 관리자 로그인
  const handleAdminLogin = () => {
    if (adminPassword === '0455') {
      setIsAdmin(true);
      setAdminPassword('');
      setShowAdminLogin(false);
      alert('관리자 모드로 진입했습니다.');
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  // 관리자 로그아웃
  const handleAdminLogout = () => {
    setIsAdmin(false);
    setEditingRecord(null);
    alert('관리자 모드에서 나갔습니다.');
  };

  // 기록 수정
  const updateAttendanceRecord = async (id, updatedData) => {
    try {
      console.log('수정할 데이터:', { id, updatedData });
      const result = await attendanceAPI.update(id, updatedData);
      console.log('서버 응답:', result);
      
      const updatedRecords = attendanceRecords.map(record => 
        record.id === id ? { ...record, ...updatedData } : record
      );
      setAttendanceRecords(updatedRecords);
      setEditingRecord(null);
      alert('기록이 수정되었습니다.');
    } catch (error) {
      console.error('기록 수정 오류:', error);
      alert(`기록 수정 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  // 기록 삭제
  const deleteAttendanceRecord = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await attendanceAPI.delete(id);
        setAttendanceRecords(attendanceRecords.filter(record => record.id !== id));
        alert('기록이 삭제되었습니다.');
      } catch (error) {
        console.error('기록 삭제 오류:', error);
        alert('기록 삭제 중 오류가 발생했습니다.');
      }
    }
  };

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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            월별 출퇴근 기록
          </h3>
          <div className="flex items-center gap-2">
            {!isAdmin ? (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                관리자 로그인
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600 font-medium">관리자 모드</span>
                <button
                  onClick={handleAdminLogout}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
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
                {editingRecord?.id === record.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <select
                      value={editingRecord.type}
                      onChange={(e) => setEditingRecord({...editingRecord, type: e.target.value})}
                      className="p-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="출근">출근</option>
                      <option value="퇴근">퇴근</option>
                    </select>
                                         <select
                       value={editingRecord.time.split(':')[0]}
                       onChange={(e) => {
                         const [, minute] = editingRecord.time.split(':');
                         setEditingRecord({...editingRecord, time: `${e.target.value}:${minute}`});
                       }}
                       className="p-1 border border-gray-300 rounded text-sm"
                     >
                      {hours.map(hour => (
                        <option key={hour} value={hour}>{hour}시</option>
                      ))}
                    </select>
                                         <select
                       value={editingRecord.time.split(':')[1]}
                       onChange={(e) => {
                         const [hour] = editingRecord.time.split(':');
                         setEditingRecord({...editingRecord, time: `${hour}:${e.target.value}`});
                       }}
                       className="p-1 border border-gray-300 rounded text-sm"
                     >
                      {minutes.map(minute => (
                        <option key={minute} value={minute}>{minute}분</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        const dataToUpdate = {
                          type: editingRecord.type,
                          time: editingRecord.time,
                          date: editingRecord.date
                        };
                        console.log('전송할 데이터:', dataToUpdate);
                        updateAttendanceRecord(record.id, dataToUpdate);
                      }}
                      className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setEditingRecord(null)}
                      className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <>
                    <span className={`font-medium px-2 py-1 rounded text-sm ${
                      record.type === '출근' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {record.type}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{record.date} {record.time}</span>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingRecord(record)}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                            title="수정"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteAttendanceRecord(record.id)}
                            className="text-red-600 hover:text-red-800 text-xs"
                            title="삭제"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 관리자 로그인 모달 */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">관리자 로그인</h3>
              <button
                onClick={() => {
                  setShowAdminLogin(false);
                  setAdminPassword('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="관리자 비밀번호 입력"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdminLogin}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  로그인
                </button>
                <button
                  onClick={() => {
                    setShowAdminLogin(false);
                    setAdminPassword('');
                  }}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTab;
