// Các dải sóng (viewBox 1440×400). Ngoài component: không tạo lại mảng mỗi lần render.

import { useId } from "react";
import { cn } from "@/lib/utils";

const WAVES_A = [
  { d: "M-40 330 C 280 120, 560 60, 820 180 S 1260 360, 1480 120", w: 2.5 },
  { d: "M-40 200 C 240 60, 520 120, 760 240 S 1180 330, 1480 220", w: 1.5 },
  { d: "M0 140 C 380 300, 720 120, 1080 60 S 1380 160, 1480 150", w: 1 },
];
const WAVES_B = [
  { d: "M-40 260 C 300 380, 620 300, 900 170 S 1250 40, 1480 90", w: 2 },
  { d: "M-40 360 C 360 240, 700 220, 980 300 S 1320 200, 1480 260", w: 1.5 },
];

function WaveLayer({ waves, gradientId, filterId, className }) {
  return (
    <div aria-hidden="true" className={cn("absolute inset-y-0 -left-[10%] w-[120%] will-change-transform", className)}>
      <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="size-full">
        <g filter={`url(#${filterId})`} opacity="0.75">
          {waves.map((w) => (
            <path key={w.d} d={w.d} fill="none" stroke={`url(#${gradientId})`} strokeWidth={w.w * 5} strokeLinecap="round" />
          ))}
        </g>
        {waves.map((w) => (
          <path key={w.d} d={w.d} fill="none" stroke={`url(#${gradientId})`} strokeWidth={w.w} strokeLinecap="round" />
        ))}
      </svg>
    </div>
  );
}

export function GlowWaves({ className }) {
  const uid = useId().replace(/:/g, "");
  const gradientId = `gw-grad-${uid}`;
  const filterId = `gw-blur-${uid}`;
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_20%_45%,rgba(45,194,117,0.16),transparent_70%),radial-gradient(50%_60%_at_85%_60%,rgba(45,194,117,0.10),transparent_70%)]" />
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#2dc275" stopOpacity="0" />
            <stop offset="0.25" stopColor="#39d98a" stopOpacity="0.9" />
            <stop offset="0.55" stopColor="#2dc275" stopOpacity="0.55" />
            <stop offset="0.8" stopColor="#8ff0bd" stopOpacity="0.8" />
            <stop offset="1" stopColor="#2dc275" stopOpacity="0" />
          </linearGradient>
          <filter id={filterId} x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
      </svg>
      <WaveLayer waves={WAVES_A} gradientId={gradientId} filterId={filterId} className="animate-wave-a motion-reduce:animate-none" />
      <WaveLayer waves={WAVES_B} gradientId={gradientId} filterId={filterId} className="animate-wave-b opacity-80 motion-reduce:animate-none" />
    </div>
  );
}
