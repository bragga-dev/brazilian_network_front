import { CampaignCarousel } from "@/components/home/CampaignCarousel";
import { FeaturedJobs } from "@/components/home/FeaturedJobs";
import { Hero } from "@/components/home/Hero";
import { MetricsBar } from "@/components/home/MetricsBar";
import { RecentActivity } from "@/components/home/RecentActivity";
import { RegionsPanel } from "@/components/home/RegionsPanel";
import { StatsBar } from "@/components/home/StatsBar";
import { useCampaignSlides } from "@/hooks/useCampaignSlides";
import { useHomeData } from "@/hooks/useHomeData";

export default function HomePage() {
  const data = useHomeData();
  const campaigns = useCampaignSlides();

  return (
    <>
      <Hero />
      <div className="relative mx-auto -mt-12 max-w-7xl space-y-8 px-4 sm:px-6">
        <CampaignCarousel slides={campaigns.slides} loading={campaigns.loading} />

        <section aria-label="Números da plataforma" className="space-y-3">
          <StatsBar stats={data.stats} />
          <MetricsBar />
        </section>

        <RegionsPanel regions={data.regions} companyCount={data.regionsCompanyCount} loading={data.loading} />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <FeaturedJobs jobs={data.featuredJobs} loading={data.loading} />
          <RecentActivity items={data.activity} loading={data.loading} />
        </div>
      </div>
    </>
  );
}