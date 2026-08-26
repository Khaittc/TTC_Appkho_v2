import React from 'react';
import { Construction } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  moduleInfo: string;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ title, moduleInfo }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <Construction className="w-8 h-8 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-slate-500 max-w-md text-center">
        Chức năng này sẽ được triển khai tại <strong>{moduleInfo}</strong> theo lộ trình (roadmap).
      </p>
    </div>
  );
};
