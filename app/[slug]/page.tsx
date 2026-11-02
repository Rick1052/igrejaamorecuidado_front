import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteData } from "@/lib/api";
import { visibleMenu } from "@/lib/site-data";
import { ScrollEffects } from "@/components/scroll-effects";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContentSection } from "@/components/page-sections";
import { Paragraphs } from "@/components/rich-text";

type Props = { params: Promise<{ slug: string }> };

async function findPage(slug: string) {
  const data = await getSiteData();
  const page = data.pages.find(candidate => candidate.slug === slug && candidate.enabled);
  return { data, page };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await findPage((await params).slug);
  return page ? { title: `${page.title} | Amor & Cuidado Guarapuava`, description: page.description || undefined } : {};
}

// Páginas criadas no admin: topo escuro com o menu, título e as seções livres da página.
export default async function CustomPage({ params }: Props) {
  const { data, page } = await findPage((await params).slug);
  if (!page) notFound();
  return <main>
    <ScrollEffects />
    <section className="page-hero">
      <SiteHeader menu={visibleMenu(data)} onHome={false} />
      <div className="wrap page-hero-content">
        <h1>{page.title}</h1>
        {page.description && <Paragraphs text={page.description} className="page-hero-lead" />}
      </div>
    </section>
    {page.sections.filter(section => section.enabled).map(section => <ContentSection key={section.id} section={section} onHome={false} />)}
    <SiteFooter data={data} onHome={false} />
  </main>;
}
