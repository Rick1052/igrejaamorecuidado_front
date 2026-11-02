export type Service = { day: string; title: string; time: string; note: string };
export type Sermon = { title: string; speaker: string; url: string; thumbnail: string };
export type CellGroup = { id: string; name: string; leaders: string; address: string; phone: string; lat: number; lng: number };
export type InstagramPost = { id: string; caption: string; mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"; mediaUrl: string; thumbnailUrl: string; permalink: string; timestamp: string };
export const pixKeyTypes = ["CNPJ", "CPF", "E-mail", "Telefone", "Chave aleatória"] as const;
export type PixKeyType = typeof pixKeyTypes[number];

// Links aceitam âncoras da página inicial (#agenda), páginas internas (/sobre) ou endereços externos (https://...).
export type LinkButton = { id: string; label: string; url: string };
export type ContentItem = { id: string; title: string; text: string };

export type Banner = {
  id: string; enabled: boolean; name: string;
  // "art": arte pronta exibida inteira; "text": foto de fundo com título, texto e botões por cima.
  layout: "art" | "text";
  desktopImage: string; mobileImage: string;
  eyebrow: string; title: string; description: string;
  buttons: LinkButton[];
};

export const sectionKinds = ["about", "marquee", "schedule", "cells", "sermons", "faceToFace", "visit", "giving", "instagram", "content"] as const;
export type SectionKind = typeof sectionKinds[number];
export type SectionTheme = "light" | "soft" | "dark";
// Uma estrutura só para todas as seções: cada tipo usa os campos que fazem sentido para ele.
export type Section = {
  id: string; kind: SectionKind; enabled: boolean;
  eyebrow: string; title: string; text: string; quote: string;
  image: string; theme: SectionTheme;
  buttons: LinkButton[]; items: ContentItem[];
};

export type Page = { id: string; slug: string; title: string; description: string; enabled: boolean; sections: Section[] };
export type MenuItem = { id: string; label: string; url: string; highlight: boolean };

export type FaceToFaceEvent = { title: string; date: string; url: string; cardImage: string };

export type SiteData = {
  banners: Banner[];
  sections: Section[];
  pages: Page[];
  menu: MenuItem[];
  faceToFace: { men: FaceToFaceEvent; women: FaceToFaceEvent };
  services: Service[];
  sermons: Sermon[];
  instagramPosts: InstagramPost[];
  cells: CellGroup[];
  links: { instagramChurch: string; instagramPastor: string; youtube: string; cells: string; linktree: string; conference: string };
  contact: { address: string; whatsapp: string };
  giving: { pixKeyType: PixKeyType; pixKey: string; pixCopyPaste: string; qrCode: string; bankName: string; agency: string; account: string; accountHolder: string; document: string };
};
