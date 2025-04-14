document.addEventListener("DOMContentLoaded", function () {
    function checkLoginStatus() {
        const userData = localStorage.getItem('userData');
    
        if (userData) {
            const user = JSON.parse(userData);
            document.getElementById('loginButton').style.display = 'none';
            document.getElementById('userDropdown').style.display = 'block';
    
            // ✅ Update user info with labels
            document.getElementById('userName').innerHTML =
                `Resident ID: <strong>${user.resident_id}</strong><br>
                 Name: <strong>${user.name}</strong><br>
                 Experience Pts: <strong>${user.xp}</strong><br>
                 Redeemable Pts: <strong>${user.points}</strong>`;
    
            const xpElement = document.getElementById('xpPoints');
            const redeemElement = document.getElementById('redeemablePoints');
    
            if (user.role === "Resident") {
                if (xpElement) xpElement.textContent = user.xp ?? 0;
                if (redeemElement) redeemElement.textContent = user.points ?? 0;
    
                const idElement = document.getElementById('residentId');
                if (idElement) idElement.textContent = user.resident_id ?? '';
            }
        } else {
            document.getElementById('loginButton').style.display = 'block';
            document.getElementById('userDropdown').style.display = 'none';
        }
    }
    

    // ✅ Logout button
    document.getElementById('logoutButton').addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('userData');
        window.location.href = '../html/home.html';
    });

    checkLoginStatus();
});

// ✅ For testing only
function simulateLogin() {
    const demoUser = {
        name: 'Juan Dela Cruz',
        xp: 120,
        points: 20,
        role: 'Resident'
    };
    localStorage.setItem('userData', JSON.stringify(demoUser));
    location.reload();
}
