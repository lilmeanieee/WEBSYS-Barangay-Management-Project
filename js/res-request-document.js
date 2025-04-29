document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("documentRequestForm");
  const dropdown = document.getElementById("documentType");
  const fullNameInput = document.getElementById("fullName");
  const customFieldsContainer = document.getElementById("customFieldsContainer");
  const templatesMap = {};

  // 🔵 1. Fetch Resident Full Name
  fetch("/ORENJCHOCO-Barangay-Management-Project/php-handlers/get-resident-name.php")
    .then(res => res.json())
    .then(data => {
      if (data.fullName) {
        fullNameInput.value = data.fullName;
        localStorage.setItem('residentId', data.residentId); // Save for form submission
      } else {
        console.error("Failed to load resident name:", data.error);
      }
    })
    .catch(err => {
      console.error("Error fetching resident name:", err);
    });

  // 🔵 2. Load Document Templates into Dropdown
  fetch("/ORENJCHOCO-Barangay-Management-Project/php-handlers/get-templates.php")
    .then(res => res.json())
    .then(templates => {
      dropdown.innerHTML = '<option value="" disabled selected>Choose a document type</option>';
      templates.forEach(template => {
        templatesMap[template.id] = template;

        const option = document.createElement("option");
        option.value = template.id;           // VALUE: template ID (important for backend)
        option.textContent = template.name;   // TEXT: template name (display to user)
        dropdown.appendChild(option);
      });
    })
    .catch(err => {
      console.error("Error loading templates:", err);
    });

  // 🔵 3. Generate Custom Fields When Template is Selected
  dropdown.addEventListener("change", (e) => {
    const selected = templatesMap[e.target.value];
    customFieldsContainer.innerHTML = "";

    selected?.customFields?.forEach(field => {
      const wrapper = document.createElement("div");
      wrapper.classList.add("mb-3", "custom-field");

      wrapper.innerHTML = `
        <label class="form-label">${field.label}${field.is_required ? ' *' : ''}</label>
        <input type="text" class="form-control" data-key="${field.field_key}" ${field.is_required ? 'required' : ''} />
      `;

      customFieldsContainer.appendChild(wrapper);
    });
  });

  // 🔵 4. Handle Form Submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(form);

    // Collect custom fields into JSON
    const customFields = {};
    document.querySelectorAll('.custom-field input').forEach(input => {
      const key = input.dataset.key;
      if (key) customFields[key] = input.value;
    });
    formData.append("custom_fields", JSON.stringify(customFields));

    // Attach residentId into FormData
    const residentId = localStorage.getItem('residentId') || '';
    formData.append("residentId", residentId);

    fetch("/ORENJCHOCO-Barangay-Management-Project/php-handlers/submit-document-request.php", {
      method: "POST",
      body: formData
    })
    .then(async res => {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        if (json.success) {
          // Success: Redirect to home.html after 1 second (optional slight delay)
          alert("Document request submitted successfully!");
          setTimeout(() => {
            window.location.href = "/ORENJCHOCO-Barangay-Management-Project/html/home.html"; 
          }, 1000); // 1 second delay so they can see the alert before redirect
      } else {
          alert("Error: " + json.error);
      }
      } catch {
        console.error("Response was not valid JSON:\n", text);
        alert("Invalid response received.");
      }
    })
    .catch(err => {
      console.error("Submission error:", err);
      alert("Failed to submit request. Please try again.");
    });
  });
});
