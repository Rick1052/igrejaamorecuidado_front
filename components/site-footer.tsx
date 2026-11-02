import { Instagram, Youtube } from "lucide-react";
import { isExternalUrl, resolveHref, visibleMenu } from "@/lib/site-data";
import type { SiteData } from "@/lib/types";
import { Logo } from "./logo";

export function SiteFooter({ data, onHome = true }: { data: SiteData; onHome?: boolean }) {
  return <footer><div className="wrap footer-grid">
    <div><Logo light /><p>Gente cuidando de gente.</p></div>
    <div><h3>Conecte-se</h3><a href={data.links.instagramChurch}>Instagram da igreja</a><a href={data.links.instagramPastor}>Pr. Erik Farley</a><a href={data.links.youtube}>YouTube</a></div>
    <div><h3>Explore</h3>
      {visibleMenu(data).map(item => <a key={item.id} href={resolveHref(item.url, onHome)} {...(isExternalUrl(item.url) ? { target: "_blank", rel: "noreferrer" } : {})}>{item.label}</a>)}
      <a href={data.links.linktree}>Todos os links</a>
    </div>
    <div className="social"><a href={data.links.instagramChurch} aria-label="Instagram"><Instagram /></a><a href={data.links.youtube} aria-label="YouTube"><Youtube /></a></div>
  </div><div className="wrap footer-bottom"><span>© 2026 IAC Guarapuava</span><a href="/admin">Área administrativa</a></div></footer>;
}
