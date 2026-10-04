import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  // Rule id + offending selectors: enough to find the element without dumping whole nodes.
  expect(violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target.join(' ')) }))).toEqual([]);
}

async function hydrated(page: Page) {
  await page.waitForSelector('astro-island:not([ssr])');
  await expect(page.locator('html')).not.toHaveClass(/catalog-pending/);
}

for (const [name, path] of [
  ['catalog', './'],
  ['wishlist', './?status=wish'],
  ['ru catalog', './ru/'],
]) {
  test(`a11y: ${name}`, async ({ page }) => {
    await page.goto(path);
    await hydrated(page);

    await expect(page.getByTestId('shoe-card').first()).toBeVisible();
    await expectNoViolations(page);
  });
}

test('a11y: owned pair (3D)', async ({ page }) => {
  await page.goto('./shoes/owned-3d/');
  await expect(page.locator('model-viewer')).toHaveJSProperty('loaded', true, { timeout: 30_000 });
  await expect(page.getByRole('radiogroup', { name: 'Colorway' })).toBeVisible();
  await expectNoViolations(page);
});

test('a11y: wishlist pair with the lightbox', async ({ page }) => {
  await page.goto('./shoes/wish-photos/');
  await hydrated(page);
  await expectNoViolations(page);

  await page.getByTestId('gallery-thumb').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expectNoViolations(page);
});

test('a11y: wishlist pair without a photo', async ({ page }) => {
  await page.goto('./ru/shoes/wish-no-photo/');
  await expect(page.getByTestId('photo-placeholder')).toBeVisible();
  await expectNoViolations(page);
});

test('a11y: 404', async ({ page }) => {
  await page.goto('./no-such-pair/');
  await expect(page.getByRole('link', { name: 'Back to the catalog' })).toBeVisible();
  await expectNoViolations(page);
});
