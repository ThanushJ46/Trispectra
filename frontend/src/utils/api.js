const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function apiRequest(path, options = {}, timeoutMs = 30000) {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;
  
  console.log(`[API] Fetching: ${url}`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();

    if (!response.ok) {
      console.error(`[API] Error ${response.status} for ${path}:`, text);
      throw new Error(`API ${response.status} ${path}: ${text.slice(0, 300)}`);
    }

    if (!contentType.includes("application/json")) {
      console.error(`[API] Non-JSON response from ${path}:`, contentType, text.slice(0, 300));
      throw new Error(`Expected JSON from ${path}, got ${contentType}: ${text.slice(0, 300)}`);
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error(`[API] JSON parse error for ${path}:`, e, text);
      throw new Error(`Invalid JSON response from backend. See console for details.`);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request to ${path} timed out after ${timeoutMs}ms.`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
