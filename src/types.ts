export type ItemType =
  | 'STANDARD'
  | 'PROJECT_SPECIFIC'
  | 'CONSUMABLE'
  | 'SPARE_PART';

export type ItemStatus =
  | 'ACTIVE'
  | 'INACTIVE';

export type ItemSource =
  | 'MANUAL'
  | 'BOM'
  | 'IMPORT';

export interface Item {
  id: string;


  model: string;
  modelNormalized: string;

  brandId: string;
  brandName: string;

  name: string;
  description?: string;
  manufacturerPartNumber?: string;

  categoryId: string;
  categoryName: string;

  unitId: string;
  unitName: string;

  itemType: ItemType;

  currentStock: number;
  safetyStock: number;

  datasheetUrl?: string;
  technicalNote?: string;

  status: ItemStatus;
  source: ItemSource;

  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Unit {
  id: string;
  name: string;
}

export type MasterStatus =
  | 'ACTIVE'
  | 'INACTIVE';

export interface Brand {
  id: string;
  code: string;
  name: string;

  normalizedName: string;
  aliases: string[];

  status: MasterStatus;
}

export interface Supplier {
  id: string;

  code: string;
  name: string;

  address?: string;
  phone?: string;
  email?: string;
  zalo?: string;
  taxCode?: string;

  status: MasterStatus;
  note?: string;
}

export type ItemSupplierStatus =
  | 'ACTIVE'
  | 'INACTIVE';

export interface ItemSupplier {
  id: string;

  itemId: string;
  supplierId: string;

  supplierPartNumber?: string;

  previousPrice?: number;
  currentPrice?: number;

  currency: string;

  priceQuoteDate?: string;
  priceUpdatedAt?: string;

  isPreferred: boolean;

  status: ItemSupplierStatus;

  note?: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
}

export interface Transaction {
  id: string;
  type: 'INBOUND' | 'OUTBOUND';
  itemId: string;
  itemModel?: string;
  itemName: string;
  quantity: number;
  projectId?: string;
  supplierId?: string;
  userId: string;
  userName: string;
  timestamp: string | number;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'ENGINEER';

export const ROLE_LEVEL = {
  ADMIN: 3,
  MANAGER: 2,
  ENGINEER: 1
};

export type SidebarPermissionKey =
  | 'DASHBOARD'
  | 'MATERIAL_MONITORING'
  | 'PROJECTS'
  | 'ITEMS'
  | 'INBOUND'
  | 'OUTBOUND'
  | 'TRANSACTIONS'
  | 'MASTER_DATA';

export interface RoleSidebarPermission {
  role: 'MANAGER' | 'ENGINEER';
  allowedMenus: SidebarPermissionKey[];
}
