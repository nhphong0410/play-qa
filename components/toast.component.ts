import { type Locator, type Page } from '@playwright/test';

export class ToastComponent {
  readonly page: Page;
  readonly toast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.toast = page.locator('ol.toaster li.toast').first();
  }

  async waitForVisible() {
    await this.toast.waitFor({ state: 'visible', timeout: 5000 });
  }

  async waitForHidden() {
    await this.toast.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async getMessageText(): Promise<string> {
    await this.waitForVisible();
    return await this.toast.innerText();
  }

  async getType(): Promise<'success' | 'error' | ''> {
    await this.waitForVisible();
    const toastType = await this.toast.getAttribute('data-type');
    if (toastType === 'success' || toastType === 'error') {
      return toastType;
    }
    return '';
  }
}
