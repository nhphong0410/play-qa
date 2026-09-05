import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';

type BaseFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
};

export const test = base.extend<BaseFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);
    await use(registerPage);
  },
});

export { expect } from '@playwright/test';
