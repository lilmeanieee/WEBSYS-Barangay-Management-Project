document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("documentRequestForm");
  const select = document.getElementById("documentType");
  const container = document.getElementById("templateFields");

  // 1. Load templates and populate dropdown
  fetch("/ORENJCHOCO-Barangay-Management-Project/php-handlers/get-templates.php")
    .then((res) => res.json())
    .then((templates) => {
      templates
        .filter(t => !t.is_archived)
        .forEach((template) => {
          const option = document.createElement("option");
          option.value = template.id;
          option.textContent = template.name;
          option.dataset.fields = JSON.stringify(template.customFields || []);
          select.appendChild(option);
        });
    })
    .catch((err) => {
      console.error("Failed to load templates:", err);
    });

  // 2. Generate custom fields when a document is selected
  select.addEventListener("change", function () {
    const selectedOption = this.selectedOptions[0];
    const fields = JSON.parse(selectedOption.dataset.fields || "[]");
    container.innerHTML = "";

    fields.forEach((field) => {
      const inputGroup = document.createElement("div");
      inputGroup.className = "mb-3 custom-field";
      inputGroup.innerHTML = `
        <label class="form-label">${field.label}${field.is_required ? " *" : ""}</label>
        <input type="text" name="${field.field_key}" data-key="${field.field_key}" class="form-control" ${field.is_required ? "required" : ""}>
      `;
      container.appendChild(inputGroup);
    });
  });

  // 3. Handle form submission (currently just alerts and resets)
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Your request has been submitted! ✅");
    form.reset();
    container.innerHTML = ""; // Clear dynamic fields
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("documentType");
  const customFieldsContainer = document.getElementById("customFieldsContainer");

  let templatesMap = {}; // Store all templates keyed by ID

  fetch("/ORENJCHOCO-Barangay-Management-Project/php-handlers/get-templates.php")
    .then(res => res.json())
    .then(templates => {
      templates.forEach(template => {
        // Populate dropdown
        const option = document.createElement("option");
        option.value = template.id;
        option.textContent = template.name;
        dropdown.appendChild(option);

        // Store template data
        templatesMap[template.id] = template;
      });
    })
    .catch(err => console.error("Failed to load templates:", err));

  dropdown.addEventListener("change", (e) => {
    const selectedId = e.target.value;
    const selectedTemplate = templatesMap[selectedId];

    customFieldsContainer.innerHTML = "";

    if (selectedTemplate && selectedTemplate.customFields.length > 0) {
      selectedTemplate.customFields.forEach(field => {
        const fieldWrapper = document.createElement("div");
        fieldWrapper.classList.add("mb-3", "custom-field");

        const label = document.createElement("label");
        label.classList.add("form-label");
        label.textContent = field.label;

        const input = document.createElement("input");
        input.type = "text";
        input.classList.add("form-control");
        input.required = field.is_required;
        input.dataset.key = field.field_key;

        fieldWrapper.appendChild(label);
        fieldWrapper.appendChild(input);
        customFieldsContainer.appendChild(fieldWrapper);
      });
    }
  });
});

