<?php
require_once 'connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $residentId = $_POST['resident_id'] ?? '';
    $volunteerId = $_POST['volunteer_announcement_id'] ?? '';

    if ($residentId && $volunteerId) {
        $stmt = $pdo->prepare("INSERT INTO tbl_joiners (resident_id, volunteer_announcement_id, status) VALUES (?, ?, 'Joined')");
        $stmt->execute([$residentId, $volunteerId]);
        echo "Success";
    } else {
        echo "Missing parameters.";
    }
} else {
    echo "Invalid request method.";
}
