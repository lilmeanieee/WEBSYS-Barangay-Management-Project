const form = document.getElementById("documentRequestForm");
const dropdown = document.getElementById("documentType");
const container = document.getElementById("customFieldsContainer"); // Use a single container

const templatesMap = {};

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

