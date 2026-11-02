"use client";

import { Check, Copy, HandHeart } from "lucide-react";
import { useRef, useState } from "react";
import { hasGivingDetails } from "@/lib/site-data";
import type { SiteData } from "@/lib/types";

export function GivingSection({ data }: { data: SiteData["giving"] }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");
  const keyRef = useRef<HTMLElement>(null);
  if (!hasGivingDetails(data)) return null;

  async function copyPix() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(data.pixKey);
      ok = true;
    } catch {
      // Celulares mais antigos bloqueiam a API de área de transferência; copia por um campo temporário.
      const field = document.createElement("textarea");
      field.value = data.pixKey;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      ok = document.execCommand("copy");
      field.remove();
    }
    if (ok) {
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2500);
      return;
    }
    // Sem permissão para copiar: deixa a chave selecionada para o visitante copiar manualmente.
    if (keyRef.current) window.getSelection()?.selectAllChildren(keyRef.current);
    setCopyState("manual");
  }

  const bankRows = [
    ["Banco", data.bankName],
    ["Agência", data.agency],
    ["Conta", data.account],
    ["Titular", data.accountHolder],
    [data.document.replace(/\D/g, "").length > 11 ? "CNPJ" : "CPF/CNPJ", data.document]
  ].filter(([, value]) => value);

  return <section className="giving section" id="contribua">
    <div className="wrap giving-grid">
      <div className="giving-copy">
        <p className="eyebrow dark">GENEROSIDADE</p>
        <h2>Semear também<br /><em>é adorar.</em></h2>
        <h3>{data.title}</h3>
        <p>{data.description}</p>
      </div>
      <div className="giving-card">
        <HandHeart className="giving-icon" />
        {data.pixKey && <div className="giving-pix">
          <p>PIX · {data.pixKeyType}</p>
          <strong ref={keyRef}>{data.pixKey}</strong>
          <button className="button button-dark" onClick={copyPix}>{copyState === "copied" ? <><Check /> Chave copiada</> : <><Copy /> Copiar chave PIX</>}</button>
          {copyState === "manual" && <span className="giving-copy-hint">Chave selecionada: segure ou use Ctrl+C para copiar.</span>}
          <span className="sr-only" aria-live="polite">{copyState === "copied" ? "Chave PIX copiada" : ""}</span>
        </div>}
        {bankRows.length > 0 && <dl className="giving-bank">
          {bankRows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>}
      </div>
    </div>
  </section>;
}
