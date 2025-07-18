/// <reference types="cypress" />

describe('Feedback Page Functional Tests', () => {
  beforeEach(() => {
    // Custom login command to authenticate user
    cy.login();
    cy.visit('/feedback');
  });

  it('FTC-1.21: Submit Feedback Successfully', () => {
    // Stub the feedback API to return success
    cy.intercept('POST', '/api/feedback', {
      statusCode: 200,
      body: { success: true }
    }).as('submitFeedback');

    // Select a rating of 5
    cy.get('.feedback-rating-container .ant-select-selector').click();
    cy.contains('.ant-select-item-option', '5').click();

    // Enter comments
    cy.get('textarea').type('App is very helpful');

    // Submit the form
    cy.get('.feedback-submit-button').click();

    // Wait for API call and verify response
    cy.wait('@submitFeedback').its('response.statusCode').should('eq', 200);

    // Verify success notification
    cy.get('.ant-notification-notice-success')
      .should('contain.text', 'Your feedback has been submitted successfully.');

    // Confirm redirect to chatBot page
    cy.url().should('include', '/chatBot');
  });

  it('FTC-1.22: Prevent Empty Feedback Submission', () => {
    // Attempt to submit without filling fields
    cy.get('.feedback-submit-button').click();

    // Verify validation errors for both rating and comments
    cy.get('.ant-form-item-explain-error').should('have.length', 2);
    cy.get('.ant-form-item-explain-error').eq(0)
      .should('contain.text', 'Please select a rating');
    cy.get('.ant-form-item-explain-error').eq(1)
      .should('contain.text', 'Please enter your feedback');
  });
});
