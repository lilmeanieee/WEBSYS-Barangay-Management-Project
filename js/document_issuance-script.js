const certificateTemplates = {
    residency: `
      <h3 class="text-center">Certificate of Residency</h3>
      <p>This is to certify that <strong>[Full Name]</strong> is a bonafide resident of <strong>[Barangay Name]</strong>, residing at <strong>[Address]</strong> since <strong>[Date]</strong>.</p>
      <p>This certificate is issued upon the request of the interested party for whatever legal purpose it may serve.</p>
      <p class="mt-4">Issued this <strong>[Date Today]</strong> at <strong>[Barangay Hall Address]</strong>.</p>
      <br><br>
      <p><strong>Barangay Captain's Name</strong><br>Barangay Captain</p>
    `,
    indigency: `
      <h3 class="text-center">Certificate of Indigency</h3>
      <p>This is to certify that <strong>[Full Name]</strong>, a resident of <strong>[Address]</strong>, is considered an indigent as per the records of <strong>[Barangay Name]</strong>.</p>
      <p>This certificate is issued for the purpose of <strong>[Purpose]</strong>.</p>
      <p class="mt-4">Issued this <strong>[Date Today]</strong>.</p>
      <br><br>
      <p><strong>Barangay Captain's Name</strong><br>Barangay Captain</p>
    `,
    clearance: `
      <h3 class="text-center">Barangay Clearance</h3>
      <p>This is to certify that <strong>[Full Name]</strong> of <strong>[Address]</strong> has no derogatory record or pending case in this barangay.</p>
      <p>This clearance is issued upon request for <strong>[Purpose]</strong>.</p>
      <p class="mt-4">Issued on <strong>[Date Today]</strong> at <strong>[Barangay Hall Address]</strong>.</p>
      <br><br>
      <p><strong>Barangay Captain's Name</strong><br>Barangay Captain</p>
    `
  };

  function loadCertificate() {
    const selected = document.getElementById("certificateType").value;
    document.getElementById("certificate-content").innerHTML = certificateTemplates[selected];
  }

  // Load default on page load
  window.onload = loadCertificate;