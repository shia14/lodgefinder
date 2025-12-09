document.addEventListener('DOMContentLoaded', () => {
    initializeStorage();

    const isLoginPage = document.querySelector('.login-container');
    const isDashboard = document.querySelector('.admin-content');

    if (isLoginPage) setupLogin();
    if (isDashboard) setupDashboard();
});

function initializeStorage() {
    if (!localStorage.getItem('lodges')) {
        // Updated Seed Data with full fields
        const initialLodges = [
            {
                id: 1,
                name: "Alpine Sanctuary",
                location: "Swiss Alps",
                price: 450,
                image: "images/background.png",
                description: "Experience the pinnacle of luxury in the heart of the Swiss Alps. Alpine Sanctuary offers a secluded retreat where modern comfort meets traditional alpine charm.",
                amenities: ["Private Spa", "Gourmet Dining", "Ski-in/Ski-out", "Concierge"],
                email: "info@alpinesanctuary.com",
                phone: "+41 12 345 6789"
            },
            {
                id: 2,
                name: "Oceanfront Villa",
                location: "Maldives",
                price: 850,
                image: "images/background.png",
                description: "Wake up to the sound of waves in this overwater villa. Perfect for honeymooners and peace seekers.",
                amenities: ["Infinity Pool", "Butler Service", "Water Sports", "Fine Dining"],
                email: "reservations@oceanfront.com",
                phone: "+960 123 4567"
            },
            {
                id: 3,
                name: "Forest Hideaway",
                location: "Oregon, USA",
                price: 250,
                image: "images/background.png",
                description: "A cozy cabin deep in the woods, perfect for disconnecting from the digital world.",
                amenities: ["Fireplace", "Hiking Trails", "Pet Friendly", "Kitchen"],
                email: "stay@foresthideaway.com",
                phone: "+1 555 0199"
            }
        ];
        localStorage.setItem('lodges', JSON.stringify(initialLodges));
    }
}

function setupLogin() {
    const loginForm = document.getElementById('loginForm');
    const errorMsg = document.getElementById('errorMessage');

    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = loginForm.username.value;
        const password = loginForm.password.value;

        if (username === 'admin' && password === 'admin123') {
            localStorage.setItem('adminLoggedIn', 'true');
            window.location.href = 'dashboard.html';
        } else {
            errorMsg.textContent = 'Invalid credentials. Try admin / admin123';
        }
    });
}

function setupDashboard() {
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminLoggedIn');
            window.location.href = 'login.html';
        });
    }

    renderTable();

    // Modal Handling
    const modal = document.getElementById('lodgeModal');
    const addBtn = document.getElementById('addLodgeBtn');
    const closeBtns = document.querySelectorAll('.close-modal, .close-modal-btn');
    const form = document.getElementById('lodgeForm');

    // File Input Helper
    const fileInput = document.getElementById('lodgeImageFile');
    const hiddenBase64 = document.getElementById('lodgeImageBase64');
    const preview = document.getElementById('imagePreview');

    fileInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                hiddenBase64.value = e.target.result;
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    addBtn.addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Add New Lodge';
        form.reset();
        document.getElementById('editLodgeId').value = '';
        hiddenBase64.value = '';
        preview.src = '';
        preview.style.display = 'none';
        modal.classList.add('active');
    });

    closeBtns.forEach(btn => btn.addEventListener('click', () => {
        modal.classList.remove('active');
    }));

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveLodgeData();
        modal.classList.remove('active');
        renderTable();
    });
}

function getLodges() {
    return JSON.parse(localStorage.getItem('lodges') || '[]');
}

function saveLodges(lodges) {
    try {
        localStorage.setItem('lodges', JSON.stringify(lodges));
    } catch (e) {
        alert("Quota exceeded! Image might be too large. Try a smaller image.");
    }
}

function renderTable() {
    const lodges = getLodges();
    const countEl = document.getElementById('totalLodgesCount');
    if (countEl) countEl.textContent = lodges.length;

    const tbody = document.getElementById('lodgesTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    lodges.forEach(lodge => {
        // Check if image is base64 or relative path
        const isBase64 = lodge.image.startsWith('data:');
        const isRemote = lodge.image.startsWith('http');

        let thumbPath = lodge.image;
        if (!isBase64 && !isRemote) {
            // Assume relative to root, so prepend ../ for admin dashboard
            thumbPath = `../${lodge.image}`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${thumbPath}" alt="thumb"></td>
            <td>${lodge.name}</td>
            <td>${lodge.location}</td>
            <td>$${lodge.price}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editLodge(${lodge.id})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteLodge(${lodge.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function saveLodgeData() {
    const id = document.getElementById('editLodgeId').value;
    const name = document.getElementById('lodgeName').value;
    const location = document.getElementById('lodgeLocation').value;
    const price = document.getElementById('lodgePrice').value;

    // Extended fields
    const description = document.getElementById('lodgeDescription').value;
    const amenitiesStr = document.getElementById('lodgeAmenities').value;
    const email = document.getElementById('lodgeEmail').value;
    const phone = document.getElementById('lodgePhone').value;

    // Image handling
    const newImage = document.getElementById('lodgeImageBase64').value;

    const amenities = amenitiesStr.split(',').map(s => s.trim()).filter(s => s);

    let lodges = getLodges();

    if (id) {
        // Edit existing
        const index = lodges.findIndex(l => l.id == id);
        if (index > -1) {
            const oldLodge = lodges[index];
            lodges[index] = {
                ...oldLodge,
                name,
                location,
                price,
                description,
                amenities,
                email,
                phone,
                // Only update image if new one provided
                image: newImage || oldLodge.image
            };
        }
    } else {
        // Add new
        const newId = lodges.length > 0 ? Math.max(...lodges.map(l => l.id)) + 1 : 1;
        lodges.push({
            id: newId,
            name,
            location,
            price,
            image: newImage || "images/background.png", // Fallback
            description,
            amenities,
            email,
            phone
        });
    }

    saveLodges(lodges);
}

// Global scope for onclick handlers
window.editLodge = function (id) {
    const lodges = getLodges();
    const lodge = lodges.find(l => l.id === id);

    if (lodge) {
        document.getElementById('modalTitle').textContent = 'Edit Lodge';
        document.getElementById('editLodgeId').value = lodge.id;
        document.getElementById('lodgeName').value = lodge.name;
        document.getElementById('lodgeLocation').value = lodge.location;
        document.getElementById('lodgePrice').value = lodge.price;

        // Extended
        document.getElementById('lodgeDescription').value = lodge.description || '';
        document.getElementById('lodgeAmenities').value = (lodge.amenities || []).join(', ');
        document.getElementById('lodgeEmail').value = lodge.email || '';
        document.getElementById('lodgePhone').value = lodge.phone || '';

        // Image Preview
        const preview = document.getElementById('imagePreview');
        const hiddenBase64 = document.getElementById('lodgeImageBase64');

        hiddenBase64.value = ''; // Reset new image buffer

        // Resolve preview path, check for URL first
        let previewSrc = lodge.image;
        if (!lodge.image.startsWith('data:') && !lodge.image.startsWith('http')) {
            previewSrc = `../${lodge.image}`;
        }

        preview.src = previewSrc;
        preview.style.display = 'block';

        document.getElementById('lodgeModal').classList.add('active');
    }
}

window.deleteLodge = function (id) {
    if (confirm('Are you sure you want to delete this lodge?')) {
        let lodges = getLodges();
        lodges = lodges.filter(l => l.id !== id);
        saveLodges(lodges);
        renderTable();
    }
}
