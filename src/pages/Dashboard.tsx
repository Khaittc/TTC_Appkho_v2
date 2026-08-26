import { useEffect, useState } from 'react';
import { Item, Transaction } from '../types';
import { AlertTriangle, PackageOpen, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getDataProvider } from '../data/repositoryFactory';

export function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const dataProvider = getDataProvider();

  useEffect(() => {
    // Listen to items
    const unsubscribeItems = dataProvider.getItems(setItems);

    // Listen to recent transactions
    const unsubscribeTx = dataProvider.getTransactions((txData) => {
      // Sort by timestamp desc locally for now
      txData.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      });
      setTransactions(txData.slice(0, 10)); // Just top 10
    });

    return () => {
      unsubscribeItems();
      unsubscribeTx();
    };
  }, []);

  const lowStockItems = items.filter(item => item.currentStock <= item.safetyStock && item.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Tổng quan</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <PackageOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tổng mã vật tư</p>
            <p className="text-2xl font-bold text-slate-900">{items.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-lg text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Cảnh báo tồn kho</p>
            <p className="text-2xl font-bold text-slate-900">{lowStockItems.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg text-green-600">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tổng giao dịch</p>
            <p className="text-2xl font-bold text-slate-900">{transactions.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Cảnh báo tồn kho thấp
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {lowStockItems.length === 0 ? (
              <div className="p-6 text-center text-slate-500">Không có vật tư nào dưới mức an toàn!</div>
            ) : (
              lowStockItems.map(item => (
                <div key={item.id} className="p-4 flex items-center justify-between bg-red-50/30">
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">Model: {item.model}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{item.currentStock} {item.unitName}</p>
                    <p className="text-xs text-slate-500">An toàn: {item.safetyStock}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-900">Giao dịch gần đây</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {transactions.length === 0 ? (
              <div className="p-6 text-center text-slate-500">Chưa có giao dịch nào.</div>
            ) : (
              transactions.map(tx => (
                <div key={tx.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${tx.type === 'INBOUND' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      {tx.type === 'INBOUND' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{tx.itemName}</p>
                      <p className="text-sm text-slate-500">Bởi {tx.userName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'INBOUND' ? 'text-green-600' : 'text-orange-600'}`}>
                      {tx.type === 'INBOUND' ? '+' : '-'}{tx.quantity}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
