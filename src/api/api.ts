// Strip any trailing slash so we never produce double-slash URLs when an
// endpoint already starts with "/" (e.g. "/auth/complete-profile").
// VITE_API_URL may or may not have a trailing slash depending on how the
// GitHub Actions variable was set — we normalise both sides here.
const _RAW_BASE = import.meta.env.VITE_API_URL ?? "";
const BASE_URL = _RAW_BASE.replace(/\/$/, "");

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Ensure exactly one slash between base and endpoint regardless of whether
  // the endpoint has a leading slash or not.
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const res = await fetch(`${BASE_URL}${normalizedEndpoint}`, {
    method,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = err?.detail;

    // FastAPI can return detail as a string or as a Pydantic array of errors
    if (Array.isArray(detail)) {
      throw new ApiError(res.status, detail.map((d: { msg: string }) => d.msg).join(", "));
    }
    throw new ApiError(res.status, typeof detail === "string" ? detail : "Something went wrong.");
  }

  // 204 No Content — return empty object
  if (res.status === 204) return {} as T;

  return res.json();
}

// ── Convenience methods ───────────────────────────────────────────────────────

export const api = {
  get: <T>(endpoint: string, token?: string | null) =>
    request<T>(endpoint, { method: "GET", token }),

  post: <T>(endpoint: string, body: unknown, token?: string | null) =>
    request<T>(endpoint, { method: "POST", body, token }),

  put: <T>(endpoint: string, body: unknown, token?: string | null) =>
    request<T>(endpoint, { method: "PUT", body, token }),

  patch: <T>(endpoint: string, body: unknown, token?: string | null) =>
    request<T>(endpoint, { method: "PATCH", body, token }),

  delete: <T>(endpoint: string, token?: string | null) =>
    request<T>(endpoint, { method: "DELETE", token }),
};
