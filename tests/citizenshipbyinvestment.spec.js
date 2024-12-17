const { test, expect, chromium, firefox, webkit } = require('@playwright/test');
const { locators } = require('../constants/locators');
import { citizenshipbyinvestment } from '../constants/locators';

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
        await page.getByRole('heading', { name: 'Citizenship By Investment' }).click();
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
        await page.screenshot({ path: path.join(screenshotDir, 'citizenshipinvestmentfieldempty.png'), fullPage: true });
        console.log('Screenshot saved as citizenshipinvestmentfieldempty.png');
        await expect(errorMessageLocator).toHaveText('Please complete all the required field(s).');

        await page.getByRole('link', { name: 'Ok' }).click();

    });

    //Invalid file type
    test.only('TC 2: Invalid file type', async () => {
        
        //Personal Information
        await page.getByRole('heading', { name: 'Personal Information' }).click();
        await page.waitForTimeout(2000);
        // Check if some content within the dropdown is visible, e.g. Date of Birth field
        const isDropdownOpened = await page.locator('#DateOfBirth').isVisible();
        // If the content is not visible (dropdown did not open), click again
        if (!isDropdownOpened) {
            console.log('Dropdown not opened, clicking again...');
            await page.getByRole('heading', { name: 'Personal Information' }).click();
        }
        await page.locator('#DateOfBirth').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1980');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '6', exact: true }).click();
        await page.selectOption(citizenshipbyinvestment.piBirthCountry, '161');
        await page.click(citizenshipbyinvestment.piBirthCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyinvestment.piBirthState, '4');

        await page.type(citizenshipbyinvestment.piCityOfBirth, 'Bauchi');

        await page.locator('#DateFirstArrivalToNigeria').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2023');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '7', exact: true }).click();
        await page.selectOption(citizenshipbyinvestment.piPresentNationality, '128');

        await page.selectOption(citizenshipbyinvestment.piPreviousCountry, '161');
        await page.click(citizenshipbyinvestment.piPreviousCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyinvestment.piPreviousState, '2');
        await page.type(citizenshipbyinvestment.piPreviousCity, 'Cross River');
        await page.type(citizenshipbyinvestment.piPreviousAddress, 'Cross River');

        await page.selectOption(citizenshipbyinvestment.piPresentState, '40');

        await page.click(citizenshipbyinvestment.piPresentState);
        await page.keyboard.press('Escape');
        await page.locator('#drpLocalarea').selectOption('1557');
        // await page.click(citizenshipbyinvestment.piPresentlocalArea)
        // await page.selectOption(citizenshipbyinvestment.piPresentlocalArea, '1548');
        await page.type(citizenshipbyinvestment.piPresentCity, 'Abia');
        await page.type(citizenshipbyinvestment.piPresentAddress, 'Cross');

        //Professional Information
        await page.getByRole('heading', { name: 'Professional Information' }).click();
        await page.waitForTimeout(2000)
        const isDropdownOpened1 = await page.locator(citizenshipbyinvestment.profOccupation).isVisible();
        // If the content is not visible (dropdown did not open), click again
        if (!isDropdownOpened1) {
            console.log('Dropdown not opened, clicking again...');
            await page.getByRole('heading', { name: 'Professional Information' }).click();
        }
        await page.type(citizenshipbyinvestment.profOccupation, 'Student');
        await page.type(citizenshipbyinvestment.profNameOfOrganization, 'Bauchi Univerisity');
        await page.type(citizenshipbyinvestment.profOrganizationType, 'Educational');
        await page.type(citizenshipbyinvestment.profPositionHeld, 'Student');
        await page.locator('#DivProfessionalInformation').getByRole('button').click();
        await page.getByRole('link', { name: 'Nigerian naira' }).click();
        await page.type(citizenshipbyinvestment.profAnnualIncome, '98765214');

        await page.getByRole('heading', { name: 'Other Information' }).click();
        await page.locator('li').filter({ hasText: 'Can You Read Write And Speak' }).locator('#divYes').click();
        await page.locator('li').filter({ hasText: 'Do You Intend To Live In' }).getByLabel('Yes').check();

        await page.getByRole('heading', { name: 'Declaration' }).click();
        await page.getByText('do solemnly and sincerely').isVisible();

        await page.getByRole("heading", { name: "Documents Upload" }).click();

        await page.locator(citizenshipbyinvestment.passportPhotograph).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyinvestment.writtenApplication).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyinvestment.internationalPassport).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyinvestment.memoUnderstanding).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyinvestment.documentProveforNigeria).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyinvestment.medicalEvidence).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyinvestment.investmentEvidence).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyinvestment.affidavit).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyinvestment.policeReport).setInputFiles('invalid-file.txt');
        await page.type(citizenshipbyinvestment.necessaryDocumentName, 'Student');
        await page.locator(citizenshipbyinvestment.necessaryDocument).setInputFiles('invalid-file.txt');

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
        await page.screenshot({ path: path.join(screenshotDir, 'citizenship_investment_invalid_file.png'), fullPage: true });

        console.log('Screenshot saved as citizenship_investment_invalid_file.png');

    });

    //Positive Flow
    test('TC 3: Positive Scenrio', async () => {
        
        //Personal Information
        await page.getByRole('heading', { name: 'Personal Information' }).click();
        await page.waitForTimeout(2000);
        // Check if some content within the dropdown is visible, e.g. Date of Birth field
        const isDropdownOpened = await page.locator('#DateOfBirth').isVisible();
        // If the content is not visible (dropdown did not open), click again
        if (!isDropdownOpened) {
            console.log('Dropdown not opened, clicking again...');
            await page.getByRole('heading', { name: 'Personal Information' }).click();
        }
        await page.locator('#DateOfBirth').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1980');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '6', exact: true }).click();
        await page.selectOption(citizenshipbyinvestment.piBirthCountry, '161');
        await page.click(citizenshipbyinvestment.piBirthCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyinvestment.piBirthState, '4');

        await page.type(citizenshipbyinvestment.piCityOfBirth, 'Bauchi');

        await page.locator('#DateFirstArrivalToNigeria').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2023');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '7', exact: true }).click();
        await page.selectOption(citizenshipbyinvestment.piPresentNationality, '128');

        await page.selectOption(citizenshipbyinvestment.piPreviousCountry, '161');
        await page.click(citizenshipbyinvestment.piPreviousCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyinvestment.piPreviousState, '2');
        await page.type(citizenshipbyinvestment.piPreviousCity, 'Cross River');
        await page.type(citizenshipbyinvestment.piPreviousAddress, 'Cross River');

        await page.selectOption(citizenshipbyinvestment.piPresentState, '40');

        await page.click(citizenshipbyinvestment.piPresentState);
        await page.keyboard.press('Escape');
        await page.locator('#drpLocalarea').selectOption('1557');
        // await page.click(citizenshipbyinvestment.piPresentlocalArea)
        // await page.selectOption(citizenshipbyinvestment.piPresentlocalArea, '1548');
        await page.type(citizenshipbyinvestment.piPresentCity, 'Abia');
        await page.type(citizenshipbyinvestment.piPresentAddress, 'Cross');

        //Professional Information
        await page.getByRole('heading', { name: 'Professional Information' }).click();
        await page.waitForTimeout(2000)
        const isDropdownOpened1 = await page.locator(citizenshipbyinvestment.profOccupation).isVisible();
        // If the content is not visible (dropdown did not open), click again
        if (!isDropdownOpened1) {
            console.log('Dropdown not opened, clicking again...');
            await page.getByRole('heading', { name: 'Professional Information' }).click();
        }
        await page.type(citizenshipbyinvestment.profOccupation, 'Student');
        await page.type(citizenshipbyinvestment.profNameOfOrganization, 'Bauchi Univerisity');
        await page.type(citizenshipbyinvestment.profOrganizationType, 'Educational');
        await page.type(citizenshipbyinvestment.profPositionHeld, 'Student');
        await page.locator('#DivProfessionalInformation').getByRole('button').click();
        await page.getByRole('link', { name: 'Nigerian naira' }).click();
        await page.type(citizenshipbyinvestment.profAnnualIncome, '98765214');

        await page.getByRole('heading', { name: 'Other Information' }).click();
        await page.locator('li').filter({ hasText: 'Can You Read Write And Speak' }).locator('#divYes').click();
        await page.locator('li').filter({ hasText: 'Do You Intend To Live In' }).getByLabel('Yes').check();

        await page.getByRole('heading', { name: 'Declaration' }).click();
        await page.getByText('do solemnly and sincerely').isVisible();

        await page.getByRole("heading", { name: "Documents Upload" }).click();

        await page.locator(citizenshipbyinvestment.passportPhotograph).setInputFiles('Dummy_PDF.pdf');
        await page.locator(citizenshipbyinvestment.writtenApplication).setInputFiles('Dummy_PDF.pdf');
        await page.locator(citizenshipbyinvestment.internationalPassport).setInputFiles('Dummy_PDF.pdf');
        await page.locator(citizenshipbyinvestment.memoUnderstanding).setInputFiles('Dummy_PDF.pdf');
        await page.locator(citizenshipbyinvestment.documentProveforNigeria).setInputFiles('Dummy_PDF.pdf');
        await page.locator(citizenshipbyinvestment.medicalEvidence).setInputFiles('Dummy_PDF.pdf');
        await page.locator(citizenshipbyinvestment.investmentEvidence).setInputFiles('Dummy_PDF.pdf');
        await page.locator(citizenshipbyinvestment.affidavit).setInputFiles('Dummy_PDF.pdf');
        await page.locator(citizenshipbyinvestment.policeReport).setInputFiles('Dummy_PDF.pdf');
        await page.type(citizenshipbyinvestment.necessaryDocumentName, 'Student');
        await page.locator(citizenshipbyinvestment.necessaryDocument).setInputFiles('Dummy_PDF.pdf');

        //Proceed button click
        await page.getByRole('link', { name: 'Proceed' }).click();
        const isVisible = await page.getByText('You have successfully').isVisible();
        if (isVisible) {
            console.log('Success Message')
        } else {
            console.log("The text is not visible.");
        }
        //await page.getByRole('link', { name: 'Submit' }).click();
      
        // For payment
        // await page.getByLabel('The information provided').check();
        // await page.getByRole('button', { name: 'Proceed To Payment' }).click();
        // await page.getByRole('link', { name: 'Ok' }).click();

    })


});