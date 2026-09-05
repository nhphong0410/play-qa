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

  test('AUT_LOGIN_02: Successful login with valid credentials', async ({
    loginPage,
  }) => {
    const email = 'test@example.com';
    const password = 'password123';

    await loginPage.login(email, password);
    await loginPage.toast.waitForVisible();

    const toastType = await loginPage.toast.getType();
    const toastMessage = await loginPage.toast.getMessageText();

    await expect(toastType).toBe('success');
    await expect(toastMessage).toContain('Login successful!');
  });

  test('AUT_LOGIN_03: Successful login with "Remember me" checked', async ({
    loginPage,
  }) => {
    const email = 'test@example.com';
    const password = 'password123';

    await loginPage.login(email, password, true);
    await loginPage.toast.waitForVisible();

    const toastType = await loginPage.toast.getType();
    const toastMessage = await loginPage.toast.getMessageText();

    await expect(toastType).toBe('success');
    await expect(toastMessage).toContain('Login successful!');
  });

  test('AUT_LOGIN_04: Submit form with both fields empty', async ({
    loginPage,
  }) => {
    await loginPage.login();

    await expect(loginPage.emailErrorMessage).toBeVisible();
    await expect(loginPage.passwordErrorMessage).toBeVisible();
  });

  test('AUT_LOGIN_05: Submit with invalid email - missing "@"', async ({
    loginPage,
  }) => {
    const email = 'invalid-email';
    const password = 'password123';

    await loginPage.login(email, password);

    const validationMessage = await loginPage.emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage,
    );
    await expect(validationMessage).toContain(
      "Please include an '@' in the email address.",
    );
  });

  test('AUT_LOGIN_06: Submit with invalid email - missing domain', async ({
    loginPage,
  }) => {
    const email = 'invalid-email@';
    const password = 'password123';

    await loginPage.login(email, password);

    const validationMessage = await loginPage.emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage,
    );
    await expect(validationMessage).toContain(
      "Please enter a part following '@'.",
    );
  });

  test('AUT_LOGIN_07: Submit with valid email but empty password', async ({
    loginPage,
  }) => {
    const email = 'test@example.com';
    const password = '';

    await loginPage.login(email, password);

    await expect(loginPage.passwordErrorMessage).toBeVisible();
    await expect(loginPage.passwordErrorMessage).toHaveText(
      'Password is required',
    );
    await expect(loginPage.emailErrorMessage).not.toBeVisible();
  });

  test('AUT_LOGIN_08: Submit with empty email and entered password', async ({
    loginPage,
  }) => {
    const email = '';
    const password = 'password123';

    await loginPage.login(email, password);

    await expect(loginPage.emailErrorMessage).toBeVisible();
    await expect(loginPage.emailErrorMessage).toHaveText('Email is required');
    await expect(loginPage.passwordErrorMessage).not.toBeVisible();
  });

  test('AUT_LOGIN_09: Submit with email contain only spaces and valid password', async ({
    loginPage,
  }) => {
    const email = '   ';
    const password = 'password123';

    await loginPage.login(email, password);

    await expect(loginPage.emailErrorMessage).toBeVisible();
    await expect(loginPage.emailErrorMessage).toHaveText('Email is required');
    await expect(loginPage.passwordErrorMessage).not.toBeVisible();
  });

  test('AUT_LOGIN_10: Submit with valid email and password contain only spaces', async ({
    loginPage,
  }) => {
    const email = 'test@example.com';
    const password = '   ';

    await loginPage.login(email, password);

    await expect(loginPage.emailErrorMessage).not.toBeVisible();
    await expect(loginPage.passwordErrorMessage).toBeVisible();
    await expect(loginPage.passwordErrorMessage).toHaveText(
      'Password must be at least 6 characters',
    );
  });

  test('AUT_LOGIN_11: Verify password input masks characters', async ({
    loginPage,
  }) => {
    const passwordInputType =
      await loginPage.passwordInput.getAttribute('type');
    await expect(passwordInputType).toBe('password');
  });

  test('AUT_LOGIN_12: Verify password must be at least 6 characters long', async ({
    loginPage,
  }) => {
    const email = 'test@example.com';
    const password = 'pass';

    await loginPage.login(email, password);

    await expect(loginPage.passwordErrorMessage).toBeVisible();
    await expect(loginPage.passwordErrorMessage).toHaveText(
      'Password must be at least 6 characters',
    );
  });

  test('AUT_LOGIN_13: Keyboard accessibility (Submit on Enter key)', async ({
    loginPage,
  }) => {
    const email = 'test@example.com';
    const password = 'password123';

    await loginPage.login(email, password, false, true);

    const toastType = await loginPage.toast.getType();
    const toastMessage = await loginPage.toast.getMessageText();

    await expect(toastType).toBe('success');
    await expect(toastMessage).toContain('Login successful!');
  });
});
