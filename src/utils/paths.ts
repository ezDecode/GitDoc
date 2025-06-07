/**
 * Helper functions for handling GitHub Pages URL paths
 */

// GitHub Pages has a base path when deployed (e.g., /GitDocument)
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

// Function to get the absolute URL with proper base path
export function getAbsoluteURL(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

// Function to get URL with base path prefixed
export function getBasePathURL(path: string): string {
  return `${basePath}${path.startsWith('/') ? path : `/${path}`}`;
}

// Function to determine if we're in a production build
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
