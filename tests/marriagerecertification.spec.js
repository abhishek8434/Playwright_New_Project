const { test, expect, chromium, firefox, webkit } = require('@playwright/test');


const { locators } = require('../constants/locators');
import { citizenshipbachelorhood, marriagecertification } from '../constants/locators';

import { getRandomNumber } from "../utils/helper.js";


const path = require('path');
const fs = require('fs');
import * as dotenv from "dotenv";
import { faker } from '@faker-js/faker';
import { addressradio, addressradio1, marriagecounduted, livingfatherhusband, livingfatherwife } from '../utils/helper.js';

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

function generateNigerianPhoneNumber1() {
    // Array of valid prefixes
    const prefixes = ['803', '806', '813']; // Common prefixes for Nigerian networks

    // Randomly select a prefix from the array
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];

    const randomPhoneBody = faker.string.numeric(7); // Generate a 7-digit number
    return `${randomPrefix}-${randomPhoneBody.slice(0, 4)} ${randomPhoneBody.slice(4)}`; // Format the number
}

const phone = generateNigerianPhoneNumber()
const phone1 = generateNigerianPhoneNumber1()

const formData = {
    firstName,
    lastName,
    email,
    phone,
    phone1
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
        await page.getByRole('link', { name: 'Apply For Confirmation Of' }).click();
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
        


        await page.getByRole('button', { name: 'Proceed To Payment' }).click();
        const errorMessageLocator = page.locator('text=Please complete all the required field(s).');
        await expect(errorMessageLocator).toBeVisible({ timeout: 10000 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(screenshotDir, 'applicationformarriagerecertification.png'), fullPage: true });
        console.log('Screenshot saved as applicationformarriagerecertification.png');
        await expect(errorMessageLocator).toHaveText('Please complete all the required field(s).');

        await page.getByRole('link', { name: 'Ok' }).click();



    });

    //Invalid file type
    test('TC 2: Invalid file type', async () => {
        

        await page.click(marriagecertification.dateOfMarriage);
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2023');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '16' }).click();

    
        const stategoverment = await page.locator(marriagecertification.stategovenment);
        const placeofworship = await page.locator(marriagecertification.placeofworship);
        marriagecounduted[getRandomNumber(0, 1)] === "stategovernment"
            ? await stategoverment.check()
            : await placeofworship.check();

        if (await stategoverment.isChecked()) {
            console.log("Executed flow for 'state gover");
              // Handle 'State/Local Government' flow
            //await page.getByText('State/Local Government', { exact: true }).click();

            await page.selectOption(marriagecertification.RegistryStateId, '46');
            await page.selectOption(marriagecertification.RegistryLocalGovArea, '1686');
            await page.type(marriagecertification.RegistryName, 'venue name');

            console.log("Executed flow for 'State/Local Government'");
        } else {
            console.log("Executed flow for 'placeofworship.");
            // Handle 'Place of Worship' flow
            await page.getByText('Place of Worship', { exact: true }).click();

            await page.selectOption(marriagecertification.WorshipStateId, '46');
            await page.selectOption(marriagecertification.WorshipLocalGovArea, '1686');
            await page.type(marriagecertification.WorshipName, 'venue name');

            console.log("Executed flow for 'Place of Worship'");
        }

        await page.locator('li').filter({ hasText: '* Please Upload Photograph' }).getByRole('textbox').setInputFiles('invalid-file.txt');

        const selectyes = await page.locator(marriagecertification.uploadEvidenceOptionYes);
        const selectno = await page.locator(marriagecertification.uploadEvidenceOptionNo);
        addressradio1[getRandomNumber(0, 1)] === "yes"
            ? await selectyes.check()
            : await selectno.check();

        if (await selectyes.isChecked()) {
            console.log("Executed flow for 'Yes");
            //await page.locator('li').filter({ hasText: '* Upload Certified True Copy Of Marriage Certificate Upload Evindence Of' }).getByRole('textbox').setInputFiles('invalid-file.txt');
            await page.locator(marriagecertification.certifiedtrucopy).setInputFiles('invalid-file.txt');
        } else {
            console.log("Executed flow for 'No.");
            //await page.locator('li').filter({ hasText: '* Upload Certified True Copy Of Marriage Certificate Upload Upload Cancel *' }).getByRole('textbox').setInputFiles('invalid-file.txt');
            await page.locator(marriagecertification.policeextract).setInputFiles('invalid-file.txt');
        }

        await page.locator('li').filter({ hasText: '* Please Upload Court' }).getByRole('textbox').setInputFiles('invalid-file.txt');

       
        // Select Discount Type
        const registrycheck = await page.locator(marriagecertification.registry);
        const postalcheck = await page.locator(marriagecertification.postal);

        addressradio[getRandomNumber(0, 1)] === "Registry"
            ? await postalcheck.check()
            : await registrycheck.check();

        if (await registrycheck.isChecked()) {
            console.log("Registry option is selected.");
            await page.selectOption(marriagecertification.CertificatePickupRegistryState, '45');
            await page.selectOption(marriagecertification.PickupRegistry, '1025');
        } else {
            console.log("postal option is selected.");
            await page.type(marriagecertification.ContactName, 'Contact Name');
            //await page.locator('#PhoneNumber').click();
            await page.type(marriagecertification.PhoneNumber, phone1);
            await page.type(marriagecertification.ResidentialAddress, 'Residential Address');
            await page.selectOption(marriagecertification.Country, '161');
            await page.click(marriagecertification.Country);
            await page.keyboard.press('Escape');

            await page.selectOption(marriagecertification.State, '24');
            await page.locator('input[name="City"]').fill('test');
            await page.selectOption(marriagecertification.PickupRegistryState, '24');
            await page.selectOption(marriagecertification.PostalAddressRegistry, '1039');
        }


        //husband marriage details 
        await page.getByRole('heading', { name: 'Husband Marriage Details' }).click();

        const option = ['1', '2', '3', '4', '5'];

        // Pick a random option from the array
        const randomOption = option[Math.floor(Math.random() * option.length)];

        // Select the randomly chosen option
        await page.locator(marriagecertification.HusbandTitle).selectOption(randomOption);

        // Fetch the visible text of the selected option
        const selectedText = await page.$eval(
            `${marriagecertification.HusbandTitle} option[value="${randomOption}"]`,
            option => option.textContent.trim()
        );

        console.log(`Randomly selected option: ${randomOption}`);
        console.log(`Visible text for selected option: ${selectedText}`);


        await page.type(marriagecertification.HusbandLastName, formData.lastName)
        await page.type(marriagecertification.HusbandFirstName, formData.firstName)

        await page.click(marriagecertification.husbandDateofbirth);
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2023');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '7', exact: true }).click();

        await page.locator(marriagecertification.husbandlegalconsentfromguardian).getByRole('textbox').setInputFiles('invalid-file.txt');

        await page.type(marriagecertification.HusbandAddress, ' husband address');
        await page.type(marriagecertification.HusbandOccupation, 'Husband occupation ')
        await page.type(marriagecertification.HusbandFirstNameOfFather, formData.firstName)
        
        const living1 = await page.locator(marriagecertification.living);
        const deceased1 = await page.locator(marriagecertification.deceased);

        livingfatherhusband[getRandomNumber(0, 1)] === "living"
            ? await deceased1.check()
            : await living1.check();

        if (await living1.isChecked()) {
            console.log("living option is selected.");
            await page.type(marriagecertification.HusbandFatherOccupation, 'Father Occupation');
            console.log("Selected 'Living' and entered Father Occupation");
        } else {
            console.log("Selected 'Deceased'");
        }



        await page.getByRole('heading', { name: 'Husband Information' }).click();

        await page.type(marriagecertification.HusbandPlaceOfBirth, 'Husband Place Of birth');
        await page.selectOption(marriagecertification.HusbandCountry, '161');
        await page.selectOption(marriagecertification.HusbandStateOrigin, '46');
        await page.selectOption(marriagecertification.husbandLocalarea, '1697');


        const option1 = ['1', '2', '3', '4'];

        // Pick a random option from the array
        const randomOption1 = option1[Math.floor(Math.random() * option1.length)];

        // Select the randomly chosen option
        await page.locator(marriagecertification.PersonalIdentityTypeOfHusband).selectOption(randomOption1);

        // Fetch the visible text of the selected option
        const selectedText1 = await page.$eval(
            `${marriagecertification.PersonalIdentityTypeOfHusband} option[value="${randomOption1}"]`,
            option => option.textContent.trim() // Get the visible name
        );

        console.log(`Randomly selected option: ${randomOption1}`);
        console.log(`Visible text for selected option: ${selectedText1}`);

        // Add the conditional logic
        if (['1', '2', '3', '4'].includes(randomOption1)) {
            console.log("no change required ");
            // Add your logic for options 1-6 here
        } else {
            console.log("Executing flow for option 5...");

            await page.type(marriagecertification.OtherPersonalIdentityTypeOfHusband, ' Other Personal identity of wife')
        }


        await page.type(marriagecertification.PersonalIdentityOfHusband, 'Identify of husband')
        await page.setInputFiles(marriagecertification.HusbandIdentification, 'invalid-file.txt')


        await page.locator('#li_HusbandPassport').getByRole('textbox').setInputFiles('invalid-file.txt');


        await page.selectOption(marriagecertification.HusbandCurrentCountry, '161')

        await page.click(marriagecertification.HusbandCurrentCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(marriagecertification.HusbandCurrentState, '24')
        await page.selectOption(marriagecertification.husbandCurrentLGA, '1187')
        await page.type(marriagecertification.HusbandCurrentResidenceAddress, 'Current residence of husband')

        await page.locator('input[name="HusbandDocumentsList\\[0\\]\\.Name"]').type('tesfff');
        await page.locator('input[name="HusbandDocumentsList\\[0\\]\\.Document"]').setInputFiles('invalid-file.txt');


        await page.getByRole('heading', { name: 'Wife Marriage Details' }).click();


        const option2 = ['1', '2', '3', '4', '5', '6', '7'];

        // Pick a random option from the array
        const randomOption2 = option2[Math.floor(Math.random() * option2.length)];

        // Select the randomly chosen option

        await page.locator(marriagecertification.WifeTitle).selectOption(randomOption2);

        // Fetch the visible text of the selected option
        const selectedText2 = await page.$eval(
            `${marriagecertification.WifeTitle} option[value="${randomOption2}"]`,
            optionElement => optionElement.textContent.trim() // Changed the parameter name for clarity
        );

        console.log(`Randomly selected option: ${randomOption2}`);
        console.log(`Visible text for selected option: ${selectedText2}`);

        await page.type(marriagecertification.WifeLastName, lastName)
        await page.type(marriagecertification.WifeFirstName, firstName)


        await page.click(marriagecertification.wifeDateofbirth)
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2023');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '8', exact: true }).click();

        await page.locator(marriagecertification.wifelegalconsentfromguardian).getByRole('textbox').setInputFiles('invalid-file.txt');

        await page.locator('#WifeAddress').click();
        await page.type(marriagecertification.WifeAddress, 'wife address')
        await page.type(marriagecertification.WifeOccupation, 'wife occupation ')
        await page.type(marriagecertification.WifeFirstNameOfFather, 'wife father name ')

        const living = await page.locator(marriagecertification.livingwife);
        const deceased = await page.locator(marriagecertification.deceasedwife);

        livingfatherwife[getRandomNumber(0, 1)] === "living"
            ? await deceased.check()
            : await living.check();

        if (await living.isChecked()) {
            console.log("living option is selected.");
            await page.getByText('Living').nth(1).click();
            await page.locator('#txtWifeFatherOccupation').click();
            await page.type(marriagecertification.WifeFatherOccupation, 'wife father occupation');
            console.log("Selected 'Living' and entered wife's father occupation");
        
        } else {
            console.log("Selected 'Deceased'");
        }

        await page.getByRole('heading', { name: 'Wife Information' }).click();

        await page.locator('#WifePhone').click();
        await page.type(marriagecertification.WifePhone, phone)
        await page.type(marriagecertification.WifeEmail, email)
        await page.type(marriagecertification.WifePlaceOfBirth, 'wife place of birth')

        await page.selectOption(marriagecertification.WifeCountry, '161')
        await page.click(marriagecertification.WifeCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(marriagecertification.WifeStateOrigin, '24')
        await page.selectOption(marriagecertification.wifeLocalarea, '1197')


        const option3 = ['1', '2', '3', '4', '5'];


        // Pick a random option from the array
        const randomOption3 = option3[Math.floor(Math.random() * option3.length)];

        // Select the randomly chosen option
        await page.locator(marriagecertification.PersonalIdentityTypeOfWife).selectOption(randomOption3);

        // Fetch the visible text of the selected option
        const selectedText3 = await page.$eval(
            `${marriagecertification.PersonalIdentityTypeOfWife} option[value="${randomOption3}"]`,
            optionElement => optionElement.textContent.trim() // Renamed for better clarity
        );

        console.log(`Randomly selected option: ${randomOption3}`);
        console.log(`Visible text for selected option: ${selectedText3}`);


        // Add the conditional logic
        if (['1', '2', '3', '4'].includes(randomOption3)) {
            console.log("no change required ");
            // Add your logic for options 1-6 here
        } else {
            console.log("Executing flow for option 5...");

            await page.type(marriagecertification.OtherPersonalIdentityTypeOfWife, ' Other Personal identity of wife')
        }


        await page.type(marriagecertification.PersonalIdentityOfWife, 'Personal identity of wife')



        await page.locator('li').filter({ hasText: '* Upload Identification Document Upload Upload Cancel' }).getByRole('textbox').setInputFiles('invalid-file.txt');

        await page.locator('li').filter({ hasText: '* Upload Wife Current' }).getByRole('textbox').setInputFiles('invalid-file.txt');


        await page.selectOption(marriagecertification.WifeCurrentCountry, '161')
        await page.selectOption(marriagecertification.WifeCurrentState, '46')
        await page.selectOption(marriagecertification.WifeCurrentLGA, '1689')


        await page.type(marriagecertification.WifeCurrentResidenceAddress, 'wife current residence address')


        await page.locator('input[name="WifeDocumentsList\\[0\\]\\.Name"]').type('test');
        await page.locator('#genwifeDocFilePart-1').setInputFiles('invalid-file.txt');


        await page.getByRole('heading', { name: 'Witness Details' }).click();
        await page.type(marriagecertification.Witness1FirstName, formData.firstName)
        await page.type(marriagecertification.Witness1LastName, formData.lastName)

        await page.type(marriagecertification.Witness2FirstName, formData.firstName)
        await page.type(marriagecertification.Witness2LastName, formData.lastName)


        await page.getByRole('heading', { name: 'Upload Documents' }).click();


        await page.locator('li').filter({ hasText: '* Upload Formal Application' }).getByRole('textbox').setInputFiles('invalid-file.txt');

        await page.locator('li').filter({ hasText: '* Upload Data Page of Husband' }).getByRole('textbox').setInputFiles('invalid-file.txt');

        await page.locator('li').filter({ hasText: '* Upload Data Page of Wife\'s' }).getByRole('textbox').setInputFiles('invalid-file.txt');

        await page.locator('li').filter({ hasText: '* Upload Current Passport Photo Of Husband Upload Upload Cancel' }).getByRole('textbox').setInputFiles('invalid-file.txt');

        await page.locator('li').filter({ hasText: '* Upload Current Passport Photo Of Wife Upload Upload Cancel' }).getByRole('textbox').setInputFiles('invalid-file.txt');

        await page.locator('li').filter({ hasText: '* Upload Certified True Copy Of MarriageCertificate Upload Upload Cancel' }).getByRole('textbox').setInputFiles('invalid-file.txt');

        await page.locator('li').filter({ hasText: '* Upload Current Federal' }).getByRole('textbox').setInputFiles('invalid-file.txt');

        await page.locator('li').filter({ hasText: '* Upload Current Identity' }).getByRole('textbox').setInputFiles('invalid-file.txt');

        await page.locator('li').filter({ hasText: '* Upload Picture Of Marriage' }).getByRole('textbox').setInputFiles('invalid-file.txt');

        await page.locator('input[name="RelevantDocsList\\[0\\]\\.Name"]').fill('tesff');

        await page.locator('#relevantDocFilePart-1').setInputFiles('invalid-file.txt')

        await page.getByLabel('The information provided').check();

        //Proceed button click
        await page.getByRole('button', { name: 'Proceed To Payment ' }).click();

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
        await page.screenshot({ path: path.join(screenshotDir, 'applicationformarriagerecertification_invalid_file.png'), fullPage: true });

        console.log('Screenshot saved as applicationforapplicationformarriagerecertification_invalid_file.png');


    });


    test('TC 3: all mandatory field ', async () => {
        

        await page.click(marriagecertification.dateOfMarriage);
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2023');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '16' }).click();

    
        const stategoverment = await page.locator(marriagecertification.stategovenment);
        const placeofworship = await page.locator(marriagecertification.placeofworship);
        marriagecounduted[getRandomNumber(0, 1)] === "stategovernment"
            ? await stategoverment.check()
            : await placeofworship.check();

        if (await stategoverment.isChecked()) {
            console.log("Executed flow for 'state gover");
              // Handle 'State/Local Government' flow
            //await page.getByText('State/Local Government', { exact: true }).click();

            await page.selectOption(marriagecertification.RegistryStateId, '46');
            await page.selectOption(marriagecertification.RegistryLocalGovArea, '1686');
            await page.type(marriagecertification.RegistryName, 'venue name');

            console.log("Executed flow for 'State/Local Government'");
        } else {
            console.log("Executed flow for 'placeofworship.");
            // Handle 'Place of Worship' flow
            await page.getByText('Place of Worship', { exact: true }).click();

            await page.selectOption(marriagecertification.WorshipStateId, '46');
            await page.selectOption(marriagecertification.WorshipLocalGovArea, '1686');
            await page.type(marriagecertification.WorshipName, 'venue name');

            console.log("Executed flow for 'Place of Worship'");
        }

        await page.locator('li').filter({ hasText: '* Please Upload Photograph' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');

        const selectyes = await page.locator(marriagecertification.uploadEvidenceOptionYes);
        const selectno = await page.locator(marriagecertification.uploadEvidenceOptionNo);
        addressradio1[getRandomNumber(0, 1)] === "yes"
            ? await selectyes.check()
            : await selectno.check();

        if (await selectyes.isChecked()) {
            console.log("Executed flow for 'Yes");
            //await page.locator('li').filter({ hasText: '* Upload Certified True Copy Of Marriage Certificate Upload Evindence Of' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
            await page.locator(marriagecertification.certifiedtrucopy).setInputFiles('Dummy_PDF.pdf');
        } else {
            console.log("Executed flow for 'No.");
            //await page.locator('li').filter({ hasText: '* Upload Certified True Copy Of Marriage Certificate Upload Upload Cancel *' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
            await page.locator(marriagecertification.policeextract).setInputFiles('Dummy_PDF.pdf');
        }

        await page.locator('li').filter({ hasText: '* Please Upload Court' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');

       
        // Select Discount Type
        const registrycheck = await page.locator(marriagecertification.registry);
        const postalcheck = await page.locator(marriagecertification.postal);

        addressradio[getRandomNumber(0, 1)] === "Registry"
            ? await postalcheck.check()
            : await registrycheck.check();

        if (await registrycheck.isChecked()) {
            console.log("Registry option is selected.");
            await page.selectOption(marriagecertification.CertificatePickupRegistryState, '45');
            await page.selectOption(marriagecertification.PickupRegistry, '1025');
        } else {
            console.log("postal option is selected.");
            await page.type(marriagecertification.ContactName, 'Contact Name');
            //await page.locator('#PhoneNumber').click();
            await page.type(marriagecertification.PhoneNumber, phone1);
            await page.type(marriagecertification.ResidentialAddress, 'Residential Address');
            await page.selectOption(marriagecertification.Country, '161');
            await page.click(marriagecertification.Country);
            await page.keyboard.press('Escape');

            await page.selectOption(marriagecertification.State, '24');
            await page.locator('input[name="City"]').fill('test');
            await page.selectOption(marriagecertification.PickupRegistryState, '24');
            await page.selectOption(marriagecertification.PostalAddressRegistry, '1039');
        }


        //husband marriage details 
        await page.getByRole('heading', { name: 'Husband Marriage Details' }).click();

        const option = ['1', '2', '3', '4', '5'];

        // Pick a random option from the array
        const randomOption = option[Math.floor(Math.random() * option.length)];

        // Select the randomly chosen option
        await page.locator(marriagecertification.HusbandTitle).selectOption(randomOption);

        // Fetch the visible text of the selected option
        const selectedText = await page.$eval(
            `${marriagecertification.HusbandTitle} option[value="${randomOption}"]`,
            option => option.textContent.trim()
        );

        console.log(`Randomly selected option: ${randomOption}`);
        console.log(`Visible text for selected option: ${selectedText}`);


        await page.type(marriagecertification.HusbandLastName, formData.lastName)
        await page.type(marriagecertification.HusbandFirstName, formData.firstName)

        await page.click(marriagecertification.husbandDateofbirth);
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2023');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '7', exact: true }).click();

        await page.locator(marriagecertification.husbandlegalconsentfromguardian).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');

        await page.type(marriagecertification.HusbandAddress, ' husband address');
        await page.type(marriagecertification.HusbandOccupation, 'Husband occupation ')
        await page.type(marriagecertification.HusbandFirstNameOfFather, formData.firstName)
        
        const living1 = await page.locator(marriagecertification.living);
        const deceased1 = await page.locator(marriagecertification.deceased);

        livingfatherhusband[getRandomNumber(0, 1)] === "living"
            ? await deceased1.check()
            : await living1.check();

        if (await living1.isChecked()) {
            console.log("living option is selected.");
            await page.type(marriagecertification.HusbandFatherOccupation, 'Father Occupation');
            console.log("Selected 'Living' and entered Father Occupation");
        } else {
            console.log("Selected 'Deceased'");
        }



        await page.getByRole('heading', { name: 'Husband Information' }).click();

        await page.type(marriagecertification.HusbandPlaceOfBirth, 'Husband Place Of birth');
        await page.selectOption(marriagecertification.HusbandCountry, '161');
        await page.selectOption(marriagecertification.HusbandStateOrigin, '46');
        await page.selectOption(marriagecertification.husbandLocalarea, '1697');


        const option1 = ['1', '2', '3', '4'];

        // Pick a random option from the array
        const randomOption1 = option1[Math.floor(Math.random() * option1.length)];

        // Select the randomly chosen option
        await page.locator(marriagecertification.PersonalIdentityTypeOfHusband).selectOption(randomOption1);

        // Fetch the visible text of the selected option
        const selectedText1 = await page.$eval(
            `${marriagecertification.PersonalIdentityTypeOfHusband} option[value="${randomOption1}"]`,
            option => option.textContent.trim() // Get the visible name
        );

        console.log(`Randomly selected option: ${randomOption1}`);
        console.log(`Visible text for selected option: ${selectedText1}`);

        // Add the conditional logic
        if (['1', '2', '3', '4'].includes(randomOption1)) {
            console.log("no change required ");
            // Add your logic for options 1-6 here
        } else {
            console.log("Executing flow for option 5...");

            await page.type(marriagecertification.OtherPersonalIdentityTypeOfHusband, ' Other Personal identity of wife')
        }


        await page.type(marriagecertification.PersonalIdentityOfHusband, 'Identify of husband')
        await page.setInputFiles(marriagecertification.HusbandIdentification, 'Dummy_PDF.pdf')


        await page.locator('#li_HusbandPassport').getByRole('textbox').setInputFiles('Dummy_PDF.pdf');


        await page.selectOption(marriagecertification.HusbandCurrentCountry, '161')

        await page.click(marriagecertification.HusbandCurrentCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(marriagecertification.HusbandCurrentState, '24')
        await page.selectOption(marriagecertification.husbandCurrentLGA, '1187')
        await page.type(marriagecertification.HusbandCurrentResidenceAddress, 'Current residence of husband')

        await page.locator('input[name="HusbandDocumentsList\\[0\\]\\.Name"]').type('tesfff');
        await page.locator('input[name="HusbandDocumentsList\\[0\\]\\.Document"]').setInputFiles('Dummy_PDF.pdf');


        await page.getByRole('heading', { name: 'Wife Marriage Details' }).click();


        const option2 = ['1', '2', '3', '4', '5', '6', '7'];

        // Pick a random option from the array
        const randomOption2 = option2[Math.floor(Math.random() * option2.length)];

        // Select the randomly chosen option

        await page.locator(marriagecertification.WifeTitle).selectOption(randomOption2);

        // Fetch the visible text of the selected option
        const selectedText2 = await page.$eval(
            `${marriagecertification.WifeTitle} option[value="${randomOption2}"]`,
            optionElement => optionElement.textContent.trim() // Changed the parameter name for clarity
        );

        console.log(`Randomly selected option: ${randomOption2}`);
        console.log(`Visible text for selected option: ${selectedText2}`);

        await page.type(marriagecertification.WifeLastName, lastName)
        await page.type(marriagecertification.WifeFirstName, firstName)


        await page.click(marriagecertification.wifeDateofbirth)
        await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2023');
        await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('10');
        await page.getByRole('link', { name: '8', exact: true }).click();

        await page.locator(marriagecertification.wifelegalconsentfromguardian).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');

        await page.locator('#WifeAddress').click();
        await page.type(marriagecertification.WifeAddress, 'wife address')
        await page.type(marriagecertification.WifeOccupation, 'wife occupation ')
        await page.type(marriagecertification.WifeFirstNameOfFather, 'wife father name ')

        const living = await page.locator(marriagecertification.livingwife);
        const deceased = await page.locator(marriagecertification.deceasedwife);

        livingfatherwife[getRandomNumber(0, 1)] === "living"
            ? await deceased.check()
            : await living.check();

        if (await living.isChecked()) {
            console.log("living option is selected.");
            await page.getByText('Living').nth(1).click();
            await page.locator('#txtWifeFatherOccupation').click();
            await page.type(marriagecertification.WifeFatherOccupation, 'wife father occupation');
            console.log("Selected 'Living' and entered wife's father occupation");
        
        } else {
            console.log("Selected 'Deceased'");
        }

        await page.getByRole('heading', { name: 'Wife Information' }).click();

        await page.locator('#WifePhone').click();
        await page.type(marriagecertification.WifePhone, phone)
        await page.type(marriagecertification.WifeEmail, email)
        await page.type(marriagecertification.WifePlaceOfBirth, 'wife place of birth')

        await page.selectOption(marriagecertification.WifeCountry, '161')
        await page.click(marriagecertification.WifeCountry);
        await page.keyboard.press('Escape');
        await page.selectOption(marriagecertification.WifeStateOrigin, '24')
        await page.selectOption(marriagecertification.wifeLocalarea, '1197')


        const option3 = ['1', '2', '3', '4', '5'];


        // Pick a random option from the array
        const randomOption3 = option3[Math.floor(Math.random() * option3.length)];

        // Select the randomly chosen option
        await page.locator(marriagecertification.PersonalIdentityTypeOfWife).selectOption(randomOption3);

        // Fetch the visible text of the selected option
        const selectedText3 = await page.$eval(
            `${marriagecertification.PersonalIdentityTypeOfWife} option[value="${randomOption3}"]`,
            optionElement => optionElement.textContent.trim() // Renamed for better clarity
        );

        console.log(`Randomly selected option: ${randomOption3}`);
        console.log(`Visible text for selected option: ${selectedText3}`);


        // Add the conditional logic
        if (['1', '2', '3', '4'].includes(randomOption3)) {
            console.log("no change required ");
            // Add your logic for options 1-6 here
        } else {
            console.log("Executing flow for option 5...");

            await page.type(marriagecertification.OtherPersonalIdentityTypeOfWife, ' Other Personal identity of wife')
        }


        await page.type(marriagecertification.PersonalIdentityOfWife, 'Personal identity of wife')



        await page.locator('li').filter({ hasText: '* Upload Identification Document Upload Upload Cancel' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');

        await page.locator('li').filter({ hasText: '* Upload Wife Current' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');


        await page.selectOption(marriagecertification.WifeCurrentCountry, '161')
        await page.selectOption(marriagecertification.WifeCurrentState, '46')
        await page.selectOption(marriagecertification.WifeCurrentLGA, '1689')


        await page.type(marriagecertification.WifeCurrentResidenceAddress, 'wife current residence address')


        await page.locator('input[name="WifeDocumentsList\\[0\\]\\.Name"]').type('test');
        await page.locator('#genwifeDocFilePart-1').setInputFiles('Dummy_PDF.pdf');


        await page.getByRole('heading', { name: 'Witness Details' }).click();
        await page.type(marriagecertification.Witness1FirstName, formData.firstName)
        await page.type(marriagecertification.Witness1LastName, formData.lastName)

        await page.type(marriagecertification.Witness2FirstName, formData.firstName)
        await page.type(marriagecertification.Witness2LastName, formData.lastName)


        await page.getByRole('heading', { name: 'Upload Documents' }).click();


        await page.locator('li').filter({ hasText: '* Upload Formal Application' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');

        await page.locator('li').filter({ hasText: '* Upload Data Page of Husband' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');

        await page.locator('li').filter({ hasText: '* Upload Data Page of Wife\'s' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');

        await page.locator('li').filter({ hasText: '* Upload Current Passport Photo Of Husband Upload Upload Cancel' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');

        await page.locator('li').filter({ hasText: '* Upload Current Passport Photo Of Wife Upload Upload Cancel' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');

        await page.locator('li').filter({ hasText: '* Upload Certified True Copy Of MarriageCertificate Upload Upload Cancel' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');

        await page.locator('li').filter({ hasText: '* Upload Current Federal' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');

        await page.locator('li').filter({ hasText: '* Upload Current Identity' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');

        await page.locator('li').filter({ hasText: '* Upload Picture Of Marriage' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');

        await page.locator('input[name="RelevantDocsList\\[0\\]\\.Name"]').fill('tesff');

        await page.locator('#relevantDocFilePart-1').setInputFiles('Dummy_PDF.pdf')

        await page.getByLabel('The information provided').check();


        //Proceed button click
        await page.getByRole('button', { name: 'Proceed To Payment' }).click();

        const isVisible = await page.getByText('All require information').isVisible();
       
        if (isVisible) {
            console.log('Success Message')
        } else {
            console.log("The text is not visible.");
        }
        //await page.getByRole('link', { name: 'Submit' }).click();



    });

});

