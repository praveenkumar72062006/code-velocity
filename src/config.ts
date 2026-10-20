// Configuration for local and production Vercel environments

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';
export const WS_SERVER_URL = import.meta.env.VITE_WS_URL || window.location.origin;

// Helper to construct API URLs
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}
