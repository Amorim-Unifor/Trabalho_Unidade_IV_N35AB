const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    fileServerFolder: '.',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: false,
  },
});
