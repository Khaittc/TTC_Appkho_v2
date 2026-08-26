import { useEffect, useState } from 'react';
import { Item, Supplier } from '../types';
import { useAuth } from '../context/AuthContext';
import { ArrowDownToLine, Search, CheckCircle2 } from 'lucide-react';
import { getDataProvider } from '../data/repositoryFactory';

export function Inbound() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  const [quantity, setQuantity] = useState<number | ''>('');
  const [supplierId, setSupplierId] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const dataProvider = getDataProvider();

  useEffect(() => {
    const unsubItems = dataProvider.getItems(setItems);
    const unsubSuppliers = dataProvider.getSuppliers(setSuppliers);
    return () => {
      unsubItems();
      unsubSuppliers();
    };
  }, []);

  const handleSubmit = async (e: import("react").FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !quantity || quantity <= 0 || !user) return;
    
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const sup = suppliers.find(s => s.id === supplierId);
      
      await dataProvider.processInbound(
        selectedItem,
        Number(quantity),
        supplierId,
        user
      );

      setSuccessMsg(`Nhập thành công ${quantity} ${selectedItem.unitName} cho vật tư ${selectedItem.name}`);
      setQuantity('');
      setSupplierId('');
      setSelectedItem(null);
      setSearchTerm('');
      
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Giao dịch thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.status === 'ACTIVE' && 
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    
    item.model.toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, 10);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
          <ArrowDownToLine className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nhập kho</h1>
          <p className="text-slate-500">Ghi nhận số lượng vật tư nhập vào kho.</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {errorMsg}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="space-y-6">
          
          {/* Step 1: Select Item */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">1. Chọn vật tư (Tìm theo Tên/SKU/Model)</label>
            {!selectedItem ? (
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Nhập để tìm kiếm..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {searchTerm && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                    {filteredItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 focus:bg-slate-50 flex justify-between items-center border-b last:border-b-0 border-slate-100"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">Model: {item.model}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-700">Tồn: {item.currentStock}</p>
                        </div>
                      </button>
                    ))}
                    {filteredItems.length === 0 && (
                      <div className="px-4 py-3 text-slate-500 text-sm">Không tìm thấy vật tư (ACTIVE).</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 border border-indigo-200 bg-indigo-50 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium text-indigo-900">{selectedItem.name}</p>
                  <p className="text-sm text-indigo-700">Model: {selectedItem.model} | Tồn kho hiện tại: {selectedItem.currentStock} {selectedItem.unitName}</p>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Đổi vật tư
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Form */}
          {selectedItem && (
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng nhập</label>
                  <div className="flex">
                    <input 
                      required 
                      type="number" 
                      min="1" 
                      value={quantity} 
                      onChange={e => setQuantity(parseInt(e.target.value) || '')} 
                      className="w-full rounded-l-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    />
                    <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">
                      {selectedItem.unitName}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nhà cung cấp</label>
                  <select 
                    value={supplierId} 
                    onChange={e => setSupplierId(e.target.value)} 
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  >
                    <option value="">Chọn nhà cung cấp (hoặc để trống)...</option>
                    {suppliers.filter(s => s.status === 'ACTIVE').map(s => (
                      <option key={s.id} value={s.id}>{s.name} {s.phone ? `- ${s.phone}` : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSubmitting || !quantity}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Xác nhận Nhập kho'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
