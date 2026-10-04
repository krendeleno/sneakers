import { type KeyboardEvent, type MouseEvent, useRef, useState } from 'react';
import type { Shoe } from '@/entities/shoe';
import { getTranslations, type Locale } from '@/shared/i18n';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/shared/ui';

type Img = { src: string; width: number; height: number };

type ShoeGalleryProps = {
  shoe: Shoe;
  /** Full-size images; the poster leads, so the catalog card morphs into the same picture */
  images: Img[];
  /** Small copies of the photos (images after the poster) for the strip under the hero */
  thumbs: Img[];
  locale: Locale;
};

/**
 * Gallery for a pair without a 3D model (wish, or owned and not yet scanned): poster + photo thumbnails; any image
 * opens a lightbox carousel at that image.
 */
export function ShoeGallery({ shoe, images, thumbs, locale }: ShoeGalleryProps) {
  const t = getTranslations(locale);
  const [openAt, setOpenAt] = useState<number | null>(null);
  const [api, setApi] = useState<CarouselApi>();
  const opener = useRef<HTMLElement | null>(null);

  const show = (index: number) => (event: MouseEvent<HTMLButtonElement>) => {
    opener.current = event.currentTarget;
    setOpenAt(index);
  };

  // Arrows work wherever focus is in the dialog (the carousel itself doesn't handle keys).
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') api?.scrollPrev();
    if (event.key === 'ArrowRight') api?.scrollNext();
  };

  return (
    <div>
      <button
        type="button"
        onClick={show(0)}
        aria-label={`${t.openPhoto} 1`}
        className="block w-full cursor-zoom-in overflow-hidden rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {/* The LCP: fetched first (and preloaded by the page) */}
        <img
          src={images[0].src}
          alt={shoe.name}
          width={images[0].width}
          height={images[0].height}
          fetchPriority="high"
          className="aspect-[4/3] w-full object-cover"
          style={{ viewTransitionName: `shoe-${shoe.id}` }}
        />
      </button>
      {images.length > 1 && (
        <ul aria-label={t.photos} className="mt-3 grid grid-cols-3 gap-3">
          {thumbs.map((thumb, i) => (
            <li key={thumb.src}>
              <button
                type="button"
                onClick={show(i + 1)}
                aria-label={`${t.openPhoto} ${i + 2}`}
                data-testid="gallery-thumb"
                className="block w-full cursor-zoom-in overflow-hidden rounded-sm border border-border transition hover:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <img
                  src={thumb.src}
                  alt=""
                  width={thumb.width}
                  height={thumb.height}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Dialog open={openAt !== null} onOpenChange={(open) => !open && setOpenAt(null)}>
        <DialogContent
          closeLabel={t.close}
          aria-describedby={undefined}
          onKeyDown={handleKeyDown}
          // No DialogTrigger here, so return focus to whichever image opened the lightbox.
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            opener.current?.focus();
          }}
          className="max-w-[min(92vw,1100px,calc(85vh*4/3))] gap-0 rounded-md border-border bg-card p-3 sm:max-w-[min(92vw,1100px,calc(85vh*4/3))]"
        >
          <DialogTitle className="sr-only">{shoe.name}</DialogTitle>
          <Carousel opts={{ startIndex: openAt ?? 0, loop: true }} setApi={setApi}>
            <CarouselContent>
              {images.map((image, i) => (
                <CarouselItem key={image.src}>
                  <img
                    src={image.src}
                    alt={`${shoe.name} — ${i + 1}/${images.length}`}
                    width={image.width}
                    height={image.height}
                    className="aspect-[4/3] w-full rounded-sm object-contain"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious aria-label={t.prevPhoto} className="left-3" />
                <CarouselNext aria-label={t.nextPhoto} className="right-3" />
              </>
            )}
          </Carousel>
        </DialogContent>
      </Dialog>
    </div>
  );
}
