// Import custom commands
import './commands';

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing the test on uncaught exceptions
  return false;
});

// Import third-party plugins
//import 'cypress-axe'; // Accessibility testing
//import 'cypress-file-upload'; // File upload support

// Add global event listeners
Cypress.on('window:before:load', (win) => {
  // Example: Mock a global variable
  win.myGlobalVariable = 'mockedValue';
});

// Example: Disable animations for faster tests
Cypress.on('window:before:load', (win) => {
  win.document.body.style.animation = 'none';
  win.document.body.style.transition = 'none';
});

// Example: Custom utility to log in via API
Cypress.Commands.add('loginViaApi', (email, password) => {
  cy.request('POST', '/api/login', { email, password }).then((response) => {
    expect(response.status).to.eq(200);
    window.localStorage.setItem('authToken', response.body.token);
  });
});