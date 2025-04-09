document.addEventListener('DOMContentLoaded', function () {
    // Only activate popovers if screen is small
    if (window.innerWidth <= 576) {
        let popoverTriggerList = [].slice.call(document.querySelectorAll('.mobile-popover'))
        popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl)
        })
    }
});