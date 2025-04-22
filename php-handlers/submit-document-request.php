<?php
include 'connect.php';

header('Content-Type: application/json');

// Validate required fields
if (!isset($_POST['resident_name'], $_POST['template_id'], $_POST['purpose'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields."]);
    exit;
}

$resident_name = trim($_POST['resident_name']);
$template_id = intval($_POST['template_id']);
$purpose = trim($_POST['purpose']);

// Insert main request
$requestSql = "INSERT INTO tbl_document_requests (resident_name, template_id, purpose, status) VALUES (?, ?, ?, 'Pending')";
$stmt = $conn->prepare($requestSql);
$stmt->bind_param("sis", $resident_name, $template_id, $purpose);
$stmt->execute();

$request_id = $stmt->insert_id;
$stmt->close();

// Insert custom fields if provided
if (isset($_POST['custom_fields']) && is_array($_POST['custom_fields'])) {
    $fieldSql = "INSERT INTO tbl_request_field_values (request_id, field_key, field_value) VALUES (?, ?, ?)";
    $stmtField = $conn->prepare($fieldSql);

    foreach ($_POST['custom_fields'] as $field_key => $field_value) {
        $stmtField->bind_param("iss", $request_id, $field_key, $field_value);
        $stmtField->execute();
    }
    $stmtField->close();
}

// Handle file upload if any
if (isset($_FILES['supporting_file']) && $_FILES['supporting_file']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = "../uploads/document_requests/";
    $originalName = basename($_FILES['supporting_file']['name']);
    $uniqueName = uniqid("doc_", true) . "_" . $originalName;
    $targetPath = $uploadDir . $uniqueName;

    if (move_uploaded_file($_FILES['supporting_file']['tmp_name'], $targetPath)) {
        // Save file info to DB
        $fileSql = "INSERT INTO tbl_request_attachments (request_id, file_name, file_path) VALUES (?, ?, ?)";
        $stmtFile = $conn->prepare($fileSql);
        $stmtFile->bind_param("iss", $request_id, $originalName, $targetPath);
        $stmtFile->execute();
        $stmtFile->close();
    }
}

echo json_encode(["success" => true, "request_id" => $request_id]);
