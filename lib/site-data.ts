import type { MenuItem, Section, SiteData } from "./types";
import fallback from "@/data/fallback.json";

export function normalizeSiteData(data: Partial<SiteData>): SiteData {
  const defaults = fallback as SiteData;
  return {
    ...defaults,
    ...data,
    faceToFace: {
      men: { ...defaults.faceToFace.men, ...data.faceToFace?.men },
      women: { ...defaults.faceToFace.women, ...data.faceToFace?.women }
    },
    links: { ...defaults.links, ...data.links },
    contact: { ...defaults.contact, ...data.contact },
    giving: { ...defaults.giving, ...data.giving },
    banners: data.banners ?? defaults.banners,
    sections: data.sections ?? defaults.sections,
    pages: data.pages ?? defaults.pages,
    menu: data.menu ?? defaults.menu,
    services: data.services ?? defaults.services,
    sermons: data.sermons ?? defaults.sermons,
    instagramPosts: data.instagramPosts ?? defaults.instagramPosts,
    cells: data.cells ?? defaults.cells
  };
}

// A seção de ofertas só aparece quando tem ao menos um meio de contribuir preenchido.
export function hasGivingDetails(giving: SiteData["giving"]) {
  return Boolean(giving.pixKey || giving.pixCopyPaste || giving.account);
}

export function isSectionVisible(section: Section, data: SiteData) {
  if (!section.enabled) return false;
  if (section.kind === "giving") return hasGivingDetails(data.giving);
  return true;
}

export function isExternalUrl(url: string) {
  return /^(https?:|mailto:|tel:)/.test(url);
}

// Âncoras (#agenda) apontam para a página inicial; fora dela precisam do caminho completo.
export function resolveHref(url: string, onHome: boolean) {
  return url.startsWith("#") && !onHome ? `/${url}` : url;
}

// Esconde do menu os itens que apontam para seções desligadas ou páginas que não estão publicadas.
export function visibleMenu(data: SiteData): MenuItem[] {
  return data.menu.filter(item => {
    if (item.url.startsWith("#")) {
      const section = data.sections.find(candidate => candidate.id === item.url.slice(1));
      return section ? isSectionVisible(section, data) : true;
    }
    const page = data.pages.find(candidate => `/${candidate.slug}` === item.url);
    return page ? page.enabled : true;
  });
}
