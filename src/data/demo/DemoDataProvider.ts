import { DataProvider } from '../interfaces/DataProvider';
import { Item, Category, Unit, Project, Supplier, Transaction, Brand, ItemSupplier } from '../../types';
import { AppUser, UserRole } from '../../context/AuthContext';
import { loadDemoData, saveDemoData, DemoDatabase, clearDemoData, DEMO_SCHEMA_VERSION } from './demoStorage';
import { DEMO_SEED_DATA, DEMO_ITEMS, DEMO_ITEM_SUPPLIERS } from './demoSeed';
import { v4 as uuidv4 } from 'uuid';

export class DemoDataProvider implements DataProvider {
  private db: DemoDatabase;
  private listeners: Set<() => void> = new Set();

  constructor() {
    let data = loadDemoData();
    if (!data || data.schemaVersion !== DEMO_SCHEMA_VERSION) {
      data = {
        schemaVersion: DEMO_SCHEMA_VERSION,
        ...DEMO_SEED_DATA,
        items: [...DEMO_ITEMS],
        itemSuppliers: [...DEMO_ITEM_SUPPLIERS],
        transactions: []
      };
      saveDemoData(data);
    }
    this.db = data;
  }

  private notify() {
    saveDemoData(this.db);
    this.listeners.forEach(l => l());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Items
  getItems(callback: (items: Item[]) => void) {
    callback([...this.db.items]);
    return this.subscribe(() => callback([...this.db.items]));
  }
  
  async addItem(item: Omit<Item, 'id'>) {
    this.db.items.push({ ...item, id: uuidv4() });
    this.notify();
  }
  
  async updateItem(id: string, data: Partial<Item>) {
    const idx = this.db.items.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.db.items[idx] = { ...this.db.items[idx], ...data };
      this.notify();
    }
  }
  
  async deleteItem(id: string) {
    // Soft delete is preferred, but this implements hard delete for generic interface.
    // In actual implementation, we might just use updateItem({status: 'INACTIVE'}) instead of calling this.
    this.db.items = this.db.items.filter(i => i.id !== id);
    this.notify();
  }

  // Brands
  getBrands(callback: (brands: Brand[]) => void) {
    callback([...this.db.brands]);
    return this.subscribe(() => callback([...this.db.brands]));
  }

  async addBrand(data: Omit<Brand, 'id'>) {
    this.db.brands.push({ ...data, id: uuidv4() });
    this.notify();
  }

