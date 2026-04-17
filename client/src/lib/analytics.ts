const ANALYTICS_SCRIPT_ID = "yeto-umami-analytics";

/**
 * Load Umami analytics only when endpoint and website id are configured.
 * This avoids broken script tags and build-time placeholder warnings.
 */
export function initializeAnalytics(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID;

  if (!endpoint || !websiteId) return;
  if (document.getElementById(ANALYTICS_SCRIPT_ID)) return;

  const normalizedEndpoint = endpoint.replace(/\/$/, "");

  const script = document.createElement("script");
  script.id = ANALYTICS_SCRIPT_ID;
  script.defer = true;
  script.src = `${normalizedEndpoint}/umami`;
  script.setAttribute("data-website-id", websiteId);

  document.body.appendChild(script);
}
