import React, { useState, useEffect, useMemo } from 'react';
import { Package, Search, Plus, Filter, AlertTriangle, AlertCircle, FileDown, Upload } from 'lucide-react';
import { Item, Category, Unit, Brand, Supplier } from '../types';
import { getDataProvider } from '../data/repositoryFactory';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { ItemDetailModal } from '../components/ItemDetailModal';
import { ExcelImportModal } from '../components/ExcelImportModal';

export function Items() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const provider = getDataProvider();
  const { user } = useAuth();
  const { t } = useLocale();

  useEffect(() => {
    const unsubs = [
      provider.getItems(setItems),
      provider.getCategories(setCategories),
      provider.getUnits(setUnits),
      provider.getBrands(setBrands),
      provider.getSuppliers(setSuppliers)
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  const canEditCore = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const canEditSupplier = canEditCore;

  const filteredItems = useMemo(() => {
    return items.filter(i => {
      const q = search.toLowerCase();
      const matchSearch = !q || 
         
        i.model.toLowerCase().includes(q) || 
        i.name.toLowerCase().includes(q) || 
        i.brandName.toLowerCase().includes(q) ||
        i.categoryName.toLowerCase().includes(q);
        
      const matchCat = !filterCat || i.categoryId === filterCat;
      const matchBrand = !filterBrand || i.brandId === filterBrand;
      const matchStatus = !filterStatus || i.status === filterStatus;
      
      return matchSearch && matchCat && matchBrand && matchStatus;
    });
  }, [items, search, filterCat, filterBrand, filterStatus]);

  const openNewItem = () => {
    setSelectedItem(null);
    setDrawerOpen(true);
  };

  const openEditItem = (item: Item) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('items.title')}</h1>
          <p className="text-slate-500 mt-1">{t('items.subtitle')}</p>
        </div>
        {canEditCore && (
          <div className="flex gap-2">
            <button onClick={() => setImportOpen(true)} className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium shadow-sm">
            <Upload className="w-4 h-4" />
            <span>{t('items.importExcel')}</span>
          </button>
          <button
            onClick={openNewItem}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>{t('items.addItem')}</span>
          </button>
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('items.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white">
            <option value="">{t('items.allCategories')}</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterBrand} onChange={e=>setFilterBrand(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white">
            <option value="">{t('items.allBrands')}</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white">
            <option value="">{t('common.allStatus')}</option>
            <option value="ACTIVE">{t('common.active')}</option>
            <option value="INACTIVE">{t('common.inactive')}</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr className="text-left text-sm">
                <th className="px-6 py-4 font-medium">{t('items.colCategory')}</th>
                <th className="px-6 py-4 font-medium">{t('items.colBrand')}</th>
                <th className="px-6 py-4 font-medium">{t('items.colModel')}</th>
                <th className="px-6 py-4 font-medium">{t('items.colName')}</th>
                <th className="px-6 py-4 font-medium text-right">{t('items.colStock')}</th>
                <th className="px-6 py-4 font-medium">{t('items.colUnit')}</th>
                <th className="px-6 py-4 font-medium text-center">{t('items.colStatus')}</th>
                <th className="px-6 py-4 font-medium text-center w-24">{t('items.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => {
                const isLowStock = item.currentStock <= item.safetyStock;
                return (
                  <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${item.status === 'INACTIVE' ? 'opacity-60 bg-slate-50' : ''}`}>
                    
                    <td className="px-6 py-4 font-medium text-slate-900">{item.categoryName}</td>
                    <td className="px-6 py-4">{item.brandName}</td>
                    <td className="px-6 py-4 font-medium text-indigo-900">{item.model}</td>
                    <td className="px-6 py-4 truncate max-w-[200px]" title={item.name}>{item.name}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isLowStock && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        <span className={`font-semibold ${isLowStock ? 'text-amber-600' : 'text-slate-900'}`}>
                          {item.currentStock}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{item.unitName}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                        {item.status === 'ACTIVE' ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => openEditItem(item)}
                          className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                          title={t('common.viewDetails')}
                        >
                          {t('common.viewDetails')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-10 h-10 text-slate-300 mb-3" />
                      <p className="text-base font-medium">{t('items.noItemsFound')}</p>
                      <p className="text-sm mt-1">{t('common.tryChangingFilters')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExcelImportModal isOpen={importOpen} onClose={() => setImportOpen(false)} categories={categories} brands={brands} units={units} allItems={items} />
      <ItemDetailModal 
        item={selectedItem} 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        brands={brands}
        categories={categories}
        units={units}
        suppliers={suppliers}
        allItems={items}
      />
    </div>
  );
}
