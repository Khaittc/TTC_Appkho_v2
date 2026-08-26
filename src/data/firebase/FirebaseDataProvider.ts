import { DataProvider } from '../interfaces/DataProvider';
import { Item, Category, Unit, Project, Supplier, Transaction, Brand, ItemSupplier } from '../../types';
import { AppUser, UserRole } from '../../context/AuthContext';

export class FirebaseDataProvider implements DataProvider {
  // Items
  getItems(callback: (items: Item[]) => void): () => void {
    callback([]);
    return () => {};
  }
  async addItem(item: Omit<Item, 'id'>): Promise<void> {}
  async updateItem(id: string, data: Partial<Item>): Promise<void> {}
  async deleteItem(id: string): Promise<void> {}

  // Brands
  getBrands(callback: (brands: Brand[]) => void): () => void {
    callback([]);
    return () => {};
  }
  async addBrand(data: Omit<Brand, 'id'>): Promise<void> {}
  async updateBrand(id: string, data: Partial<Brand>): Promise<void> {}

  // Master Data
  getCategories(callback: (cats: Category[]) => void): () => void {
    callback([]);
    return () => {};
  }
  async addCategory(data: Omit<Category, 'id'>): Promise<void> {}
  async deleteCategory(id: string): Promise<void> {}

  getUnits(callback: (units: Unit[]) => void): () => void {
    callback([]);
    return () => {};
  }
  async addUnit(data: Omit<Unit, 'id'>): Promise<void> {}
  async deleteUnit(id: string): Promise<void> {}

  getSuppliers(callback: (sups: Supplier[]) => void): () => void {
    callback([]);
    return () => {};
  }
  async addSupplier(data: Omit<Supplier, 'id'>): Promise<void> {}
  async updateSupplier(id: string, data: Partial<Supplier>): Promise<void> {}
  async deleteSupplier(id: string): Promise<void> {}

  // ItemSupplier
  getItemSuppliers(itemId: string, callback: (rows: ItemSupplier[]) => void): () => void {
    callback([]);
    return () => {};
  }
  async addItemSupplier(data: Omit<ItemSupplier, 'id'>): Promise<void> {}
  async updateItemSupplier(id: string, data: Partial<ItemSupplier>): Promise<void> {}

  // Projects
  getProjects(callback: (projs: Project[]) => void): () => void {
    callback([]);
    return () => {};
  }
  async addProject(data: Omit<Project, 'id'>): Promise<void> {}
  async updateProject(id: string, data: Partial<Project>): Promise<void> {}
  async deleteProject(id: string): Promise<void> {}

  // Transactions
  getTransactions(callback: (txs: Transaction[]) => void): () => void {
    callback([]);
    return () => {};
  }
  async processInbound(item: Item, quantity: number, supplierId: string, user: AppUser): Promise<void> {}
  async processOutbound(item: Item, quantity: number, projectId: string, user: AppUser): Promise<void> {}

  // Users
  getUsers(callback: (users: AppUser[]) => void): () => void {
    callback([]);
    return () => {};
  }
  getRoleSidebarPermissions(callback: (perms: any[]) => void): () => void { callback([]); return ()=>{}; }
  async updateRoleSidebarPermissions(data: any[]): Promise<void> {}
  async updateUserRole(uid: string, role: UserRole): Promise<void> {}

  // Demo Specific
  async resetDemoData(): Promise<void> {}
}
