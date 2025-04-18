<?php
include 'connect.php';
header('Content-Type: application/json');

$input = file_get_contents("php://input");
file_put_contents('debug_update_template.log', "RAW INPUT: $input\n", FILE_APPEND); // log input

$data = json_decode($input, true);
if (!$data || !isset($data['id'])) {
    file_put_contents('debug_update_template.log', "ERROR: Invalid or missing data\n", FILE_APPEND);
    echo json_encode(["error" => "Invalid or missing data"]);
    exit;
}

$id = $data['id'];
$name = $data['name'];
$description = $data['description'];
$fee = $data['fee'];
$templateText = $data['template_text'];
$fields = $data['fields'];

mysqli_begin_transaction($conn);

try {
    // Update template
    $stmt = mysqli_prepare($conn, "UPDATE tbl_document_templates SET name = ?, description = ?, fee = ?, template_text = ? WHERE id = ?");
    if (!$stmt) throw new Exception("Prepare failed: " . mysqli_error($conn));
    mysqli_stmt_bind_param($stmt, "ssdsi", $name, $description, $fee, $templateText, $id);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);

    // Delete old fields
    $stmtDel = mysqli_prepare($conn, "DELETE FROM tbl_template_fields WHERE template_id = ?");
    if (!$stmtDel) throw new Exception("Delete prepare failed: " . mysqli_error($conn));
    mysqli_stmt_bind_param($stmtDel, "i", $id);
    mysqli_stmt_execute($stmtDel);
    mysqli_stmt_close($stmtDel);

    // Insert new fields
    $stmtField = mysqli_prepare($conn, "INSERT INTO tbl_template_fields (template_id, field_key, label, is_required) VALUES (?, ?, ?, ?)");
    if (!$stmtField) throw new Exception("Field insert prepare failed: " . mysqli_error($conn));

    foreach ($fields as $field) {
        $fieldKey = $field['field_key'];
        $label = $field['label'];
        $isRequired = $field['is_required'] ? 1 : 0;
        mysqli_stmt_bind_param($stmtField, "issi", $id, $fieldKey, $label, $isRequired);
        mysqli_stmt_execute($stmtField);
    }
    mysqli_stmt_close($stmtField);

    mysqli_commit($conn);
    echo json_encode(["success" => true]);

} catch (Exception $e) {
    mysqli_rollback($conn);
    file_put_contents('debug_update_template.log', "ERROR: " . $e->getMessage() . "\n", FILE_APPEND);
    echo json_encode(["error" => "Update failed: " . $e->getMessage()]);
}
