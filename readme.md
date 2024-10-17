# Playwright Automation Framework

This document will guide you through setting up, running, and understanding this Playwright-based automation testing project. It covers all steps, including environment setup, test execution, and configuration.

## Project Overview

This automation framework uses:
- **Playwright** for browser automation.
- **dotenv** for environment variables.
- **faker.js** for generating fake test data.

The framework is designed to test various workflows like citizenship application, registration, marriage forms, and document verification.

## Project Structure

├── constants/ # Stores reusable locators 
| └── locators.js # Element selectors for the tests 
├── playwright-report/ # Automatically generated test reports
├── Screenshots/ # Test failure screenshots (auto-generated) 
├── test-results/ # Stores test run results 
├── tests/ # Test scripts directory 
│ ├── certifiedtrucopy.spec.js # Test for certified true copy form 
│ ├── citizenship.spec.js # Test for citizenship application form 
│ ├── finalmarriageform.spec.js # Test for final marriage form 
│ ├── registration.spec.js # Test for user registration 
│ ├── testwf.spec.js # Test workflow 
│ └── verificationdocument.spec.js # Test for document verification 
├── utils/ # Utility scripts 
│ └── helper.js # Helper functions used across tests 
├── .env # Environment variables (you need to create this) 
├── package.json # Project dependencies and npm scripts 
├── package-lock.json
├── playwright.config.js
└──  README.md # This documentation



---

## 1. Prerequisites

Make sure you have the following installed on your machine:
- **Node.js** (Download from (https://nodejs.org/)).
- **npm** (Installed automatically with Node.js).

---

## 2. Project Setup

### Step 1: Clone the Repository

If you're sharing this file, download the project folder and navigate to it via terminal or command line:

```bash
cd path/to/your-project

###Step 2: Install Dependencies    
Run the following command to install the required dependencies:


npm install/ npm i
This will install:

Playwright
dotenv
faker.js

Playwright: If not installed automatically, run:
npm init playwright@latest

dotenv: If not installed automatically, run:
npm install dotenv

faker.js: If not installed automatically, run:
npm install @faker-js/faker

Once the installation is complete, you're ready to move on to the next step.

This makes it clear that if the packages aren’t installed automatically, they can be installed manually using the provided commands.

##3: Install Playwright
Initialize Playwright by running:

npm init playwright@latest


##4. Set Up Environment Variables
Create a .env file in the root directory of your project. This file will store sensitive data like URLs and credentials.

Example .env file:

BASE_URL=https://example.com
USERNAME=testuser
PASSWORD=testpassword

How to use environment variables in tests:

require('dotenv').config();

const baseUrl = process.env.BASE_URL;
const username = process.env.USERNAME;

##5. Install faker.js
To generate random data for testing (like names, emails), install faker.js:


npm install @faker-js/faker

Example of generating random data:

const { faker } = require('@faker-js/faker');

const randomName = faker.name.fullName();
const randomEmail = faker.internet.email();
console.log(`Name: ${randomName}, Email: ${randomEmail}`);

##6. Running Tests
Once everything is set up, you can run the tests.

To run all tests:

npx playwright test

To run a specific test file:
For example, to run the citizenship test:


npx playwright test tests/filename.spec.js

Running in headful mode (non-headless):
By default, Playwright runs in headless mode. To run with a visible browser:

npx playwright test --headed


##7. Viewing Reports
After running the tests, Playwright generates an HTML report.

To view the report:

npx playwright show-report
This will open a detailed report in your browser, showing passed/failed tests, screenshots, and more.


##8. Test Artifacts
Screenshots: Playwright will automatically capture screenshots when tests fail. They are stored in the Screenshots/ folder.
Videos: If enabled, video recordings of test executions are stored in the tests/videos/ folder.
Reports: Test results and reports are saved in the playwright-report/ folder.


##9. Example Test Script
Here is an example of how the tests in this framework are structured. This script tests the citizenship application process:


const { test, expect } = require('@playwright/test');
require('dotenv').config();

test('First Test Case', async ({ page }) => {
  // Navigate to the base URL
  await page.goto(process.env.BASE_URL);

  // Fill the form
  await page.fill('#name', 'John Doe');
  await page.fill('#email', 'johndoe@example.com');
  await page.selectOption('#country', 'USA');
  
  // Submit the form
  await page.click('#submit');

  // Verify success message
  await expect(page).toHaveText('Thank you for your application!');
});


##10. Utilities
This project includes a utils/ directory containing helper functions to simplify repetitive tasks.

Example helper function:

module.exports = {
  login: async function (page, username, password) {
    await page.fill('#username', username);
    await page.fill('#password', password);
    await page.click('#login');
  },
};


You can use this helper function in your tests like so:

const { login } = require('../utils/helper');

test('Login Test', async ({ page }) => {
  await page.goto(process.env.BASE_URL);
  await login(page, process.env.USERNAME, process.env.PASSWORD);
  // Test login functionality here
});


##11. Troubleshooting
Common issues:
Missing .env file: Ensure that the .env file exists at the project root and contains all required environment variables npm install dotenv.

Playwright not installed: Make sure that Playwright is initialized and installed correctly by running npm init playwright@latest.

Dependencies not installed: If you encounter errors, run npm install to ensure all required packages are installed.