import { getSiteData } from "@/lib/api";
import { visibleMenu } from "@/lib/site-data";
import { ScrollEffects } from "@/components/scroll-effects";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroSlider } from "@/components/hero-slider";
import { PageSection } from "@/components/page-sections";

export default async function Home() {
  const data = await getSiteData();
  return <main>
    <ScrollEffects />
    <section className="hero" id="inicio" data-collapse>
      <HeroSlider banners={data.banners} />
      <SiteHeader menu={visibleMenu(data)} />
    </section>

    {/* A ordem e a visibilidade das seções vêm do admin. */}
    {data.sections.map(section => <PageSection key={section.id} section={section} data={data} />)}

    <SiteFooter data={data} />
  </main>;
}
