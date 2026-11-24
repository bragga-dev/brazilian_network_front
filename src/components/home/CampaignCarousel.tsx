import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { CampaignSlide } from "@/hooks/useCampaignSlides";
import { cn } from "@/utils/cn";

const AUTOPLAY_MS = 6000;
const SWIPE_PX = 50;

interface Props {
  slides: CampaignSlide[];
  loading: boolean;
}

function SlideView({ slide, active }: { slide: CampaignSlide; active: boolean }) {
  return (
    <div className="relative aspect-[16/9] min-w-full sm:aspect-[21/8]" role="group" aria-roledescription="slide" aria-hidden={!active}>
      {slide.fit === "contain" && <img src={slide.imageUrl} alt="" aria-hidden className="absolute inset-0 size-full scale-110 object-cover opacity-40 blur-2xl" />}
      <img
        src={slide.imageUrl}
        alt={slide.title}
        draggable={false}
        loading="lazy"
        className={cn("relative size-full select-none", slide.fit === "contain" ? "object-contain" : "object-cover")}
      />
      {(slide.title || slide.subtitle) && (
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/45 to-transparent px-6 pb-9 pt-16 sm:px-10 sm:pb-10">
          {slide.title && <p className="max-w-3xl text-xl font-bold leading-tight text-white sm:text-3xl">{slide.title}</p>}
          {slide.subtitle && <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm text-slate-200 sm:text-base">{slide.subtitle}</p>}
        </div>
      )}
    </div>
  );
}

export function CampaignCarousel({ slides, loading }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef<number | null>(null);
  const count = slides.length;
  const current = count ? Math.min(index, count - 1) : 0;

  const go = (next: number) => setIndex(((next % count) + count) % count);

  useEffect(() => {
    if (count < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setIndex((value) => (value + 1) % count), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [current, paused, count]);

  if (loading && count === 0) {
    return <div className="aspect-[16/9] animate-pulse rounded-2xl border border-white/10 bg-white/[0.04] sm:aspect-[21/8]" aria-hidden />;
  }
  if (count === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Campanhas"
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl shadow-black/40"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") go(current - 1);
        if (event.key === "ArrowRight") go(current + 1);
      }}
    >
      <div
        className="flex touch-pan-y transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${current * 100}%)` }}
        onPointerDown={(event) => {
          startX.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (startX.current === null) return;
          const delta = event.clientX - startX.current;
          startX.current = null;
          if (Math.abs(delta) > SWIPE_PX) go(current + (delta < 0 ? 1 : -1));
        }}
        onPointerCancel={() => {
          startX.current = null;
        }}
        aria-live={paused ? "polite" : "off"}
      >
        {slides.map((slide, position) => (
          <SlideView key={slide.id} slide={slide} active={position === current} />
        ))}
      </div>

      {count > 1 && (
        <>
          {[
            { label: "Campanha anterior", Glyph: ChevronLeft, side: "left-3", target: current - 1 },
            { label: "Próxima campanha", Glyph: ChevronRight, side: "right-3", target: current + 1 },
          ].map(({ label, Glyph, side, target }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              onClick={() => go(target)}
              className={cn(
                "absolute top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur transition hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-flag-green sm:flex",
                "sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100",
                side,
              )}
            >
              <Glyph className="size-5" aria-hidden />
            </button>
          ))}

          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
            {slides.map((slide, position) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Ir para a campanha ${position + 1} de ${count}`}
                aria-current={position === current}
                onClick={() => go(position)}
                className={cn("h-2 rounded-full transition-all", position === current ? "w-7 bg-flag-yellow" : "w-2 bg-white/40 hover:bg-white/70")}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}