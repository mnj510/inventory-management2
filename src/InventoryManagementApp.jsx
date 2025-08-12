import React, { useState, useEffect } from 'react';
import { Package, Plus, Minus, Scan, Save, Trash2, ArrowUp, ArrowDown, Search, Cloud, CloudOff, Wifi } from 'lucide-react';

// Supabase 설정
const SUPABASE_URL = "https://gqxyrnftftwokgvvtvdk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxeHlyblR0ZnR3b2tndnR2ZGsiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTgwNjI3MiwiZXhwIjoyMDUxMzgyMjcyfQ.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxeHlyblR0ZnR3b2tndnR2ZGsiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTgwNjI3MiwiZXhwIjoyMDUxMzgyMjcyfQ";

// 개선된 Supabase 클라이언트 (CDN 호환)
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
      const response = await fetch(url, {
        method: 'GET',
        ...options,
        headers: { ...this.headers, ...options.headers },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Supabase request error:', error);
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
  select(columns = '*') { this.queryParams.set('select', columns); return this; }
  eq(column, value) { this.queryParams.set(column, `eq.${value}`); return this; }
  order(column, options = {}) { const dir = options.ascending === false ? 'desc' : 'asc'; this.queryParams.set('order', `${column}.${dir}`); return this; }
  limit(count) { this.queryParams.set('limit', count); return this; }
  async exec() { const endpoint = `${this.table}?${this.queryParams.toString()}`; return await this.client.request(endpoint); }
  async insert(data) { const endpoint = this.table; return await this.client.request(endpoint, { method: 'POST', body: JSON.stringify(Array.isArray(data) ? data : [data]) }); }
  async update(data) { const filters = new URLSearchParams(); for (const [k,v] of this.queryParams.entries()) { if (v.startsWith('eq.')) filters.set(k, v); } const endpoint = `${this.table}?${filters.toString()}`; return await this.client.request(endpoint, { method: 'PATCH', body: JSON.stringify(data) }); }
  async delete() { const filters = new URLSearchParams(); for (const [k,v] of this.queryParams.entries()) { if (v.startsWith('eq.')) filters.set(k, v); } const endpoint = `${this.table}?${filters.toString()}`; return await this.client.request(endpoint, { method: 'DELETE' }); }
  single() { this.queryParams.set('limit', '1'); this.isSingle = true; return this; }
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const InventoryManagementApp = () => {
  const [activeTab, setActiveTab] = useState('stock');
  const [products, setProducts] = useState([]);
  const [dailyOutbound, setDailyOutbound] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());

  const [barcodeInput, setBarcodeInput] = useState('');
  const [newProduct, setNewProduct] = useState({ barcode: '', name: '', stock: 0, minStock: 5 });
  const [inboundData, setInboundData] = useState({ productId: '', quantity: 1, date: new Date().toISOString().split('T')[0] });
  const [productSearch, setProductSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showProductList, setShowProductList] = useState(false);
  const [scanning, setScanning] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const productsResult = await supabase.from('products').select('*').order('name').exec();
      if (productsResult.error) throw new Error(`제품 로드 실패: ${productsResult.error}`);
      setProducts(productsResult.data || []);

      const transactionsResult = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(100).exec();
      setTransactions(transactionsResult.data || []);

      const dailyOutboundResult = await supabase.from('daily_outbound').select('*').order('created_at', { ascending: false }).exec();
      setDailyOutbound(dailyOutboundResult.data || []);

      setConnected(true);
      setLastSync(new Date());
    } catch (e) {
      setConnected(false);
      alert('데이터 로드 실패: ' + e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (productSearch) {
      const filtered = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.barcode.includes(productSearch));
      setFilteredProducts(filtered);
      setShowProductList(filtered.length > 0);
    } else { setFilteredProducts([]); setShowProductList(false); }
  }, [productSearch, products]);

  const selectProduct = (product) => {
    setProductSearch(product.name);
    setInboundData({ ...inboundData, productId: product.id });
    setShowProductList(false);
  };

  const handleAsync = async (fn, msg) => {
    try { setLoading(true); await fn(); msg && alert('✅ ' + msg); setTimeout(loadData, 500); }
    catch (e) { setConnected(false); alert('❌ ' + (e.message || '오류가 발생했습니다')); }
    finally { setLoading(false); }
  };

  const findProductByBarcode = (barcode) => products.find(p => p.barcode === barcode);

  const handleBarcodeScan = async (barcode) => {
    if (!barcode.trim()) return;
    const product = findProductByBarcode(barcode);
    if (product) { await addToOutboundList(product); setBarcodeInput(''); }
    else { alert(`바코드 ${barcode} 제품을 찾을 수 없습니다.`); }
  };

  const addToOutboundList = async (product) => handleAsync(async () => {
    const existingResult = await supabase.from('daily_outbound').select('*').eq('product_id', product.id).exec();
    const existing = (existingResult.data || []).find(i => i.product_id === product.id);
    if (existing) {
      const updateResult = await supabase.from('daily_outbound').eq('product_id', product.id).update({ quantity: Number(existing.quantity || 0) + 1 }).exec();
      if (updateResult.error) throw new Error(updateResult.error);
    } else {
      const insertResult = await supabase.from('daily_outbound').insert({ product_id: product.id, product_name: product.name, barcode: product.barcode, stock: product.stock, min_stock: product.min_stock, quantity: 1 }).exec();
      if (insertResult.error) throw new Error(insertResult.error);
    }
  }, `${product.name}이(가) 출고 목록에 추가되었습니다.`);

  const adjustOutboundQuantity = async (productId, change) => handleAsync(async () => {
    const currentItem = dailyOutbound.find(i => i.product_id === productId);
    if (!currentItem) return;
    const newQty = Math.max(0, Number(currentItem.quantity || 0) + change);
    if (newQty === 0) {
      const del = await supabase.from('daily_outbound').eq('product_id', productId).delete().exec();
      if (del.error) throw new Error(del.error);
    } else {
      const upd = await supabase.from('daily_outbound').eq('product_id', productId).update({ quantity: newQty }).exec();
      if (upd.error) throw new Error(upd.error);
    }
  });

  const processOutbound = async () => {
    if (dailyOutbound.length === 0) return alert('출고할 제품이 없습니다.');
    await handleAsync(async () => {
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toLocaleTimeString();
      for (const item of dailyOutbound) {
        const product = products.find(p => p.id === item.product_id);
        if (!product) continue;
        const newStock = Math.max(0, Number(product.stock || 0) - Number(item.quantity || 0));
        const stockResult = await supabase.from('products').eq('id', product.id).update({ stock: newStock, updated_at: new Date().toISOString() }).exec();
        if (stockResult.error) throw new Error(stockResult.error);
        const trans = await supabase.from('transactions').insert({ product_id: product.id, product_name: product.name, type: 'OUT', quantity: item.quantity, date: today, time: currentTime }).exec();
        if (trans.error) throw new Error(trans.error);
        const clr = await supabase.from('daily_outbound').eq('id', item.id).delete().exec();
        if (clr.error) console.warn('출고 목록 삭제 실패:', clr.error);
      }
    }, `${dailyOutbound.length}개 제품이 출고 처리되었습니다.`);
  };

  const processInbound = async () => {
    if (!inboundData.productId || inboundData.quantity <= 0) return alert('제품과 수량을 정확히 입력해주세요.');
    const product = products.find(p => String(p.id) === String(inboundData.productId));
    if (!product) return alert('제품을 찾을 수 없습니다.');
    await handleAsync(async () => {
      const newStock = Number(product.stock || 0) + Number(inboundData.quantity || 0);
      const stockResult = await supabase.from('products').eq('id', product.id).update({ stock: newStock, updated_at: new Date().toISOString() }).exec();
      if (stockResult.error) throw new Error(stockResult.error);
      const trans = await supabase.from('transactions').insert({ product_id: product.id, product_name: product.name, type: 'IN', quantity: Number(inboundData.quantity), date: inboundData.date, time: new Date().toLocaleTimeString() }).exec();
      if (trans.error) throw new Error(trans.error);
      setInboundData({ productId: '', quantity: 1, date: new Date().toISOString().split('T')[0] });
      setProductSearch('');
    }, `${product.name} ${inboundData.quantity}개가 입고 처리되었습니다.`);
  };

  const addNewProduct = async () => {
    if (!newProduct.barcode || !newProduct.name) return alert('바코드와 제품명을 입력해주세요.');
    if (products.some(p => p.barcode === newProduct.barcode)) return alert('이미 존재하는 바코드입니다.');
    await handleAsync(async () => {
      const result = await supabase.from('products').insert({ barcode: newProduct.barcode, name: newProduct.name, stock: Number(newProduct.stock) || 0, min_stock: Number(newProduct.minStock) || 5 }).exec();
      if (result.error) throw new Error(result.error);
      setNewProduct({ barcode: '', name: '', stock: 0, minStock: 5 });
    }, '새 제품이 추가되었습니다.');
  };

  const toggleScanner = () => {
    if (!connected) return alert('오프라인 상태에서는 스캔할 수 없습니다.');
    setScanning(!scanning);
    if (!scanning) {
      setTimeout(() => {
        if (products.length > 0) {
          const randomBarcode = products[Math.floor(Math.random() * products.length)].barcode;
          setBarcodeInput(randomBarcode);
          alert('바코드가 스캔되었습니다!');
        }
        setScanning(false);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">실시간 재고 관리</h1>
              {loading && (<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>)}
            </div>
            <div className="flex items-center gap-2">
              {connected ? (
                <div className="flex items-center gap-2 text-green-600"><Cloud className="h-4 w-4" /><Wifi className="h-3 w-3" /><span className="text-sm">Supabase 연결됨</span></div>
              ) : (
                <div className="flex items-center gap-2 text-red-600"><CloudOff className="h-4 w-4" /><span className="text-sm">연결 시도 중...</span></div>
              )}
              <span className="text-xs text-gray-500">동기화: {lastSync.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-green-50 border-l-4 border-green-400 p-4">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-green-700">🔄 <strong>실시간 공유 활성화!</strong> 5초마다 자동 동기화됩니다.</p>
        </div>
      </div>

      {!connected && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="max-w-6xl mx-auto px-4"><p className="text-yellow-700">Supabase 연결을 시도 중입니다.</p></div>
        </div>
      )}

      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'stock', label: '재고 현황', icon: Package },
              { id: 'outbound', label: '출고 관리', icon: ArrowUp },
              { id: 'inbound', label: '입고 관리', icon: ArrowDown },
              { id: 'products', label: '제품 관리', icon: Plus },
              { id: 'history', label: '입출고 이력', icon: Search }
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)} className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'stock' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-xl font-semibold text-gray-800">전체 재고 현황</h2><div className="text-sm text-gray-500">실시간 동기화 • 총 {products.length}개 제품</div></div>
            <div className="grid gap-4">
              {products.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center"><p className="text-gray-500">{loading ? '제품 데이터를 불러오고 있습니다...' : '등록된 제품이 없습니다.'}</p></div>
              ) : (
                products.map(product => (
                  <div key={product.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center">
                      <div><h3 className="font-medium text-gray-900">{product.name}</h3><p className="text-sm text-gray-500">바코드: {product.barcode}</p></div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${Number(product.stock) <= Number(product.min_stock) ? 'text-red-600' : 'text-green-600'}`}>{product.stock}개</div>
                        {Number(product.stock) <= Number(product.min_stock) && (<span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded animate-pulse">재고 부족</span>)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'outbound' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">출고 관리</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium mb-4">바코드 스캔</h3>
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <input type="text" value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') { handleBarcodeScan(barcodeInput); } }} placeholder="바코드를 입력하거나 스캔하세요" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" disabled={!connected} />
                </div>
                <button onClick={toggleScanner} disabled={!connected} className={`px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${scanning ? 'bg-red-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}><Scan className="h-4 w-4" />{scanning ? '스캔 중...' : '카메라 스캔'}</button>
                <button onClick={() => handleBarcodeScan(barcodeInput)} disabled={!connected} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">검색</button>
              </div>
              {scanning && (<div className="mt-4 p-4 bg-blue-50 rounded-lg text-center"><div className="animate-pulse">📱 데모용 자동 스캔 중...</div></div>)}
            </div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center"><h3 className="font-medium">오늘 출고 예정 목록 (실시간 공유)</h3>
                  {dailyOutbound.length > 0 && (
                    <div className="flex gap-2">
                      <button onClick={() => handleAsync(async () => { for (const item of dailyOutbound) { await supabase.from('daily_outbound').eq('id', item.id).delete().exec(); } })} disabled={!connected} className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-1 disabled:opacity-50"><Trash2 className="h-3 w-3" />목록 초기화</button>
                      <button onClick={processOutbound} disabled={!connected} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"><ArrowUp className="h-4 w-4" />출고 처리</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6">
                {dailyOutbound.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">바코드를 스캔하여 출고할 제품을 추가하세요</p>
                ) : (
                  <div className="space-y-4">
                    {dailyOutbound.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                        <div><h4 className="font-medium">{item.product_name}</h4><p className="text-sm text-gray-500">현재 재고: {item.stock}개</p></div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => adjustOutboundQuantity(item.product_id, -1)} disabled={!connected} className="p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"><Minus className="h-4 w-4" /></button>
                          <span className="text-xl font-bold min-w-[3rem] text-center">{item.quantity}</span>
                          <button onClick={() => adjustOutboundQuantity(item.product_id, 1)} disabled={!connected || Number(item.quantity) >= Number(item.stock)} className="p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"><Plus className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inbound' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">입고 관리</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium mb-4">입고 등록</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">제품 검색 (제품명 또는 바코드)</label>
                  <input type="text" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} onFocus={() => setShowProductList(filteredProducts.length > 0)} placeholder="제품명 또는 바코드를 입력하세요" disabled={!connected} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50" />
                  {showProductList && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredProducts.map(product => (
                        <button key={product.id} onClick={() => selectProduct(product)} className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:bg-blue-50 focus:outline-none">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">바코드: {product.barcode} | 현재 재고: {product.stock}개</div>
                        </button>
                      ))}
                      {filteredProducts.length === 0 && productSearch && (<div className="px-4 py-3 text-sm text-gray-500">검색 결과가 없습니다.</div>)}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">입고 수량</label>
                  <input type="number" min="1" value={inboundData.quantity} onChange={(e) => setInboundData({...inboundData, quantity: e.target.value})} disabled={!connected} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">입고 날짜</label>
                  <input type="date" value={inboundData.date} onChange={(e) => setInboundData({...inboundData, date: e.target.value})} disabled={!connected} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50" />
                </div>
                <div className="flex items-end">
                  <button onClick={processInbound} disabled={!connected} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"><Save className="h-4 w-4" />입고 처리</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">제품 관리</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium mb-4">새 제품 추가</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">바코드</label><input type="text" value={newProduct.barcode} onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})} placeholder="바코드 입력" disabled={!connected} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">제품명</label><input type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} placeholder="제품명 입력" disabled={!connected} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">초기 재고</label><input type="number" min="0" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} disabled={!connected} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">최소 재고</label><input type="number" min="0" value={newProduct.minStock} onChange={(e) => setNewProduct({...newProduct, minStock: e.target.value})} disabled={!connected} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50" /></div>
                <div className="flex items-end"><button onClick={addNewProduct} disabled={!connected} className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"><Plus className="h-4 w-4" />제품 추가</button></div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b"><h3 className="font-medium">등록된 제품 목록 (실시간 동기화)</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">바코드</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제품명</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">현재 재고</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">최소 재고</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{product.barcode}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock}개</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.min_stock}개</td>
                        <td className="px-6 py-4 whitespace-nowrap">{Number(product.stock) <= Number(product.min_stock) ? (<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">재고 부족</span>) : (<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">정상</span>)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">입출고 이력</h2>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b"><div className="flex justify-between items-center"><h3 className="font-medium">거래 내역 (실시간 업데이트)</h3><div className="text-sm text-gray-500">Supabase 동기화 • 총 {transactions.length}건</div></div></div>
              <div className="overflow-x-auto">
                {transactions.length === 0 ? (<div className="p-6 text-center text-gray-500">{loading ? '거래 내역을 불러오고 있습니다...' : '거래 내역이 없습니다.'}</div>) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜/시간</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제품명</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구분</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수량</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map(t => (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.date} {t.time}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.product_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.type === 'IN' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>{t.type === 'IN' ? '📦 입고' : '📤 출고'}</span></td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span className={t.type === 'IN' ? 'text-blue-600' : 'text-red-600'}>{t.type === 'IN' ? '+' : '-'}{t.quantity}개</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>☁️ <strong>Supabase 실시간 재고 시스템</strong></div>
            <div className="flex items-center gap-4"><span>🌐 전 세계 접속 가능</span><span>🔄 5초마다 자동 동기화</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InventoryManagementApp;


