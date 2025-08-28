// Lightweight Supabase REST client compatible with src/services/api.js
const SUPABASE_URL = "https://gqxyrnftftwokgvvtvdk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxeHlyblR0ZnR3b2tndnR2ZGsiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTgwNjI3MiwiZXhwIjoyMDUxMzgyMjcyfQ.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxeHlyblR0ZnR3b2tndnR2ZGsiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTgwNjI3MiwiZXhwIjoyMDUxMzgyMjcyfQ";

class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.headers = {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Prefer': 'return=representation'
    };
  }
  from(table) { return new SupabaseTable(this, table); }
}

class SupabaseTable {
  constructor(client, table) {
    this.client = client;
    this.table = table;
    this.q = new URLSearchParams();
  }
  select(cols='*'){ this.q.set('select', cols); return this; }
  order(col, opt={}){ this.q.set('order', `${col}.${opt.ascending===false?'desc':'asc'}`); return this; }
  eq(col, val){ this.q.set(col, `eq.${val}`); return this; }
  async exec(method='GET', body){
    const url = `${this.client.url}/rest/v1/${this.table}?${this.q.toString()}`;
    const res = await fetch(url, { method, headers: this.client.headers, body: body?JSON.stringify(body):undefined });
    if (!res.ok) return { data: null, error: await res.text() };
    try { return { data: await res.json(), error: null }; } catch { return { data: null, error: null }; }
  }
  async insert(data){ return this.exec('POST', Array.isArray(data)?data:[data]); }
  async update(data){
    const filters = new URLSearchParams();
    for (const [k,v] of this.q.entries()) if (v.startsWith('eq.')) filters.set(k, v);
    const url = `${this.client.url}/rest/v1/${this.table}?${filters.toString()}`;
    const res = await fetch(url, { method:'PATCH', headers: this.client.headers, body: JSON.stringify(data) });
    if (!res.ok) return { data: null, error: await res.text() };
    return { data: await res.json(), error: null };
  }
  async delete(){
    const filters = new URLSearchParams();
    for (const [k,v] of this.q.entries()) if (v.startsWith('eq.')) filters.set(k, v);
    const url = `${this.client.url}/rest/v1/${this.table}?${filters.toString()}`;
    const res = await fetch(url, { method:'DELETE', headers: this.client.headers });
    if (!res.ok) return { data: null, error: await res.text() };
    return { data: null, error: null };
  }
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function testSupabaseConnection(){
  try { const r = await supabase.from('attendance_records').select('id').limit(1).exec(); return !r.error; } catch { return false; }
}

export async function checkTables(){
  const tables = ['attendance_records','inventory','routines'];
  for (const t of tables){
    const r = await supabase.from(t).select('id').limit(1).exec();
    if (r.error) console.warn(`테이블 확인 실패: ${t} ->`, r.error);
  }
}

export default supabase;

// Supabase 클라이언트 설정

// Supabase 설정 (최신 정보)
const SUPABASE_URL = "https://ozfsiifhxxirihhdxlsy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZnNpaWZoeHhpcmloaGR4bHN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDcyNDIsImV4cCI6MjA3MTYyMzI0Mn0.ghKMM_nqGWllWi3miCRM5RfLwEzFucwrfui6A7L31ec";

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
      console.log(`📡 Supabase 요청: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        ...options,
        headers: { ...this.headers, ...options.headers },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Supabase HTTP 오류 ${response.status}:`, errorText);
        
        // 일반적인 오류 해석
        if (response.status === 404) {
          return { data: null, error: '테이블을 찾을 수 없습니다. Supabase에서 테이블을 생성해주세요.' };
        } else if (response.status === 401) {
          return { data: null, error: 'API 키가 올바르지 않습니다.' };
        } else if (response.status === 403) {
          return { data: null, error: '접근 권한이 없습니다. RLS 정책을 확인해주세요.' };
        }
        
        return { data: null, error: `HTTP ${response.status}: ${errorText}` };
      }
      
      const data = await response.json();
      console.log('✅ Supabase 응답 성공:', data);
      return { data, error: null };
    } catch (error) {
      console.error('🌐 Supabase 네트워크 오류:', error);
      return { data: null, error: `네트워크 오류: ${error.message}` };
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
    console.log('🔄 Supabase 연결 테스트 시작...');
    console.log('📡 URL:', SUPABASE_URL);
    console.log('🔑 API Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
    
    const result = await supabase.from('attendance_records').select('count').limit(1).exec();
    
    if (result.error) {
      console.error('❌ Supabase 테이블 접근 실패:', result.error);
      console.log('💡 해결 방법: Supabase 대시보드에서 simple-schema.sql을 실행하세요');
      return false;
    } else {
      console.log('✅ Supabase 연결 및 테이블 접근 성공');
      console.log('📊 테스트 결과:', result.data);
      return true;
    }
  } catch (error) {
    console.error('❌ Supabase 연결 오류:', error.message);
    console.log('🌐 네트워크 또는 CORS 문제일 수 있습니다');
    return false;
  }
};

// 테이블 존재 확인 함수
export const checkTables = async () => {
  const tables = ['attendance_records', 'inventory', 'routines'];
  const results = {};
  
  for (const table of tables) {
    try {
      const result = await supabase.from(table).select('count').limit(1).exec();
      results[table] = !result.error;
      console.log(`📋 테이블 ${table}: ${!result.error ? '✅ 존재' : '❌ 없음'}`);
    } catch (error) {
      results[table] = false;
      console.log(`📋 테이블 ${table}: ❌ 오류 - ${error.message}`);
    }
  }
  
  return results;
};

export default supabase;
export { SUPABASE_URL, SUPABASE_ANON_KEY };
