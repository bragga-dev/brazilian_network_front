import { Badge } from "@/components/ui/Badge";
import { TechIcon } from "@/components/ui/TechIcon";
import type { Technology } from "@/types/technology";

/** Badge de tecnologia com o logo da marca. `suffix` serve para marcações como "· desejável". */
export function TechBadge({ technology, suffix, tone = "blue" }: { technology: Technology; suffix?: string; tone?: "neutral" | "blue" }) {
  return (
    <Badge tone={tone} icon={<TechIcon name={technology.name} categories={technology.categories.map((c) => c.name)} />}>
      {technology.name}
      {suffix}
    </Badge>
  );
}