// Search page functionality
document.addEventListener('DOMContentLoaded', function () {
    const searchForm = document.getElementById('lodgeSearchForm');

    // Initial render of all lodges
    // Ensure getLodges is available from script.js, otherwise fallback
    const allLodges = (typeof getLodges === 'function') ? getLodges() : JSON.parse(localStorage.getItem('lodges') || '[]');
    renderSearchLodges(allLodges);

    // Handle form submission
    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = {
                lodgeName: document.getElementById('lodgeName').value.toLowerCase(),
                location: document.getElementById('location').value.toLowerCase(),
                priceRange: document.getElementById('priceRange').value
            };

            const filteredLodges = filterLodges(allLodges, formData);
            renderSearchLodges(filteredLodges);
        });
    }

    // Animation enhancements
    const lodgesGrid = document.getElementById('lodgesGrid');
    if (lodgesGrid) {
        lodgesGrid.addEventListener('mouseover', function (e) {
            const card = e.target.closest('.lodge-card');
            if (card) {
                card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease, border-color 0.3s ease, box-shadow 0.4s ease';
            }
        });

        lodgesGrid.addEventListener('mouseout', function (e) {
            const card = e.target.closest('.lodge-card');
            if (card) {
                card.style.transition = '';
            }
        });
    }
});

function filterLodges(lodges, filters) {
    return lodges.filter(lodge => {
        // Name Filter
        if (filters.lodgeName && !lodge.name.toLowerCase().includes(filters.lodgeName)) {
            return false;
        }

        // Location Filter
        if (filters.location && !lodge.location.toLowerCase().includes(filters.location)) {
            return false;
        }

        // Price Filter
        if (filters.priceRange) {
            const price = parseFloat(lodge.price);
            if (filters.priceRange === '0-100' && price > 100) return false;
            if (filters.priceRange === '100-300' && (price <= 100 || price > 300)) return false;
            if (filters.priceRange === '300-500' && (price <= 300 || price > 500)) return false;
            if (filters.priceRange === '500+' && price <= 500) return false;
        }

        return true;
    });
}

function renderSearchLodges(lodges) {
    const grid = document.getElementById('lodgesGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (lodges.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No lodges found matching your criteria.</p>';
        return;
    }

    // Safety check for bookmark functions
    const checkBookmark = (id) => (typeof isBookmarked === 'function') ? isBookmarked(id) : false;

    lodges.forEach(lodge => {
        const card = document.createElement('div');
        card.className = 'lodge-card';

        // Image handling
        let imageSrc = lodge.image;

        const bookmarked = checkBookmark(lodge.id);
        const heart = bookmarked ? '♥' : '♡';
        const activeClass = bookmarked ? 'active' : '';

        card.innerHTML = `
            <div class="card-bookmark">
                <button class="bookmark-btn ${activeClass}" data-id="${lodge.id}">
                    ${heart}
                </button>
            </div>
            <div class="lodge-image-placeholder" style="background-image: url('${imageSrc}'); background-size: cover; background-position: center;"></div>
            <div class="lodge-info">
                <h3>${lodge.name}</h3>
                <p class="location">${lodge.location}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                     <span style="color: gold; font-size: 0.9rem; font-weight:bold;">★ ${lodge.safety || "5.0"}</span>
                     <div style="text-align: right;">
                        ${lodge.discount > 0 ? `<span style="font-size: 0.8rem; text-decoration: line-through; color: #999;">$${lodge.price}</span>` : ''}
                        <p class="price" data-usd="${lodge.price}" data-discount="${lodge.discount || 0}" style="margin-bottom:0;">
                            $${lodge.discount > 0 ? Math.round(lodge.price * (1 - lodge.discount / 100)) : lodge.price} <span style="font-size:0.8em; color:#666; font-weight:normal;">/night</span>
                        </p>
                        ${lodge.discount > 0 ? `<span style="background: #e74c3c; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: bold;">${lodge.discount}% OFF</span>` : ''}
                     </div>
                </div>
                <a href="lodge-details.html?id=${lodge.id}" class="view-details-btn">View Details</a>
            </div>
        `;

        // Bookmark Click
        const bookmarkBtn = card.querySelector('.bookmark-btn');
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Avoid triggering card click
                if (typeof toggleBookmark === 'function') {
                    toggleBookmark(lodge.id, bookmarkBtn);
                } else {
                    alert("Bookmark functionality unavailable.");
                }
            });
        }

        // Make the whole card clickable except the button (standard pattern, or just button)
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.view-details-btn') && !e.target.closest('.bookmark-btn')) {
                window.location.href = `lodge-details.html?id=${lodge.id}`;
            }
        });

        grid.appendChild(card);
    });
}

