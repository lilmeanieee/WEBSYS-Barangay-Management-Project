<?php
include 'connect.php';
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

try {
    $residentName = $_POST['fullName'] ?? '';
    $templateId = $_POST['documentType'] ?? '';
    $purpose = $_POST['purpose'] ?? '';
    $customFields = json_decode($_POST['custom_fields'] ?? '{}', true);

    if (!$residentName || !$templateId || !$purpose) {
        throw new Exception("Missing required fields.");
    }

    // 1. Insert into tbl_document_requests
    $stmt = $conn->prepare("INSERT INTO tbl_document_requests (resident_name, template_id, purpose, status) VALUES (?, ?, ?, 'Pending')");
    $stmt->bind_param("sis", $residentName, $templateId, $purpose);
    $stmt->execute();
    $requestId = $stmt->insert_id;
    $stmt->close();

    // 2. Insert custom fields
    if (!empty($customFields)) {
        $stmt = $conn->prepare("INSERT INTO tbl_request_field_values (request_id, field_key, field_value) VALUES (?, ?, ?)");
        foreach ($customFields as $key => $value) {
            $stmt->bind_param("iss", $requestId, $key, $value);
            $stmt->execute();
        }
        $stmt->close();
    }

    // 3. Handle file uploads
    $uploadDir = __DIR__ . '/../uploads/document_requests/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true); // create directory if it doesn't exist
    }

    if (!empty($_FILES['supportingDocs']['name'][0])) {
        $stmt = $conn->prepare("INSERT INTO tbl_document_request_attachments (request_id, file_name, file_path) VALUES (?, ?, ?)");

        foreach ($_FILES['supportingDocs']['name'] as $index => $filename) {
            $tmpName = $_FILES['supportingDocs']['tmp_name'][$index];
            $safeFilename = time() . '_' . basename($filename);
            $targetPath = $uploadDir . $safeFilename;
            $relativePath = 'uploads/document_requests/' . $safeFilename;

            if (move_uploaded_file($tmpName, $targetPath)) {
                $stmt->bind_param("iss", $requestId, $filename, $relativePath);
                $stmt->execute();
            }
        }

        $stmt->close();
    }

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
