
import React from 'react';
import { User, Asset } from '../types';

interface UserDashboardProps {
  user: User;
  assets: Asset[];
  onClose: () => void;
  onLogout: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, assets, onClose, onLogout }) => {
  const stats = {
    videos: assets.filter(a => a.type === 'video').length,
    images: assets.filter(a => a.type === 'image').length,
    totalStorage: (assets.length * 2.4).toFixed(1)
  };

  const handleUpdateAPI = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    } catch (e) {
      console.error("Failed to open key selector", e);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in">
      <div className="glass-panel max-w-4xl w-full p-8 md:p-16 rounded-[2.5rem] md:rounded-[5rem] relative shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"></div>
        
        <button onClick={onClose} className="absolute top-8 right-8 md:top-12 md:right-12 text-white/30 hover:text-white transition-all">
          <i className="fa-solid fa-xmark text-xl md:text-2xl"></i>
        </button>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          {/* Sidebar Info */}
          <div className="w-full lg:w-72 space-y-8 md:space-y-12">
            <div className="text-center lg:text-left">
              <img src={user.avatar} className="w-24 h-24 md:w-32 md:h-32 rounded-3xl md:rounded-[3rem] border-4 border-white/5 mx-auto lg:mx-0 mb-6 md:mb-8 shadow-2xl" alt="Profile" />
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-2">{user.name}</h2>
              <p className="text-cyan-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-6">{user.email}</p>
              <div className="inline-block px-6 py-2 rounded-full border border-white/10 bg-white/5 text-[8px] font-black text-white/40 uppercase tracking-widest">
                Manifestor Tier 1
              </div>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="p-5 md:p-6 rounded-2xl md:rounded-3xl bg-cyan-400/5 border border-cyan-400/10 mb-4">
                 <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-3">AI Engine Status</p>
                 <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-white/80 uppercase">Bridge Active</span>
                 </div>
                 <button 
                  onClick={handleUpdateAPI}
                  className="w-full py-2.5 rounded-lg md:rounded-xl bg-white text-black text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                 >
                   Update API Bridge
                 </button>
              </div>

              <button className="w-full py-3 md:py-4 px-6 md:px-8 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 text-left text-[10px] font-black text-white/40 uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-between group">
                Settings <i className="fa-solid fa-chevron-right group-hover:translate-x-1 transition-transform"></i>
              </button>
              
              <button onClick={onLogout} className="w-full py-3 md:py-4 px-6 md:px-8 rounded-xl md:rounded-2xl bg-red-500/10 border border-red-500/20 text-left text-[10px] font-black text-red-400 uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center justify-between">
                Disconnect <i className="fa-solid fa-power-off"></i>
              </button>
            </div>
          </div>

          {/* Main Dashboard Stats */}
          <div className="flex-1 space-y-12 md:space-y-16 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
              <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] bg-white/5 border border-white/5 shadow-inner">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-3 md:mb-4">Renders</p>
                <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter">{assets.length}</h3>
              </div>
              <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] bg-white/5 border border-white/5 shadow-inner">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-3 md:mb-4">Bandwidth</p>
                <h3 className="text-4xl md:text-5xl font-black text-cyan-400 tracking-tighter">{stats.totalStorage}GB</h3>
              </div>
              <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] bg-white/5 border border-white/5 shadow-inner">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-3 md:mb-4">Rank</p>
                <h3 className="text-4xl md:text-5xl font-black text-pink-500 tracking-tighter">#412</h3>
              </div>
            </div>

            <div className="space-y-6 md:space-y-8">
               <div className="flex justify-between items-center px-4">
                  <h4 className="text-[10px] md:text-[12px] font-black text-white/60 uppercase tracking-widest">Activity Log</h4>
                  <span className="text-[9px] font-black text-cyan-400/40 uppercase tracking-widest">Last Sync: Just now</span>
               </div>
               <div className="space-y-3 md:space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                 {assets.slice(0, 5).map(asset => (
                   <div key={asset.id} className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-white/2 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4 md:gap-6 overflow-hidden">
                         <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white/5 flex items-center justify-center text-white/20 shrink-0">
                            <i className={asset.type === 'video' ? 'fa-solid fa-film' : 'fa-solid fa-image'}></i>
                         </div>
                         <div className="overflow-hidden">
                            <p className="text-[11px] font-bold text-white/80 truncate max-w-[120px] md:max-w-xs">{asset.prompt}</p>
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">MANIFESTED</p>
                         </div>
                      </div>
                      <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest hidden sm:block">Complete</span>
                   </div>
                 ))}
                 {assets.length === 0 && <p className="text-center py-12 md:py-20 text-white/10 text-[10px] font-black uppercase tracking-widest">No activity detected</p>}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
