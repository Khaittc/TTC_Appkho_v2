import { useEffect, useState } from 'react';
import { Item, Project } from '../types';
import { useAuth } from '../context/AuthContext';
import { ArrowUpFromLine, Search, CheckCircle2 } from 'lucide-react';
import { getDataProvider } from '../data/repositoryFactory';

export function Outbound() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  const [quantity, setQuantity] = useState<number | ''>('');
  const [projectId, setProjectId] = useState('');
  const [purpose, setPurpose] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const dataProvider = getDataProvider();

  useEffect(() => {
    const unsubItems = dataProvider.getItems(setItems);
    const unsubProjects = dataProvider.getProjects(setProjects);
    return () => {
      unsubItems();
      unsubProjects();
    };
  }, []);

  const handleSubmit = async (e: import("react").FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !quantity || quantity <= 0 || !user || !projectId) return;
    
    if (quantity > selectedItem.currentStock) {
      setErrorMsg(`Không đủ tồn kho. Tối đa: ${selectedItem.currentStock}`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const proj = projects.find(p => p.id === projectId);
      if (!proj) throw new Error('Dự án không tồn tại');

      await dataProvider.processOutbound(
        selectedItem,
        Number(quantity),
        proj.id,
        user
      );

      setSuccessMsg(`Xuất thành công ${quantity} ${selectedItem.unitName} cho dự án ${proj.name}`);
      setQuantity('');
      setProjectId('');
      setPurpose('');
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
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <ArrowUpFromLine className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Xuất kho</h1>
          <p className="text-slate-500">Ghi nhận xuất vật tư sử dụng cho dự án.</p>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng xuất</label>
                  <div className="flex">
                    <input 
                      required 
                      type="number" 
                      min="1" 
                      max={selectedItem.currentStock}
                      value={quantity} 
                      onChange={e => setQuantity(parseInt(e.target.value) || '')} 
                      className="w-full rounded-l-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    />
                    <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">
                      {selectedItem.unitName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Tối đa: {selectedItem.currentStock}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dự án sử dụng <span className="text-red-500">*</span></label>
                  <select 
                    required
                    value={projectId} 
                    onChange={e => setProjectId(e.target.value)} 
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  >
                    <option value="">Chọn dự án...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mục đích / Ghi chú</label>
                  <input 
                    type="text" 
                    value={purpose} 
                    onChange={e => setPurpose(e.target.value)} 
                    placeholder="VD: Thay thế máy bơm trạm B"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSubmitting || !quantity || !projectId || quantity > selectedItem.currentStock}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Xác nhận Xuất kho'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
