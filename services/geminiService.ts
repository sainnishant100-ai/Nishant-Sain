
import { GoogleGenAI, Type } from "@google/genai";

const WAIT_INTERVAL = 10000;

export class GeminiService {
  private static async getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  static async generateVideo(
    prompt: string,
    config: {
      resolution: '720p' | '1080p';
      aspectRatio: '16:9' | '9:16';
      duration?: '5s' | '10s';
    },
    onStatusChange: (status: string, progress: number) => void,
    signal?: AbortSignal,
    imageBytes?: string
  ): Promise<string> {
    const ai = await this.getAI();
    onStatusChange("Initializing neural engines...", 5);

    try {
      if (signal?.aborted) throw new Error("CANCELLED");

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: imageBytes ? {
          imageBytes: imageBytes.split(',')[1],
          mimeType: 'image/png'
        } : undefined,
        config: {
          numberOfVideos: 1,
          resolution: config.resolution,
          aspectRatio: config.aspectRatio
        }
      });

      const messages = [
        "Synthesizing motion vectors...",
        "Rendering temporal consistency...",
        "Applying cinematic lighting...",
        "Optimizing 3D textures...",
        "Finalizing high-speed export..."
      ];
      
      let step = 0;
      const totalSteps = messages.length + 2; // + initial + finish

      while (!operation.done) {
        if (signal?.aborted) throw new Error("CANCELLED");
        
        const progress = Math.min(95, Math.floor(((step + 1) / totalSteps) * 100));
        onStatusChange(messages[step % messages.length], progress);
        
        step++;
        await new Promise(resolve => setTimeout(resolve, WAIT_INTERVAL));
        
        if (signal?.aborted) throw new Error("CANCELLED");
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      if (signal?.aborted) throw new Error("CANCELLED");

      if (!operation.response?.generatedVideos?.[0]?.video?.uri) {
        throw new Error("Generation failed: No video URI returned.");
      }

      onStatusChange("Downloading manifesting result...", 98);
      const downloadLink = operation.response.generatedVideos[0].video.uri;
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      
      if (signal?.aborted) throw new Error("CANCELLED");
      
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error: any) {
      if (error.message === "CANCELLED") throw error;
      if (error.message?.includes("Requested entity was not found")) throw new Error("AUTH_ERROR");
      throw error;
    }
  }

  static async generateImage(
    prompt: string,
    config: {
      imageSize: '1K' | '2K' | '4K';
      aspectRatio: string;
    }
  ): Promise<string> {
    const ai = await this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio as any,
          imageSize: config.imageSize
        }
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned from model.");
  }

  static async analyzeVideo(videoUrl: string): Promise<string> {
    const ai = await this.getAI();
    const response = await fetch(videoUrl);
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(blob);
    });

    const result = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        {
          parts: [
            { inlineData: { data: base64, mimeType: 'video/mp4' } },
            { text: "Analyze this video for key information, cinematic style, and content summary." }
          ]
        }
      ]
    });

    return result.text || "No analysis available.";
  }

  static async chat(message: string, history: { role: 'user' | 'model', parts: [{ text: string }] }[]) {
    const ai = await this.getAI();
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: { systemInstruction: "You are Lumina, an expert AI studio assistant. You help users with video and image generation advice. Keep your tone encouraging and professional." }
    });
    
    const response = await chat.sendMessageStream({ message });
    return response;
  }
}
