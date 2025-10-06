describe('Login flow and nav highlighting', () => {
  beforeEach(() => {
    // adjust baseUrl in cypress.config.ts if needed
    cy.intercept('POST', '/auth/login', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          accessToken: 'fake-access-token',
          refreshToken: 'fake-refresh-token',
        },
      });
    }).as('loginRequest');
  });

  it('logs in and shows nav with active Products link', () => {
    cy.visit('/login');

    // fill the login form
    cy.get('input[formControlName="username"]').type('testuser');
    cy.get('input[formControlName="password"]').type('password');

    // submit
    cy.get('button[type="submit"]').click();

    // wait for API and navigation
    cy.wait('@loginRequest');

    // after successful login effect navigates to /products
    cy.url().should('include', '/products');

    // nav should be visible and Products link should have active class
    cy.get('nav').should('be.visible');
    cy.get('a[routerLink="/products"]').should('have.class', 'active-link');
    cy.get('a[routerLink="/favourites"]').should('be.visible');
  });
});
