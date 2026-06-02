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
    // Visita a rota raiz do backend, que serve o frontend
    cy.visit('http://localhost:4000');
  });

  // --- 1. TESTES DE ESTRUTURA E ESTADO INICIAL ---
  it('deve carregar o formulário e os elementos iniciais corretamente', () => {
    cy.get('#value-input').should('exist').and('have.value', '');
    cy.get('#from').should('exist').and('have.value', 'm');
    cy.get('#to').should('exist').and('have.value', 'm');
    cy.get('button[type="submit"]').should('contain.text', 'Converter');
    cy.get('#result').should('have.class', 'hidden');
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
    cy.intercept('POST', 'http://localhost:9999/api/convert', { forceNetworkError: true }).as('backendDown');

    cy.get('#api-base').clear().type('http://localhost:9999');
    cy.get('#value-input').clear().type('1');
    cy.get('#from').select('m');
    cy.get('#to').select('km');
    cy.get('button[type="submit"]').click();

    cy.wait('@backendDown');
    cy.get('#error').should('contain.text', 'Falha ao conectar ao backend');
  });

  // --- 3. TESTES DE TRATAMENTO DE ERRO ---
  it('deve exibir mensagem de erro retornada pelo json da API', () => {
    cy.intercept('POST', 'http://localhost:4000/api/convert', {
      statusCode: 400,
      body: { error: 'Unidade inválida para conversão' }
    }).as('apiErrorRoute');

    cy.get('#value-input').type('10');
    cy.get('button[type="submit"]').click();

    cy.wait('@apiErrorRoute');
    cy.get('#error').should('have.text', 'Unidade inválida para conversão');
    cy.get('#value-out').should('have.text', '—');
    cy.get('#expression').should('have.text', '—');
  });

  // --- 5. TESTES DO BOTÃO DE LIMPAR (CLEAR) ---
  it('deve resetar os campos do formulário e ocultar os resultados ao clicar em limpar', () => {
    // Primeiro preenchemos dados para simular uma tela ativa
    cy.get('#value-input').type('250');
    cy.get('#from').select('mi');
    cy.get('#to').select('ft');
    
    // Força a exibição do card de resultados para testar se ele vai sumir
    cy.get('#result').invoke('removeClass', 'hidden');

    // Executa a ação de limpar
    cy.get('#clear').click();

    // Asserts de retorno ao estado original do HTML
    cy.get('#value-input').should('have.value', '');
    cy.get('#from').should('have.value', 'm');
    cy.get('#to').should('have.value', 'km');
    cy.get('#result').should('have.class', 'hidden');
    cy.get('#error').should('have.text', '');
  });
});
