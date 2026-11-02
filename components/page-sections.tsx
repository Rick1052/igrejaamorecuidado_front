import { ArrowRight, ArrowUpRight, Clock3, HeartHandshake, MapPin, UsersRound } from "lucide-react";
import { isExternalUrl, isSectionVisible, resolveHref } from "@/lib/site-data";
import type { LinkButton, Section, SiteData } from "@/lib/types";
import { BrandMarquee } from "./brand-marquee";
import { CellMap } from "./cell-map";
import { FaceToFaceSection } from "./face-to-face-section";
import { GivingSection } from "./giving-section";
import { InstagramFeed } from "./instagram-feed";
import { LogoSymbol } from "./logo";
import { Paragraphs, RichTitle } from "./rich-text";
import { SermonGallery } from "./sermon-gallery";

const valueIcons = [HeartHandshake, UsersRound, ArrowRight];

function SectionLink({ button, onHome, className }: { button: LinkButton; onHome: boolean; className: string }) {
  const external = isExternalUrl(button.url);
  return <a className={className} href={resolveHref(button.url, onHome)} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
    {button.label} {external ? <ArrowUpRight /> : <ArrowRight />}
  </a>;
}

function Eyebrow({ text, dark = true }: { text: string; dark?: boolean }) {
  return text ? <p className={`eyebrow ${dark ? "dark" : ""}`}>{text}</p> : null;
}

// Seção livre criada no admin: título, texto, imagem opcional e botões (links internos ou externos).
export function ContentSection({ section, onHome }: { section: Section; onHome: boolean }) {
  const dark = section.theme === "dark";
  return <section className={`content-section section theme-${section.theme} ${section.image ? "has-image" : ""}`} id={section.id}>
    <div className="wrap content-grid">
      <div className="content-copy">
        <Eyebrow text={section.eyebrow} dark={!dark} />
        {section.title && <h2><RichTitle text={section.title} /></h2>}
        <Paragraphs text={section.text} />
        {section.buttons.length > 0 && <div className="content-actions">
          {section.buttons.map((button, index) => <SectionLink key={button.id} button={button} onHome={onHome} className={index === 0 ? `button ${dark ? "button-warm" : "button-dark"}` : "text-link"} />)}
        </div>}
      </div>
      {section.image && <div className="content-image"><img src={section.image} alt="" loading="lazy" /></div>}
    </div>
  </section>;
}

export function PageSection({ section, data, onHome = true }: { section: Section; data: SiteData; onHome?: boolean }) {
  if (!isSectionVisible(section, data)) return null;
  switch (section.kind) {
    case "about":
      return <section className="intro section wrap" id={section.id}>
        <Eyebrow text={section.eyebrow} />
        <div className="intro-grid">
          <h2 className="split-title"><RichTitle text={section.title} split /></h2>
          <div><Paragraphs text={section.text} />{section.buttons.map(button => <SectionLink key={button.id} button={button} onHome={onHome} className="text-link" />)}</div>
        </div>
        {section.items.length > 0 && <div className="values">
          {section.items.map((item, index) => {
            const Icon = valueIcons[index % valueIcons.length];
            return <article key={item.id}><Icon /><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.text}</p></article>;
          })}
        </div>}
      </section>;
    case "marquee":
      return <BrandMarquee section={section} />;
    case "schedule":
      return <section className="schedule section" id={section.id} data-expand>
        <div className="wrap"><div className="section-heading"><div><Eyebrow text={section.eyebrow} dark={false} /><h2><RichTitle text={section.title} /></h2></div><Clock3 /></div>
          <div className="service-list">{data.services.map((service, index) => <article key={`${service.day}-${index}`}><span className="service-number">0{index + 1}</span><div><p>{service.day}</p><h3>{service.title}</h3></div><strong>{service.time}</strong><span>{service.note}</span></article>)}</div></div>
      </section>;
    case "cells":
      return <section className="cells section wrap" id={section.id}>
        <CellMap cells={data.cells} />
        <div className="cells-copy"><Eyebrow text={section.eyebrow} /><h2><RichTitle text={section.title} /></h2><Paragraphs text={section.text} /><a className="button button-dark" href="#mapa-celulas">Explorar {data.cells.length} células <MapPin /></a></div>
      </section>;
    case "sermons":
      return <section className="sermons section" id={section.id}><div className="wrap">
        <div className="section-heading sermons-heading"><div><Eyebrow text={section.eyebrow} /><h2><RichTitle text={section.title} /></h2></div>{section.buttons.map(button => <SectionLink key={button.id} button={button} onHome={onHome} className="text-link" />)}</div>
        <SermonGallery sermons={data.sermons} />
      </div></section>;
    case "faceToFace":
      return <FaceToFaceSection section={section} events={data.faceToFace} />;
    case "visit":
      return <section className="visit section" id={section.id} data-expand><div className="visit-symbol" data-parallax="0.18" aria-hidden="true"><LogoSymbol /></div><div className="wrap visit-grid">
        <div><Eyebrow text={section.eyebrow} dark={false} /><h2><RichTitle text={section.title} /></h2><Paragraphs text={section.text} />
          <div className="visit-actions">
            {section.buttons.map(button => <SectionLink key={button.id} button={button} onHome={onHome} className="button button-warm" />)}
            <a className="visit-address" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.contact.address)}`} target="_blank" rel="noreferrer"><MapPin />{data.contact.address}</a>
          </div>
        </div>
        {section.quote && <div className="visit-quote"><span>“</span><p><RichTitle text={section.quote} /></p></div>}
      </div></section>;
    case "giving":
      return <GivingSection section={section} data={data.giving} />;
    case "instagram":
      return <InstagramFeed section={section} posts={data.instagramPosts} profileUrl={data.links.instagramChurch} />;
    case "content":
      return <ContentSection section={section} onHome={onHome} />;
  }
}
