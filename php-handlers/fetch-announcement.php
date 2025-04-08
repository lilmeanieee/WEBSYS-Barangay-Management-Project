<?php
require_once 'connect.php';

$sql = "SELECT id, title, created_at, status FROM announcements ORDER BY created_at DESC";
$result = $conn->query($sql);

$announcements = array();
while ($row = $result->fetch_assoc()) {
    $announcements[] = $row;
}

echo json_encode($announcements);
$conn->close();
?>