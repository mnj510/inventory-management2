import { useEffect, useMemo, useRef, useState } from "react";
import './Inventory.css';
import {
  getProducts,
  upsertProduct,
  addStock,
  getTodayShipList,
  addToTodayShipList,
  setShipItemQuantity,
  removeFromTodayShipList,
  processShipment,
} from "./inventory/storage";

function Section({ title, children }) {
  return (
    <section className="card">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export default function InventoryPage() {
  const [products, setProducts] = useState(() => getProducts());
  const [todayList, setTodayList] = useState(() => getTodayShipList());

  const [inBarcode, setInBarcode] = useState("");
  const [inName, setInName] = useState("");
  const [inQty, setInQty] = useState(1);
  const [inDate, setInDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [scanBarcode, setScanBarcode] = useState("");
  const scanInputRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      setProducts(getProducts());
      setTodayList(getTodayShipList());
    }, 400);
    return () => clearInterval(id);
  }, []);

  const handleInbound = () => {
    if (!inBarcode || !inQty) return;
    const p = upsertProduct({ barcode: inBarcode, name: inName || undefined });
    addStock(p.id, Number(inQty), new Date(inDate).toISOString());
    setProducts(getProducts());
    setInName("");
    setInQty(1);
    setInBarcode("");
  };

  useEffect(() => {
    const focus = () => scanInputRef.current?.focus();
    const id = setInterval(focus, 2000);
    window.addEventListener("click", focus);
    focus();
    return () => {
      window.removeEventListener("click", focus);
      clearInterval(id);
    };
  }, []);

  const handleScanEnter = (e) => {
    if (e.key === "Enter" && scanBarcode.trim()) {
      addToTodayShipList(scanBarcode.trim(), 1);
      setTodayList(getTodayShipList());
      setScanBarcode("");
    }
  };

  const handleScanAdd = () => {
    if (!scanBarcode.trim()) return;
    addToTodayShipList(scanBarcode.trim(), 1);
    setTodayList(getTodayShipList());
    setScanBarcode("");
  };

  const totalTodayQty = useMemo(
    () => todayList.reduce((sum, i) => sum + Number(i.quantity || 0), 0),
    [todayList]
  );

  const handleShipProcess = () => {
    processShipment();
    setProducts(getProducts());
    setTodayList([]);
  };

  const renderStockRow = (p) => (
    <tr key={p.id} className="border-t">
      <td className="py-2 px-2 font-mono text-xs text-gray-600">{p.barcode}</td>
      <td className="py-2 px-2">{p.name}</td>
      <td className="py-2 px-2 text-right tabular-nums">{p.stock}</td>
    </tr>
  );

  return (
    <div className="container">
      <h2 className="page-title">재고/출고 관리</h2>

      <div className="grid-2">
        <Section title="입고 등록">
          <div className="form-grid">
            <label className="label">
              <span className="label-title">바코드</span>
              <input
                className="input"
                value={inBarcode}
                onChange={(e) => setInBarcode(e.target.value)}
                placeholder="스캐너로 찍거나 수동 입력"
              />
            </label>
            <label className="label">
              <span className="label-title">상품명 (선택)</span>
              <input
                className="input"
                value={inName}
                onChange={(e) => setInName(e.target.value)}
                placeholder="예: 포그니 뒤꿈치 패드"
              />
            </label>
            <label className="label">
              <span className="label-title">입고 수량</span>
              <input
                type="number"
                className="input-number"
                value={inQty}
                min={1}
                onChange={(e) => setInQty(Number(e.target.value))}
              />
            </label>
            <label className="label">
              <span className="label-title">입고 날짜</span>
              <input
                type="date"
                className="input"
                value={inDate}
                onChange={(e) => setInDate(e.target.value)}
              />
            </label>
          </div>
          <div className="buttons" style={{ marginTop: 12 }}>
            <button onClick={handleInbound} className="button button-primary">
              입고 저장
            </button>
          </div>
        </Section>

        <Section title="바코드 스캔/출고 담기">
          <div className="buttons" style={{ gap: 12 }}>
            <input
              ref={scanInputRef}
              className="input"
              placeholder="바코드를 스캔하거나 수동 입력 후 Enter"
              value={scanBarcode}
              onChange={(e) => setScanBarcode(e.target.value)}
              onKeyDown={handleScanEnter}
            />
            <button onClick={handleScanAdd} className="button button-secondary">
              추가
            </button>
          </div>

          <div style={{ marginTop: 16 }}>
            <table className="table">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 px-2">상품</th>
                  <th className="py-2 px-2 text-right" style={{ width: 160 }}>수량</th>
                  <th className="py-2 px-2 w-28"></th>
                </tr>
              </thead>
              <tbody>
                {todayList.map((item) => (
                  <tr key={item.productId} className="border-t">
                    <td className="py-2 px-2">
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div className="mono">{item.barcode}</div>
                    </td>
                    <td className="py-2 px-2">
                      <div className="qty-group">
                        <button
                          className="qty-btn"
                          onClick={() => {
                            setShipItemQuantity(item.productId, Math.max(0, (item.quantity || 0) - 1));
                            setTodayList(getTodayShipList());
                          }}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className="qty-input"
                          value={item.quantity}
                          min={0}
                          onChange={(e) => {
                            setShipItemQuantity(item.productId, Number(e.target.value));
                            setTodayList(getTodayShipList());
                          }}
                        />
                        <button
                          className="qty-btn"
                          onClick={() => {
                            setShipItemQuantity(item.productId, (item.quantity || 0) + 1);
                            setTodayList(getTodayShipList());
                          }}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right">
                      <button
                        className="button button-danger"
                        onClick={() => {
                          removeFromTodayShipList(item.productId);
                          setTodayList(getTodayShipList());
                        }}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
                {todayList.length === 0 && (
                  <tr>
                    <td className="empty" colSpan={3}>
                      오늘 출고 리스트가 비어 있습니다.
                    </td>
                  </tr>
                )}
              </tbody>
              {todayList.length > 0 && (
                <tfoot>
                  <tr className="border-t">
                    <td className="py-2 px-2" style={{ fontWeight: 600 }}>합계</td>
                    <td className="py-2 px-2 text-right" style={{ fontWeight: 600 }}>{totalTodayQty}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <div className="buttons" style={{ marginTop: 16 }}>
            <button
              className="button button-primary"
              disabled={todayList.length === 0}
              onClick={handleShipProcess}
            >
              출고 처리
            </button>
          </div>
        </Section>
      </div>

      <Section title="현재 재고">
        <table className="table">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2 px-2" style={{ width: 200 }}>바코드</th>
              <th className="py-2 px-2">상품명</th>
              <th className="py-2 px-2 text-right" style={{ width: 100 }}>재고</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? products.map(renderStockRow) : (
              <tr>
                <td colSpan={3} className="empty">
                  등록된 상품이 없습니다. 먼저 입고를 등록하세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Section>
    </div>
  );
}


