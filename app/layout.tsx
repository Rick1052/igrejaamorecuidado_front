import type { Metadata } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

// SF Pro (fonte primária da marca) é usada onde o sistema a oferece; Inter é o substituto web.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const baskerville = Libre_Baskerville({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-baskerville" });

// Liga as animações de entrada antes da primeira pintura; se o JS falhar, o conteúdo volta a aparecer.
const motionScript = `if(!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.motion="";setTimeout(function(){if(!window.__motionReady)delete document.documentElement.dataset.motion},4000)}`;

export const metadata: Metadata = {
  title: "Amor & Cuidado Guarapuava | Um lugar de céus abertos",
  description: "Igreja Amor e Cuidado em Guarapuava. Cultos, células, ministrações e próximos eventos."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className={`${inter.variable} ${baskerville.variable}`} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: motionScript }} /></head><body>{children}</body></html>;
}
