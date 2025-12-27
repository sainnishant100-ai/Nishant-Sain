
import React, { useState } from 'react';
import { AuthService } from '../services/authService';
import { User } from '../types';

interface AuthModalProps {
  onSuccess: (user: User) => void;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = isLogin 
        ? await AuthService.login(email) 
        : await AuthService.signup(name, email);
      onSuccess(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const user = await AuthService.googleLogin();
      onSuccess(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-3xl">
      <div className="glass-panel max-w-md w-full p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] relative shadow-2xl">
        <button onClick={onClose} className="absolute top-8 right-8 text-white/30 hover:text-white transition-all">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <div className="text-center mb-8 md:mb-12">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-2xl">
            <i className="fa-solid fa-play text-black text-xl md:text-2xl"></i>
          </div>
          <h2 className="font-brand text-3xl md:text-4xl font-bold mb-1 md:mb-2 tracking-tight">
            {isLogin ? 'Neural Link' : 'Initialize Identity'}
          </h2>
          <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Lumina Protocol Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {!isLogin && (
            <input
              type="text"
              required
              placeholder="Display Identity"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500 transition-all text-sm font-bold"
            />
          )}
          <input
            type="email"
            required
            placeholder="Neural Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500 transition-all text-sm font-bold"
          />
          
          {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl btn-colorful text-xs md:text-sm font-black tracking-widest uppercase shadow-xl disabled:opacity-50"
          >
            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : (isLogin ? 'AUTHENTICATE' : 'GENERATE')}
          </button>
        </form>

        <div className="my-8 md:my-10 flex items-center gap-4">
          <div className="flex-1 h-[1px] bg-white/5"></div>
          <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">or link with</span>
          <div className="flex-1 h-[1px] bg-white/5"></div>
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl border border-white/10 bg-white/5 text-white text-[10px] md:text-xs font-black tracking-widest uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-3 md:gap-4"
        >
          <i className="fa-brands fa-google text-base md:text-lg"></i>
          Neural Google Auth
        </button>

        <p className="mt-8 md:mt-10 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[9px] font-black text-white/30 hover:text-cyan-400 uppercase tracking-widest transition-all"
          >
            {isLogin ? "No identity? Initialize" : "Return to Link"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
