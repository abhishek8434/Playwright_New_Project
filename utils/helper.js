const { expect } = require('@playwright/test');
// const { locators } = require('');
const { locators } = require("../constants/locators")

// Helper function for login
export async function login(page, email, password) {
  await page.goto('/');
  await page.getByRole('link', { name: 'LOGIN' }).click();
  await page.getByLabel('* Email Address').fill(email);
  await page.getByLabel('* Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
}

// Helper function to navigate to the marriage form
export async function navigateToMarriageForm(page) {
  await page.goto(process.env.MARRIAGE_FORM_URL);
  expect(await page.title()).toBe('My Applications');

  await page.getByRole('button', { name: 'Continue' }).click();
  await page.locator('#defaultNavbar1').getByText('Marriage').click();
  await page.getByRole('link', { name: 'Apply For Marriage (New' }).click();

  await page.locator(locators.modalMrgPlaceSelection)
    .filter({ hasText: 'FEDERAL MARRIAGE REGISTRY' })
    .locator(locators.placeOfMarriage).check();
  await page.getByRole('link', { name: 'Proceed' }).click();

  // Handle the 'Requirement' popup
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Requirement' }).first().click();
  const page1 = await page1Promise;
  await page1.close(); // Close the popup window

  // Continue interaction with the main page
  await page.locator('#ApplyforOrdinaryMarriage').click();
  await page.getByRole('link', { name: 'Ok' }).click();
}

export function getRandomNumber(min = 0, max = 100) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const addressradio = ["registry", "postal"];

export const addressradio1 = ["yes", "no"];

export const marriagecounduted = ["stategovernemt", "placeofworship"];

export const livingfatherhusband = ["living", "deceased"];

export const livingfatherwife = ["living", "deceased"];


