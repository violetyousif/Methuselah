// Violet Yousif, 07/12/2024,  For organizing end-to-end test files. (example)

describe('Login Page', () => {
  it('should log in successfully with valid credentials', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});