// 개발/프로덕션 환경에 따른 API URL 설정
const getApiBaseUrl = () => {
  // Vercel 프로덕션 환경에서는 로컬스토리지 사용
  if (window.location.hostname === 'fogni-dashboard.vercel.app') {
    return null; // 로컬스토리지 모드
  }
  // 로컬 개발 환경에서는 로컬 서버 사용
  return process.env.REACT_APP_API_URL || 'http://192.168.219.43:5001/api';
};

const API_BASE_URL = getApiBaseUrl();

// 로컬스토리지 기반 API (Vercel 프로덕션용)
const localStorageAPI = {
  // 출퇴근 기록
  attendance: {
    getAll: () => JSON.parse(localStorage.getItem('attendance_records') || '[]'),
    create: (data) => {
      const records = JSON.parse(localStorage.getItem('attendance_records') || '[]');
      const newRecord = { ...data, id: Date.now() };
      records.unshift(newRecord);
      localStorage.setItem('attendance_records', JSON.stringify(records));
      return newRecord;
    },
    update: (id, data) => {
      const records = JSON.parse(localStorage.getItem('attendance_records') || '[]');
      const index = records.findIndex(r => r.id === parseInt(id));
      if (index !== -1) {
        records[index] = { ...records[index], ...data };
        localStorage.setItem('attendance_records', JSON.stringify(records));
        return records[index];
      }
      throw new Error('기록을 찾을 수 없습니다.');
    },
    delete: (id) => {
      const records = JSON.parse(localStorage.getItem('attendance_records') || '[]');
      const filtered = records.filter(r => r.id !== parseInt(id));
      localStorage.setItem('attendance_records', JSON.stringify(filtered));
      return { message: '삭제되었습니다.' };
    }
  },
  
  // 재고 관리
  inventory: {
    getAll: () => {
      const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
      if (inventory.length === 0) {
        // 초기 데이터
        const initialData = [
          { id: 1, name: 'A상품', quantity: 100, barcode: '1234567890', grossPackingQuantity: 20 },
          { id: 2, name: 'B상품', quantity: 50, barcode: '0987654321', grossPackingQuantity: 10 },
          { id: 3, name: 'C상품', quantity: 75, barcode: '1122334455', grossPackingQuantity: 15 }
        ];
        localStorage.setItem('inventory', JSON.stringify(initialData));
        return initialData;
      }
      return inventory;
    },
    create: (data) => {
      const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
      const newItem = { ...data, id: Date.now() };
      inventory.push(newItem);
      localStorage.setItem('inventory', JSON.stringify(inventory));
      return newItem;
    },
    update: (id, data) => {
      const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
      const index = inventory.findIndex(item => item.id === parseInt(id));
      if (index !== -1) {
        inventory[index] = { ...inventory[index], ...data };
        localStorage.setItem('inventory', JSON.stringify(inventory));
        return inventory[index];
      }
      throw new Error('상품을 찾을 수 없습니다.');
    },
    delete: (id) => {
      const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
      const filtered = inventory.filter(item => item.id !== parseInt(id));
      localStorage.setItem('inventory', JSON.stringify(filtered));
      return { message: '삭제되었습니다.' };
    }
  },
  
  // 업무 루틴
  routines: {
    getAll: () => {
      const routines = JSON.parse(localStorage.getItem('routines') || '[]');
      if (routines.length === 0) {
        // 초기 데이터
        const initialData = [
          { id: 1, task: '작업장 안전 점검', completed: false },
          { id: 2, task: '재고 수량 확인', completed: false },
          { id: 3, task: '배송 준비 상품 정리', completed: false },
          { id: 4, task: '창고 청소', completed: false }
        ];
        localStorage.setItem('routines', JSON.stringify(initialData));
        return initialData;
      }
      return routines;
    },
    create: (data) => {
      const routines = JSON.parse(localStorage.getItem('routines') || '[]');
      const newRoutine = { ...data, id: Date.now() };
      routines.push(newRoutine);
      localStorage.setItem('routines', JSON.stringify(routines));
      return newRoutine;
    },
    update: (id, data) => {
      const routines = JSON.parse(localStorage.getItem('routines') || '[]');
      const index = routines.findIndex(r => r.id === parseInt(id));
      if (index !== -1) {
        routines[index] = { ...routines[index], ...data };
        localStorage.setItem('routines', JSON.stringify(routines));
        return routines[index];
      }
      throw new Error('업무를 찾을 수 없습니다.');
    },
    delete: (id) => {
      const routines = JSON.parse(localStorage.getItem('routines') || '[]');
      const filtered = routines.filter(r => r.id !== parseInt(id));
      localStorage.setItem('routines', JSON.stringify(filtered));
      return { message: '삭제되었습니다.' };
    }
  },
  
  // 기타 기록들
  inoutRecords: {
    getAll: () => JSON.parse(localStorage.getItem('inout_records') || '[]'),
    create: (data) => {
      const records = JSON.parse(localStorage.getItem('inout_records') || '[]');
      const newRecord = { ...data, id: Date.now() };
      records.unshift(newRecord);
      localStorage.setItem('inout_records', JSON.stringify(records));
      return newRecord;
    }
  },
  
  packingRecords: {
    getAll: () => JSON.parse(localStorage.getItem('packing_records') || '[]'),
    create: (data) => {
      const records = JSON.parse(localStorage.getItem('packing_records') || '[]');
      const newRecord = { ...data, id: Date.now() };
      records.unshift(newRecord);
      localStorage.setItem('packing_records', JSON.stringify(records));
      return newRecord;
    }
  },
  
  outgoingRecords: {
    getAll: () => JSON.parse(localStorage.getItem('outgoing_records') || '[]'),
    create: (data) => {
      const records = JSON.parse(localStorage.getItem('outgoing_records') || '[]');
      const newRecord = { ...data, id: Date.now() };
      records.unshift(newRecord);
      localStorage.setItem('outgoing_records', JSON.stringify(records));
      return newRecord;
    }
  }
};

