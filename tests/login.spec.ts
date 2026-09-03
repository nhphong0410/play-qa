import { test, expect } from '../fixtures/base.fixture';

test.describe('Login Page', () => {
  test.beforeEach(async ({ loginPage, baseURL }) => {
    await loginPage.goto(`${baseURL}/forms`);
  });

  test('AUT_LOGIN_01: Verify initial UI state & placeholders', async ({
    loginPage,
  }) => {
    await expect(loginPage.heading).toBeVisible();
    await expect(loginPage.subheading).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.rememberMeCheckbox).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();

    await expect(loginPage.emailInput).toHaveAttribute(
      'placeholder',
      'your@email.com',
    );
    await expect(loginPage.passwordInput).toHaveAttribute(
      'placeholder',
      'Enter password',
    );

    await expect(loginPage.rememberMeCheckbox).toHaveAttribute(
      'aria-checked',
      'false',
    );
    await expect(loginPage.rememberMeCheckbox).toHaveAttribute(
      'data-state',
      'unchecked',
    );
    await expect(loginPage.loginButton).toBeEnabled();
  });
});
