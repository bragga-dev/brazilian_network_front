import { FeaturedJobs } from "@/components/home/FeaturedJobs";
import { Hero } from "@/components/home/Hero";
import { RecentActivity } from "@/components/home/RecentActivity";
import { RegionsPanel } from "@/components/home/RegionsPanel";
import { StatsBar } from "@/components/home/StatsBar";
import { useHomeData } from "@/hooks/useHomeData";

export default function HomePage() {
  const data = useHomeData();

  return (
    <>
      <Hero />
      <div className="relative mx-auto -mt-12 max-w-7xl space-y-5 px-4 sm:px-6">
        <StatsBar stats={data.stats} />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)_minmax(0,1fr)]">
          <RegionsPanel regions={data.regions} companyCount={data.regionsCompanyCount} sampled={data.regionsSampled} loading={data.regionsLoading} />
          <FeaturedJobs jobs={data.featuredJobs} loading={data.jobsLoading} />
          <RecentActivity items={data.activity} loading={data.activityLoading} />
        </div>
      </div>
    </>
  );
}