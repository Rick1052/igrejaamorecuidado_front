"use client";

import { ChevronDown, ImageUp, LoaderCircle, Trash2, TriangleAlert } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { SectionKind } from "@/lib/types";

export type ImageSpec = { width: number; height: number; hint: string };
export type UploadImage = (file: File) => Promise<string>;

// Dimensões calculadas a partir de como cada imagem é recortada no site (ver hero-slider, page-sections e globals.css).
export const imageSpecs = {
  artDesktop: { width: 1920, height: 1080, hint: "Aparece inteira sobre um fundo desfocado da própria arte. Evite textos colados nas bordas." },
  artMobile: { width: 1080, height: 1920, hint: "Arte vertical exibida inteira no celular. O botão fica logo abaixo da arte." },
  textDesktop: { width: 1920, height: 1080, hint: "Foto de fundo. O título fica sobre o lado esquerdo, que recebe uma sombra escura." },
  textMobile: { width: 1080, height: 1920, hint: "Fundo vertical do celular, com o título por cima. Prefira imagens com áreas escuras." },
  faceCard: { width: 1080, height: 1350, hint: "Card da seção Face a Face, exibido inteiro no formato retrato 4:5." },
  pixQrCode: { width: 1000, height: 1000, hint: "QR Code gerado no app do banco. Exibido ao lado da chave PIX; deixe uma margem branca em volta para a leitura." },
  contentImage: { width: 1600, height: 1200, hint: "Exibida inteira ao lado do texto no computador e abaixo dele no celular." }
} satisfies Record<string, ImageSpec>;
const maxImageBytes = 8 * 1024 * 1024;

export const sectionKindLabels: Record<SectionKind, string> = {
  about: "Quem somos", marquee: "Faixa de frases", schedule: "Agenda de cultos", cells: "Células", sermons: "Mensagens",
  faceToFace: "Face a Face", visit: "Visite-nos", giving: "Ofertas e contribuições", instagram: "Instagram", content: "Seção livre"
};

export function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function slugify(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

export function Field({ label, value, onChange, type = "text", wide = false, placeholder, help }: { label: string; value: string; onChange: (value: string) => void; type?: string; wide?: boolean; placeholder?: string; help?: string }) {
  return <label className={wide ? "wide" : ""}>{label}<input type={type} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} />{help && <small className="field-help">{help}</small>}</label>;
}

export function TextArea({ label, value, onChange, rows = 3, help, wide = true }: { label: string; value: string; onChange: (value: string) => void; rows?: number; help?: string; wide?: boolean }) {
  return <label className={wide ? "wide" : ""}>{label}<textarea rows={rows} value={value} onChange={event => onChange(event.target.value)} />{help && <small className="field-help">{help}</small>}</label>;
}

export function Select<T extends string>({ label, value, options, onChange, wide = false }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void; wide?: boolean }) {
  return <label className={wide ? "wide" : ""}>{label}<select value={value} onChange={event => onChange(event.target.value as T)}>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return <label className="switch" title={label}><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} aria-label={label} /><span /></label>;
}

export const titleHelp = "Cada linha vira uma linha do título. Use *asteriscos* para destacar em itálico.";

// Item recolhível das listas do admin: o cabeçalho mostra nome, situação e ações; os campos aparecem ao expandir.
export function EditorItem({ title, subtitle, badges, actions, children, defaultOpen = false }: { title: string; subtitle?: string; badges?: ReactNode; actions?: ReactNode; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return <div className={`editor-item ${open ? "is-open" : ""}`}>
    <div className="editor-item-head">
      <button type="button" className="editor-item-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        <ChevronDown />
        <span><strong>{title || "Sem nome"}</strong>{subtitle && <small>{subtitle}</small>}</span>
      </button>
      {badges}
      <div className="editor-item-actions">{actions}</div>
    </div>
    {open && <div className="editor-item-body">{children}</div>}
  </div>;
}

export function DeleteButton({ label, confirmText, onConfirm }: { label: string; confirmText: string; onConfirm: () => void }) {
  return <button type="button" className="trash" aria-label={label} title={label} onClick={() => { if (window.confirm(confirmText)) onConfirm(); }}><Trash2 /></button>;
}

export function ImageField({ label, value, onChange, spec, upload, emptyNote = "Sem imagem: este banner não aparece no site." }: { label: string; value: string; onChange: (value: string) => void; spec: ImageSpec; upload: UploadImage; emptyNote?: string }) {
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
