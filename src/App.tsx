import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LocaleProvider } from './context/LocaleContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { Items } from './pages/Items';
import { Inbound } from './pages/Inbound';
import { Outbound } from './pages/Outbound';
import { Transactions } from './pages/Transactions';
import { Users } from './pages/Users';
import { MasterData } from './pages/MasterData';
import { DevelopmentRoadmapPage } from './pages/DevelopmentRoadmapPage';
import { PermissionGuard } from './components/PermissionGuard';
import { AdminGuard } from './components/AdminGuard';
import { ComingSoonPage } from './components/ComingSoonPage';

function App() {
  return (
    <LocaleProvider>
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<PermissionGuard permissionKey="DASHBOARD"><Dashboard /></PermissionGuard>} />
                  <Route path="/project-material-monitoring" element={<PermissionGuard permissionKey="MATERIAL_MONITORING"><ComingSoonPage title="Giám sát vật tư dự án" moduleInfo="MODULE 8" /></PermissionGuard>} />
                  <Route path="/projects/*" element={<PermissionGuard permissionKey="PROJECTS"><ComingSoonPage title="Quản lý dự án" moduleInfo="MODULE 2" /></PermissionGuard>} />
                  <Route path="/items" element={<PermissionGuard permissionKey="ITEMS"><Items /></PermissionGuard>} />
                  <Route path="/inbound" element={<PermissionGuard permissionKey="INBOUND"><Inbound /></PermissionGuard>} />
                  <Route path="/outbound" element={<PermissionGuard permissionKey="OUTBOUND"><Outbound /></PermissionGuard>} />
                  <Route path="/transactions" element={<PermissionGuard permissionKey="TRANSACTIONS"><Transactions /></PermissionGuard>} />
                  <Route path="/master-data" element={<PermissionGuard permissionKey="MASTER_DATA"><MasterData /></PermissionGuard>} />
                  <Route path="/users" element={<AdminGuard><Users /></AdminGuard>} />
                  <Route path="/development-roadmap" element={<AdminGuard><DevelopmentRoadmapPage /></AdminGuard>} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    </LocaleProvider>
  );
}

export default App;
