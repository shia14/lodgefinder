// Contact Form Handler
(function () {
    'use strict';

    const API_URL = '/api';

    document.addEventListener('DOMContentLoaded', function () {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        // Create status message container
        const statusContainer = document.createElement('div');
        statusContainer.id = 'formStatus';
        statusContainer.style.cssText = `
            margin-top: 20px;
            padding: 15px;
            border-radius: 4px;
            display: none;
            font-weight: 500;
        `;
        contactForm.appendChild(statusContainer);

        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.textContent;

            // Get form data
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value.trim()
            };

            // Basic validation
            if (!formData.name || !formData.email || !formData.message) {
                showStatus('Please fill in all required fields', 'error');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                showStatus('Please enter a valid email address', 'error');
                return;
            }

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            submitBtn.style.opacity = '0.7';
            hideStatus();

            try {
                const response = await fetch(`${API_URL}/contact`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    showStatus(data.message, 'success');
                    contactForm.reset();

                    // Scroll to success message
                    statusContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    showStatus(data.message || 'Failed to send message. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                showStatus(
                    'Unable to connect to the server. Please make sure the server is running or contact us directly at blessingsphiri196@gmail.com',
                    'error'
                );
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                submitBtn.style.opacity = '1';
            }
        });

        function showStatus(message, type) {
            statusContainer.textContent = message;
            statusContainer.style.display = 'block';

            if (type === 'success') {
                statusContainer.style.backgroundColor = '#d4edda';
                statusContainer.style.color = '#155724';
                statusContainer.style.border = '1px solid #c3e6cb';
            } else {
                statusContainer.style.backgroundColor = '#f8d7da';
                statusContainer.style.color = '#721c24';
                statusContainer.style.border = '1px solid #f5c6cb';
            }
        }

        function hideStatus() {
            statusContainer.style.display = 'none';
        }
    });
})();
