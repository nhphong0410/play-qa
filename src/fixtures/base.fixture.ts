import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

type BaseFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<BaseFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});

export {expect} from '@playwright/test';