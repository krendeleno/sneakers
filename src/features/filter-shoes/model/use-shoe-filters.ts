import { useLayoutEffect, useMemo, useSyncExternalStore } from 'react';
import { filtersFromSearch, filtersToSearch, type ShoeFilters } from './filters';

// The query string is the filter state, so a filtered view can be shared as a link.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setFilters(next: ShoeFilters) {
  // Keep history.state: Astro's ClientRouter stores its navigation index there.
  window.history.replaceState(window.history.state, '', `${window.location.pathname}${filtersToSearch(next)}`);
  for (const listener of listeners) listener();
}

/**
 * Filter state read straight from the URL. The server render has no query (defaults); on hydration React
 * re-renders synchronously with the client's query before paint — no flash of the default tab, and the box
 * a shoe page morphs back into is already on the wall.
 */
export function useShoeFilters() {
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => '',
  );
  const filters = useMemo(() => filtersFromSearch(search), [search]);

  // Rendered the URL state: reveal the catalog (hidden by BaseLayout while the static defaults are on screen).
  useLayoutEffect(() => {
    if (search === window.location.search) document.documentElement.classList.remove('catalog-pending');
  }, [search]);

  return [filters, setFilters] as const;
}
