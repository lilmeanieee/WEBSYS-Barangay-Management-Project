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
