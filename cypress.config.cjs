module.exports = {
  projectId: "ovrk8a",

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here if needed
    },
    baseUrl: "http://localhost:3000", // Replace with your app's base URL
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
