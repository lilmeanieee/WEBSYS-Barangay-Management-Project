document.addEventListener('DOMContentLoaded', function () {
    const isLoggedIn = true; // Simulate login state

    const loginBtn = document.getElementById('loginBtn');
    const userDropdown = document.getElementById('userDropdown');

    if (isLoggedIn) {
        loginBtn.classList.add('d-none');
        userDropdown.classList.remove('d-none');
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            alert('Logging out...');
            loginBtn.classList.remove('d-none');
            userDropdown.classList.add('d-none');
        });
    }
});
