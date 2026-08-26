"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./logo";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <a href="#inicio"><Logo light /></a>
    <button className="menu-button" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    <nav className={open ? "nav-open" : ""} aria-label="Navegação principal">
      <a href="#sobre" onClick={() => setOpen(false)}>Quem somos</a>
      <a href="#agenda" onClick={() => setOpen(false)}>Agenda</a>
      <a href="#mensagens" onClick={() => setOpen(false)}>Mensagens</a>
      <a href="#celulas" onClick={() => setOpen(false)}>Células</a>
      <a className="nav-cta" href="#visita" onClick={() => setOpen(false)}>Vou visitar</a>
    </nav>
  </header>;
}
