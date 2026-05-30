describe('Conversor de Unidades Frontend', () => {
  const apiBase = 'http://localhost:4000';

  beforeEach(() => {
    // Visita a página inicial configurada antes de cada teste
    cy.visit('/index.html');
  });

  // --- 1. TESTES DE ESTRUTURA E ESTADO INICIAL ---
  it('deve carregar o formulário e os elementos iniciais corretamente', () => {
    cy.get('#value-input').should('exist').and('have.value', '');
    cy.get('#from').should('exist').and('have.value', 'm');
    cy.get('#to').should('exist').and('have.value', 'm');
    cy.get('button[type="submit"]').should('contain.text', 'Converter');
    cy.get('#result').should('have.class', 'hidden');
  });

  // --- 2. TESTES DE FLUXO DE CONVERSÃO (SUCESSO) ---
  it('deve converter metros para quilômetros com sucesso (resposta simples da API)', () => {
    // Moca a rota de conversão simulando um JSON padrão
    cy.intercept('POST', `${apiBase}/api/convert`, {
      statusCode: 200,
      body: {
        expression: '100 m',
        result: '0.1'
      }
    }).as('convertRoute');

    cy.get('#value-input').type('100');
    cy.get('#from').select('m');
    cy.get('#to').select('km');
    cy.get('button[type="submit"]').click();

    // Aguarda a requisição mocada acontecer
    cy.wait('@convertRoute');

    // Validações na interface visual
    cy.get('#result').should('not.have.class', 'hidden');
    cy.get('#expression').should('have.text', '100 m');
    cy.get('#value-out').should('have.text', '0.1 km');
  });

  it('deve formatar corretamente se a API retornar uma expressão contendo o caractere "="', () => {
    // O JS divide a string no "=": partes[0] vai para expressionEl, partes de trás para valueOutEl
    cy.intercept('POST', `${apiBase}/api/convert`, {
      statusCode: 200,
      body: {
        expression: '50 mi = 80.4672 km'
      }
    }).as('convertEqualRoute');

    cy.get('#value-input').type('50');
    cy.get('#from').select('mi');
    cy.get('#to').select('km');
    cy.get('button[type="submit"]').click();

    cy.wait('@convertEqualRoute');

    cy.get('#result').should('not.have.class', 'hidden');
    cy.get('#expression').should('have.text', '50 mi');
    cy.get('#value-out').should('have.text', '80.4672 km');
  });

  // --- 3. TESTES DE TRATAMENTO DE ERRO ---
  it('deve exibir mensagem de erro retornada pelo json da API', () => {
    cy.intercept('POST', `${apiBase}/api/convert`, {
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

  it('deve mostrar erro genérico de rede se o servidor falhar/rejeitar a conexão', () => {
    // Simula uma falha física de rede (ex: servidor fora do ar)
    cy.intercept('POST', `${apiBase}/api/convert`, { forceNetworkError: true }).as('networkErrorRoute');

    cy.get('#value-input').type('5');
    cy.get('button[type="submit"]').click();

    cy.wait('@networkErrorRoute');
    cy.get('#error').should('contain.text', 'Falha ao conectar ao backend. Verifique se o servidor está rodando.');
  });

  // --- 4. TESTES DO HEALTHCHECK (PING) ---
  it('deve exibir o status e horário ao realizar o ping com sucesso', () => {
    cy.contains('summary', 'Configurações avançadas').click();
    
    cy.intercept('GET', `${apiBase}/api/health`, {
      statusCode: 200,
      body: { status: 'OK', time: '12:00:00' }
    }).as('healthRoute');

    cy.get('#ping').click();
    cy.wait('@healthRoute');
    cy.get('#health-out').should('have.text', 'Status: OK • 12:00:00');
  });

  it('deve exibir mensagem de falha se o ping falhar na rede', () => {
    cy.contains('summary', 'Configurações avançadas').click();
    cy.intercept('GET', `${apiBase}/api/health`, { forceNetworkError: true }).as('healthFailRoute');

    cy.get('#ping').click();
    cy.wait('@healthFailRoute');
    cy.get('#health-out').should('have.text', 'Falha ao conectar.');
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
