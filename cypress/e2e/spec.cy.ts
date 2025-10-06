describe('Login flow and nav highlighting', () => {
  beforeEach(() => {
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

    cy.get('input[formControlName="username"]').type('testuser');
    cy.get('input[formControlName="password"]').type('password');

    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');

    cy.url().should('include', '/products');

    cy.get('nav').should('be.visible');
    cy.get('a[routerLink="/products"]').should('have.class', 'active-link');
    cy.get('a[routerLink="/favourites"]').should('be.visible');
  });
});
