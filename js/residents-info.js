document.addEventListener("DOMContentLoaded", function () {
    fetchResidents();
});

// Function to add a new resident dynamically in alphabetical order
window.addNewResident = function(residentData) {
    let tableBody = document.getElementById("residentTableBody");
    if (!tableBody) {
        console.error("residentTableBody not found!");
        return;
    }

    let newRow = document.createElement("tr");
    newRow.innerHTML = 
        `<td>${residentData.last_name}</td>
        <td>${residentData.first_name}</td>
        <td>${residentData.middle_name}</td>
        <td>${residentData.gender}</td>
        <td>${residentData.address}</td>
        <td>${residentData.mobile_no}</td>
        <td>${residentData.status}</td>
        <td>
            <button class="btn btn-info">View</button>
            <button class="btn btn-primary">Edit</button>
        </td>`;

    // Insert newRow in the correct sorted position
    let rows = Array.from(tableBody.getElementsByTagName("tr"));
    let inserted = false;

    for (let row of rows) {
        // Get the last name from the current row
        let rowLastName = row.cells[0].textContent.trim().toLowerCase();
        // Get the last name from the new resident data
        let newLastName = residentData.last_name.trim().toLowerCase(); // <-- Use residentData.last_name
    
        // Compare and insert the new row if needed
        if (newLastName < rowLastName) {
            tableBody.insertBefore(newRow, row);
            inserted = true;
            break;
        }
    }
    
    if (!inserted) {
        tableBody.appendChild(newRow);
    }


};

// âœ… Fetch residents and update table
function fetchResidents() {
    $.ajax({
        url: "http://localhost/Brgy-Ligaya-Management-Systemased-/handlers_php/fetch-residents.php",
        type: "GET",
        dataType: "json",
        success: function (data) {
            let table = document.getElementById("residentTableBody");
            table.innerHTML = ""; // Clear existing rows before updating

            // Sort by last_name, first_name, middle_name
            data.sort((a, b) => {
                // First compare by last_name
                let lastNameCompare = a.last_name.toLowerCase().localeCompare(b.last_name.toLowerCase());
                if (lastNameCompare !== 0) return lastNameCompare;

                // If last names are equal, compare by first_name
                let firstNameCompare = a.first_name.toLowerCase().localeCompare(b.first_name.toLowerCase());
                if (firstNameCompare !== 0) return firstNameCompare;

                // If first names are also equal, compare by middle_name
                return a.middle_name.toLowerCase().localeCompare(b.middle_name.toLowerCase());
            });

            // Add residents to table dynamically
            data.forEach(resident => {
                addNewResident(resident);
            });
        },
        error: function (xhr, status, error) {
            console.error("Fetch Error:", xhr.responseText);
        }
    });
    console.log("residents-list.js loaded");
}