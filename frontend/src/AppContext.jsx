import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { apiFetch } from './api';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const ALL_CAT = { id: 'all', dbId: null, nameKey: 'catAll', nameEn: 'All', nameMr: 'सर्व', nameHi: 'सभी', icon: '🍛' };

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('spk_user');
      const token = localStorage.getItem('spk_token');
      if (saved && token) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([ALL_CAT]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '' });
  const timerRef = useRef(null);

  const showToast = useCallback((message) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ show: true, message });
    timerRef.current = setTimeout(() => setToast({ show: false, message: '' }), 2500);
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (!data) throw new Error('Invalid username or password');
    localStorage.setItem('spk_token', data.token);
    localStorage.setItem('spk_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('spk_token');
    localStorage.removeItem('spk_user');
    setUser(null);
    setProducts([]);
    setCategories([ALL_CAT]);
    setCustomers([]);
    setOrders([]);
    setUsers([]);
  }, []);

  const loadAllData = useCallback(async (role) => {
    try {
      const [prods, cats, custs, ords] = await Promise.all([
        apiFetch('/products'),
        apiFetch('/categories'),
        apiFetch('/customers'),
        apiFetch('/orders'),
      ]);
      setProducts(prods || []);
      setCategories([ALL_CAT, ...(cats || [])]);
      setCustomers(custs || []);
      setOrders(ords || []);
      if (role === 'admin') {
        const u = await apiFetch('/users');
        setUsers(u || []);
      }
    } catch (err) {
      console.error('Load data error:', err);
    }
  }, []);

  useEffect(() => {
    if (user) loadAllData(user.role);
  }, [user, loadAllData]);

  return (
    <AppContext.Provider value={{
      user, login, logout,
      products, setProducts,
      categories, setCategories,
      customers, setCustomers,
      orders, setOrders,
      users, setUsers,
      loadAllData, toast, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}
