"use client";

import { Check, HandHeart, LoaderCircle, MessageCircle, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import type { PrayerRequest, PrayerStatus } from "@/lib/types";

export const prayerStatusLabels: Record<PrayerStatus, string> = { new: "Novo", praying: "Em oração", done: "Concluído" };
type Filter = PrayerStatus | "all";
const filters: { value: Filter; label: string }[] = [
  { value: "new", label: "Novos" }, { value: "praying", label: "Em oração" }, { value: "done", label: "Concluídos" }, { value: "all", label: "Todos" }
];

const dateFormat = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

// Telefone vira link de WhatsApp; e-mail vira mailto. Qualquer outro texto aparece como está.
function contactLink(contact: string) {
  if (/^\S+@\S+\.\S+$/.test(contact)) return `mailto:${contact}`;
  const digits = contact.replace(/\D/g, "");
  if (digits.length >= 10 && digits.length <= 13) return `https://wa.me/${digits.length <= 11 ? `55${digits}` : digits}`;
  return null;
}

export function PrayersPanel({ prayers, loading, error, onRefresh, onStatus, onDelete }: {
  prayers: PrayerRequest[]; loading: boolean; error: string;
  onRefresh: () => void; onStatus: (id: string, status: PrayerStatus) => Promise<void>; onDelete: (id: string) => Promise<void>;
}) {
  const [filter, setFilter] = useState<Filter>("new");
  const [busy, setBusy] = useState("");
  const counts = { new: 0, praying: 0, done: 0, all: prayers.length };
  for (const prayer of prayers) counts[prayer.status]++;
  const visible = filter === "all" ? prayers : prayers.filter(prayer => prayer.status === filter);

  async function act(id: string, action: () => Promise<void>) {
    setBusy(id);
    try { await action(); } finally { setBusy(""); }
  }

  return <section className="admin-card" id="pedidos">
    <div className="admin-card-title">
      <div><span><HandHeart /></span><h2>Pedidos de oração</h2></div>
      <button className="icon-text" onClick={onRefresh} disabled={loading}>{loading ? <LoaderCircle className="spin" /> : <RefreshCw />} Atualizar</button>
    </div>
    <p className="admin-help">Pedidos enviados pelo formulário do site. Só quem entra no painel consegue vê-los. A lista se atualiza sozinha a cada minuto.</p>
    <div className="prayer-filters" role="tablist" aria-label="Filtrar pedidos">
      {filters.map(option => <button key={option.value} role="tab" aria-selected={filter === option.value} className={filter === option.value ? "active" : undefined} onClick={() => setFilter(option.value)}>
        {option.label} <span>{counts[option.value]}</span>
      </button>)}
    </div>
    {error && <p className="save-message error">{error}</p>}
    {!visible.length ? <p className="prayer-empty">{loading ? "Carregando pedidos…" : filter === "new" ? "Nenhum pedido novo por enquanto." : "Nenhum pedido nesta lista."}</p> :
      <ul className="prayer-list">
        {visible.map(prayer => {
          const link = prayer.contact ? contactLink(prayer.contact) : null;
          const working = busy === prayer.id;
          return <li key={prayer.id} className={`prayer-item status-${prayer.status}`}>
            <div className="prayer-item-head">
              <div><strong>{prayer.name || "Anônimo"}</strong><time dateTime={prayer.createdAt}>{dateFormat.format(new Date(prayer.createdAt))}</time></div>
              <span className={`status-badge ${prayer.status === "new" ? "on" : ""}`}>{prayerStatusLabels[prayer.status]}</span>
            </div>
            <p className="prayer-text">{prayer.request}</p>
            {prayer.contact && <p className="prayer-contact">Contato: {link ? <a href={link} target="_blank" rel="noreferrer"><MessageCircle /> {prayer.contact}</a> : prayer.contact}</p>}
            <div className="prayer-actions">
              {prayer.status === "new" && <button className="icon-text" disabled={working} onClick={() => act(prayer.id, () => onStatus(prayer.id, "praying"))}><HandHeart /> Estou orando</button>}
              {prayer.status !== "done" && <button className="icon-text" disabled={working} onClick={() => act(prayer.id, () => onStatus(prayer.id, "done"))}><Check /> Concluir</button>}
              {prayer.status === "done" && <button className="icon-text" disabled={working} onClick={() => act(prayer.id, () => onStatus(prayer.id, "praying"))}><RotateCcw /> Reabrir</button>}
              <button className="icon-text remove-image" disabled={working} onClick={() => { if (window.confirm("Excluir este pedido de oração? Não é possível desfazer.")) act(prayer.id, () => onDelete(prayer.id)); }}><Trash2 /> Excluir</button>
              {working && <LoaderCircle className="spin" />}
            </div>
          </li>;
        })}
      </ul>}
  </section>;
}
