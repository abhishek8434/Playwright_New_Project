const { test, expect, chromium, firefox, webkit } = require('@playwright/test');


const { locators } = require('../constants/locators');
import { certifiedtrucopy } from '../constants/locators';
const path = require('path');
const fs = require('fs');
import * as dotenv from "dotenv";
import { faker } from '@faker-js/faker';

// Generate a random first name, last name, and combine them in an email
const hsbndfirstName = faker.person.firstName('male');
const hsbndlastName = faker.person.lastName('male');
const wifefirstName = faker.person.firstName('female');
const wifelastName = faker.person.lastName('female')



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
    wifelastName,
    wifefirstName,
    hsbndlastName,
    hsbndfirstName
};


dotenv.config();

const LOGIN_URL = process.env.LOGIN_URL;
const LOGIN_EMAIL = process.env.LOGIN_EMAIL1;
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD1;
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


// Helper function to navigate to the marriage form
async function navigateToMarriageForm(page) {
    await page.goto(MY_APPLICATION_URL);
    expect(await page.title()).toBe('My Applications');

    // Proceed to marriage application form
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.locator('#defaultNavbar1').getByText('Marriage', { exact: true }).click();
    await page.getByRole('link', { name: 'Apply For Certified True Copy Of Document' }).click();

}

test.describe.configure({ mode: 'serial' });
test.describe('Apply For Certified True Copy Of Document', () => {
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
    });

    test.afterAll(async () => {
        await browser.close();
    });

    test.afterEach(async () => {
        // Reload page after each test to reset the state
        await page.reload();
    });

    //Leave all mandatory field blank
    test('TC 1: Leave all mandatory field blank', async () => {
        await navigateToMarriageForm(page);

        await page.getByRole('link', { name: 'Proceed' }).click();
        const errorMessageLocator = page.locator('text=Please complete all the required field(s).');
        await expect(errorMessageLocator).toBeVisible({ timeout: 10000 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(screenshotDir, 'screenshot-leaveallfieldempty.png'), fullPage: true });
        await expect(errorMessageLocator).toHaveText('Please complete all the required field(s).');

        await page.getByRole('link', { name: 'Ok' }).click();



    });

    //Without Certificate number
    test('TC 2: Without Certificate number', async () => {
        await navigateToMarriageForm(page);
        await page.locator('li').filter({ hasText: '* Upload Identification' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');


        await page.getByRole('heading', { name: 'Husband Details' }).click();
        await page.type(certifiedtrucopy.husbandLastName, hsbndlastName, { delay: 100 });
        await page.type(certifiedtrucopy.husbandFirstName, hsbndfirstName, { delay: 100 });
        await page.selectOption(certifiedtrucopy.drpHusbandCountry, '161');
        await page.selectOption(certifiedtrucopy.drphusbandstateorgin, '4');
        await page.selectOption(certifiedtrucopy.oathRegistry, '1025');
        await page.locator('#DateOfMarriageCelebration').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('8');
        await page.getByRole('link', { name: '26' }).click();

        await page.getByRole('heading', { name: 'Wife Details' }).click();
        await page.type(certifiedtrucopy.wifeLastName, formData.wifelastName, { delay: 100 });
        await page.type(certifiedtrucopy.wifeFirstName, formData.wifefirstName, { delay: 100 });
        await page.selectOption(certifiedtrucopy.drpWifeCountry, '161');
        await page.selectOption(certifiedtrucopy.drpwifestateorgin, '24');

        await page.getByRole('heading', { name: 'Documents Upload' }).click();
        await page.locator('li').filter({ hasText: '* Upload Affidavit From Court' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Police Extract' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Receipt Of Affidavit' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');

        await page.type(certifiedtrucopy.applicationReason, 'TEST REASON', { delay: 100 });
        await page.getByRole('link', { name: 'Proceed' }).click();
        const errorMessageLocator = page.locator('text=Please complete all the required field(s).');
        await expect(errorMessageLocator).toBeVisible({ timeout: 10000 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(screenshotDir, 'screenshot-blank-certificateno.png'), fullPage: true });
        await expect(errorMessageLocator).toHaveText('Please complete all the required field(s).');
        await page.waitForTimeout(2000)


    });

    //with incorrect certificate number
    test('TC 3: With invalid ceritificate number', async () => {
        await navigateToMarriageForm(page);
        await page.locator('li').filter({ hasText: '* Upload Identification' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.type(certifiedtrucopy.marriageCertificateno, '56987651', { delay: 100 });

        await page.getByRole('heading', { name: 'Husband Details' }).click();
        await page.getByText('CancelHelp').click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(screenshotDir, 'screenshot-incorrect-trucopy.png'), fullPage: true });
        await page.getByRole('link', { name: 'Cancel' }).click();

        await page.getByRole('heading', { name: 'Husband Details' }).click();
        await page.type(certifiedtrucopy.husbandLastName, hsbndlastName, { delay: 100 });
        await page.type(certifiedtrucopy.husbandFirstName, hsbndfirstName, { delay: 100 });
        await page.selectOption(certifiedtrucopy.drpHusbandCountry, '161');
        await page.selectOption(certifiedtrucopy.drphusbandstateorgin, '4');
        await page.selectOption(certifiedtrucopy.oathRegistry, '1025');
        await page.locator('#DateOfMarriageCelebration').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('8');
        await page.getByRole('link', { name: '26' }).click();

        await page.getByRole('heading', { name: 'Wife Details' }).click();
        await page.type(certifiedtrucopy.wifeLastName, formData.wifelastName, { delay: 100 });
        await page.type(certifiedtrucopy.wifeFirstName, formData.wifefirstName, { delay: 100 });
        await page.selectOption(certifiedtrucopy.drpWifeCountry, '161');
        await page.selectOption(certifiedtrucopy.drpwifestateorgin, '24');

        await page.getByRole('heading', { name: 'Documents Upload' }).click();
        await page.locator('li').filter({ hasText: '* Upload Affidavit From Court' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Police Extract' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Receipt Of Affidavit' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');

        await page.type(certifiedtrucopy.applicationReason, 'TEST REASON', { delay: 100 });

        await page.getByRole('link', { name: 'Proceed' }).click();

        await page.getByRole('heading', { name: 'eCitibiz - Warning' }).click();
        await page.getByText('You have successfully').click();
        await page.waitForTimeout(2000)
        await page.screenshot({ path: path.join(screenshotDir, 'screenshot-sucesssubmit-withincorrectnumber.png'), fullPage: true });
        await page.getByRole('link', { name: 'Submit' }).click();

        await page.waitForTimeout(2000)

    });

    //With valid certificate number
    test('TC 4: With valid certificate number', async () => {
        await navigateToMarriageForm(page);
        await page.locator('li').filter({ hasText: '* Upload Identification' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.type(certifiedtrucopy.marriageCertificateno, '5698765', { delay: 100 });

        await page.getByRole('heading', { name: 'Documents Upload' }).click();
        await page.locator('li').filter({ hasText: '* Upload Affidavit From Court' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Police Extract' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Receipt Of Affidavit' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');

        await page.type(certifiedtrucopy.applicationReason, 'TEST REASON', { delay: 100 });

        await page.getByRole('link', { name: 'Proceed' }).click();

        await page.getByRole('heading', { name: 'eCitibiz - Warning' }).click();
        await page.getByText('You have successfully').click();
        await page.waitForTimeout(2000)
        await page.screenshot({ path: path.join(screenshotDir, 'screenshot-sucesssubmit-correctnumber.png'), fullPage: true });
        await page.getByRole('link', { name: 'Submit' }).click();

        await page.waitForTimeout(2000)


    });


});