// import dayjs from 'dayjs';

describe('Profile Page Functional Tests', () => {
  beforeEach(() => {
    cy.login(); // Custom command to login test user
    cy.visit('/profile');
  });

  it('FTC-1.10: Update User General Health Profile Fields', () => {
    cy.get('input[type="date"]').clear().type('1995-05-10');
    cy.get('.ant-select').first().click();
    cy.contains('.ant-select-item-option', 'Female').click();
    cy.get('input[placeholder="E.g. Lose weight, gain muscle, improve sleep"]').type('Improve energy');
    cy.get('input[placeholder="E.g. Vitamin D, Omega-3, Multivitamin"]').type('Vitamin D');
    cy.get('input[placeholder="E.g. Metformin, Lisinopril"]').type('None');
    cy.get('button[type="submit"]').click();
    cy.get('.ant-notification-notice-success').should('contain', 'successfully saved');
  });

  it('FTC-1.11: Update Daily Health Metrics', () => {
    cy.get('.ant-tabs-tab').contains('Daily Health Metrics').click();
    cy.get('input[aria-valuemin="0"]').eq(0).clear().type('7'); // Sleep
    cy.get('input[aria-valuemin="0"]').eq(1).clear().type('1.5'); // Exercise
    cy.get('.ant-select').eq(1).click();
    cy.contains('.ant-select-item-option', 'Happy').click();
    cy.get('input[aria-valuemin="0"]').eq(2).clear().type('155'); // Weight
    cy.get('input[aria-valuemin="0"]').eq(3).clear().type('2200'); // Calories
    cy.contains('Save').click();
    cy.get('.ant-notification-notice-success').should('contain', 'successfully recorded');
  });

  it('FTC-1.12: Save Daily Health Metrics for New Date', () => {
    cy.get('.ant-tabs-tab').contains('Daily Health Metrics').click();
    cy.contains('Calendar').click();
    cy.get('.ant-picker-cell-inner').not('.ant-picker-cell-disabled').first().click();
    cy.get('input[aria-valuemin="0"]').eq(0).clear().type('8'); // Sleep
    cy.get('input[aria-valuemin="0"]').eq(1).clear().type('1'); // Exercise
    cy.get('input[aria-valuemin="0"]').eq(2).clear().type('160'); // Weight
    cy.get('input[aria-valuemin="0"]').eq(3).clear().type('2000'); // Calories
    cy.get('.ant-select').eq(1).click();
    cy.contains('.ant-select-item-option', 'Excited').click();
    cy.contains('Save').click();
    cy.get('.ant-notification-notice-success').should('contain', 'successfully recorded');
  });

  it('FTC-1.14: Prevent Future Date Entry for Daily Metrics', () => {
    cy.get('.ant-tabs-tab').contains('Daily Health Metrics').click();
    cy.contains('Calendar').click();
    const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
    cy.get(`td[title="${tomorrow}"]`).should('have.class', 'ant-picker-cell-disabled');
  });

  it('FTC-1.15: Edit Existing Daily Metrics', () => {
    cy.get('.ant-tabs-tab').contains('Daily Health Metrics').click();
    cy.get('button[aria-label="left"]').should('be.visible').click();
    cy.get('input[aria-valuemin="0"]').eq(1).clear().type('2');
    cy.contains('Save').click();
    cy.get('.ant-notification-notice-success').should('contain', 'successfully recorded');
  });
});