
import React from 'react';
import { Template, AssetType } from '../types';

const TEMPLATES: Template[] = [
  {
    id: 'v1',
    type: 'video',
    title: 'Neon Odyssey',
    prompt: 'A cinematic tracking shot through a rain-slicked cyberpunk street with neon signs reflecting in puddles, 8k resolution, blade runner aesthetic.',
    previewIcon: 'fa-city',
    category: 'Cinematic'
  },
  {
    id: 'v2',
    type: 'video',
    title: 'Ethereal Forest',
    prompt: 'Slow motion drone shot through an ancient misty forest with glowing blue mushrooms and floating spores, magical atmosphere.',
    previewIcon: 'fa-tree',
    category: 'Fantasy'
  },
  {
    id: 'i1',
    type: 'image',
    title: 'Galactic Nomad',
    prompt: 'A high-detail portrait of a futuristic space explorer with a reflective visor showing a nebula, hyper-realistic, intricate suit design.',
    previewIcon: 'fa-user-astronaut',
    category: 'Sci-Fi'
  },
  {
    id: 'i2',
    type: 'image',
    title: 'Zen Arch',
    prompt: 'Minimalist architecture of a white concrete villa overlooking a calm turquoise ocean at golden hour, architectural photography style.',
    previewIcon: 'fa-building',
    category: 'Architecture'
  },
  {
    id: 'v3',
    type: 'video',
    title: 'Abstract Fluid',
    prompt: 'Mesmerizing 3D abstract animation of liquid gold and silk-like fabrics swirling in a dark void, luxury motion design.',
    previewIcon: 'fa-droplet',
    category: 'Abstract'
  },
  {
    id: 'i3',
    type: 'image',
    title: 'Synthwave Sunset',
    prompt: 'Retro-futuristic landscape with a giant grid sun, purple mountains, and digital palm trees, vibrant 80s aesthetic.',
    previewIcon: 'fa-sun',
    category: 'Retro'
  }
];

interface TemplateLibraryProps {
  onSelect: (template: Template) => void;
  activeType: AssetType;
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelect, activeType }) => {
  const filteredTemplates = TEMPLATES.filter(t => t.type === activeType);

  return (
    <div className="mb-12 animate-fade-up">
      <div className="flex items-center gap-3 mb-6 px-2">
        <i className="fa-solid fa-wand-magic-sparkles text-blue-400 text-sm"></i>
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Creative Blueprints</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className="glass-panel p-6 md:p-8 rounded-[2rem] md:rounded-3xl border-white/5 hover:border-white/20 transition-all text-left group hover:scale-[1.02] active:scale-95 flex flex-col gap-4"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <i className={`fa-solid ${template.previewIcon} text-lg opacity-60 group-hover:opacity-100`}></i>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">{template.category}</p>
              <h4 className="text-sm font-bold text-white/90 group-hover:text-white">{template.title}</h4>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateLibrary;
