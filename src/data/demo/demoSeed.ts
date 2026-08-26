import { Item, Category, Unit, Project, Supplier, Transaction, Brand, ItemSupplier, RoleSidebarPermission } from '../../types';
import { AppUser } from '../../context/AuthContext';
import { normalizeModel, normalizeBrandName } from '../../domain/item/itemUtils';

export const DEMO_SEED_DATA = {
  brands: [
    { id: 'b-1', code: 'SIE', name: 'Siemens', normalizedName: normalizeBrandName('Siemens'), aliases: ['Siemens AG', 'S7'], status: 'ACTIVE' },
    { id: 'b-2', code: 'OMR', name: 'Omron', normalizedName: normalizeBrandName('Omron'), aliases: ['Omron Corp'], status: 'ACTIVE' },
    { id: 'b-3', code: 'SCH', name: 'Schneider Electric', normalizedName: normalizeBrandName('Schneider Electric'), aliases: ['Schneider'], status: 'ACTIVE' },
    { id: 'b-4', code: 'PHO', name: 'Phoenix Contact', normalizedName: normalizeBrandName('Phoenix Contact'), aliases: ['Phoenix'], status: 'ACTIVE' },
    { id: 'b-5', code: 'DEM', name: 'Demo Controls', normalizedName: normalizeBrandName('Demo Controls'), aliases: [], status: 'ACTIVE' },
    { id: 'b-6', code: 'UNK', name: 'Chưa xác định', normalizedName: normalizeBrandName('Chưa xác định'), aliases: [], status: 'ACTIVE' },
  ] as Brand[],
  
  categories: [
    { id: 'cat-1', name: 'PLC', description: 'Programmable Logic Controller' },
    { id: 'cat-2', name: 'HMI', description: 'Human Machine Interface' },
    { id: 'cat-3', name: 'Cảm biến', description: 'Các loại cảm biến công nghiệp' },
    { id: 'cat-4', name: 'Thiết bị đóng cắt', description: 'MCB, MCCB, Contactor, Relay' },
    { id: 'cat-5', name: 'Nguồn điện', description: 'Bộ nguồn AC/DC, DC/DC' },
    { id: 'cat-6', name: 'Thiết bị mạng', description: 'Switch công nghiệp, Router' },
    { id: 'cat-7', name: 'Phụ kiện tủ điện', description: 'Terminal block, Din rail, Máng cáp' },
  ] as Category[],
  
  units: [
    { id: 'u-1', name: 'Cái' },
    { id: 'u-2', name: 'Bộ' },
    { id: 'u-3', name: 'Mét' },
    { id: 'u-4', name: 'Cuộn' },
    { id: 'u-5', name: 'Hộp' },
  ] as Unit[],
  
  suppliers: [
    { id: 'sup-1', code: 'SUP-001', name: 'Demo Supplier A', address: 'Quận 1, TP.HCM', phone: '0901234567', email: 'contact@supA.test', status: 'ACTIVE' },
    { id: 'sup-2', code: 'SUP-002', name: 'Demo Supplier B', address: 'Quận Tân Bình, TP.HCM', phone: '0987654321', status: 'ACTIVE' },
    { id: 'sup-3', code: 'SUP-003', name: 'Demo Supplier C', address: 'Quận Cầu Giấy, Hà Nội', phone: '0243123456', status: 'ACTIVE' },
  ] as Supplier[],

  projects: [
    { id: 'prj-1', code: 'PRJ-001', name: 'Hệ thống tự động hóa mẫu' },
    { id: 'prj-2', code: 'PRJ-002', name: 'Tủ điện điều khiển mẫu' },
    { id: 'prj-3', code: 'PRJ-003', name: 'Trạm giám sát năng lượng mẫu' }
  ] as Project[],


  roleSidebarPermissions: ([
    { role: 'MANAGER', allowedMenus: ['DASHBOARD', 'MATERIAL_MONITORING', 'PROJECTS', 'ITEMS', 'INBOUND', 'OUTBOUND', 'TRANSACTIONS', 'MASTER_DATA'] as any[] },
    { role: 'ENGINEER', allowedMenus: ['DASHBOARD', 'PROJECTS', 'ITEMS'] as any[] }
  ] as RoleSidebarPermission[]),
  users: [
    { uid: 'demo-admin', email: 'demo.admin@example.test', name: 'Demo Admin', role: 'ADMIN' },
    { uid: 'demo-manager', email: 'demo.manager@example.test', name: 'Demo Warehouse Manager', role: 'MANAGER' },
    { uid: 'demo-engineer', email: 'demo.engineer@example.test', name: 'Demo Engineer', role: 'ENGINEER' },
  ] as AppUser[],
};

