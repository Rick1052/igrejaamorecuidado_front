"use client";

import { ArrowLeft, Eye, LoaderCircle, LogOut, Plus, Save, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { normalizeSiteData } from "@/lib/site-data";
import type { SiteData } from "@/lib/types";
import fallback from "@/data/fallback.json";
import { Logo } from "./logo";

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

  if (!token) return <main className="admin-shell login-shell"><div className="login-card"><Logo /><p className="eyebrow dark">PAINEL ADMINISTRATIVO</p><h1>Bem-vindo de volta.</h1><p>Entre para atualizar o conteúdo do site.</p><form method="post" onSubmit={login}><label>E-mail<input name="email" type="email" defaultValue="admin@iacguarapuava.com.br" required /></label><label>Senha<input name="password" type="password" required /></label>{message && <p className="form-message error">{message}</p>}<button className="button button-dark" disabled={loading}>{loading && <LoaderCircle className="spin" />} Entrar</button></form><a className="back-link" href="/"><ArrowLeft /> Voltar ao site</a></div></main>;

  return <main className="admin-shell"><aside className="admin-sidebar"><Logo light /><nav><a className="active" href="#evento">Evento e destaque</a><a href="#cultos">Agenda de cultos</a><a href="#celulas-admin">Células no mapa</a><a href="#mensagens-admin">Ministrações</a><a href="#links">Links e contato</a></nav><button onClick={() => { sessionStorage.removeItem("iac-admin-token"); setToken(""); }}><LogOut /> Sair</button></aside>
    <div className="admin-main"><header><div><p className="eyebrow dark">CONTEÚDO DO SITE</p><h1>Painel IAC</h1></div><div><a className="button button-outline" href="/" target="_blank"><Eye /> Visualizar site</a><button className="button button-dark" onClick={save} disabled={loading}>{loading ? <LoaderCircle className="spin" /> : <Save />} Publicar alterações</button></div></header>{message && <p className={`save-message ${message.includes("sucesso") ? "success" : "error"}`}>{message}</p>}
      <section className="admin-card" id="evento"><div className="admin-card-title"><div><span>01</span><h2>Evento em destaque</h2></div><label className="switch"><input type="checkbox" checked={data.announcement.enabled} onChange={e => setData({ ...data, announcement: { ...data.announcement, enabled: e.target.checked } })}/><span /></label></div><div className="form-grid"><Field label="Chamada" value={data.announcement.eyebrow} onChange={value => setData({ ...data, announcement: { ...data.announcement, eyebrow: value } })}/><Field label="Data ou status" value={data.announcement.date} onChange={value => setData({ ...data, announcement: { ...data.announcement, date: value } })}/><Field wide label="Título" value={data.announcement.title} onChange={value => setData({ ...data, announcement: { ...data.announcement, title: value } })}/><Field wide label="Link de inscrição" type="url" value={data.announcement.url} onChange={value => setData({ ...data, announcement: { ...data.announcement, url: value } })}/><Field wide label="Imagem do banner para desktop (URL ou caminho local)" value={data.announcement.image} onChange={value => setData({ ...data, announcement: { ...data.announcement, image: value } })}/><Field wide label="Imagem do banner para mobile (URL ou caminho local)" value={data.announcement.mobileImage} onChange={value => setData({ ...data, announcement: { ...data.announcement, mobileImage: value } })}/></div></section>
      <section className="admin-card" id="cultos"><div className="admin-card-title"><div><span>02</span><h2>Agenda de cultos</h2></div><button className="icon-text" onClick={() => setData({ ...data, services: [...data.services, { day: "", title: "", time: "", note: "" }] })}><Plus /> Adicionar</button></div><div className="repeat-list">{data.services.map((service, index) => <div className="repeat-row" key={index}><Field label="Dia" value={service.day} onChange={value => updateService(index, "day", value, data, setData)}/><Field label="Encontro" value={service.title} onChange={value => updateService(index, "title", value, data, setData)}/><Field label="Horário" value={service.time} onChange={value => updateService(index, "time", value, data, setData)}/><Field label="Observação" value={service.note} onChange={value => updateService(index, "note", value, data, setData)}/><button className="trash" aria-label="Excluir encontro" onClick={() => setData({ ...data, services: data.services.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 /></button></div>)}</div></section>
      <section className="admin-card" id="celulas-admin"><div className="admin-card-title"><div><span>03</span><h2>Células no mapa</h2></div><button className="icon-text" onClick={() => setData({ ...data, cells: [...data.cells, { id: `cell-${Date.now()}`, name: "", leaders: "", address: "", phone: "", lat: -25.3907, lng: -51.4628 }] })}><Plus /> Adicionar</button></div><p className="admin-help">Latitude e longitude definem o ponto exato. Clique em um endereço no Google Maps para conferir as coordenadas antes de publicar.</p><div className="repeat-list">{data.cells.map((cell, index) => <div className="repeat-row cell-admin-row" key={cell.id}><Field label="Nome / bairro" value={cell.name} onChange={value => updateCell(index, "name", value, data, setData)}/><Field label="Líderes" value={cell.leaders} onChange={value => updateCell(index, "leaders", value, data, setData)}/><Field label="Endereço" value={cell.address} onChange={value => updateCell(index, "address", value, data, setData)}/><Field label="Telefone" value={cell.phone} onChange={value => updateCell(index, "phone", value, data, setData)}/><Field label="Latitude" type="number" value={String(cell.lat)} onChange={value => updateCell(index, "lat", Number(value), data, setData)}/><Field label="Longitude" type="number" value={String(cell.lng)} onChange={value => updateCell(index, "lng", Number(value), data, setData)}/><button className="trash" aria-label={`Excluir célula ${cell.name}`} onClick={() => setData({ ...data, cells: data.cells.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 /></button></div>)}</div></section>
      <section className="admin-card" id="mensagens-admin"><div className="admin-card-title"><div><span>04</span><h2>Ministrações de fallback</h2></div><button className="icon-text" onClick={() => setData({ ...data, sermons: [...data.sermons, { title: "", speaker: "", url: data.links.youtube, thumbnail: "" }] })}><Plus /> Adicionar</button></div><p className="admin-help">O site mostra automaticamente as três publicações mais recentes do YouTube. Esta lista só é exibida se o canal estiver temporariamente indisponível.</p><div className="repeat-list">{data.sermons.map((sermon, index) => <div className="repeat-row sermon-admin" key={index}><Field label="Título" value={sermon.title} onChange={value => updateSermon(index, "title", value, data, setData)}/><Field label="Ministrante" value={sermon.speaker} onChange={value => updateSermon(index, "speaker", value, data, setData)}/><Field label="Link do vídeo" type="url" value={sermon.url} onChange={value => updateSermon(index, "url", value, data, setData)}/><Field label="URL da capa (opcional)" type="url" value={sermon.thumbnail} onChange={value => updateSermon(index, "thumbnail", value, data, setData)}/><button className="trash" aria-label="Excluir ministração" onClick={() => setData({ ...data, sermons: data.sermons.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 /></button></div>)}</div></section>
      <section className="admin-card" id="links"><div className="admin-card-title"><div><span>05</span><h2>Links e contato</h2></div></div><div className="form-grid"><Field label="Instagram da igreja" type="url" value={data.links.instagramChurch} onChange={value => setData({ ...data, links: { ...data.links, instagramChurch: value } })}/><Field label="Instagram do pastor" type="url" value={data.links.instagramPastor} onChange={value => setData({ ...data, links: { ...data.links, instagramPastor: value } })}/><Field label="YouTube" type="url" value={data.links.youtube} onChange={value => setData({ ...data, links: { ...data.links, youtube: value } })}/><Field wide label="Endereço" value={data.contact.address} onChange={value => setData({ ...data, contact: { ...data.contact, address: value } })}/><Field label="WhatsApp (somente números)" value={data.contact.whatsapp} onChange={value => setData({ ...data, contact: { ...data.contact, whatsapp: value } })}/></div></section>
      <FaceToFaceAdmin data={data} setData={setData} />
    </div>
  </main>;
}

function Field({ label, value, onChange, type = "text", wide = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; wide?: boolean }) { return <label className={wide ? "wide" : ""}>{label}<input type={type} value={value} onChange={e => onChange(e.target.value)} required /></label>; }
function updateService(index: number, key: keyof SiteData["services"][number], value: string, data: SiteData, setData: (data: SiteData) => void) { const services = [...data.services]; services[index] = { ...services[index], [key]: value }; setData({ ...data, services }); }
function updateSermon(index: number, key: keyof SiteData["sermons"][number], value: string, data: SiteData, setData: (data: SiteData) => void) { const sermons = [...data.sermons]; sermons[index] = { ...sermons[index], [key]: value }; setData({ ...data, sermons }); }
function updateCell(index: number, key: keyof SiteData["cells"][number], value: string | number, data: SiteData, setData: (data: SiteData) => void) { const cells = [...data.cells]; cells[index] = { ...cells[index], [key]: value }; setData({ ...data, cells }); }

function FaceToFaceAdmin({ data, setData }: { data: SiteData; setData: (data: SiteData) => void }) {
  const updateEvent = (audience: "men" | "women", key: keyof SiteData["faceToFace"]["men"], value: string) => setData({ ...data, faceToFace: { ...data.faceToFace, [audience]: { ...data.faceToFace[audience], [key]: value } } });
  return <section className="admin-card" id="face-a-face-admin">
    <div className="admin-card-title"><div><span>06</span><h2>Encontro Face a Face</h2></div><label className="switch"><input type="checkbox" checked={data.faceToFace.enabled} onChange={event => setData({ ...data, faceToFace: { ...data.faceToFace, enabled: event.target.checked } })} /><span /></label></div>
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
        <Field wide label="Imagem desktop" value={data.faceToFace[audience].desktopImage} onChange={value => updateEvent(audience, "desktopImage", value)} />
        <Field wide label="Imagem mobile" value={data.faceToFace[audience].mobileImage} onChange={value => updateEvent(audience, "mobileImage", value)} />
        <Field wide label="Imagem da seção" value={data.faceToFace[audience].cardImage} onChange={value => updateEvent(audience, "cardImage", value)} />
      </div>
    </div>)}
  </section>;
}
