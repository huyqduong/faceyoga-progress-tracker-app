import { supabase } from './supabase';

interface VimeoVideoInfo {
  embedUrl: string;
  isPrivate: boolean;
  requiresPassword: boolean;
}

class VimeoService {
  async getVideoInfo(videoUrl: string): Promise<VimeoVideoInfo> {
    try {
      console.log('Getting video info for:', videoUrl);
      
      const { videoId, videoHash } = this.extractVideoInfo(videoUrl);
      console.log('Extracted video ID:', videoId, 'hash:', videoHash);

      if (!videoId) {
        throw new Error('Invalid Vimeo URL');
      }

      // Construct the player URL with the hash if available
      const embedUrl = `https://player.vimeo.com/video/${videoId}${videoHash ? `?h=${videoHash}` : ''}`;
      console.log('Generated embed URL:', embedUrl);

      return {
        embedUrl,
        isPrivate: !!videoHash,
        requiresPassword: false,
      };
    } catch (error) {
      console.error('Error fetching Vimeo video info:', error);
      throw error;
    }
  }

  private extractVideoInfo(url: string): { videoId: string | null; videoHash: string | null } {
    try {
      console.log('Extracting video info from URL:', url);
      
      let videoId: string | null = null;
      let videoHash: string | null = null;
      
      // First check URL parameters for hash
      const urlObj = new URL(url);
      videoHash = urlObj.searchParams.get('h');
      
      // Remove query parameters and get the base URL
      const baseUrl = url.split('?')[0];
      
      if (baseUrl.includes('vimeo.com/')) {
        // Extract video ID and hash from path
        const parts = baseUrl.split('vimeo.com/')[1].split('/');
        videoId = parts[0];
        if (!videoHash && parts[1]) {
          videoHash = parts[1];
        }
      }
      
      console.log('Extracted video info:', { videoId, videoHash });
      return { videoId, videoHash };
    } catch (error) {
      console.error('Error extracting video info:', error);
      return { videoId: null, videoHash: null };
    }
  }
}

export const vimeoService = new VimeoService();
