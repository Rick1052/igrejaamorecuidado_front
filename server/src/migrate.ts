// Converte o conteúdo salvo no formato antigo (banners e textos fixos) para banners, seções, páginas e menu editáveis.
// É idempotente: dados que já estão no formato novo passam sem alteração.

type Raw = Record<string, any>;

const button = (id: string, label: string, url: string) => ({ id, label, url });

export function defaultSections(raw: Raw) {
  const links = raw.links ?? {};
  const contact = raw.contact ?? {};
  const face = raw.faceToFace ?? {};
  const giving = raw.giving ?? {};
  const base = { enabled: true, eyebrow: "", title: "", text: "", quote: "", image: "", theme: "light", buttons: [], items: [] };
  return [
    { ...base, id: "sobre", kind: "about", eyebrow: "BEM-VINDO À IAC", title: "Você não precisa\ncaminhar *sozinho.*",
      text: "Somos uma família que acredita no poder do amor, da presença e do cuidado. Aqui, cada história importa e todo mundo tem lugar à mesa.",
      buttons: [button("sobre-instagram", "Conheça nossa comunidade", links.instagramChurch || "https://www.instagram.com/iacguarapuava")],
      items: [
        { id: "valor-amar", title: "Amar", text: "Jesus no centro e pessoas como prioridade." },
        { id: "valor-cuidar", title: "Cuidar", text: "Relacionamentos que acolhem e fortalecem." },
        { id: "valor-enviar", title: "Enviar", text: "Uma fé viva que transforma onde chega." }
      ] },
    { ...base, id: "marca", kind: "marquee", title: "Lugar de *céus* abertos", text: "uma *família* para pertencer" },
    { ...base, id: "agenda", kind: "schedule", eyebrow: "NOS ENCONTRAMOS TODA SEMANA", title: "Sempre tem um\n*lugar para você.*" },
    { ...base, id: "celulas", kind: "cells", eyebrow: "VIDA EM COMUNIDADE", title: "Igreja acontece\ntambém *nas casas.*",
      text: "Células são ambientes para criar raízes, compartilhar a vida e crescer na fé. Selecione uma inicial no mapa para ver os líderes, o endereço e como chegar." },
    { ...base, id: "mensagens", kind: "sermons", eyebrow: "MENSAGENS QUE EDIFICAM", title: "Continue crescendo\n*onde estiver.*",
      buttons: [button("mensagens-youtube", "Ir para o YouTube", links.youtube || "https://www.youtube.com")] },
    { ...base, id: "face-a-face", kind: "faceToFace", enabled: face.enabled ?? true, eyebrow: face.eyebrow || "ENCONTRO COM DEUS",
      title: `${face.title || "Face a Face"}\n*com Deus.*`, text: face.description || "" },
    { ...base, id: "visita", kind: "visit", theme: "dark", eyebrow: "SUA PRIMEIRA VEZ?", title: "Chegue como está.\n*A casa é sua.*",
      text: "Queremos deixar sua primeira visita leve e especial. Se tiver qualquer dúvida, fale com a nossa equipe.",
      quote: "Onde há amor,\nhá um lugar\npara recomeçar.",
      buttons: [button("visita-whatsapp", "Falar com a equipe", `https://wa.me/${contact.whatsapp || ""}`)] },
    { ...base, id: "contribua", kind: "giving", enabled: giving.enabled ?? false, eyebrow: "OFERTAS E CONTRIBUIÇÕES", title: "Semear também\n*é adorar.*",
      text: giving.description || "Sua generosidade sustenta a obra, alcança vidas e mantém as portas da nossa casa abertas. Contribua com alegria pelo PIX ou por transferência." },
    { ...base, id: "instagram", kind: "instagram", eyebrow: "NOSSA SEMANA EM COMUNIDADE", title: "Acompanhe a IAC\n*no Instagram.*" }
  ];
}

function defaultBanners(raw: Raw) {
  const hero = raw.hero ?? {};
  const announcement = raw.announcement;
  const face = raw.faceToFace;
  const banners: Raw[] = [];
  if (announcement) banners.push({
    id: "banner-evento", enabled: Boolean(announcement.enabled && (announcement.image || announcement.mobileImage)), name: announcement.eyebrow || "Evento em destaque",
    layout: "art", desktopImage: announcement.image || "", mobileImage: announcement.mobileImage || "",
    eyebrow: announcement.eyebrow || "", title: announcement.title || "", description: announcement.date || "",
    buttons: announcement.url ? [button("banner-evento-inscricao", "Garanta sua vaga", announcement.url)] : []
  });
  if (face) for (const [key, label] of [["men", "Homens"], ["women", "Mulheres"]] as const) {
    const event = face[key];
    if (!event) continue;
    banners.push({
      id: `banner-face-${key}`, enabled: Boolean(face.enabled && (event.desktopImage || event.mobileImage)), name: event.title || `Face a Face ${label}`,
      layout: "art", desktopImage: event.desktopImage || "", mobileImage: event.mobileImage || "",
      eyebrow: face.eyebrow || "", title: event.title || "", description: event.date || "",
      buttons: event.url ? [button(`banner-face-${key}-inscricao`, "Inscreva-se", event.url)] : []
    });
  }
  banners.push({
    id: "banner-igreja", enabled: true, name: "Apresentação da igreja", layout: "text",
    desktopImage: hero.image || "/hero-worship.png", mobileImage: hero.mobileImage || hero.image || "/hero-worship.png",
    eyebrow: hero.eyebrow || "IGREJA AMOR E CUIDADO • GUARAPUAVA", title: hero.title || "Um lugar para chamar de casa.", description: hero.description || "",
    buttons: [button("banner-igreja-visita", hero.primaryCta || "Planeje sua visita", "#visita"), button("banner-igreja-mensagens", hero.secondaryCta || "Assista às ministrações", "#mensagens")]
  });
  return banners;
}

function defaultMenu(sections: Raw[]) {
  const enabled = (id: string) => sections.some(section => section.id === id && section.enabled);
  return [
    { id: "menu-sobre", label: "Quem somos", url: "#sobre", highlight: false },
    { id: "menu-agenda", label: "Agenda", url: "#agenda", highlight: false },
    { id: "menu-mensagens", label: "Mensagens", url: "#mensagens", highlight: false },
    { id: "menu-celulas", label: "Células", url: "#celulas", highlight: false },
    ...(enabled("contribua") ? [{ id: "menu-contribua", label: "Contribua", url: "#contribua", highlight: false }] : []),
    { id: "menu-visita", label: "Vou visitar", url: "#visita", highlight: true }
  ];
}

export function migrateSite(input: unknown): Raw {
  const raw: Raw = structuredClone(input ?? {});
  if (!Array.isArray(raw.banners)) raw.banners = defaultBanners(raw);
  if (!Array.isArray(raw.sections)) raw.sections = defaultSections(raw);
  if (!Array.isArray(raw.pages)) raw.pages = [];
  if (!Array.isArray(raw.menu)) raw.menu = defaultMenu(raw.sections);
  // Campos que agora vivem nos banners e nas seções.
  if (raw.faceToFace) for (const key of ["men", "women"]) {
    const event = raw.faceToFace[key];
    if (event) raw.faceToFace[key] = { title: event.title, date: event.date, url: event.url, cardImage: event.cardImage ?? "" };
  }
  if (raw.giving) { delete raw.giving.enabled; delete raw.giving.title; delete raw.giving.description; }
  delete raw.hero;
  delete raw.announcement;
  return raw;
}