export const DEMO_ITEMS: Item[] = [
  {
    id: 'item-1', model: '6ES7214-1AG40-0XB0', modelNormalized: normalizeModel('6ES7214-1AG40-0XB0'),
    brandId: 'b-1', brandName: 'Siemens', name: 'PLC S7-1200 CPU 1214C DC/DC/DC',
    categoryId: 'cat-1', categoryName: 'PLC', unitId: 'u-2', unitName: 'Bộ',
    itemType: 'STANDARD', currentStock: 15, safetyStock: 5, status: 'ACTIVE', source: 'MANUAL',
    createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system'
  },
  {
    id: 'item-2', model: '6AV2123-2GB03-0AX0', modelNormalized: normalizeModel('6AV2123-2GB03-0AX0'),
    brandId: 'b-1', brandName: 'Siemens', name: 'HMI KTP700 Basic PN',
    categoryId: 'cat-2', categoryName: 'HMI', unitId: 'u-1', unitName: 'Cái',
    itemType: 'STANDARD', currentStock: 8, safetyStock: 3, status: 'ACTIVE', source: 'MANUAL',
    createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system'
  },
  {
    id: 'item-3', model: 'E2E-X5ME1', modelNormalized: normalizeModel('E2E-X5ME1'),
    brandId: 'b-2', brandName: 'Omron', name: 'Cảm biến tiệm cận M12 NPN',
    categoryId: 'cat-3', categoryName: 'Cảm biến', unitId: 'u-1', unitName: 'Cái',
    itemType: 'STANDARD', currentStock: 45, safetyStock: 20, status: 'ACTIVE', source: 'MANUAL',
    createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system'
  },
  {
    id: 'item-4', model: 'E3Z-D61 2M', modelNormalized: normalizeModel('E3Z-D61 2M'),
    brandId: 'b-2', brandName: 'Omron', name: 'Cảm biến quang 24VDC',
    categoryId: 'cat-3', categoryName: 'Cảm biến', unitId: 'u-1', unitName: 'Cái',
    itemType: 'STANDARD', currentStock: 12, safetyStock: 15, status: 'ACTIVE', source: 'MANUAL',
    createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system'
  },
  {
    id: 'item-5', model: 'A9F74363', modelNormalized: normalizeModel('A9F74363'),
    brandId: 'b-3', brandName: 'Schneider Electric', name: 'MCB 3P 63A 6kA',
    categoryId: 'cat-4', categoryName: 'Thiết bị đóng cắt', unitId: 'u-1', unitName: 'Cái',
    itemType: 'STANDARD', currentStock: 120, safetyStock: 50, status: 'ACTIVE', source: 'MANUAL',
    createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system'
  },
  {
    id: 'item-6', model: 'LC1D32M7', modelNormalized: normalizeModel('LC1D32M7'),
    brandId: 'b-3', brandName: 'Schneider Electric', name: 'Contactor 3P 32A 220VAC',
    categoryId: 'cat-4', categoryName: 'Thiết bị đóng cắt', unitId: 'u-1', unitName: 'Cái',
    itemType: 'STANDARD', currentStock: 35, safetyStock: 20, status: 'ACTIVE', source: 'MANUAL',
    createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system'
  },
  {
    id: 'item-7', model: 'MY4N-J 24VDC', modelNormalized: normalizeModel('MY4N-J 24VDC'),
    brandId: 'b-2', brandName: 'Omron', name: 'Relay kiếng 14 chân 24VDC',
    categoryId: 'cat-4', categoryName: 'Thiết bị đóng cắt', unitId: 'u-1', unitName: 'Cái',
    itemType: 'STANDARD', currentStock: 0, safetyStock: 30, status: 'ACTIVE', source: 'MANUAL',
    createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system'
  },
  {
    id: 'item-8', model: 'QUINT4-PS/1AC/24DC/10', modelNormalized: normalizeModel('QUINT4-PS/1AC/24DC/10'),
    brandId: 'b-4', brandName: 'Phoenix Contact', name: 'Bộ nguồn 24VDC 10A',
    categoryId: 'cat-5', categoryName: 'Nguồn điện', unitId: 'u-1', unitName: 'Cái',
    itemType: 'STANDARD', currentStock: 2, safetyStock: 2, status: 'ACTIVE', source: 'MANUAL',
    createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system'
  },
  {
    id: 'item-9', model: 'FL SWITCH SFN 5TX', modelNormalized: normalizeModel('FL SWITCH SFN 5TX'),
    brandId: 'b-4', brandName: 'Phoenix Contact', name: 'Switch công nghiệp 5 port',
    categoryId: 'cat-6', categoryName: 'Thiết bị mạng', unitId: 'u-1', unitName: 'Cái',
    itemType: 'STANDARD', currentStock: 5, safetyStock: 2, status: 'ACTIVE', source: 'MANUAL',
    createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system'
  },
  {
    id: 'item-10', model: 'UK 2,5 N', modelNormalized: normalizeModel('UK 2,5 N'),
    brandId: 'b-4', brandName: 'Phoenix Contact', name: 'Terminal block 2.5mm',
    categoryId: 'cat-7', categoryName: 'Phụ kiện tủ điện', unitId: 'u-1', unitName: 'Cái',
    itemType: 'CONSUMABLE', currentStock: 500, safetyStock: 100, status: 'ACTIVE', source: 'MANUAL',
    createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system'
  },
  {
    id: 'item-11', model: 'DEMO-SPEC-01', modelNormalized: normalizeModel('DEMO-SPEC-01'),
    brandId: 'b-5', brandName: 'Demo Controls', name: 'Mạch điều khiển đặc chế',
    categoryId: 'cat-1', categoryName: 'PLC', unitId: 'u-2', unitName: 'Bộ',
    itemType: 'PROJECT_SPECIFIC', currentStock: 0, safetyStock: 0, status: 'ACTIVE', source: 'MANUAL',
    createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system'
  },
  {
    id: 'item-12', model: 'OLD-MODEL-X', modelNormalized: normalizeModel('OLD-MODEL-X'),
    brandId: 'b-6', brandName: 'Chưa xác định', name: 'Vật tư cũ ngừng sử dụng',
    categoryId: 'cat-4', categoryName: 'Thiết bị đóng cắt', unitId: 'u-1', unitName: 'Cái',
    itemType: 'STANDARD', currentStock: 0, safetyStock: 0, status: 'INACTIVE', source: 'MANUAL',
    createdAt: new Date().toISOString(), createdBy: 'system', updatedAt: new Date().toISOString(), updatedBy: 'system'
  }
];

