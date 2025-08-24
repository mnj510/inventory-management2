import React, { useState, useEffect } from 'react';
import { CheckSquare, Lock, Edit3, Trash2, Plus } from 'lucide-react';
import { routinesAPI } from '../services/api';

const RoutineTab = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [routines, setRoutines] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingRoutine, setEditingRoutine] = useState(null);

  // 데이터 로드
  useEffect(() => {
    const loadRoutines = async () => {
      try {
        const routinesData = await routinesAPI.getAll();
        setRoutines(routinesData);
      } catch (error) {
        console.error('업무 루틴 로드 오류:', error);
      }
    };
    loadRoutines();
  }, []);

  // 관리자 로그인
  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      setAdminPassword('');
      alert('관리자 모드로 진입했습니다.');
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  // 업무 완료 토글
  const toggleRoutineComplete = async (id) => {
    try {
      const routine = routines.find(r => r.id === id);
      const updatedRoutine = await routinesAPI.update(id, { 
        task: routine.task, 
        completed: !routine.completed 
      });
      setRoutines(routines.map(r => r.id === id ? updatedRoutine : r));
    } catch (error) {
      console.error('업무 상태 변경 오류:', error);
      alert('업무 상태 변경 중 오류가 발생했습니다.');
    }
  };

  // 새 업무 추가
  const addNewTask = async () => {
    if (newTask.trim()) {
      try {
        const newRoutine = await routinesAPI.create({ task: newTask });
        setRoutines([...routines, newRoutine]);
        setNewTask('');
      } catch (error) {
        console.error('업무 추가 오류:', error);
        alert('업무 추가 중 오류가 발생했습니다.');
      }
    }
  };

  // 업무 수정
  const updateRoutine = async (id, newTask) => {
    try {
      const routine = routines.find(r => r.id === id);
      const updatedRoutine = await routinesAPI.update(id, { 
        task: newTask, 
        completed: routine.completed 
      });
      setRoutines(routines.map(r => r.id === id ? updatedRoutine : r));
      setEditingRoutine(null);
    } catch (error) {
      console.error('업무 수정 오류:', error);
      alert('업무 수정 중 오류가 발생했습니다.');
    }
  };

  // 업무 삭제
  const deleteRoutine = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await routinesAPI.delete(id);
        setRoutines(routines.filter(routine => routine.id !== id));
      } catch (error) {
        console.error('업무 삭제 오류:', error);
        alert('업무 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 관리자 로그인 */}
      {!isAdmin && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lock className="w-6 h-6 text-red-600" />
            관리자 모드
          </h2>
          <div className="flex gap-2">
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="관리자 비밀번호를 입력하세요"
              className="flex-1 p-2 border border-gray-300 rounded-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
            />
            <button
              onClick={handleAdminLogin}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              로그인
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">힌트: admin123</p>
        </div>
      )}

      {/* 업무 루틴 관리 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-purple-600" />
            업무 루틴 체크리스트
          </h2>
          {isAdmin && (
            <button
              onClick={() => setIsAdmin(false)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              관리자 모드 종료
            </button>
          )}
        </div>

        {/* 관리자 모드: 새 업무 추가 */}
        {isAdmin && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium mb-2">새 업무 추가</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="새 업무를 입력하세요"
                className="flex-1 p-2 border border-gray-300 rounded-lg"
                onKeyPress={(e) => e.key === 'Enter' && addNewTask()}
              />
              <button
                onClick={addNewTask}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                추가
              </button>
            </div>
          </div>
        )}

        {/* 업무 체크리스트 */}
        <div className="space-y-3">
          {routines.map(routine => (
            <div key={routine.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                checked={routine.completed}
                onChange={() => toggleRoutineComplete(routine.id)}
                className="w-5 h-5 text-blue-600"
              />
              
              {editingRoutine?.id === routine.id ? (
                <input
                  type="text"
                  value={editingRoutine.task}
                  onChange={(e) => setEditingRoutine({...editingRoutine, task: e.target.value})}
                  onBlur={() => updateRoutine(routine.id, editingRoutine.task)}
                  onKeyPress={(e) => e.key === 'Enter' && updateRoutine(routine.id, editingRoutine.task)}
                  className="flex-1 p-1 border border-gray-300 rounded"
                  autoFocus
                />
              ) : (
                <span 
                  className={`flex-1 text-lg ${
                    routine.completed 
                    ? 'line-through text-gray-500' 
                    : 'text-gray-900'
                  }`}
                >
                  {routine.task}
                </span>
              )}
              
              <div className="flex items-center gap-2">
                {routine.completed && (
                  <span className="text-green-600 text-sm">완료</span>
                )}
                
                {isAdmin && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingRoutine(routine)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteRoutine(routine.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoutineTab;
