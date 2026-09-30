"use client";

import { useEffect, useState } from "react";

export function useObjectUrl(blob?: Blob) {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (!blob) {
      const clearTimer = window.setTimeout(() => setUrl(undefined), 0);
      return () => window.clearTimeout(clearTimer);
    }

    const nextUrl = URL.createObjectURL(blob);
    const setTimer = window.setTimeout(() => setUrl(nextUrl), 0);
    return () => {
      window.clearTimeout(setTimer);
      URL.revokeObjectURL(nextUrl);
    };
  }, [blob]);

  return url;
}
