// scripts.js
document.addEventListener('DOMContentLoaded', function() {
    // Sample document types data (this would typically come from a database)

    let documentTypes = [];

    function fetchDocumentTemplates() {
        fetch('/ORENJCHOCO-Barangay-Management-Project/php-handlers/get-templates.php')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    documentTypes = data;
                    populateTable();
                } else {
                    showAlert('danger', 'Failed to load templates from server.');
                    console.error("Server response error:", data);
                }
            })
            .catch(err => {
                console.error('Fetch error:', err);
                showAlert('danger', 'Failed to fetch templates.');
            });
    }
    

    // Initialize the table
    fetchDocumentTemplates();   

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
    
        if (!name) {
            alert('Document name is required');
            return;
        }
    
        // Build custom fields array
        const customFields = [];
        document.querySelectorAll('#additionalFields .custom-field').forEach(field => {
            const labelInput = field.querySelector('input[type="text"]');
            const requiredSwitch = field.querySelector('input[type="checkbox"]');
            const label = labelInput.value.trim();
    
            if (label) {
                const field_key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                customFields.push({
                    field_key: field_key,
                    label: label,
                    is_required: requiredSwitch.checked
                });
            }
        });
    
        // Prepare JSON payload
        const payload = {
            name: name,
            description: description,
            fee: fee,
            template_text: template,
            fields: customFields
        };

        console.log("Payload to send:", payload);

    
        // Send data to backend
        fetch('/ORENJCHOCO-Barangay-Management-Project/php-handlers/add-template.php', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(res => {
            console.log("Raw response:", res);
            return res.json();
        })
        .then(response => {
            console.log("Parsed JSON response:", response);
            if (response.success) {
                showAlert('success', `Document type "${name}" has been saved successfully.`);
                const modal = bootstrap.Modal.getInstance(document.getElementById('addDocumentModal'));
                modal.hide();
                document.getElementById('addDocumentForm').reset();
                document.getElementById('additionalFields').innerHTML = '';
            } else {
                console.warn("Backend responded with error:", response);
                showAlert('danger', response.error || 'Something went wrong.');
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            showAlert('danger', 'Failed to communicate with the server.');
        });
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
      
        if (!name) {
          alert('Document name is required');
          return;
        }
      
        // Build updated fields array
        const updatedFields = [];
        document.querySelectorAll('#editAdditionalFields .custom-field').forEach(field => {
          const labelInput = field.querySelector('input[type="text"]');
          const requiredSwitch = field.querySelector('input[type="checkbox"]');
          const label = labelInput.value.trim();
      
          if (label) {
            const field_key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
            updatedFields.push({
              field_key: field_key,
              label: label,
              is_required: requiredSwitch.checked
            });
          }
        });
      
        const payload = {
          id,
          name,
          description,
          fee,
          template_text: template,
          fields: updatedFields
        };
      
        console.log("Updating template:", payload); // Optional debug
      
        fetch('/ORENJCHOCO-Barangay-Management-Project/php-handlers/update-template.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
          .then(res => res.json())
          .then(response => {
            if (response.success) {
              showAlert('success', `Document type "${name}" has been updated successfully.`);
      
              // Refresh table (refetch from DB)
              fetchDocumentTemplates();
      
              // Close modal
              const modal = bootstrap.Modal.getInstance(document.getElementById('editDocumentModal'));
              modal.hide();
            } else {
              showAlert('danger', response.error || 'Update failed.');
            }
          })
          .catch(err => {
            console.error('Update error:', err);
            showAlert('danger', 'Failed to update template.');
          });
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