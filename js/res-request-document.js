document.getElementById("documentRequestForm").addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Your request has been submitted! ✅");
    this.reset(); // Optional: clear form
  });