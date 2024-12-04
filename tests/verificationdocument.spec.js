const { test, expect, chromium, firefox, webkit } = require('@playwright/test');


const { locators } = require('../constants/locators');
import { DocumentVerification } from '../constants/locators';
const path = require('path');
const fs = require('fs');
import * as dotenv from "dotenv";
import { faker } from '@faker-js/faker';

// Generate a random first name, last name, and combine them in an email
const hsbndfirstName = faker.person.firstName('male');
const hsbndlastName = faker.person.lastName('male');
const wifefirstName = faker.person.firstName('female');
const wifelastName = faker.person.lastName('female')


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
    await page.getByRole('link', { name: 'Apply For Verification Of Documents' }).click();

}

test.describe.configure({ mode: 'serial' });
test.describe('Application For Verification Of Document', () => {
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

    //Invalid marriage certificate number
    test('TC 2 : Invalid marriage certificate number', async () => {
        await navigateToMarriageForm(page);

        await page.locator('li').filter({ hasText: '* Upload of Means of' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');

        await page.selectOption(DocumentVerification.certificateType, '1');
        await page.locator('#liAuthorizationLetter').getByRole('textbox').first().setInputFiles('Dummy_PDF.pdf');
        await page.type(DocumentVerification.marriageCertificateno, '1234567', { delay: 100 });

        await page.locator('label').filter({ hasText: 'Yes' }).click();
        await page.getByText('CancelHelp').click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(screenshotDir, 'screenshot-incorrect-marriage-certificate.png'), fullPage: true });
        await page.getByRole('link', { name: 'Cancel' }).click();

        await page.getByRole('link', { name: 'Proceed' }).click();

    });

    //Form submission fails due to invalid file type upload'
    test('TC 3: Form submission fails due to invalid file type upload', async () => {
        await navigateToMarriageForm(page);

        await page.locator('li').filter({ hasText: '* Upload of Means of' }).getByRole('textbox').setInputFiles('./invalid-file.txt');


        // Generate a random number between 1 and 3
        const randomCondition = Math.floor(Math.random() * 3) + 1;

        if (randomCondition === 1) {
            // First condition
            await page.selectOption(DocumentVerification.certificateType, '1');
            await page.locator('#liAuthorizationLetter').getByRole('textbox').first().setInputFiles('./invalid-file.txt');
            await page.type(DocumentVerification.marriageCertificateno, '5698765', { delay: 100 });

            await page.locator('label').filter({ hasText: 'Yes' }).click();
            await page.type(DocumentVerification.accrediationNo, '21649464', { delay: 100 });

            await page.type(DocumentVerification.requestReason, '48484848484848', { delay: 100 });


            await page.type(DocumentVerification.husbandLastName, formData.hsbndlastName, { delay: 100 });

            await page.type(DocumentVerification.husbandFirstName, formData.hsbndfirstName, { delay: 100 });

            await page.waitForTimeout(2000);
            //await page.locator('#drpHusbandCountry').selectOption('161');
            await page.selectOption(DocumentVerification.drpHusbandCountry, '161');
            //await page.locator('#drphusbandstateorgin').selectOption('22');
            await page.selectOption(DocumentVerification.drphusbandstateorgin, '22');
            //await page.locator('#HusbandWifeOathRegistry').selectOption('1025');
            await page.selectOption(DocumentVerification.husbandWifeOathRegistry, '1025');
            await page.locator('#DateOfMarriageCelebration').click();
            await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('8');
            await page.getByRole('link', { name: '25' }).click();

            //await page.locator('#WifeLastName').click();
            await page.type(DocumentVerification.wifeLastName, wifelastName, { delay: 100 });
            //await page.locator('#WifeFirstName').click();
            await page.type(DocumentVerification.wifeFirstName, wifefirstName, { delay: 100 });

            //await page.locator('#drpWifeCountry').selectOption('161');
            await page.selectOption(DocumentVerification.drpWifeCountry, '161');
            //await page.locator('#drpwifestateorgin').selectOption('24');
            await page.selectOption(DocumentVerification.drpwifestateorgin, '24');

        } else if (randomCondition === 2) {
            // Second condition
            await page.selectOption(DocumentVerification.certificateType, '2');
            await page.locator('#divSpinsterhoodCertificate').getByRole('textbox').first().setInputFiles('./invalid-file.txt');
            await page.selectOption(DocumentVerification.registryLocation, '1025');
            await page.locator('label').filter({ hasText: 'Yes' }).click();

            await page.type(DocumentVerification.accrediationNo, '21649464', { delay: 100 });

            await page.type(DocumentVerification.requestReason, '48484848484848', { delay: 100 });

        } else if (randomCondition === 3) {
            // Third condition
            await page.selectOption(DocumentVerification.certificateType, '3');
            await page.locator('#divBachelorhoodCertificate').getByRole('textbox').first().setInputFiles('./invalid-file.txt');
            await page.selectOption(DocumentVerification.registryLocation, '1025');
            await page.locator('label').filter({ hasText: 'Yes' }).click();

            await page.type(DocumentVerification.accrediationNo, '21649464', { delay: 100 });

            await page.type(DocumentVerification.requestReason, '48484848484848', { delay: 100 });

        }

        await page.getByRole('link', { name: 'Proceed' }).click();
        const errorMessageLocator = page.locator('text=Please complete all the required field(s).');
        await expect(errorMessageLocator).toBeVisible({ timeout: 10000 });
        await page.waitForTimeout(2000);
        await expect(errorMessageLocator).toHaveText('Please complete all the required field(s).');

        await page.getByRole('link', { name: 'Ok' }).click();

        const validationMessage = 'Please upload file with png/jpeg/pdf/word format';
        await page.waitForTimeout(2000);
        await expect(page.getByText(validationMessage).first()).toBeVisible({ timeout: 5000 });

        await page.screenshot({ path: path.join(screenshotDir, 'screenshot-invalid-file-type-.png'), fullPage: true });



    });

    // Positive Scenario: Successful marriage application submission with valid data but incorrect certificate number
    test('TC 4: uccessful marriage application submission with incorrect certificate number', async () => {
        await navigateToMarriageForm(page);

        await page.locator('li').filter({ hasText: '* Upload of Means of' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');


        // Generate a random number between 1 and 3
        const randomCondition = Math.floor(Math.random() * 3) + 1;

        if (randomCondition === 1) {
            // First condition
            await page.selectOption(DocumentVerification.certificateType, '1');
            await page.locator('#liAuthorizationLetter').getByRole('textbox').first().setInputFiles('Dummy_PDF.pdf');
            await page.type(DocumentVerification.marriageCertificateno, '569876512', { delay: 100 });
            
        } else if (randomCondition === 2) {
            // Second condition
            await page.selectOption(DocumentVerification.certificateType, '2');
            await page.locator('#divSpinsterhoodCertificate').getByRole('textbox').first().setInputFiles('Dummy_PDF.pdf');
            await page.selectOption(DocumentVerification.registryLocation, '1025');
            await page.locator('label').filter({ hasText: 'Yes' }).click();

            await page.type(DocumentVerification.accrediationNo, '21649464', { delay: 100 });

            await page.type(DocumentVerification.requestReason, '48484848484848', { delay: 100 });

        } else if (randomCondition === 3) {
            // Third condition
            await page.selectOption(DocumentVerification.certificateType, '3');
            await page.locator('#divBachelorhoodCertificate').getByRole('textbox').first().setInputFiles('Dummy_PDF.pdf');
            await page.selectOption(DocumentVerification.registryLocation, '1025');
            await page.locator('label').filter({ hasText: 'Yes' }).click();

            await page.type(DocumentVerification.accrediationNo, '21649464', { delay: 100 });

            await page.type(DocumentVerification.requestReason, '48484848484848', { delay: 100 });

        }

        await page.getByRole('link', { name: 'Proceed' }).click();

    });

     // Positive Scenario: Successful marriage application submission with valid data but incorrect certificate number
     test('TC 5: Successful marriage application submission with correct certificate number', async () => {
        await navigateToMarriageForm(page);

        await page.locator('li').filter({ hasText: '* Upload of Means of' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');


        // Generate a random number between 1 and 3
        const randomCondition = Math.floor(Math.random() * 3) + 1;

        if (randomCondition === 1) {
            // First condition
            await page.selectOption(DocumentVerification.certificateType, '1');
            await page.locator('#liAuthorizationLetter').getByRole('textbox').first().setInputFiles('Dummy_PDF.pdf');
            await page.type(DocumentVerification.marriageCertificateno, '5698765', { delay: 100 });
            await page.locator('label').filter({ hasText: 'Yes' }).click();
            await page.getByText('CancelHelp').click();
            await page.waitForTimeout(2000);
            await page.screenshot({ path: path.join(screenshotDir, 'screenshot-incorrect-marriage-certificate.png'), fullPage: true });
            await page.getByRole('link', { name: 'Cancel' }).click();

            await page.locator('label').filter({ hasText: 'Yes' }).click();
            await page.type(DocumentVerification.accrediationNo, '21649464', { delay: 100 });

            await page.type(DocumentVerification.requestReason, '48484848484848', { delay: 100 });

            await page.locator('#WifeLastName').click();
            await page.type(DocumentVerification.husbandLastName, hsbndlastName, { delay: 100 });

            await page.type(DocumentVerification.husbandFirstName, hsbndfirstName, { delay: 100 });


            //await page.locator('#drpHusbandCountry').selectOption('161');
            await page.selectOption(DocumentVerification.drpHusbandCountry, '161');
            //await page.locator('#drphusbandstateorgin').selectOption('22');
            await page.selectOption(DocumentVerification.drphusbandstateorgin, '22');
            //await page.locator('#HusbandWifeOathRegistry').selectOption('1025');
            await page.selectOption(DocumentVerification.husbandWifeOathRegistry, '1025');
            await page.locator('#DateOfMarriageCelebration').click();
            await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('8');
            await page.getByRole('link', { name: '25' }).click();

            //await page.locator('#WifeLastName').click();
            await page.type(DocumentVerification.wifeLastName, wifelastName, { delay: 100 });
            //await page.locator('#WifeFirstName').click();
            await page.type(DocumentVerification.wifeFirstName, wifefirstName, { delay: 100 });

            //await page.locator('#drpWifeCountry').selectOption('161');
            await page.selectOption(DocumentVerification.drpWifeCountry, '161');
            //await page.locator('#drpwifestateorgin').selectOption('24');
            await page.selectOption(DocumentVerification.drpwifestateorgin, '24');

        } else if (randomCondition === 2) {
            // Second condition
            await page.selectOption(DocumentVerification.certificateType, '2');
            await page.locator('#divSpinsterhoodCertificate').getByRole('textbox').first().setInputFiles('Dummy_PDF.pdf');
            await page.selectOption(DocumentVerification.registryLocation, '1025');
            await page.locator('label').filter({ hasText: 'Yes' }).click();

            await page.type(DocumentVerification.accrediationNo, '21649464', { delay: 100 });

            await page.type(DocumentVerification.requestReason, '48484848484848', { delay: 100 });

        } else if (randomCondition === 3) {
            // Third condition
            await page.selectOption(DocumentVerification.certificateType, '3');
            await page.locator('#divBachelorhoodCertificate').getByRole('textbox').first().setInputFiles('Dummy_PDF.pdf');
            await page.selectOption(DocumentVerification.registryLocation, '1025');
            await page.locator('label').filter({ hasText: 'Yes' }).click();

            await page.type(DocumentVerification.accrediationNo, '21649464', { delay: 100 });

            await page.type(DocumentVerification.requestReason, '48484848484848', { delay: 100 });

        }

        await page.getByRole('link', { name: 'Proceed' }).click();

    });
});
