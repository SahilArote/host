import { useState, useMemo } from 'react';
import Layout from './Layout';
import { useApp } from './AppContext';
import { apiFetch } from './api';
import { statusClass } from './OrderDetailModal';
import OrderDetailModal from './OrderDetailModal';

export default function FactoryPanel() {
  const { orders, setOrders, showToast } = useApp();
  const [tab, setTab] = useState('factoryDash');
  const [detailOrder, setDetailOrder] = useState(null);
  const [factoryOrderFilter, setFactoryOrderFilter] = useState('All');
  const [returnRemarkOrderId, setReturnRemarkOrderId] = useState(null);
  const [returnRemark, setReturnRemark] = useState('');

  const stats = useMemo(() => [
    { label: 'Total Received', value: orders.length },
    { label: 'Ordered', value: orders.filter(o => o.status === 'Ordered').length },
    { label: 'Processing', value: orders.filter(o => o.status === 'Processing').length },
    { label: 'Returned', value: orders.filter(o => o.status === 'Returned').length },
  ], [orders]);

  const filteredOrders = useMemo(() => {
    if (factoryOrderFilter === 'All') return orders;
    return orders.filter(o => o.status === factoryOrderFilter);
  }, [orders, factoryOrderFilter]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiFetch('/orders/' + orderId + '/status', { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, returnRemark: '' } : o));
      showToast('Status updated to ' + newStatus);
    } catch (err) { showToast(err.message); }
  };

  const returnOrder = async (orderId) => {
    if (!returnRemark.trim()) { showToast('Please enter a reason for return'); return; }
    try {
      await apiFetch('/orders/' + orderId + '/return', { method: 'PUT', body: JSON.stringify({ remark: returnRemark.trim() }) });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Returned', returnRemark: returnRemark.trim() } : o));
      showToast('Order returned');
    } catch (err) { showToast(err.message); }
    setReturnRemarkOrderId(null); setReturnRemark('');
  };

  const tabDefs = [
    { id: 'factoryDash', label: 'Dashboard', icon: '📊', count: 0 },
    { id: 'factoryOrders', label: 'Orders', icon: '📦', count: orders.length },
  ];

  return (
    <Layout tabs={tabDefs} currentTab={tab} onTabChange={setTab}>
      {/* DASHBOARD */}
      {tab === 'factoryDash' && (
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {stats.map(s => (<div key={s.label} className="card-light rounded-xl p-4 text-center fade-up"><p className="text-2xl font-extrabold text-spk-600">{s.value}</p><p className="text-xs text-warm-500 mt-1">{s.label}</p></div>))}
          </div>
        </div>
      )}

      {/* ORDERS */}
      {tab === 'factoryOrders' && (
        <div className="max-w-4xl mx-auto px-4 py-5"><div className="card-light rounded-2xl p-4">
          <h2 className="section-heading text-spk-700 font-bold text-base mb-4">Factory Orders</h2>
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-thin">
            {['All','Ordered','Processing','Out for Delivery','Delivered','Returned'].map(f => (
              <button key={f} onClick={() => setFactoryOrderFilter(f)} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${factoryOrderFilter === f ? 'bg-spk-500 text-white border-spk-400' : 'bg-white text-warm-600 border-warm-300'}`}>{f}</button>
            ))}
          </div>
          <div className="space-y-3">
            {filteredOrders.map(o => (
              <div key={o.id} className="card-inner rounded-xl overflow-hidden">
                <div className="px-4 py-3 flex items-start justify-between">
                  <div className="cursor-pointer" onClick={() => setDetailOrder(o)}>
                    <p className="font-bold text-spk-700 font-mono text-sm">{o.id}</p>
                    <p className="font-semibold text-warm-800 text-sm">{o.customer}</p>
                    <p className="text-xs text-warm-500">{o.phone} · {o.date}</p>
                    <p className="text-xs text-warm-500 mt-0.5">Sales: {o.salesPerson || '-'}</p>
                  </div>
                  <div className="text-right"><span className={`status-pill ${statusClass(o.status)}`}>{o.status}</span><p className="font-bold text-warm-900 mt-1">₹{o.total.toFixed(0)}</p></div>
                </div>
                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-1.5">
                    {o.items.map((item, i) => (<span key={i} className="text-[10px] bg-warm-100 text-warm-600 px-2 py-0.5 rounded-full">{item.name} ({item.weight} x{item.qty})</span>))}
                  </div>
                </div>
                <div className="bg-warm-50 px-4 py-2.5 border-t border-warm-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs text-warm-500 font-semibold">Update Status:</p>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      {['Ordered','Processing','Out for Delivery','Delivered'].map(s => (
                        <button key={s} onClick={() => updateOrderStatus(o.id, s)} className={`px-2 py-1 rounded text-[10px] font-bold transition-all active:scale-95 ${o.status === s ? 'bg-spk-500 text-white' : 'bg-white text-warm-600 border border-warm-300 hover:border-spk-300'}`}>{s.split(' ')[0]}</button>
                      ))}
                      <button onClick={() => { setReturnRemarkOrderId(returnRemarkOrderId === o.id ? null : o.id); setReturnRemark(''); }} className={`px-2 py-1 rounded text-[10px] font-bold transition-all active:scale-95 ${o.status === 'Returned' ? 'bg-red-500 text-white' : 'bg-white text-red-500 border border-red-300 hover:border-red-400'}`}>Return</button>
                    </div>
                  </div>
                  {returnRemarkOrderId === o.id && (
                    <div className="mt-2">
                      <textarea value={returnRemark} onChange={e => setReturnRemark(e.target.value)} rows="2" placeholder="Reason for return..." className="w-full bg-white border border-red-200 rounded-lg px-3 py-2 text-sm text-warm-900 outline-none resize-none focus:border-red-400" />
                      <div className="flex gap-2 mt-1.5">
                        <button onClick={() => returnOrder(o.id)} className="bg-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-red-600 active:scale-95">Confirm Return</button>
                        <button onClick={() => { setReturnRemarkOrderId(null); setReturnRemark(''); }} className="border border-warm-300 text-warm-600 text-xs font-bold px-4 py-1.5 rounded-lg">Cancel</button>
                      </div>
                    </div>
                  )}
                  {o.status === 'Returned' && o.returnRemark && (
                    <div className="mt-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Return Reason:</p>
                      <p className="text-xs text-red-700">{o.returnRemark}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filteredOrders.length === 0 && <div className="text-center py-10"><p className="text-warm-500">No orders found</p></div>}
          </div>
        </div></div>
      )}

      {detailOrder && <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />}
    </Layout>
  );
}
