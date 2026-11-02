"use client";

import { Check, Copy, HandHeart } from "lucide-react";
import { useRef, useState } from "react";
import { hasGivingDetails } from "@/lib/site-data";
import type { Section, SiteData } from "@/lib/types";
import { Paragraphs, RichTitle } from "./rich-text";

type CopyTarget = "key" | "code";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Celulares mais antigos bloqueiam a API de área de transferência; copia por um campo temporário.
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    const ok = document.execCommand("copy");
    field.remove();
    return ok;
  }
}

export function GivingSection({ section, data }: { section: Section; data: SiteData["giving"] }) {
  const [copied, setCopied] = useState<CopyTarget | null>(null);
  const [manual, setManual] = useState<CopyTarget | null>(null);
  const keyRef = useRef<HTMLElement>(null);
  const codeRef = useRef<HTMLElement>(null);
  if (!hasGivingDetails(data)) return null;

  async function copy(target: CopyTarget) {
    const ok = await copyText(target === "key" ? data.pixKey : data.pixCopyPaste);
    if (ok) {
      setManual(null);
      setCopied(target);
      window.setTimeout(() => setCopied(current => current === target ? null : current), 2500);
      return;
    }
    // Sem permissão para copiar: deixa o texto selecionado para o visitante copiar manualmente.
    const element = (target === "key" ? keyRef : codeRef).current;
    if (element) window.getSelection()?.selectAllChildren(element);
    setManual(target);
  }

  const bankRows = [
    ["Banco", data.bankName],
    ["Agência", data.agency],
    ["Conta", data.account],
    ["Titular", data.accountHolder],
    [data.document.replace(/\D/g, "").length > 11 ? "CNPJ" : "CPF/CNPJ", data.document]
  ].filter(([, value]) => value);
  const manualHint = <span className="giving-copy-hint">Texto selecionado: segure ou use Ctrl+C para copiar.</span>;

  return <section className="giving section" id={section.id}>
    <div className="wrap giving-grid">
      <div className="giving-copy">
        {section.eyebrow && <p className="eyebrow dark">{section.eyebrow}</p>}
        <h2><RichTitle text={section.title} /></h2>
        <Paragraphs text={section.text} />
      </div>
      <div className="giving-card">
        <div className={`giving-pix-area ${data.qrCode ? "has-qr" : ""}`}>
          {data.qrCode ? <img className="giving-qr" src={data.qrCode} alt={`QR Code PIX${data.pixKey ? ` da chave ${data.pixKey}` : ""}`} /> : <HandHeart className="giving-icon" />}
          {(data.pixKey || data.pixCopyPaste) && <div className="giving-pix">
            {data.qrCode && <p className="giving-qr-hint">Aponte a câmera do app do banco para o QR Code, ou copie:</p>}
            {data.pixKey && <>
              <p>PIX · {data.pixKeyType}</p>
              <strong ref={keyRef}>{data.pixKey}</strong>
              <button className="button button-dark" onClick={() => copy("key")}>{copied === "key" ? <><Check /> Chave copiada</> : <><Copy /> Copiar chave PIX</>}</button>
              {manual === "key" && manualHint}
            </>}
            {data.pixCopyPaste && <>
              {/* O código fica no DOM (visualmente discreto) para poder ser selecionado se a cópia automática falhar. */}
              <code ref={codeRef} className={`giving-code ${manual === "code" ? "is-visible" : ""}`}>{data.pixCopyPaste}</code>
              <button className={`button ${data.pixKey ? "button-outline" : "button-dark"}`} onClick={() => copy("code")}>{copied === "code" ? <><Check /> Código copiado</> : <><Copy /> Pix copia e cola</>}</button>
              {manual === "code" && manualHint}
            </>}
            <span className="sr-only" aria-live="polite">{copied === "key" ? "Chave PIX copiada" : copied === "code" ? "Código PIX copia e cola copiado" : ""}</span>
          </div>}
        </div>
        {bankRows.length > 0 && <dl className="giving-bank">
          {bankRows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>}
      </div>
    </div>
  </section>;
}
