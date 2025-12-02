'use client';

import { useState, useEffect } from 'react';
import DownloadButton from './DownloadButton';
import ThemeToggle from './ThemeToggle';

export default function Converter() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.classList.add('page-enter');
  }, []);

  const handleConvert = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Conversion failed');
      }

      setResult(data);
      setTimeout(() => {
        const resultElement = document.querySelector('.result-card');
        if (resultElement) {
          resultElement.classList.add('result-enter');
        }
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      const errorElement = document.querySelector('.error-message');
      if (errorElement) {
        errorElement.classList.add('shake');
        setTimeout(() => {
          errorElement.classList.remove('shake');
        }, 500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <ThemeToggle />
      
      <div className="converter-card md-card card-enter">
        <div className="converter-header">
          <div className="icon-group float">
            <svg className="youtube-icon" width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M23 12s0-3.85 0-5.15c0-1.3-.8-2.35-2-2.55C18.85 4 12 4 12 4s-6.85 0-9 0C1.8 4.5 1 5.55 1 6.85 1 8.15 1 12 1 12s0 3.85 0 5.15c0 1.3.8 2.35 2 2.55C5.15 20 12 20 12 20s6.85 0 9 0c1.2-.2 2-1.25 2-2.55C23 15.85 23 12 23 12z" fill="#FF0000"/>
              <polygon points="10,15 16,12 10,9" fill="white"/>
            </svg>
            <svg className="music-icon" width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" fill="#2196F3"/>
            </svg>
          </div>
          <h1 className="converter-title md-display-medium">
            YouTube to MP3 Converter
          </h1>
          <p className="converter-subtitle md-body-large">
            Convert YouTube videos to high-quality MP3 files with Material Design
          </p>
        </div>

        <div className="input-group">
          <div className="md-text-field">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder=" "
              className="md-text-field__input url-input"
              id="youtube-url"
            />
            <label className="md-text-field__label" htmlFor="youtube-url">
              YouTube URL
            </label>
          </div>
          <button
            onClick={handleConvert}
            disabled={loading}
            className={`md-button md-button--filled convert-button ${loading ? 'md-button--disabled' : ''}`}
          >
            {loading ? (
              <>
                <div className="loading-spinner" style={{ width: '20px', height: '20px', marginRight: '8px' }}></div>
                Converting...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="white"/>
                </svg>
                Convert to MP3
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="error-message md-card" style={{ 
            backgroundColor: 'var(--md-error-90)', 
            color: 'var(--md-error-30)',
            padding: 'var(--md-spacing-4)',
            borderRadius: 'var(--md-radius-base)',
            marginTop: 'var(--md-spacing-4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--md-spacing-2)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
              </svg>
              {error}
            </div>
          </div>
        )}

        {result && (
          <div className="result-card md-card scale-in">
            <div className="video-info">
              {result.thumbnail && (
                <img
                  src={result.thumbnail}
                  alt={result.title}
                  className="video-thumbnail"
                />
              )}
              <div className="video-details">
                <h3 className="video-title md-title-large">{result.title}</h3>
                <p className="video-duration md-body-medium">Duration: {result.duration}</p>
                <DownloadButton downloadUrl={result.downloadUrl} title={result.title} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
              }
              
