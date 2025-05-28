<?php
include 'connect.php';
header('Content-Type: application/json');

// Get the latest setting
$result = $conn->query("SELECT credit_points, redeemable_points, minimum_points_required FROM tbl_conversion_settings ORDER BY created_at DESC LIMIT 1");

if ($row = $result->fetch_assoc()) {
    echo json_encode(["success" => true, "settings" => $row]);
} else {
    echo json_encode(["success" => false, "message" => "No settings found."]);
}
?>
