import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/basic-elements`);
});

/**
 * TC_REQ_01
 *
 * Verify entering valid text
 *
 * 1. Focus on "Required Input".
 * 2. Type valid alphanumeric text.
 * 3. Click outside (blur).
 * - Text is entered successfully; no error styling/message is displayed.
 */
test('TC_REQ_01 - Verify entering valid text', async ({ page }) => {
  const requiredInput = page.locator('input#required-input');
  const text = 'Sample text';

  await requiredInput.focus();
  await requiredInput.fill(text);
  await requiredInput.blur();

  await expect(requiredInput).toHaveValue(text);
  await expect(page.getByText('This field is required')).not.toBeVisible();
});

/**
 * TC_REQ_02
 *
 * Verify focus and blur without entering data (Empty field)
 *
 * 1. Focus on "Required Input".
 * 2. Immediately click outside the field or press Tab without typing.
 * - Field triggers required validation
 */
// test('TC_REQ_02 - Verify focus and blur without entering data (Empty field)', async ({
//   page,
// }) => {
//   const requiredInput = page.locator('input#required-input');

//   await requiredInput.focus();
//   await requiredInput.blur();

//   await expect(page.getByText('This field is required')).toBeVisible();
// });

/**
 * TC_REQ_03
 *
 * Verify entering only whitespace
 *
 * 1. Focus on "Required Input".
 * 2. Press Space multiple times.
 * 3. Click outside the field.
 * - Field treats whitespace-only as empty and displays required validation error.
 */
// test('TC_REQ_03 - Verify entering only whitespace', async ({ page }) => {
//   const requiredInput = page.locator('input#required-input');

//   await requiredInput.focus();
//   await page.keyboard.press('Space');
//   await page.keyboard.press('Space');
//   await page.keyboard.press('Space');
//   await requiredInput.blur();

//   await expect(page.getByText('This field is required')).toBeVisible();
// });

/**
 * TC_REQ_04
 *
 * Verify error clears upon entering valid input
 *
 * 1. Trigger the required error state (leave empty and blur).
 * 2. Click back and enter valid text.
 * - Error message disappear immediately or on blur.
 */
// test('TC_REQ_04 - Verify error clears upon entering valid input', async ({
//   page,
// }) => {
//   const requiredInput = page.locator('input#required-input');

//   await requiredInput.focus();
//   await requiredInput.blur();

//   await expect(page.getByText('This field is required')).toBeVisible();

//   await requiredInput.focus();
//   await requiredInput.fill('Sample text');
//   await requiredInput.blur();

//   await expect(page.getByText('This field is required')).not.toBeVisible();
// });
