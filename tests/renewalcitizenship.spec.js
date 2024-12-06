const { test, expect, chromium, firefox, webkit } = require('@playwright/test');


const { locators } = require('../constants/locators');
import { renewalcitizenship } from '../constants/locators';

const path = require('path');
const fs = require('fs');
import * as dotenv from "dotenv";
import { faker } from '@faker-js/faker';

// Generate a random first name, last name, and combine them in an email
const firstName = faker.person.firstName('male');
const lastName = faker.person.lastName('male');
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

const phone = generateNigerianPhoneNumber()
const formData = {
    firstName,
    lastName,
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


// Helper function to navigate to the marriage form
async function navigateToCitizenshipForm(page) {
    await page.goto(MY_APPLICATION_URL);
    expect(await page.title()).toBe('My Applications');

    // Proceed to marriage application form
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.locator('#defaultNavbar1').getByText('Citizenship', { exact: true }).click();
    await page.getByText('Apply For Renewal Of').click();

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
        await navigateToCitizenshipForm(page);

        await page.getByRole('link', { name: 'Proceed' }).click();
        const errorMessageLocator = page.locator('text=Please complete all the required field(s).');
        await expect(errorMessageLocator).toBeVisible({ timeout: 10000 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(screenshotDir, 'renewalcitizenshipleaveallfieldempty.png'), fullPage: true });
        console.log('Screenshot saved as renewalcitizenshipleaveallfieldempty.png');
        await expect(errorMessageLocator).toHaveText('Please complete all the required field(s).');

        await page.getByRole('link', { name: 'Ok' }).click();



    });

    //Invalid file type
    test('TC 2: Invalid file type', async () => {
        await navigateToCitizenshipForm(page);

        const option = ['1', '2', '3'];

        // Pick a random option from the array
        const randomOption = option[Math.floor(Math.random() * option.length)];

        // Select the randomly chosen option
        await page.locator(renewalcitizenship.citizenshipType).selectOption(randomOption);

        // Fetch the visible text of the selected option
        const selectedText = await page.$eval(
        `${renewalcitizenship.citizenshipType} option[value="${randomOption}"]`,
        option => option.textContent.trim()
        );

        console.log(`Randomly selected option: ${randomOption}`);
        console.log(`Visible text for selected option: ${selectedText}`);

        await page.getByRole('heading', { name: 'Previous TRP Approval' }).click();

        await page.locator(renewalcitizenship.DateOfPreviousApproval).click();
        await page.getByRole('combobox').nth(3).selectOption('2023');
        await page.getByRole('combobox').nth(2).selectOption('9');
        await page.getByRole('link', { name: '1', exact: true }).click(); 

        await page.locator('li').filter({ hasText: '* Upload Evidence Of Last' }).getByRole('textbox').setInputFiles('invalid-file.txt');

        await page.type(renewalcitizenship.uploadotherdocuementName, 'Other Document');
        await page.locator(renewalcitizenship.uploadotherdocument).setInputFiles('invalid-file.txt');
      
        
        await page.getByRole('heading', { name: 'Applicant Personal Information' }).click();
        await page.click(renewalcitizenship.DateOfBirth);
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1996');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '1', exact: true }).click();

        

        await page.selectOption(renewalcitizenship.PlaceOfBirthCountry, '161');
        await page.click(renewalcitizenship.PlaceOfBirthCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(renewalcitizenship.PlaceOfBirthState, '4');
        await page.type(renewalcitizenship.CityOfBirth, 'Abia');

        await page.selectOption(renewalcitizenship.ApplicantState, '46');
        await page.click(renewalcitizenship.ApplicantState);
        await page.keyboard.press('Escape');
        await page.selectOption(renewalcitizenship.Localarea, '1690');


        await page.click(renewalcitizenship.DateOfMarriage);
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2023');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '23', exact: true }).click();

        await page.type(renewalcitizenship.PlaceOfMarriage, 'Abia');
        await page.type(renewalcitizenship.permanentAddress, 'Abia');
        await page.selectOption(renewalcitizenship.permanentCountry, '161');
        await page.click(renewalcitizenship.permanentCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(renewalcitizenship.permanentState, '46');
        await page.type(renewalcitizenship.permanentCity, 'Abia');

        await page.type(renewalcitizenship.presentAddress, 'Abia');
        await page.selectOption(renewalcitizenship.presentCountry, '161');
        await page.click(renewalcitizenship.presentCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(renewalcitizenship.presentState, '45');
        await page.type(renewalcitizenship.presentCity, 'Abia');
        

        
        await page.getByRole('heading', { name: 'Beneficiary Information' }).click();

       
        await page.type(renewalcitizenship.BeneficiaryLastName, formData.lastName);
        await page.type(renewalcitizenship.BeneficiaryFirstName, formData.firstName);      
        await page.click(renewalcitizenship.BeneficiaryDateOfBirth);
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1976');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('7');
        await page.getByRole('link', { name: '17' }).click();
        await page.selectOption(renewalcitizenship.BeneficiaryPlaceOfBirthCountry, '161');
        await page.click(renewalcitizenship.BeneficiaryPlaceOfBirthCountry);
        await page.keyboard.press('Escape');
        await page.type(renewalcitizenship.BeneficiaryPlaceOfBirth, 'plateau');
        await page.type(renewalcitizenship.BeneficiaryAddress, 'address');
        await page.selectOption(renewalcitizenship.BeneficiaryNationality, '126');
        await page.locator('#drpBeneficiaryNationality').selectOption('126');
        await page.type(renewalcitizenship.BeneficiaryEmail, formData.email);
        await page.type(renewalcitizenship.BeneficiaryPhoneNumber, formData.phone);

        await page.getByRole('heading', { name: 'Reason For Application' }).click();
        await page.type(renewalcitizenship.ReasonOfApplication, 'Reason')


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
        await page.type(renewalcitizenship.necessaryDocumentName, 'Document Name')
        await page.locator(renewalcitizenship.necessaryDocument).setInputFiles('invalid-file.txt');

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
        await page.screenshot({ path: path.join(screenshotDir, 'renewalcitizenship_invalid_file.png'), fullPage: true });

        console.log('Screenshot saved as renewalcitizenship_invalid_file.png');


    });


    test('TC 3: all mandatory field ', async () => {
        await navigateToCitizenshipForm(page);

        const option = ['1', '2', '3'];

        // Pick a random option from the array
        const randomOption = option[Math.floor(Math.random() * option.length)];

        // Select the randomly chosen option
        await page.locator(renewalcitizenship.citizenshipType).selectOption(randomOption);

        // Fetch the visible text of the selected option
        const selectedText = await page.$eval(
        `${renewalcitizenship.citizenshipType} option[value="${randomOption}"]`,
        option => option.textContent.trim()
        );

        console.log(`Randomly selected option: ${randomOption}`);
        console.log(`Visible text for selected option: ${selectedText}`);

        await page.getByRole('heading', { name: 'Previous TRP Approval' }).click();

        await page.locator(renewalcitizenship.DateOfPreviousApproval).click();
        await page.getByRole('combobox').nth(3).selectOption('2023');
        await page.getByRole('combobox').nth(2).selectOption('9');
        await page.getByRole('link', { name: '1', exact: true }).click(); 

        await page.locator('li').filter({ hasText: '* Upload Evidence Of Last' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');

        await page.type(renewalcitizenship.uploadotherdocuementName, 'Other Document');
        await page.locator(renewalcitizenship.uploadotherdocument).setInputFiles('Dummy_PDF.pdf');
      
        
        await page.getByRole('heading', { name: 'Applicant Personal Information' }).click();
        await page.click(renewalcitizenship.DateOfBirth);
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1996');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '1', exact: true }).click();

        

        await page.selectOption(renewalcitizenship.PlaceOfBirthCountry, '161');
        await page.click(renewalcitizenship.PlaceOfBirthCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(renewalcitizenship.PlaceOfBirthState, '4');
        await page.type(renewalcitizenship.CityOfBirth, 'Abia');

        await page.selectOption(renewalcitizenship.ApplicantState, '46');
        await page.click(renewalcitizenship.ApplicantState);
        await page.keyboard.press('Escape');
        await page.selectOption(renewalcitizenship.Localarea, '1690');


        await page.click(renewalcitizenship.DateOfMarriage);
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2023');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '23', exact: true }).click();

        await page.type(renewalcitizenship.PlaceOfMarriage, 'Abia');
        await page.type(renewalcitizenship.permanentAddress, 'Abia');
        await page.selectOption(renewalcitizenship.permanentCountry, '161');
        await page.click(renewalcitizenship.permanentCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(renewalcitizenship.permanentState, '46');
        await page.type(renewalcitizenship.permanentCity, 'Abia');

        await page.type(renewalcitizenship.presentAddress, 'Abia');
        await page.selectOption(renewalcitizenship.presentCountry, '161');
        await page.click(renewalcitizenship.presentCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(renewalcitizenship.presentState, '45');
        await page.type(renewalcitizenship.presentCity, 'Abia');
        

        
        await page.getByRole('heading', { name: 'Beneficiary Information' }).click();

       
        await page.type(renewalcitizenship.BeneficiaryLastName, formData.lastName);
        await page.type(renewalcitizenship.BeneficiaryFirstName, formData.firstName);      
        await page.click(renewalcitizenship.BeneficiaryDateOfBirth);
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1976');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('7');
        await page.getByRole('link', { name: '17' }).click();
        await page.selectOption(renewalcitizenship.BeneficiaryPlaceOfBirthCountry, '161');
        await page.click(renewalcitizenship.BeneficiaryPlaceOfBirthCountry);
        await page.keyboard.press('Escape');
        await page.type(renewalcitizenship.BeneficiaryPlaceOfBirth, 'plateau');
        await page.type(renewalcitizenship.BeneficiaryAddress, 'address');
        await page.selectOption(renewalcitizenship.BeneficiaryNationality, '126');
        await page.locator('#drpBeneficiaryNationality').selectOption('126');
        await page.type(renewalcitizenship.BeneficiaryEmail, formData.email);
        await page.type(renewalcitizenship.BeneficiaryPhoneNumber, formData.phone);

        await page.getByRole('heading', { name: 'Reason For Application' }).click();
        await page.type(renewalcitizenship.ReasonOfApplication, 'Reason')


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
        await page.type(renewalcitizenship.necessaryDocumentName, 'Document Name')
        await page.locator(renewalcitizenship.necessaryDocument).setInputFiles('Dummy_PDF.pdf');



        //Proceed button click
        await page.getByRole('link', { name: 'Proceed' }).click();
        const isVisible = await page.getByText('You have successfully').isVisible();
        if (isVisible) {
            console.log('Success Message')
        } else {
            console.log("The text is not visible.");
        }
        //await page.getByRole('link', { name: 'Submit' }).click();



    });

});
