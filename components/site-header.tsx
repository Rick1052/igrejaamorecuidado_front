"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { isExternalUrl, resolveHref } from "@/lib/site-data";
import type { MenuItem } from "@/lib/types";
import { Logo } from "./logo";

export function SiteHeader({ menu, onHome = true }: { menu: MenuItem[]; onHome?: boolean }) {
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <a href={onHome ? "#inicio" : "/"}><Logo light /></a>
    <button className="menu-button" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    <nav className={open ? "nav-open" : ""} aria-label="Navegação principal">
      {menu.map(item => {
        const external = isExternalUrl(item.url);
        return <a key={item.id} className={item.highlight ? "nav-cta" : undefined} href={resolveHref(item.url, onHome)} onClick={() => setOpen(false)} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
          {item.label}{external && <ArrowUpRight className="nav-external" aria-label="(abre em nova aba)" />}
        </a>;
      })}
    </nav>
  </header>;
}
