import { useState } from 'react';
import type { Shoe } from '@/entities/shoe';
import { ColorwayPicker } from '@/features/switch-colorway';
import { getTranslations, type Locale } from '@/shared/i18n';
import { withBase } from '@/shared/lib';
import { type ModelStatus, ModelViewer } from '@/shared/ui';

/** `poster`: full-size poster URL, shown until the model loads */
type ShoeShowcaseProps = { shoe: Shoe & { model: string }; poster: string; locale: Locale };

export function ShoeShowcase({ shoe, poster, locale }: ShoeShowcaseProps) {
  const t = getTranslations(locale);
  const [variants, setVariants] = useState<string[]>([]);
  const [variant, setVariant] = useState<string | null>(null);
  const [status, setStatus] = useState<ModelStatus>('loading');

  return (
    <div className="space-y-4">
      <ModelViewer
        src={withBase(`models/${shoe.model}`)}
        poster={poster}
        alt={`${t.modelAlt} ${shoe.name}`}
        arLabel={t.viewInAR}
        variant={variant}
        viewTransitionName={`shoe-${shoe.id}`}
        onVariantsChange={setVariants}
        onStatusChange={setStatus}
      >
        {shoe.hotspots.map((hotspot, i) => (
          <button
            key={hotspot.position}
            type="button"
            slot={`hotspot-${i}`}
            data-position={hotspot.position}
            data-normal={hotspot.normal}
            className="rounded-sm border border-border bg-card/90 px-2 py-1 text-xs font-medium text-foreground shadow transition hover:ring-2 hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {hotspot.label}
          </button>
        ))}
      </ModelViewer>
      {status === 'error' && (
        <p role="alert" className="text-sm text-destructive">
          {t.modelError}
        </p>
      )}
      <ColorwayPicker variants={variants} value={variant} onChange={setVariant} locale={locale} />
    </div>
  );
}
