import { AppProvider, useApp } from './AppContext';
import Login from './Login';
import AdminPanel from './AdminPanel';
import SalesPanel from './SalesPanel';
import FactoryPanel from './FactoryPanel';
import { CheckCircle } from 'lucide-react';

function MainApp() {
  const { user, toast } = useApp();

  let content;
  if (!user) content = <Login />;
  else if (user.role === 'admin') content = <AdminPanel />;
  else if (user.role === 'sales') content = <SalesPanel />;
  else if (user.role === 'factory') content = <FactoryPanel />;

  return (
    <div className="min-h-screen spice-bg">
      {content}
      {toast.show && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] toast-anim">
          <div className="bg-white border border-warm-300 text-warm-800 px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
