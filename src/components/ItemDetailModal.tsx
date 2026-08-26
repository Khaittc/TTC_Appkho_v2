import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Save, Activity, Package, DollarSign, Check, Trash2, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';
import { Item, Category, Unit, Brand, Supplier, ItemSupplier } from '../types';
import { getDataProvider } from '../data/repositoryFactory';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLocale } from '../context/LocaleContext';
import { normalizeModel, calculatePriceDifference, calculatePriceDifferencePercent } from '../domain/item/itemUtils';
import { determinePreferredSupplier, getLowestActivePrice, processPriceUpdate, setPreferredStatus } from '../domain/item/itemSupplierService';

export type ItemModalMode = 'VIEW' | 'EDIT' | 'CREATE';

interface ItemDetailDrawerProps {
  item: Item | null;
  mode: ItemModalMode;
  isOpen: boolean;
  onClose: () => void;
  brands: Brand[];
  categories: Category[];
  units: Unit[];
  suppliers: Supplier[];
  allItems: Item[];
}

export function ItemDetailModal({ item, mode, isOpen, onClose, brands, categories, units, suppliers, allItems }: ItemDetailDrawerProps) {
  const { user } = useAuth();
  const provider = getDataProvider();
  const { success, error } = useNotification();
  const { locale, t } = useLocale();
  
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

  const canEditCore = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const canEditSupplier = canEditCore;

  const numberLocale = locale === 'vi' ? 'vi-VN' : 'en-US';

  // Effect A: Modal / Item initialization
  useEffect(() => {
    if (!isOpen) return;

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
    } else {
      setModel('');
      setBrandId('');
      setName('');
      setDescription('');
      setManufacturerPartNumber('');
      setCategoryId('');
      setUnitId('');
      setItemType('STANDARD');
      setSafetyStock(0);
      setDatasheetUrl('');
      setTechnicalNote('');
      setStatus('ACTIVE');
    }

    setActiveTab('INFO');
    setShowAddSupplier(false);
  }, [isOpen, item?.id, mode]);

  // Effect B: Item Supplier Subscription
  useEffect(() => {
    if (!isOpen || !item?.id) {
      setItemSuppliers([]);
      return;
    }

    const unsubscribe = provider.getItemSuppliers(item.id, setItemSuppliers);
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [isOpen, item?.id]);

  if (!isOpen) return null;

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditCore || mode === 'VIEW') return;

    if (!model.trim() || !brandId || !name.trim() || !categoryId || !unitId) {
      error(locale === 'vi' ? 'Vui lòng điền đầy đủ các trường bắt buộc' : 'Please fill in all required fields');
      return;
    }

    const normModel = normalizeModel(model);
    
    // Check duplicates
    const duplicateModel = allItems.find(i => i.modelNormalized === normModel && i.brandId === brandId && i.id !== item?.id);
    if (duplicateModel) {
      error(locale === 'vi' ? 'Model và Hãng này đã tồn tại trong hệ thống (kể cả Ngừng sử dụng)!' : 'This Model and Brand already exist in the system (including Inactive)!');
      return;
    }

    const b = brands.find(x => x.id === brandId);
    const c = categories.find(x => x.id === categoryId);
    const u = units.find(x => x.id === unitId);

    const data = {
      model: model.trim(),
      modelNormalized: normModel,
      brandId: b!.id,
      brandName: b!.name,
      name: name.trim(),
      description: description.trim() || undefined,
      manufacturerPartNumber: manufacturerPartNumber.trim() || undefined,
      categoryId: c!.id,
      categoryName: c!.name,
      unitId: u!.id,
      unitName: u!.name,
      itemType,
      safetyStock: Number(safetyStock) || 0,
      datasheetUrl: datasheetUrl.trim() || undefined,
      technicalNote: technicalNote.trim() || undefined,
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: user!.uid
    };

    if (mode === 'EDIT' && item) {
      await provider.updateItem(item.id, data);
      success(locale === 'vi' ? 'Cập nhật thành công' : 'Updated successfully');
    } else if (mode === 'CREATE') {
      await provider.addItem({
        ...data,
        currentStock: 0,
        source: 'MANUAL',
        createdAt: new Date().toISOString(),
        createdBy: user!.uid
      });
      success(locale === 'vi' ? 'Thêm mới thành công' : 'Added successfully');
      onClose();
    }
  };

  const handleAddSupplier = async () => {
    if (!canEditSupplier || !item || mode !== 'EDIT') return;
    if (!newSupId) return;
    if (itemSuppliers.some(is => is.supplierId === newSupId)) {
      error(locale === 'vi' ? 'Nhà cung cấp này đã được thêm cho vật tư.' : 'This supplier has already been added for this item.');
      return;
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
      isPreferred: determinePreferredSupplier(itemSuppliers, newSupId),
      status: 'ACTIVE'
    };

    await provider.addItemSupplier(newIs);
    setShowAddSupplier(false);
    setNewSupId('');
    setNewSupPart('');
    setNewPrice('');
    setNewQuoteDate(new Date().toISOString().split('T')[0]);
  };

  const setPreferredSupplier = async (isId: string) => {
    if (!canEditSupplier || mode !== 'EDIT') return;
    const updates = setPreferredStatus(isId, itemSuppliers);
    for (const update of updates) {
      await provider.updateItemSupplier(update.id, update.changes);
    }
  };

  const toggleSupplierStatus = async (row: ItemSupplier) => {
    if (!canEditSupplier || mode !== 'EDIT') return;
    await provider.updateItemSupplier(row.id, { status: row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
  };

  const submitPriceUpdate = async () => {
    if (!canEditSupplier || !editingPriceIsId || mode !== 'EDIT') return;
    const n = Number(updatePriceValue);
    if (n <= 0) {
      error(locale === 'vi' ? 'Giá mới phải lớn hơn 0' : 'New price must be greater than 0');
      return;
    }

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

  const getItemTypeLabel = (type: Item['itemType']) => {
    switch (type) {
      case 'STANDARD': return t('itemDetail.typeStandard');
      case 'PROJECT_SPECIFIC': return t('itemDetail.typeProject');
      case 'CONSUMABLE': return t('itemDetail.typeConsumable');
      case 'SPARE_PART': return t('itemDetail.typeSparePart');
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <h2 className="text-lg font-bold text-slate-900">
            {mode === 'VIEW' 
              ? t('itemDetail.titleView', { model: item?.model || model })
              : mode === 'EDIT' 
                ? t('itemDetail.titleEdit', { model: item?.model || model })
                : t('itemDetail.titleNew')}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title={t('common.close')}
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-slate-200 pt-3 space-x-6 shrink-0 bg-white">
          <button 
            onClick={() => setActiveTab('INFO')} 
            className={cn("pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2", activeTab === 'INFO' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}
          >
            <Activity className="w-4 h-4" /> {t('itemDetail.tabInfo')}
          </button>
          {mode !== 'CREATE' && (
            <>
              <button 
                onClick={() => setActiveTab('STOCK')} 
                className={cn("pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2", activeTab === 'STOCK' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}
              >
                <Package className="w-4 h-4" /> {t('itemDetail.tabStock')}
              </button>
              <button 
                onClick={() => setActiveTab('SUPPLIERS')} 
                className={cn("pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2", activeTab === 'SUPPLIERS' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}
              >
                <DollarSign className="w-4 h-4" /> {t('itemDetail.tabSuppliers')}
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {activeTab === 'INFO' && (
            mode === 'VIEW' && item ? (
              <div className="space-y-4">
                {/* Section Identity */}
                <section className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">
                    {t('itemDetail.sectionIdentity')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <p className="text-xs font-medium text-slate-500">{t('itemDetail.model')}</p>
                      <p className="text-sm font-semibold text-indigo-800 break-words mt-0.5">{item.model}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">{t('itemDetail.brand')}</p>
                      <p className="text-sm font-medium text-slate-900 break-words mt-0.5">{item.brandName || '--'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">{t('itemDetail.name')}</p>
                      <p className="text-sm font-medium text-slate-900 break-words mt-0.5">{item.name || '--'}</p>
                    </div>
                    {Boolean(item.manufacturerPartNumber?.trim()) && (
                      <div>
                        <p className="text-xs font-medium text-slate-500">{t('itemDetail.mpn')}</p>
                        <p className="text-sm font-medium text-slate-900 break-words mt-0.5">{item.manufacturerPartNumber}</p>
                      </div>
                    )}
                    <div className="col-span-1 md:col-span-2">
                      <p className="text-xs font-medium text-slate-500">{t('itemDetail.description')}</p>
                      <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap break-words mt-0.5">{item.description || '--'}</p>
                    </div>
                  </div>
                </section>

                {/* Section Classification */}
                <section className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">
                    {t('itemDetail.sectionClassification')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3">
                    <div>
                      <p className="text-xs font-medium text-slate-500">{t('itemDetail.category')}</p>
                      <p className="text-sm font-medium text-slate-900 break-words mt-0.5">{item.categoryName || '--'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">{t('itemDetail.unit')}</p>
                      <p className="text-sm font-medium text-slate-900 break-words mt-0.5">{item.unitName || '--'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">{t('itemDetail.type')}</p>
                      <p className="text-sm font-medium text-slate-900 break-words mt-0.5">{getItemTypeLabel(item.itemType) || '--'}</p>
                    </div>
                  </div>
                </section>

                {/* Section Stock & Tech */}
                <section className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">
                    {t('itemDetail.sectionStockTech')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <p className="text-xs font-medium text-slate-500">{t('itemDetail.safetyStock')}</p>
                      <p className="text-sm font-medium text-slate-900 mt-0.5">{item.safetyStock !== undefined && item.safetyStock !== null ? item.safetyStock : '--'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">{t('itemDetail.datasheetUrl')}</p>
                      {item.datasheetUrl ? (
                        <a 
                          href={item.datasheetUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          title={item.datasheetUrl}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline transition-colors mt-0.5"
                        >
                          <span className="truncate max-w-[200px] sm:max-w-none">{t('itemDetail.openDocument')}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-slate-900 mt-0.5">--</p>
                      )}
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <p className="text-xs font-medium text-slate-500">{t('itemDetail.technicalNote')}</p>
                      <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap break-words mt-0.5">{item.technicalNote || '--'}</p>
                    </div>
                  </div>
                </section>

                {/* Section Status */}
                <section className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">
                    {t('itemDetail.sectionStatus')}
                  </h3>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1.5">{t('itemDetail.statusUsage')}</p>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      item.status === 'ACTIVE' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                    )}>
                      {item.status === 'ACTIVE' ? t('itemDetail.statusActive') : t('itemDetail.statusInactive')}
                    </span>
                  </div>
                </section>
              </div>
            ) : (
              <form id="item-form" onSubmit={handleSaveItem} className="space-y-6">
                <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                    {t('itemDetail.sectionIdentity')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t('itemDetail.model')} <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={model} 
                        onChange={e=>setModel(e.target.value)} 
                        required 
                        disabled={!canEditCore} 
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed min-h-[40px] transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t('itemDetail.brand')} <span className="text-red-500">*</span>
                      </label>
                      <select 
                        value={brandId} 
                        onChange={e=>setBrandId(e.target.value)} 
                        required 
                        disabled={!canEditCore} 
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed min-h-[40px] transition-colors"
                      >
                        <option value="">{t('itemDetail.selectBrand')}</option>
                        {brands.filter(b => b.status === 'ACTIVE' || b.id === brandId).map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t('itemDetail.name')} <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={e=>setName(e.target.value)} 
                        required 
                        disabled={!canEditCore} 
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed min-h-[40px] transition-colors" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t('itemDetail.description')}
                      </label>
                      <textarea 
                        value={description} 
                        onChange={e=>setDescription(e.target.value)} 
                        disabled={!canEditCore} 
                        rows={2} 
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t('itemDetail.mpn')}
                      </label>
                      <input 
                        type="text" 
                        value={manufacturerPartNumber} 
                        onChange={e=>setManufacturerPartNumber(e.target.value)} 
                        disabled={!canEditCore} 
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed min-h-[40px] transition-colors" 
                      />
                    </div>
                  </div>
                </section>

                <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                    {t('itemDetail.sectionClassification')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t('itemDetail.category')} <span className="text-red-500">*</span>
                      </label>
                      <select 
                        value={categoryId} 
                        onChange={e=>setCategoryId(e.target.value)} 
                        required 
                        disabled={!canEditCore} 
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed min-h-[40px] transition-colors"
                      >
                        <option value="">{t('itemDetail.selectCategory')}</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t('itemDetail.unit')} <span className="text-red-500">*</span>
                      </label>
                      <select 
                        value={unitId} 
                        onChange={e=>setUnitId(e.target.value)} 
                        required 
                        disabled={!canEditCore} 
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed min-h-[40px] transition-colors"
                      >
                        <option value="">{t('itemDetail.selectUnit')}</option>
                        {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t('itemDetail.type')} <span className="text-red-500">*</span>
                      </label>
                      <select 
                        value={itemType} 
                        onChange={e=>setItemType(e.target.value as any)} 
                        required 
                        disabled={!canEditCore} 
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed min-h-[40px] transition-colors"
                      >
                        <option value="STANDARD">{t('itemDetail.typeStandard')}</option>
                        <option value="PROJECT_SPECIFIC">{t('itemDetail.typeProject')}</option>
                        <option value="CONSUMABLE">{t('itemDetail.typeConsumable')}</option>
                        <option value="SPARE_PART">{t('itemDetail.typeSparePart')}</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                    {t('itemDetail.sectionStockTech')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t('itemDetail.safetyStock')}
                      </label>
                      <input 
                        type="number" 
                        min="0" 
                        value={safetyStock} 
                        onChange={e=>setSafetyStock(Number(e.target.value))} 
                        disabled={!canEditCore} 
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed min-h-[40px] transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t('itemDetail.datasheetUrl')}
                      </label>
                      <input 
                        type="url" 
                        value={datasheetUrl} 
                        onChange={e=>setDatasheetUrl(e.target.value)} 
                        disabled={!canEditCore} 
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed min-h-[40px] transition-colors" 
                        placeholder="https://" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t('itemDetail.technicalNote')}
                      </label>
                      <textarea 
                        value={technicalNote} 
                        onChange={e=>setTechnicalNote(e.target.value)} 
                        disabled={!canEditCore} 
                        rows={2} 
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors" 
                      />
                    </div>
                  </div>
                </section>

                <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                    {t('itemDetail.sectionStatus')}
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('itemDetail.statusUsage')}
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="status" 
                          value="ACTIVE" 
                          checked={status === 'ACTIVE'} 
                          onChange={()=>setStatus('ACTIVE')} 
                          disabled={!canEditCore} 
                          className="text-indigo-600 focus:ring-indigo-500" 
                        />
                        <span className="text-sm font-medium text-slate-700">{t('common.active')}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="status" 
                          value="INACTIVE" 
                          checked={status === 'INACTIVE'} 
                          onChange={()=>setStatus('INACTIVE')} 
                          disabled={!canEditCore} 
                          className="text-indigo-600 focus:ring-indigo-500" 
                        />
                        <span className="text-sm font-medium text-slate-700">{t('common.inactive')}</span>
                      </label>
                    </div>
                  </div>
                </section>
              </form>
            )
          )}

          {activeTab === 'STOCK' && item && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{t('itemDetail.currentStock')}</p>
                  <p className="text-4xl font-bold text-slate-900 mt-1">{item.currentStock} <span className="text-lg text-slate-500 font-normal">{item.unitName}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{t('itemDetail.safetyStockLevel')}</p>
                  <p className="text-2xl font-semibold text-slate-700 mt-1">{item.safetyStock}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 italic">
                {t('itemDetail.stockNote')}
              </p>
            </div>
          )}

          {activeTab === 'SUPPLIERS' && item && (
            <div className="space-y-6">
              
              {mode === 'EDIT' && canEditSupplier && (
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800">{t('suppliers.listTitle')}</h3>
                  <button 
                    onClick={() => setShowAddSupplier(!showAddSupplier)} 
                    className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" /> {t('suppliers.addSupplier')}
                  </button>
                </div>
              )}

              {mode === 'EDIT' && showAddSupplier && canEditSupplier && (
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-slate-700 mb-1">{t('suppliers.supplier')} <span className="text-red-500">*</span></label>
                    <select value={newSupId} onChange={e=>setNewSupId(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors">
                      <option value="">{t('suppliers.selectSupplierActive')}</option>
                      {suppliers.filter(s => s.status === 'ACTIVE').map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-48">
                    <label className="block text-xs font-medium text-slate-700 mb-1">{t('suppliers.supplierPartNumber')}</label>
                    <input type="text" value={newSupPart} onChange={e=>setNewSupPart(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors" />
                  </div>
                  <div className="w-36">
                    <label className="block text-xs font-medium text-slate-700 mb-1">{t('suppliers.currentPriceVnd')}</label>
                    <input type="number" min="0" value={newPrice} onChange={e=>setNewPrice(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors" />
                  </div>
                  <div className="w-36">
                    <label className="block text-xs font-medium text-slate-700 mb-1">{t('suppliers.quoteDate')}</label>
                    <input type="date" value={newQuoteDate} onChange={e=>setNewQuoteDate(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors" />
                  </div>
                  <button onClick={handleAddSupplier} disabled={!newSupId} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 h-[38px] transition-colors">
                    {t('common.add')}
                  </button>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[720px]">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">{t('suppliers.supplier')}</th>
                        <th className="px-4 py-3 font-medium">{t('suppliers.partNumber')}</th>
                        <th className="px-4 py-3 font-medium text-right">{t('suppliers.previousPrice')}</th>
                        <th className="px-4 py-3 font-medium text-right">{t('suppliers.currentPriceVnd')}</th>
                        <th className="px-4 py-3 font-medium">{t('suppliers.quoteDate')}</th>
                        {mode === 'EDIT' && (
                          <th className="px-4 py-3 font-medium text-center">{t('suppliers.actions')}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {itemSuppliers.length === 0 && (
                        <tr>
                          <td colSpan={mode === 'EDIT' ? 6 : 5} className="px-4 py-8 text-center text-slate-500">
                            {t('suppliers.noSuppliers')}
                          </td>
                        </tr>
                      )}
                      {itemSuppliers.map(row => {
                        const sup = suppliers.find(s => s.id === row.supplierId);
                        const isLowest = row.status === 'ACTIVE' && row.currentPrice === minPrice && minPrice > 0;
                        
                        return (
                          <tr key={row.id} className={cn(row.status === 'INACTIVE' && 'bg-slate-50/60')}>
                            <td className="px-4 py-4">
                              <div className="font-medium text-slate-900 flex items-center gap-2">
                                {sup?.name || 'Unknown'}
                                {row.isPreferred && (
                                  <span className="bg-amber-100 text-amber-700 rounded-full text-[10px] font-semibold px-2 py-0.5">
                                    {t('suppliers.preferredBadge')}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-slate-600 text-sm">
                              {row.supplierPartNumber || '--'}
                            </td>
                            <td className="px-4 py-4 text-right text-slate-500">
                              <div>{row.previousPrice ? row.previousPrice.toLocaleString(numberLocale) : '--'}</div>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="font-semibold text-slate-900 flex flex-col items-end">
                                {row.currentPrice ? row.currentPrice.toLocaleString(numberLocale) : '--'}
                                {row.currentPrice && row.previousPrice && (
                                  <div className={cn("text-xs mt-1 font-medium", row.currentPrice > row.previousPrice ? 'text-red-500' : 'text-green-500')}>
                                    {row.currentPrice > row.previousPrice ? '+' : ''}{calculatePriceDifferencePercent(row.currentPrice, row.previousPrice).toFixed(1)}%
                                  </div>
                                )}
                              </div>
                              {isLowest && <div className="text-[10px] text-green-600 font-semibold mt-1 text-right">{t('suppliers.lowestPriceBadge')}</div>}
                            </td>
                            <td className="px-4 py-4">
                               <div className="font-medium text-slate-800">
                                 {row.priceQuoteDate ? new Date(row.priceQuoteDate).toLocaleDateString(numberLocale) : '--'}
                               </div>
                                <div className="text-xs text-slate-400 mt-0.5">
                                 {t('suppliers.updatedAt')}: {row.priceUpdatedAt ? new Date(row.priceUpdatedAt).toLocaleDateString(numberLocale) : '--'}
                               </div>
                            </td>
                            {mode === 'EDIT' && (
                              <td className="px-4 py-4">
                                {canEditSupplier ? (
                                  <div className="flex items-center justify-center gap-1.5 min-w-[320px]">
                                    <button 
                                      onClick={() => setEditingPriceIsId(row.id)} 
                                      disabled={row.status === 'INACTIVE'}
                                      className={cn(
                                        "h-8 px-2.5 rounded-md text-xs font-medium whitespace-nowrap flex items-center justify-center transition-colors",
                                        row.status === 'ACTIVE'
                                          ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                                          : "opacity-40 cursor-not-allowed bg-slate-100 text-slate-400"
                                      )}
                                    >
                                      {t('suppliers.updatePrice')}
                                    </button>
                                    <button 
                                      onClick={() => setPreferredSupplier(row.id)} 
                                      disabled={row.isPreferred || row.status === 'INACTIVE'}
                                      className={cn(
                                        "h-8 px-2.5 rounded-md text-xs font-medium whitespace-nowrap flex items-center justify-center transition-colors",
                                        (!row.isPreferred && row.status === 'ACTIVE')
                                          ? "text-amber-700 bg-amber-50 hover:bg-amber-100"
                                          : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"
                                      )}
                                    >
                                      {t('suppliers.setPreferred')}
                                    </button>
                                    <button 
                                      onClick={() => toggleSupplierStatus(row)} 
                                      className={cn(
                                        "h-8 px-2.5 rounded-md text-xs font-medium whitespace-nowrap flex items-center justify-center transition-colors", 
                                        row.status === 'ACTIVE' 
                                          ? "text-red-600 bg-red-50 hover:bg-red-100" 
                                          : "text-green-700 bg-green-50 hover:bg-green-100"
                                      )}
                                    >
                                      {row.status === 'ACTIVE' ? t('suppliers.lock') : t('suppliers.unlock')}
                                    </button>
                                    <button 
                                      disabled
                                      className="h-8 w-8 rounded-md text-slate-300 cursor-not-allowed opacity-60 flex items-center justify-center transition-colors"
                                      title={t('suppliers.removeFromItemTooltip')}
                                      aria-label={t('suppliers.removeFromItemTooltip')}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-xs text-slate-400 text-center">--</div>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-2 shrink-0">
          {mode === 'VIEW' ? (
            <button 
              type="button"
              onClick={onClose} 
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
            >
              {t('common.close')}
            </button>
          ) : mode === 'EDIT' ? (
            <>
              {activeTab === 'INFO' ? (
                <>
                  <button 
                    type="button"
                    onClick={onClose} 
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  {canEditCore && (
                    <button 
                      form="item-form" 
                      type="submit" 
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-xs"
                    >
                      <Save className="w-4 h-4" /> {t('common.saveChanges')}
                    </button>
                  )}
                </>
              ) : (
                <button 
                  type="button"
                  onClick={onClose} 
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                >
                  {t('common.close')}
                </button>
              )}
            </>
          ) : (
            <>
              <button 
                type="button"
                onClick={onClose} 
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
              >
                {t('common.cancel')}
              </button>
              {canEditCore && (
                <button 
                  form="item-form" 
                  type="submit" 
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" /> {t('items.addItem')}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Price Update Modal */}
      {editingPriceIsId && mode === 'EDIT' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-200">
            <h3 className="text-base font-semibold text-slate-900 mb-4">{t('priceModal.title')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('priceModal.newPriceVnd')} <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  min="0" 
                  value={updatePriceValue} 
                  onChange={e=>setUpdatePriceValue(e.target.value ? Number(e.target.value) : '')} 
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors" 
                  autoFocus 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('priceModal.quoteDate')} <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  value={updatePriceDate} 
                  onChange={e=>setUpdatePriceDate(e.target.value)} 
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors" 
                />
              </div>
              {updatePriceValue && (() => {
                const is = itemSuppliers.find(x => x.id === editingPriceIsId);
                const curr = is?.currentPrice;
                const next = Number(updatePriceValue);
                if (curr && curr > 0) {
                  const diff = next - curr;
                  const pct = (diff / curr) * 100;
                  return (
                    <div className="bg-slate-50 p-3 rounded-lg text-sm border border-slate-200">
                      <div className="flex justify-between mb-1 text-slate-600"><span>{t('priceModal.currentPrice')}:</span> <span className="font-medium text-slate-900">{curr.toLocaleString(numberLocale)}</span></div>
                      <div className="flex justify-between mb-1 text-slate-600"><span>{t('priceModal.newPrice')}:</span> <span className="font-medium text-slate-900">{next.toLocaleString(numberLocale)}</span></div>
                      <div className="flex justify-between border-t border-slate-200 pt-1 mt-1 font-medium">
                        <span className="text-slate-700">{t('priceModal.difference')}:</span> 
                        <span className={diff > 0 ? 'text-red-500' : 'text-green-500'}>
                          {diff > 0 ? '+' : ''}{diff.toLocaleString(numberLocale)} ({diff > 0 ? '+' : ''}{pct.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => { setEditingPriceIsId(null); setUpdatePriceValue(''); }} 
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button 
                type="button"
                onClick={submitPriceUpdate} 
                disabled={!updatePriceValue} 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {t('priceModal.savePrice')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

