import { ArrowRight } from "lucide-react";
import Image from "next/image";
import type { SiteData } from "@/lib/types";

export function FaceToFaceSection({ data }: { data: SiteData["faceToFace"] }) {
  if (!data.enabled) return null;
  return <section className="face-section section" id="face-a-face">
    <div className="wrap face-section-grid">
      <div className="face-section-copy">
        <p className="eyebrow dark">{data.eyebrow}</p>
        <h2>{data.title}<br /><em>com Deus.</em></h2>
        <p>{data.description}</p>
      </div>
      <div className="face-event-grid">
        {([data.men, data.women] as const).map(event => <article className="face-event-card" key={event.title}>
          {event.cardImage && <div className="face-event-image"><Image src={event.cardImage} alt={`Arte do ${event.title}`} fill sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 360px" /></div>}
          <div className="face-event-content"><p>{event.date}</p><h3>{event.title}</h3><a className="button button-dark" href={event.url} target="_blank" rel="noreferrer">Fazer inscrição <ArrowRight /></a></div>
        </article>)}
      </div>
    </div>
  </section>;
}
