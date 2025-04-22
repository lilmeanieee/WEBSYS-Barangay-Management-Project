document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("documentRequestForm");
  const dropdown = document.getElementById("documentType");
  const customFieldsContainer = document.getElementById("customFieldsContainer");

  const templatesMap = {};

  // Load templates
  fetch("/ORENJCHOCO-Barangay-Management-Project/php-handlers/get-templates.php")
    .then(res => res.json())
    .then(templates => {
      dropdown.innerHTML = '<option value="" disabled selected>Choose a document type</option>';
      templates.forEach(template => {
        if (!templatesMap[template.id]) {
          templatesMap[template.id] = template;

          const option = document.createElement("option");
          option.value = template.id;
          option.textContent = template.name;
          dropdown.appendChild(option);
        }
      });
    })
    .catch(err => console.error("Failed to load templates:", err));

  // Handle dropdown change to show custom fields
  dropdown.addEventListener("change", (e) => {
    const selectedId = e.target.value;
    const selectedTemplate = templatesMap[selectedId];
    customFieldsContainer.innerHTML = "";

    if (selectedTemplate && selectedTemplate.customFields.length > 0) {
      selectedTemplate.customFields.forEach(field => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("mb-3", "custom-field");

        const label = document.createElement("label");
        label.classList.add("form-label");
        label.textContent = field.label + (field.is_required ? " *" : "");

        const input = document.createElement("input");
        input.type = "text";
        input.classList.add("form-control");
        input.required = field.is_required;
        input.name = field.field_key;
        input.dataset.key = field.field_key;

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        customFieldsContainer.appendChild(wrapper);
      });
    }
  });

  // Handle form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(form);

    // Collect custom fields
    const customFields = {};
    document.querySelectorAll('.custom-field input').forEach(input => {
      const key = input.dataset.key;
      if (key) {
        customFields[key] = input.value;
      }
    });
    formData.append("custom_fields", JSON.stringify(customFields));

    // Submit to backend
    fetch("/ORENJCHOCO-Barangay-Management-Project/php-handlers/submit-document-request.php", {
      method: "POST",
      body: formData,
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("✅ Document request submitted successfully!");
        form.reset();
        customFieldsContainer.innerHTML = "";
      } else {
        alert("❌ Error: " + (data.error || "Something went wrong."));
      }
    })
    .catch(err => {
      console.error("Submission error:", err);
      alert("❌ Failed to submit request.");
    });
  });
});
