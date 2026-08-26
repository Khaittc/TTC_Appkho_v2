import { normalizeModel, normalizeBrandName } from '../../domain/item/itemUtils';
import { DEMO_PERSISTENCE } from '../../config/env';
import { Item, Category, Unit, Project, Supplier, Transaction, Brand, ItemSupplier, RoleSidebarPermission, SidebarPermissionKey } from '../../types';
import { AppUser } from '../../context/AuthContext';

export const DEMO_SCHEMA_VERSION = 3;
const STORAGE_KEY = 'ttc_material_hub_demo_data';
const OLD_STORAGE_KEY = 'automanage_demo_data';

export interface DemoDatabase {
  schemaVersion: number;
  items: Item[];
  brands: Brand[];
  itemSuppliers: ItemSupplier[];
  categories: Category[];
  units: Unit[];
  projects: Project[];
  suppliers: Supplier[];
  transactions: Transaction[];
  users: AppUser[];
  roleSidebarPermissions: RoleSidebarPermission[];
}

export const getStorage = () => {
  if (DEMO_PERSISTENCE === 'local') return localStorage;
  return sessionStorage;
};


export const loadDemoData = (): DemoDatabase | null => {
  try {
    let dataStr = getStorage().getItem(STORAGE_KEY);
    
    // Migration from old storage key
    if (!dataStr) {
      const oldDataStr = getStorage().getItem(OLD_STORAGE_KEY);
      if (oldDataStr) {
        dataStr = oldDataStr;
        getStorage().removeItem(OLD_STORAGE_KEY);
      }
    }

    if (dataStr) {
      const parsed = JSON.parse(dataStr);
      if (parsed.schemaVersion === DEMO_SCHEMA_VERSION) {
        return parsed as DemoDatabase;
      }
      
      // Migrate old data
      let migrated = parsed;
      if (parsed.schemaVersion === 2) {
        migrated = migrateToV3(parsed);
      } else if (parsed.schemaVersion < 2) {
        migrated = migrateToV3(migrateToV2(parsed));
      }
      saveDemoData(migrated);
      return migrated;
    }
  } catch (e) {
    console.warn('Lỗi khi đọc dữ liệu demo, sẽ reset về mặc định:', e);
  }
  return null;
};


const migrateToV3 = (oldData: any): DemoDatabase => {
  console.log('Migrating demo data to v3...');
  
  // v2 to v3 migration
  let data = oldData;
  if (oldData.schemaVersion < 2) {
    data = migrateToV2(oldData);
  }

  const newItems = (data.items || []).map((oldItem: any) => {
    const { sku, ...rest } = oldItem;
    return rest;
  });

  const newTransactions = (data.transactions || []).map((oldTx: any) => {
    const { itemSku, ...rest } = oldTx;
    return {
      ...rest,
      itemModel: oldTx.itemModel || itemSku || oldTx.itemName
    };
  });

  const newRoleSidebarPermissions: RoleSidebarPermission[] = [
    {
      role: 'MANAGER',
      allowedMenus: ['DASHBOARD', 'MATERIAL_MONITORING', 'PROJECTS', 'ITEMS', 'INBOUND', 'OUTBOUND', 'TRANSACTIONS', 'MASTER_DATA'] as SidebarPermissionKey[]
    },
    {
      role: 'ENGINEER',
      allowedMenus: ['DASHBOARD', 'PROJECTS', 'ITEMS'] as SidebarPermissionKey[]
    }
  ];

  return {
    ...data,
    schemaVersion: 3,
    items: newItems,
    transactions: newTransactions,
    roleSidebarPermissions: data.roleSidebarPermissions || newRoleSidebarPermissions
  };
};

const migrateToV2 = (oldData: any): any => {
  console.log('Migrating demo data to v2...');
  
  const unknownBrandId = 'BRAND_UNKNOWN';
  const brands: Brand[] = oldData.brands || [];
  
  if (!brands.find(b => b.id === unknownBrandId)) {
    brands.push({
      id: unknownBrandId,
      code: 'UNKNOWN',
      name: 'Chưa xác định',
      normalizedName: 'CHUA XAC DINH',
      aliases: [],
      status: 'ACTIVE'
    });
  }

  const newItems: Item[] = (oldData.items || []).map((oldItem: any) => {
    // Resolve Category
    const category = (oldData.categories || []).find((c: any) => c.id === oldItem.categoryId || c.name === oldItem.category);
    const categoryId = category?.id || 'cat_unknown';
    const categoryName = category?.name || oldItem.category || 'Chưa xác định';
    
    // Resolve Unit
    const unit = (oldData.units || []).find((u: any) => u.id === oldItem.unitId || u.name === oldItem.unit);
    const unitId = unit?.id || 'unit_unknown';
    const unitName = unit?.name || oldItem.unit || 'Chưa xác định';

    const model = oldItem.model;
    
    return {
      id: oldItem.id,
      model: model,
      modelNormalized: normalizeModel(model),
      brandId: unknownBrandId,
      brandName: 'Chưa xác định',
      name: oldItem.name,
      description: oldItem.description,
      categoryId,
      categoryName,
      unitId,
      unitName,
      itemType: 'STANDARD',
      currentStock: oldItem.currentStock || 0,
      safetyStock: oldItem.safetyStock || 0,
      status: 'ACTIVE',
      source: 'MANUAL',
      createdAt: new Date().toISOString(),
      createdBy: 'system_migration',
      updatedAt: new Date().toISOString(),
      updatedBy: 'system_migration'
    };
  });

  const newSuppliers: Supplier[] = (oldData.suppliers || []).map((oldSup: any, index: number) => {
    return {
      id: oldSup.id,
      code: oldSup.code || `SUP-MIG-${index}`,
      name: oldSup.name,
      address: oldSup.address,
      phone: oldSup.phone,
      email: oldSup.email,
      zalo: oldSup.zalo,
      taxCode: oldSup.taxCode,
      status: 'ACTIVE',
      note: oldSup.note
    };
  });

  return {
    schemaVersion: DEMO_SCHEMA_VERSION,
    items: newItems,
    brands: brands,
    itemSuppliers: oldData.itemSuppliers || [],
    categories: oldData.categories || [],
    units: oldData.units || [],
    projects: (oldData.projects || []).map((p: any) => ({
      id: p.id,
      code: p.code,
      name: p.name
    })),
    suppliers: newSuppliers,
    transactions: oldData.transactions || [],
    users: oldData.users || []
  };
};

export const saveDemoData = (data: DemoDatabase) => {
  try {
    getStorage().setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Lỗi khi lưu dữ liệu demo:', e);
  }
};

export const clearDemoData = () => {
  getStorage().removeItem(STORAGE_KEY);
  getStorage().removeItem(OLD_STORAGE_KEY);
};
