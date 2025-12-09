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
    // Always render defaults first to prevent empty page
    if (!isDetailsPage) {
        const allLodges = getLodges();
        // Just show first 3 as featured/defaults initially
        renderLodges(allLodges.slice(0, 3), "Featured Destinations");
    } else {
        // Default currency
        updatePrices('USD', 1, '$');
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => handleLocationSuccess(position, isDetailsPage),
            (error) => handleError(error, isDetailsPage)
        );
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
                gallery: [],
                safety: 5,
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
                gallery: [],
                safety: 4.8,
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

// Initialize Bookmarks
setupBookmarks();

// --- Data Layer ---
// ... (initializeData remains same)

// --- Bookmarks Logic ---
let currentBookmarkLodgeId = null;

function setupBookmarks() {
    // Inject Modal if not present (simpler to adding to all HTMLs manually)
    if (!document.getElementById('bookmarkModal')) {
        const modalHTML = `
            <div id="bookmarkModal" class="modal">
                <div class="modal-content">
                    <span class="close-modal close-bookmark">&times;</span>
                    <h2>Get Updates</h2>
                    <p class="subscribe-note">Bookmark this lodge and subscribe to receive discount alerts and special event notifications.</p>
                    <input type="email" id="bookmarkEmail" class="subscribe-input" placeholder="Enter your email address">
                    <button class="modal-btn primary" id="confirmBookmarkBtn">Bookmark & Subscribe</button>
                    <button class="modal-btn" id="cancelBookmarkBtn">Cancel</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    const modal = document.getElementById('bookmarkModal');
    const closeBtn = modal.querySelector('.close-bookmark');
    const cancelBtn = document.getElementById('cancelBookmarkBtn');
    const confirmBtn = document.getElementById('confirmBookmarkBtn');
    const emailInput = document.getElementById('bookmarkEmail');

    const closeModal = () => {
        modal.classList.remove('active');
        emailInput.value = ''; // Reset
        currentBookmarkLodgeId = null;
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    confirmBtn.addEventListener('click', () => {
        const email = emailInput.value;
        if (!email || !email.includes('@')) {
            alert("Please enter a valid email address.");
            return;
        }

        if (currentBookmarkLodgeId) {
            saveBookmark(currentBookmarkLodgeId, email);
        }
        closeModal();
    });
}

function getBookmarks() {
    return JSON.parse(localStorage.getItem('bookmarks') || '[]');
}

function isBookmarked(id) {
    const bookmarks = getBookmarks();
    return bookmarks.some(b => b.id == id);
}

function toggleBookmark(id, btnElement) {
    if (isBookmarked(id)) {
        // Remove
        if (confirm("Remove this lodge from your bookmarks?")) {
            const bookmarks = getBookmarks().filter(b => b.id != id);
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            updateBookmarkVisuals(id, false);
        }
    } else {
        // Add -> Open Modal
        currentBookmarkLodgeId = id;
        document.getElementById('bookmarkModal').classList.add('active');
    }
}

function saveBookmark(id, email) {
    const bookmarks = getBookmarks();
    bookmarks.push({
        id: id,
        email: email,
        date: new Date().toISOString()
    });
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));

    // Alert or Toast
    alert(`Lodge bookmarked! You will receive alerts at ${email}.`);
    updateBookmarkVisuals(id, true);
}

function updateBookmarkVisuals(id, active) {
    // Update all matching buttons on page (could be multiple if in list and details)
    const btns = document.querySelectorAll(`.bookmark-btn[data-id="${id}"]`);
    btns.forEach(btn => {
        if (active) {
            btn.classList.add('active');
            btn.innerHTML = '♥'; // Heart filled logic or icon change
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '♡'; // Heart outline
        }
    });
}
// -----------------------

// Bookmarks End

// Updated renderLodges to include Bookmark Button
// Updated renderLodges to include Bookmark Button
function renderLodges(lodges, titleOverride = "Lodges Near You") {
    const container = document.querySelector('.featured-section');
    if (container) {
        const header = container.querySelector('.section-header h2');
        if (header) header.textContent = titleOverride;
    }

    const grid = document.querySelector('.featured-grid') || document.getElementById('lodgesGrid');
    if (!grid) return;

    grid.innerHTML = '';

    lodges.forEach(lodge => {
        const card = document.createElement('div');
        // Check context: search page uses .lodge-card, home uses .featured-item
        const isSearch = grid.id === 'lodgesGrid';
        card.className = isSearch ? 'lodge-card' : 'featured-item';

        const queryParams = new URLSearchParams({ id: lodge.id }).toString();
        const bookmarked = isBookmarked(lodge.id);
        const heartIcon = bookmarked ? '♥' : '♡';
        const activeClass = bookmarked ? 'active' : '';

        // Card Content
        card.innerHTML = `
            <div class="card-bookmark">
                <button class="bookmark-btn ${activeClass}" data-id="${lodge.id}">${heartIcon}</button>
            </div>
            <div class="${isSearch ? 'lodge-image-placeholder' : 'featured-image-placeholder'}" style="background-image: url('${lodge.image}'); background-size: cover; background-position: center;"></div>
            <div class="${isSearch ? 'lodge-info' : 'featured-info'}" style="${isSearch ? '' : 'padding: 1rem;'}">
                <h3>${lodge.name}</h3>
                <p class="location" style="${isSearch ? '' : 'color: #666; font-size: 0.9rem;'}">${lodge.location}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem; ${isSearch ? '' : 'margin-top:0.5rem;'}">
                     <span style="color: gold; font-size: 0.9rem; font-weight:bold;">★ ${lodge.safety || "5.0"}</span>
                     <p class="${isSearch ? 'price' : 'price-display'}" data-usd="${lodge.price}" style="${isSearch ? 'margin-bottom:0;' : 'color: var(--accent-color); font-weight: bold; margin:0;'}">
                        $${lodge.price} <span style="font-size:0.8em; color:#666; font-weight:normal;">/ night</span>
                     </p>
                </div>
                ${isSearch ? `<a href="lodge-details.html?${queryParams}" class="view-details-btn">View Details</a>` : ''}
            </div>
        `;

        // Click behaviors
        const bookmarkBtn = card.querySelector('.bookmark-btn');
        bookmarkBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Don't trigger card click
            toggleBookmark(lodge.id, bookmarkBtn);
        });

        // Make card clickable (except bookmark/button)
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.bookmark-btn') && !e.target.closest('.view-details-btn')) {
                window.location.href = `lodge-details.html?${queryParams}`;
            }
        });

        grid.appendChild(card);
    });
}
// ... (rest of functions)

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
        document.querySelector('.hero-subtitle').innerHTML = `${lodge.location} <span style="margin-left:15px; font-size:0.8em; color:gold;">★ ${lodge.safety || '5.0'} Safety Score</span>`;
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

        // Gallery
        const galleryGrid = document.querySelector('.gallery-grid');
        if (galleryGrid && lodge.gallery && lodge.gallery.length > 0) {
            galleryGrid.innerHTML = '';
            lodge.gallery.forEach(imgSrc => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                // Check if base64 or url
                const url = imgSrc.startsWith('data:') || imgSrc.startsWith('http') ? imgSrc : imgSrc;
                item.style.backgroundImage = `url('${url}')`;
                item.style.backgroundSize = 'cover';
                item.style.backgroundPosition = 'center';

                // Add click event for lightbox
                item.addEventListener('click', () => {
                    const lightbox = document.getElementById('lightboxModal');
                    const lightboxImg = document.getElementById('lightboxImage');
                    if (lightbox && lightboxImg) {
                        lightboxImg.src = url;
                        lightbox.classList.add('active');
                    }
                });

                galleryGrid.appendChild(item);
            });
        }

        // Lightbox Close Logic (Global, but initialized here for simplicity if element exists)
        const lightbox = document.getElementById('lightboxModal');
        if (lightbox) {
            const closeBtn = lightbox.querySelector('.lightbox-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    lightbox.classList.remove('active');
                });
            }
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    lightbox.classList.remove('active');
                }
            });
        }

        // Price
        const priceEl = document.querySelector('.booking-card .price');
        if (priceEl && lodge.price) {
            priceEl.classList.add('price-display');
            priceEl.setAttribute('data-usd', lodge.price);
            priceEl.innerHTML = `$${lodge.price} <span class="per-night">/ night</span>`;
        }

        // Contact
        // Contact
        const contactDiv = document.querySelector('.contact-info');
        const email = lodge.email || 'info@lodge.com';
        const phone = lodge.phone || '+1 234 567 890';

        if (contactDiv) {
            contactDiv.innerHTML = `
                <h4>Contact Us</h4>
                <p>Email: <a href="mailto:${email}">${email}</a></p>
                <p>Phone: <a href="tel:${phone.replace(/\s+/g, '')}">${phone}</a></p>
            `;
        }

        // Setup Contact Modal Logic
        const bookBtn = document.querySelector('.book-now-btn');
        const modal = document.getElementById('contactMethodModal');
        const closeModal = modal.querySelector('.close-modal');

        // Modal Steps
        const step1 = document.getElementById('contactOptionsStep1');
        const step2 = document.getElementById('contactOptionsStep2');

        // Buttons
        const emailBtn = document.getElementById('contactEmailBtn');
        const phoneBtn = document.getElementById('contactPhoneBtn');
        const callAppBtn = document.getElementById('callPhoneBtn');
        const whatsappBtn = document.getElementById('whatsappBtn');
        const backBtn = document.getElementById('backToStep1');

        if (bookBtn && modal) {
            bookBtn.addEventListener('click', () => {
                step1.style.display = 'block';
                step2.style.display = 'none';
                modal.classList.add('active');
            });

            closeModal.addEventListener('click', () => {
                modal.classList.remove('active');
            });

            window.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('active');
            });

            // Action Handlers
            emailBtn.onclick = () => {
                window.location.href = `mailto:${email}`;
                modal.classList.remove('active');
            };

            phoneBtn.onclick = () => {
                step1.style.display = 'none';
                step2.style.display = 'block';
            };

            backBtn.onclick = () => {
                step2.style.display = 'none';
                step1.style.display = 'block';
            };

            callAppBtn.onclick = () => {
                window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
            };

            whatsappBtn.onclick = () => {
                // Remove non-digit chars for WhatsApp link
                const cleanPhone = phone.replace(/[^\d]/g, '');
                window.open(`https://wa.me/${cleanPhone}`, '_blank');
            };
        }
    }
}

function determineCurrency(lat, lon) {
    let currency = 'USD';
    let rate = 1;
    let symbol = '$';

    if (lat > 48 && lat < 60 && lon > -10 && lon < 30) {
        // Rough Europe box (excluding UK logic below)
        currency = 'EUR';
        rate = 0.92;
        symbol = '€';
    } else if (lat > 50 && lat < 60 && lon > -10 && lon < 2) {
        // UK specific (override EUR if needed, though simple lat/lon boxes are tricky)
        // Simplified for this demo:
        currency = 'GBP';
        rate = 0.79;
        symbol = '£';
    } else if (lat >= -17 && lat <= -9 && lon >= 32 && lon <= 36) {
        // Malawi
        currency = 'MWK';
        rate = 1750;
        symbol = 'MK';
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
