import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit3, Trash2, Scan, Minus } from 'lucide-react';
import { inventoryAPI, inoutRecordsAPI, packingRecordsAPI, outgoingRecordsAPI } from '../services/api';

const InventoryTab = () => {
  const [activeInventoryTab, setActiveInventoryTab] = useState('list');
  const [activePackingTab, setActivePackingTab] = useState('packing');
  
  // 재고 데이터
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', quantity: 0, barcode: '', grossPackingQuantity: 0 });
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // 입출고 관련 상태들
  const [barcodeInput, setBarcodeInput] = useState('');
  const [inOutRecords, setInOutRecords] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [inOutType, setInOutType] = useState('입고');
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // 포장 데이터
  const [packingRecords, setPackingRecords] = useState([]);
  const [packingData, setPackingData] = useState({
    packingProduct: '',
    packingQuantity: 1,
    date: new Date().toISOString().split('T')[0]
  });
  const [packingFilteredProducts, setPackingFilteredProducts] = useState([]);
  
  // 출고 데이터
  const [outgoingRecords, setOutgoingRecords] = useState([]);
  const [outgoingData, setOutgoingData] = useState({
    outgoingProduct: '',
    outgoingQuantity: 1
  });
  const [outgoingFilteredProducts, setOutgoingFilteredProducts] = useState([]);
  const [selectedOutgoingProduct, setSelectedOutgoingProduct] = useState(null);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const [inventoryData, inOutData, packingData, outgoingData] = await Promise.all([
          inventoryAPI.getAll(),
          inoutRecordsAPI.getAll(),
          packingRecordsAPI.getAll(),
          outgoingRecordsAPI.getAll()
        ]);
        
        // NaN 방지를 위해 데이터 정규화
        const normalizedInventory = inventoryData.map(item => ({
          ...item,
          quantity: item.quantity || 0,
          grossPackingQuantity: item.grossPackingQuantity || 0
        }));
        
        setInventory(normalizedInventory);
        setInOutRecords(inOutData);
        setPackingRecords(packingData);
        setOutgoingRecords(outgoingData);
      } catch (error) {
        console.error('데이터 로드 오류:', error);
      }
    };
    loadData();
  }, []);

  // 재고 검색 필터링
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.barcode.includes(searchTerm)
  );

  // 입출고 제품 검색 및 자동 선택
  useEffect(() => {
    if (barcodeInput.trim()) {
      const filtered = inventory.filter(item =>
        item.name.toLowerCase().includes(barcodeInput.toLowerCase()) ||
        item.barcode.includes(barcodeInput)
      );
      setFilteredProducts(filtered);

      const exactMatch = inventory.find(item => item.barcode === barcodeInput.trim());
      if (exactMatch) {
        // addProductToList 함수를 직접 호출하지 않고 로직을 여기에 포함
        const existingProduct = selectedProducts.find(p => p.id === exactMatch.id);
        if (existingProduct) {
          setSelectedProducts(selectedProducts.map(p =>
            p.id === exactMatch.id 
            ? { ...p, selectedQuantity: p.selectedQuantity + 1 }
            : p
          ));
        } else {
          setSelectedProducts([...selectedProducts, { ...exactMatch, selectedQuantity: 1 }]);
        }
        setBarcodeInput('');
      }
    } else {
      setFilteredProducts([]);
    }
  }, [barcodeInput, inventory, selectedProducts]);

  // 포장 제품 검색
  useEffect(() => {
    if (packingData.packingProduct.trim()) {
      const filtered = inventory.filter(item =>
        item.name.toLowerCase().includes(packingData.packingProduct.toLowerCase()) ||
        item.barcode.includes(packingData.packingProduct)
      );
      setPackingFilteredProducts(filtered);
    } else {
      setPackingFilteredProducts([]);
    }
  }, [packingData.packingProduct, inventory]);

  // 출고 제품 검색
  useEffect(() => {
    if (outgoingData.outgoingProduct.trim()) {
      const filtered = inventory.filter(item =>
        item.name.toLowerCase().includes(outgoingData.outgoingProduct.toLowerCase()) ||
        item.barcode.includes(outgoingData.outgoingProduct)
      );
      setOutgoingFilteredProducts(filtered);
    } else {
      setOutgoingFilteredProducts([]);
      setSelectedOutgoingProduct(null);
    }
  }, [outgoingData.outgoingProduct, inventory]);

  // 재고 추가
  const addNewInventoryItem = async () => {
    if (newItem.name && newItem.barcode) {
      try {
        const itemData = {
          name: newItem.name,
          quantity: parseInt(newItem.quantity) || 0,
          barcode: newItem.barcode,
          grossPackingQuantity: parseInt(newItem.grossPackingQuantity) || 0
        };
        
        const newItemResponse = await inventoryAPI.create(itemData);
        setInventory([...inventory, newItemResponse]);
        setNewItem({ name: '', quantity: 0, barcode: '', grossPackingQuantity: 0 });
        setIsAddingNew(false);
        alert('새 상품이 추가되었습니다.');
      } catch (error) {
        console.error('재고 추가 오류:', error);
        alert('상품 추가 중 오류가 발생했습니다.');
      }
    } else {
      alert('상품명과 바코드는 필수입니다.');
    }
  };

  // 재고 수정
  const updateInventoryItem = async (id, updatedItem) => {
    try {
      const updatedItemResponse = await inventoryAPI.update(id, updatedItem);
      setInventory(inventory.map(item =>
        item.id === id ? updatedItemResponse : item
      ));
      setEditingItem(null);
      alert('상품 정보가 업데이트되었습니다.');
    } catch (error) {
      console.error('재고 수정 오류:', error);
      alert('상품 수정 중 오류가 발생했습니다.');
    }
  };

  // 재고 삭제
  const deleteInventoryItem = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await inventoryAPI.delete(id);
        setInventory(inventory.filter(item => item.id !== id));
        alert('상품이 삭제되었습니다.');
      } catch (error) {
        console.error('재고 삭제 오류:', error);
        alert('상품 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 제품 선택/추가
  const addProductToList = (product) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id);
    if (existingProduct) {
      setSelectedProducts(selectedProducts.map(p =>
        p.id === product.id 
        ? { ...p, selectedQuantity: p.selectedQuantity + 1 }
        : p
      ));
    } else {
      setSelectedProducts([...selectedProducts, { ...product, selectedQuantity: 1 }]);
    }
  };

  // 선택된 제품 수량 변경
  const updateProductQuantity = (productId, quantity) => {
    setSelectedProducts(selectedProducts.map(product =>
      product.id === productId 
      ? { ...product, selectedQuantity: Math.max(1, parseInt(quantity) || 1) }
      : product
    ));
  };

  // 선택된 제품 제거
  const removeProductFromList = (productId) => {
    setSelectedProducts(selectedProducts.filter(product => product.id !== productId));
  };

  // 입출고 처리
  const processInOut = async () => {
    if (selectedProducts.length === 0) {
      alert('처리할 제품을 선택해주세요.');
      return;
    }

    try {
      const updatedInventory = [...inventory];
      const newRecords = [];

      for (const selectedProduct of selectedProducts) {
        const inventoryIndex = updatedInventory.findIndex(item => item.id === selectedProduct.id);
        if (inventoryIndex !== -1) {
          const currentItem = updatedInventory[inventoryIndex];
          
          let updatedItem;
          if (inOutType === '입고') {
            updatedItem = {
              ...currentItem,
              quantity: currentItem.quantity + selectedProduct.selectedQuantity,
              grossPackingQuantity: currentItem.grossPackingQuantity || 0
            };
          } else {
            updatedItem = {
              ...currentItem,
              quantity: Math.max(0, currentItem.quantity - selectedProduct.selectedQuantity),
              grossPackingQuantity: currentItem.grossPackingQuantity || 0
            };
          }

          // 재고 업데이트
          try {
            await inventoryAPI.update(selectedProduct.id, updatedItem);
            updatedInventory[inventoryIndex] = updatedItem;
          } catch (updateError) {
            console.error('재고 업데이트 오류:', updateError);
            throw new Error('재고 업데이트 실패');
          }

          // 입출고 기록 생성
          try {
            const recordData = {
              productName: selectedProduct.name,
              barcode: selectedProduct.barcode,
              type: inOutType,
              quantity: selectedProduct.selectedQuantity,
              date: new Date().toLocaleDateString('ko-KR'),
              time: new Date().toLocaleTimeString('ko-KR')
            };
            
            const newRecord = await inoutRecordsAPI.create(recordData);
            newRecords.push(newRecord);
          } catch (recordError) {
            console.error('기록 생성 오류:', recordError);
            throw new Error('입출고 기록 생성 실패');
          }
        }
      }

      setInventory(updatedInventory);
      setInOutRecords([...newRecords, ...inOutRecords]);
      setSelectedProducts([]);
      
      alert(`${selectedProducts.length}개 제품의 ${inOutType} 처리가 완료되었습니다.`);
    } catch (error) {
      console.error('입출고 처리 오류:', error);
      alert(`입출고 처리 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  // 포장 기록 처리
  const addPackingRecord = async () => {
    if (packingData.packingProduct && packingData.packingQuantity > 0) {
      try {
        const packingProduct = inventory.find(item => 
          item.name === packingData.packingProduct || item.barcode === packingData.packingProduct
        );

        if (packingProduct) {
          const currentGrossQuantity = packingProduct.grossPackingQuantity || 0;
          const updatedItem = {
            ...packingProduct,
            grossPackingQuantity: currentGrossQuantity + parseInt(packingData.packingQuantity)
          };
          
          // 재고 업데이트
          await inventoryAPI.update(packingProduct.id, updatedItem);
          setInventory(inventory.map(item => 
            item.id === packingProduct.id ? updatedItem : item
          ));
        }

        const recordData = {
          packingProduct: packingData.packingProduct,
          packingQuantity: parseInt(packingData.packingQuantity),
          date: packingData.date
        };

        const newRecord = await packingRecordsAPI.create(recordData);
        setPackingRecords([newRecord, ...packingRecords]);
        setPackingData({
          packingProduct: '',
          packingQuantity: 1,
          date: new Date().toISOString().split('T')[0]
        });
        alert('포장 기록이 추가되었습니다.');
      } catch (error) {
        console.error('포장 기록 추가 오류:', error);
        alert('포장 기록 추가 중 오류가 발생했습니다.');
      }
    } else {
      alert('모든 필드를 올바르게 입력해주세요.');
    }
  };

  // 출고 처리
  const processOutgoing = async () => {
    if (!selectedOutgoingProduct || outgoingData.outgoingQuantity <= 0) {
      alert('제품을 선택하고 출고 수량을 입력해주세요.');
      return;
    }

    if (selectedOutgoingProduct.grossPackingQuantity < outgoingData.outgoingQuantity) {
      alert('그로스 포장 수량이 부족합니다.');
      return;
    }

    try {
      const currentGrossQuantity = selectedOutgoingProduct.grossPackingQuantity || 0;
      const updatedItem = {
        ...selectedOutgoingProduct,
        grossPackingQuantity: Math.max(0, currentGrossQuantity - parseInt(outgoingData.outgoingQuantity))
      };

      // 재고 업데이트
      await inventoryAPI.update(selectedOutgoingProduct.id, updatedItem);
      setInventory(inventory.map(item => 
        item.id === selectedOutgoingProduct.id ? updatedItem : item
      ));

      const recordData = {
        productName: selectedOutgoingProduct.name,
        barcode: selectedOutgoingProduct.barcode,
        outgoingQuantity: parseInt(outgoingData.outgoingQuantity),
        date: new Date().toLocaleDateString('ko-KR'),
        time: new Date().toLocaleTimeString('ko-KR')
      };

      const newRecord = await outgoingRecordsAPI.create(recordData);
      setOutgoingRecords([newRecord, ...outgoingRecords]);
      setOutgoingData({
        outgoingProduct: '',
        outgoingQuantity: 1
      });
      setSelectedOutgoingProduct(null);
      alert('출고 처리가 완료되었습니다.');
    } catch (error) {
      console.error('출고 처리 오류:', error);
      alert('출고 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 재고 관리 하위 메뉴 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveInventoryTab('list')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeInventoryTab === 'list'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            재고 리스트
          </button>
          <button
            onClick={() => setActiveInventoryTab('inout')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeInventoryTab === 'inout'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            입출고
          </button>
          <button
            onClick={() => setActiveInventoryTab('packing')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeInventoryTab === 'packing'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            그로스 포장 내용
          </button>
        </div>
      </div>

      {/* 재고 리스트 */}
      {activeInventoryTab === 'list' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Package className="w-6 h-6 text-green-600" />
              재고 리스트
            </h2>
            <button
              onClick={() => setIsAddingNew(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              상품 추가
            </button>
          </div>

          {/* 검색 */}
          <div className="mb-4">
            <div className="flex gap-2">
              <Search className="w-5 h-5 text-gray-400 mt-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="상품명 또는 바코드로 검색"
                className="flex-1 p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* 새 상품 추가 폼 */}
          {isAddingNew && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium mb-4">새 상품 추가</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="상품명"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="p-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="수량"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                  className="p-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="바코드"
                  value={newItem.barcode}
                  onChange={(e) => setNewItem({...newItem, barcode: e.target.value})}
                  className="p-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="그로스 포장 수량"
                  value={newItem.grossPackingQuantity}
                  onChange={(e) => setNewItem({...newItem, grossPackingQuantity: e.target.value})}
                  className="p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={addNewInventoryItem}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  추가
                </button>
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* 재고 목록 */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredInventory.map(item => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                {editingItem?.id === item.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="text"
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                      className="p-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      value={editingItem.quantity}
                      onChange={(e) => setEditingItem({...editingItem, quantity: parseInt(e.target.value)})}
                      className="p-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={editingItem.barcode}
                      onChange={(e) => setEditingItem({...editingItem, barcode: e.target.value})}
                      className="p-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      value={editingItem.grossPackingQuantity}
                      onChange={(e) => setEditingItem({...editingItem, grossPackingQuantity: parseInt(e.target.value)})}
                      className="p-2 border border-gray-300 rounded-lg"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => updateInventoryItem(item.id, editingItem)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{item.name}</h3>
                                        <p className="text-gray-600">재고 수량: {item.quantity || 0}개</p>
                  <p className="text-gray-600">그로스 포장 수량: {item.grossPackingQuantity || 0}개</p>
                  <p className="text-sm text-gray-500">바코드: {item.barcode}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteInventoryItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 입출고 파악 */}
      {activeInventoryTab === 'inout' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Scan className="w-5 h-5" />
            입출고 관리
          </h2>

          {/* 제품 검색 */}
          <div className="mb-4">
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="바코드 스캔 또는 제품명 입력"
              className="w-full p-2 border border-gray-300 rounded-lg"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && filteredProducts.length === 1) {
                  addProductToList(filteredProducts[0]);
                  setBarcodeInput('');
                }
              }}
            />
          </div>

          {/* 검색 결과 */}
          {filteredProducts.length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">검색 결과</h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    onClick={() => {
                      addProductToList(product);
                      setBarcodeInput('');
                    }}
                    className="p-3 border border-gray-300 rounded cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-gray-600">재고: {product.quantity}개</span>
                    </div>
                    <div className="text-sm text-gray-500">바코드: {product.barcode}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 선택된 제품 목록 */}
          {selectedProducts.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium mb-3">선택된 제품 목록 ({selectedProducts.length}개)</h3>
              <div className="space-y-3">
                {selectedProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">현재 재고: {product.quantity}개 | 바코드: {product.barcode}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateProductQuantity(product.id, product.selectedQuantity - 1)}
                          className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 flex items-center justify-center"
                          disabled={product.selectedQuantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={product.selectedQuantity}
                          onChange={(e) => updateProductQuantity(product.id, e.target.value)}
                          className="w-16 p-1 border border-gray-300 rounded text-center"
                        />
                        <button
                          onClick={() => updateProductQuantity(product.id, product.selectedQuantity + 1)}
                          className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeProductFromList(product.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="제품 제거"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 입출고 처리 */}
          {selectedProducts.length > 0 && (
            <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
              <h3 className="font-medium mb-4">입출고 처리</h3>
              <div className="flex gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">처리 구분</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setInOutType('입고')}
                      className={`px-6 py-2 rounded-lg font-medium ${
                        inOutType === '입고' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      입고
                    </button>
                    <button
                      onClick={() => setInOutType('출고')}
                      className={`px-6 py-2 rounded-lg font-medium ${
                        inOutType === '출고' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      출고
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 flex justify-end">
                  <button
                    onClick={processInOut}
                    className={`px-6 py-2 rounded-lg text-white font-medium ${
                      inOutType === '입고' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {inOutType} 처리 ({selectedProducts.length}개 제품)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 입출고 기록 */}
          <div className="space-y-2">
            <h3 className="font-medium">입출고 기록</h3>
            {inOutRecords.length === 0 ? (
              <p className="text-gray-500">아직 기록이 없습니다.</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {inOutRecords.map(record => (
                  <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{record.productName}</span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded ${
                        record.type === '입고' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                      }`}>
                        {record.type}
                      </span>
                      <span className="ml-2 text-gray-600">수량: {record.quantity}개</span>
                    </div>
                    <span className="text-sm text-gray-600">{record.date} {record.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 그로스 포장 내용 */}
      {activeInventoryTab === 'packing' && (
        <div className="space-y-6">
          {/* 포장/출고 하위 메뉴 */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setActivePackingTab('packing')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activePackingTab === 'packing'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                포장
              </button>
              <button
                onClick={() => setActivePackingTab('outgoing')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activePackingTab === 'outgoing'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                출고
              </button>
            </div>
          </div>

          {/* 포장 메뉴 */}
          {activePackingTab === 'packing' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">포장 관리</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">포장 제품명</label>
                  <input
                    type="text"
                    value={packingData.packingProduct}
                    onChange={(e) => setPackingData({...packingData, packingProduct: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="제품명 또는 바코드"
                  />
                  
                  {/* 포장 제품 검색 결과 */}
                  {packingFilteredProducts.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                      {packingFilteredProducts.map(product => (
                        <div
                          key={product.id}
                          onClick={() => setPackingData({...packingData, packingProduct: product.name})}
                          className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                        >
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.barcode}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">포장 수량</label>
                  <input
                    type="number"
                    min="1"
                    value={packingData.packingQuantity}
                    onChange={(e) => setPackingData({...packingData, packingQuantity: Math.max(1, parseInt(e.target.value) || 1)})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="포장 수량"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
                  <input
                    type="date"
                    value={packingData.date}
                    onChange={(e) => setPackingData({...packingData, date: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              
              <button
                onClick={addPackingRecord}
                className="mb-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                포장 기록 추가
              </button>

              {/* 포장 기록 목록 */}
              <div className="space-y-2">
                <h3 className="font-medium">포장 기록</h3>
                {packingRecords.length === 0 ? (
                  <p className="text-gray-500">아직 기록이 없습니다.</p>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {packingRecords.map(record => (
                      <div key={record.id} className="p-3 bg-gray-50 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p><span className="font-medium">포장 제품:</span> {record.packingProduct}</p>
                            <p><span className="font-medium">수량:</span> {record.packingQuantity}개</p>
                          </div>
                          <span className="text-sm text-gray-600">{record.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 출고 메뉴 */}
          {activePackingTab === 'outgoing' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">출고 관리</h2>
              
              {/* 출고 제품 검색 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">출고 제품명</label>
                <input
                  type="text"
                  value={outgoingData.outgoingProduct}
                  onChange={(e) => setOutgoingData({...outgoingData, outgoingProduct: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="제품명 또는 바코드 입력"
                />
              </div>

              {/* 검색 결과 */}
              {outgoingFilteredProducts.length > 0 && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">검색 결과</h3>
                  <div className="space-y-2">
                    {outgoingFilteredProducts.map(product => (
                      <div
                        key={product.id}
                        onClick={() => setSelectedOutgoingProduct(product)}
                        className={`p-3 border rounded cursor-pointer ${
                          selectedOutgoingProduct?.id === product.id 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-600">재고 수량: {product.quantity}개</div>
                        <div className="text-sm text-gray-600">그로스 포장 수량: {product.grossPackingQuantity}개</div>
                        <div className="text-sm text-gray-500">바코드: {product.barcode}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 선택된 제품 정보 및 출고 처리 */}
              {selectedOutgoingProduct && (
                <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-medium mb-3">선택된 제품 정보</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p><span className="font-medium">제품명:</span> {selectedOutgoingProduct.name}</p>
                      <p><span className="font-medium">바코드:</span> {selectedOutgoingProduct.barcode}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">재고 수량:</span> {selectedOutgoingProduct.quantity}개</p>
                      <p><span className="font-medium">그로스 포장 수량:</span> {selectedOutgoingProduct.grossPackingQuantity}개</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">출고 수량</label>
                      <input
                        type="number"
                        min="1"
                        max={selectedOutgoingProduct.grossPackingQuantity}
                        value={outgoingData.outgoingQuantity}
                        onChange={(e) => setOutgoingData({...outgoingData, outgoingQuantity: Math.max(1, parseInt(e.target.value) || 1)})}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        최대 출고 가능: {selectedOutgoingProduct.grossPackingQuantity}개
                      </p>
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        onClick={processOutgoing}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                      >
                        출고 처리
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 출고 기록 */}
              <div className="space-y-2">
                <h3 className="font-medium">출고 기록</h3>
                {outgoingRecords.length === 0 ? (
                  <p className="text-gray-500">아직 기록이 없습니다.</p>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {outgoingRecords.map(record => (
                      <div key={record.id} className="p-3 bg-gray-50 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p><span className="font-medium">출고 제품:</span> {record.productName}</p>
                            <p><span className="font-medium">출고 수량:</span> {record.outgoingQuantity}개</p>
                            <p className="text-sm text-gray-500">바코드: {record.barcode}</p>
                          </div>
                          <span className="text-sm text-gray-600">{record.date} {record.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryTab;
