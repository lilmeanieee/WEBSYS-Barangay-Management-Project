document.addEventListener('DOMContentLoaded', function() {
    // Set the leaderboard period to Monthly by default
    const dropdownFilter = document.querySelector('.dropdown-filter');
    dropdownFilter.value = 'Monthly';
    
    // Add event listener to handle period changes
    dropdownFilter.addEventListener('change', function() {
        const selectedPeriod = this.value;
        console.log(`Leaderboard period changed to: ${selectedPeriod}`);
        // Here you would typically fetch new data based on the selected period
        // and update the leaderboard display
    });
    
    // Make the right table content scrollable
    const contributorsTable = document.querySelector('.contributors-table-content');
    contributorsTable.style.maxHeight = 'calc(100vh - 200px)';
    contributorsTable.style.overflowY = 'auto';
});