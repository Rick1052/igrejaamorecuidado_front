"use client";

import { Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Sermon } from "@/lib/types";

function getYoutubeVideoId(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const pathId = parsed.pathname.match(/^\/(?:embed|live|shorts)\/([\w-]{11})/)?.[1];
    const id = host === "youtu.be" ? parsed.pathname.slice(1).split("/")[0] : parsed.searchParams.get("v") || pathId;
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function SermonGallery({ sermons }: { sermons: Sermon[] }) {
  const [selected, setSelected] = useState<Sermon | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const videoId = selected ? getYoutubeVideoId(selected.url) : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (selected && dialog && !dialog.open) dialog.showModal();
  }, [selected]);

  function openPlayer(sermon: Sermon, trigger: HTMLButtonElement) {
    triggerRef.current = trigger;
    setSelected(sermon);
  }

  function handleClosed() {
    setSelected(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return <>
    <div className="sermon-grid">
      {sermons.map((sermon, index) => <button className="sermon-card" type="button" key={`${sermon.title}-${index}`} onClick={event => openPlayer(sermon, event.currentTarget)} aria-label={`Assistir ${sermon.title}`}>
        <div className="sermon-thumb" style={sermon.thumbnail ? { backgroundImage: `url(${sermon.thumbnail})` } : undefined}><span aria-hidden="true"><Play fill="currentColor" /></span></div>
        <p>{sermon.speaker}</p><h3>{sermon.title}</h3>
      </button>)}
    </div>

    <dialog className="sermon-dialog" ref={dialogRef} onClose={handleClosed} onClick={event => { if (event.target === event.currentTarget) dialogRef.current?.close(); }} aria-labelledby="sermon-player-title">
      <div className="sermon-dialog-panel">
        <header>
          <div><p>ASSISTIR MINISTRAÇÃO</p><h2 id="sermon-player-title">{selected?.title}</h2></div>
          <button type="button" className="sermon-player-close" onClick={() => dialogRef.current?.close()} aria-label="Fechar vídeo"><X /></button>
        </header>
        <div className="sermon-player-frame">
          {videoId && <iframe src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`} title={selected?.title || "Ministração da IAC"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />}
          {selected && !videoId && <div className="sermon-player-error">Não foi possível carregar este vídeo.</div>}
        </div>
      </div>
    </dialog>
  </>;
}
