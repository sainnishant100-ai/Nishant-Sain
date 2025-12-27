
import React, { useState, useEffect, useRef } from 'react';
import { GeminiService } from './services/geminiService';
import { AuthService } from './services/authService';
import { GeneratedVideo, GeneratedImage, GenerationProgress, Asset, AssetType, Template, AnimationConfig, StyleType, VideoDuration, User } from './types';
import ApiKeyWall from './components/ApiKeyWall';
import VideoCard from './components/VideoCard';
import ImageCard from './components/ImageCard';
import ChatBot from './components/ChatBot';
import TemplateLibrary from './components/TemplateLibrary';
import AuthModal from './components/AuthModal';
import UserDashboard from './components/UserDashboard';

const REVIEWS = [
  { id: 1, name: "Alexander K.", role: "Director @ VisionStudio", text: "Lumina's Veo engine has completely transformed our storyboard process. The depth and color accuracy are unmatched.", rating: 5, avatar: "https://i.pravatar.cc/150?u=1" },
  { id: 2, name: "Sarah J.", role: "Motion Artist", text: "I can finally create cinematic 3D renders without the 48-hour wait. This is the future of production.", rating: 5, avatar: "https://i.pravatar.cc/150?u=2" },
  { id: 3, name: "Marcus Thorne", role: "Creative Lead", text: "The tokens and gamified experience make generation addictive. A must-have tool for modern creators.", rating: 5, avatar: "https://i.pravatar.cc/150?u=3" },
  { id: 4, name: "Elena V.", role: "Freelance 3D Specialist", text: "The new 3D styles are mind-blowing. The 'Dolly In' camera movement is incredibly smooth and realistic.", rating: 5, avatar: "https://i.pravatar.cc/150?u=4" }
];

