import { ArrowRight, Clock3, HeartHandshake, Instagram, MapPin, UsersRound, Youtube } from "lucide-react";
import { getSiteData } from "@/lib/api";
import { Logo, LogoSymbol } from "@/components/logo";
import { ScrollEffects } from "@/components/scroll-effects";
import { BrandMarquee } from "@/components/brand-marquee";
import { SplitWords } from "@/components/split-words";
import { SiteHeader } from "@/components/site-header";
import { HeroSlider } from "@/components/hero-slider";
import { CellMap } from "@/components/cell-map";
import { SermonGallery } from "@/components/sermon-gallery";
import { InstagramFeed } from "@/components/instagram-feed";
import { FaceToFaceSection } from "@/components/face-to-face-section";

export default async function Home() {
  const data = await getSiteData();
  return <main>
    <ScrollEffects />
    {data.announcement.enabled && <a className="announcement" href={data.announcement.url} target="_blank" rel="noreferrer">
      <span className="announcement-kicker">{data.announcement.eyebrow}</span>
      <span>{data.announcement.title}</span>
      <strong>{data.announcement.date} <ArrowRight size={16} /></strong>
    </a>}

    <section className="hero" id="inicio" data-collapse>
      <HeroSlider data={data} />
      <SiteHeader />
    </section>

    <section className="intro section wrap" id="sobre">
      <p className="eyebrow dark">BEM-VINDO À IAC</p>
      <div className="intro-grid">
        <h2 className="split-title"><SplitWords text="Você não precisa" /><br /><SplitWords text="caminhar" offset={3} /> <em><SplitWords text="sozinho." offset={4} /></em></h2>
        <div><p>Somos uma família que acredita no poder do amor, da presença e do cuidado. Aqui, cada história importa e todo mundo tem lugar à mesa.</p><a className="text-link" href={data.links.instagramChurch} target="_blank" rel="noreferrer">Conheça nossa comunidade <ArrowRight /></a></div>
      </div>
      <div className="values">
        <article><HeartHandshake /><span>01</span><h3>Amar</h3><p>Jesus no centro e pessoas como prioridade.</p></article>
        <article><UsersRound /><span>02</span><h3>Cuidar</h3><p>Relacionamentos que acolhem e fortalecem.</p></article>
        <article><ArrowRight /><span>03</span><h3>Enviar</h3><p>Uma fé viva que transforma onde chega.</p></article>
      </div>
    </section>

    <BrandMarquee />

    <section className="schedule section" id="agenda" data-expand>
      <div className="wrap"><div className="section-heading"><div><p className="eyebrow">NOS ENCONTRAMOS TODA SEMANA</p><h2>Sempre tem um<br /><em>lugar para você.</em></h2></div><Clock3 /></div>
      <div className="service-list">{data.services.map((service, index) => <article key={`${service.day}-${index}`}><span className="service-number">0{index + 1}</span><div><p>{service.day}</p><h3>{service.title}</h3></div><strong>{service.time}</strong><span>{service.note}</span></article>)}</div></div>
    </section>

    <section className="cells section wrap" id="celulas">
      <CellMap cells={data.cells} />
      <div className="cells-copy"><p className="eyebrow dark">VIDA EM COMUNIDADE</p><h2>Igreja acontece<br />também <em>nas casas.</em></h2><p>Células são ambientes para criar raízes, compartilhar a vida e crescer na fé. Selecione uma inicial no mapa para ver os líderes, o endereço e como chegar.</p><a className="button button-dark" href="#mapa-celulas">Explorar {data.cells.length} células <MapPin /></a></div>
    </section>

    <section className="sermons section" id="mensagens"><div className="wrap">
      <div className="section-heading sermons-heading"><div><p className="eyebrow dark">MENSAGENS QUE EDIFICAM</p><h2>Continue crescendo<br /><em>onde estiver.</em></h2></div><a className="text-link" href={data.links.youtube} target="_blank" rel="noreferrer">Ir para o YouTube <Youtube /></a></div>
      <SermonGallery sermons={data.sermons} />
    </div></section>

    <FaceToFaceSection data={data.faceToFace} />

    <section className="visit section" id="visita" data-expand><div className="visit-symbol" data-parallax="0.18" aria-hidden="true"><LogoSymbol /></div><div className="wrap visit-grid">
      <div><p className="eyebrow">SUA PRIMEIRA VEZ?</p><h2>Chegue como está.<br /><em>A casa é sua.</em></h2><p>Queremos deixar sua primeira visita leve e especial. Se tiver qualquer dúvida, fale com a nossa equipe.</p><div className="visit-actions"><a className="button button-warm" href={`https://wa.me/${data.contact.whatsapp}`} target="_blank" rel="noreferrer">Falar com a equipe <ArrowRight /></a><a className="visit-address" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.contact.address)}`} target="_blank" rel="noreferrer"><MapPin />{data.contact.address}</a></div></div>
      <div className="visit-quote"><span>“</span><p>Onde há amor,<br />há um lugar<br />para recomeçar.</p></div>
    </div></section>

    <InstagramFeed posts={data.instagramPosts} profileUrl={data.links.instagramChurch} />

    <footer><div className="wrap footer-grid"><div><Logo light /><p>Gente cuidando de gente.</p></div><div><h3>Conecte-se</h3><a href={data.links.instagramChurch}>Instagram da igreja</a><a href={data.links.instagramPastor}>Pr. Erik Farley</a><a href={data.links.youtube}>YouTube</a></div><div><h3>Explore</h3><a href="#celulas">Encontre uma célula</a><a href={data.links.conference}>IAC Conference</a><a href={data.links.linktree}>Todos os links</a></div><div className="social"><a href={data.links.instagramChurch} aria-label="Instagram"><Instagram /></a><a href={data.links.youtube} aria-label="YouTube"><Youtube /></a></div></div><div className="wrap footer-bottom"><span>© 2026 IAC Guarapuava</span><a href="/admin">Área administrativa</a></div></footer>
  </main>;
}
