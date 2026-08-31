import { test, expect, Page } from '@playwright/test';

test.describe.serial('Text Input Suites', () => {
  let sharedPage: Page;

  test.beforeAll(async ({ browser, baseURL }) => {
    sharedPage = await browser.newPage();
    await sharedPage.goto(`${baseURL}/basic-elements`);
  });

  test.afterAll(async () => {
    await sharedPage.close();
  });

  /**
   * TC_UI_01
   *
   * Verify initial form elements and layout
   *
   * 1. Observe the title, subtitle, labels, and inputs.
   * - Header shows "Text Input" and subtitle "Various text input types and validation patterns".
   * - All 4 input fields are visible with correct labels.
   * - "Required Input" shows an asterisk (*).
   * - Basic Text Input displays Current value: (empty) below it.
   */
  test('TC_UI_01 - Verify initial form elements and layout', async () => {
    await expect(
      sharedPage.getByRole('heading', { level: 3, name: 'Text Input' }),
    ).toBeVisible();
    await expect(
      sharedPage.getByText('Various text input types and validation patterns'),
    ).toBeVisible();

    const labels = [
      'Basic Text Input',
      'Required Input *',
      'Max Length Input (10 chars)',
      'Pattern Input (numbers only)',
    ];
    const inputs = labels.map((label) => sharedPage.getByLabel(label));

    for (const input of inputs) {
      await expect(input).toBeVisible();
      await expect(input).toBeEmpty();
    }

    await expect(
      sharedPage.locator('p:below(input#basic-input)').first(),
    ).toHaveText('Current value: (empty)');
  });

  /**
   * TC_UI_02
   *
   * Verify placeholder texts
   *
   * 1. Check the placeholder in each field before typing.
   * - Field 1: Enter text here.
   * - Field 2: This field is required.
   * - Field 3: Max 10 characters.
   * - Field 4: Enter numbers only.
   */
  test('TC_UI_02 - Verify placeholder texts', async () => {
    const items = [
      ['Basic Text Input', 'Enter text here'],
      ['Required Input *', 'This field is required'],
      ['Max Length Input (10 chars)', 'Max 10 characters'],
      ['Pattern Input (numbers only)', 'Enter numbers only'],
    ];

    for (const [label, placeholder] of items) {
      const input = sharedPage.getByLabel(label);
      await expect(input).toHaveAttribute('placeholder', placeholder);
    }
  });

  /**
   * TC_UI_03
   *
   * Verify keyboard navigation (Tab order)
   *
   * 1. Focus on the Text Input section.
   * 2. Press Tab repeatedly.
   * - Focus moves sequentially: Field 1 →→ Field 2 →→ Field 3 →→ Field 4
   */
  test('TC_UI_03 - Verify keyboard navigation (Tab order)', async () => {
    const labels = [
      'Basic Text Input',
      'Required Input *',
      'Max Length Input (10 chars)',
      'Pattern Input (numbers only)',
    ];
    const inputs = labels.map((label) => sharedPage.getByLabel(label));

    await sharedPage.getByText('Text InputVarious text input').click();

    for (const input of inputs) {
      await sharedPage.keyboard.press('Tab');
      await expect(input).toBeFocused();
    }
  });
});
