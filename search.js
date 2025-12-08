// Search page functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('lodgeSearchForm');
    const lodgesGrid = document.getElementById('lodgesGrid');

    // Handle form submission
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                lodgeName: document.getElementById('lodgeName').value,
                location: document.getElementById('location').value,
                priceRange: document.getElementById('priceRange').value
            };

            // Perform search (placeholder for now)
            performSearch(formData);
        });
    }

    // Search function (placeholder - will be expanded later)
    function performSearch(filters) {
        console.log('Searching with filters:', filters);
        
        // TODO: Implement actual search logic
        // For now, we'll just show all lodges
        // In the future, this will filter the lodges based on the criteria
    }

    // Enhanced hover effect for lodge cards (moodboard style)
    const lodgeCards = document.querySelectorAll('.lodge-card');
    const lodgesGrid = document.querySelector('.lodges-grid');
    
    lodgeCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Ensure smooth animation with enhanced easing
            this.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease, border-color 0.3s ease, box-shadow 0.4s ease';
        });

        card.addEventListener('mouseleave', function() {
            // Reset to default transition
            this.style.transition = '';
        });
    });

    // Optional: Add will-change for better performance
    if (lodgesGrid) {
        lodgesGrid.addEventListener('mouseenter', function() {
            lodgeCards.forEach(card => {
                card.style.willChange = 'transform, opacity';
            });
        });

        lodgesGrid.addEventListener('mouseleave', function() {
            lodgeCards.forEach(card => {
                card.style.willChange = 'auto';
            });
        });
    }
});

