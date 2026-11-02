"use client";

import { Plus } from "lucide-react";
import type { LinkButton, SiteData } from "@/lib/types";
import { DeleteButton, Field, makeId, sectionKindLabels } from "./fields";
import { SortableList } from "./sortable-list";

const EXTERNAL = "__external__";

// Destinos internos oferecidos na lista: seções da página inicial e páginas criadas.
export function linkTargets(data: SiteData) {
  return [
    ...data.sections.map(section => ({ url: `#${section.id}`, label: `Início › ${section.kind === "content" ? section.title.replace(/\*/g, "").split("\n")[0] || "Seção livre" : sectionKindLabels[section.kind]}` })),
    ...data.pages.map(page => ({ url: `/${page.slug}`, label: `Página › ${page.title || page.slug}` }))
  ];
}

export function LinkTargetField({ label = "Destino", value, onChange, data, wide = false }: { label?: string; value: string; onChange: (value: string) => void; data: SiteData; wide?: boolean }) {
  const targets = linkTargets(data);
  const isInternal = targets.some(target => target.url === value);
  return <div className={`link-target ${wide ? "wide" : ""}`}>
    <label>{label}
      <select value={isInternal ? value : EXTERNAL} onChange={event => onChange(event.target.value === EXTERNAL ? (isInternal ? "https://" : value) : event.target.value)}>
        <optgroup label="No site">{targets.map(target => <option key={target.url} value={target.url}>{target.label}</option>)}</optgroup>
        <option value={EXTERNAL}>Link externo (outro site, WhatsApp, formulário...)</option>
      </select>
    </label>
    {!isInternal && <label>Endereço do link externo<input value={value} onChange={event => onChange(event.target.value.trim())} placeholder="https://" />
      {value && !/^(https?:\/\/\S+|mailto:\S+|tel:\S+)$/.test(value) && <small className="field-error">Comece com https:// (ou mailto: / tel:).</small>}
    </label>}
  </div>;
}

export function LinkButtonsEditor({ buttons, onChange, data, max, title = "Botões" }: { buttons: LinkButton[]; onChange: (buttons: LinkButton[]) => void; data: SiteData; max?: number; title?: string }) {
  const update = (id: string, patch: Partial<LinkButton>) => onChange(buttons.map(button => button.id === id ? { ...button, ...patch } : button));
  const canAdd = max === undefined || buttons.length < max;
  return <div className="buttons-editor wide">
    <div className="buttons-editor-head"><strong>{title}</strong>{canAdd && <button type="button" className="icon-text" onClick={() => onChange([...buttons, { id: makeId("botao"), label: "Saiba mais", url: data.pages[0] ? `/${data.pages[0].slug}` : "#visita" }])}><Plus /> Adicionar botão</button>}</div>
    <SortableList items={buttons} onChange={onChange} itemLabel={button => button.label} emptyText="Nenhum botão." renderItem={button => <div className="button-row">
      <Field label="Texto do botão" value={button.label} onChange={label => update(button.id, { label })} />
      <LinkTargetField value={button.url} onChange={url => update(button.id, { url })} data={data} />
      <DeleteButton label={`Excluir botão ${button.label}`} confirmText={`Excluir o botão "${button.label}"?`} onConfirm={() => onChange(buttons.filter(item => item.id !== button.id))} />
    </div>} />
  </div>;
}
