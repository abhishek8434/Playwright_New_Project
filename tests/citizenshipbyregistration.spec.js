const { test, expect, chromium, firefox, webkit } = require('@playwright/test');


const { locators } = require('../constants/locators');
import { citizenshipbyregistration } from '../constants/locators';
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
async function navigateToCitizenshipForm(page) {
    await page.goto(MY_APPLICATION_URL);
    expect(await page.title()).toBe('My Applications');

    // Proceed to marriage application form
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.locator('#defaultNavbar1').getByText('Citizenship', { exact: true }).click();
    await page.getByRole('link', { name: 'Apply For Citizenship' }).click();
    await page.getByRole('heading', { name: 'Citizenship By Naturalization' }).click();
    await page.getByRole('heading', { name: 'Citizenship By Registration (Under The Section 26 (2B) Of The Constitution Of' }).click();
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
        await page.screenshot({ path: path.join(screenshotDir, 'citizenshipleaveallfieldempty.png'), fullPage: true });
        console.log('Screenshot saved as citizenshipleaveallfieldemptyregistration.png');
        await expect(errorMessageLocator).toHaveText('Please complete all the required field(s).');

        await page.getByRole('link', { name: 'Ok' }).click();



    });

    //Leave all mandatory field blank
    test('TC 2: Invalid file type', async () => {
        await navigateToCitizenshipForm(page);



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
        await page.selectOption(citizenshipbyregistration.piBirthCountry, '161');
        await page.click(citizenshipbyregistration.piBirthCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyregistration.piBirthState, '4');

        await page.type(citizenshipbyregistration.piCityOfBirth, 'Bauchi');

        await page.type(citizenshipbyregistration.piPreviousAddress, 'Nigera');
        await page.selectOption(citizenshipbyregistration.piPreviousCountry, '161');
        await page.click(citizenshipbyregistration.piPreviousCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyregistration.piPreviousState, '2');
        await page.type(citizenshipbyregistration.piPreviousCity, 'Cross River');
        await page.type(citizenshipbyregistration.piPresentAddress, 'Nigeria');
        await page.selectOption(citizenshipbyregistration.piPresentCountry, '161');
        await page.click(citizenshipbyregistration.piPresentCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyregistration.piPresentState, '22');
        await page.type(citizenshipbyregistration.piPresentCity, 'Abia');


        //Professional Information
        await page.getByRole('heading', { name: 'Professional Information' }).click();
        await page.waitForTimeout(2000)
        const isDropdownOpened1 = await page.locator(citizenshipbyregistration.profOccupation).isVisible();
        // If the content is not visible (dropdown did not open), click again
        if (!isDropdownOpened1) {
            console.log('Dropdown not opened, clicking again...');
            await page.getByRole('heading', { name: 'Professional Information' }).click();
        }
        await page.type(citizenshipbyregistration.profOccupation, 'Student');
        await page.type(citizenshipbyregistration.profNameOfOrganization, 'Bauchi Univerisity');
        await page.type(citizenshipbyregistration.profOrganizationType, 'Educational');
        await page.type(citizenshipbyregistration.profPositionHeld, 'Student');
        await page.locator('#DivProfessionalInformation').getByRole('button').click();
        await page.getByRole('link', { name: 'Nigerian naira' }).click();
        await page.type(citizenshipbyregistration.profAnnualIncome, '98765214');

        //Parent Information
        await page.getByRole('heading', { name: 'Parent(s) Information' }).click();
        const isDropdownOpened2 = await page.locator('#FatherDateOfBirth').isVisible();
        // If the content is not visible (dropdown did not open), click again
        if (!isDropdownOpened2) {
            console.log('Dropdown not opened, clicking again...');
            await page.getByRole('heading', { name: 'Parent(s) Information' }).click();
        }
        await page.type(citizenshipbyregistration.FatherLastName, 'Cross River');
        await page.type(citizenshipbyregistration.FatherFirstName, 'parent');
        await page.selectOption(citizenshipbyregistration.FatherCountryOfBirth, '161');
        await page.type(citizenshipbyregistration.FatherPlaceOfBirth, 'Cross River');
        await page.locator('#FatherDateOfBirth').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1981');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '7', exact: true }).click();

        await page.type(citizenshipbyregistration.AddressList_2, 'Cross River');
        await page.selectOption(citizenshipbyregistration.FatherCountry, '161');
        await page.click(citizenshipbyregistration.FatherCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyregistration.Fatherstate, '45');
        await page.type(citizenshipbyregistration.AddressList_2__City, 'Cross River');
        await page.type(citizenshipbyregistration.MotherLastName, 'Cross River');
        await page.type(citizenshipbyregistration.MotherFirstName, 'parent');
        await page.type(citizenshipbyregistration.MotherMaidenName, 'parent');
        await page.selectOption(citizenshipbyregistration.MotherCountryOfBirth, '161');
        await page.type(citizenshipbyregistration.MotherPlaceOfBirth, 'Cross River');
        await page.locator('#MotherDateOfBirth').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1990');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('5');
        await page.getByRole('link', { name: '6', exact: true }).click();

        await page.type(citizenshipbyregistration.AddressList_3, 'Cross River');
        await page.selectOption(citizenshipbyregistration.AddressList_3__Country, '161');
        await page.click(citizenshipbyregistration.AddressList_3__Country);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyregistration.Motherstate, '45');

        await page.type(citizenshipbyregistration.AddressList_3__City, 'Cross River');

        //Marital Status 
        await page.getByRole('heading', { name: 'Marital Status' }).click();

        await page.selectOption(citizenshipbyregistration.SpouseDetails, '2');

        //Spouse information
        await page.getByRole('heading', { name: 'Spouse Information' }).click();
        const isDropdownOpened3 = await page.locator('#SpouseDateOfBirth').isVisible();
        // If the content is not visible (dropdown did not open), click again
        if (!isDropdownOpened3) {
            console.log('Dropdown not opened, clicking again...');
            await page.getByRole('heading', { name: 'Parent(s) Information' }).click();
        }
        await page.type(citizenshipbyregistration.SpouseSurName, 'Cross River');
        await page.type(citizenshipbyregistration.SpouseFirstName, 'Cross River');
        await page.selectOption(citizenshipbyregistration.SpouseCountryOfBirth, '161');

        await page.locator('#SpouseDateOfBirth').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1989');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('5');
        await page.getByRole('link', { name: '26', exact: true }).click();

        await page.selectOption(citizenshipbyregistration.SpouseNationalityId, '128');
        await page.getByRole('radio', { name: 'Yes' }).check();

        await page.type(citizenshipbyregistration.AddressList_4, 'Cross River');
        await page.selectOption(citizenshipbyregistration.AddressList_4__Country, '161');
        await page.click(citizenshipbyregistration.AddressList_4__Country);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyregistration.Spousestate, '45');
        await page.type(citizenshipbyregistration.AddressList_4__City, 'Cross River');

        //Citizenship Information
        await page.getByRole('heading', { name: 'Citizenship Information' }).click();
        const isDropdownOpened4 = await page.locator(citizenshipbyregistration.ciCitizenshipNationality).isVisible();
        // If the content is not visible (dropdown did not open), click again
        if (!isDropdownOpened4) {
            console.log('Dropdown not opened, clicking again...');
            await page.getByRole('heading', { name: 'Citizenship Information' }).click();
        }

        await page.selectOption(citizenshipbyregistration.ciCitizenshipNationality, '126');
        const dropdownSelector1 = citizenshipbyregistration.ciHowAcquired;
        const options = ['1', '2', '3'];
        const randomOption1 = options[Math.floor(Math.random() * options.length)];
        await page.selectOption(dropdownSelector1, randomOption1);
        console.log(`Selected option: ${randomOption1}`);
        await page.type(citizenshipbyregistration.ciPlaceOfAcquisition, 'Place of acquisition');
        await page.locator('[id="CitizenshipNationalityList\\[0\\]\\.DateOfAcquisition"]').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('8');
        await page.getByRole('link', { name: '16' }).click();

        await page.locator('li').filter({ hasText: 'Do You Intend To Live In' }).locator('#divYes').click();
        await page.locator('li').filter({ hasText: 'Are You Willing To Renounce' }).getByLabel('Yes').check();

        await page.selectOption(citizenshipbyregistration.ciCountryToRenounce, '161');
        await page.type(citizenshipbyregistration.AddressList_3, 'Cross River');
        await page.selectOption(citizenshipbyregistration.AddressList_3__Country, '161');
        await page.selectOption(citizenshipbyregistration.Motherstate, '45');
        await page.type(citizenshipbyregistration.LegalProceedingTaken, 'resrt');



        await page.getByRole('heading', { name: 'Guarantors\' Details' }).click();

        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('link', { name: 'Download' }).click();
        const download = await downloadPromise;
        await page.type(citizenshipbyregistration.gdLastName, 'Zeen');
        await page.type(citizenshipbyregistration.gdFirstName, 'Ramda');
        await page.type(citizenshipbyregistration.gdPlaceOfBirth, 'Nigeria');
        await page.selectOption(citizenshipbyregistration.gdNationality, '128');
        await page.type(citizenshipbyregistration.gdProfession, 'Engineer');
        await page.locator('#GuarantorDetailList_0__RankInProfession').fill('123');
        await page.type(citizenshipbyregistration.gdRankInProfession, '1');
        await page.locator('#DivGuarantorDetailPart-1 li').filter({ hasText: '* Date Of Birth' }).locator('span').nth(1).click();
        await page.locator('#GuarantorDetailList_0__DateOfBirth').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1999');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('8');
        await page.getByRole('link', { name: '16' }).click();
        await page.type(citizenshipbyregistration.gdHaveKnownOfGuarantor, '2 years');
        await page.type(citizenshipbyregistration.gdAddress, 'Nigeria');
        await page.selectOption(citizenshipbyregistration.gdCountry, '161');
        await page.click(citizenshipbyregistration.gdCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyregistration.gdState, '24');
        await page.type(citizenshipbyregistration.gdCity, 'Cross River');
        await page.type(citizenshipbyregistration.gdLastName1, 'Wills');
        await page.type(citizenshipbyregistration.gdFirstName1, 'Smith');
        await page.type(citizenshipbyregistration.gdPlaceOfBirth1, 'Wills')
        await page.selectOption(citizenshipbyregistration.gdNationality1, '24');
        await page.type(citizenshipbyregistration.gdProfession1, 'Proff')
        await page.type(citizenshipbyregistration.gdRankInProfession1, '12')
        await page.locator('#GuarantorDetailList_1__DateOfBirth').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1980');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('11');
        await page.getByRole('cell', { name: '18' }).click();
        await page.type(citizenshipbyregistration.gdHaveKnownOfGuarantor1, '1 Year')
        await page.type(citizenshipbyregistration.gdAddress1, 'Nigeriaa')
        await page.selectOption(citizenshipbyregistration.gdCountry1, '161');
        await page.click(citizenshipbyregistration.gdCountry1);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyregistration.gdState1, '4');
        await page.type(citizenshipbyregistration.gdCity1, 'Abia');

        //Assets Owned
        await page.getByRole('heading', { name: 'Assets Owned' }).click();

        await page.type(citizenshipbyregistration.aoPropertiesWithinNigeria, 'House, CAR');
        await page.type(citizenshipbyregistration.aoOtherAssets, 'Stocks');
        await page.type(citizenshipbyregistration.aoPropertiesOutSideNigeria, 'House');
        await page.type(citizenshipbyregistration.aoAssetssOutSideNigeria, 'Investment');
        await page.locator('#DocumentList_0__Document').first().setInputFiles('Get_Started_With_Smallpdf-output.pdf');

        await page.getByRole('heading', { name: 'Reason(s) For Application' }).click();
        await page.type(citizenshipbyregistration.ReasonOfApplication, 'Citizenship data');

        await page.getByRole('heading', { name: 'Declaration' }).click();
        const declaration = await page.getByText('do solemnly and sincerely declare that the particulars stated in the application are correct').isVisible();

        await page.getByRole('heading', { name: 'Documents Upload' }).click();


        await page.locator(citizenshipbyregistration.duPassportPhotograph).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyregistration.duBirthCertificate).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyregistration.duMarriageCetificate).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyregistration.duResidencePermit).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyregistration.du5PagesOfInternationalPassport).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyregistration.duEvidenceOfNigerianCitizenshipOfAnyParent).setInputFiles('invalid-file.txt');

        await page.locator('li').filter({ hasText: '* UPLOAD COPY OF SIGNED' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyregistration.duGuarantorLetter).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyregistration.duGuarantorPassportPhotograph).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyregistration.duGuarantorDownloadedFrom0).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyregistration.duGuarantorIdCard).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyregistration.duGuarantorLetter1).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyregistration.duGuarantorPassportPhotograph1).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyregistration.duGuarantorDownloadedFrom1).setInputFiles('invalid-file.txt');
        await page.locator(citizenshipbyregistration.duGuarantorIdCard1).setInputFiles('invalid-file.txt');

        await page.type(citizenshipbyregistration.duNecessaryDocumentName, 'Citizenship data');
        await page.locator(citizenshipbyregistration.duNecessaryDocument).setInputFiles('invalid-file.txt');

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
        await page.screenshot({ path: path.join(screenshotDir, 'citizenship_reg_invalid_file.png'), fullPage: true });

        console.log('Screenshot saved as citizenship_reg_invalid_file.png');


    });



    //Positive flow
    test.only('TC 3: Positive Flow', async () => {

        await navigateToCitizenshipForm(page);

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
        await page.selectOption(citizenshipbyregistration.piBirthCountry, '161');
        await page.click(citizenshipbyregistration.piBirthCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyregistration.piBirthState, '4');

        await page.type(citizenshipbyregistration.piCityOfBirth, 'Bauchi');

        await page.type(citizenshipbyregistration.piPreviousAddress, 'Nigera');
        await page.selectOption(citizenshipbyregistration.piPreviousCountry, '161');
        await page.click(citizenshipbyregistration.piPreviousCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyregistration.piPreviousState, '2');
        await page.type(citizenshipbyregistration.piPreviousCity, 'Cross River');
        await page.type(citizenshipbyregistration.piPresentAddress, 'Nigeria');
        await page.selectOption(citizenshipbyregistration.piPresentCountry, '161');
        await page.click(citizenshipbyregistration.piPresentCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyregistration.piPresentState, '22');
        await page.type(citizenshipbyregistration.piPresentCity, 'Abia');


        await page.getByRole('heading', { name: 'Professional Information' }).click();

        //Professional Information
        await page.getByRole('heading', { name: 'Professional Information' }).click();
        await page.waitForTimeout(2000)
        const isDropdownOpened1 = await page.locator(citizenshipbyregistration.profOccupation).isVisible();
        // If the content is not visible (dropdown did not open), click again
        if (!isDropdownOpened1) {
            console.log('Dropdown not opened, clicking again...');
            await page.getByRole('heading', { name: 'Professional Information' }).click();
        }
        await page.type(citizenshipbyregistration.profOccupation, 'Student');
        await page.type(citizenshipbyregistration.profNameOfOrganization, 'Bauchi Univerisity');
        await page.type(citizenshipbyregistration.profOrganizationType, 'Educational');
        await page.type(citizenshipbyregistration.profPositionHeld, 'Student');
        await page.locator('#DivProfessionalInformation').getByRole('button').click();
        await page.getByRole('link', { name: 'Nigerian naira' }).click();
        await page.type(citizenshipbyregistration.profAnnualIncome, '98765214');

        //Parent Information
        await page.getByRole('heading', { name: 'Parent(s) Information' }).click();
        const isDropdownOpened2 = await page.locator('#FatherDateOfBirth').isVisible();
        // If the content is not visible (dropdown did not open), click again
        if (!isDropdownOpened2) {
            console.log('Dropdown not opened, clicking again...');
            await page.getByRole('heading', { name: 'Parent(s) Information' }).click();
        }
        await page.type(citizenshipbyregistration.FatherLastName, 'Cross River');
        await page.type(citizenshipbyregistration.FatherFirstName, 'parent');
        await page.selectOption(citizenshipbyregistration.FatherCountryOfBirth, '161');
        await page.type(citizenshipbyregistration.FatherPlaceOfBirth, 'Cross River');
        await page.locator('#FatherDateOfBirth').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1981');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '7', exact: true }).click();

        await page.type(citizenshipbyregistration.AddressList_2, 'Cross River');
        await page.selectOption(citizenshipbyregistration.FatherCountry, '161');
        await page.click(citizenshipbyregistration.FatherCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyregistration.Fatherstate, '45');
        await page.type(citizenshipbyregistration.AddressList_2__City, 'Cross River');
        await page.type(citizenshipbyregistration.MotherLastName, 'Cross River');
        await page.type(citizenshipbyregistration.MotherFirstName, 'parent');
        await page.type(citizenshipbyregistration.MotherMaidenName, 'parent');
        await page.selectOption(citizenshipbyregistration.MotherCountryOfBirth, '161');
        await page.type(citizenshipbyregistration.MotherPlaceOfBirth, 'Cross River');
        await page.locator('#MotherDateOfBirth').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1990');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('5');
        await page.getByRole('link', { name: '6', exact: true }).click();

        await page.type(citizenshipbyregistration.AddressList_3, 'Cross River');
        await page.selectOption(citizenshipbyregistration.AddressList_3__Country, '161');
        await page.click(citizenshipbyregistration.AddressList_3__Country);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyregistration.Motherstate, '45');

        await page.type(citizenshipbyregistration.AddressList_3__City, 'Cross River');

        //Marital Status 
        await page.getByRole('heading', { name: 'Marital Status' }).click();

        await page.selectOption(citizenshipbyregistration.SpouseDetails, '2');

        //Spouse information
        await page.getByRole('heading', { name: 'Spouse Information' }).click();
        const isDropdownOpened3 = await page.locator('#SpouseDateOfBirth').isVisible();
        // If the content is not visible (dropdown did not open), click again
        if (!isDropdownOpened3) {
            console.log('Dropdown not opened, clicking again...');
            await page.getByRole('heading', { name: 'Parent(s) Information' }).click();
        }
        await page.type(citizenshipbyregistration.SpouseSurName, 'Cross River');
        await page.type(citizenshipbyregistration.SpouseFirstName, 'Cross River');
        await page.selectOption(citizenshipbyregistration.SpouseCountryOfBirth, '161');

        await page.locator('#SpouseDateOfBirth').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1989');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('5');
        await page.getByRole('link', { name: '26', exact: true }).click();

        await page.selectOption(citizenshipbyregistration.SpouseNationalityId, '128');
        await page.getByRole('radio', { name: 'Yes' }).check();

        await page.type(citizenshipbyregistration.AddressList_4, 'Cross River');
        await page.selectOption(citizenshipbyregistration.AddressList_4__Country, '161');
        await page.click(citizenshipbyregistration.AddressList_4__Country);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyregistration.Spousestate, '45');
        await page.type(citizenshipbyregistration.AddressList_4__City, 'Cross River');

        //Citizenship Information
        await page.getByRole('heading', { name: 'Citizenship Information' }).click();
        const isDropdownOpened4 = await page.locator(citizenshipbyregistration.ciCitizenshipNationality).isVisible();
        // If the content is not visible (dropdown did not open), click again
        if (!isDropdownOpened4) {
            console.log('Dropdown not opened, clicking again...');
            await page.getByRole('heading', { name: 'Citizenship Information' }).click();
        }

        await page.selectOption(citizenshipbyregistration.ciCitizenshipNationality, '126');
        const dropdownSelector1 = citizenshipbyregistration.ciHowAcquired;
        const options = ['1', '2', '3'];
        const randomOption1 = options[Math.floor(Math.random() * options.length)];
        await page.selectOption(dropdownSelector1, randomOption1);
        console.log(`Selected option: ${randomOption1}`);
        await page.type(citizenshipbyregistration.ciPlaceOfAcquisition, 'Place of acquisition');
        await page.locator('[id="CitizenshipNationalityList\\[0\\]\\.DateOfAcquisition"]').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('8');
        await page.getByRole('link', { name: '16' }).click();

        await page.locator('li').filter({ hasText: 'Do You Intend To Live In' }).locator('#divYes').click();
        await page.locator('li').filter({ hasText: 'Are You Willing To Renounce' }).getByLabel('Yes').check();

        await page.selectOption(citizenshipbyregistration.ciCountryToRenounce, '161');
        await page.type(citizenshipbyregistration.AddressList_3, 'Cross River');
        await page.selectOption(citizenshipbyregistration.AddressList_3__Country, '161');
        await page.selectOption(citizenshipbyregistration.Motherstate, '45');
        await page.type(citizenshipbyregistration.LegalProceedingTaken, 'resrt');



        await page.getByRole('heading', { name: 'Guarantors\' Details' }).click();

        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('link', { name: 'Download' }).click();
        const download = await downloadPromise;
        await page.type(citizenshipbyregistration.gdLastName, 'Zeen');
        await page.type(citizenshipbyregistration.gdFirstName, 'Ramda');
        await page.type(citizenshipbyregistration.gdPlaceOfBirth, 'Nigeria');
        await page.selectOption(citizenshipbyregistration.gdNationality, '128');
        await page.type(citizenshipbyregistration.gdProfession, 'Engineer');
        await page.locator('#GuarantorDetailList_0__RankInProfession').fill('123');
        await page.type(citizenshipbyregistration.gdRankInProfession, '1');
        await page.locator('#DivGuarantorDetailPart-1 li').filter({ hasText: '* Date Of Birth' }).locator('span').nth(1).click();
        await page.locator('#GuarantorDetailList_0__DateOfBirth').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1999');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('8');
        await page.getByRole('link', { name: '16' }).click();
        await page.type(citizenshipbyregistration.gdHaveKnownOfGuarantor, '2 years');
        await page.type(citizenshipbyregistration.gdAddress, 'Nigeria');
        await page.selectOption(citizenshipbyregistration.gdCountry, '161');
        await page.click(citizenshipbyregistration.gdCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyregistration.gdState, '24');
        await page.type(citizenshipbyregistration.gdCity, 'Cross River');
        await page.type(citizenshipbyregistration.gdLastName1, 'Wills');
        await page.type(citizenshipbyregistration.gdFirstName1, 'Smith');
        await page.type(citizenshipbyregistration.gdPlaceOfBirth1, 'Wills')
        await page.selectOption(citizenshipbyregistration.gdNationality1, '24');
        await page.type(citizenshipbyregistration.gdProfession1, 'Proff')
        await page.type(citizenshipbyregistration.gdRankInProfession1, '12')
        await page.locator('#GuarantorDetailList_1__DateOfBirth').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1980');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('11');
        await page.getByRole('cell', { name: '18' }).click();
        await page.type(citizenshipbyregistration.gdHaveKnownOfGuarantor1, '1 Year')
        await page.type(citizenshipbyregistration.gdAddress1, 'Nigeriaa')
        await page.selectOption(citizenshipbyregistration.gdCountry1, '161');
        await page.click(citizenshipbyregistration.gdCountry1);
        await page.keyboard.press('Escape');
        await page.selectOption(citizenshipbyregistration.gdState1, '4');
        await page.type(citizenshipbyregistration.gdCity1, 'Abia');

        //Assets Owned
        await page.getByRole('heading', { name: 'Assets Owned' }).click();

        await page.type(citizenshipbyregistration.aoPropertiesWithinNigeria, 'House, CAR');
        await page.type(citizenshipbyregistration.aoOtherAssets, 'Stocks');
        await page.type(citizenshipbyregistration.aoPropertiesOutSideNigeria, 'House');
        await page.type(citizenshipbyregistration.aoAssetssOutSideNigeria, 'Investment');
        await page.locator('#DocumentList_0__Document').first().setInputFiles('Get_Started_With_Smallpdf-output.pdf');

        await page.getByRole('heading', { name: 'Reason(s) For Application' }).click();
        await page.type(citizenshipbyregistration.ReasonOfApplication, 'Citizenship data');

        await page.getByRole('heading', { name: 'Declaration' }).click();
        const declaration = await page.getByText('do solemnly and sincerely declare that the particulars stated in the application are correct').isVisible();

        await page.getByRole('heading', { name: 'Documents Upload' }).click();


        await page.locator(citizenshipbyregistration.duPassportPhotograph).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizenshipbyregistration.duBirthCertificate).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizenshipbyregistration.duMarriageCetificate).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizenshipbyregistration.duResidencePermit).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizenshipbyregistration.du5PagesOfInternationalPassport).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizenshipbyregistration.duEvidenceOfNigerianCitizenshipOfAnyParent).setInputFiles('Get_Started_With_Smallpdf-output.pdf');

        await page.locator('li').filter({ hasText: '* UPLOAD COPY OF SIGNED' }).getByRole('textbox').setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizenshipbyregistration.duGuarantorLetter).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizenshipbyregistration.duGuarantorPassportPhotograph).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizenshipbyregistration.duGuarantorDownloadedFrom0).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizenshipbyregistration.duGuarantorIdCard).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizenshipbyregistration.duGuarantorLetter1).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizenshipbyregistration.duGuarantorPassportPhotograph1).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizenshipbyregistration.duGuarantorDownloadedFrom1).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizenshipbyregistration.duGuarantorIdCard1).setInputFiles('Get_Started_With_Smallpdf-output.pdf');

        await page.type(citizenshipbyregistration.duNecessaryDocumentName, 'Citizenship data');
        await page.locator(citizenshipbyregistration.duNecessaryDocument).setInputFiles('Get_Started_With_Smallpdf-output.pdf');

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