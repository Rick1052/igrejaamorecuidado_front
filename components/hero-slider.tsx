"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { isExternalUrl } from "@/lib/site-data";
import type { Banner } from "@/lib/types";

// Usado quando nenhum banner está ligado, para o topo do site nunca ficar vazio.
const fallbackBanner: Banner = {
  id: "banner-padrao", enabled: true, name: "Apresentação", layout: "text", desktopImage: "/hero-worship.png", mobileImage: "/hero-worship.png",
  eyebrow: "IGREJA AMOR E CUIDADO • GUARAPUAVA", title: "Um lugar para chamar de casa.", description: "", buttons: []
};

function linkProps(url: string) {
  return isExternalUrl(url) ? { href: url, target: "_blank", rel: "noreferrer" } : { href: url };
}

// Um banner é exibido quando está ligado e tem imagem; o banner de texto usa a foto padrão se a imagem foi removida.
function visibleBanners(banners: Banner[]) {
  const visible = banners.filter(banner => banner.enabled && (banner.layout === "text" || banner.desktopImage || banner.mobileImage));
  return visible.length ? visible : [fallbackBanner];
}

export function HeroSlider({ banners }: { banners: Banner[] }) {
  const slides = visibleBanners(banners);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive(current => (current + 1) % slides.length), 8000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  return <div className="hero-slider" aria-roledescription="carrossel" aria-label="Destaques da IAC">
    {slides.map((banner, index) => {
      const isActive = active === index;
      const desktop = banner.desktopImage || banner.mobileImage || "/hero-worship.png";
      const mobile = banner.mobileImage || desktop;
      if (banner.layout === "art") return <article key={banner.id} className={`hero-slide conference-slide ${isActive ? "is-active" : ""}`} aria-hidden={!isActive}>
        <div className="conference-backdrop conference-backdrop-desktop" style={{ backgroundImage: `url(${desktop})` }} />
        <div className="conference-backdrop conference-backdrop-mobile" style={{ backgroundImage: `url(${mobile})` }} />
        {/* A tag picture mantém URLs externas editáveis e escolhe a arte vertical no celular. */}
        <picture className="conference-picture">
          <source media="(max-width: 600px)" srcSet={mobile} />
          <img className="conference-art" src={desktop} alt={[banner.eyebrow, banner.title, banner.description].filter(Boolean).join(" · ") || banner.name} fetchPriority={index === 0 ? "high" : "auto"} />
        </picture>
        {(banner.description || banner.buttons.length > 0) && <div className="conference-action wrap">
          {banner.description && <div><span>{banner.description}</span><strong>Guarapuava • PR</strong></div>}
          {banner.buttons.map(button => <a key={button.id} className="button button-warm" {...linkProps(button.url)}>{button.label} <ArrowRight /></a>)}
        </div>}
      </article>;
      return <article key={banner.id} className={`hero-slide institutional-slide ${isActive ? "is-active" : ""}`} aria-hidden={!isActive}>
        <picture className="institutional-picture">
          <source media="(max-width: 600px)" srcSet={mobile} />
          <img src={desktop} alt="" fetchPriority={index === 0 ? "high" : "auto"} />
        </picture>
        <div className="hero-shade" />
        <div className="hero-content wrap">
          {banner.eyebrow && <p className="eyebrow">{banner.eyebrow}</p>}
          {banner.title && <h1>{banner.title}</h1>}
          {banner.description && <p className="hero-lead">{banner.description}</p>}
          {banner.buttons.length > 0 && <div className="hero-actions">
            {banner.buttons.map((button, buttonIndex) => <a key={button.id} className={`button ${buttonIndex === 0 ? "button-warm" : "button-ghost"}`} {...linkProps(button.url)}>{button.label}<ArrowRight /></a>)}
          </div>}
        </div>
      </article>;
    })}

    {slides.length > 1 && <div className="slider-controls wrap">
      <div className="slider-dots" role="tablist" aria-label="Selecionar destaque">
        {slides.map((banner, index) => <button key={banner.id} className={active === index ? "active" : ""} onClick={() => setActive(index)} aria-label={`Mostrar ${banner.name}`} aria-selected={active === index} role="tab" />)}
      </div>
      <div className="slider-arrows">
        <button onClick={() => setActive((active - 1 + slides.length) % slides.length)} aria-label="Slide anterior"><ArrowLeft /></button>
        <button onClick={() => setActive((active + 1) % slides.length)} aria-label="Próximo slide"><ArrowRight /></button>
      </div>
    </div>}
    <div className="hero-meta wrap"><span>Role para descobrir</span><span>Guarapuava • Paraná</span></div>
  </div>;
}
