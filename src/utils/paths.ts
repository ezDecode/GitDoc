/**
 * Helper functions for handling URL paths
 */

// Function to get the absolute URL
export function getAbsoluteURL(path: string): string {
  const baseUrl = "http://localhost:3000";
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

// Function to get URL with path
export function getBasePathURL(path: string): string {
  return `${path.startsWith("/") ? path : `/${path}`}`;
}
