import { ArrowUpRight, Instagram, Play } from "lucide-react";
import type { InstagramPost } from "@/lib/types";

export function InstagramFeed({ posts, profileUrl }: { posts: InstagramPost[]; profileUrl: string }) {
  return <section className="instagram-section section" aria-labelledby="instagram-title">
    <div className="wrap">
      <div className="instagram-heading">
        <div><p className="eyebrow dark">NOSSA SEMANA EM COMUNIDADE</p><h2 id="instagram-title">Acompanhe a IAC<br /><em>no Instagram.</em></h2></div>
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
