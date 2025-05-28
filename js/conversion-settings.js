document.addEventListener('DOMContentLoaded', function () {
    fetchCurrentSettings();

    document.getElementById('conversionForm').addEventListener('submit', function (e) {
        e.preventDefault();
        saveSettings();
    });

    document.getElementById('thresholdForm').addEventListener('submit', function (e) {
        e.preventDefault();
        saveSettings();
    });
});

function saveSettings() {
    const creditPoints = document.getElementById('creditInput').value;
    const redeemPoints = document.getElementById('redeemInput').value;
    const minThreshold = document.getElementById('minThreshold').value;

    const formData = new FormData();
    formData.append('credit_points', creditPoints);
    formData.append('redeemable_points', redeemPoints);
    formData.append('minimum_points_required', minThreshold);

    fetch('http://localhost/WEBSYS-Barangay-Management-Project/php-handlers/insert-conversion-settings.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            fetchCurrentSettings();
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Something went wrong while saving settings.");
    });
}

function fetchCurrentSettings() {
    fetch('http://localhost/WEBSYS-Barangay-Management-Project/php-handlers/get-conversion-settings.php')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const info = document.createElement('div');
                info.classList.add('alert', 'alert-info', 'mb-4');
                info.innerHTML = `
                    <strong>Current Conversion:</strong> ${data.settings.credit_points} credit = ${data.settings.redeemable_points} redeemable <br>
                    <strong>Minimum Credit Points Required:</strong> ${data.settings.minimum_points_required}
                `;

                const container = document.querySelector('.container.mt-4.px-5');
                container.insertBefore(info, container.firstChild);
            }
        })
        .catch(error => {
            console.error("Error fetching settings:", error);
        });
}
