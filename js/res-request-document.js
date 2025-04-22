document.getElementById("documentRequestForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  // Collect dynamically added custom fields
  const customFields = {};
  document.querySelectorAll('.custom-field input').forEach(input => {
    const key = input.dataset.key;
    if (key) customFields[key] = input.value;
  });
  formData.append("custom_fields", JSON.stringify(customFields));

  fetch("/ORENJCHOCO-Barangay-Management-Project/php-handlers/submit-document-request.php", {
    method: "POST",
    body: formData,
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Request submitted successfully ✅");
        form.reset();
        document.getElementById("customFieldsContainer").innerHTML = "";
      } else {
        alert("Error: " + (data.error || "Something went wrong."));
      }
    })
    .catch(err => {
      console.error("Submission error:", err);
      alert("Failed to submit request.");
    });
});
