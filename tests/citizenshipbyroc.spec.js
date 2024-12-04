const { test, expect, chromium, firefox, webkit } = require('@playwright/test');


const { locators } = require('../constants/locators');
import { citizenshipbyroc, citizenshipbytrp } from '../constants/locators';

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


// Helper function to navigate to the marriage form
async function navigateToCitizenshipForm(page) {
    await page.goto(MY_APPLICATION_URL);
    expect(await page.title()).toBe('My Applications');

    // Proceed to marriage application form
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.locator('#defaultNavbar1').getByText('Citizenship', { exact: true }).click();
    await page.getByRole('link', { name: 'Apply For Citizenship' }).click();
    await page.getByRole('heading', { name: 'Citizenship By Naturalization' }).click();
    await page.getByRole('heading', { name: 'Application for Renunciation' }).click();
    await page.getByRole('link', { name: 'Proceed' }).click();



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
        await page.screenshot({ path: path.join(screenshotDir, 'citizenshipbyrocleaveallfieldempty.png'), fullPage: true });
        console.log('Screenshot saved as citizenshipbyrocleaveallfieldempty.png');
        await expect(errorMessageLocator).toHaveText('Please complete all the required field(s).');

        await page.getByRole('link', { name: 'Ok' }).click();



    });

    //Invalid file type
    test('TC 2: Invalid file type', async () => {

        await navigateToCitizenshipForm(page);

        await page.getByRole('heading', { name: 'Personal Information' }).click();
        await page.waitForTimeout(2000);
        // Check if some content within the dropdown is visible, e.g. Date of Birth field
        const isDropdownOpened = await page.locator(citizenshipbyroc.piDateOfBirth).isVisible();
        // If the content is not visible (dropdown did not open), click again
        if (!isDropdownOpened) {
            console.log('Dropdown not opened, clicking again...');
            await page.getByRole('heading', { name: 'Personal Information' }).click();
        }
        await page.locator(citizenshipbyroc.piDateOfBirth).click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1980');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '6', exact: true }).click();
        await page.selectOption(citizenshipbyroc.piBirthCountry, '161');
        await page.click(citizenshipbyroc.piBirthCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyroc.piBirthState, '4');
        await page.type(citizenshipbyroc.piCityOfBirth, 'Bauchi');

        await page.type(citizenshipbyroc.piinternationalPassport, '789456123');


        await page.type(citizenshipbyroc.piformerlastname, formData.BeneficiarylastName);


        await page.type(citizenshipbyroc.piformerfirstname, formData.BeneficiaryfirstName);

        const options = ['1', '2', '3'];

        // Pick a random option from the array
        const randomOption = options[Math.floor(Math.random() * options.length)];

        // Select the randomly chosen option
        await page.locator(citizenshipbyroc.piPresentNationality).selectOption(randomOption);

        console.log(`Randomly selected option: ${randomOption}`)


        await page.click(citizenshipbyroc.pidateofnigeriannatinationality);
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1999');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('9');
        await page.getByRole('link', { name: '1', exact: true }).click();


        await page.type(citizenshipbyroc.piPreviousAddress, 'Cross River');
        await page.selectOption(citizenshipbyroc.piPreviousCountry, '161');
        await page.click(citizenshipbyroc.piPreviousCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyroc.piPreviousState, '46');
        await page.type(citizenshipbyroc.piPreviousCity, 'Cross River');

        await page.type(citizenshipbyroc.piPresentAddress, 'Cross River');
        await page.selectOption(citizenshipbyroc.piPresentCountry, '161');
        await page.click(citizenshipbyroc.piPresentCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyroc.piPresentState, '24');
        await page.type(citizenshipbyroc.piPresentCity, 'Cross River');

        //Professional Information
        await page.getByRole('heading', { name: 'Professional Information' }).click();
        await page.waitForTimeout(2000)
        const isDropdownOpened2 = await page.locator(citizenshipbyroc.profOccupation).isVisible();
        // If the content is not visible (dropdown did not open), click again
        if (!isDropdownOpened2) {
            console.log('Dropdown not opened, clicking again...');
            await page.getByRole('heading', { name: 'Professional Information' }).click();
        }
        await page.type(citizenshipbyroc.profOccupation, 'Student');
        await page.type(citizenshipbyroc.profNameOfOrganization, 'Bauchi Univerisity');
        await page.type(citizenshipbyroc.profOrganizationType, 'Educational');
        await page.type(citizenshipbyroc.profPositionHeld, 'Student');
        await page.locator('#DivProfessionalInformation').getByRole('button').click();
        await page.getByRole('link', { name: 'Nigerian naira' }).click();
        await page.type(citizenshipbyroc.profAnnualIncome, '98765214');


        //Parent's Information
        await page.getByRole('heading', { name: 'Parent(s) Information' }).click();

        await page.type(citizenshipbyroc.FatherLastName, formData.BeneficiarylastName);
        await page.type(citizenshipbyroc.FatherFirstName, formData.BeneficiaryfirstName);

        await page.locator('#FatherCountryOfBirth').selectOption('161');

        await page.selectOption(citizenshipbyroc.FatherCountryOfBirth, '161');
        await page.click(citizenshipbyroc.FatherCountryOfBirth);
        await page.keyboard.press('Escape');

        await page.type(citizenshipbyroc.FatherPlaceOfBirth, 'Place of Birth');

        await page.click(citizenshipbyroc.FatherDateOfBirth)
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1996');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('7');
        await page.getByRole('link', { name: '14' }).click();

        await page.selectOption(citizenshipbyroc.FatherPresentNationality, '128')

        const randomOption1 = options[Math.floor(Math.random() * options.length)];
        // Select the randomly chosen option
        await page.locator(citizenshipbyroc.FatherPresentNationalityAcquired).selectOption(randomOption1);

        console.log(`Randomly selected option: ${randomOption1}`)

        await page.selectOption(citizenshipbyroc.PreviousFatherNationalityId, '126');


        const randomOption2 = options[Math.floor(Math.random() * options.length)];
        // Select the randomly chosen option
        await page.locator(citizenshipbyroc.PreviousFatherNationalityAcquired).selectOption(randomOption2);
        console.log(`Randomly selected option: ${randomOption2}`)

        await page.click(citizenshipbyroc.PreviousFatherDateOfNationalityAcquired);


        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('9');;
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2022');
        await page.getByRole('link', { name: '24' }).click();


        await page.type(citizenshipbyroc.AddressList_2, 'Cross River');
        await page.selectOption(citizenshipbyroc.AddressList_2__Country, '161');
        await page.click(citizenshipbyroc.AddressList_2__Country);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyroc.Fatherstate2, '46');
        await page.type(citizenshipbyroc.AddressList_2__City, 'Cross River');

        await page.type(citizenshipbyroc.AddressList_3, 'Cross River');
        await page.selectOption(citizenshipbyroc.AddressList_3__Country, '161');
        await page.click(citizenshipbyroc.AddressList_3__Country);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyroc.Fatherstate3, '24');
        await page.type(citizenshipbyroc.AddressList_3__City, 'Cross River');



        await page.type(citizenshipbyroc.MotherLastName, formData.BeneficiarylastName);

        await page.type(citizenshipbyroc.MotherFirstName, formData.BeneficiaryfirstName);

        await page.selectOption(citizenshipbyroc.MotherCountryOfBirth, '161');

        await page.type(citizenshipbyroc.MotherPlaceOfBirth, 'Chicago')

        await page.click(citizenshipbyroc.MotherDateOfBirth)
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1994');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('9');
        await page.getByRole('link', { name: '18' }).click();

        await page.selectOption(citizenshipbyroc.PresentMotherNationalityId, '128');

        const randomOption3 = options[Math.floor(Math.random() * options.length)];
        // Select the randomly chosen option
        await page.locator(citizenshipbyroc.PresentMotherNationalityAcquired).selectOption(randomOption3);
        console.log(`Randomly selected option: ${randomOption3}`)

        await page.selectOption(citizenshipbyroc.PreviousMotherNationalityId, '128');

        const randomOption4 = options[Math.floor(Math.random() * options.length)];
        // Select the randomly chosen option
        await page.locator(citizenshipbyroc.PreviousMotherNationalityAcquired).selectOption(randomOption4);
        console.log(`Randomly selected option: ${randomOption4}`)

        await page.click(citizenshipbyroc.PreviousMotherDateOfNationalityAcquired)

        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2015');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('5');
        await page.getByRole('link', { name: '1', exact: true }).click();


        await page.type(citizenshipbyroc.AddressList_4, 'Cross River');
        await page.selectOption(citizenshipbyroc.AddressList_4__Country, '161');
        await page.click(citizenshipbyroc.AddressList_4__Country);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyroc.Motherstate4, '46');
        await page.type(citizenshipbyroc.AddressList_4__City, 'Cross River');

        await page.type(citizenshipbyroc.AddressList_5, 'Cross River');
        await page.selectOption(citizenshipbyroc.AddressList_5__Country, '161');
        await page.click(citizenshipbyroc.AddressList_5__Country);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyroc.Motherstate5, '24');
        await page.type(citizenshipbyroc.AddressList_5__City, 'Cross River');


        //Maritial Status         

        await page.getByRole('heading', { name: 'Marital Status' }).click();

        const option = ['1', '2', '3', '4', '5']; // Ensure the array is correctly named

        // Pick a random option from the array
        const randomOption5 = option[Math.floor(Math.random() * option.length)]; // Use the correct array name

        // Select the randomly chosen option
        await page.locator(citizenshipbyroc.SpouseDetails).selectOption(randomOption5);

        console.log(`Randomly selected option: ${randomOption5}`);



        if (randomOption5 !== '1') {
            console.log(`Option ${randomOption5} selected: Running custom logic.`);

            await page.type(citizenshipbyroc.SpouseSurName, 'Spouse Surname');
            await page.type(citizenshipbyroc.SpouseFirstName, 'Spouse Firstname')

            await page.selectOption(citizenshipbyroc.SpouseCountryOfBirth, '161');

            await page.click(citizenshipbyroc.SpouseDateOfBirth);
            await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1998');
            await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('8');
            await page.getByRole('link', { name: '9', exact: true }).click();

            await page.selectOption(citizenshipbyroc.PresentSpouseNationalityId, '128');



            // Pick a random option from the array
            const randomOption6 = options[Math.floor(Math.random() * options.length)];

            // Select the randomly chosen option
            await page.locator(citizenshipbyroc.PresentSpouseNationalityAcquired).selectOption(randomOption6);

            console.log(`Randomly selected option: ${randomOption6}`)


            await page.click(citizenshipbyroc.PresentSpouseDateOfNationalityAcquired);

            await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2016');
            await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('6');;
            await page.getByRole('cell', { name: '13' }).click();


            await page.selectOption(citizenshipbyroc.PreviousSpouseNationalityId, '128');

            const randomOption7 = options[Math.floor(Math.random() * options.length)];

            // Select the randomly chosen option
            await page.locator(citizenshipbyroc.PreviousSpouseNationalityAcquired).selectOption(randomOption7);

            console.log(`Randomly selected option: ${randomOption7}`)



            await page.click(citizenshipbyroc.PreviousSpouseDateOfNationalityAcquired)
            await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2021');
            await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('7');
            await page.getByRole('link', { name: '17' }).click();

            await page.type(citizenshipbyroc.AddressList_6, 'Cross River');
            await page.selectOption(citizenshipbyroc.AddressList_6__Country, '161');
            await page.click(citizenshipbyroc.AddressList_6__Country);
            await page.keyboard.press('Escape');
            await page.selectOption(citizenshipbyroc.Spousestate6, '24');
            await page.type(citizenshipbyroc.AddressList_6__City, 'Cross River');
            console.log(`Data filled for option ${randomOption}`);


        } else {
            console.log("Option 1 selected: Skipping spouse detail form.");
        }

        await page.getByRole('heading', { name: 'Information Of Other Relatives' }).click();


        await page.type(citizenshipbyroc.RelativeLastName, formData.BeneficiarylastName);
        await page.type(citizenshipbyroc.RelativesFirstName, formData.BeneficiaryfirstName);
        await page.selectOption(citizenshipbyroc.RelativesNationalityId, '128');
        await page.type(citizenshipbyroc.RelativesPlaceOfBirth, 'Test Birth Address');
        await page.type(citizenshipbyroc.RelativesRelationship, 'Relative Relationship');



        await page.type(citizenshipbyroc.RelativesPermanentAddress, 'Cross River');
        await page.selectOption(citizenshipbyroc.RelativesListPermanentCountryId, '161');
        await page.click(citizenshipbyroc.RelativesListPermanentCountryId);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyroc.PermanentStateId, '24');
        await page.type(citizenshipbyroc.RelativesPermanentCity, 'Cross River');

        await page.type(citizenshipbyroc.RelativesPresentAddress, 'Cross River');
        await page.selectOption(citizenshipbyroc.RelativesPresentCountryId, '161');
        await page.click(citizenshipbyroc.RelativesPresentCountryId);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyroc.PresentStateId, '24');
        await page.type(citizenshipbyroc.RelativesPresentCity, 'Cross River');

        await page.getByRole('heading', { name: 'Certification By The' }).click();
        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('link', { name: 'Download' }).click();
        const download = await downloadPromise;
        await page.waitForTimeout(2000);


        //Reason for application
        await page.getByRole('heading', { name: 'Reason(s) For Application' }).click();
        await page.type(citizenshipbyroc.ReasonOfApplication, 'test reason');

        await page.getByRole('heading', { name: 'Declaration' }).click();
        await page.selectOption(citizenshipbyroc.DeclarationRenounceCountry, '161');

        await page.getByRole('heading', { name: 'Documents Upload' }).click();
        await page.locator(citizenshipbyroc.PassportPhotograph).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyroc.BirthCertificate).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyroc.InternationalPassport).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyroc.SwornAffidavit).setInputFiles('invalid-file.txt');
        await page.locator('#EvidenceCitizenshipInNewCountry').setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyroc.EvidenceCitizenshipInNewCountry).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyroc.LocalGovCertiOfOriginWithPassportPhotograph).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyroc.CertificateByTheSecretary).setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* Upload COPY OF SIGNED' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.type(citizenshipbyroc.necessaryDocumentName, 'test document name ');
        await page.locator(citizenshipbyroc.necessaryDocument).setInputFiles('invalid-file.txt');



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
        await page.screenshot({ path: path.join(screenshotDir, 'citizenshipbyroc_invalid_file.png'), fullPage: true });

        console.log('Screenshot saved as citizenshipbyroc_invalid_file.png');


    });


    test('TC 3: all mandatory field ', async () => {
        await navigateToCitizenshipForm(page);

        await page.getByRole('heading', { name: 'Personal Information' }).click();
        await page.waitForTimeout(2000);
        // Check if some content within the dropdown is visible, e.g. Date of Birth field
        const isDropdownOpened = await page.locator(citizenshipbyroc.piDateOfBirth).isVisible();
        // If the content is not visible (dropdown did not open), click again
        if (!isDropdownOpened) {
            console.log('Dropdown not opened, clicking again...');
            await page.getByRole('heading', { name: 'Personal Information' }).click();
        }
        await page.locator(citizenshipbyroc.piDateOfBirth).click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1980');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '6', exact: true }).click();
        await page.selectOption(citizenshipbyroc.piBirthCountry, '161');
        await page.click(citizenshipbyroc.piBirthCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyroc.piBirthState, '4');
        await page.type(citizenshipbyroc.piCityOfBirth, 'Bauchi');

        await page.type(citizenshipbyroc.piinternationalPassport, '789456123');


        await page.type(citizenshipbyroc.piformerlastname, formData.BeneficiarylastName);


        await page.type(citizenshipbyroc.piformerfirstname, formData.BeneficiaryfirstName);

        const options = ['1', '2', '3'];

        // Pick a random option from the array
        const randomOption = options[Math.floor(Math.random() * options.length)];

        // Select the randomly chosen option
        await page.locator(citizenshipbyroc.piPresentNationality).selectOption(randomOption);

        console.log(`Randomly selected option: ${randomOption}`)


        await page.click(citizenshipbyroc.pidateofnigeriannatinationality);
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1999');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('9');
        await page.getByRole('link', { name: '1', exact: true }).click();


        await page.type(citizenshipbyroc.piPreviousAddress, 'Cross River');
        await page.selectOption(citizenshipbyroc.piPreviousCountry, '161');
        await page.click(citizenshipbyroc.piPreviousCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyroc.piPreviousState, '46');
        await page.type(citizenshipbyroc.piPreviousCity, 'Cross River');

        await page.type(citizenshipbyroc.piPresentAddress, 'Cross River');
        await page.selectOption(citizenshipbyroc.piPresentCountry, '161');
        await page.click(citizenshipbyroc.piPresentCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyroc.piPresentState, '24');
        await page.type(citizenshipbyroc.piPresentCity, 'Cross River');

        //Professional Information
        await page.getByRole('heading', { name: 'Professional Information' }).click();
        await page.waitForTimeout(2000)
        const isDropdownOpened2 = await page.locator(citizenshipbyroc.profOccupation).isVisible();
        // If the content is not visible (dropdown did not open), click again
        if (!isDropdownOpened2) {
            console.log('Dropdown not opened, clicking again...');
            await page.getByRole('heading', { name: 'Professional Information' }).click();
        }
        await page.type(citizenshipbyroc.profOccupation, 'Student');
        await page.type(citizenshipbyroc.profNameOfOrganization, 'Bauchi Univerisity');
        await page.type(citizenshipbyroc.profOrganizationType, 'Educational');
        await page.type(citizenshipbyroc.profPositionHeld, 'Student');
        await page.locator('#DivProfessionalInformation').getByRole('button').click();
        await page.getByRole('link', { name: 'Nigerian naira' }).click();
        await page.type(citizenshipbyroc.profAnnualIncome, '98765214');


        //Parent's Information
        await page.getByRole('heading', { name: 'Parent(s) Information' }).click();

        await page.type(citizenshipbyroc.FatherLastName, formData.BeneficiarylastName);
        await page.type(citizenshipbyroc.FatherFirstName, formData.BeneficiaryfirstName);

        await page.locator('#FatherCountryOfBirth').selectOption('161');

        await page.selectOption(citizenshipbyroc.FatherCountryOfBirth, '161');
        await page.click(citizenshipbyroc.FatherCountryOfBirth);
        await page.keyboard.press('Escape');

        await page.type(citizenshipbyroc.FatherPlaceOfBirth, 'Place of Birth');

        await page.click(citizenshipbyroc.FatherDateOfBirth)
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1996');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('7');
        await page.getByRole('link', { name: '14' }).click();

        await page.selectOption(citizenshipbyroc.FatherPresentNationality, '128')

        const randomOption1 = options[Math.floor(Math.random() * options.length)];
        // Select the randomly chosen option
        await page.locator(citizenshipbyroc.FatherPresentNationalityAcquired).selectOption(randomOption1);

        console.log(`Randomly selected option: ${randomOption1}`)

        await page.selectOption(citizenshipbyroc.PreviousFatherNationalityId, '126');


        const randomOption2 = options[Math.floor(Math.random() * options.length)];
        // Select the randomly chosen option
        await page.locator(citizenshipbyroc.PreviousFatherNationalityAcquired).selectOption(randomOption2);
        console.log(`Randomly selected option: ${randomOption2}`)

        await page.click(citizenshipbyroc.PreviousFatherDateOfNationalityAcquired);


        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('9');;
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2022');
        await page.getByRole('link', { name: '24' }).click();


        await page.type(citizenshipbyroc.AddressList_2, 'Cross River');
        await page.selectOption(citizenshipbyroc.AddressList_2__Country, '161');
        await page.click(citizenshipbyroc.AddressList_2__Country);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyroc.Fatherstate2, '46');
        await page.type(citizenshipbyroc.AddressList_2__City, 'Cross River');

        await page.type(citizenshipbyroc.AddressList_3, 'Cross River');
        await page.selectOption(citizenshipbyroc.AddressList_3__Country, '161');
        await page.click(citizenshipbyroc.AddressList_3__Country);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyroc.Fatherstate3, '24');
        await page.type(citizenshipbyroc.AddressList_3__City, 'Cross River');



        await page.type(citizenshipbyroc.MotherLastName, formData.BeneficiarylastName);

        await page.type(citizenshipbyroc.MotherFirstName, formData.BeneficiaryfirstName);

        await page.selectOption(citizenshipbyroc.MotherCountryOfBirth, '161');

        await page.type(citizenshipbyroc.MotherPlaceOfBirth, 'Chicago')

        await page.click(citizenshipbyroc.MotherDateOfBirth)
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1994');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('9');
        await page.getByRole('link', { name: '18' }).click();

        await page.selectOption(citizenshipbyroc.PresentMotherNationalityId, '128');

        const randomOption3 = options[Math.floor(Math.random() * options.length)];
        // Select the randomly chosen option
        await page.locator(citizenshipbyroc.PresentMotherNationalityAcquired).selectOption(randomOption3);
        console.log(`Randomly selected option: ${randomOption3}`)

        await page.selectOption(citizenshipbyroc.PreviousMotherNationalityId, '128');

        const randomOption4 = options[Math.floor(Math.random() * options.length)];
        // Select the randomly chosen option
        await page.locator(citizenshipbyroc.PreviousMotherNationalityAcquired).selectOption(randomOption4);
        console.log(`Randomly selected option: ${randomOption4}`)

        await page.click(citizenshipbyroc.PreviousMotherDateOfNationalityAcquired)

        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2015');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('5');
        await page.getByRole('link', { name: '1', exact: true }).click();


        await page.type(citizenshipbyroc.AddressList_4, 'Cross River');
        await page.selectOption(citizenshipbyroc.AddressList_4__Country, '161');
        await page.click(citizenshipbyroc.AddressList_4__Country);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyroc.Motherstate4, '46');
        await page.type(citizenshipbyroc.AddressList_4__City, 'Cross River');

        await page.type(citizenshipbyroc.AddressList_5, 'Cross River');
        await page.selectOption(citizenshipbyroc.AddressList_5__Country, '161');
        await page.click(citizenshipbyroc.AddressList_5__Country);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyroc.Motherstate5, '24');
        await page.type(citizenshipbyroc.AddressList_5__City, 'Cross River');


        //Marital Status         

        await page.getByRole('heading', { name: 'Marital Status' }).click();

        const option = ['1', '2', '3', '4', '5']; 

        // Pick a random option from the array
        const randomOption5 = option[Math.floor(Math.random() * option.length)]; 

        // Select the randomly chosen option
        await page.locator(citizenshipbyroc.SpouseDetails).selectOption(randomOption5);

        console.log(`Randomly selected option: ${randomOption5}`);



        if (randomOption5 !== '1') {
            console.log(`Option ${randomOption5} selected: Running custom logic.`);

            await page.type(citizenshipbyroc.SpouseSurName, 'Spouse Surname');
            await page.type(citizenshipbyroc.SpouseFirstName, 'Spouse Firstname')

            await page.selectOption(citizenshipbyroc.SpouseCountryOfBirth, '161');

            await page.click(citizenshipbyroc.SpouseDateOfBirth);
            await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1998');
            await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('8');
            await page.getByRole('link', { name: '9', exact: true }).click();

            await page.selectOption(citizenshipbyroc.PresentSpouseNationalityId, '128');



            // Pick a random option from the array
            const randomOption6 = options[Math.floor(Math.random() * options.length)];

            // Select the randomly chosen option
            await page.locator(citizenshipbyroc.PresentSpouseNationalityAcquired).selectOption(randomOption6);

            console.log(`Randomly selected option: ${randomOption6}`)


            await page.click(citizenshipbyroc.PresentSpouseDateOfNationalityAcquired);

            await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2016');
            await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('6');;
            await page.getByRole('cell', { name: '13' }).click();


            await page.selectOption(citizenshipbyroc.PreviousSpouseNationalityId, '128');

            const randomOption7 = options[Math.floor(Math.random() * options.length)];

            // Select the randomly chosen option
            await page.locator(citizenshipbyroc.PreviousSpouseNationalityAcquired).selectOption(randomOption7);

            console.log(`Randomly selected option: ${randomOption7}`)



            await page.click(citizenshipbyroc.PreviousSpouseDateOfNationalityAcquired)
            await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2021');
            await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('7');
            await page.getByRole('link', { name: '17' }).click();

            await page.type(citizenshipbyroc.AddressList_6, 'Cross River');
            await page.selectOption(citizenshipbyroc.AddressList_6__Country, '161');
            await page.click(citizenshipbyroc.AddressList_6__Country);
            await page.keyboard.press('Escape');
            await page.selectOption(citizenshipbyroc.Spousestate6, '24');
            await page.type(citizenshipbyroc.AddressList_6__City, 'Cross River');
            console.log(`Data filled for option ${randomOption}`);


        } else {
            console.log("Option 1 selected: Skipping spouse detail form.");
        }

        await page.getByRole('heading', { name: 'Information Of Other Relatives' }).click();


        await page.type(citizenshipbyroc.RelativeLastName, formData.BeneficiarylastName);
        await page.type(citizenshipbyroc.RelativesFirstName, formData.BeneficiaryfirstName);
        await page.selectOption(citizenshipbyroc.RelativesNationalityId, '128');
        await page.type(citizenshipbyroc.RelativesPlaceOfBirth, 'Test Birth Address');
        await page.type(citizenshipbyroc.RelativesRelationship, 'Relative Relationship');



        await page.type(citizenshipbyroc.RelativesPermanentAddress, 'Cross River');
        await page.selectOption(citizenshipbyroc.RelativesListPermanentCountryId, '161');
        await page.click(citizenshipbyroc.RelativesListPermanentCountryId);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyroc.PermanentStateId, '24');
        await page.type(citizenshipbyroc.RelativesPermanentCity, 'Cross River');

        await page.type(citizenshipbyroc.RelativesPresentAddress, 'Cross River');
        await page.selectOption(citizenshipbyroc.RelativesPresentCountryId, '161');
        await page.click(citizenshipbyroc.RelativesPresentCountryId);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyroc.PresentStateId, '24');
        await page.type(citizenshipbyroc.RelativesPresentCity, 'Cross River');

        await page.getByRole('heading', { name: 'Certification By The' }).click();
        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('link', { name: 'Download' }).click();
        const download = await downloadPromise;
        await page.waitForTimeout(2000);


        //Reason for application
        await page.getByRole('heading', { name: 'Reason(s) For Application' }).click();
        await page.type(citizenshipbyroc.ReasonOfApplication, 'test reason');

        await page.getByRole('heading', { name: 'Declaration' }).click();
        await page.selectOption(citizenshipbyroc.DeclarationRenounceCountry, '161');

        await page.getByRole('heading', { name: 'Documents Upload' }).click();
        await page.locator(citizenshipbyroc.PassportPhotograph).setInputFiles('Dummy_PDF.pdf');
        await page.locator(citizenshipbyroc.BirthCertificate).setInputFiles('Dummy_PDF.pdf');
        await page.locator(citizenshipbyroc.InternationalPassport).setInputFiles('Dummy_PDF.pdf');
        await page.locator(citizenshipbyroc.SwornAffidavit).setInputFiles('Dummy_PDF.pdf');
        await page.locator('#EvidenceCitizenshipInNewCountry').setInputFiles('Dummy_PDF.pdf');
        await page.locator(citizenshipbyroc.EvidenceCitizenshipInNewCountry).setInputFiles('Dummy_PDF.pdf');
        await page.locator(citizenshipbyroc.LocalGovCertiOfOriginWithPassportPhotograph).setInputFiles('Dummy_PDF.pdf');
        await page.locator(citizenshipbyroc.CertificateByTheSecretary).setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: '* Upload COPY OF SIGNED' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.type(citizenshipbyroc.necessaryDocumentName, 'test document name ');
        await page.locator(citizenshipbyroc.necessaryDocument).setInputFiles('Dummy_PDF.pdf');



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