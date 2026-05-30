describe('Conversor de Unidades Frontend', () => {
  beforeEach(() => {
  cy.visit('/index.html');
});

  it('deve carregar o formulário corretamente', () => {
    cy.get('#value-input').should('exist');
    cy.get('#from').should('exist');
    cy.get('#to').should('exist');
    cy.get('button[type="submit"]').should('contain.text', 'Converter');
  });

  it('deve converter metros para milhas e mostrar resultado', () => {
    cy.get('#value-input').type('100');
    cy.get('#from').select('m');
    cy.get('#to').select('mi');
    cy.get('button[type="submit"]').click();

    cy.get('#result').should('not.have.class', 'hidden');
    cy.get('#expression').should('contain.text', '100 m');
    cy.get('#value-out').should('contain.text', '0.062137');
  });

  it('deve mostrar erro se o backend estiver fora do ar', () => {
    cy.contains('summary', 'Configurações avançadas').click();
    cy.get('#api-base').clear().type('http://localhost:9999');
    cy.get('#value-input').type('1');
    cy.get('#from').select('m');
    cy.get('#to').select('km');
    cy.get('button[type="submit"]').click();

    cy.get('#error').should('contain.text', 'Falha ao conectar ao backend');
  });
});
