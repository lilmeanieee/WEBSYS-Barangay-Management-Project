document.addEventListener("DOMContentLoaded", function() {
    // Check if user is logged in
    // This is a simplified example - you would typically check session/local storage or make an API call
    function checkLoginStatus() {
        // Example: Check if user data exists in localStorage
        const userData = localStorage.getItem('userData');
        
        if (userData) {
            // User is logged in
            const user = JSON.parse(userData);
            document.getElementById('userName').textContent = user.name;
            
        } else {
            // User is not logged in
            document.getElementById('loginButton').style.display = 'block';
            document.getElementById('userDropdown').style.display = 'none';
        }
    }
    
    // Handle logout
    document.getElementById('logoutButton').addEventListener('click', function(e) {
        e.preventDefault();
        // Clear user data
        localStorage.removeItem('userData');
        // Redirect to home or login page
        window.location.href = '../html/home.html';
    });
    
    // Check login status when page loads
    checkLoginStatus();
});

