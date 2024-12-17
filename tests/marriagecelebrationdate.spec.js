const { test, expect, chromium, firefox, webkit } = require('@playwright/test');


const { locators } = require('../constants/locators');
import { celebrationdate } from '../constants/locators';

const path = require('path');
const fs = require('fs');
import * as dotenv from "dotenv";
import { faker } from '@faker-js/faker';
import { kMaxLength } from 'buffer';
import { DEFAULT_ECDH_CURVE } from 'tls';

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
const LOGIN_EMAIL = process.env.LOGIN_EMAIL;
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD;
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


// // Helper function to navigate to the marriage form
// async function navigateToCitizenshipForm(page) {
//     await page.goto(MY_APPLICATION_URL);
//     expect(await page.title()).toBe('My Applications');

//     // Proceed to marriage application form
//     await page.getByRole('button', { name: 'Continue' }).click();
//     await page.locator('#defaultNavbar1').getByText('Citizenship', { exact: true }).click();
//     await page.getByRole('link', { name: 'Apply For Attestation Of Bachelorhood/Spinsterhood' }).click();

// }

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

        await page.getByText('Place of Worship', { exact: true }).click();
        await page.getByRole('link', { name: 'Marriage Celebration Date' }).click();
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
        //await navigateToCitizenshipForm(page);

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
        await page.screenshot({ path: path.join(screenshotDir, 'applicationforbachelorhood_invalid_file.png'), fullPage: true });

        console.log('Screenshot saved as applicationforbachelorhood_invalid_file.png');

    });

    //positive flow
    test.only('TC 3: all mandatory field ', async () => {
                
        await page.fill(celebrationdate.txtLimit, '');
        await page.type(celebrationdate.txtLimit, '999')        
        await page.getByRole('combobox').nth(1).selectOption('2026');
        await page.getByRole('combobox').first().selectOption('4');
        await page.getByRole('link', { name: '6', exact: true }).click();
        await page.getByRole('link', { name: '6', exact: true }).click();
        await page.getByText('05/02/2025').click();
        await page.getByRole('button', { name: 'Update' }).click();
        await page.getByText('Updated Successfully!!').click();
        await page.getByRole('button', { name: 'Back' }).click();
        await page.getByRole('button', { name: 'Continue' }).click();

        // //Proceed button click
        // await page.getByRole('link', { name: 'Proceed' }).click();
        // const isVisible = await page.getByText('You have successfully').isVisible();
        // if (isVisible) {
        //     console.log('Success Message')
        // } else {
        //     console.log("The text is not visible.");
        // }
        // await page.getByRole('link', { name: 'Submit' }).click();

        //For payment 
        // await page.getByLabel('The information provided').check();
        // await page.getByRole('button', { name: 'Proceed To Payment' }).click();
        // await page.getByRole('link', { name: 'Ok' }).click();

    });

});