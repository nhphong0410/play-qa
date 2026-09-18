# Play QA

Play QA is an end-to-end browser automation project built with [Playwright](https://playwright.dev/) and TypeScript. It verifies the forms and storefront workflows exposed by [play-qa.com](https://play-qa.com), using reusable page objects, component objects, and typed Playwright fixtures.

## What This Project Tests

The suite currently covers:

- Login form rendering, placeholders, required fields, email validation, password rules, password masking, the Remember Me control, successful submission, and Enter-key submission.
- Registration form rendering, placeholders, required fields, email validation, password length boundaries, password confirmation, password masking, successful submission, and Enter-key submission.
- Store layout and product loading.
- Product search by exact and partial keywords.
- Sorting by popularity, price, and rating.
- Category, stock, price-range, and rating filters, including combined filters.
- Pagination and product metadata.
- Cart behavior, including adding products, quantities, removal, totals, checkout, and out-of-stock handling.
- Wishlist behavior, including adding and removing products, modal content, moving items to the cart, and out-of-stock handling.
- Toast notifications and their success or error states.

## Technology Stack

- Node.js and npm
- TypeScript
- `@playwright/test` 1.62.x
- Playwright browser projects for Chromium, Firefox, and WebKit
- Playwright HTML reporter

## Project Structure

```text
.
├── playwright.config.ts       # Test directory, browsers, retries, reporting, and base URL
├── package.json               # Dependencies and npm scripts
├── src
│   ├── components
│   │   ├── cart.component.ts       # Shopping cart modal actions and data readers
│   │   ├── toast.component.ts      # Toast visibility, type, and message helpers
│   │   └── wishlist.component.ts   # Wishlist modal actions and data readers
│   ├── fixtures
│   │   └── base.fixture.ts         # Typed login, registration, and store fixtures
│   ├── pages
│   │   ├── login.page.ts           # Login page locators and actions
│   │   ├── register.page.ts        # Registration page locators and actions
│   │   └── store.page.ts           # Store locators, filters, sorting, and pagination
│   └── tests
│       ├── login.spec.ts           # Login scenarios
│       ├── register.spec.ts        # Registration scenarios
│       └── store.spec.ts           # Store, cart, and wishlist scenarios
├── playwright-report/          # Generated HTML report after a test run
└── test-results/               # Generated artifacts, traces, and failure context
```

## Prerequisites

Install the following before running the suite:

- Node.js 18 or newer
- npm
- Network access to `https://play-qa.com`

## Installation

Clone the repository, move into the project directory, and install dependencies:

```bash
npm install
npx playwright install
```

`npx playwright install` downloads the browser binaries used by the Chromium, Firefox, and WebKit projects. On Linux CI machines, use `npx playwright install --with-deps` when system browser dependencies are not already installed.

## Running Tests

Run the complete suite across all configured browsers:

```bash
npm test
```

Run only tests tagged `@smoke`:

```bash
npm run test:smoke
```

Run the Chromium project without retries:

```bash
npm run test:chromium
```

Run Chromium in headed mode for local debugging:

```bash
npm run test:dev
```

Open Playwright's interactive UI mode:

```bash
npm run test:debug
```

Useful direct Playwright commands include:

```bash
# Run one spec file
npx playwright test src/tests/store.spec.ts

# Run a test by title or tag
npx playwright test --grep "@smoke"

# Run one browser project
npx playwright test --project=firefox
```

## Reports and Debugging

The configured reporter creates an HTML report in `playwright-report/`. After a run, open it with:

```bash
npx playwright show-report
```

Additional failure artifacts are written to `test-results/`. Traces are collected on the first retry, and can be opened with:

```bash
npx playwright show-trace test-results/<test-result>/trace.zip
```

For a step-by-step investigation, use UI mode or headed Chromium mode. Screenshots, videos, and other artifacts can be enabled in `playwright.config.ts` if a debugging session needs them.

## Configuration

The main settings are in `playwright.config.ts`:

- Tests are discovered under `src/tests`.
- Tests run fully in parallel locally.
- CI retries failed tests twice, uses one worker, and forbids `test.only`.
- The base URL is `https://play-qa.com`.
- The default reporter is the HTML reporter.
- Desktop Chromium, Firefox, and WebKit projects are enabled.
- Mobile and branded-browser projects are included as commented examples and can be enabled when needed.

The test suite uses the configured `baseURL`, so tests navigate to paths such as `/forms` and `/` rather than repeating the host name throughout the code.

## CI Behavior

When the `CI` environment variable is set, Playwright:

- Retries failed tests twice.
- Runs with one worker for more predictable execution.
- Fails if a committed test contains `test.only`.

Example:

```bash
CI=true npm test
```

On PowerShell, set the variable for the current session before running the command:

```powershell
$env:CI = 'true'
npm test
```

## Known Considerations

The suite exercises a live hosted application, so results can be affected by browser differences, network timing, deployed data, and application state. A failing test should be reproduced with its browser project and inspected through the generated HTML report and failure artifacts before being treated as a test-code regression.

Generated directories such as `playwright-report/` and `test-results/` are outputs from test execution, not source code. Avoid editing them manually.
