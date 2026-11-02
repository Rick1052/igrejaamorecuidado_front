"use client";

import { Plus } from "lucide-react";
import type { ContentItem, Section, SectionTheme, SiteData } from "@/lib/types";
import { DeleteButton, EditorItem, Field, ImageField, imageSpecs, makeId, sectionKindLabels, Select, Switch, TextArea, titleHelp, type UploadImage } from "./fields";
import { LinkButtonsEditor } from "./link-fields";
import { SortableList } from "./sortable-list";

const themeOptions: { value: SectionTheme; label: string }[] = [
  { value: "light", label: "Fundo branco" }, { value: "soft", label: "Fundo cinza claro" }, { value: "dark", label: "Fundo preto" }
];

// Seções cujo conteúdo principal é editado em outro card do admin.
const dataNotes: Partial<Record<Section["kind"], { text: string; href: string }>> = {
  schedule: { text: "Os dias e horários são editados em Agenda de cultos.", href: "#cultos" },
  cells: { text: "As células do mapa são editadas em Células no mapa.", href: "#celulas-admin" },
  sermons: { text: "Os vídeos vêm do YouTube; a lista reserva fica em Ministrações.", href: "#mensagens-admin" },
  faceToFace: { text: "Os encontros (datas, inscrições e cards) ficam em Face a Face.", href: "#face-a-face-admin" },
  giving: { text: "A chave PIX e a conta ficam em Ofertas. A seção só aparece com PIX ou conta preenchidos.", href: "#ofertas-admin" },
  instagram: { text: "As publicações vêm do Instagram automaticamente.", href: "#links" },
  visit: { text: "O endereço vem de Links e contato.", href: "#links" }
};

export function newContentSection(): Section {
  return { id: makeId("secao"), kind: "content", enabled: true, eyebrow: "", title: "Nova seção", text: "", quote: "", image: "", theme: "light", buttons: [], items: [] };
}

function plainTitle(section: Section) {
  return section.title.replace(/\*/g, "").replace(/\n/g, " ").trim();
}

function ItemsEditor({ items, onChange }: { items: ContentItem[]; onChange: (items: ContentItem[]) => void }) {
  const update = (id: string, patch: Partial<ContentItem>) => onChange(items.map(item => item.id === id ? { ...item, ...patch } : item));
  return <div className="buttons-editor wide">
    <div className="buttons-editor-head"><strong>Valores (cards abaixo do texto)</strong><button type="button" className="icon-text" onClick={() => onChange([...items, { id: makeId("valor"), title: "Novo valor", text: "" }])}><Plus /> Adicionar</button></div>
    <SortableList items={items} onChange={onChange} itemLabel={item => item.title} renderItem={item => <div className="button-row">
      <Field label="Título" value={item.title} onChange={title => update(item.id, { title })} />
      <Field label="Texto" value={item.text} onChange={text => update(item.id, { text })} />
      <DeleteButton label={`Excluir ${item.title}`} confirmText={`Excluir "${item.title}"?`} onConfirm={() => onChange(items.filter(candidate => candidate.id !== item.id))} />
    </div>} />
  </div>;
}

function SectionFields({ section, update, data, upload }: { section: Section; update: (patch: Partial<Section>) => void; data: SiteData; upload: UploadImage }) {
  const note = dataNotes[section.kind];
  if (section.kind === "marquee") return <div className="form-grid">
    <Field wide label="Frase da primeira linha" value={section.title} onChange={title => update({ title })} help="Use *asteriscos* para destacar em itálico." />
    <Field wide label="Frase da segunda linha (contornada)" value={section.text} onChange={text => update({ text })} />
  </div>;
  return <div className="form-grid">
    {note && <p className="admin-help wide">{note.text} <a href={note.href}>Ir para lá</a></p>}
    <Field label="Chamada (texto pequeno acima do título)" value={section.eyebrow} onChange={eyebrow => update({ eyebrow })} />
    {section.kind === "content" && <Select label="Fundo" value={section.theme} options={themeOptions} onChange={theme => update({ theme })} />}
    <TextArea label="Título" value={section.title} onChange={title => update({ title })} rows={2} help={titleHelp} />
    {!["schedule", "sermons", "instagram"].includes(section.kind) && <TextArea label="Texto" value={section.text} onChange={text => update({ text })} rows={4} help="Deixe uma linha em branco para começar um novo parágrafo." />}
    {section.kind === "visit" && <TextArea label="Frase em destaque (quadro ao lado)" value={section.quote} onChange={quote => update({ quote })} rows={3} help={titleHelp} />}
    {section.kind === "content" && <ImageField label="Imagem (opcional)" spec={imageSpecs.contentImage} upload={upload} value={section.image} onChange={image => update({ image })} emptyNote="Sem imagem: o texto ocupa a largura da seção." />}
    {section.kind === "about" && <ItemsEditor items={section.items} onChange={items => update({ items })} />}
    {["about", "sermons", "visit", "content"].includes(section.kind) && <LinkButtonsEditor buttons={section.buttons} onChange={buttons => update({ buttons })} data={data} />}
  </div>;
}

export function SectionsList({ sections, onChange, data, upload, emptyText }: { sections: Section[]; onChange: (sections: Section[]) => void; data: SiteData; upload: UploadImage; emptyText?: string }) {
  const update = (id: string, patch: Partial<Section>) => onChange(sections.map(section => section.id === id ? { ...section, ...patch } : section));
  return <SortableList items={sections} onChange={onChange} emptyText={emptyText} itemLabel={section => plainTitle(section) || sectionKindLabels[section.kind]} renderItem={section => <EditorItem
    title={section.kind === "content" ? plainTitle(section) || "Seção livre" : sectionKindLabels[section.kind]}
    subtitle={section.kind === "content" ? "Seção livre" : plainTitle(section)}
    badges={<span className={`status-badge ${section.enabled ? "on" : ""}`}>{section.enabled ? "Visível" : "Oculta"}</span>}
    actions={<>
      <Switch label={`Mostrar seção ${sectionKindLabels[section.kind]}`} checked={section.enabled} onChange={enabled => update(section.id, { enabled })} />
      {section.kind === "content" && <DeleteButton label="Excluir seção" confirmText={`Excluir a seção "${plainTitle(section) || "Seção livre"}"?`} onConfirm={() => onChange(sections.filter(item => item.id !== section.id))} />}
    </>}
  >
    <SectionFields section={section} update={patch => update(section.id, patch)} data={data} upload={upload} />
  </EditorItem>} />;
}

export function HomeSectionsEditor({ data, setData, upload }: { data: SiteData; setData: (data: SiteData) => void; upload: UploadImage }) {
  return <section className="admin-card" id="secoes">
    <div className="admin-card-title"><div><span>02</span><h2>Seções da página inicial</h2></div><button className="icon-text" onClick={() => setData({ ...data, sections: [...data.sections, newContentSection()] })}><Plus /> Adicionar seção</button></div>
    <p className="admin-help">Arraste para definir a ordem das seções abaixo dos banners. Use a chave para esconder uma seção sem perder o conteúdo. Seções livres aceitam título, texto, imagem e botões com links internos ou externos.</p>
    <SectionsList sections={data.sections} onChange={sections => setData({ ...data, sections })} data={data} upload={upload} />
  </section>;
}
