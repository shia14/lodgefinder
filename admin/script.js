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
                gallery: [],
                safety: 5,
                email: "info@alpinesanctuary.com",
                phone: "+41 12 345 6789",
                lat: 46.603354,
                lon: 7.96871
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
                safety: 4.8,
                phone: "+960 123 4567",
                lat: 4.175496,
                lon: 73.509347
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
                safety: 4.5,
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

    // Gallery Input Helper
    const galleryInput = document.getElementById('lodgeGalleryFiles');
    const galleryHidden = document.getElementById('lodgeGalleryBase64');
    const galleryPreview = document.getElementById('galleryPreviewContainer');

    galleryInput.addEventListener('change', function () {
        galleryPreview.innerHTML = '';
        const files = Array.from(this.files);
        if (!files.length) {
            // keep existing if any? or clear?
            // If user selects nothing after selecting something, usually input is empty.
            // But if we are adding TO existing?
            // For simplicity: Replace all.
            return;
        }

        const promises = files.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        Promise.all(promises).then(base64Images => {
            galleryHidden.value = JSON.stringify(base64Images);
            base64Images.forEach(imgSrc => {
                const img = document.createElement('img');
                img.src = imgSrc;
                img.style.height = '80px';
                img.style.width = '80px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '4px';
                img.style.border = '1px solid #ccc';
                galleryPreview.appendChild(img);
            });
        }).catch(err => console.error(err));
    });

    const searchInput = document.getElementById('adminSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderTable(e.target.value);
        });
    }

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

        // Reset gallery
        document.getElementById('lodgeGalleryBase64').value = '';
        document.getElementById('galleryPreviewContainer').innerHTML = '';
        document.getElementById('lodgeGalleryFiles').value = '';

        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock Scroll
    });

    closeBtns.forEach(btn => btn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Unlock Scroll
    }));

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveLodgeData();
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Unlock Scroll
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

// --- Broadcast Logic ---
const broadcastModal = document.getElementById('broadcastModal');
const closeBroadcast = document.querySelector('.close-broadcast');
const broadcastForm = document.getElementById('broadcastForm');

function openBroadcastModal(id) {
    const lodges = getLodges();
    const lodge = lodges.find(l => l.id == id);
    if (!lodge) return;

    document.getElementById('broadcastLodgeId').value = id;
    document.getElementById('broadcastTitle').textContent = `Send Update: ${lodge.name}`;

    // Calculate subscriber count
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const subscribers = bookmarks.filter(b => b.id == id);
    document.getElementById('broadcastSubtitle').textContent = `Message ${subscribers.length} subscriber(s).`;

    broadcastModal.classList.add('active');
}

if (closeBroadcast) {
    closeBroadcast.addEventListener('click', () => {
        broadcastModal.classList.remove('active');
    });
}

window.addEventListener('click', (e) => {
    if (e.target === broadcastModal) {
        broadcastModal.classList.remove('active');
    }
});

if (broadcastForm) {
    broadcastForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('broadcastLodgeId').value;
        const subject = document.getElementById('broadcastSubject').value;
        const message = document.getElementById('broadcastMessage').value;

        // Get subscribers
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        const subscribers = bookmarks.filter(b => b.id == id);

        if (subscribers.length === 0) {
            alert("No subscribers found for this lodge.");
            return;
        }

        // Simulate Sending via Mailto
        const emails = subscribers.map(s => s.email).join(',');

        if (confirm(`This will open your default email client to send messages to ${subscribers.length} subscribers. Continue?`)) {
            const mailtoLink = `mailto:?bcc=${encodeURIComponent(emails)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
            window.location.href = mailtoLink;

            alert(`Email client opened! In a real application, this would have been sent automatically via a server.`);
            broadcastModal.classList.remove('active');
            broadcastForm.reset();
        }
    });
}
function renderTable(searchQuery = '') {
    let lodges = getLodges();

    if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        lodges = lodges.filter(lodge =>
            lodge.name.toLowerCase().includes(lowerQuery) ||
            lodge.location.toLowerCase().includes(lowerQuery)
        );
    }

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
                <button class="action-btn" style="background-color: #9b59b6;" onclick="openBroadcastModal(${lodge.id})">✉ Broadcast</button>
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
    const safety = document.getElementById('lodgeSafety').value;
    const discount = document.getElementById('lodgeDiscount').value;

    // Extended fields
    const description = document.getElementById('lodgeDescription').value;
    const amenitiesStr = document.getElementById('lodgeAmenities').value;
    const email = document.getElementById('lodgeEmail').value;
    const phone = document.getElementById('lodgePhone').value;

    // Image handling
    const newImage = document.getElementById('lodgeImageBase64').value;

    const lat = parseFloat(document.getElementById('lodgeLat').value) || 0;
    const lon = parseFloat(document.getElementById('lodgeLon').value) || 0;

    // Gallery handling
    const newGalleryJson = document.getElementById('lodgeGalleryBase64').value;
    let newGallery = [];
    if (newGalleryJson) {
        try {
            newGallery = JSON.parse(newGalleryJson);
        } catch (e) { console.error('Error parsing gallery', e); }
    }

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
                safety,
                discount,
                lat,
                lon,
                // Only update gallery if new ones provided. 
                // NOTE: This basic implementation replaces the gallery if new files are selected.
                // Refining to append could be complex without better UI. 
                // We'll rely on "if newGallery has items, replace old. Else keep old."
                gallery: newGallery.length > 0 ? newGallery : (oldLodge.gallery || [])
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
            phone,
            safety: safety || 5, // Default to 5
            discount: discount || 0,
            lat,
            lon,
            gallery: newGallery
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
        document.getElementById('lodgeSafety').value = lodge.safety || 5;
        document.getElementById('lodgeDiscount').value = lodge.discount || 0;
        document.getElementById('lodgeLat').value = lodge.lat || '';
        document.getElementById('lodgeLon').value = lodge.lon || '';

        // Extended
        document.getElementById('lodgeDescription').value = lodge.description || '';
        document.getElementById('lodgeAmenities').value = (lodge.amenities || []).join(', ');
        document.getElementById('lodgeEmail').value = lodge.email || '';
        document.getElementById('lodgePhone').value = lodge.phone || '';

        // Gallery Preview
        const galleryPreview = document.getElementById('galleryPreviewContainer');
        const galleryHidden = document.getElementById('lodgeGalleryBase64');
        galleryPreview.innerHTML = '';
        galleryHidden.value = ''; // Reset hidden input so we don't accidentally wipe it if we don't touch the file input (logic in save relies on length > 0)

        // Show existing gallery
        if (lodge.gallery && Array.isArray(lodge.gallery)) {
            lodge.gallery.forEach(imgSrc => {
                const img = document.createElement('img');
                img.src = imgSrc; // These should be base64 or urls
                img.style.height = '80px';
                img.style.width = '80px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '4px';
                img.style.border = '1px solid #ccc';
                galleryPreview.appendChild(img);
            });
        }

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
        document.body.style.overflow = 'hidden'; // Lock Scroll
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
