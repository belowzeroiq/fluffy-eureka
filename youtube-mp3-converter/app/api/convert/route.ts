import { NextRequest, NextResponse } from 'next/server';

// Free YouTube downloader using Cobalt.tools API (open source)
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate YouTube URL
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    // Use free Cobalt API (open source, no key required)
    const response = await fetch('https://co.wuk.sh/api/json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        vQuality: '720p',
        aFormat: 'mp3',
        filenamePattern: 'basic',
        isAudioOnly: true,
        dubLang: false
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from Cobalt API');
    }

    const data = await response.json();

    if (data.status === 'error') {
      throw new Error(data.text || 'Conversion failed');
    }

    if (data.status === 'stream' || data.status === 'redirect') {
      return NextResponse.json({
        title: `YouTube Video ${videoId}`,
        duration: 'Unknown',
        thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        downloadUrl: data.url,
        videoId: videoId,
        format: 'mp3',
        quality: '192K'
      });
    }

    throw new Error('Unexpected response format');

  } catch (error) {
    console.error('Conversion error:', error);
    
    // Fallback to another free service
    try {
      return await fallbackConvert(request);
    } catch (fallbackError) {
      return NextResponse.json(
        { error: 'Failed to process video. Please try again.' }, 
        { status: 500 }
      );
    }
  }
}

// Fallback free converter
async function fallbackConvert(request: NextRequest): Promise<NextResponse> {
  const { url } = await request.json();
  const videoId = extractVideoId(url);

  // Use another free API (rotate between free services)
  const freeServices = [
    'https://api.ryzendown.cc/v1/yt-download',
    'https://yt-download.org/api/button/mp3',
    'https://www.yt2mp3s.me/@api/json/mp3'
  ];

  for (const service of freeServices) {
    try {
      const response = await fetch(service, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url, videoId: videoId })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.downloadUrl || data.url) {
          return NextResponse.json({
            title: data.title || `YouTube Video ${videoId}`,
            duration: data.duration || 'Unknown',
            thumbnail: data.thumbnail || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
            downloadUrl: data.downloadUrl || data.url,
            videoId: videoId,
            format: 'mp3',
            quality: data.quality || '192K'
          });
        }
      }
    } catch (error) {
      console.log(`Service ${service} failed, trying next...`);
      continue;
    }
  }

  throw new Error('All free services failed');
}

function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
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
