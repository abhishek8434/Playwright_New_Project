const { test, expect, chromium, firefox, webkit } = require('@playwright/test');


const { locators } = require('../constants/locators');
import { citizenshipbytrp } from '../constants/locators';

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
        await page.getByRole('link', { name: 'Apply For Citizenship' }).click();
        await page.getByRole('heading', { name: 'Citizenship By Naturalization' }).click();
        await page.getByRole('heading', { name: 'Temporary Residence Permit' }).click();
        await page.getByRole('link', { name: 'Proceed' }).click();
    
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
        

        await page.getByRole('link', { name: 'Proceed' }).click();
        const errorMessageLocator = page.locator('text=Please complete all the required field(s).');
        await expect(errorMessageLocator).toBeVisible({ timeout: 10000 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(screenshotDir, 'citizenshipbytrpleaveallfieldempty.png'), fullPage: true });
        console.log('Screenshot saved as citizenshipbytrpleaveallfieldempty.png');
        await expect(errorMessageLocator).toHaveText('Please complete all the required field(s).');

        await page.getByRole('link', { name: 'Ok' }).click();



    });

      //Invalid file type
      test('TC 2: Invalid file type', async () => {
        

        // Define the specific options you want to randomly select from
        const options = ['1', '2', '3'];

        // Pick a random option from the array
        const randomOption = options[Math.floor(Math.random() * options.length)];

        // Select the randomly chosen option
        await page.locator(citizenshipbytrp.citizenshiptype).selectOption(randomOption);

        console.log(`Randomly selected option: ${randomOption}`);

        await page.getByRole('heading', { name: 'Personal Information' }).click();
        await page.waitForTimeout(2000);
        // Check if some content within the dropdown is visible, e.g. Date of Birth field
        const isDropdownOpened = await page.locator(citizenshipbytrp.piDateOfBirth).isVisible();
        // If the content is not visible (dropdown did not open), click again
        if (!isDropdownOpened) {
            console.log('Dropdown not opened, clicking again...');
            await page.getByRole('heading', { name: 'Personal Information' }).click();
        }
        await page.locator(citizenshipbytrp.piDateOfBirth).click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1980');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '6', exact: true }).click();
        await page.selectOption(citizenshipbytrp.piBirthCountry, '161');
        await page.click(citizenshipbytrp.piBirthCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbytrp.piBirthState, '4');
        await page.type(citizenshipbytrp.piCityOfBirth, 'Bauchi');
        await page.locator('#drpApplicantState').selectOption('24');
        await page.click(citizenshipbytrp.piApplicantState);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbytrp.piLocalarea, '1188');
        await page.locator(citizenshipbytrp.piDateOfMarriage).click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2018');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '6', exact: true }).click();
        await page.type(citizenshipbytrp.piPlaceOfMarriage, 'Bauchi');
        await page.type(citizenshipbytrp.piPreviousAddress, 'Cross River');
        await page.selectOption(citizenshipbytrp.piPreviousCountry, '161');
        await page.click(citizenshipbytrp.piPreviousCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbytrp.piPreviousState, '2');
        await page.type(citizenshipbytrp.piPreviousCity, 'Cross River');
        await page.type(citizenshipbytrp.piPresentAddress, 'Cross River');
        await page.selectOption(citizenshipbytrp.piPresentCountry, '161');
        await page.click(citizenshipbytrp.piPresentCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbytrp.piPresentState, '2');
        await page.type(citizenshipbytrp.piPresentCity, 'Cross River');

        //Beneficiary Information
        await page.getByRole('heading', { name: 'Beneficiary Information' }).click();
        await page.waitForTimeout(2000);
        // Check if some content within the dropdown is visible, e.g. Date of Birth field
        const isDropdownOpened1 = await page.locator(citizenshipbytrp.BeneficiaryDateOfBirth).isVisible();
        // If the content is not visible (dropdown did not open), click again
        if (!isDropdownOpened1) {
            console.log('Dropdown not opened, clicking again...');
            await page.getByRole('heading', { name: 'Beneficiary\'s Information' }).click();
        }
        await page.type(citizenshipbytrp.BeneficiaryLastName, formData.BeneficiarylastName);
        await page.type(citizenshipbytrp.BeneficiaryFirstName, formData.BeneficiaryfirstName);
        await page.locator(citizenshipbytrp.BeneficiaryDateOfBirth).click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1998');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '6', exact: true }).click();
        await page.selectOption(citizenshipbytrp.BeneficiaryPlaceOfBirthCountry, '161');
        await page.type(citizenshipbytrp.BeneficiaryPlaceOfBirth, 'Cross River');
        await page.type(citizenshipbytrp.BeneficiaryAddress, 'Cross River');
        await page.selectOption(citizenshipbytrp.BeneficiaryNationality, '161');
        await page.type(citizenshipbytrp.BeneficiaryEmail, formData.email);
        await page.type(citizenshipbytrp.BeneficiaryPhoneNumber, formData.phone);
        

        //Reason for application
        await page.getByRole('heading', { name: 'Reason For Application' }).click();
        await page.type(citizenshipbytrp.ReasonOfApplication, '98765214');
        await page.getByRole('heading', { name: 'Documents Upload' }).click();
        await page.locator('li').filter({ hasText: '* Upload Passport Photograph' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload Birth Certificate of' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload International' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload Evidence Of Source' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload Tax Clearance' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload Resident Permit/' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: 'Upload Birth Certificate Of Children (If Any) Upload Upload Cancel' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload Coloured copies Of First 5 Pages Of Husband International Passport' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload Coloured copies Of Marriage Certificate Upload Upload Cancel' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload Formal application' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload Coloured copies Of Local Government Certificate of origin of the' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload Attestation of' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload Authentic report' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload COPY OF SIGNED' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator('input[name="DocumentList\\[0\\]\\.Document"]').setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbytrp.necessaryDocumentName).fill('docu');
        await page.locator(citizenshipbytrp.necessaryDocument).setInputFiles('invalid-file.txt');
        await page.waitForTimeout(2000)

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
        await page.screenshot({ path: path.join(screenshotDir, 'citizenshipbytrp_invalid_file.png'), fullPage: true });

        console.log('Screenshot saved as citizenshipbytrp_invalid_file.png');


    });


    test('TC 3: all mandatory field ', async () => {
        

        // Define the specific options you want to randomly select from
        const options = ['1', '2', '3'];

        // Pick a random option from the array
        const randomOption = options[Math.floor(Math.random() * options.length)];

        // Select the randomly chosen option
        await page.locator(citizenshipbytrp.citizenshiptype).selectOption(randomOption);

        console.log(`Randomly selected option: ${randomOption}`);

        await page.getByRole('heading', { name: 'Personal Information' }).click();
        await page.waitForTimeout(2000);
        // Check if some content within the dropdown is visible, e.g. Date of Birth field
        const isDropdownOpened = await page.locator(citizenshipbytrp.piDateOfBirth).isVisible();
        // If the content is not visible (dropdown did not open), click again
        if (!isDropdownOpened) {
            console.log('Dropdown not opened, clicking again...');
            await page.getByRole('heading', { name: 'Personal Information' }).click();
        }
        await page.locator(citizenshipbytrp.piDateOfBirth).click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1980');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '6', exact: true }).click();
        await page.selectOption(citizenshipbytrp.piBirthCountry, '161');
        await page.click(citizenshipbytrp.piBirthCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbytrp.piBirthState, '4');
        await page.type(citizenshipbytrp.piCityOfBirth, 'Bauchi');
        await page.locator('#drpApplicantState').selectOption('24');
        await page.click(citizenshipbytrp.piApplicantState);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbytrp.piLocalarea, '1188');
        await page.locator(citizenshipbytrp.piDateOfMarriage).click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2018');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '6', exact: true }).click();
        await page.type(citizenshipbytrp.piPlaceOfMarriage, 'Bauchi');
        await page.type(citizenshipbytrp.piPreviousAddress, 'Cross River');
        await page.selectOption(citizenshipbytrp.piPreviousCountry, '161');
        await page.click(citizenshipbytrp.piPreviousCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbytrp.piPreviousState, '2');
        await page.type(citizenshipbytrp.piPreviousCity, 'Cross River');
        await page.type(citizenshipbytrp.piPresentAddress, 'Cross River');
        await page.selectOption(citizenshipbytrp.piPresentCountry, '161');
        await page.click(citizenshipbytrp.piPresentCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbytrp.piPresentState, '2');
        await page.type(citizenshipbytrp.piPresentCity, 'Cross River');

        //Beneficiary Information
        await page.getByRole('heading', { name: 'Beneficiary Information' }).click();
        await page.waitForTimeout(2000);
        // Check if some content within the dropdown is visible, e.g. Date of Birth field
        const isDropdownOpened1 = await page.locator(citizenshipbytrp.BeneficiaryDateOfBirth).isVisible();
        // If the content is not visible (dropdown did not open), click again
        if (!isDropdownOpened1) {
            console.log('Dropdown not opened, clicking again...');
            await page.getByRole('heading', { name: 'Beneficiary\'s Information' }).click();
        }
        await page.type(citizenshipbytrp.BeneficiaryLastName, formData.BeneficiarylastName);
        await page.type(citizenshipbytrp.BeneficiaryFirstName, formData.BeneficiaryfirstName);
        await page.locator(citizenshipbytrp.BeneficiaryDateOfBirth).click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1998');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '6', exact: true }).click();
        await page.selectOption(citizenshipbytrp.BeneficiaryPlaceOfBirthCountry, '161');
        await page.type(citizenshipbytrp.BeneficiaryPlaceOfBirth, 'Cross River');
        await page.type(citizenshipbytrp.BeneficiaryAddress, 'Cross River');
        await page.selectOption(citizenshipbytrp.BeneficiaryNationality, '161');
        await page.type(citizenshipbytrp.BeneficiaryEmail, formData.email);
        await page.type(citizenshipbytrp.BeneficiaryPhoneNumber, formData.phone);
        

        //Reason for application
        await page.getByRole('heading', { name: 'Reason For Application' }).click();
        await page.type(citizenshipbytrp.ReasonOfApplication, '98765214');
        await page.getByRole('heading', { name: 'Documents Upload' }).click();
        await page.locator('li').filter({ hasText: '* Upload Passport Photograph' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Birth Certificate of' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload International' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Evidence Of Source' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Tax Clearance' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Resident Permit/' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: 'Upload Birth Certificate Of Children (If Any) Upload Upload Cancel' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Coloured copies Of First 5 Pages Of Husband International Passport' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Coloured copies Of Marriage Certificate Upload Upload Cancel' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Formal application' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Coloured copies Of Local Government Certificate of origin of the' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Attestation of' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload Authentic report' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload COPY OF SIGNED' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('input[name="DocumentList\\[0\\]\\.Document"]').setInputFiles('Dummy_PDF.pdf');
        await page.locator(citizenshipbytrp.necessaryDocumentName).fill('docu');
        await page.locator(citizenshipbytrp.necessaryDocument).setInputFiles('Dummy_PDF.pdf');
        await page.waitForTimeout(2000)

        //Proceed button click
        await page.getByRole('link', { name: 'Proceed' }).click();
        const isVisible = await page.getByText('You have successfully').isVisible();
        if (isVisible) {
            console.log('Success Message')
        } else {
            console.log("The text is not visible.");
        }
        await page.getByRole('link', { name: 'Submit' }).click();



    });

});


