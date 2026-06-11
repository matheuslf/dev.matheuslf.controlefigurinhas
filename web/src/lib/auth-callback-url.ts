const DEFAULT_CALLBACK = "/album";

/** Auth.js envia URL absoluta; o modal usa só path relativo. */
export function normalizeCallbackUrl(
  url: string | null | undefined,
  fallback = DEFAULT_CALLBACK,
): string {
  if (!url?.trim()) return fallback;

  const trimmed = url.trim();

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const path = parsed.pathname + parsed.search;
    return path === "" || path === "/" ? fallback : path;
  } catch {
    return fallback;
  }
}

export function hasAuthModalParams(params: URLSearchParams): boolean {
  return params.get("signIn") === "1" || params.has("callbackUrl");
}

export function stripAuthModalParams(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(params.toString());
  next.delete("signIn");
  next.delete("callbackUrl");
  return next;
}

export function authModalCallbackFromParams(
  params: URLSearchParams,
  fallback = DEFAULT_CALLBACK,
): string | null {
  if (params.get("signIn") === "1" || params.has("callbackUrl")) {
    return normalizeCallbackUrl(params.get("callbackUrl"), fallback);
  }
  return null;
}
