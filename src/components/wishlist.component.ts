import { Page, Locator, expect } from '@playwright/test';

export type WishlistItemData = {
  id: string;
  title: string;
  brand: string;
  price: number;
};

export class WishlistComponent {
  readonly page: Page;
  readonly modal: Locator;
  readonly title: Locator;
  readonly subtitle: Locator;
  readonly itemCards: Locator;
  readonly closeBottomButton: Locator;
  readonly closeXButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.locator('div[role="dialog"]').filter({
      has: page.locator('h2', { hasText: 'Wishlist' }),
    });
    this.title = this.modal.locator('h2');
    this.subtitle = this.modal.locator('p.text-muted-foreground').first();
    this.itemCards = this.modal.locator('[data-wishlist-item]');
    this.closeBottomButton = this.modal.locator('#close-wishlist');
    this.closeXButton = this.modal
      .locator('button:has(svg.lucide-x), button:has-text("Close")')
      .filter({
        has: page.locator('.sr-only:text("Close")'),
      });
  }

  async isOpen(): Promise<boolean> {
    return await this.modal.isVisible();
  }

  async waitForOpen() {
    await expect(this.modal).toBeVisible();
  }

  async waitForClosed() {
    await expect(this.modal).toBeHidden();
  }

  async getSubtitleText(): Promise<string> {
    return (await this.subtitle.textContent())?.trim() || '';
  }

  async getItemCount(): Promise<number> {
    return await this.itemCards.count();
  }

  getItemCard(identifier: string): Locator {
    return this.itemCards.filter({
      has: this.page.locator(
        `h4:has-text("${identifier}"), [data-wishlist-item="${identifier}"]`,
      ),
    });
  }

  async addToCart(identifier: string) {
    const item = this.getItemCard(identifier);
    const addBtn = item.locator(
      'button[data-testid^="wishlist-add-cart-"], button:has-text("Add to Cart")',
    );
    await addBtn.click();
  }

  async removeItem(identifier: string) {
    const item = this.getItemCard(identifier);
    const removeBtn = item.locator(
      'button[data-testid^="wishlist-remove-"], button:has(svg.lucide-trash2)',
    );
    await removeBtn.click();
  }

  async getItemDetails(identifier: string): Promise<WishlistItemData> {
    const item = this.getItemCard(identifier);

    const id = (await item.getAttribute('data-wishlist-item')) || '';
    const title = (await item.locator('h4').textContent())?.trim() || '';
    const brand =
      (await item.locator('p.text-muted-foreground').textContent())?.trim() ||
      '';
    const priceText = (await item.locator('p.font-bold').textContent()) || '$0';
    const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

    return { id, title, brand, price };
  }

  async getAllItemDetails(): Promise<WishlistItemData[]> {
    const count = await this.getItemCount();
    const items: WishlistItemData[] = [];

    for (let i = 0; i < count; i++) {
      const card = this.itemCards.nth(i);
      const id = (await card.getAttribute('data-wishlist-item')) || '';
      const title = (await card.locator('h4').textContent())?.trim() || '';
      const brand =
        (await card.locator('p.text-muted-foreground').textContent())?.trim() ||
        '';
      const priceText =
        (await card.locator('p.font-bold').textContent()) || '$0';
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

      items.push({ id, title, brand, price });
    }

    return items;
  }

  async closeViaBottomButton() {
    await this.closeBottomButton.click();
    await this.waitForClosed();
  }

  async closeViaXButton() {
    await this.closeXButton.click();
    await this.waitForClosed();
  }
}
