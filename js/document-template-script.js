// scripts.js
document.addEventListener('DOMContentLoaded', function() {
    // Sample document types data (this would typically come from a database)
    let documentTypes = [
        {
            id: 1,
            name: "Barangay Clearance",
            description: "General certification of good moral character for residents",
            fee: 50,
            requiredFields: ["Full Name", "Address", "Birthdate", "Purpose", "Civil Status"],
            template: "This is to certify that {{fullName}}, of legal age, {{civilStatus}}, and a resident of {{address}} is a person of good moral character and has no derogatory record in this barangay."
        },
        {
            id: 2,
            name: "Indigency Certificate",
            description: "Certificate proving that the resident belongs to the low-income bracket",
            fee: 0,
            requiredFields: ["Full Name", "Address", "Birthdate", "Monthly Income", "Family Size"],
            template: "This is to certify that {{fullName}}, {{age}} years old, residing at {{address}} belongs to the indigent families in this barangay with a monthly income of Php {{monthlyIncome}} supporting a family of {{familySize}} members."
        },
        {
            id: 3,
            name: "Residency Certificate",
            description: "Certificate confirming that the person is a resident of the barangay",
            fee: 50,
            requiredFields: ["Full Name", "Address", "Birthdate", "Years of Residency"],
            template: "This is to certify that {{fullName}}, {{age}} years old, is a bonafide resident of {{address}} for {{yearsOfResidency}} years."
        }
    ];

    // Initialize the table
    populateTable();

    // Add Document Type Event Listeners
    document.getElementById('addFieldBtn').addEventListener('click', addCustomField);
    document.getElementById('saveDocumentBtn').addEventListener('click', saveDocumentType);

    // Edit Document Type Event Listeners
    document.getElementById('editAddFieldBtn').addEventListener('click', function() {
        addCustomField('edit');
    });
    document.getElementById('updateDocumentBtn').addEventListener('click', updateDocumentType);

    // Delete Document Type Event Listeners
    document.getElementById('confirmDeleteBtn').addEventListener('click', deleteDocumentType);

    // Populate the table with document types
    function populateTable() {
        const tableBody = document.querySelector('#documentTypesTable tbody');
        tableBody.innerHTML = '';

        documentTypes.forEach(doc => {
            const row = document.createElement('tr');
            
            // Create required fields badges
            const fieldBadges = doc.requiredFields.map(field => {
                return `<span class="badge bg-light text-dark me-1">${field}</span>`;
            }).join('');

            row.innerHTML = `
                <td>${doc.id}</td>
                <td><strong>${doc.name}</strong></td>
                <td>${doc.description}</td>
                <td>${doc.fee === 0 ? '<span class="text-success">Free</span>' : '₱' + doc.fee.toFixed(2)}</td>
                <td>${fieldBadges}</td>
                <td>
                    <div class="action-icons">
                        <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${doc.id}">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${doc.id}">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const docId = parseInt(this.dataset.id);
                openEditModal(docId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const docId = parseInt(this.dataset.id);
                openDeleteModal(docId);
            });
        });
    }

    // Add a custom field to the form
    function addCustomField(mode = 'add') {
        const container = mode === 'edit' ? document.getElementById('editAdditionalFields') : document.getElementById('additionalFields');
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'custom-field';
        
        fieldDiv.innerHTML = `
            <input type="text" class="form-control me-2" placeholder="Field Name" required>
            <div class="form-check form-switch me-2">
                <input class="form-check-input" type="checkbox" role="switch" checked>
                <label class="form-check-label">Required</label>
            </div>
            <button type="button" class="btn btn-outline-danger btn-sm remove-field">
                <i class="bi bi-x"></i>
            </button>
        `;
        
        container.appendChild(fieldDiv);
        
        // Add event listener to remove button
        fieldDiv.querySelector('.remove-field').addEventListener('click', function() {
            container.removeChild(fieldDiv);
        });
    }

    // Save new document type
    function saveDocumentType() {
        const name = document.getElementById('documentName').value.trim();
        const description = document.getElementById('documentDescription').value.trim();
        const fee = parseFloat(document.getElementById('documentFee').value);
        const template = document.getElementById('documentTemplate').value.trim();
        
        // Validate inputs
        if (!name) {
            alert('Document name is required');
            return;
        }
        
        // Get custom fields
        const customFields = [];
        document.querySelectorAll('#additionalFields .custom-field').forEach(field => {
            const fieldName = field.querySelector('input[type="text"]').value.trim();
            if (fieldName) {
                customFields.push(fieldName);
            }
        });
        
        // Create required fields array (default + custom fields)
        const requiredFields = ['Full Name', 'Address', 'Birthdate', ...customFields];
        
        // Create new document type
        const newDocType = {
            id: documentTypes.length > 0 ? Math.max(...documentTypes.map(doc => doc.id)) + 1 : 1,
            name,
            description,
            fee,
            requiredFields,
            template
        };
        
        // Add to array
        documentTypes.push(newDocType);
        
        // Refresh table
        populateTable();
        
        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addDocumentModal'));
        modal.hide();
        document.getElementById('addDocumentForm').reset();
        document.getElementById('additionalFields').innerHTML = '';
        
        // Show success message
        showAlert('success', `Document type "${name}" has been added successfully.`);
    }

    // Open edit modal and populate with document data
    function openEditModal(docId) {
        const doc = documentTypes.find(d => d.id === docId);
        if (!doc) return;
        
        // Set form values
        document.getElementById('editDocumentId').value = doc.id;
        document.getElementById('editDocumentName').value = doc.name;
        document.getElementById('editDocumentDescription').value = doc.description;
        document.getElementById('editDocumentFee').value = doc.fee;
        document.getElementById('editDocumentTemplate').value = doc.template;
        
        // Clear and populate custom fields
        const customFieldsContainer = document.getElementById('editAdditionalFields');
        customFieldsContainer.innerHTML = '';
        
        // Add custom fields (exclude default fields)
        const defaultFields = ['Full Name', 'Address', 'Birthdate'];
        const customFields = doc.requiredFields.filter(field => !defaultFields.includes(field));
        
        customFields.forEach(field => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'custom-field';
            
            fieldDiv.innerHTML = `
                <input type="text" class="form-control me-2" placeholder="Field Name" value="${field}" required>
                <div class="form-check form-switch me-2">
                    <input class="form-check-input" type="checkbox" role="switch" checked>
                    <label class="form-check-label">Required</label>
                </div>
                <button type="button" class="btn btn-outline-danger btn-sm remove-field">
                    <i class="bi bi-x"></i>
                </button>
            `;
            
            customFieldsContainer.appendChild(fieldDiv);
            
            // Add event listener to remove button
            fieldDiv.querySelector('.remove-field').addEventListener('click', function() {
                customFieldsContainer.removeChild(fieldDiv);
            });
        });
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editDocumentModal'));
        modal.show();
    }

    // Update document type
    function updateDocumentType() {
        const id = parseInt(document.getElementById('editDocumentId').value);
        const name = document.getElementById('editDocumentName').value.trim();
        const description = document.getElementById('editDocumentDescription').value.trim();
        const fee = parseFloat(document.getElementById('editDocumentFee').value);
        const template = document.getElementById('editDocumentTemplate').value.trim();
        
        // Validate inputs
        if (!name) {
            alert('Document name is required');
            return;
        }
        
        // Get custom fields
        const customFields = [];
        document.querySelectorAll('#editAdditionalFields .custom-field').forEach(field => {
            const fieldName = field.querySelector('input[type="text"]').value.trim();
            if (fieldName) {
                customFields.push(fieldName);
            }
        });
        
        // Create required fields array (default + custom fields)
        const requiredFields = ['Full Name', 'Address', 'Birthdate', ...customFields];
        
        // Find document index
        const docIndex = documentTypes.findIndex(d => d.id === id);
        if (docIndex === -1) return;
        
        // Update document
        documentTypes[docIndex] = {
            id,
            name,
            description,
            fee,
            requiredFields,
            template
        };
        
        // Refresh table
        populateTable();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editDocumentModal'));
        modal.hide();
        
        // Show success message
        showAlert('success', `Document type "${name}" has been updated successfully.`);
    }

    // Open delete confirmation modal
    function openDeleteModal(docId) {
        const doc = documentTypes.find(d => d.id === docId);
        if (!doc) return;
        
        // Set document name in modal
        document.getElementById('deleteDocumentName').textContent = doc.name;
        
        // Store document ID for deletion
        document.getElementById('confirmDeleteBtn').dataset.id = docId;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
        modal.show();
    }

    // Delete document type
    function deleteDocumentType() {
        const docId = parseInt(this.dataset.id);
        const docIndex = documentTypes.findIndex(d => d.id === docId);
        
        if (docIndex === -1) return;
        
        // Store name for success message
        const docName = documentTypes[docIndex].name;
        
        // Remove document from array
        documentTypes.splice(docIndex, 1);
        
        // Refresh table
        populateTable();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
        modal.hide();
        
        // Show success message
        showAlert('danger', `Document type "${docName}" has been deleted.`);
    }

    // Show alert message
    function showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.setAttribute('role', 'alert');
        
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Insert at the top of the container
        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alertDiv);
            bsAlert.close();
        }, 3000);
    }
});