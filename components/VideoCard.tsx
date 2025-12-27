import React, { useState } from 'react';
import { GeneratedVideo } from '../types';
import { GeminiService } from '../services/geminiService';

interface VideoCardProps {
  video: GeneratedVideo;
  onDownload: () => void;
  onUpdate: (updated: GeneratedVideo) => void;
  onRegenerate: (prompt: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onDownload, onUpdate, onRegenerate }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const analysis = await GeminiService.analyzeVideo(video.url);
      onUpdate({ ...video, analysis });
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this AI video I generated on Lumina: ${video.prompt} ${video.url}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Manifested this with Lumina AI! #AIArt #LuminaAI`)}&url=${encodeURIComponent(video.url)}`,
    instagram: () => {
      navigator.clipboard.writeText(video.url);
      alert("Link copied! Open Instagram to share your masterpiece.");
    }
  };

  return (
    <div className="animate-fade-up glass-panel panel-hover-3d relative rounded-[3rem] overflow-hidden border border-white/10 transition-all duration-500 hover:shadow-2xl flex flex-col h-full bg-black/40 group">
      <div className="relative aspect-video bg-black overflow-hidden group/media">
        <video 
          src={video.url} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover/media:scale-105"
          controls
          loop
          playsInline
        />
        
        {/* Floating Badges */}
        <div className="absolute top-6 left-6 flex flex-wrap gap-2 z-10 opacity-0 group-hover/media:opacity-100 transition-opacity">
          <span className="bg-white/90 backdrop-blur-md text-black text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
            {video.config.resolution} • {video.config.aspectRatio}
          </span>
          <span className="bg-cyan-500/90 backdrop-blur-md text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
            {video.config.duration}
          </span>
        </div>

        {/* Quick Action Overlay */}
        <div className="absolute bottom-6 right-6 flex gap-2 z-10 opacity-0 group-hover/media:opacity-100 transition-all translate-y-2 group-hover/media:translate-y-0">
          <button 
            onClick={onDownload}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-all"
            title="Download"
          >
            <i className="fa-solid fa-download"></i>
          </button>
          <button 
            onClick={() => setShowShare(!showShare)}
            className="w-10 h-10 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all"
            title="Share"
          >
            <i className="fa-solid fa-share-nodes"></i>
          </button>
        </div>

        {/* Share Dropdown */}
        {showShare && (
          <div className="absolute bottom-20 right-6 z-20 animate-fade-up">
            <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex flex-col gap-2 shadow-2xl">
              <a href={shareLinks.whatsapp} target="_blank" className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center hover:scale-110 transition-all">
                <i className="fa-brands fa-whatsapp text-white"></i>
              </a>
              <a href={shareLinks.twitter} target="_blank" className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center hover:scale-110 transition-all border border-white/10">
                <i className="fa-brands fa-x-twitter text-white"></i>
              </a>
              <button onClick={shareLinks.instagram} className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500 flex items-center justify-center hover:scale-110 transition-all">
                <i className="fa-brands fa-instagram text-white"></i>
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-8 flex-1 flex flex-col gap-6">
        <div className="space-y-3">
           <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Manifested Structure</h4>
              <button 
                onClick={() => onRegenerate(video.prompt)}
                className="text-[9px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest flex items-center gap-1.5 transition-all"
              >
                <i className="fa-solid fa-rotate-right"></i> Regenerate
              </button>
           </div>
           <p className="text-[13px] text-white/70 line-clamp-3 font-medium leading-relaxed italic border-l-2 border-white/5 pl-4">
             "{video.prompt}"
           </p>
        </div>
        
        {video.analysis && (
          <div className="p-6 bg-cyan-400/5 rounded-3xl border border-cyan-400/10 shadow-inner animate-fade-up">
            <div className="flex items-center gap-2 mb-3">
              <i className="fa-solid fa-atom text-cyan-400 text-[10px] animate-pulse"></i>
              <h4 className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.4em]">Neural Analysis</h4>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed italic">{video.analysis}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
          <button 
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-2 text-[10px] font-black text-cyan-400/60 hover:text-cyan-400 uppercase tracking-[0.3em] transition-all disabled:opacity-30"
          >
            {analyzing ? <i className="fa-solid fa-atom fa-spin"></i> : <i className="fa-solid fa-brain"></i>}
            {video.analysis ? 'Refresh Logic' : 'Analyze Intent'}
          </button>
          
          <div className="flex items-center gap-4">
             <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">
               {new Date(video.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </span>
             <button onClick={onDownload} className="text-white/20 hover:text-white transition-all">
                <i className="fa-solid fa-file-export text-sm"></i>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;