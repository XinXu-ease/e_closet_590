const REMOVE_BG_ENDPOINT = "https://api.remove.bg/v1.0/removebg";
const MAX_PROXY_FILE_SIZE = 4 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const runtime = "nodejs";
export const maxDuration = 60;
const CAPACITOR_ORIGIN = "capacitor://localhost";

function cors(request: Request, headers: HeadersInit = {}) {
  const next = new Headers(headers);
  if (request.headers.get("origin") === CAPACITOR_ORIGIN) {
    next.set("Access-Control-Allow-Origin", CAPACITOR_ORIGIN);
    next.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    next.set("Access-Control-Allow-Headers", "Content-Type");
    next.set("Vary", "Origin");
  }
  return next;
}

export function OPTIONS(request: Request) {
  return request.headers.get("origin") === CAPACITOR_ORIGIN
    ? new Response(null, { status: 204, headers: cors(request) })
    : new Response(null, { status: 403 });
}

function jsonError(request: Request, message: string, status: number) {
  return Response.json(
    { error: message },
    { status, headers: cors(request, { "Cache-Control": "no-store" }) },
  );
}

function connectionError(error: unknown) {
  const cause = error instanceof Error && "cause" in error
    ? error.cause
    : undefined;
  const code = cause && typeof cause === "object" && "code" in cause
    ? String(cause.code)
    : "";

  if (code === "EACCES" || code === "EPERM") {
    return "The server is blocked from connecting to remove.bg. Allow outbound HTTPS access and restart the development server.";
  }
  return "The server could not connect to remove.bg. Check its internet, firewall, or proxy settings.";
}

async function providerError(response: Response) {
  if (response.status === 402) {
    return "Background removal credits are unavailable. Check the remove.bg account.";
  }
  if (response.status === 429) {
    return "Background removal is temporarily rate limited. Try again shortly.";
  }
  if (response.status >= 500) {
    return "The background-removal service is temporarily unavailable.";
  }

  try {
    const payload = await response.json() as {
      errors?: Array<{ title?: string }>;
    };
    return payload.errors?.[0]?.title || "The image could not be processed.";
  } catch {
    return "The image could not be processed.";
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.REMOVE_BG_API_KEY?.trim();
  if (!apiKey) {
    return jsonError(
      request, "Background removal is not configured. Add REMOVE_BG_API_KEY to the server environment.",
      503,
    );
  }

  const requestLength = Number(request.headers.get("content-length") || 0);
  if (requestLength > MAX_PROXY_FILE_SIZE + 128 * 1024) {
    return jsonError(request, "The prepared image is too large to process.", 413);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError(request, "The upload could not be read.", 400);
  }

  const image = formData.get("image");
  if (!(image instanceof File)) {
    return jsonError(request, "An image file is required.", 400);
  }
  if (!ACCEPTED_IMAGE_TYPES.has(image.type)) {
    return jsonError(request, "Only JPEG, PNG, and WebP images are supported.", 415);
  }
  if (image.size > MAX_PROXY_FILE_SIZE) {
    return jsonError(request, "The prepared image is too large to process.", 413);
  }

  const providerBody = new FormData();
  providerBody.append("image_file", image, image.name || "clothing.webp");
  providerBody.append("size", "auto");
  providerBody.append("format", "webp");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);

  try {
    const response = await fetch(REMOVE_BG_ENDPOINT, {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: providerBody,
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      return jsonError(request, await providerError(response), response.status);
    }

    const contentType = response.headers.get("content-type") || "image/webp";
    if (!contentType.startsWith("image/")) {
      return jsonError(request, "The background-removal service returned an invalid result.", 502);
    }

    const result = await response.arrayBuffer();
    if (result.byteLength > MAX_PROXY_FILE_SIZE) {
      return jsonError(request, "The processed image is too large to return.", 502);
    }

    return new Response(result, {
      status: 200,
      headers: cors(request, {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      }),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return jsonError(request, "Background removal timed out. Try again.", 504);
    }
    return jsonError(request, connectionError(error), 502);
  } finally {
    clearTimeout(timeout);
  }
}
