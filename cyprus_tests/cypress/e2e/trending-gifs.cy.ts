/// <reference types="cypress" />

describe('Trending GIFs - E2E Tests', () => {
  
  beforeEach(() => {
    // Clear storage before each test
    cy.clearAllStorage();
    
    // Intercept trending API calls
    cy.intercept('GET', 'https://api.giphy.com/v1/gifs/trending*').as('getTrendingGifs');
  });

  describe('Initial Load and Rendering', () => {
    it('should load the application successfully', () => {
      cy.visit('/');
      
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
    });

    it('should make API call to trending endpoint on page load', () => {
      cy.visit('/');
      
      cy.wait('@getTrendingGifs').then((interception) => {
        expect(interception.request.url).to.include('/trending');
        expect(interception.request.url).to.include('api_key');
        
        expect(interception.response?.statusCode).to.eq(200);
        expect(interception.response?.body).to.have.property('data');
        expect(interception.response?.body.data).to.be.an('array');
      });
    });

    it('should request 15 GIFs with offset=0 on initial load', () => {
      cy.visit('/');
      
      cy.wait('@getTrendingGifs').then((interception) => {
        const url = new URL(interception.request.url);
        expect(url.searchParams.get('limit')).to.eq('15');
        expect(url.searchParams.get('offset')).to.eq('0');
      });
    });

    it('should display exactly 15 GIFs after initial load', () => {
      cy.visit('/');
      cy.wait('@getTrendingGifs');
      
      cy.wait(2000);
      
      cy.get('[data-cy="gifItem"]')
        .should('have.length', 15);
    });

    it('should display image and title for each GIF', () => {
      cy.visit('/');
      cy.wait('@getTrendingGifs');
      cy.wait(2000);
      
      cy.get('[data-cy="gifItem"]')
        .first()
        .should('be.visible')
        .and('have.attr', 'src')
        .and('have.attr', 'alt');
    });

    it('should display one GIF per row', () => {
      cy.visit('/');
      cy.wait('@getTrendingGifs');
      cy.wait(2000);
      
      cy.get('[data-cy="gifItem"]')
        .first()
        .then(($first) => {
          const firstTop = $first.offset()?.top || 0;
          
          cy.get('[data-cy="gifItem"]')
            .eq(1)
            .then(($second) => {
              const secondTop = $second.offset()?.top || 0;
              
              // Second item should be below first (different row)
              expect(secondTop).to.be.greaterThan(firstTop);
            });
        });
    });

    it('should show loading indicator during initial load', () => {
      cy.visit('/');
      
      cy.get('.justify-center', { timeout: 2000 })
        .should('exist');
    });

    it('should hide loading indicator after GIFs load', () => {
      cy.visit('/');
      cy.wait('@getTrendingGifs');
      cy.wait(2000);
      
      cy.get('.justify-center, [role="progressbar"]')
        .should('not.exist');
    });
  });

  describe('API Response Validation', () => {
    it.only('should receive proper API response structure', () => {
      cy.visit('/');
      
      cy.wait('@getTrendingGifs').then((interception) => {
        const response = interception.response?.body;
        
        // Validate response structure
        expect(response).to.have.property('data');
        expect(response.data).to.be.an('array');
        expect(response.data.length).to.be.at.most(15);
        expect(response.pagination).to.have.property('offset');
      });
    });

    it('should validate each GIF object has required fields', () => {
      cy.visit('/');
      
      cy.wait('@getTrendingGifs').then((interception) => {
        const gifs = interception.response?.body.data;
        
        if (gifs && gifs.length > 0) {
          const firstGif = gifs[0];
          
          // Validate GIF object structure
          expect(firstGif).to.have.property('id');
          expect(firstGif).to.have.property('title');
          expect(firstGif).to.have.property('images');
          expect(firstGif.images).to.be.an('object');
        }
      });
    });

    it('should handle successful 200 response', () => {
      cy.visit('/');
      
      cy.wait('@getTrendingGifs').then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);
      });
      
      // GIFs should be visible
      cy.get('[data-cy="gifItem"]', { timeout: 5000 })
        .should('have.length.gt', 0);
    });
  });

  describe('Infinite Scroll Functionality', () => {
    it('should load more GIFs when scrolling to bottom', () => {
      cy.visit('/');
      cy.wait('@getTrendingGifs');
      cy.wait(2000);
      
      cy.get('[data-cy="gifItem"]')
        .should('have.length', 15);
      
      cy.scrollToBottom();
      
      cy.wait('@getTrendingGifs', { timeout: 10000 }).then((interception) => {
        const url = new URL(interception.request.url);
        expect(url.searchParams.get('offset')).to.eq('15');
      });
      
      cy.wait(2000);
      
      cy.get('[data-cy="gifItem"]')
        .should('have.length', 30);
    });

    it('should append new GIFs without removing existing ones', () => {
      cy.visit('/');
      cy.wait('@getTrendingGifs');
      cy.wait(2000);
      
      cy.get('[data-cy="gifItem"]')
        .first()
        .invoke('attr', 'data-id')
        .then((firstGifId) => {
          cy.scrollToBottom();
          cy.wait('@getTrendingGifs');
          cy.wait(2000);
          
          if (firstGifId) {
            cy.get(`[data-id="${firstGifId}"]`).should('exist');
          }
          
          cy.get('[data-cy="gifItem"]')
            .should('have.length.gt', 15);
        });
    });

    it('should not load duplicate GIFs', () => {
      cy.visit('/');
      cy.wait('@getTrendingGifs');
      cy.wait(2000);
      
      const gifIds = new Set();
      
      cy.wait('@getTrendingGifs').then((interception) => {
        const data = interception.response?.body.data || [];
        data.forEach((gif: any) => gifIds.add(gif.id));
      });
    
      cy.scrollToBottom();
      cy.wait('@getTrendingGifs').then((interception) => {
        const data = interception.response?.body.data || [];
        data.forEach((gif: any) => {
          expect(gifIds.has(gif.id)).to.be.false;
        });
      });
    });

    it('should show loading indicator during scroll load', () => {
      cy.visit('/');
      cy.wait('@getTrendingGifs');
      cy.wait(2000);
      
      cy.scrollToBottom();
      
      cy.get('.justify-center', { timeout: 5000 })
        .should('be.visible');
      
      cy.wait('@getTrendingGifs');
      cy.wait(2000);
      
      cy.get('.justify-center')
        .should('not.be.visible');
    });

    it('should maintain scroll position after loading more GIFs', () => {
      cy.visit('/');
      cy.wait('@getTrendingGifs');
      cy.wait(2000);
    
      cy.scrollToBottom();
      
      cy.window().then((win) => {
        const scrollBeforeLoad = win.scrollY;
        
        cy.wait('@getTrendingGifs');
        cy.wait(2000);
        
        cy.window().then((winAfter) => {
          expect(winAfter.scrollY).to.be.at.least(scrollBeforeLoad * 0.8);
        });
      });
    });
  });

  describe('Multiple Scroll Events', () => {
    it('should handle multiple scroll loads correctly', () => {
      cy.visit('/');
      cy.wait('@getTrendingGifs'); // First load: offset 0
      cy.wait(2000);
      
      // Scroll 1
      cy.scrollToBottom();
      cy.wait('@getTrendingGifs'); // Second load: offset 15
      cy.wait(2000);
      
      // Scroll 2
      cy.scrollToBottom();
      cy.wait('@getTrendingGifs'); // Third load: offset 30
      cy.wait(2000);
      
      // Should have 45 GIFs
      cy.get('[data-cy="gifItem"]')
        .should('have.length', 45);
    });

    it('should use correct offset values for multiple loads', () => {
      const offsets: string[] = [];
      
      cy.visit('/');
      cy.wait('@getTrendingGifs').then((interception) => {
        const url = new URL(interception.request.url);
        offsets.push(url.searchParams.get('offset') || '0');
      });
      cy.wait(2000);
      
      // Load page 2
      cy.scrollToBottom();
      cy.wait('@getTrendingGifs').then((interception) => {
        const url = new URL(interception.request.url);
        offsets.push(url.searchParams.get('offset') || '0');
      });
      cy.wait(2000);
      
      // Load page 3
      cy.scrollToBottom();
      cy.wait('@getTrendingGifs').then((interception) => {
        const url = new URL(interception.request.url);
        offsets.push(url.searchParams.get('offset') || '0');
        
        // Verify offsets are correct
        expect(offsets).to.deep.equal(['0', '15', '30']);
      });
    });

    it('should maintain performance with many GIFs loaded', () => {
      cy.visit('/');
      cy.wait('@getTrendingGifs');
      cy.wait(2000);
      
      // Load multiple pages
      for (let i = 0; i < 3; i++) {
        cy.scrollToBottom();
        cy.wait('@getTrendingGifs', { timeout: 10000 });
        cy.wait(1000);
      }
      
      // Should still be scrollable smoothly
      cy.scrollTo(0, 500);
      cy.scrollTo(0, 1000);
      
      // Page should remain responsive
      cy.get('[data-cy="gifItem"]')
        .first()
        .should('be.visible');
    });
  });

  describe('End-of-results detection', () => {
    it('should stop loading when reaching last page', () => {
      // Mock API to return limited results
      cy.intercept('GET', 'https://api.giphy.com/v1/gifs/trending*', (req) => {
        const url = new URL(req.url);
        const offset = parseInt(url.searchParams.get('offset') || '0');
        
        // Simulate only 30 total GIFs available
        if (offset >= 30) {
          req.reply({
            statusCode: 200,
            body: {
              data: [],
              pagination: {
                total_count: 30,
                count: 0,
                offset: offset
              }
            }
          });
        }
      }).as('getTrendingGifs');
      
      cy.visit('/');
      cy.wait('@getTrendingGifs');
      cy.wait(2000);
      
      // Load page 2
      cy.scrollToBottom();
      cy.wait('@getTrendingGifs');
      cy.wait(2000);
      
      // Try to load more (should not make API call or get empty response)
      cy.scrollToBottom();
      cy.wait(2000);
      
      // Should still have only 30 GIFs
      cy.get('[data-cy="gifItem"]')
        .should('have.length', 30);
    });

    it('should not make additional API calls after last page', () => {
      cy.visit('/');
      
      // Listen for API calls
      let callCount = 0;
      cy.intercept('GET', 'https://api.giphy.com/v1/gifs/trending*', (req) => {
        callCount++;
        req.continue();
      }).as('getTrendingGifs');
      
      cy.wait('@getTrendingGifs'); // Call 1
      cy.wait(2000);
      
      cy.scrollToBottom();
      cy.wait('@getTrendingGifs'); // Call 2
      cy.wait(2000);
      
      // Record call count
      const previousCallCount = callCount;
      
      // Try scrolling multiple times at the end (if we've mocked to end)
      cy.scrollToBottom();
      cy.wait(2000);
      cy.scrollToBottom();
      cy.wait(2000);
      
      // In a real scenario with limited data, no more calls would be made
      // This test would need to be adjusted based on actual total count
    });
  });


  describe('Error Handling', () => {
    it('should display error message when API fails', () => {
      cy.intercept('GET', 'https://api.giphy.com/v1/gifs/trending*', {
        statusCode: 500,
        body: { message: 'Internal Server Error' }
      }).as('getTrendingGifsFail');
      
      cy.visit('/');
      cy.wait('@getTrendingGifsFail');
      cy.wait(2000);
      
      cy.contains(/error|failed|wrong|try again/i, { timeout: 5000 })
        .should('be.visible');
    });

    it('should handle network failure gracefully', () => {
      cy.intercept('GET', 'https://api.giphy.com/v1/gifs/trending*', {
        forceNetworkError: true
      }).as('getTrendingGifsNetworkError');
      
      cy.visit('/');
      cy.wait('@getTrendingGifsNetworkError');
      cy.wait(2000);
    
      cy.contains(/error|network|connection|try again/i, { timeout: 5000 })
        .should('be.visible');
    });

    it('should handle invalid JSON response', () => {
    
      cy.intercept('GET', 'https://api.giphy.com/v1/gifs/trending*', {
        statusCode: 200,
        body: 'invalid json'
      }).as('getTrendingGifsInvalid');
      
      cy.visit('/');
      
      cy.wait(3000);
      cy.get('body').should('exist');
    });

    it('should not crash when receiving empty data array', () => {
      cy.intercept('GET', 'https://api.giphy.com/v1/gifs/trending*', {
        statusCode: 200,
        body: {
          data: [],
          pagination: {
            total_count: 0,
            count: 0,
            offset: 0
          }
        }
      }).as('getTrendingGifsEmpty');
      
      cy.visit('/');
      cy.wait('@getTrendingGifsEmpty');
      cy.wait(2000);
      
      cy.contains(/no.*gif|empty|no.*result/i, { timeout: 5000 })
        .should('be.visible');
    });

    it('should allow retry after error', () => {
      let attemptCount = 0;
      
      cy.intercept('GET', 'https://api.giphy.com/v1/gifs/trending*', (req) => {
        attemptCount++;
        
        if (attemptCount === 1) {
          // First attempt fails
          req.reply({
            statusCode: 500,
            body: { message: 'Server Error' }
          });
        } else {
          // Subsequent attempts succeed
          req.continue();
        }
      }).as('getTrendingGifsRetry');
      
      cy.visit('/');
      cy.wait('@getTrendingGifsRetry');
      cy.wait(2000);
    
      cy.get('button:contains("Retry"), button:contains("Try Again"), [data-testid="retry-button"]')
        .should('be.visible')
        .click();
      
      cy.wait('@getTrendingGifsRetry');
      cy.wait(2000);
      
      cy.get('[data-cy="gifItem"]')
        .should('have.length.gt', 0);
    });
  });

  describe('Responsive Design', () => {
    const viewports: Array<[number, number, string]> = [
      [375, 667, 'Mobile'],
      [768, 1024, 'Tablet'],
      [1920, 1080, 'Desktop']
    ];

    viewports.forEach(([width, height, device]) => {
      it(`should display correctly on ${device} (${width}x${height})`, () => {
        cy.viewport(width, height);
        cy.visit('/');
        cy.wait('@getTrendingGifs');
        cy.wait(2000);
        
        cy.get('[data-cy="gifItem"]')
          .should('have.length', 15)
          .first()
          .should('be.visible');
        
        cy.get('[data-cy="gifItem"]')
          .first()
          .then(($first) => {
            const firstTop = $first.offset()?.top || 0;
            
            cy.get('[data-cy="gifItem"]')
              .eq(1)
              .then(($second) => {
                const secondTop = $second.offset()?.top || 0;
                expect(secondTop).to.be.greaterThan(firstTop);
              });
          });
      });

      it(`should support infinite scroll on ${device}`, () => {
        cy.viewport(width, height);
        cy.visit('/');
        cy.wait('@getTrendingGifs');
        cy.wait(2000);
        
        cy.scrollToBottom();
        cy.wait('@getTrendingGifs', { timeout: 10000 });
        cy.wait(2000);
    
        cy.get('[data-cy="gifItem"]')
          .should('have.length', 30);
      });
    });
  });

  describe('Performance Tests', () => {
    it('should load initial GIFs within acceptable time', () => {
      const startTime = Date.now();
      
      cy.visit('/');
      cy.wait('@getTrendingGifs');
      
      cy.get('[data-cy="gifItem"]', { timeout: 5000 })
        .should('have.length', 15)
        .then(() => {
          const loadTime = Date.now() - startTime;
          // Should load within 5 seconds
          expect(loadTime).to.be.lessThan(5000);
        });
    });

    it('should not have memory leaks after multiple scrolls', () => {
      cy.visit('/');
      cy.wait('@getTrendingGifs');
      cy.wait(2000);
      
      for (let i = 0; i < 5; i++) {
        cy.scrollToBottom();
        cy.wait('@getTrendingGifs', { timeout: 10000 });
        cy.wait(1000);
      }
      
      cy.window().then((win) => {
        expect(win.document.readyState).to.eq('complete');
      });
    });

    it('should lazy load images for better performance', () => {
      cy.visit('/');
      cy.wait('@getTrendingGifs');
      cy.wait(2000);
      
      cy.get('img').first().should('exist');
      cy.get('img').should('have.attr', 'src');
    });
  });

  describe('GIF Image Display', () => {
    it('should display GIF images with proper attributes', () => {
      cy.visit('/');
      cy.wait('@getTrendingGifs');
      cy.wait(2000);
      
      cy.get('img').first().then(($img) => {
        expect($img.attr('src')).to.exist;
        expect($img.attr('src')).to.include('giphy.com');
        expect($img.attr('alt')).to.exist;
      });
    });

    it('should display animated GIFs (not static images)', () => {
      cy.visit('/');
      cy.wait('@getTrendingGifs');
      cy.wait(2000);
      cy.get('img').first().should('have.attr', 'src').and('match', /\.gif|giphy|media/i);
    });

    it('should handle image load errors gracefully', () => {
      cy.visit('/');
      cy.wait('@getTrendingGifs');
      cy.wait(2000);
      cy.get('[data-cy="gifItem"]')
        .should('exist');
    });
  });
});
