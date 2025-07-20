// cypress/e2e/settings.cy.js

describe('Settings Page', () => {
  beforeEach(() => {
    // 1) Stub the initial load
    cy.intercept('GET', '**/api/settings', {
      statusCode: 200,
      body: {
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        profilePic: '/avatars/avatar3.png',
        preferences: { theme: 'dark' },
      },
    }).as('loadSettings');

    cy.visit('/settings');
    cy.wait('@loadSettings');
  });

  it('FTC-1.13, Change User Theme Preference: toggles theme immediately', () => {
    // initial theme
    cy.get('body').should('have.attr', 'data-theme', 'dark');

    // choose Light
    cy.get('.settings-card .ant-select').click();
    cy.contains('.ant-select-item-option', 'Light').click();

    // stub save
    cy.intercept('PATCH', '**/api/updateSettings', {
      statusCode: 200,
      body: { success: true },
    }).as('saveTheme');

    cy.get('.settingsSaveButton').scrollIntoView().click();
    cy.wait('@saveTheme');

    cy.get('body').should('have.attr', 'data-theme', 'default');
    cy.get('.ant-notification-notice-success')
      .should('contain', 'Settings Saved');
  });


  it('FTC-1.24, Select or Change Profile Avatar from Gallery: updates preview', () => {
    cy.get('.settings-card img[alt="Profile 0"]')
      .invoke('attr', 'src')
      .then(src => {
        cy.get('.settings-card img[alt="Profile 0"]').click();
        cy.get('.ant-avatar img').should('have.attr', 'src', src);
      });
  });

  it('FTC-1.25, Upload Personal Avatar Image: accepts JPG/PNG and shows success', () => {
    cy.fixture('./fixture/sample-img.jpg', null).then(fileContent => {
      cy.intercept('PATCH', '**/api/updateSettings', {
        statusCode: 200,
        body: { success: true },
      }).as('uploadPic');

      // click upload button to reveal the file input
      cy.get('.settingsUploadButton').click();
      cy.get('input[type=file]').selectFile({
        contents: fileContent,
       fileName: 'sample-img.jpg',
        mimeType: 'image/jpg'
      }, { force: true });

      cy.wait('@uploadPic');
      cy.get('.ant-notification-notice-success')
        .should('contain', 'Profile Picture Updated');
    });
  });

  it('FTC-1.26, Avatar Upload Failure on Invalid Format: rejects non-JPG/PNG', () => {
    cy.fixture('./fixture/img-sample.gif', null).then(fileContent => {
      cy.intercept('PATCH', '**/api/updateSettings', {
        statusCode: 400,
        body: { message: 'Invalid format' },
      }).as('uploadFail');

      cy.get('.settingsUploadButton').click();
      cy.get('input[type=file]').selectFile({
        contents: fileContent,
        fileName: 'img-sample.gif',
        mimeType: 'image/gif'
      }, { force: true });

      cy.wait('@uploadFail');
      cy.get('.ant-notification-notice-error')
        .should('contain', 'Upload Failed');
    });
  });
});
