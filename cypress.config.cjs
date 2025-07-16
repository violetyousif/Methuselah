const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });


module.exports = {
  projectId: "ovrk8a",

  e2e: {
    projectId: process.env.CYPRESS_PROJECT_ID,
    env: {
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
      TEST_USER_EMAIL: process.env.TEST_USER_EMAIL,
      TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here if needed
    },
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}", // Default spec pattern
    failOnStatusCode: false, // Prevent Cypress from failing on 404 pages
    //supportFile: "cypress/support/e2e.js", // Path to your support file
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
};
