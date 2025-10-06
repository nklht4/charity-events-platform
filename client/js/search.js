// Search page functionality
class SearchPage {
    constructor() {
        this.categories = [];
        this.currentFilters = {
            category: 'all',
            date: 'all',
            specificDate: '',
            location: '',
            sort: 'date'
        };
        
        this.init();
    }

    async init() {
        await this.loadCategories();
        this.setupEventListeners();
        await this.performSearch();
    }

    async loadCategories() {
        try {
            const response = await fetch(`${app.API_BASE}/categories`);
            this.categories = await response.json();
            this.displayCategories();
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    displayCategories() {
        const container = document.getElementById('categories-container');
        const categoriesHtml = this.categories.map(category => `
            <label class="filter-option">
                <input type="radio" name="category" value="${category.CategoryName}">
                <span class="checkmark"></span>
                ${category.CategoryName}
            </label>
        `).join('');

        container.innerHTML = `
            <label class="filter-option">
                <input type="radio" name="category" value="all" checked>
                <span class="checkmark"></span>
                All Categories
            </label>
            ${categoriesHtml}
        `;
    }

    setupEventListeners() {
        // Category selection
        document.querySelectorAll('input[name="category"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentFilters.category = e.target.value;
            });
        });

        // Date selection
        document.querySelectorAll('input[name="date"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentFilters.date = e.target.value;
                const specificDateInput = document.getElementById('specific-date');
                specificDateInput.style.display = e.target.value === 'specific' ? 'block' : 'none';
            });
        });

        // Specific date input
        document.getElementById('specific-date').addEventListener('change', (e) => {
            this.currentFilters.specificDate = e.target.value;
        });

        // Location input
        document.getElementById('location-input').addEventListener('input', (e) => {
            this.currentFilters.location = e.target.value;
        });

        // Sort selection
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.currentFilters.sort = e.target.value;
            this.performSearch();
        });

        // Apply filters button
        document.getElementById('apply-filters').addEventListener('click', () => {
            this.performSearch();
        });

        // Clear filters button
        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Reset search button
        document.getElementById('reset-search').addEventListener('click', () => {
            this.clearFilters();
        });
    }

    async performSearch() {
        const resultsContainer = document.getElementById('search-results-container');
        const loadingElement = document.getElementById('search-loading');
        const errorElement = document.getElementById('search-error');
        const noResultsElement = document.getElementById('no-results');
        const resultsCountElement = document.getElementById('results-count');

        try {
            app.showLoading(loadingElement);
            errorElement.style.display = 'none';
            noResultsElement.style.display = 'none';

            // Build query parameters
            const params = new URLSearchParams();
            
            if (this.currentFilters.category && this.currentFilters.category !== 'all') {
                params.append('category', this.currentFilters.category);
            }
            
            if (this.currentFilters.location) {
                params.append('location', this.currentFilters.location);
            }
            
            if (this.currentFilters.date === 'specific' && this.currentFilters.specificDate) {
                params.append('date', this.currentFilters.specificDate);
            }

            const response = await fetch(`${app.API_BASE}/events/search?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            let events = await response.json();

            // Apply sorting
            events = this.sortEvents(events, this.currentFilters.sort);

            // Display results
            this.displaySearchResults(events);
            
            // Update results count
            resultsCountElement.textContent = `${events.length} events found`;
            
            loadingElement.style.display = 'none';

            // Show no results message
            if (events.length === 0) {
                noResultsElement.style.display = 'block';
            }

        } catch (error) {
            console.error('Search error:', error);
            loadingElement.style.display = 'none';
            errorElement.style.display = 'block';
        }
    }

    sortEvents(events, sortBy) {
        switch (sortBy) {
            case 'name':
                return events.sort((a, b) => a.EventName.localeCompare(b.EventName));
            case 'price':
                return events.sort((a, b) => parseFloat(a.TicketPrice) - parseFloat(b.TicketPrice));
            case 'date':
            default:
                return events.sort((a, b) => new Date(a.EventDate) - new Date(b.EventDate));
        }
    }

    displaySearchResults(events) {
        const container = document.getElementById('search-results-container');
        
        if (events.length === 0) {
            container.innerHTML = '';
            return;
        }

        const eventsHtml = events.map(event => this.createEventCard(event)).join('');
        container.innerHTML = eventsHtml;
        
        this.attachResultEventListeners();
    }

    createEventCard(event) {
        const progress = app.calculateProgress(event.CurrentAttendees, event.GoalAttendees);
        const priceDisplay = app.formatPrice(event.TicketPrice);
        const dateFormatted = app.formatDate(event.EventDate);
        
        // 处理图片路径
        const eventImage = event.EventImage || this.getDefaultImageByCategory(event.CategoryName);

        return `
            <div class="event-card" data-event-id="${event.EventID}">
                <div class="event-image">
                    <div class="event-category">${event.CategoryName}</div>
                    <img src="${eventImage}" alt="${event.EventName}" 
                         onerror="this.src='images/1.jpg'">
                </div>
                <div class="event-content">
                    <div class="event-header">
                        <h3 class="event-title">${event.EventName}</h3>
                        <div class="event-price">${priceDisplay}</div>
                    </div>
                    <div class="event-meta">
                        <div class="event-meta-item">
                            <span>📅</span>
                            <span>${dateFormatted}</span>
                        </div>
                        <div class="event-meta-item">
                            <span>📍</span>
                            <span>${event.Location}</span>
                        </div>
                    </div>
                    <p class="event-description">${event.Description}</p>
                    <div class="event-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">
                            <span>${event.CurrentAttendees} registered</span>
                            <span>Goal: ${event.GoalAttendees}</span>
                        </div>
                    </div>
                    <button class="view-details-btn" onclick="searchPage.viewEventDetails(${event.EventID})">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }

    // 根据分类获取默认图片
    getDefaultImageByCategory(categoryName) {
    const defaultImages = {
            'Sports Tournament': 'images/1.jpg',
            'Workshop': 'images/2.jpeg',
            'Fun Run': 'images/3.webp',
            'Gala Dinner': 'images/4.webp',
            'Silent Auction': 'images/5.webp',
            'Food Festival': 'images/6.webp',
            'Art Exhibition': 'images/7.webp',
            'Concert': 'images/8.webp'
        };
    
        return defaultImages[categoryName] || 'images/1.jpg';
    }

    viewEventDetails(eventId) {
        window.location.href = `event-details.html?id=${eventId}`;
    }

    attachResultEventListeners() {
        document.querySelectorAll('.event-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('view-details-btn')) {
                    const eventId = card.dataset.eventId;
                    this.viewEventDetails(eventId);
                }
            });
        });
    }

    clearFilters() {
        // Reset form
        document.querySelector('input[name="category"][value="all"]').checked = true;
        document.querySelector('input[name="date"][value="all"]').checked = true;
        document.getElementById('specific-date').style.display = 'none';
        document.getElementById('specific-date').value = '';
        document.getElementById('location-input').value = '';
        document.getElementById('sort-select').value = 'date';

        // Reset filter state
        this.currentFilters = {
            category: 'all',
            date: 'all',
            specificDate: '',
            location: '',
            sort: 'date'
        };

        // Perform new search
        this.performSearch();
    }
}

// Initialize search page
const searchPage = new SearchPage();