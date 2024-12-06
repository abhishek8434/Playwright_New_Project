const fs = require('fs');
const path = require('path');

// Function to delete folders
const deleteFolder = (folderPath) => {
    if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
        console.log(`Deleted: ${folderPath}`);
    } else {
        console.log(`Folder not found: ${folderPath}`);
    }
};

// Paths to Allure directories
const allureResults = path.resolve('allure-results');
const allureReport = path.resolve('allure-report');

// Delete Allure directories
console.log('Cleaning up old Allure data...');
deleteFolder(allureResults);
deleteFolder(allureReport);
console.log('Cleanup complete.');
