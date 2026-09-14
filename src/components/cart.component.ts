import { Page, Locator, expect } from '@playwright/test';

export type CartItemData = {
  id: string;
  title: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export class CartComponent {
  readonly page: Page;
  readonly modal: Locator;
  readonly title: Locator;
  readonly subtitle: Locator;
  readonly itemCards: Locator;
  readonly totalText: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;
  readonly closeXButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.locator('div[role="dialog"]').filter({
      has: page.locator('h2', { hasText: 'Shopping Cart' }),
    });
    this.title = this.modal.locator('h2');
    this.subtitle = this.modal.locator('p.text-muted-foreground').first();
    this.itemCards = this.modal.locator('[data-cart-item]');
    this.totalText = this.modal.locator('.border-t').locator('span').last();
    this.continueShoppingButton = this.modal.locator('#continue-shopping');
    this.checkoutButton = this.modal.locator('#checkout-button');
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
        `h4:has-text("${identifier}"), [data-cart-item="${identifier}"]`,
      ),
    });
  }

  async getItemQuantity(identifier: string): Promise<number> {
    const item = this.getItemCard(identifier);
    const qtyText = await item
      .locator('[data-testid^="cart-quantity-"]')
      .textContent();
    return qtyText ? parseInt(qtyText.trim(), 10) : 0;
  }

  async increaseQuantity(identifier: string) {
    const item = this.getItemCard(identifier);
    const increaseBtn = item.locator('button[data-testid^="cart-increase-"]');
    await increaseBtn.click();
  }

  async decreaseQuantity(identifier: string) {
    const item = this.getItemCard(identifier);
    const decreaseBtn = item.locator('button[data-testid^="cart-decrease-"]');
    await decreaseBtn.click();
  }

  async removeItem(identifier: string) {
    const item = this.getItemCard(identifier);
    const removeBtn = item.locator('button[data-testid^="cart-remove-"]');
    await removeBtn.click();
  }

  async getTotalPrice(): Promise<number> {
    const rawTotal = (await this.totalText.textContent()) || '$0';
    return parseFloat(rawTotal.replace(/[^0-9.]/g, ''));
  }

  async getItemDetails(identifier: string): Promise<CartItemData> {
    const item = this.getItemCard(identifier);

    const id = (await item.getAttribute('data-cart-item')) || '';
    const title = (await item.locator('h4').textContent())?.trim() || '';

    const unitPriceText =
      (await item.locator('p.text-muted-foreground').textContent()) || '$0';
    const unitPrice = parseFloat(unitPriceText.replace(/[^0-9.]/g, ''));

    const quantity = await this.getItemQuantity(identifier);

    const lineTotalText =
      (await item.locator('div.text-right p.font-bold').textContent()) || '$0';
    const lineTotal = parseFloat(lineTotalText.replace(/[^0-9.]/g, ''));

    return { id, title, unitPrice, quantity, lineTotal };
  }

  async getAllItemDetails(): Promise<CartItemData[]> {
    const count = await this.getItemCount();
    const items: CartItemData[] = [];

    for (let i = 0; i < count; i++) {
      const card = this.itemCards.nth(i);
      const id = (await card.getAttribute('data-cart-item')) || '';
      const title = (await card.locator('h4').textContent())?.trim() || '';

      const unitPriceText =
        (await card.locator('p.text-muted-foreground').textContent()) || '$0';
      const unitPrice = parseFloat(unitPriceText.replace(/[^0-9.]/g, ''));

      const qtyText = await card
        .locator('[data-testid^="cart-quantity-"]')
        .textContent();
      const quantity = qtyText ? parseInt(qtyText.trim(), 10) : 0;

      const lineTotalText =
        (await card.locator('div.text-right p.font-bold').textContent()) ||
        '$0';
      const lineTotal = parseFloat(lineTotalText.replace(/[^0-9.]/g, ''));

      items.push({ id, title, unitPrice, quantity, lineTotal });
    }

    return items;
  }

  async clickContinueShopping() {
    await this.continueShoppingButton.click();
    await this.waitForClosed();
  }

  async clickCheckout() {
    await this.checkoutButton.click();
  }

  async closeViaXButton() {
    await this.closeXButton.click();
    await this.waitForClosed();
  }
}
