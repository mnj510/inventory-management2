// 로컬 스토리지 키 상수
export const STORAGE_KEYS = {
  ATTENDANCE: 'logistics_attendance',
  INVENTORY: 'logistics_inventory',
  INOUT_RECORDS: 'logistics_inout_records',
  PACKING_RECORDS: 'logistics_packing_records',
  OUTGOING_RECORDS: 'logistics_outgoing_records',
  ROUTINES: 'logistics_routines'
};

// 데이터 저장 함수
export const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('데이터 저장 실패:', error);
    return false;
  }
};

// 데이터 불러오기 함수
export const loadData = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('데이터 불러오기 실패:', error);
    return defaultValue;
  }
};

// 모든 데이터 초기화
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

// 특정 데이터 삭제
export const removeData = (key) => {
  localStorage.removeItem(key);
};
