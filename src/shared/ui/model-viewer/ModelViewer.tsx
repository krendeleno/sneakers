import { type ReactNode, useEffect, useRef } from 'react';

export type ModelStatus = 'loading' | 'loaded' | 'error';

type ModelViewerElement = HTMLElement & { availableVariants?: string[]; variantName: string | null };

type ModelViewerProps = {
  src: string;
  poster: string;
  alt: string;
  /** Accessible name of the AR button (shown only where AR is available) */
  arLabel: string;
  /** KHR_materials_variants name; null keeps the model default */
  variant?: string | null;
  viewTransitionName?: string;
  onVariantsChange?: (variants: string[]) => void;
  onStatusChange?: (status: ModelStatus) => void;
  /** Hotspots: elements with slot="hotspot-*" and data-position */
  children?: ReactNode;
};

export function ModelViewer({
  src,
  poster,
  alt,
  arLabel,
  variant = null,
  viewTransitionName,
  onVariantsChange,
  onStatusChange,
  children,
}: ModelViewerProps) {
  const ref = useRef<ModelViewerElement>(null);

  // The library touches `window` on import, so load it only in the browser.
  useEffect(() => {
    void import('@google/model-viewer');
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleLoad = () => {
      onVariantsChange?.(el.availableVariants ?? []);
      onStatusChange?.('loaded');
    };
    const handleError = () => onStatusChange?.('error');

    el.addEventListener('load', handleLoad);
    el.addEventListener('error', handleError);

    return () => {
      el.removeEventListener('load', handleLoad);
      el.removeEventListener('error', handleError);
    };
  }, [onVariantsChange, onStatusChange]);

  useEffect(() => {
    if (ref.current && variant !== null) ref.current.variantName = variant;
  }, [variant]);

  return (
    <model-viewer
      ref={ref}
      src={src}
      poster={poster}
      alt={alt}
      camera-controls=""
      ar=""
      auto-rotate=""
      shadow-intensity="1"
      // Slotted children (hotspots, AR button) would show in the light DOM until the element is defined
      className="block h-[60vh] w-full rounded-md bg-card [&:not(:defined)>*]:hidden"
      style={{ viewTransitionName }}
    >
      {children}
      {/* Replaces the default AR button, which sits at tabindex="2" (ahead of the whole page in tab order) */}
      <button
        type="button"
        slot="ar-button"
        aria-label={arLabel}
        className="absolute right-4 bottom-4 flex size-10 items-center justify-center rounded-full bg-white shadow-[0_0_4px_rgb(0_0_0/0.15)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {/* model-viewer's own "view in AR" glyph */}
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 fill-black/87">
          <path d="M3 4c0-.55.45-1 1-1h2V1H4C2.35 1 1 2.35 1 4v2h2V4zm17-1c.55 0 1 .45 1 1v2h2V4c0-1.65-1.35-3-3-3h-2v2h2zM4 21c-.55 0-1-.45-1-1v-2H1v2c0 1.65 1.35 3 3 3h2v-2H4zm16 0c.55 0 1-.45 1-1v-2h2v2c0 1.65-1.35 3-3 3h-2v-2h2z" />
          <path d="M18.25 7.6l-5.5-3.18a1.5 1.5 0 0 0-1.5 0L5.75 7.6C5.29 7.87 5 8.36 5 8.9v6.35c0 .54.29 1.03.75 1.3l5.5 3.18c.46.27 1.04.27 1.5 0l5.5-3.18c.46-.27.75-.76.75-1.3V8.9c0-.54-.29-1.03-.75-1.3zM7 14.96v-4.62l4 2.32v4.61l-4-2.31zm5-4.03L8 8.61l4-2.31 4 2.31-4 2.32zm1 6.34v-4.61l4-2.32v4.62l-4 2.31z" />
        </svg>
      </button>
    </model-viewer>
  );
}
