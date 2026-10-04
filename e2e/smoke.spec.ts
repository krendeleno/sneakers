import { expect, type Page, test } from '@playwright/test';

// Pair count printed on a status tab: the number its accessible name ends with ("Wishlist 3").
async function tabCount(page: Page, name: RegExp) {
  const text = await page.getByRole('tab', { name }).textContent();
  return Number(text?.match(/\d+$/)?.[0]);
}

test('catalog filters and state goes to the URL', async ({ page }) => {
  await page.goto('./');

  await expect(page.getByRole('heading', { name: 'My collection' })).toBeAttached();
  const cards = page.getByTestId('shoe-card');
  await expect(cards).toHaveCount(await tabCount(page, /Collection/));

  await page.waitForSelector('astro-island:not([ssr])');
  await page.getByRole('tab', { name: /Wishlist/ }).click();
  await expect(page).toHaveURL(/status=wish/);
  const wishCount = await tabCount(page, /Wishlist/);
  await expect(cards).toHaveCount(wishCount);

  const nike = page.getByRole('toolbar', { name: 'Brand' }).getByRole('button', { name: 'Nike' });
  await nike.click();
  await expect(nike).toHaveAttribute('aria-pressed', 'true');
  await expect(page).toHaveURL(/brand=Nike/);
  await expect(cards.first()).toBeVisible();
  await expect(cards.filter({ hasNotText: 'Nike' })).toHaveCount(0);

  await nike.click();
  await expect(cards).toHaveCount(wishCount);
});

test('sorting by brand reshelves boxes and goes to the URL', async ({ page }) => {
  await page.goto('./?status=wish');
  await page.waitForSelector('astro-island:not([ssr])');

  const brands = page.getByTestId('shoe-card').locator('.shoebox-brand');
  await expect(brands.first()).toBeVisible();

  await page.getByRole('radio', { name: 'Brand' }).click();
  await expect(page).toHaveURL(/sort=brand/);
  const byBrand = await brands.allTextContents();
  expect(byBrand).toEqual(byBrand.toSorted((a, b) => a.localeCompare(b)));
  expect(byBrand.length).toBe(await tabCount(page, /Wishlist/));

  // The sort survives switching tabs; the default one isn't written to the URL.
  await page.getByRole('tab', { name: /Collection/ }).click();
  await expect(page).toHaveURL(/\?sort=brand$/);

  await page.getByRole('radio', { name: 'Newest' }).click();
  await expect(page).toHaveURL((url) => url.search === '');
});

test('empty "Next pair?" slot in the collection leads to the wishlist', async ({ page }) => {
  await page.goto('./');
  await page.waitForSelector('astro-island:not([ssr])');

  await page.getByRole('button', { name: /Next pair\?/ }).click();
  await expect(page).toHaveURL(/status=wish/);
  await expect(page.getByRole('tab', { name: /Wishlist/ })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('shoe-card')).toHaveCount(await tabCount(page, /Wishlist/));
  await expect(page.getByRole('button', { name: /Next pair\?/ })).toHaveCount(0);
});

test('Russian version under /ru/ and the language switcher', async ({ page }) => {
  await page.goto('./ru/');
  await expect(page.getByRole('heading', { name: 'Моя коллекция' })).toBeAttached();
  await expect(page.getByRole('link', { name: 'EN' })).toHaveAttribute('href', '/sneakers/');
});

test('3D model loads and shows colorways', async ({ page }) => {
  await page.goto('./shoes/owned-3d/');
  await expect(page.locator('model-viewer')).toHaveJSProperty('loaded', true, { timeout: 30_000 });
  await expect(page.getByRole('radiogroup', { name: 'Colorway' }).getByRole('radio')).toHaveCount(3);
});

test('wishlist pair gallery opens in a lightbox', async ({ page }) => {
  await page.goto('./shoes/wish-photos/');
  await page.waitForSelector('astro-island:not([ssr])');

  const thumbs = page.getByTestId('gallery-thumb');
  await expect(thumbs).toHaveCount(1);

  await thumbs.first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Next photo' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(thumbs.first()).toBeFocused();
});

test('pair without photos: placeholder instead of gallery and a "Where to buy" link', async ({ page }) => {
  await page.goto('./shoes/wish-no-photo/');
  await expect(page.getByTestId('photo-placeholder')).toContainText('Photo coming soon');
  await expect(page.getByRole('link', { name: 'Where to buy' })).toHaveAttribute('href', /thepoizon\.ru/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og\.png$/);
});

