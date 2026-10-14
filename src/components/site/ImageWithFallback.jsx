import { useState } from "react";
import { FALLBACK_EVENT_IMAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ImageWithFallback({ src, alt = "", fallback = FALLBACK_EVENT_IMAGE, fallbackLabel, priority = false, className, onLoad, ...props }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const [loadedSrc, setLoadedSrc] = useState(null);
  const failed = !src || failedSrc === src;
  const finalSrc = failed ? fallback : src;

  if (!finalSrc) {
    const initial = (fallbackLabel || alt || "").trim().charAt(0).toUpperCase();
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "grid place-items-center bg-surface bg-[radial-gradient(120%_80%_at_20%_0%,rgba(45,194,117,0.14),transparent_60%)] select-none",
          className
        )}
      >
        {initial ? (
          <span aria-hidden="true" className="text-h2 font-semibold text-border-hover">
            {initial}
          </span>
        ) : null}
      </div>
    );
  }

  const loaded = loadedSrc === finalSrc;
  return (
    <img
      ref={(img) => {
        if (img?.complete && img.naturalWidth > 0 && loadedSrc !== finalSrc) setLoadedSrc(finalSrc);
      }}
      src={finalSrc}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      data-loaded={loaded || undefined}
      onLoad={(e) => {
        setLoadedSrc(finalSrc);
        onLoad?.(e);
      }}
      onError={() => !failed && setFailedSrc(src)}
      className={cn(
        "bg-surface object-cover contrast-[1.04] saturate-[1.05] transition-[opacity,transform] duration-700 ease-out-expo",
        !loaded && "opacity-0",
        className
      )}
      {...props}
    />
  );
}
