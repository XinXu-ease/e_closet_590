export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function api<T>(path: string, body?: unknown, method = body === undefined ? "GET" : "POST"): Promise<T> {
  const response = await fetch(path, {
    method, credentials: "same-origin", cache: "no-store",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  const data = await response.json();
  if (!response.ok) throw new ApiError(data.error || "The request could not be completed. Please try again.", response.status);
  return data as T;
}
