import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';
import { StorePage } from '../pages/store.page';

type BaseFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  storePage: StorePage;
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
  storePage: async ({ page }, use) => {
    const storePage = new StorePage(page);
    await use(storePage);
  },
});

export { expect } from '@playwright/test';
