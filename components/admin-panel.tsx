"use client";

import { ArrowLeft, Eye, ImageUp, LoaderCircle, LogOut, Plus, Save, Trash2, TriangleAlert } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { normalizeSiteData } from "@/lib/site-data";
import { pixKeyTypes, type PixKeyType, type SiteData } from "@/lib/types";
import fallback from "@/data/fallback.json";
import { Logo } from "./logo";

type ImageSpec = { width: number; height: number; hint: string };
type UploadImage = (file: File) => Promise<string>;

// Dimensões calculadas a partir de como cada banner é recortado no site (ver hero-slider e globals.css).
const imageSpecs = {
  conferenceDesktop: { width: 1920, height: 1080, hint: "Aparece inteira sobre um fundo desfocado da própria arte. Evite textos colados nas bordas." },
  conferenceMobile: { width: 1080, height: 1920, hint: "Arte vertical exibida inteira no celular. O botão de inscrição fica logo abaixo da arte." },
  faceDesktop: { width: 3000, height: 1080, hint: "Ocupa a largura total e metade da altura da tela, com corte nas bordas. Mantenha textos no centro e o lado direito livre para o botão." },
  faceMobile: { width: 1080, height: 1920, hint: "Ocupa metade da tela do celular e é recortada em formato quase quadrado. Concentre o conteúdo no centro." },
  faceCard: { width: 1080, height: 1350, hint: "Card da seção Face a Face, exibido inteiro no formato retrato 4:5." },
  heroDesktop: { width: 1920, height: 1080, hint: "Fundo da apresentação da igreja. O título fica sobre o lado esquerdo, que recebe uma sombra escura." },
  heroMobile: { width: 1080, height: 1920, hint: "Fundo vertical do celular, com o título por cima. Prefira imagens com áreas escuras." }
} satisfies Record<string, ImageSpec>;
const maxImageBytes = 8 * 1024 * 1024;