const SHOWCASE_VIDEOS = [
  { id: 1, title: "Cyber Odyssey", url: "https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-city-street-at-night-with-neon-lights-40142-large.mp4", tag: "NEON" },
  { id: 2, title: "Fluid Gold", url: "https://assets.mixkit.co/videos/preview/mixkit-fluid-gold-particles-swirling-in-the-air-41273-large.mp4", tag: "ABSTRACT" },
  { id: 3, title: "Deep Nebula", url: "https://assets.mixkit.co/videos/preview/mixkit-traveling-through-a-pink-and-purple-galaxy-with-bright-stars-21147-large.mp4", tag: "SPACE" },
  { id: 4, title: "Emerald Valley", url: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-beautiful-mountain-valley-2342-large.mp4", tag: "NATURE" }
];

const STYLE_PRESETS: { id: StyleType; label: string; icon: string; prompt: string }[] = [
  { id: 'none', label: 'Default', icon: 'fa-wand-magic-sparkles', prompt: '' },
  { id: 'cartoon', label: '3D Toy', icon: 'fa-cubes', prompt: 'in a high-quality 3D claymation style, adorable characters, tilt-shift lens effect, vibrant colors' },
  { id: 'cinematic', label: 'UE5 Render', icon: 'fa-film', prompt: 'Unreal Engine 5 render, global illumination, raytraced reflections, cinematic 8k, photorealistic depth of field' },
  { id: 'anime', label: 'Anime 3D', icon: 'fa-mask-hannya', prompt: 'Cel-shaded 3D anime style, high-end production, hand-painted textures, dynamic lighting' },
  { id: 'realistic', label: 'Raw Scan', icon: 'fa-camera', prompt: 'hyper-realistic photogrammetry, 8k raw photo, natural daylight, extreme detail, high fidelity' },
  { id: 'render', label: 'Octane 3D', icon: 'fa-cube', prompt: 'Octane render, abstract geometric 3D, metallic and glass materials, sub-surface scattering, volumetric fog' },
  { id: 'neon', label: '3D Neon', icon: 'fa-bolt-lightning', prompt: '3D glowing neon elements, volumetric lighting, dark futuristic environment, synthwave colors' }
];

const DURATIONS: { value: VideoDuration; label: string }[] = [
  { value: '5s', label: '5 Seconds' },
  { value: '10s', label: '10 Seconds' },
  { value: '30s', label: '30 Seconds' },
  { value: '1m', label: '1 Minute' },
  { value: '5m', label: '5 Minutes' },
  { value: '10m', label: '10 Minutes' }
];

const App: React.FC = () => {
  const [hasAuth, setHasAuth] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  
  const [activeMode, setActiveMode] = useState<AssetType>('video');
  const [prompt, setPrompt] = useState('');
  const [activeStyle, setActiveStyle] = useState<StyleType>('none');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [progress, setProgress] = useState<GenerationProgress & { percent: number }>({ status: 'idle', message: '', percent: 0 });
  const [imageRef, setImageRef] = useState<string | null>(null);
  const [showStudio, setShowStudio] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Video Config
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [vAspectRatio, setVAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [duration, setDuration] = useState<VideoDuration>('5s');
  const [animation, setAnimation] = useState<AnimationConfig>({ camera: 'none', motion: 'smooth' });

  const studioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // @ts-ignore
      const authed = await window.aistudio.hasSelectedApiKey();
      setHasAuth(authed);
      
      const sessionUser = AuthService.getActiveUser();
      if (sessionUser) {
        setUser(sessionUser);
        loadUserAssets(sessionUser.id);
      }
    };
    checkAuth();
  }, []);

  const loadUserAssets = (userId: string) => {
    const data = localStorage.getItem(`lumina_assets_${userId}`);
    if (data) setAssets(JSON.parse(data));
    else setAssets([]);
  };

  const saveUserAsset = (userId: string, asset: Asset) => {
    const data = localStorage.getItem(`lumina_assets_${userId}`);
    const current = data ? JSON.parse(data) : [];
    const updated = [asset, ...current];
    localStorage.setItem(`lumina_assets_${userId}`, JSON.stringify(updated));
    setAssets(updated);
  };

  const handleLoginSuccess = (u: User) => {
    setUser(u);
    setShowAuthModal(false);
    loadUserAssets(u.id);
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    setAssets([]);
    setShowDashboard(false);
  };

  const scrollToStudio = () => {
    setShowStudio(true);
    setTimeout(() => {
        studioRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleTemplateSelect = (template: Template) => {
    setPrompt(template.prompt);
    setActiveMode(template.type);
    scrollToStudio();
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setProgress({ status: 'idle', message: 'Generation sequence terminated by user.', percent: 0 });
      setTimeout(() => setProgress(p => p.status === 'idle' ? { ...p, message: '' } : p), 3000);
    }
  };

  const handleRegenerate = (oldPrompt: string) => {
    setPrompt(oldPrompt);
    scrollToStudio();
  };

  const handleGenerate = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!prompt.trim()) return;
    
    abortControllerRef.current = new AbortController();
    setProgress({ status: 'generating', message: `Initializing ${activeMode} sequence...`, percent: 5 });
    
    try {
      let finalPrompt = prompt;
      const styleModifier = STYLE_PRESETS.find(s => s.id === activeStyle)?.prompt;
      if (styleModifier) finalPrompt += `, ${styleModifier}`;

      if (activeMode === 'video') {
        if (animation.camera !== 'none') finalPrompt += `, cinematic ${animation.camera.replace('-', ' ')} camera movement`;
        finalPrompt += `, ${duration} cinematic sequence`;

        const url = await GeminiService.generateVideo(
          finalPrompt, 
          { resolution, aspectRatio: vAspectRatio, duration: duration as any }, 
          (m, p) => setProgress(prev => ({ ...prev, message: m, percent: p })), 
          abortControllerRef.current.signal,
          imageRef || undefined
        );
        
        const newAsset: GeneratedVideo = { 
          id: crypto.randomUUID(), 
          userId: user.id,
          url, 
          prompt, 
          timestamp: Date.now(), 
          type: 'video', 
          config: { resolution, aspectRatio: vAspectRatio, duration, animation, style: activeStyle } 
        };
        saveUserAsset(user.id, newAsset);
      } else {
        const url = await GeminiService.generateImage(finalPrompt, { imageSize: '1K', aspectRatio: vAspectRatio === '16:9' ? '16:9' : '9:16' });
        const newAsset: GeneratedImage = { 
          id: crypto.randomUUID(), 
          userId: user.id,
          url, 
          prompt, 
          timestamp: Date.now(), 
          type: 'image', 
          config: { imageSize: '1K', aspectRatio: vAspectRatio, style: activeStyle } 
        };
        saveUserAsset(user.id, newAsset);
      }
      setProgress({ status: 'completed', message: 'Materialization complete.', percent: 100 });
      setPrompt('');
      setImageRef(null);
      setTimeout(() => setProgress({ status: 'idle', message: '', percent: 0 }), 3000);
    } catch (e: any) {
      if (e.message !== 'CANCELLED') {
        if (e.message === 'AUTH_ERROR') setHasAuth(false);
        else setProgress({ status: 'error', message: e.message || 'Error encountered during synthesis.', percent: 0 });
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const downloadAsset = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {!hasAuth && <ApiKeyWall onSuccess={() => setHasAuth(true)} />}
      
      {showAuthModal && <AuthModal onSuccess={handleLoginSuccess} onClose={() => setShowAuthModal(false)} />}
      {showDashboard && user && (
        <UserDashboard 
          user={user} 
          assets={assets} 
          onClose={() => setShowDashboard(false)} 
          onLogout={handleLogout} 
        />
      )}

      {/* Dynamic Header */}
      <nav className="fixed top-0 w-full z-50 px-6 md:px-12 py-4 md:py-8 flex items-center justify-between bg-black/40 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center gap-4 md:gap-10">
          <div className="flex items-center gap-2 md:gap-3 group cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
             <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all shadow-xl shadow-cyan-500/20">
                <i className="fa-solid fa-play text-black text-xl md:text-2xl"></i>
             </div>
             <span className="font-brand text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-white to-pink-500 bg-clip-text text-transparent">Lumina</span>
          </div>
          <div className="hidden lg:flex items-center gap-10">
             {['Studio', 'Gallery', 'Testimonials'].map(l => (
               <a key={l} href={`#${l.toLowerCase()}`} className="text-[12px] font-black text-white/40 hover:text-cyan-400 transition-all uppercase tracking-[0.3em]">{l}</a>
             ))}
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          {user ? (
            <button 
              onClick={() => setShowDashboard(true)}
              className="flex items-center gap-2 md:gap-4 px-4 md:px-6 py-2 md:py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all group"
            >
              <img src={user.avatar} className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl border border-white/10" alt="UI Avatar" />
              <div className="hidden sm:block text-left">
                <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{user.name}</p>
              </div>
            </button>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="btn-pill btn-colorful px-6 md:px-12 py-2 md:py-3.5 text-[10px] md:text-xs shadow-xl shadow-cyan-500/30">Login</button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-6 md:px-12 lg:px-24 overflow-hidden pt-24">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 items-center gap-12 lg:gap-16">
          <div className="z-10 animate-fade-up text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6 md:mb-8">
               <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
               <span className="text-[9px] md:text-[10px] font-black text-cyan-400 uppercase tracking-widest">Veo 3.1 Fast Engine Online</span>
            </div>
            <h1 className="font-brand text-5xl sm:text-7xl md:text-9xl lg:text-[140px] leading-[1] lg:leading-[0.8] font-bold mb-6 md:mb-10 tracking-tighter drop-shadow-2xl">
              Imagine<br/>
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Motion.</span>
            </h1>
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-10 md:mb-14 items-center lg:items-start">
               <div className="hidden lg:block w-[4px] h-24 bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500 rounded-full shadow-lg shadow-cyan-500/20"></div>
               <p className="text-white/80 text-lg md:text-2xl max-w-md font-semibold leading-snug drop-shadow-md">
                  Craft high-fidelity 3D cinematic videos from simple text. Decentralized creative power at your fingertips.
               </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 md:gap-6">
               <button onClick={scrollToStudio} className="w-full sm:w-auto btn-pill btn-colorful px-12 md:px-20 py-5 md:py-6 text-sm md:text-base shadow-2xl">Manifest Now</button>
               <button className="w-full sm:w-auto btn-pill border-2 border-white/20 text-white px-12 py-5 md:py-6 text-sm md:text-base hover:bg-white/10 transition-all font-black">Learn More</button>
            </div>
          </div>
          <div className="flex justify-center items-center relative py-12 lg:py-0">
            <div className="hero-character-wrapper relative">
               <div className="halo-ring"></div>
               <div className="character-bubble animate-glow">
                  <img 
                    src="https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1000&auto=format&fit=crop" 
                    className="character-img" 
                    alt="Cyberpunk AI Entity" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 via-transparent to-pink-500/20 opacity-40"></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section id="gallery" className="py-20 md:py-32 px-6 md:px-12 bg-black/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-20"></div>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-16 md:mb-24 text-center">
            <h3 className="text-pink-500 text-[10px] md:text-[12px] font-black uppercase tracking-[0.6em] md:tracking-[0.8em] mb-4 md:mb-6">Masterpieces</h3>
            <h2 className="font-brand text-4xl md:text-7xl font-bold mb-6 md:mb-8 tracking-tight">Showcase</h2>
            <p className="text-white/40 text-base md:text-lg max-w-2xl uppercase tracking-widest font-bold border-t border-white/10 pt-6 md:pt-8 mt-4">High-performance renders generated by our community.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {SHOWCASE_VIDEOS.map((v) => (
              <div key={v.id} className="sample-video-container glass-panel panel-hover-3d aspect-[9/16] group border-white/10">
                <video src={v.url} autoPlay muted loop playsInline className="group-hover:scale-110 transition-transform duration-[2000ms]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-90"></div>
                <div className="absolute bottom-8 md:bottom-12 left-6 md:left-10 right-6 md:right-10">
                  <div className="inline-flex items-center gap-2 bg-cyan-400 text-black text-[9px] md:text-[10px] font-black px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-3 md:mb-4 uppercase tracking-widest">
                     <i className="fa-solid fa-bolt"></i> {v.tag}
                  </div>
                  <h4 className="text-lg md:text-xl font-black text-white tracking-tight leading-none">{v.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Studio Mode Section */}
      <section id="studio" ref={studioRef} className={`min-h-screen px-4 md:px-8 py-20 md:py-32 bg-[#050508]/98 transition-all duration-1000 ${showStudio ? 'opacity-100 scale-100' : 'opacity-0 scale-98'}`}>
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center mb-16 md:mb-24">
               <div className="flex bg-white/5 p-1.5 md:p-2 rounded-[1.5rem] md:rounded-[2rem] border border-white/10 mb-8 md:mb-12 shadow-2xl relative group">
                  <button onClick={() => setActiveMode('video')} className={`px-8 md:px-16 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-[14px] font-black tracking-widest transition-all z-10 ${activeMode === 'video' ? 'bg-white text-black shadow-2xl scale-105' : 'text-white/30 hover:text-white'}`}>VIDEO ENGINE</button>
                  <button onClick={() => setActiveMode('image')} className={`px-8 md:px-16 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-[14px] font-black tracking-widest transition-all z-10 ${activeMode === 'image' ? 'bg-white text-black shadow-2xl scale-105' : 'text-white/30 hover:text-white'}`}>IMAGE ENGINE</button>
               </div>
               <h2 className="font-brand text-5xl md:text-9xl mb-4 md:mb-6 font-bold tracking-tighter bg-gradient-to-b from-white to-white/10 bg-clip-text text-transparent text-center">Studio Mode</h2>
               <p className="text-cyan-400 uppercase tracking-[0.6em] md:tracking-[1.2em] text-[9px] md:text-[11px] font-black drop-shadow-[0_0_10px_rgba(0,242,255,0.3)] text-center">Manifestation Environment</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
                <div className="lg:col-span-5 lg:sticky lg:top-36">
                    <div className="glass-panel panel-hover-3d p-8 md:p-14 rounded-[2.5rem] md:rounded-[4rem] space-y-8 md:space-y-12 shadow-2xl border-white/10 bg-gradient-to-br from-white/10 via-transparent to-transparent">
                        <div className="z-depth-2">
                            <label className="text-[10px] md:text-[12px] font-black text-white/30 uppercase tracking-[0.4em] md:tracking-[0.5em] px-4 md:px-6 flex items-center gap-3 mb-4 md:mb-6">
                              <i className="fa-solid fa-wand-sparkles text-cyan-400"></i> Narrative Architecture
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={progress.status === 'generating'}
                                placeholder={`Input your visual parameters...`}
                                className="w-full bg-black/80 border-2 border-white/5 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 text-white placeholder-white/10 focus:outline-none focus:border-cyan-500 transition-all min-h-[160px] md:min-h-[220px] resize-none text-lg md:text-xl font-medium shadow-2xl leading-relaxed disabled:opacity-50"
                            />
                        </div>

                        {activeMode === 'video' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 z-depth-1">
                            <div className="space-y-3 md:space-y-4">
                              <label className="text-[10px] md:text-[11px] font-black text-white/30 uppercase tracking-[0.3em] md:tracking-[0.4em] px-4 md:px-6 flex items-center gap-2">
                                <i className="fa-solid fa-camera-movie text-cyan-400"></i> Motion
                              </label>
                              <select 
                                value={animation.camera} 
                                disabled={progress.status === 'generating'}
                                onChange={(e) => setAnimation({...animation, camera: e.target.value as any})}
                                className="w-full bg-black/60 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-5 text-[10px] md:text-[12px] font-black text-white appearance-none focus:border-cyan-500 transition-all shadow-inner uppercase tracking-widest cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <option value="none">Static</option>
                                <option value="zoom-in">Zoom In</option>
                                <option value="zoom-out">Zoom Out</option>
                                <option value="orbit">Orbit</option>
                                <option value="dolly-in">Dolly In</option>
                                <option value="dolly-out">Dolly Out</option>
                                <option value="tilt-up">Tilt Up</option>
                                <option value="crane-up">Crane Up</option>
                              </select>
                            </div>
                            <div className="space-y-3 md:space-y-4">
                              <label className="text-[10px] md:text-[11px] font-black text-white/30 uppercase tracking-[0.3em] md:tracking-[0.4em] px-4 md:px-6 flex items-center gap-2">
                                <i className="fa-solid fa-clock text-pink-500"></i> Length
                              </label>
                              <select 
                                value={duration} 
                                disabled={progress.status === 'generating'}
                                onChange={(e) => setDuration(e.target.value as any)}
                                className="w-full bg-black/60 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-5 text-[10px] md:text-[12px] font-black text-white appearance-none focus:border-pink-500 transition-all shadow-inner uppercase tracking-widest cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {DURATIONS.map(d => (
                                  <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-3 md:space-y-4 sm:col-span-2">
                               <label className="text-[10px] md:text-[11px] font-black text-white/30 uppercase tracking-[0.3em] md:tracking-[0.4em] px-4 md:px-6 flex items-center gap-2">
                                <i className="fa-solid fa-vector-square text-cyan-400"></i> Aspect Ratio
                              </label>
                              <div className="grid grid-cols-2 gap-4 md:gap-6">
                                <button disabled={progress.status === 'generating'} onClick={() => setVAspectRatio('16:9')} className={`py-4 md:py-5 rounded-xl md:rounded-2xl border-2 transition-all text-[10px] md:text-[11px] font-black tracking-[0.2em] disabled:opacity-50 ${vAspectRatio === '16:9' ? 'bg-white text-black border-white shadow-xl scale-105' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'}`}>WIDE 16:9</button>
                                <button disabled={progress.status === 'generating'} onClick={() => setVAspectRatio('9:16')} className={`py-4 md:py-5 rounded-xl md:rounded-2xl border-2 transition-all text-[10px] md:text-[11px] font-black tracking-[0.2em] disabled:opacity-50 ${vAspectRatio === '9:16' ? 'bg-white text-black border-white shadow-xl scale-105' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'}`}>REEL 9:16</button>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-4 md:space-y-6 z-depth-1">
                          <label className="text-[10px] md:text-[12px] font-black text-white/30 uppercase tracking-[0.4em] md:tracking-[0.5em] px-4 md:px-6 flex items-center gap-3">
                            <i className="fa-solid fa-microchip text-purple-400"></i> Aesthetic Core
                          </label>
                          <div className="grid grid-cols-4 gap-2 md:gap-4">
                            {STYLE_PRESETS.map((style) => (
                              <button
                                key={style.id}
                                disabled={progress.status === 'generating'}
                                onClick={() => setActiveStyle(style.id)}
                                className={`p-3 md:p-5 rounded-2xl md:rounded-3xl flex flex-col items-center gap-2 md:gap-3 transition-all border-2 disabled:opacity-50 ${
                                  activeStyle === style.id 
                                  ? 'bg-white text-black border-white shadow-2xl scale-110' 
                                  : 'bg-white/5 border-white/5 text-white/20 hover:border-white/30 hover:text-white'
                                }`}
                              >
                                <i className={`fa-solid ${style.icon} text-base md:text-lg`}></i>
                                <span className="text-[8px] md:text-[10px] font-black uppercase truncate w-full text-center tracking-tighter">{style.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 md:gap-6">
                            <button 
                            disabled={progress.status === 'generating' || !prompt.trim()} 
                            onClick={handleGenerate} 
                            className={`w-full py-6 md:py-10 rounded-[2rem] md:rounded-[3rem] font-black text-[14px] md:text-[18px] tracking-[0.3em] md:tracking-[0.5em] flex items-center justify-center gap-4 md:gap-6 transition-all ${progress.status === 'generating' ? 'bg-white/5 text-white/20 cursor-wait' : 'btn-colorful hover:scale-[1.05] shadow-[0_20px_60px_-15px_rgba(0,242,255,0.4)]'}`}
                            >
                                {progress.status === 'generating' ? <i className="fa-solid fa-atom fa-spin text-2xl md:text-3xl"></i> : <i className="fa-solid fa-bolt-lightning text-2xl md:text-3xl"></i>}
                                {progress.status === 'generating' ? 'SYNTHESIZING' : `MANIFEST`}
                            </button>
                        </div>

                        {progress.status !== 'idle' && (
                            <div className={`p-6 md:p-8 rounded-[2.5rem] md:rounded-[3.5rem] border-2 text-center shadow-2xl overflow-hidden relative ${progress.status === 'error' ? 'bg-red-500/5 border-red-500/20' : 'bg-cyan-400/5 border-cyan-400/20'}`}>
                                <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                                   <div className={`h-full transition-all duration-700 bg-gradient-to-r ${progress.status === 'error' ? 'from-red-400 to-red-600' : 'from-cyan-400 via-purple-500 to-pink-500'}`} style={{ width: `${progress.percent}%` }}></div>
                                </div>
                                <div className="flex justify-between items-end mb-2 md:mb-3">
                                    <p className={`text-[10px] md:text-[12px] font-black uppercase tracking-widest ${progress.status === 'error' ? 'text-red-400' : 'text-cyan-400'}`}>{progress.status}</p>
                                    <p className="text-[9px] md:text-[10px] font-black text-white/20">{progress.percent}%</p>
                                </div>
                                <p className="text-sm md:text-[16px] font-medium italic text-white/80 line-clamp-1">{progress.message}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-7 space-y-12 md:space-y-24">
                    <TemplateLibrary onSelect={handleTemplateSelect} activeType={activeMode} />
                    <div className="space-y-10 md:space-y-16">
                      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-white/5 pb-8 md:pb-12 px-4 md:px-8 gap-6">
                          <div className="flex flex-col gap-1.5 md:gap-3 text-center sm:text-left">
                             <span className="text-[12px] md:text-[14px] font-black tracking-[0.4em] md:tracking-[0.8em] text-white/20 uppercase">Neural Cache</span>
                             <span className="text-[9px] md:text-[11px] font-black text-cyan-400 tracking-[0.2em] md:tracking-[0.4em] uppercase">{assets.length} Manifestations Authenticated</span>
                          </div>
                          <button onClick={() => setAssets([])} className="w-full sm:w-auto text-[9px] md:text-[11px] font-black text-white/20 hover:text-red-500 transition-all uppercase tracking-widest border-2 border-white/5 px-6 md:px-8 py-2 md:py-3 rounded-full">Wipe Repository</button>
                      </div>
                      {assets.length === 0 ? (
                          <div className="h-[400px] md:h-[750px] glass-panel rounded-[3rem] md:rounded-[5rem] flex flex-col items-center justify-center gap-8 md:gap-12 text-white/5 border-dashed border-2 border-white/10 relative shadow-inner">
                              <div className="w-24 h-24 md:w-48 md:h-48 bg-white/5 rounded-[2rem] md:rounded-[3rem] flex items-center justify-center border border-white/5">
                                <i className="fa-solid fa-cube text-5xl md:text-8xl opacity-10"></i>
                              </div>
                              <div className="text-center space-y-3 md:space-y-6 px-10">
                                 <p className="text-sm md:text-[16px] font-black tracking-[0.5em] md:tracking-[1em] uppercase">Storage Empty</p>
                              </div>
                          </div>
                      ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
                              {assets.map(asset => (
                                  asset.type === 'video' ? (
                                      <VideoCard key={asset.id} video={asset} onDownload={() => downloadAsset(asset.url, `video-${asset.id}.mp4`)} onUpdate={(u) => setAssets(p => p.map(x => x.id === u.id ? u : x))} onRegenerate={handleRegenerate} />
                                  ) : (
                                      <ImageCard key={asset.id} image={asset} onDownload={() => downloadAsset(asset.url, `image-${asset.id}.png`)} onRegenerate={handleRegenerate} />
                                  )
                              ))}
                          </div>
                      )}
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 md:py-48 px-6 md:px-12 bg-black relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-20"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-32">
            <h3 className="text-cyan-400 text-[12px] md:text-[14px] font-black uppercase tracking-[0.8em] md:tracking-[1em] mb-4 md:mb-8">Ratings</h3>
            <h2 className="font-brand text-4xl md:text-8xl font-bold mb-6 md:mb-10 tracking-tighter">Wall of Fame</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-2xl md:text-4xl star-gold">
               <div className="flex gap-2">
                 {[1,2,3,4,5].map(s => <i key={s} className="fa-solid fa-star"></i>)}
               </div>
               <span className="text-white font-black text-xl md:text-3xl tracking-tight">4.98 User Rating</span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {REVIEWS.map((r) => (
              <div key={r.id} className="glass-panel panel-hover-3d p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border-white/5 relative overflow-hidden flex flex-col shadow-2xl bg-gradient-to-b from-white/5 to-transparent">
                <div className="flex gap-1 mb-8">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <i key={i} className="fa-solid fa-star star-gold text-[10px]"></i>
                  ))}
                </div>
                <p className="text-white/80 italic text-lg md:text-xl leading-relaxed mb-10 font-medium">"{r.text}"</p>
                <div className="flex items-center gap-4 md:gap-6 mt-auto border-t border-white/10 pt-8 md:pt-10">
                  <img src={r.avatar} alt={r.name} className="w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] md:rounded-[2rem] object-cover ring-4 ring-white/10" />
                  <div>
                    <h4 className="font-black text-white text-lg md:text-xl tracking-tight leading-none mb-1 md:mb-2">{r.name}</h4>
                    <p className="text-[10px] md:text-[12px] font-black text-white/30 uppercase tracking-widest">{r.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ChatBot />

      <footer className="py-20 md:py-40 px-6 md:px-12 border-t border-white/5 bg-[#010103] relative">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-16 md:gap-24">
            <div className="flex flex-col items-center lg:items-start gap-8 md:gap-10 text-center lg:text-left">
               <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-[2rem] flex items-center justify-center shadow-2xl">
                    <i className="fa-solid fa-play text-black text-2xl md:text-3xl"></i>
                  </div>
                  <span className="font-brand text-4xl md:text-6xl font-bold tracking-tighter bg-gradient-to-r from-cyan-400 via-white to-pink-500 bg-clip-text text-transparent">Lumina</span>
               </div>
               <p className="text-white/20 text-[10px] md:text-[14px] font-black uppercase tracking-[0.4em] md:tracking-[0.8em] leading-[2] md:leading-[2.5] max-w-lg">
                 Leading the Content Revolution.<br/>
                 Decentralized AI Studio Network.<br/>
                 Powered by Gemini Nexus.
               </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-20 text-center lg:text-left w-full lg:w-auto">
               <div>
                  <h5 className="text-white text-[10px] md:text-[12px] font-black uppercase tracking-widest mb-6 md:mb-8 text-cyan-400">Core</h5>
                  <div className="flex flex-col gap-3 md:gap-5">
                    {['Manifest', 'Nexus', 'Assets', 'Nodes'].map(l => <a key={l} href="#" className="text-white/40 text-[10px] md:text-[12px] font-black hover:text-white transition-colors tracking-widest uppercase">{l}</a>)}
                  </div>
               </div>
               <div>
                  <h5 className="text-white text-[10px] md:text-[12px] font-black uppercase tracking-widest mb-6 md:mb-8 text-pink-500">Legal</h5>
                  <div className="flex flex-col gap-3 md:gap-5">
                    <button onClick={() => setShowPrivacy(true)} className="text-white/40 text-[10px] md:text-[12px] font-black hover:text-white transition-colors tracking-widest uppercase text-left">Privacy</button>
                    <a href="#" className="text-white/40 text-[10px] md:text-[12px] font-black hover:text-white transition-colors tracking-widest uppercase">Terms</a>
                    <a href="#" className="text-white/40 text-[10px] md:text-[12px] font-black hover:text-white transition-colors tracking-widest uppercase">Security</a>
                  </div>
               </div>
               <div className="col-span-2 sm:col-span-1">
                  <h5 className="text-white text-[10px] md:text-[12px] font-black uppercase tracking-widest mb-6 md:mb-8 text-purple-400">Social</h5>
                  <div className="flex flex-row sm:flex-col justify-center gap-6 md:gap-5">
                    {['X', 'Discord', 'Github'].map(l => <a key={l} href="#" className="text-white/40 text-[10px] md:text-[12px] font-black hover:text-white transition-colors tracking-widest uppercase">{l}</a>)}
                  </div>
               </div>
            </div>
        </div>
      </footer>

      {showPrivacy && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl">
          <div className="glass-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] relative">
            <button onClick={() => setShowPrivacy(false)} className="absolute top-8 right-8 text-white/30 hover:text-white">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <h2 className="font-brand text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-cyan-400 tracking-tight">Privacy Protocol</h2>
            <div className="space-y-6 text-white/70 text-sm md:text-base leading-relaxed">
              <p>Lumina AI Studio is committed to absolute security. Your manifested sequences are processed via the Gemini Nexus network under high encryption.</p>
            </div>
            <button onClick={() => setShowPrivacy(false)} className="mt-10 btn-pill btn-colorful px-12 py-4 text-xs w-full">I Understand</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
