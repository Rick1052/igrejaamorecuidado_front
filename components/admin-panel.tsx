"use client";

import { ArrowLeft, Eye, LoaderCircle, LogOut, Plus, Save, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { normalizeSiteData } from "@/lib/site-data";
import { pixKeyTypes, type PixKeyType, type SiteData } from "@/lib/types";
import fallback from "@/data/fallback.json";
import { Logo } from "./logo";
import { BannersEditor } from "./admin/banners-editor";
import { Field, ImageField, imageSpecs, Select, TextArea, type UploadImage } from "./admin/fields";
import { MenuEditor } from "./admin/menu-editor";
import { PagesEditor } from "./admin/pages-editor";
import { HomeSectionsEditor } from "./admin/sections-editor";

const navigation = [
  ["#banners", "Banners"], ["#secoes", "Seções da página"], ["#paginas", "Páginas"], ["#menu", "Menu"],
  ["#cultos", "Agenda de cultos"], ["#celulas-admin", "Células no mapa"], ["#mensagens-admin", "Ministrações"],
  ["#face-a-face-admin", "Face a Face"], ["#ofertas-admin", "Ofertas"], ["#links", "Links e contato"]
];

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
    setData(normalizeSiteData(result)); setMessage("Alterações publicadas com sucesso.");
  }

  const uploadImage: UploadImage = async file => {
    const response = await fetch("/api/admin/uploads", { method: "POST", headers: { "Content-Type": file.type, Authorization: `Bearer ${token}` }, body: file });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message);
    return result.url;
  };

  if (!token) return <main className="admin-shell login-shell"><div className="login-card"><Logo /><p className="eyebrow dark">PAINEL ADMINISTRATIVO</p><h1>Bem-vindo de volta.</h1><p>Entre para atualizar o conteúdo do site.</p><form method="post" onSubmit={login}><label>E-mail<input name="email" type="email" defaultValue="admin@iacguarapuava.com.br" required /></label><label>Senha<input name="password" type="password" required /></label>{message && <p className="form-message error">{message}</p>}<button className="button button-dark" disabled={loading}>{loading && <LoaderCircle className="spin" />} Entrar</button></form><a className="back-link" href="/"><ArrowLeft /> Voltar ao site</a></div></main>;

  const update = <K extends keyof SiteData>(key: K, value: SiteData[K]) => setData({ ...data, [key]: value });

  return <main className="admin-shell"><aside className="admin-sidebar"><Logo light /><nav>{navigation.map(([href, label], index) => <a key={href} className={index === 0 ? "active" : undefined} href={href}>{label}</a>)}</nav><button onClick={() => { sessionStorage.removeItem("iac-admin-token"); setToken(""); }}><LogOut /> Sair</button></aside>
    <div className="admin-main"><header><div><p className="eyebrow dark">CONTEÚDO DO SITE</p><h1>Painel IAC</h1></div><div><a className="button button-outline" href="/" target="_blank"><Eye /> Visualizar site</a><button className="button button-dark" onClick={save} disabled={loading}>{loading ? <LoaderCircle className="spin" /> : <Save />} Publicar alterações</button></div></header>{message && <p className={`save-message ${message.includes("sucesso") ? "success" : "error"}`}>{message}</p>}
      <BannersEditor data={data} setData={setData} upload={uploadImage} />
      <HomeSectionsEditor data={data} setData={setData} upload={uploadImage} />
      <PagesEditor data={data} setData={setData} upload={uploadImage} />
      <MenuEditor data={data} setData={setData} />

      <section className="admin-card" id="cultos"><div className="admin-card-title"><div><span>05</span><h2>Agenda de cultos</h2></div><button className="icon-text" onClick={() => update("services", [...data.services, { day: "", title: "", time: "", note: "" }])}><Plus /> Adicionar</button></div><div className="repeat-list">{data.services.map((service, index) => <div className="repeat-row" key={index}><Field label="Dia" value={service.day} onChange={value => updateAt("services", index, { day: value })}/><Field label="Encontro" value={service.title} onChange={value => updateAt("services", index, { title: value })}/><Field label="Horário" value={service.time} onChange={value => updateAt("services", index, { time: value })}/><Field label="Observação" value={service.note} onChange={value => updateAt("services", index, { note: value })}/><button className="trash" aria-label="Excluir encontro" onClick={() => update("services", data.services.filter((_, itemIndex) => itemIndex !== index))}><Trash2 /></button></div>)}</div></section>
      <section className="admin-card" id="celulas-admin"><div className="admin-card-title"><div><span>06</span><h2>Células no mapa</h2></div><button className="icon-text" onClick={() => update("cells", [...data.cells, { id: `cell-${Date.now()}`, name: "", leaders: "", address: "", phone: "", lat: -25.3907, lng: -51.4628 }])}><Plus /> Adicionar</button></div><p className="admin-help">Latitude e longitude definem o ponto exato. Clique em um endereço no Google Maps para conferir as coordenadas antes de publicar.</p><div className="repeat-list">{data.cells.map((cell, index) => <div className="repeat-row cell-admin-row" key={cell.id}><Field label="Nome / bairro" value={cell.name} onChange={value => updateAt("cells", index, { name: value })}/><Field label="Líderes" value={cell.leaders} onChange={value => updateAt("cells", index, { leaders: value })}/><Field label="Endereço" value={cell.address} onChange={value => updateAt("cells", index, { address: value })}/><Field label="Telefone" value={cell.phone} onChange={value => updateAt("cells", index, { phone: value })}/><Field label="Latitude" type="number" value={String(cell.lat)} onChange={value => updateAt("cells", index, { lat: Number(value) })}/><Field label="Longitude" type="number" value={String(cell.lng)} onChange={value => updateAt("cells", index, { lng: Number(value) })}/><button className="trash" aria-label={`Excluir célula ${cell.name}`} onClick={() => update("cells", data.cells.filter((_, itemIndex) => itemIndex !== index))}><Trash2 /></button></div>)}</div></section>
      <section className="admin-card" id="mensagens-admin"><div className="admin-card-title"><div><span>07</span><h2>Ministrações de fallback</h2></div><button className="icon-text" onClick={() => update("sermons", [...data.sermons, { title: "", speaker: "", url: data.links.youtube, thumbnail: "" }])}><Plus /> Adicionar</button></div><p className="admin-help">O site mostra automaticamente as três publicações mais recentes do YouTube. Esta lista só é exibida se o canal estiver temporariamente indisponível.</p><div className="repeat-list">{data.sermons.map((sermon, index) => <div className="repeat-row sermon-admin" key={index}><Field label="Título" value={sermon.title} onChange={value => updateAt("sermons", index, { title: value })}/><Field label="Ministrante" value={sermon.speaker} onChange={value => updateAt("sermons", index, { speaker: value })}/><Field label="Link do vídeo" type="url" value={sermon.url} onChange={value => updateAt("sermons", index, { url: value })}/><Field label="URL da capa (opcional)" type="url" value={sermon.thumbnail} onChange={value => updateAt("sermons", index, { thumbnail: value })}/><button className="trash" aria-label="Excluir ministração" onClick={() => update("sermons", data.sermons.filter((_, itemIndex) => itemIndex !== index))}><Trash2 /></button></div>)}</div></section>
      <FaceToFaceAdmin data={data} setData={setData} upload={uploadImage} />
      <GivingAdmin data={data} setData={setData} upload={uploadImage} />
      <section className="admin-card" id="links"><div className="admin-card-title"><div><span>10</span><h2>Links e contato</h2></div></div><div className="form-grid"><Field label="Instagram da igreja" type="url" value={data.links.instagramChurch} onChange={value => update("links", { ...data.links, instagramChurch: value })}/><Field label="Instagram do pastor" type="url" value={data.links.instagramPastor} onChange={value => update("links", { ...data.links, instagramPastor: value })}/><Field label="YouTube" type="url" value={data.links.youtube} onChange={value => update("links", { ...data.links, youtube: value })}/><Field label="Todos os links (Linktree)" type="url" value={data.links.linktree} onChange={value => update("links", { ...data.links, linktree: value })}/><Field wide label="Endereço" value={data.contact.address} onChange={value => update("contact", { ...data.contact, address: value })}/><Field label="WhatsApp (somente números)" value={data.contact.whatsapp} onChange={value => update("contact", { ...data.contact, whatsapp: value })}/></div></section>
    </div>
  </main>;

  function updateAt<K extends "services" | "sermons" | "cells">(key: K, index: number, patch: Partial<SiteData[K][number]>) {
    const list = [...data[key]] as SiteData[K][number][];
    list[index] = { ...list[index], ...patch };
    setData({ ...data, [key]: list });
  }
}

