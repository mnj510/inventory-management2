const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// API 연결 상태 확인
const checkApiConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance`);
    return response.ok;
  } catch (error) {
    console.error('API 연결 확인 실패:', error);
    return false;
  }
};

// 전역 API 상태 확인
checkApiConnection().then(connected => {
  console.log('API 연결 상태:', connected);
});

// 출퇴근 기록 API
export const attendanceAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/attendance`);
    return response.json();
  },
  
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id, data) => {
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
      console.error('재고 업데이트 오류:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
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

// 입출고 기록 API
export const inoutRecordsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/inout-records`);
    return response.json();
  },
  
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/inout-records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }
};

// 포장 기록 API
export const packingRecordsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/packing-records`);
    return response.json();
  },
  
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/packing-records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }
};

// 출고 기록 API
export const outgoingRecordsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/outgoing-records`);
    return response.json();
  },
  
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/outgoing-records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }
};

// 업무 루틴 API
export const routinesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/routines`);
    return response.json();
  },
  
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/routines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/routines/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/routines/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }
};
