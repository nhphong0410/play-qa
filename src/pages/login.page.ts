import { type Page, type Locator } from '@playwright/test';
import { ToastComponent } from '../components/toast.component';

export class LoginPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly subheading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly loginButton: Locator;
  readonly emailErrorMessage: Locator;
  readonly passwordErrorMessage: Locator;
  readonly toast: ToastComponent;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Login Form' });
    this.subheading = page.getByText('Simple login form with basic validation');
    this.emailInput = page.locator('input#login-email');
    this.passwordInput = page.locator('input#login-password');
    this.rememberMeCheckbox = page.locator('button#remember');
    this.loginButton = page.locator('button#login-submit');
    this.emailErrorMessage = page.locator('p#login-email-error');
    this.passwordErrorMessage = page.locator('p#login-password-error');

    this.toast = new ToastComponent(page);
  }

  async goto(url: string) {
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  async login(
    email?: string,
    password?: string,
    rememberMe?: boolean,
    enterKey?: boolean,
  ) {
    await this.emailInput.fill(email ?? '');
    await this.passwordInput.fill(password ?? '');
    
    if (!!rememberMe) await this.rememberMeCheckbox.check();

    if (enterKey) {
      await this.passwordInput.focus();
      await this.page.keyboard.press('Enter');
    } else {
      await this.loginButton.click();
    }
  }
}
