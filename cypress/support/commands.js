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
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Custom command to reset the database
// Cypress.Commands.add('resetDatabase', () => {
//   cy.request('POST', '/api/reset-database');
// });