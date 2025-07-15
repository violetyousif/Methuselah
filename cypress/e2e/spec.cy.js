// Use as a test doc to get up and running with Cypress
// to run: "npx cypress open"
// to run headless: "npx cypress run"
// to run a specific test: "npx cypress run --spec cypress/e2e/spec.cy.js"

describe('My First Test', () => {
  it('Does not do much!', () => {
    //cy.visit('https://example.cypress.io')
    expect(true).to.equal(true)
  })
})