  async updateBrand(id: string, data: Partial<Brand>) {
    const idx = this.db.brands.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.db.brands[idx] = { ...this.db.brands[idx], ...data };
      this.notify();
    }
  }

  // Categories
  getCategories(callback: (cats: Category[]) => void) {
    callback([...this.db.categories]);
    return this.subscribe(() => callback([...this.db.categories]));
  }
  
  async addCategory(data: Omit<Category, 'id'>) {
    this.db.categories.push({ ...data, id: uuidv4() });
    this.notify();
  }
  
  async deleteCategory(id: string) {
    this.db.categories = this.db.categories.filter(c => c.id !== id);
    this.notify();
  }

  // Units
  getUnits(callback: (units: Unit[]) => void) {
    callback([...this.db.units]);
    return this.subscribe(() => callback([...this.db.units]));
  }
  
  async addUnit(data: Omit<Unit, 'id'>) {
    this.db.units.push({ ...data, id: uuidv4() });
    this.notify();
  }
  
  async deleteUnit(id: string) {
    this.db.units = this.db.units.filter(u => u.id !== id);
    this.notify();
  }

  // Suppliers
  getSuppliers(callback: (sups: Supplier[]) => void) {
    callback([...this.db.suppliers]);
    return this.subscribe(() => callback([...this.db.suppliers]));
  }
  
  async addSupplier(data: Omit<Supplier, 'id'>) {
    this.db.suppliers.push({ ...data, id: uuidv4() });
    this.notify();
  }
  
  async updateSupplier(id: string, data: Partial<Supplier>) {
    const idx = this.db.suppliers.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.db.suppliers[idx] = { ...this.db.suppliers[idx], ...data };
      this.notify();
    }
  }

  async deleteSupplier(id: string) {
    this.db.suppliers = this.db.suppliers.filter(s => s.id !== id);
    this.notify();
  }

  // ItemSuppliers
  getItemSuppliers(itemId: string, callback: (rows: ItemSupplier[]) => void) {
    const filterAndCallback = () => {
      callback(this.db.itemSuppliers.filter(is => is.itemId === itemId));
    };
    filterAndCallback();
    return this.subscribe(filterAndCallback);
  }

  async addItemSupplier(data: Omit<ItemSupplier, 'id'>) {
    this.db.itemSuppliers.push({ ...data, id: uuidv4() });
    this.notify();
  }

  async updateItemSupplier(id: string, data: Partial<ItemSupplier>) {
    const idx = this.db.itemSuppliers.findIndex(is => is.id === id);
    if (idx !== -1) {
      this.db.itemSuppliers[idx] = { ...this.db.itemSuppliers[idx], ...data };
      this.notify();
    }
  }

  // Projects
  getProjects(callback: (projs: Project[]) => void) {
    callback([...this.db.projects]);
    return this.subscribe(() => callback([...this.db.projects]));
  }
  
  async addProject(data: Omit<Project, 'id'>) {
    this.db.projects.push({ ...data, id: uuidv4() });
    this.notify();
  }
  
  async updateProject(id: string, data: Partial<Project>) {
    const idx = this.db.projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.db.projects[idx] = { ...this.db.projects[idx], ...data };
      this.notify();
    }
  }
  
  async deleteProject(id: string) {
    this.db.projects = this.db.projects.filter(p => p.id !== id);
    this.notify();
  }

  // Transactions
  getTransactions(callback: (txs: Transaction[]) => void) {
    // Sort transactions by timestamp desc
    const filterAndCallback = () => {
      callback([...this.db.transactions].sort((a, b) => {
        const tA = typeof a.timestamp === 'number' ? a.timestamp : new Date(a.timestamp).getTime();
        const tB = typeof b.timestamp === 'number' ? b.timestamp : new Date(b.timestamp).getTime();
        return tB - tA;
      }));
    };
    filterAndCallback();
    return this.subscribe(filterAndCallback);
  }
  
  async processInbound(item: Item, quantity: number, supplierId: string, user: AppUser) {
    const idx = this.db.items.findIndex(i => i.id === item.id);
    if (idx === -1) throw new Error('Item not found');
    
    this.db.items[idx].currentStock += quantity;
    this.db.items[idx].updatedAt = new Date().toISOString();
    this.db.items[idx].updatedBy = user.uid;

    this.db.transactions.push({
      id: uuidv4(),
      type: 'INBOUND',
      itemId: item.id,
      itemModel: item.model,
      itemName: item.name,
      quantity,
      supplierId,
      userId: user.uid,
      userName: user.name,
      timestamp: new Date().toISOString()
    });
    
    this.notify();
  }
  
  async processOutbound(item: Item, quantity: number, projectId: string, user: AppUser) {
    const idx = this.db.items.findIndex(i => i.id === item.id);
    if (idx === -1) throw new Error('Item not found');
    if (this.db.items[idx].currentStock < quantity) throw new Error('Not enough stock');
    
    this.db.items[idx].currentStock -= quantity;
    this.db.items[idx].updatedAt = new Date().toISOString();
    this.db.items[idx].updatedBy = user.uid;

    this.db.transactions.push({
      id: uuidv4(),
      type: 'OUTBOUND',
      itemId: item.id,
      itemModel: item.model,
      itemName: item.name,
      quantity,
      projectId,
      userId: user.uid,
      userName: user.name,
      timestamp: new Date().toISOString()
    });
    
    this.notify();
  }

  // Users
  getUsers(callback: (users: AppUser[]) => void) {
    callback([...this.db.users]);
    return this.subscribe(() => callback([...this.db.users]));
  }

  getRoleSidebarPermissions(callback: (perms: any[]) => void): () => void {
    return this.subscribe(() => callback(this.db.roleSidebarPermissions || []));
  }
  async updateRoleSidebarPermissions(data: any[]) {
    this.db.roleSidebarPermissions = data;
    this.notify();
  }
  async updateUserRole(uid: string, role: UserRole) {
    const idx = this.db.users.findIndex(u => u.uid === uid);
    if (idx !== -1) {
      this.db.users[idx].role = role;
      this.notify();
    }
  }

  // Demo
  async resetDemoData() {
    clearDemoData();
    this.db = {
      schemaVersion: DEMO_SCHEMA_VERSION,
      ...DEMO_SEED_DATA,
      items: [...DEMO_ITEMS],
      itemSuppliers: [...DEMO_ITEM_SUPPLIERS],
      transactions: []
    };
    this.notify();
  }
}
