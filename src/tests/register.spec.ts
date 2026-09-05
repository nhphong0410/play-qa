import { test, expect } from '../fixtures/base.fixture';

test.describe('Register Page', () => {
  test.beforeEach(async ({ registerPage, baseURL }) => {
    await registerPage.goto(`${baseURL}/forms`);
  });

  test('REG_AUT_01: Verify initial UI & placeholders', async ({
    registerPage,
  }) => {
    await expect(registerPage.heading).toBeVisible();
    await expect(registerPage.subheading).toBeVisible();
    await expect(registerPage.fullNameInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.confirmPasswordInput).toBeVisible();
    await expect(registerPage.registerButton).toBeVisible();

    await expect(registerPage.fullNameInput).toHaveAttribute(
      'placeholder',
      'John Doe',
    );
    await expect(registerPage.emailInput).toHaveAttribute(
      'placeholder',
      'john@example.com',
    );
    await expect(registerPage.passwordInput).toHaveAttribute(
      'placeholder',
      'Min 6 characters',
    );
    await expect(registerPage.confirmPasswordInput).toHaveAttribute(
      'placeholder',
      'Re-enter password',
    );
    await expect(registerPage.registerButton).toBeEnabled();
  });

  test('REG_AUT_02: Successful registration with valid data', async ({
    registerPage,
  }) => {
    const fullName = 'John Doe';
    const email = 'john@example.com';
    const password = 'password123';
    const confirmPassword = 'password123';

    await registerPage.register(fullName, email, password, confirmPassword);
    await registerPage.toast.waitForVisible();

    const toastType = await registerPage.toast.getType();
    const toastMessage = await registerPage.toast.getMessageText();

    await expect(toastType).toBe('success');
    await expect(toastMessage).toContain('Registration successful!');
  });

  test('REG_AUT_03: Submit empty form', async ({ registerPage }) => {
    await registerPage.register();
    await registerPage.toast.waitForVisible();

    const toastType = await registerPage.toast.getType();
    const toastMessage = await registerPage.toast.getMessageText();

    await expect(toastType).toBe('error');
    await expect(toastMessage).toContain('Please fix the errors');

    await expect(registerPage.fullNameRequiredErrorMessage).toBeVisible();
    await expect(registerPage.emailRequiredErrorMessage).toBeVisible();
    await expect(registerPage.passwordRequiredErrorMessage).toBeVisible();
  });

  test('REG_AUT_04: Invalid email format - missing @', async ({
    registerPage,
  }) => {
    await registerPage.register(
      'John Doe',
      'invalid-email',
      'password123',
      'password123',
    );

    const validationMessage = await registerPage.emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage,
    );
    await expect(validationMessage).toContain(
      "Please include an '@' in the email address.",
    );
  });

  test('REG_AUT_05: Invalid email format - missing domain', async ({
    registerPage,
  }) => {
    await registerPage.register(
      'John Doe',
      'invalid-email@',
      'password123',
      'password123',
    );

    const validationMessage = await registerPage.emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage,
    );
    await expect(validationMessage).toContain(
      "Please enter a part following '@'.",
    );
  });

  test('REG_AUT_06: Password boundary - less than 6 characters', async ({
    registerPage,
  }) => {
    await registerPage.register(
      'John Doe',
      'john@example.com',
      '12345',
      '12345',
    );

    await registerPage.toast.waitForVisible();

    const toastType = await registerPage.toast.getType();
    const toastMessage = await registerPage.toast.getMessageText();

    await expect(toastType).toBe('error');
    await expect(toastMessage).toContain('Please fix the errors');

    await expect(registerPage.passwordMinLengthErrorMessage).toBeVisible();
  });

  test('REG_AUT_07: Password boundary - exactly 6 characters', async ({
    registerPage,
  }) => {
    await registerPage.register(
      'John Doe',
      'john@example.com',
      '123456',
      '123456',
    );

    await registerPage.toast.waitForVisible();

    const toastType = await registerPage.toast.getType();
    const toastMessage = await registerPage.toast.getMessageText();

    await expect(toastType).toBe('success');
    await expect(toastMessage).toContain('Registration successful!');
  });

  test('REG_AUT_08: Password and Confirm Password mismatch', async ({
    registerPage,
  }) => {
    await registerPage.register(
      'John Doe',
      'john@example.com',
      'Password123',
      'Mismatch456',
    );

    await expect(registerPage.confirmPasswordNoMatchErrorMessage).toBeVisible();
  });

  test('REG_AUT_09: Verify password fields masking UI / Security', async ({
    registerPage,
  }) => {
    await registerPage.passwordInput.fill('TestPass123');
    await registerPage.confirmPasswordInput.fill('TestPass123');

    await expect(registerPage.passwordInput).toHaveAttribute(
      'type',
      'password',
    );
    await expect(registerPage.confirmPasswordInput).toHaveAttribute(
      'type',
      'password',
    );
  });

  test('REG_AUT_10: Form submission via Enter key', async ({
    registerPage,
  }) => {
    await registerPage.register(
      'John Doe',
      'john@example.com',
      'password123',
      'password123',
      true,
    );

    await registerPage.toast.waitForVisible();

    const toastType = await registerPage.toast.getType();
    const toastMessage = await registerPage.toast.getMessageText();

    await expect(toastType).toBe('success');
    await expect(toastMessage).toContain('Registration successful!');
  });
});
