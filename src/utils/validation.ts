export function isValidUrl(url: string): boolean {
  try {
    const urlObject = new URL(url);
    return urlObject.protocol === 'http:' || urlObject.protocol === 'https:';
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string): string {
  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    // Default to https for non-localhost URLs
    if (url.includes('localhost') || url.includes('127.0.0.1') || url.startsWith('192.168.')) {
      url = 'http://' + url;
    } else {
      url = 'https://' + url;
    }
  }

  return url;
}

export function isLocalUrl(url: string): boolean {
  try {
    const urlObject = new URL(url);
    const hostname = urlObject.hostname;

    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.endsWith('.local')
    );
  } catch {
    return false;
  }
}

export function validatePort(port: string | number): boolean {
  const portNumber = typeof port === 'string' ? parseInt(port, 10) : port;
  return !isNaN(portNumber) && portNumber > 0 && portNumber <= 65535;
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[<>:"/\\|?*]/g, '_').trim();
}
