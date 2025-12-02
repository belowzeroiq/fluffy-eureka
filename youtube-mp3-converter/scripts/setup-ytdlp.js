const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Install yt-dlp binary for free usage
async function setupYtDlp() {
  const platform = process.platform;
  const binDir = path.join(__dirname, '../bin');
  
  // Create bin directory
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  let downloadUrl;
  let binaryName;

  switch (platform) {
    case 'darwin': // macOS
      downloadUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos';
      binaryName = 'yt-dlp';
      break;
    case 'linux':
      downloadUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux';
      binaryName = 'yt-dlp';
      break;
    case 'win32':
      downloadUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';
      binaryName = 'yt-dlp.exe';
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  const binaryPath = path.join(binDir, binaryName);

  console.log('Downloading yt-dlp...');
  execSync(`curl -L -o ${binaryPath} ${downloadUrl}`);
  
  console.log('Making executable...');
  if (platform !== 'win32') {
    execSync(`chmod +x ${binaryPath}`);
  }

  console.log('yt-dlp installed successfully!');
}

setupYtDlp().catch(console.error);
