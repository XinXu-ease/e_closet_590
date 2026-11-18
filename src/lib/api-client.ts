export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

/** Resolves a first-party API path for either the website or the iOS bundle. */
export function apiUrl(path: string) {
  if (!path.startsWith("/")) throw new Error("API paths must start with '/'.");
  return apiBaseUrl ? `${apiBaseUrl}${path}` : path;
}

export async function api<T>(path: string, body?: unknown, method = body === undefined ? "GET" : "POST"): Promise<T> {
  const response = await fetch(apiUrl(path), {
    method, credentials: "same-origin", cache: "no-store",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  const data = await response.json();
  if (!response.ok) throw new ApiError(data.error || "The request could not be completed. Please try again.", response.status);
  return data as T;
}

export async function upload<T>(path: string, form: FormData): Promise<T> {
  const response = await fetch(apiUrl(path), { method: "POST", credentials: "same-origin", cache: "no-store", body: form, signal: AbortSignal.timeout(20_000) });
  const data = await response.json();
  if (!response.ok) throw new ApiError(data.error || "The upload could not be completed. Please try again.", response.status);
  return data as T;
}
