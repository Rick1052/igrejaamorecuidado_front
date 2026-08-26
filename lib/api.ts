import type { SiteData } from "./types";
import fallback from "@/data/fallback.json";
import { normalizeSiteData } from "./site-data";
import { SERVER_API_URL } from "./server-api";

export async function getSiteData(): Promise<SiteData> {
  try {
    const response = await fetch(`${SERVER_API_URL}/api/site`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(2000)
    });
    if (!response.ok) throw new Error("API indisponível");
    return normalizeSiteData(await response.json());
  } catch {
    return fallback as SiteData;
  }
}
