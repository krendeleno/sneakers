import { useId } from 'react';
import type { ShoeStatus } from '@/entities/shoe';
import { getTranslations, type Locale } from '@/shared/i18n';
import { Input, Tabs, TabsList, TabsTrigger, ToggleGroup, ToggleGroupItem } from '@/shared/ui';
import { type FacetOptions, type ShoeFilters, type ShoeSort, SORTS, switchStatus } from '../model/filters';

type FilterBarProps = {
  filters: ShoeFilters;
  options: FacetOptions;
  /** Shoes per status in the whole collection, shown on the tabs */
  counts: Record<ShoeStatus, number>;
  onChange: (filters: ShoeFilters) => void;
  locale: Locale;
};

const STATUSES: ShoeStatus[] = ['owned', 'wish'];

export function FilterBar({ filters, options, counts, onChange, locale }: FilterBarProps) {
  const t = getTranslations(locale);
  const sortLabelId = useId();
  const sortLabels: Record<ShoeSort, string> = { newest: t.sortNewest, brand: t.sortBrand, color: t.sortColor };

  return (
    <div className="space-y-3">
      {/* Only the tab list: the filtered grid below is the shared "panel" for both tabs. */}
      <Tabs value={filters.status} onValueChange={(value) => onChange(switchStatus(filters, value as ShoeStatus))}>
        <TabsList
          variant="line"
          aria-label={t.status}
          className="w-full justify-start gap-6 border-b border-border p-0 group-data-[orientation=horizontal]/tabs:h-auto"
        >
          {STATUSES.map((status) => (
            <TabsTrigger
              key={status}
              value={status}
              // No TabsContent to point at (see above): Radix's aria-controls would reference a missing id.
              aria-controls={undefined}
              className="h-auto flex-none rounded-sm px-0 pt-0 pb-2 focus-visible:border-transparent focus-visible:outline-none group-data-[orientation=horizontal]/tabs:after:bottom-[-2px]"
            >
              {status === 'owned' ? t.collection : t.wishlist}
              <span className="text-muted-foreground">{counts[status]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="search"
          aria-label={t.search}
          placeholder={t.searchPlaceholder}
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          className="w-full min-w-0 flex-1 sm:w-auto"
        />
        <div className="flex items-center gap-2 sm:ml-auto">
          <span id={sortLabelId} className="text-sm text-muted-foreground">
            {t.sort}
          </span>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            aria-labelledby={sortLabelId}
            value={filters.sort}
            // Radix sends '' when the pressed item is clicked again: keep the current sort.
            onValueChange={(sort) => sort && onChange({ ...filters, sort: sort as ShoeSort })}
          >
            {SORTS.map((sort) => (
              <ToggleGroupItem key={sort} value={sort}>
                {sortLabels[sort]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>
      <ToggleGroup
        type="multiple"
        variant="outline"
        size="sm"
        spacing={2}
        aria-label={t.brand}
        value={filters.brands}
        onValueChange={(brands) => onChange({ ...filters, brands })}
        className="flex-wrap"
      >
        {options.brands.map((brand) => (
          <ToggleGroupItem key={brand} value={brand}>
            {brand}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <ToggleGroup
        type="multiple"
        variant="outline"
        size="sm"
        spacing={2}
        aria-label={t.color}
        value={filters.colors}
        onValueChange={(colors) => onChange({ ...filters, colors })}
        className="flex-wrap"
      >
        {options.colors.map((color) => (
          <ToggleGroupItem key={color} value={color} className="gap-1.5">
            <span className="size-3 rounded-full ring-1 ring-foreground/40" style={{ background: color }} />
            {color}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
