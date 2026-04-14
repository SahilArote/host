import { X, Repeat } from 'lucide-react';

export function statusClass(status) {
  const m = {
    'Pending': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Ordered': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    'Processing': 'bg-blue-50 text-blue-700 border border-blue-200',
    'Out for Delivery': 'bg-purple-50 text-purple-700 border border-purple-200',
    'Delivered': 'bg-green-50 text-green-700 border border-green-200',
    'Returned': 'bg-red-50 text-red-700 border border-red-200',
  };
  return m[status] || 'bg-warm-100 text-warm-600 border border-warm-300';
}

export default function OrderDetailModal({ order, onClose, onRepeat, showRepeat }) {
  if (!order) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-spk-600 to-spk-500 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="font-extrabold text-white text-base font-mono">{order.id}</p>
            <p className="text-xs text-red-100/70">{order.date}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white p-1"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-warm-500 font-bold mb-1">Customer</p>
            <p className="text-warm-900 font-semibold text-base">{order.customer}</p>
            <p className="text-sm text-warm-500">{order.phone}{order.address ? ' · ' + order.address : ''}</p>
          </div>
          {order.salesPerson && (
            <div>
              <p className="text-xs uppercase tracking-wider text-warm-500 font-bold mb-1">Sales Person</p>
              <p className="text-warm-800 text-sm">{order.salesPerson}</p>
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-wider text-warm-500 font-bold mb-1">Status</p>
            <span className={`status-pill text-sm ${statusClass(order.status)}`}>{order.status}</span>
          </div>
          {order.returnRemark && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Return Reason</p>
              <p className="text-xs text-red-700 mt-0.5">{order.returnRemark}</p>
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-wider text-warm-500 font-bold mb-2">Items</p>
            <div className="space-y-2">
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-warm-800">{item.name}</span>
                  <span className="text-warm-500">x{item.qty}{item.weight ? ` (${item.weight})` : ''}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-warm-200 pt-3 flex justify-between items-center">
            <span className="font-bold text-warm-900 text-base">Total</span>
            <span className="text-xl font-extrabold text-spk-600">₹{order.total?.toFixed(0)}</span>
          </div>
          {showRepeat && onRepeat && (
            <button onClick={() => { onRepeat(order); onClose(); }}
              className="w-full border border-spk-300 text-spk-600 font-semibold py-3 rounded-xl text-sm hover:bg-spk-50 flex items-center justify-center gap-2 active:scale-[0.98]">
              <Repeat className="w-5 h-5" /> Repeat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
