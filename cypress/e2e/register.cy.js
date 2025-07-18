// cypress/e2e/register.cy.js
// Functional tests for Registration page (TC-FUNC-1.1 → 1.5)

// cypress/e2e/register.cy.js

describe('Registration Page', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/api/send-reset-code', { statusCode: 200 }).as('sendCode');
    cy.intercept('POST', '**/api/verify-reset-code', { statusCode: 200 }).as('verifyCode');
    cy.intercept('POST', '**/api/register', { statusCode: 200 }).as('doRegister');
    cy.visit('/register');
  });

  it('TC-FUNC-1.1: Successful User Registration', () => {
    cy.get('input[placeholder="Jane"]').type('Jane');
    cy.get('input[placeholder="janedoe@example.com"]').type('newuser@example.com');
    cy.get('input[placeholder="Minimum 10 characters"]').type('Str0ngPassw0rd!');
    cy.get('input[placeholder="Verify Password"]').type('Str0ngPassw0rd!');
    cy.get('input[type="date"]').type('1990-01-01');
    cy.contains('I agree to the').click();

    cy.contains('Sign Up').scrollIntoView().click({ force: true });
    cy.wait('@sendCode');

    cy.get('input[placeholder="Enter 6-digit code"]', { timeout: 10000 })
      .type('123456');
    cy.contains('Verify & Register').click({ force: true });

    cy.wait('@verifyCode');
    cy.wait('@doRegister');

    cy.get('.ant-notification-notice-success')
      .should('contain', 'Registration Complete');
    cy.url().should('include', '/login');
  });


  it('TC-FUNC-1.2: Registration Fails Due to Weak Password', () => {
    cy.get('input[placeholder="janedoe@example.com"]').type('weakpass@example.com');
    cy.get('input[placeholder="Minimum 10 characters"]').type('12345');
    cy.get('input[placeholder="Verify Password"]').type('12345');
    cy.get('input[type="date"]').type('1990-01-01');
    cy.contains('I agree to the').click();

    cy.contains('Sign Up')
      .scrollIntoView()
      .click({ force: true });

    cy.get('.ant-form-item-explain-error')
      .should('contain', 'Password must be at least 10 characters long');
  });


it('TC-FUNC-1.3: Registration with Existing Email', () => {
  // stub the *code* endpoint to simulate "user already exists"
  cy.intercept('POST', 'http://localhost:8080/api/send-reset-code', {
    statusCode: 400,
    body: { message: 'Email is already in use' }
  }).as('sendCodeFail');
  cy.visit('/register', { failOnStatusCode: false });
  // fill in the form
  cy.get('input[placeholder="janedoe@example.com"]')
    .type('existing@example.com');
  cy.get('input[placeholder="Minimum 10 characters"]')
    .type('AnotherPass123!');
  cy.get('input[placeholder="Verify Password"]')
    .type('AnotherPass123!');
  cy.get('input[type="date"]')
    .type('1990-01-01');
  cy.contains('I agree to the').click();

  // trigger send-code
  cy.contains('Sign Up').scrollIntoView().click({ force: true });

  // now we expect the failure on send-reset-code
  cy.wait('@sendCodeFail', { timeout: 10000 });

  // assert the error notification appeared
  cy.get('.ant-notification-notice-error')
    .should('contain', 'Email is already in use');
});


  it('TC-FUNC-1.4: Registration Blocked When Terms Not Accepted', () => {
    cy.get('input[placeholder="janedoe@example.com"]').type('user@example.com');
    cy.get('input[placeholder="Minimum 10 characters"]').type('ValidPass123!');
    cy.get('input[placeholder="Verify Password"]').type('ValidPass123!');
    cy.get('input[type="date"]').type('1990-01-01');
    // DON’T click the “I agree” checkbox
    cy.contains('Sign Up').click({ force: true });

    cy.get('.ant-form-item-explain-error')
      .should('contain', 'You must agree to the Terms of Service to proceed.');
  });


  it('TC-FUNC-1.5: Invalid Email Format Blocks Submission', () => {
    cy.get('input[placeholder="janedoe@example.com"]').type('invalid-email');
    cy.contains('Sign Up').click({ force: true });

    cy.get('.ant-form-item-explain-error')
      .should('contain', 'Please enter a valid email');
  });
});

