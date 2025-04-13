<?php
require 'connect.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['id'], $_POST['type'])) {
    $id = $_POST['id'];
    $type = $_POST['type'];

    // Map the type to table and ID column
    $tableMap = [
        'Upcoming Event' => ['table' => 'tbl_upcoming_event_announcement', 'id_col' => 'upEvent_announcement_id'],
        'News and Update' => ['table' => 'tbl_news_update_announcement', 'id_col' => 'news_update_announcement_id'],
        'Barangay Volunteer Drive' => ['table' => 'tbl_volunteer_drive_announcement', 'id_col' => 'volunteer_announcement_id']
    ];

    if (!array_key_exists($type, $tableMap)) {
        http_response_code(400);
        echo "Invalid announcement type.";
        exit;
    }

    $table = $tableMap[$type]['table'];
    $idColumn = $tableMap[$type]['id_col'];

    // Set status to inactive and save today's date to date_archive
    $query = "UPDATE $table SET status = 'inactive', date_archive = NOW() WHERE $idColumn = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo "success";
    } else {
        http_response_code(500);
        echo "Failed to archive.";
    }

    $stmt->close();
    $conn->close();
} else {
    http_response_code(400);
    echo "Invalid request.";
}
?>
