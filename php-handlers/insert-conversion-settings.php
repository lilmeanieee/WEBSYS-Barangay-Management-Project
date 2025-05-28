<?php
include 'connect.php';
header('Content-Type: application/json');

$credit_points = $_POST['credit_points'] ?? null;
$redeemable_points = $_POST['redeemable_points'] ?? null;
$minimum_points_required = $_POST['minimum_points_required'] ?? null;

if (!$credit_points || !$redeemable_points || !$minimum_points_required) {
    echo json_encode(["success" => false, "message" => "Missing fields."]);
    exit;
}

// Insert into the tbl_conversion_settings
$stmt = $conn->prepare("INSERT INTO tbl_conversion_settings (credit_points, redeemable_points, minimum_points_required) VALUES (?, ?, ?)");
$stmt->bind_param("ddd", $credit_points, $redeemable_points, $minimum_points_required);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Conversion settings saved successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to save settings."]);
}
?>
