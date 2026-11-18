const OPEN_METEO_ENDPOINT = "https://api.open-meteo.com/v1/forecast";

export const runtime = "nodejs";
export const maxDuration = 15;
const CAPACITOR_ORIGIN = "capacitor://localhost";

function cors(request: Request, headers: HeadersInit = {}) {
  const next = new Headers(headers);
  if (request.headers.get("origin") === CAPACITOR_ORIGIN) {
    next.set("Access-Control-Allow-Origin", CAPACITOR_ORIGIN);
    next.set("Access-Control-Allow-Methods", "GET, OPTIONS");
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

function readCoordinate(value: string | null, min: number, max: number) {
  if (value === null || value.trim() === "") return undefined;
  const coordinate = Number(value);
  return Number.isFinite(coordinate) && coordinate >= min && coordinate <= max
    ? coordinate
    : undefined;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const latitude = readCoordinate(url.searchParams.get("latitude"), -90, 90);
  const longitude = readCoordinate(url.searchParams.get("longitude"), -180, 180);

  if (latitude === undefined || longitude === undefined) {
    return jsonError(request, "Valid latitude and longitude are required.", 400);
  }

  const query = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,weather_code",
    daily: "precipitation_probability_max",
    forecast_days: "1",
    temperature_unit: "fahrenheit",
    timezone: "auto",
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(`${OPEN_METEO_ENDPOINT}?${query}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) {
      return jsonError(request, "Weather is temporarily unavailable.", 502);
    }

    const payload = await response.json() as {
      current?: { temperature_2m?: number; weather_code?: number };
      daily?: { precipitation_probability_max?: number[] };
    };
    const temperature = payload.current?.temperature_2m;
    const weatherCode = payload.current?.weather_code;
    const precipitationProbability = payload.daily?.precipitation_probability_max?.[0];
    if (!Number.isFinite(temperature) || !Number.isFinite(weatherCode) || !Number.isFinite(precipitationProbability)) {
      return jsonError(request, "The weather service returned an invalid result.", 502);
    }

    return Response.json(
      { temperature, weatherCode, precipitationProbability, unit: "°F" },
      { headers: cors(request, { "Cache-Control": "private, max-age=600" }) },
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return jsonError(request, "The weather request timed out.", 504);
    }
    return jsonError(request, "The server could not connect to Open-Meteo.", 502);
  } finally {
    clearTimeout(timeout);
  }
}
