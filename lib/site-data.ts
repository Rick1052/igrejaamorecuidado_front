import type { SiteData } from "./types";
import fallback from "@/data/fallback.json";

export function normalizeSiteData(data: Partial<SiteData>): SiteData {
  const defaults = fallback as SiteData;
  return {
    ...defaults,
    ...data,
    announcement: { ...defaults.announcement, ...data.announcement },
    faceToFace: {
      ...defaults.faceToFace,
      ...data.faceToFace,
      men: { ...defaults.faceToFace.men, ...data.faceToFace?.men },
      women: { ...defaults.faceToFace.women, ...data.faceToFace?.women }
    },
    hero: { ...defaults.hero, ...data.hero },
    links: { ...defaults.links, ...data.links },
    contact: { ...defaults.contact, ...data.contact },
    giving: { ...defaults.giving, ...data.giving },
    services: data.services ?? defaults.services,
    sermons: data.sermons ?? defaults.sermons,
    instagramPosts: data.instagramPosts ?? defaults.instagramPosts,
    cells: data.cells ?? defaults.cells
  };
}

// A seção de ofertas só aparece quando está ligada e tem ao menos um meio de contribuir preenchido.
export function hasGivingDetails(giving: SiteData["giving"]) {
  return giving.enabled && Boolean(giving.pixKey || giving.account);
}
