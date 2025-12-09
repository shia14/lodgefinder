// Main functionality for Lodge Finder
document.addEventListener('DOMContentLoaded', function () {
    // 1. Initialize Data (Shared with Admin)
    initializeData();

    const searchButton = document.querySelector('.search-button');
    if (searchButton) {
        searchButton.addEventListener('click', function () {
            window.location.href = 'search.html';
        });
    }

    // Identify current page
    const path = window.location.pathname;
    const isDetailsPage = path.includes('lodge-details.html');

    // Geolocation for both pages (for Currency and "Lodges Near You")
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => handleLocationSuccess(position, isDetailsPage),
            (error) => handleError(error, isDetailsPage)
        );
    } else {
        // Fallback
        if (!isDetailsPage) {
            // Load "Featured" which effectively acts as default
            const allLodges = getLodges();
            // Just show first 3 as featured/defaults if we don't have location
            renderLodges(allLodges.slice(0, 3), "Featured Destinations");
        } else {
            // Default currency
            updatePrices('USD', 1, '$');
        }
    }

    // Specific logic for Lodge Details Page
    if (isDetailsPage) {
        populateLodgeDetails();
    }
});

// --- Data Layer ---
function initializeData() {
    if (!localStorage.getItem('lodges')) {
        const initialLodges = [
            {
                id: 1,
                name: "Alpine Sanctuary",
                location: "Swiss Alps",
                price: 450,
                image: "images/background.png",
                description: "Experience the pinnacle of luxury...",
                amenities: ["Private Spa", "Gourmet Dining"],
                email: "info@alpine.com",
                phone: "+41 123 456"
            },
            {
                id: 2,
                name: "Oceanfront Villa",
                location: "Maldives",
                price: 850,
                image: "images/background.png",
                description: "Stunning overwater villa...",
                amenities: ["Infinity Pool", "Butler Service"],
                email: "info@ocean.com",
                phone: "+960 123 456"
            }
        ];
        // We do strictly simpler initialization if missing, to avoid overwriting complex logic if any
        localStorage.setItem('lodges', JSON.stringify(initialLodges));
    }
}

function getLodges() {
    return JSON.parse(localStorage.getItem('lodges') || '[]');
}

// --- Location & Logic ---

function handleLocationSuccess(position, isDetailsPage) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    console.log(`User location: ${lat}, ${lon}`);

    // Update currency based on location for ALL pages
    determineCurrency(lat, lon);

    // Only render "Lodges Near You" on the main page
    if (!isDetailsPage) {
        showLodgesNearYou(lat, lon);
    }
}

function handleError(error, isDetailsPage) {
    console.log("Geolocation error:", error);
    if (!isDetailsPage) {
        const allLodges = getLodges();
        // Fallback to first 3
        renderLodges(allLodges.slice(0, 3), "Featured Destinations");
    }
    updatePrices('USD', 1, '$');
}

function showLodgesNearYou(lat, lon) {
    const allLodges = getLodges();
    const nearbyLodges = [...allLodges].reverse().slice(0, 3);
    renderLodges(nearbyLodges, "Lodges Near You");
}

function renderLodges(lodges, titleOverride = "Lodges Near You") {
    const container = document.querySelector('.featured-section');
    if (!container) return;

    const header = container.querySelector('.section-header h2');
    if (header) header.textContent = titleOverride;

    const grid = container.querySelector('.featured-grid');
    if (!grid) return;

    grid.innerHTML = '';

    lodges.forEach(lodge => {
        const card = document.createElement('div');
        card.className = 'featured-item';

        // Pass only ID for cleaner URL
        const queryParams = new URLSearchParams({ id: lodge.id }).toString();

        card.innerHTML = `
            <div class="featured-image-placeholder" style="background-image: url('${lodge.image}'); background-size: cover; background-position: center;"></div>
            <div class="featured-info" style="padding: 1rem;">
                <h3>${lodge.name}</h3>
                <p style="color: #666; font-size: 0.9rem;">${lodge.location}</p>
                <p class="price-display" data-usd="${lodge.price}" style="color: var(--accent-color); font-weight: bold; margin-top: 0.5rem;">
                    $${lodge.price} / night
                </p>
            </div>
        `;

        card.addEventListener('click', () => {
            window.location.href = `lodge-details.html?${queryParams}`;
        });

        grid.appendChild(card);
    });
}

function populateLodgeDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    // Retrieve full data store
    const lodges = getLodges();

    // Find lodge by ID
    let lodge = lodges.find(l => l.id == id);

    // Fallback for legacy links or if ID missing
    if (!lodge) {
        lodge = {
            name: params.get('name'),
            location: params.get('location'),
            price: params.get('price'),
            image: params.get('image'),
            description: "Details not available. Please visit the admin panel to update this lodge.",
            amenities: ["Standard Amenities"],
            email: "info@lodgefinder.com",
            phone: "+1 000 000 0000"
        };
    }

    if (lodge && lodge.name) {
        document.title = `${lodge.name} - Lodge Finder`;

        // Hero
        document.querySelector('.hero-title').textContent = lodge.name;
        document.querySelector('.hero-subtitle').textContent = lodge.location;
        const heroBg = document.querySelector('.background-image');
        if (heroBg && lodge.image) {
            heroBg.style.backgroundImage = `url('${lodge.image}')`;
        }

        // Description
        const aboutHeader = document.querySelector('.details-main h2');
        if (aboutHeader) aboutHeader.textContent = `About ${lodge.name}`;

        const descParagraph = document.querySelector('.details-main p');
        if (descParagraph) descParagraph.textContent = lodge.description || "Experience the pinnacle of luxury.";

        // Amenities
        const amenitiesList = document.querySelector('.amenities-list');
        if (amenitiesList) {
            if (lodge.amenities && lodge.amenities.length > 0) {
                amenitiesList.innerHTML = lodge.amenities.map(item => `<li>${item}</li>`).join('');
            } else {
                amenitiesList.innerHTML = '<li>Private Spa</li><li>Gourmet Dining</li>';
            }
        }

        // Price
        const priceEl = document.querySelector('.booking-card .price');
        if (priceEl && lodge.price) {
            priceEl.classList.add('price-display');
            priceEl.setAttribute('data-usd', lodge.price);
            priceEl.innerHTML = `$${lodge.price} <span class="per-night">/ night</span>`;
        }

        // Contact
        const contactDiv = document.querySelector('.contact-info');
        if (contactDiv) {
            contactDiv.innerHTML = `
                <h4>Contact Us</h4>
                <p>Email: ${lodge.email || 'info@lodge.com'}</p>
                <p>Phone: ${lodge.phone || '+1 234 567 890'}</p>
            `;
        }
    }
}

function determineCurrency(lat, lon) {
    let currency = 'USD';
    let rate = 1;
    let symbol = '$';

    if (lat > 48) {
        currency = 'EUR';
        rate = 0.92;
        symbol = '€';
    } else if (lon > -5 && lon < 2) {
        currency = 'GBP';
        rate = 0.79;
        symbol = '£';
    }

    updatePrices(currency, rate, symbol);
}

function updatePrices(currency, rate, symbol) {
    const priceElements = document.querySelectorAll('.price-display');
    priceElements.forEach(el => {
        const usdPrice = el.getAttribute('data-usd');
        if (usdPrice) {
            const converted = Math.round(usdPrice * rate);
            if (el.querySelector('.per-night')) {
                el.innerHTML = `${symbol}${converted} <span class="per-night">/ night</span>`;
            } else {
                el.textContent = `${symbol}${converted} / night`;
            }
        }
    });
}
