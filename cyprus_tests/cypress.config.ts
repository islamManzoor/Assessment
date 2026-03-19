import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://giphy-app-nu.vercel.app',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 15000,
    pageLoadTimeout: 30000,
    requestTimeout: 15000,
    responseTimeout: 30000,
    
    env: {
      // Giphy API configuration
      GIPHY_API_BASE_URL: 'https://api.giphy.com/v1/gifs',
      GIPHY_API_KEY: 'dc6zaTOxFJmzC', // Public beta key from Giphy docs
    },

    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });
      
      return config;
    },

    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
  },
  
  retries: {
    runMode: 2,
    openMode: 0,
  },
});