function FaceToFaceAdmin({ data, setData, upload }: { data: SiteData; setData: (data: SiteData) => void; upload: UploadImage }) {
  const updateEvent = (audience: "men" | "women", key: keyof SiteData["faceToFace"]["men"], value: string) => setData({ ...data, faceToFace: { ...data.faceToFace, [audience]: { ...data.faceToFace[audience], [key]: value } } });
  return <section className="admin-card" id="face-a-face-admin">
    <div className="admin-card-title"><div><span>08</span><h2>Encontros Face a Face</h2></div></div>
    <p className="admin-help">Dados dos cards da seção Face a Face. Os textos e a visibilidade da seção ficam em Seções da página; os banners do carrossel ficam em Banners.</p>
    {(["men", "women"] as const).map(audience => <div className="face-admin-group" key={audience}>
      <h3>{audience === "men" ? "Homens" : "Mulheres"}</h3><div className="form-grid">
        <Field label="Nome" value={data.faceToFace[audience].title} onChange={value => updateEvent(audience, "title", value)} />
        <Field label="Data" value={data.faceToFace[audience].date} onChange={value => updateEvent(audience, "date", value)} />
        <Field wide label="Link de inscrição" type="url" value={data.faceToFace[audience].url} onChange={value => updateEvent(audience, "url", value)} />
        <ImageField label="Imagem do card" spec={imageSpecs.faceCard} upload={upload} value={data.faceToFace[audience].cardImage} onChange={value => updateEvent(audience, "cardImage", value)} emptyNote="Sem imagem: o card aparece só com o texto." />
      </div>
    </div>)}
  </section>;
}

