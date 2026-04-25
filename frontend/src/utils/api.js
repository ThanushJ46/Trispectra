const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function apiRequest(path, options = {}) {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;
  
  console.log(`[API] Fetching: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (!response.ok) {
    console.error(`[API] Error ${response.status} for ${path}:`, text);
    throw new Error(`Backend error ${response.status}: ${text.slice(0, 100)}`);
  }

  if (!contentType.includes("application/json")) {
    console.error(`[API] Non-JSON response from ${path}:`, contentType, text.slice(0, 300));
    throw new Error(`Expected JSON from ${path}, but got ${contentType}. Please check if the backend is running at ${API_BASE_URL}.`);
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(`[API] JSON parse error for ${path}:`, e, text);
    throw new Error(`Invalid JSON response from backend. See console for details.`);
  }
}
