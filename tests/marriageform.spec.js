// project-root/tests/marriageform.spec.js

const { test, expect } = require('@playwright/test');
const { locators } = require('../constants/locators');
import { HusbandLocators, WifeLocators } from '../constants/locators';
const path = require('path');
const fs = require('fs');

const screenshotDir = path.join(__dirname, '../Screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// Helper function to navigate to the marriage form
async function navigateToMarriageForm(page) {
  await page.goto('https://ecitibiz.evdpl.com/MyApplications');
  expect(await page.title()).toBe('My Applications');

  // Proceed to marriage application form
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.locator('#defaultNavbar1').getByText('Marriage', { exact: true }).click();
  await page.getByRole('link', { name: 'Apply For Marriage (New' }).click();

  // Select marriage registry and proceed
  await page.locator(locators.modalMrgPlaceSelection)
    .filter({ hasText: 'FEDERAL MARRIAGE REGISTRY' })
    .locator(locators.placeOfMarriage).check();
  await page.getByRole('link', { name: 'Proceed' }).click();

  // Handle the 'Requirement' popup
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Requirement' }).first().click();
  const page1 = await page1Promise;
  await page1.close(); // Close the popup window

  // Continue interaction with the main page
  await page.locator('#ApplyforOrdinaryMarriage').click();
  await page.getByRole('link', { name: 'Ok' }).click();
}

test.describe('Marriage Form Submission Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto('https://ecitibiz.evdpl.com/');

    // Click on LOGIN link and complete login steps
    await page.getByRole('link', { name: 'LOGIN' }).click();
    await page.getByRole('textbox', { name: 'Enter your Password' }).fill('Ecitibizabuja12@');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Secondary login if necessary
    await page.waitForSelector('text=Login');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByLabel('* Email Address').fill('williamheadwick2@yopmail.com');
    await page.getByLabel('* Password').fill('Error@123');
    await page.getByLabel('* Password').press('Enter');
    await page.getByRole('button', { name: 'Continue' }).click();
  });

  test.afterEach(() => {
    console.log('Test case finished.');
  });

  // Negative Scenario: Invalid file type upload
  test('TC 1: Form submission fails due to invalid file type upload', async ({ page }) => {
    await navigateToMarriageForm(page);
    await page.getByRole('heading', { name: 'Husband Details' }).click();
    await page.locator('#li_husbanduploadaffidavit input[type="file"]').first().setInputFiles('./invalid-file.txt');

    await page.getByRole('link', { name: 'Proceed' }).click();

    const errorMessageLocator = page.locator('text=Please complete all the required field(s).');
    await expect(errorMessageLocator).toBeVisible({ timeout: 10000 });
    await expect(errorMessageLocator).toHaveText('Please complete all the required field(s).');

    await page.getByRole('link', { name: 'Ok' }).click();
    const validationMessage = 'Please upload file with png/jpeg/pdf/word format';
    await expect(page.getByText(validationMessage)).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: path.join(screenshotDir, 'screenshot-invalid-file-type.png'), fullPage: true });
  });

  // Negative Scenario: Exceed max character limit
  test('TC 2: Form submission fails due to exceeding max character limit in fields', async ({ page }) => {
    await navigateToMarriageForm(page);
    await page.getByRole('heading', { name: 'Wife Details' }).click();

    const overLimitText = 'qwertyuiopasdfghjklzxcvbnmqwerty'; // 32 characters
    await page.locator('#WifeFirstName').fill(overLimitText);

    const actualEnteredText = await page.locator('#WifeFirstName').inputValue();
    expect(actualEnteredText.length).toBe(30);
    expect(actualEnteredText).toBe(overLimitText.substring(0, 30));

    await page.screenshot({ path: path.join(screenshotDir, 'screenshot-overlimit-text.png'), fullPage: true });
    console.log(overLimitText, actualEnteredText);
  });

  // Negative Scenario: Invalid email format
  test('TC 3: Form submission fails due to invalid email format', async ({ page }) => {
    await navigateToMarriageForm(page);
    await page.getByRole('heading', { name: 'Wife Details' }).click();

    await page.locator('#WifeEmail').fill('invalid-email-format');
    await page.getByRole('link', { name: 'Proceed' }).click();

    const errorMessageLocator = page.locator('text=Please complete all the required field(s).');
    await expect(errorMessageLocator).toBeVisible({ timeout: 10000 });
    await expect(errorMessageLocator).toHaveText('Please complete all the required field(s).');

    await page.getByRole('link', { name: 'Ok' }).click();
    const emailErrorLocator = page.locator('text=Invalid Email Address');
    await expect(emailErrorLocator).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: path.join(screenshotDir, 'screenshot-invalid-wife-email.png'), fullPage: true });
    console.log(emailErrorLocator);
  });

  // Negative Scenario: Missing required fields
  test('TC 4: Form submission fails due to missing required fields', async ({ page }) => {
    await navigateToMarriageForm(page);
    await page.getByRole('link', { name: 'Proceed' }).click();

    const errorMessageLocator = page.locator('text=Please complete all the required field(s).');
    await expect(errorMessageLocator).toBeVisible({ timeout: 10000 });
    await expect(errorMessageLocator).toHaveText('Please complete all the required field(s).');

    await page.screenshot({ path: path.join(screenshotDir, 'screenshot-blank-submit.png'), fullPage: true });
    console.log(errorMessageLocator);
    await page.getByRole('link', { name: 'Ok' }).click();
  });

  // Positive Scenario: Successful marriage application submission with valid data
  test('TC 5: Successful marriage application submission with valid data', async ({ page }) => {
    await navigateToMarriageForm(page);

    // Fill in marriage ceremony details
    await page.locator('#PlaceOfOathID').selectOption('1025');
    await page.locator('#DateOfOath').click();
    await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('9');
    await page.getByRole('link', { name: '25' }).click();
    await page.locator('#DateOfMrgCeleb').click();
    await page.getByRole('link', { name: '26' }).click();
    await page.locator('#drpTimeOfOath').selectOption('04:00:00 PM - 04:30:00 PM');
    await page.locator('#drpTimeOfMarriage').selectOption('02:30:00 PM - 03:00:00 PM');

    // Fill the form with valid data for husband
    // Fill other husband details
    await page.getByRole('heading', { name: 'Husband Details' }).click();
    await page.click(HusbandLocators.title);
    await page.selectOption(HusbandLocators.title, '1');
    await page.click(HusbandLocators.dateOfBirth);
    // await page.selectOption(HusbandLocators.datePickerYear, '1990');
    // await page.click(HusbandLocators.datePickerDay(6));
    await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1990');
    await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
    await page.getByRole('link', { name: '15' }).click();
    await page.fill(HusbandLocators.placeOfBirth, 'Brazil');
    await page.selectOption(HusbandLocators.status, '1');
    await page.setInputFiles(HusbandLocators.affidavitUpload, './Get_Started_With_Smallpdf-output.pdf');
    await page.selectOption(HusbandLocators.country, '30');
    await page.selectOption(HusbandLocators.stateOfOrigin, '485');
    await page.selectOption(HusbandLocators.identityType, '1');
    await page.fill(HusbandLocators.identityNumber, '1234567890');
    await page.setInputFiles(HusbandLocators.idUpload, './Get_Started_With_Smallpdf-output.pdf');
    await page.fill(HusbandLocators.occupation, 'Doctor');
    await page.fill(HusbandLocators.fatherFirstName, 'Wiily');
    await page.selectOption(HusbandLocators.fatherStatus, 'Living');
    await page.fill(HusbandLocators.fatherOccupation, 'Business');

    // Using file input locators
    await page.locator('#HusbandPassport').first().setInputFiles('./download.png');
    await page.locator('#HusbandBirthCertificate').first().setInputFiles('./Get_Started_With_Smallpdf-output.pdf');
    await page.locator('#li_husbandIndegeneDocument input[type="file"]').first().setInputFiles('./Get_Started_With_Smallpdf-output.pdf');

    // Fill the form with valid data for wife 
    await page.getByRole('heading', { name: 'Wife Details' }).click();
    await page.selectOption(WifeLocators.title, '1');
    await page.fill(WifeLocators.firstName, 'Labina');
    await page.fill(WifeLocators.lastName, 'Oakster');
    await page.click(WifeLocators.dateOfBirth);

    await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1992');
    await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('11');
    await page.getByRole('link', { name: '10' }).click();

    await page.fill(WifeLocators.placeOfBirth, 'Brazil');
    await page.selectOption(WifeLocators.status, '1');
    await page.setInputFiles(WifeLocators.affidavitUpload, './Get_Started_With_Smallpdf-output.pdf');
    await page.selectOption(WifeLocators.country, '30');
    await page.selectOption(WifeLocators.stateOfOrigin, '485');
    await page.selectOption(WifeLocators.identityType, '1');
    await page.fill(WifeLocators.identityNumber, '1215454520');
    await page.setInputFiles(WifeLocators.idUpload, './Get_Started_With_Smallpdf-output.pdf');
    await page.fill(WifeLocators.address, 'Brazil');
    await page.fill(WifeLocators.phone, '8153353198');
    await page.fill(WifeLocators.occupation, 'Housewife');
    await page.fill(WifeLocators.fatherFirstName, 'Hyryder');
    await page.selectOption(WifeLocators.fatherStatus, 'Living');
    await page.fill(WifeLocators.fatherOccupation, 'Business');


    await page.locator('li').filter({ hasText: '* Upload Your Passport Photograph Upload Upload Cancel' }).getByRole('textbox').first().setInputFiles('./download.png');
    await page.locator('li').filter({ hasText: '* Upload Birth Certificate/Declaration Of Age Upload Upload Cancel' }).getByRole('textbox').first().setInputFiles('./Get_Started_With_Smallpdf-output.pdf');
    //await page.locator('#li_wifeIndegeneDocument input[type="file"]').first().setInputFiles('./Get_Started_With_Smallpdf-output.pdf');
    await page.setInputFiles(WifeLocators.indigeneDocumentUpload, './Get_Started_With_Smallpdf-output.pdf');

    // Review and Submit
    await page.getByRole('link', { name: 'Proceed' }).click();
    await page.getByRole('link', { name: 'Submit' }).click();

    // Check for success message
    const successMessageLocator = page.locator('text=Your marriage application has been submitted successfully.');
    await expect(successMessageLocator).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: path.join(screenshotDir, 'screenshot-successful-submission.png'), fullPage: true });

    //Click on my application and delete submitted application 
    await page.getByText('W Welcome -William Headwick').click();
    await page.getByRole('link', { name: 'My Application' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    // Take a screenshot before form submission
    await page.screenshot({ path: path.join(screenshotDir, 'screenshot-myapplication.png'), fullPage: true });
    await page.getByText('Edit').click();
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByText('Delete').click();
    // Take a screenshot before form submission
    await page.screenshot({ path: path.join(screenshotDir, 'screenshot-delete-application.png'), fullPage: true });
    await page.getByRole('link', { name: 'Ok' }).click();
    await page.getByRole('link', { name: 'Ok' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForTimeout(2000);
  });
});
