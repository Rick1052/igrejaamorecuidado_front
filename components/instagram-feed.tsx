import { ArrowUpRight, Instagram, Play } from "lucide-react";
import type { InstagramPost, Section } from "@/lib/types";
import { RichTitle } from "./rich-text";

export function InstagramFeed({ section, posts, profileUrl }: { section: Section; posts: InstagramPost[]; profileUrl: string }) {
  return <section className="instagram-section section" id={section.id} aria-labelledby="instagram-title">
    <div className="wrap">
      <div className="instagram-heading">
        <div>{section.eyebrow && <p className="eyebrow dark">{section.eyebrow}</p>}<h2 id="instagram-title"><RichTitle text={section.title} /></h2></div>
        <a className="button button-outline instagram-profile-link" href={profileUrl} target="_blank" rel="noreferrer"><Instagram /> @iacguarapuava <ArrowUpRight /></a>
      </div>
      {posts.length > 0 ? <div className="instagram-grid">
        {posts.slice(0, 6).map(post => {
          const image = post.mediaType === "VIDEO" ? post.thumbnailUrl || post.mediaUrl : post.mediaUrl;
          const description = post.caption?.trim() || "Publicação da IAC Guarapuava";
          return <a className="instagram-card" href={post.permalink} target="_blank" rel="noreferrer" key={post.id} aria-label={`Abrir no Instagram: ${description}`}>
            <img src={image} alt={description} loading="lazy" />
            {post.mediaType === "VIDEO" && <span className="instagram-media-type" aria-label="Vídeo"><Play fill="currentColor" /></span>}
            <span className="instagram-overlay"><Instagram /><span>{description}</span><ArrowUpRight /></span>
          </a>;
        })}
      </div> : <a className="instagram-empty" href={profileUrl} target="_blank" rel="noreferrer">
        <Instagram /><span><strong>Veja as últimas publicações</strong>Acompanhe cultos, encontros e tudo o que está acontecendo na IAC.</span><ArrowUpRight />
      </a>}
    </div>
  </section>;
}
