const { test, expect, chromium, firefox, webkit } = require('@playwright/test');
const { locators } = require('../constants/locators');
import { HusbandLocators, WifeLocators } from '../constants/locators';
const path = require('path');
const fs = require('fs');
import * as dotenv from "dotenv";
import { faker } from '@faker-js/faker';

// Generate a random first name, last name, and combine them in an email
const firstName = faker.person.firstName('female');
const lastName = faker.person.lastName('female')
const fatherName = faker.person.fullName();
const wifefatherName = faker.person.fullName();
const email = faker.internet.email({ firstName, lastName, provider: 'yopmail.com' });
faker.person.firstName('female');


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

const phone = generateNigerianPhoneNumber()
const formData = {
  firstName,
  lastName,
  phone,
  fatherName,
  address: 'Nigeria',
  // Generate email using first and last name with a specific domain
  email,
  email1: 'invalid-email',
  wifefatherName
};


dotenv.config();

const LOGIN_URL = process.env.LOGIN_URL;
const LOGIN_EMAIL = process.env.LOGIN_EMAIL;
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD;
const LOGIN_PASSWORD_SECONDARY = process.env.LOGIN_PASSWORD_SECONDARY;
const MY_APPLICATION_URL = process.env.MY_APPLICATION_URL;


async function slowScrollTopBottom(page) {
  const scrollY = 500;
  const timeoutScroll = 500;

  // Get the total height of the page
  const pageHeight = await page.evaluate(() => document.body.scrollHeight);
  const viewportHeight = await page.evaluate(() => window.innerHeight);

  // Scroll down until the bottom of the page
  for (let currentPosition = 0; currentPosition + viewportHeight < pageHeight; currentPosition += scrollY) {
    await page.evaluate((scrollY) => window.scrollBy(0, scrollY), scrollY);
    await page.waitForTimeout(timeoutScroll);
  }

  // Scroll back to the top of the page
  for (let currentPosition = pageHeight; currentPosition > 0; currentPosition -= scrollY) {
    await page.evaluate((scrollY) => window.scrollBy(0, -scrollY), scrollY);
    await page.waitForTimeout(timeoutScroll);
  }

  // Ensure final scroll is back to the top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(timeoutScroll);
}



