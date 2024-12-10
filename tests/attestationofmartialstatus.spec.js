const { test, expect, chromium, firefox, webkit } = require('@playwright/test');


const { locators } = require('../constants/locators');
import { citizenshipattesation } from '../constants/locators';

const path = require('path');
const fs = require('fs');
import * as dotenv from "dotenv";
import { faker } from '@faker-js/faker';

// Generate a random first name, last name, and combine them in an email
const BeneficiaryfirstName = faker.person.firstName('male');
const BeneficiarylastName = faker.person.lastName('male');
const email = faker.internet.email({ BeneficiaryfirstName, BeneficiarylastName, provider: 'yopmail.com' })


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
    BeneficiaryfirstName,
    BeneficiarylastName,
    email,
    phone
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




test.describe.configure({ mode: 'serial' });
test.describe('Apply For Citizenship', () => {
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

        await page.locator('#defaultNavbar1').getByText('Citizenship', { exact: true }).click();
        await page.getByRole('link', { name: 'Apply For Attestation Of Marital Status' }).click();
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
        //

        await page.getByRole('link', { name: 'Proceed' }).click();
        const errorMessageLocator = page.locator('text=Please complete all the required field(s).');
        await expect(errorMessageLocator).toBeVisible({ timeout: 10000 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(screenshotDir, 'citizenshipbyrocleaveallfieldempty.png'), fullPage: true });
        console.log('Screenshot saved as citizenshipbyrocleaveallfieldempty.png');
        await expect(errorMessageLocator).toHaveText('Please complete all the required field(s).');

        await page.getByRole('link', { name: 'Ok' }).click();



    });

    //Invalid file type
    test('TC 2: Invalid file type', async () => {
        //

        const option = ['3', '4', '5'];

        // Pick a random option from the array
        const randomOption = option[Math.floor(Math.random() * option.length)];

        // Select the randomly chosen option
        await page.locator(citizenshipattesation.MaritalStatus).selectOption(randomOption);

        // Fetch the visible text of the selected option
        const selectedText = await page.$eval(
        `${citizenshipattesation.MaritalStatus} option[value="${randomOption}"]`,
        option => option.textContent.trim()
        );

        console.log(`Randomly selected option: ${randomOption}`);
        console.log(`Visible text for selected option: ${selectedText}`);

        await page.type(citizenshipattesation.ForeignAddress, 'Test Address');
        await page.selectOption(citizenshipattesation.PlaceOfBirthCountry, '161');
        await page.click(citizenshipattesation.PlaceOfBirthCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipattesation.PlaceOfBirthState, '24')

        await page.locator('#ForeignCity').click();
        await page.locator('#ForeignCity').fill('test');


        await page.locator('li').filter({ hasText: 'Upload Identity Card Issued' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');


        await page.getByRole('heading', { name: 'REASON(s) for application' }).click();
        await page.type(citizenshipattesation.ReasonOfApplication, 'Reason');


        await page.getByRole('heading', { name: 'foreign spouse information' }).click();
        await page.type(citizenshipattesation.ForeignSpouseEmail, formData.email);
        await page.type(citizenshipattesation.ForeignSpousePhoneNumber, phone);

        await page.getByRole('heading', { name: 'Documents Upload' }).click();


        await page.locator('li').filter({ hasText: '* Upload Application Letter' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload Passport Photograph Upload Upload Cancel' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload Certificate of local' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('#ForeignSpousePassportPhotograph').setInputFiles('invalid-file.txt');
        await page.locator('#ColouredPicture').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload data page of' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload identity card issued' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload a full length coloured picture of foreign spouse Upload Upload Cancel' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload Government Issued Document Showing Application to Marry By A' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload Government Issued Identity Card Of Intended Foreign Spouse With' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload Copy Of Law Of' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload Birth Certificate of' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload Affidavit of Non' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload Notorized Letter from local government of origin affirming applicant' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload Notorized Letter from Parent or other Senior Family member confirming' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* UPLOAD COPY OF SIGNED' }).getByRole('textbox').setInputFiles('invalid-file.txt');

        await page.type(citizenshipattesation.necessaryDocumentName, 'Test');
        await page.setInputFiles(citizenshipattesation.necessaryDocument, 'invalid-file.txt');

        //Proceed button click
        await page.getByRole('link', { name: 'Proceed' }).click();
        const isVisible = await page.getByText('Please complete all the required field(s).').isVisible();
        if (isVisible) {
            await page.getByRole('link', { name: 'Ok' }).click();
            console.log('Message')
        } else {
            console.log("The text is not visible.");
        }
        const validationMessage = 'Please upload file with png/jpeg/pdf/word format';
        await expect(page.getByText(validationMessage).first()).toBeVisible({ timeout: 5000 });
        // Get the full text content of the page
        const pageText = await page.textContent('body');

        // Count occurrences of the sentence
        const sentenceCount = (pageText.match(new RegExp(validationMessage, 'g')) || []).length;

        console.log(`The sentence "${validationMessage}" appears ${sentenceCount} times.`);
        // Take a full-page screenshot
        await page.screenshot({ path: path.join(screenshotDir, 'attestation_invalid_file.png'), fullPage: true });

        console.log('Screenshot saved as attestation_invalid_file.png');


    });


    test('TC 3: all mandatory field ', async () => {
        //

        const option = ['3', '4', '5'];

        // Pick a random option from the array
        const randomOption = option[Math.floor(Math.random() * option.length)];

        // Select the randomly chosen option
        await page.locator(citizenshipattesation.MaritalStatus).selectOption(randomOption);

        // Fetch the visible text of the selected option
        const selectedText = await page.$eval(
        `${citizenshipattesation.MaritalStatus} option[value="${randomOption}"]`,
        option => option.textContent.trim()
        );

        console.log(`Randomly selected option: ${randomOption}`);
        console.log(`Visible text for selected option: ${selectedText}`);

        await page.type(citizenshipattesation.ForeignAddress, 'Test Address');
        await page.selectOption(citizenshipattesation.PlaceOfBirthCountry, '161');
        await page.click(citizenshipattesation.PlaceOfBirthCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipattesation.PlaceOfBirthState, '24')

        await page.locator('#ForeignCity').click();
        await page.locator('#ForeignCity').fill('test');


        await page.locator('li').filter({ hasText: 'Upload Identity Card Issued' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');


        await page.getByRole('heading', { name: 'REASON(s) for application' }).click();
        await page.type(citizenshipattesation.ReasonOfApplication, 'Reason');


        await page.getByRole('heading', { name: 'foreign spouse information' }).click();
        await page.type(citizenshipattesation.ForeignSpouseEmail, formData.email);
        await page.type(citizenshipattesation.ForeignSpousePhoneNumber, phone);

        await page.getByRole('heading', { name: 'Documents Upload' }).click();


        await page.locator('li').filter({ hasText: '* Upload Application Letter' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Passport Photograph Upload Upload Cancel' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Certificate of local' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('#ForeignSpousePassportPhotograph').setInputFiles('download.png');
        await page.locator('#ColouredPicture').setInputFiles('download.png');
        await page.locator('li').filter({ hasText: '* Upload data page of' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload identity card issued' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload a full length coloured picture of foreign spouse Upload Upload Cancel' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Government Issued Document Showing Application to Marry By A' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Government Issued Identity Card Of Intended Foreign Spouse With' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Copy Of Law Of' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Birth Certificate of' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Affidavit of Non' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Notorized Letter from local government of origin affirming applicant' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Notorized Letter from Parent or other Senior Family member confirming' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* UPLOAD COPY OF SIGNED' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');

        await page.type(citizenshipattesation.necessaryDocumentName, 'Test');
        await page.setInputFiles(citizenshipattesation.necessaryDocument, 'Dummy_PDF.pdf');


        //Proceed button click
        await page.getByRole('link', { name: 'Proceed' }).click();
        const isVisible = await page.getByText('You have successfully').isVisible();
        if (isVisible) {
            console.log('Success Message')
        } else {
            console.log("The text is not visible.");
        }
        await page.getByRole('link', { name: 'Submit' }).click();


        
        // For payment
        // await page.getByLabel('The information provided').check();
        // await page.getByRole('button', { name: 'Proceed To Payment' }).click();
        // await page.getByRole('link', { name: 'Ok' }).click();



    });

});
