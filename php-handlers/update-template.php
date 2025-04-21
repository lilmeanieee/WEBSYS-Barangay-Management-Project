<?php
include 'connect.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id'], $data['name'], $data['description'], $data['fee'], $data['template_text'])) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid input"]);
    exit;
}

$oldId = intval($data['id']);
$name = $data['name'];
$description = $data['description'];
$fee = floatval($data['fee']);
$templateText = $data['template_text'];
$fields = $data['fields'];

mysqli_begin_transaction($conn);

try {
    // Archive the old template
    $archiveQuery = "UPDATE tbl_document_templates SET is_archived = 1 WHERE id = ?";
    $stmt = mysqli_prepare($conn, $archiveQuery);
    mysqli_stmt_bind_param($stmt, "i", $oldId);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);

    //Insert the new template
    $insertQuery = "INSERT INTO tbl_document_templates (name, description, fee, template_text, is_archived) VALUES (?, ?, ?, ?, 0)";
    $stmt = mysqli_prepare($conn, $insertQuery);
    mysqli_stmt_bind_param($stmt, "ssds", $name, $description, $fee, $templateText);
    mysqli_stmt_execute($stmt);
    $newTemplateId = mysqli_insert_id($conn);
    mysqli_stmt_close($stmt);

    //Insert new field definitions
    $stmtField = mysqli_prepare($conn, "INSERT INTO tbl_document_template_custom_fields (template_id, field_key, label, is_required) VALUES (?, ?, ?, ?)");
    foreach ($fields as $field) {
        $fieldKey = $field['field_key'];
        $label = $field['label'];
        $isRequired = $field['is_required'] ? 1 : 0;

        mysqli_stmt_bind_param($stmtField, "issi", $newTemplateId, $fieldKey, $label, $isRequired);
        mysqli_stmt_execute($stmtField);
    }
    mysqli_stmt_close($stmtField);

    mysqli_commit($conn);
    echo json_encode(["success" => true, "new_template_id" => $newTemplateId]);

} catch (Exception $e) {
    mysqli_rollback($conn);
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
