"use client";

import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { useEffect, useState } from "react";
import type { SiteData } from "@/lib/types";

export function HeroSlider({ data }: { data: SiteData }) {
  const hasConference = data.announcement.enabled;
  const hasFaceToFace = data.faceToFace.enabled;
  const slides = 1 + Number(hasConference) + Number(hasFaceToFace);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive(current => (current + 1) % slides), 8000);
    return () => window.clearInterval(timer);
  }, [slides]);

  const faceToFaceIndex = hasConference ? 1 : 0;
  const institutionalIndex = Number(hasConference) + Number(hasFaceToFace);
  const slideLabels = [
    ...(hasConference ? ["Mostrar IAC Conference"] : []),
    ...(hasFaceToFace ? ["Mostrar Face a Face com Deus"] : []),
    "Mostrar apresentação da igreja"
  ];
  const show = (index: number) => setActive(index);

  return <div className="hero-slider" aria-roledescription="carrossel" aria-label="Destaques da IAC">
    {hasConference && <article className={`hero-slide conference-slide ${active === 0 ? "is-active" : ""}`} aria-hidden={active !== 0}>
      <div className="conference-backdrop conference-backdrop-desktop" style={{ backgroundImage: `url(${data.announcement.image})` }} />
      <div className="conference-backdrop conference-backdrop-mobile" style={{ backgroundImage: `url(${data.announcement.mobileImage})` }} />
      {/* A tag picture mantém URLs externas editáveis e escolhe a arte vertical no celular. */}
      <picture className="conference-picture">
        <source media="(max-width: 600px)" srcSet={data.announcement.mobileImage} />
        <img className="conference-art" src={data.announcement.image} alt={`Banner ${data.announcement.eyebrow}: ${data.announcement.title}, ${data.announcement.date}`} />
      </picture>
      <div className="conference-action wrap">
        <div><span>{data.announcement.date}</span><strong>Guarapuava • PR</strong></div>
        <a className="button button-warm" href={data.announcement.url} target="_blank" rel="noreferrer">Garanta sua vaga <ArrowRight /></a>
      </div>
    </article>}

    {hasFaceToFace && <article className={`hero-slide face-hero-slide ${active === faceToFaceIndex ? "is-active" : ""}`} aria-hidden={active !== faceToFaceIndex}>
      <div className="face-hero-panels">
        {([data.faceToFace.men, data.faceToFace.women] as const).map(event => <div className="face-hero-panel" key={event.title}>
          <picture><source media="(max-width: 600px)" srcSet={event.mobileImage} /><img src={event.desktopImage} alt={`${event.title}, ${event.date}`} /></picture>
          <div className="face-hero-action"><span>{event.date}</span><a className="button" href={event.url} target="_blank" rel="noreferrer">Inscreva-se <ArrowRight /></a></div>
        </div>)}
      </div>
    </article>}

    <article className={`hero-slide institutional-slide ${active === institutionalIndex ? "is-active" : ""}`} aria-hidden={active !== institutionalIndex}>
      <picture className="institutional-picture">
        <source media="(max-width: 600px)" srcSet={data.hero.mobileImage} />
        <img src={data.hero.image} alt="Comunidade reunida em um momento de adoração" fetchPriority={!hasConference && !hasFaceToFace ? "high" : "auto"} />
      </picture>
      <div className="hero-shade" />
      <div className="hero-content wrap">
        <p className="eyebrow">{data.hero.eyebrow}</p>
        <h1>{data.hero.title}</h1>
        <p className="hero-lead">{data.hero.description}</p>
        <div className="hero-actions">
          <a className="button button-warm" href="#visita">{data.hero.primaryCta}<ArrowRight /></a>
          <a className="button button-ghost" href="#mensagens"><Play fill="currentColor" />{data.hero.secondaryCta}</a>
        </div>
      </div>
    </article>

    {slides > 1 && <div className="slider-controls wrap">
      <div className="slider-dots" role="tablist" aria-label="Selecionar destaque">
        {slideLabels.map((label, index) => <button key={label} className={active === index ? "active" : ""} onClick={() => show(index)} aria-label={label} aria-selected={active === index} role="tab" />)}
      </div>
      <div className="slider-arrows">
        <button onClick={() => show((active - 1 + slides) % slides)} aria-label="Slide anterior"><ArrowLeft /></button>
        <button onClick={() => show((active + 1) % slides)} aria-label="Próximo slide"><ArrowRight /></button>
      </div>
    </div>}
    <div className="hero-meta wrap"><span>Role para descobrir</span><span>Guarapuava • Paraná</span></div>
  </div>;
}
