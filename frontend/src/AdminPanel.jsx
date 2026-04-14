import { useState, useMemo } from 'react';
import Layout from './Layout';
import { useApp } from './AppContext';
import { apiFetch } from './api';
import { statusClass } from './OrderDetailModal';
import OrderDetailModal from './OrderDetailModal';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminPanel() {
  const { orders, products, setProducts, categories, setCategories, customers, setCustomers, users, setUsers, showToast } = useApp();
  const [tab, setTab] = useState('dashboard');
  const [detailOrder, setDetailOrder] = useState(null);
  const [adminOrderFilter, setAdminOrderFilter] = useState('All');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', nameMarathi: '', nameHindi: '', category: '', pricePerKg: 0, weightsStr: '100g,250g,500g,1 kg' });
  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState({ nameEn: '', nameMr: '', nameHi: '', icon: '' });
  const [showCustForm, setShowCustForm] = useState(false);
  const [custForm, setCustForm] = useState({ name: '', phone: '', address: '' });
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', password: '', name: '', role: 'sales' });

  const tabDefs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', count: 0 },
    { id: 'allOrders', label: 'Orders', icon: '📦', count: orders.length },
    { id: 'products', label: 'Products', icon: '🌶️', count: 0 },
    { id: 'catMaster', label: 'Categories', icon: '📁', count: 0 },
    { id: 'customers', label: 'Customers', icon: '👥', count: 0 },
    { id: 'users', label: 'Users', icon: '🔐', count: 0 },
  ];

  const stats = useMemo(() => [
    { label: 'Total Orders', value: orders.length },
    { label: 'Pending', value: orders.filter(o => o.status === 'Pending').length },
    { label: 'In Progress', value: orders.filter(o => ['Ordered', 'Processing', 'Out for Delivery'].includes(o.status)).length },
    { label: 'Delivered', value: orders.filter(o => o.status === 'Delivered').length },
  ], [orders]);

  const filteredOrders = useMemo(() => {
    if (adminOrderFilter === 'All') return orders;
    return orders.filter(o => o.status === adminOrderFilter);
  }, [orders, adminOrderFilter]);

  // Product CRUD
  const openProductForm = () => { setEditingProduct(null); setProductForm({ name: '', nameMarathi: '', nameHindi: '', category: '', pricePerKg: 0, weightsStr: '100g,250g,500g,1 kg' }); setShowProductForm(true); };
  const editProduct = (p) => { setEditingProduct(p.id); setProductForm({ name: p.name, nameMarathi: p.nameMarathi, nameHindi: p.nameHindi, category: p.category, pricePerKg: p.pricePerKg, weightsStr: p.weights.join(',') }); setShowProductForm(true); };
  const saveProduct = async () => {
    if (!productForm.name || !productForm.pricePerKg) { showToast('Please fill required fields'); return; }
    const weights = productForm.weightsStr.split(',').map(w => w.trim()).filter(Boolean);
    let categoryId = null;
    if (productForm.category) { const c = categories.find(x => x.id === productForm.category); if (c) categoryId = c.dbId; }
    try {
      if (editingProduct) {
        const u = await apiFetch('/products/' + editingProduct, { method: 'PUT', body: JSON.stringify({ name: productForm.name, nameMarathi: productForm.nameMarathi, nameHindi: productForm.nameHindi, categoryId, pricePerKg: Number(productForm.pricePerKg), weights }) });
        setProducts(prev => prev.map(p => p.id === editingProduct ? u : p));
      } else {
        const c = await apiFetch('/products', { method: 'POST', body: JSON.stringify({ name: productForm.name, nameMarathi: productForm.nameMarathi || productForm.name, nameHindi: productForm.nameHindi || productForm.name, categoryId, pricePerKg: Number(productForm.pricePerKg), weights }) });
        setProducts(prev => [...prev, c]);
      }
      setShowProductForm(false); setEditingProduct(null); showToast('Product saved');
    } catch (err) { showToast(err.message); }
  };
  const deleteProduct = async (id) => { try { await apiFetch('/products/' + id, { method: 'DELETE' }); setProducts(prev => prev.filter(p => p.id !== id)); showToast('Product deleted'); } catch (err) { showToast(err.message); } };

  // Category CRUD
  const saveCategory = async () => {
    if (!catForm.nameEn) { showToast('Name required'); return; }
    try { const c = await apiFetch('/categories', { method: 'POST', body: JSON.stringify({ nameEn: catForm.nameEn, nameMr: catForm.nameMr || catForm.nameEn, nameHi: catForm.nameHi || catForm.nameEn, icon: catForm.icon || '🍛' }) }); setCategories(prev => [...prev, c]); setShowCatForm(false); showToast('Category added'); } catch (err) { showToast(err.message); }
  };
  const deleteCategory = async (cat) => { if (!cat.dbId) return; try { await apiFetch('/categories/' + cat.dbId, { method: 'DELETE' }); setCategories(prev => prev.filter(c => c.id !== cat.id)); showToast('Category deleted'); } catch (err) { showToast(err.message); } };

  // Customer CRUD
  const saveCustomer = async () => {
    if (!custForm.name || !custForm.phone) { showToast('Name and phone required'); return; }
    try { const c = await apiFetch('/customers', { method: 'POST', body: JSON.stringify(custForm) }); setCustomers(prev => [...prev, c]); setShowCustForm(false); showToast('Customer added'); } catch (err) { showToast(err.message || 'Phone already exists'); }
  };
  const deleteCustomer = async (c) => { try { await apiFetch('/customers/' + c.id, { method: 'DELETE' }); setCustomers(prev => prev.filter(x => x.id !== c.id)); showToast('Customer deleted'); } catch (err) { showToast(err.message); } };

  // User CRUD
  const saveUser = async () => {
    if (!userForm.name || !userForm.username || !userForm.password) { showToast('All fields required'); return; }
    try { const c = await apiFetch('/users', { method: 'POST', body: JSON.stringify(userForm) }); setUsers(prev => [...prev, c]); setShowUserForm(false); showToast('User added'); } catch (err) { showToast(err.message || 'Username exists'); }
  };
  const deleteUser = async (u) => { try { await apiFetch('/users/' + u.id, { method: 'DELETE' }); setUsers(prev => prev.filter(x => x.id !== u.id)); showToast('User deleted'); } catch (err) { showToast(err.message); } };

  const getCustomerOrderCount = (phone) => orders.filter(o => o.phone === phone).length;

  return (
    <Layout tabs={tabDefs} currentTab={tab} onTabChange={setTab}>
      {/* DASHBOARD */}
      {tab === 'dashboard' && (
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {stats.map(s => (<div key={s.label} className="card-light rounded-xl p-4 text-center fade-up"><p className="text-2xl font-extrabold text-spk-600">{s.value}</p><p className="text-xs text-warm-500 mt-1">{s.label}</p></div>))}
          </div>
          <div className="card-light rounded-2xl p-4">
            <h2 className="section-heading text-spk-700 font-bold text-base mb-4">Recent Orders</h2>
            <div className="overflow-x-auto"><table className="w-full data-table"><thead><tr className="text-left"><th className="px-3 py-2 rounded-tl-lg">Order ID</th><th className="px-3 py-2">Customer</th><th className="px-3 py-2">Sales Person</th><th className="px-3 py-2">Total</th><th className="px-3 py-2">Status</th><th className="px-3 py-2 rounded-tr-lg">Date</th></tr></thead>
              <tbody>{orders.slice(0, 8).map(o => (
                <tr key={o.id} className="border-b border-warm-100 cursor-pointer" onClick={() => setDetailOrder(o)}>
                  <td className="px-3 py-2.5 font-mono font-bold text-spk-600">{o.id}</td>
                  <td className="px-3 py-2.5">{o.customer}</td>
                  <td className="px-3 py-2.5 text-warm-500">{o.salesPerson || '-'}</td>
                  <td className="px-3 py-2.5 font-semibold">₹{o.total.toFixed(0)}</td>
                  <td className="px-3 py-2.5"><span className={`status-pill ${statusClass(o.status)}`}>{o.status}</span></td>
                  <td className="px-3 py-2.5 text-warm-500 text-xs">{o.date}</td>
                </tr>
              ))}</tbody></table></div>
          </div>
        </div>
      )}

      {/* ALL ORDERS */}
      {tab === 'allOrders' && (
        <div className="max-w-4xl mx-auto px-4 py-5"><div className="card-light rounded-2xl p-4">
          <h2 className="section-heading text-spk-700 font-bold text-base mb-4">All Orders</h2>
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-thin">
            {['All','Pending','Ordered','Processing','Out for Delivery','Delivered','Returned'].map(f => (
              <button key={f} onClick={() => setAdminOrderFilter(f)} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${adminOrderFilter === f ? 'bg-spk-500 text-white border-spk-400' : 'bg-white text-warm-600 border-warm-300'}`}>{f}</button>
            ))}
          </div>
          <div className="overflow-x-auto"><table className="w-full data-table"><thead><tr className="text-left"><th className="px-3 py-2 rounded-tl-lg">Order ID</th><th className="px-3 py-2">Customer</th><th className="px-3 py-2">Phone</th><th className="px-3 py-2">Sales By</th><th className="px-3 py-2">Items</th><th className="px-3 py-2">Total</th><th className="px-3 py-2">Status</th><th className="px-3 py-2 rounded-tr-lg">Date</th></tr></thead>
            <tbody>{filteredOrders.map(o => (
              <tr key={o.id} className="border-b border-warm-100 cursor-pointer" onClick={() => setDetailOrder(o)}>
                <td className="px-3 py-2.5 font-mono font-bold text-spk-600">{o.id}</td>
                <td className="px-3 py-2.5 font-semibold">{o.customer}</td>
                <td className="px-3 py-2.5 text-warm-500 text-xs">{o.phone}</td>
                <td className="px-3 py-2.5 text-warm-500 text-xs">{o.salesPerson || '-'}</td>
                <td className="px-3 py-2.5 text-center">{o.items.length}</td>
                <td className="px-3 py-2.5 font-semibold">₹{o.total.toFixed(0)}</td>
                <td className="px-3 py-2.5"><span className={`status-pill ${statusClass(o.status)}`}>{o.status}</span></td>
                <td className="px-3 py-2.5 text-warm-500 text-xs">{o.date}</td>
              </tr>
            ))}</tbody></table></div>
          {filteredOrders.length === 0 && <div className="text-center py-8 text-warm-500">No orders found</div>}
        </div></div>
      )}

      {/* PRODUCTS */}
      {tab === 'products' && (
        <div className="max-w-4xl mx-auto px-4 py-5"><div className="card-light rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-heading text-spk-700 font-bold text-base">Product Master</h2>
            <button onClick={openProductForm} className="bg-spk-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-spk-400 active:scale-95 flex items-center gap-1"><Plus className="w-4 h-4" /> Add Product</button>
          </div>
          {showProductForm && (
            <div className="card-inner rounded-xl p-4 mb-4">
              <h3 className="font-bold text-sm text-warm-800 mb-3">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <div className="grid grid-cols-2 gap-3">
                <input value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} placeholder="Name (English)" className="bg-warm-50 border border-warm-300 rounded-lg px-3 py-2.5 text-sm outline-none" />
                <input value={productForm.nameMarathi} onChange={e => setProductForm({ ...productForm, nameMarathi: e.target.value })} placeholder="Name (Marathi)" className="bg-warm-50 border border-warm-300 rounded-lg px-3 py-2.5 text-sm outline-none" />
                <input value={productForm.nameHindi} onChange={e => setProductForm({ ...productForm, nameHindi: e.target.value })} placeholder="Name (Hindi)" className="bg-warm-50 border border-warm-300 rounded-lg px-3 py-2.5 text-sm outline-none" />
                <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className="bg-warm-50 border border-warm-300 rounded-lg px-3 py-2.5 text-sm outline-none">
                  <option value="">Select Category</option>
                  {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
                </select>
                <input type="number" value={productForm.pricePerKg} onChange={e => setProductForm({ ...productForm, pricePerKg: e.target.value })} placeholder="Price per Kg (₹)" className="bg-warm-50 border border-warm-300 rounded-lg px-3 py-2.5 text-sm outline-none" />
                <input value={productForm.weightsStr} onChange={e => setProductForm({ ...productForm, weightsStr: e.target.value })} placeholder="Weights (e.g. 100g,250g,500g,1 kg)" className="bg-warm-50 border border-warm-300 rounded-lg px-3 py-2.5 text-sm outline-none" />
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={saveProduct} className="bg-spk-500 text-white text-xs font-bold px-5 py-2 rounded-lg hover:bg-spk-400">Save</button>
                <button onClick={() => { setShowProductForm(false); setEditingProduct(null); }} className="border border-warm-300 text-warm-600 text-xs font-bold px-5 py-2 rounded-lg hover:bg-warm-100">Cancel</button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto"><table className="w-full data-table"><thead><tr className="text-left"><th className="px-3 py-2 rounded-tl-lg">#</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Category</th><th className="px-3 py-2">Price/Kg</th><th className="px-3 py-2">Weights</th><th className="px-3 py-2 rounded-tr-lg">Actions</th></tr></thead>
            <tbody>{products.map((p, i) => (
              <tr key={p.id} className="border-b border-warm-100">
                <td className="px-3 py-2.5 text-warm-500">{i + 1}</td>
                <td className="px-3 py-2.5"><p className="font-semibold">{p.name}</p><p className="text-xs text-warm-500">{p.nameMarathi}</p></td>
                <td className="px-3 py-2.5"><span className="text-xs bg-spk-50 text-spk-600 px-2 py-0.5 rounded-full font-semibold">{p.category}</span></td>
                <td className="px-3 py-2.5 font-semibold">₹{p.pricePerKg}</td>
                <td className="px-3 py-2.5 text-xs text-warm-500">{p.weights.join(', ')}</td>
                <td className="px-3 py-2.5"><div className="flex gap-1.5"><button onClick={() => editProduct(p)} className="text-blue-500 hover:text-blue-700"><Pencil className="w-4 h-4" /></button><button onClick={() => deleteProduct(p.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></div></td>
              </tr>
            ))}</tbody></table></div>
        </div></div>
      )}

      {/* CATEGORIES */}
      {tab === 'catMaster' && (
        <div className="max-w-4xl mx-auto px-4 py-5"><div className="card-light rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-heading text-spk-700 font-bold text-base">Category Master</h2>
            <button onClick={() => { setShowCatForm(!showCatForm); setCatForm({ nameEn: '', nameMr: '', nameHi: '', icon: '' }); }} className="bg-spk-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-spk-400 active:scale-95 flex items-center gap-1"><Plus className="w-4 h-4" /> Add Category</button>
          </div>
          {showCatForm && (
            <div className="card-inner rounded-xl p-4 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <input value={catForm.nameEn} onChange={e => setCatForm({ ...catForm, nameEn: e.target.value })} placeholder="Name (English)" className="bg-warm-50 border border-warm-300 rounded-lg px-3 py-2.5 text-sm outline-none" />
                <input value={catForm.nameMr} onChange={e => setCatForm({ ...catForm, nameMr: e.target.value })} placeholder="Name (Marathi)" className="bg-warm-50 border border-warm-300 rounded-lg px-3 py-2.5 text-sm outline-none" />
                <input value={catForm.nameHi} onChange={e => setCatForm({ ...catForm, nameHi: e.target.value })} placeholder="Name (Hindi)" className="bg-warm-50 border border-warm-300 rounded-lg px-3 py-2.5 text-sm outline-none" />
                <input value={catForm.icon} onChange={e => setCatForm({ ...catForm, icon: e.target.value })} placeholder="Icon emoji (e.g. 🌶️)" className="bg-warm-50 border border-warm-300 rounded-lg px-3 py-2.5 text-sm outline-none" />
              </div>
              <div className="flex gap-2 mt-3"><button onClick={saveCategory} className="bg-spk-500 text-white text-xs font-bold px-5 py-2 rounded-lg">Save</button><button onClick={() => setShowCatForm(false)} className="border border-warm-300 text-warm-600 text-xs font-bold px-5 py-2 rounded-lg">Cancel</button></div>
            </div>
          )}
          <div className="space-y-2">
            {categories.filter(c => c.id !== 'all').map(c => (
              <div key={c.id} className="card-inner rounded-xl px-4 py-3 flex items-center justify-between fade-up">
                <div className="flex items-center gap-3"><span className="text-xl">{c.icon}</span><div><p className="font-semibold text-sm">{c.nameEn || c.id}</p><p className="text-xs text-warm-500">{c.nameMr || ''}</p></div></div>
                <button onClick={() => deleteCategory(c)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div></div>
      )}

      {/* CUSTOMERS */}
      {tab === 'customers' && (
        <div className="max-w-4xl mx-auto px-4 py-5"><div className="card-light rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-heading text-spk-700 font-bold text-base">Customer Master</h2>
            <button onClick={() => { setShowCustForm(!showCustForm); setCustForm({ name: '', phone: '', address: '' }); }} className="bg-spk-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-spk-400 active:scale-95 flex items-center gap-1"><Plus className="w-4 h-4" /> Add Customer</button>
          </div>
          {showCustForm && (
            <div className="card-inner rounded-xl p-4 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <input value={custForm.name} onChange={e => setCustForm({ ...custForm, name: e.target.value })} placeholder="Customer Name" className="bg-warm-50 border border-warm-300 rounded-lg px-3 py-2.5 text-sm outline-none" />
                <input value={custForm.phone} onChange={e => setCustForm({ ...custForm, phone: e.target.value })} placeholder="Phone (10 digits)" maxLength="10" className="bg-warm-50 border border-warm-300 rounded-lg px-3 py-2.5 text-sm outline-none" />
                <input value={custForm.address} onChange={e => setCustForm({ ...custForm, address: e.target.value })} placeholder="Address" className="col-span-2 bg-warm-50 border border-warm-300 rounded-lg px-3 py-2.5 text-sm outline-none" />
              </div>
              <div className="flex gap-2 mt-3"><button onClick={saveCustomer} className="bg-spk-500 text-white text-xs font-bold px-5 py-2 rounded-lg">Save</button><button onClick={() => setShowCustForm(false)} className="border border-warm-300 text-warm-600 text-xs font-bold px-5 py-2 rounded-lg">Cancel</button></div>
            </div>
          )}
          <div className="overflow-x-auto"><table className="w-full data-table"><thead><tr className="text-left"><th className="px-3 py-2 rounded-tl-lg">#</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Phone</th><th className="px-3 py-2">Address</th><th className="px-3 py-2">Orders</th><th className="px-3 py-2 rounded-tr-lg">Actions</th></tr></thead>
            <tbody>{customers.map((c, i) => (
              <tr key={c.id || c.phone} className="border-b border-warm-100">
                <td className="px-3 py-2.5 text-warm-500">{i + 1}</td>
                <td className="px-3 py-2.5 font-semibold">{c.name}</td>
                <td className="px-3 py-2.5 font-mono text-sm">{c.phone}</td>
                <td className="px-3 py-2.5 text-warm-500 text-xs">{c.address || '-'}</td>
                <td className="px-3 py-2.5 text-center">{getCustomerOrderCount(c.phone)}</td>
                <td className="px-3 py-2.5"><button onClick={() => deleteCustomer(c)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}</tbody></table></div>
        </div></div>
      )}

      {/* USERS */}
      {tab === 'users' && (
        <div className="max-w-4xl mx-auto px-4 py-5"><div className="card-light rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-heading text-spk-700 font-bold text-base">User Management</h2>
            <button onClick={() => { setShowUserForm(!showUserForm); setUserForm({ username: '', password: '', name: '', role: 'sales' }); }} className="bg-spk-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-spk-400 active:scale-95 flex items-center gap-1"><Plus className="w-4 h-4" /> Add User</button>
          </div>
          {showUserForm && (
            <div className="card-inner rounded-xl p-4 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <input value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} placeholder="Full Name" className="bg-warm-50 border border-warm-300 rounded-lg px-3 py-2.5 text-sm outline-none" />
                <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} className="bg-warm-50 border border-warm-300 rounded-lg px-3 py-2.5 text-sm outline-none"><option value="sales">Sales Person</option><option value="factory">Factory</option><option value="admin">Admin</option></select>
                <input value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} placeholder="Username" className="bg-warm-50 border border-warm-300 rounded-lg px-3 py-2.5 text-sm outline-none" />
                <input value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} placeholder="Password" className="bg-warm-50 border border-warm-300 rounded-lg px-3 py-2.5 text-sm outline-none" />
              </div>
              <div className="flex gap-2 mt-3"><button onClick={saveUser} className="bg-spk-500 text-white text-xs font-bold px-5 py-2 rounded-lg">Save</button><button onClick={() => setShowUserForm(false)} className="border border-warm-300 text-warm-600 text-xs font-bold px-5 py-2 rounded-lg">Cancel</button></div>
            </div>
          )}
          <div className="overflow-x-auto"><table className="w-full data-table"><thead><tr className="text-left"><th className="px-3 py-2 rounded-tl-lg">#</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Username</th><th className="px-3 py-2">Role</th><th className="px-3 py-2 rounded-tr-lg">Actions</th></tr></thead>
            <tbody>{users.map((u, i) => (
              <tr key={u.id || u.username} className="border-b border-warm-100">
                <td className="px-3 py-2.5 text-warm-500">{i + 1}</td>
                <td className="px-3 py-2.5 font-semibold">{u.name}</td>
                <td className="px-3 py-2.5 font-mono text-sm text-warm-500">{u.username}</td>
                <td className="px-3 py-2.5"><span className={`status-pill border ${u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : u.role === 'sales' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>{u.role}</span></td>
                <td className="px-3 py-2.5">{u.username !== 'admin' && <button onClick={() => deleteUser(u)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>}</td>
              </tr>
            ))}</tbody></table></div>
        </div></div>
      )}

      {detailOrder && <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />}
    </Layout>
  );
}
