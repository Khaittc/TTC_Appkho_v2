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
    <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 flex flex-col sm:flex-row items-center justify-between text-sm shadow-sm sticky top-0 z-50">
      <div className="flex items-center text-amber-900 font-medium mb-2 sm:mb-0">
        <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded mr-2">DEMO SANDBOX</span>
        <span>Dữ liệu giả lập - Không lưu lên server thật</span>
      </div>
      <div className="flex items-center gap-4 text-amber-900">
        <div className="flex items-center gap-2">
          <label htmlFor="demo-role-select" className="text-xs font-medium">Vai trò:</label>
          <select 
            id="demo-role-select"
            value={user?.role || 'ADMIN'} 
            onChange={handleRoleChange}
            className="text-xs border-amber-300 rounded bg-white text-slate-800 py-1 pl-2 pr-6"
          >
            <option value="ADMIN">Quản trị viên (ADMIN)</option>
            <option value="MANAGER">Quản lý kho (MANAGER)</option>
            <option value="ENGINEER">Kỹ sư (ENGINEER)</option>
            
          </select>
        </div>
        <button 
          onClick={handleReset}
          className="flex items-center gap-1.5 bg-amber-200 hover:bg-amber-300 transition-colors text-amber-900 px-3 py-1 rounded text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Khôi phục dữ liệu
        </button>
      </div>
    </div>
  );
}
