import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * HomeDropTimeline
 * Full-width editorial timeline with twin product pairs.
 * Optimized sizing, spacing, and professional UX/UI.
 */
export default function HomeDropTimeline({ drops = [] }) {
  const pairs = useMemo(() => {
    const out = [];
    for (let i = 0; i < drops.length; i += 2) out.push([drops[i], drops[i + 1]].filter(Boolean));
    return out;
  }, [drops]);

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-x-clip bg-black text-white">
      <div className="mx-auto w-full max-w-none">
        {pairs.map((pair, pairIdx) => (
          <TwinSection key={`pair-${pairIdx}`} pair={pair} pairIndex={pairIdx} />
        ))}
      </div>
    </div>
  );
}

function TwinSection({ pair, pairIndex }) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.85", "end 0.25"],
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.35, 1],
    prefersReducedMotion ? [1, 1, 1] : [0, 1, 1]
  );
  const leftY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [16, -4]);
  const rightY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [20, -2]);

  return (
    <motion.section
      ref={sectionRef}
      style={{ opacity }}
      className="relative w-screen border-b border-white/10"
    >
      {/* Subtle ambient background */}
      <div className="pointer-events-none absolute inset-0 opacity-50 [background:radial-gradient(900px_circle_at_20%_0%,rgba(255,255,255,0.03),transparent_65%),radial-gradient(700px_circle_at_80%_100%,rgba(255,212,0,0.04),transparent_65%)]" />

      {/* Center timeline rail + marker + connector */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/10" />
      <div className="pointer-events-none absolute left-1/2 top-8 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/60 shadow-[0_0_0_6px_rgba(255,255,255,0.03)]" />
      <div className="pointer-events-none absolute left-0 right-0 top-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Compact, professional sizing */}
      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-5 sm:py-10 lg:px-6 lg:py-12">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6 xl:gap-7">
          {/* Left twin */}
          <motion.div style={{ y: leftY }} className="lg:pr-2.5 lg:-translate-x-1 xl:pr-3 xl:-translate-x-1.5">
            {pair[0] && <DropCard drop={pair[0]} index={pairIndex * 2} side="left" />}
          </motion.div>

          {/* Right twin */}
          <motion.div style={{ y: rightY }} className="lg:pl-2.5 lg:translate-x-1 xl:pl-3 xl:translate-x-1.5">
            {pair[1] && <DropCard drop={pair[1]} index={pairIndex * 2 + 1} side="right" />}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

function DropCard({ drop, index, side = "left" }) {
  const prefersReducedMotion = useReducedMotion();
  const isRight = side === "right";

  const images = useMemo(() => {
    const list = Array.isArray(drop.images) ? drop.images.filter(Boolean) : [];
    if (drop.image && !list.includes(drop.image)) return [drop.image, ...list];
    return list;
  }, [drop.image, drop.images]);

  const [activeIdx, setActiveIdx] = useState(0);
  const activeImage = images[activeIdx] || drop.image;

  return (
    <div
      className={[
        "group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.025]",
        "shadow-[0_16px_50px_rgba(0,0,0,0.4)]",
        "transition-shadow duration-500 hover:shadow-[0_20px_65px_rgba(0,0,0,0.5)]",
        isRight
          ? "bg-gradient-to-l from-white/[0.03] via-white/[0.015] to-transparent"
          : "bg-gradient-to-r from-white/[0.03] via-white/[0.015] to-transparent",
      ].join(" ")}
    >
      {/* Subtle texture overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.15] [background:repeating-linear-gradient(0deg,rgba(255,255,255,0.04)_0px,rgba(255,255,255,0.04)_1px,transparent_1px,transparent_4px)] mix-blend-overlay" />

      {/* Compact padding */}
      <div className="p-2.5 sm:p-3 lg:p-3.5">
        <div className="grid grid-cols-1 gap-4 sm:gap-4.5">
          {/* Image section - compact sizing */}
          <div className="relative">
            <motion.div
              className={[
                "relative overflow-hidden rounded-lg border border-white/10 bg-black/30",
                "transition-shadow duration-500",
                "group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)]",
              ].join(" ")}
              whileHover={prefersReducedMotion ? undefined : { y: -1.5 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              {/* Compact aspect ratio */}
              <div className="aspect-[4/5] w-full sm:aspect-[5/6] lg:aspect-[6/7]">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={drop.name ? `${drop.name} hero` : "Drop hero"}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    sizes="(min-width:1024px) 45vw, 100vw"
                    className={[
                      "h-full w-full object-cover object-center",
                      "transition-[transform,filter] duration-700 ease-out",
                      "group-hover:scale-[1.02] group-hover:brightness-[1.04]",
                    ].join(" ")}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs tracking-widest text-white/50">
                    IMAGE REQUIRED
                  </div>
                )}
              </div>

              {/* Subtle overlays */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
              <div
                className={[
                  "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500",
                  "group-hover:opacity-100",
                  isRight
                    ? "[background:radial-gradient(600px_circle_at_70%_30%,rgba(255,212,0,0.1),transparent_60%)]"
                    : "[background:radial-gradient(600px_circle_at_30%_30%,rgba(255,212,0,0.1),transparent_60%)]",
                ].join(" ")}
              />
            </motion.div>

            {/* Minimal thumbnails */}
            {images.length > 1 && (
              <div className="mt-2 flex gap-1 overflow-x-auto pb-0.5">
                {images.slice(0, 5).map((src, i) => {
                  const isActive = i === activeIdx;
                  return (
                    <button
                      key={`${src}-${i}`}
                      type="button"
                      onClick={() => setActiveIdx(i)}
                      className={[
                        "relative shrink-0 overflow-hidden rounded border transition-all duration-300",
                        isActive
                          ? "border-white/50 scale-105"
                          : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100",
                      ].join(" ")}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img
                        src={src}
                        alt={drop.name ? `${drop.name} ${i + 1}` : `Thumbnail ${i + 1}`}
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        sizes="60px"
                        className="h-10 w-10 object-cover sm:h-11 sm:w-11"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Story section - compact typography */}
          <div className="space-y-2.5">
            {/* Meta row */}
            <div className="flex items-baseline justify-between gap-1.5">
              <div className={["flex items-baseline gap-2 flex-wrap", isRight ? "flex-row-reverse" : ""].join(" ")}>
                {drop.year && (
                  <span className="text-[9px] font-medium tracking-[0.32em] text-white/60 uppercase">
                    {drop.year}
                  </span>
                )}
                {drop.collection && (
                  <span className="text-[9px] tracking-[0.22em] text-white/40 uppercase">
                    {drop.collection}
                  </span>
                )}
              </div>

              <div className="text-[9px] tracking-[0.32em] text-white/30">
                {String(index + 1).padStart(2, "0")}
              </div>
            </div>

            {/* Product title - compact */}
            <h3
              className={[
                "text-balance font-semibold leading-[1.1] tracking-[-0.01em]",
                "text-[clamp(1.1rem,1.5vw,1.4rem)]",
                isRight ? "text-right" : "text-left",
              ].join(" ")}
            >
              {drop.name || "Untitled Drop"}
            </h3>

            {/* Story text - compact */}
            {drop.story ? (
              <p
                className={[
                  "text-pretty text-[11px] leading-[1.65] text-white/70 sm:text-[12px]",
                  isRight ? "text-right" : "text-left",
                ].join(" ")}
              >
                {drop.story}
              </p>
            ) : (
              <p
                className={[
                  "text-[11px] leading-[1.65] text-white/50 sm:text-[12px]",
                  isRight ? "text-right" : "text-left",
                ].join(" ")}
              >
                Add a short story: inspiration, materials, and how it was made.
              </p>
            )}

            {/* Details list - minimal */}
            {Array.isArray(drop.details) && drop.details.length > 0 && (
              <ul
                className={[
                  "space-y-1 pt-0.5",
                  isRight
                    ? "border-r border-white/10 pr-2.5 text-right"
                    : "border-l border-white/10 pl-2.5 text-left",
                ].join(" ")}
              >
                {drop.details.slice(0, 3).map((d, i) => (
                  <li key={`${d}-${i}`} className="text-[10px] leading-[1.5] text-white/60">
                    {d}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
