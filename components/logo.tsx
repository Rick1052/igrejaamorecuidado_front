export function Logo({ light = false }: { light?: boolean }) {
  return <span className={`logo ${light ? "logo-light" : ""}`} aria-label="IAC Guarapuava"><span className="logo-mark">IA</span><span className="logo-copy">amor<br />& cuidado</span></span>;
}
