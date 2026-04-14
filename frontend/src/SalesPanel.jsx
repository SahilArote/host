import { useState, useMemo, useCallback } from 'react';
import Layout from './Layout';
import { useApp } from './AppContext';
import { apiFetch } from './api';
import { statusClass } from './OrderDetailModal';
import OrderDetailModal from './OrderDetailModal';
import { Search, X, Minus, Plus, ShoppingCart, PlusCircle, CheckCircle, Factory, Trash2 } from 'lucide-react';

const WEIGHT_TO_KG = { '25g': 0.025, '50g': 0.05, '100g': 0.1, '250g': 0.25, '500g': 0.5, '1 kg': 1 };
const CAT_ICONS = { mirchi: '🌶️', haldi: '💛', masala: '🫙', whole: '🫘', fresh: '🌿' };

export default function SalesPanel() {
  const { products, categories, customers, orders, setOrders, setCustomers, showToast } = useApp();
  const [tab, setTab] = useState('newOrder');
  const [detailOrder, setDetailOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selections, setSelections] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [customerLookup, setCustomerLookup] = useState('');
  const [showCustDropdown, setShowCustDropdown] = useState(false);
  const [customerSelected, setCustomerSelected] = useState(false);
  const [salesOrderFilter, setSalesOrderFilter] = useState('all');
  const [salesOrderSearch, setSalesOrderSearch] = useState('');

  const filteredProducts = useMemo(() => {
    let r = products;
    if (activeCategory !== 'all') r = r.filter(p => p.category === activeCategory);
    if (search.trim()) { const q = search.toLowerCase(); r = r.filter(p => p.name.toLowerCase().includes(q) || (p.nameMarathi || '').includes(q) || (p.nameHindi || '').includes(q) || (p.category || '').toLowerCase().includes(q)); }
    return r;
  }, [products, activeCategory, search]);

  const orderItems = useMemo(() => {
    const items = [];
    for (const [pid, sel] of Object.entries(selections)) {
      const product = products.find(p => p.id === parseInt(pid));
      if (!product || !sel.weight) continue;
      let kg = 0, label = '';
      if (sel.weight === 'custom') { const g = parseInt(sel.customGrams) || 0; if (g <= 0) continue; kg = g / 1000; label = g + 'g'; }
      else { kg = WEIGHT_TO_KG[sel.weight] || 0; label = sel.weight; }
      items.push({ id: product.id, name: product.name, weight: sel.weight, weightLabel: label, pricePerKg: product.pricePerKg, qty: sel.qty, total: product.pricePerKg * kg * sel.qty });
    }
    return items;
  }, [selections, products]);

  const totalItemsCount = orderItems.reduce((s, i) => s + i.qty, 0);
  const grandTotal = orderItems.reduce((s, i) => s + i.total, 0);

  const toggleWeight = (pid, w) => {
    setSelections(prev => { const n = { ...prev }; if (!n[pid]) { n[pid] = { weight: w, customGrams: '', qty: 1 }; } else if (n[pid].weight === w) { delete n[pid]; } else { n[pid] = { ...n[pid], weight: w, customGrams: '' }; } return n; });
  };
  const selectCustomWeight = (pid) => {
    setSelections(prev => { const n = { ...prev }; if (!n[pid]) { n[pid] = { weight: 'custom', customGrams: '', qty: 1 }; } else { n[pid] = { ...n[pid], weight: 'custom' }; } return n; });
  };
  const updateCustomGrams = (pid, val) => { setSelections(prev => { if (!prev[pid]) return prev; return { ...prev, [pid]: { ...prev[pid], customGrams: val } }; }); };
  const incrementQty = (pid) => { setSelections(prev => { if (!prev[pid]) return prev; return { ...prev, [pid]: { ...prev[pid], qty: prev[pid].qty + 1 } }; }); };
  const decrementQty = (pid) => { setSelections(prev => { if (!prev[pid]) return prev; if (prev[pid].qty > 1) return { ...prev, [pid]: { ...prev[pid], qty: prev[pid].qty - 1 } }; const n = { ...prev }; delete n[pid]; return n; }); };
  const removeItem = (pid) => { setSelections(prev => { const n = { ...prev }; delete n[pid]; return n; }); showToast('Item removed'); if (orderItems.length <= 1) setCartOpen(false); };
  const changeCartItemWeight = (pid, w) => { setSelections(prev => { if (!prev[pid]) return prev; return { ...prev, [pid]: { ...prev[pid], weight: w, customGrams: '' } }; }); };
  const getProductWeights = (pid) => { const p = products.find(x => x.id === parseInt(pid)); return p ? p.weights : []; };

  const matchingCustomers = useMemo(() => {
    const q = (customerLookup || '').toLowerCase().trim();
    if (!q) return [];
    return customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q)).slice(0, 5);
  }, [customerLookup, customers]);

  const selectCustomer = (mc) => { setCustomer({ name: mc.name, phone: mc.phone, address: mc.address || '' }); setCustomerLookup(''); setCustomerSelected(true); setShowCustDropdown(false); };
  const clearCustomer = () => { setCustomer({ name: '', phone: '', address: '' }); setCustomerLookup(''); setCustomerSelected(false); };

  const resetSalesState = useCallback(() => {
    setSelections({}); setCustomer({ name: '', phone: '', address: '' }); setCustomerLookup(''); setCustomerSelected(false); setCartOpen(false); setOrderPlaced(false); setSearch(''); setActiveCategory('all');
  }, []);

  const placeOrder = async () => {
    if (!customer.name || !customer.phone) { showToast('Please fill customer info'); return; }
    if (customer.phone.length !== 10 || !/^\d+$/.test(customer.phone)) { showToast('Enter 10-digit phone number'); return; }
    if (orderItems.length === 0) { showToast('Please select spices'); return; }
    try {
      const items = orderItems.map(i => ({ name: i.name, qty: i.qty, weight: i.weightLabel, price: i.total }));
      const data = await apiFetch('/orders', { method: 'POST', body: JSON.stringify({ customer: customer.name, phone: customer.phone, address: customer.address, items, total: grandTotal }) });
      setPlacedOrderId(data.id); setLastPlacedOrder(data);
      setOrders(prev => [data, ...prev]);
      if (!customers.find(c => c.phone === customer.phone)) setCustomers(prev => [...prev, { name: customer.name, phone: customer.phone, address: customer.address }]);
      setCartOpen(false); setOrderPlaced(true);
    } catch (err) { showToast(err.message || 'Order failed'); }
  };

  const forwardLastOrder = async () => {
    if (lastPlacedOrder) {
      try { await apiFetch('/orders/' + lastPlacedOrder.id + '/forward', { method: 'PUT' }); setOrders(prev => prev.map(o => o.id === lastPlacedOrder.id ? { ...o, sentToFactory: true, status: 'Ordered' } : o)); showToast('Forwarded to Factory'); } catch (err) { showToast(err.message); }
    }
    setOrderPlaced(false); resetSalesState();
  };

  const forwardSingleOrder = async (o) => {
    try { await apiFetch('/orders/' + o.id + '/forward', { method: 'PUT' }); setOrders(prev => prev.map(x => x.id === o.id ? { ...x, sentToFactory: true, status: x.status === 'Pending' ? 'Ordered' : x.status } : x)); showToast('Forwarded to Factory'); } catch (err) { showToast(err.message); }
  };

  const repeatOrder = (order) => {
    const newSel = {};
    for (const item of order.items) {
      const product = products.find(p => p.name === item.name || p.nameMarathi === item.name || p.nameHindi === item.name);
      if (product) {
        const w = item.weight || product.weights[1] || product.weights[0];
        if (product.weights.includes(w)) newSel[product.id] = { weight: w, customGrams: '', qty: item.qty };
        else newSel[product.id] = { weight: 'custom', customGrams: String(parseInt(w) || 250), qty: item.qty };
      }
    }
    setSelections(newSel); setCustomer({ name: order.customer, phone: order.phone, address: order.address || '' }); setCustomerSelected(true); setTab('newOrder'); showToast('Order added to cart');
  };

  const mySalesOrders = useMemo(() => orders.filter(o => o.status !== 'Delivered'), [orders]);
  const salesHistoryOrders = useMemo(() => orders.filter(o => o.status === 'Delivered'), [orders]);

  const filteredSalesOrders = useMemo(() => {
    let list = mySalesOrders;
    if (salesOrderFilter === 'pending') list = list.filter(o => !o.sentToFactory);
    else if (salesOrderFilter === 'sent') list = list.filter(o => o.sentToFactory);
    if (salesOrderSearch.trim()) { const q = salesOrderSearch.toLowerCase(); list = list.filter(o => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.phone.includes(q)); }
    return list;
  }, [mySalesOrders, salesOrderFilter, salesOrderSearch]);

  const tabDefs = [
    { id: 'newOrder', label: 'New Order', icon: '📝', count: 0 },
    { id: 'myOrders', label: 'My Orders', icon: '📦', count: mySalesOrders.length },
    { id: 'history', label: 'History', icon: '📋', count: salesHistoryOrders.length },
  ];

  return (
    <Layout tabs={tabDefs} currentTab={tab} onTabChange={setTab}>
      {/* NEW ORDER */}
      {tab === 'newOrder' && (
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
          <section className="card-light rounded-2xl p-4 slide-up">
            <h2 className="section-heading text-spk-700 font-bold text-base mb-4">Select Spices</h2>
            <div className="flex items-center bg-warm-100 border border-warm-300 rounded-xl px-3.5 py-3 mb-4 focus-within:border-spk-400 transition-all">
              <Search className="w-5 h-5 text-warm-500 mr-2.5" />
              <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search spices..." className="bg-transparent outline-none text-base w-full text-warm-900" />
              {search && <button onClick={() => setSearch('')} className="text-warm-500 hover:text-spk-500 ml-2"><X className="w-5 h-5" /></button>}
            </div>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-0.5 scrollbar-thin">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-sm whitespace-nowrap transition-all active:scale-95 ${activeCategory === cat.id ? 'bg-spk-500 text-white border-spk-400 font-bold' : 'bg-white text-warm-700 border-warm-300 hover:border-spk-300'}`}>
                  <span>{cat.icon}</span><span>{cat.nameEn}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {filteredProducts.map(product => (
                <div key={product.id} className={`card-inner rounded-xl p-4 hover:border-spk-300/40 transition-all w-full ${selections[product.id] ? 'border-spk-400/40 bg-spk-50/30' : ''}`}>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-3 min-w-0"><span className="text-xl flex-shrink-0">{CAT_ICONS[product.category] || '🍛'}</span><h4 className="font-bold text-warm-900 text-base leading-tight">{product.name}</h4></div>
                    <p className="text-spk-600 font-extrabold text-base flex-shrink-0 ml-3">₹{product.pricePerKg}<span className="text-warm-500 font-normal text-xs">/kg</span></p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2.5">
                    {product.weights.map(w => (<button key={w} onClick={() => toggleWeight(product.id, w)} className={`pill-weight px-4 py-1.5 rounded-lg border border-warm-300 text-sm text-warm-600 ${selections[product.id]?.weight === w ? 'active' : ''}`}>{w}</button>))}
                    <div className={`flex items-center border border-warm-300 rounded-lg overflow-hidden ${selections[product.id]?.weight === 'custom' ? 'border-spk-400' : ''}`}>
                      <input type="number" placeholder="g" value={selections[product.id]?.customGrams || ''} onFocus={() => selectCustomWeight(product.id)} onChange={e => updateCustomGrams(product.id, e.target.value)} className="w-14 bg-transparent text-center text-sm text-warm-800 py-1.5 outline-none" />
                    </div>
                  </div>
                  {selections[product.id] && (
                    <div className="flex items-center justify-between pt-2.5 border-t border-warm-200">
                      <span className="text-sm text-warm-600">{selections[product.id].weight === 'custom' ? (selections[product.id].customGrams + 'g') : selections[product.id].weight}</span>
                      <div className="flex items-center gap-2.5">
                        <button onClick={() => decrementQty(product.id)} className="w-9 h-9 rounded-lg border border-warm-300 flex items-center justify-center text-warm-600 hover:text-spk-500 active:scale-90 transition-all"><Minus className="w-4 h-4" /></button>
                        <span className="w-7 text-center font-bold text-lg text-warm-900">{selections[product.id].qty}</span>
                        <button onClick={() => incrementQty(product.id)} className="w-9 h-9 rounded-lg bg-spk-500 text-white flex items-center justify-center hover:bg-spk-400 active:scale-90 transition-all"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {filteredProducts.length === 0 && <div className="text-center py-8"><p className="text-warm-500 text-base">No spices found</p></div>}
          </section>
        </div>
      )}

      {/* MY ORDERS */}
      {tab === 'myOrders' && (
        <div className="max-w-2xl mx-auto px-4 py-5"><div className="card-light rounded-2xl p-4">
          <h2 className="section-heading text-spk-700 font-bold text-base mb-4">My Orders</h2>
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-thin">
            {[{ id: 'all', label: 'All' }, { id: 'pending', label: 'Pending' }, { id: 'sent', label: 'Sent to Factory' }].map(f => (
              <button key={f.id} onClick={() => setSalesOrderFilter(f.id)} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${salesOrderFilter === f.id ? 'bg-spk-500 text-white border-spk-400' : 'bg-white text-warm-600 border-warm-300'}`}>{f.label}</button>
            ))}
          </div>
          <div className="flex items-center bg-warm-100 border border-warm-300 rounded-xl px-3.5 py-3 mb-4 focus-within:border-spk-400 transition-all">
            <input value={salesOrderSearch} onChange={e => setSalesOrderSearch(e.target.value)} type="text" placeholder="Search orders..." className="bg-transparent outline-none text-base w-full text-warm-900" />
          </div>
          <div className="space-y-3">
            {filteredSalesOrders.map(o => (
              <div key={o.id} className="card-inner rounded-xl p-4 cursor-pointer" onClick={() => setDetailOrder(o)}>
                <div className="flex items-start justify-between mb-2">
                  <div><p className="font-bold text-spk-700 font-mono text-sm">{o.id}</p><p className="text-sm font-semibold text-warm-800">{o.customer}</p><p className="text-xs text-warm-500">{o.phone}</p></div>
                  <div className="text-right"><span className={`status-pill ${statusClass(o.status)}`}>{o.status}</span><p className="text-xs text-warm-500 mt-1">{o.date}</p></div>
                </div>
                <div className="flex justify-between text-sm text-warm-600 pt-2 border-t border-warm-200"><span>{o.items.length} items</span><span className="font-bold">₹{o.total.toFixed(0)}</span></div>
                {o.status === 'Pending' && (
                  <button onClick={e => { e.stopPropagation(); forwardSingleOrder(o); }} className="w-full mt-2 bg-spk-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-spk-400 flex items-center justify-center gap-1 active:scale-95"><Factory className="w-3.5 h-3.5" /> Forward to Factory</button>
                )}
              </div>
            ))}
            {filteredSalesOrders.length === 0 && <div className="text-center py-10"><p className="text-warm-500 text-base">No orders found</p></div>}
          </div>
        </div></div>
      )}

      {/* HISTORY */}
      {tab === 'history' && (
        <div className="max-w-2xl mx-auto px-4 py-5"><div className="card-light rounded-2xl p-4">
          <h2 className="section-heading text-spk-700 font-bold text-base mb-4">Order History</h2>
          <div className="space-y-3">
            {salesHistoryOrders.map(o => (
              <div key={o.id} className="card-inner rounded-xl p-4 flex items-center justify-between cursor-pointer" onClick={() => setDetailOrder(o)}>
                <div><p className="font-bold text-spk-700 font-mono text-sm">{o.id}</p><p className="text-sm font-semibold text-warm-800">{o.customer}</p><p className="text-xs text-warm-500">{o.date}</p></div>
                <div className="text-right"><span className="font-bold text-warm-900">₹{o.total.toFixed(0)}</span><p><span className="bg-green-50 text-green-700 border border-green-200 status-pill">Delivered</span></p></div>
              </div>
            ))}
            {salesHistoryOrders.length === 0 && <div className="text-center py-10"><p className="text-warm-500">No delivered orders yet</p></div>}
          </div>
        </div></div>
      )}

      {/* FLOATING CART BAR */}
      {tab === 'newOrder' && orderItems.length > 0 && !cartOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-warm-200 via-warm-100/95 to-transparent pt-8 pb-4 px-4 pointer-events-none">
          <div className="max-w-2xl mx-auto pointer-events-auto">
            <div onClick={() => setCartOpen(true)} className="bg-gradient-to-r from-spk-500 to-spk-600 text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl shadow-spk-500/30 cursor-pointer active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3"><ShoppingCart className="w-6 h-6" /><p className="font-extrabold text-base">{totalItemsCount} items</p></div>
              <div className="flex items-center gap-2.5"><span className="font-extrabold text-lg">₹{grandTotal.toFixed(0)}</span><span className="text-sm font-semibold bg-white/20 px-3 py-1.5 rounded-lg">View Cart</span></div>
            </div>
          </div>
        </div>
      )}

      {/* CART SHEET */}
      {cartOpen && (
        <div className="fixed inset-0 z-40 cart-overlay" onClick={() => setCartOpen(false)}>
          <div className="cart-sheet absolute bottom-0 left-0 right-0 border-t border-spk-200/30" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center py-3 cursor-pointer" onClick={() => setCartOpen(false)}><div className="w-10 h-1 rounded-full bg-warm-400" /></div>
            <div className="max-w-2xl mx-auto px-4 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-extrabold text-warm-900 text-lg">Your Order</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setSelections({}); setCartOpen(false); }} className="text-xs text-spk-500 border border-spk-300/40 rounded-lg px-3 py-1.5 hover:bg-spk-50 transition-all">Remove All</button>
                  <button onClick={() => setCartOpen(false)} className="text-warm-500 hover:text-warm-700 p-1"><X className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                {orderItems.map(item => (
                  <div key={item.id + item.weight} className="bg-white rounded-xl p-4 border border-warm-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0"><h4 className="font-bold text-warm-900 text-base">{item.name}</h4><p className="text-sm text-warm-500 mt-0.5">{item.weightLabel} · ₹{item.pricePerKg}/kg</p></div>
                      <div className="flex items-center gap-1.5 bg-spk-50 border border-spk-200 rounded-lg px-1.5 py-1">
                        <button onClick={() => decrementQty(item.id)} className="w-8 h-8 rounded flex items-center justify-center text-spk-500 active:scale-90"><Minus className="w-4 h-4" /></button>
                        <span className="w-7 text-center font-bold text-base text-spk-700">{item.qty}</span>
                        <button onClick={() => incrementQty(item.id)} className="w-8 h-8 rounded flex items-center justify-center text-spk-500 active:scale-90"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-warm-200">
                      <div className="flex items-center gap-1.5">
                        {getProductWeights(item.id).map(w => (<button key={w} onClick={() => changeCartItemWeight(item.id, w)} className={`px-2.5 py-1 rounded border text-xs transition-all ${item.weightLabel === w ? 'bg-spk-500 text-white border-spk-400' : 'border-warm-300 text-warm-600'}`}>{w}</button>))}
                      </div>
                      <div className="flex items-center gap-3"><span className="font-extrabold text-warm-900 text-base">₹{item.total.toFixed(0)}</span><button onClick={() => removeItem(item.id)} className="text-warm-400 hover:text-spk-500"><Trash2 className="w-5 h-5" /></button></div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => setCartOpen(false)} className="w-full border border-dashed border-spk-300/50 text-spk-500 font-semibold py-3 rounded-xl mb-5 flex items-center justify-center gap-2 text-sm hover:bg-spk-50/50 active:scale-[0.98]">
                <PlusCircle className="w-5 h-5" /> Add more spices
              </button>

              {/* Bill */}
              <div className="bg-white rounded-xl p-4 mb-5 border border-warm-200">
                <h3 className="text-sm font-bold text-warm-600 mb-3">Bill Details</h3>
                <div className="space-y-2.5 text-sm">
                  {orderItems.map(item => (<div key={'bill-' + item.id} className="flex justify-between text-warm-600"><span className="truncate mr-2">{item.name} ({item.weightLabel} x{item.qty})</span><span className="flex-shrink-0">₹{item.total.toFixed(0)}</span></div>))}
                  <div className="border-t border-dashed border-warm-300 pt-2 flex justify-between items-center"><span className="font-bold text-warm-900 text-base">Total</span><span className="text-xl font-extrabold text-spk-600">₹{grandTotal.toFixed(0)}</span></div>
                </div>
              </div>

              {/* Customer */}
              <div className="bg-white rounded-xl p-4 mb-5 border border-warm-200 relative">
                <h3 className="text-sm font-bold text-warm-600 mb-3">Customer Info</h3>
                {customerSelected ? (
                  <div className="flex items-center justify-between bg-green-50 rounded-lg px-3.5 py-2.5 border border-green-200">
                    <div className="min-w-0"><p className="text-sm font-semibold text-warm-900">{customer.name}</p><p className="text-xs text-warm-500">{customer.phone}{customer.address ? ' · ' + customer.address : ''}</p></div>
                    <button onClick={clearCustomer} className="text-warm-500 hover:text-spk-500 ml-2"><X className="w-5 h-5" /></button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="relative">
                      <div className="flex items-center bg-warm-100 border border-warm-300 rounded-lg px-3.5 py-2.5 gap-2.5 focus-within:border-spk-400">
                        <Search className="w-4 h-4 text-warm-500 flex-shrink-0" />
                        <input value={customerLookup} onChange={e => { setCustomerLookup(e.target.value); setShowCustDropdown(e.target.value.length > 0); }} onFocus={() => setShowCustDropdown(customerLookup.length > 0)} type="text" placeholder="Find customer (name / phone)" className="bg-transparent outline-none text-sm w-full text-warm-900" />
                      </div>
                      {showCustDropdown && matchingCustomers.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-warm-300 rounded-lg shadow-xl z-30 cust-dropdown">
                          {matchingCustomers.map(mc => (
                            <button key={mc.phone} onClick={() => selectCustomer(mc)} className="w-full text-left px-3.5 py-2.5 hover:bg-spk-50 border-b border-warm-200 last:border-0">
                              <p className="text-sm font-semibold text-warm-900">{mc.name}</p><p className="text-xs text-warm-500">{mc.phone}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-warm-500 text-center">— or new customer —</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      <input value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} type="text" placeholder="Enter name *" className="w-full bg-warm-100 border border-warm-300 rounded-lg px-3.5 py-2.5 text-sm text-warm-900 outline-none" />
                      <input value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} type="tel" placeholder="10-digit mobile *" maxLength="10" className="w-full bg-warm-100 border border-warm-300 rounded-lg px-3.5 py-2.5 text-sm text-warm-900 outline-none" />
                    </div>
                    <input value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} type="text" placeholder="Delivery address" className="w-full bg-warm-100 border border-warm-300 rounded-lg px-3.5 py-2.5 text-sm text-warm-900 outline-none" />
                  </div>
                )}
              </div>

              <button onClick={placeOrder} className="w-full bg-gradient-to-r from-spk-500 to-spk-600 text-white font-extrabold py-4 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base shadow-lg shadow-spk-500/30">
                <CheckCircle className="w-6 h-6" /> Place Order · ₹{grandTotal.toFixed(0)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER CONFIRMATION */}
      {orderPlaced && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm text-center shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-green-500 to-green-600 px-6 py-8">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle className="w-8 h-8 text-white" /></div>
              <h3 className="text-white text-2xl font-extrabold mb-1">Order Successful!</h3>
              <p className="text-green-100 text-sm">Order placed successfully</p>
            </div>
            <div className="p-5 space-y-3">
              <div className="bg-warm-100 rounded-xl p-3.5 border border-warm-300"><p className="text-xs text-warm-500 mb-0.5 uppercase tracking-wider font-bold">Order ID</p><p className="font-extrabold text-xl text-spk-600 font-mono">{placedOrderId}</p></div>
              <button onClick={forwardLastOrder} className="w-full bg-gradient-to-r from-spk-500 to-spk-600 text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 text-base shadow-lg shadow-spk-500/20 active:scale-[0.98]"><Factory className="w-6 h-6" /> Forward to Factory</button>
              <button onClick={() => { setOrderPlaced(false); resetSalesState(); }} className="w-full border border-warm-300 text-warm-600 font-semibold py-3 rounded-xl text-sm">New Order</button>
            </div>
          </div>
        </div>
      )}

      {detailOrder && <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} showRepeat onRepeat={repeatOrder} />}
    </Layout>
  );
}