// 출퇴근 기록 API
export const attendanceAPI = {
  getAll: async () => {
    if (!API_BASE_URL) {
      return localStorageAPI.attendance.getAll();
    }
    try {
      const response = await fetch(`${API_BASE_URL}/attendance`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('출퇴근 기록 조회 오류:', error);
      throw error;
    }
  },
  
  create: async (data) => {
    if (!API_BASE_URL) {
      return localStorageAPI.attendance.create(data);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('출퇴근 기록 생성 오류:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    if (!API_BASE_URL) {
      return localStorageAPI.attendance.update(id, data);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('출퇴근 기록 수정 오류:', error);
      throw error;
    }
  },

  delete: async (id) => {
    if (!API_BASE_URL) {
      return localStorageAPI.attendance.delete(id);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('출퇴근 기록 삭제 오류:', error);
      throw error;
    }
  }
};

// 재고 API
export const inventoryAPI = {
  getAll: async () => {
    if (!API_BASE_URL) {
      return localStorageAPI.inventory.getAll();
    }
    try {
      const response = await fetch(`${API_BASE_URL}/inventory`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('재고 조회 오류:', error);
      throw error;
    }
  },
  
  create: async (data) => {
    if (!API_BASE_URL) {
      return localStorageAPI.inventory.create(data);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('재고 생성 오류:', error);
      throw error;
    }
  },
  
  update: async (id, data) => {
    if (!API_BASE_URL) {
      return localStorageAPI.inventory.update(id, data);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('재고 수정 오류:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    if (!API_BASE_URL) {
      return localStorageAPI.inventory.delete(id);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('재고 삭제 오류:', error);
      throw error;
    }
  }
};

// 업무 루틴 API
export const routinesAPI = {
  getAll: async () => {
    if (!API_BASE_URL) {
      return localStorageAPI.routines.getAll();
    }
    try {
      const response = await fetch(`${API_BASE_URL}/routines`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('업무 루틴 조회 오류:', error);
      throw error;
    }
  },
  
  create: async (data) => {
    if (!API_BASE_URL) {
      return localStorageAPI.routines.create(data);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/routines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('업무 루틴 생성 오류:', error);
      throw error;
    }
  },
  
  update: async (id, data) => {
    if (!API_BASE_URL) {
      return localStorageAPI.routines.update(id, data);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/routines/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('업무 루틴 수정 오류:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    if (!API_BASE_URL) {
      return localStorageAPI.routines.delete(id);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/routines/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('업무 루틴 삭제 오류:', error);
      throw error;
    }
  }
};

// 입출고 기록 API
export const inoutRecordsAPI = {
  getAll: async () => {
    if (!API_BASE_URL) {
      return localStorageAPI.inoutRecords.getAll();
    }
    try {
      const response = await fetch(`${API_BASE_URL}/inout-records`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('입출고 기록 조회 오류:', error);
      return []; // 빈 배열 반환
    }
  },
  
  create: async (data) => {
    if (!API_BASE_URL) {
      return localStorageAPI.inoutRecords.create(data);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/inout-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('입출고 기록 생성 오류:', error);
      return localStorageAPI.inoutRecords.create(data);
    }
  }
};

// 포장 기록 API
export const packingRecordsAPI = {
  getAll: async () => {
    if (!API_BASE_URL) {
      return localStorageAPI.packingRecords.getAll();
    }
    try {
      const response = await fetch(`${API_BASE_URL}/packing-records`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('포장 기록 조회 오류:', error);
      return [];
    }
  },
  
  create: async (data) => {
    if (!API_BASE_URL) {
      return localStorageAPI.packingRecords.create(data);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/packing-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('포장 기록 생성 오류:', error);
      return localStorageAPI.packingRecords.create(data);
    }
  }
};

// 출고 기록 API
export const outgoingRecordsAPI = {
  getAll: async () => {
    if (!API_BASE_URL) {
      return localStorageAPI.outgoingRecords.getAll();
    }
    try {
      const response = await fetch(`${API_BASE_URL}/outgoing-records`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('출고 기록 조회 오류:', error);
      return [];
    }
  },
  
  create: async (data) => {
    if (!API_BASE_URL) {
      return localStorageAPI.outgoingRecords.create(data);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/outgoing-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('출고 기록 생성 오류:', error);
      return localStorageAPI.outgoingRecords.create(data);
    }
  }
};

// 초기화 시 실행
console.log('API 모드:', API_BASE_URL ? '서버 모드' : '로컬스토리지 모드');