const { test, expect, chromium, firefox, webkit } = require('@playwright/test');


const { locators } = require('../constants/locators');
import { applyforworship } from '../constants/locators';

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
    await page.locator('#defaultNavbar1').getByText('Place of Worship', { exact: true }).click();
    await page.getByText('Apply For Place Of Worship').click();
    

}

test.describe.configure({ mode: 'serial' });
test.describe('Apply For Place of Worship', () => {
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
    test('TC 1: Validate mandatory fields are required', async () => {
        await navigateToCitizenshipForm(page);

        await page.getByRole('link', { name: 'Proceed' }).click();
        const errorMessageLocator = page.locator('text=Please complete all the required field(s).');
        await expect(errorMessageLocator).toBeVisible({ timeout: 10000 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(screenshotDir, 'placeofworshipblankfield.png'), fullPage: true });
        console.log('Screenshot saved as placeofworshipblankfield.png');
        await expect(errorMessageLocator).toHaveText('Please complete all the required field(s).');

        await page.getByRole('link', { name: 'Ok' }).click();



    });

    //Invalid file type
    test('TC 2: Prevent upload of invalid file types', async () => {
        await navigateToCitizenshipForm(page);
        await page.selectOption(applyforworship.PlaceOfOath, '16');
        await page.waitForTimeout(2000)
        await page.selectOption(applyforworship.PlaceOfOath, '1');
        await page.waitForTimeout(2000)
        await page.selectOption(applyforworship.PlaceOfOath, '16');
        
        await page.selectOption(applyforworship.State, '46');
        await page.selectOption(applyforworship.Localarea, '1694');
        await page.getByRole('button', { name: 'OK' }).click();
        await page.getByRole('button', { name: 'Close' }).click();
        await page.locator('div').filter({ hasText: /^To navigate, press the arrow keys\.$/ }).nth(1).click();
        await page.locator('div').filter({ hasText: /^To navigate, press the arrow keys\.Location\(9\.458110548663116, 8\.675299999999998\)$/ }).nth(1).click();

        await page.getByRole('heading', { name: 'Place Of Worship Representative Details' }).click();
        await page.type(applyforworship.RepresentativeSurname, formData.lastName);
        await page.type(applyforworship.RepresentativeFirstName, formData.firstName);
        await page.type(applyforworship.RepresentativeEmail, formData.email);
        await page.type(applyforworship.RepresentativePhone, formData.phone);
       
        await page.getByRole('heading', { name: 'Further Details On Place Of' }).click();
        const option = ['1', '0'];
        // Pick a random option from the array
        const randomOption = option[Math.floor(Math.random() * option.length)];
        // Select the randomly chosen option
        await page.locator(applyforworship.DoesChurchHaveOrdainedPastor).selectOption(randomOption);
        // Fetch the visible text of the selected option
        const selectedText = await page.$eval(
        `${applyforworship.DoesChurchHaveOrdainedPastor} option[value="${randomOption}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption}`);
        console.log(`Visible text for selected option: ${selectedText}`);

        const randomOption1 = option[Math.floor(Math.random() * option.length)];
        // Select the randomly chosen option
        await page.locator(applyforworship.DoesChurchHaveStandByGenerator).selectOption(randomOption1);
        // Fetch the visible text of the selected option
        const selectedText1 = await page.$eval(
        `${applyforworship.DoesChurchHaveStandByGenerator} option[value="${randomOption1}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption1}`);
        console.log(`Visible text for selected option: ${selectedText1}`);

        const option2 = ['1', '2', '3'];
        // Pick a random option2 from the array
        const randomOption2 = option2[Math.floor(Math.random() * option2.length)];
        // Select the randomly chosen option2
        await page.locator(applyforworship.DoesChurchHaveProvisionForSafekeeping).selectOption(randomOption2);
        // Fetch the visible text of the selected option2
        const selectedText2 = await page.$eval(
        `${applyforworship.DoesChurchHaveProvisionForSafekeeping} option[value="${randomOption2}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption2}`);
        console.log(`Visible text for selected option: ${selectedText2}`);

        const randomOption3 = option[Math.floor(Math.random() * option.length)];
        // Select the randomly chosen option
        await page.locator(applyforworship.IsChurchBuildingCompleteAndAllItemsAboveInPlace).selectOption(randomOption3);
        // Fetch the visible text of the selected option
        const selectedText3 = await page.$eval(
        `${applyforworship.IsChurchBuildingCompleteAndAllItemsAboveInPlace} option[value="${randomOption3}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption3}`);
        console.log(`Visible text for selected option: ${selectedText3}`);

        const randomOption4 = option[Math.floor(Math.random() * option.length)];
        // Select the randomly chosen option
        await page.locator(applyforworship.IsChurchBuiltOfConcreteWall).selectOption(randomOption4);
        // Fetch the visible text of the selected option
        const selectedText4 = await page.$eval(
        `${applyforworship.IsChurchBuiltOfConcreteWall} option[value="${randomOption4}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption4}`);
        console.log(`Visible text for selected option: ${selectedText4}`);

        const randomOption5 = option[Math.floor(Math.random() * option.length)];
        // Select the randomly chosen option
        await page.locator(applyforworship.DoesChurchHaveCleanEnvironment).selectOption(randomOption5);
        // Fetch the visible text of the selected option
        const selectedText5 = await page.$eval(
        `${applyforworship.DoesChurchHaveCleanEnvironment} option[value="${randomOption5}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption5}`);
        console.log(`Visible text for selected option: ${selectedText5}`);

        const randomOption6 = option[Math.floor(Math.random() * option.length)];
        // Select the randomly chosen option
        await page.locator(applyforworship.DoesChurchHaveWaterCloset).selectOption(randomOption6);
        // Fetch the visible text of the selected option
        const selectedText6 = await page.$eval(
        `${applyforworship.DoesChurchHaveWaterCloset} option[value="${randomOption6}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption6}`);
        console.log(`Visible text for selected option: ${selectedText6}`);

        const randomOption7 = option[Math.floor(Math.random() * option.length)];
        // Select the randomly chosen option
        await page.locator(applyforworship.DoesChurchHaveAdeQuateVentilation).selectOption(randomOption7);
        // Fetch the visible text of the selected option
        const selectedText7 = await page.$eval(
        `${applyforworship.DoesChurchHaveAdeQuateVentilation} option[value="${randomOption7}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption7}`);
        console.log(`Visible text for selected option: ${selectedText7}`);

        const randomOption8 = option[Math.floor(Math.random() * option.length)];
        // Select the randomly chosen option
        await page.locator(applyforworship.DoesChurchHavePublicAddressSystem).selectOption(randomOption8);
        // Fetch the visible text of the selected option
        const selectedText8 = await page.$eval(
        `${applyforworship.DoesChurchHavePublicAddressSystem} option[value="${randomOption8}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption8}`);
        console.log(`Visible text for selected option: ${selectedText8}`);

        const randomOption9 = option[Math.floor(Math.random() * option.length)];
        // Select the randomly chosen option
        await page.locator(applyforworship.isChurchHavePermanentSite).selectOption(randomOption9);
        // Fetch the visible text of the selected option
        const selectedText9 = await page.$eval(
        `${applyforworship.isChurchHavePermanentSite} option[value="${randomOption9}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption9}`);
        console.log(`Visible text for selected option: ${selectedText9}`);

        const randomOption10 = option[Math.floor(Math.random() * option.length)];
        // Select the randomly chosen option
        await page.locator(applyforworship.drpChurchExtinguisher).selectOption(randomOption10);
        // Fetch the visible text of the selected option
        const selectedText10 = await page.$eval(
        `${applyforworship.drpChurchExtinguisher} option[value="${randomOption10}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption10}`);
        console.log(`Visible text for selected option: ${selectedText10}`);
        
        const randomOption11 = option[Math.floor(Math.random() * option.length)];
        // Select the randomly chosen option
        await page.locator(applyforworship.IsChurchregistredUnderLandPerpetualAct).selectOption(randomOption11);
        // Fetch the visible text of the selected option
        const selectedText11 = await page.$eval(
        `${applyforworship.IsChurchregistredUnderLandPerpetualAct} option[value="${randomOption11}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption11}`);
        console.log(`Visible text for selected option: ${selectedText11}`);

        
        await page.getByRole('heading', { name: 'Previous License Information' }).click();
    
        // Check if "yes" is selected or available
        if (await page.locator(applyforworship.previouslicenseyes).isChecked()) {
            // Actions when "yes" is selected
            console.log("Yes is selected. Executing actions for 'yes'.");
            await page.locator(applyforworship.lastRenewalDate).click();
            await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2023');
            await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('9');
            await page.getByRole('link', { name: '17' }).click();
            
            //await page.locator('#file_div_LastRenewal #LastRenewalReceiptFile').setInputFiles('Dummy_PDF.pdf');
            await page.locator(applyforworship.LastRenewalReceiptFile).setInputFiles('Dummy_PDF.pdf');
            // await page.type(applyforworship.OutstandingRenewalFee, '50000');
        } else {
            // Actions when "no" or another option is selected
            console.log("No is selected. Executing actions for 'no'.");
            await page.locator(applyforworship.previouslicenseno).click();
            // Add additional steps for the "else" scenario if required
        }
                
        

        await page.getByRole('heading', { name: 'Documents Upload' }).click();
        const option3 = ['1', '2', '3', '4', '5'];
        // Pick a random option3 from the array
        const randomOption12 = option3[Math.floor(Math.random() * option3.length)];
        // Select the randomly chosen option3
        await page.locator(applyforworship.IDCardType).selectOption(randomOption12);
        // Fetch the visible text of the selected option3
        const selectedText12 = await page.$eval(
        `${applyforworship.IDCardType} option[value="${randomOption12}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption12}`);
        console.log(`Visible text for selected option: ${selectedText12}`);

    
        await page.locator('li').filter({ hasText: 'Upload Id Card Of' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: 'Upload Certificate Of Occupancy Upload Upload Cancel' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: 'Upload Certificate Of Incorporation Upload Upload Cancel' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: 'Upload First Five Pages and' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: 'Upload Ordination Certificate' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator(applyforworship.PlaceOfWorshipPhotoFile).setInputFiles('Dummy_PDF.pdf');

        const randomOption13 = option3[Math.floor(Math.random() * option3.length)];
        // Select the randomly chosen option3
        await page.locator(applyforworship.PastorTypeID).selectOption(randomOption13);
        // Fetch the visible text of the selected option3
        const selectedText13 = await page.$eval(
        `${applyforworship.PastorTypeID} option[value="${randomOption13}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption13}`);
        console.log(`Visible text for selected option: ${selectedText13}`);


        await page.locator(applyforworship.PastorMinisterIdentificationFile).setInputFiles('Dummy_PDF.pdf');

        await page.locator(applyforworship.PassportPhotographsofPastorMinisterFile).setInputFiles('Dummy_PDF.pdf');

        await page.locator(applyforworship.PowerofAttorneyFile).setInputFiles('Dummy_PDF.pdf');

        
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
        await page.screenshot({ path: path.join(screenshotDir, 'placeofworshipinvalid.png'), fullPage: true });

        console.log('Screenshot saved as placeofworshipinvalid.png');


    });


    test.only('TC 3: Submit citizenship renewal with valid information', async () => {
        await navigateToCitizenshipForm(page);
        await page.selectOption(applyforworship.PlaceOfOath, '16');
        await page.waitForTimeout(2000)
        await page.selectOption(applyforworship.PlaceOfOath, '1');
        await page.waitForTimeout(2000)
        await page.selectOption(applyforworship.PlaceOfOath, '16');
        
        await page.selectOption(applyforworship.State, '46');
        await page.selectOption(applyforworship.Localarea, '1694');
        await page.getByRole('button', { name: 'OK' }).click();
        await page.getByRole('button', { name: 'Close' }).click();
        await page.locator('div').filter({ hasText: /^To navigate, press the arrow keys\.$/ }).nth(1).click();
        await page.locator('div').filter({ hasText: /^To navigate, press the arrow keys\.Location\(9\.458110548663116, 8\.675299999999998\)$/ }).nth(1).click();

        await page.getByRole('heading', { name: 'Place Of Worship Representative Details' }).click();
        await page.type(applyforworship.RepresentativeSurname, formData.lastName);
        await page.type(applyforworship.RepresentativeFirstName, formData.firstName);
        await page.type(applyforworship.RepresentativeEmail, formData.email);
        await page.type(applyforworship.RepresentativePhone, formData.phone);
       
        await page.getByRole('heading', { name: 'Further Details On Place Of' }).click();
        const option = ['1', '0'];
        // Pick a random option from the array
        const randomOption = option[Math.floor(Math.random() * option.length)];
        // Select the randomly chosen option
        await page.locator(applyforworship.DoesChurchHaveOrdainedPastor).selectOption(randomOption);
        // Fetch the visible text of the selected option
        const selectedText = await page.$eval(
        `${applyforworship.DoesChurchHaveOrdainedPastor} option[value="${randomOption}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption}`);
        console.log(`Visible text for selected option: ${selectedText}`);

        const randomOption1 = option[Math.floor(Math.random() * option.length)];
        // Select the randomly chosen option
        await page.locator(applyforworship.DoesChurchHaveStandByGenerator).selectOption(randomOption1);
        // Fetch the visible text of the selected option
        const selectedText1 = await page.$eval(
        `${applyforworship.DoesChurchHaveStandByGenerator} option[value="${randomOption1}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption1}`);
        console.log(`Visible text for selected option: ${selectedText1}`);

        const option2 = ['1', '2', '3'];
        // Pick a random option2 from the array
        const randomOption2 = option2[Math.floor(Math.random() * option2.length)];
        // Select the randomly chosen option2
        await page.locator(applyforworship.DoesChurchHaveProvisionForSafekeeping).selectOption(randomOption2);
        // Fetch the visible text of the selected option2
        const selectedText2 = await page.$eval(
        `${applyforworship.DoesChurchHaveProvisionForSafekeeping} option[value="${randomOption2}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption2}`);
        console.log(`Visible text for selected option: ${selectedText2}`);

        const randomOption3 = option[Math.floor(Math.random() * option.length)];
        // Select the randomly chosen option
        await page.locator(applyforworship.IsChurchBuildingCompleteAndAllItemsAboveInPlace).selectOption(randomOption3);
        // Fetch the visible text of the selected option
        const selectedText3 = await page.$eval(
        `${applyforworship.IsChurchBuildingCompleteAndAllItemsAboveInPlace} option[value="${randomOption3}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption3}`);
        console.log(`Visible text for selected option: ${selectedText3}`);

        const randomOption4 = option[Math.floor(Math.random() * option.length)];
        // Select the randomly chosen option
        await page.locator(applyforworship.IsChurchBuiltOfConcreteWall).selectOption(randomOption4);
        // Fetch the visible text of the selected option
        const selectedText4 = await page.$eval(
        `${applyforworship.IsChurchBuiltOfConcreteWall} option[value="${randomOption4}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption4}`);
        console.log(`Visible text for selected option: ${selectedText4}`);

        const randomOption5 = option[Math.floor(Math.random() * option.length)];
        // Select the randomly chosen option
        await page.locator(applyforworship.DoesChurchHaveCleanEnvironment).selectOption(randomOption5);
        // Fetch the visible text of the selected option
        const selectedText5 = await page.$eval(
        `${applyforworship.DoesChurchHaveCleanEnvironment} option[value="${randomOption5}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption5}`);
        console.log(`Visible text for selected option: ${selectedText5}`);

        const randomOption6 = option[Math.floor(Math.random() * option.length)];
        // Select the randomly chosen option
        await page.locator(applyforworship.DoesChurchHaveWaterCloset).selectOption(randomOption6);
        // Fetch the visible text of the selected option
        const selectedText6 = await page.$eval(
        `${applyforworship.DoesChurchHaveWaterCloset} option[value="${randomOption6}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption6}`);
        console.log(`Visible text for selected option: ${selectedText6}`);

        const randomOption7 = option[Math.floor(Math.random() * option.length)];
        // Select the randomly chosen option
        await page.locator(applyforworship.DoesChurchHaveAdeQuateVentilation).selectOption(randomOption7);
        // Fetch the visible text of the selected option
        const selectedText7 = await page.$eval(
        `${applyforworship.DoesChurchHaveAdeQuateVentilation} option[value="${randomOption7}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption7}`);
        console.log(`Visible text for selected option: ${selectedText7}`);

        const randomOption8 = option[Math.floor(Math.random() * option.length)];
        // Select the randomly chosen option
        await page.locator(applyforworship.DoesChurchHavePublicAddressSystem).selectOption(randomOption8);
        // Fetch the visible text of the selected option
        const selectedText8 = await page.$eval(
        `${applyforworship.DoesChurchHavePublicAddressSystem} option[value="${randomOption8}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption8}`);
        console.log(`Visible text for selected option: ${selectedText8}`);

        const randomOption9 = option[Math.floor(Math.random() * option.length)];
        // Select the randomly chosen option
        await page.locator(applyforworship.isChurchHavePermanentSite).selectOption(randomOption9);
        // Fetch the visible text of the selected option
        const selectedText9 = await page.$eval(
        `${applyforworship.isChurchHavePermanentSite} option[value="${randomOption9}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption9}`);
        console.log(`Visible text for selected option: ${selectedText9}`);

        const randomOption10 = option[Math.floor(Math.random() * option.length)];
        // Select the randomly chosen option
        await page.locator(applyforworship.drpChurchExtinguisher).selectOption(randomOption10);
        // Fetch the visible text of the selected option
        const selectedText10 = await page.$eval(
        `${applyforworship.drpChurchExtinguisher} option[value="${randomOption10}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption10}`);
        console.log(`Visible text for selected option: ${selectedText10}`);
        
        const randomOption11 = option[Math.floor(Math.random() * option.length)];
        // Select the randomly chosen option
        await page.locator(applyforworship.IsChurchregistredUnderLandPerpetualAct).selectOption(randomOption11);
        // Fetch the visible text of the selected option
        const selectedText11 = await page.$eval(
        `${applyforworship.IsChurchregistredUnderLandPerpetualAct} option[value="${randomOption11}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption11}`);
        console.log(`Visible text for selected option: ${selectedText11}`);

        
        await page.getByRole('heading', { name: 'Previous License Information' }).click();
    
        // Check if "yes" is selected or available
        if (await page.locator(applyforworship.previouslicenseyes).isChecked()) {
            // Actions when "yes" is selected
            console.log("Yes is selected. Executing actions for 'yes'.");
            await page.locator(applyforworship.lastRenewalDate).click();
            await page.locator('#ui-datepicker-div').getByRole('combobox').nth(1).selectOption('2023');
            await page.locator('#ui-datepicker-div').getByRole('combobox').first().selectOption('9');
            await page.getByRole('link', { name: '17' }).click();
            
            //await page.locator('#file_div_LastRenewal #LastRenewalReceiptFile').setInputFiles('Dummy_PDF.pdf');
            await page.locator(applyforworship.LastRenewalReceiptFile).setInputFiles('Dummy_PDF.pdf');
            // await page.type(applyforworship.OutstandingRenewalFee, '50000');
        } else {
            // Actions when "no" or another option is selected
            console.log("No is selected. Executing actions for 'no'.");
            await page.locator(applyforworship.previouslicenseno).click();
            // Add additional steps for the "else" scenario if required
        }
                
        

        await page.getByRole('heading', { name: 'Documents Upload' }).click();
        const option3 = ['1', '2', '3', '4', '5'];
        // Pick a random option3 from the array
        const randomOption12 = option3[Math.floor(Math.random() * option3.length)];
        // Select the randomly chosen option3
        await page.locator(applyforworship.IDCardType).selectOption(randomOption12);
        // Fetch the visible text of the selected option3
        const selectedText12 = await page.$eval(
        `${applyforworship.IDCardType} option[value="${randomOption12}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption12}`);
        console.log(`Visible text for selected option: ${selectedText12}`);

    
        await page.locator('li').filter({ hasText: 'Upload Id Card Of' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: 'Upload Certificate Of Occupancy Upload Upload Cancel' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: 'Upload Certificate Of Incorporation Upload Upload Cancel' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: 'Upload First Five Pages and' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator('li').filter({ hasText: 'Upload Ordination Certificate' }).getByRole('textbox').setInputFiles('Dummy_PDF.pdf');
        await page.locator(applyforworship.PlaceOfWorshipPhotoFile).setInputFiles('Dummy_PDF.pdf');

        const randomOption13 = option3[Math.floor(Math.random() * option3.length)];
        // Select the randomly chosen option3
        await page.locator(applyforworship.PastorTypeID).selectOption(randomOption13);
        // Fetch the visible text of the selected option3
        const selectedText13 = await page.$eval(
        `${applyforworship.PastorTypeID} option[value="${randomOption13}"]`,
        option => option.textContent.trim()
        );
        console.log(`Randomly selected option: ${randomOption13}`);
        console.log(`Visible text for selected option: ${selectedText13}`);


        await page.locator(applyforworship.PastorMinisterIdentificationFile).setInputFiles('Dummy_PDF.pdf');

        await page.locator(applyforworship.PassportPhotographsofPastorMinisterFile).setInputFiles('Dummy_PDF.pdf');

        await page.locator(applyforworship.PowerofAttorneyFile).setInputFiles('Dummy_PDF.pdf');


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
