const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
//const { locators } = require('../constants/const');
import { faker } from '@faker-js/faker';

// Generate a random first name, last name, and combine them in an email
const firstName = faker.name.firstName();
const lastName = faker.name.lastName();
const email = faker.internet.email({ firstName, lastName, provider: 'yopmail.com' })

// Nigerian phone numbers start with prefixes such as 080, 081, 090, 070 followed by 7 digits
// Generate a phone number in the format +234XXXXXXXXXX

function generateNigerianPhoneNumber() {
  // Array of valid prefixes
  const prefixes = ['803', '806', '813']; // Common prefixes for Nigerian networks
  
  // Randomly select a prefix from the array
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  
  const randomPhoneBody = faker.string.numeric(7); // Generate a 7-digit number
  return `+234-${randomPrefix}-${randomPhoneBody.slice(0, 4)} ${randomPhoneBody.slice(4)}`; // Format the number
}

const formData = {
  firstName,
  lastName,
  phone: generateNigerianPhoneNumber(),
  address: 'Nigeria',
  // Generate email using first and last name with a specific domain
  email,
  email1: 'invalid-email',
  password: 'Error@123',
  confirmPassword: 'Error@123',
  securityAnswer: 'Black'
};


const screenshotDir = path.join(__dirname, '../Screenshots');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}


// function generateRandomEmail() {
//   const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
//   let username = '';
//   let domain = 'yopmail';
//   for (let i = 0; i < 8; i++) {
//     username += chars[Math.floor(Math.random() * chars.length)];
//   }
//   return `${username}@${domain}.com`;
// }

