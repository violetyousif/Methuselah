// // cypress/e2e/chatbot.cy.js

describe('AI Chatbot (Methuselah) – Conversation Management', () => {
  const conv1 = {
    conversationId: '1',
    title: 'Chat 1',
    summary: '',
    messages: [],
    createdAt: '2025-07-10T10:00:00Z',
    updatedAt: '2025-07-10T10:00:00Z',
  };

  // prevent Next.js error overlay from blocking clicks
  before(() => {
    Cypress.on('uncaught:exception', () => false);
  });

  beforeEach(() => {
    // Auth check
    cy.intercept('GET', '/api/checkAuth', {
      statusCode: 200,
      body: {
        user: {
          id: '6838a978b91976c935cf2cb3',
          firstName: 'Test',
          email: process.env.TEST_USER_EMAIL,
          profilePic: '/avatars/avatar1.png',
        },
      },
    }).as('checkAuth');

    // Theme load
    cy.intercept('GET', '/api/settings', {
      statusCode: 200,
      body: { preferences: { theme: 'default' } },
    }).as('getSettings');

    // Conversation list
    cy.intercept('GET', '/api/conversations', {
      statusCode: 200,
      body: [conv1],
    }).as('getConvs');

    // Single-conversation fetch (used by the greeting effect)
    cy.intercept('GET', `/api/conversations/${conv1.conversationId}`, {
      statusCode: 200,
      body: conv1,
    }).as('getConv1');

    // Add-message (initial greeting) – just return a dummy message
    cy.intercept('POST', `/api/conversations/${conv1.conversationId}/messages`, {
      statusCode: 201,
      body: {
        messageId: 'g1',
        role: 'assistant',
        content: 'Greetings, Test! I am Methuselah.',
        timestamp: new Date().toISOString(),
      },
    }).as('greeting');

    // Health metrics and user-data (useChatGPT hook)
    cy.intercept('GET', '/api/health-metrics', {
      statusCode: 200,
      body: { dates: {} },
    }).as('getMetrics');
    cy.intercept('GET', '/api/user-data', {
      statusCode: 200,
      body: {
        firstName: 'Test',
        dateOfBirth: '1990-01-01',
        weight: 70,
        height: 175,
        gender: 'male',
        activityLevel: 'moderate',
        sleepHours: 7,
      },
    }).as('getUserData');

    cy.visit('/chatBot');

    // wait for all initial requests
    cy.wait([
      '@checkAuth',
      '@getSettings',
      '@getConvs',
      '@getConv1',
      '@greeting',
      '@getMetrics',
      '@getUserData',
    ]);
  });

  it('FTC-1.16: Start a New Chat Session Successfully', () => {
    const conv2 = {
      conversationId: '2',
      title: 'Chat 2',
      summary: '',
      walletAddress: 'test@example.com',
      messages: [],
      createdAt: '2025-07-10T11:00:00Z',
      updatedAt: '2025-07-10T11:00:00Z',
    };

    // stub creation
    cy.intercept('POST', '/api/conversations', {
      statusCode: 201,
      body: conv2,
    }).as('createConv');

    // stub list after creation
    cy.intercept('GET', '/api/conversations', {
      statusCode: 200,
      body: [conv2, conv1],
    }).as('getConvsAfterNew');

    // wait until the sidebar button is visible and clickable
    cy.get('button.sidebar-button')
      .contains('+ New Chat', { matchCase: false }, { timeout: 20000 })
      .should('be.visible')
      .click({ force: true });

    cy.wait('@createConv');
    cy.wait('@getConvsAfterNew');

    // verify new chat appears
    cy.get('.chat-list-container').contains('Chat 2').should('exist');
  });

  it('FTC-1.17: Rename Chat Session with Valid Name', () => {
    // stub rename
    cy.intercept('PUT', `/api/conversations/${conv1.conversationId}/title`, {
      statusCode: 200,
      body: {
        message: 'Title updated successfully',
        conversationId: conv1.conversationId,
        title: 'Weekly Check-In',
      },
    }).as('renameConv');

    // stub list after rename
    cy.intercept('GET', '/api/conversations', {
      statusCode: 200,
      body: [{ ...conv1, title: 'Weekly Check-In' }],
    }).as('getConvsAfterRename');

    cy.get('.chat-list-container div')
      .contains('Chat 1')
      .parent()
      .within(() => {
        cy.get('button')
          .filter('.ant-dropdown-trigger')
          .click({ force: true });
      });
    cy.get('.ant-dropdown-menu-item').contains('Rename').click();

    cy.get('input.ant-input')
      .clear()
      .type('Weekly Check-In{enter}');

    cy.wait('@renameConv');
    cy.wait('@getConvsAfterRename');

    cy.get('.chat-list-container').contains('Weekly Check-In').should('exist');
  });

  it('FTC-1.18: Switch Between Chat Sessions', () => {
    // stub a second conv so we have two to switch between
    const conv2 = {
      ...conv1,
      conversationId: '2',
      title: 'Chat Two',
      messages: [{ messageId: 'm1', role: 'assistant', content: 'Hello!', timestamp: new Date().toISOString() }],
    };
    cy.intercept('GET', '/api/conversations', { statusCode: 200, body: [conv2, conv1] }).as('getConvsTwo');

    cy.reload();
    cy.wait(['@checkAuth', '@getSettings', '@getConvsTwo']);

    // click Chat 1
    cy.get('.chat-list-container div').contains('Chat 1').click({ force: true });
    cy.get('.chat-list-container div')
      .contains('Chat 1')
      .should('have.css', 'background-color')
      .and('not.eq', 'rgba(0, 0, 0, 0)');

    // click Chat Two
    cy.get('.chat-list-container div').contains('Chat Two').click({ force: true });
    cy.get('.chat-list-container div')
      .contains('Chat Two')
      .should('have.css', 'background-color')
      .and('not.eq', 'rgba(0, 0, 0, 0)');
  });

  it('FTC-1.19: Delete a Chat Session (Confirm)', () => {
    // add a second conv to delete
    const conv2 = { ...conv1, conversationId: '2', title: 'To Delete', messages: [] };
    cy.intercept('GET', '/api/conversations', { statusCode: 200, body: [conv2, conv1] }).as('getConvsTwo');
    cy.reload();
    cy.wait(['@checkAuth', '@getSettings', '@getConvsTwo']);

    cy.intercept('DELETE', `/api/conversations/${conv2.conversationId}`, {
      statusCode: 200,
      body: { message: 'Conversation deleted successfully', conversationId: conv2.conversationId },
    }).as('deleteConv');
    cy.intercept('GET', '/api/conversations', { statusCode: 200, body: [conv1] }).as('getConvsAfterDelete');

    cy.get('.chat-list-container div')
      .contains('To Delete')
      .parent()
      .within(() => {
        cy.get('button')
          .filter('.ant-dropdown-trigger')
          .click({ force: true });
      });
    cy.get('.ant-dropdown-menu-item').contains('Delete').click();
    cy.get('.ant-modal button')
      .contains('Delete')
      .click({ force: true });

    cy.wait('@deleteConv');
    cy.wait('@getConvsAfterDelete');

    cy.get('.chat-list-container').contains('To Delete').should('not.exist');
  });

  it('FTC-1.20: Cancel Delete Action', () => {
    cy.get('.chat-list-container div')
      .contains('Chat 1')
      .parent()
      .within(() => {
        cy.get('button')
          .filter('.ant-dropdown-trigger')
          .click({ force: true });
      });
    cy.get('.ant-dropdown-menu-item').contains('Delete').click();
    cy.get('.ant-modal button').contains('Cancel').click({ force: true });

    cy.get('.chat-list-container').contains('Chat 1').should('exist');
  });
});
