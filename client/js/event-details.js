// Details page functionality
class EventDetailsPage {
    constructor() {
        this.eventId = this.getEventIdFromUrl();
        this.eventData = null;
        this.init();
    }

    getEventIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async init() {
        if (!this.eventId) {
            this.showError('No event ID provided.');
            return;
        }

        await this.loadEventDetails();
        this.setupEventListeners();
    }

    async loadEventDetails() {
        const loadingElement = document.getElementById('event-loading');
        const errorElement = document.getElementById('event-error');
        const contentElement = document.getElementById('event-content');

        try {
            app.showLoading(loadingElement);
            errorElement.style.display = 'none';

            const response = await fetch(`${app.API_BASE}/events/${this.eventId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.eventData = await response.json();
            
            this.displayEventDetails();
            loadingElement.style.display = 'none';
            contentElement.style.display = 'block';

        } catch (error) {
            console.error('Error loading event details:', error);
            loadingElement.style.display = 'none';
            errorElement.style.display = 'block';
            this.showError('Unable to load event details. Please try again later.');
        }
    }

    displayEventDetails() {
        if (!this.eventData) return;

        // Set the page title
        app.setPageTitle(this.eventData.EventName);


        this.updateEventImage();
        
        // Update the header information of the event
        this.updateEventHeader();
        
        // Update event details
        this.updateEventDetails();
        
        // Update progress information
        this.updateProgressInfo();
        
        // Update on urgent information
        this.updateQuickInfo();
        
        // Update the content of the modal box
        this.updateModalContent();
    }


    updateEventImage() {
        const eventImageElement = document.getElementById('event-image');
        
        if (!eventImageElement) {
            console.warn('Event image element not found');
            return;
        }

        if (this.eventData.EventImage) {

            eventImageElement.innerHTML = `
                <img src="${this.eventData.EventImage}" alt="${this.eventData.EventName}" 
                     class="event-main-img"
                     onerror="this.src='images/1.jpg'"
                     style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">
            `;
        } else {

            const defaultImage = this.getDefaultImageByCategory(this.eventData.CategoryName);
            eventImageElement.innerHTML = `
                <img src="${defaultImage}" alt="${this.eventData.EventName}" 
                     class="event-main-img"
                     style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">
            `;
        }
    }

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

    updateEventHeader() {
        document.getElementById('event-category').textContent = this.eventData.CategoryName;
        document.getElementById('event-category-text').textContent = this.eventData.CategoryName;
        document.getElementById('event-title').textContent = this.eventData.EventName;
        document.getElementById('event-location').textContent = this.eventData.Location;
        
        const dateFormatted = app.formatDate(this.eventData.EventDate);
        document.getElementById('event-date').textContent = dateFormatted;
        
        const priceDisplay = app.formatPrice(this.eventData.TicketPrice);
        document.getElementById('event-price').innerHTML = priceDisplay;
    }

    updateEventDetails() {
        document.getElementById('event-description').textContent = this.eventData.Description;
        
        const dateFormatted = app.formatDate(this.eventData.EventDate);
        document.getElementById('detail-date').textContent = dateFormatted;
        document.getElementById('detail-location').textContent = this.eventData.Location;
        document.getElementById('detail-category').textContent = this.eventData.CategoryName;
        document.getElementById('detail-organizer').textContent = this.eventData.OrganizerName || 'HopeBridge Team';
    }

    updateProgressInfo() {
        const progress = app.calculateProgress(this.eventData.CurrentAttendees, this.eventData.GoalAttendees);
        
        document.getElementById('progress-current').textContent = this.eventData.CurrentAttendees.toLocaleString();
        document.getElementById('progress-goal').textContent = this.eventData.GoalAttendees.toLocaleString();
        document.getElementById('progress-percentage').textContent = `${progress}%`;
        
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }

    updateQuickInfo() {
        const priceDisplay = app.formatPrice(this.eventData.TicketPrice);
        document.getElementById('quick-price').innerHTML = priceDisplay;
        
        const availableSpots = this.eventData.GoalAttendees - this.eventData.CurrentAttendees;
        document.getElementById('quick-spots').textContent = `${availableSpots.toLocaleString()} spots left`;
    }

    updateModalContent() {
        document.getElementById('modal-event-title').textContent = this.eventData.EventName;
        
        const dateFormatted = app.formatDate(this.eventData.EventDate);
        document.getElementById('modal-event-date').textContent = dateFormatted;
        
        const priceDisplay = app.formatPrice(this.eventData.TicketPrice);
        document.getElementById('modal-event-price').innerHTML = priceDisplay;
    }

    setupEventListeners() {
        // Registration button click event
        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                this.showRegistrationModal();
            });
        }

        // Modal box close event
        const modalClose = document.getElementById('modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.hideRegistrationModal();
            });
        }

        const modalCancel = document.getElementById('modal-cancel');
        if (modalCancel) {
            modalCancel.addEventListener('click', () => {
                this.hideRegistrationModal();
            });
        }

        // Click outside the modal box to close it.
        const registerModal = document.getElementById('register-modal');
        if (registerModal) {
            registerModal.addEventListener('click', (e) => {
                if (e.target.id === 'register-modal') {
                    this.hideRegistrationModal();
                }
            });
        }

        // Share button click event
        const shareBtn = document.querySelector('.share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareEvent();
            });
        }
    }

    showRegistrationModal() {
        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    hideRegistrationModal() {
        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    shareEvent() {
        if (navigator.share) {
            navigator.share({
                title: this.eventData.EventName,
                text: this.eventData.Description,
                url: window.location.href,
            })
            .catch(error => console.log('Error sharing:', error));
        } else {
            // Alternative solution: Copy the link to the clipboard
            navigator.clipboard.writeText(window.location.href)
                .then(() => {
                    alert('Event link copied to clipboard!');
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                });
        }
    }

    showError(message) {
        const errorElement = document.getElementById('event-error');
        if (errorElement) {
            errorElement.style.display = 'block';
            const errorParagraph = errorElement.querySelector('p');
            if (errorParagraph) {
                errorParagraph.textContent = message;
            }
        }
    }
}

// Initialization Details Page
const eventDetailsPage = new EventDetailsPage();