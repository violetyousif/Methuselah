// Violet Yousif, 07/12/2024,  For organizing end-to-end test files. (example)

// cypress/e2e/login.cy.js
// Functional tests for Login page (TC-FUNC-1.6, 1.7, 1.29)

describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });
  it('FTC-1.32: Successful User Login', () => {
    // hit your Next.js page
    cy.visit('/login', { timeout: 60000 });

    // now that we've given the page time to hydrate, assert the inputs exist
    cy.get('input[name="email"]', { timeout: 20000 })
      .should('be.visible')
      .type(Cypress.env('TEST_USER_EMAIL'));
    cy.get('input[name="password"]', { timeout: 20000 })
      .should('be.visible')
      .type(Cypress.env('TEST_USER_PASSWORD'));

    // submit
    cy.get('button[type="submit"]').click();

    // final redirect assertion
    cy.url({ timeout: 20000 }).should('include', '/chatBot');
  });

  it('FTC-1.6: shows error for unregistered email', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('noone@notfound.com');
    cy.get('input[name="password"]').type('AnyPass123!');
    cy.get('button[type="submit"]').click();

    // assert we did NOT redirect
    cy.url().should('include', '/login');
    // assert an error notification appears
    cy.get('.ant-notification-notice-content')
      .should('contain.text', 'Invalid email and/or password');
  });

  it('FTC-1.7: Account Lockout After Five Failed Login Attempts', () => {
    // simulate a lockout response from your backend
    cy.intercept('POST', '/api/login', {
      statusCode: 423,
      body: { message: 'Account locked' }
    }).as('locked');

    // attempt five times
    for (let i = 0; i < 5; i++) {
      cy.get('input[name="email"]').clear().type('user@example.com');
      cy.get('input[name="password"]').clear().type('WrongPass123!');
      cy.get('button[type="submit"]').click();
      cy.wait('@locked');
    }

    cy.get('.ant-notification-notice-error')
      .should('contain', 'Account locked');
  });
  

  it('FTC-1.29: Admin Login with Valid Credentials', () => {
    cy.get('input[name="email"]')
      .clear()
      .type(Cypress.env('ADMIN_EMAIL'));
    cy.get('input[name="password"]')
      .clear()
      .type(Cypress.env('ADMIN_PASSWORD'));
    cy.get('button[type="submit"]').click();

    // redirect to admin upload page
    cy.url({ timeout: 20000 }).should('include', '/admin/adminUpload');
  });
});

