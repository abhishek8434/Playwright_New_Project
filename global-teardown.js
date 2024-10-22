const { execSync } = require('child_process');
const path = require('path');

module.exports = async () => {
  try {
    // Dynamically import the 'open' module (since it's an ES module)
    const open = (await import('open')).default;

    // Generate Allure report
    console.log('Generating Allure report...');
    execSync('npx allure generate allure-results --clean', { stdio: 'inherit' });

    // Define the path to the generated Allure report's index.html
    const reportPath = path.resolve(__dirname, 'allure-report/index.html');

    // Check if the path exists and then open it
    console.log('Opening Allure report...');
    await open(reportPath);
  } catch (error) {
    console.error('Error generating or opening Allure report:', error);
  }
};