test('owned pair without a model: placeholder, no 3D viewer, no "Where to buy"', async ({ page }) => {
  await page.goto('./shoes/owned-no-model/');
  await expect(page.getByTestId('photo-placeholder')).toContainText('Photo coming soon');
  await expect(page.locator('model-viewer')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Where to buy' })).toHaveCount(0);
  await expect(
    page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Collection' }),
  ).toBeVisible();
});

test('breadcrumb and Back return to the catalog with the same filters', async ({ page }) => {
  await page.goto('./');
  await page.waitForSelector('astro-island:not([ssr])');

  await page.getByRole('tab', { name: /Wishlist/ }).click();
  await page.getByRole('toolbar', { name: 'Brand' }).getByRole('button', { name: 'Nike' }).click();
  await expect(page).toHaveURL(/status=wish.*brand=Nike/);

  const query = new URL(page.url()).search;
  const cards = page.getByTestId('shoe-card');
  const af1 = page.locator('[data-testid="shoe-card"][href$="shoes/wish-nike-1982/"]');
  const nikeCount = await cards.count();
  const crumb = page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Wishlist' });

  await af1.click();
  await expect(page).toHaveURL(/shoes\/wish-nike-1982/);
  await crumb.click();

  await expect(page).toHaveURL((url) => url.pathname === '/sneakers/' && url.search === query);
  await expect(cards).toHaveCount(nikeCount);
  await expect(af1).toBeInViewport();

  // The browser Back button restores the filters too.
  await af1.click();
  await expect(page).toHaveURL(/shoes\/wish-nike-1982/);
  await page.goBack();
  await expect(page).toHaveURL((url) => url.search === query);
  await expect(cards).toHaveCount(nikeCount);
  await expect(af1).toBeInViewport();

  // Direct landing: no list to return to, the crumb links to the pair's catalog tab.
  await page.goto('./ru/shoes/wish-no-photo/');
  await expect(
    page.getByRole('navigation', { name: 'Навигационная цепочка' }).getByRole('link', { name: 'Вишлист' }),
  ).toHaveAttribute('href', '/sneakers/ru/?status=wish');
});

test('filtered URL: catalog does not flash the default tab', async ({ page }) => {
  // Record the selected tab on the first frame the catalog is visible at all.
  await page.addInitScript(() => {
    const check = () => {
      const catalog = document.querySelector('[data-catalog]');
      if (catalog && Number(getComputedStyle(catalog).opacity) > 0) {
        const tab = catalog.querySelector('[role="tab"][aria-selected="true"]');
        document.documentElement.dataset.firstTab = tab?.textContent ?? '';
        return;
      }
      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
  });

  await page.goto('./?status=wish&brand=Nike');
  await expect(page.locator('html')).toHaveAttribute('data-first-tab', /^Wishlist/);
});

test('flipping between pairs: arrows, keyboard, disabled edges', async ({ page }) => {
  await page.goto('./shoes/wish-no-photo/');

  const nav = page.getByRole('navigation', { name: 'Pairs' });
  await expect(nav.getByTestId('pair-counter')).toHaveText('2 / 4');

  await nav.getByRole('link', { name: /^Next pair/ }).click();
  await expect(page).toHaveURL(/shoes\/wish-photos\/$/);
  await expect(nav.getByTestId('pair-counter')).toHaveText('3 / 4');

  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/shoes\/wish-nike-1982\/$/);

  // Last pair: "next" is not a link.
  await expect(nav.getByRole('link', { name: /^Next pair/ })).toHaveCount(0);

  await nav.getByRole('link', { name: /^Previous pair/ }).click();
  await expect(page).toHaveURL(/shoes\/wish-photos\/$/);
});

test('flipping stays within the tab: collection pairs, newest first', async ({ page }) => {
  await page.goto('./shoes/owned-3d/');

  const nav = page.getByRole('navigation', { name: 'Pairs' });
  await expect(nav.getByTestId('pair-counter')).toHaveText('1 / 2');
  await expect(nav.getByRole('link', { name: /^Previous pair/ })).toHaveCount(0);

  await nav.getByRole('link', { name: /^Next pair/ }).click();
  await expect(page).toHaveURL(/shoes\/owned-no-model\/$/);
  await expect(nav.getByTestId('pair-counter')).toHaveText('2 / 2');
  await expect(nav.getByRole('link', { name: /^Next pair/ })).toHaveCount(0);
});

test('footer notes where the images come from', async ({ page }) => {
  await page.goto('./ru/');
  await expect(page.getByTestId('images-note')).toContainText('сгенерированы ИИ');
});
