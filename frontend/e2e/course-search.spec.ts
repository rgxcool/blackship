import { expect, test, type Page } from '@playwright/test';

interface MockCountry {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
  currency: string;
  currency_name: string;
  currency_symbol: string;
}

const mockCountries: MockCountry[] = [
  { id: 1, name: 'Afghanistan', iso2: 'AF', iso3: 'AFG', currency: 'AFN', currency_name: 'Afghan afghani', currency_symbol: '؋' },
  { id: 2, name: 'Aland Islands', iso2: 'AX', iso3: 'ALA', currency: 'EUR', currency_name: 'Euro', currency_symbol: '€' },
  { id: 3, name: 'Albania', iso2: 'AL', iso3: 'ALB', currency: 'ALL', currency_name: 'Albanian lek', currency_symbol: 'Lek' },
  { id: 4, name: 'Algeria', iso2: 'DZ', iso3: 'DZA', currency: 'DZD', currency_name: 'Algerian dinar', currency_symbol: 'دج' },
  { id: 5, name: 'American Samoa', iso2: 'AS', iso3: 'ASM', currency: 'USD', currency_name: 'United States dollar', currency_symbol: '$' },
  { id: 6, name: 'Andorra', iso2: 'AD', iso3: 'AND', currency: 'EUR', currency_name: 'Euro', currency_symbol: '€' },
  { id: 7, name: 'Angola', iso2: 'AO', iso3: 'AGO', currency: 'AOA', currency_name: 'Angolan kwanza', currency_symbol: 'Kz' },
  { id: 8, name: 'Anguilla', iso2: 'AI', iso3: 'AIA', currency: 'XCD', currency_name: 'East Caribbean dollar', currency_symbol: '$' },
  { id: 9, name: 'Antarctica', iso2: 'AQ', iso3: 'ATA', currency: 'AAD', currency_name: 'Antarctican dollar', currency_symbol: '$' },
  { id: 10, name: 'Antigua and Barbuda', iso2: 'AG', iso3: 'ATG', currency: 'XCD', currency_name: 'East Caribbean dollar', currency_symbol: '$' },
  { id: 14, name: 'Australia', iso2: 'AU', iso3: 'AUS', currency: 'AUD', currency_name: 'Australian dollar', currency_symbol: '$' },
  { id: 39, name: 'Canada', iso2: 'CA', iso3: 'CAN', currency: 'CAD', currency_name: 'Canadian dollar', currency_symbol: '$' },
  { id: 101, name: 'India', iso2: 'IN', iso3: 'IND', currency: 'INR', currency_name: 'Indian rupee', currency_symbol: '₹' },
  { id: 154, name: 'Nepal', iso2: 'NP', iso3: 'NPL', currency: 'NPR', currency_name: 'Nepalese rupee', currency_symbol: '₨' },
  { id: 232, name: 'United Kingdom', iso2: 'GB', iso3: 'GBR', currency: 'GBP', currency_name: 'British pound', currency_symbol: '£' },
];

function createTestJwt(): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      name: 'test-user',
      displayName: 'Test User',
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  ).toString('base64url');
  return `${header}.${payload}.signature`;
}

async function setupAuth(page: Page) {
  const token = createTestJwt();
  await page.addInitScript((jwt) => {
    window.localStorage.setItem('access_token', jwt);
  }, token);
}

async function setupCountryApiMocks(page: Page) {
  const recordedRequests: URL[] = [];

  await page.route('**/api/country/**', async (route) => {
    const url = new URL(route.request().url());
    recordedRequests.push(url);

    if (url.pathname === '/api/country/get-all-countries') {
      const pageNum = Number(url.searchParams.get('page') ?? '1');
      const limit = Number(url.searchParams.get('limit') ?? '10');
      const start = (pageNum - 1) * limit;
      const items = mockCountries.slice(start, start + limit);
      const total = mockCountries.length;
      const totalPages = Math.ceil(total / limit);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: items,
          pagination: {
            page: pageNum,
            limit,
            total,
            totalPages,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1,
          },
        }),
      });
      return;
    }

    if (url.pathname === '/api/country/get-countries') {
      const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
      const iso2 = (url.searchParams.get('iso2') ?? '').trim().toUpperCase();
      const iso3 = (url.searchParams.get('iso3') ?? '').trim().toUpperCase();
      const pageNum = Number(url.searchParams.get('page') ?? '1');
      const limit = Number(url.searchParams.get('limit') ?? '10');

      const matched = mockCountries.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.iso2.toLowerCase().includes(q) ||
          c.iso3.toLowerCase().includes(q),
      );

      matched.sort((a, b) => {
        const aPinned = (iso2 && a.iso2 === iso2) || (iso3 && a.iso3 === iso3) ? 0 : 1;
        const bPinned = (iso2 && b.iso2 === iso2) || (iso3 && b.iso3 === iso3) ? 0 : 1;
        if (aPinned !== bPinned) return aPinned - bPinned;
        return a.name.localeCompare(b.name);
      });

      const start = (pageNum - 1) * limit;
      const items = matched.slice(start, start + limit);
      const total = matched.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: items,
          pagination: {
            page: pageNum,
            limit,
            total,
            totalPages,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1,
          },
        }),
      });
      return;
    }

    if (url.pathname === '/api/country/get-country-by-code') {
      const code = (url.searchParams.get('code') ?? '').trim().toUpperCase();
      const country = mockCountries.find((c) => c.iso2 === code || c.iso3 === code);
      if (!country) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: `Country not found for code "${code}"` }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: country }),
      });
      return;
    }

    await route.fallback();
  });

  return recordedRequests;
}

