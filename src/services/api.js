import supabase, { testSupabaseConnection } from '../lib/supabase';

// API 모드 결정
const getApiMode = () => {
  // 사용자가 강제로 로컬스토리지 모드를 선택한 경우
  const forceLocalStorage = localStorage.getItem('forceLocalStorage') === 'true';
  
  if (forceLocalStorage) {
    console.log('🟢 강제 로컬스토리지 모드로 실행 (사용자 설정)');
    return 'localStorage';
  }
  
  // 기본적으로 Supabase 사용
  console.log('🔵 Supabase 모드로 실행');
  return 'supabase';
};

const API_MODE = getApiMode();

// 로컬스토리지 기반 API (백업용)
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
  }
};

// Supabase API 함수들
const supabaseAPI = {
  // 출퇴근 기록
  attendance: {
    getAll: async () => {
      const result = await supabase.from('attendance_records').select('*').order('created_at', { ascending: false }).exec();
      if (result.error) throw new Error(result.error);
      return result.data || [];
    },
    create: async (data) => {
      const result = await supabase.from('attendance_records').insert(data).exec();
      if (result.error) throw new Error(result.error);
      return result.data[0];
    },
    update: async (id, data) => {
      const result = await supabase.from('attendance_records').eq('id', id).update(data).exec();
      if (result.error) throw new Error(result.error);
      return result.data[0];
    },
    delete: async (id) => {
      const result = await supabase.from('attendance_records').eq('id', id).delete().exec();
      if (result.error) throw new Error(result.error);
      return { message: '삭제되었습니다.' };
    }
  },

  // 재고 관리
  inventory: {
    getAll: async () => {
      const result = await supabase.from('inventory').select('*').order('name').exec();
      if (result.error) throw new Error(result.error);
      return result.data || [];
    },
    create: async (data) => {
      const result = await supabase.from('inventory').insert(data).exec();
      if (result.error) throw new Error(result.error);
      return result.data[0];
    },
    update: async (id, data) => {
      const result = await supabase.from('inventory').eq('id', id).update(data).exec();
      if (result.error) throw new Error(result.error);
      return result.data[0];
    },
    delete: async (id) => {
      const result = await supabase.from('inventory').eq('id', id).delete().exec();
      if (result.error) throw new Error(result.error);
      return { message: '삭제되었습니다.' };
    }
  },

  // 업무 루틴
  routines: {
    getAll: async () => {
      const result = await supabase.from('routines').select('*').order('created_at').exec();
      if (result.error) throw new Error(result.error);
      return result.data || [];
    },
    create: async (data) => {
      const result = await supabase.from('routines').insert(data).exec();
      if (result.error) throw new Error(result.error);
      return result.data[0];
    },
    update: async (id, data) => {
      const result = await supabase.from('routines').eq('id', id).update(data).exec();
      if (result.error) throw new Error(result.error);
      return result.data[0];
    },
    delete: async (id) => {
      const result = await supabase.from('routines').eq('id', id).delete().exec();
      if (result.error) throw new Error(result.error);
      return { message: '삭제되었습니다.' };
    }
  }
};

