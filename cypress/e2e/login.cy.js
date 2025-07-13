// Violet Yousif, 07/12/2024,  For organizing end-to-end test files. (example)

// describe('Login Page', () => {
//   it('should log in successfully with valid credentials', () => {
//     cy.visit('/login');
//     cy.get('input[name="email"]').type('mothergothel@example.com');
//     cy.get('input[name="password"]').type('MotherIsDisney11!');
//     cy.get('button[type="submit"]').click();
//     cy.url().should('include', '/chatbot');
//   });
// });

// cypress/e2e/login.cy.js

// mock login API response
describe('Login Page', () => {
  it('logs in as user and redirects to /chatBot', () => {
    cy.intercept('POST', 'http://localhost:8080/api/login', {
      statusCode: 200,
      body: {
        user: {
          firstName: 'Test',
          role: 'user'
        }
      }
    }).as('mockLogin');

    cy.visit('http://localhost:3000/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('ValidPass123!');
    cy.get('button[type="submit"]').click();

    cy.wait('@mockLogin');
    cy.url().should('include', '/chatBot');
  });

  it('logs in as admin and redirects to /admin/adminUpload', () => {
    cy.intercept('POST', 'http://localhost:8080/api/login', {
      statusCode: 200,
      body: {
        user: {
          firstName: 'Admin',
          role: 'admin'
        }
      }
    }).as('mockLoginAdmin');

    cy.visit('http://localhost:3000/login', { failOnStatusCode: false });
    cy.get('input[name="email"]').type('admin@example.com');
    cy.get('input[name="password"]').type('SecureAdminPass!');
    cy.get('button[type="submit"]').click();

    cy.wait('@mockLoginAdmin');
    cy.url().should('include', '/admin/adminUpload');
  });
});

// Real backend login test
describe('Login Page - Real Backend', () => {
  it('logs in with valid credentials and redirects to dashboard (real backend)', () => {
    cy.visit('http://localhost:3000/login');

    // Type real login credentials
    cy.get('input[name="email"]').type('mothergothel@example.com');
    cy.get('input[name="password"]').type('MotherIsDisney11!');

    // Submit login form
    cy.get('button[type="submit"]').click();

    // Wait for redirect
    cy.url().should('include', '/chatBot'); // or '/chatBot' for normal user
  });
});
