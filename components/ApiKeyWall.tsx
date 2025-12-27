
import React from 'react';

interface ApiKeyWallProps {
  onSuccess: () => void;
}

const ApiKeyWall: React.FC<ApiKeyWallProps> = ({ onSuccess }) => {
  const handleAuth = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      onSuccess();
    } catch (e) {
      console.error("Auth failed", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4">
      <div className="animate-fade-up glass-panel max-w-md w-full p-10 rounded-[2.5rem] text-center border-blue-500/20 shadow-2xl">
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/5 rotate-3 hover:rotate-0 transition-transform duration-500">
          <i className="fa-solid fa-key text-blue-400 text-4xl"></i>
        </div>
        <h2 className="text-4xl font-black mb-4 gradient-text tracking-tight">Access Restricted</h2>
        <p className="text-slate-400 mb-10 leading-relaxed text-lg">
          Connect your authorized API key to unlock ultra-high quality AI video generation.
        </p>
        <button
          onClick={handleAuth}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black py-5 px-6 rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-95 text-lg"
        >
          <i className="fa-solid fa-shield-halved"></i>
          SECURE LOGIN
        </button>
        <div className="mt-8">
           <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-slate-500 hover:text-blue-400 text-xs transition-colors font-bold uppercase tracking-widest">
            Learn about pricing
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyWall;
