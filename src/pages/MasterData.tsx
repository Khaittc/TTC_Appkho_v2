import React, { useState, useEffect } from 'react';
import { ListTree, Users, Tags, FileText, Plus, Trash2, FolderKanban, Pencil, Briefcase, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { Category, Unit, Supplier, Project, Brand, Item } from '../types';
import { getDataProvider } from '../data/repositoryFactory';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { normalizeBrandName } from '../domain/item/itemUtils';

type TabType = 'CATEGORIES' | 'UNITS' | 'BRANDS' | 'SUPPLIERS' | 'PROJECTS';

export function MasterData() {
  const [activeTab, setActiveTab] = useState<TabType>('CATEGORIES');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const provider = getDataProvider();
  const { user } = useAuth();
  const { success, error, warning } = useNotification();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  // Form states
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  
  const [unitName, setUnitName] = useState('');

  const [brandCode, setBrandCode] = useState('');
  const [brandName, setBrandName] = useState('');
  const [brandAliases, setBrandAliases] = useState('');

  const [supCode, setSupCode] = useState('');
  const [supName, setSupName] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supZalo, setSupZalo] = useState('');
  const [supTaxCode, setSupTaxCode] = useState('');
  const [supNote, setSupNote] = useState('');
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [projCode, setProjCode] = useState('');
  const [projName, setProjName] = useState('');

  useEffect(() => {
    const unsubs = [
      provider.getCategories(setCategories),
      provider.getUnits(setUnits),
      provider.getBrands(setBrands),
      provider.getSuppliers(setSuppliers),
      provider.getProjects(setProjects),
      provider.getItems(setItems),
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  const resetForms = () => {
    setCatName(''); setCatDesc('');
    setUnitName('');
    setBrandCode(''); setBrandName(''); setBrandAliases('');
    setSupCode(''); setSupName(''); setSupPhone(''); setSupEmail(''); setSupAddress(''); setSupZalo(''); setSupTaxCode(''); setSupNote('');
    setProjCode(''); setProjName('');
    setShowForm(false);
    setEditingBrand(null);
    setEditingSupplier(null);
    setEditingProject(null);
  };

  const checkCategoryUsed = (id: string) => items.some(i => i.categoryId === id);
  const checkUnitUsed = (id: string) => items.some(i => i.unitId === id);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    if (categories.some(c => c.name.toLowerCase() === catName.trim().toLowerCase())) {
      error('Nhóm hàng đã tồn tại');
      return;
    }
    setIsSubmitting(true);
    await provider.addCategory({ name: catName.trim(), description: catDesc.trim() });
    setIsSubmitting(false);
    resetForms();
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim()) return;
    if (units.some(u => u.name.toLowerCase() === unitName.trim().toLowerCase())) {
      error('Đơn vị đã tồn tại');
      return;
    }
    setIsSubmitting(true);
    await provider.addUnit({ name: unitName.trim() });
    setIsSubmitting(false);
    resetForms();
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandCode.trim() || !brandName.trim()) return;
    if (brands.some(b => b.code.toLowerCase() === brandCode.trim().toLowerCase() && (!editingBrand || b.id !== editingBrand.id))) {
      error('Mã hãng đã tồn tại');
      return;
    }
    if (brands.some(b => b.name.toLowerCase() === brandName.trim().toLowerCase() && (!editingBrand || b.id !== editingBrand.id))) {
      error('Tên hãng đã tồn tại');
      return;
    }
    setIsSubmitting(true);
    const rawAliases = brandAliases.split(',').map(s => s.trim()).filter(Boolean);
    const seen = new Set();
    const aliases: string[] = [];
    for (const a of rawAliases) {
      const lower = a.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        aliases.push(a);
      }
    }
    if (editingBrand) {
      await provider.updateBrand(editingBrand.id, {
        code: brandCode.trim().toUpperCase(),
        name: brandName.trim(),
        normalizedName: normalizeBrandName(brandName),
        aliases
      });
    } else {
      await provider.addBrand({
      code: brandCode.trim().toUpperCase(),
      name: brandName.trim(),
      normalizedName: normalizeBrandName(brandName),
      aliases,
      status: 'ACTIVE'
      });
    }
    success('Cập nhật hãng sản xuất thành công.');
    setIsSubmitting(false);
    resetForms();
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supCode.trim() || !supName.trim()) return;
    if (suppliers.some(s => s.code.toLowerCase() === supCode.trim().toLowerCase() && (!editingSupplier || s.id !== editingSupplier.id))) {
      error('Mã NCC đã tồn tại');
      return;
    }
    setIsSubmitting(true);
    if (editingSupplier) {
      await provider.updateSupplier(editingSupplier.id, {
        code: supCode.trim().toUpperCase(),
        name: supName.trim(),
        phone: supPhone.trim(),
        email: supEmail.trim(),
        address: supAddress.trim(),
        zalo: supZalo.trim(),
        taxCode: supTaxCode.trim(),
        note: supNote.trim()
      });
    } else {
      await provider.addSupplier({
      code: supCode.trim().toUpperCase(),
      name: supName.trim(),
      phone: supPhone.trim(),
      email: supEmail.trim(),
      address: supAddress.trim(),
      zalo: supZalo.trim(),
      taxCode: supTaxCode.trim(),
      note: supNote.trim(),
      status: 'ACTIVE'
      });
    }
    success('Cập nhật nhà cung cấp thành công.');
    setIsSubmitting(false);
    resetForms();
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = projCode.trim();
    const n = projName.trim();
    if (!c) { error('Mã dự án là bắt buộc.'); return; }
    if (!n) { error('Tên dự án là bắt buộc.'); return; }
    
    // Validate unique code
    const existing = projects.find(p => p.code.toLowerCase() === c.toLowerCase() && p.id !== editingProject?.id);
    if (existing) {
      error('Mã dự án đã tồn tại.');
      return;
    }
    
    setIsSubmitting(true);
    if (editingProject) {
      await provider.updateProject(editingProject.id, { code: c, name: n });
      success('Cập nhật dự án thành công.');
    } else {
      await provider.addProject({ code: c, name: n });
      success('Thêm dự án thành công.');
    }
    setIsSubmitting(false);
    resetForms();
  };

  const handleDelete = async (type: string, id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa?')) return;
    if (type === 'categories') {
      if (checkCategoryUsed(id)) { error('Không thể xóa nhóm hàng đang được sử dụng.'); return; }
      await provider.deleteCategory(id);
    }
    if (type === 'units') {
      if (checkUnitUsed(id)) { error('Không thể xóa đơn vị đang được sử dụng.'); return; }
      await provider.deleteUnit(id);
    }
    if (type === 'projects') { await provider.deleteProject(id); success('Xóa dự án thành công.'); }
  };

  const toggleBrandStatus = async (brand: Brand) => {
    const newStatus = brand.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await provider.updateBrand(brand.id, { status: newStatus });
  };

  const toggleSupplierStatus = async (supplier: Supplier) => {
    const newStatus = supplier.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await provider.updateSupplier(supplier.id, { status: newStatus });
  };

  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const tabs = [
    { id: 'CATEGORIES', label: 'Nhóm hàng', icon: ListTree },
    { id: 'UNITS', label: 'Đơn vị tính', icon: Tags },
    { id: 'BRANDS', label: 'Hãng SX', icon: Briefcase },
    { id: 'SUPPLIERS', label: 'Nhà cung cấp', icon: Users },
    { id: 'PROJECTS', label: 'Dự án (Cơ bản)', icon: FolderKanban },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Danh mục hệ thống</h1>
        {canEdit && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm mới</span>
          </button>
        )}
      </div>

      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id as TabType); setShowForm(false); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
              activeTab === id
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {showForm && canEdit && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            {(activeTab === 'BRANDS' && editingBrand) ? 'Chỉnh sửa hãng sản xuất' : 
             (activeTab === 'SUPPLIERS' && editingSupplier) ? 'Chỉnh sửa nhà cung cấp' :
             (activeTab === 'PROJECTS' && editingProject) ? 'Chỉnh sửa dự án' : 
             `Thêm ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()} mới`}
          </h2>

          {activeTab === 'CATEGORIES' && (
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên nhóm hàng</label>
                  <input required type="text" value={catName} onChange={e=>setCatName(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả (tùy chọn)</label>
                  <input type="text" value={catDesc} onChange={e=>setCatDesc(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={resetForms} className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-lg">Hủy</button>
                <button disabled={isSubmitting} type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">Lưu</button>
              </div>
            </form>
          )}

          {activeTab === 'UNITS' && (
            <form onSubmit={handleAddUnit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên đơn vị</label>
                <input required type="text" value={unitName} onChange={e=>setUnitName(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 max-w-md" />
              </div>
              <div className="flex justify-start gap-2">
                <button type="button" onClick={resetForms} className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-lg">Hủy</button>
                <button disabled={isSubmitting} type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">Lưu</button>
              </div>
            </form>
          )}

          {activeTab === 'BRANDS' && (
            <form onSubmit={handleAddBrand} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mã hãng</label>
                  <input required type="text" value={brandCode} onChange={e=>setBrandCode(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Ví dụ: SIE" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên hãng</label>
                  <input required type="text" value={brandName} onChange={e=>setBrandName(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Ví dụ: Siemens" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên gọi khác (Aliases, cách nhau bằng dấu phẩy)</label>
                  <input type="text" value={brandAliases} onChange={e=>setBrandAliases(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Siemens AG, S7" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={resetForms} className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-lg">Hủy</button>
                <button disabled={isSubmitting} type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">Lưu</button>
              </div>
            </form>
          )}

          {activeTab === 'SUPPLIERS' && (
            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mã NCC</label>
                  <input required type="text" value={supCode} onChange={e=>setSupCode(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="SUP-001" />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên NCC</label>
                  <input required type="text" value={supName} onChange={e=>setSupName(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                  <input required type="text" value={supPhone} onChange={e=>setSupPhone(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" value={supEmail} onChange={e=>setSupEmail(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mã số thuế</label>
                  <input required type="text" value={supTaxCode} onChange={e=>setSupTaxCode(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ</label>
                  <input required type="text" value={supAddress} onChange={e=>setSupAddress(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zalo</label>
                  <input type="text" value={supZalo} onChange={e=>setSupZalo(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
                </div>
                <div className="md:col-span-1 lg:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                  <input type="text" value={supNote} onChange={e=>setSupNote(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={resetForms} className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-lg">Hủy</button>
                <button disabled={isSubmitting} type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">Lưu</button>
              </div>
            </form>
          )}

          {activeTab === 'PROJECTS' && (
            <form onSubmit={handleSubmitProject} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mã DA</label>
                  <input required type="text" value={projCode} onChange={e=>setProjCode(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Ví dụ: PRJ-001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên dự án</label>
                  <input required type="text" value={projName} onChange={e=>setProjName(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={resetForms} className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-lg">Hủy</button>
                <button disabled={isSubmitting} type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">Lưu</button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'CATEGORIES' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Tên nhóm</th>
                <th className="px-6 py-4 font-medium">Mô tả</th>
                {canEdit && <th className="px-6 py-4 font-medium w-28 text-center">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {categories.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">{c.name}</td>
                  <td className="px-6 py-4 text-slate-500">{c.description}</td>
                  {canEdit && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => handleDelete('categories', c.id)} 
                          className="p-2 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Xóa"
                          aria-label="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {categories.length === 0 && <tr><td colSpan={canEdit ? 3 : 2} className="px-6 py-8 text-center text-slate-500">Chưa có dữ liệu</td></tr>}
            </tbody>
          </table>
        )}
        
        {activeTab === 'UNITS' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Tên đơn vị</th>
                {canEdit && <th className="px-6 py-4 font-medium w-28 text-center">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {units.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">{u.name}</td>
                  {canEdit && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => handleDelete('units', u.id)} 
                          className="p-2 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Xóa"
                          aria-label="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {units.length === 0 && <tr><td colSpan={canEdit ? 2 : 1} className="px-6 py-8 text-center text-slate-500">Chưa có dữ liệu</td></tr>}
            </tbody>
          </table>
        )}

        {activeTab === 'BRANDS' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Mã</th>
                <th className="px-6 py-4 font-medium">Tên hãng</th>
                <th className="px-6 py-4 font-medium">Tên gọi khác</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                {canEdit && <th className="px-6 py-4 font-medium w-28 text-center">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {brands.map(b => (
                <tr key={b.id} className={cn("hover:bg-slate-50", b.status === 'INACTIVE' && 'opacity-60')}>
                  <td className="px-6 py-4 font-medium">{b.code}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{b.name}</td>
                  <td className="px-6 py-4">{b.aliases.join(', ')}</td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", b.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700')}>
                      {b.status === 'ACTIVE' ? 'Đang dùng' : 'Ngừng dùng'}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => toggleBrandStatus(b)} 
                          className={cn(
                            "p-1.5 rounded-md hover:bg-slate-100 transition-colors", 
                            b.status === 'ACTIVE' ? 'text-green-600' : 'text-slate-400'
                          )}
                          title={b.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          aria-label={b.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        >
                          {b.status === 'ACTIVE' ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => {
                            setEditingBrand(b);
                            setBrandCode(b.code);
                            setBrandName(b.name);
                            setBrandAliases(b.aliases.join(', '));
                            setShowForm(true);
                          }}
                          className="p-2 rounded-md text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
                          title="Sửa"
                          aria-label="Sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {brands.length === 0 && <tr><td colSpan={canEdit ? 5 : 4} className="px-6 py-8 text-center text-slate-500">Chưa có dữ liệu</td></tr>}
            </tbody>
          </table>
        )}

        {activeTab === 'SUPPLIERS' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Mã</th>
                <th className="px-6 py-4 font-medium">Tên NCC</th>
                <th className="px-6 py-4 font-medium">Liên hệ</th>
                <th className="px-6 py-4 font-medium">Địa chỉ</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                {canEdit && <th className="px-6 py-4 font-medium w-28 text-center">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {suppliers.map(s => (
                <tr key={s.id} className={cn("hover:bg-slate-50", s.status === 'INACTIVE' && 'opacity-60')}>
                  <td className="px-6 py-4 font-medium">{s.code}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{s.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      {s.phone && <span>{s.phone}</span>}
                      {s.email && <span className="text-slate-500 text-xs">{s.email}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-[200px] truncate" title={s.address}>{s.address}</td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", s.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700')}>
                      {s.status === 'ACTIVE' ? 'Đang dùng' : 'Ngừng dùng'}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => toggleSupplierStatus(s)} 
                          className={cn(
                            "p-1.5 rounded-md hover:bg-slate-100 transition-colors", 
                            s.status === 'ACTIVE' ? 'text-green-600' : 'text-slate-400'
                          )}
                          title={s.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          aria-label={s.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        >
                          {s.status === 'ACTIVE' ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => {
                            setEditingSupplier(s);
                            setSupCode(s.code);
                            setSupName(s.name);
                            setSupPhone(s.phone || '');
                            setSupEmail(s.email || '');
                            setSupAddress(s.address || '');
                            setSupZalo(s.zalo || '');
                            setSupTaxCode(s.taxCode || '');
                            setSupNote(s.note || '');
                            setShowForm(true);
                          }}
                          className="p-2 rounded-md text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
                          title="Sửa"
                          aria-label="Sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {suppliers.length === 0 && <tr><td colSpan={canEdit ? 6 : 5} className="px-6 py-8 text-center text-slate-500">Chưa có dữ liệu</td></tr>}
            </tbody>
          </table>
        )}

        {activeTab === 'PROJECTS' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Mã DA</th>
                <th className="px-6 py-4 font-medium">Tên dự án</th>
                {canEdit && <th className="px-6 py-4 font-medium w-28 text-center">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {projects.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium">{p.code}</td>
                  <td className="px-6 py-4">{p.name}</td>
                  {canEdit && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => { setEditingProject(p); setProjCode(p.code); setProjName(p.name); setShowForm(true); }} 
                          className="p-2 rounded-md text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
                          title="Sửa"
                          aria-label="Sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete('projects', p.id)} 
                          className="p-2 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Xóa"
                          aria-label="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {projects.length === 0 && <tr><td colSpan={canEdit ? 3 : 2} className="px-6 py-8 text-center text-slate-500">Chưa có dữ liệu</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
