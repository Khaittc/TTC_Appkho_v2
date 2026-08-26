import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SidebarPermissionKey, RoleSidebarPermission } from '../types';
import { useNotification } from '../context/NotificationContext';
import { getDataProvider } from '../data/repositoryFactory';
import { Package } from 'lucide-react';

interface Props {
  permissionKey: SidebarPermissionKey;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<Props> = ({ permissionKey, children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { error } = useNotification();
  const provider = getDataProvider();

  useEffect(() => {
    if (!user) {
      setHasPermission(false);
      return;
    }
    if (user.role === 'ADMIN') {
      setHasPermission(true);
      return;
    }
    const unsub = provider.getRoleSidebarPermissions((perms) => {
      const rolePerms = perms?.find(p => p.role === user.role);
      if (rolePerms && rolePerms.allowedMenus.includes(permissionKey)) {
        setHasPermission(true);
      } else {
        setHasPermission(false);
      }
    });
    return () => unsub();
  }, [user, permissionKey]);

  if (hasPermission === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Package className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-[80vh]">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md w-full">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Truy cập bị từ chối</h2>
          <p className="text-slate-600 mb-6">Bạn không có quyền truy cập chức năng này.</p>
          <a href="/" className="bg-indigo-600 text-white px-4 py-2 rounded-lg inline-block">Về trang chủ</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
