// Logout Button
document.getElementById('logoutBtn').addEventListener('click', function() {
    document.getElementById('dashboardPage').classList.add('d-none');
    document.getElementById('loginPage').classList.remove('d-none');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
});