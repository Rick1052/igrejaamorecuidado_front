export type Service = { day: string; title: string; time: string; note: string };
export type Sermon = { title: string; speaker: string; url: string; thumbnail: string };
export type CellGroup = { id: string; name: string; leaders: string; address: string; phone: string; lat: number; lng: number };
export type InstagramPost = { id: string; caption: string; mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"; mediaUrl: string; thumbnailUrl: string; permalink: string; timestamp: string };
export type SiteData = {
  announcement: { enabled: boolean; eyebrow: string; title: string; date: string; url: string; image: string; mobileImage: string };
  faceToFace: {
    enabled: boolean; eyebrow: string; title: string; description: string;
    men: { title: string; date: string; url: string; desktopImage: string; mobileImage: string; cardImage: string };
    women: { title: string; date: string; url: string; desktopImage: string; mobileImage: string; cardImage: string };
  };
  hero: { image: string; mobileImage: string; eyebrow: string; title: string; description: string; primaryCta: string; secondaryCta: string };
  services: Service[];
  sermons: Sermon[];
  instagramPosts: InstagramPost[];
  cells: CellGroup[];
  links: { instagramChurch: string; instagramPastor: string; youtube: string; cells: string; linktree: string; conference: string };
  contact: { address: string; whatsapp: string };
};
