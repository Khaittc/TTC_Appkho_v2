import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Save, Activity, Package, DollarSign, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { Item, Category, Unit, Brand, Supplier, ItemSupplier } from '../types';
import { getDataProvider } from '../data/repositoryFactory';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { normalizeModel, calculatePriceDifference, calculatePriceDifferencePercent } from '../domain/item/itemUtils';
import { determinePreferredSupplier, getLowestActivePrice, processPriceUpdate, setPreferredStatus } from '../domain/item/itemSupplierService';

interface ItemDetailDrawerProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  brands: Brand[];
  categories: Category[];
  units: Unit[];
  suppliers: Supplier[];
  allItems: Item[];
}

export function ItemDetailModal({ item, isOpen, onClose, brands, categories, units, suppliers, allItems }: ItemDetailDrawerProps) {
  const { user } = useAuth();
  const provider = getDataProvider();
  const { success, error } = useNotification();
  
  const [activeTab, setActiveTab] = useState<'INFO' | 'STOCK' | 'SUPPLIERS'>('INFO');
  
  // Item Form States
    const [model, setModel] = useState('');
  const [brandId, setBrandId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [manufacturerPartNumber, setManufacturerPartNumber] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [itemType, setItemType] = useState<Item['itemType']>('STANDARD');
  const [safetyStock, setSafetyStock] = useState(0);
  const [datasheetUrl, setDatasheetUrl] = useState('');
  const [technicalNote, setTechnicalNote] = useState('');
  const [status, setStatus] = useState<Item['status']>('ACTIVE');

  // Supplier Tab States
  const [itemSuppliers, setItemSuppliers] = useState<ItemSupplier[]>([]);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupId, setNewSupId] = useState('');
  const [newSupPart, setNewSupPart] = useState('');
  const [newPrice, setNewPrice] = useState<number | ''>('');
  const [newQuoteDate, setNewQuoteDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Update Price Modal
  const [editingPriceIsId, setEditingPriceIsId] = useState<string | null>(null);
  const [updatePriceValue, setUpdatePriceValue] = useState<number | ''>('');
  const [updatePriceDate, setUpdatePriceDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const isEditing = !!item;
  const canEditCore = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const canEditSupplier = canEditCore;

  useEffect(() => {
    if (isOpen) {
      if (item) {
                setModel(item.model);
        setBrandId(item.brandId);
        setName(item.name);
        setDescription(item.description || '');
        setManufacturerPartNumber(item.manufacturerPartNumber || '');
        setCategoryId(item.categoryId);
        setUnitId(item.unitId);
        setItemType(item.itemType);
        setSafetyStock(item.safetyStock);
        setDatasheetUrl(item.datasheetUrl || '');
        setTechnicalNote(item.technicalNote || '');
        setStatus(item.status);
        
        provider.getItemSuppliers(item.id, setItemSuppliers);
      } else {
        // Auto SKU
                
        setModel(''); setBrandId(''); setName(''); setDescription(''); setManufacturerPartNumber('');
        setCategoryId(''); setUnitId(''); setItemType('STANDARD'); setSafetyStock(0);
        setDatasheetUrl(''); setTechnicalNote(''); setStatus('ACTIVE');
        
        setItemSuppliers([]);
      }
      setActiveTab('INFO');
      setShowAddSupplier(false);
    }
  }, [isOpen, item, allItems]);

  if (!isOpen) return null;

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditCore) return;

    if (!model.trim() || !brandId || !name.trim() || !categoryId || !unitId) {
      error('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    const normModel = normalizeModel(model);
    
// Check duplicates
    
    const duplicateModel = allItems.find(i => i.modelNormalized === normModel && i.brandId === brandId && i.id !== item?.id);
    if (duplicateModel) {
      error('Model và Hãng này đã tồn tại trong hệ thống (kể cả Ngừng sử dụng)!'); return;
    }

    const b = brands.find(x => x.id === brandId);
    const c = categories.find(x => x.id === categoryId);
    const u = units.find(x => x.id === unitId);

    const data = {
            model: model.trim(),
      modelNormalized: normModel,
      brandId: b!.id, brandName: b!.name,
      name: name.trim(),
      description: description.trim() || undefined,
      manufacturerPartNumber: manufacturerPartNumber.trim() || undefined,
      categoryId: c!.id, categoryName: c!.name,
      unitId: u!.id, unitName: u!.name,
      itemType,
      safetyStock: Number(safetyStock) || 0,
      datasheetUrl: datasheetUrl.trim() || undefined,
      technicalNote: technicalNote.trim() || undefined,
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: user!.uid
    };

    if (isEditing) {
      await provider.updateItem(item!.id, data);
      success('Cập nhật thành công');
    } else {
      await provider.addItem({
        ...data,
        currentStock: 0,
        source: 'MANUAL',
        createdAt: new Date().toISOString(),
        createdBy: user!.uid
      });
      success('Thêm mới thành công');
      onClose();
    }
  };

  const handleAddSupplier = async () => {
    if (!canEditSupplier || !item) return;
    if (!newSupId) return;
    if (itemSuppliers.some(is => is.supplierId === newSupId)) {
      error('Nhà cung cấp này đã được thêm cho vật tư.'); return;
    }

    const nPrice = Number(newPrice);
    
    const newIs: Omit<ItemSupplier, 'id'> = {
      itemId: item.id,
      supplierId: newSupId,
      supplierPartNumber: newSupPart.trim() || undefined,
      currentPrice: nPrice > 0 ? nPrice : undefined,
      currency: 'VND',
      priceQuoteDate: nPrice > 0 && newQuoteDate ? new Date(newQuoteDate).toISOString() : undefined,
      priceUpdatedAt: nPrice > 0 ? new Date().toISOString() : undefined,
      isPreferred: determinePreferredSupplier(itemSuppliers, newSupId), // First one is preferred
      status: 'ACTIVE'
    };

    await provider.addItemSupplier(newIs);
    setShowAddSupplier(false);
    setNewSupId(''); setNewSupPart(''); setNewPrice(''); setNewQuoteDate(new Date().toISOString().split('T')[0]);
  };

  const setPreferredSupplier = async (isId: string) => {
    if (!canEditSupplier) return;
    const updates = setPreferredStatus(isId, itemSuppliers);
    for (const update of updates) {
      await provider.updateItemSupplier(update.id, update.changes);
    }
  };

  const toggleSupplierStatus = async (row: ItemSupplier) => {
    if (!canEditSupplier) return;
    await provider.updateItemSupplier(row.id, { status: row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
  };

  const submitPriceUpdate = async () => {
    if (!canEditSupplier || !editingPriceIsId) return;
    const n = Number(updatePriceValue);
    if (n <= 0) { error('Giá mới phải lớn hơn 0'); return; }

    const is = itemSuppliers.find(x => x.id === editingPriceIsId);
    if (!is) return;

    const updates = processPriceUpdate(is, n, updatePriceDate ? new Date(updatePriceDate).toISOString() : undefined);
    await provider.updateItemSupplier(editingPriceIsId, updates);

    setEditingPriceIsId(null);
    setUpdatePriceValue('');
    setUpdatePriceDate(new Date().toISOString().split('T')[0]);
  };



  // Find lowest price
  const minPrice = getLowestActivePrice(itemSuppliers);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">
            {isEditing ? `Chi tiết vật tư: ${model}` : 'Thêm vật tư mới'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-slate-200 pt-4 space-x-6">
          <button onClick={() => setActiveTab('INFO')} className={cn("pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2", activeTab === 'INFO' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}>
            <Activity className="w-4 h-4" /> Thông tin chính
          </button>
          {isEditing && (
            <>
              <button onClick={() => setActiveTab('STOCK')} className={cn("pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2", activeTab === 'STOCK' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}>
                <Package className="w-4 h-4" /> Tồn kho
              </button>
              <button onClick={() => setActiveTab('SUPPLIERS')} className={cn("pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2", activeTab === 'SUPPLIERS' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}>
                <DollarSign className="w-4 h-4" /> Nhà cung cấp & Giá
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {activeTab === 'INFO' && (
            <form id="item-form" onSubmit={handleSaveItem} className="space-y-8">
              
              <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">Thông tin định danh</h3>
                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Model (Mã NSX) <span className="text-red-500">*</span></label>
                    <input type="text" value={model} onChange={e=>setModel(e.target.value)} required disabled={!canEditCore} className="w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100 min-h-[42px]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hãng sản xuất <span className="text-red-500">*</span></label>
                    <select value={brandId} onChange={e=>setBrandId(e.target.value)} required disabled={!canEditCore} className="w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100 min-h-[42px]">
                      <option value="">-- Chọn hãng --</option>
                      {brands.filter(b => b.status === 'ACTIVE' || b.id === brandId).map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tên vật tư <span className="text-red-500">*</span></label>
                    <input type="text" value={name} onChange={e=>setName(e.target.value)} required disabled={!canEditCore} className="w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100 min-h-[42px]" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả thêm</label>
                    <textarea value={description} onChange={e=>setDescription(e.target.value)} disabled={!canEditCore} rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100 min-h-[42px]" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Manufacturer Part Number (MPN)</label>
                    <input type="text" value={manufacturerPartNumber} onChange={e=>setManufacturerPartNumber(e.target.value)} disabled={!canEditCore} className="w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100 min-h-[42px]" />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">Phân loại</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nhóm hàng <span className="text-red-500">*</span></label>
                    <select value={categoryId} onChange={e=>setCategoryId(e.target.value)} required disabled={!canEditCore} className="w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100 min-h-[42px]">
                      <option value="">-- Chọn nhóm --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Đơn vị tính <span className="text-red-500">*</span></label>
                    <select value={unitId} onChange={e=>setUnitId(e.target.value)} required disabled={!canEditCore} className="w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100 min-h-[42px]">
                      <option value="">-- Chọn ĐVT --</option>
                      {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Loại vật tư <span className="text-red-500">*</span></label>
                    <select value={itemType} onChange={e=>setItemType(e.target.value as any)} required disabled={!canEditCore} className="w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100 min-h-[42px]">
                      <option value="STANDARD">Vật tư chuẩn</option>
                      <option value="PROJECT_SPECIFIC">Vật tư đặc thù dự án</option>
                      <option value="CONSUMABLE">Vật tư tiêu hao</option>
                      <option value="SPARE_PART">Phụ tùng dự phòng</option>
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">Tồn kho & Kỹ thuật</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tồn kho an toàn (Safety Stock)</label>
                    <input type="number" min="0" value={safetyStock} onChange={e=>setSafetyStock(Number(e.target.value))} disabled={!canEditCore} className="w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100 min-h-[42px]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Datasheet URL</label>
                    <input type="url" value={datasheetUrl} onChange={e=>setDatasheetUrl(e.target.value)} disabled={!canEditCore} className="w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100 min-h-[42px]" placeholder="https://" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú kỹ thuật</label>
                    <textarea value={technicalNote} onChange={e=>setTechnicalNote(e.target.value)} disabled={!canEditCore} rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100 min-h-[42px]" />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">Trạng thái</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Trạng thái sử dụng</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="status" value="ACTIVE" checked={status === 'ACTIVE'} onChange={()=>setStatus('ACTIVE')} disabled={!canEditCore} />
                      <span className="text-sm">Đang sử dụng (ACTIVE)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="status" value="INACTIVE" checked={status === 'INACTIVE'} onChange={()=>setStatus('INACTIVE')} disabled={!canEditCore} />
                      <span className="text-sm">Ngừng sử dụng (INACTIVE)</span>
                    </label>
                  </div>
                </div>
              </section>
              
            </form>
          )}

          {activeTab === 'STOCK' && item && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Tồn kho hiện tại</p>
                  <p className="text-4xl font-bold text-slate-900 mt-1">{item.currentStock} <span className="text-lg text-slate-500 font-normal">{item.unitName}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Tồn kho an toàn</p>
                  <p className="text-2xl font-semibold text-slate-700 mt-1">{item.safetyStock}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 italic">
                * Tồn kho thực tế chỉ được thay đổi thông qua các giao dịch Nhập / Xuất kho.
              </p>
            </div>
          )}

          {activeTab === 'SUPPLIERS' && item && (
            <div className="space-y-6">
              
              {canEditSupplier && (
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800">Danh sách Nhà cung cấp</h3>
                  <button onClick={() => setShowAddSupplier(!showAddSupplier)} className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" /> Thêm NCC
                  </button>
                </div>
              )}

              {showAddSupplier && canEditSupplier && (
                <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100 flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Nhà cung cấp *</label>
                    <select value={newSupId} onChange={e=>setNewSupId(e.target.value)} className="w-full rounded-md border-slate-300 text-sm">
                      <option value="">-- Chọn NCC (Active) --</option>
                      {suppliers.filter(s => s.status === 'ACTIVE').map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-48">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Mã NCC đặt (Supplier Part)</label>
                    <input type="text" value={newSupPart} onChange={e=>setNewSupPart(e.target.value)} className="w-full rounded-md border-slate-300 text-sm" />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Giá báo (VND)</label>
                    <input type="number" min="0" value={newPrice} onChange={e=>setNewPrice(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-md border-slate-300 text-sm" />
                  </div>
                  <div className="w-36">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Ngày báo giá</label>
                    <input type="date" value={newQuoteDate} onChange={e=>setNewQuoteDate(e.target.value)} className="w-full rounded-md border-slate-300 text-sm" />
                  </div>
                  <button onClick={handleAddSupplier} disabled={!newSupId} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 h-9">
                    Thêm
                  </button>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto"><table className="w-full text-left text-sm min-w-[800px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nhà cung cấp</th>
                      <th className="px-4 py-3 font-medium">Part Number</th>
                      <th className="px-4 py-3 font-medium text-right">Giá cũ</th>
                      <th className="px-4 py-3 font-medium text-right">Giá mới (VND)</th>
                      <th className="px-4 py-3 font-medium">Ngày báo giá</th>
                      <th className="px-4 py-3 font-medium text-center">Tình trạng</th>
                      <th className="px-4 py-3 font-medium text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {itemSuppliers.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Chưa có nhà cung cấp nào</td></tr>
                    )}
                    {itemSuppliers.map(row => {
                      const sup = suppliers.find(s => s.id === row.supplierId);
                      const isLowest = row.status === 'ACTIVE' && row.currentPrice === minPrice && minPrice > 0;
                      
                      return (
                        <tr key={row.id} className={cn(row.status === 'INACTIVE' && 'opacity-60 bg-slate-50')}>
                          <td className="px-4 py-4">
                            <div className="font-medium text-slate-900 flex items-center gap-2">
                              {sup?.name || 'Unknown'}
                              {row.isPreferred && <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full font-bold">PREFERRED</span>}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-600 text-sm">
                            {row.supplierPartNumber || '--'}
                          </td>
                          <td className="px-4 py-4 text-right text-slate-500">
                            <div>{row.previousPrice ? row.previousPrice.toLocaleString('vi-VN') : '--'}</div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="font-semibold text-slate-900 flex flex-col items-end">
                              {row.currentPrice ? row.currentPrice.toLocaleString('vi-VN') : '--'}
                              {row.currentPrice && row.previousPrice && (
                                <div className={cn("text-xs mt-1 font-medium", row.currentPrice > row.previousPrice ? 'text-red-500' : 'text-green-500')}>
                                  {row.currentPrice > row.previousPrice ? '+' : ''}{calculatePriceDifferencePercent(row.currentPrice, row.previousPrice).toFixed(1)}%
                                </div>
                              )}
                            </div>
                            {isLowest && <div className="text-[10px] text-green-600 font-bold mt-1 text-right">GIÁ THẤP NHẤT</div>}
                          </td>
                          <td className="px-4 py-4">
                             <div className="font-medium text-slate-800">
                               {row.priceQuoteDate ? new Date(row.priceQuoteDate).toLocaleDateString('vi-VN') : '--'}
                             </div>
                             <div className="text-xs text-slate-400 mt-0.5">
                               Cập nhật: {row.priceUpdatedAt ? new Date(row.priceUpdatedAt).toLocaleDateString('vi-VN') : '--'}
                             </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={cn("text-xs font-medium px-2 py-1 rounded-full", row.status === 'ACTIVE' ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600")}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {canEditSupplier && (
                              <div className="flex items-center justify-center gap-3">
                                <button onClick={() => setEditingPriceIsId(row.id)} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium" disabled={row.status === 'INACTIVE'}>
                                  Cập nhật giá
                                </button>
                                {!row.isPreferred && row.status === 'ACTIVE' && (
                                  <button onClick={() => setPreferredSupplier(row.id)} className="text-slate-500 hover:text-yellow-600 text-xs font-medium">
                                    Set Preferred
                                  </button>
                                )}
                                <button onClick={() => toggleSupplierStatus(row)} className={cn("text-xs font-medium", row.status === 'ACTIVE' ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800")}>
                                  {row.status === 'ACTIVE' ? 'Khóa' : 'Mở'}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table></div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors">
            Đóng
          </button>
          {activeTab === 'INFO' && canEditCore && (
            <button form="item-form" type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm">
              <Save className="w-4 h-4" /> {isEditing ? 'Cập nhật' : 'Thêm mới'}
            </button>
          )}
        </div>
      </div>

      {/* Price Update Modal */}
      {editingPriceIsId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Cập nhật giá</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Giá mới (VND)</label>
                <input type="number" min="0" value={updatePriceValue} onChange={e=>setUpdatePriceValue(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-md border-slate-300" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ngày báo giá</label>
                <input type="date" value={updatePriceDate} onChange={e=>setUpdatePriceDate(e.target.value)} className="w-full rounded-md border-slate-300" />
              </div>
              {updatePriceValue && (() => {
                const is = itemSuppliers.find(x => x.id === editingPriceIsId);
                const curr = is?.currentPrice;
                const next = Number(updatePriceValue);
                if (curr && curr > 0) {
                  const diff = next - curr;
                  const pct = (diff / curr) * 100;
                  return (
                    <div className="bg-slate-50 p-3 rounded-lg text-sm">
                      <div className="flex justify-between mb-1"><span>Giá hiện tại:</span> <span className="font-medium">{curr.toLocaleString('vi-VN')}</span></div>
                      <div className="flex justify-between mb-1"><span>Giá mới:</span> <span className="font-medium">{next.toLocaleString('vi-VN')}</span></div>
                      <div className="flex justify-between border-t pt-1 mt-1 font-medium">
                        <span>Chênh lệch:</span> 
                        <span className={diff > 0 ? 'text-red-500' : 'text-green-500'}>
                          {diff > 0 ? '+' : ''}{diff.toLocaleString('vi-VN')} ({diff > 0 ? '+' : ''}{pct.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                );
                }
                return null;
              })()}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setEditingPriceIsId(null); setUpdatePriceValue(''); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium">Hủy</button>
              <button onClick={submitPriceUpdate} disabled={!updatePriceValue} className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium disabled:opacity-50">Lưu giá</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
