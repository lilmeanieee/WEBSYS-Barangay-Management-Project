let announcementsFromDB = [];

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
        newsContainer.innerHTML = '<p class="text-muted">No announcements found.</p>';
        eventsContainer.innerHTML = '<p class="text-muted">No announcements found.</p>';
        volunteerContainer.innerHTML = '<p class="text-muted">No announcements found.</p>';
        return;
    }
    filtered.sort((a, b) => {
        const getDate = (item) => {
            let dateStr = '';
            if (item.type === 'News and Update') dateStr = item.created_at;
            else if (item.type === 'Upcoming Event') dateStr = item.event_date;
            else if (item.type === 'Barangay Volunteer Drive') dateStr = item.date;
        
            const parsed = new Date(dateStr);
            return isNaN(parsed) ? new Date(8640000000000000) : parsed; // Max future date if invalid
        };
        
    
        return getDate(a) - getDate(b); // earliest first
    });
    
        




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
                volunteerCard.className = 'col-md-12 mb-4'; // full-width cards

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
                                <button class="btn btn-outline-primary btn-sm">Join</button>
                            </div>
                        </div>
                    </div>
                `;
                volunteerContainer.appendChild(volunteerCard);
                break;
                console.warn('Uncategorized announcement:', announcement);
                break;
        }
    });
}

// Category filter
document.getElementById('categoryFilter').addEventListener('change', function () {
    const selected = this.value;
    const searchQuery = document.getElementById('searchInput').value;
    renderAnnouncements(selected, searchQuery);
});

// Search button
document.getElementById('searchBtn').addEventListener('click', function () {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const searchQuery = document.getElementById('searchInput').value;
    renderAnnouncements(selectedCategory, searchQuery);
});
