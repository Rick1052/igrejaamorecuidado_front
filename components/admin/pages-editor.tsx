"use client";

import { ExternalLink, Plus } from "lucide-react";
import type { Page, SiteData } from "@/lib/types";
import { DeleteButton, EditorItem, Field, makeId, slugify, Switch, TextArea, type UploadImage } from "./fields";
import { newContentSection, SectionsList } from "./sections-editor";

const reservedSlugs = ["admin", "api", "uploads", "_next"];

function uniqueSlug(base: string, pages: Page[], ignoreId?: string) {
  const root = slugify(base) || "pagina";
  let slug = reservedSlugs.includes(root) ? `${root}-1` : root;
  for (let index = 2; pages.some(page => page.slug === slug && page.id !== ignoreId); index++) slug = `${root}-${index}`;
  return slug;
}

export function PagesEditor({ data, setData, upload }: { data: SiteData; setData: (data: SiteData) => void; upload: UploadImage }) {
  // Cada página nova entra no menu; ao trocar o endereço, os links do menu e dos botões acompanham.
  function addPage() {
    const title = "Nova página";
    const page: Page = { id: makeId("pagina"), slug: uniqueSlug(title, data.pages), title, description: "", enabled: false, sections: [newContentSection()] };
    const highlightIndex = data.menu.findIndex(item => item.highlight);
    const menuItem = { id: makeId("menu"), label: title, url: `/${page.slug}`, highlight: false };
    const menu = highlightIndex >= 0 ? [...data.menu.slice(0, highlightIndex), menuItem, ...data.menu.slice(highlightIndex)] : [...data.menu, menuItem];
    setData({ ...data, pages: [...data.pages, page], menu });
  }

  function updatePage(id: string, patch: Partial<Page>) {
    const current = data.pages.find(page => page.id === id);
    if (!current) return;
    const next = { ...current, ...patch };
    const oldUrl = `/${current.slug}`;
    const newUrl = `/${next.slug}`;
    const relink = <T extends { url: string }>(link: T) => link.url === oldUrl ? { ...link, url: newUrl } : link;
    setData({
      ...data,
      pages: data.pages.map(page => page.id === id ? { ...next, sections: next.sections.map(section => ({ ...section, buttons: section.buttons.map(relink) })) } : { ...page, sections: page.sections.map(section => ({ ...section, buttons: section.buttons.map(relink) })) }),
      // O texto do menu acompanha o título enquanto ainda for igual ao título antigo.
      menu: data.menu.map(item => item.url === oldUrl ? { ...item, url: newUrl, label: item.label === current.title && patch.title !== undefined ? next.title : item.label } : item),
      banners: data.banners.map(banner => ({ ...banner, buttons: banner.buttons.map(relink) })),
      sections: data.sections.map(section => ({ ...section, buttons: section.buttons.map(relink) }))
    });
  }

  function removePage(page: Page) {
    setData({ ...data, pages: data.pages.filter(item => item.id !== page.id), menu: data.menu.filter(item => item.url !== `/${page.slug}`) });
  }

  return <section className="admin-card" id="paginas">
    <div className="admin-card-title"><div><span>03</span><h2>Páginas</h2></div><button className="icon-text" onClick={addPage}><Plus /> Criar página</button></div>
    <p className="admin-help">Páginas novas ganham um endereço próprio (ex.: iacguarapuava.com.br/ministerios) e entram automaticamente no menu. Elas só aparecem no site depois de ligadas e publicadas.</p>
    {data.pages.length === 0 && <p className="sortable-empty">Nenhuma página criada ainda.</p>}
    <div className="pages-list">
      {data.pages.map(page => <EditorItem key={page.id} defaultOpen={page.title === "Nova página"}
        title={page.title}
        subtitle={`/${page.slug} · ${page.sections.length} ${page.sections.length === 1 ? "seção" : "seções"}`}
        badges={<span className={`status-badge ${page.enabled ? "on" : ""}`}>{page.enabled ? "Publicada" : "Rascunho"}</span>}
        actions={<>
          {page.enabled && <a className="icon-text" href={`/${page.slug}`} target="_blank" rel="noreferrer" title="Abrir a página publicada"><ExternalLink /></a>}
          <Switch label={`Publicar página ${page.title}`} checked={page.enabled} onChange={enabled => updatePage(page.id, { enabled })} />
          <DeleteButton label={`Excluir página ${page.title}`} confirmText={`Excluir a página "${page.title}"? Ela também sai do menu.`} onConfirm={() => removePage(page)} />
        </>}
      >
        <div className="form-grid">
          <Field label="Título da página" value={page.title} onChange={title => updatePage(page.id, { title, ...(page.slug === uniqueSlug(page.title, data.pages, page.id) ? { slug: uniqueSlug(title, data.pages, page.id) } : {}) })} />
          <Field label="Endereço" value={page.slug} onChange={slug => updatePage(page.id, { slug: slugify(slug) })} help={`O site abre em /${page.slug || "..."}. Só letras minúsculas, números e hífens.`} />
          <TextArea label="Texto de abertura (abaixo do título)" value={page.description} onChange={description => updatePage(page.id, { description })} rows={2} />
        </div>
        <div className="page-sections">
          <div className="buttons-editor-head"><strong>Seções desta página</strong><button type="button" className="icon-text" onClick={() => updatePage(page.id, { sections: [...page.sections, newContentSection()] })}><Plus /> Adicionar seção</button></div>
          <SectionsList sections={page.sections} onChange={sections => updatePage(page.id, { sections })} data={data} upload={upload} emptyText="Esta página ainda não tem seções." />
        </div>
      </EditorItem>)}
    </div>
  </section>;
}
