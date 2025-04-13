// Fetch announcements from the server
let residentAnnouncements = [];
let residentId = null; // Will store the logged-in resident's ID

document.addEventListener('DOMContentLoaded', function() {
    // Get the current resident ID
    getCurrentResidentId();
    
    // Fetch all announcements
    fetchAnnouncements();
    
    // Set up event listeners for category filters if they exist
    const categoryFilter = document.getElementById('residentCategoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            displayAnnouncements(this.value);
        });
    }
});

function getCurrentResidentId() {
    // Fetch the current resident ID from the server
    fetch('../../php-handlers/get-current-resident.php')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.resident_id) {
                residentId = data.resident_id;
            } else {
                console.log('Resident not logged in or resident ID not available');
            }
        })
        .catch(error => {
            console.error('Error fetching resident ID:', error);
        });
}

function fetchAnnouncements() {
    // Fetch only visible announcements for the resident
    fetch('../../php-handlers/get-resident-announcements.php')
        .then(response => response.json())
        .then(data => {
            residentAnnouncements = data;
            displayAnnouncements('all'); // Display all by default
        })
        .catch(error => {
            console.error('Failed to fetch announcements:', error);
            document.getElementById('residentAnnouncementContainer').innerHTML = 
                '<div class="alert alert-danger">Failed to load announcements. Please try again later.</div>';
        });
}

function displayAnnouncements(category = 'all') {
    const container = document.getElementById('residentAnnouncementContainer');
    container.innerHTML = ''; // Clear existing content
    
    // Filter announcements by category if needed
    const filtered = category === 'all' 
        ? residentAnnouncements 
        : residentAnnouncements.filter(a => a.category === category);
    
    // Sort announcements by date (most recent first)
    filtered.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
    });
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="text-center mt-4 mb-4">No announcements available at this time.</div>';
        return;
    }
    
    // Create and append announcement cards
    filtered.forEach(announcement => {
        // Skip this announcement if it's hidden for the current resident
        if (announcement.hidden_for_resident === '1') {
            return;
        }
        
        const card = createAnnouncementCard(announcement);
        container.appendChild(card);
    });
}

function createAnnouncementCard(announcement) {
    const card = document.createElement('div');
    card.className = 'card announcement-card mb-4';
    card.id = `announcement-${announcement.id}`;
    
    // Add badge class based on announcement type
    let badgeClass = 'bg-primary';
    if (announcement.type === 'Upcoming Event') {
        badgeClass = 'bg-success';
    } else if (announcement.type === 'News and Update') {
        badgeClass = 'bg-info';
    } else if (announcement.type === 'Barangay Volunteer Drive') {
        badgeClass = 'bg-warning';
    }
    
    // Format the date to be more readable
    const formattedDate = announcement.date ? formatDate(announcement.date) : '';
    
    // Create HTML structure based on announcement type
    let cardContent = `
        <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">${announcement.title}</h5>
            <span class="badge ${badgeClass}">${announcement.type}</span>
        </div>
        <div class="card-body">
            <p class="card-text">${announcement.details}</p>
    `;
    
    // Add type-specific content
    if (announcement.type === 'Upcoming Event') {
        cardContent += `
            <div class="event-details mt-3">
                <p><i class="bi bi-calendar-event"></i> <strong>Date:</strong> ${formattedDate}</p>
                <p><i class="bi bi-tag"></i> <strong>Category:</strong> ${announcement.category || ''}</p>
            </div>
        `;
    } else if (announcement.type === 'Barangay Volunteer Drive') {
        // Check if the resident has already joined this volunteer drive
        const joinedClass = announcement.resident_joined === '1' ? 'btn-success disabled' : 'btn-primary';
        const joinedText = announcement.resident_joined === '1' ? 'Joined' : 'Join';
        
        cardContent += `
            <div class="volunteer-details mt-3">
                <p><i class="bi bi-calendar-event"></i> <strong>Date:</strong> ${formattedDate}</p>
                <p><i class="bi bi-tag"></i> <strong>Category:</strong> ${announcement.category || ''}</p>
                <div class="points-info">
                    <p><i class="bi bi-star"></i> <strong>Experience Points:</strong> ${announcement.exp_points || '0'}</p>
                    <p><i class="bi bi-gift"></i> <strong>Redeemable Points:</strong> ${announcement.redeem_points || '0'}</p>
                </div>
                <div class="action-buttons mt-3">
                    <button class="btn ${joinedClass} join-btn" data-id="${announcement.id}" data-type="volunteer-drive">${joinedText}</button>
                    <button class="btn btn-outline-secondary hide-btn ms-2" data-id="${announcement.id}" data-type="volunteer-drive">Hide</button>
                </div>
            </div>
        `;
    } else if (announcement.type === 'News and Update') {
        cardContent += `
            <div class="news-details mt-3">
                <p><i class="bi bi-tag"></i> <strong>Category:</strong> ${announcement.category || ''}</p>
            </div>
        `;
    }
    
    // Add image if available
    if (announcement.image_path) {
        cardContent += `<div class="announcement-image mt-3 mb-3">
            <img src="${announcement.image_path}" class="img-fluid rounded" alt="${announcement.title}">
        </div>`;
    }
    
    // Close card body and add footer
    cardContent += `
        </div>
        <div class="card-footer text-muted">
            Category: ${announcement.category || 'General'}
        </div>
    `;
    
    card.innerHTML = cardContent;
    
    // Add event listeners for Join and Hide buttons
    if (announcement.type === 'Barangay Volunteer Drive') {
        const joinBtn = card.querySelector('.join-btn');
        if (joinBtn && announcement.resident_joined !== '1') {
            joinBtn.addEventListener('click', function() {
                joinVolunteerDrive(announcement.id);
            });
        }
        
        const hideBtn = card.querySelector('.hide-btn');
        if (hideBtn) {
            hideBtn.addEventListener('click', function() {
                hideAnnouncement(announcement.id, announcement.type);
            });
        }
    }
    
    return card;
}

