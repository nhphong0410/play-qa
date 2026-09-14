import { Page, Locator, expect } from '@playwright/test';
import { ToastComponent } from '../components/toast.component';
import { CartComponent } from '../components/cart.component';
import { WishlistComponent } from '../components/wishlist.component';

export type Category =
  | 'electronics'
  | 'gaming'
  | 'fitness'
  | 'furniture'
  | 'accessories';
export type RatingFilter = '4' | '3' | '2';
export type SortOption =
  | 'Most Popular'
  | 'Price: Low to High'
  | 'Price: High to Low'
  | 'Highest Rated';

export class StorePage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly sortDropdown: Locator;
  readonly wishlistButton: Locator;
  readonly cartButton: Locator;
  readonly filtersSidebar: Locator;
  readonly inStockOnlyFilter: Locator;
  readonly priceSlider: Locator;
  readonly minPriceLabel: Locator;
  readonly maxPriceLabel: Locator;
  readonly resultsCountText: Locator;
  readonly productCards: Locator;
  readonly prevPageButton: Locator;
  readonly nextPageButton: Locator;
  readonly paginationButtons: Locator;
  readonly wishlistModal: WishlistComponent;
  readonly cartModal: CartComponent;
  readonly toast: ToastComponent;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('#store-search-input');
    this.sortDropdown = page.locator('#sort-dropdown');
    this.wishlistButton = page.locator('#wishlist-button');
    this.cartButton = page.locator('#cart-button');
    this.filtersSidebar = page.locator('aside');
    this.inStockOnlyFilter = page.locator('#filter-in-stock');
    this.priceSlider = page
      .getByTestId('price-filter')
      .locator('[role="slider"]');
    this.minPriceLabel = page.getByTestId('min-price');
    this.maxPriceLabel = page.getByTestId('max-price');
    this.resultsCountText = page.locator(
      'text=/Showing \\d+ of \\d+ products/i',
    );
    this.productCards = page.locator(
      '.product-card[data-product-id^="prod_dyn_"]',
    );
    this.prevPageButton = page.getByTestId('prev-page');
    this.nextPageButton = page.getByTestId('next-page');
    this.paginationButtons = page.locator('button[data-testid^="page-"]');

    this.wishlistModal = new WishlistComponent(page);
    this.cartModal = new CartComponent(page);
    this.toast = new ToastComponent(page);
  }

  async goto(url: string = '/') {
    await this.page.goto(url, { waitUntil: 'load' });
  }

  async searchProducts(query: string) {
    await this.searchInput.fill(query);
  }

  async selectSortOption(option: SortOption) {
    await this.sortDropdown.click();
    await this.page.getByRole('option', { name: option }).click();
  }

  async getWishlistCount(): Promise<number> {
    const count = await this.wishlistButton.getAttribute('data-wishlist-count');
    return count ? parseInt(count, 10) : 0;
  }

  async getCartCount(): Promise<number> {
    const count = await this.cartButton.getAttribute('data-cart-count');
    return count ? parseInt(count, 10) : 0;
  }

  async toggleCategoryFilter(category: Category) {
    const categoryBtn = this.page.locator(
      `button[data-filter-type="category"][data-filter-value="${category}"]`,
    );
    await categoryBtn.click();
  }

  async toggleInStockOnly() {
    await this.inStockOnlyFilter.click();
  }

  async toggleRatingFilter(rating: RatingFilter) {
    const ratingBtn = this.page.locator(
      `button[data-filter-type="rating"][data-filter-value="${rating}"]`,
    );
    await ratingBtn.click();
  }

  getProductCardByTitle(title: string): Locator {
    return this.productCards.filter({
      has: this.page.locator('.product-title', { hasText: title }),
    });
  }

  getProductCardByIndex(index: number): Locator {
    return this.productCards.nth(index);
  }

  async addProductToCart(title: string) {
    const card = this.getProductCardByTitle(title);
    const addToCartBtn = card.locator('.add-to-cart-btn');
    await addToCartBtn.click();
  }

  async toggleWishlistForProduct(title: string) {
    const card = this.getProductCardByTitle(title);
    const wishlistBtn = card.locator('.wishlist-btn');
    await wishlistBtn.click();
  }

  async getProductDetails(title: string) {
    const card = this.getProductCardByTitle(title);
    const tags = await card.locator('.product-tag').allTextContents();
    
    return {
      id: await card.getAttribute('data-product-id'),
      title: await card.locator('.product-title').textContent(),
      tags: tags,
      category: await card.getAttribute('data-category'),
      price: parseFloat((await card.getAttribute('data-price')) || '0'),
      inStock: (await card.getAttribute('data-in-stock')) === 'true',
      brand: await card.locator('[data-brand]').getAttribute('data-brand'),
      rating: parseFloat(
        (await card.locator('[data-rating]').getAttribute('data-rating')) ||
          '0',
      ),
      reviewsCount: parseInt(
        (await card
          .locator('[data-reviews-count]')
          .getAttribute('data-reviews-count')) || '0',
        10,
      ),
      isBestseller: await card
        .locator('[data-badge-type="bestseller"]')
        .isVisible(),
      isOutOfStockBadgeVisible: await card
        .locator('[data-stock-status="out"]')
        .isVisible(),
      isAddToCartDisabled: await card.locator('.add-to-cart-btn').isDisabled(),
    };
  }

  async selectPage(pageNumber: number) {
    await this.page.getByTestId(`page-${pageNumber}`).click();
  }

  async clickNextPage() {
    await this.nextPageButton.click();
  }

  async clickPrevPage() {
    await this.prevPageButton.click();
  }
}