export function AdminPanel() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<SiteData>(fallback as SiteData);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("iac-admin-token");
    if (saved) setToken(saved);
    fetch("/api/admin/site", { cache: "no-store" }).then(r => r.ok ? r.json() : Promise.reject()).then(result => setData(normalizeSiteData(result))).catch(() => undefined);
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
    const result = await response.json(); setLoading(false);
    if (!response.ok) { setMessage(result.message); return; }
    sessionStorage.setItem("iac-admin-token", result.token); setToken(result.token);
  }

  async function save() {
    setLoading(true); setMessage("");
    const response = await fetch("/api/admin/site", { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(data) });
    const result = await response.json(); setLoading(false);
    if (!response.ok) { setMessage(result.message); return; }
    setData(result); setMessage("Alterações publicadas com sucesso.");
  }

  const uploadImage: UploadImage = async file => {
    const response = await fetch("/api/admin/uploads", { method: "POST", headers: { "Content-Type": file.type, Authorization: `Bearer ${token}` }, body: file });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message);
    return result.url;
  };

  if (!token) return <main className="admin-shell login-shell"><div className="login-card"><Logo /><p className="eyebrow dark">PAINEL ADMINISTRATIVO</p><h1>Bem-vindo de volta.</h1><p>Entre para atualizar o conteúdo do site.</p><form method="post" onSubmit={login}><label>E-mail<input name="email" type="email" defaultValue="admin@iacguarapuava.com.br" required /></label><label>Senha<input name="password" type="password" required /></label>{message && <p className="form-message error">{message}</p>}<button className="button button-dark" disabled={loading}>{loading && <LoaderCircle className="spin" />} Entrar</button></form><a className="back-link" href="/"><ArrowLeft /> Voltar ao site</a></div></main>;

  return <main className="admin-shell"><aside className="admin-sidebar"><Logo light /><nav><a className="active" href="#evento">Evento e destaque</a><a href="#face-a-face-admin">Face a Face</a><a href="#banner-principal">Banner principal</a><a href="#cultos">Agenda de cultos</a><a href="#celulas-admin">Células no mapa</a><a href="#mensagens-admin">Ministrações</a><a href="#links">Links e contato</a><a href="#ofertas-admin">Ofertas</a></nav><button onClick={() => { sessionStorage.removeItem("iac-admin-token"); setToken(""); }}><LogOut /> Sair</button></aside>
    <div className="admin-main"><header><div><p className="eyebrow dark">CONTEÚDO DO SITE</p><h1>Painel IAC</h1></div><div><a className="button button-outline" href="/" target="_blank"><Eye /> Visualizar site</a><button className="button button-dark" onClick={save} disabled={loading}>{loading ? <LoaderCircle className="spin" /> : <Save />} Publicar alterações</button></div></header>{message && <p className={`save-message ${message.includes("sucesso") ? "success" : "error"}`}>{message}</p>}
      <section className="admin-card" id="evento"><div className="admin-card-title"><div><span>01</span><h2>Evento em destaque</h2></div><div className="admin-card-actions"><DeleteBannerButton disabled={!data.announcement.image && !data.announcement.mobileImage} onConfirm={() => setData({ ...data, announcement: { ...data.announcement, enabled: false, image: "", mobileImage: "" } })} /><label className="switch"><input type="checkbox" checked={data.announcement.enabled} onChange={e => setData({ ...data, announcement: { ...data.announcement, enabled: e.target.checked } })}/><span /></label></div></div><div className="form-grid"><Field label="Chamada" value={data.announcement.eyebrow} onChange={value => setData({ ...data, announcement: { ...data.announcement, eyebrow: value } })}/><Field label="Data ou status" value={data.announcement.date} onChange={value => setData({ ...data, announcement: { ...data.announcement, date: value } })}/><Field wide label="Título" value={data.announcement.title} onChange={value => setData({ ...data, announcement: { ...data.announcement, title: value } })}/><Field wide label="Link de inscrição" type="url" value={data.announcement.url} onChange={value => setData({ ...data, announcement: { ...data.announcement, url: value } })}/><ImageField label="Banner desktop" spec={imageSpecs.conferenceDesktop} upload={uploadImage} value={data.announcement.image} onChange={value => setData({ ...data, announcement: { ...data.announcement, image: value } })}/><ImageField label="Banner mobile" spec={imageSpecs.conferenceMobile} upload={uploadImage} value={data.announcement.mobileImage} onChange={value => setData({ ...data, announcement: { ...data.announcement, mobileImage: value } })}/></div></section>
      <FaceToFaceAdmin data={data} setData={setData} upload={uploadImage} />
      <section className="admin-card" id="banner-principal"><div className="admin-card-title"><div><span>03</span><h2>Banner principal</h2></div></div><p className="admin-help">Último slide do carrossel, com a apresentação da igreja.</p><div className="form-grid"><Field label="Chamada" value={data.hero.eyebrow} onChange={value => setData({ ...data, hero: { ...data.hero, eyebrow: value } })}/><Field label="Título" value={data.hero.title} onChange={value => setData({ ...data, hero: { ...data.hero, title: value } })}/><Field wide label="Descrição" value={data.hero.description} onChange={value => setData({ ...data, hero: { ...data.hero, description: value } })}/><Field label="Botão principal" value={data.hero.primaryCta} onChange={value => setData({ ...data, hero: { ...data.hero, primaryCta: value } })}/><Field label="Botão secundário" value={data.hero.secondaryCta} onChange={value => setData({ ...data, hero: { ...data.hero, secondaryCta: value } })}/><ImageField label="Imagem desktop" emptyNote="Sem imagem: o site usa a foto padrão da igreja." spec={imageSpecs.heroDesktop} upload={uploadImage} value={data.hero.image} onChange={value => setData({ ...data, hero: { ...data.hero, image: value } })}/><ImageField label="Imagem mobile" emptyNote="Sem imagem: o celular usa a imagem desktop." spec={imageSpecs.heroMobile} upload={uploadImage} value={data.hero.mobileImage} onChange={value => setData({ ...data, hero: { ...data.hero, mobileImage: value } })}/></div></section>
      <section className="admin-card" id="cultos"><div className="admin-card-title"><div><span>04</span><h2>Agenda de cultos</h2></div><button className="icon-text" onClick={() => setData({ ...data, services: [...data.services, { day: "", title: "", time: "", note: "" }] })}><Plus /> Adicionar</button></div><div className="repeat-list">{data.services.map((service, index) => <div className="repeat-row" key={index}><Field label="Dia" value={service.day} onChange={value => updateService(index, "day", value, data, setData)}/><Field label="Encontro" value={service.title} onChange={value => updateService(index, "title", value, data, setData)}/><Field label="Horário" value={service.time} onChange={value => updateService(index, "time", value, data, setData)}/><Field label="Observação" value={service.note} onChange={value => updateService(index, "note", value, data, setData)}/><button className="trash" aria-label="Excluir encontro" onClick={() => setData({ ...data, services: data.services.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 /></button></div>)}</div></section>
      <section className="admin-card" id="celulas-admin"><div className="admin-card-title"><div><span>05</span><h2>Células no mapa</h2></div><button className="icon-text" onClick={() => setData({ ...data, cells: [...data.cells, { id: `cell-${Date.now()}`, name: "", leaders: "", address: "", phone: "", lat: -25.3907, lng: -51.4628 }] })}><Plus /> Adicionar</button></div><p className="admin-help">Latitude e longitude definem o ponto exato. Clique em um endereço no Google Maps para conferir as coordenadas antes de publicar.</p><div className="repeat-list">{data.cells.map((cell, index) => <div className="repeat-row cell-admin-row" key={cell.id}><Field label="Nome / bairro" value={cell.name} onChange={value => updateCell(index, "name", value, data, setData)}/><Field label="Líderes" value={cell.leaders} onChange={value => updateCell(index, "leaders", value, data, setData)}/><Field label="Endereço" value={cell.address} onChange={value => updateCell(index, "address", value, data, setData)}/><Field label="Telefone" value={cell.phone} onChange={value => updateCell(index, "phone", value, data, setData)}/><Field label="Latitude" type="number" value={String(cell.lat)} onChange={value => updateCell(index, "lat", Number(value), data, setData)}/><Field label="Longitude" type="number" value={String(cell.lng)} onChange={value => updateCell(index, "lng", Number(value), data, setData)}/><button className="trash" aria-label={`Excluir célula ${cell.name}`} onClick={() => setData({ ...data, cells: data.cells.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 /></button></div>)}</div></section>
      <section className="admin-card" id="mensagens-admin"><div className="admin-card-title"><div><span>06</span><h2>Ministrações de fallback</h2></div><button className="icon-text" onClick={() => setData({ ...data, sermons: [...data.sermons, { title: "", speaker: "", url: data.links.youtube, thumbnail: "" }] })}><Plus /> Adicionar</button></div><p className="admin-help">O site mostra automaticamente as três publicações mais recentes do YouTube. Esta lista só é exibida se o canal estiver temporariamente indisponível.</p><div className="repeat-list">{data.sermons.map((sermon, index) => <div className="repeat-row sermon-admin" key={index}><Field label="Título" value={sermon.title} onChange={value => updateSermon(index, "title", value, data, setData)}/><Field label="Ministrante" value={sermon.speaker} onChange={value => updateSermon(index, "speaker", value, data, setData)}/><Field label="Link do vídeo" type="url" value={sermon.url} onChange={value => updateSermon(index, "url", value, data, setData)}/><Field label="URL da capa (opcional)" type="url" value={sermon.thumbnail} onChange={value => updateSermon(index, "thumbnail", value, data, setData)}/><button className="trash" aria-label="Excluir ministração" onClick={() => setData({ ...data, sermons: data.sermons.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 /></button></div>)}</div></section>
      <section className="admin-card" id="links"><div className="admin-card-title"><div><span>07</span><h2>Links e contato</h2></div></div><div className="form-grid"><Field label="Instagram da igreja" type="url" value={data.links.instagramChurch} onChange={value => setData({ ...data, links: { ...data.links, instagramChurch: value } })}/><Field label="Instagram do pastor" type="url" value={data.links.instagramPastor} onChange={value => setData({ ...data, links: { ...data.links, instagramPastor: value } })}/><Field label="YouTube" type="url" value={data.links.youtube} onChange={value => setData({ ...data, links: { ...data.links, youtube: value } })}/><Field wide label="Endereço" value={data.contact.address} onChange={value => setData({ ...data, contact: { ...data.contact, address: value } })}/><Field label="WhatsApp (somente números)" value={data.contact.whatsapp} onChange={value => setData({ ...data, contact: { ...data.contact, whatsapp: value } })}/></div></section>
      <GivingAdmin data={data} setData={setData} />
    </div>
  </main>;
}

function Field({ label, value, onChange, type = "text", wide = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; wide?: boolean }) { return <label className={wide ? "wide" : ""}>{label}<input type={type} value={value} onChange={e => onChange(e.target.value)} required /></label>; }
function updateService(index: number, key: keyof SiteData["services"][number], value: string, data: SiteData, setData: (data: SiteData) => void) { const services = [...data.services]; services[index] = { ...services[index], [key]: value }; setData({ ...data, services }); }
function updateSermon(index: number, key: keyof SiteData["sermons"][number], value: string, data: SiteData, setData: (data: SiteData) => void) { const sermons = [...data.sermons]; sermons[index] = { ...sermons[index], [key]: value }; setData({ ...data, sermons }); }
function updateCell(index: number, key: keyof SiteData["cells"][number], value: string | number, data: SiteData, setData: (data: SiteData) => void) { const cells = [...data.cells]; cells[index] = { ...cells[index], [key]: value }; setData({ ...data, cells }); }

function FaceToFaceAdmin({ data, setData, upload }: { data: SiteData; setData: (data: SiteData) => void; upload: UploadImage }) {
  const updateEvent = (audience: "men" | "women", key: keyof SiteData["faceToFace"]["men"], value: string) => setData({ ...data, faceToFace: { ...data.faceToFace, [audience]: { ...data.faceToFace[audience], [key]: value } } });
  return <section className="admin-card" id="face-a-face-admin">
    <div className="admin-card-title"><div><span>02</span><h2>Encontro Face a Face</h2></div><div className="admin-card-actions"><DeleteBannerButton disabled={(["men", "women"] as const).every(audience => !data.faceToFace[audience].desktopImage && !data.faceToFace[audience].mobileImage && !data.faceToFace[audience].cardImage)} onConfirm={() => setData({ ...data, faceToFace: { ...data.faceToFace, enabled: false, men: { ...data.faceToFace.men, desktopImage: "", mobileImage: "", cardImage: "" }, women: { ...data.faceToFace.women, desktopImage: "", mobileImage: "", cardImage: "" } } })} /><label className="switch"><input type="checkbox" checked={data.faceToFace.enabled} onChange={event => setData({ ...data, faceToFace: { ...data.faceToFace, enabled: event.target.checked } })} /><span /></label></div></div>
    <div className="form-grid">
      <Field label="Chamada" value={data.faceToFace.eyebrow} onChange={value => setData({ ...data, faceToFace: { ...data.faceToFace, eyebrow: value } })} />
      <Field label="Título" value={data.faceToFace.title} onChange={value => setData({ ...data, faceToFace: { ...data.faceToFace, title: value } })} />
      <Field wide label="Descrição do encontro" value={data.faceToFace.description} onChange={value => setData({ ...data, faceToFace: { ...data.faceToFace, description: value } })} />
    </div>
    {(["men", "women"] as const).map(audience => <div className="face-admin-group" key={audience}>
      <h3>{audience === "men" ? "Homens" : "Mulheres"}</h3><div className="form-grid">
        <Field label="Nome" value={data.faceToFace[audience].title} onChange={value => updateEvent(audience, "title", value)} />
        <Field label="Data" value={data.faceToFace[audience].date} onChange={value => updateEvent(audience, "date", value)} />
        <Field wide label="Link de inscrição" type="url" value={data.faceToFace[audience].url} onChange={value => updateEvent(audience, "url", value)} />
        <ImageField label="Banner desktop" spec={imageSpecs.faceDesktop} upload={upload} value={data.faceToFace[audience].desktopImage} onChange={value => updateEvent(audience, "desktopImage", value)} />
        <ImageField label="Banner mobile" spec={imageSpecs.faceMobile} upload={upload} value={data.faceToFace[audience].mobileImage} onChange={value => updateEvent(audience, "mobileImage", value)} />
        <ImageField label="Imagem da seção" spec={imageSpecs.faceCard} upload={upload} value={data.faceToFace[audience].cardImage} onChange={value => updateEvent(audience, "cardImage", value)} />
      </div>
    </div>)}
  </section>;
}

function ImageField({ label, value, onChange, spec, upload, emptyNote = "Sem imagem: este banner não aparece no site." }: { label: string; value: string; onChange: (value: string) => void; spec: ImageSpec; upload: UploadImage; emptyNote?: string }) {
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function selectFile(file: File | undefined) {
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError("Envie uma imagem JPG, PNG ou WebP."); return; }
    if (file.size > maxImageBytes) { setError("A imagem deve ter no máximo 8 MB."); return; }
    setUploading(true);
    try { onChange(await upload(file)); } catch (uploadError) { setError(uploadError instanceof Error && uploadError.message ? uploadError.message : "Não foi possível enviar a imagem."); }
    setUploading(false);
  }

  const idealRatio = spec.width / spec.height;
  // A imagem pode ser apagada de fora (Excluir banner), então o tamanho lido só vale enquanto houver imagem.
  const loaded = value ? natural : null;
  const ratioOff = loaded && Math.abs(loaded.width / loaded.height - idealRatio) / idealRatio > 0.03;
  const tooSmall = loaded && loaded.width < spec.width * 0.8;
  const divisor = gcd(spec.width, spec.height);
  const ratio = `${spec.width / divisor}:${spec.height / divisor}`;

  return <div className="image-field wide">
    <div className="image-field-head"><strong>{label}</strong><span className="image-spec">Ideal: {spec.width} × {spec.height} px ({ratio})</span></div>
    <div className="image-field-body">
      <div className="image-preview" style={{ aspectRatio: `${spec.width} / ${spec.height}` }}>
        {value ? <img src={value} alt={`Prévia: ${label}`} onLoad={event => setNatural({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} onError={() => setNatural(null)} /> : <span>Sem imagem</span>}
      </div>
      <div className="image-field-side">
        <p className="image-hint">{spec.hint}</p>
        <p className="image-meta">JPG, PNG ou WebP até 8 MB.{loaded && <> Imagem atual: {loaded.width} × {loaded.height} px.</>}</p>
        {(ratioOff || tooSmall) && <p className="image-warning"><TriangleAlert />{ratioOff ? `Proporção diferente de ${ratio}: a imagem pode ser cortada ou ficar com bordas.` : `Resolução abaixo da ideal (${spec.width} px de largura): pode perder nitidez.`}</p>}
        {error && <p className="image-warning"><TriangleAlert />{error}</p>}
        {!value && <p className="image-meta">{emptyNote}</p>}
        <label className="button upload-button">{uploading ? <LoaderCircle className="spin" /> : <ImageUp />} {uploading ? "Enviando..." : "Enviar imagem"}<input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={uploading} onChange={event => { selectFile(event.target.files?.[0]); event.target.value = ""; }} /></label>
        {value && <button type="button" className="icon-text remove-image" onClick={() => { setNatural(null); onChange(""); }}><Trash2 /> Remover imagem</button>}
        <details className="image-url"><summary>Usar URL ou caminho</summary><input aria-label={`URL: ${label}`} value={value} onChange={event => onChange(event.target.value)} /></details>
      </div>
    </div>
  </div>;
}

function gcd(a: number, b: number): number { return b ? gcd(b, a % b) : a; }

function DeleteBannerButton({ onConfirm, disabled }: { onConfirm: () => void; disabled: boolean }) {
  return <button type="button" className="icon-text delete-banner" disabled={disabled} onClick={() => { if (window.confirm("Excluir as imagens deste banner e tirá-lo do site? As imagens enviadas são apagadas do servidor quando você publicar as alterações.")) onConfirm(); }}><Trash2 /> Excluir banner</button>;
}

function GivingAdmin({ data, setData }: { data: SiteData; setData: (data: SiteData) => void }) {
  const giving = data.giving;
  const update = <K extends keyof SiteData["giving"]>(key: K, value: SiteData["giving"][K]) => setData({ ...data, giving: { ...giving, [key]: value } });
  const missingDetails = giving.enabled && !giving.pixKey && !giving.account;
  return <section className="admin-card" id="ofertas-admin">
    <div className="admin-card-title"><div><span>08</span><h2>Ofertas e contribuições</h2></div><label className="switch"><input type="checkbox" checked={giving.enabled} onChange={event => update("enabled", event.target.checked)} /><span /></label></div>
    <p className="admin-help">A seção aparece no site, no menu e no rodapé quando estiver ligada e tiver uma chave PIX ou uma conta preenchida. Campos vazios não aparecem.</p>
    {missingDetails && <p className="image-warning"><TriangleAlert />Preencha a chave PIX ou os dados da conta para a seção aparecer no site.</p>}
    <div className="form-grid">
      <Field label="Título" value={giving.title} onChange={value => update("title", value)} />
      <label>Tipo de chave PIX<select value={giving.pixKeyType} onChange={event => update("pixKeyType", event.target.value as PixKeyType)}>{pixKeyTypes.map(type => <option key={type}>{type}</option>)}</select></label>
      <Field wide label="Texto da seção" value={giving.description} onChange={value => update("description", value)} />
      <OptionalField wide label="Chave PIX" value={giving.pixKey} onChange={value => update("pixKey", value)} />
      <OptionalField label="Banco" value={giving.bankName} onChange={value => update("bankName", value)} />
      <OptionalField label="Agência" value={giving.agency} onChange={value => update("agency", value)} />
      <OptionalField label="Conta (com dígito)" value={giving.account} onChange={value => update("account", value)} />
      <OptionalField label="Titular da conta" value={giving.accountHolder} onChange={value => update("accountHolder", value)} />
      <OptionalField label="CNPJ ou CPF do titular" value={giving.document} onChange={value => update("document", value)} />
    </div>
  </section>;
}

function OptionalField({ label, value, onChange, wide = false }: { label: string; value: string; onChange: (value: string) => void; wide?: boolean }) { return <label className={wide ? "wide" : ""}>{label}<input value={value} onChange={event => onChange(event.target.value)} placeholder="Opcional" /></label>; }
