
export type AssetType = 'video' | 'image';

export type StyleType = 'none' | 'cartoon' | 'cinematic' | 'anime' | 'realistic' | 'render' | 'neon';

export interface AnimationConfig {
  camera: 'none' | 'zoom-in' | 'zoom-out' | 'pan-right' | 'pan-left' | 'orbit' | 'tilt-up' | 'dolly-in' | 'dolly-out' | 'crane-up';
  motion: 'subtle' | 'smooth' | 'dynamic' | 'chaotic' | 'slow-motion' | 'fast-forward';
}

export type VideoDuration = '5s' | '10s' | '30s' | '1m' | '5m' | '10m';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  joinedAt: number;
  stats: {
    totalVideos: number;
    totalImages: number;
  };
}

export interface GeneratedVideo {
  id: string;
  userId: string;
  url: string;
  prompt: string;
  timestamp: number;
  type: 'video';
  config: {
    resolution: '720p' | '1080p';
    aspectRatio: '16:9' | '9:16';
    duration: VideoDuration;
    animation?: AnimationConfig;
    style?: StyleType;
  };
  analysis?: string;
}

export interface GeneratedImage {
  id: string;
  userId: string;
  url: string;
  prompt: string;
  timestamp: number;
  type: 'image';
  config: {
    imageSize: '1K' | '2K' | '4K';
    aspectRatio: string;
    style?: StyleType;
  };
}

export type Asset = GeneratedVideo | GeneratedImage;

export type GenerationStatus = 'idle' | 'authorizing' | 'generating' | 'completed' | 'error';

export interface GenerationProgress {
  status: GenerationStatus;
  message: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Template {
  id: string;
  type: AssetType;
  title: string;
  prompt: string;
  previewIcon: string;
  category: string;
}
