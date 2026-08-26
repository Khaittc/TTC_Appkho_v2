import { Item, Category, Unit, Project, Supplier, Transaction, Brand, ItemSupplier } from '../../types';
import { AppUser, UserRole } from '../../context/AuthContext';

export interface DataProvider {
  // Items
  getItems(callback: (items: Item[]) => void): () => void;
  addItem(item: Omit<Item, 'id'>): Promise<void>;
  updateItem(id: string, data: Partial<Item>): Promise<void>;
  deleteItem(id: string): Promise<void>;
  
  // Brands
  getBrands(callback: (brands: Brand[]) => void): () => void;
  addBrand(data: Omit<Brand, 'id'>): Promise<void>;
  updateBrand(id: string, data: Partial<Brand>): Promise<void>;

  // Master Data
  getCategories(callback: (cats: Category[]) => void): () => void;
  addCategory(data: Omit<Category, 'id'>): Promise<void>;
  deleteCategory(id: string): Promise<void>;
  
  getUnits(callback: (units: Unit[]) => void): () => void;
  addUnit(data: Omit<Unit, 'id'>): Promise<void>;
  deleteUnit(id: string): Promise<void>;
  
  getSuppliers(callback: (sups: Supplier[]) => void): () => void;
  addSupplier(data: Omit<Supplier, 'id'>): Promise<void>;
  updateSupplier(id: string, data: Partial<Supplier>): Promise<void>;
  deleteSupplier(id: string): Promise<void>;
  
  // ItemSupplier
  getItemSuppliers(itemId: string, callback: (rows: ItemSupplier[]) => void): () => void;
  addItemSupplier(data: Omit<ItemSupplier, 'id'>): Promise<void>;
  updateItemSupplier(id: string, data: Partial<ItemSupplier>): Promise<void>;

  // Projects
  getProjects(callback: (projs: Project[]) => void): () => void;
  addProject(data: Omit<Project, 'id'>): Promise<void>;
  updateProject(id: string, data: Partial<Project>): Promise<void>;
  deleteProject(id: string): Promise<void>;

  // Transactions
  getTransactions(callback: (txs: Transaction[]) => void): () => void;
  processInbound(item: Item, quantity: number, supplierId: string, user: AppUser): Promise<void>;
  processOutbound(item: Item, quantity: number, projectId: string, user: AppUser): Promise<void>;

  // Users
  getUsers(callback: (users: AppUser[]) => void): () => void;
  updateUserRole(uid: string, role: UserRole): Promise<void>;
  getUsers(callback: (users: any[]) => void): () => void;
  getRoleSidebarPermissions(callback: (perms: any[]) => void): () => void;
  updateRoleSidebarPermissions(data: any[]): Promise<void>;

  // Demo Specific
  resetDemoData(): Promise<void>;
}
