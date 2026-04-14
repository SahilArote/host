import { LogOut } from 'lucide-react';
import { useApp } from './AppContext';

export default function Layout({ tabs, currentTab, onTabChange, children }) {
  const { user, logout } = useApp();

  return (
    <div className="min-h-screen text-warm-900">
      <header className="header-grad sticky top-0 z-30 shadow-lg shadow-spk-900/20">
        <div className="max-w-4xl mx-auto px-4 py-3 relative z-10">
          <div className="flex items-center gap-3">
            <svg className="logo-circle flex-shrink-0" width="42" height="42" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="97" fill="white" stroke="#BE1E2D" strokeWidth="2"/>
              <circle cx="100" cy="100" r="88" fill="none" stroke="#BE1E2D" strokeWidth="0.8" strokeDasharray="2,5"/>
              <defs>
                <path id="hAt" d="M 25,100 A 75,75 0 0,1 175,100" fill="none"/>
                <path id="hAb" d="M 170,115 A 70,70 0 0,1 30,115" fill="none"/>
              </defs>
              <text fontFamily="Poppins,sans-serif" fontSize="13" fontWeight="700" fill="#BE1E2D" letterSpacing="4">
                <textPath href="#hAt" startOffset="50%" textAnchor="middle">SPECIALIST IN SPICES</textPath>
              </text>
              <text fontFamily="Poppins,sans-serif" fontSize="13" fontWeight="700" fill="#BE1E2D" letterSpacing="4">
                <textPath href="#hAb" startOffset="50%" textAnchor="middle">SINCE 1930</textPath>
              </text>
              <text x="26" y="107" fontSize="9" fill="#BE1E2D">★</text>
              <text x="168" y="107" fontSize="9" fill="#BE1E2D">★</text>
              <circle cx="100" cy="92" r="38" fill="#BE1E2D"/>
              <text x="100" y="100" fontFamily="Poppins,sans-serif" fontSize="30" fontWeight="900" fill="white" textAnchor="middle">SPK</text>
            </svg>
            <div className="flex-1 min-w-0">
              <h1 className="font-extrabold text-sm text-white leading-tight">SP Khamkar & Sons</h1>
              <p className="text-[9px] text-red-200/70">{user?.name} · {user?.roleName}</p>
            </div>
            <button onClick={logout} className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold px-3 py-1.5 rounded-full transition-all">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto scrollbar-thin">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-[11px] font-semibold text-white transition-all active:scale-95 whitespace-nowrap flex-shrink-0 ${
                  currentTab === tab.id ? 'bg-white/20 border-white/40' : 'bg-transparent border-white/15 hover:border-white/30'
                }`}>
                <span className="text-xs">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count > 0 && <span className="bg-white/20 text-[9px] px-1.5 rounded-full font-bold">{tab.count}</span>}
              </button>
            ))}
          </div>
        </div>
      </header>
      <div className="spice-strip" />
      <div className="relative z-10">{children}</div>
      <footer className="relative z-10 border-t border-warm-300 mt-8 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <svg className="flex-shrink-0" width="30" height="30" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="97" fill="#BE1E2D"/>
                <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="1" strokeDasharray="2,4" opacity="0.5"/>
                <text x="100" y="110" fontFamily="Poppins,sans-serif" fontSize="50" fontWeight="900" fill="white" textAnchor="middle">SPK</text>
              </svg>
              <span className="text-xs text-warm-500">SP Khamkar & Sons · Specialist in Spices · Since 1930</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-warm-500">
              <span>9867 409269</span><span>8879 401920</span><span>9892 997189</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
