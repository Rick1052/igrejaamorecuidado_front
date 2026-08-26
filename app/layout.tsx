import type { Metadata } from "next";
import { Outfit, Work_Sans } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-display" });
const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "IAC Guarapuava | Um lugar para chamar de casa",
  description: "Igreja Amor e Cuidado em Guarapuava. Cultos, células, ministrações e próximos eventos."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={`${outfit.variable} ${workSans.variable}`}>{children}</body></html>;
}
