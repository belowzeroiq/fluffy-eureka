import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import YTDlpWrap from 'yt-dlp-wrap';

// Free YouTube downloader using yt-dlp
export async function POST(request: NextRequest) {
  try {
    const { url, format = 'mp3' } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate YouTube URL
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    // Create temporary directory for processing
    const tempDir = path.join('/tmp', uuidv4());
    await fs.mkdir(tempDir, { recursive: true });

    try {
      // Initialize yt-dlp
      const ytDlp = new YTDlpWrap();
      
      // Get video info first (free)
      const videoInfo = await ytDlp.getVideoInfo(url);
      
      if (!videoInfo.title) {
        throw new Error('Could not fetch video information');
      }

      // Generate output filename
      const outputFile = path.join(tempDir, `${sanitizeFilename(videoInfo.title)}.%(ext)s`);
      
      // Download and convert to MP3 (free)
      const downloadOptions = [
        '-x', // Extract audio
        '--audio-format', 'mp3',
        '--audio-quality', '192K',
        '-o', outputFile,
        '--no-playlist',
        '--no-warnings',
        '--prefer-ffmpeg',
        '--ffmpeg-location', '/usr/bin/ffmpeg',
        '--max-filesize', '500m', // Limit file size for free tier
        '--retries', '3',
        '--fragment-retries', '3',
        '--skip-unavailable-fragments',
        '--abort-on-unavailable-fragment',
        '--keep-fragments',
        '--buffer-size', '16K',
        '--http-chunk-size', '16K'
      ];

      // Download the video
      await new Promise<void>((resolve, reject) => {
        ytDlp.exec([
          url,
          ...downloadOptions
        ]).on('progress', (progress) => {
          console.log(`Download progress: ${progress.percent}%`);
        }).on('error', (error) => {
          console.error('Download error:', error);
          reject(error);
        }).on('close', () => {
          resolve();
        });
      });

      // Find the downloaded file
      const files = await fs.readdir(tempDir);
      const mp3File = files.find(file => file.endsWith('.mp3'));
      
      if (!mp3File) {
        throw new Error('MP3 file not found after conversion');
      }

      const mp3Path = path.join(tempDir, mp3File);
      const mp3Buffer = await fs.readFile(mp3Path);

      // Clean up temporary files
      await fs.rm(tempDir, { recursive: true, force: true });

      // Return the MP3 data as base64
      const mp3Base64 = mp3Buffer.toString('base64');
      const audioUrl = `data:audio/mpeg;base64,${mp3Base64}`;

      return NextResponse.json({
        title: videoInfo.title,
        duration: formatDuration(videoInfo.duration),
        thumbnail: videoInfo.thumbnail,
        downloadUrl: audioUrl,
        videoId: videoId,
        format: 'mp3',
        quality: '192K'
      });

    } catch (error) {
      // Clean up on error
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
      throw error;
    }

  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to process video. Please try again.' }, 
      { status: 500 }
    );
  }
}

// Helper functions
function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9\u00C0-\u024F\u1E00-\u1EFF]/gi, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 50);
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
          }
