<?php
header('Content-Type: application/json');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if resident is logged in
if (isset($_SESSION['resident_id'])) {
    echo json_encode([
        'success' => true,
        'resident_id' => $_SESSION['resident_id'],
        'resident_name' => $_SESSION['resident_name'] ?? '',
        'logged_in' => true
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Resident not logged in',
        'logged_in' => false
    ]);
}
?>