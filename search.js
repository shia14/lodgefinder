// Search page functionality
document.addEventListener('DOMContentLoaded', function () {
    const searchForm = document.getElementById('lodgeSearchForm');

    // Initial render of all lodges
    const allLodges = getLodges();
    renderLodges(allLodges);

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
            renderLodges(filteredLodges);
        });
    }

    // Animation enhancements rely on dynamic elements now, handled in renderLodges or via event delegation
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

function getLodges() {
    return JSON.parse(localStorage.getItem('lodges') || '[]');
}

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

function renderLodges(lodges) {
    const grid = document.getElementById('lodgesGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (lodges.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No lodges found matching your criteria.</p>';
        return;
    }

    lodges.forEach(lodge => {
        const card = document.createElement('div');
        card.className = 'lodge-card';

        // Image handling
        let imageSrc = lodge.image;
        // If not base64 and not remote http, assumes relative path from root
        // Since search.html is in root, 'images/...' works fine.

        card.innerHTML = `
            <div class="lodge-image-placeholder" style="background-image: url('${imageSrc}'); background-size: cover; background-position: center;"></div>
            <div class="lodge-info">
                <h3>${lodge.name}</h3>
                <p class="location">${lodge.location}</p>
                <p class="price">$${lodge.price}<span style="font-size:0.8em; color:#666; font-weight:normal;">/night</span></p>
                <a href="lodge-details.html?id=${lodge.id}" class="view-details-btn">View Details</a>
            </div>
        `;

        // Make the whole card clickable except the button (standard pattern, or just button)
        // Adding click handler to card to navigate
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            // Prevent if clicked on the actual link to avoid double navigation
            if (!e.target.closest('.view-details-btn')) {
                window.location.href = `lodge-details.html?id=${lodge.id}`;
            }
        });

        grid.appendChild(card);
    });
}

