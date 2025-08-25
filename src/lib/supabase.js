// Supabase 클라이언트 설정

// 환경변수에서 Supabase 설정 가져오기
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "https://ozfsiifhxxirihhdxlsy.supabase.co";
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZnNpaWZoeHhpcmloaGR4bHN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDcyNDIsImV4cCI6MjA3MTYyMzI0Mn0.ghKMM_nqGWllWi3miCRM5RfLwEzFucwrfui6A7L31ec";

// Supabase 클라이언트 클래스
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.headers = {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Prefer': 'return=representation'
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.url}/rest/v1/${endpoint}`;
    try {
      console.log(`Supabase 요청: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        ...options,
        headers: { ...this.headers, ...options.headers },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Supabase 오류: ${response.status} ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Supabase 응답:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Supabase 요청 오류:', error);
      return { data: null, error: error.message };
    }
  }

  from(table) {
    return new SupabaseTable(this, table);
  }
}

class SupabaseTable {
  constructor(client, table) {
    this.client = client;
    this.table = table;
    this.queryParams = new URLSearchParams();
  }

  select(columns = '*') {
    this.queryParams.set('select', columns);
    return this;
  }

  eq(column, value) {
    this.queryParams.set(column, `eq.${value}`);
    return this;
  }

  order(column, options = {}) {
    const dir = options.ascending === false ? 'desc' : 'asc';
    this.queryParams.set('order', `${column}.${dir}`);
    return this;
  }

  limit(count) {
    this.queryParams.set('limit', count);
    return this;
  }

  async exec() {
    const endpoint = `${this.table}?${this.queryParams.toString()}`;
    return await this.client.request(endpoint);
  }

  async insert(data) {
    const endpoint = this.table;
    const payload = Array.isArray(data) ? data : [data];
    return await this.client.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async update(data) {
    const filters = new URLSearchParams();
    for (const [k, v] of this.queryParams.entries()) {
      if (v.startsWith('eq.')) {
        filters.set(k, v);
      }
    }
    const endpoint = `${this.table}?${filters.toString()}`;
    return await this.client.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async delete() {
    const filters = new URLSearchParams();
    for (const [k, v] of this.queryParams.entries()) {
      if (v.startsWith('eq.')) {
        filters.set(k, v);
      }
    }
    const endpoint = `${this.table}?${filters.toString()}`;
    return await this.client.request(endpoint, {
      method: 'DELETE'
    });
  }

  single() {
    this.queryParams.set('limit', '1');
    this.isSingle = true;
    return this;
  }
}

// Supabase 클라이언트 인스턴스 생성
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 연결 테스트 함수
export const testSupabaseConnection = async () => {
  try {
    console.log('Supabase 연결 테스트 시작...');
    const result = await supabase.from('attendance_records').select('id').limit(1).exec();
    
    if (result.error) {
      console.error('❌ Supabase 연결 실패:', result.error);
      return false;
    } else {
      console.log('✅ Supabase 연결 성공');
      return true;
    }
  } catch (error) {
    console.error('❌ Supabase 연결 오류:', error);
    return false;
  }
};

export default supabase;
export { SUPABASE_URL, SUPABASE_ANON_KEY };
