import { type Page, type Locator } from '@playwright/test';
import { ToastComponent } from '../components/toast.component';

export class RegisterPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly subheading: Locator;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly fullNameRequiredErrorMessage: Locator;
  readonly emailRequiredErrorMessage: Locator;
  readonly passwordRequiredErrorMessage: Locator;
  readonly passwordMinLengthErrorMessage: Locator;
  readonly confirmPasswordNoMatchErrorMessage: Locator;
  readonly toast: ToastComponent;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', {
      name: 'Registration Form with Validation',
    });
    this.subheading = page.getByText(
      'Form with comprehensive client-side validation',
    );
    this.fullNameInput = page.locator('input#reg-name');
    this.emailInput = page.locator('input#reg-email');
    this.passwordInput = page.locator('input#reg-password');
    this.confirmPasswordInput = page.locator('input#reg-confirm');
    this.registerButton = page.locator('button#register-submit');
    this.fullNameRequiredErrorMessage = page.getByText('Name is required');
    this.emailRequiredErrorMessage = page.getByText('Email is required');
    this.passwordRequiredErrorMessage = page.getByText('Password is required');
    this.passwordMinLengthErrorMessage = page.getByText(
      'Password must be at least 6 characters',
    );
    this.confirmPasswordNoMatchErrorMessage = page.getByText(
      'Passwords do not match',
    );

    this.toast = new ToastComponent(page);
  }

  async goto(url: string) {
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  async register(
    fullName?: string,
    email?: string,
    password?: string,
    confirmPassword?: string,
    enterKey?: boolean,
  ) {
    await this.fullNameInput.fill(fullName ?? '');
    await this.emailInput.fill(email ?? '');
    await this.passwordInput.fill(password ?? '');
    await this.confirmPasswordInput.fill(confirmPassword ?? '');

    if (enterKey) {
      await this.confirmPasswordInput.focus();
      await this.page.keyboard.press('Enter');
    } else {
      await this.registerButton.click();
    }
  }
}
