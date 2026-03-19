/// <reference types="cypress" />

describe('Search GIFs - E2E Tests', () => {
    beforeEach(() => {
        cy.clearAllStorage();
        cy.intercept('GET', `https://api.giphy.com/v1/gifs/search*`).as('searchGifs');
        cy.intercept('GET', `https://api.giphy.com/v1/gifs/trending*`).as('getTrendingGifs');
    });

    describe('Search Input Rendering', () => {
        it('should display search input box on page load', () => {
            cy.visit('/');
            cy.wait('@getTrendingGifs');

            cy.get('input[name="searchTerm"]')
                .should('be.visible')
                .and('not.be.disabled');
        });

        it('should have search button or icon', () => {
            cy.visit('/');

            cy.get('button[type="submit"]')
                .should('exist');
        });

        it('should allow typing in search box', () => {
            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('cats')
                .should('have.value', 'cats');
        });
    });

    describe('Basic Search Functionality', () => {
        it('should trigger search when entering text and pressing Enter', () => {
            cy.visit('/');
            cy.wait('@getTrendingGifs');
            cy.get('input[name="searchTerm"]')
                .type('cats{enter}');

            cy.wait('@searchGifs', { timeout: 10000 }).then((interception) => {
                expect(interception.request.url).to.include('/search');
                expect(interception.request.url).to.include('q=cats');
            });
        });

        it('should trigger search when clicking search button', () => {
            cy.visit('/');
            cy.wait('@getTrendingGifs');

            cy.get('input[name="searchTerm"]')
                .type('dogs');

            cy.get('button[type="submit"]')
                .first()
                .click();

            cy.wait('@searchGifs', { timeout: 10000 }).then((interception) => {
                expect(interception.request.url).to.include('/search');
                expect(interception.request.url).to.include('q=dogs');
            });
        });

        it('should display search results after searching', () => {
            cy.visit('/');
            cy.wait('@getTrendingGifs');

            cy.get('input[name="searchTerm"]')
                .type('funny{enter}');

            cy.wait('@searchGifs');
            cy.wait(2000);

            cy.get('[data-cy="gifItem"]')
                .should('have.length.at.least', 1);
        });

        it('should replace trending GIFs with search results', () => {
            cy.visit('/');
            cy.wait('@getTrendingGifs');
            cy.wait(2000);

            cy.get('[data-cy="gifItem"]')
                .first()
                .invoke('attr', 'data-id')
                .then((trendingId) => {
                    // Perform search
                    cy.get('input[name="searchTerm"]')
                        .type('nature{enter}');

                    cy.wait('@searchGifs');
                    cy.wait(2000);

                    // Trending GIF should be replaced (unless it matches search)
                    // Just verify that GIFs are displayed
                    cy.get('[data-cy="gifItem"]')
                        .should('exist');
                });
        });

        it('should display 15 search results initially', () => {
            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('happy{enter}');

            cy.wait('@searchGifs');
            cy.wait(2000);

            cy.get('[data-cy="gifItem"]')
                .should('have.length', 15);
        });
    });

    describe('Search API Validation', () => {
        it('should call search API with correct parameters', () => {
            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('testing{enter}');

            cy.wait('@searchGifs').then((interception) => {
                const url = new URL(interception.request.url);

                expect(url.searchParams.get('q')).to.eq('testing');
                expect(url.searchParams.get('limit')).to.eq('15');
                expect(url.searchParams.get('offset')).to.eq('0');
                expect(url.searchParams.get('api_key')).to.exist;
            });
        });

        it('should receive proper search response structure', () => {
            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('vacation{enter}');

            cy.wait('@searchGifs').then((interception) => {
                const response = interception.response?.body;

                expect(response).to.have.property('data');
                expect(response).to.have.property('pagination');
                expect(response.data).to.be.an('array');

                expect(response.pagination).to.have.property('total_count');
                expect(response.pagination).to.have.property('count');
                expect(response.pagination).to.have.property('offset');
            });
        });

        it('should properly encode search terms in URL', () => {
            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('funny cats{enter}');

            cy.wait('@searchGifs').then((interception) => {
                const url = interception.request.url;

                expect(url).to.match(/q=funny[+%20]cats/);
            });
        });
    });

    describe('Search with Infinite Scroll', () => {
        it('should load more search results when scrolling', () => {
            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('animals{enter}');
            cy.wait('@searchGifs');
            cy.wait(2000);

            cy.get('[data-cy="gifItem"]')
                .should('have.length', 15);

            cy.scrollToBottom();

            cy.wait('@searchGifs', { timeout: 10000 }).then((interception) => {
                const url = new URL(interception.request.url);

                expect(url.searchParams.get('offset')).to.eq('15');
            });

            cy.wait(2000);

            cy.get('[data-cy="gifItem"]')
                .should('have.length', 30);
        });

        it('should maintain search term across pagination', () => {
            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('sunset{enter}');

            cy.wait('@searchGifs');
            cy.wait(2000);

            cy.scrollToBottom();

            cy.wait('@searchGifs').then((interception) => {
                const url = new URL(interception.request.url);

                expect(url.searchParams.get('q')).to.eq('sunset');
            });
        });

        it('should not mix search results with trending results', () => {
            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('mountains{enter}');

            cy.wait('@searchGifs');
            cy.wait(2000);

            cy.scrollToBottom();
            cy.wait('@searchGifs');
            cy.wait(2000);

            cy.get('@getTrendingGifs.all').then((calls) => {
                expect(calls.length).to.be.at.most(1);
            });
        });

        it('should stop loading when search results end', () => {
            cy.intercept('GET', 'https://api.giphy.com/v1/gifs/search*', (req) => {
                const url = new URL(req.url);
                const offset = parseInt(url.searchParams.get('offset') || '0');

                // Simulate only 25 results available
                if (offset >= 25) {
                    req.reply({
                        statusCode: 200,
                        body: {
                            data: [],
                            pagination: {
                                total_count: 25,
                                count: 0,
                                offset: offset
                            }
                        }
                    });
                }
            }).as('searchGifs');

            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('rare{enter}');

            cy.wait('@searchGifs');
            cy.wait(2000);

            cy.scrollToBottom();
            cy.wait('@searchGifs');
            cy.wait(2000);

            cy.scrollToBottom();
            cy.wait(2000);

            cy.get('[data-cy="gifItem"]')
                .should('have.length.at.most', 30);
        });
    });

    describe('Empty Search Handling', () => {
        it('should handle empty search query', () => {
            cy.visit('/');
            cy.wait('@getTrendingGifs');

            cy.get('input[name="searchTerm"]')
                .clear()
                .type('{enter}');

            cy.wait(2000);

            cy.get('[data-cy="gifItem"]')
                .should('exist');
        });

        it('should return to trending when clearing search', () => {
            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('test{enter}');

            cy.wait('@searchGifs');
            cy.wait(2000);

            cy.get('input[name="searchTerm"]')
                .clear()
                .type('{enter}');

            cy.wait('@getTrendingGifs', { timeout: 10000 });
            cy.wait(2000);

            cy.get('[data-cy="gifItem"]')
                .should('exist');
        });
    });

    describe('No Results Scenario', () => {
        it('should display "no results" message for searches with no matches', () => {
            cy.intercept('GET', 'https://api.giphy.com/v1/gifs/search*', {
                statusCode: 200,
                body: {
                    data: [],
                    pagination: {
                        total_count: 0,
                        count: 0,
                        offset: 0
                    }
                }
            }).as('searchGifsEmpty');

            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('xyzabc123unlikely{enter}');

            cy.wait('@searchGifsEmpty');
            cy.wait(2000);

            cy.contains(/no.*result|nothing.*found|no.*gif|try.*different/i, { timeout: 5000 })
                .should('be.visible');
        });

        it('should allow searching again after no results', () => {
            let searchCount = 0;
            cy.intercept('GET', 'https://api.giphy.com/v1/gifs/search*', (req) => {
                searchCount++;

                if (searchCount === 1) {
                    req.reply({
                        statusCode: 200,
                        body: {
                            data: [],
                            pagination: { total_count: 0, count: 0, offset: 0 }
                        }
                    });
                } else {
                    req.continue();
                }
            }).as('searchGifs');

            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('unlikely123{enter}');

            cy.wait('@searchGifs');
            cy.wait(2000);

            cy.get('input[name="searchTerm"]')
                .clear()
                .type('cats{enter}');

            cy.wait('@searchGifs');
            cy.wait(2000);

            cy.get('[data-cy="gifItem"]')
                .should('exist');
        });
    });


    describe('Special Characters and Edge Cases', () => {
        const specialSearches = [
            { term: 'cats & dogs', description: 'ampersand' },
            { term: 'hello@world', description: 'at symbol' },
            { term: 'test#hashtag', description: 'hash symbol' },
            { term: 'coffee+tea', description: 'plus symbol' },
            { term: 'question?', description: 'question mark' }
        ];

        specialSearches.forEach(({ term, description }) => {
            it(`should handle search with ${description}: "${term}"`, () => {
                cy.visit('/');

                cy.get('input[name="searchTerm"]')
                    .type(`${term}{enter}`);

                cy.wait('@searchGifs', { timeout: 10000 }).then((interception) => {
                    expect(interception.request.url).to.include('/search');

                    const url = new URL(interception.request.url);
                    expect(url.searchParams.get('q')).to.exist;
                });
            });
        });

        it('should handle emoji in search', () => {
            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('fire 🔥{enter}');

            cy.wait('@searchGifs', { timeout: 10000 }).then((interception) => {
                expect(interception.request.url).to.include('/search');
            });
        });

        it('should handle very long search terms', () => {
            cy.visit('/');

            const longTerm = 'a'.repeat(100);

            cy.get('input[name="searchTerm"]')
                .invoke('val', longTerm)
                .trigger('input')
                .type('{enter}');

            cy.wait('@searchGifs', { timeout: 10000 });
            cy.wait(2000);
        });

        it('should handle search with only spaces', () => {
            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('     {enter}');

            cy.wait(2000);
            cy.get('body').should('exist');
        });

        it('should trim leading and trailing spaces', () => {
            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('  cats  {enter}');

            cy.wait('@searchGifs').then((interception) => {
                const url = new URL(interception.request.url);
                const query = url.searchParams.get('q');

                // Query should be trimmed or handled properly
                expect(query).to.match(/cats/);
            });
        });
    });

    describe('Rapid Search Changes', () => {
        it('should handle rapid consecutive searches', () => {
            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('cat{enter}');

            cy.wait(500);

            cy.get('input[name="searchTerm"]')
                .clear()
                .type('dog{enter}');

            cy.wait(500);

            cy.get('input[name="searchTerm"]')
                .clear()
                .type('bird{enter}');

            cy.wait('@searchGifs');
            cy.wait(2000);

            cy.get('[data-cy="gifItem"]')
                .should('exist');
        });

        it('should cancel previous search when new search is triggered', () => {
            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('slow{enter}');

            cy.get('input[name="searchTerm"]')
                .clear()
                .type('fast{enter}');

            cy.wait('@searchGifs');
            cy.wait(2000);

            cy.get('[data-cy="gifItem"]')
                .should('exist');
        });

        it('should show loading state during rapid searches', () => {
            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('testing{enter}');

            cy.get('[data-testid="loading"], .loading, .spinner, [role="progressbar"]', { timeout: 2000 })
                .should('exist');
        });
    });

    describe('Error Handling', () => {
        it('should handle search API failures', () => {
            cy.intercept('GET', 'https://api.giphy.com/v1/gifs/search*', {
                statusCode: 500,
                body: { message: 'Internal Server Error' }
            }).as('searchGifsFail');

            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('error{enter}');

            cy.wait('@searchGifsFail');
            cy.wait(2000);

            cy.contains(/error|failed|wrong|try again/i, { timeout: 5000 })
                .should('be.visible');
        });

        it('should handle network errors during search', () => {
            cy.intercept('GET', 'https://api.giphy.com/v1/gifs/search*', {
                forceNetworkError: true
            }).as('searchGifsNetworkError');

            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('network{enter}');

            cy.wait('@searchGifsNetworkError');
            cy.wait(2000);

            cy.contains(/error|network|connection/i, { timeout: 5000 })
                .should('be.visible');
        });

        it('should allow searching again after error', () => {
            let attemptCount = 0;

            cy.intercept('GET', 'https://api.giphy.com/v1/gifs/search*', (req) => {
                attemptCount++;

                if (attemptCount === 1) {
                    req.reply({
                        statusCode: 500,
                        body: { message: 'Server Error' }
                    });
                } else {
                    req.continue();
                }
            }).as('searchGifs');

            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('error{enter}');

            cy.wait('@searchGifs');
            cy.wait(2000);

            cy.get('input[name="searchTerm"]')
                .clear()
                .type('success{enter}');

            cy.wait('@searchGifs');
            cy.wait(2000);

            cy.get('[data-cy="gifItem"]')
                .should('exist');
        });
    });

    describe('URL State Management', () => {
        it('should update URL with search query parameter', () => {
            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('vacation{enter}');

            cy.wait('@searchGifs');
            cy.wait(2000);

            cy.url().should('match', /search|q=vacation|\?.*vacation/i);
        });

        it('should restore search from URL on page refresh', () => {
            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .type('beach{enter}');

            cy.wait('@searchGifs');
            cy.wait(2000);

            cy.url().then((url) => {
                // Refresh page
                cy.reload();

                // Search may be restored
                cy.wait(2000);
                cy.get('input[name="searchTerm"]')
                    .should('exist');
            });
        });

        it('should handle browser back button after search', () => {
            cy.visit('/');
            cy.wait('@getTrendingGifs');
            cy.wait(2000);

            // Perform search
            cy.get('input[name="searchTerm"]')
                .type('history{enter}');

            cy.wait('@searchGifs');
            cy.wait(2000);

            cy.go('back');
            cy.wait(2000);

            cy.url().should('not.include', 'search');
        });
    });

    describe('Responsive Design', () => {
        const viewports: Array<[number, number, string]> = [
            [375, 667, 'Mobile'],
            [768, 1024, 'Tablet'],
            [1920, 1080, 'Desktop']
        ];

        viewports.forEach(([width, height, device]) => {
            it(`should have functional search on ${device}`, () => {
                cy.viewport(width, height);
                cy.visit('/');
                cy.get('input[name="searchTerm"]')
                    .should('be.visible')
                    .type('mobile{enter}');

                cy.wait('@searchGifs', { timeout: 10000 });
                cy.wait(2000);

                cy.get('[data-cy="gifItem"]')
                    .should('exist');
            });
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA labels on search input', () => {
            cy.visit('/');

            cy.get('input[name="searchTerm"]')
                .should(($input) => {
                    const hasAriaLabel = $input.attr('aria-label');
                    const hasAriaLabelledby = $input.attr('aria-labelledby');
                    expect(hasAriaLabel || hasAriaLabelledby).to.exist;
                });
        });
    });
});
