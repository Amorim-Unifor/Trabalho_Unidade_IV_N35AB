describe('Conversor de Unidades Frontend', () => {
  const conversionFactors = {
    m: 1,
    km: 1000,
    mi: 1609.344,
    ft: 0.3048
  };

  const formatExpectedResult = (value, from, to) => {
    const result = Number(value) * conversionFactors[from] / conversionFactors[to];
    return Number(result.toFixed(6)).toString();
  };

  const units = ['m', 'km', 'mi', 'ft'];

  beforeEach(() => {
    cy.visit('index.html');
  });

  it('deve carregar o formulário corretamente', () => {
    cy.get('#value-input').should('exist');
    cy.get('#from').should('exist');
    cy.get('#to').should('exist');
    cy.get('button[type="submit"]').should('contain.text', 'Converter');
  });

  units.forEach((from) => {
    units.forEach((to) => {
      it(`deve converter de ${from} para ${to} corretamente`, () => {
        const testValue = '123.45';
        const expected = Number(formatExpectedResult(testValue, from, to));

        cy.get('#value-input').clear().type(testValue);
        cy.get('#from').select(from);
        cy.get('#to').select(to);
        cy.get('button[type="submit"]').click();

        cy.get('#result').should('not.have.class', 'hidden');
        cy.get('#expression').should('contain.text', `${testValue} ${from}`);
        cy.get('#value-out')
          .invoke('text')
          .then((text) => {
            const numericText = text.replace(new RegExp(`\\s*${to}$`), '').trim();
            const actual = Number(numericText);
            expect(actual).to.be.closeTo(expected, 0.00001);
          });
      });
    });
  });

  it('deve mostrar erro se o backend estiver fora do ar', () => {
    cy.contains('summary', 'Configurações avançadas').click();
    cy.get('#api-base').clear().type('http://localhost:9999');
    cy.get('#value-input').clear().type('1');
    cy.get('#from').select('m');
    cy.get('#to').select('km');
    cy.get('button[type="submit"]').click();

    cy.get('#error').should('contain.text', 'Falha ao conectar ao backend');
  });
});
