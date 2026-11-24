import { useQueries, useQuery } from "@tanstack/react-query";

import { campaignService } from "@/services/campaign.service";

export interface CampaignSlide {
  id: string;
  campaignId: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  fit: "cover" | "contain";
}

/** Chaves sob "campaigns": o admin já invalida esse prefixo ao mexer em campanhas/banners. */
export function useCampaignSlides() {
  const campaigns = useQuery({ queryKey: ["campaigns", "active"], queryFn: campaignService.list, staleTime: 60_000 });
  const list = campaigns.data?.items ?? [];

  const images = useQueries({
    queries: list.map((campaign) => ({
      queryKey: ["campaigns", "images", campaign.campaign_id],
      queryFn: () => campaignService.images(campaign.campaign_id),
      staleTime: 60_000,
    })),
  });

  const slides: CampaignSlide[] = list.flatMap((campaign, index) =>
    [...(images[index]?.data ?? [])]
      .sort((a, b) => a.display_order - b.display_order)
      .map((image) => ({
        id: image.campaign_mage_id,
        campaignId: campaign.campaign_id,
        imageUrl: image.image_url,
        title: image.title || campaign.title,
        subtitle: image.subtitle || campaign.description || "",
        fit: image.fit === "contain" ? ("contain" as const) : ("cover" as const),
      })),
  );

  return { slides, loading: campaigns.isLoading || images.some((query) => query.isLoading) };
}