import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { IS_DEMO_MODE } from '../config/env';

export type { UserRole } from '../types';
import { UserRole } from '../types';

export interface AppUser {
  uid: string;
  email: string | null;
  name: string | null;
  role: UserRole;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole?: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: import("react").ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (IS_DEMO_MODE) {
      // Load saved demo user or use default
      const savedRole = sessionStorage.getItem('demo_role') as UserRole || 'ADMIN';
      setUser({
        uid: `demo-${savedRole.toLowerCase()}`,
        email: `demo.${savedRole.toLowerCase()}@example.test`,
        name: `Demo ${savedRole.charAt(0) + savedRole.slice(1).toLowerCase()}`,
        role: savedRole
      });
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const existingData = userDoc.data() as AppUser;
          if (firebaseUser.email === 'tranquockhai.ttc@gmail.com' && existingData.role !== 'ADMIN') {
            existingData.role = 'ADMIN';
            await setDoc(userDocRef, { role: 'ADMIN' }, { merge: true });
          }
          setUser(existingData);
        } else {
          const isAdmin = firebaseUser.email === 'tranquockhai.ttc@gmail.com' || firebaseUser.email?.toLowerCase().includes('admin');
          const role: UserRole = isAdmin ? 'ADMIN' : 'ENGINEER';
          const newUser: AppUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'Người dùng',
            role: role 
          };
          await setDoc(userDocRef, newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    if (IS_DEMO_MODE) {
      alert('Đăng nhập bằng Google đã bị vô hiệu hóa trong chế độ Demo.');
      return;
    }
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    if (IS_DEMO_MODE) {
      alert('Tính năng đăng xuất đã bị vô hiệu hóa trong phiên bản Demo.');
      return;
    }
    await auth.signOut();
  };

  const switchDemoRole = (role: UserRole) => {
    if (!IS_DEMO_MODE) return;
    sessionStorage.setItem('demo_role', role);
    setUser({
      uid: `demo-${role.toLowerCase()}`,
      email: `demo.${role.toLowerCase()}@example.test`,
      name: `Demo ${role.charAt(0) + role.slice(1).toLowerCase()}`,
      role: role
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};