export const DEMO_ITEM_SUPPLIERS: ItemSupplier[] = [
  { id: 'is-1', itemId: 'item-1', supplierId: 'sup-1', currentPrice: 5000000, previousPrice: 4800000, currency: 'VND', isPreferred: true, status: 'ACTIVE' },
  { id: 'is-2', itemId: 'item-1', supplierId: 'sup-2', currentPrice: 5100000, currency: 'VND', isPreferred: false, status: 'ACTIVE' },
  
  { id: 'is-3', itemId: 'item-2', supplierId: 'sup-1', currentPrice: 8500000, currency: 'VND', isPreferred: true, status: 'ACTIVE' },
  { id: 'is-4', itemId: 'item-2', supplierId: 'sup-3', currentPrice: 8300000, currency: 'VND', isPreferred: false, status: 'ACTIVE' }, // sup-3 has lowest price but not preferred
  
  { id: 'is-5', itemId: 'item-3', supplierId: 'sup-2', currentPrice: 850000, currency: 'VND', isPreferred: true, status: 'ACTIVE' },
  { id: 'is-6', itemId: 'item-4', supplierId: 'sup-2', currentPrice: 1200000, currency: 'VND', isPreferred: true, status: 'ACTIVE' },
  
  { id: 'is-7', itemId: 'item-5', supplierId: 'sup-3', currentPrice: 150000, currency: 'VND', isPreferred: true, status: 'ACTIVE' },
  
  { id: 'is-8', itemId: 'item-8', supplierId: 'sup-1', currentPrice: 3200000, currency: 'VND', isPreferred: true, status: 'ACTIVE' },
  
  { id: 'is-9', itemId: 'item-11', supplierId: 'sup-1', currency: 'VND', isPreferred: true, status: 'ACTIVE' }, // No price yet
];
