"use client";

import { useEffect, useState } from "react";
import styles from "./FigmaOutfitDetail.module.css";

type WeatherResult = {
  temperature: number;
  weatherCode: number;
  precipitationProbability: number;
  unit: "°F";
};

type WeatherState =
  | { status: "loading" }
  | { status: "ready"; weather: WeatherResult }
  | { status: "error"; message: string };

function weatherCondition(code: number) {
  if (code === 0) return "Clear";
  if (code <= 3) return "Cloudy";
  if (code === 45 || code === 48) return "Foggy";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return "Rain";
  }
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return "Snow";
  }
  if (code >= 95) return "Storm";
  return "Current weather";
}

export function OutfitWeather() {
  const [state, setState] = useState<WeatherState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    if (!("geolocation" in navigator)) {
      const timer = window.setTimeout(() => {
        setState({ status: "error", message: "Location is not supported by this browser." });
      }, 0);
      return () => window.clearTimeout(timer);
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const latitude = coords.latitude.toFixed(2);
        const longitude = coords.longitude.toFixed(2);
        try {
          const response = await fetch(`/api/weather?latitude=${latitude}&longitude=${longitude}`, {
            cache: "no-store",
            signal: controller.signal,
          });
          const payload = await response.json() as Partial<WeatherResult> & { error?: string };
          if (!response.ok || !Number.isFinite(payload.temperature) || !Number.isFinite(payload.weatherCode) || !Number.isFinite(payload.precipitationProbability)) {
            throw new Error(payload.error || "Weather is unavailable.");
          }
          if (!cancelled) {
            setState({
              status: "ready",
              weather: {
                temperature: payload.temperature as number,
                weatherCode: payload.weatherCode as number,
                precipitationProbability: payload.precipitationProbability as number,
                unit: "°F",
              },
            });
          }
        } catch (error) {
          if (!cancelled && !(error instanceof DOMException && error.name === "AbortError")) {
            setState({
              status: "error",
              message: error instanceof Error ? error.message : "Weather is unavailable.",
            });
          }
        }
      },
      (error) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: error.code === error.PERMISSION_DENIED
            ? "Location permission is off."
            : "Current location is unavailable.",
        });
      },
      { enableHighAccuracy: false, maximumAge: 10 * 60 * 1000, timeout: 12_000 },
    );

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  if (state.status === "loading") {
    return <div className={`${styles.weather} ${styles.weatherMuted}`} role="status" aria-label="Getting current weather"><span>Current location</span><span>Loading weather…</span></div>;
  }
  if (state.status === "error") {
    const detail = state.message === "Location permission is off."
      ? "Location permission off"
      : "Try again later";
    return <div className={`${styles.weather} ${styles.weatherMuted}`} role="status" title={state.message}><span>Weather unavailable</span><span>{detail}</span></div>;
  }

  const condition = weatherCondition(state.weather.weatherCode);
  const temperature = Math.round(state.weather.temperature);
  const precipitationProbability = Math.round(state.weather.precipitationProbability);
  return <div className={styles.weather} role="status" aria-label={`${temperature} degrees Fahrenheit. ${condition}, rain ${precipitationProbability} percent.`}>
    <span className={styles.weatherPrimary}>{temperature}{state.weather.unit}</span>
    <span>{condition} · Rain {precipitationProbability}%</span>
  </div>;
}
