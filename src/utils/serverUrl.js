export function getServerUrl() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
      return import.meta.env.VITE_API_URL || 'http://localhost:4000';
    }
    return `${window.location.protocol}//${window.location.host}`;
  }

  // Fallback for non-browser environments during build/tests
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  return 'http://localhost:4000';
}
