const { test, expect, chromium, firefox, webkit } = require('@playwright/test');


const { locators } = require('../constants/locators');
import { citizinshipform } from '../constants/locators';
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
    await page.getByRole('link', { name: 'Proceed' }).click();
    await page.getByRole('heading', { name: 'Personal Information' }).click();

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
        console.log('Screenshot saved as citizenshipleaveallfieldempty.png');
        await expect(errorMessageLocator).toHaveText('Please complete all the required field(s).');

        await page.getByRole('link', { name: 'Ok' }).click();



    });

    //Leave all mandatory field blank
    test.only('TC 2: Invalid file type', async () => {
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
        await page.selectOption(citizinshipform.piBirthCountry, '161');
        await page.click(citizinshipform.piBirthCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizinshipform.piBirthState, '4');
        await page.type(citizinshipform.piCityOfBirth, 'Bauchi');
        await page.locator('#DateFirstArrivalToNigeria').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2023');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '7', exact: true }).click();
        await page.selectOption(citizinshipform.piPresentNationality, '126');
        // Dropdown selector 
        const dropdownSelector = citizinshipform.piPresentNationalityAcquired;
        // Define the available options (e.g., '1', '2', '3')
        const options = ['1', '2', '3'];
        // Select a random option from the array
        const randomOption = options[Math.floor(Math.random() * options.length)];
        // Select the random option from the dropdown
        await page.selectOption(dropdownSelector, randomOption);
        console.log(`Selected option: ${randomOption}`);
        await page.type(citizinshipform.piPlaceOfAcquisition, 'Bauchi');
        await page.locator('#DateOfAcquisition').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('8');
        await page.getByRole('link', { name: '2', exact: true }).click();
        await page.type(citizinshipform.piPreviousAddress, 'Nigera');
        await page.selectOption(citizinshipform.piPreviousCountry, '161');
        await page.click(citizinshipform.piPreviousCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizinshipform.piPreviousState, '2');
        await page.type(citizinshipform.piPreviousCity, 'Cross River');
        await page.type(citizinshipform.piPresentAddress, 'Nigeria');
        await page.selectOption(citizinshipform.piPresentCountry, '161');
        await page.click(citizinshipform.piPresentCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizinshipform.piPresentState, '22');
        await page.type(citizinshipform.piPresentCity, 'Abia');

        //Professional Information
        await page.getByRole('heading', { name: 'Professional Information' }).click();
        await page.type(citizinshipform.profOccupation, 'Student');
        await page.type(citizinshipform.profNameOfOrganization, 'Bauchi Univerisity');
        await page.type(citizinshipform.profOrganizationType, 'Educational');
        await page.type(citizinshipform.profPositionHeld, 'Student');
        await page.locator('#DivProfessionalInformation').getByRole('button').click();
        await page.getByRole('link', { name: 'Nigerian naira' }).click();
        await page.type(citizinshipform.profMonthlySalary, '98765214');

        //Citizenship Information
        await page.getByRole('heading', { name: 'Citizenship Information' }).click();
        await page.selectOption(citizinshipform.ciCitizenshipNationality, '126');
        const dropdownSelector1 = citizinshipform.ciHowAcquired;
        const randomOption1 = options[Math.floor(Math.random() * options.length)];
        await page.selectOption(dropdownSelector1, randomOption1);
        console.log(`Selected option: ${randomOption1}`);
        await page.type(citizinshipform.ciPlaceOfAcquisition, 'Place of acquisition');
        await page.locator('[id="CitizenshipNationalityList\\[0\\]\\.DateOfAcquisition"]').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('8');
        await page.getByRole('link', { name: '16' }).click();
        await page.type(citizinshipform.ciForeignLanguage, 'Hindi');

        const languageProficiencyOptions = ['Excellent', 'Good', 'Fair'];
        // Select a random option from the array
        const randomOption2 = languageProficiencyOptions[Math.floor(Math.random() * languageProficiencyOptions.length)];
        // Dynamically locate and check the randomly selected option
        await page.waitForTimeout(1000)
        console.log(randomOption2)
        await page.locator('#divLanguageForeignPart-1').getByLabel(randomOption2).check();

        await page.getByRole('button', { name: 'Add More Foreign Languages' }).click();

        const randomOption3 = languageProficiencyOptions[Math.floor(Math.random() * languageProficiencyOptions.length)];
        await page.type(citizinshipform.ciForeignLanguage1, 'Chinese');
        await page.locator('#divLanguageForeignPart-2').getByLabel(randomOption3).check();
        console.log(randomOption3)

        await page.getByRole('button', { name: 'Add More Foreign Languages' }).click();
        const randomOption4 = languageProficiencyOptions[Math.floor(Math.random() * languageProficiencyOptions.length)];
        await page.type(citizinshipform.ciForeignLanguage2, 'English');
        await page.locator('#divLanguageForeignPart-3').getByLabel(randomOption4).check();
        console.log(randomOption4)

        await page.click(citizinshipform.ciRemoveLanguage);
        await page.getByRole('link', { name: 'Ok' }).click();

        await page.type(citizinshipform.ciIndegenousLanguage, 'Nigerian');
        const randomOption5 = languageProficiencyOptions[Math.floor(Math.random() * languageProficiencyOptions.length)];
        await page.locator('#divLanguageIndigenousPart-1').getByLabel(randomOption5).check();
        console.log(randomOption5)

        await page.selectOption(citizinshipform.ciVisitedCountry, '38');
        await page.locator('#Edit_FromDate_0').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('6');
        await page.getByRole('link', { name: '1', exact: true }).click();
        await page.locator('#Edit_ToDate_0').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('7');
        await page.getByRole('link', { name: '31' }).click();
        await page.type(citizinshipform.ciPurposeOfVisit, 'Bussiness');
        await page.getByText('Yes').first().click();
        await page.locator('li').filter({ hasText: 'Do You Intend To Live In' }).getByLabel('Yes').check();
        await page.getByText('Yes').nth(1).click();
        await page.locator('li').filter({ hasText: 'Are You Willing To Renounce' }).getByLabel('Yes').click();
        await page.selectOption(citizinshipform.ciCountryToRenounce, '159');

        //Assets Owned
        await page.getByRole('heading', { name: 'Assets Owned' }).click();
        await page.type(citizinshipform.aoPropertiesWithinNigeria, 'House, CAR');
        await page.type(citizinshipform.aoOtherAssets, 'Stocks');
        await page.type(citizinshipform.aoPropertiesOutSideNigeria, 'House');
        await page.type(citizinshipform.aoAssetssOutSideNigeria, 'Investment');
        await page.locator('#DocumentList_0__Document').first().setInputFiles('invalid-file.txt');

        //Details Of Dependants
        await page.getByRole('heading', { name: 'Details Of Dependants' }).click();
        await page.type(citizinshipform.ddLastName, 'Willaim');
        await page.type(citizinshipform.ddFirstName, 'Headwick');
        await page.locator('#dtDependantsDOB').click();
        await page.getByText('PrevNextJanFebMarAprMayJunJulAugSepOct190019011902190319041905190619071908190919').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2000');
        await page.getByRole('link', { name: '3', exact: true }).click();
        await page.selectOption(citizinshipform.ddCountryOfBirth, '156');
        await page.type(citizinshipform.ddRelationshipWithDependant, 'Spouse');
        await page.type(citizinshipform.ddAnnualSupportDependent, '15818848');
        await page.type(citizinshipform.ddResidentialAddressInNigeria, 'Nigeria,Cross River');
        await page.locator('#DDLDependantcountry_0').selectOption('46');
        await page.selectOption(citizinshipform.ddCountry, '46');
        await page.click(citizinshipform.ddCountry);
        await page.keyboard.press('Escape');
        await page.type(citizinshipform.ddResidentialCityInNigeria, 'Cross River');
        await page.type(citizinshipform.ddResidentialAddressOutsideNigeria, 'Altanta');
        await page.selectOption(citizinshipform.ddResidentialCountryIsOutsideNigeria, '105');
        await page.click(citizinshipform.ddResidentialCountryIsOutsideNigeria);
        await page.keyboard.press('Escape');
        await page.selectOption(citizinshipform.ddResidentialStateOutsideNigeria, '1558');

        await page.locator('#DependantsDetails_ResidentialCityInNigeria').nth(1).fill('Rafa');
        //await page.type(citizinshipform.ddResidentialCityOutNigeria).nth(1).type('Rafa');;
        await page.type(citizinshipform.ddPermanentResidentialAddress, 'Nigeria');
        await page.selectOption(citizinshipform.ddPermanentResidentialCountryId, '155');
        await page.click(citizinshipform.ddPermanentResidentialCountryId);
        await page.keyboard.press('Escape');
        await page.selectOption(citizinshipform.ddPermanentResidentialStateId, '2331');
        await page.type(citizinshipform.ddPermanentResidentialCity, 'Zeen');

        //Guarantor's Details
        await page.getByRole('heading', { name: 'Guarantors’ Details' }).click();
        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('link', { name: 'Download' }).click();
        const download = await downloadPromise;
        await page.type(citizinshipform.gdLastName, 'Zeen');
        await page.type(citizinshipform.gdFirstName, 'Ramda');
        await page.type(citizinshipform.gdPlaceOfBirth, 'Nigeria');
        await page.selectOption(citizinshipform.gdNationality, '128');
        await page.type(citizinshipform.gdProfession, 'Engineer');
        await page.locator('#GuarantorDetailList_0__RankInProfession').fill('123');
        await page.type(citizinshipform.gdRankInProfession, '1');
        await page.locator('#DivGuarantorDetailPart-1 li').filter({ hasText: '* Date Of Birth' }).locator('span').nth(1).click();
        await page.locator('#GuarantorDetailList_0__DateOfBirth').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1999');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('8');
        await page.getByRole('link', { name: '16' }).click();
        await page.type(citizinshipform.gdHaveKnownOfGuarantor, '2 years');
        await page.type(citizinshipform.gdAddress, 'Nigeria');
        await page.selectOption(citizinshipform.gdCountry, '161');
        await page.click(citizinshipform.gdCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizinshipform.gdState, '24');
        await page.type(citizinshipform.gdCity, 'Cross River');
        await page.type(citizinshipform.gdLastName1, 'Wills');
        await page.type(citizinshipform.gdFirstName1, 'Smith');
        await page.type(citizinshipform.gdPlaceOfBirth1, 'Wills')
        await page.selectOption(citizinshipform.gdNationality1, '24');
        await page.type(citizinshipform.gdProfession1, 'Proff')
        await page.type(citizinshipform.gdRankInProfession1, '12')
        await page.locator('#GuarantorDetailList_1__DateOfBirth').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1980');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('11');
        await page.getByRole('cell', { name: '18' }).click();
        await page.type(citizinshipform.gdHaveKnownOfGuarantor1, '1 Year')
        await page.type(citizinshipform.gdAddress1, 'Nigeriaa')
        await page.selectOption(citizinshipform.gdCountry1, '161');
        await page.click(citizinshipform.gdCountry1);
        await page.keyboard.press('Escape');
        await page.selectOption(citizinshipform.gdState1, '4');
        await page.type(citizinshipform.gdCity1, 'Abia');

        //Reason For Application
        await page.getByRole('heading', { name: 'Reason(s) For Application' }).click();
        await page.type(citizinshipform.ReasonOfApplication, 'Citizenship data');

        //Declaration
        await page.getByRole('heading', { name: 'Declaration' }).click();
        const declaration = await page.getByText('do solemnly and sincerely declare that the particulars stated in the application are correct').isVisible();

        //Documents Upload
        await page.getByRole('heading', { name: 'Documents Upload' }).click();

        await page.locator(citizinshipform.duPassportPhotograph).setInputFiles('invalid-file.txt');
        await page.locator(citizinshipform.duBirthCertificate).setInputFiles('invalid-file.txt');
        await page.locator(citizinshipform.du5PagesOfInternationalPassport).setInputFiles('invalid-file.txt');
        await page.locator(citizinshipform.duEvidenceOLivelihood).setInputFiles('invalid-file.txt');
        await page.locator(citizinshipform.duTaxclearanceCertificate).setInputFiles('invalid-file.txt');
        await page.locator(citizinshipform.duResidencePermit).setInputFiles('invalid-file.txt');
        await page.locator(citizinshipform.duEvidenceOfSocioEconomicContributions).setInputFiles('invalid-file.txt');
        await page.locator('li').filter({ hasText: '* UPLOAD COPY OF SIGNED' }).getByRole('textbox').setInputFiles('invalid-file.txt');
        await page.locator(citizinshipform.duGuarantorDownloadedFrom).setInputFiles('invalid-file.txt');
        await page.locator(citizinshipform.duGuarantorPassportPhotograph).setInputFiles('invalid-file.txt');
        await page.locator(citizinshipform.duGuarantorCurriculumVitae).setInputFiles('invalid-file.txt');
        await page.locator(citizinshipform.duGuarantorIdCard).setInputFiles('invalid-file.txt');
        await page.locator(citizinshipform.duGuarantorDownloadedFrom1).setInputFiles('invalid-file.txt');
        await page.locator(citizinshipform.duGuarantorPassportPhotograph1).setInputFiles('invalid-file.txt');
        await page.locator(citizinshipform.duGuarantorCurriculumVitae1).setInputFiles('invalid-file.txt');
        await page.locator(citizinshipform.duGuarantorIdCard1).setInputFiles('invalid-file.txt');
        await page.type(citizinshipform.duNecessaryDocumentName, 'Citizenship data');
        await page.locator(citizinshipform.duNecessaryDocument).setInputFiles('invalid-file.txt');

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
        await page.screenshot({ path: path.join(screenshotDir, 'citizenship_invalid_file.png'), fullPage: true });

        console.log('Screenshot saved as citizenship_invalid_file.png');


    });



    //Positive flow
    test('TC 3: Positive Flow', async () => {
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
        await page.selectOption(citizinshipform.piBirthCountry, '161');
        await page.click(citizinshipform.piBirthCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizinshipform.piBirthState, '4');
        await page.type(citizinshipform.piCityOfBirth, 'Bauchi');
        await page.locator('#DateFirstArrivalToNigeria').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2023');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '7', exact: true }).click();
        await page.selectOption(citizinshipform.piPresentNationality, '126');
        // Dropdown selector 
        const dropdownSelector = citizinshipform.piPresentNationalityAcquired;
        // Define the available options (e.g., '1', '2', '3')
        const options = ['1', '2', '3'];
        // Select a random option from the array
        const randomOption = options[Math.floor(Math.random() * options.length)];
        // Select the random option from the dropdown
        await page.selectOption(dropdownSelector, randomOption);
        console.log(`Selected option: ${randomOption}`);
        await page.type(citizinshipform.piPlaceOfAcquisition, 'Bauchi');
        await page.locator('#DateOfAcquisition').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('8');
        await page.getByRole('link', { name: '2', exact: true }).click();
        await page.type(citizinshipform.piPreviousAddress, 'Nigera');
        await page.selectOption(citizinshipform.piPreviousCountry, '161');
        await page.click(citizinshipform.piPreviousCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizinshipform.piPreviousState, '2');
        await page.type(citizinshipform.piPreviousCity, 'Cross River');
        await page.type(citizinshipform.piPresentAddress, 'Nigeria');
        await page.selectOption(citizinshipform.piPresentCountry, '161');
        await page.click(citizinshipform.piPresentCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizinshipform.piPresentState, '22');
        await page.type(citizinshipform.piPresentCity, 'Abia');

        //Professional Information
        await page.getByRole('heading', { name: 'Professional Information' }).click();
        await page.type(citizinshipform.profOccupation, 'Student');
        await page.type(citizinshipform.profNameOfOrganization, 'Bauchi Univerisity');
        await page.type(citizinshipform.profOrganizationType, 'Educational');
        await page.type(citizinshipform.profPositionHeld, 'Student');
        await page.locator('#DivProfessionalInformation').getByRole('button').click();
        await page.getByRole('link', { name: 'Nigerian naira' }).click();
        await page.type(citizinshipform.profMonthlySalary, '98765214');

        //Citizenship Information
        await page.getByRole('heading', { name: 'Citizenship Information' }).click();
        await page.selectOption(citizinshipform.ciCitizenshipNationality, '126');
        const dropdownSelector1 = citizinshipform.ciHowAcquired;
        const randomOption1 = options[Math.floor(Math.random() * options.length)];
        await page.selectOption(dropdownSelector1, randomOption1);
        console.log(`Selected option: ${randomOption1}`);
        await page.type(citizinshipform.ciPlaceOfAcquisition, 'Place of acquisition');
        await page.locator('[id="CitizenshipNationalityList\\[0\\]\\.DateOfAcquisition"]').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('8');
        await page.getByRole('link', { name: '16' }).click();
        await page.type(citizinshipform.ciForeignLanguage, 'Hindi');

        const languageProficiencyOptions = ['Excellent', 'Good', 'Fair'];
        // Select a random option from the array
        const randomOption2 = languageProficiencyOptions[Math.floor(Math.random() * languageProficiencyOptions.length)];
        // Dynamically locate and check the randomly selected option
        await page.waitForTimeout(2000)
        console.log(randomOption2)
        await page.locator('#divLanguageForeignPart-1').getByLabel(randomOption2).check();

        await page.getByRole('button', { name: 'Add More Foreign Languages' }).click();

        const randomOption3 = languageProficiencyOptions[Math.floor(Math.random() * languageProficiencyOptions.length)];
        await page.type(citizinshipform.ciForeignLanguage1, 'Chinese');
        await page.locator('#divLanguageForeignPart-2').getByLabel(randomOption3).check();
        console.log(randomOption3)

        await page.getByRole('button', { name: 'Add More Foreign Languages' }).click();
        const randomOption4 = languageProficiencyOptions[Math.floor(Math.random() * languageProficiencyOptions.length)];
        await page.type(citizinshipform.ciForeignLanguage2, 'English');
        await page.locator('#divLanguageForeignPart-3').getByLabel(randomOption4).check();
        console.log(randomOption4)

        await page.click(citizinshipform.ciRemoveLanguage);
        await page.getByRole('link', { name: 'Ok' }).click();

        await page.type(citizinshipform.ciIndegenousLanguage, 'Nigerian');
        const randomOption5 = languageProficiencyOptions[Math.floor(Math.random() * languageProficiencyOptions.length)];
        await page.locator('#divLanguageIndigenousPart-1').getByLabel(randomOption5).check();
        console.log(randomOption5)

        await page.selectOption(citizinshipform.ciVisitedCountry, '38');
        await page.locator('#Edit_FromDate_0').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('6');
        await page.getByRole('link', { name: '1', exact: true }).click();
        await page.locator('#Edit_ToDate_0').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('7');
        await page.getByRole('link', { name: '31' }).click();
        await page.type(citizinshipform.ciPurposeOfVisit, 'Bussiness');
        await page.getByText('Yes').first().click();
        await page.locator('li').filter({ hasText: 'Do You Intend To Live In' }).getByLabel('Yes').check();
        await page.getByText('Yes').nth(1).click();
        await page.locator('li').filter({ hasText: 'Are You Willing To Renounce' }).getByLabel('Yes').click();
        await page.selectOption(citizinshipform.ciCountryToRenounce, '159');

        //Assets Owned
        await page.getByRole('heading', { name: 'Assets Owned' }).click();
        await page.type(citizinshipform.aoPropertiesWithinNigeria, 'House, CAR');
        await page.type(citizinshipform.aoOtherAssets, 'Stocks');
        await page.type(citizinshipform.aoPropertiesOutSideNigeria, 'House');
        await page.type(citizinshipform.aoAssetssOutSideNigeria, 'Investment');
        await page.locator('#DocumentList_0__Document').first().setInputFiles('Get_Started_With_Smallpdf-output.pdf');

        //Details Of Dependants
        await page.getByRole('heading', { name: 'Details Of Dependants' }).click();
        await page.type(citizinshipform.ddLastName, 'Willaim');
        await page.type(citizinshipform.ddFirstName, 'Headwick');
        await page.locator('#dtDependantsDOB').click();
        await page.getByText('PrevNextJanFebMarAprMayJunJulAugSepOct190019011902190319041905190619071908190919').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2000');
        await page.getByRole('link', { name: '3', exact: true }).click();
        await page.selectOption(citizinshipform.ddCountryOfBirth, '156');
        await page.type(citizinshipform.ddRelationshipWithDependant, 'Spouse');
        await page.type(citizinshipform.ddAnnualSupportDependent, '15818848');
        await page.type(citizinshipform.ddResidentialAddressInNigeria, 'Nigeria,Cross River');
        await page.locator('#DDLDependantcountry_0').selectOption('46');
        await page.selectOption(citizinshipform.ddCountry, '46');
        await page.click(citizinshipform.ddCountry);
        await page.keyboard.press('Escape');
        await page.type(citizinshipform.ddResidentialCityInNigeria, 'Cross River');
        await page.type(citizinshipform.ddResidentialAddressOutsideNigeria, 'Altanta');
        await page.selectOption(citizinshipform.ddResidentialCountryIsOutsideNigeria, '105');
        await page.click(citizinshipform.ddResidentialCountryIsOutsideNigeria);
        await page.keyboard.press('Escape');
        await page.selectOption(citizinshipform.ddResidentialStateOutsideNigeria, '1558');

        await page.locator('#DependantsDetails_ResidentialCityInNigeria').nth(1).fill('Rafa');
        //await page.type(citizinshipform.ddResidentialCityOutNigeria).nth(1).type('Rafa');;
        await page.type(citizinshipform.ddPermanentResidentialAddress, 'Nigeria');
        await page.selectOption(citizinshipform.ddPermanentResidentialCountryId, '155');
        await page.click(citizinshipform.ddPermanentResidentialCountryId);
        await page.keyboard.press('Escape');
        await page.selectOption(citizinshipform.ddPermanentResidentialStateId, '2331');
        await page.type(citizinshipform.ddPermanentResidentialCity, 'Zeen');

        //Guarantor's Details
        await page.getByRole('heading', { name: 'Guarantors’ Details' }).click();
        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('link', { name: 'Download' }).click();
        const download = await downloadPromise;
        await page.type(citizinshipform.gdLastName, 'Zeen');
        await page.type(citizinshipform.gdFirstName, 'Ramda');
        await page.type(citizinshipform.gdPlaceOfBirth, 'Nigeria');
        await page.selectOption(citizinshipform.gdNationality, '128');
        await page.type(citizinshipform.gdProfession, 'Engineer');
        await page.locator('#GuarantorDetailList_0__RankInProfession').fill('123');
        await page.type(citizinshipform.gdRankInProfession, '1');
        await page.locator('#DivGuarantorDetailPart-1 li').filter({ hasText: '* Date Of Birth' }).locator('span').nth(1).click();
        await page.locator('#GuarantorDetailList_0__DateOfBirth').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1999');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('8');
        await page.getByRole('link', { name: '16' }).click();
        await page.type(citizinshipform.gdHaveKnownOfGuarantor, '2 years');
        await page.type(citizinshipform.gdAddress, 'Nigeria');
        await page.selectOption(citizinshipform.gdCountry, '161');
        await page.click(citizinshipform.gdCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(citizinshipform.gdState, '24');
        await page.type(citizinshipform.gdCity, 'Cross River');
        await page.type(citizinshipform.gdLastName1, 'Wills');
        await page.type(citizinshipform.gdFirstName1, 'Smith');
        await page.type(citizinshipform.gdPlaceOfBirth1, 'Wills')
        await page.selectOption(citizinshipform.gdNationality1, '24');
        await page.type(citizinshipform.gdProfession1, 'Proff')
        await page.type(citizinshipform.gdRankInProfession1, '12')
        await page.locator('#GuarantorDetailList_1__DateOfBirth').click();
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('1980');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('11');
        await page.getByRole('cell', { name: '18' }).click();
        await page.type(citizinshipform.gdHaveKnownOfGuarantor1, '1 Year')
        await page.type(citizinshipform.gdAddress1, 'Nigeriaa')
        await page.selectOption(citizinshipform.gdCountry1, '161');
        await page.click(citizinshipform.gdCountry1);
        await page.keyboard.press('Escape');
        await page.selectOption(citizinshipform.gdState1, '4');
        await page.type(citizinshipform.gdCity1, 'Abia');

        //Reason For Application
        await page.getByRole('heading', { name: 'Reason(s) For Application' }).click();
        await page.type(citizinshipform.ReasonOfApplication, 'Citizenship data');

        //Declaration
        await page.getByRole('heading', { name: 'Declaration' }).click();
        const declaration = await page.getByText('do solemnly and sincerely declare that the particulars stated in the application are correct').isVisible();

        //Documents Upload
        await page.getByRole('heading', { name: 'Documents Upload' }).click();

        await page.locator(citizinshipform.duPassportPhotograph).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizinshipform.duBirthCertificate).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizinshipform.du5PagesOfInternationalPassport).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizinshipform.duEvidenceOLivelihood).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizinshipform.duTaxclearanceCertificate).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizinshipform.duResidencePermit).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizinshipform.duEvidenceOfSocioEconomicContributions).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator('li').filter({ hasText: '* UPLOAD COPY OF SIGNED' }).getByRole('textbox').setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizinshipform.duGuarantorDownloadedFrom).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizinshipform.duGuarantorPassportPhotograph).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizinshipform.duGuarantorCurriculumVitae).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizinshipform.duGuarantorIdCard).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizinshipform.duGuarantorDownloadedFrom1).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizinshipform.duGuarantorPassportPhotograph1).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizinshipform.duGuarantorCurriculumVitae1).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.locator(citizinshipform.duGuarantorIdCard1).setInputFiles('Get_Started_With_Smallpdf-output.pdf');
        await page.type(citizinshipform.duNecessaryDocumentName, 'Citizenship data');
        await page.locator(citizinshipform.duNecessaryDocument).setInputFiles('Get_Started_With_Smallpdf-output.pdf');

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