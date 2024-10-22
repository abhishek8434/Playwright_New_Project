const { test, expect, chromium, firefox, webkit } = require('@playwright/test');
const { locators } = require('../constants/locators');
import {citizenshipbyinvestment} from '../constants/locators';

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
    await page.getByRole('heading', { name: 'Citizenship By Investment' }).click();
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
        await page.getByText('do solemnly and sincerely declare that the particulars stated in the application are correct').click();


        await page.waitForTimeout(8000);
    })


    
// test("test", async ({ page }) => {

//     await navigateToCitizenshipForm(page);

    // // --> Investment
    // await page.waitForTimeout(2000)
    // await page.getByText("Citizenship By Investment", { exact: true }).click();
    // await page.getByRole("link", { name: "Proceed" }).click();

    // // ------ Personal Information ------
   
    // await page.getByRole("heading", { name: "Personal Information" }).click();
    // await page.waitForTimeout(2000);


    // // DOB
    // await page.locator("#DateOfBirth").click();
    // // Year
    // await page
    //     .locator("#ui-datepicker-div")
    //     .getByRole("combobox")
    //     .nth(1)
    //     .selectOption("2003");
    // // Month
    // await page
    //     .locator("#ui-datepicker-div")
    //     .getByRole("combobox")
    //     .first()
    //     .selectOption("3");
    // // Date
    // await page.getByRole("link", { name: "16" }).click();
    // await page.waitForTimeout(2000);


    // // Birth Country
    // await page
    //     .locator("#drpPlaceOfBirthCountry")
    //     .selectOption({ label: "Nigeria" });
    // await page.locator("#drpPlaceOfBirthCountry").click();
    // await page.locator("#drpPlaceOfBirthCountry").evaluate((el) => el.blur());
    // await page.waitForTimeout(2000);


    // // Birth State
    // await page.locator("#drpPlaceOfBirthState").selectOption({ label: "Delta" });
    // await page.locator("#drpPlaceOfBirthState").click();
    // await page.locator("#drpPlaceOfBirthCountry").evaluate((el) => el.blur());
    // await page.waitForTimeout(2000);


    // // City Birth
    // await page.locator("#CityOfBirth").click();
    // await page.locator("#CityOfBirth").fill("Abuja");
    // await page.waitForTimeout(2000);


    // // Arrival to Nigeria
    // await page.locator("#DateFirstArrivalToNigeria").click();
    // await page.getByRole("link", { name: "1", exact: true }).click();
    // await page.waitForTimeout(2000);


    // // Present Nationality
    // await page.locator("#PresentNationality").selectOption({ label: "Nigerian" });
    // await page.locator("#PresentNationality").click();
    // await page.locator("#PresentNationality").evaluate((el) => el.blur());
    // await page.waitForTimeout(2000);


    // // ------ Residential Address   ------

    // // A) permanent address in country of origin) :

    // // Country
    // await page
    //     .locator("#AddressList_0__Country")
    //     .selectOption({ label: "Nigeria" });
    // await page.locator("#AddressList_0__Country").click();
    // await page.locator("#AddressList_0__Country").evaluate((el) => el.blur());
    // await page.waitForTimeout(2000);


    // // State
    // await page.locator("#ddlRespastState").selectOption({ label: "Delta" });
    // await page.locator("#ddlRespastState").click();
    // await page.locator("#ddlRespastState").evaluate((el) => el.blur());
    // await page.waitForTimeout(2000);


    // // City
    // await page.locator("#AddressList_0__City").click();
    // await page.locator("#AddressList_0__City").fill("Abuja");
    // await page.waitForTimeout(2000);


    // // Address
    // await page.locator("#AddressList_0__Address").click();
    // await page
    //     .locator("#AddressList_0__Address")
    //     .fill(
    //         "Plot 1, Kapital Street, Area 11, Garki. PMB 24 FCT Abuja, Nigeria Abuja FCT 00234."
    //     );
    // await page.waitForTimeout(2000);


    // // B) Present Address in Nigeria

    // // State
    // await page.locator("#drpApplicantState").selectOption({ label: "Bauchi" });
    // await page.locator("#drpApplicantState").click();
    // await page.locator("#drpApplicantState").evaluate((el) => el.blur());
    // await page.waitForTimeout(2000);


    // // Local Govt Area
    // await page.locator("#drpLocalarea").selectOption("Bauchi");
    // await page.locator("#drpLocalarea").click();
    // await page.locator("#drpLocalarea").evaluate((el) => el.blur());
    // await page.waitForTimeout(2000);


    // // City
    // await page.locator("#AddressList_1__City").click();
    // await page.locator("#AddressList_1__City").fill("Abuja");
    // await page.waitForTimeout(2000);


    // // Address
    // await page.locator("#AddressList_1__Address").click();
    // await page
    //     .locator("#AddressList_1__Address")
    //     .fill(
    //         "Plot 1, Kapital Street, Area 11, Garki. PMB 24 FCT Abuja, Nigeria Abuja FCT 00234."
    //     );
    // await page.waitForTimeout(2000);


    // // ---------------------------------------------------------------------
    // // ----- Professional Information ------
    // await page.getByRole("heading", { name: "Professional Information" }).click();
    // await page.waitForTimeout(2000);


    // // Occupation
    // await page.locator("#Occupation").click();
    // await page.locator("#Occupation").fill("Software Developer");
    // await page.waitForTimeout(2000);


    // // Name of Organization
    // await page.locator("#NameOfOrganization").click();
    // await page.locator("#NameOfOrganization").fill("Evince Development");
    // await page.waitForTimeout(2000);


    // // Type of Organization
    // await page.locator("#OrganizationType").click();
    // await page.locator("#OrganizationType").fill("IT Solutions");
    // await page.waitForTimeout(2000);


    // // Position
    // await page.locator("#PositionHeld").click();
    // await page.locator("#PositionHeld").fill("Junior Web Developer");
    // await page.waitForTimeout(2000);


    // // --------- Other Information -------

    // await page.getByRole("heading", { name: "Other Information" }).click();
    // await page
    //     .locator("li")
    //     .filter({ hasText: "Can You Read Write And Speak" })
    //     .getByLabel("Yes")
    //     .check();
    // await page.waitForTimeout(2000);


    // // ---------- Declaration ----------

    // await page.getByRole("heading", { name: "Declaration" }).click();
    // await page.waitForTimeout(2000);


    // // ---------- Documents Upload ----------

    // await page.getByRole("heading", { name: "Documents Upload" }).click();
    // await page.waitForTimeout(2000);


    // // Passport Photo

    // await page.locator("#PassportPhotograph").setInputFiles("Dummy PDF.pdf");
    // await page.waitForTimeout(2000);


    // // International Passport

    // await page
    //     .locator("#InternationalPassportArrivalStampedPage")
    //     .setInputFiles("Dummy PDF.pdf");
    // await page.waitForTimeout(2000);


    // // Documentary Proof Of Proposed

    // await page
    //     .locator("#DocumentaryProveOfProposedInvestmentInNigeria")
    //     .setInputFiles("Dummy PDF.pdf");
    // await page.waitForTimeout(2000);


    // // Evince of required amount

    // await page
    //     .locator("#EvidenceOfRequiredAmountForInvestment")
    //     .setInputFiles("Dummy PDF.pdf");
    // await page.waitForTimeout(2000);


    // // Poilce Report

    // await page
    //     .locator("#PoliceReportOfCountriesOfResidence")
    //     .setInputFiles("Dummy PDF.pdf");
    // await page.waitForTimeout(2000);


    // // Written Application

    // await page
    //     .locator("#WrittenApplicationLetterSignedAndStamped")
    //     .setInputFiles("Dummy PDF.pdf");
    // await page.waitForTimeout(2000);


    // // Memo Randum

    // await page
    //     .locator("#MemoRandumOfUnderstanding")
    //     .setInputFiles("Dummy PDF.pdf");
    // await page.waitForTimeout(2000);


    // // Evidence of Gold

    // await page
    //     .locator("#EvidenceOfGoodMentalAndPhysicalHealth")
    //     .setInputFiles("Dummy PDF.pdf");
    // await page.waitForTimeout(2000);


    // // Sworn Affidavit Of Allegiance

    // await page
    //     .locator("#SwornAffidavitOfAllegianceToNigeria")
    //     .setInputFiles("Dummy PDF.pdf");
    // await page.waitForTimeout(2000);


    // // Necessary Document(s)
    // // Name
    // await page.locator("#necessaryDocumentList_0__DocumentName").click();
    // await page.locator("#necessaryDocumentList_0__DocumentName").fill("Investment Citizenship");
    // await page.waitForTimeout(2000);


    // // Document
    // await page
    //     .locator("#necessaryDocumentList_0__Document")
    //     .setInputFiles("Dummy PDF.pdf");
    // await page.getByRole("link", { name: "Proceed" }).click();
    // await page.getByRole("link", { name: "Submit" }).click();
    // await page.waitForTimeout(2000);


    // await page.waitForTimeout(5000);
    // console.log("Mission Passed !!");

    // // await page.getByLabel("The information provided").waitFor();
    // // await page.getByLabel("The information provided").check();

    // await page.evaluate(() => {
    //     const checkbox = document.getElementById('chkIsChecked');
    //     if (checkbox) {
    //         checkbox.checked = true;
    //         checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    //     }
    // });
    // await page.waitForTimeout(2000);


    // await page.getByRole("button", { name: "Proceed To Payment" }).click();


    // await page.waitForTimeout(2000);

    // await page.getByLabel("Online Pay").check();
    // await page.getByRole("button", { name: "Pay" }).click();
    // await page.waitForTimeout(3000);


    // await page.getByRole("link", { name: "my application page." }).waitFor();
    // await bottomAndTop(page);
    // await page.getByRole("link", { name: "my application page." }).click();
    // await page.waitForTimeout(5000);
});
