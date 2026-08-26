import { useEffect, useState } from 'react';
import { Transaction, Supplier, Project } from '../types';
import { ArrowDownRight, ArrowUpRight, Search } from 'lucide-react';
import { getDataProvider } from '../data/repositoryFactory';

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const dataProvider = getDataProvider();

  useEffect(() => {
    const unsubSuppliers = dataProvider.getSuppliers(setSuppliers);
    const unsubProjects = dataProvider.getProjects(setProjects);

    const unsubscribe = dataProvider.getTransactions((txData) => {
      // Sort desc
      txData.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      });
      setTransactions(txData);
    });

    return () => {
      unsubSuppliers();
      unsubProjects();
      unsubscribe();
    };
  }, []);

  const getSupplierName = (id?: string) => {
    if (!id) return 'N/A';
    const s = suppliers.find(sup => sup.id === id);
    return s ? s.name : id;
  };

  const getProjectName = (id?: string) => {
    if (!id) return 'N/A';
    const p = projects.find(proj => proj.id === id);
    return p ? p.name : id;
  };

  const filtered = transactions.filter(tx => {
    const sName = getSupplierName(tx.supplierId);
    const pName = getProjectName(tx.projectId);
    
    return tx.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lịch sử giao dịch</h1>
          <p className="text-slate-500 mt-1">Theo dõi các hoạt động nhập xuất kho</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm theo vật tư, người thực hiện, NCC, dự án..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Thời gian</th>
                <th className="px-6 py-4 font-medium">Loại</th>
                <th className="px-6 py-4 font-medium">Vật tư</th>
                <th className="px-6 py-4 font-medium text-right">Số lượng</th>
                <th className="px-6 py-4 font-medium">Người thực hiện</th>
                <th className="px-6 py-4 font-medium">Chi tiết (NCC/Dự án)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                    {new Date(tx.timestamp).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${tx.type === 'INBOUND' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {tx.type === 'INBOUND' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      {tx.type === 'INBOUND' ? 'NHẬP KHO' : 'XUẤT KHO'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{tx.itemName}</td>
                  <td className={`px-6 py-4 text-right font-bold ${tx.type === 'INBOUND' ? 'text-green-600' : 'text-orange-600'}`}>
                    {tx.type === 'INBOUND' ? '+' : '-'}{tx.quantity}
                  </td>
                  <td className="px-6 py-4 text-slate-700">{tx.userName}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {tx.type === 'INBOUND' ? (
                      <span className="text-sm">{getSupplierName(tx.supplierId)}</span>
                    ) : (
                      <span className="text-sm font-medium text-indigo-600">{getProjectName(tx.projectId)}</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Không tìm thấy giao dịch nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
