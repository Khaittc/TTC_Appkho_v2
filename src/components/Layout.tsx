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
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <DemoBanner />
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col shrink-0 h-full select-none">
          {/* Branding */}
          <div className="p-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm font-bold text-white tracking-tight leading-tight truncate">
                  {APP_CONFIG.shortName}
                </h1>
                <p className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5">
                  {APP_CONFIG.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
            {navigationSections.map((section) => (
              <div key={section.label}>
                <h2 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  {section.label}
                </h2>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    if (item.roles && user && !item.roles.includes(user.role)) return null;
                    
                    const isActive = checkIsActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group text-sm font-medium",
                          isActive 
                            ? "bg-indigo-600 text-white shadow-xs" 
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        <item.icon className="w-4.5 h-4.5 shrink-0 text-slate-400 group-hover:text-slate-200" />
                        <span className="flex-1 truncate">{item.name}</span>
                        {item.comingSoon && (
                          <span className={cn(
                            "text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap",
                            isActive 
                              ? "bg-indigo-500/90 text-white" 
                              : "bg-slate-800 text-slate-400 group-hover:bg-slate-700/80 border border-slate-700/50"
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
          </nav>

          {/* User Footer */}
          <div className="p-3.5 border-t border-slate-800 shrink-0 bg-slate-900/60">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1 pl-1">
                <p className="text-sm font-medium text-slate-200 truncate leading-tight">
                  {user?.name || 'Người dùng'}
                </p>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  {user?.role}
                </p>
              </div>
              <button 
                onClick={logout}
                className="p-2 shrink-0 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Đăng xuất"
                aria-label="Đăng xuất"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50">
          <div className="p-6 lg:p-8 flex-1">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

