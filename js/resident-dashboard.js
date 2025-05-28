document.addEventListener("DOMContentLoaded", function () {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    fetch('../../php-handlers/get-resident-data.php',  {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `resident_id=${encodeURIComponent(userData.resident_id)}`
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const r = data.resident;

            // Set Name and Code (no fallback "Unknown" anymore)
            document.getElementById('residentName').textContent = r.name || '';
            document.getElementById('residentCode').textContent = r.resident_code || '';

            // Set Participation Stats normally
            document.getElementById('creditPoints').textContent = r.creditPointsFormatted || '0 pts';
            document.getElementById('redeemablePoints').textContent = r.redeemablePointsFormatted || '0 pts';
            document.getElementById('totalParticipated').textContent = r.totalParticipatedFormatted || '0';
        } else {
            console.error(data.error);
        }
    });

    if (userData) {
        const user = userData;

        const fullName = `${user.first_name} ${user.middle_name ?? ''} ${user.last_name}`.trim();
        document.getElementById("residentName").textContent = fullName;

        const residentId = user.resident_code;
        document.getElementById("residentCode").textContent = residentId;

        const creditPoints = parseInt(user.credit_points ?? 0);
        document.getElementById("creditPoints").textContent = creditPoints;

        const redeemable = parseInt(user.redeemable_points ?? 0);
        document.getElementById("redeemablePoints").textContent = redeemable;

        const totalParticipated = parseInt(user.total_participated ?? 0);
        document.getElementById("totalParticipated").textContent = totalParticipated;

        // Optionally display localStorage fallback for events
        if (user.total_participated) {
            document.getElementById("eventsAttended").textContent = user.total_participated;
        }
    }
});
