"use client";

import { useEffect, useRef } from "react";

// Mantenha estas listas em sincronia com os seletores de [data-motion] em globals.css.
const TITLE_TARGETS = ".section-heading h2, .split-title, .cells-copy h2, .face-section-copy h2, .visit h2, .instagram-heading h2";
const RISE_TARGETS = [
  ".section .eyebrow", ".intro-grid>div>*", ".values article", ".service-list article", ".section-heading>svg",
  ".cells-copy>p:not(.eyebrow)", ".cells-copy>.button", ".cell-map-frame", ".sermons-heading .text-link", ".sermon-card",
  ".face-section-copy>p:last-child", ".face-event-card", ".visit h2+p", ".visit-actions", ".visit-quote",
  ".instagram-profile-link", ".instagram-card", ".instagram-empty", ".footer-grid>div"
].join(",");
const LINE_TARGETS = ".values, .service-list";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function ScrollEffects() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = Array.from(document.querySelectorAll<HTMLElement>(`${TITLE_TARGETS},${RISE_TARGETS},${LINE_TARGETS}`));

    // Elementos irmãos entram em cascata, como se a página fosse sendo montada.
    for (const element of targets) {
      const siblings = element.parentElement ? Array.from(element.parentElement.children).filter(child => targets.includes(child as HTMLElement)) : [];
      element.style.setProperty("--reveal-i", String(Math.min(Math.max(siblings.indexOf(element), 0), 6)));
    }

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-revealed", "");
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -12% 0px" });
    targets.forEach(element => observer.observe(element));
    (window as Window & { __motionReady?: boolean }).__motionReady = true;

    const collapsing = Array.from(document.querySelectorAll<HTMLElement>("[data-collapse]"));
    const expanding = Array.from(document.querySelectorAll<HTMLElement>("[data-expand]"));
    const marquees = Array.from(document.querySelectorAll<HTMLElement>("[data-marquee]"));
    const parallax = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    let frame = 0;

    function update() {
      frame = 0;
      const viewport = window.innerHeight;
      const scrollable = root.scrollHeight - viewport;
      progressRef.current?.style.setProperty("transform", `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`);
      if (reduced) return;

      // O banner do topo se recolhe como um cartão enquanto a seção seguinte sobe.
      for (const section of collapsing) {
        const rect = section.getBoundingClientRect();
        const progress = clamp(-rect.top / rect.height);
        section.style.clipPath = progress > 0.001 ? `inset(0 ${(progress * 4).toFixed(2)}vw round 0 0 ${(progress * 56).toFixed(1)}px ${(progress * 56).toFixed(1)}px)` : "";
      }
      for (const section of expanding) {
        const progress = clamp((viewport - section.getBoundingClientRect().top) / (viewport * 0.7));
        const rest = 1 - progress;
        section.style.clipPath = rest > 0.001 ? `inset(0 ${(rest * 4).toFixed(2)}vw round ${(rest * 40).toFixed(1)}px)` : "";
      }
      for (const row of marquees) {
        const rect = row.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewport) continue;
        const shift = (viewport - rect.top) * 0.35 * Number(row.dataset.marquee);
        row.style.transform = `translate3d(calc(-25% + ${shift.toFixed(1)}px),0,0)`;
      }
      for (const element of parallax) {
        const rect = element.parentElement!.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewport) continue;
        const offset = (rect.top + rect.height / 2 - viewport / 2) * Number(element.dataset.parallax);
        element.style.transform = `translate3d(0,${offset.toFixed(1)}px,0)`;
      }
    }

    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return <div className="scroll-progress" ref={progressRef} aria-hidden="true" />;
}
