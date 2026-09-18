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
    await expect(await storePage.productCards).not.toHaveCount(0);
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
    await expect(productCount).toBeGreaterThan(0);

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

      await expect(isMatchtitle || isMatchTags || isMatchCategory).toBe(true);
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
    await expect(selectedOption?.trim()).toBe('Price: Low to High');

    const prices = [];
    for (const productCard of await storePage.productCards.all()) {
      const priceText = await productCard
        .locator('.product-price')
        .textContent();
      const price = Number(priceText?.replace(/[^0-9.]/g, ''));

      await expect(Number.isNaN(price)).toBe(false);
      prices.push(price);
    }

    await expect(storePage.sortDropdown).toHaveText('Price: Low to High');
    await expect(prices.length).toBeGreaterThan(0);
    await expect(prices).toEqual([...prices].sort((a, b) => a - b));
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

      await expect(Number.isNaN(price)).toBe(false);
      prices.push(price);
    }

    await expect(prices.length).toBeGreaterThan(0);
    await expect(prices).toEqual([...prices].sort((a, b) => b - a));
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

      await expect(Number.isNaN(rating)).toBe(false);
      ratings.push(rating);
    }

    await expect(ratings.length).toBeGreaterThan(0);
    await expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
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

      await expect(Number.isNaN(reviewCount)).toBe(false);
      reviewCounts.push(reviewCount);
    }

    await expect(reviewCounts.length).toBeGreaterThan(0);
    await expect(reviewCounts).toEqual([...reviewCounts].sort((a, b) => b - a));
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
      await expect(productCards).not.toHaveLength(0);

      for (const productCard of productCards) {
        const productCategory = await productCard.getAttribute('data-category');
        await expect(productCategory?.toLowerCase()).toBe(
          category.toLowerCase(),
        );
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
      await expect(productCards.length).toBeGreaterThan(0);

      for (const productCard of productCards) {
        const productCategory = await productCard.getAttribute('data-category');
        await expect(
          categories.map((category) => category.toLowerCase()),
        ).toContain(productCategory?.toLowerCase());
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
      await expect(productCards.length).toBeGreaterThan(0);

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
      await expect(productCards.length).toBeGreaterThan(0);

      for (const productCard of productCards) {
        const price = parseFloat(
          (await productCard.getAttribute('data-price')) || '0',
        );

        await expect(price).toBeGreaterThanOrEqual(100);
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
      await expect(productCards.length).toBeGreaterThan(0);

      for (const productCard of productCards) {
        const rating = parseFloat(
          (await productCard
            .locator('div[data-rating]')
            .getAttribute('data-rating')) || '0',
        );

        await expect(rating).toBeGreaterThanOrEqual(4);
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
    await expect(productCards.length).toBeGreaterThan(0);

    for (const productCard of productCards) {
      await expect(
        (await productCard.getAttribute('data-category'))?.toLowerCase(),
      ).toBe(targetCategory.toLocaleLowerCase());
      await expect(
        productCard.getByText('Out of Stock', { exact: true }),
      ).toHaveCount(0);

      const price = parseFloat(
        (await productCard.getAttribute('data-price')) || '0',
      );
      await expect(price).toBeGreaterThanOrEqual(targetPrice);
    }
  });

  test('@smoke AUT_CRD_01: Add In-Stock product to Cart from card', async ({
    storePage,
  }) => {
    await storePage.toggleInStockOnly();

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
    const wishListButton = productCard.locator('button.wishlist-btn');

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
    const wishListButton = productCard.locator('button.wishlist-btn');

    await wishListButton.click();
    await wishListButton.click();

    await expect(storePage.wishlistButton).toHaveAttribute(
      'data-wishlist-count',
      '0',
    );
  });

  test('AUT_CRD_05: Product metadata display', async ({ storePage }) => {
    const productCards = await storePage.productCards.all();
    await expect(productCards.length).toBeGreaterThan(0);

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

  test('@smoke AUT_PAG_01: Initial pagination state on Page 1', async ({
    storePage,
  }) => {
    const pageOneButton = storePage.page.locator(
      'button[data-testid="page-1"]',
    );
    const previousButton = storePage.page.locator(
      'button[data-testid="prev-page"]',
    );
    const nextButton = storePage.page.locator(
      'button[data-testid="next-page"]',
    );

    await expect(pageOneButton).toContainClass('bg-primary');
    await expect(previousButton).toBeDisabled();
    await expect(nextButton).toBeEnabled();
  });

  test('@smoke AUT_PAG_02: Navigate to next page via page number', async ({
    storePage,
  }) => {
    const pageTwoButton = storePage.page.locator(
      'button[data-testid="page-2"]',
    );
    const previousButton = storePage.page.locator(
      'button[data-testid="prev-page"]',
    );

    await pageTwoButton.click();

    await expect(pageTwoButton).toContainClass('bg-primary');
    await expect(previousButton).toBeEnabled();
  });

  test('AUT_PAG_03: Reset pagination on new filter', async ({ storePage }) => {
    const pageOneButton = storePage.page.locator(
      'button[data-testid="page-1"]',
    );
    const pageTwoButton = storePage.page.locator(
      'button[data-testid="page-2"]',
    );
    const previousButton = storePage.page.locator(
      'button[data-testid="prev-page"]',
    );
    const nextButton = storePage.page.locator(
      'button[data-testid="next-page"]',
    );

    await nextButton.click();

    await expect(pageTwoButton).toContainClass('bg-primary');
    await expect(previousButton).toBeEnabled();

    await storePage.inStockOnlyFilter.click();

    await expect(pageOneButton).toContainClass('bg-primary');
    await expect(previousButton).toBeDisabled();
  });

  test('AUT_WSH_01: Open empty Wishlist modal', async ({ storePage }) => {
    await storePage.wishlistButton.click();
    await storePage.wishlistModal.waitForOpen();

    await expect(await storePage.wishlistModal.isOpen()).toBe(true);
    await expect(await storePage.wishlistModal.getItemCount()).toBe(0);
    await expect(await storePage.wishlistModal.modal).toContainText(
      'Your wishlist is empty',
    );
  });

  test('@smoke AUT_WSH_02: Open populated Wishlist modal', async ({
    storePage,
  }) => {
    await storePage.productCards.first().locator('button.wishlist-btn').click();
    await storePage.productCards.nth(2).locator('button.wishlist-btn').click();
    await storePage.wishlistButton.click();
    await storePage.wishlistModal.waitForOpen();

    await expect(storePage.wishlistModal.subtitle).toContainText(
      '2 item(s) in your wishlist',
    );
    await expect(await storePage.wishlistModal.getItemCount()).toBe(2);
  });

  test('@smoke AUT_WSH_03: Remove single item inside Wishlist modal', async ({
    storePage,
  }) => {
    await storePage.productCards.first().locator('button.wishlist-btn').click();
    await storePage.productCards.nth(2).locator('button.wishlist-btn').click();
    await storePage.wishlistButton.click();
    await storePage.wishlistModal.waitForOpen();

    await expect(await storePage.wishlistModal.getItemCount()).toBe(2);

    await storePage.wishlistModal.itemCards
      .first()
      .locator('button[data-testid*="wishlist-remove"]')
      .click();

    await expect(await storePage.wishlistModal.getItemCount()).toBe(1);
  });

  test('@smoke AUT_WSH_04: Add to Cart directly from Wishlist modal', async ({
    storePage,
  }) => {
    await storePage.toggleInStockOnly();
    await storePage.productCards.first().locator('button.wishlist-btn').click();
    await storePage.wishlistButton.click();
    await storePage.wishlistModal.waitForOpen();

    await storePage.wishlistModal.itemCards
      .first()
      .locator(
        'button[data-testid^="wishlist-add-cart-"], button:has-text("Add to Cart")',
      )
      .click();

    await expect(await storePage.getCartCount()).toBe(1);
  });

  test('AUT_WSH_05: Out of stock handling in Wishlist modal', async ({
    storePage,
  }) => {
    let shouldContinue = true;
    do {
      const productCards = await storePage.productCards.all();

      for (const productCard of productCards) {
        const isOutOfStock = await productCard.getAttribute('data-in-stock');

        if (isOutOfStock && isOutOfStock == 'false') {
          await productCard.locator('button.wishlist-btn').click();
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

    await storePage.wishlistButton.click();

    const itemCard = await storePage.wishlistModal.itemCards.first();
    const itemCardAddButton = await itemCard.locator(
      'button[data-testid^="wishlist-add-cart-"], button:has-text("Add to Cart")',
    );

    await expect(itemCard).toContainText('Out of Stock');
    await expect(itemCardAddButton).toBeDisabled();
  });

  test('AUT_WSH_06: Close Wishlist modal', async ({ storePage }) => {
    await storePage.wishlistButton.click();

    await expect(await storePage.wishlistModal.isOpen()).toBe(true);

    await storePage.wishlistModal.closeViaXButton();

    await expect(await storePage.wishlistModal.isOpen()).toBe(false);

    await storePage.wishlistButton.click();

    await expect(await storePage.wishlistModal.isOpen()).toBe(true);

    await storePage.wishlistModal.closeViaBottomButton();

    await expect(await storePage.wishlistModal.isOpen()).toBe(false);

    await storePage.wishlistButton.click();

    await expect(await storePage.wishlistModal.isOpen()).toBe(true);
  });

  test('@smoke AUT_CRT_01: Open Cart modal with items', async ({
    storePage,
  }) => {
    await storePage.inStockOnlyFilter.click();
    await storePage.productCards
      .first()
      .locator('button.add-to-cart-btn')
      .click();
    await storePage.productCards
      .nth(2)
      .locator('button.add-to-cart-btn')
      .click();
    await storePage.cartButton.click();
    await storePage.cartModal.waitForOpen();
    await expect(await storePage.cartModal.getItemCount()).not.toBe(0);

    const allItemDetails = await storePage.cartModal.getAllItemDetails();
    let totalPrice = 0;
    for (const itemDetails of allItemDetails) {
      await expect(itemDetails.quantity).toEqual(1);

      totalPrice += itemDetails.unitPrice;
    }

    await expect(await storePage.cartModal.getTotalPrice()).toEqual(totalPrice);
  });

  test('@smoke AUT_CRT_02: Increase item quantity [+] & verify math', async ({
    storePage,
  }) => {
    await storePage.inStockOnlyFilter.click();
    await storePage.productCards
      .first()
      .locator('button.add-to-cart-btn')
      .click();
    await storePage.cartButton.click();
    await storePage.cartModal.waitForOpen();
    await storePage.cartModal.itemCards
      .first()
      .locator('button[data-testid*="cart-increase-prod"]')
      .click();

    const allItemDetails = await storePage.cartModal.getAllItemDetails();
    let totalPrice = 0;
    for (const itemDetails of allItemDetails) {
      totalPrice += itemDetails.unitPrice * itemDetails.quantity;
    }

    await expect(storePage.cartModal.modal).toContainText(
      '2 item(s) in your cart',
    );
    await expect(await storePage.cartModal.getTotalPrice()).toEqual(totalPrice);
  });

  test('@smoke AUT_CRT_03: Decrease item quantity [-]', async ({
    storePage,
  }) => {
    await storePage.inStockOnlyFilter.click();
    await storePage.productCards
      .first()
      .locator('button.add-to-cart-btn')
      .click();
    await storePage.cartButton.click();
    await storePage.cartModal.waitForOpen();
    await storePage.cartModal.itemCards
      .first()
      .locator('button[data-testid*="cart-increase-prod"]')
      .click();
    await storePage.cartModal.itemCards
      .first()
      .locator('button[data-testid*="cart-decrease-prod"]')
      .click();

    const allItemDetails = await storePage.cartModal.getAllItemDetails();
    let totalPrice = 0;
    for (const itemDetails of allItemDetails) {
      totalPrice += itemDetails.unitPrice * itemDetails.quantity;
    }

    await expect(storePage.cartModal.modal).toContainText(
      '1 item(s) in your cart',
    );
    await expect(await storePage.cartModal.getTotalPrice()).toEqual(totalPrice);
  });

  test('AUT_CRT_04: Quantity lower bound check at Qty = 1', async ({
    storePage,
  }) => {
    await storePage.inStockOnlyFilter.click();
    await storePage.productCards
      .first()
      .locator('button.add-to-cart-btn')
      .click();
    await storePage.cartButton.click();
    await storePage.cartModal.waitForOpen();
    await storePage.cartModal.itemCards
      .first()
      .locator('button[data-testid*="cart-decrease-prod"]')
      .click();

    await expect(storePage.cartModal.modal).toContainText('Your cart is empty');
    await expect(storePage.cartModal.itemCards).toHaveCount(0);
  });

  test('@smoke AUT_CRT_05: Remove item via red trash icon', async ({
    storePage,
  }) => {
    await storePage.inStockOnlyFilter.click();
    await storePage.productCards
      .first()
      .locator('button.add-to-cart-btn')
      .click();
    await storePage.cartButton.click();
    await storePage.cartModal.waitForOpen();
    await storePage.cartModal.itemCards
      .first()
      .locator('button[data-testid*="cart-remove-prod"]')
      .click();

    await expect(storePage.cartModal.modal).toContainText('Your cart is empty');
    await expect(storePage.cartModal.itemCards).toHaveCount(0);
  });

  test('AUT_CRT_06: Multi-item total calculation and float precision', async ({
    storePage,
  }) => {
    await storePage.inStockOnlyFilter.click();

    await storePage.productCards
      .first()
      .locator('button.add-to-cart-btn')
      .click();
    await storePage.productCards
      .nth(2)
      .locator('button.add-to-cart-btn')
      .click({ clickCount: 2 });
    await storePage.cartButton.click();
    await storePage.cartModal.waitForOpen();

    const allItemDetails = await storePage.cartModal.getAllItemDetails();
    let totalPrice = 0;
    for (const itemDetails of allItemDetails) {
      totalPrice += itemDetails.unitPrice * itemDetails.quantity;
    }

    await expect(await storePage.cartModal.getTotalPrice()).toEqual(totalPrice);
  });

  test('AUT_CRT_07: "Continue Shopping" button action', async ({
    storePage,
  }) => {
    await storePage.inStockOnlyFilter.click();
    await storePage.productCards
      .first()
      .locator('button.add-to-cart-btn')
      .click();
    await storePage.cartButton.click();
    await storePage.cartModal.waitForOpen();
    await storePage.cartModal.clickContinueShopping();

    await expect(await storePage.cartModal.isOpen()).toBe(false);
    await expect(
      await storePage.cartButton.getAttribute('data-cart-count'),
    ).toEqual('1');
  });

  test('@smoke AUT_CRT_08: "Checkout" button action', async ({ storePage }) => {
    await storePage.inStockOnlyFilter.click();
    await storePage.productCards
      .first()
      .locator('button.add-to-cart-btn')
      .click();
    await storePage.cartButton.click();
    await storePage.cartModal.waitForOpen();
    await storePage.cartModal.clickCheckout();

    await expect(await storePage.toast.getMessageText()).toContain(
      'Proceeding to checkout',
    );
  });

  test('AUT_SYN_01: Cross-component Wishlist sync', async ({ storePage }) => {
    const productName = 'Premium Wireless Headphones';

    await storePage.searchInput.fill(productName);
    await storePage.toggleWishlistForProduct(productName);

    await expect(await storePage.getWishlistCount()).toEqual(1);

    await storePage.toggleWishlistForProduct(productName);

    await expect(await storePage.getWishlistCount()).toEqual(0);

    await storePage.toggleWishlistForProduct(productName);
    await storePage.wishlistButton.click();
    await storePage.wishlistModal.waitForOpen();
    await storePage.wishlistModal.removeItem(productName);
    await storePage.wishlistModal.closeViaXButton();
    await storePage.wishlistModal.waitForClosed();

    await expect(await storePage.getWishlistCount()).toEqual(0);
    await expect(
      await storePage.productCards.first().locator('button.wishlist-btn svg'),
    ).not.toContainClass('text-red-500');
  });
});
