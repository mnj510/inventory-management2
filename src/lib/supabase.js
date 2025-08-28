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