function formatDate(dateString) {
    if (!dateString) return '';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function joinVolunteerDrive(announcementId) {
    // First check if resident is logged in
    if (!residentId) {
        showLoginRequiredModal();
        return;
    }
    
    // Send request to join volunteer drive
    fetch('../../php-handlers/join-volunteer-drive.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            volunteer_drive_id: announcementId,
            resident_id: residentId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the button to show "Joined" and disable it
            const joinBtn = document.querySelector(`#announcement-${announcementId} .join-btn`);
            if (joinBtn) {
                joinBtn.textContent = 'Joined';
                joinBtn.classList.remove('btn-primary');
                joinBtn.classList.add('btn-success', 'disabled');
            }
            
            // Update the local data
            const announcement = residentAnnouncements.find(a => a.id == announcementId);
            if (announcement) {
                announcement.resident_joined = '1';
            }
            
            // Show success message
            showNotification('Successfully joined volunteer drive!', 'success');
        } else {
            // Show error message
            showNotification(data.message || 'Failed to join volunteer drive', 'danger');
        }
    })
    .catch(error => {
        console.error('Error joining volunteer drive:', error);
        showNotification('An error occurred. Please try again.', 'danger');
    });
}

function hideAnnouncement(announcementId, type) {
    // First check if resident is logged in
    if (!residentId) {
        showLoginRequiredModal();
        return;
    }
    
    // Send request to hide announcement
    fetch('../../php-handlers/hide-announcement.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            announcement_id: announcementId,
            announcement_type: type,
            resident_id: residentId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Hide the announcement card with animation
            const card = document.getElementById(`announcement-${announcementId}`);
            if (card) {
                card.style.transition = 'opacity 0.5s ease, height 0.5s ease, margin 0.5s ease';
                card.style.opacity = '0';
                card.style.height = '0';
                card.style.margin = '0';
                card.style.overflow = 'hidden';
                
                // Remove the card after animation completes
                setTimeout(() => {
                    card.remove();
                }, 500);
            }
            
            // Update the local data
            const announcement = residentAnnouncements.find(a => a.id == announcementId);
            if (announcement) {
                announcement.hidden_for_resident = '1';
            }
            
            // Show success message
            showNotification('Announcement hidden successfully', 'success');
        } else {
            // Show error message
            showNotification(data.message || 'Failed to hide announcement', 'danger');
        }
    })
    .catch(error => {
        console.error('Error hiding announcement:', error);
        showNotification('An error occurred. Please try again.', 'danger');
    });
}

function showLoginRequiredModal() {
    // Create a Bootstrap modal to inform the resident they need to log in
    const modalHtml = `
        <div class="modal fade" id="loginRequiredModal" tabindex="-1" aria-labelledby="loginRequiredModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="loginRequiredModalLabel">Login Required</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>You need to be logged in to perform this action.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <a href="login.php" class="btn btn-primary">Go to Login</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add the modal to the document if it doesn't exist yet
    if (!document.getElementById('loginRequiredModal')) {
        const div = document.createElement('div');
        div.innerHTML = modalHtml;
        document.body.appendChild(div.firstChild);
    }
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('loginRequiredModal'));
    modal.show();
}

function showNotification(message, type = 'info') {
    // Create a Bootstrap toast notification
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Add the toast to the container
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    // Initialize and show the toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 5000 });
    toast.show();
    
    // Remove toast from DOM after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function () {
        toastElement.remove();
    });
}