import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';
import { IS_DEMO_MODE } from '../../config/env';
import { getDataProvider } from '../../data/repositoryFactory';
import { RefreshCw } from 'lucide-react';

export function DemoBanner() {
  const { user, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  if (!IS_DEMO_MODE) return null;

  const handleReset = async () => {
    if (window.confirm('Thao tác này chỉ ảnh hưởng đến dữ liệu Demo trong trình duyệt hiện tại. Bạn có chắc chắn muốn khôi phục dữ liệu gốc không?')) {
      const provider = getDataProvider();
      await provider.resetDemoData();
      alert('Đã khôi phục dữ liệu Demo thành công!');
      navigate('/');
    }
  };

  const handleRoleChange = (e: import("react").ChangeEvent<HTMLSelectElement>) => {
    if (switchDemoRole) {
      switchDemoRole(e.target.value as UserRole);
    }
  };

  return (
    <header className="bg-amber-100/90 border-b border-amber-200 px-4 py-2 min-h-[44px] flex items-center justify-between gap-3 text-xs shrink-0 z-50">
      <div className="flex items-center gap-2.5 min-w-0 shrink-0">
        <span className="bg-amber-500 text-amber-950 font-bold px-2 py-0.5 rounded text-[11px] tracking-wide uppercase shadow-2xs shrink-0">
          DEMO SANDBOX
        </span>
        <span className="text-amber-900 font-medium truncate hidden sm:inline">
          Dữ liệu giả lập - Không lưu lên server thật
        </span>
        <span className="text-amber-900 font-medium truncate sm:hidden">
          Dữ liệu giả lập
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <label htmlFor="demo-role-select" className="text-amber-900 font-semibold whitespace-nowrap">
            Vai trò:
          </label>
          <select 
            id="demo-role-select"
            value={user?.role || 'ADMIN'} 
            onChange={handleRoleChange}
            className="text-xs border border-amber-300 rounded-md bg-white text-slate-800 py-1 pl-2 pr-6 font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none shadow-2xs"
          >
            <option value="ADMIN">Quản trị viên (ADMIN)</option>
            <option value="MANAGER">Quản lý kho (MANAGER)</option>
            <option value="ENGINEER">Kỹ sư (ENGINEER)</option>
          </select>
        </div>

        <button 
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 bg-amber-200 hover:bg-amber-300 active:bg-amber-400/80 text-amber-950 px-2.5 py-1 rounded-md font-semibold transition-colors border border-amber-300/80 shadow-2xs whitespace-nowrap"
          title="Khôi phục dữ liệu gốc"
        >
          <RefreshCw className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Khôi phục dữ liệu</span>
          <span className="sm:hidden">Khôi phục</span>
        </button>
      </div>
    </header>
  );
}
