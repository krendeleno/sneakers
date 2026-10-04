import { Plus } from 'lucide-react';
import { type CSSProperties, useMemo, useRef } from 'react';
import { flushSync } from 'react-dom';
import { ShoeCard, type WallShoe } from '@/entities/shoe';
import {
  applyFilters,
  FilterBar,
  facetOptions,
  type ShoeFilters,
  sortShoes,
  switchStatus,
  useShoeFilters,
} from '@/features/filter-shoes';
import { getTranslations, type Locale } from '@/shared/i18n';
import { Button } from '@/shared/ui';
import './wall-light.css';

// A slot on the wall with its shelf plank. The last slot stretches its plank over the empty rest of the row
// (--rest = empty slots after it at the current column count), so every shelf runs the full width.
const SLOT =
  'relative pb-1.5 after:absolute after:inset-x-[-2px] after:bottom-0 after:h-1.5 after:bg-linear-to-b after:from-input after:to-border after:shadow-[0_6px_10px_-4px_rgb(0_0_0/0.8)] last:after:right-[calc(-2px_-_var(--rest)*(100%_+_0.25rem))]';

const shelve = (shoes: WallShoe[], filters: ShoeFilters) => sortShoes(applyFilters(shoes, filters), filters.sort);

// What the wall shows: the tab (decides the "next pair" slot) and the boxes in order.
const wallKey = (visible: WallShoe[], filters: ShoeFilters) => `${filters.status}:${visible.map((s) => s.id).join()}`;

export function ShoeCatalog({ shoes, locale }: { shoes: WallShoe[]; locale: Locale }) {
  const t = getTranslations(locale);
  const [filters, setFilters] = useShoeFilters();
  const running = useRef<ViewTransition>(null);

  const counts = useMemo(
    () => ({
      owned: shoes.filter((s) => s.status === 'owned').length,
      wish: shoes.filter((s) => s.status === 'wish').length,
    }),
    [shoes],
  );
  const options = useMemo(() => facetOptions(shoes, filters.status), [shoes, filters.status]);
  const visible = useMemo(() => shelve(shoes, filters), [shoes, filters]);

  const showNextSlot = filters.status === 'owned';
  const slots = visible.length + (showNextSlot ? 1 : 0);

  // Re-shelve with a view transition on every sort/filter change: boxes glide to their new slots, removed
  // ones are pulled off the shelf (names and keyframes in the shoebox entity's CSS).
  const update = (next: ShoeFilters) => {
    if (
      !document.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      wallKey(shelve(shoes, next), next) === wallKey(visible, filters)
    ) {
      // Nothing moves on the wall (or no motion wanted): just update the state and URL.
      setFilters(next);
      return;
    }

    // Fast typing: jump the previous transition to its end instead of stacking them.
    running.current?.skipTransition();

    const root = document.documentElement;
    root.dataset.reshelving = '';

    const transition = document.startViewTransition(() => flushSync(() => setFilters(next)));
    running.current = transition;
    transition.finished.finally(() => {
      if (running.current !== transition) return;

      running.current = null;
      delete root.dataset.reshelving;
    });
  };

  return (
    <div data-catalog className="space-y-6">
      <FilterBar filters={filters} options={options} counts={counts} onChange={update} locale={locale} />
      {visible.length === 0 ? (
        <div className="rounded-md border border-dashed border-input p-10 text-center in-data-reshelving:[view-transition-name:catalog-empty]">
          <p className="text-muted-foreground">{t.nothingFound}</p>
          <Button
            variant="link"
            onClick={() => update(switchStatus(filters, filters.status))}
            className="mt-3 h-auto p-0 underline"
          >
            {t.resetFilters}
          </Button>
        </div>
      ) : (
        // Wall of shoeboxes: tight gaps, shelf planks, graphite shades varying along the wall for unbranded boxes,
        // lit from above (wall-light.css: each box gets its piece of the light by --i and --cols).
        <div className="wall relative isolate">
          <ul
            className="grid grid-cols-1 gap-x-1 gap-y-4 pt-2 [--cols:1] [--rest:0] sm:grid-cols-2 sm:[--cols:2] sm:[--rest:var(--rest-2)] lg:grid-cols-3 lg:[--cols:3] lg:[--rest:var(--rest-3)]"
            style={{ '--rest-2': (2 - (slots % 2)) % 2, '--rest-3': (3 - (slots % 3)) % 3 } as CSSProperties}
          >
            {visible.map((shoe, i) => (
              <li
                key={shoe.id}
                className={`${SLOT} wall-slot even:[--shoebox-shade:#212121] [&:nth-child(3n)]:[--shoebox-shade:#242424]`}
                style={{ '--i': i } as CSSProperties}
              >
                {/* The first row (up to 3 columns) is above the fold */}
                <ShoeCard shoe={shoe} locale={locale} priority={i < 3} />
              </li>
            ))}
            {showNextSlot && (
              <li className={SLOT}>
                {/* An empty spot on the shelf, clickable as a whole */}
                <button
                  type="button"
                  onClick={() => update(switchStatus(filters, 'wish'))}
                  className="group flex aspect-5/3 w-full flex-col items-center justify-center gap-1 rounded-[3px] border border-dashed border-input text-muted-foreground transition-colors outline-none hover:border-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring in-data-reshelving:[view-transition-name:next-pair]"
                >
                  <Plus aria-hidden="true" className="mb-1 size-6 transition-colors group-hover:text-primary" />
                  <span className="font-medium">{t.nextPair}</span>
                  <span className="text-xs">{t.seeWishlist}</span>
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
