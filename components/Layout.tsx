
import React, { useRef } from 'react';
import { TabType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userImage: string | null;
  onImageUpload: (base64: string) => void;
  logoImage: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, userImage, onImageUpload, logoImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-slate-50 shadow-2xl relative border-x border-slate-200">
      {/* Header */}
      <header className="bg-indigo-700 text-white p-5 sticky top-0 z-20 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Jyoti Branding */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full border-4 border-white/30 overflow-hidden bg-indigo-900 shadow-xl">
                <img 
                  src={logoImage} 
                  alt="Jyoti" 
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 20%' }}
                  onError={(e) => {
                    e.currentTarget.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Jyoti";
                  }}
                />
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-indigo-700 rounded-full shadow-sm animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter leading-none">ज्योति (Jyoti)</h1>
              <p className="text-[11px] text-indigo-100 font-bold tracking-widest mt-1 uppercase">एएनएम डिजिटल सहायता • बिहार</p>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="flex flex-col items-end">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="group relative w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden bg-indigo-800 shadow-lg transition-transform active:scale-95"
              title="अपनी फोटो बदलें"
            >
              {userImage ? (
                <img src={userImage} alt="User Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-indigo-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </button>
            <span className="text-[9px] font-black text-indigo-200 uppercase tracking-widest mt-1">Profile</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-28 p-5">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around p-2 z-30 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.1)]">
        <button 
          onClick={() => setActiveTab(TabType.PREGNANCY)}
          className={`flex flex-col items-center flex-1 py-2 rounded-2xl transition-all duration-300 ${activeTab === TabType.PREGNANCY ? 'text-indigo-700 bg-indigo-50 scale-105 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">गर्भावस्था</span>
        </button>
        <button 
          onClick={() => setActiveTab(TabType.VACCINATION)}
          className={`flex flex-col items-center flex-1 py-2 rounded-2xl transition-all duration-300 ${activeTab === TabType.VACCINATION ? 'text-indigo-700 bg-indigo-50 scale-105 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.628.285a2 2 0 01-1.506.042l-.206-.072a2 2 0 00-1.512 0l-4.63 1.593a1 1 0 00-.533 1.311l.134.33a2 2 0 001.722 1.257l12.573.405a2 2 0 001.94-1.405l1.447-4.416a2 2 0 00-.533-1.311z" /></svg>
          <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">टीकाकरण</span>
        </button>
        <button 
          onClick={() => setActiveTab(TabType.TOOLS)}
          className={`flex flex-col items-center flex-1 py-2 rounded-2xl transition-all duration-300 ${activeTab === TabType.TOOLS ? 'text-indigo-700 bg-indigo-50 scale-105 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">त्वरित गणना</span>
        </button>
        <button 
          onClick={() => setActiveTab(TabType.ASSISTANT)}
          className={`flex flex-col items-center flex-1 py-2 rounded-2xl transition-all duration-300 ${activeTab === TabType.ASSISTANT ? 'text-indigo-700 bg-indigo-50 scale-105 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">सहायक</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