function GivingAdmin({ data, setData, upload }: { data: SiteData; setData: (data: SiteData) => void; upload: UploadImage }) {
  const giving = data.giving;
  const update = <K extends keyof SiteData["giving"]>(key: K, value: SiteData["giving"][K]) => setData({ ...data, giving: { ...giving, [key]: value } });
  return <section className="admin-card" id="ofertas-admin">
    <div className="admin-card-title"><div><span>09</span><h2>Ofertas e contribuições</h2></div></div>
    <p className="admin-help">Dados exibidos na seção Ofertas. Ligue a seção e edite os textos em Seções da página. Ela só aparece com uma chave PIX ou uma conta preenchida; campos vazios não aparecem.</p>
    <div className="form-grid">
      <Select label="Tipo de chave PIX" value={giving.pixKeyType} options={pixKeyTypes.map(type => ({ value: type, label: type }))} onChange={(value: PixKeyType) => update("pixKeyType", value)} />
      <Field label="Chave PIX" value={giving.pixKey} onChange={value => update("pixKey", value)} placeholder="Opcional" />
      <ImageField label="QR Code PIX" spec={imageSpecs.pixQrCode} upload={upload} value={giving.qrCode} onChange={value => update("qrCode", value)} emptyNote="Sem QR Code: o site mostra só a chave e os botões de copiar." />
      <TextArea label="Pix copia e cola (código do QR Code)" value={giving.pixCopyPaste} onChange={value => update("pixCopyPaste", value.trim())} rows={3} help="No app do banco, gere o QR Code e copie o código “copia e cola”. Ele vira um botão no site, útil para quem está no celular." />
      <Field label="Banco" value={giving.bankName} onChange={value => update("bankName", value)} placeholder="Opcional" />
      <Field label="Agência" value={giving.agency} onChange={value => update("agency", value)} placeholder="Opcional" />
      <Field label="Conta (com dígito)" value={giving.account} onChange={value => update("account", value)} placeholder="Opcional" />
      <Field label="Titular da conta" value={giving.accountHolder} onChange={value => update("accountHolder", value)} placeholder="Opcional" />
      <Field label="CNPJ ou CPF do titular" value={giving.document} onChange={value => update("document", value)} placeholder="Opcional" />
    </div>
  </section>;
}
