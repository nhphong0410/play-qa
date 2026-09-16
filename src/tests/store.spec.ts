import { test, expect } from '../fixtures/base.fixture';

test.describe('Store Page', () => {
  test.beforeEach(async ({ storePage, baseURL }) => {
    await storePage.goto(`${baseURL}/store`);
  });

  test('@smoke AUT_HDR_01: Initial page load & layout verification', async ({
    storePage,
  }) => {
    await expect(storePage.searchInput).toBeVisible();
    await expect(storePage.sortDropdown).toBeVisible();
    await expect(storePage.wishlistButton).toBeVisible();
    await expect(storePage.cartButton).toBeVisible();
    await expect(storePage.filtersSidebar).toBeVisible();
    await expect(storePage.resultsCountText).toBeVisible();
    await expect(await storePage.productCards.count()).toBeGreaterThan(0);
  });

  test('@smoke AUT_SRH_01: Search products by exact keyword', async ({
    storePage,
  }) => {
    const searchKeyword = 'mechanical gaming keyboard';

    await storePage.searchInput.fill(searchKeyword);
    await storePage.searchInput.press('Enter');

    await expect(storePage.productCards).toHaveCount(1);
    await expect(storePage.resultsCountText).toHaveText(
      'Showing 1 of 1 products',
    );
  });

  test('@smoke AUT_SRH_02: Search products by partial keyword', async ({
    storePage,
  }) => {
    const searchKeyword = 'gaming';

    await storePage.searchInput.fill(searchKeyword);
    await storePage.searchInput.press('Enter');

    const productCount = await storePage.productCards.count();
    expect(productCount).toBeGreaterThan(0);

    for (const productCard of await storePage.productCards.all()) {
      let isMatchtitle = false;
      let isMatchTags = false;
      let isMatchCategory = false;

      const title = await productCard.locator('.product-title').textContent();
      const tags = await productCard.locator('.product-tag').allTextContents();
      const category = await productCard.getAttribute('data-category');

      if (title && title.toLowerCase().includes(searchKeyword)) {
        isMatchtitle = true;
      }
      if (tags.some((tag) => tag.toLowerCase().includes(searchKeyword))) {
        isMatchTags = true;
      }
      if (category && category.toLowerCase().includes(searchKeyword)) {
        isMatchCategory = true;
      }

      expect(isMatchtitle || isMatchTags || isMatchCategory).toBe(true);
    }
  });

  test('@smoke AUT_SRT_01: Sort by price low to high', async ({
    storePage,
  }) => {
    await storePage.sortDropdown.click();
    await storePage.page
      .locator('div[role="option"]', { hasText: 'Price: Low to High' })
      .click();

    const selectedOption = await storePage.sortDropdown.textContent();
    expect(selectedOption?.trim()).toBe('Price: Low to High');

    const prices = [];
    for (const productCard of await storePage.productCards.all()) {
      const priceText = await productCard
        .locator('.product-price')
        .textContent();
      const price = Number(priceText?.replace(/[^0-9.]/g, ''));

      expect(Number.isNaN(price)).toBe(false);
      prices.push(price);
    }

    expect(storePage.sortDropdown).toHaveText('Price: Low to High');
    expect(prices.length).toBeGreaterThan(0);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('@smoke AUT_SRT_02: Sort by price high to low', async ({
    storePage,
  }) => {
    await storePage.sortDropdown.click();
    await storePage.page
      .locator('div[role="option"]', { hasText: 'Price: High to Low' })
      .click();

    await expect(storePage.sortDropdown).toHaveText('Price: High to Low');

    const prices = [];
    for (const productCard of await storePage.productCards.all()) {
      const priceText = await productCard
        .locator('.product-price')
        .textContent();
      const price = Number(priceText?.replace(/[^0-9.]/g, ''));

      expect(Number.isNaN(price)).toBe(false);
      prices.push(price);
    }

    expect(prices.length).toBeGreaterThan(0);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('@smoke AUT_SRT_03: Sort by highest rated', async ({ storePage }) => {
    await storePage.sortDropdown.click();
    await storePage.page
      .locator('div[role="option"]', { hasText: 'Highest Rated' })
      .click();

    await expect(storePage.sortDropdown).toHaveText('Highest Rated');

    const ratings: number[] = [];
    for (const productCard of await storePage.productCards.all()) {
      const ratingText = await productCard
        .locator('div[data-rating]')
        .getAttribute('data-rating');
      const rating = Number(ratingText);

      expect(Number.isNaN(rating)).toBe(false);
      ratings.push(rating);
    }

    expect(ratings.length).toBeGreaterThan(0);
    expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
  });

  test('@smoke AUT_SRT_04: Sort by most popular', async ({ storePage }) => {
    await storePage.sortDropdown.click();
    await storePage.page
      .locator('div[role="option"]', { hasText: 'Most Popular' })
      .click();

    await expect(storePage.sortDropdown).toHaveText('Most Popular');

    const reviewCounts: number[] = [];
    for (const productCard of await storePage.productCards.all()) {
      const reviewCountText = await productCard
        .locator('span[data-reviews-count]')
        .getAttribute('data-reviews-count');
      const reviewCount = Number(reviewCountText);

      expect(Number.isNaN(reviewCount)).toBe(false);
      reviewCounts.push(reviewCount);
    }

    expect(reviewCounts.length).toBeGreaterThan(0);
    expect(reviewCounts).toEqual([...reviewCounts].sort((a, b) => b - a));
  });

  test('@smoke AUT_FLT_01: Filter by single category', async ({
    storePage,
  }) => {
    const category = 'Electronics';
    const categoryFilter = storePage.filtersSidebar.getByText(category, {
      exact: true,
    });

    await categoryFilter.click();

    let shouldContinue = true;
    do {
      const productCards = await storePage.productCards.all();
      expect(productCards.length).toBeGreaterThan(0);

      for (const productCard of productCards) {
        const productCategory = await productCard.getAttribute('data-category');
        expect(productCategory?.toLowerCase()).toBe(category.toLowerCase());
      }

      if (!(await storePage.hasNextpage())) {
        shouldContinue = false;
        break;
      }

      await storePage.clickNextPage();
    } while (shouldContinue);
  });

  test('AUT_FLT_02: Filter by multiple categories', async ({ storePage }) => {
    const categories = ['Electronics', 'Gaming'];

    for (const category of categories) {
      await storePage.filtersSidebar
        .getByText(category, { exact: true })
        .click();
    }

    let shouldContinue = true;
    do {
      const productCards = await storePage.productCards.all();
      expect(productCards.length).toBeGreaterThan(0);

      for (const productCard of productCards) {
        const productCategory = await productCard.getAttribute('data-category');
        expect(categories.map((category) => category.toLowerCase())).toContain(
          productCategory?.toLowerCase(),
        );
      }

      if (!(await storePage.hasNextpage())) {
        shouldContinue = false;
        break;
      }

      await storePage.clickNextPage();
    } while (shouldContinue);
  });

  test('@smoke AUT_FLT_03: Filter by In Stock Only', async ({ storePage }) => {
    await storePage.filtersSidebar
      .getByText('In Stock Only', { exact: true })
      .click();

    let shouldContinue = true;
    do {
      const productCards = await storePage.productCards.all();
      expect(productCards.length).toBeGreaterThan(0);

      for (const productCard of productCards) {
        await expect(
          productCard.getByText('Out of Stock', { exact: true }),
        ).toHaveCount(0);
      }

      if (!(await storePage.hasNextpage())) {
        shouldContinue = false;
        break;
      }

      await storePage.clickNextPage();
    } while (shouldContinue);
  });

  test('@smoke AUT_FLT_04: Filter by price range', async ({ storePage }) => {
    const targetPrice = 100;

    await storePage.setSliderValueViaKeyboard(targetPrice);

    let shouldContinue = true;
    do {
      const productCards = await storePage.productCards.all();
      expect(productCards.length).toBeGreaterThan(0);

      for (const productCard of productCards) {
        const price = parseFloat(
          (await productCard.getAttribute('data-price')) || '0',
        );

        expect(price).toBeGreaterThanOrEqual(100);
      }

      if (!(await storePage.hasNextpage())) {
        shouldContinue = false;
        break;
      }

      await storePage.clickNextPage();
    } while (shouldContinue);
  });

  test('AUT_FLT_05: Filter by rating 4+ Stars', async ({ storePage }) => {
    const targetRating = '4+ Stars';

    await storePage.filtersSidebar
      .getByText(targetRating, { exact: true })
      .click();

    let shouldContinue = true;
    do {
      const productCards = await storePage.productCards.all();
      expect(productCards.length).toBeGreaterThan(0);

      for (const productCard of productCards) {
        const rating = parseFloat(
          (await productCard
            .locator('div[data-rating]')
            .getAttribute('data-rating')) || '0',
        );

        expect(rating).toBeGreaterThanOrEqual(4);
      }

      if (!(await storePage.hasNextpage())) {
        shouldContinue = false;
        break;
      }

      await storePage.clickNextPage();
    } while (shouldContinue);
  });

  test('AUT_FLT_06: Combined Multi-filter criteria', async ({ storePage }) => {
    const targetCategory = 'Electronics';
    const targetPrice = 200;

    await storePage.filtersSidebar
      .getByText(targetCategory, { exact: true })
      .click();
    await storePage.filtersSidebar
      .getByText('In Stock Only', { exact: true })
      .click();
    await storePage.setSliderValueViaKeyboard(targetPrice);

    const productCards = await storePage.productCards.all();
    expect(productCards.length).toBeGreaterThan(0);

    for (const productCard of productCards) {
      expect(
        (await productCard.getAttribute('data-category'))?.toLowerCase(),
      ).toBe(targetCategory.toLocaleLowerCase());
      await expect(
        productCard.getByText('Out of Stock', { exact: true }),
      ).toHaveCount(0);

      const price = parseFloat(
        (await productCard.getAttribute('data-price')) || '0',
      );
      expect(price).toBeGreaterThanOrEqual(targetPrice);
    }
  });

  test('@smoke AUT_CRD_01: Add In-Stock product to Cart from card', async ({
    storePage,
  }) => {
    await storePage.inStockOnlyFilter.click();

    const productCard = storePage.productCards.first();
    const addToCartButton = productCard.getByRole('button', {
      name: 'Add to Cart',
      exact: true,
    });

    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    await expect(storePage.cartButton).toContainText('1');
  });

  test('@smoke AUT_CRD_02: Out of Stock product button behavior', async ({
    storePage,
  }) => {
    let shouldContinue = true;
    do {
      const productCards = await storePage.productCards.all();

      for (const productCard of productCards) {
        const isOutOfStock = await productCard.getAttribute('data-in-stock');

        if (isOutOfStock && isOutOfStock == 'false') {
          const outOfStockButton = productCard.locator('button', {
            hasText: 'Out of Stock',
          });
          await expect(outOfStockButton).toBeVisible();
          await expect(outOfStockButton).toBeDisabled();

          await outOfStockButton.click({ force: true });
          shouldContinue = false;
          break;
        }
      }

      if (!shouldContinue || !(await storePage.hasNextpage())) {
        shouldContinue = false;
        break;
      }

      await storePage.clickNextPage();
    } while (shouldContinue);

    await expect(storePage.cartButton).toHaveAttribute('data-cart-count', '0');
  });

  test('@smoke AUT_CRD_03: Add product to Wishlist from card', async ({
    storePage,
  }) => {
    const productCard = storePage.productCards.first();
    const wishListButton = productCard.locator(
      '[aria-label="Add {name} to wishlist"]',
    );

    await wishListButton.click();

    await expect(storePage.wishlistButton).toHaveAttribute(
      'data-wishlist-count',
      '1',
    );
  });

  test('AUT_CRD_04: Remove product from Wishlist via card', async ({
    storePage,
  }) => {
    const productCard = storePage.productCards.first();
    const wishListButton = productCard.locator(
      '[aria-label="Add {name} to wishlist"]',
    );

    await wishListButton.click();
    await wishListButton.click();

    await expect(storePage.wishlistButton).toHaveAttribute(
      'data-wishlist-count',
      '0',
    );
  });

  test('AUT_CRD_05: Product metadata display', async ({ storePage }) => {
    const productCards = await storePage.productCards.all();
    expect(productCards.length).toBeGreaterThan(0);

    for (const productCard of productCards) {
      await expect(productCard.locator('img')).toBeVisible();
      await expect(productCard.locator('.product-title')).toHaveText(/\S+/);
      await expect(productCard.locator('[data-brand]')).toHaveText(/\S+/);
      await expect(productCard.locator('div[data-rating]')).toBeVisible();
      await expect(
        productCard.locator('span[data-reviews-count]'),
      ).toHaveAttribute('data-reviews-count', /^\d+$/);
      await expect(productCard.locator('.product-price')).toHaveText(
        /^\$\d+\.\d{2}$/,
      );
    }
  });
});
