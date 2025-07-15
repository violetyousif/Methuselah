// cypress/e2e/adminUpload.cy.js

describe('Admin Upload Page Functional Tests', () => {
  beforeEach(() => {
    // prevent any Next.js runtime errors from blocking clicks
    Cypress.on('uncaught:exception', () => false);

    // stub admin auth check so page renders
    cy.intercept('GET', '/api/checkAuth', {
      statusCode: 200,
      body: { user: { id: 'admin-id', email: 'admin@example.com', firstName: 'Admin' } }
    }).as('checkAuth');

    cy.visit('/admin/adminUpload');
    cy.wait('@checkAuth');
  });

  it('FTC-1.30: Admin File Upload Success', () => {
    // stub the backend ingest endpoint
    cy.intercept('POST', '/api/admin/uploadData', {
      statusCode: 200,
      body: { chunks: 42 }
    }).as('uploadData');

    // drag & drop a PDF
    cy.fixture('sample.pdf', 'binary').then(fileContent => {
      cy.get('.ant-upload-drag')                           // the Dragger area
        .selectFile(
          { fileContent, fileName: 'sample.pdf', mimeType: 'application/pdf' },
          { action: 'drag-drop' }
        );
    });

    // wait and verify success notification
    cy.wait('@uploadData');
    cy.get('.ant-notification-notice-success')
      .should('contain', 'Upload Successful')
      .and('contain', '42 chunks processed');
  });

  it('FTC-1.31: Admin File Upload Failure on Unsupported File Type', () => {
    // stub the backend to reject unsupported types
    cy.intercept('POST', '/api/admin/uploadData', {
      statusCode: 400,
      body: { notification: 'Unsupported file type' }
    }).as('uploadFail');

    // drag & drop a .py file
    cy.fixture('code.py', 'binary').then(fileContent => {
      cy.get('.ant-upload-drag')
        .selectFile(
          { fileContent, fileName: 'code.py', mimeType: 'text/x-python' },
          { action: 'drag-drop' }
        );
    });

    cy.wait('@uploadFail');
    cy.get('.ant-notification-notice-error')
      .should('contain', 'Unsupported file type');
  });

  it('FTC-1.31: Admin URL Upload Success', () => {
    // stub the URL-ingest endpoint
    cy.intercept('POST', '/api/admin/uploadURL', {
      statusCode: 200,
      body: { chunks: 5, source: 'https://example.com/article' }
    }).as('uploadURL');

    // type a valid URL and hit enter
    cy.get('input[placeholder="https://example.com/article"]')
      .type('https://example.com/article{enter}');

    cy.wait('@uploadURL');
    cy.get('.ant-notification-notice-success')
      .should('contain', 'URL Uploaded')
      .and('contain', '5 chunks extracted from: https://example.com/article');
  });

  it('FTC-1.31: Admin URL Upload Failed to Read Link', () => {
    // stub a network error for the URL endpoint
    cy.intercept('POST', '/api/admin/uploadURL', {
      statusCode: 502,
      body: { message: 'Unable to retrieve content from URL' }
    }).as('uploadURLFail');

    // enter a bogus URL
    cy.get('input[placeholder="https://example.com/article"]')
      .clear()
      .type('https://no-such-domain.example.com/file.pdf{enter}');

    cy.wait('@uploadURLFail');
    cy.get('.ant-notification-notice-error')
      .should('contain', 'Failed to process URL')
      .and('contain', 'Unable to retrieve content from URL');
  });
});
// cypress/e2e/adminUpload.cy.js

describe('Admin Upload Page Functional Tests', () => {
  beforeEach(() => {
    // prevent any Next.js runtime errors from blocking clicks
    Cypress.on('uncaught:exception', () => false);

    // stub admin auth check so page renders
    cy.intercept('GET', '/api/checkAuth', {
      statusCode: 200,
      body: { user: { id: 'admin-id', email: 'admin@example.com', firstName: 'Admin' } }
    }).as('checkAuth');

    cy.visit('/admin/adminUpload');
    cy.wait('@checkAuth');
  });

  it('FTC-1.30: Admin File Upload Success', () => {
    // stub the backend ingest endpoint
    cy.intercept('POST', '/api/admin/uploadData', {
      statusCode: 200,
      body: { chunks: 42 }
    }).as('uploadData');

    // drag & drop a PDF
    cy.fixture('sample.pdf', 'binary').then(fileContent => {
      cy.get('.ant-upload-drag')                           // the Dragger area
        .selectFile(
          { fileContent, fileName: 'sample.pdf', mimeType: 'application/pdf' },
          { action: 'drag-drop' }
        );
    });

    // wait and verify success notification
    cy.wait('@uploadData');
    cy.get('.ant-notification-notice-success')
      .should('contain', 'Upload Successful')
      .and('contain', '42 chunks processed');
  });

  it('FTC-1.31: Admin File Upload Failure on Unsupported File Type', () => {
    // stub the backend to reject unsupported types
    cy.intercept('POST', '/api/admin/uploadData', {
      statusCode: 400,
      body: { notification: 'Unsupported file type' }
    }).as('uploadFail');

    // drag & drop a .py file
    cy.fixture('code.py', 'binary').then(fileContent => {
      cy.get('.ant-upload-drag')
        .selectFile(
          { fileContent, fileName: 'code.py', mimeType: 'text/x-python' },
          { action: 'drag-drop' }
        );
    });

    cy.wait('@uploadFail');
    cy.get('.ant-notification-notice-error')
      .should('contain', 'Unsupported file type');
  });

  it('FTC-1.31: Admin URL Upload Success', () => {
    // stub the URL-ingest endpoint
    cy.intercept('POST', '/api/admin/uploadURL', {
      statusCode: 200,
      body: { chunks: 5, source: 'https://example.com/article' }
    }).as('uploadURL');

    // type a valid URL and hit enter
    cy.get('input[placeholder="https://example.com/article"]')
      .type('https://example.com/article{enter}');

    cy.wait('@uploadURL');
    cy.get('.ant-notification-notice-success')
      .should('contain', 'URL Uploaded')
      .and('contain', '5 chunks extracted from: https://example.com/article');
  });

  it('FTC-1.31: Admin URL Upload Failed to Read Link', () => {
    // stub a network error for the URL endpoint
    cy.intercept('POST', '/api/admin/uploadURL', {
      statusCode: 502,
      body: { message: 'Unable to retrieve content from URL' }
    }).as('uploadURLFail');

    // enter a bogus URL
    cy.get('input[placeholder="https://example.com/article"]')
      .clear()
      .type('https://no-such-domain.example.com/file.pdf{enter}');

    cy.wait('@uploadURLFail');
    cy.get('.ant-notification-notice-error')
      .should('contain', 'Failed to process URL')
      .and('contain', 'Unable to retrieve content from URL');
  });
});
