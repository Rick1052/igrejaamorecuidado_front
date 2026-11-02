"use client";

import { Plus } from "lucide-react";
import type { MenuItem, SiteData } from "@/lib/types";
import { DeleteButton, Field, makeId } from "./fields";
import { LinkTargetField } from "./link-fields";
import { SortableList } from "./sortable-list";

export function MenuEditor({ data, setData }: { data: SiteData; setData: (data: SiteData) => void }) {
  const setMenu = (menu: MenuItem[]) => setData({ ...data, menu });
  const update = (id: string, patch: Partial<MenuItem>) => setMenu(data.menu.map(item => item.id === id ? { ...item, ...patch } : item));
  return <section className="admin-card" id="menu">
    <div className="admin-card-title"><div><span>04</span><h2>Menu</h2></div><div className="admin-card-actions">
      <button className="icon-text" onClick={() => setMenu([...data.menu, { id: makeId("menu"), label: "Novo link", url: "https://", highlight: false }])}><Plus /> Link externo</button>
      <button className="icon-text" onClick={() => setMenu([...data.menu, { id: makeId("menu"), label: "Novo item", url: "#sobre", highlight: false }])}><Plus /> Item do site</button>
    </div></div>
    <p className="admin-help">Itens do menu do topo e do rodapé, nesta ordem. Links externos abrem em uma nova aba. Itens que apontam para uma seção oculta ou página não publicada somem do site automaticamente.</p>
    <SortableList items={data.menu} onChange={setMenu} itemLabel={item => item.label} emptyText="O menu está vazio." renderItem={item => <div className="menu-row">
      <Field label="Texto" value={item.label} onChange={label => update(item.id, { label })} />
      <LinkTargetField value={item.url} onChange={url => update(item.id, { url })} data={data} />
      <label className="checkbox-label"><input type="checkbox" checked={item.highlight} onChange={event => update(item.id, { highlight: event.target.checked })} /> Destacar como botão</label>
      <DeleteButton label={`Excluir ${item.label} do menu`} confirmText={`Tirar "${item.label}" do menu?`} onConfirm={() => setMenu(data.menu.filter(candidate => candidate.id !== item.id))} />
    </div>} />
  </section>;
}
