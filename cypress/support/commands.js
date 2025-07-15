// Violet Yousif, 07/12/2024, For global configurations, custom commands, and reusable logic.
// // Import custom commands
// import './commands';

// // Handle uncaught exceptions
// Cypress.on('uncaught:exception', (err, runnable) => {
//   // Prevent Cypress from failing the test on uncaught exceptions
//   return false;
// });

// // Add a custom log for every test
// Cypress.on('test:before:run', (attributes, test) => {
//   console.log(`Running test: ${test.title}`);
// });

// // Import third-party plugins
// import 'cypress-axe'; // Accessibility testing
// import 'cypress-file-upload'; // File upload support

// Custom command to log in
Cypress.Commands.add('login', () => {
  const email = Cypress.env('TEST_USER_EMAIL');
  const password = Cypress.env('TEST_USER_PASSWORD');

  if (!email || !password) {
    throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD must be defined in Cypress env');
  }

  cy.request({
    method: 'POST',
    url: 'http://localhost:8080/api/login',
    body: {
      email,
      password,
    },
    headers: {
      'Content-Type': 'application/json'
    },
    // Include credentials (cookies) so the app session is set
    failOnStatusCode: true,
  }).then((resp) => {
    expect(resp.status).to.eq(200);
    // Set cookie if your backend uses auth cookies
    // Otherwise, store JWT to localStorage if your app uses that
  });

  // Now load the app with session active
  cy.visit('/profile');
});


// Custom command to reset the database
// Cypress.Commands.add('resetDatabase', () => {
//   cy.request('POST', '/api/reset-database');
// });