const screenshotDir = path.join(__dirname, '../Screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}


test.describe.configure({ mode: 'serial' });
test.describe('Marriage Form Submission Tests', () => {
  let browser;
  let context;
  let page;

  test.beforeAll(async () => {
    // Setup browser and context manually
    browser = await chromium.launch();
    context = await browser.newContext();
    page = await context.newPage();

    // Navigate to the login page
    await page.goto(LOGIN_URL);
    
    // Click on LOGIN link and complete login steps
    await page.getByRole('link', { name: 'LOGIN' }).click();
    await page.getByRole('textbox', { name: 'Enter your Password' }).fill(LOGIN_PASSWORD_SECONDARY);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Secondary login if necessary
    await page.waitForSelector('text=Login');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByLabel('* Email Address').type(LOGIN_EMAIL, { delay: 100 }); 
    await page.getByLabel('* Password').type(LOGIN_PASSWORD, { delay: 100 }); 
    await page.getByLabel('* Password').press('Enter');
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
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test.afterEach(async () => {
    // Reload page after each test to reset the state
    await page.reload();
  });

  // Negative Scenario: Invalid file type upload
  test('TC 1: Form submission fails due to invalid file type upload', async () => {
   
    // Fill in marriage ceremony details
    await page.locator('#PlaceOfOathID').selectOption('1025');
    await page.locator('#DateOfOath').click();
    await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
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
    await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1990');
    await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
    await page.getByRole('link', { name: '15' }).click();
    await page.type(HusbandLocators.placeOfBirth, 'Brazil', { delay: 100 });
    await page.selectOption(HusbandLocators.status, '1');
    await page.setInputFiles(HusbandLocators.affidavitUpload, './invalid-file.txt');
    await page.selectOption(HusbandLocators.country, '30');
    await page.selectOption(HusbandLocators.stateOfOrigin, '485');
    await page.selectOption(HusbandLocators.identityType, '1');
    await page.type(HusbandLocators.identityNumber, '1234567890', { delay: 100 });
    await page.setInputFiles(HusbandLocators.idUpload, './invalid-file.txt');
    await page.type(HusbandLocators.occupation, 'Doctor'), { delay: 100 };
    await page.type(HusbandLocators.fatherFirstName, fatherName, { delay: 100 });
    await page.selectOption(HusbandLocators.fatherStatus, 'Living');
    await page.type(HusbandLocators.fatherOccupation, 'Business', { delay: 100 });
    // Using file input locators
    await page.locator('#HusbandPassport').first().setInputFiles('./invalid-file.txt');
    await page.locator('#HusbandBirthCertificate').first().setInputFiles('./invalid-file.txt');
    await page.locator('#li_husbandIndegeneDocument input[type="file"]').first().setInputFiles('./invalid-file.txt');

    // Fill the form with valid data for wife 
    await page.getByRole('heading', { name: 'Wife Details' }).click();
    await page.selectOption(WifeLocators.title, '1');
    await page.type(WifeLocators.firstName, firstName, { delay: 100 });
    await page.type(WifeLocators.lastName, lastName, { delay: 100 });
    await page.click(WifeLocators.dateOfBirth);
    await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1992');
    await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('11');
    await page.getByRole('link', { name: '10' }).click();
    await page.type(WifeLocators.placeOfBirth, 'Brazil', { delay: 100 });
    await page.selectOption(WifeLocators.status, '1');
    await page.setInputFiles(WifeLocators.affidavitUpload, './invalid-file.txt');
    await page.selectOption(WifeLocators.country, '30');
    await page.selectOption(WifeLocators.stateOfOrigin, '485');
    await page.selectOption(WifeLocators.identityType, '1');
    await page.type(WifeLocators.identityNumber, '1215454520', { delay: 100 });
    await page.setInputFiles(WifeLocators.idUpload, './invalid-file.txt');
    await page.type(WifeLocators.address, 'Brazil', { delay: 100 });
    await page.type(WifeLocators.phone, phone, { delay: 100 });
    await page.type(WifeLocators.email, email, { delay: 100 });
    await page.type(WifeLocators.occupation, 'Housewife', { delay: 100 });
    await page.type(WifeLocators.fatherFirstName, wifefatherName, { delay: 100 });
    await page.selectOption(WifeLocators.fatherStatus, 'Living');
    await page.type(WifeLocators.fatherOccupation, 'Business', { delay: 100 });
    await page.locator('li').filter({ hasText: '* Upload Your Passport Photograph Upload Upload Cancel' }).getByRole('textbox').first().setInputFiles('./invalid-file.txt');
    await page.locator('li').filter({ hasText: '* Upload Birth Certificate/Declaration Of Age Upload Upload Cancel' }).getByRole('textbox').first().setInputFiles('./invalid-file.txt');
    //await page.locator('#li_wifeIndegeneDocument input[type="file"]').first().setInputFiles('./Dummy_PDF.pdf');
    await page.setInputFiles(WifeLocators.indigeneDocumentUpload, './invalid-file.txt');

    await page.getByRole('link', { name: 'Proceed' }).click();
    const errorMessageLocator = page.locator('text=Please complete all the required field(s).');
    await expect(errorMessageLocator).toBeVisible({ timeout: 10000 });
    await expect(errorMessageLocator).toHaveText('Please complete all the required field(s).');
    await page.getByRole('link', { name: 'Ok' }).click();
    const validationMessage = 'Please upload file with png/jpeg/pdf/word format';
    await expect(page.getByText(validationMessage).first()).toBeVisible({ timeout: 5000 });
    const validationMessage1 = 'Please upload file with png/jpeg format'; 
    await expect(page.getByText(validationMessage1).first()).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: path.join(screenshotDir, 'screenshot-invalid-file-type.png'), fullPage: true });
  });

  // Negative Scenario: Exceed max character limit
  test('TC 2: Form submission fails due to exceeding max character limit in fields', async () => {
    // Fill in marriage ceremony details
    await page.locator('#PlaceOfOathID').selectOption('1025');
    await page.locator('#DateOfOath').click();
    await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
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
    await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1990');
    await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
    await page.getByRole('link', { name: '15' }).click();
    await page.type(HusbandLocators.placeOfBirth, 'Brazil', { delay: 100 });
    await page.selectOption(HusbandLocators.status, '1');
    await page.setInputFiles(HusbandLocators.affidavitUpload, './Dummy_PDF.pdf');
    await page.selectOption(HusbandLocators.country, '30');
    await page.selectOption(HusbandLocators.stateOfOrigin, '485');
    await page.selectOption(HusbandLocators.identityType, '1');
    await page.type(HusbandLocators.identityNumber, '1234567890', { delay: 100 });
    await page.setInputFiles(HusbandLocators.idUpload, './Dummy_PDF.pdf');
    await page.type(HusbandLocators.occupation, 'Doctor'), { delay: 100 };
    await page.type(HusbandLocators.fatherFirstName, fatherName, { delay: 100 });
    await page.selectOption(HusbandLocators.fatherStatus, 'Living');
    await page.type(HusbandLocators.fatherOccupation, 'Business', { delay: 100 });
    // Using file input locators
    await page.locator('#HusbandPassport').first().setInputFiles('./download.png');
    await page.locator('#HusbandBirthCertificate').first().setInputFiles('./Dummy_PDF.pdf');
    await page.locator('#li_husbandIndegeneDocument input[type="file"]').first().setInputFiles('./Dummy_PDF.pdf');

    // Fill the form with valid data for wife 
    await page.getByRole('heading', { name: 'Wife Details' }).click();
    await page.selectOption(WifeLocators.title, '1');
    const overLimitText = 'qwertyuiopasdfghjklzxcvbnmqwerty'; // 32 characters
    await page.locator(WifeLocators.firstName).type(overLimitText);
    const actualEnteredText = await page.locator(WifeLocators.firstName).inputValue();
    expect(actualEnteredText.length).toBe(30);
    expect(actualEnteredText).toBe(overLimitText.substring(0, 30));
    //await page.screenshot({ path: path.join(screenshotDir, 'screenshot-overlimit-text.png'), fullPage: true });
    await page.locator(WifeLocators.lastName).type(overLimitText);
    const actualEnteredText1 = await page.locator(WifeLocators.lastName).inputValue();
    expect(actualEnteredText.length).toBe(30);
    expect(actualEnteredText).toBe(overLimitText.substring(0, 30));
    await page.screenshot({ path: path.join(screenshotDir, 'screenshot-overlimit-text.png'), fullPage: true });
    await page.click(WifeLocators.dateOfBirth);
    await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1992');
    await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('11');
    await page.getByRole('link', { name: '10' }).click();
    await page.type(WifeLocators.placeOfBirth, 'Brazil', { delay: 100 });
    await page.selectOption(WifeLocators.status, '1');
    await page.setInputFiles(WifeLocators.affidavitUpload, './Dummy_PDF.pdf');
    await page.selectOption(WifeLocators.country, '30');
    await page.selectOption(WifeLocators.stateOfOrigin, '485');
    await page.selectOption(WifeLocators.identityType, '1');
    await page.type(WifeLocators.identityNumber, '1215454520', { delay: 100 });
    await page.setInputFiles(WifeLocators.idUpload, './Dummy_PDF.pdf');
    await page.type(WifeLocators.address, 'Brazil', { delay: 100 });
    await page.type(WifeLocators.phone, phone, { delay: 100 });
    await page.type(WifeLocators.email, email, { delay: 100 });
    await page.type(WifeLocators.occupation, 'Housewife', { delay: 100 });
    await page.type(WifeLocators.fatherFirstName, wifefatherName, { delay: 100 });
    await page.selectOption(WifeLocators.fatherStatus, 'Living');
    await page.type(WifeLocators.fatherOccupation, 'Business', { delay: 100 });
    await page.locator('li').filter({ hasText: '* Upload Your Passport Photograph Upload Upload Cancel' }).getByRole('textbox').first().setInputFiles('./download.png');
    await page.locator('li').filter({ hasText: '* Upload Birth Certificate/Declaration Of Age Upload Upload Cancel' }).getByRole('textbox').first().setInputFiles('./Dummy_PDF.pdf');
    //await page.locator('#li_wifeIndegeneDocument input[type="file"]').first().setInputFiles('./Dummy_PDF.pdf');
    await page.setInputFiles(WifeLocators.indigeneDocumentUpload, './Dummy_PDF.pdf');   
    await page.screenshot({ path: path.join(screenshotDir, 'screenshot-overlimit-text.png'), fullPage: true });
    console.log("overLimitText-", overLimitText);
    console.log("EnteredText:--", actualEnteredText);
  
  });

  // Negative Scenario: Invalid email format
  test('TC 3: Form submission fails due to invalid email format', async () => {
    
   

    // Fill in marriage ceremony details
    await page.locator('#PlaceOfOathID').selectOption('1025');
    await page.locator('#DateOfOath').click();
    await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
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
    await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1990');
    await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
    await page.getByRole('link', { name: '15' }).click();
    await page.type(HusbandLocators.placeOfBirth, 'Brazil', { delay: 100 });
    await page.selectOption(HusbandLocators.status, '1');
    await page.setInputFiles(HusbandLocators.affidavitUpload, './Dummy_PDF.pdf');
    await page.selectOption(HusbandLocators.country, '30');
    await page.selectOption(HusbandLocators.stateOfOrigin, '485');
    await page.selectOption(HusbandLocators.identityType, '1');
    await page.type(HusbandLocators.identityNumber, '1234567890', { delay: 100 });
    await page.setInputFiles(HusbandLocators.idUpload, './Dummy_PDF.pdf');
    await page.type(HusbandLocators.occupation, 'Doctor'), { delay: 100 };
    await page.type(HusbandLocators.fatherFirstName, fatherName, { delay: 100 });
    await page.selectOption(HusbandLocators.fatherStatus, 'Living');
    await page.type(HusbandLocators.fatherOccupation, 'Business', { delay: 100 });
  
    // Using file input locators
    await page.locator('#HusbandPassport').first().setInputFiles('./download.png');
    await page.locator('#HusbandBirthCertificate').first().setInputFiles('./Dummy_PDF.pdf');
    await page.locator('#li_husbandIndegeneDocument input[type="file"]').first().setInputFiles('./Dummy_PDF.pdf');

    // Fill the form with valid data for wife 
    await page.getByRole('heading', { name: 'Wife Details' }).click();
    await page.selectOption(WifeLocators.title, '1');
    await page.type(WifeLocators.firstName, firstName, { delay: 100 });
    await page.type(WifeLocators.lastName, lastName, { delay: 100 });
    await page.click(WifeLocators.dateOfBirth);
    
    await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1992');
    await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('11');
    await page.getByRole('link', { name: '10' }).click();
    
    await page.type(WifeLocators.placeOfBirth, 'Brazil', { delay: 100 });
    await page.selectOption(WifeLocators.status, '1');
    await page.setInputFiles(WifeLocators.affidavitUpload, './Dummy_PDF.pdf');
    await page.selectOption(WifeLocators.country, '30');
    await page.selectOption(WifeLocators.stateOfOrigin, '485');
    await page.selectOption(WifeLocators.identityType, '1');
    await page.type(WifeLocators.identityNumber, '1215454520', { delay: 100 });
    await page.setInputFiles(WifeLocators.idUpload, './Dummy_PDF.pdf');
    await page.type(WifeLocators.address, 'Brazil', { delay: 100 });
    await page.type(WifeLocators.phone, phone, { delay: 100 });
    await page.type(WifeLocators.email, formData.email1, { delay: 100 });
    await page.type(WifeLocators.occupation, 'Housewife', { delay: 100 });
    await page.type(WifeLocators.fatherFirstName, wifefatherName, { delay: 100 });
    await page.selectOption(WifeLocators.fatherStatus, 'Living');
    await page.type(WifeLocators.fatherOccupation, 'Business', { delay: 100 });
    

    await page.locator('li').filter({ hasText: '* Upload Your Passport Photograph Upload Upload Cancel' }).getByRole('textbox').first().setInputFiles('./download.png');
    await page.locator('li').filter({ hasText: '* Upload Birth Certificate/Declaration Of Age Upload Upload Cancel' }).getByRole('textbox').first().setInputFiles('./Dummy_PDF.pdf');
    //await page.locator('#li_wifeIndegeneDocument input[type="file"]').first().setInputFiles('./Dummy_PDF.pdf');
    await page.setInputFiles(WifeLocators.indigeneDocumentUpload, './Dummy_PDF.pdf');

    await page.getByRole('link', { name: 'Proceed' }).click();

    const errorMessageLocator = page.locator('text=Please complete all the required field(s).');
    await expect(errorMessageLocator).toBeVisible({ timeout: 10000 });
    await expect(errorMessageLocator).toHaveText('Please complete all the required field(s).');

    await page.getByRole('link', { name: 'Ok' }).click();
    const emailErrorLocator = page.locator('text=Invalid Email Address');
    await expect(emailErrorLocator).toBeVisible({ timeout: 10000 });
    
    await page.screenshot({ path: path.join(screenshotDir, 'screenshot-invalid-wife-email.png'), fullPage: true });

    // Check for success message
  });

  // Negative Scenario: Missing required fields
  test('TC 4: Form submission fails due to missing required fields', async () => {
   
    await page.locator('#PlaceOfOathID').selectOption('1025');
    await page.locator('#DateOfOath').click();
    await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
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
    await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1990');
    await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
    await page.getByRole('link', { name: '15' }).click();
    await page.type(HusbandLocators.placeOfBirth, 'Brazil', { delay: 100 });
    await page.selectOption(HusbandLocators.status, '1');
    await page.setInputFiles(HusbandLocators.affidavitUpload, './Dummy_PDF.pdf');
    await page.selectOption(HusbandLocators.country, '30');
    await page.selectOption(HusbandLocators.stateOfOrigin, '485');
    await page.selectOption(HusbandLocators.identityType, '1');
    await page.type(HusbandLocators.identityNumber, '1234567890', { delay: 100 });
    await page.setInputFiles(HusbandLocators.idUpload, './Dummy_PDF.pdf');
    await page.type(HusbandLocators.occupation, 'Doctor'), { delay: 100 };
    await page.type(HusbandLocators.fatherFirstName, fatherName, { delay: 100 });
    await page.selectOption(HusbandLocators.fatherStatus, 'Living');
    await page.type(HusbandLocators.fatherOccupation, 'Business', { delay: 100 });
  
    // Using file input locators
    await page.locator('#HusbandPassport').first().setInputFiles('./download.png');
    await page.locator('#HusbandBirthCertificate').first().setInputFiles('./Dummy_PDF.pdf');
    await page.locator('#li_husbandIndegeneDocument input[type="file"]').first().setInputFiles('./Dummy_PDF.pdf');

    // Attempt to proceed without filling any required fields
    await page.getByRole('link', { name: 'Proceed' }).click();
    // Locate the error message for missing required fields
    const errorMessageLocator = page.locator('text=Please complete all the required field(s).');
    // Check if the error message is visible and matches the expected text
    await expect(errorMessageLocator).toBeVisible({ timeout: 10000 });
    await expect(errorMessageLocator).toHaveText('Please complete all the required field(s).');
    // Capture the error message text and log it for debugging purposes
    const errorMessageText = await errorMessageLocator.textContent();
    console.log('Error message displayed:', errorMessageText);
    // Take a screenshot of the error state
    await page.screenshot({ path: path.join(screenshotDir, 'screenshot-blank-submit.png'), fullPage: true });
    // Acknowledge the error by clicking "Ok" in the error dialog
    await page.getByRole('link', { name: 'Ok' }).click();
  });
  
  // Positive Scenario: Successful marriage application submission with valid data
  test.only('TC 5: Successful marriage application submission with valid data', async () => {
    // Fill in marriage ceremony details
    await page.locator('#PlaceOfOathID').selectOption('1025');
    await page.locator('#DateOfOath').click();
    await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
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
    await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1990');
    await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
    await page.getByRole('link', { name: '15' }).click();
    await page.type(HusbandLocators.placeOfBirth, 'Brazil', { delay: 100 });
    await page.selectOption(HusbandLocators.status, '1');
    await page.setInputFiles(HusbandLocators.affidavitUpload, './Dummy_PDF.pdf');
    await page.selectOption(HusbandLocators.country, '30');
    await page.selectOption(HusbandLocators.stateOfOrigin, '485');
    await page.selectOption(HusbandLocators.identityType, '1');
    await page.type(HusbandLocators.identityNumber, '1234567890', { delay: 100 });
    await page.setInputFiles(HusbandLocators.idUpload, './Dummy_PDF.pdf');
    await page.type(HusbandLocators.occupation, 'Doctor'), { delay: 100 };
    await page.type(HusbandLocators.fatherFirstName, fatherName, { delay: 100 });
    await page.selectOption(HusbandLocators.fatherStatus, 'Living');
    await page.type(HusbandLocators.fatherOccupation, 'Business', { delay: 100 });
    // Using file input locators
    await page.locator('#HusbandPassport').first().setInputFiles('./download.png');
    await page.locator('#HusbandBirthCertificate').first().setInputFiles('./Dummy_PDF.pdf');
    await page.locator('#li_husbandIndegeneDocument input[type="file"]').first().setInputFiles('./Dummy_PDF.pdf');

    // Fill the form with valid data for wife 
    await page.getByRole('heading', { name: 'Wife Details' }).click();
    await page.selectOption(WifeLocators.title, '1');
    await page.type(WifeLocators.firstName, firstName, { delay: 100 });
    await page.type(WifeLocators.lastName, lastName, { delay: 100 });
    await page.click(WifeLocators.dateOfBirth);
    await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1992');
    await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('11');
    await page.getByRole('link', { name: '10' }).click();   
    await page.type(WifeLocators.placeOfBirth, 'Brazil', { delay: 100 });
    await page.selectOption(WifeLocators.status, '1');
    await page.setInputFiles(WifeLocators.affidavitUpload, './Dummy_PDF.pdf');
    await page.selectOption(WifeLocators.country, '30');
    await page.selectOption(WifeLocators.stateOfOrigin, '485');
    await page.selectOption(WifeLocators.identityType, '1');
    await page.type(WifeLocators.identityNumber, '1215454520', { delay: 100 });
    await page.setInputFiles(WifeLocators.idUpload, './Dummy_PDF.pdf');
    await page.type(WifeLocators.address, 'Brazil', { delay: 100 });
    await page.type(WifeLocators.phone, phone, { delay: 100 });
    await page.type(WifeLocators.email, email, { delay: 100 });
    await page.type(WifeLocators.occupation, 'Housewife', { delay: 100 });
    await page.type(WifeLocators.fatherFirstName, wifefatherName, { delay: 100 });
    await page.selectOption(WifeLocators.fatherStatus, 'Living');
    await page.type(WifeLocators.fatherOccupation, 'Business', { delay: 100 });
    await page.locator('li').filter({ hasText: '* Upload Your Passport Photograph Upload Upload Cancel' }).getByRole('textbox').first().setInputFiles('./download.png');
    await page.locator('li').filter({ hasText: '* Upload Birth Certificate/Declaration Of Age Upload Upload Cancel' }).getByRole('textbox').first().setInputFiles('./Dummy_PDF.pdf');
    //await page.locator('#li_wifeIndegeneDocument input[type="file"]').first().setInputFiles('./Dummy_PDF.pdf');
    await page.setInputFiles(WifeLocators.indigeneDocumentUpload, './Dummy_PDF.pdf');
    // Review and Submit
    await page.getByRole('link', { name: 'Proceed' }).click();
    // Check for e-citibiz waning message
    const successMessageLocator = page.locator('text=After Payment for marriage');
    await expect(successMessageLocator).toBeVisible({ timeout: 10000 });   
    await page.getByRole('link', { name: 'Submit' }).click();
    // Check for success message
    //const successMessageLocator = page.locator('text=Your marriage application has been submitted successfully.');
    //await expect(successMessageLocator).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotDir, 'screenshot-successful-submission.png'), fullPage: true });
    //For payment
    // await page.getByRole('heading', { name: 'Husband Details' }).click();
    // await page.getByRole('heading', { name: 'Wife Details' }).click();
    // await slowScrollTopBottom(page);
    // await page.getByLabel('By checking this box; I,').check();
    // await page.getByRole('button', { name: 'Proceed To Payment' }).click();
    // await page.getByLabel('Online Pay').check();
    // await page.getByRole('button', { name: 'Pay' }).click();

    //Click on my application and delete submitted application 
    await page.getByText('Welcome -').click();;
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
