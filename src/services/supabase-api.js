import { supabase, TABLES } from '../config/supabase'

// 출퇴근 기록 API
export const attendanceAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from(TABLES.ATTENDANCE)
      .select('*')
      .order('timestamp', { ascending: false })
    
    if (error) throw error
    return data || []
  },
  
  create: async (record) => {
    const { data, error } = await supabase
      .from(TABLES.ATTENDANCE)
      .insert([record])
      .select()
    
    if (error) throw error
    return data[0]
  }
}

// 재고 API
export const inventoryAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from(TABLES.INVENTORY)
      .select('*')
      .order('id', { ascending: true })
    
    if (error) throw error
    return data || []
  },
  
  create: async (item) => {
    const { data, error } = await supabase
      .from(TABLES.INVENTORY)
      .insert([item])
      .select()
    
    if (error) throw error
    return data[0]
  },
  
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from(TABLES.INVENTORY)
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },
  
  delete: async (id) => {
    const { error } = await supabase
      .from(TABLES.INVENTORY)
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { message: '삭제되었습니다.' }
  }
}

// 입출고 기록 API
export const inoutRecordsAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from(TABLES.INOUT_RECORDS)
      .select('*')
      .order('timestamp', { ascending: false })
    
    if (error) throw error
    return data || []
  },
  
  create: async (record) => {
    const { data, error } = await supabase
      .from(TABLES.INOUT_RECORDS)
      .insert([record])
      .select()
    
    if (error) throw error
    return data[0]
  }
}

// 포장 기록 API
export const packingRecordsAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from(TABLES.PACKING_RECORDS)
      .select('*')
      .order('timestamp', { ascending: false })
    
    if (error) throw error
    return data || []
  },
  
  create: async (record) => {
    const { data, error } = await supabase
      .from(TABLES.PACKING_RECORDS)
      .insert([record])
      .select()
    
    if (error) throw error
    return data[0]
  }
}

// 출고 기록 API
export const outgoingRecordsAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from(TABLES.OUTGOING_RECORDS)
      .select('*')
      .order('timestamp', { ascending: false })
    
    if (error) throw error
    return data || []
  },
  
  create: async (record) => {
    const { data, error } = await supabase
      .from(TABLES.OUTGOING_RECORDS)
      .insert([record])
      .select()
    
    if (error) throw error
    return data[0]
  }
}

// 업무 루틴 API
export const routinesAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from(TABLES.ROUTINES)
      .select('*')
      .order('id', { ascending: true })
    
    if (error) throw error
    return data || []
  },
  
  create: async (routine) => {
    const { data, error } = await supabase
      .from(TABLES.ROUTINES)
      .insert([routine])
      .select()
    
    if (error) throw error
    return data[0]
  },
  
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from(TABLES.ROUTINES)
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },
  
  delete: async (id) => {
    const { error } = await supabase
      .from(TABLES.ROUTINES)
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { message: '삭제되었습니다.' }
  }
}

// 실시간 구독 설정
export const setupRealtimeSubscriptions = (onDataChange) => {
  // 출퇴근 기록 실시간 구독
  supabase
    .channel('attendance_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.ATTENDANCE }, onDataChange)
    .subscribe()

  // 재고 실시간 구독
  supabase
    .channel('inventory_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.INVENTORY }, onDataChange)
    .subscribe()

  // 입출고 기록 실시간 구독
  supabase
    .channel('inout_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.INOUT_RECORDS }, onDataChange)
    .subscribe()

  // 포장 기록 실시간 구독
  supabase
    .channel('packing_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.PACKING_RECORDS }, onDataChange)
    .subscribe()

  // 출고 기록 실시간 구독
  supabase
    .channel('outgoing_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.OUTGOING_RECORDS }, onDataChange)
    .subscribe()

  // 업무 루틴 실시간 구독
  supabase
    .channel('routines_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.ROUTINES }, onDataChange)
    .subscribe()
}
