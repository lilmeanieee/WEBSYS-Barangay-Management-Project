document.getElementById('announcementCategory').addEventListener('change', function() {
    const selectedCategory = this.value;
    const upcomingEventForm = document.getElementById('upcomingEventForm');
    const newsUpdateForm = document.getElementById('newsUpdateForm');
    const volunteerDriveForm = document.getElementById('volunteerDriveForm');
    
    // Hide all categ form
    upcomingEventForm.style.display = 'none';
    newsUpdateForm.style.display = 'none';
    volunteerDriveForm.style.display = 'none';

    // Show selected categ form
    if (selectedCategory === 'upcomingEvent') {
        upcomingEventForm.style.display = 'block';
    } else if (selectedCategory === 'newsUpdate') {
        newsUpdateForm.style.display = 'block';
    } else if (selectedCategory === 'volunteerDrive') {
        volunteerDriveForm.style.display = 'block';
    }
});

document.getElementById('postAnnouncementBtn').addEventListener('click', function() {
    const form = document.getElementById('announcementForm');
    const editIndex = form.dataset.editIndex;

    const type = document.getElementById('announcementCategory').value;
    let title, details, date;

    if (type === 'upcomingEvent') {
        title = document.getElementById('eventTitle').value;
        details = document.getElementById('eventDetails').value;
        date = document.getElementById('eventDate').value;
    } else if (type === 'newsUpdate') {
        title = document.getElementById('newsTitle').value;
        details = document.getElementById('newsDetails').value;
    } else if (type === 'volunteerDrive') {
        title = document.getElementById('volunteerTitle').value;
        details = document.getElementById('volunteerDetails').value;
        date = document.getElementById('volunteerDate').value;
    }

    if (editIndex !== undefined && editIndex !== '') {
        // Edit existing announcement
        sampleAnnouncements[editIndex] = { type, title, details, date };
        form.removeAttribute('data-edit-index');
    } else {
        // Add new announcement
        sampleAnnouncements.push({ type, title, details, date });
    }

    renderAnnouncements(document.getElementById('categoryFilter').value);
    const modal = bootstrap.Modal.getInstance(document.getElementById('announcementModal'));
    modal.hide();
});

/*  possible na ito nalang na method ang iedit(?), which is yung iconnect nyo sa databese, I think?
    basta kamo na bahala mag modify since idunno man ano laman database nyo
*/
const sampleAnnouncements = [
    {
        type: 'upcomingEvent',
        title: 'Clean-Up Drive',
        details: 'Join us for a community clean-up!',
        date: '2025-04-20'
    },
    {
        type: 'newsUpdate',
        title: 'Water Interruption Notice',
        details: 'There will be a water outage on April 10th.'
    },
    {
        type: 'volunteerDrive',
        title: 'Volunteers Needed for Feeding Program',
        details: 'Help us feed those in need. Deadline: April 15.',
        date: '2025-04-25'
    }
];

function renderAnnouncements(category = 'all') {
    const container = document.getElementById('announcementList');
    container.innerHTML = '';

    const filtered = category === 'all'
        ? sampleAnnouncements
        : sampleAnnouncements.filter(a => a.type === category);

    if (filtered.length === 0) {
        container.innerHTML = '<p class="text-muted">No announcements in this category.</p>';
        return;
    }

    filtered.forEach((announcement, index) => {
        const card = document.createElement('div');
        card.className = 'card mb-3';
    
        card.innerHTML = `
            <div class="card-body d-flex justify-content-between align-items-start">
                <div>
                    <h5 class="card-title">${announcement.title}</h5>
                    <p class="card-text">${announcement.details}</p>
                    ${announcement.date ? `<p class="card-text"><small class="text-muted">Event Date: ${announcement.date}</small></p>` : ''}
                    <span class="badge bg-secondary">${formatType(announcement.type)}</span>
                </div>
                <div>
                    <button class="btn btn-sm btn-primary me-2 edit-btn" data-index="${index}">Edit</button>
                    <button class="btn btn-sm btn-danger archive-btn" data-index="${index}">Archive</button>
                </div>
            </div>
        `;
    
        container.appendChild(card);
    });
    
}

document.addEventListener('click', function (e) {
    if (e.target.classList.contains('edit-btn')) {
        const index = e.target.dataset.index;
        const announcement = sampleAnnouncements[index];
    
        // Select the form based on categ
        document.getElementById('announcementCategory').value = announcement.type;
        document.getElementById('announcementCategory').dispatchEvent(new Event('change'));
    
        // Populate fields based on categ
        if (announcement.type === 'upcomingEvent') {
            document.getElementById('eventTitle').value = announcement.title;
            document.getElementById('eventDetails').value = announcement.details;
            document.getElementById('eventDate').value = announcement.date || '';
        } else if (announcement.type === 'newsUpdate') {
            document.getElementById('newsTitle').value = announcement.title;
            document.getElementById('newsDetails').value = announcement.details;
        } else if (announcement.type === 'volunteerDrive') {
            document.getElementById('volunteerTitle').value = announcement.title;
            document.getElementById('volunteerDetails').value = announcement.details;
            document.getElementById('volunteerDate').value = announcement.date || '';
            
        }
    
        // Store index to update later
        document.getElementById('announcementForm').dataset.editIndex = index;
    
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('announcementModal'));
        modal.show();
    }
    
});


function formatType(type) {
    switch(type) {
        case 'upcomingEvent': return 'Upcoming Event';
        case 'newsUpdate': return 'News and Update';
        case 'volunteerDrive': return 'Volunteer Drive';
        default: return '';
    }
}

document.getElementById('categoryFilter').addEventListener('change', function () {
    renderAnnouncements(this.value);
});

// Initialize with all
renderAnnouncements();
