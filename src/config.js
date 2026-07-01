/**
 * Central application configuration.
 *
 * The backend base URL can be overridden at build time via the
 * REACT_APP_API_BASE_URL environment variable; otherwise it falls back to the
 * local Flask server.
 */
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

/**
 * Joins the API base URL with a path (which may or may not start with "/").
 * @param {string} path
 */
export function apiUrl(path = "") {
  if (!path) return API_BASE_URL;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default API_BASE_URL;
