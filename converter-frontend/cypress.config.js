const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4000', // porta do frontend
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: false,
  },
});