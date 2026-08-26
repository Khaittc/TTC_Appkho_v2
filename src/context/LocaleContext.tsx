import React, { createContext, useContext, useState, useEffect } from 'react';

export type Locale = 'vi' | 'en';

const LOCALE_STORAGE_KEY = 'ttc_material_hub_locale';

export const translations = {
  vi: {
    // Common
    'common.active': 'Đang sử dụng',
    'common.inactive': 'Ngừng sử dụng',
    'common.allStatus': 'Tất cả trạng thái',
    'common.actions': 'Thao tác',
    'common.close': 'Đóng',
    'common.cancel': 'Hủy',
    'common.save': 'Lưu',
    'common.update': 'Cập nhật',
    'common.add': 'Thêm',
    'common.addNew': 'Thêm mới',
    'common.viewDetails': 'Xem chi tiết',
    'common.status': 'Trạng thái',
    'common.all': 'Tất cả',
    'common.noResults': 'Không tìm thấy dữ liệu',
    'common.tryChangingFilters': 'Thử thay đổi từ khóa hoặc bộ lọc',

    // Item List
    'items.title': 'Danh mục vật tư',
    'items.subtitle': 'Quản lý thông tin, tồn kho và giá cả vật tư',
    'items.importExcel': 'Import Excel',
    'items.addItem': 'Thêm vật tư',
    'items.searchPlaceholder': 'Tìm theo Nhóm hàng, Hãng, Model, Tên...',
    'items.allCategories': 'Tất cả nhóm',
    'items.allBrands': 'Tất cả hãng',
    'items.colCategory': 'Nhóm hàng',
    'items.colBrand': 'Hãng',
    'items.colModel': 'Model',
    'items.colName': 'Tên vật tư',
    'items.colStock': 'Tồn kho',
    'items.colUnit': 'Đơn vị',
    'items.colStatus': 'Trạng thái',
    'items.colActions': 'Thao tác',
    'items.noItemsFound': 'Không tìm thấy vật tư nào',

    // Item Detail Modal
    'itemDetail.titleEdit': 'Chi tiết vật tư: {model}',
    'itemDetail.titleNew': 'Thêm vật tư mới',
    'itemDetail.tabInfo': 'Thông tin chính',
    'itemDetail.tabStock': 'Tồn kho',
    'itemDetail.tabSuppliers': 'Nhà cung cấp & Giá',

    'itemDetail.sectionIdentity': 'Thông tin định danh',
    'itemDetail.model': 'Model (Mã NSX)',
    'itemDetail.brand': 'Hãng sản xuất',
    'itemDetail.selectBrand': '-- Chọn hãng --',
    'itemDetail.name': 'Tên vật tư',
    'itemDetail.description': 'Mô tả thêm',
    'itemDetail.mpn': 'Manufacturer Part Number (MPN)',

    'itemDetail.sectionClassification': 'Phân loại',
    'itemDetail.category': 'Nhóm hàng',
    'itemDetail.selectCategory': '-- Chọn nhóm --',
    'itemDetail.unit': 'Đơn vị tính',
    'itemDetail.selectUnit': '-- Chọn ĐVT --',
    'itemDetail.type': 'Loại vật tư',
    'itemDetail.typeStandard': 'Vật tư chuẩn',
    'itemDetail.typeProject': 'Vật tư đặc thù dự án',
    'itemDetail.typeConsumable': 'Vật tư tiêu hao',
    'itemDetail.typeSparePart': 'Phụ tùng dự phòng',

    'itemDetail.sectionStockTech': 'Tồn kho & Kỹ thuật',
    'itemDetail.safetyStock': 'Tồn kho an toàn (Safety Stock)',
    'itemDetail.datasheetUrl': 'Datasheet URL',
    'itemDetail.technicalNote': 'Ghi chú kỹ thuật',

    'itemDetail.sectionStatus': 'Trạng thái',
    'itemDetail.statusUsage': 'Trạng thái sử dụng',
    'itemDetail.statusActive': 'Đang sử dụng',
    'itemDetail.statusInactive': 'Ngừng sử dụng',

    'itemDetail.currentStock': 'Tồn kho hiện tại',
    'itemDetail.safetyStockLevel': 'Tồn kho an toàn',
    'itemDetail.stockNote': '* Tồn kho thực tế chỉ được thay đổi thông qua các giao dịch Nhập / Xuất kho.',

    // Suppliers & Pricing
    'suppliers.listTitle': 'Danh sách nhà cung cấp',
    'suppliers.addSupplier': 'Thêm nhà cung cấp',
    'suppliers.selectSupplierActive': '-- Chọn NCC (Active) --',
    'suppliers.supplier': 'Nhà cung cấp',
    'suppliers.partNumber': 'Part Number',
    'suppliers.supplierPartNumber': 'Supplier Part Number',
    'suppliers.previousPrice': 'Giá trước',
    'suppliers.currentPriceVnd': 'Giá hiện tại (VND)',
    'suppliers.quoteDate': 'Ngày báo giá',
    'suppliers.updatedAt': 'Cập nhật',
    'suppliers.status': 'Trạng thái',
    'suppliers.actions': 'Thao tác',
    'suppliers.preferredBadge': 'Ưu tiên',
    'suppliers.lowestPriceBadge': 'Giá thấp nhất',
    'suppliers.updatePrice': 'Cập nhật giá',
    'suppliers.setPreferred': 'Đặt ưu tiên',
    'suppliers.lock': 'Khóa',
    'suppliers.unlock': 'Mở khóa',
    'suppliers.noSuppliers': 'Chưa có nhà cung cấp nào',

    // Price Update Modal
    'priceModal.title': 'Cập nhật giá',
    'priceModal.newPriceVnd': 'Giá mới (VND)',
    'priceModal.quoteDate': 'Ngày báo giá',
    'priceModal.currentPrice': 'Giá hiện tại',
    'priceModal.newPrice': 'Giá mới',
    'priceModal.difference': 'Chênh lệch',
    'priceModal.savePrice': 'Lưu giá',
  },
  en: {
    // Common
    'common.active': 'Active',
    'common.inactive': 'Inactive',
    'common.allStatus': 'All statuses',
    'common.actions': 'Actions',
    'common.close': 'Close',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.update': 'Update',
    'common.add': 'Add',
    'common.addNew': 'Add New',
    'common.viewDetails': 'View details',
    'common.status': 'Status',
    'common.all': 'All',
    'common.noResults': 'No data found',
    'common.tryChangingFilters': 'Try changing keywords or filters',

    // Item List
    'items.title': 'Item Catalog',
    'items.subtitle': 'Manage material information, inventory, and pricing',
    'items.importExcel': 'Import Excel',
    'items.addItem': 'Add Item',
    'items.searchPlaceholder': 'Search by Category, Brand, Model, Name...',
    'items.allCategories': 'All categories',
    'items.allBrands': 'All brands',
    'items.colCategory': 'Category',
    'items.colBrand': 'Brand',
    'items.colModel': 'Model',
    'items.colName': 'Item Name',
    'items.colStock': 'Inventory',
    'items.colUnit': 'Unit',
    'items.colStatus': 'Status',
    'items.colActions': 'Actions',
    'items.noItemsFound': 'No items found',

    // Item Detail Modal
    'itemDetail.titleEdit': 'Item Details: {model}',
    'itemDetail.titleNew': 'Add New Item',
    'itemDetail.tabInfo': 'General Information',
    'itemDetail.tabStock': 'Inventory',
    'itemDetail.tabSuppliers': 'Suppliers & Pricing',

    'itemDetail.sectionIdentity': 'Identification',
    'itemDetail.model': 'Model (Mfg Part No.)',
    'itemDetail.brand': 'Brand / Manufacturer',
    'itemDetail.selectBrand': '-- Select Brand --',
    'itemDetail.name': 'Item Name',
    'itemDetail.description': 'Description',
    'itemDetail.mpn': 'Manufacturer Part Number (MPN)',

    'itemDetail.sectionClassification': 'Classification',
    'itemDetail.category': 'Category',
    'itemDetail.selectCategory': '-- Select Category --',
    'itemDetail.unit': 'Unit of Measure',
    'itemDetail.selectUnit': '-- Select Unit --',
    'itemDetail.type': 'Item Type',
    'itemDetail.typeStandard': 'Standard Material',
    'itemDetail.typeProject': 'Project-specific',
    'itemDetail.typeConsumable': 'Consumable',
    'itemDetail.typeSparePart': 'Spare Part',

    'itemDetail.sectionStockTech': 'Inventory & Specifications',
    'itemDetail.safetyStock': 'Safety Stock',
    'itemDetail.datasheetUrl': 'Datasheet URL',
    'itemDetail.technicalNote': 'Technical Note',

    'itemDetail.sectionStatus': 'Status',
    'itemDetail.statusUsage': 'Usage Status',
    'itemDetail.statusActive': 'Active',
    'itemDetail.statusInactive': 'Inactive',

    'itemDetail.currentStock': 'Current Inventory',
    'itemDetail.safetyStockLevel': 'Safety Stock',
    'itemDetail.stockNote': '* Actual stock is modified only through Inbound / Outbound warehouse transactions.',

    // Suppliers & Pricing
    'suppliers.listTitle': 'Supplier List',
    'suppliers.addSupplier': 'Add Supplier',
    'suppliers.selectSupplierActive': '-- Select Supplier (Active) --',
    'suppliers.supplier': 'Supplier',
    'suppliers.partNumber': 'Part Number',
    'suppliers.supplierPartNumber': 'Supplier Part Number',
    'suppliers.previousPrice': 'Previous Price',
    'suppliers.currentPriceVnd': 'Current Price (VND)',
    'suppliers.quoteDate': 'Quote Date',
    'suppliers.updatedAt': 'Updated',
    'suppliers.status': 'Status',
    'suppliers.actions': 'Actions',
    'suppliers.preferredBadge': 'Preferred',
    'suppliers.lowestPriceBadge': 'Lowest price',
    'suppliers.updatePrice': 'Update price',
    'suppliers.setPreferred': 'Set preferred',
    'suppliers.lock': 'Lock',
    'suppliers.unlock': 'Unlock',
    'suppliers.noSuppliers': 'No suppliers yet',

    // Price Update Modal
    'priceModal.title': 'Update Price',
    'priceModal.newPriceVnd': 'New Price (VND)',
    'priceModal.quoteDate': 'Quote Date',
    'priceModal.currentPrice': 'Current Price',
    'priceModal.newPrice': 'New Price',
    'priceModal.difference': 'Difference',
    'priceModal.savePrice': 'Save Price',
  }
} as const;

export type TranslationKey = keyof typeof translations.vi;

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const saved = sessionStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved === 'vi' || saved === 'en') {
        return saved;
      }
    } catch {
      // Storage unavailable fallback
    }
    return 'vi';
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      sessionStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    } catch {
      // ignore
    }
  };

  const toggleLocale = () => {
    setLocale(locale === 'vi' ? 'en' : 'vi');
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const dict = translations[locale] as Record<string, string>;
    let text = dict[key] || (translations.vi as Record<string, string>)[key] || key;
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
      });
    }
    return text;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
