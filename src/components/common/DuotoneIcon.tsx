import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type DuotoneTone = "amber" | "emerald" | "sky" | "violet" | "cyan" | "rose" | "pink" | "red" | "indigo" | "orange";

const tones: Record<DuotoneTone, { plate: string; fill: string; stroke: string; glow: string }> = {
  amber: { plate: "from-amber-100 to-amber-300", fill: "fill-amber-300", stroke: "text-amber-700", glow: "shadow-amber-500/40" },
  emerald: { plate: "from-emerald-100 to-emerald-300", fill: "fill-emerald-300", stroke: "text-emerald-700", glow: "shadow-emerald-500/40" },
  sky: { plate: "from-sky-100 to-sky-300", fill: "fill-sky-300", stroke: "text-sky-700", glow: "shadow-sky-500/40" },
  violet: { plate: "from-violet-100 to-violet-300", fill: "fill-violet-300", stroke: "text-violet-700", glow: "shadow-violet-500/40" },
  cyan: { plate: "from-cyan-100 to-cyan-300", fill: "fill-cyan-300", stroke: "text-cyan-700", glow: "shadow-cyan-500/40" },
  rose: { plate: "from-rose-100 to-rose-300", fill: "fill-rose-300", stroke: "text-rose-700", glow: "shadow-rose-500/40" },
  pink: { plate: "from-pink-100 to-pink-300", fill: "fill-pink-300", stroke: "text-pink-700", glow: "shadow-pink-500/40" },
  red: { plate: "from-red-100 to-red-300", fill: "fill-red-300", stroke: "text-red-700", glow: "shadow-red-500/40" },
  indigo: { plate: "from-indigo-100 to-indigo-300", fill: "fill-indigo-300", stroke: "text-indigo-700", glow: "shadow-indigo-500/40" },
  orange: { plate: "from-orange-100 to-orange-300", fill: "fill-orange-300", stroke: "text-orange-700", glow: "shadow-orange-500/40" },
};

interface Props {
  icon: LucideIcon;
  tone: DuotoneTone;
  size?: "md" | "lg";
  className?: string;
}

/** Two-tone layered icon badge with a 3D bevel plate. */
const DuotoneIcon = ({ icon: Icon, tone, size = "md", className }: Props) => {
  const t = tones[tone];
  const box = size === "lg" ? "w-16 h-16 rounded-2xl" : "w-14 h-14 rounded-2xl";
  const ico = size === "lg" ? "h-8 w-8" : "h-7 w-7";
  return (
    <div
      className={cn(
        "relative flex items-center justify-center shrink-0 bg-gradient-to-br shadow-lg ring-1 ring-black/5 border-b-4 border-black/10 transition-transform duration-300 hover:-translate-y-1",
        t.plate,
        t.glow,
        box,
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-x-2 top-1 h-1/3 rounded-full bg-background/50 blur-[2px]" />
      <Icon className={cn("relative drop-shadow-sm", ico, t.fill, t.stroke)} strokeWidth={2} />
    </div>
  );
};

export default DuotoneIcon;
