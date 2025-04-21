<?php
include 'connect.php';

// Get the raw POST body and decode JSON
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid input"]);
    exit;
}

$name = $data['name'];
$description = $data['description'];
$fee = $data['fee'];
$templateText = $data['template_text'];
$fields = $data['fields']; // array of { field_key, label, is_required }

mysqli_begin_transaction($conn);

try {
    // Insert the document template
    $stmt = mysqli_prepare($conn, "INSERT INTO tbl_document_templates (name, description, fee, template_text) VALUES (?, ?, ?, ?)");
    mysqli_stmt_bind_param($stmt, "ssds", $name, $description, $fee, $templateText);
    mysqli_stmt_execute($stmt);
    $templateId = mysqli_insert_id($conn);
    mysqli_stmt_close($stmt);

    // Insert each field
    $stmtField = mysqli_prepare($conn, "INSERT INTO tbl_document_template_custom_fields (template_id, field_key, label, is_required) VALUES (?, ?, ?, ?)");
    foreach ($fields as $field) {
        $fieldKey = $field['field_key'];
        $label = $field['label'];
        $isRequired = $field['is_required'] ? 1 : 0;

        mysqli_stmt_bind_param($stmtField, "issi", $templateId, $fieldKey, $label, $isRequired);
        mysqli_stmt_execute($stmtField);
    }
    mysqli_stmt_close($stmtField);

    mysqli_commit($conn);
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    mysqli_rollback($conn);
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
