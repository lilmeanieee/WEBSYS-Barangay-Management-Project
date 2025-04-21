<?php
include 'connect.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL); 

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id'], $data['name'], $data['description'], $data['fee'], $data['template_text'])) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid input"]);
    exit;
}

$oldId = intval($data['id']);
$name = trim(strtolower($data['name']));
$description = $data['description'];
$fee = floatval($data['fee']);
$templateText = $data['template_text'];
$fields = $data['fields'];

mysqli_begin_transaction($conn);

try {
    // Archive the old template
    $archiveQuery = "UPDATE tbl_document_templates 
                 SET is_archived = 1 
                 WHERE LOWER(name) = LOWER(?) AND id != ?";
    $stmt = $conn->prepare($archiveQuery);
    $stmt->bind_param("si", $data['name'], $oldId); // original name for LOWER(?) to work
    $stmt->execute();

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
