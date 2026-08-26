import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

export type NotificationType = 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((type: NotificationType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const success = useCallback((message: string) => showNotification('SUCCESS', message), [showNotification]);
  const error = useCallback((message: string) => showNotification('ERROR', message), [showNotification]);
  const warning = useCallback((message: string) => showNotification('WARNING', message), [showNotification]);
  const info = useCallback((message: string) => showNotification('INFO', message), [showNotification]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'ERROR': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'INFO': return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgClass = (type: NotificationType) => {
    switch (type) {
      case 'SUCCESS': return 'bg-white border-green-200';
      case 'ERROR': return 'bg-white border-red-200';
      case 'WARNING': return 'bg-white border-yellow-200';
      case 'INFO': return 'bg-white border-blue-200';
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
        {notifications.map(n => (
          <div key={n.id} className={cn("flex items-start gap-3 p-4 rounded-lg shadow-lg border min-w-[300px] max-w-md animate-in slide-in-from-right-8 fade-in", getBgClass(n.type))}>
            {getIcon(n.type)}
            <div className="flex-1 text-sm font-medium text-slate-800">{n.message}</div>
            <button onClick={() => removeNotification(n.id)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
