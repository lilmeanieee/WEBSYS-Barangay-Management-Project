<?php
include 'connect.php';

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

try {
    $residentName = $_POST['fullName'];
    $templateId = $_POST['documentType'];
    $purpose = $_POST['purpose'];
    $customFields = json_decode($_POST['custom_fields'], true);

    // 1. Insert into tbl_document_requests
    $stmt = $conn->prepare("INSERT INTO tbl_document_requests (resident_name, template_id, purpose, status) VALUES (?, ?, ?, 'Pending')");
    $stmt->bind_param("sis", $residentName, $templateId, $purpose);
    if (!$stmt->execute()) {
        throw new Exception("Failed to insert document request: " . $stmt->error);
    }

    $requestId = $stmt->insert_id; // get new request ID
    $stmt->close();

    // 2. Insert custom fields into tbl_request_field_values
    if (!empty($customFields)) {
        $stmt = $conn->prepare("INSERT INTO tbl_request_field_values (request_id, field_key, field_value) VALUES (?, ?, ?)");

        foreach ($customFields as $key => $value) {
            $stmt->bind_param("iss", $requestId, $key, $value);
            if (!$stmt->execute()) {
                throw new Exception("Failed to insert custom field: " . $stmt->error);
            }
        }

        $stmt->close();
    }

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