// 출퇴근 기록 API
export const attendanceAPI = {
  getAll: async () => {
    if (API_MODE === 'localStorage') {
      return localStorageAPI.attendance.getAll();
    }
    try {
      return await supabaseAPI.attendance.getAll();
    } catch (error) {
      console.error('출퇴근 기록 조회 오류:', error);
      throw error;
    }
  },
  
  create: async (data) => {
    if (API_MODE === 'localStorage') {
      return localStorageAPI.attendance.create(data);
    }
    try {
      return await supabaseAPI.attendance.create(data);
    } catch (error) {
      console.error('출퇴근 기록 생성 오류:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    if (API_MODE === 'localStorage') {
      return localStorageAPI.attendance.update(id, data);
    }
    try {
      return await supabaseAPI.attendance.update(id, data);
    } catch (error) {
      console.error('출퇴근 기록 수정 오류:', error);
      throw error;
    }
  },

  delete: async (id) => {
    if (API_MODE === 'localStorage') {
      return localStorageAPI.attendance.delete(id);
    }
    try {
      return await supabaseAPI.attendance.delete(id);
    } catch (error) {
      console.error('출퇴근 기록 삭제 오류:', error);
      throw error;
    }
  }
};

// 재고 API
export const inventoryAPI = {
  getAll: async () => {
    if (API_MODE === 'localStorage') {
      return localStorageAPI.inventory.getAll();
    }
    try {
      return await supabaseAPI.inventory.getAll();
    } catch (error) {
      console.error('재고 조회 오류:', error);
      throw error;
    }
  },
  
  create: async (data) => {
    if (API_MODE === 'localStorage') {
      return localStorageAPI.inventory.create(data);
    }
    try {
      return await supabaseAPI.inventory.create(data);
    } catch (error) {
      console.error('재고 생성 오류:', error);
      throw error;
    }
  },
  
  update: async (id, data) => {
    if (API_MODE === 'localStorage') {
      return localStorageAPI.inventory.update(id, data);
    }
    try {
      return await supabaseAPI.inventory.update(id, data);
    } catch (error) {
      console.error('재고 수정 오류:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    if (API_MODE === 'localStorage') {
      return localStorageAPI.inventory.delete(id);
    }
    try {
      return await supabaseAPI.inventory.delete(id);
    } catch (error) {
      console.error('재고 삭제 오류:', error);
      throw error;
    }
  }
};

// 업무 루틴 API
export const routinesAPI = {
  getAll: async () => {
    if (API_MODE === 'localStorage') {
      return localStorageAPI.routines.getAll();
    }
    try {
      return await supabaseAPI.routines.getAll();
    } catch (error) {
      console.error('업무 루틴 조회 오류:', error);
      throw error;
    }
  },
  
  create: async (data) => {
    if (API_MODE === 'localStorage') {
      return localStorageAPI.routines.create(data);
    }
    try {
      return await supabaseAPI.routines.create(data);
    } catch (error) {
      console.error('업무 루틴 생성 오류:', error);
      throw error;
    }
  },
  
  update: async (id, data) => {
    if (API_MODE === 'localStorage') {
      return localStorageAPI.routines.update(id, data);
    }
    try {
      return await supabaseAPI.routines.update(id, data);
    } catch (error) {
      console.error('업무 루틴 수정 오류:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    if (API_MODE === 'localStorage') {
      return localStorageAPI.routines.delete(id);
    }
    try {
      return await supabaseAPI.routines.delete(id);
    } catch (error) {
      console.error('업무 루틴 삭제 오류:', error);
      throw error;
    }
  }
};

// 간단한 기록 API들 (현재는 로컬스토리지만 사용)
export const inoutRecordsAPI = {
  getAll: async () => JSON.parse(localStorage.getItem('inout_records') || '[]'),
  create: async (data) => {
    const records = JSON.parse(localStorage.getItem('inout_records') || '[]');
    const newRecord = { ...data, id: Date.now() };
    records.unshift(newRecord);
    localStorage.setItem('inout_records', JSON.stringify(records));
    return newRecord;
  }
};

export const packingRecordsAPI = {
  getAll: async () => JSON.parse(localStorage.getItem('packing_records') || '[]'),
  create: async (data) => {
    const records = JSON.parse(localStorage.getItem('packing_records') || '[]');
    const newRecord = { ...data, id: Date.now() };
    records.unshift(newRecord);
    localStorage.setItem('packing_records', JSON.stringify(records));
    return newRecord;
  }
};

export const outgoingRecordsAPI = {
  getAll: async () => JSON.parse(localStorage.getItem('outgoing_records') || '[]'),
  create: async (data) => {
    const records = JSON.parse(localStorage.getItem('outgoing_records') || '[]');
    const newRecord = { ...data, id: Date.now() };
    records.unshift(newRecord);
    localStorage.setItem('outgoing_records', JSON.stringify(records));
    return newRecord;
  }
};

// 초기화 시 실행
console.log('API 모드:', API_MODE);
console.log('Supabase 연결 테스트 시작...');

// 앱 시작 시 Supabase 연결 테스트
if (API_MODE === 'supabase') {
  testSupabaseConnection();
}