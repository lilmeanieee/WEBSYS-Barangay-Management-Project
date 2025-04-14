// Sample data - In a real application, this would come from a database
const sampleApplicants = [
    { id: 1, name: "John Doe", eventName: "Community Cleanup", joinDate: "2025-04-10" },
    { id: 2, name: "Jane Smith", eventName: "Food Drive", joinDate: "2025-04-09" },
    { id: 3, name: "Sam Johnson", eventName: "Community Cleanup", joinDate: "2025-04-12" },
    { id: 4, name: "Emily Wilson", eventName: "Senior Center Visit", joinDate: "2025-04-08" },
    { id: 5, name: "Michael Brown", eventName: "Food Drive", joinDate: "2025-04-11" }
];

// Sample approved participants with attendance status
const sampleParticipants = [];

// Event points allocation
const eventPoints = {
    "Community Cleanup": 10,
    "Food Drive": 15,
    "Senior Center Visit": 20
};

// Initialize the dashboard when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Populate applicants table
    populateApplicantsTable();
    
    // Initialize event listeners
    initEventListeners();
    
    // Populate event filter dropdown
    populateEventFilter();
});

// Function to populate applicants table
function populateApplicantsTable() {
    const tableBody = document.querySelector('#applicants-table tbody');
    tableBody.innerHTML = '';
    
    sampleApplicants.forEach(applicant => {
        // Don't display applicants who have already been approved
        if (!sampleParticipants.some(p => p.id === applicant.id)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="form-check-input applicant-checkbox" data-id="${applicant.id}">
                </td>
                <td>${applicant.name}</td>
                <td>${applicant.eventName}</td>
                <td>${applicant.joinDate}</td>
            `;
            tableBody.appendChild(row);
        }
    });
    
    // If no applicants left, show message
    if (tableBody.children.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="4" class="text-center">No pending applicants.</td>
        `;
        tableBody.appendChild(row);
    }
}

// Function to populate participants table
function populateParticipantsTable(eventFilter = 'all') {
    const tableBody = document.querySelector('#participants-table tbody');
    tableBody.innerHTML = '';
    
    const filteredParticipants = eventFilter === 'all' 
        ? sampleParticipants 
        : sampleParticipants.filter(p => p.eventName === eventFilter);
    
    filteredParticipants.forEach(participant => {
        const row = document.createElement('tr');
        
        // Determine attendance status display
        let attendanceStatus = '';
        let pointsAwarded = 0;
        
        if (participant.attended === true) {
            attendanceStatus = '<span class="badge-attended">Participated</span>';
            pointsAwarded = eventPoints[participant.eventName];
        } else if (participant.attended === false) {
            attendanceStatus = '<span class="badge-absent">Did Not Participate</span>';
            pointsAwarded = 0;
        } else {
            attendanceStatus = '<span class="badge-pending">Pending</span>';
            pointsAwarded = '-';
        }
        
        row.innerHTML = `
            <td>
                <input type="checkbox" class="form-check-input participant-checkbox" data-id="${participant.id}">
            </td>
            <td>${participant.name}</td>
            <td>${participant.eventName}</td>
            <td>${eventPoints[participant.eventName]}</td>
            <td>${attendanceStatus}</td>
            <td>${pointsAwarded}</td>
        `;
        tableBody.appendChild(row);
    });
    
    // If no participants, show message
    if (tableBody.children.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="text-center">No participants found.</td>
        `;
        tableBody.appendChild(row);
    }
}

// Function to populate event filter dropdown
function populateEventFilter() {
    const eventFilter = document.getElementById('event-filter');
    
    // Create a set of unique event names
    const eventNames = [...new Set(sampleApplicants.map(a => a.eventName))];
    
    // Add options to the dropdown
    eventNames.forEach(eventName => {
        const option = document.createElement('option');
        option.value = eventName;
        option.textContent = eventName;
        eventFilter.appendChild(option);
    });
    
    // Add event listener for filter change
    eventFilter.addEventListener('change', function() {
        populateParticipantsTable(this.value);
    });
}

// Initialize all event listeners
function initEventListeners() {
    // Select all applicants checkbox
    document.getElementById('select-all-applicants').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.applicant-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
            toggleRowSelection(checkbox);
        });
    });
    
    // Select all participants checkbox
    document.getElementById('select-all-participants').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.participant-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
            toggleRowSelection(checkbox);
        });
    });
    
    // Individual checkbox selection (delegated event)
    document.addEventListener('change', function(event) {
        if (event.target.classList.contains('applicant-checkbox') || 
            event.target.classList.contains('participant-checkbox')) {
            toggleRowSelection(event.target);
        }
    });
    
    // Approve selected applicants button
    document.getElementById('approve-selected').addEventListener('click', approveSelectedApplicants);
    
    // Mark participation buttons
    document.getElementById('mark-participated').addEventListener('click', function() {
        markAttendance(true);
    });
    
    document.getElementById('mark-not-participated').addEventListener('click', function() {
        markAttendance(false);
    });
}

// Toggle row selection highlighting
function toggleRowSelection(checkbox) {
    const row = checkbox.closest('tr');
    if (checkbox.checked) {
        row.classList.add('selected-row');
    } else {
        row.classList.remove('selected-row');
    }
}

// Approve selected applicants
function approveSelectedApplicants() {
    const selectedCheckboxes = document.querySelectorAll('.applicant-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        alert('Please select at least one applicant to approve.');
        return;
    }
    
    // Convert selected checkboxes to an array of IDs
    const selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.getAttribute('data-id')));
    
    // Find the corresponding applicants
    const approvedApplicants = sampleApplicants.filter(a => selectedIds.includes(a.id));
    
    // Add them to participants with pending attendance
    approvedApplicants.forEach(applicant => {
        sampleParticipants.push({
            ...applicant,
            attended: null // null means pending
        });
    });
    
    // Update both tables
    populateApplicantsTable();
    populateParticipantsTable(document.getElementById('event-filter').value);
    
    // Clear select all checkbox
    document.getElementById('select-all-applicants').checked = false;
    
    // Show success message
    alert(`Successfully approved ${selectedIds.length} applicant(s).`);
}

// Mark participation/attendance
function markAttendance(participated) {
    const selectedCheckboxes = document.querySelectorAll('.participant-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        alert('Please select at least one participant to mark attendance.');
        return;
    }
    
    // Convert selected checkboxes to an array of IDs
    const selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.getAttribute('data-id')));
    
    // Update attendance status
    sampleParticipants.forEach(participant => {
        if (selectedIds.includes(participant.id)) {
            participant.attended = participated;
        }
    });
    
    // Update participants table
    populateParticipantsTable(document.getElementById('event-filter').value);
    
    // Clear select all checkbox
    document.getElementById('select-all-participants').checked = false;
    
    // Show success message
    const action = participated ? 'participated' : 'did not participate';
    alert(`Successfully marked ${selectedIds.length} participant(s) as ${action}.`);
}