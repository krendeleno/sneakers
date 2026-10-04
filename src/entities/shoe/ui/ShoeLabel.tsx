import type { CSSProperties } from 'react';
import { MY_PARAMS, MY_SIZE } from '@/shared/config';
import { getTranslations, type Locale } from '@/shared/i18n';
import { Badge } from '@/shared/ui';
import { barcodeFor, stickerFor } from '../lib';
import type { Shoe } from '../model';
import { SneakerSilhouette } from './SneakerSilhouette';
import './shoebox.css';

/** Vertical decorative barcode (bars run across the label edge) with a fake article number. */
function Barcode({ id }: { id: string }) {
  const { widths, article } = barcodeFor(id);

  let x = 0;
  const bars = widths.map((width, i) => {
    const bar = i % 2 === 0 && <rect key={x} y={x} height={width} width="1" />;
    x += width;
    return bar;
  });

  return (
    <span aria-hidden="true" className="shoebox-barcode">
      <svg aria-hidden="true" viewBox={`0 0 1 ${x}`} preserveAspectRatio="none" shapeRendering="crispEdges">
        {bars}
      </svg>
      <span>{article}</span>
    </span>
  );
}

type ShoeLabelProps = {
  shoe: Shoe;
  locale: Locale;
  /**
   * sm — the sticker on a box end in the wall (poster thumbnail, phrasing content only: it sits inside a link);
   * lg — the shoe page's info panel: the name is the page heading, "where to buy" is a stamp on it.
   */
  size?: 'sm' | 'lg';
  /** sm only: the poster thumbnail URL; none = a sneaker silhouette (wish pair without a photo yet) */
  thumb?: string;
  /** sm only: the box is in the first row of the wall, load its thumbnail right away (LCP candidate) */
  priority?: boolean;
};

/** The shoebox label sticker: brand, name, colorway · year, size, barcode; volt tag for wishlist pairs. */
export function ShoeLabel({ shoe, locale, size = 'sm', thumb, priority = false }: ShoeLabelProps) {
  const t = getTranslations(locale);
  const lg = size === 'lg';
  const Block = lg ? 'div' : 'span';
  const Name = lg ? 'h1' : 'span';
  const { tilt, age } = stickerFor(shoe.id, shoe.year);

  return (
    <Block
      className="shoebox-label"
      data-size={size}
      style={{ '--sticker-tilt': `${tilt}deg`, '--sticker-age': age } as CSSProperties}
    >
      {/* Sized by CSS (label height, square), so no width/height needed against layout shift */}
      {thumb ? (
        <img
          src={thumb}
          alt=""
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          className="shoebox-thumb"
        />
      ) : (
        !lg && (
          <span aria-hidden="true" className="shoebox-thumb" data-empty>
            <SneakerSilhouette className="shoebox-silhouette" />
          </span>
        )
      )}
      <Block className="shoebox-info">
        <span className="shoebox-brand">{shoe.brand}</span>
        <Name className="shoebox-name">{shoe.name}</Name>
        <span className="shoebox-colorway">
          {shoe.colors.join(' / ')} · {shoe.year}
        </span>
        <span className="shoebox-size">
          <span>{t.size}</span> <span className="shoebox-size-value">{shoe.size ?? MY_SIZE}</span>
          {/* Dropped on narrow wall boxes (see shoebox.css); the catalog header still shows it */}
          <span className="shoebox-foot">
            {' '}
            · {MY_PARAMS.footCm} {t.cm}
          </span>
        </span>
        {lg && shoe.buyUrl && (
          <a href={shoe.buyUrl} target="_blank" rel="noopener noreferrer" className="shoebox-stamp">
            {t.whereToBuy}
          </a>
        )}
        {shoe.status === 'wish' && <Badge>{t.wishlist}</Badge>}
      </Block>
      <Barcode id={shoe.id} />
    </Block>
  );
}
