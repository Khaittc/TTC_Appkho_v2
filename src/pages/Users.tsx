import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AppUser } from '../context/AuthContext';
import { getDataProvider } from '../data/repositoryFactory';
import { UserRole, SidebarPermissionKey, RoleSidebarPermission } from '../types';
import { useNotification } from '../context/NotificationContext';
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';

export const Users: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const provider = getDataProvider();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [permissions, setPermissions] = useState<RoleSidebarPermission[]>([]);

  useEffect(() => {
    const unsubUsers = provider.getUsers(setUsers);
    const unsubPerms = provider.getRoleSidebarPermissions(setPermissions as any);
    return () => { unsubUsers(); unsubPerms(); };
  }, []);

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    if (user?.role !== 'ADMIN') return;
    await provider.updateUserRole(uid, newRole);
    success('Cập nhật phân quyền thành công.');
  };

  const handleTogglePermission = (role: 'MANAGER' | 'ENGINEER', menu: SidebarPermissionKey) => {
    setPermissions(prev => {
      const updated = [...prev];
      const rolePerm = updated.find(p => p.role === role);
      if (rolePerm) {
        if (rolePerm.allowedMenus.includes(menu)) {
          rolePerm.allowedMenus = rolePerm.allowedMenus.filter(m => m !== menu);
        } else {
          rolePerm.allowedMenus.push(menu);
        }
      } else {
        updated.push({ role, allowedMenus: [menu] });
      }
      return updated;
    });
  };

  const savePermissions = async () => {
    if (user?.role !== 'ADMIN') return;
    await provider.updateRoleSidebarPermissions(permissions);
    success('Cập nhật phân quyền thành công.');
  };

  const ALL_MENUS: { key: SidebarPermissionKey, label: string }[] = [
    { key: 'DASHBOARD', label: 'Dashboard' },
    { key: 'MATERIAL_MONITORING', label: 'Giám sát vật tư dự án' },
    { key: 'PROJECTS', label: 'Quản lý dự án' },
    { key: 'ITEMS', label: 'Danh mục vật tư' },
    { key: 'INBOUND', label: 'Nhập kho' },
    { key: 'OUTBOUND', label: 'Xuất kho' },
    { key: 'TRANSACTIONS', label: 'Lịch sử giao dịch' },
    { key: 'MASTER_DATA', label: 'Danh mục hệ thống' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Quản lý người dùng</h1>
        <p className="text-slate-500 text-sm mt-1">Phân quyền vai trò và truy cập</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-800">Danh sách người dùng</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Tên</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map(u => (
              <tr key={u.uid} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium">{u.name}</td>
                <td className="px-6 py-4 text-slate-500">{u.email}</td>
                <td className="px-6 py-4">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                    disabled={user?.role !== 'ADMIN'}
                    className="border-slate-300 rounded-md text-sm"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ENGINEER">ENGINEER</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800">Phân quyền Sidebar</h2>
          <button onClick={savePermissions} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
            Lưu phân quyền
          </button>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 px-4 font-medium text-slate-500 w-64">Menu</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-center">Manager</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-center">Engineer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ALL_MENUS.map(menu => {
                const managerPerm = permissions.find(p => p.role === 'MANAGER')?.allowedMenus.includes(menu.key);
                const engineerPerm = permissions.find(p => p.role === 'ENGINEER')?.allowedMenus.includes(menu.key);

                return (
                  <tr key={menu.key} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-700">{menu.label}</td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={managerPerm || false}
                        onChange={() => handleTogglePermission('MANAGER', menu.key)}
                        disabled={user?.role !== 'ADMIN'}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={engineerPerm || false}
                        onChange={() => handleTogglePermission('ENGINEER', menu.key)}
                        disabled={user?.role !== 'ADMIN'}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
