import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { Package, ArrowDownToLine, ArrowUpFromLine, List, LayoutDashboard, LogOut, Users, Settings, FolderKanban, Activity, Workflow } from 'lucide-react';
import { cn } from '../lib/utils';
import { DemoBanner } from './demo/DemoBanner';
import { APP_CONFIG } from '../config/appConfig';
import { IS_DEMO_MODE } from '../config/env';
import { getDataProvider } from '../data/repositoryFactory';
import { useState, useEffect } from 'react';
import { RoleSidebarPermission } from '../types';

interface NavigationItem {
  name: string;
  path: string;
  icon: any;
  roles?: import('../context/AuthContext').UserRole[];
  permissionKey?: import('../types').SidebarPermissionKey;
  comingSoon?: boolean;
}

interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const provider = getDataProvider();
  const [permissions, setPermissions] = useState<RoleSidebarPermission[]>([]);
  useEffect(() => {
    return provider.getRoleSidebarPermissions(setPermissions);
  }, []);

  const navigationSections: NavigationSection[] = [
    {
      label: 'ĐIỀU HÀNH',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, permissionKey: 'DASHBOARD' },
        { name: 'Giám sát vật tư dự án', path: '/project-material-monitoring', icon: Activity, comingSoon: true, permissionKey: 'MATERIAL_MONITORING' },
      ]
    },
    {
      label: 'DỰ ÁN & VẬT TƯ',
      items: [
        { name: 'Quản lý dự án', path: '/projects', icon: FolderKanban, comingSoon: true, permissionKey: 'PROJECTS' },
        { name: 'Danh mục vật tư', path: '/items', icon: Package, permissionKey: 'ITEMS' },
      ]
    },
    {
      label: 'QUẢN LÝ KHO',
      items: [
        { name: 'Nhập kho', path: '/inbound', icon: ArrowDownToLine, permissionKey: 'INBOUND' },
        { name: 'Xuất kho', path: '/outbound', icon: ArrowUpFromLine, permissionKey: 'OUTBOUND' },
        { name: 'Lịch sử giao dịch', path: '/transactions', icon: List, permissionKey: 'TRANSACTIONS' },
      ]
    },
    {
      label: 'HỆ THỐNG',
      items: [
        { name: 'Danh mục hệ thống', path: '/master-data', icon: Settings, roles: ['MANAGER', 'ADMIN'] },
        { name: 'Người dùng', path: '/users', icon: Users, roles: ['ADMIN'] },
      ]
    }
  ];

  if (IS_DEMO_MODE) {
    navigationSections.push({
      label: 'PHÁT TRIỂN · DEMO',
      items: [
        { name: 'Tiến độ phát triển', path: '/development-roadmap', icon: Workflow }
      ]
    });
  }

  const checkIsActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DemoBanner />
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-bold flex items-center gap-2 mb-1">
              <Package className="w-6 h-6 text-indigo-400 shrink-0" />
              <span className="truncate">{APP_CONFIG.shortName}</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium leading-tight">
              {APP_CONFIG.subtitle}
            </p>
          </div>
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-6">
              {navigationSections.map((section) => (
                <div key={section.label}>
                  <h2 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    {section.label}
                  </h2>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      if (item.roles && user && !item.roles.includes(user.role)) return null;
                      
                      const isActive = checkIsActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors group",
                            isActive 
                              ? "bg-indigo-600 text-white" 
                              : "text-slate-300 hover:bg-slate-800 hover:text-white"
                          )}
                        >
                          <item.icon className="w-5 h-5 shrink-0" />
                          <span className="flex-1 truncate text-sm font-medium">{item.name}</span>
                          {item.comingSoon && (
                            <span className={cn(
                              "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0",
                              isActive ? "bg-indigo-500 text-indigo-50" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
                            )}>
                              Sắp triển khai
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="text-sm overflow-hidden pr-2">
                <p className="font-medium truncate">{user?.name}</p>
                <p className="text-slate-400 text-xs">{user?.role}</p>
              </div>
              <button 
                onClick={logout}
                className="p-2 shrink-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto h-full">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