test.describe('Form Submission Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the registration page
    await page.goto('https://ecitibiz.evdpl.com/account/Register/', { waitUntil: 'networkidle' }); // Ensure the page is fully loaded

    // Navigate through the steps to the registration form
    await page.getByRole('tab', { name: 'Personal' }).click();
    await page.getByRole('button', { name: 'Personal Account (Marriage)' }).click();
    await page.getByRole('link', { name: 'Register Now' }).click();
  });

  /**
   * Negative Test Cases
   */

  test('Negative Test 1: Leave mandatory fields blank', async ({ page }) => {
    // Click the 'Register' button without filling any form fields
    //   await page.click('xpath=//*[@id="btnSubmitPersonalAccount"]')
    await page.waitForSelector('xpath=/html/body/div[5]/div/div[2]/div/form/p/span[1]/input')
    await page.click('xpath=/html/body/div[5]/div/div[2]/div/form/p/span[1]/input')
    await page.waitForTimeout(2000)
    await page.click('xpath=/html/body/div[5]/div/div[2]/div/form/p/span[1]/input')

    // Wait for error messages to appear on the screen (Adding explicit waits)
    await page.waitForSelector('text=First Name is Required');

    // Assert that all required field error messages are visible on the screen
    expect(await page.getByText(/First Name is Required/i).isVisible()).toBeTruthy();
    expect(await page.getByText(/Last Name is Required/i).isVisible()).toBeTruthy();
    expect(await page.getByText(/Gender is Required/i).isVisible()).toBeTruthy();
    expect(await page.getByText(/Address is Required/i).isVisible()).toBeTruthy();
    expect(await page.getByText(/Email is Required/i).isVisible()).toBeTruthy();
    expect(await page.getByText(/Security Question is Required./i).isVisible()).toBeTruthy();
    expect(await page.getByText(/Answer is Required./i).isVisible()).toBeTruthy();
    expect(await page.getByText(/Please Agree Terms of Use/i).isVisible()).toBeTruthy();

    // Take a screenshot before submission (optional for debugging)
    await page.screenshot({ path: path.join(screenshotDir, 'screenshot-leave-blank.png'), fullPage: true });
  });

  test('Negative Test 2: Invalid email format', async ({ page }) => {
    // Fill the form with invalid email
    await page.getByLabel('* First Name').fill(formData.firstName);
    await page.getByLabel('* Last Name').fill(formData.lastName);
    await page.getByLabel('* Phone Number').fill(formData.phone);
    await page.getByLabel('* Email Address').fill(formData.email1); // Invalid email
    await page.getByLabel('* Password').fill(formData.password);
    await page.getByLabel('* Confirm Password').fill(formData.confirmPassword);
    await page.locator('#ddlQuestionId').selectOption('2');
    await page.getByLabel('* Answer').fill(formData.securityAnswer);
    await page.locator('input#AgreeTermsOfUse').check(); // Agree to terms

    // Take a screenshot before submission (optional for debugging)
    await page.screenshot({ path: path.join(screenshotDir, 'screenshot-invalid-email.png'), fullPage: true });

    await page.waitForSelector('xpath=/html/body/div[5]/div/div[2]/div/form/p/span[1]/input')
    await page.click('xpath=/html/body/div[5]/div/div[2]/div/form/p/span[1]/input')

    // Wait for the "Invalid Email Address" message to appear
    await page.waitForSelector('text=Invalid Email Address', { timeout: 5000 });

    // Assert that the "Invalid Email Address" message is visible
    expect(await page.getByText('Invalid Email Address').isVisible()).toBeTruthy();
  });

  test('Negative Test 3: Password mismatch', async ({ page }) => {
    // Fill the form with mismatching passwords
    await page.getByLabel('* First Name').fill(formData.firstName);
    await page.getByLabel('* Last Name').fill(formData.lastName);
    await page.getByLabel('* Phone Number').fill(formData.phone);
    await page.getByLabel('* Email Address').fill(formData.email);
    await page.getByLabel('* Password').fill('Password1');
    await page.getByLabel('* Confirm Password').fill('Password2'); // Mismatch password
    await page.locator('#ddlQuestionId').selectOption('2');
    await page.getByLabel('* Answer').fill(formData.securityAnswer);
    await page.locator('input#AgreeTermsOfUse').check(); // Agree to terms

    // Take a screenshot before submission
    await page.screenshot({ path: path.join(screenshotDir, 'screenshot-password-mismatch.png'), fullPage: true });

    await page.waitForSelector('xpath=/html/body/div[5]/div/div[2]/div/form/p/span[1]/input')
    await page.click('xpath=/html/body/div[5]/div/div[2]/div/form/p/span[1]/input')

    // Wait for the error message related to password mismatch
    await page.waitForSelector('text=Password and Confirmation', { timeout: 5000 });

    // Assert that the "Password and Confirmation" message is visible on the screen
    expect(await page.getByText('Password and Confirmation').isVisible()).toBeTruthy();
  });

  /**
   * Positive Test Case
   */

  test.only('Positive Test: Successful registration', async ({ page }) => {
    // Fill the form with valid data
    await page.getByLabel('* First Name').fill(formData.firstName);
    await page.getByLabel('* Last Name').fill(formData.lastName);
    await page.getByLabel('Male', { exact: true }).check();
    await page.getByLabel('* Phone Number').fill(formData.phone);
    await page.getByLabel('* Address').fill(formData.address);
    await page.getByLabel('* Email Address').fill(formData.email);
    console.log(formData.email) // Valid email
    await page.getByLabel('* Password').fill(formData.password);
    await page.getByLabel('* Confirm Password').fill(formData.confirmPassword);
    console.log(formData.password && formData.confirmPassword)
    await page.locator('#ddlQuestionId').selectOption('2');
    await page.getByLabel('* Answer').fill(formData.securityAnswer);
    await page.locator('input#AgreeTermsOfUse').check();  // Agree to terms

    // Take a screenshot before form submission
    await page.screenshot({ path: path.join(screenshotDir, 'screenshot-register.png'), fullPage: true });

    // Capture the start time
    const startTime = Date.now();
    await page.waitForSelector('xpath=/html/body/div[5]/div/div[2]/div/form/p/span[1]/input')
    await page.click('xpath=/html/body/div[5]/div/div[2]/div/form/p/span[1]/input')

    // Confirm registration
    await page.getByRole('button', { name: 'Proceed' }).waitFor()
    await page.getByRole('button', { name: 'Proceed' }).click();

    // Wait for success message
    await page.waitForSelector('text=Congratulations', { timeout: 60000 });
    const successMessage = await page.locator('text=Congratulations').textContent();

    const endTime = Date.now();
    console.log('Form submitted successfully in', endTime - startTime, 'ms');

    // Assert that the success message is correct
    expect(successMessage).toContain('Congratulations! Your account has been created successfully.');
    // Take a screenshot before form submission
    await page.screenshot({ path: path.join(screenshotDir, 'screenshot-success-message.png'), fullPage: true });
  });
});
