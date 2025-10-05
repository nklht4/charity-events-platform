// 首页功能
class HomePage {
    constructor() {
        this.eventsContainer = document.getElementById('events-container');
        this.loadingElement = document.getElementById('events-loading');
        this.errorElement = document.getElementById('events-error');
        this.init();
    }

    async init() {
        await this.loadEvents();
        this.animateStats();
    }

    async loadEvents() {
        try {
            app.showLoading(this.loadingElement);
            this.errorElement.style.display = 'none';

            const response = await fetch(`${app.API_BASE}/events`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const events = await response.json();
            
            this.displayEvents(events);
            this.loadingElement.style.display = 'none';

        } catch (error) {
            console.error('Error loading events:', error);
            this.loadingElement.style.display = 'none';
            this.errorElement.style.display = 'block';
            app.showError(this.errorElement, 'Unable to load events. Please try again later.');
        }
    }

    displayEvents(events) {
        if (!events || events.length === 0) {
            this.eventsContainer.innerHTML = `
                <div class="no-events">
                    <div class="no-events-icon">📅</div>
                    <h3>No Upcoming Events</h3>
                    <p>Check back later for new charity events.</p>
                </div>
            `;
            return;
        }

        this.eventsContainer.innerHTML = events.map(event => this.createEventCard(event)).join('');
        
        // 添加事件监听器
        this.attachEventListeners();
    }

    createEventCard(event) {
        const progress = app.calculateProgress(event.CurrentAttendees, event.GoalAttendees);
        const priceDisplay = app.formatPrice(event.TicketPrice);
        const dateFormatted = app.formatDate(event.EventDate);

        return `
            <div class="event-card" data-event-id="${event.EventID}">
                <div class="event-image">
                    <div class="event-category">${event.CategoryName}</div>
                    ${event.EventImage ? 
                        `<img src="${event.EventImage}" alt="${event.EventName}" onerror="this.style.display='none'">` : 
                        '📅'
                    }
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
                    <button class="view-details-btn" onclick="homePage.viewEventDetails(${event.EventID})">
                        View Details & Register
                    </button>
                </div>
            </div>
        `;
    }

    viewEventDetails(eventId) {
        window.location.href = `event-details.html?id=${eventId}`;
    }

    attachEventListeners() {
        // 添加卡片点击事件
        document.querySelectorAll('.event-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('view-details-btn')) {
                    const eventId = card.dataset.eventId;
                    this.viewEventDetails(eventId);
                }
            });
        });
    }

    animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateNumber(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        statNumbers.forEach(stat => observer.observe(stat));
    }

    animateNumber(element) {
        const target = parseInt(element.dataset.count);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    }
}

// 初始化首页
const homePage = new HomePage();