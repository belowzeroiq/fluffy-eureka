'use client';

import { useState, useEffect } from 'react';
import DownloadButton from './DownloadButton';
import ThemeToggle from './ThemeToggle';

export default function Converter() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [rateLimit, setRateLimit] = useState({ remaining: 10, reset: Date.now() + 3600000 });

  useEffect(() => {
    document.body.classList.add('page-enter');
    
    // Load rate limit from localStorage
    const saved = localStorage.getItem('rateLimit');
    if (saved) {
      const data = JSON.parse(saved);
      setRateLimit(data);
      
      // Reset if hour has passed
      if (Date.now() > data.reset) {
        const newLimit = { remaining: 10, reset: Date.now() + 3600000 };
        setRateLimit(newLimit);
        localStorage.setItem('rateLimit', JSON.stringify(newLimit));
      }
    }
  }, []);

  const handleConvert = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (rateLimit.remaining <= 0) {
      setError(`Rate limit reached. Please try again in ${Math.ceil((rateLimit.reset - Date.now()) / 60000)} minutes.`);
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

      // Update rate limit
      const newLimit = { ...rateLimit, remaining: rateLimit.remaining - 1 };
      setRateLimit(newLimit);
      localStorage.setItem('rateLimit', JSON.stringify(newLimit));

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
            Free YouTube to MP3 Converter
          </h1>
          <p className="converter-subtitle md-body-large">
            Convert YouTube videos to MP3 completely free - no API keys required!
          </p>
          <div className="rate-limit-info" style={{ 
            backgroundColor: 'var(--md-primary-95)', 
            color: 'var(--md-primary-30)',
            padding: 'var(--md-spacing-3)',
            borderRadius: 'var(--md-radius-base)',
            marginTop: 'var(--md-spacing-4)',
            fontSize: 'var(--md-font-size-sm)'
          }}>
            ⚡ Free tier: {rateLimit.remaining} conversions remaining this hour
          </div>
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
            disabled={loading || rateLimit.remaining <= 0}
            className={`md-button md-button--filled convert-button ${loading || rateLimit.remaining <= 0 ? 'md-button--disabled' : ''}`}
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

        <div className="free-features" style={{
          marginTop: 'var(--md-spacing-8)',
          padding: 'var(--md-spacing-6)',
          backgroundColor: 'var(--md-surface-variant)',
          borderRadius: 'var(--md-radius-lg)',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: 'var(--md-spacing-4)' }}>✨ Completely Free Features</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--md-spacing-4)' }}>
            <div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto var(--md-spacing-2)' }}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="var(--md-tertiary-40)"/>
              </svg>
              <p><strong>No API Keys</strong><br/>100% free, no registration</p>
            </div>
            <div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto var(--md-spacing-2)' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="var(--md-tertiary-40)"/>
              </svg>
              <p><strong>Open Source</strong><br/>Powered by yt-dlp</p>
            </div>
            <div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto var(--md-spacing-2)' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" fill="var(--md-tertiary-40)"/>
              </svg>
              <p><strong>Rate Limited</strong><br/>Fair usage for everyone</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
      }
