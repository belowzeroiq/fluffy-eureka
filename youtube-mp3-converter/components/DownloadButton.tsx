'use client';

import { useState } from 'react';

interface DownloadButtonProps {
  downloadUrl: string;
  title: string;
}

export default function DownloadButton({ downloadUrl, title }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Add success animation
      const button = document.querySelector('.download-button');
      if (button) {
        button.classList.add('pulse-success');
        setTimeout(() => {
          button.classList.remove('pulse-success');
        }, 2000);
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className={`md-button md-button--elevated download-button ${downloading ? 'md-button--disabled' : ''}`}
    >
      {downloading ? (
        <>
          <div className="loading-spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
          Downloading...
        </>
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
          </svg>
          Download MP3
        </>
      )}
    </button>
  );
}
