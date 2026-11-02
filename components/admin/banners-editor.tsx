"use client";

import { Plus } from "lucide-react";
import type { Banner, SiteData } from "@/lib/types";
import { DeleteButton, EditorItem, Field, ImageField, imageSpecs, makeId, Select, Switch, TextArea, type UploadImage } from "./fields";
import { LinkButtonsEditor } from "./link-fields";
import { SortableList } from "./sortable-list";

const layoutOptions = [
  { value: "art" as const, label: "Arte inteira (imagem pronta, com texto já na arte)" },
  { value: "text" as const, label: "Foto com texto (título e botões por cima da foto)" }
];

function newBanner(): Banner {
  return { id: makeId("banner"), enabled: false, name: "Novo banner", layout: "art", desktopImage: "", mobileImage: "", eyebrow: "", title: "", description: "", buttons: [] };
}

export function BannersEditor({ data, setData, upload }: { data: SiteData; setData: (data: SiteData) => void; upload: UploadImage }) {
  const setBanners = (banners: Banner[]) => setData({ ...data, banners });
  const update = (id: string, patch: Partial<Banner>) => setBanners(data.banners.map(banner => banner.id === id ? { ...banner, ...patch } : banner));
  const visibleCount = data.banners.filter(banner => banner.enabled).length;

  return <section className="admin-card" id="banners">
    <div className="admin-card-title"><div><span>01</span><h2>Banners do topo</h2></div><button className="icon-text" onClick={() => setBanners([...data.banners, newBanner()])}><Plus /> Adicionar banner</button></div>
    <p className="admin-help">Os banners ligados aparecem no carrossel do topo, nesta ordem. Arraste pela alça (ou use as setas) para mudar a posição. Banners que não serão mais usados podem ser excluídos; as imagens deles são apagadas do servidor ao publicar.</p>
    {visibleCount === 0 && <p className="image-warning">Nenhum banner ligado: o site mostra a apresentação padrão da igreja.</p>}
    <SortableList items={data.banners} onChange={setBanners} itemLabel={banner => banner.name} emptyText="Nenhum banner cadastrado." renderItem={(banner, index) => {
      const missingImage = !banner.desktopImage && !banner.mobileImage && banner.layout === "art";
      return <EditorItem
        title={banner.name}
        subtitle={`${index + 1}º no carrossel · ${banner.layout === "art" ? "Arte inteira" : "Foto com texto"}`}
        badges={<span className={`status-badge ${banner.enabled && !missingImage ? "on" : ""}`}>{banner.enabled ? missingImage ? "Sem imagem" : "No ar" : "Desligado"}</span>}
        actions={<>
          <Switch label={`Mostrar ${banner.name} no site`} checked={banner.enabled} onChange={enabled => update(banner.id, { enabled })} />
          <DeleteButton label={`Excluir banner ${banner.name}`} confirmText={`Excluir o banner "${banner.name}"? As imagens dele são apagadas do servidor quando você publicar as alterações.`} onConfirm={() => setBanners(data.banners.filter(item => item.id !== banner.id))} />
        </>}
      >
        <div className="form-grid">
          <Field label="Nome (só aparece no admin)" value={banner.name} onChange={name => update(banner.id, { name })} />
          <Select label="Tipo de banner" value={banner.layout} options={layoutOptions} onChange={layout => update(banner.id, { layout })} />
          <ImageField label="Imagem desktop" spec={banner.layout === "art" ? imageSpecs.artDesktop : imageSpecs.textDesktop} upload={upload} value={banner.desktopImage} onChange={desktopImage => update(banner.id, { desktopImage })} emptyNote={banner.layout === "art" ? "Sem imagem desktop: o computador usa a imagem mobile." : "Sem imagem: usa a foto padrão da igreja."} />
          <ImageField label="Imagem mobile" spec={banner.layout === "art" ? imageSpecs.artMobile : imageSpecs.textMobile} upload={upload} value={banner.mobileImage} onChange={mobileImage => update(banner.id, { mobileImage })} emptyNote="Sem imagem mobile: o celular usa a imagem desktop." />
          {banner.layout === "text" ? <>
            <Field label="Chamada (texto pequeno acima do título)" value={banner.eyebrow} onChange={eyebrow => update(banner.id, { eyebrow })} />
            <Field label="Título" value={banner.title} onChange={title => update(banner.id, { title })} />
            <TextArea label="Texto" value={banner.description} onChange={description => update(banner.id, { description })} rows={2} />
          </> : <>
            <Field label="Data ou chamada ao lado do botão" value={banner.description} onChange={description => update(banner.id, { description })} placeholder="Ex.: 10 a 13 de setembro" />
            <Field label="Descrição da arte (acessibilidade)" value={banner.title} onChange={title => update(banner.id, { title })} help="Lida por leitores de tela no lugar da imagem." />
          </>}
          <LinkButtonsEditor buttons={banner.buttons} onChange={buttons => update(banner.id, { buttons })} data={data} max={2} title="Botões (até 2)" />
        </div>
      </EditorItem>;
    }} />
  </section>;
}
