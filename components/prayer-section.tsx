"use client";

import { Check, HandHeart, LoaderCircle, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import type { Section } from "@/lib/types";
import { Paragraphs, RichTitle } from "./rich-text";

type Status = "idle" | "sending" | "sent" | "error";

// Formulário público de pedidos de oração. Os pedidos vão para a API e aparecem só no painel administrativo.
export function PrayerSection({ section }: { section: Section }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setStatus("sending"); setMessage("");
    try {
      const response = await fetch("/api/prayers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: values.get("name"), contact: values.get("contact"), request: values.get("request"), website: values.get("website") })
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        setStatus("error");
        setMessage(result.message || "Não foi possível enviar agora. Tente novamente em instantes.");
        return;
      }
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
      setMessage("Sem conexão com o servidor. Confira a internet e tente novamente.");
    }
  }

  return <section className="prayer section" id={section.id}>
    <div className="wrap prayer-grid">
      <div className="prayer-copy">
        {section.eyebrow && <p className="eyebrow dark">{section.eyebrow}</p>}
        <h2><RichTitle text={section.title} /></h2>
        <Paragraphs text={section.text} />
      </div>
      <div className="prayer-card">
        {status === "sent" ? <div className="prayer-sent" role="status">
          <Check />
          <h3>Pedido recebido.</h3>
          <p>Nossa equipe vai orar por você. Deus está atento a cada detalhe da sua vida.</p>
          <button className="button button-outline" onClick={() => setStatus("idle")}>Enviar outro pedido</button>
        </div> : <form className="prayer-form" onSubmit={submit}>
          <HandHeart className="giving-icon" />
          <label><span>Seu nome <em>(opcional)</em></span><input name="name" maxLength={80} autoComplete="name" /></label>
          <label><span>WhatsApp ou e-mail <em>(opcional, se quiser que a gente entre em contato)</em></span><input name="contact" maxLength={120} autoComplete="email" /></label>
          <label>Pedido de oração<textarea name="request" rows={5} minLength={3} maxLength={2000} required placeholder="Escreva aqui pelo que você gostaria que orássemos." /></label>
          {/* Armadilha para robôs: fica fora da tela e pessoas não a preenchem. */}
          <label className="prayer-trap" aria-hidden="true">Site<input name="website" tabIndex={-1} autoComplete="off" /></label>
          {status === "error" && <p className="form-message error" role="alert">{message}</p>}
          <button className="button button-dark" disabled={status === "sending"}>{status === "sending" ? <LoaderCircle className="spin" /> : <Send />} Enviar pedido</button>
          <small>Seu pedido é visto apenas pela equipe de intercessão da igreja.</small>
        </form>}
      </div>
    </div>
  </section>;
}