test.describe('Country search and filtering', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('searches country by name, keeps selected label, and filters courses', async ({ page }) => {
    const requests = await setupCountryApiMocks(page);

    await page.goto('/courses');
    await expect(page.getByRole('heading', { name: 'Course directory' })).toBeVisible();
    await expect(page.locator('.results-copy strong')).toHaveText('9 featured courses');

    const countryTrigger = page.getByRole('button', { name: /^Country:/ });
    await expect(countryTrigger).toContainText('Any country');
    await countryTrigger.click();

    const searchInput = page.getByPlaceholder('Search country or ISO-3 code...');
    await searchInput.fill('nep');

    const nepalOption = page.getByRole('option', { name: 'Nepal (NPL)' });
    await expect(nepalOption).toBeVisible();
    await nepalOption.click();

    await expect(countryTrigger).toContainText('Nepal (NPL)');
    await expect(page.locator('.results-copy strong')).toHaveText('1 featured course');
    await expect(page.getByText('Bachelor of Computer Engineering (BE)')).toBeVisible();
    await expect(page.getByText('Master of Computing (Artificial Intelligence)')).toBeHidden();

    const searchReq = requests.find((u) => u.pathname === '/api/country/get-countries');
    expect(searchReq).toBeDefined();
    expect(searchReq?.searchParams.get('q')).toBe('nep');
    expect(searchReq?.searchParams.get('iso3')).toBe('NEP');
  });

  test('pins ISO-2 and ISO-3 matches and resets filter with Any country', async ({ page }) => {
    const requests = await setupCountryApiMocks(page);

    await page.goto('/courses');

    const countryTrigger = page.getByRole('button', { name: /^Country:/ });
    await countryTrigger.click();
    await page.getByPlaceholder('Search country or ISO-3 code...').fill('au');

    const australiaOption = page.getByRole('option', { name: 'Australia (AUS)' });
    await expect(australiaOption).toBeVisible();
    await australiaOption.click();

    await expect(countryTrigger).toContainText('Australia (AUS)');
    await expect(page.locator('.results-copy strong')).toHaveText('3 featured courses');
    await expect(page.getByText('Master of Computing (Artificial Intelligence)')).toBeVisible();

    const iso2Req = requests.find(
      (u) => u.pathname === '/api/country/get-countries' && u.searchParams.get('q') === 'au',
    );
    expect(iso2Req?.searchParams.get('iso2')).toBe('AU');

    await countryTrigger.click();
    await page.getByPlaceholder('Search country or ISO-3 code...').fill('GBR');
    const ukOption = page.getByRole('option', { name: 'United Kingdom (GBR)' });
    await expect(ukOption).toBeVisible();
    await ukOption.click();

    await expect(countryTrigger).toContainText('United Kingdom (GBR)');
    await expect(page.locator('.results-copy strong')).toHaveText('3 featured courses');
    await expect(page.getByText('MSc Advanced Computing')).toBeVisible();

    const iso3Req = requests.find(
      (u) => u.pathname === '/api/country/get-countries' && u.searchParams.get('q') === 'GBR',
    );
    expect(iso3Req?.searchParams.get('iso3')).toBe('GBR');

    await countryTrigger.click();
    await page.getByRole('option', { name: 'Any country' }).click();

    await expect(countryTrigger).toContainText('Any country');
    await expect(page.locator('.results-copy strong')).toHaveText('9 featured courses');
  });

  test('loads next page on scroll and shows empty state for unknown country', async ({ page }) => {
    await setupCountryApiMocks(page);

    await page.goto('/courses');

    const countryTrigger = page.getByRole('button', { name: /^Country:/ });
    await countryTrigger.click();

    const listbox = page.getByRole('listbox', { name: 'Country options' });
    await expect(page.getByRole('option', { name: 'Afghanistan (AFG)' })).toBeVisible();

    await listbox.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });

    await expect(page.getByRole('option', { name: 'India (IND)' })).toBeVisible();

    await page.getByPlaceholder('Search country or ISO-3 code...').fill('Atlantis');
    await expect(page.getByText('No country found.')).toBeVisible();
  });

  test('renders Country and University dropdown menus outside directory panel and filters university', async ({ page }) => {
    await setupCountryApiMocks(page);

    await page.goto('/courses');

    const panel = page.locator('.directory-panel');
    await expect(panel).toHaveCSS('overflow', 'visible');

    const countryTrigger = page.getByRole('button', { name: /^Country:/ });
    await countryTrigger.click();
    const countryMenu = page.locator('.searchable-select-menu');
    await expect(countryMenu).toBeVisible();
    const countryPanelBox = await panel.boundingBox();
    const countryMenuBox = await countryMenu.boundingBox();
    expect(countryPanelBox).not.toBeNull();
    expect(countryMenuBox).not.toBeNull();
    expect(countryMenuBox!.y + countryMenuBox!.height).toBeGreaterThan(
      countryPanelBox!.y + countryPanelBox!.height,
    );

    const universityTrigger = page.getByRole('button', { name: /^University:/ });
    await universityTrigger.click();
    const universityMenu = page.locator('.searchable-select-menu');
    await expect(universityMenu).toBeVisible();
    const universityMenuBox = await universityMenu.boundingBox();
    expect(universityMenuBox).not.toBeNull();
    expect(universityMenuBox!.y + universityMenuBox!.height).toBeGreaterThan(
      countryPanelBox!.y + countryPanelBox!.height,
    );

    await page.getByPlaceholder('Search university...').fill('Monash');
    await page.getByRole('option', { name: 'Monash University' }).click();

    await expect(universityTrigger).toContainText('Monash University');
    await expect(page.locator('.results-copy strong')).toHaveText('1 featured course');
    await expect(
      page.getByRole('region', { name: 'Course results' }).getByText('Monash University'),
    ).toBeVisible();
  });

  test('unselects Country and University via clear button or clicking checked option', async ({ page }) => {
    await setupCountryApiMocks(page);

    await page.goto('/courses');

    const countryTrigger = page.getByRole('button', { name: /^Country:/ });
    const universityTrigger = page.getByRole('button', { name: /^University:/ });

    // Select Country then unselect via Clear Country button
    await countryTrigger.click();
    await page.getByPlaceholder('Search country or ISO-3 code...').fill('nep');
    await page.getByRole('option', { name: 'Nepal (NPL)' }).click();
    await expect(countryTrigger).toContainText('Nepal (NPL)');
    await expect(page.locator('.results-copy strong')).toHaveText('1 featured course');

    await page.getByRole('button', { name: 'Clear Country' }).click();
    await expect(countryTrigger).toContainText('Any country');
    await expect(page.getByRole('button', { name: 'Clear Country' })).toBeHidden();
    await expect(page.locator('.results-copy strong')).toHaveText('9 featured courses');

    // Select Country then uncheck by clicking the selected option again
    await countryTrigger.click();
    await page.getByPlaceholder('Search country or ISO-3 code...').fill('nep');
    await page.getByRole('option', { name: 'Nepal (NPL)' }).click();
    await expect(countryTrigger).toContainText('Nepal (NPL)');

    await countryTrigger.click();
    const checkedCountry = page.getByRole('option', { name: 'Nepal (NPL)' });
    await expect(checkedCountry).toHaveAttribute('aria-selected', 'true');
    await checkedCountry.click();
    await expect(countryTrigger).toContainText('Any country');
    await expect(page.locator('.results-copy strong')).toHaveText('9 featured courses');

    // Select University then unselect via Clear University button
    await universityTrigger.click();
    await page.getByRole('option', { name: 'Monash University' }).click();
    await expect(universityTrigger).toContainText('Monash University');
    await expect(page.locator('.results-copy strong')).toHaveText('1 featured course');

    await page.getByRole('button', { name: 'Clear University' }).click();
    await expect(universityTrigger).toContainText('Any university');
    await expect(page.locator('.results-copy strong')).toHaveText('9 featured courses');

    // Select University then uncheck by clicking the selected option again
    await universityTrigger.click();
    await page.getByRole('option', { name: 'Monash University' }).click();
    await universityTrigger.click();
    const checkedUniversity = page.getByRole('option', { name: 'Monash University' });
    await expect(checkedUniversity).toHaveAttribute('aria-selected', 'true');
    await checkedUniversity.click();
    await expect(universityTrigger).toContainText('Any university');
    await expect(page.locator('.results-copy strong')).toHaveText('9 featured courses');
  });
});
