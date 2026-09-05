import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/basic-elements`);
});

/**
 * TC_BASIC_01
 *
 * Verify dynamic value display with alphanumeric text
 *
 * 1. Click on "Basic Text Input".
 * 2. Type a string of text.
 * 3. Observe the "Current value" display below the field.
 * - The text below the input dynamically and correctly updates.
 */
test('TC_BASIC_01 - Verify dynamic value display with alphanumeric text', async ({
  page,
}) => {
  const basicElementInput = page.locator('input#basic-input');
  const currentValueText = page.locator('p:below(input#basic-input)').first();

  await basicElementInput.click();
  await expect(basicElementInput).toBeFocused();
  await expect(currentValueText).toHaveText('Current value: (empty)');

  const text = `Hello World ${Math.random()}`;

  await basicElementInput.fill(text);
  await expect(basicElementInput).toHaveValue(text);
  await expect(currentValueText).toHaveText(`Current value: ${text}`);
});

/**
 * TC_BASIC_02
 *
 * Verify behavior on clearing input
 *
 * 1. Type text into the field.
 * 2. Delete all characters using Backspace / Delete
 * - The text below reverts to: Current value: (empty).
 */
test('TC_BASIC_02 - Verify behavior on clearing input', async ({ page }) => {
  const basicElementInput = page.locator('input#basic-input');
  const currentValueText = page.locator('p:below(input#basic-input)').first();

  await basicElementInput.fill('Test');
  await expect(currentValueText).toHaveText('Current value: Test');

  await basicElementInput.press('Control+A');
  await basicElementInput.press('Delete');
  await expect(currentValueText).toHaveText('Current value: (empty)');
});

/**
 * TC_BASIC_03
 *
 * Verify special characters and emojis
 *
 * 1. Enter special characters and emojis into the field.
 * - Input accepts characters; label updates accurately
 */
test('TC_BASIC_03 - Verify special characters and emojis', async ({ page }) => {
  const basicElementInput = page.locator('input#basic-input');
  const currentValueText = page.locator('p:below(input#basic-input)').first();
  const text = '@#$%^&*! 🚀😊';

  await basicElementInput.fill(text);
  await expect(basicElementInput).toHaveValue(text);
  await expect(currentValueText).toContainText(text);
});

/**
 * TC_BASIC_04
 *
 * Verify leading, trailing, and multiple spaces
 *
 * 1. Enter spaces before, between, and after words.
 * - Value reflects typed spaces as configured.
 */
test('TC_BASIC_04 - Verify leading, trailing, and multiple spaces', async ({
  page,
}) => {
  const basicElementInput = page.locator('input#basic-input');
  const currentValueText = page.locator('p:below(input#basic-input)').first();
  const text = '   Sample   text   ';

  await basicElementInput.fill(text);
  await expect(basicElementInput).toHaveValue(text);
  await expect(currentValueText).toContainText(text);
});
