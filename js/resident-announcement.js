let announcementsFromDB = [];

// Fetch announcements
fetch('http://localhost/WEBSYS-Barangay-Management-Project/php-handlers/get-announcement.php')
    .then(res => res.json())
    .then(data => {
        announcementsFromDB = data;
        renderAnnouncements(); // Show all initially
    })
    .catch(err => {
        console.error('Error fetching announcements:', err);
    });

function renderAnnouncements(categoryFilter = 'all', searchQuery = '') {
    const newsContainer = document.getElementById('newsUpdatesList');
    const eventsContainer = document.getElementById('upcomingEventsList');
    const volunteerContainer = document.getElementById('volunteerEventsList');

    if (!newsContainer || !eventsContainer || !volunteerContainer) {
        console.error('One or more announcement containers are missing.');
        return;
    }

    // Clear previous content
    newsContainer.innerHTML = '';
    eventsContainer.innerHTML = '';
    volunteerContainer.innerHTML = '';

    // Normalize search
    const query = searchQuery.toLowerCase();

    const filtered = announcementsFromDB.filter(a => {
        const matchesCategory = categoryFilter === 'all' || a.type === categoryFilter;
        const matchesSearch = a.title.toLowerCase().includes(query) || a.details.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        const noDataHTML = '<p class="text-muted">No announcements found.</p>';
        newsContainer.innerHTML = noDataHTML;
        eventsContainer.innerHTML = noDataHTML;
        volunteerContainer.innerHTML = noDataHTML;
        return;
    }

    // Sort announcements based on type/date
    filtered.sort((a, b) => {
        const getDate = (item) => {
            let dateStr = '';
            if (item.type === 'News and Update') dateStr = item.created_at;
            else if (item.type === 'Upcoming Event') dateStr = item.event_date;
            else if (item.type === 'Barangay Volunteer Drive') dateStr = item.date;
            const parsed = new Date(dateStr);
            return isNaN(parsed) ? new Date(8640000000000000) : parsed; // Max future date if invalid
        };
        return getDate(a) - getDate(b);
    });

    // Render all filtered announcements
    filtered.forEach(announcement => {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';

        const dateHTML = announcement.date ? `<div class="text-muted mb-2">${announcement.date}</div>` : '';

        card.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    ${dateHTML}
                    <h5 class="card-title">${announcement.title}</h5>
                    <p class="card-text">${announcement.details}</p>
                    ${announcement.time_start && announcement.time_end
                        ? `<small class="text-muted">${announcement.time_start} - ${announcement.time_end}</small>` : ''}
                </div>
            </div>
        `;

        switch (announcement.type) {
            case 'News and Update':
                newsContainer.appendChild(card);
                break;
            case 'Upcoming Event':
                eventsContainer.appendChild(card);
                break;
            case 'Barangay Volunteer Drive':
                const volunteerCard = document.createElement('div');
                volunteerCard.className = 'col-md-12 mb-4';

                volunteerCard.innerHTML = `
                    <div class="card shadow-sm">
                        <div class="card-body d-flex justify-content-between align-items-start flex-wrap">
                            <div style="flex: 1 1 auto; min-width: 70%;">
                                <h5 class="card-title mb-2">${announcement.title}</h5>
                                <p class="card-text">${announcement.details}</p>
                                ${announcement.time_start && announcement.time_end
                                    ? `<p class="card-text text-muted mb-0"><small>${announcement.time_start} - ${announcement.time_end}</small></p>` : ''}
                            </div>
                            <div class="text-end" style="min-width: 150px;">
                                <span class="badge bg-success mb-2">${new Date(announcement.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</span><br>
                                <button class="btn btn-sm btn-outline-primary join-button" data-volunteer-id="${announcement.volunteer_announcement_id}">Join</button>
                            </div>
                        </div>
                    </div>
                `;
                volunteerContainer.appendChild(volunteerCard);
                break;
            default:
                console.warn('Uncategorized announcement:', announcement);
                break;
        }
    });

    // Bind join buttons after DOM is updated
    setTimeout(() => {
        document.querySelectorAll('.join-button').forEach(button => {
            button.addEventListener('click', function () {
                const userData = localStorage.getItem('userData');
                const volunteerId = this.dataset.volunteerId;

                if (!userData) {
                    alert("⚠️ You need to log in first to join this activity.");
                    return;
                }

                const confirmationDiv = document.createElement("div");
                confirmationDiv.className = "join-confirmation mt-2";
                confirmationDiv.innerHTML = `
                    <div class="p-3 border rounded bg-light">
                        <p>Are you sure you want to join this activity?</p>
                        <button class="btn btn-success btn-sm me-2 yes-btn">Yes</button>
                        <button class="btn btn-secondary btn-sm no-btn">No</button>
                    </div>
                `;
                this.parentElement.appendChild(confirmationDiv);

                const yesBtn = confirmationDiv.querySelector(".yes-btn");
                const noBtn = confirmationDiv.querySelector(".no-btn");
                const buttonRef = this;

                yesBtn.addEventListener("click", function () {
                    const user = JSON.parse(userData);
                    const residentId = user.resident_id;

                    fetch('../php-handlers/join-volunteer.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: `resident_id=${encodeURIComponent(residentId)}&volunteer_announcement_id=${encodeURIComponent(volunteerId)}`
                    })
                    .then(res => res.text())
                    .then(response => {
                        console.log("✅ Server response:", response);
                        buttonRef.textContent = "Joined";
                        buttonRef.disabled = true;
                        confirmationDiv.remove();
                    })
                    .catch(err => {
                        console.error("❌ Join failed:", err);
                        alert("An error occurred. Please try again.");
                    });
                });

                noBtn.addEventListener("click", function () {
                    confirmationDiv.remove();
                });
            });
        });
    }, 100);
}

// Filter by category
document.getElementById('categoryFilter').addEventListener('change', function () {
    const selected = this.value;
    const searchQuery = document.getElementById('searchInput').value;
    renderAnnouncements(selected, searchQuery);
});

// Search announcements
document.getElementById('searchBtn').addEventListener('click', function () {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const searchQuery = document.getElementById('searchInput').value;
    renderAnnouncements(selectedCategory, searchQuery);
});
