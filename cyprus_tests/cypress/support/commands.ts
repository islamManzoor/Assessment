/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      shouldBeInViewport(): Chainable<void>;      
      scrollToBottom(): Chainable<void>;
      waitForApiCall(alias: string, timeout?: number): Chainable<void>;
      clearAllStorage(): Chainable<void>;
      getLocalStorage(key: string): Chainable<string | null>;
      setLocalStorage(key: string, value: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('shouldBeInViewport', { prevSubject: true }, (subject) => {
  const rect = subject[0].getBoundingClientRect();
  
  expect(rect.top).to.be.at.least(0);
  expect(rect.left).to.be.at.least(0);
  expect(rect.bottom).to.be.at.most(Cypress.config('viewportHeight'));
  expect(rect.right).to.be.at.most(Cypress.config('viewportWidth'));
  
  return subject;
});

Cypress.Commands.add('scrollToBottom', () => {
  cy.window().then((win) => {
    win.scrollTo(0, win.document.body.scrollHeight);
  });
});

Cypress.Commands.add('waitForApiCall', (alias: string, timeout = 10000) => {
  cy.wait(alias, { timeout });
});

Cypress.Commands.add('clearAllStorage', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

Cypress.Commands.add('getLocalStorage', (key: string) => {
  cy.window().then((win) => {
    return cy.wrap(win.localStorage.getItem(key));
  });
});

Cypress.Commands.add('setLocalStorage', (key: string, value: string) => {
  cy.window().then((win) => {
    win.localStorage.setItem(key, value);
  });
});

export {};
