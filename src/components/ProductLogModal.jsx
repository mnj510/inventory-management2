import React, { useState, useEffect } from 'react';
import { X, Calendar, Filter } from 'lucide-react';

const ProductLogModal = ({ isOpen, onClose, product, inoutRecords }) => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filteredRecords, setFilteredRecords] = useState([]);

  // 현재 년도와 월 가져오기
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // 년도 옵션 생성 (현재 년도부터 2년 전까지)
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);
  
  // 월 옵션 생성
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    if (isOpen && product) {
      setSelectedYear(currentYear);
      setSelectedMonth(currentMonth);
    }
  }, [isOpen, product, currentYear, currentMonth]);

  useEffect(() => {
    if (selectedYear && selectedMonth && inoutRecords) {
      const filtered = inoutRecords.filter(record => {
        if (record.productName !== product?.name) return false;
        
        const recordDate = new Date(record.date);
        const recordYear = recordDate.getFullYear();
        const recordMonth = recordDate.getMonth() + 1;
        
        return recordYear === parseInt(selectedYear) && recordMonth === parseInt(selectedMonth);
      });
      
      // 날짜별로 정렬 (최신순)
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setFilteredRecords(filtered);
    }
  }, [selectedYear, selectedMonth, inoutRecords, product]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">{product.name} - 입출고 로그</h2>
            <p className="text-gray-600">바코드: {product.barcode}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 필터 */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">년도</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}년</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">월</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg"
                >
                  {months.map(month => (
                    <option key={month} value={month}>{month}월</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 로그 목록 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">선택한 기간에 입출고 기록이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map(record => (
                <div
                  key={record.id}
                  className={`p-4 rounded-lg border ${
                    record.type === '입고' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded font-medium ${
                          record.type === '입고' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {record.type}
                        </span>
                        <span className="font-medium">{record.quantity}개</span>
                      </div>
                      <p className="text-sm text-gray-600">바코드: {record.barcode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{record.date}</p>
                      <p className="text-xs text-gray-500">{record.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 요약 */}
        <div className="p-6 border-t bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">총 입고</p>
              <p className="text-lg font-bold text-green-600">
                {filteredRecords
                  .filter(r => r.type === '입고')
                  .reduce((sum, r) => sum + r.quantity, 0)}개
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">총 출고</p>
              <p className="text-lg font-bold text-red-600">
                {filteredRecords
                  .filter(r => r.type === '출고')
                  .reduce((sum, r) => sum + r.quantity, 0)}개
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductLogModal;
