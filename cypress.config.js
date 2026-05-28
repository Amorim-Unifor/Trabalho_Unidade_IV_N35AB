const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    fileServerFolder: '.',
    specPattern: [
      'converter-backend/cypress/e2e/**/*.cy.js',
      'converter-frontend/cypress/e2e/**/*.cy.js'
    ],
    supportFile: false,
    baseUrl: 'http://localhost:4000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
