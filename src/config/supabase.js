import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 데이터베이스 테이블 이름
export const TABLES = {
  ATTENDANCE: 'attendance_records',
  INVENTORY: 'inventory',
  INOUT_RECORDS: 'inout_records',
  PACKING_RECORDS: 'packing_records',
  OUTGOING_RECORDS: 'outgoing_records',
  ROUTINES: 'routines'
}
