import type { CSSProperties } from 'react';
import type { Locale } from '@/shared/i18n';
import { boxColor } from '../lib';
import type { WallShoe } from '../model';
import { ShoeLabel } from './ShoeLabel';

/**
 * A catalog card drawn as the end of a shoebox in a wall of boxes: lid, body and a label sticker.
 * `priority`: the box is above the fold, its thumbnail loads eagerly.
 */
export function ShoeCard({ shoe, locale, priority }: { shoe: WallShoe; locale: Locale; priority?: boolean }) {
  return (
    <a
      href={shoe.href}
      data-testid="shoe-card"
      data-status={shoe.status}
      className="shoebox"
      // View transition names (see shoebox.css): the poster morphs into the shoe page; the box is named
      // only while the catalog re-shelves.
      style={
        {
          '--box-color': boxColor(shoe.brand),
          '--shoebox-name': `box-${shoe.id}`,
          '--shoebox-poster': `shoe-${shoe.id}`,
        } as CSSProperties
      }
    >
      <span className="shoebox-box">
        <span aria-hidden="true" className="shoebox-side" />
        <span aria-hidden="true" className="shoebox-tissue" />
        <span className="shoebox-lid">
          <span aria-hidden="true" className="shoebox-lid-brand">
            {shoe.brand}
          </span>
        </span>
        <span className="shoebox-body">
          <ShoeLabel shoe={shoe} thumb={shoe.thumb} locale={locale} priority={priority} />
        </span>
      </span>
    </a>
  );
}
